# AGENTS.md

Configuration and ground rules for AI agents working on the **petitchardon/website** repository.

> This file is intentionally tool-agnostic. It applies to Claude Code, Copilot, Cursor, and any other agent with write access.

---

## Project context

**petitchardon** is the creative studio of Anne Della Gaspera — graphic designer, illustrator, and copywriter based in Rambouillet (France). The site is a bilingual showcase (FR / EN) deployed to **GitHub Pages**.

The site is built with **Astro 4.x** (static output) and lives on `main`. Feature work happens on `claude/*` branches and merges back to `main`.

---

## Development setup

```bash
npm ci            # install dependencies
npm run dev       # local dev server  (http://localhost:4321)
npm run build     # production build + mirrorEnIndex post-hook
npm run check     # Astro type-check (TypeScript + Zod)
```

**The build must pass before any push.** A failing `npm run build` blocks the GitHub Pages deploy.

---

## Branch strategy

| Branch | Purpose |
|---|---|
| `main` | Astro 4.x — production (i18n routing, components, content collections) |
| `claude/pr3-case-studies` | Rich project case studies (Zod schema, ProjectPage layout) |
| `claude/pr4-view-transitions` | View Transitions API — shared-element morphs |
| `claude/pr5-animations` | Scroll animations, tilt, parallax *(planned)* |
| `claude/pr6-social-proof` | Testimonials, trust banner, form improvements *(planned)* |

Each branch is built on top of the previous one. When rebasing, **always rebase onto the direct parent**, not `main`.

---

## Key files

| File | Role |
|---|---|
| `astro.config.mjs` | Build config, `base` URL, `mirrorEnIndex` post-hook |
| `src/layouts/BaseLayout.astro` | Root HTML shell, `<ViewTransitions />` |
| `src/components/Header.astro` | Nav (desktop + mobile), lang toggle |
| `src/components/Footer.astro` | Footer, legal text |
| `src/components/HomePage.astro` | All home-page sections |
| `src/components/ProjectPage.astro` | Case study layout (hero / story / gallery / CTA) |
| `src/components/SEO.astro` | `<meta>`, `hreflang`, canonical — see URL rules below |
| `src/i18n/index.ts` | i18n helpers: `getDict`, `projectUrl`, `homeUrl`, `asset` |
| `src/i18n/locales/fr.json` / `en.json` | All UI strings — **prose is off-limits** (see below) |
| `src/content/config.ts` | Zod schema for the `projects` content collection |
| `src/content/projects/*.md` | Project case studies, bilingual frontmatter |
| `public/js/main.js` | Vanilla JS — must use `astro:page-load`, not `DOMContentLoaded` |

---

## Rules

### 1. Prose is off-limits

**Never rewrite or silently modify existing copy** — i18n JSON values, Markdown body text, or any user-facing string — unless the user explicitly asks for it.

This includes rebases: if resolving a conflict would discard prose changes from `main`, manually port those strings to the i18n files *before* committing the resolution.

### 2. Review comments — verify before applying

Not every GitHub review suggestion is correct. Before applying one:

1. Verify the suggestion is **factually correct** (grammar, logic, code).
2. If it is **ambiguous or debatable**, ask the author before acting.
3. Apply only what is **unambiguously right**.

> Counter-example: a reviewer suggested changing "le moindre visuel" → "visuelle". *Visuel* is a masculine noun in this sentence; the original was correct. The suggestion was applied without verification — that is the failure mode to avoid.

### 3. No HTML inside i18n JSON

Translation files must contain plain text only. Inline markup breaks translation tooling and bypasses Astro's escaping.

```jsonc
// ❌
"label": "Au<span style=\"white-space:nowrap\">jourd'hui</span>"

// ✓
"label": "Aujourd'hui"
```

Achieve visual effects through CSS targeting the rendered element instead.

### 4. YAML — escape colons in frontmatter strings

Strings containing ` : ` (space-colon-space) break YAML mapping parsing. Use `>-` block scalars:

```yaml
# ❌ parse error
challenge:
  fr: "Créer une identité : un vrai défi"

# ✓
challenge:
  fr: >-
    Créer une identité : un vrai défi
```

### 5. URLs — never mix preview and production

`withBase()` / `alternateUrl()` prepend the GitHub Pages preview prefix (`/preview/pr-N/`) in preview builds. For `<link rel="alternate" hreflang>`, always construct bare production URLs — never pass the output of `withBase()` directly.

See `src/components/SEO.astro` for the reference implementation.

### 6. Prefer `getCollection()` over hardcoded slugs

Iterating the content collection in `HomePage.astro` instead of hardcoding slugs means the portfolio grid never needs a manual update when projects rotate.

### 7. `main.js` must use `astro:page-load`

`DOMContentLoaded` fires once. With Astro View Transitions, page content is swapped without a full reload. All initialisation logic must listen to `astro:page-load`, which fires on both initial load and every subsequent navigation.

Document-level event listeners (e.g. `keydown`) must be registered with an `AbortController` signal and aborted at the start of each `init()` call to prevent accumulation across navigations.

---

## What agents must NOT do without explicit permission

- Modify or rewrite prose (copy, taglines, descriptions)
- Push to `main` directly
- Force-push any branch
- Merge or close pull requests
- Apply review suggestions without verifying their correctness
- Add features, abstractions, or refactors beyond the stated task scope
