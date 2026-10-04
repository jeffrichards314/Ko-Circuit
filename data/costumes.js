// Player costumes (§16), unlocked with medals (data/unlocks.js). A costume is a
// palette and a layer set over the player template: it recolours the tank top,
// trunks, gloves and shoes (and fills the costume's accent colours in palette B)
// and adds `pieces` drawn by the player layers (data/sprites/player/player.js).
// The player's own skin tone and hair always stay. Index 0 is "no costume":
// the colours picked in Customize.
//   pieces: headgear | hood | stripes | piping | patch | striped | trim | bolt | crest | belt | sheen
//           | laurel | embers | hollow   (Phase F: the Ascension's costumes)
//   outline: (optional) recolours the outline of the whole figure (the Hollow's white one)
const c = (hi, mid, dk) => [hi, mid, dk];

export const COSTUMES = [
  { id: 'none', name: 'YOUR COLORS' },
  {
    id: 'nightgym', name: 'NIGHT GYM', from: 'RIVAL FIGHT I',
    shirt: c([17, 17, 19], [11, 11, 13]), trunks: c([20, 20, 22], [14, 14, 16], [8, 8, 10]),
    glove: c([31, 16, 14], [26, 5, 6], [14, 2, 3]), shoe: c([29, 29, 29], [21, 21, 23], [11, 11, 14]),
    accent: c([31, 16, 14], [26, 5, 6], [14, 2, 3]), pieces: ['headgear'],
  },
  {
    id: 'roadwork', name: 'ROAD WORK', from: 'THE JOGGING TRAIL',
    shirt: c([9, 11, 20], [4, 5, 12]), trunks: c([9, 11, 20], [4, 6, 13], [2, 3, 7]),
    glove: c([31, 31, 31], [24, 25, 27], [14, 15, 19]), shoe: c([31, 31, 31], [24, 25, 27], [14, 15, 19]),
    accent: c([31, 31, 31], [24, 25, 27], [14, 15, 19]), pieces: ['hood', 'stripes'],
  },
  {
    id: 'contender', name: 'CONTENDER', from: 'RIVAL FIGHT II',
    shirt: c([10, 10, 13], [4, 4, 6]), trunks: c([31, 14, 12], [26, 4, 5], [15, 2, 3]),
    glove: c([31, 14, 12], [26, 4, 5], [15, 2, 3]), shoe: c([31, 31, 31], [24, 25, 27], [14, 15, 19]),
    accent: c([31, 31, 31], [24, 25, 27], [14, 15, 19]), pieces: ['piping', 'patch'],
  },
  {
    id: 'bigtop', name: 'BIG TOP', from: 'THE CARNIVAL',
    shirt: c([31, 31, 31], [26, 26, 28]), trunks: c([24, 15, 31], [15, 6, 24], [8, 3, 14]),
    glove: c([31, 29, 12], [29, 21, 3], [17, 11, 1]), shoe: c([31, 14, 12], [26, 4, 5], [15, 2, 3]),
    accent: c([31, 14, 12], [26, 4, 5], [15, 2, 3]), pieces: ['striped'],
  },
  {
    id: 'worldbeater', name: 'WORLDBEATER', from: 'RIVAL FIGHT III',
    shirt: c([10, 10, 13], [4, 4, 6]), trunks: c([24, 15, 31], [15, 6, 24], [8, 3, 14]),
    glove: c([24, 15, 31], [15, 6, 24], [8, 3, 14]), shoe: c([31, 28, 12], [26, 19, 3], [15, 10, 2]),
    accent: c([31, 28, 12], [26, 19, 3], [15, 10, 2]), pieces: ['trim', 'sheen'],
  },
  {
    id: 'stormchaser', name: 'STORM CHASER', from: 'THE STORM CIRCUIT',
    shirt: c([8, 9, 14], [3, 4, 7]), trunks: c([31, 30, 12], [29, 24, 3], [18, 13, 2]),
    glove: c([10, 11, 16], [4, 5, 8], [2, 2, 4]), shoe: c([31, 30, 12], [29, 24, 3], [18, 13, 2]),
    accent: c([31, 31, 28], [22, 26, 31], [10, 12, 20]), pieces: ['bolt'],
  },
  {
    id: 'showdown', name: 'SHOWDOWN', from: 'RIVAL FIGHT IV',
    shirt: c([10, 10, 13], [4, 4, 6]), trunks: c([31, 14, 12], [22, 3, 5], [11, 1, 2]),
    glove: c([31, 14, 12], [22, 3, 5], [11, 1, 2]), shoe: c([31, 28, 12], [26, 19, 3], [15, 10, 2]),
    accent: c([31, 28, 12], [26, 19, 3], [15, 10, 2]), pieces: ['crest', 'trim'],
  },
  {
    id: 'voidwalker', name: 'VOID WALKER', from: 'THE NIGHTMARE',
    shirt: c([10, 4, 16], [5, 2, 9]), trunks: c([17, 8, 26], [9, 3, 16], [4, 1, 8]),
    glove: c([17, 8, 26], [9, 3, 16], [4, 1, 8]), shoe: c([10, 4, 16], [5, 2, 9], [2, 1, 4]),
    accent: c([28, 22, 31], [21, 12, 31], [12, 5, 20]), pieces: ['piping', 'sheen'],
  },
  {
    id: 'undisputed', name: 'UNDISPUTED', from: 'EVERY BELT THERE IS',
    shirt: c([31, 31, 31], [26, 26, 28]), trunks: c([31, 30, 14], [28, 22, 4], [18, 12, 2]),
    glove: c([31, 30, 14], [28, 22, 4], [18, 12, 2]), shoe: c([31, 31, 31], [24, 25, 27], [14, 15, 19]),
    accent: c([31, 31, 31], [24, 25, 27], [14, 15, 19]), pieces: ['belt', 'trim'],
  },
  // The Ascension's costumes (Phase F, spec A2), opened by Ascension medals (data/unlocks.js, track 'asc'):
  // Pantheon gold and white, Underworld ash and ember, and the Void's black with a white outline.
  {
    id: 'ascendant', name: 'ASCENDANT', from: 'THE PANTHEON',
    shirt: c([31, 31, 31], [27, 27, 29]), trunks: c([31, 31, 31], [27, 27, 30], [16, 17, 22]),
    glove: c([31, 30, 14], [28, 22, 4], [18, 12, 2]), shoe: c([31, 30, 14], [28, 22, 4], [18, 12, 2]),
    accent: c([31, 30, 14], [28, 22, 4], [18, 12, 2]), pieces: ['trim', 'sheen', 'laurel'],
  },
  {
    id: 'sunborn', name: 'SUNBORN', from: 'HALCYON\'S SUMMIT',
    shirt: c([31, 30, 14], [28, 22, 4]), trunks: c([31, 30, 14], [29, 24, 5], [18, 12, 2]),
    glove: c([31, 31, 31], [27, 27, 30], [16, 17, 22]), shoe: c([31, 31, 31], [27, 27, 30], [16, 17, 22]),
    accent: c([31, 31, 31], [27, 27, 30], [16, 17, 22]), pieces: ['crest', 'trim', 'laurel'],
  },
  {
    id: 'ashen', name: 'ASHEN', from: 'THE UNDERWORLD',
    shirt: c([14, 14, 15], [8, 8, 9]), trunks: c([17, 17, 18], [10, 10, 11], [5, 5, 6]),
    glove: c([12, 12, 13], [7, 7, 8], [3, 3, 4]), shoe: c([10, 10, 11], [5, 5, 6], [2, 2, 3]),
    accent: c([22, 22, 23], [15, 15, 16], [8, 8, 9]), pieces: ['piping', 'patch'],
  },
  {
    id: 'emberforged', name: 'EMBERFORGED', from: 'VORGATH\'S FURNACE',
    shirt: c([12, 9, 8], [6, 4, 4]), trunks: c([31, 20, 6], [27, 11, 2], [15, 4, 1]),
    glove: c([12, 9, 8], [6, 4, 4], [3, 2, 2]), shoe: c([31, 20, 6], [27, 11, 2], [15, 4, 1]),
    accent: c([31, 26, 10], [30, 18, 4], [20, 7, 1]), pieces: ['embers', 'piping'],
  },
  {
    id: 'hollow', name: 'THE HOLLOW', from: 'THE VOID',
    outline: [31, 31, 31],
    shirt: c([3, 3, 4], [1, 1, 2]), trunks: c([4, 4, 5], [2, 2, 3], [1, 1, 1]),
    glove: c([3, 3, 4], [1, 1, 2], [0, 0, 1]), shoe: c([3, 3, 4], [1, 1, 2], [0, 0, 1]),
    accent: c([31, 31, 31], [24, 25, 27], [14, 15, 19]), pieces: ['hollow'],
  },
];
