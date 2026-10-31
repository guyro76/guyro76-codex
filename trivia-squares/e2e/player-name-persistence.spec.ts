import {test,expect} from '@playwright/test';
import {useOfflineQuestionFixtures,answerDisplayedLocalQuestion} from './localQuestionFixture';
import {drawAdjacentForQA} from './gestureQA';

test('the same canonical site remembers player name, answered questions and credits across reloads and link parameters',async({page})=>{
 await useOfflineQuestionFixtures(page);
 await page.goto('/');
 const tutorial=page.getByRole('dialog',{name:'הסבר משחק'});
 if(await tutorial.isVisible())await tutorial.getByRole('button',{name:'דלג או סיים'}).click();
 const name=page.getByLabel('שם שחקן (חובה)');
 await name.fill('גיא בודק שמירה');
 await expect(name).toHaveValue('גיא בודק שמירה');
 await drawAdjacentForQA(page,[1,1],[1,2]);
 const dialog=page.getByRole('dialog',{name:'שאלת טריוויה'});
 await expect(dialog).toBeVisible();
 const firstQuestion=await dialog.locator('h2').innerText();
 await answerDisplayedLocalQuestion(dialog,true);
 // A random premium question legitimately opens a second bonus quiz.
 // Complete that quiz before checking persistence; do not mistake it for a stuck dialog.
 await expect.poll(()=>page.evaluate(()=>{
   const pending=JSON.parse(localStorage.getItem('trivia-local-question')||'null');
   return pending===null||pending.kind==='premium_bonus';
 })).toBe(true);
 const hasBonus=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-question')||'null')?.kind==='premium_bonus');
 if(hasBonus){
   await expect(dialog.locator('.quiz-badge')).toContainText('ניקוד ופרסים כפולים');
   await answerDisplayedLocalQuestion(dialog,true);
 }
 await expect(dialog).toHaveCount(0);
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-question-text-history-v1')||'[]').length)).toBeGreaterThan(0);
 const historyBefore=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-question-text-history-v1')||'[]'));
 const creditsBefore=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-rewards')||'{}').credits?.host);
 await page.reload();
 await expect(page.getByLabel('שם שחקן (חובה)')).toHaveValue('גיא בודק שמירה');
 await page.goto('/?source=same-website-link');
 await expect(page.getByLabel('שם שחקן (חובה)')).toHaveValue('גיא בודק שמירה');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-question-text-history-v1')||'[]'));
 expect(saved).toEqual(historyBefore);
 const creditsAfter=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-rewards')||'{}').credits?.host);
 expect(creditsAfter).toBe(creditsBefore);
 expect(firstQuestion.length).toBeGreaterThan(10);
});
