const appOrigins = new Set([
  'https://app-lchslh9t6cds.cxiagents.com',
  'https://app-8mamzv6m988t.cxiagents.com',
  'https://app-c9z4iiiaftls.cxiagents.com',
]);

export function resolveEmbedURL(value, base = 'https://portfolio.invalid/') {
  if (typeof value !== 'string' || value.includes('\\')) return null;
  try {
    const url = new URL(value, base);
    if (value.startsWith('/') && !value.startsWith('//') && url.origin === new URL(base).origin) return url;
    if (url.protocol === 'https:' && !url.username && !url.password && appOrigins.has(url.origin)) return url;
  } catch {}
  return null;
}
