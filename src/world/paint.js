// Painting the world (spec §19 G4): the tile ground, the scenery, the paths between places, the clouds and the effects of a reveal.
// The screen owns the state (which realms are revealed, how many dots of a path are drawn, where the clouds end); this draws it.
//
//   new WorldPainter(W)
//   .realmP[id]        0..1 how far a hidden realm is revealed (0 = hidden, 1 = revealed)
//   .edgeFrac[key]     0..1 how much of a path is drawn (absent = not drawn)
//   .fogY              pixel row above which the bank of clouds hides everything
//   .terrain(f, cam, t)  .paths(f, cam, t)  .sprites(cam, t) -> [{ y, draw(f, sx, sy) }]  .clouds(f, cam, t)  .effects(f, cam, t)
import { c32 } from '../engine/palette.js';
import { groundImg, decoImg, DECO, KIND_BY_ID, KINDS, isLand } from './tiles.js';
import { drawImg, hash2 } from './img.js';
import { paintClouds, sparkleRing } from './sky.js';
import { pointOn } from './walk.js';

export const VIEW_TOP = 24, VIEW_BOT = 224;
const pxDist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
function distToLine(line, x, y) {
  let best = Infinity;
  for (let i = 1; i < line.length; i++) {
    const [ax, ay] = line[i - 1], [bx, by] = line[i], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1;
    const u = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L));
    best = Math.min(best, Math.hypot(x - (ax + dx * u), y - (ay + dy * u)));
  }
  return best;
}

const PATH = { cream: c32(31, 29, 19), trail: c32(24, 20, 11), edge: c32(13, 8, 4), ink: c32(3, 2, 5) };
const ROAD = { asphalt: c32(6, 6, 9), edge: c32(24, 24, 27), dash: c32(29, 26, 8) };
const WOOD = { hi: c32(25, 17, 9), mid: c32(19, 12, 6), dk: c32(10, 6, 3) };
const FOAMC = c32(28, 31, 31);
const MARBLE = { hi: c32(31, 31, 29), mid: c32(25, 25, 27), dk: c32(15, 15, 20) };
const SECRETC = { hi: c32(31, 17, 29), lo: c32(20, 7, 22) };
const VOIDC = { hi: c32(31, 31, 31), lo: c32(12, 12, 16) };
const ROPE = c32(12, 9, 6), ASHPLANK = c32(14, 11, 12), ASHHI = c32(21, 17, 18);

export class WorldPainter {
  constructor(W) {
    this.W = W;
    this.realmP = {}; this.edgeFrac = {}; this.fogY = 0; this.nodeAlpha = {};
    for (const R of W.realms) {
      const [c0, r0, c1, r1] = R.rect, at = R.at || [(c0 + c1) / 2, (r0 + r1) / 2];
      R._at = [at[0] * 16 + 8, at[1] * 16 + 8];
      R._line = (R.line || []).map(([c, r]) => [c * 16 + 8, r * 16 + 8]);
      let m = 0;
      const corners = [[c0, r0], [c1, r0], [c0, r1], [c1, r1]];
      if (R.fx === 'crack' || R.fx === 'tear') for (let y = r0; y <= r1; y++) for (let x = c0; x <= c1; x++) m = Math.max(m, distToLine(R._line, x * 16 + 8, y * 16 + 8));
      else for (const [c, r] of corners) m = Math.max(m, pxDist(c * 16 + 8, r * 16 + 8, R._at[0], R._at[1]));
      R._rmax = m + 20;
      R._px = [c0 * 16, r0 * 16, (c1 + 1) * 16, (r1 + 1) * 16];
    }
    this.cols = W.cols; this.rows = W.rows;
  }

  // ---- what a tile is right now (realms reveal tile by tile)
  shown(rm, x, y) {
    const R = this.W.realms[rm], p = this.realmP[R.id] ?? 0;
    if (p >= 1) return true;
    if (p <= 0) return false;
    if (R.fx === 'clouds') return true;
    const px = x * 16 + 8, py = y * 16 + 8;
    if (R.fx === 'sweep') return pxDist(px, py, R._at[0], R._at[1]) <= p * R._rmax;
    if (p < 0.35) return false;
    return distToLine(R._line, px, py) <= ((p - 0.35) / 0.65) * R._rmax;
  }
  grid(x, y) { const rm = this.W.realmOf[y * this.cols + x]; return rm >= 0 && !this.shown(rm, x, y) ? this.W.H : this.W.S; }
  // (beyond the map's edge the world goes on as its edge tile does, so a city or a cavern has no shore at the border)
  kindAt(x, y) { x = Math.max(0, Math.min(this.cols - 1, x)); y = Math.max(0, Math.min(this.rows - 1, y)); return this.grid(x, y).ter[y * this.cols + x]; }

  // ---- ground
  terrain(f, cam, t) {
    const cx = Math.floor(cam.x), cy = Math.floor(cam.y);
    const x0 = Math.floor(cx / 16), x1 = Math.floor((cx + 255) / 16), y0 = Math.floor(cy / 16), y1 = Math.floor((cy + (VIEW_BOT - VIEW_TOP) - 1) / 16);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const k = this.kindAt(x, y), K = KIND_BY_ID[k];
      // mask: for land, the sides where the ground drops (to water, air or lower land); for water, the sides that are land
      let mask = 0;
      const low = (xx, yy) => { const K2 = KIND_BY_ID[this.kindAt(xx, yy)]; return !K2.land || K2.z < K.z; };
      if (K.land) { if (low(x, y - 1)) mask |= 1; if (low(x + 1, y)) mask |= 2; if (low(x, y + 1)) mask |= 4; if (low(x - 1, y)) mask |= 8; }
      else if (K.water) { if (isLand(this.kindAt(x, y - 1))) mask |= 1; if (isLand(this.kindAt(x + 1, y))) mask |= 2; if (isLand(this.kindAt(x, y + 1))) mask |= 4; if (isLand(this.kindAt(x - 1, y))) mask |= 8; }
      else if (isLand(this.kindAt(x, y - 1))) mask |= 1;
      let v = (hash2(x, y, 3) * 4) | 0; const frame = ((t >> 4) + ((x + y) & 1)) & 3;
      if (K.ramp === 'sky' && !K.tex) { const yy = y + hash2(x, y, 9) * 4 - 2; v = yy < 10 ? 0 : yy < 20 ? 1 : yy < 34 ? 2 : 3; } // (the sky's bands run down the world, mixed at their seams)
      // a cliff over this tile: the land to the north stands higher (or this is water or air under land)
      const N = KIND_BY_ID[this.kindAt(x, y - 1)];
      const up = N && N.land && !N.low && (!K.land || N.z > K.z) ? N.cliff : null;
      drawImg(f, groundImg(k, mask, v, frame, up), x * 16 - cx, y * 16 - cy + VIEW_TOP);
    }
  }

  // ---- scenery, as a list to be sorted with the places and the player
  sprites(cam, t) {
    const cx = Math.floor(cam.x), cy = Math.floor(cam.y), out = [];
    const x0 = Math.floor(cx / 16) - 2, x1 = Math.floor((cx + 255) / 16) + 2, y0 = Math.floor(cy / 16), y1 = Math.floor((cy + (VIEW_BOT - VIEW_TOP) - 1) / 16) + 4;
    for (let y = Math.max(0, y0); y <= Math.min(this.rows - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(this.cols - 1, x1); x++) {
      const g = this.grid(x, y), v = g.deco[y * this.cols + x];
      if (!v) continue;
      const name = this.W.decoNames[(v >> 2) - 1], D = DECO[name];
      const fr = D.frames > 1 ? ((name === 'tree' || name === 'pine' || name === 'palm' ? t >> 5 : name.startsWith('tower') ? (t >> 6) + x * 3 + y : name === 'sailboat' || name === 'buoy' ? (t >> 4) + x : t >> 4)) + ((x * 7 + y * 3) & 3) : 0;
      const img = decoImg(name, fr, v & 3);
      const by = y * 16 + 15, bx = x * 16 + 8;
      out.push({ y: by, draw: (f) => drawImg(f, img, Math.round(bx - img.w / 2 - cx), Math.round(by - img.h + 1 - cy + VIEW_TOP)) });
    }
    return out;
  }

  // ---- paths
  samples(e, step) {
    const key = `_s${step}`;
    if (!e[key]) { const S = []; for (let d = 0; d <= e.len; d += step) { const p = pointOn(e, d); S.push({ x: p.x, y: p.y, tx: p.tx, ty: p.ty, d }); } e[key] = S; }
    return e[key];
  }
  paths(f, cam, t) {
    const cx = Math.floor(cam.x), cy = Math.floor(cam.y), ox = -cx, oy = VIEW_TOP - cy;
    const inView = (x, y) => x + ox > -12 && x + ox < 268 && y + oy > VIEW_TOP - 12 && y + oy < VIEW_BOT + 12;
    for (const e of this.W.edges) {
      const frac = this.edgeFrac[e.key];
      if (!frac) continue;
      const lim = e.len * Math.min(1, frac);
      const type = e.type;
      const step = type === 'bus' ? 4 : type === 'bridge' ? 3 : type === 'stairs' ? 6 : type === 'ledge' ? 4 : type === 'void' ? 9 : type === 'boat' ? 10 : type === 'secret' ? 7 : 2;
      const S = this.samples(e, step);
      // a path is drawn only near the screen
      let any = false; for (let i = 0; i < S.length; i += 6) if (inView(S[i].x, S[i].y)) { any = true; break; }
      if (!any) continue;
      for (const s of S) {
        if (s.d > lim) break;
        if (!inView(s.x, s.y)) continue;
        const x = Math.round(s.x + ox), y = Math.round(s.y + oy), nx = -s.ty, ny = s.tx;
        if (type === 'walk') {
          f.rect(x - 4, y - 3, 9, 8, PATH.edge);
        } else if (type === 'bus') {
          for (let k = -4; k <= 4; k++) f.px(Math.round(x + nx * k), Math.round(y + ny * k), Math.abs(k) >= 4 ? ROAD.edge : ROAD.asphalt);
          if (((s.d / step) | 0) % 3 === 0) f.rect(x - 1, y, 3, 1, ROAD.dash);
        } else if (type === 'bridge') {
          for (let k = -5; k <= 5; k++) { const px = Math.round(x + nx * k), py = Math.round(y + ny * k); f.px(px, py, Math.abs(k) === 5 ? WOOD.dk : ((s.d / step) | 0) % 2 ? WOOD.hi : WOOD.mid); }
          f.px(Math.round(x + nx * 6), Math.round(y + ny * 6 - 1), WOOD.dk); f.px(Math.round(x - nx * 6), Math.round(y - ny * 6 - 1), WOOD.dk);
        } else if (type === 'boat') {
          const on = (((s.d / step) | 0) + (t >> 4)) % 2;
          f.rect(x - 1, y, 3, 1, on ? FOAMC : c32(18, 26, 31)); if (!on) f.px(x, y + 1, c32(18, 26, 31));
        } else if (type === 'stairs') {
          const row = ((s.d / step) | 0) & 1;
          f.rect(x - 5, y - 1, 10, 2, MARBLE.hi); f.rect(x - 5, y + 1, 10, 1, row ? MARBLE.dk : MARBLE.mid);
        } else if (type === 'ledge') {
          f.rect(x - 4, y - 1, 8, 3, ASHPLANK); f.rect(x - 4, y - 1, 8, 1, ASHHI); f.px(x - 4, y + 2, ROPE); f.px(x + 3, y + 2, ROPE);
        } else if (type === 'void') {
          const a = (((s.d / step) | 0) + (t >> 5)) & 1;
          f.rect(x - 2, y - 2, 4, 4, a ? VOIDC.hi : VOIDC.lo); f.px(x - 2, y + 2, VOIDC.lo);
        } else if (type === 'secret') {
          if ((((s.d / step) | 0) % 3) !== 2) { f.rect(x - 1, y - 1, 2, 2, SECRETC.hi); f.px(x + 1, y + 1, SECRETC.lo); }
        }
      }
      // a walk path is a cream road with a dark rim and a worn shade on its south side, dotted down the middle like an old overworld's
      if (type === 'walk') {
        for (const s of S) { if (s.d > lim) break; if (!inView(s.x, s.y)) continue; const x = Math.round(s.x + ox), y = Math.round(s.y + oy); f.rect(x - 3, y - 2, 7, 6, PATH.trail); }
        for (const s of S) { if (s.d > lim) break; if (!inView(s.x, s.y)) continue; const x = Math.round(s.x + ox), y = Math.round(s.y + oy); f.rect(x - 3, y - 2, 7, 4, PATH.cream); }
        for (const s of S) { if (s.d > lim || (((s.d / 8) | 0) % 3)) continue; if (!inView(s.x, s.y)) continue; f.rect(Math.round(s.x + ox), Math.round(s.y + oy), 2, 1, PATH.trail); }
      }
    }
  }

  // ---- clouds: the bank over everything north of fogY, and each cloud-covered realm that is not open
  clouds(f, cam, t) {
    const fog = this.fogY, dir = this.fogDir || 'up';
    const covers = [];
    if (dir === 'up' && fog > 0) covers.push((wx, wy) => fog - wy);
    if (dir === 'down' && fog < this.rows * 16) covers.push((wx, wy) => wy - fog);
    if (dir === 'right' && fog < this.cols * 16) covers.push((wx, wy) => wx - fog);
    for (const R of this.W.realms) {
      if (R.fx !== 'clouds') continue;
      const p = this.realmP[R.id] ?? 0;
      if (p >= 1) continue;
      const [x0, y0, x1, y1] = R._px, ax = R._at[0], ay = R._at[1], rmax = R._rmax;
      covers.push((wx, wy) => {
        const inside = Math.min(wx - x0, x1 - wx, wy - y0, y1 - wy);
        if (inside < -24) return -99;
        return Math.min(inside + 8, Math.hypot(wx - ax, wy - ay) - p * rmax);
      });
    }
    if (!covers.length) return;
    paintClouds(f, cam, [VIEW_TOP, VIEW_BOT], (wx, wy) => { let d = -99; for (const c of covers) d = Math.max(d, c(wx, wy)); return d; }, t, 18, this.fogSky);
  }

  // ---- the effects of a reveal in progress: a crack across the ground, a tear, sparkles at the wave front
  effects(f, cam, t) {
    const ox = -Math.floor(cam.x), oy = VIEW_TOP - Math.floor(cam.y);
    for (const R of this.W.realms) {
      const p = this.realmP[R.id] ?? 0;
      if (p <= 0 || p >= 1 || R.fx === 'clouds') continue;
      if (R.fx === 'sweep') sparkleRing(f, R._at[0] + ox, R._at[1] + oy, p * R._rmax, t);
      else {
        const hot = R.fx === 'tear' ? c32(31, 31, 31) : c32(31, 18, 4), dark = R.fx === 'tear' ? c32(0, 0, 1) : c32(2, 1, 3);
        const grow = Math.min(1, p / 0.35), L = R._line;
        let total = 0; const segs = [];
        for (let i = 1; i < L.length; i++) { const l = Math.hypot(L[i][0] - L[i - 1][0], L[i][1] - L[i - 1][1]); segs.push(l); total += l; }
        let d = 0;
        for (let i = 1; i < L.length; i++) {
          const [ax, ay] = L[i - 1], [bx, by] = L[i], l = segs[i - 1];
          for (let s = 0; s < l; s += 1) {
            if (d + s > total * grow) break;
            const u = s / l, x = ax + (bx - ax) * u, y = ay + (by - ay) * u, jig = Math.round(Math.sin((d + s) * 0.7) * 2 + Math.sin((d + s) * 1.9) * 1), w = p > 0.35 ? 3 : 2;
            f.rect(Math.round(x + ox) + jig - 1, Math.round(y + oy), w, 1, dark);
            if ((s + (t >> 1)) % 5 === 0) f.px(Math.round(x + ox) + jig, Math.round(y + oy), hot);
          }
          d += l;
        }
      }
    }
  }
}
