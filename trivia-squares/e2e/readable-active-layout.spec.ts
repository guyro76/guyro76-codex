import {test,expect} from '@playwright/test';

test('active desktop game keeps essential controls bold and readable without clipping the board',async({page},info)=>{
 test.skip(info.project.name!=='chromium-desktop','Desktop/tablet landscape geometry on Chromium');
 await page.addInitScript(()=>{
   localStorage.setItem('trivia-welcome-dismissed-v1','1');
   localStorage.setItem('trivia-tutorial-seen-v1','1');
   localStorage.setItem('trivia-player-name','טסטר');
 });
 await page.setViewportSize({width:1024,height:768});
 await page.goto('/');
 const board=page.locator('svg.board');
 await expect(board).toBeVisible();
 await board.scrollIntoViewIfNeeded();
 const coord=async (row:number,col:number)=>{
   const dot=page.locator('svg.board circle[aria-label="נקודה '+row+', '+col+'"]');
   const b=await dot.boundingBox();if(!b)throw Error('missing board dot');
   return {x:b.x+b.width/2,y:b.y+b.height/2};
 };
 const a=await coord(1,1),b=await coord(1,2);
 await page.mouse.move(a.x,a.y);await page.mouse.down();
 await page.mouse.move(b.x,b.y,{steps:12});await page.mouse.up();
 await expect(page.locator('main.trivia-app.playing-layout')).toBeVisible();
 for(const selector of ['.score-name','.gesture-hint','.status-line','.campaign-heading span','.hero .locale-option']){
   const element=page.locator('main.trivia-app.playing-layout '+selector).first();
   await expect(element).toHaveCount(1);
   const computed=await element.evaluate(e=>({size:parseFloat(getComputedStyle(e).fontSize),weight:parseInt(getComputedStyle(e).fontWeight,10)}));
   expect(computed.size,selector+' type size').toBeGreaterThanOrEqual(14);
   expect(computed.weight,selector+' weight').toBeGreaterThanOrEqual(900);
 }
 const bounds=await page.evaluate(()=>{
   const rect=document.querySelector('svg.board')?.getBoundingClientRect();
   return {width:rect?.width??0,left:rect?.left??-100,right:rect?.right??10000,viewport:innerWidth,scroll:document.documentElement.scrollWidth};
 });
 expect(bounds.width).toBeGreaterThan(220);
 expect(bounds.left).toBeGreaterThanOrEqual(-2);
 expect(bounds.right).toBeLessThanOrEqual(bounds.viewport+2);
 expect(bounds.scroll).toBeLessThanOrEqual(bounds.viewport+2);
});
