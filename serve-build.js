/**
 * serve-build.js
 * Serves the `out/` directory at the /Resume-Nextjs basePath,
 * matching the production Next.js build configuration.
 *
 * Usage: node serve-build.js
 * Then open: http://localhost:3000/Resume-Nextjs/
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const BASE_PATH = "/Resume-Nextjs";
const OUT_DIR = path.join(__dirname, "out");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript",
  ".css":  "text/css",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif":  "image/gif",
  ".ico":  "image/x-icon",
  ".json": "application/json",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".txt":  "text/plain",
  ".pdf":  "application/pdf",
  ".webp": "image/webp",
  ".map":  "application/json",
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split("?")[0]; // strip query string

  // Redirect root to basePath
  if (urlPath === "/" || urlPath === "") {
    res.writeHead(302, { Location: BASE_PATH + "/" });
    res.end();
    return;
  }

  // Strip the basePath prefix to get the file path within out/
  if (urlPath.startsWith(BASE_PATH)) {
    urlPath = urlPath.slice(BASE_PATH.length);
  }

  if (!urlPath || urlPath === "/") {
    urlPath = "/index.html";
  }

  // Try exact path, then with .html, then index.html inside directory
  let filePath = path.join(OUT_DIR, urlPath);

  const tryPaths = [
    filePath,
    filePath.endsWith("/") ? path.join(filePath, "index.html") : filePath + ".html",
    path.join(filePath, "index.html"),
  ];

  let found = null;
  for (const p of tryPaths) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      found = p;
      break;
    }
  }

  if (!found) {
    // Try 404.html
    const notFound = path.join(OUT_DIR, "404.html");
    if (fs.existsSync(notFound)) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(fs.readFileSync(notFound));
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found: " + urlPath);
    }
    console.log(`  404  ${req.url}`);
    return;
  }

  const ext = path.extname(found).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  res.writeHead(200, { "Content-Type": contentType });
  res.end(fs.readFileSync(found));
  console.log(`  200  ${req.url}`);
});

server.listen(PORT, () => {
  console.log(`\n🚀 Serving production build at: http://localhost:${PORT}${BASE_PATH}/\n`);
  console.log(`   Static files served from: ${OUT_DIR}`);
  console.log(`   Base path: ${BASE_PATH}`);
  console.log(`\n   Press Ctrl+C to stop.\n`);
});
