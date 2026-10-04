// Player customization options (spec §7). Every color is SNES 15-bit.
// A profile stores indices into these lists, so it fits in the password (§8).

import { swapPalette, spritePalette } from '../src/engine/palette.js';
import { PALETTES, GOLD_OVERRIDES } from './palette.js';
import { HAIR_STYLES } from './sprites/player/player.js';
import { COSTUMES } from './costumes.js';

// [hi, base, shade, dark]
export const SKINS = [
  { name: 'FAIR', c: [[31, 26, 22], [29, 21, 17], [23, 14, 11], [14, 8, 7]] },
  { name: 'PEACH', c: [[31, 24, 18], [27, 17, 12], [19, 11, 8], [13, 7, 6]] },
  { name: 'OLIVE', c: [[29, 23, 15], [24, 17, 10], [17, 11, 6], [10, 6, 4]] },
  { name: 'TAN', c: [[27, 19, 12], [22, 14, 8], [15, 9, 5], [9, 5, 3]] },
  { name: 'BROWN', c: [[21, 14, 9], [16, 10, 6], [11, 6, 4], [6, 3, 2]] },
  { name: 'DEEP', c: [[16, 10, 7], [11, 7, 4], [7, 4, 3], [4, 2, 2]] },
];

export { HAIR_STYLES };
export const HAIR_STYLE_NAMES = { spiky: 'SPIKY', buzz: 'BUZZ CUT', afro: 'AFRO', mohawk: 'MOHAWK', ponytail: 'PONYTAIL', slick: 'SLICKED' };

// [base, hi]
export const HAIR_COLORS = [
  { name: 'BLACK', c: [[4, 3, 5], [10, 8, 12]] },
  { name: 'BROWN', c: [[11, 6, 3], [18, 11, 6]] },
  { name: 'AUBURN', c: [[18, 6, 3], [26, 12, 6]] },
  { name: 'BLOND', c: [[24, 18, 6], [30, 26, 13]] },
  { name: 'SILVER', c: [[17, 17, 20], [26, 26, 28]] },
  { name: 'BLUE', c: [[5, 8, 20], [11, 16, 29]] },
];

// [hi, base, dark]
export const TRUNKS = [
  { name: 'BLUE', c: [[14, 20, 31], [6, 11, 27], [3, 5, 16]] },
  { name: 'RED', c: [[31, 14, 12], [26, 4, 5], [15, 2, 3]] },
  { name: 'GREEN', c: [[14, 27, 14], [5, 19, 8], [2, 10, 4]] },
  { name: 'BLACK', c: [[11, 11, 14], [5, 5, 7], [2, 2, 3]] },
  { name: 'WHITE', c: [[31, 31, 31], [25, 26, 28], [16, 17, 21]] },
  { name: 'PURPLE', c: [[24, 15, 31], [15, 6, 24], [8, 3, 14]] },
  { name: 'ORANGE', c: [[31, 22, 10], [29, 13, 3], [17, 7, 2]] },
  { name: 'TEAL', c: [[12, 28, 27], [4, 19, 19], [2, 10, 11]] },
];
export const GLOVES = [
  { name: 'RED', c: [[31, 18, 14], [27, 5, 5], [15, 2, 4]] },
  { name: 'BLUE', c: [[16, 22, 31], [6, 11, 28], [3, 5, 16]] },
  { name: 'BLACK', c: [[13, 13, 16], [5, 5, 7], [2, 2, 3]] },
  { name: 'WHITE', c: [[31, 31, 31], [25, 26, 28], [15, 16, 20]] },
  { name: 'GREEN', c: [[16, 29, 16], [5, 20, 8], [2, 10, 4]] },
  { name: 'PINK', c: [[31, 22, 27], [28, 11, 20], [16, 4, 11]] },
  { name: 'YELLOW', c: [[31, 31, 17], [30, 25, 5], [18, 11, 2]] },
  { name: 'PURPLE', c: [[25, 17, 31], [15, 6, 24], [8, 3, 14]] },
];
export const SHOES = [
  { name: 'BLACK', c: [[10, 11, 16], [4, 5, 8], [2, 2, 4]] },
  { name: 'WHITE', c: [[31, 31, 31], [24, 25, 27], [14, 15, 19]] },
  { name: 'RED', c: [[31, 14, 12], [24, 4, 5], [13, 2, 3]] },
  { name: 'BLUE', c: [[14, 19, 31], [6, 10, 25], [3, 4, 14]] },
  { name: 'GOLD', c: [[31, 28, 12], [26, 19, 3], [15, 10, 2]] },
  { name: 'GREEN', c: [[14, 26, 14], [5, 17, 8], [2, 9, 4]] },
  { name: 'BROWN', c: [[21, 13, 7], [13, 7, 4], [6, 3, 2]] },
  { name: 'GREY', c: [[22, 23, 25], [14, 15, 17], [7, 7, 9]] },
];

// Trainers (one passive each). Their art lives in data/sprites/trainers.js.
export const TRAINERS = [
  { id: 'oldschool', name: 'POP MALONE', title: 'OLD-SCHOOL', perk: '+1 GET-UP STRENGTH' },
  { id: 'tactician', name: 'COACH ADA', title: 'TACTICIAN', perk: '1 EXTRA TIP EACH ROUND' },
  { id: 'hype', name: 'JAZZY JAY', title: 'HYPE MAN', perk: 'START EVERY FIGHT WITH 1 STAR' },
];

// "ACE 'THE ___'" (16 so the choice fits in the password).
export const NICKNAMES = [
  'ROOKIE', 'KID', 'HAMMER', 'COMET', 'BULLDOG', 'WHIRLWIND', 'MACHINE', 'GHOST',
  'LION', 'ROCKET', 'PHANTOM', 'TITAN', 'SPARK', 'EXPRESS', 'WOLF', 'THUNDER',
];

export const DEFAULT_PROFILE = {
  name: 'ACE', nick: 0, skin: 1, hair: 0, hairColor: 0, trunks: 0, gloves: 0, shoes: 0, trainer: 0,
  costume: 0, // a medal costume (§16, data/costumes.js); never in the password
};

export const nicknameOf = (profile) => `THE ${NICKNAMES[profile.nick] || NICKNAMES[0]}`;
export const hairStyleOf = (profile) => HAIR_STYLES[profile.hair] || HAIR_STYLES[0];
export const trainerOf = (profile) => TRAINERS[profile.trainer] || TRAINERS[0];
// The Underworld's cornerman (spec §18 A4): your trainer can't follow you down, so a hooded ferryman
// stands in the corner. He has none of the three trainers' passives (no starting star, no extra tip, no
// get-up strength) and his tips are shorter and vaguer (a fighter's `ferryTips`). Not a choice: never in the password.
export const FERRYMAN = { id: 'ferryman', name: 'FERRYMAN', title: 'CORNERMAN', perk: 'NONE' };
// Who is in your corner: the Ferryman in the Underworld's arenas, your own trainer everywhere else.
// The Void (Phase E): the Ferryman is still your corner in its fragments; for ZERO's true form Dash, freed, takes his place and gives real, specific tips.
export const DASH_CORNER = { id: 'dash', name: 'DASH', title: 'CORNERMAN', perk: 'NONE' };
export const cornermanFor = (profile, zone, circuit) => (zone === 'void' && circuit === 'zeroTrue' ? DASH_CORNER : zone === 'underworld' || zone === 'void' ? FERRYMAN : trainerOf(profile));
export const costumeOf = (profile) => COSTUMES[profile.costume] || COSTUMES[0];
// The player's sprite bank for a profile: hair style and costume pieces.
export const costumeIdOf = (profile) => costumeOf(profile).id;

// Accept older saved profiles ({ name, nickname }) and fill in anything missing.
export function normalizeProfile(p) {
  const out = { ...DEFAULT_PROFILE, ...(p || {}) };
  delete out.nickname;
  out.name = String(out.name || DEFAULT_PROFILE.name).toUpperCase().slice(0, 8);
  const clamp = (k, n) => { out[k] = Math.max(0, Math.min(n - 1, out[k] | 0)); };
  clamp('nick', NICKNAMES.length); clamp('skin', SKINS.length); clamp('hair', HAIR_STYLES.length);
  clamp('hairColor', HAIR_COLORS.length); clamp('trunks', TRUNKS.length); clamp('gloves', GLOVES.length);
  clamp('shoes', SHOES.length); clamp('trainer', TRAINERS.length); clamp('costume', COSTUMES.length);
  return out;
}

function overridesFor(profile) {
  const [sHi, s, sSh] = SKINS[profile.skin].c;
  const [h, hHi] = HAIR_COLORS[profile.hairColor].c;
  const [tHi, t, tDk] = TRUNKS[profile.trunks].c;
  const [gHi, g, gDk] = GLOVES[profile.gloves].c;
  const out = {
    A: { skinHi: sHi, skin: s, skinSh: sSh, hair: h, hairHi: hHi, trunksHi: tHi, trunks: t, trunksDk: tDk, gloveHi: gHi, glove: g, gloveDk: gDk },
    B: { shoeHi: SHOES[profile.shoes].c[0], shoe: SHOES[profile.shoes].c[1], shoeDk: SHOES[profile.shoes].c[2] },
  };
  // a costume recolours the kit (skin and hair stay yours)
  const K = costumeOf(profile);
  if (K.trunks) {
    Object.assign(out.A, { shirtHi: K.shirt[0], shirt: K.shirt[1], trunksHi: K.trunks[0], trunks: K.trunks[1], trunksDk: K.trunks[2], gloveHi: K.glove[0], glove: K.glove[1], gloveDk: K.glove[2] });
    if (K.outline) out.A.outline = K.outline; // (the Hollow's white outline)
    Object.assign(out.B, { shoeHi: K.shoe[0], shoe: K.shoe[1], shoeDk: K.shoe[2], accentHi: K.accent[0], accent: K.accent[1], accentDk: K.accent[2] });
  }
  return out;
}

// Back-view palettes for a profile: default, pink (exhausted) and gold (ZERO unlock).
export function playerPalettes(profile) {
  const o = overridesFor(profile);
  const base = PALETTES.player;
  const A = swapPalette('player.custom', base.A, o.A);
  const B = swapPalette('player.customB', base.B, o.B);
  const gold = swapPalette('player.customGold', A, GOLD_OVERRIDES);
  return {
    default: spritePalette(A, B),
    pink: spritePalette(PALETTES.playerPink.A, PALETTES.playerPink.B),
    gold: spritePalette(gold, PALETTES.playerGold.B),
  };
}

// Front view (intro card, corner screen, belt ceremony).
export function frontPalette(profile) {
  const [sHi, s, sSh, sDk] = SKINS[profile.skin].c;
  const [h, hHi] = HAIR_COLORS[profile.hairColor].c;
  const [gHi, g, gDk] = GLOVES[profile.gloves].c;
  const K = costumeOf(profile);
  const kit = K.trunks ? { ...(K.outline ? { outline: K.outline } : {}), shirtHi: K.shirt[0], shirt: K.shirt[1], gloveHi: K.glove[0], glove: K.glove[1], gloveDk: K.glove[2] } : { gloveHi: gHi, glove: g, gloveDk: gDk };
  return spritePalette(swapPalette('playerFront.custom', PALETTES.playerFront.A, {
    skinHi: sHi, skin: s, skinSh: sSh, skinDk: sDk, hair: h, hairHi: hHi, ...kit,
  }));
}
