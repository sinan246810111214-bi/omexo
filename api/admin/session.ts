import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';

const DEFAULT_ADMIN_PASS_HASH =
  '62eb273d8456e3d67413dcc4b47213fe4a94e507d0c7a792457e8e312c781f27cde7fc1c9eefb234c5a754a9eee0f23f44534ff49637b77b8109d4bb4ceacaa8';
const ADMIN_SESSION_COOKIE = 'omexo_admin_session';

interface AdminTokenPayload {
  sub: 'omexo-credential-admin';
  role: 'Super Admin';
  iat: number;
  exp: number;
}

function getSessionSecret(): Buffer {
  const configured = process.env.ADMIN_SESSION_SECRET?.trim();
  const seed =
    configured && configured !== 'MY_ADMIN_SESSION_SECRET'
      ? configured
      : `${DEFAULT_ADMIN_PASS_HASH}:${process.env.GEMINI_API_KEY || process.env.VERCEL_PROJECT_ID || 'omexo_runtime_key'}`;
  return crypto.createHash('sha256').update(seed).digest();
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) {
      try {
        cookies[key] = decodeURIComponent(val);
      } catch {
        cookies[key] = val;
      }
    }
  }
  return cookies;
}

function extractAdminRequestToken(req: IncomingMessage): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice('Bearer '.length).trim();
    if (bearer) return bearer;
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies[ADMIN_SESSION_COOKIE] || null;
}

function verifySignedAdminToken(token: string | undefined | null): AdminTokenPayload | null {
  if (!token || typeof token !== 'string' || token.length > 1024) {
    return null;
  }
  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }
  const [payloadB64, providedSig] = parts;
  if (!payloadB64 || !providedSig) {
    return null;
  }

  try {
    const expectedSig = crypto
      .createHmac('sha256', getSessionSecret())
      .update(payloadB64)
      .digest('base64url');
    const a = Buffer.from(providedSig, 'utf8');
    const b = Buffer.from(expectedSig, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as AdminTokenPayload;
    if (
      decoded.sub !== 'omexo-credential-admin' ||
      decoded.role !== 'Super Admin' ||
      typeof decoded.exp !== 'number' ||
      Date.now() > decoded.exp
    ) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const token = extractAdminRequestToken(req);
  const payload = verifySignedAdminToken(token);
  if (!payload) {
    return sendJson(res, 200, { authenticated: false });
  }
  return sendJson(res, 200, {
    authenticated: true,
    role: payload.role,
    authMethod: 'credentials',
    label: 'Omexo Super Admin',
    expiresAt: payload.exp,
  });
}
