import {test,expect} from '@playwright/test';

// An actual new family player sees the entry; existing saved games resume.
test.use({storageState:{cookies:[],origins:[]}});
test('first launch shows premium 100-level welcome, six languages, then opens the game',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.trivia-welcome')).toBeVisible();
 await expect(page.locator('.welcome-board-visual')).toBeVisible();
 await expect(page.locator('.trivia-welcome')).toContainText('100');
 await page.getByLabel('שפה').selectOption('en');
 await expect(page.locator('.trivia-welcome')).toHaveAttribute('lang','en');
 await page.locator('.welcome-start').click();
 await expect(page.locator('svg.board')).toBeVisible();
 await page.reload();
 await expect(page.locator('.trivia-welcome')).toHaveCount(0);
 await expect(page.locator('svg.board')).toBeVisible();
});
test('saved stage nine skips welcome and keeps the board after reload',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('trivia-player-name','עדי');
  localStorage.setItem('trivia-stage-id-v1','9');
  localStorage.setItem('trivia-stage-completed-v1','8');
  localStorage.setItem('trivia-stage-started-v1','true');
  localStorage.setItem('trivia-tutorial-seen-v1','true');
  localStorage.setItem('trivia-mode-v2','solo');
  localStorage.setItem('trivia-local-game-v1',JSON.stringify({
    rows:5,cols:5,mode:'solo',turn:'host',edges:{'h-0-0':'host'},
    owners:{},scores:{host:0,guest:0,bot:0}
  }));
 });
 await page.goto('/');
 await expect(page.locator('.trivia-welcome')).toHaveCount(0);
 await expect(page.locator('.level-pill')).toContainText('9');
 await page.reload();
 await expect(page.locator('.level-pill')).toContainText('9');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-game-v1')||'{}'));
 expect(saved.edges['h-0-0']).toBe('host');
});
