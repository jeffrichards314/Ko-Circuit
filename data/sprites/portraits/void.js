// Intro-card portraits (64x60 busts) for the Void (spec §18, Phase E): the twelve Hollowed and ZERO's true form, on the portrait rig and the
// fighters' own palettes. A pale head on shoulders of black rag, no face but the one the shard has (a slit, a visor, an eye, sockets, a crack
// or nothing), the hollow of what they carried at the bottom of the frame with its rim burning in their colour, and the black of their arena
// behind them with a few fragments drifting.
import { portrait } from './rig.js';
import { mirror } from './kit.js';
import { hole, SHAPES } from '../fighters/void/_hollow.js';

const backdrop = (seed, n = 9) => (k) => {
  const { cv, m, c } = k;
  cv.flat(m().rect(0, 0, 64, 60), c('hole'), false);
  for (let i = 0; i < n; i++) { const x = (i * 37 + seed * 11) % 60, y = (i * 23 + seed * 7) % 40 + 2, w = 2 + (i % 4); cv.flat(m().rect(x, y, w, 1 + (i & 1)), c(i % 3 ? 'skinSh' : 'tintDk'), false); }
  for (let i = 0; i < 22; i++) cv.px((i * 29 + seed * 5) % 64, (i * 17 + seed * 3) % 58, c(i % 4 ? 'skinDk' : 'tintDk'));
};

// repaint the face area smooth, then the shard's own face on it
function face(k, kind, cy, tintKeys = ['tint', 'tintHi']) {
  const { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  cv.flat(m().ellipse(32, cy + 2, 13, 13), c('skin'), false);
  cv.part(m().ellipse(32, cy - 1, 12, 13).ellipse(32, cy + 6, 10.5, 11), { ramp: skin, bevel: 9, inner: 'none', shadow: false });
  const ey = cy - 1, t = c(tintKeys[0]), th = c(tintKeys[1]), hl = c('hole'), w = c('white');
  if (kind === 'slit') { for (let x = 25; x <= 39; x++) cv.px(x, ey, Math.abs(x - 32) > 5 ? t : w); }
  else if (kind === 'visor') { cv.flat(m().rect(22, ey - 3, 21, 7), hl, true); for (let x = 24; x <= 40; x++) { cv.px(x, ey - 1, Math.abs(x - 32) < 3 ? th : t); cv.px(x, ey, t); } }
  else if (kind === 'cyclops') { cv.flat(m().ellipse(32, ey, 10, 7), hl, true); cv.flat(m().ellipse(32, ey, 8, 5), w, false); cv.flat(m().ellipse(32, ey, 4, 4), t, false); cv.px(32, ey, c('outline')); cv.px(31, ey - 1, th); cv.px(30, ey, w); }
  else if (kind === 'holes') { for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.flat(m().ellipse(X(39), ey, 4.4, 4.6), hl, true); cv.px(X(39) + (s > 0 ? -1 : 1), ey, th); cv.px(X(39) + (s > 0 ? -1 : 1), ey - 1, t); } }
  else if (kind === 'crack') { const pts = [[34, cy - 14], [30, cy - 6], [34, cy - 1], [29, cy + 6], [32, cy + 13]]; for (let i = 0; i < pts.length - 1; i++) cv.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], (X, Y) => cv.px(X, Y, hl)); for (const p of pts) cv.px(p[0] - 1, p[1], t); for (const s of [1, -1]) cv.px(s > 0 ? 39 : 24, ey, th); }
  else if (kind === 'blank') { for (let y = cy - 12; y <= cy + 6; y += 2) cv.px(32, y, t); }
}
// the hollow at the bottom of the frame
function emblem(k, shape, y = 52, s = 1) {
  const ctx = { cv: k.cv, c: k.c, mask: k.m };
  hole(ctx, 32, y, SHAPES[shape]);
}

const P = (o) => portrait({
  bg: backdrop(o.seed),
  top: o.top || { neck: 7, top: 45, slope: 13 },
  head: o.head || { rx: 13, ry: 16, cy: 26, jawY: 34, jawRx: 10.5, jawRy: 10.5 },
  ear: null, hair: 'none', eyes: 'narrow', mouth: 'flat', nose: null,
  front(k) {
    face(k, o.face, (o.head && o.head.cy) || 26);
    if (o.gear) o.gear(k);
    emblem(k, o.emblem);
  },
});
const fins = (k) => { const { cv, m, r, c } = k; for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.part(m().poly([[X(45), 20], [X(56), 10], [X(54), 32], [X(45), 33]]), { ramp: r('skinHi', 'skin', 'skinSh', 'skinDk'), bevel: 2, inner: 'line' }); cv.px(X(51), 22, c('tint')); cv.px(X(50), 25, c('tint')); } };
const thorns = (k) => { const { cv, m, r } = k; for (const dx of [-11, -5, 0, 5, 11]) cv.part(m().poly([[32 + dx - 3, 12], [32 + dx, 4 - (dx === 0 ? 3 : 0)], [32 + dx + 3, 12]]), { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 1, inner: 'line', shadow: false }); };
const spikes = (k) => { const { cv, m, r } = k; const h = m().ellipse(32, 12, 14, 5); for (let i = -5; i <= 5; i++) h.poly([[32 + i * 3.4 - 3, 12], [32 + i * 4.4, 1 - (Math.abs(i) & 1) * 3], [32 + i * 3.4 + 3, 12]]); cv.part(h, { ramp: r('hairHi', 'hair', 'hairDk'), bevel: 2, inner: 'line' }); };
const monocle = (k) => { const { cv, c } = k; for (let a = 0; a < 30; a++) { const t = (a / 30) * Math.PI * 2; cv.px(Math.round(40 + Math.cos(t) * 7), Math.round(25 + Math.sin(t) * 7), c('tint')); } for (let y = 32; y < 52; y += 2) cv.px(47, y, c('tintHi')); };
const helm = (k) => { const { cv, m, r, c } = k; cv.part(m().rect(17, 6, 30, 9), { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 2, inner: 'line' }); for (let x = 20; x <= 44; x += 6) cv.px(x, 10, c('hole')); };
const crop = (k) => { const { cv, m, r } = k; cv.part(m().ellipse(32, 12, 14, 8).cut(m().rect(0, 17, 64, 40)), { ramp: r('hairHi', 'hair', 'hairDk'), bevel: 3, inner: 'line' }); };
const hood = (k) => { const { cv, m, r } = k; cv.part(m().ellipse(32, 12, 15, 7).cut(m().ellipse(32, 26, 12, 10)), { ramp: r('topHi', 'top', 'topSh', 'topDk'), bevel: 3, inner: 'line', shadow: false }); };

export const voidPortraits = {
  dodgeShard: P({ seed: 1, face: 'slit', emblem: 'chevrons', head: { rx: 12, ry: 17, cy: 26, jawY: 35, jawRx: 9.5, jawRy: 11 } }),
  blockShard: P({ seed: 2, face: 'visor', emblem: 'square', top: { neck: 11, top: 43, slope: 17 }, head: { rx: 15, ry: 15, cy: 26, jawY: 33, jawRx: 15, jawRy: 11 }, gear: helm }),
  duckShard: P({ seed: 3, face: 'slit', emblem: 'bar', head: { rx: 11.5, ry: 15, cy: 27, jawY: 35, jawRx: 9, jawRy: 10 } }),
  counterShard: P({ seed: 4, face: 'visor', emblem: 'diamond', gear: (k) => { const { cv, c } = k; for (let x = 24; x <= 40; x += 3) cv.line(x, 22, x, 29, (X, Y) => cv.px(X, Y, c('hole'))); } }),
  sightShard: P({ seed: 5, face: 'cyclops', emblem: 'eye', gear: hood }),
  soundShard: P({ seed: 6, face: 'blank', emblem: 'ear', head: { rx: 11.5, ry: 16, cy: 26, jawY: 34, jawRx: 9, jawRy: 10 }, gear: fins }),
  rhythmShard: P({ seed: 7, face: 'holes', emblem: 'metronome' }),
  memoryShard: P({ seed: 8, face: 'blank', emblem: 'grid', top: { neck: 10, top: 44, slope: 16 }, head: { rx: 14.5, ry: 15, cy: 26, jawY: 33, jawRx: 14, jawRy: 11 } }),
  echoShard: P({ seed: 9, face: 'blank', emblem: 'person', gear: crop }),
  chaosShard: P({ seed: 10, face: 'crack', emblem: 'jag', gear: spikes }),
  timeShard: P({ seed: 11, face: 'holes', emblem: 'ring', head: { rx: 12, ry: 17, cy: 26, jawY: 35, jawRx: 9.5, jawRy: 11 }, gear: monocle }),
  willShard: P({ seed: 12, face: 'holes', emblem: 'heart', top: { neck: 12, top: 43, slope: 18 }, head: { rx: 15.5, ry: 15, cy: 26, jawY: 33, jawRx: 15.5, jawRy: 11 }, gear: thorns }),
};
