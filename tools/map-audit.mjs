// World map audit (spec §19 G4, G10, G11): the six maps, the journeys between them, and the halls.
//   - every map builds; every place has a landmark or marker; every path joins two places on its map; places and paths stand on land
//   - LAYOUT RULES: regions are named rectangles that do not overlap; every place is in one; paths are short (compact); landmarks fit the map
//   - WALKING is spatial: from every place, each path can be taken by some press of a direction, a direction takes only a path that leaves that
//     way (within 60 degrees), and a direction with no path does nothing
//   - PORTALS: every portal leads to a place on another map that has a portal back; every place on a map can be walked to from where the
//     map is entered
//   - every circuit, Dash's fight, the modes and the Home gym has an interior; podiums match the ladders; stations do not overlap and fit
//   - reveals and journeys: clearing a circuit draws the next path; the career moving to another map walks you to the portal and sets off
//   - every landmark fits its 15 colours and draws
//   node tools/map-audit.mjs
import { makeGame } from './lib/stub.mjs';
import { ZONES, NODES, NODE_ZONE, ZONE_PARENT, entryOf } from '../data/world/index.js';
import { buildWorld } from '../src/world/terrain.js';
import { makeGraph, legs, pickLeg, routeTo, newWalker, stepWalker, pointOn } from '../src/world/walk.js';
import { LANDMARKS } from '../src/scene/landmarks/index.js';
import { CIRCUITS, CIRCUIT_ORDER, ASC_PATH, ALL_RIVALS } from '../data/circuits.js';
import { interiorFor, INTERIOR_IDS, THEMES } from '../data/interiors.js';
import { MOTIFS } from '../src/world/themes.js';
import { PROP_NAMES } from '../src/world/props.js';
import { KIND_BY_ID } from '../src/world/tiles.js';
import { Frame } from '../src/engine/renderer.js';
import { Gfx } from '../src/scene/gfx.js';
import { AMBIENT } from '../src/world/ambient.js';
let bad = 0, checks = 0;
const fail = (m) => { console.log('  FAIL ' + m); bad++; };
const ok = (c, m) => { checks++; if (!c) fail(m); };
const disjoint = ([a0, b0, a1, b1], [c0, d0, c1, d1]) => a1 < c0 || c1 < a0 || b1 < d0 || d1 < b0;
const inR = (n, [c0, r0, c1, r1]) => n.c >= c0 && n.c <= c1 && n.r >= r0 && n.r <= r1;

for (const id of [...CIRCUIT_ORDER, ...ASC_PATH, ...ALL_RIVALS]) ok(NODES[id] && NODES[id].kind !== undefined, `circuit ${id} is a place on a map`);
const BUILT = {};
let places = 0, paths = 0, legsN = 0;
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
for (const zone of Object.keys(ZONES)) {
  const Wd = BUILT[zone] = buildWorld(zone), Z = Wd.Z;
  places += Object.keys(Wd.nodes).length; paths += Wd.edges.length;
  ok(!!AMBIENT[Z.ambient], `${zone} has its life (${Z.ambient})`);
  ok(!!Z.song, `${zone} has a song`);
  for (const [id, n] of Object.entries(Wd.nodes)) {
    ok(n.c >= 1 && n.c < Wd.cols - 1 && n.r >= 2 && n.r < Wd.rows - 1, `${zone}: ${id} is inside the map with room for its landmark (${n.c},${n.r})`);
    if (['circuit', 'home', 'mode', 'gate', 'portal'].includes(n.kind)) ok(!!LANDMARKS[n.lm || id], `${id} has a landmark (${n.lm || id})`);
  }
  for (const R of Wd.realms) for (const R2 of Wd.realms) if (R.id < R2.id) ok(disjoint(R.rect, R2.rect), `${zone}: realms ${R.id} and ${R2.id} do not overlap`);
  // the layout rules: regions do not overlap, every place is in one, paths are short
  for (const R of Wd.regions) for (const R2 of Wd.regions) if (R.id < R2.id) ok(disjoint(R.rect, R2.rect), `${zone}: regions ${R.id} and ${R2.id} do not overlap`);
  for (const [id, n] of Object.entries(Wd.nodes)) ok(Wd.regions.some((R) => inR(n, R.rect)), `${zone}: ${id} is inside a region`);
  for (const e of Wd.edges) if (e.type !== 'boat') ok(e.len <= 16 * 17, `${zone}: path ${e.key} is short (${(e.len / 16).toFixed(1)} tiles)`);
  // every place stands on ground (in the map as it is once everything is revealed), and so does every path (bridges and boats excepted)
  const groundAt = (c, r) => { const K = KIND_BY_ID[Wd.S.ter[r * Wd.cols + c]]; return !!K && !!K.land; };
  for (const [id, n] of Object.entries(Wd.nodes)) if (n.kind !== 'junction') ok(groundAt(n.c, n.r), `${zone}: ${id} (${n.c},${n.r}) stands on ground`);
  for (const e of Wd.edges) if (['walk', 'bus', 'secret', 'ledge', 'stairs'].includes(e.type)) {
    let off = 0; for (let d = 0; d <= e.len; d += 8) { const p = pointOn(e, d); if (!groundAt(Math.floor(p.x / 16), Math.floor(p.y / 16))) off++; }
    ok(off === 0, `${zone}: path ${e.key} stays on ground (${off} waypoints off it)`);
  }
  // walking
  const all = makeGraph(Wd.nodes, Wd.edges);
  for (const id of Object.keys(Wd.nodes)) {
    const ls = legs(all, id);
    for (const l of ls) {
      legsN++;
      ok(Object.values(DIRS).some((v) => (pickLeg(all, id, v) || {}).edge === l.edge), `${zone}: at ${id} the path to ${l.to} can be taken by some direction (leaves ${l.vec.map((x) => x.toFixed(2))})`);
    }
    for (const [d, v] of Object.entries(DIRS)) {
      const leg = pickLeg(all, id, v);
      if (leg) ok(leg.vec[0] * v[0] + leg.vec[1] * v[1] >= 0.5 - 1e-9, `${zone}: ${d} from ${id} takes a path that leaves that way`);
      else ok(!ls.some((l) => l.vec[0] * v[0] + l.vec[1] * v[1] >= 0.5), `${zone}: ${d} from ${id}: nothing that way, nothing happens`);
    }
  }
  // everything on the map can be walked to from where it is entered (Home on the main road)
  const start = zone === 'main' ? 'home' : entryOf(zone).at;
  for (const id of Object.keys(Wd.nodes)) ok(routeTo(all, start, id) !== null, `${zone}: with everything revealed, ${id} can be walked to from ${start}`);
  // portals: each leads to a place on its map, which leads back
  for (const n of Object.values(Wd.nodes)) if (n.to) {
    ok(NODE_ZONE[n.at] === n.to, `${zone}: ${n.id} leads to ${n.at} on ${n.to}`);
    const back = NODES[n.at]; ok(back && back.to === zone && back.at === n.id && back.travel === n.travel && !!back.back !== !!n.back, `${n.id} and ${n.at} are each other's way back`);
  }
}
for (const z of Object.keys(ZONES)) if (z !== 'main') ok(entryOf(z) && ZONE_PARENT[z], `${z} is entered from ${ZONE_PARENT[z]}`);
const Wd = BUILT.main;
// a real walk: Home to Rookie by holding UP, then the walker stops on the node
{
  const all = makeGraph(Wd.nodes, Wd.edges);
  const w = newWalker('home'); let n = 0, ev;
  for (; n < 4000; n++) { ev = stepWalker(all, w, [0, -1]); if (ev === 'arrive') break; }
  ok(ev === 'arrive' && (w.node === 'rookie'), `holding UP from Home walks the path and stops at ${w.node}`);
  const w2 = newWalker('home'); let moved = false; for (let i = 0; i < 20; i++) { if (stepWalker(all, w2, [1, 0])) moved = true; }
  ok(!moved && w2.node === 'home', 'RIGHT at Home does nothing (no path that way)');
}

// ---- the game's own screens on the stub
const T0 = await makeGame({ career: 'new' });
const { WorldMapScreen } = await import('../src/screens/worldMap.js');
const { InteriorScreen } = await import('../src/screens/interior.js');
{
  const g = T0.game; g.input.takeTaps = () => [];
  const S = new WorldMapScreen(g, { fresh: true });
  ok(S.walker.node === 'home', 'a new game starts at Home');
  ok(!S.nodeWanted('blimpMain') && !S.nodeShown('blimpMain'), 'a new game has no blimp');
  const vis = Wd.edges.filter((e) => S.P.edgeFrac[e.key] >= 1).map((e) => e.key);
  ok(vis.join() === 'home-rookie', `at the start only the path from Home to Rookie is drawn (${vis})`);
  ok(!S.steps.length, 'nothing to reveal at the start');
  ok(S.nodeShown('rookie') && S.nodeShown('minor') === true, 'the first two circuits are on the map');
  ok(S.zone === 'main' && !S.nodeShown('carnival') && !S.nodeShown('underground') && !S.nodeShown('toChamp'), 'the secrets and the road to the Championship are not');
}
// a circuit cleared: its path is drawn, and the walker follows it
{
  const T = await makeGame({ career: 'new' }), g = T.game; g.input.takeTaps = () => [];
  const { recordResult } = await import('../src/save/career.js');
  const S0 = new WorldMapScreen(g, { fresh: true }); void S0;
  for (const id of CIRCUITS.rookie.fighters) recordResult(g.career, { winner: 'player', method: 'KO', opponent: id, round: 1, time: '0:30', seconds: 30 });
  const S = new WorldMapScreen(g, {});
  ok(S.steps.some((s) => s.kind === 'edge' && s.key === 'rookie-minor'), `clearing Rookie draws the path to Minor (${S.steps.map((s) => s.kind + ':' + (s.key || s.id || s.to))})`);
  ok(S.steps.some((s) => s.kind === 'fog'), 'and lifts the clouds a little');
  for (let i = 0; i < 1200 && (S.cur || S.steps.length); i++) S.update();
  ok(S.P.edgeFrac['rookie-minor'] === 1 && S.ws.seen.edges['rookie-minor'], 'the path is finished and remembered');
  const S2 = new WorldMapScreen(g, {});
  ok(!S2.steps.some((s) => s.key === 'rookie-minor'), 'it does not play twice');
}
// the secrets reveal; the career moving on to another map walks you to its portal and sets off on the journey
{
  const T = await makeGame({ career: 'zero' }), g = T.game; g.input.takeTaps = () => [];
  const c = g.career;
  const S = new WorldMapScreen(g, { snap: true, arrive: 'home' });
  ok(S.zone === 'main' && !S.steps.length, 'a career loaded from a save shows what it has: no replays of old reveals');
  ok(S.realmOn.carnival && S.realmOn.underground, 'the main road\'s secrets are revealed for a career that cleared them');
  const Z0 = new WorldMapScreen(g, { snap: true, arrive: 'zeroOut' });
  ok(Z0.zone === 'zero' && Z0.realmOn.zero, 'ZERO\'s throne is up in the warped city');
  const C0 = new WorldMapScreen(g, { snap: true, arrive: 'plaza' });
  ok(C0.zone === 'champ' && C0.realmOn.warpRift && !C0.realmOn.chasm, 'the warp is open in the city, the chasm is not');
  // the sky opens: from the city you walk to the warp, through it, then on to the Sky Gate at the crossroads past ZERO's throne, and up the climb
  c.flags.pantheonOpen = true; c.circuit = 'p1';
  const S1 = new WorldMapScreen(g, {});
  ok(S1.zone === 'champ' && S1.autoTravel === 'toZero', `from the city the way to the Pantheon is through the warp (${S1.zone} ${S1.autoTravel})`);
  for (let i = 0; i < 4000 && !g.next; i++) S1.update();
  ok(g.next && g.next[1].travel === 'warp' && g.next[1].to === 'zero', 'the warp plays');
  const S2 = new WorldMapScreen(g, { arrive: g.next[1].at }); g.next = null;
  ok(S2.zone === 'zero' && S2.autoTravel === 'skygate', `then you walk to the Sky Gate at the crossroads (${S2.zone} ${S2.autoTravel})`);
  for (let i = 0; i < 6000 && !g.next; i++) S2.update();
  ok(g.next && g.next[0] === 'travel' && g.next[1].travel === 'climb' && g.next[1].to === 'pantheon' && g.next[1].first, `and the climb plays, in full the first time (${JSON.stringify(g.next)})`);
  const P1 = new WorldMapScreen(g, { arrive: g.next[1].at }); g.next = null;
  ok(P1.zone === 'pantheon' && P1.walker.node === 'skyStairs', 'you arrive at the top of the stairs in the Pantheon');
  for (let i = 0; i < 3000 && (P1.cur || P1.steps.length || P1.walker.edge || P1.walker.route.length || P1.decideFollow); i++) P1.update();
  ok(P1.walker.node === 'p1', `and walk on to Pantheon I (${P1.walker.node})`);
  // The Fall: the sky closes; the map opens in the city, the chasm cracks open and you go down it
  c.asc = 8; c.circuit = 'u1';
  const S3 = new WorldMapScreen(g, {}); g.next = null; S3.enter();
  ok(g.next && g.next[1].travel === 'fall' && g.next[1].to === 'underworld' && g.next[1].at === 'chasmTop', `after The Fall the sky is shut behind you: the fall plays at once (${JSON.stringify(g.next)})`);
  const U1 = new WorldMapScreen(g, { arrive: g.next[1].at }); g.next = null;
  for (let i = 0; i < 3000 && (U1.cur || U1.steps.length || U1.walker.edge || U1.walker.route.length || U1.decideFollow); i++) U1.update();
  ok(U1.zone === 'underworld' && U1.walker.node === 'u1', `and you cross the Styx to the Ferryman's Shore (${U1.walker.node})`);
  // past Vorgath the door below leads to the Void
  const C3 = new WorldMapScreen(g, { arrive: 'zero' });
  ok(C3.zone === 'zero' && C3.steps.some((s) => s.kind === 'realm' && s.id === 'chasm'), 'back at the crossroads, the chasm cracks open beside the Sky Gate');
  for (let i = 0; i < 3000 && (C3.cur || C3.steps.length); i++) C3.update();
  ok(C3.nodeShown('skygate') && C3.nodeShown('chasm') && C3.nodeShown('crossroads'), 'after The Fall the crossroads offers both the Pantheon and the Underworld');
  { const { zoneOpen } = await import('../src/world/state.js'); ok(zoneOpen(g, 'pantheon') && zoneOpen(g, 'underworld'), 'the Pantheon stays open after The Fall'); }
  const A = makeGraph(C3.W.nodes, C3.W.edges.filter((e) => C3.P.edgeFrac[e.key] >= 1)); const L = legs(A, 'crossroads').map((l) => l.to).sort().join();
  ok(L === 'chasm,skygate,zero', `the crossroads is a stop with three ways (${L})`);
  c.asc = 15; c.circuit = 'v1'; c.flags.voidSeen = true;
  U1.ws.pos = 'u6'; const { saveWorld } = await import('../src/world/state.js'); saveWorld(U1.ws);
  const S4 = new WorldMapScreen(g, {});
  ok(S4.zone === 'underworld' && S4.autoTravel === 'voiddoor', 'past Vorgath you head for the door below');
  // a journey taken before is short
  g.next = null; const ws = S4.ws; ws.travel['tear>'] = true; S4.enterPortal('voiddoor');
  ok(g.next && g.next[1].travel === 'tear' && !g.next[1].first, 'a journey already seen is the short one');
}
// the blimp: a dock in every open world, the list is the open worlds, flying goes to that world's dock
{
  const T = await makeGame({ career: 'zero' }), g = T.game; g.records.unlocks.jax = true;
  const { blimpStops, BlimpScreen } = await import('../src/screens/blimp.js');
  const { loadWorld: lw, saveWorld: sw } = await import('../src/world/state.js');
  { const w = lw(); w.visited = {}; sw(w); }
  ok(blimpStops(g).length === 0, 'no blimp flies before you have been to the city of champions');
  { const M = new WorldMapScreen(g, { snap: true, arrive: 'home' }); ok(!M.nodeWanted('blimpMain'), 'and the road has no blimp until then'); }
  new WorldMapScreen(g, { snap: true, arrive: 'plaza' });
  { const M = new WorldMapScreen(g, { snap: true, arrive: 'home' }); ok(M.nodeWanted('blimpMain'), 'once you have been to the city, the blimp is moored by the Home gym'); }
  ok(blimpStops(g).join() === 'blimpMain,blimpChamp,blimpZero', `after ZERO the blimp flies to the road, the city and the warped city (${blimpStops(g)})`);
  g.career.flags.pantheonOpen = true; g.career.asc = 16;
  ok(blimpStops(g).join() === 'blimpMain,blimpChamp,blimpZero,blimpPan,blimpUnder,blimpVoid', `late on it flies everywhere (${blimpStops(g)})`);
  const B = new BlimpScreen(g, { from: 'blimpChamp' }); B.enter(); g.next = null;
  B.sel = blimpStops(g).indexOf('blimpPan'); g.input.confirm = () => true; B.update(); g.input.confirm = () => false;
  ok(g.next && g.next[0] === 'travel' && g.next[1].travel === 'blimp' && g.next[1].to === 'pantheon' && g.next[1].at === 'blimpPan', `boarding at Champions' Rest and picking the Pantheon flies there (${JSON.stringify(g.next)})`);
  { const w = lw(); w.visited = {}; sw(w); } // (a new game starts the map's memory over)
  const N = new BlimpScreen((await makeGame({ career: 'new' })).game, {}); ok(N.stops.length === 0, 'a new career has no blimps');
}
// a pixel check: every map renders at every shown place, with its life, nothing throwing
{
  const T = await makeGame({ career: 'zero' }), g = T.game; g.input.takeTaps = () => [];
  const f = new Frame();
  for (const zone of Object.keys(ZONES)) {
    g.career.asc = { pantheon: 3, underworld: 10, void: 16 }[zone] ?? 0; g.career.flags.pantheonOpen = g.career.asc > 0; g.career.flags.voidSeen = true;
    const W0 = BUILT[zone], S = new WorldMapScreen(g, { snap: true, arrive: Object.keys(W0.nodes)[0] });
    try { for (const node of Object.keys(W0.nodes)) { S.walker = newWalker(node); S.cam.x = S.clampX(W0.nodes[node].x - 128); S.cam.y = S.clampY(W0.nodes[node].y - 100); S.t += 37; S.render(f); } ok(true, `${zone} renders`); } catch (e) { fail(`${zone} render throws: ${e.stack.split('\n').slice(0, 3).join(' | ')}`); }
  }
}
// the journeys play through, both ways, full and short, nothing throwing
{
  const { TravelScreen } = await import('../src/screens/travel.js');
  const g = (await makeGame({ career: 'zero' })).game; const f = new Frame();
  for (const travel of ['road', 'warp', 'climb', 'fall', 'tear', 'blimp']) for (const back of [false, true]) for (const first of [true, false]) {
    g.next = null; const S = new TravelScreen(g, { travel, back, first, to: 'champ', at: 'plaza' }); S.enter();
    try { let n = 0; while (!g.next && n < 2000) { S.update(); if (n % 25 === 0) S.render(f); n++; } ok(g.next && g.next[0] === 'map' && g.next[1].arrive === 'plaza', `the ${travel}${back ? ' back' : ''} (${first ? 'full' : 'short'}) ends on the map (${n} frames)`); }
    catch (e) { fail(`journey ${travel} throws: ${e.stack.split('\n').slice(0, 3).join(' | ')}`); }
  }
}

// ---- the halls
const gHall = (await makeGame({ career: 'zero' })).game; gHall.input.takeTaps = () => [];
gHall.records.unlocks.jax = true; gHall.records.unlocks.full = true;
for (const id of INTERIOR_IDS) {
  let L;
  try { L = interiorFor(id); } catch (e) { fail(`interior ${id}: ${e.message}`); continue; }
  ok(L.name && L.stations.length >= 2 && L.stations[0].kind === 'exit', `${id} has a name, an exit and stations`);
  ok(!!THEMES[L.theme] && MOTIFS.includes(THEMES[L.theme].motif), `${id} has a theme (${L.theme})`);
  const xs = L.stations.filter((s) => s.kind !== 'decor').map((s) => s.x).sort((a, b) => a - b);
  for (let i = 1; i < xs.length; i++) ok(xs[i] - xs[i - 1] >= 24, `${id}: stations ${i - 1} and ${i} are not on top of each other (${xs[i] - xs[i - 1]} px)`);
  for (const s of L.stations) { ok(!s.prop || PROP_NAMES.includes(s.prop), `${id}: prop ${s.prop} exists`); if (s.kind === 'prop' || s.kind === 'door') ok(s.label, `${id}/${s.id} has a label`); }
  if (!L.scroll) ok(Math.max(...L.stations.map((s) => s.x)) <= 232, `${id} fits one page (${Math.max(...L.stations.map((s) => s.x))})`);
  if (CIRCUITS[id]) { const pods = L.stations.filter((s) => s.kind === 'podium'); ok(pods.map((p) => p.fighter).join() === CIRCUITS[id].fighters.join(), `${id}: the podiums are the ladder, in order`); }
  // it opens and draws
  try { const S = new InteriorScreen(gHall, { id }); S.enter(); const f = new Frame(); for (const s of S.L.stations) { S.px = s.x; S.update(); S.update(); S.render(f); } } catch (e) { fail(`interior ${id} throws: ${e.stack.split('\n').slice(0, 3).join(' | ')}`); }
}
// the Home gym: every old menu's screen is a station
{
  const L = interiorFor('home'), screens = new Set(L.stations.filter((s) => s.go).map((s) => s.go.screen));
  for (const need of ['training', 'perks', 'practice', 'customize', 'handbook', 'gallery', 'medals', 'unlocks', 'theater', 'soundtest', 'desk', 'replay']) ok(screens.has(need), `the Home gym has a station for ${need}`);
  ok(L.stations.filter((s) => s.go && s.go.screen === 'training').map((s) => s.go.args.drill).sort().join() === 'bag,rope,run', 'speed bag, jump rope and road run are separate stations');
  const td = interiorFor('td'), ga = interiorFor('gauntlet');
  ok(td.stations.filter((s) => s.kind === 'door' && !s.origin).length === 5 && td.stations.filter((s) => s.id.startsWith('board.')).length === 5, 'the Title Defense hall has five entrances and a records board for each');
  ok(ga.stations.filter((s) => s.kind === 'door' && !s.origin).length === 5, 'the Gauntlet tower has five doors');
}

// ---- beaten poses: every fighter has his own, it exists in his sprite bank, and no two in one hall stand the same way
{
  const { BEATEN } = await import('../data/fighters/beaten.js');
  const { EVERYONE } = await import('../src/save/records.js');
  const { FIGHTERS } = await import('../data/fighters/index.js');
  const { fighterSprites } = await import('../src/engine/spriteCache.js');
  for (const id of EVERYONE) {
    ok(!!BEATEN[id], `${id} has a beaten pose`);
    const b = fighterSprites(FIGHTERS[id].spriteLayers), base = BEATEN[id] === 'undone' ? 'undone' : `beat${BEATEN[id]}`;
    for (const k of [1, 2]) ok(b.poses.includes(`${base}${k}`), `${id}: ${base}${k} is in his sprite bank`);
  }
  for (const id of INTERIOR_IDS) { if (!CIRCUITS[id]) continue; const l = CIRCUITS[id].fighters.map((f) => BEATEN[f]); ok(new Set(l).size === l.length, `${id}: no two beaten alike (${l})`); }
}

// ---- every landmark fits its 15 colours and draws at both sizes
const f = new Frame();
for (const [id, L] of Object.entries(LANDMARKS)) for (const k of [1, 3]) for (const t of [0, 37, 91]) {
  try { L.draw(new Gfx(f, L.pal, 128, 200, k, t, { state: t ? 'open' : 'locked' })); } catch (e) { fail(`landmark ${id} k=${k}: ${e.message}`); }
}
console.log(`${Object.keys(ZONES).length} maps, ${places} places, ${paths} paths, ${legsN} path ends, ${INTERIOR_IDS.length} interiors, ${Object.keys(LANDMARKS).length} landmarks`);
console.log(bad ? `${bad} FAILURES of ${checks}` : `map audit clean (${checks} checks)`);
process.exit(bad ? 1 : 0);
