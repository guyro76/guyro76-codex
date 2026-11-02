import {test,expect} from '@playwright/test';
import {drawAdjacentForQA} from './gestureQA';

// Owner's required checkpoints. The board must be completely on screen, unclipped,
// with no horizontal scroll, and overlays must sit above the sticky top bar.
const sizes:[number,number][]=[[390,844],[430,932],[768,1024],[1024,768],[1366,768],[1440,900],[1920,1080]];

for(const [width,height] of sizes){
 test('board is fully visible and dominant at '+width+'x'+height,async({page},info)=>{
  test.skip(info.project.name!=='chromium-desktop','Explicit viewport matrix runs once');
  await page.setViewportSize({width,height});
  await page.addInitScript(()=>{
   localStorage.setItem('trivia-welcome-dismissed-v1','1');
   localStorage.setItem('trivia-tutorial-seen-v1','1');
   localStorage.setItem('trivia-player-name','בודק');
  });
  await page.goto('/');
  const board=page.locator('svg.board');
  await expect(board).toBeVisible();
  const m=await page.evaluate(()=>{
   const b=document.querySelector('svg.board')!.getBoundingClientRect();
   const top=document.querySelector('.game-topbar')!.getBoundingClientRect();
   return {top:b.top,bottom:b.bottom,left:b.left,right:b.right,w:b.width,h:b.height,bar:top.bottom,
    vw:innerWidth,vh:innerHeight,scroll:document.documentElement.scrollWidth};
  });
  expect(m.scroll,'horizontal scroll').toBeLessThanOrEqual(m.vw+1);
  expect(m.left).toBeGreaterThanOrEqual(0);
  expect(m.right).toBeLessThanOrEqual(m.vw+1);
  expect(m.top,'board starts below the top bar').toBeGreaterThanOrEqual(m.bar-1);
  expect(m.bottom,'board ends on screen').toBeLessThanOrEqual(m.vh+1);
  expect(Math.abs(m.w-m.h),'board stays square').toBeLessThanOrEqual(2);
  expect(m.w,'board uses most of the short screen edge').toBeGreaterThanOrEqual(Math.min(m.vw,m.vh)*0.62);
  await drawAdjacentForQA(page,[1,1],[1,2]);
  const quiz=page.getByRole('dialog',{name:'שאלת טריוויה'});
  await expect(quiz).toBeVisible();
  const covered=await page.evaluate(()=>{
   const card=document.querySelector('.quiz-card')!.getBoundingClientRect();
   const hit=document.elementFromPoint(card.left+card.width/2,card.top+8);
   return !hit||!hit.closest('.quiz-card');
  });
  expect(covered,'top bar must not cover the question card').toBe(false);
 });
}
