// The Title Defense exclusive attacks (spec §6): every opponent of every division gets ONE more super that exists only in Title Defense (and
// so in the Combined division too). It is added to his arsenal; nothing he already has is replaced. Each is written here as a function of the
// fighter (his tuned data), joined to his `titleDefense.exclusive` (data/fighters/index.js) and built by remixed() in data/fighters/titleDefense.js.
//
// What every one of them is (the super rules of spec §4, plus what makes it his):
//   - a SUPER: thrown from the same sequence as his others (he steps back, taunts, steps in), and it takes the first turn: it is the first
//     super you meet in every fight, then it alternates with his other one. ARMORED from the step back to the end of its last attack
//     (your punches clank); ONE golden moment, always at the same point in the attack, an instant knockdown (his health to zero, the count
//     starts); a subtle tell (a small glint by his head and a soft sound, never a prompt). The window is as wide as his other golden moments.
//   - HARDER than anything else he throws (tools/difficulty-score.js `attackHardness`): more hits, more different defenses in it, tighter
//     rhythm and a one-hit knockdown at the end, and its golden moment at the very end of it.
//   - BUILT FROM HIS GIMMICK: its blows are his own blows (his poses, his sounds, retimed), in an order and a rhythm that is the gimmick turned
//     on you. Where his gimmick has a call of its own (the lights, the spotlight, the whistle, the rewind) the attack starts with that call.
//   - FAIR: every hit of it has a visible tell and a defense that works, in a fixed order that is the same every time (learnable); perfect
//     defense gets through it untouched (tools/perfect-play.mjs --td). The golden moment is never needed.
//   - Between rounds the cornerman hints at it (data/hints/exclusive.js) and the scouting report lists its golden moment (`s:<key>`).
//
// A spec is a function of the helpers `h`:
//   ({ d, hit, fin, call }) => ({
//      name: 'THE DAILY SPECIAL',                 what the scouting report calls it
//      shout, sfx, taunt: 50,                      his shout / sound and how long he taunts before it
//      steps: [ hit('orderUp1', 'APPETIZER', { rec: 10 }), ..., fin('spatulaFlip', 'CHECK, PLEASE!') ],
//      gold: { on: 4, hit: 'body' },               the golden moment: on blow 4 (default: the last), the punch it needs
//             + at: frames (windup: where the window starts, default 55% of the tell), kind: 'windup' (default) | 'recovery' | 'taunt' | 'advance',
//               after: 'dodged' | 'ducked' | 'any' and dir: 'L' | 'R' (a recovery golden: how you must have defended it),
//   })
//   hit(src, name, o)   a blow made from his move `src`: same poses, sounds and defense, retimed. o: `x` (windup x the original's), `w` (windup in
//                       frames), `rec` (recovery frames: the gap before the next blow), `dmg` (damage), `avoid` (the defenses that work), `sfx`.
//   fin(src, name, o)   the last blow: one-hit knockdown, as `hit` but with a long recovery, full damage and no fakes.
//   call(src)           one of his own calls (a feint with no punch: the lights, the whistle) thrown as the attack's first move, so what the call
//                       does to the fight (the dark, the glare) does it here too.
export const call = (src) => ({ call: true, src });
export const hit = (src, name, o = {}) => ({ src, name, ...o });
export const fin = (src, name, o = {}) => ({ src, name, fin: true, ...o });

const DEF = { hit: { rec: 10 }, fin: { rec: 46, dmg: 30 } };

// Turn a spec into what the remix builder wants: { moves, super } (moves keyed x1..xn, authored in his own tuned frames; the golden
// frames are placed here, their width comes later from his own difficulty).
export function buildExclusive(d, spec) {
  const moves = {}, ids = [];
  let n = 0;
  for (const s of spec.steps) {
    const src = d.moves[s.src];
    if (!src) throw new Error(`exclusive of ${d.id}: no move ${s.src}`);
    if (s.call) { ids.push(s.src); continue; } // (his own call: kept as it is)
    const id = `x${++n}`;
    ids.push(id);
    const { kdWindow, recoveryKd, super: sup, noFake, goldenHit, goldenAfter, goldenDir, goldenFlag, glow, ...base } = src;
    void kdWindow; void recoveryKd; void sup; void noFake; void goldenHit; void goldenAfter; void goldenDir; void goldenFlag; void glow; // (no afterglow trails: an echo landing between two forced blows would be a blow nobody could defend)
    const D = s.fin ? DEF.fin : DEF.hit;
    const W = Math.max(3, Math.round(s.w ?? src.windupFrames * (s.x ?? 1)));
    const k = W / Math.max(1, src.windupFrames);
    const m = { ...base, name: s.name, windupFrames: W, recoveryFrames: s.rec ?? D.rec, counterWindow: null, starWindow: null, punishStar: undefined, ...(s.dmg !== undefined || s.fin ? { damage: s.dmg ?? D.dmg } : {}) };
    if (s.avoid) m.avoidBy = s.avoid;
    if (s.sfx) m.sfx = { ...(base.sfx || {}), ...s.sfx };
    if (s.fin) { m.knockdown = true; m.noFake = true; } else { delete m.knockdown; delete m.noFake; } // (only the last blow is a one-hit knockdown)
    for (const key of ['quiet', 'cueFrame']) if (typeof m[key] === 'number') m[key] = Math.round(m[key] * k);
    for (const key of Object.keys(m)) if (m[key] === undefined) delete m[key];
    moves[id] = m;
  }
  const G = spec.gold || {}, kind = G.kind || 'windup', on = G.on ?? spec.steps.length, gid = kind === 'taunt' || kind === 'advance' ? ids[0] : ids[on - 1];
  const gm = moves[gid];
  if (!gm && kind !== 'taunt' && kind !== 'advance') throw new Error(`exclusive of ${d.id}: the golden moment must be on one of his new blows`);
  if (kind === 'windup') { const a = G.at ?? Math.max(2, Math.round(gm.windupFrames * 0.55)); gm.kdWindow = [a, a]; }
  let recAt = null;
  if (kind === 'recovery') { recAt = G.at ?? 8; gm.recoveryKd = [recAt, recAt]; }
  const first = ids[0];
  const superDef = {
    move: first, then: ids.slice(1), golden: kind, on: kind === 'taunt' || kind === 'advance' || gid === first ? undefined : gid, hit: G.hit, key: spec.key || `td_${d.id}`, name: spec.name,
    taunt: spec.taunt ?? 50, shout: spec.shout, sfx: spec.sfx, ...(G.after ? { after: G.after } : {}), ...(G.dir ? { dir: G.dir } : {}),
    ...(kind === 'taunt' || kind === 'advance' ? { window: G.at || (kind === 'taunt' ? [18, 18] : [4, 4]) } : {}),
    ...(kind === 'recovery' ? { window: [recAt, recAt] } : {}),
  };
  for (const key of Object.keys(superDef)) if (superDef[key] === undefined) delete superDef[key];
  return { moves, super: superDef };
}

export const helpers = (d) => ({ d, hit, fin, call });

export default {
  // ================================================================ CLASSIC
  // -- #4 Gus Grill: he eats to heal; here he serves four courses and the check is a knockout
  gus: ({ hit, fin }) => ({
    name: 'THE DAILY SPECIAL', sfx: 'sizzle', taunt: 50,
    steps: [
      hit('orderUp1', 'APPETIZER', { rec: 12 }),
      hit('grillPress', 'SOUP OF THE DAY', { rec: 14 }),
      hit('orderUp1', 'MAIN COURSE', { rec: 14, avoid: ['dodgeL', 'duck'] }),
      fin('spatulaFlip', 'CHECK, PLEASE!'),
    ],
    gold: { on: 4, hit: 'body' },
  }),

  // -- #8 Brick Wall Brody: only a counter opens the wall, so the wall comes down on you, brick by brick (two of the blows can only be blocked)
  brody: ({ hit, fin }) => ({
    name: 'CONDEMNED', sfx: 'creak', taunt: 56,
    steps: [
      hit('foundation', 'LAY THE FOUNDATION', { rec: 12 }),
      hit('wreckingBall', 'WRECKING BALL', { rec: 12 }),
      hit('foundation', 'LOAD-BEARING WALL', { rec: 12 }),
      hit('brickLayer1', 'BRICK BY BRICK', { rec: 8 }),
      hit('mortarJab', 'MORTAR', { rec: 10 }),
      fin('cementMixer', 'DEMOLITION!'),
    ],
    gold: { hit: 'head' },
  }),

  // -- #12 Mayor McBride: he waves to the crowd. The golden moment is the wave itself (the crowd boos the man who is hit while he waves)
  mcbride: ({ hit, fin }) => ({
    name: 'THE FILIBUSTER', sfx: 'fanfare', taunt: 60,
    steps: [
      hit('fil1', 'POINT OF ORDER', { rec: 6 }),
      hit('fil2', 'POINT OF INFORMATION', { rec: 6 }),
      hit('fil3', 'POINT OF PRIVILEGE', { rec: 8 }),
      hit('fil4', 'MOTION TO TABLE', { rec: 12 }),
      hit('ribbon', 'RIBBON CUTTING', { rec: 12 }),
      hit('taxHike', 'TAX HIKE', { rec: 12 }),
      fin('landslide', 'LANDSLIDE OF THE CENTURY'),
    ],
    gold: { kind: 'taunt', at: [24, 24], hit: 'head' },
  }),

  // -- #16 Count Midnight: lights out. The attack starts with his snap: the whole thing comes in the dark, on his eyes
  midnight: ({ hit, fin, call }) => ({
    name: 'DEAD OF NIGHT', taunt: 44,
    steps: [
      call('snap'),
      hit('nightfall', 'NIGHTFALL', { rec: 10 }),
      hit('batWing', 'BAT WING', { rec: 10 }),
      hit('graveDigger', 'GRAVE DIGGER', { rec: 12 }),
      hit('fang1', 'FANG', { rec: 8 }),
      hit('fang2', 'FANG (2)', { rec: 12 }),
      fin('midnightStrike', 'THE LONG NIGHT'),
    ],
    gold: { hit: 'head' },
  }),

  // -- #21 Ringmaster Rex: LIGHTS! He calls the spotlight, and every blow of the show has its own sound
  rex: ({ hit, fin, call }) => ({
    name: 'THE GREATEST SHOW', taunt: 44,
    steps: [
      call('callLights'),
      hit('caneJab', 'WHIP CRACK', { rec: 10 }),
      hit('lionTamer', 'DRUM ROLL', { rec: 10 }),
      hit('rollUp', 'THUD', { rec: 12 }),
      hit('encore1', 'CHIME', { rec: 6 }),
      hit('encore2', 'CHIME (2)', { rec: 12 }),
      fin('bigTop', 'THE TENT COMES DOWN'),
    ],
    gold: { kind: 'recovery', at: 10, after: 'dodged', hit: 'body' },
  }),

  // -- #25 The Baron: a duellist. Seven blows of a proper fencing phrase, ending in a fleche that is not the one he usually runs
  baron: ({ hit, fin }) => ({
    name: 'THE GRAND PHRASE', sfx: 'whistle', taunt: 56,
    steps: [
      hit('thrust', 'PRISE DE FER', { rec: 10 }),
      hit('double1', 'DOUBLE', { rec: 6 }),
      hit('double2', 'DOUBLE (2)', { rec: 10 }),
      hit('coupe', 'COUPE', { rec: 10 }),
      hit('basse', 'LIGNE BASSE', { rec: 12 }),
      hit('riposte', 'RIPOSTE', { rec: 10 }),
      fin('fleche', 'FLECHE ETERNELLE'),
    ],
    gold: { kind: 'taunt', at: [22, 22], hit: 'Lhead' },
  }),

  // -- #29 Maestro Vale: a symphony in six movements, andante to prestissimo, each tighter than the one before
  maestro: ({ hit, fin }) => ({
    name: 'SYMPHONY NO. 6', sfx: 'chime', taunt: 52,
    steps: [
      hit('staccato', 'ANDANTE', { w: 17, rec: 20 }),
      hit('legato', 'MODERATO', { w: 15, rec: 16 }),
      hit('pizzicato', 'ALLEGRO', { w: 13, rec: 12 }),
      hit('sforzando', 'SFORZANDO', { w: 14, rec: 12 }),
      hit('trem1', 'TREMOLO', { w: 12, rec: 8 }),
      hit('trem2', 'TREMOLO (2)', { w: 11, rec: 8 }),
      hit('cresc3', 'PRESTISSIMO', { w: 11, rec: 14 }),
      fin('fortissimo', 'CODA'),
    ],
    gold: { hit: 'Rhead' },
  }),

  // -- #33 Avalanche: blocked or not, he costs you hearts; the snowball grows. Here the whole mountain comes down, block and slip alike
  avalanche: ({ hit, fin }) => ({
    name: 'THE WHITE DEATH', sfx: 'foghorn', taunt: 50,
    steps: [
      hit('packed', 'PACKED SNOW', { rec: 12 }),
      hit('drift', 'SNOWDRIFT', { rec: 10 }),
      hit('cornice1', 'CORNICE', { rec: 6 }),
      hit('cornice2', 'CORNICE (2)', { rec: 12 }),
      hit('packed', 'HARD PACK', { rec: 10 }),
      hit('flurryJab', 'FLURRY', { rec: 10 }),
      fin('whiteout', 'THE WHITEOUT'),
    ],
    gold: { hit: 'body' },
  }),

  // -- #37 The Mirror: he plays your own punches back, mirrored. Here he plays back a fixed hall of them, and then yours is the star punch
  mirror: ({ hit, fin }) => ({
    name: 'SEVEN YEARS\' BAD LUCK', sfx: 'chime', taunt: 46,
    steps: [
      hit('mJabL', 'YOUR LEFT', { rec: 8 }),
      hit('mJabR', 'YOUR RIGHT', { rec: 8 }),
      hit('mBodyL', 'YOUR LEFT (BODY)', { rec: 10 }),
      hit('mBodyR', 'YOUR RIGHT (BODY)', { rec: 10 }),
      hit('silverHook', 'SILVER HOOK', { rec: 8 }),
      hit('silverJab', 'SILVER JAB', { rec: 12 }),
      fin('mStar', 'YOUR STAR PUNCH'),
    ],
    gold: { hit: 'head' },
  }),

  // -- #42 King Karver: he reads you and hunts the weakness. The court sits in judgement: every hook and sceptre in the book, the long drop last
  karver: ({ hit, fin }) => ({
    name: 'THE CORONATION', sfx: 'fanfare', taunt: 52,
    steps: [
      hit('crownJab', 'SUMMONS', { rec: 8 }),
      hit('carveL', 'CARVE', { rec: 8 }),
      hit('carveR', 'CARVE', { rec: 10 }),
      hit('scepterL', 'SCEPTER', { rec: 8 }),
      hit('scepterR', 'SCEPTER', { rec: 10 }),
      hit('decree1', 'DECREE', { rec: 8 }),
      hit('decree2L', 'DECREE (2)', { rec: 12 }),
      fin('guillotine', 'THE LONG DROP'),
    ],
    gold: { hit: 'Rbody' },
  }),

  // -- #46 The Warden: by the whistle and by the numbers. The whole cell block, counted off, ending in a breakout
  warden: ({ hit, fin, call }) => ({
    name: 'LOCKDOWN', taunt: 44,
    steps: [
      call('headcount'),
      hit('count1', 'ONE!', { rec: 4 }),
      hit('count2', 'TWO!', { rec: 4 }),
      hit('count3', 'THREE!', { rec: 8 }),
      hit('stick', 'NIGHTSTICK', { rec: 10 }),
      hit('cellHook', 'CELL BLOCK', { rec: 10 }),
      hit('patDown', 'PAT-DOWN', { rec: 12 }),
      fin('breakout', 'BREAKOUT!'),
    ],
    gold: { hit: 'Lhead' },
  }),

  // -- #50 Eclipse: sun and moon. A full circuit of the sky, sun glove then moon glove, ending in totality
  eclipse: ({ hit, fin }) => ({
    name: 'THE LONG DAY AND THE LONG NIGHT', sfx: 'foghorn', taunt: 52,
    steps: [
      hit('eJab', 'SUNBEAM', { rec: 8 }),
      hit('eHook', 'MOONFALL', { rec: 8 }),
      hit('eHookL', 'SUNSET', { rec: 8 }),
      hit('eBody', 'UMBRA', { rec: 10 }),
      hit('eUpper', 'DAWN', { rec: 10 }),
      hit('eHook', 'MOONFALL (2)', { rec: 8 }),
      hit('eHookL', 'SUNSET (2)', { rec: 12 }),
      fin('corona', 'TOTALITY'),
    ],
    gold: { hit: 'Lbody' },
  }),

  // -- Thunder Jax Crane: the boss. The storm in full: every blow he owns in a row, then the last thunder
  jax: ({ hit, fin }) => ({
    name: 'THE STORM WALL', sfx: 'thunder', taunt: 50,
    steps: [
      hit('fJab', 'LIGHTNING', { rec: 6 }),
      hit('fHook', 'THUNDER', { rec: 6 }),
      hit('fBody', 'RAIN', { rec: 8 }),
      hit('tJab', 'LIGHTNING (2)', { rec: 6 }),
      hit('tHookL', 'THUNDER (2)', { rec: 8 }),
      hit('tBody', 'RAIN (2)', { rec: 8 }),
      hit('tUpper', 'THE EYE OF THE STORM', { rec: 12 }),
      fin('lastThunder', 'NO MORE STORMS'),
    ],
    gold: { hit: 'Rhead' },
  }),
  // -- ZERO, the first encounter: the champions' echoes. Here they all arrive at once, the rest of what he is wearing no one's face
  zero: ({ hit, fin }) => ({
    name: 'EVERYONE AT ONCE', sfx: 'glitch', taunt: 54,
    steps: [
      hit('zJab', 'NOTHING', { rec: 8 }),
      hit('zHook', 'NOWHERE', { rec: 8 }),
      hit('zHookL', 'NOWHERE (L)', { rec: 8 }),
      hit('zBody', 'NO ONE', { rec: 10 }),
      hit('noFloor', 'NO FLOOR', { rec: 10 }),
      hit('sig_gus', 'NO ORDER', { rec: 8 }),
      hit('sig_mcbride', 'NO MAYOR', { rec: 12 }),
      fin('sig_mirror', 'NO REFLECTION'),
    ],
    gold: { hit: 'Rhead' },
  }),

  // ================================================================ PANTHEON
  // -- #54 Aurora Vess: the first light. Her blows leave an afterglow; this one is the whole day, dawn to dusk
  aurora: ({ hit, fin }) => ({
    name: 'DAWN TO DUSK', sfx: 'chime', taunt: 52,
    steps: [
      hit('glowJab', 'FIRST RAY', { rec: 8 }),
      hit('glowHook', 'DAWN HOOK', { rec: 8 }),
      hit('glowUpper', 'RISING SUN', { rec: 10 }),
      hit('dawnBody', 'DAWN BLOW', { rec: 10 }),
      hit('duskSweep', 'DUSK SWEEP', { rec: 12 }),
      hit('glowHook', 'GOLDEN HOUR', { rec: 8 }),
      fin('firstLight', 'THE SUN GOES DOWN'),
    ],
    gold: { kind: 'advance', at: [3, 3], hit: 'Lhead' },
  }),

  // -- #58 Cirrus Crown: the weather king. A front moves through: every kind of weather in a fixed order, and the storm last
  cirrus: ({ hit, fin }) => ({
    name: 'THE PERFECT STORM', sfx: 'thunder', taunt: 50,
    steps: [
      hit('jab', 'DRIZZLE', { rec: 8 }),
      hit('hook', 'SQUALL', { rec: 8 }),
      hit('body', 'DEW', { rec: 10 }),
      hit('upper', 'THUNDERHEAD', { rec: 10 }),
      hit('crosswind', 'CROSSWIND', { rec: 12 }),
      hit('hook', 'SQUALL LINE', { rec: 8 }),
      fin('stormFist', 'THE EYE WALL'),
    ],
    gold: { hit: 'Lhead' },
  }),

  // -- #66 The Old Guard: the first champion. Everything he ever taught, in the order he taught it, and the lesson at the end
  oldguard: ({ hit, fin }) => ({
    name: 'EVERY LESSON', sfx: 'bell', taunt: 56,
    steps: [
      hit('jab', 'STRAIGHT LEFT', { rec: 8 }),
      hit('cross', 'RIGHT CROSS', { rec: 8 }),
      hit('poke', 'CANE POKE', { rec: 10 }),
      hit('hook', 'CHAMPION\'S HOOK', { rec: 10 }),
      hit('body', 'BELT-LINE BLOW', { rec: 12 }),
      hit('caneSweep', 'CANE SWEEP', { rec: 12 }),
      hit('haymaker', 'BARE-KNUCKLE HAYMAKER', { rec: 14 }),
      fin('firstChampion', 'CLASS DISMISSED'),
    ],
    gold: { kind: 'recovery', at: 10, after: 'dodged', hit: 'Rbody' },
  }),

  // -- #70 Nebula: the stellar nursery. A star is born, burns and collapses into the black hole
  nebula: ({ hit, fin }) => ({
    name: 'STELLAR COLLAPSE', sfx: 'foghorn', taunt: 50,
    steps: [
      hit('flare', 'FLARE', { rec: 6 }),
      hit('flareR', 'FLARE (R)', { rec: 8 }),
      hit('sear', 'SEARING HOOK', { rec: 8 }),
      hit('searL', 'SEARING HOOK (L)', { rec: 8 }),
      hit('chill', 'COLD FRONT', { rec: 10 }),
      hit('tide', 'TIDE OF GAS', { rec: 12 }),
      hit('fallout', 'FALLOUT', { rec: 10 }),
      fin('blackHole', 'EVENT HORIZON'),
    ],
    gold: { hit: 'Rbody' },
  }),

  // -- #74 Forgemaster Hale: the forge. Heat, hammer and quench: the whole working of a blade, and the anvil last
  hale: ({ hit, fin }) => ({
    name: 'THE WORKING OF A BLADE', sfx: 'clang', taunt: 54,
    steps: [
      hit('jab', 'FORGED JAB', { rec: 8 }),
      hit('jabR', 'FORGED CROSS', { rec: 8 }),
      hit('hook', 'TONGS HOOK', { rec: 8 }),
      hit('hookL', 'TONGS HOOK (L)', { rec: 8 }),
      hit('bodyR', 'BELLOWS BLOW', { rec: 10 }),
      hit('quenchSweep', 'QUENCH', { rec: 12 }),
      hit('upper', 'FURNACE UPPERCUT', { rec: 12 }),
      fin('sledge', 'STRIKE THE ANVIL'),
    ],
    gold: { kind: 'recovery', at: 10, after: 'dodged', hit: 'head' },
  }),

  // -- #78 Prism: the spectrum. Every colour of the light in turn, from the first beam to the white
  prism: ({ hit, fin }) => ({
    name: 'FULL SPECTRUM', sfx: 'chime', taunt: 48,
    steps: [
      hit('jab', 'RED', { rec: 6 }),
      hit('jabR', 'ORANGE', { rec: 6 }),
      hit('hook', 'YELLOW', { rec: 8 }),
      hit('hookL', 'GREEN', { rec: 8 }),
      hit('body', 'BLUE', { rec: 10 }),
      hit('bodyR', 'INDIGO', { rec: 10 }),
      hit('refraction', 'VIOLET', { rec: 12 }),
      hit('upper', 'BEAM UPPERCUT', { rec: 12 }),
      fin('spectrum', 'WHITE LIGHT'),
    ],
    gold: { kind: 'taunt', at: [20, 20], hit: 'Rhead' },
  }),

  // -- #81 Radiant Rho: the last light, who borrows the five before her. This is the borrowed light in full, then her own
  rho: ({ hit, fin }) => ({
    name: 'THE LAST LIGHT', sfx: 'fanfare', taunt: 54,
    steps: [
      hit('jab', 'RADIANT JAB', { rec: 6 }),
      hit('jabR', 'RADIANT CROSS', { rec: 6 }),
      hit('hook', 'RADIANT HOOK', { rec: 8 }),
      hit('hookL', 'RADIANT HOOK (L)', { rec: 8 }),
      hit('body', 'RADIANT BLOW', { rec: 10 }),
      hit('radiantSweep', 'RADIANT SWEEP', { rec: 10 }),
      hit('upper', 'RADIANT UPPERCUT', { rec: 12 }),
      fin('supernova', 'ALL THE LIGHT THERE IS'),
    ],
    gold: { hit: 'body' },
  }),

  // -- Barney Buckets, Ascended: the mop of heaven. The wet floor first (his call), then the whole cleaning round
  barney2: ({ hit, fin, call }) => ({
    name: 'THE HOLY BUCKET BRIGADE', sfx: 'splash', taunt: 44,
    steps: [
      call('holySpill'),
      hit('jab', 'SWISH', { rec: 8 }),
      hit('hook', 'PUSH-BROOM HOOK', { rec: 8 }),
      hit('mop1', 'MOP: LEFT', { rec: 8 }),
      hit('mop2', 'MOP: RIGHT', { rec: 8 }),
      hit('mop3', 'MOP: LOW', { rec: 12 }),
      hit('bucketKick', 'BUCKET KICK', { rec: 12 }),
      fin('mopBucket', 'SPLASH!'),
    ],
    gold: { hit: 'Lbody' },
  }),

  // -- Halcyon, the boss: dawn, noon and dusk. All three forms in one breath, and the last light at the end
  halcyon: ({ hit, fin }) => ({
    name: 'THE WHOLE DAY', sfx: 'chime', taunt: 56,
    steps: [
      hit('dJab', 'DAWN JAB', { rec: 6 }),
      hit('dCross', 'DAWN CROSS', { rec: 6 }),
      hit('dHook', 'FIRST LIGHT HOOK', { rec: 8 }),
      hit('nBody', 'HIGH NOON BLOW', { rec: 8 }),
      hit('nHookL', 'ZENITH HOOK (L)', { rec: 8 }),
      hit('nUpper', 'SOLAR UPPERCUT', { rec: 10 }),
      hit('dkSweep', 'LONG SHADOW', { rec: 12 }),
      fin('dkFall', 'THE LAST LIGHT'),
    ],
    gold: { hit: 'Lhead' },
  }),

  // ================================================================ UNDERWORLD
  // -- #85 Moros: the many-faced. A masquerade: every face he wears, one after the other, and the funeral last
  moros: ({ hit, fin }) => ({
    name: 'THE MASQUERADE', sfx: 'bell', taunt: 50,
    steps: [
      hit('jab', 'MASKED JAB', { rec: 6 }),
      hit('jabR', 'MASKED CROSS', { rec: 6 }),
      hit('hook', 'DEAD HOOK', { rec: 8 }),
      hit('hookL', 'DEAD HOOK (L)', { rec: 8 }),
      hit('bodyR', 'GRAVE BLOW', { rec: 10 }),
      hit('lastRites', 'LAST RITES', { rec: 12 }),
      hit('upper', 'HEADSTONE', { rec: 10 }),
      fin('march', 'FUNERAL MARCH'),
    ],
    gold: { hit: 'head' },
  }),

  // -- #89 Queen Soot: queen of ash. The fire comes down in order: a wall of fire's worth of blows, burning to the fire storm
  soot: ({ hit, fin }) => ({
    name: 'ASH AND EMBER', sfx: 'whoosh', taunt: 50,
    steps: [
      hit('sear', 'SEARING JAB', { rec: 10 }),
      hit('searR', 'SEARING CROSS', { rec: 10 }),
      hit('smolder', 'SMOLDER', { rec: 14 }),
      hit('spark', 'SPARK', { rec: 12 }),
      hit('ashfall', 'ASHFALL', { rec: 30 }),
      hit('smolder', 'SMOLDER (2)', { rec: 12 }),
      hit('spark', 'SPARK (2)', { rec: 12 }),
      fin('blaze', 'BLAZE OF GLORY'),
    ],
    gold: { kind: 'recovery', at: 10, after: 'dodged', hit: 'Lbody' },
  }),

  // -- #94 The Jailer: chained. Every lock on the ring, turned in order, the sentence at the end
  jailer: ({ hit, fin, call }) => ({
    name: 'KEYS AND CHAINS', sfx: 'clang', taunt: 46,
    steps: [
      call('chainCall'),
      hit('keyJab', 'KEY JAB', { rec: 10 }),
      hit('keyJabR', 'KEY CROSS', { rec: 12 }),
      hit('chainHook', 'CHAIN HOOK', { rec: 14 }),
      hit('chainHookL', 'CHAIN HOOK (L)', { rec: 14 }),
      hit('cellBlow', 'CELL BLOW', { rec: 14 }),
      hit('cellDrop', 'CELL DROP', { rec: 16 }),
      hit('lockUp', 'LOCK UP', { rec: 14 }),
      fin('manacle', 'THE LAST LOCK'),
    ],
    gold: { hit: 'Rhead' },
  }),

  // -- #98 Fallen Karver: the dead king, who steals what is yours. The court of the dead: everything he took from the living, then the throne
  fkarver: ({ hit, fin }) => ({
    name: 'THE DEAD KING\'S COURT', sfx: 'foghorn', taunt: 52,
    steps: [
      hit('crown', 'CROWN JAB', { rec: 6 }),
      hit('crownR', 'CROWN CROSS', { rec: 6 }),
      hit('burden', 'BURDEN', { rec: 8 }),
      hit('carveL', 'CARVE', { rec: 8 }),
      hit('carveR', 'CARVE (2)', { rec: 8 }),
      hit('fallenScythe', 'THE FALLEN SCYTHE', { rec: 12 }),
      hit('tithe', 'THE KING\'S TITHE', { rec: 10 }),
      fin('decree', 'THE LAST DECREE'),
    ],
    gold: { hit: 'Rbody' },
  }),

  // -- #102 Crucible: the vessel that overheats. A pour, a cast and a quench, hotter every time
  crucible: ({ hit, fin }) => ({
    name: 'THE FULL POUR', sfx: 'wobble', taunt: 50,
    steps: [
      hit('ingot', 'INGOT JAB', { rec: 6 }),
      hit('cast', 'CAST HOOK', { rec: 8 }),
      hit('castL', 'CAST HOOK (L)', { rec: 8 }),
      hit('pourBlow', 'POURING BLOW', { rec: 8 }),
      hit('quench', 'THE QUENCH', { rec: 12 }),
      hit('forge', 'FORGE UPPERCUT', { rec: 10 }),
      hit('slagging', 'SLAGGING', { rec: 12 }),
      fin('meltdown', 'COMPLETE MELTDOWN'),
    ],
    gold: { kind: 'taunt', at: [20, 20], hit: 'Lhead' },
  }),

  // -- #107 The Herald: the king's voice. Every proclamation, in order of rank, read out and then the last decree
  herald: ({ hit, fin }) => ({
    name: 'THE ROYAL PROCLAMATION', sfx: 'fanfare', taunt: 50,
    steps: [
      hit('jab', 'PROCLAMATION', { rec: 6 }),
      hit('hook', 'DECREE HOOK', { rec: 6 }),
      hit('hookL', 'DECREE HOOK (L)', { rec: 8 }),
      hit('body', 'EDICT', { rec: 8 }),
      hit('bodyR', 'EDICT (R)', { rec: 8 }),
      hit('proclaim', 'PROCLAIM', { rec: 12 }),
      hit('bellow', 'BELLOW', { rec: 10 }),
      hit('upper', 'ANNOUNCEMENT', { rec: 10 }),
      fin('requiem', 'HEAR YE, HEAR YE'),
    ],
    gold: { hit: 'Lhead' },
  }),

  // -- Vorgath, the boss: the king below. His whole court of blows, the floor going out from under you, the throne last
  vorgath: ({ hit, fin }) => ({
    name: 'THE KING\'S TITHE IN FULL', sfx: 'foghorn', taunt: 56,
    steps: [
      hit('jab', 'GRAVE JAB', { rec: 10 }),
      hit('cross', 'GRAVE CROSS', { rec: 10 }),
      hit('bodyR', 'THRONE BLOW (R)', { rec: 12 }),
      hit('hookL', 'KING\'S HOOK (L)', { rec: 12 }),
      hit('boneThrone', 'THE BONE THRONE', { rec: 30 }),
      hit('hook', 'KING\'S HOOK', { rec: 12 }),
      hit('upper', 'ROYAL UPPERCUT', { rec: 12 }),
      hit('crush', 'FLOOR BREAKER', { rec: 14 }),
      fin('dominion', 'DEATH\'S OWN DOMINION'),
    ],
    gold: { hit: 'head' },
  }),

  // ================================================================ THE VOID (the twelve Hollowed, Dash Unbound, ZERO's true form)
  // -- #108 The Dodge Shard: everything of his can only be slipped. The long run: nine slips in a row, side to side, with no room to breathe
  dodgeShard: ({ hit, fin }) => ({
    name: 'THE LONG RUN', sfx: 'whoosh', taunt: 44,
    steps: [
      hit('jab', 'FIRST STRIDE', { rec: 6 }),
      hit('hook', 'SWERVE', { rec: 6 }),
      hit('hookL', 'SWERVE (L)', { rec: 6 }),
      hit('body', 'LOW SWERVE', { rec: 6 }),
      hit('bodyR', 'LOW SWERVE (R)', { rec: 6 }),
      hit('cross', 'SECOND WIND', { rec: 6 }),
      hit('hook', 'SWERVE (3)', { rec: 6 }),
      hit('upper', 'LEAP', { rec: 10 }),
      fin('breakneck', 'THE FINISH LINE'),
    ],
    gold: { hit: 'body' },
  }),

  // -- #109 The Block Shard: everything of his can only be blocked. The siege: nine blows on a rhythm that keeps breaking
  blockShard: ({ hit, fin }) => ({
    name: 'THE SIEGE', sfx: 'clang', taunt: 48,
    steps: [
      hit('jab', 'FIRST STONE', { rec: 22 }),
      hit('cross', 'SECOND STONE', { rec: 6 }),
      hit('hook', 'RAM', { rec: 30 }),
      hit('body', 'BATTERING RAM', { rec: 8 }),
      hit('bodyR', 'BATTERING RAM (R)', { rec: 14 }),
      hit('hookL', 'RAM (L)', { rec: 8 }),
      hit('upper', 'GATE BREAKER', { rec: 26 }),
      hit('bulwark', 'THE BULWARK FALLS', { rec: 6 }),
      fin('breaker', 'THE WALL COMES DOWN'),
    ],
    gold: { hit: 'Lbody' },
  }),

  // -- #110 The Duck Shard: everything of his is a sweep. Delays too long to be part of the one before, and then another
  duckShard: ({ hit, fin }) => ({
    name: 'THE LOW ROAD, ALL THE WAY', sfx: 'whoosh', taunt: 44,
    steps: [
      hit('flick', 'FLICK', { rec: 22 }),
      hit('sweep', 'SWEEP', { rec: 24 }),
      hit('drag', 'DRAG', { rec: 46 }),
      hit('flick', 'FLICK (2)', { rec: 24 }),
      hit('sweep', 'SWEEP (2)', { rec: 26 }),
      hit('scythe', 'THE SCYTHE', { rec: 40 }),
      hit('drag', 'DRAG (2)', { rec: 24 }),
      fin('whirlwind', 'THE LAST WHIRL'),
    ],
    gold: { hit: 'head' },
  }),

  // -- #111 The Counter Shard: only a counter hurts him. His answer to everything, thrown at once: eight lunges and the last riposte
  counterShard: ({ hit, fin }) => ({
    name: 'THE LAST ANSWER', sfx: 'ding', taunt: 48,
    steps: [
      hit('jab', 'POINT', { rec: 10 }),
      hit('cross', 'TIERCE', { rec: 10 }),
      hit('hook', 'SABRE', { rec: 12 }),
      hit('hookL', 'SABRE (L)', { rec: 12 }),
      hit('body', 'LUNGE', { rec: 12 }),
      hit('bodyR', 'LUNGE (R)', { rec: 12 }),
      hit('rebuke', 'REBUKE', { rec: 14 }),
      hit('upper', 'FLECHE', { rec: 14 }),
      fin('riposte', 'THE LAST WORD'),
    ],
    gold: { hit: 'Lhead' },
  }),

  // -- #112 The Sight Shard: he fights in silence and every tell is a colour. A whole spectrum of them, one blow each, the gaze at the end
  sightShard: ({ hit, fin }) => ({
    name: 'THE LONG STARE', taunt: 48,
    steps: [
      hit('jab', 'GLANCE', { rec: 8 }),
      hit('hook', 'SIDELONG', { rec: 8 }),
      hit('body', 'BELOW THE LINE', { rec: 10 }),
      hit('sweep', 'LOWERED LID', { rec: 24 }),
      hit('hookL', 'SIDELONG (L)', { rec: 8 }),
      hit('bodyR', 'BELOW THE LINE (R)', { rec: 10 }),
      hit('upper', 'RAISED BROW', { rec: 12 }),
      hit('cross', 'STARE', { rec: 12 }),
      fin('gaze', 'THE GAZE, UNBROKEN'),
    ],
    gold: { kind: 'recovery', at: 10, after: 'dodged', hit: 'head' },
  }),

  // -- #113 The Sound Shard: a listener, nearly invisible, whose every blow has its own sound. This is a melody: nine notes, then the chord
  soundShard: ({ hit, fin }) => ({
    name: 'THE MELODY', sfx: 'chime', taunt: 48,
    steps: [
      hit('jab', 'A WHISPER', { rec: 8 }),
      hit('hook', 'A RISING TONE', { rec: 8 }),
      hit('hookL', 'A FALLING TONE', { rec: 8 }),
      hit('body', 'A CLICK', { rec: 10 }),
      hit('sweep', 'A THROB', { rec: 24 }),
      hit('cross', 'A HUM', { rec: 8 }),
      hit('upper', 'A CHIME', { rec: 12 }),
      hit('bodyR', 'A CLICK (2)', { rec: 12 }),
      fin('chord', 'THE LAST CHORD'),
    ],
    gold: { hit: 'Rbody' },
  }),

  // -- #114 The Rhythm Shard: every blow lands on a beat. A whole bar of them, off the beat in the middle, the crescendo last
  rhythmShard: ({ hit, fin }) => ({
    name: 'THE BREAKDOWN', sfx: 'airhorn', taunt: 46,
    steps: [
      hit('jab', 'TAP', { rec: 8 }),
      hit('cross', 'TAP-TAP', { rec: 8 }),
      hit('hook', 'RIM SHOT', { rec: 10 }),
      hit('hookL', 'RIM SHOT (L)', { rec: 10 }),
      hit('body', 'KICK', { rec: 12 }),
      hit('bodyR', 'KICK (R)', { rec: 12 }),
      hit('upper', 'CYMBAL', { rec: 14 }),
      hit('crash', 'CRASH', { rec: 8 }),
      fin('crescendo', 'THE FINAL CRESCENDO'),
    ],
    gold: { hit: 'Lhead' },
  }),

  // -- #115 The Memory Shard: one fixed sequence, no tell but a tick. The recital in full, line by line, the last line a knockout
  memoryShard: ({ hit, fin }) => ({
    name: 'THE ENCORE', sfx: 'tick', taunt: 50,
    steps: [
      hit('jab', 'LINE', { rec: 8 }),
      hit('hook', 'VERSE', { rec: 8 }),
      hit('hookL', 'VERSE (L)', { rec: 8 }),
      hit('body', 'STANZA', { rec: 10 }),
      hit('bodyR', 'STANZA (R)', { rec: 10 }),
      hit('upper', 'REFRAIN', { rec: 12 }),
      hit('hook', 'VERSE (3)', { rec: 8 }),
      hit('jab', 'LINE (2)', { rec: 8 }),
      hit('bodyR', 'STANZA (3)', { rec: 10 }),
      hit('finale', 'THE LAST LINE', { rec: 12 }),
      fin('recital', 'THE RECITAL, AGAIN'),
    ],
    gold: { hit: 'Rbody' },
  }),

  // -- #116 The Echo Shard: your own punches, come back. Everything you could throw, all at once and in a fixed order, and your star punch last
  echoShard: ({ hit, fin }) => ({
    name: 'YOUR OWN WORDS', sfx: 'chime', taunt: 48,
    steps: [
      hit('eJab', 'YOUR JAB', { rec: 8 }),
      hit('eJabR', 'YOUR CROSS', { rec: 8 }),
      hit('eBody', 'YOUR BODY SHOT', { rec: 10 }),
      hit('eBodyR', 'YOUR BODY SHOT (R)', { rec: 10 }),
      hit('eJab', 'YOUR JAB (2)', { rec: 8 }),
      hit('eBody', 'YOUR BODY SHOT (2)', { rec: 12 }),
      hit('eStar', 'YOUR STAR PUNCH', { rec: 12 }),
      fin('mimic', 'YOUR LAST WORD'),
    ],
    gold: { kind: 'taunt', at: [22, 22], hit: 'Rhead' },
  }),

  // -- #117 The Chaos Shard: his moves are re-rolled every ten seconds. For once, every one of them in a row
  chaosShard: ({ hit, fin }) => ({
    name: 'ALL THE DICE', sfx: 'airhorn', taunt: 46,
    steps: [
      hit('jab', 'WILD JAB', { rec: 8 }),
      hit('hook', 'LOADED HOOK', { rec: 8 }),
      hit('bodyB', 'HARD WAY', { rec: 10 }),
      hit('sweep', 'SNAKE SWEEP', { rec: 24 }),
      hit('hookL', 'LOADED HOOK (L)', { rec: 8 }),
      hit('bodyR', 'LOW ROLL (R)', { rec: 10 }),
      hit('upper', 'HIGH ROLL', { rec: 12 }),
      hit('cross', 'WILD CROSS', { rec: 8 }),
      hit('slam', 'JACKPOT', { rec: 14 }),
      hit('haymaker', 'ALL IN', { rec: 14 }),
      fin('snakeEyes', 'BOXCARS'),
    ],
    gold: { hit: 'Lbody' },
  }),

  // -- #118 The Time Shard: time turns in the middle of a pattern. The last second: every blow quicker than the one before
  timeShard: ({ hit, fin }) => ({
    name: 'THE LAST SECOND', sfx: 'tick', taunt: 46,
    steps: [
      hit('jab', 'TICK', { w: 12, rec: 18 }),
      hit('cross', 'TOCK', { w: 11, rec: 16 }),
      hit('hook', 'MINUTE HAND', { w: 10, rec: 14 }),
      hit('hookL', 'MINUTE HAND (L)', { w: 10, rec: 12 }),
      hit('body', 'PENDULUM', { w: 9, rec: 10 }),
      hit('bodyR', 'PENDULUM (R)', { w: 8, rec: 8 }),
      hit('upper', 'CHIME', { w: 10, rec: 8 }),
      hit('haymaker', 'MIDNIGHT', { w: 14, rec: 12 }),
      fin('stopped', 'TIME, GENTLEMEN'),
    ],
    gold: { kind: 'recovery', at: 10, after: 'dodged', hit: 'Lbody' },
  }),

  // -- #119 The Will Shard: the last to fall, the sum of the other eleven. Everything the twelve tested, in one unbroken line
  willShard: ({ hit, fin }) => ({
    name: 'UNBROKEN', sfx: 'foghorn', taunt: 50,
    steps: [
      hit('jab', 'RESOLVE', { rec: 8 }),
      hit('hook', 'STUBBORN HOOK', { rec: 8 }),
      hit('wall', 'HARD WALL', { rec: 12 }),
      hit('hookL', 'STUBBORN HOOK (L)', { rec: 8 }),
      hit('sweep', 'UNDERFOOT', { rec: 24 }),
      hit('bodyR', 'GRIT (R)', { rec: 10 }),
      hit('upper', 'RISING WILL', { rec: 12 }),
      hit('cross', 'RESOLVE (R)', { rec: 8 }),
      hit('breaking', 'WILL BREAKER', { rec: 14 }),
      fin('lastWord', 'THE LAST WORD, AGAIN'),
    ],
    gold: { hit: 'Rhead' },
  }),

  // -- Dash Unbound: every gimmick of every fight. The final cut: his whole highlight reel on 3-frame tells, and the last dash
  dash9: ({ hit, fin }) => ({
    name: 'THE FINAL CUT', sfx: 'airhorn', taunt: 46,
    steps: [
      hit('showJab', 'SHOWBOAT JAB', { rec: 10 }),
      hit('smartCross', 'SMART CROSS', { rec: 10 }),
      hit('reel2', 'REEL: BODY', { rec: 14 }),
      hit('reel1', 'REEL: HOOK', { rec: 12 }),
      hit('knowItAll', 'KNOW-IT-ALL', { rec: 12 }),
      hit('selfieStick', 'SELFIE STICK', { rec: 30 }),
      hit('divineR', 'DIVINE DASH', { rec: 14 }),
      hit('shHookL', 'SHADOW HOOK (L)', { rec: 12 }),
      fin('divineL', 'DIVINE DASH: ENCORE', { w: 22 }),
    ],
    gold: { hit: 'Rhead' },
  }),

  // -- ZERO's true form (the crystals' rework, 2026-10-04): THE CONVERGENCE. Several crystals glow at once and he runs their attacks into one another,
  // ending in ONE golden blow that cracks every crystal in it. The blows are chosen as he throws it, from the first four crystals that are still whole
  // (src/fight/asc/crystals.js `derive`: two blows of each); the steps below are the full set (the first four crystals) and give it its call, its last
  // blow and its golden moment.
  zeroTrue: ({ d, hit, fin, call }) => {
    const rec = (id) => d.moves[id].recoveryFrames;
    return {
      name: 'THE CONVERGENCE', sfx: 'glitch', taunt: 52,
      steps: [
        call('pair_go'),
        hit('cx_dodge_1', 'CYAN BLOW', { rec: rec('cx_dodge_1') }), hit('cx_dodge_2', 'CYAN BLOW (2)', { rec: rec('cx_dodge_2') }),
        hit('cx_block_1', 'ORANGE BLOW', { rec: rec('cx_block_1') }), hit('cx_block_2', 'ORANGE BLOW (2)', { rec: rec('cx_block_2') }),
        hit('cx_duck_1', 'VIOLET BLOW', { rec: rec('cx_duck_1') }), hit('cx_duck_2', 'VIOLET BLOW (2)', { rec: rec('cx_duck_2') }),
        hit('cx_counter_1', 'AZURE BLOW', { rec: rec('cx_counter_1') }), hit('cx_counter_2', 'AZURE BLOW (2)', { rec: 20 }),
        fin('pair_fin', 'ALL AT ONCE'),
      ],
      gold: { hit: 'head' },
    };
  },

};
