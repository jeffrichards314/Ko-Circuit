// The fight: rules (§4), phases, hit resolution, effects and rendering.
//
// Phases: intro -> fight -> (oppDown | playerDown | roundEnd) -> between -> intro ...
//         -> ko   then onEnd(result)   (no judges: after the last regular round the championship rounds go on until somebody is down)
//
// Phase 7 opts (modes): rounds (Gauntlet fights are one round), startHealth /
// startStars (carried over between Gauntlet fights), perks (training perks, see
// data/perks.js; they never touch the opponent's timing), infiniteHearts and
// tellHighlight (Practice). A one-round fight is split into three 60-second
// stages that stand in for rounds wherever a gimmick changes by round (the
// Warden's riot, ZERO's silence, the Nightmare void's colours): see `stage`.

import { Player, PT } from './player.js';
import { mashDecay, boutOf, roundFrames, REGULATION, CHAMPIONSHIP, MASH, escalation } from '../../data/difficulty.js';
import { OpponentAI } from './opponentAI.js';
import { drawHUD, COL, UIPAL, panel } from './hud.js';
import { POINTS } from './scoring.js';
import { Arena } from '../engine/arena.js';
import { ARENAS } from '../../data/arenas/index.js';
import { CIRCUITS } from '../../data/circuits.js';
import { fighterSprites, playerSprites, paletteFor, warmInWorker } from '../engine/spriteCache.js';
import { swapPalette, spritePalette, makePalette, c32 } from '../engine/palette.js';
import { reshape, resolvePose } from '../engine/figure.js';
import { PALETTES } from '../../data/palette.js';
import { SPARKS, BLOCK_SPARK, BIG_STAR } from '../../data/sprites/ui.js';
import { drawText, drawTextBig, drawTextCentered, wrap, textWidth } from '../engine/font.js';
import { layout } from '../engine/textbox.js';

const ANNOUNCE_W = 200; // the ring announcer's card: its lines' width
const PHASE_GLOW = 30, GLOW_B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
import { playerPortrait } from '../../data/sprites/portraits.js';
import { DEFAULT_PROFILE, normalizeProfile, playerPalettes, frontPalette, hairStyleOf, costumeIdOf, trainerOf, nicknameOf, cornermanFor } from '../../data/customization.js';
import { BetweenRounds } from '../screens/betweenRounds.js';
import { SUPER_DEPTH, superKey } from '../../data/fighters/super.js';
import { perkMods } from '../../data/perks.js';
import { reflectionPalette, reflectionLayersFor } from '../../data/reflection.js';
import { FightTracker } from './tracker.js';
import { BehaviorTracker } from './behavior.js';

export const OPP_X = 128, OPP_Y = 194, PLAYER_X = 128, PLAYER_Y = 219;
// The clock (data/difficulty.js ROUND): a round is 3:00 on the game clock, a game second is 24 frames (a big boss's, 30), so a round
// is 72 real seconds (a boss's, 90). The medals' and records' unit is the game second, 24 frames, shown as it is.
// Jax's storm and Maestro's tempo steps use REAL seconds (Fight.realSeconds).
export const FRAMES_PER_SEC = 24;
export const ROUND_SECONDS = 180;
export const clockString = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
const OPP_LAYER = 2;

export class Fight {
  constructor({ fighter, audio, input, opts = {} }) {
    this.d = fighter;
    this.audio = audio;
    this.input = input;
    this.opts = opts;
    this.circuit = CIRCUITS[fighter.circuit];
    // (Title Defense and the Gauntlet fight in their own arenas, data/arenas/modes.js: opts.arenaDef)
    this.arena = new Arena(opts.arenaDef || ARENAS[this.circuit.arena]);
    if (audio) audio.crowdGain = (opts.arenaDef && opts.arenaDef.crowdGain) || 1; // (the endurance arena's crowd gets louder with every win)
    this.profile = normalizeProfile(opts.profile || DEFAULT_PROFILE);
    this.trainer = cornermanFor(this.profile, this.circuit.zone, this.circuit.id); // (the Underworld's cornerman is the Ferryman: no trainer passive)
    this.perk = perkMods(opts.perks || []);
    this.maxHearts = this.circuit.hearts + this.perk.hearts;
    this.counterMult = this.perk.counterMult;
    // A big boss fights in phases on a slower clock (data/difficulty.js BOUTS), and only his last phase can be knocked out
    // (spec §4 "Boss phases")
    this.bout = boutOf(fighter);
    this.bossPhases = this.bout ? this.bout.phases : 1;
    this.bossPhase = 1;
    // The clock (data/difficulty.js ROUND): the same for every fight, in frames at 60 a second. `fps` is the frames per game second
    // of a 180-game-second round (a scripted moment `when: { left: 90 }` is halfway through the round). opts.roundFrames overrides (the tools).
    this.roundFrames = Math.round(opts.roundFrames || roundFrames(!!this.bout));
    this.fps = this.roundFrames / ROUND_SECONDS;
    // The regular rounds (a fighter can set his own count, the Will Shard's five); after them the championship rounds go on, with no
    // judges, until somebody is knocked out (`esc`: data/difficulty.js CHAMPIONSHIP)
    this.rounds = opts.rounds || (this.bout ? this.bout.rounds : opts.stageLock ? REGULATION : fighter.rounds || this.circuit.rounds || REGULATION);
    this.esc = escalation(0);
    this.nextEsc = escalation(0); // (the round coming up, once the bell between rounds has rung: his recovery and the corner's)
    // Phase E: a modifier can hold the boss forms to a chosen one for a while (ZERO's true form wears Halcyon's and Vorgath's in turn):
    // the modifiers that read `formOf` see this instead of the round
    this.formOverride = null;
    this.silence = !!fighter.silent; // no sound at all while the fight runs (the Sight Shard; ZERO's true form switches it on for a while)
    this.minimalHud = false; // ZERO's last phase: a pure white screen with only the hearts and the health bars
    this.player = new Player(this);
    this.player.hearts = this.maxHearts;
    if (opts.startHealth != null) this.player.health = Math.max(1, Math.min(this.player.maxHealth, Math.round(opts.startHealth)));
    this.player.stars = Math.min(3, opts.startStars || 0);
    this.behavior = new BehaviorTracker(this); // what the player does (knowledge spec K2)
    // Dash's file on the player: the last fight's strategy, read once now (K3 `grudge`)
    this.grudge = opts.rivalRecord && fighter.rival ? opts.rivalRecord.get() : null;
    if (this.trainer.id === 'hype') this.player.stars = Math.max(1, this.player.stars); // Hype man: start with a star
    this.opp = new OpponentAI(fighter, this.circuit, this, { modifiers: opts.modifiers });
    this.FRAMES_PER_SEC = this.fps; // (a big boss's clock runs slower)
    // handles for modifier render hooks
    this.OPP_X = OPP_X; this.OPP_Y = OPP_Y; this.UIPAL = UIPAL; this.COL = COL;

    // Reflection (#72) is drawn in the player's own colours and hair (data/reflection.js)
    this.oppSprites = fighterSprites(fighter.mirrorPlayer ? reflectionLayersFor(this.profile) : fighter.spriteLayers);
    const base = PALETTES[fighter.palette];
    this.oppPal = {
      default: paletteFor(fighter.palette).u32,
      highlight: spritePalette(brighten(base.A), base.B && brighten(base.B)).u32,
    };
    if (fighter.mirrorPlayer) {
      const rp = reflectionPalette(this.profile);
      this.oppPal.default = rp.u32;
      this.oppPal.highlight = spritePalette(brighten(rp.a), brighten(rp.b)).u32;
    }
    this.oppPoses = { ...this.oppSprites.build.poses, ...(this.oppSprites.layers.poses || {}) };
    this.plSprites = playerSprites(hairStyleOf(this.profile), costumeIdOf(this.profile));
    const pp = playerPalettes(this.profile);
    this.plPal = { default: (opts.gold ? pp.gold : pp.default).u32, pink: pp.pink.u32 };
    this.plOutline = pp.default.idx('outline');
    this.shadowCol = this.arena.pal.u32[this.arena.pal.idx(this.arena.def.shadowColor || 'shadow')];
    const fp = frontPalette(this.profile);
    this.portrait = playerPortrait(fp, hairStyleOf(this.profile));
    this.portraitPal = fp.u32;

    this.round = opts.startRound || 1;
    this.esc = escalation(Math.max(0, this.round - this.rounds)); // (a fight can start in a later round: the tools, the lab)
    // (`stageLock`: a one-round fight held to one stage from the first bell: the Will Shard's final form in the Gauntlet)
    this.stageLock = opts.stageLock || 0;
    this.stage = this.stageLock || this.stageFor();
    this.stageT = 0;
    this.arena.state.round = this.stage;
    this.clockFrames = this.roundFrames;
    this.clockUsed = 0; // clock frames the whole fight has run
    this.points = 0;

    this.punchTimes = []; this.mashK = 1;
    this.kdRound = { player: 0, opp: 0 };
    this.kdTotal = { player: 0, opp: 0 };
    this.stats = { thrown: 0, landed: 0, counters: 0, starsEarned: 0, starPunches: 0, dodges: 0, blocked: 0, hitsTaken: 0, perfects: 0 };
    // this round, for the cornerman (src/fight/cornerman.js): punches taken by move, the supers that caught you, the anti-strategies
    // that fired, the golden moments found, the health you lost and your knockdowns
    this.roundLog = { hits: {}, antis: [], superHits: {}, damage: 0, downs: 0, golden: [] };
    this.track = new FightTracker(); // medal telemetry (src/fight/tracker.js)
    this.effects = [];
    this.shake = 0;
    this.clock = 0;
    this.paused = false;
    this.pauseSel = 0;
    this.result = null;
    this.setPhase(opts.announce && this.round === 1 ? 'announce' : 'intro');
    this.opp.state = 'idle'; this.opp.wait = 9999;
  }

  // (an arena with no crowd has no crowd noise either)
  sfx(name, arg) {
    if (this.track) this.track.cue(name);
    // (the Sight Shard's fight is in complete silence: nothing plays until the fight is decided, or while a modifier has silenced it)
    if (this.silence && !this.result) return;
    if (this.audio && !(name === 'crowd' && !this.arena.def.crowd)) this.audio.sfx(name, arg);
  }

  // A gimmick firing, for the medal telemetry (tracker.js): 'read', 'parry', 'teleport'...
  // (recorded as the cue '!name', so it can't collide with a sound of the same name)
  event(name) { if (this.track) this.track.cue('!' + name); if (this.opp && this.opp.know) this.opp.know.event(name); }

  // The fight theme, unless the arena keeps silent until a later round (ZERO's void).
  roundMusic() {
    if (!this.audio) return;
    if (this.d.silent || this.silence) { this.audio.stop(); return; } // (the Sight Shard: no music either)
    // a boss with a theme per form (Halcyon: dawn, noon, dusk)
    const RM = this.opts.roundSongs, song = RM ? RM[Math.min(this.bout && this.bout.staging === 'phase' ? this.bossPhase : this.round, RM.length) - 1] : this.opts.music;
    if (this.stage >= (this.arena.def.musicFrom || 1)) this.audio.play(song);
    else this.audio.stop();
  }

  // Real seconds since this round's bell (60 fps, whatever the displayed clock does).
  realSeconds() { return (this.roundFrames - this.clockFrames) / 60; }
  // how long a round lasts, in real seconds (his own: data/difficulty.js)
  roundReal() { return this.roundFrames / 60; }
  // What a fighter's round-by-round data reads as "the round" (his `stage`): his phase for a phase-staged boss (Halcyon's
  // forms), else the round, held at his last authored round once the championship rounds begin
  stageFor() {
    if (this.bout && this.bout.staging === 'phase') return this.bossPhase;
    if (this.bout) return Math.min(this.round, this.d.authoredRounds || 3);
    return Math.min(this.round, this.rounds); // (the championship rounds play like his last regular one)
  }
  // in his last phase (or no boss at all): only now can he be knocked out
  finalPhase() { return this.bossPhase >= this.bossPhases; }

  // One-round fights (the Gauntlet): every 60 game seconds counts as a new round
  // for the gimmicks that change by round. Called every fight frame.
  updateStage() {
    if (this.stageT > 0) this.stageT--;
    if (this.rounds > 1 || this.stageLock) return;
    const el = this.roundFrames - this.clockFrames;
    const st = Math.min(3, 1 + Math.floor(el / (this.roundFrames / 3)));
    if (st === this.stage) return;
    this.stage = st; this.stageT = 90;
    this.arena.state.round = st;
    this.roundMusic();
    this.opp.planSupers();
    this.opp.hook('stageChange', st);
  }

  // Opponent palette by name: 'default', 'highlight', or any registered palette
  // (modifiers swap to these: lamps, glows, the other twin...).
  // `hi` is its tell-highlight version, so the tell flash also shows on a fighter
  // wearing a swapped palette (the other twin, the Warden's riot, ZERO's echoes...).
  oppPalette(name, hi = false) {
    const key = hi ? name + '#hi' : name;
    if (!this.oppPal[key]) {
      if (hi) {
        const base = PALETTES[name] || PALETTES[this.d.palette];
        this.oppPal[key] = spritePalette(brighten(base.A), base.B && brighten(base.B)).u32;
      } else this.oppPal[key] = PALETTES[name] ? this.withExtras(name).u32 : this.oppPal.default;
    }
    return this.oppPal[key];
  }

  // A modifier's palette (a lamp glow, the Warden's riot) worn by a Title Defense
  // remix: his costume's extra colours are appended, so they keep their index.
  withExtras(name) {
    const own = PALETTES[this.d.palette], p = PALETTES[name];
    const ext = (a, b, nm) => (a && b && a.keys.length < b.keys.length
      ? makePalette(nm, { ...a.spec, ...Object.fromEntries(b.keys.slice(a.keys.length).map((k) => [k, b.spec[k]])) }) : a);
    if (!this.d.remix || name === this.d.palette || !own) return paletteFor(name);
    return spritePalette(ext(p.A, own.A, name + '+A'), p.B && ext(p.B, own.B, name + '+B'));
  }

  // Screen position of the opponent's head centre for a view ({ pose, dx, dy }).
  oppHead(v = this.opp.view()) {
    const b = this.oppSprites.build;
    const P = resolvePose(this.oppPoses, v.pose);
    const h = (b.body ? reshape(P, b.body) : P).head;
    return { x: OPP_X + v.dx + h.at[0] * b.scale[0], y: OPP_Y + v.dy + h.at[1] * b.scale[1], look: h.look || [0, 0] };
  }
  setPhase(p) { this.phase = p; this.pt = 0; }
  get countFrames() { return this.circuit.countFrames; }

  // Input seen by the player, after modifiers (screen flip, mirror...).
  mappedInput() {
    const inp = this.input, ai = this.opp;
    return {
      pressed: (a) => inp.pressed(ai.mapInput(a)),
      held: (a) => inp.held(ai.mapInput(a)),
    };
  }

  // Have both fighters' sprites composed in a worker (spriteCache.js warmInWorker). Only the fight screen calls it: the headless tools never draw
  // (his own poses first, the ones his moves and animations name, then the rest of the bank)
  warmSprites() {
    const need = new Set(), add = (a) => { if (!a) return; if (typeof a === 'string') need.add(a); else if (Array.isArray(a)) a.forEach(add); else if (a.frames) a.frames.forEach(add); };
    const d = this.d;
    Object.values(d.anims || {}).forEach(add);
    for (const m of Object.values(d.moves || {})) { const A = m.animation || {}; add(A.windup); add(A.active); add(A.recovery); }
    warmInWorker(this.plSprites);
    warmInWorker(this.oppSprites, [...need].filter((p) => this.oppSprites.poses.includes(p)));
    warmInWorker(this.oppSprites);
  }

  // =========================================================================
  update() {
    this.clock++;
    this.arena.update();
    const inp = this.input;
    if (['announce', 'intro', 'fight', 'between'].includes(this.phase) && inp.pressed('pause')) {
      this.paused = !this.paused; this.pauseSel = 0; this.sfx('menu');
      return;
    }
    if (this.paused) return this.updatePause();
    this.pt++;
    if (this.shake > 0) this.shake--;
    const P = this.player, O = this.opp;
    // a modifier can freeze the fight for a scene of its own (Quinn's standoff):
    // the player and the clock stop, the opponent's hooks keep running
    const held = this.phase === 'fight' && O.takeover();
    if (!held) P.update(this.mappedInput());

    switch (this.phase) {
      case 'announce':
        if (this.pt === 1) this.roundMusic();
        if (this.pt === 2) this.sfx('crowd');
        if (this.pt === 110) this.sfx('crowd', true);
        if (this.pt >= 220 || (this.pt > 30 && (inp.pressed('start') || inp.pressed('star') || this.tapped()))) this.setPhase('intro');
        break;
      case 'intro':
        if (this.pt === 1) this.roundMusic();
        if (this.pt === 72) this.sfx('bell', 1);
        // the bell: a modifier may throw something the instant it rings (Crowbar Cade)
        if (this.pt >= 104) { this.setPhase('fight'); O.resume(40); O.planSupers(); O.hook('fightStart'); if (this.bossPhases > 1 && O.know && this.round === 1) O.know.phaseStart(1); }
        break;
      case 'fight':
        this.behavior.frame();
        O.update();
        this.updateStage();
        if (held || this.opts.infiniteClock) break;
        this.clockUsed++;
        if (--this.clockFrames <= 0) { this.clockFrames = 0; this.roundEnd(); }
        break;
      case 'oppDown': this.updateOppDown(); break;
      case 'phaseShift': this.updatePhaseShift(); break;
      case 'playerDown': this.updatePlayerDown(); break;
      case 'roundEnd':
        if (this.pt >= 100) this.startBetween();
        break;
      case 'between': this.updateBetween(); break;
      case 'ko':
        if (this.pt >= 220 && (this.input.confirm() || this.tapped() || this.pt >= 480)) this.end();
        break;
      default: break;
    }
    if (['oppDown', 'playerDown', 'ko', 'phaseShift'].includes(this.phase) || O.state === 'kd' || O.state === 'getup') O.t++;
    this.effects = this.effects.filter((e) => ++e.t < e.life);
  }

  // a tap on the picture (touch): pushes a prompt that waits for START, where a press of A would be a punch
  tapped() { const i = this.input; return !!(i && typeof i.takeTaps === 'function' && i.takeTaps().length); }

  updatePause() {
    const inp = this.input;
    // touch: a tap on RESUME / QUIT chooses it, and on the one already chosen does it
    if (inp && typeof inp.takeTaps === 'function') for (const tp of inp.takeTaps()) {
      if (tp.x < 72 || tp.x > 184) continue;
      const i = Math.floor((tp.y - 100) / 12);
      if (i < 0 || i > 1) continue;
      if (i !== this.pauseSel) { this.pauseSel = i; this.sfx('menu'); } else inp.fake('a');
    }
    if (inp.pressed('up') || inp.pressed('down')) { this.pauseSel ^= 1; this.sfx('menu'); }
    if (inp.confirm()) {
      this.sfx('confirm');
      if (this.pauseSel === 0) this.paused = false;
      else { this.paused = false; this.result = { winner: 'none', method: 'QUIT', forfeit: this.quitForfeits() }; this.end(); }
    }
  }

  // Does walking out now count as a loss? opts.forfeit: 'always' (a run's fight),
  // 'afterBell' (career: free until round 1's bell), or unset (practice, the lab).
  quitForfeits() {
    const F = this.opts.forfeit;
    return F === 'always' || (F === 'afterBell' && !(this.round === 1 && ['announce', 'intro'].includes(this.phase)));
  }

  end() {
    if (this.ended) return;
    this.ended = true;
    this.phase = 'done';
    // a fight against Dash goes in his file (walking out of it doesn't)
    if (this.d.rival && this.opts.rivalRecord && this.result && this.result.method !== 'QUIT') {
      this.opts.rivalRecord.put({ ...this.behavior.strategy(), fight: this.d.id });
    }
    // the cornerman remembers who beat you (his hints get a little clearer each time, src/fight/cornerman.js)
    if (this.opts.corner && this.result && this.result.winner === 'opponent' && (this.result.method !== 'QUIT' || this.result.forfeit)) this.opts.corner.lost(this.d.scoutId || this.d.id);
    if (this.opts.onEnd) this.opts.onEnd(this.result);
  }

  // --- opponent throws a punch (called at the first active frame) -----------
  opponentAttack(move) {
    if (this.phase !== 'fight') return 'dodged';
    const P = this.player;
    const was = P.state;
    const r = P.defend(move);
    // defense rules (knowledge spec K3): a valid defense can still cost you (defenseCost:
    // blocking the anchor breaks your guard), and the wrong one can cost extra (wrongDefensePenalty)
    const cost = move.defenseCost && move.defenseCost[{ dodged: 'dodge', blocked: 'block', ducked: 'duck' }[r]];
    if (cost) this.defenseCost(cost);
    if (r === 'hit') {
      this.stats.hitsTaken++;
      const H = (this.roundLog.hits[move.id || move.name] ||= { name: move.name, avoidBy: move.avoidBy || [], counterWindow: move.counterWindow, n: 0 });
      H.n++;
      if (this.opp.armor) { const k = superKey(this.opp.armor.S); this.roundLog.superHits[k] = (this.roundLog.superHits[k] || 0) + 1; } // (a super caught you)
      // you defended, just the wrong way: say what would have worked
      if (['dodge', 'block', 'duck'].includes(was)) {
        // (no call-out in the fight any more, spec §4: the cornerman talks about it between rounds, from the round log)
        const W = move.wrongDefensePenalty && (move.wrongDefensePenalty[was] || move.wrongDefensePenalty.any);
        if (W) move = { ...move, damage: Math.round(move.damage * (W.damage || 1)), wrongStar: W.star };
      }
      P.takeHit();
      this.shake = 8;
      this.sfx('playerHit');
      this.effects.push({ kind: 'spark', x: PLAYER_X + (Math.random() < 0.5 ? -4 : 4), y: PLAYER_Y - 50, t: 0, life: 12 });
      if (this.opts.invincible) return 'hit';
      const dmg = Math.round(move.damage * this.d.stats.damageMult * this.perk.damageTaken * this.esc.damage);
      if (!this.opts.infiniteHealth) { // (Practice: unlimited health; hearts still go on their own switch)
        const before = P.health;
        P.health = Math.max(0, P.health - dmg);
        if (move.knockdown) P.health = 0; // one-hit knockdown signatures (Major and up)
        this.roundLog.damage += before - P.health;
      }
      this.loseHearts(this.circuit.heartsLostOnHit);
      if (P.stars > 0 && (move.wrongStar || Math.random() < this.d.stats.starLossChance * this.perk.starLoss)) {
        P.stars--; this.sfx('starLost');
        this.effects.push({ kind: 'lostStar', x: 20, y: 26, t: 0, life: 40 });
      }
      if (P.health <= 0) this.playerKnockdown();
    } else if (r === 'dodged' || r === 'ducked') {
      this.stats.dodges++;
      if (r === 'dodged') this.opp.lastSlip = P.dir < 0 ? 'L' : 'R'; // (a golden moment can need the slip to one side)
      if (P.pink) { P.hearts = Math.min(this.maxHearts, P.hearts + this.circuit.heartsOnDodge + this.perk.dodgeHearts); P.pink = false; this.sfx('heartBack'); }
    } else if (r === 'blocked') {
      this.sfx('punchBlock');
      this.effects.push({ kind: 'block', x: PLAYER_X, y: PLAYER_Y - 52, t: 0, life: 10 });
    }
    return r;
  }

  // what a costly defense takes: a broken guard (frames), hearts, and the text for it
  defenseCost(c) {
    const P = this.player;
    if (c.guardBreak) { P.guardBroken = c.guardBreak; this.sfx('clang'); }
    if (c.hearts) this.loseHearts(c.hearts);
    void c.say; // (its call-out is no longer shown in the fight)
  }

  // A clinch's squeeze (Player.hold): a little damage, a heart. Never a knockdown by itself.
  squeeze(H) {
    const P = this.player;
    this.sfx('punchLand'); this.shake = 5;
    this.effects.push({ kind: 'spark', x: PLAYER_X + (Math.random() < 0.5 ? -6 : 6), y: PLAYER_Y - 44, t: 0, life: 10 });
    this.loseHearts(H.heart);
    if (this.opts.invincible || this.opts.infiniteHealth) return;
    const dmg = Math.round(H.damage * this.d.stats.damageMult * this.perk.damageTaken * this.esc.damage);
    P.health = Math.max(1, P.health - dmg);
  }

  loseHearts(n) {
    const P = this.player;
    if (this.opts.infiniteHearts) return;
    P.hearts = Math.max(0, P.hearts - n);
    if (P.hearts === 0 && !P.pink) { P.pink = true; this.sfx('heartOut'); }
  }

  // --- the player's punch connects (called at the impact frame) -------------
  playerPunch(p) {
    if (this.phase !== 'fight') return;
    const O = this.opp, P = this.player;
    this.stats.thrown++;
    if (p.star) this.stats.starPunches++;
    const countering = O.state === 'windup' && O.move ? O.move.id : null;
    // mash fatigue (data/difficulty.js MASH): the more punches wasted in the last stretch, the less any punch does
    const T = this.punchTimes;
    while (T.length && this.clock - T[0] > MASH.window) T.shift();
    this.mashK = T.length < MASH.free ? 1 : Math.max(MASH.floor, Math.pow((MASH.free + 1) / (T.length + 1), MASH.power));
    const r = O.onPlayerPunch(p);
    if (r.result !== 'hit') T.push(this.clock); // (only the punches that found nothing: a block, a whiff, a rebuff)
    this.track.punch(p, r, countering);
    this.behavior.punch(p, r, O.punch.state);
    const x = OPP_X + (p.star ? 0 : p.side === 'L' ? -6 : 6);
    const y = OPP_Y - (p.high || p.star ? 98 : 66);
    if (r.result === 'hit') {
      this.stats.landed++;
      if (r.counter) this.stats.counters++;
      this.points += (p.high ? POINTS.headHit : POINTS.bodyHit) + (r.counter ? POINTS.counterBonus : 0) + (p.star ? POINTS.starPunch : 0);
      this.effects.push({ kind: 'spark', x, y, t: 0, life: 12 });
      this.sfx(p.star || r.counter ? 'punchHeavy' : 'punchLand');
      if (p.star) { this.sfx('starPunch'); this.shake = 8; this.arena.reaction('star'); }
      // circuits from Continental on cap the stars you can earn per round (§9: "star windows go
      // from plentiful to 1-2 per round")
      if (r.star && this.circuit.starsPerRound && this.roundStars >= this.circuit.starsPerRound) r.star = false;
      if (r.star) {
        this.roundStars = (this.roundStars || 0) + 1;
        // (a star past three held is not earned: no points for it either)
        if (P.stars < 3) { P.stars++; this.stats.starsEarned++; this.points += POINTS.starEarned; }
        this.sfx('star');
        this.arena.reaction('star');
        this.effects.push({ kind: 'star', x: OPP_X, y: OPP_Y - 116, t: 0, life: 36 });
      }
      if (r.knockdown && O.health > 0) {
        // the golden moment (or another perfect hit): exactly the right frame drops him, health to zero, the count starts
        O.health = 0;
        this.stats.perfects++;
        this.points += POINTS.perfectHit;
        this.sfx('perfect');
        this.shake = 12; this.arena.reaction('knockdown');
        this.effects.push({ kind: 'perfect', x: 128, y: 64, t: 0, life: 70 });
      } else if (r.goldenStun) {
        // a big boss's golden moment: his super is cancelled and he reels, wide open (the crowd sees it, no text)
        this.stats.perfects++;
        this.points += POINTS.perfectHit;
        this.sfx('perfect');
        this.shake = 12; this.arena.reaction('knockdown');
        this.effects.push({ kind: 'perfect', x: 128, y: 64, t: 0, life: 70 });
      }
      if (O.health <= 0) this.oppKnockdown();
    } else if (r.result === 'blocked') {
      this.stats.blocked++;
      if (!r.clang && !r.absorbed && !r.clank) this.sfx('punchBlock');
      if (!r.evaded) this.effects.push({ kind: 'block', x, y, t: 0, life: 10 });
      this.loseHearts(this.d.stats.heartDrainOnBlock ?? this.circuit.heartsLostOnBlock);
      if (!p.star) P.rebuffed();
    } else if (!r.teleport) {
      this.sfx('whiff');
    }
  }

  // --- knockdowns --------------------------------------------------------------
  oppKnockdown() {
    const O = this.opp;
    if (!this.finalPhase()) return this.phaseBreak();
    this.kdRound.opp++; this.kdTotal.opp++; O.knockdowns++;
    this.track.knockdown(this.round);
    O.hook('onKnockdown');
    this.points += POINTS.knockdown;
    O.state = 'kd'; O.t = 0; O.move = null; O.endArmor();
    O.forgetGuard();
    this.player.set('idle');
    this.shake = 10;
    this.sfx('knockdown'); this.sfx('crowd', true);
    this.arena.reaction('knockdown');
    this.count = 0;
    this.tko = this.kdRound.opp >= 3 || this.esc.sudden; // (sudden death: the first knockdown ends it)
    this.endBy = this.kdRound.opp >= 3 ? 'TKO' : 'KO';
    const tbl = this.d.getUpTable;
    this.kdForm = (this.kdForm || 0) + 1;
    const e = tbl[Math.min((this.bossPhases > 1 ? this.kdForm : this.kdTotal.opp) - 1, tbl.length - 1)]; // (a boss: the knockdowns of his last phase)
    this.getUpEntry = e;
    this.getUpAt = null;
    if (e.upAt && !(e.stayDown && Math.random() < e.stayDown)) {
      this.getUpAt = e.upAt[0] + Math.floor(Math.random() * (e.upAt[1] - e.upAt[0] + 1));
    }
    if (this.opts.oppNeverDown) this.getUpAt = 1;
    this.setPhase('oppDown');
  }

  updateOppDown() {
    const O = this.opp;
    if (this.tko) { if (this.pt === 60) this.finish(this.endBy, 'player'); return; }
    if (O.state === 'getup') {
      // a dirty fighter doesn't wait for the ref: up mid-count and straight into a
      // punch (get-up entry `sneak`: the move, `sneakAt`: frames of scrambling up first)
      const e = this.getUpEntry;
      if (e.sneak && O.t >= (e.sneakAt ?? 14)) {
        O.health = Math.max(1, Math.round(O.maxHealth * (e.health || 0.5) * this.esc.getUp));
        O.resume(0);
        this.setPhase('fight');
        O.hook('sneak');
        O.hook('getUp');
        O.beginMove(e.sneak, { forced: true });
        return;
      }
      if (O.t >= 40) {
        O.health = Math.max(1, Math.round(O.maxHealth * (this.getUpEntry.health || 0.5) * this.esc.getUp));
        O.resume(50);
        this.setPhase('fight');
        O.hook('getUp');
      }
      return;
    }
    if (this.pt >= 40 && (this.pt - 40) % this.countFrames === 0) {
      this.count++;
      this.sfx('count');
      if (this.getUpAt && this.count >= this.getUpAt) { O.state = 'getup'; O.t = 0; this.sfx('crowd'); }
      else if (this.count >= 10) this.finish('KO', 'player');
    }
  }

  // A big boss's phase is over (its health bar emptied before his last phase): he goes down, and gets back up transformed
  // at full health. Never a count, never a TKO: only the last phase can be knocked out (spec §4 "Boss phases").
  phaseBreak() {
    const O = this.opp;
    this.kdTotal.opp++; O.knockdowns++;
    this.track.knockdown(this.round);
    O.hook('onKnockdown');
    this.points += POINTS.knockdown;
    O.state = 'kd'; O.t = 0; O.move = null; O.endArmor(); O.forced = [];
    O.forgetGuard();
    this.player.set('idle');
    this.shake = 12;
    this.sfx('knockdown'); this.sfx('crowd', true);
    this.arena.reaction('ko');
    this.formBreak = this.bossPhase;
    this.event('formBroken'); // (a phase broken: Halcyon's medal counts them)
    this.setPhase('phaseShift');
  }
  updatePhaseShift() {
    const O = this.opp;
    // down (his knockdown frames, then flat), a flash, the music turns, and he rises as the next phase
    if (this.pt === 70) {
      this.bossPhase++;
      this.kdForm = 0;
      this.stage = this.stageLock || this.stageFor();
      this.arena.state.round = this.stage;
      O.maxHealth = O.phaseHealth ? O.phaseHealth(this.bossPhase) : O.maxHealth;
      O.health = O.maxHealth;
      O.goldenUntil = 0;
      O.pattern = null; O.stepIdx = 0;
      O.hook('phaseStart', this.bossPhase);
      if (O.know) O.know.phaseStart(this.bossPhase);
      this.phaseGlow = PHASE_GLOW; // (one soft white wash that fades: nothing strobes)
      this.sfx('bell', 1);
      this.roundMusic();
      O.state = 'getup'; O.t = 0;
    }
    if (this.pt >= 110) {
      O.resume(40);
      this.setPhase('fight');
      O.hook('getUp');
    }
  }
  playerKnockdown() {
    const P = this.player, O = this.opp;
    this.kdRound.player++; this.kdTotal.player++; this.roundLog.downs++;
    this.behavior.knockedDown();
    O.hook('playerDown');
    P.set('down'); P.queued = null;
    O.state = 'taunt'; O.wait = 9999; O.move = null; O.t = 0; O.endArmor(); O.superTaunt = false;
    O.forgetGuard();
    this.shake = 12;
    this.sfx('knockdown'); this.sfx('crowd', true);
    this.arena.reaction('knockdown');
    this.count = 0; this.mash = 0;
    this.tko = this.kdRound.player >= 3 || this.esc.sudden;
    this.endBy = this.kdRound.player >= 3 ? 'TKO' : 'KO';
    this.setPhase('playerDown');
  }

  updatePlayerDown() {
    const P = this.player, O = this.opp;
    if (this.tko) { if (this.pt === 70) this.finish(this.endBy, 'opponent'); return; }
    if (P.state === 'getup') {
      if (P.t >= 30) {
        const k = this.kdTotal.player;
        P.health = Math.round(P.maxHealth * Math.max(0.25, 0.62 - 0.12 * (k - 1)));
        P.set('idle');
        O.resume(60);
        this.setPhase('fight');
        this.behavior.gotUp(); // mashed back up (the get-up-mash anti-strategy watches this)
        O.hook('playerUp');
      }
      return;
    }
    if (O.state === 'taunt' && this.pt > 70) O.state = 'idle';
    if (this.pt >= 40) {
      // the get-up mash is the fighter's (data/difficulty.js: presses a second needed, rising per knockdown, a wall late on)
      const G = this.d.getUp, M = this.circuit.mash, k = this.kdTotal.player;
      const decay = G ? mashDecay(G, k) : M.decay * (1 + M.perKnockdown * (k - 1));
      const power = (G ? G.power : M.power) + (this.trainer.id === 'oldschool' ? 1 : 0) + this.perk.getUp; // Old-school: +1 get-up strength
      if (this.input.pressed('a') || this.input.pressed('b')) { this.mash += power; this.sfx('mash'); }
      this.mash = Math.max(0, this.mash - decay);
      if (this.mash >= 100) { P.set('getup'); this.sfx('crowd'); return; }
      if ((this.pt - 40) % this.countFrames === 0) {
        this.count++;
        this.sfx('count');
        if (this.count >= 10) this.finish('KO', 'opponent');
      }
    }
  }

  finish(method, winner) {
    const P = this.player, O = this.opp;
    this.result = this.makeResult(winner, method);
    this.setPhase('ko');
    this.banner = method === 'KO' ? 'K.O.!' : method === 'DQ' ? 'DISQUALIFIED!' : 'T.K.O.!';
    if (winner === 'player') { P.set('victory'); if (O.state !== 'kd' && O.state !== 'down') { O.state = 'kd'; O.t = 30; } }
    else { O.state = 'victory'; if (P.state !== 'down') P.set('down'); }
    this.sfx('bell', 3);
    this.sfx('crowd', true);
    this.arena.reaction('ko');
    if (this.audio) this.audio.play(winner === 'player' ? this.opts.victoryMusic : this.opts.defeatMusic);
  }

  makeResult(winner, method) {
    // the time in the round, in game seconds (the clock on screen); `seconds` is the whole fight in game seconds (24 frames each:
    // the medals' and the Gauntlet's unit)
    const elapsedFrames = this.roundFrames - this.clockFrames, elapsed = Math.ceil(elapsedFrames / this.fps);
    return {
      winner, method, round: this.round, championship: this.round > this.rounds,
      time: clockString(elapsed),
      // total game seconds fought (the Gauntlet's clock), and what the player has left
      seconds: Math.round(((this.round - 1) * this.roundFrames + elapsedFrames) / FRAMES_PER_SEC), phase: this.bossPhase,
      health: this.player.health, stars: this.player.stars,
      points: Math.max(0, Math.floor(this.points)),
      stats: { ...this.stats }, knockdowns: { ...this.kdTotal },
      opponent: this.d.id, remix: !!this.d.remix,
      track: this.track.summary(),
    };
  }

  // --- rounds --------------------------------------------------------------------
  roundEnd() {
    this.setPhase('roundEnd');
    this.sfx('bell', 3);
    this.player.set('idle');
    this.opp.resume(9999);
    this.opp.forgetGuard();
  }

  startBetween() {
    this.setPhase('between');
    const O = this.opp;
    // his recovery shrinks with every championship round, then stops (the round coming up: data/difficulty.js CHAMPIONSHIP)
    this.nextEsc = escalation(Math.max(0, this.round + 1 - this.rounds));
    O.health = Math.min(O.maxHealth, Math.round(O.health + O.maxHealth * (this.d.stats.betweenRoundHeal || 0) * this.nextEsc.oppHeal));
    O.mods.cornerNote = null;
    O.hook('betweenRounds', this.round);
    this.player.hearts = this.maxHearts;
    this.player.pink = false;
    this.corner = new BetweenRounds(this);
  }

  updateBetween() {
    if (this.corner.update()) this.nextRound();
  }

  nextRound() {
    this.corner = null;
    this.round++;
    this.esc = escalation(Math.max(0, this.round - this.rounds));
    this.stage = this.stageLock || this.stageFor();
    this.clockFrames = this.roundFrames;
    this.kdRound = { player: 0, opp: 0 };
    this.roundStars = 0;
    this.opp.state = 'idle'; this.opp.wait = 9999;
    this.opp.stepIdx = 0; this.opp.pattern = null;
    this.arena.state.round = this.stage; // arenas that change between rounds (the Nightmare void; a boss's arena follows his phase)
    this.opp.hook('roundStart', this.round);
    this.setPhase('intro');
  }

  // Fight-lab helpers
  forceMove(id) { this.opp.forced.push(id); if (this.opp.state === 'idle') this.opp.wait = 1; }

  // =========================================================================
  render(frame) {
    // the corner screen replaces the ring between rounds
    if (this.phase === 'between') { this.corner.render(frame); if (this.paused) this.renderPause(frame); return; }
    frame.clear(COL.black);
    this.arena.draw(frame);
    const O = this.opp, P = this.player;
    this.renderReferee(frame);

    // opponent + shadow
    const ov = O.view();
    const oppDown = O.state === 'down' || (O.state === 'kd' && O.t >= 22);
    if (!ov.hidden) {
      const lift = ov.lift || 0; // backed off for his super: shadow goes with him, a little smaller
      ellipse(frame, OPP_X + ov.dx, OPP_Y + 1 - lift, oppDown ? 44 : 26 - (lift >> 2), oppDown ? 6 : 4, this.shadowCol);
      const flash = this.opts.tellHighlight && O.state === 'windup' && (O.moveT >> 2) % 2 === 0;
      const palName = O.paletteOverride() || 'default';
      const pal = palName === 'highlight' ? this.oppPal.highlight : this.oppPalette(palName, flash);
      frame.blit(this.oppSprites.get(ov.pose), OPP_X + ov.dx, OPP_Y + ov.dy, pal, { layer: OPP_LAYER, dither: ov.ghost ? 1 : 0, scale: 1 - (0.12 * lift) / SUPER_DEPTH });
    }
    for (const m of O.modifiers) if (m.def.renderOpp) m.def.renderOpp(O, m.cfg, frame, this);
    if (O.know && !ov.hidden) O.know.renderOpp(frame, this);
    // the golden moment's tell: a small glint by his head, only on the first frames to throw (a star-timed one STAR_IMPACT ahead).
    // Subtle on purpose (spec §4): no prompt, no flashing; the same point in his super every time, so it can be learned.
    if (this.phase === 'fight' && !ov.hidden) {
      const H = O.cueHit(), lead = (H && H.star) || this.d.kdStar ? PT.STAR_IMPACT : PT.JAB_IMPACT;
      const on = O.kdCue(lead);
      if (on && !this.cueOn) { this.cueAt = this.clock; this.sfx('glint'); }
      this.cueOn = on;
      if (on && this.clock - this.cueAt < 4) { const h = this.oppHead(ov); glint(frame, Math.round(h.x + 18), Math.round(h.y - 14)); }
    }

    // effects on the opponent
    for (const e of this.effects) {
      if (e.kind === 'spark') frame.blit(SPARKS[Math.min(2, Math.floor(e.t / 4))], e.x, e.y, UIPAL);
      else if (e.kind === 'block') frame.blit(BLOCK_SPARK, e.x, e.y, UIPAL);
      else if (e.kind === 'star') frame.blit(BIG_STAR, e.x, e.y - Math.min(12, e.t), UIPAL);
    }

    // player (see-through over the opponent: checker dither, outline kept)
    {
      const pv = P.view();
      const pal = P.pink ? this.plPal.pink : this.plPal.default;
      frame.blit(this.plSprites.get(pv.pose), PLAYER_X + pv.dx, PLAYER_Y + pv.dy, pal, { see: this.opts.solidPlayer ? 0 : OPP_LAYER, keep: this.plOutline });
    }

    // the whole ring scene is done: a modifier may transform it before the HUD goes on (Eclipse's flip)
    for (const m of O.modifiers) if (m.def.postScene) m.def.postScene(O, m.cfg, frame, this);
    drawHUD(frame, this);
    for (const e of this.effects) if (e.kind === 'lostStar') frame.blit(BIG_STAR, e.x, e.y + e.t, UIPAL);
    // (no in-fight call-outs: the golden moment shows as the hit itself, a big burst and the crowd; spec §4)
    for (const e of this.effects) if (e.kind === 'perfect' && e.t < 10) frame.blit(SPARKS[Math.min(2, e.t >> 2)], OPP_X, OPP_Y - 92, UIPAL, { scale: 2 });
    if (this.flash > 0) { this.flash--; if (this.flash & 1) frame.rect(0, 0, 256, 224, COL.white); }
    if (this.phaseGlow > 0) {
      // a boss's new phase: the ring washes white and clears over PHASE_GLOW frames (an ordered dither, thinning out)
      const k = this.phaseGlow-- / PHASE_GLOW;
      for (let y = 0; y < 224; y++) for (let x = 0; x < 256; x++) if (GLOW_B4[(y & 3) * 4 + (x & 3)] / 16 < k * 0.85) frame.px(x, y, COL.white);
    }
    this.renderOverlays(frame);
    for (const m of O.modifiers) if (m.def.render) m.def.render(O, m.cfg, frame, this);
    if (O.know) O.know.render(frame, this);
    // (a broken guard shows on the player: no text, spec §4; the clang plays when it breaks)
    if (this.opts.labOverlay && !O.takeover()) this.renderLab(frame); // (a scene of his own, like Quinn's standoff, has no move to chart)
    if (this.paused) this.renderPause(frame);
  }

  renderOverlays(frame) {
    const blink = (this.clock >> 4) & 1;
    // his taunt before a super: its shout
    const O = this.opp, S = O.sup;
    void S; // (his super's shout is heard, not shown: no in-fight text but SCOUTED!, spec §4)
    switch (this.phase) {
      case 'announce': this.renderAnnounce(frame); break;
      case 'intro': {
        // a modifier can lift the banner off something the player must see (Cade's creep)
        let y = 92;
        for (const m of this.opp.modifiers) if (m.def.bannerY) y = m.def.bannerY(this.opp, m.cfg, y) ?? y;
        const champ = this.round > this.rounds;
        if (this.pt >= 72) drawTextBig(frame, 'FIGHT!', 128, y, COL.yellow, COL.black, 3);
        else if (!champ) drawTextBig(frame, `ROUND ${this.round}`, 128, y, COL.white, COL.black, 3);
        else {
          // the championship rounds: no judges, and from round 6 the first knockdown ends it
          drawTextBig(frame, this.esc.sudden ? 'SUDDEN DEATH' : 'CHAMPIONSHIP', 128, y - 14, this.esc.sudden ? COL.red : COL.yellow, COL.black, 2);
          drawTextBig(frame, `ROUND ${this.round}`, 128, y + 6, COL.white, COL.black, 3);
          this.renderRingCall(frame);
        }
        break;
      }
      case 'oppDown':
        if (this.tko) drawTextBig(frame, 'DOWN!', 128, 92, COL.yellow, COL.black, 3);
        else if (this.count > 0 && this.opp.state !== 'getup') drawTextBig(frame, String(this.count), 128, 88, COL.white, COL.black, 4);
        else if (this.pt < 40) drawTextBig(frame, 'DOWN!', 128, 92, COL.yellow, COL.black, 3);
        break;
      case 'playerDown': {
        if (this.count > 0 && this.player.state !== 'getup') drawTextBig(frame, String(this.count), 128, 60, COL.white, COL.black, 4);
        if (!this.tko && this.player.state !== 'getup' && this.pt >= 40) {
          panel(frame, 64, 140, 128, 30);
          drawTextCentered(frame, 'MASH A / B', 128, 144, COL.yellow); // (a steady input prompt while you're down; nothing flashes)
          frame.rect(70, 156, 116, 8, COL.barBack);
          frame.rect(71, 157, Math.round(114 * Math.min(1, this.mash / 100)), 6, COL.cyan);
        }
        break;
      }
      case 'roundEnd':
        drawTextBig(frame, `END OF ROUND ${this.round}`, 128, 92, COL.white, COL.black, 2);
        break;
      case 'ko':
        drawTextBig(frame, this.banner, 128, 84, (this.clock >> 3) & 1 ? COL.yellow : COL.red, COL.black, 4);
        if (this.pt >= 220 && blink) drawTextCentered(frame, 'PUSH START', 128, 124, COL.white);
        break;
      default: break;
    }
  }

  // The ring announcer, in the intro of the first championship round and of the first round of sudden death (each comes once a fight);
  // the cornerman has said his piece in the corner
  renderRingCall(frame) {
    const sudden = this.esc.sudden && this.esc.c === CHAMPIONSHIP.suddenFrom;
    if (this.esc.c !== 1 && !sudden) return;
    const L = sudden ? ['SUDDEN DEATH!', 'THE FIRST KNOCKDOWN', 'ENDS THE FIGHT!'] : ['LADIES AND GENTLEMEN...', 'NO JUDGES TONIGHT!', 'CHAMPIONSHIP ROUNDS!'];
    const h = 10 + L.length * 12, y0 = 190 - h;
    panel(frame, 24, y0, 208, h);
    L.forEach((l, i) => drawTextCentered(frame, l, 128, y0 + 6 + i * 12, i === L.length - 1 ? COL.yellow : i ? COL.white : COL.cyan));
  }

  // Ring announcer (§7: uses the player's name and nickname).
  renderAnnounce(frame) {
    const c = this.d.card || {};
    const lines = this.pt < 110
      ? ['INTRODUCING...', c.hometown ? `FROM ${c.hometown},` : '', `"${this.d.nickname}"`, this.d.name + '!']
      : ['AND IN THIS CORNER...', `${this.profile.name}`, `"${nicknameOf(this.profile)}"!`, ''];
    // each line in the mono face when it fits the card, else the narrow one, wrapped (a long hometown takes two lines);
    // the card grows upward to hold them
    const L = [], ls = lines.filter(Boolean);
    ls.forEach((l, i) => {
      const col = i === 0 ? COL.cyan : i === ls.length - 1 ? COL.yellow : COL.white;
      if (textWidth(l, true) <= ANNOUNCE_W) L.push([l, col, true]);
      else for (const w of layout(l, ANNOUNCE_W, false)) L.push([w, col, false]);
    });
    const h = 10 + L.length * 12, y0 = 190 - h;
    panel(frame, 24, y0, 208, h);
    L.forEach(([l, col, mono], i) => drawTextCentered(frame, l, 128, y0 + 6 + i * 12, col, { mono }));
  }

  renderPause(frame) {
    panel(frame, 72, 80, 112, 56);
    drawTextCentered(frame, 'PAUSED', 128, 88, COL.yellow);
    ['RESUME', this.quitForfeits() ? 'FORFEIT' : 'QUIT'].forEach((t, i) => {
      drawText(frame, t, 108, 104 + i * 12, i === this.pauseSel ? COL.white : COL.grey);
      if (i === this.pauseSel) drawText(frame, '>', 94, 104 + i * 12, COL.red);
    });
  }

  // The referee, at the back of the ring (behind the fighters) while anyone is
  // down: his arm up, chopping down on every count; waving it off at a KO.
  renderReferee(frame) {
    const ph = this.phase;
    if (!['oppDown', 'playerDown', 'ko'].includes(ph)) return;
    if (!this.refSprites) { this.refSprites = fighterSprites('referee'); this.refPal = paletteFor('referee').u32; }
    let pose = 'refStand';
    if (ph === 'ko') pose = this.pt < 100 && (this.pt >> 3) & 1 ? 'refWave' : 'refStand';
    else if (this.pt >= 40 && !(ph === 'oppDown' && this.opp.state === 'getup') && !(ph === 'playerDown' && this.player.state === 'getup')) {
      pose = (this.pt - 40) % this.countFrames < 10 ? 'refCount2' : 'refCount1';
    }
    const x = 40, y = 146;
    ellipse(frame, x, y + 1, 14, 3, this.shadowCol);
    frame.blit(this.refSprites.get(pose), x, y, this.refPal, { scale: 0.72 });
  }

  // Tell / counter / star windows as colored frame bars (fight-lab).
  renderLab(frame) {
    const tl = this.opp.timeline();
    const x0 = 4, y0 = 210, W = 248;
    frame.rect(x0 - 1, y0 - 10, W + 2, 21, COL.black);
    // exploit windows (knowledge spec K7): green bars over the frames they live on
    const K = this.opp.know, XW = K ? K.windows() : [];
    if (!tl) {
      const O = this.opp, ow = XW.find((w) => w.where === 'open');
      drawText(frame, `${O.state.toUpperCase()}${O.state === 'open' && O.openStep ? ` ${O.openStep.id || O.openStep.anim} ${O.t}/${O.t + O.wait}F` : ''}`, x0 + 2, y0 - 8, COL.grey, { mono: false });
      if (ow && O.openStep) {
        const tot = O.t + O.wait, sx = (f) => x0 + Math.round((Math.min(f, tot) / tot) * W);
        frame.rect(x0, y0, W, 8, LAB.recovery);
        frame.rect(sx(ow.w[0]), y0 + 1, Math.max(1, sx(ow.w[1] + 1) - sx(ow.w[0])), 6, LAB.exploit);
        frame.rect(sx(O.t), y0 - 2, 1, 12, COL.white);
        drawText(frame, `EXPLOIT: ${ow.name}`, x0 + 120, y0 - 8, COL.green, { mono: false });
      }
      return;
    }
    const m = tl.move;
    const total = m.windupFrames + m.activeFrames + m.recoveryFrames;
    const sx = (f) => x0 + Math.round((f / total) * W);
    frame.rect(sx(0), y0, sx(m.windupFrames) - sx(0), 8, LAB.windup);
    if (m.counterWindow) frame.rect(sx(m.counterWindow[0]), y0 + 1, sx(m.counterWindow[1] + 1) - sx(m.counterWindow[0]), 3, LAB.counter);
    if (m.starWindow) frame.rect(sx(m.starWindow[0]), y0 + 4, sx(m.starWindow[1] + 1) - sx(m.starWindow[0]), 3, LAB.star);
    if (m.kdWindow) frame.rect(sx(m.kdWindow[0]), y0 - 1, sx(m.kdWindow[1] + 1) - sx(m.kdWindow[0]), 10, COL.white);
    frame.rect(sx(m.windupFrames), y0, sx(m.windupFrames + m.activeFrames) - sx(m.windupFrames), 8, LAB.active);
    frame.rect(sx(m.windupFrames + m.activeFrames), y0, sx(total) - sx(m.windupFrames + m.activeFrames), 8, LAB.recovery);
    for (const w of XW) {
      const off = w.where === 'recovery' ? m.windupFrames + m.activeFrames : 0;
      frame.rect(sx(off + w.w[0]), y0 + 7, Math.max(1, sx(off + w.w[1] + 1) - sx(off + w.w[0])), 3, LAB.exploit);
    }
    frame.rect(sx(tl.at), y0 - 2, 1, 12, COL.white);
    drawText(frame, `${m.name} ${this.opp.state.toUpperCase()} ${tl.at}F`, x0 + 2, y0 - 8, COL.white, { mono: false });
    if (XW.length) { const t = `X: ${XW.map((w) => w.name + (w.hand ? ' ' + w.hand : '') + (w.height ? ' ' + (w.height === 'low' ? 'BODY' : 'HEAD') : '')).join(', ')}`; drawText(frame, t, x0 + W - textWidth(t, false), y0 - 8, COL.green, { mono: false }); }
  }
}

const LAB = {
  windup: c32(26, 22, 4), counter: c32(6, 14, 31), star: c32(31, 8, 28),
  active: c32(28, 4, 4), recovery: c32(10, 11, 14), exploit: c32(6, 30, 10),
};

// A 4-point glint: the "hit him NOW" cue for a perfect-hit window.
function glint(frame, x, y) {
  // a small four-point sparkle, white at the heart (no outline, no blink: the subtle tell of a golden moment)
  for (let i = -3; i <= 3; i++) { const c = Math.abs(i) < 2 ? COL.white : COL.yellow; frame.px(x + i, y, c); frame.px(x, y + i, c); }
}

function ellipse(frame, cx, cy, rx, ry, color) {
  for (let y = -ry; y <= ry; y++) {
    const w = Math.round(rx * Math.sqrt(1 - (y / (ry + 0.5)) ** 2));
    frame.rect(cx - w, cy + y, w * 2, 1, color);
  }
}

// Tell-highlight palette swap: every color pushed toward white (still 15-bit).
function brighten(pal) {
  const o = {};
  for (const k of pal.keys) {
    const [r, g, b] = pal.spec[k];
    o[k] = [Math.min(31, r + 8), Math.min(31, g + 8), Math.min(31, b + 8)];
  }
  return swapPalette(pal.name + '.hi', pal, o);
}
