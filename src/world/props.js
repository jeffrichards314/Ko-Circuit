// What stands in an interior (spec §19 G4): the stations of the home gym, the doors, the boards and the podium itself, drawn in code.
// drawProp(f, name, x, y, t, o): (x, y) is the middle of the prop's foot on the floor line; o = { locked, sel, label }.
// A locked station is drawn dimmed under a dither (a cover over it: nothing is blended).
import { c32 } from '../engine/palette.js';
import { COL } from '../fight/hud.js';
import { drawText, textWidth } from '../engine/font.js';
import { bayer } from '../scene/gfx.js';

const K = c32(3, 2, 5), WD = [c32(25, 17, 9), c32(19, 12, 6), c32(12, 7, 3)], ST = [c32(21, 21, 24), c32(14, 14, 18), c32(8, 8, 11)], WH = c32(31, 31, 29);
const RED = c32(27, 6, 7), REDD = c32(17, 2, 4), BLUE = c32(6, 12, 26), GOLD = [c32(31, 29, 12), c32(30, 22, 4), c32(19, 12, 2)], GLASS = [c32(24, 29, 31), c32(11, 19, 27), c32(6, 11, 20)];
const disc = (f, cx, cy, r, col) => { for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(Math.max(0, r * r - y * y))); f.rect(cx - w, cy + y, w * 2 + 1, 1, col); } };
const blink = (t, n, on = 1) => Math.floor(t / n) % (on + 1) === 0;
const sh = (f, x, y, w) => f.rect(x - w / 2, y - 1, w, 2, c32(4, 3, 5)); // a shadow on the floor

// the modes' doors: frame [light, dark], inside [a, b] (or bands), sparks, and an emblem drawn round (x, y)
const em = {
  belt: (f, x, y) => { f.rect(x - 6, y - 1, 12, 3, RED); f.rect(x - 2, y - 3, 5, 6, GOLD[0]); f.px(x, y, RED); },
  wings: (f, x, y) => { for (let i = 0; i < 4; i++) { f.rect(x - 6 + i, y - 2 + i, 3, 1, WH); f.rect(x + 4 - i, y - 2 + i, 3, 1, WH); } f.rect(x - 1, y - 1, 2, 4, GOLD[0]); },
  crown: (f, x, y) => { f.rect(x - 5, y, 10, 3, GOLD[0]); for (const dx of [-5, -1, 3]) f.rect(x + dx, y - 3, 2, 3, GOLD[0]); f.px(x, y + 1, RED); },
  fist: (f, x, y) => { f.rect(x - 4, y - 3, 8, 6, RED); f.rect(x - 4, y - 3, 8, 1, c32(31, 14, 14)); f.rect(x - 3, y + 3, 6, 2, WH); f.px(x - 2, y - 1, REDD); f.px(x + 1, y - 1, REDD); },
  skull: (f, x, y) => { disc(f, x, y - 1, 3, WH); f.rect(x - 2, y + 2, 5, 2, WH); f.px(x - 1, y - 1, K); f.px(x + 1, y - 1, K); },
  ring: (f, x, y) => { for (let a = 0; a < 16; a++) f.px(Math.round(x + Math.cos((a / 16) * 6.28) * 4), Math.round(y + Math.sin((a / 16) * 6.28) * 4), WH); },
  star: (f, x, y, t) => { const c = (t >> 3) & 1 ? GOLD[0] : WH; f.rect(x - 5, y, 11, 1, c); f.rect(x, y - 5, 1, 11, c); f.rect(x - 2, y - 2, 5, 5, c); },
};
export const DOOR_STYLES = {
  plain: { frame: [GOLD[1], GOLD[2]], inside: [c32(4, 6, 14), c32(5, 8, 17)] },
  // Title Defense, one door per division: the classic belts, the Pantheon's light, the Underworld's ash and ember, the Void, all of them
  'td.classic': { frame: [GOLD[1], GOLD[2]], inside: [c32(14, 2, 4), c32(19, 3, 5)], spark: GOLD[0], emblem: em.belt },
  'td.pantheon': { frame: [c32(29, 29, 30), GOLD[1]], inside: [c32(31, 27, 14), c32(31, 30, 22)], spark: WH, emblem: em.wings,
    inner: (f, x, y, t) => { for (let i = 0; i < 3; i++) { const cx = x - 10 + ((i * 9 + (t >> 3)) % 22), cy = y - 40 + i * 12; f.rect(cx, cy, 8, 2, WH); f.rect(cx + 2, cy - 1, 4, 1, WH); } } },
  'td.underworld': { frame: [c32(12, 7, 7), c32(26, 10, 4)], inside: [c32(10, 3, 3), c32(15, 5, 3)], spark: c32(31, 22, 6), emblem: em.skull,
    inner: (f, x, y, t) => { for (let i = 0; i < 3; i++) { const cx = x - 9 + ((i * 8 + (t >> 4)) % 20), cy = y - 12 - ((t >> 2) + i * 7) % 30; f.rect(cx, cy, 2, 2, c32(31, 20, 5)); } } },
  'td.void': { frame: [WH, c32(18, 18, 22)], inside: [c32(1, 1, 3), c32(2, 2, 5)], spark: WH, emblem: em.ring,
    inner: (f, x, y, t) => { for (let i = 0; i < 4; i++) { const cy = y - 58 + ((i * 17 + (t >> 1)) % 56); if ((t >> 3) % 3 !== i % 3) f.rect(x - 12, cy, 24, 1, i & 1 ? WH : c32(14, 14, 18)); } } },
  'td.combined': { frame: [c32(9, 8, 11), GOLD[1]], inside: [c32(12, 4, 18), c32(16, 6, 22)], spark: GOLD[0], emblem: em.crown },
  // the Gauntlet's five: the circuits, the Pantheon, the Underworld, the Void, all of it
  'g.classic': { frame: [c32(16, 16, 20), c32(8, 8, 11)], inside: [c32(8, 7, 10), c32(12, 10, 13)], spark: c32(31, 22, 6), emblem: em.fist,
    inner: (f, x, y, t) => { for (const dx of [-9, 9]) { f.rect(x + dx - 1, y - 40, 2, 6, c32(10, 6, 3)); f.rect(x + dx - 2, y - 45 + ((t >> 3) & 1), 4, 5, (t >> 2) & 1 ? c32(31, 22, 6) : c32(31, 28, 10)); } } },
  'g.pantheon': { frame: [c32(29, 28, 27), GOLD[1]], inside: [c32(31, 28, 16), c32(31, 31, 24)], spark: WH, emblem: em.wings },
  'g.underworld': { frame: [c32(12, 7, 7), c32(5, 3, 4)], inside: [c32(24, 7, 2), c32(29, 14, 3)], spark: c32(31, 25, 8), emblem: em.skull,
    inner: (f, x, y, t) => { for (let i = 0; i < 4; i++) f.rect(x - 12 + i * 7, y - 6 - ((t >> 2) + i * 5) % 8, 3, 2, c32(31, 28, 10)); } },
  'g.void': { frame: [WH, c32(18, 18, 22)], inside: [c32(1, 1, 3), c32(2, 2, 5)], spark: WH, emblem: em.ring,
    inner: (f, x, y, t) => { for (let i = 0; i < 7; i++) f.px(x - 12 + ((i * 7) % 24), y - 60 + ((i * 13 + (t >> 4)) % 56), (t >> 3) + i & 1 ? WH : c32(14, 14, 18)); } },
  'g.combined': { frame: [GOLD[0], c32(9, 8, 11)], inside: [0, 0], bands: [c32(6, 14, 27), c32(29, 23, 6), c32(24, 7, 2), c32(12, 4, 18), c32(2, 2, 5), c32(14, 2, 4)], spark: WH, emblem: em.star },
};

const P = {
  door(f, x, y, t, o) { f.rect(x - 14, y - 50, 28, 50, K); f.rect(x - 12, y - 48, 24, 48, WD[1]); f.rect(x - 12, y - 48, 24, 2, WD[0]); f.rect(x - 9, y - 44, 18, 18, WD[2]); f.rect(x - 8, y - 43, 16, 16, WD[1]); f.rect(x + 7, y - 24, 3, 3, GOLD[1]); f.rect(x - 19, y - 62, 38, 10, K); f.rect(x - 18, y - 61, 36, 8, c32(4, 20, 8)); drawText(f, 'EXIT', x - 15, y - 61, COL.white, { mono: false }); },
  speedbag(f, x, y, t) {
    sh(f, x, y, 34); f.rect(x - 14, y - 58, 28, 4, WD[1]); f.rect(x - 14, y - 58, 28, 1, WD[0]); f.rect(x - 15, y - 54, 2, 54, WD[2]); f.rect(x + 13, y - 54, 2, 54, WD[2]); f.rect(x - 14, y - 4, 28, 3, WD[2]);
    const sw = Math.round(Math.sin(t / 5) * 2);
    f.rect(x, y - 54, 1, 10, ST[1]); f.rect(x - 5 + sw, y - 44, 11, 4, K); for (let i = 0; i < 12; i++) { const w = Math.round(5 * Math.sin((i + 1) / 13 * Math.PI)) + 1; f.rect(x - w + sw + Math.round(i * 0.05), y - 42 + i, w * 2 + 1, 1, i < 3 ? c32(31, 14, 14) : i < 9 ? RED : REDD); } f.rect(x - 2 + sw, y - 38, 2, 4, c32(31, 18, 18));
  },
  rope(f, x, y, t) {
    sh(f, x, y, 36); f.rect(x - 16, y - 3, 32, 3, BLUE); f.rect(x - 16, y - 3, 32, 1, c32(12, 18, 31)); f.rect(x - 17, y - 54, 2, 3, K);
    f.rect(x - 15, y - 52, 3, 48, WD[2]); f.rect(x - 16, y - 54, 6, 3, WD[1]);
    // a rope hung on a hook, swinging a little
    const s = Math.round(Math.sin(t / 10) * 2);
    f.rect(x - 11, y - 50, 1, 4, ST[0]); for (let i = 0; i < 26; i++) { const u = i / 25, xx = x - 10 + Math.round(u * 20) + s, yy = y - 46 + Math.round(Math.sin(u * Math.PI) * 26); f.rect(xx, yy, 2, 2, RED); } f.rect(x - 12 + s, y - 46, 4, 6, WD[0]); f.rect(x + 8 + s, y - 46, 4, 6, WD[0]);
  },
  road(f, x, y, t) {
    sh(f, x, y, 40); f.rect(x - 20, y - 52, 40, 52, K); f.rect(x - 18, y - 50, 36, 50, c32(14, 22, 30)); f.rect(x - 18, y - 30, 36, 30, c32(8, 18, 8));
    for (let i = 0; i < 8; i++) { const w = 3 + i * 3, yy = y - 30 + i * 3.6; f.rect(Math.round(x - w / 2), Math.round(yy), w, 4, c32(10, 10, 13)); if (i % 2 === 0) f.rect(x - 1, Math.round(yy + 1), 2, 2, c32(29, 26, 8)); }
    f.rect(x - 4, y - 48, 8, 1, WH);
    const k = (t >> 3) & 1; f.rect(x - 13, y - 50, 3, 10, WD[1]); f.rect(x + 10, y - 50, 3, 10, WD[1]); f.rect(x - 7 + k, y - 18, 4, 3, RED); f.rect(x + 3 - k, y - 18, 4, 3, RED);
  },
  clipboard(f, x, y) {
    sh(f, x, y, 30); f.rect(x - 11, y - 46, 3, 46, WD[2]); f.rect(x + 9, y - 46, 3, 46, WD[2]); f.rect(x - 14, y - 50, 28, 34, WD[1]); f.rect(x - 12, y - 48, 24, 30, c32(30, 29, 24)); f.rect(x - 6, y - 52, 12, 5, ST[0]);
    for (let i = 0; i < 4; i++) { f.rect(x - 9, y - 42 + i * 7, 4, 4, K); f.rect(x - 8, y - 41 + i * 7, 2, 2, i < 2 ? c32(6, 22, 8) : WH); f.rect(x - 2, y - 41 + i * 7, 9, 1, K); f.rect(x - 2, y - 38 + i * 7, 6, 1, ST[1]); }
  },
  ring(f, x, y, t) {
    sh(f, x, y, 52); f.rect(x - 24, y - 12, 48, 12, BLUE); f.rect(x - 24, y - 12, 48, 2, c32(12, 18, 31)); f.rect(x - 22, y - 14, 44, 3, c32(26, 26, 28)); f.rect(x - 22, y - 14, 44, 1, WH);
    for (const px of [x - 22, x + 20]) { f.rect(px, y - 46, 3, 34, ST[1]); f.rect(px, y - 46, 1, 34, ST[0]); f.rect(px - 1, y - 46, 5, 3, RED); }
    for (const [yy, col] of [[y - 40, WH], [y - 30, RED], [y - 20, WH]]) f.rect(x - 20, yy, 40, 2, col);
    f.rect(x - 8, y - 38, 16, 1, c32(31, 29, 12)); void t;
  },
  mirror(f, x, y, t) {
    sh(f, x, y, 34); f.rect(x - 14, y - 60, 28, 60, K); f.rect(x - 12, y - 58, 24, 56, GLASS[1]); f.rect(x - 12, y - 58, 24, 56, GLASS[1]);
    for (let i = 0; i < 10; i++) f.rect(x - 10 + i * 2, y - 56 + i * 2 + ((t >> 4) & 1 && i === 3 ? 1 : 0), 1, 5, GLASS[0]);
    f.rect(x - 12, y - 58, 24, 2, GLASS[0]); f.rect(x - 4, y - 36, 8, 14, c32(6, 10, 22)); disc(f, x, y - 42, 4, c32(24, 18, 12)); f.rect(x - 16, y - 62, 32, 3, WD[1]); f.rect(x - 16, y - 2, 32, 3, WD[2]);
  },
  index(f, x, y) {
    sh(f, x, y, 40); f.rect(x - 20, y - 56, 40, 40, WD[2]); f.rect(x - 18, y - 54, 36, 36, c32(24, 18, 11)); f.rect(x - 2, y - 16, 4, 16, WD[2]);
    for (const [px, py, c] of [[-14, -50, WH], [-2, -51, c32(30, 28, 20)], [9, -49, WH], [-13, -36, c32(30, 28, 20)], [0, -34, WH], [10, -35, c32(30, 28, 20)]]) { f.rect(x + px, y + py, 9, 11, c); f.rect(x + px + 2, y + py + 2, 5, 5, ST[1]); f.px(x + px + 4, y + py - 1, RED); }
    f.rect(x - 12, y - 38, 26, 1, RED); f.rect(x - 4, y - 52, 1, 40, c32(28, 6, 7)); f.rect(x - 10, y - 50, 14, 1, c32(28, 6, 7));
  },
  gallery(f, x, y, t) {
    sh(f, x, y, 44);
    for (const [px, py, w, h, c] of [[-20, -56, 18, 24, c32(24, 10, 10)], [2, -58, 20, 26, c32(8, 14, 26)], [-12, -28, 26, 16, c32(10, 22, 12)]]) { f.rect(x + px - 2, y + py - 2, w + 4, h + 4, GOLD[1]); f.rect(x + px - 1, y + py - 1, w + 2, h + 2, GOLD[2]); f.rect(x + px, y + py, w, h, c); disc(f, x + px + w / 2, y + py + h / 2 - 2, 4, c32(24, 18, 12)); f.rect(x + px + w / 2 - 5, y + py + h - 7, 10, 5, c32(6, 6, 12)); }
    f.rect(x - 1, y - 10, 2, 10, WD[2]); void t;
  },
  trophy(f, x, y, t) {
    sh(f, x, y, 40); f.rect(x - 18, y - 56, 36, 56, K); f.rect(x - 16, y - 54, 32, 50, GLASS[2]); f.rect(x - 16, y - 54, 32, 2, GLASS[1]);
    for (const yy of [-36, -18]) f.rect(x - 16, y + yy, 32, 2, WD[1]);
    for (const [px, py, s] of [[-10, -36, 1], [2, -36, 0], [-10, -18, 0], [2, -18, 1]]) { f.rect(x + px, y + py - 10, 8, 7, GOLD[1]); f.rect(x + px + 1, y + py - 10, 3, 2, GOLD[0]); f.rect(x + px + 3, y + py - 3, 2, 3, GOLD[2]); f.rect(x + px, y + py - 1, 8, 1, GOLD[2]); void s; }
    if (blink(t, 50, 4)) for (let i = 0; i < 3; i++) f.px(x - 12 + ((t >> 2) + i * 9) % 26, y - 50 + ((t >> 3) + i * 7) % 40, WH);
  },
  shop(f, x, y, t) {
    sh(f, x, y, 46); f.rect(x - 22, y - 26, 44, 26, WD[1]); f.rect(x - 22, y - 26, 44, 3, WD[0]); f.rect(x - 20, y - 22, 40, 2, WD[2]); f.rect(x - 22, y - 46, 44, 18, K);
    for (let i = 0; i < 5; i++) { const c = [GOLD[1], c32(29, 18, 9), c32(31, 31, 31)][i % 3]; disc(f, x - 16 + i * 8, y - 38, 3, c); f.rect(x - 17 + i * 8, y - 35, 2, 3, i & 1 ? RED : BLUE); }
    f.rect(x - 22, y - 48, 44, 3, RED); for (let i = 0; i < 44; i += 8) f.rect(x - 22 + i, y - 48, 4, 3, WH);
    f.rect(x + 10, y - 31, 7, 5, GOLD[1]); f.rect(x + 12, y - 33, 3, 2, GOLD[0]); void t;
  },
  tv(f, x, y, t) {
    sh(f, x, y, 40); f.rect(x - 16, y - 18, 32, 18, WD[2]); f.rect(x - 14, y - 16, 28, 2, WD[1]); f.rect(x - 18, y - 52, 36, 32, K); f.rect(x - 15, y - 49, 26, 26, c32(3, 3, 7));
    for (let j = 0; j < 12; j++) for (let i = 0; i < 13; i++) { const v = ((i * 7 + j * 13 + t) % 9) < 2; if (v) f.rect(x - 15 + i * 2, y - 49 + j * 2, 2, 2, ((i + j + (t >> 3)) & 3) === 0 ? WH : ST[0]); }
    f.rect(x - 15, y - 49, 26, 26, c32(3, 3, 7)); for (let j = 0; j < 12; j++) for (let i = 0; i < 13; i++) if (((i * 7 + j * 13 + (t >> 1)) % 9) < 3) f.rect(x - 15 + i * 2, y - 49 + j * 2, 2, 2, ((i + j + (t >> 3)) & 3) === 0 ? WH : ST[1]);
    f.rect(x + 13, y - 44, 3, 3, RED); f.rect(x + 13, y - 38, 3, 8, ST[1]); f.rect(x - 4, y - 60, 1, 8, ST[0]); f.rect(x + 4, y - 60, 1, 8, ST[0]); f.rect(x - 4, y - 61, 9, 1, ST[0]);
  },
  jukebox(f, x, y, t) {
    sh(f, x, y, 38); f.rect(x - 16, y - 56, 32, 56, c32(22, 5, 8)); f.rect(x - 14, y - 58, 28, 4, c32(27, 9, 10));
    for (let yy = 0; yy < 20; yy++) { const w = Math.round(15 * Math.sqrt(1 - ((yy - 20) / 20) ** 2) ); f.rect(x - w, y - 62 + yy, w * 2, 1, c32(22, 5, 8)); }
    f.rect(x - 11, y - 50, 22, 20, K); f.rect(x - 9, y - 48, 18, 16, c32(9, 13, 24));
    for (let i = 0; i < 6; i++) f.rect(x - 8 + i * 3, y - 47 + ((t >> 2) + i * 2) % 12, 2, 3, [c32(31, 28, 6), c32(6, 28, 16), c32(31, 10, 20)][i % 3]);
    for (let i = 0; i < 5; i++) f.rect(x - 11 + i * 5, y - 26, 4, 3, blink(t + i * 7, 10, 2) ? c32(31, 28, 8) : c32(18, 12, 3));
    f.rect(x - 8, y - 18, 16, 10, c32(9, 3, 5)); f.rect(x - 6, y - 16, 12, 6, K); f.rect(x - 16, y - 4, 32, 4, c32(14, 3, 5));
  },
  desk(f, x, y, t) {
    sh(f, x, y, 48); f.rect(x - 22, y - 22, 44, 4, WD[0]); f.rect(x - 22, y - 18, 44, 18, WD[1]); f.rect(x - 20, y - 16, 12, 14, WD[2]); f.rect(x - 7, y - 16, 12, 14, WD[2]); f.rect(x - 18, y - 12, 8, 2, GOLD[1]); f.rect(x - 4, y - 12, 8, 2, GOLD[1]);
    f.rect(x + 8, y - 34, 2, 12, ST[1]); f.rect(x + 2, y - 36, 12, 4, c32(6, 18, 10)); f.rect(x + 3, y - 32, 10, 1, blink(t, 60, 20) ? c32(31, 31, 20) : ST[2]); f.rect(x - 14, y - 26, 14, 4, c32(30, 29, 24)); f.rect(x - 12, y - 25, 10, 1, K); f.rect(x - 20, y - 30, 6, 8, c32(9, 14, 24)); f.rect(x + 14, y - 26, 7, 4, K);
  },
  plaque(f, x, y) { sh(f, x, y, 24); f.rect(x - 2, y - 26, 4, 26, WD[2]); f.rect(x - 16, y - 50, 32, 26, WD[1]); f.rect(x - 15, y - 49, 30, 24, WD[0]); f.rect(x - 12, y - 45, 24, 2, K); f.rect(x - 12, y - 39, 24, 2, K); f.rect(x - 12, y - 33, 16, 2, K); },
  records(f, x, y) { sh(f, x, y, 52); f.rect(x - 24, y - 60, 48, 44, K); f.rect(x - 22, y - 58, 44, 40, c32(5, 14, 8)); for (let i = 0; i < 5; i++) { f.rect(x - 19, y - 54 + i * 7, 4, 4, i ? c32(31, 28, 12) : RED); f.rect(x - 12, y - 53 + i * 7, 18 - (i % 3) * 3, 1, WH); f.rect(x + 8, y - 53 + i * 7, 10, 1, c32(20, 28, 20)); } f.rect(x - 2, y - 16, 4, 16, WD[2]); f.rect(x - 24, y - 62, 48, 3, WD[1]); },
  // an arched door into one of the modes' events. o.style (DOOR_STYLES) gives each event its own frame, its own light inside and an emblem
  // over the arch, so the doors of one hall tell their events apart at a glance
  archdoor(f, x, y, t, o) {
    const S = DOOR_STYLES[o && o.style] || DOOR_STYLES.plain, lock = o && o.locked;
    const [fr, frD] = S.frame, [inA, inB] = S.inside;
    sh(f, x, y, 42);
    f.rect(x - 18, y - 56, 36, 56, K); for (let j = 0; j < 14; j++) { const w = Math.round(18 * Math.sqrt(1 - ((j - 14) / 14) ** 2)); f.rect(x - w, y - 70 + j, w * 2, 1, K); }
    // the inside, in the event's own light
    for (let j = 0; j < 66; j++) { const yy = y - 66 + j, w = j < 12 ? Math.round(15 * Math.sqrt(1 - ((j - 12) / 12) ** 2)) : 15; f.rect(x - w, yy, w * 2, 1, lock ? c32(6, 6, 9) : S.bands ? S.bands[Math.floor(j / 11) % S.bands.length] : j & 4 ? inA : inB); }
    if (!lock && S.inner) S.inner(f, x, y, t);
    // the frame: two pillars and the arch, in the event's material
    f.rect(x - 18, y - 56, 3, 56, fr); f.rect(x + 15, y - 56, 3, 56, fr); f.rect(x - 18, y - 56, 1, 56, frD); f.rect(x + 17, y - 56, 1, 56, frD);
    for (let a = 0; a <= 24; a++) { const q = Math.PI * (a / 24), ax = Math.round(x - Math.cos(q) * 17), ay = Math.round(y - 56 - Math.sin(q) * 14); f.rect(ax - 1, ay - 1, 3, 3, a & 1 ? fr : frD); }
    f.rect(x - 20, y - 3, 40, 3, fr); f.rect(x - 20, y - 1, 40, 1, frD);
    // the emblem over the arch, on a plate
    f.rect(x - 9, y - 84, 18, 14, K); f.rect(x - 8, y - 83, 16, 12, fr); f.rect(x - 7, y - 82, 14, 10, frD);
    if (S.emblem) S.emblem(f, x, y - 77, t);
    if (!lock) for (let i = 0; i < 6; i++) f.rect(x - 14 + i * 5, y - 50 + (((t >> 2) + i * 3) % 40), 1, 3, S.spark || c32(31, 29, 14));
  },
  crown(f, x, y, t) { sh(f, x, y, 34); f.rect(x - 14, y - 10, 28, 10, ST[1]); f.rect(x - 14, y - 10, 28, 2, ST[0]); f.rect(x - 10, y - 26, 20, 16, GOLD[1]); f.rect(x - 10, y - 26, 20, 2, GOLD[0]); for (const dx of [-10, -3, 4]) { f.rect(x + dx, y - 34, 6, 10, GOLD[1]); f.rect(x + dx, y - 34, 6, 2, GOLD[0]); } disc(f, x, y - 18, 2, blink(t, 14, 1) ? c32(28, 6, 7) : c32(8, 26, 28)); f.rect(x - 10, y - 12, 20, 2, GOLD[2]); },
  tapes(f, x, y, t) { sh(f, x, y, 40); f.rect(x - 18, y - 52, 36, 52, WD[2]); for (let r = 0; r < 4; r++) { f.rect(x - 16, y - 50 + r * 12, 32, 2, WD[1]); for (let i = 0; i < 6; i++) { const c = [c32(28, 6, 7), c32(6, 12, 26), c32(24, 20, 4), c32(6, 22, 12), c32(20, 8, 26), WH][(i + r) % 6]; f.rect(x - 15 + i * 5, y - 46 + r * 12, 4, 9, c); f.rect(x - 15 + i * 5, y - 46 + r * 12, 4, 1, WH); } } void t; },
  plant(f, x, y) { sh(f, x, y, 18); f.rect(x - 5, y - 10, 10, 10, WD[1]); f.rect(x - 5, y - 10, 10, 2, WD[0]); for (const [dx, dy, w] of [[-7, -22, 6], [-2, -28, 6], [3, -21, 6], [-4, -18, 8]]) { f.rect(x + dx, y + dy, w, 10, c32(6, 18, 7)); f.rect(x + dx, y + dy, 2, 10, c32(10, 24, 10)); } },
  bench(f, x, y) { sh(f, x, y, 42); f.rect(x - 20, y - 14, 40, 5, WD[0]); f.rect(x - 20, y - 14, 40, 1, WD[0]); f.rect(x - 18, y - 9, 4, 9, WD[2]); f.rect(x + 14, y - 9, 4, 9, WD[2]); f.rect(x - 6, y - 26, 12, 12, ST[1]); f.rect(x - 14, y - 22, 8, 4, ST[1]); f.rect(x + 6, y - 22, 8, 4, ST[1]); },
  weights(f, x, y) { sh(f, x, y, 34); for (const dx of [-10, 8]) { f.rect(x + dx - 6, y - 12, 12, 12, K); f.rect(x + dx - 5, y - 11, 10, 10, ST[1]); } f.rect(x - 16, y - 28, 32, 3, ST[0]); f.rect(x - 18, y - 32, 5, 11, K); f.rect(x + 13, y - 32, 5, 11, K); },
  podium(f, x, y, t, o) {
    // three steps; the top is where the fighter stands. o.w widens it for a selected fighter
    const w = (o && o.w) || 34;
    f.rect(x - w / 2 - 6, y - 4, w + 12, 4, o && o.dim ? c32(9, 9, 11) : ST[2]); f.rect(x - w / 2 - 3, y - 9, w + 6, 5, ST[1]); f.rect(x - w / 2, y - 14, w, 5, ST[0]); f.rect(x - w / 2, y - 14, w, 1, WH);
    f.rect(x - w / 2 + 2, y - 8, w - 4, 1, ST[2]);
    void t;
  },
};

export function drawProp(f, name, x, y, t, o = {}) {
  const fn = P[name] || P.plaque;
  if (o.locked) {
    // a locked station is drawn, then a dither of dark over it (a dust sheet)
    fn(f, x, y, t, o);
    for (let j = -72; j <= 2; j++) for (let i = -28; i <= 28; i++) if (bayer(x + i, y + j) < 0.6) { const px = x + i, py = y + j; if (px >= 0 && px < f.w && py >= 0 && py < f.h) { const v = f.buf[py * f.w + px]; if (v) f.buf[py * f.w + px] = dim(v); } }
    return;
  }
  fn(f, x, y, t, o);
}
// a colour dragged toward dark blue-grey: one of the game's 15-bit colours again (5 bits a channel)
function dim(v) { const r = v & 255, g = (v >> 8) & 255, b = (v >> 16) & 255, q = (x, add) => Math.min(31, Math.round((x >> 3) * 0.28) + add); return c32(q(r, 2), q(g, 2), q(b, 4)); }
export const PROP_NAMES = Object.keys(P);
export { textWidth };
