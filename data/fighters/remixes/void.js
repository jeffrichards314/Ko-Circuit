// Title Defense, Void division (spec §6, K4): the remix blocks of the twelve Hollowed. (Dash Unbound's and ZERO's true form's are in ascension.js.)
// The Hollowed are fought as BOSSES in Title Defense (`boss: true`): the knowledge counts of a boss (3 exploits, 2 anti-strategies, 2 scripted moments),
// and two or three supers a round. Their golden moments stay instant knockdowns (the stun of the six big bosses protects their phases; the Hollowed have none).
// Each is a `titleDefense` block like every remix (data/fighters/titleDefense.js): a new nickname and quote, a new knowledge layer none of whose entries
// is the original fight's (tools/remix-audit.mjs proves it), and the attack that exists only here (remixes/exclusive.js). The Void's own rules keep
// applying: the circuit's hearts and tells, the shard's own restriction on the defenses (a Block Shard's blows can only be blocked, and so on),
// the directional wrong-defense damage, knockout only.
import { X, A, S } from './kit.js';

// (their tells are already at the Void's: a remix only quickens them a little, and not at all where the tell is the fight: the Counter Shard's
// flashes, the Rhythm Shard's beat, the Memory Shard's tick)
const base = { boss: true, supersPerRound: [2, 3], costume: 'shift' };

export default {
  // -- #108 The Dodge Shard: the second wind
  dodgeShard: {
    ...base, tell: 0.9,
    nickname: 'THE SECOND WIND', quote: 'I RAN ONCE. NOW I ONLY CHASE. STAND STILL AND SEE.', lines: { win: 'YOU STOOD. YOU ALWAYS STAND.', lose: 'THE RACE... IS OVER...' },
    exploits: [
      X.slip('leapLands', 'THE LEAP LANDS', 'upper', { hits: 6, star: 28, hint: ['visual', 'THE LEAP TAKES BOTH FEET OFF THE FLOOR.'] }),
      X.getUp('cramp', 'A CRAMP', { hits: 5, star: 24, hint: ['quote', 'EVEN A RUNNER STOPS WHEN HE FALLS.'] }),
      X.cancel('brokenStride', 'A BROKEN STRIDE', 'haymaker', { late: 5, cancel: ['jab', 'cross'], star: true, hint: ['visual', 'AT THE END OF THE FULL STRIDE HE LEANS ON HIS FRONT FOOT.'] }),
    ],
    antiStrategies: [
      A.buff('catchesHisWind', 'CATCHES HIS WIND', { frames: 300, dmg: 0.25, rec: 0.2, meter: 'STRIDE', say: 'HE CATCHES HIS WIND!' }),
      A.rushing('outpacesYou', 'OUTPACES YOU', { count: 3, counter: 'upper', say: 'OUTPACED!' }),
    ],
    scriptedMoments: [
      S.clock('secondWind', 'SECOND WIND', 100, [{ idle: 22 }, { move: 'jab' }, { idle: 8 }, { move: 'cross' }, { idle: 8 }, { move: 'hook' }, { idle: 8 }, { move: 'hookL' }, { idle: 8 }, { move: 'upper' }, { idle: 30 }]),
      S.health('theLastLap', 'THE LAST LAP', 0.35, [{ idle: 22 }, { move: 'body' }, { idle: 8 }, { move: 'bodyR' }, { idle: 8 }, { move: 'hookL' }, { idle: 8 }, { move: 'hook' }, { idle: 30 }]),
    ],
  },

  // -- #109 The Block Shard: the long siege
  blockShard: {
    ...base, tell: 0.9,
    nickname: 'THE LONG SIEGE', quote: 'EVERY WALL FALLS IF YOU PUSH LONG ENOUGH. PUSH, THEN.', lines: { win: 'THE WALL HOLDS. IT ALWAYS HOLDS.', lose: 'THE GATE... IS OPEN...' },
    exploits: [
      X.slip('ramBroken', 'THE RAM BREAKS', 'upper', { result: 'blocked', hits: 6, star: 28, hint: ['audio', 'THE RAM UPPERCUT GROANS AS IT LEAVES THE GROUND.'] }),
      X.blocks('dugIn', 'DUG IN', { n: 5, hits: 5, hint: ['visual', 'FIVE BLOCKS AND HE LEANS ON THE WALL HIMSELF.'] }),
      X.passive('guardDropped', 'THE GUARD DROPS', { seconds: 6, hits: 4, say: 'HIS GUARD DROPS!', hint: ['quote', 'A WALL NEVER ASKS WHY NOBODY COMES.'] }),
    ],
    antiStrategies: [
      A.jabSpam('shieldWall', 'THE SHIELD WALL', { streak: 4, counter: 'bulwark', say: 'SHIELD WALL!' }),
      A.getUpMash('risesWithTheTide', 'RISES WITH THE TIDE', { punches: 3, mult: 1.3, say: 'HE RISES!' }),
    ],
    scriptedMoments: [
      S.clock('firstStone', 'THE FIRST STONE', 100, [{ idle: 24 }, { move: 'jab' }, { idle: 14 }, { move: 'hook' }, { idle: 20 }, { move: 'body' }, { idle: 14 }, { move: 'bulwark' }, { idle: 30 }]),
      S.health('theLastGate', 'THE LAST GATE', 0.35, [{ idle: 24 }, { move: 'upper' }, { idle: 12 }, { move: 'bodyR' }, { idle: 12 }, { move: 'hookL' }, { idle: 12 }, { move: 'bulwark' }, { idle: 30 }]),
    ],
  },

  // -- #110 The Duck Shard: the low road
  duckShard: {
    ...base, tell: 0.9,
    nickname: 'THE LOW ROAD HOME', quote: 'KEEP YOUR HEAD DOWN AND YOUR EYES UP. IT IS A LONG ROAD.', lines: { win: 'YOU STOOD UP TOO SOON.', lose: 'THE LAST DANCE... ENDS...' },
    exploits: [
      X.slip('draggedOut', 'DRAGGED OUT', 'drag', { result: 'ducked', hits: 5, star: 26, hint: ['visual', 'THE DRAG TAKES HIM FLAT TO THE CANVAS.'] }),
      X.getUp('twistedAnkle', 'A TWISTED ANKLE', { hits: 5, star: 24, hint: ['quote', 'A DANCER FALLS ON HIS FEET. NOT THIS TIME.'] }),
      X.counter('stampedOn', 'STAMPED ON', 'drag', { late: 3, hits: 6, hint: ['audio', 'THE DRAG COMES WITH A LITTLE STAMP OF THE FOOT.'] }),
    ],
    antiStrategies: [
      A.comboRepeat('followsTheStep', 'FOLLOWS YOUR STEP', { counter: 'drag', delay: 16, say: 'HE FOLLOWS YOU!' }),
      A.buff('lightOnHisFeet', 'LIGHT ON HIS FEET', { frames: 300, dmg: 0.25, rec: 0.2, meter: 'RHYTHM', say: 'LIGHT ON HIS FEET!' }),
    ],
    scriptedMoments: [
      S.clock('tapDance', 'THE TAP DANCE', 100, [{ idle: 22 }, { move: 'flick' }, { idle: 12 }, { move: 'flick' }, { idle: 12 }, { move: 'sweep' }, { idle: 12 }, { move: 'drag' }, { idle: 30 }]),
      S.health('finalCurtain', 'THE FINAL CURTAIN', 0.35, [{ idle: 22 }, { move: 'scythe' }, { idle: 20 }, { move: 'sweep' }, { idle: 12 }, { move: 'scythe' }, { idle: 30 }]),
    ],
  },

  // -- #111 The Counter Shard: the last answer
  counterShard: {
    ...base, tell: 1,
    nickname: 'THE FINAL QUESTION', quote: 'I HAVE ANSWERED EVERYTHING YOU EVER ASKED. ASK AGAIN.', lines: { win: 'YOU HAD NO ANSWER.', lose: 'AN ANSWER... AT LAST...' },
    exploits: [
      X.slip('flecheMissed', 'THE FLECHE MISSES', 'upper', { hits: 6, star: 28, hint: ['visual', 'THE FLECHE IS THE ONE THAT LEANS FORWARD.'] }),
      X.slip('answerMisses', 'THE ANSWER MISSES', 'hookL', { dir: 'R', hits: 5, star: 26, hint: ['visual', 'THE SABRE COMES OVER HIS LEFT SHOULDER, SLOW AND WIDE.'] }),
      X.passive('noQuestion', 'NO QUESTION ASKED', { seconds: 6, hits: 4, say: 'NO QUESTION!', hint: ['audio', 'ASK HIM NOTHING AND HE FILLS THE SILENCE.'] }),
    ],
    antiStrategies: [
      A.earlyDodge('answersEarly', 'ANSWERS EARLY', { moves: ['hook', 'hookL'], say: 'HE ANSWERS EARLY!' }),
      A.comboRepeat('sameQuestion', 'THE SAME QUESTION', { counter: 'rebuke', delay: 14, say: 'ASKED BEFORE!' }),
    ],
    scriptedMoments: [
      S.clock('openingQuestion', 'THE OPENING QUESTION', 100, [{ idle: 24 }, { move: 'jab' }, { idle: 16 }, { move: 'cross' }, { idle: 16 }, { move: 'hook' }, { idle: 30 }]),
      S.health('theLastQuestion', 'THE LAST QUESTION', 0.35, [{ idle: 24 }, { move: 'upper' }, { idle: 16 }, { move: 'bodyR' }, { idle: 16 }, { move: 'hookL' }, { idle: 30 }]),
    ],
  },

  // -- #112 The Sight Shard: the open eye
  sightShard: {
    ...base, tell: 0.9,
    nickname: 'THE OPEN EYE', quote: 'I HAVE NOT BLINKED SINCE THE BEGINNING. WATCH ME NOT BLINK.', lines: { win: 'YOU LOOKED AWAY.', lose: 'THE EYE... CLOSES...' },
    exploits: [
      X.slip('browLowered', 'THE BROW LOWERS', 'upper', { hits: 6, star: 28, hint: ['visual', 'THE BROW RISES HIGH BEFORE THE UPPERCUT.'] }),
      X.getUp('blinkingBack', 'BLINKING BACK', { hits: 5, star: 24, hint: ['quote', 'A MAN ON THE FLOOR SEES ONLY THE FLOOR.'] }),
      X.blocks('staredDown', 'STARED DOWN', { n: 4, hits: 5, hint: ['visual', 'KEEP YOUR GUARD UP AND HE STARES AT IT.'] }),
    ],
    antiStrategies: [
      A.jabSpam('staresBack', 'STARES BACK', { streak: 4, counter: 'upper', say: 'STARED BACK!' }),
      A.starHoard('seesYourStars', 'SEES YOUR STARS', { hold: 420, moves: ['jab', 'cross', 'body'], say: 'HE SEES YOUR STARS!' }),
    ],
    scriptedMoments: [
      S.clock('lidsHeavy', 'HEAVY LIDS', 100, [{ idle: 22 }, { move: 'sweep' }, { idle: 20 }, { move: 'jab' }, { idle: 10 }, { move: 'hook' }, { idle: 10 }, { move: 'body' }, { idle: 30 }]),
      S.health('wideAwake', 'WIDE AWAKE', 0.35, [{ idle: 22 }, { move: 'upper' }, { idle: 12 }, { move: 'hookL' }, { idle: 12 }, { move: 'bodyR' }, { idle: 30 }]),
    ],
  },

  // -- #113 The Sound Shard: the loud passage
  soundShard: {
    ...base, tell: 0.9,
    nickname: 'THE LOUD PASSAGE', quote: 'LISTEN TO THE QUIET. EVERYTHING I SAY IS IN IT.', lines: { win: 'YOU HEARD NOTHING.', lose: 'THE SILENCE... AT LAST...' },
    exploits: [
      X.slip('flatNote', 'A FLAT NOTE', 'hook', { hits: 5, star: 26, hint: ['audio', 'THE RISING TONE CLIMBS A LITTLE TOO HIGH.'] }),
      X.getUp('ringingEars', 'RINGING EARS', { hits: 5, star: 24, hint: ['quote', 'EVEN THE LISTENER CANNOT HEAR HIMSELF FALL.'] }),
      X.blocks('muffled', 'MUFFLED', { n: 4, hits: 5, hint: ['audio', 'A GUARD DEAF TO THE CLICK, A MAN DEAF TO THE BLOCK.'] }),
    ],
    antiStrategies: [
      A.comboRepeat('echoesYou', 'ECHOES YOU', { counter: 'cross', delay: 14, say: 'HE ECHOES YOU!' }),
      A.jabSpam('hearsTheJabs', 'HEARS THE JABS', { streak: 4, counter: 'upper', say: 'HEARD YOU!' }),
    ],
    scriptedMoments: [
      S.clock('crescendo', 'A CRESCENDO', 100, [{ idle: 22 }, { move: 'jab' }, { idle: 10 }, { move: 'hook' }, { idle: 10 }, { move: 'upper' }, { idle: 10 }, { move: 'sweep' }, { idle: 30 }]),
      S.health('fortissimo', 'FORTISSIMO', 0.35, [{ idle: 22 }, { move: 'bodyR' }, { idle: 12 }, { move: 'hookL' }, { idle: 12 }, { move: 'upper' }, { idle: 30 }]),
    ],
  },

  // -- #114 The Rhythm Shard: the odd bar
  rhythmShard: {
    ...base, tell: 1,
    nickname: 'THE ODD BAR', quote: 'COUNT WITH ME. ONE, TWO, THREE... NO. I MISCOUNTED ON PURPOSE.', lines: { win: 'YOU LOST THE COUNT.', lose: 'THE LAST BEAT... DROPS...' },
    exploits: [
      X.slip('crashMissed', 'CRASH AND BURN', 'crash', { hits: 6, star: 28, hint: ['audio', 'THE CRASH RINGS LONGER THAN THE REST.'] }),
      X.getUp('droppedSticks', 'DROPPED STICKS', { hits: 5, star: 24, hint: ['quote', 'THE DRUMMER ALWAYS PICKS UP HIS STICKS FIRST.'] }),
      X.passive('restBars', 'A REST BAR', { seconds: 6, hits: 4, say: 'A REST BAR!', hint: ['quote', 'EVERY SONG HAS A REST. WAIT FOR IT.'] }),
    ],
    antiStrategies: [
      A.rushing('onTheOne', 'ON THE ONE', { count: 3, counter: 'crash', say: 'ON THE ONE!' }),
      A.comboRepeat('repeatsTheBar', 'REPEATS THE BAR', { counter: 'upper', delay: 14, say: 'REPEAT THE BAR!' }),
    ],
    scriptedMoments: [
      S.clock('fourOnTheFloor', 'FOUR ON THE FLOOR', 100, [{ idle: 22 }, { move: 'body' }, { idle: 10 }, { move: 'bodyR' }, { idle: 10 }, { move: 'body' }, { idle: 10 }, { move: 'bodyR' }, { idle: 30 }]),
      S.health('theDrumSolo', 'THE DRUM SOLO', 0.35, [{ idle: 22 }, { move: 'jab' }, { idle: 8 }, { move: 'cross' }, { idle: 8 }, { move: 'upper' }, { idle: 8 }, { move: 'crash' }, { idle: 30 }]),
    ],
  },

  // -- #115 The Memory Shard: the forgotten verse
  memoryShard: {
    ...base, tell: 1,
    nickname: 'THE FORGOTTEN VERSE', quote: 'I REMEMBER EVERY LINE. DO YOU REMEMBER WHAT YOU CAME FOR?', lines: { win: 'YOU FORGOT.', lose: 'I REMEMBER... NOTHING...' },
    exploits: [
      X.slip('quotedWrong', 'QUOTED WRONG', 'upper', { hits: 6, star: 28, hint: ['visual', 'THE REFRAIN IS THE LINE HE SAYS WITH HIS WHOLE ARM.'] }),
      X.getUp('lostThePlace', 'LOST HIS PLACE AGAIN', { hits: 5, star: 24, hint: ['quote', 'ASK HIM WHERE HE WAS. HE WILL NOT SAY.'] }),
      X.passive('stoppedToThink', 'STOPPED TO THINK', { seconds: 6, hits: 4, say: 'HE STOPS TO THINK!', hint: ['quote', 'A MAN WHO RECITES MUST BREATHE.'] }),
    ],
    antiStrategies: [
      A.dodgeBias('readsYourSide', 'READS YOUR SIDE', { moves: ['jab', 'upper'], min: 5, share: 0.75, say: 'HE READS YOUR SIDE!' }),
      A.jabSpam('correctsYou', 'CORRECTS YOU', { streak: 4, counter: 'finale', say: 'CORRECTED!' }),
    ],
    scriptedMoments: [
      S.clock('firstVerse', 'THE FIRST VERSE', 100, [{ idle: 24 }, { move: 'jab' }, { idle: 12 }, { move: 'hook' }, { idle: 12 }, { move: 'hookL' }, { idle: 12 }, { move: 'finale' }, { idle: 30 }]),
      S.health('theCoda', 'THE CODA', 0.35, [{ idle: 24 }, { move: 'bodyR' }, { idle: 12 }, { move: 'upper' }, { idle: 12 }, { move: 'finale' }, { idle: 30 }]),
    ],
  },

  // -- #116 The Echo Shard: your own voice, louder
  echoShard: {
    ...base, tell: 0.9,
    nickname: 'YOUR LOUDER VOICE', quote: 'I ONLY EVER SAY WHAT YOU SAID. SAY SOMETHING NEW.', lines: { win: 'YOU SAID NOTHING NEW.', lose: 'NOW... I HAVE... MY OWN WORDS...' },
    exploits: [
      X.slip('echoFades', 'THE ECHO FADES', 'eBody', { hits: 5, star: 26, hint: ['audio', 'YOUR BODY SHOT COMES BACK LOW AND A LITTLE LATE.'] }),
      X.getUp('shortOfBreath', 'SHORT OF BREATH', { hits: 5, star: 24, hint: ['quote', 'AN ECHO NEEDS A WALL. HE JUST LOST HIS.'] }),
      X.passive('talkingToHimself', 'TALKING TO HIMSELF', { seconds: 6, hits: 4, say: 'TALKING TO HIMSELF!', hint: ['quote', 'WHEN YOU SAY NOTHING, HE REPEATS HIMSELF.'] }),
    ],
    antiStrategies: [
      A.comboRepeat('saysItBack', 'SAYS IT BACK', { counter: 'eStar', delay: 14, say: 'SAID BACK!' }),
      A.starHoard('copiesYourStars', 'COPIES YOUR STARS', { hold: 420, moves: ['eJab', 'eJabR'], say: 'COPIED!' }),
    ],
    scriptedMoments: [
      S.clock('feedback', 'FEEDBACK', 100, [{ idle: 22 }, { move: 'eJab' }, { idle: 10 }, { move: 'eJabR' }, { idle: 10 }, { move: 'eBody' }, { idle: 10 }, { move: 'eBodyR' }, { idle: 30 }]),
      S.health('finalEcho', 'THE FINAL ECHO', 0.35, [{ idle: 22 }, { move: 'eBodyR' }, { idle: 10 }, { move: 'eJab' }, { idle: 10 }, { move: 'eStar' }, { idle: 30 }]),
    ],
  },

  // -- #117 The Chaos Shard: loaded dice
  chaosShard: {
    ...base, tell: 0.9,
    nickname: 'LOADED DICE', quote: 'THE HOUSE ALWAYS WINS, AND I AM THE HOUSE.', lines: { win: 'BETTER LUCK NEVER.', lose: 'THE DICE... STOP...' },
    exploits: [
      X.slip('cheapShotMissed', 'A CHEAP SHOT MISSED', 'upper', { hits: 6, star: 28, hint: ['visual', 'THE HIGH ROLL SWINGS FROM THE HEELS.'] }),
      X.getUp('rolledAOne', 'ROLLED A ONE', { hits: 5, star: 24, hint: ['quote', 'EVEN LOADED DICE LAND ON ONE.'] }),
      X.blocks('houseEdge', 'THE HOUSE EDGE', { n: 4, hits: 5, hint: ['visual', 'KEEP BLOCKING AND HE STOPS TO COUNT HIS CHIPS.'] }),
    ],
    antiStrategies: [
      A.jabSpam('marksTheCards', 'MARKS THE CARDS', { streak: 4, counter: 'slam', say: 'MARKED CARDS!' }),
      A.comboRepeat('rollsAgain', 'ROLLS AGAIN', { counter: 'haymaker', delay: 14, say: 'ROLL AGAIN!' }),
    ],
    scriptedMoments: [
      S.clock('hotStreak', 'A HOT STREAK', 100, [{ idle: 22 }, { move: 'jab' }, { idle: 8 }, { move: 'hook' }, { idle: 8 }, { move: 'slam' }, { idle: 8 }, { move: 'body' }, { idle: 30 }]),
      S.health('allInAgain', 'ALL IN, AGAIN', 0.35, [{ idle: 22 }, { move: 'haymaker' }, { idle: 20 }, { move: 'slam' }, { idle: 16 }, { move: 'haymaker' }, { idle: 30 }]),
    ],
  },

  // -- #118 The Time Shard: borrowed minutes
  timeShard: {
    ...base, tell: 0.9,
    nickname: 'BORROWED MINUTES', quote: 'I AM A MINUTE EARLY AND AN HOUR LATE. WHICH ARE YOU?', lines: { win: 'YOU RAN OUT OF TIME.', lose: 'AT LAST... THE HOUR...' },
    exploits: [
      X.slip('latePendulum', 'THE LATE PENDULUM', 'body', { hits: 5, star: 26, hint: ['audio', 'THE PENDULUM CREAKS BEFORE IT SWINGS.'] }),
      X.getUp('timeStumbles', 'TIME STUMBLES', { hits: 5, star: 24, hint: ['quote', 'THE CLOCK STOPS WHEN HE FALLS.'] }),
      X.blocks('wastedTime', 'WASTED TIME', { n: 4, hits: 5, hint: ['visual', 'LET HIM HIT THE GUARD AND HE CHECKS HIS WATCH.'] }),
    ],
    antiStrategies: [
      A.starHoard('spendsYourTime', 'SPENDS YOUR TIME', { hold: 420, moves: ['jab', 'cross', 'body'], say: 'TIME IS UP!' }),
      A.jabSpam('keepsTime', 'KEEPS TIME', { streak: 4, counter: 'haymaker', say: 'ON THE DOT!' }),
    ],
    scriptedMoments: [
      S.clock('overtime', 'OVERTIME', 100, [{ idle: 22 }, { move: 'jab' }, { idle: 8 }, { move: 'cross' }, { idle: 8 }, { move: 'hook' }, { idle: 8 }, { move: 'upper' }, { idle: 30 }]),
      S.health('theEleventhHour', 'THE ELEVENTH HOUR', 0.35, [{ idle: 22 }, { move: 'haymaker' }, { idle: 16 }, { move: 'bodyR' }, { idle: 10 }, { move: 'upper' }, { idle: 30 }]),
    ],
  },

  // -- #119 The Will Shard: the unbroken
  willShard: {
    ...base, tell: 0.9,
    nickname: 'THE UNBROKEN', quote: 'I HAVE BEEN KNOCKED DOWN BY THE BEST. I AM STILL HERE.', lines: { win: 'I AM STILL HERE.', lose: 'AT LAST... I MAY... REST...' },
    exploits: [
      X.slip('stubbornBlowMissed', 'A STUBBORN MISS', 'upper', { hits: 6, star: 28, hint: ['visual', 'HE PUTS HIS WHOLE BACK INTO THE RISING WILL.'] }),
      X.blocks('digsIn', 'DIGS IN', { n: 4, hits: 5, hint: ['visual', 'KEEP BLOCKING AND HE STOPS TO DIG IN HIS HEELS.'] }),
      X.passive('catchesBreath', 'CATCHES HIS BREATH', { seconds: 6, hits: 4, say: 'HE CATCHES HIS BREATH!', hint: ['quote', 'THE LAST TO FALL IS ALSO THE LAST TO REST.'] }),
    ],
    antiStrategies: [
      A.rushing('shrugsItOff', 'SHRUGS IT OFF', { count: 3, counter: 'breaking', say: 'SHRUGGED OFF!' }),
      A.jabSpam('takesTheHits', 'TAKES THE HITS', { streak: 4, counter: 'upper', say: 'HE TAKES IT!' }),
    ],
    scriptedMoments: [
      S.clock('secondWindBack', 'THE WIND RETURNS', 120, [{ idle: 22 }, { move: 'jab' }, { idle: 8 }, { move: 'hook' }, { idle: 8 }, { move: 'bodyR' }, { idle: 8 }, { move: 'upper' }, { idle: 30 }]),
      S.health('stillStanding', 'STILL STANDING', 0.35, [{ idle: 22 }, { move: 'breaking' }, { idle: 18 }, { move: 'upper' }, { idle: 12 }, { move: 'breaking' }, { idle: 30 }]),
    ],
  },
};
