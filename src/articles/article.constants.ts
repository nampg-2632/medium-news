export const MAX_TITLE_LENGTH = 255;

export const MAX_TAGS_PER_ARTICLE = 20;

export const MAX_TAG_LENGTH = 50;

// Leaves room for the random suffix within the 255-character slug column.
export const MAX_BASE_SLUG_LENGTH = 200;

export const FALLBACK_SLUG = 'article';

// Retries after a concurrent request claims the same slug first.
export const MAX_SLUG_ATTEMPTS = 3;

export const DEFAULT_ARTICLES_LIMIT = 20;

export const MAX_ARTICLES_LIMIT = 100;

export const DEFAULT_ARTICLES_OFFSET = 0;
