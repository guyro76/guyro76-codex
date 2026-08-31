/* Confirms the stage letterboxes correctly and the note never covers the transport. */
import pw from "/opt/node22/lib/node_modules/playwright/index.js";
const browser = await pw.chromium.launch();
for (const [w, h] of [[1600,900],[1440,700],[1280,1000],[900,520],[600,900]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errs = [];
  page.on("pageerror", e => errs.push(e.message));
  await page.goto("file://" + process.cwd() + "/mi-haaraviya.html", { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    const note = document.querySelector(".note").getBoundingClientRect();
    const chrome = document.getElementById("chrome").getBoundingClientRect();
    const fit = document.getElementById("fit").getBoundingClientRect();
    return {
      overlap: Math.min(note.bottom, chrome.bottom) - Math.max(note.top, chrome.top) > 1,
      stage: Math.round(fit.width) + "x" + Math.round(fit.height),
      ratio: (fit.width / fit.height).toFixed(3),
      bodyScrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  });
  console.log(`${String(w).padStart(4)}x${String(h).padEnd(4)} stage ${r.stage.padEnd(11)} ratio ${r.ratio}  note/chrome overlap: ${r.overlap}  h-scroll: ${r.bodyScrollX}  errors: ${errs.length ? errs.join(" | ") : 0}`);
  await page.close();
}
await browser.close();
