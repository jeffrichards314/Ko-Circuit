// The landmarks only the world map has (spec §19 G4): the home gym, the Gauntlet tower, the Title Defense belt hall, the sky gate, the chasm
// and the door to the Void. Same kit as the circuits' landmarks (src/scene/gfx.js): units around the middle of the ground line, one palette of
// at most 15 colours each, stepped shading only.
import { landPalette } from '../scene/gfx.js';

const blink = (t, n, on = 1) => Math.floor(t / n) % (on + 1) === 0;

// ---------------------------------------------------------------- HOME: the gym you train in, with a glove on the roof
const home = {
  id: 'home', name: 'HOME GYM', h: 36,
  pal: landPalette('lm.home', {
    brick: [22, 10, 8], brickHi: [27, 15, 12], brickSh: [14, 6, 5],
    roof: [8, 11, 18], roofHi: [13, 17, 25], roofSh: [4, 6, 11],
    glass: [8, 16, 22], lite: [30, 29, 20], door: [10, 6, 4], glove: [28, 5, 7], gloveHi: [31, 14, 14],
    ink: [3, 2, 4], grey: [18, 18, 20], smoke: [24, 24, 26],
  }),
  draw(g) {
    const t = g.t;
    g.box(-15, -16, 30, 16, 'brick');
    if (g.big) for (let y = -15; y < 0; y += 1.5) { g.nat(-15, y, 30, 1, 'brickSh'); for (let x = -15 + (Math.round(y / 1.5) & 1 ? 0 : 2); x < 15; x += 4) g.nat(x, y, 1, 4, 'brickSh'); }
    g.poly([[-18, -16], [0, -25], [18, -16]], 'roof');
    g.poly([[-14, -16], [0, -23], [0, -16]], 'roofHi');
    // a chimney with a thread of smoke
    g.box(8, -27, 4, 9, 'brick');
    for (let i = 0; i < 3; i++) g.dot(9 + Math.sin((t + i * 13) / 20) * 2, -29 - i * 3 - ((t >> 3) % 3), 'smoke');
    // the glove on the roof
    g.ellipse(-3, -29, 6, 5, 'glove'); g.box(-8, -26, 10, 4, 'glove'); g.ellipse(-5, -31, 2.5, 2, 'gloveHi'); g.box(-8, -24, 10, 1, 'ink', { flat: true });
    // the window and the door under a little awning
    g.box(-12, -12, 6, 6, 'glass'); g.box(-11.5, -11.5, 5, 5, blink(t, 40, 6) ? 'lite' : 'glass', { flat: true });
    g.box(2, -11, 7, 11, 'door'); g.box(2, -12, 7, 2, 'glove');
    for (let i = 0; i < 3; i++) g.box(2 + i * 2.4, -12, 1.2, 2, 'lite', { flat: true });
    g.dot(7, -5, 'lite');
    // the heavy bag on its chain
    g.box(-19, -14, 1, 4, 'grey', { flat: true }); g.box(-21, -10, 5, 9, 'glove'); g.box(-21, -10, 1, 9, 'gloveHi', { flat: true });
  },
};

// ---------------------------------------------------------------- THE GAUNTLET: a tall tower of a hundred fights, one torch to a floor
const gauntlet = {
  id: 'gauntlet', name: 'THE GAUNTLET', h: 50,
  pal: landPalette('lm.gauntlet', {
    stone: [11, 10, 14], stoneHi: [17, 16, 20], stoneSh: [6, 6, 9],
    trim: [20, 6, 7], trimSh: [12, 2, 4], fire: [31, 20, 4], fireHi: [31, 30, 14], glow: [31, 26, 8],
    bone: [29, 28, 24], ink: [2, 1, 3], dark: [4, 3, 6], banner: [24, 4, 6], bannerSh: [15, 2, 4],
  }),
  draw(g) {
    const t = g.t;
    // a stack of three tiers, narrowing
    g.box(-14, -12, 28, 12, 'stone'); g.box(-11, -28, 22, 16, 'stone'); g.box(-8, -44, 16, 16, 'stone');
    for (const [y, w] of [[-12, 30], [-28, 24], [-44, 18]]) { g.box(-w / 2, y - 2, w, 2, 'trim'); for (let x = -w / 2; x < w / 2; x += 4) g.box(x, y - 4, 2, 2, 'stoneHi', { flat: true }); }
    // slit windows with a fire behind each
    for (const [x, y] of [[-9, -8], [5, -8], [-6, -24], [2, -24], [-3, -40]]) { g.box(x, y, 3, 5, 'dark', { flat: true }); g.box(x + 0.5, y + 1, 2, 3, blink(t + x * 5, 9, 3) ? 'fire' : 'glow', { flat: true }); }
    // the door with a skull over it
    g.box(-3, -8, 6, 8, 'dark'); g.box(-3.5, -9, 7, 1.5, 'trim');
    g.ellipse(0, -14, 2.5, 2.2, 'bone'); g.box(-1.6, -13, 3.2, 2, 'bone'); g.dot(-1.5, -14.5, 'ink'); g.dot(0.5, -14.5, 'ink');
    // torches on the top, and a banner
    for (const x of [-9, 8]) { g.box(x, -49, 2, 5, 'stoneSh', { flat: true }); g.ellipse(x + 1, -51 + Math.sin(t / 6 + x) * 0.7, 2, 3, blink(t + x, 4, 1) ? 'fire' : 'fireHi'); }
    g.box(10, -40, 6, 9, 'banner'); g.poly([[10, -31], [13, -28], [16, -31]], 'banner'); g.dot(12.5, -37, 'bone');
  },
};

// ---------------------------------------------------------------- TITLE DEFENSE: the belt hall, a gold dome and a belt the size of a door
const tdhall = {
  id: 'tdhall', name: 'BELT HALL', h: 42,
  pal: landPalette('lm.tdhall', {
    wall: [29, 27, 22], wallHi: [31, 30, 27], wallSh: [21, 19, 16], gold: [31, 24, 4], goldHi: [31, 30, 14], goldSh: [20, 13, 2],
    red: [24, 4, 6], redSh: [14, 2, 4], ink: [3, 2, 4], dark: [8, 6, 10], strap: [9, 6, 5], gem: [8, 26, 28], sky: [14, 18, 27],
  }),
  draw(g) {
    const t = g.t;
    g.box(-18, -16, 36, 16, 'wall');
    g.box(-20, -18, 40, 3, 'wallSh'); for (const x of [-16, -8, 8, 15]) g.box(x, -16, 2.5, 16, 'wallHi');
    g.dome(0, -18, 14, 13, 'gold'); g.dome(0, -18, 9, 9, 'goldHi'); g.box(-1, -36, 2, 5, 'goldSh'); g.dot(-0.5, -38, blink(t, 8, 2) ? 'goldHi' : 'gold');
    // the belt across the front: a strap and a big plate with a gem
    g.box(-17, -9, 34, 5, 'strap'); g.box(-17, -9, 34, 1, 'red');
    g.ellipse(0, -7, 7, 4.5, 'gold'); g.ellipse(0, -7.5, 5, 3, 'goldHi'); g.ellipse(0, -7, 2, 1.6, blink(t, 14, 1) ? 'gem' : 'red');
    g.box(-4, -5, 8, 5, 'dark'); // the door under it
    g.dot(-14, -6, 'gold'); g.dot(13, -6, 'gold');
  },
};

// ---------------------------------------------------------------- THE SKY GATE: a cloud arch at the top of the highest mountain
const skygate = {
  id: 'skygate', name: 'THE SKY GATE', h: 40,
  pal: landPalette('lm.skygate', {
    cloud: [31, 31, 31], cloudSh: [21, 24, 30], cloudDk: [14, 17, 26], gold: [31, 26, 7], goldHi: [31, 31, 20], goldSh: [22, 14, 2],
    light: [31, 31, 24], dark: [10, 11, 18], chain: [14, 14, 18], lock: [24, 18, 4], ink: [3, 2, 6],
  }),
  draw(g) {
    const t = g.t, open = g.state === 'open' || g.state === 'cleared';
    // two columns of cloud and the arch between them
    for (const x of [-12, 7]) { g.box(x, -26, 5, 26, 'cloudSh'); g.box(x, -26, 3, 26, 'cloud'); }
    g.dome(0, -22, 13, 10, 'cloud'); g.dome(0, -22, 10, 8, 'cloudSh');
    g.box(-7, -22, 14, 22, open ? 'light' : 'dark');
    if (open) { for (let i = 0; i < 6; i++) { const x = -6 + i * 2.4, o = ((t >> 2) + i * 3) % 14; g.box(x, -21 + o, 1.2, 4, 'goldHi', { flat: true }); } g.glow(0, -10, 14, 'goldHi', 0.35); }
    else {
      for (let i = 0; i < 4; i++) g.box(-7, -19 + i * 5, 14, 1, 'chain', { flat: true });
      g.box(-2.5, -12, 5, 5, 'lock'); g.box(-1.5, -16, 3, 4, 'chain', { flat: true }); g.dot(-0.5, -10, 'ink');
    }
    g.ellipse(-9, -28, 5, 3, 'cloud'); g.ellipse(9, -29, 5, 3, 'cloud'); g.ellipse(0, -33, 7, 3, 'cloud');
    g.box(-1, -37, 2, 4, 'gold'); g.dot(-0.5, -39, blink(t, 10, 2) ? 'goldHi' : 'gold');
  },
};

// ---------------------------------------------------------------- THE CHASM: where the ground gave way
const chasm = {
  id: 'chasm', name: 'THE CHASM', h: 26,
  pal: landPalette('lm.chasm', {
    rock: [14, 10, 10], rockHi: [21, 16, 15], rockSh: [7, 5, 6], ink: [1, 0, 2], lava: [29, 12, 3], lavaHi: [31, 24, 8], ash: [9, 7, 9],
  }),
  draw(g) {
    const t = g.t;
    g.ellipse(0, -6, 16, 7, 'rockSh'); g.ellipse(0, -6, 14, 5.5, 'ink'); g.ellipse(0, -4, 10, 3, 'lava');
    for (let i = 0; i < 4; i++) g.dot(-6 + i * 4 + Math.sin(t / 9 + i) * 1.5, -5 + ((t >> 3) + i) % 3, 'lavaHi');
    for (const [x, y, w, h] of [[-17, -10, 5, 6], [12, -11, 6, 7], [-8, -14, 4, 4], [5, -14, 5, 3]]) { g.box(x, y, w, h, 'rock'); g.box(x, y, w, 1, 'rockHi', { flat: true }); }
    g.glow(0, -5, 18, 'lava', 0.25);
  },
};

// ---------------------------------------------------------------- THE DOOR BELOW: a white doorframe in the tear, open on nothing
const voiddoor = {
  id: 'voiddoor', name: 'THE DOOR BELOW', h: 30,
  pal: landPalette('lm.voiddoor', { white: [31, 31, 31], grey: [18, 18, 22], dk: [6, 6, 9], ink: [0, 0, 1] }),
  draw(g) {
    const t = g.t;
    g.box(-8, -26, 16, 26, 'white'); g.box(-6, -23, 12, 23, 'ink');
    for (let i = 0; i < 5; i++) g.px(-5 + ((i * 5 + (t >> 4)) % 10), -22 + i * 4, blink(t + i * 3, 6, 1) ? 'white' : 'grey');
    g.box(-10, -28, 20, 2, 'grey'); g.box(-10, 0, 20, 1, 'dk', { flat: true });
  },
};

// ---------------------------------------------------------------- THE CHAMPIONS' ROAD: a highway gantry, a green sign, the road running on
const roadArch = (id, name, toCity) => ({
  id, name, h: 38,
  pal: landPalette(`lm.${id}`, {
    steel: [17, 18, 21], steelHi: [24, 25, 28], steelSh: [9, 10, 13], sign: [4, 17, 8], signHi: [8, 23, 11], signSh: [2, 10, 5], white: [30, 30, 28],
    road: [7, 7, 10], line: [29, 25, 6], gold: [31, 24, 5], ink: [2, 2, 4], lamp: [31, 29, 16], red: [26, 5, 6],
  }),
  draw(g) {
    const t = g.t;
    g.poly([[-9, 0], [9, 0], [4, -14], [-4, -14]], 'road'); for (let i = 0; i < 3; i++) g.box(-0.5, -12 + i * 4 + ((t >> 3) % 4), 1, 2, 'line', { flat: true });
    for (const x of [-18, 15]) { g.box(x, -32, 3, 32, 'steel'); g.box(x, -32, 1, 32, 'steelHi', { flat: true }); }
    g.box(-19, -33, 38, 3, 'steel'); g.box(-19, -33, 38, 1, 'steelHi', { flat: true });
    g.box(-14, -30, 28, 11, 'sign'); g.box(-14, -30, 28, 1, 'signHi', { flat: true }); g.box(-13, -29, 26, 9, 'sign', { flat: true });
    // the sign's words, as little bars, and an arrow (the belt icon at the end of the road, or the house back home)
    g.box(-11, -27, 12, 1, 'white', { flat: true }); g.box(-11, -24, 9, 1, 'white', { flat: true });
    if (toCity) { g.poly([[5, -28], [10, -25], [5, -22]], 'white'); g.box(2, -26, 4, 2, 'white', { flat: true }); g.ellipse(0, -36, 4, 2.5, 'gold'); g.dot(-0.5, -37, 'red'); }
    else { g.poly([[-2, -25], [3, -29], [8, -25]], 'white'); g.box(-1, -25, 8, 4, 'white', { flat: true }); g.box(2, -24, 2, 3, 'sign', { flat: true }); }
    for (const x of [-18, 16]) g.dot(x, -35, blink(t + x, 10, 1) ? 'lamp' : 'gold');
  },
});
const champRoad = roadArch('champRoad', 'THE CHAMPIONS\' ROAD', true);
const homeRoad = roadArch('homeRoad', 'THE ROAD HOME', false);

// ---------------------------------------------------------------- THE WARP: a rip in the street, purple nothing and shards turning round it
const warpGate = {
  id: 'warpGate', name: 'THE WARP', h: 36,
  pal: landPalette('lm.warpGate', {
    rim: [27, 10, 31], rimHi: [31, 22, 31], rimSh: [15, 4, 22], deep: [4, 1, 8], mid: [10, 3, 17], star: [31, 31, 31], shard: [20, 20, 26], shardSh: [10, 10, 16], ground: [8, 5, 12],
  }),
  draw(g) {
    const t = g.t;
    g.ellipse(0, -1, 14, 3, 'ground');
    g.ellipse(0, -16, 10, 15, 'rimSh'); g.ellipse(0, -16, 9, 14, 'rim'); g.ellipse(0, -16, 7, 12, 'mid'); g.ellipse(0, -16, 5, 9, 'deep');
    for (let i = 0; i < 6; i++) { const a = t / 20 + i, r = 3 + (i % 3) * 1.5; g.px(Math.cos(a) * r, -16 + Math.sin(a) * r * 1.6, i & 1 ? 'star' : 'rimHi'); }
    for (let i = 0; i < 4; i++) { const a = t / 30 + (i * Math.PI) / 2, x = Math.cos(a) * 14, y = -16 + Math.sin(a) * 16; g.poly([[x, y - 3], [x + 2, y], [x, y + 3], [x - 2, y]], i & 1 ? 'shard' : 'shardSh'); }
    g.glow(0, -16, 16, 'rim', 0.3);
  },
};

// ---------------------------------------------------------------- THE STAIRS DOWN: a cloud arch at the head of a stair that falls away
const cloudStair = {
  id: 'cloudStair', name: 'THE STAIRS DOWN', h: 34,
  pal: landPalette('lm.cloudStair', { cloud: [31, 31, 31], cloudSh: [22, 25, 30], marble: [28, 27, 26], marbleSh: [18, 17, 20], gold: [31, 25, 6], goldHi: [31, 31, 20], sky: [12, 18, 29], ink: [4, 4, 8] }),
  draw(g) {
    const t = g.t;
    for (let i = 0; i < 4; i++) { g.box(-10 + i, -4 - i * 3, 20 - i * 2, 3, i & 1 ? 'marbleSh' : 'marble'); }
    for (const x of [-13, 9]) { g.box(x, -28, 4, 16, 'marble'); g.box(x, -28, 1, 16, 'cloud', { flat: true }); g.ellipse(x + 2, -29, 4, 2, 'gold'); }
    g.dome(0, -26, 13, 7, 'cloud'); g.dome(0, -26, 9, 5, 'sky');
    g.ellipse(-8, -30, 5, 3, 'cloud'); g.ellipse(8, -31, 5, 3, 'cloudSh'); g.ellipse(0, -33, 6, 2, 'cloud');
    g.dot(-0.5, -24, blink(t, 12, 1) ? 'goldHi' : 'gold');
  },
};

// ---------------------------------------------------------------- THE WAY BACK UP: a rope ladder hanging from the dark, a lantern on a post
const ropeLedge = {
  id: 'ropeLedge', name: 'THE CHASM', h: 40,
  pal: landPalette('lm.ropeLedge', { rope: [20, 14, 8], ropeSh: [11, 7, 4], rock: [12, 9, 10], rockHi: [19, 15, 15], rockSh: [6, 4, 5], lamp: [31, 22, 6], lampHi: [31, 30, 16], iron: [10, 10, 13], ink: [1, 0, 2] }),
  draw(g) {
    const t = g.t, sw = Math.sin(t / 40) * 1.2;
    g.ellipse(0, -1, 13, 3, 'rockSh'); g.box(-12, -6, 7, 6, 'rock'); g.box(-12, -6, 7, 1, 'rockHi', { flat: true }); g.box(6, -5, 6, 5, 'rock'); g.box(6, -5, 6, 1, 'rockHi', { flat: true });
    for (const x of [-4, 3]) g.line(x, -40, x + sw, -2, 'rope', 1);
    for (let y = -36; y < -3; y += 4) g.line(-4 + sw * ((y + 40) / 38), y, 3 + sw * ((y + 40) / 38), y, 'ropeSh', 1);
    g.box(10, -18, 1, 13, 'iron', { flat: true }); g.box(8, -21, 5, 4, 'iron'); g.box(9, -20, 3, 2, blink(t, 7, 3) ? 'lampHi' : 'lamp', { flat: true }); g.glow(10.5, -19, 8, 'lamp', 0.3);
  },
};

// ---------------------------------------------------------------- THE TEAR: a white rip standing in the dark, edges that will not keep still
const tearGate = {
  id: 'tearGate', name: 'THE TEAR', h: 38,
  pal: landPalette('lm.tearGate', { white: [31, 31, 31], grey: [20, 20, 24], dk: [8, 8, 11], ink: [0, 0, 1], ash: [14, 8, 6], ember: [30, 14, 4] }),
  draw(g) {
    const t = g.t, P = [];
    for (let i = 0; i <= 10; i++) { const y = -36 + i * 3.4, w = Math.sin((i / 10) * Math.PI) * 7 + ((i * 7 + (t >> 3)) % 3) - 1; P.push([w, y]); }
    g.poly([...P, ...P.slice().reverse().map(([x, y]) => [-x * 0.8 - 1, y])], 'white');
    g.poly([...P.map(([x, y]) => [x * 0.5, y]), ...P.slice().reverse().map(([x, y]) => [-x * 0.4, y])], 'grey');
    for (let i = 0; i < 4; i++) g.px(-2 + ((i * 3 + (t >> 2)) % 5), -30 + i * 7, 'ink');
    for (let i = 0; i < 3; i++) g.dot(-10 + i * 9, -4 - ((t >> 2) + i * 5) % 10, i & 1 ? 'ember' : 'ash');
    g.ellipse(0, -1, 10, 2, 'dk');
  },
};

// ---------------------------------------------------------------- THE BLIMP: a mooring mast with the blimp tethered to it, bobbing
const blimpDock = {
  id: 'blimpDock', name: 'THE BLIMP', h: 58,
  pal: landPalette('lm.blimpDock', {
    hull: [27, 27, 30], hullHi: [31, 31, 31], hullSh: [17, 17, 22], red: [29, 5, 7], redSh: [17, 2, 4], gold: [31, 25, 6],
    mast: [12, 12, 15], mastHi: [20, 20, 23], gondola: [9, 7, 6], lite: [31, 29, 14], ink: [2, 2, 4], rope: [20, 15, 9], beam: [31, 31, 22],
  }),
  draw(g) {
    const t = g.t, b = Math.sin(t / 40) * 2;
    // the mast: a tall lattice tower with a lamp at the top and a beacon sweeping
    g.box(-20, -46, 4, 46, 'mast'); g.box(-20, -46, 1, 46, 'mastHi', { flat: true });
    for (let y = -44; y < 0; y += 6) { g.line(-20, y, -16, y + 5, 'mastHi'); g.line(-16, y, -20, y + 5, 'mast'); }
    g.box(-24, -1, 12, 1, 'mast', { flat: true }); g.dot(-18.5, -49, blink(t, 10, 1) ? 'lite' : 'red');
    // the blimp: big and bright, a red band and gold trim, fins, a gondola with lit windows, tethered to the mast, a banner trailing
    g.line(-16, -45, -8, -44 + b, 'rope');
    g.ellipse(6, -44 + b, 20, 9, 'hull'); g.ellipse(2, -48 + b, 14, 3, 'hullHi');
    g.box(-12, -45 + b, 36, 3, 'red'); g.box(-12, -42 + b, 36, 1, 'gold', { flat: true }); g.box(-12, -46 + b, 36, 1, 'gold', { flat: true });
    g.poly([[24, -44 + b], [31, -53 + b], [31, -35 + b]], 'redSh'); g.poly([[25, -44 + b], [30, -50 + b], [30, -38 + b]], 'red');
    g.box(-1, -35 + b, 14, 6, 'gondola'); for (let i = 0; i < 4; i++) g.dot(1 + i * 3, -33 + b, blink(t + i * 9, 30, 4) ? 'lite' : 'gold');
    for (let i = 0; i < 4; i++) g.dot(-16 - i * 3, -44 + b + Math.round(Math.sin(t / 8 + i) * 1.2), i & 1 ? 'red' : 'hullHi');
    g.ellipse(6, -1, 14, 2, 'ink');
  },
};

export const WORLD_LANDMARKS = { home, gauntlet, tdhall, skygate, chasm, voiddoor, champRoad, homeRoad, warpGate, cloudStair, ropeLedge, tearGate, blimpDock };
