const FIELDS = [
  "applause",
  "pity",
  "ten",
  "legendPity",
  "guarantee",
  "banner",
  "roster",
  "party",
  "gifts",
  "clears",
  "towerWeek",
  "towerFloor",
  "towerClears",
  "daily",
  "streak",
  "pulls",
  "insight",
  "shards",
  "autoStart",
  "fastPlay",
  "dailyRun",
  "trial",
  "sound",
  "sawTip",
];

function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSave(save, battle) {
  const slim = {};
  for (const key of FIELDS) {
    if (save[key] !== undefined) slim[key] = save[key];
  }
  const payload = { v: 1, save: slim };
  if (battle?.stageId && battle.battle && !battle.battle.result) payload.battle = battle;
  return toBase64Url(JSON.stringify(payload));
}

export function decodeSave(token) {
  if (!token) return null;
  try {
    const data = JSON.parse(fromBase64Url(token));
    if (!data?.save || typeof data.save.applause !== "number" || !data.save.roster) return null;
    return data;
  } catch {
    return null;
  }
}

export function linkFromSave(save, battle, href) {
  const url = new URL(href);
  url.hash = `s=${encodeSave(save, battle)}`;
  return url.toString();
}

export function unpackLink(href = window.location.href) {
  const hash = new URL(href).hash.replace(/^#/, "");
  if (!hash.startsWith("s=")) return null;
  return decodeSave(hash.slice(2));
}

export function clearLinkHash() {
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}
