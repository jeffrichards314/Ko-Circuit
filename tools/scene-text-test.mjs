// Scene text test (2026-10-03): the cutscenes are TEXT-DRIVEN. Every scene of the Theater list is played end to end four ways:
//   READER   waits for each line to finish typing, reads it a moment, pushes A       -> every line shows whole and the scene ends after the last one
//   MASHER   pushes A every other frame                                              -> a push never skips text: every line still shows whole (at least a few frames)
//   AFK      pushes nothing                                                          -> a line that goes on by itself does so only after it has fully shown + a reading delay;
//                                                                                       the scene never ends with a line that was not shown
//   TAP      taps START early on                                                     -> a tap advances text like A; it never skips or ends a scene
// and holding START still skips (within a second). Engine scenes are checked by what the scene logged (scene.log); the hand-drawn hosted ones by what
// they drew (PROBE.typed: how much of every typewriter block was showing).
//   node tools/scene-text-test.mjs [prefix] [--v]
import { makeGame } from './lib/stub.mjs';
import { Frame } from '../src/engine/renderer.js';
import { PROBE } from '../src/engine/font.js';
import { readFrames } from '../src/engine/textbox.js';
globalThis.window = globalThis.window || { addEventListener() {}, removeEventListener() {} };
const args = process.argv.slice(2), prefix = args.find((a) => !a.startsWith('--')) || '', verbose = args.includes('--v');
const { SCENES, theaterList } = await import('../data/cutscenes/index.js');
const { CutsceneScreen } = await import('../src/screens/cutscene.js');
let bad = 0, checks = 0;
const fail = (id, m) => { bad++; console.log(`  FAIL ${id}: ${m}`); };
const check = (c, id, m) => { checks++; if (!c) fail(id, m); };

const listed = theaterList().flatMap((z) => z.scenes.map((s) => s.id)).filter((id) => id.startsWith(prefix));
const f = new Frame();

// a scripted controller over the stub game's input
function driver(game) {
  const cur = { now: new Set(), held: new Set() };
  const I = game.input;
  I.held = (a) => cur.held.has(a); I.pressed = (a) => cur.now.has(a);
  I.confirm = () => cur.now.has('start') || cur.now.has('a'); I.back = () => cur.now.has('b') || cur.now.has('pause');
  I.takeTaps = () => [];
  return { cur, set(now = [], held = []) { cur.now = new Set(now); cur.held = new Set([...held, ...now]); } };
}
async function play(id, mode, { render = false } = {}) {
  const T = await makeGame({ career: 'zeroTrue' }), g = T.game, D = driver(g);
  const params = SCENES[id].params && SCENES[id].params.circuit ? { circuit: SCENES[id].params.circuit } : {};
  const S = new CutsceneScreen(g, { id, params, then: ['_end', {}], theater: true });
  const log = []; S.scene.log = log;
  S.enter();
  const legacy = !!SCENES[id].legacy, LIMIT = legacy ? 30000 : mode === 'afk' ? 6000 : 12000;
  const typed = new Map(); // legacy: string -> { max, full: frames shown whole }
  let t = 0, lastText = 0, wasReading = 0;
  for (; t < LIMIT && !g.next; t++) {
    let now = [], held = [];
    const sc = S.scene, T0 = sc.text;
    if (mode === 'reader') {
      // push once a line (or page) has been whole for a moment; push through cards and "PUSH START" prompts after a pause
      if (T0 && T0.box.typed) { wasReading++; if (wasReading > Math.max(30, Math.round(readFrames(T0.box.lines.join(' ')) * 0.4))) { now = ['a']; wasReading = 0; } } else wasReading = 0;
      if (!T0 && sc.card && t % 45 === 0) now = ['a'];
      if (!T0 && !sc.card && !legacy && t % 90 === 0) now = ['a']; // ('press' steps)
      if (legacy && t % 100 === 50) now = ['a'];
    } else if (mode === 'masher') now = t % 2 === 0 ? ['a'] : [];
    else if (mode === 'tap') { if (t >= 20 && t < 23) { held = ['start']; if (t === 20) now = ['start']; } }
    D.set(now, held);
    if (legacy && mode === 'reader' && now.includes('a')) D.set(['a']); // (hosted screens read confirm())
    S.update();
    if (legacy && (mode === 'reader' || mode === 'masher')) {
      PROBE.on = true; PROBE.typed = []; PROBE.texts = []; PROBE.boxes = []; PROBE.over = []; f.clear(0xff000000); S.render(f); PROBE.on = false;
      for (const p of PROBE.typed) { const e = typed.get(p.s) || { max: 0, full: 0, total: p.total }; e.max = Math.max(e.max, p.shown); if (p.shown >= p.total) e.full++; typed.set(p.s, e); }
    }
  }
  return { S, g, t, ended: !!g.next, log, typed, legacy };
}

let n = 0;
for (const id of listed) {
  n++;
  const legacy = !!SCENES[id].legacy;
  // READER
  const R = await play(id, 'reader');
  check(R.ended, id, `the reader never reached the end (${R.t} frames)`);
  for (const e of R.log.filter((x) => x.type === 'say')) {
    check(e.by === 'press' || e.by === 'auto', id, `a line was left unfinished: "${e.text.slice(0, 40)}"`);
    check(e.shownFull >= 10, id, `a line was whole for only ${e.shownFull} frames before it went: "${e.text.slice(0, 40)}"`);
  }
  if (legacy) for (const [s, e] of R.typed) check(e.max >= e.total && e.full >= 5, id, `hosted line never fully shown (${e.max}/${e.total}, ${e.full} frames): "${s.slice(0, 40)}"`);
  // MASHER
  const M = await play(id, 'masher');
  check(M.ended, id, `the masher never reached the end (${M.t} frames)`);
  for (const e of M.log.filter((x) => x.type === 'say')) {
    check(e.by === 'press' || e.by === 'auto', id, `masher: a line was left unfinished: "${e.text.slice(0, 40)}"`);
    check(e.shownFull >= 1, id, `masher: a line never showed whole: "${e.text.slice(0, 40)}"`);
  }
  if (legacy) {
    // every line the reader saw whole, the masher saw whole too (a push finishes typing, it does not skip a line)
    for (const [s, e] of R.typed) { const m = M.typed.get(s); check(m && m.max >= m.total && m.full >= 1, id, `masher skipped a hosted line: "${s.slice(0, 40)}"`); }
  } else {
    // the masher read as many lines as the reader (the script is the same)
    const nr = R.log.filter((x) => x.type === 'say').length, nm = M.log.filter((x) => x.type === 'say').length;
    check(nr === nm, id, `reader saw ${nr} lines, masher ${nm}`);
  }
  // AFK: only `auto` lines may go on by themselves, and only after a reading delay
  if (!legacy) {
    const A = await play(id, 'afk');
    for (const e of A.log.filter((x) => x.type === 'say')) {
      check(e.by !== 'press', id, 'AFK: a line closed with no push');
      if (e.by === 'auto') check(e.shownFull >= Math.min(readFrames(e.text.slice(-60)), 60) - 1, id, `AFK: a line went on by itself after only ${e.shownFull} frames whole: "${e.text.slice(0, 40)}"`);
    }
    for (const e of A.log.filter((x) => x.type === 'caption')) check(e.shown >= Math.min(readFrames(e.text), 400) - 2, id, `AFK: a caption was up only ${e.shown} frames: "${e.text.slice(0, 40)}"`);
    // an unfinished AFK run is only allowed to be waiting at a push (a line, a card or a prompt), never to have dropped text
    if (A.ended) check(!A.S.scene.text, id, 'AFK: ended with a line open');
  }
  // TAP: a START tap early on never ends or skips a scene
  const Tp = await play(id, 'tap');
  const Tr = R.t;
  check(!(Tp.ended && Tp.t < 90 && Tr > 150), id, `a START tap ended the scene at frame ${Tp.t}`);
  // HOLD: holding START skips within a second
  {
    const T = await makeGame({ career: 'zeroTrue' }), g = T.game, D = driver(g);
    const params = SCENES[id].params && SCENES[id].params.circuit ? { circuit: SCENES[id].params.circuit } : {};
    const S = new CutsceneScreen(g, { id, params, then: ['_end', {}], theater: true }); S.enter();
    let k = 0; for (; k < 400 && !g.next; k++) { D.set(k === 10 ? ['start'] : [], k >= 10 ? ['start'] : []); S.update(); }
    check(g.next && k <= 10 + 42 + 30, id, `holding START did not skip (${k})`);
  }
  if (verbose) console.log(id, 'reader', R.t, 'masher', M.t, 'lines', R.log.filter((x) => x.type === 'say').length);
}
console.log(bad ? `${bad} FAILURES of ${checks} checks over ${n} scenes` : `scene text test clean (${checks} checks, ${n} scenes)`);
process.exit(bad ? 1 : 0);
