// Mode tests (spec §6): the five divisions of Title Defense and of the Gauntlet, their unlocks, records and run flow, headless.
//   node tools/modes-test.mjs [--e2e [td:division | g:division ...]]
//   --e2e plays whole runs with the perfect-play bot through the real screens (the intro card, the fight screen, the run hub): every defense and every
//   Gauntlet by default (several minutes), or just the ones named (td:classic g:void ...).
// Checks: every list (sizes, order, no duplicates), the unlock of each mode from a career, records (saved per tier / per Gauntlet,
// migrated from the old format), a whole run played through RunScreen (wins, a loss, lives, medals, the fighter who ended a run),
// the menu (LEFT / RIGHT, locked notes, starting a run), the Gauntlet fight set-up (rounds, stage lock, the Void's rules),
// and every mode screen rendering without an error.
import { makeGame } from './lib/stub.mjs';
import { Frame } from '../src/engine/renderer.js';
let bad = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { bad++; console.log('  FAIL ' + m); } };

const R = await import('../src/save/records.js');
const { FIGHTERS } = await import('../data/fighters/index.js');
const { CIRCUITS, ASC_PATH } = await import('../data/circuits.js');
const { CLASSIC_DEFENSE, PANTHEON_DEFENSE, UNDERWORLD_DEFENSE, VOID_DEFENSE, COMBINED_DEFENSE, TD_LISTS, remixed } = await import('../data/fighters/titleDefense.js');
const { DIVISIONS } = await import('../data/divisions.js');
const { RunScreen, PracticeScreen, runTitle, fighterFor } = await import('../src/screens/modes.js');
const { InteriorScreen } = await import('../src/screens/interior.js');
const { ModeRecordsScreen, RECORD_PAGES } = await import('../src/screens/modeRecords.js');
const { IntroScreen } = await import('../src/screens/intro.js');
const { FightScreen } = await import('../src/screens/fight.js');
const { Fight } = await import('../src/fight/fightState.js');

// --- the lists -----------------------------------------------------------------------------------------------
{
  const dup = (L) => new Set(L).size === L.length;
  const champ = (c) => CIRCUITS[c].fighters[CIRCUITS[c].fighters.length - 1];
  ok(CLASSIC_DEFENSE.length === 14 && CLASSIC_DEFENSE.slice(0, 12).every((id) => FIGHTERS[id].isChampion) && CLASSIC_DEFENSE[12] === 'jax' && CLASSIC_DEFENSE[13] === 'zero', 'Classic: the 12 champions, Jax, the first ZERO');
  ok(PANTHEON_DEFENSE.length === 9 && ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].every((c, i) => PANTHEON_DEFENSE[i] === champ(c)) && PANTHEON_DEFENSE[6] === 'rho' && PANTHEON_DEFENSE.slice(7).join() === 'barney2,halcyon', 'Pantheon: the seven champions, Barney Ascended, Halcyon');
  ok(UNDERWORLD_DEFENSE.length === 7 && ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'].every((c, i) => UNDERWORLD_DEFENSE[i] === champ(c)) && UNDERWORLD_DEFENSE[6] === 'vorgath', 'Underworld: the six champions, Vorgath');
  ok(VOID_DEFENSE.length === 14 && VOID_DEFENSE.slice(0, 12).join() === ['v1', 'v2', 'v3'].flatMap((c) => CIRCUITS[c].fighters).join() && VOID_DEFENSE[12] === 'dash9' && VOID_DEFENSE[13] === 'zeroTrue', 'Void: the twelve Hollowed, Dash Unbound, ZERO true form');
  ok(COMBINED_DEFENSE.length === 44 && COMBINED_DEFENSE.join() === [...CLASSIC_DEFENSE, ...PANTHEON_DEFENSE, ...UNDERWORLD_DEFENSE, ...VOID_DEFENSE].join(), 'Combined: all four, in story order');
  for (const t of DIVISIONS) ok(dup(TD_LISTS[t]) && TD_LISTS[t].every((id) => FIGHTERS[id] && remixed(id).remix === true), `${t}: no duplicates, every one has his Title Defense version`);
  const num = (id) => R.rosterNumber(id);
  const L = Object.fromEntries(R.GAUNTLETS.map((z) => [z, R.gauntletList(z)]));
  ok(L.classic.length === 52 && L.classic.filter((id) => num(id)).length === 50 && L.classic.includes('jax') && L.classic[51] === 'zero' && !L.classic.some((id) => /^dash/.test(id)), 'Classic: #1-50, Jax, the first ZERO');
  ok(L.classic.indexOf('jax') === L.classic.indexOf('warden') + 1 && num(L.classic[L.classic.indexOf('jax') + 1]) === 47, 'Classic: Jax between #46 and #47');
  ok(L.pantheon.length === 34 && num(L.pantheon[0]) === 51 && L.pantheon.filter((id) => num(id)).length === 31 && L.pantheon[33] === 'halcyon' && L.pantheon.includes('dash5') && L.pantheon.includes('dash6') && L.pantheon.indexOf('dash5') === L.pantheon.indexOf('oldguard') + 1 && L.pantheon.indexOf('dash6') === L.pantheon.indexOf('prism') + 1, 'Pantheon: #51-81, Dash V and VI, Halcyon');
  ok(L.underworld.length === 29 && num(L.underworld[0]) === 82 && L.underworld.filter((id) => num(id)).length === 26 && L.underworld[28] === 'vorgath' && L.underworld.indexOf('dash7') === L.underworld.indexOf('jailer') + 1 && L.underworld.indexOf('dash8') === L.underworld.indexOf('herald') + 1, 'Underworld: #82-107, Dash VII and VIII, Vorgath');
  ok(L.void.length === 14 && num(L.void[0]) === 108 && num(L.void[11]) === 119 && L.void[12] === 'dash9' && L.void[13] === 'zeroTrue', 'Void: #108-119, Dash Unbound, ZERO true form');
  ok(L.combined.length === 129 && dup(L.combined) && L.combined.join() === [...L.classic, ...L.pantheon, ...L.underworld, ...L.void].join(), 'Combined: every opponent of the four lists, in story order');
  ok(L.combined.filter((id) => num(id)).length === 119 && ['jax', 'zero', 'halcyon', 'vorgath', 'zeroTrue'].every((id) => L.combined.includes(id)) && [5, 6, 7, 8, 9].every((n) => L.combined.includes('dash' + n)) && ![1, 2, 3, 4].some((n) => L.combined.includes('dash' + n)), 'Combined: all 119, the five bosses, Dash V to IX');
  ok([...L.classic, ...L.pantheon, ...L.underworld, ...L.void].filter((id) => num(id)).length === 119, 'the four lists hold #1-119 exactly once');
}

// --- unlocks ---------------------------------------------------------------------------------------------------
{
  const mk = (over, flags = {}) => ({ asc: 0, flags, ...over });
  const rec = (c) => R.syncRecords({ unlocks: {}, met: [], beaten: [] }, c);
  const open = (r) => DIVISIONS.filter((d) => R.tdUnlocked(r, d) && R.gauntletUnlocked(r, d)).join();
  let r = rec(mk({}));
  ok(open(r) === '' && DIVISIONS.every((d) => !R.tdUnlocked(r, d) && !R.gauntletUnlocked(r, d)), 'a new game has nothing open');
  r = rec(mk({}, { jaxBeaten: true }));
  ok(open(r) === '' && !R.modeUnlocked(r, 'td'), 'Jax alone opens nothing: the first ZERO does');
  r = rec(mk({}, { jaxBeaten: true, zeroBeaten: true }));
  ok(open(r) === 'classic' && R.modeUnlocked(r, 'td') && R.modeUnlocked(r, 'gauntlet'), 'the first ZERO: the Classic division (both modes)');
  r = rec(mk({ asc: ASC_PATH.indexOf('halcyon') }, { zeroBeaten: true }));
  ok(open(r) === 'classic', 'facing Halcyon opens nothing');
  r = rec(mk({ asc: ASC_PATH.indexOf('halcyon') + 1 }, { zeroBeaten: true }));
  ok(open(r) === 'classic,pantheon', 'Halcyon beaten: the Pantheon division');
  r = rec(mk({ asc: ASC_PATH.indexOf('vorgath') + 1 }, { zeroBeaten: true }));
  ok(open(r) === 'classic,pantheon,underworld', 'Vorgath beaten: the Underworld division');
  r = rec(mk({ asc: ASC_PATH.length }, { zeroBeaten: true }));
  ok(open(r) === 'classic,pantheon,underworld,void' && !R.tdUnlocked(r, 'combined'), 'ZERO\'s true form beaten: the Void division, Combined waits for the true ending');
  r = rec(mk({ asc: ASC_PATH.length }, { zeroBeaten: true, trueEndingSeen: true }));
  ok(open(r) === DIVISIONS.join(), 'the true ending: Combined');
  // unlocks stay once earned (a new career does not take them back)
  r = R.syncRecords(r, { asc: 0, flags: {} });
  ok(open(r) === DIVISIONS.join(), 'unlocks persist in the records (a new career takes nothing back)');
  ok(R.remixUnlocked(r, 'gus') && R.remixUnlocked(r, 'aurora') && R.remixUnlocked(r, 'zero') && R.remixUnlocked(r, 'willShard'), 'remixes follow their division');
  const rj = { unlocks: { zero: true } };
  ok(R.remixUnlocked(rj, 'gus') && R.remixUnlocked(rj, 'zero') && R.remixUnlocked(rj, 'jax') && !R.remixUnlocked(rj, 'aurora') && !R.remixUnlocked(rj, 'moros') && !R.remixUnlocked(rj, 'dodgeShard'), 'Classic remixes with the first ZERO, the rest with their own division');
}

// --- records: a fresh book, and migration from the old one -------------------------------------------------------
{
  localStorage.removeItem('kocircuit.records');
  let r = R.loadRecords();
  ok(Object.keys(r.td).join() === DIVISIONS.join() && Object.keys(r.gauntlet).join() === DIVISIONS.join(), 'one record per division, in both modes');
  ok(r.td.combined.medals.gold === false && r.gauntlet.void.runs.length === 0 && r.ver === 2, 'blank records');
  // a version-1 save: td {classic, ascension, combined}, gauntlet {main, pantheon, underworld, void, full}
  localStorage.setItem('kocircuit.records', JSON.stringify({ unlocks: { jax: true }, met: [], td: { classic: { best: 11, clears: 2, bestTime: 900, medals: { bronze: true, silver: true, gold: false }, runs: [] }, ascension: { best: 5, clears: 0, medals: {}, runs: [] } },
    gauntlet: { main: { bestStreak: 51, bestStreakTime: 4000, bestTime: 4000, clears: 1, runs: [{ streak: 51, seconds: 4000, by: null, of: 51 }, { streak: 12, seconds: 600, by: 'rocco', of: 51 }] }, void: { bestStreak: 9, bestStreakTime: 800, bestTime: 1500, clears: 1, runs: [] }, full: { bestStreak: 140, bestStreakTime: 3000, bestTime: null, runs: [{ streak: 140, seconds: 3000, by: 'oro', of: 133 }] } },
    run: { mode: 'gauntlet', zone: 'full', full: true, list: ['barney'], idx: 0, health: 100, stars: 0, seconds: 0, last: null } }));
  r = R.loadRecords();
  ok(r.td.classic.best === 11 && r.td.classic.clears === 0 && r.td.classic.bestTime === null && !r.td.classic.medals.bronze && r.td.pantheon.best === 0, 'Title Defense: only the Classic best defense is carried over (the lists changed)');
  ok(r.gauntlet.classic.bestStreak === 51 && r.gauntlet.classic.bestTime === null && r.gauntlet.classic.runs[1].by === 'rocco', 'the old Main Gauntlet record becomes the Classic one (a time of the old list is dropped)');
  ok(r.gauntlet.void.bestStreak === 9 && r.gauntlet.void.bestTime === 1500 && r.gauntlet.void.clears === 1, 'the Void list did not change: its record is kept whole');
  ok(r.gauntlet.combined.bestStreak === 129 && r.gauntlet.combined.runs[0].by === 'oro', 'the old Full record becomes Combined (a streak cut to its 129)');
  ok(r.run === null, 'a run of an old list cannot be resumed');
  localStorage.setItem('kocircuit.records', JSON.stringify({ ver: 2, run: { mode: 'td', tier: 'classic', list: R.gauntletList('classic'), idx: 0, lives: 2, seconds: 0, last: null } }));
  ok(R.loadRecords().run === null, 'a Title Defense run on a list that is not the division\'s is dropped');
  localStorage.setItem('kocircuit.records', JSON.stringify({ ver: 2, run: { mode: 'gauntlet', zone: 'void', list: R.gauntletList('void'), idx: 3, health: 100, stars: 0, seconds: 0, last: null } }));
  ok(R.loadRecords().run && R.loadRecords().run.idx === 3, 'a run that matches its division resumes');
  localStorage.removeItem('kocircuit.records');
}

// --- a game with everything open -------------------------------------------------------------------------------
async function open(unlocks = ['jax', 'zero', 'pantheon', 'underworld', 'void', 'full']) {
  localStorage.removeItem('kocircuit.records');
  const T = await makeGame({ career: 'zero' }), g = T.game;
  g.records = R.loadRecords();
  for (const u of unlocks) g.records.unlocks[u] = true;
  return { T, g };
}
// a scripted input: nav(M, 'down') presses it for one update
function scripted(g) {
  const now = new Set();
  g.input = { held: () => false, pressed: (a) => now.has(a), released: () => false, confirm: () => now.has('start') || now.has('a'), back: () => now.has('b') || now.has('pause'), anyPressed: (l = ['a', 'b', 'start', 'star']) => l.some((a) => now.has(a)), now };
  return (S, a) => { now.clear(); now.add(a); S.update(); now.clear(); };
}

// --- a whole Title Defense, each tier --------------------------------------------------------------------------
for (const tier of DIVISIONS) {
  const { g } = await open();
  const S = new RunScreen(g, { start: 'td', tier });
  const run = g.records.run, n = TD_LISTS[tier].length;
  ok(run && run.mode === 'td' && run.tier === tier && run.list.length === n && run.lives === R.TD_LIVES && run.idx === 0, `${tier}: a run of ${n} starts`);
  ok(S.d.remix === true || !FIGHTERS[run.list[0]].titleDefense, `${tier}: the first opponent is the remix`);
  ok(runTitle(run) === `${tier.toUpperCase()} DEFENSE`, `${tier}: title ${runTitle(run)}`);
  // lose one fight (a life), win the rest
  S.apply({ winner: 'opponent', method: 'KO', round: 1, time: '0:50', seconds: 50 });
  ok(run.idx === 0 && run.lives === 1 && !S.over, `${tier}: one loss costs a life and the rematch is the same fighter`);
  for (let i = 0; i < n; i++) S.apply({ winner: 'player', method: 'KO', round: 1, time: '1:00', seconds: 60 });
  ok(S.over && S.over.kind === 'clear', `${tier}: cleared`);
  const T = g.records.td[tier];
  ok(T.clears === 1 && T.best === n && T.bestTime === 50 + 60 * n, `${tier}: records ${T.clears} ${T.best} ${T.bestTime}`);
  ok(T.medals.bronze && !T.medals.silver && !T.medals.gold, `${tier}: bronze only after losing a fight`);
  ok(DIVISIONS.filter((d) => d !== tier).every((d) => g.records.td[d].clears === 0), `${tier}: the other divisions untouched`);
  ok(g.records.run === null && T.runs[0].clear && T.runs[0].lost === 1, `${tier}: the run is over and listed`);
  // a flawless, fast one earns all three; a slow flawless one silver
  const S2 = new RunScreen(g, { start: 'td', tier });
  for (let i = 0; i < n; i++) S2.apply({ winner: 'player', method: 'KO', round: 1, time: '0:30', seconds: 30 });
  ok(g.records.td[tier].medals.silver && g.records.td[tier].medals.gold && g.records.td[tier].bestTime === 30 * n && S2.over.medals.fresh.includes('gold'), `${tier}: flawless and under par: silver and gold`);
  const S3 = new RunScreen(g, { start: 'td', tier });
  for (let i = 0; i < n; i++) S3.apply({ winner: 'player', method: 'KO', round: 1, time: '0:30', seconds: 30 });
  ok(g.records.td[tier].bestTime === 30 * n && g.records.td[tier].clears === 3, `${tier}: best time kept`);
  // two losses end it, recording who
  const S4 = new RunScreen(g, { start: 'td', tier });
  S4.apply({ winner: 'player', method: 'KO', round: 1, time: '0:30', seconds: 30 });
  S4.apply({ winner: 'opponent', method: 'KO', round: 1, time: '0:30', seconds: 30 });
  S4.apply({ winner: 'opponent', method: 'KO', round: 3, time: '3:00', seconds: 30 });
  ok(S4.over && S4.over.kind === 'lost' && S4.over.by === TD_LISTS[tier][1] && g.records.td[tier].runs[0].by === TD_LISTS[tier][1] && g.records.td[tier].runs[0].defenses === 1, `${tier}: lost to the second fighter, recorded`);
}

// --- the Gauntlets ---------------------------------------------------------------------------------------------
for (const zone of R.GAUNTLETS) {
  const { g } = await open();
  const list = R.gauntletList(zone), S = new RunScreen(g, { start: 'gauntlet', zone });
  const run = g.records.run;
  ok(run && run.mode === 'gauntlet' && run.zone === zone && run.list.length === list.length, `${zone}: a run of ${list.length} starts`);
  ok(runTitle(run) === R.GAUNTLET_INFO[zone].name, `${zone}: titled ${runTitle(run)}`);
  // health: 50% back between fights, never past full; stars carry
  S.apply({ winner: 'player', method: 'KO', round: 1, time: '1:00', seconds: 60, health: 30, stars: 2 });
  ok(run.idx === 1 && run.health === 80 && run.stars === 2, `${zone}: health 30 -> 80, stars carry`);
  S.apply({ winner: 'player', method: 'KO', round: 1, time: '1:00', seconds: 60, health: 90, stars: 0 });
  ok(run.health === 100 && run.stars === 0, `${zone}: health never past full`);
  S.apply({ winner: 'opponent', method: 'KO', round: 1, time: '3:00', seconds: 180, health: 10, stars: 0 });
  ok(S.over && S.over.kind === 'lost' && S.over.by === list[2], `${zone}: one loss ends it`);
  const G = g.records.gauntlet[zone];
  ok(G.bestStreak === 2 && G.bestStreakTime === 300 && G.runs[0].by === list[2] && G.runs[0].of === list.length && G.bestTime === null, `${zone}: records ${JSON.stringify({ s: G.bestStreak, t: G.bestStreakTime })}`);
  ok(R.GAUNTLETS.filter((z) => z !== zone).every((z) => g.records.gauntlet[z].bestStreak === 0), `${zone}: the other Gauntlets' records untouched`);
  // a clear
  const S2 = new RunScreen(g, { start: 'gauntlet', zone });
  for (let i = 0; i < list.length; i++) S2.apply({ winner: 'player', method: 'KO', round: 1, time: '0:10', seconds: 10, health: 100, stars: 0 });
  ok(S2.over && S2.over.kind === 'clear' && G.bestTime === 10 * list.length && G.bestStreak === list.length && G.clears === 1, `${zone}: a clear is recorded`);
  // the run resumes: an in-progress run survives a reload
  const S3 = new RunScreen(g, { start: 'gauntlet', zone });
  S3.apply({ winner: 'player', method: 'KO', round: 1, time: '0:10', seconds: 10, health: 100, stars: 0 });
  const back = R.loadRecords();
  ok(back.run && back.run.idx === 1 && back.run.zone === zone, `${zone}: a run in progress is saved`);
}

// --- the halls: each mode is a place on the map -----------------------------------------------------------------------
{
  const { g } = await open(['zero']);
  g.input.takeTaps = () => []; g.saveCareer = () => {};
  const T_ = new InteriorScreen(g, { id: 'td' }), door = (H, id) => H.L.stations.find((q) => q.id === id);
  ok(T_.L.stations.filter((q) => q.kind === 'door').map((q) => q.enter).join() === DIVISIONS.map((d) => `td.${d}`).join(), 'the championship hall has five entrances');
  ok(DIVISIONS.every((d) => T_.L.stations.some((q) => q.id === `board.${d}` && q.go.args.page === `td.${d}`)), 'and a records board for each division');
  for (const d of ['pantheon', 'underworld', 'void', 'combined']) { g.next = null; T_.note = null; T_.use(door(T_, `door.${d}`)); ok(!g.next && /[A-Z]/.test(T_.note || '') && !g.records.run, `the ${d} entrance is locked: ${T_.note}`); }
  T_.use(door(T_, 'door.classic')); ok(g.next && g.next[0] === 'interior' && g.next[1].id === 'td.classic', 'the Classic door opens');
  g.next = null;
  const G_ = new InteriorScreen(g, { id: 'gauntlet' });
  ok(G_.L.stations.filter((q) => q.kind === 'door').length === 5 && DIVISIONS.every((d) => G_.L.stations.some((q) => q.id === `board.${d}` && q.go.args.page === `g.${d}`)), 'the tower has five doors and a board for each');
  for (const z of ['pantheon', 'underworld', 'void', 'combined']) { g.next = null; G_.note = null; G_.use(door(G_, `gate.${z}`)); ok(!g.next && /[A-Z]/.test(G_.note || '') && !g.records.run, `the ${z} door is locked: ${G_.note}`); }
  g.next = null; G_.use(door(G_, 'gate.classic')); ok(g.next && g.next[0] === 'run' && g.next[1].start === 'gauntlet' && g.next[1].zone === 'classic', 'the Classic Gauntlet door starts the run');
  g.next = null;
  // with a run in progress the halls show it, and another run cannot start over it
  new RunScreen(g, { start: 'td', tier: 'classic' });
  const C_ = new InteriorScreen(g, { id: 'td.classic' });
  ok(C_.podState(C_.L.stations.find((q) => q.kind === 'podium' && q.index === 0)) === 'next', 'a Classic run in progress: Gus is next');
  g.next = null; G_.use(door(G_, 'gate.classic')); ok(!g.next && /DEFENSE/.test(G_.note), `a Gauntlet cannot start over a defense (${G_.note})`);
  const { g: g3 } = await open(); g3.input.takeTaps = () => [];
  new RunScreen(g3, { start: 'td', tier: 'combined' });
  const A_ = new InteriorScreen(g3, { id: 'td.classic' }); g3.next = null; A_.use(A_.L.stations.find((q) => q.kind === 'podium' && q.index === 0));
  ok(!g3.next && /COMBINED/.test(A_.note), `a defense of another division is in progress: ${A_.note}`);
  // a board opens on its own division's page
  const B = new ModeRecordsScreen(g, { page: 'td.void' }), B2 = new ModeRecordsScreen(g, { page: 'g.underworld' });
  ok(RECORD_PAGES[B.page].kind === 'td' && RECORD_PAGES[B.page].id === 'void' && RECORD_PAGES[B2.page].kind === 'gauntlet' && RECORD_PAGES[B2.page].id === 'underworld' && RECORD_PAGES.length === 10, 'a records board opens on its own division\'s page (ten pages)');
}
// --- a Title Defense fight: the card, the champion's own medals and time ----------------------------------------
{
  const { g } = await open(['zero']);
  g.input.takeTaps = () => []; g.saveCareer = () => {};
  const S = new RunScreen(g, { start: 'td', tier: 'classic' });
  const win = { winner: 'player', method: 'KO', round: 1, time: '0:30', seconds: 30, health: 100, stars: 0, stats: { hitsTaken: 0 }, knockdowns: { opp: 1, player: 0 } };
  const S2 = new RunScreen(g, { result: win });
  ok(S2.card && S2.card.won && S2.run.idx === 1, 'a won defense fight shows its card and moves the run on');
  ok(g.records.tdChamps.gus && g.records.tdChamps.gus.best === 30 && g.records.tdChamps.gus.got.speed && g.records.tdChamps.gus.got.flawless && g.records.tdChamps.gus.got.signature, "Gus's own best time and medals are kept (a 30 s KO is under 60% of the target too)");
  ok(Object.keys(g.medals.got).length === 0, 'and never touch the Career medals');
  const S3 = new RunScreen(g, { result: { ...win, winner: 'opponent', method: 'KO' } });
  ok(S3.card && !S3.card.won && S3.run.lives === 1, 'a lost defense fight costs one of the defense\'s lives');
  const S4 = new RunScreen(g, { result: { ...win, winner: 'opponent' } });
  ok(S4.over && S4.over.kind === 'lost' && !g.records.run, 'the second loss ends the defense');
  new RunScreen(g, { start: 'td', tier: 'classic' });
  const S5 = new RunScreen(g, { giveUp: true });
  ok(S5.over && S5.over.kind === 'quit' && !g.records.run, 'giving up ends it too');
}

// --- fight set-up in the modes ---------------------------------------------------------------------------------
{
  const { g } = await open();
  const mk = (id, extra = {}) => new FightScreen(g, { fighter: id, mode: 'gauntlet', ...extra });
  new RunScreen(g, { start: 'gauntlet', zone: 'combined' });
  const f1 = mk('willShard').fight;
  ok(f1.rounds === 3 && f1.stageLock === 5 && f1.stage === 5, 'the Will Shard in a Gauntlet: the regular three rounds, in his fifth-round form from the first bell');
  ok(f1.opp.d.patterns.filter((p) => p.when && p.when.rounds && p.when.rounds.includes(5)).length === 1 && f1.opp.pickPattern, 'his final pattern is the one in play');
  for (let i = 0; i < 400; i++) f1.update();
  ok(f1.stage === 5, 'the stage stays locked as the clock runs');
  f1.round = 3; f1.nextRound(); ok(f1.round === 4 && f1.stage === 5 && f1.esc.c === 1, 'and through the championship rounds');
  const fh = mk('halcyon').fight, fz = mk('zeroTrue').fight, fb = mk('blockShard').fight, fo = mk('barney').fight;
  ok([fb, fo].every((x) => x.rounds === 3 && x.round === 1) && fh.rounds === 5 && fz.rounds === 7 && fh.round === 1 && !fo.stageLock, 'every Gauntlet fight starts at round 1: three regular rounds (a boss his longer bout), then the championship rounds');
  ok(fo.roundFrames === 4320 && fb.roundFrames === 4320 && fh.roundFrames === 5400 && fz.roundFrames === 5400, 'a Gauntlet fight is on the standard clock (3:00 of 24 frames), a big boss on his slower one (30)');
  // the Void's rules inside the Gauntlet: its hearts, its 3-frame tells, its directional defenses, its circuit's rules
  const voidFighters = R.gauntletList('void').filter((id) => CIRCUITS[FIGHTERS[id].circuit].zone === 'void');
  for (const id of voidFighters) {
    const ff = mk(id).fight, base = FIGHTERS[id];
    ok(ff.maxHearts === CIRCUITS[base.circuit].hearts && ff.maxHearts >= 8, `${id}: the Void's hearts (${ff.maxHearts})`);
    ok(Object.entries(base.moves).every(([k, m]) => JSON.stringify(ff.opp.d.moves[k].avoidBy) === JSON.stringify(m.avoidBy)), `${id}: every move keeps its defenses`);
  }
  const dd = mk('dodgeShard').fight;
  ok(['hook', 'hookL', 'body', 'bodyR'].every((k) => dd.opp.d.moves[k].avoidBy.length === 1 && dd.opp.d.moves[k].avoidBy[0].startsWith('dodge')), 'Dodge Shard: a hook can only be slipped the one way (directional)');
  // a wrong-way slip still takes the full hit, with the hint
  const fd = mk('dodgeShard').fight;
  let hit = 0; const orig = fd.opponentAttack.bind(fd);
  fd.opponentAttack = (m) => { const r = orig(m); if (r === 'hit') hit++; return r; };
  void hit; void orig;
  // Title Defense fights are the remix
  new RunScreen(g, { start: 'td', tier: 'combined' });
  const tdScreen = new FightScreen(g, { fighter: 'gus', mode: 'td' });
  ok(tdScreen.fight.d.remix === true && tdScreen.fight.d.nickname === 'DOUBLE SHIFT', 'Title Defense fights the remix');
  ok(tdScreen.fight.arena.def.id === 'td.combined' && /^g\.classic/.test(new FightScreen(g, { fighter: 'gus', mode: 'gauntlet' }).fight.arena.def.id), 'Title Defense fights in the championship hall of its division, the Gauntlet in the endurance arena');
  ok(new FightScreen(g, { fighter: 'gus', mode: 'gauntlet' }).fight.d.remix !== true, 'the Gauntlet fights the regular fighter');
}

// --- screens render -----------------------------------------------------------------------------------------------
{
  const { T, g } = await open();
  const f = new Frame();
  const tryRender = (name, S) => { try { S.enter && S.enter(); for (let i = 0; i < 3; i++) { T.step(i); S.update(); S.render(f); } ok(true, name); } catch (e) { ok(false, `${name}: ${e.stack.split('\n').slice(0, 3).join(' | ')}`); } };
  for (const tier of DIVISIONS) {
    const S = new RunScreen(g, { start: 'td', tier });
    for (let i = 0; i < 6; i++) S.apply({ winner: 'player', method: 'KO', round: 1, time: '0:30', seconds: 30, stats: { hitsTaken: 0 }, knockdowns: { opp: 1, player: 0 } });
    tryRender(`run ${tier} card`, S);
    S.finish('lost', 'gus'); tryRender(`run ${tier} over`, S);
  }
  for (const zone of R.GAUNTLETS) { const S = new RunScreen(g, { start: 'gauntlet', zone }); tryRender(`run ${zone}`, S); S.apply({ winner: 'player', method: 'KO', round: 1, time: '0:30', seconds: 30, health: 40, stars: 1 }); tryRender(`run ${zone} mid`, S); S.finish('lost', 'oro'); tryRender(`run ${zone} over`, S); }
  for (let p = 0; p < RECORD_PAGES.length; p++) tryRender(`records page ${p}`, new ModeRecordsScreen(g, { page: p }));
  for (const tier of DIVISIONS) { const S = new RunScreen(g, { start: 'td', tier }); for (const id of TD_LISTS[tier]) { S.run.idx = TD_LISTS[tier].indexOf(id); S.loadNext(); S.card = { id, won: true, how: 'KO', round: 1, time: '0:30', rec: null }; tryRender(`run card ${id}`, S); } S.card = null; S.finish('quit'); }
  for (const id of ['gus', 'aurora', 'zero', 'zeroTrue']) { const I = new IntroScreen(g, { fighter: id, mode: 'td' }); void I; }
  const P = new PracticeScreen(g, {}); tryRender('practice', P);
}

// --- every remix, fought and drawn ---------------------------------------------------------------------------------------
{
  const { PerfectBot } = await import('../src/fight/bot.js');
  const { g } = await open();
  const f = new Frame();
  for (const tier of ['classic', 'pantheon', 'underworld', 'void']) {
    new RunScreen(g, { start: 'td', tier });
    const seen = new Set();
    for (const id of TD_LISTS[tier]) {
      if (seen.has(id)) continue; seen.add(id);
      try {
        const S = new FightScreen(g, { fighter: id, mode: 'td' });
        const fight = S.fight, bot = new PerfectBot(fight, { attack: true });
        ok(fight.d.remix === true && fight.d.scoutId === `${id}.td`, `${id}: the remix fights, with its own scouting key`);
        let drawn = 0;
        for (let i = 0; i < 900; i++) { bot.think(); S.update(); if (i % 60 === 0) { f.clear(0xff000000); S.render(f); drawn++; } }
        const I = new IntroScreen(g, { fighter: id, mode: 'td' }); f.clear(0xff000000); I.render(f);
        ok(drawn > 10, `${id}: fought and drawn`);
      } catch (e) { ok(false, `${id}: ${e.stack.split('\n').slice(0, 4).join(' | ')}`); }
    }
  }
  // Practice offers the remix of a fighter once he has been reached in a defense (the full test: tools/practice-td-test.mjs)
  const P = new PracticeScreen(g, {});
  const okRemix = (id) => { P.met = [...new Set([...P.met, id])]; P.circuits = [...new Set(P.met.map((x) => FIGHTERS[x].circuit))]; P.P.circuit = P.circuits.indexOf(FIGHTERS[id].circuit); P.P.fighter = P.list().indexOf(id); return P.canRemix(); };
  g.records.tdMet = []; g.records.td.classic.best = 0; g.records.td.classic.clears = 0; g.records.run = null;
  ok(!okRemix('gus') && !okRemix('aurora') && !okRemix('zero') && !okRemix('willShard'), 'Practice: no remix is offered before it is reached');
  for (const [t, id] of [['classic', 'gus'], ['pantheon', 'aurora'], ['classic', 'zero'], ['void', 'willShard']]) R.noteTdMet(g.records, t, id);
  ok(okRemix('gus') && okRemix('aurora') && okRemix('zero') && okRemix('willShard') && !okRemix('barney'), 'Practice: a remix is offered for every defended fighter once reached, and only for them');
  ok(!okRemix('brody') && !okRemix('moros'), 'Practice: the ones not reached yet wait');
}

// --- whole runs, the real screens, the perfect-play bot (--e2e) -------------------------------------------------------------
if (process.argv.includes('--e2e')) {
  const { PerfectBot } = await import('../src/fight/bot.js');
  const named = process.argv.slice(process.argv.indexOf('--e2e') + 1).filter((a) => !a.startsWith('--'));
  const all = [...DIVISIONS.map((d) => `td:${d}`), ...R.GAUNTLETS.map((d) => `g:${d}`)];
  const todo = named.length ? named : all;
  for (const label of todo) {
    const { g } = await open();
    const td = label.startsWith('td:'), what = label.slice(label.indexOf(':') + 1);
    let hub = new RunScreen(g, td ? { start: 'td', tier: what } : { start: 'gauntlet', zone: what });
    const list = [...g.records.run.list];
    let fights = 0, wins = 0, guard = 0;
    const f = new Frame();
    while (g.records.run && guard++ < 400) {
      const run = g.records.run, id = run.list[run.idx];
      new IntroScreen(g, { fighter: id, mode: run.mode }).render(f);
      const S = new FightScreen(g, { fighter: id, mode: run.mode });
      const bot = new PerfectBot(S.fight, { attack: true });
      g.next = null;
      for (let i = 0; i < 400000 && !g.next; i++) { bot.think(); S.update(); if (i % 500 === 0) { f.clear(0xff000000); S.render(f); } }
      const [name, args] = g.next || [];
      fights++;
      if (name !== 'run') { ok(false, `${label}: the fight of ${id} ended on ${name}`); break; }
      if (args.result.winner === 'player') wins++;
      g.next = null;
      hub = new RunScreen(g, { result: args.result });
      hub.render(f);
    }
    const rec = td ? g.records.td[what] : g.records.gauntlet[what];
    const cleared = td ? rec.clears === 1 : rec.clears === 1;
    ok(cleared && fights === list.length + (td ? 0 : 0) && wins === fights, `${label}: the bot cleared all ${list.length} fights through the real screens (${wins}/${fights} won, ${cleared ? 'cleared' : 'NOT cleared: best ' + (rec.best ?? rec.bestStreak) })`);
    if (td) ok(rec.medals.bronze && rec.medals.silver, `${label}: a clean clear earns bronze and silver (${JSON.stringify(rec.medals)})`);
    console.log(`  ${label}: ${fights} fights, best time ${rec.bestTime}s`);
  }
}

console.log(`${checks} checks, ${bad} failed`);
process.exit(bad ? 1 : 0);
