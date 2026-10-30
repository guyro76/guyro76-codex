import {test,expect} from '@playwright/test';

test('an actual sound test tap schedules original Web Audio oscillators on desktop and mobile',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('trivia-tutorial-seen-v1','1');
  localStorage.setItem('trivia-welcome-dismissed-v1','1');
  localStorage.setItem('trivia-player-name','טסטר');
  localStorage.setItem('trivia-sound-muted','false');
  localStorage.setItem('trivia-sound-volume','85');
  const Audio=(window.AudioContext || (window as Window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext);
  if(!Audio)return;
  const method=Audio.prototype.createOscillator;
  Audio.prototype.createOscillator=function(...args:[]){
   const w=window as Window & {__triviaScheduledTones?:number};
   w.__triviaScheduledTones=(w.__triviaScheduledTones||0)+1;
   return method.apply(this,args);
  };
 });
 await page.goto('/');
 const sound=page.getByTestId('trivia-audio-test');
 await expect(sound).toBeVisible();
 await sound.click();
 await expect.poll(()=>page.evaluate(()=>(window as Window&{__triviaScheduledTones?:number}).__triviaScheduledTones||0)).toBeGreaterThanOrEqual(4);
 await expect(page.getByTestId('trivia-sound-toggle')).toHaveAttribute('aria-pressed','true');
 // This verifies emitted oscillator nodes, not the physical speaker or iOS mute switch.
});
