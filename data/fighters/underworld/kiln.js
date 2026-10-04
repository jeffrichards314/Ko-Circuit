// #88 Kiln — Underworld II, Ashen Fields. A man of fired clay. Hit any one place on him TWICE IN A ROW and he
// hardens it, glazing it white-hot: for a while everything you throw there bounces (and costs you hearts,
// like any block). So do what a potter does: work him over, head and body, head and body. Counters and stuns
// still get through.
// His super is the KILN BURST: he opens his chest and lets it all out. A knockdown: slip it. Counter it on the
// glint and the kiln cracks.
// Underworld difficulty: 6-frame tells (a heavy man's; the circuit's 4), adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, GETUP, steps } from '../pantheon/_kit.js';

const W = 6;
const thump = { tell: 'grunt' };

export default {
  id: 'kiln',
  name: 'KILN',
  short: 'KILN',
  nickname: 'THE FIRED',
  circuit: 'u2',
  rank: 1,
  isChampion: false,
  card: {
    age: 300,
    weight: 296,
    record: '88-0 70KO',
    hometown: 'THE KILN AT THE END OF THE PLAIN',
    quote: 'I WAS SHAPED, DRIED, AND FIRED. NOTHING GETS THROUGH THAT.',
  },
  lines: { win: 'FIRED HARD. FIRED TO LAST.', lose: 'A CRACK... I HAD A CRACK...' },

  build: 'heavy',
  palette: 'kiln',
  spriteLayers: 'kiln',

  stats: stats({ health: 360, damageMult: 2.05, stunResistance: 7, stunFrames: 46, hitstun: 12 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 28 } }),

  moves: {
    stoke: mv('jab', W, { name: 'STOKE', sfx: thump }),
    stokeR: mv('jabR', W, { name: 'STOKE (R)', sfx: thump }),
    slab: mv('hook', W, { name: 'CLAY SLAB', sfx: thump }),
    slabL: mv('hookL', W, { name: 'CLAY SLAB (L)', sfx: thump }),
    bake: mv('bodyR', W, { name: 'BAKE', sfx: thump }),
    press: mv('upper', W, { name: 'HOT PRESS', sfx: { tell: 'grunt', swing: 'swingHeavy' } }),
    firing: mv('haymaker', W, { name: 'FIRING', windupFrames: 16, counterWindow: [5, 15], starWindow: [5, 8], sfx: { tell: 'crackle', swing: 'crash' } }),
    // the super
    kilnBurst: superMove('KILN BURST', { windupFrames: 24, kdWindow: [13, 16], counterWindow: [5, 21], sfx: { tell: 'rumble', swing: 'crash' } }),
  },

  patterns: [
    { id: 'firstFiring', weight: 3, when: { rounds: [1] }, steps: steps('i30 stoke i18 slab i22 bake i34 firing i36 stokeR i18 slabL i44') },
    { id: 'slowBake', weight: 3, steps: steps('i26 stokeR i16 stoke i16 slabL i34 press i20 bake i36 firing i34 slab i44') },
    { id: 'glazing', weight: 2, when: { rounds: [2, 3] }, steps: steps('i22 press i18 slab i14 slabL i28 firing i24 stoke i14 stokeR i16 bake i40') },
  ],

  super: { hit: 'head', move: 'kilnBurst', golden: 'windup', window: [13, 16], taunt: 50, shout: 'KILN BURST!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'crackedGlaze', type: 'stunTrigger', name: 'A CRACKED GLAZE',
      trigger: { state: 'windup', move: 'firing', counter: true, frames: [11, 15] },
      effect: { stun: 108, hits: 6, star: true, say: 'THE GLAZE CRACKS!', sfx: 'crunch' },
      hint: { kind: 'audio', text: 'THE KILN POPS AND CRACKLES AT THE TOP OF THE FIRING.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE FIRING (THE KILN POPS) CRACKS HIS GLAZE: STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'coldSpot', type: 'quirk', name: 'THE COLD SPOT',
      trigger: { on: 'resolved', move: 'press', result: 'dodged' },
      effect: { open: { frames: 84, anim: 'stunned', comboLimit: 5, star: [0, 28] }, say: 'THE DOOR SWINGS OPEN!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'IF THE HOT PRESS MISSES, THE FURNACE DOOR ON HIS CHEST SWINGS OPEN.', hidden: true },
      scout: 'SLIP HIS HOT PRESS UPPERCUT: THE FURNACE DOOR ON HIS CHEST SWINGS OPEN AND HE IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'glazed', type: 'zoneBias', name: 'GLAZES THE ZONE', streak: 2, frames: 300, raise: 'GLAZED!', say: 'IT BOUNCES OFF!',
      scout: 'HIT THE SAME PLACE TWICE IN A ROW AND HE GLAZES IT FOR 12 SECONDS: EVERYTHING THERE BOUNCES. ALTERNATE HEAD AND BODY. (COUNTERS STILL GET THROUGH.)',
    },
  ],
  scriptedMoments: [
    {
      id: 'fullFiring', name: 'THE FULL FIRING', when: { left: 85 }, say: 'THE FULL FIRING!',
      steps: [{ idle: 20 }, { move: 'stoke' }, { idle: 16 }, { move: 'slab' }, { idle: 20 }, { move: 'press' }, { idle: 32 }, { move: 'firing' }],
    },
  ],
  special: [{ type: 'glaze', anti: 'glazed' }],
  titleDefense: null,
  gallery: 'A MAN OF FIRED CLAY. HIT ONE PLACE TWICE AND HE GLAZES IT WHITE-HOT: ALTERNATE HEAD AND BODY.',
  medals: { signature: { text: 'NEVER LET HIM GLAZE ANYTHING.', check: 'noCue', cue: '!anti:glazed' } },
  music: 'kilnWalkup',
};
