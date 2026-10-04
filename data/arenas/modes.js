// The two arenas of the post-game modes (spec §6, §2b). They replace the opponents' own arenas in Title Defense and in the Gauntlet:
//
//   THE CHAMPIONSHIP HALL (Title Defense): a grand hall, full to the rafters. The champion's belts hang in lit glass cases over the far stands,
//     title banners hang between them, the truss lamps chase, and the entrance is a curtained archway with a spotlight that sweeps the
//     ring. A packed crowd (camera flashes everywhere, more on every knockdown).
//   THE ENDURANCE ARENA (Gauntlet): a gritty concrete pit behind a chain-link fence. A big tally board hangs over the far wall and counts the
//     fight (FIGHT 12 OF 52) with a tick for every win; the crowd behind the fence is thin on the first fight and grows with every win (more
//     people, louder, more of them on their feet); the floodlights flicker, and the harder the run the harder they flicker.
//
// Each comes in five versions, one per division (data/divisions.js), that change the banners, the palette, the crowd and the little things
// that belong to their zone: CLASSIC (reds, blues, gold), PANTHEON (white marble, gold and light), UNDERWORLD (ash and ember), VOID (black and
// white, glitching), COMBINED (all four mixed, a quarter of the room each).
//
//   tdArena(division)                  -> the arena definition (src/engine/arena.js)
//   gauntletArena(division, wins, of)  -> the same, for the fight after `wins` wins of a run of `of` fights
//   modeArena(mode, division, run)     -> either, for a run ({ idx, list }) in progress
import { makePalette } from '../../src/engine/palette.js';
import { textWidth } from '../../src/engine/font.js';

// ---------------------------------------------------------------------------------------------------------------- the styles
// house: the 15 colours of the walls and props. ropes / post / pad / canvas: the ring. crowd: skins, hairs and shirts.
// banners: [fabric, trim, emblem] colour keys of the house palette, cycled over the banners; emblem: 'crown' | 'wings' | 'skull' | 'ring' | 'star'
const SKINS = { skin1: [28, 21, 15], skin1s: [19, 12, 9], skin2: [20, 12, 8], skin2s: [12, 7, 5], skin3: [12, 7, 5], skin3s: [7, 4, 3] };
const STYLES = {
  classic: {
    name: 'CLASSIC',
    house: { dark: [1, 1, 4], darkHi: [4, 4, 10], tier: [3, 3, 8], truss: [9, 9, 13], lampOff: [12, 11, 9], lampOn: [31, 30, 22], caseHi: [18, 22, 28], case: [7, 9, 14], plateHi: [31, 30, 18], plate: [29, 22, 5], plateSh: [19, 12, 2], gem: [28, 3, 8], banA: [22, 4, 6], banB: [31, 26, 6], banC: [31, 31, 28] },
    banners: [['banA', 'banB', 'banC']], emblem: 'crown',
    crowd: { ...SKINS, outline: [1, 1, 3], hairA: [3, 3, 3], hairB: [22, 16, 6], hairC: [17, 6, 3], shirtR: [22, 4, 6], shirtY: [26, 23, 6], shirtG: [26, 26, 28], shirtB: [5, 8, 22], shirtSh: [2, 2, 5] },
    ring: { ropeA: [28, 4, 6], ropeB: [31, 31, 31], ropeC: [5, 10, 29], post: [26, 19, 5], pad: [24, 3, 6], apron: [3, 3, 6], apronHi: [29, 23, 6] },
    floor: { canvas: [5, 5, 8], logo: [27, 21, 5], spot: [12, 12, 15] },
    wall: { a: [9, 9, 12], b: [5, 5, 8], c: [14, 14, 17], light: [31, 30, 20] },
  },
  pantheon: {
    name: 'PANTHEON',
    house: { dark: [13, 14, 20], darkHi: [20, 21, 27], tier: [17, 18, 24], truss: [29, 27, 22], lampOff: [28, 26, 18], lampOn: [31, 31, 28], caseHi: [31, 31, 31], case: [22, 24, 30], plateHi: [31, 31, 24], plate: [31, 26, 8], plateSh: [22, 16, 3], gem: [10, 20, 31], banA: [31, 31, 30], banB: [31, 25, 5], banC: [20, 24, 31] },
    banners: [['banA', 'banB', 'banC']], emblem: 'wings',
    crowd: { ...SKINS, outline: [6, 6, 12], hairA: [4, 4, 5], hairB: [24, 22, 14], hairC: [30, 30, 30], shirtR: [31, 31, 30], shirtY: [31, 26, 8], shirtG: [26, 28, 31], shirtB: [18, 22, 31], shirtSh: [14, 15, 22] },
    ring: { ropeA: [31, 26, 8], ropeB: [31, 31, 31], ropeC: [20, 24, 31], post: [31, 28, 12], pad: [31, 29, 20], apron: [20, 21, 27], apronHi: [31, 26, 6] },
    floor: { canvas: [24, 25, 30], logo: [31, 24, 5], spot: [31, 31, 28] },
    wall: { a: [24, 25, 30], b: [18, 19, 25], c: [30, 30, 31], light: [31, 31, 26] },
  },
  underworld: {
    name: 'UNDERWORLD',
    house: { dark: [2, 1, 1], darkHi: [7, 3, 2], tier: [4, 2, 2], truss: [10, 6, 5], lampOff: [14, 5, 2], lampOn: [31, 20, 5], caseHi: [18, 10, 6], case: [6, 3, 3], plateHi: [26, 14, 6], plate: [18, 8, 4], plateSh: [9, 4, 2], gem: [31, 10, 3], banA: [10, 3, 4], banB: [24, 10, 4], banC: [31, 22, 8] },
    banners: [['banA', 'banB', 'banC']], emblem: 'skull',
    crowd: { ...SKINS, outline: [1, 0, 0], hairA: [2, 2, 2], hairB: [10, 8, 7], hairC: [16, 12, 9], shirtR: [14, 4, 3], shirtY: [20, 9, 3], shirtG: [11, 10, 10], shirtB: [8, 6, 9], shirtSh: [3, 1, 1] },
    ring: { ropeA: [24, 8, 3], ropeB: [20, 18, 16], ropeC: [12, 4, 3], post: [14, 8, 6], pad: [18, 5, 3], apron: [3, 1, 1], apronHi: [26, 12, 4] },
    floor: { canvas: [8, 5, 5], logo: [24, 9, 3], spot: [14, 7, 4] },
    wall: { a: [9, 5, 5], b: [4, 2, 2], c: [16, 8, 6], light: [31, 20, 6] },
  },
  void: {
    name: 'VOID',
    house: { dark: [0, 0, 1], darkHi: [4, 4, 7], tier: [2, 2, 4], truss: [14, 14, 17], lampOff: [8, 8, 11], lampOn: [31, 31, 31], caseHi: [22, 22, 26], case: [3, 3, 6], plateHi: [31, 31, 31], plate: [24, 24, 27], plateSh: [10, 10, 13], gem: [31, 31, 31], banA: [1, 1, 3], banB: [31, 31, 31], banC: [14, 14, 18] },
    banners: [['banA', 'banB', 'banC']], emblem: 'ring',
    crowd: { ...Object.fromEntries(Object.entries(SKINS).map(([k, v]) => [k, v.map((x) => Math.round(x * 0.55))])), outline: [0, 0, 1], hairA: [1, 1, 2], hairB: [9, 9, 12], hairC: [22, 22, 26], shirtR: [20, 20, 24], shirtY: [12, 12, 16], shirtG: [28, 28, 31], shirtB: [6, 6, 10], shirtSh: [2, 2, 4] },
    ring: { ropeA: [31, 31, 31], ropeB: [18, 18, 22], ropeC: [31, 31, 31], post: [26, 26, 30], pad: [31, 31, 31], apron: [1, 1, 3], apronHi: [31, 31, 31] },
    floor: { canvas: [2, 2, 4], logo: [31, 31, 31], spot: [10, 10, 14] },
    wall: { a: [6, 6, 9], b: [2, 2, 4], c: [12, 12, 16], light: [31, 31, 31] },
  },
  combined: {
    name: 'COMBINED',
    house: { dark: [2, 2, 5], darkHi: [6, 6, 11], tier: [3, 3, 7], truss: [10, 10, 14], lampOff: [12, 11, 9], lampOn: [31, 30, 22], caseHi: [18, 20, 26], case: [6, 6, 11], plate: [29, 22, 5], plateSh: [14, 9, 2], banA: [22, 4, 6], banB: [31, 26, 6], banC: [31, 31, 30], gem: [10, 3, 3], plateHi: [31, 20, 5] },
    banners: [['banA', 'banB', 'banC'], ['banC', 'banB', 'plateHi'], ['gem', 'plateHi', 'banC'], ['dark', 'banC', 'darkHi']], emblem: 'mixed',
    crowd: { ...SKINS, outline: [1, 1, 3], hairA: [3, 3, 3], hairB: [22, 16, 6], hairC: [26, 26, 28], shirtR: [22, 4, 6], shirtY: [26, 23, 6], shirtG: [26, 26, 28], shirtB: [5, 8, 22], shirtSh: [2, 2, 5] },
    ring: { ropeA: [28, 4, 6], ropeB: [31, 31, 31], ropeC: [31, 26, 8], post: [26, 19, 5], pad: [24, 3, 6], apron: [3, 3, 6], apronHi: [29, 23, 6] },
    floor: { canvas: [5, 5, 8], logo: [27, 21, 5], spot: [12, 12, 15] },
    wall: { a: [9, 9, 12], b: [5, 5, 8], c: [14, 14, 17], light: [31, 30, 20] },
  },
};
export const ARENA_STYLES = Object.keys(STYLES);

// ---------------------------------------------------------------------------------------------------------------- shared pieces
const key = (S, tag) => `${tag}.${S.name.toLowerCase()}`;
function palettes(S, tag, houseSpec = S.house, extraRing = {}) {
  const r = S.ring, f = S.floor, c = S.crowd;
  const house = makePalette(key(S, `${tag}.house`), houseSpec);
  const crowd = makePalette(key(S, `${tag}.crowd`), c);
  const ring = makePalette(key(S, `${tag}.ring`), {
    ropeA: r.ropeA, ropeAs: r.ropeA.map((x) => x >> 1), ropeB: r.ropeB, ropeBs: r.ropeB.map((x) => x >> 1), ropeC: r.ropeC, ropeCs: r.ropeC.map((x) => x >> 1),
    postHi: r.post.map((x) => Math.min(31, x + 5)), post: r.post, postDk: r.post.map((x) => x >> 1), pad: r.pad, padS: r.pad.map((x) => x >> 1),
    apron: r.apron, apronHi: r.apronHi, flash: [31, 31, 31], ...extraRing,
  });
  const floor = makePalette(key(S, `${tag}.canvas`), {
    canvasHi: f.canvas.map((x) => Math.min(31, x + 4)), canvas: f.canvas, canvasSh: f.canvas.map((x) => Math.max(0, x - 2)), canvasDk: f.canvas.map((x) => x >> 1),
    logo: f.logo, logoSh: f.logo.map((x) => x >> 1), shadow: f.canvas.map((x) => x >> 2), spotHi: f.spot,
  });
  return [house, crowd, ring, floor];
}
const RING = {
  canvas: ['canvasHi', 'canvas', 'canvasSh', 'canvasDk'],
  ropes: ['ropeA', 'ropeB', 'ropeC'],
  turnbuckles: ['pad', 'pad'],
  pads: ['pad', 'pad'],
};
const CROWD_STYLE = {
  skins: [['skin1', 'skin1s'], ['skin2', 'skin2s'], ['skin3', 'skin3s']],
  hairs: ['hairA', 'hairB', 'hairC', 'hairA'],
  shirts: [['shirtR', 'shirtSh'], ['shirtY', 'shirtSh'], ['shirtG', 'shirtSh'], ['shirtB', 'shirtSh']],
  outline: 'outline',
};
// the ring itself: apron, canvas, a pool of light, the logo, ropes and padded posts (as the Dream's)
function paintRingOf(p, { left, right, logo, logoY = 186 }) {
  p.rect(0, 88, 256, 4, 'apron');
  p.text(left, 8, 88, 'apronHi', { mono: false });
  p.text(right, 248 - textWidth(right, false), 88, 'apronHi', { mono: false });
  p.hline(0, 255, 88, 'canvasDk');
  p.rect(0, 92, 256, 132, 'canvas');
  p.rect(0, 92, 256, 2, 'canvasHi');
  p.dither(0, 94, 256, 14, 'canvasHi', 0.2);
  p.dither(40, 130, 176, 80, 'spotHi', 0.25, (i, j) => ((i - 128) / 88) ** 2 + ((j - 170) / 40) ** 2 < 1);
  const cx = 128;
  logo(p, cx, logoY);
  const ropes = [[62, 'ropeA', 'ropeAs'], [70, 'ropeB', 'ropeBs'], [78, 'ropeC', 'ropeCs']];
  for (const [yy, a, b] of ropes) { p.hline(16, 239, yy, a); p.hline(16, 239, yy + 1, b); }
  for (const [yy, a, b] of ropes) {
    p.line(12, yy, -10, yy + 38, a); p.line(12, yy + 1, -10, yy + 39, b);
    p.line(243, yy, 266, yy + 38, a); p.line(243, yy + 1, 266, yy + 39, b);
  }
  for (const x of [8, 241]) {
    p.rect(x, 50, 7, 44, 'postDk'); p.rect(x + 1, 50, 5, 44, 'post'); p.vline(x + 2, 51, 92, 'postHi');
    p.rect(x - 1, 57, 9, 27, 'padS'); p.rect(x, 58, 7, 25, 'pad');
    for (const [yy] of ropes) p.hline(x, x + 6, yy + 2, 'padS');
    p.rect(x - 1, 92, 9, 3, 'postDk');
  }
}
const crownLogo = (p, cx, cy) => {
  p.rect(cx - 16, cy - 2, 33, 7, 'logo');
  for (const dx of [-14, -7, 0, 7, 14]) p.poly([[cx + dx - 3, cy - 2], [cx + dx, cy - 9 - (dx === 0 ? 3 : 0)], [cx + dx + 3, cy - 2]], 'logo');
  p.hline(cx - 16, cx + 16, cy + 4, 'logoSh');
};
const skullLogo = (p, cx, cy) => {
  p.ellipse(cx, cy - 4, 11, 9, 'logo'); p.rect(cx - 6, cy + 2, 13, 7, 'logo');
  p.ellipse(cx - 4, cy - 4, 2.5, 3, 'canvasDk'); p.ellipse(cx + 4, cy - 4, 2.5, 3, 'canvasDk'); p.rect(cx - 1, cy, 3, 3, 'canvasDk');
  for (let i = -4; i <= 4; i += 2) p.vline(cx + i, cy + 4, cy + 8, 'canvasDk');
};
const ringLogo = (p, cx, cy) => { p.ellipse(cx, cy - 2, 16, 8, 'logo', false); p.ellipse(cx, cy - 2, 9, 4, 'logo', false); p.rect(cx - 1, cy - 3, 3, 3, 'logo'); };
const wingsLogo = (p, cx, cy) => {
  for (let i = 0; i < 7; i++) { p.rect(cx - 8 - i * 3, cy - 6 + i, 3 + (i >> 1), 2, 'logo'); p.rect(cx + 6 + i * 3 - (i >> 1), cy - 6 + i, 3 + (i >> 1), 2, 'logo'); }
  p.rect(cx - 3, cy - 8, 7, 12, 'logo'); p.rect(cx - 1, cy - 10, 3, 3, 'logo');
};
const LOGOS = { crown: crownLogo, skull: skullLogo, ring: ringLogo, wings: wingsLogo, star: crownLogo, mixed: crownLogo };

// a title banner hung from the truss: fabric with a trim and an emblem (the emblem of the division)
function banner(p, x, y, w, h, [fab, trim, mark], emblem) {
  p.rect(x - 1, y - 3, w + 2, 2, 'truss');
  p.rect(x, y, w, h, fab);
  p.poly([[x, y + h], [x + w, y + h], [x + w / 2, y + h + 6]], fab);
  p.rect(x, y, w, 2, trim); p.rect(x, y, 1, h, trim); p.rect(x + w - 1, y, 1, h, trim);
  const cx = x + (w >> 1), cy = y + (h >> 1);
  switch (emblem) {
    case 'wings': for (let i = 0; i < 3; i++) { p.rect(cx - 6 + i, cy - 2 + i, 3, 1, mark); p.rect(cx + 4 - i, cy - 2 + i, 3, 1, mark); } p.rect(cx - 1, cy - 1, 3, 5, trim); break;
    case 'skull': p.ellipse(cx, cy - 1, 4, 4, mark); p.rect(cx - 2, cy + 2, 5, 3, mark); p.px(cx - 2, cy - 1, fab); p.px(cx + 2, cy - 1, fab); break;
    case 'ring': p.ellipse(cx, cy, 5, 5, mark, false); p.px(cx, cy, mark); break;
    case 'star': p.rect(cx - 4, cy, 9, 1, mark); p.rect(cx, cy - 4, 1, 9, mark); p.rect(cx - 2, cy - 2, 5, 5, mark); break;
    default: p.rect(cx - 5, cy + 1, 11, 3, mark); for (const dx of [-5, -1, 3]) p.rect(cx + dx, cy - 2, 3, 3, mark); // a crown
  }
}
// a belt in a lit glass case: the strap, the big centre plate, the two side plates and a gem
function beltCase(p, x, y, w = 36) {
  p.rect(x - w / 2, y - 11, w, 22, 'case'); p.rect(x - w / 2, y - 11, w, 1, 'caseHi'); p.rect(x - w / 2, y - 11, 1, 22, 'caseHi');
  p.ellipse(x, y, w / 2 - 3, 5, 'plateSh'); p.hline(x - w / 2 + 3, x + w / 2 - 3, y - 3, 'caseHi');
  for (const dx of [-w / 3, w / 3]) { p.ellipse(x + dx, y, 4, 4, 'plateSh'); p.ellipse(x + dx, y - 1, 3.4, 3.4, 'plate'); }
  p.ellipse(x, y, 8, 7, 'plateSh'); p.ellipse(x, y - 1, 7.4, 6.4, 'plate'); p.ellipse(x, y - 1, 5, 4, 'plateHi', false);
  p.ellipse(x, y - 4, 1.5, 1.4, 'gem');
}

// ---------------------------------------------------------------------------------------------------------------- THE CHAMPIONSHIP HALL (Title Defense)
export function tdArena(division) {
  const S = STYLES[division] || STYLES.classic, id = `td.${division}`;
  const mixed = division === 'combined', bannerSet = S.banners;
  const emblemAt = (i) => (mixed ? ['crown', 'wings', 'skull', 'ring'][i % 4] : S.emblem);
  return {
    id, name: mixed ? 'THE GRAND HALL' : `THE ${S.name} HALL`, circuit: null, music: `tdFight${division[0].toUpperCase()}${division.slice(1)}`,
    palettes: palettes(S, 'td'),
    ring: RING,
    shadowColor: 'shadow',
    crowd: { style: 'sellout', density: 1, excitable: 0.97, seed: 11, rows: [{ y: 58, x0: 4, x1: 252, spacing: 9 }, { y: 68, x0: 8, x1: 248, spacing: 9 }, { y: 78, x0: 4, x1: 252, spacing: 10 }, { y: 88, x0: 8, x1: 248, spacing: 10 }], ...CROWD_STYLE },
    paintBack(p) {
      p.rect(0, 0, 256, 92, 'dark');
      // the upper deck: rows of dim faces climbing into the dark
      for (let y = 18; y < 50; y++) p.hline(0, 255, y, (y >> 2) & 1 ? 'tier' : 'dark');
      for (let y = 20; y < 48; y += 3) for (let x = (y * 5) % 4; x < 256; x += 4) p.px(x, y, 'darkHi');
      // the truss with its lamps and the light beams down from it
      p.rect(0, 4, 256, 3, 'truss');
      for (let x = 0; x < 256; x += 6) p.line(x, 4, x + 3, 6, 'dark');
      for (let x = 6; x < 256; x += 16) p.rect(x, 7, 5, 3, 'lampOff');
      for (const x of [40, 216]) for (let y = 10; y < 50; y++) { const w = (y - 10) * 0.3; p.dither(Math.round(x - w), y, Math.round(w * 2) + 1, 1, 'lampOn', 0.1); }
      // the division's own scenery: marble pillars (Pantheon), cracks and a glow along the floor (Underworld)
      if (division === 'pantheon') for (const x of [3, 245]) { p.rect(x, 10, 8, 80, 'caseHi'); p.rect(x + 1, 10, 2, 80, 'case'); p.rect(x - 2, 10, 12, 4, 'plate'); p.rect(x - 2, 84, 12, 4, 'plate'); }
      if (division === 'underworld') { for (let i = 0; i < 9; i++) { const x = 20 + i * 27; p.line(x, 10, x + 6, 44 + (i % 3) * 6, 'darkHi'); p.line(x + 6, 44 + (i % 3) * 6, x + 2, 70, 'darkHi'); } p.dither(0, 70, 256, 22, 'lampOff', 0.2); }
      // the belts on display: five lit cases hung over the far stands, and between them the title banners
      const xs = [28, 78, 128, 178, 228];
      xs.forEach((x, i) => { p.vline(x - 14, 7, 18, 'truss'); p.vline(x + 14, 7, 18, 'truss'); beltCase(p, x, 30); void i; });
      [53, 103, 153, 203].forEach((x, i) => banner(p, x - 7, 8, 14, 24, bannerSet[i % bannerSet.length], emblemAt(i)));
      // the entrance: a curtained archway over the aisle, dark behind it, and the spotlight's pool on the canvas below
      p.rect(108, 40, 40, 30, 'dark'); p.poly([[108, 48], [128, 36], [148, 48]], 'dark');
      p.rect(104, 38, 5, 34, bannerSet[0][0]); p.rect(147, 38, 5, 34, bannerSet[0][0]); p.rect(104, 38, 48, 3, bannerSet[0][1]);
      for (let y = 42; y < 70; y += 4) { p.hline(104, 108, y, bannerSet[0][1]); p.hline(147, 151, y, bannerSet[0][1]); }
      p.text(mixed ? 'ALL TITLES' : `${S.name} TITLE`, 128 - Math.round((mixed ? 10 : S.name.length + 6) * 2.4), 76, 'plate', { mono: false });
    },
    paintRing(p) {
      const sign = mixed ? 'ALL DIVISIONS' : `${S.name} DIVISION`;
      paintRingOf(p, { left: 'TITLE DEFENSE', right: sign, logo: LOGOS[S.emblem] });
    },
    paletteAnim(t, live, pal, state) {
      const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
      if ((t >> 3) & 1) set('lampOff', 'lampOn');
      if (state.flash > 0) { state.flash--; if ((state.flash >> 1) & 1) { set('dark', 'darkHi'); set('tier', 'darkHi'); set('canvas', 'canvasHi'); } }
      // the underworld's cases glow like coals; the void's banners drop out for a moment now and then
      if (division === 'underworld' && ((t >> 4) & 3) === 0) set('plate', 'plateHi');
      if (division === 'void' && ((t * 7 + (t >> 5) * 13) % 97) < 3) { set('banB', 'banA'); set('plate', 'plateSh'); }
    },
    onReaction(kind, state) {
      if (kind === 'knockdown' || kind === 'ko') { state.flash = 24; state.frenzy = 150; }
      if (kind === 'star') state.frenzy = Math.max(state.frenzy || 0, 70);
    },
    overlay(frame, arena, t, state) {
      const col = (k) => arena.live[arena.pal.idx(k)];
      // the entrance spotlight: a beam that sweeps the ring from the archway
      const sw = Math.sin(t / 47) * 70, tip = [128, 40];
      for (let y = 42; y < 150; y += 1) {
        const w = (y - 40) * 0.18, cx = 128 + sw * ((y - 40) / 110);
        for (let x = Math.round(cx - w); x <= Math.round(cx + w); x++) if (((x + y * 3) & 7) === 0) frame.px(x, y, col('lampOn'));
      }
      void tip;
      // the glint running over the middle belt's plate, as in the Dream
      const g = (t % 150) - 20;
      if (g >= 0 && g < 24) for (let k = -6; k <= 6; k++) { const X = 128 - 11 + g + Math.round(k * 0.35), Y = 30 + k - 1; if (((X - 128) / 11) ** 2 + ((Y - 29) / 7) ** 2 <= 1) frame.px(X, Y, col('flash')); }
      // camera flashes everywhere, a frenzy of them after the big moments
      if (state.frenzy > 0) state.frenzy--;
      const n = state.frenzy > 0 ? 12 : 5;
      for (let i = 0; i < n; i++) {
        const seed = ((t >> 2) * 131 + i * 977) % 4099;
        if (((t + i * 7) & 3) > 1) continue;
        const fx = (seed * 37) % 252 + 2, fy = 16 + (seed % 72);
        frame.rect(fx, fy, 2, 2, col('flash'));
        if (((t + i) & 7) === 0) { frame.px(fx - 1, fy, col('lampOn')); frame.px(fx + 2, fy + 1, col('lampOn')); }
      }
      // the underworld's embers rise from the floor; the void tears a strip of the hall sideways now and then
      if (division === 'underworld') for (let i = 0; i < 10; i++) { const x = (i * 53 + (t >> 1) * (1 + (i % 3))) % 256, y = 90 - ((t + i * 17) % 60); frame.px(x, y, col('lampOn')); }
      if (division === 'void' && ((t >> 2) % 23) === 0) { const y = 8 + ((t * 5) % 70); frame.rect(((t * 3) % 40) - 20, y, 276, 2, col('caseHi')); }
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------- THE ENDURANCE ARENA (Gauntlet)
const DIGITS = { 0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'], 2: ['111', '001', '111', '100', '111'], 3: ['111', '001', '111', '001', '111'], 4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '111', '001', '111'], 6: ['111', '100', '111', '101', '111'], 7: ['111', '001', '010', '010', '010'], 8: ['111', '101', '111', '101', '111'], 9: ['111', '101', '111', '001', '111'] };
function bigNumber(p, n, x, y, k, s = 2) { // (the tally board's digits, each pixel of a 3x5 font s pixels square)
  let X = x;
  for (const ch of String(n)) { DIGITS[ch].forEach((row, j) => { for (let i = 0; i < 3; i++) if (row[i] === '1') p.rect(X + i * s, y + j * s, s, s, k); }); X += 4 * s; }
}
// the endurance arena's walls: 15 colours, picked from the division's own and its concrete
const GH = ['dark', 'darkHi', 'truss', 'lampOff', 'lampOn', 'caseHi', 'case', 'plateHi', 'plate', 'plateSh', 'gem', 'banA', 'banB'];
const gauntletHouse = (S) => ({ ...Object.fromEntries(GH.map((k) => [k, S.house[k]])), wallA: S.wall.a, wallB: S.wall.b });
export function gauntletArena(division, wins = 0, of = 50) {
  const S = STYLES[division] || STYLES.classic, mixed = division === 'combined';
  const prog = Math.max(0, Math.min(1, of > 1 ? wins / (of - 1) : 0)); // how far through the run: 0 on the first fight, 1 on the last
  // the crowd grows: a handful behind the fence at the start, a packed pit on the last fight (more of them up and cheering, too)
  const density = +(0.16 + 0.84 * prog).toFixed(3), excitable = +(0.35 + 0.6 * prog).toFixed(3);
  return {
    id: `g.${division}.${wins}`, name: mixed ? 'THE ENDURANCE ARENA' : `${S.name} ENDURANCE`, circuit: null, music: `gFight${division[0].toUpperCase()}${division.slice(1)}0`,
    // (what the fight reads: the louder crowd, the harder flicker)
    progress: prog, crowdGain: +(0.55 + 1.0 * prog).toFixed(2),
    palettes: palettes(S, 'g', gauntletHouse(S)),
    ring: RING,
    shadowColor: 'shadow',
    crowd: { style: 'sellout', density, excitable, seed: 23 + Math.min(40, wins), rows: [{ y: 56, x0: 6, x1: 250, spacing: 8 }, { y: 66, x0: 2, x1: 254, spacing: 8 }, { y: 77, x0: 6, x1: 250, spacing: 9 }, { y: 88, x0: 2, x1: 254, spacing: 9 }], ...CROWD_STYLE },
    paintBack(p) {
      // the back wall: concrete blocks, grime and steel
      p.rect(0, 0, 256, 92, 'wallB');
      for (let y = 0; y < 52; y += 8) { p.hline(0, 255, y, 'wallA'); for (let x = (y >> 3) & 1 ? 0 : 16; x < 256; x += 32) p.vline(x, y, y + 7, 'wallA'); }
      p.dither(0, 0, 256, 52, 'truss', 0.08);
      for (let x = 10; x < 256; x += 44) for (let y = 0; y < 52; y++) if (((x * 7 + y * 3) % 11) < 2) p.px(x + ((y * 5) % 5), y, 'dark'); // (grime running down)
      p.rect(0, 52, 256, 6, 'wallA'); p.rect(0, 52, 256, 1, 'truss');
      // steel girders overhead with floodlights (they flicker: paletteAnim)
      p.rect(0, 3, 256, 4, 'truss'); for (let x = 0; x < 256; x += 8) p.line(x, 3, x + 4, 6, 'wallB');
      for (const x of [30, 100, 156, 226]) { p.rect(x - 7, 7, 14, 4, 'wallA'); p.rect(x - 6, 11, 12, 3, 'lampOff'); for (let y = 14; y < 54; y++) { const w = (y - 14) * 0.22; p.dither(Math.round(x - w), y, Math.round(w * 2) + 1, 1, 'lampOn', 0.07); } }
      // the division's own scenery
      if (division === 'pantheon') for (const x of [3, 245]) { p.rect(x, 10, 8, 80, 'caseHi'); p.rect(x + 1, 10, 2, 80, 'case'); p.rect(x - 2, 10, 12, 4, 'plate'); p.rect(x - 2, 84, 12, 4, 'plate'); }
      if (division === 'underworld') for (const x of [14, 242]) { p.rect(x - 4, 40, 9, 12, 'case'); p.rect(x - 5, 38, 11, 3, 'plateSh'); p.rect(x - 3, 52, 7, 22, 'plateSh'); }
      if (division === 'void') for (let i = 0; i < 6; i++) p.rect(8 + i * 44, 14 + ((i * 11) % 24), 20 + (i % 3) * 8, 2, 'darkHi');
      if (mixed) for (let i = 0; i < 4; i++) banner(p, 14 + i * 64, 16, 12, 22, [['banA', 'banB', 'plateHi'], ['plateHi', 'banB', 'dark'], ['plateSh', 'plate', 'caseHi'], ['dark', 'caseHi', 'plateHi']][i], ['crown', 'wings', 'skull', 'ring'][i]);
      // THE TALLY BOARD: a black board hung on chains over the middle of the wall: the count, and a tick for every win
      p.vline(92, 7, 14, 'truss'); p.vline(164, 7, 14, 'truss');
      p.rect(84, 14, 88, 44, 'plateSh'); p.rect(86, 16, 84, 40, 'dark'); p.rect(86, 16, 84, 1, 'caseHi'); p.rect(86, 16, 1, 40, 'caseHi');
      p.text('FIGHT', 90, 19, 'plate', { mono: false });
      bigNumber(p, Math.min(wins + 1, of), 90, 27, 'lampOn', 2);
      p.text(`OF ${of}`, 90, 44, 'caseHi', { mono: false });
      // ticks: groups of five (four strokes and a slash) for the wins, up to what fits (the rest is a number)
      const shown = Math.min(wins, 25);
      for (let i = 0; i < shown; i++) {
        const g = Math.floor(i / 5), k = i % 5, gx = 130 + (g % 3) * 14, gy = 20 + Math.floor(g / 3) * 10;
        if (k < 4) p.vline(gx + k * 2, gy, gy + 6, 'lampOn'); else p.line(gx - 1, gy + 5, gx + 8, gy + 1, 'lampOn');
      }
      if (wins > 25) p.text(`+${wins - 25}`, 134, 44, 'plateHi', { mono: false });
      if (wins === 0) p.text('NONE', 134, 28, 'case', { mono: false });
    },
    paintRing(p) {
      const sign = mixed ? 'ALL FOUR' : S.name;
      paintRingOf(p, { left: 'THE GAUNTLET', right: sign, logo: mixed ? skullLogo : LOGOS[S.emblem] });
      // the chain-link fence in front of the crowd: a diamond mesh, the thicker for a longer run
      for (let x = -40; x < 300; x += 7) { p.line(x, 50, x + 28, 92, 'postDk'); p.line(x + 28, 50, x, 92, 'postDk'); }
      p.rect(0, 49, 256, 2, 'post'); p.rect(0, 91, 256, 1, 'postDk');
    },
    paletteAnim(t, live, pal, state, arena) {
      const set = (k, v) => { live[pal.idx(k)] = pal.u32[pal.idx(v)]; };
      // the floodlights flicker, and the longer the run the harder (a lamp dies for a frame or two)
      const hard = 1 + Math.round(prog * 5);
      if (((t * 13 + (t >> 3) * 7) % 97) < hard) { set('lampOn', 'lampOff'); set('truss', 'wallA'); }
      if ((t >> 4) & 1) set('lampOff', 'lampOn');
      if (state.flash > 0) { state.flash--; if ((state.flash >> 1) & 1) { set('dark', 'darkHi'); set('canvas', 'canvasHi'); } }
      if (division === 'underworld' && ((t >> 4) & 3) === 0) set('plateSh', 'plate');
      if (division === 'void' && ((t * 7 + (t >> 5) * 13) % 89) < 3) { set('wallB', 'caseHi'); }
      void arena;
    },
    onReaction(kind, state) {
      if (kind === 'knockdown' || kind === 'ko') { state.flash = 20; state.frenzy = 120; }
      if (kind === 'star') state.frenzy = Math.max(state.frenzy || 0, 60);
    },
    overlay(frame, arena, t, state) {
      const col = (k) => arena.live[arena.pal.idx(k)];
      // the tally board: the count's lamp blinks (this fight is the one in progress)
      if ((t >> 4) & 1) frame.rect(172, 14, 3, 3, col('lampOn'));
      if (state.frenzy > 0) state.frenzy--;
      // the crowd flashes and waves: a little at the start, a roar at the end
      const n = (state.frenzy > 0 ? 8 : 2) + Math.round(prog * 6);
      for (let i = 0; i < n; i++) {
        const seed = ((t >> 2) * 131 + i * 977) % 4099;
        if (((t + i * 7) & 3) > 1) continue;
        frame.rect((seed * 37) % 252 + 2, 52 + (seed % 38), 2, 2, col('flash'));
      }
      if (division === 'underworld') for (let i = 0; i < 8; i++) { const x = (i * 61 + (t >> 1) * (1 + (i % 3))) % 256, y = 76 - ((t + i * 19) % 50); frame.px(x, y, col('lampOn')); }
      if (division === 'void' && ((t >> 2) % 19) === 0) { const y = 10 + ((t * 5) % 44); frame.rect(((t * 3) % 50) - 20, y, 276, 2, col('caseHi')); }
    },
  };
}

// the arena of a run: a Title Defense is the hall, a Gauntlet the endurance arena at its place in the run
export function modeArena(mode, division, run = null) {
  if (mode === 'td') return tdArena(division);
  return gauntletArena(division, run ? run.idx : 0, run ? run.list.length : 50);
}
