// Practice and the Title Defense versions (2026-10-03). Practice offers, for every opponent who defends in any of the five divisions (Classic, Pantheon,
// Underworld, Void, Combined), his normal version and his Title Defense version in each division you have REACHED him in:
//   - all 44 Title Defense opponents have a remix with its exclusive attack, and a Practice fight built from it is that remix (his remixed moves and
//     patterns, the exclusive super thrown first, his own scouting report) in the division's hall and theme
//   - nothing is offered before it has been reached; reaching it in a defense (the fight begins, or an older save's best defense / clear / run got that
//     far) offers exactly that division's version; Combined is its own version; the rest of the roster (no remix) never gets the row
//   - a Practice fight steps without trouble, and nothing in Practice counts (no medals, no records)
//   node tools/practice-td-test.mjs
import { makeGame } from './lib/stub.mjs';
globalThis.window = globalThis.window || { addEventListener() {}, removeEventListener() {} };
let bad = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { bad++; console.log('  FAIL ' + m); } };
const { FIGHTERS } = await import('../data/fighters/index.js');
const { TD_LISTS, remixed } = await import('../data/fighters/titleDefense.js');
const { supersOf } = await import('../data/fighters/super.js');
const { DIVISIONS } = await import('../data/divisions.js');
const { EVERYONE, tdVersions, tdReachedIn, noteTdMet, loadRecords } = await import('../src/save/records.js');
const { PracticeScreen } = await import('../src/screens/modes.js');
const { FightScreen } = await import('../src/screens/fight.js');
const { modeArena } = await import('../data/arenas/modes.js');

const T = await makeGame({ career: 'zeroTrue' }), g = T.game;
g.input.takeTaps = () => []; g.go = function (n, a) { this.next = [n, a]; };
const open = (id) => { const S = new PracticeScreen(g, {}); S.P.circuit = S.circuits.indexOf(FIGHTERS[id].circuit); S.P.fighter = S.list().indexOf(id); S.mode = 'options'; S.refresh(); return S; };
const freshRecords = () => { const r = loadRecords(); r.met = [...EVERYONE]; return r; };

// ---- every one of the 44 has a remix with the exclusive super thrown first
const all = [...new Set(TD_LISTS.combined)];
ok(all.length === 44, `44 Title Defense opponents (${all.length})`);
for (const id of all) {
  const d = FIGHTERS[id], r = remixed(id);
  ok(d && d.titleDefense, `${id}: has a Title Defense block`);
  ok(r !== d && r.remix, `${id}: remixed() is a remix`);
  ok(supersOf(r).some((s) => s.exclusive) && !supersOf(d).some((s) => s.exclusive), `${id}: the exclusive attack is his remix's only`);
  ok(r.scoutId === `${id}.td`, `${id}: his own scouting report`);
}

// ---- nothing offered before it is reached; the roster without a remix never gets the row
g.records = freshRecords();
for (const id of all) { const S = open(id); ok(S.versions().length === 1 && !S.shown('version'), `${id}: not offered before it is reached`); }
{ const id = 'barney'; const S = open(id); ok(!FIGHTERS[id].titleDefense && S.versions().length === 1 && !S.shown('version'), 'barney (no remix): no version row'); }

// ---- reaching it: per division
for (const tier of DIVISIONS) for (const id of TD_LISTS[tier]) {
  g.records = freshRecords(); g.practice = null;
  ok(noteTdMet(g.records, tier, id) && !noteTdMet(g.records, tier, id), `${tier}/${id}: reaching is noted once`);
  const S = open(id), v = S.versions();
  const expect = ['normal', tier];
  ok(JSON.stringify(v) === JSON.stringify(expect), `${tier}/${id}: versions ${v} (want ${expect})`);
  ok(S.shown('version') && !S.isRemix(), `${tier}/${id}: the row shows, on his normal version first`);
  // pick the version with the controls and start the fight
  S.sel = 6; const rows = ['circuit', 'fighter', 'tell', 'hearts', 'health', 'slow', 'version', 'alt', 'xview', 'fight', 'back'];
  S.sel = rows.indexOf('version');
  g.input.pressed = (a) => a === 'right'; g.input.confirm = () => false; g.input.back = () => false; g.input.held = () => false;
  S.update();
  ok(S.version() === tier && S.isRemix() && S.d.remix === true, `${tier}/${id}: the right arrow picks his ${tier} version`);
  S.sel = rows.indexOf('fight');
  g.input.pressed = () => false; g.input.confirm = () => true;
  g.next = null; S.update(); g.input.confirm = () => false;
  ok(g.next && g.next[0] === 'fight' && g.next[1].practice.remix === true && g.next[1].practice.tier === tier, `${tier}/${id}: FIGHT! starts a Practice fight of the ${tier} version`);
  const FS = new FightScreen(g, g.next[1]), O = FS.fight.opp;
  ok(FS.fight.opp && O.d.remix === true && O.d.id === id, `${tier}/${id}: the opponent in the ring is his remix`);
  ok(O.seqSupers && O.seqSupers[0] && O.seqSupers[0].exclusive, `${tier}/${id}: he throws his exclusive attack first`);
  ok(FS.fight.opts.arenaDef && JSON.stringify(FS.fight.opts.arenaDef) === JSON.stringify(modeArena('td', tier)), `${tier}/${id}: fights in the ${tier} defense's hall`);
  // it steps (the bot-free fight: the player idles, the opponent attacks)
  let threw = null;
  try { g.input.pressed = () => false; g.input.held = () => false; FS.enter(); for (let i = 0; i < 400; i++) FS.update(); } catch (e) { threw = e; }
  ok(!threw, `${tier}/${id}: a Practice fight steps (${threw && threw.stack.split('\n')[0]})`);
  ok(!(g.medals.got[id] && g.medals.got[id].speed) && !(g.records.tdChamps && g.records.tdChamps[id]), `${tier}/${id}: nothing in Practice counts`);
  // a Practice fight is never a defense: it does not mark the version reached in another division
  ok(tdVersions(g.records, id).join() === tier, `${tier}/${id}: only the reached division is offered (${tdVersions(g.records, id)})`);
}

// ---- Combined and a division together
{
  g.records = freshRecords();
  noteTdMet(g.records, 'combined', 'gus'); noteTdMet(g.records, 'classic', 'gus');
  const S = open('gus'); ok(S.versions().join() === 'normal,classic,combined', `gus in two divisions: ${S.versions()}`);
  S.P.version = 'combined'; ok(S.version() === 'combined', 'gus: the Combined version can be picked');
  // a fighter without the picked version falls back to his normal one
  S.P.version = 'void'; ok(S.version() === 'normal', 'a version not reached falls back to normal');
}
// ---- older saves: reached by the best defense, a clear, a run in progress
{
  g.records = freshRecords();
  g.records.td.classic.best = 3;
  const L = TD_LISTS.classic;
  ok(L.slice(0, 4).every((id) => tdReachedIn(g.records, 'classic', id)) && !L.slice(4).some((id) => tdReachedIn(g.records, 'classic', id)), 'a best defense of 3: the first four are reached, no more');
  g.records.td.pantheon.clears = 1; ok(TD_LISTS.pantheon.every((id) => tdReachedIn(g.records, 'pantheon', id)), 'a cleared defense: the whole division');
  g.records.run = { mode: 'td', tier: 'underworld', list: [...TD_LISTS.underworld], idx: 2, lives: 2, seconds: 0, last: null };
  ok(TD_LISTS.underworld.slice(0, 3).every((id) => tdReachedIn(g.records, 'underworld', id)) && !tdReachedIn(g.records, 'underworld', TD_LISTS.underworld[3]), 'a defense at its third: up to there');
  ok(!tdReachedIn(g.records, 'void', 'dodgeShard') && !tdReachedIn(g.records, 'combined', 'gus'), 'nothing else is reached');
}
// ---- a defense fight marks it (mode td, in the division's hall)
{
  g.records = freshRecords();
  g.records.run = { mode: 'td', tier: 'pantheon', list: [...TD_LISTS.pantheon], idx: 0, lives: 2, seconds: 0, last: null };
  new FightScreen(g, { fighter: 'aurora', mode: 'td' });
  ok(g.records.tdMet.includes('pantheon:aurora'), 'a Title Defense fight notes the version reached');
  new FightScreen(g, { fighter: 'gus', mode: 'td', rematch: { td: true, at: 'pod0', tier: 'combined' } });
  ok(g.records.tdMet.includes('combined:gus'), 'a podium rematch in the Combined hall notes it too');
}
console.log(bad ? `${bad} FAILURES of ${checks}` : `practice Title Defense test clean (${checks} checks)`);
process.exit(bad ? 1 : 0);
