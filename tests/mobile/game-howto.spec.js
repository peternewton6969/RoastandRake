import { test, expect } from '@playwright/test';

// "How To Play" info modals on the Round Setup games. With 2 players, every game —
// both team games plus the individual and junk games — is offered, so all nine ⓘ
// icons render. Verifies each opens its modal with the right title/copy and closes.

const PLAYERS = [
  { id: 'p1', firstName: 'Aaron', lastName: 'Bailey', nickname: 'AB', handicapIndex: 12.4 },
  { id: 'p2', firstName: 'Sean', lastName: 'Cunningham', nickname: 'SC', handicapIndex: 8.1 },
];

// [game label, a distinctive phrase from that game's modal body]
const GAMES = [
  ['Best Ball', 'lower net score of the two'],
  ['Scramble', 'picks the best shot'],
  ['Skins', 'worth one skin'],
  ['Wolf', 'rotating each tee box'],
  ['Snake', 'Nobody wants the snake'],
  ['Greenie', 'Closest to the pin'],
  ['Sandy', 'in the bunker'],
  ['Net Birdie', 'one under par after strokes'],
  ['Net Eagle', 'two under par after strokes'],
];

async function openRoundSetup(page) {
  await page.goto('/#/home');
  await page.evaluate((players) => {
    localStorage.setItem('roastandrake_players', JSON.stringify(players));
  }, PLAYERS);
  await page.goto('/#/round/setup?players=p1,p2');
  await expect(page.getByLabel('Course search')).toBeVisible();
}

test('every game exposes a How-To modal with the correct rules', async ({ page }) => {
  await openRoundSetup(page);

  for (const [label, phrase] of GAMES) {
    await page.getByRole('button', { name: `How to play ${label}` }).tap();

    const dialog = page.getByRole('dialog', { name: `How to play ${label}` });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: label })).toBeVisible();
    await expect(dialog).toContainText(phrase);

    await dialog.getByRole('button', { name: 'Close' }).tap();
    await expect(dialog).toHaveCount(0);
  }
});

test('tapping the info icon does not toggle the game selection', async ({ page }) => {
  await openRoundSetup(page);

  // Skins starts off (individual games default to none). Opening its modal and
  // closing it must leave it unselected.
  const skins = page.getByRole('button', { name: 'Skins', exact: true });
  await expect(skins).toHaveAttribute('aria-pressed', 'false');

  await page.getByRole('button', { name: 'How to play Skins' }).tap();
  await page.getByRole('dialog', { name: 'How to play Skins' }).getByRole('button', { name: 'Close' }).tap();

  await expect(skins).toHaveAttribute('aria-pressed', 'false');
});

test('the modal closes on a backdrop tap', async ({ page }) => {
  await openRoundSetup(page);

  await page.getByRole('button', { name: 'How to play Wolf' }).tap();
  const dialog = page.getByRole('dialog', { name: 'How to play Wolf' });
  await expect(dialog).toBeVisible();

  // Tap the overlay near the top-left corner, away from the centered card.
  await dialog.tap({ position: { x: 8, y: 8 } });
  await expect(dialog).toHaveCount(0);
});
