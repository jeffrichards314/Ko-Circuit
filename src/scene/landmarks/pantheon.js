// Landmarks of the Pantheon (spec §19 G4, §18 A7): the seven landings of the climb and the gate of light.
import { landPalette } from '../gfx.js';

const wave = (t, p, a = 1) => Math.sin((t / p) * Math.PI * 2) * a;
const blink = (t, n, on = 1) => Math.floor(t / n) % (on + 1) === 0;

// ---------------------------------------------------------------- P1: the Gate of Dawn
const p1 = {
  id: 'p1', name: 'GATE OF DAWN', h: 36,
  pal: landPalette('lm.p1', {
    marble: [30, 29, 27], marbleHi: [31, 31, 30], marbleSh: [21, 20, 21], marbleDk: [13, 12, 16],
    sun: [31, 27, 8], sunHi: [31, 31, 20], sunSh: [30, 18, 6], rose: [31, 20, 16],
    gold: [31, 24, 4], goldSh: [20, 13, 2], sky: [27, 15, 15], dark: [10, 8, 14],
  }),
  draw(g) {
    const t = g.t;
    // the low gold sun rising behind the gate
    g.disc(0, -12, 13, 'sunSh'); g.disc(0, -12, 10, 'sun'); g.disc(0, -12, 6, 'sunHi');
    for (let i = 0; i < 9; i++) { const a = -Math.PI + (i / 8) * Math.PI, r = 15 + (blink(t + i * 9, 30, 1) ? 3 : 0); g.line(Math.cos(a) * 14, -12 + Math.sin(a) * 14, Math.cos(a) * r, -12 + Math.sin(a) * r, 'sun'); }
    // the gate: two piers and a lintel
    g.box(-15, -30, 6, 30, 'marble'); g.box(9, -30, 6, 30, 'marble');
    g.box(-17, -33, 34, 4, 'marbleHi'); g.box(-17, -29, 34, 1, 'marbleSh', { flat: true });
    g.box(-16, -3, 32, 3, 'marbleSh');
    g.poly([[-6, -33], [0, -39], [6, -33]], 'gold');
    // steps rising to the gate
    for (let i = 0; i < 5; i++) g.box(-14 + i * 0.5, -i * 1.6 - 1.6, 28 - i, 1.6, i & 1 ? 'marble' : 'marbleHi', { flat: true });
    // two sentinels
    for (const s of [-1, 1]) { const x = s * 22; g.box(x - 2, -18, 4, 18, 'marbleSh'); g.disc(x, -21, 2.4, 'marble'); g.box(x - 3, -18, 6, 2, 'marble', { flat: true }); g.line(x + s * 3, -17, x + s * 3, -8, 'gold'); }
    // petals drifting
    for (let i = 0; i < 9; i++) g.px(-20 + ((i * 17 + t * 0.4) % 44), -40 + ((i * 11 + t * 0.7) % 44), 'rose');
  },
};

// ---------------------------------------------------------------- P2: the Cloud Terrace
const p2 = {
  id: 'p2', name: 'CLOUD TERRACE', h: 32,
  pal: landPalette('lm.p2', {
    cloud: [31, 30, 31], cloudHi: [31, 31, 31], cloudSh: [22, 24, 30], cloudDk: [15, 17, 26],
    rope: [28, 6, 8], post: [19, 20, 26], canvas: [24, 26, 31], gold: [31, 25, 6],
    chime: [12, 26, 28], feather: [31, 29, 20], ink: [8, 10, 20],
  }),
  draw(g) {
    const t = g.t, bob = wave(t, 120, 0.8);
    // the cloud: stacked puffs, lit on top, blue-grey underneath
    for (const [x, y, r] of [[-15, -6, 8], [-6, -10, 10], [7, -9, 10], [16, -5, 8], [0, -5, 12]]) g.disc(x, y + bob * 0.3, r, 'cloudSh');
    for (const [x, y, r] of [[-15, -8, 7], [-6, -13, 9], [7, -12, 9], [16, -8, 7], [0, -9, 11]]) g.disc(x, y + bob * 0.3, r, 'cloud');
    g.box(-14, -6 + bob * 0.3, 28, 4, 'cloudSh', { flat: true });
    // the ring on it
    g.box(-9, -21 + bob * 0.3, 18, 2, 'canvas', { flat: true });
    for (const x of [-9, 8]) g.box(x, -29 + bob * 0.3, 1.4, 9, 'post', { flat: true });
    for (const y of [-27, -24]) g.line(-9, y + bob * 0.3, 9, y + bob * 0.3, 'rope');
    // the wind chime: bars swinging
    g.line(0, -36, 0, -30, 'ink'); for (let i = 0; i < 4; i++) g.box(-3 + i * 2 + wave(t + i * 11, 50, 0.6), -30 + (i & 1), 1, 5 - (i & 1) * 2, 'chime', { flat: true });
    // feathers
    for (let i = 0; i < 3; i++) g.box(-20 + ((t * 0.25 + i * 19) % 40), -36 + ((t * 0.35 + i * 13) % 30), 2, 1, 'feather', { flat: true });
  },
};

// ---------------------------------------------------------------- P3: the Hall of Heroes
const p3 = {
  id: 'p3', name: 'HALL OF HEROES', h: 38,
  pal: landPalette('lm.p3', {
    col: [21, 24, 30], colHi: [28, 30, 31], colSh: [12, 14, 22], dark: [4, 5, 12],
    ghost: [18, 26, 31], ghostHi: [26, 31, 31], gold: [31, 24, 5], red: [26, 6, 8], blue: [8, 12, 28],
    frame: [24, 19, 8], ink: [2, 3, 8],
  }),
  draw(g) {
    const t = g.t;
    g.box(-22, -26, 44, 26, 'dark');
    g.box(-24, -30, 48, 4, 'col'); g.poly([[-24, -30], [0, -40], [24, -30]], 'colSh');
    g.poly([[-19, -31], [0, -38], [19, -31]], 'dark');
    for (let i = 0; i < 7; i++) g.box(-22 + i * 7.3, -26, 3, 26, 'col');
    // banners of the eras, and framed portraits that shimmer
    for (let i = 0; i < 6; i++) { const x = -19 + i * 7.3; g.box(x, -25, 4.3, 7, ['red', 'blue', 'gold'][i % 3], { flat: true }); g.box(x + 0.5, -15, 3.3, 5, 'frame', { flat: true }); g.box(x + 1, -14.2, 2.3, 3.5, (t + i * 12) % 60 < 30 ? 'ghost' : 'ghostHi', { flat: true }); }
    // a ghostly glow in the doorway
    g.glow(0, -7, 9, 'ghostHi', 0.35);
    g.box(-3, -9, 6, 9, 'ghost', { flat: true }); g.box(-1.5, -7, 3, 7, 'ghostHi', { flat: true });
    g.box(-24, 0, 48, 2, 'colSh');
  },
};

// ---------------------------------------------------------------- P4: the Starfield observatory
const p4 = {
  id: 'p4', name: 'STARFIELD', h: 38,
  pal: landPalette('lm.p4', {
    dome: [18, 20, 30], domeHi: [26, 28, 31], domeSh: [10, 11, 20], tower: [12, 13, 22], towerHi: [17, 18, 28], towerSh: [7, 8, 14],
    slit: [3, 3, 8], gold: [31, 25, 6], star: [31, 31, 24], star2: [20, 26, 31], tube: [22, 22, 26], line: [10, 14, 26],
  }),
  draw(g) {
    const t = g.t;
    // a constellation drawing itself in the sky
    const pts = [[-20, -30], [-12, -36], [-3, -32], [6, -38], [15, -33], [21, -40]];
    const n = 1 + Math.floor(((t % 200) / 200) * pts.length * 1.4);
    for (let i = 0; i < Math.min(n, pts.length); i++) { g.box(pts[i][0] - 1, pts[i][1] - 1, 2, 2, blink(t + i * 5, 14, 1) ? 'star' : 'star2', { flat: true }); if (i) g.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], 'line'); }
    // the tower and the dome with its slit, the telescope pointing out
    g.box(-13, -16, 26, 16, 'tower');
    if (g.big) for (let y = -15; y < 0; y += 3) g.nat(-13, y, 26, 1, 'towerSh');
    g.box(-15, -18, 30, 3, 'towerHi');
    g.dome(0, -18, 14, 12, 'dome');
    g.box(-2, -30, 4, 12, 'slit');
    const a = -0.9 + wave(t, 300, 0.25);
    g.line(0, -20, Math.cos(a) * 16, -20 + Math.sin(a) * 16, 'tube', 2); g.px(Math.cos(a) * 16, -20 + Math.sin(a) * 16, 'star');
    g.box(-3, -8, 6, 8, 'slit'); g.box(-2, -7, 4, 3, blink(t, 40, 3) ? 'gold' : 'star2', { flat: true });
    for (let i = 0; i < 3; i++) g.box(-9 + i * 8, -13, 2, 3, 'gold', { flat: true });
  },
};

// ---------------------------------------------------------------- P5: the Thunder Forge
const p5 = {
  id: 'p5', name: 'THUNDER FORGE', h: 44,
  pal: landPalette('lm.p5', {
    stone: [12, 11, 14], stoneHi: [18, 17, 20], stoneSh: [6, 6, 9], iron: [10, 11, 15], ironHi: [19, 20, 25],
    fire: [31, 14, 3], fireHi: [31, 26, 8], ember: [31, 6, 3], smoke: [8, 7, 10], bolt: [31, 31, 20], boltHi: [31, 31, 31],
  }),
  draw(g) {
    const t = g.t;
    // the great anvil crowning a smithy of stone
    g.box(-19, -14, 38, 14, 'stone');
    if (g.big) for (let y = -13; y < 0; y += 2) g.nat(-19, y, 38, 1, 'stoneSh');
    g.box(-8, -22, 16, 8, 'iron'); g.poly([[-8, -22], [-8, -25], [-22, -22]], 'iron'); g.box(-6, -25, 12, 3, 'ironHi');
    g.poly([[8, -22], [18, -24], [18, -21], [8, -19]], 'iron');
    // the forge mouth, glowing and breathing
    g.box(-7, -12, 14, 12, 'stoneSh'); g.dome(0, -12, 7, 5, 'stoneSh');
    const br = 1 + Math.floor(wave(t, 60, 1.4) + 1.4);
    g.box(-5, -8, 10, 8, 'ember'); g.box(-4, -6 - br * 0.3, 8, 6 + br * 0.3, 'fire'); g.box(-2.5, -4, 5, 4, 'fireHi', { flat: true });
    if (g.lit) g.glow(0, -6, 14, 'fire', 0.35);
    // the chimneys and smoke
    g.box(-16, -28, 5, 14, 'stoneHi'); g.box(11, -30, 5, 16, 'stoneHi');
    for (let i = 0; i < 6; i++) { const y = -32 - ((t * 0.3 + i * 8) % 22); g.ellipse(-13.5 + Math.sin(i + t / 30) * 2, y, 2 + i * 0.3, 1.5, 'smoke'); }
    // lightning hitting the anvil now and then
    const fl = t % 130;
    if (fl < 7) { g.line(2, -50, -3, -40, 'boltHi', 2); g.line(-3, -40, 1, -38, 'boltHi', 2); g.line(1, -38, -2, -25, 'boltHi', 2); }
    for (let i = 0; i < 6; i++) g.px(-4 + ((i * 13 + t) % 10), -24 - ((i * 7 + t * 0.9) % 12), i & 1 ? 'fireHi' : 'ember');
  },
};

// ---------------------------------------------------------------- P6: the Mirror Sanctum
const p6 = {
  id: 'p6', name: 'MIRROR SANCTUM', h: 36,
  pal: landPalette('lm.p6', {
    glass: [22, 27, 31], glassHi: [31, 31, 31], glassSh: [12, 16, 27], glassDk: [7, 8, 20],
    lav: [22, 20, 31], base: [14, 15, 24], glint: [31, 31, 28], water: [8, 10, 24], waterHi: [15, 19, 29],
  }),
  draw(g) {
    const t = g.t;
    // crystal spires: each facet a light and a dark triangle
    const spire = (x, w, h, dy, flip) => {
      const s = flip ? -1 : 1, y0 = flip ? 0 : 0;
      g.poly([[x - w / 2, y0], [x, y0 - s * h], [x, y0]], flip ? 'glassSh' : 'glass');
      g.poly([[x + w / 2, y0], [x, y0 - s * h], [x, y0]], flip ? 'glassDk' : 'glassSh');
      if (!flip) g.poly([[x - w / 2, y0], [x - w / 4, y0 - s * (h * 0.55)], [x, y0 - s * h]], 'glassHi');
      void dy;
    };
    for (const flip of [false, true]) {
      if (flip) { for (let j = 0; j < 22; j++) if ((j & 1) === 0 || j > 14) { /* the water: rows of ripples over the reflection */ } }
      spire(-15, 8, 18, 0, flip); spire(15, 8, 16, 0, flip); spire(-7, 10, 26, 0, flip); spire(8, 10, 24, 0, flip); spire(0, 12, 34, 0, flip);
    }
    // the floor is a mirror: the reflection is cut in dithered bands, the ripple sliding
    g.box(-24, 0, 48, 1, 'lav', { flat: true });
    for (let j = 1; j < 20; j += 2) g.dither(-24, j, 48, 1, 'water', 0.55 + wave(t + j * 9, 80, 0.15));
    g.dither(-24, 1, 48, 19, 'water', 0.35);
    for (let i = 0; i < 4; i++) if (blink(t + i * 17, 25, 3)) g.px(-14 + i * 9, -8 - i * 4, 'glint');
    g.box(-20, -1, 40, 1, 'base', { flat: true });
  },
};

// ---------------------------------------------------------------- P7: the Summit
const p7 = {
  id: 'p7', name: 'THE SUMMIT', h: 46,
  pal: landPalette('lm.p7', {
    peak: [26, 28, 31], peakHi: [31, 31, 31], peakSh: [15, 17, 27], rock: [14, 13, 19], rockSh: [8, 7, 12],
    marble: [31, 30, 27], marbleSh: [22, 21, 22], gold: [31, 25, 6], beam: [31, 31, 24], cloud: [27, 26, 31],
    wing: [31, 31, 31], wingSh: [22, 24, 31],
  }),
  draw(g) {
    const t = g.t;
    // the mountain
    g.poly([[-24, 0], [-6, -26], [0, -34], [8, -24], [24, 0]], 'rock');
    g.poly([[-6, -26], [0, -34], [8, -24], [3, -22], [-1, -25], [-3, -21]], 'peak');
    g.poly([[0, -34], [8, -24], [3, -22]], 'peakSh');
    g.poly([[-24, 0], [-14, -12], [-8, 0]], 'rockSh');
    // the little temple on the top
    g.box(-6, -40, 12, 6, 'marble'); g.poly([[-7, -40], [0, -45], [7, -40]], 'marbleSh');
    for (let i = 0; i < 4; i++) g.box(-5 + i * 3.3, -40, 1, 6, 'marbleSh', { flat: true });
    // a pair of wings folded over the summit and the beam to the gate
    g.poly([[-6, -36], [-15, -44], [-13, -38], [-8, -32]], 'wing'); g.poly([[6, -36], [15, -44], [13, -38], [8, -32]], 'wing');
    g.line(-13, -42, -8, -34, 'wingSh'); g.line(13, -42, 8, -34, 'wingSh');
    for (let y = 0; y < 30; y += 2) g.box(-0.5 + wave(t + y * 4, 60, 0.4), -46 - y, 1, 1, (y + (t >> 2)) % 6 < 3 ? 'beam' : 'gold', { flat: true });
    // clouds streaming past its shoulders
    for (let i = 0; i < 3; i++) { const x = -22 + ((t * 0.12 + i * 22) % 48); g.box(x, -14 - i * 5, 9 + i * 2, 2, 'cloud', { flat: true }); }
  },
};

// ---------------------------------------------------------------- HALCYON: the gate of light
const halcyon = {
  id: 'halcyon', name: 'GATE OF LIGHT', h: 44,
  pal: landPalette('lm.halcyon', {
    white: [31, 31, 31], gold: [31, 27, 8], goldHi: [31, 31, 20], goldSh: [24, 15, 3], pier: [30, 28, 24], pierSh: [21, 19, 19],
    ray: [31, 30, 18], sky: [30, 24, 12], rose: [31, 18, 12],
  }),
  draw(g) {
    const t = g.t;
    // rays fanning out of the gate, turning slowly
    for (let i = 0; i < 13; i++) { const a = -Math.PI + (i / 12) * Math.PI + wave(t, 400, 0.03), r0 = 12, r1 = 30 + (i % 3) * 6; g.line(Math.cos(a) * r0, -20 + Math.sin(a) * r0, Math.cos(a) * r1, -20 + Math.sin(a) * r1, i & 1 ? 'ray' : 'goldHi'); }
    // the sun-disc in the arch, in stepped rings
    g.disc(0, -20, 14, 'goldSh'); g.disc(0, -20, 11, 'gold'); g.disc(0, -20, 7, 'goldHi'); g.disc(0, -20, 4, 'white');
    // two piers, an arch of light over them
    g.box(-19, -34, 5, 34, 'pier'); g.box(14, -34, 5, 34, 'pier');
    g.box(-19, -34, 1, 34, 'pierSh', { flat: true });
    g.box(-21, -37, 9, 3, 'gold'); g.box(12, -37, 9, 3, 'gold');
    g.box(-14, -36, 28, 2, 'goldHi', { flat: true });
    g.box(-12, -3, 24, 3, 'pierSh');
    for (let i = 0; i < 5; i++) g.box(-9 + i * 4.4, -2 - i * 0.2, 2, 2, 'white', { flat: true });
    if (g.lit) g.glow(0, -20, 26, 'goldHi', 0.32);
    for (let i = 0; i < 8; i++) g.px(-18 + ((i * 19 + t * 0.6) % 36), -6 - ((i * 13 + t * 0.9) % 38), i & 1 ? 'white' : 'ray');
  },
};

export const PANTHEON_LANDMARKS = { p1, p2, p3, p4, p5, p6, p7, halcyon };
