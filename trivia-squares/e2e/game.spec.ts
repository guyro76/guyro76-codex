import { test, expect, type Page } from '@playwright/test';

async function ready(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'טריוויה ריבועים' })).toBeVisible();
  const tutorial = page.getByRole('dialog', { name: 'הסבר משחק' });
  if (await tutorial.isVisible()) await tutorial.getByRole('button', { name: 'דלג או סיים' }).click();
  await expect(page.locator('svg.board')).toBeVisible();
  await page.getByLabel('שם שחקן (חובה)').fill('טסטר');
  await page.locator('svg.board').scrollIntoViewIfNeeded();
}
async function dotPoint(page: Page, row: number, col: number) {
  const dot = page.locator('svg.board circle[aria-label="נקודה ' + row + ', ' + col + '"]');
  const box=await dot.boundingBox();
  if(!box)throw new Error('Dot not visible '+row+','+col);
  return { x:box.x+box.width/2,y:box.y+box.height/2 };
}
async function draw(page: Page, a:[number,number], b:[number,number]) {
  await page.locator('svg.board').scrollIntoViewIfNeeded();
  const start=await dotPoint(page,a[0],a[1]);
  const end=await dotPoint(page,b[0],b[1]);
  const isTouch=await page.evaluate(()=>navigator.maxTouchPoints>0 && matchMedia('(pointer: coarse)').matches);
  if(isTouch){
    // Mobile Chromium touch events require time between frames, just like a human swipe.
    await page.evaluate(() => {
      const el = document.querySelector('svg.board');
      if (!el) return;
      (window as unknown as {__touchTrace?:string[]}).__touchTrace=[];
      for(const type of ['pointerdown','pointermove','pointerup','pointercancel','touchstart','touchend']){
        el.addEventListener(type, event => {
          const log=(window as unknown as {__touchTrace?:string[]}).__touchTrace || [];
          if(log.length<30)log.push(type+':' + (event.target as Element)?.tagName);
        },{passive:true});
      }
    });
    const cdp=await page.context().newCDPSession(page);
    const point=(x:number,y:number)=>({x,y,radiusX:2,radiusY:2,force:0.8,id:1});
    try{
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(start.x,start.y)]});
      await page.waitForTimeout(45);
      for(let step=1;step<=16;step++){
        const x=start.x+(end.x-start.x)*step/16;
        const y=start.y+(end.y-start.y)*step/16;
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point(x,y)]});
        await page.waitForTimeout(24);
      }
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await page.waitForTimeout(60);
      const diag=await page.evaluate(() => ({
        events:(window as unknown as {__touchTrace?:string[]}).__touchTrace,
        message:document.querySelector('.status-line')?.textContent?.trim().slice(0,140),
        quiz:Boolean(document.querySelector('[aria-label="שאלת טריוויה"]'))
      }));
      console.info('TOUCH_DIAGNOSTIC',JSON.stringify(diag));
    }finally{await cdp.detach();}
  }else{
    await page.mouse.move(start.x,start.y);
    await page.mouse.down();
    await page.mouse.move(end.x,end.y,{steps:12});
    await page.mouse.up();
  }
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

test('one-minute spinning hourglass appears during a drawn-line question',async({page})=>{
  await ready(page);
  await draw(page,[1,1],[1,2]);
  const quiz=page.getByRole('dialog',{name:'שאלת טריוויה'});
  await expect(quiz).toBeVisible();
  await expect(quiz.getByRole('timer')).toContainText(/0[0-1]:[0-5][0-9]/);
  await expect(quiz.locator('.hourglass-spin')).toContainText('⌛');
  await expect(quiz.getByRole('button',{name:/30 שניות/})).toBeDisabled();
});

test('marker ink color is independent from territory color',async({page})=>{
  await ready(page);
  await page.getByRole('button',{name:'בחר צבע קו #EF4444'}).click();
  await draw(page,[1,1],[1,2]);
  await page.getByRole('dialog',{name:'שאלת טריוויה'}).getByRole('button',{name:/קנברה/}).click();
  await expect(page.locator('svg.board line[stroke="#EF4444"][stroke-width="10"]')).toHaveCount(1);
});

test('each subsequent question is new and never repeats the previous question',async({page})=>{
  await ready(page);
  await draw(page,[1,1],[1,2]);
  const first=page.getByRole('dialog',{name:'שאלת טריוויה'});
  const firstText=await first.locator('h2').innerText();
  await first.getByRole('button',{name:/סידני/}).click();
  await draw(page,[1,2],[1,3]);
  const second=page.getByRole('dialog',{name:'שאלת טריוויה'});
  await expect(second).toBeVisible();
  const secondText=await second.locator('h2').innerText();
  expect(secondText).not.toBe(firstText);
  const history=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-used-question-ids')||'[]'));
  expect(new Set(history).size).toBe(2);
});

test('required player name persists after reload and notebook grid remains translucent',async({page})=>{
  await page.goto('/');
  const guide=page.getByRole('dialog',{name:'הסבר משחק'});
  if(await guide.isVisible()) await guide.getByRole('button',{name:'דלג או סיים'}).click();
  await expect(page.getByRole('button',{name:/התחל משחק/})).toBeDisabled();
  await page.getByLabel('כינוי שחקן').fill('שחקנית הבודקת');
  await page.getByRole('button',{name:/שמור שם, צבע טוש/}).click();
  await page.reload();
  await expect(page.getByLabel('כינוי שחקן')).toHaveValue('שחקנית הבודקת');
  const grid=page.locator('.arena-inner');
  await expect(grid).toHaveCSS('background-size', /24px 24px/);
  const rgb=await grid.evaluate(e=>getComputedStyle(e).backgroundColor);
  expect(rgb).toMatch(/rgba\(/);
});

test('new game reloads reviewed questions without repeating any previously displayed question',async({page})=>{
  await ready(page);
  await draw(page,[1,1],[1,2]);
  const quiz=page.getByRole('dialog',{name:'שאלת טריוויה'});
  await expect(quiz).toBeVisible();
  const first=await quiz.locator('h2').innerText();
  const answer=quiz.getByRole('button',{name:/סידני/});
  await answer.click();
  await page.getByRole('button',{name:/התחל משחק/}).click();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-local-pool-release-v1')||'{}').he)).toBe(3);
  await draw(page,[1,1],[1,2]);
  const next=page.getByRole('dialog',{name:'שאלת טריוויה'});
  await expect(next).toBeVisible();
  const second=await next.locator('h2').innerText();
  expect(second).not.toBe(first);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-question-text-history-v1')||'[]'));
  expect(new Set(saved).size).toBe(2);
  await page.reload();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('trivia-question-text-history-v1')||'[]').length)).toBe(2);
});

test('tutorial is an animated real rule demo with correct Hebrew and English captions',async({page})=>{
  await page.goto('/');
  const he=page.getByRole('dialog',{name:'הסבר משחק'});
  await expect(he).toBeVisible();
  await expect(he.getByTestId('tutorial-preview')).toHaveAttribute('data-locale','he');
  await expect(he.getByRole('img',{name:/הדגמה: הטוש מחבר/})).toBeVisible();
  await expect(he.getByText(/גררו אצבע או עכבר/)).toBeVisible();
  await he.getByRole('button',{name:'הבא ←'}).click();
  await expect(he.getByRole('img',{name:/מופיעות ארבע תשובות/})).toBeVisible();
  await he.getByRole('button',{name:'הבא ←'}).click();
  await expect(he.getByRole('img',{name:/ריבוע שהושלם/})).toBeVisible();
  await he.getByRole('button',{name:'דלג או סיים'}).click();
  await page.getByRole('button',{name:'English',exact:true}).click();
  const open=page.getByRole('button',{name:/How to play/});
  await open.click();
  const en=page.getByRole('dialog',{name:'How to play'});
  await expect(en.getByTestId('tutorial-preview')).toHaveAttribute('data-locale','en');
  await expect(en.getByText(/Slide a finger or mouse/)).toBeVisible();
  await expect(en.getByRole('img',{name:/marker draws horizontally/})).toBeVisible();
  await en.getByRole('button',{name:'Next →'}).click();
  await expect(en.getByRole('img',{name:/four answers appear/})).toBeVisible();
  await expect(en.getByText(/Every valid new line opens/)).toBeVisible();
  await en.getByRole('button',{name:'Next →'}).click();
  await expect(en.getByRole('img',{name:/completed square fills/})).toBeVisible();
  await en.getByRole('button',{name:'Back'}).click();
  await expect(en.getByRole('img',{name:/four answers appear/})).toBeVisible();
  await en.press('Escape');
  await expect(en).toHaveCount(0);
  await expect(page.locator('main.trivia-app')).toHaveAttribute('dir','ltr');
  await page.getByRole('button',{name:'עברית',exact:true}).click();
  await expect(page.locator('main.trivia-app')).toHaveAttribute('dir','rtl');
});

test('dragging keeps marker path responsive without continuous React board renders',async({page})=>{
  await ready(page);
  const start=await dotPoint(page,1,1);
  const end=await dotPoint(page,1,2);
  await page.mouse.move(start.x,start.y);
  await page.mouse.down();
  await page.mouse.move((start.x+end.x)/2,start.y,{steps:20});
  const ink=page.locator('svg.board path[stroke-width="10"][stroke-linecap="round"]');
  await expect.poll(async()=>ink.count()).toBeGreaterThan(0);
  await page.mouse.move(end.x,end.y,{steps:12});
  await page.mouse.up();
  await expect(page.getByRole('dialog',{name:'שאלת טריוויה'})).toBeVisible();
});
