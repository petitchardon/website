import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * Tiny inline integration that mirrors `dist/en.html` to
 * `dist/en/index.html` after the build. With `build.format: 'file'`,
 * Astro emits the EN homepage as `/en.html`. GitHub Pages will serve
 * that for `/en` (extension-aware lookup), but `/en/` (with trailing
 * slash) needs `/en/index.html` to exist. Copying solves both.
 */
function mirrorEnIndex() {
  return {
    name: 'mirror-en-index',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const distDir = fileURLToPath(dir);
        const src = path.join(distDir, 'en.html');
        const targetDir = path.join(distDir, 'en');
        const target = path.join(targetDir, 'index.html');
        await mkdir(targetDir, { recursive: true });
        await copyFile(src, target);
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://www.petitchardon.fr',
  output: 'static',
  compressHTML: true,
  build: {
    // 'file' so dynamic project pages emit as flat `.html` files,
    // matching the PR1 URLs (e.g. `/projects/aurore-boreale.html`).
    // Index pages emit as `index.html` (FR) and `en.html` (EN).
    format: 'file',
  },
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    // The sitemap's built-in `i18n` option assumes `/{locale}/...` paths,
    // which doesn't match our `format: 'file'` output. We emit a flat
    // sitemap and rely on the per-page `<link rel="alternate" hreflang>`
    // tags for locale signalling.
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
    mirrorEnIndex(),
  ],
});
