# petitchardon — website

Source code for [petitchardon.fr](https://www.petitchardon.fr) — the creative studio of Anne Della Gaspera, graphic designer, illustrator and copywriter based in Rambouillet, France.

Built with **Astro 4.x**, deployed to **GitHub Pages**, bilingual FR / EN.

---

## Design principles

These three commitments are woven into the code as deliberately as they are into the visual work.

### Accessible by default
Every interactive element has a keyboard path and an ARIA label. Colour contrast meets WCAG AA at minimum. Semantic HTML is the baseline, not an afterthought. New components are only complete when they pass keyboard navigation end-to-end.

### Lightweight & energy-conscious
Images are optimised before they are committed — WebP for photos, minified SVG for illustrations and icons, no file above 150 KB without a reason. Progressive loading (`loading="lazy"`, `decoding="async"`) is the default. The goal is a sub-second Time to Interactive on a mid-range device over 4G.

### Inclusive language
All copy — in both locales — uses gender-neutral or inclusive forms where French grammar allows. Tone is direct, warm, and free of jargon.

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

---

## Local setup

```bash
npm ci
npm run dev       # http://localhost:4321
npm run build     # production build
npm run check     # type-check (Astro + TypeScript + Zod)
```

The build runs a `mirrorEnIndex` post-hook that copies `dist/en.html` → `dist/en/index.html` so GitHub Pages serves the EN home at `/en/`.

---

## Conventions

### Commits
Messages use the imperative mood, explain *why* over *what*, and stay under 72 characters on the first line. Multi-line bodies are welcome for non-obvious changes.

```
Add transition:name to portfolio cards for View Transitions morph

Allows the browser to animate the cover image and title from the
card to the project hero on navigation, without JavaScript.
```

### Images & assets
- Photos → WebP, max 150 KB, provide `width` + `height` attributes
- Illustrations / icons → SVG, minified (SVGO or equivalent)
- Never commit unoptimised originals to the main branch
- Use `loading="lazy"` on everything below the fold; `loading="eager"` only on the largest contentful element

### Pull requests
A PR is ready to merge when:
- [ ] `npm run build` passes with zero warnings
- [ ] `npm run check` passes (no TypeScript errors)
- [ ] New interactive elements work with keyboard-only navigation
- [ ] `hreflang` alternates point to production URLs (not preview paths)
- [ ] No prose or copy was modified without an explicit request

### i18n
- `src/i18n/fr.json` and `src/i18n/en.json` contain plain text only — no HTML markup
- Changes to copy require an explicit request from the project owner
- Both locale files must be updated together; leaving one stale is a bug

---

## Branch structure

```
main  (legacy static HTML — production until Astro migration merges)
└── claude/pr2-astro-migration   Astro base: routing, components, SEO
    └── claude/pr3-case-studies  Rich case studies via content collections
        └── claude/pr4-view-transitions  Shared-element page transitions
            └── claude/pr5-animations   Scroll & interaction animations
                └── claude/pr6-social-proof  Testimonials & conversion
```

Each branch is rebased onto its direct parent, not onto `main`.

---

## For AI agents

See [AGENTS.md](./AGENTS.md) for tool-specific rules, prohibited actions, and known gotchas (YAML colon escaping, preview URL leakage, `astro:page-load` pattern).
