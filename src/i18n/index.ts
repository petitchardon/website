import fr from './locales/fr.json';
import en from './locales/en.json';

export type Lang = 'fr' | 'en';

export const dictionaries = { fr, en } as const;

export type Dict = typeof fr;

export function getDict(lang: Lang): Dict {
  return dictionaries[lang];
}

/**
 * Vite-injected base URL. `/` in production, `/preview/pr-N/` for PR
 * preview deploys. Always ends with a trailing slash. All site-internal
 * URLs flow through here so a single env var (PREVIEW_PR_NUMBER, read in
 * astro.config.mjs) reroutes the entire site under a subdirectory.
 */
const BASE = import.meta.env.BASE_URL;

/** Join BASE with a path that may or may not start with `/`. */
function withBase(path: string): string {
  return `${BASE}${path.replace(/^\//, '')}`;
}

/**
 * Get the home URL for a given locale.
 * FR is at `/`, EN is at `/en` — the latter served from `dist/en.html`
 * thanks to GitHub Pages' extension-aware lookup. A post-build step also
 * mirrors the file as `dist/en/index.html` so `/en/` resolves too.
 */
export function homeUrl(lang: Lang): string {
  return lang === 'en' ? withBase('en/') : BASE;
}

/**
 * Build a project URL for a given locale and slug.
 * Locale-prefixed for EN; flat for FR.
 *
 * With `build.format: 'file'`, Astro emits these as flat `.html` files
 * matching the PR1 URL shape (e.g. `/projects/aurore-boreale.html`).
 */
export function projectUrl(lang: Lang, slug: string): string {
  return lang === 'en'
    ? withBase(`en/projects/${slug}.html`)
    : withBase(`projects/${slug}.html`);
}

/**
 * URL pointing to the same page in the other locale, for the language toggle.
 * Operates on base-stripped paths so callers can pass either base-relative
 * or absolute pathnames.
 */
export function alternateUrl(lang: Lang, pathname: string): string {
  // Strip the base prefix if present, then normalize.
  let path = pathname;
  if (BASE !== '/' && path.startsWith(BASE)) {
    path = '/' + path.slice(BASE.length);
  }
  if (!path.startsWith('/')) path = `/${path}`;

  if (lang === 'en') {
    // Currently on EN, switch to FR: drop the `/en` prefix.
    if (path === '/en' || path === '/en/') return BASE;
    if (path.startsWith('/en/')) return withBase(path.slice(4));
    return BASE;
  }
  // Currently on FR, switch to EN: prepend `/en`.
  if (path === '/') return withBase('en/');
  return withBase(`en${path}`);
}

/** Prefix a public/ asset path with the deploy base. */
export function asset(path: string): string {
  return withBase(path);
}
