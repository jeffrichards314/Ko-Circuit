// 256x224 native framebuffer (Uint32 per pixel) with palette-index blits, and a
// Display that integer-scales it to the window with nearest-neighbour.
// Nothing here blends: every pixel written is a palette color. The optional CRT
// filter (§1) is a display post-process on the scaled picture, never on the art:
//   1 SCANLINES  a dark line between the rows of native pixels
//   2 FULL CRT   scanlines, an RGB aperture grille, phosphor glow and a vignette

export const W = 256;
export const H = 224;

export class Frame {
  constructor(w = W, h = H) {
    this.w = w; this.h = h;
    this.buf = new Uint32Array(w * h);
    this.layer = new Uint8Array(w * h); // who owns each pixel (for see-through player)
  }
  clear(color) { this.buf.fill(color); this.layer.fill(0); }
  rect(x, y, w, h, color) {
    x = Math.round(x); y = Math.round(y);
    const x0 = Math.max(0, x), y0 = Math.max(0, y), x1 = Math.min(this.w, x + w), y1 = Math.min(this.h, y + h);
    if (x1 <= x0 || y1 <= y0) return; // (a rect wholly off the picture draws nothing: a negative end index would make fill() wrap round the whole buffer)
    for (let j = y0; j < y1; j++) this.buf.fill(color, j * this.w + x0, j * this.w + x1);
  }
  frameRect(x, y, w, h, color) {
    this.rect(x, y, w, 1, color); this.rect(x, y + h - 1, w, 1, color);
    this.rect(x, y, 1, h, color); this.rect(x + w - 1, y, 1, h, color);
  }
  px(x, y, color) {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.buf[y * this.w + x] = color;
  }
  // Draw a palette-index sprite with its anchor at (x, y).
  // opts: flip, layer (id written to the layer buffer), see (layer id to see
  //       through with a checker dither), keep (index never dithered, e.g. outline),
  //       solid (draw every non-zero pixel in one color), clipTop,
  //       dither (draw only every other pixel, checkerboard: ghosts, afterimages)
  blit(s, x, y, pal, opts = {}) {
    if (opts.scale && opts.scale !== 1) return this.blitScaled(s, x, y, pal, opts);
    const flip = !!opts.flip;
    const ox = Math.round(x) - (flip ? s.w - 1 - s.ax : s.ax);
    const oy = Math.round(y) - s.ay;
    const { w, h, buf, layer } = this;
    const L = opts.layer || 0, see = opts.see || 0, keep = opts.keep || 0, solid = opts.solid;
    const clipTop = opts.clipTop ?? 0, dither = opts.dither ? 1 : 0;
    for (let j = 0; j < s.h; j++) {
      const Y = oy + j;
      if (Y < clipTop || Y >= h) continue;
      const row = j * s.w;
      for (let i = 0; i < s.w; i++) {
        const X = ox + i;
        if (X < 0 || X >= w) continue;
        const v = s.data[row + (flip ? s.w - 1 - i : i)];
        if (!v || (dither && ((X + Y) & 1))) continue;
        const k = Y * w + X;
        if (see && layer[k] === see && v !== keep && ((X + Y) & 1)) continue;
        buf[k] = solid !== undefined ? solid : pal[v];
        if (L) layer[k] = L;
      }
    }
  }
  // A sprite drawn smaller (opts.scale < 1), nearest-neighbour around its anchor:
  // pixels are dropped, never blended (an opponent backing off up the ring).
  blitScaled(s, x, y, pal, opts) {
    const k = opts.scale, flip = !!opts.flip;
    const dw = Math.max(1, Math.round(s.w * k)), dh = Math.max(1, Math.round(s.h * k));
    const ax = flip ? s.w - 1 - s.ax : s.ax;
    const ox = Math.round(x - ax * k), oy = Math.round(y - s.ay * k);
    const { w, h, buf, layer } = this;
    const L = opts.layer || 0, dither = opts.dither ? 1 : 0;
    for (let j = 0; j < dh; j++) {
      const Y = oy + j;
      if (Y < 0 || Y >= h) continue;
      const row = Math.min(s.h - 1, Math.floor(j / k)) * s.w;
      for (let i = 0; i < dw; i++) {
        const X = ox + i;
        if (X < 0 || X >= w) continue;
        const si = Math.min(s.w - 1, Math.floor(i / k));
        const v = s.data[row + (flip ? s.w - 1 - si : si)];
        if (!v || (dither && ((X + Y) & 1))) continue;
        buf[Y * w + X] = opts.solid !== undefined ? opts.solid : pal[v];
        if (L) layer[Y * w + X] = L;
      }
    }
  }
  // Full-screen index buffer (arena backgrounds).
  blitIndexed(data, pal, y0 = 0, y1 = this.h) {
    const { w, buf } = this;
    for (let i = y0 * w; i < y1 * w; i++) { const v = data[i]; if (v) buf[i] = pal[v]; }
  }
}

export class Display {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.off = document.createElement('canvas');
    this.off.width = W; this.off.height = H;
    this.offCtx = this.off.getContext('2d');
    this.img = this.offCtx.createImageData(W, H);
    this.frame = new Frame();
    this.frame.buf = new Uint32Array(this.img.data.buffer);
    this.fixedScale = 0;
    this.crt = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  // Largest integer scale that fits (in device pixels), or a fixed scale.
  resize() {
    const dpr = window.devicePixelRatio || 1;
    const box = this.canvas.parentElement.getBoundingClientRect();
    const avail = Math.min((box.width || window.innerWidth) * dpr / W, (box.height || window.innerHeight) * dpr / H);
    const s = this.fixedScale || Math.max(1, Math.floor(avail + 0.01)); // (+0.01: a box sized to exactly N scales must not floor to N-1)
    this.scale = s;
    this.canvas.width = W * s; this.canvas.height = H * s;
    this.canvas.style.width = `${(W * s) / dpr}px`;
    this.canvas.style.height = `${(H * s) / dpr}px`;
    this.ctx.imageSmoothingEnabled = false;
    this.overlay = null; // rebuilt for the new size
  }

  setCRT(level) { this.crt = level | 0; this.overlay = null; }
  // a point in the page (a tap or a click) as a point of the native 256x224 picture, or null outside it
  toNative(clientX, clientY) {
    const r = this.canvas.getBoundingClientRect();
    if (!r.width || clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) return null;
    return { x: Math.floor(((clientX - r.left) / r.width) * W), y: Math.floor(((clientY - r.top) / r.height) * H) };
  }

  // The CRT overlay for the current scale: scanlines (+ grille and vignette).
  buildOverlay() {
    const s = this.scale, w = W * s, h = H * s;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    if (s >= 2) {
      // the last device row (two from 5x up) of every native row is the dark gap
      const gap = s >= 5 ? 2 : 1;
      g.fillStyle = `rgba(0,0,0,${this.crt === 2 ? 0.55 : 0.4})`;
      for (let y = 0; y < H; y++) g.fillRect(0, y * s + s - gap, w, gap);
      if (s >= 3) { g.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = 0; y < H; y++) g.fillRect(0, y * s, w, 1); }
    }
    if (this.crt === 2) {
      if (s >= 3) {
        const tint = ['rgba(255,0,0,0.07)', 'rgba(0,255,0,0.07)', 'rgba(0,0,255,0.07)'];
        for (let x = 0; x < w; x++) { g.fillStyle = tint[x % 3]; g.fillRect(x, 0, 1, h); }
      }
      const v = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.72);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(0,0,0,0.5)');
      g.fillStyle = v; g.fillRect(0, 0, w, h);
      // a half-size copy of the picture, smoothed back up, is the phosphor glow
      this.glow = document.createElement('canvas');
      this.glow.width = W / 2; this.glow.height = H / 2;
    }
    this.overlay = c;
  }
  present(shakeX = 0, shakeY = 0) {
    this.offCtx.putImageData(this.img, 0, 0);
    const s = this.scale, ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    if (shakeX || shakeY) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W * s, H * s); }
    const dx = Math.round(shakeX) * s, dy = Math.round(shakeY) * s;
    ctx.drawImage(this.off, dx, dy, W * s, H * s);
    if (!this.crt) return;
    if (!this.overlay) this.buildOverlay();
    if (this.crt === 2 && this.glow) {
      const gc = this.glow.getContext('2d');
      gc.imageSmoothingEnabled = true;
      gc.clearRect(0, 0, W / 2, H / 2);
      gc.drawImage(this.off, 0, 0, W / 2, H / 2);
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.22;
      ctx.drawImage(this.glow, dx, dy, W * s, H * s);
      ctx.restore();
    }
    ctx.drawImage(this.overlay, 0, 0);
  }
}
