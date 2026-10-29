import {test,expect} from '@playwright/test';

test('clock, both dates, weather, version and author credit are visible on desktop',async({page})=>{
 await page.route('https://api.open-meteo.com/**',route=>route.fulfill({
  status:200,contentType:'application/json',body:JSON.stringify({
   current:{temperature_2m:24.4,weather_code:1,is_day:1}
  })
 }));
 await page.goto('/');
 const tutorial=page.getByRole('dialog',{name:'הסבר משחק'});
 if(await tutorial.isVisible())await tutorial.getByRole('button',{name:'דלג או סיים'}).click();
 const bar=page.getByRole('region',{name:'נתוני המשחק: שעה, תאריך, מזג אוויר וגרסה'});
 await expect(bar).toBeVisible();
 await expect(bar.getByLabel('השעה בישראל')).toContainText(/^\d{2}:\d{2}:\d{2}$/);
 await expect(bar).toContainText(/\d{2}[.\/]\d{2}[.\/]\d{4}/);
 await expect(bar.getByText(/24°C/)).toBeVisible();
 await expect(bar.getByTestId('trivia-version')).toContainText(/^v\d+\.\d+\.\d+$/);
 await bar.getByRole('link',{name:'קרדיט ומידע על היוצר'}).click();
 await expect(page.locator('#app-footer')).toContainText('גיא רוזנברג');
 await expect(page.locator('#app-footer')).toBeInViewport();
 await expect(bar.getByRole('link',{name:'נתוני מזג אוויר: Open-Meteo'})).toHaveAttribute('href','https://open-meteo.com/');
});

test('city preference persists and weather display remains accessible in mobile layout',async({page,isMobile})=>{
 await page.route('https://api.open-meteo.com/**',route=>route.fulfill({
  status:200,contentType:'application/json',body:JSON.stringify({
   current:{temperature_2m:21.9,weather_code:3,is_day:0}
  })
 }));
 await page.goto('/');
 const tutorial=page.getByRole('dialog',{name:'הסבר משחק'});
 if(await tutorial.isVisible())await tutorial.getByRole('button',{name:'דלג או סיים'}).click();
 const select=page.getByLabel('מזג האוויר');
 await select.selectOption('jerusalem');
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('trivia-weather-city'))).toBe('jerusalem');
 await page.reload();
 await expect(page.getByLabel('מזג האוויר')).toHaveValue('jerusalem');
 await expect(page.getByTestId('trivia-version')).toBeVisible();
 await expect(page.locator('#app-footer')).toBeVisible();
 if(isMobile)await expect(page.locator('.game-timebar')).toBeInViewport();
});
