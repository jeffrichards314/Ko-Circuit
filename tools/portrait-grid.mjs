// Headless portrait contact sheet: intro-card busts in a grid (for art review without a browser).
//   node tools/portrait-grid.mjs out.png stoker,brand,slag [--cols 5] [--s 3] [--pal fbrody:brody]
// (`--pal id:palette` draws a portrait in another fighter's palette; a fighter with a data file uses his own)
import { paletteFor } from '../src/engine/spriteCache.js';
import { FIGHTERS } from '../data/fighters/index.js';
import { PORTRAITS } from '../data/sprites/portraits.js';
import { writePNG } from './png.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const out = args[0], ids = args[1].split(','), cols = +opt('cols', 5), scale = +opt('s', 3);
const pals = Object.fromEntries((opt('pal', '') || '').split(',').filter(Boolean).map((x) => x.split(':')));
const cells = ids.map((id) => {
  const d = FIGHTERS[id], P = paletteFor(pals[id] || (d ? d.palette : id));
  return { s: PORTRAITS[id](P), pal: P.u32 };
});
const CW = 68, CH = 64, rows = Math.ceil(cells.length / cols), W = cols * CW + 4, H = rows * CH + 4;
const px = new Uint32Array(W * H).fill(0xffd0b8a8);
cells.forEach(({ s, pal }, i) => {
  const ox = 4 + (i % cols) * CW, oy = 4 + Math.floor(i / cols) * CH;
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) { const v = s.data[y * s.w + x]; if (v) px[(oy + y) * W + ox + x] = pal[v]; }
});
writePNG(out, px, W, H, scale);
console.log(`${out}: ${W * scale}x${H * scale}`);
