// #102 Crucible — Underworld V's champion, the Furnace. The vessel the Furnace melts things in, walking: cast iron, a white-hot slit
// for eyes, a grate in his chest. The HEAT meter down the right edge climbs all round and Crucible feeds on it: when it hits the top
// he OVERHEATS. The screen whites out, he is only a black silhouette on it, and every punch of his hits 25% harder, for five
// seconds; then it vents, and the meter falls back to half. Slip and duck and counter to cool the meter and keep him cold.
// His super is the MELTDOWN. Slip it; hit him on the glint at the top of its windup and the pot cracks.
// Underworld difficulty: 5-frame tells for a heavy (3-frame circuit), adaptive, 10 hearts, one life; a champion.

import { mv, superMove, stats, anims, steps } from '../pantheon/_kit.js';

const W = 5;
const iron = { tell: 'clang' };

export default {
  id: 'crucible',
  name: 'CRUCIBLE',
  short: 'CRUCIBLE',
  nickname: 'THE VESSEL',
  circuit: 'u5',
  rank: 0,
  isChampion: true,
  card: { age: 400, weight: 300, record: '77-0 77KO', hometown: 'THE FURNACE HEART', quote: 'EVERYTHING GETS POURED INTO ME EVENTUALLY. WHY NOT YOU?' },
  lines: { win: 'POUR HIM OUT.', lose: 'THE POT... IS CRACKED...' },

  build: 'heavy',
  palette: 'crucible',
  spriteLayers: 'crucible',

  stats: stats({ health: 500, damageMult: 2.2, stunResistance: 8, starLossChance: 0.65, stunFrames: 54, hitstun: 12 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 24 } }),

  moves: {
    ingot: mv('jab', W, { name: 'INGOT JAB', sfx: iron }),
    cast: mv('hook', W, { name: 'CAST HOOK', sfx: iron }),
    castL: mv('hookL', W, { name: 'CAST HOOK (L)', sfx: iron }),
    pourBlow: mv('body', W, { name: 'POURING BLOW', sfx: iron }),
    forge: mv('upper', W, { name: 'FORGE UPPERCUT', sfx: { tell: 'clang', swing: 'swingHeavy' } }),
    slagging: mv('haymaker', W, { name: 'SLAGGING', windupFrames: 17, counterWindow: [4, 15], starWindow: [4, 8], sfx: { tell: 'rumble', swing: 'crash' } }),
    meltdown: superMove('MELTDOWN', { windupFrames: 22, counterWindow: [5, 19], starWindow: [5, 9], kdWindow: [12, 15], sfx: { tell: 'flame', swing: 'crash' } }),
  },

  patterns: [
    { id: 'ladle', weight: 3, when: { rounds: [1] }, steps: steps('i32 ingot i32 cast i30 pourBlow i32 forge i38 slagging i46 ingot i30 castL i54') },
    { id: 'pouring', weight: 3, steps: steps('i28 castL i26 pourBlow i28 forge i32 ingot i26 cast i30 slagging i48') },
    { id: 'castOut', weight: 2, when: { health: [0, 0.5] }, steps: steps('i22 forge i20 cast i20 castL i22 pourBlow i22 slagging i24 ingot i36') },
  ],

  super: { hit: 'body', move: 'meltdown', golden: 'windup', window: [12, 15], taunt: 50, shout: 'MELTDOWN!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [8, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.35, health: 0.5 }, { upAt: null }],


  exploits: [
    {
      id: 'crackedCasting', type: 'stunTrigger', name: 'A CRACKED CASTING',
      trigger: { state: 'windup', move: 'slagging', counter: true, frames: [8, 11], clean: 26 },
      effect: { stun: 116, hits: 8, star: true, say: 'THE CASTING CRACKS!', sfx: 'clang' },
      hint: { kind: 'visual', text: 'A HAIRLINE CRACK RUNS ACROSS THE POT AT THE TOP OF THE SLAGGING.' },
      scout: 'A COUNTER ON THE MIDDLE FRAMES OF HIS SLAGGING (THE CRACK SHOWS): STUNNED FOR 8 HITS, THE FIRST A STAR.',
    },
    {
      id: 'coldPour', type: 'starTrigger', name: 'A COLD POUR',
      trigger: { star: true, test: 'overheating', state: ['idle', 'block', 'recovery', 'windup'] },
      effect: { stun: 130, hits: 8, say: 'THE POT CRACKS!', sfx: 'shatter' },
      hint: { kind: 'quote', text: '"HOT METAL FEARS ONE THING."', hidden: true },
      scout: 'LAND A STAR PUNCH ON HIM WHILE HE OVERHEATS (THE SCREEN IS WHITE): THE POT CRACKS AND HE IS STUNNED FOR 8 HITS.',
    },
    {
      id: 'hotMitts', type: 'quirk', name: 'HOT MITTS',
      trigger: { on: 'resolved', move: 'forge', result: 'dodged' },
      effect: { open: { frames: 92, anim: 'stunned', comboLimit: 6, star: [0, 36] }, say: 'HE CAN\'T HOLD IT!', sfx: 'hiss' },
      hint: { kind: 'audio', text: 'THE FORGE UPPERCUT RINGS LIKE A HAMMER ON AN ANVIL. WHEN IT MISSES, HIS MITTS RING WITH IT.', hidden: true },
      scout: 'SLIP HIS FORGE UPPERCUT: HIS MITTS RING AND HE IS OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'waitsForCold', type: 'earlyDodge', name: 'WAITS FOR COLD FEET', response: 'hold', lead: 12, moves: ['cast', 'castL', 'forge'], say: 'HE WAITS FOR YOU!',
      scout: 'SLIP EARLY (WELL BEFORE A PUNCH LANDS) AND HE HOLDS THE HOOK OR THE UPPERCUT UNTIL YOUR SLIP RUNS OUT: SLIP LATE.',
    },
    {
      id: 'pourItOn', type: 'getUpMash', name: 'POURS IT ON', response: 'moves', moves: ['slagging'], say: 'POURING IT ON!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HE GOES STRAIGHT INTO THE SLAGGING.',
    },
  ],
  scriptedMoments: [
    { id: 'fullBlast', name: 'FULL BLAST', when: { left: 90 }, say: 'FULL BLAST!', mod: { heat: 0.8 }, steps: [{ idle: 20 }, { move: 'forge' }, { idle: 26 }, { move: 'cast' }, { idle: 26 }, { move: 'slagging' }] },
    { id: 'theCooling', name: 'THE COOLING ROD', when: { health: 0.3 }, say: 'THE ROD IS OUT!', steps: [{ idle: 18 }, { move: 'slagging' }, { idle: 30 }, { move: 'forge' }, { idle: 22 }, { move: 'castL' }, { idle: 22 }, { move: 'slagging' }] },
  ],
  special: [{ type: 'overheat', frames: 300, dmg: 1.25, after: 0.5 }],
  titleDefense: null,
  gallery: 'THE FURNACE\'S CHAMPION. WHEN THE HEAT METER MAXES OUT HE OVERHEATS AND THE SCREEN WHITES OUT: SILHOUETTES ONLY.',
  medals: { signature: { text: 'LAND A STAR PUNCH ON HIM WHILE HE OVERHEATS.', check: 'cueCount', cue: '!exploit:coldPour', n: 1 } },
  music: 'crucibleEntrance',
};
