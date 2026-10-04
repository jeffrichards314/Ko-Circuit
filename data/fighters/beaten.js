// How each fighter is left on his podium once you've beaten him (spec §19 G4): one of the shared beaten poses (data/sprites/builds/poses.js,
// `beat<Name>1` / `beat<Name>2`, the second a breath), picked to suit him, and never the same twice in one hall (tools/map-audit.mjs checks).
//   Kneel        down on one knee            KneelBoth   on both knees, head down     Sit       sat down hard, dazed
//   Slump        bent over, winded           Hang        head hung, arms dangling     Jaw       rubbing his jaw
//   Shrug        a good sport's shrug        Wave        waving, no hard feelings     Surrender both hands up
//   Ribs         clutching his body          Head        holding his head             Bow       a respectful bow
//   Crossed      arms crossed, sore          Point       pointing at you: next time   Dizzy     swaying on his feet
//   Shake        shaking a fist              Out         flat out on his back
// (ZERO keeps his own: coming undone.)
export const BEATEN = {
  // the circuit road
  barney: 'Shrug', kid: 'Sit', mort: 'Jaw', gus: 'Ribs',
  rocco: 'Kneel', gambini: 'Bow', knox: 'Head', brody: 'Crossed',
  ray: 'Hang', pidge: 'Dizzy', sam: 'Wave', mcbride: 'Crossed',
  djdrop: 'Point', anchor: 'Sit', gemini: 'Dizzy', midnight: 'Bow',
  strongman: 'Kneel', pockets: 'Out', tess: 'Wave', jinx: 'Dizzy', rex: 'Bow',
  rusty: 'Hang', tia: 'Shrug', sutures: 'Ribs', baron: 'Jaw',
  lars: 'Out', hank: 'Kneel', glacier: 'Crossed', maestro: 'Bow',
  bolt: 'Dizzy', downpour: 'Slump', cole: 'Sit', avalanche: 'Out',
  rourke: 'Wave', ignatius: 'Kneel', duchess: 'Bow', mirror: 'Point',
  nova: 'Dizzy', goliath: 'Out', quinn: 'Shake', monk: 'KneelBoth', karver: 'Hang',
  static: 'Head', cade: 'Shake', null: 'Hang', warden: 'Crossed',
  jax: 'Kneel',
  hollow: 'Hang', revenant: 'KneelBoth', frenzy: 'Dizzy', eclipse: 'Head',
  zero: 'undone',
  // Dash, each time a little differently
  dash1: 'Shake', dash2: 'Jaw', dash3: 'Kneel', dash4: 'Point', dash5: 'KneelBoth', dash6: 'Head', dash7: 'Hang', dash8: 'Bow', dash9: 'Sit',
  // the Pantheon
  oro: 'Kneel', lark: 'Wave', ember: 'Sit', aurora: 'Bow',
  zephyr: 'Dizzy', nimbus: 'Slump', ulla: 'Shrug', cirrus: 'Crossed',
  tom: 'Jaw', jules: 'Bow', reuben: 'Out', simone: 'Wave', oldguard: 'KneelBoth',
  polaris: 'Point', kira: 'Sit', orbit: 'Dizzy', nebula: 'Hang',
  anvil: 'Kneel', spark: 'Head', bellows: 'Slump', hale: 'Crossed',
  reflection: 'Shake', glass: 'KneelBoth', doubt: 'Head', prism: 'Dizzy',
  aldric: 'Bow', valkyr: 'Kneel', scribe: 'Shrug', verity: 'Crossed', rho: 'Hang', barney2: 'Sit',
  halcyon: 'KneelBoth',
  // the Underworld
  grue: 'Slump', mae: 'Hang', toll: 'Shrug', moros: 'Head',
  cinder: 'KneelBoth', scorch: 'Shake', kiln: 'Out', soot: 'Bow',
  shackle: 'Hang', link: 'Dizzy', brisk: 'Surrender', rattle: 'Out', jailer: 'Crossed',
  fbrody: 'Kneel', fmidnight: 'Bow', fvale: 'Slump', fkarver: 'KneelBoth',
  stoker: 'Ribs', brand: 'Shake', slag: 'Out', crucible: 'Kneel',
  nox: 'Crossed', umbra: 'Dizzy', lament: 'KneelBoth', grasp: 'Surrender', herald: 'Bow',
  vorgath: 'Kneel',
  // the Void
  dodgeShard: 'Dizzy', blockShard: 'Crossed', duckShard: 'Sit', counterShard: 'Point',
  sightShard: 'Head', soundShard: 'Jaw', rhythmShard: 'Slump', memoryShard: 'Shrug',
  echoShard: 'Shake', chaosShard: 'Out', timeShard: 'Hang', willShard: 'KneelBoth',
  zeroTrue: 'Surrender',
};
// the pose for a beaten fighter at a moment (two frames, a slow breath)
export function beatenPose(id, t) {
  const b = BEATEN[id];
  if (!b) return null;
  return `${b === 'undone' ? 'undone' : 'beat' + b}${(t >> 5) & 1 ? 2 : 1}`;
}
