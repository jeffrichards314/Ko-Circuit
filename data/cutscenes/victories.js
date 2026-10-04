// The victory scenes (spec §19 G2): one per circuit, replacing the plain belt ceremony. Each is a place (landmark and sky),
// the beaten champion's parting line and how the ceremony is announced. `victory` in templates.js draws it.
const GOLD = [[31, 27, 6], [31, 31, 20], [31, 18, 4], [31, 31, 31]];
const HELL = [[28, 5, 6], [20, 20, 24], [31, 14, 4], [10, 26, 25]];
const VOIDC = [[31, 31, 31], [20, 20, 28], [12, 12, 20], [26, 26, 31]];
const NIGHTC = [[20, 6, 24], [28, 4, 20], [31, 27, 6], [12, 3, 16]];
const FIRE = [{ p: 'fireworks', n: 4, y: 26 }, { p: 'confetti', n: 40 }];
const V = (circuit, title, p) => ({ id: `victory.${circuit}`, title, zone: p.zone || 'road', template: 'victory', params: { circuit, landmark: circuit, ...p } });
const PAN = (circuit, title, p) => V(circuit, title, { zone: 'pantheon', confetti: GOLD, ...p });
const UW = (circuit, title, p) => V(circuit, title, { zone: 'underworld', host: 'ferryman', tone: 'hell', far: [1, 1, 3], confetti: HELL, tint: [4, 1, 3], ground: 'stone', fxB: [{ p: 'drift', kind: 'ember', n: 26 }, { p: 'drift', kind: 'ash', n: 20 }], ...p });
const VD = (circuit, title, p) => V(circuit, title, { zone: 'void', host: 'ferryman', tone: 'void', far: [1, 1, 3], confetti: VOIDC, tint: [2, 2, 6], ground: 'void', fxB: [{ p: 'stars', n: 60 }, { p: 'drift', kind: 'dust', n: 20 }], ...p });

export const VICTORIES = [
  V('rookie', 'VICTORY: ROOKIE', { tone: 'dawn', line: 'NOT BAD, KID. THE KITCHEN\'S YOURS. TAKE THE BELT, AND A BURGER FOR THE ROAD.' }),
  V('minor', 'VICTORY: MINOR', { tone: 'day', line: '...YOU HIT HARDER THAN THE QUARRY. GO ON. THE BELT WEIGHS MORE THAN YOU THINK.' }),
  V('metro', 'VICTORY: METRO', { tone: 'dusk', fxB: FIRE, line: 'I DEMAND A RECOUNT. ...FINE. THE VOTERS HAVE SPOKEN, AND THEY SPOKE WITH A LEFT HOOK.' }),
  V('major', 'VICTORY: MAJOR', { tone: 'night', fxB: [{ p: 'confetti', n: 50 }, { p: 'flashes', n: 16, y: 120, h: 60 }], line: 'THE NIGHT ENDS. THE CROWD CHOSE YOU. HOW... BRIGHT THEY ARE.' }),
  V('carnival', 'VICTORY: CARNIVAL', { zone: 'secret', tone: 'dusk', line: 'LADIES AND GENTLEMEN, THE ACT IS OVER! KEEP THE BELT, KID. YOU EARNED THE TOP OF THE BILL.' }),
  V('continental', 'VICTORY: CONTINENTAL', { tone: 'dusk', confetti: GOLD, line: 'TOUCHE, MON AMI. NO ONE HAS PARRIED MY WAY OUT OF A DUEL SINCE MY FATHER.' }),
  V('world', 'VICTORY: WORLD', { tone: 'night', fxB: FIRE, line: 'BRAVO. YOU FOUND THE BEAT I NEVER PLAYED. THE WHOLE ORCHESTRA STANDS FOR YOU.' }),
  V('storm', 'VICTORY: STORM', { tone: 'storm', far: [4, 5, 9], fxB: [{ p: 'drift', kind: 'rain', n: 80, seed: 3 }, { p: 'confetti', n: 30 }], tint: [2, 3, 8], line: 'THE MOUNTAIN MOVES FOR NO ONE. ...IT MOVED FOR YOU. TAKE THE BELT AND GO BEFORE THE WEATHER TURNS.' }),
  V('legends', 'VICTORY: LEGENDS', { tone: 'dusk', confetti: GOLD, line: 'YOU BROKE THE GLASS. SEVEN YEARS OF BAD LUCK? I\'LL TAKE THE LUCK. YOU KEEP THE BELT.' }),
  V('grandprix', 'VICTORY: GRAND PRIX', { tone: 'dusk', fxB: FIRE, confetti: GOLD, line: 'THE CROWN NEVER LEAVES THIS ROOM. ...IT HAS, HASN\'T IT? LONG LIVE THE NEW KING.' }),
  V('underground', 'VICTORY: UNDERGROUND', { zone: 'secret', tone: 'night', fxB: [{ p: 'drift', kind: 'spark', n: 26 }, { p: 'drift', kind: 'dust', n: 18 }], tint: [2, 2, 5], line: 'THE KEYS ARE YOURS. NOBODY WALKS OUT OF D BLOCK. NOBODY BUT THE ONE WHO OWNS IT.' }),
  V('dream', 'VICTORY: DREAM FIGHT', { tone: 'dusk', fxB: [{ p: 'fireworks', n: 5, y: 24 }, { p: 'confetti', n: 70 }, { p: 'flashes', n: 16, y: 120, h: 60 }], confetti: GOLD, champScale: 0.9, line: 'SIXTY AND OH, THEN ONE. ...I THINK I LIKE THE CANVAS. TAKE THE BELT. YOU ARE UNDISPUTED.' }),
  V('nightmare', 'VICTORY: NIGHTMARE', { zone: 'secret', tone: 'nightmare', far: [12, 2, 15], confetti: NIGHTC, tint: [5, 1, 8], fxB: [{ p: 'drift', kind: 'dust', n: 30 }, { p: 'drift', kind: 'ash', n: 20 }], line: 'MORNING. I HAD FORGOTTEN IT. THE NIGHTMARE ENDS WITH YOU IN IT, CHAMPION.' }),
  V('zero', 'VICTORY: ZERO', { zone: 'secret', tone: 'white', far: [30, 30, 31], ground: 'canvas', confetti: VOIDC, tint: [5, 5, 8], fxB: [{ p: 'drift', kind: 'snow', n: 30 }], line: 'YOU WERE THE LAST ONE. ...IT WAS ALWAYS GOING TO BE YOU.' }),
  PAN('p1', 'VICTORY: GATE OF DAWN', { tone: 'dawn', far: [29, 26, 27], fxB: [{ p: 'drift', kind: 'petal', n: 40 }, { p: 'confetti', n: 30 }], line: 'THE LIGHT SETS, BUT IT ALWAYS RISES. GO ON, CHAMPION. THE NEXT STEP IS YOURS.' }),
  PAN('p2', 'VICTORY: CLOUD TERRACE', { tone: 'day', far: [29, 28, 30], fxB: [{ p: 'drift', kind: 'feather', n: 30 }, { p: 'confetti', n: 30 }], line: 'THE CLOUDS PART FOR YOU. I HAVE NEVER SEEN THEM DO THAT FOR ANYONE.' }),
  PAN('p3', 'VICTORY: HALL OF HEROES', { tone: 'cloudtop', far: [24, 22, 27], fxB: [{ p: 'drift', kind: 'dust', n: 40 }, { p: 'confetti', n: 30 }], line: 'AT LAST, SOMEONE WORTHY. I WAS THE FIRST CHAMPION. YOU ARE THE NEXT.' }),
  PAN('p4', 'VICTORY: STARFIELD', { tone: 'night', far: [3, 4, 12], fxB: [{ p: 'stars', n: 80 }, { p: 'confetti', n: 30 }], line: 'I AM STARDUST AGAIN. IT WAS A GOOD FIGHT. LOOK UP AS YOU CLIMB.' }),
  PAN('p5', 'VICTORY: THUNDER FORGE', { tone: 'ash', far: [8, 4, 6], tint: [6, 2, 3], fxB: [{ p: 'drift', kind: 'ember', n: 40 }, { p: 'confetti', n: 24 }], line: 'THE FORGE GOES COLD. THE BELT WAS HAMMERED FOR YOU, AND I NEVER KNEW.' }),
  PAN('p6', 'VICTORY: MIRROR SANCTUM', { tone: 'heaven', far: [22, 22, 30], fxB: [{ p: 'drift', kind: 'dust', n: 30 }, { p: 'confetti', n: 30 }], line: 'ALL THREE OF ME LOST. I MUST BE THE ONLY ONE WHO IS PROUD.' }),
  PAN('p7', 'VICTORY: THE SUMMIT', { tone: 'gold', far: [27, 27, 30], fxB: [{ p: 'drift', kind: 'feather', n: 30 }, { p: 'confetti', n: 40 }], line: 'HEY, IT\'S YOU! I MOPPED THE WHOLE SUMMIT FOR THIS. DON\'T TRACK IN MUD!' }),
  PAN('halcyon', 'VICTORY: HALCYON', { tone: 'gold', far: [31, 30, 24], fxB: [{ p: 'drift', kind: 'dust', n: 40 }, { p: 'confetti', n: 40 }], line: 'THE SUN HAS SET. TAKE THE LIGHT WITH YOU, CHALLENGER. YOU WILL NEED IT.' }),
  UW('u1', 'VICTORY: FERRYMAN\'S SHORE', { tone: 'river', line: 'WHICH ONE WAS I? YOU WOULD KNOW. YOU HAVE MET ALL MY FACES. GO.' }),
  UW('u2', 'VICTORY: ASHEN FIELDS', { tone: 'ash', line: 'MY CROWN GOES COLD. WEAR THE ASH, CHAMPION. IT WASHES OUT. OR IT DOES NOT.' }),
  UW('u3', 'VICTORY: CHAIN PITS', { line: 'THE KEYS... WHO HAS THE KEYS? YOU. YOU HAVE THE KEYS.' }),
  UW('u4', 'VICTORY: HALL OF THE FALLEN', { line: 'THE DEAD KING KNEELS. THE CROWN BELONGS TO THE UNDERWORLD. TAKE IT.' }),
  UW('u5', 'VICTORY: THE FURNACE', { tone: 'ash', line: 'THE POT IS CRACKED. WHAT IT HELD IS YOURS NOW. A LITTLE HEAT.' }),
  UW('u6', 'VICTORY: ABYSS GATE', { line: 'THE KING WILL HAVE MY VOICE FOR THIS. HE WILL HAVE YOURS TOO. GO IN.' }),
  UW('vorgath', 'VICTORY: VORGATH', { line: 'THE THRONE IS EMPTY. ...NOW YOU KNOW WHAT IT COSTS TO SIT IN IT.' }),
  VD('v1', 'VICTORY: THE FUNDAMENTALS', { line: 'YOU HAD THE LAST WORD. THE BASICS ARE ALL THERE IS. YOU KNOW THEM ALL.' }),
  VD('v2', 'VICTORY: THE SENSES', { line: 'SIXTY, AND YOU KNEW THEM ALL. THE SENSES REMEMBER YOU.' }),
  VD('v3', 'VICTORY: THE MIND', { line: 'I DID NOT FALL. I WAS LET GO. THANK YOU FOR LETTING ME.' }),
  VD('zeroTrue', 'VICTORY: ZERO, TRUE FORM', { host: 'announcer', announce: '...', ground: 'canvas', line: 'I WAS ONLY EVER THE SPACE BETWEEN YOUR PUNCHES.' }),
];
