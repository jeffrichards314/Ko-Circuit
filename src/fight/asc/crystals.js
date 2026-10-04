// ZERO's crystals (the true form rework, 2026-10-04; data/fighters/void/crystals.js has the twelve and their colours).
//
// Twelve crystals orbit ZERO for the whole fight, one in each Hollowed fighter's colour, moving with him. Each is a family of attacks.
//   GLOW      the crystal of an attack's family glows brightly before the attack comes (from the moment its blow is next in his routine, or his
//             crystal attack begins) and until it has been thrown: the glow is part of the tell, so the colour tells you what kind of attack is
//             coming. Several glow at once when he chains two families (a pair, the Title Defense's Convergence).
//   CRACK     landing the golden moment of a crystal attack cracks that crystal: it dims, shatters, and the whole family is out of his pool for the
//             rest of the fight. Cracked crystals stay as broken shards, orbiting dimly, so the progress shows.
//   POOL      a cracked crystal's blows leave his patterns (`steps`, `removed`), its test segment is skipped (zeroSeg), its attack is never thrown again
//             (`pickSuper`). His own plain routine (NOTHING, NO ONE, NOWHERE) is never taken away.
//   PAIRS     in the last phase a super can be two crystals' attacks run into each other, ending in one golden blow that cracks both; the Title Defense
//             exclusive (the Convergence) runs up to four. The chain is built as he throws it from the crystals that are still whole.
// Cracked crystals reset with every fight (the state lives in the opponent's `mods`): every Title Defense attempt starts with all twelve whole.
import { c32 } from '../../engine/palette.js';
import { CRYSTALS, CRYSTAL_BY_ID, CRYSTAL_OF_MOVE, crystalChain } from '../../../data/fighters/void/crystals.js';

const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x, y) => B4[(y & 3) * 4 + (x & 3)] / 16;
const LEAD = 20;            // frames before a family's blow its crystal starts to glow
const CRACK_T = 30, SHATTER_T = 52; // the crack's length (frames), when it shatters
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const mix = ([r, g, b], k) => [r, g, b].map((v) => Math.max(0, Math.min(31, Math.round(k < 1 ? v * k : v + (31 - v) * (k - 1)))));
const col = (rgb, k = 1) => c32(...mix(rgb, k));
const PH = (f) => (f.bossPhases > 1 ? f.bossPhase : f.round);

export const crystalState = (ai) => ai.mods.cr;
export const isBroken = (ai, id) => !!(ai.mods.cr && ai.mods.cr.broken[id] !== undefined);
export const aliveCrystals = (ai) => CRYSTALS.filter((c) => !isBroken(ai, c.id));
export const brokenCount = (ai) => (ai.mods.cr ? Object.keys(ai.mods.cr.broken).length : 0);

// the frames until his next move (and its id) when he is between moves; null when something that is not a move comes first
function peek(ai) {
  let wait = null;
  if (ai.state === 'idle' || ai.state === 'block' || (ai.state === 'taunt' && !ai.superTaunt)) wait = Math.max(0, ai.wait);
  else if (ai.state === 'recovery' && ai.move) wait = Math.max(0, ai.move.recoveryFrames - ai.moveT);
  else return null;
  const steps = ai.steps;
  if (!steps || !ai.pattern) return null;
  for (let i = ai.stepIdx; i < steps.length; i++) {
    const s = steps[i];
    if (s.move) return { id: s.move, in: wait };
    if (s.idle !== undefined) wait += s.idle; else if (s.taunt) wait += s.taunt; else if (s.block) wait += s.block; else return null;
    if (wait > LEAD) return null;
  }
  return null;
}

// a super's crystals (a single, a pair, the Convergence's several)
const crystalsOf = (S) => (S ? S.crystals || (S.crystal ? [S.crystal] : []) : []);

export const CRYSTAL_MODIFIERS = {
  crystals: {
    init(ai) {
      ai.mods.cr = { broken: {}, glow: {}, crack: {}, t: 0, picks: 0, last: null, shards: {}, base: null };
      for (const c of CRYSTALS) { ai.mods.cr.glow[c.id] = 0; }
    },

    // ---- the pool -------------------------------------------------------------------------------------------------------------------
    removed(ai, cfg, moveId) { const id = CRYSTAL_OF_MOVE[moveId]; return !!id && isBroken(ai, id); },
    // his next pattern without the moves of a broken crystal (and the pause that led into each one)
    steps(ai, cfg, steps) {
      if (!brokenCount(ai)) return steps;
      const out = [];
      for (const s of steps) {
        if (s.move && CRYSTAL_OF_MOVE[s.move] && isBroken(ai, CRYSTAL_OF_MOVE[s.move])) {
          if (out.length && out[out.length - 1].idle !== undefined && Object.keys(out[out.length - 1]).length === 1) out.pop();
          continue;
        }
        out.push(s);
      }
      return out;
    },
    // which super comes: one of the whole crystals' attacks, by the phase (his signature echoes are the other choice), a pair in the last phase,
    // and in Title Defense the Convergence first and then every third
    pickSuper(ai, cfg, list) {
      const C = ai.mods.cr, f = ai.fight, ph = PH(f), n = C.picks++;
      const alive = aliveCrystals(ai);
      const single = (id) => list.find((S) => S.crystal === id);
      const echo = list.find((S) => S.moves && !S.crystal && !S.exclusive) || list.find((S) => !S.crystal && !S.exclusive);
      const ex = list.find((S) => S.exclusive);
      const pick = (excl) => { const pool = alive.filter((c) => c.id !== excl); return (pool.length ? rnd(pool) : alive[0]) || null; };
      let S = null;
      if (ex && alive.length && n % 3 === 0) S = derive(ai, ex, alive.slice(0, 4).map((c) => c.id), 'convergence');
      else if (!alive.length) S = echo;
      else {
        const r = Math.random(), segKey = ai.mods.seg, segC = ph === 1 ? alive.find((c) => c.key === segKey) : null;
        if (ph === 1) S = segC && r < 0.7 ? single(segC.id) : r < 0.85 ? single(pick(C.last).id) : echo;
        else if (ph === 2) S = r < 0.45 ? echo : single(pick(C.last).id);
        else if (ph === 3) S = r < 0.3 ? echo : single(pick(C.last).id);
        else if (alive.length >= 2 && r < 0.4) {
          const a = pick(C.last), b = pick(a.id);
          S = derive(ai, list.find((q) => q.pair), [a.id, b.id], 'pair');
        } else S = r < 0.8 ? single(pick(C.last).id) : echo;
      }
      S = S || echo;
      const ids = crystalsOf(S);
      C.last = ids.length === 1 ? ids[0] : null;
      return S;
    },

    // ---- the golden moment cracks the crystal(s) of the attack ---------------------------------------------------------------------
    golden(ai, cfg, G) {
      for (const id of crystalsOf(G)) crack(ai, id);
    },

    // ---- glow and cracks, every frame ------------------------------------------------------------------------------------------------
    update(ai) {
      const C = ai.mods.cr, f = ai.fight;
      const want = {};
      const add = (id, v = 1) => { if (id && !isBroken(ai, id)) want[id] = Math.max(want[id] || 0, v); };
      if (f.phase === 'fight' || f.phase === 'intro') {
        // his crystal attack(s): lit from the step back to the last blow
        const S = ai.armor ? ai.armor.S : ai.superTaunt || ai.state === 'backstep' || ai.state === 'advance' ? ai.cur : null;
        if (S) {
          const ids = crystalsOf(S);
          const spent = (id) => { // a crystal whose blows are all behind him lets its light fall (the pair's first, the Convergence's earlier ones)
            const ch = ai.armor && ai.armor.chain, i = ai.armor ? ai.armor.i : -1;
            if (!ch || ids.length < 2) return false;
            const own = ch.map((m, k) => (CRYSTAL_OF_MOVE[m] === id ? k : -1)).filter((k) => k >= 0);
            return own.length && Math.max(...own) < i;
          };
          for (const id of ids) add(id, spent(id) ? 0.3 : 1);
        }
        // the family of the blow he is throwing, and of the one he is about to
        if (ai.move && ['windup', 'active'].includes(ai.state)) add(CRYSTAL_OF_MOVE[ai.moveId] || ai.move.crystal, 1);
        const pk = peek(ai);
        if (pk && pk.in <= LEAD) add(CRYSTAL_OF_MOVE[pk.id], 1);
        // a test segment keeps its crystal lit a little (the test is that skill's)
        if (f.phase === 'fight' && ai.mods.seg) { const c = CRYSTALS.find((q) => q.key === ai.mods.seg); if (c) add(c.id, 0.32); }
      }
      for (const c of CRYSTALS) {
        const g = C.glow[c.id], w = want[c.id] || 0;
        C.glow[c.id] = w > g ? Math.min(w, g + 0.22) : Math.max(w, g - 0.07);
      }
      // the cracks run their course
      for (const [id, t0] of Object.entries(C.broken)) {
        if (f.clock - t0 === SHATTER_T) { f.sfx('shardBreak'); f.shake = Math.max(f.shake, 6); }
      }
    },
    // (a new fight inside the same opponent object never happens; a new round does not heal a crystal)
  },
};

// the super as it will be thrown: the pair's or the Convergence's chain from the crystals that are whole
export function derive(ai, T, ids, kind) {
  const first = T.move, fin = T.then[T.then.length - 1];
  const blows = [];
  const per = kind === 'pair' ? 3 : 2;
  ids.forEach((id, i) => {
    const c = CRYSTAL_BY_ID[id], ch = crystalChain(c);
    for (let n = 0; n < per; n++) blows.push(ch[kind === 'convergence' ? (i + n) % 4 : n]);
  });
  return { ...T, move: first, then: [...blows, fin], crystals: ids };
}

function crack(ai, id) {
  const C = ai.mods.cr, f = ai.fight;
  if (C.broken[id] !== undefined) return;
  C.broken[id] = f.clock;
  f.sfx('glass');
  f.event('crystalCracked'); f.event('crystal:' + id);
  if (ai.know) ai.know.roundFlags.cracked = true;
  // (the segment he was in, if it was this crystal's test, is over: zeroSeg skips it)
}

// ---------------------------------------------------------------------------------------------------------------- drawing
export const ORBIT = { rx: 66, ry: 15, speed: 0.0125 };
function drawGem(frame, x, y, k, rgb, glow, outline) {
  x = Math.round(x); y = Math.round(y);
  const h = Math.round(19 * k), w = Math.round(12 * k), half = (w - 1) / 2;
  const top = col(rgb, 1 + 0.4 + glow * 0.4), mid = col(rgb, 1), dark = col(rgb, 0.55), core = c32(31, 31, 31);
  for (let j = 0; j < h; j++) {
    const u = j < h * 0.38 ? (j + 1) / (h * 0.38) : (h - j) / (h * 0.62);
    const hw = Math.max(0, Math.round(u * half));
    for (let i = -hw; i <= hw; i++) {
      const edge = Math.abs(i) === hw;
      let c = i < -hw / 3 ? top : i > hw / 3 ? dark : mid;
      if (glow > 0.55 && Math.abs(i) <= 1 && j > 1 && j < h - 2) c = core;
      frame.px(x + i, y - (h >> 1) + j, edge ? outline : c);
    }
  }
}
function drawHalo(frame, x, y, glow, rgb) {
  if (glow < 0.08) return;
  x = Math.round(x); y = Math.round(y);
  const R = Math.round(13 + glow * 17), c1 = col(rgb, 1.1), c2 = col(rgb, 1.7), c3 = c32(31, 31, 31);
  for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) {
    const d = Math.hypot(i, j * 1.1);
    if (d > R) continue;
    const k = Math.min(1, (1 - d / R) * glow * 1.7);
    if (bayer(x + i, y + j) < k) frame.px(x + i, y + j, d < R * 0.3 && glow > 0.7 ? c3 : d < R * 0.55 ? c2 : c1);
  }
  // a thin ring that breathes out from it while it is lit
  if (glow > 0.6) { const rr = R + 3 + ((frame.t || 0) % 8); void rr; }
}
function drawCracked(frame, x, y, k, rgb, age, outline) {
  // age 0..CRACK_T: jagged white lines grow over the gem, which dims toward grey; the gem shakes
  const u = Math.min(1, age / CRACK_T), dim = 1 - u * 0.65, jx = age < SHATTER_T && age % 4 < 2 ? 1 : 0;
  drawGem(frame, x + jx, y, k, mix(rgb, dim).map((v, i) => Math.round(v * (1 - u * 0.4) + [14, 14, 16][i] * u * 0.4)), 0, outline);
  const lines = [[0, -9, -4, -2], [-4, -2, 1, 2], [1, 2, -3, 8], [0, -9, 4, -3], [4, -3, 0, 1], [0, 1, 4, 8]];
  const n = Math.ceil(u * lines.length);
  for (let q = 0; q < n; q++) { const [x0, y0, x1, y1] = lines[q]; const steps = 5; for (let s = 0; s <= steps; s++) frame.px(Math.round(x + x0 + ((x1 - x0) * s) / steps), Math.round(y + y0 + ((y1 - y0) * s) / steps), c32(31, 31, 31)); }
}
// the pieces a shattered crystal leaves: three slivers drifting round the same place, dim and colourless
function drawShards(frame, x, y, k, rgb, age, i, outline, flicker) {
  const dim = mix(rgb, 0.4).map((v, q) => Math.round(v * 0.55 + [12, 12, 14][q] * 0.45));
  const base = c32(dim[0], dim[1], dim[2]), lit = col(dim, 1.3);
  const bob = Math.sin(age / 30 + i) * 2;
  const bits = [[-4, 3, 4, 7], [3, -3, 3, 6], [0, 7, 5, 3]];
  const spread = Math.min(1, (age - SHATTER_T) / 24);
  bits.forEach(([dx, dy, w, h], q) => {
    const X = Math.round(x + dx * (1 + spread * 0.6) * k), Y = Math.round(y + dy * (1 + spread * 0.6) * k + bob);
    for (let j = 0; j < h; j++) { const hw = Math.max(0, Math.round(((h - j) / h) * (w / 2))); for (let a = -hw; a <= hw; a++) frame.px(X + a, Y + j, Math.abs(a) === hw ? outline : (q + j) & 1 ? base : lit); }
  });
  // a spark of its colour now and then: the light that used to be there
  if (flicker && ((age + i * 7) % 90) < 3) frame.px(Math.round(x), Math.round(y + bob), col(rgb, 1.4));
}

// One side of the ring (front or back half) for any state: the fight's and the Reforging's (src/screens/void.js) share it.
//   R = { cx, cy, t (the frame count), glow: { id: 0..1 }, broken: { id: frame it cracked }, clock (the same count as `t` when it cracked), white, down, only? (ids) }
export function drawRingSide(frame, R, front) {
  const outline = R.white ? c32(2, 2, 6) : c32(1, 1, 4);
  const list = [];
  CRYSTALS.forEach((c, i) => {
    if (R.only && !R.only.includes(c.id)) return;
    const p = ringPlace(R, i);
    if ((p.front >= 0.5) === front) list.push({ c, p, i });
  });
  list.sort((a, b) => a.p.front - b.p.front);
  for (const { c, p, i } of list) {
    const k = (0.72 + 0.34 * p.front) * (R.scale || 1);
    const t0 = R.broken ? R.broken[c.id] : undefined;
    if (t0 === undefined) {
      const g = (R.glow && R.glow[c.id]) || 0;
      drawHalo(frame, p.x, p.y, g, c.color);
      drawGem(frame, p.x, p.y, k * (1 + g * 0.18), c.color, g, outline);
    } else {
      const age = R.clock - t0;
      if (age < SHATTER_T) drawCracked(frame, p.x, p.y, k, c.color, age, outline);
      else {
        // the burst: white points flying out of it for a few frames, then the shards
        if (age < SHATTER_T + 10) for (let q = 0; q < 14; q++) { const a = q * 0.45 + i, r = (age - SHATTER_T) * 2.2 + 2; frame.px(Math.round(p.x + Math.cos(a) * r), Math.round(p.y + Math.sin(a) * r * 0.8), q & 1 ? c32(31, 31, 31) : col(c.color, 1.4)); }
        drawShards(frame, p.x, p.y, k, c.color, age, i, outline, true);
      }
    }
  }
}
export function ringPlace(R, i) {
  const a = R.t * ORBIT.speed + (i * Math.PI * 2) / 12;
  const front = (Math.sin(a) + 1) / 2, rk = R.down ? 0.8 : 1, w = R.wide || 1;
  return { x: R.cx + Math.cos(a) * ORBIT.rx * rk * w, y: R.cy + Math.sin(a) * ORBIT.ry * w + Math.sin(R.t / 22 + i * 1.7) * 1.5, front };
}

function drawSide(ai, frame, fight, front) {
  const C = ai.mods.cr;
  // (outside the fight's own frames (a count, a phase change) the modifier's update does not run: the light dies down here)
  if (C && front === false && fight.phase !== 'fight' && C.settled !== fight.clock) { C.settled = fight.clock; for (const c of CRYSTALS) C.glow[c.id] = Math.max(0, C.glow[c.id] - 0.07); }
  if (!C || !['fight', 'oppDown', 'playerDown', 'intro', 'ko', 'phaseShift'].includes(fight.phase)) return;
  const v = ai.view();
  if (v.hidden) return;
  const down = ['kd', 'down', 'getup'].includes(ai.state);
  const R = { cx: fight.OPP_X + v.dx, cy: fight.OPP_Y + v.dy - (down ? 26 : 92) + Math.round(Math.sin(fight.clock / 38) * 2), t: fight.clock, clock: fight.clock, glow: C.glow, broken: C.broken, white: fight.minimalHud, down };
  drawRingSide(frame, R, front);
}
CRYSTAL_MODIFIERS.crystals.renderBehind = (ai, cfg, frame, fight) => drawSide(ai, frame, fight, false);
CRYSTAL_MODIFIERS.crystals.renderOpp = (ai, cfg, frame, fight) => drawSide(ai, frame, fight, true);
