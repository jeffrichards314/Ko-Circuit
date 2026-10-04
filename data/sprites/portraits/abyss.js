// Intro-card portraits (64x60 busts) for the lower Underworld (spec §18, Phase D): the Furnace, the Abyss Gate and
// Vorgath, on the portrait rig, one per fighter (the Hall of the Fallen wears the champions' own portraits in their new palettes).
import { portrait } from './rig.js';
import { mirror } from './kit.js';

// --- U5: the Furnace -----------------------------------------------------------------------------------

// a wall of hot brick behind them, an orange glow rising from below, sparks
const furnace = (k, seed = 1) => {
  const { cv, m, c, r } = k;
  cv.part(m().rect(0, 0, 64, 60), { ramp: r('topDk', 'topDk', 'topDk'), bevel: 1, shadow: false, inner: 'none' });
  for (let y = 4; y < 56; y += 9) for (let x = ((y / 9) | 0) % 2 ? 0 : 7; x < 64; x += 14) cv.part(m().rect(x, y, 13, 8), { ramp: r('topSh', 'topDk', 'topDk'), bevel: 1, shadow: false, inner: 'line' });
  cv.part(m().ellipse(32, 66, 50, 22), { ramp: r('trimSh', 'trimSh', 'trimSh'), bevel: 1, shadow: false, inner: 'none' });
  cv.part(m().ellipse(32, 68, 34, 14), { ramp: r('trim', 'trim', 'trim'), bevel: 1, shadow: false, inner: 'none' });
  for (let i = 0; i < 14; i++) { const x = (i * 37 + seed * 13) % 62 + 1, y = (i * 23 + seed * 7) % 44 + 2; cv.px(x, y, c('trimHi')); }
};

export const stokerPortrait = portrait({
  bg(k) { furnace(k, 2); },
  top: { neck: 11, top: 45, slope: 16 }, head: { rx: 16, ry: 16, cy: 26, jawY: 33, jawRx: 16, jawRy: 12 }, ear: [15, 29, 3, 4.6],
  hair: 'none', eyes: 'heavy', mouth: 'flat', brow: { r0: 2.4, r1: 2, tilt: 1.3 },
  front(k) {
    const { cv, m, c, r } = k;
    // the sweat-rag knotted over the crown, tails at the side
    cv.part(m().ellipse(32, 15, 17, 8).cut(m().rect(0, 19, 64, 40)), { ramp: r('rag', 'rag', 'ragDk'), bevel: 4, inner: 'line' });
    cv.part(m().poly([[47, 15], [56, 18], [53, 25], [46, 20]]), { ramp: r('rag', 'ragDk', 'ragDk'), bevel: 2, inner: 'line', shadow: false });
    // coal smears under the eyes and a coal spark
    for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); for (let i = 0; i < 4; i++) cv.px(X(23 + i), 31 + (i & 1), c('skinDk')); }
    cv.px(12, 40, c('coalHi')); cv.px(13, 41, c('coal')); cv.px(50, 34, c('coalHi'));
  },
});

export const brandPortrait = portrait({
  bg(k) {
    furnace(k, 4);
    // the iron behind his shoulder: a rod and a glowing brand plate
    const { cv, m, c, r } = k;
    cv.line(48, 60, 54, 14, (X, Y) => { cv.px(X, Y, c('iron')); cv.px(X + 1, Y, c('ironHi')); });
    cv.part(m().rect(47, 4, 13, 12), { ramp: r('hotHi', 'hot', 'trimSh'), bevel: 2, inner: 'line', shadow: false });
    for (const [x, y] of [[51, 7], [52, 8], [53, 9], [54, 8], [55, 7], [53, 7], [53, 12], [54, 12]]) cv.px(x, y, c('outline'));
  },
  top: { neck: 8, top: 46, slope: 13 }, head: { rx: 13.5, ry: 15.5, cy: 27, jawY: 34, jawRx: 11, jawRy: 10.5 }, ear: [17.5, 30, 2.6, 3.8],
  hair: 'crop', eyes: 'narrow', mouth: 'flat', brow: { r0: 1.8, r1: 1.5, tilt: 1.3 },
  front(k) {
    const { cv, c } = k;
    // an old brand healed white on the cheek, a fresh one glowing on the shoulder
    for (const [x, y] of [[40, 30], [41, 31], [42, 30], [41, 29], [41, 33]]) cv.px(x, y, c('skinHi'));
    for (const [x, y] of [[10, 50], [11, 51], [12, 52], [10, 52], [12, 50], [13, 51]]) cv.px(x, y, c('hot'));
    cv.px(11, 51, c('hotHi'));
  },
});

export const slagPortrait = portrait({
  bg(k) { furnace(k, 6); const { cv, m, r } = k; cv.part(m().ellipse(32, 30, 27, 25), { ramp: r('trimSh', 'trimSh', 'trimSh'), bevel: 1, shadow: false, inner: 'none' }); },
  top: { neck: 12, top: 44, slope: 19 }, head: { rx: 16.5, ry: 16.5, cy: 26, jawY: 33, jawRx: 16.5, jawRy: 12 }, ear: null,
  hair: 'none', eyes: 'heavy', mouth: 'grin', nose: null, brow: { r0: 2.6, r1: 2.2, tilt: 1.3 },
  mid(k) {
    const { cv, c } = k;
    // cracks of lava up the skull and across the cheeks
    for (const [x0, y0, x1, y1] of [[32, 8, 30, 15], [30, 15, 25, 19], [32, 8, 38, 13], [38, 13, 40, 20], [20, 32, 24, 38], [44, 30, 41, 37]]) cv.line(x0, y0, x1, y1, (X, Y) => cv.px(X, Y, c('lava')));
    cv.px(30, 15, c('lavaHi')); cv.px(38, 13, c('lavaHi'));
  },
  front(k) {
    const { cv, m, c, r } = k;
    // the eyes, white-hot
    for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.part(m().ellipse(X(24.5), 25, 3.6, 2.6), { ramp: r('lavaHi', 'lavaHi', 'lava'), bevel: 0, inner: 'none', shadow: false }); }
    for (const [x, y] of [[8, 40], [9, 44], [55, 42], [54, 47]]) { cv.px(x, y, c('lava')); cv.px(x, y + 1, c('lavaHi')); }
    for (const [x0, y0, x1, y1] of [[32, 46, 33, 52], [33, 52, 28, 58], [33, 52, 40, 57]]) cv.line(x0, y0, x1, y1, (X, Y) => cv.px(X, Y, c('lava')));
  },
});

export const cruciblePortrait = portrait({
  bg(k) {
    furnace(k, 8);
    const { cv, m, r } = k;
    // heat shimmer: a hot pale glow behind the pot
    cv.part(m().ellipse(32, 26, 26, 24), { ramp: r('trim', 'trim', 'trim'), bevel: 1, shadow: false, inner: 'none' });
    cv.part(m().ellipse(32, 26, 20, 18), { ramp: r('glow', 'glow', 'glow'), bevel: 1, shadow: false, inner: 'none' });
  },
  top: { neck: 10, top: 45, slope: 16 }, head: { rx: 16, ry: 16, cy: 26, jawY: 33, jawRx: 16, jawRy: 12 }, ear: null,
  hair: 'none', eyes: 'heavy', mouth: 'flat', nose: null, brow: { r0: 0.1, r1: 0.1, tilt: 0 },
  front(k) {
    const { cv, m, c, r } = k;
    // the pot down over the whole head: a flared rim, rivets, one white-hot slit
    const pot = m().ellipse(32, 26, 19, 20).ellipse(32, 36, 17, 15);
    cv.part(pot, { ramp: r('topHi', 'top', 'topSh'), bevel: 6, inner: 'line' });
    cv.part(m().rect(10, 14, 44, 5), { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 1, inner: 'line', shadow: false });
    for (const [x, y] of [[16, 22], [48, 22], [14, 34], [50, 34], [32, 10]]) cv.px(x, y, c('trimHi'));
    cv.part(m().rect(15, 25, 34, 5), { ramp: r('outline', 'outline', 'outline'), bevel: 0, inner: 'none', shadow: false });
    for (let x = 17; x <= 47; x++) { cv.px(x, 26, c(Math.abs(x - 32) < 8 ? 'glowHi' : 'glow')); cv.px(x, 27, c('glow')); }
    for (const x of [16, 27, 39, 49]) cv.px(x, 11, c('glow'));
  },
});

// --- U6: Abyss Gate ------------------------------------------------------------------------------------

// black stone, an arch of blue-white light very far behind, cold mist at the foot
const gate = (k, seed = 1) => {
  const { cv, m, c, r } = k;
  cv.part(m().rect(0, 0, 64, 60), { ramp: r('topDk', 'topDk', 'topDk'), bevel: 1, shadow: false, inner: 'none' });
  cv.part(m().ellipse(32, 30, 24, 28).rect(8, 30, 48, 30), { ramp: r('topSh', 'topSh', 'topSh'), bevel: 1, shadow: false, inner: 'none' });
  cv.part(m().ellipse(32, 32, 17, 22).rect(15, 32, 34, 28), { ramp: r('topDk', 'topDk', 'topDk'), bevel: 1, shadow: false, inner: 'none' });
  for (let i = 0; i < 12; i++) { const x = (i * 41 + seed * 17) % 62 + 1, y = (i * 29 + seed * 5) % 50 + 2; cv.px(x, y, c('skinSh')); }
};

export const noxPortrait = portrait({
  bg(k) { gate(k, 2); },
  top: { neck: 11, top: 45, slope: 17 }, head: { rx: 16, ry: 16, cy: 26, jawY: 33, jawRx: 16, jawRy: 12 }, ear: null,
  hair: 'none', eyes: 'heavy', mouth: 'flat', nose: null, brow: { r0: 0.1, r1: 0.1, tilt: 0 },
  front(k) {
    const { cv, m, c, r } = k;
    // the helm, and a portcullis for a visor: bars over a violet light
    cv.part(m().ellipse(32, 26, 19, 20).ellipse(32, 36, 17, 15), { ramp: r('topHi', 'top', 'topSh'), bevel: 6, inner: 'line' });
    cv.part(m().rect(11, 17, 42, 3), { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 1, inner: 'line', shadow: false });
    cv.part(m().rect(15, 23, 34, 16), { ramp: r('outline', 'outline', 'outline'), bevel: 0, inner: 'none', shadow: false });
    for (let x = 16; x <= 48; x++) { cv.px(x, 29, c('eye')); cv.px(x, 30, c('eye')); }
    for (const x of [26, 38]) { cv.px(x, 29, c('eyeHi')); cv.px(x, 30, c('eyeHi')); }
    for (const x of [16, 24, 32, 40, 48]) cv.line(x, 23, x, 38, (X, Y) => cv.px(X, Y, c('trim')));
    cv.line(15, 31, 49, 31, (X, Y) => cv.px(X, Y, c('trimSh')));
  },
});

export const umbraPortrait = portrait({
  bg(k) {
    gate(k, 4);
    // his shadow, big, behind him: a black cut-out with a violet edge
    const { cv, m, r } = k;
    cv.part(m().ellipse(44, 30, 18, 24).rect(28, 44, 36, 16), { ramp: r('trimSh', 'topDk', 'topDk'), bevel: 3, shadow: false, inner: 'line' });
  },
  behind(k) { const { cv, m, r } = k; cv.part(m().poly([[14, 12], [50, 12], [56, 60], [8, 60]]), { ramp: r('hairHi', 'hair', 'hairDk'), bevel: 4, inner: 'line' }); },
  top: { neck: 6, top: 47, slope: 9 }, head: { rx: 12.5, ry: 15.5, cy: 27, jawY: 34, jawRx: 10, jawRy: 10.5 }, ear: null,
  hair: 'long', eyes: 'narrow', mouth: 'flat', brow: { r0: 1, r1: 0.9, tilt: 1 },
  front(k) {
    const { cv, m, c, r } = k;
    // blank white eyes; a fall of hair over one side of the face
    for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.part(m().ellipse(X(25), 26, 3.8, 2.8), { ramp: r('white', 'white', 'lilac'), bevel: 0, inner: 'none', shadow: false }); }
    cv.part(m().poly([[16, 12], [29, 10], [26, 26], [22, 42], [16, 30]]), { ramp: r('hairHi', 'hair', 'hairDk'), bevel: 3, inner: 'line', shadow: false });
    for (const [x, y] of [[44, 40], [46, 44], [12, 36]]) cv.px(x, y, c('lilac'));
  },
});

export const lamentPortrait = portrait({
  bg(k) { gate(k, 6); },
  behind(k) { const { cv, m, r } = k; cv.part(m().poly([[10, 10], [54, 10], [62, 60], [2, 60]]), { ramp: r('topHi', 'top', 'topSh'), bevel: 4, inner: 'line' }); },
  top: { neck: 7, top: 47, slope: 12 }, head: { rx: 13.5, ry: 15.5, cy: 27, jawY: 34, jawRx: 11.5, jawRy: 11 }, ear: null,
  hair: 'none', eyes: 'wide', mouth: 'open', brow: { r0: 1.4, r1: 1.1, tilt: 1.6 },
  front(k) {
    const { cv, m, c, r } = k;
    // the veil over the crown, tears down both cheeks, the mouth stretched in a wail
    cv.part(m().ellipse(32, 15, 18, 9).cut(m().rect(0, 20, 64, 40)), { ramp: r('topHi', 'top', 'topSh'), bevel: 4, inner: 'line' });
    for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); for (let j = 0; j < 12; j++) cv.px(X(24), 30 + j, c(j & 1 ? 'tear' : 'tearHi')); }
    cv.part(m().ellipse(32, 41, 5.4, 5.4), { ramp: r('outline', 'outline', 'outline'), bevel: 0, inner: 'none', shadow: false });
    cv.px(30, 38, c('white')); cv.px(34, 38, c('white'));
  },
});

export const graspPortrait = portrait({
  bg(k) {
    gate(k, 8);
    // grey hands reaching up from the bottom edge, all round him
    const { cv, m, r } = k;
    for (const [x, h] of [[4, 22], [12, 30], [52, 28], [60, 20], [22, 16], [44, 14]]) for (let i = -1; i <= 1; i++) cv.part(m().capsule(x + i * 2.4, 60, x + i * 2.4 + i, 60 - h + Math.abs(i) * 4, 1.4, 1.1), { ramp: r('skinHi', 'skin', 'skinSh'), bevel: 1, inner: 'line', shadow: false });
  },
  top: { neck: 12, top: 44, slope: 19 }, head: { rx: 16, ry: 16.5, cy: 27, jawY: 34, jawRx: 16, jawRy: 12 }, ear: null,
  hair: 'none', eyes: 'heavy', mouth: 'flat', nose: null, brow: { r0: 2.4, r1: 2, tilt: 1.3 },
  front(k) {
    const { cv, m, c, r } = k;
    // a crown of five grey fingers growing up out of the skull
    for (let i = -2; i <= 2; i++) { const h = 12 - Math.abs(i) * 1.8, bx = 32 + i * 6; cv.part(m().capsule(bx, 14, bx + i * 1.4, 14 - h, 2.6, 2), { ramp: r('skinHi', 'skin', 'skinSh'), bevel: 1, inner: 'line', shadow: false }); cv.px(Math.round(bx + i * 1.4), 14 - h - 1, c('nail')); }
    for (const [x, y] of [[20, 46], [44, 50], [12, 38]]) { cv.px(x, y, c('dirt')); cv.px(x + 1, y, c('dirt')); }
  },
});

export const heraldPortrait = portrait({
  bg(k) { gate(k, 10); },
  top: { neck: 8, top: 46, slope: 12 }, head: { rx: 14, ry: 16.5, cy: 27, jawY: 35, jawRx: 11, jawRy: 11 }, ear: null,
  hair: 'none', eyes: 'narrow', mouth: 'flat', nose: null, brow: { r0: 0.1, r1: 0.1, tilt: 0 },
  front(k) {
    const { cv, m, c, r } = k;
    // the bone mask over the whole face: a wide black mouth, two red points for eyes; spikes off the mantle
    cv.part(m().ellipse(32, 26, 16, 18).ellipse(32, 35, 12, 12), { ramp: r('bone', 'bone', 'boneDk'), bevel: 6, inner: 'line' });
    cv.part(m().ellipse(32, 40, 6.4, 5.4), { ramp: r('outline', 'outline', 'outline'), bevel: 0, inner: 'none', shadow: false });
    for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.part(m().rect(X(25) - 2, 24, 6, 4), { ramp: r('outline', 'outline', 'outline'), bevel: 0, inner: 'none', shadow: false }); cv.px(X(25), 26, c('eye')); cv.px(X(26), 26, c('eye')); }
    cv.line(32, 9, 32, 22, (X, Y) => cv.px(X, Y, c('boneDk')));
    for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); for (let i = 0; i < 3; i++) cv.part(m().poly([[X(12 + i * 4), 46], [X(14 + i * 5), 36 + i * 2], [X(16 + i * 4), 46]]), { ramp: r('trim', 'trimSh', 'trimSh'), bevel: 1, inner: 'line', shadow: false }); }
    for (let i = -6; i <= 6; i++) cv.px(32 + i, 56, c('trim'));
  },
});

export const vorgathPortrait = portrait({
  bg(k) {
    gate(k, 12);
    const { cv, m, r } = k;
    // the red light behind the crown
    cv.part(m().ellipse(32, 8, 26, 12), { ramp: r('topSh', 'topSh', 'topSh'), bevel: 1, shadow: false, inner: 'none' });
    cv.part(m().ellipse(32, 6, 14, 6), { ramp: r('seam', 'seam', 'seam'), bevel: 1, shadow: false, inner: 'none' });
  },
  top: { neck: 13, top: 43, slope: 20 }, head: { rx: 17, ry: 17, cy: 27, jawY: 34, jawRx: 17, jawRy: 12 }, ear: null,
  hair: 'none', eyes: 'heavy', mouth: 'flat', nose: null, brow: { r0: 2.8, r1: 2.4, tilt: 1.6 },
  front(k) {
    const { cv, m, c, r } = k;
    // the crown: a band, five tall spikes and a ruby in each; eyes that burn
    cv.part(m().rect(14, 12, 36, 4), { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 1, inner: 'line', shadow: false });
    for (let i = -2; i <= 2; i++) { const h = 13 - Math.abs(i) * 2, bx = 32 + i * 7; cv.part(m().poly([[bx - 3, 12], [bx, 12 - h], [bx + 3, 12]]), { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 1, inner: 'line', shadow: false }); cv.px(bx, 13, c('ruby')); cv.px(bx, 14, c('eyeHi')); }
    for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.part(m().ellipse(X(24.5), 25, 4, 3), { ramp: r('eyeHi', 'eye', 'eye'), bevel: 0, inner: 'none', shadow: false }); }
    for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.line(X(16), 40, X(20), 52, (Xx, Y) => cv.px(Xx, Y, c('seam'))); }
  },
});
