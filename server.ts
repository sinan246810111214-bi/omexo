import express from 'express';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { generateRobotsTxt, generateSitemapXml } from './src/sitemap';
import firebaseConfig from './firebase-applet-config.json';
import { AUTHORIZED_ADMIN_EMAILS } from './src/lib/security';

dotenv.config();

const app = express();
const PORT = 3000;

app.disable('x-powered-by');

// Global HTTP Security Headers (iframe-compatible for AI Studio preview)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Simple per-IP sliding-window rate limiter for API routes
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function createRateLimiter(maxRequests: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0])?.trim() ||
      req.ip ||
      'unknown';

    const key = `${req.path}:${clientIp}`;
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Please slow down and try again shortly.' });
    }

    record.count += 1;
    return next();
  };
}

// Lazy initialization of Gemini Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Configure Cloudinary strictly from environment variables (never hardcode secrets in code)
const hasCloudinaryEnv = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryEnv) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Secret Server-Side Admin Credential Verification (zero plaintext credentials stored in code)
const ADMIN_HASH_SALT = 'omexo_admin_v1_salt_9f3c';
const DEFAULT_ADMIN_USER_HASH =
  '8939b243e07793fb680b3586af70adbb698a6f97135c00f35326bdf415afa4f0f7a99d4b2bab2a2ab2813181884711ef90de99eb413b2341316f0ca5bc176e95';
const DEFAULT_ADMIN_PASS_HASH =
  '62eb273d8456e3d67413dcc4b47213fe4a94e507d0c7a792457e8e312c781f27cde7fc1c9eefb234c5a754a9eee0f23f44534ff49637b77b8109d4bb4ceacaa8';
const ADMIN_SESSION_COOKIE = 'omexo_admin_session';
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

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
      : `${DEFAULT_ADMIN_PASS_HASH}:${process.env.GEMINI_API_KEY || firebaseConfig.apiKey || 'omexo_runtime_key'}`;
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

function verifySecretInput(rawInput: string, envOverride: string | undefined, fallbackHashHex: string): boolean {
  const candidate = rawInput.slice(0, 128);
  const candidateHash = crypto.scryptSync(candidate, ADMIN_HASH_SALT, 64);

  const cleanOverride = envOverride?.trim();
  if (cleanOverride && !cleanOverride.startsWith('MY_ADMIN_')) {
    const overrideHash = crypto.scryptSync(cleanOverride, ADMIN_HASH_SALT, 64);
    if (candidateHash.length !== overrideHash.length) {
      return false;
    }
    return crypto.timingSafeEqual(candidateHash, overrideHash);
  }

  return timingSafeHexMatch(candidateHash, fallbackHashHex);
}

function verifyAdminCredentials(username: string, password: string): boolean {
  const cleanUser = username.trim();
  const cleanPass = password.trim();
  if (!cleanUser || !cleanPass) {
    // Still perform dummy scrypt work to keep response timing uniform
    crypto.scryptSync('dummy', ADMIN_HASH_SALT, 64);
    return false;
  }
  const userOk = verifySecretInput(cleanUser, process.env.ADMIN_USERNAME, DEFAULT_ADMIN_USER_HASH);
  const passOk = verifySecretInput(cleanPass, process.env.ADMIN_PASSWORD, DEFAULT_ADMIN_PASS_HASH);
  return userOk && passOk;
}

function issueSignedAdminToken(): { token: string; expiresAt: number } {
  const now = Date.now();
  const expiresAt = now + ADMIN_SESSION_TTL_MS;
  const payload: AdminTokenPayload = {
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

function extractAdminRequestToken(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice('Bearer '.length).trim();
    if (bearer) return bearer;
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies[ADMIN_SESSION_COOKIE] || null;
}

// Verify either Server Credential Admin Token OR Firebase ID token (strictly omexoofficial@gmail.com)
async function verifyAdminBearerToken(
  req: express.Request
): Promise<{ email: string; uid: string; authMethod: 'google' | 'credentials' } | null> {
  const token = extractAdminRequestToken(req);
  if (!token || token.length > 4096) {
    return null;
  }

  const credSession = verifySignedAdminToken(token);
  if (credSession) {
    return { email: 'omexoofficial@gmail.com', uid: credSession.sub, authMethod: 'credentials' };
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken || idToken.length > 4096) {
    return null;
  }

  try {
    const resp = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseConfig.apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!resp.ok) {
      return null;
    }

    const data = (await resp.json()) as {
      users?: Array<{ email?: string; emailVerified?: boolean; localId?: string }>;
    };
    const user = data.users?.[0];
    if (!user || !user.email || !user.emailVerified || !user.localId) {
      return null;
    }

    const cleanEmail = user.email.trim().toLowerCase();
    if (!(AUTHORIZED_ADMIN_EMAILS as readonly string[]).includes(cleanEmail)) {
      return null;
    }

    return { email: cleanEmail, uid: user.localId, authMethod: 'google' };
  } catch {
    return null;
  }
}

app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ limit: '16mb', extended: true }));

// Secret Server-Side Admin Login / Session / Logout Endpoints
app.post('/api/admin/login', createRateLimiter(10, 15 * 60_000), (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const isValid = verifyAdminCredentials(username, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid admin username or password.' });
    }

    const { token, expiresAt } = issueSignedAdminToken();
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
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

    return res.json({
      authenticated: true,
      role: 'Super Admin',
      authMethod: 'credentials',
      label: 'Omexo Super Admin',
      token,
      expiresAt,
    });
  } catch {
    return res.status(500).json({ error: 'Authentication verification failed.' });
  }
});

app.get('/api/admin/session', createRateLimiter(60, 60_000), (req, res) => {
  const token = extractAdminRequestToken(req);
  const payload = verifySignedAdminToken(token);
  if (!payload) {
    return res.json({ authenticated: false });
  }
  return res.json({
    authenticated: true,
    role: payload.role,
    authMethod: 'credentials',
    label: 'Omexo Super Admin',
    expiresAt: payload.exp,
  });
});

app.post('/api/admin/logout', (req, res) => {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
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
  return res.json({ success: true });
});

// Authenticated Admin-Only API Route for uploading raster images
app.post('/api/upload', createRateLimiter(20, 60_000), async (req, res) => {
  try {
    const verifiedAdmin = await verifyAdminBearerToken(req);
    if (!verifiedAdmin) {
      return res.status(401).json({ error: 'Unauthorized: Verified Admin authentication required.' });
    }

    const { image } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'No image data payload received' });
    }

    // Strict raster-only data URI check (blocks SVG/HTML XSS payloads)
    const isSafeRasterImage = /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(image.trim());
    if (!isSafeRasterImage) {
      return res.status(400).json({ error: 'Invalid image format. Only PNG, JPG, WEBP, and GIF are permitted.' });
    }

    if (image.length > 14 * 1024 * 1024) {
      return res.status(413).json({ error: 'Image payload exceeds safe upload limit.' });
    }

    if (hasCloudinaryEnv) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: 'ecommerce/products',
        resource_type: 'image',
        allowed_formats: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
      });

      let optimizedUrl = uploadResponse.secure_url;
      if (optimizedUrl.includes('/upload/')) {
        optimizedUrl = optimizedUrl.replace('/upload/', '/upload/f_auto,q_auto/');
      }

      return res.json({
        success: true,
        url: optimizedUrl,
        publicId: uploadResponse.public_id,
        bytes: uploadResponse.bytes,
        format: uploadResponse.format,
      });
    }

    return res.json({
      success: true,
      url: image,
      fallback: true,
      warning: 'Stored via verified raster fallback. Configure CLOUDINARY_* env vars for cloud CDN.',
    });
  } catch (error: any) {
    console.warn('Image upload failed:', error?.message || error);
    return res.status(500).json({
      error: 'Failed to process secure image upload',
    });
  }
});

// Server-side Telegram Order Notification route (never exposes botToken to browser clients)
app.post('/api/notify/telegram', createRateLimiter(15, 60_000), async (req, res) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!botToken || !chatId || botToken === 'MY_TELEGRAM_BOT_TOKEN') {
      return res.json({ sent: false, skipped: true });
    }

    const { orderId, totalAmount, paymentType, paymentStatus, itemCount } = req.body || {};
    if (!orderId || typeof orderId !== 'string' || !/^OMX-[0-9]{6}$/.test(orderId)) {
      return res.status(400).json({ error: 'Invalid order reference' });
    }

    const message =
      `🛍️ *NEW OMEXO ORDER ALERT!*\n\n` +
      `*Order ID:* \`${orderId}\`\n` +
      `*Items Count:* ${Number(itemCount) || 1}\n` +
      `*Total Amount:* ₹${Number(totalAmount) || 0}\n` +
      `*Payment:* ${String(paymentType || 'COD')} (${String(paymentStatus || 'Pending')})`;

    await fetch(`https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    return res.json({ sent: true });
  } catch (error) {
    console.error('Telegram notification error:', error);
    return res.status(500).json({ sent: false });
  }
});

// Rate-limited Gemini AI Assistant chat endpoint
app.post('/api/ai/chat', createRateLimiter(30, 60_000), async (req, res) => {
  try {
    const { message, role, chatHistory, storeContext } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message payload content is required' });
    }

    const sanitizedMessage = message.trim().slice(0, 2000);

    // Only allow admin assistant role when verified admin Bearer token is supplied
    let effectiveRole: 'customer' | 'admin' = 'customer';
    if (role === 'admin') {
      const verifiedAdmin = await verifyAdminBearerToken(req);
      if (verifiedAdmin) {
        effectiveRole = 'admin';
      }
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY' || key.trim() === '') {
      return res.json({
        reply:
          'ഹലോ! Omexo AI അസിസ്റ്റന്റ് ഇപ്പോൾ ഡെമോ മോഡിലാണ്. നിങ്ങളുടെ AI Studio **Settings > Secrets** വിൻഡോയിൽ `GEMINI_API_KEY` കോൺഫിഗർ ചെയ്താൽ എനിക്ക് ലൈവായി മറുപടി നൽകാൻ സാധിക്കും. \n\n(Hello! The Omexo AI assistant is currently in demo mode. Please configure your `GEMINI_API_KEY` in the **Settings > Secrets** panel to enable live responses.)',
      });
    }

    const ai = getGeminiClient();

    const contents: any[] = [];
    if (Array.isArray(chatHistory)) {
      chatHistory.slice(-12).forEach((msg: any) => {
        if (msg && typeof msg.text === 'string') {
          contents.push({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text.slice(0, 2000) }],
          });
        }
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: sanitizedMessage }],
    });

    const systemInstruction =
      effectiveRole === 'admin'
        ? `You are the Omexo Merchant Advisor & Admin Co-pilot. Active Products: ${Number(storeContext?.productsCount) || 0}, Orders: ${Number(storeContext?.ordersCount) || 0}. Provide concise, actionable retail & inventory advice.`
        : `You are the official Omexo AI Shopping Assistant. You help customers with product recommendations, Cash on Delivery ordering, and shipping across Omexo Lifestyle, Omexo Decor, and Omexo Essentials. Keep every product strictly within its assigned category—never mix Omexo Lifestyle product details into Omexo Decor or Omexo Essentials. Current catalog context:\n${String(storeContext?.productsString || '').slice(0, 4000)}`;

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = geminiResponse.text || 'I apologize, but I am unable to generate a response at this moment.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Gemini chat failed:', error?.message || error);
    return res.status(500).json({
      error: 'AI Assistant service failed to generate a response.',
    });
  }
});

// Bidirectional India Post PIN <-> Post Office lookup proxy with 24h in-memory cache
interface PostalOfficeOption {
  name: string;
  pincode: string;
  district: string;
  state: string;
  branchType: string;
}

const postalCache = new Map<string, { offices: PostalOfficeOption[]; expiresAt: number }>();

function normalizePostalOffices(rawList: any[]): PostalOfficeOption[] {
  if (!Array.isArray(rawList)) return [];
  const seen = new Set<string>();
  const results: PostalOfficeOption[] = [];
  for (const item of rawList) {
    if (!item || typeof item.Name !== 'string' || typeof item.Pincode !== 'string') continue;
    const key = `${item.Name.trim().toLowerCase()}-${item.Pincode.trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({
      name: item.Name.trim(),
      pincode: item.Pincode.trim(),
      district: typeof item.District === 'string' ? item.District.trim() : '',
      state: typeof item.State === 'string' ? item.State.trim() : '',
      branchType: typeof item.BranchType === 'string' ? item.BranchType.trim() : '',
    });
  }
  // Prefer Sub Post Office first so main PO auto-fills cleanly
  results.sort((a, b) => {
    const aSub = a.branchType.toLowerCase().includes('sub') ? 0 : 1;
    const bSub = b.branchType.toLowerCase().includes('sub') ? 0 : 1;
    return aSub - bSub;
  });
  return results;
}

async function fetchPostalApi(cacheKey: string, url: string): Promise<PostalOfficeOption[]> {
  const cached = postalCache.get(cacheKey);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.offices;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) return [];
    const data = (await resp.json()) as Array<{ Status?: string; PostOffice?: any[] }>;
    const first = Array.isArray(data) ? data[0] : null;
    const offices =
      first && first.Status === 'Success' && Array.isArray(first.PostOffice)
        ? normalizePostalOffices(first.PostOffice)
        : [];
    if (offices.length > 0) {
      if (postalCache.size > 500) {
        const firstKey = postalCache.keys().next().value;
        if (firstKey) postalCache.delete(firstKey);
      }
      postalCache.set(cacheKey, { offices, expiresAt: now + 24 * 60 * 60 * 1000 });
    }
    return offices;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

app.get('/api/postal/pincode/:pin', createRateLimiter(60, 60_000), async (req, res) => {
  const pin = String(req.params.pin || '').trim();
  if (!/^\d{6}$/.test(pin)) {
    return res.status(400).json({ found: false, offices: [] });
  }
  const offices = await fetchPostalApi(
    `pin:${pin}`,
    `https://api.postalpincode.in/pincode/${encodeURIComponent(pin)}`
  );
  return res.json({ found: offices.length > 0, offices });
});

app.get('/api/postal/postoffice/:name', createRateLimiter(60, 60_000), async (req, res) => {
  const name = String(req.params.name || '').trim();
  if (name.length < 3 || name.length > 80) {
    return res.json({ found: false, offices: [] });
  }
  const offices = await fetchPostalApi(
    `po:${name.toLowerCase()}`,
    `https://api.postalpincode.in/postoffice/${encodeURIComponent(name)}`
  );
  return res.json({ found: offices.length > 0, offices: offices.slice(0, 12) });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

// Dynamic robots.txt and XML Sitemap helpers
function resolvePublicBaseUrl(req: express.Request): string {
  const forwardedProtoRaw = req.headers['x-forwarded-proto'];
  const protocol = (
    (Array.isArray(forwardedProtoRaw) ? forwardedProtoRaw[0] : forwardedProtoRaw?.split(',')[0]) ||
    req.protocol ||
    'https'
  ).trim();
  const host = req.get('host') || 'omexo.in';
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return `${protocol}://${host}`;
  }
  const envUrl = process.env.APP_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  return host.includes('omexo.in') ? `${protocol}://${host}` : 'https://omexo.in';
}

app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(generateRobotsTxt(resolvePublicBaseUrl(req)));
});

// Dynamic XML Sitemap
app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(generateSitemapXml(resolvePublicBaseUrl(req)));
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    if (!process.env.DISABLE_HMR) {
      process.env.DISABLE_HMR = 'true';
    }
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: false,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const httpServer = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Omexo Full-Stack Server] running live on port ${PORT}`);
  });

  httpServer.on('error', (err) => {
    console.error('[Omexo Full-Stack Server] failed to bind port:', err);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error('[Omexo Full-Stack Server] fatal startup error:', err);
  process.exit(1);
});
