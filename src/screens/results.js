// Post-fight results: outcome, the opponent's parting line, fight stats, and
// what it means for the career: next opponent + password (win), lives left
// (rematch), back to the start of the circuit + password (last life), or on to
// the belt ceremony (title won).
import { goIntro } from './introFlow.js';
import { COL, panel } from '../fight/hud.js';
import { drawText, drawTextBig, drawTextCentered, textWidth } from '../engine/font.js';
import { FIGHTERS } from '../../data/fighters/index.js';
import { CIRCUITS, SHORT } from '../../data/circuits.js';
import { PORTRAITS, playerPortrait } from '../../data/sprites/portraits.js';
import { paletteFor } from '../engine/spriteCache.js';
import { c32 } from '../engine/palette.js';
import { frontPalette, hairStyleOf } from '../../data/customization.js';
import { recordResult, nextOpponent, recordReplay, replayOpponent } from '../save/career.js';
import { fighterFor } from './modes.js';
import { showChar } from '../save/password.js';
import { drawPassword, drawBlock, drawLabel, drawLabelCentered } from '../engine/textbox.js';
import { saveRecords, syncRecords, recordTdFight, tdChampOf, recordOriginFight } from '../save/records.js';
import { recordFight } from '../save/medals.js';
import { drawMedalRow } from './medalIcons.js';
import { clockText } from '../save/records.js';


export class ResultsScreen {
  constructor(game, result) {
    this.g = game;
    this.r = result;
    this.f = FIGHTERS[result.opponent] || FIGHTERS.barney;
    this.won = result.winner === 'player';
    if (this.won) { const p = frontPalette(game.profile); this.portrait = playerPortrait(p, hairStyleOf(game.profile)); this.pal = p.u32; }
    else { const p = paletteFor(this.f.palette); this.portrait = (PORTRAITS[this.f.id] || PORTRAITS.barney)(p); this.pal = p.u32; }
    this.lines = this.f.lines || {}; // his lines: `win` when he wins, `lose` when he loses
    this.t = 0;
    // a circuit replay has its own lives and never touches the career (career.js)
    this.replay = !!(result.replay && game.career && game.career.replay);
    // a podium rematch changes nothing about the career: no life, no ladder, no record; only the medals and the record time count
    this.rematch = result.rematch || null;
    this.origin = result.origin || null; // ORIGIN (g) or his true form (t): a fight with no lives and no ladder: only his own record changes
    this.outcome = this.origin ? { kind: 'origin' } : !game.career ? null : this.rematch ? { kind: 'podium' } : this.replay ? { ...recordReplay(game.career, result), replay: true } : recordResult(game.career, result);
    // record time and medals: every career fight counts (§15), replays and rematches too (a Title Defense champion's are his own, kept apart)
    this.medal = this.origin ? { ...recordOriginFight(game.records, this.f, result, this.origin, game.career), unlocked: [] } : !game.career ? null : this.rematch && this.rematch.td ? { ...recordTdFight(game.records, fighterFor(result.opponent, true), result), unlocked: [] } : recordFight(game.medals, result);
    // unlocks (Title Defense, Gauntlet, ZERO in the Gauntlet) and Practice opponents
    if (this.origin && game.career) game.saveCareer();
    if (game.career) saveRecords(syncRecords(game.records, game.career));
  }
  enter() {}
  update() {
    this.t++;
    if (this.t > 60 && (this.g.input.confirm() || this.g.input.pressed('star'))) {
      this.g.audio.sfx('confirm');
      const o = this.outcome;
      // a belt, Dash, or a circuit that has reset you to another one: the world map (you walk on to the next place); anything else brings you back to the podium you fought at
      if (o && (o.kind === 'title' || o.kind === 'rival' || (o.kind === 'reset' && o.to !== o.circuit))) this.g.loc = { area: 'world' };
      if (!o) this.g.go('title');
      else if (o.kind === 'origin') this.originNext();
      // (a rematch win over ZERO's true form plays the true ending if this career has never seen it: a password can put you past the fight)
      else if (o.kind === 'podium' && this.won && this.f.id === 'zeroTrue' && this.g.career && !this.g.career.flags.trueEndingSeen) { this.g.loc = { area: 'world' }; this.g.go('trueEnding'); }
      else if (o.kind === 'podium') this.g.go('map');
      else if (o.replay) this.nextReplay(o);
      else if (o.kind === 'title' && o.circuit === 'zeroTrue') this.g.go('trueEnding'); // ZERO's true form falls: the true ending (spec §18 A4)
      else if (o.freed) this.goFreed(o); // a Hollowed freed: their cutscene, then what would have come next
      else if (o.kind === 'title' && o.circuit === 'zero') this.g.go('ending', { kind: 'interim' });
      else if (o.kind === 'title' && o.circuit === 'halcyon') this.g.go('fall'); // beating the boss plays The Fall (spec §18 A4)
      else if (o.kind === 'title' && o.circuit === 'vorgath') this.g.go('deal'); // beating the King Below breaks the deal (spec §18 A4)
      else if (o.kind === 'title') this.g.go('belt', { circuit: o.circuit, next: o.next });
      else if (o.kind === 'rival') this.g.go('rival', { id: o.circuit, phase: 'post' });
      else this.g.go('map');
    }
  }
  // ORIGIN fell (the first time: his victory scene, in full) or did not (back to his door, to try again)
  originNext() {
    const g = this.g, O = g.records.origin, k = this.origin === 'g' ? 'victory' : 'victoryTrue';
    if (this.won && !O.seen[k]) { O.seen[k] = true; saveRecords(g.records); g.go('cutscene', { id: this.origin === 'g' ? 'victory.origin' : 'victory.originTrue', params: {}, then: ['map', {}] }); return; }
    g.go('map');
  }
  // a Hollowed freed (Phase E): the freeing cutscene, then the belt ceremony (a fragment's last) or the map
  goFreed(o) {
    const then = o.kind === 'title' ? ['belt', { circuit: o.circuit, next: o.next }] : ['map', {}];
    this.g.go('free', { id: o.freed.id, first: o.freed.first, then });
  }
  nextReplay(o) {
    const g = this.g, c = g.career;
    if (o.kind === 'win') goIntro(g, { fighter: replayOpponent(c), replay: true });
    else if (o.kind === 'rematch') g.go('intro', { fighter: replayOpponent(c), replay: true });
    else if (o.kind === 'rival') g.go('rival', { id: o.rivalId, phase: 'pre', replay: true });
    else if (o.kind === 'done') {
      const belt = { circuit: o.circuit, replay: true, unlocked: o.unlocked };
      // beat the rival at the end of it: his parting words first
      if (CIRCUITS[this.f.circuit].rival) g.go('rival', { id: this.f.circuit, phase: 'post', replay: true, belt });
      else g.go('belt', belt);
    } else g.go('map');
  }
  render(fr) {
    const r = this.r, s = r.stats, o = this.outcome;
    fr.clear(COL.black);
    drawTextBig(fr, this.won ? 'YOU WIN!' : 'YOU LOSE', 128, 8, this.won ? COL.yellow : COL.red, COL.black, 3);
    const rnd = r.championship ? `CHAMPIONSHIP ROUND ${r.round}` : `ROUND ${r.round}`;
    const how = r.method === 'QUIT' ? `BY FORFEIT - ROUND ${r.round}  ${r.time}` : `BY ${r.method === 'KO' ? 'K.O.' : 'T.K.O.'} - ${rnd}  ${r.time}`;
    // a medal unlock this fight crossed (§16) takes turns with the result line
    const un = this.medal && this.medal.unlocked && this.medal.unlocked.length && (this.t >> 5) & 1 ? `UNLOCKED: ${this.medal.unlocked[this.medal.unlocked.length - 1].short}!` : null;
    drawLabelCentered(fr, un || how, 128, 36, 240, un ? COL.yellow : COL.white, { mono: false, where: 'results how' });
    fr.rect(15, 49, 70, 66, COL.white);
    fr.rect(17, 51, 66, 62, this.won ? c32(9, 24, 12) : c32(11, 22, 27));
    fr.blit(this.portrait, 18, 53, this.pal);
    const line = this.won ? this.lines.lose : this.lines.win;
    drawLabel(fr, `${this.f.short || this.f.name.split(' ')[0]}:`, 96, 52, 148, COL.cyan, { where: 'results name' });
    drawBlock(fr, `"${line || '...'}"`, 96, 66, 148, this.medal ? 4 : 5, COL.white, { where: 'results quote' });
    if (this.medal) this.renderMedals(fr, this.medal);

    panel(fr, 16, 122, 224, 44);
    const rows = [
      ['POINTS', r.points, 'LANDED', `${s.landed}/${s.thrown}`],
      ['COUNTERS', s.counters, 'STARS', s.starsEarned],
      ['KD FOR', r.knockdowns.opp, 'AGAINST', r.knockdowns.player],
    ];
    rows.forEach(([a, av, b, bv], i) => {
      const y = 127 + i * 12;
      // (the numbers right-aligned to their column's edge, so a long one grows toward its label)
      drawText(fr, a, 22, y, COL.cyan, { mono: false }); drawLabel(fr, String(av), 22 + textWidth(a, false) + 4, y, 120 - 26 - textWidth(a, false), COL.white, { mono: false, align: 'right', where: 'results stat' });
      drawText(fr, b, 128, y, COL.cyan, { mono: false }); drawLabel(fr, String(bv), 128 + textWidth(b, false) + 4, y, 236 - 132 - textWidth(b, false), COL.white, { mono: false, align: 'right', where: 'results stat' });
    });

    if (o) this.renderOutcome(fr, o);
    if (this.t > 60 && (this.t >> 4) & 1) drawTextCentered(fr, 'PUSH START', 128, 215, COL.yellow);
  }

  // this fight's time and medals (new ones blink)
  renderMedals(fr, M) {
    const got = (this.origin ? this.g.records.origin.got[this.origin] : this.rematch && this.rematch.td ? tdChampOf(this.g.records, this.f.id).got : this.g.medals.got[this.f.id]) || {};
    const txt = M.time == null ? 'NO KO TIME' : `${M.newBest ? 'NEW BEST' : 'KO TIME'} ${clockText(M.time)}`;
    drawText(fr, txt, 96, 106, M.newBest && (this.t >> 3) & 1 ? COL.yellow : COL.cyan, { mono: false });
    drawMedalRow(fr, 207, 104, got, (this.t >> 3) & 1 ? M.earned : []);
    if (M.earned.length && this.t === 30) this.g.audio.sfx('medal');
  }

  renderOutcome(fr, o) {
    panel(fr, 16, 168, 224, 44);
    const c = this.g.career;
    // the box's rows: a headline (wraps to two lines when it runs long), then a second line or the password, which takes
    // as many groups of four a line as fit (two lines at most)
    let y = 172;
    const head = (text, col) => { y += 9 * drawBlock(fr, text, 20, y, 216, 2, col, { align: 'center', lineH: 9, where: 'results outcome' }) + 3; };
    const line2 = (text, col) => drawLabelCentered(fr, text, 128, y, 216, col, { mono: false, where: 'results outcome' });
    const pw = () => { drawText(fr, 'PASSWORD', 22, y, COL.cyan, { mono: false }); drawPassword(fr, o.password, 88, y, 148, COL.yellow, { show: showChar, align: 'left', lineH: 9 }); };
    if (o.replay) {
      const nx = (o.kind === 'win' || o.kind === 'rematch' || o.kind === 'rival') && c.replay ? replayOpponent(c) : null;
      const msg = { win: o.gained ? 'LIFE BACK! ON TO THE NEXT ONE' : 'REPLAY: ON TO THE NEXT ONE', rival: 'LADDER DONE. ONE MORE...', done: 'TITLE RECLAIMED!', rematch: `REPLAY LIVES LEFT: ${o.lives}`, over: 'REPLAY OVER. YOUR CAREER IS UNTOUCHED.' }[o.kind];
      head(msg, o.kind === 'over' || o.kind === 'rematch' ? COL.pink : COL.yellow);
      if (nx) line2(`NEXT: ${FIGHTERS[nx].name}`, COL.white);
      return;
    }
    if (o.kind === 'origin') {
      head(this.won ? (this.origin === 'g' ? 'ORIGIN FALLS!' : 'THE FIRST AND THE LAST FALL!') : 'THE DOOR WAITS.', this.won ? ((this.t >> 3) & 1 ? COL.yellow : COL.white) : COL.pink);
      line2(this.won ? 'NO PASSWORD. NO LIFE. ONLY THE BEGINNING.' : 'NO LIVES, NOTHING LOST. TRY WHEN READY.', COL.white);
      return;
    }
    if (o.kind === 'podium') {
      head(this.won ? 'REMATCH WON. NOTHING CHANGES.' : 'REMATCH LOST. NOTHING CHANGES.', this.won ? COL.yellow : COL.pink);
      line2('NO LIFE LOST. MEDALS COUNT.', COL.white);
      return;
    }
    if (o.kind === 'retry') {
      head('NO LIVES IN THE VOID', COL.pink);
      line2('NOTHING IS LOST. TRY AGAIN.', COL.white);
      return;
    }
    if (o.kind === 'win') {
      const nx = nextOpponent(c);
      // a win in the ladder gives a life back: said at the right of the NEXT line, flashing
      const lifeTxt = o.gained ? `+1 LIFE (${o.lives})` : '', lifeW = lifeTxt ? textWidth(lifeTxt, false) + 8 : 0;
      drawLabel(fr, nx ? `NEXT: ${FIGHTERS[nx].name}` : 'NEXT: ???', 22, y, 212 - lifeW, COL.white, { mono: false, where: 'results next' });
      if (lifeTxt) drawText(fr, lifeTxt, 234 - textWidth(lifeTxt, false), y, (this.t >> 3) & 1 ? COL.cyan : COL.white, { mono: false });
      y += 12;
      pw();
    } else if (o.kind === 'title') {
      const won = { dream: 'UNDISPUTED CHAMPION OF THE WORLD!', zero: 'YOU ARE THE LAST CHAMPION!', vorgath: 'THE KING BELOW HAS FALLEN!', zeroTrue: 'ZERO IS UNDONE!' }[o.circuit] || `YOU WON THE ${CIRCUITS[o.circuit].asc ? SHORT[o.circuit] : CIRCUITS[o.circuit].name} BELT!`;
      head(won, (this.t >> 3) & 1 ? COL.yellow : COL.white);
      pw();
    } else if (o.kind === 'rival') {
      head(o.circuit === 'rival4' ? 'THE SHOWDOWN IS YOURS! JAX IS NEXT!' : 'YOU BEAT DASH MADDOX!', (this.t >> 3) & 1 ? COL.yellow : COL.white);
      pw();
    } else if (o.kind === 'rematch') {
      head(`LIVES LEFT: ${o.lives}`, COL.pink);
      line2('SHAKE IT OFF. REMATCH!', COL.white);
    } else {
      const back = CIRCUITS[o.to].asc ? SHORT[o.to] : CIRCUITS[o.to].name; // (the Ascension's names are long: the short ones fit the box)
      head(CIRCUITS[o.circuit].rival && o.to !== CIRCUITS[o.circuit].after ? 'OUT OF LIVES! DASH WILL KEEP.' : `OUT OF LIVES! BACK TO THE START OF ${back}`, COL.red);
      pw();
    }
  }
}
