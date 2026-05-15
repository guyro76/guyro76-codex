import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import "./build.mjs";

const root = join(process.cwd(), "dist");
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? "127.0.0.1";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function resolvePath(url = "/") {
  const pathname = decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  return join(root, safePath === "/" ? "index.html" : safePath);
}

const server = createServer(async (request, response) => {
  try {
    let filePath = resolvePath(request.url);
    const fileStat = await stat(filePath).catch(() => null);
    if (!fileStat || fileStat.isDirectory()) {
      filePath = join(root, "index.html");
    }
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(`INSTAWATCHER server error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
});

server.listen(port, host, () => {
  console.log(`INSTAWATCHER is ready: http://${host}:${port}`);
  console.log("Press Ctrl+C to stop the server.");
});
