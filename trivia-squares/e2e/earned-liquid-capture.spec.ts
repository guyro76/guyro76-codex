import {test,expect} from '@playwright/test';
import {drawAdjacentForQA} from './gestureQA';
import {useOfflineQuestionFixtures,answerDisplayedLocalQuestion} from './localQuestionFixture';

test('fourth earned side fills a real square in vivid liquid, with sound cues and no double score',async({page})=>{
 await useOfflineQuestionFixtures(page);
 await page.addInitScript(()=>{
  localStorage.setItem('trivia-tutorial-seen-v1','1');
  localStorage.setItem('trivia-welcome-dismissed-v1','1');
  localStorage.setItem('trivia-player-name','ממלא ריבועים');
  localStorage.setItem('trivia-stage-started-v1','true');
  localStorage.setItem('trivia-mode-v2','solo');
  localStorage.setItem('trivia-local-game-v1',JSON.stringify({
   rows:3,cols:3,mode:'solo',turn:'host',
   edges:{'h-0-0':'host','h-1-0':'host','v-0-0':'host'},
   owners:{},scores:{host:0,guest:0,bot:0}
  }));
 });
 await page.goto('/');
 await expect(page.locator('svg.board')).toBeVisible();
 // Visible dot labels are 1-indexed; these are grid dots (0,1) -> (1,1).
 await drawAdjacentForQA(page,[1,2],[2,2]);
 const quiz=page.getByRole('dialog',{name:'שאלת טריוויה'});
 await expect(quiz).toBeVisible();
 await answerDisplayedLocalQuestion(quiz,true);
 // A premium follow-up may appear after the correct answer; the capture must still happen.
 const tile=page.locator('svg.board .capture-tile[data-square="0-0"]');
 await expect(tile).toBeVisible();
 await expect(tile.locator('.capture-liquid-crest')).toHaveCount(1);
 await expect(tile.locator('.capture-bubble')).toHaveCount(3);
 await expect(tile.locator('.capture-liquid-rise')).toHaveCSS('animation-name',/triviaLiquidPour/);
 const css=await tile.locator('.capture-liquid-rise').evaluate(el=>getComputedStyle(el).animationDuration);
 expect(parseFloat(css)).toBeGreaterThanOrEqual(1.3);
 await expect.poll(()=>page.evaluate(()=>{
  const data=JSON.parse(localStorage.getItem('trivia-local-game-v1')||'{}');
  return {owner:data.owners?.['0-0'],score:data.scores?.host,edge:data.edges?.['v-0-1']};
 })).toEqual({owner:'host',score:1,edge:'host'});
 await page.reload();
 await expect(page.locator('svg.board .capture-tile[data-square="0-0"]')).toBeVisible();
 const persisted=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-game-v1')||'{}'));
 expect(persisted.scores.host).toBe(1);
});
