// Brick Wall Brody: sprite layers on the heavy build.
// Mason and Minor Circuit champ: a tall flat-top, one solid unibrow, a
// flattened nose, square stubbled jaw, cauliflower ear, a hairy barrel chest,
// brick-pattern trunks with the Minor Circuit belt, taped wrists, work socks,
// grey boots. Concrete-grey gloves. Never smiles. Never flinches.

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, mouth, skull, stubble } from './_face.js';

const A = makePalette('brody.A', {
  outline: [2, 2, 2],
  skinHi: [29, 21, 15], skin: [24, 15, 10], skinSh: [17, 10, 6], skinDk: [10, 5, 3],
  white: [30, 30, 28], mouth: [11, 3, 3],
  hairHi: [12, 8, 5], hair: [6, 4, 2], hairDk: [3, 2, 1],
  gloveHi: [23, 23, 22], glove: [15, 15, 15], gloveDk: [8, 8, 9],
  tape: [27, 27, 24],
});
const B = makePalette('brody.B', {
  brickHi: [27, 11, 7], brick: [21, 7, 4], brickSh: [13, 4, 3],
  mortar: [24, 21, 17],
  goldHi: [31, 29, 13], gold: [27, 20, 4], goldSh: [17, 11, 2],
  strap: [5, 4, 6], strapHi: [11, 10, 13],
  gem: [8, 22, 30],
});
export const palettes = { brody: { A, B } };

const poses = {
  // arms folded: the "you done yet?" taunt
  stoic: {
    extends: 'idle1', shift: [0, 0],
    head: { at: [0, -100], face: 'neutral', look: [0, 0] },
    elL: [-27, -68], elR: [27, -68], fiL: [10, -70], fiR: [-10, -72],
    gloveL: { angle: 95 }, gloveR: { angle: -95 },
    frontOrder: ['L', 'R'],
  },
};

export default {
  id: 'brody',
  build: 'heavy',
  // his own body on the build: a brick wall: a huge square trunk, no neck to speak of, short legs
  body: { size: [1.1, 1], legLen: 0.9, torsoLen: 1.08, shoulders: 1.12, neckLen: -1.5, dims: { neck: 9, chestW: 26, waistW: 22, belly: 6 } },
  palettes: { default: 'brody' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['tape', 'tape', 'gloveHi', 'glove'],
    shorts: ['brickHi', 'brick', 'brickSh'],
    sock: ['white', 'tape', 'gloveHi'],
    boot: ['gloveHi', 'glove', 'gloveDk'],
    sole: ['glove', 'gloveDk', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
    gold: ['goldHi', 'gold', 'goldSh'],
    strap: ['strapHi', 'strap', 'outline'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    // ears: the viewer-left one is cauliflowered
    const ears = ctx.mask().ellipse(x - H.rx + 0.3 + lx * 0.3, y + 1, 3.4, 3.8).ellipse(x + H.rx - 0.5 + lx * 0.3, y + 1, 2.4, 3.4);
    cv.part(ears, { ramp: ramps.skin, bevel: 2 });
    cv.shade(x - H.rx + lx * 0.3, y, 1); cv.shade(x - H.rx - 1 + lx * 0.3, y + 2, 1);
    const hm = skull(ctx, H, ramps.skin, 'square');
    stubble(ctx, fx, fy, 6, 13, 1);
    // flat-top: a tall block of hair, flat on top
    const storey = 0;
    const top = ctx.mask().rect(x - H.rx + 0.5 + lx * 0.3, y - H.ry - 5 - storey, H.rx * 2 - 1, 11 + storey).cut(ctx.mask().rect(x - 20, y - 5, 40, 20));
    top.rect(x - H.rx + 0.5 + lx * 0.3, y - 6, 2, 4).rect(x + H.rx - 2.5 + lx * 0.3, y - 6, 2, 4);
    cv.part(top, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    for (let i = -8; i <= 8; i += 2) cv.px(x + i + lx * 0.3, y - H.ry - 5 - storey, c('hairHi'));
    eyes(ctx, fx, fy, face === 'neutral' ? 'focus' : face, 0);
    // one unbroken unibrow
    const [bi, bo] = face === 'hurt' || face === 'ko' ? [-1, 1] : face === 'dazed' ? [-1, 0] : [1, -1];
    cv.part(ctx.mask().capsule(fx - 8, fy - 3.4 + bo, fx - 1, fy - 3 + bi, 1.4, 1.3).capsule(fx - 1, fy - 3 + bi, fx + 7, fy - 3.4 + bo, 1.3, 1.4), { ramp: ramps.hair, bevel: 1, inner: 'soft' });
    // flattened, crooked nose
    const nose = ctx.mask().ellipse(fx + 1, fy + 3.8, 3.4, 2.2).rect(fx - 1, fy + 1, 3, 2);
    cv.part(nose, { ramp: ramps.skin, bevel: 2, inner: 'soft' });
    cv.px(fx - 2, fy + 5, c('skinDk')); cv.px(fx + 3, fy + 5, c('skinDk'));
    // mouth: a flat line (never smiles)
    const m = mouth(ctx, fx, fy + 8, face === 'grin' ? 'neutral' : face, { w: 4 });
    if (m == null) for (let i = -4; i <= 3; i++) cv.px(fx + i, fy + 8, c('outline'));
    // scar through the viewer-right brow
    cv.px(fx + 5, fy - 5, c('skinHi')); cv.px(fx + 6, fy - 4, c('skinHi')); cv.px(fx + 6, fy - 2, c('skinHi'));
    ctx.headMask = hm;
  },

  torso(ctx) {
    const { cv, J, c, ramps, D } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    // pecs + a hairy chest
    for (const s of [-1, 1]) cv.line(ch[0] + s * 3, ch[1] + 2, ch[0] + s * 17, ch[1] + 1, (X, Y) => cv.shade(X, Y, 1));
    for (let j = -6; j <= 16; j++) for (let i = -4; i <= 4; i++) if ((i * 5 + j * 3) % 7 === 0 && Math.abs(i) <= 4 - Math.abs(j - 2) / 5) cv.shade(ch[0] + i, ch[1] + j, 1);
    cv.line(ch[0], ch[1] - 6, w[0], w[1] - 4, (X, Y) => cv.shade(X, Y, 1));
    // brick trunks: mortar lines in a running bond
    const sm = ctx.shortsMask, hy = Math.round(h[1]) + 40, hx = Math.round(h[0]);
    for (let Y = 0; Y < sm.h; Y++) for (let X = 0; X < sm.w; X++) {
      if (!sm.in(X, Y) || !sm.in(X, Y - 1) || !sm.in(X - 1, Y) || !sm.in(X + 1, Y)) continue;
      const row = Math.floor((Y - hy + 400) / 5);
      const off = row % 2 ? 5 : 0;
      if ((Y - hy + 400) % 5 === 0) cv.shade(X, Y, 2);
      else if ((X - hx + off + 400) % 10 === 0) cv.shade(X, Y, 2);
      else if ((Y - hy + 400) % 5 === 1) cv.shade(X, Y, -1);
    }
    // the Minor Circuit championship belt
    const by = Math.round(w[1] - 1);
    cv.part(ctx.mask().rect(w[0] - D.waistW - 3, by - 3, D.waistW * 2 + 6, 6).clip(ctx.mask().add(sm).add(ctx.torsoMask)), { ramp: ramps.strap, bevel: 1, inner: 'line', shadow: false });
    const plate = ctx.mask().ellipse(w[0], by, 9, 5.5);
    cv.part(plate, { ramp: ramps.gold, bevel: 3, inner: 'line' });
    cv.part(ctx.mask().ellipse(w[0], by, 2.2, 2), { ramp: ['white', 'gem', 'strap'].map(c), bevel: 1, shadow: false });
    for (const s of [-1, 1]) {
      cv.part(ctx.mask().ellipse(w[0] + s * 13, by, 3, 3), { ramp: ramps.gold, bevel: 2, inner: 'line', shadow: false });
      cv.px(w[0] + s * 18, by, c('gold')); cv.px(w[0] + s * 20, by, c('gold'));
    }
  },
  // Title Defense, LOAD BEARING: "I added a floor." Taller all round, welding
  // goggles pushed up on his forehead, a steel chain slung across his chest
  // like a bandolier, and hazard-striped wraps at the wrists.
  remix: {
    colors: { B: { steelHi: [26, 27, 29], steel: [15, 16, 19], hazard: [30, 24, 2], hazardDk: [4, 4, 5] } },
    body: { size: [1.12, 1.07], torsoLen: 1.12 },
    ramps: { steel: ['steelHi', 'steel', 'strap'] },
    head(ctx, H) {
      const { cv, ramps, c } = ctx;
      const x = Math.round(H.x + H.look[0] * 0.3), y = Math.round(H.y);
      cv.part(ctx.mask().rect(x - H.rx - 0.5, y - 8, H.rx * 2 + 1, 2), { ramp: ramps.strap, bevel: 1, inner: 'line', shadow: false });
      for (const s of [-1, 1]) {
        cv.part(ctx.mask().ellipse(x + s * 4.5, y - 8, 3.6, 3), { ramp: ramps.steel, bevel: 1, inner: 'line' });
        cv.part(ctx.mask().ellipse(x + s * 4.5, y - 8, 2, 1.6), { ramp: ['gem', 'strapHi', 'strap'].map(c), bevel: 1, shadow: false });
        cv.px(x + s * 4.5 - 1, y - 9, c('white'));
      }
    },
    torso(ctx) {
      const { cv, J, ramps } = ctx;
      const a = J.shL, b = J.waist;
      // chain links from the viewer-left shoulder down to the viewer-right hip
      const n = 9;
      for (let k = 0; k <= n; k++) {
        const x = a[0] + 2 + (b[0] + 18 - a[0] - 2) * (k / n), y = a[1] + 1 + (b[1] - 4 - a[1] - 1) * (k / n);
        const link = k % 2 ? ctx.mask().ellipse(x, y, 2.6, 1.6) : ctx.mask().ellipse(x, y, 1.6, 2.6);
        cv.part(link.cut(ctx.mask().ellipse(x, y, 0.8, 0.8)), { ramp: ramps.steel, bevel: 1, inner: 'line', shadow: k === 0 });
      }
    },
    front(ctx) {
      const { cv, J, c, pose } = ctx;
      if (pose.lying) return;
      // hazard stripes on the wrist wraps
      for (const s of ['L', 'R']) {
        const w = J['fi' + s], e = J['el' + s];
        const t = [w[0] + (e[0] - w[0]) * 0.28, w[1] + (e[1] - w[1]) * 0.28];
        for (let i = -3; i <= 3; i++) for (let j = -2; j <= 2; j++) cv.px(Math.round(t[0] + i), Math.round(t[1] + j), c(((i + j) & 2) ? 'hazard' : 'hazardDk'));
      }
    },
  },
};
