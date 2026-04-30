import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const distDir = resolve(__dirname, "../dist");
const port = Number(process.env.PORT ?? 8091);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function getContentType(filePath) {
  return MIME_TYPES[extname(filePath)] ?? "application/octet-stream";
}

function toSafePath(urlPathname) {
  const decoded = decodeURIComponent(urlPathname.split("?")[0]);
  const normalizedPath = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return join(distDir, normalizedPath === "/" ? "index.html" : normalizedPath);
}

const server = createServer(async (request, response) => {
  const requestedPath = toSafePath(request.url ?? "/");

  try {
    const data = await readFile(requestedPath);
    response.writeHead(200, { "Content-Type": getContentType(requestedPath) });
    response.end(data);
    return;
  } catch {}

  try {
    const indexPath = join(distDir, "index.html");
    const data = await readFile(indexPath);
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(data);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(error instanceof Error ? error.message : "Preview server failed.");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`BudCast native web preview: http://127.0.0.1:${port}`);
});
