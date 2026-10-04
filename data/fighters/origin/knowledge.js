// ORIGIN's knowledge layer (spec §17, K3/K4): exploits, anti-strategies and scripted moments for ORIGIN and for his true form. A boss's count: 3+ exploits, 2+
// anti-strategies and 2+ scripted moments; his supers' golden moments are in build.js. Every exploit has a hint (the corner, data/hints/origin.js) and a scouting text.
//   ORIGIN        belts slipped, the First Punch slipped, an arena's seam, a style's signature undone
//   TRUE FORM     the ring slipped, a fragment's collision slipped, an afterimage undone, the First Punch slipped (a longer opening, a tighter window)
const asw = (T) => ({
  jab: { type: 'jabSpam', streak: 3, counter: 'ans', say: 'PARRIED!' },
  turtle: { type: 'turtling', response: 'drain', share: 0.4, span: 480, every: 46, say: 'NOTHING TO HOLD ONTO!' },
  early: { type: 'earlyDodge', response: 'hold', moves: ['hook', 'hookL', 'jab'], say: 'HELD IT!' },
  bias: { type: 'dodgeBias', moves: ['jab', 'cross'], min: 6, share: 0.75, say: 'YOUR FAVORITE SIDE!' },
  hoard: { type: 'starHoard', moves: ['jab', 'hook', 'hookL', 'body'], say: 'STAR ERASED!' },
  zone: { type: 'zoneBias', frames: 480, say: 'I KNOW WHERE YOU PUNCH!' },
  passive: { type: 'passivity', response: 'buff', frames: 240, gain: 1 / (T ? 380 : 440), decay: 1 / 220, dmg: 0.3, rec: 0.1, meter: 'REMEMBERING', say: 'HE LEARNED YOU WAIT!' },
  rush: { type: 'rushing', span: 150, count: 2, counter: ['ans'], say: 'TOO EAGER!' },
  repeat: { type: 'comboRepeat', gap: 45, counter: ['ans'], say: 'SAME AGAIN?' },
});

export function originKnowledge(T) {
  const slipOpen = (id, name, moves, result, text, scout, hint, o = {}) => ({
    id, type: 'quirk', name, limit: o.limit ?? 3,
    trigger: { on: 'resolved', move: moves, result, ...(o.dir ? { dir: o.dir } : {}) },
    effect: { open: { frames: o.frames ?? 92, anim: 'flicker', comboLimit: o.hits ?? 6, star: [0, 30] }, say: text, sfx: o.sfx || 'thud' },
    hint: { kind: hint[0], text: hint[1], ...(o.hidden ? { hidden: true } : {}) },
    scout,
  });
  const exploits = T
    ? [
      slipOpen('ringSlipped', 'THE RING MISSES', ['rf_low', 'rf_rise'], ['ducked', 'dodged'], 'THE RING MISSES!', 'SLIP OR DUCK THE RING SWEEP OR THE RISING RING OF HIS FIRE (THE TWO THAT ARE NOT THE LAST): HE IS OPEN FOR 6 HITS, THE FIRST A STAR. UP TO THREE TIMES A FIGHT.', ['visual', 'THE FIRE RING LEAVES HIM WHEN IT SWINGS: A MISS LEAVES THE HALO EMPTY.'], { frames: 96, hits: 6 }),
      slipOpen('collisionMissed', 'THE FRAGMENTS MISS', ['co_in'], 'dodged', 'NOTHING TO COLLIDE WITH!', 'SLIP THE MOMENT THE FRAGMENTS MEET (THE FIRST BLOW OF COLLISION, THE SLOW ONE): HE IS OPEN FOR 6 HITS, THE FIRST A STAR. UP TO THREE TIMES A FIGHT.', ['audio', 'THE ARENAS RUMBLE BEFORE THEY MEET. WHEN THEY HIT NOTHING THERE IS NOTHING BEHIND THEM.'], { frames: 100, hits: 6 }),
      slipOpen('shadowUndone', 'THE SHADOW UNDONE', ['af_hookL', 'af_bodyR'], 'dodged', 'THE SHADOW FADES!', 'SLIP TO THE RIGHT OF THE LEFT HOOK OR THE RIGHT BODY BLOW HIS AFTERIMAGE THROWS (THE SECOND OF THEIR PAIRS): HE IS OPEN FOR 5 HITS, THE FIRST A STAR. UP TO THREE TIMES A FIGHT.', ['visual', 'THE GHOST OF HIM THROWS THE SAME BLOW A BEAT LATE, FROM THE FAR SIDE. SLIP THAT ONE THE WAY IT POINTS AND THE GHOST GOES OUT.'], { hits: 5, dir: 'R' }),
      slipOpen('firstWhiffs', 'ALL THAT FOR NOTHING', ['fp', 'fa_punch'], 'dodged', 'THE FIRST PUNCH WHIFFS!', 'SLIP THE FIRST PUNCH (THE ONE THAT SLOWS THE SCREEN): HIS ARM HAS NOWHERE TO GO. HE IS OPEN FOR 8 HITS, THE FIRST A STAR. ONCE A FIGHT.', ['audio', 'THE FIRST PUNCH TAKES ALL OF HIM WITH IT. MISS AND HE\'S HANGING THERE.'], { limit: 1, frames: 130, hits: 8, hidden: true, sfx: 'crash' }),
    ]
    : [
      slipOpen('beltOutOfPlace', 'A BELT OUT OF PLACE', ['halo_L', 'halo_R', 'hf_L', 'hf_R'], 'dodged', 'A BELT OUT OF PLACE!', 'SLIP THE SIDE OF A BELT SLAM THAT GLOWED FIRST (NOT THE WHOLE HALO): THE BELT THAT FELL LEAVES HIS HALO WITH A GAP AND HE IS OPEN FOR 6 HITS, THE FIRST A STAR. UP TO THREE TIMES A FIGHT.', ['visual', 'THE BELT THAT COMES DOWN LEAVES A HOLE IN THE HALO. WATCH IT.'], { hits: 6 }),
      slipOpen('firstWhiffs', 'ALL THAT FOR NOTHING', ['fp'], 'dodged', 'THE FIRST PUNCH WHIFFS!', 'SLIP THE FIRST PUNCH (THE ONE THAT SLOWS THE SCREEN): HIS ARM HAS NOWHERE TO GO. HE IS OPEN FOR 8 HITS, THE FIRST A STAR. ONCE A FIGHT.', ['audio', 'THE FIRST PUNCH TAKES ALL OF HIM WITH IT. MISS AND HE\'S HANGING THERE.'], { limit: 1, frames: 130, hits: 8, hidden: true, sfx: 'crash' }),
      {
        id: 'theSeam', type: 'stunTrigger', name: 'THE SEAM', limit: 3,
        trigger: { state: 'windup', move: STYLE_FLICKS, frames: [6, 10], clean: 26 },
        effect: { stun: 96, hits: 6, star: true, say: 'BETWEEN PLACES!', sfx: 'glitch' },
        hint: { kind: 'audio', text: 'THE ARENA GLITCHES A MOMENT BEFORE IT CHANGES. HE IS BETWEEN PLACES.' },
        scout: 'HIT HIM WHILE THE ARENA IS FLICKERING (THE MIDDLE OF THE FLICKER CALL BEFORE A STYLE): HE IS BETWEEN PLACES, STUNNED FOR 6 HITS, THE FIRST A STAR. UP TO THREE TIMES A FIGHT.',
      },
      slipOpen('ownStyleUndone', 'HIS OWN STYLE, UNDONE', ['sig_gus', 'sig_brody', 'sig_mcbride', 'sig_midnight', 'sig_rex', 'sig_baron', 'sig_maestro', 'sig_avalanche', 'sig_mirror', 'sig_karver', 'sig_warden', 'sig_eclipse'], 'dodged', 'STYLE UNDONE!', 'SLIP THE SIGNATURE OF ANY OF THE TWELVE STYLES (THE BLOW AFTER THE ECHO): HE IS OPEN FOR 5 HITS, THE FIRST A STAR. UP TO THREE TIMES A FIGHT.', ['visual', 'WHEN HE WEARS A CHAMPION\'S COLOURS HE OWES THEM THEIR BIG ONE. MAKE IT MISS.'], { hits: 5, hidden: true }),
    ];
  const antiStrategies = [
    { id: 'rememberedYou', type: 'adapt', name: T ? 'HE REMEMBERED YOU' : 'HE LEARNED FROM EVERYONE', after: T ? 900 : 1100, demo: 'turtle', say: 'HE ADAPTS!', answers: asw(T),
      scout: 'HE WATCHES WHAT YOU DO. AFTER 15 TO 20 SECONDS THE TWO THINGS YOU LEAN ON MOST (TURTLING, JAB SPAM, EARLY DODGES, ONE-SIDED SLIPS, HOARDED STARS, ONE-ZONE PUNCHING, WAITING, RUSHING, REPEATED COMBOS) GET THEIR ANSWER, UNTIL YOU STOP.' },
    { id: 'nothingBeforeHim', type: 'turtling', name: 'NOTHING TO HOLD ONTO', response: 'drain', share: 0.4, span: 480, every: 50, say: 'YOUR GUARD IS EMPTY!',
      scout: 'KEEP YOUR GUARD UP TOO LONG AND YOUR HEARTS DRAIN WHILE YOU BLOCK.' },
    { id: 'backToTheBeginning', type: 'getUpMash', name: 'BACK TO THE BEGINNING', response: 'harder', punches: 3, mult: 1.3, say: 'BACK TO THE BEGINNING!',
      scout: 'MASH BACK UP AFTER A KNOCKDOWN AND HIS NEXT 3 PUNCHES HIT 30% HARDER.' },
    { id: T ? 'guardsTheHead' : 'guardsTheHeadFirst', type: 'zoneBias', name: T ? 'THE FIRST GUARD' : 'THE FIRST COVER', zone: 'head', streak: 4, frames: 420, say: 'HE COVERS UP!',
      scout: 'HIT HIS HEAD FOUR TIMES IN A ROW AND HE COVERS IT FOR A WHILE (A COUNTER, A PUNISH OR AN OPENING STILL GETS THROUGH).' },
  ];
  const scriptedMoments = T
    ? [
      { id: 'firstBelt', name: 'THE FIRST BELT', when: { left: 130, round: 1 }, say: 'THE FIRST BELT!', steps: [{ idle: 20 }, { move: 'halo_L' }, { idle: 20 }, { move: 'halo_R' }, { idle: 20 }, { move: 'halo_R' }, { idle: 30 }] },
      { id: 'secondFlicker', name: 'THE ARENAS MEET', when: { left: 100, round: 2 }, say: 'THE ARENAS MEET!', steps: [{ idle: 20 }, { move: 'co_in' }, { idle: 24 }, { move: 'co_shrapL' }, { idle: 24 }, { move: 'co_in' }, { idle: 30 }] },
      { id: 'burningHalo', name: 'THE HALO BURNS', when: { left: 80, round: 3 }, say: 'THE HALO BURNS!', steps: [{ idle: 20 }, { move: 'rf_low' }, { idle: 36 }, { move: 'rf_rise' }, { idle: 30 }, { move: 'rf_squeeze' }, { idle: 30 }] },
      { id: 'theLastFrame', name: 'THE LAST FRAME', when: { health: 0.3 }, say: 'THE LAST FRAME!', steps: [{ idle: 18 }, { move: 'jab' }, { idle: 10 }, { move: 'hook' }, { idle: 10 }, { move: 'hookL' }, { idle: 10 }, { move: 'upper' }, { idle: 30 }] },
    ]
    : [
      { id: 'firstRound', name: 'THE FIRST ROUND', when: { left: 130, round: 1 }, say: 'THE FIRST ROUND!', steps: [{ idle: 20 }, { move: 'jab' }, { idle: 14 }, { move: 'cross' }, { idle: 14 }, { move: 'hook' }, { idle: 30 }] },
      { id: 'secondBelt', name: 'THE SECOND BELT', when: { left: 90, round: 2 }, say: 'A BELT FALLS!', steps: [{ idle: 20 }, { move: 'halo_L' }, { idle: 24 }, { move: 'halo_R' }, { idle: 30 }] },
      { id: 'theLastFrame', name: 'THE LAST FRAME', when: { health: 0.3 }, say: 'THE LAST FRAME!', steps: [{ idle: 18 }, { move: 'jab' }, { idle: 10 }, { move: 'hookL' }, { idle: 10 }, { move: 'bodyR' }, { idle: 30 }] },
    ];
  return { exploits, antiStrategies, scriptedMoments };
}
const STYLE_FLICKS = ['gus', 'brody', 'mcbride', 'midnight', 'rex', 'baron', 'maestro', 'avalanche', 'mirror', 'karver', 'warden', 'eclipse'].map((c) => `flick_${c}`);
