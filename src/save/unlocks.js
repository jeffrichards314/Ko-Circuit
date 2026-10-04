// What the medals have unlocked (§16). Everything follows from the medal count in
// game.medals (localStorage), so there's nothing extra to save except which
// unlocks have been announced ("NEW!" on the title screen: medals.seen).
import { UNLOCKS, ASC_UNLOCKS, ALL_UNLOCKS } from '../../data/unlocks.js';
import { FIGHTERS } from '../../data/fighters/index.js';
import { medalCount, ascMedalCount, saveMedals, MEDAL_TOTAL } from './medals.js';
import { ensureAltPalette } from '../../data/palette.js';
import { CIRCUITS } from '../../data/circuits.js';
import { EVERYONE } from './records.js';

// (the base game's unlocks count the base medals, the Ascension's their own: data/unlocks.js)
export const unlockedList = (M) => { const n = medalCount(M), a = ascMedalCount(M); return ALL_UNLOCKS.filter((u) => (u.track === 'asc' ? a : n) >= u.at); };
export const isUnlocked = (g, id) => unlockedList(g.medals).some((u) => u.id === id);
export const nextUnlock = (M, track = 'base') => {
  const n = track === 'asc' ? ascMedalCount(M) : medalCount(M);
  return (track === 'asc' ? ASC_UNLOCKS : UNLOCKS).find((u) => n < u.at) || null;
};

// Unlocks crossed since last announced; marks them seen.
export function freshUnlocks(M) {
  const fresh = unlockedList(M).filter((u) => !M.seen.includes(u.id));
  if (fresh.length) { M.seen.push(...fresh.map((u) => u.id)); saveMedals(M); }
  return fresh;
}

// His alternate palette (generated for every opponent: data/palette.js) and
// whether it's open: its circuit's ALT COLORS unlock.
export const altPaletteOf = (d) => d.altPalette || ensureAltPalette(d.palette);
export function altUnlocked(g, id) {
  const d = FIGHTERS[id];
  if (!d) return false;
  return unlockedList(g.medals).some((u) => u.kind === 'palettes' && u.circuits.includes(d.circuit));
}
// costumes open by medals (index 0, your own colours, always is)
export const costumeUnlocked = (M, id) => id === 'none' || unlockedList(M).some((u) => u.kind === 'costume' && u.id === id);

// The Pantheon's gate (§5, §18 A1): beat ZERO and hold half of the base game's medals (84 of 168).
// `open` once both are true or the sky has already been opened on this career (a password can
// carry `pantheonOpen` to a machine that has none of the medals).
export const PANTHEON_SHARE = 0.5;
export const PANTHEON_NEED = Math.ceil(MEDAL_TOTAL * PANTHEON_SHARE);
export function pantheonGate(M, career) {
  const f = (career && career.flags) || {};
  const have = medalCount(M);
  const beaten = !!f.zeroBeaten;
  const medals = have >= PANTHEON_NEED;
  return { beaten, need: PANTHEON_NEED, have, short: Math.max(0, PANTHEON_NEED - have), open: beaten && (medals || !!f.pantheonOpen), opened: !!f.pantheonOpen };
}

// The Ascension's zones and how much of each you've reached (Phase F): the lists and the unlocks of a zone show
// as ??? / stay hidden until one of its fighters has been met, so nothing spoils what's ahead.
export const ZONES = ['pantheon', 'underworld', 'void'];
export const ZONE_NAMES = { base: 'THE CIRCUITS', pantheon: 'PANTHEON', underworld: 'UNDERWORLD', void: 'THE VOID' };
export const zoneOfFighter = (id) => { const d = FIGHTERS[id]; return (d && CIRCUITS[d.circuit].asc && CIRCUITS[d.circuit].zone) || 'base'; };
export const zoneSeen = (g, zone) => zone === 'base' || zone == null || g.records.met.some((id) => zoneOfFighter(id) === zone);
export const ascensionSeen = (g) => ZONES.some((z) => zoneSeen(g, z));
// everyone whose zone you have reached: the lists (records, medals, gallery) walk this
export const visibleFighters = (g) => EVERYONE.filter((id) => zoneSeen(g, zoneOfFighter(id)));
