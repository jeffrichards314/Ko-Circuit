// #99 Stoker — Underworld V's first, the Furnace. The man who keeps the fire fed: a shovel, a scuttle of coal and no
// patience. The Furnace's HEAT meter (down the right edge of the screen) climbs all round and drains your hearts when it's high, and
// every time he STOKES THE FIRE (a long, slow, obvious shovelful) the meter jumps. Don't let him finish: a counter into the shovel
// spills the coal and the meter drops. Everything else he throws is a plain punch with a plain tell.
// His super is FLASH FIRE: a wall of flame in a swing. Slip it; hit him on the glint as he steps back in and he drops.
// Underworld difficulty: 5-frame tells for a heavy (3-frame circuit), adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, steps, GETUP } from '../pantheon/_kit.js';

const W = 5;
const scoop = { tell: 'shovel' };

export default {
  id: 'stoker',
  name: 'STOKER',
  short: 'STOKER',
  nickname: 'THE FIRE FEEDER',
  circuit: 'u5',
  rank: 3,
  isChampion: false,
  card: { age: 52, weight: 268, record: '41-9 30KO', hometown: 'THE COAL BUNKER', quote: 'THE FIRE\'S HUNGRY. SO AM I. YOU\'RE IN THE WAY OF BOTH.' },
  lines: { win: 'BACK TO WORK.', lose: 'THE FIRE... GOES OUT...' },

  build: 'heavy',
  palette: 'stoker',
  spriteLayers: 'stoker',

  stats: stats({ health: 400, damageMult: 2.05, stunResistance: 6, starLossChance: 0.6, stunFrames: 52, hitstun: 12 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 22 } }),

  moves: {
    shovelJab: mv('jab', W, { name: 'SHOVEL JAB', sfx: scoop }),
    shovelCross: mv('jabR', W, { name: 'SHOVEL CROSS', sfx: scoop }),
    scoop: mv('body', W, { name: 'COAL SCOOP', sfx: scoop }),
    scoopR: mv('bodyR', W, { name: 'COAL SCOOP (R)', sfx: scoop }),
    heave: mv('hook', W, { name: 'HEAVE-HO', windupFrames: 8, counterWindow: [3, 7], starWindow: [3, 6], damage: 15, sfx: { tell: 'shovel', swing: 'swingHeavy' } }),
    slam: mv('haymaker', W, { name: 'FIREBOX SLAM', windupFrames: 15, counterWindow: [4, 13], starWindow: [4, 7], sfx: { tell: 'shovel', swing: 'crash' } }),
    // the shovelful: a call, not a punch. Left alone it feeds the furnace.
    stoke: {
      name: 'STOKE THE FIRE', feint: true, call: true, stoke: true, noFake: true,
      windupFrames: 26, activeFrames: 0, recoveryFrames: 16, damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'], counterWindow: [4, 22], starWindow: [4, 8], cancels: 1,
      sfx: { tell: 'shovel' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 10, active: ['overheadTell2'], recovery: ['overheadTell2'] },
    },
    // the answer to being rushed: a bash with the flat of the shovel
    bash: mv('upper', W, { name: 'SHOVEL BASH', windupFrames: 11, counterWindow: [4, 9], starWindow: [4, 6], damage: 16, punishStar: ['dodged'], noFake: true, sfx: { tell: 'shovel', swing: 'swingHeavy' } }),
    flashFire: superMove('FLASH FIRE', { windupFrames: 20, counterWindow: [2, 17], starWindow: [2, 8], sfx: { tell: 'flame', swing: 'crash' } }),
  },

  patterns: [
    { id: 'shift', weight: 3, when: { rounds: [1] }, steps: steps('i32 shovelJab i34 scoop i30 heave i36 stoke i24 shovelCross i44 slam i54') },
    { id: 'doubleShift', weight: 3, steps: steps('i28 scoopR i26 heave i30 stoke i22 heave i28 shovelJab i32 slam i50') },
    { id: 'overtime', weight: 2, when: { health: [0, 0.5] }, steps: steps('i22 stoke i18 scoop i20 heave i22 shovelJab i22 slam i24 stoke i40') },
  ],

  super: { hit: 'head', move: 'flashFire', golden: 'advance', window: [2, 5], taunt: 42, shout: 'FLASH FIRE!', times: [1, 2] },

  getUpTable: GETUP, // (Phase F: the Pantheon's and the upper Underworld's table; these had the Storm circuit's 6-8)


  exploits: [
    {
      id: 'spilledCoal', type: 'stunTrigger', name: 'SPILLED COAL',
      trigger: { state: 'windup', move: 'stoke', counter: true, frames: [14, 21], clean: 22 },
      effect: { stun: 96, hits: 6, mod: { heat: -0.3 }, say: 'HE SPILLS THE COAL!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'AT THE TOP OF THE SHOVEL, THE COAL TEETERS: A PUNCH THEN KNOCKS THE LOT OVER HIM.' },
      scout: 'COUNTER HIS STOKE LATE (WHILE THE SHOVEL IS HIGH): HE SPILLS THE COAL, STUNNED FOR 6 HITS, AND THE HEAT METER DROPS BY A THIRD.',
    },
    {
      id: 'burnedHands', type: 'quirk', name: 'BURNED HANDS',
      trigger: { on: 'resolved', move: 'heave', result: 'dodged' },
      effect: { open: { frames: 88, anim: 'stunned', comboLimit: 6, star: [0, 34] }, say: 'HE BURNED HIS HANDS!', sfx: 'hiss' },
      hint: { kind: 'visual', text: 'A HEAVE THAT MISSES SWINGS THE HOT SHOVEL RIGHT THROUGH HIS OWN GLOVES.', hidden: true },
      scout: 'SLIP HIS HEAVE-HO (THE SHOVEL HOOK): HE BURNS HIS HANDS AND IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'shovelsBack', type: 'rushing', name: 'THE FLAT OF THE SHOVEL', span: 160, count: 3, counter: ['bash'], say: 'SHOVEL BASH!',
      scout: 'PUNCH INTO HIS GUARD THREE TIMES IN QUICK SUCCESSION AND HE ANSWERS WITH A SHOVEL BASH, A SLOW UPPERCUT (SLIP IT).',
    },
  ],
  scriptedMoments: [
    { id: 'fullLoad', name: 'FULL LOAD', when: { left: 80 }, say: 'FULL LOAD!', steps: [{ idle: 20 }, { move: 'stoke' }, { idle: 20 }, { move: 'heave' }, { idle: 30 }, { move: 'slam' }] },
  ],
  special: [{ type: 'coal', boost: 0.22 }],
  titleDefense: null,
  gallery: 'THE FURNACE\'S FIRE FEEDER. HIS SHOVEL FEEDS THE HEAT METER: CUT HIM OFF IN THE MIDDLE OF A SHOVELFUL.',
  medals: { signature: { text: 'SPILL HIS COAL THREE TIMES.', check: 'cueCount', cue: '!exploit:spilledCoal', n: 3 } },
  music: 'stokerWalkup',
};
