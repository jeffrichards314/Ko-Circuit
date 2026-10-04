// Intro-card portraits: Dash Maddox, the rival, one per stage (§11b). The same
// face every time; what he wears around his shoulders is the upgrade:
//   I    bare shoulders, a towel slung over one side
//   II   a teal hoodie, hood down, a sponsor patch
//   III  the hoodie with gold trim and the gold chain
//   IV   the walk-in robe: teal and gold, a high collar, the DM crest
//   V    the robe with gold shoulders, and a gold laurel across the brow (Dash Ascendant)
//   VIII the King's Champion: a black breastplate with a red crown on it, a black circlet with a ruby
import { setup, mirror, bust, earsP, headP, eyesP, browsP, noseP } from './kit.js';

function dashPortrait(pal, stage) {
  const k = setup(pal), { cv, m, c, r } = k;
  const skin = r('skinHi', 'skin', 'skinSh', 'skinDk');
  const hair = r('hairHi', 'hair', 'hairDk', 'outline');
  const teal = r('tealHi', 'teal', 'tealDk', 'outline');
  const gold = r('gold', 'gold', 'goldDk', 'outline');
  if (stage === 1) {
    bust(k, skin, skin, { neck: 8, top: 46, slope: 11 });
    // the towel over the viewer-left shoulder
    cv.part(m().poly([[2, 60], [4, 50], [16, 45], [24, 46], [20, 60]]), { ramp: r('trim', 'trim', 'trimSh', 'outline'), bevel: 3, inner: 'line' });
    for (let y = 50; y < 60; y += 3) cv.line(6, y + 2, 18, y, (X, Y) => cv.px(X, Y, c('trimSh')));
    for (const s of [1, -1]) cv.line(s > 0 ? 26 : 38, 54, s > 0 ? 30 : 34, 57, (X, Y) => cv.shade(X, Y, 1));
  } else if (stage === 7) {
    // in chains: the robe torn to a rag of dulled teal, an iron collar with a red link, a chain running off the frame
    bust(k, teal, skin, { neck: 8, top: 45, slope: 13 });
    cv.part(m().poly([[8, 60], [14, 44], [22, 42], [24, 60]]).poly([[56, 60], [50, 44], [42, 42], [40, 60]]), { ramp: teal, bevel: 3, inner: 'line' });
    for (const [x, y] of [[10, 58], [12, 55], [52, 57], [54, 54]]) cv.px(x, y, c('outline'));
    cv.part(m().ellipse(32, 45, 10.5, 3.4).cut(m().ellipse(32, 43.4, 7.4, 2.4)), { ramp: gold, bevel: 1, inner: 'line', shadow: false });
    cv.part(m().ellipse(32, 53, 2.2, 3), { ramp: gold, bevel: 1, inner: 'line', shadow: false });
    cv.px(32, 53, c('halo')); cv.px(32, 52, c('halo'));
    for (let y = 56; y < 60; y += 2) { cv.px(32, y, c('gold')); cv.px(33, y + 1, c('goldDk')); }
  } else if (stage === 8) {
    // the King's Champion: a black iron gorget and breastplate, the King's crown in red on it, a thin red line at the throat
    bust(k, gold, skin, { neck: 8, top: 44, slope: 14 });
    cv.part(m().poly([[6, 60], [12, 44], [22, 40], [26, 60]]).poly([[58, 60], [52, 44], [42, 40], [38, 60]]), { ramp: gold, bevel: 3, inner: 'line' });
    for (const [x, y] of [[29, 52], [29, 51], [29, 50], [31, 51], [33, 50], [33, 51], [32, 49], [32, 50], [32, 51], [35, 50], [35, 51], [37, 51], [39, 50], [39, 51], [39, 52]]) cv.px(x, y, c('halo'));
    for (let x = 28; x <= 40; x++) cv.px(x, 55, c('halo'));
    for (let x = 24; x <= 40; x++) cv.px(x, 44 + Math.round(((x - 32) / 8) ** 2 * 2), c('halo'));
  } else if (stage >= 4) {
    // the robe: a high teal collar with gold edges, open at the throat
    bust(k, teal, skin, { neck: 8, top: 44, slope: 13 });
    cv.part(m().poly([[8, 60], [14, 42], [24, 38], [28, 60]]).poly([[56, 60], [50, 42], [40, 38], [36, 60]]), { ramp: teal, bevel: 3, inner: 'line' });
    for (const s of [1, -1]) cv.line(s > 0 ? 24 : 40, 38, s > 0 ? 28 : 36, 60, (X, Y) => { cv.px(X, Y, c('gold')); cv.px(X + s, Y, c('goldDk')); });
    cv.part(m().poly([[44, 50], [52, 50], [52, 54], [48, 58], [44, 54]]), { ramp: gold, bevel: 1, inner: 'line', shadow: false });
    for (const [x, y] of [[46, 52], [46, 53], [46, 54], [47, 52], [47, 55], [49, 52], [49, 53], [50, 54]]) cv.px(x, y, c('tealDk'));
  } else {
    // the hoodie, hood down behind the neck
    bust(k, teal, skin, { neck: 8, top: 45, slope: 12 });
    cv.part(m().ellipse(32, 45, 17, 5).cut(m().ellipse(32, 44, 9, 4)), { ramp: teal, bevel: 2, inner: 'line' });
    for (const x of [27, 37]) cv.line(x, 48, x + (x < 32 ? -1 : 1), 57, (X, Y) => cv.px(X, Y, c(stage === 3 ? 'gold' : 'trim')));
    cv.part(m().rect(8, 52, 7, 5), { ramp: r('patch', 'patch', 'patchDk', 'outline'), bevel: 1, inner: 'line', shadow: false });
    cv.px(10, 54, c('white')); cv.px(12, 55, c('white'));
    if (stage === 3) {
      for (let x = 22; x <= 42; x++) { const y = 44 + Math.round(((x - 32) / 10) ** 2 * -4 + 6); cv.px(x, y, c(x & 1 ? 'goldDk' : 'gold')); }
      cv.part(m().ellipse(32, 51, 2, 2.5), { ramp: gold, bevel: 1, inner: 'line', shadow: false });
    }
  }
  earsP(k, skin, 18, 30, 2.6, 4);
  const hm = headP(k, skin, { rx: 13.5, ry: 16, cy: 27, jawY: 34, jawRx: 11, jawRy: 10.5 });
  // fauxhawk: a close crop, faded sides, the crest swept up and over
  cv.part(m().ellipse(32, 15, 13, 7).cut(m().rect(0, 17, 64, 40)), { ramp: hair, bevel: 2, inner: 'line' });
  for (let y = 17; y < 23; y++) for (const x of [19, 20, 21, 43, 44, 45]) if (hm.in(x, y) && (x + y) & 1) cv.px(x, y, c('hair'));
  cv.part(m().poly([[26, 12], [29, 4], [35, 1], [44, 3], [49, 8], [42, 9], [38, 14]]), { ramp: hair, bevel: 2, inner: 'line' });
  for (const [x, y] of [[31, 5], [34, 3], [37, 3], [40, 4], [43, 5]]) cv.px(x, y, c('hairHi'));
  for (const [x, y] of [[38, 15], [39, 16], [40, 16], [41, 17]]) cv.px(x, y, c('hair'));
  if (stage >= 5 && stage < 7) {
    // the laurel: a curve of gold leaves under the crest, and a gold epaulette on each shoulder
    for (let x = 19; x <= 45; x += 2) { const y = 17 - Math.round(Math.sin((x - 19) / 26 * Math.PI) * 3) + 3; cv.part(m().ellipse(x, y, 2, 1.3), { ramp: gold, bevel: 1, inner: 'line', shadow: false }); cv.px(x, y - 1, c('halo')); }
    for (const s of [1, -1]) if (stage < 6 || s < 0) cv.part(m().rect(s > 0 ? 3 : 53, 56, 8, 4), { ramp: gold, bevel: 1, inner: 'line', shadow: false });
  }
  if (stage === 7) {
    // a dead laurel, half the leaves gone, and the bruises of every fight he's lost
    for (let x = 19; x <= 45; x += 4) { const y = 17 - Math.round(Math.sin((x - 19) / 26 * Math.PI) * 3) + 3; cv.part(m().ellipse(x, y, 2, 1.3), { ramp: gold, bevel: 1, inner: 'line', shadow: false }); }
    for (const [x, y] of [[21, 33], [22, 34], [44, 27], [43, 28], [27, 39]]) cv.shade(x, y, 2);
    for (const x of [22, 23, 24, 25, 26, 38, 39, 40, 41, 42]) cv.shade(x, 31, 1);
  }
  if (stage === 8) {
    // the circlet: a band of black iron across the brow with a ruby in it, two spikes; bruises
    cv.part(m().rect(19, 12, 26, 4), { ramp: gold, bevel: 1, inner: 'line', shadow: false });
    for (const x of [24, 40]) cv.part(m().poly([[x - 3, 12], [x, 5], [x + 3, 12]]), { ramp: gold, bevel: 1, inner: 'line', shadow: false });
    cv.part(m().ellipse(32, 13, 2.6, 2.4), { ramp: r('halo', 'halo', 'goldDk', 'outline'), bevel: 1, inner: 'line', shadow: false });
    for (const [x, y] of [[21, 33], [22, 34], [44, 27], [43, 28], [27, 39]]) cv.shade(x, y, 2);
  }
  if (stage === 6) {
    // desperate: sweat, dark rings under the eyes, a broken halo edge above the laurel
    for (const [x, y] of [[19, 22], [18, 26], [45, 24], [46, 28], [22, 36]]) { cv.px(x, y, c('skinHi')); cv.px(x, y + 1, c('white')); }
    for (const x of [22, 23, 24, 25, 26, 38, 39, 40, 41, 42]) cv.shade(x, 31, 1);
  }
  eyesP(k, { y: 27, x0: 22, x1: 28, style: 'narrow' });
  // brows: the viewer-right one arched up (he's never impressed)
  cv.part(m().capsule(21, 23, 28, 23.5, 1.4, 1.2).capsule(mirror(21), 20.5, mirror(28), 22, 1.4, 1.2), { ramp: hair, bevel: 1, inner: 'soft' });
  noseP(k, skin, { y: 33, rx: 3, ry: 2.8 });
  // the smirk
  for (let x = 27; x <= 35; x++) cv.px(x, 41 - (x >= 34 ? x - 33 : 0), c('outline'));
  cv.px(36, 38, c('outline')); cv.shade(36, 40, 1);
  cv.shade(20, 33, 1); cv.shade(43, 33, 1);
  return cv.toSprite(0, 0, false);
}

export const dashPortraits = {
  dash1: (pal) => dashPortrait(pal, 1), dash2: (pal) => dashPortrait(pal, 2),
  dash3: (pal) => dashPortrait(pal, 3), dash4: (pal) => dashPortrait(pal, 4), dash5: (pal) => dashPortrait(pal, 5), dash6: (pal) => dashPortrait(pal, 6), dash7: (pal) => dashPortrait(pal, 7), dash8: (pal) => dashPortrait(pal, 8), dash9: (pal) => dashPortrait(pal, 8),
};
