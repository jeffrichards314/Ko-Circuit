// The cornerman's hint banks (spec §4 "Between rounds"; read by src/fight/cornerman.js): one per opponent, keyed by his id
// (a Title Defense remix's own bank is '<id>.td'). Written per zone, in the voice of whoever is in that corner.
import main1 from './main1.js';
import main2 from './main2.js';
import main3 from './main3.js';
import main4 from './main4.js';
import pantheon1 from './pantheon1.js';
import pantheon2 from './pantheon2.js';
import underworld1 from './underworld1.js';
import underworld2 from './underworld2.js';
import voidHints from './void.js';
import remixes from './remixes.js';
import exclusive from './exclusive.js';
import remixesVoid from './remixesVoid.js';

// (a remix's bank is written in pieces: its knowledge in remixes*.js, its exclusive attack's super hints in exclusive.js: they are joined key by key)
const joinBanks = (...parts) => {
  const out = {};
  for (const part of parts) for (const [k, b] of Object.entries(part)) {
    const o = (out[k] ||= {});
    for (const [g, v] of Object.entries(b)) o[g] = Array.isArray(v) ? [...(o[g] || []), ...v] : { ...(o[g] || {}), ...v };
  }
  return out;
};
export const HINTS = { ...main1, ...main2, ...main3, ...main4, ...pantheon1, ...pantheon2, ...underworld1, ...underworld2, ...voidHints, ...joinBanks(remixes, remixesVoid, exclusive) };
// a topic's lines by key, with a wildcard entry ('slip_*') standing in for a family of exploits
export function linesFor(group, key) {
  if (!group) return null;
  if (group[key]) return group[key];
  for (const [k, L] of Object.entries(group)) if (k.endsWith('*') && key.startsWith(k.slice(0, -1))) return L;
  return null;
}
