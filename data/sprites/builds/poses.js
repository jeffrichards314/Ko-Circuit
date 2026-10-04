// Shared opponent pose library (front view), in medium-build units.
// Origin = midpoint between the feet on the canvas; y is negative going up.
// "L"/"R" are the viewer's left/right. Each pose may `extends` another and
// override joints; `shift` moves every joint that isn't overridden.
//
// Generic move vocabulary (fighters map their moves onto these):
//   jabTell/jab        straight punch from the viewer-left arm
//   hookTell/hook      wide hook from the viewer-right arm
//   overheadTell1/2    both arms raised overhead (haymaker / mop swing tell)
//   overhead1/2        overhead swing coming down, then follow-through
//   overheadRecover    bent over after the swing (open)

const FEET = { knL: [-13, -22], knR: [13, -22], ftL: [-16, 0], ftR: [16, 0] };
const BENT = { knL: [-15, -20], knR: [15, -20], ftL: [-17, 0], ftR: [17, 0] };

export const POSES = {
  idle1: {
    hip: [0, -43], waist: [0, -54], chest: [0, -72], neck: [0, -87],
    head: { at: [0, -100], face: 'neutral', look: [0, 0] },
    shL: [-20, -81], shR: [20, -81],
    elL: [-25, -59], elR: [25, -59],
    fiL: [-11, -72], fiR: [11, -72],
    ...FEET,
    gloveL: { view: 'side', angle: 10 }, gloveR: { view: 'side', angle: -10 },
  },
  idle2: {
    extends: 'idle1', shift: [0, 1], ...FEET,
    fiL: [-11, -70], fiR: [11, -70],
  },

  // --- straight jab (viewer-left arm) ---
  jabTell: {
    extends: 'idle1', shift: [-2, 0], ...FEET,
    head: { at: [-3, -100], face: 'focus', look: [-1, 0] },
    shL: [-22, -80], elL: [-33, -70], fiL: [-26, -88],
    gloveL: { angle: -15 },
    shR: [18, -81], elR: [21, -60], fiR: [7, -74],
  },
  jab: {
    extends: 'idle1', shift: [2, 3], ...BENT,
    head: { at: [3, -97], face: 'strain', look: [0, 1] },
    shL: [-16, -80], elL: [-13, -68], fiL: [-3, -62],
    gloveL: { view: 'front', size: 1.5 },
    shR: [22, -79], elR: [27, -58], fiR: [14, -74],
    frontOrder: ['R', 'L'],
  },

  // --- hook (viewer-right arm) ---
  hookTell: {
    extends: 'idle1', shift: [3, 0], ...FEET,
    head: { at: [4, -99], face: 'focus', look: [1, 0] },
    shR: [22, -80], elR: [36, -74], fiR: [34, -92], gloveR: { angle: 20 },
    shL: [-18, -81], elL: [-21, -60], fiL: [-6, -74],
  },
  hook: {
    extends: 'idle1', shift: [-3, 2], ...BENT,
    head: { at: [-4, -98], face: 'strain', look: [-1, 1] },
    shR: [18, -80], elR: [24, -70], fiR: [2, -64], gloveR: { view: 'front', size: 1.45 },
    shL: [-22, -80], elL: [-27, -58], fiL: [-14, -73],
  },

  // --- overhead haymaker (both hands, like swinging a mop) ---
  overheadTell1: {
    extends: 'idle1', shift: [0, 1], ...BENT,
    head: { at: [0, -99], face: 'focus', look: [0, -1] },
    shL: [-19, -82], shR: [19, -82],
    elL: [-24, -99], elR: [22, -101],
    fiL: [-5, -113], fiR: [4, -119],
    gloveL: { angle: 25 }, gloveR: { angle: -15 },
  },
  overheadTell2: {
    extends: 'overheadTell1', shift: [1, 0], ...BENT,
    head: { at: [1, -99], face: 'focus', look: [1, -1] },
    elL: [-23, -101], elR: [23, -103],
    fiL: [-4, -116], fiR: [5, -122],
  },
  overhead1: {
    extends: 'idle1', shift: [0, 3], ...BENT,
    head: { at: [0, -95], face: 'strain', look: [0, 1] },
    shL: [-19, -79], shR: [19, -79],
    elL: [-22, -75], elR: [21, -77],
    fiL: [-7, -66], fiR: [5, -70],
    gloveL: { view: 'front', size: 1.3 }, gloveR: { view: 'front', size: 1.3 },
    frontOrder: ['R', 'L'],
  },
  overhead2: {
    extends: 'idle1', shift: [3, 4], ...BENT,
    head: { at: [6, -95], face: 'strain', look: [2, 1] },
    shL: [-14, -78], shR: [23, -76],
    elL: [2, -58], elR: [33, -58],
    fiL: [19, -40], fiR: [28, -44],
    gloveL: { angle: 140 }, gloveR: { angle: 160 },
  },
  overheadRecover: {
    extends: 'idle1', shift: [1, 6],
    knL: [-16, -19], knR: [16, -19], ftL: [-17, 0], ftR: [17, 0],
    head: { at: [3, -91], face: 'dazed', tilt: 'down', look: [0, 1] },
    elL: [-22, -54], elR: [25, -54],
    fiL: [-12, -40], fiR: [14, -38],
    gloveL: { angle: 170 }, gloveR: { angle: -170 },
  },

  // --- defence / reactions ---
  block: {
    extends: 'idle1', shift: [0, 1], ...FEET,
    head: { at: [0, -99], face: 'focus', look: [0, 1] },
    elL: [-17, -75], elR: [17, -75],
    fiL: [-6, -96], fiR: [6, -96],
    gloveL: { angle: 4 }, gloveR: { angle: -4 },
  },
  hitHigh: {
    extends: 'idle1', shift: [0, -1], ...FEET,
    head: { at: [1, -102], face: 'hurt', tilt: 'up', look: [0, -2] },
    elL: [-33, -70], elR: [33, -71],
    fiL: [-38, -87], fiR: [38, -88],
    gloveL: { angle: -30 }, gloveR: { angle: 30 },
  },
  hitLow: {
    extends: 'idle1', shift: [0, 4], ...BENT,
    head: { at: [0, -92], face: 'hurt', tilt: 'down', look: [0, 1] },
    shL: [-19, -78], shR: [19, -78],
    elL: [-24, -58], elR: [24, -58],
    fiL: [-9, -57], fiR: [9, -55],
    gloveL: { angle: 60 }, gloveR: { angle: -60 },
  },
  stunned1: {
    extends: 'idle1', shift: [-2, 2], ...BENT,
    head: { at: [-3, -99], face: 'dazed', look: [-1, 0] },
    elL: [-27, -62], elR: [24, -64],
    fiL: [-22, -48], fiR: [17, -50],
    gloveL: { angle: 190 }, gloveR: { angle: 165 },
  },
  stunned2: {
    extends: 'stunned1', shift: [4, 0], ...BENT,
    head: { at: [3, -99], face: 'dazed', look: [1, 0] },
  },

  // --- knockdown ---
  kd1: {
    extends: 'hitHigh', shift: [0, 3],
    knL: [-16, -19], knR: [16, -19], ftL: [-17, 0], ftR: [17, 0],
    head: { at: [-2, -100], face: 'ko', tilt: 'up', look: [0, -2] },
    fiL: [-40, -96], fiR: [36, -100],
  },
  kd2: {
    hip: [0, -30], waist: [0, -39], chest: [0, -53], neck: [0, -65],
    head: { at: [0, -77], face: 'ko', tilt: 'up', look: [0, -2] },
    shL: [-20, -61], shR: [20, -61],
    elL: [-33, -71], elR: [33, -71],
    fiL: [-42, -86], fiR: [42, -86],
    knL: [-17, -18], knR: [17, -18], ftL: [-18, 0], ftR: [18, 0],
    gloveL: { angle: -40 }, gloveR: { angle: 40 },
  },
  // flat on his back, feet toward you and foreshortened: legs splayed out flat,
  // arms flung wide at shoulder height (not propping him up, which read as sitting)
  down: {
    lying: true,
    hip: [0, -13], waist: [0, -22], chest: [0, -32], neck: [0, -41],
    head: { at: [0, -50], face: 'ko', tilt: 'up', look: [0, -1] },
    shL: [-20, -36], shR: [20, -36],
    elL: [-35, -40], elR: [35, -40],
    fiL: [-48, -46], fiR: [48, -46],
    knL: [-17, -8], knR: [17, -8], ftL: [-23, 0], ftR: [23, 0],
    gloveL: { angle: -70 }, gloveR: { angle: 70 },
  },
  kd3: { extends: 'down', shift: [0, -4] },
  getup: {
    hip: [0, -28], waist: [0, -38], chest: [0, -56], neck: [0, -71],
    head: { at: [1, -84], face: 'hurt', tilt: 'down', look: [0, 1] },
    shL: [-19, -66], shR: [20, -66],
    elL: [-27, -45], elR: [25, -46],
    fiL: [-24, -26], fiR: [15, -32],
    knL: [-12, -6], ftL: [-13, -2], knR: [14, -24], ftR: [15, 0],
    gloveL: { angle: 185 }, gloveR: { angle: 160 },
  },

  // --- attitude ---
  taunt: {
    extends: 'idle1', shift: [1, 0], ...FEET,
    head: { at: [2, -100], face: 'grin', look: [1, 0] },
    elR: [33, -75], fiR: [31, -95], gloveR: { angle: 15 },
    elL: [-31, -62], fiL: [-22, -53], gloveL: { angle: 200 },
  },
  victory: {
    extends: 'idle1', ...FEET,
    head: { at: [0, -100], face: 'grin', look: [0, -1] },
    elL: [-31, -101], elR: [31, -101],
    fiL: [-22, -120], fiR: [22, -120],
    gloveL: { angle: 20 }, gloveR: { angle: -20 },
  },

  // --- Phase 2 additions (existing poses above are unchanged) ---------------
  // mirrored straights / hooks: the other arm
  jabRTell: { mirror: 'jabTell' },
  jabR: { mirror: 'jab' },
  hookLTell: { mirror: 'hookTell' },
  hookL: { mirror: 'hook' },

  // body blow (viewer-left arm), low straight into the stomach
  bodyTell: {
    extends: 'idle1', shift: [-2, 4], ...BENT,
    head: { at: [-3, -95], face: 'focus', look: [-1, 1] },
    shL: [-22, -78], elL: [-33, -58], fiL: [-27, -46],
    gloveL: { angle: 150 },
    shR: [18, -79], elR: [22, -59], fiR: [8, -72],
  },
  body: {
    extends: 'idle1', shift: [2, 6], ...BENT,
    head: { at: [3, -93], face: 'strain', look: [0, 1] },
    shL: [-16, -76], elL: [-14, -60], fiL: [-3, -50],
    gloveL: { view: 'front', size: 1.35 },
    shR: [22, -77], elR: [27, -57], fiR: [14, -71],
    frontOrder: ['R', 'L'],
  },
  bodyRTell: { mirror: 'bodyTell' },
  bodyR: { mirror: 'body' },

  // uppercut (viewer-right arm): dips, then drives straight up
  upperTell: {
    extends: 'idle1', shift: [3, 6], ...BENT,
    head: { at: [4, -94], face: 'focus', look: [1, 1] },
    shR: [21, -77], elR: [31, -57], fiR: [25, -38],
    gloveR: { angle: 185 },
    shL: [-18, -78], elL: [-21, -58], fiL: [-7, -71],
  },
  upper: {
    extends: 'idle1', shift: [-1, -2], ...FEET,
    head: { at: [-2, -103], face: 'strain', look: [0, -1] },
    shR: [17, -84], elR: [18, -90], fiR: [5, -100],
    gloveR: { view: 'front', size: 1.45 },
    shL: [-21, -83], elL: [-26, -62], fiL: [-13, -75],
    frontOrder: ['L', 'R'],
  },
  upperLTell: { mirror: 'upperTell' },
  upperL: { mirror: 'upper' },

  // wide horizontal sweep (viewer-right arm): cocked out wide, then across
  sweepTell: {
    extends: 'idle1', shift: [5, 2], ...BENT,
    head: { at: [6, -98], face: 'focus', look: [1, 0] },
    shR: [23, -80], elR: [41, -74], fiR: [50, -84],
    gloveR: { angle: 70 },
    shL: [-17, -80], elL: [-20, -60], fiL: [-6, -73],
  },
  sweep1: {
    extends: 'idle1', shift: [0, 3], ...BENT,
    head: { at: [0, -96], face: 'strain', look: [0, 1] },
    shR: [21, -79], elR: [26, -66], fiR: [4, -62],
    gloveR: { view: 'front', size: 1.4 },
    frontOrder: ['L', 'R'],
  },
  sweep2: {
    extends: 'idle1', shift: [-5, 3], ...BENT,
    head: { at: [-7, -96], face: 'strain', look: [-1, 1] },
    shR: [15, -79], shL: [-24, -78], elR: [-2, -66], fiR: [-26, -67],
    elL: [-33, -60], fiL: [-24, -74],
    gloveR: { angle: -85 },
  },
  sweepLTell: { mirror: 'sweepTell' },
  sweepL1: { mirror: 'sweep1' },
  sweepL2: { mirror: 'sweep2' },

  // coiled crouch (burst / charge tells)
  crouchTell: {
    extends: 'idle1', shift: [0, 7],
    knL: [-17, -17], knR: [17, -17], ftL: [-17, 0], ftR: [17, 0],
    head: { at: [0, -92], face: 'focus', look: [0, 0] },
    elL: [-22, -54], elR: [22, -54], fiL: [-9, -68], fiR: [9, -68],
    gloveL: { angle: 5 }, gloveR: { angle: -5 },
  },

  // winded: bent over, gloves on the knees (fatigue openings)
  winded1: {
    extends: 'idle1', shift: [0, 10],
    knL: [-16, -18], knR: [16, -18], ftL: [-17, 0], ftR: [17, 0],
    head: { at: [0, -80], face: 'strain', tilt: 'down', look: [0, 2] },
    shL: [-19, -71], shR: [19, -71],
    elL: [-26, -50], elR: [26, -50], fiL: [-17, -32], fiR: [17, -32],
    gloveL: { angle: 160 }, gloveR: { angle: -160 },
  },
  winded2: {
    extends: 'winded1', shift: [0, -2],
    knL: [-16, -18], knR: [16, -18], ftL: [-17, 0], ftR: [17, 0],
    head: { at: [0, -83], face: 'hurt', tilt: 'down', look: [0, 1] },
  },

  // showing off to the crowd, both gloves up and out
  flex: {
    extends: 'idle1', ...FEET,
    head: { at: [0, -100], face: 'grin', look: [0, 0] },
    elL: [-36, -86], elR: [36, -86], fiL: [-29, -104], fiR: [29, -104],
    gloveL: { angle: 25 }, gloveR: { angle: -25 },
  },
  // --- beaten: how a fighter stands (or doesn't) on his podium once you've beaten him (each with a second frame, breathing).
  //     data/fighters/beaten.js gives every fighter his own, no two alike in one hall.
  beatKneel1: {
    extends: 'idle1', shift: [-4, 22],
    knL: [-17, -2], ftL: [-26, 0], knR: [12, -25], ftR: [14, 0],
    head: { at: [-3, -78], face: 'hurt', tilt: 'down', look: [-1, 2] },
    shL: [-23, -59], shR: [15, -59], elL: [-32, -34], fiL: [-30, -9], elR: [19, -40], fiR: [12, -30],
    gloveL: { angle: 180 }, gloveR: { angle: -140 },
  },
  beatKneel2: { extends: 'beatKneel1', shift: [0, 1], knL: [-17, -2], ftL: [-26, 0], knR: [12, -25], ftR: [14, 0], fiL: [-30, -9] },
  beatKneelBoth1: {
    extends: 'idle1', shift: [0, 31],
    knL: [-15, -3], knR: [15, -3], ftL: [-19, 0], ftR: [19, 0],
    head: { at: [0, -62], face: 'hurt', tilt: 'down', look: [0, 3] },
    shL: [-19, -46], shR: [19, -46], elL: [-22, -26], fiL: [-13, -9], elR: [22, -26], fiR: [13, -9],
    gloveL: { angle: 180 }, gloveR: { angle: 180 },
  },
  beatKneelBoth2: { extends: 'beatKneelBoth1', shift: [0, 1], knL: [-15, -3], knR: [15, -3], ftL: [-19, 0], ftR: [19, 0], fiL: [-13, -9], fiR: [13, -9] },
  beatSit1: {
    extends: 'idle1', shift: [0, 30],
    knL: [-22, -16], knR: [22, -16], ftL: [-30, 0], ftR: [30, 0],
    head: { at: [0, -70], face: 'dazed', tilt: 'up', look: [0, -1] },
    shL: [-20, -51], shR: [20, -51], elL: [-32, -30], fiL: [-37, -7], elR: [32, -30], fiR: [37, -7],
    gloveL: { angle: -60 }, gloveR: { angle: 60 },
  },
  beatSit2: { extends: 'beatSit1', head: { at: [1, -70], face: 'dazed', tilt: 'up', look: [1, -1] } },
  beatHang1: {
    extends: 'idle1', shift: [0, 4], ...FEET,
    head: { at: [0, -88], face: 'hurt', tilt: 'down', look: [0, 2] },
    shL: [-20, -76], shR: [20, -76], elL: [-26, -55], fiL: [-26, -35], elR: [26, -55], fiR: [26, -35],
    gloveL: { angle: 180 }, gloveR: { angle: 180 },
  },
  beatHang2: { extends: 'beatHang1', shift: [0, 1], ...FEET },
  beatJaw1: {
    extends: 'idle1', ...FEET,
    head: { at: [-2, -100], face: 'hurt', look: [-1, 0] },
    elR: [25, -80], fiR: [8, -95], gloveR: { angle: -40 },
    elL: [-26, -58], fiL: [-23, -45], gloveL: { angle: 170 },
  },
  beatJaw2: { extends: 'beatJaw1', fiR: [9, -93] },
  beatShrug1: {
    extends: 'idle1', ...FEET,
    head: { at: [0, -100], face: 'grin', look: [0, 0] },
    shL: [-22, -83], shR: [22, -83], elL: [-34, -65], fiL: [-44, -75], elR: [34, -65], fiR: [44, -75],
    gloveL: { angle: -60, view: 'back' }, gloveR: { angle: 60, view: 'back' },
  },
  beatShrug2: { extends: 'beatShrug1', shL: [-22, -85], shR: [22, -85], fiL: [-44, -77], fiR: [44, -77] },
  beatWave1: {
    extends: 'idle1', ...FEET,
    head: { at: [1, -100], face: 'grin', look: [1, -1] },
    elR: [31, -99], fiR: [30, -120], gloveR: { angle: 0, view: 'back' },
    elL: [-26, -58], fiL: [-22, -46], gloveL: { angle: 170 },
  },
  beatWave2: { extends: 'beatWave1', elR: [33, -98], fiR: [39, -116], gloveR: { angle: 20, view: 'back' } },
  beatSurrender1: {
    extends: 'idle1', ...FEET,
    head: { at: [0, -99], face: 'hurt', look: [0, 1] },
    elL: [-31, -98], fiL: [-25, -118], elR: [31, -98], fiR: [25, -118],
    gloveL: { angle: 0, view: 'back' }, gloveR: { angle: 0, view: 'back' },
  },
  beatSurrender2: { extends: 'beatSurrender1', fiL: [-26, -116], fiR: [26, -116] },
  beatRibs1: {
    extends: 'idle1', shift: [0, 6], ...BENT,
    head: { at: [0, -90], face: 'hurt', tilt: 'down', look: [0, 2] },
    elL: [-25, -54], fiL: [-8, -58], elR: [25, -52], fiR: [10, -54],
    gloveL: { angle: 80 }, gloveR: { angle: -80 },
  },
  beatRibs2: { extends: 'beatRibs1', shift: [0, 1], ...BENT },
  beatHead1: {
    extends: 'idle1', ...FEET,
    head: { at: [0, -98], face: 'hurt', tilt: 'down', look: [0, 1] },
    elL: [-33, -92], fiL: [-12, -108], elR: [33, -92], fiR: [12, -108],
    gloveL: { angle: 120 }, gloveR: { angle: -120 },
  },
  beatHead2: { extends: 'beatHead1', head: { at: [1, -97], face: 'hurt', tilt: 'down', look: [1, 1] } },
  beatBow1: {
    extends: 'idle1', shift: [0, 6], ...FEET,
    chest: [0, -66], neck: [0, -74],
    head: { at: [0, -80], face: 'neutral', tilt: 'down', look: [0, 3] },
    shL: [-18, -70], shR: [18, -70], elL: [-17, -52], fiL: [-8, -40], elR: [17, -52], fiR: [8, -40],
    gloveL: { angle: 180 }, gloveR: { angle: 180 },
  },
  beatBow2: { extends: 'beatBow1', shift: [0, 1], ...FEET, chest: [0, -66], neck: [0, -74] },
  beatCrossed1: {
    extends: 'idle1', ...FEET,
    head: { at: [0, -100], face: 'strain', look: [1, 0] },
    elL: [-25, -62], fiL: [12, -68], elR: [25, -60], fiR: [-12, -64],
    gloveL: { view: 'front', angle: 90 }, gloveR: { view: 'front', angle: -90 },
  },
  beatCrossed2: { extends: 'beatCrossed1', head: { at: [0, -100], face: 'strain', look: [-1, 0] } },
  beatPoint1: {
    extends: 'idle1', ...FEET,
    head: { at: [0, -100], face: 'grin', look: [0, 1] },
    elR: [21, -73], fiR: [6, -83], gloveR: { view: 'front', size: 1.2 },
    elL: [-27, -62], fiL: [-19, -52], gloveL: { angle: 120 },
  },
  beatPoint2: { extends: 'beatPoint1', fiR: [6, -85] },
  beatDizzy1: {
    extends: 'stunned1', shift: [-7, 4], ...BENT,
    head: { at: [-9, -95], face: 'dazed', look: [-2, 1] },
  },
  beatDizzy2: {
    extends: 'stunned1', shift: [7, 4], ...BENT,
    head: { at: [9, -95], face: 'dazed', look: [2, 1] },
  },
  beatShake1: {
    extends: 'idle1', ...FEET,
    head: { at: [0, -100], face: 'strain', look: [0, 1] },
    elR: [28, -70], fiR: [22, -90], gloveR: { angle: -20 },
    elL: [-26, -58], fiL: [-23, -45], gloveL: { angle: 170 },
  },
  beatShake2: { extends: 'beatShake1', fiR: [24, -94] },
  beatSlump1: {
    extends: 'idle1', shift: [0, 12],
    knL: [-19, -20], knR: [19, -20], ftL: [-19, 0], ftR: [19, 0],
    head: { at: [0, -76], face: 'strain', tilt: 'down', look: [0, 3] },
    shL: [-20, -66], shR: [20, -66], elL: [-32, -42], fiL: [-18, -25], elR: [32, -42], fiR: [18, -25],
    gloveL: { angle: 150 }, gloveR: { angle: -150 },
  },
  beatSlump2: { extends: 'beatSlump1', shift: [0, 2], knL: [-19, -20], knR: [19, -20], ftL: [-19, 0], ftR: [19, 0], fiL: [-18, -25], fiR: [18, -25] },
  beatOut1: { extends: 'down' },
  beatOut2: { extends: 'down', shift: [0, -1] },
};