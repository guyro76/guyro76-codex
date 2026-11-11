import {expect,test} from '@playwright/test';

test('captured square fills like a luminous liquid vessel and reveals its owner icon',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.addInitScript(()=>{
    localStorage.setItem('trivia-tutorial-seen-v1','true');
    localStorage.setItem('trivia-player-name','טסטר');
    localStorage.setItem('trivia-stage-id-v1','1');
    localStorage.setItem('trivia-local-game-v1',JSON.stringify({
      rows:3,cols:3,mode:'local',turn:'guest',
      edges:{'h-0-0':'host','h-1-0':'host','v-0-0':'host','v-0-1':'host'},
      owners:{'0-0':'host'},scores:{host:1,guest:0,bot:0}
    }));
  });
  await page.goto('/');
  const cell=page.locator('svg.board .capture-tile[data-square="0-0"]');
  await expect(cell).toBeVisible();
  await expect(cell.locator('.capture-liquid-body')).toHaveCount(1);
  await expect(cell.locator('.capture-liquid-wave')).toHaveCount(1);
  await expect(cell.locator('.capture-bubble')).toHaveCount(3);
  await expect(cell.locator('.capture-firework-spark')).toHaveCount(8);
  await expect(cell.locator('.capture-mark')).toHaveText(/\S/);
  await expect.poll(()=>cell.locator('.capture-liquid-rise').evaluate(
    node=>getComputedStyle(node).animationName
  )).toContain('captureVesselFill');

  await page.emulateMedia({reducedMotion:'reduce'});
  await expect.poll(()=>cell.locator('.capture-liquid-rise').evaluate(
    node=>getComputedStyle(node).animationName
  )).toBe('none');
  await expect(cell.locator('.capture-mark')).toBeVisible();
});
