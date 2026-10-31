import {test,expect} from '@playwright/test';

test('sound test requests playback audio session to avoid silent-switch-muted Web Audio on supported iOS Safari',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('trivia-tutorial-seen-v1','true');
  localStorage.setItem('trivia-welcome-dismissed-v1','1');
  localStorage.setItem('trivia-player-name','טסטר');
  localStorage.setItem('trivia-sound-muted','false');
  localStorage.setItem('trivia-sound-volume','85');
  Object.defineProperty(navigator,'audioSession',{configurable:true,value:{type:'ambient'}});
 });
 await page.goto('/');
 await page.getByTestId('trivia-audio-test').click();
 await expect.poll(()=>page.evaluate(()=>
  (navigator as Navigator & {audioSession?:{type:string}}).audioSession?.type)).toBe('playback');
 await expect(page.getByTestId('trivia-sound-toggle')).toHaveAttribute('aria-pressed','true');
});

test('liquid preview remains available after Safari playback mode is enabled',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('trivia-tutorial-seen-v1','true');
  localStorage.setItem('trivia-welcome-dismissed-v1','1');
  localStorage.setItem('trivia-player-name','טסטר');
  Object.defineProperty(navigator,'audioSession',{configurable:true,value:{type:'ambient'}});
 });
 await page.goto('/');
 await page.getByTestId('trivia-liquid-preview').click();
 await expect(page.getByTestId('trivia-liquid-overlay')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>
  (navigator as Navigator & {audioSession?:{type:string}}).audioSession?.type)).toBe('playback');
 const animation=await page.locator('[data-testid="trivia-liquid-overlay"] .capture-liquid-rise')
  .evaluate(el=>getComputedStyle(el).animationName);
 expect(animation).toContain('captureLiquidSlowFill');
});
