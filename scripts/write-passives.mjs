import fs from "fs";
import { CHARACTERS } from "../src/data.js";

const HAND = {
  vesper: {
    name: "After Dark",
    line: "At 3 stars, poison and stun last one action longer, and applying them fills the ult gauge by 8.",
    extendDebuff: true,
    debuffCharge: 8,
  },
  cael: {
    name: "Open Guard",
    line: "At 3 stars, Cinderfall and Inferno apply vulnerable before they land, so those hits deal 30% more.",
    leadVuln: true,
  },
  ivo: {
    name: "Steady Hands",
    line: "At 3 stars, Tailwind calms 6 stress, and Tempest applies vulnerable before it lands.",
    onDrawCalm: 6,
    leadVuln: "ego",
  },
  rhys: {
    name: "Planted",
    line: "At 3 stars, the fight starts with 16 block. A card that grants block weakens a foe for 2 actions, and the first time block breaks, 8 block returns.",
    openShield: 16,
    blockWeaken: true,
    rebound: 8,
  },
  soren: {
    name: "Tide Return",
    line: "At 3 stars, a heal calms 8 stress and fills every ult gauge by 8.",
    healCalm: 8,
    healCharge: 8,
  },
  juniper: {
    name: "Second Wind",
    line: "At 3 stars, an attack against a weakened foe strikes again for 30% ATK.",
    weakFollow: 0.3,
  },
  marek: {
    name: "Hot Coal",
    line: "At 3 stars, Eruption applies vulnerable before it lands, so the hit deals 30% more.",
    leadVuln: "ego",
  },
  theo: {
    name: "Head Start",
    line: "At 3 stars, a heal calms 6 stress, and Lullaby's sleep lasts one action longer.",
    healCalm: 6,
    extendDebuff: true,
  },
  bastion: {
    name: "Hold Fast",
    line: "At 3 stars, the fight starts with 12 block, and a card that grants block weakens a foe for 2 actions.",
    openShield: 12,
    blockWeaken: true,
  },
  niles: {
    name: "Low Voice",
    line: "At 3 stars, stun lasts one action longer, and a debuff fills the ult gauge by 6.",
    extendDebuff: true,
    debuffCharge: 6,
  },
  orien: {
    name: "Clean Cut",
    line: "At 3 stars, attacks brand the target for 2 actions.",
    brandOnHit: true,
  },
  kit: {
    name: "Soft Ground",
    line: "At 3 stars, a heal also grants 6 block.",
    healBlock: 6,
  },
  pavel: {
    name: "Brace",
    line: "At 3 stars, the fight starts with 8 block, and a card that grants block weakens a foe for 2 actions.",
    openShield: 8,
    blockWeaken: true,
  },
  len: {
    name: "Keep the Frame",
    line: "At 3 stars, a heal calms 5 stress.",
    healCalm: 5,
  },
  remy: {
    name: "First Step",
    line: "At 3 stars, Into the Light applies vulnerable before it lands, so the hit deals 30% more.",
    leadVuln: "ego",
  },
  nera: {
    name: "Quiet Room",
    line: "At 3 stars, a heal calms 6 stress, and Thorn applies 1 extra poison.",
    healCalm: 6,
    poisonBonus: 1,
  },
  silas: {
    name: "Marked",
    line: "At 3 stars, poison and stun last one action longer.",
    extendDebuff: true,
  },
  maris: {
    name: "Upbeat",
    line: "At 3 stars, High Tide applies vulnerable before it lands, so the hit deals 30% more.",
    leadVuln: "ego",
  },
  rowan: {
    name: "Bedrock",
    line: "At 3 stars, the fight starts with 16 block. The first time block breaks, 10 block returns, and a card that grants block weakens a foe.",
    openShield: 16,
    rebound: 10,
    blockWeaken: true,
  },
  selene: {
    name: "Tidewell",
    line: "At 3 stars, a heal calms 8 stress and fills every ult gauge by 8.",
    healCalm: 8,
    healCharge: 8,
  },
  dorian: {
    name: "Night Cut",
    line: "At 3 stars, attacks apply 1 poison. A basic attack against a poisoned foe strikes again for 30% ATK.",
    poisonOnHit: 1,
    poisonFollow: 0.3,
  },
  brynn: {
    name: "Open Air",
    line: "At 3 stars, Gale Line brands its target. A basic attack against a branded foe strikes again for 30% ATK.",
    ultBrand: true,
    followBrand: 0.3,
  },
  harrow: {
    name: "First Spark",
    line: "At 3 stars, an attack against a weakened foe strikes again for 30% ATK, and a debuff fills the ult gauge by 6.",
    weakFollow: 0.3,
    debuffCharge: 6,
  },
  osric: {
    name: "Lantern",
    line: "At 3 stars, a heal calms 6 stress and fills every ult gauge by 4.",
    healCalm: 6,
    healCharge: 4,
  },
  tessa: {
    name: "Warm Hands",
    line: "At 3 stars, a heal calms 5 stress.",
    healCalm: 5,
  },
  nico: {
    name: "Current",
    line: "At 3 stars, attacks brand the target for 2 actions.",
    brandOnHit: true,
  },
  adel: {
    name: "Quiet Mirror",
    line: "At 3 stars, drawing a card calms 4 stress.",
    onDrawCalm: 4,
  },
  solenne: {
    name: "Last Light",
    line: "At 3 stars, Sunfall brands its target. A basic attack against a branded foe strikes again for 40% ATK.",
    ultBrand: true,
    followBrand: 0.4,
  },
  harren: {
    name: "Remembered Stone",
    line: "At 3 stars, the fight starts with 18 block. The first time block breaks, 12 block returns, and a card that grants block weakens a foe.",
    openShield: 18,
    rebound: 12,
    blockWeaken: true,
  },
  ilyra: {
    name: "Deep Well",
    line: "At 3 stars, a heal calms 8 stress and fills every ult gauge by 10.",
    healCalm: 8,
    healCharge: 10,
  },
  mael: {
    name: "Late Arrival",
    line: "At 3 stars, stun lasts one action longer and also applies vulnerable.",
    extendDebuff: true,
    hexVuln: true,
  },
  seraphine: {
    name: "Second Turn",
    line: "At 3 stars, refunding AP fills every ult gauge by 8.",
    refundCharge: 8,
  },
};

function egoName(c) {
  return c.cards.find((card) => card.kind === "ego")?.name || "The ult";
}

function any(c, pred) {
  return c.cards.some(pred);
}

function generated(c) {
  const ego = egoName(c);
  const tier = c.rarity === "SSR" ? 2 : c.rarity === "SR" ? 1 : 0;
  const name = ego;
  if (any(c, (card) => card.hits > 1)) {
    if (tier === 2) {
      return {
        name,
        line: "At 3 stars, the last hit of a multi-hit attack applies vulnerable. A basic attack against a branded foe strikes again for 25% ATK.",
        finisherVuln: true,
        followBrand: 0.25,
      };
    }
    return {
      name,
      line: "At 3 stars, the last hit of a multi-hit attack applies vulnerable.",
      finisherVuln: true,
    };
  }
  if (any(c, (card) => card.brand || card.follow)) {
    if (tier === 2) {
      return {
        name,
        line: `At 3 stars, ${ego} brands its target. A basic attack against a branded foe strikes again for 40% ATK.`,
        ultBrand: true,
        followBrand: 0.4,
      };
    }
    if (tier === 1) {
      return {
        name,
        line: `At 3 stars, ${ego} brands its target. A basic attack against a branded foe strikes again for 30% ATK.`,
        ultBrand: true,
        followBrand: 0.3,
      };
    }
    return {
      name,
      line: "At 3 stars, a basic attack against a branded foe strikes again for 25% ATK.",
      followBrand: 0.25,
    };
  }
  if (c.role === "Healer" || (any(c, (card) => card.heal) && !any(c, (card) => card.poison || card.stun || card.sleep))) {
    if (tier === 2) {
      return {
        name,
        line: "At 3 stars, a heal calms 8 stress and fills every ult gauge by 8.",
        healCalm: 8,
        healCharge: 8,
      };
    }
    if (tier === 1) {
      return {
        name,
        line: "At 3 stars, a heal calms 6 stress and fills every ult gauge by 4.",
        healCalm: 6,
        healCharge: 4,
      };
    }
    return { name, line: "At 3 stars, a heal calms 5 stress.", healCalm: 5 };
  }
  if (any(c, (card) => card.poison || card.stun || card.sleep)) {
    if (tier === 2) {
      return {
        name,
        line: "At 3 stars, poison, stun, and sleep last one action longer, and a debuff fills the ult gauge by 8.",
        extendDebuff: true,
        debuffCharge: 8,
      };
    }
    if (tier === 1) {
      return {
        name,
        line: "At 3 stars, poison, stun, and sleep last one action longer, and a debuff fills the ult gauge by 6.",
        extendDebuff: true,
        debuffCharge: 6,
      };
    }
    return {
      name,
      line: "At 3 stars, poison, stun, and sleep last one action longer.",
      extendDebuff: true,
    };
  }
  if (c.role === "Guardian" || any(c, (card) => card.shield)) {
    if (tier === 2) {
      return {
        name,
        line: "At 3 stars, the fight starts with 16 block. The first time block breaks, 8 block returns, and a card that grants block weakens a foe.",
        openShield: 16,
        rebound: 8,
        blockWeaken: true,
      };
    }
    if (tier === 1) {
      return {
        name,
        line: "At 3 stars, the fight starts with 12 block, and a card that grants block weakens a foe for 2 actions.",
        openShield: 12,
        blockWeaken: true,
      };
    }
    return {
      name,
      line: "At 3 stars, the fight starts with 8 block, and a card that grants block weakens a foe for 2 actions.",
      openShield: 8,
      blockWeaken: true,
    };
  }
  if (any(c, (card) => card.might)) {
    const amount = tier === 2 ? 12 : tier === 1 ? 8 : 6;
    return {
      name,
      line: `At 3 stars, granting might also fills every ult gauge by ${amount}.`,
      mightCharge: amount,
    };
  }
  if (any(c, (card) => card.again)) {
    if (tier === 2) {
      return {
        name,
        line: "At 3 stars, refunding AP fills every ult gauge by 8.",
        refundCharge: 8,
      };
    }
    const amount = tier === 1 ? 8 : 5;
    return {
      name,
      line: `At 3 stars, playing a skill fills the ult gauge by ${amount}.`,
      skillCharge: amount,
    };
  }
  if (any(c, (card) => card.assist)) {
    if (tier === 2) {
      return {
        name,
        line: "At 3 stars, an assist brands the target, and a skill fills the ult gauge by 6.",
        assistBrand: true,
        skillCharge: 6,
      };
    }
    return {
      name,
      line: "At 3 stars, an assist brands the target for 2 actions.",
      assistBrand: true,
    };
  }
  if (any(c, (card) => card.aoe)) {
    if (tier === 2) {
      return {
        name,
        line: `At 3 stars, ${ego} applies vulnerable before it lands, so the hit deals 30% more.`,
        leadVuln: "ego",
      };
    }
    if (tier === 1) {
      if (any(c, (card) => card.aoe && card.weaken)) {
        return {
          name,
          line: "At 3 stars, an attack against a weakened foe strikes again for 30% ATK.",
          weakFollow: 0.3,
        };
      }
      return {
        name,
        line: "At 3 stars, area attacks weaken every foe they hit.",
        aoeWeak: true,
      };
    }
    return {
      name,
      line: "At 3 stars, the first attack each turn applies 1 poison.",
      poisonOnHit: 1,
      poisonOnce: true,
    };
  }
  if (any(c, (card) => card.charge) || c.role === "Support") {
    const amount = tier === 2 ? 10 : tier === 1 ? 6 : 4;
    return {
      name,
      line: `At 3 stars, playing a skill fills the ult gauge by ${amount}.`,
      skillCharge: amount,
    };
  }
  if (tier === 2) {
    return {
      name,
      line: "At 3 stars, attacks brand the target. A basic attack against a branded foe strikes again for 30% ATK.",
      brandOnHit: true,
      followBrand: 0.3,
    };
  }
  if (tier === 1) {
    return {
      name,
      line: "At 3 stars, attacks brand the target for 2 actions.",
      brandOnHit: true,
    };
  }
  return {
    name,
    line: "At 3 stars, the first attack each turn applies 1 poison.",
    poisonOnHit: 1,
    poisonOnce: true,
  };
}

const passives = {};
const buckets = {};
for (const character of CHARACTERS) {
  const passive = HAND[character.id] || generated(character);
  passives[character.id] = passive;
  const key = Object.keys(passive).filter((field) => field !== "name" && field !== "line").sort().join("+") || "none";
  buckets[key] = (buckets[key] || 0) + 1;
  for (const banned of ["hp", "atk", "energy", "mend"]) {
    if (passive[banned] != null) throw new Error(`${character.id} still has ${banned}`);
  }
  if (!passive.line || !passive.name) throw new Error(`${character.id} missing line`);
}

if (Object.keys(passives).length !== CHARACTERS.length) {
  throw new Error("passive count mismatch");
}
if (!passives.seraphine) throw new Error("seraphine missing");

const body = `// 3-star kit riders. Combat reads these fields in logic.js. Stars below 3 do not receive them.
export const PASSIVES = ${JSON.stringify(passives, null, 2)};
`;
fs.writeFileSync(new URL("../src/passives.js", import.meta.url), body);
console.log("wrote", Object.keys(passives).length);
console.log(buckets);
