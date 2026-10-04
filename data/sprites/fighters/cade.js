// Crowbar Cade: sprite layers on the heavy build.
// A dockside enforcer: black buzz cut with a scar cut through it, a heavy brow,
// a nose broken flat with a strip of tape across it, stubble, a cauliflower
// ear, and a grin with a tooth missing. A grimy white tank top, a heavy chain
// with a padlock round his neck, black trunks with a rust-orange crowbar
// stencilled on the leg, dirty tape wrapped over oxblood gloves, work boots.
// Poses: the sucker punch he creeps in with at the bell (sucker), the headbutt
// (butTell / butt), cracking his knuckles (taunt).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose, stubble } from './_face.js';

const A = makePalette('cade.A', {
  outline: [3, 2, 2],
  skinHi: [30, 22, 16], skin: [25, 15, 10], skinSh: [18, 9, 7], skinDk: [10, 5, 4],
  white: [30, 30, 28], mouth: [12, 2, 3],
  hair: [5, 4, 4], hairHi: [11, 9, 8],
  tape: [26, 25, 20], tapeSh: [18, 17, 13],
  gloveHi: [22, 6, 5], glove: [15, 3, 3], gloveDk: [8, 1, 2],
});
const B = makePalette('cade.B', {
  tankHi: [27, 27, 25], tank: [21, 21, 19], tankSh: [14, 14, 13],
  trunkHi: [9, 9, 10], trunk: [4, 4, 5], trunkDk: [2, 2, 2],
  rust: [26, 12, 4], rustDk: [16, 6, 2],
  chain: [22, 22, 24], chainDk: [12, 12, 14],
  bootHi: [14, 10, 6], boot: [7, 5, 3],
});
export const palettes = { cade: { A, B } };

const poses = {
  // creeping in at the bell: low, leaning in, the right hand cocked behind
  sucker: {
    extends: 'hookTell', shift: [-2, 3],
    head: { at: [-3, -95], face: 'grin', look: [-1, 1] },
    chest: [-2, -69], neck: [-3, -84],
    shR: [20, -77], elR: [36, -66], fiR: [38, -82], gloveR: { angle: 30 },
    shL: [-20, -78], elL: [-24, -58], fiL: [-10, -70],
    knL: [-16, -20], knR: [14, -20],
  },
  // the headbutt: head pulled back, then driven in
  butTell: {
    extends: 'idle1', shift: [0, -2],
    head: { at: [2, -104], face: 'strain', look: [0, -1] },
    elL: [-26, -62], fiL: [-16, -76], elR: [26, -62], fiR: [16, -76],
  },
  butt: {
    extends: 'idle1', shift: [0, 5],
    head: { at: [0, -88], face: 'strain', look: [0, 2] },
    neck: [0, -80], chest: [0, -68],
    elL: [-28, -58], fiL: [-24, -44], elR: [28, -58], fiR: [24, -44],
    gloveL: { angle: 160 }, gloveR: { angle: -160 },
    knL: [-16, -18], knR: [16, -18],
  },
  // taunt: cracking his knuckles, fists pressed together
  knuckles1: {
    extends: 'idle1',
    head: { at: [0, -100], face: 'grin', look: [0, 1] },
    elL: [-24, -62], fiL: [-5, -70], elR: [24, -62], fiR: [5, -70],
    gloveL: { angle: 80 }, gloveR: { angle: -80 },
  },
  knuckles2: { extends: 'knuckles1', shift: [0, 1], fiL: [-4, -68], fiR: [4, -72], head: { at: [0, -99], face: 'grin', look: [0, 1] } },
};

export default {
  id: 'cade',
  build: 'heavy',
  // his own body on the build: a thug: thick neck, heavy shoulders, short legs
  body: { shoulders: 1.08, torsoLen: 0.98, legLen: 0.9, dims: { neck: 9 } },
  palettes: { default: 'cade' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['tape', 'tape', 'tapeSh'],
    shorts: ['trunkHi', 'trunk', 'trunkDk'],
    sock: ['bootHi', 'boot', 'outline'],
    boot: ['bootHi', 'boot', 'outline'],
    sole: ['rustDk', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'outline'],
    tank: ['tankHi', 'tank', 'tankSh', 'tankSh'],
    chain: ['chain', 'chain', 'chainDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    ears(ctx, H, ramps.skin, [2.6, 3.6]);
    // the cauliflower ear
    cv.part(ctx.mask().ellipse(x + H.rx - 0.5 + lx * 0.3, y + 1 + ly * 0.5, 3.2, 3.6), { ramp: ramps.skin, bevel: 1, inner: 'soft' });
    cv.shade(x + H.rx + lx * 0.3, y + ly * 0.5, 2); cv.shade(x + H.rx + 1 + lx * 0.3, y + 2 + ly * 0.5, 2);
    const hm = skull(ctx, H, ramps.skin, 'square');
    // buzz cut, with a scar through it
    for (let Y = y - H.ry; Y < y - 5; Y++) for (let X = x - 13; X <= x + 13; X++) {
      if (!hm.in(X, Y) || !hm.in(X, Y - 1)) continue;
      if (Y < y - 8) cv.px(X, Y, c((X + Y) % 3 ? 'hair' : 'hairHi'));
      else if ((X + Y) % 2 === 0) cv.px(X, Y, c('hairHi'));
    }
    for (let k = 0; k < 5; k++) cv.px(x + 4 + k + lx * 0.3, y - 11 + k, c('skinHi'));
    eyes(ctx, fx, fy, face, 0);
    // heavy brow ridge
    brows(ctx, fx, fy, face, ramps.hair, { len: 4.6, thick: 1.4, y: -3.8 });
    for (let i = -8; i <= 8; i++) cv.shade(fx + i, fy - 5, -1);
    // broken nose, taped
    nose(ctx, fx + 1, fy, ramps.skin, [2.8, 2.2], 3.6);
    for (let i = -3; i <= 3; i++) { cv.px(fx + 1 + i, fy + 2, c('tape')); if (i & 1) cv.px(fx + 1 + i, fy + 3, c('tapeSh')); }
    cv.px(fx - 3, fy + 2, c('outline')); cv.px(fx + 5, fy + 2, c('outline'));
    stubble(ctx, fx, fy, 6, 12, 1);
    const kind = mouth(ctx, fx, fy + 9, face, { w: 4 });
    // the missing tooth
    if (kind === 'smile' || kind === 'teeth') cv.px(fx + 1, fy + 9, c('mouth'));
    if (kind === 'open') cv.px(fx, fy + 9, c('mouth'));
  },

  torso(ctx) {
    const { cv, J, c, D, pose, ramps } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip, sL = J.shL, sR = J.shR;
    const tm = ctx.torsoMask;
    // grimy tank top: the chest and belly, two straps over the shoulders
    const tank = ctx.mask().poly([
      [sL[0] + 2, sL[1] - 5], [sL[0] + 7, sL[1] - 5], [n[0] - 3, n[1] + 9], [n[0] + 3, n[1] + 9],
      [sR[0] - 7, sR[1] - 5], [sR[0] - 2, sR[1] - 5], [ch[0] + D.chestW - 4, ch[1] + 2], [w[0] + D.waistW + 2, w[1] + 1],
      [w[0] - D.waistW - 2, w[1] + 1], [ch[0] - D.chestW + 4, ch[1] + 2],
    ]).clip(tm);
    cv.part(tank, { ramp: ramps.tank, bevel: 5, inner: 'soft' });
    // stains and a tear
    for (const [dx, dy] of [[-8, 12], [-7, 13], [6, 20], [7, 20], [7, 21], [-3, 26]]) if (tank.in(Math.round(ch[0] + dx), Math.round(n[1] + dy))) cv.px(ch[0] + dx, n[1] + dy, c('tankSh'));
    for (let k = 0; k < 4; k++) if (tank.in(Math.round(ch[0] + 10 + k), Math.round(ch[1] + 8 + (k & 1)))) cv.px(ch[0] + 10 + k, ch[1] + 8 + (k & 1), c('skinSh'));
    // chain and padlock
    if (!pose.lying) {
      for (let i = -9; i <= 9; i++) {
        const X = Math.round(n[0] + i), Y = Math.round(n[1] + 5 + (i * i) / 9);
        if (!tm.in(X, Y)) continue;
        cv.px(X, Y, c(i & 1 ? 'chain' : 'chainDk')); cv.px(X, Y + 1, c('outline'));
      }
      const px = Math.round(n[0]), py = Math.round(n[1] + 14);
      cv.part(ctx.mask().rect(px - 3, py, 7, 5), { ramp: ramps.chain, bevel: 1, inner: 'line', shadow: false });
      for (let k = -1; k <= 1; k++) cv.px(px + k, py - 1, c('chainDk'));
      cv.px(px, py + 2, c('outline'));
    }
    // a rust-orange crowbar stencilled down the left leg of the trunks
    if (!pose.lying) {
      const sx = Math.round(h[0] - D.hipSpread - 5), sy = Math.round(h[1] - 3);
      for (let k = 0; k < 9; k++) if (ctx.shortsMask.in(sx + (k >> 2), sy + k)) cv.px(sx + (k >> 2), sy + k, c('rust'));
      cv.px(sx - 1, sy, c('rust')); cv.px(sx - 2, sy + 1, c('rustDk')); cv.px(sx + 3, sy + 9, c('rust')); cv.px(sx + 4, sy + 8, c('rustDk'));
    }
  },

  // dirty tape wound round the gloves' knuckles
  front(ctx) {
    const { cv, J, c } = ctx;
    const g = cv.rampId(ctx.ramps.glove);
    for (const s of ['L', 'R']) {
      const f = J['fi' + s];
      for (let dy = -2; dy <= 1; dy += 3) for (let dx = -6; dx <= 6; dx++) {
        const X = Math.round(f[0] + dx), Y = Math.round(f[1] + dy + (dx >> 2));
        const i = Y * cv.w + X;
        if (X >= 0 && Y >= 0 && X < cv.w && Y < cv.h && cv.ramp[i] === g) cv.px(X, Y, c((dx + dy) & 1 ? 'tape' : 'tapeSh'));
      }
    }
  },
};
