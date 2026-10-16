import { applyBondStories } from "./bondStories.js";
import { EXTRA_CAST } from "./cast.js";
import { GENERATED_CAST } from "./generatedCast.js";
import { EXTRA_UNITS } from "./extraUnits.js";
import { LEGENDS } from "./legends.js";
import { ROSTER } from "./roster.js";

export const ELEMENTS = {
  flare: { label: "Fire", beats: "gale", color: "#ff6a3d" },
  gale: { label: "Wind", beats: "tide", color: "#2f8a45" },
  tide: { label: "Water", beats: "flare", color: "#6cb6ff" },
  stone: { label: "Earth", beats: "veil", color: "#e0b98a" },
  veil: { label: "Shadow", beats: "stone", color: "#c89bff" },
};

export const GIFTS = {
  fanmail: {
    id: "fanmail",
    name: "Road Letter",
    value: 22,
    blurb: "Ink from someone who made it back down.",
  },
  bouquet: {
    id: "bouquet",
    name: "Wildflowers",
    value: 48,
    blurb: "Picked on a landing where the stone still grows.",
  },
  keepsake: {
    id: "keepsake",
    name: "Relic",
    value: 100,
    blurb: "A shard that remembers who carried it.",
  },
};

function priceCard(card) {
  if (!card || card.kind === "ego") return card;
  const ratio = Number(card.ratio) || 0;
  const hits = card.hits || 1;
  const weight = ratio * hits;
  const heavy = Boolean(card.aoe) || weight >= 1.5 || (card.stun && ratio >= 0.7) || (card.sleep && ratio >= 0.7);
  const gain = Boolean(card.again) && ratio === 0 && !card.aoe;
  const light = !heavy && (gain || (ratio > 0 && ratio <= 0.85 && hits === 1 && !card.aoe && !card.stun && !card.sleep));
  return { ...card, cost: heavy ? 2 : light ? 0 : 1 };
}

const attack = (partial) => priceCard({ kind: "attack", cost: 1, ...partial });
const skill = (partial) => priceCard({ kind: "skill", cost: 1, ...partial });
const ego = (partial) => ({ kind: "ego", cost: 2, once: true, ...partial });

export const CHARACTERS = [
  {
    id: "vesper",
    name: "Vaelisse",
    title: "Oracle of the dark moon",
    rarity: "SSR",
    element: "veil",
    role: "Controller",
    sigil: "Va",
    she: true,
    color: "#b794f6",
    favorite: "keepsake",
    maxHp: 96,
    atk: 16,
    quote: "Come by after dark, and I'll talk more easily then.",
    blurb: "She spoke for a temple until they asked her to lie. She left. She still answers people after dark.",
    cards: [
      attack({ id: "dead-air", name: "Umbral Cut", ratio: 1, shield: 8, poison: 2 }),
      skill({ id: "quiet", name: "Hush", shield: 16, stress: -15 , shred: true}),
      ego({ id: "sign-off", name: "Last Rite", ratio: 2.3, weaken: true, stun: 1 }),
    ],
    rooms: [
      {
        title: "The candle",
        body: "The temple put the candles out at a set hour. She lights one anyway. She says people sleep easier when someone is willing to stay up.",
      },
      {
        title: "Turned away",
        body: "She can still name the petitioners she refused because they wanted a flattering prophecy. One name is missing from that list. She let that one through.",
      },
      {
        title: "The slip",
        body: "During a blessing she said a name that was not in the rite. She noticed. She left it in, and she still laughs about it under her breath.",
      },
    ],
  },
  {
    id: "cael",
    name: "Caelor",
    title: "Knight of the solar gate",
    rarity: "SSR",
    element: "flare",
    role: "Attacker",
    sigil: "Ca",
    color: "#ff7a45",
    favorite: "bouquet",
    maxHp: 84,
    atk: 21,
    quote: "Keep your eyes on the fight, and don't look away.",
    blurb: "A duelist. He set a fire to save a village, and his brother died in it. He doesn't look away from a fight.",
    cards: [
      attack({ id: "spot", name: "Blaze", ratio: 1.3 }),
      attack({ id: "backbeat", name: "Cinderfall", ratio: 0.7, aoe: true , critDmg: 2}),
      ego({ id: "white-heat", name: "Inferno", ratio: 2.8 }),
    ],
    rooms: [
      {
        title: "Pulse",
        body: "He comes back from a fight still counting under his breath. He checks his own pulse at the throat until the number drops.",
      },
      {
        title: "Eight-count",
        body: "He still runs his brother's eight-count when he thinks he is alone. When he gets it right he looks annoyed, then runs it again.",
      },
      {
        title: "Don't look away",
        body: "He says the hard part of fire is looking at what it costs. He stays until he has finished saying it.",
      },
    ],
  },
  {
    id: "ivo",
    name: "Ivelisse",
    she: true,
    title: "Wind scholar",
    rarity: "SSR",
    element: "gale",
    role: "Support",
    sigil: "Iv",
    color: "#5eead4",
    favorite: "fanmail",
    maxHp: 90,
    atk: 15,
    quote: "I already fixed the spell, because it was wrong.",
    blurb: "She copied documents for a court and left with the one page they wanted burned. She corrects people when she cares.",
    cards: [
      attack({ id: "margin", name: "Gale Cut", ratio: 0.95 }),
      skill({ id: "footnote", name: "Tailwind", draw: 2, stress: -8 , res: 2}),
      ego({ id: "last-line", name: "Tempest", ratio: 1.45, aoe: true, vuln: true }),
    ],
    rooms: [
      {
        title: "Red pen",
        body: "She edits a sentence while the speaker is still talking, then reads it back quieter. Getting the words right is how she looks after people.",
      },
      {
        title: "Unsent",
        body: "She writes letters and does not send them. The formal address is often scratched out and replaced with a first name. She goes pink if anyone sees it.",
      },
      {
        title: "Permission",
        body: "At court, nobody asked before they read a private line aloud. She puts the pen down and asks.",
      },
    ],
  },
  {
    id: "rhys",
    name: "Rhyskar",
    title: "House knight",
    rarity: "SSR",
    element: "stone",
    role: "Guardian",
    sigil: "Rh",
    color: "#e7c39a",
    favorite: "keepsake",
    maxHp: 124,
    atk: 13,
    quote: "Stand behind me, and I'll take what comes.",
    blurb: "He guarded a house, then quit when they pointed him at the wrong man. He checks the doors before he checks on his people.",
    cards: [
      attack({ id: "downbeat", name: "Shield Bash", ratio: 0.85, shield: 8 }),
      skill({ id: "barricade", name: "Bulwark", shield: 24 , defUp: 2, res: 2}),
      ego({ id: "hold", name: "Aegis", ratio: 1.15, shield: 14, weaken: true }),
    ],
    rooms: [
      {
        title: "Second look",
        body: "He checks the doors twice. The second pass is slower. That one never went into a report.",
      },
      {
        title: "Collar",
        body: "He fixes his own collar and stands very still while he does it. Outside is weather he has decided his people do not have to stand in.",
      },
      {
        title: "Armor off",
        body: "Without the plate he is a man with a bruised knuckle and a ridiculous laugh. He asked one person to keep that private. He still hopes they did.",
      },
    ],
  },
  {
    id: "soren",
    name: "Soren",
    title: "Healer of the glass sea",
    rarity: "SSR",
    element: "tide",
    role: "Support",
    sigil: "So",
    color: "#7eb6ff",
    favorite: "bouquet",
    maxHp: 104,
    atk: 14,
    quote: "I meant it, so you don't have to applaud.",
    blurb: "A coastal court trained him to act kind for nobles. He left. The kindness he shows now is his, and he's clumsy with it.",
    cards: [
      attack({ id: "closeup", name: "Tide Lance", ratio: 1.05 }),
      skill({ id: "cue", name: "Cure", heal: 18, stress: -8, res: 2 }),
      ego({ id: "off-script", name: "Miracle", ratio: 1.9, heal: 12 }),
    ],
    rooms: [
      {
        title: "Both ways",
        body: "He can do the court bow, and he can stand like a man who does not owe anyone a show. He says the second one was never practiced.",
      },
      {
        title: "Coming up",
        body: "After a long rite he puts his forehead on his knees and breathes like someone coming up from deep water. Then he talks anyway.",
      },
      {
        title: "The real hand",
        body: "He keeps a sea-glass ring in his pocket. He was told to give it back when the courtesy ended. He never decided when that was.",
      },
    ],
  },
  {
    id: "juniper",
    name: "Ysmerra",
    title: "Wind chanter",
    rarity: "SR",
    element: "gale",
    role: "Attacker",
    sigil: "Ys",
    she: true,
    color: "#86efac",
    favorite: "fanmail",
    maxHp: 86,
    atk: 16,
    quote: "I can hit the high note, if you'll watch.",
    blurb: "She sang on the hills, where dropping a note early was an insult. She remembers how people sound.",
    cards: [
      attack({ id: "harmony", name: "Chorus Gale", ratio: 0.95, aoe: true, weaken: true }),
      attack({ id: "high-note", name: "High Chant", ratio: 1.5 , crit: 2}),
      ego({ id: "bridge", name: "Bridge of Air", ratio: 1.15, shield: 12, draw: 1 }),
    ],
    rooms: [
      {
        title: "The high line",
        body: "She holds a note past comfort and grins when it breaks. On the hills, stopping early meant the singer was afraid.",
      },
      {
        title: "Bad tea",
        body: "She makes tea the way her mother told her not to, then drinks it herself and looks pleased about the disobedience.",
      },
      {
        title: "Unison",
        body: "She can hum a person's speaking voice back in tune. She is always a little surprised she kept it.",
      },
    ],
  },
  {
    id: "marek",
    name: "Marrec",
    title: "Cinder adept",
    rarity: "SR",
    element: "flare",
    role: "Attacker",
    sigil: "Ma",
    color: "#fb7185",
    favorite: "bouquet",
    maxHp: 80,
    atk: 18,
    quote: "If it doesn't catch, then it isn't done.",
    blurb: "His father blew glass. Marrec learned fire by standing too close. He pulls other people back and stays in it himself.",
    cards: [
      attack({ id: "spark", name: "Spark", ratio: 1.25 }),
      attack({ id: "pyro", name: "Fire Rain", ratio: 0.8, aoe: true, vuln: true, critDmg: 2 }),
      ego({ id: "blowout", name: "Eruption", ratio: 1.7, aoe: true }),
    ],
    rooms: [
      {
        title: "Safety distance",
        body: "He moves people back from a furnace with two fingers on the wrist, the way his father moved him, then stays inside the distance he just cleared.",
      },
      {
        title: "Cold flowers",
        body: "He tucks the wildflowers behind his ear as a joke. The joke ends. The flowers stay until the petals warm against his skin.",
      },
      {
        title: "After the flare",
        body: "When the fire dies he gets shy and asks if he overdid it. He is not talking about the fire.",
      },
    ],
  },
  {
    id: "theo",
    name: "Theara",
    she: true,
    title: "Healer of the low tide",
    rarity: "SR",
    element: "tide",
    role: "Support",
    sigil: "Th",
    color: "#93c5fd",
    favorite: "fanmail",
    maxHp: 102,
    atk: 12,
    quote: "Breathe, and I'll take care of the rest.",
    blurb: "She grew up on a fishing boat. She notices when someone has stopped breathing right.",
    cards: [
      attack({ id: "undertow", name: "Undertow", ratio: 0.9, heal: 10 }),
      skill({ id: "rest", name: "Rest", heal: 20 , defUp: 2}),
      ego({ id: "lullaby", name: "Lullaby", heal: 14, stress: -22, sleep: 2 }),
    ],
    rooms: [
      {
        title: "The count",
        body: "She counts a slow rest with a hand on a frightened person's back until their shoulders drop. On the boat, that was how the crew kept a sailor from panicking.",
      },
      {
        title: "Underlined",
        body: "She keeps old letters and underlines the kind sentences. She says a net needs something soft in it or the catch tears.",
      },
      {
        title: "The walk",
        body: "After a bad night she walks as far as the water and does not talk. The crew learned to let her.",
      },
    ],
  },
  {
    id: "bastion",
    name: "Bastior",
    title: "Castellan",
    rarity: "SR",
    element: "stone",
    role: "Guardian",
    sigil: "Ba",
    color: "#d6d3d1",
    favorite: "keepsake",
    maxHp: 114,
    atk: 12,
    quote: "Hold still, because I need everyone where I can see them.",
    blurb: "He ran a keep. It fell while he was counting stores. He still thinks a list can keep people alive.",
    cards: [
      skill({ id: "block", name: "Ward", shield: 18 , defUp: 2, res: 2}),
      attack({ id: "shove", name: "Shove", ratio: 1.05, weaken: true }),
      ego({ id: "lock", name: "Lock the Gate", shield: 16, weaken: true, ratio: 0.9 }),
    ],
    rooms: [
      {
        title: "The marks",
        body: "He marks where people should stand. The marks end up closer together than the plan says. In the keep, distance was how he lost them.",
      },
      {
        title: "Have you eaten",
        body: "He stops giving orders. The next question is whether anyone has eaten, and he waits for a real answer.",
      },
      {
        title: "Unscheduled",
        body: "He could send the next watch out. Sometimes he does not. He puts a hand on a shoulder and waits to see if that person will stay.",
      },
    ],
  },
  {
    id: "niles",
    name: "Nylas",
    title: "Rite master",
    rarity: "SR",
    element: "veil",
    role: "Controller",
    sigil: "Ny",
    color: "#d8b4fe",
    favorite: "fanmail",
    maxHp: 92,
    atk: 15,
    quote: "Say it again, and mean the person this time.",
    blurb: "He exposed fake oracles for a living. He's harder on his own words than on theirs.",
    cards: [
      attack({ id: "cut", name: "Sever", ratio: 1.15, weaken: true, vuln: true }),
      skill({ id: "notes", name: "Margin Glyph", draw: 1, stress: -12 , shred: true}),
      ego({ id: "directors", name: "True Name", ratio: 1.85, vuln: true, stun: 1 }),
    ],
    rooms: [
      {
        title: "Again",
        body: "He makes a student repeat a vow until it sounds like a person and not a formula. When it does, he forgets to tell them to stop.",
      },
      {
        title: "The true sentence",
        body: "He slides a letter across the table, one sentence circled. That one is true, he says. He does not say he wrote it.",
      },
      {
        title: "Not for the record",
        body: "He is gentle when he is checking whether someone is lying. He says that part of the work does not go in the archive.",
      },
    ],
  },
  {
    id: "orien",
    name: "Orien",
    title: "Squire of the first flame",
    rarity: "SR",
    element: "flare",
    role: "Attacker",
    sigil: "Or",
    color: "#fdba74",
    favorite: "bouquet",
    maxHp: 88,
    atk: 15,
    quote: "I practiced where Caelor couldn't hear, so tell me if it landed.",
    blurb: "He trains under Cael and won't call it that. He practices where Cael can't hear him.",
    cards: [
      attack({ id: "first-step", name: "First Flame", ratio: 1.15, shield: 6 }),
      attack({ id: "chorus-kid", name: "Scatterfire", ratio: 0.85, aoe: true, vuln: true , critDmg: 2}),
      ego({ id: "debut", name: "Oath", ratio: 1.8, shield: 10 }),
    ],
    rooms: [
      {
        title: "Where no one walks",
        body: "He practices where he thinks Cael will not hear him. If someone walks in, he finishes anyway, ears red, and asks if the last step landed.",
      },
      {
        title: "What to do with flowers",
        body: "He does not know what to do with wildflowers, so he holds them like a weapon he is afraid to drop. One ended up in his pocket. He went quiet, and he looked pleased.",
      },
      {
        title: "In ink",
        body: "He writes names in a drill book in pencil, then inks them if the person is still around the next day. There is often ink on his hand.",
      },
    ],
  },
  {
    id: "kit",
    name: "Kithra",
    title: "Apprentice",
    rarity: "R",
    element: "gale",
    role: "Support",
    sigil: "Ki",
    she: true,
    color: "#a7f3d0",
    favorite: "fanmail",
    maxHp: 78,
    atk: 11,
    quote: "I labeled the bottles, though two of the labels are guesses.",
    blurb: "They told her she was only good for carrying water. She still carries it. She also hits harder than that job needs.",
    cards: [
      attack({ id: "cable", name: "Staff Tap", ratio: 1.05, weaken: true }),
      skill({ id: "water", name: "Flask", heal: 12, shield: 6 , critDmg: 2}),
      ego({ id: "patch", name: "Mend the Circle", heal: 8, shield: 10, draw: 1 }),
    ],
    rooms: [
      {
        title: "Wrong label",
        body: "She mislabels a reagent and fixes it before anyone shouts. She hopes someone noticed the fix more than the mistake.",
      },
      {
        title: "The good note",
        body: "Someone wrote her a kind letter. She did not believe it until she read it out loud to herself a second time.",
      },
      {
        title: "Coats",
        body: "She waits by the door with everyone's coats already sorted. She pretends that is not the part of the night she likes.",
      },
    ],
  },
  {
    id: "pavel",
    name: "Pavellen",
    title: "Stonehand",
    rarity: "R",
    element: "stone",
    role: "Guardian",
    sigil: "Pa",
    color: "#d4c4a8",
    favorite: "keepsake",
    maxHp: 100,
    atk: 10,
    quote: "The brace stays up, and I'm staying with it.",
    blurb: "A mason. He braces things before they fall, then acts like the brace was always part of the wall.",
    cards: [
      skill({ id: "sandbag", name: "Stonewall", shield: 18 , defUp: 2, res: 2}),
      attack({ id: "brace", name: "Brace", ratio: 1, shield: 8 }),
      ego({ id: "rig", name: "Seal", ratio: 0.6, shield: 16, heal: 10, weaken: true }),
    ],
    rooms: [
      {
        title: "Already there",
        body: "He sets a brace where someone is about to stumble and pretends it was part of the wall. His father taught him that a good repair should look like it was always there.",
      },
      {
        title: "Would have been rubble",
        body: "A relic from a torn-down shrine ends up in someone else's bag. He says it would have been thrown out. His ears disagree.",
      },
      {
        title: "After the crew",
        body: "Everyone else has gone. He still walks the dark worksite. He calls it a courtesy.",
      },
    ],
  },
  {
    id: "len",
    name: "Lenara",
    she: true,
    title: "Field cleric",
    rarity: "R",
    element: "tide",
    role: "Support",
    sigil: "Le",
    color: "#a5d8ff",
    favorite: "bouquet",
    maxHp: 90,
    atk: 10,
    quote: "Sit down, because your hands are shaking.",
    blurb: "She marched with sellswords as the one who made them sit down. She sees a shake in the hands before the owner does.",
    cards: [
      skill({ id: "rundown", name: "Sit", heal: 12, stress: -10 , crit: 2}),
      attack({ id: "cue-tap", name: "Gentle Strike", ratio: 0.95, weaken: true }),
      ego({ id: "hold-please", name: "Stay With Me", heal: 14, stress: -12, shield: 8 }),
    ],
    rooms: [
      {
        title: "Sit",
        body: "She tells a fighter the next watch is soon, then makes them sit. Their hands were shaking. Making people sit used to be her whole job.",
      },
      {
        title: "Left flowers",
        body: "Wildflowers meant for a captain ended up beside a wounded scout. The card was in her handwriting.",
      },
      {
        title: "The extra minute",
        body: "She holds a door with her foot and steals a quiet minute for whoever is on the other side of it.",
      },
    ],
  },
  {
    id: "remy",
    name: "Remira",
    title: "Sellsword",
    rarity: "R",
    element: "flare",
    role: "Attacker",
    sigil: "Re",
    she: true,
    color: "#fda4af",
    favorite: "fanmail",
    maxHp: 76,
    atk: 13,
    quote: "I'm in the back, and I'm still in this fight.",
    blurb: "Hired to stay in the back. Her last company never used her name, so she steps forward until someone does.",
    cards: [
      attack({ id: "background", name: "Step In", ratio: 1.25, vuln: true }),
      attack({ id: "scatter", name: "From the Rear", ratio: 0.8, aoe: true , crit: 2}),
      ego({ id: "step-in", name: "Into the Light", ratio: 1.85, vuln: true }),
    ],
    rooms: [
      {
        title: "Supposed to cross behind",
        body: "She was paid to pass behind the named fighters and stay forgotten. She stopped once, long enough that they had to look at her. She still seems surprised it worked.",
      },
      {
        title: "One sentence",
        body: "She keeps a single letter in her jacket. It is one sentence, and it has her name in it. She says that is plenty if the sentence is right.",
      },
      {
        title: "Nobody watching",
        body: "When the named fighters leave, she stays under the work lamp and spars alone.",
      },
    ],
  },
  {
    id: "nera",
    name: "Nerathiel",
    title: "Hill herbalist",
    rarity: "SR",
    element: "stone",
    role: "Healer",
    sigil: "Ne",
    she: true,
    color: "#7d9a62",
    favorite: "bouquet",
    maxHp: 102,
    atk: 13,
    quote: "Sit, because that cut can wait until you breathe.",
    blurb: "She keeps a hill clinic for travelers who won't go into town. She knows which plants are medicine and which are just stubborn.",
    cards: [
      attack({ id: "root-cut", name: "Thorn", ratio: 1.05, poison: 2 }),
      skill({ id: "poultice", name: "Poultice", heal: 14, stress: -8 , res: 2}),
      ego({ id: "old-growth", name: "Old Growth", heal: 16, shield: 10, stress: -10 }),
    ],
    rooms: [
      {
        title: "The drying line",
        body: "She hangs herbs where the wind can reach them. If a bundle falls, she ties it again. She says the hill does not get a day off.",
      },
      {
        title: "Closed gate",
        body: "A lord's man once asked her to poison a rival's horse. She sent him downhill with a sprain and no directions.",
      },
      {
        title: "Night kettle",
        body: "She boils water before she sleeps, in case someone knocks. Most nights nobody does. She boils it anyway.",
      },
    ],
  },
  {
    id: "silas",
    name: "Silavar",
    title: "Night warden",
    rarity: "R",
    element: "veil",
    role: "Controller",
    sigil: "Si",
    color: "#6d5b8a",
    favorite: "fanmail",
    maxHp: 90,
    atk: 15,
    quote: "If you can hear me, then you waited too long.",
    blurb: "He walked the night road for a toll house that stopped paying him. He still walks it. The things in the dark got used to his lamp.",
    cards: [
      attack({ id: "quiet-step", name: "Quiet Step", ratio: 1.05, poison: 2 }),
      skill({ id: "smoke", name: "Lamp Smoke", shield: 8, stress: -8 , shred: true}),
      ego({ id: "blackout", name: "Blackout", ratio: 1.7, stun: 1, weaken: true }),
    ],
    rooms: [
      {
        title: "The unpaid mile",
        body: "The toll book still has his name on the last page. He left the book. He kept the route.",
      },
      {
        title: "One light",
        body: "He carries a lamp with a cracked pane. He could replace it. He says a whole pane hides the road.",
      },
      {
        title: "Names he knows",
        body: "He can tell who is on the road by the way their boots hit. He does not announce them. He just steps aside, or he doesn't.",
      },
    ],
  },
  {
    id: "maris",
    name: "Mariselle",
    title: "Ferry captain",
    rarity: "SSR",
    element: "tide",
    role: "Attacker",
    sigil: "Ma",
    she: true,
    color: "#3d7ea8",
    favorite: "keepsake",
    maxHp: 92,
    atk: 19,
    quote: "The crossing has a price, and I set it.",
    blurb: "She runs the only ferry that still crosses after dark. She lost a boat, and the people on it, to a flood she had warned them about.",
    cards: [
      attack({ id: "keel", name: "Keel Cut", ratio: 1.2 }),
      skill({ id: "bail", name: "Bail Out", heal: 12, shield: 8 , critDmg: 2}),
      ego({ id: "high-tide", name: "High Tide", ratio: 2.1, aoe: true, vuln: true }),
    ],
    rooms: [
      {
        title: "The warning",
        body: "She told the town the water would take the lower dock. They loaded the boat anyway. She still hears the rope snap.",
      },
      {
        title: "Fare box",
        body: "She charges what a person can carry, not what a ledger says. Soldiers pay double. Children pay nothing.",
      },
      {
        title: "After dark",
        body: "The night crossing is slower. She stands at the bow and does not talk. The river is loud enough.",
      },
    ],
  },
  ...EXTRA_CAST,
  ...GENERATED_CAST,
  ...LEGENDS,
  ...EXTRA_UNITS,
].filter((unit) => ROSTER.has(unit.id)).map((unit) => ({
  ...unit,
  cards: (unit.cards || []).map(priceCard),
}));

applyBondStories(CHARACTERS);

const RATE_ZONE = "America/New_York";
const RATE_WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function etParts(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: RATE_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

export function rateWeekId(now = new Date()) {
  const parts = etParts(now);
  const weekday = RATE_WEEKDAYS[parts.weekday] ?? 1;
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  let back = (weekday + 6) % 7;
  if (back === 0 && minutes < 12 * 60) back = 7;
  const cursor = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  cursor.setUTCDate(cursor.getUTCDate() - back);
  const month = String(cursor.getUTCMonth() + 1).padStart(2, "0");
  const day = String(cursor.getUTCDate()).padStart(2, "0");
  return `${cursor.getUTCFullYear()}-${month}-${day}`;
}

function rateSeed(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rateRand(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function weeklyBanners(now = new Date()) {
  const week = rateWeekId(now);
  const heroes = CHARACTERS.filter((unit) => unit.rarity === "SSR" && unit.legend !== true);
  const rand = rateRand(rateSeed(`rate-up:${week}`));
  const order = [...heroes];
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order.slice(0, 3).filter((unit) => unit.legend !== true).map((unit) => ({
    id: `${week}:${unit.id}`,
    week,
    name: "Rate-up",
    featured: unit.id,
    line: unit.title,
  }));
}

export const STAGES = [
  {
    id: "warmup",
    name: "Road Wisp",
    chapter: "01",
    blurb: "A wind spirit on the road.",
    firstReward: 350,
    repeatReward: 140,
    gift: "fanmail",
    enemies: [
      {
        id: "wisp",
        name: "Road Wisp",
        element: "gale",
        maxHp: 110,
        atk: 12,
        guard: 8,
        pattern: ["attack", "attack", "defend"],
      },
    ],
  },
  {
    id: "comments",
    name: "Two at the Gate",
    chapter: "02",
    blurb: "A hexer and a braggart at the gate.",
    firstReward: 420,
    repeatReward: 160,
    gift: "fanmail",
    enemies: [
      {
        id: "heckler",
        name: "Hexer",
        element: "gale",
        maxHp: 96,
        atk: 12,
        guard: 8,
        pattern: ["attack", "hex", "attack"],
      },
      {
        id: "reply",
        name: "Braggart",
        element: "flare",
        maxHp: 108,
        atk: 13,
        guard: 6,
        pattern: ["attack", "defend", "attack"],
      },
    ],
  },
  {
    id: "pyro",
    name: "The Kiln",
    chapter: "03",
    blurb: "Something in the kiln woke up.",
    firstReward: 560,
    repeatReward: 190,
    gift: "bouquet",
    enemies: [
      {
        id: "rig",
        name: "Kiln Sprite",
        element: "flare",
        maxHp: 210,
        atk: 18,
        guard: 14,
        pattern: ["attack", "defend", "attack", "hex"],
      },
    ],
  },
  {
    id: "deadair",
    name: "Quiet Stretch",
    chapter: "04",
    blurb: "Quiet, a curse, and a shielded soldier.",
    firstReward: 700,
    repeatReward: 220,
    gift: "bouquet",
    enemies: [
      {
        id: "host",
        name: "Mute Shade",
        element: "veil",
        maxHp: 160,
        atk: 16,
        guard: 10,
        pattern: ["hex", "attack", "attack"],
      },
      {
        id: "grip",
        name: "Shieldman",
        element: "stone",
        maxHp: 170,
        atk: 14,
        guard: 16,
        pattern: ["defend", "attack", "attack"],
      },
    ],
  },
  {
    id: "signoff",
    name: "The Empty Seat",
    chapter: "05",
    blurb: "A shade in a chair that should be empty.",
    firstReward: 980,
    repeatReward: 280,
    gift: "bouquet",
    enemies: [
      {
        id: "chair",
        name: "The Empty Seat",
        element: "veil",
        maxHp: 480,
        atk: 26,
        guard: 14,
        pattern: ["attack", "attack", "hex", "defend"],
      },
    ],
  },
  {
    id: "ford",
    name: "Low Ford",
    chapter: "06",
    blurb: "The ford is up, and the water grabs.",
    firstReward: 1100,
    repeatReward: 300,
    gift: "fanmail",
    enemies: [
      { id: "tide", name: "Ford Spirit", element: "tide", maxHp: 150, atk: 16, guard: 10, pattern: ["attack", "defend", "attack"] },
      { id: "gale", name: "Crosswind", element: "gale", maxHp: 100, atk: 14, guard: 6, pattern: ["attack", "hex", "attack"] },
    ],
  },
  {
    id: "quarry",
    name: "The Quarry",
    chapter: "07",
    blurb: "A brute waiting behind stone.",
    firstReward: 1200,
    repeatReward: 320,
    gift: "bouquet",
    enemies: [
      { id: "stone", name: "Quarry Brute", element: "stone", maxHp: 280, atk: 20, guard: 18, pattern: ["defend", "attack", "attack"] },
    ],
  },
  {
    id: "cinder",
    name: "Cinder Path",
    chapter: "08",
    blurb: "A smaller fire, still burning.",
    firstReward: 1280,
    repeatReward: 340,
    gift: "bouquet",
    enemies: [
      { id: "flare", name: "Cinder Wisp", element: "flare", maxHp: 200, atk: 22, guard: 8, pattern: ["attack", "attack", "hex"] },
    ],
  },
  {
    id: "watch",
    name: "Night Watch",
    chapter: "09",
    blurb: "A shade calls the hour. A soldier answers.",
    firstReward: 1360,
    repeatReward: 360,
    gift: "bouquet",
    enemies: [
      { id: "veil", name: "Watch Shade", element: "veil", maxHp: 160, atk: 18, guard: 8, pattern: ["hex", "attack", "hex"] },
      { id: "grip", name: "Watchman", element: "stone", maxHp: 200, atk: 16, guard: 16, pattern: ["defend", "attack", "attack"] },
    ],
  },
  {
    id: "span",
    name: "Broken Span",
    chapter: "10",
    blurb: "The keeper stayed after the bridge fell.",
    firstReward: 1460,
    repeatReward: 380,
    gift: "bouquet",
    enemies: [
      { id: "chair", name: "Span Warden", element: "veil", maxHp: 440, atk: 24, guard: 16, pattern: ["attack", "defend", "hex", "attack"] },
    ],
  },
  {
    id: "kiln2",
    name: "Second Kiln",
    chapter: "11",
    blurb: "Two fires. Neither is for cooking.",
    firstReward: 1540,
    repeatReward: 400,
    gift: "bouquet",
    enemies: [
      { id: "rig", name: "Kiln Hand", element: "flare", maxHp: 170, atk: 18, guard: 10, pattern: ["attack", "attack", "defend"] },
      { id: "flare", name: "Spark", element: "flare", maxHp: 130, atk: 16, guard: 6, pattern: ["attack", "hex", "attack"] },
    ],
  },
  {
    id: "lantern",
    name: "Last Lantern",
    chapter: "12",
    blurb: "The road ends at a lamp that should be dark.",
    firstReward: 1700,
    repeatReward: 440,
    gift: "bouquet",
    enemies: [
      { id: "chair", name: "The Last Lamp", element: "veil", maxHp: 680, atk: 30, guard: 18, pattern: ["attack", "hex", "attack", "defend"] },
    ],
  },
  {
    id: "boar",
    name: "Boar Track",
    chapter: "13",
    blurb: "Something heavy is tearing up the path.",
    firstReward: 1800,
    repeatReward: 460,
    gift: "bouquet",
    enemies: [
      { id: "boar", name: "Road Boar", element: "stone", maxHp: 520, atk: 26, guard: 14, pattern: ["attack", "attack", "defend"] },
    ],
  },
  {
    id: "lamps",
    name: "Lamp Mile",
    chapter: "14",
    blurb: "Every mile marker is lit, and occupied.",
    firstReward: 1960,
    repeatReward: 500,
    gift: "bouquet",
    enemies: [
      { id: "lamp", name: "Lamp Wisp", element: "flare", maxHp: 240, atk: 22, guard: 8, pattern: ["attack", "hex", "attack"] },
      { id: "mire", name: "Mire Shade", element: "veil", maxHp: 280, atk: 20, guard: 10, pattern: ["hex", "attack", "defend"] },
    ],
  },
];

export const STAGE_SCENES = {
  warmup: "stage-warmup",
  comments: "stage-comments",
  pyro: "stage-pyro",
  deadair: "stage-deadair",
  signoff: "stage-signoff",
  ford: "stage-ford",
  quarry: "stage-quarry",
  cinder: "stage-cinder",
  watch: "stage-watch",
  span: "stage-span",
  kiln2: "stage-kiln2",
  lantern: "stage-lantern",
  boar: "stage-boar",
  lamps: "stage-lamps",
};

export const MOODS = [
  { element: "flare", label: "Kiln watch", detail: "Keep the fire in the kiln." },
  { element: "tide", label: "Ford crossing", detail: "Get people across before the water rises." },
  { element: "gale", label: "Message run", detail: "Carry word down the road before the wind turns." },
  { element: "stone", label: "Gate watch", detail: "Hold the door until the next shift." },
  { element: "veil", label: "Night search", detail: "Find what went missing after dark." },
];

export function character(id) {
  return CHARACTERS.find((c) => c.id === id);
}

export function bannerById(id, now = new Date()) {
  const banners = weeklyBanners(now);
  return banners.find((banner) => banner.id === id || banner.featured === id) ?? banners[0];
}

export function stageById(id) {
  return STAGES.find((s) => s.id === id);
}

export function pool(rarity) {
  return CHARACTERS.filter((c) => c.rarity === rarity);
}

export function advantage(from, against) {
  if (!from || !against) return 0;
  if (ELEMENTS[from]?.beats === against) return 1;
  if (ELEMENTS[against]?.beats === from) return -1;
  return 0;
}

export function weaknessOf(element) {
  return Object.keys(ELEMENTS).find((key) => ELEMENTS[key].beats === element) || null;
}

export const PARTY_BUFFS = {
  crit: 0.2,
  critDmg: 0.5,
  res: 0.15,
  def: 0.3,
  shred: 0.1,
};

function turnPhrase(n) {
  return `for ${n} turn${n === 1 ? "" : "s"}`;
}

function joinAnd(parts) {
  if (parts.length <= 1) return parts[0] || "";
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

const FINITE = {
  decreasing: "decreases",
  increasing: "increases",
  inflicting: "inflicts",
  stunning: "stuns",
  putting: "puts",
  branding: "brands",
  attacking: "attacks",
  granting: "grants",
  healing: "heals",
  drawing: "draws",
  recovering: "recovers",
  calling: "calls",
  gaining: "gains",
  consuming: "consumes",
};

function sentenceLead(phrase) {
  const space = phrase.indexOf(" ");
  const word = space === -1 ? phrase : phrase.slice(0, space);
  const rest = space === -1 ? "" : phrase.slice(space);
  const finite = FINITE[word] || word;
  const line = finite + rest;
  return line.charAt(0).toUpperCase() + line.slice(1);
}

export function describeCard(card) {
  const many = Boolean(card.aoe);
  const enemy = many ? "all enemies" : "the enemy";
  const their = many ? "their" : "the enemy's";
  const onHit = [];
  if (card.weaken) onHit.push(`decreasing ${their} damage dealt to 70% for 2 turns`);
  if (card.vuln) onHit.push(`increasing damage they take by 30% for 2 turns`);
  if (card.poison) onHit.push(`inflicting ${card.poison} poison`);
  if (card.stun) onHit.push(`stunning ${enemy} for ${card.stun > 1 ? card.stun : 1} turn${card.stun > 1 ? "s" : ""}`);
  if (card.sleep) onHit.push(`putting ${enemy} to sleep until attacked`);
  if (card.brand) onHit.push(`branding ${enemy} for 2 turns`);
  if (card.shred) onHit.push(`decreasing ${their} Effect Resistance by ${Math.round(PARTY_BUFFS.shred * 100)}% for 2 turns`);
  if (card.follow) {
    const pct = card.follow === true ? 50 : Math.round(Number(card.follow) * 100);
    onHit.push(`attacking again for ${pct}% of the caster's Attack when the enemy is branded`);
  }

  const after = [];
  if (card.shield) after.push(`granting all allies a barrier equal to ${card.shield}% of the caster's Defense`);
  if (card.heal) after.push(`healing all allies for ${card.heal}% of max Health`);
  if (typeof card.stress === "number") {
    after.push(
      card.stress < 0
        ? `decreasing Stress of all allies by ${-card.stress}`
        : `increasing Stress of all allies by ${card.stress}`,
    );
  }
  if (card.might) after.push(`increasing damage dealt by all allies by 30% ${turnPhrase(card.might)}`);
  if (card.crit) after.push(`increasing Critical Hit Chance of all allies by ${Math.round(PARTY_BUFFS.crit * 100)}% ${turnPhrase(card.crit)}`);
  if (card.critDmg) after.push(`increasing Critical Hit Damage of all allies by ${Math.round(PARTY_BUFFS.critDmg * 100)}% ${turnPhrase(card.critDmg)}`);
  if (card.defUp) after.push(`increasing Defense of all allies by ${Math.round(PARTY_BUFFS.def * 100)}% ${turnPhrase(card.defUp)}`);
  if (card.res) after.push(`increasing Effect Resistance of all allies by ${Math.round(PARTY_BUFFS.res * 100)}% ${turnPhrase(card.res)}`);
  if (card.draw) after.push(`drawing ${card.draw} ${card.draw === 1 ? "card" : "cards"}`);
  if (card.again) after.push("recovering 1 AP");
  if (card.charge) after.push(`increasing the ult gauge of all allies by ${card.charge}`);
  if (card.assist) after.push("calling one ally to attack the same enemy for 50% of their Attack");
  if (card.kindle) {
    const n = card.kindle === true ? 1 : card.kindle;
    after.push(`gaining ${n} Ember${n === 1 ? "" : "s"} for the party`);
  }
  if (card.fan) after.push("consuming the party's Embers, each dealing damage equal to 20% of the caster's Attack");

  const sentences = [];
  if (card.ratio) {
    const pct = Math.round(card.ratio * 100);
    let line = card.hits > 1
      ? `Attacks ${enemy} ${card.hits} times, dealing damage equal to ${pct}% of the caster's Attack with each attack`
      : `Attacks ${enemy}, dealing damage equal to ${pct}% of the caster's Attack`;
    if (onHit.length) line += `, ${joinAnd(onHit)}`;
    if (after.length) line += `, before ${joinAnd(after)}`;
    sentences.push(line);
  } else {
    const lead = [...onHit, ...after];
    if (lead.length) {
      const [first, ...rest] = lead;
      let line = sentenceLead(first);
      if (rest.length) line += `, before ${joinAnd(rest)}`;
      sentences.push(line);
    }
  }
  if (card.poison) {
    const tick = card.poison * 4;
    sentences.push(`At the start of the turn, poison deals ${tick} damage and decreases by 1 stack`);
  }
  if (card.kind !== "ego" && card.once) sentences.push("Can only be used once per battle");
  return `${sentences.join(". ")}.`;
}

export function freshSave() {
  return {
    applause: 11200,
    pity: 0,
    ten: 0,
    guarantee: false,
    banner: weeklyBanners()[0].id,
    roster: {
      willa: { copies: 1, rooms: 0, bond: 0, level: 1, xp: 0, skills: {} },
      nessa: { copies: 1, rooms: 0, bond: 0, level: 1, xp: 0, skills: {} },
      marek: { copies: 1, rooms: 0, bond: 0, level: 1, xp: 0, skills: {} },
    },
    party: ["willa", "nessa", "marek"],
    gifts: { fanmail: 6, bouquet: 2, keepsake: 1 },
    clears: {},
    towerWeek: null,
    towerFloor: 0,
    towerClears: {},
    weekNote: null,
    screen: "home",
    daily: null,
    streak: 0,
    pulls: 0,
    insight: 6,
    shards: 0,
    autoStart: false,
    fastPlay: false,
    dailyRun: null,
    trial: null,
    history: [],
    reveal: null,
    sound: true,
    sawTip: false,
    errand: null,
  };
}
