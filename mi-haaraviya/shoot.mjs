/* Frame grabber: seeks the timeline and screenshots, for review or encoding. */
import pw from "/opt/node22/lib/node_modules/playwright/index.js";
const { chromium } = pw;
import { mkdirSync, writeFileSync } from "node:fs";

const times   = (process.env.TIMES || "0.5,3,5.6,9,12,14.5,23.6,26,31,35,38,41,43.5,49,51.4,53,56,59.4").split(",").map(Number);
const outDir  = process.env.OUT || "frames";
const W = 1600, H = 900;
mkdirSync(outDir, { recursive: true });

const proxy = process.env.HTTPS_PROXY;
const browser = await chromium.launch(proxy ? { proxy: { server: proxy }, args:["--ignore-certificate-errors"] } : {});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });

const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
page.on("pageerror", e => errors.push("pageerror: " + e.message));
const failed = [];
page.on("requestfailed", r => failed.push(r.url().slice(0, 90) + " :: " + (r.failure()?.errorText || "")));

await page.goto("file://" + process.cwd() + "/mi-haaraviya.html?capture=1", { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(700);

const fontOk = await page.evaluate(() => ({
  karantina: document.fonts.check("700 100px Karantina"),
  frank:     document.fonts.check("400 20px 'Frank Ruhl Libre'"),
  assistant: document.fonts.check("800 40px Assistant"),
  seek:      typeof window.__seek === "function",
  dur:       window.__duration
}));
console.log("fonts/api:", JSON.stringify(fontOk));

for (const t of times) {
  await page.evaluate(x => window.__seek(x), t);
  await page.waitForTimeout(90);
  await page.screenshot({ path: `${outDir}/t${String(t).padStart(5,"0")}.png` });
}
console.log("errors:", errors.length ? errors : "none");
console.log("failed requests:", failed.length ? failed.slice(0,6) : "none");
await browser.close();
