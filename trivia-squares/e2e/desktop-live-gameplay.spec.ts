import {test,expect} from '@playwright/test';
import {useOfflineQuestionFixtures,answerDisplayedLocalQuestion} from './localQuestionFixture';
import {drawAdjacentForQA} from './gestureQA';

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
  await board.scrollIntoViewIfNeeded();
  const metrics=await page.evaluate(()=>{
    const bb=document.querySelector('svg.board')!.getBoundingClientRect();
    return {boardLeft:bb.left,boardRight:bb.right,boardWidth:bb.width,scroll:document.documentElement.scrollWidth,screen:innerWidth};
  });
  expect(metrics.boardWidth).toBeGreaterThan(250);
  expect(metrics.boardLeft).toBeGreaterThanOrEqual(-2);
  expect(metrics.boardRight).toBeLessThanOrEqual(metrics.screen+2);
  expect(metrics.scroll).toBeLessThanOrEqual(metrics.screen+2);
  await drawAdjacentForQA(page,[1,1],[1,2]);
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
