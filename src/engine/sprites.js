// Code-generated sprite pipeline.
//
// Sprites are built from parts. Each part is a Mask (a 1-bit shape made of
// primitives), a material ramp (palette indices, light -> dark) and a bevel
// radius. The part is auto-shaded with stepped cel bands from a fixed light,
// outlined, and casts a one-step shadow onto the parts behind it. Hand-placed
// detail (faces, stitching, buttons) goes on top. The result is a palette-index
// grid, so the engine never blends, and palette swaps are free.

export const LIGHT = norm([-0.45, -0.55, 0.7]);
export const LEVELS = [0.86, 0.5, 0.14]; // lambert thresholds: hi | base | shade | deep

function norm(v) {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
}

// ---------------------------------------------------------------------------
// Mask: 1-bit shape with pixel-center rasterized primitives.
// ---------------------------------------------------------------------------
export class Mask {
  constructor(w, h) {
    this.w = w; this.h = h;
    this.d = new Uint8Array(w * h);
  }
  in(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h && this.d[y * this.w + x] === 1;
  }
  set(x, y, v = 1) {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = v;
    return this;
  }
  rect(x, y, w, h, v = 1) {
    for (let j = Math.round(y); j < Math.round(y + h); j++)
      for (let i = Math.round(x); i < Math.round(x + w); i++) this.set(i, j, v);
    return this;
  }
  // Ellipse, optionally rotated by `angle` (radians).
  ellipse(cx, cy, rx, ry, v = 1, angle = 0) {
    const ca = Math.cos(angle), sa = Math.sin(angle);
    const R = Math.max(rx, ry) + 1;
    for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++) {
      for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
        const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
        const u = dx * ca + dy * sa, w = -dx * sa + dy * ca;
        if ((u * u) / (rx * rx) + (w * w) / (ry * ry) <= 1) this.set(x, y, v);
      }
    }
    return this;
  }
  // Tapered capsule from (x0,y0) radius r0 to (x1,y1) radius r1.
  capsule(x0, y0, x1, y1, r0, r1 = r0, v = 1) {
    const minx = Math.floor(Math.min(x0 - r0, x1 - r1)) - 1, maxx = Math.ceil(Math.max(x0 + r0, x1 + r1)) + 1;
    const miny = Math.floor(Math.min(y0 - r0, y1 - r1)) - 1, maxy = Math.ceil(Math.max(y0 + r0, y1 + r1)) + 1;
    const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy || 1;
    for (let y = miny; y <= maxy; y++) {
      for (let x = minx; x <= maxx; x++) {
        const px = x + 0.5 - x0, py = y + 0.5 - y0;
        const t = Math.max(0, Math.min(1, (px * dx + py * dy) / L2));
        const ex = px - dx * t, ey = py - dy * t;
        const r = r0 + (r1 - r0) * t;
        if (ex * ex + ey * ey <= r * r) this.set(x, y, v);
      }
    }
    return this;
  }
  // Polygon fill (even-odd, pixel centers).
  poly(pts, v = 1) {
    let miny = Infinity, maxy = -Infinity;
    for (const [, y] of pts) { miny = Math.min(miny, y); maxy = Math.max(maxy, y); }
    for (let y = Math.floor(miny); y <= Math.ceil(maxy); y++) {
      const cy = y + 0.5, xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= cy && by > cy) || (by <= cy && ay > cy)) xs.push(ax + ((cy - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.ceil(xs[k] - 0.5); x <= Math.floor(xs[k + 1] - 0.5); x++) this.set(x, y, v);
      }
    }
    return this;
  }
  // ASCII stamp: any char in `on` sets the pixel.
  stamp(rows, x, y, on = '#', v = 1, flip = false) {
    const w = Math.max(...rows.map((r) => r.length));
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        if (on.includes(row[i])) this.set(Math.round(x) + (flip ? w - 1 - i : i), Math.round(y) + j, v);
      }
    });
    return this;
  }
  add(m) { for (let i = 0; i < this.d.length; i++) if (m.d[i]) this.d[i] = 1; return this; }
  cut(m) { for (let i = 0; i < this.d.length; i++) if (m.d[i]) this.d[i] = 0; return this; }
  clip(m) { for (let i = 0; i < this.d.length; i++) if (!m.d[i]) this.d[i] = 0; return this; }
  copy() { const m = new Mask(this.w, this.h); m.d.set(this.d); return m; }
  empty() { return !this.d.some((v) => v); }
  // Shift contents by (dx, dy).
  shifted(dx, dy) {
    const m = new Mask(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.d[y * this.w + x]) m.set(x + dx, y + dy);
    return m;
  }
}

// ---------------------------------------------------------------------------
// SpriteCanvas: a "G-buffer" per pixel: material ramp + shade level, or an
// explicit palette index. Final colors are resolved in toSprite().
// ---------------------------------------------------------------------------
export class SpriteCanvas {
  constructor(w, h, outline) {
    this.w = w; this.h = h;
    this.outline = outline; // palette index of the dark outline
    this.idx = new Uint8Array(w * h);  // explicit color (when ramp === 0)
    this.ramp = new Uint8Array(w * h); // ramp id (0 = explicit)
    this.lvl = new Uint8Array(w * h);
    this.ramps = [null];
    this.rampIds = new Map();
  }

  rampId(r) {
    const key = r.join(',');
    if (!this.rampIds.has(key)) { this.ramps.push(r); this.rampIds.set(key, this.ramps.length - 1); }
    return this.rampIds.get(key);
  }
  filled(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return false;
    const i = y * this.w + x;
    return this.ramp[i] > 0 || this.idx[i] > 0;
  }

  // Draw a shaded part. opts:
  //  ramp: palette indices light->dark (2-4 entries)
  //  bevel: rounding radius in px (big = round form, small = flat plane)
  //  inner: 'line' | 'soft' | 'none'  (line drawn where this part overlaps others)
  //  shadow: cast a 1-step shadow on parts behind (default true)
  //  bias: brightness offset, light: custom light vector, levels: thresholds
  part(mask, opts) {
    const { w, h } = this;
    const rid = this.rampId(opts.ramp);
    const bevel = opts.bevel ?? 4;
    const L = opts.light || LIGHT;
    const T = opts.levels || LEVELS;
    const bias = opts.bias || 0;
    const inner = opts.inner || 'line';

    // 1. cast shadow onto what is already there
    if (opts.shadow !== false) {
      const [sx, sy] = opts.shadowOffset || [1, 2];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          if (this.ramp[i] && !mask.d[i] && mask.in(x - sx, y - sy)) this.lvl[i] = Math.min(this.lvl[i] + 1, 3);
        }
      }
    }

    // 2. lighting from a beveled height field
    const hgt = heightField(mask, bevel);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (!mask.d[i]) continue;
        const hl = x > 0 ? hgt[i - 1] : 0, hr = x < w - 1 ? hgt[i + 1] : 0;
        const hu = y > 0 ? hgt[i - w] : 0, hd = y < h - 1 ? hgt[i + w] : 0;
        const n = norm([(hl - hr) / 2, (hu - hd) / 2, 1]);
        const l = n[0] * L[0] + n[1] * L[1] + n[2] * L[2] + bias;
        const lv = l > T[0] ? 0 : l > T[1] ? 1 : l > T[2] ? 2 : 3;
        this.ramp[i] = rid; this.lvl[i] = lv; this.idx[i] = 0;
      }
    }

    // 3. outline
    if (opts.outline !== false) {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          if (mask.d[i]) continue;
          if (!(mask.in(x - 1, y) || mask.in(x + 1, y) || mask.in(x, y - 1) || mask.in(x, y + 1))) continue;
          if (!this.filled(x, y)) { this.ramp[i] = 0; this.idx[i] = this.outline; }
          else if (inner === 'line') { this.ramp[i] = 0; this.idx[i] = this.outline; }
          else if (inner === 'soft') {
            if (this.ramp[i]) this.lvl[i] = Math.min(this.lvl[i] + 2, 3);
          }
        }
      }
    }
    return this;
  }

  // Flat fill with an explicit color (no shading), optional outline.
  flat(mask, color, outline = false) {
    for (let i = 0; i < mask.d.length; i++) if (mask.d[i]) { this.ramp[i] = 0; this.idx[i] = color; }
    if (outline) {
      const { w, h } = this;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (mask.d[i]) continue;
        if (mask.in(x - 1, y) || mask.in(x + 1, y) || mask.in(x, y - 1) || mask.in(x, y + 1)) { this.ramp[i] = 0; this.idx[i] = this.outline; }
      }
    }
    return this;
  }

  // --- detail painting ---
  px(x, y, color) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = y * this.w + x;
    this.ramp[i] = 0; this.idx[i] = color;
  }
  // Darken (n>0) or lighten (n<0) a shaded pixel; explicit colors are untouched.
  shade(x, y, n = 1) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = y * this.w + x;
    if (this.ramp[i]) this.lvl[i] = Math.max(0, Math.min(3, this.lvl[i] + n));
  }
  // Set the shade level of a shaded pixel directly (keeps its material).
  level(x, y, lv) {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = y * this.w + x;
    if (this.ramp[i]) this.lvl[i] = lv;
  }
  line(x0, y0, x1, y1, fn) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      fn(x0, y0);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  // Stamp ASCII art. map: char -> palette index | {shade:n} | {level:n}
  stamp(rows, x, y, map, flip = false) {
    const w = Math.max(...rows.map((r) => r.length));
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const m = map[row[i]];
        if (m === undefined) continue;
        const X = Math.round(x) + (flip ? w - 1 - i : i), Y = Math.round(y) + j;
        if (typeof m === 'number') this.px(X, Y, m);
        else if (m.shade !== undefined) this.shade(X, Y, m.shade);
        else if (m.level !== undefined) this.level(X, Y, m.level);
      }
    });
  }

  resolve() {
    const out = new Uint8Array(this.w * this.h);
    for (let i = 0; i < out.length; i++) {
      if (this.ramp[i]) {
        const r = this.ramps[this.ramp[i]];
        out[i] = r[Math.min(this.lvl[i], r.length - 1)];
      } else out[i] = this.idx[i];
    }
    return out;
  }

  // Convert to a compact sprite, trimmed to content. (ax, ay) is the anchor in
  // canvas coords; it is carried into the trimmed sprite.
  toSprite(ax = 0, ay = 0, trim = true) {
    const data = this.resolve();
    return makeSprite(data, this.w, this.h, ax, ay, trim);
  }
}

export function makeSprite(data, w, h, ax = 0, ay = 0, trim = true) {
  let x0 = 0, y0 = 0, x1 = w - 1, y1 = h - 1;
  if (trim) {
    x0 = w; y0 = h; x1 = -1; y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (data[y * w + x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    }
    if (x1 < 0) { x0 = 0; y0 = 0; x1 = 0; y1 = 0; }
  }
  const sw = x1 - x0 + 1, sh = y1 - y0 + 1;
  const out = new Uint8Array(sw * sh);
  for (let y = 0; y < sh; y++) out.set(data.subarray((y + y0) * w + x0, (y + y0) * w + x0 + sw), y * sw);
  return { w: sw, h: sh, data: out, ax: ax - x0, ay: ay - y0 };
}

// Sprite straight from ASCII rows. map: char -> palette index.
export function spriteFromRows(rows, map, ax = 0, ay = 0) {
  const w = Math.max(...rows.map((r) => r.length)), h = rows.length;
  const data = new Uint8Array(w * h);
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) data[y * w + x] = map[row[x]] || 0;
  });
  return { w, h, data, ax, ay };
}

// Beveled height field from a chamfer distance transform.
function heightField(mask, R) {
  const { w, h, d } = mask;
  const dist = new Float32Array(w * h);
  const BIG = 1e6;
  for (let i = 0; i < d.length; i++) dist[i] = d[i] ? BIG : 0;
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : dist[y * w + x]);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (!d[i]) continue;
    dist[i] = Math.min(dist[i], at(x - 1, y) + 3, at(x, y - 1) + 3, at(x - 1, y - 1) + 4, at(x + 1, y - 1) + 4);
  }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
    const i = y * w + x;
    if (!d[i]) continue;
    dist[i] = Math.min(dist[i], at(x + 1, y) + 3, at(x, y + 1) + 3, at(x + 1, y + 1) + 4, at(x - 1, y + 1) + 4);
  }
  const hgt = new Float32Array(w * h);
  for (let i = 0; i < d.length; i++) {
    if (!d[i]) continue;
    const e = dist[i] / 3 - 0.5;
    const t = Math.min(Math.max(e / R, 0), 1);
    hgt[i] = R * Math.sqrt(1 - (1 - t) * (1 - t));
  }
  return hgt;
}
