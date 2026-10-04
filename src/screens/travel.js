// THE JOURNEYS between the worlds (spec §19 G11). Crossing from one map to another is never just a step: a full scene plays, each with its
// own camera movement and moving scenery, and the other way round plays it reversed.
//   road    the circuit road <-> the city of champions: the bus on the highway, the camera tracking it, hills and signs going by, day to
//           night; at the end the camera tilts up to the skyline and its searchlights (home: night to day, the sea at the end)
//   warp    the city <-> ZERO's world: a rip opens, the camera pushes in, the picture bends and its colours turn, the warped city comes out
//   climb   the city <-> the Pantheon: the camera rises with you up the marble stair on the mountain, through the clouds, into the light
//   fall    the city <-> the Underworld: the camera drops with you down the chasm, past the strata, into embers and the red dark (back:
//           the climb up the rope)
//   tear    the Underworld <-> the Void: the tear opens, everything streams into it, the colour drains out, the white floor of the Void
// The first time a journey is taken it plays in full (9 s) and START skips it only after a moment; after that it is short (2.5 s) and
// START skips it at once. Either way the map you arrive on comes after it, with you on the place you arrive at.
import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextCentered, drawTextBig, textWidth } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { W, H } from '../engine/renderer.js';
import { bayer } from '../scene/gfx.js';
import { ZONES } from '../../data/world/index.js';
import { loadWorld, saveWorld } from '../world/state.js';
import { drawRunner } from './mapkit.js';
import { hash2 } from '../world/img.js';

const FULL = 540, SHORT = 150, CARD = 70;
const TAG = { main: 'THE CIRCUIT ROAD', champ: 'WHERE TITLES ARE WON', zero: 'THE WORLD GONE WRONG', pantheon: 'ABOVE THE CLOUDS', underworld: 'BENEATH EVERYTHING', void: 'PAST THE EDGE OF IT ALL' };
const SONG = { blimp: 'roadTrip', road: 'roadTrip', warp: 'zeroMap', climb: 'ascend', fall: 'ferrymanTheme', tear: 'voidDoor' };
const BACK_SONG = { road: 'roadTrip', warp: 'champMap', climb: 'roadTrip', fall: 'underworldMap', tear: 'underworldMap' };

const ease = (u) => u * u * (3 - 2 * u);
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const C = (r, g, b) => c32(r, g, b);
const ditherRect = (f, x, y, w, h, col, d) => { for (let j = Math.max(0, y); j < Math.min(H, y + h); j++) for (let i = Math.max(0, x); i < Math.min(W, x + w); i++) if (bayer(i, j) < d) f.px(i, j, col); };
// a value-noise ridge: the height of a hill line at x (deterministic)
const ridge = (x, s, per = 60) => { const i = Math.floor(x / per), u = x / per - i, a = hash2(i, 0, s), b = hash2(i + 1, 0, s), v = u * u * (3 - 2 * u); return a + (b - a) * v; };

// ------------------------------------------------------------------------------------------------------------------- the road trip
const DAY = [[C(14, 22, 31), C(18, 25, 31), C(22, 28, 31), C(26, 30, 31)], [C(10, 8, 22), C(22, 10, 20), C(30, 14, 12), C(31, 22, 8)], [C(1, 2, 7), C(3, 4, 11), C(5, 6, 15), C(8, 8, 18)]];
function road(f, u, t, S) {
  const back = S.back, v = back ? 1 - u : u, dir = back ? -1 : 1, scroll = t * 3;
  const tod = v < 0.45 ? 0 : v < 0.7 ? 1 : 2, night = tod === 2, dusk = tod === 1;
  // the camera: it tracks the bus, then tilts up to the city at the end (home: it starts on the skyline and tilts down to the bus)
  const pan = Math.round(ease(clamp01((v - 0.72) / 0.22)) * 96);
  const sky = DAY[tod];
  for (let y = 0; y < H; y++) { const b = Math.min(3, Math.max(0, Math.floor(((y - pan * 0.3) / 150) * 4))); f.rect(0, y, W, 1, sky[3 - b] ?? sky[0]); }
  if (night) for (let i = 0; i < 40; i++) { const x = (hash2(i, 1, 5) * W) | 0, y = ((hash2(i, 2, 5) * 120) | 0) + pan; if (((t >> 4) + i) % 5) f.px(x, y, C(31, 31, 28)); }
  if (!night) { const sx = 200, sy = (dusk ? 110 : 40) + pan; for (let j = -9; j <= 9; j++) { const w = Math.round(Math.sqrt(81 - j * j)); f.rect(sx - w, sy + j, w * 2, 1, dusk ? C(31, 20, 6) : C(31, 30, 20)); } }
  // the city of champions on the horizon, rising as you come (going home, sinking behind you)
  const cityK = clamp01((v - 0.5) / 0.3);
  if (cityK > 0) {
    const base = 128 + pan;
    for (let i = 0; i < 22; i++) {
      const w = 8 + ((hash2(i, 3, 6) * 10) | 0), h = Math.round((24 + hash2(i, 4, 6) * 70) * cityK), x = 40 + i * 8 + ((hash2(i, 5, 6) * 4) | 0) - (back ? 0 : 0);
      f.rect(x, base - h, w, h, night ? C(5, 5, 11) : C(9, 9, 16));
      for (let y = base - h + 3; y < base - 2; y += 4) for (let xx = x + 2; xx < x + w - 2; xx += 3) if (hash2(xx, y, 7) > 0.5) f.px(xx, y, night || dusk ? C(31, 28, 9) : C(14, 16, 22));
    }
    // the arena's searchlights over it
    if (night) for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + Math.sin(t / 40 + k * 2) * 0.6; for (let d = 10; d < 140; d++) { const x = 128 + Math.cos(a) * d, y = base - 40 + Math.sin(a) * d; for (let j = -Math.round(d * 0.08); j <= Math.round(d * 0.08); j++) if (bayer(Math.round(x + j), Math.round(y)) < 0.3) f.px(Math.round(x + j), Math.round(y), C(31, 30, 20)); } }
  }
  // far mountains, then hills with trees, sliding by at their own speeds (parallax)
  const mt = night ? C(6, 6, 14) : dusk ? C(15, 9, 18) : C(12, 16, 24), hl = night ? C(3, 8, 6) : dusk ? C(8, 10, 8) : C(6, 18, 8), hlD = night ? C(2, 5, 4) : C(4, 12, 6);
  for (let x = 0; x < W; x++) {
    const h1 = 100 + Math.round(ridge(x + dir * scroll * 0.15, 11, 70) * 40) + pan; f.rect(x, h1, 1, H - h1, mt);
    const h2 = 135 + Math.round(ridge(x + dir * scroll * 0.4, 12, 40) * 22) + pan; f.rect(x, h2, 1, H - h2, hl); if ((x + h2) % 7 === 0) f.rect(x, h2, 1, 3, hlD);
  }
  for (let i = -1; i < 8; i++) {
    const per = 44, x = Math.round(((i * per - dir * scroll * 0.4) % (per * 8) + per * 8) % (per * 8)) - 20, y = 140 + pan + Math.round(ridge(x + dir * scroll * 0.4, 12, 40) * 22);
    f.rect(x, y - 10, 3, 10, C(10, 6, 3)); for (let j = -6; j <= 0; j++) { const w = Math.round(Math.sqrt(36 - j * j)); f.rect(x + 1 - w, y - 12 + j, w * 2 + 1, 1, hlD); }
  }
  // the road: asphalt, its edges, the dashes rushing past, a guard rail, lamps
  const ry = 168 + pan;
  f.rect(0, ry - 2, W, 2, C(20, 20, 22)); f.rect(0, ry, W, 30, C(7, 7, 10)); f.rect(0, ry + 30, W, 2, C(20, 20, 22)); f.rect(0, ry + 32, W, H, night ? C(2, 6, 3) : C(5, 15, 6));
  for (let x = -((scroll * dir) % 32 + 32) % 32 - 32; x < W + 32; x += 32) f.rect(x, ry + 14, 16, 2, C(29, 25, 6));
  for (let x = -((scroll * dir) % 24 + 24) % 24 - 24; x < W + 24; x += 24) { f.rect(x, ry - 8, 2, 6, C(18, 18, 20)); }
  f.rect(0, ry - 7, W, 1, C(24, 24, 26));
  for (let x = -((scroll * dir) % 120 + 120) % 120 - 120; x < W + 120; x += 120) { f.rect(x, ry - 34, 2, 28, C(12, 12, 15)); f.rect(x, ry - 34, 8, 2, C(12, 12, 15)); f.rect(x + 6, ry - 33, 3, 2, night || dusk ? C(31, 29, 14) : C(18, 18, 20)); if (night) ditherRect(f, x, ry - 31, 14, 24, C(31, 29, 14), 0.12); }
  // the highway signs, one every few seconds
  const signs = back ? ['HOMETOWN 260', 'THE CONTINENT', 'HOMETOWN 12'] : ['CITY OF CHAMPIONS 300', 'CHAMPIONSHIP 120', 'CITY OF CHAMPIONS 5'];
  const per = Math.max(150, Math.round(S.dur / 3)), k = Math.floor(t / per) % 3, ph = t % per, sxp = back ? -120 + ph * 3 : W + 20 - ph * 3;
  const sw = textWidth(signs[k], false) + 12;
  if (sxp > -sw - 20 && sxp < W + 20) { f.rect(sxp + (sw >> 1) - 1, ry - 52, 3, 46, C(12, 12, 15)); f.rect(sxp, ry - 70, sw, 20, C(1, 2, 1)); f.rect(sxp + 1, ry - 69, sw - 2, 18, C(4, 17, 8)); f.rect(sxp + 2, ry - 68, sw - 4, 1, C(26, 28, 26)); drawText(f, signs[k], sxp + 6, ry - 64, COL.white, { mono: false }); }
  // the bus
  const bx = 116, by = ry + 4 + ((t >> 2) & 1);
  drawBus(f, bx, by, back, night);
}
function drawBus(f, x, y, flip, night) {
  const Y = C(29, 23, 3), Yd = C(20, 14, 1), G = C(10, 20, 28);
  f.rect(x - 2, y - 15, 50, 16, Yd); f.rect(x - 1, y - 16, 48, 15, Y); f.rect(x - 1, y - 16, 48, 1, C(31, 29, 12));
  for (let i = 0; i < 6; i++) f.rect(x + 2 + i * 7, y - 13, 5, 5, night ? C(31, 27, 12) : G);
  const fx = flip ? x - 1 : x + 41; f.rect(fx, y - 13, 6, 8, G); f.rect(flip ? x - 3 : x + 46, y - 6, 2, 3, C(31, 31, 22));
  if (night) ditherRect(f, flip ? x - 24 : x + 48, y - 8, 22, 7, C(31, 30, 20), 0.35);
  f.rect(x - 1, y - 4, 48, 1, C(6, 5, 4));
  for (const wx of [x + 8, x + 36]) { for (let j = -4; j <= 4; j++) { const w = Math.round(Math.sqrt(16 - j * j)); f.rect(wx - w, y + j, w * 2 + 1, 1, C(3, 3, 4)); } f.rect(wx - 1, y - 1, 3, 3, C(18, 18, 20)); }
}

// ------------------------------------------------------------------------------------------------------------------- the warp
const WARP_RAMP = [C(3, 1, 7), C(9, 3, 16), C(16, 5, 24), C(27, 10, 31), C(31, 24, 31)];
function cityNight(f, t, broken) {
  for (let y = 0; y < H; y++) f.rect(0, y, W, 1, broken ? (y < 80 ? C(6, 2, 12) : y < 150 ? C(12, 4, 18) : C(18, 6, 22)) : (y < 80 ? C(2, 3, 9) : y < 150 ? C(4, 5, 14) : C(7, 7, 18)));
  for (let i = 0; i < 30; i++) f.px((hash2(i, 1, 9) * W) | 0, (hash2(i, 2, 9) * 110) | 0, broken ? C(31, 20, 31) : C(30, 30, 26));
  for (let i = 0; i < 18; i++) {
    const w = 12 + ((hash2(i, 3, 8) * 12) | 0), h = 40 + ((hash2(i, 4, 8) * 90) | 0), x = i * 15 - 6, lean = broken ? Math.round((hash2(i, 5, 8) - 0.5) * 20) : 0;
    for (let y = 0; y < h; y++) { const xx = x + Math.round((lean * (h - y)) / h); f.rect(xx, 190 - y, w, 1, broken ? C(3, 1, 6) : C(6, 6, 12)); if (y % 5 === 2) for (let k = 2; k < w - 2; k += 3) if (hash2(i * 7 + k, y, 3) > (broken ? 0.7 : 0.45)) f.px(xx + k, 190 - y, broken ? ((t >> 2) + k) % 3 ? C(27, 10, 31) : C(6, 26, 31) : C(31, 28, 9)); }
    if (broken) for (let k = 0; k < w; k += 2) f.rect(x + lean + k, 190 - h - ((k * 3) % 5), 2, 4, C(3, 1, 6));
  }
  f.rect(0, 190, W, H - 190, broken ? C(10, 6, 16) : C(5, 5, 9));
  for (let x = 0; x < W; x += 12) f.rect(x, 200, 6, 1, broken ? C(27, 10, 31) : C(18, 18, 20));
}
function warp(f, u, t, S) {
  const v = S.back ? 1 - u : u, mid = Math.sin(v * Math.PI), B = f.buf;
  cityNight(f, t, v >= 0.5);
  // the rip in the middle of the street, opening as you near it
  const rr = Math.round(4 + mid * 48);
  for (let y = -rr; y <= rr; y++) { const w = Math.round(Math.sqrt(Math.max(0, rr * rr - y * y)) * 0.55 * (1 + 0.15 * Math.sin(y * 0.3 + t * 0.2))); const Y = 130 + y; if (Y < 0 || Y >= H) continue; f.rect(128 - w - 2, Y, w * 2 + 4, 1, WARP_RAMP[3]); f.rect(128 - w, Y, w * 2, 1, WARP_RAMP[0]); }
  for (let i = 0; i < 14; i++) { const a = t / 15 + i, r = (i * 7 + t) % Math.max(8, rr); f.px(128 + Math.round(Math.cos(a) * r * 0.5), 130 + Math.round(Math.sin(a) * r), i & 1 ? WARP_RAMP[4] : WARP_RAMP[3]); }
  // the camera pushes in on the rip and the picture bends round it
  const zoom = 1 + mid * 0.45, amp = mid * 9, src = Uint32Array.from(B);
  for (let y = 0; y < H; y++) {
    const off = Math.round(Math.sin(y * 0.09 + t * 0.15) * amp);
    for (let x = 0; x < W; x++) { const X = Math.round(128 + (x - 128) / zoom) + off, Y = Math.round(130 + (y - 130) / zoom); B[y * W + x] = src[Math.max(0, Math.min(H - 1, Y)) * W + ((X % W) + W) % W]; }
  }
  // the colours turn: every pixel goes over to the warp's purple, a dither at a time
  const turn = clamp01((mid - 0.25) * 1.6) * (v < 0.5 ? 1 : 0.6);
  if (turn > 0) for (let i = 0; i < B.length; i++) { const x = i % W, y = (i / W) | 0; if (bayer(x, y) < turn) { const p = B[i], l = ((p & 255) + ((p >> 8) & 255) + ((p >> 16) & 255)) / 765; B[i] = WARP_RAMP[Math.min(4, Math.floor(l * 5.5))]; } }
  // static at the very middle of it
  if (mid > 0.85) for (let i = 0; i < 600; i++) f.px((hash2(i, t, 13) * W) | 0, (hash2(i, t, 14) * H) | 0, i & 1 ? C(31, 31, 31) : C(0, 0, 0));
}

// ------------------------------------------------------------------------------------------------------------------- the climb
const CH = 1100;
function climbStair(y) { const k = Math.floor(y / 90), u = (y % 90) / 90; return k & 1 ? 150 - u * 50 : 100 + u * 50; }
function climb(f, u, t, S) {
  const v = S.back ? 1 - u : u, cam = Math.round((CH - H) * (1 - ease(v)));
  for (let y = 0; y < H; y++) {
    const wy = cam + y;
    const col = wy < 300 ? (wy < 120 ? C(31, 29, 18) : wy < 220 ? C(31, 26, 14) : C(29, 22, 16)) : wy < 620 ? C(18, 24, 31) : wy < 850 ? C(10, 14, 27) : C(4, 6, 16);
    f.rect(0, y, W, 1, col);
  }
  // the sun's rays above the clouds
  for (let y = 0; y < H; y++) { const wy = cam + y; if (wy > 360) break; for (let x = 0; x < W; x++) { const a = Math.atan2(wy - 40, x - 128); if (Math.sin(a * 14 + t * 0.01) > 0.6 && bayer(x, y) < 0.25) f.px(x, y, C(31, 31, 24)); } }
  // the mountain: a rock face narrowing to its peak, ridged and snow-streaked, the city's lights far below it
  for (let y = 0; y < H; y++) {
    const wy = cam + y; if (wy < 150) continue;
    const half = Math.min(118, 26 + (wy - 150) * 0.11) + ridge(wy, 21, 26) * 14, L = Math.round(128 - half), R = Math.round(128 + half * (0.9 + ridge(wy, 23, 40) * 0.2));
    const snow = wy < 330;
    f.rect(L, y, R - L, 1, snow ? C(27, 29, 31) : C(12, 11, 15));
    f.rect(Math.round(128 + half * 0.25), y, Math.round(half * 0.7), 1, snow ? C(20, 23, 30) : C(8, 7, 11));
    f.px(L, y, snow ? C(31, 31, 31) : C(19, 18, 22));
    for (let k = 0; k < 3; k++) { const rx = L + Math.round(ridge(wy + k * 300, 25 + k, 18) * (R - L)); f.px(rx, y, snow ? C(20, 23, 30) : C(6, 5, 9)); }
  }
  if (cam > CH - H - 160) for (let i = 0; i < 30; i++) { const x = (hash2(i, 1, 22) * W) | 0, y = CH - 30 + ((hash2(i, 2, 22) * 30) | 0) - cam; if (y > 0 && y < H && (x < 40 || x > 216)) { f.rect(x, y - 8, 5, 8, C(5, 5, 10)); f.px(x + 2, y - 5, C(31, 28, 9)); } }
  // the marble stair, zig-zagging up the face
  for (let wy = Math.max(110, cam - 4); wy < Math.min(CH - 20, cam + H + 4); wy += 3) { const x = climbStair(wy), y = wy - cam; f.rect(Math.round(x) - 8, y, 16, 2, C(30, 30, 29)); f.rect(Math.round(x) - 8, y + 2, 16, 1, C(19, 18, 21)); }
  // the gate of light at the top
  const gy = 100 - cam;
  if (gy > -60) { f.rect(116, gy - 40, 4, 40, C(31, 25, 6)); f.rect(136, gy - 40, 4, 40, C(31, 25, 6)); for (let j = 0; j < 12; j++) { const w = Math.round(Math.sqrt(144 - j * j)); f.rect(128 - w, gy - 40 - j, w * 2, 1, C(31, 25, 6)); } ditherRect(f, 120, gy - 50, 16, 50, C(31, 31, 31), 0.6); }
  // you, climbing (going back down, descending)
  const ry = cam + 130, rx = climbStair(ry);
  drawRunner(f, S.g.profile, rx, 130, t, true, (Math.floor(ry / 90) & 1) === (S.back ? 1 : 0));
  // the cloud layer you pass through
  for (let y = 0; y < H; y++) {
    const wy = cam + y, dc = 1 - Math.abs(wy - 520) / 110; if (dc <= 0) continue;
    for (let x = 0; x < W; x++) { const n = ridge(x + t * 0.5 + wy * 0.7, 31, 24) * 0.6 + ridge(x * 1.7 - t * 0.3, 32, 15) * 0.4; if (n < dc * 1.1) f.px(x, y, n > dc * 0.8 ? C(22, 25, 30) : C(31, 31, 31)); }
  }
  // into the light
  if (v > 0.9 && !S.back) ditherRect(f, 0, 0, W, H, C(31, 31, 31), (v - 0.9) * 10);
}

// ------------------------------------------------------------------------------------------------------------------- the fall
const FH = 1400;
const STRATA = [C(20, 13, 7), C(14, 9, 6), C(10, 8, 9), C(7, 5, 7), C(5, 3, 5), C(9, 3, 3), C(14, 4, 2)];
function fall(f, u, t, S) {
  const v = S.back ? 1 - u : u, cam = Math.round((FH - H) * (S.back ? 1 - ease(u) : v * v));
  for (let y = 0; y < H; y++) { const wy = cam + y; f.rect(0, y, W, 1, wy < 200 ? C(3, 4, 12) : wy < 900 ? C(1, 1, 3) : wy < 1200 ? C(4, 1, 2) : C(10, 2, 1)); }
  // the street at the top, split open
  if (cam < 260) {
    const y0 = 160 - cam;
    for (let i = 0; i < 10; i++) { const x = i < 5 ? i * 16 - 10 : 196 + (i - 5) * 16, h = 40 + ((hash2(i, 1, 41) * 60) | 0); f.rect(x, y0 - h, 14, h, C(6, 6, 12)); for (let y = y0 - h + 4; y < y0; y += 5) f.px(x + 4, y, C(31, 28, 9)); }
    f.rect(0, y0, 80, 8, C(13, 14, 18)); f.rect(176, y0, 80, 8, C(13, 14, 18));
  }
  // the walls of the chasm, banded by depth, going by
  for (let y = 0; y < H; y++) {
    const wy = cam + y; if (wy < 160) continue;
    const L = 46 + Math.round(ridge(wy, 51, 26) * 26), R = 210 - Math.round(ridge(wy, 52, 26) * 26), band = STRATA[Math.min(STRATA.length - 1, Math.floor((wy - 160) / 180))];
    f.rect(0, y, L, 1, band); f.rect(R, y, W - R, 1, band); f.px(L, y, C(2, 1, 2)); f.px(R, y, C(2, 1, 2));
    if (wy % 37 < 2) { f.rect(0, y, L - 6, 1, C(2, 1, 2)); f.rect(R + 6, y, W - R, 1, C(2, 1, 2)); }
    if (wy > 1000 && (wy * 7) % 23 === 0) { f.rect(L - 4, y, 4, 2, C(31, 18, 4)); }
  }
  // rocks falling with you, embers coming up past you
  for (let i = 0; i < 12; i++) { const x = 60 + ((hash2(i, 1, 43) * 136) | 0), y = ((hash2(i, 2, 43) * H + t * (1 + hash2(i, 3, 43) * 2) * (S.back ? 1 : -1)) % H + H) % H; f.rect(x, y, 3 + (i % 3), 3, C(12, 9, 10)); f.px(x, y, C(20, 16, 16)); }
  if (cam > 700) for (let i = 0; i < 30; i++) { const x = ((hash2(i, 4, 44) * W) | 0) + Math.round(Math.sin(t / 10 + i) * 3), y = ((((hash2(i, 5, 44) * H - t * 2.5) % H) + H) % H) | 0; f.px(x, y, i & 1 ? C(31, 18, 4) : C(29, 8, 3)); }
  // the glow at the bottom, and the floor of ash
  const fy = FH - 40 - cam;
  if (fy < H + 60) { for (let k = 0; k < 6; k++) ditherRect(f, 0, fy - 60 + k * 10, W, 10, C(29, 8, 3), k * 0.08); f.rect(0, fy, W, H, C(9, 6, 8)); for (let x = 0; x < W; x += 9) f.px(x + ((x * 7) % 5), fy + 3, C(15, 11, 13)); }
  // you: tumbling down (going back up, climbing a rope)
  if (S.back) { f.rect(127, 0, 2, H, C(20, 14, 8)); drawRunner(f, S.g.profile, 128, 110, t, true, (t >> 4) & 1); }
  else drawRunner(f, S.g.profile, 128 + Math.round(Math.sin(t / 9) * 6), Math.min(110, fy - 4), t, false, (t >> 3) & 1);
}

// ------------------------------------------------------------------------------------------------------------------- the tear
function tear(f, u, t, S) {
  const v = S.back ? 1 - u : u, B = f.buf;
  if (v < 0.55) {
    // the cavern: dark rock, embers, the tear standing in the middle and opening
    for (let y = 0; y < H; y++) f.rect(0, y, W, 1, y < 150 ? C(4, 2, 4) : C(9, 6, 8));
    for (let x = 0; x < W; x += 2) { const h = 20 + Math.round(ridge(x, 61, 20) * 40); f.rect(x, 0, 2, h, C(8, 5, 7)); const g = 150 - Math.round(ridge(x, 62, 30) * 30); f.rect(x, g, 2, 4, C(12, 8, 10)); }
    for (let i = 0; i < 24; i++) { const x = (hash2(i, 1, 71) * W) | 0, y = ((((hash2(i, 2, 71) * H - t * 1.5) % H) + H) % H) | 0; f.px(x, y, i & 1 ? C(31, 18, 4) : C(29, 8, 3)); }
    const open = clamp01(v / 0.5), hh = 30 + open * 90;
    for (let j = 0; j <= hh * 2; j++) { const y = Math.round(130 - hh + j), w = Math.round(Math.sin((j / (hh * 2)) * Math.PI) * (4 + open * 40) + ((j * 7 + (t >> 2)) % 3)); if (y >= 0 && y < H) f.rect(128 - w, y, w * 2, 1, C(31, 31, 31)); }
  } else {
    // the Void: black, a floor of white lines running to a far horizon, silent white figures, drifting cubes
    f.clear(C(0, 0, 1));
    const hz = 100;
    for (let i = 1; i < 14; i++) { const y = hz + Math.round(Math.pow(i / 13, 2.2) * (H - hz)) + ((t >> 1) % 2); f.rect(0, y, W, 1, C(10, 10, 14)); }
    for (let i = -12; i <= 12; i++) { for (let y = hz; y < H; y++) { const x = Math.round(128 + i * 6 * (1 + ((y - hz) / (H - hz)) * 10)); if (x >= 0 && x < W && (y & 1)) f.px(x, y, C(10, 10, 14)); } }
    for (let i = 0; i < 5; i++) { const x = 20 + ((hash2(i, 1, 72) * 216) | 0), y = hz + 10 + ((hash2(i, 2, 72) * 30) | 0), h = 18 + i * 3; f.rect(x, y - h, 4, h, C(31, 31, 31)); f.rect(x - 1, y - h - 4, 6, 5, C(31, 31, 31)); }
    for (let i = 0; i < 8; i++) { const x = ((hash2(i, 3, 72) * W + t * 0.3) % W) | 0, y = 20 + ((hash2(i, 4, 72) * 70) | 0) + Math.round(Math.sin(t / 30 + i) * 4); f.rect(x, y, 5, 5, C(31, 31, 31)); f.rect(x + 4, y + 1, 1, 4, C(18, 18, 22)); }
  }
  // everything streaming into the tear: lines from the edges to the middle
  const pull = Math.sin(v * Math.PI);
  for (let i = 0; i < Math.round(pull * 60); i++) {
    const a = hash2(i, 5, 73) * Math.PI * 2, r0 = 40 + (((hash2(i, 6, 73) * 200 - t * 4) % 200) + 200) % 200, len = 10 + pull * 20;
    for (let d = 0; d < len; d++) { const x = Math.round(128 + Math.cos(a) * (r0 + d)), y = Math.round(130 + Math.sin(a) * (r0 + d) * 0.8); if (x >= 0 && x < W && y >= 0 && y < H) f.px(x, y, C(31, 31, 31)); }
  }
  // the colour draining out of everything
  const drain = clamp01(v * 1.8);
  if (drain > 0) for (let i = 0; i < B.length; i++) { const x = i % W, y = (i / W) | 0; if (bayer(x, y) < drain) { const p = B[i], l = ((p & 255) + ((p >> 8) & 255) + ((p >> 16) & 255)) / 765; B[i] = l > 0.8 ? C(31, 31, 31) : l > 0.45 ? C(20, 20, 24) : l > 0.15 ? C(8, 8, 11) : C(0, 0, 1); } }
}

// ------------------------------------------------------------------------------------------------------------------- the blimp
// The blimp crossing the sky from one world to the next: the camera alongside it, clouds streaming past in three layers, the land far
// below sliding by, and the colour of the sky and the land turning toward where you are going.
const LAND = { main: [C(6, 18, 8), C(6, 14, 27)], champ: [C(13, 14, 18), C(18, 18, 22)], zero: [C(10, 5, 15), C(20, 6, 26)], pantheon: [C(28, 29, 31), C(14, 22, 31)], underworld: [C(9, 6, 8), C(29, 10, 3)], void: [C(2, 2, 4), C(20, 20, 24)] };
function blimp(f, u, t, S) {
  const to = S.a.to || 'champ', from = S.a.from || 'main', k = u < 0.5 ? from : to, [land, accent] = LAND[k] || LAND.main;
  const dark = k === 'underworld' || k === 'void' || k === 'zero';
  for (let y = 0; y < H; y++) f.rect(0, y, W, 1, dark ? (y < 100 ? C(3, 3, 9) : C(6, 4, 12)) : y < 70 ? C(10, 17, 29) : y < 130 ? C(14, 22, 31) : C(20, 26, 31));
  // the land far below
  f.rect(0, 176, W, H - 176, land);
  for (let i = 0; i < 14; i++) { const x = ((i * 47 - t * 0.6) % 330 + 330) % 330 - 40; f.rect(Math.round(x), 180 + (i * 7) % 30, 18 + (i * 11) % 20, 3, accent); }
  // clouds behind
  for (let i = 0; i < 6; i++) { const x = ((hash2(i, 2, 7) * 320 - t * 1.2) % 320 + 320) % 320 - 40, y = 40 + (i * 29) % 110; for (let j = -3; j <= 3; j++) { const w = Math.round(Math.sqrt(9 - (j * j) / 1.5) * 6); f.rect(Math.round(x) - w, y + j, w * 2, 1, dark ? C(12, 10, 18) : C(28, 29, 31)); } }
  // the blimp, bobbing
  const bx = 128, by = 100 + Math.round(Math.sin(t / 20) * 3);
  for (let j = -16; j <= 16; j++) { const w = Math.round(46 * Math.sqrt(1 - (j * j) / 256)); f.rect(bx - w, by + j, w * 2, 1, j < -8 ? C(30, 30, 31) : j > 8 ? C(15, 15, 19) : C(24, 24, 27)); }
  f.rect(bx - 40, by - 2, 80, 5, C(27, 5, 7)); f.rect(bx - 40, by + 3, 80, 1, C(16, 2, 4));
  for (let j = 0; j < 14; j++) { f.rect(bx + 40 + j, by - j, 3, 1, C(16, 2, 4)); f.rect(bx + 40 + j, by + j, 3, 1, C(16, 2, 4)); }
  f.rect(bx - 14, by + 16, 28, 9, C(9, 7, 6)); for (let i = 0; i < 5; i++) f.rect(bx - 11 + i * 5, by + 18, 3, 3, (t >> 4) + i & 1 ? C(31, 29, 14) : C(31, 25, 6));
  const pr = (t >> 1) & 1; f.rect(bx - 50, by - 6 + pr * 6, 2, 6, C(12, 12, 15));
  // clouds in front
  for (let i = 0; i < 4; i++) { const x = ((hash2(i, 3, 7) * 400 - t * 3) % 400 + 400) % 400 - 60, y = 130 + (i * 31) % 60; for (let j = -5; j <= 5; j++) { const w = Math.round(Math.sqrt(25 - (j * j) / 1.3) * 7); f.rect(Math.round(x) - w, y + j, w * 2, 1, dark ? C(16, 14, 22) : C(31, 31, 31)); } }
}

const SEQ = { road, warp, climb, fall, tear, blimp };

export class TravelScreen {
  constructor(game, args = {}) {
    this.g = game; this.a = args; this.t = 0;
    this.back = !!args.back; this.first = !!args.first;
    this.dur = this.first ? FULL : SHORT;
    this.draw = SEQ[args.travel] || road;
    this.Z = ZONES[args.to] || ZONES.main;
  }
  enter() {
    const g = this.g, S = g.songs, id = (this.back ? BACK_SONG : SONG)[this.a.travel] || 'roadTrip';
    g.loc = { area: 'world' };
    g.audio.play(S[id] || S.map);
  }
  finish() {
    const ws = loadWorld(), key = `${this.a.travel}${this.back ? '<' : '>'}`;
    ws.travel[key] = true; if (this.a.at) ws.pos = this.a.at;
    saveWorld(ws);
    this.g.go('map', { arrive: this.a.at });
  }
  update() {
    this.t++;
    const I = this.g.input, canSkip = this.t > (this.first ? 90 : 8);
    if (canSkip && (I.pressed('start') || I.confirm())) { this.finish(); return; }
    if (this.t >= this.dur + CARD) this.finish();
  }
  render(f) {
    const t = this.t, u = clamp01(t / this.dur);
    this.draw(f, u, t, this);
    // the name of where you are going, over the end of it
    const k = clamp01((t - (this.dur - 40)) / 30);
    if (k > 0) {
      const name = this.Z.name, sub = TAG[this.Z.id] || '', y = 84;
      if (k < 0.4) ditherRect(f, 0, y - 10, W, 50, COL.black, k * 2); else { f.rect(0, y - 10, W, 50, COL.black); f.rect(0, y - 10, W, 1, COL.yellow); f.rect(0, y + 39, W, 1, COL.yellow); }
      if (k >= 0.4) { drawTextBig(f, name, 128, y, COL.yellow, COL.black, 1); drawTextCentered(f, sub, 128, y + 20, COL.cyan, { mono: false }); }
    }
    if (t > (this.first ? 90 : 8)) drawText(f, 'START: SKIP', 4, H - 11, COL.off, { mono: false });
  }
  shake() { return this.a.travel === 'fall' && !this.back && this.t > this.dur * 0.95 && this.t < this.dur * 0.95 + 14 ? [((this.t >> 1) & 1) ? 2 : -2, (this.t & 1) ? 1 : -1] : [0, 0]; }
}
void panel;
