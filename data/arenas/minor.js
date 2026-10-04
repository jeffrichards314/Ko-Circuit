// Minor Circuit arena: Pinewood Civic Hall.
// Small-town civic hall on fight night: dark timber ceiling beams, a big
// ceiling fan, cream plaster over knotty-pine paneling, a little stage with red
// curtains behind the ring, the town's framed founders, a bulletin board, tall
// windows onto the night street, and a sparse crowd on long wooden benches.
// Animated: ceiling fan (overlay), headlights sweeping across the windows
// (palette), the crowd, and the town-paper photographer's flashbulb on
// knockdowns and stars.

import { makePalette } from '../../src/engine/palette.js';

const wall = makePalette('minor.wall', {
  beam: [7, 4, 3], beamHi: [13, 8, 5], ceil: [4, 3, 3],
  plaster: [26, 23, 17], plasterSh: [20, 17, 12],
  woodHi: [25, 16, 8], wood: [20, 12, 6], woodSh: [15, 8, 4], woodDk: [9, 5, 2],
  trim: [6, 4, 2],
  lamp: [31, 27, 17], lampDim: [18, 14, 8],
  night: [3, 5, 12], lit: [28, 27, 20], litDim: [10, 11, 17],
});

const crowd = makePalette('minor.crowd', {
  outline: [3, 2, 3],
  skin1: [30, 22, 16], skin1s: [23, 15, 10],
  skin2: [22, 14, 9], skin2s: [15, 9, 6],
  skin3: [13, 8, 5], skin3s: [8, 5, 3],
  hairA: [5, 3, 2], hairB: [20, 13, 5], hairC: [24, 24, 25],
  shirtR: [21, 6, 6], shirtY: [26, 22, 12], shirtG: [9, 16, 9], shirtB: [9, 12, 20],
  shirtSh: [7, 5, 6],
});

const ring = makePalette('minor.ring', {
  ropeG: [6, 19, 9], ropeGs: [2, 10, 4],
  ropeW: [29, 28, 25], ropeWs: [18, 17, 16],
  ropeY: [29, 22, 5], ropeYs: [17, 11, 2],
  postHi: [22, 16, 10], post: [14, 9, 5], postDk: [7, 4, 2],
  padG: [8, 20, 10], padGs: [3, 11, 5],
  padY: [29, 22, 6], padYs: [17, 11, 3],
  bench: [18, 11, 5], benchDk: [10, 6, 3],
});

const floor = makePalette('minor.canvas', {
  canvasHi: [28, 26, 21], canvas: [25, 22, 17], canvasSh: [20, 17, 13], canvasDk: [13, 11, 8],
  apron: [9, 6, 4],
  logo: [8, 18, 10], logoSh: [21, 18, 13],
  curtainHi: [26, 6, 8], curtain: [18, 3, 5], curtainDk: [9, 1, 3],
  shadow: [15, 13, 10],
  gold: [30, 24, 8],
  paper: [29, 29, 26], pin: [26, 5, 5],
});

const BACK_ROW = { y: 72, x0: 12, x1: 244, spacing: 13, skip: [[60, 196]] };
const FRONT_ROW = { y: 84, x0: 20, x1: 236, spacing: 14 };
const FAN = [128, 33]; // hangs in front of the stage valance, below the HUD
const WINDOWS = [[18, 34], [202, 34]]; // x, y of each window (3 panes each)
const PHOTOG = [236, 70];

export default {
  id: 'minor',
  name: 'PINEWOOD CIVIC HALL',
  circuit: 'minor',
  music: 'minorFight',
  palettes: [wall, crowd, ring, floor],
  ring: {
    canvas: ['canvasHi', 'canvas', 'canvasSh', 'canvasDk'],
    ropes: ['ropeG', 'ropeW', 'ropeY'],
    turnbuckles: ['padG', 'padY'],
    pads: ['padG', 'padY'],
  },
  shadowColor: 'shadow',
  crowd: {
    style: 'seated',
    density: 0.42,          // sparse: it's a small town
    excitable: 0.7,
    seed: 2112,
    outline: 'outline',
    rows: [BACK_ROW, FRONT_ROW],
    skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
    hairs: ['hairA', 'hairB', 'hairC', 'hairC'],
    shirts: [['shirtR', 'shirtSh'], ['shirtY', 'shirtSh'], ['shirtG', 'shirtSh'], ['shirtB', 'shirtSh']],
  },

  paintBack(p) {
    // timber ceiling with beams running toward the camera
    p.rect(0, 0, 256, 28, 'ceil');
    for (let x = -20; x < 280; x += 36) { p.line(x + 18, 0, x + 8, 27, 'beam'); p.line(x + 19, 0, x + 9, 27, 'beamHi'); }
    p.rect(0, 22, 256, 4, 'beam'); p.hline(0, 255, 22, 'beamHi'); p.hline(0, 255, 26, 'trim');
    // plaster upper wall, crown trim
    p.rect(0, 27, 256, 17, 'plaster');
    p.hline(0, 255, 27, 'woodDk'); p.hline(0, 255, 28, 'wood');
    p.dither(0, 29, 256, 3, 'plasterSh', 0.3);
    // knotty-pine paneling with a chair rail
    p.rect(0, 44, 256, 44, 'wood');
    p.hline(0, 255, 44, 'woodDk'); p.hline(0, 255, 45, 'woodHi'); p.hline(0, 255, 47, 'woodDk');
    for (let x = 3; x < 256; x += 9) { p.vline(x, 48, 87, 'woodSh'); p.vline(x + 1, 48, 87, 'woodHi'); }
    const knots = [[14, 60], [50, 66], [95, 55], [150, 70], [199, 58], [233, 64], [30, 76], [180, 80]];
    for (const [x, y] of knots) { p.ellipse(x, y, 1.8, 1.2, 'woodDk'); p.px(x, y, 'woodSh'); }
    // tall windows onto the night street (3 panes each)
    for (const [wx, wy] of WINDOWS) {
      p.rect(wx - 1, wy - 1, 38, 26, 'woodDk');
      p.rect(wx, wy, 36, 24, 'trim');
      for (let i = 0; i < 3; i++) p.rect(wx + 1 + i * 12, wy + 1, 10, 22, 'night');
      p.hline(wx, wx + 35, wy + 11, 'trim');
      p.rect(wx - 2, wy + 24, 40, 2, 'woodHi');
    }
    // framed town founders + a bulletin board
    for (const [x, y] of [[64, 31], [180, 31]]) {
      p.rect(x, y, 12, 11, 'woodDk'); p.rect(x + 1, y + 1, 10, 9, 'plasterSh');
      p.ellipse(x + 6, y + 4, 2.4, 2.6, 'woodSh'); p.rect(x + 3, y + 7, 7, 3, 'woodSh');
    }
    // the stage: proscenium, curtains, banner
    p.rect(58, 30, 140, 58, 'trim');
    p.rect(60, 32, 136, 54, 'curtainDk');
    for (let x = 60; x < 196; x += 6) { p.vline(x + 1, 36, 85, 'curtain'); p.vline(x + 2, 36, 85, 'curtainHi'); p.vline(x + 3, 36, 85, 'curtain'); }
    p.rect(60, 32, 136, 6, 'curtain'); for (let x = 60; x < 196; x += 8) p.ellipse(x + 4, 38, 4, 2, 'curtain');
    p.hline(60, 195, 32, 'curtainHi');
    p.rect(84, 40, 88, 13, 'woodDk'); p.rect(85, 41, 86, 11, 'paper');
    p.text('FIGHT NIGHT', 128 - 38, 43, 'curtain', { mono: false });
    p.line(78, 33, 86, 40, 'trim'); p.line(178, 33, 170, 40, 'trim');
    // bulletin board with flyers
    p.rect(216, 62, 30, 20, 'woodDk'); p.rect(217, 63, 28, 18, 'woodSh');
    for (const [x, y, w, h] of [[219, 65, 8, 9], [229, 64, 7, 7], [238, 66, 6, 10], [228, 73, 9, 6]]) { p.rect(x, y, w, h, 'paper'); p.px(x + Math.floor(w / 2), y, 'pin'); p.hline(x + 1, x + w - 2, y + 3, 'plasterSh'); }
    // long wooden benches
    for (const row of [BACK_ROW, FRONT_ROW]) {
      for (const [a, b] of row.skip ? [[row.x0 - 8, row.skip[0][0] - 4], [row.skip[0][1] + 4, row.x1 + 8]] : [[row.x0 - 8, row.x1 + 8]]) {
        p.rect(a, row.y - 4, b - a, 3, 'bench'); p.hline(a, b - 1, row.y - 4, 'postHi'); p.hline(a, b - 1, row.y - 1, 'benchDk');
        for (let x = a + 4; x < b; x += 26) { p.vline(x, row.y - 1, row.y + 4, 'benchDk'); }
      }
    }
    // the photographer from the town paper, standing at ringside (right)
    const [px, py] = PHOTOG;
    p.rect(px - 3, py - 13, 7, 9, 'shirtSh'); p.ellipse(px, py - 16, 2.6, 2.8, 'skin1'); p.hline(px - 3, px + 3, py - 18, 'hairA');
    p.rect(px - 7, py - 13, 5, 4, 'trim'); p.px(px - 7, py - 12, 'litDim');
    p.rect(px - 6, py - 17, 3, 3, 'lampDim');
  },

  paintRing(p) {
    p.rect(0, 88, 256, 4, 'apron');
    p.hline(0, 255, 88, 'canvasDk');
    p.rect(0, 92, 256, 132, 'canvas');
    p.rect(0, 92, 256, 2, 'canvasHi');
    p.dither(0, 94, 256, 12, 'canvasSh', 0.35);
    p.dither(0, 106, 256, 10, 'canvasSh', 0.12);
    const scuffs = [[36, 136], [214, 156], [80, 206], [180, 196], [124, 124], [24, 186], [232, 120]];
    for (const [x, y] of scuffs) p.dither(x - 8, y - 3, 16, 6, 'canvasSh', 0.3, (i, j) => ((i - x) / 8) ** 2 + ((j - y) / 3) ** 2 < 1);
    // the town seal on the canvas
    p.ellipse(128, 186, 60, 24, 'logoSh', false);
    p.ellipse(128, 186, 56, 21, 'logo', false);
    p.ellipse(128, 186, 50, 18, 'logoSh', false);
    for (const [x, y] of [[128, 172], [118, 180], [138, 180], [128, 180]]) { p.line(x, y, x - 5, y + 9, 'logo'); p.line(x, y, x + 5, y + 9, 'logo'); }
    p.text('PINEWOOD', 30, 182, 'logoSh', { mono: false });
    p.text('EST. 1887', 172, 182, 'logoSh', { mono: false });
    p.dither(30, 160, 200, 52, 'canvas', 0.25, (i, j) => p.get(i, j) === p.c('logo') || p.get(i, j) === p.c('logoSh'));
    // ropes: green / white / gold
    const ropes = [[62, 'ropeG', 'ropeGs'], [70, 'ropeW', 'ropeWs'], [78, 'ropeY', 'ropeYs']];
    for (const [y, a, b] of ropes) {
      p.hline(16, 239, y, a); p.hline(16, 239, y + 1, b);
      for (let x = 20; x < 240; x += 9) p.px(x, y, b);
    }
    for (const [y, a, b] of ropes) {
      p.line(12, y, -10, y + 38, a); p.line(12, y + 1, -10, y + 39, b);
      p.line(243, y, 266, y + 38, a); p.line(243, y + 1, 266, y + 39, b);
    }
    // wooden posts with padded turnbuckles
    for (const [x, pad, padS] of [[8, 'padG', 'padGs'], [241, 'padY', 'padYs']]) {
      p.rect(x, 50, 7, 44, 'postDk');
      p.rect(x + 1, 50, 5, 44, 'post');
      p.vline(x + 2, 51, 92, 'postHi');
      p.rect(x - 1, 57, 9, 27, padS);
      p.rect(x, 58, 7, 25, pad);
      p.vline(x + 1, 59, 81, 'ropeW');
      for (const [y] of ropes) p.hline(x, x + 6, y + 2, padS);
      p.rect(x - 1, 92, 9, 3, 'postDk');
    }
  },

  // Headlights: every few seconds a car passes, sweeping light pane by pane.
  paletteAnim(t, live, pal, state, arena) {
    const cyc = t % 520;
    if (cyc < 60) {
      // one pane lit at a time, left to right, fading in and out
      const lit = pal.u32[pal.idx('lit')], dim = pal.u32[pal.idx('litDim')];
      const pane = Math.floor(cyc / 10);
      state.pane = pane;
      state.paneCol = cyc % 10 < 2 || cyc % 10 > 7 ? dim : lit;
    } else state.pane = -1;
    // flashbulb: the hall lights up for a few frames
    if (state.flash > 0) {
      state.flash--;
      if (state.flash > 3) {
        const up = { plaster: 'lit', wood: 'woodHi', woodHi: 'lit', canvas: 'canvasHi', canvasHi: 'lit', curtain: 'curtainHi' };
        for (const [k, v] of Object.entries(up)) live[pal.idx(k)] = pal.u32[pal.idx(v)];
      }
    }
  },

  onReaction(kind, state) {
    if (kind === 'knockdown' || kind === 'ko' || kind === 'star') state.flash = kind === 'star' ? 7 : 10;
  },

  overlay(frame, arena, t, state) {
    const pal = arena.live, P = arena.pal;
    const col = (k) => pal[P.idx(k)];
    // headlight sweep across the windows
    if (state.pane >= 0) {
      const i = state.pane;
      const [wx, wy] = WINDOWS[i < 3 ? 0 : 1];
      const pane = i % 3;
      frame.rect(wx + 1 + pane * 12, wy + 1, 10, 10, state.paneCol);
      frame.rect(wx + 1 + pane * 12, wy + 12, 10, 11, state.paneCol);
    }
    // ceiling fan: downrod, motor, four blades seen from below at an angle
    const [cx, cy] = FAN;
    frame.rect(cx, 0, 1, cy - 2, col('trim'));
    const a0 = t * 0.11;
    for (let b = 0; b < 4; b++) {
      const a = a0 + (b * Math.PI) / 2;
      const ca = Math.cos(a), sa = Math.sin(a);
      for (let r = 5; r <= 34; r++) {
        const x = Math.round(cx + ca * r), y = Math.round(cy + sa * r * 0.22);
        const w = r > 10 ? 2 : 1;
        for (let k = -w + 1; k <= 0; k++) frame.px(x, y + k, col(sa > 0 ? 'woodSh' : 'wood'));
        frame.px(x, y + 1, col('beam'));
      }
    }
    frame.rect(cx - 4, cy - 3, 9, 5, col('woodDk'));
    frame.rect(cx - 3, cy - 3, 7, 1, col('woodHi'));
    frame.rect(cx - 2, cy + 2, 5, 2, col('lamp'));
    // pendant lamps over the benches
    for (const lx of [40, 216]) {
      frame.rect(lx, 0, 1, 31, col('trim'));
      for (let j = 0; j < 5; j++) frame.rect(lx - 2 - j, 31 + j, 5 + j * 2, 1, col(j === 4 ? 'lampDim' : 'woodDk'));
      frame.rect(lx - 5, 36, 11, 1, col('lamp'));
      frame.rect(lx - 1, 37, 3, 1, col('lamp'));
    }
    // the photographer's flashbulb
    if (state.flash > 0) {
      const [px, py] = PHOTOG;
      const X = px - 5, Y = py - 18, c = col('lit');
      for (let i = -3; i <= 3; i++) { frame.px(X + i, Y, c); frame.px(X, Y + i, c); }
      frame.px(X - 1, Y - 1, c); frame.px(X + 1, Y + 1, c); frame.px(X + 1, Y - 1, c); frame.px(X - 1, Y + 1, c);
    }
  },
};
