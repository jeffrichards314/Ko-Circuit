// The five divisions (spec §6): Title Defense and the Gauntlet are laid out the same way. Classic (the base game), Pantheon, Underworld,
// Void, and Combined (all four, in story order). A division opens when its zone's last boss has been beaten (Classic: the first ZERO,
// Pantheon: Halcyon, Underworld: Vorgath, Void: ZERO's true form); Combined opens with the true ending.
//
// `unlock` is the key in records.unlocks (src/save/records.js syncRecords sets it). The fighter lists live next to the data they need:
// Title Defense in data/fighters/titleDefense.js, the Gauntlet in src/save/records.js.
export const DIVISIONS = ['classic', 'pantheon', 'underworld', 'void', 'combined'];
export const DIVISION_NAMES = { classic: 'CLASSIC', pantheon: 'PANTHEON', underworld: 'UNDERWORLD', void: 'VOID', combined: 'COMBINED' };
export const DIVISION_UNLOCK = { classic: 'zero', pantheon: 'pantheon', underworld: 'underworld', void: 'void', combined: 'full' };
export const DIVISION_LOCK = {
  classic: 'BEAT THE FIRST ZERO.',
  pantheon: 'BEAT HALCYON.',
  underworld: 'BEAT VORGATH.',
  void: 'BEAT ZERO\'S TRUE FORM.',
  combined: 'SEE THE TRUE ENDING.',
};
// the hall's and the tower's door texts (two short lines each: the interior's sign wraps them)
export const TD_TEXT = {
  classic: 'THE 12 CHAMPIONS, JAX AND THE FIRST ZERO',
  pantheon: 'THE SEVEN KINGS OF THE CLIMB, BARNEY ASCENDED AND HALCYON',
  underworld: 'THE SIX KINGS BELOW AND VORGATH',
  void: 'THE TWELVE HOLLOWED, DASH UNBOUND AND ZERO',
  combined: 'EVERY CHAMPION AND BOSS, IN STORY ORDER',
};
export const GAUNTLET_TEXT = {
  classic: ['#1-50, JAX AND THE FIRST ZERO.', 'THE BASE GAME BACK TO BACK.'],
  pantheon: ['#51-81, DASH V AND VI AND HALCYON.', 'THE CLIMB, WITHOUT THE REST.'],
  underworld: ['#82-107, DASH VII AND VIII', 'AND VORGATH. ONE LIFE DEEP.'],
  void: ['THE TWELVE HOLLOWED, DASH UNBOUND', 'AND ZERO\'S TRUE FORM.'],
  combined: ['ALL FOUR DIVISIONS, IN STORY', 'ORDER. NOBODY GETS SKIPPED.'],
};
