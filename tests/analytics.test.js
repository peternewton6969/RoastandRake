import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { logEvent, getEvents, clearEvents, summarizeEvents, EVENTS } from '../src/utils/analytics.js';

// A minimal localStorage stand-in (analytics.js uses the global directly).
function makeFakeLocalStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => {
      map.set(k, String(v));
    },
    removeItem: (k) => {
      map.delete(k);
    },
  };
}

beforeEach(() => {
  globalThis.localStorage = makeFakeLocalStorage();
});

afterEach(() => {
  delete globalThis.localStorage;
});

describe('analytics — logEvent', () => {
  it('appends timestamped events and reads them back oldest-first', () => {
    logEvent(EVENTS.SEARCH_OPENED);
    logEvent(EVENTS.COURSE_TAPPED, { courseName: 'Pebble Beach' });
    const events = getEvents();
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe(EVENTS.SEARCH_OPENED);
    expect(typeof events[0].t).toBe('number');
    expect(typeof events[0].iso).toBe('string');
    expect(events[1]).toMatchObject({ type: EVENTS.COURSE_TAPPED, courseName: 'Pebble Beach' });
  });

  it('caps the log at 1000 events, keeping the most recent', () => {
    for (let i = 0; i < 1005; i += 1) logEvent(EVENTS.SEARCH_OPENED, { i });
    const events = getEvents();
    expect(events).toHaveLength(1000);
    expect(events[0].i).toBe(5); // first five dropped
    expect(events[events.length - 1].i).toBe(1004);
  });

  it('clearEvents empties the log', () => {
    logEvent(EVENTS.SEARCH_OPENED);
    clearEvents();
    expect(getEvents()).toEqual([]);
  });

  it('never throws when localStorage is unavailable', () => {
    delete globalThis.localStorage;
    expect(() => logEvent(EVENTS.SEARCH_OPENED)).not.toThrow();
    expect(logEvent(EVENTS.SEARCH_OPENED)).toBeNull();
    expect(getEvents()).toEqual([]);
  });
});

describe('analytics — summarizeEvents', () => {
  it('returns empty-safe defaults for no events', () => {
    const s = summarizeEvents([]);
    expect(s.total).toBe(0);
    expect(s.avgFetchMsCached).toBeNull();
    expect(s.avgFetchMsLive).toBeNull();
    expect(s.completionRate).toBeNull();
    expect(s.topCourses).toEqual([]);
    expect(s.recent).toEqual([]);
  });

  it('computes average fetch time separately for cache and live', () => {
    const events = [
      { type: EVENTS.FETCH_COMPLETED, source: 'live', durationMs: 100 },
      { type: EVENTS.FETCH_COMPLETED, source: 'live', durationMs: 300 },
      { type: EVENTS.FETCH_COMPLETED, source: 'cache', durationMs: 0 },
      { type: EVENTS.FETCH_COMPLETED, source: 'cache', durationMs: 4 },
    ];
    const s = summarizeEvents(events);
    expect(s.avgFetchMsLive).toBe(200);
    expect(s.avgFetchMsCached).toBe(2);
    expect(s.fetchCountLive).toBe(2);
    expect(s.fetchCountCached).toBe(2);
  });

  it('computes completion rate and abandonment by step', () => {
    const events = [
      { type: EVENTS.SELECTION_CONFIRMED, courseName: 'A' },
      { type: EVENTS.SELECTION_CONFIRMED, courseName: 'A' },
      { type: EVENTS.SELECTION_CONFIRMED, courseName: 'B' },
      { type: EVENTS.SELECTION_ABANDONED, lastStep: 'tee_selection' },
      { type: EVENTS.SELECTION_ABANDONED, lastStep: 'results' },
      { type: EVENTS.SELECTION_ABANDONED, lastStep: 'tee_selection' },
    ];
    const s = summarizeEvents(events);
    expect(s.confirmed).toBe(3);
    expect(s.abandoned).toBe(3);
    expect(s.completionRate).toBe(0.5);
    expect(s.abandonmentByStep).toEqual({ tee_selection: 2, results: 1 });
  });

  it('ranks top courses by confirmed selections, most first', () => {
    const events = [
      { type: EVENTS.SELECTION_CONFIRMED, courseName: 'A' },
      { type: EVENTS.SELECTION_CONFIRMED, courseName: 'B' },
      { type: EVENTS.SELECTION_CONFIRMED, courseName: 'A' },
      { type: EVENTS.SELECTION_CONFIRMED, courseName: 'A' },
      { type: EVENTS.SELECTION_CONFIRMED, courseName: 'B' },
    ];
    const s = summarizeEvents(events);
    expect(s.topCourses).toEqual([
      { name: 'A', count: 3 },
      { name: 'B', count: 2 },
    ]);
  });

  it('recent is the last 50 events, newest first', () => {
    const events = Array.from({ length: 60 }, (_, i) => ({ type: 'x', t: i, i }));
    const s = summarizeEvents(events);
    expect(s.recent).toHaveLength(50);
    expect(s.recent[0].i).toBe(59);
    expect(s.recent[49].i).toBe(10);
  });
});
