// Player behavior tracker (knowledge spec K2): what the player does in a fight,
// over a rolling window (the last 20 seconds) and over the whole fight. The
// opponent's anti-strategies (src/fight/knowledge.js) read it, and the fight lab
// shows it live.
//
// Fed by the Fight: frame() every fight frame (reads the Player's state: new
// dodges, blocks, stars held), punch() for every punch that reaches him, and
// knockedDown() / gotUp() for the player's knockdowns.
//
// Time is counted in fight frames (only frames spent in the 'fight' phase), so
// corner breaks and knockdown counts don't dilute the window.
//
// snapshot() -> {
//   jabRate        punches per second (window)
//   headShare      head punches / all non-star punches (window)
//   leftShare      left-hand punches / all non-star punches (window)
//   blockShare     share of window frames spent blocking; blocks (count)
//   dodgeL/dodgeR  dodges each way (window); dodgeShareL: left / all
//   earlyShare     early dodges / dodges (window): a dodge started with a tell still
//                  EARLY_LEAD+ frames from landing, or when nothing was coming
//   passive        seconds since the last punch
//   hoard          seconds at 3 stars without using one (current)
//   counterShare   counters / punches landed (window); freeShare = the rest
//   repeats        repeated punch sequences (window)
//   rush           punches thrown at him while he wasn't open (in his stance, guard, smoke,
//                  or early in a tell) that didn't land, in the last RUSH_WINDOW frames
//                  (never the last punch of a flurry he covered up from)
//   jabStreak      punches in a row (each within STREAK_GAP frames) that weren't
//                  part of an opening's flurry
//   zone           { zone: 'head'|'body', n }: punches in a row to the same zone
//   blockStreak    blocks in a row (no punch or dodge in between)
//   getUps         times the player mashed back up from a knockdown (fight)
//   total          the same counts over the whole fight
// }
//
// strategy() -> { key, score } the one style the player leaned on most over the whole
// fight (STRATEGIES below), or key 'none' if nothing stood out. Dash Maddox saves it
// between fights and opens the next one with the answer to it (src/save/rivalRecord.js).

export const WINDOW = 20 * 60;   // the rolling window: 20 seconds of fight frames
export const EARLY_LEAD = 12;    // a dodge this many frames (or more) before impact is early
export const STREAK_GAP = 40;    // punches this close together count as "in a row"
export const RUSH_WINDOW = 150;  // 2.5 s: recent punches into his guard
const OPENING = new Set(['counter', 'punish', 'taunt', 'open', 'more']);
const RUSH_STATES = ['idle', 'block', 'windup', 'vanish', 'evade'];

export class BehaviorTracker {
  constructor(fight) {
    this.f = fight;
    this.t = 0;              // fight frames so far
    this.ev = [];            // rolling events { t, k, ... }
    this.blockFrames = [];   // window frames spent blocking, bucketed per second: [t0, n]
    this.lastPunch = 0;
    this.hoardFrom = null;
    this.jab = { n: 0, at: -999 };
    this.zone = { zone: null, n: 0 };
    this.blockStreak = 0;
    this.seq = [];           // the current punch combo (keys, within STREAK_GAP)
    this.seqAt = -999;
    this.prevSeq = null;
    this.getUps = 0;
    this.downs = 0;
    this.total = { punches: 0, head: 0, body: 0, left: 0, right: 0, stars: 0, landed: 0, counters: 0, blocks: 0, blockFrames: 0, dodgeL: 0, dodgeR: 0, early: 0, repeats: 0, rushed: 0, maxPassive: 0, maxHoard: 0, spam: 0 };
  }

  // --- feeding ----------------------------------------------------------------
  frame() {
    const f = this.f, P = f.player, O = f.opp;
    this.t++;
    const now = this.t;
    // a new action this frame (the Player updates before the opponent: t === 0)
    if (P.t === 0) {
      if (P.state === 'dodge') {
        const early = isEarly(O);
        this.push({ k: 'dodge', dir: P.dir, early });
        this.total[P.dir < 0 ? 'dodgeL' : 'dodgeR']++;
        if (early) this.total.early++;
        this.blockStreak = 0;
      } else if (P.state === 'block') {
        this.push({ k: 'block' });
        this.total.blocks++;
        this.blockStreak++;
      }
    }
    if (P.state === 'block') {
      this.total.blockFrames++;
      const b = this.blockFrames[this.blockFrames.length - 1];
      const sec = Math.floor(now / 60) * 60;
      if (b && b[0] === sec) b[1]++; else this.blockFrames.push([sec, 1]);
    }
    // stars: holding all three without spending one
    if (P.stars >= 3) { if (this.hoardFrom == null) this.hoardFrom = now; }
    else this.hoardFrom = null;
    this.total.maxHoard = Math.max(this.total.maxHoard, this.hoardFrames());
    this.total.maxPassive = Math.max(this.total.maxPassive, now - this.lastPunch);
    // drop what fell out of the window
    while (this.ev.length && this.ev[0].t < now - WINDOW) this.ev.shift();
    while (this.blockFrames.length && this.blockFrames[0][0] < now - WINDOW) this.blockFrames.shift();
  }

  // A punch reached him. r is the final result; `chain` says whether it was part of
  // an opening (counter, punish, taunt, open step, a flurry's follow-up).
  punch(p, r, state = 'idle') {
    const now = this.t, T = this.total;
    const key = p.star ? 'S' : p.side + (p.high ? 'H' : 'B');
    const opening = r.result === 'hit' && OPENING.has(r.chain);
    const rush = !opening && r.result !== 'hit' && !r.far && RUSH_STATES.includes(state);
    this.push({ k: 'punch', key, star: !!p.star, high: !!p.high, side: p.side, landed: r.result === 'hit', counter: !!r.counter, rush });
    T.punches++;
    if (p.star) T.stars++;
    else { T[p.high ? 'head' : 'body']++; T[p.side === 'L' ? 'left' : 'right']++; }
    if (r.result === 'hit') { T.landed++; if (r.counter) T.counters++; }
    if (rush) T.rushed++;
    // punches in a row that weren't an opening's flurry
    if (opening) this.jab = { n: 0, at: now };
    else this.jab = { n: now - this.jab.at <= STREAK_GAP ? this.jab.n + 1 : 1, at: now };
    if (this.jab.n >= 3) T.spam++;
    // the same zone, in a row
    const z = p.star ? null : p.high ? 'head' : 'body';
    if (z) this.zone = this.zone.zone === z ? { zone: z, n: this.zone.n + 1 } : { zone: z, n: 1 };
    this.blockStreak = 0;
    // combos: a run of punches within STREAK_GAP; the same run twice in a row is a repeat
    if (now - this.seqAt > STREAK_GAP) { if (this.seq.length >= 2) this.prevSeq = this.seq; this.seq = []; }
    this.seq.push(key); this.seqAt = now;
    if (this.prevSeq && this.seq.length === this.prevSeq.length && this.seq.every((k, i) => k === this.prevSeq[i])) {
      T.repeats++; this.push({ k: 'repeat' }); this.prevSeq = null; this.seq = [];
    }
    this.lastPunch = now;
  }
  knockedDown() { this.downs++; }
  gotUp() { this.getUps++; }

  push(e) { e.t = this.t; this.ev.push(e); }

  // --- reading ------------------------------------------------------------------
  hoardFrames() { return this.hoardFrom == null ? 0 : this.t - this.hoardFrom; }
  passiveFrames() { return this.t - this.lastPunch; }
  // blocking share over the last `span` frames (default: the whole window)
  blockShare(span = WINDOW) {
    const from = this.t - span;
    let n = 0;
    for (const [t0, k] of this.blockFrames) if (t0 >= from - 59) n += k;
    return Math.min(1, n / Math.max(60, Math.min(span, this.t)));
  }
  // recent punches into his guard or thin air (not openings)
  rush(span = RUSH_WINDOW) { return this.ev.filter((e) => e.k === 'punch' && e.rush && e.t > this.t - span).length; }
  // dodges in the window, newest last
  dodges(n = 99) { return this.ev.filter((e) => e.k === 'dodge').slice(-n); }
  // the side the player keeps dodging to: 'L' | 'R' | null (min dodges, share)
  dodgeBias(min = 6, share = 0.75) {
    const d = this.dodges(8);
    if (d.length < min) return null;
    const l = d.filter((e) => e.dir < 0).length / d.length;
    return l >= share ? 'L' : 1 - l >= share ? 'R' : null;
  }

  // The whole fight in one word: which of STRATEGIES the player leaned on most.
  // Each is scored against the amount that counts as "leaning on it" (1.0 = right
  // at the line), and the top score over 1 wins.
  // every style scored (1.0 = right at the line), best first: the ones over 1 (ZERO's true form answers your top two)
  ranking() { const sc = this.scores(); return Object.entries(sc).filter(([, v]) => v > 1).sort((a, b) => b[1] - a[1]).map(([k]) => k); }
  strategy() {
    const score = this.scores();
    let key = 'none', best = 1;
    for (const [k, v] of Object.entries(score)) if (v > best) { best = v; key = k; }
    return { key, score: +best.toFixed(2) };
  }
  scores() {
    const T = this.total, secs = Math.max(1, this.t / 60);
    const dodges = T.dodgeL + T.dodgeR, zones = T.head + T.body;
    const rate = T.punches / secs, blockShare = T.blockFrames / Math.max(60, this.t);
    const mash = rate >= 1.8; // a punch every third of a second or so is mashing, whether it lands or bounces
    const score = {
      jab: mash ? rate / 1.8 : 0,
      turtle: blockShare / 0.3,
      early: dodges >= 5 ? T.early / dodges / 0.5 : 0,
      bias: dodges >= 6 ? Math.max(T.dodgeL, T.dodgeR) / dodges / 0.8 : 0,
      hoard: T.maxHoard / 480,
      zone: zones >= 12 ? Math.max(T.head, T.body) / zones / 0.85 : 0,
      passive: (T.maxPassive / 720) * (blockShare >= 0.2 ? 0.3 : 1), // (a turtle isn't waiting: he's blocking)
      rush: mash ? 0 : T.rushed / 8,                                 // (a masher's punches into his guard are the mashing)
      repeat: T.repeats / 3,
    };
    return score;
  }

  snapshot() {
    const E = this.ev, span = Math.max(60, Math.min(WINDOW, this.t));
    const P = E.filter((e) => e.k === 'punch'), N = P.filter((e) => !e.star);
    const D = E.filter((e) => e.k === 'dodge');
    const L = P.filter((e) => e.landed), C = L.filter((e) => e.counter);
    const share = (a, b) => (b ? +(a / b).toFixed(2) : 0);
    return {
      jabRate: +((P.length * 60) / span).toFixed(2),
      headShare: share(N.filter((e) => e.high).length, N.length),
      leftShare: share(N.filter((e) => e.side === 'L').length, N.length),
      blockShare: +this.blockShare().toFixed(2),
      blocks: E.filter((e) => e.k === 'block').length,
      dodgeL: D.filter((e) => e.dir < 0).length,
      dodgeR: D.filter((e) => e.dir > 0).length,
      dodgeShareL: share(D.filter((e) => e.dir < 0).length, D.length),
      earlyShare: share(D.filter((e) => e.early).length, D.length),
      passive: +(this.passiveFrames() / 60).toFixed(1),
      hoard: +(this.hoardFrames() / 60).toFixed(1),
      counterShare: share(C.length, L.length),
      freeShare: share(L.length - C.length, L.length),
      repeats: E.filter((e) => e.k === 'repeat').length,
      rush: this.rush(),
      jabStreak: this.t - this.jab.at <= STREAK_GAP ? this.jab.n : 0,
      zone: { ...this.zone },
      blockStreak: this.blockStreak,
      getUps: this.getUps,
      total: { ...this.total },
    };
  }
}

// A dodge started now: early if his punch is still EARLY_LEAD+ frames away, or if
// no tell has started yet (he's idle, recovering between combo links, showing off).
function isEarly(O, lead = EARLY_LEAD) {
  if (O.state === 'windup' && O.move) return O.move.call ? true : O.move.windupFrames - O.moveT >= lead;
  return ['idle', 'recovery', 'block', 'taunt', 'open', 'backstep', 'advance'].includes(O.state);
}
export { isEarly };
export const STRATEGIES = ['jab', 'turtle', 'early', 'bias', 'hoard', 'zone', 'passive', 'rush', 'repeat'];
