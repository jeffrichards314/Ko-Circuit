// THE PANTHEON (spec §18, §19 G11): the world above the clouds, reached by the climb from the Sky Gate. Not an island: the ground is cloud
// all the way to the horizon, with terraces of marble and temple floors of gold standing on it, gaps where the sky shows far below, and
// marble stairs zig-zagging up from the Gate of Dawn to Halcyon's throne. Light falls in beams, spirits drift up, clouds roll across.
export default {
  id: 'pantheon', name: 'THE PANTHEON', cols: 40, rows: 72,
  song: 'pantheonMap', ambient: 'pantheon', fogSky: 'gold',
  base: [
    ['fill', 'cloud'],
    // the sky showing through the cloud floor
    ['blob', 'cloudsea', 4, 60, 3, 4, 1, { wobble: 0.8 }], ['blob', 'cloudsea', 35, 50, 3, 5, 2, { wobble: 0.8 }], ['blob', 'cloudsea', 5, 40, 3, 4, 3, { wobble: 0.8 }],
    ['blob', 'cloudsea', 35, 30, 3, 4, 4, { wobble: 0.8 }], ['blob', 'cloudsea', 4, 18, 3, 4, 5, { wobble: 0.8 }], ['blob', 'cloudsea', 35, 8, 4, 4, 6, { wobble: 0.8 }], ['blob', 'cloudsea', 20, 70, 6, 2, 7, { wobble: 0.8 }],
    // terraces: a marble ground under each hall, a floor of gold for the high ones
    ['blob', 'marble', 14, 62, 4, 2, 10, { wobble: 0.2 }], ['blob', 'marble', 26, 56, 4, 2, 11, { wobble: 0.2 }], ['blob', 'marble', 14, 50, 4, 2, 12, { wobble: 0.2 }],
    ['blob', 'marble', 26, 42, 4, 2, 13, { wobble: 0.2 }], ['blob', 'marble', 14, 36, 4, 2, 14, { wobble: 0.2 }], ['blob', 'marble', 26, 30, 4, 2, 15, { wobble: 0.2 }],
    ['blob', 'marble', 14, 22, 4, 2, 16, { wobble: 0.2 }],
    ['blob', 'marble', 20, 11, 9, 5, 17, { wobble: 0.2 }], ['blob', 'gold', 20, 11, 5, 3, 18, { wobble: 0.2 }],
    ['blob', 'gold', 26, 42, 2, 1, 19], ['blob', 'gold', 26, 30, 2, 1, 20], ['blob', 'gold', 14, 22, 2, 1, 21],
    ['rect', 'marble', 18, 65, 22, 71], ['rect', 'marble', 22, 66, 29, 70],
    // statues and columns along the way, temples and braziers on the terraces, puffs of cloud on the floor
    ['put', 'column', 17, 66], ['put', 'column', 23, 66], ['put', 'column', 17, 69], ['put', 'column', 23, 69],
    // the walkways: marble along each stair, the halls joined into one climbing terrace
    ['rect', 'marble', 13, 57, 27, 59], ['rect', 'marble', 13, 51, 27, 53], ['rect', 'marble', 13, 45, 27, 47], ['rect', 'marble', 13, 37, 27, 39],
    ['rect', 'marble', 13, 31, 27, 33], ['rect', 'marble', 13, 25, 27, 27], ['rect', 'marble', 13, 15, 21, 17],
    ['rect', 'marble', 13, 59, 15, 65], ['rect', 'marble', 25, 53, 27, 59], ['rect', 'marble', 13, 47, 15, 53], ['rect', 'marble', 25, 39, 27, 47],
    ['rect', 'marble', 13, 33, 15, 39], ['rect', 'marble', 25, 27, 27, 33], ['rect', 'marble', 13, 17, 15, 27], ['rect', 'marble', 15, 63, 21, 65],
    ['scatter', 'cloudPuff', [0, 0, 39, 71], 0.06, 30, { on: ['cloud'] }],
    ['scatter', 'statue', [0, 0, 39, 71], 0.06, 31, { on: ['marble'] }],
    ['scatter', 'column', [0, 0, 39, 71], 0.1, 32, { on: ['marble'] }],
    ['scatter', 'goldBrazier', [0, 0, 39, 71], 0.06, 34, { on: ['marble', 'gold'] }],
    ['scatter', 'brokenColumn', [0, 0, 39, 71], 0.012, 35, { on: ['cloud'] }],
    // the cloud country either side of the climb: banks of cloud, temples, rainbows, the old statues
    ['scatter', 'cloudBank', [0, 0, 39, 71], 0.05, 36, { on: ['cloud'] }],
    ['scatter', 'temple', [0, 0, 11, 71], 0.012, 37, { on: ['cloud'] }], ['scatter', 'temple', [29, 0, 39, 71], 0.012, 38, { on: ['cloud'] }],
    ['scatter', 'statue', [0, 0, 39, 71], 0.015, 39, { on: ['cloud'] }],
    ['put', 'rainbow', 7, 57], ['put', 'rainbow', 33, 45], ['put', 'rainbow', 6, 24], ['put', 'rainbow', 34, 14],
    ['blob', 'marble', 6, 66, 3, 2, 40, { wobble: 0.2 }], ['blob', 'marble', 33, 62, 3, 2, 41, { wobble: 0.2 }], ['blob', 'marble', 6, 46, 3, 2, 42, { wobble: 0.2 }],
    ['blob', 'marble', 33, 38, 3, 2, 43, { wobble: 0.2 }], ['blob', 'marble', 6, 28, 3, 2, 44, { wobble: 0.2 }], ['blob', 'marble', 33, 20, 3, 2, 45, { wobble: 0.2 }], ['blob', 'marble', 8, 8, 3, 2, 46, { wobble: 0.2 }],
    ['put', 'temple', 6, 66], ['put', 'temple', 33, 62], ['put', 'temple', 6, 46], ['put', 'temple', 33, 38], ['put', 'temple', 6, 28], ['put', 'temple', 33, 20], ['put', 'temple', 8, 8],
    ['put', 'goldBrazier', 3, 66], ['put', 'goldBrazier', 9, 66], ['put', 'goldBrazier', 30, 62], ['put', 'goldBrazier', 36, 62], ['put', 'goldBrazier', 3, 46], ['put', 'goldBrazier', 9, 46],
    ['put', 'statue', 31, 54], ['put', 'statue', 9, 52], ['put', 'statue', 31, 34], ['put', 'statue', 9, 32], ['put', 'goldBrazier', 15, 11], ['put', 'goldBrazier', 25, 11],
  ],
  realms: [],
  regions: [
    { id: 'dawn', name: 'THE GATE OF DAWN', sub: 'THE FIRST STEPS OF THE SKY', rect: [0, 53, 39, 71] },
    { id: 'heroes', name: 'THE HALL OF HEROES', sub: 'THE CLOUD TERRACES', rect: [0, 40, 39, 52] },
    { id: 'starfield', name: 'THE STARFIELD', sub: 'THE FORGE OF THUNDER', rect: [0, 28, 39, 39] },
    { id: 'sanctum', name: 'THE MIRROR SANCTUM', sub: 'THE LAST STAIRS', rect: [0, 17, 39, 27] },
    { id: 'throne', name: 'THE THRONE OF HALCYON', sub: 'THE TOP OF EVERYTHING', rect: [0, 0, 39, 16] },
  ],
  nodes: {
    skyStairs: { c: 20, r: 68, kind: 'portal', lm: 'cloudStair', name: 'THE STAIRS DOWN', sub: 'BACK DOWN TO THE CROSSROADS', to: 'zero', at: 'skygate', travel: 'climb', back: true },
    blimpPan: { c: 26, r: 68, kind: 'blimp', lm: 'blimpDock', name: 'THE BLIMP', sub: 'FLY TO ANY WORLD YOU HAVE OPENED' },
    p1: { c: 15, r: 62, kind: 'circuit' }, p2: { c: 25, r: 56, kind: 'circuit' }, p3: { c: 15, r: 50, kind: 'circuit' }, rival5: { c: 20, r: 46, kind: 'rival' },
    p4: { c: 25, r: 42, kind: 'circuit' }, p5: { c: 15, r: 36, kind: 'circuit' }, p6: { c: 25, r: 30, kind: 'circuit' }, rival6: { c: 20, r: 26, kind: 'rival' },
    p7: { c: 15, r: 22, kind: 'circuit' }, halcyon: { c: 20, r: 12, kind: 'circuit', boss: true },
  },
  edges: [
    { a: 'skyStairs', b: 'blimpPan', type: 'stairs' },
    { a: 'skyStairs', b: 'p1', via: [[20, 64], [15, 64]], type: 'stairs' },
    { a: 'p1', b: 'p2', via: [[15, 58], [25, 58]], type: 'stairs' },
    { a: 'p2', b: 'p3', via: [[25, 52], [15, 52]], type: 'stairs' },
    { a: 'p3', b: 'rival5', via: [[15, 46]], type: 'stairs' },
    { a: 'rival5', b: 'p4', via: [[25, 46]], type: 'stairs' },
    { a: 'p4', b: 'p5', via: [[25, 38], [15, 38]], type: 'stairs' },
    { a: 'p5', b: 'p6', via: [[15, 32], [25, 32]], type: 'stairs' },
    { a: 'p6', b: 'rival6', via: [[25, 26]], type: 'stairs' },
    { a: 'rival6', b: 'p7', via: [[15, 26]], type: 'stairs' },
    { a: 'p7', b: 'halcyon', via: [[15, 16], [20, 16]], type: 'stairs' },
  ],
  // the clouds over what is ahead, by the Ascension circuit reached (c.asc 0 = Pantheon I ... 7 = Halcyon)
  fog: { by: 'asc', from: 0, rows: [58, 52, 47, 40, 34, 28, 19, 0] },
};
