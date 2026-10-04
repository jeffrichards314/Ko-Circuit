// #82 Oarsman Grue — Underworld I, Ferryman's Shore. The Ferryman's rower: he has pulled the dead across
// this water since before there was a shore, and he fights the way he rows. Long, low strokes with the oar
// held across his body: the LONG SWEEP, and the BACKSWEEP on the return, and both have to be DUCKED (you
// cannot block a whole oar). Between strokes he pokes with the blade. Slip the pokes, duck the strokes.
// His super is the DROWNING SWEEP: a stroke with all of the river behind it. A knockdown: duck it. Counter it
// on the glint and the oar catches a crab and drags him under.
// Underworld difficulty: 6-frame tells (a heavy man's; the circuit's 4), adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, GETUP, steps } from '../pantheon/_kit.js';

const W = 6;
const creak = { tell: 'creak' };

export default {
  id: 'grue',
  name: 'OARSMAN GRUE',
  short: 'GRUE',
  nickname: 'THE ROWER',
  circuit: 'u1',
  rank: 3,
  isChampion: false,
  card: {
    age: 61,
    weight: 271,
    record: '99-0 95KO',
    hometown: 'THE BLACK WATER',
    quote: 'ONE STROKE FOR EVERY SOUL. I NEVER LOST COUNT. I NEVER LOST ONE.',
  },
  lines: { win: 'AND ANOTHER FOR THE BOAT.', lose: 'THE OAR... IT SLIPPED...' },

  build: 'heavy',
  palette: 'grue',
  spriteLayers: 'grue',

  stats: stats({ health: 340, damageMult: 2.05, stunResistance: 6, stunFrames: 46, hitstun: 12 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 26 } }),

  moves: {
    poke: mv('jab', W, { name: 'OAR THRUST', sfx: creak }),
    pokeR: mv('jabR', W, { name: 'OAR THRUST (R)', sfx: creak }),
    hookL: mv('hookL', W, { name: 'OAR SWING (L)', sfx: creak }),
    bodyR: mv('bodyR', W, { name: 'BILGE JAB', sfx: { tell: 'grunt' } }),
    // the strokes: the whole oar comes round low, and only a duck gets under it
    sweep: mv('sweep', W, { name: 'LONG SWEEP', windupFrames: 15, activeFrames: 9, recoveryFrames: 44, damage: 16, counterWindow: [4, 13], starWindow: null, sfx: { tell: 'creak', swing: 'swingHeavy' } }),
    backSweep: mv('sweep', W, { name: 'BACKSWEEP', windupFrames: 12, activeFrames: 9, recoveryFrames: 46, damage: 16, counterWindow: [3, 10], starWindow: null,
      sfx: { tell: 'creak', swing: 'swingHeavy' }, animation: { windup: ['sweepLTell'], active: ['sweepL1', 'sweepL2'], recovery: ['sweepL2', 'idle1'] } }),
    // the super
    drowningSweep: superMove('DROWNING SWEEP', { windupFrames: 24, avoidBy: ['duck'], counterWindow: [5, 20], starWindow: null, kdWindow: [13, 16], punishStar: ['ducked'],
      sfx: { tell: 'rumble', swing: 'crash' }, animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'idle1'] } }),
  },

  patterns: [
    { id: 'stroke', weight: 3, when: { rounds: [1] }, steps: steps('i30 poke i18 hookL i24 sweep i34 bodyR i22 pokeR i20 backSweep i46') },
    { id: 'pullTogether', weight: 3, steps: steps('i26 pokeR i16 poke i22 sweep i36 backSweep i32 hookL i18 bodyR i44') },
    { id: 'rowingSong', weight: 2, when: { rounds: [2, 3] }, steps: steps('i22 sweep i34 backSweep i30 poke i14 pokeR i16 hookL i36 sweep i46') },
  ],

  super: { hit: 'head', move: 'drowningSweep', golden: 'windup', window: [13, 16], taunt: 50, shout: 'DROWNING SWEEP!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'oarStuck', type: 'quirk', name: 'THE OAR STICKS',
      trigger: { on: 'resolved', move: 'backSweep', result: 'ducked' },
      effect: { open: { frames: 92, anim: 'stunned', comboLimit: 6, star: [0, 32] }, say: 'THE OAR STICKS!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'THE BACKSWEEP DIGS THE BLADE INTO THE DECK WHEN IT MISSES.' },
      scout: 'DUCK THE BACKSWEEP: THE OAR STICKS IN THE DECK AND HE IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'outOfTime', type: 'stunTrigger', name: 'ROWING OUT OF TIME',
      trigger: { state: 'windup', move: 'sweep', counter: true, frames: [10, 13] },
      effect: { stun: 100, hits: 6, star: true, say: 'OUT OF TIME!', sfx: 'crunch' },
      hint: { kind: 'audio', text: 'THE OAR CREAKS AT THE END OF THE LONG SWEEP\'S BACKSWING.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE LONG SWEEP\'S BACKSWING KNOCKS HIM OUT OF TIME: STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'followsTheSlip', type: 'dodgeBias', name: 'FOLLOWS THE SLIP', moves: ['poke', 'pokeR'], min: 6, share: 0.75, say: 'THE OAR FOLLOWS YOU!',
      scout: 'SLIP THE SAME WAY OVER AND OVER AND THE OAR THRUST COMES ROUND THAT SIDE: SLIP THE OTHER WAY.',
    },
  ],
  scriptedMoments: [
    {
      id: 'fullStroke', name: 'THE FULL STROKE', when: { left: 75 }, say: 'THE FULL STROKE!',
      steps: [{ idle: 18 }, { move: 'poke' }, { idle: 16 }, { move: 'sweep' }, { idle: 34 }, { move: 'backSweep' }, { idle: 30 }, { move: 'hookL' }],
    },
  ],
  special: [],
  titleDefense: null,
  gallery: 'THE FERRYMAN\'S OARSMAN. HIS SWEEPS COME LOW WITH A WHOLE OAR BEHIND THEM: DUCK THEM.',
  medals: { signature: { text: 'DUCK THE LONG SWEEP THREE TIMES.', check: 'moveResult', move: 'sweep', result: 'ducked', n: 3 } },
  music: 'grueWalkup',
};
