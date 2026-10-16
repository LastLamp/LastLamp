import { kitForFoe } from "./foes.js";
import { FOE_BOOK } from "./foeBook.js";
import { makeDealer } from "./foeSpread.js";

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const EVENT_ROADS = [
  {
    lane: "fanmail",
    title: "Road Letters",
    line: "Give these at camp.",
    gift: "fanmail",
    names: ["Loose Page", "Ink Bend", "Sealed Fork", "Courier's Stair", "The Last Letter"],
  },
  {
    lane: "bouquet",
    title: "Wildflowers",
    line: "Give these at camp.",
    gift: "bouquet",
    names: ["Weed Patch", "Hill Bloom", "Thorn Gate", "Night Garden", "The Kept Bouquet"],
  },
  {
    lane: "note",
    title: "Notes",
    line: "Rank up a skill.",
    notes: true,
    names: ["Quiet Hour", "Margin Note", "Open Ledger", "Night Lesson", "The Last Page"],
  },
  {
    lane: "shard",
    title: "Shards",
    line: "Spend these to ascend.",
    shards: true,
    names: ["Shard Dust", "Broken Shelf", "Vault Step", "Saint's Cache", "The Closed Vault"],
  },
];

export function bondEvents() {
  const roll = rng(0xe7e7);
  const strikers = makeDealer(FOE_BOOK.filter((foe) => foe.role === "striker"), roll);
  const bosses = makeDealer(FOE_BOOK.filter((foe) => foe.role === "boss"), roll);
  const stages = [];
  let lastElement = null;
  for (const road of EVENT_ROADS) {
    for (let tier = 1; tier <= 5; tier += 1) {
      const boss = tier === 5;
      const avoid = lastElement ? new Set([lastElement]) : new Set();
      const foe = (boss ? bosses : strikers)(avoid) || FOE_BOOK[0];
      lastElement = foe.element;
      const kit = boss ? kitForFoe(`${foe.name} Warden`, foe.element, "boss") : foe.kit;
      stages.push({
        id: `bond-${road.lane}-${tier}`,
        event: true,
        lane: road.lane,
        gift: road.gift || null,
        giftCount: road.gift ? tier : 0,
        notes: road.notes ? tier : 0,
        shards: road.shards ? tier : 0,
        stars: tier,
        tier,
        name: road.names[tier - 1],
        blurb: boss ? "The keeper of this road does not share." : "The drop is lying on the path. Something is standing on it.",
        firstReward: 0,
        xp: 0,
        chapter: "Event",
        enemies: [
          {
            id: `bond-${road.lane}-${tier}-0`,
            name: boss ? `${foe.name} Warden` : foe.name,
            element: foe.element,
            role: boss ? "boss" : foe.role,
            art: foe.art,
            maxHp: 84 + tier * 12,
            atk: 9 + tier,
            guard: 7 + tier,
            pattern: kit.map((move) => move.intent),
            kit,
          },
        ],
      });
    }
  }
  return stages;
}

export function bondEventById(id) {
  return bondEvents().find((stage) => stage.id === id) || null;
}

export function eventOpen(save, stage) {
  if (!stage || stage.tier <= 1) return true;
  const prev = stage.tier - 1;
  const clears = save?.clears || {};
  if (clears[`bond-${stage.lane}-${prev}`]) return true;
  if (stage.lane === "shard" && clears[`bond-keepsake-${prev}`]) return true;
  return false;
}
