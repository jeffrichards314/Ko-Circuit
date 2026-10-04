// PWA test (a dev tool): serves a built copy from a subfolder URL like GitHub Pages does, then checks install, offline play, saves across a reload, and
// that a second build reaches a player who has the first one.
//   PW_CORE=.../playwright-core/index.mjs node tools/pwa-e2e.mjs
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { chromium, devices } = await import(process.env.PW_CORE || 'playwright-core');
const CHROME = process.env.CHROME || `${homedir()}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.txt': 'text/plain' };
let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { fails++; console.log('  FAIL', m); } else console.log('  ok  ', m); };

const OUT = 'deploy-test';
let salt = '';
const build = () => execFileSync('node', [join(ROOT, 'tools/build.mjs'), join(ROOT, OUT)], { encoding: 'utf8', env: { ...process.env, KO_BUILD_SALT: salt } }).split('\n')[0];
console.log(build());
// like GitHub Pages: a subfolder, ten minutes of HTTP caching
const BASE = '/some/sub/ko-circuit/';
const srv = createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (!u.startsWith(BASE)) { res.writeHead(404); return res.end(); }
  let f = join(ROOT, OUT, u.slice(BASE.length) || 'index.html');
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { res.writeHead(404); return res.end('nope'); }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream', 'cache-control': 'max-age=600' });
  res.end(readFileSync(f));
}).listen(0);
const URL_ = `http://127.0.0.1:${srv.address().port}${BASE}`;
const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({ ...devices['iPhone 13 landscape'] });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
const notFound = []; p.on('response', (r) => { if (r.status() >= 400) notFound.push(`${r.status()} ${r.url()}`); });
await p.goto(URL_ + '?dev');
await p.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller === null ? false : true, null, { timeout: 5000 }).catch(() => {});
await p.waitForTimeout(6000);
const st = await p.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); const k = await caches.keys(); return { scope: r && r.scope, active: !!(r && r.active), keys: k, n: k.length ? (await (await caches.open(k[0])).keys()).length : 0, ver: document.querySelector('meta[name=ko-deploy]').content }; });
ok(st.active && st.scope === URL_, `service worker active at the subfolder scope (${st.scope})`);
ok(st.keys.length === 1 && st.keys[0] === `kocircuit-${st.ver}` && st.n > 500, `one cache named for the version, ${st.n} files`);
ok(notFound.length === 0, `no 404s from the subfolder (${notFound.slice(0, 3).join(', ')})`);
const manifest = await p.evaluate(async () => { const m = await (await fetch(document.querySelector('link[rel=manifest]').href)).json(); const res = await Promise.all(m.icons.map((i) => fetch(new URL(i.src, document.baseURI)).then((r) => r.status))); return { name: m.name, start: m.start_url, res }; });
ok(manifest.res.every((s) => s === 200), `manifest icons load (${manifest.res})`);
// a game in progress, then offline
await p.evaluate(() => localStorage.setItem('kocircuit.probe', JSON.stringify({ hello: 1 })));
await p.reload(); await p.waitForTimeout(1500);
await ctx.setOffline(true);
await p.reload(); await p.waitForFunction(() => document.getElementById('screen') && window.devicePixelRatio, null, { timeout: 8000 });
await p.waitForTimeout(2500);
const off = await p.evaluate(() => ({ canvas: !!document.getElementById('screen'), probe: localStorage.getItem('kocircuit.probe'), pad: document.getElementById('touch').className, text: document.body.innerText.slice(0, 40) }));
ok(off.canvas && off.pad === 'on', 'offline: the game loads from the cache (pad drawn)');
ok(off.probe === '{"hello":1}', 'offline, after a reload: localStorage (the saves) is still there');
// the picture is really drawn: a pixel of the title screen is not black
const drawn = await p.evaluate(() => { const c = document.getElementById('screen'); const d = c.getContext('2d').getImageData(c.width / 2, c.height * 0.2, 1, 1).data; return d[0] + d[1] + d[2]; });
ok(drawn > 0, 'offline: the title screen is on the canvas');
await ctx.setOffline(false);
// update: change one game file, build again; the player still has the first build open
{
  salt = 'one';
  console.log(build());
  const v2 = readFileSync(join(ROOT, OUT, 'version.txt'), 'utf8').trim();
  ok(v2 !== st.ver, `a changed file gives a new version (${st.ver} -> ${v2})`);
  await p.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); await r.update(); });
  await p.waitForTimeout(5000);
  const card = await p.evaluate(() => !!document.getElementById('update-card') || document.querySelector('meta[name=ko-deploy]').content);
  const keys = await p.evaluate(async () => caches.keys());
  info2(`after the update check: ${JSON.stringify(keys)}`);
  // on the title screen the new version is applied at once and the page reloads itself
  await p.waitForTimeout(3000);
  const nowVer = await p.evaluate(async () => { const ks = await caches.keys(); return ks; });
  ok(nowVer.length === 1 && nowVer[0] === `kocircuit-${v2}`, `the old cache is gone, the new one is in (${nowVer})`);
  const ver2 = await p.evaluate(() => document.querySelector('meta[name=ko-deploy]').content);
  ok(ver2 === v2, `the page reloaded into the new version (${ver2})`);
  void card;
}
// the same, with the player in the middle of something (not the title screen): the update waits behind a card, the game is not reloaded under them,
// and a tap on the card applies it
{
  const verNow = await p.evaluate(() => document.querySelector('meta[name=ko-deploy]').content);
  await p.evaluate(() => KO.go('options')); await p.waitForTimeout(500);
  salt = 'two';
  try {
    console.log(build());
    const v3 = readFileSync(join(ROOT, OUT, 'version.txt'), 'utf8').trim();
    await p.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); await r.update(); });
    await p.waitForTimeout(5000);
    const mid = await p.evaluate(() => ({ card: !!document.getElementById('update-card'), screen: KO.screen.constructor.name, ver: document.querySelector('meta[name=ko-deploy]').content }));
    ok(mid.card && mid.screen === 'OptionsScreen' && mid.ver === verNow, `mid-game: the update waits behind a card and the player stays where they are (${JSON.stringify(mid)})`);
    const box = await p.evaluate(() => { const r = document.getElementById('update-card').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    await p.touchscreen.tap(box.x, box.y);
    await p.waitForTimeout(4000);
    const end = await p.evaluate(async () => ({ ver: document.querySelector('meta[name=ko-deploy]').content, keys: await caches.keys() }));
    ok(end.ver === v3 && end.keys.length === 1 && end.keys[0] === `kocircuit-${v3}`, `tapping the card installs the new version and drops the old cache (${end.ver}, ${end.keys})`);
  } finally { /* (nothing of the game was edited) */ }
}
function info2(m) { console.log('  ' + m); }
ok(errs.length === 0, `no page errors ${errs.join(' | ')}`);
await browser.close(); srv.close();
execFileSync('rm', ['-rf', join(ROOT, OUT)]);
console.log(`\n${checks} checks, ${fails} failed`);
process.exit(fails ? 1 : 0);
