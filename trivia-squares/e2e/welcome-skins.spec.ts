import {test,expect} from '@playwright/test';

test.use({storageState:{cookies:[],origins:[]}});

test('first-visit palette exposes six translated skins in all locales and persists selection into the game',async({page})=>{
 await page.goto('/');
 const welcome=page.locator('.trivia-welcome');
 await expect(welcome).toBeVisible();
 for(const locale of ['he','en','ru','fr','ar','es'] as const){
  await page.locator('#welcome-language').selectOption(locale);
  await expect(welcome).toHaveAttribute('lang',locale);
  await expect(welcome).toHaveAttribute('dir',locale==='he'||locale==='ar'?'rtl':'ltr');
  const palette=page.getByTestId('welcome-skin-trigger');
  await expect(palette).toBeVisible();
  await palette.click();
  await expect(palette).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('.welcome-skin-option')).toHaveCount(6);
  await expect(page.getByTestId('welcome-skin-pop')).toBeVisible();
  await expect(page.getByTestId('welcome-skin-future')).toBeVisible();
  await palette.click();
  await expect(palette).toHaveAttribute('aria-expanded','false');
 }
 await page.getByTestId('welcome-skin-trigger').click();
 await page.getByTestId('welcome-skin-future').click();
 await expect(welcome).toHaveClass(/welcome-skin-future/);
 expect(await page.evaluate(()=>localStorage.getItem('trivia-skin-v1'))).toBe('future');
 await page.locator('.welcome-start').click();
 await expect(page.locator('main.trivia-app')).toHaveClass(/skin-future/);
 await page.reload();
 await expect(page.locator('main.trivia-app')).toHaveClass(/skin-future/);
 expect(await page.evaluate(()=>localStorage.getItem('trivia-skin-v1'))).toBe('future');
});

test('RTL and LTR palette remains within narrow mobile viewport',async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await page.goto('/');
 for(const locale of ['he','en','ar','es'] as const){
  await page.locator('#welcome-language').selectOption(locale);
  const palette=page.getByTestId('welcome-skin-trigger');
  await palette.click();
  const box=await page.locator('#welcome-skin-panel').boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.x+box!.width).toBeLessThanOrEqual(376);
  await expect(page.locator('.welcome-skin-option')).toHaveCount(6);
  await palette.click();
 }
});
