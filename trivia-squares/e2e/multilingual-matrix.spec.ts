import {test,expect,type Page} from '@playwright/test';
import {localeWords} from '../src/lib/intermissionLocales';

type Locale='he'|'en'|'ru'|'fr'|'ar';
const locale=(process.env.QA_LOCALE||'he') as Locale;
const profile=process.env.QA_PROFILE||'visual';
const dir=locale==='he'||locale==='ar'?'rtl':'ltr';
const titles:Record<Locale,string>={
 he:'טריוויה ריבועים',en:'TRIVIA SQUARES',ru:'Квадраты викторины',
 fr:'Carrés Quiz',ar:'مربعات المعلومات'
};
async function prepare(page:Page,completed=false,game='wheel'){
 await page.addInitScript(({code,finished,kind})=>{
   localStorage.setItem('trivia-tutorial-seen-v1','1');
   localStorage.setItem('trivia-language',code);
   localStorage.setItem('trivia-player-name','QA Player');
   localStorage.setItem('trivia-mode-v2','solo');
   localStorage.setItem('trivia-stage-id-v1','1');
   localStorage.setItem('trivia-stage-run-id','local-qa-'+code+'-'+kind);
   if(finished){
     const owners:Record<string,string>={};
     for(let row=0;row<3;row++)for(let col=0;col<3;col++)owners[row+'-'+col]='host';
     localStorage.setItem('trivia-local-game-v1',JSON.stringify({
       rows:3,cols:3,mode:'solo',turn:'host',edges:{},owners,
       scores:{host:9,guest:0,bot:0}
     }));
   }
 },{code:locale,finished:completed,kind:game});
 await page.goto('/');
 await expect(page.locator('main.trivia-app')).toHaveAttribute('lang',locale);
 await expect(page.locator('main.trivia-app')).toHaveAttribute('dir',dir);
}
if(profile==='visual'){
 test('QA visual: native language, bidirectionality, no overflow and full creator credit',async({page})=>{
  await prepare(page);
  await expect(page.locator('html')).toHaveAttribute('lang',locale);
  await expect(page.locator('h1').first()).toBeVisible();
  const main=page.locator('main.trivia-app');
  await expect(main.locator('svg.board')).toBeVisible();
  await expect(page.locator('.locale-switch button[lang="'+locale+'"]')).toHaveAttribute('aria-pressed','true');
  const credit=page.locator('#app-footer');
  await credit.scrollIntoViewIfNeeded();
  await expect(credit).toBeVisible();
  await expect(credit).toContainText('2026');
  await expect(credit).toContainText('©');
  const styles=await credit.locator('.game-author-credit-copy').evaluate(e=>{
   const s=getComputedStyle(e);return{weight:parseInt(s.fontWeight,10),size:parseFloat(s.fontSize)};
  });
  expect(styles.weight).toBeGreaterThanOrEqual(900);
  expect(styles.size).toBeGreaterThanOrEqual(17);
  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
  expect(width.scroll).toBeLessThanOrEqual(width.viewport+12);
 });
 test('QA visual: six skin choices save independently of language and stage',async({page})=>{
  await prepare(page);
  const open=page.locator('.skin-palette-trigger');
  await open.click();
  const choice=page.locator('.skin-picker-options button');
  await expect(choice).toHaveCount(6);
  await choice.nth(5).click();
  await expect(page.locator('main.skin-future')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('trivia-skin-v1'))).toBe('future');
  await page.reload();
  await expect(page.locator('main.trivia-app')).toHaveAttribute('lang',locale);
  await expect(page.locator('main.skin-future')).toBeVisible();
 });
}else{
 test('QA gameplay: optional prize wheel awards one persistent reward',async({page})=>{
   await prepare(page,true,'wheel');
   const reveal=page.locator('.lumen-stage-reveal');
   await expect(reveal).toBeVisible();
   await reveal.locator('.lumen-intermission-choices button').nth(1).click();
   await expect(reveal.locator('.lumen-wheel-game')).toBeVisible();
   await reveal.locator('.lumen-wheel-game .lumen-cta').click();
   await expect(reveal.locator('.lumen-prize-won')).toBeVisible();
   const rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-collectible-album-v1')||'[]'));
   expect(rows.some((r:{played:boolean;game?:string})=>r.played&&r.game==='wheel')).toBe(true);
 });
 test('QA gameplay: word puzzle accepts the locale-specific word and persists its prize',async({page})=>{
   await prepare(page,true,'word');
   const reveal=page.locator('.lumen-stage-reveal');
   await expect(reveal).toBeVisible();
   await reveal.locator('.lumen-intermission-choices button').first().click();
   await expect(reveal.locator('#lumen-word-guess')).toBeVisible();
   await reveal.locator('#lumen-word-guess').fill(localeWords[locale][3].answer);
   await reveal.locator('.lumen-word-game .lumen-cta').click();
   await expect(reveal.locator('.lumen-prize-won')).toBeVisible();
   const prize=await page.evaluate(()=>{
    const entries=JSON.parse(localStorage.getItem('trivia-local-collectible-album-v1')||'[]');
    return entries.find((r:{played:boolean;game?:string})=>r.played&&r.game==='word')?.prize;
   });
   expect(prize).toBe('15 קרדיטים');
 });
 test('QA gameplay: board dots available to touch, result and next-stage controls exist',async({page})=>{
   await prepare(page,true,'advance');
   await expect(page.locator('svg.board')).toBeVisible();
   await expect(page.locator('svg.board circle[role="button"]')).toHaveCount(16);
   await expect(page.locator('.lumen-stage-reveal .lumen-next-button')).toBeVisible();
   const switched=await page.locator('.locale-switch').getAttribute('aria-label');
   expect(switched).toBeTruthy();
 });
}
