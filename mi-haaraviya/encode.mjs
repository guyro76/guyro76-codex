/* Renders the timeline frame-by-frame and pipes it to ffmpeg.
   render(t) is a pure function of time, so every frame is exact and the
   encode is reproducible — no real-time screen capture, no dropped frames. */
import pw from "/opt/node22/lib/node_modules/playwright/index.js";
import { spawn } from "node:child_process";
import { once } from "node:events";

const FPS   = Number(process.env.FPS || 25);
const SCALE = Number(process.env.SCALE || 1.2);          // 1600x900 -> 1920x1080
const OUT   = process.env.OUT || "mi-haaraviya.mp4";
const AUDIO = process.env.AUDIO || "audio.wav";
const CRF   = Number(process.env.CRF || 21);
const FFMPEG = "/tmp/claude-0/-home-user-guyro76-codex/ff86d2a4-bbd2-5897-991d-cb5873ee4449/scratchpad/node_modules/ffmpeg-static/ffmpeg";

const browser = await pw.chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: SCALE
});
const errors = [];
page.on("pageerror", e => errors.push(e.message));
await page.goto("file://" + process.cwd() + "/mi-haaraviya.html?capture=1", { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(600);

const DUR = await page.evaluate(() => window.__duration);
const total = Math.round(DUR * FPS);
console.log(`encoding ${total} frames @ ${FPS}fps -> ${OUT}`);

/* Main@3.1 rather than High: it is the profile every player decodes, which
   matters more here than the last few percent of compression. */
const ff = spawn(FFMPEG, [
  "-y",
  "-f", "image2pipe", "-framerate", String(FPS), "-i", "pipe:0",
  "-i", AUDIO,
  "-map", "0:v:0", "-map", "1:a:0", "-shortest",
  "-c:v", "libx264", "-profile:v", "main", "-level", "3.1",
  "-preset", "slow", "-crf", String(CRF), "-pix_fmt", "yuv420p",
  "-g", String(FPS * 2), "-keyint_min", String(FPS), "-sc_threshold", "0",
  "-c:a", "aac", "-profile:a", "aac_low", "-b:a", "128k", "-ar", "44100", "-ac", "2",
  "-movflags", "+faststart",
  OUT
], { stdio: ["pipe", "ignore", "pipe"] });
let ffErr = "";
ff.stderr.on("data", d => { ffErr += d; });

const started = Date.now();
for (let i = 0; i < total; i++) {
  await page.evaluate(t => window.__seek(t), i / FPS);
  const buf = await page.screenshot({ type: "jpeg", quality: 94 });
  if (!ff.stdin.write(buf)) await once(ff.stdin, "drain");
  if (i % 250 === 0) {
    const el = (Date.now() - started) / 1000;
    console.log(`  ${i}/${total}  ${el.toFixed(0)}s elapsed`);
  }
}
ff.stdin.end();
const [code] = await once(ff, "close");
await browser.close();
if (errors.length) console.log("page errors:", errors);
if (code !== 0) { console.error(ffErr.slice(-1500)); process.exit(1); }
console.log(`done in ${((Date.now()-started)/1000).toFixed(0)}s`);
