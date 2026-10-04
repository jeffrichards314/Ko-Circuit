// Landmarks of the base game (spec §19 G4): one drawing per circuit, matching its arena (§2b).
// A landmark is { id, name, pal, draw(g) } drawn in units around the middle of its ground line
// (see ../gfx.js): about 44 units wide and up to 40 high, at k = 1 on the map and k = 3-4 in a scene.
import { landPalette } from '../gfx.js';

const wave = (t, p, a = 1) => Math.sin((t / p) * Math.PI * 2) * a;
const blink = (t, n, on = 1) => Math.floor(t / n) % (on + 1) === 0;

// ---------------------------------------------------------------- ROOKIE: the community rec center
const rookie = {
  id: 'rookie', name: 'REC CENTER', h: 34,
  pal: landPalette('lm.rookie', {
    brick: [19, 9, 7], brickHi: [24, 13, 10], brickSh: [12, 5, 4],
    roof: [9, 9, 12], roofHi: [15, 15, 19], roofSh: [5, 5, 8],
    glass: [7, 14, 20], lite: [29, 30, 24], door: [9, 6, 4], doorHi: [15, 10, 6],
    banner: [29, 22, 4], ink: [3, 2, 4], grey: [17, 17, 19],
  }),
  draw(g) {
    const t = g.t;
    // the hall, its flat roof and parapet
    g.box(-19, -15, 38, 15, 'brick');
    if (g.big) for (let y = -14; y < 0; y += 1.5) { g.nat(-19, y, 38, 1, 'brickSh'); for (let x = -19 + (Math.round(y / 1.5) & 1 ? 0 : 2); x < 19; x += 4) g.nat(x, y, 1, 4, 'brickSh'); }
    g.box(-21, -18, 42, 3, 'roof');
    // the banner on the roof: ROOKIE
    g.box(-13, -25, 26, 7, 'banner');
    g.box(-13, -25, 26, 1, 'ink', { flat: true }); g.box(-13, -19, 26, 1, 'ink', { flat: true });
    if (g.big) g.text('ROOKIE', -11.5, -24.6, 'ink'); else for (let i = 0; i < 6; i++) g.box(-11 + i * 4, -23, 3, 3, 'ink', { flat: true });
    g.box(-13, -18, 1, 3, 'ink', { flat: true }); g.box(12, -18, 1, 3, 'ink', { flat: true });
    // windows with a flickering fluorescent tube
    for (let i = 0; i < 4; i++) {
      const x = i < 2 ? -17 + i * 6 : 6 + (i - 2) * 6, on = !(i === 1 && blink(t, 7, 3)) && !(i === 3 && blink(t, 11, 5));
      g.box(x, -12, 5, 6, 'glass'); g.box(x + 0.5, -11.5, 4, 5, on ? 'lite' : 'glass', { flat: true });
      if (g.big) { g.nat(x + 2.5, -12, 1, 6, 'ink'); }
    }
    // the double door and steps
    g.box(-4, -10, 8, 10, 'door'); g.box(-0.5, -10, 1, 10, 'ink', { flat: true });
    g.box(-3, -9, 2.5, 4, 'glass', { flat: true }); g.box(0.5, -9, 2.5, 4, 'glass', { flat: true });
    g.box(-6, -1, 12, 1, 'grey', { flat: true });
    // a hoop on a pole at the right, folding chairs on the left
    g.box(24, -22, 1, 22, 'grey', { flat: true }); g.box(21, -24, 6, 4, 'lite', { flat: true }); g.box(22, -20, 4, 1, 'banner', { flat: true });
    for (let i = 0; i < 3; i++) { g.box(-27 + i * 3, -5, 2, 5, 'roof', { flat: true }); g.box(-28 + i * 3, -3, 4, 1, 'roofHi', { flat: true }); }
  },
};

// ---------------------------------------------------------------- MINOR: the small-town civic hall
const minor = {
  id: 'minor', name: 'CIVIC HALL', h: 40,
  pal: landPalette('lm.minor', {
    wall: [29, 27, 22], wallHi: [31, 30, 27], wallSh: [21, 19, 16],
    roof: [9, 12, 19], roofHi: [14, 18, 25], roofSh: [5, 7, 12],
    wood: [15, 9, 5], woodHi: [21, 14, 8], glass: [10, 18, 24], gold: [30, 24, 6],
    red: [26, 6, 6], ink: [5, 4, 6],
  }),
  draw(g) {
    const t = g.t;
    g.box(-17, -13, 34, 13, 'wall');
    if (g.big) for (let y = -12; y < 0; y += 2) g.nat(-17, y, 34, 1, 'wallSh');
    // the pediment
    g.poly([[-19, -13], [0, -24], [19, -13]], 'roof');
    g.poly([[-15, -14], [0, -22], [15, -14]], 'wall');
    g.disc(0, -17, 2.2, 'gold');
    // columns, door, windows
    for (let i = 0; i < 4; i++) g.box(-13 + i * 8.5, -13, 3, 13, 'wallHi', { flat: false });
    g.box(-3, -9, 6, 9, 'wood'); g.box(-2, -8, 4, 3, 'glass', { flat: true });
    g.box(-10, -10, 4, 6, 'glass', { flat: true }); g.box(6, -10, 4, 6, 'glass', { flat: true });
    g.box(-6, -1, 12, 1, 'wallSh', { flat: true }); g.box(-8, 0, 16, 1, 'wallSh', { flat: true });
    // the clock tower on the roof
    g.box(-4, -36, 8, 14, 'wall');
    g.box(-5, -37, 10, 2, 'roofSh', { flat: true });
    g.poly([[-6, -37], [0, -46], [6, -37]], 'roof');
    g.disc(0, -30, 3, 'gold'); g.disc(0, -30, 2.2, 'wallHi');
    const a = (t / 90) * Math.PI * 2;
    g.line(0, -30, Math.cos(a) * 2, -30 + Math.sin(a) * 2, 'ink'); g.line(0, -30, 0, -32, 'ink');
    g.line(0, -46, 0, -50, 'ink');
    // the flag, waving
    g.box(-24, -30, 1, 30, 'wallSh', { flat: true });
    for (let i = 0; i < 8; i++) g.box(-23 + i, -30 + wave(t + i * 8, 40, 1), 1, 5, i % 2 ? 'red' : 'wallHi', { flat: true });
  },
};

// ---------------------------------------------------------------- METRO: the rooftop skyline
const metro = {
  id: 'metro', name: 'ROOFTOP', h: 44,
  pal: landPalette('lm.metro', {
    far: [4, 5, 11], farHi: [6, 8, 15], tower: [7, 9, 17], towerHi: [11, 14, 24], towerSh: [4, 5, 10],
    lite: [30, 27, 12], lite2: [14, 22, 30], red: [31, 5, 5], beam: [26, 28, 31],
    roof: [10, 10, 14], ring: [28, 8, 8], steel: [17, 18, 22],
  }),
  draw(g) {
    const t = g.t;
    const win = (x, y, w, h, seed, n = 1) => {
      for (let j = 0; j < h; j += 3) for (let i = 0; i < w; i += 3) if (((i * 7 + j * 13 + seed) % 5) < 2) g.box(x + i, y + j, 2, 2, ((i + j + seed) & 3) === 0 ? 'lite2' : 'lite', { flat: true });
      void n;
    };
    // back row
    g.box(-22, -22, 9, 22, 'far'); g.box(13, -26, 9, 26, 'far'); g.box(-8, -30, 6, 30, 'farHi');
    // left and right towers
    g.box(-20, -18, 12, 18, 'tower'); win(-19, -16, 10, 15, 3);
    g.box(9, -24, 13, 24, 'tower'); win(10, -22, 11, 21, 7);
    // the tall centre tower with its antenna and the roof ring
    g.box(-7, -34, 14, 34, 'tower'); win(-6, -32, 12, 30, 1);
    g.box(-8, -36, 16, 3, 'roof');
    g.box(-5, -39, 10, 3, 'ring', { flat: true }); g.box(-5, -39, 10, 1, 'beam', { flat: true });
    g.box(-1, -46, 1, 8, 'steel', { flat: true });
    if (blink(t, 20, 1)) g.box(-1, -48, 2, 2, 'red', { flat: true });
    if (g.lit && g.big) g.glow(0, -47, 3, 'red', 0.4);
    // roof lights and a searchlight sweeping the sky
    const s = wave(t, 240, 1);
    g.line(-3, -38, -3 + s * 26, -68, 'beam', 1);
    // the helicopter crossing the top
    const hx = ((t * 0.18) % 70) - 35;
    g.box(hx, -56, 5, 2, 'steel', { flat: true }); g.box(hx - 2, -58, 9, 1, (t >> 1) & 1 ? 'beam' : 'steel', { flat: true }); g.px(hx + 5, -55, 'red');
  },
};

// ---------------------------------------------------------------- MAJOR: the big neon arena
const major = {
  id: 'major', name: 'THE GARDEN', h: 32,
  pal: landPalette('lm.major', {
    wall: [8, 8, 16], wallHi: [13, 13, 24], wallSh: [4, 4, 9],
    roof: [14, 14, 22], roofHi: [20, 20, 29], roofSh: [8, 8, 14],
    cyan: [6, 28, 31], pink: [30, 8, 24], gold: [31, 27, 8], white: [31, 31, 31],
    door: [3, 3, 8], beam: [22, 26, 31], ink: [2, 2, 5],
  }),
  draw(g) {
    const t = g.t;
    // the low dome and the drum under it
    g.dome(0, -14, 20, 13, 'roof');
    g.box(-22, -14, 44, 14, 'wall');
    if (g.big) for (let x = -22; x < 22; x += 4) g.nat(x, -14, 1, 14, 'wallSh');
    // neon bands going round the drum: cyan over pink, chasing
    for (let i = 0; i < 22; i++) { g.box(-22 + i * 2, -12, 2, 1, (i + (t >> 3)) % 4 < 2 ? 'cyan' : 'wallHi', { flat: true }); g.box(-22 + i * 2, -3, 2, 1, (i + (t >> 3)) % 4 < 2 ? 'pink' : 'wallHi', { flat: true }); }
    // the marquee
    g.box(-10, -10, 20, 7, 'ink'); g.box(-9, -9, 18, 5, 'wallSh', { flat: true });
    if (g.big) g.text('MAJOR', -8, -8.6, blink(t, 30, 1) ? 'gold' : 'white'); else for (let i = 0; i < 5; i++) g.box(-8 + i * 3.6, -8, 2.6, 3, i % 2 ? 'gold' : 'white', { flat: true });
    // the entrance and canopy
    g.box(-4, -5, 8, 5, 'door');
    g.box(-7, -6, 14, 1, 'gold', { flat: true });
    // a ring of bulbs along the dome
    for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI; g.box(Math.cos(a) * 19 - 0.5, -14 + Math.sin(a) * 12, 1.4, 1.4, (i + (t >> 4)) & 1 ? 'white' : 'pink', { flat: true }); }
    // searchlights crossing above
    const s = wave(t, 200, 1);
    g.line(-16, -14, -16 + 10 + s * 12, -46, 'beam', 1); g.line(16, -14, 16 - 10 + s * 12, -46, 'beam', 1);
  },
};

// ---------------------------------------------------------------- CARNIVAL: the big top
const carnival = {
  id: 'carnival', name: 'THE BIG TOP', h: 42,
  pal: landPalette('lm.carnival', {
    red: [28, 5, 7], redHi: [31, 12, 12], redSh: [18, 2, 5],
    cream: [31, 29, 22], creamHi: [31, 31, 28], creamSh: [23, 20, 15],
    gold: [31, 25, 5], dark: [4, 2, 6], bulb: [31, 30, 14], violet: [18, 6, 22], pole: [12, 8, 5],
  }),
  draw(g) {
    const t = g.t;
    // the tent: the roof as wedges, the drum below
    g.box(-19, -12, 38, 12, 'cream');
    for (let i = 0; i < 10; i++) if (i % 2 === 0) g.box(-19 + i * 3.8, -12, 3.8, 12, 'red');
    // scalloped edge
    for (let i = 0; i < 10; i++) g.tri(-19 + i * 3.8, -12, -15.2 + i * 3.8, -12, -17.1 + i * 3.8, -8.5, i % 2 ? 'cream' : 'red');
    // roof wedges
    for (let i = 0; i < 10; i++) g.poly([[-19 + i * 3.8, -12], [-15.2 + i * 3.8, -12], [-1.5 + i * 0.3, -30], [-1.5 + i * 0.3 + 0.001, -30]], i % 2 ? 'cream' : 'red');
    g.poly([[-19, -12], [19, -12], [1.5, -31], [-1.5, -31]], 'red');
    for (let i = 0; i < 6; i++) g.poly([[-19 + i * 6.3, -12], [-19 + (i + 1) * 6.3, -12], [-1.5 + (i + 1) * 0.5 - 0.5, -31], [-1.5 + i * 0.5 - 0.5, -31]], i % 2 ? 'cream' : 'red');
    g.box(-1, -37, 2, 7, 'pole', { flat: true });
    // the pennant
    for (let i = 0; i < 7; i++) g.box(1 + i, -38 + wave(t + i * 9, 36, 1), 1, 4 - (i >> 1), 'gold', { flat: true });
    // the entrance flap
    g.poly([[-4, 0], [0, -10], [4, 0]], 'dark');
    g.tri(-4, 0, 0, -10, -1.5, 0, 'violet');
    // strings of bulbs from the peak to the eaves
    for (let s = -1; s <= 1; s += 2) for (let i = 1; i < 8; i++) g.box(s * (i * 2.4) - 0.5, -30 + i * 2.2 + Math.sin(i) * 0.6 - 0.2, 1.3, 1.3, (i + (t >> 4)) % 3 === 0 ? 'bulb' : 'gold', { flat: true });
    // a side tent and the ticket booth
    g.poly([[-27, 0], [-27, -7], [-22, -12], [-17, -7], [-17, 0]], 'violet'); g.poly([[-27, -7], [-22, -12], [-17, -7]], 'gold');
    g.box(21, -8, 7, 8, 'cream'); g.poly([[20, -8], [24.5, -12], [29, -8]], 'red');
  },
};

// ---------------------------------------------------------------- CONTINENTAL: the old-world grand hall
const continental = {
  id: 'continental', name: 'GRAND HALL', h: 38,
  pal: landPalette('lm.continental', {
    stone: [27, 24, 19], stoneHi: [31, 29, 25], stoneSh: [19, 16, 13],
    roof: [7, 9, 14], roofHi: [12, 15, 22], roofSh: [4, 5, 9],
    gold: [31, 25, 6], glow: [31, 28, 14], red: [22, 3, 6], redSh: [13, 1, 3], glass: [10, 14, 22], ink: [4, 3, 5],
  }),
  draw(g) {
    const t = g.t;
    // the wings and the centre block
    g.box(-24, -12, 12, 12, 'stone'); g.box(12, -12, 12, 12, 'stone'); g.box(-12, -16, 24, 16, 'stone');
    if (g.big) for (let y = -11; y < 0; y += 2) { g.nat(-24, y, 48, 1, 'stoneSh'); }
    // mansard roofs
    g.poly([[-26, -12], [-22, -18], [-14, -18], [-10, -12]], 'roof'); g.poly([[10, -12], [14, -18], [22, -18], [26, -12]], 'roof');
    g.poly([[-14, -16], [-9, -24], [9, -24], [14, -16]], 'roof');
    g.poly([[-9, -24], [0, -32], [9, -24]], 'roofHi');
    for (let x = -21; x <= 21; x += 6) if (Math.abs(x) > 12) g.box(x, -16.5, 2, 2, 'glow', { flat: true });
    // the tall windows: chandelier light
    for (let i = 0; i < 4; i++) { const x = -10 + i * 5.4; g.box(x, -14, 3, 8, blink(t + i * 7, 60, 5) ? 'glow' : 'gold', { flat: true }); g.dome(x + 1.5, -14, 1.5, 1.5, 'glow'); }
    // clock in the pediment
    g.disc(0, -20, 2.8, 'gold'); g.disc(0, -20, 2, 'stoneHi');
    g.line(0, -20, 0, -21.5, 'ink'); g.line(0, -20, 1.4, -19.6, 'ink');
    // the spire and flag
    g.box(-0.5, -38, 1, 6, 'gold', { flat: true }); g.box(0.5, -38, 3 + wave(t, 40, 0.8), 2, 'red', { flat: true });
    // the red carpet up the steps
    g.box(-14, -1, 28, 1, 'stoneSh', { flat: true }); g.box(-3, -6, 6, 6, 'ink'); g.box(-3, -1, 6, 1, 'red', { flat: true });
    g.poly([[-2, -1], [2, -1], [4, 3], [-4, 3]], 'red');
  },
};

// ---------------------------------------------------------------- WORLD: the stadium
const world = {
  id: 'world', name: 'THE STADIUM', h: 36,
  pal: landPalette('lm.world', {
    wall: [14, 15, 20], wallHi: [20, 21, 27], wallSh: [8, 9, 13],
    bowl: [20, 20, 24], dark: [4, 5, 9], lamp: [31, 31, 27], beam: [24, 27, 31],
    screen: [8, 22, 28], screenHi: [20, 30, 31], flag: [26, 5, 8], flag2: [8, 12, 28], ink: [2, 3, 6], glow: [29, 29, 20],
  }),
  draw(g) {
    const t = g.t;
    // the bowl: a curved wall, tiers of seats above it
    g.dome(0, -8, 24, 12, 'wall');
    g.dome(0, -8, 20, 9, 'bowl');
    for (let i = 0; i < 4; i++) g.dome(0, -8, 20 - i * 3, 9 - i * 1.6, i & 1 ? 'wallHi' : 'bowl', { flat: true });
    g.box(-24, -8, 48, 8, 'wall');
    for (let i = 0; i < 11; i++) g.box(-22 + i * 4.2, -6, 2.4, 6, 'dark', { flat: true }); // arches
    // the video screen over the entrance
    g.box(-8, -22, 16, 9, 'ink'); g.box(-7, -21, 14, 7, blink(t, 45, 2) ? 'screen' : 'screenHi', { flat: true });
    g.box(-6, -19, 4, 2, 'screenHi', { flat: true });
    if (g.big) g.text('WORLD', -5.5, -17.6, 'ink');
    // four floodlight towers
    for (const x of [-25, -15, 15, 25]) {
      g.box(x - 0.5, -28, 1, 22, 'wallSh', { flat: true });
      g.box(x - 3, -32, 6, 4, 'ink'); g.box(x - 2.5, -31.5, 5, 3, 'lamp', { flat: true });
      if (g.lit) g.glow(x, -30, 5, 'glow', 0.5);
    }
    // sweeping spotlights
    const s = wave(t, 220, 1);
    g.line(-25, -32, -25 + 20 + s * 14, -60, 'beam'); g.line(25, -32, 25 - 20 + s * 14, -60, 'beam');
    // flags
    g.box(-0.5, -32, 1, 10, 'wallSh', { flat: true }); g.box(0.5, -32, 5 + wave(t, 44, 1), 3, 'flag', { flat: true });
  },
};

// ---------------------------------------------------------------- STORM: a hilltop in a thunderstorm
const storm = {
  id: 'storm', name: 'THE HILLTOP', h: 44,
  pal: landPalette('lm.storm', {
    hill: [5, 10, 8], hillHi: [8, 15, 11], hillSh: [3, 6, 5],
    cloud: [9, 9, 14], cloudHi: [15, 15, 21], cloudSh: [5, 5, 9],
    bolt: [31, 31, 20], boltHi: [31, 31, 31], rain: [16, 20, 28],
    post: [14, 12, 12], rope: [26, 6, 6], canvas: [17, 17, 21], ink: [2, 2, 5],
  }),
  draw(g) {
    const t = g.t;
    // the thundercloud
    for (const [x, y, rx, ry, k] of [[-12, -42, 12, 5, 'cloud'], [4, -44, 14, 6, 'cloudHi'], [16, -40, 10, 5, 'cloud'], [-2, -39, 16, 4, 'cloudSh']]) g.ellipse(x, y, rx, ry, k);
    // the hill and the ring on its crown
    g.dome(0, 0, 26, 14, 'hill');
    g.dome(-6, 0, 18, 9, 'hillHi', { flat: true });
    g.box(-8, -18, 16, 2, 'canvas', { flat: true }); g.box(-8, -16, 16, 1, 'ink', { flat: true });
    for (const x of [-8, 7]) { g.box(x, -25, 1.4, 9, 'post', { flat: true }); }
    for (const y of [-23, -20]) g.line(-8, y, 8, y + 0.3, 'rope');
    // the lightning: a jagged bolt, flashing now and then
    const fl = t % 150;
    if (fl < 8 || (fl > 14 && fl < 18)) {
      g.line(6, -37, 2, -30, 'boltHi', 2); g.line(2, -30, 5, -29, 'boltHi', 2); g.line(5, -29, -2, -19, 'boltHi', 2);
      if (g.lit && g.big) g.glow(2, -28, 14, 'bolt', 0.25);
    }
    // rain, slanting
    for (let i = 0; i < 26; i++) { const x = ((i * 37 + t * 2) % 52) - 26, y = -40 + ((i * 53 + t * 5) % 44); g.px(x, y, 'rain'); g.px(x - 1, y + 1, 'rain'); }
  },
};

// ---------------------------------------------------------------- LEGENDS: the hall of fame
const legends = {
  id: 'legends', name: 'HALL OF FAME', h: 40,
  pal: landPalette('lm.legends', {
    marble: [29, 28, 26], marbleHi: [31, 31, 30], marbleSh: [20, 19, 19],
    gold: [31, 24, 4], goldHi: [31, 30, 14], goldSh: [20, 13, 2],
    red: [24, 4, 6], redSh: [14, 2, 4], dark: [6, 4, 8], sky: [12, 16, 26],
  }),
  draw(g) {
    const t = g.t;
    // the stepped base and pediment
    g.box(-22, -2, 44, 2, 'marbleSh'); g.box(-20, -4, 40, 2, 'marble');
    g.box(-18, -6, 36, 2, 'marbleHi');
    g.box(-17, -22, 34, 16, 'dark');
    g.poly([[-21, -22], [0, -34], [21, -22]], 'marble'); g.poly([[-17, -23], [0, -31], [17, -23]], 'goldSh');
    g.poly([[-14, -24], [0, -30], [14, -24]], 'dark');
    // the star on the pediment
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i * Math.PI * 2) / 5; g.line(0, -26.5, Math.cos(a) * 3.4, -26.5 + Math.sin(a) * 3.4, blink(t, 30, 1) ? 'goldHi' : 'gold', 1); }
    g.box(-1, -28, 2, 3, 'gold', { flat: true });
    // six columns with banners between them
    for (let i = 0; i < 6; i++) g.box(-17 + i * 6.4, -22, 2.6, 16, 'marble');
    for (let i = 0; i < 5; i++) { const x = -14.2 + i * 6.4; g.box(x, -21, 3.8, 10, i % 2 ? 'gold' : 'red', { flat: true }); g.tri(x, -11, x + 3.8, -11, x + 1.9, -8.6, i % 2 ? 'gold' : 'red'); }
    // two statues of boxers, fists high
    for (const s of [-1, 1]) { const x = s * 25; g.box(x - 2, -6, 4, 6, 'marbleSh'); g.box(x - 1, -14, 2, 8, 'gold', { flat: true }); g.disc(x, -16, 1.6, 'goldHi'); g.line(x, -13, x + s * 2, -19, 'goldHi'); }
  },
};

// ---------------------------------------------------------------- GRAND PRIX: the colosseum
const grandprix = {
  id: 'grandprix', name: 'COLOSSEUM', h: 34,
  pal: landPalette('lm.grandprix', {
    stone: [25, 21, 14], stoneHi: [30, 27, 19], stoneSh: [17, 13, 8],
    dark: [5, 3, 5], flag: [28, 4, 6], sky: [10, 14, 26],
    fw1: [31, 28, 10], fw2: [31, 10, 14], fw3: [10, 26, 31], gold: [31, 25, 6],
  }),
  draw(g) {
    const t = g.t;
    // three tiers of arches, the far side broken away on the right
    for (let tier = 0; tier < 3; tier++) {
      const y = -12 - tier * 9, n = 9 - (tier === 2 ? 1 : 0), w = 46 - tier * 2, x0 = -w / 2;
      g.box(x0, y, w, 9, 'stone');
      if (g.big) for (let yy = y + 1; yy < y + 9; yy += 2) g.nat(x0, yy, w, 1, 'stoneSh');
      for (let i = 0; i < n; i++) { const ax = x0 + 1.5 + i * ((w - 3) / n) + 0.4; g.box(ax, y + 3, 3, 6, 'dark', { flat: true }); g.dome(ax + 1.5, y + 3, 1.5, 1.5, 'dark', { flat: true }); }
      g.box(x0, y, w, 1, 'stoneHi', { flat: true });
    }
    g.box(-23, -3, 46, 3, 'stone'); g.box(-23, -3, 46, 1, 'stoneHi', { flat: true });
    // the broken rim on top
    g.poly([[-20, -30], [-14, -33], [-8, -30]], 'stone'); g.poly([[4, -30], [9, -34], [14, -30], [20, -30]], 'stone');
    // banners
    for (const x of [-16, 0, 16]) { g.box(x, -30, 1, 4, 'gold', { flat: true }); g.box(x + 1, -30, 3 + wave(t + x, 40, 0.8), 3, 'flag', { flat: true }); }
    // fireworks: three bursts on different cycles
    for (let b = 0; b < 3; b++) {
      const ph = (t + b * 47) % 140, cx = [-15, 4, 17][b], cy = [-46, -52, -44][b], k = ['fw1', 'fw2', 'fw3'][b];
      if (ph < 40) for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r = ph * 0.32; g.px(cx + Math.cos(a) * r, cy + Math.sin(a) * r + (ph * ph) * 0.004, ph > 28 && i & 1 ? 'gold' : k); }
      else if (ph < 52) g.px(cx, cy + 60 - ph, 'gold');
    }
  },
};

// ---------------------------------------------------------------- UNDERGROUND: the warehouse and its cage
const underground = {
  id: 'underground', name: 'WAREHOUSE', h: 32,
  pal: landPalette('lm.underground', {
    steel: [12, 13, 16], steelHi: [18, 19, 23], steelSh: [7, 8, 11],
    rust: [19, 9, 4], rustHi: [25, 13, 6], door: [4, 4, 6], light: [31, 22, 6], lightHi: [31, 29, 14],
    fence: [20, 21, 24], ink: [2, 2, 4], green: [8, 20, 10],
  }),
  draw(g) {
    const t = g.t;
    // the corrugated hall, a low pitched roof, vents
    g.box(-20, -18, 40, 18, 'steel');
    for (let x = -20; x < 20; x += 2) g.nat(x, -18, 1, 18, 'steelSh');
    g.poly([[-22, -18], [-18, -23], [18, -23], [22, -18]], 'steelHi');
    g.box(-14, -27, 4, 4, 'steelSh'); g.box(8, -26, 5, 3, 'steelSh');
    // a sign, rusted, half gone
    g.box(-16, -16, 14, 4, 'rust'); g.box(-16, -16, 14, 1, 'rustHi', { flat: true });
    if (g.big) g.text('NO RULES', -15.5, -15.6, 'ink'); else for (let i = 0; i < 4; i++) g.box(-15 + i * 3.4, -15, 2.4, 2, 'ink', { flat: true });
    // the roll-up door, half open, orange light spilling out
    g.box(2, -13, 14, 13, 'door');
    g.box(2, -13, 14, 6, 'steelHi', { flat: true }); for (let y = -13; y < -7; y += 1.5) g.nat(2, y, 14, 1, 'steelSh');
    for (let j = 0; j < 7; j++) g.box(2 + j * 0.4, -7 + j, 14 - j * 0.8, 1, blink(t + j * 5, 60, 8) ? 'lightHi' : 'light', { flat: true });
    g.poly([[2, 0], [16, 0], [22, 4], [-4, 4]], 'light');
    g.dither(-4, 0, 26, 5, 'lightHi', 0.4);
    // chain-link in front, and a swinging bulb on a wire
    for (let x = -24; x < 24; x += 3) { g.line(x, 0, x + 3, -8, 'fence', 1); g.line(x + 3, 0, x, -8, 'fence', 1); }
    g.box(-24, -8, 48, 1, 'fence', { flat: true });
    const sw = wave(t, 90, 3);
    g.line(-8, -24, -8 + sw, -18, 'ink'); g.box(-9 + sw, -18, 2, 2, 'lightHi', { flat: true });
    // barrels and crates, a neon arrow over the door, a queue of shadows waiting to get in
    g.box(-22, -5, 3, 5, 'green'); g.box(20, -5, 3, 5, 'rust'); g.box(17, -4, 3, 4, 'rustHi'); g.box(18, -7, 2, 3, 'rust');
    const on = blink(t, 14, 1);
    g.poly([[4, -21], [12, -21], [12, -23], [16, -19.5], [12, -16], [12, -18], [4, -18]], on ? 'lightHi' : 'rust');
    for (let i = 0; i < 4; i++) { const x = -4 - i * 4, bob = (t >> 4) + i & 1; g.box(x, -6 - bob, 2, 6 + bob, 'ink'); g.disc(x + 1, -7.5 - bob, 1.2, 'ink'); }
  },
};

// ---------------------------------------------------------------- DREAM: the championship arena
const dream = {
  id: 'dream', name: 'CHAMPIONSHIP ARENA', h: 44,
  pal: landPalette('lm.dream', {
    wall: [26, 25, 27], wallHi: [31, 31, 31], wallSh: [17, 16, 19],
    gold: [31, 25, 5], goldHi: [31, 31, 16], goldSh: [20, 13, 2],
    glass: [8, 14, 24], glassHi: [18, 24, 31], red: [26, 4, 6], beam: [28, 28, 31], flash: [31, 31, 31],
    dark: [5, 4, 9],
  }),
  draw(g) {
    const t = g.t;
    // the glass drum, a gold dome and lantern
    g.box(-22, -16, 44, 16, 'wall');
    g.dome(0, -16, 22, 14, 'gold');
    g.dome(0, -16, 17, 10, 'goldHi', { flat: true });
    g.box(-2, -37, 4, 5, 'goldSh'); g.poly([[-3, -37], [0, -43], [3, -37]], 'goldHi');
    // glass strips with a reflection
    for (let i = 0; i < 8; i++) g.box(-20 + i * 5.2, -14, 3.4, 12, (i + (t >> 5)) % 5 === 0 ? 'glassHi' : 'glass', { flat: true });
    // the belt over the doors: a gold plate
    g.box(-8, -12, 16, 6, 'dark'); g.box(-7, -11, 14, 4, 'gold'); g.box(-7, -11, 14, 1, 'goldHi', { flat: true });
    g.disc(0, -9, 2.4, 'red'); g.disc(0, -9, 1.2, 'goldHi');
    g.box(-4, -5, 8, 5, 'dark'); g.box(-3, -1, 6, 1, 'red', { flat: true });
    // flags and searchlights
    for (const x of [-20, 20]) { g.box(x - 0.5, -30, 1, 14, 'wallSh', { flat: true }); g.box(x + 0.5, -30, 4 + wave(t + x, 44, 1), 3, 'red', { flat: true }); }
    const s = wave(t, 170, 1);
    g.line(-12, -22, -12 + 12 + s * 16, -66, 'beam'); g.line(12, -22, 12 - 12 + s * 16, -66, 'beam'); g.line(0, -30, s * 22, -68, 'beam');
    // camera flashes
    for (let i = 0; i < 7; i++) if (((t >> 1) + i * 13) % 31 === 0) { const x = -18 + i * 6, y = -3 - (i % 3) * 3; g.box(x, y, 2, 2, 'flash', { flat: true }); g.box(x - 1, y + 0.5, 4, 1, 'flash', { flat: true }); }
  },
};

// ---------------------------------------------------------------- NIGHTMARE: the arena, warped
const nightmare = {
  id: 'nightmare', name: 'THE NIGHTMARE', h: 44,
  pal: landPalette('lm.nightmare', {
    stone: [16, 8, 20], stoneHi: [22, 12, 26], stoneSh: [8, 3, 12],
    dark: [2, 0, 5], eye: [31, 27, 6], iris: [28, 3, 10], mist: [12, 6, 20],
    bone: [27, 25, 24], glow: [30, 6, 26], void: [6, 2, 10],
  }),
  draw(g) {
    const t = g.t;
    const warp = (x, y) => Math.sin((x * 0.31) + t / 30) * 2.2 + Math.sin(y * 0.2 + t / 47) * 1.2;
    // three tiers of arches leaning against each other, every column at a different angle
    for (let tier = 0; tier < 3; tier++) {
      const y = -12 - tier * 9;
      for (let i = 0; i < 9; i++) {
        const x = -21 + i * 5.2, dx = warp(x, y) * (1 + tier * 0.4), h = 9 + Math.sin(i * 2.7 + tier) * 1.5;
        g.box(x + dx, y - (h - 9), 5.2, h, 'stone');
        g.box(x + dx + 1.2, y + 3 - (h - 9), 2.8, h - 3, 'dark', { flat: true }); g.dome(x + dx + 2.6, y + 3 - (h - 9), 1.4, 1.5, 'dark', { flat: true });
      }
    }
    g.box(-23, -3, 46, 3, 'stoneSh');
    // an eye opening in the sky above it: iris moving with the beat
    const lid = 2.5 + Math.sin(t / 50) * 1.2;
    g.ellipse(0, -44, 11, lid + 2, 'bone'); g.ellipse(Math.sin(t / 35) * 3, -44, 4, lid + 1, 'iris'); g.ellipse(Math.sin(t / 35) * 3, -44, 1.5, lid * 0.6, 'dark');
    // debris drifting up
    for (let i = 0; i < 7; i++) { const x = -22 + i * 7 + Math.sin(t / 40 + i) * 3, y = -30 - ((t * 0.2 + i * 17) % 20); g.box(x, y, 2 + (i & 1), 2, i & 1 ? 'stoneHi' : 'stoneSh', { flat: true }); }
    g.dither(-24, -6, 48, 6, 'mist', 0.5);
  },
};

// ---------------------------------------------------------------- ZERO: a white door in nothing, at the top of a white stair, shards turning round it
const zero = {
  id: 'zero', name: 'ZERO', h: 42,
  pal: landPalette('lm.zero', {
    white: [31, 31, 31], whiteHi: [31, 31, 31], whiteSh: [24, 24, 27], grey: [17, 17, 21], greySh: [10, 10, 14], dark: [1, 1, 2], glow: [29, 29, 31], purple: [22, 8, 28],
  }),
  draw(g) {
    const t = g.t;
    // three broad white steps
    for (let i = 0; i < 3; i++) { g.box(-16 + i * 3, -3 - i * 3, 32 - i * 6, 3, 'white'); g.box(-16 + i * 3, -1 - i * 3, 32 - i * 6, 1, 'whiteSh', { flat: true }); g.box(16 - i * 3 - 1, -3 - i * 3, 1, 3, 'grey', { flat: true }); }
    // the slab, a black slit down it, a crack of purple light in the slit
    g.box(-7, -42, 14, 33, 'white');
    g.box(-7, -42, 14, 1, 'whiteSh', { flat: true }); g.box(6, -42, 1, 33, 'whiteSh', { flat: true });
    g.box(-2.5, -34, 5, 24, 'dark');
    g.box(-0.5, -34, 1, 24, blink(t, 120, 1) ? 'dark' : 'purple', { flat: true });
    // cracks across the slab
    g.line(-7, -24, -3, -21, 'greySh'); g.line(7, -30, 3, -28, 'greySh'); g.line(-6, -38, -3, -36, 'grey');
    // shards turning round it, and a ring of pale light over it
    for (let i = 0; i < 4; i++) { const a = t / 45 + (i * Math.PI) / 2, x = Math.cos(a) * 15, y = -24 + Math.sin(a) * 6, front = Math.sin(a) > 0; g.poly([[x, y - 3], [x + 2, y], [x, y + 3], [x - 2, y]], front ? 'white' : 'greySh'); }
    for (let a = 0; a < 24; a++) { const q = (a / 24) * Math.PI * 2; g.px(Math.cos(q) * 9, -46 + Math.sin(q) * 2.2, (a + (t >> 3)) % 4 ? 'glow' : 'grey'); }
    g.dither(-12, -44, 24, 4, 'glow', 0.25);
    g.box(-18, 0, 36, 1, 'grey', { flat: true });
  },
};

export const BASE_LANDMARKS = { rookie, minor, metro, major, carnival, continental, world, storm, legends, grandprix, underground, dream, nightmare, zero };
