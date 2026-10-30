import {test,expect} from '@playwright/test';

test('an ordinary correct answer grants 5 credits and 10 knowledge points, including after reload',async({page},info)=>{
  test.skip(info.project.name!=='chromium-desktop','Desktop mouse case; touch gesture covered by game.spec.ts');
  // Exercise the same real first-run path as the passing gameplay E2E.
  // A stored player-name key alone does not activate a local game.
  await page.goto('/');
  const tutorial=page.getByRole('dialog',{name:'הסבר משחק'});
  await expect(tutorial).toBeVisible();
  await tutorial.getByRole('button',{name:'דלג או סיים'}).click();
  await page.getByLabel('שם שחקן (חובה)').fill('טסטר');
  await page.locator('svg.board').scrollIntoViewIfNeeded();
  const dots=page.locator('svg.board circle[aria-label^="נקודה "]');
  const find=async(label:string)=>{
    const box=await page.locator('svg.board circle[aria-label="'+label+'"]').boundingBox();
    if(!box)throw new Error('No dot '+label);
    return {x:box.x+box.width/2,y:box.y+box.height/2};
  };
  await expect(dots.first()).toBeVisible();
  // The premium header can push the board below the first viewport.
  // Playwright mouse coordinates must be in the visible viewport, like game.spec.ts.
  await page.locator('svg.board').scrollIntoViewIfNeeded();
  const a=await find('נקודה 1, 1'),b=await find('נקודה 1, 2');
  await page.mouse.move(a.x,a.y);await page.mouse.down();
  await page.mouse.move(b.x,b.y,{steps:12});await page.mouse.up();
  const question=page.getByRole('dialog',{name:'שאלת טריוויה'});
  await expect(question).toBeVisible();
  await question.getByRole('button',{name:/קנברה/}).click();
  await expect(question).toHaveCount(0);
  await expect(page.locator('.status-line')).toContainText('+5 קרדיטים');
  await expect(page.locator('.arena-quick-wallet')).toContainText('🪙 5');
  await expect(page.locator('.arena-quick-wallet')).toContainText('🧠 10');
  const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-rewards')||'{}'));
  expect((await read()).credits.host).toBe(5);
  expect((await read()).wallet.knowledge_points.host).toBe(10);
  await page.reload();
  expect((await read()).credits.host).toBe(5);
  expect((await read()).wallet.knowledge_points.host).toBe(10);
});

test('Spanish uses original translated stage title and points label',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('trivia-tutorial-seen-v1','true');
    localStorage.setItem('trivia-welcome-dismissed-v1','1');
    localStorage.setItem('trivia-player-name','Lucía');
    localStorage.setItem('trivia-language','es');
  });
  await page.goto('/');
  await expect(page.locator('main.trivia-app')).toHaveAttribute('lang','es');
  await expect(page.locator('.arena-title h2')).toContainText('Camino de las manzanas');
  await expect(page.locator('.arena-quick-wallet span[title="Puntos de conocimiento"]')).toBeVisible();
});
