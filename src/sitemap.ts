import { Product } from './types';
import { getSitePathPrefix, resolveCategorySlug } from './config/categories';
import { INITIAL_PRODUCTS } from './data/initialProducts';

export const STATIC_SITE_ROUTES: Array<{
  path: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: number;
}> = [
  { path: '/', changefreq: 'daily', priority: 1.0 },
  { path: '/decor', changefreq: 'daily', priority: 1.0 },
  { path: '/essentials', changefreq: 'daily', priority: 1.0 },
  { path: '/aesthetic', changefreq: 'daily', priority: 1.0 },
  { path: '/track-order', changefreq: 'weekly', priority: 0.7 },
  { path: '/decor/track-order', changefreq: 'weekly', priority: 0.7 },
  { path: '/essentials/track-order', changefreq: 'weekly', priority: 0.7 },
  { path: '/aesthetic/track-order', changefreq: 'weekly', priority: 0.7 },
  { path: '/contact-us', changefreq: 'monthly', priority: 0.6 },
  { path: '/decor/contact-us', changefreq: 'monthly', priority: 0.6 },
  { path: '/essentials/contact-us', changefreq: 'monthly', priority: 0.6 },
  { path: '/aesthetic/contact-us', changefreq: 'monthly', priority: 0.6 },
  { path: '/shipping-policy', changefreq: 'monthly', priority: 0.5 },
  { path: '/refund-policy', changefreq: 'monthly', priority: 0.5 },
  { path: '/privacy-policy', changefreq: 'monthly', priority: 0.4 },
  { path: '/terms', changefreq: 'monthly', priority: 0.4 },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateSitemapEntries(products: Product[], baseUrl = 'https://omexo.in') {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const seen = new Set<string>();
  const entries: Array<{
    url: string;
    changefreq: 'daily' | 'weekly' | 'monthly';
    priority: number;
  }> = [];

  for (const item of STATIC_SITE_ROUTES) {
    const fullUrl = `${normalizedBase}${item.path}`;
    if (!seen.has(fullUrl)) {
      seen.add(fullUrl);
      entries.push({
        url: fullUrl,
        changefreq: item.changefreq,
        priority: item.priority,
      });
    }
  }

  for (const product of products) {
    if (!product?.id || product.id === 'omexo-special-combo') continue;
    const slug = resolveCategorySlug(product.categorySlug || product.category);
    const prefix = slug && slug !== 'All' ? getSitePathPrefix(slug) : '';
    const fullUrl = `${normalizedBase}${prefix}/product/${encodeURIComponent(product.id)}`;
    if (!seen.has(fullUrl)) {
      seen.add(fullUrl);
      entries.push({
        url: fullUrl,
        changefreq: 'daily',
        priority: 0.8,
      });
    }
  }

  return entries;
}

export function generateSitemapXml(baseUrl = 'https://omexo.in', products: Product[] = INITIAL_PRODUCTS): string {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const entries = generateSitemapEntries(products, normalizedBase);
  const lastmod = new Date().toISOString().split('T')[0];

  const urlNodes = entries
    .map(
      (entry) =>
        `  <url>\n` +
        `    <loc>${escapeXml(entry.url)}</loc>\n` +
        `    <lastmod>${lastmod}</lastmod>\n` +
        `    <changefreq>${entry.changefreq}</changefreq>\n` +
        `    <priority>${entry.priority.toFixed(1)}</priority>\n` +
        `  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlNodes}\n</urlset>\n`;
}

export function generateRobotsTxt(baseUrl = 'https://omexo.in'): string {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  return [
    '# https://www.robotstxt.org/robotstxt.html',
    'User-agent: *',
    'Allow: /',
    'Allow: /decor',
    'Allow: /essentials',
    'Allow: /aesthetic',
    'Allow: /product/',
    'Allow: /decor/product/',
    'Allow: /essentials/product/',
    'Allow: /aesthetic/product/',
    'Allow: /track-order',
    'Allow: /contact-us',
    '',
    '# Exclude admin panels, checkout flows, and internal APIs',
    'Disallow: /admin',
    'Disallow: /admin/',
    'Disallow: /lifestyle/admin',
    'Disallow: /decor/admin',
    'Disallow: /essentials/admin',
    'Disallow: /aesthetic/admin',
    'Disallow: /checkout',
    'Disallow: /decor/checkout',
    'Disallow: /essentials/checkout',
    'Disallow: /aesthetic/checkout',
    'Disallow: /api/',
    '',
    `Sitemap: ${normalizedBase}/sitemap.xml`,
    '',
  ].join('\n');
}
