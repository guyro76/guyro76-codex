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
 await expect(dialog).toHaveCount(0);
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-question-text-history-v1')||'[]').length)).toBe(1);
 await page.reload();
 await expect(page.getByLabel('שם שחקן (חובה)')).toHaveValue('גיא בודק שמירה');
 await page.goto('/?source=same-website-link');
 await expect(page.getByLabel('שם שחקן (חובה)')).toHaveValue('גיא בודק שמירה');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-question-text-history-v1')||'[]'));
 expect(saved).toHaveLength(1);
 expect(saved[0]).toBeTruthy();
 expect(firstQuestion.length).toBeGreaterThan(10);
});
