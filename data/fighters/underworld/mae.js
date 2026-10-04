// #83 Drowned Mae — Underworld I, Ferryman's Shore. She went into the water at nine and this is where she
// still is. The canvas around her is WET: every punch of yours that misses (into her guard, into thin air) makes
// you slip and stagger for a moment, and a slipped boxer can't slip a punch. So don't swing at her gloves. Wait
// for her tell, or slip her punch, and then hit her where she's open. She's fast (4-frame tells), light on
// her feet and never hits hard: it's the fall that hurts.
// Her super is the KISS OF THE DEEP: both arms out, and all the water in the world behind them. A knockdown:
// slip it. Counter it on the glint and she goes under first.
// Underworld difficulty: 4-frame tells, adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, GETUP, steps } from '../pantheon/_kit.js';

const W = 4;
const drip = { tell: 'drip' };

export default {
  id: 'mae',
  name: 'DROWNED MAE',
  short: 'MAE',
  nickname: 'THE UNDERTOW',
  circuit: 'u1',
  rank: 2,
  isChampion: false,
  card: {
    age: 9,
    weight: 118,
    record: '31-0 18KO',
    hometown: 'THE BOTTOM OF THE RIVER',
    quote: 'THE FLOOR IS WET. IT\'S ALWAYS WET. HAVE YOU EVER TRIED TO STAND UP IN A RIVER?',
  },
  lines: { win: 'DOWN YOU GO. IT ISN\'T SO BAD.', lose: 'I CAN SEE THE SURFACE...' },

  build: 'lean',
  palette: 'mae',
  spriteLayers: 'mae',

  stats: stats({ health: 300, damageMult: 1.85, stunResistance: 4, stunFrames: 42, hitstun: 10 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 16 } }),

  moves: {
    slap: mv('jab', W, { name: 'SLAP', sfx: drip }),
    backhand: mv('jabR', W, { name: 'BACKHAND', sfx: drip }),
    drift: mv('hook', W, { name: 'DRIFT HOOK', sfx: drip }),
    driftL: mv('hookL', W, { name: 'DRIFT HOOK (L)', sfx: drip }),
    undertow: mv('bodyR', W, { name: 'UNDERTOW', sfx: drip }),
    riptide: mv('upper', W, { name: 'RIPTIDE', windupFrames: 9, counterWindow: [3, 8], starWindow: [3, 5], sfx: { tell: 'gurgle', swing: 'swingHeavy' } }),
    // a wave along the floor: only a duck gets over it
    spray: mv('sweep', W, { name: 'BREAKER', windupFrames: 9, counterWindow: [3, 7], sfx: { tell: 'splash', swing: 'swingHeavy' } }),
    // her answer to a swinger: slow enough to slip after the stumble has passed
    pull: mv('body', W, { name: 'TIDE PULL', windupFrames: 14, counterWindow: [4, 12], starWindow: null, sfx: { tell: 'splash', swing: 'whiff' } }),
    // the super
    kiss: superMove('KISS OF THE DEEP', { windupFrames: 22, kdWindow: [12, 15], counterWindow: [5, 19], sfx: { tell: 'gurgle', swing: 'crash' } }),
  },
  guardCounter: 'pull',

  patterns: [
    { id: 'ripples', weight: 3, when: { rounds: [1] }, steps: steps('i26 slap i14 backhand i18 drift i28 spray i34 undertow i20 riptide i40') },
    { id: 'currents', weight: 3, steps: steps('i22 backhand i12 slap i16 driftL i24 undertow i18 spray i34 drift i14 riptide i40') },
    { id: 'flood', weight: 2, when: { rounds: [2, 3] }, steps: steps('i20 slap i12 backhand i12 drift i14 driftL i26 riptide i22 spray i32 undertow i40') },
  ],

  super: { hit: 'body', move: 'kiss', golden: 'windup', window: [12, 15], taunt: 48, shout: 'KISS OF THE DEEP!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'dryFooting', type: 'stunTrigger', name: 'DRY FOOTING',
      trigger: { state: 'windup', move: 'riptide', counter: true, frames: [6, 8] },
      effect: { stun: 96, hits: 5, star: true, say: 'SHE SLIPS!', sfx: 'splash' },
      hint: { kind: 'audio', text: 'A SLOW GURGLE AS THE RIPTIDE BUILDS UNDER HER FEET.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE RIPTIDE MAKES HER SLIP ON HER OWN WATER: STUNNED FOR 5 HITS, THE FIRST A STAR.',
    },
    {
      id: 'brokenBreaker', type: 'quirk', name: 'THE BREAKER BREAKS',
      trigger: { on: 'resolved', move: 'spray', result: 'ducked' },
      effect: { open: { frames: 76, anim: 'stunned', comboLimit: 5, star: [0, 26] }, say: 'THE WAVE BREAKS ON HER!', sfx: 'splash' },
      hint: { kind: 'visual', text: 'A BREAKER YOU DUCK CRASHES BACK OVER HER.', hidden: true },
      scout: 'DUCK THE BREAKER: THE WAVE CRASHES BACK OVER HER AND SHE IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'readsTheWater', type: 'rushing', name: 'READS THE WATER', count: 2, span: 150, counter: ['pull'], say: 'SHE FEELS YOU COMING!',
      scout: 'SWING AT HER TWICE IN QUICK SUCCESSION WHEN SHE ISN\'T OPEN AND THE WATER TELLS HER: SHE ANSWERS AT ONCE WITH THE TIDE PULL.',
    },
  ],
  scriptedMoments: [
    {
      id: 'risingWater', name: 'THE WATER RISES', when: { left: 80 }, say: 'THE WATER RISES!',
      steps: [{ idle: 16 }, { move: 'slap' }, { idle: 14 }, { move: 'drift' }, { idle: 16 }, { move: 'spray' }, { idle: 34 }, { move: 'riptide' }],
    },
  ],
  special: [{ type: 'wet', frames: 10, puddles: [[58, 206, 15], [190, 210, 13], [120, 216, 11]] }],
  titleDefense: null,
  gallery: 'A DROWNED GIRL AND A WET CANVAS. EVERY PUNCH THAT MISSES MAKES YOU SLIP.',
  medals: { signature: { text: 'NEVER SLIP ON HER CANVAS.', check: 'noCue', cue: '!slipped' } },
  music: 'maeWalkup',
};
