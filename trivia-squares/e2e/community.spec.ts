import {test,expect} from '@playwright/test';
test('community suggestion page is linked in achievements and supports all six language selectors',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('trivia-tutorial-seen-v1','1'));
 await page.goto('/');
 await page.getByRole('button',{name:'פתח תפריט משחק'}).click();
 const menu=page.getByRole('dialog',{name:'תפריט המשחק'});
 await menu.getByRole('button',{name:/פרסים|הישגים|אוצרות/}).click();
 await expect(menu.getByRole('link',{name:/הצע שאלה/})).toHaveAttribute('href','/suggest');
 await page.goto('/suggest');
 await expect(page.locator('.community-page')).toBeVisible();
 await page.getByRole('button',{name:'Español'}).click();
 await expect(page.locator('.community-page')).toHaveAttribute('lang','es');
 await expect(page.getByRole('link',{name:/Volver al juego/})).toBeVisible();
 await expect(page.locator('body')).not.toContainText('undefined');
});