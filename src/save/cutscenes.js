// The cutscenes you have seen (spec §19 G1): a count per scene id in localStorage
// (`kocircuit.cutscenes`), kept across careers like medals and never in a password.
// A seen scene skips with one tap of START; the Theater lists the ones you have seen.
import { load, save } from './storage.js';

export function loadSeen() {
  const m = load('cutscenes', null);
  return m && typeof m === 'object' ? m : {};
}
export const seenCount = (seen, id) => seen[id] || 0;
export function markSeen(seen, id) {
  seen[id] = (seen[id] || 0) + 1;
  save('cutscenes', seen);
}
