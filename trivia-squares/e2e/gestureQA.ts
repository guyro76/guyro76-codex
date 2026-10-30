import type {Page} from '@playwright/test';

/** The board may start below the initial viewport. Align to the actual SVG
 * and use native touch input on mobile rather than a mouse emulation. */
export async function drawAdjacentForQA(page:Page,a:[number,number],b:[number,number]){
 const board=page.locator('svg.board');
 await board.scrollIntoViewIfNeeded();
 const dot=async(row:number,col:number)=>{
  const circle=board.locator('circle[aria-label="נקודה '+row+', '+col+'"]');
  const rect=await circle.boundingBox();
  if(!rect)throw new Error('dot outside viewport '+row+','+col);
  return {x:rect.x+rect.width/2,y:rect.y+rect.height/2};
 };
 const from=await dot(a[0],a[1]),to=await dot(b[0],b[1]);
 const touch=await page.evaluate(()=>navigator.maxTouchPoints>0&&matchMedia('(pointer: coarse)').matches);
 if(touch){
  const cdp=await page.context().newCDPSession(page);
  const p=(x:number,y:number)=>({x,y,radiusX:2,radiusY:2,force:.8,id:1});
  try{
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p(from.x,from.y)]});
   await page.waitForTimeout(45);
   for(let i=1;i<=16;i++){
    await cdp.send('Input.dispatchTouchEvent',{
      type:'touchMove',touchPoints:[p(from.x+(to.x-from.x)*i/16,from.y+(to.y-from.y)*i/16)]});
    await page.waitForTimeout(24);
   }
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }finally{await cdp.detach();}
 }else{
  await page.mouse.move(from.x,from.y);
  await page.mouse.down();
  await page.mouse.move(to.x,to.y,{steps:16});
  await page.mouse.up();
 }
}
