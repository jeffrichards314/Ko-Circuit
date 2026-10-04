// The Hollowed's sprite rig (Phase E, spec §18 A6): ZERO's twelve shards. Every one of them is a person the Void emptied out and put
// to work: a pale figure the colour of bone and bleached paper on the black of their arena, in the tatters of whatever they wore, with a
// HOLLOW where the thing that made them who they were used to be (a hole cut through the chest, its rim burning in that shard's own
// colour) and no face to speak of: a slit, a visor, a single eye, two empty sockets, or nothing at all. The chest emblem is what the
// person carried (a runner's chevrons, a guard's shield, a metronome), and it is the last thing they remember.
//
// hollow(id, {
//   build, body,                 the build and his body block (as the rig's)
//   tint, tintHi, tintDk         the shard's colour: the rim of the hollow, the eyes, the trim lines
//   tone: [r,g,b]                the skin's mid tone (default a cold white)
//   top: { style, ... }, belt, stripe, hair, head: { jaw, ears }
//   face: 'slit' | 'visor' | 'cyclops' | 'blank' | 'holes' | 'crack' | fn(ctx, H, o)
//   gear(ctx, H, o)              extra head gear (drawn after the face)
//   emblem: 'chevrons' | ... | fn(ctx, cx, cy, ring)   the hollow on the chest
//   back, front, torso, poses    as the rig's
// }) -> { layers, palettes }   palettes: id (the fighter's own) and `${id}.hurt` etc. if `swaps` is given
import { rig } from '../pantheon/_rig.js';
import { skull, ears } from '../_face.js';

const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const ramp4 = ([r, g, b]) => [[lerp(r, 31, 0.55), lerp(g, 31, 0.55), lerp(b, 31, 0.55)], [r, g, b], [Math.round(r * 0.62), Math.round(g * 0.64), Math.round(b * 0.74)], [Math.round(r * 0.3), Math.round(g * 0.3), Math.round(b * 0.42)]];

export const BONE = [25, 26, 29];
export const HOLE = [1, 1, 3];

// --- the hollows -----------------------------------------------------------------------------
// A shape is a function (ctx, cx, cy, inset) -> Mask. The hollow is the shape filled black, ringed in the tint (a 1px rim, brighter on its upper left).
function hole(ctx, cx, cy, shape, { fill = null } = {}) {
  const { cv, c } = ctx;
  const outer = shape(ctx, cx, cy, 0), inner = shape(ctx, cx, cy, 1.3);
  // the rim: the outer shape minus the inner one
  const rim = outer.copy().cut(inner);
  cv.flat(inner.empty() ? outer : inner, c(fill || 'hole'), false);
  cv.flat(rim, c('tint'), false);
  // the rim's lit edge (upper left), a glint
  for (let y = -12; y <= 12; y++) for (let x = -12; x <= 12; x++) if (rim.in(cx + x, cy + y) && (x + y < -6) && ((x + y) & 1) === 0) cv.px(cx + x, cy + y, c('tintHi'));
  return { outer, inner, rim };
}
const S = {
  chevrons: (ctx, cx, cy, d) => ctx.mask().poly([[cx - 8 + d, cy - 6 + d], [cx - 3 - d * 0.5, cy], [cx - 8 + d, cy + 6 - d], [cx - 5 + d, cy + 6 - d], [cx + 0 - d, cy], [cx - 5 + d, cy - 6 + d]]).poly([[cx + 1 + d, cy - 6 + d], [cx + 6 - d * 0.5, cy], [cx + 1 + d, cy + 6 - d], [cx + 4 + d, cy + 6 - d], [cx + 9 - d, cy], [cx + 4 + d, cy - 6 + d]]),
  square: (ctx, cx, cy, d) => ctx.mask().rect(cx - 7 + d, cy - 7 + d, 14 - d * 2, 14 - d * 2),
  bar: (ctx, cx, cy, d) => ctx.mask().rect(cx - 10 + d, cy - 3 + d, 20 - d * 2, 6 - d * 2),
  diamond: (ctx, cx, cy, d) => ctx.mask().poly([[cx, cy - 9 + d], [cx + 7 - d, cy], [cx, cy + 9 - d], [cx - 7 + d, cy]]),
  eye: (ctx, cx, cy, d) => ctx.mask().ellipse(cx, cy, 9 - d, 5 - d * 0.7),
  ear: (ctx, cx, cy, d) => ctx.mask().ellipse(cx, cy, 6 - d, 9 - d),
  metronome: (ctx, cx, cy, d) => ctx.mask().poly([[cx - 3 + d * 0.4, cy - 9 + d], [cx + 3 - d * 0.4, cy - 9 + d], [cx + 8 - d, cy + 8 - d], [cx - 8 + d, cy + 8 - d]]),
  ring: (ctx, cx, cy, d) => ctx.mask().ellipse(cx, cy, 8 - d, 8 - d),
  jag: (ctx, cx, cy, d) => ctx.mask().poly([[cx - 8 + d, cy - 8 + d], [cx + 1, cy - 4], [cx - 3, cy - 1], [cx + 8 - d, cy + 8 - d], [cx - 1, cy + 3], [cx + 3 - d, cy + 0], [cx - 8 + d, cy - 8 + d]]),
  heart: (ctx, cx, cy, d) => ctx.mask().ellipse(cx - 4, cy - 3, 4.6 - d, 4.6 - d).ellipse(cx + 4, cy - 3, 4.6 - d, 4.6 - d).poly([[cx - 8.4 + d, cy - 1], [cx + 8.4 - d, cy - 1], [cx, cy + 9 - d]]),
  person: (ctx, cx, cy, d) => ctx.mask().ellipse(cx, cy - 6, 3.4 - d * 0.6, 3.4 - d * 0.6).poly([[cx - 6 + d, cy + 8 - d], [cx - 4 + d, cy - 2 + d], [cx + 4 - d, cy - 2 + d], [cx + 6 - d, cy + 8 - d]]),
  crescent: (ctx, cx, cy, d) => ctx.mask().ellipse(cx, cy, 8 - d, 8 - d).cut(ctx.mask().ellipse(cx + 4, cy - 1, 7, 7)),
  grid: (ctx, cx, cy, d) => ctx.mask().rect(cx - 9 + d, cy - 8 + d, 18 - d * 2, 16 - d * 2),
};
// what is inside a hollow: the last thing the person remembers (drawn in the tint)
const INSIDE = {
  chevrons: () => {},
  metronome(ctx, cx, cy) { const { cv, c } = ctx; cv.line(cx, cy + 6, cx + 2, cy - 5, (X, Y) => cv.px(X, Y, c('tintHi'))); cv.px(cx + 1, cy - 1, c('tint')); cv.px(cx + 2, cy - 1, c('tint')); },
  eye(ctx, cx, cy) { const { cv, c } = ctx; cv.flat(ctx.mask().ellipse(cx, cy, 2.6, 2.6), c('tint'), false); cv.px(cx - 1, cy - 1, c('white')); cv.px(cx, cy, c('outline')); },
  ear(ctx, cx, cy) { const { cv, c } = ctx; for (const [rx, ry] of [[2, 3], [4, 6]]) for (let a = 0; a < 20; a++) { const t = (a / 20) * Math.PI * 1.5 + 0.3; cv.px(Math.round(cx + Math.cos(t) * rx), Math.round(cy + Math.sin(t) * ry), c('tintHi')); } },
  ring(ctx, cx, cy) { const { cv, c } = ctx; cv.line(cx, cy, cx, cy - 5, (X, Y) => cv.px(X, Y, c('tintHi'))); cv.line(cx, cy, cx + 4, cy + 1, (X, Y) => cv.px(X, Y, c('tint'))); cv.px(cx, cy, c('white')); },
  grid(ctx, cx, cy) { const { cv, c } = ctx; for (let j = -5; j <= 5; j += 2) for (let i = -6; i <= 6; i += 2) if (((i + j + 20) >> 1) % 3 !== 0) cv.px(cx + i, cy + j, c(((i * 3 + j) & 7) === 0 ? 'tintHi' : 'tint')); },
  person(ctx, cx, cy) {},
  heart(ctx, cx, cy) { const { cv, c } = ctx; cv.px(cx - 1, cy - 2, c('tintHi')); cv.px(cx - 2, cy - 3, c('tintHi')); cv.px(cx, cy + 1, c('tint')); cv.px(cx + 1, cy - 1, c('tint')); },
  jag() {}, diamond() {}, square() {}, bar() {}, crescent() {},
};

// --- faces -----------------------------------------------------------------------------------
const FACES = {
  // ZERO's own: one thin line where the eyes should be (broken when hurt, out when out)
  slit(ctx, H, o) {
    const { cv, c } = ctx;
    if (o.face === 'ko') return;
    const hurt = ['hurt', 'dazed'].includes(o.face);
    for (let i = -6; i <= 6; i++) { if (hurt && (i === -1 || i === 2 || i === 3)) continue; cv.px(o.fx + i, o.fy + (hurt && i > 2 ? 1 : 0), c(Math.abs(i) > 4 ? 'tint' : 'white')); }
  },
  // a band of dark with a light behind it
  visor(ctx, H, o) {
    const { cv, c } = ctx;
    cv.flat(ctx.mask().rect(o.fx - 9, o.fy - 3, 19, 6), c('hole'), true);
    if (o.face === 'ko') return;
    const half = ['hurt', 'dazed'].includes(o.face);
    for (let i = -7; i <= 7; i++) { if (half && i % 3 === 0) continue; cv.px(o.fx + i, o.fy - 1, c(Math.abs(i) < 3 ? 'tintHi' : 'tint')); cv.px(o.fx + i, o.fy, c('tint')); }
  },
  // one great eye
  cyclops(ctx, H, o) {
    const { cv, c } = ctx;
    const open = o.face !== 'ko' && !['hurt'].includes(o.face);
    cv.flat(ctx.mask().ellipse(o.fx, o.fy, 8, open ? 5.4 : 2), c('hole'), true);
    if (!open) { for (let i = -6; i <= 6; i++) cv.px(o.fx + i, o.fy, c('tint')); return; }
    cv.flat(ctx.mask().ellipse(o.fx, o.fy, 6.2, 3.8), c('white'), false);
    cv.flat(ctx.mask().ellipse(o.fx + Math.round(H.look[0] * 0.5), o.fy, 3, 3), c('tint'), false);
    cv.px(o.fx + Math.round(H.look[0] * 0.5), o.fy, c('outline')); cv.px(o.fx - 1, o.fy - 1, c('tintHi'));
  },
  // smooth; only a faint seam
  blank(ctx, H, o) { const { cv, c } = ctx; for (let j = -8; j <= 4; j += 2) cv.px(o.fx, o.fy + j, c('tint')); if (o.face === 'ko') cv.px(o.fx + 1, o.fy + 1, c('hole')); },
  // two empty sockets with a pin of light
  holes(ctx, H, o) {
    const { cv, c } = ctx;
    for (const s of [-1, 1]) { cv.flat(ctx.mask().ellipse(o.fx + s * 4.6, o.fy, 3, o.face === 'ko' ? 1.4 : 3.2), c('hole'), true); if (o.face !== 'ko') cv.px(o.fx + s * 4.6 + (H.look[0] > 0 ? 1 : 0), o.fy, c(['hurt', 'dazed'].includes(o.face) ? 'tintDk' : 'tintHi')); }
  },
  // a lightning crack down one side, glowing
  crack(ctx, H, o) {
    const { cv, c } = ctx;
    const pts = [[o.fx + 2, o.fy - 12], [o.fx - 1, o.fy - 6], [o.fx + 2, o.fy - 2], [o.fx - 2, o.fy + 4], [o.fx + 1, o.fy + 10]];
    for (let i = 0; i < pts.length - 1; i++) cv.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], (X, Y) => { cv.px(X, Y, c('hole')); });
    for (const p of pts) cv.px(p[0] - 1, p[1], c('tint'));
    for (const s of [-1, 1]) cv.px(o.fx + s * 5, o.fy, c(o.face === 'ko' ? 'hole' : 'tintHi'));
  },
};

// --- the rig ---------------------------------------------------------------------------------
export function hollow(id, cfg) {
  const tone = cfg.tone || BONE;
  const tint = cfg.tint, tintHi = cfg.tintHi || tint.map((v) => lerp(v, 31, 0.5)), tintDk = cfg.tintDk || tint.map((v) => Math.round(v * 0.4));
  const cloth = cfg.cloth || [[11, 11, 16], [6, 6, 10], [3, 3, 6], [1, 1, 3]];
  const { layers, palettes } = rig(id, {
    build: cfg.build,
    body: cfg.body,
    outline: [2, 2, 6],
    colors: {
      skin: ramp4(tone),
      hair: cfg.hair || [[28, 28, 31], [18, 19, 25], [7, 7, 13]],
      glove: cfg.glove || [[30, 30, 31], [21, 22, 27], [9, 9, 15]],
      top: cloth,
      trim: cfg.trim || [[31, 31, 31], [24, 25, 29], [13, 13, 19]],
      boot: cfg.boot || [[22, 23, 28], [11, 11, 17], [4, 4, 9]],
      sh: cfg.shorts || [[10, 10, 15], [5, 5, 9], [2, 2, 5]],
      extraA: { tint, tintHi },
      extraB: { hole: HOLE, tintDk },
    },
    swaps: cfg.swaps,
    head: { jaw: cfg.head && cfg.head.jaw || 'round', ears: null, hair: cfg.hairStyle || 'none', nose: null, ...(cfg.head || {}), gear: null },
    top: { style: cfg.topStyle || 'harness', pauldrons: cfg.pauldrons, emblem: null, ...(cfg.top || {}), emblem: (ctx, cx, cy) => {
      const shape = typeof cfg.emblem === 'function' ? null : S[cfg.emblem || 'ring'];
      if (typeof cfg.emblem === 'function') return cfg.emblem(ctx, cx, cy);
      hole(ctx, cx, cy + 3, shape);
      (INSIDE[cfg.emblem || 'ring'] || (() => {}))(ctx, cx, cy + 3);
    } },
    belt: cfg.belt || { buckle: 'none' },
    stripe: cfg.stripe,
    poses: cfg.poses,
    ramps: cfg.ramps,
    torso: cfg.torso,
    back: cfg.back,
    front: cfg.front,
    remix: undefined,
  });
  // the head: skull (bare), then the face the shard has instead of a face
  layers.head = (ctx, H) => {
    const { ramps } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y), [lx, ly] = H.look;
    const o = { x, y, fx: x + lx, fy: y + ly, face: H.face || 'neutral' };
    if (cfg.behind) cfg.behind(ctx, H, o);
    if (cfg.head && cfg.head.ears) ears(ctx, H, ramps.skin, cfg.head.ears);
    const hm = skull(ctx, H, ramps.skin, (cfg.head && cfg.head.jaw) || 'round');
    ctx.headMask = hm;
    if (cfg.hairStyle && cfg.hairStyle !== 'none' && cfg.hairDraw) cfg.hairDraw(ctx, H, o);
    const F = typeof cfg.face === 'function' ? cfg.face : FACES[cfg.face || 'slit'];
    F(ctx, H, o);
    if (cfg.gear) cfg.gear(ctx, H, o);
  };
  return { layers, palettes };
}
export { hole, S as SHAPES };

// a palette swap that bleaches every surface toward white (a counter window's flash, a tell's glare): { A, B } for rig `swaps`
export const glare = (k = 1) => {
  const W = (v) => Math.round(v + (31 - v) * k);
  const to = (c) => [W(c[0]), W(c[1]), W(c[2])];
  const A = {}, B = {};
  const ramp = (o, key, list) => list.forEach((c, i) => { o[key + ['Hi', '', 'Sh', 'Dk'][i]] = to(c); });
  ramp(A, 'skin', [[31, 31, 31], BONE, [16, 17, 22], [8, 8, 13]]);
  A.gloveHi = to([30, 30, 31]); A.glove = to([21, 22, 27]); A.gloveDk = to([9, 9, 15]);
  ramp(B, 'top', [[11, 11, 16], [6, 6, 10], [3, 3, 6], [1, 1, 3]]);
  B.shHi = to([10, 10, 15]); B.sh = to([5, 5, 9]); B.shDk = to([2, 2, 5]);
  B.bootHi = to([22, 23, 28]); B.boot = to([11, 11, 17]); B.bootDk = to([4, 4, 9]);
  return { A, B };
};
