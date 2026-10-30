import {test,expect} from '@playwright/test';

test('captured tile is premium and its owner can be corrected and persisted',async({page})=>{
  await page.addInitScript(()=>{
    if(localStorage.getItem('trivia-capture-test-seeded'))return;
    localStorage.setItem('trivia-capture-test-seeded','true');
    localStorage.setItem('trivia-tutorial-seen-v1','true');
    localStorage.setItem('trivia-player-name','טסטר');
    localStorage.setItem('trivia-stage-id-v1','1');
    localStorage.setItem('trivia-mode-v2','local');
    localStorage.setItem('trivia-local-game-v1',JSON.stringify({
      rows:3,cols:3,mode:'local',turn:'guest',
      edges:{'h-0-0':'host','h-1-0':'guest','v-0-0':'guest','v-0-1':'host'},
      owners:{'0-0':'host'},scores:{host:1,guest:0,bot:0}
    }));
    localStorage.setItem('trivia-capture-settings-v1',JSON.stringify({
      style:'lumen',ownerMode:'auto_with_override',guestName:'דנה',guestColor:'#F97316',guestAvatar:'👑'
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
  await chooser.getByRole('button',{name:/דנה/}).click();
  await expect(chooser).toHaveCount(0);
  await expect.poll(async()=>page.evaluate(()=>{
    const state=JSON.parse(localStorage.getItem('trivia-local-game-v1')||'{}');
    return [state.owners?.['0-0'],state.scores?.host,state.scores?.guest].join(',');
  })).toBe('guest,0,1');
  await page.reload();
  await expect(page.locator('svg.board .capture-tile[data-square="0-0"]')).toHaveAttribute('data-capture-style','neon');
  await expect(page.locator('svg.board .capture-tile[data-square="0-0"]')).toHaveAttribute('data-owner','דנה');
});

test('drawing lock explains the missing player name next to the board',async({page})=>{
  await page.addInitScript(()=>{localStorage.setItem('trivia-tutorial-seen-v1','true');localStorage.removeItem('trivia-player-name');});
  await page.goto('/');
  await expect(page.getByLabel('כדי לצייר קו ראשון, הכנס שם שחקן')).toBeVisible();
  await page.getByLabel('כדי לצייר קו ראשון, הכנס שם שחקן').fill('אורח');
  await expect(page.getByLabel('כדי לצייר קו ראשון, הכנס שם שחקן')).toHaveCount(0);
});

test('legacy solo player Adi keeps all her squares, points and credits after reload',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('trivia-tutorial-seen-v1','true');
    localStorage.setItem('trivia-player-name','עדי');
    // Reproduce the exact bug: a historical local board had a phantom
    // guest even though the user never configured another real person.
    localStorage.setItem('trivia-mode-v2','local');
    localStorage.setItem('trivia-stage-id-v1','1');
    localStorage.setItem('trivia-local-game-v1',JSON.stringify({
      rows:3,cols:3,mode:'local',turn:'guest',
      edges:{'h-0-0':'guest','h-1-0':'guest','v-0-0':'guest','v-0-1':'guest'},
      owners:{'0-0':'guest'},scores:{host:0,guest:1,bot:0}
    }));
    localStorage.setItem('trivia-capture-settings-v1',JSON.stringify({
      style:'lumen',ownerMode:'auto_with_override',guestName:'שחקן 2',
      guestColor:'#F97316',guestAvatar:'👑'
    }));
    localStorage.setItem('trivia-local-rewards',JSON.stringify({
      credits:{host:10,guest:30},charms:{host:0,guest:1}
    }));
  });
  await page.goto('/');
  const cell=page.locator('svg.board .capture-tile[data-square="0-0"]');
  await expect(cell).toHaveAttribute('data-owner','עדי');
  await expect(page.locator('.scoreboard .score-name')).toContainText(['עדי']);
  await expect.poll(()=>page.evaluate(()=>{
    const board=JSON.parse(localStorage.getItem('trivia-local-game-v1')||'{}');
    const wallet=JSON.parse(localStorage.getItem('trivia-local-rewards')||'{}');
    return [board.mode,board.turn,board.owners['0-0'],board.scores.host,board.scores.guest,wallet.credits.host,wallet.credits.guest,wallet.charms.host].join(',');
  })).toBe('solo,host,host,1,0,40,0,1');
  await expect(page.locator('.scoreboard .player-tile.other')).toHaveCount(0);
  await page.reload();
  await expect(cell).toHaveAttribute('data-owner','עדי');
  await expect(page.locator('.scoreboard .player-tile.other')).toHaveCount(0);
});

test('every chapter changes the board material palette without changing captures',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('trivia-tutorial-seen-v1','true');
    localStorage.setItem('trivia-player-name','עדי');
    localStorage.setItem('trivia-stage-id-v1','7');
    localStorage.setItem('trivia-stage-completed-v1','6');
    localStorage.setItem('trivia-local-game-v1',JSON.stringify({
      rows:4,cols:4,mode:'solo',turn:'host',edges:{},
      owners:{},scores:{host:0,guest:0,bot:0}
    }));
  });
  await page.goto('/');
  await expect(page.locator('main.trivia-app.theme-crystal')).toBeVisible();
  const arena=page.locator('.arena-panel');
  await expect.poll(()=>arena.evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('gradient');
  await expect.poll(()=>arena.evaluate(el=>getComputedStyle(el).getPropertyValue('--world-edge').trim())).toContain('rgba');
});

test('iPhone RTL captured name stays in logical Hebrew order inside an isolated HTML run',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('trivia-tutorial-seen-v1','true');
    localStorage.setItem('trivia-player-name','עדי');
    localStorage.setItem('trivia-mode-v2','solo');
    localStorage.setItem('trivia-stage-id-v1','1');
    localStorage.setItem('trivia-local-game-v1',JSON.stringify({
      rows:3,cols:3,mode:'solo',turn:'host',
      edges:{'h-0-0':'host','h-1-0':'host','v-0-0':'host','v-0-1':'host'},
      owners:{'0-0':'host'},scores:{host:1,guest:0,bot:0}
    }));
  });
  await page.goto('/');
  const tile=page.locator('svg.board .capture-tile[data-square="0-0"]');
  await expect(tile).toHaveAttribute('data-owner','עדי');
  const name=tile.locator('foreignObject.capture-player-name-object div > span');
  await expect(name).toHaveText('עדי');
  await expect(tile.locator('foreignObject.capture-player-name-object div')).toHaveAttribute('dir','rtl');
  await expect(tile.locator('text.capture-player-name')).toHaveCount(0);
  await expect.poll(()=>name.evaluate(element=>getComputedStyle(element).unicodeBidi)).toBe('isolate');
  await page.reload();
  await expect(page.locator('svg.board .capture-tile[data-square="0-0"] foreignObject span')).toHaveText('עדי');
});
