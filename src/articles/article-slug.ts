import { randomBytes } from 'node:crypto';

// Leaves room for the random suffix within the 255-character slug column.
const MAX_BASE_SLUG_LENGTH = 200;
const FALLBACK_SLUG = 'article';

// Converts a title into a URL-safe slug, e.g. "Học NestJS!" -> "hoc-nestjs".
export function slugify(title: string): string {
  const slug = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_BASE_SLUG_LENGTH)
    .replace(/-+$/, '');

  return slug || FALLBACK_SLUG;
}

export function withRandomSuffix(baseSlug: string): string {
  return `${baseSlug}-${randomBytes(4).toString('hex')}`;
}
