// OPENING A SAVE (2026-10-03). Everything that is progress lives in `game` in memory AND in localStorage under the open slot (storage.js). Opening a save
// (Continue, Load Game, New Game, a password) must never keep a piece of the last one, so all of it goes through here and every piece is read again
// from scratch: the career, the mode records (Title Defense, the Gauntlets, the Practice roster, the mode unlocks), medals and record times (which
// open the Theater's jukebox, costumes and the gallery), scouting reports, the corner's handbook, the cutscenes seen (the Theater), and with them the
// Practice screen's own memory and where you are. The map's memory, Dash's record and the cornerman's log are read from the slot's keys whenever they
// are used, so they follow the slot too. Only options and the key bindings are global.
//   readSave()                        -> a fresh copy of every piece of progress of the open slot
//   openSave(game, n)                 make slot n the open one and replace the game's in-memory state with what it holds
//   startNewSave(game, n)             erase slot n and open it empty, with a new career
//   startPasswordSave(game, n, c)     erase slot n and open it holding career c (from a password) and nothing else
//   saveSummary(n)                    what the save screen shows for slot n (null when empty)
import { useSlot, activeSlot, clearSlot, loadFrom, save } from './storage.js';
import { loadCareer, saveCareer, newCareer } from './career.js';
import { loadRecords, saveRecords, syncRecords } from './records.js';
import { loadMedals, medalCount, MEDAL_TOTAL } from './medals.js';
import { loadScouting } from './scouting.js';
import { loadSeen } from './cutscenes.js';
import { loadHandbook } from './handbook.js';
import { costumeUnlocked } from './unlocks.js';
import { costumeIdOf } from '../../data/customization.js';
import { CIRCUITS } from '../../data/circuits.js';

export function readSave() {
  return { career: loadCareer(), records: loadRecords(), medals: loadMedals(), handbook: loadHandbook(), scouting: loadScouting(), seen: loadSeen() };
}

export function openSave(game, n) {
  if (game.leaveSandbox) game.leaveSandbox();
  useSlot(n);
  save('slot', activeSlot());
  Object.assign(game, readSave());
  game.slot = activeSlot();
  game.practice = null; // (the Practice screen's picks)
  game.loc = { area: 'world' };
  game.timeScale = 1;
  // a costume only shows if its medals are here (medals live in localStorage, not the password)
  if (game.career && !costumeUnlocked(game.medals, costumeIdOf(game.career.profile))) { game.career.profile.costume = 0; saveCareer(game.career); }
  saveRecords(syncRecords(game.records, game.career));
  return game;
}

export function startNewSave(game, n) {
  clearSlot(n);
  openSave(game, n);
  game.career = newCareer();
  saveCareer(game.career);
  return game;
}

export function startPasswordSave(game, n, career) {
  clearSlot(n);
  openSave(game, n);
  game.career = career;
  saveCareer(career);
  saveRecords(syncRecords(game.records, career));
  return game;
}

export function saveSummary(n) {
  const c = loadFrom(n, 'career', null);
  if (!c || !c.circuit) return null;
  const m = loadFrom(n, 'medals', null) || {}, M = { best: m.best || {}, got: m.got || {}, seen: m.seen || [] };
  const C = CIRCUITS[c.circuit];
  return { name: (c.profile && c.profile.name) || 'BOXER', where: C ? C.name : c.circuit, wins: c.record ? c.record.w : 0, medals: medalCount(M), total: MEDAL_TOTAL };
}
