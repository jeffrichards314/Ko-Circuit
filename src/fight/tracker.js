// Fight telemetry for the medals (§15): what happened in a fight, in a
// form the signature checks (data/medals.js) can read after it's over.
//   cues      every sound the fight played, by name, and every gimmick event
//             (Fight.event) as '!name': '!read', '!parry', '!teleport', '!hatClang',
//             '!crowdFull', '!possumTrap', '!kneel'
//   opens     open steps by id: { done, broken } (Gus's burger, a flex, a crash)
//   moves     his punches by move id: { hit, blocked, dodged, ducked, feint, countered }
//   punches   the player's punches: thrown / landed / body / head / whiffed /
//             guarded (into his guard) / stars; repeats (the same punch twice in a row)
//   kds       his knockdowns: { round, by: 'perfect' | 'star' | 'counter' | 'punch' }
// Counted whatever the mode; only Career fights (replays and podium rematches included) turn it into medals.
export class FightTracker {
  constructor() {
    this.cues = {};
    this.opens = {};
    this.moves = {};
    this.punches = { thrown: 0, landed: 0, body: 0, head: 0, whiffed: 0, guarded: 0, stars: 0, counters: 0, repeats: 0, free: 0 };
    this.kds = [];
    this.lastKey = null;
    this.lastLanded = null;
  }
  cue(name) { this.cues[name] = (this.cues[name] || 0) + 1; }
  move(id) { const k = id.replace(/\*$/, ''); return (this.moves[k] ||= { hit: 0, blocked: 0, dodged: 0, ducked: 0, feint: 0, countered: 0 }); }
  // the opponent's executor hooks (openDone, openBroken, moveResolved)
  hook(name, a, b) {
    if (name === 'openDone' || name === 'openBroken') {
      const o = (this.opens[a.id || a.anim || 'open'] ||= { done: 0, broken: 0 });
      o[name === 'openDone' ? 'done' : 'broken']++;
    } else if (name === 'moveResolved' && a && a.id) this.move(a.id)[b] = (this.move(a.id)[b] || 0) + 1;
  }
  // a player punch and its result; `countering` = the move he was winding up
  punch(p, r, countering) {
    const P = this.punches;
    P.thrown++;
    const key = p.star ? 'S' : p.side + (p.high ? 'H' : 'B');
    if (key === this.lastKey) P.repeats++;
    this.lastKey = key;
    if (p.star) P.stars++;
    if (r.result === 'hit') {
      P.landed++;
      if (p.high || p.star) P.head++; else P.body++;
      // a hit that didn't come from a counter or the flurry one starts (a plain hit, a punish, a taunt, an open step)
      if (!r.counter && !['more', 'counter'].includes(r.chain)) P.free++;
      if (r.counter) { P.counters++; if (countering) this.move(countering).countered++; }
      this.lastLanded = { star: !!p.star, counter: !!r.counter, perfect: !!r.knockdown };
    } else if (r.result === 'blocked') P.guarded++;
    else P.whiffed++;
  }
  knockdown(round) {
    const L = this.lastLanded || {};
    this.kds.push({ round, by: L.perfect ? 'perfect' : L.star ? 'star' : L.counter ? 'counter' : 'punch' });
  }
  summary() {
    return { cues: { ...this.cues }, opens: JSON.parse(JSON.stringify(this.opens)), moves: JSON.parse(JSON.stringify(this.moves)), punches: { ...this.punches }, kds: this.kds.slice() };
  }
}
