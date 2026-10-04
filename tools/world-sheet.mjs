// The whole world map (or one stretch of it) as one PNG, for art review: every realm revealed, no clouds, every path drawn.
//   node tools/world-sheet.mjs out.png [--zone main|champ|zero|pantheon|underworld|void] [--rows r0,r1] [--cols c0,c1] [--s 1] [--t 0] [--fog main|none] [--main N] [--asc N]
// --rows / --cols crop to tile rows / columns (inclusive). --fog main shows the clouds as a career at --main N would see them.
import { Frame, W as SW } from '../src/engine/renderer.js';
import { writePNG } from './png.mjs';

const store = new Map();
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };

const { newCareer } = await import('../src/save/career.js');
const { loadRecords, syncRecords } = await import('../src/save/records.js');
const { SONGS } = await import('../data/music/index.js');
const { WorldMapScreen } = await import('../src/screens/worldMap.js');
const { VIEW_TOP, VIEW_BOT } = await import('../src/world/paint.js');

const career = newCareer();
Object.assign(career.flags, { carnivalUnlocked: true, carnivalCleared: true, undergroundUnlocked: true, undergroundCleared: true, jaxBeaten: true, nightmareCleared: true, zeroBeaten: true });
const zone = opt('zone', 'main');
const { ZONES } = await import('../data/world/index.js');
career.main = +opt('main', 10); career.circuit = 'dream'; career.rival = 15 | 16 | 32 | 64 | 128 | 256;
career.asc = +opt('asc', { pantheon: 7, underworld: 14, void: 18 }[zone] ?? 0);
if (zone === 'pantheon' || career.asc > 0) career.flags.pantheonOpen = true;
career.flags.voidSeen = true;
const input = { held: () => false, pressed: () => false, released: () => false, confirm: () => false, back: () => false, anyPressed: () => false, takeTaps: () => [] };
const audio = { play() {}, sfx() {}, stop() {}, songTime: () => null, songAt: () => 0 };
const game = { input, audio, songs: SONGS, career, records: loadRecords(), medals: { best: {}, got: {}, seen: [] }, seen: {}, scouting: {}, handbook: {}, options: {}, timeScale: 1, get profile() { return career.profile; }, saveCareer() {}, go() {} };
syncRecords(game.records, career);
game.records.unlocks.jax = true;

const S = new WorldMapScreen(game, { snap: true, arrive: Object.keys(ZONES[zone].nodes)[0] });
S.enter && S.enter();
const P = S.P, Wd = S.W;
for (const R of Wd.realms) P.realmP[R.id] = 1;
for (const e of Wd.edges) P.edgeFrac[e.key] = 1;
for (const id of Object.keys(Wd.nodes)) S.ws.seen.nodes[id] = true;
S.realmOn = Object.fromEntries(Wd.realms.map((R) => [R.id, true]));
S.nodeWanted = () => true;
if (opt('fog', 'none') === 'none') P.fogY = (P.fogDir || 'up') === 'up' ? -1e9 : 1e9;
S.steps = []; S.cur = null; S.note = null;
S.paintStatus = () => {}; S.paintPrompt = () => {}; S.drawPlayer = () => {};
S.t = +opt('t', 0);

const [c0, c1] = (opt('cols', `0,${Wd.cols - 1}`)).split(',').map(Number);
const [r0, r1] = (opt('rows', `0,${Wd.rows - 1}`)).split(',').map(Number);
const X0 = c0 * 16, Y0 = r0 * 16, OW = (c1 - c0 + 1) * 16, OH = (r1 - r0 + 1) * 16, VH = VIEW_BOT - VIEW_TOP;
const out = new Uint32Array(OW * OH);
const f = new Frame();
for (let y = 0; y < OH; y += VH) for (let x = 0; x < OW; x += SW) {
  S.cam.x = X0 + x; S.cam.y = Y0 + y;
  f.clear(0xff000000); S.render(f);
  for (let yy = 0; yy < VH && y + yy < OH; yy++) for (let xx = 0; xx < SW && x + xx < OW; xx++) out[(y + yy) * OW + x + xx] = f.buf[(yy + VIEW_TOP) * SW + xx];
}
writePNG(args[0], out, OW, OH, +opt('s', 1));
console.log(args[0], `${OW}x${OH}`);
