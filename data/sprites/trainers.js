// Trainers (customization §7): palettes and 64x60 portrait busts, painted with
// the same part/shade pipeline as the fighter portraits.
//   The Ferryman (Underworld, spec §18 A4): a hooded boatman who takes over the corner when your
//   own trainer can't follow you down. Grey-blue cowl, a gaunt pale face in the dark of it, two
//   cold eyes, a lantern's amber on the cloak, a punt pole at his shoulder.
//   Pop Malone (old-school): newsboy cap, white stubble, towel over the shoulder
//   Coach Ada (tactician): glasses, tight bun, headset mic, team polo
//   Jazzy Jay (hype man): high-top fade, shades, gold chain, loud track jacket

import { Mask, SpriteCanvas } from '../../src/engine/sprites.js';
import { makePalette, spritePalette } from '../../src/engine/palette.js';
import { paletteFor } from '../../src/engine/spriteCache.js';
import { dashPortraits } from './portraits/rival.js';

export const TRAINER_PALETTES = {
  oldschool: makePalette('trainer.pop', {
    outline: [3, 2, 3],
    skinHi: [30, 23, 17], skin: [25, 16, 11], skinSh: [18, 10, 7], skinDk: [11, 6, 5],
    white: [29, 29, 28], grey: [19, 19, 20], greyDk: [10, 10, 12],
    capHi: [20, 17, 13], cap: [14, 11, 8], capDk: [8, 6, 4],
    shirtHi: [15, 17, 21], shirt: [9, 11, 15], mouth: [12, 3, 4],
  }),
  tactician: makePalette('trainer.ada', {
    outline: [2, 2, 4],
    skinHi: [22, 15, 10], skin: [16, 10, 6], skinSh: [11, 6, 4], skinDk: [6, 3, 2],
    hairHi: [9, 7, 8], hair: [3, 2, 3],
    white: [30, 30, 30], frame: [26, 6, 8],
    poloHi: [12, 26, 26], polo: [4, 17, 18], poloDk: [2, 9, 11],
    metal: [20, 21, 24], mouth: [18, 5, 8],
  }),
  hype: makePalette('trainer.jay', {
    outline: [2, 1, 3],
    skinHi: [27, 18, 12], skin: [21, 13, 8], skinSh: [14, 8, 5], skinDk: [8, 4, 3],
    hairHi: [8, 6, 7], hair: [2, 2, 3],
    shade: [4, 5, 12], shadeHi: [14, 22, 31],
    jacketHi: [24, 12, 31], jacket: [15, 4, 23], jacketDk: [8, 2, 13],
    goldHi: [31, 30, 14], gold: [26, 19, 3], white: [30, 30, 30],
  }),
};

// (the Underworld's cornerman: not one of the three a boxer can pick, so not in TRAINERS or the password)
TRAINER_PALETTES.ferryman = makePalette('trainer.ferryman', {
  outline: [1, 1, 3],
  cloakHi: [12, 15, 19], cloak: [7, 9, 13], cloakSh: [4, 5, 8],
  skinHi: [22, 24, 24], skin: [15, 17, 18], skinSh: [9, 10, 12],
  glow: [10, 28, 27], glowHi: [22, 31, 30],
  beardHi: [21, 21, 22], beard: [13, 13, 15],
  wood: [10, 6, 3], rope: [17, 14, 9], amberHi: [31, 24, 9], amber: [26, 14, 3],
});

const PW = 64, PH = 60;
const mirror = (x) => 63 - x;
function setup(pal) {
  const cv = new SpriteCanvas(PW, PH, pal.idx('outline'));
  return { cv, m: () => new Mask(PW, PH), c: (k) => pal.idx(k), r: (...keys) => keys.map((k) => pal.idx(k)) };
}

function popPortrait(pal) {
  const { cv, m, c, r } = setup(pal);
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const shirt = r('shirtHi', 'shirt', 'greyDk');
  // sweatshirt + towel over the viewer-right shoulder
  cv.part(m().poly([[0, 60], [3, 50], [14, 44], [50, 44], [61, 50], [64, 60]]), { ramp: shirt, bevel: 8 });
  cv.part(m().capsule(32, 36, 32, 46, 8.5, 9), { ramp: skin, bevel: 4, bias: -0.15 });
  cv.part(m().ellipse(32, 46, 9, 3).cut(m().rect(0, 0, 64, 45)), { ramp: r('grey', 'greyDk', 'outline'), bevel: 2 });
  const towel = m().poly([[40, 42], [56, 45], [60, 60], [44, 60], [42, 50]]);
  cv.part(towel, { ramp: r('white', 'white', 'grey', 'greyDk'), bevel: 4 });
  for (const y of [49, 53, 57]) cv.line(45, y, 58, y + 1, (x, yy) => cv.shade(x, yy, 1));
  // big ears, long face
  cv.part(m().ellipse(15, 29, 4, 6).ellipse(mirror(15), 29, 4, 6), { ramp: skin, bevel: 3 });
  cv.shade(15, 30, 1); cv.shade(48, 30, 1);
  const head = m().ellipse(32, 26, 16, 17).ellipse(32, 34, 14.5, 11);
  cv.part(head, { ramp: skin, bevel: 10 });
  // white stubble + wrinkles
  for (let y = 36; y < 46; y++) for (let x = 18; x < 46; x++) if (head.in(x, y) && (x * 5 + y * 3) % 7 === 0 && (y > 38 || x < 24 || x > 40)) cv.px(x, y, c(y > 42 ? 'grey' : 'white'));
  cv.line(21, 30, 24, 33, (x, y) => cv.shade(x, y, 1)); cv.line(mirror(21), 30, mirror(24), 33, (x, y) => cv.shade(x, y, 1));
  for (const x of [26, 32, 38]) cv.shade(x, 17, 1);
  // squinty eyes under white brows
  for (const s of [1, -1]) {
    const X = (x) => (s > 0 ? x : mirror(x));
    for (let x = 21; x <= 27; x++) cv.px(X(x), 25, c(x === 21 || x === 27 ? 'outline' : 'white'));
    for (let x = 22; x <= 26; x++) cv.px(X(x), 24, c('outline'));
    cv.px(X(24), 25, c('outline')); cv.px(X(25), 25, c('outline'));
    for (let x = 22; x <= 27; x++) cv.shade(X(x), 27, 1);
    cv.px(X(28), 26, c('skinDk'));
  }
  cv.part(m().capsule(19.5, 21.5, 28, 22.5, 2.3, 1.6).capsule(mirror(19.5), 21.5, mirror(28), 22.5, 2.3, 1.6), { ramp: r('white', 'grey', 'greyDk'), bevel: 2, inner: 'soft' });
  // crooked boxer's nose
  cv.part(m().ellipse(33, 31, 4.2, 3.8).rect(31, 24, 4, 6), { ramp: skin, bevel: 3, inner: 'soft' });
  cv.px(30, 33, c('skinDk')); cv.px(35, 33, c('skinDk'));
  // wry grin with a toothpick
  for (let x = 27; x <= 37; x++) cv.px(x, 39, c(x < 29 ? 'outline' : 'mouth'));
  for (let x = 30; x <= 36; x++) cv.px(x, 38, c('white'));
  cv.px(38, 38, c('outline'));
  cv.line(37, 39, 45, 36, (x, y) => cv.px(x, y, c('capHi')));
  // newsboy cap: soft crown pulled forward, short brim, button on top
  const crown = m().ellipse(33, 13, 19.5, 9).ellipse(40, 14, 14, 7.5).cut(m().rect(0, 18, 64, 50));
  cv.part(crown, { ramp: r('capHi', 'cap', 'capDk'), bevel: 6 });
  for (let x = 16; x < 52; x += 3) cv.line(x, 5, x + 3, 17, (X, Y) => { if (crown.in(X, Y) && (X + Y) % 3 === 0) cv.shade(X, Y, 1); });
  cv.part(m().ellipse(32, 18.5, 20.5, 3.2).cut(m().rect(0, 0, 64, 18)), { ramp: r('capHi', 'cap', 'capDk'), bevel: 1, bias: -0.3 });
  cv.px(33, 4, c('capHi')); cv.px(34, 4, c('capHi'));
  for (let x = 15; x < 50; x++) if (head.in(x, 21)) cv.shade(x, 21, 1);
  return cv.toSprite(0, 0, false);
}

function adaPortrait(pal) {
  const { cv, m, c, r } = setup(pal);
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const polo = r('poloHi', 'polo', 'poloDk');
  const hair = r('hairHi', 'hair', 'outline');
  // polo with a white collar, whistle on a lanyard
  cv.part(m().poly([[0, 60], [4, 50], [15, 45], [49, 45], [60, 50], [64, 60]]), { ramp: polo, bevel: 8 });
  cv.part(m().capsule(32, 36, 32, 47, 7, 8), { ramp: skin, bevel: 3, bias: -0.15 });
  cv.part(m().poly([[21, 44], [31, 52], [26, 54]]).poly([[43, 44], [33, 52], [38, 54]]), { ramp: r('white', 'white', 'metal'), bevel: 2 });
  cv.line(24, 46, 29, 58, (x, y) => cv.px(x, y, c('frame'))); cv.line(40, 46, 35, 58, (x, y) => cv.px(x, y, c('frame')));
  cv.part(m().rect(29, 57, 6, 3), { ramp: r('white', 'metal', 'outline'), bevel: 1, shadow: false });
  // bun behind the head
  cv.part(m().ellipse(32, 6, 7.5, 5.5), { ramp: hair, bevel: 4 });
  cv.part(m().ellipse(16.5, 28, 3, 4.5).ellipse(mirror(16.5), 28, 3, 4.5), { ramp: skin, bevel: 2 });
  const head = m().ellipse(32, 26, 14.5, 16.5).ellipse(32, 32, 12.5, 11.5);
  cv.part(head, { ramp: skin, bevel: 9 });
  // hair pulled back tight
  const hr = m().ellipse(32, 18, 15.5, 11).cut(m().rect(0, 17, 64, 50)).rect(17, 16, 3, 9).rect(44, 16, 3, 9);
  cv.part(hr, { ramp: hair, bevel: 4, inner: 'line' });
  for (const x of [24, 30, 36, 41]) cv.line(x, 9, x + (x < 32 ? -2 : 2), 17, (X, Y) => cv.shade(X, Y, -1));
  // eyes behind red frames
  for (const s of [1, -1]) {
    const X = (x) => (s > 0 ? x : mirror(x));
    for (let x = 22; x <= 28; x++) { cv.px(X(x), 22, c('frame')); cv.px(X(x), 29, c('frame')); }
    for (let y = 22; y <= 29; y++) { cv.px(X(21), y, c('frame')); cv.px(X(29), y, c('frame')); }
    for (let x = 23; x <= 27; x++) cv.px(X(x), 25, c('outline'));
    for (let x = 23; x <= 27; x++) cv.px(X(x), 26, c('white'));
    cv.px(X(25), 26, c('outline')); cv.px(X(26), 26, c('outline'));
    cv.px(X(23), 23, c('white'));
    cv.line(X(22), 20, X(28), 19, (x, y) => cv.px(x, y, c('hair')));
  }
  cv.line(30, 25, 34, 25, (x, y) => cv.px(x, y, c('frame')));
  // nose + calm, confident mouth
  cv.line(33, 26, 34, 31, (x, y) => cv.shade(x, y, 1));
  cv.px(30, 33, c('skinDk')); cv.px(34, 33, c('skinDk'));
  for (let x = 28; x <= 36; x++) cv.px(x, 38, c('mouth'));
  cv.px(27, 37, c('outline')); cv.px(37, 37, c('outline'));
  for (let x = 29; x <= 35; x++) cv.shade(x, 39, 1);
  // headset: band over the head, mic boom to the mouth
  cv.line(15, 26, 16, 10, (x, y) => cv.px(x, y, c('metal')));
  cv.part(m().ellipse(15, 28, 3, 4.5), { ramp: r('metal', 'outline', 'outline'), bevel: 1 });
  cv.line(16, 32, 26, 39, (x, y) => cv.px(x, y, c('outline')));
  cv.part(m().ellipse(27, 39, 2, 1.6), { ramp: r('metal', 'outline', 'outline'), bevel: 1, shadow: false });
  return cv.toSprite(0, 0, false);
}

function jayPortrait(pal) {
  const { cv, m, c, r } = setup(pal);
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const jacket = r('jacketHi', 'jacket', 'jacketDk');
  // track jacket with a stand collar, stripes, open zip
  cv.part(m().poly([[0, 60], [2, 49], [13, 43], [51, 43], [62, 49], [64, 60]]), { ramp: jacket, bevel: 8 });
  for (const x of [8, 11]) cv.line(x, 47, x - 4, 60, (X, Y) => cv.px(X, Y, c('shadeHi')));
  for (const x of [55, 52]) cv.line(x, 47, x + 4, 60, (X, Y) => cv.px(X, Y, c('shadeHi')));
  cv.part(m().capsule(32, 36, 32, 48, 8, 9), { ramp: skin, bevel: 4, bias: -0.15 });
  cv.part(m().poly([[18, 42], [27, 44], [30, 60], [24, 60]]).poly([[46, 42], [37, 44], [34, 60], [40, 60]]), { ramp: jacket, bevel: 2, bias: 0.25 });
  // gold chain with a medallion
  const chain = m().ellipse(32, 47, 9, 6).cut(m().ellipse(32, 46, 7.6, 4.8)).cut(m().rect(0, 0, 64, 46));
  cv.part(chain, { ramp: r('goldHi', 'gold', 'skinDk'), bevel: 1, shadow: false });
  cv.part(m().ellipse(32, 54, 3.2, 3.2), { ramp: r('goldHi', 'gold', 'skinDk'), bevel: 2 });
  // head
  cv.part(m().ellipse(17, 29, 3, 4.5).ellipse(mirror(17), 29, 3, 4.5), { ramp: skin, bevel: 2 });
  const head = m().ellipse(32, 27, 14, 15.5).ellipse(32, 33, 13, 11);
  cv.part(head, { ramp: skin, bevel: 9 });
  // high-top fade
  const hr = m().rect(18, 2, 28, 18).ellipse(32, 18, 14.4, 7);
  cv.part(hr.cut(m().rect(0, 21, 64, 50)), { ramp: r('hairHi', 'hair', 'outline'), bevel: 3 });
  for (let y = 16; y < 24; y++) for (const x of [17, 18, 45, 46]) if (head.in(x, y) && (x + y) % 2 === 0) cv.px(x, y, c('hair'));
  for (let x = 20; x < 45; x += 3) cv.px(x, 4, c('hairHi'));
  // wraparound shades with a glint
  const sh = m().poly([[17, 23], [47, 23], [45, 29], [36, 30], [32, 26], [28, 30], [19, 29]]);
  cv.part(sh, { ramp: r('shadeHi', 'shade', 'shade'), bevel: 2, bias: -0.4 });
  cv.px(22, 24, c('shadeHi')); cv.px(23, 24, c('shadeHi')); cv.px(40, 24, c('shadeHi'));
  // nose + huge grin
  cv.px(30, 33, c('skinDk')); cv.px(34, 33, c('skinDk')); cv.shade(32, 32, 1);
  const mo = m().ellipse(32, 39, 7, 3).cut(m().rect(0, 0, 64, 38));
  cv.flat(mo, c('outline'), false);
  for (let x = 26; x <= 38; x++) cv.px(x, 38, c('outline'));
  for (let x = 27; x <= 37; x++) cv.px(x, 39, c('white'));
  cv.px(34, 39, c('goldHi'));
  for (let x = 29; x <= 35; x++) cv.shade(x, 43, 1);
  cv.px(25, 37, c('outline')); cv.px(39, 37, c('outline'));
  return cv.toSprite(0, 0, false);
}

function ferrymanPortrait(pal) {
  const { cv, m, c, r } = setup(pal);
  const cloak = r('cloakHi', 'cloak', 'cloakSh', 'outline');
  const skin = r('skinHi', 'skin', 'skinSh', 'cloakSh');
  // the punt pole, upright behind his right shoulder (the viewer's right), a rope-wrapped grip
  cv.part(m().rect(51, 0, 4, 60), { ramp: r('rope', 'wood', 'outline'), bevel: 2, inner: 'line' });
  for (const y of [8, 11, 14, 17]) cv.line(51, y, 54, y + 1, (X, Y) => cv.px(X, Y, c('rope')));
  // shoulders: a heavy wet cloak, a rope knot at the throat
  cv.part(m().poly([[0, 60], [1, 48], [12, 40], [52, 40], [63, 48], [64, 60]]), { ramp: cloak, bevel: 8 });
  for (const x of [10, 18, 46, 54]) cv.line(x, 46, x + (x < 32 ? -3 : 3), 60, (X, Y) => cv.shade(X, Y, 1));
  cv.line(24, 46, 40, 46, (X, Y) => cv.px(X, Y, c('rope')));
  cv.part(m().ellipse(32, 49, 3.4, 3), { ramp: r('rope', 'rope', 'wood'), bevel: 2, inner: 'line', shadow: false });
  // the lantern's light, low on the viewer-left: amber over the cloak
  for (let y = 44; y < 60; y++) for (let x = 0; x < 20; x++) { const d = Math.hypot(x - 2, (y - 60) * 1.1); if (d < 14 && (x + y * 2) % 3 === 0 && d < 8 + ((x + y) % 4)) cv.px(x, y, c(d < 6 ? 'amberHi' : 'amber')); }
  // the face in the dark of the hood: gaunt, pale, a long grey beard
  cv.part(m().capsule(32, 34, 32, 44, 7, 8), { ramp: skin, bevel: 3, bias: -0.2 });
  const face = m().ellipse(32, 29, 12, 15).ellipse(32, 36, 9, 12);
  cv.part(face, { ramp: skin, bevel: 8 });
  // sunk cheeks and brow shadow
  for (const s of [1, -1]) { const X = (x) => (s > 0 ? x : mirror(x)); for (let y = 30; y < 38; y++) cv.shade(X(24 + ((y - 30) >> 2)), y, 1); }
  for (let x = 22; x <= 41; x++) { cv.shade(x, 22, 1); cv.shade(x, 23, 1); }
  // the eyes: two cold points, deep in shadow
  for (const s of [1, -1]) {
    const X = (x) => (s > 0 ? x : mirror(x));
    for (const x of [24, 25, 26, 27]) { cv.px(X(x), 24, c('outline')); cv.px(X(x), 25, c('cloakSh')); }
    cv.px(X(26), 25, c('glow')); cv.px(X(27), 25, c('glow')); cv.px(X(26), 24, c('glowHi'));
  }
  // a long thin nose and a flat mouth in a beard that runs down onto the cloak
  cv.line(32, 26, 33, 33, (X, Y) => cv.shade(X, Y, 1)); cv.px(31, 33, c('cloakSh')); cv.px(34, 33, c('cloakSh'));
  const beard = m().ellipse(32, 40, 8.5, 6).cut(m().ellipse(32, 35, 10, 3.6)).poly([[26, 42], [38, 42], [35, 54], [32, 57], [29, 54]]);
  cv.part(beard, { ramp: r('beardHi', 'beard', 'cloakSh'), bevel: 3, inner: 'line' });
  for (const x of [28, 31, 34, 37]) cv.line(x, 42, x - (x > 32 ? -1 : 1), 53, (X, Y) => cv.shade(X, Y, 1));
  for (let x = 29; x <= 35; x++) cv.px(x, 37, c('outline'));
  // the hood: a deep cowl round the face, peaked over the brow
  const hood = m().ellipse(32, 19, 25, 20).poly([[6, 60], [8, 30], [16, 14], [48, 14], [56, 30], [58, 60]]).cut(m().ellipse(32, 30, 12.5, 15)).cut(m().rect(19, 20, 26, 34));
  cv.part(hood.clip(m().rect(0, 0, 64, 46)), { ramp: cloak, bevel: 7, inner: 'line' });
  // the hood's edge, catching a little light, and the folds
  for (let a = 0; a < 30; a++) { const t = (a / 29) * Math.PI; cv.px(Math.round(32 - Math.cos(t) * 12.5), Math.round(30 - Math.sin(t) * 15.4), c('cloakHi')); }
  for (const x of [12, 17, 47, 52]) cv.line(x, 18, x + (x < 32 ? -2 : 2), 42, (X, Y) => cv.shade(X, Y, 1));
  cv.px(32, 15, c('cloakHi')); cv.px(31, 15, c('cloakHi')); cv.px(33, 15, c('cloakHi'));
  return cv.toSprite(0, 0, false);
}

const PAINT = { oldschool: popPortrait, tactician: adaPortrait, hype: jayPortrait, ferryman: ferrymanPortrait };
const cache = {};
export function trainerPortrait(id) {
  // Dash, freed (ZERO's true form: he is in your corner): his own portrait from the gym, in his first outfit's colours
  if (id === 'dash' && !cache.dash) { const pal = paletteFor('dash1'); cache.dash = { sprite: dashPortraits.dash1(pal), pal: pal.u32, palette: pal }; }
  if (!cache[id]) {
    const pal = spritePalette(TRAINER_PALETTES[id] || TRAINER_PALETTES.oldschool);
    cache[id] = { sprite: (PAINT[id] || popPortrait)(pal), pal: pal.u32, palette: pal };
  }
  return cache[id];
}
