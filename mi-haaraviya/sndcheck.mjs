import pw from "/opt/node22/lib/node_modules/playwright/index.js";
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 820 } });
const errs = [];
page.on("pageerror", e => errs.push(e.message));
await page.goto("file://" + process.cwd() + "/mi-haaraviya.html", { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(2500);

const probe = () => page.evaluate(() => {
  const s = document.getElementById("snd");
  return {
    ready: s.readyState, paused: s.paused, muted: s.muted,
    dur: Math.round(s.duration * 100) / 100,
    ct: Math.round(s.currentTime * 100) / 100,
    chipOff: document.getElementById("sndBtn").classList.contains("off"),
    label: document.getElementById("sndBtn").getAttribute("aria-label"),
    shown: document.getElementById("time").textContent
  };
});
console.log("after 2.5s:", JSON.stringify(await probe()));
await page.waitForTimeout(2000);
const b = await probe();
console.log("after 4.5s:", JSON.stringify(b));

// the transport clock must be tracking the audio clock
const drift = await page.evaluate(() => {
  const s = document.getElementById("snd");
  const shown = document.getElementById("time").textContent.split("/")[0].trim();
  const [m, sec] = shown.split(":").map(Number);
  return Math.abs((m * 60 + sec) - s.currentTime);
});
console.log("clock drift vs audio:", drift.toFixed(2), "s");

// the chip turns sound on
await page.mouse.move(700, 400);
await page.waitForTimeout(200);
await page.click("#sndBtn");
console.log("after chip click:", JSON.stringify(await probe()));

// seeking must carry the score with it
await page.evaluate(() => window.__seek(52));
await page.waitForTimeout(150);
console.log("after seek to 52:", JSON.stringify(await probe()));
console.log("errors:", errs.length ? errs : "none");
await browser.close();
