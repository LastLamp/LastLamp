function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const ATTACK_NAMES = [
  "Rib Cut", "Low Measure", "Open Steel", "Falling Edge", "Knee Line", "Quiet Thrust",
  "Full Weight", "Second Step", "Collar Blow", "Split Guard", "Short Road", "Back Cut",
];
const DEFEND_NAMES = [
  "Raised Guard", "Set Feet", "Closed Door", "Shield Up", "The Brace", "Hold the Mile",
  "Iron Pause", "Cover the Gap", "Planted", "High Guard", "Locked Knees", "The Wall",
];
const MEND_NAMES = [
  "Field Stitch", "Shared Breath", "Pull Them Up", "Cloth and Salt", "The Spare Hand", "Close the Cut",
];
const HEX_NAMES = {
  poison: ["Slow Venom", "Green Thread", "Tooth of the Mile", "Lingering Cut"],
  stun: ["Still Hands", "Bell in the Ear", "The Halt", "Struck Dumb"],
  sleep: ["Shut Eye", "Heavy Lid", "Dream the Road", "Lay Them Down"],
  weak: ["Soft Knee", "Take the Strength", "Ash in the Arm", "Unsteady"],
};

const ATTACK_LINES = [
  "The cut comes in low, looking for the ribs.",
  "They put their whole step into one swing.",
  "A short thrust, meant to land before you reset.",
  "Steel drops from above and trusts the weight.",
  "They aim for the knee and the balance under it.",
  "The thrust is quiet. The point is not.",
  "No feint. The weight is already committed.",
  "The second step is the one that cuts.",
  "They strike up into the collar, under the guard.",
  "The swing splits whatever you were holding up.",
  "They close the distance and spend it all on one cut.",
  "The blade comes around, looking for the back.",
];
const DEFEND_LINES = [
  "The guard comes up and stays there.",
  "They set their feet and take the next hit on purpose.",
  "The stance closes. Getting through it will cost a card.",
  "A shield, held where the next swing wants to land.",
  "They brace and give you nothing clean.",
  "The mile is held. They are not moving yet.",
  "A pause behind iron, waiting for you to spend AP.",
  "They cover the gap you were about to use.",
  "Weight goes into the ground. The guard gets thicker.",
  "The guard sits high, over the face and the collar.",
  "Knees lock. The next hit has to move them first.",
  "They become the wall in front of the others.",
];
const MEND_LINES = [
  "Cloth on the worst cut. An ally stands back up.",
  "They spend the turn putting breath back into someone else.",
  "A hand under an ally, and the health comes back.",
  "Salt, cloth, and a wound that closes partway.",
  "They ignore you and mend the one who is failing.",
  "The cut is pulled shut. Not gone. Enough to keep fighting.",
];
const HEX_LINES = {
  poison: [
    "The cut keeps working after the blade is gone. Poison ticks, and stress rises.",
    "Something green stays in the wound. It will tick when your turn starts.",
    "Venom on the edge. The party is poisoned, and the stress climbs.",
  ],
  stun: [
    "The blow rings. The party loses the next turn, and stress rises.",
    "Hands go still. You will not have AP for the next turn.",
    "A hit meant to stop you, not just to hurt. Stun, and the stress climbs.",
  ],
  sleep: [
    "The eyes want to close. The party sleeps through the next turn unless something wakes them.",
    "A heavy quiet. You will lose the next turn to sleep, and stress rises.",
    "They lay a dream on you. Sleep takes the next turn.",
  ],
  weak: [
    "The strength goes out of the arms. Attacks deal 70% for two turns, and stress rises.",
    "Knees soften. Your damage falls to 70% until it wears off.",
    "They take the force out of the next swings. Weak, and the stress climbs.",
  ],
};

export function speakMove(foeName, intent, effect, salt = 0) {
  const key = `${foeName}|${intent}|${effect || ""}|${salt}`;
  const h = hash(key);
  if (intent === "defend") {
    return { name: DEFEND_NAMES[h % DEFEND_NAMES.length], line: DEFEND_LINES[(h >>> 4) % DEFEND_LINES.length] };
  }
  if (intent === "mend") {
    return { name: MEND_NAMES[h % MEND_NAMES.length], line: MEND_LINES[(h >>> 4) % MEND_LINES.length] };
  }
  if (intent === "hex") {
    const kind = HEX_NAMES[effect] ? effect : ["poison", "stun", "sleep", "weak"][h % 4];
    const names = HEX_NAMES[kind];
    const lines = HEX_LINES[kind];
    return { name: names[h % names.length], line: lines[(h >>> 4) % lines.length] };
  }
  return { name: ATTACK_NAMES[h % ATTACK_NAMES.length], line: ATTACK_LINES[(h >>> 4) % ATTACK_LINES.length] };
}
