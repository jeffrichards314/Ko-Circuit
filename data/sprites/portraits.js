// Intro-card portraits (64x60 busts), painted at portrait scale with the same
// part/shade pipeline as the fighters.
import { Mask, SpriteCanvas } from '../../src/engine/sprites.js';
import { kidPortrait, mortPortrait, gusPortrait } from './portraits/rookie.js';
import { roccoPortrait, gambiniPortrait, knoxPortrait, brodyPortrait } from './portraits/minor.js';
import { rayPortrait, pidgePortrait, samPortrait, mcbridePortrait } from './portraits/metro.js';
import { djdropPortrait, anchorPortrait, geminiPortrait, midnightPortrait } from './portraits/major.js';
import { strongmanPortrait, pocketsPortrait, tessPortrait, jinxPortrait, rexPortrait } from './portraits/carnival.js';
import { rustyPortrait, tiaPortrait, suturesPortrait, baronPortrait } from './portraits/continental.js';
import { larsPortrait, hankPortrait, glacierPortrait, maestroPortrait } from './portraits/world.js';
import { boltPortrait, downpourPortrait, colePortrait, avalanchePortrait } from './portraits/storm.js';
import { rourkePortrait, ignatiusPortrait, duchessPortrait, mirrorPortrait } from './portraits/legends.js';
import { novaPortrait, goliathPortrait, quinnPortrait, monkPortrait, karverPortrait, jaxPortrait } from './portraits/grandprix.js';
import { staticPortrait, cadePortrait, nullPortrait, wardenPortrait } from './portraits/underground.js';
import { dashPortraits } from './portraits/rival.js';
import * as pantheonPortraits from './portraits/pantheon.js';
import * as underworldPortraits from './portraits/underworld.js';
import * as abyssPortraits from './portraits/abyss.js';
import { voidPortraits } from './portraits/void.js';
import { hollowPortrait, frenzyPortrait, eclipsePortrait, zeroPortrait, zeroTruePortrait } from './portraits/nightmare.js';

const PW = 64, PH = 60;

function setup(pal) {
  const cv = new SpriteCanvas(PW, PH, pal.idx('outline'));
  const m = () => new Mask(PW, PH);
  const c = (k) => pal.idx(k);
  const r = (...keys) => keys.map(c);
  return { cv, m, c, r };
}
const mirror = (x) => 63 - x;

// Opponent portraits by fighter id (filled in below the painters).
export const PORTRAITS = {};

export function barneyPortrait(pal) {
  const { cv, m, c, r } = setup(pal);
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const shirt = r('shirtHi', 'shirt', 'shirtSh', 'shirtDk');
  const hair = r('hairHi', 'hair', 'hairDk');
  const cap = r('capHi', 'cap', 'capDk');
  // shoulders + shirt
  const torso = m().poly([[0, 60], [3, 49], [14, 42], [50, 42], [61, 49], [64, 60]]);
  cv.part(torso, { ramp: shirt, bevel: 8 });
  const neck = m().capsule(32, 36, 32, 46, 9, 9.5);
  cv.part(neck, { ramp: skin, bevel: 4, bias: -0.15 });
  const vee = m().poly([[25, 44], [39, 44], [32, 55]]);
  cv.part(vee, { ramp: r('white', 'hairHi', 'hair'), bevel: 2, inner: 'line' });
  const collar = m().poly([[20, 41], [31, 55], [22, 52]]).poly([[44, 41], [33, 55], [42, 52]]);
  cv.part(collar, { ramp: shirt, bevel: 2, bias: 0.25 });
  const patch = m().ellipse(12.5, 53.5, 6, 3.4);
  cv.part(patch, { ramp: r('white', 'white', 'hairHi'), bevel: 1, shadow: false });
  [[9, 53], [10, 54], [11, 53], [12, 54], [13, 53], [14, 54], [15, 53]].forEach(([x, y]) => cv.px(x, y, c('patch')));
  cv.line(32, 55, 32, 60, (x, y) => cv.shade(x, y, 1));
  cv.px(33, 57, c('white'));
  // ears, head, jaw
  const ears = m().ellipse(14.5, 30, 3.6, 5.5).ellipse(mirror(14.5), 30, 3.6, 5.5);
  cv.part(ears, { ramp: skin, bevel: 3 });
  cv.shade(14, 30, 1); cv.shade(49, 30, 1);
  const head = m().ellipse(32, 26, 16.5, 17).ellipse(32, 33, 16.8, 12.5);
  cv.part(head, { ramp: skin, bevel: 10 });
  // stubble
  for (let y = 36; y < 46; y++) for (let x = 16; x < 48; x++) if (head.in(x, y) && (x + y) % 2 === 0) cv.shade(x, y, 1);
  // sideburns
  for (let y = 24; y <= 31; y++) for (const x of [16, 17, 46, 47]) if (head.in(x, y) && (y > 26 || x === 16 || x === 47)) cv.px(x, y, c(y < 27 ? 'hairHi' : 'hair'));
  // cheeks
  const cheeks = m().ellipse(20.5, 33, 3, 1.8).ellipse(mirror(20.5), 33, 3, 1.8);
  cv.flat(cheeks, c('ruddy'));
  // eyes: heavy, tired lids
  for (const s of [1, -1]) {
    const X = (x) => (s > 0 ? x : mirror(x));
    for (let x = 21; x <= 27; x++) cv.px(X(x), 24, c('outline'));
    for (let x = 21; x <= 27; x++) cv.px(X(x), 25, c(x === 21 || x === 27 ? 'outline' : 'white'));
    for (let x = 22; x <= 26; x++) cv.px(X(x), 26, c('white'));
    cv.px(X(24), 25, c('outline')); cv.px(X(25), 25, c('outline'));
    cv.px(X(24), 26, c('outline')); cv.px(X(25), 26, c('outline'));
    cv.px(X(22), 25, c('skinSh')); cv.px(X(26), 25, c('white'));
    for (let x = 22; x <= 26; x++) cv.shade(X(x), 28, 1);
    cv.shade(X(21), 27, 1); cv.shade(X(27), 27, 1);
  }
  // bushy brows
  const brows = m().capsule(19.5, 21, 28, 21.5, 2.2, 1.8).capsule(mirror(19.5), 21, mirror(28), 21.5, 2.2, 1.8);
  cv.part(brows, { ramp: hair, bevel: 2, inner: 'soft' });
  // big nose
  const nose = m().ellipse(32, 31.5, 5, 4.2).rect(30, 24, 4, 6);
  cv.part(nose, { ramp: r('skinHi', 'ruddy', 'skinSh', 'skinDk'), bevel: 3, inner: 'soft' });
  cv.px(29, 34, c('skinDk')); cv.px(30, 34, c('skinDk')); cv.px(33, 34, c('skinDk')); cv.px(34, 34, c('skinDk'));
  // smirk
  for (let x = 29; x <= 36; x++) cv.px(x, 43, c('mouth'));
  cv.px(37, 42, c('mouth')); cv.px(28, 43, c('outline'));
  // walrus mustache
  const mu = m()
    .ellipse(25.5, 38, 8.3, 3.8, 1, -0.28).ellipse(mirror(25.5), 38, 8.3, 3.8, 1, 0.28)
    .ellipse(32, 36.5, 5.5, 2.8)
    .ellipse(18.5, 42, 2.4, 3.2).ellipse(mirror(18.5), 42, 2.4, 3.2);
  cv.part(mu, { ramp: hair, bevel: 3, inner: 'line' });
  for (const x of [21, 24, 27, 36, 39, 42]) cv.line(x, 37, x + (x < 32 ? -1 : 1), 40, (X, Y) => cv.shade(X, Y, 1));
  for (const x of [23, 40]) cv.shade(x, 36, -1);
  // chin dimple
  cv.shade(32, 46, 1); cv.shade(31, 46, 1);
  // work cap
  const dome = m().ellipse(32, 12.5, 18, 10).cut(m().rect(0, 16, 64, 30));
  cv.part(dome, { ramp: cap, bevel: 8 });
  cv.line(32, 3, 32, 15, (x, y) => cv.shade(x, y, 1));
  cv.line(22, 6, 20, 15, (x, y) => cv.shade(x, y, 1));
  cv.line(42, 6, 44, 15, (x, y) => cv.shade(x, y, 1));
  cv.px(32, 2, c('capHi')); cv.px(31, 2, c('capHi'));
  const badge = m().rect(24, 10, 5, 4);
  cv.part(badge, { ramp: r('metalHi', 'metal', 'brown'), bevel: 1, inner: 'line', shadow: false });
  const bill = m().ellipse(32, 16.5, 21, 3.6).cut(m().rect(0, 0, 64, 16));
  cv.part(bill, { ramp: cap, bevel: 1, bias: -0.3, inner: 'line' });
  for (let x = 14; x < 50; x++) if (head.in(x, 20)) cv.shade(x, 20, 1);
  return cv.toSprite(0, 0, false);
}

export function playerPortrait(pal, hairStyle = 'spiky') {
  const { cv, m, c, r } = setup(pal);
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'outline');
  const style = FRONT_HAIR[hairStyle] || FRONT_HAIR.spiky;
  // shoulders, bare deltoids, tank top
  const torso = m().poly([[0, 60], [2, 50], [12, 43], [52, 43], [62, 50], [64, 60]]);
  cv.part(torso, { ramp: skin, bevel: 8 });
  const neck = m().capsule(32, 36, 32, 46, 7.5, 8.5);
  cv.part(neck, { ramp: skin, bevel: 3, bias: -0.15 });
  const tank = m().poly([[16, 60], [18, 46], [24, 43], [27, 50], [37, 50], [40, 43], [46, 46], [48, 60]]);
  cv.part(tank, { ramp: r('shirtHi', 'shirt', 'outline'), bevel: 5 });
  cv.shade(22, 52, 1); cv.shade(41, 52, 1);
  if (style.back) style.back({ cv, m, c, hair });
  // head
  const ears = m().ellipse(17.5, 28, 3, 4.5).ellipse(mirror(17.5), 28, 3, 4.5);
  cv.part(ears, { ramp: skin, bevel: 2 });
  const head = m().ellipse(32, 25, 14, 16).ellipse(32, 31, 13, 11);
  cv.part(head, { ramp: skin, bevel: 9 });
  // eyes: determined, blue
  for (const s of [1, -1]) {
    const X = (x) => (s > 0 ? x : mirror(x));
    for (let x = 23; x <= 28; x++) cv.px(X(x), 24, c('outline'));
    cv.px(X(23), 25, c('outline'));
    for (let x = 24; x <= 28; x++) cv.px(X(x), 25, c('white'));
    for (let x = 24; x <= 27; x++) cv.px(X(x), 26, c('white'));
    cv.px(X(26), 25, c('eye')); cv.px(X(27), 25, c('eye')); cv.px(X(26), 26, c('eye')); cv.px(X(27), 26, c('outline'));
    for (let x = 24; x <= 27; x++) cv.px(X(x), 27, c('skinSh'));
    // angled brows
    cv.line(X(22), 20, X(29), 22, (x, y) => { cv.px(x, y, c('hair')); cv.px(x, y + 1, c('hair')); });
  }
  // nose + mouth
  cv.line(31, 25, 30, 31, (x, y) => cv.shade(x, y, 1));
  cv.px(30, 32, c('skinDk')); cv.px(33, 32, c('skinDk')); cv.shade(31, 32, 1); cv.shade(32, 32, 1);
  for (let x = 28; x <= 36; x++) cv.px(x, 37, c(x < 30 ? 'outline' : 'mouth'));
  cv.px(36, 36, c('outline')); cv.px(37, 36, c('outline'));
  for (let x = 30; x <= 35; x++) cv.shade(x, 38, 1);
  cv.shade(32, 41, 1); cv.shade(31, 41, 1);
  style.front({ cv, m, c, hair, head });
  // raised glove in the corner
  const g = m().ellipse(8, 50, 9, 10.5, 1, -0.3).capsule(12, 60, 16, 60, 5, 5);
  cv.part(g, { ramp: r('gloveHi', 'glove', 'gloveDk'), bevel: 7 });
  const th = m().ellipse(15, 49, 3.5, 5.5, 1, -0.3);
  cv.part(th, { ramp: r('gloveHi', 'glove', 'gloveDk'), bevel: 2, inner: 'line', shadow: false });
  cv.shade(4, 44, -2); cv.shade(5, 43, -2);
  return cv.toSprite(0, 0, false);
}

// Front-view hair styles for the player portrait (customization §7).
// back() paints before the head (volume behind it), front() paints over it.
const FRONT_HAIR = {
  spiky: {
    front({ cv, m, hair }) {
      const hr = m().ellipse(32, 15, 15.5, 9).rect(17, 14, 30, 5);
      hr.poly([[17, 12], [9, 7], [18, 7]]).poly([[20, 8], [16, 0], [26, 6]]).poly([[25, 6], [28, -2], [33, 5]]);
      hr.poly([[32, 5], [40, -1], [39, 7]]).poly([[38, 6], [48, 2], [45, 10]]).poly([[45, 10], [54, 9], [47, 16]]);
      hr.poly([[17, 16], [15, 25], [20, 18]]).poly([[47, 16], [49, 25], [44, 18]]);
      hr.poly([[22, 17], [26, 22], [28, 17]]).poly([[29, 17], [33, 23], [36, 17]]).poly([[37, 17], [40, 21], [43, 17]]);
      cv.part(hr, { ramp: hair, bevel: 4, inner: 'line' });
      [[22, 10], [23, 9], [30, 6], [31, 7], [38, 7]].forEach(([x, y]) => cv.shade(x, y, -1));
    },
  },
  buzz: {
    front({ cv, m, hair, head }) {
      const hr = m().ellipse(32, 17, 14.6, 10.5).cut(m().rect(0, 18, 64, 50)).clip(head);
      hr.rect(17, 17, 3, 6).rect(44, 17, 3, 6).clip(head);
      cv.part(hr, { ramp: hair, bevel: 5, inner: 'soft', outline: false });
      for (let y = 6; y < 24; y++) for (let x = 16; x < 48; x++) if (hr.in(x, y) && (x + y) % 2 === 0) cv.shade(x, y, -1);
      cv.line(19, 18, 45, 18, (x, y) => { if (hr.in(x, y - 1)) cv.shade(x, y - 1, 1); });
    },
  },
  afro: {
    back({ cv, m, hair }) {
      const hr = m().ellipse(32, 15, 23, 15).ellipse(12, 24, 6, 9).ellipse(52, 24, 6, 9);
      cv.part(hr, { ramp: hair, bevel: 8, inner: 'line' });
      for (const [x, y] of [[14, 10], [20, 5], [27, 3], [38, 3], [45, 6], [50, 12], [10, 18], [53, 20], [18, 14], [46, 14]]) { cv.shade(x, y, -1); cv.shade(x + 1, y, -1); }
    },
    front({ cv, m, hair }) {
      const fr = m().ellipse(32, 11, 16, 8).rect(17, 11, 30, 5);
      for (let x = 18; x < 46; x += 4) fr.ellipse(x + 2, 16, 2.4, 2);
      cv.part(fr, { ramp: hair, bevel: 4, inner: 'soft' });
      for (const [x, y] of [[22, 9], [28, 7], [35, 7], [41, 9]]) cv.shade(x, y, -1);
    },
  },
  mohawk: {
    front({ cv, m, hair, head }) {
      for (let y = 9; y < 22; y++) for (let x = 17; x < 47; x++) if (head.in(x, y) && (x + y) % 2 === 0 && Math.abs(x - 32) > 4) cv.shade(x, y, 1);
      const hr = m().rect(28, 6, 9, 13);
      hr.poly([[28, 8], [26, -1], [32, 6]]).poly([[31, 6], [33, -3], [36, 6]]).poly([[35, 8], [39, 0], [37, 12]]);
      cv.part(hr, { ramp: hair, bevel: 3, inner: 'line' });
      cv.shade(30, 4, -1); cv.shade(33, 1, -1);
    },
  },
  ponytail: {
    back({ cv, m, hair }) {
      const tail = m().capsule(47, 16, 53, 36, 4, 2.6);
      cv.part(tail, { ramp: hair, bevel: 3, inner: 'line' });
      cv.line(48, 20, 52, 32, (x, y) => cv.shade(x, y, -1));
    },
    front({ cv, m, c, hair }) {
      const hr = m().ellipse(32, 15, 15.5, 9.5).rect(17, 13, 30, 5).cut(m().rect(0, 19, 64, 50));
      hr.rect(17, 17, 2, 6).rect(45, 17, 2, 6);
      cv.part(hr, { ramp: hair, bevel: 4, inner: 'line' });
      for (const x of [24, 29, 35, 40]) cv.line(x, 8, x + (x < 32 ? -2 : 2), 17, (X, Y) => cv.shade(X, Y, 1));
      cv.px(47, 16, c('white')); cv.px(48, 16, c('white')); cv.px(48, 17, c('white'));
    },
  },
  slick: {
    front({ cv, m, hair }) {
      const hr = m().ellipse(32, 14, 15.8, 10.5).rect(17, 13, 30, 6).cut(m().rect(0, 20, 64, 50));
      hr.poly([[17, 16], [16, 23], [20, 18]]).poly([[47, 16], [48, 23], [44, 18]]);
      hr.poly([[20, 12], [14, 9], [22, 6]]);
      cv.part(hr, { ramp: hair, bevel: 5, inner: 'line' });
      for (const x of [22, 27, 33, 39]) cv.line(x, 18, x + 5, 6, (X, Y) => cv.shade(X, Y, 1));
      cv.line(24, 7, 36, 5, (X, Y) => cv.shade(X, Y, -1));
    },
  },
};

Object.assign(PORTRAITS, {
  barney: barneyPortrait, barney2: barneyPortrait, kid: kidPortrait, mort: mortPortrait, gus: gusPortrait,
  rocco: roccoPortrait, gambini: gambiniPortrait, knox: knoxPortrait, brody: brodyPortrait,
  rex: rexPortrait,
  jinx: jinxPortrait,
  tess: tessPortrait,
  pockets: pocketsPortrait,
  strongman: strongmanPortrait,
  midnight: midnightPortrait,
  gemini: geminiPortrait,
  anchor: anchorPortrait,
  djdrop: djdropPortrait,
  mcbride: mcbridePortrait,
  sam: samPortrait,
  pidge: pidgePortrait,
  ray: rayPortrait,
  rusty: rustyPortrait, tia: tiaPortrait, sutures: suturesPortrait, baron: baronPortrait,
  lars: larsPortrait, hank: hankPortrait, glacier: glacierPortrait, maestro: maestroPortrait,
  bolt: boltPortrait, downpour: downpourPortrait, cole: colePortrait, avalanche: avalanchePortrait,
  rourke: rourkePortrait, ignatius: ignatiusPortrait, duchess: duchessPortrait, mirror: mirrorPortrait,
  nova: novaPortrait, goliath: goliathPortrait, quinn: quinnPortrait, monk: monkPortrait, karver: karverPortrait,
  jax: jaxPortrait,
  static: staticPortrait, cade: cadePortrait, null: nullPortrait, warden: wardenPortrait,
  hollow: hollowPortrait, revenant: rourkePortrait, frenzy: frenzyPortrait, eclipse: eclipsePortrait,
  zero: zeroPortrait, zeroTrue: zeroTruePortrait,
  ...dashPortraits,
  // the Ascension (spec §18): oro, lark, ember, aurora, ...
  oro: pantheonPortraits.oroPortrait, lark: pantheonPortraits.larkPortrait, ember: pantheonPortraits.emberPortrait, aurora: pantheonPortraits.auroraPortrait,
  zephyr: pantheonPortraits.zephyrPortrait, nimbus: pantheonPortraits.nimbusPortrait, ulla: pantheonPortraits.ullaPortrait, cirrus: pantheonPortraits.cirrusPortrait,
  tom: pantheonPortraits.tomPortrait, jules: pantheonPortraits.julesPortrait, reuben: pantheonPortraits.reubenPortrait, simone: pantheonPortraits.simonePortrait, oldguard: pantheonPortraits.oldguardPortrait,
  polaris: pantheonPortraits.polarisPortrait, kira: pantheonPortraits.kiraPortrait, orbit: pantheonPortraits.orbitPortrait, nebula: pantheonPortraits.nebulaPortrait,
  anvil: pantheonPortraits.anvilPortrait, spark: pantheonPortraits.sparkPortrait, bellows: pantheonPortraits.bellowsPortrait, hale: pantheonPortraits.halePortrait,
  reflection: pantheonPortraits.reflectionPortrait, glass: pantheonPortraits.glassPortrait, doubt: pantheonPortraits.doubtPortrait, prism: pantheonPortraits.prismPortrait,
  aldric: pantheonPortraits.aldricPortrait, valkyr: pantheonPortraits.valkyrPortrait, scribe: pantheonPortraits.scribePortrait, verity: pantheonPortraits.verityPortrait, rho: pantheonPortraits.rhoPortrait,
  halcyon: pantheonPortraits.halcyonPortrait,
  // the Underworld (spec §18): grue, mae, toll, moros, ...
  grue: underworldPortraits.gruePortrait, mae: underworldPortraits.maePortrait, toll: underworldPortraits.tollPortrait, moros: underworldPortraits.morosPortrait,
  cinder: underworldPortraits.cinderPortrait, scorch: underworldPortraits.scorchPortrait, kiln: underworldPortraits.kilnPortrait, soot: underworldPortraits.sootPortrait,
  shackle: underworldPortraits.shacklePortrait, link: underworldPortraits.linkPortrait, brisk: underworldPortraits.briskPortrait, rattle: underworldPortraits.rattlePortrait, jailer: underworldPortraits.jailerPortrait,
  // Phase D: the Hall of the Fallen wears the champions' own portraits (the new palettes recolour them), then the Furnace, the Abyss Gate and Vorgath
  fbrody: brodyPortrait, fmidnight: midnightPortrait, fvale: maestroPortrait, fkarver: karverPortrait,
  stoker: abyssPortraits.stokerPortrait, brand: abyssPortraits.brandPortrait, slag: abyssPortraits.slagPortrait, crucible: abyssPortraits.cruciblePortrait,
  nox: abyssPortraits.noxPortrait, umbra: abyssPortraits.umbraPortrait, lament: abyssPortraits.lamentPortrait, grasp: abyssPortraits.graspPortrait, herald: abyssPortraits.heraldPortrait,
  vorgath: abyssPortraits.vorgathPortrait,
  ...voidPortraits,
});
