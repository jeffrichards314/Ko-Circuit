// Static: sprite layers on the lean build.
// A gaunt pirate-TV kid: bleached hair standing straight up off his head in
// charged spikes (a spark jumping between the tips), electric-cyan eyes with
// dark rings under them from a life lived in front of the screen, a crooked
// grin. Pale, cool skin. A coax cable worn as a necklace with the plug hanging
// on his chest. Charcoal trunks with a test-card colour-bar waistband, black
// gloves with a white lightning line, grey socks, black boots.
// Poses: rubbing a glove on his hair (taunt: charging up), NO SIGNAL (locked
// up mid-motion, head cocked).

import { makePalette } from '../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from './_face.js';

const A = makePalette('static.A', {
  outline: [2, 2, 5],
  skinHi: [28, 26, 26], skin: [22, 19, 20], skinSh: [15, 12, 15], skinDk: [8, 6, 9],
  white: [31, 31, 31], mouth: [8, 2, 6],
  hairHi: [31, 31, 31], hair: [24, 27, 30], hairDk: [13, 16, 22],
  eye: [8, 28, 31],
  gloveHi: [12, 12, 16], glove: [5, 5, 8], gloveDk: [2, 2, 4],
});
const B = makePalette('static.B', {
  trunkHi: [10, 11, 15], trunk: [5, 6, 9], trunkDk: [2, 3, 5],
  barY: [30, 28, 6], barC: [6, 26, 28], barG: [8, 26, 10], barM: [26, 8, 26], barR: [28, 6, 6], barB: [6, 8, 28],
  sockHi: [28, 28, 30], sock: [19, 19, 23],
  bootHi: [9, 9, 12], boot: [4, 4, 6],
});
export const palettes = { static: { A, B } };

const poses = {
  // taunt: grinding a glove into his hair to build up the charge
  rub1: {
    extends: 'idle1',
    head: { at: [-1, -100], face: 'grin', look: [-1, 0] },
    elR: [26, -84], fiR: [10, -112], gloveR: { angle: -60, view: 'back' },
    elL: [-24, -60], fiL: [-12, -72],
  },
  rub2: { extends: 'rub1', fiR: [4, -113], elR: [24, -86], head: { at: [0, -100], face: 'grin', look: [0, 0] } },
  // NO SIGNAL: frozen mid-motion, head cocked, one glove stuck out
  frozen1: {
    extends: 'jabTell', shift: [0, 1],
    head: { at: [-5, -98], face: 'dazed', look: [-1, 1] },
    elL: [-34, -68], fiL: [-30, -84],
  },
  frozen2: { extends: 'frozen1', shift: [1, 1], head: { at: [-4, -98], face: 'dazed', look: [-1, 1] } },
};

export default {
  id: 'static',
  build: 'lean',
  // his own body on the build: gaunt: skin and bone
  body: { size: [0.9, 0.95], shoulders: 0.88, dims: { waistW: 11, upperArm: [4.2, 3.4], forearm: [3.8, 3.1] } },
  palettes: { default: 'static' },
  torsoMaterial: 'skin',
  poses,
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveDk'],
    cuff: ['hairHi', 'hair', 'hairDk'],
    shorts: ['trunkHi', 'trunk', 'trunkDk'],
    sock: ['sockHi', 'sock', 'outline'],
    boot: ['bootHi', 'boot', 'outline'],
    sole: ['sock', 'outline', 'outline'],
    hair: ['hairHi', 'hair', 'hairDk'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const face = H.face || 'neutral';

    // hair standing straight up: a crown of tall spikes, fanning out
    const hr = ctx.mask().ellipse(x + lx * 0.3, y - 6, H.rx + 0.8, 6.8).cut(ctx.mask().rect(x - 14, y - 4, 28, 12));
    const spikes = [[-9, -12, -12], [-5, -15, -6], [0, -17, 0], [5, -15, 6], [9, -12, 12]];
    for (const [dx, h, lean] of spikes) hr.poly([[x + dx - 2.6 + lx * 0.3, y - 8], [x + dx + lean * 0.35 + lx * 0.3, y - 8 + h], [x + dx + 2.6 + lx * 0.3, y - 8]]);
    cv.part(hr, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    for (const [dx, h, lean] of spikes) cv.line(x + dx + lx * 0.3, y - 9, x + dx + lean * 0.3 + lx * 0.3, y - 7 + h, (X, Y) => { if (hr.in(X, Y)) cv.px(X, Y, c('hairHi')); });
    // the spark jumping between two tips
    const sx = Math.round(x - 7 + lx * 0.3), sy = y - 22;
    for (const [dx, dy] of [[0, 0], [1, -1], [2, -1], [3, 0], [4, -2], [5, -3]]) if (!hr.in(sx + dx, sy + dy)) cv.px(sx + dx, sy + dy, c('eye'));

    ears(ctx, H, ramps.skin, [1.6, 2.6]);
    skull(ctx, H, ramps.skin, 'narrow');
    // dark rings under the eyes
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) cv.shade(fx + s * (4 + i) - (s > 0 ? 1 : 0), fy + 2, 1);
    eyes(ctx, fx, fy, face, -1);
    // electric irises
    if (['neutral', 'strain', 'dazed', 'wide'].includes(face)) for (const s of [-1, 1]) cv.px(fx + s * 5 - (s > 0 ? 2 : 0), fy - 1, c('eye'));
    brows(ctx, fx, fy, face, ramps.hair, { len: 3.6, thick: 0.8, y: -4.2 });
    nose(ctx, fx, fy, ramps.skin, [1.5, 1.8], 3.4);
    const kind = mouth(ctx, fx, fy + 8, face, { w: 3 });
    if (!kind || kind === 'teeth') cv.px(fx + 3, fy + 8, c('outline')); // the crooked corner
  },

  torso(ctx) {
    const { cv, J, c, D, pose } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest, h = J.hip;
    const tm = ctx.torsoMask;
    // ribs showing through
    for (const k of [0, 4]) for (const s of [-1, 1]) cv.line(ch[0] + s * 4, ch[1] + 4 + k, ch[0] + s * (D.chestW - 4), ch[1] + 2 + k, (X, Y) => { if (tm.in(X, Y)) cv.shade(X, Y, 1); });
    // coax cable necklace, the plug hanging on his chest
    if (!pose.lying) {
      for (let i = -8; i <= 8; i++) { const X = Math.round(n[0] + i), Y = Math.round(n[1] + 4 + (i * i) / 10); if (tm.in(X, Y)) { cv.px(X, Y, c('outline')); cv.px(X, Y - 1, c('hairDk')); } }
      const px = Math.round(n[0]), py = Math.round(n[1] + 11);
      cv.part(ctx.mask().rect(px - 1, py, 3, 4), { ramp: ['hairHi', 'hair', 'hairDk'].map(c), bevel: 1, inner: 'line', shadow: false });
      cv.px(px, py + 4, c('hairHi'));
    }
    // test-card colour bars across the waistband
    const band = ctx.mask().rect(w[0] - D.waistW - 1, w[1] - 3, D.waistW * 2 + 2, 3).clip(ctx.shortsMask);
    cv.part(band, { ramp: ['trunkHi', 'trunk', 'trunkDk'].map(c), bevel: 1, inner: 'line', shadow: false });
    const bars = ['barY', 'barC', 'barG', 'barM', 'barR', 'barB'];
    const x0 = Math.round(w[0] - D.waistW), bw = (D.waistW * 2) / bars.length;
    for (let Y = Math.round(w[1] - 3); Y < w[1]; Y++) for (let X = x0; X < x0 + D.waistW * 2; X++) if (band.in(X, Y)) cv.px(X, Y, c(bars[Math.min(bars.length - 1, Math.floor((X - x0) / bw))]));
    // a snow speckle on the trunks
    if (!pose.lying) for (let Y = Math.round(h[1] - 2); Y < h[1] + 8; Y++) for (let X = Math.round(h[0] - 14); X < h[0] + 14; X++) if (ctx.shortsMask.in(X, Y) && (X * 7 + Y * 13) % 17 === 0) cv.px(X, Y, c('trunkHi'));
  },

  // a white lightning line down each glove
  front(ctx) {
    const { cv, J, c } = ctx;
    for (const s of ['L', 'R']) {
      const f = J['fi' + s];
      const X = Math.round(f[0]), Y = Math.round(f[1]);
      for (const [dx, dy] of [[-1, -4], [0, -3], [-1, -2], [0, -1], [1, 0], [0, 1]]) {
        const i = (Y + dy) * cv.w + X + dx;
        if (cv.ramp[i] && cv.ramps[cv.ramp[i]][1] === c('glove')) cv.px(X + dx, Y + dy, c('hairHi'));
      }
    }
  },
};
