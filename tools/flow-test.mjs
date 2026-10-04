// Flow test (spec §19): the routes through the presentation pass, headless.
//   a new career's first FIGHT! plays the Rookie arrival, then the intro card; the second time goes straight to the card;
//   the champion's fight goes through his entrance; a belt goes victory -> (invitation) -> jogging -> map/training;
//   Dash's scenes and the Theater's sandbox leave the career untouched.
import { makeGame } from './lib/stub.mjs';
let bad = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { bad++; console.log('  FAIL ' + m); } };
const { SCREENS_FOR_TEST } = {};
void SCREENS_FOR_TEST;
const { CutsceneScreen } = await import('../src/screens/cutscene.js');
const { InteriorScreen } = await import('../src/screens/interior.js');
const { ResultsScreen } = await import('../src/screens/results.js');
const { WorldMapScreen } = await import('../src/screens/worldMap.js');
const { BeltScreen } = await import('../src/screens/cutscenes.js');
const { JogRoute, RivalRoute, FerryRoute } = await import('../src/screens/routers.js');
const { goIntro } = await import('../src/screens/introFlow.js');
const { TheaterScreen } = await import('../src/screens/theater.js');

// run the chain of cutscenes from game.next until something else comes up; returns the names in order
function chain(T) {
  const g = T.game, seen = [];
  for (let guard = 0; guard < 12 && g.next && g.next[0] === 'cutscene'; guard++) {
    const [, args] = g.next; g.next = null;
    seen.push(args.id);
    const S = new CutsceneScreen(g, { ...args });
    S.enter();
    for (let t = 0; t < 20000 && !g.next; t++) { T.step(t); if (t % 9 === 0) T.press('a', t), T.step(t); S.update(); }
  }
  return { seen, next: g.next };
}

const podium = (H, i) => H.L.stations.find((q) => q.kind === 'podium' && q.index === i);
{ // a new career, the first fight, from the podium
  const T = await makeGame({ career: 'new' }), g = T.game;
  g.saveCareer = () => {}; g.input.takeTaps = () => [];
  const H = new InteriorScreen(g, { id: 'rookie' }); H.enter();
  H.use(podium(H, 0));
  let r = chain(T);
  ok(r.seen.join() === 'arrive.rookie', `first fight plays the arrival (${r.seen})`);
  ok(r.next && r.next[0] === 'intro', `... then the intro card (${r.next && r.next[0]})`);
  g.next = null; H.use(podium(H, 0));
  r = chain(T);
  ok(r.seen.length === 0 && g.next && g.next[0] === 'intro', 'the second time goes straight to the card');
  ok(!!g.career.flags.arrived.rookie, 'the career remembers it arrived');
  g.next = null; H.use(podium(H, 1));
  ok(!g.next && H.note, 'a fighter not reached yet cannot be fought');
  ok(g.loc && g.loc.area === 'interior' && g.loc.args.id === 'rookie', 'the career remembers it was in the hall (the fight returns there)');
}
{ // a podium rematch: instant, no cutscene, no life, nothing changes in the career
  const T = await makeGame({ career: 'new' }), g = T.game;
  g.saveCareer = () => {}; g.input.takeTaps = () => [];
  const { recordResult } = await import('../src/save/career.js');
  for (const id of ['barney', 'kid']) recordResult(g.career, { winner: 'player', method: 'KO', opponent: id, round: 1, time: '0:30', seconds: 30 });
  const H = new InteriorScreen(g, { id: 'rookie' }); H.enter();
  ok(H.podState(podium(H, 0)) === 'beaten' && H.podState(podium(H, 2)) === 'next', 'the two beaten are rematches, Mort is next');
  H.use(podium(H, 0));
  ok(g.next && g.next[0] === 'fight' && g.next[1].rematch && g.next[1].fighter === 'barney', `the rematch goes straight to the fight (${g.next && g.next[0]})`);
  const before = JSON.stringify(g.career);
  const res = { winner: 'opponent', method: 'KO', round: 1, time: '0:40', seconds: 40, health: 0, stars: 0, points: 0, stats: { landed: 3, thrown: 9, counters: 0, starsEarned: 0, hitsTaken: 5, dodges: 0, perfects: 0 }, knockdowns: { opp: 0, player: 3 }, opponent: 'barney', remix: false, rematch: g.next[1].rematch };
  g.next = null;
  const R = new ResultsScreen(g, res);
  ok(R.outcome.kind === 'podium', 'a lost rematch is a podium result');
  ok(JSON.stringify(g.career) === before, 'a LOST rematch changes nothing in the career: no life, no ladder, no record');
  for (let i = 0; i < 70; i++) { T.step(i); R.update(); }
  T.press('start', 71); T.step(71); R.update();
  ok(g.next && g.next[0] === 'map', 'the result leads back to the hall');
  // medals count: a flawless win by KO under the target earns them
  const win = { ...res, winner: 'player', stats: { ...res.stats, hitsTaken: 0 }, knockdowns: { opp: 1, player: 0 }, seconds: 50, rematch: { circuit: 'rookie' }, track: { moves: {}, opens: {}, cues: {}, kds: [], punches: { repeats: 0, counters: 0, stars: 0, landed: 5, free: 5, guarded: 0, whiffed: 0 } } };
  const R2 = new ResultsScreen(g, win);
  ok(R2.medal && R2.medal.earned.includes('speed') && R2.medal.earned.includes('flawless') && g.medals.got.barney.flawless && g.medals.best.barney === 50, 'a won rematch earns medals and a record time');
  ok(g.career.record.w === 2 && g.career.beaten === 2, 'but the record and the ladder are untouched');
}
{ // a circuit reset (last life): the podiums go back to unbeaten, medals and times stay
  const T = await makeGame({ career: 'new' }), g = T.game;
  g.saveCareer = () => {}; g.input.takeTaps = () => [];
  const { recordResult } = await import('../src/save/career.js');
  const { recordFight } = await import('../src/save/medals.js');
  recordResult(g.career, { winner: 'player', method: 'KO', opponent: 'barney', round: 1, time: '0:30', seconds: 30 });
  g.medals.got.barney = { speed: true, flawless: false, signature: false }; g.medals.best.barney = 41;
  recordResult(g.career, { winner: 'opponent', method: 'KO', opponent: 'kid' }); recordResult(g.career, { winner: 'opponent', method: 'KO', opponent: 'kid' });
  const H = new InteriorScreen(g, { id: 'rookie' });
  ok([0, 1, 2, 3].map((i) => H.podState(podium(H, i))).join() === 'next,ahead,ahead,ahead', 'after the reset every fighter is unbeaten again');
  ok(g.medals.got.barney.speed && g.medals.best.barney === 41, 'the medals and record times stay');
  void recordFight;
}
{ // the Void: no lives
  const T = await makeGame({ career: 'v1' }), g = T.game;
  g.saveCareer = () => {}; g.input.takeTaps = () => [];
  const H = new InteriorScreen(g, { id: 'v1' });
  const st = H.L.stations.filter((q) => q.kind === 'podium').map((q) => H.podState(q)).join();
  ok(st === 'beaten,beaten,next,ahead', `Void I: two freed (${st})`);
}
{ // the Title Defense hall and the Gauntlet tower
  const T = await makeGame({ career: 'zero' }), g = T.game;
  g.saveCareer = () => {}; g.input.takeTaps = () => [];
  g.records.unlocks.jax = true; g.records.unlocks.zero = true;
  const H = new InteriorScreen(g, { id: 'td' }); H.enter();
  const door = (id) => H.L.stations.find((q) => q.id === id);
  H.use(door('door.pantheon'));
  ok(!g.next && H.note, 'the Pantheon door is locked until Halcyon is beaten');
  H.use(door('door.classic'));
  ok(g.next && g.next[0] === 'interior' && g.next[1].id === 'td.classic', 'the Classic door opens its hall');
  const C = new InteriorScreen(g, { id: 'td.classic' }); C.enter();
  ok(C.L.stations.filter((q) => q.kind === 'podium').length === 14, 'the Classic hall has 14 podiums');
  g.next = null; C.use(podium(C, 0));
  ok(g.next && g.next[0] === 'intro' && g.next[1].mode === 'td' && g.records.run && g.records.run.mode === 'td' && g.records.run.idx === 0, 'the first podium starts the defense');
  ok(C.podState(podium(C, 0)) === 'next' && C.podState(podium(C, 1)) === 'ahead', 'Gus is next, the rest ahead');
  g.records.run.idx = 2;
  ok(C.podState(podium(C, 0)) === 'beaten' && C.podState(podium(C, 2)) === 'next', 'mid-defense: the defended are rematches');
  g.next = null; C.use(podium(C, 0));
  ok(g.next && g.next[0] === 'fight' && g.next[1].rematch && g.next[1].rematch.td && g.next[1].mode === 'td', 'a defended champion is an instant rematch');
  g.records.run = null;
  const G = new InteriorScreen(g, { id: 'gauntlet' }); G.enter();
  g.next = null; G.use(G.L.stations.find((q) => q.id === 'gate.classic'));
  ok(g.next && g.next[0] === 'run' && g.next[1].start === 'gauntlet' && g.next[1].zone === 'classic', 'the Classic Gauntlet door starts the run');
  g.next = null; G.use(G.L.stations.find((q) => q.id === 'gate.pantheon'));
  ok(!g.next, 'a Gauntlet that has not been cleared stays locked');
}
{ // the Home gym: every station goes to its screen, the locked ones do not
  const T = await makeGame({ career: 'new' }), g = T.game;
  g.saveCareer = () => {}; g.input.takeTaps = () => [];
  const H = new InteriorScreen(g, { id: 'home' }); H.enter();
  const at = (id) => H.L.stations.find((q) => q.id === id);
  for (const [id, scr] of [['training', 'training'], ['mirror', 'customize'], ['index', 'handbook'], ['trophy', 'medals'], ['shop', 'unlocks'], ['tv', 'theater'], ['desk', 'desk'], ['perks', 'perks']]) {
    g.next = null; H.use(at(id));
    ok(g.next && g.next[0] === scr, `the ${id} station opens ${scr} (${g.next && g.next[0]})`);
  }
  for (const id of ['gallery', 'jukebox', 'replay']) { g.next = null; H.use(at(id)); ok(!g.next && H.note, `the ${id} station is locked at the start, with a hint (${H.note})`); }
  g.next = null; H.use(at('ring')); ok(g.next && g.next[0] === 'practice', 'the practice ring is open from the start (Barney is met)');
  g.records.met = []; g.next = null; H.note = null; H.use(at('ring')); ok(!g.next && H.note, 'with nobody met the practice ring is locked, with a hint');
  g.next = null; H.use(at('exit')); ok(g.next && g.next[0] === 'map' && g.loc.area === 'world', 'the door leads back to the map');
}
{ // a password or a title win puts you on the world map, a fight from a hall brings you back to the hall
  const T = await makeGame({ career: 'new' }), g = T.game;
  g.saveCareer = () => {}; g.input.takeTaps = () => [];
  const { recordResult } = await import('../src/save/career.js');
  for (const id of ['barney', 'kid', 'mort', 'gus']) recordResult(g.career, { winner: 'player', method: 'KO', opponent: id });
  const res = { winner: 'player', method: 'KO', round: 1, time: '0:30', seconds: 30, health: 80, stars: 0, points: 1, stats: { landed: 1, thrown: 1, counters: 0, starsEarned: 0, hitsTaken: 0, dodges: 0, perfects: 0 }, knockdowns: { opp: 1, player: 0 }, opponent: 'gus', remix: false };
  g.loc = { area: 'interior', args: { id: 'rookie' } };
  g.career.circuit = 'rookie'; g.career.beaten = 3; g.career.main = 0; g.career.flags = {};
  const R = new ResultsScreen(g, res);
  for (let i = 0; i < 70; i++) { T.step(i); R.update(); }
  T.press('start', 71); T.step(71); R.update();
  ok(g.loc.area === 'world' && g.next && g.next[0] === 'belt', `winning a belt leaves the hall for the road (${g.loc.area} ${g.next && g.next[0]})`);
}
{ // the fight screen itself: a rematch routes to the results (or out, if walked out of) and never to a loss of lives
  const T = await makeGame({ career: 'new' }), g = T.game;
  g.saveCareer = () => {}; g.input.takeTaps = () => [];
  const { FightScreen } = await import('../src/screens/fight.js');
  const mkInput = () => ({ held: () => false, pressed: () => false, released: () => false, confirm: () => false, back: () => false, anyPressed: () => false });
  g.input = { ...g.input, ...mkInput(), takeTaps: () => [] };
  g.display = { setCRT() {} };
  const F = new FightScreen(g, { fighter: 'barney', rematch: { circuit: 'rookie', at: 'pod0' } });
  F.enter();
  ok(F.fight.opts && F.fight.opts.forfeit === undefined, 'a rematch has no forfeit rule');
  g.next = null; F.done(F.fight.makeResult('player', 'KO'));
  ok(g.next && g.next[0] === 'results' && g.next[1].rematch && g.next[1].winner === 'player', `a won rematch goes to the results (${g.next && g.next[0]})`);
  g.next = null; F.done({ method: 'QUIT', forfeit: true, winner: 'none' });
  ok(g.next && g.next[0] === 'map', 'walking out of a rematch costs nothing: back to the hall');
  const F2 = new FightScreen(g, { fighter: 'barney' }); F2.enter(); g.next = null; F2.done({ method: 'QUIT', forfeit: true, winner: 'none' });
  ok(g.next && g.next[0] === 'results', 'walking out of a career fight after the bell is still a loss');
}
{ // the desk and the tape shelf
  const T = await makeGame({ career: 'zero' }), g = T.game;
  g.saveCareer = () => {}; g.input.takeTaps = () => [];
  const { DeskScreen } = await import('../src/screens/desk.js');
  const { ReplayScreen } = await import('../src/screens/replay.js');
  const { Frame } = await import('../src/engine/renderer.js');
  const D = new DeskScreen(g); D.enter();
  const press = (S, a, n) => { T.press(a, n); T.step(n); S.update(); };
  let n = 1;
  const pick = (id) => { D.sel = ['save', 'password', 'enter', 'options', 'controls', 'title', 'back'].indexOf(id); g.next = null; press(D, 'start', n++); T.step(n++); };
  pick('enter'); ok(g.next && g.next[0] === 'password' && g.next[1].back === 'map', 'the desk: enter a password (and come back to the gym)');
  pick('options'); ok(g.next && g.next[0] === 'options' && g.next[1].back === 'map', 'the desk: options');
  pick('controls'); ok(g.next && g.next[0] === 'controls' && g.next[1].back === 'map', 'the desk: controls');
  pick('password'); ok(D.show === 'password', 'the desk: your password is shown');
  const f = new Frame(); D.render(f); D.show = null;
  pick('save'); ok(D.note === 'SAVED.', 'the desk: save');
  pick('title'); ok(!g.next && /AGAIN/.test(D.note || ''), 'the desk: the title screen asks once');
  pick('title'); ok(g.next && g.next[0] === 'title' && g.loc.area === 'world', 'the desk: ...then leaves');
  const R = new ReplayScreen(g); R.enter(); R.render(f);
  ok(R.items.length >= 10 && R.items.every((i) => i.id), `the tape shelf lists the cleared circuits (${R.items.length})`);
  R.sel = 0; g.next = null; press(R, 'start', n++);
  ok(g.next && g.next[0] === 'cutscene' || g.next && g.next[0] === 'intro', `a tape starts a replay (${g.next && g.next[0]})`);
  ok(g.career.replay && g.career.replay.circuit === 'rookie', 'the replay is of the circuit picked');
}
{ // the champion's entrance
  const T = await makeGame({ career: 'new' }), g = T.game;
  goIntro(g, { fighter: 'gus' });
  let r = chain(T);
  ok(r.seen.join() === 'entrance.gus' && r.next[0] === 'intro' && r.next[1].keepMusic, `Gus walks out (${r.seen})`);
  goIntro(g, { fighter: 'barney' });
  ok(g.next[0] === 'intro', 'an ordinary fighter goes straight to the card');
  goIntro(g, { fighter: 'gus', mode: 'gauntlet' });
  ok(g.next[0] === 'intro', 'a mode run has no entrances');
}
{ // a belt with a secret unlocked
  const T = await makeGame({ career: 'new' }), g = T.game;
  g.career.flags.carnivalUnlocked = true;
  new BeltScreen(g, { circuit: 'major', next: 'continental' }).enter();
  let r = chain(T);
  ok(r.seen.join() === 'victory.major,invite.carnival', `victory then the invitation (${r.seen})`);
  ok(r.next[0] === 'jog', `... then the road (${r.next && r.next[0]})`);
  g.next = null; new JogRoute(g, { from: 'major', to: 'continental' }).enter();
  r = chain(T);
  ok(r.seen.join() === 'jog.continental' && r.next[0] === 'map', `the jogging scene, then the map (${r.seen} ${r.next && r.next[0]})`);
  g.next = null; g.career.training.pending = true; new JogRoute(g, { from: 'major', to: 'continental' }).enter();
  r = chain(T);
  ok(r.next[0] === 'map', 'no training session is offered after the road: training is the Home gym\'s station (2026-10-04)');
  g.next = null; new BeltScreen(g, { circuit: 'dream', next: null }).enter();
  r = chain(T);
  ok(r.seen.join() === 'victory.dream' && r.next[0] === 'ending', 'the Dream Fight belt leads to the credits');
}
{ // Dash
  const T = await makeGame({ career: 'new' }), g = T.game;
  new RivalRoute(g, { id: 'rival1', phase: 'pre' }).enter();
  let r = chain(T);
  ok(r.seen.join() === 'rival.1.pre' && r.next[0] === 'intro', `Dash before the fight, then the card (${r.seen} ${r.next && r.next[0]})`);
  g.next = null; new RivalRoute(g, { id: 'rival1', phase: 'post' }).enter();
  r = chain(T);
  ok(r.seen.join() === 'rival.1.post' && ['map', 'jog', 'ferry'].includes(r.next[0]), `Dash after (${r.next && r.next[0]})`);
  g.next = null; new FerryRoute(g, { from: 'u1', to: 'u2' }).enter();
  r = chain(T);
  ok(r.seen.join() === 'ferry.u2', 'the ferry');
}
{ // the Theater: a sandbox
  const T = await makeGame({ career: 'zero', seen: { 'story.fall': 1 } }), g = T.game;
  g.sandbox = null;
  g.enterSandbox = function () { this.sandbox = { career: this.career }; this.career = structuredClone(this.career); };
  g.leaveSandbox = function () { if (this.sandbox) { this.career = this.sandbox.career; this.sandbox = null; } };
  const real = g.career, before = JSON.stringify(real);
  const Th = new TheaterScreen(g, {});
  Th.sel = Th.rows.findIndex((r) => r.id === 'story.fall'); T.press('start', 1); T.step(1); Th.update();
  ok(g.sandbox && g.career !== real, 'the Theater runs on a copy of the career');
  const r = chain(T);
  ok(r.seen.join() === 'story.fall' && r.next[0] === 'theater', `a scene played from the Theater returns to it (${r.next && r.next[0]})`);
  g.leaveSandbox();
  ok(JSON.stringify(g.career) === before, 'the real career is untouched');
  ok(g.seen['story.fall'] === 1, 'the Theater did not mark anything seen');
}
console.log(bad ? `${bad} FAILURES of ${checks}` : `flow test clean (${checks} checks)`);
process.exit(bad ? 1 : 0);
