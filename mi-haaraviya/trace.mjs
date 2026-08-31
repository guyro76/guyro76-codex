import pw from "/opt/node22/lib/node_modules/playwright/index.js";
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
page.on("pageerror", e => console.log("PAGEERROR:\n" + (e.stack || e.message)));
await page.goto("file://" + process.cwd() + "/mi-haaraviya.html", { waitUntil: "load" });
await page.waitForTimeout(1500);
console.log(await page.evaluate(() => {
  const c = document.getElementById("grain");
  return JSON.stringify({ w: c.width, h: c.height, attrW: c.getAttribute("width") });
}));
await browser.close();
