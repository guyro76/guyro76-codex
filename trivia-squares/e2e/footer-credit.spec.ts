import {test,expect} from '@playwright/test';

test('creator credit is legible, aubergine on warm stone and ends with ©',async({page})=>{
 await page.goto('/');
 const tutorial=page.getByRole('dialog',{name:'הסבר משחק'});
 if(await tutorial.isVisible())await tutorial.getByRole('button',{name:'דלג או סיים'}).click();
 const credit=page.locator('#app-footer');
 await credit.scrollIntoViewIfNeeded();
 await expect(credit).toBeVisible();
 await expect(credit).toContainText(/גיא רוזנברג/);
 await expect(credit).toContainText(/כל הזכויות שמורות\s*©/);
 const values=await credit.evaluate(el=>{
   const css=getComputedStyle(el);
   const inner=getComputedStyle(el.querySelector('.game-author-credit-copy')!);
   return {background:css.backgroundImage,color:inner.color,fontSize:parseFloat(inner.fontSize),weight:parseInt(inner.fontWeight,10)};
 });
 expect(values.background).toContain('linear-gradient');
 expect(values.color).toBe('rgb(53, 20, 56)');
 expect(values.fontSize).toBeGreaterThanOrEqual(17);
 expect(values.weight).toBeGreaterThanOrEqual(900);
});
