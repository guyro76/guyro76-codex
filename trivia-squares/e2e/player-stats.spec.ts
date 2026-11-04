import {test,expect} from '@playwright/test';
import {useOfflineQuestionFixtures,answerDisplayedLocalQuestion} from './localQuestionFixture';
import {drawAdjacentForQA} from './gestureQA';

test('personal statistics count answers per topic and show in the achievements tab',async({page})=>{
 await useOfflineQuestionFixtures(page);
 await page.addInitScript(()=>{
  if(sessionStorage.getItem('stats-seeded'))return;sessionStorage.setItem('stats-seeded','1');
  localStorage.setItem('trivia-tutorial-seen-v1','1');localStorage.setItem('trivia-player-name','גיא');localStorage.setItem('trivia-mode-v2','solo');
 });
 await page.goto('/');
 await page.locator('svg.board').waitFor();
 await drawAdjacentForQA(page,[1,1],[1,2]);
 const quiz=page.getByRole('dialog',{name:'שאלת טריוויה'});
 await expect(quiz).toBeVisible();
 await answerDisplayedLocalQuestion(quiz,true);
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-player-stats-v1')||'{}').answered)).toBe(1);
 await page.locator('.game-topbar .app-menu-trigger').click();
 await page.locator('dialog.app-menu-dialog .app-menu-tab[data-section="rewards"]').click();
 const stats=page.getByTestId('player-stats');
 await expect(stats).toBeVisible();
 await expect(stats.locator('.player-stats-tiles div').first()).toContainText('1');
 await expect(stats.locator('.player-stats-topics li')).toHaveCount(1);
});
