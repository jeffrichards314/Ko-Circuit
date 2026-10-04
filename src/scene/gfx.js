// Scaled drawing for landmarks (spec §19 G1).
// A landmark is drawn in "units": x right, y down, (0, 0) the middle of its ground line, so a
// landmark is about 40 units wide and 36 high. The map draws it at k = 1 (a unit is a pixel);
// an arrival or a ceremony draws it at k = 3 or 4 (a unit is a 3x3 or 4x4 block) and the kit adds
// stepped shading: a box whose colour `key` has `keyHi` / `keySh` companions in the landmark's
// palette gets a light edge on its top and left and a dark one on its bottom and right. No
// blending, no anti-aliasing: every pixel is a palette colour (§2), a landmark palette is 15 colours.
import { c32 } from '../engine/palette.js';
import { drawText } from '../engine/font.js';

const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export const bayer = (x, y) => B4[(y & 3) * 4 + (x & 3)] / 16;

// A landmark palette: named 5-bit colours, at most 15 (the sprite/background palette rule).
export function landPalette(name, spec) {
  const keys = Object.keys(spec);
  if (keys.length > 15) throw new Error(`landmark palette ${name}: ${keys.length} colours (max 15)`);
  const u = {};
  for (const k of keys) u[k] = c32(...spec[k]);
  return { name, spec, keys, u };
}

export class Gfx {
  // f: a Frame; pal: a landPalette; (x, y): the screen pixel of the landmark's origin; k: pixels per unit
  constructor(f, pal, x, y, k = 1, t = 0, opts = {}) {
    this.f = f; this.pal = pal; this.x0 = x; this.y0 = y; this.k = k; this.t = t;
    this.big = k >= 2;
    this.shade = k >= 2 || !!opts.shade;           // stepped light and shade edges (always when big; asked for on the map)
    this.bev = k >= 4 ? 2 : 1;
    this.sil = opts.sil != null ? opts.sil : null; // draw everything in this one colour (a silhouette)
    this.dim = opts.dim || 0;                      // 0..1: dither the frame toward `dimCol` after drawing (night)
    this.lit = opts.lit !== false;                 // lights on
    this.state = opts.state || 'open';
  }
  col(key) {
    if (this.sil != null) return this.sil;
    if (typeof key === 'number') return key;
    const c = this.pal.u[key];
    if (c === undefined) throw new Error(`landmark ${this.pal.name}: no colour ${key}`);
    return c;
  }
  has(key) { return this.pal.u[key] !== undefined; }
  X(x) { return Math.round(this.x0 + x * this.k); }
  Y(y) { return Math.round(this.y0 + y * this.k); }

  // a box in units. Bevels at k >= 2 when the palette has keyHi / keySh.
  box(x, y, w, h, key, o = {}) {
    const f = this.f, k = this.k;
    const X0 = this.X(x), Y0 = this.Y(y), X1 = this.X(x + w), Y1 = this.Y(y + h);
    const pw = Math.max(1, X1 - X0), ph = Math.max(1, Y1 - Y0);
    f.rect(X0, Y0, pw, ph, this.col(key));
    if (this.shade && this.sil == null && !o.flat && typeof key === 'string' && this.has(key + 'Hi') && this.has(key + 'Sh') && pw > 2 && ph > 2) {
      const b = Math.min(this.bev, pw >> 1, ph >> 1) || 1;
      f.rect(X0, Y0, pw, b, this.col(key + 'Hi')); f.rect(X0, Y0, b, ph, this.col(key + 'Hi'));
      f.rect(X0, Y0 + ph - b, pw, b, this.col(key + 'Sh')); f.rect(X0 + pw - b, Y0, b, ph, this.col(key + 'Sh'));
    }
    void k;
  }
  // one unit-sized block (a lit window, a bulb)
  dot(x, y, key) { this.box(x, y, 1, 1, key, { flat: true }); }
  // a single native pixel, at a unit position (glints, sparks, rain)
  px(x, y, key) { this.f.px(this.X(x), this.Y(y), this.col(key)); }
  // a native-pixel rect at a unit position (detail that must stay 1px at any scale)
  nat(x, y, w, h, key) { this.f.rect(this.X(x), this.Y(y), w, h, this.col(key)); }
  ellipse(cx, cy, rx, ry, key, o = {}) {
    const f = this.f, k = this.k, col = this.col(key), X = this.X(cx), Y = this.Y(cy), RX = Math.max(1, Math.round(rx * k)), RY = Math.max(1, Math.round(ry * k));
    const hi = this.shade && this.sil == null && !o.flat && typeof key === 'string' && this.has(key + 'Hi') ? this.col(key + 'Hi') : null;
    const sh = this.shade && this.sil == null && !o.flat && typeof key === 'string' && this.has(key + 'Sh') ? this.col(key + 'Sh') : null;
    for (let y = -RY; y <= RY; y++) {
      const w = Math.round(RX * Math.sqrt(Math.max(0, 1 - (y * y) / (RY * RY))));
      f.rect(X - w, Y + y, w * 2 + 1, 1, col);
      if (hi && y < -RY * 0.55) f.rect(X - w, Y + y, Math.max(1, w >> 1), 1, hi);
      if (sh && y > RY * 0.5) f.rect(X + (w >> 1), Y + y, Math.max(1, w >> 1) + 1, 1, sh);
    }
  }
  disc(cx, cy, r, key, o = {}) { this.ellipse(cx, cy, r, r, key, o); }
  // 8x8 text, only where it can be read (a landmark seen big); a unit position, native-size letters
  text(str, x, y, key) { if (this.big) drawText({ px: (X, Y) => this.f.px(X, Y, this.col(key)) }, str, this.X(x), this.Y(y), 0, { mono: false }); }
  // the top half of an ellipse standing on y (domes, arches)
  dome(cx, y, rx, ry, key, o = {}) {
    const f = this.f, k = this.k, col = this.col(key), X = this.X(cx), Y = this.Y(y), RX = Math.max(1, Math.round(rx * k)), RY = Math.max(1, Math.round(ry * k));
    const hi = this.shade && this.sil == null && !o.flat && typeof key === 'string' && this.has(key + 'Hi') ? this.col(key + 'Hi') : null;
    const sh = this.shade && this.sil == null && !o.flat && typeof key === 'string' && this.has(key + 'Sh') ? this.col(key + 'Sh') : null;
    for (let j = 0; j < RY; j++) {
      const w = Math.round(RX * Math.sqrt(Math.max(0, 1 - ((RY - j) * (RY - j)) / (RY * RY))));
      f.rect(X - w, Y - RY + j, w * 2 + 1, 1, col);
      if (hi && j < RY * 0.45) f.rect(X - w, Y - RY + j, Math.max(1, w >> 1), 1, hi);
      if (sh && j > RY * 0.3) f.rect(X + (w >> 1), Y - RY + j, Math.max(1, w >> 1) + 1, 1, sh);
    }
  }
  // a filled polygon in units (roofs, spires, flags)
  poly(pts, key) {
    const f = this.f, col = this.col(key), P = pts.map(([x, y]) => [this.X(x), this.Y(y)]);
    let miny = Infinity, maxy = -Infinity;
    for (const [, y] of P) { miny = Math.min(miny, y); maxy = Math.max(maxy, y); }
    for (let y = miny; y <= maxy; y++) {
      const cy = y + 0.5, xs = [];
      for (let i = 0; i < P.length; i++) {
        const [ax, ay] = P[i], [bx, by] = P[(i + 1) % P.length];
        if ((ay <= cy && by > cy) || (by <= cy && ay > cy)) xs.push(ax + ((cy - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) f.rect(Math.ceil(xs[i] - 0.5), y, Math.max(1, Math.floor(xs[i + 1] - 0.5) - Math.ceil(xs[i] - 0.5) + 1), 1, col);
    }
  }
  tri(x0, y0, x1, y1, x2, y2, key) { this.poly([[x0, y0], [x1, y1], [x2, y2]], key); }
  // a line in units, `w` native pixels thick at k = 1 (thicker when scaled)
  line(x0, y0, x1, y1, key, w = 1) {
    const f = this.f, col = this.col(key), a = [this.X(x0), this.Y(y0)], b = [this.X(x1), this.Y(y1)];
    const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) || 1, th = Math.max(1, Math.round(w * this.k * 0.5));
    for (let i = 0; i <= n; i++) f.rect(Math.round(a[0] + ((b[0] - a[0]) * i) / n), Math.round(a[1] + ((b[1] - a[1]) * i) / n), th, th, col);
  }
  // a dithered patch (glow, fog, shadow): `density` 0..1 on a 4x4 Bayer matrix, in native pixels
  dither(x, y, w, h, key, density) {
    const f = this.f, col = this.col(key), X0 = this.X(x), Y0 = this.Y(y), X1 = this.X(x + w), Y1 = this.Y(y + h);
    for (let j = Y0; j < Y1; j++) for (let i = X0; i < X1; i++) if (bayer(i, j) < density) f.px(i, j, col);
  }
  // a dithered glow: stepped rings around a point
  glow(cx, cy, r, key, density = 0.5) {
    const f = this.f, col = this.col(key), X = this.X(cx), Y = this.Y(cy), R = Math.max(2, Math.round(r * this.k));
    for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
      const d = Math.sqrt(x * x + y * y) / R;
      if (d < 1 && bayer(X + x, Y + y) < (1 - d) * density * 0.85) f.px(X + x, Y + y, col);
    }
  }
  // a row of evenly spaced boxes (windows, columns, teeth); `lit(i)` may say which are lit
  row(x, y, n, w, h, gap, key, litKey, lit) {
    for (let i = 0; i < n; i++) this.box(x + i * (w + gap), y, w, h, lit && litKey && lit(i) ? litKey : key, { flat: true });
  }
  // a grid of windows: cols x rows, lit(i, j) picks the lit ones
  windows(x, y, cols, rows, w, h, gx, gy, dark, lite, lit) {
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) this.box(x + i * (w + gx), y + j * (h + gy), w, h, lit && lit(i, j) ? lite : dark, { flat: true });
  }
}
