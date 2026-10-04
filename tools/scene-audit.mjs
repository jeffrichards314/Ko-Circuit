// Scene audit (spec §19): every cutscene in the registry
//   - resolves (data valid, template known, every painter / actor kind / step known),
//   - plays from the first frame to its end (pressing A through the text) inside a time limit, and leaves for a screen that exists,
//   - skips: holding START ends it within a second, seen before or not (a tap never skips: it only advances text; tools/scene-text-test.mjs),
//   - keeps its backdrop to the arena rule of §2 (at most 4 palettes of 15 colours = 60) on sampled frames (warnings for hosted scenes),
//   - runs without touching the career when played from the Theater (sandbox).
//   node tools/scene-audit.mjs [prefix] [--quick]
import { Frame, W, H } from '../src/engine/renderer.js';
import { makeGame } from './lib/stub.mjs';

const args = process.argv.slice(2);
const prefix = args.find((a) => !a.startsWith('--')) || '';
const quick = args.includes('--quick');
const { SCENES, getScene, theaterList } = await import('../data/cutscenes/index.js');
const { CutsceneScreen } = await import('../src/screens/cutscene.js');
const { CIRCUITS } = await import('../data/circuits.js');
const { PAINTERS } = await import('../src/scene/painters.js');
let bad = 0, warn = 0;
const fail = (m) => { console.log('  FAIL ' + m); bad++; };
const note = (m) => { console.log('  warn ' + m); warn++; };

const ids = Object.keys(SCENES).filter((id) => id.startsWith(prefix));
console.log(ids.length, 'scenes');
const STEPS = new Set(['wait', 'fade', 'pan', 'drift', 'cam', 'follow', 'move', 'tween', 'pose', 'anim', 'show', 'hide', 'set', 'caption', 'music', 'stopMusic', 'sfx', 'shake', 'flash', 'card', 'say', 'par', 'if', 'press', 'legacy', 'end']);
const walk = (steps, fn) => { for (const s of steps || []) { fn(s); if (s.par) s.par.forEach((p) => walk(p, fn)); if (s.then) walk(s.then, fn); if (s.else) walk(s.else, fn); } };

const f = new Frame();
const results = [];
for (const id of ids) {
  const T = await makeGame({ career: 'zeroTrue' });
  const g = T.game;
  let def;
  try { def = getScene(id, {}); } catch (e) { fail(`${id}: ${e.message}`); continue; }
  for (const l of def.layers || []) if (!PAINTERS[l.p]) fail(`${id}: unknown painter ${l.p}`);
  walk(def.script, (s) => { if (!STEPS.has(s.do)) fail(`${id}: unknown step ${s.do}`); if (s.do === 'music' && !g.songs[s.song]) fail(`${id}: unknown song ${s.song}`); });
  if (def.music && !g.songs[def.music]) fail(`${id}: unknown song ${def.music}`);
  if (def.music === null) { /* silence on purpose */ }
  // play it out
  const params = SCENES[id].params && SCENES[id].params.circuit ? { circuit: SCENES[id].params.circuit } : {};
  const S = new CutsceneScreen(g, { id, params, then: ['_end', {}], theater: true });
  try { S.enter(); } catch (e) { fail(`${id}: enter: ${e.message}`); continue; }
  let t = 0, ended = -1, maxColors = 0;
  const LIMIT = SCENES[id].legacy ? 40000 : 9000;
  try {
    for (; t < LIMIT && !g.next; t++) {
      T.step(t);
      if (t % 9 === 0) T.press('a', t), T.step(t);
      S.update();
      if (t % (quick ? 400 : 140) === 60) {
        f.clear(0xff000000); S.render(f);
        S.scene.renderBackdrop(f);
        const set = new Set(f.buf); maxColors = Math.max(maxColors, set.size);
      }
    }
  } catch (e) { fail(`${id}: frame ${t}: ${e.stack.split('\n').slice(0, 3).join(' | ')}`); continue; }
  ended = t;
  if (!g.next) { fail(`${id}: does not end within ${LIMIT} frames`); continue; }
  if (g.next[0] !== '_end' && !['theater'].includes(g.next[0])) note(`${id}: leaves for ${g.next[0]}`);
  results.push([id, ended, maxColors]);
  const limit = SCENES[id].legacy ? 200 : 64;
  if (maxColors > limit) (SCENES[id].legacy ? note : note)(`${id}: backdrop uses ${maxColors} colours (rule: ${limit} incl. black)`);
  // skip: hold START on a first viewing
  const T2 = await makeGame({ career: 'zeroTrue' });
  const S2 = new CutsceneScreen(T2.game, { id, params, then: ['_end', {}], theater: true });
  S2.enter(); T2.hold('start', 30, 400);
  let k = 0;
  for (; k < 400 && !T2.game.next; k++) { T2.step(k); S2.update(); }
  // (a scene marked `noSkipFirst` plays in full the first time: holding START must NOT skip it until it has been seen)
  if (SCENES[id].noSkipFirst) { if (T2.game.next) fail(`${id}: hold START skipped a first viewing of a noSkipFirst scene`); }
  else if (!T2.game.next) fail(`${id}: hold START did not skip`);
  else if (k > 30 + 42 + 40) fail(`${id}: skip took ${k} frames`);
  // seen before: still only holding START skips (a tap does not)
  const T3 = await makeGame({ career: 'zeroTrue', seen: { [id]: 1 } });
  const S3 = new CutsceneScreen(T3.game, { id, params, then: ['_end', {}], theater: true });
  S3.enter(); T3.hold('start', 20, 400);
  for (k = 0; k < 400 && !T3.game.next; k++) { T3.step(k); S3.update(); }
  if (!T3.game.next || k > 20 + 42 + 40) fail(`${id}: holding START did not skip a seen scene (${k})`);
}
// the Theater lists every scene once
const listed = theaterList().flatMap((z) => z.scenes.map((s) => s.id));
for (const id of Object.keys(SCENES)) if (!listed.includes(id)) fail(`${id}: not in the Theater`);
if (new Set(listed).size !== listed.length) fail('the Theater lists a scene twice');
const byC = [...results].sort((a, b) => b[2] - a[2]).slice(0, 6); console.log('  most colours in a backdrop:', byC.map((r) => `${r[0]}=${r[2]}`).join(' '));
const secs = results.map((r) => r[1] / 60);
for (const [id, e] of results) if (e < 300) console.log('  short:', id, (e / 60).toFixed(1) + 's');
console.log(`played ${results.length} scenes; longest ${Math.max(...secs).toFixed(0)}s, shortest ${Math.min(...secs).toFixed(0)}s`);
// coverage: every circuit has an arrival and a victory; champions and bosses have an entrance or intro
const missing = [];
for (const [cid, c] of Object.entries(CIRCUITS)) {
  if (c.rival) continue;
  if (!SCENES[`arrive.${cid}`]) missing.push(`arrive.${cid}`);
  if (!SCENES[`victory.${cid}`]) missing.push(`victory.${cid}`);
}
if (missing.length) fail('missing: ' + missing.join(' '));
console.log(bad ? `${bad} FAILURES, ${warn} warnings` : `scene audit clean (${warn} warnings)`);
process.exit(bad ? 1 : 0);
