// Fight screen wrapper: builds a Fight for the chosen opponent and routes the result.
//   args.fighter   fighter id
//   args.mode      'td' | 'gauntlet' (a run: see modes.js), or none for the career
//   args.practice  practice options { tell, hearts, health, slow, remix } (nothing counts)
//   args.rematch   a podium rematch ({ circuit, at } or { td: true, at }): no lives, no ladder, medals and record times count
import { Fight } from '../fight/fightState.js';
import { CIRCUITS } from '../../data/circuits.js';
import { ARENAS } from '../../data/arenas/index.js';
import { fighterFor } from './modes.js';
import { gauntletStage, noteTdMet, saveRecords } from '../save/records.js';
import { modeArena } from '../../data/arenas/modes.js';
import { tdDivisionOf } from '../../data/fighters/titleDefense.js';
import { tdSongId, gSongId } from '../../data/music/modeThemes.js';
import { altPaletteOf } from '../save/unlocks.js';
import { scoutStore } from '../save/scouting.js';
import { handbookStore } from '../save/handbook.js';
import { rivalStore } from '../save/rivalRecord.js';
import { cornerStore } from '../save/cornerLog.js';

export class FightScreen {
  constructor(game, { fighter, opts = {}, mode = null, practice = null, replay = false, rematch = null }) {
    this.g = game;
    this.mode = mode;
    this.replay = replay; // a circuit replay (career.js): its own lives, nothing else changes
    this.rematch = rematch; // a podium rematch (interior.js): no lives, nothing about the career changes, medals and record times count
    this.practice = practice;
    let d = fighterFor(fighter, mode === 'td' || (practice && practice.remix));
    // his alternate palette (Practice, once unlocked: §16)
    if (practice && practice.alt) d = { ...d, palette: altPaletteOf(d) };
    const arena = ARENAS[CIRCUITS[d.circuit].arena];
    const run = mode && game.records.run;
    // Title Defense (a defense in progress, or a podium rematch in a division's hall) and the Gauntlet have arenas and themes of their own
    // (data/arenas/modes.js, data/music/modeThemes.js), per division; the Gauntlet's theme climbs five steps over the run
    let modeOpts0 = null;
    if (mode === 'td') {
      const div = (rematch && rematch.tier) || (run && run.mode === 'td' && run.tier) || 'classic';
      modeOpts0 = { arenaDef: modeArena('td', div), song: tdSongId(div) };
      if (noteTdMet(game.records, div, fighter)) saveRecords(game.records); // (reached: Practice offers this version from now on)
    } else if (practice && practice.remix) {
      // Practice's Title Defense version fights where the defense does: the division's hall and theme
      const div = practice.tier && practice.tier !== 'normal' ? practice.tier : tdDivisionOf(fighter) || 'classic';
      modeOpts0 = { arenaDef: modeArena('td', div), song: tdSongId(div) };
    }
    else if (mode === 'gauntlet' && run) { const div = run.zone || 'classic'; modeOpts0 = { arenaDef: modeArena('g', div, run), song: gSongId(div, run.idx, run.list.length) }; }
    const perks = game.career ? game.career.training.equipped : [];
    const modeOpts = {};
    if (mode === 'gauntlet' && run) Object.assign(modeOpts, { stageLock: gauntletStage(d), startHealth: run.health, startStars: run.stars });
    if (practice) Object.assign(modeOpts, { tellHighlight: practice.tell, infiniteHearts: practice.hearts, infiniteHealth: practice.health !== false, exploitView: !!practice.xview });
    else modeOpts.forfeit = rematch ? undefined : mode ? 'always' : game.career ? 'afterBell' : undefined;
    this.fight = new Fight({
      fighter: d, audio: game.audio, input: game.input,
      opts: {
        music: modeOpts0 ? game.songs[modeOpts0.song] : game.songs[d.fightMusic || arena.music], // DJ Drop fights to his own track
        ...(modeOpts0 ? { arenaDef: modeOpts0.arenaDef } : {}),
        roundSongs: !modeOpts0 && d.roundMusic ? d.roundMusic.map((n) => game.songs[n]) : null, // Halcyon: a theme per form (not in the modes: one theme for the room)
        songBank: game.songs, // (a fighter that changes the music itself: the Rhythm Shard's tempos)
        victoryMusic: game.songs.victory,
        defeatMusic: game.songs.defeat,
        profile: game.profile,
        gold: !!(game.career && game.career.flags.zeroBeaten),
        announce: !practice && mode !== 'gauntlet',
        perks,
        scouting: game.scouting ? scoutStore(game.scouting) : null, // every mode scouts (K5)
        handbook: game.handbook ? handbookStore(game.handbook) : null, // the corner's notes on him
        rivalRecord: rivalStore(), // Dash keeps a file on you (K3)
        corner: practice ? null : cornerStore(), // the cornerman remembers who beat you, and what he told you (not in Practice)
        onEnd: (r) => this.done(r),
        ...modeOpts,
        ...opts,
      },
    });
  }
  done(r) {
    const g = this.g;
    g.timeScale = 1;
    if (this.practice) { g.go('practice', { result: r }); return; }
    if (this.rematch) { if (r.method === 'QUIT') g.go('map'); else g.go('results', { ...r, rematch: this.rematch }); return; } // (a podium rematch: walking out costs nothing)
    if (this.mode) {
      // walking out of a run's fight counts as losing it
      if (r.method === 'QUIT') r = { ...this.fight.makeResult('opponent', 'QUIT') };
      g.go('run', { result: r });
      return;
    }
    // walking out of a career fight after the first bell is a loss (it costs a life)
    if (r.method === 'QUIT' && r.forfeit) g.go('results', { ...this.fight.makeResult('opponent', 'QUIT'), replay: this.replay });
    else if (r.method === 'QUIT') g.go(g.career ? 'map' : 'title');
    else g.go('results', { ...r, replay: this.replay });
  }
  enter() {
    this.g.audio.stop();
    this.g.timeScale = this.practice && this.practice.slow ? 0.5 : 1;
    this.fight.warmSprites(); // (both fighters' poses composed in a worker: no pose is composed in the middle of a punch)
  }
  update() { this.fight.update(); }
  // the app lost the screen (another tab, a phone call, the lock button): where a fight can be paused it is, and its pause menu waits
  autoPause() {
    const F = this.fight;
    if (!['announce', 'intro', 'fight', 'between'].includes(F.phase)) return false;
    if (!F.paused) { F.paused = true; F.pauseSel = 0; }
    return true;
  }
  render(f) { this.fight.render(f); }
  shake() {
    const s = this.fight.shake;
    return s > 0 ? [((s >> 1) & 1 ? 1 : -1) * Math.min(2, s >> 2 || 1), 0] : [0, 0];
  }
}
