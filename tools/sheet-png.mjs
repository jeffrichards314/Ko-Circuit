// Headless pose sheet: renders fighters' poses to a PNG (for art review without a browser).
//   node tools/sheet-png.mjs out.png --f barney,kid --p idle1,hitHigh --s 3 [--pal name] [--td] [--alt]
//   (--f portrait:jax draws an intro-card portrait)
// Each fighter is one row; poses a fighter doesn't have are left blank.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fighterSprites, playerSprites, paletteFor } from '../src/engine/spriteCache.js';
import { FIGHTERS } from '../data/fighters/index.js';
import { remixed } from '../data/fighters/titleDefense.js';
import { PORTRAITS } from '../data/sprites/portraits.js';
import { ensureAltPalette } from '../data/palette.js';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const out = args[0];
const ids = opt('f', 'barney').split(',');
const poses = opt('p', 'idle1').split(',');
const scale = +opt('s', 2);
const TD = args.includes('--td');

const rows = ids.map((id) => {
  // portrait:<id> (palette = the fighter's, or the id itself)
  if (id.startsWith('portrait:')) { const k = id.slice(9), P = paletteFor((FIGHTERS[k] || { palette: k }).palette); return [{ s: PORTRAITS[k](P), pal: P.u32 }]; }
  const d = id === 'player' ? null : TD ? remixed(id) : FIGHTERS[id] || { spriteLayers: id, palette: id };
  const bank = id === 'player' ? playerSprites('spiky') : fighterSprites(d.spriteLayers);
  // --alt: his alternate palette (§16)
  const pal = paletteFor(args.includes('--alt') && d ? ensureAltPalette(d.palette) : opt('pal', id === 'player' ? 'player' : d.palette)).u32;
  return poses.map((p) => { try { return { s: bank.get(p), pal }; } catch { return null; } });
});
const colW = poses.map((_, c) => Math.max(8, ...rows.map((r) => (r[c] ? r[c].s.w : 0))) + 4);
const rowH = rows.map((r) => Math.max(8, ...r.map((x) => (x ? x.s.h : 0))) + 4);
const W = colW.reduce((a, b) => a + b, 4), H = rowH.reduce((a, b) => a + b, 4);
const px = new Uint32Array(W * H).fill(0xffd0b8a8);
let y0 = 2;
rows.forEach((r, ri) => {
  let x0 = 2;
  r.forEach((cell, ci) => {
    if (cell) {
      const { s, pal } = cell, oy = y0 + rowH[ri] - 2 - s.h, ox = x0 + ((colW[ci] - s.w) >> 1);
      for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) { const v = s.data[y * s.w + x]; if (v) px[(oy + y) * W + ox + x] = pal[v]; }
    }
    x0 += colW[ci];
  });
  y0 += rowH[ri];
});

// scale + encode (RGBA, little-endian ABGR u32 -> bytes)
const SW = W * scale, SH = H * scale;
const raw = Buffer.alloc((SW * 4 + 1) * SH);
for (let y = 0; y < SH; y++) {
  const o = y * (SW * 4 + 1);
  raw[o] = 0;
  for (let x = 0; x < SW; x++) {
    const v = px[Math.floor(y / scale) * W + Math.floor(x / scale)];
    raw.writeUInt32LE(v, o + 1 + x * 4);
  }
}
const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(SW, 0); ihdr.writeUInt32BE(SH, 4); ihdr[8] = 8; ihdr[9] = 6;
writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log(`${out}: ${SW}x${SH}`);
