// Supers and their golden moments (spec §4 "Supers", rebuilt 2026-10-02).
//
// A super is one of a fighter's big signature attacks: a one-hit knockdown, a rush, a flurry, a charge. Every opponent
// has at least one. Once a super starts he is ARMORED until its last attack has been thrown: he can't be hit, stunned or
// interrupted, and your punches bounce off with a clank and do no damage. You survive it with the right defense.
// The one exception is the super's single GOLDEN MOMENT: one precise window, always at the same point in the super, where
// the right punch cancels it. Against a fighter or a champion it is an instant knockdown (his health drops to zero and
// the count starts); against the six big bosses (Jax, the first ZERO, Halcyon, Vorgath, Dash Unbound, ZERO's true form)
// it is a long stun instead (data/difficulty.js GOLDEN_STUN): the super is cancelled and he's wide open for free hits,
// but the stun itself never empties a phase or ends the fight. Its tell is subtle (a small glint by his head on the
// frame to throw, his own sound); its width follows the difficulty curve (data/difficulty.js GOLDEN).
//
// Two kinds:
//   sequence  (the default) thrown once or twice a round from a sequence of its own (the executor, src/fight/opponentAI.js):
//                 step back (out of reach)  ->  taunt  ->  step back in  ->  SUPER (+ its follow-ups)
//             The armor starts with the step back.
//   inline    stays where it was authored (his patterns, a scripted moment, a modifier's queue: Avalanche's snowball
//             rush). The armor starts with the first move of its chain.
//
// Fighter data: `super: {...}` (his main super) and `supers: [{...}, ...]` (more of them), each:
//   move: 'mopSwing'          the super (a move in `moves`), or
//   moves: ['a', 'b']         one picked at random each time (ZERO's echoes), or
//   bySet: { castor: 'turbine', pollux: 'doubleTake' }    by his pattern set (the tag team)
//   then: ['timber1', ...]    its follow-ups (or { moveId: [...] } per pick): all part of the super, all armored
//   inline: true              an inline super (see above)
//   times: [1, 2]             supers per round (sequence supers; the main super's count rules: data/difficulty.js SUPERS)
//   taunt: 50, shout, sfx     the taunt's length, its shout (the sound only: no in-fight text) and sound
//   golden: 'windup'          where the golden moment is:
//      'taunt'     he taunts up close: `window` = frames of the taunt
//      'advance'   as he steps back in: `window` = the first frames of the super's windup
//      'windup'    mid-windup: `window` (or the move's own kdWindow)
//      'recovery'  defend the super (`after`: 'dodged' default, 'ducked', or 'any'; `dir`: 'L' | 'R', the side you slipped
//                  to), then punch on `window` frames of its recovery
//      'open'      the opening a slipped super leaves (an exploit's open step, `open`: its anim): `window` frames of it
//   on: 'reel1'               the move of the chain the golden moment sits on (default: the super itself). A golden moment on
//                             a follow-up cancels the rest of the chain too.
//   window: [a, b]
//   hit: 'body' | 'head' | 'L' | 'R' | 'Lbody' | 'Rhead' | ... | 'star'    the punch that counts (default: any punch)
//   flag: 'breather'          the golden moment is only there once this knowledge switch is on (Jax's breather)
//   name                      what he calls it (default: the move's name)
//   golden text for the scouting report: `scout` (default: written from the fields above)
//   keep: true                the move(s) stay in his ordinary patterns too: every throw is the super (armor, golden moment),
//                             unless its golden moment is on the taunt or the step in (keptSuper)
//   keepKd: ['moveId']        other moves that keep a perfect-hit window of their own (not supers)
//   keepOpenKd: true          `open` steps keep theirs (by default they lose it)
//   standIn: 'moveId'         what he throws where a sequence super used to be in his patterns
//
// withSuper(d) turns a fighter's data into what the executor runs:
//   - every super is normalized into d.superList (d.super stays his main one);
//   - a sequence super is thrown from a copy, `<id>*`, carrying the golden window (the executor reports it under its own
//     id, so modifiers see the real move); taunt steps become idles (taunts only come before a super);
//   - a sequence super (with its follow-ups) never appears in an ordinary pattern unless `keep`: its step becomes his
//     stand-in punch and the follow-ups 1-frame idles, so step counts (and so `cancels`) stay right;
//   - an inline super's golden move carries the golden window itself;
//   - every other move (and every `open` step) loses its perfect hit, and tauntKd goes.

export const SUPER_BACK = 16;    // frames to step back
export const SUPER_ADVANCE = 14; // frames to step back in
export const SUPER_DEPTH = 10;   // pixels he backs off up the screen

export const superIds = (S) => (S.moves || (S.bySet ? [...new Set(Object.values(S.bySet))] : S.move ? [S.move] : []));
export const thenOf = (S, id) => (Array.isArray(S.then) ? S.then : (S.then && S.then[id]) || []);
// every super of a fighter, his main one first
export const supersOf = (d) => d.superList || [d.super, ...(d.supers || [])].filter(Boolean);
// the move ids of a super's whole chain, for each of its picks: [[first, ...follow-ups], ...]
export const chainsOf = (S) => superIds(S).map((id) => [id, ...thenOf(S, id)]);
// the move a super's golden moment sits on, for a pick
export const goldenMoveOf = (S, id) => S.on || id;
// a super's key (scouting, hints): its first move
export const superKey = (S) => S.key || superIds(S)[0] || S.open;

// A `keep` super thrown from his patterns is the super too (armored, its golden moment) when its golden moment is part of the
// move itself (windup, recovery, the opening after); one whose golden moment is on the taunt or the step back in only exists
// as the super sequence, so its pattern throws stay ordinary punches (Dash I's Know-It-All hook).
export const keptSuper = (S) => !!S.keep && !['taunt', 'advance'].includes(S.golden);
// The punch a golden moment needs: { height: 'high' | 'low' | null, side: 'L' | 'R' | null, star: bool }
export function hitOf(S, d) {
  const h = String(S.hit || '');
  const star = h === 'star' || !!(d && d.kdStar);
  return {
    star,
    height: star ? null : /head|high/i.test(h) ? 'high' : /body|low/i.test(h) ? 'low' : null,
    side: star ? null : /^L/.test(h) ? 'L' : /^R/.test(h) ? 'R' : null,
  };
}
export const hitMatches = (H, p) => !!H && (H.star ? p.star : !p.star && (!H.height || (H.height === 'high') === !!p.high) && (!H.side || H.side === p.side));
// the punch in words (the scouting report, the hints audit)
export function hitWords(H) {
  if (!H) return 'ANY PUNCH';
  if (H.star) return 'A STAR PUNCH';
  const side = H.side === 'L' ? 'LEFT ' : H.side === 'R' ? 'RIGHT ' : '';
  return `A ${side}${H.height === 'high' ? 'HEAD SHOT' : H.height === 'low' ? 'BODY SHOT' : side ? 'PUNCH' : 'PUNCH'}`.replace('A PUNCH', 'ANY PUNCH');
}

// The ordinary punch that takes a sequence super's place in his patterns (so he keeps the same rhythm and the same
// openings): `standIn` in the data, or his slowest counterable punch that isn't a super, a feint, a call or a one-hit knockdown.
export function standInOf(d, S) {
  if (S.standIn !== undefined) return S.standIn;
  const all = new Set(supersOf(d).flatMap((x) => chainsOf(x).flat()));
  let best = null;
  for (const [k, m] of Object.entries(d.moves)) {
    if (all.has(k) || k.endsWith('*') || m.feint || m.call || m.knockdown || !m.counterWindow || !(m.avoidBy || []).length) continue;
    if (m.recoveryFrames < 14) continue; // a combo link, not a punch on its own
    if (!best || m.windupFrames > d.moves[best].windupFrames) best = k;
  }
  return best;
}

// Normalize one pattern's steps.
export function stripSteps(steps, S, standIn = null) {
  const out = steps.map((s) => {
    if (s.taunt !== undefined) return { idle: Math.max(10, Math.round(s.taunt * 0.5)) };
    if (s.open && s.kd && S && !S.keepOpenKd) { const { kd, ...rest } = s; return rest; } // the golden moment is the super's
    return s;
  });
  if (!S || S.keep || S.inline) return out;
  for (const id of superIds(S)) {
    const seq = [id, ...thenOf(S, id)];
    for (let i = 0; i < out.length; i++) {
      if (out[i].move !== id) continue;
      let k = 1;
      while (k < seq.length && out[i + k] && out[i + k].move === seq[k]) k++;
      for (let j = 0; j < k; j++) out[i + j] = j === 0 && standIn ? { move: standIn } : { idle: 1 };
    }
  }
  return out;
}

// the golden window a move carries (windup / advance: kdWindow; recovery: recoveryKd) and the punch it needs
function armGolden(m, S, d) {
  const out = { ...m, super: true, noFake: true, goldenHit: hitOf(S, d), goldenAfter: S.after || 'dodged', goldenDir: S.dir || null, goldenFlag: S.flag || null };
  delete out.kdWindow; delete out.recoveryKd;
  if (S.golden === 'recovery') out.recoveryKd = S.window;
  else if (S.golden === 'windup' || S.golden === 'advance') { const w = S.window || m.kdWindow; if (w) out.kdWindow = w; }
  return out;
}

export function withSuper(d) {
  if (d.superReady || (!d.super && !(d.supers || []).length)) return d;
  const list = [d.super, ...(d.supers || [])].filter(Boolean).map((S, i) => ({ ...S, key: S.key || superIds(S)[0], main: i === 0 }));
  const keepKd = new Set(list.flatMap((S) => S.keepKd || []));
  const moves = {};
  for (const [k, m] of Object.entries(d.moves)) {
    if (!m.kdWindow || keepKd.has(k)) moves[k] = m;
    else { const { kdWindow, ...rest } = m; moves[k] = rest; }
  }
  for (const S of list) {
    for (const chain of chainsOf(S)) {
      const g = goldenMoveOf(S, chain[0]);
      for (const id of chain) {
        const orig = d.moves[id];
        if (!orig) continue;
        // the golden move carries the window (from the authored move, before stray perfect hits were folded away);
        // the chain's first move is marked a super (no fakes, never a guard counter or a stand-in); plain follow-ups stay as they are
        const armed = id === g ? armGolden({ ...moves[id], kdWindow: orig.kdWindow }, S, d) : id === chain[0] ? { ...moves[id], super: true, noFake: true } : moves[id];
        if (!S.inline && id === chain[0]) moves[id + '*'] = armed; // a sequence super is thrown from its copy
        if (S.inline || keptSuper(S) || id !== chain[0]) moves[id] = armed;
      }
    }
  }
  let patterns = d.patterns;
  for (const S of list) { const stand = standInOf(d, S); patterns = patterns.map((p) => ({ ...p, steps: stripSteps(p.steps, S, stand) })); }
  return { ...d, moves, patterns, super: list[0], superList: list, tauntKd: undefined, superReady: true };
}

// A super added to a fighter who is already wired (Title Defense's exclusive attack, data/fighters/titleDefense.js): its moves (authored,
// already on the curve) are armed exactly as withSuper arms a sequence super's, and the super joins his list marked `exclusive`. It
// takes the first turn among his sequence supers and then every other one (opponentAI.js), so it is the first super you meet each fight.
export function addSuper(d, S0, newMoves) {
  const S = { ...S0, key: S0.key || superIds(S0)[0], main: false, exclusive: true };
  const moves = { ...d.moves };
  for (const chain of chainsOf(S)) {
    const g = goldenMoveOf(S, chain[0]);
    for (const id of chain) {
      const m = newMoves[id] || d.moves[id]; // (a call of his own, the lights, the whistle, opens the attack as it is)
      if (!m) throw new Error(`exclusive super of ${d.id}: no move ${id}`);
      const armed = id === g ? armGolden({ ...m }, S, d) : id === chain[0] ? { ...m, super: true, noFake: true } : m;
      if (id === chain[0]) moves[id + '*'] = armed; // (a sequence super is thrown from its copy)
      if (S.inline || keptSuper(S) || id !== chain[0]) moves[id] = armed;
      else { const { kdWindow, recoveryKd, ...plain } = m; void kdWindow; void recoveryKd; moves[id] = plain; }
    }
  }
  return { ...d, moves, superList: [...supersOf(d), S] };
}

// The scouting report's line for a golden moment (written once it's found): where, and what punch.
export function goldenScout(S, d) {
  if (S.scout) return S.scout;
  const name = S.name || (d.moves[superIds(S)[0]] || {}).name || 'HIS SUPER';
  const H = hitWords(hitOf(S, d)), boss = !!d.goldenStun;
  const what = boss ? 'CANCELS IT AND LEAVES HIM WIDE OPEN' : 'DROPS HIM ON THE SPOT';
  const on = S.on && d.moves[S.on] ? ` ${d.moves[S.on].name}` : '';
  switch (S.golden) {
    case 'taunt': return `${name}: ${H} ON THE GLINT WHILE HE SHOWS OFF UP CLOSE ${what}.`;
    case 'advance': return `${name}: ${H} ON THE GLINT AS HE STEPS BACK IN ${what}.`;
    case 'recovery': return `${name}: ${S.after === 'ducked' ? 'DUCK' : 'SLIP'}${S.dir ? (S.dir === 'L' ? ' LEFT OF' : ' RIGHT OF') : ''} THE${on || ' ATTACK'}, THEN ${H} ON THE GLINT ${what}.`;
    case 'open': return `${name}: SLIP IT, THEN ${H} ON THE GLINT WHILE HE'S SPENT ${what}.`;
    default: return `${name}: ${H} ON THE GLINT IN THE${on || ''} WINDUP ${what}.`;
  }
}
