import {test,expect} from '@playwright/test';

test('five-day pilot exposes a valid install manifest and icon',async({page,request})=>{
  const response=await request.get('/manifest.webmanifest');
  expect(response.ok()).toBeTruthy();
  const manifest=await response.json() as Record<string,unknown>;
  expect(manifest.name).toMatch(/טריוויה ריבועים/);
  expect(manifest.start_url).toBe('/');
  expect(manifest.scope).toBe('/');
  expect(manifest.display).toBe('standalone');
  expect(manifest.lang).toBe('he');
  expect(manifest.dir).toBe('rtl');
  const icons=manifest.icons as {src:string}[];
  expect(icons).toHaveLength(2);
  for(const icon of icons)expect(icon.src).toBe('/icon.svg');
  const svg=await request.get('/icon.svg');
  expect(svg.ok()).toBeTruthy();
  expect(await svg.text()).toContain('<svg');
  await page.goto('/');
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href','/manifest.webmanifest');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content','#42218F');
});

test('pilot does not render checkout, purchase or advertising',async({page})=>{
  await page.goto('/');
  await expect(page.locator('[data-checkout],[data-paywall],iframe[src*="doubleclick"],iframe[src*="adsense"]')).toHaveCount(0);
  await expect(page.locator('button').filter({hasText:/^(קנה|רכוש|Pay now|Subscribe)$/})).toHaveCount(0);
});
