// Revenant Rourke: Old Man Rourke's own sprite layers (spriteLayers: 'rourke'),
// in a grave-pale palette. Blue-grey corpse skin, eyes and teeth that glow a
// cold cyan, rotted gloves, faded trunks with a tarnished-green waistband.
// Only the colours are new; every frame is Rourke's.

import { swapPalette } from '../../../src/engine/palette.js';
import { palettes as rourke } from './rourke.js';

const A = swapPalette('revenant.A', rourke.rourke.A, {
  outline: [1, 2, 3],
  skinHi: [22, 26, 25], skin: [15, 19, 19], skinSh: [9, 12, 14], skinDk: [4, 6, 8],
  ruddy: [12, 15, 17], white: [20, 31, 29], mouth: [2, 4, 6],
  hairHi: [26, 28, 28], hair: [17, 19, 20], hairDk: [9, 10, 12],
  gloveHi: [13, 12, 10], glove: [8, 7, 6], gloveDk: [4, 4, 3],
});
const B = swapPalette('revenant.B', rourke.rourke.B, {
  trunkHi: [12, 10, 15], trunk: [7, 5, 10], trunkDk: [3, 2, 5],
  gold: [13, 17, 10], goldDk: [7, 10, 6],
  sockHi: [20, 22, 21], sock: [14, 16, 16],
  bootHi: [6, 6, 8], boot: [3, 3, 4],
  tape: [20, 22, 20],
});
export const palettes = { revenant: { A, B } };
