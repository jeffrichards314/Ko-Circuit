// Named palettes. Every value is a SNES 15-bit color: [r, g, b] with 5-bit channels.
// Sprite palettes are max 15 colors + transparent; opponents use at most 2 (A = body, B = costume).
// Arena palettes live in their arena files (/data/arenas).

import { makePalette, swapPalette } from '../src/engine/palette.js';
import { palettes as kidPalettes } from './sprites/fighters/kid.js';
import { palettes as mortPalettes } from './sprites/fighters/mort.js';
import { palettes as gusPalettes } from './sprites/fighters/gus.js';
import { palettes as roccoPalettes } from './sprites/fighters/rocco.js';
import { palettes as gambiniPalettes } from './sprites/fighters/gambini.js';
import { palettes as knoxPalettes } from './sprites/fighters/knox.js';
import { palettes as brodyPalettes } from './sprites/fighters/brody.js';
import { palettes as rayPalettes } from './sprites/fighters/ray.js';
import { palettes as pidgePalettes } from './sprites/fighters/pidge.js';
import { palettes as samPalettes } from './sprites/fighters/sam.js';
import { palettes as mcbridePalettes } from './sprites/fighters/mcbride.js';
import { palettes as djdropPalettes } from './sprites/fighters/djdrop.js';
import { palettes as anchorPalettes } from './sprites/fighters/anchor.js';
import { palettes as geminiPalettes } from './sprites/fighters/gemini.js';
import { palettes as midnightPalettes } from './sprites/fighters/midnight.js';
import { palettes as strongmanPalettes } from './sprites/fighters/strongman.js';
import { palettes as pocketsPalettes } from './sprites/fighters/pockets.js';
import { palettes as tessPalettes } from './sprites/fighters/tess.js';
import { palettes as jinxPalettes } from './sprites/fighters/jinx.js';
import { palettes as rexPalettes } from './sprites/fighters/rex.js';
import { palettes as rustyPalettes } from './sprites/fighters/rusty.js';
import { palettes as avalanchePalettes } from './sprites/fighters/avalanche.js';
import { palettes as colePalettes } from './sprites/fighters/cole.js';
import { palettes as downpourPalettes } from './sprites/fighters/downpour.js';
import { palettes as boltPalettes } from './sprites/fighters/bolt.js';
import { palettes as maestroPalettes } from './sprites/fighters/maestro.js';
import { palettes as glacierPalettes } from './sprites/fighters/glacier.js';
import { palettes as hankPalettes } from './sprites/fighters/hank.js';
import { palettes as larsPalettes } from './sprites/fighters/lars.js';
import { palettes as baronPalettes } from './sprites/fighters/baron.js';
import { palettes as suturesPalettes } from './sprites/fighters/sutures.js';
import { palettes as tiaPalettes } from './sprites/fighters/tia.js';
import { palettes as rourkePalettes } from './sprites/fighters/rourke.js';
import { palettes as ignatiusPalettes } from './sprites/fighters/ignatius.js';
import { palettes as duchessPalettes } from './sprites/fighters/duchess.js';
import { palettes as mirrorPalettes } from './sprites/fighters/mirror.js';
import { palettes as novaPalettes } from './sprites/fighters/nova.js';
import { palettes as goliathPalettes } from './sprites/fighters/goliath.js';
import { palettes as quinnPalettes } from './sprites/fighters/quinn.js';
import { palettes as monkPalettes } from './sprites/fighters/monk.js';
import { palettes as karverPalettes } from './sprites/fighters/karver.js';
import { palettes as jaxPalettes } from './sprites/fighters/jax.js';
import { palettes as staticPalettes } from './sprites/fighters/static.js';
import { palettes as cadePalettes } from './sprites/fighters/cade.js';
import { palettes as nullFPalettes } from './sprites/fighters/null.js';
import { palettes as wardenPalettes } from './sprites/fighters/warden.js';
import { palettes as hollowPalettes } from './sprites/fighters/hollow.js';
import { palettes as revenantPalettes } from './sprites/fighters/revenant.js';
import { palettes as frenzyPalettes } from './sprites/fighters/frenzy.js';
import { palettes as eclipsePalettes } from './sprites/fighters/eclipse.js';
import { palettes as zeroPalettes } from './sprites/fighters/zero.js';
import { palettes as refereePalettes } from './sprites/referee.js';
import { palettes as dashPalettes } from './sprites/fighters/dash.js';
import { PANTHEON_PALETTES } from './sprites/fighters/pantheon/index.js';
import { UNDERWORLD_PALETTES } from './sprites/fighters/underworld/index.js';
import { VOID_PALETTES } from './sprites/fighters/void/index.js';
export { rgb15, makePalette, swapPalette, spritePalette, bgPalette, c32 } from '../src/engine/palette.js';

// ---------------------------------------------------------------------------
// Barney Buckets
// ---------------------------------------------------------------------------
const barneyA = makePalette('barney.A', {
  outline: [3, 2, 3],
  skinHi: [31, 24, 18],
  skin: [28, 18, 13],
  skinSh: [22, 12, 9],
  skinDk: [14, 7, 6],
  ruddy: [27, 11, 10],
  mouth: [11, 2, 4],
  white: [30, 30, 28],
  hairHi: [27, 27, 27],
  hair: [19, 19, 21],
  hairDk: [11, 11, 14],
  gloveHi: [31, 31, 17],
  glove: [30, 25, 5],
  gloveSh: [25, 16, 2],
  gloveDk: [16, 8, 3],
});

const barneyB = makePalette('barney.B', {
  shirtHi: [25, 28, 30],
  shirt: [18, 22, 26],
  shirtSh: [12, 15, 21],
  shirtDk: [7, 9, 15],
  pantsHi: [13, 14, 20],
  pants: [8, 9, 15],
  pantsDk: [4, 4, 9],
  capHi: [9, 23, 21],
  cap: [4, 16, 16],
  capDk: [2, 9, 10],
  brownHi: [21, 13, 7],
  brown: [13, 7, 4],
  metalHi: [31, 28, 18],
  metal: [21, 17, 7],
  patch: [26, 5, 6],
});

// "Night shift" alternate costume (palette swap demo for the sprite viewer).
const barneyNightB = swapPalette('barney.nightB', barneyB, {
  shirtHi: [22, 22, 26], shirt: [14, 14, 19], shirtSh: [9, 9, 14], shirtDk: [5, 5, 9],
  pantsHi: [18, 12, 8], pants: [12, 8, 5], pantsDk: [7, 4, 3],
  capHi: [28, 16, 6], cap: [22, 10, 3], capDk: [13, 5, 2],
});
const barneyNightA = swapPalette('barney.nightA', barneyA, {
  gloveHi: [31, 22, 14], glove: [29, 13, 4], gloveSh: [21, 7, 3], gloveDk: [12, 3, 2],
});

// Barney Buckets, Ascended (#81): the same janitor in white and gold (his layers: sprites/fighters/pantheon/barney2.js)
const barney2A = swapPalette('barney2.A', barneyA, {
  hairHi: [31, 31, 31], hair: [29, 28, 26], hairDk: [20, 18, 20],
  gloveHi: [31, 31, 30], glove: [31, 29, 14], gloveSh: [28, 21, 5], gloveDk: [17, 11, 2],
});
const barney2B = swapPalette('barney2.B', barneyB, {
  shirtHi: [31, 31, 31], shirt: [29, 29, 30], shirtSh: [21, 21, 27], shirtDk: [11, 11, 19],
  pantsHi: [31, 29, 15], pants: [28, 21, 5], pantsDk: [16, 10, 2],
  capHi: [31, 30, 17], cap: [29, 23, 5], capDk: [17, 11, 2],
  brownHi: [29, 25, 12], brown: [21, 15, 4], metalHi: [31, 31, 24], metal: [30, 25, 8], patch: [31, 26, 8],
});

// ---------------------------------------------------------------------------
// Player (back view). One palette; swaps for pink exhaustion and gold.
// ---------------------------------------------------------------------------
const player = makePalette('player', {
  outline: [2, 2, 4],
  skinHi: [31, 24, 18],
  skin: [27, 17, 12],
  skinSh: [19, 11, 8],
  hair: [4, 3, 5],
  hairHi: [10, 8, 12],
  shirt: [4, 5, 8],
  shirtHi: [10, 11, 16],
  trunksHi: [14, 20, 31],
  trunks: [6, 11, 27],
  trunksDk: [3, 5, 16],
  gloveHi: [31, 18, 14],
  glove: [27, 5, 5],
  gloveDk: [15, 2, 4],
  white: [30, 30, 30],
});
// Palette B: shoes (a second palette keeps every option independently swappable).
const playerB = makePalette('player.B', {
  shoeHi: [10, 11, 16],
  shoe: [4, 5, 8],
  shoeDk: [2, 2, 4],
  // costume accents (§16, data/costumes.js): headgear, stripes, trim, crests
  accentHi: [31, 31, 31], accent: [24, 25, 27], accentDk: [14, 15, 19],
});

const playerPink = swapPalette('player.pink', player, {
  skinHi: [31, 24, 29], skin: [30, 16, 24], skinSh: [22, 9, 18],
  shirt: [18, 5, 16], shirtHi: [26, 12, 22],
  trunksHi: [31, 22, 29], trunks: [27, 13, 24], trunksDk: [18, 6, 16],
  gloveHi: [31, 24, 29], glove: [29, 12, 22], gloveDk: [18, 4, 14],
  hair: [14, 3, 12], hairHi: [22, 8, 18],
});

export const GOLD_OVERRIDES = {
  shirt: [14, 9, 2], shirtHi: [24, 18, 4],
  trunksHi: [31, 30, 14], trunks: [28, 22, 4], trunksDk: [18, 12, 2],
  gloveHi: [31, 30, 16], glove: [29, 22, 3], gloveDk: [17, 11, 2],
};
const playerGold = swapPalette('player.gold', player, GOLD_OVERRIDES);
const playerPinkB = swapPalette('player.pinkB', playerB, { shoeHi: [26, 12, 22], shoe: [18, 5, 16], shoeDk: [10, 2, 9] });
const playerGoldB = swapPalette('player.goldB', playerB, { shoeHi: [31, 30, 16], shoe: [29, 22, 3], shoeDk: [17, 11, 2] });

// Player front view (intro card portrait / corner screen).
const playerFront = makePalette('playerFront', {
  outline: [2, 2, 4],
  skinHi: [31, 25, 19],
  skin: [28, 18, 13],
  skinSh: [21, 12, 9],
  skinDk: [13, 7, 6],
  hair: [4, 3, 5],
  hairHi: [11, 9, 13],
  white: [30, 30, 30],
  eye: [5, 9, 16],
  mouth: [15, 4, 6],
  shirt: [4, 5, 8],
  shirtHi: [11, 12, 17],
  gloveHi: [31, 18, 14],
  glove: [27, 5, 5],
  gloveDk: [15, 2, 4],
});

// ---------------------------------------------------------------------------
// UI / HUD / effects
// ---------------------------------------------------------------------------
const ui = makePalette('ui', {
  black: [0, 0, 0],
  white: [31, 31, 31],
  offwhite: [27, 28, 30],
  grey: [16, 17, 20],
  dark: [4, 5, 8],
  panel: [3, 8, 14],
  panelHi: [9, 18, 27],
  red: [30, 6, 6],
  redDk: [17, 2, 3],
  yellow: [31, 28, 6],
  orange: [31, 17, 4],
  green: [8, 27, 10],
  cyan: [12, 26, 30],
  pink: [31, 14, 22],
  blue: [7, 12, 30],
});

export const PALETTES = {
  barney: { A: barneyA, B: barneyB },
  barneyNight: { A: barneyNightA, B: barneyNightB },
  barney2: { A: barney2A, B: barney2B },
  player: { A: player, B: playerB },
  playerPink: { A: playerPink, B: playerPinkB },
  playerGold: { A: playerGold, B: playerGoldB },
  playerFront: { A: playerFront },
  ui: { A: ui },
  ...kidPalettes,
  ...mortPalettes,
  ...gusPalettes,
  ...roccoPalettes,
  ...gambiniPalettes,
  ...knoxPalettes,
  ...brodyPalettes,
  ...rexPalettes,
  ...jinxPalettes,
  ...tessPalettes,
  ...pocketsPalettes,
  ...strongmanPalettes,
  ...midnightPalettes,
  ...geminiPalettes,
  ...anchorPalettes,
  ...djdropPalettes,
  ...mcbridePalettes,
  ...samPalettes,
  ...pidgePalettes,
  ...rayPalettes,
  ...rustyPalettes,
  ...avalanchePalettes,
  ...colePalettes,
  ...downpourPalettes,
  ...boltPalettes,
  ...maestroPalettes,
  ...glacierPalettes,
  ...hankPalettes,
  ...larsPalettes,
  ...baronPalettes,
  ...suturesPalettes,
  ...tiaPalettes,
  ...rourkePalettes,
  ...ignatiusPalettes,
  ...duchessPalettes,
  ...mirrorPalettes,
  ...novaPalettes,
  ...goliathPalettes,
  ...quinnPalettes,
  ...monkPalettes,
  ...karverPalettes,
  ...jaxPalettes,
  ...staticPalettes,
  ...zeroPalettes,
  ...dashPalettes,
  ...refereePalettes,
  ...eclipsePalettes,
  ...frenzyPalettes,
  ...revenantPalettes,
  ...hollowPalettes,
  ...wardenPalettes,
  ...nullFPalettes,
  ...cadePalettes,
  ...PANTHEON_PALETTES,
  ...UNDERWORLD_PALETTES,
  ...VOID_PALETTES,
};

export const UI = ui;

// ---------------------------------------------------------------------------
// Alternate palettes (§16): every opponent has one, for Practice
// once unlocked with medals. `<palette>.alt` is made on first use: his costume
// colours (palette B, and the glove/costume keys of palette A) turned round the
// colour wheel, while skin, hair, eyes and the outline stay his own. The turn is
// fixed per fighter (a hash of the name), so his alt colours never change.
const KEEP = /^(outline|skin|hair|white|mouth|eye|teeth|beard|brow|stubble|lash|flesh|tooth|lip)/i;
function turn([r, g, b], deg) {
  const R = r / 31, G = g / 31, B = b / 31, mx = Math.max(R, G, B), mn = Math.min(R, G, B), d = mx - mn;
  if (d < 0.08) return [r, g, b]; // greys stay grey
  let h = mx === R ? ((G - B) / d) % 6 : mx === G ? (B - R) / d + 2 : (R - G) / d + 4;
  h = (h * 60 + deg + 360) % 360;
  const s = d / mx, v = mx, C = v * s, X = C * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - C;
  const [r1, g1, b1] = h < 60 ? [C, X, 0] : h < 120 ? [X, C, 0] : h < 180 ? [0, C, X] : h < 240 ? [0, X, C] : h < 300 ? [X, 0, C] : [C, 0, X];
  return [r1, g1, b1].map((x) => Math.max(0, Math.min(31, Math.round((x + m) * 31))));
}
export function ensureAltPalette(name) {
  const alt = `${name}.alt`;
  if (PALETTES[alt] || !PALETTES[name]) return alt;
  let hsh = 0;
  for (const ch of name) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0;
  const deg = 100 + (hsh % 7) * 26; // 100..256 degrees
  const shift = (P, all) => P && swapPalette(`${P.name}.alt`, P, Object.fromEntries(P.keys.filter((k) => all || !KEEP.test(k)).map((k) => [k, turn(P.spec[k], deg)])));
  const base = PALETTES[name];
  PALETTES[alt] = { A: shift(base.A, false), B: base.B && shift(base.B, false) };
  return alt;
}

// The Title Defense remix's colours for a fighter with no costume of his own (spec §6): his costume colours turned round the wheel by `deg`
// (default: from a hash of his name, always a turn away from his alternate colours), everything skin, hair and outline kept.
// Registered as `<palette>.td`, so a remix fights in a different set of colours than the career fight.
export function ensureRemixPalette(name, deg = null) {
  const td = `${name}.td`;
  if (PALETTES[td] || !PALETTES[name]) return td;
  let hsh = 7;
  for (const ch of name) hsh = (hsh * 37 + ch.charCodeAt(0)) >>> 0;
  const turnBy = deg ?? 40 + (hsh % 6) * 32;
  const shift = (P) => P && swapPalette(`${P.name}.td`, P, Object.fromEntries(P.keys.filter((k) => !KEEP.test(k)).map((k) => [k, turn(P.spec[k], turnBy)])));
  const base = PALETTES[name];
  PALETTES[td] = { A: shift(base.A), B: base.B && shift(base.B) };
  return td;
}
