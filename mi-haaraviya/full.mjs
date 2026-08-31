import pw from "/opt/node22/lib/node_modules/playwright/index.js";
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 820 } });
await page.goto("file://" + process.cwd() + "/mi-haaraviya.html", { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
await page.evaluate(() => window.__seek(26));
await page.mouse.move(700, 400);          // wake the transport
await page.waitForTimeout(300);
await page.screenshot({ path: "frames/page-chrome.png" });
await browser.close();
