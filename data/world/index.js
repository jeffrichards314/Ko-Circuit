// THE WORLD (spec §19 G4, G10, G11): six maps, each a world of its own, joined by journeys.
//   main        the circuit road: Hometown, the City, the Continent, the Highlands (four compact islands up a sea)
//   champ       the city of champions: Victory Plaza, the Dream arena, Title Defense, the Gauntlet; the warp
//   zero        the warped city: the Nightmare circuit, ZERO's throne, and the crossroads past it (the Sky Gate; the chasm after The Fall)
//   pantheon    the world above the clouds          underworld  the world under the chasm          void   the world past the tear
// A PORTAL (kind 'portal', or a 'gate' with `to`) is a place at a map's edge that leads to another map: `to` is the zone, `at` the place
// you arrive at there, `travel` the journey that plays on the way (src/screens/travel.js), `back` true when it is that journey reversed.
// Node ids are unique across all the maps, so a place's id says which map it is on.
import main from './main.js';
import champ from './champ.js';
import zero from './zero.js';
import pantheon from './pantheon.js';
import underworld from './underworld.js';
import voidZone from './void.js';

export const ZONES = { main, champ, zero, pantheon, underworld, void: voidZone };

// when a map can be travelled to (a condition of src/world/state.js), and the map it is reached from
export const ZONE_OPEN = { main: 'always', champ: 'rivalWon:rival4', zero: 'nightmareUnlocked', pantheon: 'skyOpen', underworld: 'fallen', void: 'voidReached' };
export const ZONE_PARENT = { main: null, champ: 'main', zero: 'champ', pantheon: 'zero', underworld: 'zero', void: 'underworld' };

// every place, with the map it is on
export const NODE_ZONE = {};
export const NODES = {};
for (const [z, Z] of Object.entries(ZONES)) for (const [id, n] of Object.entries(Z.nodes)) {
  if (NODE_ZONE[id]) throw new Error(`world: place ${id} is on two maps (${NODE_ZONE[id]}, ${z})`);
  NODE_ZONE[id] = z; NODES[id] = { id, zone: z, ...n };
}
// the portal on a map that leads to another (the first one found)
export const portalTo = (from, to) => Object.values(NODES).find((n) => n.zone === from && n.to === to) || null;
// where a map is entered from its parent: the place you arrive at and the journey
export function entryOf(zone) {
  const p = ZONE_PARENT[zone]; if (!p) return null;
  const gate = portalTo(p, zone);
  return gate ? { at: gate.at, travel: gate.travel, from: p } : null;
}
// the next map on the way from one map to another, when the way is deeper down the tree of worlds (from a map to one entered through it,
// or through that one, ...); null when the target is not further in from here (then the journey into it plays directly)
export function nextHop(from, to) {
  const chain = []; for (let z = to; z; z = ZONE_PARENT[z]) chain.push(z);
  const i = chain.indexOf(from);
  return i > 0 ? chain[i - 1] : null;
}
