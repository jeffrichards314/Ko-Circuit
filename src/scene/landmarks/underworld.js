// Landmarks of the Underworld (spec §19 G4, §18 A7): the six shores of the descent and the throne of the King.
import { landPalette } from '../gfx.js';

const wave = (t, p, a = 1) => Math.sin((t / p) * Math.PI * 2) * a;
const blink = (t, n, on = 1) => Math.floor(t / n) % (on + 1) === 0;

// ---------------------------------------------------------------- U1: Ferryman's Shore
const u1 = {
  id: 'u1', name: "FERRYMAN'S SHORE", h: 32,
  pal: landPalette('lm.u1', {
    plank: [8, 6, 6], plankHi: [14, 11, 10], plankSh: [4, 3, 4], water: [2, 5, 10], waterHi: [8, 14, 22],
    lamp: [30, 22, 6], lampHi: [31, 30, 16], soul: [10, 27, 25], post: [9, 6, 5], fog: [10, 15, 20], hull: [6, 5, 5], ink: [1, 1, 3],
  }),
  draw(g) {
    const t = g.t;
    // black water with ripples, fog on it
    g.box(-26, -4, 52, 8, 'water');
    for (let i = 0; i < 9; i++) g.box(-24 + ((i * 11 + t * 0.15) % 48), -2 + (i % 4) * 1.6, 4 + (i & 3), 1, 'waterHi', { flat: true });
    // the jetty: planks on posts
    g.box(-24, -8, 30, 3, 'plank'); g.box(-24, -8, 30, 1, 'plankHi', { flat: true });
    for (const x of [-22, -14, -6, 2, 6]) g.box(x, -5, 1.6, 8, 'post', { flat: true });
    if (g.big) for (let x = -24; x < 6; x += 3) g.nat(x, -8, 1, 3, 'plankSh');
    // the lantern on a post
    g.box(-19, -20, 1.4, 12, 'post', { flat: true }); g.box(-21, -25, 5, 5, 'ink'); g.box(-20.4, -24.4, 3.8, 3.8, blink(t, 50, 6) ? 'lamp' : 'lampHi', { flat: true });
    if (g.lit) g.glow(-18.3, -22, 11, 'lamp', 0.4);
    // the boat coming in, a hooded figure poling
    const bx = 12 + wave(t, 200, 2);
    g.box(bx - 9, -5, 18, 3, 'hull'); g.poly([[bx - 10, -5], [bx - 8, -2], [bx + 8, -2], [bx + 10, -5]], 'hull');
    g.poly([[bx + 2, -5], [bx + 1, -14], [bx + 4, -14], [bx + 6, -5]], 'fog'); g.disc(bx + 2.6, -15.5, 2, 'hull'); g.px(bx + 2, -15.5, 'soul'); g.px(bx + 4, -15.5, 'soul');
    g.line(bx + 7, -22, bx + 9, -3, 'post');
    // a far lantern, and fog
    g.px(24, -12, 'lampHi'); g.dither(-26, -8, 52, 8, 'fog', 0.25);
  },
};

// ---------------------------------------------------------------- U2: the Ashen Fields
const u2 = {
  id: 'u2', name: 'ASHEN FIELDS', h: 34,
  pal: landPalette('lm.u2', {
    ash: [12, 11, 12], ashHi: [18, 17, 17], ashSh: [6, 5, 7], tree: [4, 3, 4], crack: [31, 12, 3], crackHi: [31, 24, 8],
    ember: [31, 6, 3], smoke: [9, 8, 10], flame: [31, 18, 4], dark: [2, 1, 3], bone: [23, 22, 20],
  }),
  draw(g) {
    const t = g.t;
    // the plain: low grey dunes, glowing cracks in it
    g.dome(-14, 0, 18, 6, 'ash'); g.dome(12, 0, 20, 8, 'ashHi'); g.dome(0, 0, 14, 4, 'ashSh', { flat: true });
    for (const [x, y, dx, dy] of [[-18, -2, 5, 1.5], [-6, -1, 4, 2], [4, -3, 6, -1], [15, -2, 5, 2]]) { g.line(x, y, x + dx, y + dy, blink(t + x, 40, 4) ? 'crackHi' : 'crack'); g.line(x + dx, y + dy, x + dx * 1.6, y + dy * 0.2, 'crack'); }
    // dead trees, bare and black
    const tree = (x, h) => { g.line(x, 0, x, -h, 'tree', 1.5); g.line(x, -h * 0.6, x - 4, -h * 0.9, 'tree'); g.line(x, -h * 0.5, x + 4, -h * 0.8, 'tree'); g.line(x - 4, -h * 0.9, x - 6, -h * 0.85, 'tree'); g.line(x, -h, x + 2, -h - 3, 'tree'); };
    tree(-20, 20); tree(-8, 14); tree(18, 24);
    // a tree on fire, and a pillar of flame
    g.line(6, 0, 6, -18, 'tree', 1.5);
    for (let i = 0; i < 7; i++) { const y = -8 - i * 2.5, w = 3.2 - i * 0.35; g.box(6 - w + wave(t + i * 8, 30, 0.9), y, w * 2, 2.6, i < 2 ? 'flame' : i < 5 ? 'ember' : 'smoke', { flat: true }); }
    if (g.lit) g.glow(6, -12, 12, 'flame', 0.35);
    // ash falling
    for (let i = 0; i < 14; i++) g.px(-26 + ((i * 23 + t * 0.3) % 52), -34 + ((i * 17 + t * 0.6) % 36), i % 3 ? 'ashHi' : 'bone');
  },
};

// ---------------------------------------------------------------- U3: the Chain Pits
const u3 = {
  id: 'u3', name: 'CHAIN PITS', h: 36,
  pal: landPalette('lm.u3', {
    iron: [11, 11, 15], ironHi: [19, 19, 25], ironSh: [5, 5, 9], rock: [8, 6, 9], rockHi: [13, 10, 13],
    glow: [28, 6, 6], glowHi: [31, 16, 8], rust: [17, 8, 4], chain: [21, 22, 26], dark: [1, 0, 2], cage: [15, 15, 19],
  }),
  draw(g) {
    const t = g.t;
    // the rim of the pit and the pit itself, a red glow far down
    g.box(-24, -6, 48, 6, 'rock'); g.box(-24, -6, 48, 1, 'rockHi', { flat: true });
    g.ellipse(0, -5, 18, 5, 'dark'); g.ellipse(0, -3, 12, 2.6, blink(t, 60, 5) ? 'glow' : 'glowHi', { flat: true });
    // a gallows crane: chains hanging into the pit, swaying
    g.box(-22, -32, 2.4, 26, 'iron', { flat: true }); g.box(-22, -32, 28, 2.4, 'iron', { flat: true });
    g.line(-20, -30, -14, -30 - 0, 'ironHi'); g.tri(-22, -26, -22, -32, -15, -32, 'ironSh');
    for (const [x, len] of [[-2, 20], [2, 16], [5, 22]]) for (let i = 0; i < len; i += 2) g.box(x + wave(t + i * 6, 90, 1.4) * (i / len), -30 + i * 1.1, i & 2 ? 1 : 2, 2, 'chain', { flat: true });
    // a cage hanging over the pit, a shape inside
    g.box(11, -22, 9, 11, 'cage'); for (let i = 0; i < 4; i++) g.box(12 + i * 2.2, -22, 0.8, 11, 'dark', { flat: true }); g.box(11, -22, 9, 1.4, 'ironSh', { flat: true }); g.box(11, -12, 9, 1.4, 'ironSh', { flat: true });
    g.line(15.5, -32, 15.5, -22, 'chain');
    // rusted gate-arc at the back
    for (let a = 0; a < 12; a++) { const q = Math.PI + (a / 11) * Math.PI; g.box(Math.cos(q) * 16 - 0.7 + 8, -24 + Math.sin(q) * 10, 1.6, 1.6, 'rust', { flat: true }); }
  },
};

// ---------------------------------------------------------------- U4: the Hall of the Fallen
const u4 = {
  id: 'u4', name: 'HALL OF THE FALLEN', h: 38,
  pal: landPalette('lm.u4', {
    stone: [9, 8, 13], stoneHi: [15, 14, 20], stoneSh: [4, 4, 8], dark: [1, 1, 3],
    flame: [10, 27, 26], flameHi: [22, 31, 30], gold: [22, 16, 5], goldSh: [11, 7, 2], bone: [22, 21, 22], crack: [2, 1, 4],
  }),
  draw(g) {
    const t = g.t;
    // a gothic hall: pointed arch, buttresses, broken spires
    g.box(-16, -22, 32, 22, 'stone');
    if (g.big) for (let y = -21; y < 0; y += 2) g.nat(-16, y, 32, 1, 'stoneSh');
    g.poly([[-16, -22], [-8, -34], [-4, -22]], 'stoneHi'); g.poly([[4, -22], [10, -30], [16, -22]], 'stoneHi'); g.poly([[-4, -22], [0, -37], [4, -22]], 'stone');
    g.box(-22, -12, 6, 12, 'stoneSh'); g.box(16, -14, 6, 14, 'stoneSh');
    // the doorway with teal flame within
    g.box(-6, -14, 12, 14, 'dark'); g.dome(0, -14, 6, 6, 'dark');
    for (let i = 0; i < 4; i++) { const x = -4 + i * 2.6, h = 5 + Math.sin(t / 8 + i * 2) * 1.6; g.tri(x, -1, x + 1.4, -1 - h, x + 2.8, -1, i & 1 ? 'flameHi' : 'flame'); }
    // toppled champions: a statue on its side, a broken fist, a belt on the ground
    g.box(-20, -3, 9, 2.4, 'bone', { flat: true }); g.disc(-21, -2.2, 1.8, 'bone'); g.line(-11, -2, -8, -5, 'bone');
    g.box(11, -2, 7, 1.6, 'gold', { flat: true }); g.box(12, -3, 5, 1, 'goldSh', { flat: true });
    // wall sconces
    for (const x of [-11, 11]) { g.box(x - 0.5, -17, 1, 3, 'gold', { flat: true }); g.box(x - 1, -20 + (blink(t + x, 9, 1) ? 0 : 0.6), 2, 3, blink(t + x, 7, 2) ? 'flameHi' : 'flame', { flat: true }); }
    g.box(-1, -30, 2, 4, 'crack', { flat: true });
  },
};

// ---------------------------------------------------------------- U5: the Furnace
const u5 = {
  id: 'u5', name: 'THE FURNACE', h: 40,
  pal: landPalette('lm.u5', {
    brick: [15, 6, 4], brickHi: [22, 10, 6], brickSh: [8, 3, 3], iron: [8, 8, 11], ironHi: [16, 16, 20],
    fire: [31, 14, 2], fireHi: [31, 26, 8], white: [31, 31, 22], smoke: [7, 6, 8], ember: [31, 5, 3], dark: [2, 1, 3],
  }),
  draw(g) {
    const t = g.t;
    // a squat brick furnace, four chimneys and pipes
    g.box(-18, -20, 36, 20, 'brick');
    for (let y = -19; y < 0; y += 2) g.nat(-18, y, 36, 1, 'brickSh');
    g.box(-20, -22, 40, 3, 'iron'); g.box(-20, -22, 40, 1, 'ironHi', { flat: true });
    for (const x of [-15, -6, 6, 15]) { g.box(x - 2, -36, 4, 14, 'brickHi'); g.box(x - 3, -37, 6, 2, 'iron'); }
    // the mouth: molten white in the middle
    g.dome(0, -8, 9, 9, 'dark'); g.box(-9, -8, 18, 8, 'dark');
    const fl = wave(t, 40, 0.9);
    g.dome(0, -8, 7, 7 + fl, 'fire'); g.box(-7, -8, 14, 7, 'fire'); g.dome(0, -8, 4, 4 + fl * 0.5, 'fireHi'); g.box(-4, -8, 8, 5, 'fireHi'); g.box(-2, -6, 4, 4, 'white', { flat: true });
    if (g.lit) g.glow(0, -6, 20, 'fire', 0.4);
    // smoke from the chimneys, sparks from the door
    for (let i = 0; i < 8; i++) g.ellipse(-15 + (i % 4) * 10 + Math.sin(t / 30 + i) * 2, -40 - ((t * 0.3 + i * 9) % 20), 2 + (i % 3) * 0.6, 1.4, 'smoke');
    for (let i = 0; i < 8; i++) g.px(-6 + ((i * 11 + t * 0.7) % 14), -4 - ((i * 7 + t * 0.8) % 14), i & 1 ? 'fireHi' : 'ember');
    // two pipes
    g.box(-24, -12, 6, 2, 'iron', { flat: true }); g.box(18, -14, 6, 2, 'iron', { flat: true }); g.box(-24, -12, 2, 12, 'iron', { flat: true }); g.box(22, -14, 2, 14, 'iron', { flat: true });
  },
};

// ---------------------------------------------------------------- U6: the Abyss Gate
const u6 = {
  id: 'u6', name: 'ABYSS GATE', h: 44,
  pal: landPalette('lm.u6', {
    gate: [7, 6, 12], gateHi: [13, 12, 21], gateSh: [3, 3, 7], glow: [26, 3, 7], glowHi: [31, 14, 12],
    eye: [31, 27, 8], bone: [23, 22, 24], mist: [10, 8, 18], step: [10, 9, 14], dark: [1, 0, 2], rune: [22, 6, 24],
  }),
  draw(g) {
    const t = g.t;
    // two giant leaves of a black gate, ajar, a red light between them
    g.box(-20, -38, 10, 38, 'gate'); g.box(10, -38, 10, 38, 'gate');
    g.dome(0, -38, 20, 10, 'gate');
    g.dome(0, -38, 11, 6, 'gateHi', { flat: true });
    g.box(-10, -34, 20, 34, 'dark');
    g.box(-5, -30, 10, 30, blink(t, 80, 6) ? 'glow' : 'glowHi', { flat: true }); g.box(-2, -28, 4, 28, 'glowHi', { flat: true });
    if (g.lit) g.glow(0, -14, 20, 'glow', 0.45);
    // studs and runes on the leaves
    for (let j = 0; j < 4; j++) for (const x of [-16, 14]) g.box(x, -30 + j * 7, 2, 2, (t + j * 12 + (x > 0 ? 20 : 0)) % 90 < 45 ? 'rune' : 'gateHi', { flat: true });
    // the watching eye over the gate
    g.ellipse(0, -46, 6, 3, 'bone'); g.disc(wave(t, 80, 1.2), -46, 2, 'eye'); g.disc(wave(t, 80, 1.2), -46, 0.9, 'dark');
    // steps leading down into it, mist along them
    for (let i = 0; i < 4; i++) g.box(-12 + i, -i * 1.3 - 1, 24 - i * 2, 1.3, 'step', { flat: true });
    g.dither(-24, -10, 48, 10, 'mist', 0.4);
  },
};

// ---------------------------------------------------------------- VORGATH: the throne
const vorgath = {
  id: 'vorgath', name: 'THE THRONE', h: 46,
  pal: landPalette('lm.vorgath', {
    black: [2, 1, 4], blackHi: [8, 5, 11], blackSh: [1, 0, 2], red: [30, 4, 6], redHi: [31, 16, 10], redDk: [15, 2, 4],
    bone: [20, 16, 14], gold: [21, 14, 4], mist: [10, 3, 8], step: [7, 5, 9],
  }),
  draw(g) {
    const t = g.t;
    // the huge throne: a tall crowned back of black spikes, arms, a seat
    for (let i = -4; i <= 4; i++) { const h = 30 - Math.abs(i) * 3.2 + (i & 1 ? 3 : 0); g.tri(i * 3.4 - 2, -18, i * 3.4, -18 - h + 10, i * 3.4 + 2, -18, 'black'); }
    g.box(-14, -32, 28, 30, 'black');
    g.box(-14, -32, 28, 2, 'blackHi', { flat: true }); g.box(-14, -32, 2, 30, 'blackHi', { flat: true });
    g.box(-19, -14, 7, 14, 'black'); g.box(12, -14, 7, 14, 'black');
    g.box(-12, -12, 24, 4, 'blackSh'); g.box(-14, -4, 28, 4, 'black');
    // two red eyes in the dark of the back, a crown of red at its top
    const e = blink(t, 70, 6) ? 'red' : 'redHi';
    g.box(-8, -24, 5, 2, e, { flat: true }); g.box(3, -24, 5, 2, e, { flat: true });
    g.box(-10, -22, 4, 1, 'red', { flat: true }); g.box(6, -22, 4, 1, 'red', { flat: true });
    g.box(-6, -34, 12, 2, 'red', { flat: true });
    if (g.lit) { g.glow(-5.5, -23, 6, 'red', 0.5); g.glow(5.5, -23, 6, 'red', 0.5); }
    // steps and skulls around the foot
    for (let i = 0; i < 3; i++) g.box(-18 + i * 2, i * 1.2 - 1, 36 - i * 4, 1.2, 'step', { flat: true });
    for (const x of [-16, 16]) { g.disc(x, -3, 2, 'bone'); g.px(x - 1, -3, 'black'); g.px(x + 1, -3, 'black'); }
    g.dither(-24, -6, 48, 6, 'mist', 0.45);
  },
};

export const UNDERWORLD_LANDMARKS = { u1, u2, u3, u4, u5, u6, vorgath };
