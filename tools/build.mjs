// Builds the public copy of the game into deploy/ (or the folder given): only the files the game needs to run, nothing else.
//   node tools/build.mjs [outDir]
//
// WHAT GOES IN: index.html, manifest, icons, the service worker, and every module the game loads. The modules are FOUND, not listed: the build starts at
// the scripts index.html loads (and the sprite worker) and follows every import, so a file the game does not use never ships and a new file the game starts
// using ships without touching this script.
// WHAT STAYS OUT: reference/ (screenshots of other games), tools/ (the fight lab, sprite viewer, audits, tuning sliders: the dev tools), reports/, the
// README and the dev notes, anything else in the repo. At the end the build checks that none of that got in.
// OFFLINE + UPDATES: the service worker (sw.js) is filled in with the list of files and a VERSION, a hash of all of them. Change any file and the version
// changes, so installed copies download the new game and drop the old cache (see src/pwa.js for how the player is told).
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, statSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(process.argv[2] || join(ROOT, 'deploy'));
const toPosix = (p) => p.split(sep).join('/');

// ---- 1. follow the imports -----------------------------------------------------------------------------------------------------------------------
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const entries = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]);
entries.push('src/engine/spriteWorker.js'); // (started with new Worker(new URL(...)), which the import scan also finds; named here so a broken scan is loud)
const seen = new Set();
const queue = entries.map((e) => resolve(ROOT, e));
const RE = [/\bfrom\s*['"]([^'"]+)['"]/g, /\bimport\s*['"]([^'"]+)['"]/g, /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g, /new URL\(\s*['"]([^'"]+)['"]\s*,\s*import\.meta\.url\s*\)/g];
while (queue.length) {
  const file = queue.pop();
  if (seen.has(file)) continue;
  if (!existsSync(file)) throw new Error(`missing file: ${relative(ROOT, file)}`);
  seen.add(file);
  if (!file.endsWith('.js')) continue;
  const src = readFileSync(file, 'utf8');
  for (const re of RE) for (const m of src.matchAll(re)) {
    if (!m[1].startsWith('.')) continue; // (a bare name would be a package: there are none)
    queue.push(resolve(dirname(file), m[1]));
  }
}
const files = [...seen].map((f) => toPosix(relative(ROOT, f)));
for (const f of files) if (f.startsWith('..')) throw new Error(`${f} is outside the game folder`);

// ---- 2. the rest of the app --------------------------------------------------------------------------------------------------------------------
const manifest = JSON.parse(readFileSync(join(ROOT, 'manifest.webmanifest'), 'utf8'));
const icons = [...new Set([...manifest.icons.map((i) => i.src), 'icons/icon-32.png', 'icons/apple-touch-icon.png'])];
const statics = ['manifest.webmanifest', ...icons];
for (const f of statics) if (!existsSync(join(ROOT, f))) throw new Error(`missing ${f} (node tools/make-icons.mjs makes the icons)`);

// ---- 3. a version that changes when any file does -----------------------------------------------------------------------------------------------
const hash = createHash('sha1');
hash.update(process.env.KO_BUILD_SALT || ''); // (the update test builds twice from the same files and needs two versions)
for (const f of [...files, ...statics, 'index.html', 'sw.js'].sort()) { hash.update(f); hash.update(readFileSync(join(ROOT, f))); }
const VERSION = hash.digest('hex').slice(0, 12);

// ---- 4. write deploy/ ----------------------------------------------------------------------------------------------------------------------------
if (OUT === ROOT || !OUT.startsWith(ROOT + sep)) throw new Error(`refusing to wipe ${OUT} (it must be a folder inside the game folder)`);
rmSync(OUT, { recursive: true, force: true });
const put = (rel, data) => { const to = join(OUT, rel); mkdirSync(dirname(to), { recursive: true }); writeFileSync(to, data); };
for (const f of [...files, ...statics]) put(f, readFileSync(join(ROOT, f)));
put('index.html', html.replace('</head>', `  <meta name="ko-deploy" content="${VERSION}">\n</head>`));
// the service worker caches the shell (everything but itself) under this version's name
const precache = ['./', 'index.html', ...files, ...statics];
put('sw.js', readFileSync(join(ROOT, 'sw.js'), 'utf8').replace('__VERSION__', VERSION).replace("['__ASSETS__']", JSON.stringify(precache, null, 1)));
put('.nojekyll', ''); // (GitHub Pages: serve the folder as it is)
put('version.txt', `${VERSION}\n`);

// ---- 5. check it ---------------------------------------------------------------------------------------------------------------------------------
const all = [];
(function walk(d) { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : all.push(toPosix(relative(OUT, p))); } })(OUT);
const banned = all.filter((f) => /^(reference|tools|reports|docs|\.git|node_modules)\//.test(f) || /\.(md|html)$/i.test(f) && f !== 'index.html' || /spec/i.test(f) || /\.(jpe?g|webp|gif)$/i.test(f));
if (banned.length) throw new Error(`these must not ship: ${banned.join(', ')}`);
for (const f of precache) if (f !== './' && !all.includes(f)) throw new Error(`${f} is in the cache list but not in the build`);
// every path in the app is relative: no leading slash in a src/href, a module import or a URL
for (const f of all.filter((n) => /\.(html|js|webmanifest)$/.test(n))) {
  const t = readFileSync(join(OUT, f), 'utf8');
  const bad = [...t.matchAll(/(?:src|href)=["']\/(?!\/)|from\s+["']\/|"(?:start_url|scope|src)"\s*:\s*"\//g)];
  if (bad.length) throw new Error(`${f}: an absolute path (${bad[0][0]}) would break under a GitHub Pages subfolder`);
}
const bytes = all.reduce((a, f) => a + statSync(join(OUT, f)).size, 0);
console.log(`built ${relative(ROOT, OUT) || '.'}/  version ${VERSION}  ${all.length} files  ${(bytes / 1048576).toFixed(2)} MB`);
console.log(`  game modules: ${files.length}   (the repo has ${countJs()} .js files under src/ and data/; the rest are unused or dev-only)`);
function countJs() { let n = 0; (function w(d) { for (const e of readdirSync(d)) { const p = join(d, e); statSync(p).isDirectory() ? w(p) : p.endsWith('.js') && n++; } })(join(ROOT, 'src')); (function w(d) { for (const e of readdirSync(d)) { const p = join(d, e); statSync(p).isDirectory() ? w(p) : p.endsWith('.js') && n++; } })(join(ROOT, 'data')); return n; }
