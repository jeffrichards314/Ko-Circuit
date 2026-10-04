// Builders for the remixes' knowledge layers (spec §6, K4): every remixed fighter gets exploits, anti-strategies and scripted moments of
// his own, different from his original fight's. A remix's data is written with these helpers; the parts that depend on the fighter's
// real (remixed) moves -- the frames of a counter window, the scouting-report text -- are filled in when the remix is built
// (data/fighters/titleDefense.js calls `finishKnowledge`), so the numbers always match the moves the player will meet.
//
//   X.counter(id, name, move, o)   a counter in his windup that stuns him (o.hits, o.stun, o.star, o.height, o.side, o.late / o.early)
//   X.cancel(id, name, move, o)    a counter that cancels the rest of his combo (o.cancel: moves), o.star
//   X.slip(id, name, move, o)      dodge / duck / block his move and he is open (o.result 'dodged' | 'ducked' | 'blocked', o.dir, o.open, o.hits, o.star)
//   X.open(id, name, open, o)      a punch into one of his own open steps
//   X.passive(id, name, o)         stand still and he gives himself away (o.seconds, o.open | o.script)
//   X.getUp(id, name, o)           he is open when he gets back up
//   X.blocks(id, name, o)          block n times in a row and he takes the bait
//   X.star(id, name, move, o)      a Star Punch into a chosen move or state
//   A.<type>(id, name, o)          an anti-strategy (the knowledge layer's types)
//   S.clock(id, name, left, steps, o) / S.health(id, name, health, steps, o)   a scripted moment
//   hint: [kind, text] (kind: trainer | visual | audio | quote); the cornerman's lines live in data/hints/remixes*.js
const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const base = (id, type, name, o) => ({ id, type, name, hint: { kind: o.hint[0], text: o.hint[1], ...(o.hidden ? { hidden: true } : {}) }, ...(o.limit ? { limit: o.limit } : {}) });

export const X = {
  counter: (id, name, move, o) => ({
    ...base(id, 'stunTrigger', name, o),
    // (`clean`: no other punch of yours in the last 26 frames: a deliberate counter, never a masher's lucky one)
    trigger: { state: 'windup', move, counter: true, ...(o.height ? { height: o.height } : {}), ...(o.side ? { side: o.side } : {}), clean: o.clean ?? 26 },
    window: o.late ? { late: o.late } : o.early ? { early: o.early } : null,
    effect: { stun: o.stun ?? 100, hits: o.hits ?? 6, ...(o.star ? { star: true } : {}), say: o.say ?? `${name}!`, sfx: o.sfx ?? 'clang' },
  }),
  cancel: (id, name, move, o) => ({
    ...base(id, 'patternBreak', name, o),
    trigger: { state: 'windup', move, counter: true, ...(o.height ? { height: o.height } : {}), ...(o.side ? { side: o.side } : {}), clean: o.clean ?? 26 },
    window: o.late ? { late: o.late } : o.early ? { early: o.early } : null,
    effect: { cancelMoves: asList(o.cancel), ...(o.star ? { star: true } : {}), say: o.say ?? `${name}!` },
  }),
  slip: (id, name, move, o) => ({
    ...base(id, 'quirk', name, o),
    trigger: { on: 'resolved', move, result: o.result ?? 'dodged', ...(o.dir ? { dir: o.dir } : {}), ...(o.health ? { health: o.health } : {}) },
    effect: { open: { frames: o.frames ?? 84, anim: 'stunned', comboLimit: o.hits ?? 5, ...(o.star ? { star: [0, o.star] } : {}) }, say: o.say ?? `${name}!`, sfx: o.sfx ?? 'thud' },
  }),
  open: (id, name, open, o) => ({
    ...base(id, 'stunTrigger', name, o),
    trigger: { state: 'open', open, ...(o.height ? { height: o.height } : {}), ...(o.frames ? { frames: o.frames } : {}), ...(o.first ? { first: true } : {}) },
    effect: { open: { frames: o.frames2 ?? 90, anim: 'stunned', comboLimit: o.hits ?? 5, ...(o.star ? { star: [0, o.star] } : {}) }, ...(o.flag ? { flag: o.flag, until: 'round' } : {}), say: o.say ?? `${name}!`, sfx: o.sfx ?? 'oof' },
  }),
  passive: (id, name, o) => ({
    ...base(id, 'bait', name, { limit: 3, ...o }),
    trigger: { on: 'passive', frames: Math.round((o.seconds ?? 6) * 60) },
    effect: { script: [{ open: o.openFrames ?? 70, anim: o.anim ?? 'taunt', id: o.stepId ?? 'x' + id, comboLimit: o.hits ?? 4, star: [0, o.star ?? 30] }], say: o.say ?? `${name}!` },
  }),
  getUp: (id, name, o) => ({
    ...base(id, 'stunTrigger', name, { limit: 3, ...o }),
    trigger: { on: 'getUp' },
    effect: { open: { frames: o.frames ?? 84, anim: 'stunned', comboLimit: o.hits ?? 5, ...(o.star ? { star: [0, o.star] } : {}) }, say: o.say ?? `${name}!`, sfx: 'thud' },
  }),
  blocks: (id, name, o) => ({
    ...base(id, 'bait', name, o),
    trigger: { on: 'blockStreak', n: o.n ?? 4 },
    effect: { open: { frames: o.frames ?? 90, anim: o.anim ?? 'stunned', comboLimit: o.hits ?? 5, ...(o.star ? { star: [0, o.star] } : {}) }, say: o.say ?? `${name}!` },
  }),
  star: (id, name, move, o) => ({
    ...base(id, 'starTrigger', name, o),
    trigger: { state: o.state ?? 'windup', move, star: true, ...(o.frames ? { frames: o.frames } : {}) },
    effect: { star: true, open: { frames: o.frames2 ?? 90, anim: 'stunned', comboLimit: o.hits ?? 4 }, say: o.say ?? `${name}!` },
  }),
};

export const A = {
  jabSpam: (id, name, o) => ({ id, type: 'jabSpam', name, streak: o.streak ?? 4, gap: o.gap ?? 40, counter: asList(o.counter), delay: o.delay ?? 14, say: o.say ?? 'PARRIED!', ...(o.mild ? { mild: true } : {}) }),
  turtling: (id, name, o) => (o.response === 'drain'
    ? { id, type: 'turtling', name, response: 'drain', share: o.share ?? 0.4, span: o.span ?? 480, every: o.every ?? 44, say: o.say }
    : { id, type: 'turtling', name, response: 'unblockable', moves: asList(o.moves), share: o.share ?? 0.4, span: o.span ?? 480, cue: o.cue, say: o.say }),
  earlyDodge: (id, name, o) => ({ id, type: 'earlyDodge', name, response: 'hold', moves: asList(o.moves), lead: o.lead, say: o.say, ...(o.mild ? { mild: true } : {}) }),
  dodgeBias: (id, name, o) => ({ id, type: 'dodgeBias', name, moves: asList(o.moves), min: o.min ?? 6, share: o.share ?? 0.75, say: o.say }),
  starHoard: (id, name, o) => ({ id, type: 'starHoard', name, hold: o.hold ?? 420, moves: o.moves ? asList(o.moves) : undefined, say: o.say }),
  zoneBias: (id, name, o) => ({ id, type: 'zoneBias', name, mode: o.mode ?? 'streak', streak: o.streak ?? 5, zone: o.zone, frames: o.frames ?? 480, min: o.min, share: o.share, say: o.say, raise: o.raise }),
  buff: (id, name, o) => ({ id, type: 'passivity', name, response: 'buff', frames: o.frames ?? 300, gain: o.gain, decay: o.decay, dmg: o.dmg ?? 0.3, rec: o.rec ?? 0.2, meter: o.meter ?? 'PRIDE', say: o.say }),
  snack: (id, name, o) => ({ id, type: 'passivity', name, response: 'snack', frames: o.frames ?? 360, limit: 1, step: o.step, say: o.say, ...(o.mild ? { mild: true } : {}) }),
  rushing: (id, name, o) => ({ id, type: 'rushing', name, count: o.count ?? 3, span: o.span ?? 150, counter: asList(o.counter), delay: o.delay, say: o.say }),
  comboRepeat: (id, name, o) => ({ id, type: 'comboRepeat', name, counter: asList(o.counter), delay: o.delay ?? 14, gap: o.gap, say: o.say }),
  getUpMash: (id, name, o) => (o.moves
    ? { id, type: 'getUpMash', name, response: 'moves', moves: asList(o.moves), say: o.say }
    : { id, type: 'getUpMash', name, response: 'harder', punches: o.punches ?? 3, mult: o.mult ?? 1.3, say: o.say }),
};

export const S = {
  clock: (id, name, left, steps, o = {}) => ({ id, name, when: { left, ...(o.round ? { round: o.round } : {}) }, say: o.say ?? name + '!', steps }),
  health: (id, name, health, steps, o = {}) => ({ id, name, when: { health }, say: o.say ?? name + '!', steps }),
};

// --- building a remix's knowledge (called by remixed()) -------------------------------------------------------------------
const MOVE = (m) => (m ? m.name.replace(/ \(\d\)$/, '').replace(/\*$/, '') : 'HIS PUNCH');
const names = (ids, moves) => [...new Set(asList(ids).map((id) => MOVE(moves[id])))].join(', ').replace(/, ([^,]*)$/, ' AND $1');
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 'S'}`;
const secs = (f) => Math.round(f / 60);

// the frames of a counter window, from the (quickened) move itself: the last N frames ("late") or the first N ("early")
function windowFrames(x, moves) {
  if (!x.window) return;
  const m = moves[asList(x.trigger.move)[0]];
  if (!m || !m.counterWindow) return;
  const [a, b] = m.counterWindow;
  x.trigger.frames = x.window.late ? [Math.max(a, b - x.window.late + 1), b] : [a, Math.min(b, a + x.window.early - 1)];
}

function scoutExploit(x, moves) {
  const T = x.trigger, E = x.effect, mv = names(T.move, moves), star = E.star || (E.open && E.open.star) ? ', THE FIRST A STAR' : '';
  const when = x.window ? (x.window.late ? ' LATE IN ITS WINDUP' : ' AT THE START OF ITS WINDUP') : ' IN ITS WINDUP';
  const hand = T.height === 'high' ? ' A HEAD SHOT' : T.height === 'low' ? ' A BODY SHOT' : '';
  const side = T.side === 'L' ? ' WITH YOUR LEFT' : T.side === 'R' ? ' WITH YOUR RIGHT' : '';
  if (x.type === 'stunTrigger' && E.stun) return `A COUNTER${hand ? ' (' + hand.trim() + side + ')' : side} ON THE ${mv}${when}: STUNNED FOR ${plural(E.hits, 'HIT')}${star}.`;
  if (x.type === 'patternBreak') return `A COUNTER${hand ? ' (' + hand.trim() + ')' : ''} ON THE ${mv}${when}: ${names(E.cancelMoves, moves)} NEVER COMES${E.star ? ', AND YOU GET A STAR' : ''}.`;
  if (T.on === 'resolved') {
    const verb = { dodged: 'SLIP', ducked: 'DUCK', blocked: 'BLOCK' }[[].concat(T.result)[0]], dir = T.dir === 'L' ? ' TO THE LEFT' : T.dir === 'R' ? ' TO THE RIGHT' : '';
    const hp = T.health ? ` WHEN HE IS BELOW ${Math.round(T.health[1] * 100)}% HEALTH` : '';
    return `${verb} THE ${mv}${dir}${hp}: HE IS OPEN FOR ${plural(E.open.comboLimit, 'HIT')}${star}.`;
  }
  if (T.on === 'passive') return `STAND STILL FOR ${plural(secs(T.frames), 'SECOND')} AND HE STOPS TO ${E.say ? E.say.replace(/!$/, '') : 'SHOW OFF'}: OPEN FOR ${plural(E.script[0].comboLimit, 'HIT')}.`;
  if (T.on === 'getUp') return `HE IS OPEN WHEN HE GETS BACK UP: ${plural(E.open.comboLimit, 'FREE HIT')}${star}.`;
  if (T.on === 'blockStreak') return `BLOCK ${T.n} TIMES IN A ROW AND HE TAKES THE BAIT: OPEN FOR ${plural(E.open.comboLimit, 'HIT')}${star}.`;
  if (x.type === 'starTrigger') return `A STAR PUNCH ON THE ${mv}${when}: A STAR, AND HE IS OPEN FOR ${plural(E.open.comboLimit, 'HIT')}.`;
  if (T.state === 'open') return `A PUNCH${hand ? ' (' + hand.trim() + ')' : ''} WHILE HE ${T.open.toUpperCase()}S: OPEN FOR ${plural(E.open.comboLimit, 'FREE HIT')}${star}.`;
  return x.name;
}

function scoutAnti(a, moves) {
  const ms = a.moves ? names(a.moves, moves) : 'HIS PUNCHES', ans = a.counter ? names(a.counter, moves) : '';
  switch (a.type) {
    case 'jabSpam': return `THROW ${a.streak} PUNCHES IN A ROW AT HIM WHILE HE IS NOT OPEN AND THE NEXT ONE IS PARRIED, THEN ANSWERED WITH ${ans}.`;
    case 'turtling': return a.response === 'drain'
      ? `KEEP YOUR GUARD UP FOR TOO LONG AND YOUR HEARTS DRAIN WHILE YOU BLOCK. BLOCK WHEN HE PUNCHES, NOT BEFORE.`
      : `KEEP YOUR GUARD UP FOR TOO LONG AND THE ${ms} CAN'T BE BLOCKED: SLIP OR DUCK THEM.`;
    case 'earlyDodge': return `DODGE WITH NO PUNCH COMING AND THE ${ms} IS HELD UNTIL YOUR SLIP RUNS OUT. WAIT FOR THE TELL.`;
    case 'dodgeBias': return `SLIP THE SAME WAY OVER AND OVER AND THE ${ms} COME FROM THAT SIDE. SLIP THE OTHER WAY.`;
    case 'starHoard': return `SIT ON THREE STARS FOR ${plural(secs(a.hold), 'SECOND')} AND THE NEXT ${ms === 'HIS PUNCHES' ? 'PUNCH' : ms} TAKES ONE, EVEN IF BLOCKED.`;
    case 'zoneBias': return a.mode === 'round'
      ? `WHERE YOU HIT HIM MOST IN ONE ROUND, HE GUARDS ALL OF THE NEXT. MIX IT UP.`
      : `${a.streak} IN A ROW TO HIS ${(a.zone || 'HEAD OR BODY').toUpperCase()} AND HE GUARDS IT. CHANGE WHERE YOU HIT.`;
    case 'passivity': return a.response === 'snack'
      ? `STAND AROUND FOR ${plural(secs(a.frames), 'SECOND')} AND HE STOPS FOR A MOMENT TO RECOVER (ONCE A ROUND): HIT HIM THEN.`
      : `WAIT AROUND AND HIS ${a.meter} FILLS: HE HITS HARDER AND RECOVERS FASTER. ANY PUNCH OF YOURS DRAINS IT.`;
    case 'rushing': return `PUNCH INTO HIS GUARD ${a.count} TIMES AND HE ANSWERS AT ONCE WITH ${ans}.`;
    case 'comboRepeat': return `REPEAT A COMBO AND HE CATCHES IT AND ANSWERS WITH ${ans}.`;
    case 'getUpMash': return a.response === 'moves' ? `MASH BACK UP AFTER A KNOCKDOWN AND HE GOES STRAIGHT INTO ${names(a.moves, moves)}.` : `MASH BACK UP AFTER A KNOCKDOWN AND HIS NEXT ${a.punches} PUNCHES HIT ${Math.round((a.mult - 1) * 100)}% HARDER.`;
    default: return a.name;
  }
}

// Turn the written entries into what the knowledge layer runs: counter-window frames filled in from the real moves, and a scouting-report
// text for every entry that has none of its own. Returns { exploits, antiStrategies, scriptedMoments } (copies).
export function finishKnowledge(T, moves) {
  const exploits = (T.exploits || []).map((x) => { const y = { ...x, trigger: { ...x.trigger } }; windowFrames(y, moves); y.scout ||= scoutExploit(y, moves); return y; });
  const antiStrategies = (T.antiStrategies || []).map((a) => ({ ...a, scout: a.scout || scoutAnti(a, moves) }));
  const scriptedMoments = (T.scriptedMoments || []).map((s) => ({ ...s }));
  return { exploits, antiStrategies, scriptedMoments };
}
export { scoutExploit, scoutAnti };
