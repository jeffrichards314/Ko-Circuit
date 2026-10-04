// The rival's cutscenes (§11b): before and after each of Dash Maddox's four
// fights, 2-4 lines in text boxes. Every scene has a first-attempt version and
// a rematch version:
//   pre.first     your first try against this Dash
//   pre.rematch   coming back after losing to him
//   post.first    you beat him on the first try
//   post.rematch  you beat him after losing to him
// who: 'dash' | 'you' | 'coach' (your trainer). `caption` sets the scene at the
// top of the screen; `bg: 'ceremony'` draws the belt ceremony's spotlight
// instead of the Night Gym (fight I: he crashes the ceremony).
export const RIVAL_SCENES = {
  1: {
    pre: {
      first: {
        caption: 'THE BELT CEREMONY. A VOICE FROM THE BACK OF THE HALL...', bg: 'ceremony',
        lines: [
          ['dash', 'NICE BELT. THE MINOR CIRCUIT, HUH? CUTE.'],
          ['dash', 'REMEMBER ME? EASTSIDE GYM. WE TURNED PRO THE SAME DAY. EVERYBODY SAID I WAS THE PRODIGY.'],
          ['you', 'EVERYBODY SAID YOU TALK TOO MUCH.'],
          ['dash', 'THE OLD GYM. TONIGHT. LET\'S SETTLE IT WHERE IT STARTED.'],
        ],
      },
      rematch: {
        caption: 'THE EASTSIDE GYM, AFTER HOURS.',
        lines: [
          ['dash', 'BACK FOR MORE? I LEFT THE LIGHT ON FOR YOU.'],
          ['dash', 'THROW THE SAME PUNCH TWICE AND I\'LL READ IT AGAIN. I ALWAYS DO.'],
          ['you', 'THEN I WON\'T THROW IT TWICE.'],
        ],
      },
    },
    post: {
      first: {
        lines: [
          ['dash', '...FINE. ONE NIGHT. ANYBODY CAN HAVE ONE NIGHT.'],
          ['coach', 'THAT KID\'S GONNA BE BACK. HIS KIND ALWAYS IS.'],
          ['dash', 'SEE YOU AT THE TOP. I\'LL BE THE ONE ALREADY THERE.'],
        ],
      },
      rematch: {
        lines: [
          ['dash', 'TOOK YOU A FEW TRIES, HUH? DON\'T GET USED TO IT.'],
          ['dash', 'NEXT TIME I WON\'T BE PLAYING NICE.'],
        ],
      },
    },
  },
  2: {
    pre: {
      first: {
        caption: 'THE EASTSIDE GYM. SOMEBODY BROUGHT CHAIRS.',
        lines: [
          ['dash', 'SMILE! ...OH, THE FLASH? THAT\'S MY NEW SPONSOR.'],
          ['dash', 'MAJOR CHAMP. THEY PUT YOUR NAME NEXT TO MINE IN THE PAPER. I HATE THAT.'],
          ['dash', 'I PICKED UP A LITTLE SOMETHING UNDER THOSE CAMERA LIGHTS. WANNA SEE IT?'],
        ],
      },
      rematch: {
        caption: 'THE EASTSIDE GYM. THE CHAIRS ARE STILL OUT.',
        lines: [
          ['dash', 'STILL SEEING SPOTS, CHAMP? THAT\'S THE FLASHBULB.'],
          ['you', 'I\'M WATCHING FOR THE GLINT. THAT\'S ALL I NEED.'],
          ['dash', 'WATCH ALL YOU WANT. SAY CHEESE.'],
        ],
      },
    },
    post: {
      first: {
        lines: [
          ['dash', 'THE PRESS IS GONNA LOVE THIS. GREAT. JUST GREAT.'],
          ['dash', 'YOU GOT LUCKY UNDER THE LIGHTS. THE WORLD STAGE IS BIGGER.'],
        ],
      },
      rematch: {
        lines: [
          ['dash', 'HOW MANY TIMES DID YOU HAVE TO COME BACK? DON\'T ANSWER THAT.'],
          ['dash', 'I\'M ALREADY WORKING ON SOMETHING NEW.'],
        ],
      },
    },
  },
  3: {
    pre: {
      first: {
        caption: 'THE EASTSIDE GYM. PACKED. THERE\'S A TV CAMERA.',
        lines: [
          ['dash', 'WORLD CHAMPION. I WATCHED IT ON THE BIG SCREEN. TWICE.'],
          ['dash', 'EVERY FIGHT I\'M THE TOP PLAY OF THE NIGHT. THEY CALL IT THE HIGHLIGHT REEL.'],
          ['you', 'FULL HOUSE TONIGHT.'],
          ['dash', 'THEY\'RE HERE FOR ME. ROLL TAPE.'],
        ],
      },
      rematch: {
        caption: 'THE EASTSIDE GYM. THE CAMERA\'S STILL ROLLING.',
        lines: [
          ['dash', 'INSTANT REPLAY: YOU, ON THE CANVAS, FROM EVERY ANGLE.'],
          ['dash', 'POINT. HOOK. BODY. SWEEP. YOU KNOW IT\'S COMING AND YOU STILL CAN\'T STOP IT.'],
          ['you', 'WATCH ME.'],
        ],
      },
    },
    post: {
      first: {
        lines: [
          ['dash', 'CUT THE CAMERAS. CUT THEM!'],
          ['dash', 'THE GRAND PRIX. THE COLOSSEUM. I\'LL BE WAITING AT THE END OF IT.'],
        ],
      },
      rematch: {
        lines: [
          ['dash', 'SO THAT\'S THE ONE THEY\'LL REPLAY. NOT MY BEST ANGLE.'],
          ['dash', 'WE\'RE NOT DONE. NOT EVEN CLOSE.'],
        ],
      },
    },
  },
  4: {
    pre: {
      first: {
        caption: 'THE EASTSIDE GYM. STANDING ROOM ONLY.',
        lines: [
          ['dash', 'EVERYBODY WANTS YOU AND JAX. THE WHOLE WORLD IS WAITING ON IT.'],
          ['dash', 'BUT WE BOTH KNOW HOW THIS STARTED. THIS GYM. THE SAME DAY.'],
          ['you', 'THEN LET\'S FINISH IT HERE.'],
          ['dash', 'EVERYTHING I\'VE GOT, CHAMP. ALL OF IT. THE GRAND FINALE.'],
        ],
      },
      rematch: {
        caption: 'THE EASTSIDE GYM. NOBODY WENT HOME.',
        lines: [
          ['dash', 'THE CROWD\'S STILL HERE. SO AM I. SO ARE YOU, SOMEHOW.'],
          ['dash', 'LAST TIME WAS THE DRESS REHEARSAL. THIS IS THE SHOW.'],
        ],
      },
    },
    post: {
      first: {
        lines: [
          ['dash', '...YOU WERE ALWAYS FIRST INTO THE GYM AND LAST OUT. I NOTICED.'],
          ['dash', 'GO BEAT JAX. IF ANYBODY\'S GONNA DO IT, IT HAS TO BE THE ONE WHO BEAT ME.'],
          ['coach', 'YOU HEARD HIM, CHAMP. ONE FIGHT LEFT.'],
        ],
      },
      rematch: {
        lines: [
          ['dash', 'YOU KEPT COMING BACK. THAT\'S THE WHOLE STORY, ISN\'T IT?'],
          ['dash', 'GO ON. JAX IS WAITING. DON\'T MAKE ME LOOK BAD.'],
        ],
      },
    },
  },
  5: {
    pre: {
      first: {
        caption: 'THE HALL OF HEROES. HIS BANNER HANGS AMONG THEM.',
        lines: [
          ['dash', 'DON\'T LOOK SO SURPRISED. YOU DIDN\'T THINK I\'D LET YOU CLIMB ALONE?'],
          ['you', 'HOW DID YOU EVEN GET UP HERE?'],
          ['dash', 'I FOLLOWED YOU UP THE STAIRS. THEY GAVE ME A HALO AT THE DOOR. NICE, RIGHT?'],
          ['dash', 'YOU BEAT THE GRAND PRIX. YOU BEAT ZERO. I STILL WANT THE LAST WORD.'],
          ['dash', 'WATCH THE LIGHT. IT TELLS YOU WHERE I\'M COMING FROM. IT WON\'T HELP.'],
        ],
      },
      rematch: {
        caption: 'THE HALL OF HEROES. HIS BANNER IS STILL HANGING.',
        lines: [
          ['dash', 'BACK TO GET SLIPPED PAST? THE LIGHT ON THE LEFT MEANS I\'M COMING FROM THE LEFT.'],
          ['dash', 'YOU NOTICED. GOOD. NOW DO IT FASTER.'],
        ],
      },
    },
    post: {
      first: {
        lines: [
          ['dash', '...A HALO, AND I STILL CAN\'T GET PAST YOU.'],
          ['dash', 'KEEP CLIMBING. THE STAIRS GO UP FURTHER THAN I CAN SEE. I\'LL BE BEHIND YOU.'],
          ['coach', 'HE MEANS IT, CHAMP. UP THE STAIRS. ONE STEP AT A TIME.'],
        ],
      },
      rematch: {
        lines: [
          ['dash', 'YOU KEEP COMING BACK UP HERE, TOO. I NOTICED.'],
          ['dash', 'GO ON. THE REST OF THE STAIRS ARE WAITING. I\'LL TAKE THE ELEVATOR.'],
        ],
      },
    },
  },
  6: {
    pre: {
      first: {
        caption: 'THE MIRROR SANCTUM. A HUNDRED DASHES IN THE GLASS, AND ONE OF THEM IS BREATHING HARD.',
        lines: [
          ['dash', 'DON\'T LOOK AT THE HALO. I KNOW. IT SLIPPED. IT KEEPS SLIPPING.'],
          ['dash', 'EVERY TIME YOU BEAT ME UP HERE IT TAKES A LITTLE MORE. THEY PUT A NUMBER ON WHAT I\'VE GOT LEFT. IT\'S SMALL.'],
          ['you', 'YOU DON\'T HAVE TO DO THIS.'],
          ['dash', 'YES I DO. THAT\'S THE WHOLE PROBLEM. I\'M GOING TO THROW EVERYTHING. EVERYTHING.'],
          ['dash', 'WATCH FOR THE ROAR. AFTER THAT... I CAN\'T PROMISE I\'M STILL ME.'],
        ],
      },
      rematch: {
        caption: 'THE MIRROR SANCTUM. THE GLASS IS CRACKED. SO IS HE.',
        lines: [
          ['dash', 'YOU FOUND THE OPENING. THE ONE AFTER THE ROAR. DIDN\'T YOU.'],
          ['dash', 'GOOD. THEN YOU KNOW EXACTLY HOW MUCH I\'VE GOT LEFT. COME AND TAKE IT.'],
        ],
      },
    },
    post: {
      vanish: true,
      first: {
        lines: [
          ['dash', '...THAT\'S IT. THAT\'S ALL OF IT. THERE\'S NOTHING BEHIND THE ROAR.'],
          ['dash', 'HUH. THE MIRROR\'S SHOWING ONE OF ME. NOT A HUNDRED. JUST... ONE.'],
          ['you', 'DASH?'],
          ['dash', 'KEEP CLIMBING. I\'LL CATCH UP. I ALWAYS DO.'],
          ['coach', 'WHERE... WHERE DID HE GO? HE WAS RIGHT THERE.'],
        ],
      },
      rematch: {
        vanish: true,
        lines: [
          ['dash', 'YOU DID IT AGAIN. I DON\'T EVEN MIND ANYMORE.'],
          ['dash', 'SEE YOU AT THE TOP. OR SOMEWHERE. WHEREVER I END UP.'],
          ['coach', 'HE\'S GONE. CHAMP, HE\'S JUST... GONE.'],
        ],
      },
    },
  },
  7: {
    pre: {
      first: {
        caption: 'THE CHAIN PITS. A TEAL BANNER HANGS FROM A CELL DOOR, CHAINED SHUT.',
        lines: [
          ['dash', 'I TOLD YOU I WAS SORRY. I MEANT IT. I STILL DO.'],
          ['dash', 'HE PUT ME HERE. NOT IN A CELL: JUST A PLACE TO STAND. THE CHAIN GOES BACK TO THE THRONE, AND SO DO I WHEN HE PULLS.'],
          ['you', 'THEN LET ME CUT YOU LOOSE.'],
          ['dash', 'YOU CAN\'T. I\'VE TRIED. THE ONLY WAY OUT OF THESE CHAINS IS THROUGH YOU, AND YOU KNOW IT.'],
          ['dash', 'SO HIT ME LIKE YOU MEAN IT, CHAMP. HE\'S WATCHING. AND WATCH THE CHAIN: IT PULLS.'],
        ],
      },
      rematch: {
        caption: 'THE CHAIN PITS. THE BANNER IS STILL CHAINED SHUT.',
        lines: [
          ['dash', 'AGAIN? THE CHAIN DIDN\'T GET ANY SHORTER.'],
          ['you', 'NEITHER DID MY PATIENCE.'],
          ['dash', 'GOOD. SLIP LEFT, OR GET UNDER IT. IF IT CATCHES YOU, DON\'T FIGHT IT. TEAR.'],
        ],
      },
    },
    post: {
      first: {
        lines: [
          ['dash', '...DOWN HERE PEOPLE FALL AND STAY FALLEN. YOU\'RE THE FIRST I\'VE SEEN GET BACK UP.'],
          ['coach', 'A DEBT IS A CHAIN TOO. THE KING ONLY LENDS BY THE LINK.'],
          ['dash', 'THE ABYSS GATE IS NEXT. HE\'LL BE WAITING. SO WILL I. DON\'T ASK ME WHY.'],
        ],
      },
      rematch: {
        lines: [
          ['dash', 'IT TOOK YOU A FEW TRIES. THE CHAIN GOT LONGER EVERY TIME. NOT SHORTER, NEVER SHORTER.'],
          ['dash', 'GO ON. DOWN. I\'LL BE BEHIND YOU. WHETHER I LIKE IT OR NOT.'],
        ],
      },
    },
  },
  8: {
    pre: {
      first: {
        caption: 'THE ABYSS GATE. A TEAL BANNER, TORN, WITH THE KING\'S CROWN BRANDED ON IT IN BLACK.',
        lines: [
          ['dash', 'DON\'T SAY IT. I KNOW WHAT THE PLATE LOOKS LIKE. IT WAS THAT OR THE CHAIN.'],
          ['dash', 'HE TOOK THE CHAIN OFF. I THOUGHT THAT WAS MERCY. IT WAS A PROMOTION. I\'M HIS CHAMPION NOW.'],
          ['you', 'YOU DON\'T HAVE TO DO THIS, DASH.'],
          ['dash', 'I KEEP HEARING THAT. THE KING SAYS HE\'LL LET ME GO IF I STOP YOU HERE. I\'D BELIEVE HIM IF I HAD ANYTHING ELSE.'],
          ['dash', 'SO PUNCH ME. I\'LL STEP INTO THE SMOKE AND COME OUT ON YOUR OTHER SIDE, AND YOU\'LL HAVE TO BE FASTER THAN THAT. YOU ARE. I\'VE SEEN IT.'],
          ['coach', 'HE SAYS HE\'LL COME BACK FROM THE OTHER SIDE. BE WHERE HE IS NOT.'],
        ],
      },
      rematch: {
        caption: 'THE ABYSS GATE. THE BANNER HAS BEEN RE-HUNG. IT IS STILL TORN.',
        lines: [
          ['dash', 'THE SHADOW STEP AGAIN. YOU CAN\'T POKE ME IN MY GUARD. I DISAPPEAR AND I COME BACK WITH A HOOK.'],
          ['dash', 'SO DON\'T POKE. WAIT FOR IT. THE REPLY HAS A WHISTLE. HIT ME AS I LAND.'],
          ['you', 'THAT WAS A TIP.'],
          ['dash', 'IT WAS A PRAYER. GO.'],
        ],
      },
    },
    post: {
      first: {
        lines: [
          ['dash', '...THE FLOOR UNDER THE THRONE DOESN\'T HOLD, YOU KNOW. HE STANDS ON IT ANYWAY. A PIECE COMES OFF EVERY TIME HE GETS ANGRY.'],
          ['dash', 'HE FIGHTS IN THE DARK. WATCH THE EYES. WATCH THE CROWN: IT FLARES WHEN HE\'S ABOUT TO HIT YOU WITH EVERYTHING.'],
          ['dash', 'AND HE TAKES YOUR STARS. HIT HIS CROWN RIGHT AFTER AND YOU\'LL GET ONE BACK. I LEARNED THAT THE HARD WAY.'],
          ['coach', 'THE THRONE IS BEHIND THE GATE. HE\'S OPENED IT FOR YOU. THAT IS NEVER GOOD.'],
          ['dash', 'GO. I\'LL BE RIGHT BEHIND YOU. I AM ALWAYS RIGHT BEHIND YOU.'],
        ],
      },
      rematch: {
        lines: [
          ['dash', 'YOU FOUND THE WHISTLE. I KNEW YOU WOULD.'],
          ['dash', 'THE KING HAS OPENED THE GATE. THE FLOOR UNDER HIM DOESN\'T HOLD: A PIECE COMES OFF EVERY PHASE. WATCH HIS EYES AND HIS CROWN.'],
          ['dash', 'GO ON. I\'M NOT GOING ANYWHERE. I CAN\'T.'],
        ],
      },
    },
  },
  // IX, DASH UNBOUND: the empty amateur gym where you both started, floating in the Void (Phase E). After it he is freed and takes the Ferryman's place.
  9: {
    pre: {
      first: {
        caption: 'THE MAPLE STREET REC CENTER. EMPTY. IT HANGS IN THE VOID BY ONE CORNER, THE BANNER STILL UP.',
        lines: [
          ['dash', 'DO YOU KNOW WHERE THIS IS? OF COURSE YOU DO. THIS IS WHERE WE MET. NOBODY CAME TO WATCH. NOBODY EVER CAME TO WATCH.'],
          ['dash', 'IT GAVE ME EVERYTHING. EVERY MOVE I HAVE EVER THROWN AT YOU, AT ONCE, AND NO CHAIN ON ANY OF IT. IT SAID I COULD BE THE BEST. IT SAID I WOULD NEVER HAVE TO LOSE TO YOU AGAIN.'],
          ['you', 'DASH. THAT ISN\'T YOU TALKING.'],
          ['dash', 'IT\'S THE ONLY PART OF ME LEFT THAT ISN\'T TIRED. COME ON, CHAMP. ONE MORE. THE WHOLE SHOW.'],
          ['coach', 'HE HAS EVERYTHING HE HAS EVER SHOWN YOU. YOU HAVE BEATEN EVERY ONE OF THEM.'],
        ],
      },
      rematch: {
        caption: 'THE MAPLE STREET REC CENTER. THE BANNER HAS NOT MOVED. NEITHER HAS THE LIGHT.',
        lines: [
          ['dash', 'AGAIN. I DON\'T GET TIRED IN HERE. THAT IS THE WORST THING ABOUT IT.'],
          ['dash', 'EVERYTHING I HAVE. ALL OF IT. COME AND TAKE IT.'],
          ['coach', 'YOU KNOW EVERY ONE OF THESE. ONE AT A TIME.'],
        ],
      },
    },
    post: {
      first: {
        caption: 'THE BLACK LEAVES HIM LIKE WATER OFF A DOCK. HE IS TEAL AGAIN, AND SMALL, AND 22.',
        lines: [
          ['dash', '...IT WENT QUIET. THE VOICE. IT WENT QUIET. CHAMP? CAN YOU HEAR ME? IS IT ME?'],
          ['you', 'IT\'S YOU, DASH.'],
          ['dash', 'I HAD MY HANDS ON EVERYTHING AND I COULD NOT FEEL ANY OF IT. NOW I CAN FEEL THE ROPES. WHAT A STUPID THING TO CRY ABOUT.'],
          ['dash', 'LISTEN. THERE IS ONE LEFT. ZERO. NOT THE ONE YOU BEAT: THE WHOLE OF IT. HE IS GOING TO PUT HIMSELF BACK TOGETHER OUT OF EVERYTHING HE EVER BORROWED FROM YOU.'],
          ['dash', 'I KNOW HIM NOW. I WAS INSIDE HIM. I\'M TAKING THE OLD MAN\'S PLACE IN YOUR CORNER. HE ROWED YOU THIS FAR AND HE\'LL BE THE FIRST TO SAY THAT\'S PLENTY.'],
          ['dash', 'AND I WILL TELL YOU THE TRUTH ABOUT EVERY PUNCH HE THROWS. NO RIDDLES. I OWE YOU THAT MUCH. I OWE YOU A LOT MORE.'],
        ],
      },
      rematch: {
        caption: 'THE BLACK LEAVES HIM LIKE WATER OFF A DOCK. HE IS TEAL AGAIN.',
        lines: [
          ['dash', 'IT WENT QUIET. THE VOICE. I CAN FEEL THE ROPES. GOOD.'],
          ['dash', 'ONE LEFT: THE WHOLE OF ZERO. I KNOW HIM NOW. I\'M TAKING THE FERRYMAN\'S PLACE IN YOUR CORNER AND I\'LL TELL YOU EXACTLY WHAT COMES. NO RIDDLES.'],
        ],
      },
    },
  },
};
