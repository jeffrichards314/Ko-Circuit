// Rival fight I: Dash Maddox, after the Minor title (§11b). He turned pro the
// same day you did, and he's been telling everyone he's better. He crashes the
// belt ceremony. Minor-circuit difficulty: 26-frame tells, fixed loops.
// His signature: KNOW-IT-ALL. Throw the same punch twice in a row and he
// catches the second and fires a hook straight back (slip LEFT or duck). So
// mix it up: left, right, high, low. His super is the same hook, from a
// "come on" beckon up close: hit him on the beckon and he goes down.
import { baseMoves, knowItAll, DASH_ANIMS, DASH_CARD, dashGrudge, trashTalk, trashTalkExploit, readsYou } from './moves.js';

const W = 26;

export default {
  id: 'dash1',
  name: 'DASH MADDOX',
  short: 'DASH',
  nickname: 'THE PRODIGY',
  circuit: 'rival1',
  rank: 0,
  isChampion: false,
  rival: 1,
  card: { ...DASH_CARD, weight: 158, record: '8-0 6KO', quote: 'SAME DAY WE TURNED PRO. FUNNY. ONLY ONE OF US IS ANY GOOD.' },
  lines: {
    win: 'TOLD YOU. SAME DAY, DIFFERENT LEAGUE.',
    lose: 'LUCKY. THAT WAS... LUCKY.',
  },

  build: 'medium',
  palette: 'dash1',
  spriteLayers: 'dash1',

  stats: {
    health: 150,
    damageMult: 1.05,
    stunResistance: 1,
    heartDrainOnBlock: 1,
    starLossChance: 0.4,
    comboLimit: 3,
    stunComboLimit: 5,
    idleHitLimit: 2,
    idleGuard: 'high',
    stunFrames: 50,
    hitstun: 14,
    betweenRoundHeal: 0.2,
  },

  anims: DASH_ANIMS,

  moves: { ...baseMoves(W), ...knowItAll(W) },

  patterns: [
    {
      id: 'firstLesson', weight: 1,
      when: { rounds: [1] },
      steps: [
        { idle: 60 }, { move: 'showJab' }, { idle: 46 }, { move: 'smartCross' }, { idle: 46 }, { move: 'cheapShot' },
        { idle: 50 }, { move: 'knowItAll' }, { idle: 56 }, { taunt: 50 },
      ],
    },
    {
      id: 'showOff', weight: 1,
      when: { rounds: [2, 3] },
      steps: [
        { idle: 44 }, { move: 'smartCross' }, { idle: 30 }, { move: 'showJab' }, { idle: 40 }, { move: 'knowItAll' },
        { idle: 40 }, { move: 'cheapShot' }, { idle: 26 }, { move: 'smartCross' }, { idle: 48 }, { taunt: 44 },
      ],
    },
  ],

  super: { hit: 'head', move: 'knowItAll', golden: 'taunt', window: [16, 19], taunt: 44, shout: 'I KNOW YOUR MOVES!', keep: true, times: [1, 2] },

  getUpTable: [
    { upAt: [5, 7], health: 0.6 },
    { upAt: [6, 8], health: 0.5 },
    { upAt: [8, 9], stayDown: 0.4, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  // Dash (K4): 3 exploits, 2 anti-strategies, 2 scripted moments. Every version has his file on
  // you, the Know-It-All, and the trash talk (the shared pieces live in rival/moves.js).
  exploits: [
    trashTalkExploit({ stun: 80, hits: 6, frames: [0, 44] }),
    {
      id: 'caughtLooking', type: 'quirk', name: 'CAUGHT LOOKING',
      trigger: { on: 'resolved', move: 'knowItAll', result: 'dodged', dir: 'L' },
      effect: { open: { frames: 72, anim: 'stunned', comboLimit: 5 }, say: 'HE WAS ADMIRING HIS OWN HOOK!', sfx: 'heh' },
      hint: { kind: 'trainer', text: 'THE KNOW-IT-ALL HOOK COMES FROM YOUR RIGHT. SLIP LEFT.' },
      scout: 'SLIP LEFT OF THE KNOW-IT-ALL HOOK: HE ADMIRES IT AND IS OPEN FOR 5 HITS.',
    },
    {
      id: 'comeOn', type: 'bait', name: 'COME ON, THEN', limit: 3,
      trigger: { on: 'passive', frames: 240 },
      effect: { script: [{ open: 50, anim: 'taunt', id: 'comeOn', comboLimit: 3, star: [0, 30] }], say: 'HE BECKONS YOU IN!' },
      hint: { kind: 'quote', text: 'COME ON! WHAT ARE YOU WAITING FOR?' },
      scout: 'STAND STILL FOR 4 SECONDS AND HE BECKONS YOU IN, WIDE OPEN FOR 3 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    dashGrudge(),
    readsYou(),
  ],
  stateTriggers: [trashTalk()],
  scriptedMoments: [
    { id: 'showOffMoment', name: 'SHOWING OFF', when: { left: 90 }, say: 'WATCH AND LEARN!', steps: [{ idle: 20 }, { move: 'showJab' }, { idle: 14 }, { move: 'smartCross' }, { idle: 14 }, { move: 'knowItAll' }] },
    { id: 'careless', name: 'GETTING CARELESS', when: { health: 0.3 }, say: 'HE GETS CARELESS!', steps: [{ idle: 20 }, { move: 'cheapShot' }, { idle: 12 }, { move: 'knowItAll' }] },
  ],
  special: [{ type: 'comboReader', move: 'knowItAll', gap: 40, single: true }],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'DASH MADDOX TURNED PRO THE SAME DAY YOU DID, IN THE SAME GYM. EVERYBODY CALLED HIM THE PRODIGY.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'NEVER LET HIM READ YOU.', check: 'noCue', cue: '!read' } },
  music: 'dashEntrance',
};
