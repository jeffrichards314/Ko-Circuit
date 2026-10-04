// A small rig for the Ascension's fighters (Phase B on): the boring 80% of a fighter's sprite
// layers (palettes, ramps, a head with a hairstyle and a beard, a torso with a top, a belt and
// shorts trim) from one config, so a fighter's own file is only what makes HIM: his gear, his
// props, his extra poses. The drawing calls are the same as the hand-written layers (Oro, Ulla):
// every part is a shaded mask on the shared canvas, so the rig's fighters sit beside the
// hand-made ones without a seam.
//
//   rig(id, {
//     build, body,                          the build and his own body block (see figure.js reshape)
//     colors: { skin, hair, glove, top, trim, boot, sh, extraA, extraB }   (see PALETTE below)
//     swaps: { name: { A: {...}, B: {...} } }   extra palettes (key layout is shared, only colours change)
//     head: { jaw, ears, hair, hairKey, beard, brow, gap, nose, mouthW, behind(ctx,H), gear(ctx,H), face(ctx,H) }
//     top: { style: 'bare' | 'tank' | 'vest' | 'plate' | 'harness' | 'robe', emblem(ctx, cx, cy), hem: true }
//     belt: { buckle: 'round' | 'square' | 'none', wide: n }
//     stripe: true                          a trim stripe down each side of the shorts
//     poses, ramps, torso(ctx), back(ctx), front(ctx), torsoMaterial, sleeve...
//   }) -> { layers, palettes }
//
// PALETTE (each entry an array of [r,g,b] 5-bit colours, light to dark):
//   skin [hi, mid, sh, dk]   hair [hi, mid, dk]   glove [hi, mid, dk]
//   top [hi, mid, sh, dk]    trim [hi, mid, sh]   boot [hi, mid, dk]   sh (shorts) [hi, mid, dk]
//   extraA / extraB: { key: [r,g,b] } (up to two more colours in each palette)

import { makePalette, swapPalette } from '../../../../src/engine/palette.js';
import { eyes, brows, mouth, ears, skull, nose } from '../_face.js';

export const OUTLINE = [3, 3, 6];

const keyed = (prefix, list, names) => Object.fromEntries(list.map((c, i) => [prefix + names[i], c]));

export function rigPalettes(colors, outline = OUTLINE, white = [31, 31, 31], mouthCol = [10, 2, 4]) {
  const C = colors;
  const A = {
    outline, ...keyed('skin', C.skin, ['Hi', '', 'Sh', 'Dk']), white, mouth: mouthCol,
    ...keyed('hair', C.hair, ['Hi', '', 'Dk']), ...keyed('glove', C.glove, ['Hi', '', 'Dk']), ...(C.extraA || {}),
  };
  const B = {
    ...keyed('trim', C.trim, ['Hi', '', 'Sh']), ...keyed('boot', C.boot, ['Hi', '', 'Dk']),
    ...keyed('sh', C.sh, ['Hi', '', 'Dk']), ...keyed('top', C.top, ['Hi', '', 'Sh', 'Dk']), ...(C.extraB || {}),
  };
  // (renamed so the plain names line up: 'skin' is the mid tone, 'hair' the mid tone...)
  return { A, B };
}

const RAMPS = {
  skin: ['skinHi', 'skin', 'skinSh', 'skinDk'],
  glove: ['gloveHi', 'glove', 'gloveDk'],
  cuff: ['trimHi', 'trim', 'trimSh'],
  shorts: ['shHi', 'sh', 'shDk'],
  sock: ['trimHi', 'trim', 'trimSh'],
  boot: ['bootHi', 'boot', 'bootDk'],
  sole: ['trimSh', 'bootDk', 'outline'],
  hair: ['hairHi', 'hair', 'hairDk'],
  trim: ['trimHi', 'trim', 'trimSh'],
  top: ['topHi', 'top', 'topSh', 'topDk'],
};

export function rig(id, cfg) {
  const { A, B } = rigPalettes(cfg.colors, cfg.outline, cfg.white, cfg.mouth);
  const pa = makePalette(id + '.A', A), pb = makePalette(id + '.B', B);
  const palettes = { [id]: { A: pa, B: pb } };
  for (const [name, s] of Object.entries(cfg.swaps || {})) palettes[name] = { A: swapPalette(name + '.A', pa, s.A || {}), B: swapPalette(name + '.B', pb, s.B || {}) };
  const H0 = cfg.head || {};
  const T0 = cfg.top || { style: 'bare' };

  const layers = {
    id, build: cfg.build,
    body: cfg.body,
    palettes: { default: id },
    torsoMaterial: cfg.torsoMaterial || 'skin',
    poses: cfg.poses || {},
    ramps: { ...RAMPS, ...(cfg.ramps || {}) },
    ...(cfg.sleeve ? { sleeve: cfg.sleeve } : {}),
    ...(cfg.remix ? { remix: cfg.remix } : {}),
    back: cfg.back,
    front: cfg.front,

    head(ctx, H) {
      const { cv, ramps, c } = ctx;
      const x = Math.round(H.x), y = Math.round(H.y);
      const [lx, ly] = H.look;
      const fx = x + lx, fy = y + ly;
      const face = H.face || 'neutral';
      if (H0.behind) H0.behind(ctx, H);
      if (H0.ears !== null) ears(ctx, H, ramps.skin, H0.ears || [2.4, 3.5]);
      const hm = skull(ctx, H, ramps.skin, H0.jaw || 'round');
      hairdo(ctx, H, H0.hair || 'none', H0.hairKey || 'hair');
      if (H0.face) H0.face(ctx, H);
      eyes(ctx, fx, fy, face === 'neutral' ? (H0.eyeFace || 'focus') : face, H0.gap ?? 0);
      brows(ctx, fx, fy, face, ramps[H0.hairKey || 'hair'], H0.brow || { len: 4.2, thick: 1 });
      if (H0.nose !== null) nose(ctx, fx, fy, ramps.skin, H0.nose || [2, 2], 3.4);
      if (H0.beard && H0.beard !== 'none') beard(ctx, H, fx, fy, H0.beard, ramps[H0.hairKey || 'hair']);
      const m = mouth(ctx, fx, fy + (H0.mouthY ?? 8), face === 'neutral' ? (H0.mouthFace || 'neutral') : face, { w: H0.mouthW || 3 });
      if (m == null) for (let i = -2; i <= 1; i++) cv.px(fx + i, fy + (H0.mouthY ?? 8) + 1, c('outline'));
      if (H0.gear) H0.gear(ctx, H);
      ctx.headMask = hm;
    },

    torso(ctx) {
      const { cv, J, c, ramps, D, pose } = ctx;
      if (pose.lying) { cfg.torso && cfg.torso(ctx); return; }
      const n = J.neck, w = J.waist, ch = J.chest, tm = ctx.torsoMask;
      const style = T0.style;
      if (style === 'tank' || style === 'robe') {
        const bottom = style === 'robe' ? w[1] + 8 : w[1] - 1;
        const top = ctx.mask().poly([[n[0] - 11, n[1] + 1], [n[0] + 11, n[1] + 1], [ch[0] + D.chestW, ch[1] + 4], [w[0] + D.waistW, bottom], [w[0] - D.waistW, bottom], [ch[0] - D.chestW, ch[1] + 4]]).clip(style === 'robe' ? ctx.mask().add(tm).add(ctx.shortsMask) : tm);
        cv.part(top, { ramp: ramps.top, bevel: 4, inner: 'line' });
        for (let i = -2; i <= 2; i++) if (style === 'robe') cv.line(w[0] + i * 6, w[1] - 6, w[0] + i * 7, bottom - 1, (X, Y) => cv.shade(X, Y, 1));
        if (T0.hem !== false) cv.line(ch[0] - D.chestW + 1, ch[1] + 4, ch[0] + D.chestW - 1, ch[1] + 4, (X, Y) => cv.px(X, Y, c('trim')));
      } else if (style === 'vest') {
        for (const s of [-1, 1]) {
          const p = ctx.mask().poly([[n[0] + s * 3, n[1] + 1], [n[0] + s * 11, n[1] + 1], [ch[0] + s * D.chestW, ch[1] + 5], [w[0] + s * (D.waistW - 1), w[1] - 2], [w[0] + s * 4, w[1] - 2]]).clip(tm);
          cv.part(p, { ramp: ramps.top, bevel: 3, inner: 'line' });
          cv.line(n[0] + s * 4, n[1] + 2, w[0] + s * 5, w[1] - 3, (X, Y) => cv.px(X, Y, c('trim')));
        }
      } else if (style === 'plate') {
        const plate = ctx.mask().poly([[n[0] - 11, n[1] + 2], [n[0] + 11, n[1] + 2], [ch[0] + D.chestW - 1, ch[1] + 1], [w[0] + D.waistW - 2, w[1] - 2], [w[0] - D.waistW + 2, w[1] - 2], [ch[0] - D.chestW + 1, ch[1] + 1]]).clip(tm);
        cv.part(plate, { ramp: ramps.top, bevel: 6, inner: 'line' });
        for (const s of [-1, 1]) cv.line(ch[0] + s * 3, ch[1] - 4, ch[0] + s * 15, ch[1] + 3, (X, Y) => cv.shade(X, Y, 1));
        cv.line(ch[0], ch[1] - 2, w[0], w[1] - 4, (X, Y) => cv.shade(X, Y, 1));
        if (T0.pauldrons !== false) for (const s of ['L', 'R']) {
          const sh = J['sh' + s], sign = s === 'L' ? -1 : 1;
          cv.part(ctx.mask().ellipse(sh[0] + sign * 1.5, sh[1] - 1, D.deltoid + 1.6, D.deltoid - 0.6), { ramp: ramps.trim, bevel: 3, inner: 'line' });
        }
      } else if (style === 'harness') {
        for (const s of [-1, 1]) {
          const st = ctx.mask().capsule(n[0] + s * 8, n[1] + 2, w[0] - s * 8, w[1] - 3, 1.7, 1.7).clip(tm);
          cv.part(st, { ramp: ramps.top, bevel: 1, inner: 'line', shadow: false });
        }
        cv.part(ctx.mask().ellipse(ch[0], ch[1] + 2, 2.6, 2.6), { ramp: ramps.trim, bevel: 2, inner: 'line', shadow: false });
      }
      if (T0.emblem) T0.emblem(ctx, Math.round(ch[0]), Math.round(ch[1] + 2));
      // a belt round the waist and trim down the trunks
      const by = Math.round(w[1] - 1), bw = cfg.belt && cfg.belt.wide || 4;
      if (!cfg.belt || cfg.belt.style !== 'none') {
        cv.part(ctx.mask().rect(w[0] - D.waistW - 1, by - 2, D.waistW * 2 + 2, bw).clip(ctx.mask().add(ctx.shortsMask).add(tm)), { ramp: ramps[cfg.belt && cfg.belt.ramp || 'trim'], bevel: 1, inner: 'line', shadow: false });
        const bk = cfg.belt && cfg.belt.buckle || 'round';
        if (bk === 'round') cv.part(ctx.mask().ellipse(w[0], by, 3.4, 3), { ramp: ramps.trim, bevel: 2, inner: 'line', shadow: false });
        else if (bk === 'square') cv.part(ctx.mask().rect(w[0] - 3, by - 2, 6, 5), { ramp: ramps.trim, bevel: 2, inner: 'line', shadow: false });
      }
      if (cfg.stripe) for (const s of [-1, 1]) cv.line(w[0] + s * (D.waistW - 1), by + 3, w[0] + s * (D.waistW + 1), by + 15, (X, Y) => cv.px(X, Y, c('trim')));
      cfg.torso && cfg.torso(ctx);
    },
  };
  return { layers, palettes };
}

// --- hair -----------------------------------------------------------------------------------

function hairdo(ctx, H, style, key) {
  if (style === 'none' || style === 'bald') return;
  const { cv, ramps, c } = ctx;
  const x = Math.round(H.x), y = Math.round(H.y), [lx, ly] = H.look, fx = x + lx, fy = y + ly;
  const R = ramps[key];
  const cap = () => ctx.mask().ellipse(x + lx * 0.3, y - 5, H.rx + 0.6, 7).cut(ctx.mask().ellipse(fx, fy + 1.5, H.rx - 1.8, 8));
  if (style === 'crop') { cv.part(cap(), { ramp: R, bevel: 3, inner: 'line' }); return; }
  if (style === 'spike') {
    const m = cap();
    for (let i = -3; i <= 3; i++) m.poly([[x + i * 3.2 - 2.4 + lx * 0.3, y - 9], [x + i * 3.2 + lx * 0.3, y - 16 - (i & 1 ? 0 : 3)], [x + i * 3.2 + 2.4 + lx * 0.3, y - 9]]);
    cv.part(m, { ramp: R, bevel: 3, inner: 'line' }); return;
  }
  if (style === 'mohawk') {
    const m = ctx.mask().rect(x - 2 + lx * 0.3, y - H.ry - 1, 4, 9);
    for (let i = 0; i < 4; i++) m.poly([[x - 2.2 + lx * 0.3, y - H.ry + 1 - i * 3], [x + lx * 0.3, y - H.ry - 6 - i * 3 + 3], [x + 2.2 + lx * 0.3, y - H.ry + 1 - i * 3]]);
    cv.part(m, { ramp: R, bevel: 2, inner: 'line' }); return;
  }
  if (style === 'long') {
    const m = cap();
    for (const s of [-1, 1]) m.rect(x + s * (H.rx - 1) - 2 + lx * 0.3, y - 3, 4, 20);
    cv.part(m, { ramp: R, bevel: 3, inner: 'line' }); return;
  }
  if (style === 'bun') {
    const m = cap().ellipse(x + lx * 0.3, y - H.ry - 3, 4.5, 4);
    cv.part(m, { ramp: R, bevel: 3, inner: 'line' }); return;
  }
  if (style === 'curls' || style === 'afro') {
    const m = cap();
    for (let i = -3; i <= 3; i++) m.ellipse(x + i * 4 + lx * 0.3, y - 8 - (i & 1), 3.2, 3.2);
    m.ellipse(x - H.rx + 0.5 + lx * 0.3, y - 1, 3, 4).ellipse(x + H.rx - 0.5 + lx * 0.3, y - 1, 3, 4);
    cv.part(m, { ramp: R, bevel: 3, inner: 'line' }); return;
  }
  if (style === 'wild') {
    const m = cap();
    for (let i = -4; i <= 4; i++) m.poly([[x + i * 2.6 - 2 + lx * 0.3, y - 8], [x + i * 3.2 + lx * 0.3, y - 15 - (Math.abs(i) & 1) * 3], [x + i * 2.6 + 2 + lx * 0.3, y - 8]]);
    for (const s of [-1, 1]) m.poly([[x + s * H.rx + lx * 0.3, y - 4], [x + s * (H.rx + 5) + lx * 0.3, y + 2], [x + s * (H.rx - 1) + lx * 0.3, y + 2]]);
    cv.part(m, { ramp: R, bevel: 3, inner: 'line' }); return;
  }
  void c;
}

// --- beards -----------------------------------------------------------------------------------

function beard(ctx, H, fx, fy, style, R) {
  const { cv, c } = ctx;
  if (style === 'full') {
    const bd = ctx.mask().ellipse(fx, fy + 8.5, H.rx - 1.2, 6).cut(ctx.mask().ellipse(fx, fy + 3.2, H.rx + 3, 4));
    bd.ellipse(fx - 6.5, fy + 5.5, 2.4, 4).ellipse(fx + 6.5, fy + 5.5, 2.4, 4);
    cv.part(bd, { ramp: R, bevel: 2, inner: 'line' });
    for (let i = -6; i <= 6; i += 2) { cv.shade(fx + i, fy + 9 + (i & 2 ? 1 : 0), 1); cv.px(fx + i, fy + 6, c('hairHi')); }
  } else if (style === 'goatee') {
    cv.part(ctx.mask().ellipse(fx, fy + 10.5, 3.6, 3.4), { ramp: R, bevel: 1, inner: 'line', shadow: false });
  } else if (style === 'stache') {
    cv.part(ctx.mask().capsule(fx - 5, fy + 6.5, fx - 0.5, fy + 5.6, 1.5, 1.3).capsule(fx + 5, fy + 6.5, fx + 0.5, fy + 5.6, 1.5, 1.3), { ramp: R, bevel: 1, inner: 'soft', shadow: false });
  } else if (style === 'stubble') {
    for (let j = 6; j <= 12; j++) for (let i = -8; i <= 8; i++) if (ctx.headMask.in(fx + i, fy + j) && (fx + i + fy + j) % 2 === 0 && Math.abs(i) > 2) cv.shade(fx + i, fy + j, 1);
  }
}

// Shared little draws the fighters' own gear uses --------------------------------------------------

// A disc with a shaded rim (halos, suns, gems): ramp keys as [rim, face, glint]
export function orb(ctx, cx, cy, rx, ry, ramp, bevel = 3) {
  ctx.cv.part(ctx.mask().ellipse(cx, cy, rx, ry), { ramp, bevel, inner: 'line', shadow: false });
}
// A ring seen at an angle (a halo, a crown band)
export function halo(ctx, cx, cy, rx, ry, ramp) {
  const m = ctx.mask().ellipse(cx, cy, rx, ry).cut(ctx.mask().ellipse(cx, cy, rx - 2, Math.max(1, ry - 1.5)));
  ctx.cv.part(m, { ramp, bevel: 1, inner: 'line', shadow: false });
}
// A wing: a fan of feathers from a shoulder root. dir -1 (the viewer's left) or 1; span = length.
export function wing(ctx, root, dir, span, spread, ramp, { rise = 0, tip = null } = {}) {
  const { cv } = ctx;
  const m = ctx.mask();
  const n = 6;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const a = (-0.35 + t * spread) * (Math.PI / 2);
    const len = span * (0.62 + 0.38 * Math.sin(Math.PI * (0.25 + 0.75 * (1 - t))));
    const ex = root[0] + dir * Math.cos(a) * len, ey = root[1] + rise - Math.sin(a) * len * 0.75;
    m.capsule(root[0], root[1], ex, ey, 5.6 - t * 1.6, 2.3);
    m.capsule(root[0] + dir * len * 0.35, root[1] + rise * 0.4 - Math.sin(a) * len * 0.3, ex, ey, 3.4, 1.9);
  }
  cv.part(m, { ramp, bevel: 3, inner: 'line' });
  if (tip) for (let i = 0; i < n; i++) { const t = i / (n - 1), a = (-0.35 + t * spread) * (Math.PI / 2); const len = span * (0.62 + 0.38 * Math.sin(Math.PI * (0.25 + 0.75 * (1 - t)))); cv.px(root[0] + dir * Math.cos(a) * (len - 1), root[1] + rise - Math.sin(a) * (len - 1) * 0.75, tip); }
}
