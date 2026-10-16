import { STAGES } from "./data.js";
import { kitForFoe, strengthenBoss } from "./foes.js";
import { FOE_BOOK } from "./foeBook.js";
import { makeDealer } from "./foeSpread.js";

const PARTS = {
  warmup: 12,
  comments: 10,
  pyro: 11,
  deadair: 13,
  signoff: 12,
  ford: 14,
  quarry: 11,
  cinder: 15,
  watch: 12,
  span: 10,
  kiln2: 13,
  lantern: 14,
  boar: 12,
  lamps: 15,
};

const MIDPOINT = {
  warmup: ["Mile Herald", "gale"],
  comments: ["Gate Captain", "veil"],
  pyro: ["Kiln Lord", "flare"],
  deadair: ["Silent Bell", "veil"],
  signoff: ["Vacant Knight", "stone"],
  ford: ["Ford King", "tide"],
  quarry: ["Quarry Saint", "stone"],
  cinder: ["Ash Regent", "flare"],
  watch: ["Night Captain", "veil"],
  span: ["Span Beast", "stone"],
  kiln2: ["Second Flame", "flare"],
  lantern: ["Wick Tyrant", "flare"],
  boar: ["Boar King", "stone"],
  lamps: ["Mile Tyrant", "veil"],
};

const BLURBS = [
  "They are already on the path.",
  "A second shape steps out of the first.",
  "Something here knows your element.",
  "The ground is worse than the foe.",
  "They fight as a set.",
  "One of them is only here to hex.",
  "A wall, and the thing behind it.",
  "The loud one is not the dangerous one.",
  "Hold the line. They come in turns.",
  "Almost through this stretch.",
];

let cached = null;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function starsFor(chapterIndex, part, parts) {
  const base = chapterIndex < 3 ? 1 : chapterIndex < 7 ? 2 : chapterIndex < 11 ? 3 : 4;
  const late = part === parts || part / parts > 0.75;
  return Math.min(5, base + (late ? 1 : 0));
}

function roleFor(part, parts, index, count) {
  if (part === parts && index === 0) return "boss";
  if (count === 3 && index === 2) return "hexer";
  if (count >= 2 && index === 0 && part % 3 === 0) return "bulwark";
  if (count >= 2 && index === 1 && part % 4 === 0) return "medic";
  if (part % 5 === 0) return "skirmish";
  return "striker";
}

function build() {
  const roll = rng(0x51a7);
  const dealers = {
    striker: makeDealer(FOE_BOOK.filter((foe) => foe.role === "striker"), roll),
    hexer: makeDealer(FOE_BOOK.filter((foe) => foe.role === "hexer"), roll),
    bulwark: makeDealer(FOE_BOOK.filter((foe) => foe.role === "bulwark"), roll),
    medic: makeDealer(FOE_BOOK.filter((foe) => foe.role === "medic"), roll),
  };
  let lastElement = null;
  const chapters = STAGES.map((stage, chapterIndex) => {
    const parts = PARTS[stage.id] || 12;
    const nodes = [];
    for (let part = 1; part <= parts; part += 1) {
      const mid = part === Math.ceil(parts / 2) && part !== parts;
      const bossStage = mid || part === parts;
      const count = bossStage ? 1 : part <= 2 ? 1 : part % 4 === 0 ? 3 : part % 2 === 0 ? 2 : 1;
      const enemies = [];
      const finale = stage.enemies[0];
      for (let index = 0; index < count; index += 1) {
        const role = bossStage ? "boss" : roleFor(part, parts, index, count);
        const midBoss = MIDPOINT[stage.id] || [finale.name, finale.element];
        const wanted = role === "skirmish" ? "striker" : role;
        const avoidElements = new Set(enemies.map((enemy) => enemy.element));
        if (lastElement) avoidElements.add(lastElement);
        const next = part + 1;
        const nextIsMid = next === Math.ceil(parts / 2) && next !== parts;
        if (index === count - 1 && nextIsMid) avoidElements.add(midBoss[1]);
        if (index === count - 1 && next === parts) avoidElements.add(finale.element);
        const picked = bossStage ? null : dealers[wanted](avoidElements, new Set(enemies.map((enemy) => enemy.art))) || FOE_BOOK[0];
        if (picked) lastElement = picked.element;
        const name = bossStage ? (mid ? midBoss[0] : finale.name) : picked.name;
        const element = bossStage ? (mid ? midBoss[1] : finale.element) : picked.element;
        const art = bossStage ? FOE_BOOK.find((foe) => foe.name === name)?.art || finale.art : picked.art;
        if (bossStage) lastElement = element;
        const kit = role === "boss" ? strengthenBoss(name, kitForFoe(name, element, role)) : picked.kit;
        const heft = role === "boss" ? (mid ? 1.55 : 1.9) : role === "bulwark" ? 1.25 : role === "hexer" || role === "medic" ? 0.78 : 1;
        const atkMul = role === "hexer" ? 0.8 : role === "boss" ? (mid ? 1.22 : 1.38) : 1;
        enemies.push({
          id: `${stage.id}-${part}-${index}`,
          name,
          element,
          role,
          art,
          maxHp: Math.round((78 + chapterIndex * 6) * heft),
          atk: Math.round((9 + chapterIndex * 0.4) * atkMul),
          guard: Math.round((7 + chapterIndex) * (role === "bulwark" ? 1.4 : role === "boss" ? 1.15 : 1)),
          pattern: kit.map((move) => move.intent),
          kit,
        });
      }
      const t = (chapterIndex + (part - 1) / parts) / STAGES.length;
      nodes.push({
        id: `${stage.id}-${part}`,
        chapterId: stage.id,
        chapter: stage.chapter,
        part,
        parts,
        name: stage.name,
        sub: part === parts ? sourceTitle(stage) : mid ? (MIDPOINT[stage.id]?.[0] || "Boss") : `Stretch ${part}`,
        blurb: part === parts ? stage.blurb : mid ? "A boss holds the middle of the chapter." : BLURBS[(part + chapterIndex) % BLURBS.length],
        boss: bossStage,
        firstReward: 50 + Math.round(t * 520) + part * 4,
        repeatReward: 50 + Math.round(t * 520) + part * 4,
        xp: 10 + Math.round(t * 36) + part,
        gift: part === parts ? stage.gift : null,
        stars: starsFor(chapterIndex, part, parts),
        enemies,
      });
    }
    return {
      id: stage.id,
      chapter: stage.chapter,
      name: stage.name,
      blurb: stage.blurb,
      nodes,
    };
  });
  return { chapters, nodes: chapters.flatMap((chapter) => chapter.nodes) };
}

function sourceTitle(stage) {
  return stage.enemies[0]?.name || "Last stand";
}

function book() {
  if (!cached) cached = build();
  return cached;
}

export function storyChapters() {
  return book().chapters;
}

export function storyNodes() {
  return book().nodes;
}

export function storyNode(id) {
  return book().nodes.find((node) => node.id === id) || null;
}

export function storyClearCounts(save, nodeId) {
  const nodes = storyNodes();
  const index = nodes.findIndex((item) => item.id === nodeId);
  if (index < 0) return Boolean(save?.clears?.[nodeId]);
  for (let i = 0; i <= index; i += 1) {
    if (!save?.clears?.[nodes[i].id]) return false;
  }
  return true;
}

export function repairStoryClears(clears = {}) {
  const nodes = storyNodes();
  const next = { ...clears };
  let open = true;
  for (const node of nodes) {
    if (!open) {
      if (next[node.id]) delete next[node.id];
      continue;
    }
    if (!next[node.id]) open = false;
  }
  return next;
}

export function nodeOpen(save, node) {
  if (!node) return false;
  const nodes = storyNodes();
  const index = nodes.findIndex((item) => item.id === node.id);
  if (index < 0) return false;
  if (index === 0) return true;
  const prev = nodes[index - 1];
  if (save.clears?.[prev.id]) return true;
  return false;
}

export function nextStoryNode(save) {
  const nodes = storyNodes();
  return (
    nodes.find((node) => nodeOpen(save, node) && !save.clears?.[node.id]) ||
    [...nodes].reverse().find((node) => nodeOpen(save, node)) ||
    nodes[0]
  );
}

export function storyProgress(node) {
  const nodes = storyNodes();
  const index = Math.max(0, nodes.findIndex((item) => item.id === node?.id));
  return index / Math.max(1, nodes.length - 1);
}
