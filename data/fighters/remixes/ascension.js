// Title Defense, Ascension tier and the Combined defense's first ZERO (spec §6, K4): the remix blocks of the Ascension's champions and bosses.
// Each is a `titleDefense` block (see data/fighters/titleDefense.js): a new nickname and quote, faster tells, a new move, (for the ones
// whose patterns are free to extend) a new pattern, trainer tips for what is new, and a knowledge layer of his own: new exploits, new
// anti-strategies, new scripted moments, none of them the original fight's (tools/remix-audit.mjs proves it).
// A remix's new moves keep no perfect hit of their own: the golden chance stays on the super. Fighters whose pattern sets belong to a
// modifier (Old Guard's eras, Halcyon's forms, Vorgath's phases, ZERO's segments, the homages of Rho and the Herald) meet their new move
// through their scripted moments and answers instead of a new pattern.
import { mv, steps } from '../pantheon/_kit.js';
import { X, A, S } from './kit.js';

const sweep = (W, name, o = {}) => mv('sweep', W, { name, ...o });

export default {
  // ---------------------------------------------------------------- the Pantheon's champions
  // -- #54 Aurora Vess: the long day
  aurora: {
    nickname: 'THE LONG DAY', quote: 'THE SUN IS ALREADY UP. IT JUST HASN\'T SET FOR YOU YET.', lines: { win: 'THE DAY IS LONG. YOU ARE NOT.', lose: 'THE LIGHT... GOES OUT...' },
    tell: 0.85,
    moves: { duskSweep: sweep(7, 'DUSK SWEEP', { sfx: { tell: 'whoosh' } }) },
    patterns: [{ id: 'longDay', weight: 3, steps: steps('i40 glowJab i16 glowHook i30 duskSweep i34 glowUpper i40') }],
    exploits: [
      X.counter('noonBlindness', 'NOON BLINDNESS', 'glowUpper', { early: 3, hits: 6, star: true, hint: ['visual', 'HER FIST GOES WHITE-HOT BEFORE THE RISING SUN.'] }),
      X.slip('sunBelowTheHorizon', 'THE SUN BELOW THE HORIZON', 'duskSweep', { result: 'ducked', hits: 5, star: 26, hint: ['audio', 'THE DUSK SWEEP COMES WITH A LOW, LONG WHOOSH.'] }),
      X.passive('facesTheSun', 'FACES THE SUN', { seconds: 6, hits: 4, say: 'SHE FACES THE SUN!', hint: ['quote', 'EVERY DAY I RISE.'] }),
    ],
    antiStrategies: [
      A.turtling('blindingLight', 'BLINDING LIGHT', { moves: ['glowJab'], cue: 'NO BLOCK!', say: 'BLINDING LIGHT!' }),
      A.comboRepeat('lightRepeats', 'THE LIGHT REPEATS', { counter: 'glowHook', delay: 14, say: 'THE LIGHT REPEATS!' }),
    ],
    scriptedMoments: [
      S.clock('daybreak', 'DAYBREAK', 100, [{ idle: 34 }, { move: 'glowJab' }, { idle: 12 }, { move: 'glowHook' }, { idle: 12 }, { move: 'duskSweep' }, { idle: 30 }]),
      S.health('theGoldenHour', 'THE GOLDEN HOUR', 0.4, [{ idle: 34 }, { move: 'glowUpper' }, { idle: 16 }, { move: 'duskSweep' }, { idle: 16 }, { move: 'dawnBody' }, { idle: 30 }]),
    ],
  },

  // -- #58 Cirrus Crown: the long winter
  cirrus: {
    nickname: 'THE DEEP WINTER', quote: 'THE STORM NEVER LEFT. IT ONLY WAITED FOR YOU.', lines: { win: 'THE WEATHER TURNS. YOU DON\'T.', lose: 'THE SKY... CLEARS...' },
    tell: 0.85,
    moves: { crosswind: sweep(7, 'CROSSWIND') },
    patterns: [{ id: 'sideways', weight: 3, steps: steps('i36 jab i14 hook i28 crosswind i30 body i16 upper i40') }],
    exploits: [
      X.counter('cloudBurst', 'CLOUD BURST', 'hook', { early: 3, hits: 6, hint: ['audio', 'THUNDER GRUMBLES JUST BEFORE THE SQUALL HOOK.'] }),
      X.slip('blownOffCourse', 'BLOWN OFF COURSE', 'crosswind', { result: 'ducked', hits: 5, star: 26, hint: ['visual', 'HIS CROWN BLOWS SIDEWAYS BEFORE THE CROSSWIND.'] }),
      X.getUp('downdraft', 'DOWNDRAFT', { hits: 5, star: 24, hint: ['quote', 'EVERYTHING THAT RISES COMES DOWN.'] }),
    ],
    antiStrategies: [
      A.jabSpam('rainOnYou', 'RAIN ON YOUR PARADE', { streak: 4, counter: 'body', say: 'RAINED OUT!' }),
      A.dodgeBias('windShift', 'THE WIND SHIFTS', { moves: ['jab'], min: 6, share: 0.75, say: 'THE WIND SHIFTS!' }),
    ],
    scriptedMoments: [
      S.clock('coldFront', 'COLD FRONT', 75, [{ idle: 34 }, { move: 'jab' }, { idle: 10 }, { move: 'hook' }, { idle: 12 }, { move: 'crosswind' }, { idle: 28 }]),
      S.health('strikesTwice', 'LIGHTNING STRIKES TWICE', 0.4, [{ idle: 34 }, { move: 'upper' }, { idle: 14 }, { move: 'crosswind' }, { idle: 14 }, { move: 'body' }, { idle: 30 }]),
    ],
  },

  // -- #66 The Old Guard: the old routine
  oldguard: {
    nickname: 'THE OLD ROUTINE', quote: 'I HAVE FOUGHT YOUR GRANDFATHER. I REMEMBER HIS WEAKNESS.', lines: { win: 'SAME AS ALWAYS, KID.', lose: 'AFTER ALL THESE YEARS... SOMEONE FINALLY...' },
    tell: 0.85,
    moves: { caneSweep: sweep(6, 'CANE SWEEP') },
    exploits: [
      X.counter('caneSnaps', 'THE CANE SNAPS', 'poke', { early: 4, hits: 6, star: true, hint: ['audio', 'THE CANE CLICKS ONCE ON THE CANVAS BEFORE THE POKE.'] }),
      X.slip('oldKnees', 'OLD KNEES', 'caneSweep', { result: 'ducked', hits: 5, star: 26, hint: ['trainer', 'THE CANE SWEEP COSTS HIS OLD KNEES.'] }),
      X.blocks('leansOnTheCane', 'LEANS ON THE CANE', { n: 4, hits: 5, hint: ['visual', 'HE LEANS ON THE CANE WHEN YOU KEEP BLOCKING.'] }),
    ],
    antiStrategies: [
      A.turtling('oldSchoolPressure', 'OLD-SCHOOL PRESSURE', { response: 'drain', share: 0.4, every: 50, say: 'HE CRUSHES YOUR GUARD!' }),
      A.comboRepeat('seenItAll', 'HE\'S SEEN IT ALL', { counter: 'cross', delay: 14, say: 'SEEN IT ALL!' }),
    ],
    scriptedMoments: [
      S.clock('theRoutine', 'THE OLD ROUTINE', 90, [{ idle: 34 }, { move: 'jab' }, { idle: 10 }, { move: 'cross' }, { idle: 12 }, { move: 'caneSweep' }, { idle: 30 }]),
      S.health('lastOrders', 'LAST ORDERS', 0.4, [{ idle: 34 }, { move: 'poke' }, { idle: 14 }, { move: 'caneSweep' }, { idle: 14 }, { move: 'haymaker' }, { idle: 34 }]),
    ],
  },

  // -- #70 Nebula: the collapse
  nebula: {
    nickname: 'THE BLACK HOLE', quote: 'EVERY STAR I MADE, I CAN TAKE BACK.', lines: { win: 'EVERYTHING FALLS IN, EVENTUALLY.', lose: 'THE LIGHT... ESCAPES...' },
    tell: 0.85,
    moves: { blackHole: mv('haymaker', 6, { name: 'BLACK HOLE' }) },
    patterns: [{ id: 'eventHorizon', weight: 3, steps: steps('i40 flare i14 sear i16 tide i30 blackHole i44 fallout i40') }],
    exploits: [
      X.counter('eventHorizon', 'THE EVENT HORIZON', 'blackHole', { late: 5, hits: 7, star: true, hint: ['visual', 'THE AIR AROUND HIM BENDS INWARD BEFORE THE BLACK HOLE.'] }),
      X.slip('redShift', 'RED SHIFT', 'fallout', { hits: 5, star: 26, hint: ['audio', 'FALLOUT SINGS A LOW NOTE AS IT FALLS.'] }),
      X.passive('stargazing', 'STARGAZING', { seconds: 6, hits: 4, say: 'HE WATCHES THE STARS!', hint: ['quote', 'I WAS HERE BEFORE THE FIRST LIGHT.'] }),
    ],
    antiStrategies: [
      A.comboRepeat('pullOfGravity', 'THE PULL OF GRAVITY', { counter: 'sear', delay: 14, say: 'GRAVITY PULLS IT BACK!' }),
      A.jabSpam('absorbsLight', 'ABSORBS THE LIGHT', { streak: 4, counter: 'fallout', say: 'SWALLOWED!' }),
    ],
    scriptedMoments: [
      S.clock('newStar', 'A NEW STAR', 90, [{ idle: 34 }, { move: 'flare' }, { idle: 10 }, { move: 'sear' }, { idle: 10 }, { move: 'tide' }, { idle: 30 }]),
      S.health('collapse', 'THE COLLAPSE', 0.35, [{ idle: 34 }, { move: 'blackHole' }, { idle: 20 }, { move: 'fallout' }, { idle: 30 }]),
    ],
  },

  // -- #74 Forgemaster Hale: quenched
  hale: {
    nickname: 'QUENCHED IN BLOOD', quote: 'EVERY BLADE I MAKE, I TEST MYSELF.', lines: { win: 'TEMPERED. NOW GO HOME.', lose: 'THE FIRE... GOES OUT...' },
    tell: 0.85,
    moves: { quenchSweep: sweep(6, 'QUENCH SWEEP') },
    patterns: [{ id: 'quenching', weight: 3, steps: steps('i36 jab i14 jabR i16 quenchSweep i30 hook i16 upper i40') }],
    exploits: [
      X.counter('tempered', 'TEMPERED TOO FAST', 'upper', { early: 3, hits: 6, hint: ['audio', 'A HISS OF STEAM BEFORE THE FURNACE UPPERCUT.'] }),
      X.slip('steamBurn', 'STEAM BURN', 'quenchSweep', { result: 'ducked', hits: 5, star: 26, hint: ['visual', 'STEAM POURS OFF HIS HAND BEFORE THE QUENCH.'] }),
      X.blocks('hammerDrops', 'THE HAMMER DROPS', { n: 4, hits: 5, hint: ['trainer', 'A FORGEMASTER DOESN\'T LIKE TO HAMMER ON AN EMPTY ANVIL.'] }),
    ],
    antiStrategies: [
      A.jabSpam('hammeredHome', 'HAMMERED HOME', { streak: 4, counter: 'sledge', say: 'HAMMERED!' }),
      A.earlyDodge('heldInTheFire', 'HELD IN THE FIRE', { moves: ['hook', 'hookL'], say: 'HELD IN THE FIRE!' }),
    ],
    scriptedMoments: [
      S.clock('bellows', 'BELLOWS BLOWN', 90, [{ idle: 34 }, { move: 'jab' }, { idle: 10 }, { move: 'jabR' }, { idle: 12 }, { move: 'quenchSweep' }, { idle: 30 }]),
      S.health('whiteHeat', 'WHITE HEAT', 0.4, [{ idle: 34 }, { move: 'sledge' }, { idle: 18 }, { move: 'upper' }, { idle: 14 }, { move: 'quenchSweep' }, { idle: 30 }]),
    ],
  },

  // -- #78 Prism: all colours
  prism: {
    nickname: 'ALL THE COLOURS', quote: 'YOU SEE ONE LIGHT. I AM EVERY ONE OF THEM.', lines: { win: 'YOU SAW ONLY WHITE.', lose: 'THE COLOURS... FADE...' },
    tell: 0.85,
    moves: { refraction: sweep(5, 'REFRACTION') },
    patterns: [{ id: 'fullColour', weight: 3, steps: steps('i36 jab i12 hookL i14 refraction i28 bodyR i14 upper i40') }],
    exploits: [
      X.counter('pinhole', 'THE PINHOLE', 'upper', { early: 3, hits: 6, hint: ['visual', 'A SINGLE BEAM NARROWS TO A POINT ABOVE HIS FIST.'] }),
      X.slip('bentBeam', 'BENT BEAM', 'refraction', { result: 'ducked', hits: 5, star: 26, hint: ['audio', 'THE REFRACTION CHIMES AS IT BENDS.'] }),
      X.passive('intoTheLight', 'LOOKS INTO THE LIGHT', { seconds: 6, hits: 4, say: 'HE ADMIRES HIS OWN LIGHT!', hint: ['quote', 'BEAUTIFUL, ISN\'T IT?'] }),
    ],
    antiStrategies: [
      A.comboRepeat('redoneInGlass', 'REDONE IN GLASS', { counter: 'upper', delay: 14, say: 'ONE MORE TIME!' }),
      A.rushing('hardLight', 'HARD LIGHT', { count: 3, counter: 'hook', say: 'HARD LIGHT!' }),
    ],
    scriptedMoments: [
      S.clock('firstColour', 'THE FIRST COLOUR', 90, [{ idle: 34 }, { move: 'jab' }, { idle: 10 }, { move: 'hookL' }, { idle: 12 }, { move: 'refraction' }, { idle: 30 }]),
      S.health('allColours', 'ALL COLOURS AT ONCE', 0.45, [{ idle: 34 }, { move: 'bodyR' }, { idle: 14 }, { move: 'refraction' }, { idle: 14 }, { move: 'upper' }, { idle: 30 }]),
    ],
  },

  // -- #81 Radiant Rho: a light of his own
  rho: {
    nickname: 'A LIGHT OF HIS OWN', quote: 'I BORROWED SIX LIGHTS. NOW I\'M SHOWING YOU MY OWN.', lines: { win: 'SIX LIGHTS, ONE WINNER.', lose: 'MY OWN... LIGHT... WAS ENOUGH...' },
    tell: 0.85,
    moves: { radiantSweep: sweep(5, 'RADIANT SWEEP') },
    exploits: [
      X.counter('homageDropped', 'THE HOMAGE DROPPED', 'upper', { early: 3, hits: 6, hint: ['visual', 'HIS WHOLE BODY RISES ONTO ITS TOES BEFORE THE RADIANT UPPERCUT.'] }),
      X.slip('gloryFades', 'GLORY FADES', 'radiantSweep', { result: 'ducked', hits: 5, star: 26, hint: ['audio', 'THE RADIANT SWEEP SHIMMERS ALONG THE FLOOR.'] }),
      X.getUp('lightAtTheEnd', 'THE LIGHT AT THE END', { hits: 5, star: 26, hint: ['quote', 'EVEN A LIGHT MUST REST.'] }),
    ],
    antiStrategies: [
      A.turtling('glareOfGlory', 'THE GLARE OF GLORY', { response: 'drain', share: 0.4, every: 48, say: 'THE GLARE BURNS YOUR GUARD!' }),
      A.jabSpam('reflectedGlory', 'REFLECTED GLORY', { streak: 4, counter: 'hook', say: 'REFLECTED!' }),
    ],
    scriptedMoments: [
      S.clock('opening', 'THE OPENING ACT', 90, [{ idle: 34 }, { move: 'jab' }, { idle: 10 }, { move: 'jabR' }, { idle: 12 }, { move: 'radiantSweep' }, { idle: 30 }]),
      S.health('ownLightRises', 'HIS OWN LIGHT RISES', 0.4, [{ idle: 34 }, { move: 'hook' }, { idle: 14 }, { move: 'hookL' }, { idle: 14 }, { move: 'radiantSweep' }, { idle: 14 }, { move: 'upper' }, { idle: 30 }]),
    ],
  },

  // -- Barney Buckets, Ascended: the holy mess
  barney2: {
    nickname: 'THE HOLY MESS', quote: 'I CLEANED THE WHOLE HEAVENS. THEN I FOUND ONE MORE SPILL: YOU.', lines: { win: 'ALL CLEAN.', lose: 'I... MISSED A SPOT...' },
    tell: 0.85,
    moves: { bucketKick: sweep(4, 'BUCKET KICK') },
    exploits: [
      X.counter('broomRaised', 'THE BROOM IS RAISED', 'hook', { late: 3, hits: 6, star: true, hint: ['visual', 'HE RAISES THE PUSH-BROOM OVER HIS SHOULDER FIRST.'] }), // (not the mop of heaven's call: that one is a super, armored from its first move)
      X.slip('kickedTheBucket', 'KICKED THE BUCKET', 'bucketKick', { result: 'ducked', hits: 5, star: 26, hint: ['audio', 'THE BUCKET RATTLES ALONG THE FLOOR.'] }),
      X.blocks('moppingUp', 'MOPPING UP', { n: 4, hits: 5, hint: ['quote', 'A CLEAN FLOOR IS A SAFE FLOOR.'] }),
    ],
    antiStrategies: [
      A.earlyDodge('slipperyFloor', 'A SLIPPERY FLOOR', { moves: ['hook'], say: 'WET FLOOR!' }),
      A.jabSpam('swabbedOut', 'SWABBED OUT', { streak: 4, counter: 'mopSwing', say: 'SWABBED!' }),
    ],
    scriptedMoments: [
      S.clock('aisleSeven', 'CLEANUP ON AISLE SEVEN', 75, [{ idle: 34 }, { move: 'jab' }, { idle: 10 }, { move: 'hook' }, { idle: 12 }, { move: 'bucketKick' }, { idle: 28 }]),
      S.health('spill', 'SPILL!', 0.4, [{ idle: 34 }, { move: 'bucketKick' }, { idle: 14 }, { move: 'mopSwing' }, { idle: 30 }]),
    ],
  },

  // -- Halcyon, the Undefeated: the long evening
  halcyon: {
    nickname: 'THE LONG EVENING', quote: 'I HAVE NEVER LOST. I HAVE ONLY NEVER BEEN LOST TO.', lines: { win: 'THE DAY ENDS HOW IT ALWAYS DOES.', lose: 'THE DAY... ENDS... FOR ME...' },
    tell: 0.9,
    moves: { eventide: sweep(5, 'EVENTIDE') },
    exploits: [
      X.counter('solarFlare', 'SOLAR FLARE', 'nUpper', { early: 3, hits: 6, star: true, hint: ['visual', 'HIS SHADOW FLARES BEFORE THE SOLAR UPPERCUT.'] }),
      X.slip('shadowOutrun', 'THE SHADOW OUTRUN', 'eventide', { result: 'ducked', hits: 5, star: 26, hint: ['audio', 'EVENTIDE ARRIVES WITH A LONG, LOW SIGH.'] }),
      X.slip('hazeOfDawn', 'THE HAZE OF DAWN', 'dBodyEnd', { result: 'blocked', hits: 5, star: 26, hint: ['trainer', 'IN HIS DAWN FORM THE DAYBREAK BLOW ENDS A COMBO.'] }),
    ],
    antiStrategies: [
      A.comboRepeat('sunRepeats', 'THE SUN REPEATS', { counter: 'nUpper', delay: 14, say: 'THE SUN REPEATS!' }),
      A.starHoard('dawnsTithe', 'THE DAY TAKES ITS DUE', { hold: 420, moves: ['dJab', 'dCross', 'nJab', 'nCross'], say: 'THE DAY TAKES A STAR!' }),
    ],
    scriptedMoments: [
      S.clock('chillOfDawn', 'THE CHILL OF DAWN', 100, [{ idle: 34 }, { move: 'dJab' }, { move: 'dCross' }, { idle: 14 }, { move: 'eventide' }, { idle: 30 }], { round: 1 }),
      S.clock('blindingHour', 'THE BLINDING HOUR', 100, [{ idle: 34 }, { move: 'nJab' }, { move: 'nCross' }, { idle: 14 }, { move: 'nUpper' }, { idle: 30 }], { round: 2 }),
      S.clock('longShadows', 'LONG SHADOWS', 100, [{ idle: 34 }, { move: 'eventide' }, { idle: 26 }, { move: 'dkSweep' }, { idle: 34 }], { round: 3 }),
    ],
  },

  // ---------------------------------------------------------------- the Underworld's champions
  // -- #85 Moros: the burial
  moros: {
    nickname: 'THE BURIAL', quote: 'YOU HAVE WALKED BEHIND THE COFFIN. NOW I\'LL SHOW YOU THE GROUND.', lines: { win: 'REST NOW. THE LONG REST.', lose: 'THE MASK... SLIPS... AT LAST...' },
    tell: 0.85,
    moves: { lastRites: sweep(6, 'LAST RITES') },
    patterns: [{ id: 'graveside', weight: 3, steps: steps('i36 jab i12 hook i14 lastRites i30 hookL i16 upper i40') }],
    exploits: [
      X.counter('deadWeight', 'DEAD WEIGHT', 'hookL', { early: 4, hits: 6, hint: ['audio', 'A SINGLE BELL TOLLS BEFORE THE DEAD HOOK.'] }),
      X.slip('gravedigging', 'DIGS HIS OWN GRAVE', 'lastRites', { result: 'ducked', hits: 5, star: 26, hint: ['visual', 'HE DIPS HIS SHOULDER LIKE A GRAVEDIGGER BEFORE THE LAST RITES.'] }),
      X.blocks('theMaskSlips', 'THE MASK SLIPS', { n: 4, hits: 5, hint: ['quote', 'DON\'T LOOK BEHIND THE MASK.'] }),
    ],
    antiStrategies: [
      A.comboRepeat('eulogy', 'THE EULOGY', { counter: 'upper', delay: 14, say: 'THE EULOGY!' }),
      A.dodgeBias('followsYourFeet', 'FOLLOWS YOUR FEET', { moves: ['jab'], min: 6, share: 0.75, say: 'FOLLOWING YOUR FEET!' }),
    ],
    scriptedMoments: [
      S.clock('procession', 'THE PROCESSION', 100, [{ idle: 34 }, { move: 'jab' }, { idle: 10 }, { move: 'hook' }, { idle: 12 }, { move: 'lastRites' }, { idle: 30 }]),
      S.health('theBurial', 'THE BURIAL', 0.45, [{ idle: 34 }, { move: 'march' }, { idle: 18 }, { move: 'lastRites' }, { idle: 14 }, { move: 'upper' }, { idle: 30 }]),
    ],
  },

  // -- Queen Soot: the ash crown
  soot: {
    nickname: 'THE ASH QUEEN', quote: 'EVERYTHING IS A THRONE ONCE IT\'S BURNED.', lines: { win: 'ASH TO ASH.', lose: 'THE FIRE... IS... OUT...' },
    tell: 0.85,
    moves: { ashfall: sweep(4, 'ASHFALL') },
    patterns: [{ id: 'ashRain', weight: 3, steps: steps('i34 sear i12 cinders i14 ashfall i28 smolder i14 spark i40') }],
    exploits: [
      X.counter('smothered', 'SMOTHERED', 'spark', { early: 3, hits: 6, hint: ['audio', 'A CRACK OF SPARKS BEFORE THE SPARK.'] }),
      X.slip('ashUnderfoot', 'ASH UNDERFOOT', 'ashfall', { result: 'ducked', hits: 5, star: 24, hint: ['visual', 'A CLOUD OF ASH RISES FROM HER HAND BEFORE THE ASHFALL.'] }),
      X.passive('stokesTheFire', 'STOKES THE FIRE', { seconds: 6, hits: 4, say: 'SHE STOKES THE FIRE!', hint: ['quote', 'A FIRE NEEDS TENDING.'] }),
    ],
    antiStrategies: [
      A.turtling('smokeScreen', 'A SMOKE SCREEN', { moves: ['sear'], cue: 'NO BLOCK!', say: 'SMOKE IN YOUR EYES!' }),
      A.jabSpam('cinderStorm', 'CINDER STORM', { streak: 4, counter: 'cinders', say: 'CINDERS!' }),
    ],
    scriptedMoments: [
      S.clock('emberGlow', 'EMBERS GLOW', 110, [{ idle: 34 }, { move: 'sear' }, { idle: 10 }, { move: 'cinders' }, { idle: 12 }, { move: 'ashfall' }, { idle: 28 }]),
      S.health('inferno', 'INFERNO', 0.4, [{ idle: 34 }, { move: 'spark' }, { idle: 14 }, { move: 'ashfall' }, { idle: 14 }, { move: 'blaze' }, { idle: 34 }]),
    ],
  },

  // -- The Jailer: time served
  jailer: {
    nickname: 'LIFE WITHOUT PAROLE', quote: 'THE CELLS ARE FULL. I\'VE SAVED ONE JUST FOR YOU.', lines: { win: 'BACK IN YOUR CELL.', lose: 'THE KEYS... THE KEYS...' },
    tell: 0.85,
    moves: { cellDrop: sweep(6, 'CELL DROP') },
    patterns: [{ id: 'lifeTerm', weight: 3, steps: steps('i36 keyJab i12 chainHookL i14 cellDrop i30 cellBlow i16 lockUp i40') }],
    exploits: [
      X.counter('snappedLink', 'A SNAPPED LINK', 'chainHookL', { early: 3, hits: 6, hint: ['audio', 'THE CHAIN RATTLES JUST BEFORE THE LEFT CHAIN HOOK.'] }),
      X.slip('doorSlammed', 'THE DOOR SLAMS SHUT', 'cellDrop', { result: 'ducked', hits: 5, star: 26, hint: ['visual', 'HE RAISES THE CELL DOOR OVERHEAD BEFORE THE DROP.'] }),
      X.getUp('keysDropped', 'KEYS DROPPED', { hits: 5, star: 26, hint: ['quote', 'EVERY DOOR HAS A KEY.'] }),
    ],
    antiStrategies: [
      A.comboRepeat('barsDrop', 'THE BARS DROP', { counter: 'cellBlow', delay: 14, say: 'BARRED!' }),
      A.rushing('guardsAnswer', 'THE GUARDS ANSWER', { count: 3, counter: 'lockUp', say: 'GUARDS!' }),
    ],
    scriptedMoments: [
      S.clock('countOff', 'COUNT OFF', 100, [{ idle: 34 }, { move: 'keyJab' }, { idle: 10 }, { move: 'chainHook' }, { idle: 12 }, { move: 'cellDrop' }, { idle: 30 }]),
      S.health('timeServed', 'TIME SERVED', 0.4, [{ idle: 34 }, { move: 'manacle' }, { idle: 18 }, { move: 'cellDrop' }, { idle: 14 }, { move: 'lockUp' }, { idle: 30 }]),
    ],
  },

  // -- Fallen Karver: the deposed
  fkarver: {
    nickname: 'THE DEPOSED', quote: 'A KING WHO HAS FALLEN HAS NOTHING LEFT TO LOSE.', lines: { win: 'LONG LIVE THE DEPOSED.', lose: 'THE CROWN... ROLLS AWAY...' },
    tell: 0.85,
    moves: { fallenScythe: sweep(5, 'THE FALLEN SCYTHE') },
    patterns: [{ id: 'exile', weight: 3, steps: steps('i30 crown i12 carveL i14 fallenScythe i26 burden i14 tithe i40') }],
    exploits: [
      X.counter('carvedUp', 'CARVED UP', 'carveR', { early: 4, hits: 6, hint: ['visual', 'HE DROPS HIS LEFT SHOULDER BEFORE CARVING.'] }),
      X.slip('scytheFallen', 'THE SCYTHE FALLS', 'fallenScythe', { result: 'ducked', hits: 5, star: 24, hint: ['audio', 'THE SCYTHE RINGS ALONG THE FLOOR.'] }),
      X.blocks('crownAskew', 'THE CROWN SITS ASKEW', { n: 4, hits: 5, hint: ['quote', 'A KING MUST KEEP HIS CROWN STRAIGHT.'] }),
    ],
    antiStrategies: [
      A.starHoard('dueOfTheDeposed', 'WHAT HE IS DUE', { hold: 420, moves: ['crown', 'crownR'], say: 'WHAT HE IS DUE!' }),
      A.dodgeBias('eyesOnYourFeet', 'EYES ON YOUR FEET', { moves: ['crown'], min: 6, share: 0.75, say: 'EYES ON YOUR FEET!' }),
    ],
    scriptedMoments: [
      S.clock('courtReconvenes', 'THE COURT RECONVENES', 100, [{ idle: 34 }, { move: 'crown' }, { idle: 10 }, { move: 'carveL' }, { idle: 12 }, { move: 'fallenScythe' }, { idle: 30 }]),
      S.health('deposed', 'DEPOSED', 0.35, [{ idle: 34 }, { move: 'decree' }, { idle: 18 }, { move: 'fallenScythe' }, { idle: 14 }, { move: 'tithe' }, { idle: 30 }]),
    ],
  },

  // -- Crucible: the second casting
  crucible: {
    nickname: 'THE SECOND CASTING', quote: 'THE FIRST MOLD CRACKED. THIS ONE WON\'T.', lines: { win: 'CAST AND SET.', lose: 'THE MOLD... BREAKS...' },
    tell: 0.85,
    moves: { quench: sweep(5, 'THE QUENCH') },
    patterns: [{ id: 'recast', weight: 3, steps: steps('i32 ingot i12 cast i14 quench i28 pourBlow i14 forge i40') }],
    exploits: [
      X.counter('flawedMold', 'A FLAWED MOLD', 'forge', { early: 3, hits: 6, hint: ['audio', 'THE MOLD HISSES JUST BEFORE THE FORGE UPPERCUT.'] }),
      X.slip('pouredWrong', 'POURED WRONG', 'quench', { result: 'ducked', hits: 5, star: 24, hint: ['visual', 'A STREAM OF STEAM SHOOTS FROM HIS HAND BEFORE THE QUENCH.'] }),
      X.passive('checksTheCrucible', 'CHECKS THE CRUCIBLE', { seconds: 6, hits: 4, say: 'HE CHECKS THE CRUCIBLE!', hint: ['quote', 'A GOOD CASTING TAKES PATIENCE.'] }),
    ],
    antiStrategies: [
      A.jabSpam('slagBack', 'SLAG BACK', { streak: 4, counter: 'cast', say: 'SLAGGED!' }),
      A.turtling('heatSoak', 'HEAT SOAK', { moves: ['ingot'], cue: 'NO BLOCK!', say: 'HEAT SOAK!' }),
    ],
    scriptedMoments: [
      S.clock('firstPour', 'THE FIRST POUR', 90, [{ idle: 34 }, { move: 'ingot' }, { idle: 10 }, { move: 'cast' }, { idle: 12 }, { move: 'quench' }, { idle: 28 }]),
      S.health('breakTheMold', 'BREAKING THE MOLD', 0.4, [{ idle: 34 }, { move: 'slagging' }, { idle: 18 }, { move: 'quench' }, { idle: 14 }, { move: 'forge' }, { idle: 30 }]),
    ],
  },

  // -- The Herald: the last proclamation
  herald: {
    nickname: 'THE LAST PROCLAMATION', quote: 'I CARRIED THE KING\'S WORD. NOW I CARRY MY OWN.', lines: { win: 'SO IT IS DECREED.', lose: 'THE WORD... IS... UNSPOKEN...' },
    tell: 0.9,
    moves: { proclaim: sweep(3, 'PROCLAIM') },
    exploits: [
      X.counter('voiceCracks', 'THE VOICE CRACKS', 'bellow', { early: 3, hits: 6, hint: ['audio', 'HE TAKES A LONG, LOUD BREATH BEFORE THE BELLOW.'] }),
      X.slip('shoutedDown', 'SHOUTED HOARSE', 'proclaim', { result: 'ducked', hits: 5, star: 24, hint: ['visual', 'HE SWINGS LOW WITH THE HORN BEFORE THE PROCLAIM.'] }),
      X.getUp('silentHerald', 'THE HERALD FALLS SILENT', { hits: 5, star: 24, hint: ['quote', 'HEAR YE, HEAR YE.'] }),
    ],
    antiStrategies: [
      A.earlyDodge('awaitsTheSlip', 'AWAITS THE SLIP', { moves: ['hook', 'hookL'], say: 'AWAITING THE SLIP!' }),
      A.comboRepeat('readsItBack', 'READS IT BACK', { counter: 'upper', delay: 14, say: 'READ BACK!' }),
    ],
    scriptedMoments: [
      S.clock('fanfare', 'A FANFARE', 90, [{ idle: 34 }, { move: 'jab' }, { idle: 10 }, { move: 'hook' }, { idle: 12 }, { move: 'proclaim' }, { idle: 30 }]),
      S.health('lastProclamation', 'THE LAST PROCLAMATION', 0.35, [{ idle: 34 }, { move: 'bellow' }, { idle: 18 }, { move: 'proclaim' }, { idle: 14 }, { move: 'upper' }, { idle: 30 }]),
    ],
  },

  // -- Vorgath, King Below: the tithe of bones
  vorgath: {
    nickname: 'THE TITHE OF BONES', quote: 'I HAVE COLLECTED EVERYTHING ELSE. NOW, YOUR BONES.', lines: { win: 'THE TITHE IS PAID.', lose: 'THE THRONE... EMPTY AT LAST...' },
    tell: 0.9,
    moves: { boneThrone: sweep(3, 'THE BONE THRONE') },
    exploits: [
      X.counter('footingLost', 'FOOTING LOST', 'crush', { early: 4, hits: 7, star: true, hint: ['audio', 'THE FLOOR GROANS BEFORE THE FLOOR BREAKER.'] }),
      X.slip('throneToppled', 'THE THRONE TOPPLES', 'boneThrone', { result: 'ducked', hits: 5, star: 24, hint: ['visual', 'BONES CLATTER UP AROUND HIS FEET BEFORE THE THRONE.'] }),
      X.getUp('kingKneels', 'THE KING KNEELS', { hits: 6, star: 28, hint: ['quote', 'NO ONE FALLS BEFORE THE KING.'] }),
    ],
    antiStrategies: [
      A.jabSpam('graveDust', 'GRAVE DUST', { streak: 4, counter: 'upper', say: 'DUST TO DUST!' }),
      A.turtling('chillOfTheGrave', 'THE CHILL OF THE GRAVE', { response: 'drain', share: 0.4, every: 48, say: 'THE GRAVE CHILLS YOUR GUARD!' }),
    ],
    scriptedMoments: [
      S.clock('titheCollected', 'THE TITHE IS COLLECTED', 100, [{ idle: 34 }, { move: 'jab' }, { idle: 10 }, { move: 'cross' }, { idle: 12 }, { move: 'boneThrone' }, { idle: 30 }], { round: 1 }),
      S.clock('floorCracks', 'THE FLOOR CRACKS', 100, [{ idle: 34 }, { move: 'crush' }, { idle: 18 }, { move: 'boneThrone' }, { idle: 32 }], { round: 2 }),
      S.clock('thronePressed', 'THE EMPTY THRONE', 100, [{ idle: 34 }, { move: 'haymaker' }, { idle: 24 }, { move: 'boneThrone' }, { idle: 32 }], { round: 3 }),
    ],
  },

  // ---------------------------------------------------------------- Dash, and the last form of ZERO
  // -- Dash Maddox, unbound: the final cut
  dash9: {
    nickname: 'THE FINAL CUT', quote: 'NO MORE SHOWBOATING. NO MORE TAPE. JUST ME, AND THE BELL.', lines: { win: 'THAT\'S A WRAP.', lose: 'CUT... PRINT IT...' },
    tell: 0.9,
    moves: { selfieStick: sweep(3, 'SELFIE STICK') },
    stateTriggers: [], // (the gloating is gone: this Dash doesn't stop to talk)
    exploits: [
      X.counter('blownTake', 'A BLOWN TAKE', 'chainHook', { early: 3, hits: 6, star: true, hint: ['audio', 'THE CHAIN RATTLES A MOMENT BEFORE THE CHAIN HOOK.'] }),
      X.slip('divineDescent', 'DIVINE DESCENT', 'divineL', { dir: 'R', hits: 6, star: 28, hint: ['visual', 'HE GLOWS GOLD BEFORE THE DIVINE DASH.'] }),
      X.slip('reelSkipped', 'THE REEL SKIPS', 'reel3', { result: 'ducked', hits: 5, star: 24, hint: ['trainer', 'THE HIGHLIGHT REEL ENDS WITH A SWEEP.'] }),
    ],
    antiStrategies: [
      { id: 'fileOnYou2', type: 'grudge', name: 'THE UNCUT TAPE', span: 1500, demo: 'turtle', say: 'I WATCHED THE UNCUT TAPE!',
        answers: {
          jab: { type: 'jabSpam', streak: 3, counter: 'flashbulb', say: 'PARRIED!' },
          turtle: { type: 'turtling', response: 'drain', share: 0.4, span: 480, every: 44, say: 'YOUR GUARD IS COSTING YOU!' },
          early: { type: 'earlyDodge', response: 'hold', moves: ['showJab', 'flashbulb'], say: 'HELD IT!' },
          bias: { type: 'dodgeBias', moves: ['smartCross'], min: 6, share: 0.75, say: 'YOUR FAVORITE SIDE!' },
          hoard: { type: 'starHoard', moves: ['showJab', 'smartCross'], say: 'STAR CUT!' },
          zone: { type: 'zoneBias', frames: 480, say: 'I KNOW WHERE YOU PUNCH!' },
          passive: { type: 'passivity', response: 'buff', frames: 240, gain: 1 / 480, decay: 1 / 240, dmg: 0.3, rec: 0.1, meter: 'PUSH-IN', say: 'PUSHING IN!' },
          rush: { type: 'rushing', span: 150, count: 2, counter: ['flashbulb'], say: 'TOO EAGER!' },
          repeat: { type: 'comboRepeat', gap: 45, counter: ['flashbulb'], say: 'SAME SHOT?' },
        } },
      A.zoneBias('framedTight', 'FRAMED TIGHT', { mode: 'streak', streak: 4, zone: 'body', frames: 420, raise: 'HE TIGHTENS THE FRAME!', say: 'FRAMED!' }),
    ],
    scriptedMoments: [
      S.clock('premiere', 'THE PREMIERE', 100, [{ idle: 34 }, { move: 'showJab' }, { idle: 10 }, { move: 'smartCross' }, { idle: 12 }, { move: 'selfieStick' }, { idle: 28 }]),
      S.clock('secondTake', 'SECOND TAKE', 55, [{ idle: 34 }, { move: 'cheapShot' }, { idle: 10 }, { move: 'selfieStick' }, { idle: 14 }, { move: 'flashbulb' }, { idle: 30 }]),
      S.health('finalCut', 'THE FINAL CUT', 0.35, [{ idle: 34 }, { move: 'knowItAll' }, { idle: 14 }, { move: 'selfieStick' }, { idle: 14 }, { move: 'flashbulb' }, { idle: 30 }]),
    ],
  },

  // -- ZERO, true form: the whole of nothing, again
  zeroTrue: {
    nickname: 'NOTHING, AGAIN', quote: 'YOU FREED TWELVE. I KEPT THE ONE THAT MATTERS.', lines: { win: 'BACK TO ZERO. AGAIN.', lose: 'I WAS ONLY... A DIRECTION...' },
    tell: 0.95,
    moves: { voidSweep: sweep(3, 'THE VOID SWEEP') },
    exploits: [
      X.counter('holdTheBulwark', 'THE BULWARK BREAKS', 'block_bulwark', { early: 4, hits: 7, star: true, hint: ['visual', 'HE PLANTS BOTH FEET BEFORE THE BULWARK.'] }),
      X.slip('fullStrideFalls', 'FULL STRIDE FALLS', 'dodge_haymaker', { hits: 6, star: 26, hint: ['audio', 'HIS RUNNING FEET STOP DEAD BEFORE THE FULL STRIDE.'] }),
      X.slip('voidSweepMissed', 'NOTHING TO SWEEP', 'voidSweep', { result: 'ducked', hits: 5, star: 24, hint: ['trainer', 'THE VOID SWEEP IS THE ONE PUNCH HE ADDED FOR YOU.'] }),
    ],
    antiStrategies: [
      { id: 'adaptsHarder', type: 'adapt', name: 'HE ADAPTS HARDER', after: 900, demo: 'turtle', say: 'HE ADAPTS!',
        answers: {
          jab: { type: 'jabSpam', streak: 3, counter: 'zSlow', say: 'PARRIED!' },
          turtle: { type: 'turtling', response: 'drain', share: 0.4, span: 480, every: 44, say: 'NOTHING TO HOLD ONTO!' },
          early: { type: 'earlyDodge', response: 'hold', moves: ['zHook', 'zHookL', 'zJab'], say: 'HELD IT!' },
          bias: { type: 'dodgeBias', moves: ['zJab'], min: 6, share: 0.75, say: 'YOUR FAVORITE SIDE!' },
          hoard: { type: 'starHoard', moves: ['zJab', 'zBody'], say: 'STAR ERASED!' },
          zone: { type: 'zoneBias', frames: 480, say: 'I KNOW WHERE YOU PUNCH!' },
          passive: { type: 'passivity', response: 'buff', frames: 240, gain: 1 / 420, decay: 1 / 220, dmg: 0.3, rec: 0.1, meter: 'ADAPTING', say: 'HE LEARNED YOU WAIT!' },
          rush: { type: 'rushing', span: 150, count: 2, counter: ['zSlow'], say: 'TOO EAGER!' },
          repeat: { type: 'comboRepeat', gap: 45, counter: ['zSlow'], say: 'SAME AGAIN?' },
        } },
      A.jabSpam('noEchoLeft', 'NO ECHO LEFT', { streak: 4, counter: 'block_hook', say: 'NOT EVEN AN ECHO!' }),
    ],
    scriptedMoments: [
      S.clock('firstSilence', 'THE FIRST SILENCE', 100, [{ idle: 34 }, { move: 'voidSweep' }, { idle: 30 }], { round: 1 }),
      S.clock('secondSilence', 'THE SECOND SILENCE', 100, [{ idle: 34 }, { move: 'voidSweep' }, { idle: 30 }], { round: 2 }),
      S.health('lastOfNothing', 'THE LAST OF NOTHING', 0.3, [{ idle: 34 }, { move: 'voidSweep' }, { idle: 16 }, { move: 'voidSweep' }, { idle: 30 }]),
    ],
  },

  // -- ZERO, the first form (Combined only): the same nothing, louder
  zero: {
    nickname: 'NOTHING, LOUDER', quote: 'YOU REMEMBER THEM ALL. LET ME REMIND YOU HOW THEY LOST.', lines: { win: 'NOTHING, AS EVER.', lose: 'NOTHING... LEAVES...' },
    tell: 0.9,
    moves: { noFloor: sweep(4, 'NO FLOOR') },
    exploits: [
      X.slip('deadWeightEcho', 'DEAD WEIGHT ECHOED', 'sig_brody', { hits: 6, star: 26, hint: ['audio', 'THE BRICKLAYER\'S TROWEL CLINKS BEFORE HIS ECHO OF THE MIXER.'] }),
      X.slip('finalBowEchoed', 'THE BOW, UNDONE', 'sig_rex', { hits: 5, star: 26, hint: ['visual', 'THE RINGMASTER\'S TOP HAT APPEARS ON HIS HEAD FOR A MOMENT.'] }),
      X.slip('noFloorMissed', 'NOTHING TO STAND ON', 'noFloor', { result: 'ducked', hits: 5, star: 24, hint: ['trainer', 'NO FLOOR IS THE ONE PUNCH HE ADDED FOR THIS ROUND.'] }),
    ],
    antiStrategies: [
      A.jabSpam('echoOfYourJabs', 'AN ECHO OF YOUR JABS', { streak: 4, counter: 'zBody', say: 'YOUR OWN ECHO!' }),
      A.earlyDodge('heldInTheEcho', 'HELD IN THE ECHO', { moves: ['zHook', 'zHookL'], say: 'HELD IN THE ECHO!' }),
    ],
    scriptedMoments: [
      S.clock('firstEchoOfAll', 'THE FIRST ECHO', 100, [{ idle: 34 }, { move: 'zJab' }, { idle: 12 }, { move: 'noFloor' }, { idle: 30 }], { round: 1 }),
      S.clock('secondEchoOfAll', 'THE SECOND ECHO', 100, [{ idle: 34 }, { move: 'zHook' }, { idle: 12 }, { move: 'noFloor' }, { idle: 30 }], { round: 2 }),
      S.health('noOneLeft', 'NO ONE LEFT', 0.3, [{ idle: 34 }, { move: 'noFloor' }, { idle: 16 }, { move: 'zBody' }, { idle: 30 }]),
    ],
  },
};
