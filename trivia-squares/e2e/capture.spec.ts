import {test,expect} from '@playwright/test';

test('captured tile is premium and its owner can be corrected and persisted',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('trivia-tutorial-seen-v1','true');
    localStorage.setItem('trivia-player-name','טסטר');
    localStorage.setItem('trivia-stage-id-v1','1');
    localStorage.setItem('trivia-local-game-v1',JSON.stringify({
      rows:3,cols:3,mode:'local',turn:'guest',
      edges:{'h-0-0':'host','h-1-0':'guest','v-0-0':'guest','v-0-1':'host'},
      owners:{'0-0':'host'},scores:{host:1,guest:0,bot:0}
    }));
    localStorage.setItem('trivia-capture-settings-v1',JSON.stringify({
      style:'lumen',ownerMode:'auto_with_override',guestName:'שחקן שני',guestColor:'#F97316',guestAvatar:'👑'
    }));
  });
  await page.goto('/');
  const tile=page.locator('svg.board .capture-tile[data-square="0-0"]');
  await expect(tile).toBeVisible();
  await expect(tile).toHaveAttribute('data-capture-style','lumen');
  await page.getByRole('group',{name:'סגנון כיבוש'}).getByRole('button',{name:/ניאון/}).click();
  await expect(tile).toHaveAttribute('data-capture-style','neon');
  await tile.click();
  const chooser=page.getByRole('dialog',{name:'מי סגר את הריבוע?'});
  await expect(chooser).toBeVisible();
  await chooser.getByRole('button',{name:/שחקן שני/}).click();
  await expect(chooser).toHaveCount(0);
  await expect.poll(async()=>page.evaluate(()=>{
    const state=JSON.parse(localStorage.getItem('trivia-local-game-v1')||'{}');
    return [state.owners?.['0-0'],state.scores?.host,state.scores?.guest].join(',');
  })).toBe('guest,0,1');
  await page.reload();
  await expect(page.locator('svg.board .capture-tile[data-square="0-0"]')).toHaveAttribute('data-capture-style','neon');
  await expect(page.locator('svg.board .capture-tile[data-square="0-0"]')).toHaveAttribute('data-owner','שחקן שני');
});

test('drawing lock explains the missing player name next to the board',async({page})=>{
  await page.addInitScript(()=>{localStorage.setItem('trivia-tutorial-seen-v1','true');localStorage.removeItem('trivia-player-name');});
  await page.goto('/');
  await expect(page.getByLabel('כדי לצייר קו ראשון, הכנס שם שחקן')).toBeVisible();
  await page.getByLabel('כדי לצייר קו ראשון, הכנס שם שחקן').fill('אורח');
  await expect(page.getByLabel('כדי לצייר קו ראשון, הכנס שם שחקן')).toHaveCount(0);
});
