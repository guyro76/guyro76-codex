import {test,expect} from '@playwright/test';

// Runs on desktop and mobile Chromium. Real-device Safari/Chrome QA remains a release gate.
test('Android and iOS have a consistent Hebrew installation name and icon',async({page})=>{
  await page.goto('/');
  await expect(page).toHaveTitle('טריוויה ריבועים');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  // The PWA must retain Spanish in the first-run tutorial's live language picker.
  const tutor=page.getByRole('dialog',{name:'הסבר משחק'});
  if(await tutor.isVisible())await expect(tutor.getByRole('button',{name:'Español'})).toBeVisible();
  await expect(page.locator('meta[name="application-name"]')).toHaveAttribute('content','טריוויה ריבועים');
  await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute('content','טריוויה ריבועים');
  const link=page.locator('link[rel="manifest"]');
  await expect(link).toHaveAttribute('href','/manifest.webmanifest');
  const manifestResponse=await page.request.get('/manifest.webmanifest');
  expect(manifestResponse.ok()).toBeTruthy();
  const manifest=await manifestResponse.json();
  expect(manifest.name).toBe('טריוויה ריבועים');
  expect(manifest.short_name).toBe('טריוויה ריבועים');
  expect(manifest.display).toBe('standalone');
  expect(manifest.lang).toBe('he');
  expect(manifest.icons).toEqual(expect.arrayContaining([expect.objectContaining({src:'/icon.svg'})]));
  const icon=await page.request.get('/icon.svg');
  expect(icon.ok()).toBeTruthy();
  expect(await icon.text()).toContain('<svg');
});