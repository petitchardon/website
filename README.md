# petitchardon

Code source de [petitchardon.fr](https://www.petitchardon.fr).

**petitchardon** est le studio créatif d'Anne Della Gaspera — graphiste, illustratrice et rédactrice basée à Rambouillet (Yvelines), France.

Anne façonne des identités de marque comme on raconte une histoire : chaque projet est une exploration graphique ancrée dans le récit du client, conçue pour être immédiatement reconnaissable et impossible à oublier. Son travail couvre la création de logos, les systèmes d'identité visuelle, l'illustration, le webdesign et les contenus éditoriaux.

Le site présente sa méthode, son portfolio et un moyen de la contacter.

---

*Source code for [petitchardon.fr](https://www.petitchardon.fr).*

*petitchardon is the creative studio of Anne Della Gaspera — graphic designer, illustrator and copywriter based in Rambouillet (Yvelines), France.*

*Anne crafts brand identities the same way she tells a story: each project is a graphic exploration rooted in the client's narrative, built to be immediately recognisable and impossible to ignore. Her work spans logo design, visual identity systems, illustration, web design, and editorial content.*

*The website presents her process, her portfolio, and a way to get in touch.*

---

Built with [Astro 4](https://astro.build) and deployed to GitHub Pages.

## Tech stack

- Astro 4.x (`output: 'static'`, `compressHTML: true`, `build.format: 'file'`)
- Built-in i18n routing — FR at `/`, EN at `/en/`
- `@astrojs/sitemap` for the sitemap
- A content collection (`src/content/projects/`) for project case studies
- Vanilla CSS in `public/css/style.css` and a small `public/js/main.js` for interactions (nav, tilt, carousel, form)

## Layout

```
src/
  components/      # Header, Footer, SEO, BackgroundLayers, StructuredData, HomePage, ProjectPage
  content/         # `projects` collection (Markdown)
  i18n/            # locales/fr.json, locales/en.json + helpers
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
3. publishes `dist/` to the `gh-pages` branch (preserving the `preview/` subtree).

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

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the developer guide and [AGENTS.md](./AGENTS.md) for AI-agent rules.

---

© Anne Della Gaspera / petitchardon. Tous droits réservés — voir [LICENSE](./LICENSE).
