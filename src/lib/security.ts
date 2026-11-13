export const AUTHORIZED_ADMIN_EMAILS = [
  'omexoofficial@gmail.com',
] as const;

export type AdminRole = 'Super Admin' | 'Admin' | 'Staff';

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return (AUTHORIZED_ADMIN_EMAILS as readonly string[]).includes(email.trim().toLowerCase());
}

export function getAdminRoleForEmail(email?: string | null): AdminRole {
  const clean = (email || '').trim().toLowerCase();
  if (clean === 'omexoofficial@gmail.com') {
    return 'Super Admin';
  }
  return 'Staff';
}

/**
 * Escapes untrusted strings before interpolating into standalone HTML documents (XSS protection).
 */
export function escapeHtml(input: unknown): string {
  const str = String(input ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validates and sanitizes image/map URLs to prevent javascript:/vbscript:/data:text/html injection.
 */
export function sanitizeSafeUrl(
  rawUrl?: string | null,
  options: { allowDataImage?: boolean; fallback?: string } = {}
): string {
  const { allowDataImage = false, fallback = '' } = options;
  const val = (rawUrl || '').trim();
  if (!val) return fallback;

  if (val.startsWith('/') && !val.startsWith('//')) {
    return val;
  }

  if (allowDataImage && /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(val)) {
    return val;
  }

  try {
    const parsed = new URL(val);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    return fallback;
  }

  return fallback;
}
