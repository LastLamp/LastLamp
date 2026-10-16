import { kitForFoe } from "./foes.js";
import { FOE_BOOK } from "./foeBook.js";
import { makeDealer } from "./foeSpread.js";

export const TOWER_FLOORS = 150;

const ADJECTIVES = ["Ashen", "Gilded", "Hollow", "Storm", "Quiet", "Cinder", "Pale", "Iron", "Moon", "Wild"];
const NOUNS = ["Gate", "Crypt", "Bridge", "Vault", "Garden", "Spire", "Ford", "Shrine", "Court", "Reach"];
const BOSSES = [
  "The Wyrm Gate",
  "Choir of Ash",
  "Drowned Saint",
  "Iron Regent",
  "Glass Hydra",
  "The Pale Court",
  "Starving Oracle",
  "Thorn Cathedral",
  "King of Cinders",
  "The Hollow Crown",
  "Moonwell Beast",
  "Last Astronomer",
  "Serpent Archive",
  "Dawn's Usurper",
  "The Quiet Star",
];

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

export function weekId(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function monthId(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function resetIn(d = new Date()) {
  const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  const hours = Math.max(1, Math.round((next - d) / 36e5));
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${Math.round(hours / 24)} days`;
}

function towerStars(n) {
  if (n <= 30) return 1;
  if (n <= 60) return 2;
  if (n <= 90) return 3;
  if (n <= 120) return 4;
  return 5;
}

function floorName(n, boss) {
  if (boss) return BOSSES[(n / 10 - 1) % BOSSES.length];
  const adj = ADJECTIVES[n % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(n / ADJECTIVES.length) % NOUNS.length];
  if (n > 100) {
    const wing = ["Outer", "Inner", "Far"][Math.floor((n - 101) / 10) % 3];
    return `${wing} ${adj} ${noun}`;
  }
  return `${adj} ${noun}`;
}

function advice(enemies) {
  if (enemies.some((enemy) => enemy.role === "hexer")) {
    return "A hexer raises your stress. Beat them first, or play a calm card before you end the turn.";
  }
  if (enemies.some((enemy) => enemy.role === "boss")) {
    return "A boss hits in runs. Block the heavy turns, then spend your ultimate.";
  }
  if (enemies.some((enemy) => enemy.role === "bulwark")) {
    return "The bulwark is soaking hits. Expose them, or cut down the other one first.";
  }
  if (enemies.length > 1) return "Two foes. Pick a target, then spend your energy before you end the turn.";
  return "One foe. Play cards, then end the turn so they take their swing.";
}

export function buildTower(week) {
  const roll = rng(hash(String(week)));
  const dealers = {
    boss: makeDealer(FOE_BOOK.filter((foe) => foe.role === "boss"), roll),
    striker: makeDealer(FOE_BOOK.filter((foe) => foe.role === "striker"), roll),
    hexer: makeDealer(FOE_BOOK.filter((foe) => foe.role === "hexer"), roll),
    bulwark: makeDealer(FOE_BOOK.filter((foe) => foe.role === "bulwark"), roll),
  };
  const floors = [];
  let lastElement = null;
  for (let n = 1; n <= TOWER_FLOORS; n += 1) {
    const boss = n % 10 === 0;
    const pair = !boss && (n % 5 === 0 || (n > 36 && n % 4 === 0));
    const count = pair ? 2 : 1;
    const enemies = [];
    for (let i = 0; i < count; i += 1) {
      let role = "striker";
      if (boss) role = "boss";
      else if (i === 1 && n % 5 === 0) role = "hexer";
      else if (pair && i === 0 && n > 18) role = "bulwark";
      let hp = Math.round(40 + n * 2.4);
      let atk = Math.round(5 + n * 0.12);
      let guard = Math.round(5 + n * 0.08);
      if (boss) {
        hp = Math.round(hp * 1.48);
        atk = Math.round(atk * 1.08);
      }
      if (count === 2) hp = Math.round(hp * 0.66);
      if (role === "hexer") {
        hp = Math.round(hp * 0.75);
        atk = Math.round(atk * 0.82);
      }
      if (role === "bulwark") {
        hp = Math.round(hp * 1.22);
        atk = Math.round(atk * 0.78);
        guard = Math.round(guard * 1.35);
      }
      const avoidElements = new Set(enemies.map((enemy) => enemy.element));
      if (lastElement) avoidElements.add(lastElement);
      const picked = dealers[role](avoidElements, new Set(enemies.map((enemy) => enemy.art))) || FOE_BOOK[0];
      lastElement = picked.element;
      const element = picked.element;
      const kit = role === "boss" ? kitForFoe(picked.name, element, role) : picked.kit;
      enemies.push({
        id: `f${n}e${i}`,
        name: picked.name,
        element,
        role,
        art: picked.art,
        maxHp: Math.max(24, hp),
        atk: Math.max(4, atk),
        guard,
        pattern: kit.map((move) => move.intent),
        kit,
      });
    }
    floors.push({
      id: `floor-${n}`,
      number: n,
      chapter: String(n).padStart(3, "0"),
      name: floorName(n, boss),
      blurb: advice(enemies),
      boss,
      stars: towerStars(n),
      firstReward: 20 + n,
      repeatReward: 8 + Math.round(n * 0.3),
      gift: boss || n % 5 === 0 ? "bouquet" : n % 2 === 0 ? "fanmail" : null,
      enemies,
    });
  }
  return floors;
}

const cache = new Map();

export function towerFor(week) {
  const key = week || monthId();
  if (!cache.has(key)) cache.set(key, buildTower(key));
  return cache.get(key);
}

export function floorById(week, id) {
  return towerFor(week).find((floor) => floor.id === id) || null;
}

export function floorByNumber(week, number) {
  if (number < 1 || number > TOWER_FLOORS) return null;
  return towerFor(week)[number - 1];
}
