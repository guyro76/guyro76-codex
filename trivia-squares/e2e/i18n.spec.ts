import {test,expect,type Page} from '@playwright/test';
async function ready(page:Page){
 await page.goto('/');
 const intro=page.getByRole('dialog',{name:'הסבר משחק'});
 if(await intro.isVisible())await intro.getByRole('button',{name:'דלג או סיים'}).click();
}
async function drawFirstLine(page:Page){
 const dot=page.locator('svg.board circle[aria-label="נקודה 1, 1"]');
 const neighbor=page.locator('svg.board circle[aria-label="נקודה 1, 2"]');
 // Dots retain their original Hebrew a11y names for compatible existing keyboard tests.
 const d=await dot.boundingBox();const n=await neighbor.boundingBox();
 if(!d||!n)throw Error('Board dots missing');
 await page.mouse.move(d.x+d.width/2,d.y+d.height/2);
 await page.mouse.down();
 await page.mouse.move(n.x+n.width/2,n.y+n.height/2,{steps:12});
 await page.mouse.up();
}

test('QA specialist 4: live switch to English updates screen and direction',async({page})=>{
 await ready(page);
 await page.getByRole('button',{name:'English'}).click();
 await expect(page.locator('main.trivia-app')).toHaveAttribute('lang','en');
 await expect(page.locator('main.trivia-app')).toHaveAttribute('dir','ltr');
 await expect(page.getByRole('heading',{name:'Trivia Squares'})).toBeVisible();
 await expect(page.getByText('Game room',{exact:false}).first()).toBeVisible();
 await expect(page.getByText('Orchard of Wonders').first()).toBeVisible();
 await expect(page.getByRole('button',{name:'English'})).toHaveAttribute('aria-pressed','true');
});
test('QA specialist 4: English language preference persists across reload',async({page})=>{
 await ready(page);
 await page.getByRole('button',{name:'English'}).click();
 await expect(page.locator('html')).toHaveAttribute('lang','en');
 await page.reload();
 await expect(page.locator('main.trivia-app')).toHaveAttribute('dir','ltr');
 await expect(page.getByRole('heading',{name:'Trivia Squares'})).toBeVisible();
 await page.getByRole('button',{name:'עברית'}).click();
 await expect(page.locator('main.trivia-app')).toHaveAttribute('dir','rtl');
 await expect(page.getByRole('heading',{name:'טריוויה ריבועים'})).toBeVisible();
});
test('QA specialist 4: English play yields native-English film, science or culture question with A-D answers',async({page})=>{
 await ready(page);
 await page.getByRole('button',{name:'English'}).click();
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
