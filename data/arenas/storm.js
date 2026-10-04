// Storm Circuit arena: The Eye of the Storm.
// An open-air ring on a hilltop in a thunderstorm: boiling storm clouds, the
// crowd in rain ponchos behind a chain-link barrier, a steel-grey ring with
// hazard-yellow ropes on a soaked canvas full of puddles.
// Animated: rain falls across the whole backdrop and splashes on the apron
// (overlay), lightning forks down out of the clouds at random and the flash
// lights up the crowd and the clouds (palette + overlay), the puddles ripple,
// and a pennant on the floodlight pole whips in the wind. Knockdowns and stars bring a
// thunderclap; Bolt Brennan's own strikes use the same flash.

import { makePalette } from '../../src/engine/palette.js';

const sky = makePalette('storm.sky', {
  sky: [3, 4, 8], cloud: [6, 7, 12], cloudHi: [10, 11, 17], cloudLit: [22, 23, 29],
  bolt: [31, 31, 31], boltGlow: [22, 25, 31],
  hill: [3, 5, 5], fence: [11, 12, 14], fenceHi: [17, 18, 21],
  tarp: [6, 14, 22], tarpSh: [3, 8, 14],
  rain: [14, 17, 24], rainHi: [21, 24, 29],
  lamp: [31, 26, 12],
});

const crowd = makePalette('storm.crowd', {
  outline: [2, 2, 4],
  skin1: [27, 20, 15], skin1s: [19, 13, 10],
  skin2: [20, 13, 9], skin2s: [12, 8, 6],
  skin3: [12, 8, 5], skin3s: [7, 4, 3],
  hairA: [3, 3, 4], hairB: [20, 15, 7], hairC: [16, 6, 4],
  shirtR: [26, 7, 6], shirtY: [28, 23, 4], shirtG: [5, 17, 10], shirtB: [6, 10, 23],
  shirtSh: [3, 3, 6],
});

const ring = makePalette('storm.ring', {
  ropeY: [30, 25, 4], ropeYs: [16, 12, 2],
  ropeK: [6, 6, 8], ropeKs: [2, 2, 3],
  postHi: [20, 21, 25], post: [12, 13, 17], postDk: [5, 6, 8],
  padY: [27, 21, 3], padYs: [14, 10, 2],
  apron: [4, 5, 8], apronHi: [27, 22, 4],
  splash: [24, 27, 31],
});

const floor = makePalette('storm.canvas', {
  canvasHi: [22, 23, 26], canvas: [17, 18, 22], canvasSh: [13, 14, 18], canvasDk: [7, 8, 11],
  puddle: [9, 11, 17], puddleHi: [20, 23, 30],
  shadow: [11, 12, 16],
  logo: [27, 22, 4], logoSh: [13, 14, 18],
});

const ROWS = [
  { y: 60, x0: 6, x1: 250, spacing: 11 },
  { y: 72, x0: 2, x1: 254, spacing: 10 },
  { y: 84, x0: 8, x1: 248, spacing: 11 },
];
const PUDDLES = [[52, 128, 18, 4], [196, 138, 22, 5], [96, 204, 20, 4], [170, 212, 16, 3], [30, 176, 12, 3], [228, 188, 12, 3]];

// Lightning: a jagged fork from the clouds down to the hills, regenerated per strike.
function makeBolt(seed) {
  let s = seed >>> 0 || 1;
  const R = () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  const x0 = 24 + R() * 208;
  // from the cloud base just under the HUD down to the hills behind the crowd
  const pts = [[x0, 28]];
  let x = x0, y = 28;
  while (y < 50) { y += 2 + R() * 4; x += (R() - 0.5) * 12; pts.push([x, y]); }
  const fork = [];
  const k = 2 + Math.floor(R() * (pts.length - 3));
  let fx = pts[k][0], fy = pts[k][1];
  fork.push([fx, fy]);
  for (let i = 0; i < 3; i++) { fy += 2 + R() * 3; fx += (R() < 0.5 ? -1 : 1) * (3 + R() * 5); fork.push([fx, fy]); }
  return { pts, fork, x: x0 };
}

export default {
  id: 'storm',
  name: 'THE EYE OF THE STORM',
  circuit: 'storm',
  music: 'stormFight',
  palettes: [sky, crowd, ring, floor],
  ring: {
    canvas: ['canvasHi', 'canvas', 'canvasSh', 'canvasDk'],
    ropes: ['ropeY', 'ropeK', 'ropeY'],
    turnbuckles: ['padY', 'padY'],
    pads: ['padY', 'padY'],
  },
  shadowColor: 'shadow',
  crowd: {
    style: 'ponchos',
    density: 0.8,
    excitable: 0.85,
    seed: 4242,
    outline: 'outline',
    rows: ROWS,
    skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
    hairs: ['shirtY', 'shirtR', 'shirtB', 'hairA'], // hoods up
    shirts: [['shirtR', 'shirtSh'], ['shirtY', 'shirtSh'], ['shirtG', 'shirtSh'], ['shirtB', 'shirtSh']],
  },

  paintBack(p) {
    p.rect(0, 0, 256, 92, 'sky');
    // boiling clouds: stacked lumpy bands
    for (let band = 0; band < 5; band++) {
      const y0 = band * 8 - 4;
      for (let x = -10; x < 266; x += 14) {
        const r = 7 + ((x * 7 + band * 13) % 5);
        p.ellipse(x + (band % 2) * 7, y0 + 6 + ((x * 3 + band) % 4), r, r * 0.6, band % 2 ? 'cloud' : 'cloudHi');
      }
    }
    p.dither(0, 30, 256, 16, 'sky', 0.4);
    // dark hills on the horizon
    for (let x = 0; x < 256; x++) { const h = 44 + Math.round(Math.sin(x * 0.04) * 3 + Math.sin(x * 0.11 + 1) * 2); p.vline(x, h, 56, 'hill'); }
    // floodlight poles, lamps glowing through the rain
    for (const x of [30, 226]) { p.vline(x, 10, 56, 'fence'); p.rect(x - 6, 8, 13, 4, 'fence'); for (let i = 0; i < 3; i++) p.rect(x - 5 + i * 4, 9, 3, 2, 'lamp'); }
    // chain-link fence behind the crowd
    p.rect(0, 52, 256, 40, 'hill');
    for (let x = 0; x < 256; x += 4) for (let y = 52; y < 92; y++) if (((x + y) & 7) === 0 || ((x - y) & 7) === 0) p.px(x, y, 'fence');
    p.hline(0, 255, 52, 'fenceHi');
    for (let x = 0; x < 256; x += 32) p.vline(x, 50, 91, 'fenceHi');
    p.rect(0, 86, 256, 6, 'hill');
  },

  paintRing(p) {
    p.rect(0, 88, 256, 4, 'apron');
    for (let x = 0; x < 256; x += 12) for (let j = 0; j < 4; j++) p.hline(x + j, x + j + 5, 88 + j, 'apronHi');
    p.hline(0, 255, 88, 'canvasDk');
    p.rect(0, 92, 256, 132, 'canvas');
    p.rect(0, 92, 256, 2, 'canvasHi');
    p.dither(0, 94, 256, 14, 'canvasSh', 0.4);
    p.dither(0, 108, 256, 12, 'canvasSh', 0.15);
    // the storm logo: a bolt in a circle
    p.ellipse(128, 184, 30, 13, 'logo', false);
    p.poly([[134, 172], [120, 186], [128, 186], [120, 197], [138, 182], [130, 182]], 'logo');
    p.text('STORM', 30, 150, 'logo', { mono: false });
    p.text('CIRCUIT', 190, 150, 'logo', { mono: false });
    p.dither(90, 168, 76, 32, 'canvas', 0.3, (i, j) => p.get(i, j) === p.c('logo'));
    // puddles
    for (const [x, y, rx, ry] of PUDDLES) { p.ellipse(x, y, rx, ry, 'puddle'); p.hline(x - rx + 4, x - 2, y - 1, 'puddleHi'); }
    const ropes = [[62, 'ropeY', 'ropeYs'], [70, 'ropeK', 'ropeKs'], [78, 'ropeY', 'ropeYs']];
    for (const [y, a, b] of ropes) { p.hline(16, 239, y, a); p.hline(16, 239, y + 1, b); for (let x = 22; x < 240; x += 8) p.px(x, y, b); }
    for (const [y, a, b] of ropes) {
      p.line(12, y, -10, y + 38, a); p.line(12, y + 1, -10, y + 39, b);
      p.line(243, y, 266, y + 38, a); p.line(243, y + 1, 266, y + 39, b);
    }
    for (const x of [8, 241]) {
      p.rect(x, 50, 7, 44, 'postDk'); p.rect(x + 1, 50, 5, 44, 'post'); p.vline(x + 2, 51, 92, 'postHi');
      p.rect(x - 1, 57, 9, 27, 'padYs'); p.rect(x, 58, 7, 25, 'padY');
      for (let y = 59; y < 82; y += 6) p.hline(x, x + 6, y, 'ropeK');
      p.rect(x - 1, 92, 9, 3, 'postDk');
    }
  },

  paletteAnim(t, live, pal, state) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    // ambient lightning on its own irregular clock
    if (!state.next) state.next = 200;
    if (t >= state.next) { state.strike = 9; state.boltSeed = t * 2654435761; state.next = t + 240 + ((t * 7919) % 420); }
    if (state.strike > 0) {
      state.strike--;
      const on = state.strike > 6 || state.strike === 3 || state.strike === 2; // a double flicker
      if (on) {
        set('cloud', 'cloudLit'); set('cloudHi', 'bolt'); set('sky', 'cloudHi'); set('hill', 'fence');
        for (const k of ['skin1s', 'skin2s', 'skin3s']) set(k, k.slice(0, 5));
        set('shirtSh', 'fenceHi'); set('canvasSh', 'canvasHi'); set('puddle', 'puddleHi');
      }
    }
    if (state.flash > 0) { state.flash--; set('lamp', 'bolt'); }
  },

  onReaction(kind, state) {
    if (kind === 'knockdown' || kind === 'ko' || kind === 'lightning') { state.strike = 9; state.boltSeed = Math.floor(Math.random() * 1e9); }
    if (kind === 'star') state.flash = 12;
  },

  overlay(frame, arena, t, state) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    // the bolt itself while the strike is on
    if (state.strike > 4) {
      const b = makeBolt(state.boltSeed);
      const draw = (pts, c, w) => { for (let i = 0; i + 1 < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)); for (let k = 0; k <= n; k++) { const X = Math.round(x0 + (x1 - x0) * k / n), Y = Math.round(y0 + (y1 - y0) * k / n); for (let d = 0; d < w; d++) frame.px(X + d, Y, c); } } };
      draw(b.pts, col('boltGlow'), 3); draw(b.fork, col('boltGlow'), 2);
      draw(b.pts, col('bolt'), 1); draw(b.fork, col('bolt'), 1);
    }
    // rain over the backdrop (the fighters' own rain is Downpour's)
    for (let i = 0; i < 90; i++) {
      const seed = (i * 2654435761) >>> 0;
      const x0 = seed % 256, sp = 4 + ((seed >> 9) % 3);
      const y = ((seed >> 4) % 100 + t * sp) % 100;
      const x = (x0 - Math.floor(y / 3) + 256) % 256;
      frame.px(x, y, col('rain')); frame.px(x, y + 1, col('rain'));
      if (i % 3 === 0) frame.px(x - 1, y + 3, col('rainHi'));
    }
    // splashes on the apron
    for (let i = 0; i < 6; i++) { const k = (t + i * 23) % 40; if (k < 6) { const x = (i * 47 + (t >> 5) * 13) % 250 + 3; frame.px(x - (k >> 1), 89 - (k >> 1), col('splash')); frame.px(x + (k >> 1), 89 - (k >> 1), col('splash')); } }
    // puddle ripples
    for (const [x, y] of PUDDLES) {
      const k = (t + x) % 48;
      if (k < 24) { const r = 1 + k / 5; for (let a = 0; a < 10; a++) { const th = (a / 10) * Math.PI * 2; frame.px(Math.round(x + Math.cos(th) * r * 1.8), Math.round(y + Math.sin(th) * r * 0.5), col('puddleHi')); } }
    }
    // a torn pennant on the floodlight pole, whipping in the wind
    for (let j = 0; j < 7; j++) {
      const len = 16 - j * 2 + Math.round(Math.sin(t * 0.3 + j * 0.8) * 2);
      frame.rect(227, 13 + j, Math.max(2, len), 1, col(j & 1 ? 'tarpSh' : 'tarp'));
    }
  },
};
