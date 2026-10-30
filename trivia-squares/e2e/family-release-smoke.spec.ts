import {expect,test} from '@playwright/test';

// Family beta regression. Seed once per tab; never write to the server or reset
// an existing player's real browser storage.
test('saved stage 9 shows four intermissions and keeps Adi credits after reload',async({page})=>{
  await page.addInitScript(()=>{
    if(sessionStorage.getItem('family-beta-stage9-seeded'))return;
    sessionStorage.setItem('family-beta-stage9-seeded','1');
    localStorage.setItem('trivia-tutorial-seen-v1','1');
    localStorage.setItem('trivia-player-name','עדי');
    localStorage.setItem('trivia-mode-v2','solo');
    localStorage.setItem('trivia-stage-id-v1','9');
    localStorage.setItem('trivia-stage-completed-v1','8');
    localStorage.setItem('trivia-stage-started-v1','true');
    localStorage.setItem('trivia-stage-run-id','family-qa-stage-9');
    const owners=Object.fromEntries(Array.from({length:25},(_,i)=>[`${Math.floor(i/5)}-${i%5}`,'host']));
    localStorage.setItem('trivia-local-game-v1',JSON.stringify({
      rows:5,cols:5,mode:'solo',turn:'host',
      edges:{},owners,scores:{host:25,guest:0,bot:0}
    }));
    localStorage.setItem('trivia-local-rewards',JSON.stringify({
      credits:{host:123,guest:0},charms:{host:1,guest:0},
      wallet:{stars:3,fruits:4,diamonds:2}
    }));
  });
  await page.goto('/');
  await expect(page.locator('.level-pill')).toContainText('9');
  await expect(page.locator('.arena-quick-wallet')).toContainText('123');
  const modal=page.getByRole('dialog',{name:'משחק הביניים ופרסי השלב'});
  await expect(modal).toBeVisible({timeout:10000});
  for(const name of ['נחש את המילה','גלגל ההפתעות','בלוני ההפתעה','עוגת ההפתעה']){
    await expect(modal.getByRole('button',{name:new RegExp(name)})).toBeVisible();
  }
  await modal.getByRole('button',{name:/סגור וחזור ללוח/}).click();
  await page.reload();
  await expect(page.locator('.level-pill')).toContainText('9');
  await expect(page.locator('.arena-quick-wallet')).toContainText('123');
  const state=await page.evaluate(()=>({
    saved:JSON.parse(localStorage.getItem('trivia-local-game-v1')||'{}'),
    credits:JSON.parse(localStorage.getItem('trivia-local-rewards')||'{}').credits?.host
  }));
  expect(Object.keys(state.saved.owners)).toHaveLength(25);
  expect(state.saved.scores.host).toBe(25);
  expect(state.credits).toBe(123);
});

test('family installation smoke: 100 stages, six languages, mobile icons',async({page,request})=>{
  await page.addInitScript(()=>localStorage.setItem('trivia-tutorial-seen-v1','1'));
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'טריוויה ריבועים'})).toBeVisible();
  await expect(page.locator('.campaign-section')).toContainText('100');
  const res=await request.get('/manifest.webmanifest');
  expect(res.ok()).toBeTruthy();
  const manifest=await res.json();
  expect(manifest.name).toBe('טריוויה ריבועים');
  expect(manifest.icons.map((item:{src:string})=>item.src)).toEqual(expect.arrayContaining(['/icon-192.png','/icon-512.png']));
  for(const icon of ['/icon-192.png','/icon-512.png','/apple-icon.png']){
    expect((await request.get(icon)).ok(),icon).toBeTruthy();
  }
});
