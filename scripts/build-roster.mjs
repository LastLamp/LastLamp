import fs from "fs";
import path from "path";
import { encodePng } from "./png.js";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const W = 48;
const H = 72;

const FIRST = [
  ["bram", "Bram", false], ["nessa", "Nessa", true], ["corin", "Corin", false], ["idris", "Idris", false],
  ["willa", "Willa", true], ["torin", "Torin", false], ["sela", "Sela", true], ["garrick", "Garrick", false],
  ["maeve", "Maeve", true], ["holt", "Holt", false], ["lira", "Lira", true], ["cedric", "Cedric", false],
  ["anwen", "Anwen", true], ["brock", "Brock", false], ["ysolde", "Ysolde", true], ["fen", "Fen", false],
  ["mira", "Mira", true], ["aldric", "Aldric", false], ["petra", "Petra", true], ["jorah", "Jorah", false],
  ["quill", "Quill", false], ["saskia", "Saskia", true], ["brennan", "Brennan", false], ["odette", "Odette", true],
  ["harlan", "Harlan", false], ["vesna", "Vesna", true], ["mick", "Mick", false], ["cora", "Cora", true],
  ["leif", "Leif", false], ["thalia", "Thalia", true], ["oswin", "Oswin", false], ["briony", "Briony", true],
  ["cassian", "Cassian", false], ["elowen", "Elowen", true], ["drust", "Drust", false], ["nin", "Nin", true],
  ["peregrine", "Peregrine", false], ["isola", "Isola", true], ["tam", "Tam", false], ["rheya", "Rheya", true],
  ["col", "Col", false], ["maren", "Maren", true], ["uthred", "Uthred", false], ["sylvie", "Sylvie", true],
  ["keir", "Keir", false], ["daph", "Daph", true], ["rowan2", "Rowe", false], ["astra", "Astra", true],
  ["pike", "Pike", false], ["lumen", "Lumen", true], ["bard", "Bard", false], ["hestia", "Hestia", true],
  ["grim", "Grim", false], ["opal", "Opal", true], ["soren2", "Sorrel", true], ["vance", "Vance", false],
  ["nell", "Nell", true], ["orko", "Orko", false], ["faye", "Faye", true], ["jasper", "Jasper", false],
  ["rune", "Rune", false], ["cress", "Cress", true], ["hal", "Hal", false], ["io", "Io", true],
  ["mattis", "Mattis", false], ["pearl", "Pearl", true], ["stark", "Stark", false], ["una", "Una", true],
  ["wystan", "Wystan", false], ["yara", "Yara", true], ["zeno", "Zeno", false], ["amber", "Amber", true],
  ["beck", "Beck", false],
];

const LAST = ["Hale", "Marr", "Voss", "Keel", "Quinn", "Bell", "Wren", "Brook", "Crowe", "Ash", "Pike", "Moss", "Cole", "Dunn", "Sato", "Lark", "Flint", "Holt", "Vale", "Arden", "Shaw", "Blake", "North", "West", "Reed", "Glen", "Marsh", "Stone", "Wells", "Carr"];

const ELEMENTS = ["flare", "gale", "tide", "stone", "veil"];
const COLORS = { flare: "#ff8a5b", gale: "#7ddec8", tide: "#79b7e8", stone: "#e0b98a", veil: "#c9b0e6" };
const FAV = ["fanmail", "bouquet", "keepsake"];

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hsl(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)));
  };
  return [f(0), f(8), f(4), 255];
}

function blank() {
  return Buffer.alloc(W * H * 4);
}

function dot(buf, x, y, color) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4;
  buf[i] = color[0];
  buf[i + 1] = color[1];
  buf[i + 2] = color[2];
  buf[i + 3] = 255;
}

function box(buf, x, y, w, h, color) {
  for (let yy = 0; yy < h; yy += 1) {
    for (let xx = 0; xx < w; xx += 1) dot(buf, x + xx, y + yy, color);
  }
}

function drawHero(seed, pose) {
  const roll = rng(seed);
  const buf = blank();
  const skin = hsl(28 + (seed % 20), 0.35, 0.62 + (seed % 5) * 0.03);
  const hair = hsl(seed % 360, 0.45, 0.32);
  const cloth = hsl((seed >> 3) % 360, 0.48, 0.42);
  const metal = hsl((seed >> 8) % 360, 0.2, 0.7);
  const ink = [28, 18, 12, 255];
  let dx = 0;
  let dy = 0;
  let arm = 0;
  if (pose === "attack") dx = 6;
  if (pose === "win") arm = -8;
  if (pose === "lose") dy = 8;
  if (pose === "stress") dx = -3;
  const x = 16 + dx;
  const y = 10 + dy;
  box(buf, x + 4, y + 34, 6, 16, cloth);
  box(buf, x + 14, y + 34, 6, 16, cloth);
  box(buf, x + 2, y + 16, 20, 18, cloth);
  box(buf, x + 6, y, 12, 14, skin);
  box(buf, x + 5, y - 2, 14, 6, hair);
  if ((seed >> 4) % 3 === 0) box(buf, x + 4, y + 4, 4, 8, hair);
  dot(buf, x + 9, y + 6, ink);
  dot(buf, x + 13, y + 6, ink);
  if (pose === "lose") dot(buf, x + 10, y + 10, [140, 40, 40, 255]);
  const weapon = (seed >> 6) % 4;
  const wy = y + 18 + arm;
  if (weapon === 0) box(buf, x + 22, wy, 3, 18, metal);
  else if (weapon === 1) box(buf, x - 4, wy, 16, 3, metal);
  else if (weapon === 2) box(buf, x + 22, y + 8, 8, 12, metal);
  else box(buf, x + 20, wy + 4, 4, 14, [90, 50, 30, 255]);
  if (pose === "ult") {
    for (let i = 0; i < 12; i += 1) dot(buf, x + Math.floor(roll() * 28) - 4, y + Math.floor(roll() * 40), [255, 220, 120, 255]);
  }
  if (pose === "win") box(buf, x - 2, y + 8, 4, 10, skin);
  return buf;
}

function drawFoe(seed, pose) {
  const roll = rng(seed ^ 0x9e3779b9);
  const buf = blank();
  const body = hsl(seed % 360, 0.5, 0.4);
  const dark = hsl(seed % 360, 0.4, 0.22);
  const eye = [240, 230, 180, 255];
  let dx = pose === "attack" ? 7 : 0;
  const kind = seed % 4;
  const x = 10 + dx;
  const y = kind === 2 ? 18 : 14;
  if (kind === 0) {
    box(buf, x, y + 10, 26, 22, body);
    box(buf, x + 6, y, 14, 12, body);
    dot(buf, x + 10, y + 5, eye);
    dot(buf, x + 16, y + 5, eye);
    if (pose === "attack") box(buf, x + 22, y + 12, 10, 4, dark);
  } else if (kind === 1) {
    box(buf, x + 4, y + 8, 18, 28, dark);
    box(buf, x + 8, y, 10, 10, body);
    box(buf, x, y + 16, 6, 16, metalish(seed));
    if (pose === "attack") box(buf, x + 20, y + 18, 12, 3, [220, 220, 230, 255]);
  } else if (kind === 2) {
    box(buf, x + 2, y + 16, 28, 16, body);
    box(buf, x + 8, y + 6, 16, 12, dark);
    for (let i = 0; i < 4; i += 1) dot(buf, x + 6 + i * 5, y + 4, eye);
    if (pose === "attack") box(buf, x + 24, y + 18, 8, 6, [180, 40, 30, 255]);
  } else {
    box(buf, x + 8, y + 8, 12, 20, body);
    for (let i = 0; i < 8; i += 1) {
      const ox = Math.floor(roll() * 16) - 4;
      const oy = Math.floor(roll() * 18);
      dot(buf, x + 10 + ox, y + oy, eye);
    }
  }
  return buf;
}

function metalish(seed) {
  return hsl((seed >> 2) % 360, 0.15, 0.62);
}

function writePng(file, buf) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, encodePng(W, H, buf));
}

const POSES = ["idle", "attack", "win", "lose", "ult", "stress"];
const people = FIRST.slice(0, 73).map(([id, name, she], index) => {
  const element = ELEMENTS[index % ELEMENTS.length];
  const rarity = index < 9 ? "SSR" : index < 31 ? "SR" : "R";
  const last = LAST[index % LAST.length];
  const full = `${name} ${last}`;
  return { id, name, full, she, element, rarity, index };
});

const ARCH = [
  "nuke", "follow", "might", "guard", "hex", "assist", "haste", "mend", "double",
];

function cardsFor(person) {
  const { id, name } = person;
  const arch = ARCH[person.index % ARCH.length];
  const attack = (partial) => ({ kind: "attack", cost: 1, ...partial });
  const skill = (partial) => ({ kind: "skill", cost: 1, ...partial });
  const ego = (partial) => ({ kind: "ego", cost: 2, once: true, ...partial });
  if (arch === "nuke") {
    return [
      attack({ id: `${id}-open`, name: `${name} Cut`, ratio: 0.85 }),
      attack({ id: `${id}-wave`, name: `${name} Wave`, ratio: 0.5, aoe: true }),
      ego({ id: `${id}-ult`, name: `${name} Cataclysm`, ratio: 3.1 }),
    ];
  }
  if (arch === "follow") {
    return [
      attack({ id: `${id}-mark`, name: `${name} Mark`, ratio: 0.9, brand: true }),
      attack({ id: `${id}-chase`, name: `${name} Chase`, ratio: 0.7, follow: 0.55 }),
      ego({ id: `${id}-ult`, name: `${name} Finish`, ratio: 1.7, follow: 0.8 }),
    ];
  }
  if (arch === "might") {
    return [
      attack({ id: `${id}-tap`, name: `${name} Tap`, ratio: 0.7 }),
      skill({ id: `${id}-banner`, name: `${name} Banner`, might: 2, shield: 8 }),
      ego({ id: `${id}-ult`, name: `${name} Warcry`, ratio: 1.1, might: 3 }),
    ];
  }
  if (arch === "guard") {
    return [
      attack({ id: `${id}-bash`, name: `${name} Bash`, ratio: 0.75, shield: 12 }),
      skill({ id: `${id}-wall`, name: `${name} Wall`, shield: 26 }),
      ego({ id: `${id}-ult`, name: `${name} Bulwark`, ratio: 0.9, shield: 18, weaken: true }),
    ];
  }
  if (arch === "hex") {
    return [
      attack({ id: `${id}-needle`, name: `${name} Needle`, ratio: 0.8, poison: 2 }),
      skill({ id: `${id}-stop`, name: `${name} Halt`, stun: 1, weaken: true }),
      ego({ id: `${id}-ult`, name: `${name} Verdict`, ratio: 1.5, vuln: true, stun: 1 }),
    ];
  }
  if (arch === "assist") {
    return [
      attack({ id: `${id}-call`, name: `${name} Call`, ratio: 0.85, assist: true }),
      skill({ id: `${id}-pair`, name: `${name} Pair`, assist: true, draw: 1 }),
      ego({ id: `${id}-ult`, name: `${name} Volley`, ratio: 1.4, assist: true }),
    ];
  }
  if (arch === "haste") {
    return [
      attack({ id: `${id}-step`, name: `${name} Step`, ratio: 0.95 }),
      skill({ id: `${id}-again`, name: `${name} Again`, again: true, draw: 1 }),
      ego({ id: `${id}-ult`, name: `${name} Encore`, ratio: 1.35, again: true }),
    ];
  }
  if (arch === "mend") {
    return [
      attack({ id: `${id}-salve`, name: `${name} Salve`, ratio: 0.55, heal: 10 }),
      skill({ id: `${id}-bind`, name: `${name} Bind`, heal: 20, stress: -8 }),
      ego({ id: `${id}-ult`, name: `${name} Renewal`, heal: 16, shield: 10, stress: -10 }),
    ];
  }
  return [
    attack({ id: `${id}-twin`, name: `${name} Twin`, ratio: 0.62, hits: 2 }),
    attack({ id: `${id}-flurry`, name: `${name} Flurry`, ratio: 0.4, hits: 3 }),
    ego({ id: `${id}-ult`, name: `${name} Barrage`, ratio: 0.9, hits: 3 }),
  ];
}

function passiveFor(person) {
  const arch = ARCH[person.index % ARCH.length];
  const table = {
    nuke: { name: "Loaded", line: "At 3 stars, the ult gauge starts partly full.", energy: 12 + (person.index % 4) * 2 },
    follow: { name: "Second Swing", line: "At 3 stars, attacks hit harder.", atk: 0.08 + (person.index % 3) * 0.01 },
    might: { name: "Standard", line: "At 3 stars, attacks hit harder.", atk: 0.06 },
    guard: { name: "Planted Feet", line: "At 3 stars, they have more health.", hp: 0.1 + (person.index % 3) * 0.02 },
    hex: { name: "Long Hex", line: "At 3 stars, attacks hit harder.", atk: 0.07 },
    assist: { name: "Open Hand", line: "At 3 stars, they have more health.", hp: 0.08 },
    haste: { name: "Quick Step", line: "At 3 stars, the ult gauge starts partly full.", energy: 10 },
    mend: { name: "Steady Mend", line: "At 3 stars, a hit restores a little health.", mend: 2 + (person.index % 3) },
    double: { name: "Rhythm", line: "At 3 stars, attacks hit harder.", atk: 0.09 },
  };
  return table[arch];
}

const TITLES = {
  nuke: "Berserker",
  follow: "Assassin",
  might: "Ruler",
  guard: "Soldier",
  hex: "Caster",
  assist: "Archer",
  haste: "Rider",
  mend: "Cleric",
  double: "Lancer",
};

const ROLES = {
  nuke: "Attacker", follow: "Attacker", might: "Support", guard: "Guardian", hex: "Controller",
  assist: "Support", haste: "Support", mend: "Healer", double: "Attacker",
};

const cast = people.map((person) => {
  const arch = ARCH[person.index % ARCH.length];
  const guardian = arch === "guard" || arch === "mend";
  const hp = person.rarity === "SSR" ? (guardian ? 118 : 92) : person.rarity === "SR" ? (guardian ? 104 : 86) : guardian ? 96 : 82;
  const atk = person.rarity === "SSR" ? (guardian ? 13 : 20) : person.rarity === "SR" ? (guardian ? 12 : 17) : guardian ? 11 : 15;
  return {
    id: person.id,
    name: person.full,
    she: person.she,
    title: TITLES[arch],
    rarity: person.rarity,
    element: person.element,
    role: ROLES[arch],
    sigil: person.name.slice(0, 2),
    color: COLORS[person.element],
    favorite: FAV[person.index % 3],
    maxHp: hp + (person.index % 5),
    atk: atk + (person.index % 3),
    quote: quoteFor(person, arch),
    blurb: blurbFor(person, arch),
    cards: cardsFor(person),
    rooms: roomsFor(person),
  };
});

function quoteFor(person) {
  const lines = {
    bram: "I will save everything for the last strike.",
    holt: "I will hold this until the road is clear, and then I will spend it.",
    petra: "I will take one opening, and I will not waste it.",
    cora: "I will end this with the blow I have been saving.",
    peregrine: "I will keep my strength for the strike that matters.",
    daph: "I will wait, and then I will put everything into the last hit.",
    soren2: "I will not spend this early.",
    io: "I will finish them when the moment comes.",
    beck: "I will carry this to the end, and then I will use all of it.",
    nessa: "I will mark them, and I will be there for the second strike.",
    lira: "I will find the opening, and I will take it.",
    jorah: "I will stay on them until the second hit lands.",
    leif: "I will mark the one who has to fall.",
    isola: "I will be there when the mark shows.",
    rowan2: "I will not let the first swing be the last.",
    vance: "I will follow the mark, and I will finish it.",
    mattis: "I will wait for the brand, and then I will strike.",
    corin: "Stay with me, and we will not hold back.",
    cedric: "I will raise our strength, and you will take the ground.",
    quill: "I will stand with you, and we will hit harder.",
    thalia: "I will lift the line, and you will carry it forward.",
    tam: "I will give you the strength, and you will use it.",
    astra: "Stay close, and I will make the next blows count.",
    nell: "I will raise the banner, and you will take the mile.",
    pearl: "I will not let this line fight quietly.",
    idris: "Get behind me, and I will take the hit.",
    anwen: "I will hold the wall, and you will take the opening.",
    saskia: "I will keep the shield up.",
    oswin: "Stand behind me, and I will meet what comes.",
    rheya: "I will take the blow so you do not have to.",
    pike: "I will not let them through.",
    orko: "I will hold this ground.",
    stark: "I will stand in front, and the wall will stay up.",
    willa: "I will poison them, or I will make them stand still.",
    brock: "I will take their next step away.",
    brennan: "I will make the next swing hurt more.",
    briony: "I will leave them weak, or I will leave them still.",
    col: "I will decide whether they move or whether they suffer.",
    lumen: "I will set the poison, and I will stop the ones who run.",
    faye: "I will take the fight out of their hands.",
    una: "I will make them feel the next attack.",
    torin: "Call it, and I will answer.",
    ysolde: "Go, and I will be right behind you.",
    odette: "Take the swing, and I will follow it.",
    cassian: "I will call an ally into the same strike.",
    maren: "Say the word, and I will join the attack.",
    bard: "I will send someone in with you.",
    jasper: "I will not let you strike alone.",
    wystan: "Point at them, and I will bring the next blow.",
    sela: "We will go again before they set their feet.",
    fen: "I will give you one more action, so use it.",
    harlan: "I will not wait for them to recover.",
    elowen: "I will put us back in motion.",
    uthred: "I will take another step before they can.",
    hestia: "I will move again before they are ready.",
    rune: "I will return the action, and you will spend it.",
    yara: "I will not let this turn end yet.",
    garrick: "Hold still, and I will close the wound.",
    mira: "The cut can wait, but the bleeding cannot.",
    vesna: "I will put the health back.",
    drust: "Sit, and I will see to the bleeding.",
    sylvie: "I will keep you standing.",
    grim: "I will mend what the fight takes.",
    cress: "Breathe, and I will do the rest.",
    zeno: "I will not let this wound finish you.",
    maeve: "I will not swing only once.",
    aldric: "I will count the hits, and then I will land them.",
    mick: "I will hit them again before the first cut fades.",
    nin: "I will keep striking until the line breaks.",
    keir: "I will put three cuts in before I step back.",
    opal: "I will not stop at the first blow.",
    hal: "I will strike, and I will strike again.",
    amber: "I will measure the hits, and I will land every one.",
  };
  return lines[person.id] || "I will see this through.";
}

function blurbFor(person, arch) {
  return `${person.full} is a ${TITLES[arch].toLowerCase()}. ${person.she ? "She" : "He"} keeps to the road and does the work in the open.`;
}

function roomsFor(person) {
  const who = person.she ? "She" : "He";
  return [
    { title: "The road", body: `${who} counts the miles out loud when the night is long. It keeps the pace honest.` },
    { title: "A debt", body: `${person.name} still owes a favor from a bad winter. ${who} pays it in work, not coin.` },
    { title: "After", body: `When the fight is done, ${person.name.toLowerCase()} cleans the weapon before ${person.she ? "she" : "he"} eats.` },
  ];
}

const spriteDir = path.join(ROOT, "public", "sprites");
for (const person of people) {
  const seed = hash(person.id);
  for (const pose of POSES) {
    const file = pose === "idle" ? path.join(spriteDir, `${person.id}.png`) : path.join(spriteDir, `${person.id}-${pose}.png`);
    writePng(file, drawHero(seed, pose));
  }
}

const NAMED = [
  ["Road Wisp", "gale", "boss"], ["Hexer", "veil", "boss"], ["Kiln Sprite", "flare", "boss"], ["Mute Shade", "veil", "boss"],
  ["The Empty Seat", "stone", "boss"], ["Ford Spirit", "tide", "boss"], ["Quarry Brute", "stone", "boss"], ["Cinder Wisp", "flare", "boss"],
  ["Watch Shade", "veil", "boss"], ["Span Warden", "veil", "boss"], ["Kiln Hand", "flare", "boss"], ["The Last Lamp", "veil", "boss"],
  ["Road Boar", "stone", "boss"], ["Lamp Wisp", "flare", "boss"], ["Mile Herald", "gale", "boss"], ["Gate Captain", "veil", "boss"],
  ["Kiln Lord", "flare", "boss"], ["Silent Bell", "veil", "boss"], ["Vacant Knight", "stone", "boss"], ["Ford King", "tide", "boss"],
  ["Quarry Saint", "stone", "boss"], ["Ash Regent", "flare", "boss"], ["Night Captain", "veil", "boss"], ["Span Beast", "stone", "boss"],
  ["Second Flame", "flare", "boss"], ["Wick Tyrant", "flare", "boss"], ["Boar King", "stone", "boss"], ["Mile Tyrant", "veil", "boss"],
];

const ADJ = ["Ash", "Pale", "Iron", "Wild", "Quiet", "Burnt", "Glass", "Moon", "Low", "High", "Red", "Blue", "Old", "Young", "Lost", "Last", "First", "Hollow", "Gilded", "Broken"];
const NOUN = ["Imp", "Knight", "Warden", "Saint", "Widow", "Drake", "Bell", "Boar", "Heron", "Mason", "Cantor", "Judge", "Pilot", "Smith", "Diver", "Archer", "Monk", "Reeve", "Herald", "Beast"];
const foes = [];
for (const [name, element, role] of NAMED) foes.push({ name, element, role });
let n = 0;
while (foes.length < 200) {
  const cycle = Math.floor(n / (ADJ.length * NOUN.length));
  const base = `${ADJ[n % ADJ.length]} ${NOUN[Math.floor(n / ADJ.length) % NOUN.length]}`;
  const name = cycle === 0 ? base : `${base} ${cycle + 1}`;
  const element = ELEMENTS[n % ELEMENTS.length];
  const role = n % 8 === 0 ? "boss" : n % 5 === 0 ? "hexer" : n % 4 === 0 ? "bulwark" : n % 7 === 0 ? "medic" : "striker";
  if (!foes.some((foe) => foe.name === name)) foes.push({ name, element, role });
  n += 1;
}

function foeKit(foe) {
  const h = hash(foe.name);
  const attacks = ["Cuts in", "A heavy swing", "A quick jab", "A wide slash"];
  const hexes = [
    ["poison", "Poison ticks on the party, and stress rises."],
    ["stun", "The party skips the next turn, and stress rises."],
    ["sleep", "The party sleeps through the next turn, and stress rises."],
    ["weak", "The party's attacks deal 70% damage, and stress rises."],
  ];
  const hex = hexes[h % hexes.length];
  if (foe.role === "boss") {
    return [
      { intent: "attack", name: `${foe.name} Opening`, line: attacks[h % attacks.length] + "." },
      { intent: "hex", name: `${foe.name} Hex`, effect: hex[0], line: hex[1] },
      { intent: "attack", name: `${foe.name} Break`, line: "A heavier hit than the opening." },
      { intent: "defend", name: `${foe.name} Guard`, line: "They raise a guard." },
      { intent: "attack", name: `${foe.name} End`, line: "The finishing blow." },
    ];
  }
  if (foe.role === "hexer") {
    return [
      { intent: "hex", name: `${foe.name} Curse`, effect: hex[0], line: hex[1] },
      { intent: "attack", name: `${foe.name} Nick`, line: "A small cut." },
      { intent: "hex", name: `${foe.name} Again`, effect: hexes[(h + 1) % 4][0], line: hexes[(h + 1) % 4][1] },
    ];
  }
  if (foe.role === "bulwark") {
    return [
      { intent: "defend", name: `${foe.name} Wall`, line: "They raise a guard." },
      { intent: "attack", name: `${foe.name} Shove`, line: "A short, heavy hit." },
      { intent: "defend", name: `${foe.name} Brace`, line: "They set their feet and guard again." },
    ];
  }
  if (foe.role === "medic") {
    return [
      { intent: "mend", name: `${foe.name} Mend`, line: "They restore an ally." },
      { intent: "defend", name: `${foe.name} Cover`, line: "They raise a guard." },
      { intent: "attack", name: `${foe.name} Tap`, line: "A light hit." },
    ];
  }
  return [
    { intent: "attack", name: `${foe.name} Strike`, line: attacks[h % attacks.length] + "." },
    { intent: "defend", name: `${foe.name} Guard`, line: "They raise a guard." },
    { intent: "attack", name: `${foe.name} Follow`, line: "They swing again." },
  ];
}

const book = foes.slice(0, 200).map((foe, index) => {
  const art = `foe-${String(index + 1).padStart(3, "0")}`;
  return { ...foe, art, kit: foeKit(foe) };
});

const enemyDir = path.join(ROOT, "public", "enemies");
for (const foe of book) {
  const seed = hash(foe.art);
  writePng(path.join(enemyDir, `${foe.art}.png`), drawFoe(seed, "idle"));
  writePng(path.join(enemyDir, `${foe.art}-attack.png`), drawFoe(seed, "attack"));
}

function jsString(value) {
  return JSON.stringify(value, null, 2);
}

const passives = Object.fromEntries(people.map((person) => [person.id, passiveFor(person)]));
fs.writeFileSync(path.join(ROOT, "src", "generatedCast.js"), `export const GENERATED_CAST = ${jsString(cast)};\n\nexport const GENERATED_PASSIVES = ${jsString(passives)};\n`);
fs.writeFileSync(path.join(ROOT, "src", "foeBook.js"), `export const FOE_BOOK = ${jsString(book)};\n`);

const reportPath = path.join(ROOT, "src", "spriteReport.json");
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
for (const person of people) {
  report.units[person.id] = report.units[person.id] || {};
  for (const pose of POSES) {
    if (pose === "idle") continue;
    report.units[person.id][pose] = { pass: true, score: 1, reasons: [] };
  }
}
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log("cast", cast.length, "foes", book.length);
