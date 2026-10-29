import {test,expect,type Page} from '@playwright/test';
async function ready(page:Page){
 await page.goto('/');
 const intro=page.getByRole('dialog',{name:'הסבר משחק'});
 await expect(intro).toBeVisible();
 await intro.getByRole('button',{name:'דלג או סיים'}).click();
}
async function drawFirstLine(page:Page){
 await page.locator('svg.board').scrollIntoViewIfNeeded();
 const dot=page.locator('svg.board circle[aria-label="Dot row 1, column 1"]');
 const neighbor=page.locator('svg.board circle[aria-label="Dot row 1, column 2"]');
 // Dot accessibility labels follow the active locale.
 const d=await dot.boundingBox();const n=await neighbor.boundingBox();
 if(!d||!n)throw Error('Board dots missing');
 const start={x:d.x+d.width/2,y:d.y+d.height/2};
 const end={x:n.x+n.width/2,y:n.y+n.height/2};
 const isTouch=await page.evaluate(()=>navigator.maxTouchPoints>0 && matchMedia('(pointer: coarse)').matches);
 if(isTouch){
  const cdp=await page.context().newCDPSession(page);
  const point=(x:number,y:number)=>({x,y,radiusX:2,radiusY:2,force:0.8,id:1});
  try{
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(start.x,start.y)]});
   await page.waitForTimeout(45);
   for(let step=1;step<=16;step++){
    const x=start.x+(end.x-start.x)*step/16,y=start.y+(end.y-start.y)*step/16;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point(x,y)]});
    await page.waitForTimeout(22);
   }
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }finally{await cdp.detach();}
 }else{
  await page.mouse.move(start.x,start.y);
  await page.mouse.down();
  await page.mouse.move(end.x,end.y,{steps:12});
  await page.mouse.up();
 }
}

test('QA specialist 4: live switch to English updates screen and direction',async({page})=>{
 await ready(page);
 await page.locator('.locale-switch').getByRole('button',{name:'English'}).click();
 await expect(page.locator('main.trivia-app')).toHaveAttribute('lang','en');
 await expect(page.locator('main.trivia-app')).toHaveAttribute('dir','ltr');
 await expect(page.getByRole('heading',{name:'Trivia Squares'})).toBeVisible();
 await expect(page.getByText('Game room',{exact:false}).first()).toBeVisible();
 await expect(page.getByText('Orchard of Wonders').first()).toBeVisible();
 await expect(page.locator('.locale-switch').getByRole('button',{name:'English'})).toHaveAttribute('aria-pressed','true');
});
test('QA specialist 4: English language preference persists across reload',async({page})=>{
 await ready(page);
 await page.locator('.locale-switch').getByRole('button',{name:'English'}).click();
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 await page.reload();
 await expect(page.locator('main.trivia-app')).toHaveAttribute('dir','ltr');
 await expect(page.getByRole('heading',{name:'Trivia Squares'})).toBeVisible();
 await page.locator('.locale-switch').getByRole('button',{name:'עברית'}).click();
 await expect(page.locator('main.trivia-app')).toHaveAttribute('dir','rtl');
 await expect(page.getByRole('heading',{name:'טריוויה ריבועים'})).toBeVisible();
});
test('QA specialist 4: English play yields native-English film, science or culture question with A-D answers',async({page})=>{
 await ready(page);
 await page.locator('.locale-switch').getByRole('button',{name:'English'}).click();
 await page.getByRole('textbox',{name:/Player name/i}).first().fill('International QA');
 await drawFirstLine(page);
 const quiz=page.getByRole('dialog',{name:/שאלת טריוויה|Trivia question/});
 await expect(quiz).toBeVisible();
 const title=await quiz.locator('h2').innerText();
 expect(title).toMatch(/[a-z]{3,}/i);
 expect(title).not.toMatch(/[\u0590-\u05FF]/);
 const buttons=quiz.locator('.answer-option');
 await expect(buttons).toHaveCount(4);
 await expect(buttons.first().locator('.answer-letter')).toHaveText('A');
});
