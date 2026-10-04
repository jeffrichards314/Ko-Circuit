// Save test (2026-10-03): every piece of progress belongs to one save and only options / controls are global.
//   node tools/save-test.mjs
// Earns medals, unlocks, scouting, records, costumes and map state in save 1 through the real code paths; starts a New Game in save 2 WITHOUT reloading
// and checks that every piece of in-memory state is blank (and nothing of save 1 was touched on disk); puts a password's career into save 3; then
// reopens save 1 ("reload the original save") and checks everything is back exactly.
import './lib/stub.mjs';
let bad = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { bad++; console.log('  FAIL ' + m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m}: ${JSON.stringify(a)?.slice(0, 120)} vs ${JSON.stringify(b)?.slice(0, 120)}`);

const S = await import('../src/save/storage.js');
const { openSave, startNewSave, startPasswordSave, saveSummary, readSave } = await import('../src/save/session.js');
const { recordFight, medalCount, saveMedals } = await import('../src/save/medals.js');
const { saveScouting, scoutStore } = await import('../src/save/scouting.js');
const { handbookStore } = await import('../src/save/handbook.js');
const { markSeen } = await import('../src/save/cutscenes.js');
const { saveRecords, syncRecords, recordTdFight, tdUnlocked, modeUnlocked } = await import('../src/save/records.js');
const { unlockedList, isUnlocked, costumeUnlocked } = await import('../src/save/unlocks.js');
const { cornerStore, loadCornerLog } = await import('../src/save/cornerLog.js');
const { rivalStore, loadRivalRecord } = await import('../src/save/rivalRecord.js');
const { loadWorld, saveWorld } = await import('../src/world/state.js');
const { passwordOf, careerFromPassword, enterCircuit } = await import('../src/save/career.js');
const { FIGHTERS } = await import('../data/fighters/index.js');
const { remixed } = await import('../data/fighters/titleDefense.js');
const { UNLOCKS } = await import('../data/unlocks.js');
const { EVERYONE, BASE_EVERYONE } = await import('../src/save/records.js');

const dump = () => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; };
const slotKeys = (n) => Object.keys(dump()).filter((k) => (n === 1 ? !/^kocircuit\.s\d+\./.test(k) && !/^kocircuit\.(options|muted|bindings|slot)$/.test(k) : k.startsWith(`kocircuit.s${n}.`)));
const slotData = (n) => Object.fromEntries(slotKeys(n).map((k) => [k, localStorage.getItem(k)]));
const mem = (g) => JSON.stringify({ career: g.career, records: g.records, medals: g.medals, scouting: g.scouting, handbook: g.handbook, seen: g.seen, practice: g.practice ?? null });

const { saveCareer } = await import('../src/save/career.js');
// (main.js's saveCareer, as it is there)
const g = { audio: { sfx() {}, play() {} }, saveCareer() { if (this.career) { saveCareer(this.career); S.save('profile', this.career.profile); saveRecords(syncRecords(this.records, this.career)); } } };
// global things
S.save('options', { crt: 2, sound: false }); S.save('bindings', { a: ['KeyZ'] });

// ---- save 1: a game with a lot earned
openSave(g, 1);
ok(g.career === null && g.slot === 1, 'a fresh browser has no career');
startNewSave(g, 1);
g.career.profile.name = 'ORIGINAL'; g.career.profile.costume = 0;
const c = g.career;
Object.assign(c.flags, { carnivalUnlocked: true, undergroundUnlocked: true, jaxBeaten: true, zeroBeaten: true, nightmareCleared: true }); c.main = 10; c.circuit = 'dream'; c.beaten = 1; c.rival = 15; c.record = { w: 61, l: 3, ko: 40 };
// medals: enough (through the real recorder) to open the unlocks
let n = 0;
for (const id of BASE_EVERYONE) { const d = FIGHTERS[id]; recordFight(g.medals, { opponent: id, winner: 'player', method: 'KO', seconds: 50, hits: 0, rounds: 1, signature: true, remix: false, stats: {} }); if (++n > 70) break; }
saveMedals(g.medals);
// force the three medals for a few so the counts are well over the first unlocks
for (const id of BASE_EVERYONE.slice(0, 40)) g.medals.got[id] = { speed: true, flawless: true, signature: true };
saveMedals(g.medals);
ok(medalCount(g.medals) >= 100, `save 1 has many medals (${medalCount(g.medals)})`);
const cost = UNLOCKS.find((u) => u.kind === 'costume');
ok(cost && costumeUnlocked(g.medals, cost.id), 'save 1 has a costume unlocked');
ok(isUnlocked(g, 'gallery') && isUnlocked(g, 'sound'), 'save 1 has the gallery and jukebox');
// scouting, handbook, seen, corner, rival record, world, mode records, Practice roster
scoutStore(g.scouting).add('barney', 'x:test'); saveScouting(g.scouting);
handbookStore(g.handbook).add('barney', 'KEEP YOUR GUARD UP.');
markSeen(g.seen, 'arrive.rookie'); markSeen(g.seen, 'victory.rookie');
cornerStore().lost('barney'); rivalStore().put({ key: 'turtle', score: 9, fight: 'dash2' });
saveWorld({ ...loadWorld(), pos: 'home', visited: { main: true } });
g.records.td.classic.best = 9; g.records.td.classic.clears = 2;
recordTdFight(g.records, remixed('gus'), { winner: 'player', method: 'KO', seconds: 40, hits: 0, rounds: 1, stats: {} });
g.saveCareer(); saveRecords(syncRecords(g.records, c, ['gus', 'mort']));
g.practice = { circuit: 3, fighter: 2, tell: false, hearts: true, health: false, slow: true, remix: true };
ok(g.records.met.length > 5 && tdUnlocked(g.records, 'classic') && modeUnlocked(g.records, 'practice'), 'save 1 has a Practice roster and the Title Defense open');
const snap1 = mem({ ...g, practice: null }), disk1 = slotData(1), sum1 = saveSummary(1);
ok(Object.keys(disk1).length >= 9, `save 1 wrote its keys (${Object.keys(disk1).join(', ')})`);

// ---- a New Game in save 2, no reload
startNewSave(g, 2);
const blank = (() => { const b = {}; for (const k of ['career', 'records', 'medals', 'scouting', 'handbook', 'seen']) b[k] = null; return b; })();
void blank;
ok(g.slot === 2, 'save 2 is open');
ok(medalCount(g.medals) === 0 && Object.keys(g.medals.got).length === 0 && Object.keys(g.medals.best).length === 0 && g.medals.seen.length === 0, 'New Game: no medals, no record times');
ok(unlockedList(g.medals).length === 0 && !isUnlocked(g, 'gallery') && !isUnlocked(g, 'sound') && !costumeUnlocked(g.medals, cost.id), 'New Game: no medal unlocks (gallery, jukebox, costumes)');
ok(g.records.met.length === 0 && !modeUnlocked(g.records, 'practice'), `New Game: the Practice roster is empty (${g.records.met})`);
ok(!Object.values(g.records.unlocks).some(Boolean) && !tdUnlocked(g.records, 'classic') && !modeUnlocked(g.records, 'zero'), 'New Game: no Title Defense / Gauntlet unlocks');
ok(g.records.td.classic.best === 0 && g.records.td.classic.clears === 0 && Object.keys(g.records.tdChamps).length === 0 && g.records.run === null, 'New Game: no Title Defense records');
ok(Object.values(g.records.gauntlet).every((x) => x.bestStreak === 0 && x.runs.length === 0), 'New Game: no Gauntlet records');
ok(Object.keys(g.scouting).length === 0 && Object.keys(g.handbook).length === 0 && Object.keys(g.seen).length === 0, 'New Game: no scouting, handbook notes or cutscenes seen (Theater)');
ok(g.practice === null, 'New Game: the Practice screen forgot its picks');
ok(g.career.profile.name !== 'ORIGINAL' && g.career.record.w === 0 && g.career.main === 0 && !g.career.flags.zeroBeaten, 'New Game: a new career (name, record, flags)');
ok(Object.keys(loadCornerLog()).length === 0, "New Game: the cornerman's log is empty");
ok(loadRivalRecord() === null, "New Game: Dash's saved behaviour record is gone");
ok(loadWorld().pos === null && Object.keys(loadWorld().visited).length === 0, 'New Game: the map starts over');
eq(JSON.stringify(slotData(1)), JSON.stringify(disk1), 'save 1 on disk is untouched by the New Game');
eq(S.load('options', null), { crt: 2, sound: false }, 'options are global'); ok(!!S.load('bindings', null), 'controls are global');
ok(saveSummary(2) && saveSummary(2).medals === 0, 'save 2 summary');
// play in save 2 (earn something) and make sure save 1 does not move
recordFight(g.medals, { opponent: 'barney', winner: 'player', method: 'KO', seconds: 30, hits: 0, rounds: 1, signature: true, remix: false, stats: {} });
scoutStore(g.scouting).add('gus', 'x:other'); markSeen(g.seen, 'arrive.minor'); saveWorld({ ...loadWorld(), pos: 'rookie' });
g.career.profile.name = 'SECOND'; g.saveCareer();
eq(slotData(1), disk1, 'save 1 on disk is untouched by play in save 2');
ok(slotKeys(2).length > 0 && slotKeys(2).every((k) => k.startsWith('kocircuit.s2.')), 'save 2 writes only its own keys');

// ---- a password goes into a save of its own: nothing of the open game is mixed in
const pw = passwordOf(c), fromPw = careerFromPassword(pw, null);
ok(!!fromPw, 'the password decodes'); 
startPasswordSave(g, 3, fromPw);
ok(g.slot === 3 && medalCount(g.medals) === 0 && Object.keys(g.scouting).length === 0 && Object.keys(g.seen).length === 0 && !isUnlocked(g, 'gallery'), 'password: medals, scouting, cutscenes and medal unlocks are not carried in');
ok(g.career.main === 10 && g.career.record.w === 0 && g.career.profile.name !== 'SECOND' && g.career.profile.name !== 'ORIGINAL', 'password: the career is the code\'s, the record and name are not borrowed');
ok(g.records.unlocks.zero && g.records.unlocks.jax && g.records.met.length > 0, 'password: the mode unlocks and Practice roster follow the career');
ok(g.records.met.every((id) => EVERYONE.includes(id)) && g.records.met.length < EVERYONE.length, `password: the Practice roster is just the career's (${g.records.met.length} of ${EVERYONE.length})`);
eq(slotData(1), disk1, 'save 1 on disk is untouched by the password');
ok(g.practice === null, 'password: the Practice picks are blank');

// ---- reload the original save
openSave(g, 1);
eq(JSON.parse(mem(g)), JSON.parse(snap1), 'reopening save 1: all in-memory progress is back exactly');
ok(medalCount(g.medals) >= 100 && isUnlocked(g, 'sound') && g.records.met.length > 5 && g.career.profile.name === 'ORIGINAL', 'reopening save 1: medals, unlocks, Practice roster and name');
eq(saveSummary(1), sum1, 'save 1 summary'); ok(loadCornerLog().barney && loadRivalRecord().key === 'turtle' && loadWorld().pos === 'home', "reopening save 1: corner log, Dash's record and the map");
// a real page reload: a cold read of the disk gives the same
const cold = readSave();
eq(JSON.parse(mem({ ...cold, practice: null })), JSON.parse(snap1), 'a cold read of save 1 from disk equals what was saved');
// the open save is remembered across a reload
S.useSlot(1); ok(S.load('slot', 1) === 1, 'the open slot is remembered');
// clearing a slot leaves the others and the globals
S.clearSlot(2); ok(slotKeys(2).length === 0 && Object.keys(slotData(1)).length === Object.keys(disk1).length && !!S.load('options', null), 'erasing save 2 leaves save 1 and the options');

// ---- nothing outside storage.js talks to localStorage
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') ? [p] : []; });
const leaks = [...walk('src'), ...walk('data')].filter((p) => !p.endsWith('save/storage.js') && /\blocalStorage\b/.test(readFileSync(p, 'utf8').replace(/\/\/.*$/gm, '')));
ok(leaks.length === 0, `no other file touches localStorage (${leaks})`);
console.log(bad ? `${bad} FAILURES of ${checks}` : `save test clean (${checks} checks)`);
process.exit(bad ? 1 : 0);
