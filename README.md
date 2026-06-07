# petitchardon.fr

Bilingual (FR/EN) portfolio site for [petitchardon](https://www.petitchardon.fr) — a freelance graphic design, illustration and copywriting studio based in Rambouillet.

Built with [Astro 4](https://astro.build) and deployed to GitHub Pages.

## Tech stack

- Astro 4.x (`output: 'static'`, `compressHTML: true`, `build.format: 'file'`)
- Built-in i18n routing — FR at `/`, EN at `/en/`
- `@astrojs/sitemap` for the sitemap
- A content collection (`src/content/projects/`) for project case studies
- Vanilla CSS in `src/styles/main.css` (bundled by Astro/Vite) and a small `public/js/main.js` for interactions (nav, theme toggle, tilt, carousel, form)
- Self-hosted variable fonts via `@fontsource-variable/*` (no external font requests)

## Layout

```
src/
  components/      # Header, Footer, SEO, BackgroundLayers, StructuredData, HomePage, ProjectPage
  content/         # `projects` collection (Markdown)
  i18n/            # fr.json, en.json + helpers
  layouts/         # BaseLayout
  pages/
    index.astro          # FR homepage at `/`
    404.astro            # FR 404
    projects/[slug].astro
    en/index.astro       # EN homepage at `/en/`
    en/projects/[slug].astro
public/            # CSS, JS, fonts, images, favicon, manifest, robots, CNAME
```

## Local development

Requires Node 20+.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs to ./dist
npm run preview    # serves ./dist locally
```

## Deployment

Pushes to `main` trigger the workflow at `.github/workflows/deploy.yml`, which:

1. installs deps with `npm ci`,
2. runs `npm run build`,
3. uploads `dist/` and deploys it via `actions/deploy-pages`.

The `public/CNAME` file pins the custom domain `petitchardon.fr`.

## Adding a project

1. Create `src/content/projects/<slug>.md` with the front-matter defined in `src/content/config.ts`.
2. Add the cover asset under `public/assets/images/`.
3. The page is generated automatically at `/projects/<slug>.html` (FR) and `/en/projects/<slug>.html` (EN).

## Editing copy

All bilingual strings live in `src/i18n/locales/fr.json` and `src/i18n/locales/en.json`. Add a key to both files and reference it as `dict.<section>.<key>` from a component.

## Observability

Stack full free tier, EU/privacy-friendly: Umami Cloud (BI), Sentry EU (errors + Web Vitals), Better Stack (uptime + status page), Grafana Cloud (dashboards), Lighthouse CI (quality gate on every PR).

See [`docs/observability.md`](./docs/observability.md) for setup, runbook and the self-host migration path.
