// Knowledge scenarios (knowledge spec K7): every exploit and anti-strategy, set up and
// triggered through the real Fight, Player and OpponentAI code by a scripted player that
// presses the same buttons a person would. Shared by the headless runner
// (tools/knowledge-test.mjs) and the fight lab's "Run knowledge tests" button.
//
//   runFighter(FIGHTERS[id]) -> [{ kind: 'exploit' | 'anti', id, name, ok, why, frames }]
//
// Each scenario freezes him in his stance (no pattern, no super), sets up the moment
// (forces the move, the open step, the event, the round...), plays the trigger, then
// checks that the entry fired (the knowledge log) and that its effect really happened
// (an open step, a stun, a flag, a stolen star, a held punch...).
import { Fight } from '../src/fight/fightState.js';
import { PT } from '../src/fight/player.js';
import { WINDOW } from '../src/fight/behavior.js';

const asList = (v) => (v == null ? null : Array.isArray(v) ? v : [v]);

// A scripted player: the Fight's input. tap() presses for one frame, hold() keeps a key down.
class ScriptInput {
  constructor() { this.now = new Set(); this.held_ = new Set(); }
  pressed(a) { return this.now.has(a); }
  held(a) { return this.now.has(a) || this.held_.has(a); }
  released() { return false; }
  confirm() { return this.now.has('start') || this.now.has('a'); }
  back() { return false; }
  anyPressed(l = ['a', 'b', 'start', 'star']) { return l.some((a) => this.now.has(a)); }
  update() {}
  tap(...a) { for (const k of a) this.now.add(k); }
  hold(k, on = true) { if (on) this.held_.add(k); else this.held_.delete(k); }
  clear() { this.now.clear(); }
}

// --- the harness -----------------------------------------------------------------------
function makeCtx(d, opts = {}) {
  const inp = new ScriptInput();
  const f = new Fight({ fighter: d, audio: null, input: inp, opts: { rounds: 3, infiniteHealth: true, infiniteHearts: true, oppNeverDown: true, ...opts } });
  // (Rattle's bone-rattle is a fake one time in three: scenarios throw real punches unless the scenario wants the fake)
  const bones = f.opp.modifiers.find((m) => m.cfg.type === 'bones');
  if (bones) bones.cfg = { ...bones.cfg, p: 0 };
  // (Lament's cries too: a third of them are fakes)
  const rev = f.opp.modifiers.find((m) => m.cfg.type === 'reversed');
  if (rev) rev.cfg = { ...rev.cfg, p: 0 };
  return { f, inp, O: f.opp, P: f.player, K: f.opp.know, d, seen: new Set() };
}
// his stance, and nothing else: no pattern step, no super, no queued answer
function freeze(c, wait = 99999) {
  const { O, K } = c;
  O.state = 'idle'; O.t = 0; O.wait = wait; O.move = null; O.forced = []; O.superPlan = []; O.stun = 0; O.combo = 0; O.flurry = 0;
  O.guardQ = null; O.guardHits = 0; O.bounceAt = -999; O.read = false; O.openStep = null; O.idleHits = 0;
  if (K) { K.pending = null; K.script = []; K.late = []; K.due = null; }
  if (O.mods.sw) { const W = O.mods.sw; W.q = null; W.settle = 0; W.landed = false; W.calm = 0; W.swayT = 0; W.hp = O.health; } // (the Monk's queued answer)
}
// run a generator scenario to the end (or a frame cap); returns its value
function run(c, gen, cap = 9000) {
  const { f, inp } = c;
  // to the bell
  for (let i = 0; i < 400 && f.phase !== 'fight'; i++) { inp.clear(); f.update(); }
  for (let i = 0; i < 4; i++) { inp.clear(); f.update(); } // (a few frames into the round: anything that switches on at the bell has)
  freeze(c);
  let r = { done: false }, n = 0;
  while (!r.done && n < cap) {
    inp.clear();
    if (f.phase === 'between' && f.corner) { if (f.corner.t > 100) inp.tap('start'); }
    r = gen.next();
    f.update();
    if (c.O.state === 'windup' && c.O.moveT <= 1) c.seen.add(c.O.moveId);
    n++;
  }
  c.frames = n;
  return r.done ? r.value : { ok: false, why: 'timed out' };
}
function* wait(n) { for (let i = 0; i < n; i++) yield; }
function* until(cond, max = 1200) { for (let i = 0; i < max; i++) { if (cond()) return true; yield; } return false; }
const fired = (c, id) => !!(c.K.fired[id]);
const logged = (c, id) => c.K.log.some((l) => l.id === id);
const lead = (star) => (star ? PT.STAR_IMPACT : PT.JAB_IMPACT) - 1; // press this many ticks before the tick it lands on

// press a punch so it lands when `at()` (his moveT / t) reaches `target`
function* punchAt(c, p, at, target, max = 600) {
  const L = lead(p.star);
  // a Star Punch can only be thrown from a standing start (not out of a slip): wait for that first
  if (p.star && !(yield* until(() => c.P.state === 'idle' && c.P.rebuff === 0, max))) return false;
  target = Math.max(target, L + at() + 1); // (can't land sooner than a punch takes)
  const ready = () => (c.P.state === 'idle' || (c.P.state === 'dodge' && c.P.dodgeSuccess && c.P.t >= PT.DODGE_CANCEL)) && c.P.rebuff === 0;
  const ok = yield* until(() => ready() && at() === target - L, max);
  if (!ok) return false;
  if (typeof process !== 'undefined' && process.env.KDBG) console.log('   press at', at(), 'target', target, 'L', L, 'P', c.P.state, c.P.t, 'O', c.O.state, c.O.moveT, c.O.move && c.O.move.windupFrames);
  press(c, p);
  yield* wait(L + 2);
  return true;
}
function press(c, p) {
  if (p.star) { c.P.stars = Math.max(1, c.P.stars); c.inp.tap('star'); return; }
  c.inp.tap(p.side === 'L' ? 'b' : 'a');
  if (p.high) c.inp.hold('up'); else c.inp.hold('up', false);
}
function* dodge(c, dir) { c.inp.tap(dir === 'L' ? 'left' : 'right'); yield; }
// start a move right now (his moveT is 0 after the next tick)
function begin(c, id) { freeze(c); c.O.beginMove(id, { forced: true }); }
// the open step he uses (by id or anim) from his patterns, moments or anti-strategies
function openStepOf(d, key) {
  const all = [...d.patterns.flatMap((p) => p.steps), ...(d.scriptedMoments || []).flatMap((s) => s.steps || []), ...(d.antiStrategies || []).map((a) => a.step).filter(Boolean)];
  return all.find((s) => s.open && (s.id === key || s.anim === key));
}
function startOpen(c, key) { freeze(c); const s = openStepOf(c.d, key); if (!s) return false; c.O.startOpen({ ...s }); c.O.wait = s.open; return true; }
// his first counterable ordinary punch (a stand-in when a trigger names no move)
// (one with a tell long enough to land a jab inside; a fighter with none, like ZERO, gets any plain punch)
function aCounterable(d) {
  const E = Object.entries(d.moves), ok = ([k, m]) => !m.feint && !m.call && m.counterWindow && m.recoveryFrames >= 14;
  // (a fighter whose tells are all short has none with 7 frames: the slowest one whose counter window a jab thrown at the start can still reach)
  const reach = E.filter((e) => ok(e) && e[1].counterWindow[1] >= 4).sort((a, b) => b[1].windupFrames - a[1].windupFrames)[0];
  // (prefer one whose counter window a jab thrown a frame into the tell can reach: the harness lands 6 frames in at the soonest)
  const pick = E.find((e) => ok(e) && e[1].windupFrames >= 7 && e[1].counterWindow[1] >= 6) || E.find((e) => ok(e) && e[1].windupFrames >= 7) || reach || E.find(ok) || E.find(([k, m]) => !m.feint && !m.call && m.damage);
  return pick[0];
}

// --- the effect checks -----------------------------------------------------------------
function effectCheck(c, x) {
  const E = x.effect || {}, O = c.O, K = c.K;
  if (!fired(c, x.id)) return 'never fired';
  if (E.open && !(O.state === 'open' && O.openStep && O.openStep.id === 'x:' + x.id) && !c.sawOpen) return `no open step (he's ${O.state})`;
  if (E.stun && !c.sawStun) return 'no stun';
  if (E.knockdown && !(c.f.kdTotal.opp > 0)) return 'no knockdown';
  if (E.star && !(c.f.stats.starsEarned > c.stars0)) return 'no star earned';
  if (E.flag && !K.flag(E.flag)) return `flag ${E.flag} not set`;
  if (E.extendOpen && !(O.openStep && O.openStep.extended > 0) && !c.sawExtend) return 'open step not extended';
  if (E.tag && O.mods.twin === c.twin0) return 'no tag';
  if (E.wheel && O.modifiers.find((m) => m.cfg.type === 'prizeWheel').cfg.slices[O.mods.wheel.pick].set !== E.wheel) return 'wheel not rigged';
  if (E.script && !c.sawScript) return 'nothing scripted';
  if (E.mod) for (const [key, v] of Object.entries(E.mod)) if (key !== 'kneelQ' && ((v > 0 && !(O.mods[key] > 0)) || (v < 0 && !(O.mods[key] < 1)))) return `mod ${key} not set`;
  if (E.mod && E.mod.kneelQ && !(O.mods.kneelQ || O.mods.kneelT > 0)) return 'no kneel';
  if (E.cancelMoves && c.cancelFrom != null && E.cancelMoves.includes(c.nextMove)) return `${c.nextMove} still came`;
  return null;
}
// watch the frames right after the trigger for the effect (it may be brief)
function* watchEffect(c, x, n = 30) {
  const E = x.effect || {}, O = c.O;
  for (let i = 0; i < n; i++) {
    if (fired(c, x.id)) {
      if (O.state === 'open' && O.openStep && O.openStep.id === 'x:' + x.id) c.sawOpen = true;
      if (E.stun && O.stun >= E.stun - 8) c.sawStun = true;
      if (O.openStep && O.openStep.extended) c.sawExtend = true;
      if (c.K.script.length || (E.script && O.moveId === E.script[0].move)) c.sawScript = true;
    }
    yield;
  }
}

// --- exploits --------------------------------------------------------------------------
function* exploitScenario(c, x) {
  const T = x.trigger, O = c.O, P = c.P, K = c.K, d = c.d;
  c.stars0 = c.f.stats.starsEarned; c.twin0 = O.mods.twin;
  if (x.effect && x.effect.mod) for (const [key, v] of Object.entries(x.effect.mod)) if (v < 0) O.mods[key] = 1; // (something for it to take away)
  const on = T.on || 'punch';
  const hand = { side: T.side || 'R', high: T.height === 'high', star: !!T.star };

  if (T.health && on === 'punch') O.health = Math.round(O.maxHealth * (T.health[0] + T.health[1]) / 2);
  if (T.flag) K.flags[T.flag] = true; // (the scripted moment that sets it has run)
  if (T.test === 'stormFlash') { c.f.stage = 3; c.f.arena.state.round = 3; } // Cirrus: the lightning round
  if (T.test === 'noonForm') { c.f.stage = 2; c.f.arena.state.round = 2; } // Halcyon: the noon form
  if (on === 'custom' && T.scenario === 'chained') {
    // The Jailer's broken chains: chained, then a Star Punch that lands on him
    freeze(c);
    O.mods.chain = -1; O.mods.chainT = 9999; P.noDodge = -1;
    P.stars = 3;
    yield* until(() => P.state === 'idle' && P.rebuff === 0, 60);
    c.inp.tap('star');
    yield* wait(PT.STAR_IMPACT + 8);
    yield* until(() => fired(c, x.id), 40);
    yield* watchEffect(c, x, 20);
    return verdict(c, x);
  }
  if (on === 'custom' && x.id === 'pinned') {
    // Umbra's pinned shadow: his shadow is winding up a strike, and a punch lands on him
    freeze(c);
    O.mods.strikes = [{ id: 'shHookL', side: -1, at: c.f.clock + 60, born: c.f.clock, state: 'tell' }];
    yield* punchAt(c, { side: 'R', high: false }, () => O.t, 4);
    yield* until(() => fired(c, x.id), 40);
    yield* watchEffect(c, x, 20);
    const pinned = !O.mods.strikes.some((s) => s.state === 'tell');
    return pinned && fired(c, x.id) ? verdict(c, x) : { ok: false, why: `fired=${fired(c, x.id)} pinned=${pinned}` };
  }
  if (on === 'custom') {
    // Halcyon's weighed-down windup: dusk, a slow move, a body shot thrown late in its windup (after the counter window)
    c.f.stage = 3; c.f.arena.state.round = 3;
    freeze(c);
    const mv = Object.keys(d.moves).find((id) => d.moves[id].knockdown && d.moves[id].windupFrames >= 20 && d.moves[id].counterWindow);
    O.beginMove(mv, { forced: true }); yield;
    const w = O.move.windupFrames;
    yield* punchAt(c, { side: 'R', high: false }, () => O.moveT, w - 4, 200);
    yield* until(() => fired(c, x.id), 30);
    return { ok: fired(c, x.id) && O.move && O.move.slowed > 0, why: fired(c, x.id) ? 'fired, windup slowed' : 'never fired' };
  }
  if (on === 'blockStreak') {
    freeze(c);
    for (let i = 0; i < (T.n || 5) + 1 && !fired(c, x.id); i++) { c.inp.tap('down'); yield* wait(24); }
    yield* until(() => fired(c, x.id), 60);
    yield* watchEffect(c, x, 20);
    return verdict(c, x);
  }
  if (x.probe) {
    // a Star Punch that has to land inside the middle of one of his chains (Avalanche's rush): start the
    // chain, press the star as `at.move` gets to frame `at.t`, and it arrives during the next punch
    freeze(c);
    c.P.stars = 3;
    O.beginMove(x.probe.begin, { forced: true });
    O.forced = [...x.probe.then];
    yield* until(() => O.moveId === x.probe.at.move && O.moveT >= x.probe.at.t, 300);
    c.inp.tap('star');
    yield* wait(PT.STAR_IMPACT + 6);
    yield* watchEffect(c, x, 20);
    return verdict(c, x);
  }
  if (on === 'passive') {
    freeze(c, 99999);
    yield* until(() => fired(c, x.id), T.frames + 60);
    yield* watchEffect(c, x, 5);
    return verdict(c, x);
  }
  if (on === 'getUp') {
    freeze(c); O.health = 1;
    if ((d.stats.idleHitLimit || 0) >= 1 && d.stats.idleGuard !== 'low') yield* punchAt(c, { side: 'R', high: false }, () => O.t, 3);   // a body jab in his open spot drops him
    else {
      // a fighter with no open spot (Jax): counter one of his punches instead
      begin(c, aCounterable(d)); yield;
      const cw = O.move.counterWindow;
      yield* punchAt(c, { side: 'R', high: false }, () => O.moveT, Math.min(cw[1], cw[0] + 2), 200);
    }
    yield* until(() => c.f.phase === 'fight' && fired(c, x.id), 900);
    yield* watchEffect(c, x, 10);
    return verdict(c, x);
  }
  if (on === 'resolved') {
    freeze(c);
    if (T.health) O.health = Math.round(O.maxHealth * (T.health[0] + T.health[1]) / 2);
    const mv = asList(T.move)[0], res = asList(T.result)[0];
    begin(c, mv);
    const m = () => O.move;
    yield;
    const impact = () => m() && O.state === 'windup' ? m().windupFrames - O.moveT : 99;
    if (res === 'dodged') { yield* until(() => impact() <= 4); yield* dodge(c, T.dir || 'L'); }
    else if (res === 'ducked') { yield* until(() => impact() <= 8); c.inp.tap('down'); yield; yield; c.inp.tap('down'); yield; }
    else if (res === 'blocked') { yield* until(() => impact() <= 6); c.inp.tap('down'); c.inp.hold('down'); yield* until(() => O.state !== 'windup', 60); c.inp.hold('down', false); }
    yield* until(() => fired(c, x.id), 120);
    yield* watchEffect(c, x, 40);
    return verdict(c, x);
  }

  // on: 'punch'
  const states = asList(T.state) || [T.counter ? 'windup' : 'idle'];
  const S = states[0];
  const count = T.count || 1;
  for (let k = 0; k < count; k++) {
    if (T.mark) {
      // let him land a punch on us: the state trigger marks it and he talks trash at the end of his combo
      freeze(c);
      begin(c, aCounterable(d)); yield;
      yield* until(() => O.state === 'taunt' && !O.superTaunt, 200);
      if (O.state !== 'taunt') return { ok: false, why: `he never talked trash (marks ${JSON.stringify(K.marks)})` };
      yield* until(() => P.state === 'idle' && P.rebuff === 0, 60); // (his last punch is still staggering us)
      if (!(yield* punchAt(c, hand, () => O.t, Math.max(T.frames ? T.frames[0] + 1 : 5, O.t + 5), 200))) return { ok: false, why: "couldn't time the punch" };
    } else if (S === 'recovery') {
      const mv = asList(T.move)[0] || aCounterable(d);
      freeze(c); begin(c, mv); yield;
      const impact = () => O.move && O.state === 'windup' ? O.move.windupFrames - O.moveT : 99;
      const av = O.move.avoidBy;
      yield* until(() => impact() <= 4);
      if (av.includes('dodgeL')) yield* dodge(c, 'L'); else if (av.includes('dodgeR')) yield* dodge(c, 'R'); else { c.inp.tap('down'); yield; yield; c.inp.tap('down'); yield; }
      yield* until(() => O.state === 'recovery', 80);
      const tgt = T.frames ? T.frames[0] + 1 : 6;
      if (!(yield* punchAt(c, hand, () => O.moveT, tgt, 120))) return { ok: false, why: `couldn't time the punch in his recovery (target ${tgt}F)` };
    } else if (T.since) {
      // make the event happen, then land the punch inside its window
      freeze(c);
      if (T.since.event === 'lightsOn') O.mods.dark = 30;
      else if (T.since.event === 'spotOn') begin(c, O.modifiers.find((m) => m.cfg.type === 'spotlight').cfg.trigger);
      else if (T.since.event === 'echoDodged') {
        // Aurora: throw a bright punch, slip it, then slip the trail's echo (the modifier's own threat)
        const glow = Object.keys(d.moves).find((k) => d.moves[k].glow), af = O.modifiers.find((m) => m.cfg.type === 'afterglow');
        begin(c, glow); yield;
        const imp = () => (O.move && O.state === 'windup' ? O.move.windupFrames - O.moveT : 99);
        yield* until(() => imp() <= 4); yield* dodge(c, 'L');
        yield* until(() => O.mods.trails.some((tr) => tr.state !== 'done'), 200);
        yield* until(() => af.def.threats(O, af.cfg).some((t) => t.left <= 4), 300);
        const av = af.def.threats(O, af.cfg)[0].move.avoidBy;
        if (av.includes('dodgeL')) yield* dodge(c, 'L'); else if (av.includes('dodgeR')) yield* dodge(c, 'R'); else { c.inp.tap('down'); yield; yield; c.inp.tap('down'); yield; }
        freeze(c);
      }
      else if (!['lightsOn', 'spotOn', 'echoDodged'].includes(T.since.event)) c.f.event(T.since.event); // (tempoUp, gateShut, starStolen...: a gimmick's own event, made to happen)
      yield* until(() => K.events[T.since.event] != null, 200);
      const ev = K.events[T.since.event], tgt = ev + T.since.frames[0] + 1;
      // f.clock ticks at the start of each update: a press now lands L+1 ticks later
      yield* until(() => c.f.clock + lead(hand.star) + 1 >= tgt, 60);
      if (P.state !== 'idle') yield* until(() => P.state === 'idle', 30);
      press(c, hand); yield* wait(lead(hand.star) + 2);
    } else if (S === 'windup' && hand.star && T.frames && !T.counter) {
      // a Star Punch takes 20 frames to land: press it first, then start his move so it arrives on frame `tgt`
      const mv = asList(T.move)[0], w = d.moves[mv].windupFrames;
      const tgt = Math.min(w - 1, Math.round((T.frames[0] + T.frames[1]) / 2));
      freeze(c);
      c.P.stars = 3; c.inp.tap('star'); yield* wait(Math.max(0, PT.STAR_IMPACT - tgt - 1));
      begin(c, mv);
      yield* wait(PT.STAR_IMPACT - Math.max(0, PT.STAR_IMPACT - tgt - 1) + 3);
    } else if (S === 'windup') {
      let mv = T.move ? asList(T.move)[0] : aCounterable(d);
      // (the box can only lie about a punch some defense doesn't stop: never a jab every defense stops)
      if (T.test === 'lying' && d.moves[mv].avoidBy.length >= 4) mv = Object.keys(d.moves).find((id) => { const m = d.moves[id]; return m.counterWindow && !m.feint && !m.super && !id.endsWith('*') && m.avoidBy.length < 4 && m.windupFrames >= 7; }) || mv;
      if (T.test === 'charged') O.mods.charged = true;
      if (T.test === 'fakeTell') { const bm = O.modifiers.find((m) => m.cfg.type === 'bones' || m.cfg.type === 'reversed'); bm.cfg = { ...bm.cfg, p: 1 }; } // Rattle, Lament: this tell is a fake
      begin(c, mv);
      // (no tick to spare: a jab thrown at the very start of a 6-frame tell only just lands inside it)
      // Bolt: a long crackle before the shoulder drops (the hold is random: re-roll a short one)
      if (T.test === 'crackling') for (let i = 0; i < 60 && !(O.move.boltHold >= 14); i++) { begin(c, mv); yield; }
      // The Doubt: keep starting the move until the box lies (it's a coin toss)
      // (every box lies for this one: timing the punch may restart his move, and a restart re-rolls the lie)
      if (T.test === 'lying') { const cm = O.modifiers.find((m) => m.cfg.type === 'callout'); if (cm) cm.cfg = { ...cm.cfg, lie: 1 }; begin(c, mv); }
      const mm = O.move, cw = mm.counterWindow || [0, mm.windupFrames - 1];
      let tgt = T.test === 'onCue' ? mm.cueFrame : T.frames ? T.frames[0] + (T.frames[1] > T.frames[0] ? 1 : 0) : T.counter ? Math.min(cw[1], cw[0] + 2) : Math.min(8, mm.windupFrames - 2);
      if (T.counter && T.frames) tgt = Math.max(tgt, cw[0]);
      c.cancelFrom = O.stepIdx;
      if (typeof process !== 'undefined' && process.env.KDBG) console.log('windup dbg', x.id, mv, JSON.stringify({ w: mm.windupFrames, cw, tgt, fake: mm.fake, feint: mm.feint, read: O.read }));
      if (!(yield* punchAt(c, hand, () => O.moveT, tgt, 200))) return { ok: false, why: `couldn't time the punch (target ${tgt}F)` };
      if (typeof process !== 'undefined' && process.env.KDBG) console.log('  after punch: state', O.state, 'moveT', O.moveT, 'stun', O.stun, 'log', JSON.stringify(K.log.slice(-2)));
      yield* watchEffect(c, x, 4);
      if (x.effect && x.effect.cancelMoves) {
        // what does he throw next?
        yield* until(() => O.state === 'windup' || O.state === 'idle' && O.wait < 99000, 400);
        c.nextMove = O.state === 'windup' ? O.moveId : null;
      }
    } else if (S === 'open') {
      if (!startOpen(c, T.open)) return { ok: false, why: `no open step "${T.open}" to set up` };
      const tgt = T.frames ? T.frames[0] + 1 : 2;
      if (!(yield* punchAt(c, hand, () => O.t, tgt, 200))) return { ok: false, why: `couldn't time the punch (target ${tgt}F)` };
    } else if (S === 'vanish') {
      freeze(c);
      yield* punchAt(c, { side: 'R', high: false }, () => O.t, 3);   // a jab at his stance: POOF
      yield* until(() => O.state === 'vanish', 30);
      const side = O.mods.tpSide === 1 ? 'R' : 'L';
      if (!(yield* punchAt(c, { side, high: false }, () => O.t, T.frames[0] + 2, 60))) return { ok: false, why: 'missed the reappearance' };
    } else if (S === 'idle') {
      freeze(c);
      if (T.test === 'midPause') { // Memory Shard: he is in the long pause after his 30th move
        const pat = d.patterns[0]; O.pattern = pat; O.steps = pat.steps;
        let n = 0, i = 0; while (i < pat.steps.length && n < 30) { if (pat.steps[i].move) n++; i++; }
        O.stepIdx = i + 1; O.state = 'idle'; O.wait = 90; O.t = 0;
      }
      if (T.test === 'lightFull') O.mods.light = 1; // Ember: the ring is blazing
      if (T.test === 'aligned') O.mods.ph = O.modifiers.find((m) => m.cfg.type === 'orbit').cfg.period - 1; // Orbit: his two orbs are about to line up
      if (T.test === 'sparkCharged') O.mods.charged = 300; // Spark: crackling
      if (T.test === 'whiteHot') O.mods.stage = 3; // Hale: white-hot
      if (T.test === 'wallUp') { O.mods.wall = -1; O.mods.wallT = 9999; } // Queen Soot: a wall of fire burns
      if (T.test === 'overheating') O.mods.hotT = 9999; // Crucible: overheating
      if (T.test === 'handUp') O.mods.strikes = [{ id: 'handL', side: -1, at: c.f.clock + 80, born: c.f.clock, state: 'tell' }]; // Grasp: the canvas cracks under a hand
      if (T.test === 'bobDown') {
        const fpb = O.mods.beat.fpb, L = lead(false) + 1;
        yield* until(() => { const b = (c.f.clock + L + 1) / fpb; return b - Math.floor(b) < 0.12 && P.state === 'idle'; }, 200);
        press(c, hand); yield* wait(L + 1);
      } else if (hand.star) { press(c, hand); yield* wait(PT.STAR_IMPACT + 2); }
      else { yield* punchAt(c, hand, () => O.t, 4); }
    } else if (hand.star) {
      freeze(c); press(c, hand); yield* wait(PT.STAR_IMPACT + 2);
    }
    if (k < count - 1) { yield* until(() => P.state === 'idle', 60); yield* wait(60); }
  }
  yield* watchEffect(c, x, 20);
  return verdict(c, x);
}
function verdict(c, x) {
  const why = effectCheck(c, x);
  return { ok: !why, why: why || 'fired, effect seen' };
}

// --- anti-strategies ------------------------------------------------------------------------
function* antiScenario(c, a) {
  const O = c.O, P = c.P, K = c.K, B = c.f.behavior, d = c.d;
  const ok = (cond, why) => ({ ok: !!cond, why: cond ? why : `fired=${logged(c, a.id)}: ${why} not seen` });
  switch (a.type) {
    case 'jabSpam': {
      freeze(c);
      for (let i = 0; i < (a.streak || 3); i++) { yield* until(() => P.state === 'idle' && P.rebuff === 0, 60); if (!logged(c, a.id)) freeze(c); press(c, { side: i & 1 ? 'L' : 'R', high: false }); yield* wait(12); }
      yield* until(() => logged(c, a.id) && (O.state === 'windup' || K.pending), 90);
      const counter = asList(a.counter)[0];
      yield* until(() => c.seen.has(counter), 120);
      return ok(logged(c, a.id) && c.seen.has(counter), `parried, answered with ${counter}`);
    }
    case 'turtling': {
      freeze(c);
      c.inp.hold('down'); c.inp.tap('down');
      yield* wait(Math.round((a.span || 480) * ((a.share || 0.4) + 0.1)) + 30);
      if (a.response === 'unblockable') {
        const mv = a.moves[0];
        begin(c, mv); yield;
        const m = O.move;
        c.inp.hold('down', false);
        yield* until(() => O.state !== 'windup', 120);
        return ok(logged(c, a.id) && m.unblockable && !m.avoidBy.includes('block'), `${mv} turned unblockable`);
      }
      if (a.response === 'move') {
        O.wait = 1; // back to his stance: his next step
        yield* until(() => O.state === 'windup', 60);
        const was = O.moveId;
        // block the anchor: the guard breaks (defenseCost)
        yield* until(() => O.state !== 'windup', 120);
        c.inp.hold('down', false);
        return ok(logged(c, a.id) && was === a.move && (!(d.moves[a.move].defenseCost) || P.guardBroken > 0), `${a.move} thrown at the turtle${d.moves[a.move].defenseCost ? ', guard broken by blocking it' : ''}`);
      }
      return ok(logged(c, a.id), 'drain');
    }
    case 'earlyDodge': {
      freeze(c);
      if (a.dark) O.mods.dark = 600;
      // (Polaris's constellation adds its lead-in to the windup: modifyMove)
      const cst = O.modifiers.find((x) => x.cfg.type === 'constellation'), mv = a.moves[0], w0 = d.moves[mv].windupFrames + (cst && d.moves[mv].shape ? cst.cfg.pre : 0);
      let m;
      if (w0 < (a.lead || 12) + 2) {
        // a tell too short to be slipped early: the early slip has to start before it does (he's in his stance)
        yield* dodge(c, 'L');
        yield* wait(3);
        begin(c, mv); yield; m = O.move;
      } else {
        begin(c, mv); m = O.move;
        if (w0 > 17) yield* until(() => O.moveT >= w0 - 16); // (a tell longer than the slip only counts from its last 16 frames)
        yield* dodge(c, 'L'); // early: at least 12 frames still to go
      }
      if (a.response === 'hold') {
        yield* until(() => O.state !== 'windup', 90);
        return ok(logged(c, a.id) && c.f.stats.hitsTaken > 0, `${mv} ${m.windupFrames > w0 ? 'held until the slip ran out' : 'caught the slip\'s tail'}, and it landed`);
      }
      yield* until(() => c.seen.has(asList(a.into)[0]), 90);
      return ok(logged(c, a.id) && c.seen.has(asList(a.into)[0]), `${mv} turned into ${asList(a.into)[0]}`);
    }
    case 'dodgeBias': {
      freeze(c);
      for (let i = 0; i < (a.min || 6) + 1; i++) { yield* until(() => P.state === 'idle', 60); yield* dodge(c, 'L'); yield* wait(26); }
      const mv = a.moves[0];
      begin(c, mv); yield;
      const m = O.move;
      yield* until(() => O.state !== 'windup', 90);
      return ok(logged(c, a.id) && m.avoidBy.includes('dodgeR') && !m.avoidBy.includes('dodgeL') && m.animation.windup[0] === 'hookLTell', `${mv} thrown at the left side (slip right)`);
    }
    case 'starHoard': {
      freeze(c);
      P.stars = 3;
      yield* wait((a.hold || 480) + 10);
      const mv = (a.moves || [aCounterable(d)]).find((id) => d.moves[id].avoidBy.includes('block')) || (a.moves || [])[0];
      begin(c, mv); yield;
      if (O.move.avoidBy.includes('block')) { c.inp.hold('down'); c.inp.tap('down'); }
      yield* until(() => O.state !== 'windup', 90);
      yield* wait(4);
      c.inp.hold('down', false);
      return ok(logged(c, a.id) && P.stars === 2, `a star taken by ${mv} (${O.moveResult})`);
    }
    case 'zoneBias': {
      const high = a.zone ? a.zone === 'head' : false;
      if (a.mode === 'round') {
        // round 1: land head shots (on openings), then the next twin guards the head
        for (let i = 0; i < 3; i++) {
          freeze(c); const mv = aCounterable(d); begin(c, mv); yield;
          const cw = O.move.counterWindow;
          yield* punchAt(c, { side: 'R', high: true }, () => O.moveT, Math.max(cw[0] - 1, Math.min(cw[0] + 1, cw[1] - 1)), 200);
          for (let j = 0; j < 3; j++) { yield* until(() => P.state === 'idle' && P.rebuff === 0, 30); press(c, { side: j & 1 ? 'R' : 'L', high: true }); yield* wait(14); }
          yield* wait(30);
        }
        c.f.clockFrames = 1;
        yield* until(() => c.f.round === 2 && c.f.phase === 'fight', 3000);
        freeze(c);
        yield* punchAt(c, { side: 'R', high: true }, () => O.t, 4);
        return ok(logged(c, a.id) && K.st[a.id].guard && K.st[a.id].guard.zone === 'head', 'the next twin guards the head');
      }
      // streak: land N in a row on one zone (a counter's flurry), then one more when he's back up
      freeze(c); const mv = aCounterable(d); begin(c, mv); yield;
      const cw = O.move.counterWindow;
      yield* punchAt(c, { side: 'R', high }, () => O.moveT, Math.max(cw[0] - 1, Math.min(cw[0] + 1, cw[1] - 1)), 200);
      for (let j = 0; j < (a.streak || 5) - 1; j++) { yield* until(() => P.state === 'idle' && P.rebuff === 0, 30); press(c, { side: j & 1 ? 'R' : 'L', high }); yield* wait(14); }
      yield* until(() => O.state === 'idle' || O.state === 'block', 300);
      freeze(c);
      yield* punchAt(c, { side: 'R', high }, () => O.t, 4);
      if (typeof process !== 'undefined' && process.env.KDBG) console.log('zone dbg', JSON.stringify(B.zone), JSON.stringify(K.st[a.id]), O.state, c.f.stats.landed, c.f.stats.thrown);
      return ok(logged(c, a.id) && K.st[a.id].guard, `guards the ${a.zone || 'zone'}`);
    }
    case 'passivity': {
      if (a.response === 'snack') {
        freeze(c, 1);
        O.wait = 1; // let him take steps (his pattern), no punches from us
        O.superPlan = [];
        yield* until(() => logged(c, a.id), (a.frames || 300) + 900);
        yield* until(() => O.state === 'open' && O.openStep && O.openStep.id === a.step.id, 400);
        return ok(logged(c, a.id) && O.state === 'open', 'snack break');
      }
      freeze(c);
      if (a.response === 'calm') {
        // standing still: he meditates (health creeps back, calm fills), and the next answer he throws spends it
        const W = O.mods.sw, hp0 = Math.round(O.maxHealth * 0.5);
        O.health = hp0; W.hp = hp0;
        yield* wait(Math.round(0.5 * (O.d.special.find((m) => m.type === 'stillwater').fill)) + 120);
        const healed = O.health > hp0 + 2, calmOk = W.calm > 0.3;
        const mvId = O.d.reactions.jabLhigh, base = O.d.moves[mvId];
        const c0 = W.calm;
        begin(c, mvId); yield; // (begin freezes: keep the calm he built, then answer)
        W.calm = c0; O.beginMove(mvId, { forced: true }); yield;
        return ok(logged(c, a.id) && healed && calmOk && O.move.damage > base.damage && O.move.windupFrames < base.windupFrames, `calm ${c0.toFixed(2)}: healed ${hp0} -> ${Math.round(O.health)}, ${mvId} hits ${base.damage} -> ${O.move.damage}, tell ${base.windupFrames} -> ${O.move.windupFrames}`);
      }
      if (a.response === 'buff') {
        // the pride meter fills while you stand there, and his punches hit harder for it
        yield* wait((a.frames || 300) + Math.round(0.5 / (a.gain || 1 / 600)) + 20);
        const mv = aCounterable(d), base = d.moves[mv].damage;
        begin(c, mv); yield;
        return ok(logged(c, a.id) && O.move.damage > base, `${mv} hits harder on his pride (${base} -> ${O.move.damage})`);
      }
      const c0 = O.mods.cheer;
      yield* wait((a.frames || 300) + 60);
      const rate = O.modifiers.find((m) => m.cfg.type === 'crowdMeter').cfg.rate;
      return ok(logged(c, a.id) && O.mods.cheer - c0 > rate * ((a.frames || 300) + 60) * 1.4, 'the crowd meter filled faster');
    }
    case 'rushing': {
      freeze(c);
      for (let i = 0; i < (a.count || 2) + 3 && !logged(c, a.id); i++) {
        yield* until(() => P.state === 'idle' && P.rebuff === 0, 60);
        if (!['idle', 'block', 'vanish'].includes(O.state)) freeze(c);
        press(c, { side: 'R', high: true });
        yield* wait(12);
      }
      const counter = asList(a.counter)[0];
      yield* until(() => c.seen.has(counter), 200);
      return ok(logged(c, a.id) && c.seen.has(counter), `answered with ${counter}`);
    }
    case 'comboRepeat': {
      freeze(c);
      // Dash's reader wants the very same punch twice in a row; the others want a whole combo repeated
      const single = a.builtIn && (O.modifiers.find((m) => m.cfg.type === 'comboReader') || { cfg: {} }).cfg.single;
      const combo = single ? [{ side: 'R', high: false }, { side: 'R', high: false }] : [{ side: 'L', high: false }, { side: 'R', high: false }];
      for (let rep = 0; rep < (single ? 1 : 2); rep++) {
        freeze(c);
        for (const p of combo) { yield* until(() => P.state === 'idle' && P.rebuff === 0, 60); press(c, p); yield* wait(10); }
        yield* wait(60);
      }
      const counter = a.builtIn ? (O.modifiers.find((m) => m.cfg.type === 'comboReader') || { cfg: {} }).cfg.move : asList(a.counter)[0];
      yield* until(() => c.seen.has(counter), 200);
      return ok(logged(c, a.id) && c.seen.has(counter), `combo read, answered with ${counter}`);
    }
    case 'getUpMash': {
      freeze(c);
      c.f.opts.infiniteHealth = false; P.health = 1;
      begin(c, aCounterable(d)); yield;
      yield* until(() => c.f.phase === 'playerDown', 120);
      yield* until(() => { if (c.f.clock & 1) c.inp.tap('a'); return c.f.phase === 'fight'; }, 900);
      c.f.opts.infiniteHealth = true; P.health = P.maxHealth;
      if (a.response === 'moves') {
        yield* until(() => O.moveId === a.moves[0] && O.state === 'windup', 300);
        return ok(logged(c, a.id) && O.moveId === a.moves[0], `straight into ${a.moves[0]}`);
      }
      yield* until(() => O.state === 'windup' && O.move && !O.move.feint && !O.move.call, 600);
      return ok(logged(c, a.id) && O.move && / \(\+\)$/.test(O.move.name), 'his next punches hit harder');
    }
    default: return { ok: false, why: `no scenario for ${a.type}` };
  }
}

// The lab toggle: forcing each entry makes it fire on the very next chance.
function* forcedScenario(c, e, kind) {
  freeze(c);
  if (kind === 'exploit') {
    c.K.force.exploits.add(e.id);
    const on = e.trigger.on || 'punch';
    if (on === 'punch' || on === 'custom') { O_idle(c); yield* punchAt(c, { side: 'R', high: false, star: !!e.trigger.star }, () => c.O.t, 4); }
    else if (on === 'resolved') { begin(c, aCounterable(c.d)); yield* until(() => c.O.state !== 'windup' && c.O.state !== 'active', 120); }
    else if (on === 'getUp') {
      c.O.health = 1;
      if ((c.d.stats.idleHitLimit || 0) >= 1 && c.d.stats.idleGuard !== 'low') yield* punchAt(c, { side: 'R', high: false }, () => c.O.t, 4);
      else { begin(c, aCounterable(c.d)); yield; const cw = c.O.move.counterWindow; yield* punchAt(c, { side: 'R', high: false }, () => c.O.moveT, Math.min(cw[1], cw[0] + 2), 200); }
      yield* until(() => c.f.phase === 'fight' && fired(c, e.id), 900);
    }
    else yield* until(() => fired(c, e.id), 60);
    return { ok: fired(c, e.id), why: fired(c, e.id) ? 'forced: fired' : 'forced: never fired' };
  }
  return { ok: true, why: 'n/a' };
}
function O_idle(c) { freeze(c); }

// A scouting store like the game's (src/save/scouting.js scoutStore), in memory: every scenario that
// passes must also have revealed its entry in the scouting report (K5).
function scoutSpy() {
  const got = new Set();
  return { got, has: (id, key) => got.has(`${id}|${key}`), add(id, key) { const k = `${id}|${key}`; if (got.has(k)) return false; got.add(k); return true; } };
}
const scoutNote = (r, spy, d, key) => (r.ok && !spy.has(d.scoutId || d.id, key) ? { ok: false, why: `${r.why}, but it never revealed "${key}" in the scouting report` } : {});
export function runExploit(d, x) {
  const spy = scoutSpy(), c = makeCtx(d, { scouting: spy });
  const r = run(c, exploitScenario(c, x));
  return { kind: 'exploit', id: x.id, name: x.name, ...r, ...scoutNote(r, spy, d, 'x:' + x.id), frames: c.frames, cues: { ...c.f.track.cues } }; // (cues: the fight's medal telemetry: a Gold that counts '!exploit:<id>' hears it)
}
// Dash's grudge: each recorded strategy gets its own fight, primed from a fake record; the answer to
// it must be switched on and then work exactly like the anti-strategy it is.
function runGrudge(d, a) {
  const bad = [], keys = Object.keys(a.answers || {});
  let frames = 0;
  for (const key of keys) {
    const def = { ...a.answers[key], id: `${a.id}:${key}`, name: a.name, grudge: a.id };
    // (ZERO's true form adapts to your two most-used styles: the lab forces one with opts.adaptForce)
    const spy = scoutSpy(), c = makeCtx(d, a.type === 'adapt' ? { scouting: spy, adaptForce: key } : { scouting: spy, rivalRecord: { get: () => ({ key }), put() {} } });
    const r = run(c, antiScenario(c, def));
    frames += c.frames;
    if (r.ok && !spy.has(d.scoutId || d.id, 'a:' + a.id)) bad.push(`${key}: worked but never revealed "a:${a.id}" in the scouting report`);
    else if (!r.ok) bad.push(`${key}: ${r.why}`);
    else if (a.type === 'grudge' && (!c.K.st[a.id] || c.K.st[a.id].key !== key)) bad.push(`${key}: never primed`);
    else if (a.type === 'adapt' && !(c.K.st[a.id] && (c.K.st[a.id].top || []).includes(key))) bad.push(`${key}: never primed`);
  }
  return { kind: 'anti', id: a.id, name: a.name, type: a.type, ok: !bad.length && keys.length > 0, why: bad.length ? bad.join('; ') : `${keys.length} answers primed and fired`, frames };
}
export function runAnti(d, a) {
  if (a.type === 'grudge' || a.type === 'adapt') return runGrudge(d, a);
  const spy = scoutSpy(), c = makeCtx(d, { scouting: spy });
  const r = run(c, antiScenario(c, a));
  return { kind: 'anti', id: a.id, name: a.name, type: a.type, ...r, ...scoutNote(r, spy, d, 'a:' + a.id), frames: c.frames };
}
export function runForced(d, x) {
  const c = makeCtx(d);
  const r = run(c, forcedScenario(c, x, 'exploit'));
  return { kind: 'forced', id: x.id, name: x.name, ...r, frames: c.frames };
}
export function runFighter(d, { forced = false } = {}) {
  const out = [];
  for (const x of d.exploits || []) out.push(runExploit(d, x));
  for (const a of d.antiStrategies || []) out.push(runAnti(d, a));
  if (forced) for (const x of d.exploits || []) out.push(runForced(d, x));
  return out;
}
export { WINDOW };
