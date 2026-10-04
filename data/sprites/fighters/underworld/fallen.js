// The Hall of the Fallen (Underworld IV, spec §18 A6): four champions from the upper world, drawn from
// their own sprite layers (`spriteLayers: 'brody'`...) in dark palettes: ash-grey skin with the cold light of the
// grave behind it, the old colours gone black and dried-blood, the old metals tarnished. Only the colours are new;
// every frame is the original champion's (Revenant Rourke's trick).
import { swapPalette } from '../../../../src/engine/palette.js';
import { palettes as brody } from '../brody.js';
import { palettes as midnight } from '../midnight.js';
import { palettes as maestro } from '../maestro.js';
import { palettes as karver } from '../karver.js';

// Brody: the wall gone to soot and blood-red brick, the mortar between the bricks glowing like a coal, the belt's gold dull
const fbrodyA = swapPalette('fbrody.A', brody.brody.A, {
  outline: [1, 1, 2],
  skinHi: [19, 18, 18], skin: [13, 12, 13], skinSh: [8, 7, 9], skinDk: [4, 3, 5],
  white: [24, 23, 22], mouth: [6, 2, 3], hairHi: [9, 8, 8], hair: [4, 4, 4], hairDk: [2, 2, 2],
  gloveHi: [15, 14, 15], glove: [9, 8, 9], gloveDk: [4, 4, 5], tape: [20, 19, 18],
});
const fbrodyB = swapPalette('fbrody.B', brody.brody.B, {
  brickHi: [16, 6, 7], brick: [10, 3, 5], brickSh: [5, 2, 3], mortar: [29, 14, 4],
  goldHi: [17, 14, 8], gold: [12, 9, 4], goldSh: [6, 4, 2], strap: [2, 2, 3], strapHi: [8, 7, 10], gem: [10, 27, 14],
});
// Midnight: paler than ever, the violet gone to a bruise, the blood a wet black-red
const fmidnightA = swapPalette('fmidnight.A', midnight.midnight.A, {
  outline: [1, 0, 2],
  skinHi: [22, 23, 25], skin: [16, 17, 20], skinSh: [10, 10, 14], skinDk: [5, 5, 8],
  white: [26, 26, 28], mouth: [11, 1, 4], iris: [31, 7, 5], gloveHi: [11, 5, 15], glove: [6, 2, 10], gloveDk: [3, 1, 5],
});
const fmidnightB = swapPalette('fmidnight.B', midnight.midnight.B, {
  blackHi: [6, 5, 9], black: [2, 2, 4], blackDk: [0, 0, 2],
  violetHi: [14, 5, 12], violet: [8, 2, 8], violetDk: [4, 1, 4],
  silverHi: [20, 21, 25], silver: [12, 13, 17], silverDk: [6, 7, 10], blood: [26, 3, 5],
});
// Vale: the baton a bone, the tails gone to charcoal with a lining of dried red
const fvaleA = swapPalette('fvale.A', maestro.maestro.A, {
  outline: [1, 1, 2],
  skinHi: [22, 21, 21], skin: [16, 15, 16], skinSh: [10, 9, 11], skinDk: [5, 4, 6],
  white: [25, 25, 26], mouth: [9, 2, 4], hairHi: [19, 19, 21], hair: [12, 12, 15], hairDk: [6, 6, 8],
  gloveHi: [22, 22, 24], glove: [15, 15, 18], gloveDk: [8, 8, 11],
});
const fvaleB = swapPalette('fvale.B', maestro.maestro.B, {
  coatHi: [6, 4, 7], coat: [3, 2, 4], coatDk: [1, 1, 2], satinHi: [17, 5, 8], satin: [10, 3, 5], shirtSh: [14, 14, 17],
  shoeHi: [7, 7, 9], shoe: [2, 2, 3], baton: [25, 24, 20], goldHi: [22, 18, 8], gold: [15, 11, 3],
});
// Karver: the cape the colour of old blood, ermine gone grey, the gold of his gloves rusted iron, the ruby wet and bright
const fkarverA = swapPalette('fkarver.A', karver.karver.A, {
  outline: [2, 1, 2],
  skinHi: [22, 20, 20], skin: [16, 14, 15], skinSh: [10, 8, 10], skinDk: [5, 4, 5],
  white: [26, 25, 25], mouth: [10, 2, 3], hairHi: [19, 19, 20], hair: [12, 12, 13], hairDk: [5, 5, 6],
  gloveHi: [20, 8, 6], glove: [14, 4, 4], gloveDk: [7, 2, 2], ruby: [31, 9, 8],
});
const fkarverB = swapPalette('fkarver.B', karver.karver.B, {
  capeHi: [14, 3, 8], cape: [8, 1, 5], capeDk: [3, 0, 2], ermine: [21, 21, 22], ermineSh: [11, 11, 14], bootHi: [6, 5, 7], boot: [2, 2, 3],
});
export const palettes = {
  fbrody: { A: fbrodyA, B: fbrodyB }, fmidnight: { A: fmidnightA, B: fmidnightB },
  fvale: { A: fvaleA, B: fvaleB }, fkarver: { A: fkarverA, B: fkarverB },
};
