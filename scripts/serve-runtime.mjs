import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { createRequestListener } from "@react-router/node";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, "..");
const clientBuildDirectory = path.join(workspaceRoot, "build", "client");
const publicDirectory = path.join(workspaceRoot, "public");
const serverBuildPath = path.join(workspaceRoot, "build", "server", "index.js");
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST;

const ONE_HOUR_IN_SECONDS = 60 * 60;
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;
const IMMUTABLE_ASSET_CACHE_CONTROL = `public, max-age=${ONE_YEAR_IN_SECONDS}, immutable, no-transform`;
const STATIC_FILE_CACHE_CONTROL = `public, max-age=${ONE_HOUR_IN_SECONDS}, no-transform`;

const mimeTypes = new Map([
  [".css", "text/css; charset=UTF-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=UTF-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "application/javascript; charset=UTF-8"],
  [".json", "application/json; charset=UTF-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=UTF-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function isSafeSubpath(rootDirectory, candidatePath) {
  const relativePath = path.relative(rootDirectory, candidatePath);
  return relativePath === "" || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

function resolveRequestPath(rootDirectory, pathname) {
  const relativePath = pathname.replace(/^\/+/, "");
  const resolvedPath = path.resolve(rootDirectory, relativePath);

  if (!isSafeSubpath(rootDirectory, resolvedPath)) {
    return null;
  }

  return resolvedPath;
}

async function resolveStaticFile(pathname) {
  const candidates = [
    {
      absolutePath: resolveRequestPath(clientBuildDirectory, pathname),
      cacheControl: pathname.startsWith("/assets/") ? IMMUTABLE_ASSET_CACHE_CONTROL : STATIC_FILE_CACHE_CONTROL,
    },
    {
      absolutePath: resolveRequestPath(publicDirectory, pathname),
      cacheControl: STATIC_FILE_CACHE_CONTROL,
    },
  ];

  for (const candidate of candidates) {
    if (!candidate.absolutePath) {
      continue;
    }

    try {
      await access(candidate.absolutePath);
      const fileStats = await stat(candidate.absolutePath);

      if (!fileStats.isFile()) {
        continue;
      }

      return {
        absolutePath: candidate.absolutePath,
        cacheControl: candidate.cacheControl,
        fileStats,
      };
    } catch {
      continue;
    }
  }

  return null;
}

function setStaticResponseHeaders(response, pathname, fileStats, cacheControl) {
  const extension = path.extname(pathname).toLowerCase();
  const contentType = mimeTypes.get(extension) ?? "application/octet-stream";

  response.setHeader("Cache-Control", cacheControl);
  response.setHeader("Content-Length", fileStats.size);
  response.setHeader("Content-Type", contentType);
  response.setHeader("Last-Modified", fileStats.mtime.toUTCString());
}

async function maybeServeStaticFile(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }

  const requestUrl = new URL(request.url ?? "/", "http://localhost");
  const pathname = requestUrl.pathname;
  const staticFile = await resolveStaticFile(pathname);

  if (!staticFile) {
    return false;
  }

  setStaticResponseHeaders(response, pathname, staticFile.fileStats, staticFile.cacheControl);

  if (request.method === "HEAD") {
    response.statusCode = 200;
    response.end();
    return true;
  }

  await new Promise((resolve, reject) => {
    const stream = createReadStream(staticFile.absolutePath);
    stream.on("error", reject);
    response.on("close", resolve);
    stream.on("end", resolve);
    stream.pipe(response);
  }).catch((error) => {
    if (!response.headersSent) {
      response.statusCode = 500;
      response.end("Static asset delivery failed.");
      return;
    }

    response.destroy(error);
  });

  return true;
}

const buildModule = await import(pathToFileURL(serverBuildPath).href);
const requestListener = createRequestListener({
  build: buildModule,
  mode: process.env.NODE_ENV,
});

const server = createServer(async (request, response) => {
  if (await maybeServeStaticFile(request, response)) {
    return;
  }

  requestListener(request, response);
});

function logServerAddress() {
  const actualHost = host && host.length > 0 ? host : "localhost";
  console.log(`[arcade-runtime] http://${actualHost}:${port}`);
}

if (host && host.length > 0) {
  server.listen(port, host, logServerAddress);
} else {
  server.listen(port, logServerAddress);
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    server.close((error) => {
      if (error) {
        console.error(error);
      }
    });
  });
}