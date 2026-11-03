import {test,expect} from '@playwright/test';

/* Owner request 2026-11-03: a random between-stage mini-game opens by itself before the next
 * stage; the player does not choose. Every game must open fully in view on a phone and be playable. */
const GAMES=[
 {kind:'word',el:'#lumen-word-guess'},
 {kind:'wheel',el:'.lumen-wheel-game .lumen-cta'},
 {kind:'balloons',el:'.lumen-balloon-rack'},
 {kind:'cake',el:'.lumen-cake-target'},
 {kind:'scratch',el:'[data-testid="scratch-ticket"]'},
 {kind:'sword',el:'[data-testid="challenge-sword"]'},
 {kind:'scissors',el:'[data-testid="challenge-scissors"]'},
 {kind:'pairs',el:'section[aria-label="זיכרון זוגות"] button'},
 {kind:'sequence',el:'section[aria-label] button'},
 {kind:'tictactoe',el:'.intermission-tictactoe button'},
 {kind:'quiz',el:'[data-testid="bonus-question"] button'}
] as const;

async function finishStage(page:import('@playwright/test').Page,kind:string|null,runId:string){
 await page.addInitScript(({kind,runId})=>{
  if(sessionStorage.getItem('auto-intermission-seeded'))return;
  sessionStorage.setItem('auto-intermission-seeded','1');
  localStorage.setItem('trivia-tutorial-seen-v1','1');
  localStorage.setItem('trivia-welcome-dismissed-v1','1');
  localStorage.setItem('trivia-player-name','גיא');
  localStorage.setItem('trivia-mode-v2','solo');
  localStorage.setItem('trivia-stage-id-v1','1');
  localStorage.setItem('trivia-stage-completed-v1','0');
  localStorage.setItem('trivia-stage-started-v1','true');
  localStorage.setItem('trivia-stage-run-id',runId);
  if(kind)localStorage.setItem('trivia-intermission-pick-v1',JSON.stringify({next:kind}));
  const owners=Object.fromEntries(Array.from({length:9},(_,i)=>[Math.floor(i/3)+'-'+i%3,'host']));
  localStorage.setItem('trivia-local-game-v1',JSON.stringify({rows:3,cols:3,mode:'solo',turn:'host',edges:{},owners,scores:{host:9,guest:0,bot:0}}));
 },{kind,runId});
 await page.goto('/');
 return page.getByRole('dialog',{name:'משחק הביניים ופרסי השלב'});
}

for(const game of GAMES){
 test('mini-game '+game.kind+' opens by itself, in view, with no choice list',async({page})=>{
  const dialog=await finishStage(page,game.kind,'local-auto-'+game.kind);
  await expect(dialog).toBeVisible({timeout:10000});
  const target=dialog.locator(game.el).first();
  await expect(target).toBeVisible({timeout:8000});
  await expect(target).toBeInViewport();
  await expect(dialog.getByTestId('selected-intermission')).toBeInViewport();
  await expect(dialog.locator('.lumen-intermission-choices')).toHaveCount(0);
  // The next stage is offered only after the mini-game (or an explicit skip).
  await expect(dialog.locator('.lumen-next-button')).toHaveCount(0);
  await dialog.getByRole('button',{name:/^דלג/}).first().click();
  await expect(dialog.locator('.lumen-next-button')).toBeVisible();
 });
}

test('the draw is random, survives a reload and never repeats the previous game',async({page})=>{
 const dialog=await finishStage(page,null,'local-auto-random');
 await expect(dialog.getByTestId('selected-intermission')).toBeVisible({timeout:10000});
 const first=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-intermission-pick-v1')||'{}'));
 expect(first.stages['local-auto-random']).toBeTruthy();
 expect(first.last).toBe(first.stages['local-auto-random']);
 const label=await dialog.getByTestId('selected-intermission').innerText();
 await page.reload();
 await expect(dialog.getByTestId('selected-intermission')).toHaveText(label,{timeout:10000});
});
