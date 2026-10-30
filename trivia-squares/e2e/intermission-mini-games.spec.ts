import {test,expect} from '@playwright/test';

for(const game of [
 {kind:'balloons',open:'בלוני ההפתעה',action:'פוצץ בלון 1'},
 {kind:'cake',open:'עוגת ההפתעה',action:'חתוך פרוסת פרס'}
] as const){
 test('intermission '+game.kind+' grants exactly one local reward and survives reload',async({page})=>{
  await page.addInitScript(()=>{
   if(localStorage.getItem('trivia-minigame-test-seeded'))return;
   localStorage.setItem('trivia-minigame-test-seeded','true');
   localStorage.setItem('trivia-tutorial-seen-v1','true');
   localStorage.setItem('trivia-player-name','עדי');
   localStorage.setItem('trivia-stage-id-v1','1');
   localStorage.setItem('trivia-stage-started-v1','true');
   localStorage.setItem('trivia-mode-v2','solo');
   localStorage.setItem('trivia-stage-run-id','local-mini-qa');
   const owners=Object.fromEntries(Array.from({length:9},(_,i)=>[Math.floor(i/3)+'-'+i%3,'host']));
   localStorage.setItem('trivia-local-game-v1',JSON.stringify({
    rows:3,cols:3,mode:'solo',turn:'host',edges:{},owners,scores:{host:9,guest:0,bot:0}
   }));
  });
  await page.goto('/');
  const reward=page.getByRole('dialog',{name:'משחק הביניים ופרסי השלב'}).locator('.lumen-stage-reveal');
  await expect(reward).toBeVisible();
  await reward.getByRole('button',{name:new RegExp(game.open)}).click();
  await reward.getByRole('button',{name:game.action}).click();
  await expect(reward.locator('.lumen-prize-won')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>{
    const rows=JSON.parse(localStorage.getItem('trivia-local-collectible-album-v1')||'[]');
    return rows.find((row:{matchId:string})=>row.matchId==='local-mini-qa')?.game;
  })).toBe(game.kind);
  await expect(reward.locator('.lumen-intermission-choices')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.lumen-stage-reveal .lumen-prize-won')).toBeVisible();
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-collectible-album-v1')||'[]'));
  expect(stored.filter((row:{matchId:string})=>row.matchId==='local-mini-qa')).toHaveLength(1);
 });
}
