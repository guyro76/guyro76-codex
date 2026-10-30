import {test,expect} from '@playwright/test';

test('long Hebrew player names remain intact and readable on captured tiles on both layouts',async({page})=>{
 const fullName='אביגיל ליאור רוזנברג';
 await page.addInitScript(({fullName})=>{
  localStorage.setItem('trivia-tutorial-seen-v1','true');
  localStorage.setItem('trivia-welcome-dismissed-v1','1');
  localStorage.setItem('trivia-player-name',fullName);
  localStorage.setItem('trivia-local-game-v1',JSON.stringify({
   rows:3,cols:3,mode:'solo',turn:'host',edges:{},
   owners:{'0-0':'host'},scores:{host:1,guest:0,bot:0}
  }));
 },{fullName});
 await page.goto('/');
 const tile=page.locator('svg.board .capture-tile[data-square="0-0"]');
 await expect(tile).toBeVisible();
 await expect(tile).toHaveAttribute('data-owner',fullName);
 await expect(tile).toHaveAttribute('aria-label',new RegExp(fullName));
 const label=tile.locator('.capture-player-name-object div').first();
 const props=await label.evaluate(el=>{
   const css=getComputedStyle(el);
   return {px:parseFloat(css.fontSize),weight:Number(css.fontWeight),dir:el.getAttribute('dir'),bidi:css.unicodeBidi};
 });
 expect(props.px).toBeGreaterThanOrEqual(12);
 expect(props.weight).toBeGreaterThanOrEqual(900);
 expect(props.dir).toBe('rtl');
 expect(props.bidi).toContain('isolate');
 await expect(tile.locator('.capture-player-name-object span')).toContainText(fullName);
});
