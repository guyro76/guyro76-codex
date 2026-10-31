import {test,expect} from '@playwright/test';

test('the liquid fill is clearly visible and replayable, without awarding squares',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('trivia-tutorial-seen-v1','true');
  localStorage.setItem('trivia-welcome-dismissed-v1','1');
  localStorage.setItem('trivia-player-name','טסטר');
 });
 await page.goto('/');
 const preview=page.getByTestId('trivia-liquid-preview');
 await expect(preview).toBeVisible();
 await preview.click();
 const overlay=page.getByTestId('trivia-liquid-overlay');
 await expect(overlay).toBeVisible();
 const liquid=overlay.locator('.capture-liquid-rise');
 await expect(liquid).toBeVisible();
 const css=await liquid.evaluate(el=>({
  duration:getComputedStyle(el).animationDuration,
  name:getComputedStyle(el).animationName,
  fill:getComputedStyle(el).animationFillMode
 }));
 expect(parseFloat(css.duration)).toBeGreaterThanOrEqual(1.5);
 expect(css.name).toContain('captureLiquidSlowFill');
 expect(css.fill).toContain('both');
 await expect(overlay.locator('.capture-liquid-wave')).toHaveCount(1);
 await expect(overlay.locator('.capture-bubble')).toHaveCount(3);
 await expect(overlay.locator('.capture-player-name-object')).toBeVisible();
 await expect(overlay).toHaveCount(0,{timeout:6000});
 // Preview does not mark a new edge or capture any square.
 const data=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-game-v1')||'{}'));
 expect(Object.keys(data.edges||{})).toHaveLength(0);
 expect(Object.keys(data.owners||{})).toHaveLength(0);
 await preview.click();
 await expect(overlay).toBeVisible();
});

test('sound check starts a full multi-effect sequence and reports engine state',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('trivia-tutorial-seen-v1','true');
  localStorage.setItem('trivia-welcome-dismissed-v1','1');
  localStorage.setItem('trivia-player-name','טסטר');
  localStorage.setItem('trivia-sound-muted','false');
  localStorage.setItem('trivia-sound-volume','85');
  const Audio=window.AudioContext||(window as Window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
  if(!Audio)return;
  const original=Audio.prototype.createOscillator;
  Audio.prototype.createOscillator=function(...args:[]){
    const w=window as Window&{__soundPreviewOsc?:number};
    w.__soundPreviewOsc=(w.__soundPreviewOsc||0)+1;
    return original.apply(this,args);
  };
 });
 await page.goto('/');
 await page.getByTestId('trivia-audio-test').click();
 await expect.poll(()=>page.evaluate(()=>(window as Window&{__soundPreviewOsc?:number}).__soundPreviewOsc||0)).toBeGreaterThanOrEqual(8);
 await expect(page.getByTestId('trivia-audio-state')).toContainText('הצליל מופעל בדפדפן',{timeout:4500});
 await expect(page.getByTestId('trivia-sound-toggle')).toHaveAttribute('aria-pressed','true');
});
