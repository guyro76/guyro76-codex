import {test,expect} from '@playwright/test';
import {offlineQuestions} from '../src/lib/offlineQuestions';
import {englishQuestions} from '../src/lib/englishQuestions';
import {internationalQuestions} from '../src/lib/internationalQuestions';

// Ten independent checks, two per locale, each executed by desktop and mobile Chromium projects.
// No billed agents, no third-party AI calls, and no user information collected.
const locales=[
 {id:'he',dir:'rtl',credit:/גיא רוזנברג/},
 {id:'en',dir:'ltr',credit:/Guy Rosenberg/},
 {id:'ru',dir:'ltr',credit:/Розенберг/},
 {id:'fr',dir:'ltr',credit:/Rosenberg/},
 {id:'ar',dir:'rtl',credit:/روزنبرغ/}
] as const;
for(const locale of locales){
 test('QA '+locale.id+' #1: native language, RTL/LTR, six skins, saved preference and footer',async({page})=>{
  await page.addInitScript(lang=>{
   localStorage.setItem('trivia-tutorial-seen-v1','1');
   localStorage.setItem('trivia-player-name','QA Tester');
   localStorage.setItem('trivia-language',lang);
  },locale.id);
  await page.goto('/');
  const app=page.locator('main.trivia-app');
  await expect(app).toHaveAttribute('lang',locale.id);
  await expect(app).toHaveAttribute('dir',locale.dir);
  await expect(page.locator('.locale-switch button[lang="'+locale.id+'"]')).toHaveAttribute('aria-pressed','true');
  await page.locator('.skin-palette-trigger').click();
  await expect(page.locator('.skin-picker-item')).toHaveCount(6);
  await page.locator('.skin-picker-item').last().click();
  await expect(app).toHaveClass(/skin-future/);
  const credit=page.locator('#app-footer');
  await expect(credit).toContainText(locale.credit);
  const style=await credit.locator('.game-author-credit-copy').evaluate(el=>{
   const c=getComputedStyle(el);return {weight:Number(c.fontWeight),size:parseFloat(c.fontSize)};
  });
  expect(style.weight).toBeGreaterThanOrEqual(900);
  expect(style.size).toBeGreaterThanOrEqual(17);
  await page.reload();
  await expect(page.locator('main.trivia-app.skin-future')).toBeVisible();
  await expect(page.locator('main.trivia-app')).toHaveAttribute('dir',locale.dir);
 });
 test('QA '+locale.id+' #2: four-option native trivia and playable intermission',async({page})=>{
  const question=locale.id==='he'?offlineQuestions[0]:locale.id==='en'?englishQuestions[0]:internationalQuestions.find(q=>q.locale===locale.id);
  if(!question)throw Error('Missing trivia seed for '+locale.id);
  await page.addInitScript(({lang,q})=>{
   localStorage.setItem('trivia-tutorial-seen-v1','1');
   localStorage.setItem('trivia-player-name','QA Tester');
   localStorage.setItem('trivia-language',lang);
   localStorage.setItem('trivia-mode-v2','solo');
   localStorage.setItem('trivia-stage-id-v1','1');
   localStorage.setItem('trivia-stage-run-id','local-qa-'+lang);
   localStorage.setItem('trivia-local-question',JSON.stringify({
    id:q.id,text:q.text,answers:q.answers,edge:'h-0-0',deadline_at:null,extensions:0
   }));
  },{lang:locale.id,q:question});
  await page.goto('/');
  const quiz=page.locator('.quiz-card').last();
  await expect(quiz).toBeVisible();
  await expect(quiz.locator('h2')).toContainText(question.text);
  await expect(quiz.locator('.answer-option')).toHaveCount(4);
  expect(new Set(question.answers).size).toBe(4);
  await page.evaluate(()=>{
   localStorage.removeItem('trivia-local-question');
   localStorage.setItem('trivia-local-game-v1',JSON.stringify({
    rows:3,cols:3,mode:'solo',turn:'host',edges:{},
    owners:{'0-0':'host','0-1':'host','0-2':'host','1-0':'host','1-1':'host','1-2':'host','2-0':'host','2-1':'host','2-2':'host'},
    scores:{host:9,guest:0,bot:0}
   }));
   localStorage.setItem('trivia-stage-started-v1','true');
  });
  await page.reload();
  await expect(page.locator('.lumen-stage-reveal')).toBeVisible();
  await expect(page.locator('.lumen-intermission-choices button')).toHaveCount(2);
  await page.locator('.lumen-intermission-choices button').first().click();
  await expect(page.locator('.lumen-word-game input')).toBeVisible();
  const answer=({he:'תפוח',en:'apple',ru:'яблоко',fr:'pomme',ar:'تفاحة'} as Record<string,string>)[locale.id];
  await page.locator('.lumen-word-game input').fill(answer);
  await page.locator('.lumen-word-game .lumen-cta').click();
  await expect(page.locator('.lumen-prize-won')).toBeVisible();
 });
}
