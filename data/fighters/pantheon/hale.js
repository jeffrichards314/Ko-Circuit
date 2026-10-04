// #71 Forgemaster Hale — Pantheon V's champion, the Thunder Forge. The master of the forge, and his
// fists are his furnace. They start RED and climb to ORANGE and then WHITE-HOT, a stage every 16 seconds
// of the fight, and each stage hits harder and lets him swing faster (never a shorter tell). The
// heat is on his gloves and cuffs: read it. But he can be cooled: every COUNTER you land drops
// him a stage. Fight him in short, hard exchanges and keep him red.
// His super is the FORGE FALL: he raises both fists and the whole forge with them, then brings it
// down. A knockdown: slip it. Counter it on the glint and the forge drops on him.
// Pantheon V difficulty: 6-frame tells, shuffled and adaptive, hearts 12; a champion.

import { mv, superMove, stats, anims, GETUP, steps } from './_kit.js';

const W = 6;

export default {
  id: 'hale',
  name: 'FORGEMASTER HALE',
  short: 'HALE',
  nickname: 'THE FORGEMASTER',
  circuit: 'p5',
  rank: 0,
  isChampion: true,
  card: {
    age: 63,
    weight: 331,
    record: '77-0 71KO',
    hometown: 'THE THUNDER FORGE',
    quote: 'EVERYTHING BENDS IF YOU HEAT IT ENOUGH. EVERYTHING. INCLUDING YOU.',
  },
  lines: { win: 'THE FIRE WAS NEVER IN QUESTION.', lose: 'THE FORGE... GOES COLD...' },

  build: 'giant',
  palette: 'hale',
  spriteLayers: 'hale',

  stats: stats({ health: 400, damageMult: 2.05, stunResistance: 7, starLossChance: 0.6, stunFrames: 48, hitstun: 12 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 22 } }),

  moves: {
    jab: mv('jab', W, { name: 'FORGED JAB', sfx: { tell: 'clang' } }),
    jabR: mv('jabR', W, { name: 'FORGED CROSS', sfx: { tell: 'clang' } }),
    hook: mv('hook', W, { name: 'TONGS HOOK', sfx: { tell: 'clang' } }),
    hookL: mv('hookL', W, { name: 'TONGS HOOK (L)', sfx: { tell: 'clang' } }),
    bodyR: mv('bodyR', W, { name: 'BELLOWS BLOW', sfx: { tell: 'grunt' } }),
    upper: mv('upper', W, { name: 'FURNACE UPPERCUT', sfx: { tell: 'clang' } }),
    sledge: mv('haymaker', W, { name: 'STRIKE THE ANVIL', windupFrames: 16, counterWindow: [5, 15], starWindow: [5, 8], sfx: { tell: 'clang', swing: 'crash' } }),
    // the super
    forgeFall: superMove('FORGE FALL', { windupFrames: 22, kdWindow: [12, 15], counterWindow: [5, 19], sfx: { tell: 'rumble', swing: 'crash' } }),
  },

  patterns: [
    { id: 'kindling', weight: 3, when: { rounds: [1] }, steps: steps('i28 jab i16 hook i20 bodyR i34 sledge i34 jabR i16 hookL i44') },
    { id: 'bellowsBlast', weight: 3, steps: steps('i24 hookL i14 hook i22 upper i34 jabR i16 jab i20 bodyR i36 sledge i44') },
    { id: 'whiteHeat', weight: 2, when: { rounds: [2, 3] }, steps: steps('i20 upper i18 hook i14 hookL i28 sledge i24 jab i14 jabR i16 bodyR i40') },
  ],

  super: { hit: 'head', move: 'forgeFall', golden: 'windup', window: [12, 15], taunt: 50, shout: 'FORGE FALL!', times: [1, 2] },

  getUpTable: [{ upAt: [9, 9], health: 0.6 }, { upAt: [9, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.3, health: 0.5 }, { upAt: null }],


  exploits: [
    {
      id: 'quench', type: 'stunTrigger', name: 'QUENCHED',
      trigger: { state: 'windup', move: 'sledge', counter: true, frames: [10, 15] },
      effect: { stun: 112, hits: 7, star: true, say: 'QUENCHED!', sfx: 'sizzle' },
      hint: { kind: 'audio', text: 'THE ANVIL RINGS AT THE TOP OF HIS SWING: THE FIRE IS IN HIS ARMS.' },
      scout: 'A COUNTER ON THE LATE FRAMES OF STRIKE THE ANVIL STUNS HIM FOR 7 HITS, THE FIRST A STAR, AND COOLS HIS FISTS A STAGE.',
    },
    {
      id: 'coldSlag', type: 'quirk', name: 'COLD SLAG',
      trigger: { on: 'resolved', move: 'upper', result: 'dodged' },
      effect: { open: { frames: 92, anim: 'stunned', comboLimit: 6, star: [0, 34] }, say: 'COLD SLAG!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'THE FURNACE UPPERCUT PUTS HIS WHOLE HEAT INTO ONE SWING. WHEN IT MISSES, HE\'S HOLLOW.', hidden: true },
      scout: 'SLIP HIS FURNACE UPPERCUT: HE IS HOLLOW AND OPEN FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'burnedGlove', type: 'stunTrigger', name: 'A BURNED GLOVE',
      trigger: { state: 'idle', test: 'whiteHot', height: 'low', clean: 40 },
      effect: { stun: 70, hits: 5, star: true, say: 'HE BURNS HIMSELF!', sfx: 'sizzle' },
      hint: { kind: 'visual', text: 'AT WHITE-HOT HIS OWN GLOVES BURN HIM WHEN HE STOPS.', hidden: true },
      scout: 'A BODY SHOT WHILE HE STANDS STILL AT WHITE-HOT MAKES HIM BURN HIMSELF: STUNNED FOR 5 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'heatSeeps', type: 'turtling', name: 'THE HEAT SEEPS THROUGH', response: 'drain', span: 480, share: 0.45, every: 44, say: 'THE HEAT SEEPS!',
      scout: 'BLOCK TOO MUCH AND THE HEAT SEEPS THROUGH YOUR GUARD: YOU LOSE A HEART EVERY SECOND YOU KEEP IT UP.',
    },
    {
      id: 'hammeredDown', type: 'getUpMash', name: 'HAMMERED DOWN', response: 'harder', punches: 3, mult: 1.3, say: 'HAMMERED DOWN!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HIS NEXT 3 PUNCHES HIT 30% HARDER.',
    },
  ],
  scriptedMoments: [
    {
      id: 'fullBlast', name: 'FULL BLAST', when: { left: 90 }, say: 'FULL BLAST!',
      steps: [{ idle: 18 }, { move: 'hook' }, { idle: 16 }, { move: 'hookL' }, { idle: 22 }, { move: 'upper' }, { idle: 30 }, { move: 'sledge' }],
    },
    { id: 'coolingRod', name: 'THE COOLING ROD', when: { health: 0.3 }, say: 'HE\'S RUNNING HOT!', steps: [{ idle: 16 }, { move: 'sledge' }, { idle: 24 }, { move: 'jab' }, { move: 'jabR' }] },
  ],
  special: [
    {
      type: 'forge', start: 1, max: 3, rate: 16, dmg: 0.12, rec: 0.06,
      names: [
        { label: 'FISTS: RED', color: [31, 12, 6], shout: 'RED' },
        { label: 'FISTS: ORANGE', color: [31, 20, 4], shout: 'ORANGE HOT!' },
        { label: 'FISTS: WHITE-HOT', color: [31, 30, 22], shout: 'WHITE-HOT!' },
      ],
    },
  ],
  titleDefense: null,
  gallery: 'THE MASTER OF THE THUNDER FORGE. HIS FISTS HEAT FROM RED TO WHITE-HOT: EVERY COUNTER COOLS THEM A STAGE.',
  medals: { signature: { text: 'COOL HIM DOWN THREE TIMES WITH COUNTERS.', check: 'cueCount', cue: '!cooled', n: 3 } },
  music: 'haleEntrance',
};
