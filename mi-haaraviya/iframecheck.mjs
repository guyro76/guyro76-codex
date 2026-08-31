/* The artifact viewer renders the page in an iframe. If that iframe never
   resolves a height, a 100dvh layout collapses and the stage scales to zero. */
import pw from "/opt/node22/lib/node_modules/playwright/index.js";
import { writeFileSync } from "node:fs";

const cases = {
  "height:100%":      "width:100%;height:100%;border:0",
  "height:auto":      "width:100%;border:0",
  "height:0 + flex":  "width:100%;flex:1;min-height:0;border:0",
  "fixed 800px":      "width:100%;height:800px;border:0"
};
writeFileSync("frames/host.html", `<!doctype html><meta charset=utf-8>
<style>html,body{margin:0;height:100%}#wrap{display:flex;flex-direction:column;height:100%}</style>
<div id=wrap></div>
<script>
  const s = new URLSearchParams(location.search).get("s") || "";
  const f = document.createElement("iframe");
  f.setAttribute("style", s);
  f.src = "/mi-haaraviya.html";
  document.getElementById("wrap").appendChild(f);
</script>`);

const browser = await pw.chromium.launch({ args: ["--no-proxy-server"] });
for (const [name, style] of Object.entries(cases)) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto("http://127.0.0.1:8899/frames/host.html?s=" + encodeURIComponent(style), { waitUntil: "load" });
  await page.waitForTimeout(1800);
  const r = await page.evaluate(() => {
    const f = document.querySelector("iframe");
    const d = f.contentDocument;
    const fit = d.getElementById("fit");
    const m = new DOMMatrix(getComputedStyle(fit).transform);
    return {
      iframeH: Math.round(f.getBoundingClientRect().height),
      stageH: Math.round(d.getElementById("stagewrap").clientHeight),
      scale: +m.a.toFixed(3),
      renderedH: Math.round(fit.getBoundingClientRect().height)
    };
  });
  const bad = r.scale <= 0.01 || r.renderedH < 40;
  console.log(`${name.padEnd(18)} iframe ${String(r.iframeH).padStart(4)}px  stagewrap ${String(r.stageH).padStart(4)}px  scale ${String(r.scale).padStart(6)}  rendered ${String(r.renderedH).padStart(4)}px  ${bad ? "<-- BLANK" : "ok"}`);
  await page.close();
}
await browser.close();
