import {
  advantage,
  weeklyBanners,
  PARTY_BUFFS,
  character,
  freshSave,
  GIFTS,
  pool,
  stageById,
  STAGES,
} from "./data.js";
import { storyNode, nodeOpen, repairStoryClears } from "./story.js";
import { floorById, monthId } from "./tower.js";
import { ASCEND_CAPS, COMBOS, ascendPrice, dailyStageById, growRoster, levelCap, skillRank, stageXp, withGrowth } from "./growth.js";
import { PASSIVES } from "./passives.js";
import { bondEventById } from "./events.js";

export const PULL_COST = 160;
export const HARD_PITY = 90;
export const SOFT_PITY = 60;
export const SSR_RATE = 0.008;
export const LEGEND_SHARE = 0.15;
export const SR_RATE = 0.13;
export const HEX_STRESS = 18;
export const SAVE_KEY = "signal-booth-save-v1";
export const BATTLE_KEY = "signal-booth-battle-v1";

export function localDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const GIFT_ZONE = "America/New_York";

function etParts(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: GIFT_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

function shiftIso(iso, days) {
  const [y, m, d] = iso.split("-").map(Number);
  const cursor = new Date(Date.UTC(y, m - 1, d));
  cursor.setUTCDate(cursor.getUTCDate() + days);
  const month = String(cursor.getUTCMonth() + 1).padStart(2, "0");
  const day = String(cursor.getUTCDate()).padStart(2, "0");
  return `${cursor.getUTCFullYear()}-${month}-${day}`;
}

export function giftDayId(now = new Date()) {
  const parts = etParts(now);
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const today = `${parts.year}-${parts.month}-${parts.day}`;
  return minutes < 12 * 60 ? shiftIso(today, -1) : today;
}

export function nextGiftAt(now = new Date()) {
  const parts = etParts(now);
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const seconds = Number(parts.second || 0);
  let day = `${parts.year}-${parts.month}-${parts.day}`;
  if (minutes > 12 * 60 || (minutes === 12 * 60 && seconds > 0)) day = shiftIso(day, 1);
  const [y, m, d] = day.split("-").map(Number);
  const want = Date.UTC(y, m - 1, d, 12, 0, 0);
  let guess = new Date(want);
  for (let i = 0; i < 4; i += 1) {
    const wall = etParts(guess);
    const wallUtc = Date.UTC(Number(wall.year), Number(wall.month) - 1, Number(wall.day), Number(wall.hour), Number(wall.minute), Number(wall.second || 0));
    guess = new Date(guess.getTime() + (want - wallUtc));
  }
  return guess;
}

export function yesterdayOf(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return localDate(dt);
}

export function nextSsrChance(pity) {
  const p = pity + 1;
  if (p >= HARD_PITY) return 1;
  if (p >= SOFT_PITY) return Math.min(1, SSR_RATE + (p - (SOFT_PITY - 1)) * 0.02);
  return SSR_RATE;
}

export const STAR_STEPS = [1, 4, 9, 16, 25];
export const BOND_NEED = 400;
export const BOND_STORY_PCT = 8;

export function passiveFor(id) {
  return PASSIVES[id] || null;
}

export function starsOf(copies) {
  const n = Math.max(0, copies || 0);
  let stars = 1;
  for (let i = 0; i < STAR_STEPS.length; i += 1) {
    if (n >= STAR_STEPS[i]) stars = i + 1;
  }
  return n ? stars : 1;
}

export function nextStarCopies(copies) {
  const stars = starsOf(copies);
  if (stars >= STAR_STEPS.length) return null;
  return STAR_STEPS[stars];
}

export function bonusPercent(owned) {
  if (!owned) return 0;
  return (starsOf(owned.copies) - 1) * 12 + (owned.rooms || 0) * BOND_STORY_PCT;
}

export function scaleAmount(value, mult = 1) {
  if (value == null) return value;
  return Math.round(value * mult);
}

export function blockAmount(card, unit) {
  if (!card?.shield || !unit) return 0;
  return Math.max(0, Math.round((unit.def || 0) * card.shield / 100));
}

export function healAmount(card, unit) {
  if (!card?.heal || !unit) return 0;
  return Math.max(0, Math.round((unit.maxHp || 0) * card.heal / 100));
}

export function unitStats(def, owned) {
  const stars = starsOf(owned?.copies ?? 1);
  const rooms = owned?.rooms ?? 0;
  const level = Math.max(1, owned?.level || 1);
  const ascend = owned?.ascend || 0;
  const legend = def.legend ? 0.2 : 0;
  const mult = 1 + (stars - 1) * 0.12 + rooms * (BOND_STORY_PCT / 100) + (level - 1) * 0.03 + ascend * 0.15 + legend;
  const passive = stars >= 3 ? PASSIVES[def.id] : null;
  const hpMult = mult * (1 + (passive?.hp || 0));
  const atkMult = mult * (1 + (passive?.atk || 0));
  return {
    maxHp: Math.round(def.maxHp * hpMult),
    atk: Math.round(def.atk * atkMult),
    def: Math.round((ROLE_DEF[def.role] || 48) * mult),
    crit: Math.min(0.8, 0.15 + (passive?.crit || 0)),
    critDmg: 1.3,
    res: Math.min(0.6, 0.1 + (passive?.res || 0)),
    mult,
    level,
    passive,
  };
}

const DEF_K = 200;

const ROLE_DEF = {
  Guardian: 96,
  Controller: 62,
  Healer: 54,
  Support: 50,
  Attacker: 36,
};

const ENEMY_DEF = {
  bulwark: 84,
  boss: 72,
  medic: 48,
  hexer: 44,
  striker: 34,
};

function battleUnit(member, battle) {
  if (!member) return member;
  const crit = Math.min(0.8, (member.crit ?? 0.15) + ((battle?.critUp || 0) > 0 ? PARTY_BUFFS.crit : 0));
  const critDmg = (member.critDmg ?? 1.3) + ((battle?.critDmgUp || 0) > 0 ? PARTY_BUFFS.critDmg : 0);
  const def = Math.round((member.def || 0) * (1 + ((battle?.defUp || 0) > 0 ? PARTY_BUFFS.def : 0)));
  const res = Math.min(0.6, (member.res ?? 0.1) + ((battle?.resUp || 0) > 0 ? PARTY_BUFFS.res : 0));
  return { ...member, crit, critDmg, def, res };
}

export function partyGuard(party, battle) {
  if (!party?.length) return { def: 0, guardScale: 1 };
  const sheets = party.map((member) => battleUnit(member, battle));
  const def = sheets.reduce((sum, member) => sum + (member.def || 0), 0);
  return { def, guardScale: sheets.length };
}

const RESIST_FLOOR = 0.15;

export function strikeDamage(raw, attacker, defender, rollCrit = false) {
  const def = Math.max(0, defender?.def || 0);
  const scale = Math.max(1, defender?.guardScale || 1);
  const k = DEF_K * scale;
  let amount = Math.max(0, raw) * (k / (k + def));
  let crit = false;
  const forced = rollCrit === "yes";
  const rolling = rollCrit === true;
  if (forced || (rolling && Math.random() < (attacker?.crit ?? 0))) {
    crit = true;
    amount *= attacker?.critDmg ?? 1.3;
  }
  return { amount: Math.max(0, Math.round(amount)), crit };
}

function resistChance(defender) {
  let res = defender?.res ?? RESIST_FLOOR;
  if ((defender?.exposed || 0) > 0) res -= PARTY_BUFFS.shred;
  return Math.min(0.85, Math.max(RESIST_FLOOR, res));
}

function noteResist(battle, who, kind, events, foeId, intent) {
  const name = who?.name || "You";
  const text = `${name} resisted ${kind}`;
  events.push({ text, tone: "resist", resist: true, who: name, kind, foeId, intent });
  pushLog(battle, `${text}.`);
}

function partyResists(battle, kind, events, foeId, intent) {
  for (const member of battle.party) {
    const sheet = battleUnit(member, battle);
    if (Math.random() < resistChance(sheet)) {
      noteResist(battle, sheet, kind, events, foeId, intent);
      return true;
    }
  }
  return false;
}

function landDebuff(battle, defender, kind, events, apply, foeId, intent) {
  if (Math.random() < resistChance(defender)) {
    noteResist(battle, defender, kind, events, foeId, intent);
    return false;
  }
  apply();
  return true;
}

function enemyDefense(enemy, scale) {
  const base = ENEMY_DEF[enemy.role] || 42;
  const curve = 1 + ((scale?.guard || 1) - 1) * 0.22;
  return {
    def: Math.max(1, Math.round(base * curve)),
    res: 0.1,
    crit: 0.1,
    critDmg: 1.2,
  };
}

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function rollOne(progress) {
  let pity = progress.pity + 1;
  let ten = progress.ten + 1;
  let guarantee = progress.guarantee;
  const ssrP = nextSsrChance(progress.pity);
  const roll = Math.random();
  let rarity = "R";
  if (roll < ssrP) rarity = "SSR";
  else if (ten >= 10 || roll < ssrP + SR_RATE) rarity = "SR";

  const featuredIds = weeklyBanners()
    .map((banner) => banner.featured)
    .filter((id) => {
      const unit = character(id);
      return unit && unit.rarity === "SSR" && unit.legend !== true;
    });
  let id;
  if (rarity === "SSR") {
    const rateUp = guarantee || Math.random() < 0.5;
    const win = rateUp && featuredIds.length > 0;
    const legends = pool("SSR").filter((c) => c.legend === true);
    const off = pool("SSR").filter((c) => c.legend !== true && !featuredIds.includes(c.id));
    const plain = pool("SSR").filter((c) => c.legend !== true);
    if (win) id = featuredIds[Math.floor(Math.random() * featuredIds.length)];
    else if (legends.length && Math.random() < LEGEND_SHARE) id = pick(legends).id;
    else id = (off.length ? pick(off) : pick(plain.length ? plain : pool("SSR"))).id;
    pity = 0;
    ten = 0;
    guarantee = !win;
  } else if (rarity === "SR") {
    id = pick(pool("SR")).id;
    ten = 0;
  } else {
    id = pick(pool("R")).id;
  }
  return { id, rarity, pity, ten, guarantee };
}

function overflowGift(rarity) {
  if (rarity === "SSR") return "keepsake";
  if (rarity === "SR") return "bouquet";
  return "fanmail";
}

function addPull(roster, gifts, id) {
  const owned = roster[id];
  if (!owned) {
    roster[id] = { copies: 1, rooms: 0, bond: 0, level: 1, xp: 0, skills: {} };
    return { isNew: true, starUp: false, overflow: false, copies: 1 };
  }
  const before = starsOf(owned.copies);
  const copies = owned.copies + 1;
  roster[id] = { ...owned, copies };
  if (copies > STAR_STEPS[STAR_STEPS.length - 1]) {
    const gift = overflowGift(character(id)?.rarity);
    gifts[gift] = (gifts[gift] || 0) + 1;
    return { isNew: false, starUp: false, overflow: true, gift, copies };
  }
  return { isNew: false, starUp: starsOf(copies) > before, overflow: false, copies };
}

export function pull(state, count) {
  if (count !== 1 && count !== 10) return state;
  const cost = PULL_COST * count;
  if (state.applause < cost) return state;
  let pity = state.pity;
  let ten = state.ten;
  let guarantee = state.guarantee;
  const roster = { ...state.roster };
  const gifts = { ...state.gifts };
  const cards = [];
  for (let i = 0; i < count; i++) {
    const rolled = rollOne({ pity, ten, guarantee, banner: state.banner });
    pity = rolled.pity;
    ten = rolled.ten;
    guarantee = rolled.guarantee;
    const meta = addPull(roster, gifts, rolled.id);
    cards.push({ id: rolled.id, rarity: rolled.rarity, ...meta });
  }
  return {
    ...state,
    applause: state.applause - cost,
    pity,
    ten,
    guarantee,
    roster,
    gifts,
    pulls: state.pulls + count,
    history: [...cards.map((c) => ({ id: c.id, rarity: c.rarity })), ...(state.history || [])].slice(0, 50),
    reveal: { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, cards },
  };
}

let cardUid = 1;

function stamp(card, owner) {
  return {
    ...card,
    uid: cardUid++,
    ownerId: owner.id,
    ownerName: owner.name,
    element: owner.element,
  };
}

function makeDeck(party) {
  const cards = [];
  for (const member of party) {
    for (const card of member.cards) {
      if (card.kind === "ego") continue;
      cards.push(stamp(card, member));
      cards.push(stamp(card, member));
    }
  }
  return shuffle(cards);
}

export function ultCap(member) {
  const ego = (member.cards || []).find((card) => card.kind === "ego");
  if (!ego) return 100;
  let weight = 40;
  if (ego.ratio) weight += ego.ratio * 24;
  if (ego.aoe) weight += 18;
  if (ego.stun) weight += 16;
  if (ego.sleep) weight += 12;
  if (ego.weaken || ego.vuln) weight += 8;
  if (ego.heal) weight += Math.min(22, ego.heal);
  if (ego.shield) weight += Math.min(18, Math.round(ego.shield * 0.6));
  if (typeof ego.stress === "number" && ego.stress < 0) weight += Math.min(16, Math.round(-ego.stress * 0.4));
  const role = { Attacker: 1.15, Controller: 1.08, Guardian: 0.9, Support: 0.86, Healer: 0.82 };
  return Math.round(Math.max(90, Math.min(160, weight * (role[member.role] || 1))) / 10) * 10;
}

export function ultGain(member, card) {
  const cap = member?.ultMax || ultCap(member || { cards: [], role: "" });
  const pace = cap >= 140 ? 8 : cap >= 120 ? 10 : cap >= 100 ? 13 : 16;
  if (!card) return Math.max(4, Math.round(pace * 0.4));
  return pace + (card.cost || 1) * 2;
}

function gainEnergy(battle, id, amount) {
  if (!battle.energy) battle.energy = {};
  const member = battle.party.find((row) => row.id === id);
  const cap = member?.ultMax || ultCap(member || { cards: [], role: "" });
  battle.energy[id] = Math.min(cap, (battle.energy[id] || 0) + amount);
}

function drawCards(battle, n) {
  for (let i = 0; i < n; i++) {
    if (battle.draw.length === 0) {
      battle.draw = shuffle(battle.discard);
      battle.discard = [];
    }
    if (battle.draw.length === 0) break;
    battle.hand.push(battle.draw.pop());
  }
}

export function partyMembers(save) {
  return (save.party ?? [])
    .filter((id) => id && save.roster[id] && character(id))
    .map((id) => {
      const def = character(id);
      const owned = save.roster[id];
      const cards = def.cards.map((card) => withGrowth({ ...card, ...(COMBOS[card.id] || {}) }, skillRank(owned, card.id)));
      const member = { ...def, cards, ...unitStats(def, owned) };
      member.ultMax = ultCap(member);
      return member;
    });
}

export function resolveStage(save, stageId) {
  return storyNode(stageId) || floorById(save?.towerWeek || monthId(), stageId) || stageById(stageId) || dailyStageById(stageId) || bondEventById(stageId);
}

const STAR_SCALE = {
  1: { hp: 1.05, atk: 1, guard: 0.95 },
  2: { hp: 1.85, atk: 1.55, guard: 1.4 },
  3: { hp: 3.1, atk: 2.35, guard: 2.05 },
  4: { hp: 5.2, atk: 3.5, guard: 2.9 },
  5: { hp: 8.4, atk: 5, guard: 4 },
};

function threatScale(stage) {
  const stars = Math.max(1, Math.min(5, Number(stage?.stars) || 1));
  return STAR_SCALE[stars];
}

export function startBattle(save, stageId) {
  const stage = resolveStage(save, stageId);
  if (!stage) return null;
  const party = partyMembers(save);
  const scale = threatScale(stage);
  const maxHp = party.reduce((sum, member) => sum + member.maxHp, 0);
  const battle = {
    stageId,
    party,
    hp: maxHp,
    maxHp,
    shield: 0,
    stress: 0,
    poison: 0,
    stun: 0,
    sleep: 0,
    breakdown: false,
    ap: 3,
    turn: 1,
    hand: [],
    draw: makeDeck(party),
    discard: [],
    enemies: stage.enemies.slice(0, 3).map((enemy) => ({
      ...enemy,
      maxHp: Math.round(enemy.maxHp * scale.hp),
      atk: Math.max(1, Math.round(enemy.atk * scale.atk)),
      guard: Math.round((enemy.guard || 0) * scale.guard),
      ...enemyDefense(enemy, scale),
      hp: Math.round(enemy.maxHp * scale.hp),
      shield: 0,
      weak: 0,
      vuln: 0,
      poison: 0,
      stun: 0,
      sleep: 0,
      step: 0,
    })),
    egoUsed: {},
    energy: Object.fromEntries(party.map((member) => [member.id, member.passive?.energy || 0])),
    result: null,
    log: [`${stage.name}. Block if they're about to hit.`],
  };
  battle.shield = Math.min(28, party.reduce((sum, member) => sum + (member.passive?.openShield || 0), 0));
  if (battle.shield > 0) pushLog(battle, `Opening block ${battle.shield}.`);
  drawCards(battle, 5);
  return battle;
}

export function intentInfo(enemy, defender) {
  const intent = enemy.pattern[enemy.step % enemy.pattern.length];
  if (intent === "attack") {
    let amount = enemy.weak > 0 ? Math.round(enemy.atk * 0.7) : enemy.atk;
    if (defender) amount = strikeDamage(amount, enemy, defender, false).amount;
    return { intent, label: `${moveName(enemy, "Strike")} ${amount}`, amount };
  }
  if (intent === "defend") {
    const amount = enemy.guard || 12;
    return { intent, label: `${moveName(enemy, "Guard")} ${amount}`, amount };
  }
  if (intent === "mend") {
    const amount = Math.max(8, Math.round((enemy.atk || 10) * 0.85));
    return { intent, label: `${moveName(enemy, "Mend")} ${amount}`, amount };
  }
  return { intent, label: moveName(enemy, `Hex +${HEX_STRESS} stress`), amount: HEX_STRESS };
}

function moveName(enemy, fallback) {
  const index = enemy.step % (enemy.pattern?.length || 1);
  return enemy.kit?.[index]?.name || fallback;
}

export function forecast(enemy, defender) {
  return enemy.pattern.map((_, index) => intentInfo({ ...enemy, step: enemy.step + index }, defender));
}

function markFoe(battle, foe, played, dealt, events) {
  if (dealt > 0) foe.sleep = 0;
  if (played.poison) {
    landDebuff(battle, foe, "Poison", events, () => {
      foe.poison = (foe.poison || 0) + played.poison;
    }, foe.id);
  }
  if (played.stun) {
    landDebuff(battle, foe, "Stun", events, () => {
      foe.stun = Math.max(foe.stun || 0, played.stun);
    }, foe.id);
  }
  if (played.sleep && foe.hp > 0 && dealt === 0) {
    landDebuff(battle, foe, "Sleep", events, () => {
      foe.sleep = Math.max(foe.sleep || 0, played.sleep);
    }, foe.id);
  }
  if (played.shred) {
    landDebuff(battle, foe, "Shred", events, () => {
      foe.exposed = Math.max(foe.exposed || 0, 2);
    }, foe.id);
  }
}

function stampDebuffs(battle, foe, played, events) {
  if (played.weaken) {
    landDebuff(battle, foe, "Weak", events, () => {
      foe.weak = Math.max(foe.weak, 2);
    }, foe.id);
  }
  if (played.vuln) {
    landDebuff(battle, foe, "Exposed", events, () => {
      foe.vuln = Math.max(foe.vuln, 2);
    }, foe.id);
  }
  if (played.brand) {
    landDebuff(battle, foe, "Brand", events, () => {
      foe.brand = Math.max(foe.brand || 0, 2);
    }, foe.id);
  }
}

function grantBuffs(battle, played, events) {
  if (played.might) battle.might = Math.max(battle.might || 0, played.might);
  const notes = [];
  const from = played.ownerName ? `${played.ownerName}'s ${played.name}` : played.name;
  if (played.crit) {
    battle.critUp = Math.max(battle.critUp || 0, played.crit);
    battle.critSrc = from;
    notes.push(`${from}: crit chance +${Math.round(PARTY_BUFFS.crit * 100)}% for ${played.crit} turn${played.crit === 1 ? "" : "s"}`);
  }
  if (played.critDmg) {
    battle.critDmgUp = Math.max(battle.critDmgUp || 0, played.critDmg);
    battle.critDmgSrc = from;
    notes.push(`${from}: crit damage +${Math.round(PARTY_BUFFS.critDmg * 100)}% for ${played.critDmg} turn${played.critDmg === 1 ? "" : "s"}`);
  }
  if (played.defUp) {
    battle.defUp = Math.max(battle.defUp || 0, played.defUp);
    battle.defSrc = from;
    notes.push(`${from}: defense +${Math.round(PARTY_BUFFS.def * 100)}% for ${played.defUp} turn${played.defUp === 1 ? "" : "s"}`);
  }
  if (played.res) {
    battle.resUp = Math.max(battle.resUp || 0, played.res);
    battle.resSrc = from;
    notes.push(`${from}: resistance +${Math.round(PARTY_BUFFS.res * 100)}% for ${played.res} turn${played.res === 1 ? "" : "s"}`);
  }
  for (const note of notes) {
    events.push({ text: note, tone: "good" });
    pushLog(battle, `${note}.`);
  }
}

function pushLog(battle, line) {
  battle.log = [...battle.log, line].slice(-18);
}

function chargeAll(battle, amount) {
  if (!amount) return;
  for (const member of battle.party) gainEnergy(battle, member.id, amount);
}

function rememberFoes(battle, indexes) {
  for (const index of indexes) {
    const foe = battle.enemies[index];
    if (!foe) continue;
    foe._hadBrand = (foe.brand || 0) > 0;
    foe._hadPoison = (foe.poison || 0) > 0;
    foe._hadWeak = (foe.weak || 0) > 0;
  }
}

function leadVuln(battle, owner, played, indexes) {
  const p = owner?.passive;
  if (!p?.leadVuln) return;
  const egoOnly = p.leadVuln === "ego";
  if (egoOnly && played.kind !== "ego") return;
  if (!egoOnly && !(played.aoe || played.kind === "ego")) return;
  for (const index of indexes) {
    const foe = battle.enemies[index];
    if (foe && foe.hp > 0) foe.vuln = Math.max(foe.vuln || 0, 2);
  }
}

function rideFoe(battle, owner, played, foe, strike, events) {
  const p = owner?.passive;
  if (!p || !foe) return;
  const basic = played.kind !== "ego" && played.ratio;
  if (basic && p.followBrand && foe._hadBrand && !played.follow && foe.hp > 0) {
    strike(foe, owner, p.followBrand, owner.name + " follows up");
    foe.brand = Math.max(0, (foe.brand || 0) - 1);
  }
  if (basic && p.poisonFollow && foe._hadPoison && foe.hp > 0) {
    strike(foe, owner, p.poisonFollow, owner.name + " follows up");
  }
  if (basic && p.weakFollow && foe._hadWeak && foe.hp > 0) {
    strike(foe, owner, p.weakFollow, owner.name + " follows up");
  }
  if (played.ratio && p.brandOnHit && !played.brand && (foe.brand || 0) <= 0) {
    landDebuff(battle, foe, "Brand", events, () => {
      foe.brand = 2;
    }, foe.id);
  }
  if (played.ratio && p.poisonOnHit) {
    if (p.poisonOnce) {
      battle.poisonedBy = battle.poisonedBy || {};
      const key = owner.id + ":" + battle.turn;
      if (!battle.poisonedBy[key]) {
        battle.poisonedBy[key] = true;
        landDebuff(battle, foe, "Poison", events, () => {
          foe.poison = (foe.poison || 0) + p.poisonOnHit;
        }, foe.id);
      }
    } else {
      landDebuff(battle, foe, "Poison", events, () => {
        foe.poison = (foe.poison || 0) + p.poisonOnHit;
      }, foe.id);
    }
  }
  if (played.poison && p.poisonBonus) {
    landDebuff(battle, foe, "Poison", events, () => {
      foe.poison = (foe.poison || 0) + p.poisonBonus;
    }, foe.id);
  }
  if (p.extendDebuff) {
    if (played.stun) foe.stun = (foe.stun || 0) + 1;
    if (played.sleep) foe.sleep = (foe.sleep || 0) + 1;
    if (played.poison) foe.poison = (foe.poison || 0) + 1;
  }
  if (p.hexVuln && (played.stun || played.sleep) && foe.hp > 0) {
    landDebuff(battle, foe, "Exposed", events, () => {
      foe.vuln = Math.max(foe.vuln || 0, 2);
    }, foe.id);
  }
  if (p.finisherVuln && (played.hits || 1) > 1 && foe.hp > 0) {
    landDebuff(battle, foe, "Exposed", events, () => {
      foe.vuln = Math.max(foe.vuln || 0, 2);
    }, foe.id);
  }
  if (p.assistBrand && played.assist) {
    landDebuff(battle, foe, "Brand", events, () => {
      foe.brand = Math.max(foe.brand || 0, 2);
    }, foe.id);
  }
  if (p.ultBrand && played.kind === "ego" && foe.hp > 0) {
    landDebuff(battle, foe, "Brand", events, () => {
      foe.brand = Math.max(foe.brand || 0, 2);
    }, foe.id);
  }
  if (p.aoeWeak && played.aoe && !played.weaken && foe.hp > 0) {
    landDebuff(battle, foe, "Weak", events, () => {
      foe.weak = Math.max(foe.weak || 0, 2);
    }, foe.id);
  }
}

function rideCard(battle, owner, played, events, shielded, healed) {
  const p = owner?.passive;
  if (!p) return;
  if (healed && p.healCalm) {
    const calm = Math.min(battle.stress, p.healCalm);
    battle.stress -= calm;
    if (calm) events.push({ text: calm + " stress lifts", tone: "calm", amount: calm });
  }
  if (healed && p.healCharge) {
    chargeAll(battle, p.healCharge);
    events.push({ text: "Ult gauge +" + p.healCharge, tone: "good" });
  }
  if (healed && p.healBlock) {
    battle.shield += p.healBlock;
    events.push({ text: p.healBlock + " block", tone: "shield", amount: p.healBlock });
  }
  if (shielded && p.blockWeaken) {
    const foe = battle.enemies.find((row) => row.hp > 0);
    if (foe) {
      landDebuff(battle, foe, "Weak", events, () => {
        foe.weak = Math.max(foe.weak || 0, 2);
      }, foe.id);
    }
  }
  if (played.might && p.mightCharge) {
    chargeAll(battle, p.mightCharge);
    events.push({ text: "Ult gauge +" + p.mightCharge, tone: "good" });
  }
  if ((played.kind === "skill" || played.kind === "ego") && p.skillCharge) gainEnergy(battle, owner.id, p.skillCharge);
  if (played.draw && p.onDrawCalm) {
    const calm = Math.min(battle.stress, p.onDrawCalm);
    battle.stress -= calm;
    if (calm) events.push({ text: calm + " stress lifts", tone: "calm", amount: calm });
  }
  if (played.again && p.refundCharge) {
    chargeAll(battle, p.refundCharge);
    events.push({ text: "Ult gauge +" + p.refundCharge, tone: "good" });
  }
  if (p.refundSkill && played.kind === "skill" && !played.again) {
    battle.refunded = battle.refunded || {};
    const key = owner.id + ":" + battle.turn;
    if (!battle.refunded[key]) {
      battle.refunded[key] = true;
      battle.ap = Math.min(3, battle.ap + 1);
      events.push({ text: "1 AP refunded", tone: "good" });
    }
  }
  if (p.debuffCharge && (played.poison || played.stun || played.sleep || played.weaken || played.vuln || played.brand)) {
    gainEnergy(battle, owner.id, p.debuffCharge);
  }
}

export function previewDamage(card, owner, enemy, breakdown, mods) {
  if (!card?.ratio || !owner) return null;
  let amount = Math.round(owner.atk * card.ratio);
  if (breakdown) amount = Math.round(amount * 0.65);
  if (mods?.soft) amount = Math.round(amount * 0.7);
  if (mods?.might) amount = Math.round(amount * 1.3);
  if (enemy) {
    const adv = advantage(owner.element, enemy.element);
    if (adv > 0) amount = Math.round(amount * 1.35);
    if (adv < 0) amount = Math.round(amount * 0.8);
    if (enemy.vuln > 0) amount = Math.round(amount * 1.3);
    amount = strikeDamage(amount, owner, enemy, false).amount;
    amount = Math.max(0, amount - (enemy.shield || 0));
  }
  return amount;
}

export function playCard(battle, handIndex, targetIndex) {
  if (!battle || battle.result) return { battle, events: [] };
  const card = battle.hand[handIndex];
  if (!card) return { battle, events: [], error: "nocard" };
  if (battle.ap < card.cost) return { battle, events: [], error: "ap" };
  if (card.once && (battle.egoUsed[card.ownerId] || battle.breakdown)) {
    return { battle, events: [], error: "ego" };
  }
  const living = battle.enemies.map((enemy, index) => ({ enemy, index })).filter((row) => row.enemy.hp > 0);
  let target = targetIndex;
  const needsTarget = (card.ratio || card.poison || card.stun || card.sleep) && !card.aoe;
  if (needsTarget) {
    if (target == null || !battle.enemies[target] || battle.enemies[target].hp <= 0) {
      target = living[0]?.index ?? null;
    }
    if (target == null) return { battle, events: [], error: "target" };
  }

  const next = clone(battle);
  const played = next.hand[handIndex];
  const owner = next.party.find((member) => member.id === played.ownerId);
  next.ap -= played.cost;
  next.hand.splice(handIndex, 1);
  if (!played.once) next.discard.push(played);
  if (played.once) next.egoUsed[played.ownerId] = true;

  const events = [];
  grantBuffs(next, played, events);
  if (played.charge) {
    if (!next.energy) next.energy = {};
    for (const member of next.party) {
      const cap = member.ultMax || 100;
      next.energy[member.id] = Math.min(cap, (next.energy[member.id] || 0) + played.charge);
    }
    events.push({ text: `Ult gauge +${played.charge}`, tone: "good" });
  }
  if (played.again) next.ap = Math.min(3, next.ap + 1);
  if (played.kindle) next.embers = (next.embers || 0) + (played.kindle === true ? 1 : played.kindle);
  const aims = played.ratio || played.poison || played.stun || played.sleep;
  const foeIndexes = played.aoe
    ? next.enemies.map((enemy, index) => (enemy.hp > 0 ? index : -1)).filter((index) => index >= 0)
    : aims
      ? [target]
      : [];
  rememberFoes(next, foeIndexes);
  leadVuln(next, owner, played, foeIndexes);

  function strike(foe, striker, ratio, label, roll = true) {
    let amount = Math.round(striker.atk * ratio);
    if (next.breakdown) amount = Math.round(amount * 0.65);
    if (next.soft > 0) amount = Math.round(amount * 0.7);
    if (next.might > 0) amount = Math.round(amount * 1.3);
    const adv = advantage(striker.element, foe.element);
    if (adv > 0) amount = Math.round(amount * 1.35);
    if (adv < 0) amount = Math.round(amount * 0.8);
    if (foe.vuln > 0) amount = Math.round(amount * 1.3);
    const hit = strikeDamage(amount, battleUnit(striker, next), foe, roll);
    amount = hit.amount;
    const blocked = Math.min(foe.shield, amount);
    foe.shield -= blocked;
    const dealt = amount - blocked;
    foe.hp = Math.max(0, foe.hp - dealt);
    const text = hit.crit
      ? `${striker.name} critical hit ${foe.name} for ${dealt} with ${label}.`
      : adv > 0
        ? `${striker.name} hit ${foe.name}'s weakness for ${dealt} with ${label}.`
        : adv < 0
          ? `${striker.name}'s ${label} glanced off ${foe.name} for ${dealt}.`
          : `${striker.name} hit ${foe.name} for ${dealt} with ${label}.`;
    events.push({
      text,
      tone: hit.crit ? "crit" : adv > 0 ? "good" : "hit",
      amount: dealt,
      crit: hit.crit,
      who: striker.name,
      target: foe.name,
      kind: label,
    });
    pushLog(next, text);
    return dealt;
  }

  if (played.ratio) {
    const swings = Math.max(1, played.hits || 1);
    const critRoll = Math.random() < (battleUnit(owner, next).crit ?? 0) ? "yes" : "no";
    for (const index of foeIndexes) {
      const foe = next.enemies[index];
      let dealt = 0;
      for (let swing = 0; swing < swings && foe.hp > 0; swing += 1) {
        dealt += strike(foe, owner, played.ratio, played.name, critRoll);
      }
      if (played.follow && foe.brand > 0 && foe.hp > 0) {
        const ratio = played.follow === true ? 0.5 : played.follow;
        strike(foe, owner, ratio, `${played.name} follow-up`);
        foe.brand -= 1;
      }
      if (played.fan && next.embers > 0 && foe.hp > 0) {
        strike(foe, owner, 0.2 * next.embers, `${played.name} fan`);
      }
      if (played.assist && foe.hp > 0) {
        const ally = next.party.find((member) => member.id !== owner.id) || owner;
        strike(foe, ally, 0.5, `${ally.name} assists`);
      }
      stampDebuffs(next, foe, played, events);
      markFoe(next, foe, played, dealt, events);
      rideFoe(next, owner, played, foe, strike, events);
    }
    if (played.fan) next.embers = 0;
  } else {
    for (const index of foeIndexes) {
      const foe = next.enemies[index];
      if (!foe || foe.hp <= 0) continue;
      stampDebuffs(next, foe, played, events);
      markFoe(next, foe, played, 0, events);
      rideFoe(next, owner, played, foe, strike, events);
    }
  }

  const mult = owner?.mult ?? 1;
  const shieldGain = blockAmount(played, owner);
  const healGain = healAmount(played, owner);
  const stressGain = scaleAmount(played.stress, mult);
  if (shieldGain) {
    next.shield += shieldGain;
    events.push({ text: `${shieldGain} block`, tone: "shield", amount: shieldGain });
    pushLog(next, `${owner.name} raises ${shieldGain} block.`);
  }
  if (healGain) {
    const before = next.hp;
    next.hp = Math.min(next.maxHp, next.hp + healGain);
    const gained = next.hp - before;
    if (gained > 0) {
      events.push({ text: `+${gained} health`, tone: "heal", amount: gained });
      pushLog(next, `${played.name} restores ${gained} health.`);
    }
  }
  rideCard(next, owner, played, events, Boolean(shieldGain), Boolean(healGain));
  if (stressGain) {
    next.stress = Math.max(0, Math.min(100, next.stress + stressGain));
    events.push({
      text: stressGain < 0 ? `${-stressGain} stress lifts` : `Stress +${stressGain}`,
      tone: stressGain < 0 ? "calm" : "stress",
      amount: Math.abs(stressGain),
    });
    pushLog(next, stressGain < 0 ? `${-stressGain} stress lifts.` : `Stress climbs ${stressGain}.`);
  }
  if (played.draw) drawCards(next, played.draw);
  if (owner?.passive?.mend && events.some((event) => event.amount > 0 && (event.tone === "hit" || event.tone === "good"))) {
    const before = next.hp;
    next.hp = Math.min(next.maxHp, next.hp + owner.passive.mend);
    const gained = next.hp - before;
    if (gained > 0) {
      events.push({ text: `+${gained} health`, tone: "heal", amount: gained });
      pushLog(next, `${owner.name} restores ${gained} health.`);
    }
  }

  if (next.enemies.every((enemy) => enemy.hp <= 0)) {
    next.result = "win";
    pushLog(next, "That's done.");
    events.push({ text: "Stage clear", tone: "good" });
  }
  if (played.kind !== "ego" && owner) gainEnergy(next, owner.id, ultGain(owner, played));
  return { battle: next, events };
}

function resolveTarget(battle, card, targetIndex) {
  const living = battle.enemies.map((enemy, index) => ({ enemy, index })).filter((row) => row.enemy.hp > 0);
  const needsTarget = (card.ratio || card.poison || card.stun || card.sleep) && !card.aoe;
  if (!needsTarget) return targetIndex;
  if (targetIndex == null || !battle.enemies[targetIndex] || battle.enemies[targetIndex].hp <= 0) {
    return living[0]?.index ?? null;
  }
  return targetIndex;
}

export function playUlt(battle, memberId, targetIndex) {
  if (!battle || battle.result) return { battle, events: [], error: "done" };
  if (battle.breakdown) return { battle, events: [], error: "ego" };
  const owner = battle.party.find((member) => member.id === memberId);
  const ego = owner?.cards.find((card) => card.kind === "ego");
  const cap = owner?.ultMax || 100;
  if (!owner || !ego || (battle.energy?.[memberId] || 0) < cap) return { battle, events: [], error: "energy" };
  const target = resolveTarget(battle, ego, targetIndex);
  if ((ego.ratio || ego.poison || ego.stun || ego.sleep) && !ego.aoe && target == null) {
    return { battle, events: [], error: "target" };
  }
  const next = clone(battle);
  if (!next.energy) next.energy = {};
  next.energy[memberId] = 0;
  const played = {
    ...ego,
    ownerId: owner.id,
    ownerName: owner.name,
    element: owner.element,
  };
  const events = [];
  const caster = next.party.find((member) => member.id === owner.id);
  grantBuffs(next, played, events);
  if (played.charge) {
    chargeAll(next, played.charge);
    events.push({ text: `Ult gauge +${played.charge}`, tone: "good" });
    pushLog(next, `Ult gauge +${played.charge}.`);
  }
  if (played.again) next.ap = Math.min(3, next.ap + 1);
  const aims = played.ratio || played.poison || played.stun || played.sleep;
  const foeIndexes = played.aoe
    ? next.enemies.map((enemy, index) => (enemy.hp > 0 ? index : -1)).filter((index) => index >= 0)
    : aims
      ? [target]
      : [];
  rememberFoes(next, foeIndexes);
  leadVuln(next, caster, played, foeIndexes);

  function strike(foe, striker, ratio, label) {
    let amount = Math.round(striker.atk * ratio);
    if (next.breakdown) amount = Math.round(amount * 0.65);
    if (next.soft > 0) amount = Math.round(amount * 0.7);
    if (next.might > 0) amount = Math.round(amount * 1.3);
    const adv = advantage(striker.element, foe.element);
    if (adv > 0) amount = Math.round(amount * 1.35);
    if (adv < 0) amount = Math.round(amount * 0.8);
    if (foe.vuln > 0) amount = Math.round(amount * 1.3);
    const hit = strikeDamage(amount, battleUnit(striker, next), foe, true);
    amount = hit.amount;
    const blocked = Math.min(foe.shield, amount);
    foe.shield -= blocked;
    const dealt = amount - blocked;
    foe.hp = Math.max(0, foe.hp - dealt);
    const text = hit.crit
      ? `${striker.name} critical hit ${foe.name} for ${dealt} with ${label}.`
      : adv > 0
        ? `${striker.name} hit ${foe.name}'s weakness for ${dealt} with ${label}.`
        : adv < 0
          ? `${striker.name}'s ${label} glanced off ${foe.name} for ${dealt}.`
          : `${striker.name} hit ${foe.name} for ${dealt} with ${label}.`;
    events.push({
      text,
      tone: hit.crit ? "crit" : adv > 0 ? "good" : "hit",
      amount: dealt,
      crit: hit.crit,
      who: striker.name,
      target: foe.name,
      kind: label,
    });
    pushLog(next, text);
    return dealt;
  }

  if (played.ratio) {
    for (const index of foeIndexes) {
      const foe = next.enemies[index];
      const dealt = strike(foe, caster, played.ratio, played.name);
      stampDebuffs(next, foe, played, events);
      markFoe(next, foe, played, dealt, events);
      rideFoe(next, caster, played, foe, strike, events);
    }
  } else {
    for (const index of foeIndexes) {
      const foe = next.enemies[index];
      if (!foe || foe.hp <= 0) continue;
      stampDebuffs(next, foe, played, events);
      markFoe(next, foe, played, 0, events);
      rideFoe(next, caster, played, foe, strike, events);
    }
  }
  const mult = caster?.mult ?? 1;
  const shieldGain = blockAmount(played, caster);
  const healGain = healAmount(played, caster);
  const stressGain = scaleAmount(played.stress, mult);
  if (shieldGain) {
    next.shield += shieldGain;
    events.push({ text: `${shieldGain} block`, tone: "shield", amount: shieldGain });
    pushLog(next, `${caster.name} raises ${shieldGain} block.`);
  }
  if (healGain) {
    const before = next.hp;
    next.hp = Math.min(next.maxHp, next.hp + healGain);
    const gained = next.hp - before;
    if (gained > 0) {
      events.push({ text: `+${gained} health`, tone: "heal", amount: gained });
      pushLog(next, `${played.name} restores ${gained} health.`);
    }
  }
  rideCard(next, caster, played, events, Boolean(shieldGain), Boolean(healGain));
  if (stressGain) {
    next.stress = Math.max(0, Math.min(100, next.stress + stressGain));
    events.push({
      text: stressGain < 0 ? `${-stressGain} stress lifts` : `Stress +${stressGain}`,
      tone: stressGain < 0 ? "calm" : "stress",
      amount: Math.abs(stressGain),
    });
  }
  if (played.draw) drawCards(next, played.draw);
  if (caster?.passive?.mend && events.some((event) => event.amount > 0 && (event.tone === "hit" || event.tone === "good"))) {
    const before = next.hp;
    next.hp = Math.min(next.maxHp, next.hp + caster.passive.mend);
    const gained = next.hp - before;
    if (gained > 0) {
      events.push({ text: `+${gained} health`, tone: "heal", amount: gained });
      pushLog(next, `${caster.name} restores ${gained} health.`);
    }
  }
  if (next.enemies.every((enemy) => enemy.hp <= 0)) {
    next.result = "win";
    pushLog(next, "That's done.");
    events.push({ text: "Stage clear", tone: "good" });
  }
  return { battle: next, events };
}

export function endTurn(battle) {
  if (!battle || battle.result) return { battle, events: [] };
  const next = clone(battle);
  const wasBreak = next.breakdown;
  next.discard.push(...next.hand);
  next.hand = [];
  const events = [];
  const poisonIn = next.poison || 0;
  if (next.stun > 0) next.stun -= 1;
  if (next.sleep > 0) next.sleep -= 1;
  if (next.might > 0) next.might -= 1;
  if (next.critUp > 0) next.critUp -= 1;
  if (next.critDmgUp > 0) next.critDmgUp -= 1;
  if (next.resUp > 0) next.resUp -= 1;
  if (next.defUp > 0) next.defUp -= 1;
  if (next.soft > 0) next.soft -= 1;

  for (const foe of next.enemies) {
    if (foe.hp <= 0) continue;
    const info = intentInfo(foe);
    if ((foe.poison || 0) > 0 && foe.hp > 0) {
      const tick = foe.poison * 4;
      foe.hp = Math.max(0, foe.hp - tick);
      foe.poison -= 1;
      if (tick > 0) foe.sleep = 0;
      events.push({ text: `-${tick}`, tone: "bad", amount: tick, foeId: foe.id });
      pushLog(next, `Poison takes ${tick} from ${foe.name}.`);
    }
    if (foe.hp <= 0) continue;
    if ((foe.sleep || 0) > 0) {
      foe.sleep -= 1;
      events.push({ text: `${foe.name} is asleep`, tone: "bad", foeId: foe.id, intent: "sleep" });
      pushLog(next, `${foe.name} sleeps through the turn.`);
      continue;
    }
    if ((foe.stun || 0) > 0) {
      foe.stun -= 1;
      events.push({ text: `${foe.name} is stunned`, tone: "bad", foeId: foe.id, intent: "stun" });
      pushLog(next, `${foe.name} is too stunned to act.`);
      continue;
    }
    if (info.intent === "attack") {
      const hit = strikeDamage(info.amount, foe, partyGuard(next.party, next), true);
      let amount = hit.amount;
      const blocked = Math.min(next.shield, amount);
      next.shield -= blocked;
      if (blocked > 0 && next.shield === 0 && !next.reboundUsed) {
        const rebound = next.party.reduce((best, member) => Math.max(best, member.passive?.rebound || 0), 0);
        if (rebound > 0) {
          next.shield += rebound;
          next.reboundUsed = true;
          events.push({ text: `${rebound} block`, tone: "shield", amount: rebound });
          pushLog(next, `${rebound} block returns.`);
        }
      }
      const spill = amount - blocked;
      next.hp -= spill;
      const stressGain = spill > 0 ? Math.round(spill * 0.85) : 0;
      if (stressGain) next.stress = Math.min(100, next.stress + stressGain);
      const text = hit.crit
        ? blocked > 0
          ? `${foe.name} critical hit the party. ${blocked} blocked, ${spill} got through.`
          : `${foe.name} critical hit the party for ${spill}.`
        : blocked > 0
          ? `${foe.name} struck the party. ${blocked} blocked, ${spill} got through.`
          : `${foe.name} struck the party for ${spill}.`;
      events.push({
        text,
        tone: hit.crit ? "crit" : spill > 0 ? "bad" : "shield",
        amount: spill,
        blocked,
        foeId: foe.id,
        who: foe.name,
        attack: true,
        hit: spill > 0,
        crit: hit.crit,
        intent: "attack",
      });
      pushLog(next, text);
      if (stressGain) {
        events.push({ text: `Stress +${stressGain}`, tone: "stress", amount: stressGain });
      }
    } else if (info.intent === "defend") {
      foe.shield += info.amount;
      events.push({ text: `${foe.name} guards`, tone: "bad", foeId: foe.id, intent: "defend" });
      pushLog(next, `${foe.name} guards for ${info.amount}.`);
    } else if (info.intent === "mend") {
      const hurt = next.enemies
        .filter((enemy) => enemy.hp > 0)
        .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      if (hurt) hurt.hp = Math.min(hurt.maxHp, hurt.hp + info.amount);
      events.push({ text: `${foe.name} mends`, tone: "heal", foeId: foe.id, intent: "mend" });
      pushLog(next, `${foe.name} restores ${info.amount} health.`);
    } else {
      const move = foe.kit?.[foe.step % (foe.kit?.length || 1)];
      const effect = move?.effect || "poison";
      const label = effect === "stun" ? "Stun" : effect === "sleep" ? "Sleep" : effect === "weak" ? "Weak" : "Poison";
      const landed = !partyResists(next, label, events, foe.id, "hex");
      if (landed) {
        if (effect === "stun") next.stun = Math.max(next.stun || 0, 1);
        else if (effect === "sleep") next.sleep = Math.max(next.sleep || 0, 1);
        else if (effect === "weak") next.soft = Math.max(next.soft || 0, 2);
        else next.poison = (next.poison || 0) + 1;
        next.stress = Math.min(100, next.stress + HEX_STRESS);
        events.push({ text: `Stress +${HEX_STRESS}`, tone: "stress", amount: HEX_STRESS, foeId: foe.id, intent: "hex" });
        events.push({ text: label, tone: effect === "poison" ? "poison" : "bad", amount: 1, foeId: foe.id });
        pushLog(next, `${foe.name} hexes you. ${move?.line || label}`);
      }
    }
    if (foe.weak > 0) foe.weak -= 1;
    if (foe.vuln > 0) foe.vuln -= 1;
    if (foe.exposed > 0) foe.exposed -= 1;
    foe.step += 1;
  }

  next.shield = 0;
  if (poisonIn > 0 && next.hp > 0) {
    const tick = poisonIn * 5;
    next.hp -= tick;
    next.poison = Math.max(0, (next.poison || 0) - 1);
    next.stress = Math.min(100, next.stress + Math.round(tick * 0.85));
    events.push({ text: `-${tick}`, tone: "bad", amount: tick });
    events.push({ text: `Stress +${Math.round(tick * 0.85)}`, tone: "stress", amount: Math.round(tick * 0.85) });
    pushLog(next, `Poison takes ${tick}.`);
  }
  if (next.hp <= 0) {
    next.hp = 0;
    next.result = "lose";
    pushLog(next, "You go down.");
    return { battle: next, events };
  }
  if (next.enemies.every((enemy) => enemy.hp <= 0)) {
    next.result = "win";
    return { battle: next, events };
  }

  if (next.stress >= 100) {
    next.breakdown = true;
    next.stress = 25;
    events.push({
      text: "Stress hit 100. Attacks deal less, ults stay shut, and stress drops to 25.",
      tone: "stress",
    });
    pushLog(next, "You lock up. The next turn is a mess.");
  } else if (wasBreak) {
    next.breakdown = false;
    pushLog(next, "You steady.");
  }

  next.ap = (next.stun || 0) > 0 || (next.sleep || 0) > 0 ? 0 : 3;
  next.turn += 1;
  for (const member of next.party) gainEnergy(next, member.id, ultGain(member, null));
  drawCards(next, 5);
  return { battle: next, events };
}

export { nextStoryNode } from "./story.js";

export function stageUnlocked(save, stageId) {
  const node = storyNode(stageId);
  if (node) return nodeOpen(save, node);
  const daily = dailyStageById(stageId);
  if (daily) return daily.tier <= (save.dailyRun?.cleared || 0) + 1;
  const floor = floorById(save.towerWeek || monthId(), stageId);
  if (floor) return floor.number <= (save.towerFloor || 0) + 1;
  const index = STAGES.findIndex((stage) => stage.id === stageId);
  if (index <= 0) return true;
  return Boolean(save.clears[STAGES[index - 1].id]);
}

function applyBond(owned, gain) {
  let bond = (owned.bond || 0) + gain;
  let rooms = owned.rooms || 0;
  while (bond >= BOND_NEED && rooms < 3) {
    bond -= BOND_NEED;
    rooms += 1;
  }
  if (rooms >= 3) bond = 0;
  return { ...owned, bond, rooms };
}

export function clearStage(state, stageId) {
  const floor = floorById(state.towerWeek || monthId(), stageId);
  const stage = storyNode(stageId) || floor || stageById(stageId) || dailyStageById(stageId) || bondEventById(stageId);
  if (!stage) return { state, reward: null };
  let clearedDaily = 0;
  if (stage.daily) {
    clearedDaily = state.dailyRun?.cleared || 0;
    if (stage.tier > clearedDaily + 1) return { state, reward: null };
  }
  const clears = floor ? state.towerClears || {} : state.clears;
  const first = stage.daily ? stage.tier === clearedDaily + 1 : !clears[stageId];
  const applause = floor && !first ? 0 : stage.firstReward;
  const gifts = { ...state.gifts };
  let gift = null;
  if (stage.event && stage.gift) {
    const n = stage.giftCount || 1;
    gifts[stage.gift] = (gifts[stage.gift] || 0) + n;
    gift = stage.gift;
  } else if (first && stage.gift) {
    gifts[stage.gift] = (gifts[stage.gift] || 0) + 1;
    gift = stage.gift;
  }
  const nextClears = { ...clears, [stageId]: (clears[stageId] ?? 0) + 1 };
  const snap = {};
  for (const id of state.party || []) {
    if (!id || !state.roster[id]) continue;
    const owned = state.roster[id];
    snap[id] = { level: owned.level || 1, xp: owned.xp || 0, bond: owned.bond || 0, rooms: owned.rooms || 0 };
  }
  const xpGain = floor && !first ? 0 : stageXp(stage, false);
  const noteGain = stage.event ? stage.notes || 0 : stage.daily && !first ? 0 : stage.notes || 0;
  const bondGain = stage.daily && !first ? 0 : stage.bond || 0;
  const shardGain = stage.event ? stage.shards || 0 : stage.shards || (stage.daily ? (first ? 1 : 0) : first ? 2 : 0);
  let roster = state.roster;
  let levels = [];
  if (xpGain) {
    const grown = growRoster(roster, state.party, xpGain);
    roster = grown.roster;
    levels = grown.levels;
  }
  if (bondGain) {
    roster = { ...roster };
    for (const id of state.party || []) {
      if (!id || !roster[id]) continue;
      roster[id] = applyBond(roster[id], bondGain);
    }
  }
  return {
    state: {
      ...state,
      applause: state.applause + applause,
      gifts,
      clears: floor || stage.daily ? state.clears : nextClears,
      towerClears: floor ? nextClears : state.towerClears,
      towerFloor: floor ? Math.max(state.towerFloor || 0, floor.number) : state.towerFloor || 0,
      roster,
      insight: (state.insight || 0) + noteGain,
      shards: (state.shards || 0) + shardGain,
      dailyRun: stage.daily ? { day: state.dailyRun?.day || localDate(), cleared: first ? stage.tier : clearedDaily } : state.dailyRun ?? null,
    },
    reward: {
      applause,
      gift,
      first,
      daily: Boolean(stage.daily),
      tier: stage.tier || 0,
      day: stage.day || null,
      xp: xpGain,
      notes: noteGain,
      shards: shardGain,
      giftCount: stage.event ? (stage.gift ? stage.giftCount || 1 : 0) : gift ? 1 : 0,
      bond: bondGain,
      levels,
      snap,
    },
  };
}

function bestAim(card, owner, living, battle) {
  let best = living[0];
  let bestScore = -Infinity;
  for (const row of living) {
    let score = 0;
    const damage = card.ratio ? previewDamage(card, owner, row.enemy, battle.breakdown, { soft: battle.soft, might: battle.might }) || 0 : 0;
    score += damage;
    if (damage >= row.enemy.hp && damage > 0) score += 70;
    const adv = card.ratio ? advantage(card.element || owner?.element, row.enemy.element) : 0;
    if (adv > 0) score += 14;
    if (adv < 0) score -= 10;
    const info = intentInfo(row.enemy, partyGuard(battle.party, battle));
    if (info.intent === "attack") score += info.amount * 0.4;
    if (info.intent === "hex") score += 16;
    if ((card.stun || card.sleep) && (info.intent === "attack" || info.intent === "hex")) score += 18;
    if (score > bestScore) {
      bestScore = score;
      best = row;
    }
  }
  return best.index;
}

export function suggestAction(battle) {
  if (!battle || battle.result) return { type: "wait" };
  const living = battle.enemies.map((enemy, index) => ({ enemy, index })).filter((row) => row.enemy.hp > 0);
  if (!living.length) return { type: "wait" };
  const incoming = living.reduce((sum, row) => {
    const info = intentInfo(row.enemy, partyGuard(battle.party, battle));
    return info.intent === "attack" ? sum + info.amount : sum;
  }, 0);
  const playable = battle.hand
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => battle.ap >= card.cost && !(card.once && (battle.egoUsed[card.ownerId] || battle.breakdown)));

  const hpPct = battle.hp / battle.maxHp;
  const threat = Math.max(0, incoming - battle.shield);
  const ranked = playable.map(({ card, index }) => {
    const owner = battle.party.find((member) => member.id === card.ownerId);
    const mult = owner?.mult ?? 1;
    const target = bestAim(card, owner, living, battle);
    const foe = battle.enemies[target];
    let score = 0;
    const damage = card.ratio ? previewDamage(card, owner, card.aoe ? null : foe, battle.breakdown, { soft: battle.soft, might: battle.might }) || 0 : 0;
    score += damage;
    if (!card.aoe && damage >= foe.hp && damage > 0) score += 80;
    if (card.aoe) {
      score += living.reduce((sum, row) => {
        const hit = previewDamage(card, owner, row.enemy, battle.breakdown, { soft: battle.soft, might: battle.might }) || 0;
        return sum + hit + (hit >= row.enemy.hp ? 30 : 0);
      }, 0);
    }
    const adv = card.ratio ? advantage(card.element || owner?.element, foe.element) : 0;
    if (adv > 0) score += 10;
    if (adv < 0 && damage < foe.hp) score -= 12;
    if (threat > 0 && card.shield) {
      score += Math.min(blockAmount(card, owner), threat) * (hpPct < 0.45 || battle.stress > 60 ? 2 : 1.3);
    }
    if (card.shield && threat === 0) score -= 8;
    const room = battle.maxHp - battle.hp;
    if (card.heal && room > 0 && hpPct < 0.7) score += Math.min(healAmount(card, owner), room) * (hpPct < 0.4 ? 1.4 : 0.7);
    if (card.heal && room === 0) score -= 6;
    if (card.stress < 0 && battle.stress > 40) score += Math.min(-scaleAmount(card.stress, mult), battle.stress) * (battle.stress > 75 ? 1.3 : 0.6);
    if (card.draw && battle.hand.length < 4) score += 8;
    if (card.crit && !(battle.critUp > 0)) score += 9;
    if (card.critDmg && !(battle.critDmgUp > 0)) score += 9;
    if (card.shred) score += 7;
    if ((card.defUp || card.res) && (threat > 0 || hpPct < 0.75)) score += 8;
    if ((card.defUp && battle.defUp > 0) || (card.res && battle.resUp > 0)) score -= 4;
    if (card.once && damage < foe.hp * 0.45 && threat > 0) score -= 10;
    score /= card.cost || 1;
    return { index, target, score };
  });
  ranked.sort((a, b) => b.score - a.score);
  const best = ranked[0];
  let ultPick = null;
  let ultScore = -Infinity;
  if (!battle.breakdown) {
    for (const member of battle.party) {
      const cap = member.ultMax || 100;
      if ((battle.energy?.[member.id] || 0) < cap) continue;
      const ego = member.cards.find((card) => card.kind === "ego");
      if (!ego) continue;
      const target = bestAim(ego, member, living, battle);
      const foe = battle.enemies[target];
      const damage = ego.ratio ? previewDamage(ego, member, ego.aoe ? null : foe, battle.breakdown, { soft: battle.soft, might: battle.might }) || 0 : 0;
      let score = damage + 28;
      if (ego.heal && battle.hp < battle.maxHp) score += 16;
      if (ego.shield && threat > 0) score += 18;
      if (score > ultScore) {
        ultScore = score;
        ultPick = { type: "ult", id: member.id, target };
      }
    }
  }
  if (ultPick && ultScore >= (best?.score || 0)) return ultPick;
  if (!best || best.score < 4) return { type: "end" };
  return { type: "card", index: best.index, target: best.target };
}

export function battleHint(battle) {
  if (!battle) return "";
  if (battle.breakdown) return "This turn is frayed. Ultimates will not fire, and your hits are weaker.";
  const living = battle.enemies.filter((enemy) => enemy.hp > 0);
  const incoming = living.reduce((sum, enemy) => {
    const info = intentInfo(enemy, partyGuard(battle.party, battle));
    return info.intent === "attack" ? sum + info.amount : sum;
  }, 0);
  if (incoming > battle.shield) {
    return `They hit for ${incoming}. You have ${battle.shield} block. A block card before you end the turn keeps stress down.`;
  }
  const hex = living.find((enemy) => intentInfo(enemy).intent === "hex");
  if (hex) return `${hex.name} is about to raise your stress. That is the one to hit.`;
  return "Tap a card. It plays on the highlighted foe. End the turn when you are done.";
}

export function applyWeek(state) {
  const month = monthId();
  const towerFloor = state.towerFloor || 0;
  const towerClears = state.towerClears || {};
  if (!state.towerWeek) return { ...state, towerWeek: month, towerFloor, towerClears };
  if (state.towerWeek === month) return state;
  if (typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem(BATTLE_KEY);
      const saved = raw ? JSON.parse(raw) : null;
      if (String(saved?.stageId || "").startsWith("floor-")) localStorage.removeItem(BATTLE_KEY);
    } catch {
      /* leave the battle alone */
    }
  }
  return {
    ...state,
    towerWeek: month,
    towerFloor: 0,
    towerClears: {},
    weekNote: "New month. The tower starts again at floor 1. Your people, marks, and pity stay.",
  };
}

export function writeSave(save) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}

export function readBattle() {
  try {
    const raw = localStorage.getItem(BATTLE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeBattle(payload) {
  try {
    if (!payload || payload.battle?.result) localStorage.removeItem(BATTLE_KEY);
    else localStorage.setItem(BATTLE_KEY, JSON.stringify(payload));
  } catch {
    /* private mode */
  }
}

export function giveGift(state, id, giftId) {
  const owned = state.roster[id];
  const def = character(id);
  if (!owned || owned.rooms >= 3 || !state.gifts[giftId]) return { state, unlocked: [] };
  let gain = GIFTS_VALUE(giftId);
  if (def.favorite === giftId) gain = Math.round(gain * 1.5);
  let bond = owned.bond + gain;
  let rooms = owned.rooms;
  const unlocked = [];
  while (bond >= BOND_NEED && rooms < 3) {
    bond -= BOND_NEED;
    rooms += 1;
    unlocked.push(rooms - 1);
  }
  if (rooms >= 3) bond = 0;
  return {
    state: {
      ...state,
      gifts: { ...state.gifts, [giftId]: state.gifts[giftId] - 1 },
      roster: {
        ...state.roster,
        [id]: { ...owned, bond, rooms },
      },
    },
    unlocked,
    gain,
  };
}

export function giveGifts(state, id, giftId, count) {
  const want = Math.max(1, Math.floor(Number(count) || 1));
  let next = state;
  let gain = 0;
  const unlocked = [];
  for (let i = 0; i < want; i += 1) {
    const result = giveGift(next, id, giftId);
    if (result.state === next) break;
    next = result.state;
    gain += result.gain || 0;
    unlocked.push(...result.unlocked);
  }
  return { state: next, gain, unlocked };
}

function GIFTS_VALUE(id) {
  return GIFTS[id].value;
}

export function randomCues() {
  const bag = ["flare", "tide", "gale", "stone", "veil"];
  return Array.from({ length: 3 }, () => bag[Math.floor(Math.random() * bag.length)]);
}

export function suggestAir(owned, cues, roster) {
  const used = new Set();
  return cues.map((element) => {
    const ranked = owned
      .filter((unit) => !used.has(unit.id))
      .map((unit) => {
        const match = unit.element === element ? 100 : 0;
        const rare = unit.rarity === "SSR" ? 15 : unit.rarity === "SR" ? 8 : 0;
        const rooms = (roster[unit.id]?.rooms || 0) * 4;
        return { id: unit.id, score: match + rare + rooms };
      })
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    if (best) used.add(best.id);
    return best?.id || null;
  });
}

export const JOB_TIMES = [
  { minutes: 10, pay: 90 },
  { minutes: 30, pay: 180 },
  { minutes: 60, pay: 320 },
];

export function planErrand(picks, cues) {
  const now = Date.now();
  const jobs = picks.map((id, index) => {
    const time = JOB_TIMES[index] || JOB_TIMES[JOB_TIMES.length - 1];
    const match = Boolean(id && character(id)?.element === cues[index]);
    return {
      id,
      element: cues[index],
      minutes: time.minutes,
      endsAt: now + time.minutes * 60 * 1000,
      marks: id ? (match ? time.pay : Math.round(time.pay * 0.6)) : time.pay,
      match,
      collected: false,
      gift: null,
    };
  });
  const matches = jobs.filter((job) => job.match).length;
  let giftIndex = 0;
  jobs.forEach((job, index) => {
    if (job.marks > jobs[giftIndex].marks) giftIndex = index;
  });
  jobs[giftIndex] = { ...jobs[giftIndex], gift: matches >= 2 ? "bouquet" : "fanmail" };
  return { jobs };
}

export function scoreAir(picks, cues, roster) {
  let score = 0;
  let combo = 0;
  const notes = picks.map((id, index) => {
    const def = character(id);
    const owned = roster[id];
    const match = def.element === cues[index];
    combo = match ? combo + 1 : 0;
    let slot = 30;
    if (match) slot += 50;
    if (def.rarity === "SSR") slot += 15;
    else if (def.rarity === "SR") slot += 8;
    slot += (owned?.rooms ?? 0) * 4;
    slot += combo * 10;
    score += slot;
    return { id, match, slot, combo };
  });
  const applause = 60 + Math.round(score * 0.45);
  const gift = score >= 280 ? "bouquet" : "fanmail";
  return { score, applause, gift, notes };
}

export function dailyReward(state, now = new Date()) {
  const today = giftDayId(now);
  const claimed = state.daily === today;
  const streak = claimed ? state.streak || 1 : state.daily === shiftIso(today, -1) ? (state.streak || 0) + 1 : 1;
  return {
    claimed,
    streak,
    marks: 400 + Math.min(streak, 7) * 80,
    letters: 2,
    flowers: streak % 3 === 0 ? 1 : 0,
  };
}

export function claimDaily(state, now = new Date()) {
  const today = giftDayId(now);
  if (state.daily === today) return { state, claimed: null };
  const streak = state.daily === shiftIso(today, -1) ? state.streak + 1 : 1;
  const applause = 400 + Math.min(streak, 7) * 80;
  const gifts = { ...state.gifts, fanmail: state.gifts.fanmail + 2 };
  let gift = "fanmail";
  if (streak % 3 === 0) {
    gifts.bouquet += 1;
    gift = "bouquet";
  }
  return {
    state: { ...state, daily: today, streak, applause: state.applause + applause, gifts },
    claimed: { applause, streak, gift },
  };
}

function livingRoster(roster) {
  const next = {};
  for (const [id, row] of Object.entries(roster || {})) {
    if (character(id)) next[id] = row;
  }
  return next;
}

function livingParty(party, roster) {
  const slots = (party || []).filter((id) => id && roster[id]).slice(0, 3);
  while (slots.length < 3) slots.push(null);
  return slots.some(Boolean) ? slots : freshSave().party;
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return freshSave();
    const parsed = JSON.parse(raw);
    const base = freshSave();
    const roster = livingRoster(parsed.roster ?? base.roster);
    const errand = parsed.errand?.jobs?.every((job) => character(job?.id)) ? parsed.errand : null;
    return applyWeek({
      ...base,
      ...parsed,
      roster,
      gifts: { ...base.gifts, ...(parsed.gifts ?? {}) },
      party: livingParty(parsed.party, roster),
      errand,
      history: parsed.history ?? [],
      clears: repairStoryClears(parsed.clears ?? {}),
      towerClears: parsed.towerClears ?? {},
    });
  } catch {
    return freshSave();
  }
}

export const SWEEP_MAX = 100;

function rosterSnap(state) {
  const snap = {};
  for (const id of state.party || []) {
    const row = id && state.roster?.[id];
    if (!row) continue;
    snap[id] = { level: row.level || 1, xp: row.xp || 0, ascend: row.ascend || 0 };
  }
  return snap;
}

export function canSweepStage(state, stageId) {
  const stage = storyNode(stageId) || stageById(stageId) || dailyStageById(stageId) || bondEventById(stageId);
  if (!stage) return false;
  if (stage.daily) return stage.tier <= (state.dailyRun?.cleared || 0);
  return Boolean(state.clears?.[stageId]);
}

export function sweepStage(state, stageId, count) {
  const stage = storyNode(stageId) || stageById(stageId) || dailyStageById(stageId) || bondEventById(stageId);
  const runs = Math.max(1, Math.min(SWEEP_MAX, Math.floor(Number(count) || 1)));
  if (!stage) return { state, reward: null };
  if (stage.event) {
    if (!state.clears?.[stageId]) return { state, reward: null };
    const gifts = { ...state.gifts };
    const giftCount = stage.gift ? (stage.giftCount || 1) * runs : 0;
    if (stage.gift) gifts[stage.gift] = (gifts[stage.gift] || 0) + giftCount;
    const notes = (stage.notes || 0) * runs;
    const shards = (stage.shards || 0) * runs;
    return {
      state: {
        ...state,
        gifts,
        insight: (state.insight || 0) + notes,
        shards: (state.shards || 0) + shards,
      },
      reward: {
        runs,
        applause: 0,
        xp: 0,
        notes,
        shards,
        gift: stage.gift || null,
        giftCount,
        levels: [],
        snap: rosterSnap(state),
      },
    };
  }
  if (stage.daily) {
    const cleared = state.dailyRun?.cleared || 0;
    if (stage.tier > cleared) return { state, reward: null };
    const xp = stageXp(stage, false) * runs;
    const snap = rosterSnap(state);
    const grown = growRoster(state.roster, state.party, xp);
    return {
      state: {
        ...state,
        applause: state.applause + stage.firstReward * runs,
        roster: grown.roster,
      },
      reward: {
        runs,
        applause: stage.firstReward * runs,
        xp,
        notes: 0,
        shards: 0,
        levels: grown.levels,
        snap,
      },
    };
  }
  if (!state.clears?.[stageId]) return { state, reward: null };
  const snap = rosterSnap(state);
  const grown = growRoster(state.roster, state.party, stageXp(stage, false) * runs);
  const notes = Math.floor(runs / 10);
  const shards = Math.floor(runs / 5);
  return {
    state: {
      ...state,
      applause: state.applause + stage.firstReward * runs,
      insight: (state.insight || 0) + notes,
      shards: (state.shards || 0) + shards,
      roster: grown.roster,
    },
    reward: {
      runs,
      applause: stage.firstReward * runs,
      xp: stageXp(stage, false) * runs,
      notes,
      shards,
      levels: grown.levels,
      snap,
    },
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case "PULL":
      return pull(state, action.count);
    case "DISMISS_REVEAL":
      return { ...state, reveal: null };
    case "SET_BANNER":
      return { ...state, banner: action.banner };
    case "SET_PARTY": {
      const unique = [...new Set((action.ids ?? []).filter(Boolean))].filter((id) => state.roster[id]).slice(0, 3);
      while (unique.length < 3) unique.push(null);
      return { ...state, party: unique };
    }
    case "UNDO_CLEAR": {
      if (!action.reward || state.lastBattleKey !== action.battleKey) return state;
      const floor = action.reward.daily ? null : floorById(state.towerWeek || monthId(), action.stageId);
      const gifts = { ...state.gifts };
      if (action.reward.first && action.reward.gift) {
        gifts[action.reward.gift] = Math.max(0, (gifts[action.reward.gift] ?? 0) - 1);
      }
      const next = {
        ...state,
        applause: Math.max(0, state.applause - (action.reward.applause || 0)),
        gifts,
        insight: Math.max(0, (state.insight || 0) - (action.reward.notes || 0)),
        shards: Math.max(0, (state.shards || 0) - (action.reward.shards || 0)),
        lastBattleKey: null,
      };
      if (action.reward.snap) {
        const roster = { ...state.roster };
        for (const [id, prev] of Object.entries(action.reward.snap)) {
          if (roster[id]) roster[id] = { ...roster[id], ...prev };
        }
        next.roster = roster;
      }
      if (action.reward.daily) {
        if (action.reward.first) {
          next.dailyRun = { day: action.reward.day, cleared: Math.max(0, (action.reward.tier || 1) - 1) };
        }
        return next;
      }
      const bookKey = floor ? "towerClears" : "clears";
      const book = { ...(state[bookKey] || {}) };
      book[action.stageId] = Math.max(0, (book[action.stageId] ?? 1) - 1);
      if (!book[action.stageId]) delete book[action.stageId];
      let towerFloor = state.towerFloor || 0;
      if (floor && towerFloor === floor.number && !book[action.stageId]) {
        towerFloor = Math.max(0, floor.number - 1);
      }
      next[bookKey] = book;
      next.towerFloor = towerFloor;
      return next;
    }
    case "APPLY_CLEAR": {
      if (action.battleKey && state.lastBattleKey === action.battleKey) return state;
      return { ...action.state, lastBattleKey: action.battleKey ?? null };
    }
    case "SWEEP": {
      return sweepStage(state, action.stageId, action.count).state;
    }
    case "ASCEND": {
      const owned = state.roster[action.id];
      if (!owned || (owned.ascend || 0) >= ASCEND_CAPS.length - 1) return state;
      if ((owned.level || 1) < levelCap(owned)) return state;
      const price = ascendPrice(owned.ascend || 0);
      if (state.applause < price.marks || (state.shards || 0) < price.shards) return state;
      return {
        ...state,
        applause: state.applause - price.marks,
        shards: state.shards - price.shards,
        roster: {
          ...state.roster,
          [action.id]: { ...owned, ascend: (owned.ascend || 0) + 1, xp: 0 },
        },
      };
    }
    case "AUTO_START":
      return { ...state, autoStart: Boolean(action.on) };
    case "TRAIN": {
      const owned = state.roster[action.id];
      if (!owned) return state;
      const rank = skillRank(owned, action.cardId);
      if (rank >= 5) return state;
      if ((state.insight || 0) < rank) return state;
      return {
        ...state,
        insight: state.insight - rank,
        roster: {
          ...state.roster,
          [action.id]: {
            ...owned,
            level: owned.level || 1,
            xp: owned.xp || 0,
            skills: { ...(owned.skills || {}), [action.cardId]: rank + 1 },
          },
        },
      };
    }
    case "CLEAR_STAGE": {
      if (action.battleKey && state.lastBattleKey === action.battleKey) return state;
      const { state: next } = clearStage(state, action.stageId);
      return { ...next, lastBattleKey: action.battleKey ?? null };
    }
    case "GIFT":
      return giveGift(state, action.id, action.giftId).state;
    case "AIR":
      return {
        ...state,
        applause: state.applause + action.applause,
        gifts: {
          ...state.gifts,
          [action.gift]: state.gifts[action.gift] + 1,
        },
      };
    case "SEND_ERRAND": {
      if (state.errand) return state;
      const jobs = action.errand?.jobs;
      if (!Array.isArray(jobs) || jobs.length !== 3) return state;
      if (jobs.some((job) => !job?.id || !character(job.id))) return state;
      return { ...state, errand: { jobs } };
    }
    case "COLLECT_JOB": {
      const errand = state.errand;
      if (!errand?.jobs) return state;
      const job = errand.jobs[action.index];
      if (!job || job.collected || job.endsAt > Date.now()) return state;
      const gifts = { ...state.gifts };
      if (job.gift && GIFTS[job.gift]) gifts[job.gift] = (gifts[job.gift] || 0) + 1;
      const jobs = errand.jobs.map((item, i) =>
        i === action.index ? { restUntil: Date.now() + (job.minutes || 10) * 60 * 1000, minutes: job.minutes } : item
      );
      const stillBusy = jobs.some((item) => item && (item.endsAt || (item.restUntil && item.restUntil > Date.now())));
      return {
        ...state,
        applause: state.applause + (job.marks || 0),
        gifts,
        errand: stillBusy ? { ...errand, jobs } : null,
      };
    }
    case "TICK_JOBS": {
      const errand = state.errand;
      if (!errand?.jobs) return state;
      const now = Date.now();
      const jobs = errand.jobs.map((item) => (item?.restUntil && item.restUntil <= now ? null : item));
      if (jobs.every((item) => !item)) return { ...state, errand: null };
      if (jobs.some((item, i) => item !== errand.jobs[i])) return { ...state, errand: { ...errand, jobs } };
      return state;
    }
    case "CLEAR_ERRAND":
      if (!state.errand?.jobs?.every((job) => !job || job.collected)) return state;
      return { ...state, errand: null };
    case "DAILY":
      return claimDaily(state).state;
    case "SOUND":
      return { ...state, sound: action.on };
    case "SAW_TIP":
      return { ...state, sawTip: true };
    case "SCREEN":
      return { ...state, screen: action.screen };
    case "DISMISS_WEEK":
      return { ...state, weekNote: null };
    case "TICK_WEEK":
      return applyWeek(state);
    case "IMPORT":
      return applyWeek({
        ...freshSave(),
        ...action.save,
        reveal: null,
        weekNote: null,
      });
    case "REPLACE":
      return action.state;
    case "RESET":
      if (typeof localStorage !== "undefined") localStorage.removeItem(BATTLE_KEY);
      return freshSave();
    default:
      return state;
  }
}
