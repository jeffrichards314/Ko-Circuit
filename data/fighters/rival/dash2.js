// Rival fight II: Dash Maddox, after the Major title (§11b). New trunks, a
// sponsor, and a new trick he picked up under the Major's camera flashes: the
// FLASHBULB UPPERCUT. A glint pops on his glove like a flashbulb, then the
// uppercut: a one-hit knockdown (Major rules). Slip it. The glint is also his
// golden chance: counter on the brightest flash and he's the one going down.
// Major-circuit difficulty: 20-frame tells, light variation. He still reads
// repeated punches.
import { baseMoves, knowItAll, flashbulb, DASH_ANIMS, DASH_CARD, dashGrudge, trashTalk, trashTalkExploit, readsYou } from './moves.js';

const W = 20;

export default {
  id: 'dash2',
  name: 'DASH MADDOX',
  short: 'DASH',
  nickname: 'THE PRODIGY',
  circuit: 'rival2',
  rank: 0,
  isChampion: false,
  rival: 2,
  card: { ...DASH_CARD, weight: 160, record: '15-0 12KO', quote: 'I GOT A SPONSOR. YOU GOT A TRAINER WITH A BIKE. SMILE FOR THE CAMERAS.' },
  lines: {
    win: 'SAY CHEESE. THAT ONE\'S GOING ON MY POSTER.',
    lose: 'THE FLASH... WAS IN MY EYES...',
  },

  build: 'medium',
  palette: 'dash2',
  spriteLayers: 'dash2',

  stats: {
    health: 185,
    damageMult: 1.25,
    stunResistance: 2,
    heartDrainOnBlock: 2,
    starLossChance: 0.45,
    comboLimit: 3,
    stunComboLimit: 5,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 48,
    hitstun: 13,
    betweenRoundHeal: 0.2,
  },

  anims: DASH_ANIMS,

  moves: { ...baseMoves(W), ...knowItAll(W), ...flashbulb(W) },

  patterns: [
    {
      id: 'redCarpet', weight: 3,
      when: { rounds: [1] },
      steps: [
        { idle: 48 }, { move: 'showJab' }, { idle: 36 }, { move: 'cheapShot' }, { idle: 36 }, { move: 'flashbulb' },
        { idle: 44 }, { move: 'smartCross' }, { idle: 30 }, { move: 'knowItAll' }, { idle: 48 }, { taunt: 44 },
      ],
    },
    {
      id: 'pressRow', weight: 2,
      steps: [
        { idle: 40 }, { move: 'smartCross' }, { idle: 24 }, { move: 'smartCross' }, { idle: 34 }, { move: 'knowItAll' },
        { idle: 36 }, { move: 'cheapShot' }, { idle: 30 }, { move: 'showJab' }, { idle: 44 }, { taunt: 40 },
      ],
    },
    {
      id: 'afterParty', weight: 3,
      when: { rounds: [2, 3] },
      steps: [
        { idle: 34 }, { move: 'flashbulb' }, { idle: 30 }, { move: 'showJab' }, { idle: 22 }, { move: 'cheapShot' },
        { idle: 30 }, { move: 'knowItAll' }, { idle: 26 }, { move: 'smartCross' }, { idle: 40 }, { taunt: 36 },
      ],
    },
  ],

  super: { hit: 'head', move: 'flashbulb', golden: 'windup', window: [11, 14], from: 'overexposed', taunt: 42, shout: 'SMILE!', times: [1, 2] },

  getUpTable: [
    { upAt: [6, 8], health: 0.6 },
    { upAt: [7, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.35, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  // Dash (K4): 3 exploits, 3 anti-strategies, 2 scripted moments.
  exploits: [
    trashTalkExploit({ stun: 90, hits: 7, frames: [4, 40] }),
    {
      id: 'redEye', type: 'quirk', name: 'RED EYE',
      trigger: { on: 'resolved', move: 'flashbulb', result: 'dodged', dir: 'R' },
      effect: { open: { frames: 90, anim: 'stunned', comboLimit: 7, star: [0, 40] }, say: 'HE BLINDED HIMSELF!', sfx: 'flashbulb' },
      hint: { kind: 'visual', text: 'THE FLASH ON HIS GLOVE IS BRIGHT ENOUGH TO CATCH HIM IN THE EYE TOO.' },
      scout: 'SLIP RIGHT OF THE FLASHBULB UPPERCUT: HE BLINDS HIMSELF AND IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    dashGrudge(),
    readsYou(),
    {
      id: 'rubsItIn', type: 'getUpMash', name: 'RUBS IT IN', response: 'harder', mult: 1.3, punches: 3, say: 'STAY DOWN NEXT TIME!',
      scout: 'MASH BACK UP AFTER HE DROPS YOU AND HIS NEXT THREE PUNCHES HIT HARDER.',
    },
  ],
  stateTriggers: [trashTalk()],
  scriptedMoments: [
    { id: 'redCarpetMoment', name: 'RED CARPET', when: { left: 90 }, say: 'SMILE FOR THE CAMERAS!', steps: [{ idle: 20 }, { move: 'smartCross' }, { idle: 14 }, { move: 'showJab' }, { idle: 20 }, { move: 'flashbulb' }] },
    { id: 'afterPartyMoment', name: 'AFTER-PARTY', when: { health: 0.35 }, say: 'THE AFTER-PARTY STARTS!', steps: [{ idle: 16 }, { move: 'flashbulb' }, { idle: 16 }, { move: 'knowItAll' }] },
  ],
  special: [{ type: 'comboReader', move: 'knowItAll', gap: 40, single: true }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'A SPONSOR, NEW TRUNKS AND A FLASHBULB UPPERCUT. DASH IS STILL ONE STEP BEHIND YOU AND HATES IT.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'COUNTER THE FLASHBULB.', check: 'counterMove', move: 'flashbulb' } },
  music: 'dashEntrance',
};
