import {test,expect} from '@playwright/test';

/** Real viewport geometry and the in-app 4-mode preview control.
 * Chromium coverage is not a substitute for physical iPad/iPhone Safari.
 */
test('tablet portrait, tablet landscape and desktop keep the board visible and horizontally contained',async({page},info)=>{
 test.skip(info.project.name!=='chromium-desktop','Desktop browser controls physical viewport geometry here');
 await page.addInitScript(()=>{
  localStorage.setItem('trivia-welcome-dismissed-v1','1');
  localStorage.setItem('trivia-tutorial-seen-v1','1');
  localStorage.setItem('trivia-player-name','טסטר');
 });
 await page.goto('/');
 const board=page.locator('svg.board');
 const app=page.locator('main.trivia-app');
 await expect(board).toBeVisible();
 for(const v of [
  {width:768,height:1024,label:'tablet portrait'},
  {width:1024,height:768,label:'tablet landscape'},
  {width:1280,height:800,label:'compact desktop'},
  {width:1920,height:1080,label:'large desktop'}
 ]){
  await page.setViewportSize({width:v.width,height:v.height});
  await board.scrollIntoViewIfNeeded();
  const m=await page.evaluate(()=>{
   const board=document.querySelector('svg.board')?.getBoundingClientRect();
   const app=document.querySelector('main.trivia-app')?.getBoundingClientRect();
   return {screen:window.innerWidth,scroll:document.documentElement.scrollWidth,
    boardLeft:board?.left??-1,boardRight:board?.right??1e6,boardWidth:board?.width??0,
    appLeft:app?.left??-1,appRight:app?.right??1e6};
  });
  expect(m.scroll, v.label+' horizontal document overflow').toBeLessThanOrEqual(m.screen+2);
  expect(m.boardWidth,v.label+' board is not collapsed').toBeGreaterThan(220);
  expect(m.boardLeft,v.label+' board starts onscreen').toBeGreaterThanOrEqual(-2);
  expect(m.boardRight,v.label+' board ends onscreen').toBeLessThanOrEqual(m.screen+2);
  expect(m.appLeft,v.label+' main starts onscreen').toBeGreaterThanOrEqual(-2);
  expect(m.appRight,v.label+' main ends onscreen').toBeLessThanOrEqual(m.screen+2);
 }
});
test('viewport preview switches automatically, desktop, tablet and mobile without losing game board',async({page},info)=>{
 test.skip(info.project.name!=='chromium-desktop','Preview controls checked on desktop');
 await page.addInitScript(()=>{
  localStorage.setItem('trivia-welcome-dismissed-v1','1');
  localStorage.setItem('trivia-tutorial-seen-v1','1');
  localStorage.setItem('trivia-player-name','טסטר');
 });
 await page.goto('/');
 const previews=page.getByRole('navigation',{name:'בדיקת תצוגה במכשירים'});
 await expect(previews).toBeVisible();
 const options=[['auto','אוטומטי'],['desktop','מחשב'],['tablet','טאבלט'],['mobile','נייד']] as const;
 for(const [mode,button] of options){
  const control=previews.getByRole('button',{name:button});
  await control.click();
  await expect(control).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('main.trivia-app')).toHaveAttribute('data-preview-viewport',mode);
  await expect(page.locator('svg.board')).toBeVisible();
 }
});
