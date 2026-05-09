import * as Sentry from '@sentry/browser';
import { onLCP, onINP, onCLS, onFCP, onTTFB, type Metric } from 'web-vitals';

declare global {
  interface Window {
    umami?: {
      track: (name: string, props?: Record<string, unknown>) => void;
    };
  }
}

// Build-time constants — Vite inlines these as string/boolean literals,
// which lets Rollup tree-shake the entire Sentry import on preview builds
// (and when no DSN is configured).
const SENTRY_DSN = import.meta.env.PUBLIC_SENTRY_DSN;
const RELEASE = import.meta.env.PUBLIC_RELEASE_SHA;
const ENV = import.meta.env.MODE;
const IS_PREVIEW = import.meta.env.BASE_URL !== '/';

let initialised = false;

export function initObservability(): void {
  if (IS_PREVIEW || initialised || typeof window === 'undefined') return;
  initialised = true;

  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      release: RELEASE,
      environment: ENV,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
      ],
    });
  }

  const report = (metric: Metric) => {
    const value = Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value);
    if (SENTRY_DSN) {
      Sentry.setMeasurement(metric.name, value, metric.name === 'CLS' ? '' : 'millisecond');
    }
    window.umami?.track('web-vital', {
      name: metric.name,
      value,
      rating: metric.rating,
      id: metric.id,
    });
  };

  onLCP(report);
  onINP(report);
  onCLS(report);
  onFCP(report);
  onTTFB(report);
}

export function trackEvent(name: string, props?: Record<string, unknown>): void {
  if (IS_PREVIEW || typeof window === 'undefined') return;
  window.umami?.track(name, props);
  if (SENTRY_DSN) {
    Sentry.addBreadcrumb({ category: 'event', message: name, data: props, level: 'info' });
  }
}
