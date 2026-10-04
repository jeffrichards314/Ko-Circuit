// #86 Cinder — Underworld II, Ashen Fields. What's left of a man after the fire: ash and a few coals. Ash falls
// all over this plain and hangs round him in a haze that veils his body: his tells are HARD TO SEE. Listen
// instead: every windup starts with a crackle, and a gust clears the air now and then (a badge says when).
// He's fast (4-frame tells) and light. His super is the ASHFALL: everything he has left, at once. A knockdown:
// slip it. Counter it on the glint and it comes down on him.
// Underworld difficulty: 4-frame tells, adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, GETUP, steps } from '../pantheon/_kit.js';

const W = 4;
const ember = { tell: 'ember' };

export default {
  id: 'cinder',
  name: 'CINDER',
  short: 'CINDER',
  nickname: 'THE LAST COAL',
  circuit: 'u2',
  rank: 3,
  isChampion: false,
  card: {
    age: 40,
    weight: 149,
    record: '44-1 44KO',
    hometown: 'WHAT THE FIRE LEFT',
    quote: 'I WAS SOMEONE ONCE. NOW I\'M WHAT FLOATS. WHAT SETTLES. WHAT YOU BREATHE.',
  },
  lines: { win: 'ONE MORE HANDFUL OF DUST.', lose: 'I... BLOW AWAY...' },

  build: 'lean',
  palette: 'cinder',
  spriteLayers: 'cinder',

  stats: stats({ health: 310, damageMult: 1.9, stunResistance: 4, stunFrames: 42, hitstun: 10 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 16 } }),

  moves: {
    flick: mv('jab', W, { name: 'EMBER FLICK', sfx: ember }),
    flickR: mv('jabR', W, { name: 'EMBER CROSS', sfx: ember }),
    lash: mv('hook', W, { name: 'ASH LASH', sfx: ember }),
    lashL: mv('hookL', W, { name: 'ASH LASH (L)', sfx: ember }),
    singe: mv('bodyR', W, { name: 'SINGE', sfx: ember }),
    kindle: mv('upper', W, { name: 'KINDLE', sfx: ember }),
    // the pyre: the ash lifts off him as it peaks (the `clear` flag: the haze thins)
    pyre: mv('haymaker', W, { name: 'PYRE', windupFrames: 14, counterWindow: [4, 12], starWindow: [4, 7], clear: true, sfx: { tell: 'ember', swing: 'swingHeavy' } }),
    // the super
    ashfall: superMove('ASHFALL', { windupFrames: 20, kdWindow: [11, 14], counterWindow: [5, 17], clear: true, sfx: { tell: 'rumble', swing: 'crash' } }),
  },

  patterns: [
    { id: 'kindling', weight: 3, when: { rounds: [1] }, steps: steps('i26 flick i14 flickR i18 lash i28 pyre i34 singe i20 kindle i40') },
    { id: 'smolder', weight: 3, steps: steps('i22 flickR i12 flick i16 lashL i26 singe i18 kindle i30 pyre i32 lash i14 lashL i40') },
    { id: 'firestorm', weight: 2, when: { rounds: [2, 3] }, steps: steps('i20 flick i12 flickR i12 lash i14 lashL i26 kindle i20 pyre i32 singe i38') },
  ],

  super: { hit: 'head', move: 'ashfall', golden: 'windup', window: [11, 14], taunt: 46, shout: 'ASHFALL!', times: [1, 2] },

  getUpTable: GETUP,


  exploits: [
    {
      id: 'coughingFit', type: 'quirk', name: 'A COUGHING FIT',
      trigger: { on: 'resolved', move: 'kindle', result: 'dodged' },
      effect: { open: { frames: 86, anim: 'stunned', comboLimit: 5, star: [0, 30] }, say: 'HE CHOKES ON IT!', sfx: 'pant' },
      hint: { kind: 'audio', text: 'A KINDLE THAT MISSES SENDS UP A CLOUD, AND HE COUGHS.' },
      scout: 'SLIP HIS KINDLE UPPERCUT: THE CLOUD IT THROWS UP CHOKES HIM AND HE IS OPEN FOR 5 HITS, THE FIRST A STAR.',
    },
    {
      id: 'bankedFire', type: 'stunTrigger', name: 'BANKED FIRE',
      trigger: { state: 'windup', move: 'pyre', counter: true, frames: [9, 12] },
      effect: { stun: 92, hits: 5, star: true, say: 'THE FIRE DIES!', sfx: 'hiss' },
      hint: { kind: 'visual', text: 'THE ASH LIFTS OFF HIM AS THE PYRE PEAKS: FOR A MOMENT YOU CAN SEE HIM.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF THE PYRE (THE ASH LIFTS OFF HIM) PUTS HIS FIRE OUT: STUNNED FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'smellsARepeat', type: 'comboRepeat', name: 'SMELLS A REPEAT', counter: ['kindle'], gap: 45, delay: 14, say: 'HE SMELLS IT!',
      scout: 'THROW THE SAME TWO-PUNCH COMBO TWICE IN A ROW AND HE SMELLS IT AND ANSWERS AT ONCE WITH THE KINDLE.',
    },
  ],
  scriptedMoments: [
    {
      id: 'cinderstorm', name: 'CINDERSTORM', when: { left: 78 }, say: 'CINDERSTORM!',
      steps: [{ idle: 16 }, { move: 'flick' }, { idle: 12 }, { move: 'flickR' }, { idle: 14 }, { move: 'lash' }, { idle: 22 }, { move: 'pyre' }],
    },
  ],
  special: [{ type: 'ash', density: 0.42, gustEvery: 380, gustLen: 50, flakes: 34 }],
  titleDefense: null,
  gallery: 'WHAT THE FIRE LEFT: ASH ON HIS BODY, A CRACKLE IN HIS TELLS. THE ASH VEILS HIM, THE CRACKLE GIVES HIM AWAY.',
  medals: { signature: { text: 'SLIP THE KINDLE THREE TIMES.', check: 'moveResult', move: 'kindle', result: 'dodged', n: 3 } },
  music: 'cinderWalkup',
};
