// A stand-in game object for headless scene and map tools (spec §19): silent audio, scripted input, a career preset.
// import { makeGame } from './lib/stub.mjs'  ->  { game, press(action, frame), tick() }
const store = new Map();
globalThis.localStorage = globalThis.localStorage || { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k), key: (i) => [...store.keys()][i] ?? null, get length() { return store.size; } };

export async function makeGame({ career: preset = 'new', seen = {}, medals = 0 } = {}) {
  const { newCareer, enterCircuit } = await import('../../src/save/career.js');
  const { loadRecords, syncRecords, BASE_EVERYONE } = await import('../../src/save/records.js');
  const { SONGS } = await import('../../data/music/index.js');
  const career = newCareer();
  if (preset !== 'new') {
    Object.assign(career.flags, { carnivalUnlocked: true, carnivalCleared: true, undergroundUnlocked: true, undergroundCleared: true, jaxBeaten: true, nightmareCleared: true, zeroBeaten: true });
    career.main = 10; career.circuit = 'dream'; career.beaten = 1; career.rival = 15;
    career.record = { w: 61, l: 3, ko: 40 };
  }
  const flagsFor = { pantheon: () => { career.flags.pantheonOpen = true; enterCircuit(career, 'p1'); },
    p3: () => { career.flags.pantheonOpen = true; career.asc = 2; enterCircuit(career, 'p3'); },
    p7: () => { career.flags.pantheonOpen = true; career.asc = 6; enterCircuit(career, 'p7'); },
    u1: () => { career.flags.pantheonOpen = true; career.asc = 8; enterCircuit(career, 'u1'); },
    u4: () => { career.flags.pantheonOpen = true; career.asc = 11; enterCircuit(career, 'u4'); career.beaten = 1; career.rival = 15 | 16 | 32 | 64; },
    vorgath: () => { career.flags.pantheonOpen = true; career.asc = 14; enterCircuit(career, 'vorgath'); career.rival = 15 | 16 | 32 | 64 | 128; },
    v1: () => { career.flags.pantheonOpen = true; career.flags.voidSeen = true; career.flags.dealBroken = true; career.flags.underworldSeen = true; career.rival = 15 | 16 | 32 | 64 | 128; career.asc = 15; enterCircuit(career, 'v1'); career.beaten = 2; career.freed = 3; },
    zeroTrue: () => { career.flags.pantheonOpen = true; career.flags.voidSeen = true; career.flags.dealBroken = true; career.flags.underworldSeen = true; career.rival = 15 | 16 | 32 | 64 | 128 | 256; career.asc = 18; enterCircuit(career, 'zeroTrue'); career.freed = 0xfff; } };
  if (flagsFor[preset]) flagsFor[preset]();
  const medalBook = { best: {}, got: {}, seen: [] };
  let need = medals;
  for (const id of BASE_EVERYONE) { if (need <= 0) break; medalBook.got[id] = { speed: true, flawless: need > 1, signature: need > 2 }; need -= 3; }
  const held = new Set(), now = new Set(), queue = [];
  const input = {
    held: (a) => held.has(a), pressed: (a) => now.has(a), released: () => false,
    confirm: () => now.has('start') || now.has('a'), back: () => now.has('b') || now.has('pause'),
    anyPressed: (l = ['a', 'b', 'start', 'star']) => l.some((a) => now.has(a)),
  };
  const calls = [];
  const audio = { play(s) { calls.push('play:' + (s && s.id)); }, sfx(n) { calls.push('sfx:' + n); }, stop() {}, songTime: () => null, songAt: () => 0 };
  const game = {
    input, audio, songs: SONGS, career, records: loadRecords(), medals: medalBook, scouting: {}, handbook: {}, options: {}, timeScale: 1, seen: { ...seen }, calls,
    get profile() { return career.profile; }, saveCareer() {}, go(n, a) { this.next = [n, a]; },
  };
  syncRecords(game.records, career);
  return {
    game, calls,
    // script a press (one frame) or a hold (from..to) of an action
    press(a, frame) { queue.push({ a, from: frame, to: frame }); },
    hold(a, from, to) { queue.push({ a, from, to }); },
    step(frame) { now.clear(); held.clear(); for (const q of queue) { if (frame >= q.from && frame <= q.to) { held.add(q.a); if (frame === q.from) now.add(q.a); } } },
  };
}
