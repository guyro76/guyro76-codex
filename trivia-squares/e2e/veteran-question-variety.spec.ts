import {test,expect} from '@playwright/test';
import {drawAdjacentForQA} from './gestureQA';
import {offlineQuestions} from '../src/lib/offlineQuestions';
import {freshLocalQuestionReserve} from '../src/lib/freshQuestions';
import {languageQuestions} from '../src/lib/languageQuestions';

// Regression for strict no-repeat history: a veteran has already seen every varied
// question, and the server offers only unseen city questions. Do not reintroduce
// seen questions merely to improve topic variety.
const canon=(t:string)=>t.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const varied=[...offlineQuestions.filter(q=>!(q as {locale?:string}).locale||(q as {locale?:string}).locale==='he'),
 ...freshLocalQuestionReserve.filter(q=>q.locale==='he'),...languageQuestions.filter(q=>q.locale==='he')];
const cities=Array.from({length:100},(_,i)=>({id:i+1,locale:'he',category:'גאוגרפיה',
 text:'באיזו מדינה נמצאת העיר בדיקה'+(i+1)+'?',answers:['צרפת','איטליה','ספרד','גרמניה'],correct:0,difficulty:2}));
const answerKey=new Map<string,number>([...varied.map(q=>[q.text,q.correct] as [string,number]),...cities.map(q=>[q.text,q.correct] as [string,number])]);

test('veteran with only unseen city questions never gets recycled varied questions',async({page},info)=>{
 test.skip(info.project.name!=='chromium-desktop','Selection logic is device independent');
 test.setTimeout(60_000);
 await page.route('**/rest/v1/rpc/trivia_local_culture_batch**',r=>r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'[]'}));
 await page.route('**/rest/v1/rpc/trivia_local_question_batch**',async r=>{
  const body=JSON.parse(r.request().postData()||'{}');
  const rows=Number(body.p_after_id)>0?[]:cities;
  await r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(rows)});
 });
 await page.addInitScript(({history,ids})=>{
  localStorage.setItem('trivia-welcome-dismissed-v1','1');
  localStorage.setItem('trivia-tutorial-seen-v1','1');
  localStorage.setItem('trivia-player-name','עדי');
  localStorage.setItem('trivia-question-text-history-v1',JSON.stringify(history));
  localStorage.setItem('trivia-used-question-ids',JSON.stringify(ids));
 },{history:varied.map(q=>canon(q.text)),ids:varied.map(q=>q.id)});
 await page.goto('/');
 const quiz=page.getByRole('dialog',{name:'שאלת טריוויה'});
 const shown:string[]=[];
 for(const [a,b] of [[[1,1],[1,2]],[[2,1],[2,2]],[[3,1],[3,2]],[[4,1],[4,2]],[[1,3],[1,4]],[[2,3],[2,4]]] as [[number,number],[number,number]][]){
  await drawAdjacentForQA(page,a,b);
  await expect(quiz).toBeVisible();
  while(await quiz.count()){
   const text=(await quiz.locator('h2').innerText()).trim();
   shown.push(text);
   const key=[...answerKey.entries()].find(([t])=>text===t||text.includes(t));
   expect(key,'unknown question '+text).toBeTruthy();
   await quiz.locator('button.answer-option').nth(key![1]).click();
   await page.waitForTimeout(400);
  }
 }
 const isCity=shown.map(t=>t.startsWith('באיזו מדינה נמצאת העיר בדיקה'));
 expect(shown.length).toBeGreaterThan(0);
 expect(isCity.every(Boolean),'Only unseen server questions may be displayed').toBe(true);
 expect(new Set(shown).size).toBe(shown.length);
 expect(shown.every(text=>!varied.some(q=>text===q.text||text.includes(q.text)))).toBe(true);
});
