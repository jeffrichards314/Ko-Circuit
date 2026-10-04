// Rival fight III: Dash Maddox, after the World title (§11b). Satin trunks, a
// gold chain, and a move he built for the stadium's big screen: the HIGHLIGHT
// REEL. He points up at the screen, then three hits, each with its own
// defense: the hook (slip RIGHT), the body shot (BLOCK), the sweep (DUCK).
// Hit him while he's pointing and the reel never plays. His super is the reel
// from a taunt: the golden chance is as he steps back in, pointing.
// World-circuit difficulty: 12-frame tells, weighted random, and fakes.
import { baseMoves, knowItAll, flashbulb, highlightReel, DASH_ANIMS, DASH_CARD, dashGrudge, trashTalk, trashTalkExploit, readsYou } from './moves.js';

const W = 12;

export default {
  id: 'dash3',
  name: 'DASH MADDOX',
  short: 'DASH',
  nickname: 'THE PRODIGY',
  circuit: 'rival3',
  rank: 0,
  isChampion: false,
  rival: 3,
  card: { ...DASH_CARD, weight: 162, record: '24-0 20KO', quote: 'EVERY NIGHT I\'M ON THE BIG SCREEN. TONIGHT YOU\'RE IN THE BLOOPER REEL.' },
  lines: {
    win: 'ROLL THE TAPE. SLOW-MO ON THAT LAST ONE.',
    lose: 'CUT... CUT THE CAMERAS...',
  },

  build: 'medium',
  palette: 'dash3',
  spriteLayers: 'dash3',

  stats: {
    health: 225,
    damageMult: 1.45,
    stunResistance: 4,
    heartDrainOnBlock: 2,
    starLossChance: 0.5,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 46,
    hitstun: 13,
    betweenRoundHeal: 0.22,
  },

  anims: DASH_ANIMS,

  moves: { ...baseMoves(W), ...knowItAll(W), ...flashbulb(W), ...highlightReel(W) },

  patterns: [
    {
      id: 'primeTime', weight: 3,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 40 }, { move: 'showJab' }, { idle: 30 }, { move: 'reelCall' }, { move: 'reel1' }, { move: 'reel2' }, { move: 'reel3' },
        { idle: 34 }, { move: 'smartCross' }, { idle: 30 }, { move: 'flashbulb' }, { idle: 40 }, { taunt: 40 },
      ],
    },
    {
      id: 'sportsDesk', weight: 2,
      steps: [
        { idle: 34 }, { move: 'cheapShot' }, { idle: 24 }, { move: 'knowItAll' }, { idle: 30 }, { move: 'smartCross' },
        { idle: 22 }, { move: 'showJab' }, { idle: 36 }, { taunt: 36 },
      ],
    },
    {
      id: 'replay', weight: 3,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 30 }, { move: 'flashbulb' }, { idle: 26 }, { move: 'cheapShot' }, { idle: 22 },
        { move: 'reelCall' }, { move: 'reel1' }, { move: 'reel2' }, { move: 'reel3' },
        { idle: 30 }, { move: 'knowItAll' }, { idle: 34 }, { taunt: 34 },
      ],
    },
    {
      id: 'overtime', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 26 }, { move: 'reelCall' }, { move: 'reel1' }, { move: 'reel2' }, { move: 'reel3' }, { idle: 24 },
        { move: 'flashbulb' }, { idle: 22 }, { move: 'smartCross' }, { idle: 18 }, { move: 'cheapShot' }, { idle: 30 }, { taunt: 30 },
      ],
    },
  ],

  super: { hit: 'head', move: 'reelCall', name: 'HIGHLIGHT REEL', then: ['reel1', 'reel2', 'reel3'], golden: 'advance', window: [3, 6], taunt: 40, shout: 'ROLL TAPE!', times: [1, 2] },
  // more supers (super.js): his old signatures, armored wherever he throws them, each with one golden moment
  supers: [
    { hit: 'head', move: 'flashbulb', inline: true, golden: 'windup', window: [9, 11] },
  ],

  getUpTable: [
    { upAt: [7, 9], health: 0.6 },
    { upAt: [8, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  // Dash (K4): 3 exploits, 3 anti-strategies, 2 scripted moments.
  exploits: [
    {
      // (2026-10-02: the reel's slip-to-cancel went with the super rework; this keeps K4's count)
      id: 'lensFlare', type: 'quirk', name: 'LENS FLARE',
      trigger: { on: 'resolved', move: 'flashbulb', result: 'dodged', dir: 'R' },
      effect: { open: { frames: 90, anim: 'stunned', comboLimit: 7, star: [0, 40] }, say: 'LENS FLARE!', sfx: 'flashbulb' },
      hint: { kind: 'visual', text: 'HIS FLASHBULB IS BRIGHTER NOW. SO IS THE GLARE.' },
      scout: 'SLIP RIGHT OF THE FLASHBULB UPPERCUT: THE GLARE BLINDS HIM AND HE IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
    trashTalkExploit({ stun: 100, hits: 8, frames: [8, 34] }),
    {
      id: 'pauseButton', type: 'quirk', name: 'PAUSE BUTTON',
      trigger: { on: 'resolved', move: 'reel3', result: 'ducked' },
      effect: { open: { frames: 90, anim: 'stunned', comboLimit: 7, star: [0, 40] }, say: 'THE REEL FREEZES!', sfx: 'scratch' },
      hint: { kind: 'visual', text: 'THE BIG SCREEN FREEZES ON THE SWEEP.' },
      scout: 'DUCK THE REEL\'S FINAL SWEEP: THE REEL FREEZES AND HE\'S OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    dashGrudge(),
    readsYou(),
    {
      id: 'pilesOn', type: 'getUpMash', name: 'PILES ON', response: 'moves', moves: ['smartCross'], say: 'GET UP AND TAKE THIS!',
      scout: 'WHEN YOU MASH BACK UP AFTER A KNOCKDOWN, HE FIRES A SMART CROSS AT ONCE.',
    },
  ],
  stateTriggers: [trashTalk()],
  scriptedMoments: [
    { id: 'replayMoment', name: 'INSTANT REPLAY', when: { left: 75 }, say: 'ROLL THE TAPE!', steps: [{ idle: 20 }, { move: 'reelCall' }, { move: 'reel1' }, { move: 'reel2' }, { move: 'reel3' }] },
    { id: 'overtimeMoment', name: 'OVERTIME', when: { health: 0.4 }, say: 'OVERTIME!', steps: [{ idle: 16 }, { move: 'flashbulb' }, { idle: 16 }, { move: 'reelCall' }, { move: 'reel1' }, { move: 'reel2' }, { move: 'reel3' }] },
  ],
  special: [{ type: 'comboReader', move: 'knowItAll', gap: 40, single: true }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'SATIN, GOLD AND THE HIGHLIGHT REEL. DASH IS A STAR NOW. HE STILL WANTS ONE THING: TO BEAT YOU.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'CUT THE REEL: COUNTER HIM WHILE HE POINTS.', check: 'counterMove', move: 'reelCall' } },
  music: 'dashEntrance',
};
