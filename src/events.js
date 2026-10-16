import { kitForFoe } from "./foes.js";
import { FOE_BOOK } from "./foeBook.js";

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
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
  const stages = [];
  for (const road of EVENT_ROADS) {
    for (let tier = 1; tier <= 5; tier += 1) {
      const foe = FOE_BOOK[(hash(`${road.lane}:${tier}`) + tier * 13) % FOE_BOOK.length];
      const boss = tier === 5;
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
