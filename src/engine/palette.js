// SNES 15-bit color helpers.
// Every color in the game is built from 5-bit channels (0-31) and converted to
// 8-bit by x8, exactly as the spec (§2) requires. Palettes hold at most 15 colors
// plus transparent (index 0).

const SIZE = 15;

export function rgb15(r, g, b) {
  for (const v of [r, g, b]) {
    if (!Number.isInteger(v) || v < 0 || v > 31) {
      throw new Error(`rgb15: channel ${v} is not a 5-bit value`);
    }
  }
  const r8 = r * 8, g8 = g * 8, b8 = b * 8;
  return {
    r5: r, g5: g, b5: b,
    u32: ((255 << 24) | (b8 << 16) | (g8 << 8) | r8) >>> 0, // ImageData is little-endian ABGR
    css: `rgb(${r8},${g8},${b8})`,
  };
}

// A named palette: { key: [r5,g5,b5], ... } in index order (1..15).
export function makePalette(name, spec) {
  const keys = Object.keys(spec);
  if (keys.length > SIZE) throw new Error(`palette ${name}: ${keys.length} colors (max ${SIZE})`);
  const colors = [null];
  const index = {};
  keys.forEach((k, i) => {
    colors.push(rgb15(...spec[k]));
    index[k] = i + 1;
  });
  const u32 = new Uint32Array(16);
  for (let i = 1; i < colors.length; i++) u32[i] = colors[i].u32;
  return { name, keys, index, colors, u32, spec };
}

// A palette swap must keep the exact key layout of its base palette so the same
// index grids render correctly. Overrides only change colors.
export function swapPalette(name, base, overrides) {
  const spec = {};
  for (const k of base.keys) spec[k] = overrides[k] || base.spec[k];
  for (const k of Object.keys(overrides)) {
    if (!(k in base.index)) throw new Error(`swap ${name}: unknown key ${k}`);
  }
  return makePalette(name, spec);
}

// Sprites may use two palettes: indices 1-15 map to palette A, 17-31 to palette B.
export const PAL_B = 16;

export function spritePalette(a, b) {
  const u32 = new Uint32Array(32);
  u32.set(a.u32, 0);
  if (b) u32.set(b.u32, PAL_B);
  u32[PAL_B] = 0;
  return { a, b, u32, idx: (key) => lookupIndex(a, b, key) };
}

function lookupIndex(a, b, key) {
  if (key in a.index) return a.index[key];
  if (b && key in b.index) return b.index[key] + PAL_B;
  throw new Error(`palette key not found: ${key} (${a.name}${b ? '/' + b.name : ''})`);
}

// Background palettes (arenas): up to 4 x 15 colors. Index = bank*16 + color.
export function bgPalette(banks) {
  if (banks.length > 4) throw new Error('arena uses more than 4 background palettes');
  const u32 = new Uint32Array(64);
  banks.forEach((p, i) => u32.set(p.u32, i * 16));
  for (let i = 0; i < 4; i++) u32[i * 16] = 0;
  const idx = (key) => {
    for (let i = 0; i < banks.length; i++) if (key in banks[i].index) return i * 16 + banks[i].index[key];
    throw new Error(`bg palette key not found: ${key}`);
  };
  return { banks, u32, idx };
}

// Convenience: build a Uint32 color for UI drawing straight from 5-bit values.
export const c32 = (r, g, b) => rgb15(r, g, b).u32;
