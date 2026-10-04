// The rival's arena (§2b, §11b): the Night Gym. The Eastside Boxing Club after
// hours, the empty amateur gym where the player and Dash Maddox trained side by
// side. Brick walls in blue night light, tall windows with the moon and the city,
// one caged lamp hanging over the ring, heavy bags on chains, a speed-bag
// platform, a row of lockers, the old club sign. One arena for all four rival
// fights, dressed a little bigger each time as word gets around:
//   I    empty: two gym regulars on a bench, nothing on the walls
//   II   folding chairs half full, a hand-painted DASH banner
//   III  full benches, banners for both of you, a TV camera with a tally light
//   IV   standing room only, streamers, a SHOWDOWN banner across the windows
// Animated: the lamp's glow flickers, the heavy bags sway, the camera's tally
// light blinks (III, IV), the city's windows twinkle, crowd reactions.
import { makePalette } from '../../src/engine/palette.js';

const wall = makePalette('nightgym.wall', {
  night: [2, 3, 8], nightHi: [4, 6, 13],
  brickHi: [9, 9, 17], brick: [6, 6, 13], brickSh: [4, 4, 9], mortar: [3, 3, 7],
  moon: [30, 30, 25], moonSh: [22, 22, 20],
  city: [5, 6, 12], cityLit: [29, 24, 11], cityDim: [14, 11, 6],
  frame: [11, 10, 12], frameHi: [17, 16, 18],
  sign: [22, 19, 12],
});
const crowd = makePalette('nightgym.crowd', {
  outline: [2, 2, 4],
  skin1: [27, 20, 15], skin1s: [19, 13, 9],
  skin2: [19, 12, 8], skin2s: [12, 7, 5],
  skin3: [11, 7, 5], skin3s: [7, 4, 3],
  hairA: [3, 3, 4], hairB: [16, 9, 4], hairC: [20, 20, 22],
  shirtT: [3, 18, 17], shirtR: [22, 6, 7], shirtG: [14, 15, 18], shirtSh: [5, 6, 10],
});
const props = makePalette('nightgym.props', {
  bagHi: [23, 7, 7], bag: [16, 4, 5], bagDk: [8, 2, 3],
  chain: [14, 15, 18],
  metalHi: [21, 22, 25], metal: [12, 13, 16], metalDk: [6, 6, 9],
  locker: [7, 12, 14], lockerHi: [11, 17, 19],
  lamp: [31, 29, 20], lampDim: [22, 19, 11], glow: [16, 13, 9],
  tally: [31, 4, 4], tallyOff: [10, 2, 3],
});
const ring = makePalette('nightgym.ring', {
  canvasHi: [22, 21, 19], canvas: [17, 16, 15], canvasSh: [12, 12, 12], canvasDk: [7, 7, 9],
  apron: [4, 4, 7], shadow: [8, 8, 10],
  ropeT: [4, 22, 21], ropeTs: [1, 11, 12], ropeW: [26, 26, 26], ropeWs: [15, 15, 18],
  pad: [4, 20, 19], padS: [1, 10, 11],
  banner: [3, 18, 17], bannerTxt: [31, 31, 28],
  banner2: [24, 8, 8],
});

// (the HUD covers the top ~38 rows: the wall's story is told between y 38 and the ropes)
const W_LEFT = [16, 38], W_RIGHT = [196, 38]; // window tops

function build(stage) {
  const BENCH = { y: 70, x0: 150, x1: 176, spacing: 13 };
  const BACK_ROW = { y: 68, x0: 10, x1: 246, spacing: 12, skip: [[62, 194]] };
  const FRONT_ROW = { y: 79, x0: 20, x1: 238, spacing: 13 };
  const rows = stage === 1 ? [BENCH] : stage === 2 ? [FRONT_ROW] : [BACK_ROW, FRONT_ROW];
  const density = [0, 1, 0.45, 0.8, 1][stage];

  return {
    id: `nightgym${stage}`,
    name: 'EASTSIDE GYM - AFTER HOURS',
    circuit: `rival${stage}`,
    music: stage === 4 ? 'rivalShowdown' : 'rivalFight',
    palettes: [wall, crowd, props, ring],
    ring: { canvas: ['canvasHi', 'canvas', 'canvasSh', 'canvasDk'], ropes: ['ropeT', 'ropeW', 'ropeT'], turnbuckles: ['pad', 'pad'], pads: ['pad', 'pad'] },
    shadowColor: 'shadow',
    crowd: {
      style: 'seated', density, excitable: 0.9, seed: 4040 + stage, outline: 'outline', rows,
      skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
      hairs: ['hairA', 'hairB', 'hairC', 'hairA'],
      shirts: [['shirtT', 'shirtSh'], ['shirtR', 'shirtSh'], ['shirtG', 'shirtSh'], ['shirtT', 'shirtSh']],
    },

    paintBack(p) {
      // ceiling in darkness
      p.rect(0, 0, 256, 88, 'night');
      p.rect(0, 0, 256, 14, 'nightHi');
      for (let x = 4; x < 256; x += 32) { p.vline(x, 0, 13, 'night'); p.hline(0, 255, 13, 'mortar'); }
      // brick wall
      for (let y = 14, r = 0; y < 88; y += 4, r++) {
        p.hline(0, 255, y, 'mortar');
        for (let x = (r % 2) * 6; x < 256; x += 12) { p.rect(x + 1, y + 1, 10, 3, r % 3 ? 'brick' : 'brickSh'); p.hline(x + 1, x + 10, y + 1, 'brickHi'); }
      }
      // three tall windows: night sky, the moon, the city skyline, lit windows
      for (const [wx, wy] of [W_LEFT, W_RIGHT]) {
        const w = 44, h = 24;
        p.rect(wx - 2, wy - 2, w + 4, h + 4, 'frame');
        p.rect(wx, wy, w, h, 'night');
        p.dither(wx, wy, w, 8, 'nightHi', 0.3);
        // skyline
        let x = wx;
        let k = wx * 7;
        while (x < wx + w) {
          const bw = 5 + (k % 5), bh = 8 + ((k * 13) % 12);
          p.rect(x, wy + h - bh, bw, bh, 'city');
          for (let yy = wy + h - bh + 2; yy < wy + h - 1; yy += 3) for (let xx = x + 1; xx < x + bw - 1; xx += 2) if ((xx * 3 + yy * 5 + k) % 4 === 0) p.px(xx, yy, (xx + yy) % 3 ? 'cityDim' : 'cityLit');
          x += bw + 1; k += 11;
        }
        p.vline(wx + w / 2, wy, wy + h - 1, 'frame');
        p.hline(wx, wx + w - 1, wy + h / 2, 'frame');
        p.hline(wx - 2, wx + w + 1, wy - 2, 'frameHi');
      }
      // the moon in the left window
      p.ellipse(W_LEFT[0] + 32, W_LEFT[1] + 6, 4, 4, 'moon');
      p.ellipse(W_LEFT[0] + 33, W_LEFT[1] + 5, 2, 2, 'moonSh');
      // the old club sign on the back wall
      p.rect(72, 37, 112, 11, 'frame');
      p.rect(73, 38, 110, 9, 'brickSh');
      p.text('EASTSIDE BOXING', 80, 39, 'sign', { mono: false });
      // lockers on the right
      for (let i = 0; i < 4; i++) {
        const x = 236 + i * 5;
        p.rect(x, 58, 5, 28, 'locker'); p.vline(x, 58, 85, 'metalDk'); p.hline(x, x + 4, 58, 'lockerHi');
        p.px(x + 3, 70, 'metalHi'); p.hline(x + 1, x + 3, 61, 'metalDk'); p.hline(x + 1, x + 3, 63, 'metalDk');
      }
      // speed-bag platform on the left wall
      p.rect(2, 44, 26, 4, 'metal'); p.hline(2, 27, 44, 'metalHi'); p.vline(14, 48, 50, 'chain');
      p.ellipse(14.5, 54, 3, 4, 'bag'); p.px(13, 52, 'bagHi');
      // the bench of regulars (fight I) / chairs (II on)
      if (stage === 1) { p.rect(144, 70, 38, 3, 'metal'); p.hline(144, 181, 70, 'metalHi'); p.vline(146, 73, 80, 'metalDk'); p.vline(179, 73, 80, 'metalDk'); }
      // banners
      // banners under the sign: his first, then yours too
      if (stage === 2) banner(p, 106, 49, 'DASH!!', 'banner', 'bannerTxt');
      if (stage === 3) { banner(p, 74, 49, 'DASH!!', 'banner', 'bannerTxt'); banner(p, 138, 49, 'CHAMP!', 'banner2', 'bannerTxt'); }
      if (stage === 4) {
        banner(p, 14, 48, 'DASH!!', 'banner', 'bannerTxt'); banner(p, 196, 48, 'CHAMP!', 'banner2', 'bannerTxt');
        banner(p, 86, 49, 'THE SHOWDOWN', 'banner2', 'bannerTxt', 84);
        // streamers across the ceiling
        for (let x = 0; x < 256; x += 2) { const y = 40 + Math.round(Math.abs(Math.sin(x / 20)) * 6); p.px(x, y, x % 6 < 2 ? 'ropeT' : x % 6 < 4 ? 'banner2' : 'lamp'); }
      }
      // TV camera on a tripod (III, IV)
      if (stage >= 3) {
        p.line(222, 86, 226, 70, 'metalDk'); p.line(232, 86, 228, 70, 'metalDk'); p.vline(227, 70, 86, 'metal');
        p.rect(219, 62, 16, 8, 'metal'); p.hline(219, 234, 62, 'metalHi'); p.rect(214, 64, 5, 4, 'metalDk');
      }
    },

    paintRing(p) {
      p.rect(0, 84, 256, 4, 'apron');
      p.hline(0, 255, 84, 'canvasDk');
      p.rect(0, 88, 256, 136, 'canvas');
      p.rect(0, 88, 256, 2, 'canvasHi');
      // the lamp's pool of light on the canvas: darker toward the edges
      p.dither(0, 90, 256, 134, 'canvasSh', 0.4, (i, j) => ((i - 128) / 110) ** 2 + ((j - 170) / 60) ** 2 > 1);
      p.dither(0, 90, 256, 134, 'canvasDk', 0.35, (i, j) => ((i - 128) / 140) ** 2 + ((j - 170) / 80) ** 2 > 1);
      // worn tape marks from years of drills
      for (const [x, y] of [[60, 140], [196, 146], [128, 206]]) { p.hline(x - 6, x + 6, y, 'canvasSh'); p.vline(x, y - 3, y + 3, 'canvasSh'); }
      // ropes: teal / white / teal
      const ropes = [[60, 'ropeT', 'ropeTs'], [68, 'ropeW', 'ropeWs'], [76, 'ropeT', 'ropeTs']];
      for (const [y, a, b] of ropes) {
        p.hline(16, 239, y, a); p.hline(16, 239, y + 1, b);
        for (let x = 20; x < 240; x += 9) p.px(x, y, b);
      }
      for (const [y, a, b] of ropes) {
        p.line(12, y, -10, y + 38, a); p.line(12, y + 1, -10, y + 39, b);
        p.line(243, y, 266, y + 38, a); p.line(243, y + 1, 266, y + 39, b);
      }
      for (const x of [8, 241]) {
        p.rect(x, 48, 7, 44, 'metalDk'); p.rect(x + 1, 48, 5, 44, 'metal'); p.vline(x + 2, 49, 90, 'metalHi');
        p.rect(x - 1, 55, 9, 27, 'padS'); p.rect(x, 56, 7, 25, 'pad');
        for (const [y] of ropes) p.hline(x, x + 6, y + 2, 'padS');
        p.rect(x - 1, 90, 9, 3, 'metalDk');
      }
    },

    // the lamp hums and flickers; the city twinkles; knockdowns: phones light up
    paletteAnim(t, live, pal) {
      const cyc = t % 520;
      if ((cyc > 300 && cyc < 306) || (cyc > 312 && cyc < 315)) live[pal.idx('lamp')] = pal.u32[pal.idx('lampDim')];
      if ((t >> 5) & 1) live[pal.idx('cityLit')] = pal.u32[pal.idx('cityDim')];
    },

    overlay(frame, arena, t) {
      const pal = arena.live, P = arena.pal, col = (k) => pal[P.idx(k)];
      // heavy bags on chains, swaying (left and right of the ring)
      for (const [x0, ph] of [[46, 0], [214, 40]]) {
        const sw = Math.round(Math.sin((t + ph) / 50) * 2);
        for (let y = 0; y < 30; y++) frame.px(x0 + Math.round((sw * y) / 30), y, col('chain'));
        const bx = x0 + sw;
        for (let y = 30; y < 52; y++) for (let x = -5; x <= 5; x++) {
          const edge = Math.abs(x) === 5 || y === 30 || y === 51;
          frame.px(bx + x, y, col(edge ? 'bagDk' : x < -2 ? 'bagHi' : x > 2 ? 'bagDk' : 'bag'));
        }
        frame.rect(bx - 5, 36, 11, 2, col('bagDk'));
      }
      // the caged lamp over the ring
      for (let y = 0; y < 30; y++) frame.px(128, y, col('chain'));
      frame.rect(122, 30, 13, 4, col('metal')); frame.rect(123, 34, 11, 3, col('lamp'));
      for (const x of [123, 127, 131]) frame.px(x, 35, col('metalDk'));
      // tally light on the TV camera
      if (stage >= 3) frame.rect(232, 63, 2, 2, col((t >> 4) & 1 ? 'tally' : 'tallyOff'));
      // phone flashes in the crowd on big moments
      if (arena.react > 0 && arena.crowd.length) {
        const k = ((t >> 2) * 7919) % arena.crowd.length, sp = arena.crowd[k];
        if (sp && !((t >> 2) % 3)) { const c = col('lamp'); frame.px(sp.x + 2, sp.y - 7, c); frame.px(sp.x + 1, sp.y - 7, c); frame.px(sp.x + 3, sp.y - 7, c); frame.px(sp.x + 2, sp.y - 8, c); frame.px(sp.x + 2, sp.y - 6, c); }
      }
    },
  };
}

// a hand-painted banner hung on two strings
function banner(p, x, y, text, bg, fg, w = 0) {
  const width = w || text.length * 7 + 6;
  p.line(x - 4, y - 4, x, y, 'frame'); p.line(x + width + 4, y - 4, x + width, y, 'frame');
  p.rect(x, y, width, 11, 'apron');
  p.rect(x + 1, y + 1, width - 2, 9, bg);
  p.text(text, x + 3, y + 2, fg, { mono: false });
}

export const NIGHT_GYM = { nightgym1: build(1), nightgym2: build(2), nightgym3: build(3), nightgym4: build(4) };
