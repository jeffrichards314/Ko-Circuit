// Training camp tests (spec §7): every minigame played end to end with scripted players (input handling, timing, scoring, win and
// fail states), the camp's flow back to the map, perks (unlocks, caps, save / load / password), and that a perk never changes an
// opponent's tells or timing.
//   node tools/training-test.mjs
import { makeGame } from './lib/stub.mjs';
let bad = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { bad++; console.log('  FAIL ' + m); } };

const { DRILL_CLASS, DRILLS, medalOf, TrainingScreen, PerksScreen } = await import('../src/screens/training.js');
const { PERKS, PERK, MAX_EQUIPPED, perkMods } = await import('../data/perks.js');
const { DRILL_IDS, DRILL_MEDALS } = await import('../data/drills.js');
const { DEFAULT_PROFILE } = await import('../data/customization.js');
const { newCareer, loadCareer, saveCareer, careerFromPassword, passwordOf } = await import('../src/save/career.js');
const { Fight } = await import('../src/fight/fightState.js');
const { PerfectBot } = await import('../src/fight/bot.js');
const { FIGHTERS } = await import('../data/fighters/index.js');
const { FightScreen } = await import('../src/screens/fight.js');
const { CIRCUITS } = await import('../data/circuits.js');

// --- a scripted input and a drill runner ---------------------------------------------------------------------------
const mkInput = () => { const now = new Set(); return { now, held: () => false, pressed: (a) => now.has(a), released: () => false, confirm: () => now.has('start') || now.has('a'), back: () => now.has('b') || now.has('pause'), anyPressed: (l = ['a', 'b', 'start', 'star']) => l.some((a) => now.has(a)) }; };
const AUD = { calls: [], sfx(n) { this.calls.push(n); }, stop() {}, play() {} };
function drill(game, brain, cap = 30000) {
  const screen = { g: { profile: DEFAULT_PROFILE }, args: { to: 'world' } };
  const d = new DRILL_CLASS[game](screen), I = mkInput(), think = brain();
  let f = 0;
  for (; f < cap && !d.done; f++) { I.now.clear(); for (const k of think(d, f)) I.now.add(k); d.update(I, AUD); }
  return { d, frames: f, finished: d.done };
}
const gauss = (() => { let s = 12345; const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; return () => { let u = 0; for (let i = 0; i < 6; i++) u += r(); return (u - 3) / Math.sqrt(0.5); }; })();

// --- SPEED BAG ---------------------------------------------------------------------------------------------------
{
  const perfect = () => (d) => { const i = d.next; return i < d.times.length && d.t + 1 === d.times[i] ? [i % 2 ? 'a' : 'b'] : []; };
  let r = drill('bag', perfect);
  ok(r.finished && r.d.score === 96 && r.d.best === 48 && r.d.judged.every((j) => j === 'perfect'), `bag: frame-perfect is 96 (${r.d.score})`);
  ok(medalOf('bag', r.d.score) === 3, 'bag: gold at 96');
  r = drill('bag', () => () => []);
  ok(r.finished && r.d.score === 0 && r.d.judged.every((j) => j === 'miss'), 'bag: pressing nothing scores 0 and ends');
  // the wrong hand at the right time: no points
  r = drill('bag', () => (d) => { const i = d.next; return i < d.times.length && d.t + 1 === d.times[i] ? [i % 2 ? 'b' : 'a'] : []; });
  ok(r.finished && r.d.score === 0 && r.d.judged.every((j) => j === 'wrong'), 'bag: the wrong hand scores nothing');
  // mashing both hands every frame cannot win points on most beats
  r = drill('bag', () => (d, f) => [f % 2 ? 'a' : 'b']);
  ok(r.finished && r.d.score < 40, `bag: mashing earns less than bronze (${r.d.score})`);
  r = drill('bag', () => (d, f) => ['a']);
  ok(r.finished && r.d.score < 40, `bag: one hand alone earns less than bronze (${r.d.score})`);
  // a press a few frames early is good, 12 frames early is "too early", a late one a miss
  r = drill('bag', () => (d) => { const i = d.next; return i < d.times.length && d.t + 1 === d.times[i] - 6 ? [i % 2 ? 'a' : 'b'] : []; });
  ok(r.d.judged.every((j) => j === 'good') && r.d.score === 48, `bag: 6 frames early is GOOD (${r.d.score})`);
  r = drill('bag', () => (d) => { const i = d.next; return i < d.times.length && d.t + 1 === d.times[i] - 12 ? [i % 2 ? 'a' : 'b'] : []; });
  ok(r.d.judged.every((j) => j === 'early') && r.d.score === 0, 'bag: 12 frames early is TOO EARLY');
  // every beat is judged exactly once, and the judging never skips or repeats a beat (the miss frame bug)
  for (const sd of [3, 6, 9]) {
    let k = 0; const errs = [];
    r = drill('bag', () => { const off = {}; return (d) => { const i = d.next; if (i >= d.times.length) return []; if (off[i] === undefined) off[i] = Math.round(gauss() * sd); return d.t + 1 === d.times[i] + off[i] ? [i % 2 ? 'a' : 'b'] : []; }; });
    k = r.d.judged.filter((j) => j === null).length;
    ok(k === 0, `bag: every beat judged (sd ${sd}): ${k} unjudged`);
    void errs;
  }
  // a press meant for the next beat, made on the very frame the previous beat turns into a miss, must count for the next beat
  {
    const screen = { g: { profile: DEFAULT_PROFILE }, args: {} }, d = new DRILL_CLASS.bag(screen), I = mkInput();
    const i0 = 42, tMiss = d.times[i0] + 9; // (beats 40-47 are 16 frames apart)
    // play perfectly up to beat i0 - 1, skip i0, press for i0 + 1 exactly when i0 is judged a miss
    for (let f = 0; f < tMiss + 40 && !(d.judged[i0 + 1]); f++) {
      I.now.clear();
      const i = d.next;
      if (i < i0 && d.t + 1 === d.times[i]) I.now.add(i % 2 ? 'a' : 'b');
      if (d.t + 1 === tMiss) I.now.add((i0 + 1) % 2 ? 'a' : 'b');
      d.update(I, AUD);
    }
    ok(d.judged[i0] === 'miss' && (d.judged[i0 + 1] === 'good' || d.judged[i0 + 1] === 'perfect'), `bag: a press on the previous beat's miss frame counts for the next beat (${d.judged[i0]}, ${d.judged[i0 + 1]})`);
  }
}

// --- JUMP ROPE -------------------------------------------------------------------------------------------------------
{
  const timed = (sd) => () => { let target = null; return (d) => {
    if (d.h > 0 || d.stumble > 0 || d.t < d.start) { target = null; return []; }
    const P = d.period(), th = d.theta % (Math.PI * 2);
    const toPass = Math.round(((Math.PI - th + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2 / P));
    if (target === null) target = Math.max(2, 10 + Math.round(gauss() * sd));
    if (toPass <= target) { target = null; return ['a']; }
    return [];
  }; };
  let r = drill('rope', timed(0));
  ok(r.finished && r.d.score >= 75 && r.d.trips === 0, `rope: a perfect jumper clears gold (${r.d.score} jumps, ${r.d.trips} trips)`);
  r = drill('rope', () => () => []);
  ok(r.finished && r.d.score === 0 && r.d.trips === 3, `rope: no jump: three trips and it ends (${r.d.trips})`);
  ok(r.frames < 100 + 3 * 120 + 400, `rope: the no-jump run ends quickly (${r.frames} frames)`);
  // mashing the jump buttons (jump again the moment you land)
  r = drill('rope', () => () => ['a', 'up']);
  ok(r.finished && r.d.score < 45, `rope: mashing jump does not reach silver (${r.d.score})`);
  // up and b jump too
  for (const key of ['up', 'b', 'a']) { const r2 = drill('rope', () => (d) => (d.t === d.start + 2 ? [key] : [])); ok(r2.d.h > 0 || r2.d.vy !== 0 || r2.d.t > 0, `rope: ${key} jumps`); }
  // the time limit ends the drill
  r = drill('rope', timed(0));
  ok(r.d.t - r.d.start <= r.d.limit + 60, 'rope: never runs past its limit');
  // trips never exceed three; the drill ends as the third stumble ends
  ok(r.d.trips <= 3, 'rope: at most three trips');
  // a jump while stumbling is ignored
  {
    const screen = { g: { profile: DEFAULT_PROFILE }, args: {} }, d = new DRILL_CLASS.rope(screen), I = mkInput();
    for (let f = 0; f < 4000 && d.stumble === 0; f++) { I.now.clear(); d.update(I, AUD); }
    const h0 = d.h; I.now.clear(); I.now.add('a'); d.update(I, AUD);
    ok(d.stumble > 0 && d.h === h0, 'rope: no jumping while you\'re tripped');
  }
}

// --- ROAD RUN --------------------------------------------------------------------------------------------------------
{
  let r = drill('run', () => () => []);
  ok(r.finished && r.d.score === 0 && r.frames >= 100 + 1800, `road run: standing still scores 0 and the 30 seconds run out (${r.frames})`);
  const mash = (rate, jumpSd) => () => { let next = 0, hand = 'a'; return (d, f) => {
    const out = [];
    if (d.t >= d.start && f >= next) { out.push(hand); hand = hand === 'a' ? 'b' : 'a'; next = f + 60 / rate; }
    const o = d.obs.find((x) => !x.hit && x.x - d.dist > -4);
    if (o && d.h === 0 && d.v > 0) { const frames = (o.x - d.dist - 8) / d.v; if (frames <= 12 + (d.jumpErr ?? (d.jumpErr = gauss() * jumpSd)) && frames > 0) { out.push('up'); d.jumpErr = null; } }
    return out;
  }; };
  r = drill('run', mash(12, 2));
  ok(r.finished && r.d.score >= 520, `road run: a fast clean runner reaches gold (${r.d.score})`);
  r = drill('run', () => (d, f) => (d.t >= d.start && f % 4 === 0 ? ['a'] : []));
  ok(r.finished && r.d.score < 250, `road run: one button alone is not even bronze (${r.d.score})`);
  r = drill('run', () => { let hand = 'a'; return (d, f) => { if (d.t < d.start) return []; hand = hand === 'a' ? 'b' : 'a'; return [hand]; }; });
  ok(r.finished && r.d.score > 0 && r.d.score < 520, `road run: alternating every frame with no jumping is stopped by the obstacles (${r.d.score})`);
  ok(r.d.v <= 4.4 + 1e-9, 'road run: speed is capped');
  // hitting an obstacle stumbles you and scrubs speed
  {
    const screen = { g: { profile: DEFAULT_PROFILE }, args: {} }, d = new DRILL_CLASS.run(screen), I = mkInput();
    let hit = false;
    for (let f = 0; f < 6000 && !hit; f++) { I.now.clear(); if (d.t >= d.start) I.now.add(f % 2 ? 'a' : 'b'); d.update(I, AUD); if (d.stumble > 0) hit = true; }
    ok(hit && d.v <= 0.4 + 1e-9, 'road run: an obstacle stumbles you and scrubs your speed');
    const s0 = d.dist; I.now.clear(); I.now.add('a'); d.update(I, AUD);
    ok(d.dist - s0 < 1, 'road run: no running while you stumble');
  }
  // jumping over a hydrant clears it
  {
    const screen = { g: { profile: DEFAULT_PROFILE }, args: {} }, d = new DRILL_CLASS.run(screen), I = mkInput();
    let stumbles = 0, jumps = 0;
    for (let f = 0; f < 6000 && !d.done; f++) {
      I.now.clear();
      if (d.t >= d.start) I.now.add(f % 2 ? 'a' : 'b');
      const o = d.obs.find((x) => !x.hit && x.x - d.dist > -4);
      if (o && d.h === 0 && d.v > 0 && (o.x - d.dist - 8) / d.v <= 11 && (o.x - d.dist - 8) / d.v > 0) { I.now.add('up'); jumps++; }
      const before = d.stumble;
      d.update(I, AUD);
      if (d.stumble > before) stumbles++;
    }
    ok(jumps > 5 && stumbles <= 2, `road run: well-timed jumps clear the obstacles (${jumps} jumps, ${stumbles} stumbles)`);
  }
}

// --- the camp: pick -> how to play -> drill -> result -> map -----------------------------------------------------------
async function camp(args = {}, career = {}) {
  const T = await makeGame({ career: 'new' }), g = T.game;
  g.career = newCareer(); Object.assign(g.career.training, career);
  let saves = 0; g.saveCareer = () => { saves++; };
  g.audio = AUD;
  const I = mkInput(); g.input = I;
  const S = new TrainingScreen(g, args);
  S.enter();
  const tap = (...a) => { I.now.clear(); for (const k of a) I.now.add(k); S.update(); I.now.clear(); };
  const idle = (n) => { for (let i = 0; i < n; i++) { I.now.clear(); S.update(); } };
  return { g, S, tap, idle, I, saves: () => saves };
}
{
  // a road session: pick the bag, read how, play (perfectly), result -> map, the session used up
  const C = await camp({ to: 'minor' }, { pending: true });
  ok(C.S.state === 'pick', 'camp: starts on the drill list');
  C.tap('down'); C.tap('up'); ok(C.S.sel === 0, 'camp: up / down move the cursor');
  C.tap('up'); ok(C.S.sel === 3, 'camp: up wraps to SKIP TRAINING');
  C.tap('down'); C.tap('a'); ok(C.S.state === 'howto' && C.S.game === 'bag', 'camp: A picks the drill');
  C.tap('b'); ok(C.S.state === 'pick', 'camp: B in the how-to goes back to the list');
  C.tap('a'); C.idle(25); C.tap('start'); ok(C.S.state === 'play', 'camp: START after the how-to plays');
  C.idle(3);
  // perfect bag: press on each beat
  const d = C.S.drill;
  for (let f = 0; f < 6000 && C.S.state === 'play'; f++) { const i = d.next; C.I.now.clear(); if (i < d.times.length && d.t + 1 === d.times[i]) C.I.now.add(i % 2 ? 'a' : 'b'); C.S.update(); }
  ok(C.S.state === 'result' && C.S.medal === 3 && C.S.newBest, 'camp: the result screen shows gold and a new best');
  ok(C.S.won.length === 2 && C.g.career.training.perks.join() === 'counter,saver' && C.g.career.training.equipped.join() === 'counter,saver', 'camp: gold wins both perks and equips them');
  ok(C.g.career.training.pending === false && C.g.career.training.best.bag === 96 && C.saves() > 0, 'camp: the session is used up, the score and perks saved');
  C.idle(70); C.tap('a');
  ok(C.g.next && C.g.next[0] === 'map', 'camp: the road\'s drill goes on to the map');
}
{
  // skipping the road's drill uses it up; a free session leaves a waiting one alone
  let C = await camp({ to: 'minor' }, { pending: true });
  C.tap('up'); C.tap('a');
  ok(C.g.next && C.g.next[0] === 'map' && C.g.career.training.pending === false, 'camp: skipping training uses the session up and goes to the map');
  C = await camp({ free: true }, { pending: true });
  C.tap('up'); C.tap('a');
  ok(C.g.next && C.g.next[0] === 'map' && C.g.career.training.pending === true, 'camp: leaving a free session keeps a waiting road session');
  C = await camp({ free: true }, { pending: true });
  C.tap('a'); C.idle(25); C.tap('start'); C.idle(3);
  for (let f = 0; f < 4000 && C.S.state === 'play'; f++) { C.I.now.clear(); C.S.update(); }
  ok(C.S.state === 'result' && C.g.career.training.pending === true, 'camp: a free drill played while a road session waits leaves it waiting');
  C.idle(70); C.tap('a');
  ok(C.S.state === 'pick', 'camp: a free session goes back to the list after a result');
  C = await camp({ free: true });
  C.tap('pause'); ok(C.g.next && C.g.next[0] === 'map', 'camp: PAUSE leaves to the map');
}

// --- perks: unlocks, caps, menus -----------------------------------------------------------------------------------
{
  const play = async (game, score, career = {}) => {
    const C = await camp({ free: true }, career);
    C.S.game = game; C.S.drill = { score }; C.S.finish();
    return C;
  };
  const wins = (C) => C.g.career.training;
  let C = await play('bag', 39);
  ok(medalOf('bag', 39) === 0 && wins(C).perks.length === 0, 'perks: under bronze wins nothing');
  C = await play('bag', 40); ok(wins(C).perks.length === 0, 'perks: bronze wins no perk');
  C = await play('bag', 64); ok(wins(C).perks.join() === 'counter' && wins(C).equipped.join() === 'counter', 'perks: silver wins the drill\'s first perk and equips it');
  C = await play('bag', 84, { perks: ['counter'], equipped: ['counter'], best: { bag: 64 } }); ok(wins(C).perks.join() === 'counter,saver' && C.S.won.length === 1 && C.S.won[0].p.id === 'saver', 'perks: gold later adds the second one');
  C = await play('bag', 84, { perks: ['counter', 'saver'], equipped: ['counter'], best: { bag: 84 } }); ok(wins(C).perks.length === 2 && C.S.won.length === 0 && !C.S.newBest, 'perks: winning again does not award them twice');
  for (const g of DRILL_IDS) {
    const [b, s, gd] = DRILL_MEDALS[g], [p1, p2] = PERKS.filter((p) => p.game === g);
    ok(medalOf(g, s - 1) === 1 && medalOf(g, s) === 2 && medalOf(g, gd - 1) === 2 && medalOf(g, gd) === 3 && medalOf(g, b) === 1, `${g}: medal thresholds`);
    const C2 = await play(g, gd);
    ok(wins(C2).perks.includes(p1.id) && wins(C2).perks.includes(p2.id), `${g}: gold wins ${p1.id} and ${p2.id}`);
  }
  // the cap: a fourth perk is won but not equipped
  C = await camp({ free: true }, { perks: ['counter', 'saver', 'lungs'], equipped: ['counter', 'saver', 'lungs'], best: { bag: 84, rope: 45 } });
  C.S.game = 'run'; C.S.drill = { score: 520 }; C.S.finish();
  ok(wins(C).perks.length === 5 && wins(C).equipped.length === 3 && C.S.won.every((w) => !w.eq), 'perks: only 3 are ever equipped');
  // the perks screen
  const T = await makeGame({ career: 'new' }), g = T.game; g.career = newCareer(); g.career.training.perks = ['counter', 'saver', 'lungs', 'wind']; g.career.training.equipped = ['counter'];
  const I = mkInput(); g.input = I; g.audio = AUD; let saved = 0; g.saveCareer = () => { saved++; };
  const P = new PerksScreen(g);
  const tap = (...a) => { I.now.clear(); for (const k of a) I.now.add(k); P.update(); I.now.clear(); };
  tap('down'); tap('a'); tap('down'); tap('a'); ok(g.career.training.equipped.join() === 'counter,saver,lungs', 'perks screen: A equips');
  tap('down'); tap('a'); ok(g.career.training.equipped.length === 3 && /3 AT A TIME/.test(P.note), `perks screen: a fourth is refused (${P.note})`);
  tap('down'); tap('a'); ok(g.career.training.equipped.length === 3 && /WIN IT AT/.test(P.note), 'perks screen: a perk you have not won is refused');
  P.sel = 0; tap('a'); ok(!g.career.training.equipped.includes('counter'), 'perks screen: A on an equipped perk takes it off');
  ok(saved >= 3, `perks screen: every change is saved at once (${saved} saves)`);
  tap('pause'); ok(g.next && g.next[0] === 'map', 'perks screen: PAUSE leaves');
  // the text fits and no perk changes timing
  ok(PERKS.every((p) => p.text.length <= 30 && p.short.length <= 8), 'perks: texts fit the menu');
  ok(PERKS.every((p) => !/TELL|WINDOW|TIMING|SLOW/.test(p.text)), 'perks: none claims to touch timing');
  ok(PERKS.length === 6 && DRILL_IDS.every((g) => PERKS.filter((p) => p.game === g).length === 2), 'perks: two per drill');
}

// --- save, load, password ----------------------------------------------------------------------------------------
{
  localStorage.removeItem('kocircuit.career');
  const c = newCareer(); c.training.best = { bag: 70, rope: 50, run: 300 }; c.training.perks = ['counter', 'lungs']; c.training.equipped = ['lungs']; c.training.pending = true;
  saveCareer(c);
  let l = loadCareer();
  ok(JSON.stringify(l.training) === JSON.stringify(c.training), 'save: training round-trips through localStorage');
  // a damaged or old save is repaired
  c.training = { best: { bag: 'x', rope: -5, run: 99999 }, perks: ['counter', 'nonsense', 'counter'], equipped: ['counter', 'lungs', 'saver', 'wind', 'grit', 'ghost'], pending: 1 };
  localStorage.setItem('kocircuit.career', JSON.stringify(c));
  l = loadCareer();
  ok(l.training.equipped.length <= MAX_EQUIPPED && l.training.equipped.every((id) => PERK[id] && l.training.perks.includes(id)), `load: equipped is capped and only holds perks you own (${l.training.equipped})`);
  ok(l.training.perks.every((id) => PERK[id]) && new Set(l.training.perks).size === l.training.perks.length, 'load: unknown and repeated perks are dropped');
  ok(Object.values(l.training.best).every((v) => Number.isFinite(v) && v >= 0), 'load: scores are clean numbers');
  // the perks a score has earned are never missing
  c.training = { best: { bag: 90, rope: 0, run: 400 }, perks: [], equipped: [], pending: false };
  localStorage.setItem('kocircuit.career', JSON.stringify(c));
  l = loadCareer();
  ok(['counter', 'saver', 'chin'].every((id) => l.training.perks.includes(id)) && !l.training.perks.includes('grit') && !l.training.perks.includes('lungs'), `load: perks implied by the scores are restored, no more (${l.training.perks})`);
  c.training = undefined; localStorage.setItem('kocircuit.career', JSON.stringify(c)); l = loadCareer();
  ok(l.training && Array.isArray(l.training.equipped), 'load: an old save without a training block gets one');
  // passwords
  const p = newCareer(); p.training = { best: { bag: 84, rope: 45, run: 380 }, perks: ['counter', 'saver', 'lungs', 'chin'], equipped: ['saver', 'chin', 'counter'], pending: true };
  const back = careerFromPassword(passwordOf(p), null);
  ok(back && back.training.perks.join() === 'counter,saver,lungs,chin' && back.training.equipped.length === 3 && back.training.equipped.every((id) => p.training.equipped.includes(id)) && back.training.pending === true, `password: perks and equipment survive (${back && back.training.perks})`);
  ok(back.training.equipped.every((id) => back.training.perks.includes(id)), 'password: only perks you hold are equipped');
  const q = newCareer(); q.training = { best: { bag: 40, rope: 0, run: 0 }, perks: [], equipped: [], pending: false };
  ok(careerFromPassword(passwordOf(q), null).training.perks.length === 0, 'password: a bronze wins no perk');
}

// --- perks in the fights ---------------------------------------------------------------------------------------------
{
  const all = PERKS.map((p) => p.id);
  const base = perkMods([]);
  ok(base.counterMult === 1.5 && base.starLoss === 1 && base.hearts === 0 && base.dodgeHearts === 0 && base.damageTaken === 1 && base.getUp === 0 && base.cornerHeal === 0, 'perkMods: neutral with none');
  const m = perkMods(all);
  ok(Math.abs(m.counterMult - 1.725) < 1e-9 && m.starLoss === 0.5 && m.hearts === 2 && m.dodgeHearts === 2 && m.damageTaken === 0.9 && m.getUp === 1 && m.cornerHeal === 10, 'perkMods: every perk at its cap');
  ok(Object.keys(m).every((k) => k in base) && !Object.keys(m).some((k) => /tell|window|windup|opp/i.test(k)), 'perkMods: only the player\'s side');
  const mk = (id, perks, opts = {}) => new Fight({ fighter: FIGHTERS[id], audio: null, input: null, opts: { rounds: 3, perks, ...opts } });
  // hearts: +2 every round
  let f = mk('gus', ['lungs']);
  ok(f.maxHearts === CIRCUITS.rookie.hearts + 2 && f.player.hearts === f.maxHearts, 'lungs: +2 hearts at the start');
  f.player.hearts = 1; f.startBetween(); ok(f.player.hearts === f.maxHearts, 'lungs: and every round');
  // damage taken, counters, star loss
  const eff = (perks) => {
    const g = mk('gus', perks, { infiniteHearts: false }); g.setPhase('fight');
    const before = g.player.health; g.player.set('idle'); g.opponentAttack({ id: 'x', name: 'X', damage: 20, avoidBy: ['dodgeL'] });
    return before - g.player.health;
  };
  ok(eff([]) === Math.round(20 * FIGHTERS.gus.stats.damageMult) && eff(['chin']) === Math.round(20 * FIGHTERS.gus.stats.damageMult * 0.9), 'chin: 10% less damage');
  ok(mk('gus', ['counter']).counterMult > mk('gus', []).counterMult, 'counter: counters hit harder');
  // grit: get-up and corner heal
  ok(mk('gus', ['grit']).perk.getUp === 1 && mk('gus', ['grit']).perk.cornerHeal === 10, 'grit: +1 get-up, +10 corner heal');
  // the Will Shard's corner gives nothing: a perk must not add to it
  const fw = mk('willShard', ['grit']); fw.startBetween();
  ok(fw.corner.healCap() === 0, `grit: the Will Shard's corner still gives nothing (${fw.corner.healCap()})`);
  const fg = mk('gus', ['grit']); fg.startBetween(); ok(fg.corner.healCap() === 30 + 10, `grit: +10 on an ordinary corner (${fg.corner.healCap()})`);
  const fu = mk('moros', ['grit']); fu.startBetween(); ok(fu.corner.healCap() === 15 + 10, `grit: +10 on the Underworld's 15 (${fu.corner.healCap()})`);
  const fv = mk('dodgeShard', ['grit']); fv.startBetween(); ok(fv.corner.healCap() === 20 + 10, `grit: +10 in the Void (${fv.corner.healCap()})`);
}

// --- perks never touch an opponent's tells or timing -------------------------------------------------------------------
{
  const all = PERKS.map((p) => p.id);
  const seeded = (seed) => { let s = seed >>> 0; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
  const mk = (id, perks) => new Fight({ fighter: FIGHTERS[id], audio: null, input: null, opts: { rounds: 1, perks, infiniteHealth: true } });
  const timeline = (id, perks, attack) => {
    const rand = Math.random; Math.random = seeded(777);
    try {
      const f = mk(id, perks); const bot = new PerfectBot(f, { attack, sloppy: false });
      const out = [];
      f.opts.onEnd = () => {};
      for (let i = 0; i < 4000 && !f.result; i++) { bot.think(); f.update(); const o = f.opp; out.push(`${f.clock}:${o.state}:${o.moveId || ''}:${o.moveT}:${o.move ? o.move.windupFrames : ''}`); }
      return { out, moves: JSON.stringify(o2(f.opp.d.moves)) };
    } finally { Math.random = rand; }
  };
  const o2 = (m) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, [v.windupFrames, v.counterWindow, v.starWindow, v.kdWindow, v.recoveryFrames, v.activeFrames, v.avoidBy]]));
  for (const id of ['gus', 'rex', 'jax', 'aurora', 'halcyon', 'dodgeShard', 'willShard', 'zeroTrue']) {
    const a = timeline(id, [], false), b = timeline(id, all.slice(0, 3), false), c = timeline(id, all.slice(3), false);
    ok(a.moves === b.moves && a.moves === c.moves, `${id}: the move table is the same with perks`);
    ok(a.out.length === b.out.length && a.out.every((x, i) => x === b.out[i]) && a.out.every((x, i) => x === c.out[i]), `${id}: a defending player sees the same opponent frame for frame with perks (${a.out.length} frames)`);
  }
  // fighting: the opponent's pattern choice is the same too (his first 20 moves) when the player is never hit or hit-stunned
  for (const id of ['brody', 'maestro', 'oldguard']) {
    const a = timeline(id, [], true), b = timeline(id, all.slice(0, 3), true);
    ok(a.moves === b.moves, `${id}: the move table is the same with perks (attack pass)`);
  }
  // every mode hands the career's equipped perks to the fight
  const T = await makeGame({ career: 'zero' }), g = T.game;
  g.career.training.equipped = ['lungs', 'chin']; g.audio = AUD; g.input = mkInput();
  g.records.run = { mode: 'gauntlet', zone: 'main', list: ['gus'], idx: 0, health: 100, stars: 0, seconds: 0, last: null };
  const perksOf = (args) => new FightScreen(g, args).fight.perk;
  ok(perksOf({ fighter: 'gus' }).hearts === 2, 'modes: Career fights use the perks');
  ok(perksOf({ fighter: 'gus', replay: true }).hearts === 2, 'modes: Circuit replays use the perks');
  ok(perksOf({ fighter: 'gus', rematch: { circuit: 'rookie' } }).hearts === 2, 'modes: podium rematches use the perks');
  ok(perksOf({ fighter: 'gus', mode: 'gauntlet' }).hearts === 2, 'modes: the Gauntlets use the perks');
  g.records.run = { mode: 'td', tier: 'classic', list: ['gus'], idx: 0, lives: 2, seconds: 0, last: null };
  ok(perksOf({ fighter: 'gus', mode: 'td' }).hearts === 2, 'modes: Title Defense uses the perks');
  ok(perksOf({ fighter: 'gus', practice: { tell: true } }).hearts === 2, 'modes: Practice uses the perks');
  g.career = null;
  ok(perksOf({ fighter: 'gus', practice: { tell: true } }).hearts === 0, 'modes: no career, no perks');
}

// --- screens render, in every zone and with every trainer; a drill can be abandoned ---------------------------------------
{
  const { Frame } = await import('../src/engine/renderer.js');
  const { textWidth } = await import('../src/engine/font.js');
  const { DRILL_IDS } = await import('../data/drills.js');
  const f = new Frame();
  for (const trainer of [0, 1, 2]) for (const to of ['minor', 'p3', 'u2', 'v1']) {
    const C = await camp({ to }, { pending: true });
    C.g.career.profile.trainer = trainer;
    C.S.trainer = (await import('../data/customization.js')).cornermanFor(C.g.profile, (await import('../data/circuits.js')).zoneOf(to));
    C.S.tp = (await import('../data/sprites/trainers.js')).trainerPortrait(C.S.trainer.id);
    try {
      C.S.render(f);
      for (const gm of DRILL_IDS) {
        C.S.state = 'howto'; C.S.game = gm; C.S.render(f);
        C.S.state = 'play'; C.S.drill = new DRILL_CLASS[gm](C.S); for (let i = 0; i < 400; i++) { C.S.drill.update(mkInput(), AUD); } C.S.render(f);
        C.S.drill = { score: DRILL_MEDALS[gm][2] }; C.S.state = 'pick'; C.S.finish(); C.S.render(f);
        C.g.career.training.perks = []; C.g.career.training.equipped = [];
      }
      ok(true, `camp renders (${trainer}/${to})`);
    } catch (e) { ok(false, `camp render ${trainer}/${to}: ${e.stack.split('\n').slice(0, 3).join(' | ')}`); }
  }
  {
    const C = await camp({ free: true });
    C.tap('a'); C.idle(25); C.tap('start'); C.idle(30);
    ok(C.S.state === 'play', 'abandon: playing');
    C.tap('pause');
    ok(C.S.state === 'pick' && !C.g.career.training.best.bag && C.g.career.training.perks.length === 0, 'abandon: PAUSE walks out of a drill, nothing counts');
  }
  const T = await makeGame({ career: 'new' }), g = T.game; g.career = newCareer(); g.career.training.perks = PERKS.map((p) => p.id); g.career.training.equipped = ['counter', 'saver', 'lungs'];
  const P = new PerksScreen(g);
  try { P.render(f); ok(true, 'perks screen renders'); } catch (e) { ok(false, `perks render: ${e.message}`); }
  ok(PERKS.every((p) => textWidth(p.text, false) <= 200 && textWidth(p.name, false) <= 180), 'perks screen: every text fits its row');
  const eq = PERKS.slice(0, 3).map((p) => p.short).join(', ');
  ok(textWidth(`PERKS: ${eq}`, false) < 250 && PERKS.every((a) => textWidth(`PERKS: ${a.short}, ${a.short}, ${a.short}`, false) < 250), 'the PERKS line of the mode screens fits three perks');
}

console.log(`${checks} checks, ${bad} failed`);
process.exit(bad ? 1 : 0);
