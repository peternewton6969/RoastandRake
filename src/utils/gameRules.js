// Single source of truth for the plain-language game rules shown in the app's
// "How To Play" modals (Round Setup) and the round rules quick-reference (Score
// Entry). Pure data + selection logic, no React — so it can be unit-tested directly.

// Titles + rules copy, keyed by RoundSetup's TEAM/INDIVIDUAL/JUNK game keys.
export const HOW_TO = {
  bestBall: {
    title: 'Best Ball',
    body:
      'Two-player teams. Each player plays their own ball. The lower net score of the two ' +
      'teammates counts as the team score on each hole. Best team score wins the hole. Most ' +
      'holes won wins the match.',
  },
  scramble: {
    title: 'Scramble',
    body:
      'Two-player teams. Both players tee off. The team picks the best shot and both play from ' +
      'that spot. Repeat until holed out. One team score per hole. Lowest score wins.',
  },
  skins: {
    title: 'Skins',
    body:
      'Every hole is worth one skin. Lowest net score on the hole wins the skin. If two or more ' +
      'players tie, the skin carries to the next hole. Player with the most skins at the end wins ' +
      'the pot.',
  },
  wolf: {
    title: 'Wolf',
    body:
      'One player is the Wolf each hole, rotating each tee box. The Wolf watches each player hit, ' +
      'then decides after each shot whether to pick that player as a partner. If the Wolf goes ' +
      'alone and wins the hole, they collect double. If the Wolf loses alone, they pay double. ' +
      'The Wolf can also declare Lone Wolf before anyone hits.',
  },
  snake: {
    title: 'Snake',
    body:
      'Nobody wants the snake. Three-putt and you hold it. Someone else three-putts and it passes ' +
      'to them. Whoever holds the snake at the end of the round pays every other player the snake ' +
      'amount. No three-putts all round means no payout.',
  },
  greenie: {
    title: 'Greenie',
    body:
      'Par 3 holes only. Closest to the pin on the tee shot wins the greenie — but only if ' +
      'that player makes par or better. No par, no greenie. One winner per par 3 hole.',
  },
  sandy: {
    title: 'Sandy',
    body:
      'Hit it in the bunker and still make par or better net and you collect a sandy from every ' +
      'other player. One sandy per hole regardless of how many bunkers you visit.',
  },
  netBirdie: {
    title: 'Net Birdie',
    body:
      'Make a net birdie — one under par after strokes — and collect from every player ' +
      'who did not. Multiple players can win on the same hole.',
  },
  netEagle: {
    title: 'Net Eagle',
    body:
      'Make a net eagle — two under par after strokes — and collect from every player ' +
      'who did not. Supersedes net birdie on the same hole.',
  },
};

// Display order + mapping from the legacy `round.games` boolean map (see
// utils/roundModel.js) to HOW_TO keys. `games.sandie` is the junk `sandy` game;
// `matchPlay` duplicates best-ball's match and is covered by the bestBall section.
const GAME_ORDER = [
  ['bestBall', 'bestBall'],
  ['scramble', 'scramble'],
  ['skins', 'skins'],
  ['wolf', 'wolf'],
  ['greenie', 'greenie'],
  ['snake', 'snake'],
  ['sandie', 'sandy'],
  ['netBirdie', 'netBirdie'],
  ['netEagle', 'netEagle'],
];

/**
 * The HOW_TO entries for every game active in a round's legacy `games` map, in
 * display order. Unknown/false flags are skipped.
 * @param {Object} games - round.games boolean map
 * @returns {Array<{title:string, body:string}>}
 */
export function activeRules(games) {
  if (!games || typeof games !== 'object') return [];
  return GAME_ORDER.filter(([flag]) => games[flag])
    .map(([, key]) => HOW_TO[key])
    .filter(Boolean);
}
