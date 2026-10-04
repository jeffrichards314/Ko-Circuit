// Colour schemes for the alternate costumes (tools/make-alts.mjs). m1..m4: the costume's biggest areas, biggest first; glove; trim: metal, piping, buckles.
// Each was chosen to sit together (a dark base, a light or warm second colour, one bright accent), like Barney's Night Shift.
export const THEMES = {
  NIGHT:   { m1: '#3c3c4c', m2: '#7a4f30', m3: '#e8741c', m4: '#5a5a6e', glove: '#e0521c', trim: '#d8b04a' },
  EMBER:   { m1: '#2e2a2e', m2: '#b8262e', m3: '#f08a28', m4: '#4a3a3a', glove: '#f2a02c', trim: '#ffd25a' },
  FROST:   { m1: '#c4dcef', m2: '#2a4a86', m3: '#f4f8fc', m4: '#6aa4d8', glove: '#3a98e0', trim: '#9ee0f4' },
  FOREST:  { m1: '#24603e', m2: '#c8aa76', m3: '#7c8c3c', m4: '#3c4a2a', glove: '#dcc062', trim: '#ecd88e' },
  ROYAL:   { m1: '#5c2e8c', m2: '#eab82e', m3: '#f2eaf8', m4: '#3a1e5c', glove: '#eab82e', trim: '#f8e27c' },
  SUNSET:  { m1: '#e2643c', m2: '#8c2c5c', m3: '#f4c84c', m4: '#5a1e4a', glove: '#f6b2a0', trim: '#ffe4a2' },
  OCEAN:   { m1: '#1f8c8c', m2: '#162a4e', m3: '#eadcb4', m4: '#0f5a66', glove: '#f2a634', trim: '#f4e8c4' },
  INK:     { m1: '#1e1e26', m2: '#e8e4d8', m3: '#8c8c98', m4: '#3a3a46', glove: '#d83c3c', trim: '#c8ccd8' },
  DESERT:  { m1: '#d8b878', m2: '#a8522c', m3: '#2caaa2', m4: '#7a5a34', glove: '#2caaa2', trim: '#f2d474' },
  NEON:    { m1: '#181820', m2: '#7ce63c', m3: '#e03c9c', m4: '#2a2a38', glove: '#7ce63c', trim: '#f2f23c' },
  CRIMSON: { m1: '#7c1c26', m2: '#eadec2', m3: '#22181c', m4: '#521420', glove: '#261c20', trim: '#e0b840' },
  COBALT:  { m1: '#2c54cc', m2: '#f28c22', m3: '#f6f6f6', m4: '#1c3a8c', glove: '#f28c22', trim: '#ffd84a' },
  MINT:    { m1: '#68d8b0', m2: '#f08cb2', m3: '#fafafa', m4: '#3a9a82', glove: '#f08cb2', trim: '#fff0b0' },
  LEATHER: { m1: '#7c4a28', m2: '#eedcb8', m3: '#4a6a3c', m4: '#52301a', glove: '#eedcb8', trim: '#c8a050' },
  STEELGOLD: { m1: '#4a5a72', m2: '#e0b030', m3: '#aab6c6', m4: '#2e3a4e', glove: '#e0b030', trim: '#f2dc80' },
  PLUMLIME: { m1: '#5a2a5e', m2: '#b4e03c', m3: '#e8d0ec', m4: '#3a183c', glove: '#b4e03c', trim: '#f0f080' },
  BONERUST: { m1: '#e6dcc2', m2: '#a8482a', m3: '#403028', m4: '#b89a76', glove: '#a8482a', trim: '#d89a3a' },
  TEALRED: { m1: '#167a72', m2: '#d8363a', m3: '#f0e8d0', m4: '#0e4c4a', glove: '#d8363a', trim: '#f0c84a' },
  SKYSUN:  { m1: '#58a8e8', m2: '#f4d43c', m3: '#ffffff', m4: '#2e6cb0', glove: '#f4d43c', trim: '#fff2a0' },
  // below the earth: cold ash against the furnace's orange
  ASHBLUE: { m1: '#4a5260', m2: '#a8b8c8', m3: '#5ac8f0', m4: '#2c323c', glove: '#5ac8f0', trim: '#cfeaff' },
  BONEGILD: { m1: '#d8ccb0', m2: '#5a3a28', m3: '#c8a030', m4: '#8a7a60', glove: '#c8a030', trim: '#f0d070' },
  VERDIGRIS: { m1: '#3a7a6a', m2: '#2a2e3a', m3: '#c8b070', m4: '#1e4a42', glove: '#c8b070', trim: '#e8dca0' },
  // the Void: the same shapes in other glass
  VOIDBLACK: { m1: '#20202c', m2: '#c8c8f0', m3: '#6a6ab8', m4: '#101018', glove: '#c8c8f0', trim: '#ffffff' },
  GLASSROSE: { m1: '#f4c8d4', m2: '#4a1e3a', m3: '#fafafa', m4: '#c07890', glove: '#7a2a5a', trim: '#ffffff' },
  GLASSAMBER: { m1: '#f2d8a0', m2: '#3c2a18', m3: '#fff8e8', m4: '#c0a060', glove: '#6a4018', trim: '#ffffff' },
  GLASSMINT: { m1: '#bfeee0', m2: '#14403a', m3: '#f8fffc', m4: '#6ab8a4', glove: '#1e6a5e', trim: '#ffffff' },
};
// which schemes each zone may wear (an Underworld fighter in neon would be out of place); the rest of the roster may wear the others
export const POOLS = {
  underworld: ['ASHBLUE', 'BONEGILD', 'VERDIGRIS', 'FROST', 'INK', 'STEELGOLD', 'ROYAL', 'OCEAN'],
  void: ['VOIDBLACK', 'GLASSROSE', 'GLASSAMBER', 'GLASSMINT', 'INK', 'FROST', 'ROYAL'],
};
export const NOT_FOR_MAIN = ['ASHBLUE', 'BONEGILD', 'VERDIGRIS', 'VOIDBLACK', 'GLASSROSE', 'GLASSAMBER', 'GLASSMINT'];

// by palette name: a scheme chosen by hand (when the automatic pick looks wrong), and family colours by hand
export const PICK = { zero: 'BONERUST', zeroTrue: 'INK', revenant: 'VERDIGRIS' };
export const FIX = {};

// --- colour helpers (5-bit channels in and out) ---
export function hexTo5(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round((v / 255) * 31));
}
export function toHsl([r5, g5, b5]) {
  const r = r5 / 31, g = g5 / 31, b = b5 / 31, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  if (d < 1e-6) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, Math.min(1, s), l];
}
export function hslTo5(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r, g, b].map((v) => Math.max(0, Math.min(31, Math.round((v + m) * 31))));
}
