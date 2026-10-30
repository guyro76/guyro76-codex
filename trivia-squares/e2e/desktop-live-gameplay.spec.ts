import {test,expect} from '@playwright/test';
import {useOfflineQuestionFixtures,answerDisplayedLocalQuestion} from './localQuestionFixture';

for(const viewport of [
 {width:1280,height:800,name:'compact desktop'},
 {width:1920,height:1080,name:'wide desktop'}
]){
 test('live '+viewport.name+' layout supports drawn trivia, preserves board and avoids horizontal overflow',async({page},info)=>{
  test.skip(info.project.name!=='chromium-desktop','Desktop gameplay viewport QA');
  await page.setViewportSize({width:viewport.width,height:viewport.height});
  await useOfflineQuestionFixtures(page);
  await page.addInitScript(()=>{
   localStorage.setItem('trivia-welcome-dismissed-v1','1');
   localStorage.setItem('trivia-tutorial-seen-v1','1');
   localStorage.setItem('trivia-player-name','שחקן מחשב');
  });
  await page.goto('/');
  const board=page.locator('svg.board');
  await expect(board).toBeVisible();
  const a=page.locator('svg.board circle[aria-label="נקודה 1, 1"]');
  const b=page.locator('svg.board circle[aria-label="נקודה 1, 2"]');
  const pa=await a.boundingBox(),pb=await b.boundingBox();
  if(!pa||!pb)throw new Error('Desktop board dots missing');
  const metrics=await page.evaluate(()=>{
    const bb=document.querySelector('svg.board')!.getBoundingClientRect();
    return {boardLeft:bb.left,boardRight:bb.right,boardWidth:bb.width,scroll:document.documentElement.scrollWidth,screen:innerWidth};
  });
  expect(metrics.boardWidth).toBeGreaterThan(250);
  expect(metrics.boardLeft).toBeGreaterThanOrEqual(-2);
  expect(metrics.boardRight).toBeLessThanOrEqual(metrics.screen+2);
  expect(metrics.scroll).toBeLessThanOrEqual(metrics.screen+2);
  const point=(box:typeof pa)=>({x:box.x+box.width/2,y:box.y+box.height/2});
  const from=point(pa),to=point(pb);
  await page.mouse.move(from.x,from.y);
  await page.mouse.down();
  await page.mouse.move(to.x,to.y,{steps:16});
  await page.mouse.up();
  const quiz=page.getByRole('dialog',{name:'שאלת טריוויה'});
  await expect(quiz).toBeVisible();
  await answerDisplayedLocalQuestion(quiz,true);
  await expect(quiz).toHaveCount(0);
  await expect.poll(async()=>page.evaluate(()=>{
    const b=JSON.parse(localStorage.getItem('trivia-local-game-v1')||'{}');
    return Object.values(b.edges||{}).length;
  })).toBe(1);
 });
}
