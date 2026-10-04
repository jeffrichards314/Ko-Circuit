// #36 Duchess Kane — Legends Circuit. The historian of the sport: she has
// studied every champion you've beaten, and she fights like all of them. Every
// pattern is an homage (the name under the clock says whose), picked at random:
//   GUS GRILL        she stops for tea and cake to heal. Hit her while she nibbles (a star).
//   THE BARON        long fencing lunges, then a riposte from the other side.
//   COUNT MIDNIGHT   a snap of the fingers and the lights go out: read her eyes.
//                    Hit her during the snap and the lights stay on.
//   RINGMASTER REX   a whip-crack call and a spotlight blinds half the screen.
//   MAESTRO VALE     the crescendo: three punches, each faster than the last.
//   AVALANCHE        the Whiteout, her one-hit knockdown. Slip it, or counter it
//                    on the glint and she goes down (perfect hit).

const lunge = (name, tell, act, avoid, windup, rec, extra = {}) => ({
  name, windupFrames: windup, activeFrames: 7, recoveryFrames: rec,
  damage: 15, avoidBy: avoid, counterWindow: null, starWindow: null, noFake: true,
  sfx: { tell: 'engarde', swing: 'whiff' },
  animation: { windup: [tell], active: [act], recovery: [act, 'idle1'] },
  ...extra,
});

export default {
  id: 'duchess',
  name: 'DUCHESS KANE',
  short: 'DUCHESS',
  nickname: 'THE HISTORIAN',
  circuit: 'legends',
  rank: 1,
  isChampion: false,
  card: {
    age: 44,
    weight: 139,
    record: '52-4 30KO',
    hometown: 'KANE MANOR',
    quote: 'I\'VE WATCHED EVERY TAPE OF EVERY CHAMPION. INCLUDING YOURS.',
  },
  lines: {
    win: 'A FOOTNOTE, DARLING. YOU\'LL BE A LOVELY FOOTNOTE.',
    lose: 'HOW... UNPRECEDENTED...',
  },

  build: 'lean',
  palette: 'duchess',
  spriteLayers: 'duchess',

  stats: {
    health: 230,
    damageMult: 1.5,
    stunResistance: 4,
    heartDrainOnBlock: 3,
    starLossChance: 0.5,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 44,
    hitstun: 12,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 18 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 14 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['curtsy'],
    victory: ['fan'],
    teaTime: { frames: ['tea1', 'tea2'], rate: 14 },
  },

  moves: {
    royalJab: {
      name: 'ROYAL JAB',
      windupFrames: 8, activeFrames: 6, recoveryFrames: 20,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 6],
      starWindow: null,
      sfx: { tell: 'chime', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    // THE BARON: a long lunge (slip it: a duck would leave you stuck for the
    // riposte), then the riposte from the other side
    lunge: lunge('LUNGE', 'lungeTell', 'lunge', ['dodgeL', 'dodgeR'], 12, 4, { counterWindow: [3, 9], starWindow: [3, 4] }),
    riposte: lunge('RIPOSTE', 'hookTell', 'hook', ['dodgeL'], 10, 30, { punishStar: ['dodged'] }),
    // COUNT MIDNIGHT
    midnightSnap: {
      name: 'LIGHTS OUT',
      feint: true,
      windupFrames: 24, activeFrames: 0, recoveryFrames: 16,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 21],
      starWindow: [3, 8],
      eyes: [0, 0, 1],
      sfx: { tell: 'snap' },
      animation: { windup: ['snapTell'], active: ['snapTell'], recovery: ['snapTell', 'idle1'] },
    },
    nightJab: {
      name: 'NIGHT JAB',
      windupFrames: 10, activeFrames: 6, recoveryFrames: 22,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 8],
      starWindow: null,
      eyes: [-4, 0, 0],
      sfx: { swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    nightHook: {
      name: 'NIGHT HOOK',
      windupFrames: 11, activeFrames: 7, recoveryFrames: 24,
      damage: 16,
      avoidBy: ['dodgeL', 'duck'],
      counterWindow: [2, 9],
      starWindow: null,
      eyes: [5, -1, 1],
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    nightBody: {
      name: 'NIGHT BODY',
      windupFrames: 11, activeFrames: 7, recoveryFrames: 22,
      damage: 15,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [2, 9],
      starWindow: null,
      eyes: [0, 3, 0],
      sfx: { swing: 'whiff' },
      animation: { windup: ['bodyRTell'], active: ['bodyR'], recovery: ['bodyRTell', 'idle1'] },
    },
    // RINGMASTER REX
    rexCall: {
      name: 'SPOTLIGHT!',
      feint: true,
      windupFrames: 24, activeFrames: 0, recoveryFrames: 12,
      damage: 0,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [3, 21],
      starWindow: [3, 8],
      sfx: { tell: 'whip' },
      animation: { windup: ['callTell'], active: ['callTell'], recovery: ['callTell', 'idle1'] },
    },
    whipJab: {
      name: 'WHIP JAB',
      windupFrames: 10, activeFrames: 6, recoveryFrames: 22,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [2, 8],
      starWindow: null,
      sfx: { tell: 'whip', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    whipHook: {
      name: 'WHIP HOOK',
      windupFrames: 11, activeFrames: 7, recoveryFrames: 24,
      damage: 16,
      avoidBy: ['dodgeR', 'duck'],
      counterWindow: [2, 9],
      starWindow: null,
      sfx: { tell: 'honk', swing: 'swingHeavy' },
      animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
    },
    // MAESTRO VALE: the crescendo, each note faster
    cresc1: lunge('CRESCENDO', 'jabTell', 'jab', ['dodgeL', 'dodgeR'], 14, 3, { sfx: { tell: 'baton', swing: 'whiff' } }),
    cresc2: lunge('CRESCENDO (2)', 'jabRTell', 'jabR', ['dodgeL', 'dodgeR'], 11, 3, { sfx: { tell: 'baton', swing: 'whiff' } }),
    cresc3: lunge('CRESCENDO (3)', 'upperTell', 'upper', ['dodgeL', 'dodgeR'], 8, 36, { punishStar: ['dodged'], sfx: { tell: 'cymbal', swing: 'swingHeavy' } }),
    // AVALANCHE: the one-hit knockdown, and her perfect hit
    whiteout: {
      name: 'WHITEOUT',
      knockdown: true,
      windupFrames: 18, activeFrames: 10, recoveryFrames: 44,
      damage: 28,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [3, 14],
      starWindow: [3, 5],
      kdWindow: [9, 12],
      noFake: true,
      sfx: { tell: 'gust', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 6, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'gus', homage: 'GUS GRILL', color: [31, 20, 8], weight: 2, fixed: true,
      steps: [
        { idle: 24 }, { move: 'royalJab' }, { idle: 20 }, { move: 'royalJab' }, { idle: 20 },
        { open: 70, anim: 'teaTime', id: 'tea', limit: 3, heal: 0.12, star: [2, 70], interrupt: true, stunOnInterrupt: 36, sfx: 'chime', sfxLoop: 'chomp', sfxEvery: 24 },
        { idle: 22 },
      ],
    },
    {
      id: 'baron', homage: 'THE BARON', color: [28, 6, 10], weight: 2, fixed: true,
      steps: [
        { idle: 26 }, { move: 'lunge' }, { move: 'riposte' }, { idle: 22 }, { move: 'royalJab' }, { idle: 20 },
        { move: 'lunge' }, { move: 'riposte' }, { idle: 24 }, { taunt: 34 },
      ],
    },
    {
      id: 'midnight', homage: 'COUNT MIDNIGHT', color: [24, 10, 31], weight: 2, fixed: true,
      steps: [
        { idle: 22 }, { move: 'midnightSnap' }, { idle: 26 }, { move: 'nightJab' }, { idle: 22 }, { move: 'nightHook' },
        { idle: 22 }, { move: 'nightBody' }, { idle: 22 }, { move: 'nightJab' }, { idle: 30 },
      ],
    },
    {
      id: 'rex', homage: 'RINGMASTER REX', color: [31, 26, 10], weight: 2, fixed: true,
      steps: [
        { idle: 22 }, { move: 'rexCall' }, { idle: 24 }, { move: 'whipJab' }, { idle: 22 }, { move: 'whipHook' },
        { idle: 22 }, { move: 'whipJab' }, { idle: 26 }, { taunt: 30 },
      ],
    },
    {
      id: 'maestro', homage: 'MAESTRO VALE', color: [31, 31, 20], weight: 2, fixed: true,
      steps: [
        { idle: 24 }, { move: 'royalJab' }, { idle: 22 }, { move: 'cresc1' }, { move: 'cresc2' }, { move: 'cresc3' }, { idle: 26 },
      ],
    },
    {
      id: 'avalanche', homage: 'AVALANCHE', color: [24, 30, 31], weight: 2, fixed: true,
      steps: [
        { idle: 26 }, { move: 'royalJab' }, { idle: 20 }, { move: 'whiteout' }, { idle: 24 }, { move: 'royalJab' }, { idle: 26 }, { taunt: 34 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'body', move: 'whiteout', golden: 'windup', taunt: 38, shout: 'A LITTLE HOMAGE!', times: [1, 2] },

  getUpTable: [
    { upAt: [8, 9], health: 0.55 },
    { upAt: [9, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  exploits: [
    {
      id: 'spilledTea', type: 'stunTrigger', name: 'SPILLED TEA',
      trigger: { state: 'open', open: 'tea', height: 'low' },
      effect: { open: { frames: 84, anim: 'stunned', comboLimit: 6, sfx: 'oof' }, flag: 'noOpen:tea', until: 'round', say: 'SHE SPILLED HER TEA!' },
      hint: { kind: 'trainer', text: 'SHE LEARNED THE TEA BREAK FROM GUS GRILL. SO DID HIS BELLY.' },
      scout: 'A BODY SHOT DURING HER TEA BREAK SPILLS IT: 6 FREE HITS, AND NO MORE TEA THIS ROUND.',
    },
    {
      id: 'overextended', type: 'stunTrigger', name: 'OVEREXTENDED',
      trigger: { state: 'windup', move: 'lunge', counter: true, height: 'low' },
      effect: { stun: 96, hits: 8, say: 'OVEREXTENDED!' },
      hint: { kind: 'visual', text: 'THE LUNGE TAKES HER WEIGHT OUT OVER HER FRONT FOOT.' },
      scout: 'A BODY-SHOT COUNTER ON HER LUNGE LEAVES HER OVEREXTENDED: STUNNED FOR 8 HITS.',
    },
  ],
  antiStrategies: [
    {
      id: 'readYourFile', type: 'comboRepeat', name: 'SHE\'S READ YOUR FILE', gap: 45, counter: ['royalJab', 'riposte'], say: 'SHE\'S READ YOUR FILE!',
      scout: 'REPEAT A COMBO AND SHE\'S SEEN IT BEFORE: SHE PARRIES THE SECOND AND JABS, THEN RIPOSTES BACK.',
    },
  ],
  scriptedMoments: [
    {
      id: 'grandHomage', name: 'GRAND HOMAGE', when: { left: 75 }, say: 'A GRAND HOMAGE!',
      steps: [{ idle: 20 }, { move: 'cresc1' }, { move: 'cresc2' }, { move: 'cresc3' }, { idle: 20 }, { move: 'whiteout' }],
    },
  ],
  special: [
    { type: 'homage' },
    { type: 'lightsOut', trigger: 'midnightSnap', frames: 300, fade: 14, eyeHi: [31, 24, 31], eyeLo: [22, 4, 26] },
    { type: 'spotlight', trigger: 'rexCall', frames: 300 },
  ],
  titleDefense: null,
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'A BOXING HISTORIAN WHO FIGHTS IN THE STYLES OF THE OLD CHAMPIONS. SHE STOPS FOR TEA, TOO.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'NEVER LET HER FINISH HER TEA.', check: 'noOpenDone', id: 'tea' } },
  music: 'duchessWalkup', // his walk-up jingle (data/music/walkups.js)
};
