// THE CITY OF CHAMPIONS (spec §19 G11): a world of its own at the end of the road trip, not an island. The whole map is city: avenues
// and blocks of towers, a canal with road bridges, parks, the belt hall and the Gauntlet tower on Victory Plaza, the Dream arena on its
// walled plateau, and the mountain over the city. The warp to ZERO's world tears open in an east alley once Jax is beaten (the Sky Gate
// and the chasm are past ZERO's throne, at the crossroads: data/world/zero.js).
export default {
  id: 'champ', name: 'THE CITY OF CHAMPIONS', cols: 48, rows: 60,
  song: 'champMap', ambient: 'champ',
  base: [
    ['fill', 'city'],
    // ---- the mountain over the city: rock, snow, pines, a marble walk up to the champions' monument
    ['rect', 'rock', 0, 0, 47, 15],
    ['blob', 'rock', 24, 16, 16, 3, 1],
    ['blob', 'snow', 12, 3, 10, 4, 2, { on: true }],
    ['blob', 'snow', 36, 2, 11, 4, 3, { on: true }],
    ['blob', 'snow', 24, 6, 5, 3, 4, { on: true }],
    ['rect', 'marble', 22, 7, 26, 18],
    ['scatter', 'snowpeak', [0, 0, 47, 12], 0.2, 5, { on: ['snow', 'rock'] }],
    ['scatter', 'peak', [0, 4, 47, 15], 0.14, 6, { on: ['rock'] }],
    ['scatter', 'pineClump', [0, 8, 47, 18], 0.12, 7, { on: ['rock'] }],
    ['scatter', 'pine', [0, 8, 47, 19], 0.22, 8, { on: ['rock'] }],
    ['put', 'statue', 21, 17], ['put', 'statue', 27, 17], ['put', 'trophy', 24, 8], ['put', 'bannerPole', 22, 8], ['put', 'bannerPole', 26, 8], ['put', 'goldBrazier', 23, 12], ['put', 'goldBrazier', 25, 12], ['put', 'statue', 24, 15], ['put', 'column', 21, 13], ['put', 'column', 27, 13], ['put', 'column', 21, 9], ['put', 'column', 27, 9],
    // ---- the grid: avenues and cross streets
    ['rect', 'road', 0, 20, 47, 20], ['rect', 'road', 0, 39, 47, 39], ['rect', 'road', 0, 49, 47, 49],
    ['rect', 'road', 5, 20, 5, 59], ['rect', 'road', 42, 20, 42, 59], ['rect', 'road', 24, 49, 24, 59],
    // ---- the canal, with road bridges
    ['rect', 'sea', 0, 53, 47, 54],
    ['rect', 'road', 5, 53, 5, 54], ['rect', 'road', 23, 53, 25, 54], ['rect', 'road', 42, 53, 42, 54],
    // ---- the Dream arena's plateau: a raised stone ground with its own walls, spotlights all round
    ['blob', 'champHigh', 24, 30, 8, 5, 10, { wobble: 0.15 }],
    ['rect', 'champHigh', 22, 34, 26, 38],
    ['blob', 'plaza', 24, 31, 4, 2, 11, { on: true }],
    // the stands round the arena, trophies and banners on its terrace
    ['blob', 'marble', 24, 30, 6, 4, 9, { on: true }],
    ['put', 'bleachers', 19, 27], ['put', 'bleachers', 29, 27], ['put', 'bleachers', 20, 36], ['put', 'bleachers', 28, 36],
    ['put', 'trophy', 17, 35], ['put', 'trophy', 31, 35], ['put', 'bannerPole', 16, 28], ['put', 'bannerPole', 32, 28], ['put', 'bannerPole', 21, 24], ['put', 'bannerPole', 27, 24],
    ['put', 'bannerPole', 19, 42], ['put', 'bannerPole', 29, 42], ['put', 'trophy', 24, 49], ['put', 'bannerPole', 6, 41], ['put', 'bannerPole', 41, 41],
    // ---- the champions' court past the arena (open once Jax is beaten): the belt hall and the Gauntlet tower on marble
    ['blob', 'marble', 14, 31, 4, 3, 40, { wobble: 0.2 }], ['blob', 'stoneFloor', 14, 26, 3, 2, 43, { wobble: 0.2 }], ['blob', 'park', 9, 31, 2, 3, 41], ['put', 'fountain', 11, 34], ['put', 'bannerPole', 17, 28], ['put', 'bannerPole', 11, 28], ['put', 'lamp', 17, 34], ['put', 'lamp', 11, 30],
    // ---- Victory Plaza: Champions' Rest (your gym in the city) on its marble court, the blimp's mast on the cobbles
    ['blob', 'plaza', 24, 45, 7, 3, 12, { wobble: 0.2 }],
    // Champions' Rest: a garden yard round the gym; the blimp's airfield: tarmac, a landing circle, a windsock
    ['blob', 'park', 11, 44, 5, 3, 13, { wobble: 0.3 }], ['rect', 'cobble', 9, 46, 13, 47],
    ['blob', 'road', 37, 43, 5, 3, 14, { wobble: 0.15 }],
    ['put', 'hedge', 7, 42], ['put', 'hedge', 15, 42], ['put', 'tree', 7, 45], ['put', 'tree', 15, 45], ['put', 'flowers', 8, 47], ['put', 'flowers', 14, 47], ['put', 'fence', 6, 44], ['put', 'bushRow', 11, 41],
    ['put', 'landingPad', 37, 41], ['put', 'windsock', 41, 42], ['put', 'lamp', 33, 45], ['put', 'lamp', 41, 46], ['put', 'crate', 34, 42, 0],
    // ---- parks
    ['blob', 'park', 9, 26, 4, 3, 15], ['blob', 'park', 38, 25, 4, 3, 16], ['blob', 'park', 14, 57, 6, 2, 17], ['blob', 'park', 34, 57, 6, 2, 18],
    ['scatter', 'treeClump', [0, 21, 47, 59], 0.3, 19, { on: ['park'] }],
    ['scatter', 'tree', [0, 21, 47, 59], 0.4, 20, { on: ['park'] }],
    ['scatter', 'bushRow', [0, 21, 47, 59], 0.1, 21, { on: ['park'] }],
    // ---- the blocks of towers, dense, with neon and billboards on the avenues
    ['scatter', 'tower2', [0, 21, 47, 59], 0.22, 22, { on: ['city'], v: 3 }],
    ['scatter', 'tower1', [0, 21, 47, 59], 0.22, 23, { on: ['city'], v: 3 }],
    ['scatter', 'tower3', [0, 21, 47, 59], 0.22, 24, { on: ['city'], v: 3 }],
    ['scatter', 'neon', [0, 21, 47, 59], 0.12, 25, { on: ['city'] }],
    ['scatter', 'lamp', [0, 21, 47, 59], 0.3, 26, { on: ['road'] }],
    ['scatter', 'spotlight', [13, 23, 35, 38], 0.12, 27, { on: ['champHigh'] }],
    ['put', 'billboard', 16, 41, 0], ['put', 'billboard', 32, 41, 1], ['put', 'billboard', 3, 51, 1], ['put', 'billboard', 45, 47, 0],
    ['put', 'fountain', 20, 44], ['put', 'fountain', 28, 44], ['put', 'statue', 21, 47], ['put', 'statue', 27, 47], ['put', 'flag', 19, 42, 0], ['put', 'flag', 29, 42, 1],

    ['put', 'sailboat', 12, 54], ['put', 'sailboat', 34, 53], ['put', 'buoy', 30, 54],
  ],
  realms: [
    // after Jax: a rip in the east alley, purple nothing showing through the street
    { id: 'warpRift', rect: [37, 25, 47, 35], when: 'nightmareUnlocked', fx: 'tear', at: [42, 30], line: [[42, 26], [41, 29], [43, 31], [42, 34]],
      cover: [], full: [['blob', 'warp', 42, 30, 5, 4, 30], ['rect', 'warp', 37, 29, 41, 31], ['blob', 'rift', 44, 29, 2, 3, 31, { wobble: 0.8 }], ['scatter', 'deadTree', [38, 26, 46, 34], 0.15, 32, { on: ['warp'] }], ['scatter', 'shardDeco', [38, 26, 46, 34], 0.1, 33, { on: ['warp'] }]] },
  ],
  regions: [
    { id: 'summitRoad', name: 'THE SUMMIT ROAD', sub: 'THE MOUNTAIN OVER THE CITY', rect: [0, 0, 47, 19] },
    { id: 'dreamDistrict', name: 'THE DREAM DISTRICT', sub: 'WHERE TITLES ARE WON', rect: [0, 20, 47, 38] },
    { id: 'avenue', name: 'CHAMPIONS\' AVENUE', sub: 'THE CITY OF CHAMPIONS', rect: [0, 39, 47, 59] },
  ],
  nodes: {
    fromMain: { c: 24, r: 57, kind: 'portal', lm: 'homeRoad', name: 'THE ROAD HOME', sub: 'BACK TO THE CIRCUIT ROAD', to: 'main', at: 'toChamp', travel: 'road', back: true },
    champHome: { c: 11, r: 44, kind: 'home', lm: 'home', name: 'CHAMPIONS\' REST', sub: 'YOUR GYM IN THE CITY' },
    blimpChamp: { c: 37, r: 44, kind: 'blimp', lm: 'blimpDock', name: 'THE BLIMP', sub: 'FLY TO ANY WORLD YOU HAVE OPENED' },
    plaza: { c: 24, r: 46, kind: 'junction', name: 'VICTORY PLAZA', sub: 'THE HEART OF THE CITY' },
    dream: { c: 24, r: 32, kind: 'circuit', boss: true },
    td: { c: 14, r: 32, kind: 'mode', lm: 'tdhall', name: 'TITLE DEFENSE', sub: 'DEFEND YOUR BELTS', needs: 'unlock:zero', interior: 'td' },
    gauntlet: { c: 14, r: 27, kind: 'mode', lm: 'gauntlet', name: 'THE GAUNTLET', sub: 'ONE LOSS ENDS IT', needs: 'unlock:zero', interior: 'gauntlet' },
    toZero: { c: 39, r: 30, kind: 'portal', lm: 'warpGate', name: 'THE WARP', sub: 'WHERE THE WORLD GOES WRONG', to: 'zero', at: 'zeroOut', travel: 'warp', needs: 'nightmareUnlocked', realm: 'warpRift' },
  },
  edges: [
    { a: 'fromMain', b: 'plaza' },
    { a: 'plaza', b: 'dream', needs: 'rivalWon:rival4' },
    { a: 'plaza', b: 'champHome', via: [[18, 46], [11, 46]], needs: 'rivalWon:rival4' },
    { a: 'plaza', b: 'blimpChamp', via: [[37, 46]], needs: 'rivalWon:rival4' },
    // the alternate modes open with the first ZERO (the Classic division; the others open with their zone's last boss)
    { a: 'dream', b: 'td', via: [[19, 32]], needs: 'unlock:zero' },
    { a: 'td', b: 'gauntlet', needs: 'unlock:zero' },
    { a: 'dream', b: 'toZero', via: [[31, 32], [31, 30]], type: 'secret', needs: 'nightmareUnlocked', realm: 'warpRift' },
  ],
};
