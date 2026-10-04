// THE WORLD MAP (spec §19 G4, G11): scrolling, tile-based overworlds in the manner of an old console platformer's. The world is six maps
// (data/world/), each a world of its own; this screen shows one at a time. You walk it: a direction moves you along the path that leaves
// that way (nothing happens if none does), A / START enters the place you stand on, and everything the game has (the circuits, Dash,
// Title Defense, the Gauntlet, the home gym) is a place on it. A PORTAL at a map's edge leads to another map by a journey
// (src/screens/travel.js); when the career moves on to another map the runner walks to its portal and the journey plays by itself.
//
//   the terrain, paths and clouds are painted by src/world/paint.js from data/world/; the walking is src/world/walk.js; the life on each
//   map (birds, spotlights, spirits, embers, drifting debris) is src/world/ambient.js
//   a place's interior (podiums, stations) is src/screens/interior.js
//   REVEALS: when something has unlocked since the map was last seen, the map plays it before handing you the pad: the clouds lift off
//   the next stretch of road, a secret's land rises from the sea, a path is drawn dot by dot, the sky parts and a staircase climbs it,
//   the ground splits into a chasm, a tear opens at the edge of the world. START skips them.
import { drawBlock, linesOf } from '../engine/textbox.js';
import { COL, UIPAL, panel } from '../fight/hud.js';
import { drawText, drawTextCentered, textWidth, wrapPx } from '../engine/font.js';
import { c32 } from '../engine/palette.js';
import { W } from '../engine/renderer.js';
import { ICONS } from '../../data/sprites/ui.js';
import { ZONES, NODES, NODE_ZONE, portalTo, entryOf, nextHop } from '../../data/world/index.js';
import { CIRCUITS, ROMAN, SHORT, CIRCUIT_ORDER, ASC_PATH, isRival, livesOf } from '../../data/circuits.js';
import { FIGHTERS } from '../../data/fighters/index.js';
import { ARENAS } from '../../data/arenas/index.js';
import { LANDMARKS } from '../scene/landmarks/index.js';
import { Gfx, bayer } from '../scene/gfx.js';
import { circuitStatus, noLives, voidReached, hasFallen } from '../save/career.js';
import { pantheonGate, ascensionSeen } from '../save/unlocks.js';
import { medalCount, ascMedalCount, MEDAL_TOTAL } from '../save/medals.js';
import { buildWorld } from '../world/terrain.js';
import { WorldPainter, VIEW_TOP, VIEW_BOT } from '../world/paint.js';
import { cond, nodeState, loadWorld, saveWorld, fogIndex, fogLine, zoneOpen, inRect } from '../world/state.js';
import { AMBIENT } from '../world/ambient.js';
import { makeGraph, newWalker, stepWalker, walkerPos, aimWalker, pointOn } from '../world/walk.js';
import { drawRunner, drawBeltIcon } from './mapkit.js';
import { makeImg, drawImg } from '../world/img.js';
import { plinth, flanks, medallion, rivalBadge, bossMark } from '../world/markers.js';

export { VIEW_TOP, VIEW_BOT };
const BUILT = {};
export const getWorld = (zone = 'main') => (BUILT[zone] ||= buildWorld(zone));

const INK = c32(2, 2, 4), SIL_LOCK = c32(7, 9, 16);
const RIVAL_COL = c32(4, 24, 22), RIVAL_DK = c32(1, 11, 12), GOLD = c32(30, 24, 6), GOLD_DK = c32(18, 12, 2);
const disc = (f, cx, cy, r, col) => { for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); f.rect(cx - w, cy + y, w * 2 + 1, 1, col); } };
const FX_FRAMES = { sweep: 120, clouds: 170, crack: 230, tear: 190 };

// where a place's interior is: a circuit or Dash's fight, the home gym, a mode's hall
export const interiorOf = (n) => (n.kind === 'home' ? 'home' : n.kind === 'mode' ? n.interior : n.kind === 'circuit' || n.kind === 'rival' ? n.id : null);
// the node a career stands at on the map: its circuit's, or home
export const nodeOfCareer = (c) => (c && NODES[c.circuit] ? c.circuit : 'home');
// the places that appear with a little show the first time (a hall, a gate, a portal that opens with the career); the rest are just there
const popsIn = (n) => (n.kind === 'mode' || n.kind === 'gate' || n.kind === 'portal' || n.kind === 'blimp') && !!(n.needs || n.kind === 'gate');
// A career put in by password: every open world is taken as already seen just as the career has it (its paths, secrets, gates and
// clouds), so no reveal replays anywhere; you stand at the career's place.
export function snapWorld(g) {
  for (const z of Object.keys(ZONES)) {
    if (!zoneOpen(g, z)) continue;
    const first = Object.keys(ZONES[z].nodes)[0];
    new WorldMapScreen(g, { snap: true, arrive: first }); // (setting up with `snap` writes what it sees into the map's memory)
  }
  const ws = loadWorld(), c = g.career;
  ws.pos = nodeOfCareer(c); ws.sig = `${c.circuit}|${c.main}|${c.asc}`;
  saveWorld(ws);
}
export const beltCount = (c) => [...CIRCUIT_ORDER, ...ASC_PATH].filter((id) => circuitStatus(c, id) === 'cleared').length;

// the bus and the boat: what you ride on the stretches that are not walked
const busImg = (fr) => makeImg(28, 15, (f) => {
  f.rect(1, 3, 26, 9, c32(29, 23, 3)); f.rect(1, 3, 26, 1, c32(31, 29, 12)); f.rect(1, 11, 26, 1, c32(20, 14, 1)); f.rect(0, 5, 1, 5, c32(20, 14, 1)); f.rect(27, 5, 1, 5, c32(20, 14, 1));
  for (let i = 0; i < 4; i++) f.rect(3 + i * 6, 5, 4, 4, c32(10, 20, 28)); f.rect(23, 5, 3, 6, c32(10, 20, 28)); f.rect(1, 9, 26, 1, c32(6, 5, 4));
  for (const x of [5, 20]) { disc(f, x, 12, 2, c32(3, 3, 4)); f.px(x, 12, c32(18, 18, 20)); }
  f.rect(3, 2 + (fr & 1) * 0, 6, 1, c32(31, 29, 12));
});
const boatImg = (fr) => makeImg(26, 12, (f) => {
  const b = fr & 1;
  f.rect(2, 6 + b, 22, 3, c32(19, 11, 5)); f.rect(4, 9 + b, 18, 1, c32(11, 6, 3)); f.rect(2, 6 + b, 22, 1, c32(26, 17, 9)); f.rect(0, 5 + b, 3, 2, c32(19, 11, 5)); f.rect(23, 5 + b, 3, 2, c32(19, 11, 5));
  f.rect(6, 4 + b, 14, 1, c32(11, 6, 3));
});

export class WorldMapScreen {
  constructor(game, args = {}) {
    this.g = game; this.args = args; this.t = 0;
    this.c = game.career;
    this.ws = loadWorld();
    this.cam = { x: 0, y: 0 };
    this.note = null; this.noteT = 0;
    this.flash = 0;
    this.steps = []; this.cur = null; this.skipped = false;
    this.edgeOn = {}; this.realmOn = {};
    this.song = null;
    this.setup();
  }

  // ---- setting the map up for this career ------------------------------------------------------------------------------------------
  edgeWanted(e) { return cond(e.needs, this.g) && (!e.realm || this.realmOn[e.realm]); }
  // which map to show, and where on it you stand
  place() {
    const g = this.g, c = this.c, ws = this.ws, a = this.args;
    const target = nodeOfCareer(c);
    let pos = a.arrive && NODES[a.arrive] ? a.arrive : a.fresh ? 'home' : a.snap || !ws.pos || !NODES[ws.pos] ? target : ws.pos;
    // (a map that has closed behind you, like the sky after The Fall, sends you to where the career is)
    let closed = false;
    if (!zoneOpen(g, NODE_ZONE[pos])) { pos = target; closed = true; }
    if (!zoneOpen(g, NODE_ZONE[pos])) { pos = 'home'; closed = false; }
    return { pos, zone: NODE_ZONE[pos], target, closed };
  }
  setup() {
    const g = this.g, c = this.c, ws = this.ws;
    const { pos: pos0, zone, target, closed } = this.place();
    this.zone = zone;
    ws.visited = { ...(ws.visited || {}), [zone]: true }; saveWorld(ws); // (the blimp on the road waits until you have been to the city)
    const W_ = this.W = getWorld(zone);
    this.P = new WorldPainter(W_);
    this.amb = AMBIENT[W_.Z.ambient] || null;
    // what the career says now
    for (const R of W_.realms) this.realmOn[R.id] = cond(R.when, g);
    // a world memory from before (or none: an older save, a new career) is taken as already seen: nothing plays that was not unlocked just now
    const first = !ws.seen;
    if (first) ws.seen = { realms: {}, edges: {}, nodes: {} };
    const snap = first || this.args.snap;
    for (const R of W_.realms) { if (snap) ws.seen.realms[R.id] = this.realmOn[R.id]; this.P.realmP[R.id] = ws.seen.realms[R.id] ? 1 : 0; }
    // the clouds: how far they have lifted (main: remembered as maxMain; the other maps by their own index)
    if (snap) ws.maxMain = Math.max(ws.maxMain || 0, c.main);
    const fi = fogIndex(W_, g, ws.maxMain);
    if (W_.fog && W_.fog.by !== 'main' && (snap || ws.fogI[zone] === undefined)) ws.fogI[zone] = fi;
    this.fogI = !W_.fog ? -1 : W_.fog.by === 'main' ? fogIndex(W_, { career: { main: 0 } }, ws.maxMain) : Math.min(fi, ws.fogI[zone]);
    this.fogShown = fogLine(W_, this.fogI);
    this.P.fogY = this.fogShown ?? 0; this.P.fogDir = W_.Z.fogDir || 'up'; this.P.fogSky = W_.Z.fogSky || 'day';
    for (const e of W_.edges) {
      const want = this.edgeWanted(e);
      if (snap) ws.seen.edges[e.key] = want;
      this.P.edgeFrac[e.key] = ws.seen.edges[e.key] ? 1 : 0;
    }
    for (const n of Object.values(W_.nodes)) if (popsIn(n) || n.kind === 'mode' || n.kind === 'gate' || n.kind === 'portal' || n.kind === 'blimp') { const vis = this.nodeWanted(n.id); if (snap) ws.seen.nodes[n.id] = vis; }
    // where you stand, and where the career has moved on to since the map was last seen
    const sig = `${c.circuit}|${c.main}|${c.asc}`;
    let pos = pos0;
    if (this.args.fresh) ws.sig = sig;
    const moved = !this.args.fresh && !this.args.snap && ws.sig && ws.sig !== sig;
    this.follow = null; this.autoTravel = null; this.travelNow = null;
    const tz = NODE_ZONE[target];
    // the map you were on has shut behind you (the sky, after The Fall): the journey into the career's map plays at once
    if (closed && entryOf(tz)) { const E = entryOf(tz); this.travelNow = { travel: E.travel, back: false, to: tz, at: E.at, from: E.from }; }
    else if (moved && tz === zone) this.follow = target;
    else if (moved && tz !== zone && zoneOpen(g, tz)) {
      // the career has gone on to another map: walk to this map's way there (or the way to the next map on the way there) and set off;
      // when it is not further in from here (The Fall, from the Pantheon), its journey plays at once
      const hop = nextHop(zone, tz), gate = hop && portalTo(zone, hop);
      if (gate && this.nodeWanted(gate.id)) { this.follow = gate.id; this.autoTravel = gate.id; }
      else { const E = entryOf(tz); if (E) this.travelNow = { travel: E.travel, back: false, to: tz, at: E.at, from: zone }; }
    }
    // (the career's move is remembered once it has been walked or travelled; a journey is taken as the move)
    if (!ws.sig || this.args.snap || (moved && !this.autoTravel && !this.travelNow)) ws.sig = sig;
    this.sig = sig;
    this.pos0 = pos;
    // collect what has to play
    this.collect();
    // the walkers graph follows what is drawn (an unfinished path is not walkable yet)
    this.rebuildGraph();
    if (!this.graph.nodes[pos] || !this.nodeShown(pos)) pos = this.nearestShown(pos);
    this.walker = newWalker(pos);
    this.here = pos; ws.pos = pos;
    const p = walkerPos(this.graph, this.walker);
    this.cam.x = this.clampX(p.x - W / 2); this.cam.y = this.clampY(p.y - (VIEW_BOT - VIEW_TOP) / 2 - 10);
    this.decideFollow = true;
    // a new game: how the map works, once; a new map: its name
    if (this.args.fresh) this.say('ARROWS WALK THE PATHS. A ENTERS A PLACE. START SKIPS.', 420);
    if (this.args.arrive) { const R = this.regionAt(p.x, p.y); this.regionId = R ? R.id : null; this.banner = { R: { name: W_.Z.name, sub: R ? R.name : '' }, t: 0 }; }
    saveWorld(ws);
  }
  nearestShown(pos) {
    const n = this.W.nodes[pos]; let best = Object.keys(this.W.nodes)[0], bd = Infinity;
    for (const id of Object.keys(this.W.nodes)) { if (!this.nodeShown(id)) continue; const m = this.W.nodes[id], d = n ? Math.hypot(m.x - n.x, m.y - n.y) : 0; if (d < bd) { bd = d; best = id; } }
    return best;
  }
  nodeWanted(id) {
    const n = this.W.nodes[id], c = this.c;
    if (n.needs && !cond(n.needs, this.g)) return false;
    if (n.kind === 'rival') return circuitStatus(c, id) !== 'locked';
    if (id === 'skygate') return !!c.flags.zeroBeaten;
    if (id === 'chasm') return hasFallen(c);
    if (id === 'voiddoor') return voidReached(c);
    return true;
  }
  // a node is drawn when it is wanted and its realm is far enough along (0 = not at all, 1 = fully; in between it dithers in)
  nodeAlphaNow(id) {
    const n = this.W.nodes[id], arriving = this.cur && this.cur.kind === 'node' && this.cur.id === id;
    if (!this.nodeWanted(id)) return 0;
    if (popsIn(n) && !this.ws.seen.nodes[id]) return arriving ? Math.min(1, this.cur.t / 40) : 0;
    const R = this.realmOfNode(n);
    if (R) { const p = this.P.realmP[R.id] ?? 0; if (p < 1) return Math.max(0, Math.min(1, R.fx === 'clouds' ? (p - 0.3) / 0.4 : (p - 0.55) / 0.4)); }
    return 1;
  }
  realmOfNode(n) { return this.W.realms.find((x) => x.id === n.realm) || this.W.realms.find((x) => inRect(n.c, n.r, x.rect)) || null; }
  nodeShown(id) { return this.nodeAlphaNow(id) >= 1; }
  rebuildGraph() {
    const edges = this.W.edges.filter((e) => (this.P.edgeFrac[e.key] || 0) >= 1 && this.nodeShown(e.a) && this.nodeShown(e.b));
    this.graph = makeGraph(this.W.nodes, edges);
  }

  collect() {
    const ws = this.ws, W_ = this.W, steps = [];
    for (const R of W_.realms) if (this.realmOn[R.id] !== !!ws.seen.realms[R.id]) steps.push({ kind: 'realm', id: R.id, to: this.realmOn[R.id] });
    if (W_.fog) { const to = fogIndex(W_, this.g, ws.maxMain); if (to > this.fogI) steps.push({ kind: 'fog', to }); }
    for (const e of W_.edges) {
      const want = this.edgeWanted(e);
      if (want && !ws.seen.edges[e.key]) steps.push({ kind: 'edge', key: e.key });
      else if (!want && ws.seen.edges[e.key]) { ws.seen.edges[e.key] = false; this.P.edgeFrac[e.key] = 0; }
    }
    for (const n of Object.values(W_.nodes)) if (popsIn(n) && this.nodeWanted(n.id) && !ws.seen.nodes[n.id]) steps.push({ kind: 'node', id: n.id });
    // a node in a realm that is coming up shows with it; the rest play in this order: fog, realms, paths, pop-ins
    const order = { fog: 0, realm: 1, edge: 2, node: 3 };
    steps.sort((a, b) => order[a.kind] - order[b.kind]);
    this.steps = steps;
  }

  // ---- camera ------------------------------------------------------------------------------------------------------------------------
  clampX(x) { return Math.max(0, Math.min(this.W.px[0] - W, x)); }
  clampY(y) { return Math.max(0, Math.min(this.W.px[1] - (VIEW_BOT - VIEW_TOP), y)); }
  focus() {
    if (this.cur && this.cur.focus) return this.cur.focus;
    const p = walkerPos(this.graph, this.walker);
    return { x: p.x, y: p.y };
  }

  enter() {
    const g = this.g, c = this.c;
    g.loc = { area: 'world' };
    // a career that has come to the door below the throne sees it open first (once)
    if (c && !c.flags.voidSeen && voidReached(c)) { g.go('voidDoor'); return; }
    // the career is on another map and there is no walking there from here: the journey plays now
    if (this.travelNow) { this.travel(this.travelNow); return; }
    this.playSong();
  }
  // each map has its own song
  playSong() {
    const S = this.g.songs, id = this.W.Z.song || 'map';
    if (this.song !== id) { this.song = id; this.g.audio.play(S[id] || S.map); }
  }
  // set off for another map: the journey, then that map at the place you arrive at
  travel(T) {
    const ws = this.ws, g = this.g;
    ws.pos = T.at; saveWorld(ws); // (the career's move is not taken as walked yet: on the other side you walk on to it)
    g.go('travel', { ...T, first: !ws.travel[`${T.travel}${T.back ? '<' : '>'}`] });
  }
  enterPortal(id) {
    const n = this.W.nodes[id];
    if (!zoneOpen(this.g, n.to)) { this.say('THE WAY IS SHUT.'); this.g.audio.sfx('tired'); return; }
    this.g.audio.sfx('confirm');
    this.travel({ travel: n.travel, back: !!n.back, to: n.to, at: n.at, from: this.zone });
  }

  // ---- update ------------------------------------------------------------------------------------------------------------------------
  update() {
    this.t++;
    if (this.noteT > 0 && --this.noteT === 0) this.note = null;
    if (this.flash > 0) this.flash--;
    const I = this.g.input;
    if (this.cur || this.steps.length) { this.updateReveal(I); this.camStep(); return; }
    if (this.decideFollow) { this.decideFollow = false; this.startFollow(); }
    this.updateWalk(I);
    this.camStep();
    this.updateRegion();
    if (this.amb && this.amb.update) this.amb.update(this);
  }
  // the region you stand in; walking into another one shows its name for a while
  regionAt(x, y) { const c = Math.floor(x / 16), r = Math.floor(y / 16); return (this.W.regions || []).find((R) => inRect(c, r, R.rect)) || null; }
  updateRegion() {
    const p = walkerPos(this.graph, this.walker), R = this.regionAt(p.x, p.y), id = R ? R.id : null;
    if (this.regionId === undefined) { this.regionId = id; return; }
    if (id !== this.regionId) { this.regionId = id; if (R) this.banner = { R, t: 0 }; }
    if (this.banner && ++this.banner.t > 150) this.banner = null;
  }
  paintBanner(f) {
    const B = this.banner; if (!B) return;
    const t = B.t, slide = t < 12 ? 12 - t : t > 138 ? t - 138 : 0, y = VIEW_TOP + 6 - slide * 3, name = B.R.name, sub = B.R.sub || '';
    const w = Math.max(textWidth(name, false), textWidth(sub, false)) + 24, x = 128 - (w >> 1);
    panel(f, x, y, w, sub ? 26 : 16);
    drawTextCentered(f, name, 128, y + 4, COL.yellow, { mono: false });
    if (sub) drawTextCentered(f, sub, 128, y + 14, COL.cyan, { mono: false });
  }
  camStep() {
    const p = this.focus(), tx = this.clampX(p.x - W / 2), ty = this.clampY(p.y - (VIEW_BOT - VIEW_TOP) / 2 - 10), k = this.cur ? 0.06 : 0.12;
    this.cam.x += (tx - this.cam.x) * k; this.cam.y += (ty - this.cam.y) * k;
    if (Math.abs(tx - this.cam.x) < 0.3) this.cam.x = tx; if (Math.abs(ty - this.cam.y) < 0.3) this.cam.y = ty;
  }
  startFollow() {
    const target = this.follow; this.follow = null;
    if (!target || !this.graph.nodes[target] || !this.nodeShown(target)) { if (this.autoTravel) { const id = this.autoTravel; this.autoTravel = null; if (this.W.nodes[id]) this.enterPortal(id); } return; }
    if (this.walker.node === target) { if (this.autoTravel === target) { this.autoTravel = null; this.enterPortal(target); } return; }
    if (!aimWalker(this.graph, this.walker, target)) {
      // no path from where you were (the ground opened, a map changed under you): you turn up there
      this.walker = newWalker(target); this.here = target; this.flash = 14;
      const p = walkerPos(this.graph, this.walker); this.cam.x = this.clampX(p.x - W / 2); this.cam.y = this.clampY(p.y - (VIEW_BOT - VIEW_TOP) / 2 - 10);
      if (this.autoTravel === target) { this.autoTravel = null; this.enterPortal(target); }
    }
    this.followTarget = target;
  }

  dirVec(I) {
    let x = 0, y = 0;
    if (I.held('left')) x -= 1; if (I.held('right')) x += 1; if (I.held('up')) y -= 1; if (I.held('down')) y += 1;
    return [x, y];
  }
  updateWalk(I) {
    const A = this.g.audio, w = this.walker;
    // taps: walk to a place, or enter the one you stand on
    const taps = I.takeTaps ? I.takeTaps() : [];
    for (const tp of taps) this.tap(tp);
    const vec = this.dirVec(I);
    const ev = stepWalker(this.graph, w, vec);
    if (w.moving && (this.t & 15) === 0 && w.type !== 'bus') A.sfx('tick');
    if (ev === 'arrive') {
      this.here = w.node; this.ws.pos = w.node; saveWorld(this.ws); A.sfx('confirm');
      if (this.autoTravel && w.node === this.autoTravel && !w.route.length) { const id = this.autoTravel; this.autoTravel = null; this.enterPortal(id); return; }
    }
    if (!w.edge && w.node && I.confirm()) this.enterNode(w.node);
    if (!w.edge && !w.route.length && this.here !== w.node && w.node) this.here = w.node;
  }
  tap(tp) {
    const cam = this.cam, wx = tp.x + cam.x, wy = tp.y - VIEW_TOP + cam.y;
    let best = null, bd = 22;
    for (const n of Object.values(this.W.nodes)) {
      if (!this.nodeShown(n.id)) continue;
      const d = Math.hypot(n.x - wx, n.y - 10 - wy); // (a place is tapped where its landmark is)
      const d2 = Math.hypot(n.x - wx, n.y - wy);
      const dd = Math.min(d, d2);
      if (dd < bd) { bd = dd; best = n.id; }
    }
    if (!best) return;
    const w = this.walker;
    if (!w.edge && w.node === best) { this.enterNode(best); return; }
    if (!aimWalker(this.graph, w, best)) { this.say('NO PATH THERE YET'); this.g.audio.sfx('tired'); }
  }
  say(text, frames = 150) { this.note = text; this.noteT = frames; }

  // ---- entering a place --------------------------------------------------------------------------------------------------------------
  enterNode(id) {
    const g = this.g, c = this.c, n = this.W.nodes[id], A = g.audio;
    const st = nodeState(g, id);
    if (n.kind === 'gate') return this.enterGate(id);
    if (n.kind === 'portal') return this.enterPortal(id);
    if (n.kind === 'blimp') { A.sfx('confirm'); this.ws.pos = id; saveWorld(this.ws); g.go('blimp', { from: id }); return; }
    const inner = interiorOf(n);
    if (!inner) return;
    if (n.kind === 'mode' && st === 'locked') { this.say('LOCKED. BEAT THE FIRST ZERO FIRST.'); A.sfx('tired'); return; }
    if ((n.kind === 'circuit' || n.kind === 'rival') && st === 'locked') {
      A.sfx('tired');
      this.say(n.kind === 'rival' ? 'HE IS NOT HERE YET.' : 'NOT OPEN YET. WIN THE BELT BEFORE IT.');
      return;
    }
    A.sfx('confirm');
    this.ws.pos = id; saveWorld(this.ws);
    g.loc = { area: 'interior', args: { id: inner, from: id } };
    g.go('interior', g.loc.args);
  }
  enterGate(id) {
    const g = this.g, c = this.c, A = g.audio;
    if (id === 'skygate') {
      const gate = pantheonGate(g.medals || { got: {} }, c);
      if (!gate.beaten) { this.say('ONLY THE LAST CHAMPION CAN CLIMB.'); A.sfx('tired'); return; }
      if (!gate.open) { this.say(`THE HEAVENS ARE SEALED. EARN ${gate.short} MORE MEDAL${gate.short === 1 ? '' : 'S'}.`); A.sfx('tired'); return; }
      if (!gate.opened) { A.sfx('confirm'); this.ws.pos = 'skygate'; saveWorld(this.ws); g.go('ascend'); return; }
      return this.enterPortal(id);
    }
    // the chasm and the door below lead on to their worlds
    if (this.W.nodes[id].to) return this.enterPortal(id);
  }

  // ---- reveals -----------------------------------------------------------------------------------------------------------------------
  updateReveal(I) {
    const A = this.g.audio, P = this.P, ws = this.ws, W_ = this.W;
    if (I.takeTaps) I.takeTaps(); // (taps during a reveal mean nothing)
    if (I.pressed('start') && (this.cur || this.steps.length)) { this.skipAll(); return; }
    if (!this.cur) {
      const s = this.steps.shift(); if (!s) return;
      this.cur = { ...s, t: 0 };
      if (s.kind === 'realm') { const R = W_.realms.find((x) => x.id === s.id); this.cur.dur = FX_FRAMES[R.fx] || 120; this.cur.focus = { x: R._at[0], y: R._at[1] }; A.sfx(R.fx === 'crack' ? 'heartOut' : 'unlock'); this.cur.R = R; }
      else if (s.kind === 'fog') {
        this.cur.dur = 110; this.cur.from = this.fogShown; this.cur.toY = fogLine(W_, s.to); A.sfx('unlock');
        const d = this.P.fogDir, wp = walkerPos(this.graph, this.walker);
        this.cur.focus = d === 'down' ? { x: W_.px[0] / 2, y: this.cur.toY - 60 } : d === 'right' ? { x: this.cur.toY - 90, y: wp.y } : { x: W_.px[0] / 2, y: this.cur.toY + 60 };
      }
      else if (s.kind === 'edge') { const e = W_.edges.find((x) => x.key === s.key); this.cur.e = e; this.cur.dur = Math.min(150, Math.max(40, Math.round(e.len / 9) * 3 + 20)); A.sfx('unlock'); }
      else if (s.kind === 'node') { const n = W_.nodes[s.id]; this.cur.dur = 60; this.cur.focus = { x: n.x, y: n.y }; A.sfx('unlock'); }
    }
    const S = this.cur; S.t++;
    const u = Math.min(1, S.t / S.dur);
    if (S.kind === 'realm') {
      const from = S.to ? 0 : 1, to = S.to ? 1 : 0;
      P.realmP[S.id] = from + (to - from) * u;
      if (S.R.fx === 'crack' && S.t % 6 === 0) A.sfx('tick');
    } else if (S.kind === 'fog') { this.fogShown = S.from + (S.toY - S.from) * u; P.fogY = this.fogShown; }
    else if (S.kind === 'edge') {
      const e = S.e; P.edgeFrac[e.key] = u;
      const lead = pointOn(e, e.len * u); S.focus = { x: lead.x, y: lead.y };
      if (S.t % 3 === 0) A.sfx('tick');
    } else if (S.kind === 'node') S.t2 = S.t;
    if (S.t >= S.dur) this.finishStep(S);
  }
  finishStep(S) {
    const ws = this.ws, P = this.P;
    if (S.kind === 'realm') { ws.seen.realms[S.id] = S.to; P.realmP[S.id] = S.to ? 1 : 0; }
    else if (S.kind === 'fog') { if (this.W.fog.by === 'main') ws.maxMain = S.to; else ws.fogI[this.zone] = S.to; this.fogI = S.to; this.fogShown = S.toY; P.fogY = S.toY; }
    else if (S.kind === 'edge') { ws.seen.edges[S.key] = true; P.edgeFrac[S.key] = 1; }
    else if (S.kind === 'node') ws.seen.nodes[S.id] = true;
    this.cur = null;
    this.rebuildGraph();
    saveWorld(ws);
    if (!this.steps.length) this.afterReveals();
  }
  skipAll() {
    const ws = this.ws, P = this.P, W_ = this.W;
    this.cur = null; this.steps = [];
    for (const R of W_.realms) { ws.seen.realms[R.id] = this.realmOn[R.id]; P.realmP[R.id] = this.realmOn[R.id] ? 1 : 0; }
    if (W_.fog) { const to = fogIndex(W_, this.g, ws.maxMain); if (W_.fog.by === 'main') ws.maxMain = Math.max(ws.maxMain || 0, this.c.main); else ws.fogI[this.zone] = to; this.fogI = to; this.fogShown = fogLine(W_, to); P.fogY = this.fogShown; }
    for (const e of W_.edges) { const want = this.edgeWanted(e); ws.seen.edges[e.key] = want; P.edgeFrac[e.key] = want ? 1 : 0; }
    for (const n of Object.values(W_.nodes)) if (n.kind === 'mode' || n.kind === 'gate' || n.kind === 'portal' || n.kind === 'blimp') ws.seen.nodes[n.id] = this.nodeWanted(n.id);
    this.rebuildGraph(); saveWorld(ws); this.afterReveals();
  }
  afterReveals() {
    this.rebuildGraph();
    if (!this.nodeShown(this.walker.node || this.here)) { const to = this.nearestShown(this.here); this.walker = newWalker(to); this.here = to; }
  }

  shake() {
    const s = this.cur && this.cur.kind === 'realm' && this.cur.R.fx === 'crack' ? this.cur.t / this.cur.dur : 0;
    if (s > 0.2 && s < 0.85) return [((this.t >> 1) & 1) ? 1 : -1, ((this.t >> 2) & 1) ? 1 : 0];
    return [0, 0];
  }

  // ---- drawing -----------------------------------------------------------------------------------------------------------------------
  render(f) {
    const P = this.P, t = this.t, cam = this.cam;
    f.clear(c32(2, 3, 8));
    P.terrain(f, cam, t);
    P.paths(f, cam, t);
    // everything that stands up: scenery, places, you; sorted by the row it stands on
    const items = P.sprites(cam, t);
    const ox = -Math.floor(cam.x), oy = VIEW_TOP - Math.floor(cam.y);
    for (const n of Object.values(this.W.nodes)) {
      const a = this.nodeAlphaNow(n.id);
      if (a <= 0) continue;
      const sx = Math.round(n.x + ox), sy = Math.round(n.y + oy);
      if (sx < -48 || sx > W + 48 || sy < VIEW_TOP - 60 || sy > VIEW_BOT + 50) continue;
      items.push({ y: n.y + 6, draw: (fr) => this.drawNode(fr, n, sx, sy, a) });
    }
    const p = walkerPos(this.graph, this.walker);
    items.push({ y: p.y + 7, draw: (fr) => this.drawPlayer(fr, p, Math.round(p.x + ox), Math.round(p.y + oy)) });
    items.sort((a, b) => a.y - b.y);
    for (const it of items) it.draw(f);
    if (this.amb) this.amb.draw(f, { x: Math.floor(cam.x), y: Math.floor(cam.y) }, t, this);
    P.effects(f, cam, t);
    P.clouds(f, cam, t);
    // what you can do here
    if (!this.cur && !this.walker.edge && this.walker.node) this.paintPrompt(f, p, ox, oy);
    this.paintStatus(f);
    if (!this.cur && !this.steps.length) this.paintBanner(f);
    if (this.note) { const n = Math.min(4, linesOf(this.note, 196)); panel(f, 26, VIEW_BOT - 18 - n * 10, 204, 8 + n * 10); drawBlock(f, this.note, 30, VIEW_BOT - 14 - n * 10, 196, 4, COL.yellow, { align: 'center', where: 'map note' }); }
    if (this.cur || this.steps.length) drawText(f, 'START: SKIP', 4, VIEW_BOT - 10, COL.off, { mono: false });
    if (this.flash > 0) { const k = this.flash; for (let y = VIEW_TOP; y < VIEW_BOT; y++) for (let x = 0; x < W; x++) if (bayer(x, y) < k / 14) f.px(x, y, c32(31, 31, 31)); }
  }

  markerColors(st, t) {
    if (st === 'cleared') return [c32(4, 10, 22), c32(8, 18, 31), c32(31, 26, 8)];
    if (st === 'current') return [c32(20, 3, 5), (t >> 3) & 1 ? c32(31, 24, 10) : c32(29, 7, 8), c32(31, 29, 14)];
    if (st === 'open') return [c32(20, 3, 5), c32(28, 6, 7), c32(31, 20, 10)];
    return [c32(5, 5, 8), c32(10, 10, 14), c32(14, 14, 18)];
  }
  drawNode(f, n, x, y, alpha) {
    const t = this.t, st = nodeState(this.g, n.id);
    // a place that is arriving is drawn on a scratch frame and dithered in
    if (alpha < 1) {
      if (!this._scratch) this._scratch = makeImg(1, 1, () => {});
      const S = new (f.constructor)(72, 70); S.buf.fill(0);
      this.drawNodeBody(S, n, 36, 54, st, t);
      const th = alpha;
      for (let j = 0; j < 70; j++) for (let i = 0; i < 72; i++) { const v = S.buf[j * 72 + i]; if (v && bayer(i, j) < th) f.px(x - 36 + i, y - 54 + j + 0, v); }
      return;
    }
    this.drawNodeBody(f, n, x, y, st, t);
  }
  drawNodeBody(f, n, x, y, st, t) {
    const id = n.id, z = this.zone;
    if (n.kind === 'rival') {
      if (id === 'rival9' && LANDMARKS.gymFloat) this.landmark(f, 'gymFloat', x, y + 2, st === 'locked' ? 'locked' : 'open');
      rivalBadge(f, x, y + 2, st, t);
      return;
    }
    if (n.kind === 'junction') { disc(f, x, y + 3, 5, INK); disc(f, x, y + 2, 5, INK); disc(f, x, y + 2, 4, c32(20, 13, 2)); disc(f, x, y + 1, 3, c32(31, 25, 6)); f.px(x - 1, y, c32(31, 31, 22)); return; }
    // a place proper: its plinth, the things either side, the landmark, the marker in front, its belt and the boss's mark above
    const big = n.kind === 'home' || n.kind === 'circuit' || n.kind === 'mode';
    if (big) { plinth(f, z, x, y - 3, t); flanks(f, z, id, x, y - 3, t); }
    const lm = n.lm || id;
    if (LANDMARKS[lm]) this.landmark(f, lm, x, y - 4, st, n);
    if (big) medallion(f, x, y + 6, st, t, n.secret);
    if (n.kind === 'blimp') { disc(f, x, y + 3, 5, INK); disc(f, x, y + 2, 5, INK); disc(f, x, y + 2, 4, c32(20, 13, 2)); disc(f, x, y + 1, 3, c32(31, 25, 6)); f.rect(x - 2, y + 1, 5, 1, c32(27, 5, 7)); }
    const h = (LANDMARKS[lm] && LANDMARKS[lm].h) || 34;
    if (n.kind === 'circuit' && st === 'cleared') drawBeltIcon(f, id, x, y - h - 10);
    if (n.boss && n.kind === 'circuit') bossMark(f, x + 20, y - h + 6, t, st === 'cleared');
  }
  landmark(f, id, x, y, st, n) {
    const lm = LANDMARKS[id];
    if (!lm) return;
    const locked = st === 'locked';
    const g = new Gfx(f, lm.pal, x, y, 1, this.t, { lit: true, shade: true, state: st, sil: locked && !(n && (n.kind === 'gate' || n.kind === 'portal')) ? SIL_LOCK : null });
    lm.draw(g);
  }
  // the boss mark: a skull in a ring
  skull(f, x, y, t, dim = false) {
    const ring = dim ? c32(14, 14, 18) : (t >> 4) & 1 ? c32(31, 24, 8) : c32(28, 8, 8);
    disc(f, x, y, 7, INK); disc(f, x, y, 6, ring); disc(f, x, y, 5, c32(4, 3, 6));
    const B = dim ? c32(18, 18, 20) : c32(31, 30, 26);
    f.rect(x - 3, y - 4, 7, 5, B); f.rect(x - 2, y + 1, 5, 2, B); f.rect(x - 2, y - 2, 2, 2, INK); f.rect(x + 1, y - 2, 2, 2, INK); f.px(x, y, INK); f.px(x - 1, y + 2, INK); f.px(x + 1, y + 2, INK);
  }
  drawPlayer(f, p, x, y) {
    const w = this.walker, e = w.edge, prof = this.c.profile, t = this.t, flip = (p.tx || w.face || 0) < 0;
    if (e && e.type === 'bus') { const b = busImg(0); drawImg(f, b, x - 14 + (flip ? 0 : 0), y - 13 + ((t >> 3) & 1 ? 0 : 1), { flip }); return; }
    if (e && e.type === 'boat') {
      const b = boatImg((t >> 4)); drawImg(f, b, x - 13, y - 7 + ((t >> 4) & 1)); drawRunner(f, prof, x, y - 2 + ((t >> 4) & 1), t, false, flip);
      return;
    }
    const moving = !!w.moving;
    drawRunner(f, prof, x, y + 3 + (e && e.type === 'stairs' ? -((t >> 3) & 1) : 0), t, moving, flip);
  }
  paintPrompt(f, p, ox, oy) {
    const id = this.walker.node, n = this.W.nodes[id];
    if (!n) return;
    const can = n.kind === 'home' || n.kind === 'circuit' || n.kind === 'rival' || n.kind === 'mode' || n.kind === 'gate' || n.kind === 'portal' || n.kind === 'blimp';
    if (!can) return;
    const x = Math.round(p.x + ox), y = Math.round(p.y + oy) - 26 - ((this.t >> 4) & 1);
    f.rect(x - 7, y - 5, 15, 11, COL.black); f.rect(x - 6, y - 4, 13, 9, COL.white); f.rect(x - 3, y + 6, 7, 2, COL.black); f.rect(x - 2, y + 5, 5, 1, COL.white);
    drawText(f, 'A', x - 3, y - 3, COL.black, { mono: false });
  }

  // the status bar: where you are, your lives, belts and medals
  paintStatus(f) {
    const c = this.c, g = this.g, nid = this.cur && this.cur.focus && !this.walker.node ? this.here : (this.walker.node || this.here), n = this.W.nodes[nid];
    f.rect(0, 0, W, VIEW_TOP, c32(6, 4, 3)); f.rect(0, VIEW_TOP - 2, W, 2, c32(21, 15, 8)); f.rect(0, VIEW_TOP - 3, W, 1, c32(11, 7, 4)); f.rect(0, 0, W, 1, c32(21, 15, 8));
    const name = this.nameOf(nid), sub = this.subOf(nid);
    drawText(f, name, 5, 3, COL.yellow, { mono: false });
    if (sub && textWidth(name, false) + textWidth(sub, false) < 236) drawText(f, sub, 251 - textWidth(sub, false), 3, COL.cyan, { mono: false });
    // lives: the ones of the circuit you are in
    const row = 13, lw = textWidth('LIVES ', false);
    drawText(f, 'LIVES', 5, row, COL.cyan, { mono: false });
    let x = 5 + lw;
    if (noLives(c.circuit)) { drawText(f, 'NONE', x, row, COL.grey, { mono: false }); x += textWidth('NONE', false); }
    else { const max = livesOf(c.circuit); for (let i = 0; i < max; i++) { const gx = x + 4 + i * 11; if (i < c.lives) f.blit(ICONS.glove, gx, row + 3, UIPAL); else f.rect(gx - 4, row, 9, 8, COL.dark); } x += max * 11 + 2; }
    x += 10;
    drawText(f, 'BELTS', x, row, COL.cyan, { mono: false });
    x += textWidth('BELTS ', false);
    drawText(f, String(beltCount(c)), x, row, COL.white, { mono: false });
    x += textWidth(String(beltCount(c)), false) + 12;
    drawText(f, 'MEDALS', x, row, COL.cyan, { mono: false });
    x += textWidth('MEDALS ', false);
    const m = medalCount(g.medals), am = ascMedalCount(g.medals);
    drawText(f, `${m}${ascensionSeen(g) ? `+${am}` : ''}`, x, row, COL.white, { mono: false });
    void n;
  }
  nameOf(id) {
    const n = this.W.nodes[id];
    if (!n) return '';
    if (n.name) return n.name;
    const C = CIRCUITS[id];
    if (!C) return id.toUpperCase();
    if (isRival(id)) return `DASH MADDOX ${ROMAN[C.rival]}`;
    return C.asc ? C.name.split(': ')[0] : C.name;
  }
  subOf(id) {
    const n = this.W.nodes[id], C = CIRCUITS[id];
    if (!n) return '';
    if (n.sub) return n.sub;
    if (isRival(id)) return `"${FIGHTERS[C.fighters[0]].nickname}"`;
    if (C.asc) return C.name.split(': ')[1] || '';
    const a = C.arena && ARENAS[C.arena];
    return a ? a.name : '';
  }
}
