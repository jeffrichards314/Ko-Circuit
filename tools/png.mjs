// Tiny PNG writer for the headless art tools: a Uint32 ABGR buffer (the
// framebuffer's format), nearest-neighbour scaled.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };

export function writePNG(path, px, W, H, scale = 1) {
  const SW = W * scale, SH = H * scale;
  const raw = Buffer.alloc((SW * 4 + 1) * SH);
  for (let y = 0; y < SH; y++) {
    const o = y * (SW * 4 + 1);
    for (let x = 0; x < SW; x++) raw.writeUInt32LE((px[Math.floor(y / scale) * W + Math.floor(x / scale)] | 0xff000000) >>> 0, o + 1 + x * 4);
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(SW, 0); ihdr.writeUInt32BE(SH, 4); ihdr[8] = 8; ihdr[9] = 6;
  writeFileSync(path, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}
