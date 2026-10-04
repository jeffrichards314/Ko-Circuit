// Touch end-to-end test (a dev tool; not part of the public deploy): drives the real game in headless Chrome with touch emulation, at phone and tablet sizes,
// in both orientations, and plays one full flow with fingers only.
//   npm i playwright-core         (anywhere; then:  PW_CORE=/path/to/node_modules/playwright-core/index.mjs node tools/touch-e2e.mjs [--url http://localhost:PORT] [--shots dir] [--only layout|input|flow])
//   Chrome: set CHROME=/path/to/chrome, or it uses Playwright's cache (~/Library/Caches/ms-playwright on a Mac).
// It needs a dev server (python3 tools/serve.py PORT) and uses ?dev for the console handle (window.KO).
//   layout  every device x orientation: the picture as big as fits, the pad never touches it, upright shows a Game Boy layout (picture on top, pad below)
//   input   real multi-touch through CDP: Up held while A is tapped, double-tap Down, thumb rolling B -> A, one frame of latency from finger to game
//   flow    new game -> name -> home gym (walk by tap, the bag drill on the pad) -> Rookie fight (a bot reads the fight and works the pad) -> map travel -> podium
//           rematch -> password shown at the desk, typed back in on the on-screen keyboard -> the same career in another save; LOAD GAME
import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : d; };
const URL_ = (arg('--url', 'http://localhost:8420')).replace(/\/$/, '') + '/?dev';
const SHOTS = arg('--shots', 'touch-shots');
const ONLY = arg('--only', null);
const { chromium, devices } = await import(process.env.PW_CORE || 'playwright-core');
const CHROME = process.env.CHROME || `${homedir()}/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
mkdirSync(SHOTS, { recursive: true });

let fails = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; console.log('  FAIL', msg); } return cond; };
const info = (m) => console.log('  ' + m);
const browser = await chromium.launch({ executablePath: CHROME });

async function open(deviceName, extra = {}) {
  const ctx = await browser.newContext({ ...devices[deviceName], ...extra });
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  p.on('pageerror', (e) => errs.push(`PAGEERR ${e}`));
  const cdp = await ctx.newCDPSession(p);
  await p.goto(URL_);
  await p.waitForFunction(() => window.KO && KO.screen, null, { timeout: 20000 });
  const H = { ctx, p, cdp, errs, name: deviceName };
  H.wait = (ms) => p.waitForTimeout(ms);
  H.screen = () => p.evaluate(() => KO.screen.constructor.name);
  H.until = async (name, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if ((await H.screen()) === name) return true; await H.wait(100); } return false; };
  H.touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((q) => ({ x: q.x, y: q.y, id: q.id ?? 0 })) });
  H.tapAt = async (x, y, hold = 40) => { await H.touch('touchStart', [{ x, y }]); await H.wait(hold); await H.touch('touchEnd', []); await H.wait(70); };
  H.nat = async (nx, ny) => { const r = await p.evaluate(() => { const c = document.getElementById('screen').getBoundingClientRect(); return [c.x, c.y, c.width, c.height]; }); return { x: r[0] + ((nx + 0.5) * r[2]) / 256, y: r[1] + ((ny + 0.5) * r[3]) / 224 }; };
  H.tapNat = async (nx, ny) => { const q = await H.nat(nx, ny); await H.tapAt(q.x, q.y); };
  H.rects = () => p.evaluate(() => {
    const o = {};
    for (const c of document.querySelectorAll('#touch canvas')) { const r = c.getBoundingClientRect(); (o[c.className] ||= []).push({ x: r.x, y: r.y, w: r.width, h: r.height }); }
    const cv = document.getElementById('screen').getBoundingClientRect();
    o.game = [{ x: cv.x, y: cv.y, w: cv.width, h: cv.height }];
    return o;
  });
  H.shot = (n) => p.screenshot({ path: `${SHOTS}/${n}.png` });
  // the centre of a pad control, in css px: dpad (centre), a, b, star (round buttons in that order), start, pause
  H.ctl = async (name) => {
    const R = await H.rects(), mid = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
    if (name === 'dpad') return mid(R.dpad[0]);
    if (name === 'start') return mid(R.pill[1]);
    if (name === 'pause') return mid(R.pill[0]);
    return mid(R.round[{ star: 0, a: 1, b: 2 }[name]]);
  };
  H.dir = async (d) => { const c = await H.ctl('dpad'), r = (await H.rects()).dpad[0], k = r.w / 3; return { x: c.x + (d === 'right' ? k : d === 'left' ? -k : 0), y: c.y + (d === 'down' ? k : d === 'up' ? -k : 0) }; };
  H.close = () => ctx.close();
  return H;
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------
async function layout() {
  console.log('LAYOUT');
  const list = [
    ['small phone', 'iPhone SE'], ['small phone', 'iPhone SE landscape'], ['large phone', 'iPhone 14 Pro Max'], ['large phone', 'iPhone 14 Pro Max landscape'],
    ['android', 'Pixel 7'], ['android', 'Pixel 7 landscape'], ['tablet', 'iPad (gen 7)'], ['tablet', 'iPad (gen 7) landscape'], ['tablet', 'iPad Pro 11 landscape'],
  ];
  for (const [kind, dev] of list) {
    const H = await open(dev);
    const d = devices[dev], land = d.viewport.width > d.viewport.height;
    const R = await H.rects();
    const S = await H.p.evaluate(() => ({ scale: KO.display.scale, dpr: devicePixelRatio, cw: document.getElementById('screen').width, pad: document.getElementById('touch').classList.contains('on') }));
    const label = `${kind.padEnd(12)} ${dev.padEnd(28)} ${d.viewport.width}x${d.viewport.height}@${d.deviceScaleFactor}`;
    const g = R.game[0], VW = d.viewport.width, VH = d.viewport.height;
    ok(S.pad, `${label}: pad not shown`);
    let clash = 0;
    for (const k of ['dpad', 'pill', 'round']) for (const r of R[k]) if (r.x < g.x + g.w && r.x + r.w > g.x && r.y < g.y + g.h && r.y + r.h > g.y) clash++;
    ok(clash === 0, `${label}: ${clash} controls cover the picture`);
    let off = 0; for (const k of ['dpad', 'pill', 'round']) for (const r of R[k]) if (r.x < -1 || r.y < -1 || r.x + r.w > VW + 1 || r.y + r.h > VH + 1) off++;
    ok(off === 0, `${label}: ${off} controls off screen`);
    const minBtn = Math.min(...R.round.map((r) => r.w));
    ok(minBtn >= 34, `${label}: buttons too small (${Math.round(minBtn)}px)`);
    ok(g.x >= -1 && g.y >= -1 && g.x + g.w <= VW + 1 && g.y + g.h <= VH + 1, `${label}: the picture is off the screen`);
    if (land) {
      // the picture takes the whole height, unless the pad needs the width (then at least 75% of the height)
      ok(g.h >= VH * 0.75, `${label}: picture only ${Math.round((g.h / VH) * 100)}% of the height`);
      info(`${label}: picture ${Math.round(g.w)}x${Math.round(g.h)} (${Math.round((g.h / VH) * 100)}% of the height), buttons ${Math.round(minBtn)}px`);
    } else {
      // upright: the picture across the top at the full width (a Game Boy), the pad below it
      ok(g.w >= VW * 0.9 || g.h >= VH * 0.55, `${label}: picture only ${Math.round((g.w / VW) * 100)}% of the width`);
      const below = [...R.dpad, ...R.pill, ...R.round].every((r) => r.y >= g.y + g.h - 1);
      ok(below, `${label}: the pad is not all below the picture`);
      ok(R.dpad[0].x < VW / 2 && R.round.every((r) => r.x > VW / 2 - 1), `${label}: D-pad not on the left / buttons not on the right`);
      info(`${label}: picture ${Math.round(g.w)}x${Math.round(g.h)} (${Math.round((g.w / VW) * 100)}% of the width), buttons ${Math.round(minBtn)}px`);
    }
    await H.shot(`layout-${dev.replace(/[ ()]/g, '_')}`);
    ok(H.errs.length === 0, `${label}: console errors ${H.errs.join(' | ')}`);
    await H.close();
  }
  // turning a phone while the game runs: the pad follows (beside the picture, then below it)
  const H = await open('iPhone 13 landscape');
  await H.p.setViewportSize({ width: 390, height: 664 }); await H.wait(500);
  let R = await H.rects(), g = R.game[0];
  ok(R.dpad[0].y >= g.y + g.h - 1 && g.w >= 380, 'turned upright: the pad is not under a full-width picture');
  await H.p.setViewportSize({ width: 664, height: 390 }); await H.wait(500);
  R = await H.rects(); g = R.game[0];
  ok(R.dpad[0].x + R.dpad[0].w <= g.x + 1 && R.round.every((r) => r.x >= g.x + g.w - 1), 'turned back: the pad is not beside the picture');
  // sharp mode keeps whole-number sizes
  await H.p.evaluate(() => { KO.options.screenFit = 2; KO.touch.refresh(); });
  const sharp = await H.p.evaluate(() => ({ cw: document.getElementById('screen').width, css: document.getElementById('screen').getBoundingClientRect().width, dpr: devicePixelRatio }));
  ok(Number.isInteger(sharp.cw / 256) && Math.abs(sharp.css * sharp.dpr - sharp.cw) < 1.5, `SHARP: not a whole-number scale (${sharp.cw}px canvas, ${sharp.css} css)`);
  await H.close();
  // the pad hides for a keyboard and returns for a finger; ALWAYS/OFF modes
  const K = await open('iPad (gen 7) landscape');
  const vis = () => K.p.evaluate(() => document.getElementById('touch').classList.contains('on'));
  ok(await vis(), 'pad hidden at start on a touch device');
  await K.p.keyboard.press('KeyX'); await K.wait(200);
  ok(!(await vis()), 'pad still shown after a key press');
  const big = (await K.rects()).game[0].w;
  await K.tapAt(400, 300); await K.wait(200);
  ok(await vis(), 'pad not back after a touch');
  ok((await K.rects()).game[0].w <= big, 'picture did not give room back to the pad');
  await K.close();
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------
async function input() {
  console.log('INPUT');
  const H = await open('iPhone 13 landscape');
  // record every step's presses
  await H.p.evaluate(() => {
    const I = KO.input, orig = I.update.bind(I);
    window.__log = [];
    I.update = function () { orig(); const f = {}; for (const a of ['up', 'down', 'left', 'right', 'a', 'b', 'star', 'start', 'pause']) { if (I.edge[a]) (f.e ||= []).push(a); if (I.state[a]) (f.h ||= []).push(a); } if (f.e || f.h || window.__log.length) window.__log.push(f); if (window.__log.length > 400) window.__log.shift(); };
  });
  const take = async () => { const l = await H.p.evaluate(() => { const l = window.__log; window.__log = []; return l; }); return l; };
  const up = await H.dir('up'), down = await H.dir('down'), A = await H.ctl('a'), B = await H.ctl('b');
  await take();
  // Up held, then A tapped twice with the other thumb
  // (CDP: touchEnd lists the fingers that LIFT)
  const U = { x: up.x, y: up.y, id: 1 }, Ap = { x: A.x, y: A.y, id: 2 };
  await H.touch('touchStart', [U]); await H.wait(80);
  await H.touch('touchStart', [U, Ap]); await H.wait(60);
  await H.touch('touchEnd', [Ap]); await H.wait(60);
  await H.touch('touchStart', [U, Ap]); await H.wait(60);
  await H.touch('touchEnd', [Ap]); await H.wait(60);
  await H.touch('touchEnd', [U]); await H.wait(100);
  let l = await take();
  const aEdges = l.filter((f) => f.e && f.e.includes('a')).length;
  const upWithA = l.filter((f) => f.e && f.e.includes('a') && f.h && f.h.includes('up')).length;
  ok(aEdges === 2, `Up+A: expected 2 A presses, saw ${aEdges}`);
  ok(upWithA === 2, `Up+A: Up was held on only ${upWithA} of 2 A presses`);
  ok(l.some((f) => !f.h || !f.h.includes('up')) , 'Up never released');
  // double-tap Down: two separate presses a few frames apart
  await take();
  for (let i = 0; i < 2; i++) { await H.touch('touchStart', [{ x: down.x, y: down.y }]); await H.wait(50); await H.touch('touchEnd', []); await H.wait(90); }
  l = await take();
  const dEdges = l.filter((f) => f.e && f.e.includes('down')).length;
  ok(dEdges === 2, `double-tap Down: expected 2 presses, saw ${dEdges}`);
  // a thumb rolling from B onto A
  await take();
  await H.touch('touchStart', [{ x: B.x, y: B.y }]); await H.wait(70);
  await H.touch('touchMove', [{ x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 }]); await H.wait(40);
  await H.touch('touchMove', [{ x: A.x, y: A.y }]); await H.wait(70);
  await H.touch('touchEnd', []); await H.wait(60);
  l = await take();
  ok(l.some((f) => f.e && f.e.includes('b')) && l.some((f) => f.e && f.e.includes('a')), 'roll B -> A: both buttons should have been pressed');
  // a quick tap (finger down and up inside one frame) still counts as a press
  await take();
  for (let i = 0; i < 5; i++) { await H.touch('touchStart', [{ x: A.x, y: A.y }]); await H.touch('touchEnd', []); await H.wait(50); }
  l = await take();
  ok(l.filter((f) => f.e && f.e.includes('a')).length === 5, `5 very quick taps on A: counted ${l.filter((f) => f.e && f.e.includes('a')).length}`);
  // diagonal and slide
  await take();
  await H.touch('touchStart', [{ x: up.x, y: up.y }]); await H.wait(50);
  const d = await H.dir('right'); await H.touch('touchMove', [{ x: d.x, y: up.y + (d.y - up.y) * 0 + 5 }]); await H.wait(60);
  await H.touch('touchEnd', []); await H.wait(60);
  l = await take();
  ok(l.some((f) => f.h && f.h.includes('right')), 'sliding the thumb from Up to Right did not press Right');
  // latency: a finger down to the step that sees it. The game steps at 60 Hz, so this is at most one step (17 ms) plus the event's own trip.
  const lat = await H.p.evaluate(async (A) => {
    const out = [];
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 70 + Math.random() * 40));
      const t0 = performance.now();
      const seen = new Promise((res) => { const I = KO.input, orig = I.update; I.update = function () { orig.call(this); if (this.edge.a) { I.update = orig; res(performance.now()); } }; });
      const mk = (type, list) => new TouchEvent(type, { touches: list, targetTouches: list, changedTouches: [t], bubbles: true, cancelable: true });
      const t = new Touch({ identifier: 77, target: document.body, clientX: A.x, clientY: A.y });
      document.dispatchEvent(mk('touchstart', [t]));
      out.push((await seen) - t0);
      document.dispatchEvent(mk('touchend', []));
    }
    return out;
  }, A);
  const worst = Math.max(...lat), avg = lat.reduce((a, b) => a + b, 0) / lat.length;
  info(`latency, finger down -> game step that sees it: avg ${avg.toFixed(1)} ms, worst ${worst.toFixed(1)} ms (one step is 16.7 ms)`);
  ok(worst < 40, `touch latency too high (${worst.toFixed(1)} ms)`);
  // no page scrolling / zoom / selection / menu
  const guards = await H.p.evaluate(() => {
    const ev = (t) => { const e = new Event(t, { cancelable: true, bubbles: true }); document.dispatchEvent(e); return e.defaultPrevented; };
    return { ctx: ev('contextmenu'), sel: ev('selectstart'), scroll: [scrollX, scrollY], overflow: getComputedStyle(document.body).overflow, ua: getComputedStyle(document.body).userSelect, ta: getComputedStyle(document.body).touchAction, ob: getComputedStyle(document.body).overscrollBehaviorY };
  });
  ok(guards.ctx && guards.sel, 'context menu / text selection not prevented');
  ok(guards.ta === 'none' && guards.ob === 'none' && guards.ua === 'none', `page guards: touch-action ${guards.ta}, overscroll ${guards.ob}, user-select ${guards.ua}`);
  ok(H.errs.length === 0, `console errors ${H.errs.join(' | ')}`);
  await H.close();
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------
const KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-. '.split('');
async function flow() {
  console.log('FLOW');
  const dev = 'iPhone 13 landscape';
  const H = await open(dev);
  const { p } = H;
  const step = async (name, cond, msg) => { const good = await cond(); ok(good, `${name}: ${msg}`); if (good) info(`${name} ok`); else await H.shot(`flow-fail-${name.replace(/\W+/g, '_')}`); return good; };
  const key = async (ch, table, x0, y0, px, py) => { const i = table.indexOf(ch); await H.tapNat(x0 + (i % 10) * px + 5, y0 + Math.floor(i / 10) * py + 4); };

  // ---- new game
  await H.tapNat(128, 132); await H.wait(300);
  await step('title -> saves', async () => (await H.screen()) === 'SavesScreen', 'tap NEW GAME');
  await H.tapNat(128, 56); await H.wait(250); if ((await H.screen()) === 'SavesScreen') { await H.tapNat(128, 56); await H.wait(400); }
  await step('saves -> customize', async () => (await H.screen()) === 'CustomizeScreen', 'tap a slot twice');
  for (const ch of 'TAP') await key(ch, KEYS, 32, 96, 20, 14);
  ok((await p.evaluate(() => KO.screen.p.name)).endsWith('TAP'), 'name keyboard: letters not typed by tap');
  await H.tapNat(37, 96 + 4 * 14 + 4); await H.wait(250); // END
  await H.tapNat(160, 179); await H.wait(250); await H.tapNat(160, 179); await H.wait(900); // DONE (twice: choose, then press)
  await step('customize -> map', async () => (await H.screen()) === 'WorldMapScreen', 'name entry and DONE by tap');
  await H.shot('flow-1-map');

  // ---- map: walk by tap; the home gym
  const nodeNat = (id) => p.evaluate((id) => { const S = KO.screen, n = S.W.nodes[id]; return { x: n.x - S.cam.x, y: n.y - 10 - S.cam.y + 24 }; }, id);
  const tapNode = async (id) => { const q = await nodeNat(id); await H.tapNat(q.x, q.y); };
  const arrived = async (id, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.evaluate((id) => { const w = KO.screen.walker; return w && !w.edge && w.node === id && !w.route.length; }, id)) return true; await H.wait(150); } return false; };
  await tapNode('home'); await H.wait(400);
  await step('map -> home gym', async () => (await H.until('InteriorScreen', 4000)), 'tap the marker you stand on');
  // the interior: tap a station: it walks you there; tap it again to use it
  const stationNat = (id) => p.evaluate((id) => { const S = KO.screen, s = S.L.stations.find((x) => x.id === id); return { x: s.x - S.camX, y: 120 }; }, id);
  const atStation = async (id) => { const t0 = Date.now(); while (Date.now() - t0 < 12000) { if (await p.evaluate((id) => { const S = KO.screen, s = S.L.stations.find((x) => x.id === id); return S.goal == null && Math.abs(S.px - s.x) < 20; }, id)) return true; await H.wait(100); } return false; };
  const useStation = async (id) => {
    // (a station off the edge of the picture: walk toward it with the D-pad until it is on screen, as a player would)
    for (let i = 0; i < 40; i++) {
      const n = await stationNat(id);
      if (n.x > 24 && n.x < 232) break;
      await H.touch('touchStart', [await H.dir(n.x > 128 ? 'right' : 'left')]); await H.wait(350); await H.touch('touchEnd', []); await H.wait(100);
    }
    let q = await stationNat(id); await H.tapNat(q.x, q.y); await H.wait(200); const t = await atStation(id); q = await stationNat(id); await H.tapNat(q.x, q.y); await H.wait(500); return t; };
  await useStation('bag');
  await step('bag drill opens', async () => (await H.until('TrainingScreen', 3000)), 'two taps on the speed bag');
  // the speed bag on the pad: a tap anywhere starts the drill, A and B are the hands
  await H.tapNat(128, 110); await H.wait(300);
  const A = await H.ctl('a'), B = await H.ctl('b');
  await H.wait(600);
  const hits = await p.evaluate(async (A) => { const d = KO.screen.drill; return d ? d.t : -1; });
  ok(hits >= 0, 'speed bag did not start on a tap');
  const before = await p.evaluate(() => KO.screen.drill && KO.screen.drill.pose);
  await H.tapAt(A.x, A.y); await H.wait(30);
  const after = await p.evaluate(() => KO.screen.drill && KO.screen.drill.pose);
  ok(after && after !== before || after === 'jabR_high', 'speed bag: A on the pad threw nothing');
  await H.tapAt(B.x, B.y);
  await H.tapAt((await H.ctl('pause')).x, (await H.ctl('pause')).y); await H.wait(400);
  await H.tapAt((await H.ctl('pause')).x, (await H.ctl('pause')).y); await H.wait(600); // PAUSE out of the drill, then out of the camp
  await step('back to the gym', async () => (await H.until('InteriorScreen', 3000)) || (await H.until('WorldMapScreen', 500)), 'PAUSE leaves the drill');
  if ((await H.screen()) === 'WorldMapScreen') { await tapNode('home'); await H.wait(600); }
  // leave by the door: tap it twice
  await useStation('exit');
  await step('exit by tap', async () => (await H.until('WorldMapScreen', 4000)), 'the door');

  // ---- the Rookie circuit and its first fight
  await tapNode('rookie'); await H.wait(300);
  ok(await arrived('rookie'), 'a tap on the Rookie marker did not walk there');
  await tapNode('rookie'); await H.wait(700);
  await step('map -> Rookie hall', async () => (await H.until('InteriorScreen', 4000)), 'second tap enters');
  const podium = (n) => p.evaluate((n) => KO.screen.L.stations.filter((s) => s.kind === 'podium')[n].id, n);
  await useStation(await podium(0));
  await step('podium -> fight card', async () => ['IntroScreen', 'CutsceneScreen'].includes(await H.screen()) || (await H.until('IntroScreen', 6000)), 'tap the first podium twice');
  // walk through the cutscenes / cards with taps until the fight starts
  const t0 = Date.now();
  while ((await H.screen()) !== 'FightScreen' && Date.now() - t0 < 40000) { await H.tapNat(128, 112); await H.wait(350); }
  info(`stopped on ${await H.screen()}`);
  await step('cards -> fight', async () => (await H.screen()) === 'FightScreen', 'taps on text boxes did not reach the fight');
  if ((await H.screen()) !== 'FightScreen') { await browser.close(); console.log(`\n${checks} checks, ${fails} failed`); process.exit(1); }
  await H.shot('flow-2-fight');
  await playFight(H, 'career fight');
  await step('fight -> results', async () => (await H.until('ResultsScreen', 10000)), 'the fight did not end');
  const won = await p.evaluate(() => KO.screen.won);
  ok(won, 'the touch-driven player lost the first Rookie fight');
  info(`fight won: ${won}`);
  await H.shot('flow-3-results');
  await H.wait(1400); await H.tapNat(128, 112); await H.wait(700);
  await step('results -> hall', async () => (await H.until('InteriorScreen', 6000)), 'a tap on the results card');

  // ---- map travel: out of the hall, to Home and back
  const B2 = await H.ctl('b'); await H.tapAt(B2.x, B2.y); await H.wait(600);
  await step('B leaves the hall', async () => (await H.until('WorldMapScreen', 4000)), 'B on the pad');
  info(`on ${await H.screen()}`);
  await H.touch('touchStart', [await H.dir('down')]); await H.wait(900); await H.touch('touchEnd', []); await H.wait(300); // (the path from Rookie back to Home leaves southward)
  const where = await p.evaluate(() => KO.screen.walker.node + '/' + !!KO.screen.walker.edge);
  info(`d-pad walked along the path: ${where}`);
  ok(where !== 'rookie/false', 'the D-pad did not move the runner along the path');
  await tapNode('rookie'); await H.wait(300);
  ok(await arrived('rookie'), 'tapping the marker did not walk back');
  await tapNode('rookie'); await H.wait(700);
  await H.until('InteriorScreen', 4000);

  // ---- the podium rematch
  const beaten = await p.evaluate(() => { const S = KO.screen, s = S.L.stations.find((x) => x.kind === 'podium'); return S.podState(s); });
  ok(beaten === 'beaten', `first podium should be a rematch now, is ${beaten}`);
  await useStation(await podium(0));
  const t1 = Date.now();
  while ((await H.screen()) !== 'FightScreen' && Date.now() - t1 < 30000) { await H.tapNat(128, 112); await H.wait(350); }
  info(`after the rematch podium: ${await H.screen()} ${JSON.stringify(await p.evaluate(() => KO.screen.L ? { px: Math.round(KO.screen.px), goal: KO.screen.goal, armed: KO.screen.armed, here: KO.screen.here && KO.screen.here.id, pods: KO.screen.L.stations.filter((s) => s.kind === 'podium').map((s) => [s.id, Math.round(s.x)]) } : null))}`);
  await step('rematch -> fight', async () => (await H.screen()) === 'FightScreen', 'rematch did not start');
  if ((await H.screen()) !== 'FightScreen') { await browser.close(); console.log(`\n${checks} checks, ${fails} failed`); process.exit(1); }
  await playFight(H, 'rematch');
  await step('rematch -> results', async () => (await H.until('ResultsScreen', 10000)), 'rematch did not end');
  await H.wait(1400); await H.tapNat(128, 112); await H.wait(700);
  await step('rematch results -> hall', async () => (await H.until('InteriorScreen', 6000)), 'tap on the results');

  // ---- password: the desk shows it, the title screen takes it back
  const B3 = await H.ctl('b'); await H.tapAt(B3.x, B3.y); await H.wait(600); await H.until('WorldMapScreen', 4000);
  await tapNode('home'); await H.wait(300); ok(await arrived('home'), 'walk home by tap'); await tapNode('home'); await H.wait(700);
  await H.until('InteriorScreen', 4000);
  await useStation('desk');
  info(`at the desk: ${await H.screen()} ${JSON.stringify(await p.evaluate(() => { const S = KO.screen; return S.L ? { hall: S.id, px: Math.round(S.px), goal: S.goal, armed: S.armed, here: S.here && S.here.id, cam: Math.round(S.camX) } : null; }))}`);
  await step('desk opens', async () => (await H.until('DeskScreen', 4000)), 'two taps on the desk');
  const rowY = (i) => 44 + i * 17 + 3;
  await H.tapNat(128, rowY(1)); await H.wait(150); await H.tapNat(128, rowY(1)); await H.wait(300);
  await H.shot('flow-4-password');
  const state = await p.evaluate(async () => { const { passwordOf } = await import('/src/save/career.js'); const c = KO.career; return { pw: passwordOf(c), circuit: c.circuit, beaten: c.beaten, wins: c.wins ?? null }; });
  info(`password ${state.pw}  (circuit ${state.circuit}, beaten ${state.beaten})`);
  ok(state.pw && state.pw.length >= 15, 'no password');
  await H.tapNat(128, 100); await H.wait(200); // close the card
  // to the title screen
  await H.tapNat(128, rowY(5)); await H.wait(150); await H.tapNat(128, rowY(5)); await H.wait(150); await H.tapNat(128, rowY(5)); await H.wait(600);
  await step('desk -> title', async () => (await H.until('TitleScreen', 4000)), 'TITLE SCREEN row');
  // PASSWORD (the third entry when there is a save: CONTINUE, NEW GAME, PASSWORD, OPTIONS; LOAD GAME shows with two saves)
  const items = await p.evaluate(() => KO.screen.items.map((i) => (typeof i.label === 'function' ? i.label() : i.label)));
  info(`title: ${items.join(' / ')}`);
  await H.tapNat(128, 128 + items.indexOf('PASSWORD') * 16 + 4); await H.wait(500);
  await step('title -> password', async () => (await H.screen()) === 'PasswordScreen', 'tap PASSWORD');
  const chars = await p.evaluate(async () => (await import('/src/save/password.js')).PASSWORD_CHARS);
  for (const ch of state.pw.replace(/-/g, '')) { const i = [...chars].indexOf(ch); if (i < 0) { ok(false, `char ${ch} not on the keyboard`); continue; } await H.tapNat(36 + (i % 10) * 19 + 5, 90 + Math.floor(i / 10) * 16 + 4); }
  await H.wait(200);
  ok((await p.evaluate(() => KO.screen.code)).length === state.pw.replace(/-/g, '').length, 'password keys by tap: wrong length');
  await H.shot('flow-5-keyboard');
  const nKeys = await p.evaluate(() => KO.screen.hits.list.length);
  const endIdx = await p.evaluate(() => KO.screen.hits.list.findIndex((h) => h.w > 19));
  const endHit = await p.evaluate(() => { const h = KO.screen.hits.list.find((x) => x.id === 36 || x.id === 37); return h; });
  const endKey = await p.evaluate(() => KO.screen.hits.list.filter((h) => h.id >= 36).map((h) => [h.id, h.x, h.y]));
  info(`special keys: ${JSON.stringify(endKey)} of ${nKeys} (${endIdx})`);
  const END = endKey.find((k) => k[0] === 37);
  await H.tapNat(END[1] + 8, END[2] + 6); await H.wait(600);
  await step('password accepted', async () => (await H.screen()) === 'SavesScreen', 'END key');
  await H.tapNat(128, 34 + 50 + 20); await H.wait(250); await H.tapNat(128, 34 + 50 + 20); await H.wait(500); // slot 2
  await H.until('CustomizeScreen', 3000);
  for (const ch of 'X') await key(ch, KEYS, 32, 96, 20, 14);
  await H.tapNat(37, 96 + 4 * 14 + 4); await H.wait(250); await H.tapNat(160, 179); await H.wait(250); await H.tapNat(160, 179); await H.wait(900);
  await step('password -> new save', async () => (await H.screen()) === 'WorldMapScreen', 'second save from a password');
  const restored = await p.evaluate(() => ({ circuit: KO.career.circuit, beaten: KO.career.beaten, slot: KO.slot }));
  ok(restored.circuit === state.circuit && restored.beaten === state.beaten, `password restored a different career: ${JSON.stringify(restored)} vs ${JSON.stringify(state)}`);
  info(`restored in slot ${restored.slot}: circuit ${restored.circuit}, beaten ${restored.beaten}`);
  await H.shot('flow-6-restored');

  // ---- saves survive a reload (what closing and reopening the app does), and LOAD GAME opens the first one
  await p.reload(); await p.waitForFunction(() => window.KO && KO.screen, null, { timeout: 15000 });
  await H.wait(500);
  const reopened = await p.evaluate(() => ({ slot: KO.slot, circuit: KO.career && KO.career.circuit, beaten: KO.career && KO.career.beaten, ls: Object.keys(localStorage).filter((k) => k.startsWith('kocircuit.')).length }));
  ok(reopened.slot === 2 && reopened.circuit === state.circuit && reopened.beaten === state.beaten, `after a reload the open save changed: ${JSON.stringify(reopened)}`);
  info(`after reload: slot ${reopened.slot}, ${reopened.ls} save keys in localStorage`);
  const items2 = await p.evaluate(() => KO.screen.items.map((i) => (typeof i.label === 'function' ? i.label() : i.label)));
  await H.tapNat(128, 128 + items2.indexOf('LOAD GAME') * 16 + 4); await H.wait(400);
  await step('title -> load list', async () => (await H.screen()) === 'SavesScreen', 'LOAD GAME');
  await H.tapNat(128, 56); await H.wait(250); await H.tapNat(128, 56); await H.wait(700);
  await step('load slot 1', async () => (await H.screen()) === 'WorldMapScreen' && (await p.evaluate(() => KO.slot)) === 1, 'tap slot 1 twice');
  ok(H.errs.length === 0, `console errors: ${H.errs.join(' | ')}`);
  await H.close();
}

// a bot reads the fight and works the pad: the touch handlers see the same events a thumb makes
async function playFight(H, label) {
  await H.p.evaluate(async () => {
    const { PerfectBot } = await import('/src/fight/bot.js');
    const F = KO.screen.fight, real = KO.input;
    const bot = new PerfectBot(F, { attack: true });
    F.input = real; // (the bot built itself in as the input; the real one, fed by touches, is what the fight reads)
    const rect = (cls, i) => { const r = document.querySelectorAll(`#touch canvas.${cls}`)[i].getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width }; };
    const dp = rect('dpad', 0), k = dp.w / 3;
    const where = { up: { x: dp.x, y: dp.y - k }, down: { x: dp.x, y: dp.y + k }, left: { x: dp.x - k, y: dp.y }, right: { x: dp.x + k, y: dp.y }, a: rect('round', 1), b: rect('round', 2), star: rect('round', 0), start: rect('pill', 1), pause: rect('pill', 0) };
    const ids = { up: 11, down: 12, left: 13, right: 14, a: 15, b: 16, star: 17, start: 18, pause: 19 };
    const down = new Set();
    const fire = (type, a) => { const t = new Touch({ identifier: ids[a], target: document.body, clientX: where[a].x, clientY: where[a].y }); const list = type === 'touchend' ? [] : [t]; document.dispatchEvent(new TouchEvent(type, { touches: list, targetTouches: list, changedTouches: [t], bubbles: true, cancelable: true })); };
    const orig = real.update.bind(real);
    window.__relayOn = true;
    KO.timeScale = 4; // (the fight is counted in steps, so a faster clock changes nothing the bot or the pad can see)
    real.update = function () {
      if (window.__relayOn && KO.screen.fight === F) {
        bot.think();
        const want = new Set([...bot.now, ...bot.hold]);
        for (const a of [...down]) if (!want.has(a) || bot.now.has(a)) { fire('touchend', a); down.delete(a); }
        for (const a of want) if (!down.has(a) && where[a]) { fire('touchstart', a); down.add(a); }
        window.__relayDown = [...down].join('+');
      } else if (down.size) { for (const a of [...down]) fire('touchend', a); down.clear(); }
      orig();
    };
  });
  const t0 = Date.now();
  while ((await H.screen()) === 'FightScreen' && Date.now() - t0 < 240000) await H.wait(250);
  await H.p.evaluate(() => { window.__relayOn = false; });
  info(`${label}: fight over after ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}

if (!ONLY || ONLY === 'layout') await layout();
if (!ONLY || ONLY === 'input') await input();
if (!ONLY || ONLY === 'flow') await flow();
await browser.close();
console.log(`\n${checks} checks, ${fails} failed`);
process.exit(fails ? 1 : 0);
