// The opponent handbook's saved notes (localStorage only, `kocircuit.handbook`): fighter id ->
// the specific corner notes his trainer has given you against him. What the handbook shows
// otherwise is read live from the medals ("met") and the scouting reports.
import { load, save } from './storage.js';

const MAX_NOTES = 8;
export function loadHandbook() { return load('handbook', null) || {}; }
export const saveHandbook = (H) => save('handbook', H);

// The Fight's opts.handbook: add() files a corner note under the fighter (once, newest kept).
export function handbookStore(H) {
  return {
    add(id, text) {
      const L = (H[id] ||= []);
      if (L.includes(text)) return false;
      L.push(text);
      if (L.length > MAX_NOTES) L.shift();
      saveHandbook(H);
      return true;
    },
  };
}
