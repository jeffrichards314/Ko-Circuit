// Headless screenshots of any screen (map, cutscenes, endings...) for art review.
//   node tools/screen-shot.mjs out.png <screen> [--args '{"kind":"interim"}'] [--at 0,60,150] [--s 2]
//        [--career zero|pantheon|p3|p7|halcyon|u1|u2|u3|u4|u5|u6|vorgath|door|v1|v2|v3|rival9|zeroTrue|new] [--medals N] [--ascmedals N] [--met pantheon,underworld,void] [--rec jax,zero,full] [--press start@40,down@60]
// Builds the screen with a stand-in game object (silent audio, scripted input), runs its
// update() and renders the frames listed in --at (default: one at frame 0); several frames
// come out as one contact sheet. --career sets the save the screen sees: `new` (a fresh
// career), `zero` (everything cleared, ZERO beaten: the Pantheon gate), `pantheon` (the sky
// open and Pantheon I entered). --medals N gives the medal book N base medals.
// --set k=v,k=v sets numeric fields on the screen (e.g. sel=100, page=1) before it runs.
// --press queues button presses: name@frame (up down left right a b start star pause).
import { Frame, W, H } from '../src/engine/renderer.js';
import { writePNG } from './png.mjs';

const store = new Map();
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };

globalThis.window = globalThis.window || { addEventListener() {}, removeEventListener() {} }; // (the password screen listens for typing)
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const out = args[0], name = args[1];

const { newCareer, enterCircuit } = await import('../src/save/career.js');
const { loadRecords, syncRecords } = await import('../src/save/records.js');
const { BASE_EVERYONE, ASC_EVERYONE, EVERYONE } = await import('../src/save/records.js');
const { SONGS } = await import('../data/music/index.js');

const career = newCareer();
const preset = opt('career', 'new');
if (preset !== 'new') {
  Object.assign(career.flags, { carnivalUnlocked: true, carnivalCleared: true, undergroundUnlocked: true, undergroundCleared: true, jaxBeaten: true, nightmareCleared: true, zeroBeaten: true });
  career.main = 10; career.circuit = 'dream'; career.beaten = 1; career.rival = 15;
  career.record = { w: 61, l: 3, ko: 40 };
}
if (preset === 'pantheon') { career.flags.pantheonOpen = true; enterCircuit(career, 'p1'); }
if (preset === 'p7') { career.flags.pantheonOpen = true; career.asc = 6; enterCircuit(career, 'p7'); }
if (preset === 'halcyon') { career.flags.pantheonOpen = true; career.asc = 7; enterCircuit(career, 'halcyon'); }
if (preset === 'u1') { career.flags.pantheonOpen = true; career.asc = 8; enterCircuit(career, 'u1'); }
if (preset === 'u2') { career.flags.pantheonOpen = true; career.asc = 9; enterCircuit(career, 'u2'); career.beaten = 2; }
if (preset === 'u3') { career.flags.pantheonOpen = true; career.asc = 10; enterCircuit(career, 'u3'); career.beaten = 1; career.rival = 15 | 16 | 32; }
if (preset === 'u4') { career.flags.pantheonOpen = true; career.asc = 11; enterCircuit(career, 'u4'); career.beaten = 1; career.rival = 15 | 16 | 32 | 64; }
if (preset === 'u5') { career.flags.pantheonOpen = true; career.asc = 12; enterCircuit(career, 'u5'); career.beaten = 2; career.rival = 15 | 16 | 32 | 64; }
if (preset === 'u6') { career.flags.pantheonOpen = true; career.asc = 13; enterCircuit(career, 'u6'); career.beaten = 3; career.rival = 15 | 16 | 32 | 64; }
if (preset === 'vorgath') { career.flags.pantheonOpen = true; career.asc = 14; enterCircuit(career, 'vorgath'); career.rival = 15 | 16 | 32 | 64 | 128; }
// the Void (Phase E)
const VOIDBASE = () => { career.flags.pantheonOpen = true; career.flags.voidSeen = true; career.flags.dealBroken = true; career.flags.underworldSeen = true; career.rival = 15 | 16 | 32 | 64 | 128; };
if (preset === 'door') { VOIDBASE(); career.flags.voidSeen = false; career.asc = 15; enterCircuit(career, 'v1'); }
if (preset === 'v1') { VOIDBASE(); career.asc = 15; enterCircuit(career, 'v1'); career.beaten = 2; career.freed = 3; }
if (preset === 'v2') { VOIDBASE(); career.asc = 16; enterCircuit(career, 'v2'); career.beaten = 1; career.freed = 0xf | 16; }
if (preset === 'v3') { VOIDBASE(); career.asc = 17; enterCircuit(career, 'v3'); career.beaten = 3; career.freed = 0x7ff; }
if (preset === 'rival9') { VOIDBASE(); career.asc = 18; enterCircuit(career, 'rival9', true); career.freed = 0xfff; }
if (preset === 'zeroTrue') { VOIDBASE(); career.asc = 18; career.rival |= 256; enterCircuit(career, 'zeroTrue'); career.freed = 0xfff; }
if (preset === 'p3') { career.flags.pantheonOpen = true; career.asc = 2; enterCircuit(career, 'p3'); }

const medals = { best: {}, got: {}, seen: [] };
let need = +opt('medals', 0);
for (const id of BASE_EVERYONE) { if (need <= 0) break; medals.got[id] = { speed: need > 0, flawless: need > 1, signature: need > 2 }; need -= 3; }

let ascNeed = +opt('ascmedals', 0);
for (const id of ASC_EVERYONE) { if (ascNeed <= 0) break; medals.got[id] = { speed: ascNeed > 0, flawless: ascNeed > 1, signature: ascNeed > 2 }; medals.best[id] = 100 + ascNeed; ascNeed -= 3; }
for (const id of BASE_EVERYONE) if (medals.got[id]) medals.best[id] = 90 + (medals.got[id].speed ? 1 : 0);

const held = new Set(), pressedNow = new Set();
const presses = (opt('press', '') || '').split(',').filter(Boolean).map((x) => { const [a, f] = x.split('@'); return [a, +f]; });
const input = {
  held: (a) => held.has(a), pressed: (a) => pressedNow.has(a), released: () => false,
  confirm: () => pressedNow.has('start') || pressedNow.has('a'), back: () => pressedNow.has('b') || pressedNow.has('pause'),
  anyPressed: (l = ['a', 'b', 'start', 'star']) => l.some((a) => pressedNow.has(a)), takeTaps: () => [],
};
const calls = [];
const audio = { play() {}, sfx(n) { calls.push(n); }, stop() {}, songTime: () => null, songAt: () => 0 };
const game = {
  input, audio, songs: SONGS, career, records: loadRecords(), medals, seen: JSON.parse(opt('seen', '{}')), enterSandbox() {}, leaveSandbox() {}, scouting: {}, handbook: {}, options: {}, timeScale: 1,
  get profile() { return career.profile; },
  saveCareer() {}, go(n, a) { this.next = [n, a]; },
};
syncRecords(game.records, career);
for (const k of (opt('rec', '') || '').split(',').filter(Boolean)) game.records.unlocks[k] = true; // --rec jax,zero,full: mode unlocks
{
  // --met: mark a zone's fighters as met (the lists, gallery and sound test open with them)
  const { zoneOfFighter } = await import('../src/save/unlocks.js');
  const zones = (opt('met', '') || '').split(',').filter(Boolean);
  game.records.met = EVERYONE.filter((id) => game.records.met.includes(id) || zones.includes(zoneOfFighter(id)) || (zones.includes('base') && zoneOfFighter(id) === 'base'));
  if (opt('scout', '')) { const { FIGHTERS } = await import('../data/fighters/index.js'); const { scoutEntries } = await import('../src/fight/knowledge.js'); const n = +opt('scout'); EVERYONE.slice(0, n).forEach((id) => { game.scouting[id] = scoutEntries(FIGHTERS[id]).map((e) => e.key); }); }
}

const { WorldMapScreen: CircuitMapScreen } = await import('../src/screens/worldMap.js');
const { InteriorScreen } = await import('../src/screens/interior.js');
const { TravelScreen } = await import('../src/screens/travel.js');
const { BlimpScreen } = await import('../src/screens/blimp.js');
const { EndingScreen } = await import('../src/screens/ending.js');
const { BeltScreen } = await import('../src/screens/cutscenes.js');
const { CutsceneScreen } = await import('../src/screens/cutscene.js');
const { TheaterScreen } = await import('../src/screens/theater.js');
const { ResultsScreen } = await import('../src/screens/results.js');
const { IntroScreen } = await import('../src/screens/intro.js');
const { PasswordScreen } = await import('../src/screens/passwordEntry.js');
const ex = await import('../src/screens/extras.js');
const md = await import('../src/screens/modes.js');
const mr = await import('../src/screens/modeRecords.js');
const registry = { blimp: BlimpScreen, travel: TravelScreen, interior: InteriorScreen, records: ex.RecordsScreen, medals: ex.MedalsScreen, gallery: ex.GalleryScreen, soundtest: ex.SoundTestScreen, unlocks: ex.UnlocksScreen, modeRecords: mr.ModeRecordsScreen, run: md.RunScreen, map: CircuitMapScreen, ending: EndingScreen, belt: BeltScreen, cutscene: CutsceneScreen, theater: TheaterScreen, results: ResultsScreen, intro: IntroScreen, password: PasswordScreen, practice: md.PracticeScreen };
try { const m = await import('../src/screens/fall.js'); Object.assign(registry, { fall: m.FallScreen }); } catch (e) { if (!/Cannot find module|ERR_MODULE_NOT_FOUND/.test(String(e.message))) throw e; }
try { const m = await import('../src/screens/descend.js'); Object.assign(registry, { descend: m.DescendScreen, ferry: m.FerryScreen }); } catch (e) { if (!/Cannot find module|ERR_MODULE_NOT_FOUND/.test(String(e.message))) throw e; }
try { const m = await import('../src/screens/deal.js'); Object.assign(registry, { deal: m.DealScreen }); } catch (e) { if (!/Cannot find module|ERR_MODULE_NOT_FOUND/.test(String(e.message))) throw e; }
try { const m = await import('../src/screens/void.js'); Object.assign(registry, { voidDoor: m.VoidDoorScreen, free: m.FreeScreen, reforge: m.ReforgeScreen, trueEnding: m.TrueEndingScreen }); } catch (e) { if (!/Cannot find module|ERR_MODULE_NOT_FOUND/.test(String(e.message))) throw e; }
try { const m = await import('../src/screens/ascend.js'); Object.assign(registry, { ascend: m.AscendScreen }); } catch (e) { if (!/Cannot find module|ERR_MODULE_NOT_FOUND/.test(String(e.message))) throw e; }

const S = new registry[name](game, JSON.parse(opt('args', '{}')));
for (const kv of (opt('set', '') || '').split(',').filter(Boolean)) { const [k, v] = kv.split('='); S[k] = +v; }
if (opt('set')) S.load && S.load();
S.enter && S.enter();
const at = opt('at', '0').split(',').map(Number);
const last = Math.max(...at);
const scale = +opt('s', 2);
const frames = [];
const f = new Frame();
for (let t = 0; t <= last; t++) {
  pressedNow.clear();
  for (const [a, fr] of presses) if (fr === t) { pressedNow.add(a); }
  if (t > 0) S.update();
  if (at.includes(t)) { f.clear(0xff000000); S.render(f); frames.push(Uint32Array.from(f.buf)); }
}
if (frames.length === 1) writePNG(out, frames[0], W, H, scale);
else {
  const cols = Math.min(frames.length, +opt('cols', 3)), rows = Math.ceil(frames.length / cols);
  const G = 4, SW = cols * (W + G) - G, SH = rows * (H + G) - G;
  const sheet = new Uint32Array(SW * SH).fill(0xff303040);
  frames.forEach((fr, i) => {
    const ox = (i % cols) * (W + G), oy = Math.floor(i / cols) * (H + G);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) sheet[(oy + y) * SW + ox + x] = fr[y * W + x];
  });
  writePNG(out, sheet, SW, SH, scale);
}
console.log(out, `(${frames.length} frame${frames.length === 1 ? '' : 's'})${game.next ? ' -> ' + JSON.stringify(game.next) : ''}`);
