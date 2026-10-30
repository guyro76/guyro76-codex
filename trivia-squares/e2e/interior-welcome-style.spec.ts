import {expect,test} from '@playwright/test';

/**
 * Shared visual language between the first-visit welcome and internal play.
 * These checks do not modify production storage or use paid services.
 */
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('trivia-welcome-dismissed-v1','1');
  localStorage.setItem('trivia-tutorial-seen-v1','1');
 });
});

test('default in-game screen carries welcome gold-violet design with high-contrast labels',async({page})=>{
 await page.goto('/');
 const root=page.locator('main.trivia-app.skin-regular');
 await expect(root).toBeVisible();
 await expect(page.locator('.arena-panel .arena-inner svg.board')).toBeVisible();
 const theme=await page.evaluate(()=>{
   const root=document.querySelector('main.trivia-app')!;
   const hero=document.querySelector('main.trivia-app .hero')!;
   const arena=document.querySelector('main.trivia-app .arena')!;
   const score=document.querySelector('main.trivia-app .scoreboard')!;
   const heading=document.querySelector('main.trivia-app .hero h1')!;
   const color=document.querySelector('main.trivia-app .level-pill')!;
   return {
     accent:getComputedStyle(root).getPropertyValue('--entry-gold').trim(),
     surface:getComputedStyle(root).getPropertyValue('--entry-surface').trim(),
     heroBackground:getComputedStyle(hero).backgroundImage,
     boardBackground:getComputedStyle(arena).backgroundImage,
     scoreBackground:getComputedStyle(score).backgroundImage,
     headingWeight:Number(getComputedStyle(heading).fontWeight),
     levelColor:getComputedStyle(color).color,
     overflowX:document.documentElement.scrollWidth>window.innerWidth+3
   };
 });
 expect(theme.accent).toBe('#FFC785');
 expect(theme.surface).toBe('#1B1545');
 expect(theme.heroBackground).toContain('linear-gradient');
 expect(theme.boardBackground).toContain('linear-gradient');
 expect(theme.scoreBackground).toContain('linear-gradient');
 expect(theme.headingWeight).toBeGreaterThanOrEqual(900);
 expect(theme.levelColor).toBe('rgb(41, 33, 78)');
 expect(theme.overflowX).toBeFalsy();
});

test('changing to AI future preserves distinct selectable skin and usable board',async({page})=>{
 await page.goto('/');
 const picker=page.getByRole('button',{name:'עיצוב המשחק'});
 await picker.click();
 const futuristic=page.locator('.skin-picker-item').filter({hasText:/עתידני AI/});
 await expect(futuristic).toBeVisible();
 await futuristic.click();
 await expect(page.locator('main.trivia-app')).toHaveClass(/skin-future/);
 await expect(page.locator('.arena-panel svg.board')).toBeVisible();
});

test('tablet and phone keep the board on screen after visual parity styling',async({page},testInfo)=>{
 test.skip(testInfo.project.name!=='chromium-mobile','Mobile viewport regression only');
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const geometry=await page.evaluate(()=>{
   const board=document.querySelector('svg.board')!.getBoundingClientRect();
   return {width:board.width,documentWidth:document.documentElement.scrollWidth,windowWidth:window.innerWidth};
 });
 expect(geometry.width).toBeGreaterThan(250);
 expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.windowWidth+3);
});
