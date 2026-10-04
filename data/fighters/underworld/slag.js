// #101 Slag — Underworld V. Molten rock in the shape of a man, crust on the outside and the Furnace's own heat under it.
// HITTING HIM COSTS YOU HEARTS: a punch that touches him while he's hot (in his stance, guarding, showing off, or thrown too early into
// a windup) burns you for 2. Right after he throws a punch he has cooled (the cracks go dull, a COOLED badge), and he stays cooled
// while he is hurt: slip a punch and punish it, counter a windup, or hit an opening, and it costs you nothing.
// Throw jabs at him while he's hot and the crust throws them back: a LAVA SPLASH, a slow uppercut (slip it).
// His super is MAGMA FLOW: slip it, and hit him on the glint in its recovery.
// Underworld difficulty: 5-frame tells for a giant (3-frame circuit), adaptive, 10 hearts, one life.

import { mv, superMove, stats, anims, steps } from '../pantheon/_kit.js';

const W = 5;
const lava = { tell: 'gurgle' };

export default {
  id: 'slag',
  name: 'SLAG',
  short: 'SLAG',
  nickname: 'THE MOLTEN MAN',
  circuit: 'u5',
  rank: 1,
  isChampion: false,
  card: { age: 300, weight: 370, record: '19-0 19KO', hometown: 'THE FURNACE MOUTH', quote: 'YOU CAN\'T HIT WHAT BURNS YOU.' },
  lines: { win: 'COOL DOWN.', lose: 'I... SET... HARD...' },

  build: 'giant',
  palette: 'slag',
  spriteLayers: 'slag',

  stats: stats({ health: 440, damageMult: 2.1, stunResistance: 7, starLossChance: 0.65, stunFrames: 54, hitstun: 12 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 26 } }),

  moves: {
    lash: mv('jab', W, { name: 'LAVA LASH', sfx: lava }),
    lashR: mv('jabR', W, { name: 'LAVA CROSS', sfx: lava }),
    splatterR: mv('bodyR', W, { name: 'SPLATTER (R)', sfx: lava }),
    pour: mv('hook', W, { name: 'MOLTEN HOOK', windupFrames: 8, counterWindow: [3, 7], starWindow: [3, 6], damage: 15, sfx: { tell: 'gurgle', swing: 'swingHeavy' } }),
    splatter: mv('body', W, { name: 'SPLATTER', sfx: lava }),
    eruption: mv('haymaker', W, { name: 'ERUPTION', windupFrames: 16, counterWindow: [4, 14], starWindow: [4, 7], sfx: { tell: 'rumble', swing: 'crash' } }),
    splash: mv('upper', W, { name: 'LAVA SPLASH', windupFrames: 12, counterWindow: [4, 10], starWindow: [4, 7], damage: 16, punishStar: ['dodged'], noFake: true, sfx: { tell: 'gurgle', swing: 'swingHeavy' } }),
    magmaFlow: superMove('MAGMA FLOW', { windupFrames: 20, counterWindow: [5, 17], starWindow: [5, 8], sfx: { tell: 'rumble', swing: 'crash' } }),
  },

  patterns: [
    { id: 'seep', weight: 3, when: { rounds: [1] }, steps: steps('i34 lash i36 splatter i32 pour i40 eruption i44 lashR i30 pour i54') },
    { id: 'flow', weight: 3, steps: steps('i28 splatterR i28 pour i30 lash i34 eruption i36 splatter i26 pour i50') },
    { id: 'meltdown', weight: 2, when: { health: [0, 0.5] }, steps: steps('i24 pour i22 splatter i22 eruption i26 lash i22 pour i22 eruption i36') },
  ],

  super: { hit: 'head', move: 'magmaFlow', golden: 'recovery', window: [10, 13], taunt: 46, shout: 'MAGMA FLOW!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [9, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.3, health: 0.5 }, { upAt: null }],


  exploits: [
    {
      id: 'crustCracks', type: 'quirk', name: 'THE CRUST CRACKS',
      trigger: { on: 'resolved', move: 'eruption', result: 'dodged' },
      effect: { open: { frames: 104, anim: 'stunned', comboLimit: 7, star: [0, 40] }, say: 'THE CRUST CRACKS!', sfx: 'crash' },
      hint: { kind: 'audio', text: 'A LOW RUMBLE BEFORE THE ERUPTION. WHEN IT MISSES, IT CRACKS HIS OWN CRUST.' },
      scout: 'SLIP HIS ERUPTION (THE SLOW OVERHEAD WITH THE RUMBLE): THE CRUST CRACKS AND HE IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'doused', type: 'stunTrigger', name: 'DOUSED',
      trigger: { state: 'windup', move: 'eruption', counter: true, frames: [10, 13], clean: 26 },
      effect: { stun: 112, hits: 8, star: true, say: 'DOUSED!', sfx: 'hiss' },
      hint: { kind: 'visual', text: 'THE CRACKS GO DARK FOR A MOMENT AT THE TOP OF THE ERUPTION: HE IS GATHERING IT.', hidden: true },
      scout: 'A COUNTER ON THE MIDDLE FRAMES OF HIS ERUPTION: HE IS DOUSED, STUNNED FOR 8 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'crustThrowsBack', type: 'jabSpam', name: 'THE CRUST THROWS IT BACK', streak: 4, gap: 46, counter: 'splash', say: 'LAVA SPLASH!',
      scout: 'JAB HIM FOUR TIMES IN A ROW AND THE CRUST SPLASHES THE FOURTH BACK: A SLOW UPPERCUT (SLIP IT).',
    },
  ],
  scriptedMoments: [
    { id: 'magmaChamber', name: 'THE MAGMA CHAMBER', when: { left: 76 }, say: 'THE MAGMA CHAMBER!', steps: [{ idle: 22 }, { move: 'eruption' }, { idle: 34 }, { move: 'pour' }, { idle: 28 }, { move: 'eruption' }] },
  ],
  special: [{ type: 'molten', hearts: 2, cool: 40 }],
  titleDefense: null,
  gallery: 'THE MOLTEN MAN. HITTING HIM COSTS HEARTS UNLESS HE HAS JUST THROWN A PUNCH: PUNISH, DON\'T POKE.',
  medals: { signature: { text: 'FINISH THE FIGHT WITHOUT BURNING YOURSELF ON HIM.', check: 'noCue', cue: '!scorched' } },
  music: 'slagWalkup',
};
