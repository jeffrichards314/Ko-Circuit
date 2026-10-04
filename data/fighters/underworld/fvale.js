// #97 Fallen Vale — Underworld IV. Maestro Vale kept the tempo of his symphony, a step faster every half minute. The Hall of the Fallen
// has taken the rest away: nothing is left but the tempo, and it steps up every FIFTEEN seconds (twelve real ones) instead of
// every thirty, ANDANTE to PRESTISSIMO before the round is half over, and each round starts a step further on. His windups and
// the gaps between his moves shrink with it. Knock him down while the music is slow.
// His CRESCENDO is three punches, each faster than the last: slip one side, slip the other, slip either. FORTISSIMO, his super, is
// both gloves raised: step in, and hit him on the glint.
// Underworld difficulty: 3-frame tells (a lean fighter), adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, steps, GETUP } from '../pantheon/_kit.js';
import maestro from '../maestro.js';

const W = 3;
const tick = { tell: 'tick' };

export default {
  id: 'fvale',
  name: 'FALLEN VALE',
  short: 'VALE',
  nickname: 'THE LAST MOVEMENT',
  circuit: 'u4',
  rank: 1,
  isChampion: false,
  card: { age: 58, weight: 149, record: '52-4 30KO', hometown: 'THE EMPTY HALL', quote: 'THE PIECE HAS NO END. IT ONLY GETS FASTER.' },
  lines: { win: 'BRAVISSIMO. THERE IS NO ENCORE.', lose: 'THE... TEMPO... SLOWS...' },

  build: 'lean',
  palette: 'fvale',
  spriteLayers: 'maestro',

  stats: stats({ health: 350, damageMult: 1.95, stunResistance: 5, starLossChance: 0.6, stunFrames: 48, hitstun: 11 }),
  anims: { ...anims({ idle: { frames: ['idle1', 'idle2'], rate: 20 } }), taunt: maestro.anims.taunt, victory: maestro.anims.victory },
  guardCounter: 'coda', // (a slow answer to punches into his guard)

  moves: {
    stac: mv('jab', W, { name: 'STACCATO', sfx: tick }),
    lega: mv('hook', W, { name: 'LEGATO', sfx: tick }),
    lega2: mv('hookL', W, { name: 'LEGATO (L)', sfx: tick }),
    pizz: mv('body', W, { name: 'PIZZICATO', sfx: tick }),
    cresc1: mv('hookL', W, { name: 'CRESCENDO', windupFrames: 9, recoveryFrames: 6, counterWindow: [3, 8], starWindow: null, punishStar: null, noFake: true, sfx: tick }),
    cresc2: mv('hook', W, { name: 'CRESCENDO (2)', windupFrames: 10, recoveryFrames: 6, counterWindow: null, starWindow: null, noFake: true, sfx: { tell: 'ding' } }),
    cresc3: mv('upper', W, { name: 'CRESCENDO (3)', windupFrames: 12, recoveryFrames: 34, counterWindow: null, starWindow: null, noFake: true, sfx: { tell: 'ding', swing: 'swingHeavy' } }),
    // the answer to a repeated combo: a slow, sharp uppercut on the beat you gave him
    coda: mv('upper', W, { name: 'CODA', windupFrames: 12, recoveryFrames: 34, damage: 16, counterWindow: [4, 10], starWindow: [4, 7], noFake: true, punishStar: ['dodged'], sfx: { tell: 'baton', swing: 'swingHeavy' } }),
    fortissimo: superMove('FORTISSIMO', { windupFrames: 17, counterWindow: [3, 14], starWindow: [3, 8], sfx: { tell: 'cymbal', swing: 'crash' } }),
  },

  patterns: [
    { id: 'andante', weight: 3, when: { rounds: [1] }, steps: steps('i30 stac i26 lega i24 pizz i30 cresc1 cresc2 cresc3 i40 lega2 i30 stac i44') },
    { id: 'allegro', weight: 3, steps: steps('i24 pizz i22 stac i22 lega2 i24 cresc1 cresc2 cresc3 i34 stac i24 lega i26 pizz i40') },
    { id: 'presto', weight: 2, when: { health: [0, 0.5] }, steps: steps('i20 cresc1 cresc2 cresc3 i26 pizz i18 stac i20 lega i20 lega2 i26 cresc1 cresc2 cresc3 i34') },
  ],

  super: { hit: 'head', move: 'fortissimo', golden: 'windup', window: [10, 13], from: 'heldNote', taunt: 40, shout: 'FORTISSIMO!', times: [1, 2] },

  getUpTable: GETUP, // (Phase F: the Pantheon's and the upper Underworld's table; these had the Storm circuit's 6-8)


  exploits: [
    {
      id: 'pageTurns', type: 'stunTrigger', name: 'A PAGE TURNS',
      trigger: { since: { event: 'tempoUp', frames: [0, 10] }, state: ['idle', 'block', 'recovery'] },
      effect: { stun: 98, hits: 6, say: 'HE LOST HIS PLACE!', sfx: 'ding' },
      hint: { kind: 'audio', text: 'A DING WHEN THE TEMPO STEPS UP: HE TURNS THE PAGE OF HIS SCORE, AND HE IS NOT LOOKING.' },
      scout: 'HIT HIM IN THE FIRST 10 FRAMES AFTER THE TEMPO STEPS UP (THE DING): HE LOSES HIS PLACE AND IS STUNNED FOR 6 HITS.',
    },
    {
      id: 'droppedBaton', type: 'quirk', name: 'A DROPPED BATON',
      trigger: { on: 'resolved', move: 'cresc3', result: 'dodged' },
      effect: { open: { frames: 92, anim: 'stunned', comboLimit: 6, star: [0, 38] }, say: 'HE DROPPED THE BATON!', sfx: 'clang' },
      hint: { kind: 'visual', text: 'THE LAST NOTE OF THE CRESCENDO THROWS THE WHOLE ORCHESTRA AFTER IT.', hidden: true },
      scout: 'SLIP THE THIRD PUNCH OF HIS CRESCENDO: HE DROPS THE BATON AND IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'interrupted', type: 'rushing', name: 'THE CONDUCTOR IS INTERRUPTED', span: 150, count: 3, counter: ['coda'], say: 'CODA!',
      scout: 'PUNCH INTO HIS GUARD THREE TIMES IN QUICK SUCCESSION AND HE CUTS YOU OFF WITH THE CODA, A SLOW UPPERCUT (SLIP IT).',
    },
  ],
  scriptedMoments: [
    { id: 'coda', name: 'THE CODA', when: { left: 22 }, say: 'THE CODA!', steps: [{ idle: 14 }, { move: 'coda' }, { idle: 32 }, { move: 'cresc1' }, { move: 'cresc2' }, { move: 'cresc3' }] },
  ],
  special: [{
    type: 'tempo', every: 12, minWindup: 9, roundStep: 1, // every 12 real seconds (a half minute of the clock)
    scales: [1, 0.92, 0.85, 0.79, 0.74, 0.7],
    names: ['ANDANTE', 'MODERATO', 'ALLEGRO', 'VIVACE', 'PRESTO', 'PRESTISSIMO'],
  }],
  titleDefense: null,
  gallery: 'THE WORLD CHAMPION, FALLEN. THE TEMPO STEPS UP EVERY FIFTEEN SECONDS AND EACH ROUND STARTS A STEP FASTER.',
  medals: { signature: { text: 'HOLD HIM TO HIS NOTE: COUNTER THE FORTISSIMO LATE.', check: 'cueCount', cue: '!exploit:heldNote', n: 1 } },
  music: 'fvaleWalkup',
};
