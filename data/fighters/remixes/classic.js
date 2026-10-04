// Title Defense, Classic tier (spec §6, K4): the knowledge layer of each champion's remix. The remix's moves and patterns are in the
// champion's own data file (`titleDefense` block); what is here is what the player can LEARN about the remix: new exploits, new
// anti-strategies and new scripted moments, none of them the original fight's (different moves, different types). They replace the
// original ones (remixed() in ../titleDefense.js); his scouting report is kept apart ("<id>.td").
import { X, A, S } from './kit.js';

export default {
  // -- #4 Gus Grill (Rookie: 1 exploit, one mild anti-strategy) --
  gus: {
    exploits: [
      X.counter('greaseFire', 'GREASE FIRE', 'deepFry', { stun: 90, hits: 5, hint: ['audio', 'THE FRYER CREAKS BEFORE HE SWEEPS.'] }),
    ],
    antiStrategies: [
      A.earlyDodge('burntToast', 'BURNT TOAST', { moves: 'hotPlate', mild: true, say: 'BURNT TOAST!' }),
    ],
    scriptedMoments: [],
  },

  // -- #8 Brick Wall Brody --
  brody: {
    exploits: [
      X.counter('plumbLine', 'PLUMB LINE', 'rebar', { late: 6, hits: 6, star: true, sfx: 'clang', hint: ['visual', 'HE SIGHTS ALONG THE REBAR BEFORE HE SWINGS IT.'] }),
      X.slip('swungAndMissed', 'SWUNG AND MISSED', 'sledge', { hits: 5, star: 30, hint: ['audio', 'THE SLEDGEHAMMER TAKES HIM A LONG TIME TO LIFT.'] }),
      X.passive('spiritLevel', 'SPIRIT LEVEL', { seconds: 5, hits: 4, say: 'HE CHECKS THE LEVEL!', hint: ['quote', 'MEASURE TWICE, CUT ONCE.'] }),
    ],
    antiStrategies: [
      A.turtling('mortaredShut', 'MORTARED SHUT', { moves: ['mortarJab', 'brickLayer1'], cue: 'NO BLOCK!', say: 'MORTARED SHUT!' }),
      A.rushing('rebarRain', 'REBAR RAIN', { count: 3, counter: 'rebar', say: 'WATCH THE REBAR!' }),
    ],
    scriptedMoments: [
      S.clock('lunchBreak', 'LUNCH BREAK', 100, [{ idle: 30 }, { move: 'mortarJab' }, { idle: 12 }, { move: 'brickLayer1' }, { move: 'brickLayer2' }, { idle: 30 }], { say: 'BACK FROM LUNCH!' }),
      S.health('toppingOut', 'TOPPING OUT', 0.45, [{ idle: 20 }, { move: 'rebar' }, { idle: 18 }, { move: 'sledge' }, { idle: 30 }]),
    ],
  },

  // -- #12 Mayor McBride --
  mcbride: {
    exploits: [
      X.slip('vetoOverridden', 'VETO OVERRIDDEN', 'veto', { dir: 'R', hits: 5, star: 30, hint: ['visual', 'HE SLAMS THE VETO STAMP DOWN FROM HIS RIGHT.'] }),
      X.counter('redTape', 'RED TAPE', 'ribbon', { early: 5, hits: 6, hint: ['visual', 'THE SCISSORS GO UP BEFORE THE RIBBON CUTTING.'] }),
      X.getUp('lostTheVote', 'LOST THE VOTE', { hits: 5, star: 30, hint: ['quote', 'EVERY VOTE COUNTS.'] }),
    ],
    antiStrategies: [
      A.jabSpam('filibusterer', 'TALKS OUT THE JABS', { streak: 4, counter: 'handshake', say: 'OUT OF ORDER!' }),
      A.zoneBias('publicOpinion', 'PUBLIC OPINION', { mode: 'round', min: 6, share: 0.7, raise: 'THE POLLS SHIFT!', say: 'THE POLLS HAVE SPOKEN!' }),
    ],
    scriptedMoments: [
      S.clock('stateOfTheCity', 'STATE OF THE CITY', 75, [{ idle: 24 }, { move: 'handshake' }, { idle: 12 }, { move: 'ribbon' }, { idle: 12 }, { move: 'veto' }, { idle: 30 }]),
      S.health('concession', 'CONCESSION SPEECH', 0.4, [{ idle: 20 }, { move: 'recount' }, { idle: 18 }, { move: 'fil1' }, { move: 'fil2' }, { move: 'fil3' }, { move: 'fil4' }, { idle: 30 }]),
    ],
  },

  // -- #16 Count Midnight --
  midnight: {
    exploits: [
      X.counter('nailedShut', 'NAILED SHUT', 'coffinNail', { late: 4, height: 'low', hits: 6, hint: ['visual', 'THE NAIL COMES IN LOW, HAMMER HIGH ABOVE HIS HEAD.'] }),
      X.slip('eclipsed', 'ECLIPSED', 'bloodMoon', { hits: 5, star: 26, hint: ['audio', 'THE BLOOD MOON RISES WITH A LONG, LOW HOWL.'] }),
      X.cancel('pulledTeeth', 'PULLED TEETH', 'fang1', { cancel: 'fang2', star: true, hint: ['trainer', 'FANG FURY COMES IN TWO BITES.'] }),
    ],
    antiStrategies: [
      A.turtling('bloodDrain', 'DRAINS THE BLOOD', { response: 'drain', share: 0.4, every: 48, say: 'HE DRAINS YOUR GUARD!' }),
      A.comboRepeat('seenItBefore', 'SEEN IT BEFORE', { counter: 'batWing', delay: 14, say: 'SEEN IT BEFORE!' }),
    ],
    scriptedMoments: [
      S.clock('duskFalls', 'DUSK FALLS', 100, [{ idle: 20 }, { move: 'nightfall' }, { idle: 14 }, { move: 'batWing' }, { idle: 14 }, { move: 'coffinNail' }, { idle: 30 }]),
      S.health('moonRises', 'THE MOON RISES', 0.5, [{ idle: 24 }, { move: 'bloodMoon' }, { idle: 20 }, { move: 'fang1' }, { move: 'fang2' }, { idle: 30 }]),
    ],
  },

  // -- #21 Ringmaster Rex --
  rex: {
    exploits: [
      X.counter('flamingHoop', 'FLAMING HOOP', 'ringOfFire', { early: 6, hits: 6, hint: ['audio', 'A WHOOSH OF FLAME RIGHT BEFORE THE RING.'] }),
      X.slip('lionTamed', 'THE LION IS TAMED', 'lionLeap', { hits: 5, star: 28, hint: ['visual', 'HE CROUCHES LOW BEFORE THE LION\'S LEAP.'] }),
      X.getUp('stageFright', 'STAGE FRIGHT', { hits: 5, star: 26, hint: ['quote', 'THE SHOW MUST GO ON.'] }),
    ],
    antiStrategies: [
      A.starHoard('ticketTax', 'TICKET TAX', { hold: 420, moves: ['caneJab', 'lionTamer', 'rollUp'], say: 'TICKET PLEASE!' }),
      A.zoneBias('cummerbund', 'THE CUMMERBUND', { mode: 'streak', streak: 4, zone: 'body', frames: 420, raise: 'HE TIGHTENS THE CUMMERBUND!', say: 'BODY GUARDED!' }),
    ],
    scriptedMoments: [
      S.clock('intermission', 'INTERMISSION', 75, [{ idle: 24 }, { move: 'caneJab' }, { idle: 10 }, { move: 'lionTamer' }, { idle: 10 }, { move: 'rollUp' }, { idle: 30 }]),
      S.health('encoreOfFire', 'ENCORE OF FIRE', 0.4, [{ idle: 20 }, { move: 'ringOfFire' }, { idle: 16 }, { move: 'lionLeap' }, { idle: 30 }]),
    ],
  },

  // -- #25 The Baron --
  baron: {
    exploits: [
      X.counter('tooCloseToTheBlade', 'TOO CLOSE TO THE BLADE', 'thrust', { early: 4, hits: 5, hint: ['visual', 'HE SALUTES WITH THE BLADE AS HE COMES IN.'] }),
      X.slip('crosseOverDuck', 'DUCKED THE CROISE', 'croise', { result: 'ducked', hits: 5, star: 26, hint: ['audio', 'THE CROISE WHISTLES OVER YOUR HEAD.'] }),
      X.passive('theSalute', 'THE SALUTE', { seconds: 6, hits: 4, say: 'HE SALUTES!', hint: ['quote', 'A GENTLEMAN ALWAYS SALUTES.'] }),
    ],
    antiStrategies: [
      A.earlyDodge('feintsTheLunge', 'FEINTS THE LUNGE', { moves: ['thrust', 'prise'], say: 'A FEINT!' }),
      A.rushing('ripostes', 'EN GARDE!', { count: 3, counter: 'riposte', say: 'RIPOSTE!' }),
    ],
    scriptedMoments: [
      S.clock('lesArmes', 'LES ARMES', 90, [{ idle: 24 }, { move: 'thrust' }, { idle: 12 }, { move: 'coupe' }, { idle: 12 }, { move: 'basse' }, { idle: 30 }]),
      S.health('toucheFinal', 'TOUCHE FINAL', 0.35, [{ idle: 18 }, { move: 'double1' }, { move: 'double2' }, { idle: 16 }, { move: 'prise' }, { idle: 30 }]),
    ],
  },

  // -- #29 Maestro Vale --
  maestro: {
    exploits: [
      X.counter('offTheBeat', 'OFF THE BEAT', 'sforzando', { early: 3, hits: 5, star: true, hint: ['audio', 'HE HITS ONE LOUD CHORD BEFORE THE SFORZANDO.'] }),
      X.slip('mutedStrings', 'MUTED STRINGS', 'trem1', { dir: 'R', hits: 4, hint: ['trainer', 'THE TREMOLO STARTS ON HIS RIGHT HAND.'] }),
      X.blocks('outOfTune', 'OUT OF TUNE', { n: 3, hits: 5, hint: ['audio', 'HIS PIZZICATO RINGS OUT OF TUNE WHEN YOU BLOCK IT.'] }),
    ],
    antiStrategies: [
      A.turtling('softPedal', 'SOFT PEDAL', { moves: ['staccato'], cue: 'NO BLOCK!', say: 'SOFT PEDAL!' }),
      A.jabSpam('rallentando', 'RALLENTANDO', { streak: 4, counter: 'legato', say: 'RALLENTANDO!' }),
    ],
    scriptedMoments: [
      S.clock('adagio', 'ADAGIO', 100, [{ idle: 30 }, { move: 'pizzicato' }, { idle: 14 }, { move: 'legato' }, { idle: 14 }, { move: 'sforzando' }, { idle: 34 }]),
      S.health('coda', 'THE CODA', 0.4, [{ idle: 20 }, { move: 'trem1' }, { move: 'trem2' }, { idle: 16 }, { move: 'cresc1' }, { move: 'cresc2' }, { move: 'cresc3' }, { idle: 30 }]),
    ],
  },

  // -- #33 Avalanche --
  avalanche: {
    exploits: [
      X.counter('blackIce', 'BLACK ICE', 'iceFall', { late: 3, hits: 5, hint: ['visual', 'THE ICE OVERHEAD CRACKS WHITE A MOMENT BEFORE IT FALLS.'] }),
      X.slip('snowAngel', 'SNOW ANGEL', 'snowSlide', { result: 'ducked', hits: 5, star: 26, hint: ['audio', 'THE SNOW SLIDE HISSES ACROSS THE FLOOR.'] }),
      X.passive('packingSnow', 'PACKING SNOW', { seconds: 6, hits: 4, say: 'HE PACKS A SNOWBALL!', hint: ['quote', 'EVERY AVALANCHE STARTS SMALL.'] }),
    ],
    antiStrategies: [
      A.rushing('corniceCollapse', 'CORNICE COLLAPSE', { count: 3, counter: ['cornice1', 'cornice2'], say: 'CORNICE COLLAPSE!' }),
      A.starHoard('frostbite', 'FROSTBITE', { hold: 360, moves: ['flurryJab', 'drift', 'packed'], say: 'FROSTBITE!' }),
    ],
    scriptedMoments: [
      S.clock('flashFreeze', 'FLASH FREEZE', 90, [{ idle: 26 }, { move: 'flurryJab' }, { idle: 12 }, { move: 'snowSlide' }, { idle: 12 }, { move: 'iceFall' }, { idle: 34 }]),
      S.health('whiteoutRage', 'WHITEOUT RAGE', 0.45, [{ idle: 20 }, { move: 'cornice1' }, { move: 'cornice2' }, { idle: 16 }, { move: 'packed' }, { idle: 30 }]),
    ],
  },

  // -- #37 The Mirror --
  mirror: {
    exploits: [
      X.counter('sevenYears', 'SEVEN YEARS BAD LUCK', 'crackedHook', { late: 3, hits: 6, hint: ['visual', 'A CRACK RUNS ACROSS HIS HOOK BEFORE IT SWINGS.'] }),
      X.slip('throughTheGlass', 'THROUGH THE LOOKING GLASS', 'silverUpper', { hits: 5, star: 24, hint: ['audio', 'THE SILVER UPPERCUT RINGS LIKE A STRUCK GLASS.'] }),
      X.passive('staresBack', 'STARES BACK', { seconds: 6, hits: 4, say: 'HE ADMIRES HIMSELF!', hint: ['quote', 'MIRROR, MIRROR.'] }),
    ],
    antiStrategies: [
      A.turtling('hallOfMirrors', 'HALL OF MIRRORS', { response: 'drain', share: 0.4, every: 48, say: 'YOUR GUARD CRACKS!' }),
      A.dodgeBias('oneStepAhead', 'ONE STEP AHEAD', { moves: ['silverJab'], min: 6, share: 0.75, say: 'HE SEES YOUR SIDE!' }),
    ],
    scriptedMoments: [
      S.clock('reflection', 'REFLECTION', 80, [{ idle: 24 }, { move: 'silverJab' }, { idle: 10 }, { move: 'silverHook' }, { idle: 10 }, { move: 'crackedHook' }, { idle: 30 }]),
      S.health('sevenYearsLater', 'SEVEN YEARS LATER', 0.35, [{ idle: 20 }, { move: 'silverUpper' }, { idle: 18 }, { move: 'shatter' }, { idle: 34 }]),
    ],
  },

  // -- #42 King Karver --
  karver: {
    exploits: [
      X.counter('regicideRefused', 'REGICIDE REFUSED', 'regicide', { late: 3, hits: 7, star: true, hint: ['visual', 'THE KING BARES HIS TEETH BEFORE THE REGICIDE.'] }),
      X.slip('scytheMissed', 'THE SCYTHE MISSES', 'scythe', { result: 'ducked', hits: 5, star: 24, hint: ['audio', 'THE SCYTHE WHISTLES ALONG THE FLOOR.'] }),
      X.cancel('dullBlade', 'A DULL BLADE', 'carveL', { cancel: ['carveR', 'scepterR'], height: 'high', hint: ['trainer', 'THE CARVE OFTEN COMES AS A PAIR.'] }),
    ],
    antiStrategies: [
      A.jabSpam('royalGuard', 'THE ROYAL GUARD', { streak: 4, counter: 'scepterL', say: 'THE GUARD PARRIES!' }),
      A.earlyDodge('waitsForTheSlip', 'WAITS FOR THE SLIP', { moves: ['carveL', 'carveR'], say: 'THE KING WAITS!' }),
    ],
    scriptedMoments: [
      S.clock('audience', 'AN AUDIENCE', 75, [{ idle: 20 }, { move: 'crownJab' }, { idle: 12 }, { move: 'scepterL' }, { idle: 12 }, { move: 'scepterR' }, { idle: 28 }]),
      S.health('abdication', 'THE ABDICATION', 0.35, [{ idle: 20 }, { move: 'regicide' }, { idle: 16 }, { move: 'scythe' }, { idle: 16 }, { move: 'decree1' }, { move: 'decree2' }, { idle: 30 }]),
    ],
  },

  // -- #46 The Warden --
  warden: {
    exploits: [
      X.counter('nightstickDrop', 'NIGHTSTICK DROP', 'nightstick', { late: 3, hits: 6, hint: ['visual', 'HE TWIRLS THE NIGHTSTICK ONCE BEFORE HE SWINGS.'] }),
      X.slip('gasMask', 'FORGOT HIS MASK', 'tearGas', { result: 'ducked', hits: 5, star: 26, hint: ['audio', 'THE TEAR GAS CANISTER HISSES AT FLOOR LEVEL.'] }),
      X.getUp('offDuty', 'OFF DUTY', { hits: 5, star: 26, hint: ['quote', 'THE WARDEN NEVER SLEEPS.'] }),
    ],
    antiStrategies: [
      A.dodgeBias('patrolsYourSide', 'PATROLS YOUR SIDE', { moves: ['stick'], min: 6, share: 0.75, say: 'HE PATROLS YOUR SIDE!' }),
      A.jabSpam('parryAndCuff', 'PARRY AND CUFF', { streak: 4, counter: 'cellHook', say: 'CUFFED!' }),
    ],
    scriptedMoments: [
      S.clock('rollCall', 'ROLL CALL', 100, [{ idle: 20 }, { move: 'stick' }, { idle: 12 }, { move: 'cellHook' }, { idle: 12 }, { move: 'patDown' }, { idle: 30 }]),
      S.health('lockdown', 'LOCKDOWN', 0.4, [{ idle: 20 }, { move: 'nightstick' }, { idle: 16 }, { move: 'tearGas' }, { idle: 30 }]),
    ],
  },

  // -- #50 Eclipse --
  eclipse: {
    exploits: [
      X.counter('annularRing', 'ANNULAR RING', 'antumbra', { late: 3, hits: 6, star: true, hint: ['visual', 'A RING OF LIGHT FLARES AROUND HIS FIST.'] }),
      X.slip('partialShadow', 'A PARTIAL SHADOW', 'penumbra', { result: 'ducked', hits: 5, star: 22, hint: ['audio', 'THE PENUMBRA WHISPERS ALONG THE FLOOR.'] }),
      X.passive('holdsTheEclipse', 'HOLDS THE ECLIPSE', { seconds: 6, hits: 4, say: 'HE HOLDS THE ECLIPSE!', hint: ['quote', 'FOR A MOMENT, EVERYTHING IS STILL.'] }),
    ],
    antiStrategies: [
      A.earlyDodge('eclipseWaits', 'THE SUN STANDS STILL', { moves: ['eJab', 'eUpper'], say: 'THE SUN STANDS STILL!' }),
      A.turtling('shadowDrain', 'SWALLOWED BY SHADOW', { response: 'drain', share: 0.4, every: 48, say: 'SHADOW SWALLOWS YOUR GUARD!' }),
    ],
    scriptedMoments: [
      S.clock('partial', 'PARTIAL ECLIPSE', 100, [{ idle: 18 }, { move: 'eJab' }, { idle: 10 }, { move: 'eHook' }, { idle: 10 }, { move: 'eHookL' }, { idle: 26 }]),
      S.health('diamondRing', 'DIAMOND RING', 0.4, [{ idle: 18 }, { move: 'penumbra' }, { idle: 14 }, { move: 'antumbra' }, { idle: 30 }]),
    ],
  },

  // -- Jax Crane (the Dream Fight boss) --
  jax: {
    exploits: [
      X.counter('clapBack', 'CLAP BACK', 'thunderClap', { late: 3, hits: 7, star: true, hint: ['audio', 'A LOW RUMBLE ROLLS IN BEFORE THE THUNDERCLAP.'] }),
      X.slip('stormSpent', 'THE STORM IS SPENT', 'thunderClap', { result: 'ducked', hits: 5, star: 24, hint: ['trainer', 'THE THUNDERCLAP SWEEPS LOW.'] }),
      X.cancel('breakTheRhythm', 'BREAK THE RHYTHM', 'tUpper', { cancel: ['fJab', 'fHook'], hint: ['visual', 'THE UPPERCUT OFTEN LEADS HIS NEXT COMBO.'] }),
    ],
    antiStrategies: [
      A.turtling('eyeOfTheStorm', 'IN THE EYE OF THE STORM', { response: 'drain', share: 0.4, every: 48, say: 'THE STORM PRESSES YOUR GUARD!' }),
      A.rushing('stormAnswers', 'THE STORM ANSWERS', { count: 3, counter: 'fHook', say: 'THE STORM ANSWERS!' }),
    ],
    scriptedMoments: [
      S.clock('firstThunder', 'FIRST THUNDER', 110, [{ idle: 22 }, { move: 'fJab' }, { idle: 12 }, { move: 'fHook' }, { idle: 12 }, { move: 'thunderClap' }, { idle: 32 }]),
      S.health('finalThunder', 'FINAL THUNDER', 0.35, [{ idle: 18 }, { move: 'tUpper' }, { idle: 16 }, { move: 'thunderClap' }, { idle: 16 }, { move: 'tJab' }, { move: 'tHook' }, { idle: 30 }]),
    ],
  },
};
