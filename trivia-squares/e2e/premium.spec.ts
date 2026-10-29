import {test,expect} from '@playwright/test';
import {awardPremiumSquares} from '../src/lib/premiumCaptures';
import type {BoardState} from '../src/lib/engine';
import {offlineQuestions} from '../src/lib/offlineQuestions';

const board=(rows=2,cols=2):BoardState=>({
 rows,cols,turn:'host',edges:{},owners:{},scores:{host:0,guest:0,bot:0}
});

test('premium closes only one when a single square remains, without overriding other captures',()=>{
 const current=board();
 current.owners={'0-0':'host','0-1':'guest','1-0':'host'};
 current.scores={host:2,guest:1,bot:0};
 const out=awardPremiumSquares(current,'h-1-1','host',2);
 expect(out.captured).toEqual(['1-1']);
 expect(out.board.owners['1-1']).toBe('host');
 expect(Object.keys(out.board.owners)).toHaveLength(4);
 expect(out.board.scores.host).toBe(3);
 expect(out.board.scores.guest).toBe(1);
 expect(current.owners['1-1']).toBeUndefined();
});

test('premium closes two free neighbouring squares when available, never more than two',()=>{
 const out=awardPremiumSquares(board(),'h-1-0','host',2);
 expect(out.captured).toHaveLength(2);
 expect(out.captured).toContain('0-0');
 expect(out.captured).toContain('1-0');
 expect(out.board.scores.host).toBe(2);
 expect(Object.keys(out.board.owners)).toHaveLength(2);
});

test('six painter-palette skins save chosen AI future theme across reload',async({page})=>{
 await page.addInitScript(()=>{
   localStorage.setItem('trivia-tutorial-seen-v1','true');
   localStorage.setItem('trivia-player-name','עדי');
 });
 await page.goto('/');
 const button=page.getByRole('button',{name:'בחר סקין למשחק'});
 await button.click();
 const group=page.getByRole('group',{name:'ערכות עיצוב'});
 await expect(group.locator('button')).toHaveCount(6);
 await group.getByRole('button',{name:/עתידני AI/}).click();
 await expect(page.locator('main.trivia-app.skin-future')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('trivia-skin-v1'))).toBe('future');
 await page.reload();
 await expect(page.locator('main.trivia-app.skin-future')).toBeVisible();
});

test('sports questions may be disabled and the topic preference survives reload',async({page})=>{
 await page.addInitScript(()=>{
   localStorage.setItem('trivia-tutorial-seen-v1','true');
   localStorage.setItem('trivia-player-name','עדי');
 });
 await page.goto('/');
 await page.getByRole('checkbox',{name:'ספורט'}).uncheck();
 await expect.poll(()=>page.evaluate(()=>{
  return (JSON.parse(localStorage.getItem('trivia-question-topics-v1')||'[]') as string[]).includes('sports');
 })).toBe(false);
 await page.reload();
 await expect(page.getByRole('checkbox',{name:'ספורט'})).not.toBeChecked();
});

test('wrong answer holds green correct and red chosen answer until Continue, preserving board',async({page})=>{
 const q=offlineQuestions.find(item=>item.id===1);
 if(!q)throw Error('Question fixture unavailable');
 await page.addInitScript(question=>{
   localStorage.setItem('trivia-tutorial-seen-v1','true');
   localStorage.setItem('trivia-player-name','עדי');
   localStorage.setItem('trivia-mode-v2','solo');
   localStorage.setItem('trivia-stage-id-v1','1');
   localStorage.setItem('trivia-stage-started-v1','true');
   localStorage.setItem('trivia-local-game-v1',JSON.stringify({
    rows:3,cols:3,mode:'solo',turn:'host',edges:{},owners:{},scores:{host:0,guest:0,bot:0}
   }));
   localStorage.setItem('trivia-local-question',JSON.stringify({
    id:question.id,text:question.text,answers:question.answers,edge:'h-0-0',
    deadline_at:null,extensions:0
   }));
 },q);
 await page.goto('/');
 const quiz=page.getByRole('dialog',{name:'שאלת טריוויה'});
 await expect(quiz).toBeVisible();
 await quiz.getByRole('button',{name:new RegExp(q.answers[0])}).click();
 const feedback=page.getByRole('dialog',{name:'התשובה הנכונה היא:'});
 await expect(feedback).toBeVisible();
 await expect(feedback.locator('.feedback-correct')).toContainText(q.answers[q.correct]);
 await expect(feedback.locator('.feedback-wrong')).toContainText(q.answers[0]);
 await expect(page.locator('svg.board')).toBeVisible();
 await feedback.getByRole('button',{name:'המשך למשחק'}).click();
 await expect(feedback).toHaveCount(0);
 await expect(page.locator('svg.board')).toBeVisible();
 const original=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-game-v1')||'{}'));
 expect(Object.keys(original.edges||{})).toHaveLength(0);
});
