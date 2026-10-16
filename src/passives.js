// 3-star kit riders. Combat reads these fields in logic.js. Stars below 3 do not receive them.
export const PASSIVES = {
  "vesper": {
    "name": "After Dark",
    "line": "At 3 stars, Poison and Stun last 1 turn longer.",
    "extendDebuff": true,
  },
  "cael": {
    "name": "Open Guard",
    "line": "At 3 stars, Cinderfall and Inferno inflict Exposed before they hit.",
    "leadVuln": true
  },
  "ivo": {
    "name": "Steady Hands",
    "line": "At 3 stars, Tailwind reduces Stress by 6, and Tempest inflicts Exposed before it hits.",
    "onDrawCalm": 6,
    "leadVuln": "ego"
  },
  "rhys": {
    "name": "Planted",
    "line": "At 3 stars, the battle starts with 16 Block. A card that grants Block inflicts Weak for 2 turns, and the first time Block breaks, 8 Block returns.",
    "openShield": 16,
    "blockWeaken": true,
    "rebound": 8
  },
  "soren": {
    "name": "Tide Return",
    "line": "At 3 stars, a heal reduces Stress by 8. This unit's Resistance increases by 25%.",
    "healCalm": 8,
    "res": 0.25
  },
  "juniper": {
    "name": "Second Wind",
    "line": "At 3 stars, an attack against an enemy with Weak strikes again for 30% of this unit's attack.",
    "weakFollow": 0.3
  },
  "marek": {
    "name": "Hot Coal",
    "line": "At 3 stars, Eruption inflicts Exposed before it hits. This unit's CRIT Rate increases by 20%.",
    "leadVuln": "ego",
    "crit": 0.2
  },
  "theo": {
    "name": "Head Start",
    "line": "At 3 stars, a heal reduces Stress by 6, and Lullaby's Sleep lasts 1 turn longer.",
    "healCalm": 6,
    "extendDebuff": true
  },
  "bastion": {
    "name": "Hold Fast",
    "line": "At 3 stars, the battle starts with 12 Block, and a card that grants Block inflicts Weak for 2 turns.",
    "openShield": 12,
    "blockWeaken": true
  },
  "niles": {
    "name": "Low Voice",
    "line": "At 3 stars, Stun lasts 1 turn longer.",
    "extendDebuff": true,
  },
  "orien": {
    "name": "Clean Cut",
    "line": "At 3 stars, this unit's attacks inflict Brand for 2 turns.",
    "brandOnHit": true
  },
  "kit": {
    "name": "Soft Ground",
    "line": "At 3 stars, a heal also grants 6 Block.",
    "healBlock": 6
  },
  "pavel": {
    "name": "Brace",
    "line": "At 3 stars, the battle starts with 8 Block, and a card that grants Block inflicts Weak for 2 turns.",
    "openShield": 8,
    "blockWeaken": true
  },
  "len": {
    "name": "Keep the Frame",
    "line": "At 3 stars, a heal reduces Stress by 5.",
    "healCalm": 5
  },
  "remy": {
    "name": "First Step",
    "line": "At 3 stars, Into the Light inflicts Exposed before it hits.",
    "leadVuln": "ego"
  },
  "nera": {
    "name": "Quiet Room",
    "line": "At 3 stars, a heal reduces Stress by 6, and Thorn inflicts 1 extra Poison.",
    "healCalm": 6,
    "poisonBonus": 1
  },
  "silas": {
    "name": "Marked",
    "line": "At 3 stars, Poison and Stun last 1 turn longer.",
    "extendDebuff": true
  },
  "maris": {
    "name": "Upbeat",
    "line": "At 3 stars, High Tide inflicts Exposed before it hits.",
    "leadVuln": "ego"
  },
  "rowan": {
    "name": "Bedrock",
    "line": "At 3 stars, the battle starts with 16 Block. The first time Block breaks, 10 Block returns, and a card that grants Block inflicts Weak. This unit's Resistance increases by 25%.",
    "openShield": 16,
    "rebound": 10,
    "blockWeaken": true,
    "res": 0.25
  },
  "selene": {
    "name": "Tidewell",
    "line": "At 3 stars, a heal reduces Stress by 8.",
    "healCalm": 8,
  },
  "dorian": {
    "name": "Night Cut",
    "line": "At 3 stars, this unit's attacks apply 1 poison. A basic attack against a Poisoned enemy strikes again for 30% of this unit's attack.",
    "poisonOnHit": 1,
    "poisonFollow": 0.3
  },
  "brynn": {
    "name": "Open Air",
    "line": "At 3 stars, Gale Line inflicts Brand. A basic attack against a Branded enemy strikes again for 30% of this unit's attack.",
    "ultBrand": true,
    "followBrand": 0.3
  },
  "harrow": {
    "name": "First Spark",
    "line": "At 3 stars, an attack against an enemy with Weak strikes again for 30% of this unit's attack.",
    "weakFollow": 0.3,
  },
  "osric": {
    "name": "Lantern",
    "line": "At 3 stars, a heal reduces Stress by 6.",
    "healCalm": 6,
  },
  "tessa": {
    "name": "Warm Hands",
    "line": "At 3 stars, a heal reduces Stress by 5.",
    "healCalm": 5
  },
  "nico": {
    "name": "Current",
    "line": "At 3 stars, this unit's attacks inflict Brand for 2 turns.",
    "brandOnHit": true
  },
  "adel": {
    "name": "Quiet Mirror",
    "line": "At 3 stars, drawing a card reduces Stress by 4.",
    "onDrawCalm": 4
  },
  "bram": {
    "name": "Vaelor Ruin",
    "line": "At 3 stars, Vaelor Ruin inflicts Exposed before it hits.",
    "leadVuln": "ego"
  },
  "nessa": {
    "name": "Nessira Finisher",
    "line": "At 3 stars, Nessira Finisher inflicts Brand. A basic attack against a Branded enemy strikes again for 40% of this unit's attack. This unit's CRIT Rate increases by 20%.",
    "ultBrand": true,
    "followBrand": 0.4,
    "crit": 0.2
  },
  "corin": {
    "name": "Corivane Rally",
    "line": "At 3 stars, the battle starts with 16 Block. The first time Block breaks, 8 Block returns, and a card that grants Block inflicts Weak.",
    "openShield": 16,
    "rebound": 8,
    "blockWeaken": true
  },
  "idris": {
    "name": "Idrisul Aegis",
    "line": "At 3 stars, the battle starts with 16 Block. The first time Block breaks, 8 Block returns, and a card that grants Block inflicts Weak.",
    "openShield": 16,
    "rebound": 8,
    "blockWeaken": true
  },
  "willa": {
    "name": "Willoweft Seal",
    "line": "At 3 stars, Poison, Stun, and Sleep last 1 turn longer.",
    "extendDebuff": true
  },
  "torin": {
    "name": "Torivel Rain",
    "line": "At 3 stars, an assist inflicts Brand.",
    "assistBrand": true,
  },
  "sela": {
    "name": "Selavyn Reprise",
    "line": "At 3 stars, this unit's Resistance increases by 25%.",
    "res": 0.25
  },
  "garrick": {
    "name": "Garricspring",
    "line": "At 3 stars, a heal reduces Stress by 8.",
    "healCalm": 8,
  },
  "maeve": {
    "name": "Maevara Barrage",
    "line": "At 3 stars, the last hit of a multi-hit attack inflicts Exposed. A basic attack against a Branded enemy strikes again for 25% of this unit's attack.",
    "finisherVuln": true,
    "followBrand": 0.25
  },
  "holt": {
    "name": "Holthis Ruin",
    "line": "At 3 stars, area attacks weaken every enemy they hit.",
    "aoeWeak": true
  },
  "lira": {
    "name": "Liravel Finisher",
    "line": "At 3 stars, Liravel Finisher inflicts Brand. A basic attack against a Branded enemy strikes again for 30% of this unit's attack. This unit's CRIT Rate increases by 20%.",
    "ultBrand": true,
    "followBrand": 0.3,
    "crit": 0.2
  },
  "cedric": {
    "name": "Cedrion Rally",
    "line": "At 3 stars, the battle starts with 12 Block, and a card that grants Block inflicts Weak for 2 turns.",
    "openShield": 12,
    "blockWeaken": true
  },
  "anwen": {
    "name": "Anweth Aegis",
    "line": "At 3 stars, the battle starts with 12 Block, and a card that grants Block inflicts Weak for 2 turns.",
    "openShield": 12,
    "blockWeaken": true
  },
  "brock": {
    "name": "Brovarn Seal",
    "line": "At 3 stars, Poison, Stun, and Sleep last 1 turn longer.",
    "extendDebuff": true,
  },
  "ysolde": {
    "name": "Ysolthe Rain",
    "line": "At 3 stars, an assist inflicts Brand for 2 turns.",
    "assistBrand": true
  },
  "fen": {
    "name": "Fenral Reprise",
    "line": "At 3 stars, this unit's Resistance increases by 25%.",
    "res": 0.25
  },
  "mira": {
    "name": "Mirathen Wellspring",
    "line": "At 3 stars, a heal reduces Stress by 6.",
    "healCalm": 6,
  },
  "aldric": {
    "name": "Aldrec Barrage",
    "line": "At 3 stars, the last hit of a multi-hit attack inflicts Exposed.",
    "finisherVuln": true
  },
  "petra": {
    "name": "Petraya Ruin",
    "line": "At 3 stars, area attacks weaken every enemy they hit.",
    "aoeWeak": true
  },
  "jorah": {
    "name": "Jorathen Finisher",
    "line": "At 3 stars, Jorathen Finisher inflicts Brand. A basic attack against a Branded enemy strikes again for 30% of this unit's attack.",
    "ultBrand": true,
    "followBrand": 0.3
  },
  "quill": {
    "name": "Quillen Rally",
    "line": "At 3 stars, the battle starts with 12 Block, and a card that grants Block inflicts Weak for 2 turns.",
    "openShield": 12,
    "blockWeaken": true
  },
  "saskia": {
    "name": "Saskireth Aegis",
    "line": "At 3 stars, the battle starts with 12 Block, and a card that grants Block inflicts Weak for 2 turns.",
    "openShield": 12,
    "blockWeaken": true
  },
  "brennan": {
    "name": "Brennvar Seal",
    "line": "At 3 stars, Poison, Stun, and Sleep last 1 turn longer.",
    "extendDebuff": true,
  },
  "odette": {
    "name": "Odettalune Rain",
    "line": "At 3 stars, an assist inflicts Brand for 2 turns. This unit's Resistance increases by 25%.",
    "assistBrand": true,
    "res": 0.25
  },
  "harlan": {
    "name": "Harlaven Reprise",
    "line": "At 3 stars, this unit's Resistance increases by 25%.",
    "res": 0.25
  },
  "vesna": {
    "name": "Vesnyra Wellspring",
    "line": "At 3 stars, a heal reduces Stress by 6.",
    "healCalm": 6,
  },
  "mick": {
    "name": "Mickar Barrage",
    "line": "At 3 stars, the last hit of a multi-hit attack inflicts Exposed.",
    "finisherVuln": true
  },
  "cora": {
    "name": "Coralyth Ruin",
    "line": "At 3 stars, area attacks weaken every enemy they hit.",
    "aoeWeak": true
  },
  "leif": {
    "name": "Leivar Finisher",
    "line": "At 3 stars, Leivar Finisher inflicts Brand. A basic attack against a Branded enemy strikes again for 30% of this unit's attack. This unit's CRIT Rate increases by 20%.",
    "ultBrand": true,
    "followBrand": 0.3,
    "crit": 0.2
  },
  "thalia": {
    "name": "Thaliune Rally",
    "line": "At 3 stars, the battle starts with 12 Block, and a card that grants Block inflicts Weak for 2 turns. This unit's Resistance increases by 25%.",
    "openShield": 12,
    "blockWeaken": true,
    "res": 0.25
  },
  "oswin": {
    "name": "Oswiren Aegis",
    "line": "At 3 stars, the battle starts with 12 Block, and a card that grants Block inflicts Weak for 2 turns.",
    "openShield": 12,
    "blockWeaken": true
  },
  "briony": {
    "name": "Brioneth Seal",
    "line": "At 3 stars, Poison, Stun, and Sleep last 1 turn longer.",
    "extendDebuff": true
  },
  "cassian": {
    "name": "Cassivar Rain",
    "line": "At 3 stars, an assist inflicts Brand for 2 turns.",
    "assistBrand": true
  },
  "elowen": {
    "name": "Elowynne Reprise",
    "line": "At 3 stars, this unit's Resistance increases by 25%.",
    "res": 0.25
  },
  "drust": {
    "name": "Drustavar Wellspring",
    "line": "At 3 stars, a heal reduces Stress by 5.",
    "healCalm": 5
  },
  "nin": {
    "name": "Ninrael Barrage",
    "line": "At 3 stars, the last hit of a multi-hit attack inflicts Exposed.",
    "finisherVuln": true
  },
  "peregrine": {
    "name": "Perivar Ruin",
    "line": "At 3 stars, the first attack each turn inflicts 1 Poison.",
    "poisonOnHit": 1,
    "poisonOnce": true
  },
  "isola": {
    "name": "Isolune Ending",
    "line": "At 3 stars, a basic attack against a Branded enemy strikes again for 25% of this unit's attack.",
    "followBrand": 0.25
  },
  "tam": {
    "name": "Tamaros Rally",
    "line": "At 3 stars, the battle starts with 8 Block, and a card that grants Block inflicts Weak for 2 turns.",
    "openShield": 8,
    "blockWeaken": true
  },
  "rheya": {
    "name": "Rheyalis Aegis",
    "line": "At 3 stars, the battle starts with 8 Block, and a card that grants Block inflicts Weak for 2 turns.",
    "openShield": 8,
    "blockWeaken": true
  },
  "col": {
    "name": "Colvyn Seal",
    "line": "At 3 stars, Poison, Stun, and Sleep last 1 turn longer.",
    "extendDebuff": true
  },
  "maren": {
    "name": "Marenya Rain",
    "line": "At 3 stars, an assist inflicts Brand for 2 turns.",
    "assistBrand": true
  },
  "uthred": {
    "name": "Uthrael Reprise",
    "line": "At 3 stars, this unit's Resistance increases by 25%.",
    "res": 0.25
  },
  "sylvie": {
    "name": "Sylvara Wellspring",
    "line": "At 3 stars, a heal reduces Stress by 5.",
    "healCalm": 5
  },
  "keir": {
    "name": "Keirith Barrage",
    "line": "At 3 stars, the last hit of a multi-hit attack inflicts Exposed.",
    "finisherVuln": true
  },
  "daph": {
    "name": "Daphira Ruin",
    "line": "At 3 stars, the first attack each turn inflicts 1 Poison. This unit's CRIT Rate increases by 20%.",
    "poisonOnHit": 1,
    "poisonOnce": true,
    "crit": 0.2
  },
  "rowan2": {
    "name": "Rowevar Ending",
    "line": "At 3 stars, a basic attack against a Branded enemy strikes again for 25% of this unit's attack.",
    "followBrand": 0.25
  },
  "astra": {
    "name": "Astralya Rally",
    "line": "At 3 stars, the battle starts with 8 Block, and a card that grants Block inflicts Weak for 2 turns.",
    "openShield": 8,
    "blockWeaken": true
  },
  "pike": {
    "name": "Dorvhal Aegis",
    "line": "At 3 stars, the battle starts with 8 Block, and a card that grants Block inflicts Weak for 2 turns.",
    "openShield": 8,
    "blockWeaken": true
  },
  "lumen": {
    "name": "Lumenya Seal",
    "line": "At 3 stars, Poison, Stun, and Sleep last 1 turn longer.",
    "extendDebuff": true
  },
  "bard": {
    "name": "Calivar Rain",
    "line": "At 3 stars, an assist inflicts Brand for 2 turns.",
    "assistBrand": true
  },
  "hestia": {
    "name": "Hestalyne Reprise",
    "line": "At 3 stars, this unit's CRIT Rate increases by 20%.",
    "crit": 0.2
  },
  "grim": {
    "name": "Grimorath Wellspring",
    "line": "At 3 stars, a heal reduces Stress by 5. This unit's Resistance increases by 25%.",
    "healCalm": 5,
    "res": 0.25
  },
  "opal": {
    "name": "Opalis Barrage",
    "line": "At 3 stars, the last hit of a multi-hit attack inflicts Exposed.",
    "finisherVuln": true
  },
  "soren2": {
    "name": "Sylthea Ruin",
    "line": "At 3 stars, the first attack each turn inflicts 1 Poison.",
    "poisonOnHit": 1,
    "poisonOnce": true
  },
  "vance": {
    "name": "Vancelor Ending",
    "line": "At 3 stars, a basic attack against a Branded enemy strikes again for 25% of this unit's attack.",
    "followBrand": 0.25
  },
  "nell": {
    "name": "Nellixa Rally",
    "line": "At 3 stars, the battle starts with 8 Block, and a card that grants Block inflicts Weak for 2 turns. This unit's Resistance increases by 25%.",
    "openShield": 8,
    "blockWeaken": true,
    "res": 0.25
  },
  "orko": {
    "name": "Orvath Aegis",
    "line": "At 3 stars, the battle starts with 8 Block, and a card that grants Block inflicts Weak for 2 turns.",
    "openShield": 8,
    "blockWeaken": true
  },
  "faye": {
    "name": "Fayelin Seal",
    "line": "At 3 stars, Poison, Stun, and Sleep last 1 turn longer.",
    "extendDebuff": true
  },
  "jasper": {
    "name": "Jaspelune Rain",
    "line": "At 3 stars, an assist inflicts Brand for 2 turns.",
    "assistBrand": true
  },
  "rune": {
    "name": "Runethar Reprise",
    "line": "At 3 stars, this unit's Resistance increases by 25%.",
    "res": 0.25
  },
  "cress": {
    "name": "Cressalyth Wellspring",
    "line": "At 3 stars, a heal reduces Stress by 5.",
    "healCalm": 5
  },
  "hal": {
    "name": "Halveric Barrage",
    "line": "At 3 stars, the last hit of a multi-hit attack inflicts Exposed.",
    "finisherVuln": true
  },
  "io": {
    "name": "Iovara Ruin",
    "line": "At 3 stars, the first attack each turn inflicts 1 Poison.",
    "poisonOnHit": 1,
    "poisonOnce": true
  },
  "mattis": {
    "name": "Matthos Ending",
    "line": "At 3 stars, a basic attack against a Branded enemy strikes again for 25% of this unit's attack.",
    "followBrand": 0.25
  },
  "pearl": {
    "name": "Pearlith Rally",
    "line": "At 3 stars, the battle starts with 8 Block, and a card that grants Block inflicts Weak for 2 turns.",
    "openShield": 8,
    "blockWeaken": true
  },
  "stark": {
    "name": "Starkev Aegis",
    "line": "At 3 stars, the battle starts with 8 Block, and a card that grants Block inflicts Weak for 2 turns.",
    "openShield": 8,
    "blockWeaken": true
  },
  "una": {
    "name": "Unavelle Seal",
    "line": "At 3 stars, Poison, Stun, and Sleep last 1 turn longer.",
    "extendDebuff": true
  },
  "wystan": {
    "name": "Wystavar Rain",
    "line": "At 3 stars, an assist inflicts Brand for 2 turns.",
    "assistBrand": true
  },
  "yara": {
    "name": "Yaralith Reprise",
    "line": "At 3 stars, this unit's Resistance increases by 25%.",
    "res": 0.25
  },
  "zeno": {
    "name": "Zenovar Wellspring",
    "line": "At 3 stars, a heal reduces Stress by 5.",
    "healCalm": 5
  },
  "amber": {
    "name": "Amberis Barrage",
    "line": "At 3 stars, the last hit of a multi-hit attack inflicts Exposed. This unit's CRIT Rate increases by 20%.",
    "finisherVuln": true,
    "crit": 0.2
  },
  "beck": {
    "name": "Beckoran Ruin",
    "line": "At 3 stars, the first attack each turn inflicts 1 Poison. This unit's CRIT Rate increases by 20%.",
    "poisonOnHit": 1,
    "poisonOnce": true,
    "crit": 0.2
  },
  "solenne": {
    "name": "Last Light",
    "line": "At 3 stars, Sunfall inflicts Brand. A basic attack against a Branded enemy strikes again for 40% of this unit's attack. This unit's CRIT Rate increases by 20%.",
    "ultBrand": true,
    "followBrand": 0.4,
    "crit": 0.2
  },
  "harren": {
    "name": "Remembered Stone",
    "line": "At 3 stars, the battle starts with 18 Block. The first time Block breaks, 12 Block returns, and a card that grants Block inflicts Weak. This unit's Resistance increases by 25%.",
    "openShield": 18,
    "rebound": 12,
    "blockWeaken": true,
    "res": 0.25
  },
  "ilyra": {
    "name": "Deep Well",
    "line": "At 3 stars, a heal reduces Stress by 8 and fills every ult gauge by 10.",
    "healCalm": 8,
    "healCharge": 10
  },
  "mael": {
    "name": "Late Arrival",
    "line": "At 3 stars, Stun lasts 1 turn longer and also inflicts Exposed.",
    "extendDebuff": true,
    "hexVuln": true
  },
  "seraphine": {
    "name": "Second Turn",
    "line": "At 3 stars, refunding AP fills every ult gauge by 8.",
    "refundCharge": 8
  },
  "nymira": {
    "name": "Night Margin",
    "line": "At 3 stars, Sleep also inflicts Exposed.",
    "hexVuln": true
  },
  "ostara": {
    "name": "First Light",
    "line": "At 3 stars, a heal reduces Stress by 8 and also grants 8 Block.",
    "healCalm": 8,
    "healBlock": 8
  },
  "calyx": {
    "name": "Last Tide",
    "line": "At 3 stars, an attack against an enemy with Weak strikes again for 30% of this unit's attack.",
    "weakFollow": 0.3
  },
  "rivenna": {
    "name": "Second Heat",
    "line": "At 3 stars, refunding AP fills every ult gauge by 8. This unit's CRIT Rate increases by 20%.",
    "refundCharge": 8,
    "crit": 0.2
  },
  "orlath": {
    "name": "Volley",
    "line": "At 3 stars, an assist inflicts Brand.",
    "assistBrand": true
  },
  "halden": {
    "name": "The Wall",
    "line": "At 3 stars, the battle starts with 12 Block, and a card that grants Block inflicts Weak for 2 turns.",
    "openShield": 12,
    "blockWeaken": true
  },
  "saelith": {
    "name": "The Order",
    "line": "At 3 stars, The Order inflicts Exposed before it hits.",
    "leadVuln": "ego"
  },
  "kestrel": {
    "name": "All of It",
    "line": "At 3 stars, this unit's CRIT Rate increases by 15%. An attack against an enemy with Weak strikes again for 20% of this unit's attack.",
    "crit": 0.15,
    "weakFollow": 0.2
  },
  "mirinel": {
    "name": "Close",
    "line": "At 3 stars, a card that inflicts Brand fills this unit's ult gauge by 8.",
    "debuffCharge": 8
  },
  "quillan": {
    "name": "Footnote",
    "line": "At 3 stars, a card that draws reduces Stress by 8.",
    "onDrawCalm": 8
  },
  "linnet": {
    "name": "Stay",
    "line": "At 3 stars, a heal fills every ult gauge by 12.",
    "healCharge": 12
  },
  "selka": {
    "name": "Through",
    "line": "At 3 stars, Poison cards apply 1 extra stack.",
    "poisonBonus": 1
  },
  "tamsin": {
    "name": "The Line",
    "line": "At 3 stars, a card that grants Might fills every ult gauge by 8.",
    "mightCharge": 8
  },
  "joryn": {
    "name": "The Turn",
    "line": "At 3 stars, a skill fills this unit's ult gauge by 10.",
    "skillCharge": 10
  },
  "tessara": {
    "name": "Stay Back",
    "line": "At 3 stars, the first time Block breaks, 8 Block returns. This unit's Resistance increases by 20%.",
    "rebound": 8,
    "res": 0.2
  }
};
