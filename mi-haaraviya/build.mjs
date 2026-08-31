/* Bakes the stage photo and the Hebrew webfonts into one self-contained page.
   Fonts are inlined rather than linked so the render never depends on the
   network — the same file drives the artifact and the video encoder. */
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "video.template.html";
const OUT = "mi-haaraviya.html";
const PHOTO = process.env.PHOTO || "assets/stage.jpg";

const dataURI = (path, mime) => `data:${mime};base64,` + readFileSync(path).toString("base64");

/* Google's css2 output carries one @font-face per subset. The page is Hebrew
   with a little Latin, so latin-ext is dead weight. */
const faces = [...readFileSync("fonts/gf.css", "utf8")
  .matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)]
  .filter(([, subset]) => subset !== "latin-ext")
  .map(([, , block]) => block);
if (!faces.length) throw new Error("no @font-face blocks parsed from fonts/gf.css");

const fontCss = faces.map(block =>
  block.replace(/url\(https:\/\/fonts\.gstatic\.com\/[^)]*\/([^/)]+\.woff2)\)/g,
                (_, file) => `url(${dataURI("fonts/" + file, "font/woff2")})`)
).join("\n");

let html = readFileSync(SRC, "utf8")
  .replace("__FONTS__", fontCss)
  .replaceAll("__PHOTO__", dataURI(PHOTO, "image/jpeg"));

for (const token of ["__FONTS__", "__PHOTO__"]) {
  if (html.includes(token)) throw new Error(`placeholder ${token} still present`);
}
writeFileSync(OUT, html);
console.log(`${OUT}  ${(html.length / 1024).toFixed(0)} KB  (${faces.length} @font-face blocks inlined)`);
