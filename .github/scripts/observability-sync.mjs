#!/usr/bin/env node
// Pull last-24h aggregates from Umami / Sentry / Better Stack and push them
// to Grafana Cloud Prometheus as a small set of gauges.
//
// Each backend is optional — missing secrets just skip that source instead
// of failing the whole run. The script is intentionally dependency-free
// (uses Node 20's built-in fetch) so the workflow stays cheap.

const env = process.env;
const sha = env.GITHUB_SHA ?? 'unknown';
const lines = [];

function gauge(name, value, labels = {}) {
  if (typeof value !== 'number' || Number.isNaN(value)) return;
  const labelStr = Object.entries({ ...labels, sha })
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, '\\"')}"`)
    .join(',');
  lines.push(`${name}{${labelStr}} ${value}`);
}

async function syncUmami() {
  if (!env.UMAMI_API_URL || !env.UMAMI_API_TOKEN || !env.UMAMI_WEBSITE_ID) {
    console.log('umami: skipped (missing secrets)');
    return;
  }
  const end = Date.now();
  const start = end - 24 * 60 * 60 * 1000;
  const url = `${env.UMAMI_API_URL}/websites/${env.UMAMI_WEBSITE_ID}/stats?startAt=${start}&endAt=${end}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${env.UMAMI_API_TOKEN}` },
  });
  if (!res.ok) {
    console.error(`umami: HTTP ${res.status}`);
    return;
  }
  const stats = await res.json();
  gauge('umami_pageviews_24h', stats.pageviews?.value);
  gauge('umami_visitors_24h', stats.visitors?.value);
  gauge('umami_visits_24h', stats.visits?.value);
  gauge('umami_bounces_24h', stats.bounces?.value);
  gauge('umami_totaltime_24h_seconds', stats.totaltime?.value);
  console.log('umami: ok');
}

async function syncSentry() {
  if (!env.SENTRY_API_TOKEN || !env.SENTRY_ORG || !env.SENTRY_PROJECT) {
    console.log('sentry: skipped (missing secrets)');
    return;
  }
  const url = `https://sentry.io/api/0/organizations/${env.SENTRY_ORG}/stats_v2/?field=sum(quantity)&category=error&project=${env.SENTRY_PROJECT}&interval=1h&statsPeriod=24h`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${env.SENTRY_API_TOKEN}` },
  });
  if (!res.ok) {
    console.error(`sentry: HTTP ${res.status}`);
    return;
  }
  const data = await res.json();
  const errorSeries = data.groups?.[0]?.series?.['sum(quantity)'] ?? [];
  const total = errorSeries.reduce((acc, n) => acc + (n ?? 0), 0);
  gauge('sentry_errors_24h', total, { project: env.SENTRY_PROJECT });
  console.log('sentry: ok');
}

async function syncBetterStack() {
  if (!env.BETTER_STACK_API_TOKEN) {
    console.log('better-stack: skipped (missing secrets)');
    return;
  }
  const res = await fetch('https://uptime.betterstack.com/api/v2/monitors', {
    headers: { Authorization: `Bearer ${env.BETTER_STACK_API_TOKEN}` },
  });
  if (!res.ok) {
    console.error(`better-stack: HTTP ${res.status}`);
    return;
  }
  const { data } = await res.json();
  for (const monitor of data ?? []) {
    const labels = { url: monitor.attributes.url, name: monitor.attributes.pronounceable_name };
    gauge('uptime_monitor_up', monitor.attributes.status === 'up' ? 1 : 0, labels);
  }
  console.log('better-stack: ok');
}

async function pushToGrafana() {
  if (!env.GRAFANA_PROM_URL || !env.GRAFANA_PROM_USER || !env.GRAFANA_PROM_TOKEN) {
    console.log('grafana: skipped (missing secrets), would have pushed:');
    console.log(lines.join('\n'));
    return;
  }
  if (lines.length === 0) {
    console.log('grafana: nothing to push');
    return;
  }
  const body = lines.join('\n') + '\n';
  const auth = Buffer.from(`${env.GRAFANA_PROM_USER}:${env.GRAFANA_PROM_TOKEN}`).toString('base64');
  const res = await fetch(`${env.GRAFANA_PROM_URL}/api/v1/push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      Authorization: `Basic ${auth}`,
    },
    body,
  });
  if (!res.ok) {
    console.error(`grafana: HTTP ${res.status} — ${await res.text()}`);
    process.exit(1);
  }
  console.log(`grafana: pushed ${lines.length} samples`);
}

await syncUmami();
await syncSentry();
await syncBetterStack();
await pushToGrafana();
