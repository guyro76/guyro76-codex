import {test,expect} from '@playwright/test';

// Runs in both mobile Chromium (Android-like touch viewport) and desktop.
// No live account, payment, or mutation of Supabase production data is needed.
test('stage completion automatically offers a minigame, earns credits and persists the prize',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('trivia-tutorial-seen-v1','1');
    localStorage.setItem('trivia-player-name','גיא');
    localStorage.setItem('trivia-mode-v2','solo');
    localStorage.setItem('trivia-stage-id-v1','1');
    localStorage.setItem('trivia-stage-completed-v1','0');
    const edges:Record<string,string>={};
    const owners:Record<string,string>={};
    for(let row=0;row<=3;row++)for(let col=0;col<3;col++)edges['h-'+row+'-'+col]='host';
    for(let row=0;row<3;row++)for(let col=0;col<=3;col++)edges['v-'+row+'-'+col]='host';
    for(let row=0;row<3;row++)for(let col=0;col<3;col++)owners[row+'-'+col]='host';
    localStorage.setItem('trivia-local-game-v1',JSON.stringify({
      rows:3,cols:3,mode:'solo',turn:'host',edges,owners,
      scores:{host:9,guest:0,bot:0}
    }));
    localStorage.setItem('trivia-local-rewards',JSON.stringify({
      credits:{host:0,guest:0},charms:{host:0,guest:0},
      wallet:{stars:0,fruits:0,diamonds:0}
    }));
  });
  await page.goto('/');
  const reward=page.getByRole('dialog',{name:'משחק הביניים ופרסי השלב'});
  await expect(reward).toBeVisible({timeout:8000});
  await expect(reward.getByRole('heading',{name:/מה בא לך לעשות עם האוצר/})).toBeVisible();
  await reward.getByRole('button',{name:/נחש את המילה/}).click();
  await reward.getByRole('textbox',{name:'מה המילה?'}).fill('תפוח');
  await reward.getByRole('button',{name:/בדוק מילה/}).click();
  await expect(reward.getByText(/15 קרדיטים/)).toBeVisible();
  await reward.getByRole('button',{name:/סגור וחזור ללוח/}).click();
  await expect(reward).toHaveCount(0);
  await expect(page.locator('.arena-quick-wallet')).toContainText('15');
  const persisted=await page.evaluate(()=>({
    rewards:JSON.parse(localStorage.getItem('trivia-local-rewards')||'{}'),
    board:JSON.parse(localStorage.getItem('trivia-local-game-v1')||'{}')
  }));
  expect(persisted.rewards.credits.host).toBe(15);
  expect(Object.keys(persisted.board.owners)).toHaveLength(9);
  await page.reload();
  await expect(page.locator('.arena-quick-wallet')).toContainText('15');
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-rewards')||'{}').credits?.host)).toBe(15);
});
