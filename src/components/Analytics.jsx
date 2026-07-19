import { useMemo, useState } from 'react';
import AppHeader from './AppChrome.jsx';
import { getEvents, clearEvents, summarizeEvents } from '../utils/analytics.js';

// Admin view at #/analytics: a read-only summary of the course-selection funnel
// (fetch timing cache-vs-live, completion vs abandonment, top courses) plus the
// raw tail of the event log. Not linked from the app chrome — reached by URL.

const C = {
  bg: '#0a1628',
  surface: '#1e3a5f',
  surface2: '#162d4a',
  green: '#22c55e',
  border: '#2d4a6b',
  text: '#f8fafc',
  dim: '#94a3b8',
  danger: '#ef4444',
};

const styles = {
  main: { background: C.bg, minHeight: '100%', padding: 16, display: 'grid', gap: 20 },
  label: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: C.dim,
  },
  tiles: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  tile: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: 14,
    display: 'grid',
    gap: 4,
  },
  tileValue: { fontSize: 22, fontWeight: 800, color: C.text },
  tileLabel: { fontSize: 12, color: C.dim },
  tileSub: { fontSize: 11, color: C.dim },
  section: { display: 'grid', gap: 8 },
  rowLine: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    background: C.surface2,
    borderRadius: 8,
    fontSize: 14,
    color: C.text,
  },
  rowKey: { color: C.text },
  rowVal: { color: C.dim, fontVariantNumeric: 'tabular-nums' },
  empty: { fontSize: 13, color: C.dim },
  eventList: { display: 'grid', gap: 6 },
  eventRow: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: 8,
    padding: '6px 10px',
    background: C.surface2,
    borderRadius: 8,
    fontSize: 12,
  },
  eventTime: { color: C.dim, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
  eventBody: { color: C.text, wordBreak: 'break-word' },
  eventType: { fontWeight: 700 },
  clear: {
    justifySelf: 'start',
    minHeight: 40,
    padding: '0 14px',
    borderRadius: 8,
    border: `1px solid ${C.danger}`,
    background: 'transparent',
    color: C.danger,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
};

const fmtMs = (n) => (n == null ? '—' : `${Math.round(n)} ms`);
const fmtPct = (n) => (n == null ? '—' : `${Math.round(n * 100)}%`);

function fmtTime(iso, t) {
  const d = iso ? new Date(iso) : new Date(t);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

function eventDetail(e) {
  const skip = new Set(['type', 't', 'iso']);
  const parts = Object.keys(e)
    .filter((k) => !skip.has(k))
    .map((k) => `${k}=${e[k]}`);
  return parts.join(' ');
}

export default function Analytics({ navigate }) {
  const [nonce, setNonce] = useState(0);
  const summary = useMemo(() => summarizeEvents(getEvents()), [nonce]);

  const abandonSteps = Object.entries(summary.abandonmentByStep).sort((a, b) => b[1] - a[1]);

  function handleClear() {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Clear all analytics events? This cannot be undone.')) return;
    clearEvents();
    setNonce((n) => n + 1);
  }

  return (
    <>
      <AppHeader
        navigate={navigate}
        title="Analytics"
        left="back"
        onBack={() => navigate('home')}
      />
      <main style={styles.main}>
        <div style={styles.tiles}>
          <div style={styles.tile}>
            <span style={styles.tileValue}>{fmtMs(summary.avgFetchMsLive)}</span>
            <span style={styles.tileLabel}>Avg fetch (live)</span>
            <span style={styles.tileSub}>{summary.fetchCountLive} fetches</span>
          </div>
          <div style={styles.tile}>
            <span style={styles.tileValue}>{fmtMs(summary.avgFetchMsCached)}</span>
            <span style={styles.tileLabel}>Avg fetch (cached)</span>
            <span style={styles.tileSub}>{summary.fetchCountCached} reads</span>
          </div>
          <div style={styles.tile}>
            <span style={styles.tileValue}>{fmtPct(summary.completionRate)}</span>
            <span style={styles.tileLabel}>Completion rate</span>
            <span style={styles.tileSub}>
              {summary.confirmed} confirmed · {summary.abandoned} abandoned
            </span>
          </div>
          <div style={styles.tile}>
            <span style={styles.tileValue}>{summary.total}</span>
            <span style={styles.tileLabel}>Total events</span>
            <span style={styles.tileSub}>capped at 1000</span>
          </div>
        </div>

        <section style={styles.section}>
          <span style={styles.label}>Abandonment by step</span>
          {abandonSteps.length === 0 ? (
            <span style={styles.empty}>No abandonments logged.</span>
          ) : (
            abandonSteps.map(([stepName, count]) => (
              <div key={stepName} style={styles.rowLine}>
                <span style={styles.rowKey}>{stepName}</span>
                <span style={styles.rowVal}>{count}</span>
              </div>
            ))
          )}
        </section>

        <section style={styles.section}>
          <span style={styles.label}>Top courses selected</span>
          {summary.topCourses.length === 0 ? (
            <span style={styles.empty}>No confirmed selections yet.</span>
          ) : (
            summary.topCourses.slice(0, 10).map((c) => (
              <div key={c.name} style={styles.rowLine}>
                <span style={styles.rowKey}>{c.name}</span>
                <span style={styles.rowVal}>{c.count}</span>
              </div>
            ))
          )}
        </section>

        <section style={styles.section}>
          <span style={styles.label}>Last 50 events</span>
          {summary.recent.length === 0 ? (
            <span style={styles.empty}>No events logged yet.</span>
          ) : (
            <div style={styles.eventList}>
              {summary.recent.map((e, i) => (
                <div key={`${e.t}-${i}`} style={styles.eventRow}>
                  <span style={styles.eventTime}>{fmtTime(e.iso, e.t)}</span>
                  <span style={styles.eventBody}>
                    <span style={styles.eventType}>{e.type}</span>
                    {eventDetail(e) && ` · ${eventDetail(e)}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <button type="button" style={styles.clear} onClick={handleClear}>
          Clear analytics
        </button>
      </main>
    </>
  );
}
