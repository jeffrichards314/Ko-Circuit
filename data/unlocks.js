// Unlockables (§16): medal-count thresholds, not a shop. Nothing is spent, so an
// unlock is never lost; the total counts every medal earned (of 168: 56 fighters
// x 3). The last one needs near-complete collection. Saved to localStorage only.
//   short: the name where space is tight (the Extras hub, results)
//   kind: sound (the sound test) | gallery (the fighter gallery) |
//         costume (id: data/costumes.js) | palettes (circuits: whose alternate
//         palettes open, for Practice)
//   track: 'asc' = counted against the Ascension's own medals (of 231: 77 fighters x 3),
//         zone: the Ascension zone it belongs to (its names show as ??? until you've
//         reached that zone). Phase F (spec A2, A14): the base thresholds above never move.
export const UNLOCKS = [
  { at: 8, id: 'sound', kind: 'sound', name: 'SOUND TEST', short: 'SOUND TEST' },
  { at: 16, id: 'gallery', kind: 'gallery', name: 'FIGHTER GALLERY', short: 'GALLERY' },
  { at: 24, id: 'nightgym', kind: 'costume', name: 'COSTUME: NIGHT GYM', short: 'NIGHT GYM LOOK' },
  { at: 36, id: 'alt1', kind: 'palettes', name: 'ALT COLORS: ROOKIE-METRO', short: 'ALT COLORS I', circuits: ['rookie', 'minor', 'metro'] },
  { at: 48, id: 'roadwork', kind: 'costume', name: 'COSTUME: ROAD WORK', short: 'ROAD WORK LOOK' },
  { at: 60, id: 'contender', kind: 'costume', name: 'COSTUME: CONTENDER', short: 'CONTENDER LOOK' },
  { at: 72, id: 'alt2', kind: 'palettes', name: 'ALT COLORS: MAJOR-WORLD', short: 'ALT COLORS II', circuits: ['major', 'carnival', 'continental', 'world'] },
  { at: 84, id: 'bigtop', kind: 'costume', name: 'COSTUME: BIG TOP', short: 'BIG TOP LOOK' },
  { at: 96, id: 'worldbeater', kind: 'costume', name: 'COSTUME: WORLDBEATER', short: 'WORLDBEATER LOOK' },
  { at: 108, id: 'alt3', kind: 'palettes', name: 'ALT COLORS: STORM-UNDERGR.', short: 'ALT COLORS III', circuits: ['storm', 'legends', 'grandprix', 'underground'] },
  { at: 120, id: 'stormchaser', kind: 'costume', name: 'COSTUME: STORM CHASER', short: 'STORM CHASER LOOK' },
  { at: 132, id: 'showdown', kind: 'costume', name: 'COSTUME: SHOWDOWN', short: 'SHOWDOWN LOOK' },
  { at: 144, id: 'alt4', kind: 'palettes', name: 'ALT COLORS: BOSSES, DASH', short: 'ALT COLORS IV', circuits: ['nightmare', 'dream', 'zero', 'rival1', 'rival2', 'rival3', 'rival4'] },
  { at: 156, id: 'voidwalker', kind: 'costume', name: 'COSTUME: VOID WALKER', short: 'VOID WALKER LOOK' },
  { at: 164, id: 'undisputed', kind: 'costume', name: 'COSTUME: UNDISPUTED', short: 'UNDISPUTED LOOK' },
];

// The Ascension's unlocks (Phase F, spec A2): Pantheon costumes (gold and white), Underworld costumes (ash and
// ember), the Void's black-and-white one, and the alternate colours of every Ascension opponent. Counted
// against the Ascension's own 231 medals, on the same curve as the base game's: a first taste at 10%, the last
// unlock (the Void's costume) at 216 of 231, near-complete collection.
export const ASC_UNLOCKS = [
  { at: 24, id: 'ascendant', kind: 'costume', track: 'asc', zone: 'pantheon', name: 'COSTUME: ASCENDANT', short: 'ASCENDANT LOOK' },
  { at: 40, id: 'alt5', kind: 'palettes', track: 'asc', zone: 'pantheon', name: 'ALT COLORS: THE PANTHEON', short: 'ALT COLORS V', circuits: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'halcyon', 'rival5', 'rival6'] },
  { at: 72, id: 'sunborn', kind: 'costume', track: 'asc', zone: 'pantheon', name: 'COSTUME: SUNBORN', short: 'SUNBORN LOOK' },
  { at: 96, id: 'ashen', kind: 'costume', track: 'asc', zone: 'underworld', name: 'COSTUME: ASHEN', short: 'ASHEN LOOK' },
  { at: 120, id: 'alt6', kind: 'palettes', track: 'asc', zone: 'underworld', name: 'ALT COLORS: THE UNDERWORLD', short: 'ALT COLORS VI', circuits: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'vorgath', 'rival7', 'rival8'] },
  { at: 144, id: 'emberforged', kind: 'costume', track: 'asc', zone: 'underworld', name: 'COSTUME: EMBERFORGED', short: 'EMBERFORGED LOOK' },
  { at: 180, id: 'alt7', kind: 'palettes', track: 'asc', zone: 'void', name: 'ALT COLORS: THE VOID AND DASH', short: 'ALT COLORS VII', circuits: ['v1', 'v2', 'v3', 'zeroTrue', 'rival9'] },
  { at: 216, id: 'hollow', kind: 'costume', track: 'asc', zone: 'void', name: 'COSTUME: THE HOLLOW', short: 'THE HOLLOW LOOK' },
];
export const ALL_UNLOCKS = [...UNLOCKS, ...ASC_UNLOCKS];
