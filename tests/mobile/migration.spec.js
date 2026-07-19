import { test, expect } from '@playwright/test';

// Verifies the rebrand key migration is wired into app startup (main.jsx ->
// migrateStorageKeys). Pre-rebrand `fourright_*` data seeded before load must be
// copied to the `roastandrake_*` keys and the old keys retired.
test('migrates fourright_* localStorage to roastandrake_* on app load', async ({ page }) => {
  // Land once so localStorage is same-origin, then seed OLD (pre-rebrand) keys.
  await page.goto('/#/home');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem(
      'fourright_players',
      JSON.stringify([
        { id: 'p1', firstName: 'Aaron', lastName: 'Bailey', nickname: 'AB', handicapIndex: 12.4 },
      ]),
    );
    localStorage.setItem('fourright_rounds', JSON.stringify([{ id: 'r1' }]));
    localStorage.setItem('fourright_anthropic_key', 'sk-ant-legacy'); // plain string
  });

  // Reload so main.jsx runs migrateStorageKeys() against the seeded old keys.
  await page.reload();
  await page.waitForSelector('.home-title');

  const state = await page.evaluate(() => ({
    newPlayers: localStorage.getItem('roastandrake_players'),
    newRounds: localStorage.getItem('roastandrake_rounds'),
    newKey: localStorage.getItem('roastandrake_anthropic_key'),
    oldPlayers: localStorage.getItem('fourright_players'),
    oldRounds: localStorage.getItem('fourright_rounds'),
    oldKey: localStorage.getItem('fourright_anthropic_key'),
  }));

  // New keys carry the data...
  expect(JSON.parse(state.newPlayers)[0].nickname).toBe('AB');
  expect(JSON.parse(state.newRounds)[0].id).toBe('r1');
  expect(state.newKey).toBe('sk-ant-legacy');
  // ...and the old keys are gone.
  expect(state.oldPlayers).toBeNull();
  expect(state.oldRounds).toBeNull();
  expect(state.oldKey).toBeNull();

  // And the migrated roster is what the app actually shows on the roster screen.
  await page.goto('/#/players');
  await expect(page.getByText('AB').first()).toBeVisible();
});
