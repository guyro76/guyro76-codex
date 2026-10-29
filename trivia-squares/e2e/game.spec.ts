import { test, expect, type Page } from '@playwright/test';

async function ready(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'טריוויה ריבועים' })).toBeVisible();
  const tutorial = page.getByRole('dialog', { name: 'הסבר משחק' });
  if (await tutorial.isVisible()) await tutorial.getByRole('button', { name: 'דלג או סיים' }).click();
  await expect(page.locator('svg.board')).toBeVisible();
}
async function dotPoint(page: Page, row: number, col: number) {
  const dot = page.locator('svg.board circle[aria-label="נקודה ' + row + ', ' + col + '"]');
  const box=await dot.boundingBox();
  if(!box)throw new Error('Dot not visible '+row+','+col);
  return { x:box.x+box.width/2,y:box.y+box.height/2 };
}
async function draw(page: Page, a:[number,number], b:[number,number]) {
  const start=await dotPoint(page,a[0],a[1]);
  const end=await dotPoint(page,b[0],b[1]);
  await page.mouse.move(start.x,start.y);
  await page.mouse.down();
  await page.mouse.move(end.x,end.y,{steps:12});
  await page.mouse.up();
}

test('player draws with a marker from one dot to a neighbor, then answers the question', async ({page}) => {
  await ready(page);
  const start=await dotPoint(page,1,1);
  const end=await dotPoint(page,1,2);
  await page.mouse.click((start.x+end.x)/2,(start.y+end.y)/2);
  await expect(page.getByRole('dialog',{name:'שאלת טריוויה'})).toHaveCount(0);
  await draw(page,[1,1],[1,2]);
  const quiz=page.getByRole('dialog',{name:'שאלת טריוויה'});
  await expect(quiz).toBeVisible();
  await expect(quiz.getByText('מהי בירת אוסטרליה?')).toBeVisible();
  await quiz.getByRole('button',{name:/קנברה/}).click();
  await expect(quiz).toHaveCount(0);
  await expect(page.getByText('תשובה נכונה!',{exact:false})).toBeVisible();
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-game-v1')||'{}')?.edges?.['h-0-0'])).toBe('host');
});

test('non-adjacent or diagonal dragging never creates an edge',async({page})=>{
  await ready(page);
  await draw(page,[1,1],[2,2]);
  await expect(page.getByRole('dialog',{name:'שאלת טריוויה'})).toHaveCount(0);
  await expect(page.getByText('חבר שתי נקודות סמוכות',{exact:false})).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-game-v1')||'{}'));
  expect(Object.keys(saved.edges||{})).toHaveLength(0);
});

test('successful local move remains on board after page reload',async({page})=>{
  await ready(page);
  await draw(page,[1,1],[1,2]);
  await page.getByRole('dialog',{name:'שאלת טריוויה'}).getByRole('button',{name:/קנברה/}).click();
  await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-game-v1')||'{}')?.edges?.['h-0-0'])).toBe('host');
  await page.reload();
  await expect(page.locator('svg.board')).toBeVisible();
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-game-v1')||'{}'));
  expect(saved.edges['h-0-0']).toBe('host');
  await expect(page.locator('svg.board line[stroke="#358CFF"][stroke-width="10"]')).toHaveCount(1);
});

test('account and legal routes are rendered', async ({page})=>{
  for(const path of ['/privacy','/terms','/accessibility','/account/privacy','/auth/reset-password']){
    await page.goto(path);
    await expect(page.locator('h1').first()).toBeVisible();
    expect((await page.locator('h1').first().innerText()).trim().length).toBeGreaterThan(4);
  }
});

test('online registration requires explicit adult and policy acknowledgements', async ({page})=>{
  await ready(page);
  const google=page.getByRole('button',{name:'התחבר באמצעות Google'});
  await expect(google).toBeDisabled();
  await page.getByRole('checkbox',{name:/אני בן\/בת 18/}).check();
  await expect(google).toBeDisabled();
  await page.getByRole('checkbox',{name:/קראתי את/}).check();
  await expect(google).toBeEnabled();
  // No OAuth request is made by this test.
});

test('local storage deletion actually removes the game preference keys',async({page})=>{
  await page.goto('/cookies');
  await page.evaluate(()=>{
    localStorage.setItem('trivia-local-game-v1','test');
    localStorage.setItem('trivia-personal-choice','test');
    localStorage.setItem('trivia-tutorial-seen-v1','1');
  });
  await page.getByRole('button',{name:'מחק נתוני משחק מקומיים'}).click();
  const saved=await page.evaluate(()=>['trivia-local-game-v1','trivia-personal-choice','trivia-tutorial-seen-v1'].map(k=>localStorage.getItem(k)));
  expect(saved).toEqual([null,null,null]);
  await expect(page.getByRole('status')).toContainText('נמחקו');
});
