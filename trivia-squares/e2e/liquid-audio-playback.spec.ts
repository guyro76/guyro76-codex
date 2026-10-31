import {test,expect} from '@playwright/test';

test('liquid demo visibly fills from bottom and replays without changing the saved board',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('trivia-welcome-dismissed-v1','1');
  localStorage.setItem('trivia-tutorial-seen-v1','1');
  localStorage.setItem('trivia-player-name','טסטר');
  localStorage.setItem('trivia-local-game-v1',JSON.stringify({
   rows:3,cols:3,mode:'solo',turn:'host',
   edges:{},owners:{},scores:{host:0,guest:0,bot:0}
  }));
 });
 await page.goto('/');
 const original=await page.evaluate(()=>localStorage.getItem('trivia-local-game-v1'));
 await page.getByTestId('trivia-liquid-preview').click();
 const modal=page.getByRole('dialog',{name:'כיבוש ריבוע בנוזל'});
 await expect(modal).toBeVisible();
 const svg=page.getByTestId('trivia-liquid-preview-svg');
 const liquid=svg.locator('.capture-liquid-rise');
 const details=await liquid.evaluate(element=>{
  const s=getComputedStyle(element);
  return {name:s.animationName,duration:parseFloat(s.animationDuration)};
 });
 expect(details.name).toContain('triviaLiquidPour');
 expect(details.duration).toBeGreaterThanOrEqual(1.3);
 await expect(svg.locator('.capture-liquid-crest')).toHaveCount(1);
 await expect(svg.locator('.capture-bubble')).toHaveCount(3);
 await expect(svg.locator('.capture-firework-spark')).toHaveCount(8);
 await expect(svg.locator('.capture-player-name-object')).toContainText('טסטר');
 const first=await svg.locator('.capture-tile').getAttribute('data-owner');
 const firstId=await svg.locator('clipPath').getAttribute('id');
 await page.getByTestId('trivia-liquid-replay').click();
 await expect(modal).toBeVisible();
 await expect(svg.locator('clipPath')).not.toHaveAttribute('id',firstId||'');
 await expect(svg.locator('.capture-tile')).toHaveAttribute('data-owner',first||'');
 await page.getByTestId('trivia-liquid-close').click();
 await expect(modal).toHaveCount(0);
 expect(await page.evaluate(()=>localStorage.getItem('trivia-local-game-v1'))).toBe(original);
});

test('sound test opts into playback audio session on supported iOS-style browsers',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('trivia-tutorial-seen-v1','1');
  localStorage.setItem('trivia-welcome-dismissed-v1','1');
  localStorage.setItem('trivia-player-name','טסטר');
  const session={type:'ambient'};
  Object.defineProperty(navigator,'audioSession',{configurable:true,value:session});
 });
 await page.goto('/');
 await page.getByTestId('trivia-audio-test').click();
 await expect.poll(()=>page.evaluate(()=>(navigator as Navigator & {audioSession?:{type:string}}).audioSession?.type)).toBe('playback');
 await expect(page.getByTestId('trivia-sound-toggle')).toHaveAttribute('aria-pressed','true');
});
