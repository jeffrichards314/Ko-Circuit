// Intro-card portraits (64x60 busts) for the Underworld's fighters (spec §18), on the portrait rig
// (rig.js): each is a config for the shared bust, head, hair and face, plus a few hooks for what's
// his own (a cap, an oar, a sack, the drip off her hair). Circuit by circuit, the way the roster is numbered.
import { portrait } from './rig.js';
import { mirror } from './kit.js';

const fog = (k, keys = ['topSh', 'topSh', 'topDk']) => { const { cv, m, r } = k; for (let i = 0; i < 3; i++) cv.part(m().ellipse(10 + i * 22, 48 - i * 3, 22, 7), { ramp: r(keys[i], keys[i], keys[i]), bevel: 1, shadow: false, inner: 'none' }); };

// --- U1: Ferryman's Shore ---------------------------------------------------------------------------

export const gruePortrait = portrait({
  bg(k) { const { cv, m, r } = k; cv.part(m().rect(0, 0, 64, 60), { ramp: r('topDk', 'topDk', 'topDk'), bevel: 1, shadow: false, inner: 'none' }); fog(k); },
  behind(k) { const { cv, m, r } = k; cv.part(m().poly([[52, 0], [57, 0], [55, 60], [50, 60]]), { ramp: r('oarHi', 'oar', 'oar'), bevel: 2, inner: 'line' }); cv.part(m().ellipse(56, 8, 7, 11), { ramp: r('oarHi', 'oar', 'oar'), bevel: 3, inner: 'line', shadow: false }); },
  top: { neck: 10, top: 45, slope: 15 }, head: { rx: 16, ry: 16, cy: 26, jawY: 33, jawRx: 16, jawRy: 12 }, ear: [15, 29, 3, 4.6],
  hair: 'none', beard: 'full', eyes: 'heavy', mouth: 'flat', brow: { r0: 2.2, r1: 1.9, tilt: 1.2 },
  front(k) {
    const { cv, m, c, r } = k;
    cv.part(m().ellipse(32, 15, 17, 8).cut(m().rect(0, 19, 64, 40)), { ramp: r('topHi', 'top', 'topSh'), bevel: 4, inner: 'line' });
    cv.part(m().rect(15, 17, 34, 3), { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 1, inner: 'line', shadow: false });
    for (const [x, y] of [[24, 45], [40, 47], [32, 42]]) { cv.px(x, y, c('weed')); cv.px(x + 1, y + 1, c('weed')); }
  },
});

export const maePortrait = portrait({
  bg(k) { const { cv, m, c, r } = k; cv.part(m().rect(0, 0, 64, 60), { ramp: r('topDk', 'topDk', 'topDk'), bevel: 1, shadow: false, inner: 'none' }); fog(k, ['topSh', 'topDk', 'topSh']); for (const [x, y] of [[10, 10], [50, 18], [8, 34], [56, 40]]) { cv.px(x, y, c('drip')); cv.px(x, y + 1, c('bead')); } },
  behind(k) { const { cv, m, r } = k; cv.part(m().poly([[14, 12], [50, 12], [58, 60], [6, 60]]), { ramp: r('hairHi', 'hair', 'hairDk'), bevel: 4, inner: 'line' }); },
  top: { neck: 6.5, top: 47, slope: 10 }, head: { rx: 13.5, ry: 15.5, cy: 27, jawY: 34, jawRx: 11, jawRy: 10.5 }, ear: null,
  hair: 'long', eyes: 'wide', iris: 'eye', mouth: 'flat', brow: { r0: 1.2, r1: 1, tilt: 1 },
  front(k) { const { cv, c } = k; for (const x of [22, 27, 33, 39]) cv.line(x, 14, x + (x < 32 ? -1 : 1), 22, (X, Y) => cv.shade(X, Y, 1)); for (const [x, y] of [[20, 44], [44, 47], [26, 55], [40, 56]]) { cv.px(x, y, c('bead')); cv.px(x, y + 1, c('drip')); } cv.px(19, 22, c('glove')); cv.px(18, 24, c('glove')); },
});

export const tollPortrait = portrait({
  bg(k) { const { cv, m, c, r } = k; cv.part(m().rect(0, 0, 64, 60), { ramp: r('topDk', 'topDk', 'topDk'), bevel: 1, shadow: false, inner: 'none' }); for (const [x, y] of [[8, 46], [12, 50], [6, 54], [16, 54], [10, 57]]) { cv.part(m().ellipse(x, y, 3, 2.2), { ramp: r('coin', 'coin', 'coinDk'), bevel: 1, shadow: false, inner: 'line' }); } fog(k); },
  top: { neck: 7.5, top: 46, slope: 12 }, head: { rx: 13.5, ry: 15.5, cy: 27, jawY: 34, jawRx: 11.5, jawRy: 10.5 }, ear: [17, 30, 2.8, 4],
  hair: 'none', eyes: 'narrow', mouth: 'flat', brow: { r0: 1.6, r1: 1.4, tilt: 1.3 },
  body(k) { const { cv, m, r, c } = k; for (const dy of [50, 55]) { cv.px(24, dy, c('coin')); cv.px(40, dy, c('coin')); } cv.line(46, 46, 42, 58, (X, Y) => cv.px(X, Y, c('coinDk'))); },
  front(k) {
    const { cv, m, c, r } = k;
    cv.part(m().ellipse(32, 15, 15.5, 7.5).cut(m().rect(0, 19, 64, 40)), { ramp: r('topHi', 'top', 'topSh'), bevel: 4, inner: 'line' });
    cv.part(m().rect(16, 17, 32, 3), { ramp: r('topHi', 'top', 'topSh'), bevel: 1, inner: 'line', shadow: false });
    cv.part(m().rect(28, 10, 8, 6), { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 1, inner: 'line', shadow: false });
    for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); for (let y = 30; y < 42; y++) cv.px(X(19), y, c(y & 1 ? 'hair' : 'hairHi')); }
  },
});

export const morosPortrait = portrait({
  bg(k) {
    const { cv, m, r } = k;
    cv.part(m().rect(0, 0, 64, 60), { ramp: r('topDk', 'topDk', 'topDk'), bevel: 1, shadow: false, inner: 'none' });
    // three masks hanging in the dark behind him
    for (const [x, y, a] of [[7, 46, 'trimHi'], [57, 46, 'sackDk'], [32, 55, 'trim']]) cv.part(m().ellipse(x, y, 5, 6.4), { ramp: r(a, a, 'topDk'), bevel: 2, inner: 'line', shadow: false });
    fog(k);
  },
  top: { neck: 12, top: 44, slope: 19 }, head: { rx: 16, ry: 16.5, cy: 26, jawY: 33, jawRx: 16.5, jawRy: 12 }, ear: null,
  hair: 'none', eyes: 'heavy', mouth: 'flat', nose: null, brow: { r0: 2.2, r1: 1.9, tilt: 1.2 },
  front(k) {
    const { cv, m, c, r } = k;
    // the burlap sack over the head, the eye holes, the stitched grin
    const sack = m().ellipse(32, 25, 19, 19).ellipse(32, 36, 16, 14);
    cv.part(sack, { ramp: r('sack', 'sack', 'sackDk'), bevel: 6, inner: 'line' });
    for (let y = 8; y < 52; y += 3) for (let x = 14; x < 52; x += 3) if (sack.in(x + (y & 3 ? 1 : 0), y)) cv.px(x + (y & 3 ? 1 : 0), y, c('sackDk'));
    for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.part(m().ellipse(X(24), 25, 4, 3.2), { ramp: r('thread', 'thread', 'thread'), bevel: 0, inner: 'none', shadow: false }); cv.px(X(25), 24, c('bone')); }
    for (let x = 22; x <= 42; x++) cv.px(x, 40 + (Math.abs(x - 32) > 7 ? -1 : 0), c('thread'));
    for (let x = 24; x <= 40; x += 3) { cv.px(x, 39, c('thread')); cv.px(x, 41, c('thread')); }
    cv.part(m().ellipse(32, 6, 5, 2.6), { ramp: r('sack', 'sackDk', 'sackDk'), bevel: 1, inner: 'line', shadow: false });
  },
});

// --- U2: Ashen Fields ---------------------------------------------------------------------------------

// the plain behind them: a red horizon and ash coming down
const ashSky = (k, seed = 2) => {
  const { cv, m, c, r } = k;
  cv.part(m().rect(0, 0, 64, 60), { ramp: r('topDk', 'topDk', 'topDk'), bevel: 1, shadow: false, inner: 'none' });
  cv.part(m().ellipse(32, 62, 46, 14), { ramp: r('trimSh', 'trimSh', 'trimSh'), bevel: 1, shadow: false, inner: 'none' });
  cv.part(m().ellipse(32, 64, 30, 8), { ramp: r('trim', 'trim', 'trim'), bevel: 1, shadow: false, inner: 'none' });
  for (let i = 0; i < 26; i++) { const x = (i * 37 + seed * 11) % 62 + 1, y = (i * 23 + seed * 7) % 46 + 2; cv.px(x, y, c(i % 6 === 0 ? 'trim' : 'skinSh')); }
};

export const cinderPortrait = portrait({
  bg(k) { ashSky(k, 3); },
  top: { neck: 6.5, top: 47, slope: 10 }, head: { rx: 12.5, ry: 15.5, cy: 27, jawY: 34, jawRx: 10, jawRy: 10.5 }, ear: [18, 30, 2.4, 3.4],
  hair: 'spike', eyes: 'narrow', mouth: 'flat', brow: { r0: 1.4, r1: 1.2, tilt: 1.4 },
  mid(k) { const { cv, c } = k; for (const [x, y] of [[23, 22], [24, 23], [24, 24], [41, 31], [40, 32], [42, 33], [27, 38], [28, 39]]) cv.px(x, y, c('crack')); },
  front(k) { const { cv, c } = k; for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.px(X(25), 27, c('emberHi')); cv.px(X(26), 27, c('emberHi')); } for (const [x, y] of [[10, 44], [52, 50], [20, 54], [44, 42]]) cv.px(x, y, c('ashHi')); },
});

export const scorchPortrait = portrait({
  bg(k) { ashSky(k, 5); const { cv, m, r } = k; cv.part(m().ellipse(32, 30, 26, 24), { ramp: r('trimSh', 'trimSh', 'trimSh'), bevel: 1, shadow: false, inner: 'none' }); },
  top: { neck: 8, top: 46, slope: 13 }, head: { rx: 14, ry: 16, cy: 27, jawY: 34, jawRx: 12, jawRy: 11 }, ear: [17, 30, 2.8, 4],
  hair: 'wild', eyes: 'wide', mouth: 'grin', brow: { r0: 1.8, r1: 1.4, tilt: 1.4 },
  body(k) { const { cv, c } = k; for (const dx of [-14, 14]) cv.line(32 + dx, 46, 32 + dx * 0.4, 60, (X, Y) => cv.px(X, Y, c('outline'))); },
  front(k) { const { cv, m, r } = k; for (const [x, y, h] of [[12, 56, 12], [52, 56, 12], [22, 58, 8], [42, 58, 8]]) cv.part(m().capsule(x, y, x + 1, y - h, 3.2, 0.8), { ramp: r('flameHi', 'flame', 'glove'), bevel: 1, inner: 'none', shadow: false }); },
});

export const kilnPortrait = portrait({
  bg(k) { ashSky(k, 7); const { cv, m, c, r } = k; for (let y = 6; y < 56; y += 8) for (let x = ((y / 8) | 0) % 2 ? 0 : 6; x < 64; x += 12) cv.part(m().rect(x, y, 11, 7), { ramp: r('topSh', 'topDk', 'topDk'), bevel: 1, shadow: false, inner: 'line' }); void c; },
  top: { neck: 10, top: 45, slope: 15 }, head: { rx: 16, ry: 16, cy: 26, jawY: 33, jawRx: 16, jawRy: 12 }, ear: [15, 29, 3, 4.6],
  hair: 'none', eyes: 'heavy', mouth: 'flat', brow: { r0: 2.4, r1: 2, tilt: 1.4 },
  body(k) { const { cv, m, c, r } = k; cv.part(m().ellipse(32, 60, 8, 8).cut(m().rect(20, 60, 24, 8)), { ramp: r('soot', 'soot', 'outline'), bevel: 1, inner: 'line', shadow: false }); cv.part(m().ellipse(32, 60, 5, 5), { ramp: r('glowHi', 'glow', 'trimSh'), bevel: 1, inner: 'none', shadow: false }); for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.line(X(16), 47, X(14), 60, (Xx, Y) => cv.px(Xx, Y, c('glow'))); } },
  mid(k) { const { cv, c } = k; for (const [x, y] of [[26, 20], [27, 21], [38, 18], [37, 19], [32, 46]]) cv.px(x, y, c('glow')); },
});

export const sootPortrait = portrait({
  bg(k) { ashSky(k, 9); },
  behind(k) { const { cv, m, r } = k; cv.part(m().poly([[12, 14], [52, 14], [60, 60], [4, 60]]), { ramp: r('hairHi', 'hair', 'hairDk'), bevel: 4, inner: 'line' }); },
  top: { neck: 7, top: 47, slope: 12 }, head: { rx: 13.5, ry: 15.5, cy: 28, jawY: 35, jawRx: 11, jawRy: 10.5 }, ear: null,
  hair: 'long', eyes: 'narrow', mouth: 'flat', brow: { r0: 1.4, r1: 1.2, tilt: 1.5 },
  front(k) {
    const { cv, m, c, r } = k;
    // the crown of spikes, each with a live coal
    cv.part(m().rect(17, 14, 30, 3), { ramp: r('glove', 'glove', 'glove'), bevel: 1, inner: 'line', shadow: false });
    for (let i = -2; i <= 2; i++) { const h = 9 - Math.abs(i) * 1.5; cv.part(m().poly([[32 + i * 6.4 - 2, 14], [32 + i * 6.4, 14 - h], [32 + i * 6.4 + 2, 14]]), { ramp: r('glove', 'glove', 'glove'), bevel: 1, inner: 'line', shadow: false }); cv.px(32 + i * 6.4, 13 - h, c('coalHi')); cv.px(32 + i * 6.4, 14 - h, c('coal')); }
    for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.px(X(25), 28, c('coalHi')); cv.px(X(26), 28, c('coalHi')); }
    for (let x = 16; x < 48; x += 5) cv.px(x, 58, c('edge'));
  },
});

// --- U3: Chain Pits -----------------------------------------------------------------------------------

// a wall of stone with chains hanging in it, and one lit cell-lamp
const pit = (k, seed = 4) => {
  const { cv, m, c, r } = k;
  cv.part(m().rect(0, 0, 64, 60), { ramp: r('topDk', 'topDk', 'topDk'), bevel: 1, shadow: false, inner: 'none' });
  for (let y = 4; y < 56; y += 9) for (let x = ((y / 9) | 0) % 2 ? 0 : 7; x < 64; x += 14) cv.part(m().rect(x, y, 13, 8), { ramp: r('topSh', 'topDk', 'topDk'), bevel: 1, shadow: false, inner: 'line' });
  for (const x of [8 + seed, 54 - seed]) for (let y = 0; y < 44; y += 4) { cv.px(x, y, c('trimHi')); cv.px(x + 1, y + 1, c('trimSh')); cv.px(x, y + 2, c('trim')); }
};

export const shacklePortrait = portrait({
  bg(k) { pit(k, 4); },
  top: { neck: 11, top: 45, slope: 16 }, head: { rx: 16, ry: 16, cy: 26, jawY: 33, jawRx: 16, jawRy: 12 }, ear: [15, 29, 3, 4.6],
  hair: 'none', beard: 'stubble', eyes: 'heavy', mouth: 'flat', brow: { r0: 2.4, r1: 2, tilt: 1.3 },
  body(k) { const { cv, c } = k; for (let x = 12; x < 54; x += 5) cv.line(x, 46, x + (x < 32 ? -2 : 2), 60, (X, Y) => cv.px(X, Y, c('stripe'))); },
  front(k) {
    const { cv, m, c, r } = k;
    cv.line(46, 25, 51, 30, (X, Y) => cv.shade(X, Y, 1));
    cv.part(m().ellipse(32, 47, 15, 4.4).cut(m().ellipse(32, 45.4, 10.4, 3)), { ramp: r('iron', 'glove', 'ironDk'), bevel: 1, inner: 'line', shadow: false });
    cv.part(m().ellipse(32, 55, 3, 4.4), { ramp: r('iron', 'glove', 'ironDk'), bevel: 1, inner: 'line', shadow: false });
  },
});

export const linkPortrait = portrait({
  bg(k) { pit(k, 7); },
  top: { neck: 6.5, top: 48, slope: 9 }, head: { rx: 12.5, ry: 15.5, cy: 27, jawY: 34, jawRx: 10, jawRy: 10.5 }, ear: [18, 30, 2.4, 3.4],
  hair: 'crop', eyes: 'narrow', mouth: 'flat', brow: { r0: 1.5, r1: 1.2, tilt: 1.5 },
  body(k) { const { cv, m, c, r } = k; for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); for (let i = 0; i < 6; i++) cv.part(m().ellipse(X(20 + i * 2.6), 50 + i * 1.8, 3.6, 1.6), { ramp: r('iron', 'glove', 'ironDk'), bevel: 1, inner: 'line', shadow: false }); } for (let i = 0; i < 5; i++) cv.px(30 + i * 1.4, 49 + (i & 1), c('glint')); },
});

export const briskPortrait = portrait({
  bg(k) { pit(k, 5); },
  top: { neck: 8, top: 46, slope: 13 }, head: { rx: 14, ry: 16, cy: 27, jawY: 34, jawRx: 12.5, jawRy: 11 }, ear: [17, 30, 2.8, 4],
  hair: 'none', beard: 'stache', eyes: 'normal', mouth: 'flat', brow: { r0: 1.8, r1: 1.5, tilt: 1.2 },
  body(k) { const { cv, c } = k; for (const dy of [50, 55]) { cv.px(26, dy, c('brass')); cv.px(38, dy, c('brass')); } cv.line(44, 46, 40, 58, (X, Y) => cv.px(X, Y, c('white'))); },
  front(k) {
    const { cv, m, c, r } = k;
    cv.part(m().ellipse(32, 14, 16.5, 8).cut(m().rect(0, 19, 64, 40)), { ramp: r('topHi', 'top', 'topSh'), bevel: 4, inner: 'line' });
    cv.part(m().rect(15, 16, 34, 3), { ramp: r('glove', 'glove', 'glove'), bevel: 1, inner: 'line', shadow: false });
    cv.part(m().ellipse(32, 19, 19, 2.2), { ramp: r('glove', 'glove', 'glove'), bevel: 1, inner: 'line', shadow: false });
    cv.part(m().ellipse(32, 11, 3.4, 3), { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 1, inner: 'line', shadow: false });
    // the key ring at the edge of the frame
    cv.part(m().ellipse(54, 52, 6, 6).cut(m().ellipse(54, 52, 3.8, 3.8)), { ramp: r('key', 'key', 'keyDk'), bevel: 1, inner: 'line', shadow: false });
  },
});

export const rattlePortrait = portrait({
  bg(k) { pit(k, 6); },
  top: { neck: 5.5, top: 48, slope: 8 }, head: { rx: 12.5, ry: 15, cy: 27, jawY: 34, jawRx: 9, jawRy: 10 }, ear: null,
  hair: 'none', eyes: 'normal', mouth: 'grin', nose: null, brow: null,
  body(k) { const { cv, c } = k; for (let i = 0; i < 4; i++) for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.line(X(31), 50 + i * 3, X(20 - i), 52 + i * 3, (Xx, Y) => cv.px(Xx, Y, c('skinSh'))); } cv.line(32, 47, 32, 60, (X, Y) => cv.px(X, Y, c('skinSh'))); },
  front(k) {
    const { cv, m, c, r } = k;
    // the sockets and the nose hole, the teeth
    for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); cv.part(m().ellipse(X(24.5), 26, 4.2, 4.8), { ramp: r('socket', 'socket', 'socket'), bevel: 0, inner: 'none', shadow: false }); cv.px(X(25), 26, c('glintE')); cv.px(X(25), 25, c('glintE')); }
    cv.px(31, 33, c('socket')); cv.px(33, 33, c('socket')); cv.px(32, 34, c('socket'));
    for (let x = 25; x <= 39; x++) { cv.px(x, 41, c('outline')); if (x & 1) { cv.px(x, 42, c('outline')); cv.px(x, 43, c('white' in k ? 'skinHi' : 'skinHi')); } }
  },
});

export const jailerPortrait = portrait({
  bg(k) { pit(k, 3); },
  top: { neck: 12, top: 44, slope: 19 }, head: { rx: 16, ry: 16.5, cy: 26, jawY: 33, jawRx: 16.5, jawRy: 12 }, ear: null,
  hair: 'none', eyes: 'heavy', mouth: 'flat', nose: null, brow: { r0: 2.2, r1: 1.9, tilt: 1.2 },
  body(k) { const { cv, m, c, r } = k; cv.part(m().rect(26, 48, 12, 10), { ramp: r('key', 'key', 'keyDk'), bevel: 2, inner: 'line', shadow: false }); cv.part(m().ellipse(32, 46, 4, 3.6).cut(m().ellipse(32, 46, 2.2, 2)), { ramp: r('key', 'key', 'keyDk'), bevel: 1, inner: 'line', shadow: false }); cv.px(32, 53, c('outline')); cv.px(32, 54, c('outline')); },
  front(k) {
    const { cv, m, c, r } = k;
    // the helm over the whole head, one slit with the red light behind it, a grille at the mouth
    const helm = m().ellipse(32, 24, 19, 21).ellipse(32, 36, 16.5, 14);
    cv.part(helm, { ramp: r('topHi', 'top', 'topSh'), bevel: 7, inner: 'line' });
    cv.part(m().rect(14, 20, 36, 3), { ramp: r('trimHi', 'trim', 'trimSh'), bevel: 1, inner: 'line', shadow: false });
    cv.line(32, 4, 32, 20, (X, Y) => cv.shade(X, Y, 1));
    cv.part(m().rect(18, 24, 28, 4), { ramp: r('outline', 'outline', 'outline'), bevel: 0, inner: 'none', shadow: false });
    for (let x = 21; x <= 43; x += 4) { cv.px(x, 25, c('eye')); cv.px(x, 26, c('eye')); } cv.px(25, 25, c('eyeHi')); cv.px(39, 25, c('eyeHi'));
    for (let x = 27; x <= 37; x += 2) cv.line(x, 38, x, 46, (X, Y) => cv.px(X, Y, c('outline')));
    for (const [x, y] of [[16, 30], [48, 30], [17, 42], [47, 42]]) cv.px(x, y, c('trimHi'));
  },
});
