import { createReadStream, existsSync, statSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { basename, dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { Fields, ProjectPaths } from "../domain/index.js";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".png": "image/png",
  ".jpg": "image/jpeg"
};

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

// The request body as a JSON object ({} when empty). Anything but an object is rejected.
export function readBody(req: IncomingMessage): Promise<Fields> {
  return new Promise((resolveBody, rejectBody) => {
    let data = "";
    req.on("data", (chunk: Buffer) => (data += chunk.toString()));
    req.on("end", () => {
      try {
        const parsed: unknown = data ? JSON.parse(data) : {};
        if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("request body must be a JSON object");
        resolveBody(parsed as Fields);
      } catch (error) {
        rejectBody(error);
      }
    });
    req.on("error", rejectBody);
  });
}

// Writes a "data:image/...;base64," string (or bare base64) to `file`.
export async function writeDataUrl(file: string, data: string): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), "base64"));
}

// Streams a project's render or final movie, with Range support for video seeking. Only files
// under renders/ and final.mp4 are served; film.json and the rest of the folder stay private.
export function serveMedia(req: IncomingMessage, res: ServerResponse, paths: ProjectPaths, rest: string): void {
  const file = resolve(paths.dir, decodeURIComponent(rest));
  const allowed = file === paths.final || file.startsWith(paths.renders + sep);
  if (!allowed || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404).end();
    return;
  }
  const size = statSync(file).size;
  const type = MIME[extname(file).toLowerCase()] ?? "application/octet-stream";
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
  if (range) {
    const start = range[1] ? Number.parseInt(range[1], 10) : 0;
    const end = range[2] ? Math.min(Number.parseInt(range[2], 10), size - 1) : size - 1;
    res.writeHead(206, {
      "content-type": type,
      "content-range": `bytes ${start}-${end}/${size}`,
      "accept-ranges": "bytes",
      "content-length": end - start + 1
    });
    createReadStream(file, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { "content-type": type, "content-length": size, "accept-ranges": "bytes" });
    createReadStream(file).pipe(res);
  }
}

// The dashboard page (public/index.html, app.js, styles.css). Read on every request, so editing
// the files shows up on reload; the build copies public/ next to the compiled server.
const PUBLIC_DIR = fileURLToPath(new URL("./public/", import.meta.url));
const PUBLIC_FILES = new Set(["index.html", "app.js", "styles.css"]);

// Serves /, /app.js and /styles.css; returns false for any other path.
export function serveDashboardFile(res: ServerResponse, pathname: string): boolean {
  const name = pathname === "/" ? "index.html" : basename(pathname);
  if (pathname !== "/" && pathname !== `/${name}`) return false;
  if (!PUBLIC_FILES.has(name)) return false;
  res.writeHead(200, { "content-type": MIME[extname(name)], "cache-control": "no-cache" });
  createReadStream(join(PUBLIC_DIR, name)).pipe(res);
  return true;
}
