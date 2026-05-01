import fr from './fr.json';
import en from './en.json';

export type Lang = 'fr' | 'en';

export const dictionaries = { fr, en } as const;

export type Dict = typeof fr;

export function getDict(lang: Lang): Dict {
  return dictionaries[lang];
}

/**
 * Get the home URL for a given locale.
 * FR is at `/`, EN is at `/en` — the latter served from `dist/en.html`
 * thanks to GitHub Pages' extension-aware lookup. A post-build step also
 * mirrors the file as `dist/en/index.html` so `/en/` resolves too.
 */
export function homeUrl(lang: Lang): string {
  return lang === 'en' ? '/en/' : '/';
}

/**
 * Build a project URL for a given locale and slug.
 * Locale-prefixed for EN; flat for FR.
 *
 * With `build.format: 'file'`, Astro emits these as flat `.html` files
 * matching the PR1 URL shape (e.g. `/projects/aurore-boreale.html`).
 */
export function projectUrl(lang: Lang, slug: string): string {
  return lang === 'en' ? `/en/projects/${slug}.html` : `/projects/${slug}.html`;
}

/**
 * URL pointing to the same page in the other locale, for the language toggle.
 */
export function alternateUrl(lang: Lang, pathname: string): string {
  // Normalize to start with `/`.
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (lang === 'en') {
    // Currently on EN, switch to FR: drop the `/en` prefix.
    if (path === '/en' || path === '/en/') return '/';
    if (path.startsWith('/en/')) return path.slice(3);
    return '/';
  }
  // Currently on FR, switch to EN: prepend `/en`.
  if (path === '/') return '/en/';
  return `/en${path}`;
}
