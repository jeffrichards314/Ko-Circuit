// #116 THE ECHO SHARD — Void III, The Mind. A copy the Void made of you. He attacks with YOUR OWN PUNCHES from the previous round: every punch
// you threw last round (thinned so none is closer than 46 frames to the next) comes back at you, in your order, as an attack of his: your left jab
// is his left jab, a body shot is a body shot, a Star Punch is a slow overhead. Round 1 there is nothing to echo, so he says it in his own words.
// He never has fewer than 30. Punch less and he has less to say. His super is the MIMIC.
import { vm, only, longSteps, superMove, stats, anims } from './_void.js';

const ALL4 = ['dodgeL', 'dodgeR', 'block', 'duck'];
const M = {
  eJab: vm('jab', { name: 'YOUR JAB', avoidBy: ALL4, recoveryFrames: 20 }),
  eJabR: vm('jabR', { name: 'YOUR CROSS', avoidBy: ALL4, recoveryFrames: 20 }),
  eBody: vm('body', { name: 'YOUR BODY SHOT', recoveryFrames: 20 }),
  eBodyR: vm('bodyR', { name: 'YOUR BODY SHOT (R)', recoveryFrames: 20 }),
  eStar: only(['dodgeL', 'dodgeR'], vm('haymaker', { name: 'YOUR STAR PUNCH', windupFrames: 16, recoveryFrames: 40, counterWindow: [4, 14], starWindow: [4, 7], damage: 20 })),
  mimic: only(['dodgeL', 'dodgeR'], superMove('THE MIMIC', { windupFrames: 24, counterWindow: [5, 21], starWindow: [5, 9], sfx: { tell: 'echo', swing: 'crash' } })),
};
const stock = ['eJab', 'eBodyR', 'eJabR', 'eBody', 'eJab', 'eJab', 'eBody', 'eJabR', 'eBodyR', 'eStar'];

export default {
  id: 'echoShard',
  name: 'THE ECHO SHARD',
  short: 'ECHO SHARD',
  nickname: 'YOUR OWN VOICE',
  circuit: 'v3',
  rank: 4,
  isChampion: false,
  card: { age: 0, weight: 0, record: 'YOURS', hometown: 'THE LAST ROUND', quote: 'I HAVE BEEN LISTENING. EVERYTHING YOU DID, I REMEMBER.' },
  lines: { win: 'YOU HIT YOURSELF.', lose: 'I ONLY EVER... REPEATED YOU...' },

  build: 'medium',
  palette: 'echoShard',
  spriteLayers: 'echoShard',

  stats: stats({ health: 400, damageMult: 2.3, stunResistance: 5, starLossChance: 0.6, stunFrames: 84, hitstun: 11, comboLimit: 3 }),
  anims: anims({ idle: { frames: ['idle1', 'idle2'], rate: 18 } }),
  guardCounter: 'eStar',

  moves: M,
  // (the echo modifier builds his real pattern at every bell; this is the first round's, and the fallback)
  patterns: [{ id: 'echo', weight: 1, fixed: true, steps: longSteps({ seed: 7116, moves: [['eJab', 3], ['eJabR', 3], ['eBody', 2], ['eBodyR', 2], ['eStar', 1]], count: 32, gaps: [20, 30], rest: null }) }],

  super: { hit: 'head', move: 'mimic', golden: 'windup', window: [12, 15], taunt: 48, shout: 'THE MIMIC!', times: [1, 2] },

  getUpTable: [{ upAt: [8, 9], health: 0.6 }, { upAt: [8, 9], health: 0.55 }, { upAt: [9, 9], stayDown: 0.35, health: 0.5 }, { upAt: null }],

  modFlags: [],

  exploits: [
    {
      id: 'nothingToEcho', type: 'stunTrigger', name: 'NOTHING TO ECHO',
      trigger: { state: 'idle', since: { event: 'emptyEcho', frames: [0, 120] } },
      effect: { stun: 96, hits: 6, star: true, say: 'NOTHING TO ECHO!', sfx: 'glitch' },
      hint: { kind: 'quote', text: 'I HAVE BEEN LISTENING. EVERYTHING YOU DID, I REMEMBER.' },
      scout: 'THROW FEWER THAN SIX PUNCHES IN A ROUND, THEN HIT HIM IN HIS STANCE IN THE FIRST 2 SECONDS OF THE NEXT: STUNNED FOR 6 HITS, THE FIRST A STAR.',
    },
    {
      id: 'ownStarSlipped', type: 'quirk', name: 'YOUR OWN STAR, SLIPPED',
      trigger: { on: 'resolved', move: 'eStar', result: 'dodged' },
      effect: { open: { frames: 96, anim: 'stunned', comboLimit: 7, star: [0, 36] }, say: 'YOU KNOW YOUR OWN STAR!', sfx: 'thud' },
      hint: { kind: 'visual', text: 'YOUR STAR PUNCH IS THE SLOWEST THING YOU THROW, AND HE HAS TO THROW IT THE SAME WAY.' },
      scout: 'SLIP THE ECHO OF YOUR STAR PUNCH (THE SLOW OVERHEAD): HE IS OPEN FOR 7 HITS, THE FIRST A STAR.',
    },
    {
      id: 'echoOfAnEcho', type: 'stunTrigger', name: 'AN ECHO OF AN ECHO',
      trigger: { state: 'windup', move: 'eStar', counter: true, frames: [10, 14], clean: 26 },
      effect: { stun: 112, hits: 8, star: true, say: 'YOU CUT YOURSELF OFF!', sfx: 'crash' },
      hint: { kind: 'visual', text: 'HE RAISES YOUR STAR PUNCH SLOWLY, BOTH GLOVES OVER HIS HEAD.', hidden: true },
      scout: 'A COUNTER ON THE LAST FRAMES OF THE ECHOED STAR PUNCH (BOTH GLOVES RAISED): STUNNED FOR 8 HITS, THE FIRST A STAR.',
    },
  ],
  antiStrategies: [
    {
      id: 'repeatsYourJabs', type: 'jabSpam', name: 'REPEATS YOUR JABS', streak: 3, gap: 40, counter: ['eStar'], say: 'PARRIED!',
      scout: 'THROW THREE PUNCHES IN A ROW THAT AREN\'T PART OF AN OPENING AND HE PARRIES THE THIRD AND ANSWERS WITH YOUR OWN STAR PUNCH, SLOWLY.',
    },
  ],
  scriptedMoments: [
    { id: 'yourLastCombo', name: 'YOUR LAST COMBO', when: { left: 70, round: 3 }, say: 'YOUR LAST COMBO!', steps: [{ idle: 20 }, { move: 'eJab' }, { idle: 22 }, { move: 'eJabR' }, { idle: 22 }, { move: 'eBody' }, { idle: 30 }, { move: 'eStar' }, { idle: 40 }] },
  ],
  special: [{ type: 'echoReplay', minGap: 46, minIdle: 14, moveLen: 30, stock }],
  titleDefense: null,
  gallery: 'A COPY THE VOID MADE OF YOU. HE THROWS YOUR OWN PUNCHES FROM THE ROUND BEFORE, IN YOUR ORDER.',
  medals: { signature: { text: 'SLIP YOUR OWN STAR PUNCH.', check: 'moveResult', move: 'eStar', result: 'dodged', n: 1 } },
  music: 'echoShardWalkup',
};
