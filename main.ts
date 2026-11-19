// Leonida Trophy Guide — make.fun gta6-trophy-guide-01 entry (Node 22,
// standard library only). The guide itself is the static files in app/:
// index.html opens in a desktop browser and works with the network off,
// and its trophy list and cited guides live in app/data/trophies.json.
// This program hands the guide in: it copies app/ and screenshots/ from
// beside this file into the output directory and writes dossier.json,
// the summary the judge reads (screenshots, first-load files and bytes,
// and the source), using the vendored make.fun library. Leave
// vendor/makefun-frontend.ts untouched: the scorer rebuilds the dossier
// with its own copy and requires the two to match byte for byte.
//
// Serve the guide locally with `node serve.ts`, then open
// http://localhost:8080. Outside the grader's container,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Caps mirror the scorer's gate so a local run refuses what the scorer
// would refuse: at most 4 screenshots, none over 256 KiB; app/ at most
// 993 files and directories and 48 MiB; dossier text at most 160 KiB.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
