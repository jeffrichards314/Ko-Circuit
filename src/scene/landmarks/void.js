// Landmarks of the Void (spec §19 G4, §18 A7): floating fragments, ZERO's ring and Dash's floating gym.
import { landPalette } from '../gfx.js';

const wave = (t, p, a = 1) => Math.sin((t / p) * Math.PI * 2) * a;
const blink = (t, n, on = 1) => Math.floor(t / n) % (on + 1) === 0;

// a broken slab of pale stone, more of it missing higher up: the fragment every Void landmark stands on
function fragment(g, key, hi, sh, w = 22, bob = 0) {
  const b = bob;
  g.box(-w, -3 + b, w * 2, 3, key);
  g.box(-w, -3 + b, w * 2, 1, hi, { flat: true });
  g.poly([[-w, b], [w, b], [w * 0.6, 7 + b], [w * 0.1, 11 + b], [-w * 0.4, 6 + b]], sh);
  g.poly([[-w * 0.5, b + 4], [-w * 0.2, b + 4], [-w * 0.35, b + 13]], hi);
  for (let i = 0; i < 4; i++) g.box(-w - 4 + i * 5 + (i & 1) * 34, 14 + i * 3 + b, 2 + (i & 1), 2, sh, { flat: true });
}

// ---------------------------------------------------------------- V1: the Fundamentals
const v1 = {
  id: 'v1', name: 'THE FUNDAMENTALS', h: 34,
  pal: landPalette('lm.v1', {
    stone: [22, 22, 27], stoneHi: [29, 29, 31], stoneSh: [10, 10, 17], pil: [12, 24, 31], pilHi: [24, 31, 31], pilSh: [5, 12, 22], glow: [10, 24, 31], dark: [2, 2, 6],
  }),
  draw(g) {
    const t = g.t, b = wave(t, 180, 1.4);
    fragment(g, 'stone', 'stoneHi', 'stoneSh', 22, b);
    // four pillars, one for each of the basics: a slanted dodge, a shield-shaped block, a low duck, an X counter
    const P = (x) => x + b * 0;
    g.poly([[P(-18), -3 + b], [P(-14), -3 + b], [P(-10), -22 + b], [P(-14), -22 + b]], 'pil');           // dodge: leaning
    g.box(P(-7), -18 + b, 6, 15, 'pil'); g.tri(P(-7), -3 + b, P(-1), -3 + b, P(-4), 0 + b, 'pil');       // block: a shield
    g.box(P(2), -8 + b, 7, 5, 'pil'); g.box(P(2), -8 + b, 7, 1, 'pilHi', { flat: true });               // duck: low
    g.line(P(12), -3 + b, P(18), -20 + b, 'pil', 2); g.line(P(18), -3 + b, P(12), -20 + b, 'pil', 2);   // counter: an X
    for (let i = 0; i < 4; i++) g.box(P(-16 + i * 9), -26 + b - (blink(t + i * 9, 30, 1) ? 1 : 0), 2, 2, 'pilHi', { flat: true });
    if (g.lit) g.glow(0, -12 + b, 22, 'glow', 0.18);
  },
};

// ---------------------------------------------------------------- V2: the Senses
const v2 = {
  id: 'v2', name: 'THE SENSES', h: 34,
  pal: landPalette('lm.v2', {
    stone: [24, 22, 20], stoneHi: [31, 30, 26], stoneSh: [12, 10, 10], gold: [31, 25, 7], goldHi: [31, 31, 18], goldSh: [20, 13, 2], dark: [2, 1, 2], white: [31, 31, 31],
  }),
  draw(g) {
    const t = g.t, b = wave(t, 200, 1.4);
    fragment(g, 'stone', 'stoneHi', 'stoneSh', 22, b);
    // an eye standing on the slab, and an ear that is a spiral
    g.ellipse(-8, -14 + b, 9, 5, 'white'); g.disc(-8 + wave(t, 90, 2), -14 + b, 3.4, 'gold'); g.disc(-8 + wave(t, 90, 2), -14 + b, 1.5, 'dark'); g.px(-8 + wave(t, 90, 2) - 1, -15 + b, 'white');
    g.ellipse(-8, -14 + b, 9, 5, 'goldSh', { flat: true });
    if (blink(t, 100, 3)) { g.box(-17, -16 + b, 18, 3, 'stoneSh', { flat: true }); }
    for (let a = 0; a < 26; a++) { const q = a * 0.55, r = 1.2 + a * 0.28; g.px(12 + Math.cos(q) * r, -14 + b + Math.sin(q) * r * 1.2, a & 1 ? 'gold' : 'goldHi'); }
    // sound: rings going out from the ear
    for (let i = 0; i < 2; i++) { const r = ((t * 0.25 + i * 12) % 24); for (let a = 0; a < 10; a++) { const q = (a / 10) * Math.PI * 2; g.px(12 + Math.cos(q) * r, -14 + b + Math.sin(q) * r, 'goldSh'); } }
    if (g.lit) g.glow(0, -14 + b, 22, 'gold', 0.14);
  },
};

// ---------------------------------------------------------------- V3: the Mind
const v3 = {
  id: 'v3', name: 'THE MIND', h: 34,
  pal: landPalette('lm.v3', {
    stone: [20, 18, 24], stoneHi: [27, 25, 31], stoneSh: [9, 7, 15], mag: [30, 9, 26], magHi: [31, 22, 31], magSh: [17, 3, 16], dark: [2, 1, 5], white: [31, 31, 31],
  }),
  draw(g) {
    const t = g.t, b = wave(t, 190, 1.4);
    fragment(g, 'stone', 'stoneHi', 'stoneSh', 22, b);
    // a ring turning over the slab, an hourglass in it, a knot of thought above
    for (let a = 0; a < 40; a++) { const q = (a / 40) * Math.PI * 2 + t / 90; g.box(Math.cos(q) * 13 - 0.7, -17 + b + Math.sin(q) * 5.5 * 1.0, 1.6, 1.6, a % 5 ? 'mag' : 'magHi', { flat: true }); }
    g.poly([[-3, -22 + b], [3, -22 + b], [0, -17 + b]], 'magHi'); g.poly([[-3, -12 + b], [3, -12 + b], [0, -17 + b]], 'magHi');
    for (let i = 0; i < 6; i++) g.box(-0.5 + wave(t + i * 11, 30, 0.5), -12 + b + i * 0.6 * (blink(t + i * 7, 20, 2) ? 1 : 0), 1, 1, 'white', { flat: true });
    for (let i = 0; i < 10; i++) { const q = i * 0.9 + t / 60, r = 3 + i * 0.9; g.px(Math.cos(q) * r, -28 + b + Math.sin(q) * r * 0.6, i & 1 ? 'mag' : 'magHi'); }
    if (g.lit) g.glow(0, -17 + b, 20, 'mag', 0.16);
  },
};

// ---------------------------------------------------------------- ZERO true: the ring
const zeroTrue = {
  id: 'zeroTrue', name: 'ZERO', h: 40,
  pal: landPalette('lm.zeroTrue', {
    white: [31, 31, 31], grey: [20, 20, 25], greyDk: [9, 9, 15], dark: [0, 0, 1], glow: [27, 27, 31],
  }),
  draw(g) {
    const t = g.t;
    // a ring of white, its middle black; the ring is drawn in pieces that drift a little further apart over time
    for (let a = 0; a < 48; a++) {
      const q = (a / 48) * Math.PI * 2, r = 16 + Math.sin(a * 2.1 + t / 40) * 0.8;
      g.box(Math.cos(q) * r - 1.4, -22 + Math.sin(q) * r * 1.15 - 1.4, 2.8, 2.8, (a + (t >> 3)) % 6 === 0 ? 'grey' : 'white', { flat: true });
    }
    g.ellipse(0, -22, 12, 14, 'dark');
    for (let i = 0; i < 9; i++) g.px(-16 + ((i * 29 + t * 0.2) % 32), -44 + ((i * 17) % 44), i & 1 ? 'grey' : 'glow');
    g.box(-1, -22, 2, 1, blink(t, 90, 1) ? 'dark' : 'greyDk', { flat: true });
  },
};

// ---------------------------------------------------------------- Dash Unbound: the gym, floating
const gymFloat = {
  id: 'gymFloat', name: 'THE OLD GYM', h: 34,
  pal: landPalette('lm.gym', {
    wall: [14, 10, 12], wallHi: [20, 15, 16], wallSh: [8, 5, 8], roof: [6, 7, 12], roofHi: [11, 12, 19],
    lite: [30, 28, 16], dark: [2, 1, 4], stone: [18, 18, 24], stoneSh: [8, 8, 14], teal: [4, 24, 22], sign: [28, 8, 8],
  }),
  draw(g) {
    const t = g.t, b = wave(t, 210, 1.6), tilt = 3;
    // a chunk of floor and the gym on it, tilted a little as if it were adrift
    g.poly([[-20, -3 + b - tilt], [20, -3 + b + tilt], [14, 7 + b], [2, 12 + b], [-12, 6 + b]], 'stone');
    g.poly([[-2, 5 + b], [14, 6 + b], [2, 12 + b]], 'stoneSh');
    const ty = (x) => b - tilt + ((x + 20) / 40) * tilt * 2;
    g.box(-15, -19 + ty(-15) - 0.0, 30, 16, 'wall');
    g.poly([[-17, -19 + ty(-15)], [-13, -25 + ty(-13)], [13, -25 + ty(13)], [17, -19 + ty(15)]], 'roof');
    g.box(-15, -19 + ty(-15), 30, 1, 'wallHi', { flat: true });
    for (let i = 0; i < 3; i++) g.box(-11 + i * 8, -14 + ty(-11 + i * 8), 5, 5, blink(t + i * 11, 30, 6) && i !== 1 ? 'lite' : 'dark', { flat: true });
    g.box(-2, -10 + ty(0), 5, 7, 'dark');
    g.box(-8, -22 + ty(-8), 16, 3, 'sign'); if (g.big) g.text('GYM', -3.5, -22.2 + ty(0), 'lite');
    g.px(14, -8 + ty(14), 'teal'); g.box(14, -9 + ty(14), 2, 2, 'teal', { flat: true });
    for (let i = 0; i < 5; i++) g.box(-24 + i * 12 + wave(t + i * 30, 90, 2), 14 + i * 3 + b, 2 + (i & 1), 2, 'stoneSh', { flat: true });
  },
};

export const VOID_LANDMARKS = { v1, v2, v3, zeroTrue, gymFloat };
