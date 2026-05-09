#!/usr/bin/env node
// Convert Lighthouse CI manifest into Prometheus exposition format on stdout.
// Usage: node lhci-to-prom.mjs .lighthouseci/manifest.json | curl ... /api/v1/push
//
// Categories emitted: performance, accessibility, best-practices, seo, pwa.
// One sample per (url, category). The remote_write endpoint accepts the
// classic Prom text format when posted with Content-Type: text/plain.

import { readFileSync } from 'node:fs';

const [, , manifestPath = '.lighthouseci/manifest.json'] = process.argv;
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const sha = process.env.GITHUB_SHA ?? 'unknown';
const ref = process.env.GITHUB_REF_NAME ?? 'unknown';

const lines = [
  '# HELP lighthouse_score Lighthouse category score (0..1).',
  '# TYPE lighthouse_score gauge',
];

for (const run of manifest) {
  if (!run.isRepresentativeRun) continue;
  const summary = run.summary ?? {};
  const url = run.url;
  for (const [cat, score] of Object.entries(summary)) {
    if (typeof score !== 'number') continue;
    const labels = [
      `url="${url}"`,
      `category="${cat}"`,
      `sha="${sha}"`,
      `ref="${ref}"`,
    ].join(',');
    lines.push(`lighthouse_score{${labels}} ${score}`);
  }
}

process.stdout.write(lines.join('\n') + '\n');
