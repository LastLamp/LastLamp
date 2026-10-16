import { ELEMENTS } from "./data.js";
import { FOE_BOOK } from "./foeBook.js";
import { kitForFoe } from "./foes.js";

export const LEVEL_CAP = 80;
export const ASCEND_CAPS = [20, 40, 60, 80];
export const SKILL_CAP = 5;

const LADDER = [
  {
    tier: 1,
    name: "First Watch",
    blurb: "A small spirit on the morning road.",
    enemyId: "wisp",
    foe: "Road Spark",
    element: "gale",
    maxHp: 90,
    atk: 11,
    guard: 6,
    pattern: ["attack", "defend", "attack"],
    marks: 90,
    xp: 16,
    notes: 1,
    bond: 8,
    gift: "fanmail",
  },
  {
    tier: 2,
    name: "Gate Noise",
    blurb: "Someone at the gate wants a reaction.",
    enemyId: "heckler",
    foe: "Gate Heckler",
    element: "gale",
    maxHp: 150,
    atk: 15,
    guard: 8,
    pattern: ["attack", "hex", "attack"],
    marks: 130,
    xp: 22,
    notes: 1,
    bond: 10,
    gift: null,
  },
  {
    tier: 3,
    name: "Kiln Spark",
    blurb: "The kiln is still throwing sparks.",
    enemyId: "rig",
    foe: "Kiln Spark",
    element: "flare",
    maxHp: 220,
    atk: 18,
    guard: 12,
    pattern: ["attack", "attack", "defend"],
    marks: 170,
    xp: 28,
    notes: 2,
    bond: 12,
    gift: "bouquet",
  },
  {
    tier: 4,
    name: "Stone Post",
    blurb: "A watchman who will not step aside.",
    enemyId: "grip",
    foe: "Stone Watch",
    element: "stone",
    maxHp: 300,
    atk: 20,
    guard: 18,
    pattern: ["defend", "attack", "attack"],
    marks: 220,
    xp: 36,
    notes: 2,
    bond: 14,
    gift: null,
  },
  {
    tier: 5,
    name: "Last Chair",
    blurb: "The last drill. The warden does not rush.",
    enemyId: "chair",
    foe: "Drill Warden",
    element: "veil",
    maxHp: 420,
    atk: 24,
    guard: 16,
    pattern: ["attack", "hex", "defend", "attack"],
    marks: 280,
    xp: 48,
    notes: 3,
    bond: 18,
    gift: "bouquet",
  },
];

export const COMBOS = {
  "dead-air": { brand: true },
  "sign-off": { follow: true },
  spot: { follow: true },
  backbeat: { kindle: 2 },
  "white-heat": { fan: true },
  margin: { fan: true },
  "last-line": { brand: true },
  downbeat: { follow: true },
  closeup: { brand: true },
  "off-script": { follow: true },
  harmony: { fan: true },
  "high-note": { follow: true },
  spark: { kindle: 2 },
  pyro: { kindle: 1 },
  blowout: { fan: true },
  cut: { brand: true },
  directors: { follow: true },
  "first-step": { kindle: 2 },
  "chorus-kid": { fan: true },
  debut: { fan: true },
  background: { follow: true },
  shove: { follow: true },
};

export function xpToNext(level) {
  return 160 + level * 120;
}

export function skillCost(rank) {
  return rank;
}

export function skillRank(owned, cardId) {
  return Math.max(1, Math.min(SKILL_CAP, owned?.skills?.[cardId] || 1));
}

export function levelCap(owned) {
  const step = Math.max(0, Math.min(ASCEND_CAPS.length - 1, owned?.ascend || 0));
  return ASCEND_CAPS[step];
}

export function ascendPrice(step) {
  const rank = Math.max(0, step || 0);
  return { marks: 2500 * (rank + 1), shards: 40 * (rank + 1) };
}

export function addXp(owned, amount) {
  const cap = Math.min(LEVEL_CAP, levelCap(owned));
  let level = Math.max(1, owned?.level || 1);
  let xp = (owned?.xp || 0) + amount;
  while (level < cap && xp >= xpToNext(level)) {
    xp -= xpToNext(level);
    level += 1;
  }
  if (level >= cap) xp = 0;
  return { ...owned, level, xp };
}

export function withGrowth(card, rank) {
  const r = Math.max(1, Math.min(SKILL_CAP, rank || 1));
  const mult = 1 + (r - 1) * 0.1;
  const next = { ...card, rank: r };
  if (next.ratio) next.ratio = Math.round(next.ratio * mult * 100) / 100;
  if (next.shield) next.shield = Math.round(next.shield * mult);
  if (next.heal) next.heal = Math.round(next.heal * mult);
  if (typeof next.stress === "number") next.stress = Math.round(next.stress * mult);
  if (r >= 5 && next.kind === "attack" && next.ratio) next.ratio = Math.round((next.ratio + 0.12) * 100) / 100;
  if (r >= 5 && next.kind === "skill") next.stress = (next.stress || 0) - 4;
  return next;
}

function drillArt(row) {
  const role = row.tier === 5 ? "boss" : "striker";
  const pool = FOE_BOOK.filter((foe) => foe.element === row.element && foe.role === role);
  const list = pool.length ? pool : FOE_BOOK.filter((foe) => foe.element === row.element);
  return list[(row.tier - 1) % list.length].art;
}

export function dailyStages() {
  return LADDER.map((row) => ({
    id: `drill-${row.tier}`,
    chapter: "Drill",
    tier: row.tier,
    stars: row.tier,
    daily: true,
    name: row.name,
    blurb: row.blurb,
    firstReward: row.marks,
    repeatReward: Math.round(row.marks * 0.4),
    repeatXp: Math.round(row.xp * 0.35),
    gift: row.gift,
    xp: row.xp,
    notes: row.notes,
    bond: row.bond,
    enemies: [
      {
        id: row.enemyId,
        name: row.foe,
        element: row.element,
        art: drillArt(row),
        maxHp: row.maxHp,
        atk: row.atk,
        guard: row.guard,
        pattern: kitForFoe(row.foe, row.element, row.tier === 5 ? "boss" : "striker").map((move) => move.intent),
        kit: kitForFoe(row.foe, row.element, row.tier === 5 ? "boss" : "striker"),
      },
    ],
  }));
}

export function dailyStageById(stageId) {
  const stable = /^drill-(\d+)$/.exec(stageId || "");
  if (stable) return dailyStages().find((stage) => stage.tier === Number(stable[1])) || null;
  const older = /^daily-\d{4}-\d{2}-\d{2}-(\d+)$/.exec(stageId || "");
  if (!older) return null;
  return dailyStages().find((stage) => stage.tier === Number(older[1])) || null;
}

export function dailyCleared(save) {
  return save?.dailyRun?.cleared || 0;
}

export function stageXp(stage, replay) {
  if (!stage) return 0;
  let base = stage.xp;
  if (base == null) {
    if (stage.number) base = 12 + Math.round(stage.number * 1.5);
    else if (Number(stage.chapter)) base = 24 + Number(stage.chapter) * 8;
    else base = 0;
  }
  if (!replay) return base;
  if (stage.repeatXp != null) return stage.repeatXp;
  return Math.round(base * 0.35);
}

export function xpSteps(owned, amount) {
  const cap = Math.min(LEVEL_CAP, levelCap(owned));
  const startLevel = Math.max(1, owned?.level || 1);
  const startXp = owned?.xp || 0;
  const startNeed = xpToNext(startLevel);
  const start = { level: startLevel, xp: startXp, need: startNeed, capped: startLevel >= cap };
  if (start.capped || !amount) return { start, end: { ...start, xp: start.capped ? 0 : startXp }, leveled: false };
  let level = startLevel;
  let xp = startXp + amount;
  while (level < cap && xp >= xpToNext(level)) {
    xp -= xpToNext(level);
    level += 1;
  }
  if (level >= cap) xp = 0;
  return {
    start,
    end: { level, xp, need: xpToNext(level), capped: level >= cap },
    leveled: level > startLevel,
  };
}

export function growRoster(roster, party, xpGain) {
  const next = { ...roster };
  const levels = [];
  for (const id of party || []) {
    if (!id || !next[id]) continue;
    const before = next[id].level || 1;
    next[id] = addXp(next[id], xpGain);
    if ((next[id].level || 1) > before) levels.push({ id, level: next[id].level });
  }
  return { roster: next, levels };
}

export function elementLabel(id) {
  return ELEMENTS[id]?.label || id;
}
