import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';

const ADMIN_HASH_SALT = 'omexo_admin_v1_salt_9f3c';
const DEFAULT_ADMIN_USER_HASH =
  '8939b243e07793fb680b3586af70adbb698a6f97135c00f35326bdf415afa4f0f7a99d4b2bab2a2ab2813181884711ef90de99eb413b2341316f0ca5bc176e95';
const DEFAULT_ADMIN_PASS_HASH =
  '62eb273d8456e3d67413dcc4b47213fe4a94e507d0c7a792457e8e312c781f27cde7fc1c9eefb234c5a754a9eee0f23f44534ff49637b77b8109d4bb4ceacaa8';
const ADMIN_SESSION_COOKIE = 'omexo_admin_session';
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function getSessionSecret(): Buffer {
  const configured = process.env.ADMIN_SESSION_SECRET?.trim();
  const seed =
    configured && configured !== 'MY_ADMIN_SESSION_SECRET'
      ? configured
      : `${DEFAULT_ADMIN_PASS_HASH}:${process.env.GEMINI_API_KEY || process.env.VERCEL_PROJECT_ID || 'omexo_runtime_key'}`;
  return crypto.createHash('sha256').update(seed).digest();
}

function timingSafeHexMatch(actualBuf: Buffer, expectedHex: string): boolean {
  try {
    const expectedBuf = Buffer.from(expectedHex, 'hex');
    if (actualBuf.length !== expectedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(actualBuf, expectedBuf);
  } catch {
    return false;
  }
}

function verifySecretInput(
  rawInput: string,
  envOverride: string | undefined,
  fallbackHashHex: string,
  allowCaseInsensitiveEnv = false
): boolean {
  const candidate = rawInput.slice(0, 128);
  const candidateHash = crypto.scryptSync(candidate, ADMIN_HASH_SALT, 64);
  const candidateLowerHash = crypto.scryptSync(candidate.toLowerCase(), ADMIN_HASH_SALT, 64);

  let envMatched = false;
  const cleanOverride = envOverride?.trim();
  if (cleanOverride && !cleanOverride.startsWith('MY_ADMIN_')) {
    const overrideHash = crypto.scryptSync(cleanOverride, ADMIN_HASH_SALT, 64);
    if (candidateHash.length === overrideHash.length && crypto.timingSafeEqual(candidateHash, overrideHash)) {
      envMatched = true;
    } else if (allowCaseInsensitiveEnv) {
      const overrideLowerHash = crypto.scryptSync(cleanOverride.toLowerCase(), ADMIN_HASH_SALT, 64);
      if (
        candidateLowerHash.length === overrideLowerHash.length &&
        crypto.timingSafeEqual(candidateLowerHash, overrideLowerHash)
      ) {
        envMatched = true;
      }
    }
  }

  const fallbackMatched =
    timingSafeHexMatch(candidateHash, fallbackHashHex) ||
    (allowCaseInsensitiveEnv && timingSafeHexMatch(candidateLowerHash, fallbackHashHex));

  return envMatched || fallbackMatched;
}

function verifyAdminCredentials(username: string, password: string): boolean {
  const cleanUser = username.trim();
  const cleanPass = password.trim();
  if (!cleanUser || !cleanPass) {
    crypto.scryptSync('dummy', ADMIN_HASH_SALT, 64);
    return false;
  }
  const userOk = verifySecretInput(cleanUser, process.env.ADMIN_USERNAME, DEFAULT_ADMIN_USER_HASH, true);
  const passOk = verifySecretInput(cleanPass, process.env.ADMIN_PASSWORD, DEFAULT_ADMIN_PASS_HASH, false);
  return userOk && passOk;
}

function issueSignedAdminToken(): { token: string; expiresAt: number } {
  const now = Date.now();
  const expiresAt = now + ADMIN_SESSION_TTL_MS;
  const payload = {
    sub: 'omexo-credential-admin',
    role: 'Super Admin',
    iat: now,
    exp: expiresAt,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sigB64 = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadB64)
    .digest('base64url');
  return { token: `${payloadB64}.${sigB64}`, expiresAt };
}

async function readJsonBody(req: IncomingMessage & { body?: unknown }): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object') {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    return JSON.parse(req.body) as Record<string, unknown>;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }

  try {
    const body = await readJsonBody(req);
    const { username, password } = body;

    if (typeof username !== 'string' || typeof password !== 'string') {
      return sendJson(res, 400, { error: 'Username and password are required.' });
    }

    const isValid = verifyAdminCredentials(username, password);
    if (!isValid) {
      return sendJson(res, 401, { error: 'Invalid admin username or password.' });
    }

    const { token, expiresAt } = issueSignedAdminToken();
    const protoHeader = req.headers['x-forwarded-proto'];
    const isHttps = protoHeader === 'https' || Boolean(process.env.VERCEL);
    const cookieParts = [
      `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`,
      'Path=/',
      'HttpOnly',
      `Max-Age=${Math.floor(ADMIN_SESSION_TTL_MS / 1000)}`,
      isHttps ? 'SameSite=None' : 'SameSite=Lax',
    ];
    if (isHttps) {
      cookieParts.push('Secure');
    }
    res.setHeader('Set-Cookie', cookieParts.join('; '));

    return sendJson(res, 200, {
      authenticated: true,
      role: 'Super Admin',
      authMethod: 'credentials',
      label: 'Omexo Super Admin',
      token,
      expiresAt,
    });
  } catch {
    return sendJson(res, 500, { error: 'Authentication verification failed.' });
  }
}
