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

test('default in-game screen uses the night arcade glass design with high-contrast labels',async({page})=>{
 await page.goto('/');
 await page.locator('svg.board').waitFor();
 const root=page.locator('main.trivia-app.skin-regular');
 await expect(root).toBeVisible();
 await expect(page.locator('.arena-panel .arena-inner svg.board')).toBeVisible();
 const theme=await page.evaluate(()=>{
   const q=(s:string)=>document.querySelector(s)!;
   const panel=getComputedStyle(q('main.trivia-app .arena-panel'));
   const top=getComputedStyle(q('main.trivia-app .game-topbar'));
   return {
     panelBlur:(panel.backdropFilter||(panel as unknown as {webkitBackdropFilter:string}).webkitBackdropFilter||''),
     topBlur:(top.backdropFilter||(top as unknown as {webkitBackdropFilter:string}).webkitBackdropFilter||''),
     trayBackground:getComputedStyle(q('main.trivia-app .arena')).backgroundImage,
     font:getComputedStyle(q('main.trivia-app .game-topbar h1')).fontFamily,
     headingWeight:Number(getComputedStyle(q('main.trivia-app .game-topbar h1')).fontWeight),
     levelColor:getComputedStyle(q('main.trivia-app .level-pill')).color,
     primary:getComputedStyle(q('main.trivia-app .control-row .gold-button')).backgroundImage,
     overflowX:document.documentElement.scrollWidth>window.innerWidth+3
   };
 });
 expect(theme.panelBlur).toContain('blur');
 expect(theme.topBlur).toContain('blur');
 expect(theme.trayBackground).toContain('linear-gradient');
 expect(theme.font).toContain('Rubik');
 expect(theme.headingWeight).toBeGreaterThanOrEqual(800);
 expect(theme.levelColor).toBe('rgb(43, 27, 0)');
 expect(theme.primary).toContain('linear-gradient');
 expect(theme.overflowX).toBeFalsy();
});

test('changing to AI future preserves distinct selectable skin and usable board',async({page})=>{
 await page.goto('/');
 await page.locator('svg.board').waitFor();
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
 await page.locator('svg.board').waitFor();
 const geometry=await page.evaluate(()=>{
   const board=document.querySelector('svg.board')!.getBoundingClientRect();
   return {width:board.width,documentWidth:document.documentElement.scrollWidth,windowWidth:window.innerWidth};
 });
 expect(geometry.width).toBeGreaterThan(250);
 expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.windowWidth+3);
});
