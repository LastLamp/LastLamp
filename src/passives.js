// 3-star kit riders. Combat reads these fields in logic.js. Stars below 3 do not receive them.
export const PASSIVES = {
  "vesper": {
    "name": "After Dark",
    "line": "At 3 stars, poison and stun last one action longer.",
    "extendDebuff": true,
  },
  "cael": {
    "name": "Open Guard",
    "line": "At 3 stars, Cinderfall and Inferno apply vulnerable before they land, so those hits deal 30% more.",
    "leadVuln": true
  },
  "ivo": {
    "name": "Steady Hands",
    "line": "At 3 stars, Tailwind calms 6 stress, and Tempest applies vulnerable before it lands.",
    "onDrawCalm": 6,
    "leadVuln": "ego"
  },
  "rhys": {
    "name": "Planted",
    "line": "At 3 stars, the fight starts with 16 block. A card that grants block weakens a foe for 2 actions, and the first time block breaks, 8 block returns.",
    "openShield": 16,
    "blockWeaken": true,
    "rebound": 8
  },
  "soren": {
    "name": "Tide Return",
    "line": "At 3 stars, a heal calms 8 stress. Resistance is 25% higher.",
    "healCalm": 8,
    "res": 0.25
  },
  "juniper": {
    "name": "Second Wind",
    "line": "At 3 stars, an attack against a weakened foe strikes again for 30% ATK.",
    "weakFollow": 0.3
  },
  "marek": {
    "name": "Hot Coal",
    "line": "At 3 stars, Eruption applies vulnerable before it lands, so the hit deals 30% more. Crit chance is 20% higher.",
    "leadVuln": "ego",
    "crit": 0.2
  },
  "theo": {
    "name": "Head Start",
    "line": "At 3 stars, a heal calms 6 stress, and Lullaby's sleep lasts one action longer.",
    "healCalm": 6,
    "extendDebuff": true
  },
  "bastion": {
    "name": "Hold Fast",
    "line": "At 3 stars, the fight starts with 12 block, and a card that grants block weakens a foe for 2 actions.",
    "openShield": 12,
    "blockWeaken": true
  },
  "niles": {
    "name": "Low Voice",
    "line": "At 3 stars, stun lasts one action longer.",
    "extendDebuff": true,
  },
  "orien": {
    "name": "Clean Cut",
    "line": "At 3 stars, attacks brand the target for 2 actions.",
    "brandOnHit": true
  },
  "kit": {
    "name": "Soft Ground",
    "line": "At 3 stars, a heal also grants 6 block.",
    "healBlock": 6
  },
  "pavel": {
    "name": "Brace",
    "line": "At 3 stars, the fight starts with 8 block, and a card that grants block weakens a foe for 2 actions.",
    "openShield": 8,
    "blockWeaken": true
  },
  "len": {
    "name": "Keep the Frame",
    "line": "At 3 stars, a heal calms 5 stress.",
    "healCalm": 5
  },
  "remy": {
    "name": "First Step",
    "line": "At 3 stars, Into the Light applies vulnerable before it lands, so the hit deals 30% more.",
    "leadVuln": "ego"
  },
  "nera": {
    "name": "Quiet Room",
    "line": "At 3 stars, a heal calms 6 stress, and Thorn applies 1 extra poison.",
    "healCalm": 6,
    "poisonBonus": 1
  },
  "silas": {
    "name": "Marked",
    "line": "At 3 stars, poison and stun last one action longer.",
    "extendDebuff": true
  },
  "maris": {
    "name": "Upbeat",
    "line": "At 3 stars, High Tide applies vulnerable before it lands, so the hit deals 30% more.",
    "leadVuln": "ego"
  },
  "rowan": {
    "name": "Bedrock",
    "line": "At 3 stars, the fight starts with 16 block. The first time block breaks, 10 block returns, and a card that grants block weakens a foe. Resistance is 25% higher.",
    "openShield": 16,
    "rebound": 10,
    "blockWeaken": true,
    "res": 0.25
  },
  "selene": {
    "name": "Tidewell",
    "line": "At 3 stars, a heal calms 8 stress.",
    "healCalm": 8,
  },
  "dorian": {
    "name": "Night Cut",
    "line": "At 3 stars, attacks apply 1 poison. A basic attack against a poisoned foe strikes again for 30% ATK.",
    "poisonOnHit": 1,
    "poisonFollow": 0.3
  },
  "brynn": {
    "name": "Open Air",
    "line": "At 3 stars, Gale Line brands its target. A basic attack against a branded foe strikes again for 30% ATK.",
    "ultBrand": true,
    "followBrand": 0.3
  },
  "harrow": {
    "name": "First Spark",
    "line": "At 3 stars, an attack against a weakened foe strikes again for 30% ATK.",
    "weakFollow": 0.3,
  },
  "osric": {
    "name": "Lantern",
    "line": "At 3 stars, a heal calms 6 stress.",
    "healCalm": 6,
  },
  "tessa": {
    "name": "Warm Hands",
    "line": "At 3 stars, a heal calms 5 stress.",
    "healCalm": 5
  },
  "nico": {
    "name": "Current",
    "line": "At 3 stars, attacks brand the target for 2 actions.",
    "brandOnHit": true
  },
  "adel": {
    "name": "Quiet Mirror",
    "line": "At 3 stars, drawing a card calms 4 stress.",
    "onDrawCalm": 4
  },
  "bram": {
    "name": "Vaelor Ruin",
    "line": "At 3 stars, Vaelor Ruin applies vulnerable before it lands, so the hit deals 30% more.",
    "leadVuln": "ego"
  },
  "nessa": {
    "name": "Nessira Ending",
    "line": "At 3 stars, Nessira Ending brands its target. A basic attack against a branded foe strikes again for 40% ATK. Crit chance is 20% higher.",
    "ultBrand": true,
    "followBrand": 0.4,
    "crit": 0.2
  },
  "corin": {
    "name": "Corivane Rally",
    "line": "At 3 stars, the fight starts with 16 block. The first time block breaks, 8 block returns, and a card that grants block weakens a foe.",
    "openShield": 16,
    "rebound": 8,
    "blockWeaken": true
  },
  "idris": {
    "name": "Idrisul Aegis",
    "line": "At 3 stars, the fight starts with 16 block. The first time block breaks, 8 block returns, and a card that grants block weakens a foe.",
    "openShield": 16,
    "rebound": 8,
    "blockWeaken": true
  },
  "willa": {
    "name": "Willoweft Seal",
    "line": "At 3 stars, poison, stun, and sleep last one action longer.",
    "extendDebuff": true
  },
  "torin": {
    "name": "Torivel Rain",
    "line": "At 3 stars, an assist brands the target.",
    "assistBrand": true,
  },
  "sela": {
    "name": "Selavyn Reprise",
    "line": "At 3 stars, resistance is 25% higher.",
    "res": 0.25
  },
  "garrick": {
    "name": "Garricspring",
    "line": "At 3 stars, a heal calms 8 stress.",
    "healCalm": 8,
  },
  "maeve": {
    "name": "Maevara Barrage",
    "line": "At 3 stars, the last hit of a multi-hit attack applies vulnerable. A basic attack against a branded foe strikes again for 25% ATK.",
    "finisherVuln": true,
    "followBrand": 0.25
  },
  "holt": {
    "name": "Holthis Ruin",
    "line": "At 3 stars, area attacks weaken every foe they hit.",
    "aoeWeak": true
  },
  "lira": {
    "name": "Liravel Ending",
    "line": "At 3 stars, Liravel Ending brands its target. A basic attack against a branded foe strikes again for 30% ATK. Crit chance is 20% higher.",
    "ultBrand": true,
    "followBrand": 0.3,
    "crit": 0.2
  },
  "cedric": {
    "name": "Cedrion Rally",
    "line": "At 3 stars, the fight starts with 12 block, and a card that grants block weakens a foe for 2 actions.",
    "openShield": 12,
    "blockWeaken": true
  },
  "anwen": {
    "name": "Anweth Aegis",
    "line": "At 3 stars, the fight starts with 12 block, and a card that grants block weakens a foe for 2 actions.",
    "openShield": 12,
    "blockWeaken": true
  },
  "brock": {
    "name": "Brovarn Seal",
    "line": "At 3 stars, poison, stun, and sleep last one action longer.",
    "extendDebuff": true,
  },
  "ysolde": {
    "name": "Ysolthe Rain",
    "line": "At 3 stars, an assist brands the target for 2 actions.",
    "assistBrand": true
  },
  "fen": {
    "name": "Fenral Reprise",
    "line": "At 3 stars, resistance is 25% higher.",
    "res": 0.25
  },
  "mira": {
    "name": "Mirathen Wellspring",
    "line": "At 3 stars, a heal calms 6 stress.",
    "healCalm": 6,
  },
  "aldric": {
    "name": "Aldrec Barrage",
    "line": "At 3 stars, the last hit of a multi-hit attack applies vulnerable.",
    "finisherVuln": true
  },
  "petra": {
    "name": "Petraya Ruin",
    "line": "At 3 stars, area attacks weaken every foe they hit.",
    "aoeWeak": true
  },
  "jorah": {
    "name": "Jorathen Ending",
    "line": "At 3 stars, Jorathen Ending brands its target. A basic attack against a branded foe strikes again for 30% ATK.",
    "ultBrand": true,
    "followBrand": 0.3
  },
  "quill": {
    "name": "Quillen Rally",
    "line": "At 3 stars, the fight starts with 12 block, and a card that grants block weakens a foe for 2 actions.",
    "openShield": 12,
    "blockWeaken": true
  },
  "saskia": {
    "name": "Saskireth Aegis",
    "line": "At 3 stars, the fight starts with 12 block, and a card that grants block weakens a foe for 2 actions.",
    "openShield": 12,
    "blockWeaken": true
  },
  "brennan": {
    "name": "Brennvar Seal",
    "line": "At 3 stars, poison, stun, and sleep last one action longer.",
    "extendDebuff": true,
  },
  "odette": {
    "name": "Odettalune Rain",
    "line": "At 3 stars, an assist brands the target for 2 actions. Resistance is 25% higher.",
    "assistBrand": true,
    "res": 0.25
  },
  "harlan": {
    "name": "Harlaven Reprise",
    "line": "At 3 stars, resistance is 25% higher.",
    "res": 0.25
  },
  "vesna": {
    "name": "Vesnyra Wellspring",
    "line": "At 3 stars, a heal calms 6 stress.",
    "healCalm": 6,
  },
  "mick": {
    "name": "Mickar Barrage",
    "line": "At 3 stars, the last hit of a multi-hit attack applies vulnerable.",
    "finisherVuln": true
  },
  "cora": {
    "name": "Coralyth Ruin",
    "line": "At 3 stars, area attacks weaken every foe they hit.",
    "aoeWeak": true
  },
  "leif": {
    "name": "Leivar Ending",
    "line": "At 3 stars, Leivar Ending brands its target. A basic attack against a branded foe strikes again for 30% ATK. Crit chance is 20% higher.",
    "ultBrand": true,
    "followBrand": 0.3,
    "crit": 0.2
  },
  "thalia": {
    "name": "Thaliune Rally",
    "line": "At 3 stars, the fight starts with 12 block, and a card that grants block weakens a foe for 2 actions. Resistance is 25% higher.",
    "openShield": 12,
    "blockWeaken": true,
    "res": 0.25
  },
  "oswin": {
    "name": "Oswiren Aegis",
    "line": "At 3 stars, the fight starts with 12 block, and a card that grants block weakens a foe for 2 actions.",
    "openShield": 12,
    "blockWeaken": true
  },
  "briony": {
    "name": "Brioneth Seal",
    "line": "At 3 stars, poison, stun, and sleep last one action longer.",
    "extendDebuff": true
  },
  "cassian": {
    "name": "Cassivar Rain",
    "line": "At 3 stars, an assist brands the target for 2 actions.",
    "assistBrand": true
  },
  "elowen": {
    "name": "Elowynne Reprise",
    "line": "At 3 stars, resistance is 25% higher.",
    "res": 0.25
  },
  "drust": {
    "name": "Drustavar Wellspring",
    "line": "At 3 stars, a heal calms 5 stress.",
    "healCalm": 5
  },
  "nin": {
    "name": "Ninrael Barrage",
    "line": "At 3 stars, the last hit of a multi-hit attack applies vulnerable.",
    "finisherVuln": true
  },
  "peregrine": {
    "name": "Perivar Ruin",
    "line": "At 3 stars, the first attack each turn applies 1 poison.",
    "poisonOnHit": 1,
    "poisonOnce": true
  },
  "isola": {
    "name": "Isolune Ending",
    "line": "At 3 stars, a basic attack against a branded foe strikes again for 25% ATK.",
    "followBrand": 0.25
  },
  "tam": {
    "name": "Tamaros Rally",
    "line": "At 3 stars, the fight starts with 8 block, and a card that grants block weakens a foe for 2 actions.",
    "openShield": 8,
    "blockWeaken": true
  },
  "rheya": {
    "name": "Rheyalis Aegis",
    "line": "At 3 stars, the fight starts with 8 block, and a card that grants block weakens a foe for 2 actions.",
    "openShield": 8,
    "blockWeaken": true
  },
  "col": {
    "name": "Colvyn Seal",
    "line": "At 3 stars, poison, stun, and sleep last one action longer.",
    "extendDebuff": true
  },
  "maren": {
    "name": "Marenya Rain",
    "line": "At 3 stars, an assist brands the target for 2 actions.",
    "assistBrand": true
  },
  "uthred": {
    "name": "Uthrael Reprise",
    "line": "At 3 stars, resistance is 25% higher.",
    "res": 0.25
  },
  "sylvie": {
    "name": "Sylvara Wellspring",
    "line": "At 3 stars, a heal calms 5 stress.",
    "healCalm": 5
  },
  "keir": {
    "name": "Keirith Barrage",
    "line": "At 3 stars, the last hit of a multi-hit attack applies vulnerable.",
    "finisherVuln": true
  },
  "daph": {
    "name": "Daphira Ruin",
    "line": "At 3 stars, the first attack each turn applies 1 poison. Crit chance is 20% higher.",
    "poisonOnHit": 1,
    "poisonOnce": true,
    "crit": 0.2
  },
  "rowan2": {
    "name": "Rowevar Ending",
    "line": "At 3 stars, a basic attack against a branded foe strikes again for 25% ATK.",
    "followBrand": 0.25
  },
  "astra": {
    "name": "Astralya Rally",
    "line": "At 3 stars, the fight starts with 8 block, and a card that grants block weakens a foe for 2 actions.",
    "openShield": 8,
    "blockWeaken": true
  },
  "pike": {
    "name": "Dorvhal Aegis",
    "line": "At 3 stars, the fight starts with 8 block, and a card that grants block weakens a foe for 2 actions.",
    "openShield": 8,
    "blockWeaken": true
  },
  "lumen": {
    "name": "Lumenya Seal",
    "line": "At 3 stars, poison, stun, and sleep last one action longer.",
    "extendDebuff": true
  },
  "bard": {
    "name": "Calivar Rain",
    "line": "At 3 stars, an assist brands the target for 2 actions.",
    "assistBrand": true
  },
  "hestia": {
    "name": "Hestalyne Reprise",
    "line": "At 3 stars, crit chance is 20% higher.",
    "crit": 0.2
  },
  "grim": {
    "name": "Grimorath Wellspring",
    "line": "At 3 stars, a heal calms 5 stress. Resistance is 25% higher.",
    "healCalm": 5,
    "res": 0.25
  },
  "opal": {
    "name": "Opalis Barrage",
    "line": "At 3 stars, the last hit of a multi-hit attack applies vulnerable.",
    "finisherVuln": true
  },
  "soren2": {
    "name": "Sylthea Ruin",
    "line": "At 3 stars, the first attack each turn applies 1 poison.",
    "poisonOnHit": 1,
    "poisonOnce": true
  },
  "vance": {
    "name": "Vancelor Ending",
    "line": "At 3 stars, a basic attack against a branded foe strikes again for 25% ATK.",
    "followBrand": 0.25
  },
  "nell": {
    "name": "Nellixa Rally",
    "line": "At 3 stars, the fight starts with 8 block, and a card that grants block weakens a foe for 2 actions. Resistance is 25% higher.",
    "openShield": 8,
    "blockWeaken": true,
    "res": 0.25
  },
  "orko": {
    "name": "Orvath Aegis",
    "line": "At 3 stars, the fight starts with 8 block, and a card that grants block weakens a foe for 2 actions.",
    "openShield": 8,
    "blockWeaken": true
  },
  "faye": {
    "name": "Fayelin Seal",
    "line": "At 3 stars, poison, stun, and sleep last one action longer.",
    "extendDebuff": true
  },
  "jasper": {
    "name": "Jaspelune Rain",
    "line": "At 3 stars, an assist brands the target for 2 actions.",
    "assistBrand": true
  },
  "rune": {
    "name": "Runethar Reprise",
    "line": "At 3 stars, resistance is 25% higher.",
    "res": 0.25
  },
  "cress": {
    "name": "Cressalyth Wellspring",
    "line": "At 3 stars, a heal calms 5 stress.",
    "healCalm": 5
  },
  "hal": {
    "name": "Halveric Barrage",
    "line": "At 3 stars, the last hit of a multi-hit attack applies vulnerable.",
    "finisherVuln": true
  },
  "io": {
    "name": "Iovara Ruin",
    "line": "At 3 stars, the first attack each turn applies 1 poison.",
    "poisonOnHit": 1,
    "poisonOnce": true
  },
  "mattis": {
    "name": "Matthos Ending",
    "line": "At 3 stars, a basic attack against a branded foe strikes again for 25% ATK.",
    "followBrand": 0.25
  },
  "pearl": {
    "name": "Pearlith Rally",
    "line": "At 3 stars, the fight starts with 8 block, and a card that grants block weakens a foe for 2 actions.",
    "openShield": 8,
    "blockWeaken": true
  },
  "stark": {
    "name": "Starkev Aegis",
    "line": "At 3 stars, the fight starts with 8 block, and a card that grants block weakens a foe for 2 actions.",
    "openShield": 8,
    "blockWeaken": true
  },
  "una": {
    "name": "Unavelle Seal",
    "line": "At 3 stars, poison, stun, and sleep last one action longer.",
    "extendDebuff": true
  },
  "wystan": {
    "name": "Wystavar Rain",
    "line": "At 3 stars, an assist brands the target for 2 actions.",
    "assistBrand": true
  },
  "yara": {
    "name": "Yaralith Reprise",
    "line": "At 3 stars, resistance is 25% higher.",
    "res": 0.25
  },
  "zeno": {
    "name": "Zenovar Wellspring",
    "line": "At 3 stars, a heal calms 5 stress.",
    "healCalm": 5
  },
  "amber": {
    "name": "Amberis Barrage",
    "line": "At 3 stars, the last hit of a multi-hit attack applies vulnerable. Crit chance is 20% higher.",
    "finisherVuln": true,
    "crit": 0.2
  },
  "beck": {
    "name": "Beckoran Ruin",
    "line": "At 3 stars, the first attack each turn applies 1 poison. Crit chance is 20% higher.",
    "poisonOnHit": 1,
    "poisonOnce": true,
    "crit": 0.2
  },
  "solenne": {
    "name": "Last Light",
    "line": "At 3 stars, Sunfall brands its target. A basic attack against a branded foe strikes again for 40% ATK. Crit chance is 20% higher.",
    "ultBrand": true,
    "followBrand": 0.4,
    "crit": 0.2
  },
  "harren": {
    "name": "Remembered Stone",
    "line": "At 3 stars, the fight starts with 18 block. The first time block breaks, 12 block returns, and a card that grants block weakens a foe. Resistance is 25% higher.",
    "openShield": 18,
    "rebound": 12,
    "blockWeaken": true,
    "res": 0.25
  },
  "ilyra": {
    "name": "Deep Well",
    "line": "At 3 stars, a heal calms 8 stress and fills every ult gauge by 10.",
    "healCalm": 8,
    "healCharge": 10
  },
  "mael": {
    "name": "Late Arrival",
    "line": "At 3 stars, stun lasts one action longer and also applies vulnerable.",
    "extendDebuff": true,
    "hexVuln": true
  },
  "seraphine": {
    "name": "Second Turn",
    "line": "At 3 stars, refunding AP fills every ult gauge by 8.",
    "refundCharge": 8
  }
};
