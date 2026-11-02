import {test,expect,devices} from '@playwright/test';
import {languageQuestions} from '../src/lib/languageQuestions';

// Regression: language-bank questions ("איך אומרים שלום בספרדית?") could not be answered —
// the answer lookup did not include the language bank, so a tap on Android did nothing.
const {defaultBrowserType:_ignored,...pixel}=devices['Pixel 7'];
test.use({...pixel});

const q=languageQuestions.find(item=>item.locale==='he')!;

for(const kind of ['edge','premium_bonus'] as const){
 test('Android: a Hebrew language question ('+kind+') accepts a tapped answer and closes',async({page})=>{
  await page.addInitScript(({q,kind})=>{
   localStorage.setItem('trivia-welcome-dismissed-v1','1');
   localStorage.setItem('trivia-tutorial-seen-v1','1');
   localStorage.setItem('trivia-player-name','עדי');
   localStorage.setItem('trivia-local-question',JSON.stringify({
    id:q.id,text:q.text,answers:q.answers,locale:'he',edge:'h-0-0',kind,
    premiumOwner:kind==='premium_bonus'?'host':undefined,
    deadline_at:new Date(Date.now()+60_000).toISOString(),extensions:0
   }));
  },{q,kind});
  await page.goto('/');
  const quiz=page.getByRole('dialog',{name:'שאלת טריוויה'});
  await expect(quiz).toBeVisible();
  await expect(quiz.locator('h2')).toHaveText(q.text);
  await quiz.locator('button.answer-option').nth(q.correct).tap();
  await expect(quiz).toHaveCount(0);
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('trivia-local-question'))).toBeNull();
 });
}
