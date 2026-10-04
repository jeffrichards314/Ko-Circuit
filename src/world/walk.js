// Walking the world's paths (spec §19 G4): a player stands on a node or somewhere along a path, a direction moves along the path that
// leaves in that direction, and if no path leaves that way nothing happens. Pure logic (no drawing), so the tools can test it.
//
//   Walker   { node, edge, d, dir, route }  on a node (edge null) or on `edge` at distance d from its `a` end, moving dir (+1 toward b, -1 toward a)
//   legs(graph, node)            the paths that leave a node, each with the unit vector it leaves in
//   pickLeg(graph, node, vec)    the one that best matches a direction (within 60 degrees), or null
//   stepWalker(...)              one frame of movement
//   routeTo(graph, from, to)     the shortest chain of nodes over the paths you can walk right now
//   pointOn(edge, d)             where a path is at a distance, and which way it runs there

export const SPEED = { walk: 1.45, bus: 2.5, bridge: 1.5, boat: 1.9, stairs: 1.25, ledge: 1.35, void: 1.5, secret: 1.45 };

// graph: { nodes, edges (walkable ones only), adj: Map node -> [{ edge, end: 'a'|'b' }] }
export function makeGraph(nodes, edges) {
  const adj = new Map();
  for (const e of edges) {
    if (!adj.has(e.a)) adj.set(e.a, []);
    if (!adj.has(e.b)) adj.set(e.b, []);
    adj.get(e.a).push({ edge: e, end: 'a', to: e.b });
    adj.get(e.b).push({ edge: e, end: 'b', to: e.a });
  }
  return { nodes, edges, adj };
}

export function pointOn(edge, d) {
  const P = edge.pts;
  d = Math.max(0, Math.min(edge.len, d));
  for (let i = 1; i < P.length; i++) {
    const L = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    if (d <= L || i === P.length - 1) {
      const u = L ? Math.min(1, d / L) : 1;
      return { x: P[i - 1][0] + (P[i][0] - P[i - 1][0]) * u, y: P[i - 1][1] + (P[i][1] - P[i - 1][1]) * u, tx: L ? (P[i][0] - P[i - 1][0]) / L : 1, ty: L ? (P[i][1] - P[i - 1][1]) / L : 0 };
    }
    d -= L;
  }
  return { x: P[0][0], y: P[0][1], tx: 1, ty: 0 };
}

// the unit vector a path leaves its end in (looking a little way along it, so a tiny first step does not decide)
function leaving(edge, end) {
  const a = pointOn(edge, end === 'a' ? 0 : edge.len), b = pointOn(edge, end === 'a' ? Math.min(edge.len, 10) : Math.max(0, edge.len - 10));
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
  return [dx / L, dy / L];
}
export const legs = (graph, node) => (graph.adj.get(node) || []).map((l) => ({ ...l, to: l.end === 'a' ? l.edge.b : l.edge.a, vec: leaving(l.edge, l.end) }));

export function pickLeg(graph, node, vec, minDot = 0.5) {
  const L = Math.hypot(vec[0], vec[1]);
  if (!L) return null;
  const v = [vec[0] / L, vec[1] / L];
  let best = null, bs = minDot - 1e-9;
  for (const l of legs(graph, node)) { const s = l.vec[0] * v[0] + l.vec[1] * v[1]; if (s > bs) { bs = s; best = l; } }
  return best;
}

export function newWalker(node) { return { node, edge: null, d: 0, dir: 1, route: [], type: 'walk', moving: false }; }
export function walkerPos(graph, w) {
  if (!w.edge) { const n = graph.nodes[w.node]; return { x: n.x, y: n.y, tx: w.face || 0, ty: 0 }; }
  const p = pointOn(w.edge, w.d);
  return { ...p, tx: p.tx * w.dir, ty: p.ty * w.dir };
}

function startLeg(w, leg) { w.edge = leg.edge; w.dir = leg.end === 'a' ? 1 : -1; w.d = leg.end === 'a' ? 0 : leg.edge.len; w.type = leg.edge.type; w.node = null; w.moving = true; }

// shortest chain of nodes (BFS by path length) over the walkable paths: [from, ..., to], or null
export function routeTo(graph, from, to) {
  if (from === to) return [from];
  const dist = new Map([[from, 0]]), prev = new Map(), open = [from];
  while (open.length) {
    open.sort((p, q) => dist.get(p) - dist.get(q));
    const u = open.shift();
    if (u === to) break;
    for (const l of graph.adj.get(u) || []) {
      const nd = dist.get(u) + l.edge.len;
      if (!dist.has(l.to) || nd < dist.get(l.to)) { dist.set(l.to, nd); prev.set(l.to, u); open.push(l.to); }
    }
  }
  if (!prev.has(to)) return null;
  const out = [to];
  while (out[0] !== from) out.unshift(prev.get(out[0]));
  return out;
}

// tap-to-walk: aim a walker at a node. Returns false if no path leads there.
export function aimWalker(graph, w, target) {
  if (!graph.nodes[target]) return false;
  if (!w.edge) {
    if (w.node === target) { w.route = []; return true; }
    const r = routeTo(graph, w.node, target);
    if (!r) return false;
    w.route = r.slice(1);
    return true;
  }
  // mid-path: finish the path to whichever end is the better way there
  const e = w.edge, options = [];
  for (const end of ['a', 'b']) {
    const node = end === 'a' ? e.a : e.b, r = routeTo(graph, node, target);
    if (r) { let len = 0; for (let i = 1; i < r.length; i++) len += (graph.adj.get(r[i - 1]).find((l) => l.to === r[i]) || { edge: { len: 0 } }).edge.len; options.push({ end, r, cost: (end === 'a' ? w.d : e.len - w.d) + len }); }
  }
  if (!options.length) return false;
  options.sort((p, q) => p.cost - q.cost);
  const o = options[0];
  w.dir = o.end === 'a' ? -1 : 1;
  w.route = o.r.slice(1);
  w.routeVia = o.end === 'a' ? e.a : e.b; // (the end it is heading for first; it is not part of the route)
  return true;
}

// One frame. `vec` is the direction held ([0, 0] for none), `fresh` true on the frame a direction was just pressed.
// Returns an event: 'arrive' (stopped on a node: w.node), 'start', or null.
export function stepWalker(graph, w, vec, speedMul = 1) {
  const has = vec && (vec[0] || vec[1]);
  if (!w.edge) {
    w.moving = false;
    // a route (a tap) or a held direction sets off; a direction held or pressed during a route takes it over
    if (has && w.route.length) w.route = [];
    let leg = null;
    if (w.route.length) { const to = w.route[0]; leg = legs(graph, w.node).find((l) => l.to === to) || null; if (!leg) w.route = []; }
    else if (has) leg = pickLeg(graph, w.node, vec);
    if (!leg) return null;
    if (w.route.length) w.route.shift();
    w.from = w.node; w.facing = leg.vec[0];
    startLeg(w, leg);
    return 'start';
  }
  const e = w.edge, sp = (SPEED[e.type] || 1.4) * speedMul;
  // a held direction against the way you are going turns you round; along it keeps you going; a side-on one does nothing
  if (has && !w.route.length) {
    const p = pointOn(e, w.d), L = Math.hypot(vec[0], vec[1]), dot = (vec[0] * p.tx + vec[1] * p.ty) / L * w.dir;
    if (dot < -0.5) w.dir = -w.dir;
  } else if (has && w.route.length) { w.route = []; }
  w.d += sp * w.dir;
  w.moving = true;
  const p = pointOn(e, w.d);
  w.face = p.tx * w.dir;
  if (w.d >= e.len || w.d <= 0) {
    const end = w.d >= e.len ? e.b : e.a;
    w.d = w.d >= e.len ? e.len : 0; w.edge = null; w.node = end; w.moving = false;
    // a fork-free junction (a dock, a bend) is not a place to stop: go on through while the way on is clear and nothing has asked to stop
    const n = graph.nodes[end], ls = legs(graph, end);
    if (n && n.kind === 'junction' && ls.length === 2 && !w.route.length) {
      const from = e, next = ls.find((l) => l.edge !== from);
      if (next) { startLeg(w, next); w.node = null; return 'through'; }
    }
    return 'arrive';
  }
  return null;
}
