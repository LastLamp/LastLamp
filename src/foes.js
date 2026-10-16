import { speakMove } from "./foeVoice.js";

const ATTACKS = [
  "Needle Gust", "Skitter", "Shear Line", "Cross Cut", "Howl Strike", "Salt Lash", "Keel Bite", "Rip Current",
  "Cinder Jab", "Brand Slash", "Ash Spit", "Spark Lunge", "Boulder Fist", "Quarry Chop", "Dust Slam", "Mile Crash",
  "Shade Nick", "Hush Stab", "Veil Rake", "Lamp Flick", "Boar Rush", "Tusk Gore", "Choir Note", "Bell Crack",
  "Sunbrand", "Iron Sweep", "Widow Thread", "Drake Snap", "Saint Blow", "Warden Cleave",
];
const DEFENDS = ["Ash Wall", "Buffer", "Breakwater", "Brace", "Veil Fold", "Rampart", "Tuck", "Set Shield", "Hold the Mile", "Bank the Fire", "Pool Guard", "Stone Back"];
const HEXES = ["Cinder Hex", "Static", "Salt Hex", "Dust Weight", "Whisper", "Dread", "Smoke Mark", "Howl", "Drown", "Cursebell", "Pale Mark", "Thread Hex"];
const MENDS = ["Ember Mend", "Second Wind", "Tide Mend", "Set Bone", "Knit Shadow", "Choir Mend", "Lamp Mend", "Bell Mend"];

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(list, n, salt) {
  return list[(n + salt) % list.length];
}

function signature(kit) {
  return kit.map((move) => move.name).join("/");
}

const reserved = new Map();

function buildKit(h, role) {
  const pattern =
    role === "boss"
      ? ["attack", "hex", "attack", "defend", "attack"]
      : role === "hexer"
        ? ["hex", "attack", "hex"]
        : role === "bulwark"
          ? ["defend", "attack", "defend"]
          : role === "medic"
            ? ["mend", "defend", "attack"]
            : role === "skirmish"
              ? ["attack", "hex", "attack"]
              : ["attack", "defend", "attack"];
  const used = { attack: 0, defend: 0, hex: 0, mend: 0 };
  return pattern.map((intent) => {
    const bank = intent === "defend" ? DEFENDS : intent === "hex" ? HEXES : intent === "mend" ? MENDS : ATTACKS;
    const move = pick(bank, h + used[intent] * 97, intent.length * 3);
    used[intent] += 1;
    return { intent, name: move };
  });
}

const BOSSES = {
  "Road Wisp": [
    { intent: "attack", name: "Road Howl" },
    { intent: "hex", name: "Lost Breath" },
    { intent: "attack", name: "Mile Shear" },
    { intent: "defend", name: "Spin Away" },
  ],
  Hexer: [
    { intent: "hex", name: "Gate Curse" },
    { intent: "attack", name: "Needle Word" },
    { intent: "hex", name: "Second Curse" },
    { intent: "defend", name: "Step Behind" },
  ],
  "Kiln Sprite": [
    { intent: "attack", name: "Kiln Spit" },
    { intent: "attack", name: "Ember Rain" },
    { intent: "hex", name: "Choke Smoke" },
    { intent: "defend", name: "Bank Coals" },
  ],
  "Mute Shade": [
    { intent: "hex", name: "Take the Voice" },
    { intent: "attack", name: "Quiet Cut" },
    { intent: "defend", name: "Fold In" },
    { intent: "hex", name: "Stillness" },
  ],
  "The Empty Seat": [
    { intent: "attack", name: "Vacant Blow" },
    { intent: "hex", name: "Name Nobody" },
    { intent: "defend", name: "Empty Guard" },
    { intent: "attack", name: "Chair Slam" },
  ],
  "Ford Spirit": [
    { intent: "attack", name: "Pull Under" },
    { intent: "defend", name: "Rising Ford" },
    { intent: "mend", name: "Backwash" },
    { intent: "attack", name: "White Water" },
  ],
  "Quarry Brute": [
    { intent: "defend", name: "Set the Block" },
    { intent: "attack", name: "Sledge" },
    { intent: "attack", name: "Cave-in" },
    { intent: "defend", name: "Shoulder" },
  ],
  "Cinder Wisp": [
    { intent: "attack", name: "Trail Fire" },
    { intent: "hex", name: "Catch Light" },
    { intent: "attack", name: "Run the Path" },
    { intent: "defend", name: "Ash Screen" },
  ],
  "Watch Shade": [
    { intent: "hex", name: "Marked Watch" },
    { intent: "attack", name: "From the Dark" },
    { intent: "hex", name: "Second Watch" },
    { intent: "defend", name: "Lamp Out" },
  ],
  "Span Warden": [
    { intent: "attack", name: "Bridge Break" },
    { intent: "defend", name: "Hold the Gap" },
    { intent: "hex", name: "Long Fall" },
    { intent: "attack", name: "Warden's Toll" },
  ],
  "The Last Lamp": [
    { intent: "attack", name: "Last Light" },
    { intent: "hex", name: "Put it Out" },
    { intent: "attack", name: "Mile End" },
    { intent: "defend", name: "Stand the Post" },
  ],
  "Road Boar": [
    { intent: "attack", name: "Charge" },
    { intent: "attack", name: "Tusk" },
    { intent: "defend", name: "Plant" },
    { intent: "attack", name: "Trample" },
  ],
  "Lamp Wisp": [
    { intent: "attack", name: "Wick Strike" },
    { intent: "hex", name: "Hot Glass" },
    { intent: "mend", name: "Relight" },
    { intent: "attack", name: "Flare" },
  ],
  "Drill Warden": [
    { intent: "attack", name: "Measured Blow" },
    { intent: "hex", name: "Call the Count" },
    { intent: "defend", name: "Don't Rush" },
    { intent: "attack", name: "Last Chair" },
  ],
  "Glass Hydra": [
    { intent: "attack", name: "Shard Fan" },
    { intent: "attack", name: "Second Head" },
    { intent: "hex", name: "Reflect" },
    { intent: "mend", name: "Grow Back" },
  ],
  "Choir of Ash": [
    { intent: "hex", name: "Ash Hymn" },
    { intent: "attack", name: "Cinder Chord" },
    { intent: "mend", name: "Reprise" },
    { intent: "attack", name: "Final Verse" },
  ],
  "Drowned Saint": [
    { intent: "attack", name: "Saint's Weight" },
    { intent: "hex", name: "Drown the Name" },
    { intent: "defend", name: "Still Water" },
    { intent: "mend", name: "Rise Again" },
  ],
  "Iron Regent": [
    { intent: "defend", name: "Crown Guard" },
    { intent: "attack", name: "Decree" },
    { intent: "attack", name: "Iron Tax" },
    { intent: "hex", name: "Kneel" },
  ],
  "Mile Herald": [
    { intent: "attack", name: "Herald Slash" },
    { intent: "hex", name: "Mile Mark" },
    { intent: "attack", name: "Open the Road" },
    { intent: "defend", name: "Plant the Standard" },
    { intent: "attack", name: "Herald's End" },
  ],
  "Gate Captain": [
    { intent: "defend", name: "Bar the Gate" },
    { intent: "attack", name: "Captain's Cut" },
    { intent: "hex", name: "Call the Watch" },
    { intent: "attack", name: "Drive Through" },
    { intent: "attack", name: "Gatebreaker" },
  ],
  "Kiln Lord": [
    { intent: "attack", name: "Lord's Brand" },
    { intent: "attack", name: "Kiln Collapse" },
    { intent: "hex", name: "Choke the Air" },
    { intent: "defend", name: "Bank the Lord" },
    { intent: "attack", name: "White Kiln" },
  ],
  "Silent Bell": [
    { intent: "hex", name: "No Tongue" },
    { intent: "attack", name: "Bell Crack" },
    { intent: "defend", name: "Still Air" },
    { intent: "hex", name: "Second Silence" },
    { intent: "attack", name: "The Toll" },
  ],
  "Vacant Knight": [
    { intent: "defend", name: "Empty Plate" },
    { intent: "attack", name: "Nobody's Sword" },
    { intent: "hex", name: "Unnamed" },
    { intent: "attack", name: "Vacant Charge" },
    { intent: "attack", name: "Seat of None" },
  ],
  "Ford King": [
    { intent: "attack", name: "King's Current" },
    { intent: "defend", name: "High Ford" },
    { intent: "mend", name: "The King Rises" },
    { intent: "hex", name: "Drag Under" },
    { intent: "attack", name: "Drown the Crossing" },
  ],
  "Quarry Saint": [
    { intent: "defend", name: "Saint's Block" },
    { intent: "attack", name: "Sledge Hymn" },
    { intent: "attack", name: "Cave Hymn" },
    { intent: "hex", name: "Dust Prayer" },
    { intent: "attack", name: "The Saint Falls" },
  ],
  "Ash Regent": [
    { intent: "attack", name: "Regent's Brand" },
    { intent: "hex", name: "Ash Decree" },
    { intent: "attack", name: "Cinder Tax" },
    { intent: "defend", name: "Crown of Ash" },
    { intent: "attack", name: "Regent's Pyre" },
  ],
  "Night Captain": [
    { intent: "hex", name: "Lights Out" },
    { intent: "attack", name: "From the Watch" },
    { intent: "defend", name: "Hold the Dark" },
    { intent: "attack", name: "Second Watch" },
    { intent: "attack", name: "Captain's Night" },
  ],
  "Span Beast": [
    { intent: "attack", name: "Bridge Lunge" },
    { intent: "attack", name: "Tear the Span" },
    { intent: "hex", name: "Long Drop" },
    { intent: "defend", name: "Brace the Gap" },
    { intent: "attack", name: "Beast's Toll" },
  ],
  "Second Flame": [
    { intent: "attack", name: "Second Spark" },
    { intent: "hex", name: "Catch Again" },
    { intent: "attack", name: "Run Hot" },
    { intent: "mend", name: "Relight the Kiln" },
    { intent: "attack", name: "Flame's Claim" },
  ],
  "Wick Tyrant": [
    { intent: "attack", name: "Tyrant's Wick" },
    { intent: "hex", name: "Hot Glass" },
    { intent: "defend", name: "Lamp Cage" },
    { intent: "attack", name: "Burn the Oil" },
    { intent: "attack", name: "Tyrant's Flare" },
  ],
  "Boar King": [
    { intent: "attack", name: "King's Charge" },
    { intent: "attack", name: "Tusk Crown" },
    { intent: "defend", name: "Plant the Hoof" },
    { intent: "hex", name: "Trample Fear" },
    { intent: "attack", name: "The King Passes" },
  ],
  "Mile Tyrant": [
    { intent: "hex", name: "Own the Mile" },
    { intent: "attack", name: "Tyrant Cut" },
    { intent: "defend", name: "Close the Road" },
    { intent: "attack", name: "No Passage" },
    { intent: "attack", name: "End of the Mile" },
  ],
};

export function strengthenBoss(name, kit) {
  if (!kit || kit.length >= 5) return annotate(kit, name);
  const title = `${name} End`;
  if (kit.some((move) => move.name === title)) return annotate(kit, name);
  return annotate([...kit, { intent: "attack", name: title }], name);
}

const HEX_EFFECTS = ["poison", "stun", "sleep", "weak"];

function annotate(kit, foeName) {
  return kit.map((move, index) => {
    const effect = move.intent === "hex" ? move.effect || HEX_EFFECTS[hash(move.name) % HEX_EFFECTS.length] : move.effect;
    const spoken = speakMove(foeName || move.name, move.intent, effect, index);
    const canned = /^(A direct hit|They raise a guard|They restore an ally|A heavier hit|The finishing blow|A small cut|A short, heavy hit|A light hit|A quick jab|A heavy swing|A wide slash|They swing again)\.?$/.test(move.line || "");
    const generatedName = / (Strike|Guard|Hex|Follow|Opening|End|Wall|Shove|Brace|Nick|Tap|Mend|Cover|Curse|Again|Break)$/.test(move.name);
    return {
      ...move,
      effect,
      name: !move.name || generatedName || canned ? spoken.name : move.name,
      line: !move.line || canned ? spoken.line : move.line,
    };
  });
}

export function kitForFoe(name, element, role) {
  if (BOSSES[name]) return annotate(BOSSES[name], name);
  if (reserved.size === 0) {
    for (const [boss, kit] of Object.entries(BOSSES)) reserved.set(signature(kit), boss);
  }
  const key = `${name}:${role}`;
  let h = hash(`${key}:${element}`);
  let kit = buildKit(h, role);
  let guard = 0;
  while (reserved.has(signature(kit)) && reserved.get(signature(kit)) !== key && guard < 48) {
    h = (h + 131 + guard * 17) >>> 0;
    kit = buildKit(h, role);
    guard += 1;
  }
  reserved.set(signature(kit), key);
  return annotate(kit, name);
}

export const GRUNTS = [
  ["Gale Imp", "gale", "striker"],
  ["Road Wisp", "gale", "skirmish"],
  ["Shearling", "gale", "striker"],
  ["Howler", "gale", "hexer"],
  ["Ford Grip", "tide", "bulwark"],
  ["Spray", "tide", "striker"],
  ["Salt Knight", "tide", "bulwark"],
  ["Pool Wight", "tide", "medic"],
  ["Spark Colt", "flare", "striker"],
  ["Ash Dancer", "flare", "skirmish"],
  ["Cinder Imp", "flare", "hexer"],
  ["Brand Knight", "flare", "striker"],
  ["Dust Golem", "stone", "bulwark"],
  ["Mile Stone", "stone", "bulwark"],
  ["Rampart", "stone", "bulwark"],
  ["Mire Shade", "veil", "hexer"],
  ["Murmur", "veil", "hexer"],
  ["Night Call", "veil", "skirmish"],
  ["Chair Wight", "veil", "boss"],
  ["Ash Widow", "flare", "hexer"],
  ["Mile Drake", "stone", "boss"],
  ["Drowned Bell", "tide", "hexer"],
  ["Pale Warden", "veil", "boss"],
  ["Sunbrand", "flare", "striker"],
].map(([name, element, role]) => ({ name, element, role, kit: kitForFoe(name, element, role) }));

export const TOWER_BOSSES = ["Glass Hydra", "Choir of Ash", "Drowned Saint", "Iron Regent", "Span Warden", "The Last Lamp", "Road Boar", "Drill Warden"].map(
  (name) => ({ name, element: "veil", role: "boss", kit: kitForFoe(name, "veil", "boss") })
);
