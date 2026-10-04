// Shards (spec §18 A2, A4): a sprite cut into pieces that fly apart. Used by the shatter
// cutscene (ZERO comes apart after the first fight) and the Pantheon entry (the pieces
// scatter through the sky). Everything is palette-index pixels: a shard is the set of a
// sprite's pixels nearest one seed point, moved and turned about its own centre by
// inverse mapping (every destination pixel looks up its source pixel, so a turned shard
// has no holes), never blended.

const rng = (seed) => { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };

// Cut sprite `s` (a palette-index sprite: w, h, ax, ay, data) into `n` shards.
// Each has a velocity (px per frame, away from the sprite's middle), a spin and a centre.
export function cutShards(s, n = 14, seed = 7) {
  const R = rng(seed);
  const solid = [];
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if (s.data[y * s.w + x]) solid.push([x, y]);
  if (!solid.length) return { s, label: new Int16Array(s.w * s.h).fill(-1), shards: [] };
  // seeds: spread over the body with a bias to the middle, each with a random "weight" so the pieces are ragged
  const seeds = [];
  for (let i = 0; i < n; i++) {
    const p = solid[Math.floor(R() * solid.length)];
    seeds.push({ x: p[0], y: p[1], w: 0.75 + R() * 0.7 });
  }
  const label = new Int16Array(s.w * s.h).fill(-1);
  const acc = seeds.map(() => ({ sx: 0, sy: 0, n: 0 }));
  for (const [x, y] of solid) {
    let best = 0, bd = Infinity;
    seeds.forEach((sd, i) => { const d = (((x - sd.x) ** 2 + (y - sd.y) ** 2) * sd.w) + (R() * 6); if (d < bd) { bd = d; best = i; } });
    label[y * s.w + x] = best;
    acc[best].sx += x; acc[best].sy += y; acc[best].n++;
  }
  const mx = solid.reduce((a, p) => a + p[0], 0) / solid.length, my = solid.reduce((a, p) => a + p[1], 0) / solid.length;
  const shards = [];
  acc.forEach((a, i) => {
    if (!a.n) return;
    const cx = a.sx / a.n, cy = a.sy / a.n;
    let dx = cx - mx, dy = cy - my;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
    let rad = 0;
    for (const [x, y] of solid) if (label[y * s.w + x] === i) rad = Math.max(rad, Math.hypot(x - cx, y - cy));
    const speed = 0.5 + R() * 1.5;
    shards.push({
      id: i, cx, cy, rad: Math.ceil(rad) + 2, n: a.n,
      vx: dx * speed + (R() - 0.5) * 0.5, vy: dy * speed * 0.8 - 0.35 - R() * 0.4, // (the void has no floor: they drift up and out)
      spin: (R() - 0.5) * 0.11, delay: Math.floor(R() * 10),
    });
  });
  return { s, label, shards };
}

// Draw the shards of `cut` (anchored like the sprite at (x, y)) `age` frames after the break.
// `fade` (0-1) thins them out with a dither (the scatter dissolving into the void).
export function drawShards(f, cut, x, y, pal, age, { fade = 0, ordered = null } = {}) {
  const { s, label, shards } = cut;
  const ox = Math.round(x) - s.ax, oy = Math.round(y) - s.ay;
  for (const sh of shards) {
    const a = Math.max(0, age - sh.delay);
    const px = sh.vx * a, py = sh.vy * a + 0.004 * a * a;
    const ang = sh.spin * a, cos = Math.cos(-ang), sin = Math.sin(-ang);
    const cx = ox + sh.cx + px, cy = oy + sh.cy + py;
    for (let j = -sh.rad; j <= sh.rad; j++) for (let i = -sh.rad; i <= sh.rad; i++) {
      // where this destination pixel comes from in the sprite
      const sx = Math.round(sh.cx + i * cos - j * sin), sy = Math.round(sh.cy + i * sin + j * cos);
      if (sx < 0 || sy < 0 || sx >= s.w || sy >= s.h || label[sy * s.w + sx] !== sh.id) continue;
      const v = s.data[sy * s.w + sx];
      if (!v) continue;
      const X = Math.round(cx + i), Y = Math.round(cy + j);
      if (fade > 0 && ordered && ordered(X, Y) >= 1 - fade) continue;
      f.px(X, Y, pal[v]);
    }
  }
}

// Cracks: jagged lines that grow out from a point over the sprite, `k` 0-1 (how far they've spread).
export function drawCracks(f, x, y, k, col, seed = 3, count = 7, reach = 46) {
  const R = rng(seed);
  for (let c = 0; c < count; c++) {
    let a = R() * Math.PI * 2, px = x, py = y;
    const len = reach * (0.5 + R() * 0.5) * k;
    for (let d = 0; d < len; d += 2) {
      a += (R() - 0.5) * 0.9;
      px += Math.cos(a) * 2; py += Math.sin(a) * 2;
      f.px(Math.round(px), Math.round(py), col);
      if ((d & 3) === 0) f.px(Math.round(px) + 1, Math.round(py), col);
    }
  }
}
