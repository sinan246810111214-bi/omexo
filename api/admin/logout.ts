import type { IncomingMessage, ServerResponse } from 'http';

const ADMIN_SESSION_COOKIE = 'omexo_admin_session';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const protoHeader = req.headers['x-forwarded-proto'];
  const isHttps = protoHeader === 'https' || Boolean(process.env.VERCEL);
  const cookieParts = [
    `${ADMIN_SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'Max-Age=0',
    isHttps ? 'SameSite=None' : 'SameSite=Lax',
  ];
  if (isHttps) {
    cookieParts.push('Secure');
  }
  res.setHeader('Set-Cookie', cookieParts.join('; '));
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ success: true }));
}
