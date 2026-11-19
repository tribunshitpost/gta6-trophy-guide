// Leonida Trophy Guide — the program that hands the guide in (Node 22,
// standard library only). The guide itself is the static files in app/ and
// the screenshots in screenshots/; this file copies both into the output
// directory and writes dossier.json, the summary the judge reads, with the
// vendored make.fun library. Run it as:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output.

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(here, 'app');
const shotsDir = join(here, 'screenshots');

function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from)) {
    const src = join(from, entry);
    const dest = join(to, entry);
    if (statSync(src).isDirectory()) copyTree(src, dest);
    else copyFileSync(src, dest);
  }
}

function countFiles(dir) {
  let n = 0;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    n += statSync(path).isDirectory() ? countFiles(path) : 1;
  }
  return n;
}

// The entry is not complete without its front page and its screenshots:
// refuse to hand in a half-built guide rather than fail the judge quietly.
if (!existsSync(join(appDir, 'index.html'))) {
  throw new Error('app/index.html is missing — the guide has no front page');
}
// The data file is the heart of the guide: check it parses and names all
// 55 trophies before handing anything in.
const trophyData = JSON.parse(readFileSync(join(appDir, 'data', 'trophies.json'), 'utf-8'));
const trophyCount = Array.isArray(trophyData.trophies) ? trophyData.trophies.length : 0;
if (trophyCount !== 55) {
  throw new Error(`app/data/trophies.json must hold 55 trophies, found ${trophyCount}`);
}
const shotFiles = existsSync(shotsDir)
  ? readdirSync(shotsDir).filter((f) => /\.(png|jpe?g)$/i.test(f))
  : [];
if (shotFiles.length < 3 || shotFiles.length > 4) {
  throw new Error(`screenshots/ must hold 3 or 4 images, found ${shotFiles.length}`);
}

mkdirSync(outDir, { recursive: true });
copyTree(appDir, join(outDir, 'app'));
copyTree(shotsDir, join(outDir, 'screenshots'));

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the others refuse an entry the scorer would refuse (more than
// 4 screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 48 MiB of app files).
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

console.log(
  `Leonida Trophy Guide handed in: ${countFiles(join(outDir, 'app'))} app files, ` +
    `${shotFiles.length} screenshots, dossier.json written to ${outDir}`,
);
