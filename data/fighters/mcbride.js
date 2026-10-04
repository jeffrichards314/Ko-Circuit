// #12 Mayor McBride — Metro Circuit champion. Playing to the crowd.
// He stops to wave to the voters: that's your opening, and every punch you land
// while he waves gets the crowd booing (the CHEER meter drops). Left alone the
// meter fills by itself, faster while he's waving and every time he lands one.
// When it's full the crowd carries him: his punches hit half again as hard and
// he glows. Knock him down and the crowd goes quiet: the meter resets.
// Perfect hit: the Landslide Victory haymaker, on exactly the right frames.

export default {
  id: 'mcbride',
  name: 'MAYOR McBRIDE',
  short: 'McBRIDE',
  nickname: 'THE INCUMBENT',
  circuit: 'metro',
  rank: 0,
  isChampion: true,
  card: {
    age: 55,
    weight: 262,
    record: '28-3 20KO',
    hometown: 'CITY HALL',
    quote: 'I\'VE SHAKEN TEN THOUSAND HANDS, SON. NOW SHAKE THIS ONE.',
  },
  lines: {
    win: 'VOTE McBRIDE! ...AND ICE THAT JAW.',
    lose: 'I\'D LIKE A RECOUNT. ...OF MY TEETH.',
  },

  build: 'heavy',
  palette: 'mcbride',
  spriteLayers: 'mcbride',

  stats: {
    health: 180,
    damageMult: 1.25,
    stunResistance: 4,
    heartDrainOnBlock: 1,
    starLossChance: 0.45,
    comboLimit: 3,
    stunComboLimit: 6,
    idleHitLimit: 1,
    idleGuard: 'high',
    stunFrames: 56,
    hitstun: 14,
    betweenRoundHeal: 0.2,
  },

  anims: {
    idle: { frames: ['idle1', 'idle2'], rate: 26 },
    block: ['block'],
    hitHigh: ['hitHigh'],
    hitLow: ['hitLow'],
    stunned: { frames: ['stunned1', 'stunned2'], rate: 18 },
    knockdown: ['kd1', 'kd2', 'kd3'],
    down: ['down'],
    getup: ['getup'],
    taunt: ['point'],
    victory: { frames: ['wave1', 'wave2'], rate: 10 },
    wave: { frames: ['wave1', 'wave2'], rate: 10 },
  },

  moves: {
    handshake: {
      name: 'HANDSHAKE',
      windupFrames: 22, activeFrames: 8, recoveryFrames: 22,
      damage: 10,
      avoidBy: ['dodgeL', 'dodgeR', 'block', 'duck'],
      counterWindow: [8, 19],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jabTell', 'idle1'] },
    },
    ribbon: {
      name: 'RIBBON CUTTING',
      windupFrames: 22, activeFrames: 8, recoveryFrames: 26,
      damage: 12,
      height: 'low',
      avoidBy: ['block'],
      counterWindow: [8, 19],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'whiff' },
      animation: { windup: ['bodyTell'], active: ['body'], recovery: ['bodyTell', 'idle1'] },
    },
    // Filibuster: four quick alternating jabs. Only the first has a counter window.
    fil1: {
      name: 'FILIBUSTER',
      windupFrames: 22, activeFrames: 6, recoveryFrames: 4,
      damage: 7,
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      counterWindow: [8, 19],
      starWindow: [8, 13],
      sfx: { tell: 'whistle', swing: 'whiff' },
      animation: { windup: ['crouchTell'], active: ['jab'], recovery: ['jab'] },
    },
    fil2: {
      name: 'FILIBUSTER (2)',
      windupFrames: 12, activeFrames: 6, recoveryFrames: 4,
      damage: 7,
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['jabRTell'], active: ['jabR'], recovery: ['jabR'] },
    },
    fil3: {
      name: 'FILIBUSTER (3)',
      windupFrames: 12, activeFrames: 6, recoveryFrames: 4,
      damage: 7,
      avoidBy: ['dodgeL', 'dodgeR', 'block'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'whiff' },
      animation: { windup: ['jabTell'], active: ['jab'], recovery: ['jab'] },
    },
    fil4: {
      name: 'FILIBUSTER (4)',
      windupFrames: 14, activeFrames: 8, recoveryFrames: 36,
      damage: 9,
      avoidBy: ['dodgeL', 'dodgeR', 'duck'],
      counterWindow: null, starWindow: null,
      sfx: { swing: 'swingHeavy' },
      animation: { windup: ['hookTell'], active: ['hook'], recovery: ['hookTell', 'idle1'] },
    },
    taxHike: {
      name: 'TAX HIKE',
      windupFrames: 24, activeFrames: 8, recoveryFrames: 32,
      damage: 14,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [8, 21],
      starWindow: null,
      sfx: { tell: 'grunt', swing: 'swingHeavy' },
      animation: { windup: ['upperLTell'], active: ['upperL'], recovery: ['upperL', 'idle1'] },
    },
    landslide: {
      name: 'LANDSLIDE VICTORY',
      windupFrames: 30, activeFrames: 10, recoveryFrames: 44,
      damage: 18,
      avoidBy: ['dodgeL', 'dodgeR'],
      counterWindow: [8, 27],
      starWindow: [12, 24],
      kdWindow: [22, 25],  // perfect hit
      sfx: { tell: 'fanfare', swing: 'swingHeavy' },
      animation: { windup: ['overheadTell1', 'overheadTell2'], windupRate: 8, active: ['overhead1', 'overhead2'], recovery: ['overheadRecover', 'idle1'] },
    },
  },

  patterns: [
    {
      id: 'campaignTrail', weight: 2,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 60 }, { move: 'handshake' }, { idle: 50 },
        { open: 100, anim: 'wave', id: 'wave', star: [0, 34], comboLimit: 7, sfx: 'crowd' },
        { idle: 40 }, { move: 'ribbon' }, { idle: 40 }, { move: 'fil1' }, { move: 'fil2' }, { move: 'fil3' }, { move: 'fil4' },
        { idle: 50 }, { move: 'landslide' }, { idle: 50 }, { taunt: 60 },
      ],
    },
    {
      id: 'townHall', weight: 1,
      when: { rounds: [1], health: [0.5, 1] },
      steps: [
        { idle: 50 }, { move: 'taxHike' }, { idle: 40 },
        { open: 100, anim: 'wave', id: 'wave', star: [0, 34], comboLimit: 7, sfx: 'crowd' },
        { idle: 40 }, { move: 'handshake' }, { idle: 30 }, { move: 'ribbon' }, { idle: 50 }, { taunt: 60 },
      ],
    },
    {
      id: 'reelection', weight: 2,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 40 }, { move: 'fil1' }, { move: 'fil2' }, { move: 'fil3' }, { move: 'fil4' }, { idle: 30 },
        { open: 84, anim: 'wave', id: 'wave', star: [0, 30], comboLimit: 7, sfx: 'crowd' },
        { idle: 30 }, { move: 'landslide' }, { idle: 30 }, { move: 'ribbon' }, { idle: 20 }, { move: 'handshake' },
        { idle: 36 }, { move: 'taxHike' }, { idle: 40 }, { taunt: 44 },
      ],
    },
    {
      id: 'pressConference', weight: 1,
      when: { rounds: [2, 3], health: [0.5, 1] },
      steps: [
        { idle: 36 }, { move: 'handshake' }, { idle: 16 }, { move: 'taxHike' }, { idle: 30 },
        { open: 84, anim: 'wave', id: 'wave', star: [0, 30], comboLimit: 7, sfx: 'crowd' },
        { idle: 24 }, { move: 'fil1' }, { move: 'fil2' }, { move: 'fil3' }, { move: 'fil4' },
        { idle: 30 }, { move: 'landslide' }, { idle: 40 }, { taunt: 40 },
      ],
    },
    {
      id: 'scandal', weight: 1,
      when: { health: [0, 0.5] },
      steps: [
        { idle: 30 }, { move: 'landslide' }, { idle: 24 }, { move: 'fil1' }, { move: 'fil2' }, { move: 'fil3' }, { move: 'fil4' },
        { idle: 24 }, { move: 'ribbon' }, { idle: 16 }, { move: 'taxHike' }, { idle: 30 },
        { open: 80, anim: 'wave', id: 'wave', star: [0, 28], comboLimit: 6, sfx: 'crowd' },
        { idle: 30 }, { taunt: 36 },
      ],
    },
  ],

  // his super: thrown once or twice a round after he backs off and taunts (super.js)
  super: { hit: 'head', move: 'landslide', golden: 'windup', taunt: 46, shout: 'LANDSLIDE!', times: [1, 2] },

  getUpTable: [
    { upAt: [5, 7], health: 0.6 },
    { upAt: [7, 9], health: 0.5 },
    { upAt: [9, 9], stayDown: 0.3, health: 0.4 },
    { upAt: null },
  ],


  // --- the knowledge layer (knowledge spec K3; src/fight/knowledge.js) ---
  // A champion (K4): 3 exploits, 2 anti-strategies, 2 scripted moments.
  exploits: [
    {
      id: 'lostHisPlace', type: 'patternBreak', name: 'LOST HIS PLACE',
      trigger: { state: 'windup', move: 'fil1', counter: true },
      effect: { cancelMoves: ['fil2', 'fil3', 'fil4'], stun: 80, hits: 8, say: 'HE LOST HIS PLACE!' },
      hint: { kind: 'trainer', text: 'CUT THE FILIBUSTER SHORT.' },
      scout: 'COUNTER THE FIRST FILIBUSTER PUNCH: THE OTHER THREE NEVER COME, AND HE\'S STUNNED FOR 8 HITS.',
    },
    {
      id: 'photoOp', type: 'stunTrigger', name: 'PHOTO OP',
      trigger: { state: 'open', open: 'wave', frames: [36, 44], height: 'high' },
      effect: { stun: 90, hits: 7, mod: { cheer: -0.3 }, say: 'BLINDED BY THE FLASH!', sfx: 'flashbulb' },
      hint: { kind: 'visual', text: 'A CAMERA FLASHES IN THE CROWD MID-WAVE.' },
      scout: 'A HEAD SHOT ON THE CAMERA FLASH WHILE HE WAVES: STUNNED FOR 7 HITS AND THE CHEER METER DROPS.',
    },
    {
      id: 'recount', type: 'quirk', name: 'RECOUNT',
      trigger: { state: 'open', open: 'recount', first: true },
      effect: { keep: true, star: true, mod: { cheer: -1 }, say: 'THE CROWD TURNS ON HIM!' },
      hint: { kind: 'trainer', text: 'WHEN HE\'S HURT HE DEMANDS A RECOUNT.' },
      scout: 'UNDER 35% HE DEMANDS A RECOUNT: THE FIRST HIT EARNS A STAR AND EMPTIES THE CHEER METER.',
    },
  ],
  antiStrategies: [
    {
      id: 'playsToCrowd', type: 'passivity', name: 'PLAYS TO THE CROWD', response: 'cheer', frames: 240, mult: 4, say: 'THE CROWD\'S RESTLESS!',
      scout: 'STAND AROUND WAITING AND THE CHEER METER FILLS FOUR TIMES AS FAST.',
    },
    {
      id: 'taxHike', type: 'starHoard', name: 'TAX HIKE', moves: ['taxHike', 'ribbon', 'handshake'], hold: 420, on: ['hit', 'blocked'], say: 'TAXED: ONE STAR!',
      scout: 'SIT ON THREE STARS FOR 7 SECONDS AND HIS PUNCHES COLLECT ONE, EVEN WHEN YOU BLOCK THEM.',
    },
  ],
  scriptedMoments: [
    {
      id: 'campaignPromise', name: 'CAMPAIGN PROMISE', when: { left: 60 }, say: 'A CAMPAIGN PROMISE!',
      steps: [{ open: 70, anim: 'wave', id: 'wave', star: [0, 24], comboLimit: 6, sfx: 'crowd' }, { idle: 16 }, { move: 'fil1' }, { move: 'fil2' }, { move: 'fil3' }, { move: 'fil4' }],
    },
    { id: 'demandsRecount', name: 'DEMANDS A RECOUNT', when: { health: 0.35 }, say: 'I DEMAND A RECOUNT!', steps: [{ open: 90, anim: 'wave', id: 'recount', comboLimit: 6 }] },
  ],
  props: [{ type: 'cameraFlash', open: 'wave', frames: [36, 44], x: 60, y: 74 }],
  special: [{ type: 'crowdMeter', rate: 1 / 2700, wave: 'wave', waveMult: 3, onLand: 0.12, drainOnHit: 0.05, mult: 1.5, palette: 'mcbride.hype' }],
  // Title Defense remix: the re-election campaign.
  titleDefense: {
    nickname: 'FOUR MORE YEARS',
    quote: 'I DEMAND A RECOUNT! AND THIS TIME, I\'M COUNTING.',
    lines: { win: 'THE PEOPLE HAVE SPOKEN. LOUDLY.', lose: 'I... CONCEDE... THE RACE...' },
    tell: 0.75,
    costume: { B: { navyHi: [22, 9, 11], navy: [14, 4, 6], navyDk: [7, 2, 3], sashHi: [12, 16, 29], sash: [6, 9, 21], sashDk: [3, 4, 11] } },
    moves: {
      // new: a sweeping low hook across the ballot box: duck it
      recount: {
        name: 'RECOUNT',
        windupFrames: 24, activeFrames: 10, recoveryFrames: 30,
        damage: 13,
        avoidBy: ['duck'],
        counterWindow: [8, 21],
        starWindow: null,
        sfx: { tell: 'tick', swing: 'swingHeavy' },
        animation: { windup: ['sweepTell'], active: ['sweep1', 'sweep2'], recovery: ['sweep2', 'idle1'] },
      },
      // new: a lone left hook
      veto: {
        name: 'VETO',
        windupFrames: 22, activeFrames: 8, recoveryFrames: 28,
        damage: 13,
        avoidBy: ['dodgeR', 'duck'],
        counterWindow: [8, 19],
        starWindow: [8, 12],
        sfx: { tell: 'aha', swing: 'swingHeavy' },
        animation: { windup: ['hookLTell'], active: ['hookL'], recovery: ['hookLTell', 'idle1'] },
      },
    },
    patterns: [
      {
        id: 'secondTerm', weight: 3,
        when: { rounds: [1], health: [0.5, 1] },
        steps: [
          { idle: 50 }, { move: 'veto' }, { idle: 40 },
          { open: 100, anim: 'wave', id: 'wave', star: [0, 34], comboLimit: 7, sfx: 'crowd' },
          { idle: 40 }, { move: 'recount' }, { idle: 44 }, { move: 'fil1' }, { move: 'fil2' }, { move: 'fil3' }, { move: 'fil4' },
          { idle: 44 }, { move: 'landslide' }, { idle: 50 }, { taunt: 56 },
        ],
      },
      {
        id: 'recountNight', weight: 3,
        when: { rounds: [2, 3], health: [0.5, 1] },
        steps: [
          { idle: 36 }, { move: 'recount' }, { idle: 30 }, { move: 'handshake' }, { idle: 24 }, { move: 'veto' },
          { idle: 30 }, { open: 84, anim: 'wave', id: 'wave', star: [0, 30], comboLimit: 7, sfx: 'crowd' },
          { idle: 26 }, { move: 'taxHike' }, { idle: 30 }, { move: 'landslide' }, { idle: 36 }, { taunt: 40 },
        ],
      },
    ],
  },
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  // challenge medals (data/medals.js): the Gold is his signature challenge
  gallery: 'THE MAYOR AND THE METRO CHAMPION. HE WORKS THE CROWD BETWEEN PUNCHES, AND THE CROWD WORKS FOR HIM.', // bio for the fighter gallery (§16)
  // challenge medals (data/medals.js): the Gold is his signature challenge
  medals: { signature: { text: 'NEVER LET THE CROWD METER FILL.', check: 'noCue', cue: '!crowdFull' } },
  music: 'mcbrideEntrance',
};
