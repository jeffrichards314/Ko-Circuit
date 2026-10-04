// Dash's corner hints for ZERO's crystals (the true form rework, 2026-10-04): one entry per crystal attack (keyed by its first move, the way every super is),
// three tiers each (a nudge, a pointer, the answer), and the lines about the crystals as a whole. Merged into the ZERO bank (data/hints/void.js).
//   super[<first move>]   how the attack runs and where its golden moment is
//   general / phase       what the crystals are (a glow is a tell; a cracked one takes its whole family out of the fight)
const C = (_key, color, what, finName, where, hit) => [
  `WATCH THE ${color} CRYSTAL. WHEN IT FLARES, EVERYTHING THAT COMES NEXT IS ${what}. FOUR BLOWS OF IT, THEN ${finName}.`,
  `THE FOUR BLOWS ARE ALWAYS IN THE SAME ORDER. LEARN THEM, THEN ${finName} COMES ${where}. ${hit === 'head' ? 'UPSTAIRS' : 'DOWNSTAIRS'} IS WHERE HE'S OPEN.`,
  `AT THE GLEAM IN ${finName}'S WINDUP, ${hit === 'head' ? 'A HEAD SHOT' : 'A BODY SHOT'}. THE ${color} CRYSTAL CRACKS AND EVERYTHING IT STOOD FOR LEAVES HIS FIGHT. THEN HE'S WIDE OPEN.`,
];
export const CRYSTAL_SUPER_HINTS = {
  cx_dodge_1: C('dodge', 'CYAN', 'A SLIP, LEFT AND RIGHT', 'BREAKNECK', 'LAST, SLOW AND LEANING', 'body'),
  cx_block_1: C('block', 'ORANGE', 'A BLOCK. NOTHING ELSE WORKS', 'THE BULWARK BREAKER', 'LAST, WITH A GATE SLAMMING', 'head'),
  cx_duck_1: C('duck', 'VIOLET', 'A DUCK. GET LOW AND STAY LOW', 'THE WHIRLWIND', 'LAST, SPINNING', 'head'),
  cx_counter_1: C('counter', 'AZURE', 'A FENCER\'S POINT: SLOW TELLS, SHARP ENDS', 'THE RIPOSTE', 'LAST, AFTER A LONG WAIT', 'body'),
  cx_sight_1: C('sight', 'YELLOW', 'THE LIGHTHOUSE. WATCH THE HALO ROUND HIS HEAD', 'THE GAZE', 'LAST, WITH HIS EYE WIDE', 'head'),
  cx_sound_1: C('sound', 'MINT', 'SOUND. LISTEN, DON\'T LOOK', 'THE CHORD', 'LAST, THREE NOTES AT ONCE', 'body'),
  cx_rhythm_1: C('rhythm', 'ROSE', 'A BEAT. COUNT IT', 'THE CRESCENDO', 'LAST, ON THE DOWNBEAT', 'head'),
  cx_memory_1: C('memory', 'GREEN', 'A LINE YOU ALREADY KNOW. SAME ORDER, EVERY TIME', 'THE RECITAL', 'LAST, AFTER THE FOURTH LINE', 'body'),
  cx_echo_1: C('echo', 'INDIGO', 'YOUR OWN PUNCHES, THROWN BACK AT YOU', 'THE MIMIC', 'LAST, A COPY OF YOUR STAR PUNCH', 'head'),
  cx_chaos_1: C('chaos', 'MAGENTA', 'A ROLL OF THE DICE', 'SNAKE EYES', 'LAST, TWO EYES OPENING', 'body'),
  cx_time_1: C('time', 'LIME', 'A CLOCK. IT RUNS FAST, THEN SLOW', 'THE STOPPED CLOCK', 'LAST, WHEN THE HANDS STOP', 'head'),
  cx_will_1: C('will', 'RED', 'STUBBORN. EVERY ONE OF THEM HITS HARDER THAN THE LAST', 'THE LAST WORD', 'LAST, THE SLOWEST OF ALL', 'body'),
  pair_go: [
    'IN THE LAST PHASE, TWO OF THEM GLOW AT ONCE. HE MAKES A SOUND LIKE THEY\'RE CALLING EACH OTHER.',
    'TWO CRYSTALS, TWO SETS OF BLOWS, ONE AFTER THE OTHER. READ THE COLOURS: THE FIRST ONE FADES AS THE SECOND COMES UP.',
    'AT THE GLEAM IN THE LAST BLOW, TWO AS ONE, A HEAD SHOT. BOTH CRYSTALS CRACK AT ONCE.',
  ],
};
export const CRYSTAL_GENERAL = [
  'TWELVE CRYSTALS. TWELVE COLOURS. I KNOW EVERY ONE: THEY\'RE THE PEOPLE YOU FREED. WHEN A COLOUR GLOWS, THAT\'S WHICH KIND OF ATTACK IS COMING.',
  'WHEN YOU HIT THE GOLDEN MOMENT OF A CRYSTAL\'S BIG ATTACK, THE CRYSTAL CRACKS. EVERYTHING IT STOOD FOR LEAVES HIS FIGHT. WATCH THE SHARDS. THAT\'S YOUR PROGRESS.',
  'HE CAN\'T GET THE CRACKED ONES BACK. BREAK ENOUGH OF THEM AND HE\'S NOTHING BUT HIS OWN PLAIN ROUTINE.',
];
