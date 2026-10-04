// Web Audio chiptune synth with NES-style channels:
//   p1, p2  pulse (duty 12.5 / 25 / 50 %)
//   tri     triangle
//   noise   15-bit LFSR noise (long and short modes)
// Songs are MML-like note strings (see /data/music). SFX are small scripted
// sequences on their own voices.
//
// MML: t<bpm> o<oct> > < l<len> v<0-15> @<duty 0-2> q<gate 1-8>
//      notes c d e f g a b (+/# sharp, - flat) [len][.]  r = rest  ^len = tie
//      [ ... ]n = repeat n times   | = bar line (ignored)
//      noise channel drums: k kick, s snare, h hat, x crash

const DUTIES = [0.125, 0.25, 0.5];
const NOTE = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };

export function parseMML(src, { tempo = 120, drums = false } = {}) {
  const events = [];
  let t = 0, oct = 4, len = 8, vol = 10, duty = 1, gate = 7;
  let i = 0;
  const s = src.replace(/\|/g, ' ');
  const num = () => {
    const m = /^\d+/.exec(s.slice(i));
    if (!m) return null;
    i += m[0].length;
    return +m[0];
  };
  const dots = (d) => { let x = d, add = d / 2; while (s[i] === '.') { x += add; add /= 2; i++; } return x; };
  const beats = (l) => 4 / l;
  const stack = [];
  const out = [];
  function emit(ev) { out.push(ev); }
  while (i < s.length) {
    const ch = s[i++].toLowerCase();
    if (/\s/.test(ch)) continue;
    if (ch === 't') { tempo = num() || tempo; continue; }
    if (ch === 'o') { oct = num() ?? oct; continue; }
    if (ch === '>') { oct++; continue; }
    if (ch === '<') { oct--; continue; }
    if (ch === 'l') { len = num() || len; continue; }
    if (ch === 'v') { vol = num() ?? vol; continue; }
    if (ch === '@') { duty = num() ?? duty; continue; }
    if (ch === 'q') { gate = num() ?? gate; continue; }
    if (ch === '[') { stack.push(out.length); continue; }
    if (ch === ']') {
      const n = num() || 2;
      const start = stack.pop();
      const body = out.slice(start);
      for (let r = 1; r < n; r++) for (const e of body) out.push({ ...e });
      continue;
    }
    if (ch === '^') {
      const d = dots(beats(num() || len));
      const last = out[out.length - 1];
      if (last) last.beats += d;
      continue;
    }
    if (ch === 'r') { emit({ rest: true, beats: dots(beats(num() || len)) }); continue; }
    if (drums && 'kshx'.includes(ch)) { emit({ drum: ch, beats: dots(beats(num() || len)), vol }); continue; }
    if (ch in NOTE) {
      let semi = NOTE[ch];
      while (s[i] === '+' || s[i] === '#' || s[i] === '-') { semi += s[i] === '-' ? -1 : 1; i++; }
      const b = dots(beats(num() || len));
      const midi = 12 * (oct + 1) + semi;
      emit({ midi, beats: b, vol, duty, gate });
      continue;
    }
  }
  // lay out in time
  const spb = 60 / tempo;
  for (const e of out) {
    const dur = e.beats * spb;
    if (!e.rest) events.push({ ...e, t, dur });
    t += dur;
  }
  return { events, length: t, tempo };
}

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

export class Audio {
  constructor() {
    this.ctx = null;
    this.song = null;
    this.musicVol = 0.6;
    this.sfxVol = 0.8;
    this.muted = false;
  }

  // (app in the background / phone upright: the clock stops with the sound, so the music picks up where it was)
  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend().catch(() => {}); }
  resume() { if (this.ctx && this.ctx.state !== 'running' && this.ctx.state !== 'closed') this.ctx.resume().catch(() => {}); }

  unlock() {
    // (iOS: play through the speaker even with the ring switch on silent, where the browser has this)
    try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch { /* not there */ }
    if (this.ctx) { if (this.ctx.state !== 'running') this.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.5; this.master.connect(ctx.destination);
    this.musicBus = ctx.createGain(); this.musicBus.gain.value = this.musicVol; this.musicBus.connect(this.master);
    this.sfxBus = ctx.createGain(); this.sfxBus.gain.value = this.sfxVol; this.sfxBus.connect(this.master);
    this.waves = DUTIES.map((d) => pulseWave(ctx, d));
    this.noiseLong = noiseBuffer(ctx, false);
    this.noiseShort = noiseBuffer(ctx, true);
    this.timer = setInterval(() => this.schedule(), 25);
    if (this.pending) { const p = this.pending; this.pending = null; this.play(p); }
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.5;
  }

  // Mixer (Options): music and effects bus levels, 0-1.
  setVolumes(music, sfx) {
    this.musicVol = 0.85 * music; this.sfxVol = sfx;
    if (this.musicBus) { this.musicBus.gain.value = this.musicVol; this.sfxBus.gain.value = this.sfxVol; }
  }

  // --- music -------------------------------------------------------------
  play(song) {
    if (!this.ctx) { this.pending = song; return; }
    if (this.song && this.song.def === song) return;
    this.stop();
    const tracks = {};
    let length = 0;
    for (const [ch, def] of Object.entries(song.channels)) {
      const parsed = parseMML(def.mml, { tempo: song.tempo, drums: ch === 'noise' });
      tracks[ch] = { ...def, events: parsed.events, idx: 0 };
      length = Math.max(length, parsed.length);
    }
    const gain = this.ctx.createGain();
    gain.gain.value = song.volume ?? 1;
    gain.connect(this.musicBus);
    const start = this.ctx.currentTime + 0.06;
    this.song = { def: song, tracks, length, start, origin: start, loop: song.loop !== false, gain, done: false };
    this.schedule();
  }

  stop() {
    if (!this.song) return;
    const g = this.song.gain;
    try { g.gain.setValueAtTime(g.gain.value, this.ctx.currentTime); g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.05); } catch { /* closed */ }
    setTimeout(() => g.disconnect(), 200);
    this.song = null;
  }

  schedule() {
    const S = this.song;
    if (!S || !this.ctx) return;
    const horizon = this.ctx.currentTime + 0.15;
    for (;;) {
      let any = false;
      for (const [ch, tr] of Object.entries(S.tracks)) {
        while (tr.idx < tr.events.length && S.start + tr.events[tr.idx].t < horizon) {
          const e = tr.events[tr.idx++];
          const when = S.start + e.t;
          if (when >= this.ctx.currentTime - 0.02) this.voice(ch, tr, e, when, S.gain);
          any = true;
        }
      }
      const allDone = Object.values(S.tracks).every((tr) => tr.idx >= tr.events.length);
      if (allDone && S.start + S.length < horizon) {
        if (!S.loop) { S.done = true; return; }
        S.start += S.length;
        for (const tr of Object.values(S.tracks)) tr.idx = 0;
        continue;
      }
      if (!any) break;
    }
  }

  voice(ch, tr, e, when, dest) {
    const ctx = this.ctx;
    if (ch === 'noise') return this.drum(e.drum, when, (e.vol / 15) * (tr.gain ?? 1), dest);
    const g = ctx.createGain();
    const peak = (e.vol / 15) * 0.22 * (tr.gain ?? 1);
    const len = e.dur * (e.gate / 8);
    const env = tr.env || { decay: 0.35, sustain: 0.55 };
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(peak, when + 0.004);
    g.gain.setTargetAtTime(peak * env.sustain, when + 0.01, env.decay);
    const held = peak * env.sustain + (peak - peak * env.sustain) * Math.exp(-Math.max(0, len - 0.01) / env.decay);
    g.gain.setValueAtTime(held, when + len);
    g.gain.setTargetAtTime(0, when + len, 0.012);
    g.connect(dest);
    const o = ctx.createOscillator();
    if (ch === 'tri') o.type = 'triangle';
    else o.setPeriodicWave(this.waves[tr.duty ?? e.duty] || this.waves[1]);
    o.frequency.setValueAtTime(mtof(e.midi), when);
    if (tr.vibrato && len > 0.2) {
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 6; lg.gain.value = mtof(e.midi) * 0.006;
      lfo.connect(lg); lg.connect(o.frequency);
      lfo.start(when + 0.12); lfo.stop(when + len + 0.1);
    }
    o.connect(g);
    o.start(when); o.stop(when + len + 0.1);
  }

  drum(kind, when, vol, dest) {
    const ctx = this.ctx;
    if (kind === 'k') {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(160, when);
      o.frequency.exponentialRampToValueAtTime(45, when + 0.12);
      g.gain.setValueAtTime(0.5 * vol, when);
      g.gain.exponentialRampToValueAtTime(0.001, when + 0.16);
      o.connect(g); g.connect(dest); o.start(when); o.stop(when + 0.2);
      this.noise(when, 0.03, 0.12 * vol, 0.5, false, dest);
    } else if (kind === 's') this.noise(when, 0.13, 0.32 * vol, 0.9, false, dest);
    else if (kind === 'h') this.noise(when, 0.035, 0.14 * vol, 2.2, false, dest);
    else if (kind === 'x') this.noise(when, 0.45, 0.2 * vol, 1.6, false, dest);
  }

  noise(when, dur, vol, rate = 1, short = false, dest = this.sfxBus, rateEnd = null) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = short ? this.noiseShort : this.noiseLong;
    src.loop = true;
    src.playbackRate.setValueAtTime(rate, when);
    if (rateEnd) src.playbackRate.exponentialRampToValueAtTime(rateEnd, when + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    src.connect(g); g.connect(dest);
    src.start(when, Math.random() * 0.5); src.stop(when + dur + 0.02);
  }

  tone(when, dur, f0, f1, vol, { duty = 1, type = null, dest = this.sfxBus, curve = 'exp' } = {}) {
    const ctx = this.ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    if (type) o.type = type; else o.setPeriodicWave(this.waves[duty]);
    o.frequency.setValueAtTime(f0, when);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, when + dur);
    g.gain.setValueAtTime(vol, when);
    if (curve === 'exp') g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    else { g.gain.setValueAtTime(vol, when + dur - 0.01); g.gain.linearRampToValueAtTime(0, when + dur); }
    o.connect(g); g.connect(dest);
    o.start(when); o.stop(when + dur + 0.02);
  }

  // Seconds since `song` started playing (monotonic across loops), or null if
  // it isn't the song playing right now. Beat-synced gimmicks read this so the
  // game follows the music's own clock, not the frame counter.
  songTime(song) {
    if (!this.ctx || !this.song || this.song.def !== song || this.ctx.state !== 'running') return null;
    return this.ctx.currentTime - this.song.origin;
  }
  // Audio-clock time of a point `t` seconds into the current song.
  songAt(t) { return this.song ? this.song.origin + t : 0; }

  // --- sound effects -------------------------------------------------------
  sfx(name, arg) {
    if (!this.ctx) return;
    const fn = SFX[name];
    if (fn) fn(this, this.ctx.currentTime + 0.005, arg);
  }
  // Schedule an effect at an exact audio-clock time (sample-accurate, e.g. on a beat).
  sfxAt(name, when, arg) {
    if (!this.ctx) return;
    const fn = SFX[name];
    if (fn) fn(this, Math.max(this.ctx.currentTime + 0.002, when), arg);
  }
}

// Every effect is a tiny script over tone()/noise().
const SFX = {
  punchLand(a, t) { a.noise(t, 0.09, 0.45, 0.7); a.tone(t, 0.12, 190, 55, 0.35, { type: 'triangle' }); },
  punchHeavy(a, t) { a.noise(t, 0.16, 0.55, 0.5); a.tone(t, 0.2, 150, 40, 0.45, { type: 'triangle' }); },
  punchBlock(a, t) { a.noise(t, 0.05, 0.3, 1.8, true); a.tone(t, 0.06, 520, 380, 0.12, { duty: 0 }); },
  whiff(a, t) { a.noise(t, 0.12, 0.16, 2.4, false, a.sfxBus, 0.8); },
  dodge(a, t) { a.noise(t, 0.14, 0.14, 0.9, false, a.sfxBus, 2.6); },
  playerHit(a, t) { a.noise(t, 0.14, 0.5, 0.45); a.tone(t, 0.18, 120, 50, 0.4, { type: 'triangle' }); a.tone(t, 0.1, 300, 150, 0.1, { duty: 2 }); },
  star(a, t) { [1047, 1319, 1568, 2093].forEach((f, i) => a.tone(t + i * 0.055, 0.09, f, f, 0.14, { duty: 1, curve: 'lin' })); },
  starLost(a, t) { [1568, 1175, 880].forEach((f, i) => a.tone(t + i * 0.06, 0.08, f, f, 0.1, { duty: 0, curve: 'lin' })); },
  starWind(a, t) { a.tone(t, 0.3, 200, 900, 0.12, { duty: 0 }); },
  starPunch(a, t) { a.noise(t, 0.3, 0.6, 0.4); a.tone(t, 0.3, 110, 30, 0.55, { type: 'triangle' }); a.tone(t, 0.15, 900, 300, 0.12, { duty: 2 }); },
  bell(a, t, n = 1) {
    for (let i = 0; i < n; i++) {
      a.tone(t + i * 0.22, 0.7, 1760, 1760, 0.16, { duty: 2 });
      a.tone(t + i * 0.22, 0.7, 2637, 2637, 0.07, { duty: 0 });
    }
  },
  count(a, t) { a.tone(t, 0.12, 660, 660, 0.14, { duty: 1, curve: 'lin' }); },
  crowd(a, t, big) { const g = a.crowdGain ?? 1; a.noise(t, big ? 1.4 : 0.8, (big ? 0.22 : 0.14) * g, 0.35, false, a.sfxBus, 0.25); a.noise(t + 0.05, big ? 1.2 : 0.7, 0.08 * g, 0.9); },
  knockdown(a, t) { a.tone(t, 0.45, 180, 35, 0.55, { type: 'triangle' }); a.noise(t, 0.4, 0.45, 0.3); },
  heartOut(a, t) { [660, 520, 400, 300].forEach((f, i) => a.tone(t + i * 0.08, 0.08, f, f, 0.12, { duty: 0, curve: 'lin' })); },
  heartBack(a, t) { [400, 600].forEach((f, i) => a.tone(t + i * 0.06, 0.06, f, f, 0.1, { duty: 1, curve: 'lin' })); },
  menu(a, t) { a.tone(t, 0.05, 990, 990, 0.1, { duty: 1, curve: 'lin' }); },
  confirm(a, t) { a.tone(t, 0.06, 880, 880, 0.12, { duty: 1, curve: 'lin' }); a.tone(t + 0.06, 0.1, 1320, 1320, 0.12, { duty: 1, curve: 'lin' }); },
  mash(a, t) { a.tone(t, 0.03, 700 + Math.random() * 200, 500, 0.07, { duty: 0 }); },
  // Barney's audio tells
  squeak(a, t) { a.tone(t, 0.09, 1300, 1900, 0.11, { duty: 0 }); a.tone(t + 0.12, 0.09, 1300, 1900, 0.11, { duty: 0 }); },
  grunt(a, t) { a.tone(t, 0.1, 160, 110, 0.18, { duty: 2 }); },
  swingHeavy(a, t) { a.noise(t, 0.22, 0.2, 0.5, false, a.sfxBus, 1.8); },
  tired(a, t) { a.tone(t, 0.25, 300, 180, 0.07, { duty: 0 }); },
  // Phase 2 tells and gimmicks
  zap(a, t) { for (let i = 0; i < 5; i++) a.tone(t + i * 0.035, 0.03, 1800 + (i % 2) * 900, 600, 0.08, { duty: 0 }); a.noise(t, 0.18, 0.08, 3, true); },
  pant(a, t) { a.noise(t, 0.12, 0.09, 1.4, false, a.sfxBus, 0.7); a.noise(t + 0.2, 0.14, 0.07, 1.2, false, a.sfxBus, 0.6); },
  whistle(a, t) { a.tone(t, 0.14, 2350, 2350, 0.09, { duty: 1, curve: 'lin' }); a.tone(t + 0.16, 0.08, 2350, 2600, 0.08, { duty: 1 }); },
  bikeBell(a, t) { for (let i = 0; i < 2; i++) { a.tone(t + i * 0.16, 0.14, 2093, 2093, 0.1, { duty: 2 }); a.tone(t + i * 0.16, 0.14, 2637, 2637, 0.05, { duty: 0 }); } },
  sizzle(a, t) { a.noise(t, 0.35, 0.12, 2.8, true, a.sfxBus, 1.6); },
  chomp(a, t) { a.noise(t, 0.05, 0.25, 0.8); a.tone(t, 0.06, 220, 140, 0.12, { type: 'triangle' }); },
  clang(a, t) { a.tone(t, 0.35, 1480, 1400, 0.14, { duty: 0 }); a.tone(t, 0.3, 2210, 2150, 0.08, { duty: 1 }); a.noise(t, 0.04, 0.2, 2); },
  poof(a, t) { a.noise(t, 0.3, 0.22, 0.6, false, a.sfxBus, 2.4); a.tone(t, 0.12, 400, 900, 0.06, { duty: 0 }); },
  chime(a, t) { [1568, 2093, 2637].forEach((f, i) => a.tone(t + i * 0.05, 0.16, f, f, 0.08, { duty: 0, curve: 'lin' })); },
  aha(a, t) { a.tone(t, 0.07, 880, 880, 0.12, { duty: 1, curve: 'lin' }); a.tone(t + 0.08, 0.14, 1760, 1760, 0.12, { duty: 1, curve: 'lin' }); },
  thud(a, t) { a.tone(t, 0.12, 90, 50, 0.3, { type: 'triangle' }); a.noise(t, 0.05, 0.15, 0.4); },
  wrench(a, t) { a.tone(t, 0.05, 900, 1200, 0.08, { duty: 0 }); a.tone(t + 0.07, 0.05, 900, 1200, 0.08, { duty: 0 }); a.tone(t + 0.14, 0.05, 900, 1200, 0.08, { duty: 0 }); },
  tick(a, t) { a.tone(t, 0.03, 1200, 1200, 0.07, { duty: 0, curve: 'lin' }); },
  // Phase 3 tells and gimmicks
  signal(a, t) { a.tone(t, 0.06, 1175, 1175, 0.09, { duty: 1, curve: 'lin' }); a.tone(t + 0.08, 0.06, 1175, 1175, 0.09, { duty: 1, curve: 'lin' }); },
  carHorn(a, t) { a.tone(t, 0.22, 392, 392, 0.1, { duty: 2, curve: 'lin' }); a.tone(t, 0.22, 494, 494, 0.07, { duty: 1, curve: 'lin' }); },
  coo(a, t) { a.tone(t, 0.1, 520, 440, 0.1, { type: 'triangle' }); a.tone(t + 0.11, 0.16, 470, 390, 0.1, { type: 'triangle' }); },
  squeegee(a, t) { a.tone(t, 0.18, 1600, 2400, 0.06, { duty: 0 }); a.tone(t + 0.2, 0.12, 2400, 1700, 0.05, { duty: 0 }); },
  fanfare(a, t) { [523, 659, 784, 1047].forEach((f, i) => a.tone(t + i * 0.07, i === 3 ? 0.3 : 0.08, f, f, 0.1, { duty: 2, curve: 'lin' })); },
  scratch(a, t) { a.noise(t, 0.07, 0.22, 1.6, false, a.sfxBus, 3.2); a.noise(t + 0.08, 0.07, 0.2, 3.2, false, a.sfxBus, 1.4); },
  airhorn(a, t) { for (let i = 0; i < 3; i++) { const w = t + i * 0.09; a.tone(w, 0.08, 740, 720, 0.08, { duty: 2, curve: 'lin' }); a.tone(w, 0.08, 1110, 1080, 0.05, { duty: 1, curve: 'lin' }); } },
  wobble(a, t) { for (let i = 0; i < 4; i++) a.tone(t + i * 0.05, 0.05, i % 2 ? 70 : 55, i % 2 ? 55 : 70, 0.3, { type: 'triangle' }); },
  foghorn(a, t) { a.tone(t, 0.5, 98, 92, 0.22, { duty: 2, curve: 'lin' }); a.tone(t, 0.5, 147, 139, 0.08, { duty: 1, curve: 'lin' }); },
  creak(a, t) { a.tone(t, 0.25, 180, 260, 0.05, { duty: 0 }); },
  lightsOff(a, t) { a.tone(t, 0.04, 1800, 1800, 0.1, { duty: 1, curve: 'lin' }); a.noise(t, 0.04, 0.2, 2.5); a.tone(t + 0.05, 0.4, 120, 40, 0.15, { type: 'triangle' }); },
  lightsOn(a, t) { for (let i = 0; i < 3; i++) a.noise(t + i * 0.07, 0.03, 0.12, 2.8, true); a.tone(t + 0.2, 0.25, 60, 60, 0.06, { duty: 1, curve: 'lin' }); },
  snap(a, t) { a.noise(t, 0.03, 0.35, 3); a.tone(t, 0.02, 2600, 1800, 0.08, { duty: 0 }); },
  powerUp(a, t) { a.tone(t, 0.35, 110, 440, 0.14, { duty: 2 }); a.tone(t + 0.05, 0.3, 220, 880, 0.06, { duty: 0 }); },
  deflate(a, t) { a.tone(t, 0.3, 500, 90, 0.1, { duty: 0 }); },
  honk(a, t) { for (let i = 0; i < 2; i++) { a.tone(t + i * 0.13, 0.1, 330 + i * 110, 330 + i * 110, 0.14, { duty: 2, curve: 'lin' }); a.noise(t + i * 0.13, 0.06, 0.05, 0.6); } },
  squeak(a, t) { a.tone(t, 0.07, 1500, 2300, 0.1, { duty: 0 }); a.tone(t + 0.1, 0.12, 2300, 1100, 0.08, { duty: 0 }); },
  whoosh(a, t) { a.noise(t, 0.3, 0.14, 0.6, false, a.sfxBus, 2.8); },
  wheelStart(a, t) { a.tone(t, 0.2, 300, 900, 0.08, { duty: 1 }); },
  ding(a, t) { a.tone(t, 0.5, 1568, 1568, 0.12, { duty: 2 }); a.tone(t, 0.5, 2349, 2349, 0.05, { duty: 0 }); },
  spotOn(a, t) { a.noise(t, 0.06, 0.3, 0.5); a.tone(t, 0.6, 60, 60, 0.12, { duty: 2, curve: 'lin' }); },
  whip(a, t) { a.noise(t, 0.06, 0.35, 2.8, false, a.sfxBus, 0.8); a.tone(t + 0.04, 0.03, 2800, 1500, 0.08, { duty: 0 }); },
  airhornDouble(a, t) { for (let i = 0; i < 4; i++) { const w = t + i * 0.075 + (i > 1 ? 0.06 : 0); a.tone(w, 0.06, 740, 720, 0.08, { duty: 2, curve: 'lin' }); a.tone(w, 0.06, 1110, 1080, 0.05, { duty: 1, curve: 'lin' }); } },
  rewind(a, t) { a.tone(t, 0.26, 1800, 160, 0.1, { duty: 0 }); a.noise(t, 0.26, 0.12, 3, false, a.sfxBus, 0.4); },
  drumroll(a, t) { for (let i = 0; i < 8; i++) a.noise(t + i * 0.035, 0.03, 0.12 + i * 0.015, 1.2); },
  // Phase 4 tells and gimmicks
  truckHorn(a, t) { for (const [w, d] of [[0, 0.22], [0.26, 0.4]]) { a.tone(t + w, d, 175, 172, 0.16, { duty: 2, curve: 'lin' }); a.tone(t + w, d, 220, 216, 0.1, { duty: 1, curve: 'lin' }); a.tone(t + w, d, 262, 258, 0.05, { duty: 0, curve: 'lin' }); } },
  engine(a, t) { a.tone(t, 0.18, 70, 140, 0.16, { duty: 2 }); a.tone(t + 0.18, 0.2, 140, 95, 0.12, { duty: 2 }); a.noise(t, 0.35, 0.06, 0.5); },
  crash(a, t) { a.noise(t, 0.5, 0.5, 0.35); a.tone(t, 0.4, 120, 40, 0.4, { type: 'triangle' }); for (let i = 0; i < 5; i++) a.tone(t + 0.08 + i * 0.07, 0.05, 330 - i * 30, 300 - i * 30, 0.06, { duty: 0 }); },
  stance(a, t) { a.noise(t, 0.08, 0.18, 1.6, false, a.sfxBus, 3); a.tone(t + 0.1, 0.05, 660, 880, 0.1, { duty: 1 }); a.noise(t + 0.16, 0.04, 0.2, 0.9); },
  stitch(a, t) { for (let i = 0; i < 3; i++) a.tone(t + i * 0.09, 0.05, 2400, 1600, 0.06, { duty: 0 }); },
  parry(a, t) { a.tone(t, 0.18, 2637, 2600, 0.14, { duty: 0 }); a.tone(t, 0.12, 3520, 3400, 0.06, { duty: 1 }); a.noise(t, 0.03, 0.2, 3, true); },
  engarde(a, t) { a.tone(t, 0.06, 1760, 1760, 0.08, { duty: 0, curve: 'lin' }); a.tone(t + 0.08, 0.14, 2349, 2349, 0.08, { duty: 0, curve: 'lin' }); },
  timber(a, t) { a.tone(t, 0.16, 330, 300, 0.14, { duty: 2, curve: 'lin' }); a.tone(t + 0.2, 0.34, 262, 196, 0.14, { duty: 2 }); },
  chop(a, t) { a.noise(t, 0.05, 0.4, 0.7); a.tone(t, 0.05, 700, 300, 0.1, { duty: 0 }); },
  creakBig(a, t) { a.tone(t, 0.4, 140, 210, 0.08, { duty: 0 }); a.tone(t + 0.3, 0.3, 200, 120, 0.06, { duty: 0 }); },
  gust(a, t) { a.noise(t, 0.45, 0.18, 0.5, false, a.sfxBus, 1.9); a.tone(t, 0.45, 300, 520, 0.03, { type: 'triangle' }); },
  ice(a, t) { a.tone(t, 0.12, 3136, 3000, 0.08, { duty: 0 }); a.tone(t, 0.08, 1568, 1500, 0.06, { duty: 1 }); a.noise(t, 0.03, 0.12, 2.8, true); },
  shatter(a, t) { for (let i = 0; i < 6; i++) a.tone(t + i * 0.03, 0.06, 2600 + ((i * 739) % 1400), 1800, 0.05, { duty: 0 }); a.noise(t, 0.25, 0.25, 2.4, true); },
  groan(a, t) { a.tone(t, 0.6, 82, 70, 0.18, { duty: 2, curve: 'lin' }); a.tone(t, 0.6, 123, 104, 0.05, { duty: 1, curve: 'lin' }); },
  tempoUp(a, t) { a.tone(t, 0.03, 1760, 1760, 0.1, { duty: 1, curve: 'lin' }); a.tone(t + 0.12, 0.03, 1319, 1319, 0.1, { duty: 1, curve: 'lin' }); a.tone(t + 0.24, 0.12, 2093, 2093, 0.1, { duty: 1, curve: 'lin' }); },
  baton(a, t) { a.tone(t, 0.02, 3000, 3000, 0.1, { duty: 0, curve: 'lin' }); a.tone(t + 0.06, 0.02, 3000, 3000, 0.1, { duty: 0, curve: 'lin' }); },
  cymbal(a, t) { a.noise(t, 0.6, 0.18, 2.2, true, a.sfxBus, 1.4); },
  thunder(a, t) { a.noise(t, 0.05, 0.35, 3); a.noise(t + 0.04, 0.9, 0.3, 0.3, false, a.sfxBus, 0.12); a.tone(t + 0.04, 0.6, 60, 35, 0.2, { type: 'triangle' }); },
  crackle(a, t) { for (let i = 0; i < 4; i++) a.noise(t + i * 0.04, 0.02, 0.15, 2.6, true); },
  splash(a, t) { a.noise(t, 0.2, 0.25, 1.4, false, a.sfxBus, 0.5); a.tone(t, 0.1, 900, 400, 0.05, { duty: 0 }); },
  drip(a, t) { a.tone(t, 0.06, 1400, 2400, 0.08, { type: 'triangle' }); },
  spin(a, t) { a.noise(t, 0.16, 0.2, 0.5, false, a.sfxBus, 2.6); a.tone(t, 0.14, 300, 600, 0.04, { duty: 0 }); },
  crunch(a, t) { a.noise(t, 0.09, 0.3, 1.1, true); a.noise(t + 0.05, 0.07, 0.2, 0.7, true); },
  rumble(a, t) { a.noise(t, 1.1, 0.4, 0.25, false, a.sfxBus, 0.1); a.tone(t, 1, 55, 40, 0.22, { type: 'triangle' }); },
  roar(a, t) { a.tone(t, 0.45, 180, 110, 0.14, { duty: 2 }); a.noise(t, 0.45, 0.18, 0.6, false, a.sfxBus, 0.3); },
  // Phase 5 tells and gimmicks
  oof(a, t) { a.tone(t, 0.12, 330, 220, 0.14, { duty: 2 }); a.tone(t + 0.14, 0.3, 240, 150, 0.12, { duty: 2 }); },
  gotcha(a, t) { a.tone(t, 0.06, 523, 523, 0.12, { duty: 1, curve: 'lin' }); a.tone(t + 0.07, 0.06, 659, 659, 0.12, { duty: 1, curve: 'lin' }); a.tone(t + 0.14, 0.16, 988, 988, 0.12, { duty: 1, curve: 'lin' }); },
  snort(a, t) { a.noise(t, 0.1, 0.22, 1.2, false, a.sfxBus, 0.5); a.tone(t, 0.08, 200, 140, 0.08, { duty: 2 }); },
  glass(a, t) { a.tone(t, 0.14, 2794, 2794, 0.07, { duty: 0 }); a.tone(t + 0.03, 0.12, 3729, 3729, 0.05, { duty: 0 }); },
  zip(a, t) { a.noise(t, 0.08, 0.18, 1.2, false, a.sfxBus, 3.2); a.tone(t, 0.07, 800, 2400, 0.05, { duty: 0 }); },
  charge(a, t) { a.tone(t, 0.3, 200, 1600, 0.08, { duty: 0 }); a.noise(t + 0.2, 0.1, 0.12, 2, true); },
  whistleDown(a, t) { a.tone(t, 0.32, 2400, 700, 0.07, { duty: 1 }); },
  spurs(a, t) { a.tone(t, 0.05, 3136, 3000, 0.06, { duty: 0 }); a.tone(t + 0.06, 0.05, 3520, 3300, 0.05, { duty: 0 }); },
  cock(a, t) { a.noise(t, 0.03, 0.3, 2.6, true); a.noise(t + 0.08, 0.03, 0.3, 2, true); },
  gunshot(a, t) { a.noise(t, 0.02, 0.5, 3); a.noise(t + 0.01, 0.3, 0.4, 0.6, false, a.sfxBus, 0.2); a.tone(t, 0.1, 220, 60, 0.2, { type: 'triangle' }); },
  highNoon(a, t) { a.tone(t, 0.18, 1319, 1319, 0.08, { duty: 2, curve: 'lin' }); a.tone(t + 0.2, 0.35, 1175, 1100, 0.08, { duty: 2 }); },
  howl(a, t) { a.noise(t, 1.2, 0.1, 0.5, false, a.sfxBus, 0.9); a.tone(t, 1.1, 500, 700, 0.03, { type: 'triangle' }); },
  drawBell(a, t) { a.tone(t, 0.5, 1760, 1760, 0.18, { duty: 2 }); a.tone(t, 0.5, 2637, 2637, 0.08, { duty: 0 }); a.noise(t, 0.03, 0.25, 3); },
  om(a, t) { a.tone(t, 0.45, 110, 110, 0.12, { type: 'triangle', curve: 'lin' }); a.tone(t, 0.45, 165, 165, 0.05, { duty: 2, curve: 'lin' }); },
  breathIn(a, t) { a.noise(t, 0.18, 0.06, 0.9, false, a.sfxBus, 1.6); },
  breathLong(a, t) { a.noise(t, 0.4, 0.07, 0.7, false, a.sfxBus, 1.8); },
  growl(a, t) { a.tone(t, 0.4, 90, 70, 0.18, { duty: 2 }); a.noise(t, 0.4, 0.12, 0.4, false, a.sfxBus, 0.25); },
  // Phase 6
  // Static: every one of his tells has its own sound (the picture can't be trusted)
  staticLo(a, t) { a.tone(t, 0.16, 62, 62, 0.14, { duty: 2, curve: 'lin' }); a.noise(t, 0.16, 0.1, 1.4, true); },
  staticHi(a, t) { for (let i = 0; i < 3; i++) a.tone(t + i * 0.04, 0.03, 2400, 2400, 0.07, { duty: 0, curve: 'lin' }); },
  staticDn(a, t) { a.tone(t, 0.2, 1400, 180, 0.09, { duty: 1 }); a.noise(t, 0.2, 0.06, 2.6, true); },
  staticUp(a, t) { a.tone(t, 0.14, 300, 1900, 0.08, { duty: 0 }); a.tone(t + 0.14, 0.05, 1900, 1900, 0.06, { duty: 0, curve: 'lin' }); },
  modem(a, t) { for (let i = 0; i < 6; i++) a.tone(t + i * 0.05, 0.05, i & 1 ? 1200 : 2100, i & 1 ? 1300 : 2200, 0.07, { duty: i % 3 }); a.noise(t, 0.3, 0.08, 3, true); },
  // Crowbar Cade
  crowbar(a, t) { a.tone(t, 0.28, 1100, 1060, 0.1, { duty: 0 }); a.tone(t, 0.2, 1650, 1600, 0.05, { duty: 1 }); a.noise(t, 0.05, 0.25, 1.6); },
  // challenge medals (§15) and unlocks (§16)
  medal(a, t) { [1319, 1760, 2637].forEach((f, i) => a.tone(t + i * 0.07, 0.12, f, f, 0.13, { duty: 1, curve: 'lin' })); },
  unlock(a, t) { [523, 659, 784, 1047, 1319].forEach((f, i) => a.tone(t + i * 0.08, 0.16, f, f, 0.14, { duty: 2, curve: 'lin' })); a.tone(t + 0.42, 0.4, 1047, 1047, 0.12, { duty: 1 }); },
  // the rival (Dash Maddox): a camera-flash pop, a firework burst, the cutscene sting
  flashbulb(a, t) { a.tone(t, 0.04, 2600, 3400, 0.1, { duty: 0 }); a.noise(t + 0.03, 0.12, 0.22, 2.4, true); a.tone(t + 0.05, 0.22, 1900, 500, 0.05, { duty: 1 }); },
  firework(a, t) { a.tone(t, 0.25, 300, 1400, 0.08, { duty: 0 }); a.noise(t + 0.25, 0.3, 0.35, 0.8); for (let i = 0; i < 5; i++) a.noise(t + 0.32 + i * 0.05, 0.03, 0.12, 2.6, true); },
  rivalSting(a, t) { [392, 466, 587, 784].forEach((f, i) => a.tone(t + i * 0.07, 0.1, f, f, 0.12, { duty: 1, curve: 'lin' })); a.tone(t + 0.3, 0.35, 196, 185, 0.16, { duty: 2 }); },
  heh(a, t) { a.tone(t, 0.06, 240, 200, 0.14, { duty: 2 }); a.tone(t + 0.1, 0.08, 240, 180, 0.14, { duty: 2 }); },
  // The Warden
  keys(a, t) { for (let i = 0; i < 5; i++) a.tone(t + i * 0.045, 0.04, 2900 + ((i * 577) % 900), 2700, 0.06, { duty: 0 }); },
  cellDoor(a, t) { a.noise(t, 0.3, 0.5, 0.4); a.tone(t, 0.35, 140, 60, 0.3, { type: 'triangle' }); a.tone(t + 0.02, 0.25, 700, 650, 0.06, { duty: 0 }); },
  siren(a, t) { for (let i = 0; i < 2; i++) { a.tone(t + i * 0.5, 0.25, 600, 900, 0.09, { duty: 1 }); a.tone(t + i * 0.5 + 0.25, 0.25, 900, 600, 0.09, { duty: 1 }); } },
  whistlePolice(a, t) { a.tone(t, 0.3, 2800, 2800, 0.08, { duty: 1, curve: 'lin' }); for (let i = 0; i < 6; i++) a.tone(t + i * 0.05, 0.025, 2600, 2600, 0.05, { duty: 0, curve: 'lin' }); },
  // Hollow
  whisper(a, t) { a.noise(t, 0.35, 0.06, 1.8, false, a.sfxBus, 3.2); a.noise(t + 0.2, 0.3, 0.04, 2.4, false, a.sfxBus, 1.2); },
  wail(a, t) { a.tone(t, 0.5, 440, 700, 0.06, { type: 'triangle' }); a.tone(t + 0.2, 0.4, 700, 380, 0.05, { type: 'triangle' }); a.noise(t, 0.5, 0.04, 2, false, a.sfxBus, 0.8); },
  moan(a, t) { a.tone(t, 0.35, 220, 150, 0.07, { type: 'triangle' }); a.noise(t, 0.3, 0.05, 0.9, false, a.sfxBus, 0.5); },
  // Revenant Rourke
  toll(a, t) { a.tone(t, 1.2, 98, 98, 0.2, { type: 'triangle', curve: 'lin' }); a.tone(t, 0.9, 196, 196, 0.06, { duty: 2 }); a.tone(t, 0.6, 587, 587, 0.03, { duty: 0 }); },
  rise(a, t) { a.tone(t, 0.5, 70, 280, 0.12, { duty: 2 }); a.noise(t, 0.5, 0.1, 0.4, false, a.sfxBus, 1.4); },
  // Frenzy
  heat(a, t) { a.tone(t, 0.08, 400, 900, 0.07, { duty: 0 }); },
  shriek(a, t) { a.tone(t, 0.2, 1800, 2600, 0.07, { duty: 0 }); a.tone(t + 0.2, 0.15, 2600, 1500, 0.06, { duty: 0 }); a.noise(t, 0.35, 0.06, 2.8, true); },
  // Eclipse
  eclipseWarn(a, t) { a.tone(t, 1.3, 110, 440, 0.1, { duty: 2 }); a.tone(t, 1.3, 55, 220, 0.12, { type: 'triangle' }); },
  flip(a, t) { a.noise(t, 0.3, 0.3, 0.5, false, a.sfxBus, 3); a.tone(t, 0.35, 1760, 110, 0.12, { duty: 0 }); a.tone(t + 0.3, 0.5, 55, 55, 0.2, { type: 'triangle', curve: 'lin' }); },
  corona(a, t) { [880, 1109, 1319, 1760].forEach((f, i) => a.tone(t + i * 0.04, 0.3, f, f, 0.05, { duty: 0, curve: 'lin' })); },
  // ZERO
  echo(a, t) { [0, 0.12, 0.24].forEach((d, i) => { a.tone(t + d, 0.1, 1568, 1568, 0.1 / (i + 1), { duty: 0, curve: 'lin' }); a.tone(t + d, 0.1, 784, 784, 0.06 / (i + 1), { duty: 2, curve: 'lin' }); }); },
  voidTell(a, t) { a.tone(t, 0.05, 50, 50, 0.2, { type: 'triangle', curve: 'lin' }); },
  heartbeat(a, t) { a.tone(t, 0.1, 60, 40, 0.25, { type: 'triangle' }); a.tone(t + 0.2, 0.1, 55, 38, 0.18, { type: 'triangle' }); },
  // The Ascension (spec §18)
  // Lark's trumpet: the pitch is the height of the punch (high = head, low = body)
  trumpetHi(a, t) { a.tone(t, 0.16, 1568, 1568, 0.12, { duty: 2, curve: 'lin' }); a.tone(t, 0.16, 2349, 2349, 0.05, { duty: 1, curve: 'lin' }); a.tone(t + 0.02, 0.14, 1568, 1600, 0.04, { duty: 0 }); },
  trumpetLo(a, t) { a.tone(t, 0.2, 294, 294, 0.16, { duty: 2, curve: 'lin' }); a.tone(t, 0.2, 440, 440, 0.06, { duty: 1, curve: 'lin' }); a.noise(t, 0.05, 0.05, 0.6); },
  trumpetHold(a, t) { a.tone(t, 0.42, 1319, 1319, 0.12, { duty: 2, curve: 'lin' }); a.tone(t, 0.42, 1976, 1976, 0.05, { duty: 1, curve: 'lin' }); },
  trumpetHoldLo(a, t) { a.tone(t, 0.42, 247, 247, 0.16, { duty: 2, curve: 'lin' }); a.tone(t, 0.42, 370, 370, 0.06, { duty: 1, curve: 'lin' }); },
  wick(a, t) { a.noise(t, 0.16, 0.07, 2.4, true, a.sfxBus, 1.4); a.tone(t, 0.14, 500, 300, 0.04, { duty: 0 }); },
  bashGlow(a, t) { a.tone(t, 0.22, 700, 1900, 0.09, { duty: 0 }); a.tone(t + 0.02, 0.2, 1400, 2600, 0.04, { duty: 1 }); },
  glowUp(a, t) { [1319, 1760, 2349].forEach((f, i) => a.tone(t + i * 0.05, 0.12, f, f, 0.07, { duty: 1, curve: 'lin' })); },
  // Phase C: the Underworld
  gurgle(a, t) { for (let i = 0; i < 4; i++) a.tone(t + i * 0.07, 0.07, 240 + (i % 2) * 90, 160 + (i % 2) * 60, 0.07, { type: 'triangle' }); a.noise(t, 0.3, 0.07, 0.9, false, a.sfxBus, 0.6); },
  maskClack(a, t) { a.noise(t, 0.03, 0.28, 3.2, true); a.tone(t, 0.04, 1100, 800, 0.08, { duty: 0 }); a.noise(t + 0.06, 0.03, 0.22, 3, true); },
  coins(a, t) { for (let i = 0; i < 4; i++) a.tone(t + i * 0.035, 0.05, 2637 + ((i * 419) % 900), 2400, 0.06, { duty: 0 }); },
  gate(a, t) { a.tone(t, 0.3, 140, 90, 0.16, { duty: 2 }); a.noise(t + 0.2, 0.08, 0.3, 0.7); a.tone(t + 0.2, 0.2, 90, 50, 0.2, { type: 'triangle' }); },
  ember(a, t) { a.noise(t, 0.09, 0.1, 2.4, true); a.tone(t, 0.07, 1500, 700, 0.04, { duty: 0 }); },
  ignite(a, t) { a.noise(t, 0.3, 0.2, 0.9, false, a.sfxBus, 2.2); a.tone(t, 0.25, 180, 520, 0.07, { duty: 0 }); },
  burn(a, t) { a.noise(t, 0.05, 0.14, 2.8, true); a.tone(t, 0.05, 1100, 500, 0.05, { duty: 0 }); },
  flame(a, t) { a.noise(t, 0.5, 0.22, 0.5, false, a.sfxBus, 1.6); a.tone(t, 0.4, 70, 130, 0.12, { type: 'triangle' }); },
  hiss(a, t) { a.noise(t, 0.35, 0.16, 3, true, a.sfxBus, 3.6); },
  clinkChain(a, t) { for (let i = 0; i < 3; i++) a.tone(t + i * 0.04, 0.06, 1800 + i * 300, 1500, 0.07, { duty: 0 }); },
  chainRattle(a, t) { for (let i = 0; i < 5; i++) { a.tone(t + i * 0.03, 0.04, 1400 + ((i * 337) % 700), 1000, 0.06, { duty: 0 }); a.noise(t + i * 0.03, 0.02, 0.06, 3, true); } },
  rattleHi(a, t) { for (let i = 0; i < 4; i++) a.tone(t + i * 0.028, 0.04, 2400 + ((i * 411) % 600), 2000, 0.06, { duty: 0 }); },
  rattleLo(a, t) { for (let i = 0; i < 4; i++) a.tone(t + i * 0.04, 0.05, 700 + ((i * 197) % 300), 500, 0.09, { duty: 2 }); },
  chainSnap(a, t) { a.noise(t, 0.04, 0.35, 3); a.tone(t, 0.06, 2600, 1200, 0.09, { duty: 0 }); a.tone(t + 0.05, 0.1, 400, 150, 0.14, { type: 'triangle' }); },
  chainBreak(a, t) { for (let i = 0; i < 6; i++) a.tone(t + i * 0.03, 0.05, 2000 + ((i * 523) % 1200), 900, 0.08, { duty: 0 }); a.noise(t, 0.3, 0.25, 1.4, true); },
  lockClick(a, t) { a.tone(t, 0.03, 1400, 1400, 0.1, { duty: 0, curve: 'lin' }); a.tone(t + 0.07, 0.05, 900, 900, 0.12, { duty: 1, curve: 'lin' }); a.noise(t + 0.07, 0.02, 0.2, 3, true); },
  boneRattle(a, t) { for (let i = 0; i < 5; i++) { a.noise(t + i * 0.035, 0.02, 0.16, 3.2, true); a.tone(t + i * 0.035, 0.03, 900 + ((i * 271) % 500), 700, 0.05, { duty: 0 }); } },
  boneClack(a, t) { a.noise(t, 0.03, 0.34, 3, true); a.tone(t, 0.05, 1300, 900, 0.1, { duty: 0 }); a.tone(t + 0.04, 0.04, 1900, 1400, 0.07, { duty: 0 }); },
  bellToll(a, t) { a.tone(t, 1.1, 196, 190, 0.14, { duty: 2, curve: 'lin' }); a.tone(t, 1.1, 294, 286, 0.06, { duty: 0, curve: 'lin' }); a.tone(t, 0.9, 98, 96, 0.14, { type: 'triangle', curve: 'lin' }); },
  oarDip(a, t) { a.noise(t, 0.18, 0.12, 0.9, false, a.sfxBus, 0.6); a.tone(t + 0.05, 0.12, 160, 110, 0.07, { type: 'triangle' }); },
  // Phase D: the lower Underworld
  grind(a, t) { a.noise(t, 0.4, 0.14, 0.4, false, a.sfxBus, 0.25); a.tone(t, 0.35, 90, 60, 0.12, { type: 'triangle' }); },
  cryLoud(a, t) { a.tone(t, 0.32, 1500, 2300, 0.13, { duty: 1 }); a.tone(t, 0.32, 1520, 1900, 0.08, { duty: 2 }); a.noise(t, 0.3, 0.05, 2, true, a.sfxBus, 3); },
  cryQuiet(a, t) { a.tone(t, 0.3, 300, 210, 0.05, { type: 'triangle' }); a.tone(t + 0.02, 0.28, 452, 310, 0.02, { duty: 0 }); },
  brandHiss(a, t) { a.noise(t, 0.4, 0.2, 2.6, true, a.sfxBus, 4); a.tone(t, 0.2, 240, 110, 0.12, { duty: 0 }); },
  shadowStep(a, t) { a.noise(t, 0.3, 0.14, 0.5, false, a.sfxBus, 1.8); a.tone(t, 0.3, 700, 90, 0.08, { duty: 2 }); },
  shovel(a, t) { a.noise(t, 0.12, 0.2, 0.7, false, a.sfxBus, 0.5); a.noise(t + 0.16, 0.05, 0.3, 3, true); a.tone(t + 0.16, 0.05, 900, 500, 0.08, { duty: 0 }); },
  hum(a, t) { a.tone(t, 0.4, 110, 118, 0.08, { type: 'triangle', curve: 'lin' }); a.tone(t, 0.4, 165, 171, 0.03, { duty: 2, curve: 'lin' }); },
  crackFloor(a, t) { for (let i = 0; i < 4; i++) a.noise(t + i * 0.05, 0.03, 0.18, 2.6, true); a.tone(t, 0.2, 200, 90, 0.08, { type: 'triangle' }); },
  // Phase E: the Void. The Sound Shard's tells: every defense has a sound of its own (he cannot be seen)
  soundL(a, t) { a.tone(t, 0.07, 500, 1100, 0.14, { duty: 1 }); },
  soundR(a, t) { a.tone(t, 0.07, 1100, 500, 0.14, { duty: 1 }); },
  soundAny(a, t) { a.tone(t, 0.05, 880, 880, 0.12, { duty: 2, curve: 'lin' }); a.tone(t + 0.06, 0.05, 1320, 1320, 0.1, { duty: 2, curve: 'lin' }); },
  soundDuck(a, t) { a.tone(t, 0.12, 110, 80, 0.2, { type: 'triangle' }); a.noise(t, 0.08, 0.08, 0.4); },
  soundBlock(a, t) { a.noise(t, 0.03, 0.22, 3, true); a.noise(t + 0.06, 0.03, 0.22, 3, true); a.tone(t, 0.04, 1600, 1600, 0.06, { duty: 0 }); },
  memTick(a, t) { a.tone(t, 0.02, 1500, 1500, 0.06, { duty: 0, curve: 'lin' }); },
  glitch(a, t) { for (let i = 0; i < 4; i++) a.tone(t + i * 0.025, 0.02, 400 + ((i * 977) % 2000), 300, 0.07, { duty: i % 3 }); a.noise(t, 0.08, 0.1, 3, true); },
  shardBreak(a, t) { for (let i = 0; i < 8; i++) a.tone(t + i * 0.04, 0.09, 1200 + ((i * 617) % 2400), 700, 0.06, { duty: 0 }); a.noise(t, 0.4, 0.2, 1.8, true); },
  freed(a, t) { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => a.tone(t + i * 0.09, 0.3, f, f, 0.1, { duty: 2, curve: 'lin' })); a.tone(t + 0.5, 0.9, 2093, 2093, 0.05, { duty: 1, curve: 'lin' }); },
  // a super's golden moment opening: one soft, high tink (the subtle tell, spec §4)
  glint(a, t) { a.tone(t, 0.05, 3136, 3136, 0.035, { duty: 0, curve: 'lin' }); },
  // a punch clanking off an armored super
  clank(a, t) { a.tone(t, 0.12, 980, 900, 0.1, { duty: 0 }); a.noise(t, 0.03, 0.15, 2.2, true); },
  // Phase 7
  // a perfect hit: a hard crack, then a bright rising arpeggio (the star chime's big brother)
  perfect(a, t) {
    a.noise(t, 0.12, 0.6, 0.6); a.tone(t, 0.18, 220, 55, 0.45, { type: 'triangle' });
    [1319, 1760, 2093, 2637, 3136].forEach((f, i) => a.tone(t + 0.05 + i * 0.045, 0.12, f, f, 0.12, { duty: i & 1 ? 1 : 2, curve: 'lin' }));
  },
};
// every sound effect by name (the sound test, §12)
export const SFX_NAMES = Object.keys(SFX);

function pulseWave(ctx, d) {
  const N = 64;
  const real = new Float32Array(N), imag = new Float32Array(N);
  for (let n = 1; n < N; n++) {
    real[n] = Math.sin(2 * Math.PI * n * d) / (n * Math.PI);
    imag[n] = (1 - Math.cos(2 * Math.PI * n * d)) / (n * Math.PI);
  }
  return ctx.createPeriodicWave(real, imag);
}

function noiseBuffer(ctx, short) {
  const len = ctx.sampleRate;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let reg = 1;
  const tap = short ? 6 : 1;
  // clock the LFSR a bit slower than the sample rate for NES-ish grain
  let v = 0;
  for (let i = 0; i < len; i++) {
    if (i % 3 === 0) {
      const fb = (reg & 1) ^ ((reg >> tap) & 1);
      reg = (reg >> 1) | (fb << 14);
      v = reg & 1 ? 0.8 : -0.8;
    }
    d[i] = v;
  }
  return buf;
}
