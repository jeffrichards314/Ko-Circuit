// The Title Defense costume kit: pieces a remix (data/sprites/remix.js) hangs on a fighter so he is a new design, not a recolour. Each is a function
// of the draw context (the same `ctx` the fighters' own layers get: cv, J joints, D dims, ramps, mask(), c(key)) and takes a ramp NAME, resolved
// in the fighter's `ramps` (his remix may add some, built from palette keys he already has: the TD palette recolours them).
//   head:   crown spikeHalo helm hood hat horns plume crescent halo eyepatch visor mask band beard
//   back:   cape wingsBat spikes aura ring tail
//   torso:  pauldrons sash bandolier plate collar skirt apron straps emblem ribs studs belt
//   front:  bracers greaves rings spikesGlove
// They never draw outside the figure's own canvas on purpose: every part is a shaded mask like the rest of the sprite.

import { wing } from './fighters/pantheon/_rig.js';

const hx = (H) => Math.round(H.x + H.look[0] * 0.3);
const top = (H) => Math.round(H.y - H.ry);
const part = (ctx, m, ramp, o = {}) => ctx.cv.part(m, { ramp: ctx.ramps[ramp], bevel: o.bevel ?? 3, inner: o.inner ?? 'line', shadow: o.shadow ?? false, ...(o.bias ? { bias: o.bias } : {}) });
const at = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const SIDES = [['L', -1], ['R', 1]];

// ---------------------------------------------------------------- head
export function crown(ctx, H, { ramp = 'gold', n = 5, h = 8, w = 0, band = 3, lift = 0, gem = null } = {}) {
  const x = hx(H), ty = top(H) + 2 - lift, rx = H.rx + w, by = ty - band + 2;
  const m = ctx.mask().rect(x - rx, by, rx * 2, band);
  for (let i = 0; i < n; i++) {
    const cx = x - rx + (i + 0.5) * ((rx * 2) / n), tall = i % 2 === 0 ? h : h * 0.7;
    m.poly([[cx - rx / n, by + 0.5], [cx, by - tall], [cx + rx / n, by + 0.5]]);
  }
  part(ctx, m, ramp, { bevel: 2 });
  if (gem) ctx.cv.part(ctx.mask().ellipse(x, by + 1, 1.7, 1.5), { ramp: ctx.ramps[gem], bevel: 1, shadow: false });
}
export function horns(ctx, H, { ramp = 'bone', len = 12, out = 5, y = 3, thick = 3 } = {}) {
  const x = hx(H), ty = top(H);
  for (const [, s] of SIDES) {
    const m = ctx.mask().capsule(x + s * (H.rx - 1), ty + y, x + s * (H.rx + out * 0.7), ty - len * 0.45, thick, thick * 0.7)
      .capsule(x + s * (H.rx + out * 0.7), ty - len * 0.45, x + s * (H.rx + out * 0.2), ty - len, thick * 0.7, 0.8);
    part(ctx, m, ramp, { bevel: 2 });
  }
}
export function antlers(ctx, H, { ramp = 'bone', len = 14 } = {}) {
  const x = hx(H), ty = top(H);
  for (const [, s] of SIDES) {
    const m = ctx.mask().capsule(x + s * (H.rx - 2), ty + 3, x + s * (H.rx + 3), ty - len * 0.7, 1.7, 1.2).capsule(x + s * (H.rx + 3), ty - len * 0.7, x + s * (H.rx + 1), ty - len, 1.2, 0.7);
    m.capsule(x + s * (H.rx + 1), ty - len * 0.35, x + s * (H.rx + 7), ty - len * 0.55, 1.1, 0.6).capsule(x + s * (H.rx + 3), ty - len * 0.7, x + s * (H.rx + 8), ty - len * 0.95, 1.1, 0.6);
    part(ctx, m, ramp, { bevel: 1 });
  }
}
// a dome over the top of the head; cover = how far down the face it comes; crest: 'fin' | 'plume' | 'spike' | null
export function helm(ctx, H, { ramp = 'steel', cover = 0.45, crest = null, crestRamp = null, cheeks = false, nasal = false, rim = null } = {}) {
  const x = hx(H), y = Math.round(H.y), ty = top(H);
  const dome = ctx.mask().ellipse(x, y - 1.5, H.rx + 1.6, H.ry + 1.1).clip(ctx.mask().rect(x - H.rx - 4, ty - 5, H.rx * 2 + 8, H.ry * 2 * cover + 5));
  if (cheeks) for (const [, s] of SIDES) dome.rect(x + s * (H.rx - 1.5) - (s < 0 ? 0 : 2.5), y - 2, 3.5, 12);
  if (nasal) dome.rect(x - 1, y - 2, 2.4, 9);
  part(ctx, dome, ramp, { bevel: 5 });
  if (rim) part(ctx, ctx.mask().rect(x - H.rx - 0.6, ty + H.ry * 2 * cover - 1, H.rx * 2 + 1.2, 2.2), rim, { bevel: 1 });
  if (crest === 'fin') part(ctx, ctx.mask().poly([[x - 2.5, ty + 1], [x - 1, ty - 9], [x + 3, ty - 11], [x + 2.5, ty + 1]]), crestRamp || ramp, { bevel: 2 });
  if (crest === 'spike') part(ctx, ctx.mask().poly([[x - 3, ty + 1], [x, ty - 12], [x + 3, ty + 1]]), crestRamp || ramp, { bevel: 1 });
  if (crest === 'plume') plume(ctx, H, { ramp: crestRamp || ramp, len: 15, from: [x, ty - 1] });
}
export function hood(ctx, H, { ramp = 'cloth', drape = 8, shade = true } = {}) {
  const x = hx(H), y = Math.round(H.y), fx = x + H.look[0], fy = y + H.look[1];
  const m = ctx.mask().ellipse(x, y - 1.5, H.rx + 3.2, H.ry + 3).cut(ctx.mask().ellipse(fx, fy + 1.5, H.rx - 1.2, H.ry - 2.2));
  for (const [, s] of SIDES) m.poly([[x + s * (H.rx + 3), y], [x + s * (H.rx - 2), y + 4], [x + s * (H.rx + 5), y + 5 + drape], [x + s * (H.rx + 7), y + 2]]);
  part(ctx, m, ramp, { bevel: 4 });
  if (shade) ctx.cv.line(x, top(H) - 2, x, top(H) + 3, (X, Y) => ctx.cv.shade(X, Y, 1));
}
// hats: 'top' 'bicorne' 'peak' 'wide' 'beanie' 'turban' 'fez'
export function hat(ctx, H, { kind = 'top', ramp = 'cloth', band = null, bandRamp = null, h = 12, lift = 0 } = {}) {
  const x = hx(H), ty = top(H) + 2 - lift, rx = H.rx;
  const cv = ctx.cv;
  if (kind === 'top') {
    part(ctx, ctx.mask().rect(x - rx - 2, ty - 1, rx * 2 + 4, 3), ramp, { bevel: 1 });
    part(ctx, ctx.mask().rect(x - rx + 1.5, ty - h, rx * 2 - 3, h), ramp, { bevel: 3 });
    if (band) part(ctx, ctx.mask().rect(x - rx + 1.5, ty - 4, rx * 2 - 3, 3), bandRamp || band, { bevel: 1 });
  } else if (kind === 'bicorne') {
    const m = ctx.mask().ellipse(x, ty - 3, rx + 5, 5.5).cut(ctx.mask().ellipse(x, ty + 5, rx + 6, 5));
    m.poly([[x - rx - 6, ty - 2], [x - rx - 1, ty - 9], [x - rx + 3, ty - 1]]).poly([[x + rx + 6, ty - 2], [x + rx + 1, ty - 9], [x + rx - 3, ty - 1]]);
    part(ctx, m, ramp, { bevel: 3 });
    if (band) cv.line(x - rx - 3, ty - 3, x + rx + 3, ty - 3, (X, Y) => cv.px(X, Y, ctx.ramps[bandRamp || band][1]));
  } else if (kind === 'peak') {
    part(ctx, ctx.mask().ellipse(x, ty - 2, rx + 1.6, 7).clip(ctx.mask().rect(x - rx - 4, ty - 10, rx * 2 + 8, 11)), ramp, { bevel: 4 });
    part(ctx, ctx.mask().rect(x - rx - 1, ty + 1, rx * 2 + 2, 3), band ? bandRamp || band : ramp, { bevel: 1 });
    part(ctx, ctx.mask().ellipse(x, ty + 3.5, rx + 2, 1.8), ramp, { bevel: 1 });
  } else if (kind === 'wide') {
    part(ctx, ctx.mask().ellipse(x, ty + 1, rx + 9, 3), ramp, { bevel: 2 });
    part(ctx, ctx.mask().ellipse(x, ty - 3, rx - 1, 6).clip(ctx.mask().rect(x - rx, ty - 10, rx * 2, 9)), ramp, { bevel: 4 });
  } else if (kind === 'beanie') {
    part(ctx, ctx.mask().ellipse(x, ty, rx + 1.2, 7).clip(ctx.mask().rect(x - rx - 3, ty - 9, rx * 2 + 6, 11)), ramp, { bevel: 4 });
    if (band) part(ctx, ctx.mask().rect(x - rx - 0.5, ty + 1, rx * 2 + 1, 3), bandRamp || band, { bevel: 1 });
    part(ctx, ctx.mask().ellipse(x, ty - 8, 2.5, 2.5), bandRamp || ramp, { bevel: 2 });
  } else if (kind === 'turban') {
    part(ctx, ctx.mask().ellipse(x, ty - 1, rx + 2.4, 8).clip(ctx.mask().rect(x - rx - 5, ty - 10, rx * 2 + 10, 14)), ramp, { bevel: 5 });
    for (let i = -2; i <= 2; i++) cv.line(x + i * 4 - 3, ty + 3, x + i * 4 + 3, ty - 7, (X, Y) => cv.shade(X, Y, 1));
    if (band) part(ctx, ctx.mask().ellipse(x, ty - 1, 2.6, 2.6), bandRamp || band, { bevel: 2 });
  } else if (kind === 'fez') {
    part(ctx, ctx.mask().poly([[x - rx + 1, ty + 2], [x + rx - 1, ty + 2], [x + rx - 3, ty - h], [x - rx + 3, ty - h]]), ramp, { bevel: 3 });
    if (band) part(ctx, ctx.mask().rect(x - 1, ty - h - 5, 2, 6).add(ctx.mask().ellipse(x, ty - h - 5, 2, 2)), bandRamp || band, { bevel: 1 });
  }
}
// a pointed hood over the whole head with two eye slits (eye: a ramp name for the light in them, or null)
export function cowl(ctx, H, { ramp = 'cloth', point = 10, eye = null, drape = 6 } = {}) {
  const x = hx(H), y = Math.round(H.y), fx = x + H.look[0], fy = y + H.look[1];
  const m = ctx.mask().ellipse(x, y - 1, H.rx + 2.2, H.ry + 1.6).ellipse(x, y + 7, H.rx + 1.4, 10);
  m.poly([[x - H.rx + 1, y - H.ry + 2], [x + 1, y - H.ry - point], [x + H.rx - 1, y - H.ry + 2]]);
  for (const [, s] of SIDES) m.poly([[x + s * (H.rx + 1), y + 8], [x + s * (H.rx + 5), y + 10 + drape], [x + s * (H.rx - 3), y + 14]]);
  part(ctx, m, ramp, { bevel: 5 });
  ctx.cv.line(x, y - H.ry + 1, x + 1, y - H.ry - point + 3, (X, Y) => ctx.cv.shade(X, Y, 1));
  for (const [, s] of SIDES) {
    ctx.cv.flat(ctx.mask().rect(fx + s * 5 - 2, fy - 2, 4, 2.4), ctx.c('outline'), false);
    if (eye) ctx.cv.px(fx + s * 5 - (s < 0 ? 0 : 1), fy - 1, ctx.ramps[eye][0]);
  }
}
// a long horn / trumpet held out from a fist (side 'L' | 'R'), flaring to a bell
export function horn(ctx, { ramp = 'brass', side = 'R', len = 20, bell = 6, lift = 0.35 } = {}) {
  const { J } = ctx, f = J['fi' + side], s = side === 'R' ? 1 : -1;
  const ex = f[0] + s * len, ey = f[1] - len * lift - 6;
  part(ctx, ctx.mask().capsule(f[0], f[1] - 2, ex, ey, 1.6, bell), ramp, { bevel: 2 });
  part(ctx, ctx.mask().ellipse(ex, ey, bell * 0.9, bell * 1.05), ramp, { bevel: 2 });
  ctx.cv.flat(ctx.mask().ellipse(ex + s * 0.8, ey - 0.6, bell * 0.5, bell * 0.62), ctx.ramps[ramp][2], false);
}
export function plume(ctx, H, { ramp = 'accent', len = 16, from = null, dir = 1 } = {}) {
  const x = hx(H), ty = top(H), [px, py] = from || [x + dir * 4, ty];
  const m = ctx.mask();
  for (let i = 0; i < 6; i++) { const t = i / 5; m.capsule(px, py, px + dir * (6 + t * len * 0.5), py - len * (1 - t * 0.35) + t * 3, 2.4 - t * 0.6, 1.2); }
  part(ctx, m, ramp, { bevel: 2 });
}
export function crescent(ctx, H, { ramp = 'gold', dy = 11, r = 9, face = 1 } = {}) {
  const x = hx(H), y = top(H) - dy + 8;
  part(ctx, ctx.mask().ellipse(x, y, r, r).cut(ctx.mask().ellipse(x + face * 4, y - 2, r - 0.5, r - 0.5)), ramp, { bevel: 2 });
}
export function halo(ctx, H, { ramp = 'gold', dy = 6, rx = null, thick = 2 } = {}) {
  const x = hx(H), y = top(H) - dy, R = rx || H.rx + 1;
  part(ctx, ctx.mask().ellipse(x, y, R, 3.4).cut(ctx.mask().ellipse(x, y, R - thick, Math.max(0.8, 3.4 - thick * 0.75))), ramp, { bevel: 1 });
}
export function eyepatch(ctx, H, { ramp = 'cloth', side = 1 } = {}) {
  const fx = hx(H) + H.look[0], fy = Math.round(H.y) + H.look[1], ex = fx + side * 5.5;
  ctx.cv.line(fx - side * 9, fy - 6, ex, fy - 1, (X, Y) => ctx.cv.px(X, Y, ctx.ramps[ramp][2] ?? ctx.ramps[ramp][1]));
  ctx.cv.line(ex, fy - 1, fx + side * 10, fy - 7, (X, Y) => ctx.cv.px(X, Y, ctx.ramps[ramp][2] ?? ctx.ramps[ramp][1]));
  part(ctx, ctx.mask().ellipse(ex, fy + 0.5, 4.4, 3.4), ramp, { bevel: 2 });
}
export function visor(ctx, H, { ramp = 'steel', glow = null, h = 5 } = {}) {
  const fx = hx(H) + H.look[0], fy = Math.round(H.y) + H.look[1];
  part(ctx, ctx.mask().rect(fx - H.rx - 0.6, fy - 3, H.rx * 2 + 1.2, h), ramp, { bevel: 2 });
  if (glow) for (let i = -H.rx + 2; i < H.rx - 1; i++) ctx.cv.px(fx + i, fy - 1, ctx.ramps[glow][0]);
}
// lower-face wrap / mask: from the nose down
export function mask(ctx, H, { ramp = 'cloth', y = 3 } = {}) {
  const fx = hx(H) + H.look[0], fy = Math.round(H.y) + H.look[1];
  part(ctx, ctx.mask().ellipse(fx, fy + 6, H.rx - 0.4, 7).clip(ctx.mask().rect(fx - H.rx, fy + y, H.rx * 2, 14)), ramp, { bevel: 3 });
}
export function band(ctx, H, { ramp = 'accent', y = -4, tails = 0, h = 2.4 } = {}) {
  const x = hx(H), by = Math.round(H.y) + y;
  part(ctx, ctx.mask().rect(x - H.rx - 0.4, by, H.rx * 2 + 0.8, h), ramp, { bevel: 1 });
  if (tails) for (const s of [1, 0.45]) ctx.cv.line(x + H.rx, by + 1, x + H.rx + 5 + tails * s, by + 3 + tails * 0.8 * s, (X, Y) => ctx.cv.px(X, Y, ctx.ramps[ramp][1]));
}
export function beard(ctx, H, { ramp = 'hair', len = 9, w = 0.8 } = {}) {
  const fx = hx(H) + H.look[0], fy = Math.round(H.y) + H.look[1];
  part(ctx, ctx.mask().ellipse(fx, fy + 8, (H.rx - 1.2) * w, len * 0.6).cut(ctx.mask().ellipse(fx, fy + 3, H.rx + 2, 4)).poly([[fx - 6 * w, fy + 9], [fx + 6 * w, fy + 9], [fx, fy + 9 + len]]), ramp, { bevel: 2 });
}

// ---------------------------------------------------------------- back
// shoulders to the floor; hem: 'straight' | 'tatter' | 'scallop'; inner: a second ramp for the lining
export function cape(ctx, { ramp = 'cloth', len = 34, flare = 7, hem = 'straight', inner = null, collar = false } = {}) {
  const { J } = ctx;
  const yb = J.hip[1] + len, a = J.shL, b = J.shR;
  const pts = [[a[0] - 2, a[1] - 3], [b[0] + 2, b[1] - 3], [b[0] + 4 + flare, yb]];
  const n = hem === 'straight' ? 0 : 6;
  for (let i = 1; i <= n; i++) { const t = i / (n + 1); pts.push([b[0] + 4 + flare - t * (b[0] - a[0] + 8 + flare * 2), yb + (hem === 'tatter' ? (i % 2 ? 6 : -1) : (i % 2 ? 3 : -2))]); }
  pts.push([a[0] - 4 - flare, yb]);
  const m = ctx.mask().poly(pts);
  part(ctx, m, inner || ramp, { bevel: 5 });
  if (inner) part(ctx, ctx.mask().poly([[a[0] + 2, a[1]], [b[0] - 2, b[1]], [b[0] + flare, yb - 3], [a[0] - flare, yb - 3]]), ramp, { bevel: 5, shadow: false });
  if (collar) part(ctx, ctx.mask().ellipse(J.neck[0], J.neck[1] + 1, 13, 5), inner || ramp, { bevel: 3 });
}
export function wingsBat(ctx, { ramp = 'cloth', bone = null, span = 34, drop = 14, rise = 6 } = {}) {
  const { J } = ctx;
  for (const [k, s] of SIDES) {
    const r = [J['sh' + k][0] + s * 2, J['sh' + k][1] - 2];
    const tips = [[r[0] + s * span, r[1] - rise - 8], [r[0] + s * span * 0.85, r[1] + drop * 0.5], [r[0] + s * span * 0.5, r[1] + drop + 6], [r[0] + s * 6, r[1] + drop + 14]];
    const m = ctx.mask().poly([r, ...tips]);
    // scalloped trailing edge
    for (let i = 0; i < tips.length - 1; i++) { const q = at(tips[i], tips[i + 1], 0.5); m.ellipse(q[0] - s * 0.5, q[1] + 1.5, 2.5, 2.5, 0); }
    part(ctx, m, ramp, { bevel: 3 });
    const bm = ctx.mask();
    for (const t of tips.slice(0, 3)) bm.capsule(r[0], r[1], t[0], t[1], 1.6, 0.8);
    part(ctx, bm, bone || ramp, { bevel: 1, shadow: false });
  }
}
export function spikes(ctx, { ramp = 'steel', n = 5, len = 12, spread = 1 } = {}) {
  const { J } = ctx;
  const cx = (J.shL[0] + J.shR[0]) / 2, cy = (J.shL[1] + J.shR[1]) / 2 - 2;
  const m = ctx.mask();
  for (let i = 0; i < n; i++) {
    const a = -Math.PI + 0.35 + (i / (n - 1)) * (Math.PI - 0.7) * spread, r0 = 12, r1 = 12 + len * (i % 2 ? 0.8 : 1);
    m.poly([[cx + Math.cos(a - 0.14) * r0, cy + Math.sin(a - 0.14) * r0 * 0.8 - 6], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * 0.9 - 8], [cx + Math.cos(a + 0.14) * r0, cy + Math.sin(a + 0.14) * r0 * 0.8 - 6]]);
  }
  part(ctx, m, ramp, { bevel: 1 });
}
// a glow / sunburst behind the torso or head: rays from (cx, cy)
export function aura(ctx, { ramp = 'glow', cx = null, cy = null, n = 11, len = 24, r0 = 10, arc = Math.PI, spin = -Math.PI } = {}) {
  const { J } = ctx;
  const X = cx ?? J.head[0], Y = cy ?? J.head[1] - 2;
  const m = ctx.mask();
  for (let k = 0; k < n; k++) {
    const a = spin + (k / (n - 1)) * arc, L = k % 2 ? len * 0.72 : len;
    m.poly([[X + Math.cos(a) * r0, Y + Math.sin(a) * r0], [X + Math.cos(a - 0.12) * (r0 + 4), Y + Math.sin(a - 0.12) * (r0 + 4)], [X + Math.cos(a) * L, Y + Math.sin(a) * L], [X + Math.cos(a + 0.12) * (r0 + 4), Y + Math.sin(a + 0.12) * (r0 + 4)]]);
  }
  part(ctx, m, ramp, { bevel: 1 });
}
// half: 'back' (the part above the centre line: draw it on the back layer) | 'front' (below it: on the front layer) | null (all of it)
export function ring(ctx, { ramp = 'gold', cx = null, cy = null, rx = 30, ry = 8, thick = 3, half = null } = {}) {
  const { J } = ctx;
  const X = cx ?? J.chest[0], Y = Math.round(cy ?? J.chest[1] + 4);
  const m = ctx.mask().ellipse(X, Y, rx, ry).cut(ctx.mask().ellipse(X, Y, rx - thick, Math.max(1, ry - thick * 0.7)));
  if (half) m.clip(ctx.mask().rect(X - rx - 2, half === 'back' ? Y - ry - 2 : Y, rx * 2 + 4, ry + 3));
  part(ctx, m, ramp, { bevel: 1 });
}
// scattered pixels over the figure (stars, sparks, flecks): ramp-name colour index 0..2, deterministic
export function speckle(ctx, { color = 'star', n = 24, region = 'torso', seed = 1, only = null } = {}) {
  const { J, D, cv } = ctx, col = typeof color === 'string' ? ctx.c(color) : color;
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const box = region === 'torso' ? [J.chest[0] - D.chestW, J.chest[1] - 6, D.chestW * 2, J.waist[1] - J.chest[1] + 8] : region === 'legs' ? [J.hip[0] - 22, J.hip[1], 44, 40] : [J.hip[0] - 40, J.head[1] - 20, 80, 150];
  for (let i = 0; i < n; i++) {
    const x = Math.round(box[0] + rnd() * box[2]), y = Math.round(box[1] + rnd() * box[3]);
    const i0 = y * cv.w + x;
    if (only === 'filled' ? !cv.filled(x, y) : false) continue;
    if (cv.ramp[i0] || cv.idx[i0] === 0) { if (cv.ramp[i0]) cv.px(x, y, col); }
  }
}
export function medals(ctx, { colors = ['gold', 'accent'], rows = 1, side = 1 } = {}) {
  const { J, cv } = ctx, ch = J.chest;
  for (let r = 0; r < rows; r++) for (let i = 0; i < 4; i++) { const x = Math.round(ch[0] + side * (4 + i * 3)), y = Math.round(ch[1] - 1 + r * 4); cv.px(x, y, ctx.c(colors[(i + r) % colors.length])); cv.px(x, y + 1, ctx.c(colors[(i + r) % colors.length])); }
}
// a scarf at the neck with two tails hanging behind (the tails go on the back layer: pass tails: true there)
export function scarf(ctx, { ramp = 'accent', tails = false, len = 24 } = {}) {
  const { J } = ctx, n = J.neck;
  if (!tails) { part(ctx, ctx.mask().ellipse(n[0], n[1] + 2, 12, 4.2), ramp, { bevel: 2 }); return; }
  for (const [s, off] of [[1, 0], [-1, 3]]) part(ctx, ctx.mask().poly([[n[0] + s * 4, n[1] + 2], [n[0] + s * 10, n[1] + 2], [n[0] + s * (14 + off), n[1] + len], [n[0] + s * (8 + off), n[1] + len - 4]]), ramp, { bevel: 2 });
}
export function flames(ctx, H, { ramp = 'ember', n = 5, h = 12 } = {}) {
  const x = hx(H), ty = top(H) + 2, m = ctx.mask();
  for (let i = 0; i < n; i++) { const cx = x - H.rx + 2 + (i * (H.rx * 2 - 4)) / (n - 1), tall = h * (i % 2 ? 0.72 : 1) * (1 - Math.abs(i - (n - 1) / 2) * 0.1); m.poly([[cx - 3, ty], [cx + (i % 2 ? 1.5 : -1.5), ty - tall], [cx + 3, ty]]); }
  part(ctx, m, ramp, { bevel: 2 });
}
export function wingsFeather(ctx, { ramp = 'cloth', span = 26, spread = 1.4, tip = null, rise = 3, lift = 8 } = {}) {
  const { J } = ctx, ch = J.chest;
  for (const [, s] of SIDES) wing(ctx, [ch[0] + s * 9, ch[1] - lift], s, span, spread, ctx.ramps[ramp], { rise, tip: tip ? ctx.c(tip) : null });
}
export function tail(ctx, { ramp = 'cloth', len = 30, side = 1, wave = 4 } = {}) {
  const { J } = ctx, w = J.hip;
  const m = ctx.mask();
  let px = w[0] + side * 6, py = w[1] + 2;
  for (let i = 0; i < 6; i++) { const nx = px + side * 3 + (i % 2 ? wave : -wave) * 0.5, ny = py + len / 6; m.capsule(px, py, nx, ny, 3.2 - i * 0.35, 3.2 - (i + 1) * 0.35); px = nx; py = ny; }
  part(ctx, m, ramp, { bevel: 2 });
}

// ---------------------------------------------------------------- torso
// style: 'round' | 'spiked' | 'plate' | 'fan' | 'fur' | 'flame'
export function pauldrons(ctx, { ramp = 'steel', style = 'round', size = 1.5, tip = null } = {}) {
  const { J, D } = ctx;
  for (const [k, s] of SIDES) {
    const sh = J['sh' + k], r = D.deltoid + size;
    if (style === 'round' || style === 'plate') {
      part(ctx, ctx.mask().ellipse(sh[0] + s * 1.5, sh[1] - 1, r + 1, r - 0.6), ramp, { bevel: 4 });
      if (style === 'plate') for (let i = 1; i <= 2; i++) part(ctx, ctx.mask().ellipse(sh[0] + s * (1.5 + i * 1.2), sh[1] + i * 2.2, r - i, r * 0.6 - i * 0.2).clip(ctx.mask().rect(sh[0] - 30, sh[1] - 3, 60, 40)), ramp, { bevel: 2, bias: -0.1 });
    } else if (style === 'spiked') {
      part(ctx, ctx.mask().ellipse(sh[0] + s * 1.5, sh[1] - 1, r + 1, r - 0.6), ramp, { bevel: 4 });
      for (let i = 0; i < 3; i++) part(ctx, ctx.mask().poly([[sh[0] + s * (2 + i * 4) - 2, sh[1] - r + 1], [sh[0] + s * (3 + i * 4.5), sh[1] - r - 8 + i * 1.5], [sh[0] + s * (2 + i * 4) + 2, sh[1] - r + 1]]), tip || ramp, { bevel: 1 });
    } else if (style === 'fan') {
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + s * (0.25 + i * 0.38); part(ctx, ctx.mask().capsule(sh[0], sh[1] - 1, sh[0] + Math.cos(a) * (r + 6), sh[1] - 1 + Math.sin(a) * (r + 5), 3.2, 2), ramp, { bevel: 2 }); }
    } else if (style === 'fur') {
      for (let i = -2; i <= 2; i++) part(ctx, ctx.mask().ellipse(sh[0] + s * 1.5 + i * 2.6, sh[1] - 1 - Math.abs(i) * 0.6, 3.6, 3.8), ramp, { bevel: 2 });
    } else if (style === 'flame') {
      for (let i = 0; i < 4; i++) part(ctx, ctx.mask().poly([[sh[0] + s * (i * 3.6 - 3) - 2.4, sh[1] - 2], [sh[0] + s * (i * 3.4 - 2) + (i % 2 ? 1 : -1), sh[1] - r - 9 + (i % 2) * 4], [sh[0] + s * (i * 3.6 - 3) + 2.4, sh[1] - 2]]), ramp, { bevel: 1 });
    }
  }
}
// a diagonal sash from one shoulder to the opposite hip; knot at the end
export function sash(ctx, { ramp = 'accent', dir = 1, wide = 2.6, knot = true, tail = 7 } = {}) {
  const { J, D, torsoMask } = ctx;
  const a = dir > 0 ? J.shL : J.shR, w = J.waist, ex = w[0] + (dir > 0 ? 1 : -1) * (D.waistW - 3), ey = w[1] - 1;
  const m = ctx.mask().capsule(a[0] + (dir > 0 ? 2 : -2), a[1] + 1, ex, ey, wide, wide);
  part(ctx, torsoMask ? m.clip(torsoMask) : m, ramp, { bevel: 2 });
  if (knot) {
    part(ctx, ctx.mask().ellipse(ex, ey, wide + 1, wide + 0.6), ramp, { bevel: 2 });
    if (tail) part(ctx, ctx.mask().poly([[ex - 2, ey + 1], [ex + 2, ey + 1], [ex + (dir > 0 ? 4 : -4), ey + tail + 1], [ex, ey + tail - 1]]), ramp, { bevel: 1 });
  }
}
export function bandolier(ctx, { ramp = 'leather', dir = 1, studs = 'metal', n = 5 } = {}) {
  const { J, D, torsoMask } = ctx;
  const a = dir > 0 ? J.shR : J.shL, w = J.waist, ex = w[0] - (dir > 0 ? 1 : -1) * (D.waistW - 3), ey = w[1] - 2;
  const m = ctx.mask().capsule(a[0] - (dir > 0 ? 2 : -2), a[1] + 1, ex, ey, 2.2, 2.2);
  part(ctx, torsoMask ? m.clip(torsoMask) : m, ramp, { bevel: 2 });
  if (studs) for (let i = 1; i <= n; i++) { const p = at([a[0], a[1] + 1], [ex, ey], i / (n + 1)); ctx.cv.px(p[0], p[1], ctx.ramps[studs][1]); ctx.cv.px(p[0] - 1, p[1] - 1, ctx.ramps[studs][0]); }
}
export function plate(ctx, { ramp = 'steel', trim = null, emblemRamp = null, shape = 'round', waist = true } = {}) {
  const { J, D, torsoMask } = ctx;
  const n = J.neck, w = J.waist, ch = J.chest;
  const m = ctx.mask().poly([[n[0] - 11, n[1] + 2], [n[0] + 11, n[1] + 2], [ch[0] + D.chestW - 1, ch[1] + 1], [w[0] + D.waistW - 2, w[1] - 3], [w[0] - D.waistW + 2, w[1] - 3], [ch[0] - D.chestW + 1, ch[1] + 1]]);
  if (shape === 'v') m.cut(ctx.mask().poly([[n[0] - 3, n[1] + 1], [n[0] + 3, n[1] + 1], [ch[0], ch[1] - 3]]));
  part(ctx, torsoMask ? m.clip(torsoMask) : m, ramp, { bevel: 6 });
  for (const s of [-1, 1]) ctx.cv.line(ch[0] + s * 3, ch[1] - 4, ch[0] + s * 14, ch[1] + 3, (X, Y) => ctx.cv.shade(X, Y, 1));
  ctx.cv.line(ch[0], ch[1] + 1, w[0], w[1] - 4, (X, Y) => ctx.cv.shade(X, Y, 1));
  if (trim) { ctx.cv.line(n[0] - 11, n[1] + 2, n[0] + 11, n[1] + 2, (X, Y) => ctx.cv.px(X, Y, ctx.ramps[trim][1])); if (waist) ctx.cv.line(w[0] - D.waistW + 2, w[1] - 3, w[0] + D.waistW - 2, w[1] - 3, (X, Y) => ctx.cv.px(X, Y, ctx.ramps[trim][1])); }
  if (emblemRamp) emblem(ctx, Math.round(ch[0]), Math.round(ch[1] + 2), 'diamond', emblemRamp, 1);
}
// a ruff / mantle collar around the neck
export function collar(ctx, { ramp = 'cloth', style = 'ruff', size = 1 } = {}) {
  const { J } = ctx, n = J.neck;
  if (style === 'ruff') for (let i = -3; i <= 3; i++) part(ctx, ctx.mask().ellipse(n[0] + i * 3.2, n[1] + 2 - Math.abs(i) * 0.5, 3.2 * size, 3.6 * size), ramp, { bevel: 2 });
  else if (style === 'high') { for (const s of [-1, 1]) part(ctx, ctx.mask().poly([[n[0] + s * 4, n[1] + 3], [n[0] + s * 13 * size, n[1] - 2], [n[0] + s * 12 * size, n[1] - 12], [n[0] + s * 6, n[1] - 2]]), ramp, { bevel: 2 }); }
  else if (style === 'fur') for (let i = -4; i <= 4; i++) part(ctx, ctx.mask().ellipse(n[0] + i * 3, n[1] + 3 - Math.abs(i) * 0.4, 3.4, 3.8), ramp, { bevel: 2 });
}
// hanging cloth strips from the belt over the trunks; kind 'tabard' (one panel) | 'strips' | 'skirt'
export function skirt(ctx, { ramp = 'cloth', kind = 'strips', len = 14, n = 5 } = {}) {
  const { J, D, shortsMask } = ctx, w = J.waist, by = Math.round(w[1]);
  const half = D.waistW + 2;
  if (kind === 'tabard') {
    part(ctx, ctx.mask().poly([[w[0] - 6, by], [w[0] + 6, by], [w[0] + 5, by + len], [w[0], by + len - 4], [w[0] - 5, by + len]]), ramp, { bevel: 3 });
    return;
  }
  const m = ctx.mask();
  for (let i = 0; i < n; i++) {
    const x0 = w[0] - half + (i * (half * 2)) / n, x1 = x0 + (half * 2) / n - 0.6, L = len - (i % 2) * 3;
    m.poly([[x0, by], [x1, by], [x1 + (i - (n - 1) / 2) * 0.6, by + L], [x0 + (i - (n - 1) / 2) * 0.6, by + L]]);
  }
  void shortsMask;
  part(ctx, m, ramp, { bevel: 2 });
}
export function apron(ctx, { ramp = 'cloth', len = 28, top = true, taper = 5, pocket = null } = {}) {
  const { J, D } = ctx, ch = J.chest, w = J.waist, by = Math.round(w[1]);
  const m = ctx.mask().poly([[w[0] - D.waistW + 1, by], [w[0] + D.waistW - 1, by], [w[0] + D.waistW - taper, by + len], [w[0] + D.waistW - taper - 2, by + len + 2], [w[0] - D.waistW + taper + 2, by + len + 2], [w[0] - D.waistW + taper, by + len]]);
  if (top) m.poly([[ch[0] - 8, ch[1] - 1], [ch[0] + 8, ch[1] - 1], [w[0] + D.waistW, by], [w[0] - D.waistW, by]]);
  part(ctx, m, ramp, { bevel: 4 });
  if (pocket) part(ctx, ctx.mask().rect(w[0] - 6, by + 7, 12, 8), pocket, { bevel: 1 });
}
export function straps(ctx, { ramp = 'leather', buckle = 'metal', cross = true } = {}) {
  const { J, D, torsoMask } = ctx, n = J.neck, w = J.waist;
  for (const s of cross ? [-1, 1] : [1]) { const m = ctx.mask().capsule(n[0] + s * 8, n[1] + 2, w[0] - s * 8, w[1] - 2, 1.8, 1.8); part(ctx, torsoMask ? m.clip(torsoMask) : m, ramp, { bevel: 1, shadow: false }); }
  if (buckle) part(ctx, ctx.mask().ellipse(J.chest[0], J.chest[1] + 3, 2.6, 2.6), buckle, { bevel: 2 });
  void D;
}
const EMB = {
  star: (ctx, x, y, s) => { const m = ctx.mask(); const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = (i % 2 ? 2.4 : 6) * s; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } return m.poly(pts); },
  diamond: (ctx, x, y, s) => ctx.mask().poly([[x, y - 6 * s], [x + 4 * s, y], [x, y + 6 * s], [x - 4 * s, y]]),
  ring: (ctx, x, y, s) => ctx.mask().ellipse(x, y, 5.5 * s, 5.5 * s).cut(ctx.mask().ellipse(x, y, 3 * s, 3 * s)),
  disc: (ctx, x, y, s) => ctx.mask().ellipse(x, y, 5 * s, 5 * s),
  cross: (ctx, x, y, s) => ctx.mask().rect(x - 1.4 * s, y - 6 * s, 2.8 * s, 12 * s).rect(x - 5 * s, y - 1.6 * s, 10 * s, 3.2 * s),
  bolt: (ctx, x, y, s) => ctx.mask().poly([[x + 2 * s, y - 7 * s], [x - 4 * s, y + 1 * s], [x - 0.5 * s, y + 1 * s], [x - 2 * s, y + 7 * s], [x + 4 * s, y - 1.5 * s], [x + 0.5 * s, y - 1.5 * s]]),
  skull: (ctx, x, y, s) => ctx.mask().ellipse(x, y - 1.5 * s, 4.6 * s, 4.2 * s).rect(x - 2.6 * s, y + 1 * s, 5.2 * s, 3.6 * s),
  moon: (ctx, x, y, s) => ctx.mask().ellipse(x, y, 5.5 * s, 5.5 * s).cut(ctx.mask().ellipse(x + 3 * s, y - 1 * s, 4.8 * s, 4.8 * s)),
  sun: (ctx, x, y, s) => { const m = ctx.mask().ellipse(x, y, 3.4 * s, 3.4 * s); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; m.poly([[x + Math.cos(a - 0.3) * 4 * s, y + Math.sin(a - 0.3) * 4 * s], [x + Math.cos(a) * 7 * s, y + Math.sin(a) * 7 * s], [x + Math.cos(a + 0.3) * 4 * s, y + Math.sin(a + 0.3) * 4 * s]]); } return m; },
  flame: (ctx, x, y, s) => ctx.mask().poly([[x, y - 8 * s], [x + 4 * s, y - 1 * s], [x + 3 * s, y + 5 * s], [x, y + 6 * s], [x - 3 * s, y + 5 * s], [x - 4 * s, y - 1 * s], [x - 1.5 * s, y - 3 * s]]),
  eye: (ctx, x, y, s) => ctx.mask().ellipse(x, y, 6 * s, 3 * s),
  heart: (ctx, x, y, s) => ctx.mask().ellipse(x - 2.4 * s, y - 1.6 * s, 2.8 * s, 2.8 * s).ellipse(x + 2.4 * s, y - 1.6 * s, 2.8 * s, 2.8 * s).poly([[x - 5 * s, y - 0.4 * s], [x + 5 * s, y - 0.4 * s], [x, y + 5.5 * s]]),
  tri: (ctx, x, y, s) => ctx.mask().poly([[x, y - 6 * s], [x + 6 * s, y + 4 * s], [x - 6 * s, y + 4 * s]]),
};
export function emblem(ctx, x, y, shape = 'star', ramp = 'gold', size = 1) {
  part(ctx, EMB[shape](ctx, x, y, size), ramp, { bevel: 2 });
}
export function ribs(ctx, { ramp = 'bone', n = 4 } = {}) {
  const { J, D, torsoMask } = ctx, ch = J.chest, w = J.waist;
  part(ctx, ctx.mask().rect(ch[0] - 1, ch[1] - 3, 2.4, w[1] - ch[1] + 1), ramp, { bevel: 1, shadow: false });
  for (let i = 0; i < n; i++) {
    const y = ch[1] - 1 + i * 3.6, ww = D.chestW - 3 - i * 0.9;
    const m = ctx.mask().capsule(ch[0] - ww, y + 2, ch[0], y, 1.1, 1.1).capsule(ch[0], y, ch[0] + ww, y + 2, 1.1, 1.1);
    part(ctx, torsoMask ? m.clip(torsoMask) : m, ramp, { bevel: 1, shadow: false });
  }
}
export function studs(ctx, { ramp = 'metal', pts = [] } = {}) { for (const [x, y] of pts) { ctx.cv.px(x, y, ctx.ramps[ramp][1]); ctx.cv.px(x - 1, y - 1, ctx.ramps[ramp][0]); } }
export function belt(ctx, { ramp = 'leather', buckle = 'metal', wide = 4, shape = 'square' } = {}) {
  const { J, D, shortsMask, torsoMask } = ctx, w = J.waist, by = Math.round(w[1] - 1);
  const m = ctx.mask().rect(w[0] - D.waistW - 1, by - 2, D.waistW * 2 + 2, wide);
  const lim = ctx.mask(); if (shortsMask) lim.add(shortsMask); if (torsoMask) lim.add(torsoMask);
  part(ctx, shortsMask || torsoMask ? m.clip(lim) : m, ramp, { bevel: 1 });
  if (buckle) part(ctx, shape === 'round' ? ctx.mask().ellipse(w[0], by, 3.6, 3.2) : ctx.mask().rect(w[0] - 4, by - 2.4, 8, wide + 1.6), buckle, { bevel: 2 });
}

// ---------------------------------------------------------------- front (over the arms)
export function bracers(ctx, { ramp = 'steel', from = 0.3, to = 0.7, wide = 1.6, spike = false } = {}) {
  const { J, D } = ctx;
  for (const [k] of SIDES) {
    const e = J['el' + k], f = J['fi' + k], a = at(e, f, from), b = at(e, f, to);
    part(ctx, ctx.mask().capsule(a[0], a[1], b[0], b[1], D.forearm[0] + wide, D.forearm[1] + wide), ramp, { bevel: 2 });
    if (spike) { const m = at(a, b, 0.5); ctx.cv.px(m[0], m[1], ctx.ramps[ramp][0]); }
  }
}
export function greaves(ctx, { ramp = 'steel', from = 0.12, to = 0.75, knee = true } = {}) {
  const { J, D } = ctx;
  for (const [k] of SIDES) {
    const kn = J['kn' + k], ft = J['ft' + k], ank = [ft[0], ft[1] - D.ankle], a = at(kn, ank, from), b = at(kn, ank, to);
    part(ctx, ctx.mask().capsule(a[0], a[1], b[0], b[1], D.shin[0] + 1.2, D.shin[1] + 1.2), ramp, { bevel: 3 });
    if (knee) part(ctx, ctx.mask().ellipse(kn[0], kn[1], D.shin[0] + 2, D.shin[0] + 1.6), ramp, { bevel: 3 });
  }
}
export function rings(ctx, { ramp = 'gold', where = 0.42 } = {}) {
  const { J, D } = ctx;
  for (const [k] of SIDES) { const p = at(J['el' + k], J['fi' + k], where); part(ctx, ctx.mask().ellipse(p[0], p[1], D.forearm[0] + 1.4, 1.8), ramp, { bevel: 1 }); }
}
// studs / spikes along the knuckles of a glove
export function spikesGlove(ctx, { ramp = 'steel', n = 3 } = {}) {
  const { J } = ctx;
  for (const [k, s] of SIDES) { const f = J['fi' + k]; for (let i = 0; i < n; i++) ctx.cv.px(f[0] - s * 1 + (i - 1) * 3, f[1] - 9 - (i === 1 ? 1 : 0), ctx.ramps[ramp][0]); }
}
// legwear: a skirt-length boot cuff / fur on the boots
export function bootCuffs(ctx, { ramp = 'fur', rise = 6 } = {}) {
  const { J, D } = ctx;
  for (const [k] of SIDES) { const ft = J['ft' + k]; part(ctx, ctx.mask().ellipse(ft[0], ft[1] - D.ankle - 1, D.shin[0] + 2.2, rise * 0.5), ramp, { bevel: 2 }); }
}

// ---------------------------------------------------------------- more pieces (the Void's)
// a big shield held in front of a forearm: kind 'tower' (tall, flat bottom) | 'round'; emblem: [shape, ramp] drawn on its face
export function shield(ctx, { ramp = 'steel', side = 'L', kind = 'tower', w = 15, h = 34, rim = null, emblemShape = null, emblemRamp = null } = {}) {
  const { J } = ctx, e = J['el' + side], f = J['fi' + side], cx = (e[0] + f[0]) / 2 + (side === 'L' ? -3 : 3), cy = (e[1] + f[1]) / 2 - 2;
  const m = kind === 'round' ? ctx.mask().ellipse(cx, cy, w * 0.62, w * 0.62) : ctx.mask().rect(cx - w / 2, cy - h / 2, w, h * 0.72).poly([[cx - w / 2, cy - h / 2 + h * 0.72 - 1], [cx + w / 2, cy - h / 2 + h * 0.72 - 1], [cx, cy + h / 2]]).ellipse(cx, cy - h / 2 + 2, w / 2, 4);
  part(ctx, m, ramp, { bevel: 4 });
  ctx.cv.line(cx, cy - h / 2 + 3, cx, cy + h / 2 - 4, (X, Y) => ctx.cv.shade(X, Y, 1));
  if (emblemShape) emblem(ctx, Math.round(cx), Math.round(cy - 2), emblemShape, emblemRamp || ramp, 1.1);
}
// a jester's cap: three drooping horns with a bell on each tip
export function jester(ctx, H, { ramps = ['cloth', 'cloth', 'cloth'], bell = 'gold', droop = 1 } = {}) {
  const x = hx(H), ty = top(H) + 3;
  part(ctx, ctx.mask().rect(x - H.rx, ty - 1, H.rx * 2, 3), ramps[1], { bevel: 1 });
  [[-1, ramps[0]], [0, ramps[1]], [1, ramps[2]]].forEach(([d, r]) => {
    const tx = x + d * (H.rx + 9 * droop), ty2 = ty - (d === 0 ? 14 : 4 + 4 * droop) + (d === 0 ? 0 : 8 * droop);
    const m = ctx.mask().capsule(x + d * 4, ty, x + d * (H.rx + 3), ty - (d === 0 ? 10 : 9), 3.4, 2).capsule(x + d * (H.rx + 3), ty - (d === 0 ? 10 : 9), tx, ty2, 2, 1.2);
    part(ctx, m, r, { bevel: 2 });
    part(ctx, ctx.mask().ellipse(tx, ty2 + 1.6, 1.9, 1.9), bell, { bevel: 1, shadow: false });
  });
}
// a tall pointed mitre with an emblem
export function mitre(ctx, H, { ramp = 'cloth', trim = null, h = 16, emblemShape = null, emblemRamp = null } = {}) {
  const x = hx(H), ty = top(H) + 3;
  part(ctx, ctx.mask().poly([[x - H.rx - 0.5, ty + 1], [x + H.rx + 0.5, ty + 1], [x + 3, ty - h], [x - 3, ty - h]]), ramp, { bevel: 3 });
  if (trim) part(ctx, ctx.mask().rect(x - H.rx - 0.5, ty - 1, H.rx * 2 + 1, 3), trim, { bevel: 1 });
  if (emblemShape) emblem(ctx, x, ty - h * 0.45, emblemShape, emblemRamp || trim || ramp, 0.55);
}
// a drum strapped to the hip, seen from the side: a barrel with two heads and hoops
export function drum(ctx, { ramp = 'cloth', rim = 'gold', side = 1, y = 4 } = {}) {
  const { J } = ctx, w = J.waist, cx = w[0] + side * 17, cy = w[1] + y;
  part(ctx, ctx.mask().rect(cx - 6, cy - 6, 12, 12), ramp, { bevel: 3 });
  part(ctx, ctx.mask().ellipse(cx, cy - 6, 6, 2.2), rim, { bevel: 1 });
  part(ctx, ctx.mask().ellipse(cx, cy + 6, 6, 2.2), rim, { bevel: 1 });
  for (let i = -4; i <= 4; i += 4) ctx.cv.line(cx + i, cy - 5, cx + i + 2, cy + 5, (X, Y) => ctx.cv.shade(X, Y, 1));
}
// a clock face behind the head: a ring with twelve ticks and two hands
export function clockFace(ctx, { ramp = 'gold', face = null, r = 20, hands = 'hand' } = {}) {
  const { J } = ctx, [X, Y] = J.head;
  if (face) part(ctx, ctx.mask().ellipse(X, Y - 2, r - 1, r - 1), face, { bevel: 6, shadow: false });
  part(ctx, ctx.mask().ellipse(X, Y - 2, r, r).cut(ctx.mask().ellipse(X, Y - 2, r - 2.4, r - 2.4)), ramp, { bevel: 1 });
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; ctx.cv.px(X + Math.cos(a) * (r + 2), Y - 2 + Math.sin(a) * (r + 2), ctx.ramps[ramp][k % 3 === 0 ? 0 : 1]); }
  ctx.cv.line(X, Y - 2, X + 4, Y - 14, (A, B) => ctx.cv.px(A, B, ctx.ramps[hands][1]));
  ctx.cv.line(X, Y - 2, X + 9, Y + 2, (A, B) => ctx.cv.px(A, B, ctx.ramps[hands][0]));
}
// a row of dangling chain links from each wrist
export function chains(ctx, { ramp = 'steel', len = 5 } = {}) {
  const { J } = ctx;
  for (const [k] of SIDES) { const f = J['fi' + k]; for (let i = 0; i < len; i++) part(ctx, ctx.mask().ellipse(f[0] + (i % 2 ? 1 : -1), f[1] + 6 + i * 3, i % 2 ? 1.3 : 2, i % 2 ? 2 : 1.3), ramp, { bevel: 1, shadow: false }); }
}
// feathered ankle wings
export function ankleWings(ctx, { ramp = 'cloth', n = 3, len = 8 } = {}) {
  const { J, D } = ctx;
  for (const [k, s] of SIDES) { const ft = J['ft' + k], y = ft[1] - D.ankle - 1; const m = ctx.mask(); for (let i = 0; i < n; i++) m.poly([[ft[0] + s * 2, y - i * 2.4], [ft[0] + s * (6 + len), y - 4 - i * 3.4 + 1], [ft[0] + s * 2, y - 2.4 - i * 2.4]]); part(ctx, m, ramp, { bevel: 1 }); }
}

// tall pipes standing up behind the shoulders, with puffs of smoke on top
export function pipes(ctx, { ramp = 'steel', smoke = null, h = 24, w = 5, spread = 8 } = {}) {
  const { J } = ctx;
  for (const [k, s] of SIDES) {
    const sh = J['sh' + k], x = sh[0] + s * spread, y = sh[1] - 2;
    part(ctx, ctx.mask().rect(x - w / 2, y - h, w, h), ramp, { bevel: 2 });
    part(ctx, ctx.mask().rect(x - w / 2 - 1, y - h - 1, w + 2, 3), ramp, { bevel: 1 });
    if (smoke) for (let i = 0; i < 3; i++) part(ctx, ctx.mask().ellipse(x + s * (i % 2) * 2, y - h - 5 - i * 5, 3.6 - i * 0.4, 3.2), smoke, { bevel: 2 });
  }
}
// a big rectangular pack / scroll / tank standing up behind the back
export function pack(ctx, { ramp = 'steel', w = 18, h = 38, top = 14, round = false } = {}) {
  const { J } = ctx, cx = (J.shL[0] + J.shR[0]) / 2, y = J.neck[1] - top;
  part(ctx, round ? ctx.mask().ellipse(cx, y + h / 2, w / 2, h / 2) : ctx.mask().rect(cx - w / 2, y, w, h), ramp, { bevel: 4 });
}
