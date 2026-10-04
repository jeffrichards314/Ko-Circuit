// Phase F audit (spec A8, A14): the last pass over the whole roster, everything that is data-shaped.
//   node tools/final-audit.mjs [--render]
// Checks, for every one of the 133 fighters (the 119 numbered, the bosses, Dash):
//   roster    numbers #1-#119 run without gaps; the Full Gauntlet roster holds everyone it should
//   A3        each Ascension circuit against the spec's table (spec §18 A3): tell window, player hearts, lives,
//             health restored between rounds, KO only; his median tell against the circuit's window; the
//             Void's 30+ move patterns
//   curve     the difficulty curve (tools/difficulty-score.js): a sawtooth, bosses local peaks, ZERO's true form the global one; get-up walls
//   K4/§9     exploit / anti-strategy / moment counts by rank (from knowledge-audit.js), and that every champion,
//             boss and Dash has a hidden exploit (§9: "the late ones hidden and tight")
//   medals    three medals defined (speed target, silver, gold text that fits two lines), gold check is met-able
//             (medal-sim --static), Ascension speed targets never below the circuit before
//   extras    gallery text, portrait, alt palette (differs from the original), music ids, arena, walk-up
//   unlocks   thresholds ascend, costumes exist, the alt-colour lists cover every Ascension circuit once
//   --render  a practice-mode smoke test: every fighter rendered mid-fight with tell flash and exploit view on
//   --calibrate [N]  the perfect-play bot fights everyone N times (default 30): it must never lose, and its 90th-percentile
//             KO time must sit under the Bronze target (a bronze the perfect player only half-gets is mis-set)
// Exit code 1 if any check fails.
import { HINTS } from '../data/hints/index.js';
import { FIGHTERS } from '../data/fighters/index.js';
import { CIRCUITS, ASC_PATH, ALL_ORDER, ALL_RIVALS } from '../data/circuits.js';
import { audit as knowledgeAudit } from './knowledge-audit.js';
import { curve } from './difficulty-score.js';
import { TELLS, ZONE } from '../data/difficulty.js';
import { EVERYONE, ASC_EVERYONE, FULL_ROSTER, ROSTER, rosterNumber, gauntletList } from '../src/save/records.js';
import { SPEED, CHECKS, speedTarget } from '../data/medals.js';
import { UNLOCKS, ASC_UNLOCKS } from '../data/unlocks.js';
import { COSTUMES } from '../data/costumes.js';
import { SONGS, SONG_ZONE } from '../data/music/index.js';
import { ARENAS } from '../data/arenas/index.js';
import { PORTRAITS } from '../data/sprites/portraits.js';
import { paletteFor } from '../src/engine/spriteCache.js';
import { altPaletteOf } from '../src/save/unlocks.js';
import { wrapPx } from '../src/engine/font.js';

const args = process.argv.slice(2);
let bad = 0, warn = 0;
const fail = (where, what) => { bad++; console.log(`  FAIL ${where}: ${what}`); };
const note = (where, what) => { warn++; console.log(`  note ${where}: ${what}`); };
const section = (t) => console.log(`\n== ${t}`);
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor((s.length - 1) / 2)] : null; };

// ---------------------------------------------------------------------------
section('roster');
{
  const nums = EVERYONE.map(rosterNumber).filter((n) => n != null).sort((a, b) => a - b);
  if (nums.length !== 119 || nums.some((n, i) => n !== i + 1)) fail('numbers', `#1-#119 expected, got ${nums.length} numbers (${nums[0]}..${nums[nums.length - 1]})`);
  const missing = EVERYONE.filter((id) => !FIGHTERS[id]);
  if (missing.length) fail('fighters', `listed but missing: ${missing.join(', ')}`);
  if (EVERYONE.length !== Object.keys(FIGHTERS).length) fail('fighters', `${EVERYONE.length} listed, ${Object.keys(FIGHTERS).length} defined`);
  const need = [...nums.map((n) => EVERYONE.find((id) => rosterNumber(id) === n)), 'jax', 'zero', 'halcyon', 'vorgath', 'zeroTrue', 'dash5', 'dash6', 'dash7', 'dash8', 'dash9'];
  const lack = need.filter((id) => !FULL_ROSTER.includes(id));
  if (lack.length) fail('Combined Gauntlet', `missing ${lack.join(', ')}`);
  if (new Set(FULL_ROSTER).size !== FULL_ROSTER.length) fail('Combined Gauntlet', 'duplicates');
  if (FULL_ROSTER.length !== 119 + 5 + 5) fail('Combined Gauntlet', `${FULL_ROSTER.length} fights, expected 129 (119 numbered, 5 bosses, Dash V to IX)`);
  // the Main Gauntlet is a subsequence of the Full one (the same order), and every zone list sits inside it
  const inOrder = (sub) => { let at = -1; return sub.every((id) => (at = FULL_ROSTER.indexOf(id, at + 1)) >= 0); };
  for (const z of ['classic', 'pantheon', 'underworld', 'void']) if (!inOrder(gauntletList(z))) fail(`${z} Gauntlet`, 'is not in the Combined Gauntlet\'s order');
  console.log(`  ${EVERYONE.length} fighters, Combined Gauntlet ${FULL_ROSTER.length} fights, divisions ${['classic', 'pantheon', 'underworld', 'void'].map((z) => gauntletList(z).length).join('/')}`);
}

// ---------------------------------------------------------------------------
section('A3 table (spec §18 A3)');
const A3 = {
  // circuit ids -> { tell, hearts, lives, heal (max health restored in the corner; undefined: the base 30) }
  // (tells: the rebalanced A3 table, data/difficulty.js TELLS: P1-P2 13, P3-P4 12, P5-P7 11, Halcyon 8, U1-U3 10, U4-U6 9, Vorgath 7,
  // the Void 8, Dash Unbound 6, ZERO's true form 5)
  ...Object.fromEntries(['p1', 'p2'].map((c) => [c, { tell: 13, hearts: 12, lives: 2 }])),
  ...Object.fromEntries(['p3', 'p4'].map((c) => [c, { tell: 12, hearts: 12, lives: 2 }])),
  ...Object.fromEntries(['p5', 'p6', 'p7'].map((c) => [c, { tell: 11, hearts: 12, lives: 2 }])),
  halcyon: { tell: 8, hearts: 12, lives: 2 },
  ...Object.fromEntries(['u1', 'u2', 'u3'].map((c) => [c, { tell: 10, hearts: 10, lives: 1, heal: 15 }])),
  ...Object.fromEntries(['u4', 'u5', 'u6'].map((c) => [c, { tell: 9, hearts: 10, lives: 1, heal: 15 }])),
  vorgath: { tell: 7, hearts: 10, lives: 1, heal: 15 },
  ...Object.fromEntries(['v1', 'v2', 'v3'].map((c) => [c, { tell: 8, hearts: 8, lives: 1, heal: 20 }])),
  zeroTrue: { tell: 5, hearts: 8, lives: 1, heal: 20 },
};
// the rivals copy the row of the circuit they follow
const RIVAL_ROW = { rival5: 'p3', rival6: 'p6', rival7: 'u3', rival8: 'u6', rival9: 'v3' };
for (const [r, from] of Object.entries(RIVAL_ROW)) A3[r] = { ...A3[from], tell: TELLS[r].nominal }; // (Dash's own slot: half a frame over the champion he follows; Dash Unbound 6)
const CORNER_BASE = 30;
for (const [cid, want] of Object.entries(A3)) {
  const C = CIRCUITS[cid];
  if (!C) { fail(cid, 'no such circuit'); continue; }
  if (C.tellWindow !== want.tell) fail(cid, `tell window ${C.tellWindow}f, A3 says ${want.tell}f`);
  if (C.hearts !== want.hearts) fail(cid, `${C.hearts} hearts, A3 says ${want.hearts}`);
  if ((C.lives || 2) !== want.lives) fail(cid, `${C.lives || 2} lives, A3 says ${want.lives}`);
  if (want.heal != null && (C.cornerHeal ?? CORNER_BASE) !== want.heal) fail(cid, `corner heal ${C.cornerHeal ?? CORNER_BASE}, A3 says ${want.heal}`);
  if (want.heal == null && C.cornerHeal != null && C.cornerHeal < CORNER_BASE) fail(cid, `Pantheon health restored is "normal" (${CORNER_BASE}), got ${C.cornerHeal}`);
  if (C.heartsLostOnBlock !== 3) fail(cid, `blocked punches cost ${C.heartsLostOnBlock} hearts (§9: 3)`);
}
// per fighter: the median opener tell against the circuit's window (heavies and supers are longer; nothing an opener under it)
for (const id of ASC_EVERYONE) {
  const d = FIGHTERS[id], C = CIRCUITS[d.circuit];
  const follow = new Set();
  for (const p of d.patterns || []) { const st = p.steps || []; for (let i = 1; i < st.length; i++) if (st[i].move && st[i - 1].move) follow.add(st[i].move); }
  const openers = Object.entries(d.moves).filter(([mid, m]) => !m.super && !m.feint && !m.call && !m.strike && m.activeFrames > 0 && (m.avoidBy || []).length && !follow.has(mid)).map(([, m]) => m.windupFrames - (m.quiet || 0));
  if (!openers.length) continue;
  const med = median(openers), min = Math.min(...openers);
  // his median opener sits on his slot of the curve (data/difficulty.js; the knobs at 1), the Counter Shard's long tells excepted
  const want = d.difficulty.target;
  if (!d.longTells && Math.abs(med - want) > 1.5) fail(id, `median tell ${med}f is off his slot of the curve (${want.toFixed(1)}f)`);
  if (min < 3) fail(id, `a ${min}f tell: tells never go below 3f (A3)`);
  if (d.stats.heartDrainOnBlock != null && d.stats.heartDrainOnBlock !== C.heartsLostOnBlock) fail(id, `block drain ${d.stats.heartDrainOnBlock}`);
}
// the Void's patterns are long (A3: patterns of 30+ moves)
for (const id of ASC_EVERYONE) {
  const d = FIGHTERS[id];
  if (CIRCUITS[d.circuit].zone !== 'void' || CIRCUITS[d.circuit].rival) continue;
  const longest = Math.max(...(d.patterns || []).map((p) => (p.steps || []).length), 0);
  if (id !== 'counterShard' && longest < 30) fail(id, `longest pattern is ${longest} moves (A3: the Void's are 30+)`);
}
// the curve (spec §9, A3 as rebalanced): a sawtooth in story order, every champion and boss a local peak, ZERO's true form the global
// peak on every lever (tools/difficulty-score.js), and the get-up walls: none in the main game, the 3rd knockdown from Jax to the
// Underworld, the 2nd for Halcyon, Vorgath and the Void, the 1st for ZERO's true form
{
  const D = curve(FIGHTERS, CIRCUITS);
  for (const f of D.flags) fail(f.id, f.text);
  const wallWant = (d) => (d.id === 'zeroTrue' ? 1 : ['halcyon', 'vorgath'].includes(d.circuit) || ZONE[d.circuit] === 'void' ? 2 : ZONE[d.circuit] === 'main' ? null : 3);
  for (const r of D.rows) { const d = FIGHTERS[r.id]; if ((d.getUp.wall ?? null) !== wallWant(d)) fail(r.id, `get-up wall at knockdown ${d.getUp.wall}, the schedule says ${wallWant(d)}`); }
  console.log(`  difficulty curve: ${D.rows.length} fights in story order, ${D.flags.length} flag(s)`);
}

// ---------------------------------------------------------------------------
section('knowledge (K4, §9)');
{
  const R = knowledgeAudit(FIGHTERS, CIRCUITS);
  for (const r of R.rows) for (const i of r.issues) if (i.level === 'error') fail(r.id, i.text); else if (i.level === 'warn') note(r.id, i.text);
  for (const i of R.global) if (i.level === 'error') fail('roster', i.text);
  for (const [t, ids] of Object.entries(R.typeUse)) if (!ids.length) fail('anti types', `${t} is used by nobody`);
  // champions, bosses and Dash: the late exploits are hidden (a hidden one, and at least one a hit of consequence)
  const hiddenRule = new Set([...ASC_EVERYONE, 'jax', 'zero', 'dash4']); // (the base game's early champions and Dash I-III have readable ones)
  for (const r of R.rows) {
    if (r.role === 'fighter' || !hiddenRule.has(r.id)) continue;
    if (!r.exploits.some((x) => x.hidden)) fail(r.id, `${r.role} without a hidden exploit`);
    if (r.moments.length < 2) fail(r.id, `${r.role} with ${r.moments.length} scripted moments`);
  }
  const asc = R.rows.filter((r) => ASC_EVERYONE.includes(r.id));
  console.log(`  ${R.rows.length} fighters (${asc.length} Ascension): ${R.counts.error} errors, ${R.counts.warn} warnings, ${R.counts.note} notes`);
}

// ---------------------------------------------------------------------------
section('medals (§15)');
for (const id of EVERYONE) {
  const d = FIGHTERS[id], S = d.medals && d.medals.signature;
  if (!S) { fail(id, 'no gold challenge'); continue; }
  if (!CHECKS[S.check]) fail(id, `unknown gold check ${S.check}`);
  if (!S.text || wrapPx(`GOLD: ${S.text}`, 236).length > 2) fail(id, `gold text does not fit two lines: "${S.text}"`);
  const t = speedTarget(d);
  if (!(t > 0)) fail(id, 'no speed target');
  if (ASC_EVERYONE.includes(id) && !d.medals.speed && SPEED[d.circuit] == null) fail(id, `no speed target for circuit ${d.circuit}`);
}
{
  // never lower than the circuit before it along the Ascension path (a fighter's own override is left out)
  let prev = 0, prevId = '';
  for (const cid of ASC_PATH) {
    const t = SPEED[cid];
    if (t == null) { fail(cid, 'no SPEED entry'); continue; }
    if (CIRCUITS[cid].boss) continue; // (a boss's target is the whole multi-round fight)
    if (t < prev) fail(cid, `speed target ${t}s is lower than ${prevId}'s ${prev}s`);
    prev = t; prevId = cid;
  }
  for (const r of ALL_RIVALS) if (SPEED[r] == null) fail(r, 'no SPEED entry');
  console.log(`  ${EVERYONE.length} fighters x 3 medals, ${ASC_EVERYONE.length * 3} of them the Ascension's`);
}

// ---------------------------------------------------------------------------
section('extras: gallery, portraits, palettes, music');
for (const id of EVERYONE) {
  const d = FIGHTERS[id];
  if (!d.gallery) fail(id, 'no gallery text');
  else if (wrapPx(d.gallery, 142).length > 7) fail(id, `gallery text runs ${wrapPx(d.gallery, 142).length} lines (7 fit)`);
  if (!HINTS[id] || !(HINTS[id].general || []).length) fail(id, 'no cornerman hint bank');
  if (!d.card || !d.card.record || !d.card.quote) fail(id, 'incomplete intro card');
  if (!PORTRAITS[id]) fail(id, 'no portrait');
  else { try { PORTRAITS[id](paletteFor(d.palette)); } catch (e) { fail(id, `portrait fails: ${e.message}`); } }
  try {
    const a = paletteFor(altPaletteOf(d)), p = paletteFor(d.palette);
    let diff = 0; for (let i = 1; i < p.u32.length; i++) if (p.u32[i] && p.u32[i] !== a.u32[i]) diff++;
    // (the greys and whites of the first ZERO / the Nightmare's Hollow don't turn; none of the Ascension's may be plain)
    if (diff < 2 && ASC_EVERYONE.includes(id)) fail(id, `alternate palette differs in ${diff} colours`);
  } catch (e) { fail(id, `alt palette fails: ${e.message}`); }
  for (const key of ['music', 'fightMusic']) if (d[key] && !SONGS[d[key]]) fail(id, `${key} "${d[key]}" is not a song`);
  for (const n of d.roundMusic || []) if (!SONGS[n]) fail(id, `round song "${n}" is not a song`);
  const A = ARENAS[CIRCUITS[d.circuit].arena];
  if (!A) fail(id, `arena ${CIRCUITS[d.circuit].arena} missing`);
  else if (!SONGS[A.music]) fail(id, `arena song "${A.music}" is not a song`);
}
{
  const unzoned = Object.keys(SONGS).filter((n) => !SONG_ZONE[n] && /shard|halcyon|vorgath|underworld|pantheon|zeroTrue|ferry|abyss|furnace/i.test(n));
  if (unzoned.length) fail('sound test', `Ascension songs without a zone: ${unzoned.join(', ')}`);
  const ids = new Set(); for (const n of Object.keys(SONG_ZONE)) if (!SONGS[n]) fail('sound test', `zoned song ${n} does not exist`); else ids.add(n);
  console.log(`  ${Object.keys(SONGS).length} songs (${ids.size} in the Ascension's zones)`);
}

// ---------------------------------------------------------------------------
section('unlocks (§16, A2)');
{
  const ids = new Set();
  for (const list of [UNLOCKS, ASC_UNLOCKS]) {
    let prev = 0;
    for (const u of list) {
      if (u.at <= prev) fail(u.id, `threshold ${u.at} is not above ${prev}`);
      prev = u.at;
      if (ids.has(u.id)) fail(u.id, 'duplicate unlock id'); ids.add(u.id);
      if (u.kind === 'costume' && !COSTUMES.some((k) => k.id === u.id)) fail(u.id, 'no such costume');
    }
  }
  if (ASC_UNLOCKS[ASC_UNLOCKS.length - 1].at > ASC_EVERYONE.length * 3) fail('asc unlocks', 'the last threshold is beyond the medals there are');
  const covered = ASC_UNLOCKS.filter((u) => u.kind === 'palettes').flatMap((u) => u.circuits);
  for (const cid of Object.keys(CIRCUITS)) {
    if (!CIRCUITS[cid].asc) continue;
    const n = covered.filter((c) => c === cid).length;
    if (n !== 1) fail(cid, `covered by ${n} alternate-colour unlocks (1 expected)`);
  }
  const costumes = COSTUMES.filter((k) => k.id !== 'none');
  for (const k of costumes) if (!(k.pieces && k.pieces.length) && k.id !== 'none') fail(k.id, 'no pieces');
  console.log(`  ${UNLOCKS.length} base + ${ASC_UNLOCKS.length} Ascension unlocks, ${costumes.length} costumes`);
}

// ---------------------------------------------------------------------------
if (args.includes('--render')) {
  section('render smoke test (practice mode: tell flash, exploit view)');
  const { Frame } = await import('../src/engine/renderer.js');
  const { Fight } = await import('../src/fight/fightState.js');
  const { PerfectBot } = await import('../src/fight/bot.js');
  const frame = new Frame();
  let n = 0;
  for (const id of EVERYONE) {
    try {
      const f = new Fight({ fighter: FIGHTERS[id], audio: null, input: null, opts: { tellHighlight: true, exploitView: true, infiniteHearts: true, infiniteHealth: true } });
      const bot = new PerfectBot(f, { attack: true });
      for (let i = 0; i < 1500; i++) { bot.think(); f.update(); if (i % 60 === 0) f.render(frame); }
      n++;
    } catch (e) { fail(id, `render/practice: ${e.message}`); }
  }
  console.log(`  ${n}/${EVERYONE.length} fighters ran 1500 frames rendered`);
}

if (args.includes('--calibrate')) {
  section('calibration: perfect play against the medal targets and the win rate');
  const { Fight } = await import('../src/fight/fightState.js');
  const { PerfectBot } = await import('../src/fight/bot.js');
  const ci = args.indexOf('--calibrate');
  const N = +(args[ci + 1] && !args[ci + 1].startsWith('--') ? args[ci + 1] : 30);
  const clock = (t) => `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(2, '0')}`;
  let tight = 0;
  for (const id of EVERYONE) {
    const d = FIGHTERS[id], times = [], lostHow = []; let lost = 0, dec = 0;
    for (let i = 0; i < N; i++) {
      const f = new Fight({ fighter: d, audio: null, input: null, opts: {} });
      const bot = new PerfectBot(f, { attack: true });
      let r = null; f.opts.onEnd = (x) => { r = x; };
      for (let k = 0; k < 200000 && !r; k++) { bot.think(); f.update(); }
      if (!r || r.winner !== 'player') { lost++; lostHow.push(r ? `${r.winner} ${r.method} R${r.round} ${r.time}` : 'no result'); } else if (r.method === 'DEC') dec++; else times.push(r.seconds);
    }
    times.sort((a, b) => a - b);
    const p90 = times.length ? times[Math.min(times.length - 1, Math.floor(times.length * 0.9))] : null, t = speedTarget(d);
    if (lost) fail(id, `perfect play lost ${lost}/${N} fights (${lostHow.join('; ')})`);
    // (Halcyon and Vorgath: three forms, the last of which perfect play knocks out about two times in three; the rest are decisions)
    if (p90 != null && p90 > t && !CIRCUITS[d.circuit].forms) fail(id, `bot 90th percentile ${clock(p90)} is over the Bronze target ${clock(t)}`);
    // (a forms boss's Bronze is the whole fight, any knockout of the last form: it can't be loosened, so it is never 'tight')
    if (p90 != null && p90 > t * 0.85 && p90 <= t && !CIRCUITS[d.circuit].forms) { tight++; note(id, `tight bronze: bot p90 ${clock(p90)}, target ${clock(t)}`); }
    if (dec && !CIRCUITS[d.circuit].forms) note(id, `${dec}/${N} perfect-play wins were decisions`);
  }
  console.log(`  ${EVERYONE.length} fighters x ${N} fights; ${tight} tight bronzes`);
}

console.log(`\n${bad} failure(s), ${warn} note(s)`);
process.exit(bad ? 1 : 0);
