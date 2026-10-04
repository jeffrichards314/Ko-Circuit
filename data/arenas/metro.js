// Metro Circuit arena: Skyline Rooftop.
// A ring built on top of a downtown office tower at night: a navy sky with a
// few stars, the city skyline in three depths with lit windows, a water tower,
// a radio mast with blinking red aircraft lights, a neon billboard, floodlights
// on poles, and the crowd standing along the roof railing.
// Animated: the mast lights blink (palette), office windows switch on and off
// (palette), the billboard buzzes (palette), a helicopter crosses with its
// searchlight (overlay), and press flashes pop on knockdowns and stars.

import { makePalette } from '../../src/engine/palette.js';
import { rng } from '../../src/engine/arena.js';

const sky = makePalette('metro.sky', {
  sky0: [2, 2, 7], sky1: [3, 4, 10], sky2: [5, 6, 14], sky3: [8, 7, 17],
  star: [24, 24, 29],
  far: [6, 7, 15], mid: [4, 5, 11], near: [2, 3, 7], nearHi: [7, 8, 15],
  win: [29, 25, 12], win2: [29, 25, 12], winDim: [11, 10, 9],
  mast: [31, 4, 4], mastOff: [9, 2, 3], neon: [31, 8, 22],
});

const crowd = makePalette('metro.crowd', {
  outline: [2, 2, 4],
  skin1: [30, 22, 16], skin1s: [22, 14, 10],
  skin2: [22, 14, 9], skin2s: [14, 8, 6],
  skin3: [13, 8, 5], skin3s: [8, 5, 3],
  hairA: [4, 3, 3], hairB: [22, 16, 6], hairC: [18, 6, 4],
  shirtR: [22, 5, 9], shirtY: [26, 20, 6], shirtG: [5, 18, 16], shirtB: [8, 10, 24],
  shirtSh: [5, 4, 8],
});

const ring = makePalette('metro.ring', {
  ropeY: [30, 25, 4], ropeYs: [17, 12, 2],
  ropeK: [8, 8, 11], ropeKs: [3, 3, 5],
  postHi: [21, 22, 25], post: [13, 14, 17], postDk: [6, 6, 9],
  padO: [30, 13, 2], padOs: [18, 6, 2],
  rail: [16, 17, 21], railDk: [7, 8, 11],
  flood: [31, 31, 25], floodDim: [20, 20, 16],
  tank: [16, 10, 7], tankDk: [8, 5, 4],
});

const floor = makePalette('metro.canvas', {
  canvasHi: [22, 24, 27], canvas: [17, 19, 23], canvasSh: [12, 14, 18], canvasDk: [7, 8, 11],
  apron: [4, 5, 8],
  logo: [30, 25, 4], logoSh: [13, 14, 18],
  roof: [9, 9, 12], roofDk: [5, 5, 8],
  shadow: [10, 12, 15],
  heli: [5, 6, 9], heliHi: [12, 13, 17], beam: [18, 19, 16],
  billboard: [12, 3, 12], white: [30, 30, 30],
});

const RAIL_Y = 80;
const BACK_ROW = { y: 74, x0: 10, x1: 246, spacing: 11 };
const FRONT_ROW = { y: 84, x0: 16, x1: 240, spacing: 12 };
const MAST = [206, 30];               // top of the radio mast
const FLOODS = [[26, 38], [230, 38]];

// Buildings: [x, width, top, depth]  (depth 0 far, 1 mid, 2 near)
const BLDG = [
  [0, 18, 44, 0], [16, 14, 38, 0], [34, 20, 42, 0], [60, 12, 36, 0], [98, 22, 40, 0], [150, 16, 39, 0], [176, 24, 43, 0], [226, 30, 37, 0],
  [6, 22, 52, 1], [30, 16, 47, 1], [52, 24, 55, 1], [84, 18, 49, 1], [118, 26, 53, 1], [148, 14, 46, 1], [168, 20, 51, 1], [212, 20, 48, 1], [236, 20, 54, 1],
  [0, 26, 60, 2], [40, 20, 64, 2], [70, 30, 61, 2], [134, 24, 63, 2], [190, 28, 59, 2], [230, 26, 65, 2],
];

export default {
  id: 'metro',
  name: 'SKYLINE ROOFTOP',
  circuit: 'metro',
  music: 'metroFight',
  palettes: [sky, crowd, ring, floor],
  ring: {
    canvas: ['canvasHi', 'canvas', 'canvasSh', 'canvasDk'],
    ropes: ['ropeY', 'ropeK', 'ropeY'],
    turnbuckles: ['padO', 'padO'],
    pads: ['padO', 'padO'],
  },
  shadowColor: 'shadow',
  crowd: {
    style: 'standing',
    density: 0.72,
    excitable: 0.85,
    seed: 5150,
    outline: 'outline',
    rows: [BACK_ROW, FRONT_ROW],
    skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
    hairs: ['hairA', 'hairB', 'hairC', 'hairA'],
    shirts: [['shirtR', 'shirtSh'], ['shirtY', 'shirtSh'], ['shirtG', 'shirtSh'], ['shirtB', 'shirtSh']],
  },

  paintBack(p) {
    // night sky in bands, a few stars
    const bands = [['sky0', 0, 12], ['sky1', 12, 10], ['sky2', 22, 10], ['sky3', 32, 30]];
    for (const [k, y, h] of bands) p.rect(0, y, 256, h, k);
    for (const [k, y] of [['sky1', 11], ['sky2', 21], ['sky3', 31]]) p.dither(0, y - 2, 256, 3, k, 0.35);
    const R = rng(77);
    for (let i = 0; i < 40; i++) p.px(Math.floor(R() * 256), Math.floor(R() * 34), R() < 0.3 ? 'star' : 'sky3');
    // the skyline, far to near
    for (const [x, w, top, d] of BLDG) {
      const body = ['far', 'mid', 'near'][d];
      p.rect(x, top, w, 90 - top, body);
      if (d === 2) p.vline(x, top, 89, 'nearHi');
      if (d === 1 && w > 18) p.rect(x + w / 2 - 2, top - 5, 4, 5, body); // rooftop boxes
      if (d === 0 && w > 20) p.vline(x + 4, top - 8, top, body);          // antennas
      // windows: a grid, some lit
      const step = d === 0 ? [3, 4] : d === 1 ? [4, 5] : [5, 6];
      for (let wy = top + 3; wy < 88; wy += step[1]) for (let wx = x + 2; wx < x + w - 2; wx += step[0]) {
        const r = R();
        if (r < 0.34) p.px(wx, wy, r < 0.08 ? 'win2' : 'win');
        else if (r < 0.5 && d > 0) p.px(wx, wy, 'winDim');
        if (d === 2 && r < 0.34) p.px(wx + 1, wy, r < 0.08 ? 'win2' : 'win');
      }
    }
    // the radio mast with its lights
    const [mx, my] = MAST;
    p.line(mx - 8, 62, mx, my, 'nearHi'); p.line(mx + 8, 62, mx, my, 'nearHi'); p.vline(mx, my, 62, 'nearHi');
    for (let y = my + 6; y < 62; y += 6) p.hline(mx - Math.round((y - my) / 4), mx + Math.round((y - my) / 4), y, 'near');
    // neon billboard on the near building, left
    p.rect(40, 44, 44, 16, 'near'); p.rect(41, 45, 42, 14, 'billboard');
    p.text('KO COLA', 44, 49, 'neon', { mono: false });
    p.vline(52, 60, 64, 'near'); p.vline(72, 60, 64, 'near');
    // our own roof: a water tower on stilts (right) and the parapet
    p.rect(0, 64, 256, 26, 'roof');
    p.dither(0, 64, 256, 4, 'roofDk', 0.5);
    for (let x = 0; x < 256; x += 32) p.vline(x, 66, 89, 'roofDk');
    const tx = 162;
    for (const lx of [tx + 2, tx + 22]) p.vline(lx, 58, 76, 'tankDk');
    p.line(tx + 2, 70, tx + 22, 62, 'tankDk'); p.line(tx + 2, 62, tx + 22, 70, 'tankDk');
    p.rect(tx - 2, 38, 28, 22, 'tank'); p.ellipse(tx + 12, 38, 14, 4, 'tank');
    for (let x = tx; x < tx + 24; x += 4) p.vline(x, 40, 58, 'tankDk');
    p.hline(tx - 2, tx + 25, 45, 'tankDk'); p.hline(tx - 2, tx + 25, 53, 'tankDk');
    p.poly([[tx - 4, 38], [tx + 12, 28], [tx + 28, 38]], 'tankDk');
    // floodlight poles
    for (const [fx, fy] of FLOODS) {
      p.vline(fx, fy, 88, 'postDk'); p.vline(fx + 1, fy, 88, 'post');
      p.rect(fx - 6, fy - 4, 14, 6, 'postDk'); for (let k = 0; k < 3; k++) p.rect(fx - 5 + k * 5, fy - 3, 3, 3, 'floodDim');
    }
    // the railing the crowd leans on
    p.hline(0, 255, RAIL_Y - 12, 'rail'); p.hline(0, 255, RAIL_Y - 11, 'railDk');
    for (let x = 4; x < 256; x += 12) p.vline(x, RAIL_Y - 11, RAIL_Y - 1, 'railDk');
  },

  paintRing(p) {
    p.rect(0, 88, 256, 4, 'apron');
    p.hline(0, 255, 88, 'canvasDk');
    p.rect(0, 92, 256, 132, 'canvas');
    p.rect(0, 92, 256, 2, 'canvasHi');
    p.dither(0, 94, 256, 12, 'canvasSh', 0.35);
    p.dither(0, 106, 256, 10, 'canvasSh', 0.12);
    for (const [x, y] of [[40, 130], [210, 150], [70, 200], [190, 205], [130, 118], [20, 176], [236, 124]]) p.dither(x - 8, y - 3, 16, 6, 'canvasSh', 0.3, (i, j) => ((i - x) / 8) ** 2 + ((j - y) / 3) ** 2 < 1);
    // helipad-style logo: circle and a big M
    p.ellipse(128, 186, 62, 25, 'logoSh', false);
    p.ellipse(128, 186, 58, 22, 'logo', false);
    p.ellipse(128, 186, 55, 20, 'logoSh', false);
    const M = [[108, 196], [108, 176], [128, 190], [148, 176], [148, 196]];
    for (let i = 0; i + 1 < M.length; i++) { p.line(M[i][0], M[i][1], M[i + 1][0], M[i + 1][1], 'logo', 2); }
    p.text('METRO', 26, 182, 'logoSh', { mono: false });
    p.text('CIRCUIT', 190, 182, 'logoSh', { mono: false });
    p.dither(24, 160, 210, 52, 'canvas', 0.22, (i, j) => p.get(i, j) === p.c('logo') || p.get(i, j) === p.c('logoSh'));
    // caution-tape ropes: yellow / black / yellow
    const ropes = [[62, 'ropeY', 'ropeYs'], [70, 'ropeK', 'ropeKs'], [78, 'ropeY', 'ropeYs']];
    for (const [y, a, b] of ropes) {
      p.hline(16, 239, y, a); p.hline(16, 239, y + 1, b);
      for (let x = 20; x < 240; x += 8) { p.px(x, y, a === 'ropeY' ? 'ropeK' : 'ropeY'); p.px(x + 1, y + 1, a === 'ropeY' ? 'ropeKs' : 'ropeYs'); }
    }
    for (const [y, a, b] of ropes) {
      p.line(12, y, -10, y + 38, a); p.line(12, y + 1, -10, y + 39, b);
      p.line(243, y, 266, y + 38, a); p.line(243, y + 1, 266, y + 39, b);
    }
    // steel posts, orange pads
    for (const x of [8, 241]) {
      p.rect(x, 50, 7, 44, 'postDk');
      p.rect(x + 1, 50, 5, 44, 'post');
      p.vline(x + 2, 51, 92, 'postHi');
      p.rect(x - 1, 57, 9, 27, 'padOs');
      p.rect(x, 58, 7, 25, 'padO');
      p.vline(x + 1, 59, 81, 'ropeY');
      for (const [y] of ropes) p.hline(x, x + 6, y + 2, 'padOs');
      p.rect(x - 1, 92, 9, 3, 'postDk');
    }
  },

  paletteAnim(t, live, pal, state) {
    const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
    // aircraft warning lights: a slow blink
    if (t % 80 >= 40) set('mast', 'mastOff');
    // somebody's working late: a block of windows goes off and on
    if ((t % 700) > 520) set('win2', 'winDim');
    // the billboard neon buzzes now and then
    if ((t % 330) > 300 && (t >> 1) & 1) set('neon', 'billboard');
    // press flashes light up the roof
    if (state.flash > 0) {
      state.flash--;
      if (state.flash > 3) { set('roof', 'rail'); set('canvas', 'canvasHi'); set('canvasSh', 'canvas'); set('near', 'nearHi'); }
    }
  },

  onReaction(kind, state) {
    if (kind === 'knockdown' || kind === 'ko' || kind === 'star') { state.flash = kind === 'star' ? 7 : 10; state.flashX = 30 + Math.floor(Math.random() * 196); }
  },

  overlay(frame, arena, t, state) {
    const col = (k) => arena.live[arena.pal.idx(k)];
    // blinking mast lights
    const [mx, my] = MAST;
    frame.rect(mx - 1, my - 1, 3, 2, col('mast'));
    frame.px(mx - 4, my + 14, col('mast')); frame.px(mx + 4, my + 14, col('mast'));
    // floodlights: lit lamps
    for (const [fx, fy] of FLOODS) for (let k = 0; k < 3; k++) frame.rect(fx - 5 + k * 5, fy - 3, 3, 2, col('flood'));
    // the news helicopter crosses every ~17 seconds, searchlight sweeping the crowd
    const cyc = t % 1020;
    if (cyc < 420) {
      const hx = Math.round(-30 + cyc * 0.75), hy = 40 + Math.round(Math.sin(cyc * 0.03) * 2);
      const beamX = hx + Math.round(Math.sin(cyc * 0.05) * 18);
      const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
      for (let y = hy + 4; y < 86; y++) {
        const k = (y - hy) / (86 - hy), half = 2 + k * 12, cx = hx + (beamX - hx) * k;
        for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) if (B[(y & 3) * 4 + (x & 3)] / 16 < 0.3) frame.px(x, y, col('beam'));
      }
      // body, tail, skids, rotor blur
      frame.rect(hx - 5, hy - 2, 11, 6, col('heli'));
      frame.rect(hx - 4, hy - 3, 9, 1, col('heli'));
      frame.rect(hx + 2, hy - 1, 3, 2, col('heliHi'));
      frame.rect(hx - 17, hy, 12, 2, col('heli'));
      frame.rect(hx - 18, hy - 3, 2, 4, col('heli'));
      frame.rect(hx - 5, hy + 5, 11, 1, col('heli'));
      const rw = (t >> 1) & 1 ? 14 : 10;
      frame.rect(hx - rw, hy - 5, rw * 2 + 1, 1, col('heliHi'));
      if ((t >> 3) & 1) frame.px(hx - 18, hy - 4, col('mast'));
    }
    // a press camera flash somewhere in the crowd
    if (state.flash > 3) {
      const x = state.flashX, y = 64, c = col('white');
      for (let i = -3; i <= 3; i++) { frame.px(x + i, y, c); frame.px(x, y + i, c); }
    }
  },
};
