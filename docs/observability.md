# Observabilité — petitchardon.fr

Stack pragmatique, full free tier, EU/privacy-friendly. Pas de Google,
pas de Microsoft. 0 €/mois.

## Architecture

```
                ┌──────────────┐    ┌──────────────┐
   Browser ────▶│ Umami Cloud  │───▶│              │
   (analytics) │ (BI / events)│    │              │
                └──────────────┘    │              │
                                    │ Grafana Cloud│
                ┌──────────────┐    │  free tier   │
   Browser ────▶│ Sentry EU    │───▶│  (Prom+Loki) │
   (errors,    │ (errors,     │    │              │
    web vitals)│  web vitals) │    │  Dashboards  │
                └──────────────┘    │              │
                                    │              │
                ┌──────────────┐    │              │
   GH Actions ─▶│ Better Stack │───▶│              │
   (uptime)    │ (uptime+stat)│    │              │
                └──────────────┘    └──────────────┘
                                            ▲
   GH Actions ────────────────────────────▶ │ (Loki: deploys, CI events)
   GH Actions (Lighthouse) ───────────────▶ │ (Prom: lighthouse_score)
```

## Comptes & secrets

| Outil | URL | Free tier | Secret(s) GH Actions |
|---|---|---|---|
| Umami Cloud | https://cloud.umami.is | 100k events/mo | `PUBLIC_UMAMI_WEBSITE_ID`, `UMAMI_API_URL`, `UMAMI_API_TOKEN`, `UMAMI_WEBSITE_ID` |
| Sentry (EU) | https://sentry.io | 5k errors/mo | `PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_API_TOKEN` |
| Better Stack | https://betterstack.com | 10 monitors | `BETTER_STACK_API_TOKEN` |
| Grafana Cloud | https://grafana.com | 10k Prom series, 50 GB Loki, 100k synth checks/mo | `GRAFANA_PROM_URL`, `GRAFANA_PROM_USER`, `GRAFANA_PROM_TOKEN`, `GRAFANA_LOKI_URL`, `GRAFANA_LOKI_USER`, `GRAFANA_LOKI_TOKEN` |

`PUBLIC_*` are exposed to the browser via Astro/Vite. Everything else
is server-side only (CI workflows).

## Setup (one-time)

1. Create accounts in the table above (region: EU where offered).
2. In each tool, generate the API tokens and copy the IDs.
3. In the GitHub repo: **Settings → Secrets and variables → Actions →
   New repository secret** — add every line listed above. Empty secrets
   make the corresponding feature a no-op (the workflows skip cleanly).
4. Set the four monitors on Better Stack:
   - `https://www.petitchardon.fr/`
   - `https://www.petitchardon.fr/en/`
   - `https://www.petitchardon.fr/projects/cocobot.html`
   - `https://www.petitchardon.fr/en/projects/cocobot.html`
5. Import the four dashboards from `observability/dashboards/*.json`
   into Grafana Cloud (UI → Dashboards → New → Import).
6. Push a commit to `main` to trigger a deploy. The first batch of
   metrics shows up after the next `observability-sync` cron run
   (max 6 h) or via "Run workflow" in the Actions tab.

## How it's wired in the code

- `src/lib/observability.ts` — initialises Sentry, captures Web Vitals
  (LCP/INP/CLS/FCP/TTFB), forwards them to Umami as `web-vital` events,
  exposes `trackEvent(name, props)`.
- `src/components/Observability.astro` — injects the Umami `<script>`
  and bootstraps `observability.ts`. **Disabled on PR previews**
  (gate: `import.meta.env.BASE_URL !== '/'` — same logic as `SEO.astro`).
- `src/layouts/BaseLayout.astro` — includes `<Observability />` at the
  end of `<body>` so analytics/error capture run on every page.

## Adding a custom event

```ts
import { trackEvent } from '../lib/observability';

button.addEventListener('click', () => {
  trackEvent('contact_click', { source: 'header_cta' });
});
```

Or in `.astro` markup with an inline `<script>`:

```astro
<a href="mailto:hello@petitchardon.fr" id="email">Email</a>
<script>
  import { trackEvent } from '../lib/observability';
  document.getElementById('email')?.addEventListener('click', () => {
    trackEvent('email_click');
  });
</script>
```

Naming convention: `snake_case`, verb-led — `email_click`,
`contact_submit`, `project_view`, `lang_switch`.

## Dashboards

| Dashboard | What it shows | Source |
|---|---|---|
| Site Health | uptime, probe latency, SSL expiry, Web Vitals p75 | Better Stack + Sentry |
| Traffic & SEO | pageviews, visitors, sources, conversions | Umami |
| Quality | Lighthouse trends, errors / release | Lighthouse CI + Sentry |
| Deploys | timeline of prod deploys + error correlation | GH Actions → Loki |

## Runbook

### Uptime monitor down
1. Check Better Stack → which monitor & which probe location.
2. Open `https://www.petitchardon.fr/` in a browser. If it loads, the
   incident is probe-side — check Better Stack status page.
3. If it doesn't load: check the latest run of `Deploy production`
   in GH Actions. Look for failed gh-pages publish.
4. Roll back via `git revert <bad-sha> && git push origin main`.

### Web Vitals degraded (LCP/INP > p75 threshold)
1. Check Sentry → Issues → filter `transaction:"/"`. Look at the worst
   sessions for screenshots/replays.
2. Run Lighthouse manually on the affected page: `npx lighthouse <url>`.
3. Common culprits: an image lost its `loading="lazy"`, the Roca font
   stopped being preloaded, a new third-party script.

### Pic d'erreurs Sentry
1. Open Sentry → Releases → diff between the previous release SHA and
   the current one to see what shipped.
2. Look at the deploy timeline in Grafana ("Deploys" dashboard) to
   confirm correlation.
3. If clearly caused by a deploy, revert.
4. Otherwise, triage the top issue and patch.

### Free tier saturation
1. Umami pageviews approaching 100k/mo: see "Self-host migration" below.
2. Sentry errors approaching 5k/mo: usually means a regression — fix
   the source, don't raise the quota.
3. Grafana 10k series: prune label cardinality (the `sha` label on
   `lighthouse_score` is the most likely culprit — drop it if needed).

## Self-host migration (future)

When any free tier becomes a constraint, move to a single Hetzner
CAX11 ARM VPS (~4 €/mo). Plan:

1. Provision VPS, install Docker + Caddy.
2. `docker-compose.yml` with:
   - Umami (Postgres) — direct migration via Umami's export/import.
   - GlitchTip (Sentry-API-compatible) — only the DSN changes in
     `PUBLIC_SENTRY_DSN`.
   - Uptime Kuma — recreate the 4 HTTP monitors.
   - Grafana OSS + Prometheus + Loki — re-import the 4 dashboards
     from this repo.
3. Caddy reverse-proxies everything under `*.petitchardon.fr` with
   automatic Let's Encrypt.
4. Point the cron (`observability-sync.yml`) at the self-host URLs.

Estimated time: half a day. The dashboards in `observability/dashboards/`
are already source-of-truth and portable across Grafana editions.
