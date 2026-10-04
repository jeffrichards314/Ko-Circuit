// ORIGIN's look in the fight (2026-10-04): the halo of every belt in the game orbiting his head (the true form's a ring of fire), the belts that slam down from the
// sides, afterimages trailing every movement, the First Punch's sun, the Rewind's wipe. Shared with his cutscenes (drawHalo). Hooks are attached to the `origin`
// modifier at the bottom; nothing here changes a frame of the fight's timing.
import { c32 } from '../../engine/palette.js';
import { BELTS } from '../../scene/belts.js';
import { ORIGIN_MODIFIERS } from './origin.js';
import { drawText, textWidth } from '../../engine/font.js';

const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x, y) => B4[(y & 3) * 4 + (x & 3)] / 16;
const BELT_IDS = Object.keys(BELTS);
const W = c32(31, 31, 31);
const colors = (id) => { const B = BELTS[id]; return { strap: c32(...B.strap[1]), strapHi: c32(...B.strap[0]), plate: c32(...B.plate[1]), plateHi: c32(...B.plate[0]) }; };
const CC = {};
const belt = (id) => (CC[id] ||= colors(id));

// a belt, small (the halo) or large (a slam): a strap with a plate on it, seen from the front, `ang` tilting it
export function drawBelt(f, id, x, y, w, h, glow = 0, lit = false) {
  const C = belt(id);
  x = Math.round(x); y = Math.round(y);
  f.rect(x - w, y - (h >> 1), w * 2, h, glow > 0.4 ? W : C.strap);
  f.rect(x - w, y - (h >> 1), w * 2, 1, glow > 0.4 ? W : C.strapHi);
  const pw = Math.max(2, w >> 1);
  f.rect(x - (pw >> 1), y - (h >> 1) - 1, pw, h + 2, glow > 0.2 ? W : C.plate);
  f.rect(x - (pw >> 1), y - (h >> 1) - 1, pw, 1, C.plateHi);
  if (lit) { for (let i = -w - 2; i <= w + 2; i += 2) f.px(x + i, y - (h >> 1) - 3 - (i & 2), W); }
}

// the halo: every belt of the game on a tilted ring round (cx, cy). half 'back' | 'front' | null. fire: the true form's ring of flame. glow: { L, R } 0..1 for the two belts
// that light for a slam (the first to light is the safe side); `gone`: ids of belts that have come down (a gap).
export function drawHalo(f, cx, cy, t, { half = null, fire = false, glow = null, gone = null, rx = 58, ry = 11, speed = 0.011, scale = 1 } = {}) {
  const n = BELT_IDS.length;
  for (let i = 0; i < n; i++) {
    const a = t * speed + (i / n) * Math.PI * 2, front = Math.sin(a) > 0;
    if (half === 'back' && front) continue;
    if (half === 'front' && !front) continue;
    if (gone && gone.has(i)) continue;
    const x = cx + Math.cos(a) * rx * scale, y = cy + Math.sin(a) * ry * scale, k = front ? 1 : 0.7, w = Math.round(7 * k * scale), h = Math.max(2, Math.round(4 * k));
    // the two belts that light for a slam are the ones at the sides (the left- and right-most of the ring)
    const gl = glow ? (Math.cos(a) < -0.8 ? glow.L : Math.cos(a) > 0.8 ? glow.R : 0) : 0;
    drawBelt(f, BELT_IDS[i], x, y, w, h, gl, gl > 0.5);
    if (fire) {
      for (let q = 0; q < 4; q++) { const fy = Math.round(y - 3 - q * 2 - ((t + i * 5) % 3)), fl = q < 1 ? W : q < 2 ? c32(31, 29, 12) : q < 3 ? c32(31, 17, 3) : c32(26, 7, 1); if (((q + i + (t >> 1)) & 1) === 0) f.px(Math.round(x) + (q & 1), fy, fl); f.px(Math.round(x) - 2 + ((q + i) & 3), fy - 1, fl); }
    }
  }
  if (fire && half !== 'back') {
    // a ring of flame joining them all
    for (let a = 0; a < 120; a++) { const q = (a / 120) * Math.PI * 2; if (half === 'front' && Math.sin(q) <= 0) continue; const x = Math.round(cx + Math.cos(q) * rx * scale), y = Math.round(cy + Math.sin(q) * ry * scale); f.px(x, y - 2 - ((t + a) % 4), (a + t) & 1 ? c32(31, 22, 4) : c32(31, 30, 18)); }
  }
}

// the belt that comes down: from the halo at the side to the floor (`k` 0..1), a trail behind it
function drawSlam(f, id, x0, y0, x1, y1, k, t) {
  const e = k * k, x = x0 + (x1 - x0) * e, y = y0 + (y1 - y0) * e;
  for (let q = 1; q < 9; q++) { const kk = Math.max(0, k - q * 0.04), ee = kk * kk, tx = x0 + (x1 - x0) * ee, ty = y0 + (y1 - y0) * ee; if (((q + t) & 1) === 0) f.rect(Math.round(tx) - 6, Math.round(ty), 12, 1, q < 3 ? W : c32(31, 24, 8)); }
  drawBelt(f, id, x, y, 14, 6, k > 0.7 ? 1 : 0.3, false);
}

// the true form's own weather: embers climbing off him, a heat shimmer, white-gold lightning forking down behind
function trueAura(f, fight, x, y) {
  const t = fight.clock;
  for (let i = 0; i < 34; i++) {
    const seed = i * 37 + 11, life = 60 + (seed % 40), k = ((t + seed) % life) / life;
    const ex = Math.round(x + Math.sin(seed) * 70 + Math.sin(t * 0.05 + i) * 5), ey = Math.round(y + 90 - k * 190);
    if (ey < 46 || ey > 222) continue;
    f.px(ex, ey, k < 0.3 ? W : k < 0.65 ? c32(31, 24, 6) : c32(26, 7, 1));
    if (i % 3 === 0) f.px(ex, ey + 1, c32(31, 17, 3));
  }
  // lightning: a forked bolt every so often down one side
  const cyc = t % 70;
  if (cyc < 5) {
    const side = ((t / 70) | 0) & 1 ? 1 : -1;
    let bx = x + side * (60 + ((t / 70) | 0) % 5 * 8), by = 46;
    for (let s = 0; s < 40 && by < 222; s++) { bx += ((s * 7 + ((t / 70) | 0)) % 5) - 2; by += 4; for (let w = 0; w < 4; w++) f.px(bx, by + w, cyc & 1 ? W : c32(31, 29, 14)); }
  }
}

// ---------------------------------------------------------------------------------------------------------------- the hooks
const M = ORIGIN_MODIFIERS.origin;
const headOf = (ai, fight) => { const v = ai.view(); const h = fight.oppHead(v); return { x: h.x, y: h.y, v }; };
const live = (fight) => ['fight', 'oppDown', 'playerDown', 'intro', 'ko', 'phaseShift'].includes(fight.phase);

M.renderBehind = (ai, cfg, frame, fight) => {
  if (!live(fight)) return;
  const O = ai.mods.o, { x, y, v } = headOf(ai, fight);
  if (v.hidden) return;
  // afterimages: ghosts of where he was a few frames ago (every pose, a dither of his colour), more of them the faster he moves
  const sprites = fight.oppSprites;
  const gap = cfg.trueForm ? 3 : 4, nG = cfg.trueForm ? 6 : 3;
  for (let g = nG; g >= 1; g--) {
    const H = O.hist[g * gap];
    if (!H || H.hidden || (H.pose === v.pose && H.dx === v.dx && H.dy === v.dy)) continue;
    let pal; try { pal = fight.oppPalette(cfg.trueForm && g > 2 ? 'originTrue.fire' : (H.pal || 'default')); } catch { pal = fight.oppPal.default; }
    try { frame.blit(sprites.get(H.pose), fight.OPP_X + H.dx + (g & 1 ? 2 : -2), fight.OPP_Y + H.dy, pal, { dither: 1, layer: 0 }); } catch { /* a pose he no longer has */ }
  }
  const fire = !!cfg.trueForm, gone = O.gone;
  if (fire) trueAura(frame, fight, x, y);
  drawHalo(frame, x, y - 16, fight.clock, { half: 'back', fire, glow: haloGlow(ai), gone });
  if (fire) drawHalo(frame, x, y - 16, -fight.clock, { half: 'back', fire: true, rx: 82, ry: 15, speed: 0.007, scale: 1, gone });
  // the afterimage of the true form's AFTERIMAGES attack: a ghost of him on the far side while the blow is thrown
  const m = ai.move;
  if (m && m.afterimage && ['windup', 'active'].includes(ai.state)) {
    const side = (m.avoidBy && m.avoidBy.includes('dodgeL')) ? 1 : -1;
    try { frame.blit(sprites.get(v.pose), fight.OPP_X + v.dx + side * 46, fight.OPP_Y + v.dy, fight.oppPalette(ai.paletteOverride() || 'default'), { dither: 1 }); } catch { /* */ }
  }
};

// which of the two belts is lit, by how far into a halo move's windup he is: the first to light is the SAFE side
function haloGlow(ai) {
  const m = ai.move;
  if (!m || !m.halo || !['windup', 'active'].includes(ai.state)) return null;
  const k = ai.state === 'active' ? 1 : ai.moveT / Math.max(1, m.windupFrames), [a, b] = m.halo.t;
  const safe = m.halo.safe, on = (t0) => (k >= t0 ? 1 : 0);
  if (!safe) return { L: on(a), R: on(a) };
  const first = on(a), second = on(b);
  return safe === 'L' ? { L: first, R: second } : { L: second, R: first };
}

M.renderOpp = (ai, cfg, frame, fight) => {
  if (!live(fight)) return;
  const O = ai.mods.o, { x, y, v } = headOf(ai, fight);
  if (v.hidden) return;
  drawHalo(frame, x, y - 16, fight.clock, { half: 'front', fire: !!cfg.trueForm, glow: haloGlow(ai), gone: O.gone });
  if (cfg.trueForm) drawHalo(frame, x, y - 16, -fight.clock, { half: 'front', fire: true, rx: 82, ry: 15, speed: 0.007, gone: O.gone });
  const m = ai.move, t = fight.clock;
  // a belt slams down on the far side
  if (m && m.halo && ['windup', 'active'].includes(ai.state)) {
    const act = ai.state === 'active' ? ai.moveT / Math.max(1, m.activeFrames) : 0, safe = m.halo.safe;
    if (ai.state === 'active') {
      const sideSign = safe === 'L' ? 1 : safe === 'R' ? -1 : 0, ids = BELT_IDS;
      if (sideSign) drawSlam(frame, ids[(O.t >> 2) % ids.length], x + sideSign * 56, y - 14, fight.OPP_X + sideSign * 30, fight.OPP_Y + 18, Math.min(1, act * 1.4), t);
      else for (const s of [-1, 1]) drawSlam(frame, ids[(O.t >> 2) % ids.length], x + s * 56, y - 14, fight.OPP_X + s * 30, fight.OPP_Y + 18, Math.min(1, act * 1.4), t);
    }
  }
  // the ring of fire (true form): a ring on the floor round the player closing in
  if (m && m.ring && ['windup', 'active'].includes(ai.state)) {
    const k = ai.state === 'active' ? 1 : ai.moveT / Math.max(1, m.windupFrames), rr = (1.2 - k * 0.5) * 70;
    for (let a = 0; a < 90; a++) { const q = (a / 90) * Math.PI * 2, X = Math.round(128 + Math.cos(q) * rr), Y = Math.round(206 + Math.sin(q) * rr * 0.22); frame.px(X, Y - ((t + a) % 5), (a + t) & 1 ? c32(31, 22, 4) : c32(31, 30, 18)); frame.px(X, Y, c32(26, 7, 1)); }
  }
  // the First Punch: a sun in his fist that grows through the slow windup, a flash as it lands
  if (m && m.slowmo) {
    const k = ai.state === 'windup' ? ai.moveT / m.windupFrames : ai.state === 'active' ? 1 : 0;
    if (k > 0) {
      const R = Math.round(4 + k * k * 46), cx = fight.OPP_X + 26 + Math.round(k * 4), cy = fight.OPP_Y - 82 + Math.round(k * 30);
      for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) { const d = Math.hypot(i, j) / R; if (d <= 1 && bayer(cx + i, cy + j) < (1 - d * 0.6) * (0.35 + k * 0.6)) frame.px(cx + i, cy + j, d < 0.35 ? W : d < 0.7 ? c32(31, 28, 10) : c32(31, 16, 2)); }
      if (ai.state === 'active' && ai.moveT < 5) for (let yy = 44; yy < 224; yy++) for (let xx = 0; xx < 256; xx++) if (bayer(xx, yy) < 1 - ai.moveT / 5) frame.px(xx, yy, W);
    }
  }
  // the fragment of the arena that is coming down on you (collision / the world on top of you)
  if (m && m.fragment && ['windup', 'active'].includes(ai.state)) {
    const k = ai.state === 'active' ? 1 : ai.moveT / Math.max(1, m.windupFrames);
    for (const s of [-1, 1]) { const X = Math.round(128 + s * (96 - k * 70)), Y = 120 - Math.round(k * 0 ); for (let j = 0; j < 8; j++) frame.rect(X - 14 + j, Y + j, 28 - j * 2, 1, ((j + (t >> 2)) & 1) ? c32(24, 14, 6) : c32(31, 24, 10)); }
  }
};

M.postScene = (ai, cfg, frame, fight) => {
  const O = ai.mods.o;
  if (!live(fight)) return;
  // slow motion: the edges of the screen go dark, the middle keeps its light
  const dark = Math.max(0, (1 - O.sm) / 0.7);
  if (dark > 0.02) for (let y = 44; y < 224; y++) for (let x = 0; x < 256; x++) { const d = Math.hypot((x - 128) / 150, (y - 130) / 110); if (bayer(x, y) < Math.min(0.85, d * dark * 0.9)) frame.px(x, y, c32(1, 0, 2)); }
  // the true form: the screen's lower edge is always burning, brighter when he is about to strike
  if (cfg.trueForm) {
    const hot = ai.move && ['windup', 'active'].includes(ai.state) ? 1 : 0, t = fight.clock;
    for (let x = 0; x < 256; x++) { const h = 4 + ((Math.sin(x * 0.31 + t * 0.2) + Math.sin(x * 0.11 - t * 0.13)) * 3) + hot * 4; for (let j = 0; j < h; j++) if (bayer(x, j + t) < 1 - j / h) frame.px(x, 223 - j, j < h * 0.35 ? W : j < h * 0.65 ? c32(31, 22, 4) : c32(26, 7, 1)); }
  }
  // the rewind: a wipe of scanlines running back, a flash of reversed light
  if (O.rwFlash > 0) {
    const k = O.rwFlash / 40;
    for (let y = 44; y < 224; y += 2) { const off = Math.round(Math.sin(y / 7 + O.rwFlash) * 6 * k); for (let x = 0; x < 256; x += 3) if (bayer(x + off, y) < k * 0.5) frame.px(x, y, (y >> 2) & 1 ? W : c32(14, 24, 31)); }
  }
};
M.render = (ai, cfg, frame, fight) => {
  const O = ai.mods.o;
  if (!live(fight) || fight.phase === 'intro') return;
  // a badge under the clock while a rewound sequence runs: how many times it has run back
  if (O.rw) { const t = O.rw.n ? `REWIND x${O.rw.n}` : 'REWIND', w = textWidth(t, false) + 8; frame.rect(128 - (w >> 1), 31, w, 10, c32(2, 2, 6)); drawText(frame, t, 128 - (textWidth(t, false) >> 1), 33, O.rw.n ? c32(31, 12, 8) : c32(14, 24, 31), { mono: false }); }
};
void ORIGIN_MODIFIERS;
