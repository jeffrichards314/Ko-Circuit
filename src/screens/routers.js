// Screens that used to be cutscenes of their own and are now scenes of the engine (spec §19 G5). The game still says go('fall'), go('jog', ...),
// go('rival', ...): these little screens work out the parameters (who is talking, what comes next) and hand over to the CutsceneScreen.
import { COL } from '../fight/hud.js';
import { TALK, SECRET_TALK, SIGN_OFF, FERRY_TALK } from '../../data/cutscenes/talk.js';
import { SCENES } from '../../data/cutscenes/index.js';
import { CIRCUITS, zoneOf } from '../../data/circuits.js';
import { isSecret } from '../save/career.js';
import { RIVAL_SCENES } from '../../data/fighters/rival/scenes.js';
import { introThen } from './introFlow.js';
import { saveRecords } from '../save/records.js';

class Route {
  constructor(game, args = {}) { this.g = game; this.args = args; }
  update() {}
  render(f) { f.clear(COL.black); }
}
const host = (idOf) => class extends Route { enter() { this.g.go('cutscene', { id: idOf(this.args), params: this.args }); } };
export const AscendRoute = host(() => 'story.ascend');
export const FallRoute = host(() => 'story.fall');
export const DescendRoute = host(() => 'story.descend');
export const DealRoute = host(() => 'story.deal');
export const VoidDoorRoute = host(() => 'story.voidDoor');
export const FreeRoute = host(() => 'story.free');
export const ReforgeRoute = host(() => 'story.reforge');
export const TrueEndingRoute = host(() => 'story.trueEnding');
export const EndingRoute = host((a) => (a.kind === 'main' ? 'story.ending.main' : 'story.ending.interim'));

// after the road or the river: the training camp if a session is waiting, else the map
const afterTravel = (c, to) => (c && c.training.pending ? ['training', { to }] : ['map', {}]);

// the road between circuits: the trainer's lines for where you are going, plus any news of a secret circuit
export class JogRoute extends Route {
  enter() {
    const g = this.g, { from, to } = this.args, c = g.career;
    const name = CIRCUITS[to] ? CIRCUITS[to].name : 'THE NEXT CIRCUIT';
    const secret = SECRET_TALK[from] && c ? SECRET_TALK[from](c.flags) : [];
    const main = isSecret(from) || from === 'dream' ? [] : (TALK[to] || [`ANOTHER BELT! NEXT STOP: ${name}.`, 'EVERY CIRCUIT GETS TOUGHER. SO DO WE.']);
    const id = SCENES[`jog.${to}`] ? `jog.${to}` : 'jog.next';
    g.go('cutscene', { id, params: { lines: [...main, ...secret], label: to === from ? 'A VICTORY LAP' : `ON THE ROAD TO ${CIRCUITS[to] ? (CIRCUITS[to].name.split(':')[0]) : 'GLORY'}`, to }, then: afterTravel(c, to) });
  }
}
export class FerryRoute extends Route {
  enter() {
    const g = this.g, { from, to } = this.args, c = g.career, key = from === to || !FERRY_TALK[to] ? 'done' : to;
    g.go('cutscene', { id: `ferry.${key}`, params: { to }, then: afterTravel(c, to) });
  }
}
// Dash's scenes: the first-attempt or rematch version, then the intro card (before) or on with the career (after)
export class RivalRoute extends Route {
  enter() {
    const g = this.g, { id, phase = 'pre', replay = false, belt = null } = this.args, c = g.career;
    const n = CIRCUITS[id].rival, lost = c && ((c.rivalLost || 0) & (1 << (n - 1)));
    const variant = lost || replay ? 'rematch' : 'first';
    let then;
    if (phase === 'pre') then = introThen(g, { fighter: `dash${n}`, replay });
    else if (replay) then = belt ? ['belt', belt] : ['map', {}];
    else if (id === 'rival9') { if (c) { c.flags.dashFreed = true; g.saveCareer(); } then = ['reforge', {}]; } // The Reforging comes before ZERO's true form
    else if (c && c.training.pending) then = [['underworld', 'void'].includes(zoneOf(id)) ? 'ferry' : 'jog', { from: CIRCUITS[id].after, to: c.circuit }];
    else then = ['map', {}];
    void RIVAL_SCENES; void SIGN_OFF;
    g.go('cutscene', { id: `rival.${n}.${phase}`, params: { variant }, then });
  }
}

// ORIGIN's doors (2026-10-04): the first time through a door his cinematic plays in full (and nothing skips it: `noSkipFirst`), the name is shown from then on, then the
// intro card and the fight. No lives, nothing at stake: a loss returns you to the door.
export class OriginEnterRoute extends Route {
  enter() {
    const g = this.g, which = this.args.which, R = g.records, O = R.origin;
    const id = which === 'g' ? 'origin' : 'originTrue', key = which === 'g' ? 'intro' : 'introTrue', scene = which === 'g' ? 'boss.origin' : 'boss.originTrue';
    if (!O.seen[key]) {
      O.seen[key] = true; saveRecords(R);
      g.go('cutscene', { id: scene, params: {}, then: ['intro', { fighter: id, mode: 'origin', keepMusic: true }] });
    } else g.go('intro', { fighter: id, mode: 'origin' });
  }
}
