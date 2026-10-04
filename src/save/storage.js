// localStorage wrapper. Every access is guarded: private windows and blocked
// storage must never break the game.
//
// SAVES (2026-10-03): all progress belongs to one of SLOTS saves. Slot 1 uses the original key names (`kocircuit.career`, `kocircuit.medals`, ...) so a
// save made before slots existed is slot 1 as it stands; slot 2 and up use `kocircuit.s2.career` and so on. Only GLOBAL keys (options, the key
// bindings, which slot is open) belong to the player rather than to a save. load() and save() always address the open slot, so nothing a screen
// saves can land in another save; main.js reads every piece of progress again whenever the open slot changes (game.loadSlot).

const PREFIX = 'kocircuit.';
export const SLOTS = 3;
const GLOBAL = new Set(['options', 'muted', 'bindings', 'slot']);
let slot = 1;

export const activeSlot = () => slot;
export function useSlot(n) { slot = Number.isInteger(n) && n >= 1 && n <= SLOTS ? n : 1; }
const keyIn = (n, k) => (GLOBAL.has(k) || n === 1 ? PREFIX + k : `${PREFIX}s${n}.${k}`);

export function load(key, fallback) {
  return loadFrom(slot, key, fallback);
}
// read a key of any slot (the save screen's summaries) without opening it
export function loadFrom(n, key, fallback) {
  try {
    const raw = localStorage.getItem(keyIn(n, key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(keyIn(slot, key), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// erase one whole save: every key that belongs to it (slot 1: the unprefixed ones, minus the global keys and the other slots')
export function clearSlot(n) {
  try {
    const mine = (k) => {
      if (!k.startsWith(PREFIX)) return false;
      const rest = k.slice(PREFIX.length), m = /^s(\d+)\./.exec(rest);
      return m ? +m[1] === n : n === 1 && !GLOBAL.has(rest);
    };
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && mine(k)) keys.push(k); }
    for (const k of keys) localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}
