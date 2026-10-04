// Barney Buckets: sprite layers on the medium build.
// Janitor: teal work cap, walrus mustache, rolled-sleeve work shirt with a name
// patch, cut-off work pants, tall socks, work boots, yellow rubber-glove gloves,
// a key ring on his belt and a red shop rag tucked in his waistband.

import { lerp } from '../../../src/engine/figure.js';

// Face stamps are 20 px wide (the head's width). Row 0 sits at head.y - 3.
// o outline, w white, m mouth, p pupil, s/S shade +1/+2, l lighten, r ruddy, h/H/d hair
const FACES = {
  neutral: [
    '...oooo......oooo...',
    '...wppw......wppw...',
    '....ss........ss....',
  ],
  focus: [
    '....................',
    '...oooo......oooo...',
    '....ss........ss....',
  ],
  strain: [
    '...oooo......oooo...',
    '...wpww......wwpw...',
    '...oooo......oooo...',
  ],
  hurt: [
    '...oo..........oo...',
    '.....oo......oo.....',
    '...oo..........oo...',
  ],
  dazed: [
    '...oooo......oooo...',
    '...wwwp......pwww...',
    '...oooo......oooo...',
  ],
  ko: [
    '...o..o......o..o...',
    '....oo........oo....',
    '...o..o......o..o...',
  ],
  grin: [
    '....................',
    '....oo........oo....',
    '...o..o......o..o...',
  ],
};
// brow shapes: [innerDy, outerDy] relative to brow row
const BROWS = {
  neutral: [0, 0], focus: [1, -1], strain: [1, -1], hurt: [-1, 1],
  dazed: [-1, 0], ko: [-1, 1], grin: [-1, 0],
};
const MOUTH = {
  neutral: null, focus: 'teeth', strain: 'open', hurt: 'open', dazed: 'slack', ko: 'slack', grin: 'smile',
};

export default {
  id: 'barney',
  build: 'medium',
  // his own body on the build: an out-of-shape janitor: pot belly, soft round shoulders, short legs
  body: { size: [1.02, 0.97], legLen: 0.92, shoulders: 0.94, dims: { belly: 9, chestW: 19, waistW: 18, deltoid: 5.8, upperArm: [5.6, 4.8] } },
  palettes: { default: 'barney', alt: 'barneyNight' },
  torsoMaterial: 'shirt',
  sleeve: { material: 'shirt', length: 0.45 },
  ramps: {
    skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
    nose: ['skinHi', 'ruddy', 'skinSh', 'skinDk'],
    glove: ['gloveHi', 'glove', 'gloveSh', 'gloveDk'],
    cuff: ['gloveHi', 'gloveHi', 'glove', 'gloveSh'],
    shirt: ['shirtHi', 'shirt', 'shirtSh', 'shirtDk'],
    shorts: ['pantsHi', 'pants', 'pantsDk'],
    cap: ['capHi', 'cap', 'capDk'],
    hair: ['hairHi', 'hair', 'hairDk'],
    sock: ['white', 'hairHi', 'hair'],
    boot: ['brownHi', 'brown', 'pantsDk'],
    sole: ['hair', 'hairDk', 'pantsDk'],
    metal: ['metalHi', 'metal', 'brown'],
    rag: ['ruddy', 'patch', 'mouth'],
  },

  head(ctx, H) {
    const { cv, ramps, c } = ctx;
    const x = Math.round(H.x), y = Math.round(H.y);
    const [lx, ly] = H.look;
    const fx = x + lx, fy = y + ly;
    const tiltUp = H.tilt === 'up', tiltDown = H.tilt === 'down';

    // ears
    const ears = ctx.mask()
      .ellipse(x - H.rx + 0.5 + lx * 0.3, y + 1 + ly * 0.5, 2.4, 3.5)
      .ellipse(x + H.rx - 0.5 + lx * 0.3, y + 1 + ly * 0.5, 2.4, 3.5);
    cv.part(ears, { ramp: ramps.skin, bevel: 2 });
    // skull + a squarer jaw
    const hm = ctx.mask()
      .ellipse(x, y, H.rx, H.ry)
      .ellipse(x + lx * 0.3, y + 4 + ly * 0.3, H.rx + 0.3, H.ry - 4);
    cv.part(hm, { ramp: ramps.skin, bevel: 7 });
    ctx.headMask = hm;

    // stubble: checker shading on the jaw
    for (let j = 7; j <= 12; j++) {
      for (let i = -9; i <= 9; i++) {
        const X = fx + i, Y = fy + j;
        if (hm.in(X, Y) && (X + Y) % 2 === 0 && Math.abs(i) > 1 - (j > 9 ? 3 : 0)) cv.shade(X, Y, 1);
      }
    }
    // grey sideburns
    for (let j = -3; j <= 2; j++) {
      for (const [X, k] of [[x - Math.round(H.rx) + 1, 'hair'], [x + Math.round(H.rx) - 2, 'hair']]) {
        if (hm.in(X, y + j)) cv.px(X + lx * 0.3, y + j + ly * 0.5, c(j < 0 ? 'hairHi' : k));
      }
    }

    // cheeks
    cv.px(fx - 6, fy + 3, c('ruddy')); cv.px(fx - 5, fy + 3, c('ruddy'));
    cv.px(fx + 5, fy + 3, c('ruddy')); cv.px(fx + 4, fy + 3, c('ruddy'));

    // eyes
    const face = H.face || 'neutral';
    const map = { o: c('outline'), w: c('white'), p: c('outline'), m: c('mouth'), s: { shade: 1 }, S: { shade: 2 }, l: { shade: -1 }, r: c('ruddy') };
    cv.stamp(FACES[face] || FACES.neutral, fx - 10, fy - 2, map);

    // brows (bushy grey)
    const [bi, bo] = BROWS[face] || BROWS.neutral;
    const br = ctx.mask()
      .capsule(fx - 7.5, fy - 3.4 + bo, fx - 3, fy - 3.4 + bi, 1.1, 1)
      .capsule(fx + 6.5, fy - 3.4 + bo, fx + 2, fy - 3.4 + bi, 1.1, 1);
    cv.part(br, { ramp: ramps.hair, bevel: 1, inner: 'soft' });

    // mouth (under the mustache)
    const mouth = MOUTH[face];
    const mo = ctx.mask();
    if (mouth === 'open') mo.ellipse(fx, fy + 9.5, 3.4, 2.4);
    else if (mouth === 'slack') mo.ellipse(fx + 1, fy + 9.5, 2.6, 1.8);
    else if (mouth === 'teeth' || mouth === 'smile') mo.rect(fx - 4, fy + 8, 8, 2);
    if (!mo.empty()) {
      cv.flat(mo, c('mouth'), true);
      if (mouth === 'open') { for (let i = -2; i <= 1; i++) cv.px(fx + i, fy + 8, c('white')); }
      if (mouth === 'teeth') { for (let i = -3; i <= 2; i++) cv.px(fx + i, fy + 8, c('white')); for (let i = -3; i <= 2; i += 2) cv.px(fx + i, fy + 9, c('white')); }
      if (mouth === 'smile') { for (let i = -4; i <= 3; i++) cv.px(fx + i, fy + 8, c('white')); cv.px(fx - 5, fy + 7, c('outline')); cv.px(fx + 4, fy + 7, c('outline')); }
      if (mouth === 'slack') { cv.px(fx + 1, fy + 10, c('ruddy')); cv.px(fx + 2, fy + 10, c('ruddy')); }
    }

    // big ruddy nose
    const nose = ctx.mask().ellipse(fx, fy + 3.5, 2.7, 2.6).rect(fx - 1, fy, 2, 2);
    cv.part(nose, { ramp: ramps.nose, bevel: 2, inner: 'soft' });
    cv.px(fx - 2, fy + 5, c('skinDk')); cv.px(fx + 1, fy + 5, c('skinDk'));

    // walrus mustache
    const lift = face === 'grin' ? -1 : 0;
    const mu = ctx.mask()
      .ellipse(fx - 3.3, fy + 6.8 + lift, 4.4, 2.1, 1, -0.3)
      .ellipse(fx + 3.3, fy + 6.8 + lift, 4.4, 2.1, 1, 0.3)
      .ellipse(fx, fy + 6.2 + lift, 3, 1.6);
    if (mouth !== 'open') mu.ellipse(fx - 6.2, fy + 8.6 + lift, 1.3, 1.6).ellipse(fx + 6.2, fy + 8.6 + lift, 1.3, 1.6);
    cv.part(mu, { ramp: ramps.hair, bevel: 2, inner: 'line' });
    for (const i of [-5, -2, 2, 5]) cv.shade(fx + i, fy + 7 + lift, 1);
    for (const i of [-4, 3]) cv.shade(fx + i, fy + 6 + lift, -1);

    // work cap: dome + short bill
    const cy = y + (tiltUp ? -1 : tiltDown ? 1 : 0);
    const dome = ctx.mask().ellipse(x + lx * 0.4, cy - 9, H.rx + 0.6, 6);
    dome.cut(ctx.mask().rect(x - 20, cy - 6.5, 40, 10));
    cv.part(dome, { ramp: ramps.cap, bevel: 5 });
    // crown seam + top button
    cv.line(x + lx * 0.4, cy - 14, x + lx * 0.4, cy - 7, (X, Y) => cv.shade(X, Y, 1));
    cv.px(x + lx * 0.4, cy - 15, c('capHi'));
    // badge
    cv.px(x - 5 + lx, cy - 8, c('metalHi')); cv.px(x - 4 + lx, cy - 8, c('metal'));
    const billY = tiltUp ? cy - 7.5 : cy - 6;
    const bill = ctx.mask().ellipse(x + lx * 0.8, billY, H.rx + 1.6, tiltUp ? 1.3 : 1.9);
    bill.cut(ctx.mask().rect(x - 20, billY - 20, 40, 19.5));
    cv.part(bill, { ramp: ramps.cap, bevel: 1, bias: -0.35, inner: 'line' });
    // shadow of the bill on the forehead
    if (!tiltUp) for (let i = -8; i <= 8; i++) if (hm.in(fx + i, Math.round(billY) + 2)) cv.shade(fx + i, Math.round(billY) + 2, 1);
  },

  torso(ctx) {
    const { cv, J, c, ramps, D } = ctx;
    const n = J.neck, w = J.waist, ch = J.chest;
    const nx = Math.round(n[0]), ny = Math.round(n[1]);
    // collar V with white undershirt
    const v = ctx.mask().poly([[nx - 4, ny + 1], [nx + 4, ny + 1], [nx, ny + 7]]).clip(ctx.torsoMask);
    cv.part(v, { ramp: ramps.sock, bevel: 1, shadow: false, inner: 'line' });
    const col = ctx.mask()
      .poly([[nx - 6, ny], [nx - 1, ny + 7], [nx - 6, ny + 5]])
      .poly([[nx + 6, ny], [nx + 1, ny + 7], [nx + 6, ny + 5]]);
    cv.part(col, { ramp: ramps.shirt, bevel: 1, bias: 0.2, inner: 'line' });
    // placket + buttons
    const top = [n[0], n[1] + 8], bot = [w[0], w[1] - 2];
    cv.line(top[0], top[1], bot[0], bot[1], (X, Y) => cv.shade(X, Y, 1));
    for (let t = 0.1; t < 1; t += 0.28) { const p = lerp(top, bot, t); cv.px(p[0] + 1, p[1], c('white')); }
    // chest pockets with flaps
    for (const s of [-1, 1]) {
      const px = ch[0] + s * 9, py = ch[1] - 5;
      const pk = ctx.mask().rect(px - 4, py, 8, 7).clip(ctx.torsoMask);
      cv.part(pk, { ramp: ramps.shirt, bevel: 1, inner: 'soft', shadow: false });
      for (let i = -4; i < 4; i++) cv.shade(px + i, py + 2, 1);
    }
    // name patch on the viewer-left pocket
    const pp = [ch[0] - 9, ch[1] - 1];
    const patch = ctx.mask().ellipse(pp[0], pp[1] + 1.5, 3.6, 2);
    cv.flat(patch, c('white'), false);
    cv.px(pp[0] - 2, pp[1] + 1, c('patch')); cv.px(pp[0] - 1, pp[1] + 2, c('patch')); cv.px(pp[0], pp[1] + 1, c('patch')); cv.px(pp[0] + 1, pp[1] + 2, c('patch'));
    // shirt folds at the waist
    for (const s of [-1, 1]) cv.line(w[0] + s * 7, w[1] - 7, w[0] + s * 10, w[1] - 2, (X, Y) => cv.shade(X, Y, 1));
    // belt
    const by = Math.round(w[1] - 2);
    const belt = ctx.mask().rect(w[0] - D.waistW - 1, by - 1, D.waistW * 2 + 2, 3).clip(ctx.shortsMask);
    cv.part(belt, { ramp: ramps.boot, bevel: 1, inner: 'line', shadow: false });
    const bk = ctx.mask().rect(w[0] - 2, by - 1, 4, 3);
    cv.part(bk, { ramp: ramps.metal, bevel: 1, inner: 'line', shadow: false });
    // fly seam
    cv.line(w[0] + 1, by + 3, w[0] + 1, by + 8, (X, Y) => cv.shade(X, Y, 1));
    // key ring on the viewer-right hip
    const kx = w[0] + 11, ky = by + 2;
    const ring = ctx.mask().ellipse(kx, ky + 2, 2.2, 2.2);
    ring.cut(ctx.mask().ellipse(kx, ky + 2, 1, 1));
    cv.flat(ring, c('metal'), true);
    cv.px(kx - 1, ky + 1, c('metalHi'));
    const keys = ctx.mask().rect(kx - 2, ky + 4, 1, 4).rect(kx + 1, ky + 4, 1, 3).rect(kx, ky + 4, 1, 5);
    cv.flat(keys, c('metalHi'), true);
    // shop rag tucked in on the viewer-left hip
    const rx = w[0] - 12, ry = by;
    const rag = ctx.mask().poly([[rx - 2, ry], [rx + 3, ry], [rx + 2, ry + 9], [rx - 3, ry + 8]]);
    cv.part(rag, { ramp: ramps.rag, bevel: 2, inner: 'line' });
    cv.line(rx, ry + 2, rx - 1, ry + 7, (X, Y) => cv.shade(X, Y, 1));
  },
};
