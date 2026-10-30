import {test,expect} from '@playwright/test';

for(const viewport of [{width:1280,height:800},{width:1024,height:768}]){
 test('compact playfield fits desktop/tablet viewport '+viewport.width+'x'+viewport.height,async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='chromium-desktop','Viewport-specific desktop layout regression');
  await page.setViewportSize(viewport);
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'טריוויה ריבועים'})).toBeVisible();
  const tutorial=page.getByRole('dialog',{name:'הסבר משחק'});
  if(await tutorial.isVisible())await tutorial.getByRole('button',{name:'דלג או סיים'}).click();
  await expect(page.getByRole('img',{name:'לוגו טריוויה ריבועים'})).toBeVisible();
  await expect(page.locator('#campaign-stage-grid')).toBeHidden();
  await page.getByRole('button',{name:/בחר שלב · הצג את 30 השלבים/}).click();
  await expect(page.locator('#campaign-stage-grid')).toBeVisible();
  await page.getByRole('button',{name:/הסתר רשימת שלבים/}).click();
  await page.getByLabel('שם שחקן (חובה)').fill('טסטר');
  const board=page.locator('svg.board');
  await board.scrollIntoViewIfNeeded();
  const point=async(row:number,col:number)=>{
   const el=board.locator('circle[aria-label="נקודה '+row+', '+col+'"]');
   const box=await el.boundingBox();
   if(!box)throw new Error('Missing board point');
   return {x:box.x+box.width/2,y:box.y+box.height/2};
  };
  const a=await point(1,1),b=await point(1,2);
  await page.mouse.move(a.x,a.y);await page.mouse.down();
  await page.mouse.move(b.x,b.y,{steps:12});await page.mouse.up();
  await expect(page.locator('main.trivia-app')).toHaveClass(/playing-layout/);
  await expect(page.locator('aside .settings-drawer')).not.toHaveAttribute('open','');
  const geometry=await page.evaluate(()=>{
   const board=document.querySelector('svg.board')!.getBoundingClientRect();
   const logo=document.querySelector('.trivia-brand-mark')!.getBoundingClientRect();
   return {scrollHeight:document.documentElement.scrollHeight,viewHeight:window.innerHeight,
    boardBottom:board.bottom,boardWidth:board.width,logoWidth:logo.width};
  });
  expect(geometry.logoWidth).toBeGreaterThanOrEqual(30);
  expect(geometry.scrollHeight).toBeLessThanOrEqual(geometry.viewHeight+3);
  expect(geometry.boardWidth).toBeGreaterThan(240);
  expect(geometry.boardBottom).toBeLessThanOrEqual(geometry.viewHeight-10);
 });
}
