// How the road to and up to each circuit looks in the cutscenes (spec §19 G11), matching where it stands on the world map:
// the verge of the road (grass, rock, desert, pavement, purple stone), what stands along it (trees, palms, pines, towers, dead trees),
// and for the Pantheon a marble terrace over the clouds. The arrival scenes and the jogging scenes both read it.
export const LOOKS = {
  // Hometown
  rookie: { verge: 'grass', mid: 'trees' }, minor: { verge: 'grass', mid: 'trees' },
  // the City (and the Carnival's pier off it)
  metro: { verge: 'city', mid: 'city' }, major: { verge: 'city', mid: 'city' }, carnival: { verge: 'sand', mid: 'palms' },
  // the Continent
  continental: { verge: 'grass', mid: 'palms' }, world: { verge: 'grass', mid: 'palms' }, storm: { verge: 'dark', mid: 'dead' },
  // the Highlands
  legends: { verge: 'rock', mid: 'pines', far: [16, 16, 22], near: [10, 10, 14] }, grandprix: { verge: 'desert', mid: 'none', far: [20, 10, 6], near: [15, 8, 5] },
  underground: { verge: 'rock', mid: 'pines', far: [6, 6, 9], near: [4, 4, 6], pineColor: [3, 6, 5] },
  // the City of Champions, ZERO's world
  dream: { verge: 'city', mid: 'city' }, nightmare: { verge: 'warp', mid: 'dead', far: [12, 2, 15], near: [6, 1, 10] }, zero: { verge: 'warp', mid: 'dead', far: [12, 2, 15], near: [6, 1, 10] },
};
for (const id of ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'halcyon']) LOOKS[id] = { env: 'sky' };

// the layer standing along the road for a look
export function midLayer(look, base = 132, par = 0.5) {
  const m = look && look.mid;
  if (m === 'city') return { p: 'city', color: [8, 8, 15], lite: [29, 25, 12], par, base, minH: 20, maxH: 54, cell: 37 };
  if (m === 'pines') return { p: 'trees', pine: true, color: look.pineColor || [4, 10, 8], hi: [7, 15, 10], par, base, every: 30 };
  if (m === 'palms') return { p: 'trees', palm: true, color: [5, 14, 7], hi: [9, 20, 9], par, base, every: 52 };
  if (m === 'dead') return { p: 'trees', dead: true, color: [4, 3, 4], par, base, every: 41 };
  if (m === 'none') return null;
  return { p: 'trees', color: [4, 10, 8], hi: [7, 15, 10], par, base, every: 41 };
}
