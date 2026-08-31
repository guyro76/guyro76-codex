/* Renders the timeline frame-by-frame and pipes it to ffmpeg.
   render(t) is a pure function of time, so every frame is exact and the
   encode is reproducible — no real-time screen capture, no dropped frames. */
import pw from "/opt/node22/lib/node_modules/playwright/index.js";
import { spawn } from "node:child_process";
import { once } from "node:events";

const FPS   = Number(process.env.FPS || 25);
const SCALE = Number(process.env.SCALE || 1.2);          // 1600x900 -> 1920x1080
const OUT   = process.env.OUT || "mi-haaraviya.mp4";
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

const ff = spawn(FFMPEG, [
  "-y",
  "-f", "image2pipe", "-framerate", String(FPS), "-i", "pipe:0",
  "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
  "-shortest",
  "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "64k",
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
