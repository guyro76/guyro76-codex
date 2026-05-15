import { mkdir, copyFile, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await copyFile("src/index.html", "dist/index.html");
await copyFile("src/styles.css", "dist/styles.css");
await copyFile("src/app.js", "dist/app.js");
console.log("Built INSTAWATCHER static app to dist/");
