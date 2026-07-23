import { describe, it, expect } from 'vitest';
import { activeRules, HOW_TO } from '../../src/utils/gameRules.js';

// The Score Entry rules quick-reference shows exactly the games active in the round.
// `activeRules` maps the legacy `round.games` boolean map to the shared HOW_TO copy.

describe('activeRules', () => {
  it('returns only the active games, in setup order', () => {
    // A round with skins, wolf, and snake on (as the task example describes).
    const games = { skins: true, wolf: true, snake: true };
    expect(activeRules(games).map((r) => r.title)).toEqual(['Skins', 'Wolf', 'Snake']);
  });

  it('maps the legacy `sandie` flag to the Sandy rules and skips duplicate matchPlay', () => {
    const games = {
      matchPlay: true, // best-ball's match — must NOT add a separate section
      bestBall: true,
      sandie: true, // engine/board key for the junk `sandy` game
    };
    expect(activeRules(games).map((r) => r.title)).toEqual(['Best Ball', 'Sandy']);
  });

  it('orders team, then individual, then junk games regardless of input order', () => {
    const games = { netEagle: true, scramble: true, greenie: true, skins: true };
    expect(activeRules(games).map((r) => r.title)).toEqual([
      'Scramble',
      'Skins',
      'Greenie',
      'Net Eagle',
    ]);
  });

  it('returns the exact HOW_TO copy (not a rewrite)', () => {
    const [skins] = activeRules({ skins: true });
    expect(skins).toBe(HOW_TO.skins);
    expect(skins.body).toContain('Every hole is worth one skin');
  });

  it('returns an empty list for no active games or a missing map', () => {
    expect(activeRules({})).toEqual([]);
    expect(activeRules({ skins: false })).toEqual([]);
    expect(activeRules(null)).toEqual([]);
    expect(activeRules(undefined)).toEqual([]);
  });
});
