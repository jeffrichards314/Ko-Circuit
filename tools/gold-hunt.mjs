// Can a human-model player earn every Gold (spec §15)? The plain human-model player only plays to win, so it meets a challenge by accident. This tries the
// same player with a plan per kind of challenge (the way a person who has read the scouting report would play):
//   plain / golden   fights as always (the championship test's two profiles)
//   patient          holds its punches through round 1 (lets his moves come round a few times: "duck it twice")
//   patient+golden   ...and takes golden moments
//   nostar           never throws a Star Punch                      (reflection)
//   counter          only ever punches into a windup's counter window (counters, onlyCounters, counterMove)
//   starOnly         no jabs at all, only Star Punches (a star finish, a star knockdown)
//   slow             a jab only every 2 s (maxLanded, noWhiff patience)
//   duck             prefers a duck to a slip wherever both avoid the punch (a Gold that asks for a duck)
//   counterMoves     punches only into the windup of the moves the challenge names (onlyCounters)
//   careful          punches only in his recovery after a defended move (noGuarded, noWhiff, noRepeat: one hand at a time is handled by the bot)
// A Gold is "earnable" when some variant meets it in at least 1 of N fights.   node tools/gold-hunt.mjs [ids...] [--fights N] [--jobs J]
import { fork } from 'node:child_process';
import { cpus } from 'node:os';
import { fileURLToPath } from 'node:url';
import { Fight } from '../src/fight/fightState.js';
import { HumanBot, Memory } from '../src/fight/humanBot.js';
import { FIGHTERS } from '../data/fighters/index.js';
import { medalsFor, speedTarget } from '../data/medals.js';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const N = +opt('--fights', 40);
const ids = args.filter((a, i) => !a.startsWith('--') && !['--fights', '--jobs', '--worker'].includes(args[i - 1]));

export class Hunter extends HumanBot {
  constructor(f, o) { super(f, o); this.v = o.variant; this.sig = f.d.medals.signature; }
  capabilities(P) { const c = super.capabilities(P); if (this.v === 'duck' && c.duck) c.dodge = false; return c; }
  press(...as) {
    if (this.v === 'nostar' || this.v === 'nostarpatient') as = as.filter((a) => a !== 'star');
    super.press(...as);
  }
  jab(high) {
    const O = this.f.opp;
    if (this.v === 'counter' && O.state !== 'windup') return;
    if (this.v === 'counterMoves' && !(O.state === 'hit' || O.state === 'stunned' || (O.state === 'windup' && (this.sig.moves || [this.sig.move]).includes(O.moveId)))) return;
    if (this.v === 'starOnly') return;
    if (this.v === 'slow' && this.f.clock - (this.lastJab ?? -999) < 120) return;
    if (this.v === 'careful' && !(O.state === 'recovery' && O.moveResult !== 'hit')) return;
    this.lastJab = this.f.clock;
    super.jab(high);
  }
  think() {
    if (this.v === 'patient' || this.v === 'patientGolden' || this.v === 'nostarpatient' || this.v === 'duck') this.attack = this.f.round > 1 || this.f.phase !== 'fight';
    super.think();
  }
}
const VARIANTS = [['plain'], ['golden'], ['patient'], ['patientGolden'], ['nostar'], ['nostarpatient'], ['counter'], ['starOnly'], ['slow'], ['careful'], ['duck'], ['counterMoves']];
const goldenOf = (v) => v === 'golden' || v === 'patientGolden' || v === 'counter' || v === 'starOnly' || v === 'careful' || v === 'duck';

function hunt(id) {
  const d = FIGHTERS[id], out = { id, text: d.medals.signature.text, check: d.medals.signature.check, got: {} };
  const mem = new Memory();
  for (let i = 0; i < 12; i++) { // (learn him first)
    const f = new Fight({ fighter: d, audio: null, input: null, opts: {} }); const b = new HumanBot(f, { memory: mem, golden: true }); let r = null; f.opts.onEnd = (x) => { r = x; };
    for (let k = 0; k < 200000 && !r; k++) { b.think(); f.update(); }
  }
  for (const [v] of VARIANTS) {
    let g = 0;
    for (let i = 0; i < N; i++) {
      const f = new Fight({ fighter: d, audio: null, input: null, opts: {} });
      const bot = new Hunter(f, { memory: mem, golden: goldenOf(v), variant: v });
      let res = null; f.opts.onEnd = (x) => { res = x; };
      for (let k = 0; k < 250000 && !res; k++) { bot.think(); f.update(); }
      if (res && medalsFor(d, res, speedTarget).signature) g++;
    }
    out.got[v] = g;
  }
  out.ok = Object.entries(out.got).filter(([, g]) => g > 0).map(([v]) => v);
  return out;
}

if (opt('--worker', null) != null) {
  process.on('message', (list) => { for (const id of list) process.send({ row: hunt(id) }); process.send({ done: true }); });
} else {
  const list = ids.length ? ids : Object.keys(FIGHTERS);
  const J = Math.max(1, +opt('--jobs', Math.max(1, cpus().length - 1)));
  const shards = Array.from({ length: J }, () => []);
  list.forEach((id, i) => shards[i % J].push(id));
  const rows = []; let live = 0;
  await new Promise((res) => {
    for (const sh of shards) {
      if (!sh.length) continue;
      live++;
      const w = fork(fileURLToPath(import.meta.url), [...args, '--worker', '1'], { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] });
      w.on('message', (m) => { if (m.row) rows.push(m.row); else if (m.done) { w.kill(); if (!--live) res(); } });
      w.send(sh);
    }
  });
  const order = Object.keys(FIGHTERS);
  rows.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  let none = 0;
  for (const r of rows) {
    console.log(`${r.id.padEnd(12)} ${r.check.padEnd(12)} ${r.ok.length ? r.ok.map((v) => `${v}:${r.got[v]}`).join(' ') : '*** NO VARIANT ***'}   "${r.text}"`);
    if (!r.ok.length) none++;
  }
  console.log(`\n${rows.length - none}/${rows.length} Golds earned by some plan; ${none} not`);
}
