// Builds one zone of the world from data/world/ (spec §19 G4, G11): runs the paint commands into two tile grids (what the map looks like
// while its realms are hidden, and what it becomes when every realm is revealed), places the scenery, and lays the nodes and paths out in
// pixels. A zone authored with an `origin` is moved to its own coordinates first (tile c, r of the data is c - origin[0], r - origin[1]).
//
//   buildWorld(zoneId)  ->  { id, cols, rows, px: [w, h], H: {ter, deco}, S: {ter, deco}, realmOf, realms, regions, nodes, edges, fog, decoNames, Z }
//   ter grids are Uint8Array of ground kind ids (tiles.js KINDS); deco grids are Uint16Array: 0 nothing, else (deco index + 1) << 2 | variant
import { ZONES } from '../../data/world/index.js';
import { KINDS, KIND_BY_ID, DECO, isLand } from './tiles.js';
import { hash2, vnoise } from './img.js';

const DECO_NAMES = Object.keys(DECO);
const DECO_INDEX = Object.fromEntries(DECO_NAMES.map((n, i) => [n, i]));
const inClip = (clip, x, y) => !clip || (x >= clip[0] && x <= clip[2] && y >= clip[1] && y <= clip[3]);

function paint(G, cmds, clip) {
  const { cols, rows, ter, deco } = G, [ox, oy] = G.o || [0, 0]; // (noise is taken at the authored coordinates, so a moved map keeps its shapes)
  const set = (x, y, id) => { if (x >= 0 && y >= 0 && x < cols && y < rows && inClip(clip, x, y)) { ter[y * cols + x] = id; } };
  for (const cmd of cmds) {
    const [op] = cmd;
    if (op === 'fill') {
      const id = KINDS[cmd[1]].id;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (inClip(clip, x, y)) { ter[y * cols + x] = id; deco[y * cols + x] = 0; }
    } else if (op === 'blob') {
      const [, kind, cx, cy, rx, ry, seed = 0, o = {}] = cmd, id = KINDS[kind].id, wob = o.wobble ?? 0.55;
      for (let y = Math.floor(cy - ry - 2); y <= Math.ceil(cy + ry + 2); y++) for (let x = Math.floor(cx - rx - 2); x <= Math.ceil(cx + rx + 2); x++) {
        if (x < 0 || y < 0 || x >= cols || y >= rows || !inClip(clip, x, y)) continue;
        const dx = (x - cx) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy, n = vnoise((x + ox) * 0.42, (y + oy) * 0.42, seed) - 0.5;
        if (d < 1 + n * wob * 1.6) { if (o.on && !isLand(ter[y * cols + x])) continue; ter[y * cols + x] = id; if (!KINDS[kind].land) deco[y * cols + x] = 0; }
      }
    } else if (op === 'rect') {
      const [, kind, c0, r0, c1, r1, o = {}] = cmd, id = KINDS[kind].id;
      for (let y = r0; y <= r1; y++) for (let x = c0; x <= c1; x++) { if (o.on === 'land' && !isLand(ter[y * cols + x])) continue; set(x, y, id); }
    } else if (op === 'scatter') {
      const [, name, area, density, seed, o = {}] = cmd, di = DECO_INDEX[name];
      if (di === undefined) throw new Error(`world: no scenery ${name}`);
      const on = o.on ? new Set(o.on.map((k) => KINDS[k].id)) : null;
      let x0, y0, x1, y1, blob = null;
      if (area[0] === 'blob') { blob = area; x0 = area[1] - area[3]; x1 = area[1] + area[3]; y0 = area[2] - area[4]; y1 = area[2] + area[4]; } else [x0, y0, x1, y1] = area;
      for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
        if (x < 0 || y < 0 || x >= cols || y >= rows || !inClip(clip, x, y)) continue;
        if (blob) { const dx = (x - blob[1]) / blob[3], dy = (y - blob[2]) / blob[4]; if (dx * dx + dy * dy > 1) continue; }
        const i = y * cols + x;
        const wet = DECO[name].on || 'land', K = KIND_BY_ID[ter[i]];
        if (deco[i] || (wet === 'land' && !K.land) || (wet === 'water' && !K.water) || (on && !on.has(ter[i]))) continue;
        if (hash2(x + ox, y + oy, seed) < density) deco[i] = ((di + 1) << 2) | (o.v ? Math.floor(hash2(x + ox, y + oy, seed + 7) * o.v) & 3 : 0);
      }
    } else if (op === 'put') {
      const [, name, c, r, v = 0] = cmd, di = DECO_INDEX[name];
      if (di === undefined) throw new Error(`world: no scenery ${name}`);
      // a piece of scenery stands on land (a boat or a buoy floats, a cloud hangs in the sky): one put where the ground is not is skipped
      const k = KIND_BY_ID[ter[r * cols + c]], wet = DECO[name].on || 'land';
      if (c >= 0 && r >= 0 && c < cols && r < rows && inClip(clip, c, r) && (wet === 'any' || (wet === 'land' ? k.land : wet === 'water' ? k.water : k.air))) deco[r * cols + c] = ((di + 1) << 2) | (v & 3);
    } else throw new Error(`world: unknown paint command ${op}`);
  }
}

const copy = (G) => ({ cols: G.cols, rows: G.rows, o: G.o, ter: G.ter.slice(), deco: G.deco.slice() });

// a zone in its own coordinates
export function localize(Z) {
  const [oc, orr] = Z.origin || [0, 0];
  if (!oc && !orr) return Z;
  const P = ([c, r]) => [c - oc, r - orr], Rc = ([c0, r0, c1, r1]) => [c0 - oc, r0 - orr, c1 - oc, r1 - orr];
  const cmd = (m) => {
    const [op] = m;
    if (op === 'blob') return [op, m[1], m[2] - oc, m[3] - orr, ...m.slice(4)];
    if (op === 'rect') return [op, m[1], ...Rc(m.slice(2, 6)), ...m.slice(6)];
    if (op === 'scatter') { const a = m[2]; return [op, m[1], a[0] === 'blob' ? ['blob', a[1] - oc, a[2] - orr, a[3], a[4]] : Rc(a), ...m.slice(3)]; }
    if (op === 'put') return [op, m[1], m[2] - oc, m[3] - orr, ...m.slice(4)];
    return m;
  };
  return {
    ...Z, origin: [0, 0],
    base: Z.base.map(cmd),
    realms: (Z.realms || []).map((R) => ({ ...R, rect: Rc(R.rect), at: R.at && P(R.at), line: R.line && R.line.map(P), cover: (R.cover || []).map(cmd), full: (R.full || []).map(cmd) })),
    regions: (Z.regions || []).map((R) => ({ ...R, rect: Rc(R.rect) })),
    nodes: Object.fromEntries(Object.entries(Z.nodes).map(([id, n]) => [id, { ...n, c: n.c - oc, r: n.r - orr }])),
    edges: Z.edges.map((e) => ({ ...e, via: e.via && e.via.map(P) })),
    fog: Z.fog && { ...Z.fog, rows: Z.fog.rows.map((r) => r - orr) },
  };
}

export function buildWorld(zoneId = 'main') {
  const WORLD = localize(ZONES[zoneId]);
  const { cols, rows } = WORLD;
  const base = { cols, rows, o: ZONES[zoneId].origin || [0, 0], ter: new Uint8Array(cols * rows), deco: new Uint16Array(cols * rows) };
  paint(base, WORLD.base);
  const H = copy(base), S = copy(base);
  const realmOf = new Int8Array(cols * rows).fill(-1);
  (WORLD.realms = WORLD.realms || []).forEach((R, i) => {
    const [c0, r0, c1, r1] = R.rect;
    for (let y = r0; y <= r1; y++) for (let x = c0; x <= c1; x++) realmOf[y * cols + x] = i;
    paint(H, R.cover || [], R.rect);
    paint(S, R.full || [], R.rect);
  });

  // nodes and paths in pixels
  const nodes = {};
  for (const [id, n] of Object.entries(WORLD.nodes)) nodes[id] = { id, ...n, x: n.c * 16 + 8, y: n.r * 16 + 8 };
  const edges = WORLD.edges.map((e, i) => {
    const A = nodes[e.a], B = nodes[e.b];
    if (!A || !B) throw new Error(`world: edge ${e.a}-${e.b} has an unknown end`);
    const pts = [[A.x, A.y], ...(e.via || []).map(([c, r]) => [c * 16 + 8, r * 16 + 8]), [B.x, B.y]];
    let len = 0; for (let k = 1; k < pts.length; k++) len += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
    return { ...e, i, key: `${e.a}-${e.b}`, pts, len, type: e.type || 'walk' };
  });

  // keep the scenery off the places and the paths: a keep-out mask (a place's landmark and pad, a path and a tile either side), and any
  // piece of scenery whose footprint (it stands on its tile and rises by its height, spreads by its width) touches it goes
  const keep = new Uint8Array(cols * rows);
  const mark = (x, y) => { if (x >= 0 && y >= 0 && x < cols && y < rows) keep[y * cols + x] = 1; };
  for (const n of Object.values(nodes)) for (let y = n.r - 3; y <= n.r + 1; y++) for (let x = n.c - 2; x <= n.c + 2; x++) mark(x, y);
  for (const e of edges) for (let k = 1; k < e.pts.length; k++) {
    const [ax, ay] = e.pts[k - 1], [bx, by] = e.pts[k], n = Math.ceil(Math.hypot(bx - ax, by - ay) / 6);
    for (let s = 0; s <= n; s++) { const x = Math.floor((ax + ((bx - ax) * s) / n) / 16), y = Math.floor((ay + ((by - ay) * s) / n) / 16); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) mark(x + dx, y + dy); }
  }
  for (const G of [H, S]) for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const v = G.deco[y * cols + x];
    if (!v) continue;
    const D = DECO[DECO_NAMES[(v >> 2) - 1]], up = Math.max(0, Math.ceil((D.h - 16) / 16)), side = Math.max(0, Math.round((D.w - 16) / 32));
    let hit = false;
    for (let yy = y - up; yy <= y && !hit; yy++) for (let xx = x - side; xx <= x + side; xx++) if (xx >= 0 && yy >= 0 && xx < cols && yy < rows && keep[yy * cols + xx]) { hit = true; break; }
    if (hit) G.deco[y * cols + x] = 0;
  }
  return { id: zoneId, Z: WORLD, cols, rows, px: [cols * 16, rows * 16], H, S, realmOf, realms: WORLD.realms, regions: WORLD.regions || [], nodes, edges, fog: WORLD.fog || null, decoNames: DECO_NAMES };
}

export { KIND_BY_ID };
