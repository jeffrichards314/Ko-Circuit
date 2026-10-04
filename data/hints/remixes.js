// Cornerman hints (src/fight/cornerman.js) for the Title Defense remixes: their own exploits and anti-strategies (a remix keeps
// the original's supers, phases and general lines: cornerman.hintBank). Keyed '<id>.td'. The voice is whoever corners that fight.
// Each list is [first attempt, after one loss, after two or more]: a little clearer each time, never the answer.
import ascension from './remixesAsc.js';

const classic = {
  'gus.td': {
    general: ['GUS GOT A NEW MENU, KID. TWO NEW SPECIALS. THE OLD ONES ARE STILL ON IT.'],
    exploit: {
      greaseFire: [
        'THE DEEP FRYER IS HOT GREASE AND A BIG SWING. GREASE FLARES WHEN YOU STIR IT.',
        'CATCH THE DEEP FRYER WHILE HE\'S STILL WINDING IT UP.',
        'BEAT THE DEEP FRYER TO THE PUNCH. GREASE FIRE.',
      ],
    },
    anti: {
      burntToast: [
        'YOU\'RE DODGING AT NOTHING. HE\'S HOLDING THE HOT PLATE FOR YOU.',
        'SLIP WITH NO PUNCH COMING AND HE WAITS YOU OUT.',
        'WAIT FOR A REAL TELL BEFORE YOU MOVE.',
      ],
    },
  },
  'brody.td': {
    general: ['HE ADDED A FLOOR TO THE WALL. TWO NEW TOOLS: THE REBAR AND THE SLEDGEHAMMER.'],
    exploit: {
      plumbLine: [
        'THE REBAR COMES UP FROM LOW. LATE IN THE WINDUP, IT\'S ALREADY COMMITTED.',
        'WAIT UNTIL THE REBAR IS ALMOST ON ITS WAY.',
        'COUNTER LATE IN THE REBAR\'S WINDUP.',
      ],
      swungAndMissed: [
        'A SLEDGEHAMMER THAT HITS NOTHING DRAGS THE MAN WITH IT.',
        'MAKE THE SLEDGEHAMMER MISS.',
        'SLIP THE SLEDGEHAMMER.',
      ],
      spiritLevel: [
        'A BUILDER ALWAYS CHECKS HIS LEVEL WHEN THINGS GO QUIET.',
        'GIVE HIM NOTHING TO DO FOR A WHILE.',
        'STAND STILL A FEW SECONDS. HE STOPS TO CHECK THE LEVEL.',
      ],
    },
    anti: {
      mortaredShut: [
        'YOU\'RE BLOCKING EVERYTHING. HE MORTARS RIGHT THROUGH YOUR GLOVES.',
        'TOO MUCH GUARD AND THE MORTAR JAB AND BRICKLAYER STOP CARING ABOUT IT.',
        'MOVE. SLIP AND DUCK INSTEAD OF BLOCKING.',
      ],
      rebarRain: [
        'YOU\'RE KNOCKING ON HIS WALL. IT KNOCKS BACK WITH REBAR.',
        'THREE INTO HIS GUARD AND THE REBAR COMES AT ONCE.',
        'STOP POUNDING THE WALL. WAIT.',
      ],
    },
  },
  'mcbride.td': {
    general: ['FOUR MORE YEARS, HE SAYS. THE MAYOR\'S GOT A VETO AND A RECOUNT NOW.'],
    exploit: {
      vetoOverridden: [
        'THE VETO IS ONE BIG HOOK. ONE WAY AROUND IT, HE\'S OVERRULED.',
        'MAKE THE VETO MISS TO ITS RIGHT.',
        'SLIP THE VETO TO THE RIGHT.',
      ],
      redTape: [
        'THE RIBBON CUTTING STARTS SLOW AND CEREMONIAL.',
        'CATCH THE RIBBON CUTTING RIGHT AS IT STARTS.',
        'COUNTER THE RIBBON CUTTING AT THE START OF ITS WINDUP.',
      ],
      lostTheVote: [
        'WHEN HE GETS UP FROM A KNOCKDOWN, HE\'S STILL COUNTING VOTES.',
        'RIGHT AFTER HE RISES, HE\'S DAZED.',
        'HIT HIM AS HE GETS BACK UP.',
      ],
    },
    anti: {
      filibusterer: [
        'YOU\'RE JABBING AT A MAN WHO ISN\'T OPEN. HE TALKS RIGHT OVER IT.',
        'FOUR IN A ROW INTO HIS GUARD AND HE PARRIES AND SHAKES YOUR HAND.',
        'WAIT FOR AN OPENING.',
      ],
      publicOpinion: [
        'HE POLLS WHERE YOU HIT HIM. NEXT ROUND, HE GUARDS IT.',
        'WORK ONE SPOT ALL ROUND AND HE COVERS IT.',
        'MIX HEAD AND BODY.',
      ],
    },
  },
  'midnight.td': {
    general: ['THE BLOOD MOON NIGHT IS LONGER. TWO NEW PUNCHES IN THE DARK. WATCH HIS EYES, KID. THEY STILL MOVE TOWARD THE PUNCH.'],
    exploit: {
      nailedShut: [
        'THE COFFIN NAIL COMES DOWN SLOW. LATE IN IT, HIS BODY\'S EXPOSED.',
        'WAIT FOR THE COFFIN NAIL TO NEARLY LAND.',
        'COUNTER LATE IN THE COFFIN NAIL, LOW.',
      ],
      eclipsed: [
        'THE BLOOD MOON UPPERCUT RISES. IF IT HITS NOTHING, THE MOON GOES DARK.',
        'MAKE THE BLOOD MOON MISS.',
        'SLIP THE BLOOD MOON.',
      ],
      pulledTeeth: [
        'FANG FURY STARTS WITH A FLASH OF TEETH.',
        'CATCH FANG FURY WHILE IT WINDS UP.',
        'COUNTER FANG FURY IN ITS WINDUP.',
      ],
    },
    anti: {
      bloodDrain: [
        'YOU\'RE BLOCKING EARLY. THE COUNT DRAINS WHAT HIDES.',
        'GUARD UP TOO LONG AND YOUR HEARTS DRAIN.',
        'BLOCK WHEN HE PUNCHES. NOT BEFORE.',
      ],
      seenItBefore: [
        'YOU\'RE REPEATING YOURSELF. HE\'S SEEN THAT ONE.',
        'THE SAME COMBO TWICE AND THE BAT WING ANSWERS.',
        'NEVER THE SAME COMBINATION BACK TO BACK.',
      ],
    },
  },
  'rex.td': {
    general: ['THE FAREWELL TOUR, KID. THE LION AND THE RING OF FIRE ARE NEW ACTS.'],
    exploit: {
      flamingHoop: [
        'THE RING OF FIRE STARTS WITH A CROUCH. A CROUCHING MAN IS STILL GETTING SET.',
        'CATCH THE RING OF FIRE RIGHT AS IT STARTS.',
        'COUNTER THE RING OF FIRE AT THE START OF ITS WINDUP.',
      ],
      lionTamed: [
        'THE LION\'S LEAP COMES WITH A ROAR. A LION THAT LEAPS AT NOTHING LANDS FLAT.',
        'MAKE THE LION\'S LEAP MISS.',
        'SLIP THE LION\'S LEAP.',
      ],
      stageFright: [
        'WHEN HE GETS UP FROM A KNOCKDOWN, HE\'S GOT STAGE FRIGHT.',
        'RIGHT AFTER HE RISES, HE FREEZES.',
        'HIT HIM AS HE GETS BACK UP.',
      ],
    },
    anti: {
      ticketTax: [
        'YOU\'RE SITTING ON STARS. THE RINGMASTER CHARGES ADMISSION.',
        'THREE STARS TOO LONG AND HIS PUNCHES TAKE ONE.',
        'SPEND YOUR STARS.',
      ],
      cummerbund: [
        'YOU KEEP GOING TO THE BODY. HE TIGHTENS THE CUMMERBUND.',
        'FOUR TO THE BODY IN A ROW AND HE GUARDS IT.',
        'CHANGE WHERE YOU HIT.',
      ],
    },
  },
  'baron.td': {
    general: ['THE RETURN MATCH. TWO NEW PASSES: THE PRISE DE FER AND THE CROISE. STILL NEVER JAB INTO HIS GUARD, KID.'],
    exploit: {
      tooCloseToTheBlade: [
        'THE THRUST STARTS WITH HIS BLADE COMING FORWARD. TOO CLOSE TO THE BLADE IS TOO CLOSE TO YOU.',
        'CATCH THE THRUST RIGHT AS IT STARTS.',
        'COUNTER THE THRUST AT THE START OF ITS WINDUP.',
      ],
      crosseOverDuck: [
        'THE CROISE CUTS ACROSS LOW. A CUT THAT FINDS NOTHING LEAVES THE FENCER OPEN.',
        'GET UNDER THE CROISE.',
        'DUCK THE CROISE.',
      ],
      theSalute: [
        'A GENTLEMAN SALUTES WHEN THERE\'S A LULL.',
        'GIVE HIM A QUIET MOMENT.',
        'STAND STILL A FEW SECONDS. HE STOPS TO SALUTE.',
      ],
    },
    anti: {
      feintsTheLunge: [
        'YOU\'RE DODGING AT NOTHING. HE HOLDS THE LUNGE FOR YOU.',
        'SLIP WITH NO PUNCH COMING AND HE WAITS YOU OUT.',
        'WAIT FOR A REAL TELL.',
      ],
      ripostes: [
        'YOU\'RE PUNCHING INTO HIS GUARD. EN GARDE.',
        'THREE INTO HIS GUARD AND THE RIPOSTE COMES.',
        'STOP JABBING HIS GUARD.',
      ],
    },
  },
  'maestro.td': {
    general: ['DA CAPO, KID. FROM THE TOP, AND THE TEMPO STILL CLIMBS EVERY MINUTE. NEW PIECES: THE TREMOLO AND THE SFORZANDO.'],
    exploit: {
      offTheBeat: [
        'THE SFORZANDO STARTS WITH A BELL. THE FIRST BEAT IS WHERE HE\'S EXPOSED.',
        'CATCH THE SFORZANDO RIGHT AS IT STARTS.',
        'COUNTER THE SFORZANDO AT THE START OF ITS WINDUP.',
      ],
      mutedStrings: [
        'THE TREMOLO IS TWO HOOKS. ONE WAY AROUND THE FIRST, THE STRINGS GO QUIET.',
        'MAKE THE TREMOLO MISS TO ITS RIGHT.',
        'SLIP THE TREMOLO TO THE RIGHT.',
      ],
      outOfTune: [
        'A CONDUCTOR HATES A WALL OF SOUND THAT WON\'T CHANGE.',
        'GIVE HIM NOTHING BUT BLOCKS FOR A BIT.',
        'BLOCK THREE TIMES IN A ROW. HE TAKES THE BAIT.',
      ],
    },
    anti: {
      softPedal: [
        'YOU\'RE BLOCKING EVERYTHING. HE PLAYS SOFT AND RIGHT THROUGH IT.',
        'TOO MUCH GUARD AND THE STACCATO STOPS CARING.',
        'MOVE. DON\'T SIT BEHIND THE BLOCK.',
      ],
      rallentando: [
        'YOU\'RE JABBING AT A CLOSED SCORE.',
        'FOUR INTO HIS GUARD AND HE PARRIES AND PLAYS THE LEGATO.',
        'WAIT FOR AN OPENING.',
      ],
    },
  },
  'avalanche.td': {
    general: ['THE DEEP FREEZE. THE SNOW DOESN\'T MELT UP THERE. EVERY BLOCK STILL COSTS HEARTS, KID.'],
    exploit: {
      blackIce: [
        'THE ICEFALL COMES DOWN SLOW. LATE IN IT, THE ICE IS THIN.',
        'WAIT FOR THE ICEFALL TO NEARLY DROP.',
        'COUNTER LATE IN THE ICEFALL.',
      ],
      snowAngel: [
        'THE SNOW SLIDE SWEEPS LOW. IF IT FINDS NOTHING, HE\'S FLAT ON HIS BACK.',
        'GET UNDER THE SNOW SLIDE.',
        'DUCK THE SNOW SLIDE.',
      ],
      packingSnow: [
        'WHEN THINGS GO QUIET, HE PACKS A SNOWBALL.',
        'GIVE HIM A QUIET MOMENT.',
        'STAND STILL A FEW SECONDS. HE STOPS TO PACK SNOW.',
      ],
    },
    anti: {
      corniceCollapse: [
        'YOU\'RE POUNDING THE SNOWBANK. IT COLLAPSES ON YOU.',
        'THREE INTO HIS GUARD AND THE CORNICE COMES DOWN.',
        'STOP PUNCHING HIS GUARD.',
      ],
      frostbite: [
        'YOU\'RE HOLDING STARS IN THE COLD. THEY GET FROSTBITE.',
        'THREE STARS TOO LONG AND HIS PUNCHES TAKE ONE.',
        'SPEND YOUR STARS.',
      ],
    },
  },
  'mirror.td': {
    general: ['THE CRACKED GLASS. HE HAS A LEFT HOOK AND A SILVER UPPERCUT NOW. HE STILL REWINDS YOUR LAST MOVES.'],
    exploit: {
      sevenYears: [
        'THE CRACKED HOOK IS SLOW TO COME AROUND. LATE IN IT, THE CRACK SHOWS.',
        'WAIT FOR THE CRACKED HOOK TO NEARLY LAND.',
        'COUNTER LATE IN THE CRACKED HOOK.',
      ],
      throughTheGlass: [
        'THE SILVER UPPERCUT RISES THROUGH THE GLASS. IF IT FINDS NOTHING, HE\'S THROUGH IT.',
        'MAKE THE SILVER UPPERCUT MISS.',
        'SLIP THE SILVER UPPERCUT.',
      ],
      staresBack: [
        'A MIRROR LOVES ITS OWN REFLECTION WHEN NOTHING\'S HAPPENING.',
        'GIVE HIM A QUIET MOMENT.',
        'STAND STILL A FEW SECONDS. HE ADMIRES HIMSELF.',
      ],
    },
    anti: {
      hallOfMirrors: [
        'YOU\'RE BLOCKING EARLY. THE HALL OF MIRRORS DRAINS YOU.',
        'GUARD UP TOO LONG AND YOUR HEARTS GO.',
        'BLOCK WHEN HE PUNCHES. NOT BEFORE.',
      ],
      oneStepAhead: [
        'YOU KEEP SLIPPING ONE WAY. HE\'S A STEP AHEAD.',
        'THE SILVER JAB COMES FROM YOUR FAVORITE SIDE.',
        'SLIP BOTH WAYS.',
      ],
    },
  },
  'karver.td': {
    general: ['THE RESTORATION. THE KING\'S BACK WITH A REGICIDE UPPERCUT AND A SCYTHE. HE STILL GETS HUNGRIER AS YOUR HEARTS RUN OUT.'],
    exploit: {
      regicideRefused: [
        'REGICIDE STARTS WITH A GROWL. LATE IN IT, THE KING IS EXPOSED.',
        'WAIT FOR REGICIDE TO NEARLY LAND.',
        'COUNTER LATE IN REGICIDE.',
      ],
      scytheMissed: [
        'THE SCYTHE SWEEPS BOTH WAYS, LOW. IF IT FINDS NOTHING, THE KING IS OVERREACHED.',
        'GET UNDER THE SCYTHE.',
        'DUCK THE SCYTHE.',
      ],
      dullBlade: [
        'THE CARVE LEADS INTO HIS SCEPTER. DULL THE FIRST BLADE.',
        'CATCH THE CARVE WHILE IT WINDS UP, UPSTAIRS.',
        'COUNTER THE CARVE IN ITS WINDUP WITH A HEAD SHOT. THE SCEPTER NEVER COMES.',
      ],
    },
    anti: {
      royalGuard: [
        'YOU\'RE JABBING AT THE ROYAL GUARD.',
        'FOUR INTO HIS GUARD AND HE PARRIES AND HITS YOU WITH THE SCEPTER.',
        'WAIT FOR AN OPENING.',
      ],
      waitsForTheSlip: [
        'YOU\'RE DODGING AT NOTHING. THE KING WAITS.',
        'SLIP WITH NO PUNCH COMING AND HE HOLDS THE CARVE.',
        'WAIT FOR A REAL TELL.',
      ],
    },
  },
  'warden.td': {
    general: ['MAXIMUM SECURITY. A NIGHTSTICK UPPERCUT, AND TEAR GAS WHEN HE RIOTS.'],
    exploit: {
      nightstickDrop: [
        'THE NIGHTSTICK COMES WITH A CLICK. LATE IN IT, HIS GRIP LOOSENS.',
        'WAIT FOR THE NIGHTSTICK TO NEARLY LAND.',
        'COUNTER LATE IN THE NIGHTSTICK.',
      ],
      gasMask: [
        'TEAR GAS SWEEPS THE RING LOW. A WARDEN WITHOUT HIS MASK CHOKES ON IT.',
        'GET UNDER THE TEAR GAS.',
        'DUCK THE TEAR GAS.',
      ],
      offDuty: [
        'WHEN HE GETS UP, HE\'S OFF DUTY FOR A SECOND.',
        'RIGHT AFTER HE RISES, HE\'S SLOW.',
        'HIT HIM AS HE GETS BACK UP.',
      ],
    },
    anti: {
      patrolsYourSide: [
        'YOU SLIP ONE WAY. HE PATROLS IT.',
        'THE NIGHTSTICK JAB COMES FROM YOUR FAVORITE SIDE.',
        'SLIP BOTH WAYS.',
      ],
      parryAndCuff: [
        'YOU\'RE JABBING AT A GUARD WHO ISN\'T OPEN.',
        'FOUR INTO HIS GUARD AND HE PARRIES AND HOOKS.',
        'WAIT FOR AN OPENING.',
      ],
    },
  },
  'eclipse.td': {
    general: ['THE RING OF FIRE, KID. THE WORLD STILL FLIPS. NEW PUNCHES: THE PENUMBRA AND THE ANTUMBRA.'],
    exploit: {
      annularRing: [
        'THE ANTUMBRA CHIMES LIKE GLASS. LATE IN IT, THE RING OF FIRE IS THIN.',
        'WAIT FOR THE ANTUMBRA TO NEARLY LAND.',
        'COUNTER LATE IN THE ANTUMBRA.',
      ],
      partialShadow: [
        'THE PENUMBRA SWEEPS LOW AND WHISPERS. IT DOESN\'T CARE WHICH WAY THE WORLD IS FLIPPED.',
        'GET UNDER THE PENUMBRA.',
        'DUCK THE PENUMBRA.',
      ],
      holdsTheEclipse: [
        'WHEN IT\'S QUIET, HE HOLDS THE ECLIPSE AND ADMIRES IT.',
        'GIVE HIM A QUIET MOMENT.',
        'STAND STILL A FEW SECONDS. HE STOPS TO HOLD THE ECLIPSE.',
      ],
    },
    anti: {
      eclipseWaits: [
        'YOU\'RE DODGING AT NOTHING. THE SUN STANDS STILL FOR YOU.',
        'SLIP WITH NO PUNCH COMING AND HE HOLDS THE SUNBEAM.',
        'WAIT FOR A REAL TELL.',
      ],
      shadowDrain: [
        'YOU\'RE BLOCKING EARLY. THE SHADOW SWALLOWS YOUR HEARTS.',
        'GUARD UP TOO LONG AND YOU DRAIN.',
        'BLOCK WHEN HE PUNCHES. NOT BEFORE.',
      ],
    },
  },
  'jax.td': {
    general: ['THUNDER RETURNS. HE\'S HAD A YEAR TO THINK ABOUT YOU, KID. THE STORM HAS A FOURTH ROUTINE, AND HE\'S GOT A THUNDERCLAP.'],
    exploit: {
      clapBack: [
        'THE THUNDERCLAP STARTS WITH A GUST. LATE IN THE GUST, THE CLAP IS COMMITTED.',
        'WAIT FOR THE THUNDERCLAP TO NEARLY BREAK.',
        'COUNTER LATE IN THE THUNDERCLAP.',
      ],
      stormSpent: [
        'THE THUNDERCLAP SWEEPS LOW. IF IT FINDS NOTHING, THE STORM IS SPENT.',
        'GET UNDER THE THUNDERCLAP.',
        'DUCK THE THUNDERCLAP.',
      ],
      breakTheRhythm: [
        'HIS UPPERCUT LEADS INTO A JAB AND A HOOK. BREAK THE FIRST LINK.',
        'CATCH THE UPPERCUT WHILE IT WINDS UP.',
        'COUNTER THE UPPERCUT IN ITS WINDUP. THE JAB AND HOOK NEVER COME.',
      ],
    },
    anti: {
      eyeOfTheStorm: [
        'YOU\'RE BLOCKING EARLY. IN THE EYE OF THE STORM, THAT COSTS YOU.',
        'GUARD UP TOO LONG AND YOUR HEARTS DRAIN.',
        'BLOCK WHEN HE PUNCHES. NOT BEFORE.',
      ],
      stormAnswers: [
        'YOU\'RE POUNDING THE CHAMP\'S GUARD. THE STORM ANSWERS.',
        'THREE INTO HIS GUARD AND THE HOOK COMES AT ONCE.',
        'STOP PUNCHING HIS GUARD.',
      ],
    },
  },
  'zero.td': {
    general: ['NOTHING, LOUDER. HE REMEMBERS HOW THEY ALL LOST, KID. SO DO YOU.'],
    exploit: {
      deadWeightEcho: [
        'THE ECHOED CEMENT MIXER IS HEAVY. IF IT FINDS NOTHING, HE\'S DEAD WEIGHT.',
        'MAKE THE ECHOED CEMENT MIXER MISS.',
        'SLIP THE CEMENT MIXER.',
      ],
      finalBowEchoed: [
        'THE ECHOED GRAND FINALE IS A SHOWMAN\'S BOW. A BOW THAT GETS NO APPLAUSE COMES UNDONE.',
        'MAKE THE GRAND FINALE MISS.',
        'SLIP THE GRAND FINALE.',
      ],
      noFloorMissed: [
        'NO FLOOR SWEEPS WHERE THE FLOOR WAS.',
        'GET UNDER NO FLOOR.',
        'DUCK NO FLOOR.',
      ],
    },
    anti: {
      echoOfYourJabs: [
        'YOU\'RE JABBING AT NOTHING. IT ECHOES BACK.',
        'FOUR INTO HIS GUARD AND HE PARRIES AND ANSWERS.',
        'WAIT FOR AN OPENING.',
      ],
      heldInTheEcho: [
        'YOU\'RE DODGING AT NOTHING. HE HOLDS IT IN THE ECHO.',
        'SLIP WITH NO PUNCH COMING AND HE WAITS YOU OUT.',
        'WAIT FOR A REAL TELL.',
      ],
    },
  },
};

export default { ...classic, ...ascension };
