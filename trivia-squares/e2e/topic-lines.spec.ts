import {test,expect} from '@playwright/test';
import {useOfflineQuestionFixtures} from './localQuestionFixture';
import {drawAdjacentForQA} from './gestureQA';
import {offlineQuestions} from '../src/lib/offlineQuestions';
import {freshLocalQuestionReserve} from '../src/lib/freshQuestions';
import {curatedHebrewQuestions} from '../src/lib/curatedHebrewQuestions';
import {topicForQuestion} from '../src/lib/questionTopics';

/* Owner request 2026-11-04: only 2–3 lines per board show a topic; drawing one deals a question
 * from that topic. Every other line stays a random question. */
const bank=[...offlineQuestions,...freshLocalQuestionReserve,...curatedHebrewQuestions];

test('a 3x3 board shows exactly two topic lines, and a topic line deals a question from its topic',async({page})=>{
 await useOfflineQuestionFixtures(page);
 await page.addInitScript(()=>{
  if(sessionStorage.getItem('topic-lines-seeded'))return;sessionStorage.setItem('topic-lines-seeded','1');
  localStorage.setItem('trivia-welcome-dismissed-v1','1');localStorage.setItem('trivia-tutorial-seen-v1','1');
  localStorage.setItem('trivia-player-name','גיא');localStorage.setItem('trivia-mode-v2','solo');
  localStorage.setItem('trivia-stage-id-v1','1');localStorage.setItem('trivia-stage-run-id','local-topic-lines-qa');
 });
 await page.goto('/');
 await page.locator('svg.board').waitFor();
 const lines=page.locator('svg.board g.topic-line');
 await expect(lines).toHaveCount(2);
 await expect(page.getByTestId('topic-line-legend').locator('.topic-line-chip')).toHaveCount(2);
 const first=lines.first();
 const topic=await first.getAttribute('data-topic');
 const edge=(await first.getAttribute('data-testid'))!.replace('topic-line-','');
 // The same run keeps the same lines after a reload.
 await page.reload();await page.locator('svg.board').waitFor();
 await expect(page.locator('svg.board g.topic-line').first()).toHaveAttribute('data-testid','topic-line-'+edge);
 const [kind,r,c]=edge.split('-');const row=Number(r)+1,col=Number(c)+1;
 const tut=page.getByRole('dialog',{name:'הסבר משחק'});if(await tut.isVisible().catch(()=>false))await tut.getByRole('button',{name:'דלג או סיים'}).click();
 await drawAdjacentForQA(page,[row,col],kind==='h'?[row,col+1]:[row+1,col]);
 const quiz=page.getByRole('dialog',{name:'שאלת טריוויה'});
 await expect(quiz).toBeVisible();
 const text=(await quiz.locator('h2').innerText()).trim();
 const item=bank.find(q=>q.text===text);
 expect(item,'question comes from the bundled bank: '+text).toBeTruthy();
 expect(topicForQuestion(item!.category,item!.text)).toBe(topic);
});
