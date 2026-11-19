// Development server for the guide: `node serve.ts` serves the app/ folder
// at http://localhost:8080 (or --port <n>). Plain Node 22 standard library,
// no dependencies. It only ever serves files inside app/, answers GET and
// HEAD, and logs each request in one line. Do not put this on the internet.
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = resolve(fileURLToPath(new URL('./app', import.meta.url)));

const mimeByExt = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
]);

// Turn a request target into a file inside APP_ROOT, or null when the
// target escapes it. Query strings and fragments are dropped first.
function resolveInsideApp(target) {
  let clean = target.split('?')[0].split('#')[0];
  try {
    clean = decodeURIComponent(clean);
  } catch {
    return null;
  }
  const candidate = resolve(APP_ROOT, `.${sep}${clean}`);
  if (candidate !== APP_ROOT && !candidate.startsWith(APP_ROOT + sep)) return null;
  return candidate;
}

async function handle(req, res) {
  const started = Date.now();
  const finish = (code) => {
    res.on('finish', () => console.log(`${req.method} ${req.url} -> ${code} (${Date.now() - started}ms)`));
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    finish(405);
    res.writeHead(405, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Method not allowed\n');
    return;
  }
  let file = resolveInsideApp(req.url ?? '/');
  if (file === null) {
    finish(404);
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found\n');
    return;
  }
  try {
    const info = await stat(file);
    if (info.isDirectory()) file = join(file, 'index.html');
    await stat(file);
  } catch {
    finish(404);
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found\n');
    return;
  }
  finish(200);
  // No caching while developing: a stale guide is the worst kind of bug
  // when you are checking a fresh edit.
  res.writeHead(200, {
    'content-type': mimeByExt.get(extname(file)) ?? 'application/octet-stream',
    'cache-control': 'no-store',
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  createReadStream(file).pipe(res);
}

const argv = process.argv.slice(2);
const at = argv.indexOf('--port');
const wanted = at === -1 ? 8080 : Number(argv[at + 1]);
const port = Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;

createServer((req, res) => {
  handle(req, res).catch(() => {
    if (!res.headersSent) res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Server error\n');
  });
}).listen(port, () => {
  console.log(`Leonida Trophy Guide — serving ${APP_ROOT} at http://localhost:${port}`);
});
