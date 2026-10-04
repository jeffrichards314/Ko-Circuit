// Medal icons (§15): bronze / silver / gold, 9x11, earned or locked, in 15-bit colours.
import { c32 } from '../engine/palette.js';

const COLS = {
  speed: [c32(29, 18, 9), c32(22, 11, 4), c32(12, 6, 2)],      // bronze
  flawless: [c32(31, 31, 31), c32(22, 23, 26), c32(12, 13, 16)], // silver
  signature: [c32(31, 29, 12), c32(29, 21, 3), c32(17, 11, 1)],  // gold
};
const LOCK = [c32(10, 11, 14), c32(7, 8, 11), c32(4, 5, 7)];
const RIBBON = { speed: c32(24, 6, 6), flawless: c32(6, 10, 26), signature: c32(4, 22, 20) };
const OUT = c32(1, 1, 2);
const DISC = ['..ooooo..', '.oaaaabo.', 'oaaaabbbo', 'oaabbbbco', 'oabbbbbco', 'obbbbbcco', '.obbccco.', '..ooooo..'];

// Top-left at (x, y). `blink` flashes a newly earned one.
export function drawMedal(f, x, y, kind, earned, blink = false) {
  const [hi, mid, dk] = earned && !blink ? COLS[kind] : LOCK;
  const rib = earned ? RIBBON[kind] : LOCK[1];
  f.rect(x + 2, y, 2, 3, rib); f.rect(x + 5, y, 2, 3, rib);
  DISC.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const ch = row[i]; if (ch !== '.') f.px(x + i, y + 3 + j, ch === 'o' ? OUT : ch === 'a' ? hi : ch === 'b' ? mid : dk); } });
}
// The three in a row, 11 px apart.
export function drawMedalRow(f, x, y, got, fresh = []) {
  ['speed', 'flawless', 'signature'].forEach((k, i) => drawMedal(f, x + i * 11, y, k, got[k], fresh.includes(k)));
}
