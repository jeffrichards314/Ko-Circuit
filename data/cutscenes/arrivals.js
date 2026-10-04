// The arrival scenes (spec §19 G2): one per circuit, in the order a career walks them.
// A template (templates.js) does the drawing; each entry is a place, a time of day and the one line that is said.
const R = (circuit, title, p) => ({ id: `arrive.${circuit}`, title, zone: p.zone || 'road', template: 'arrival', params: { circuit, ...p } });

export const ARRIVALS = [
  R('rookie', 'ARRIVAL: ROOKIE', { landmark: 'rookie', tone: 'dawn', sun: [84, 118, 20], mid: 'trees', line: 'FOLDING CHAIRS, A LEAKY ROOF AND ONE HEAVY BAG. WELCOME TO THE ROOKIE CIRCUIT, {name}. EVERYBODY STARTS SOMEWHERE.' }),
  R('minor', 'ARRIVAL: MINOR', { landmark: 'minor', tone: 'day', mid: 'trees', far: [10, 12, 22], line: 'PINEWOOD. SMALL TOWN, BIG ELBOWS. THE WHOLE VILLAGE CAME OUT FOR THE FIGHT.' }),
  R('metro', 'ARRIVAL: METRO', { landmark: 'metro', tone: 'dusk', mid: 'city', line: 'THE BIG CITY. LOOK UP: THE RING IS ON THE ROOF. WATCH THE LIGHTS, CHAMP.' }),
  R('major', 'ARRIVAL: MAJOR', { landmark: 'major', tone: 'night', mid: 'city', midColor: [5, 5, 12], line: 'THE GRAND GARDEN. TWENTY THOUSAND SEATS AND EVERY FAN HAS A CAMERA.' }),
  R('carnival', 'ARRIVAL: CARNIVAL', { zone: 'secret', landmark: 'carnival', tone: 'dusk', mid: 'trees', line: 'SMELL THAT? POPCORN AND TROUBLE. THEY SAID NOBODY GETS AN INVITE. YOU GOT ONE.' }),
  R('continental', 'ARRIVAL: CONTINENTAL', { landmark: 'continental', tone: 'dusk', mid: 'trees', line: 'OVERSEAS AT LAST. MIND YOUR MANNERS IN THERE: THEY FENCE FOR FUN.' }),
  R('world', 'ARRIVAL: WORLD', { landmark: 'world', tone: 'night', mid: 'city', midColor: [5, 5, 12], line: 'THE WORLD CIRCUIT. THAT\'S YOUR FACE ON THE BIG SCREEN, CHAMP. WAVE.' }),
  R('storm', 'ARRIVAL: STORM', { landmark: 'storm', tone: 'storm', mid: 'dead', far: [4, 5, 9], near: [3, 6, 5], amb: [{ p: 'drift', kind: 'rain', n: 90, seed: 3 }], line: 'A RING ON A HILLTOP IN A THUNDERSTORM. I SAID IT WAS OUTDOORS. I NEVER SAID IT WAS DRY.' }),
  R('legends', 'ARRIVAL: LEGENDS', { landmark: 'legends', tone: 'dusk', mid: 'trees', line: 'THE HALL OF FAME. EVERY LEGEND ON THAT WALL ONCE STOOD WHERE YOU\'RE STANDING.' }),
  R('grandprix', 'ARRIVAL: GRAND PRIX', { landmark: 'grandprix', tone: 'dusk', mid: 'city', midColor: [10, 7, 14], amb: [{ p: 'fireworks', n: 3, y: 30 }], line: 'THE COLOSSEUM. THE BIGGEST CROWD YOU\'VE EVER SEEN. SMILE FOR THE FIREWORKS.' }),
  R('underground', 'ARRIVAL: UNDERGROUND', { zone: 'secret', landmark: 'underground', tone: 'night', mid: 'pines', line: 'NO SIGN. NO STREET NUMBER. JUST A DOOR THAT WASN\'T THERE YESTERDAY. KEEP YOUR HANDS UP.' }),
  R('dream', 'ARRIVAL: DREAM FIGHT', { landmark: 'dream', tone: 'dusk', mid: 'city', amb: [{ p: 'flashes', n: 12, y: 96, h: 40 }], line: 'JAX CRANE\'S HOUSE. SIXTY FIGHTS, SIXTY WINS. YOU\'RE THE FIRST ONE HE\'S EVER HAD TO WAIT FOR.' }),
  R('nightmare', 'ARRIVAL: NIGHTMARE', { zone: 'secret', landmark: 'nightmare', tone: 'nightmare', mid: 'dead', far: [12, 2, 15], near: [6, 1, 10], line: 'THE BUILDING IS... WRONG. DON\'T LOOK AT THE SKY. I\'M SERIOUS, CHAMP.' }),
  R('zero', 'ARRIVAL: ZERO', { zone: 'secret', landmark: 'zero', tone: 'nightmare', line: 'IT\'S JUST A DOOR. A WHITE DOOR IN NOTHING. I\'D SAY TURN BACK, BUT I KNOW YOU.' }),

  // the Pantheon: a marble terrace above the clouds, the trainer's voice from the box
  R('p1', 'ARRIVAL: GATE OF DAWN', { zone: 'pantheon', env: 'sky', landmark: 'p1', tone: 'dawn', sun: [70, 110, 22], amb: [{ p: 'drift', kind: 'petal', n: 26 }], music: 'ascend', line: 'THE GATE OF DAWN. ONLY THE UNDEFEATED CLIMB, AND YOU\'RE ON THE FIRST STEP.' }),
  R('p2', 'ARRIVAL: CLOUD TERRACE', { zone: 'pantheon', env: 'sky', landmark: 'p2', tone: 'day', groundTone: 'cloud', amb: [{ p: 'drift', kind: 'feather', n: 18 }], music: 'ascend', line: 'CLOUDS UNDERFOOT. DON\'T LOOK DOWN. AND DON\'T STEP ON THE THIN ONES.' }),
  R('p3', 'ARRIVAL: HALL OF HEROES', { zone: 'pantheon', env: 'sky', landmark: 'p3', tone: 'cloudtop', amb: [{ p: 'drift', kind: 'dust', n: 30 }], music: 'ascend', line: 'THE HALL OF HEROES. LOOK AT THEM ALL. THE GHOSTS ARE LOOKING BACK.' }),
  R('p4', 'ARRIVAL: STARFIELD', { zone: 'pantheon', env: 'sky', landmark: 'p4', tone: 'night', stars: true, groundTone: 'dark', amb: [{ p: 'stars', n: 90, par: 0.1 }], music: 'ascend', line: 'THE STARFIELD. IT\'S QUIET UP HERE. TOO QUIET. WATCH THE CONSTELLATIONS.' }),
  R('p5', 'ARRIVAL: THUNDER FORGE', { zone: 'pantheon', env: 'sky', landmark: 'p5', tone: 'ash', cloud: [14, 8, 8], cloud2: [10, 6, 7], groundTone: 'dark', amb: [{ p: 'drift', kind: 'ember', n: 26 }], music: 'ascend', line: 'THE THUNDER FORGE. FEEL THAT HEAT? SOMEBODY IS HAMMERING THE SKY.' }),
  R('p6', 'ARRIVAL: MIRROR SANCTUM', { zone: 'pantheon', env: 'sky', landmark: 'p6', tone: 'heaven', amb: [{ p: 'drift', kind: 'dust', n: 20 }], music: 'ascend', line: 'THE MIRROR SANCTUM. THAT\'S YOU IN THE GLASS. OR SOMETHING WEARING YOU.' }),
  R('p7', 'ARRIVAL: THE SUMMIT', { zone: 'pantheon', env: 'sky', landmark: 'p7', tone: 'gold', sun: [200, 90, 24], amb: [{ p: 'drift', kind: 'feather', n: 22 }], music: 'ascend', line: 'THE SUMMIT. THE LAST STEP BEFORE THE LIGHT. BREATHE. THEN FIGHT.' }),
  R('halcyon', 'ARRIVAL: HALCYON', { zone: 'pantheon', env: 'sky', landmark: 'halcyon', tone: 'gold', sun: [128, 84, 30], amb: [{ p: 'drift', kind: 'dust', n: 26 }], music: 'ascend', line: 'THE GATE OF LIGHT. NOBODY HAS EVER TOUCHED HIM. THAT\'S NOT A REASON TO STOP.' }),
  // the Underworld: the Ferryman's boat on the black water, the far shore where the landmark stands
  R('u1', 'ARRIVAL: FERRYMAN\'S SHORE', { zone: 'underworld', env: 'river', landmark: 'u1', tone: 'river', music: 'ferrymanTheme', line: 'THE FIRST SHORE. STEP OFF WHEN THE BOAT STOPS. THE DEAD HAVE WAITED TO MEET YOU.' }),
  R('u2', 'ARRIVAL: ASHEN FIELDS', { zone: 'underworld', env: 'river', landmark: 'u2', tone: 'ash', amb: [{ p: 'drift', kind: 'ash', n: 40 }], music: 'ferrymanTheme', line: 'ASH FALLS HERE AND NEVER LANDS. THE FIELDS BURN AND HAVE NOTHING TO BURN.' }),
  R('u3', 'ARRIVAL: CHAIN PITS', { zone: 'underworld', env: 'river', landmark: 'u3', tone: 'hell', music: 'ferrymanTheme', line: 'THE PITS. WHAT IS CHAINED HERE WAS CHAINED FOR A REASON.' }),
  R('u4', 'ARRIVAL: HALL OF THE FALLEN', { zone: 'underworld', env: 'river', landmark: 'u4', tone: 'hell', amb: [{ p: 'drift', kind: 'dust', n: 24 }], music: 'ferrymanTheme', line: 'THE HALL OF THE FALLEN. YOU KNOW THESE FACES. THEY WILL NOT KNOW YOURS.' }),
  R('u5', 'ARRIVAL: THE FURNACE', { zone: 'underworld', env: 'river', landmark: 'u5', tone: 'ash', amb: [{ p: 'drift', kind: 'ember', n: 34 }], music: 'ferrymanTheme', line: 'THE FURNACE. HEAT IS A CLOCK HERE. IT COUNTS AGAINST YOU.' }),
  R('u6', 'ARRIVAL: ABYSS GATE', { zone: 'underworld', env: 'river', landmark: 'u6', tone: 'hell', music: 'ferrymanTheme', line: 'THE ABYSS GATE. NOTHING PASSES IT UNLESS THE KING ALLOWS. HE ALLOWS YOU.' }),
  R('vorgath', 'ARRIVAL: VORGATH', { zone: 'underworld', env: 'river', landmark: 'vorgath', tone: 'hell', amb: [{ p: 'drift', kind: 'ember', n: 20 }], music: 'ferrymanTheme', line: 'THE THRONE. I HAVE CARRIED MANY TO THIS DOOR. NONE BACK.' }),
  // the Void: the boat drifts over nothing toward a fragment
  R('v1', 'ARRIVAL: THE FUNDAMENTALS', { zone: 'void', env: 'void', landmark: 'v1', music: 'voidDoor', lmBase: 128, line: 'THE VOID. THE RIVER ENDS HERE. TWELVE ARE TRAPPED IN IT. FREE THEM.' }),
  R('v2', 'ARRIVAL: THE SENSES', { zone: 'void', env: 'void', landmark: 'v2', music: 'voidDoor', lmBase: 128, line: 'THE SENSES. SEE, HEAR, REMEMBER. THE VOID TAKES THEM ONE BY ONE.' }),
  R('v3', 'ARRIVAL: THE MIND', { zone: 'void', env: 'void', landmark: 'v3', music: 'voidDoor', lmBase: 128, line: 'THE MIND. THE LAST OF THE FRAGMENTS. IT WILL ANSWER YOU WITH YOURSELF.' }),
  R('zeroTrue', 'ARRIVAL: ZERO, TRUE FORM', { zone: 'void', env: 'void', landmark: 'zeroTrue', music: 'voidDoor', lmBase: 156, who: 'dash', dashId: 'dash1', line: 'THIS IS IT, CHAMP. HE\'S STOPPED PRETENDING TO BE PIECES. I\'M IN YOUR CORNER NOW.' }),
];
