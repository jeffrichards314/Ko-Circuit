// Circuit difficulty table (spec §9). All tuning lives here.
//   tellWindow        target windup length for the circuit's moves (frames)
//   hearts            player hearts at the start of each round
//   heartsLostOnBlock hearts lost when the opponent blocks your punch
//   heartsLostOnHit   hearts lost when you get hit
//   heartsOnDodge     hearts restored by a successful dodge while pink
//   randomness        how the AI picks patterns (fixed | light | wheel | weighted |
//                     weightedFakes | shuffled | adaptive | boss, see OpponentAI.pickPattern)
//   fakes             chance a real move is thrown as a fake (World and up: "plus fakes")
//   starsPerRound     most stars you can earn in one round (Continental and up)
//   mash              player get-up: press power, meter decay/frame, extra decay per knockdown
//   countFrames       frames per referee count
//   guardCounter      punches into his guard (within 1.5 s) before he fires a guard counter
//                     (his quickest real punch, or the fighter's `guardCounter` move)
//   fighters          the ranking ladder, bottom (#3) to champion; the order you fight them
//   belt              the title won by beating the champion

import { TELLS } from './difficulty.js';

const base = {
  heartsLostOnHit: 3,
  heartsOnDodge: 4,
  countFrames: 56,
  guardCounter: 2,
};

export const CIRCUITS = {
  rookie: {
    ...base, id: 'rookie', name: 'ROOKIE CIRCUIT', arena: 'rookie',
    tellWindow: 30, hearts: 20, heartsLostOnBlock: 1, randomness: 'fixed', guardCounter: 3,
    mash: { power: 9, decay: 0.3, perKnockdown: 0.4 },
    fighters: ['barney', 'kid', 'mort', 'gus'],
    belt: 'ROOKIE CIRCUIT CHAMPION',
  },
  minor: {
    ...base, id: 'minor', name: 'MINOR CIRCUIT', arena: 'minor',
    tellWindow: 26, hearts: 20, heartsLostOnBlock: 1, randomness: 'fixed', guardCounter: 3,
    mash: { power: 8.5, decay: 0.34, perKnockdown: 0.45 },
    fighters: ['rocco', 'gambini', 'knox', 'brody'],
    belt: 'MINOR CIRCUIT CHAMPION',
  },
  metro: {
    ...base, id: 'metro', name: 'METRO CIRCUIT', arena: 'metro',
    tellWindow: 22, hearts: 18, heartsLostOnBlock: 1, randomness: 'light',
    mash: { power: 8, decay: 0.38, perKnockdown: 0.5 },
    fighters: ['ray', 'pidge', 'sam', 'mcbride'],
    belt: 'METRO CIRCUIT CHAMPION',
  },
  major: {
    ...base, id: 'major', name: 'MAJOR CIRCUIT', arena: 'major',
    tellWindow: 20, hearts: 18, heartsLostOnBlock: 2, randomness: 'light',
    mash: { power: 7.5, decay: 0.42, perKnockdown: 0.55 },
    fighters: ['djdrop', 'anchor', 'gemini', 'midnight'],
    belt: 'MAJOR CIRCUIT CHAMPION',
  },
  carnival: {
    ...base, id: 'carnival', name: 'CARNIVAL CIRCUIT', arena: 'carnival',
    tellWindow: 14, hearts: 16, heartsLostOnBlock: 2, randomness: 'wheel', starsPerRound: 3,
    mash: { power: 7, decay: 0.48, perKnockdown: 0.6 },
    fighters: ['strongman', 'pockets', 'tess', 'jinx', 'rex'],
    belt: 'CARNIVAL CIRCUIT CHAMPION',
  },
  continental: {
    ...base, id: 'continental', name: 'CONTINENTAL CIRCUIT', arena: 'continental',
    tellWindow: 16, hearts: 16, heartsLostOnBlock: 2, randomness: 'weighted', starsPerRound: 3,
    mash: { power: 7, decay: 0.48, perKnockdown: 0.6 },
    fighters: ['rusty', 'tia', 'sutures', 'baron'],
    belt: 'CONTINENTAL CIRCUIT CHAMPION',
  },
  world: {
    ...base, id: 'world', name: 'WORLD CIRCUIT', arena: 'world',
    tellWindow: 12, hearts: 15, heartsLostOnBlock: 2, randomness: 'weightedFakes', fakes: 0.12, starsPerRound: 2,
    mash: { power: 6.5, decay: 0.55, perKnockdown: 0.7 },
    fighters: ['lars', 'hank', 'glacier', 'maestro'],
    belt: 'WORLD CIRCUIT CHAMPION',
  },
  storm: {
    ...base, id: 'storm', name: 'STORM CIRCUIT', arena: 'storm',
    tellWindow: 10, hearts: 14, heartsLostOnBlock: 3, randomness: 'weightedFakes', fakes: 0.18, starsPerRound: 2,
    mash: { power: 6, decay: 0.6, perKnockdown: 0.8 },
    fighters: ['bolt', 'downpour', 'cole', 'avalanche'],
    belt: 'STORM CIRCUIT CHAMPION',
  },
  legends: {
    ...base, id: 'legends', name: 'LEGENDS CIRCUIT', arena: 'legends',
    tellWindow: 8, hearts: 13, heartsLostOnBlock: 3, randomness: 'shuffled', starsPerRound: 2,
    mash: { power: 6, decay: 0.7, perKnockdown: 1.6 },
    fighters: ['rourke', 'ignatius', 'duchess', 'mirror'],
    belt: 'LEGENDS CIRCUIT CHAMPION',
  },
  grandprix: {
    ...base, id: 'grandprix', name: 'GRAND PRIX', arena: 'grandprix',
    tellWindow: 6, hearts: 12, heartsLostOnBlock: 3, randomness: 'adaptive', starsPerRound: 2,
    mash: { power: 5.5, decay: 0.75, perKnockdown: 1.8 },
    fighters: ['nova', 'goliath', 'quinn', 'monk', 'karver'],
    belt: 'GRAND PRIX CHAMPION',
  },
  underground: {
    ...base, id: 'underground', name: 'UNDERGROUND', arena: 'underground',
    tellWindow: 6, hearts: 12, heartsLostOnBlock: 3, randomness: 'adaptive', starsPerRound: 2,
    mash: { power: 5.5, decay: 0.75, perKnockdown: 1.8 },
    fighters: ['static', 'cade', 'null', 'warden'],
    belt: 'UNDERGROUND CHAMPION',
  },
  dream: {
    ...base, id: 'dream', name: 'DREAM FIGHT', arena: 'dream',
    tellWindow: 6, hearts: 12, heartsLostOnBlock: 3, randomness: 'boss', starsPerRound: 1,
    mash: { power: 5.5, decay: 0.8, perKnockdown: 2 },
    fighters: ['jax'],
    belt: 'UNDISPUTED CHAMPION OF THE WORLD',
  },
  nightmare: {
    ...base, id: 'nightmare', name: 'NIGHTMARE CIRCUIT', arena: 'nightmare',
    tellWindow: 4, hearts: 10, heartsLostOnBlock: 3, randomness: 'adaptive', starsPerRound: 1,
    mash: { power: 5, decay: 0.85, perKnockdown: 2 },
    fighters: ['hollow', 'revenant', 'frenzy', 'eclipse'],
    belt: 'NIGHTMARE CHAMPION',
  },
  // "All of the above" (§9): shuffled and adaptive. No circuit fakes: with 4-frame
  // tells the only way to read him is his rhythm, and a fake would break it.
  zero: {
    ...base, id: 'zero', name: 'ZERO', arena: 'zero',
    tellWindow: 4, hearts: 10, heartsLostOnBlock: 3, randomness: 'all', starsPerRound: 1,
    mash: { power: 5, decay: 0.9, perKnockdown: 2.2 },
    fighters: ['zero'],
    belt: 'THE LAST CHAMPION',
  },
};


// Career order (§5). Secret circuits hang off the main path on the map.
// The rival's four fights (§11b): one-fighter "circuits" that copy the §9 row of
// the circuit whose title he shows up after (tells, hearts, drain, randomness,
// get-up mash), fought in the Night Gym. Not on the main path or in the roster.
export const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
const rivalRow = (id, from, n, extra = {}) => ({
  ...CIRCUITS[from], id, name: `RIVAL: DASH MADDOX ${ROMAN[n]}`,
  arena: `nightgym${n}`, fighters: [`dash${n}`], belt: null, rival: n, after: from, ...extra,
});
Object.assign(CIRCUITS, {
  rival1: rivalRow('rival1', 'minor', 1),
  rival2: rivalRow('rival2', 'major', 2),
  rival3: rivalRow('rival3', 'world', 3),
  rival4: rivalRow('rival4', 'grandprix', 4, { name: 'RIVAL: THE SHOWDOWN' }),
});
// rival circuit by the title it follows, and back
export const RIVAL_AFTER = { minor: 'rival1', major: 'rival2', world: 'rival3', grandprix: 'rival4' };
export const RIVALS = ['rival1', 'rival2', 'rival3', 'rival4'];

// ---------------------------------------------------------------------------
// The Ascension (spec §18): Pantheon, Underworld, the Void. Difficulty rows are
// A3's table: tells never go below 3f, so the curve comes from other levers.
// Pantheon (Phase A: P1-P3; Phase B: P4-P7 and Halcyon).
//   zone       'pantheon' | 'underworld' | 'void' (the Ascension's own path)
//   asc        true: an Ascension circuit (not on the main path, not secret)
// Ascension circuits are entered from their zone's map once the way is open, one
// after another (ASC_PATH), with the usual 3 lives and belt.
const ASC_BASE = {
  ...base, hearts: 12, heartsLostOnBlock: 3, randomness: 'adaptive', starsPerRound: 2, guardCounter: 2, asc: true, zone: 'pantheon',
  mash: { power: 5.5, decay: 0.8, perKnockdown: 1.9 },
};
Object.assign(CIRCUITS, {
  p1: { ...ASC_BASE, id: 'p1', name: 'PANTHEON I: GATE OF DAWN', arena: 'pantheon1', tellWindow: 6, fighters: ['oro', 'lark', 'ember', 'aurora'], belt: 'GATE OF DAWN CHAMPION' },
  p2: { ...ASC_BASE, id: 'p2', name: 'PANTHEON II: CLOUD TERRACE', arena: 'pantheon2', tellWindow: 6, fighters: ['zephyr', 'nimbus', 'ulla', 'cirrus'], belt: 'CLOUD TERRACE CHAMPION',
    mash: { power: 5.5, decay: 0.82, perKnockdown: 1.9 } },
  p3: { ...ASC_BASE, id: 'p3', name: 'PANTHEON III: HALL OF HEROES', arena: 'pantheon3', tellWindow: 5, fighters: ['tom', 'jules', 'reuben', 'simone', 'oldguard'], belt: 'HALL OF HEROES CHAMPION',
    mash: { power: 5.5, decay: 0.84, perKnockdown: 2 } },
  // Phase B: P4-P7 and the boss above them
  p4: { ...ASC_BASE, id: 'p4', name: 'PANTHEON IV: STARFIELD', arena: 'pantheon4', tellWindow: 5, fighters: ['polaris', 'kira', 'orbit', 'nebula'], belt: 'STARFIELD CHAMPION',
    mash: { power: 5.5, decay: 0.85, perKnockdown: 2 } },
  p5: { ...ASC_BASE, id: 'p5', name: 'PANTHEON V: THUNDER FORGE', arena: 'pantheon5', tellWindow: 4, fighters: ['anvil', 'spark', 'bellows', 'hale'], belt: 'THUNDER FORGE CHAMPION',
    mash: { power: 5.5, decay: 0.86, perKnockdown: 2 } },
  p6: { ...ASC_BASE, id: 'p6', name: 'PANTHEON VI: MIRROR SANCTUM', arena: 'pantheon6', tellWindow: 4, fighters: ['reflection', 'glass', 'doubt', 'prism'], belt: 'MIRROR SANCTUM CHAMPION',
    mash: { power: 5.5, decay: 0.87, perKnockdown: 2 } },
  // the Summit's ladder ends with the janitor: Rho is its champion, Barney Ascended the gatekeeper after him
  p7: { ...ASC_BASE, id: 'p7', name: 'PANTHEON VII: THE SUMMIT', arena: 'pantheon7', tellWindow: 4, fighters: ['aldric', 'valkyr', 'scribe', 'verity', 'rho', 'barney2'], belt: 'SUMMIT CHAMPION',
    mash: { power: 5.5, decay: 0.88, perKnockdown: 2 } },
  // the boss: three forms, one per round; he heals fully between them (fightState `forms`)
  halcyon: { ...ASC_BASE, id: 'halcyon', name: 'HALCYON', arena: 'halcyon', tellWindow: 4, fighters: ['halcyon'], belt: 'THE UNDEFEATED', boss: true, forms: 3,
    starsPerRound: 1, mash: { power: 5.5, decay: 0.9, perKnockdown: 2.1 } },
});
// The Underworld (Phase C: U1-U3; spec A3): the trainer is gone (the Ferryman is your cornerman, weaker
// tips), ONE life (losing it sends you back to the start of the circuit), 10 hearts, 4-frame tells
// (heavies 6f), and only `cornerHeal` health comes back between rounds (the corner's mash cap: the base game's
// is 30; the Underworld's was the same 30, which didn't bite, and is 15 since the 2026-10-01 rebalance).
const UW_BASE = { ...ASC_BASE, zone: 'underworld', hearts: 10, lives: 2, cornerHeal: 15 };
Object.assign(CIRCUITS, {
  u1: { ...UW_BASE, id: 'u1', name: 'UNDERWORLD I: FERRYMAN\'S SHORE', arena: 'underworld1', tellWindow: 4, fighters: ['grue', 'mae', 'toll', 'moros'], belt: 'FERRYMAN\'S SHORE CHAMPION',
    mash: { power: 5.5, decay: 0.89, perKnockdown: 2 } },
  u2: { ...UW_BASE, id: 'u2', name: 'UNDERWORLD II: ASHEN FIELDS', arena: 'underworld2', tellWindow: 4, fighters: ['cinder', 'scorch', 'kiln', 'soot'], belt: 'ASHEN FIELDS CHAMPION',
    mash: { power: 5.5, decay: 0.9, perKnockdown: 2.05 } },
  u3: { ...UW_BASE, id: 'u3', name: 'UNDERWORLD III: CHAIN PITS', arena: 'underworld3', tellWindow: 4, fighters: ['shackle', 'link', 'brisk', 'rattle', 'jailer'], belt: 'CHAIN PITS CHAMPION',
    mash: { power: 5.5, decay: 0.9, perKnockdown: 2.1 } },
});
// The lower Underworld (Phase D: U4-U6 and Vorgath; spec A3): 3-frame tells (heavies and giants a few more),
// the same one life and 10 hearts, and star theft and darkness on top. Only `cornerHeal` health comes back between rounds.
Object.assign(CIRCUITS, {
  u4: { ...UW_BASE, id: 'u4', name: 'UNDERWORLD IV: HALL OF THE FALLEN', arena: 'underworld4', tellWindow: 3, fighters: ['fbrody', 'fmidnight', 'fvale', 'fkarver'], belt: 'HALL OF THE FALLEN CHAMPION',
    mash: { power: 5.5, decay: 0.91, perKnockdown: 2.1 } },
  // the Furnace's own lever: a HEAT meter (asc/abyss.js `furnace`) climbs all round and drains your hearts when it's high; every slip, duck and
  // counter cools it, and Stoker's shovel and Crucible's overheat play on it
  u5: { ...UW_BASE, id: 'u5', name: 'UNDERWORLD V: THE FURNACE', arena: 'underworld5', tellWindow: 3, fighters: ['stoker', 'brand', 'slag', 'crucible'], belt: 'FURNACE CHAMPION',
    mash: { power: 5.5, decay: 0.92, perKnockdown: 2.1 },
    special: [{ type: 'furnace', start: 0.12, rate: 1 / 2600, from: 0.3, slow: 300, fast: 120, cool: 0.05, counter: 0.08 }] },
  u6: { ...UW_BASE, id: 'u6', name: 'UNDERWORLD VI: ABYSS GATE', arena: 'underworld6', tellWindow: 3, fighters: ['nox', 'umbra', 'lament', 'grasp', 'herald'], belt: 'ABYSS GATE CHAMPION',
    mash: { power: 5.5, decay: 0.93, perKnockdown: 2.15 } },
  // the boss: three phases, one per round, each at full health (fightState `forms`); a piece of the floor goes with every one
  vorgath: { ...UW_BASE, id: 'vorgath', name: 'VORGATH', arena: 'vorgath', tellWindow: 3, fighters: ['vorgath'], belt: 'KING BELOW', boss: true, forms: 3,
    starsPerRound: 2, mash: { power: 5.5, decay: 0.94, perKnockdown: 2.2 } },
});
// The Void (Phase E; spec A3 and A6): ZERO's shards. 3-frame tells everywhere, 8 hearts, no spare life (a loss sends you back to the start of
// the circuit: `lives: 1` is what the Underworld's "one life" already is) and 20% of your
// health back between rounds (`cornerHeal`; the Will Shard gives none). White-on-black arenas that break apart more with each circuit.
// Fighter numbers #108-119 are the twelve Hollowed; the Void's bosses (ZERO's true form) are unnumbered like the other bosses.
const VOID_BASE = { ...ASC_BASE, zone: 'void', hearts: 8, lives: 1, cornerHeal: 20, starsPerRound: 1, tellWindow: 3 };
Object.assign(CIRCUITS, {
  v1: { ...VOID_BASE, id: 'v1', name: 'THE VOID I: THE FUNDAMENTALS', arena: 'void1', fighters: ['dodgeShard', 'blockShard', 'duckShard', 'counterShard'], belt: 'THE FUNDAMENTALS',
    mash: { power: 5.5, decay: 0.94, perKnockdown: 2.2 } },
  v2: { ...VOID_BASE, id: 'v2', name: 'THE VOID II: THE SENSES', arena: 'void2', fighters: ['sightShard', 'soundShard', 'rhythmShard', 'memoryShard'], belt: 'THE SENSES',
    mash: { power: 5.5, decay: 0.95, perKnockdown: 2.25 } },
  v3: { ...VOID_BASE, id: 'v3', name: 'THE VOID III: THE MIND', arena: 'void3', fighters: ['echoShard', 'chaosShard', 'timeShard', 'willShard'], belt: 'THE MIND',
    mash: { power: 5.5, decay: 0.95, perKnockdown: 2.3 } },
  // the true final boss: four phases, one per round, each at full health (`forms`, `rounds`); KO only, so a knockout of the last phase is the fight
  zeroTrue: { ...VOID_BASE, id: 'zeroTrue', name: 'ZERO', arena: 'zeroTrue', fighters: ['zeroTrue'], belt: 'THE UNDEFEATED... UNDONE', boss: true, forms: 4,
    mash: { power: 5.5, decay: 0.96, perKnockdown: 2.4 } },
});
// ORIGIN (2026-10-04, the secret final boss): two circuits that are in no list. They are defined NON-ENUMERABLE so that nothing that walks the circuits
// (the world map, the records, Practice, the gallery, the scouting books, the audits of the base game) can find them: only a lookup by id does, which is how
// his fights find their rules. `hidden` marks them for anything that reads one by id. ORIGIN is the Gauntlet's boss, ORIGIN TRUE FORM the Title Defense's.
for (const [id, name, tell, mash] of [['origin', 'ORIGIN', 4, { power: 5.5, decay: 0.97, perKnockdown: 2.5 }], ['originTrue', 'ORIGIN: TRUE FORM', 3, { power: 5.5, decay: 0.98, perKnockdown: 2.6 }]]) {
  Object.defineProperty(CIRCUITS, id, { enumerable: false, configurable: true, writable: true,
    value: { ...VOID_BASE, id, name, arena: id, tellWindow: tell, fighters: [id], belt: 'THE ORIGIN BELT', boss: true, forms: id === 'origin' ? 4 : 6, hidden: true, mash } });
}
// The Ascension path, in the order a career walks it (spec A1). Only the ones with
// an entry in CIRCUITS exist in the build; the password reserves them all (password.js).
export const ASC_PATH = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'halcyon', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'vorgath', 'v1', 'v2', 'v3', 'zeroTrue'];
export const PANTHEON = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7']; // the seven landings (Halcyon waits above them: HALCYON)
export const UNDERWORLD = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6']; // the six landings of the descent (the throne of Vorgath waits under them: VORGATH_ID)
export const VORGATH_ID = 'vorgath';
export const VOID = ['v1', 'v2', 'v3']; // the three fragments of the Void (ZERO's true form waits beyond them: ZERO_TRUE_ID)
export const ZERO_TRUE_ID = 'zeroTrue';
// Permanent progress in the Void: a freed Hollowed stays freed (career.freed) whatever happens after. A loss still sends you back to the
// start of the circuit (spec A3); flip this to have the retry skip the ones you have already freed.
export const VOID_SKIP_FREED = false;
// the twelve Hollowed in the order they are freed (the freed mask, career.freed, is over this list)
export const HOLLOWED = VOID.flatMap((id) => CIRCUITS[id].fighters);
// Lives per circuit: 2, and 1 in the Underworld (spec A3)
export const livesOf = (id) => (CIRCUITS[id] && CIRCUITS[id].lives) || 3; // (3 in most circuits, 2 in the Underworld; a win in the ladder gives one back)
// The map screen an Ascension circuit belongs to: 'pantheon' or 'underworld'
export const zoneOf = (id) => (CIRCUITS[id] && CIRCUITS[id].zone) || null;
export const isAsc = (id) => !!(CIRCUITS[id] && CIRCUITS[id].asc);
export const ascIndex = (id) => ASC_PATH.indexOf(id);

// Dash's Ascension encounters (spec A5): one-fighter "circuits" like the first four, fought
// in the arena of the circuit he follows. Phase A: #5 (after Pantheon III).
Object.assign(CIRCUITS, {
  rival5: rivalRow('rival5', 'p3', 5, { name: 'RIVAL: DASH ASCENDANT', arena: 'pantheon3d', asc: true, zone: 'pantheon' }),
  rival6: rivalRow('rival6', 'p6', 6, { name: 'RIVAL: DASH DESPERATE', arena: 'pantheon6d', asc: true, zone: 'pantheon' }),
  // Phase C: Dash in Chains, after the Chain Pits (the Underworld's rules: one life, 10 hearts)
  rival7: rivalRow('rival7', 'u3', 7, { name: 'RIVAL: DASH IN CHAINS', arena: 'underworld3d', asc: true, zone: 'underworld' }),
  // Phase D: Dash, the King's Champion, at the Abyss Gate before Vorgath (the deep Underworld's rules: 3-frame tells)
  rival8: rivalRow('rival8', 'u6', 8, { name: 'RIVAL: DASH, KING\'S CHAMPION', arena: 'underworld6d', asc: true, zone: 'underworld' }),
});
// Phase E: Dash Unbound, after the Void's last fragment and before ZERO's true form (the floating amateur gym)
Object.assign(CIRCUITS, {
  rival9: rivalRow('rival9', 'v3', 9, { name: 'RIVAL: DASH UNBOUND', arena: 'dashUnbound', asc: true, zone: 'void' }),
});
RIVAL_AFTER.p3 = 'rival5';
RIVAL_AFTER.p6 = 'rival6';
RIVAL_AFTER.u3 = 'rival7';
RIVAL_AFTER.u6 = 'rival8';
RIVAL_AFTER.v3 = 'rival9';
export const ASC_RIVALS = ['rival5', 'rival6', 'rival7', 'rival8', 'rival9'];
// every rival circuit: the bitmask of fights won (career.rival) is over this list
export const ALL_RIVALS = [...RIVALS, ...ASC_RIVALS];
export const isRival = (id) => ALL_RIVALS.includes(id);

export const MAIN_PATH = ['rookie', 'minor', 'metro', 'major', 'continental', 'world', 'storm', 'legends', 'grandprix', 'dream'];
export const SECRET = { carnival: 'major', underground: 'legends', nightmare: 'dream', zero: 'nightmare' };
// The base game's circuits in a fixed order (the legacy password encoding: never reorder, only append).
export const CIRCUIT_ORDER = ['rookie', 'minor', 'metro', 'major', 'carnival', 'continental', 'world', 'storm', 'legends', 'grandprix', 'underground', 'dream', 'nightmare', 'zero'];
// ...and with the Ascension after them: the order fighters are numbered in (#51+) and the
// difficulty order (records, the balance audit).
export const ALL_ORDER = [...CIRCUIT_ORDER, ...ASC_PATH];
export const SHORT = {
  rookie: 'ROOKIE', minor: 'MINOR', metro: 'METRO', major: 'MAJOR', carnival: 'CARNIVAL', continental: 'CONTINENTAL',
  world: 'WORLD', storm: 'STORM', legends: 'LEGENDS', grandprix: 'GRAND PRIX', underground: 'UNDERGROUND',
  dream: 'DREAM FIGHT', nightmare: 'NIGHTMARE', zero: 'ZERO',
  rival1: 'RIVAL I', rival2: 'RIVAL II', rival3: 'RIVAL III', rival4: 'SHOWDOWN',
  p1: 'PANTHEON I', p2: 'PANTHEON II', p3: 'PANTHEON III', p4: 'PANTHEON IV', p5: 'PANTHEON V', p6: 'PANTHEON VI', p7: 'PANTHEON VII', halcyon: 'HALCYON',
  rival5: 'RIVAL V', rival6: 'RIVAL VI', rival7: 'RIVAL VII', rival8: 'RIVAL VIII',
  u1: 'UNDERWORLD I', u2: 'UNDERWORLD II', u3: 'UNDERWORLD III', u4: 'UNDERWORLD IV', u5: 'UNDERWORLD V', u6: 'UNDERWORLD VI', vorgath: 'VORGATH',
  v1: 'THE VOID I', v2: 'THE VOID II', v3: 'THE VOID III', zeroTrue: 'ZERO', rival9: 'RIVAL IX', origin: 'ORIGIN', originTrue: 'ORIGIN TRUE FORM',
};

// Tell windows (the §9 / A3 row each screen prints) come from the difficulty curve (data/difficulty.js TELLS); each
// fighter's own tell steps from the circuit's first fighter to its champion around it.
for (const C of Object.values(CIRCUITS)) if (TELLS[C.id]) C.tellWindow = TELLS[C.id].nominal;
