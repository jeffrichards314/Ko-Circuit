// Training perks (§7). Won in the training minigames between circuits (see
// src/screens/training.js); up to 3 equipped at a time. Every perk is small and
// only touches the player's side of a fight: none of them changes a tell window,
// a counter window or anything about the opponent's timing.
//
// Each minigame has two perks: the first at its SILVER score, the second at GOLD.

export const PERKS = [
  { id: 'counter', game: 'bag', short: 'COUNTER', name: 'COUNTER PUNCHER', text: 'COUNTERS HIT 15% HARDER' },
  { id: 'saver', game: 'bag', short: 'SAVER', name: 'STAR SAVER', text: 'HALF THE STAR LOSS WHEN HIT' },
  { id: 'lungs', game: 'rope', short: 'LUNGS', name: 'IRON LUNGS', text: '+2 HEARTS EVERY ROUND' },
  { id: 'wind', game: 'rope', short: '2ND WIND', name: 'SECOND WIND', text: 'PINK DODGES GIVE +2 HEARTS' },
  { id: 'chin', game: 'run', short: 'CHIN', name: 'IRON CHIN', text: 'TAKE 10% LESS DAMAGE' },
  { id: 'grit', game: 'run', short: 'GRIT', name: 'GRIT', text: '+1 GET-UP, +10 CORNER HEAL' },
];
export const PERK = Object.fromEntries(PERKS.map((p) => [p.id, p]));
export const MAX_EQUIPPED = 3;

// What a set of equipped perks does to a fight (all neutral when none).
export function perkMods(ids) {
  const on = (id) => ids.includes(id);
  return {
    counterMult: on('counter') ? 1.5 * 1.15 : 1.5,
    starLoss: on('saver') ? 0.5 : 1,
    hearts: on('lungs') ? 2 : 0,
    dodgeHearts: on('wind') ? 2 : 0,
    damageTaken: on('chin') ? 0.9 : 1,
    getUp: on('grit') ? 1 : 0,
    cornerHeal: on('grit') ? 10 : 0,
  };
}
