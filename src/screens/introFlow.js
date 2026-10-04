// The way into a fight (spec §19): [arrival of a new circuit] -> [boss intro | champion entrance] -> the intro card.
// Every career route to the intro card goes through goIntro; modes (Title Defense, Gauntlet, Practice) and podium rematches do not.
import { SCENES } from '../../data/cutscenes/index.js';

const BOSS = { jax: 'boss.jax', zero: 'boss.zero', halcyon: 'boss.halcyon', vorgath: 'boss.vorgath', dash9: 'boss.dash9', zeroTrue: 'boss.zeroTrue' };
export const entranceSceneOf = (fighter) => (BOSS[fighter] && SCENES[BOSS[fighter]] ? BOSS[fighter] : SCENES[`entrance.${fighter}`] ? `entrance.${fighter}` : null);

// arrive: a circuit id whose arrival scene should play first (once per career, tracked in career.flags.arrived)
export function introThen(g, args, arrive = null) {
  const c = g.career;
  const chain = [];
  if (arrive && c && SCENES[`arrive.${arrive}`]) {
    c.flags.arrived = c.flags.arrived || {};
    if (!c.flags.arrived[arrive]) { c.flags.arrived[arrive] = true; g.saveCareer(); chain.push({ id: `arrive.${arrive}`, params: { circuit: arrive } }); }
  }
  const ent = c && !args.mode ? entranceSceneOf(args.fighter) : null;
  if (ent) chain.push({ id: ent, params: {} });
  let then = ['intro', ent ? { ...args, keepMusic: true } : args];
  for (let i = chain.length - 1; i >= 0; i--) then = ['cutscene', { ...chain[i], then }];
  return then;
}
export function goIntro(g, args, arrive = null) { const t = introThen(g, args, arrive); g.go(t[0], t[1]); }
