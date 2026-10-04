// Portrait rig for the Ascension's fighters (Phase B on): the 64x60 intro-card bust from a config, on
// the fighter's own palette (the same keys as the sprite rig: skinHi.. hair.. top.. trim..). The
// same kit calls the hand-painted portraits use (kit.js), so they sit together on the card.
//
//   portrait({
//     bg(k), behind(k), body(k), mid(k, hm), front(k, hm),   hooks: what's drawn behind, on the body, over the hair, over it all
//     top: { neck, top, slope }      the shoulders (defaults 8, 46, 12)
//     head: { rx, ry, cy, jawY, jawRx, jawRy }
//     hair: 'none' | 'crop' | 'spike' | 'long' | 'bun' | 'curls' | 'wild' | 'mohawk' | 'sweep'
//     beard: 'none' | 'full' | 'goatee' | 'stache' | 'stubble'
//     eyes: 'normal' | 'wide' | 'narrow' | 'heavy', brow: { r0, r1, tilt, y }, nose: { rx, ry }, mouth: 'flat' | 'smile' | 'grin' | 'open',
//     ear: [x, y, rx, ry]
//   }) -> (pal) => sprite

import { setup, mirror, bust, earsP, headP, eyesP, browsP, noseP, mouthP } from './kit.js';

export function portrait(cfg) {
  return (pal) => {
    const k = setup(pal), { cv, m, c, r } = k;
    const skin = r('skinHi', 'skin', 'skinSh', 'skinDk'), hair = r('hairHi', 'hair', 'hairDk'), top = r('topHi', 'top', 'topSh', 'topDk');
    const H = { rx: 14, ry: 16, cy: 27, jawY: 34, jawRx: 12, jawRy: 11, ...(cfg.head || {}) };
    cfg.bg && cfg.bg(k);
    cfg.behind && cfg.behind(k);
    const T = { neck: 8, top: 46, slope: 12, ...(cfg.top || {}) };
    bust(k, top, skin, T);
    cfg.body && cfg.body(k);
    const ear = cfg.ear || [17, H.cy + 3, 2.6, 4];
    if (cfg.ear !== null) earsP(k, skin, ...ear);
    const hm = headP(k, skin, H);
    hairP(k, cfg.hair || 'none', hair, H);
    cfg.mid && cfg.mid(k, hm);
    const ey = H.cy - 1;
    eyesP(k, { y: ey, x0: 22, x1: 28, style: cfg.eyes || 'normal', iris: cfg.iris });
    const B = { r0: 1.8, r1: 1.5, tilt: 1, y: ey - 3.5, ...(cfg.brow || {}) };
    browsP(k, hair, B);
    if (cfg.nose !== null) noseP(k, skin, { y: H.cy + 6, rx: 2.6, ry: 2.4, ...(cfg.nose || {}) });
    beardP(k, cfg.beard || 'none', hair, H);
    mouthP(k, { y: H.cy + 14, x0: 28, x1: 36, kind: cfg.mouth || 'flat' });
    cfg.front && cfg.front(k, hm);
    return cv.toSprite(0, 0, false);
  };
}

function hairP(k, style, hair, H) {
  if (style === 'none' || style === 'bald') return;
  const { cv, m } = k, { rx, cy } = H;
  const cap = () => m().ellipse(32, cy - 8, rx + 1.4, 10).cut(m().ellipse(32, cy + 4, rx - 2.6, 12));
  if (style === 'crop') { cv.part(cap(), { ramp: hair, bevel: 3, inner: 'line' }); return; }
  if (style === 'sweep') { const h = cap().ellipse(32 - rx, cy + 1, 3.6, 9); cv.part(h, { ramp: hair, bevel: 3, inner: 'line' }); return; }
  if (style === 'spike') {
    const h = cap();
    for (let x = -3; x <= 3; x++) h.poly([[32 + x * 4 - 3, cy - 14], [32 + x * 4.6, cy - 25 - (x & 1) * 3], [32 + x * 4 + 3, cy - 14]]);
    cv.part(h, { ramp: hair, bevel: 2, inner: 'line' }); return;
  }
  if (style === 'mohawk') {
    const h = m().rect(29, cy - 22, 6, 12);
    for (let i = 0; i < 4; i++) h.poly([[29, cy - 20 + i * -2], [32, cy - 30 - i], [35, cy - 20 + i * -2]]);
    cv.part(h, { ramp: hair, bevel: 2, inner: 'line' }); return;
  }
  if (style === 'long') {
    const h = cap();
    for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); h.poly([[X(32 - rx), cy - 6], [X(32 - rx + 5), cy - 6], [X(32 - rx + 4), cy + 26], [X(32 - rx - 3), cy + 24]]); }
    cv.part(h, { ramp: hair, bevel: 4, inner: 'line' }); return;
  }
  if (style === 'bun') { const h = cap().ellipse(32, cy - H.ry - 3, 6, 5); cv.part(h, { ramp: hair, bevel: 3, inner: 'line' }); return; }
  if (style === 'curls') {
    const h = cap();
    for (let i = -4; i <= 4; i++) h.ellipse(32 + i * 5, cy - 13 - (i & 1) * 1.5, 4.2, 4);
    for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); h.ellipse(X(32 - rx), cy - 2, 3.6, 5.4).ellipse(X(32 - rx), cy + 6, 3, 4); }
    cv.part(h, { ramp: hair, bevel: 3, inner: 'line' }); return;
  }
  if (style === 'wild') {
    const h = cap();
    for (let i = -5; i <= 5; i++) h.poly([[32 + i * 3.4 - 3, cy - 12], [32 + i * 4.4, cy - 21 - (Math.abs(i) & 1) * 4], [32 + i * 3.4 + 3, cy - 12]]);
    for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); h.poly([[X(32 - rx), cy - 6], [X(32 - rx - 8), cy + 6], [X(32 - rx + 1), cy + 8]]); }
    cv.part(h, { ramp: hair, bevel: 3, inner: 'line' });
  }
}

function beardP(k, style, hair, H) {
  if (style === 'none') return;
  const { cv, m, c } = k, { rx, cy } = H;
  if (style === 'full') {
    const bd = m().ellipse(32, cy + 15, rx - 0.5, 10).cut(m().ellipse(32, cy + 7, rx + 4, 7));
    for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); bd.ellipse(X(32 - rx + 2), cy + 8, 3.8, 7); }
    cv.part(bd, { ramp: hair, bevel: 4, inner: 'line' });
    for (let x = 20; x < 45; x += 3) cv.shade(x, cy + 17 + ((x >> 1) & 1), 1);
  } else if (style === 'goatee') {
    cv.part(m().ellipse(32, cy + 16, 4.4, 5), { ramp: hair, bevel: 2, inner: 'line', shadow: false });
  } else if (style === 'stache') {
    cv.part(m().capsule(25, cy + 11, 32, cy + 9.6, 2.2, 1.8).capsule(39, cy + 11, 32, cy + 9.6, 2.2, 1.8), { ramp: hair, bevel: 1, inner: 'soft', shadow: false });
  } else if (style === 'stubble') {
    for (let y = cy + 9; y < cy + 20; y++) for (let x = 18; x < 46; x++) if ((x + y) % 2 === 0 && Math.abs(x - 32) > 3) k.cv.shade(x, y, 1);
  }
  void c;
}
