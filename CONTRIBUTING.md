# Contributing

Development guide for **petitchardon/website**.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Astro 4.x (static output) |
| Routing / i18n | File-based: `/` → FR, `/en/` → EN |
| Content | Astro content collections (Zod-validated Markdown) |
| Styles | Vanilla CSS, BEM, custom properties |
| Scripts | Vanilla JS — no framework, no bundler dependencies |
| Hosting | GitHub Pages (`gh-pages` branch) |
| Forms | FormSubmit (no backend required) |

## Local setup

```bash
npm ci
npm run dev       # http://localhost:4321
npm run build     # production build
npm run check     # type-check (Astro + TypeScript + Zod)
```

The build runs a `mirrorEnIndex` post-hook that copies `dist/en.html` → `dist/en/index.html` so GitHub Pages serves the EN home at `/en/`.

---

## Branch structure

```
main  (Astro 4.x — production: routing, components, SEO, content collections)
└── claude/pr3-case-studies  Rich case studies via content collections
    └── claude/pr4-view-transitions  Shared-element page transitions
        └── claude/pr5-animations   Scroll & interaction animations
            └── claude/pr6-social-proof  Testimonials & conversion
```

Each branch is rebased onto its direct parent, not onto `main`.

---

## Conventions

### Commits

Messages use the imperative mood, explain *why* over *what*, and stay under 72 characters on the first line:

```
Add transition:name to portfolio cards for View Transitions morph

Allows the browser to animate the cover image and title from the
card to the project hero on navigation, without JavaScript.
```

### Images & assets

- Photos → WebP, max 150 KB, always include `width` + `height` attributes
- Illustrations / icons → SVG, minified (SVGO or equivalent)
- Never commit unoptimised originals to `main`
- Use `loading="lazy"` on everything below the fold; `loading="eager"` only on the largest contentful element

### i18n

- `src/i18n/locales/fr.json` and `src/i18n/locales/en.json` contain plain text only — no HTML markup
- Both locale files must be updated together; leaving one stale is a bug
- **Copy and prose belong to the project owner.** Never modify existing strings without an explicit request.

### Pull request checklist

- [ ] `npm run build` passes with zero warnings
- [ ] `npm run check` passes (no TypeScript errors)
- [ ] New interactive elements work with keyboard-only navigation
- [ ] `hreflang` alternates point to production URLs (not preview paths)
- [ ] No prose was modified without an explicit request

---

## For AI agents

See [AGENTS.md](./AGENTS.md) for tool-specific rules, prohibited actions, and known gotchas.
