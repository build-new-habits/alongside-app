/**
 * js/data/figures/batch-16.js
 * 01 Nov 2026 v1
 *
 * P-20 TRENDS-BUILD, the held entries: figures for the ten movements in
 * data/exercises/held_movements.js, which are held until the clinical read
 * and offered nowhere. Drawn now so Graeme can mark them on the Figure
 * Review page, as he did in A-6. Each is drawn from its nearest analogue's
 * figure (named in the entry). The format is described in js/figures.js.
 */
export const FIGURES_16 = {
  "uphill-walk": {"w":180,"f":[
    {"l":"Walk up, short steps","a":"Walking up a hill or a set of steps, one foot on the step above, upright and leaning slightly forward from the ankles, arms swinging.","p":{"hip":[80,114],"t":174,"nl":[40,-10,97],"fl":[-20,-10,90],"na":[-24,-10],"fa":[24,36]},"x":[{"box":[90,182,80,8]},{"mv":[120,150,150,134]}]},
    {"l":"Walk back down slowly","a":"Walking back down slowly and upright, short steps, letting the breath settle, the step behind.","p":{"hip":[100,114],"t":180,"nl":[14,4,90],"fl":[-14,-6,90],"na":[-10,-4],"fa":[10,14]},"x":[{"box":[10,182,46,8]}]}
  ]},
  "slider-reverse-lunge": {"w":160,"f":[
    {"l":"Back foot on a towel","a":"Standing tall, feet together, one foot resting on a folded towel on a smooth floor.","p":{"hip":[84,112],"t":180,"nl":[0,0,90],"na":[0,4]},"x":[{"box":[80,186,26,4]}]},
    {"l":"Slide back and down","a":"The foot on the towel slid straight back, back knee lowered towards the floor, front shin upright, body upright; the back foot never leaves the floor.","p":{"hip":[90,149],"t":180,"nl":[88,0,90],"fl":[-20,-82,-90],"na":[0,4]},"x":[{"box":[28,186,26,4]},{"mv":[70,182,40,182]}]}
  ]},
  "slider-lateral-lunge": {"w":160,"f":[
    {"l":"Foot on the towel","a":"Seen from the front, standing tall with the feet hip-width apart, one foot on a folded towel, arms by the sides.","p":{"v":"front","hip":[80,112],"t":180,"ll":[-4,-2],"rl":[4,2],"la":[-4,-2],"ra":[4,2]},"x":[{"box":[82,186,20,4]}]},
    {"l":"Slide out, sit back","a":"Seen from the front, the towel foot slid out wide to the side with that leg straight, hips pushed back and down over the other leg, its knee bent over the toes, chest up.","p":{"v":"front","hip":[66,125.6],"t":-170,"ll":[-50,0],"rl":[35,35],"la":[-26,-18],"ra":[-10,-6]},"x":[{"box":[104,186,24,4]},{"mv":[96,180,126,180]}]}
  ]},
  "slider-mountain-climber": {"w":180,"f":[
    {"l":"High plank, feet on towels","a":"High plank: hands on the floor under the shoulders, arms straight, a folded towel under each foot, body one straight line from head to heels.","p":{"hip":[94,154],"t":113,"h":108,"nl":[-67,-67,-60],"fl":[-67,-67,-60],"na":[0,0],"fa":[0,0]},"x":[{"box":[6,186,24,4]}]},
    {"l":"Slide a knee in, swap","a":"One knee slid in towards the chest, its foot gliding on the towel, the other leg straight back, hips low and level, hands still under the shoulders.","p":{"hip":[94,154],"t":113,"h":108,"nl":[80,-70,-130],"fl":[-67,-67,-60],"na":[0,0],"fa":[0,0]},"x":[{"box":[6,186,24,4]},{"mv":[60,128,96,128]}]}
  ]},
  "sled-pull": {"w":180,"f":[
    {"l":"Lean back, rope straight","a":"Facing a sled a few steps away, knees bent, leaning back with a flat back, both hands holding a rope stretched straight to the sled.","p":{"hip":[60,124],"t":-160,"h":-165,"nl":[40,-10,90],"fl":[30,-15,90],"na":[80,90],"fa":[78,88]},"x":[{"box":[136,174,38,12]},{"ln":[96,86,136,176]}]},
    {"l":"Pull hand over hand","a":"Pulling the rope in hand over hand, one elbow drawn back past the ribs, back still flat, legs helping, the sled sliding closer.","p":{"hip":[60,124],"t":-160,"h":-165,"nl":[40,-10,90],"fl":[30,-15,90],"na":[-70,95],"fa":[78,88]},"x":[{"box":[120,174,38,12]},{"ln":[96,86,120,176]},{"mv":[158,164,132,164]}]}
  ]},
  "burpee-broad-jump": {"w":200,"f":[
    {"l":"Squat, hands down","a":"Squatted down from standing, feet hip-width apart, hands flat on the floor in front of the feet.","p":{"hip":[44,152],"t":110,"h":100,"nl":[85,-30,90],"na":[-7.4,22.9]}},
    {"l":"Step or jump to plank","a":"Feet stepped or jumped back to a plank: hands under the shoulders, arms straight, body one straight line, the chest lowered towards the floor if wanted.","p":{"hip":[96,153.6],"t":112.5,"h":110,"nl":[-67.5,-67.5,-67.5],"fl":[-67.5,-67.5,-67.5],"na":[-4,-4]}},
    {"l":"Feet in, jump forward","a":"Feet brought back in, then jumping forward with both feet and landing softly in a squat, knees bent, arms forward.","p":{"hip":[130,133],"t":155,"nl":[60,-20,90],"na":[40,40]},"x":[{"mvq":[60,120,90,50,128,90]}]}
  ]},
  "loaded-walking-lunge": {"w":180,"f":[
    {"l":"Stand, weights by sides","a":"Standing tall, feet together, a dumbbell in each hand by the sides.","p":{"hip":[64,112],"t":180,"nl":[0,0,90],"na":[0,4],"fa":[0,2],"hold":"dbs","holdF":"dbs"}},
    {"l":"Step forward and down","a":"One foot stepped forward into a lunge, back knee lowered towards the floor, front knee over the front ankle, body upright, dumbbells by the sides; the back foot then steps through into the next lunge.","p":{"hip":[90,149],"t":180,"nl":[88,0,90],"fl":[-20,-82,-90],"na":[0,4],"fa":[0,2],"hold":"dbs","holdF":"dbs"},"x":[{"mv":[120,104,150,104]}]}
  ]},
  "wall-ball": {"w":180,"f":[
    {"l":"Squat, ball at chest","a":"An arm's length from a wall, squatting down as far as is comfortable, chest up, heels down, holding a medicine ball at the chest.","p":{"hip":[65,152],"t":155,"nl":[85,-30,90],"na":[-11.8,132.2]},"x":[{"ball":[98.4,118.3,9]},{"wall":170}]},
    {"l":"Stand and throw high","a":"Driven up through the heels to standing, the arms finishing a throw that sends the ball up to a spot on the wall above head height.","p":{"hip":[84,112],"t":180,"nl":[0,0,90],"na":[150,170]},"x":[{"ball":[158,30,9]},{"wall":170},{"mvq":[110,60,140,30,150,34]}]}
  ]},
  "band-footwork": {"w":200,"f":[
    {"l":"Knees in, band on feet","g":"mat","a":"Lying on the back, knees bent in towards the chest, the middle of a long band round the balls of both feet, an end in each hand, elbows resting on the floor.","p":{"hip":[100,178],"t":-90,"h":-95,"nl":[160,50,30],"na":[110,150]},"x":[{"band":[102,142,124,134]}]},
    {"l":"Press out long, then back","g":"mat","a":"The legs pressed out slowly on a diagonal until long, knees not locked, the band stretched from the hands to the feet, the lower back still resting on the floor.","p":{"hip":[100,178],"t":-90,"h":-95,"nl":[140,140,150],"na":[110,150]},"x":[{"band":[102,142,150,124]},{"mv":[140,140,160,120]}]}
  ]},
  "band-feet-in-straps": {"w":200,"f":[
    {"l":"Legs up, band on feet","g":"mat","a":"Lying on the back, both legs pointing up, the band round both feet and an end in each hand, the lower back resting on the floor.","p":{"hip":[104,178],"t":-90,"h":-95,"nl":[180,180,180],"fl":[178,178,178],"na":[150,160],"fa":[148,158]},"x":[{"band":[104,128,104,102]}]},
    {"l":"Small circles, back down","g":"mat","a":"Both legs together drawing small circles in the air against the band, small enough that the lower back stays on the floor.","p":{"hip":[104,178],"t":-90,"h":-95,"nl":[166,166,166],"fl":[164,164,164],"na":[150,160],"fa":[148,158]},"x":[{"band":[104,128,120,104]},{"mvq":[96,74,124,50,146,84]}]}
  ]},
};
