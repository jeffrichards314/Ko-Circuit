// Idle-pose size of every fighter (bounding box of drawn pixels, in screen
// pixels): a quick check that bodies stay near the ~120 px guideline and differ.
//   node tools/sprite-sizes.mjs [ids...]
import { FIGHTERS } from '../data/fighters/index.js';
import { fighterSprites } from '../src/engine/spriteCache.js';

const ids = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const rows = [];
for (const [id, d] of Object.entries(FIGHTERS)) {
  if (ids.length && !ids.includes(id)) continue;
  const bank = fighterSprites(d.spriteLayers);
  const s = bank.get(d.anims.idle.frames ? d.anims.idle.frames[0] : d.anims.idle[0]);
  let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if (s.data[y * s.w + x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  // (sprites are trimmed: one that reaches the canvas edge was cut off there)
  const C = bank.build.canvas;
  const clipTop = s.ay >= C.ay ? ' CLIPPED TOP' : '', clipSide = s.ax >= C.ax || s.w - s.ax >= C.w - C.ax ? ' CLIPPED SIDE' : '';
  rows.push(`${id.padEnd(10)} ${bank.build.id.padEnd(16)} ${String(y1 - y0 + 1).padStart(4)} tall ${String(x1 - x0 + 1).padStart(4)} wide${clipTop}${clipSide}`);
}
console.log(rows.join('\n'));
