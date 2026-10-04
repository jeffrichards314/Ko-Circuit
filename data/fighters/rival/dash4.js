// Rival fight IV, the final showdown: Dash Maddox after the Grand Prix title,
// before Jax (§11b). He walks in wearing a teal-and-gold robe with his own crest
// on it. Everything he's ever thrown at you, plus the one he's saved for the
// Colosseum: the GRAND FINALE. Gloves up, sparks falling like fireworks; he
// streaks LEFT and hits from there (slip RIGHT), streaks RIGHT and hits from
// there (slip LEFT), then brings the FIREWORKS haymaker down the middle (a
// one-hit knockdown: slip it). Hit him while he's holding the gloves up and the
// finale is off; hit him on the second shower of sparks and HE goes down.
// Grand Prix difficulty: 6-frame tells, shuffled, adaptive. Beat him and Jax
// Crane is waiting.
import { baseMoves, knowItAll, flashbulb, highlightReel, grandFinale, DASH_ANIMS, DASH_CARD, dashGrudge, trashTalk, trashTalkExploit, readsYou } from './moves.js';

const W = 7;

export default {
  id: 'dash4',
  name: 'DASH MADDOX',
  short: 'DASH',
  nickname: 'THE PRODIGY',
  circuit: 'rival4',
  rank: 0,
  isChampion: false,
  rival: 4,
  card: { ...DASH_CARD, weight: 163, record: '32-0 28KO', quote: 'EVERYBODY WANTS JAX. NOBODY GETS JAX WITHOUT GOING THROUGH ME.' },
  lines: {
    win: 'THAT\'S THE ENDING THEY PAID FOR. GO HOME.',
    lose: '...SAME DAY WE TURNED PRO. YEAH. I REMEMBER.',
  },

  build: 'medium',
  palette: 'dash4',
  spriteLayers: 'dash4',

  stats: {
    health: 270,
    damageMult: 1.6,
    stunResistance: 5,
    heartDrainOnBlock: 3,
    starLossChance: 0.55,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 42,
    hitstun: 11,
    betweenRoundHeal: 0.2,
  },

  anims: DASH_ANIMS,

  moves: { ...baseMoves(W), ...knowItAll(W), ...flashbulb(W), ...highlightReel(W), ...grandFinale(W) },

  patterns: [
    {
      id: 'headliner', weight: 3, fixed: true,
      steps: [
        { idle: 26 }, { move: 'showJab' }, { idle: 22 },
        { move: 'finaleCall' }, { move: 'finale1' }, { move: 'finale2' }, { move: 'finale3' },
        { idle: 26 }, { move: 'cheapShot' }, { idle: 30 }, { taunt: 30 },
      ],
    },
    {
      id: 'greatestHits', weight: 3,
      steps: [
        { idle: 24 }, { move: 'flashbulb' }, { idle: 24 }, { move: 'smartCross' }, { idle: 18 },
        { move: 'reelCall' }, { move: 'reel1' }, { move: 'reel2' }, { move: 'reel3' },
        { idle: 24 }, { move: 'knowItAll' }, { idle: 30 }, { taunt: 28 },
      ],
    },
    {
      id: 'encore', weight: 2,
      steps: [
        { idle: 22 }, { move: 'cheapShot' }, { idle: 18 }, { move: 'showJab' }, { idle: 20 }, { move: 'flashbulb' },
        { idle: 22 }, { move: 'knowItAll' }, { idle: 20 }, { move: 'smartCross' }, { idle: 28 }, { taunt: 26 },
      ],
    },
    {
      id: 'lastRound', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 20 }, { move: 'reelCall' }, { move: 'reel1' }, { move: 'reel2' }, { move: 'reel3' }, { idle: 20 },
        { move: 'finaleCall' }, { move: 'finale1' }, { move: 'finale2' }, { move: 'finale3' }, { idle: 20 },
        { move: 'flashbulb' }, { idle: 26 }, { taunt: 24 },
      ],
    },
  ],

  super: { hit: 'head', move: 'finaleCall', name: 'GRAND FINALE', then: ['finale1', 'finale2', 'finale3'], golden: 'windup', taunt: 38, shout: 'GRAND FINALE!', times: [1, 2] },
  // more supers (super.js): his old signatures, armored wherever he throws them, each with one golden moment
  supers: [
    { hit: 'head', move: 'flashbulb', inline: true, golden: 'windup', window: [6, 8] },
    { hit: 'body', key: 'highlightReel', name: 'HIGHLIGHT REEL', inline: true, move: 'reelCall', then: ['reel1', 'reel2', 'reel3'], golden: 'windup', window: [6, 8] },
  ],

  getUpTable: [
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], health: 0.45 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  // Dash (K4): 3 exploits, 3 anti-strategies, 2 scripted moments.
  exploits: [
    {
      // (2026-10-02: the finale's slip-to-cancel went with the super rework; this keeps K4's count)
      id: 'burnedBulb', type: 'quirk', name: 'THE BULB BURNS OUT',
      trigger: { on: 'resolved', move: 'flashbulb', result: 'dodged' },
      effect: { open: { frames: 96, anim: 'stunned', comboLimit: 8, star: [0, 40] }, say: 'THE BULB BURNS OUT!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'A FLASHBULB THAT MISSES IS SPENT: THERE\'S NOTHING LEFT IN IT.', hidden: true },
      scout: 'SLIP THE FLASHBULB UPPERCUT: THE BULB BURNS OUT AND HE IS OPEN FOR 8 HITS, THE FIRST A STAR.',
    },
    trashTalkExploit({ stun: 110, hits: 9, frames: [10, 28] }),
    {
      id: 'fireworksFizzle', type: 'quirk', name: 'FIREWORKS FIZZLE',
      trigger: { on: 'resolved', move: 'finale3', result: 'dodged' },
      effect: { open: { frames: 100, anim: 'stunned', comboLimit: 8, star: [0, 40] }, say: 'THE FIREWORKS FIZZLE!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'THE FINALE\'S SPARKS ARE ALL SPENT BY THE LAST PUNCH.' },
      scout: 'SLIP THE FIREWORKS HAYMAKER AT THE END OF THE GRAND FINALE: HE\'S SPENT AND OPEN FOR 8 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    dashGrudge(),
    readsYou(),
    {
      id: 'noMercy', type: 'getUpMash', name: 'NO MERCY', response: 'harder', mult: 1.4, punches: 4, say: 'NO MERCY!',
      scout: 'MASH BACK UP AFTER HE DROPS YOU AND HIS NEXT FOUR PUNCHES HIT HARDER.',
    },
  ],
  stateTriggers: [trashTalk()],
  scriptedMoments: [
    { id: 'finaleRound', name: 'THE FINALE ROUND', when: { left: 60 }, say: 'GRAND FINALE TIME!', steps: [{ idle: 20 }, { move: 'finaleCall' }, { move: 'finale1' }, { move: 'finale2' }, { move: 'finale3' }] },
    { id: 'lastShow', name: 'THE LAST SHOW', when: { health: 0.3 }, say: 'THE LAST SHOW!', steps: [{ idle: 16 }, { move: 'reelCall' }, { move: 'reel1' }, { move: 'reel2' }, { move: 'reel3' }, { idle: 20 }, { move: 'flashbulb' }] },
  ],
  special: [
    { type: 'comboReader', move: 'knowItAll', gap: 36, single: true },
    { type: 'afterimage', dist: 26, dashIn: 4, dashOut: 10, ghost: 'dash4.ghost' },
  ],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'EVERYTHING HE\'S GOT AND THE GRAND FINALE. THE LAST THING BETWEEN YOU AND JAX IS YOUR OLDEST RIVAL.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'HIT HIM ON THE SPARKS: A PERFECT KNOCKDOWN.', check: 'kdBy', by: 'perfect' } },
  music: 'dashEntrance',
};
