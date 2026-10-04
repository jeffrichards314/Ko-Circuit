// INTERIORS (spec §19 G4): every place you can walk into, as data for the one interior engine (src/screens/interior.js).
// An interior is { id, name, sub, theme, stations: [...], scroll?, parent? }. A station stands at `x` along the floor and you stand in front of it:
//   kind 'exit'     the door out (to the world map, or to `parent`)
//   kind 'door'     a door into another interior: { enter: 'td.classic' }
//   kind 'podium'   a fighter's podium: { circuit, index, fighter, run? } (the engine works out whether he is next, beaten or ahead)
//   kind 'prop'     a station that opens something: { prop, label, go: { screen, args } } or { action: 'replay' | 'newDefense' | 'records' }
//   kind 'decor'    something to look at (a plant, a bench): nothing happens
// `lock` dims a station and says how to unlock it: { kind: 'medals' | 'met' | 'unlock' | 'beaten', need, hint }.
// Adding a station or a podium is adding a row here: the engine has a kind for each and needs no new code.
import { CIRCUITS, ASC_PATH, CIRCUIT_ORDER, isRival } from './circuits.js';
import { ARENAS } from './arenas/index.js';
import { TD_LISTS, TD_NAMES } from './fighters/titleDefense.js';
import { DIVISIONS, DIVISION_LOCK, TD_TEXT } from './divisions.js';
import { GAUNTLETS, GAUNTLET_INFO } from '../src/save/records.js';

// ---- themes: a motif (src/world/themes.js) and its colours: w = [wall, light, dark], f = [floor light, floor dark], a = accents, k = an extra
const T = (motif, w, f, a, k) => ({ motif, w, f, a, k });
export const THEMES = {
  home: T('home', [[21, 14, 9], [27, 19, 12], [14, 8, 5]], [[22, 15, 9], [16, 10, 6]], [[24, 7, 8], [8, 14, 24]]),
  rookie: T('brick', [[19, 9, 7], [24, 13, 10], [12, 5, 4]], [[21, 14, 8], [15, 9, 5]], [[29, 22, 4], [20, 14, 2]]),
  minor: T('civic', [[29, 27, 22], [31, 30, 27], [21, 19, 16]], [[16, 12, 9], [11, 8, 6]], [[9, 12, 19], [5, 7, 12]]),
  metro: T('rooftop', [[4, 5, 11], [7, 9, 17], [2, 3, 7]], [[12, 12, 15], [8, 8, 11]], [[31, 28, 12], [20, 10, 24]]),
  major: T('neon', [[8, 8, 16], [13, 13, 24], [4, 4, 9]], [[10, 10, 18], [6, 6, 12]], [[31, 8, 22], [8, 28, 31]]),
  carnival: T('bigtop', [[28, 5, 7], [31, 29, 22], [18, 2, 5]], [[24, 19, 10], [18, 13, 6]], [[31, 25, 6], [8, 22, 28]]),
  continental: T('grand', [[27, 24, 19], [31, 29, 25], [19, 16, 13]], [[27, 25, 21], [20, 18, 15]], [[31, 25, 6], [22, 3, 6]]),
  world: T('stadium', [[6, 7, 12], [12, 13, 19], [3, 4, 7]], [[14, 15, 20], [9, 10, 14]], [[31, 27, 8], [20, 14, 3]]),
  storm: T('storm', [[9, 11, 13], [14, 16, 19], [5, 6, 8]], [[14, 11, 8], [9, 7, 5]], [[20, 24, 31], [10, 12, 22]], [7, 9, 17]),
  legends: T('hof', [[29, 28, 26], [31, 31, 30], [20, 19, 19]], [[24, 23, 22], [17, 16, 17]], [[31, 24, 4], [24, 4, 6]]),
  grandprix: T('colosseum', [[25, 21, 14], [30, 27, 19], [17, 13, 8]], [[22, 18, 11], [16, 12, 7]], [[31, 22, 5], [24, 12, 3]]),
  underground: T('warehouse', [[12, 13, 16], [18, 19, 23], [7, 8, 11]], [[10, 10, 13], [6, 6, 8]], [[28, 26, 10], [20, 18, 8]]),
  dream: T('arena', [[5, 4, 10], [12, 10, 18], [2, 2, 5]], [[15, 14, 17], [9, 9, 11]], [[31, 25, 5], [26, 4, 6]]),
  nightmare: T('nightmare', [[8, 3, 12], [16, 8, 20], [4, 1, 7]], [[12, 6, 16], [7, 3, 10]], [[26, 8, 28], [14, 4, 18]]),
  zero: T('white', [[31, 31, 31], [27, 27, 30], [20, 20, 24]], [[30, 30, 31], [22, 22, 26]], [[20, 20, 24], [12, 12, 16]]),
  // the Pantheon: pillars against a sky that changes with the climb
  p1: T('marble', [[30, 29, 27], [31, 31, 30], [21, 20, 21]], [[29, 27, 25], [22, 20, 20]], [[31, 24, 6], [31, 14, 12]], [27, 15, 15]),
  p2: T('marble', [[30, 30, 31], [31, 31, 31], [21, 23, 28]], [[28, 29, 31], [20, 22, 28]], [[25, 28, 31], [14, 18, 28]], [20, 26, 31]),
  p3: T('marble', [[27, 27, 30], [31, 31, 31], [18, 19, 26]], [[26, 26, 30], [17, 18, 25]], [[31, 26, 8], [14, 16, 26]], [13, 18, 29]),
  p4: T('stars', [[4, 4, 13], [9, 10, 22], [2, 2, 8]], [[10, 10, 20], [5, 5, 12]], [[22, 24, 31], [14, 14, 26]]),
  p5: T('cave', [[8, 7, 10], [13, 12, 16], [4, 4, 6]], [[11, 10, 13], [7, 6, 9]], [[31, 24, 6], [20, 8, 4]], [31, 22, 6]),
  p6: T('marble', [[22, 27, 31], [31, 31, 31], [12, 16, 27]], [[24, 28, 31], [15, 19, 28]], [[31, 31, 31], [14, 20, 30]], [22, 27, 31]),
  p7: T('marble', [[31, 30, 27], [31, 31, 30], [22, 21, 22]], [[31, 29, 25], [23, 21, 21]], [[31, 26, 6], [20, 13, 2]], [26, 28, 31]),
  halcyon: T('white', [[31, 31, 29], [31, 30, 24], [25, 22, 14]], [[31, 29, 22], [26, 22, 12]], [[31, 26, 6], [20, 13, 2]]),
  // the Underworld
  u1: T('cave', [[6, 8, 12], [10, 13, 18], [3, 4, 7]], [[9, 10, 14], [5, 6, 9]], [[14, 20, 28], [8, 12, 20]], [10, 16, 24]),
  u2: T('cave', [[10, 9, 10], [15, 14, 15], [5, 5, 6]], [[12, 11, 12], [7, 6, 7]], [[24, 14, 6], [14, 8, 3]], [26, 14, 4]),
  u3: T('cave', [[7, 6, 9], [12, 11, 15], [3, 3, 5]], [[10, 10, 13], [6, 6, 8]], [[20, 20, 24], [12, 12, 16]]),
  u4: T('cave', [[10, 5, 6], [16, 9, 10], [5, 2, 3]], [[12, 7, 8], [7, 4, 5]], [[26, 10, 8], [16, 5, 4]], [28, 12, 6]),
  u5: T('cave', [[14, 5, 3], [21, 9, 5], [7, 2, 2]], [[15, 8, 5], [9, 4, 3]], [[31, 20, 4], [26, 8, 2]], [31, 22, 6]),
  u6: T('cave', [[4, 3, 7], [8, 6, 12], [2, 1, 4]], [[7, 6, 10], [3, 3, 6]], [[20, 10, 26], [12, 5, 18]], [20, 10, 26]),
  vorgath: T('cave', [[12, 3, 4], [19, 6, 7], [6, 1, 2]], [[13, 5, 6], [8, 2, 3]], [[31, 24, 6], [24, 6, 6]], [31, 14, 4]),
  // the Void
  v1: T('void', [[0, 0, 1], [8, 8, 12], [3, 3, 6]], [[8, 8, 12], [2, 2, 4]], [[31, 31, 31], [18, 18, 22]]),
  v2: T('void', [[0, 0, 1], [9, 9, 13], [3, 3, 6]], [[9, 9, 13], [2, 2, 4]], [[31, 31, 31], [20, 20, 24]]),
  v3: T('void', [[0, 0, 1], [11, 11, 15], [4, 4, 7]], [[10, 10, 14], [2, 2, 4]], [[31, 31, 31], [22, 22, 26]]),
  zeroTrue: T('white', [[31, 31, 31], [29, 29, 31], [22, 22, 26]], [[31, 31, 31], [24, 24, 28]], [[22, 22, 26], [14, 14, 18]]),
  // the rival's gyms
  gym: T('gym', [[7, 9, 13], [12, 14, 19], [4, 5, 8]], [[13, 10, 7], [9, 7, 5]], [[30, 28, 14], [20, 18, 8]]),
  // the modes
  td: T('belthall', [[7, 5, 9], [14, 10, 16], [4, 2, 6]], [[24, 19, 12], [16, 12, 8]], [[31, 25, 5], [26, 4, 6]]),
  // (the belt hall, one room per division: gold and red, white and gold, ash and ember, black and white, all of them)
  'td.pantheon': T('belthall', [[24, 24, 30], [31, 30, 27], [16, 16, 24]], [[30, 29, 26], [22, 21, 19]], [[31, 28, 8], [31, 31, 31]]),
  'td.underworld': T('belthall', [[9, 5, 5], [16, 9, 8], [4, 2, 2]], [[13, 8, 7], [8, 5, 4]], [[29, 12, 4], [31, 22, 6]]),
  'td.void': T('belthall', [[0, 0, 1], [8, 8, 12], [2, 2, 4]], [[8, 8, 12], [2, 2, 4]], [[31, 31, 31], [18, 18, 22]]),
  'td.combined': T('belthall', [[3, 3, 5], [9, 8, 11], [1, 1, 3]], [[14, 12, 10], [8, 7, 6]], [[31, 25, 5], [28, 28, 28]]),
  gauntlet: T('tower', [[8, 7, 10], [13, 12, 16], [4, 4, 6]], [[11, 10, 13], [7, 6, 9]], [[28, 6, 7], [31, 20, 4]]),
};
export const themeOf = (id) => THEMES[id] || (isRival(id) ? THEMES.gym : THEMES.home);

// ---- locks: what a dimmed station says
export const LOCK_TEXT = {
  sound: 'THE JUKEBOX NEEDS 8 MEDALS.', gallery: 'THE GALLERY OPENS AT 16 MEDALS.', practice: 'FIGHT SOMEBODY IN A CIRCUIT FIRST.',
};

// ---- the Home gym: one row of stations along the floor, left to right
const HOME_STATIONS = [
  { id: 'exit', kind: 'exit', x: 26, label: 'OUT TO THE ROAD', prop: 'door' },
  { id: 'bag', kind: 'prop', x: 92, prop: 'speedbag', label: 'SPEED BAG', sub: 'A TIMING DRILL', go: { screen: 'training', args: { free: true, drill: 'bag' } } },
  { id: 'rope', kind: 'prop', x: 152, prop: 'rope', label: 'JUMP ROPE', sub: 'A RHYTHM DRILL', go: { screen: 'training', args: { free: true, drill: 'rope' } } },
  { id: 'run', kind: 'prop', x: 212, prop: 'road', label: 'ROAD RUN', sub: 'A STAMINA DRILL', go: { screen: 'training', args: { free: true, drill: 'run' } } },
  { id: 'perks', kind: 'prop', x: 272, prop: 'clipboard', label: 'PERKS', sub: 'WHAT YOU HAVE EQUIPPED', go: { screen: 'perks' } },
  { id: 'replay', kind: 'prop', x: 326, prop: 'tapes', label: 'FIGHT TAPES', sub: 'REPLAY A CLEARED CIRCUIT', go: { screen: 'replay' }, lock: { kind: 'replay', hint: 'WIN A BELT FIRST, THEN REPLAY IT.' } },
  { id: 'ring', kind: 'prop', x: 378, prop: 'ring', label: 'PRACTICE RING', sub: 'ANYONE YOU HAVE MET', go: { screen: 'practice' }, lock: { kind: 'met', hint: 'FIGHT SOMEBODY IN A CIRCUIT FIRST.' } },
  { id: 'mirror', kind: 'prop', x: 448, prop: 'mirror', label: 'LOCKER AND MIRROR', sub: 'LOOKS AND COSTUMES', go: { screen: 'customize', args: { next: 'map' } } },
  { id: 'index', kind: 'prop', x: 512, prop: 'index', label: 'OPPONENT INDEX', sub: 'SCOUTING REPORTS', go: { screen: 'handbook' } },
  { id: 'gallery', kind: 'prop', x: 572, prop: 'gallery', label: 'GALLERY', sub: 'EVERY FIGHTER, UP CLOSE', go: { screen: 'gallery' }, lock: { kind: 'unlock', id: 'gallery', hint: 'THE GALLERY OPENS AT 16 MEDALS.' } },
  { id: 'trophy', kind: 'prop', x: 634, prop: 'trophy', label: 'TROPHY CASE', sub: 'MEDALS AND RECORD TIMES', go: { screen: 'medals' } },
  { id: 'shop', kind: 'prop', x: 698, prop: 'shop', label: 'MEDAL SHOP', sub: 'WHAT YOUR MEDALS HAVE OPENED', go: { screen: 'unlocks' } },
  { id: 'tv', kind: 'prop', x: 762, prop: 'tv', label: 'TV: THEATER', sub: 'WATCH ANY SCENE AGAIN', go: { screen: 'theater' } },
  { id: 'jukebox', kind: 'prop', x: 822, prop: 'jukebox', label: 'JUKEBOX', sub: 'EVERY SONG AND SOUND', go: { screen: 'soundtest' }, lock: { kind: 'unlock', id: 'sound', hint: 'THE JUKEBOX NEEDS 8 MEDALS.' } },
  { id: 'desk', kind: 'prop', x: 888, prop: 'desk', label: 'DESK', sub: 'SAVE, PASSWORD, OPTIONS, CONTROLS', go: { screen: 'desk' } },
];

// ---- the Title Defense hall: five entrances, one per division (each locked until its zone's last boss is beaten), each with its own records board
// ---- the Gauntlet tower: five doors, the same divisions, each with its board
const hallRow = (kind, x0 = 88, step = 78) => DIVISIONS.flatMap((d, i) => {
  const x = x0 + i * step, td = kind === 'td';
  const door = td
    ? { id: `door.${d}`, kind: 'door', x, prop: 'archdoor', style: `td.${d}`, label: `${TD_NAMES[d]} DEFENSE`, sub: TD_TEXT[d], enter: `td.${d}`, lock: { kind: 'tdTier', tier: d, hint: DIVISION_LOCK[d] } }
    : { id: `gate.${d}`, kind: 'door', x, prop: 'archdoor', style: `g.${d}`, label: GAUNTLET_INFO[d].name, sub: GAUNTLET_INFO[d].text.join(' '), run: d, lock: { kind: 'gauntlet', zone: d, hint: GAUNTLET_INFO[d].lock } };
  const board = { id: `board.${d}`, kind: 'prop', x: x + 38, prop: 'records', label: `${TD_NAMES[d]} RECORDS`, sub: td ? 'BEST DEFENSES, TIMES, MEDALS' : 'BEST STREAK, TIME, WHO ENDED EACH RUN', go: { screen: 'modeRecords', args: { back: 'map', page: `${td ? 'td' : 'g'}.${d}` } } };
  return [door, board];
});
// the secret door at the end of the hall and of the tower (2026-10-04): labeled only ???, with no hint anywhere. It opens for the Gauntlet's ORIGIN when all five Gauntlet
// divisions have been cleared, and for ORIGIN TRUE FORM when ORIGIN has been beaten and all five Title Defense divisions have (records.js originGauntletOpen / originTrueOpen).
const originDoor = (which) => ({ id: 'door.origin', kind: 'door', x: 88 + 5 * 78 + 24, prop: 'archdoor', style: 'origin', label: '???', sub: '', origin: which, lock: { kind: 'origin', which, hint: '' } });
const TD_HALL = {
  id: 'td', name: 'TITLE DEFENSE', sub: 'THE CHAMPIONSHIP HALL', theme: 'td', parent: null, scroll: true,
  stations: [{ id: 'exit', kind: 'exit', x: 26, label: 'OUT TO THE ROAD', prop: 'door' }, ...hallRow('td'), originDoor('t')],
};
const GAUNTLET_HALL = {
  id: 'gauntlet', name: 'THE GAUNTLET', sub: 'ONE LOSS ENDS IT', theme: 'gauntlet', parent: null, scroll: true,
  stations: [{ id: 'exit', kind: 'exit', x: 26, label: 'OUT TO THE ROAD', prop: 'door' }, ...hallRow('g'), originDoor('g')],
};

// ---- a circuit's hall: a door and the podiums in ranking order
export function podiumHall(id, list, opts = {}) {
  // (every hall is a room wider than the screen that the camera follows you through, 2026-10-03: the podiums stand at least HALL_STEP apart so the
  // one you stand at has room to grow, and the room goes on past the last one so the biggest fighter is never cut by its edge. A hall of one
  // podium is the screen's width: its camera never moves.)
  const n = list.length, x0 = opts.x0 || 96, step = n > 6 ? 46 : n > 1 ? HALL_STEP : 0;
  const stations = [{ id: 'exit', kind: 'exit', x: 26, label: 'OUT TO THE ROAD', prop: 'door' }, ...(opts.before || [])];
  list.forEach((fighter, index) => stations.push({ id: `pod${index}`, kind: 'podium', x: n === 1 ? 80 : Math.round(x0 + index * step), circuit: opts.circuit || id, index, fighter, run: opts.run || null }));
  const last = stations[stations.length - 1].x;
  return { id: opts.key || id, name: opts.name, sub: opts.sub, theme: opts.theme || id, scroll: true, end: Math.max(last + HALL_MARGIN, 236), champ: n > 1 || opts.boss, stations, extra: opts.extra || [], parent: opts.parent || null };
}
export const HALL_STEP = 64, HALL_MARGIN = 80;

// every interior by id (the circuit halls are built from data/circuits.js)
export function interiorFor(id) {
  if (id === 'home') return { id: 'home', name: 'HOME GYM', sub: 'TRAIN, PRACTICE, SAVE', theme: 'home', scroll: true, stations: HOME_STATIONS, end: 0, parent: null };
  if (id === 'td') return { ...TD_HALL, end: 0 };
  if (id === 'gauntlet') return { ...GAUNTLET_HALL, end: 0 };
  if (id.startsWith('td.')) {
    const tier = id.slice(3), list = TD_LISTS[tier];
    const h = podiumHall(id, list, { circuit: null, run: 'td', x0: 118, before: [{ id: 'defense', kind: 'prop', x: 68, prop: 'plaque', action: 'defense', label: 'THE DEFENSE', sub: 'START OVER OR GIVE UP' }], name: `${TD_NAMES[tier]} DEFENSE`, sub: 'THE REMIXED CHAMPIONS', theme: tier === 'classic' ? 'td' : `td.${tier}`, parent: 'td', boss: true, key: id });
    h.tier = tier;
    return h;
  }
  const C = CIRCUITS[id];
  if (!C) throw new Error(`no interior ${id}`);
  const a = ARENAS[C.arena];
  return podiumHall(id, C.fighters, { name: C.asc && !isRival(id) ? C.name.split(': ')[0] : C.name, sub: C.asc && !isRival(id) ? (C.name.split(': ')[1] || '') : a ? a.name : '', theme: id.startsWith('rival') ? (C.asc ? (C.zone === 'pantheon' ? 'p4' : C.zone === 'void' ? 'v3' : 'u3') : 'gym') : id, boss: !!C.boss || C.fighters.length === 1 });
}
export const INTERIOR_IDS = ['home', 'td', 'gauntlet', ...DIVISIONS.map((t) => `td.${t}`), ...CIRCUIT_ORDER, ...ASC_PATH, 'rival1', 'rival2', 'rival3', 'rival4', 'rival5', 'rival6', 'rival7', 'rival8', 'rival9'];
