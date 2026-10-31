import {test,expect} from '@playwright/test';

test('fifth stage draws guaranteed loot then automatically opens a new localized bonus quiz; a reward cannot be collected twice',async({page})=>{
 await page.addInitScript(()=>{
   if(sessionStorage.getItem('trivia-bonus-stage-qa-ready'))return;
   sessionStorage.setItem('trivia-bonus-stage-qa-ready','1');
   localStorage.setItem('trivia-tutorial-seen-v1','true');
   localStorage.setItem('trivia-welcome-dismissed-v1','true');
   localStorage.setItem('trivia-player-name','טסטר');
   localStorage.setItem('trivia-stage-id-v1','5');
   localStorage.setItem('trivia-stage-completed-v1','4');
   localStorage.setItem('trivia-stage-started-v1','true');
   localStorage.setItem('trivia-stage-run-id','local-bonus-stage-qa');
   localStorage.setItem('trivia-mode-v2','solo');
   const owners=Object.fromEntries(Array.from({length:16},(_,i)=>[Math.floor(i/4)+'-'+i%4,'host']));
   localStorage.setItem('trivia-local-game-v1',JSON.stringify({
     rows:4,cols:4,mode:'solo',turn:'host',edges:{},owners,scores:{host:16,guest:0,bot:0}
   }));
   localStorage.setItem('trivia-local-rewards',JSON.stringify({
     credits:{host:0,guest:0},charms:{host:0,guest:0},
     wallet:{stars:0,fruits:0,diamonds:0}
   }));
 });
 await page.goto('/');
 const dialog=page.getByRole('dialog',{name:'משחק הביניים ופרסי השלב'});
 await expect(dialog).toBeVisible({timeout:12000});
 await expect(dialog.getByTestId('stage-guaranteed-gifts')).toContainText('+25');
 await expect(dialog.getByTestId('bonus-question')).toBeVisible({timeout:8000});
 await expect(dialog.getByTestId('bonus-question')).toContainText('כוכב הלכת האדום');
 await dialog.getByTestId('bonus-question').getByRole('button',{name:/מאדים/}).click();
 await expect(dialog.locator('.lumen-prize-won')).toContainText('30 קרדיטים');
 const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-rewards')||'{}'));
 await expect.poll(async()=>(await read()).credits?.host).toBe(55);
 await expect.poll(async()=>(await read()).wallet?.stars).toBe(3);
 await expect.poll(async()=>(await read()).wallet?.diamonds).toBe(1);
 await page.reload();
 await expect.poll(async()=>(await read()).credits?.host).toBe(55);
 await expect(dialog.locator('.lumen-prize-won')).toContainText('30 קרדיטים');
 const rows=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-collectible-album-v1')||'[]'));
 const row=rows.find((item:{matchId:string})=>item.matchId==='local-bonus-stage-qa');
 expect(row).toMatchObject({clearRewarded:true,played:true,game:'quiz',prize:'30 קרדיטים'});
});

test('captured square shows animated liquid, bold nickname, customized icon, and fireworks; audio test can be clicked',async({page})=>{
 await page.addInitScript(()=>{
   localStorage.setItem('trivia-tutorial-seen-v1','true');
   localStorage.setItem('trivia-welcome-dismissed-v1','true');
   localStorage.setItem('trivia-player-name','עדי');
   localStorage.setItem('trivia-personal-choice',JSON.stringify({color:'#358CFF',avatar:'🦊'}));
   localStorage.setItem('trivia-local-game-v1',JSON.stringify({
     rows:3,cols:3,mode:'solo',turn:'host',edges:{},
     owners:{'0-0':'host'},scores:{host:1,guest:0,bot:0}
   }));
 });
 await page.goto('/');
 const tile=page.locator('svg.board .capture-tile[data-square="0-0"]');
 await expect(tile).toBeVisible();
 await expect(tile.locator('.capture-liquid-rise')).toHaveCount(1);
 await expect(tile.locator('.capture-liquid-wave')).toHaveCount(1);
 await expect(tile.locator('.capture-firework-spark')).toHaveCount(8);
 await expect(tile.locator('.capture-firework-ring')).toHaveCount(1);
 await expect(tile.locator('.capture-player-name-object span')).toContainText('עדי');
 await expect(tile.locator('.capture-player-icon-object')).toBeVisible();
 const animated=await tile.locator('.capture-liquid-rise').evaluate(el=>({
   name:getComputedStyle(el).animationName,
   duration:parseFloat(getComputedStyle(el).animationDuration)
 }));
 expect(animated.name).toContain('captureLiquidSlowFill');
 expect(animated.duration).toBeGreaterThanOrEqual(1.5);
 const testButton=page.getByTestId('trivia-audio-test');
 await expect(testButton).toBeVisible();
 await testButton.click();
 await expect(page.locator('.status-line')).toContainText('בדיקת צליל');
 await expect(page.getByTestId('trivia-sound-toggle')).toHaveAttribute('aria-pressed','true');
});
