// Pre-fight intro card: circuit, rank, portraits, record, profile, quote, VS.
// Every fighter walks out to his own jingle; champions also get a CHAMPION banner.
// In a mode run (args.mode 'td' | 'gauntlet') the card shows the run instead of the
// career: the remixed champion, which defense / fight this is, the run's lives.
import { COL } from '../fight/hud.js';
import { drawText, textWidth } from '../engine/font.js';
import { drawBlock, drawLabel, linesOf, layout, logOver } from '../engine/textbox.js';
import { fighterFor, runTitle } from './modes.js';
import { saveRecords, syncRecords, noteTdMet } from '../save/records.js';
import { REGULATION, boutOf } from '../../data/difficulty.js';
import { perkMods } from '../../data/perks.js';
import { CIRCUITS, SHORT, livesOf } from '../../data/circuits.js';
import { ARENAS } from '../../data/arenas/index.js';
import { modeArena } from '../../data/arenas/modes.js';
import { PORTRAITS, playerPortrait } from '../../data/sprites/portraits.js';
import { paletteFor } from '../engine/spriteCache.js';
import { c32 } from '../engine/palette.js';
import { frontPalette, hairStyleOf, nicknameOf } from '../../data/customization.js';
import { rankLabel, noLives } from '../save/career.js';
import { clockText } from '../save/records.js';
import { drawMedalRow } from './medalIcons.js';
import { scoutProgress } from '../save/scouting.js';

const BG_OPP = c32(11, 22, 27), BG_PLAYER = c32(9, 24, 12);

// Two lines of about the same width, broken at a space or after a hyphen.
function splitEven(s) {
  let best = [s], bw = Infinity;
  for (let i = 1; i < s.length; i++) {
    const cut = s[i - 1] === ' ' ? i - 1 : s[i - 1] === '-' ? i : -1;
    if (cut < 0) continue;
    const a = s.slice(0, cut), b = s.slice(i), w = Math.max(textWidth(a, false), textWidth(b, false));
    if (w < bw) { bw = w; best = [a, b]; }
  }
  return best;
}

export class IntroScreen {
  constructor(game, { fighter, mode = null, replay = false, keepMusic = false }) {
    this.keep = keepMusic;
    this.g = game;
    this.mode = mode;
    this.replay = replay && game.career && game.career.replay;
    this.run = mode === 'td' || mode === 'gauntlet' ? game.records.run : null; // (ORIGIN's fights, mode 'origin', are no part of a run)
    this.f = fighterFor(fighter, mode === 'td');
    if (mode === 'td' && this.run && this.run.tier && noteTdMet(game.records, this.run.tier, fighter)) saveRecords(game.records); // (Practice offers his Title Defense version from now on)
    // the career has met him now (Practice lists everyone you've faced)
    if (!mode && game.career) saveRecords(syncRecords(game.records, game.career, [fighter]));
    this.circuit = CIRCUITS[this.f.circuit];
    // (a run's fights are in the mode's own arena: the championship hall, the endurance arena)
    const runDiv = this.run && (this.run.mode === 'td' ? this.run.tier : this.run.zone) || 'classic';
    this.arena = this.run ? modeArena(this.run.mode === 'td' ? 'td' : 'g', runDiv, this.run) : ARENAS[this.circuit.arena];
    const op = paletteFor(this.f.palette);
    this.oppPortrait = (PORTRAITS[this.f.id] || PORTRAITS.barney)(op);
    this.oppPal = op.u32;
    const p = game.profile;
    const pp = frontPalette(p);
    this.plPortrait = playerPortrait(pp, hairStyleOf(p));
    this.plPal = pp.u32;
    this.t = 0;
  }
  enter() {
    // everyone walks out to his own music: a champion's entrance theme, a walk-up
    // jingle (data/music/walkups.js), or DJ Drop's own track
    const jingle = this.g.songs[this.f.music];
    if (this.keep) { // (his entrance scene has been playing it: carry on, or settle into the matchup loop if it has ended)
      const S = this.g.audio.song;
      if (!S || S.done) { this.g.audio.play(this.g.songs.matchup); this.jingle = false; } else this.jingle = !!jingle && jingle.loop === false;
      return;
    }
    this.g.audio.play(jingle || this.g.songs.matchup);
    this.jingle = !!jingle && jingle.loop === false;
  }
  update() {
    this.t++;
    // after his walk-up jingle, settle into the matchup loop
    if (this.jingle && this.t >= 330) {
      const S = this.g.audio.song;
      if (!S || S.done) { this.jingle = false; this.g.audio.play(this.g.songs.matchup); }
    }
    if (this.t > 30 && (this.g.input.confirm() || this.g.input.pressed('star'))) {
      this.g.audio.sfx('confirm');
      this.g.go('fight', { fighter: this.f.id, mode: this.mode, replay: !!this.replay });
    }
    if (this.t > 30 && this.g.input.pressed('pause')) {
      if (this.mode === 'origin') this.g.go('map');
      else if (this.mode) this.g.go('run');
      else if (this.g.career) this.g.go('map');
    }
  }
  render(fr) {
    const f = this.f, c = f.card, p = this.g.profile, car = this.g.career, run = this.run;
    fr.clear(COL.black);
    const circ = run ? runTitle(run) : (this.circuit.asc && !this.circuit.rival ? this.circuit.name.split(':')[0] : this.circuit.name);
    if (this.replay) drawText(fr, 'REPLAY', 100, 150, (this.t >> 4) & 1 ? COL.cyan : COL.green, { mono: false }); // (over LIVES: the top row is his name's)
    // his scouting report so far (knowledge spec K5)
    const sp = scoutProgress(this.g.scouting || {}, f.id, f.remix ? f : null);
    const scout = sp.total ? `SCOUTED ${sp.got}/${sp.total}` : '';
    // (beside his name; a name too long for that pushes it down to the top of the quote)
    const nameLow = scout && textWidth(f.name, false) > 248 - (12 + textWidth(scout, false) + 6);
    if (scout) drawText(fr, scout, 12, nameLow ? 34 : 20, sp.got >= sp.total ? COL.green : COL.grey, { mono: false });
    const tag = run ? (run.mode === 'td' ? `DEFENSE ${run.idx + 1}/${run.list.length}` : `FIGHT ${run.idx + 1}/${run.list.length}`) : null;
    let tw;
    if (tag) tw = drawLabel(fr, tag, 128, 10, 120, COL.green, { mono: false, align: 'right', where: 'intro tag' });
    else if (this.mode === 'origin') tw = drawLabel(fr, 'THE FIRST', 128, 10, 120, (this.t >> 3) & 1 ? COL.yellow : COL.green, { align: 'right' });
    else if (f.isChampion) tw = drawLabel(fr, 'CHAMPION', 128, 10, 120, (this.t >> 3) & 1 ? COL.yellow : COL.green, { align: 'right' });
    else if (f.rival) tw = drawLabel(fr, 'RIVAL', 128, 10, 120, (this.t >> 3) & 1 ? COL.cyan : COL.green, { align: 'right' });
    else tw = drawLabel(fr, `RANKED: #${f.rank}`, 128, 10, 120, COL.green, { align: 'right' }); // (right-aligned: clears CONTINENTAL CIRCUIT)
    // the circuit's name fills what the tag leaves
    // (a long name loses its "RIVAL:", then goes to the short one)
    const cw = 248 - tw - 6 - 12, fits = (x) => textWidth(x, false) <= cw;
    const circName = fits(circ) ? circ : fits(circ.replace(/^RIVAL: /, '')) ? circ.replace(/^RIVAL: /, '') : (!run && SHORT[this.f.circuit]) || circ;
    drawLabel(fr, circName, 12, 10, cw, run ? COL.yellow : COL.orange, { where: 'intro circuit' });
    const nx = scout && !nameLow ? 12 + textWidth(scout, false) + 6 : 12;
    drawLabel(fr, f.name, nx, 22, 248 - nx, COL.white, { align: 'right', where: 'intro name' });
    // opponent portrait
    fr.rect(163, 33, 70, 66, COL.white);
    fr.rect(165, 35, 66, 62, BG_OPP);
    fr.blit(this.oppPortrait, 166, 37, this.oppPal);
    // quote, top-left
    // (in the mono face when it fits the six lines, else the narrow one)
    const quote = `"${c.quote}"`;
    const qn = nameLow ? 5 : 6;
    drawBlock(fr, quote, 12, nameLow ? 44 : 34, 144, qn, COL.white, { mono: linesOf(quote, 144, true) <= qn, where: 'intro quote' });
    if (textWidth(c.record, true) <= 82) drawText(fr, c.record, 166, 104, COL.white);
    else drawLabel(fr, c.record, 98, 104, 150, COL.white, { align: 'right', where: 'intro record' }); // (a long one runs left, under VS.)
    // right column: the nickname (two lines at most), the hometown (three), age, weight, rounds and hearts. The rows close
    // up when the words run long, so the column always ends above his record time.
    const nick = `"${f.nickname}"`;
    // the rounds: three (his own count where he has one), then the championship rounds, with no judges
    const nr = boutOf(f) ? boutOf(f).rounds : f.rounds || this.circuit.rounds || REGULATION;
    const rowRounds = `${nr} ROUNDS`;
    const nickL = layout(nick, 118).length === 1 ? [nick] : layout(nick, 104), fromL0 = layout(`FROM: ${c.hometown}`, 104), fromL = fromL0.length <= 3 ? fromL0 : layout(c.hometown, 104); // (no FROM: when it needs the room)
    const rows = [
      ...nickL.slice(0, 2).map((l) => [l, COL.yellow, Math.max(134, Math.min(148, 252 - textWidth(l, false)))]),
      null,
      ...fromL.slice(0, 3).map((l) => [l, COL.white, 148]),
      null,
      [`AGE: ${c.age}`, COL.white, 148], [`WEIGHT: ${c.weight}`, COL.white, 148],
      [rowRounds, COL.grey, Math.max(134, Math.min(148, 252 - textWidth(rowRounds, false)))], // (a long one runs left, like the nickname)
      [`${this.circuit.hearts + perkMods(car ? car.training.equipped : []).hearts} HEARTS`, COL.grey, 148],
    ];
    if (nickL.length > 2) logOver(nick, 'intro nickname');
    if (fromL.length > 3) logOver(c.hometown, 'intro hometown');
    const words = rows.filter(Boolean).length, gaps = rows.length - words;
    const pitch = words * 10 + gaps * 2 <= 80 ? 10 : 9, gap = words * pitch + gaps * 2 <= 80 ? 2 : 0;
    let y = 118;
    for (const r of rows) { if (!r) { y += gap; continue; } drawText(fr, r[0], r[2], y, r[1], { mono: false }); y += pitch; }

    drawText(fr, 'VS.', 104, 96, COL.orange);

    // player
    const rec = car ? `${car.record.w}-${String(car.record.l).padStart(2)} ${car.record.ko}KO` : '0- 0 0KO';
    drawText(fr, rec, 12, 98, COL.white);
    fr.rect(9, 109, 70, 66, COL.white);
    fr.rect(11, 111, 66, 62, BG_PLAYER);
    fr.blit(this.plPortrait, 12, 113, this.plPal);
    drawLabel(fr, this.mode === 'origin' ? 'NO LIVES. NOTHING TO LOSE.' : run ? (run.mode === 'td' ? 'THE CHAMPION' : `STREAK: ${run.idx}`) : car ? rankLabel(car) : 'UNRANKED', 12, 180, 132, COL.green, { mono: false, where: 'intro rank' });
    const ttl = this.g.records.origin && this.g.records.origin.trueBeaten ? 'ORIGIN' : null; // (the title the Origin Belt gives)
    drawLabel(fr, ttl ? `${ttl} ${p.name}` : p.name, 12, 191, 132, ttl ? COL.yellow : COL.white, { where: 'intro player' });
    drawLabel(fr, `"${nicknameOf(p)}"`, 12, 202, 132, COL.yellow, { mono: false, where: 'intro player nickname' });
    const lives = this.mode === 'origin' ? null : run ? (run.mode === 'td' ? run.lives : null) : noLives(this.f.circuit) ? null : this.replay ? this.replay.lives : car ? car.lives : null; // (the Void has no lives, and neither does ORIGIN)
    if (lives != null) {
      drawText(fr, 'LIVES', 100, 130, COL.cyan, { mono: false });
      for (let i = 0; i < (run ? 2 : livesOf(this.f.circuit)); i++) fr.rect(102 + i * 12, 140, 8, 8, i < lives ? COL.red : COL.dark);
    }

    if ((this.t >> 4) & 1) { drawText(fr, 'PUSH', 104, 162, COL.orange); drawText(fr, 'START!', 96, 174, COL.orange); }
    // his record time and medals (§15)
    const M = this.g.medals, best = M.best[f.id];
    if (this.mode === 'origin') {
      const O = this.g.records.origin, k = f.id === 'origin' ? 'g' : 't';
      drawText(fr, `BEST ${O.best[k] == null ? '--:--' : clockText(O.best[k])}`, 148, 201, COL.grey, { mono: false });
      drawMedalRow(fr, 219, 199, O.got[k]);
    } else if (!f.remix) {
      drawText(fr, `BEST ${best == null ? '--:--' : clockText(best)}`, 148, 201, COL.grey, { mono: false });
      drawMedalRow(fr, 219, 199, M.got[f.id] || {});
    }
    const at = textWidth(`AT ${this.arena.name}`, false) <= 240 ? `AT ${this.arena.name}` : this.arena.name;
    drawLabel(fr, at, 8, 213, 240, COL.cyan, { mono: false, align: 'right', where: 'intro arena' });
  }
}
