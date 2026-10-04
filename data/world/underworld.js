// THE UNDERWORLD (spec §18, §19 G11): the world under the chasm, reached by The Fall. Not an island: solid rock all round, and the way
// down is a chain of caverns carved out of it. From the landing under the chasm the ferry crosses the Styx to the Ferryman's Shore, then
// the caverns go down past fields of ash, pits of chains, halls of the fallen and the Furnace's lava to the Abyss Gate and Vorgath's
// pit, with the door to the Void at the very bottom. Embers rise, lava flows, chains hang, the ferry plies the Styx.
export default {
  id: 'underworld', name: 'THE UNDERWORLD', cols: 44, rows: 72,
  song: 'underworldMap', ambient: 'underworld', fogSky: 'smoke', fogDir: 'down',
  base: [
    ['fill', 'cavewall'],
    // ---- the landing under the chasm, the Styx, the far shore
    ['blob', 'ash', 22, 4, 8, 3, 1], ['rect', 'ash', 24, 3, 31, 6], ['rect', 'ash', 20, 5, 24, 9],
    ['rect', 'styx', 0, 10, 43, 13], ['blob', 'styx', 10, 11, 8, 3, 2], ['blob', 'styx', 34, 12, 8, 3, 3],
    ['blob', 'ash', 25, 17, 9, 3, 4],
    // ---- the caverns, one carved round each hall and along each way
    ['blob', 'ash', 30, 24, 5, 3, 5], ['rect', 'ash', 29, 17, 31, 24],
    ['rect', 'ash', 19, 26, 31, 28], ['blob', 'ash', 20, 30, 5, 3, 6],
    ['rect', 'ash', 13, 32, 21, 34], ['blob', 'ash', 14, 35, 4, 3, 7],
    ['rect', 'ash', 13, 38, 26, 40], ['blob', 'ash', 25, 41, 6, 3, 8],
    ['rect', 'ash', 15, 44, 26, 46], ['blob', 'basalt', 16, 48, 6, 3, 9], ['blob', 'ash', 16, 48, 3, 2, 10],
    ['rect', 'ash', 15, 51, 26, 53], ['blob', 'ash', 25, 55, 5, 3, 11],
    ['rect', 'ash', 17, 57, 26, 61], ['blob', 'ash', 18, 60, 4, 2, 12],
    ['rect', 'ash', 12, 59, 18, 61], ['blob', 'basalt', 13, 66, 6, 4, 13], ['blob', 'ash', 13, 66, 3, 2, 14],
    ['rect', 'ash', 12, 68, 25, 70], ['blob', 'ash', 24, 67, 3, 2, 15],
    // ---- side caverns: the lava of the Furnace, the pits of chains, the fields of ash
    ['blob', 'ash', 38, 26, 5, 6, 16], ['blob', 'lavaflow', 39, 27, 2, 5, 17, { wobble: 0.5 }],
    ['blob', 'ash', 6, 30, 5, 6, 18], ['blob', 'pit', 6, 30, 2, 3, 19],
    ['blob', 'ash', 36, 48, 6, 8, 20], ['rect', 'lavaflow', 35, 40, 36, 62], ['blob', 'lavaflow', 36, 50, 3, 3, 21],
    ['blob', 'ash', 6, 50, 5, 6, 22], ['blob', 'lavaflow', 6, 51, 2, 3, 23],
    ['blob', 'basalt', 30, 64, 5, 4, 24], ['blob', 'pit', 32, 65, 2, 2, 25],
    ['blob', 'ash', 5, 66, 4, 4, 26], ['blob', 'pit', 5, 67, 2, 2, 27],
    ['rect', 'ash', 27, 44, 34, 46],
    // ---- what stands in them
    ['scatter', 'stalagmite', [0, 0, 43, 71], 0.08, 30, { on: ['ash', 'basalt'] }],
    ['scatter', 'bones', [0, 0, 43, 71], 0.05, 31, { on: ['ash'] }],
    ['scatter', 'brazier', [0, 0, 43, 71], 0.05, 32, { on: ['ash', 'basalt'] }],
    ['scatter', 'chain', [0, 0, 43, 71], 0.05, 33, { on: ['ash', 'basalt'] }],
    ['scatter', 'skullPile', [0, 0, 43, 71], 0.03, 34, { on: ['ash'] }],
    ['scatter', 'cage', [0, 0, 43, 71], 0.02, 35, { on: ['ash', 'basalt'] }],
    ['scatter', 'deadTree', [0, 14, 43, 30], 0.06, 36, { on: ['ash'] }],
    ['scatter', 'stalagmite', [0, 0, 43, 71], 0.03, 37, { on: ['cavewall'] }],
    ['put', 'boneArch', 22, 6], ['put', 'boneArch', 13, 64], ['put', 'cage', 8, 28], ['put', 'cage', 4, 32], ['put', 'chain', 6, 27], ['put', 'chain', 30, 63],
    ['put', 'brazier', 19, 3], ['put', 'brazier', 25, 3], ['put', 'skullPile', 34, 46], ['put', 'goldBrazier', 21, 66],
  ],
  realms: [],
  regions: [
    { id: 'styx', name: 'THE STYX', sub: 'THE RIVER UNDER THE WORLD', rect: [0, 0, 43, 15] },
    { id: 'ashenDeep', name: 'THE ASHEN DEEP', sub: 'FIELDS OF ASH, PITS OF CHAINS', rect: [0, 16, 43, 37] },
    { id: 'forge', name: 'THE FORGE PITS', sub: 'THE FALLEN AND THE FURNACE', rect: [0, 38, 43, 53] },
    { id: 'abyss', name: 'THE ABYSS', sub: 'THE BOTTOM OF EVERYTHING', rect: [0, 54, 43, 71] },
  ],
  nodes: {
    chasmTop: { c: 22, r: 3, kind: 'portal', lm: 'ropeLedge', name: 'THE CHASM', sub: 'THE WAY BACK UP TO THE CROSSROADS', to: 'zero', at: 'chasm', travel: 'fall', back: true },
    blimpUnder: { c: 29, r: 4, kind: 'blimp', lm: 'blimpDock', name: 'THE BLIMP', sub: 'FLY TO ANY WORLD YOU HAVE OPENED' },
    styxDock: { c: 22, r: 8, kind: 'junction', name: 'THE FERRY', sub: 'ACROSS THE STYX' },
    u1: { c: 22, r: 17, kind: 'circuit' }, u2: { c: 30, r: 24, kind: 'circuit' }, u3: { c: 20, r: 30, kind: 'circuit' }, rival7: { c: 14, r: 35, kind: 'rival' },
    u4: { c: 25, r: 41, kind: 'circuit' }, u5: { c: 16, r: 48, kind: 'circuit' }, u6: { c: 25, r: 55, kind: 'circuit' }, rival8: { c: 18, r: 60, kind: 'rival' },
    vorgath: { c: 13, r: 66, kind: 'circuit', boss: true },
    voiddoor: { c: 24, r: 67, kind: 'gate', lm: 'voiddoor', name: 'THE DOOR BELOW', sub: 'THE TEAR IN THE WORLD', to: 'void', at: 'tearOut', travel: 'tear', needs: 'voidReached' },
  },
  edges: [
    { a: 'chasmTop', b: 'styxDock', type: 'ledge' },
    { a: 'chasmTop', b: 'blimpUnder', type: 'ledge' },
    { a: 'styxDock', b: 'u1', type: 'boat' },
    { a: 'u1', b: 'u2', via: [[30, 17]], type: 'ledge' },
    { a: 'u2', b: 'u3', via: [[30, 27], [20, 27]], type: 'ledge' },
    { a: 'u3', b: 'rival7', via: [[20, 33], [14, 33]], type: 'ledge' },
    { a: 'rival7', b: 'u4', via: [[14, 39], [25, 39]], type: 'ledge' },
    { a: 'u4', b: 'u5', via: [[25, 45], [16, 45]], type: 'ledge' },
    { a: 'u5', b: 'u6', via: [[16, 52], [25, 52]], type: 'ledge' },
    { a: 'u6', b: 'rival8', via: [[25, 60]], type: 'ledge' },
    { a: 'rival8', b: 'vorgath', via: [[13, 60]], type: 'ledge' },
    { a: 'vorgath', b: 'voiddoor', via: [[13, 69], [24, 69]], type: 'ledge', needs: 'voidReached' },
  ],
  // the dark below what is ahead, by the Ascension circuit reached (c.asc 8 = Underworld I ... 14 = Vorgath); it covers everything BELOW the row
  fog: { by: 'asc', from: 8, dir: 'down', rows: [21, 27, 33, 44, 51, 58, 72] },
};
