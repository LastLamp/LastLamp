import { createContext, useContext, useEffect, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CHARACTERS,
  describeCard,
  ELEMENTS,
  GIFTS,
  MOODS,
  STAGE_SCENES,
  STAGES,
  advantage,
  character,
  pool,
  freshSave,
  weeklyBanners,
  weaknessOf,
} from "./data.js";
import {
  HARD_PITY,
  PULL_COST,
  claimDaily,
  dailyReward,
  giftDayId,
  nextGiftAt,
  endTurn,
  giveGifts,
  forecast,
  partyGuard,
  intentInfo,
  loadSave,
  nextSsrChance,
  partyMembers,
  playCard,
  playUlt,
  previewDamage,
  planErrand,
  randomCues,
  reducer,
  suggestAir,
  readBattle,
  resolveStage,
  stageUnlocked,
  nextFight,
  nextStoryNode,
  STAR_STEPS,
  BOND_NEED,
  BOND_STORY_PCT,
  nextStarCopies,
  passiveFor,
  starsOf,
  startBattle,
  suggestAction,
  ultCap,
  ultGain,
  unitStats,
  writeBattle,
  writeSave,
  clearStage,
  SWEEP_MAX,
  canSweepStage,
  sweepStage,
  SSR_RATE,
  SR_RATE,
  LEGEND_SHARE,
} from "./logic.js";
import { ASCEND_CAPS, COMBOS, LEVEL_CAP, ascendPrice, dailyCleared, dailyStageById, dailyStages, levelCap, skillCost, skillRank, stageXp, withGrowth, xpSteps, xpToNext } from "./growth.js";
import { EVENT_ROADS, bondEvents, eventOpen } from "./events.js";
import { playAscend, playBond, playBondMax, playClick, playGift, playHit, playLevel, playPull, playRank, playResult, playUltStamp, releaseMusic, resumeMusic, setTabAudible, startMusic, stopMusic } from "./music.js";
import { storyChapters, storyClearCounts, storyNode } from "./story.js";
import { towerFor, monthId } from "./tower.js";
import { clearLinkHash, linkFromSave, unpackLink } from "./saveLink.js";
import spriteReport from "./spriteReport.json";
import { FACE_FRAME } from "./faceFrame.js";
import { SkillGlyph, swingOf } from "./skillIcons.jsx";

const PAGE_SCENES = {
  home: "road",
  stages: "gate",
  call: "night",
  lineup: "quarry",
  green: "kiln",
  air: "ford",
};

const ULT_BURST = {
  vesper: "HUSH",
  cael: "BLAZE",
  ivo: "MEND",
  rhys: "ROOT",
  soren: "TIDE",
  juniper: "BLOOM",
  marek: "SPARK",
  theo: "GALE",
  bastion: "HOLD",
  niles: "VEIL",
  orien: "CUT",
  kit: "SEED",
  pavel: "GUARD",
  len: "FRAME",
  remy: "RUSH",
  nera: "CALM",
  silas: "MARK",
  maris: "CHORD",
};

const MUSIC_SCENE = {
  home: "home",
  stages: "road",
  call: "summon",
  lineup: "party",
  green: "camp",
  air: "road",
};

const SPARK_BITS = [
  { id: "a", x: 0, y: 0, size: 22, delay: 0, fill: "#fffaf3" },
  { id: "b", x: -18, y: -16, size: 13, delay: 30, fill: "#f0c27a" },
  { id: "c", x: 20, y: -12, size: 11, delay: 10, fill: "#fff6d8" },
  { id: "d", x: -14, y: 18, size: 10, delay: 50, fill: "#fffaf3" },
  { id: "e", x: 16, y: 16, size: 14, delay: 20, fill: "#f0c27a" },
  { id: "f", x: 2, y: -22, size: 8, delay: 40, fill: "#fffaf3" },
];

const Game = createContext(null);
const useGame = () => useContext(Game);

const NAV = [
  ["home", "Home"],
  ["stages", "Fight"],
  ["call", "Summon"],
  ["lineup", "Party"],
  ["green", "Camp"],
];

export default function App() {
  const incoming = unpackLink();
  const [save, dispatch] = useReducer(reducer, null, loadSave);
  const [screen, setScreen] = useState("home");
  const [stageId, setStageId] = useState(() => {
    if (incoming) return null;
    const saved = readBattle();
    return saved?.battle && !saved.battle.result ? saved.stageId : null;
  });
  const [saveNote, setSaveNote] = useState("");
  const [pendingLink, setPendingLink] = useState(incoming);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const leaveFight = useRef(null);
  const [sparks, setSparks] = useState([]);
  const [goal, setGoal] = useState(null);
  const [huntOpen, setHuntOpen] = useState(false);
  const [stocked, setStocked] = useState(null);

  useEffect(() => {
    let timer = 0;
    function hush(event) {
      const node = event.target;
      if (node instanceof Element && node.closest(".tip-pop, .icon-pop")) return;
      document.documentElement.classList.add("tips-off");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => document.documentElement.classList.remove("tips-off"), 400);
    }
    window.addEventListener("scroll", hush, true);
    window.addEventListener("wheel", hush, { capture: true, passive: true });
    window.addEventListener("touchmove", hush, { capture: true, passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", hush, true);
      window.removeEventListener("wheel", hush, true);
      window.removeEventListener("touchmove", hush, true);
      document.documentElement.classList.remove("tips-off");
    };
  }, []);

  useEffect(() => {
    writeSave(save);
  }, [save]);

  useEffect(() => {
    const next = stageId ? (toughStage(stageId) ? "boss" : "battle") : MUSIC_SCENE[screen] || "home";
    if (!save.sound) {
      stopMusic();
      return undefined;
    }
    if (document.hidden) setTabAudible(false);
    startMusic(next);
    function onPress(event) {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (!document.hidden) resumeMusic();
      playClick();
    }
    function onVis() {
      if (document.hidden) setTabAudible(false);
      else setTabAudible(true);
    }
    window.addEventListener("pointerdown", onPress);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pointerdown", onPress);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [save.sound, screen, stageId]);

  useEffect(() => {
    function onHash() {
      const next = unpackLink();
      if (!next) return;
      setPendingLink(next);
      setStageId(null);
    }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (next) => {
    setStageId(null);
    setScreen(next);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelector("main")?.scrollTo(0, 0);
  }, [screen, stageId]);

  useEffect(() => {
    const nodes = [...document.querySelectorAll(".h-scroll")];
    const clean = [];
    function mark(el) {
      const overflow = el.scrollWidth > el.clientWidth + 12;
      el.classList.toggle("can-scroll-x", overflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 12);
    }
    nodes.forEach((el) => {
      const onScroll = () => mark(el);
      mark(el);
      el.addEventListener("scroll", onScroll, { passive: true });
      clean.push(() => el.removeEventListener("scroll", onScroll));
    });
    const watcher = new ResizeObserver(() => nodes.forEach(mark));
    nodes.forEach((el) => watcher.observe(el));
    return () => {
      watcher.disconnect();
      clean.forEach((fn) => fn());
    };
  }, [screen, stageId]);

  useEffect(() => {
    function onKey(event) {
      if (event.key !== "Escape") return;
      const scrims = document.querySelectorAll(".sheet-scrim");
      const top = scrims[scrims.length - 1];
      if (top) top.click();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function applyPayload(payload, note) {
    dispatch({ type: "IMPORT", save: payload.save });
    const battle = payload.battle;
    if (battle?.stageId && battle.battle && !battle.battle.result) {
      writeBattle(battle);
      setStageId(battle.stageId);
    } else {
      writeBattle(null);
      setStageId(null);
    }
    setScreen("home");
    setSaveNote(note);
  }

  function applyLink() {
    if (!pendingLink) return;
    clearLinkHash();
    setPendingLink(null);
    applyPayload(pendingLink, "Save loaded from the link.");
  }

  function dismissLink() {
    clearLinkHash();
    setPendingLink(null);
    const saved = readBattle();
    if (saved?.battle && !saved.battle.result) setStageId(saved.stageId);
  }

  async function copyLink() {
    const url = linkFromSave(save, readBattle(), window.location.href);
    try {
      await navigator.clipboard.writeText(url);
      return { url, copied: true };
    } catch {
      return { url, copied: false };
    }
  }

  return (
    <Game.Provider value={{ save, dispatch, go, setStageId, copyLink, goal, setGoal, setHuntOpen, setStocked }}>
      <div
        className={`shell${stageId ? " is-fight" : ""}`}
        onPointerDown={(event) => {
          if (event.button > 0) return;
          const id = `${Date.now()}-${Math.random()}`;
          setSparks((list) => [...list, { id, x: event.clientX, y: event.clientY }].slice(-12));
          window.setTimeout(() => setSparks((list) => list.filter((spark) => spark.id !== id)), 720);
        }}
        style={
          stageId
            ? { backgroundImage: skyGradient(resolveStage(save, stageId)) }
            : {
                backgroundImage: `url("${import.meta.env.BASE_URL}backdrops/${PAGE_SCENES[screen] || "road"}.jpg")`,
              }
        }
      >
        {!stageId && <header className="topbar">
          <button className="brand" aria-label="Last Lamp" onClick={() => go("home")}>
            <img className="wordmark" src={`${import.meta.env.BASE_URL}icons/wordmark.png`} alt="" />
          </button>
          {screen === "call" && !stageId && (
            <div className="resources summon-stats">
              <span className="res">
                <Purse kind="mark" />
                {save.applause.toLocaleString()}
              </span>
              <span className="res">
                {Math.max(0, HARD_PITY - save.pity)} to SSR
                <Tip label="i">Each summon counts as one. A ten-pull is ten summons, so the guarantee at 90 is nine ten-pulls. From summon 60 the chance climbs. Summon 90 is always an SSR.</Tip>
              </span>
            </div>
          )}
        </header>}
        {pendingLink && (
          <p className="save-note">
            This link carries a save from another browser.
            <span className="confirm">
              <button onClick={applyLink}>Load it</button>
              <button onClick={dismissLink}>Keep this browser</button>
            </span>
          </p>
        )}
        {saveNote && <p className="save-note">{saveNote}</p>}
        {!stageId && <nav className="rail">
          {NAV.map(([id, label]) => (
            <button
              key={id}
              className={screen === id && !stageId ? "on" : ""}
              aria-label={label}
              aria-current={screen === id && !stageId ? "page" : undefined}
              onClick={() => go(id)}
            >
              <NavIcon name={id} />
              <span className="icon-pop" role="tooltip">{label}</span>
            </button>
          ))}
          <button className={settingsOpen ? "on" : ""} aria-label="Settings" onClick={() => setSettingsOpen(true)}>
            <GearIcon />
            <span className="icon-pop" role="tooltip">Settings</span>
          </button>
        </nav>}
        <main>
          {stageId ? (
            <Battle
              key={stageId}
              stageId={stageId}
              paused={settingsOpen}
              onSettings={() => setSettingsOpen(true)}
              onBindLeave={(fn) => {
                leaveFight.current = fn;
              }}
              onExit={() => setStageId(null)}
            />
          ) : screen === "home" ? (
            <Home />
          ) : screen === "call" ? (
            <CallScreen />
          ) : screen === "lineup" ? (
            <Lineup />
          ) : screen === "green" ? (
            <GreenRoom />
          ) : screen === "air" ? (
            <OnAir />
          ) : (
            <Stages />
          )}
        </main>
        {settingsOpen && createPortal(
          <Settings
            onClose={() => setSettingsOpen(false)}
            onRetreat={stageId ? () => leaveFight.current?.() : null}
          />,
          document.body,
        )}
        {huntOpen && goal && createPortal(
          <FarmSheet
            goal={goal}
            save={save}
            onClose={() => setHuntOpen(false)}
            onGo={(id) => {
              setHuntOpen(false);
              setStageId(id);
              go("stages");
            }}
          />,
          document.body,
        )}
        {stocked && createPortal(
          <div className="sheet-scrim" onClick={() => setStocked(null)}>
            <article className="sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <h2>You have enough</h2>
              <p>
                {stocked.who} can {stocked.what}. You hold {stocked.have}. It takes {stocked.need}.
              </p>
              <button
                className="primary"
                onClick={() => {
                  setStocked(null);
                  go("green");
                }}
              >
                Back to camp
              </button>
            </article>
          </div>,
          document.body,
        )}
        {sparks.length > 0 &&
          createPortal(
            <div className="sparks" aria-hidden="true">
              {sparks.map((spark) => (
                <span key={spark.id} className="spark" style={{ left: spark.x, top: spark.y }}>
                  {SPARK_BITS.map((bit) => (
                    <svg
                      key={bit.id}
                      className="spark-star"
                      viewBox="0 0 16 16"
                      style={{
                        left: bit.x,
                        top: bit.y,
                        width: bit.size,
                        height: bit.size,
                        animationDelay: `${bit.delay}ms`,
                      }}
                    >
                      <path d="M8 0 L9.7 6.3 L16 8 L9.7 9.7 L8 16 L6.3 9.7 L0 8 L6.3 6.3 Z" fill={bit.fill} />
                    </svg>
                  ))}
                </span>
              ))}
            </div>,
            document.body
          )}
      </div>
    </Game.Provider>
  );
}

function Settings({ onClose, onRetreat }) {
  const { save, dispatch } = useGame();
  const [tab, setTab] = useState("play");
  const [leaving, setLeaving] = useState(false);
  const tabs = [
    ["play", "Options"],
    ["fight", "Fight"],
    ["summon", "Summon"],
    ["camp", "Camp"],
  ];
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <article className="sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <h2>Settings</h2>
        <div className="settings-tabs">
          {tabs.map(([id, label]) => (
            <button key={id} className={tab === id ? "primary" : "ghost"} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>
        {tab === "play" && (
          <div className="guide">
            <button
              className={save.sound ? "primary" : "ghost"}
              onClick={() => {
                const on = !save.sound;
                dispatch({ type: "SOUND", on });
                if (on) startMusic();
                else stopMusic();
              }}
            >
              Music {save.sound ? "on" : "off"}
            </button>
            <button className={save.autoStart ? "primary" : "ghost"} onClick={() => dispatch({ type: "AUTO_START", on: !save.autoStart })}>
              Auto at the start of a fight: {save.autoStart ? "on" : "off"}
            </button>
          </div>
        )}
        {tab === "fight" && (
          <div className="guide">
            <div className="icon-line"><img className="ap-soul" src={`${import.meta.env.BASE_URL}icons/ap.png`} alt="" /> You get three AP each turn. Cards spend them.</div>
            <p>Attackers hit the hardest, and their ult takes longer to fill. Supports set the others up, so their gauge fills sooner. Guardians keep the party standing. Controllers stun, put people to sleep, and shut them down. Healers put health back and bring stress down.</p>
            <p className="icon-line"><RoleMark role="Attacker" /> Attacker</p>
            <p className="icon-line"><RoleMark role="Support" /> Support</p>
            <p className="icon-line"><RoleMark role="Guardian" /> Guardian</p>
            <p className="icon-line"><RoleMark role="Controller" /> Controller</p>
            <p className="icon-line"><RoleMark role="Healer" /> Healer</p>
            <p>The line under a name is their class. Berserker spends the ult on one huge hit. Assassin marks a foe, then hits them again. Lancer hits several times. Archer calls an ally into the attack. Rider refunds an action. Ruler raises the party's damage. Soldier blocks for the party. Caster inflicts Poison, Stun, or Exposed. Cleric restores HP and lowers Stress.</p>
            <p>Fire beats wind. Wind beats water. Water beats fire. Earth beats shadow, and shadow beats earth. A weakness hurts more. Hitting into a strong element hurts less.</p>
            <p>The party shares one health bar, the sum of the three health totals. An enemy hits that bar, not one person. The hit is weighed against the sum of their defense. A block or a heal still uses only the caster's own defense or health. You pick which enemy a single-target card hits.</p>
            <p>When an enemy tries to stick a debuff, each person rolls their own resistance. If any of them shrugs it off, it does not land, and that name is called out. A critical hit is called out the same way. There is always a small chance to resist.</p>
            <p className="icon-line"><ElementMark element="flare" /> Fire</p>
            <p className="icon-line"><ElementMark element="gale" /> Wind</p>
            <p className="icon-line"><ElementMark element="tide" /> Water</p>
            <p className="icon-line"><ElementMark element="stone" /> Earth</p>
            <p className="icon-line"><ElementMark element="veil" /> Shadow</p>
            <p className="icon-line"><StatusGlyph id="block" /> Block is the blue stretch on health. The hit lands there first. Stress goes up when a hit gets through block. Block fades after that turn.</p>
            <p className="icon-line"><StatusGlyph id="exposed" /> Exposed lasts a few turns. Hits on them deal more damage. The number is turns left.</p>
            <p className="icon-line"><StatusGlyph id="weak" /> Weak means their next hits land softer.</p>
            <p className="icon-line"><StatusGlyph id="poison" /> Poison ticks at the start of the turn, then drops by one.</p>
            <p className="icon-line"><StatusGlyph id="stun" /> Stun skips the next action.</p>
            <p className="icon-line"><StatusGlyph id="sleep" /> Sleep lasts until a hit, or until it wears off.</p>
            <p className="icon-line"><StatusGlyph id="break" /> Lockup happens at 100 stress. That turn is weaker, and ults stay shut. Then the stress comes down.</p>
            <p className="icon-line"><StatusGlyph id="rage" /> Rage means a hurt enemy is swinging harder.</p>
            <p>The ult gauge fills when they use cards, and a little more at the end of your turn. When it's full, the ult is free. Rank up raises it at camp with notes, the same way as the other skills.</p>
            <p>Sweep skips a fight you already won and pays that clear again. Story and drills pay marks and experience. Event roads pay their drop.</p>
          </div>
        )}
        {tab === "summon" && (
          <div className="guide">
            <div className="icon-line"><Purse kind="mark" /> Three heroes are on rate-up. The set changes every Monday at noon Eastern. One summon is 160 marks.</div>
            <p>An SSR starts at 0.8%. From summon 60 the chance climbs, and summon 90 is always an SSR. That count carries across weeks. A ten-pull moves it by 10.</p>
            <p>Legendary heroes are SSRs. On an off-banner SSR, 15% are legendary. They have higher stats and stronger kits, and they are not on rate-up.</p>
            <p>Stars are extra copies. They are separate from ascending. The second star takes 4 copies, then 9, 16, and 25. A copy after that is a relic for an SSR, wildflowers for an SR, and a road letter for an R.</p>
          </div>
        )}
        {tab === "camp" && (
          <div className="guide">
            <div className="icon-line"><Purse kind="xp" /> Experience comes from fights and drills. Levels stop at 20, then 40, then 60, then 80. Ascending is what lifts that cap.</div>
            <div className="icon-line"><Purse kind="note" /> Notes raise a skill, including ults. They come from the Notes road. Rank up costs as many notes as the rank it is now, from 1 through 5.</div>
            <div className="icon-line"><Purse kind="bond" /> Bond points fill from gifts. At {BOND_NEED}, the next bond rank opens and their health, attack, and defense go up. <Purse kind="story" /> The book is the bond rank, out of 3.</div>
            <div className="icon-line"><Purse kind="shard" /> Shards come from the Shards road. <Purse kind="ascend" /> Ascending spends shards and marks. Each step adds 15% health, attack, and defense and raises the level cap. There are three steps.</div>
            <div className="icon-line"><Purse kind="keepsake" /> A relic is the best gift. One comes from a duplicate SSR that is already at 5 stars. Stages do not drop relics.</div>
            <p>There are five drills. Beat one and the next opens. You can run a finished drill again. Marks and experience stay the same. The first clear also pays the extra gift.</p>
            <p>Jobs are three slots: 10 minutes, 30 minutes, and 1 hour. Collect a job when its timer ends. That slot then rests for the same amount of time. New jobs appear once every slot is ready.</p>
          </div>
        )}
        {onRetreat && (
          leaving ? (
            <span className="confirm">
              Leave this fight?
              <button className="retreat" onClick={() => { onRetreat(); onClose(); }}>Leave</button>
              <button className="ghost" onClick={() => setLeaving(false)}>Stay</button>
            </span>
          ) : (
            <button className="retreat" onClick={() => setLeaving(true)}>Retreat</button>
          )
        )}
        <button className="ghost" onClick={onClose}>
          Close
        </button>
      </article>
    </div>
  );
}

const DRILL_SCENES = { 1: "drill-1", 2: "drill-2", 3: "drill-3", 4: "drill-4", 5: "drill-5" };

const SKIES = [
  ["#8ec6ef", "#d7e8f6", "#f6d7a2", "#e9b07a"],
  ["#f2b7c4", "#f8d8b4", "#f6e3a4", "#e8c07a"],
  ["#6f93d6", "#c4b4de", "#f0c4a4", "#e08a72"],
  ["#5ea8c8", "#b7dde4", "#dcecc8", "#c8c498"],
  ["#e8a56c", "#f6d09a", "#f8e6b4", "#d4926a"],
  ["#8aa4b8", "#d0d8de", "#ead8c0", "#c4b09a"],
  ["#7dbe9a", "#d4ecc4", "#f4e6b8", "#e0c090"],
  ["#5c6eaa", "#a898c8", "#e8c0b0", "#d49878"],
  ["#f0c878", "#f8e4b0", "#d4e4f4", "#9ec0dc"],
  ["#c8b49a", "#e8dcc8", "#f4ead4", "#d4c0a4"],
  ["#4e88b0", "#9ec8d8", "#d8e6d0", "#c8b888"],
  ["#d48a9a", "#f0c4b0", "#f6deb0", "#e0b080"],
];

function skyKey(stage) {
  if (!stage) return "road";
  if (stage.daily) return `drill-${stage.tier}`;
  if (stage.chapterId) return stage.chapterId;
  if (stage.number) return `tower-${Math.ceil(stage.number / 10)}`;
  return stage.id || "road";
}

function skyGradient(stage) {
  let hash = 0;
  const key = skyKey(stage);
  for (let i = 0; i < key.length; i += 1) hash = (hash * 33 + key.charCodeAt(i)) >>> 0;
  const stops = SKIES[hash % SKIES.length];
  const step = 100 / (stops.length - 1);
  return `linear-gradient(180deg, ${stops.map((color, i) => `${color} ${Math.round(i * step)}%`).join(", ")})`;
}

const STAGE_ART = Object.values(STAGE_SCENES);

function sceneArt(stage) {
  const name = stage?.daily
    ? DRILL_SCENES[stage.tier] || "road"
    : stage?.number
      ? STAGE_ART[(Math.ceil(stage.number / 10) - 1) % STAGE_ART.length] || "road"
      : STAGE_SCENES[stage?.chapterId || stage?.id] || "road";
  return `${import.meta.env.BASE_URL}backdrops/${name}.jpg?v=3`;
}

function SceneFace({ stage }) {
  return (
    <div className="scene-photo">
      <img src={sceneArt(stage)} alt="" />
    </div>
  );
}

function fightKind(stage) {
  if (stage?.daily) return `Drill ${stage.tier}`;
  if (stage?.number) return `Tower ${stage.number}`;
  return `Chapter ${stage?.chapter || ""}`;
}

function KitSheet({ id, save, onClose }) {
  const kit = character(id);
  if (!kit) return null;
  const owned = save.roster[kit.id];
  return createPortal(
    <div className="sheet-scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="kit-head">
          <Portrait c={kit} owned={Boolean(owned)} growth={owned || null} bust />
          <div>
            <p className="tile-meta">
              <RoleMark role={kit.role} />
              <ElementMark element={kit.element} />
            </p>
            <h2>{kit.name}</h2>
            <p className="card-title">{kit.title}</p>
            <p className="kit-blurb">{kit.blurb}</p>
            <p className="kit-statline">
              <span>Lv {owned ? owned.level || 1 : "–"}</span>
              <span>HP {owned ? unitStats(kit, owned).maxHp : "–"}</span>
              <span>ATK {owned ? unitStats(kit, owned).atk : "–"}</span>
              {owned && <span>DEF {unitStats(kit, owned).def}</span>}
              {owned && <span>Crit {Math.round(unitStats(kit, owned).crit * 100)}%</span>}
              {owned && <span>Crit DMG {Math.round(unitStats(kit, owned).critDmg * 100)}%</span>}
              {owned && <span>RES {Math.round(unitStats(kit, owned).res * 100)}%</span>}
              <span>{owned ? `${starsOf(owned.copies)}★` : "–"}</span>
            </p>
          </div>
        </div>
        <div className="kit-cards">
          <PassiveCard id={kit.id} copies={owned?.copies} />
          {kit.cards.map((card) => (
            <article key={card.id} className={`kit-card tone-${kit.element}`}>
              <SkillArt card={card} />
              <CardFacts card={card} def={kit} owned={owned} />
              <strong>{card.name}</strong>
              <p>{describeCard({ ...card, ...(COMBOS[card.id] || {}) })}</p>
            </article>
          ))}
        </div>
        <button className="primary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>,
    document.body,
  );
}

function Home() {
  const { save, dispatch, go, copyLink, setStageId } = useGame();
  const [kitId, setKitId] = useState(null);
  const [askReset, setAskReset] = useState(false);
  const [askCopy, setAskCopy] = useState(false);
  const [copyState, setCopyState] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const clock = new Date(now);
  const todayClaimed = save.daily === giftDayId(clock);
  const pay = dailyReward(save, clock);
  const untilNext = formatLeft(nextGiftAt(clock).getTime() - now);
  const payBits = [`${pay.marks} marks`, `${pay.letters} Road Letters`];
  if (pay.flowers) payBits.push(`${pay.flowers} Wildflowers`);
  const payText = payBits.join(", ");
  const ready = partyMembers(save).length > 0;
  const drills = dailyStages();
  const drillClear = dailyCleared(save);
  const drill = drills.find((stage) => stage.tier === drillClear + 1) || drills[drills.length - 1];
  const drillAgain = drill.tier <= drillClear;
  const next = nextStoryNode(save);

  function claim() {
    const { state, claimed } = claimDaily(save);
    if (!claimed) return;
    dispatch({ type: "REPLACE", state });
  }

  return (
    <section className="home relative isolate">
      <article className={`panel daily${todayClaimed ? " is-done" : ""}`}>
        <h2>Daily gift</h2>
        {todayClaimed ? (
          <p className="pay-receipt">Claimed: {payText}. Streak {pay.streak}. Next gift in {untilNext}.</p>
        ) : (
          <>
            <p>
              Ready: {payText}. A longer streak pays more marks, up to seven days. Every third day adds Wildflowers. This one closes in {untilNext}, at noon Eastern.
            </p>
            <button className="primary" onClick={claim}>
              Take the gift
            </button>
          </>
        )}
      </article>
      {next && (
        <article className="panel next-fight scene-card">
          <SceneFace stage={next} />
          <div className="scene-body">
          <p className="kicker">Chapter {next.chapter} · {next.part} of {next.parts}</p>
          <StageStars count={next.stars} />
          <h1>{next.sub || next.name}</h1>
          <p>{next.blurb}</p>
          <StageHint stage={next} />
          <button className="primary go" disabled={!ready} onClick={() => setStageId(next.id)}>
            {ready ? (storyClearCounts(save, next.id) ? "Fight again" : "Fight") : "Choose a party first"}
          </button>
          <button className="ghost go" onClick={() => go("stages")}>
            All fights
          </button>
          {!ready && <p className="quiet">A fight needs someone in the party.</p>}
          </div>
        </article>
      )}
      {drill && (
        <article className="panel next-fight scene-card">
          <SceneFace stage={drill} />
          <div className="scene-body">
          <p className="kicker">Drill {drill.tier} of 5{drillAgain ? " · cleared" : ""}</p>
          <StageStars count={drill.stars} />
          <h1>{drill.name}</h1>
          <p>{drill.blurb}</p>
          <StageHint stage={drill} />
          <Pay
            marks={drill.firstReward}
            xp={stageXp(drill, false)}
            notes={drillAgain ? 0 : drill.notes}
            bond={drillAgain ? 0 : drill.bond}
            gift={drillAgain ? null : drill.gift}
          />
          <button className="primary go" disabled={!ready} onClick={() => setStageId(drill.id)}>
            {ready ? (drillAgain ? "Fight again" : "Start drill") : "Choose a party first"}
          </button>
          </div>
        </article>
      )}
      <article className="panel">
        <div className="panel-head">
          <h2>Party</h2>
          <button className="textish" onClick={() => go("lineup")}>
            Change
          </button>
        </div>
        <div className="party-slots">
          {save.party.map((id, i) => {
            const c = id ? character(id) : null;
            return (
              <div key={i} className={c ? `slot filled rarity-card rarity-${c.rarity} tone-${c.element}` : "slot"}>
                {c ? (
                  <button type="button" className="home-unit" onClick={() => setKitId(c.id)} aria-label={`Open ${c.name}'s kit`}>
                    <div className="home-plate">
                      <Portrait c={c} owned growth={save.roster[c.id]} bust />
                    </div>
                    <span>{c.name}</span>
                  </button>
                ) : (
                  <span>Empty</span>
                )}
                {c && (
                  <em>
                    <span className={`rarity-badge rarity-${c.rarity}`}>{c.rarity}</span>
                    <RoleMark role={c.role} />
                    <ElementMark element={c.element} />
                  </em>
                )}
              </div>
            );
          })}
        </div>
      </article>
      {kitId && <KitSheet id={kitId} save={save} onClose={() => setKitId(null)} />}
      <div className="hero-actions">
        <button className="ghost" onClick={() => go("call")}>
          Summon
        </button>
        <button className="ghost" onClick={() => go("air")}>
          Jobs
        </button>
        <button className="ghost" onClick={() => go("green")}>
          Camp
        </button>
      </div>
      <details className="fineprint">
        <summary>How a day goes</summary>
        <ol>
          <li>Summon costs 160 marks. The rates are on that screen.</li>
          <li>A fight needs at least one person and one shared health bar. Block if a hit is coming.</li>
          <li>Jobs take time. Collect them when people get back. A matching element pays more.</li>
          <li>Camp gifts raise bond. A full bond rank raises health, attack, and defense.</li>
          <li>Drills stay open. Marks and experience stay the same when you run one again.</li>
        </ol>
        <p>Marks only come from playing.</p>
      </details>
      <article className="panel transfer-card">
        <h2>Transfer progress to another device</h2>
        <p>Copy a link and open it on the other phone or computer. It will ask before replacing the save there.</p>
        {askCopy ? (
          <div className="confirm-copy">
            <p>Copy a link to this save? The other device will ask before it replaces the save there.</p>
            <span className="confirm">
              <button
                className="primary"
                type="button"
                onClick={async () => {
                  setCopyState(await copyLink());
                  setAskCopy(false);
                }}
              >
                Copy it
              </button>
              <button className="ghost" type="button" onClick={() => setAskCopy(false)}>
                Cancel
              </button>
            </span>
          </div>
        ) : (
          <button
            className="ghost"
            type="button"
            onClick={() => {
              setCopyState(null);
              setAskCopy(true);
            }}
          >
            Copy link
          </button>
        )}
        {copyState?.copied && <p className="quiet copy-follow">Copied. Open it on the other device.</p>}
        {copyState && !copyState.copied && (
          <div className="copy-follow">
            <p className="quiet">The clipboard is blocked. Select this link and copy it.</p>
            <input className="link-box" readOnly value={copyState.url} onFocus={(event) => event.target.select()} />
          </div>
        )}
      </article>
      <div className="footer-row">
        <span className="reset-row">
          <button className="textish" onClick={() => setAskReset(true)}>
            Reset save
          </button>
          <Tip label="?">
            Wipes the party, marks, summons, and story in this browser, then starts over. A link you already copied stays until you open it.
          </Tip>
        </span>
      </div>
      {askReset && (
        <div className="sheet-scrim" onClick={() => setAskReset(false)}>
          <article className="sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h2>Erase this save?</h2>
            <p>This deletes the party, marks, summons, and story on this browser. You cannot get them back from here.</p>
            <div className="hero-actions sheet-actions">
              <button
                className="primary"
                type="button"
                onClick={() => {
                  const next = freshSave();
                  writeSave(next);
                  writeBattle(null);
                  clearLinkHash();
                  dispatch({ type: "REPLACE", state: next });
                  setAskReset(false);
                  setStageId(null);
                }}
              >
                Erase it
              </button>
              <button className="ghost" onClick={() => setAskReset(false)}>
                Keep my save
              </button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

function rateLine(value) {
  const pct = value * 100;
  return `${pct >= 1 ? pct.toFixed(2) : pct.toFixed(3)}%`;
}

function RatesSheet({ save, featuredUnits, onClose }) {
  const ssr = pool("SSR");
  const featuredIds = featuredUnits.map((unit) => unit.id);
  const legends = ssr.filter((unit) => unit.legend);
  const off = ssr.filter((unit) => !unit.legend && !featuredIds.includes(unit.id));
  const featuredRate = SSR_RATE * 0.5 / Math.max(1, featuredUnits.length);
  const lost = SSR_RATE * 0.5;
  const legendRate = legends.length ? (lost * LEGEND_SHARE) / legends.length : 0;
  const offRate = off.length ? (lost * (1 - LEGEND_SHARE)) / off.length : 0;
  const sr = pool("SR");
  const rare = pool("R");
  const srRate = sr.length ? SR_RATE / sr.length : 0;
  const rareRate = rare.length ? (1 - SSR_RATE - SR_RATE) / rare.length : 0;
  const chance = nextSsrChance(save.pity);
  const names = featuredUnits.map((unit) => unit.name).join(", ");
  const groups = [
    { name: "This week's rate-up", rate: featuredRate, units: featuredUnits },
    { name: "Legendary SSR", rate: legendRate, units: legends },
    { name: "Other SSR", rate: offRate, units: off },
    { name: "SR", rate: srRate, units: sr },
    { name: "R", rate: rareRate, units: rare },
  ];
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <article className="sheet rates-sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <h2>Rates</h2>
        <p>
          SSR starts at {(SSR_RATE * 100).toFixed(1)}%. From summon 60 it climbs. Summon {HARD_PITY} is always an SSR.
          Half of those are {names}. A miss makes the next SSR one of them. Every 10 summons includes an SR or better.
        </p>
        <p>
          Now {(chance * 100).toFixed(chance === 1 ? 0 : 1)}% SSR · {save.pity} of {HARD_PITY}
          {save.guarantee ? " · next SSR is a rate-up" : ""} · SR or better within {Math.max(1, 10 - save.ten)}
        </p>
        {groups.map((group) => (
          <section key={group.name}>
            <h3>
              {group.name} · {rateLine(group.rate)} each
            </h3>
            <ul className="rate-list">
              {group.units.map((unit) => (
                <li key={unit.id}>
                  <span>{unit.name}</span>
                  <b>{rateLine(group.rate)}</b>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <button className="ghost" type="button" onClick={onClose}>
          Close
        </button>
      </article>
    </div>
  );
}

function CallScreen() {
  const { save, dispatch } = useGame();
  const [mode, setMode] = useState(save.reveal ? "summary" : "idle");
  const [index, setIndex] = useState(0);
  const [shock, setShock] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [ratesOpen, setRatesOpen] = useState(false);
  const [kitId, setKitId] = useState(null);
  const [banners, setBanners] = useState(() => weeklyBanners());
  const featuredUnits = banners.map((item) => character(item.featured)).filter((unit) => unit && unit.legend !== true);
  const live = mode === "charge" || mode === "card";

  useEffect(() => {
    function sync() {
      setBanners(weeklyBanners());
    }
    const id = window.setInterval(sync, 60000);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    const cards = save.reveal?.cards;
    if (!cards?.length) return undefined;
    for (const pull of cards) {
      const img = new Image();
      img.src = `${import.meta.env.BASE_URL}portraits/${pull.id}.jpg`;
      img.decode?.().catch(() => {});
    }
    return undefined;
  }, [save.reveal]);

  useEffect(() => {
    if (mode !== "charge" || !save.reveal?.cards?.length) return undefined;
    let cancel = false;
    const first = save.reveal.cards[0];
    const img = new Image();
    img.src = `${import.meta.env.BASE_URL}portraits/${first.id}.jpg`;
    const decoded = img.decode?.().catch(() => {}) ?? Promise.resolve();
    const min = new Promise((resolve) => window.setTimeout(resolve, 740));
    Promise.all([decoded, min]).then(() => {
      if (cancel) return;
      setIndex(0);
      setMode("card");
    });
    return () => {
      cancel = true;
    };
  }, [mode, save.reveal]);

  useEffect(() => {
    if (mode !== "card" || !save.reveal) return undefined;
    const card = save.reveal.cards[index];
    if (!card) {
      setMode("summary");
      return undefined;
    }
    setShock(card.rarity === "SSR");
    playPull(card.rarity);
    return undefined;
  }, [mode, index, save.reveal]);

  function advance() {
    if (!save.reveal) return;
    setShock(false);
    if (index + 1 >= save.reveal.cards.length) setMode("summary");
    else setIndex(index + 1);
  }

  function call(count) {
    if (live) return;
    if (save.applause < PULL_COST * count) return;
    setShock(false);
    setIndex(0);
    setMode("charge");
    dispatch({ type: "PULL", count });
  }

  return (
    <section className="call relative isolate">
      <div className="summon-sky" aria-hidden="true">
        {Array.from({ length: 16 }, (_, n) => (
          <i key={n} style={{ "--n": n, left: `${(n * 17) % 94}%`, top: `${(n * 23) % 88}%` }} />
        ))}
      </div>
      <article className="panel summon-card">
        <p className="kicker">This week's rate-up</p>
        <div className="rate-ups">
          {featuredUnits.map((unit) => (
            <button key={unit.id} type="button" className="rate-up" onClick={() => setKitId(unit.id)} aria-label={`Open ${unit.name}'s kit`}>
              <Portrait c={unit} owned bust />
              <strong>{unit.name}</strong>
              <em>{unit.title}</em>
            </button>
          ))}
        </div>
        <p className="rate-week">A new set every Monday at noon Eastern. Tap a hero to see their kit.</p>

        <div className="call-row">
          <button className="ghost" disabled={live || save.applause < PULL_COST} onClick={() => call(1)}>
            Summon ×1
            <img className="purse" src={`${import.meta.env.BASE_URL}icons/mark.png`} alt="" />
            {PULL_COST}
          </button>
          <button className="primary big" disabled={live || save.applause < PULL_COST * 10} onClick={() => call(10)}>
            Summon ×10
            <img className="purse" src={`${import.meta.env.BASE_URL}icons/mark.png`} alt="" />
            {PULL_COST * 10}
          </button>
        </div>
        <button className="ghost rates-btn" type="button" onClick={() => setRatesOpen(true)}>
          Rates
        </button>
      </article>

      <button className="ghost" type="button" onClick={() => setLogOpen(true)} disabled={save.history.length === 0}>
        Summon history · {Math.min(save.history.length, 50)}
      </button>
      {ratesOpen && <RatesSheet save={save} featuredUnits={featuredUnits} onClose={() => setRatesOpen(false)} />}
      {kitId && <KitSheet id={kitId} save={save} onClose={() => setKitId(null)} />}
      {logOpen && <SummonLog history={save.history} onClose={() => setLogOpen(false)} />}

      {mode !== "idle" && save.reveal && createPortal(
        <Reveal
          save={save}
          mode={mode}
          index={index}
          shock={shock}
          onAdvance={advance}
          onSkip={() => {
            setShock(false);
            setMode("summary");
          }}
          onClose={() => {
            setMode("idle");
            dispatch({ type: "DISMISS_REVEAL" });
          }}
          onAgain={call}
        />,
        document.body,
      )}
    </section>
  );
}

function Reveal({ save, mode, index, shock, onAdvance, onSkip, onClose, onAgain }) {
  const cards = save.reveal.cards;
  const current = cards[index];

  return (
    <div
      className={`overlay summon-veil${shock ? " shock" : ""}${mode === "card" ? " can-advance" : ""}${current ? ` reveal-${current.rarity}` : ""}`}
      style={{
        backgroundImage: `linear-gradient(rgba(28, 18, 16, 0.55), rgba(28, 18, 16, 0.82)), url(${import.meta.env.BASE_URL}backdrops/night.jpg)`,
      }}
      onClick={() => {
        if (mode === "card") onAdvance();
      }}
    >
      {mode === "charge" && (
        <div className="charge">
          <p className="kicker">Summoning</p>
          <div className="riser-bar" />
        </div>
      )}
      {mode === "card" && current && current.rarity === "SSR" && (
        <div className={`shooting-stars${character(current.id)?.legend ? " is-legend" : ""}`} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
      )}
      {mode === "card" && current && (
        <div className="reveal-stage">
          <PullCard pull={current} slam={current.rarity === "SSR"} />
          <p className="advance-hint">
            {cards.length === 1 ? "Tap anywhere to continue." : `${index + 1} of ${cards.length}. Tap anywhere for the next.`}
          </p>
          {cards.length > 1 && (
            <button
              className="ghost"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSkip();
              }}
            >
              Skip all
            </button>
          )}
        </div>
      )}
      {mode === "summary" && (
        <div className="summary">
          <p className="kicker">{cards.length === 1 ? "One summon" : "Ten summons"}</p>
          <div className="summary-grid">
            {cards.map((pull, i) => (
              <PullCard key={`${pull.id}-${i}`} pull={pull} compact />
            ))}
          </div>
          <div className="hero-actions">
            <button
              className="primary"
              onClick={(event) => {
                event.stopPropagation();
                onClose();
              }}
            >
              Done
            </button>
            <button
              className="ghost"
              disabled={save.applause < PULL_COST * (cards.length === 1 ? 1 : 10)}
              onClick={(event) => {
                event.stopPropagation();
                onAgain(cards.length === 1 ? 1 : 10);
              }}
            >
              Summon ×{cards.length === 1 ? 1 : 10} again
              <img className="purse" src={`${import.meta.env.BASE_URL}icons/mark.png`} alt="" />
              {PULL_COST * (cards.length === 1 ? 1 : 10)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PullCard({ pull, slam, compact }) {
  const c = character(pull.id);
  return (
    <article className={`pull-card rarity-${pull.rarity} ${slam ? "slam" : pull.rarity === "SR" ? "gleam" : "deal"} ${compact ? "compact" : ""}`}>
      {pull.rarity === "SR" && !compact && <i className="sr-gleam" aria-hidden="true" />}
      <Portrait c={c} owned bust />
      <div>
        <p className={`rarity-badge rarity-${pull.rarity}`}>{pull.rarity}</p>
        <h3>{c.name}</h3>
        <p className="card-title">{c.title}</p>
        {pull.isNew && <b className="ribbon">New</b>}
        {pull.starUp && STAR_STEPS.includes(pull.copies) && <b className="ribbon star">Star {starsOf(pull.copies)}</b>}
        {!pull.isNew && !pull.overflow && <p className="copy-line">{compact ? shortCopy(pull) : copyNote(pull)}</p>}
        {pull.overflow && <b className="ribbon">{GIFTS[pull.gift]?.name || "Gift"}. Already 5 stars.</b>}
      </div>
    </article>
  );
}

function Lineup() {
  const { save, dispatch } = useGame();
  const [filter, setFilter] = useState("all");
  const [swapFor, setSwapFor] = useState(null);
  const [kitId, setKitId] = useState(null);
  const partyIds = save.party.filter(Boolean);
  const kit = kitId ? character(kitId) : null;
  const incoming = swapFor ? character(swapFor) : null;
  const list = CHARACTERS.filter((c) => {
    if (filter === "owned") return save.roster[c.id];
    if (filter === "legend") return c.legend;
    if (filter === "SSR" || filter === "SR" || filter === "R") return c.rarity === filter;
    return true;
  }).sort((a, b) => {
    const ownedA = save.roster[a.id] ? 0 : 1;
    const ownedB = save.roster[b.id] ? 0 : 1;
    return ownedA - ownedB;
  });

  function setParty(ids) {
    dispatch({ type: "SET_PARTY", ids });
  }

  function removeAt(index) {
    const next = save.party.map((id, i) => (i === index ? null : id)).filter(Boolean);
    setParty(next);
  }

  function add(id) {
    if (!save.roster[id] || partyIds.includes(id)) return;
    if (partyIds.length >= 3) {
      setSwapFor(id);
      return;
    }
    setParty([...partyIds, id]);
  }

  function replaceWith(index) {
    const next = [...save.party];
    next[index] = swapFor;
    setParty(next);
    setSwapFor(null);
  }

  return (
    <section className="party-page relative isolate">
      <header className="page-intro">
        <h1>Party</h1>
      </header>
      <div className="party-slots">
        {save.party.map((id, i) => {
          const c = id ? character(id) : null;
          return (
            <div key={i} className={c ? `slot filled tone-${c.element}` : "slot"}>
              {c ? (
                <>
                  <button className="slot-x" aria-label={`Remove ${c.name}`} onClick={() => removeAt(i)}>
                    <i />
                  </button>
                  <button className="slot-body" onClick={() => setKitId(c.id)}>
                    <Portrait c={c} owned growth={save.roster[c.id]} bust />
                    <span>{c.name}</span>
                  </button>
                </>
              ) : (
                <span>Empty</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="filters">
        {["owned", "all", "legend", "SSR", "SR", "R"].map((item) => (
          <button key={item} className={filter === item ? "on" : ""} onClick={() => setFilter(item)}>
            {item === "all" ? "All" : item === "owned" ? "With you" : item === "legend" ? "Legendary" : item}
          </button>
        ))}
      </div>
      <div className="idol-grid">
        {list.map((c) => {
          const owned = save.roster[c.id];
          const inParty = partyIds.includes(c.id);
          return (
            <article key={c.id} className={`idol-tile rarity-card rarity-${c.rarity} tone-${c.element} ${inParty ? "in-party" : ""} ${owned ? "" : "is-missing"}`}>
              <Portrait c={c} owned={Boolean(owned)} growth={owned} bust />
              <p className="tile-meta">
                <RoleMark role={c.role} />
                <ElementMark element={c.element} />
              </p>
              <div className="select-foot">
                <h3>{c.name}</h3>
                <p className="card-title">{c.title}</p>
                {owned ? <Stars copies={owned.copies} /> : <p className="meet-line">Not recruited.</p>}
                <div className="tile-actions">
                  <button className="ghost" onClick={() => setKitId(c.id)}>
                    Kit
                  </button>
                  {inParty ? (
                    <span className="quiet">In the party</span>
                  ) : (
                    <button className="primary" disabled={!owned} onClick={() => add(c.id)}>
                      {partyIds.length >= 3 ? "Replace" : "Add"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {incoming && createPortal(
        <div className="sheet-scrim" onClick={() => setSwapFor(null)}>
          <div className="sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <p className="kicker">Party is full</p>
            <h2>Put {incoming.name.split(" ")[0]} in for…</h2>
            <div className="sheet-list">
              {save.party.map((id, index) => {
                const member = id ? character(id) : null;
                if (!member) return null;
                return (
                  <button key={id} className="ghost sheet-choice" onClick={() => replaceWith(index)}>
                    <Portrait c={member} owned bust />
                    <span>{member.name}</span>
                  </button>
                );
              })}
            </div>
            <button className="textish" onClick={() => setSwapFor(null)}>
              Cancel
            </button>
          </div>
        </div>,
        document.body
      )}
      {kit && <KitSheet id={kit.id} save={save} onClose={() => setKitId(null)} />}
    </section>
  );
}

function CountStep({ value, max, onChange, lessLabel, moreLabel }) {
  const hold = useRef(0);
  useEffect(() => () => window.clearInterval(hold.current), []);
  function stop() {
    window.clearInterval(hold.current);
    hold.current = 0;
  }
  function press(dir, event) {
    event.preventDefault();
    event.stopPropagation();
    const started = performance.now();
    const step = () => {
      const jump = performance.now() - started >= 500 ? 10 : 1;
      onChange((current) => Math.max(1, Math.min(max, current + dir * jump)));
    };
    stop();
    step();
    hold.current = window.setInterval(step, 140);
    const end = () => {
      stop();
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }
  return (
    <span className="sweep-row">
      <button className="sweep-step" type="button" aria-label={lessLabel} onPointerDown={(event) => press(-1, event)}>
        −
      </button>
      <span className="sweep-count">
        {value}/{max}
      </span>
      <button className="sweep-step" type="button" aria-label={moreLabel} onPointerDown={(event) => press(1, event)}>
        +
      </button>
    </span>
  );
}

function BondPop({ who, giftName, from, gain, roomsBefore, sound, held, canAgain, batch, onLevel, onDismiss, onAgain }) {
  const [shown, setShown] = useState(from);
  const [rooms, setRooms] = useState(roomsBefore);
  const [burst, setBurst] = useState(0);
  const [line, setLine] = useState("");
  const [runs, setRuns] = useState(1);
  const heard = useRef(null);
  const levelRef = useRef(onLevel);
  const batchRef = useRef(batch);
  levelRef.current = onLevel;
  if (batchRef.current !== batch) {
    batchRef.current = batch;
    setShown(from);
    setRooms(roomsBefore);
    setBurst(0);
    setLine("");
  }
  const count = Math.max(1, Math.min(held || 1, runs));

  useEffect(() => {
    let dead = false;
    const timers = [];
    let raf = 0;
    const wait = (ms) => new Promise((resolve) => {
      timers.push(window.setTimeout(resolve, ms));
    });
    const fill = (start, end) => new Promise((resolve) => {
      const begun = performance.now();
      const step = (now) => {
        if (dead) {
          resolve();
          return;
        }
        const t = Math.min(1, (now - begun) / 720);
        const eased = 1 - (1 - t) ** 2;
        setShown(Math.round(start + (end - start) * eased));
        if (t < 1) raf = requestAnimationFrame(step);
        else resolve();
      };
      raf = requestAnimationFrame(step);
    });
    (async () => {
      if (sound && heard.current !== batch) {
        heard.current = batch;
        playGift();
      }
      await wait(50);
      if (dead) return;
      let cursor = from;
      let room = roomsBefore;
      let left = gain;
      while (!dead && left > 0 && room < 3) {
        const stepGain = Math.min(left, BOND_NEED - cursor);
        const next = cursor + stepGain;
        await fill(cursor, next);
        if (dead) return;
        left -= stepGain;
        cursor = next;
        if (cursor >= BOND_NEED && room < 3) {
          const storyIndex = room;
          room += 1;
          const pct = (room - roomsBefore) * BOND_STORY_PCT;
          setBurst(room);
          setLine(`ATK +${pct}%, HP +${pct}%, DEF +${pct}%`);
          levelRef.current(storyIndex);
          await wait(900);
          if (dead) return;
          cursor = 0;
          setRooms(room);
          setShown(room >= 3 ? BOND_NEED : 0);
          if (room >= 3) break;
          await wait(90);
        }
      }
    })();
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [batch, from, gain, roomsBefore, sound]);

  const capped = rooms >= 3;
  return createPortal(
    <div className="sheet-scrim" role="presentation" onClick={onDismiss}>
      <article
        className={`sheet bond-gain${capped ? " is-complete" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Bond"
        onClick={(event) => event.stopPropagation()}
      >
        {burst > 0 && <BondBurst key={burst} element={who.element} big={burst >= 3} />}
        <div className="bond-body">
          <div className="kit-head">
            <Portrait c={who} owned bust />
            <div>
              <p className="kicker">{giftName}</p>
              <h2>{who.name}</h2>
            </div>
          </div>
          <p className="gift-flash">Bond +{gain}</p>
          <GrowthBar
            label="Bond"
            icon="bond"
            current={shown}
            max={BOND_NEED}
            capped={capped}
            tone="bond"
          />
          <p className={burst ? "bond-rooms is-pop" : "bond-rooms"}>
            <Purse kind="story" />
            <b>{rooms}/3</b>
          </p>
          {line && <p className="camp-cheer" role="status">{line}</p>}
        </div>
        <div className="bond-actions">
          {canAgain && (
            <div className="sweep-row">
              <button className="primary" type="button" onClick={() => onAgain(count)}>
                Give
              </button>
              <CountStep
                value={count}
                max={held}
                onChange={setRuns}
                lessLabel="Fewer gifts"
                moreLabel="More gifts"
              />
            </div>
          )}
          <button className="primary" type="button" onClick={onDismiss}>
            Close
          </button>
        </div>
      </article>
    </div>,
    document.body
  );
}

function GreenRoom() {
  const { save, dispatch, setGoal, setHuntOpen } = useGame();
  const ownedIds = CHARACTERS.filter((c) => save.roster[c.id]).map((c) => c.id);
  const [selected, setSelected] = useState(ownedIds[0] ?? null);
  const [rise, setRise] = useState(false);
  const [bloom, setBloom] = useState(false);
  const [bondPop, setBondPop] = useState(null);
  const [cheer, setCheer] = useState(null);
  const [query, setQuery] = useState("");
  const [giftRuns, setGiftRuns] = useState({});
  const cheerTimer = useRef(0);
  const sungStory = useRef(new Set());
  const active = ownedIds.includes(selected) ? selected : (ownedIds[0] ?? null);
  const needle = query.trim().toLowerCase();
  const shown = ownedIds.filter((id) => !needle || character(id).name.toLowerCase().includes(needle));
  const current = active ? character(active) : null;
  const owned = active ? save.roster[active] : null;

  function celebrate(kind, line) {
    window.clearTimeout(cheerTimer.current);
    setCheer({ kind, line });
    setBloom(true);
    setRise(true);
    cheerTimer.current = window.setTimeout(() => {
      setCheer(null);
      setBloom(false);
      setRise(false);
    }, 2400);
  }

  function train(cardId) {
    const cost = skillCost(skillRank(owned, cardId));
    const have = save.insight || 0;
    if (have < cost) {
      setGoal({ kind: "note", need: cost, have, who: current.name, what: "rank up" });
      setHuntOpen(true);
      return;
    }
    dispatch({ type: "TRAIN", id: active, cardId });
    setRise(true);
    if (save.sound) playRank();
    window.setTimeout(() => setRise(false), 1200);
  }

  function offer(giftId, count = 1) {
    const held = save.gifts[giftId] || 0;
    if (held <= 0) {
      const gift = GIFTS[giftId];
      setGoal({ kind: giftId, need: 1, have: 0, who: current.name, what: `give a ${gift.name}` });
      setHuntOpen(true);
      return;
    }
    const result = giveGifts(save, active, giftId, Math.min(held, count));
    if (result.state === save) return;
    dispatch({ type: "REPLACE", state: result.state });
    setBondPop((prev) => ({
      giftId,
      gain: result.gain || 0,
      from: owned.bond || 0,
      roomsBefore: owned.rooms || 0,
      unlocked: [...(prev && prev.giftId === giftId ? prev.unlocked : []), ...result.unlocked],
      batch: (prev?.batch || 0) + 1,
    }));
  }

  if (!current || !owned) {
    return (
      <section>
        <h1>Camp</h1>
        <p>Summon someone first. There's nobody here to sit with.</p>
      </section>
    );
  }

  const stats = unitStats(current, owned);
  return (
    <section className="green relative isolate">
      <div className="camp-picker">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find someone"
          aria-label="Find someone"
        />
        <div className="camp-strip h-scroll">
          {shown.map((id) => {
            const c = character(id);
            return (
              <button
                key={id}
                className={`${id === active ? "on" : ""} rarity-card rarity-${c.rarity}${c.legend ? " is-legend" : ""}${rise && id === active ? " is-rising" : ""}`}
                onClick={() => setSelected(id)}
              >
                <span className={`camp-art rarity-${c.rarity}${c.legend ? " is-legend" : ""}`}>
                  <Portrait c={c} owned growth={save.roster[id]} bust />
                </span>
                {bloom && id === active && <BondBurst element={c.element} big={cheer?.kind === "bond" || cheer?.kind === "ascend"} />}
                <span>{c.name}</span>
              </button>
            );
          })}
          {shown.length === 0 && <p className="quiet">Nobody by that name.</p>}
        </div>
      </div>
      <div>
        <article className={`panel camp-sheet${cheer ? " is-cheering" : ""}`}>
        {cheer?.kind === "ascend" && (
          <>
            <BondBurst element={current.element} big />
            <p className="camp-cheer cheer-ascend" role="status">
              {cheer.line}
            </p>
          </>
        )}
        <p className="tile-meta">
          <span className={`rarity-badge rarity-${current.rarity}`}>{current.rarity}</span>
          <RoleMark role={current.role} />
          <ElementMark element={current.element} />
        </p>
        <h1>{current.name}</h1>
        <p className="card-title">{current.title}</p>
        <p className="lede kit-blurb">{current.quote}</p>
        <div className="stat-board">
          <div>
            <b>
              {owned.level || 1}
              <span>/{levelCap(owned)}</span>
            </b>
            <span>Level</span>
          </div>
          <div>
            <b>{stats.maxHp}</b>
            <span>HP</span>
          </div>
          <div>
            <b>{stats.atk}</b>
            <span>ATK</span>
          </div>
          <div>
            <b>{stats.def}</b>
            <span>DEF</span>
          </div>
          <div>
            <b>{Math.round(stats.crit * 100)}%</b>
            <span>Crit</span>
          </div>
          <div>
            <b>{Math.round(stats.critDmg * 100)}%</b>
            <span>Crit DMG</span>
          </div>
          <div>
            <b>{Math.round(stats.res * 100)}%</b>
            <span>RES</span>
          </div>
          <div>
            <b>{starsOf(owned.copies)}</b>
            <span>★</span>
          </div>
          <div className={cheer?.kind === "bond" ? "is-pop" : ""}>
            <Purse kind="story" />
            <b>{owned.rooms}/3</b>
          </div>
          <div className={cheer?.kind === "ascend" ? "is-pop" : ""}>
            <AscendMark step={owned.ascend || 0} inline />
            <span>Ascension</span>
          </div>
        </div>
        <p className="growth-help">
          <Tip label="i" wide>
            <span>Stars come from extra copies: 1, then 4, 9, 16, and 25. Three stars open the passive. Five stars is full. A copy after that is a relic for an SSR, wildflowers for an SR, and a road letter for an R.</span>
            <span>Ascension is paid here with marks and shards, and only once you are at the level cap. The steps raise the cap from 20 to 40, then 60, then 80. There are three steps.</span>
            <span>Each bond rank adds {BOND_STORY_PCT}% health, attack, and defense. Three ranks is the full bond. Bond points fill to {BOND_NEED}. At {BOND_NEED}, the next rank opens and that bonus is added.</span>
          </Tip>
          Stars, ascension, and bond
        </p>
        {(owned.ascend || 0) < ASCEND_CAPS.length - 1 && (owned.level || 1) >= levelCap(owned) && (
          <button
            className="primary"
            onClick={() => {
              const price = ascendPrice(owned.ascend || 0);
              const marks = save.applause || 0;
              const shards = save.shards || 0;
              if (shards < price.shards) {
                setGoal({ kind: "shard", need: price.shards, have: shards, who: current.name, what: "ascend" });
                setHuntOpen(true);
                return;
              }
              if (marks < price.marks) {
                setGoal({ kind: "mark", need: price.marks, have: marks, who: current.name, what: "ascend" });
                setHuntOpen(true);
                return;
              }
              dispatch({ type: "ASCEND", id: active });
              const step = (owned.ascend || 0) + 1;
              celebrate("ascend", `Ascended. Level cap is ${ASCEND_CAPS[step]}.`);
              if (save.sound) playAscend();
            }}
          >
            Ascend · {ascendPrice(owned.ascend || 0).marks} marks · {ascendPrice(owned.ascend || 0).shards} shards
          </button>
        )}
        <GrowthBar
          label="Experience"
          icon="xp"
          current={owned.xp || 0}
          max={xpToNext(owned.level || 1)}
          capped={(owned.level || 1) >= levelCap(owned)}
          tone="heat"
        />
        <GrowthBar
          label="Bond"
          icon="bond"
          current={owned.rooms >= 3 ? BOND_NEED : owned.bond || 0}
          max={BOND_NEED}
          capped={owned.rooms >= 3}
          tone="bond"
        />
        <p className="meter-row">
          <Purse kind="shard" />
          <b>{save.shards || 0}</b>
        </p>
        <p className="meter-row">
          <Purse kind="note" />
          <b>{save.insight || 0}</b>
        </p>
        <div className="kit-cards">
          <PassiveCard id={current.id} copies={owned.copies} />
          {current.cards.map((card) => {
            const rank = skillRank(owned, card.id);
            const cost = skillCost(rank);
            return (
              <article key={card.id} className={`kit-card tone-${current.element}`}>
                <SkillArt card={card} />
                <CardFacts card={card} def={current} owned={owned} rank={rank} />
                <strong>{card.name}</strong>
                <p>{describeCard(withGrowth({ ...card, ...(COMBOS[card.id] || {}) }, rank))}</p>
                {rank < 5 ? (
                  <button className="ghost" onClick={() => train(card.id)}>
                    Rank up
                    <img className="purse" src={`${import.meta.env.BASE_URL}icons/note.png`} alt="" />
                    {cost}
                  </button>
                ) : (
                  <p className="quiet">Fully raised.</p>
                )}
              </article>
            );
          })}
        </div>
        {owned.rooms < 3 && (
          <div className="gift-row">
            {Object.values(GIFTS).map((gift) => {
              const fav = current.favorite === gift.id;
              const gain = fav ? Math.round(gift.value * 1.5) : gift.value;
              const held = save.gifts[gift.id] || 0;
              return (
                <article key={gift.id} className={fav ? "gift-card is-fav" : "gift-card"}>
                  <img className="purse" src={`${import.meta.env.BASE_URL}icons/${gift.id}.png`} alt="" />
                  <div className="gift-copy">
                    <b>
                      {gift.name}
                      {fav ? " ★" : ""}
                    </b>
                    <span>{held} held · +{gain} bond</span>
                  </div>
                  <div className="gift-actions">
                    <button className="primary gift-use" type="button" onClick={() => offer(gift.id, Math.max(1, Math.min(held, giftRuns[gift.id] || 1)))}>
                      {held > 0 ? "Use" : "Need more"}
                    </button>
                    {held > 0 && (
                      <CountStep
                        value={Math.max(1, Math.min(held, giftRuns[gift.id] || 1))}
                        max={held}
                        onChange={(next) => setGiftRuns((current) => ({ ...current, [gift.id]: next(Math.max(1, Math.min(held, current[gift.id] || 1))) }))}
                        lessLabel={`Fewer ${gift.name}`}
                        moreLabel={`More ${gift.name}`}
                      />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
        </article>
      </div>
      {bondPop && (
        <BondPop
          who={current}
          giftName={GIFTS[bondPop.giftId]?.name || "Gift"}
          from={bondPop.from}
          gain={bondPop.gain}
          roomsBefore={bondPop.roomsBefore}
          sound={save.sound}
          held={save.gifts[bondPop.giftId] || 0}
          canAgain={(save.gifts[bondPop.giftId] || 0) > 0 && (owned.rooms || 0) < 3}
          batch={bondPop.batch || 1}
          onLevel={(index) => {
            if (sungStory.current.has(index)) return;
            sungStory.current.add(index);
            if (!save.sound) return;
            if (index === 2) playBondMax();
            else playBond();
          }}
          onAgain={(count) => offer(bondPop.giftId, count)}
          onDismiss={() => setBondPop(null)}
        />
      )}
    </section>
  );
}

function formatLeft(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDuration(minutes) {
  if (minutes >= 60 && minutes % 60 === 0) {
    const hours = minutes / 60;
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  return `${minutes} min`;
}

function OnAir() {
  const { save, dispatch } = useGame();
  const owned = CHARACTERS.filter((c) => save.roster[c.id]);
  const [cues, setCues] = useState(() => randomCues());
  const [picks, setPicks] = useState(() => suggestAir(CHARACTERS.filter((c) => save.roster[c.id]), cues, save.roster));
  const [tick, setTick] = useState(0);
  const errand = save.errand;
  const hadErrand = useRef(Boolean(errand));

  useEffect(() => {
    if (hadErrand.current && !errand) setCues(randomCues());
    hadErrand.current = Boolean(errand);
  }, [errand]);

  useEffect(() => {
    if (errand) return;
    setPicks(suggestAir(CHARACTERS.filter((c) => save.roster[c.id]), cues, save.roster));
  }, [cues, errand]);

  useEffect(() => {
    if (!errand) return undefined;
    setTick((n) => n + 1);
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [errand]);

  useEffect(() => {
    const rests = (errand?.jobs || []).filter((job) => job?.restUntil);
    if (!rests.length) return undefined;
    const wait = Math.max(0, Math.min(...rests.map((job) => job.restUntil)) - Date.now());
    const id = window.setTimeout(() => dispatch({ type: "TICK_JOBS" }), wait + 40);
    return () => window.clearTimeout(id);
  }, [errand, dispatch]);

  const now = Date.now() + tick * 0;
  const jobs = errand?.jobs || planErrand(picks, cues).jobs.map((job) => ({ ...job, endsAt: null }));
  const allBack = Boolean(errand && jobs.every((job) => !job || job.collected));
  const chosen = picks.filter(Boolean);
  const readyToSend = !errand && chosen.length === 3 && new Set(chosen).size === 3;

  function assignPick(index, id) {
    setPicks((prev) => {
      const next = [...prev];
      while (next.length < 3) next.push(null);
      if (!id) {
        next[index] = null;
        return next;
      }
      const other = next.findIndex((item, slot) => item === id && slot !== index);
      if (other >= 0) next[other] = next[index] || null;
      next[index] = id;
      return next;
    });
  }

  function sendChosen() {
    if (!readyToSend) return;
    dispatch({ type: "SEND_ERRAND", errand: planErrand(picks, cues) });
  }

  return (
    <section className="job-page relative isolate">
      <header className="page-intro">
        <p className="kicker">Three jobs</p>
        <h1>Jobs</h1>
        <p className="lede">
          {errand
            ? "Collect a job when its timer ends. That slot then rests for the same amount of time. New jobs appear once every slot is ready."
            : "Three dispatches. Send one unit on each. A matching element pays the full reward."}
        </p>
      </header>
      <div className="job-board">
        {jobs.map((job, index) => {
          if (!job) {
            return (
              <article key={`open-${index}`} className="panel job-card">
                <p className="kicker">Cooldown</p>
                <p className="job-clock">Ready</p>
              </article>
            );
          }
          if (job.restUntil) {
            const left = job.restUntil - now;
            return (
              <article key={`rest-${index}`} className="panel job-card">
                <p className="kicker">Cooldown</p>
                <p className="job-clock">{left > 0 ? formatLeft(left) : "Ready"}</p>
              </article>
            );
          }
          const mood = MOODS.find((item) => item.element === job.element) || MOODS[0];
          const person = job.id ? character(job.id) : null;
          const left = job.endsAt ? job.endsAt - now : null;
          const ready = Boolean(errand && !job.collected && left != null && left <= 0);
          return (
            <article key={`${job.element}-${index}`} className="panel job-card">
              <p className="tile-meta">
                <ElementMark element={job.element} />
                <span>{errand ? (job.collected ? "Done" : ready ? "Ready" : "Out") : formatDuration(job.minutes)}</span>
              </p>
              <h2>{mood.label}</h2>
              <p>{mood.detail}</p>
              {person ? (
                <div className="job-person">
                  <Portrait c={person} owned bust />
                  <div>
                    <h3>{person.name}</h3>
                    <p>{job.match ? "Element bonus" : "No element bonus. Reward is reduced."}</p>
                  </div>
                </div>
              ) : (
                <p>Choose someone for this job.</p>
              )}
              {!errand && (
                <label className="job-pick">
                  Who goes
                  <select
                    value={picks[index] || ""}
                    onChange={(event) => assignPick(index, event.target.value)}
                  >
                    <option value="">Choose</option>
                    {owned.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} · {ELEMENTS[unit.element]?.label || unit.element}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {errand && !job.collected && !ready && <p className="job-clock">{formatLeft(left)}</p>}
              <Pay marks={job.marks} gift={job.gift} />
              {errand && (
                <button className="primary" disabled={!ready} onClick={() => dispatch({ type: "COLLECT_JOB", index })}>
                  {job.collected ? "Collected" : ready ? "Collect" : "Still out"}
                </button>
              )}
            </article>
          );
        })}
      </div>
      {!errand && (
        <div className="job-send">
          <button className="ghost" type="button" disabled={owned.length < 3} onClick={() => setPicks(suggestAir(owned, cues, save.roster))}>
            Best fit
          </button>
          <button className="primary go" type="button" disabled={!readyToSend} onClick={sendChosen}>
            {owned.length < 3 ? "Need 3 people" : readyToSend ? "Send these three" : "Choose 3 people"}
          </button>
        </div>
      )}
      {allBack && (
        <button className="primary go" onClick={() => dispatch({ type: "CLEAR_ERRAND" })}>
          New jobs
        </button>
      )}
    </section>
  );
}

function strongestFoe(enemies = []) {
  return enemies.reduce((best, enemy) => {
    const score = (foe) => (foe.role === "boss" ? 1000000 : 0) + (foe.atk || 0) * 100 + (foe.maxHp || 0);
    if (!best || score(enemy) > score(best)) return enemy;
    return best;
  }, null);
}

function StageStars({ count = 1 }) {
  const n = Math.max(1, Math.min(5, Number(count) || 1));
  return (
    <span className="stage-stars" aria-label={`Difficulty ${n} of 5`}>
      <span className="stage-diff">Difficulty</span>
      {"★".repeat(n)}
      <span className="stage-empty">{"☆".repeat(5 - n)}</span>
    </span>
  );
}

const FULL_FOE = new Set(["boar", "chair", "grip", "heckler", "host", "lamp", "mire", "reply", "rig", "wisp", "flare", "gale", "tide", "stone", "veil"]);

function stageFoeSrc(foe) {
  const art = String(foe?.art || foe?.id || "");
  const stem = art.split("-")[0];
  if (art.startsWith("foe-") || (art && FULL_FOE.has(stem))) return `${import.meta.env.BASE_URL}enemies/${art}.png`;
  return `${import.meta.env.BASE_URL}enemies/portrait-${foe?.element || "stone"}.png`;
}

function StageBanner({ kicker, title, detail, foe, enemies, open, ready, actionLabel, onFight, pay, stars = 1, boss = false, children }) {
  const [roster, setRoster] = useState(false);
  const element = foe?.element || "stone";
  const foes = enemies?.length ? enemies : foe ? [foe] : [];
  const isBoss = boss;
  return (
    <article className={`stage-banner tone-${element}${open ? "" : " is-locked"}${isBoss ? " is-boss" : ""}`} inert={open ? undefined : ""}>
      <div className="stage-banner-copy">
        <p className="kicker">{isBoss ? <span className="boss-mark">Boss</span> : kicker}</p>
        <StageStars count={stars} />
        <h2>{title}</h2>
        {detail ? <p>{detail}</p> : null}
        {pay}
      </div>
      {foe ? (
        <button type="button" className="stage-foe-btn" aria-label={`Foes in ${title}`} onClick={() => setRoster(true)}>
          <img
            className="stage-foe"
            src={stageFoeSrc(foe)}
            alt=""
            onLoad={(event) => {
              if (event.currentTarget.naturalWidth >= 64) return;
              event.currentTarget.onerror = null;
              event.currentTarget.src = `${import.meta.env.BASE_URL}enemies/portrait-${element}.png`;
            }}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = `${import.meta.env.BASE_URL}enemies/${element}.png`;
            }}
          />
        </button>
      ) : null}
      <div className="stage-banner-actions">
        <button className="primary" type="button" disabled={!open || !ready} onClick={onFight}>
          {actionLabel}
        </button>
        {children}
      </div>
      {roster &&
        createPortal(
          <div className="sheet-scrim" onClick={() => setRoster(false)}>
            <div className="sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <p className="kicker">{title}</p>
              <h2>In this fight</h2>
              {foes.map((enemy) => (
                <article key={enemy.id || enemy.name} className="foe-kit">
                  <p>
                    <strong>{enemy.name}</strong>
                    <span>
                      {enemy.role || "foe"} · {ELEMENTS[enemy.element]?.label || enemy.element}
                    </span>
                  </p>
                  <ul>
                    {(enemy.kit || []).map((move) => (
                      <li key={`${enemy.name}-${move.name}`}>
                        <span>
                          {move.name}
                          {move.line ? <small>{move.line}</small> : null}
                        </span>
                        <em>{move.intent === "defend" ? "Block" : move.intent === "hex" ? "Hex" : move.intent === "mend" ? "Heal" : "Attack"}</em>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
              <button className="primary" type="button" onClick={() => setRoster(false)}>
                Close
              </button>
            </div>
          </div>,
          document.body
        )}
    </article>
  );
}

function TowerList({ save, ready, setStageId }) {
  const month = save.towerWeek || monthId();
  const floors = towerFor(month);
  return (
    <div className="stage-stack">
      {floors.map((floor) => {
        const open = stageUnlocked(save, floor.id);
        const done = Boolean(save.towerClears?.[floor.id]);
        const foe = strongestFoe(floor.enemies);
        return (
          <StageBanner
            key={floor.id}
            foe={foe}
            open={open}
            ready={ready && !done}
            boss={floor.boss}
            kicker={`Floor ${floor.number}`}
            stars={floor.stars}
            title={floor.name}
            detail={done ? "Cleared this month." : `${floor.enemies.length} ${floor.enemies.length === 1 ? "foe" : "foes"} · ${foe?.name || ""}`}
            actionLabel={!open ? "Locked" : done ? "Cleared" : !ready ? "Need a party" : "Fight"}
            onFight={() => setStageId(floor.id)}
            enemies={floor.enemies}
            pay={done ? null : <Pay marks={floor.firstReward} xp={stageXp(floor, false)} gift={floor.gift} />}
          />
        );
      })}
    </div>
  );
}

function Stages() {
  const { save, dispatch, setStageId } = useGame();
  const ready = partyMembers(save).length > 0;
  const [mode, setMode] = useState("story");
  const next = nextStoryNode(save);
  const [chapterId, setChapterId] = useState(next?.chapterId || "warmup");
  const drills = dailyStages();
  const cleared = dailyCleared(save);
  const modes = [
    ["story", "Story"],
    ["drill", "Drills"],
    ["tower", "Tower"],
    ["event", "Events"],
  ];
  const events = bondEvents();
  return (
    <section className="stage-page relative isolate">
      <div className="mode-tabs" role="tablist">
        {modes.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={mode === id} className={mode === id ? "on" : ""} onClick={() => setMode(id)}>
            {label}
          </button>
        ))}
      </div>
      {mode === "drill" && (
        <div className="stage-stack">
          {drills.map((stage) => {
            const done = stage.tier <= cleared;
            const open = stage.tier <= cleared + 1;
            const foe = strongestFoe(stage.enemies);
            return (
              <StageBanner
                key={stage.id}
                foe={foe}
                open={open}
                ready={ready}
                boss={!done && stage.tier === 5}
                kicker={done ? "Cleared" : `Drill ${stage.tier}`}
                stars={stage.stars}
                title={stage.name}
                detail={foe ? foe.name : stage.blurb}
                enemies={stage.enemies}
                actionLabel={done ? "Fight again" : !open ? "Locked" : !ready ? "Need a party" : "Fight"}
                onFight={() => setStageId(stage.id)}
                pay={
                  <Pay
                    marks={stage.firstReward}
                    xp={stageXp(stage, false)}
                    notes={done ? 0 : stage.notes}
                    bond={done ? 0 : stage.bond}
                    gift={done ? null : stage.gift}
                  />
                }
              >
                {done ? <SweepBox stageId={stage.id} save={save} dispatch={dispatch} /> : null}
              </StageBanner>
            );
          })}
        </div>
      )}
      {mode === "tower" && <TowerList save={save} ready={ready} setStageId={setStageId} />}
      {mode === "event" && (
        <div className="stage-stack">
          {EVENT_ROADS.map((road) => (
            <section key={road.lane} className={`event-road road-${road.lane}`}>
              <header className="event-road-head">
                <img
                  src={`${import.meta.env.BASE_URL}icons/${road.gift || (road.lane === "note" ? "note" : "shard")}.png`}
                  alt=""
                />
                <span>
                  <h2>{road.title}</h2>
                  <p>{road.line}</p>
                </span>
              </header>
              {events
                .filter((stage) => stage.lane === road.lane)
                .map((stage) => {
                  const foe = strongestFoe(stage.enemies);
                  const open = eventOpen(save, stage);
                  const cleared = Boolean(save.clears[stage.id]);
                  return (
                    <StageBanner
                      key={stage.id}
                      foe={foe}
                      open={open}
                      ready={ready}
                      boss={stage.tier === 5}
                      kicker={`${stage.tier} of 5`}
                      stars={stage.stars}
                      title={stage.name}
                      detail={foe ? foe.name : stage.blurb}
                      enemies={stage.enemies}
                      actionLabel={!open ? "Locked" : !ready ? "Need a party" : cleared ? "Fight again" : "Fight"}
                      onFight={() => setStageId(stage.id)}
                      pay={<Pay notes={stage.notes} shards={stage.shards} gift={stage.gift} giftCount={stage.giftCount} />}
                    >
                      {cleared ? <SweepBox stageId={stage.id} save={save} dispatch={dispatch} /> : null}
                    </StageBanner>
                  );
                })}
            </section>
          ))}
        </div>
      )}
      {mode === "story" && (
        <div className="stage-stack">
          {storyChapters().map((chapter) => {
            const won = chapter.nodes.filter((node) => storyClearCounts(save, node.id)).length;
            const expanded = chapterId === chapter.id;
            const boss = strongestFoe(chapter.nodes[chapter.nodes.length - 1].enemies);
            return (
              <div key={chapter.id} className="chapter-block">
                <button
                  type="button"
                  className={`chapter-toggle tone-${boss?.element || "stone"}`}
                  aria-expanded={expanded}
                  onClick={() => setChapterId(expanded ? "" : chapter.id)}
                >
                  <span>
                    <b>{won === chapter.nodes.length ? "Chapter clear" : `Chapter ${chapter.chapter}`}</b>
                    <strong>{chapter.name}</strong>
                    <em>
                      {won}/{chapter.nodes.length}
                    </em>
                  </span>
                  {boss ? (
                    <img
                      src={stageFoeSrc(boss)}
                      alt=""
                      onLoad={(event) => {
                        if (event.currentTarget.naturalWidth >= 64) return;
                        event.currentTarget.src = `${import.meta.env.BASE_URL}enemies/portrait-${boss.element}.png`;
                      }}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = `${import.meta.env.BASE_URL}enemies/portrait-${boss.element}.png`;
                      }}
                    />
                  ) : null}
                </button>
                {expanded &&
                  chapter.nodes.map((node) => {
                    const open = stageUnlocked(save, node.id);
                    const clears = storyClearCounts(save, node.id) ? (save.clears[node.id] ?? 0) : 0;
                    const foe = strongestFoe(node.enemies);
                    return (
                      <StageBanner
                        key={node.id}
                        foe={foe}
                        open={open}
                        ready={ready}
                        boss={node.boss}
                        kicker={`${node.part} of ${node.parts}`}
                        stars={node.stars}
                        title={node.sub}
                        detail={`${node.enemies.length} ${node.enemies.length === 1 ? "foe" : "foes"} · ${foe?.name || ""}`}
                        enemies={node.enemies}
                        actionLabel={!open ? "Locked" : !ready ? "Need a party" : clears ? "Fight again" : "Fight"}
                        onFight={() => setStageId(node.id)}
                        pay={<Pay marks={node.firstReward} xp={stageXp(node, false)} gift={clears ? null : node.gift} />}
                      >
                        {clears > 0 ? <SweepBox stageId={node.id} save={save} dispatch={dispatch} /> : null}
                      </StageBanner>
                    );
                  })}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SweepBox({ stageId, save, dispatch }) {
  const [runs, setRuns] = useState(1);
  const [note, setNote] = useState("");
  const [result, setResult] = useState(null);
  const chime = useRef(0);
  const hold = useRef(0);
  const showing = useRef(false);
  showing.current = Boolean(result);
  useEffect(
    () => () => {
      window.clearTimeout(chime.current);
      window.clearInterval(hold.current);
      if (showing.current) releaseMusic();
    },
    []
  );
  function closeSweep() {
    window.clearTimeout(chime.current);
    releaseMusic();
    if (save.sound) startMusic();
    setResult(null);
  }
  const reward = result?.reward;
  const people = reward?.snap ? Object.keys(reward.snap) : [];
  function stopHold() {
    window.clearInterval(hold.current);
    hold.current = 0;
  }
  function pressCount(dir, event) {
    event.preventDefault();
    const started = performance.now();
    const step = () => {
      const jump = performance.now() - started >= 500 ? 10 : 1;
      setRuns((current) => Math.max(1, Math.min(SWEEP_MAX, current + dir * jump)));
    };
    stopHold();
    step();
    hold.current = window.setInterval(step, 140);
    const end = () => {
      stopHold();
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }
  function runSweep() {
    const outcome = sweepStage(save, stageId, runs);
    if (!outcome.reward) {
      setNote("This fight cannot be swept yet.");
      return;
    }
    setNote("");
    dispatch({ type: "REPLACE", state: outcome.state });
    setResult(outcome);
    if (save.sound) {
      playResult("win");
      window.clearTimeout(chime.current);
      if (outcome.reward.levels?.length) chime.current = window.setTimeout(() => playLevel(), 720);
    }
  }
  return (
    <>
    <div className="sweep-row">
      <button className="ghost" type="button" onClick={runSweep}>
        Sweep
      </button>
      <button className="sweep-step" type="button" aria-label="Fewer sweeps" onPointerDown={(event) => pressCount(-1, event)}>
        −
      </button>
      <span className="sweep-count">
        {runs}/{SWEEP_MAX}
      </span>
      <button className="sweep-step" type="button" aria-label="More sweeps" onPointerDown={(event) => pressCount(1, event)}>
        +
      </button>
    </div>
      {note && <p className="sweep-note">{note}</p>}
      {reward &&
        createPortal(
        <div className="overlay" role="dialog" aria-label="Sweep results">
          <article className="scene-modal result-win result-sheet">
            <div className="sprite-row">
              {people.map((id) => {
                const def = character(id);
                const leveled = reward.levels?.find((row) => row.id === id);
                return (
                  <figure key={id} className={`unit-plate${leveled ? " did-level" : ""}`}>
                    <div className="bust-slot">
                      {leveled && <BustConfetti />}
                      {def ? <Portrait c={def} owned bust /> : null}
                    </div>
                    <figcaption>{def?.name?.split(" ")[0] || id}</figcaption>
                    <XpMeter owned={reward.snap[id]} gain={reward.xp || 0} />
                  </figure>
                );
              })}
            </div>
            <p className="kicker">Sweep</p>
            <h2>
              Swept {reward.runs} {reward.runs === 1 ? "time" : "times"}.
            </h2>
            <Pay
              marks={reward.applause || undefined}
              xp={reward.xp}
              notes={reward.notes}
              shards={reward.shards}
              gift={reward.gift}
              giftCount={reward.giftCount}
            />
            <div className="hero-actions">
              <button className="primary" type="button" onClick={closeSweep}>
                Close
              </button>
            </div>
          </article>
        </div>,
        document.body
        )}
    </>
  );
}

function ResultSweep({ stageId, save, dispatch }) {
  if (!canSweepStage(save, stageId)) return null;
  return <SweepBox stageId={stageId} save={save} dispatch={dispatch} />;
}

function ApReadout({ ap }) {
  return (
    <div className="ap-readout is-live" aria-label={`${ap} AP`}>
      <b key={ap}>{ap}</b>
    </div>
  );
}

function castFx(card) {
  const fx = [];
  if (card.ratio) fx.push("shot");
  if (card.heal) fx.push("heal");
  if (card.shield) fx.push("shield");
  if (card.crit || card.critDmg || card.defUp || card.res || card.might || card.charge) fx.push("buff");
  if (card.poison || card.stun || card.sleep || card.weaken || card.vuln || card.brand) fx.push("debuff");
  return fx;
}

function CastLayer({ fx }) {
  return (
    <div className="cast-layer" aria-hidden="true">
      {fx.includes("shot") && (
        <span className="fx fx-shot">
          <i className="pellet" />
          <i className="impact" />
        </span>
      )}
      {fx.includes("heal") && (
        <span className="fx fx-heal"><i>+</i><i>+</i><i>+</i></span>
      )}
      {fx.includes("shield") && <span className="fx fx-shield" />}
      {fx.includes("buff") && (
        <span className="fx fx-buff"><i /><i /><i /><i /></span>
      )}
      {fx.includes("debuff") && <span className="fx fx-debuff" />}
    </div>
  );
}

function SkillToken({ playable, onPlay, onRead, onLocked, children, className = "", label }) {
  const timer = useRef(0);
  const held = useRef(false);
  function arm() {
    held.current = false;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      held.current = true;
      onRead();
    }, 420);
  }
  function disarm() {
    window.clearTimeout(timer.current);
  }
  return (
    <button
      className={className}
      aria-label={label}
      onPointerDown={arm}
      onPointerUp={disarm}
      onPointerCancel={disarm}
      onPointerLeave={disarm}
      onContextMenu={(event) => event.preventDefault()}
      onClick={() => {
        if (held.current) {
          held.current = false;
          return;
        }
        if (playable) onPlay();
        else if (onLocked) onLocked();
      }}
    >
      {children}
    </button>
  );
}

function Battle({ stageId, onExit, paused = false, onSettings, onBindLeave }) {
  const { save, dispatch, setStageId, goal, setGoal, setHuntOpen, setStocked } = useGame();
  const stage = resolveStage(save, stageId);
  const [battle, setBattle] = useState(() => {
    const saved = readBattle();
    if (saved?.stageId === stageId && saved.battle && !saved.battle.result) return saved.battle;
    return (
      startBattle(save, stageId) || {
        party: [],
        enemies: [],
        hp: 1,
        maxHp: 1,
        stress: 0,
        ap: 0,
        hand: [],
        result: "lose",
        breakdown: false,
        poison: 0,
        stun: 0,
        sleep: 0,
        turn: 1,
        shield: 0,
      }
    );
  });
  const [target, setTarget] = useState(0);
  useEffect(() => {
    if (battle.enemies[target]?.hp > 0) return;
    const next = battle.enemies.findIndex((enemy) => enemy.hp > 0);
    if (next >= 0) setTarget(next);
  }, [battle, target]);
  const [floats, setFloats] = useState([]);
  const [reward, setReward] = useState(null);
  const [askLeave, setAskLeave] = useState(false);
  const [acting, setActing] = useState(null);
  const [enemySwing, setEnemySwing] = useState(null);
  const [past, setPast] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [inspect, setInspect] = useState(null);
  const [strain, setStrain] = useState(null);
  const [auto, setAuto] = useState(() => Boolean(save.autoStart));
  const wasPaused = useRef(paused);
  useEffect(() => {
    if (wasPaused.current && !paused && save.autoStart) setAuto(true);
    wasPaused.current = paused;
  }, [paused, save.autoStart]);
  const [ultShow, setUltShow] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [cardRead, setCardRead] = useState(null);
  const [askEnd, setAskEnd] = useState(false);
  const [ultWait, setUltWait] = useState(false);
  const [dealt, setDealt] = useState(0);
  const [critMark, setCritMark] = useState(null);
  const [hpCrit, setHpCrit] = useState(false);
  const critTimer = useRef(0);
  const hpTimer = useRef(0);
  const ultWaitTimer = useRef(0);
  const [ash, setAsh] = useState(null);
  const ultLock = useRef(false);
  const leaveRef = useRef(() => {});
  const ultTimer = useRef(0);
  const rewardLock = useRef(Boolean(battle?.result));
  const battleKey = useRef(`${stageId}-${Math.random().toString(36).slice(2, 8)}`);

  useEffect(() => {
    if (!acting) return undefined;
    const timer = setTimeout(() => {
      setActing(null);
      setAsh(null);
    }, acting.kind === "ego" ? 1200 : 820);
    return () => clearTimeout(timer);
  }, [acting]);

  useEffect(() => {
    const ratio = battle.hp / Math.max(1, battle.maxHp);
    setStrain((current) => {
      const wasHp = current === "hp" || current === "both";
      const wasStress = current === "stress" || current === "both";
      const low = wasHp ? ratio < 0.45 : ratio < 0.3;
      const tense = wasStress ? battle.stress >= 55 || battle.breakdown : battle.stress >= 80 || battle.breakdown;
      if (low && tense) return "both";
      if (low) return "hp";
      if (tense) return "stress";
      return null;
    });
  }, [battle.hp, battle.maxHp, battle.stress, battle.breakdown]);

  useEffect(() => {
    if (!battle.result || acting || enemySwing || ultShow) {
      setShowResult(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setShowResult(true), 480);
    return () => window.clearTimeout(timer);
  }, [battle.result, acting, enemySwing, ultShow]);

  useEffect(() => {
    if (!enemySwing) return undefined;
    const timer = setTimeout(() => setEnemySwing(null), 560);
    return () => clearTimeout(timer);
  }, [enemySwing]);

  useEffect(() => {
    if (!auto || paused || showLog || inspect || askLeave || askEnd || cardRead || battle.result || acting || enemySwing || ultShow) return undefined;
    const timer = setTimeout(() => {
      const choice = suggestAction(battle);
      if (choice.type === "card") {
        const played = act(choice.index, choice.target);
        if (!played) setAuto(false);
      } else if (choice.type === "ult") {
        const played = beginUlt(choice.id, choice.target);
        if (!played) setAuto(false);
      } else if (choice.type === "end") pass();
      else setAuto(false);
    }, 720);
    return () => clearTimeout(timer);
  }, [auto, paused, showLog, inspect, askLeave, askEnd, cardRead, battle, acting, enemySwing, ultShow]);

  useEffect(() => {
    setDealt(0);
  }, [battle.turn]);

  useEffect(() => {
    if (!battle || battle.result) writeBattle(null);
    else writeBattle({ stageId, battle });
  }, [battle, stageId]);

  const rewardRef = useRef(reward);
  rewardRef.current = reward;
  useEffect(() => {
    if (!showResult || !battle.result || !save.sound) return undefined;
    playResult(battle.result);
    const timer =
      battle.result === "win" && rewardRef.current?.levels?.length ? window.setTimeout(() => playLevel(), 720) : 0;
    return () => {
      if (timer) window.clearTimeout(timer);
      releaseMusic();
    };
  }, [showResult, battle.result, save.sound]);

  const saveNow = useRef(save);
  saveNow.current = save;
  const hunted = useRef(null);
  const toldStock = useRef(false);
  if (!battle?.result) {
    hunted.current = goal;
    toldStock.current = false;
  }
  useEffect(() => {
    if (battle?.result !== "win" || toldStock.current) return;
    toldStock.current = true;
    const wanted = hunted.current;
    if (!wanted) return;
    const have = stockOf(saveNow.current, wanted.kind);
    if (have < wanted.need) return;
    setStocked({ ...wanted, have });
    setGoal(null);
    setHuntOpen(false);
  }, [battle?.result, setGoal, setHuntOpen, setStocked]);

  function leave() {
    window.clearTimeout(ultTimer.current);
    window.clearTimeout(critTimer.current);
    window.clearTimeout(hpTimer.current);
    ultLock.current = false;
    writeBattle(null);
    onExit();
  }
  leaveRef.current = leave;
  useEffect(() => {
    if (!onBindLeave) return undefined;
    onBindLeave(() => leaveRef.current());
    return () => onBindLeave(null);
  }, [onBindLeave]);

  function remember() {
    setPast((stack) => [...stack, JSON.parse(JSON.stringify(battle))].slice(-20));
  }

  function undo() {
    setAuto(false);
    setAskEnd(false);
    const prev = past[past.length - 1];
    if (!prev) return;
    if (battle.result === "win" && reward) {
      dispatch({
        type: "UNDO_CLEAR",
        stageId,
        battleKey: battleKey.current,
        reward,
      });
      rewardLock.current = false;
      setReward(null);
    }
    setBattle(prev);
    setPast((stack) => stack.slice(0, -1));
    setAsh(null);
    setActing(null);
    setEnemySwing(null);
    setFloats([]);
    setDealt(0);
  }

  function commit(next, events) {
    setBattle(next);
    if (events?.length) {
      const born = events
        .map((event) => {
          const text = floatText(event);
          const onFoe = Boolean(!event.attack && event.target && event.amount && (event.crit || event.tone === "hit" || event.tone === "good"));
          if (!text && !onFoe) return null;
          return {
            ...event,
            text: text || String(event.amount),
            onFoe,
            foe: event.target,
            spotX: 12 + Math.random() * 62,
            spotY: 8 + Math.random() * 62,
          };
        })
        .filter(Boolean)
        .map((event) => ({
          ...event,
          key: `${Date.now()}-${Math.random()}`,
          x: 18 + Math.random() * 64,
        }));
      setFloats((prev) => [...prev, ...born].slice(-12));
      const dealtNow = born.filter((event) => event.onFoe).reduce((sum, event) => sum + (event.amount || 0), 0);
      if (dealtNow) setDealt((n) => n + dealtNow);
      const playerCrit = [...events].reverse().find((event) => event.crit && !event.attack);
      if (playerCrit) {
        setCritMark(playerCrit.target || true);
        window.clearTimeout(critTimer.current);
        critTimer.current = window.setTimeout(() => setCritMark(null), 900);
      }
      if (events.some((event) => event.crit && event.attack)) {
        setHpCrit(true);
        window.clearTimeout(hpTimer.current);
        hpTimer.current = window.setTimeout(() => setHpCrit(false), 720);
      }
      const hold = born.some((event) => event.crit || event.resist) ? 2400 : 1400;
      setTimeout(() => {
        setFloats((prev) => prev.filter((item) => !born.includes(item)));
      }, hold);
    }
    if (next.result === "win" && !rewardLock.current) {
      rewardLock.current = true;
      const result = clearStage(save, stageId);
      if (result.reward) {
        setReward(result.reward);
        dispatch({ type: "APPLY_CLEAR", state: result.state, battleKey: battleKey.current });
      }
    }
  }

  function soundFor(card, events) {
    if (events?.some((event) => event.crit)) playHit("crit");
    else if (events?.some((event) => event.amount && (event.tone === "hit" || event.tone === "good"))) playHit();
    else if (card?.shield) playHit("guard");
  }

  function act(handIndex, targetOverride) {
    const aim = targetOverride ?? target;
    const card = battle.hand[handIndex];
    const preview = playCard(battle, handIndex, aim);
    if (preview.error) return false;
    if (targetOverride != null) setTarget(aim);
    remember();
    if (card) {
      setAsh({ uid: card.uid, card, index: handIndex });
      setActing({
        id: card.ownerId,
        cardId: card.id,
        kind: card.kind,
        hit: Boolean(card.ratio),
        cardName: card.name,
        ownerName: card.ownerName,
        target: aim,
        fx: castFx(card),
        key: Date.now(),
      });
    }
    if (save.sound) soundFor(card, preview.events);
    commit(preview.battle, preview.events);
    return true;
  }

  function castUlt(memberId, targetOverride) {
    const aim = targetOverride ?? target;
    const preview = playUlt(battle, memberId, aim);
    if (preview.error) return false;
    const owner = battle.party.find((member) => member.id === memberId);
    const ego = owner?.cards.find((card) => card.kind === "ego");
    remember();
    if (ego) {
      setActing({
        id: memberId,
        cardId: ego.id,
        kind: "ego",
        hit: Boolean(ego.ratio),
        cardName: ego.name,
        ownerName: owner.name,
        target: aim,
        key: Date.now(),
      });
    }
    if (save.sound) soundFor(ego, preview.events);
    commit(preview.battle, preview.events);
    return true;
  }

  function beginUlt(memberId, targetOverride) {
    if (ultLock.current || battle.result || battle.breakdown) return false;
    const aim = targetOverride ?? target;
    const preview = playUlt(battle, memberId, aim);
    if (preview.error) return false;
    const owner = battle.party.find((member) => member.id === memberId);
    const ego = owner?.cards.find((card) => card.kind === "ego");
    if (!owner || !ego) return false;
    ultLock.current = true;
    const slot = battle.party.findIndex((member) => member.id === memberId);
    setUltShow({
      id: memberId,
      skillId: ego.id,
      name: ego.name,
      element: owner.element,
      word: ULT_BURST[memberId] || "NOW",
      color: owner.color,
      slot: slot < 0 ? 0 : slot,
    });
    if (save.sound) playUltStamp();
    window.clearTimeout(ultTimer.current);
    ultTimer.current = window.setTimeout(() => {
      ultLock.current = false;
      setUltShow(null);
      castUlt(memberId, targetOverride);
    }, 1000);
    return true;
  }

  function pass() {
    setDealt(0);
    remember();
    const { battle: next, events } = endTurn(battle);
    const actors = (events || []).filter((event) => event.foeId && event.intent);
    if (actors.length) {
      setEnemySwing({
        ids: actors.map((event) => event.foeId),
        modes: Object.fromEntries(actors.map((event) => [event.foeId, event.intent])),
        hurt: actors.some((event) => event.hit),
        key: Date.now(),
      });
    }
    if (save.sound && actors.some((event) => event.crit)) playHit("crit");
    else if (save.sound && actors.some((event) => event.hit)) playHit("hurt");
    commit(next, events, next.result === "lose" ? "lose" : "pass");
  }

  function rematch() {
    releaseMusic();
    if (save.sound) startMusic(toughStage(stageId) ? "boss" : "battle");
    rewardLock.current = false;
    battleKey.current = `${stageId}-${Math.random().toString(36).slice(2, 8)}`;
    setReward(null);
    setFloats([]);
    setBattle(startBattle(save, stageId));
    setPast([]);
    setTarget(0);
  }

  const living = battle.enemies.findIndex((enemy) => enemy.hp > 0);
  const handOrder = useRef(null);
  const foeHold = useRef(0);
  const foeHeld = useRef(false);
  const byId = new Map(battle.hand.map((card) => [card.uid, card]));
  if (ash && !byId.has(ash.uid)) byId.set(ash.uid, { ...ash.card, burning: true });
  const liveIds = battle.hand.map((card) => card.uid);
  let deal = handOrder.current;
  if (!deal || Array.isArray(deal) || deal.turn !== battle.turn) {
    deal = { turn: battle.turn, uids: liveIds };
  } else {
    const known = new Set(deal.uids);
    const added = liveIds.filter((uid) => !known.has(uid));
    if (added.length) deal = { turn: battle.turn, uids: [...deal.uids, ...added] };
  }
  handOrder.current = deal;
  const laidHand = deal.uids.map((uid) => byId.get(uid) || { uid, gone: true });

  if (!stage) {
    return (
      <section>
        <h1>That fight isn't open.</h1>
        <button className="primary" onClick={onExit}>
          Back
        </button>
      </section>
    );
  }

  const ahead = battle.result === "win" ? nextFight(save, stageId) : null;

  return (
    <section className={`battle${strain ? ` strain-${strain}` : ""}`}>
      {acting && acting.kind !== "ego" && acting.fx?.length > 0 && (
        <CastLayer key={acting.key} fx={acting.fx} />
      )}
      <span className="battle-tools">
        <span className="tool-row">
          <button className="ghost" onClick={() => setShowLog(true)}>Log</button>
          {!battle.result && (
            <button className={auto ? "primary auto-on" : "ghost"} onClick={() => setAuto((on) => !on)}>
              {auto ? "Auto on" : "Auto"}
            </button>
          )}
          <button className="ghost" onClick={onSettings}>Settings</button>
        </span>
        {dealt > 0 && <span className="dmg-tally">{dealt} DMG</span>}
      </span>
      <div className="battle-top">
        <div className="battle-vitals">
          <HealthBar label="HP" hp={battle.hp} maxHp={battle.maxHp} shield={battle.shield} crit={hpCrit} />
          <StressBar label="Stress" stress={battle.stress} />
          <BattleBuffs battle={battle} />
          {((battle.poison || 0) > 0 || (battle.stun || 0) > 0 || (battle.sleep || 0) > 0) && (
            <p className="vital-line">
              {(battle.poison || 0) > 0 && <span className="pill pill-poison">Poison {battle.poison}</span>}
              {(battle.stun || 0) > 0 && <span className="pill pill-stun">Stunned · skips the next action</span>}
              {(battle.sleep || 0) > 0 && <span className="pill">Sleep</span>}
            </p>
          )}
          {battle.breakdown && <p className="quiet">Locked up. Softer hits, no ults.</p>}
        </div>
      </div>

      <div className="battle-stage">
        <div className={`enemies foes-${battle.enemies.length}`}>
          {battle.enemies.map((enemy, i) => {
            const dead = enemy.hp <= 0;
            const raging = !dead && enemy.hp / enemy.maxHp <= 0.35;
            const mode = enemySwing?.modes?.[enemy.id];
            return (
              <article
                key={enemy.id}
                className={`foe foe-${enemy.id}${dead ? " is-down" : ""}${i === target && !dead ? " selected" : ""}${
                  acting?.hit && i === acting.target ? " struck" : ""
                }${mode ? ` acting mode-${mode}` : ""}${raging ? " raging" : ""}${enemy.sleep ? " afflicted-sleep" : ""}${
                  enemy.stun ? " afflicted-stun" : ""
                }${enemy.poison ? " afflicted-poison" : ""}${enemy.weak ? " afflicted-weak" : ""}${enemy.shield ? " buff-block" : ""}`}
              >
                <button
                  className="foe-hit"
                  disabled={dead}
                  tabIndex={dead ? -1 : undefined}
                  aria-hidden={dead || undefined}
                  aria-label={`Target ${enemy.name}`}
                  onPointerDown={() => {
                    foeHeld.current = false;
                    window.clearTimeout(foeHold.current);
                    foeHold.current = window.setTimeout(() => {
                      foeHeld.current = true;
                      setInspect({ kind: "foe", index: i });
                    }, 420);
                  }}
                  onPointerUp={() => window.clearTimeout(foeHold.current)}
                  onPointerLeave={() => window.clearTimeout(foeHold.current)}
                  onClick={() => {
                    if (foeHeld.current) {
                      foeHeld.current = false;
                      return;
                    }
                    setTarget(i);
                  }}
                >
                  <span className="foe-figure">
                    {i === target && !dead ? <i className="aim-mark" aria-hidden="true" /> : null}
                    {critMark && (critMark === enemy.name || critMark === true) && !dead ? (
                      <span className="crit-mark" aria-hidden="true">!</span>
                    ) : null}
                    {floats.filter((item) => item.onFoe && item.foe === enemy.name).map((item) => (
                      <span
                        key={item.key}
                        className={`hit-num tone-${item.crit ? "crit" : "hit"}`}
                        style={{ left: `${item.spotX}%`, top: `${item.spotY}%` }}
                      >
                        {item.text}
                      </span>
                    ))}
                    <FoeArt enemy={enemy} raging={raging} mode={mode} />
                  </span>
                  <span className="foe-mini">
                    <span className="foe-mini-hp">
                      <img className="mark-img" src={`${import.meta.env.BASE_URL}icons/${enemy.element}.png`} alt={ELEMENTS[enemy.element].label} />
                      <HealthBar hp={enemy.hp} maxHp={enemy.maxHp} shield={enemy.shield} />
                    </span>
                    <span className="foe-marks">
                      <StatusMarks marks={foeMarks(enemy)} />
                    </span>
                  </span>
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <div className="battle-tray">
      <div className="ult-stack">
        {battle.party.map((member) => {
          const ego = member.cards.find((card) => card.kind === "ego");
          if (!ego) return null;
          const cap = member.ultMax || 100;
          const energy = battle.energy?.[member.id] || 0;
          const ready = energy >= cap && !battle.breakdown && !battle.result;
          const pct = Math.max(0, Math.min(100, cap > 0 ? (energy / cap) * 100 : 0));
          return (
            <SkillToken
              key={member.id}
              className={`ult-chip${ready ? " is-ready" : ""}`}
              label={`${member.name}, ult ${energy} of ${cap}`}
              playable={ready}
              onPlay={() => beginUlt(member.id)}
              onLocked={() => {
                setUltWait(true);
                window.clearTimeout(ultWaitTimer.current);
                ultWaitTimer.current = window.setTimeout(() => setUltWait(false), 1100);
              }}
              onRead={() => setCardRead({ card: { ...ego, ownerName: member.name, cost: 0, element: member.element }, preview: null, adv: 0, ult: true, energy, cap })}
            >
              <span className="ult-plate">
                <SkillArt card={{ ...ego, element: member.element }} />
              </span>
              <span className="ult-gauge" aria-hidden="true">
                <i style={{ width: `${pct}%` }} />
              </span>
            </SkillToken>
          );
        })}
      </div>
        <ApReadout ap={battle.ap} />
        <div className="skill-line">
        <div className="hand skill-row">
          {laidHand.map((card) => {
            if (card.gone) return <span key={card.uid} className="skill-gap" />;
            const owner = battle.party.find((member) => member.id === card.ownerId);
            const foe = battle.enemies[target]?.hp > 0 ? battle.enemies[target] : battle.enemies[living];
            const playable =
              !battle.result &&
              battle.ap >= card.cost &&
              !(card.once && (battle.egoUsed[card.ownerId] || battle.breakdown));
            const preview = previewDamage(card, owner, foe, battle.breakdown, { soft: battle.soft, might: battle.might });
            const adv = foe && card.ratio ? advantage(card.element, foe.element) : 0;
            return (
              <SkillToken
                key={card.uid}
                className={`skill-token kind-${card.kind} tone-${card.element || "stone"}${playable ? "" : " is-dim"}${card.burning ? " is-burning" : ""}`}
                playable={playable && !card.burning}
                onPlay={() => act(battle.hand.findIndex((item) => item.uid === card.uid))}
                onRead={() => setCardRead({ card, preview, adv })}
              >
                <span className="skill-face">
                  <SkillArt card={card} />
                  <span className="ap-cost">
                    <img src={`${import.meta.env.BASE_URL}icons/ap.png`} alt="" />
                    {card.cost}
                  </span>
                </span>
              </SkillToken>
            );
          })}
        </div>
        </div>
        <div className="tray-actions">
          <button className="ghost" disabled={!past.length} onClick={undo}>Undo</button>
          {!battle.result && (
            <button className="primary end-turn" onClick={() => {
              setAuto(false);
              if (battle.ap > 0) setAskEnd(true);
              else pass();
            }}>End turn</button>
          )}
        </div>
      </div>

      {ultWait && <p className="ult-wait">Ult isn't ready!</p>}

      {askEnd &&
        createPortal(
          <div className="sheet-scrim battle-pop" onClick={() => setAskEnd(false)}>
            <article className="sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <h2>End the turn?</h2>
              <p>You still have {battle.ap} AP.</p>
              <div className="confirm">
                <button className="primary" onClick={() => { setAskEnd(false); pass(); }}>End turn</button>
                <button className="ghost" onClick={() => setAskEnd(false)}>Stay</button>
              </div>
            </article>
          </div>,
          document.body,
        )}

      {cardRead &&
        createPortal(
          <div className="sheet-scrim battle-pop" onClick={() => setCardRead(null)}>
            <article className="sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <h2>{cardRead.card.name}</h2>
              <p className="quiet">
                {cardRead.card.ownerName}
                {cardRead.ult ? ` · ult ${cardRead.energy}/${cardRead.cap}` : ` · ${cardRead.card.cost} AP`}
              </p>
              <p>{describeCard(cardRead.card)}</p>
              {cardRead.preview != null && (
                <p>
                  <b>
                    {cardRead.preview} dmg{cardRead.adv > 0 ? " · weakness" : cardRead.adv < 0 ? " · resisted" : ""}
                  </b>
                </p>
              )}
              <button className="ghost" onClick={() => setCardRead(null)}>Close</button>
            </article>
          </div>,
          document.body,
        )}

      {ultShow &&
        createPortal(
          <div className="ult-comic" role="dialog" aria-label={ultShow.name}>
            <div
              className={`manga-page shard-${(ultShow.slot ?? 0) + 1}`}
              style={{ "--burst": ultShow.color || "#e23b2f" }}
            >
              <div className="manga-ink" />
              <div className="manga-panel">
                <p className="manga-sfx">{ultShow.word}</p>
                {character(ultShow.id) ? (
                  <Portrait c={character(ultShow.id)} owned bust />
                ) : (
                  <Yell id={ultShow.id} />
                )}
                <p className="manga-caption">{ultShow.name}</p>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {showLog &&
        createPortal(
          <div className="sheet-scrim battle-pop" onClick={() => setShowLog(false)}>
            <article className="sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <h2>Action log</h2>
              <p className="quiet">
                A critical hit names who swung and who got hit. A resist names who shrugged the debuff, and which one.
                Crit damage +50% makes a crit hit harder. It does not raise the chance.
              </p>
              <ol className="log">
                {battle.log.map((line, i) => {
                  const shown = explainLog(line, battle);
                  return (
                    <li key={`${line}-${i}`} className={logTone(shown)}>{shown}</li>
                  );
                })}
              </ol>
              <button className="ghost" onClick={() => setShowLog(false)}>
                Close
              </button>
            </article>
          </div>,
          document.body,
        )}

      {inspect &&
        createPortal(
          <Inspect battle={battle} inspect={inspect} onClose={() => setInspect(null)} />,
          document.body,
        )}

      <div className="floaters">
        {floats.filter((item) => !item.onFoe).map((item) => (
          <span key={item.key} className={`floater tone-${item.tone}`} style={{ left: `${item.x}%` }}>
            {item.text}
          </span>
        ))}
      </div>

      {showResult &&
        createPortal(
        <div
          className={`overlay${battle.result === "lose" ? " is-defeat" : ""}`}
          style={
            battle.result === "lose"
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(36, 12, 12, 0.42), rgba(16, 6, 8, 0.78)), url(${import.meta.env.BASE_URL}backdrops/defeat.jpg)`,
                }
              : undefined
          }
        >
          <article className={`scene-modal result-${battle.result} result-sheet`}>
            <div className="result-head">
              <p className="kicker">{battle.result === "win" ? "Clear" : "Defeat"}</p>
              {battle.result === "lose" ? <h2>You lost the fight.</h2> : null}
              {stage?.name ? <p className="result-stage">{stage.name}</p> : null}
            </div>
            {reward && (
              <Pay
                marks={reward.applause}
                xp={reward.xp}
                notes={reward.notes}
                shards={reward.shards}
                bond={reward.bond}
                gift={reward.gift}
                giftCount={reward.giftCount}
              />
            )}
            <div className="sprite-row">
              {battle.party.map((member) => {
                const leveled = reward?.levels?.some((row) => row.id === member.id);
                const before = reward?.snap?.[member.id];
                const def = character(member.id);
                return (
                  <figure key={member.id} className={`unit-plate${leveled ? " did-level" : ""}`}>
                    <div className="bust-slot">
                      {leveled && <BustConfetti />}
                      <Portrait c={def || member} owned bust />
                    </div>
                    <figcaption>{member.name.split(" ")[0]}</figcaption>
                    {battle.result === "win" && reward && before && (
                      <XpMeter owned={{ ...save.roster[member.id], level: before.level, xp: before.xp }} gain={reward.xp || 0} />
                    )}
                  </figure>
                );
              })}
            </div>
            {battle.result === "win" && canSweepStage(save, stageId) && (
              <ResultSweep stageId={stageId} save={save} dispatch={dispatch} />
            )}
            <div className="hero-actions">
              {ahead && (
                <button className="primary next-stage" onClick={() => setStageId(ahead.id)}>
                  Next stage
                </button>
              )}
              <button className="primary" onClick={rematch}>
                Run it back
              </button>
              <button className="ghost" onClick={onExit}>
                Back
              </button>
            </div>
          </article>
        </div>,
        document.body
        )}
    </section>
  );
}

function Confetti({ heavy }) {
  const count = heavy ? 28 : 14;
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: count }, (_, n) => (
        <i key={n} style={{ "--n": n, left: `${(n * 37) % 100}%` }} />
      ))}
    </div>
  );
}

function BustConfetti() {
  const count = 12;
  return (
    <div className="confetti confetti-bust" aria-hidden="true">
      {Array.from({ length: count }, (_, n) => {
        const angle = (n / count) * Math.PI * 2;
        const dist = 26 + (n % 3) * 8;
        return (
          <i
            key={n}
            style={{
              "--n": n,
              "--dx": Math.round(Math.cos(angle) * dist),
              "--dy": Math.round(Math.sin(angle) * dist),
            }}
          />
        );
      })}
    </div>
  );
}

function XpMeter({ owned, gain }) {
  const steps = xpSteps(owned, gain);
  const startPct = steps.start.capped ? 100 : Math.min(100, (steps.start.xp / steps.start.need) * 100);
  const endPct = steps.end.capped ? 100 : Math.min(100, (steps.end.xp / Math.max(1, steps.end.need)) * 100);
  const [pct, setPct] = useState(startPct);
  const [label, setLabel] = useState(steps.start.level);
  const [snap, setSnap] = useState(false);
  useEffect(() => {
    if (steps.start.capped) return undefined;
    const timers = [];
    const first = window.setTimeout(() => {
      if (!steps.leveled) {
        setPct(endPct);
        return;
      }
      setPct(100);
      timers.push(
        window.setTimeout(() => {
          setSnap(true);
          setLabel(steps.end.level);
          setPct(0);
          timers.push(
            window.setTimeout(() => {
              setSnap(false);
              setPct(endPct);
            }, 40)
          );
        }, 720)
      );
    }, 140);
    return () => {
      window.clearTimeout(first);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [steps.start.capped, steps.leveled, steps.end.level, endPct]);
  const atCap = steps.end.capped;
  return (
    <div className="xp-meter">
      <span>Level {atCap ? steps.end.level : label}</span>
      <div className="vbar growth-bar tone-heat">
        <i className={snap ? "snap" : ""} style={{ width: `${pct}%` }} />
        {atCap && <span>MAX</span>}
      </div>
      {!atCap && <span>+{gain}</span>}
      {steps.leveled && !atCap && <span className="carry">Extra experience carries into the next level.</span>}
    </div>
  );
}

function floatText(event) {
  if (event.crit && !event.attack && event.amount) return String(event.amount);
  if (event.crit || event.resist || event.tone === "resist") return null;
  if (event.tone === "heal" || event.tone === "calm" || event.tone === "stress") return event.text;
  if (event.tone === "shield") return `+${event.amount} block`;
  if (event.tone === "poison") return "Poison";
  if (event.blocked > 0 && !event.hit) return `Blocked ${event.blocked}`;
  if ((event.tone === "hit" || event.tone === "good") && event.amount) return `${event.amount}`;
  if (event.hit && event.amount) return `-${event.amount}`;
  if (event.tone === "bad" && event.amount) return `-${event.amount}`;
  return null;
}

function shownCrit(unit, critUp) {
  return Math.min(80, Math.round((unit?.crit || 0) * 100) + (critUp ? 20 : 0));
}

function logTone(line) {
  if (/critical hit/i.test(line)) return "log-crit";
  if (/resisted/i.test(line)) return "log-resist";
  if (/crit chance|crit damage/i.test(line)) return "log-buff";
  return "";
}

function skillOwner(battle, skill) {
  for (const member of battle.party || []) {
    if ((member.cards || []).some((card) => card.name === skill)) return member.name;
  }
  return null;
}

function explainLog(line, battle) {
  const crit = line.match(/^(.*) hits (.*) for (\d+)\. Critical hit\.$/);
  if (crit) {
    const who = skillOwner(battle, crit[1]);
    return who ? `${who} critical hit ${crit[2]} for ${crit[3]} with ${crit[1]}.` : `${crit[1]} critical hit ${crit[2]} for ${crit[3]}.`;
  }
  const plain = line.match(/^(.*) hits (.*) for (\d+)\.$/);
  if (plain) {
    const who = skillOwner(battle, plain[1]);
    return who ? `${who} hit ${plain[2]} for ${plain[3]} with ${plain[1]}.` : line;
  }
  if (/^Crit damage \+/i.test(line) && !/:/.test(line)) {
    const from = buffFrom(battle, "critDmg", battle.critDmgSrc);
    return `${line.replace(/\.$/, "")}${from ? ` from ${from}` : ""}. Shared by the whole party. Critical hits deal more damage.`;
  }
  if (/^Crit chance \+/i.test(line) && !/:/.test(line)) {
    const from = buffFrom(battle, "crit", battle.critSrc);
    return `${line.replace(/\.$/, "")}${from ? ` from ${from}` : ""}. Shared by the whole party. Hits crit more often.`;
  }
  return line;
}

function buffFrom(battle, flag, stored) {
  if (stored) return stored;
  const options = [];
  for (const member of battle.party || []) {
    for (const card of member.cards || []) {
      if (!card[flag]) continue;
      const cardName = card.name || "";
      const label = cardName.toLowerCase().startsWith(member.name.toLowerCase()) ? cardName : `${member.name}'s ${cardName}`;
      options.push({ skill: cardName, label });
    }
  }
  let last = "";
  for (const line of battle.log || []) {
    if (/^Crit /i.test(line)) continue;
    for (const option of options) {
      if (option.skill && line.includes(option.skill)) last = option.label;
    }
  }
  return last;
}

function BattleBuffs({ battle }) {
  const chips = [];
  const turns = (n) => `${n} turn${n === 1 ? "" : "s"}`;
  if (battle.critUp > 0) {
    chips.push({
      id: "crit",
      text: `Party crit chance +20% · ${turns(battle.critUp)}`,
      title: "The whole party crits more often, not only the unit who played the skill.",
    });
  }
  if (battle.critDmgUp > 0) {
    chips.push({
      id: "critdmg",
      text: `Party crit damage +50% · ${turns(battle.critDmgUp)}`,
      title: "The whole party's critical hits deal more damage. Crit chance stays the same.",
    });
  }
  if (battle.defUp > 0) {
    chips.push({
      id: "def",
      text: `Party defense +30% · ${turns(battle.defUp)}`,
      title: "The whole party's defense is higher, so incoming hits are softer.",
    });
  }
  if (battle.resUp > 0) {
    chips.push({
      id: "res",
      text: `Party resistance +15% · ${turns(battle.resUp)}`,
      title: "The whole party is more likely to resist a debuff.",
    });
  }
  if (battle.might > 0) {
    chips.push({ id: "might", text: `Party might · ${turns(battle.might)}`, title: "The whole party's hits deal 30% more damage." });
  }
  return (
    <p className="battle-buffs">
      {chips.map((chip) => (
        <span key={chip.id} className={`pill pill-${chip.id}`} title={chip.title}>
          {chip.text}
        </span>
      ))}
    </p>
  );
}

function partyMarks(battle) {
  const marks = [];
  if (battle.shield > 0) marks.push({ id: "block", label: "Block", n: battle.shield, hint: "Spent before health" });
  if ((battle.poison || 0) > 0) marks.push({ id: "poison", label: "Poison", n: battle.poison, kind: "debuff", hint: "Ticks at the start of the turn" });
  if ((battle.stun || 0) > 0) marks.push({ id: "stun", label: "Stun", n: battle.stun, kind: "debuff", hint: "Skips the next action" });
  if ((battle.sleep || 0) > 0) marks.push({ id: "sleep", label: "Sleep", n: battle.sleep, kind: "debuff", hint: "Skips until hit or it ends" });
  if (battle.breakdown) marks.push({ id: "break", label: "Lockup", kind: "debuff", hint: "Hits soften and ults stay shut" });
  if (battle.critUp > 0) marks.push({ id: "crit", label: "Party crit chance +20%", hint: `The whole party, for ${battle.critUp} turn${battle.critUp === 1 ? "" : "s"}.` });
  if (battle.critDmgUp > 0) marks.push({ id: "critdmg", label: "Party crit damage +50%", hint: `The whole party, for ${battle.critDmgUp} turn${battle.critDmgUp === 1 ? "" : "s"}. Critical hits deal more damage.` });
  if (battle.defUp > 0) marks.push({ id: "def", label: "Party defense +30%", hint: `The whole party, for ${battle.defUp} turn${battle.defUp === 1 ? "" : "s"}.` });
  if (battle.resUp > 0) marks.push({ id: "res", label: "Party resistance +15%", hint: `The whole party, for ${battle.resUp} turn${battle.resUp === 1 ? "" : "s"}.` });
  return marks;
}

function foeMarks(enemy) {
  const marks = [];
  if (enemy.shield > 0) marks.push({ id: "block", label: "Block", n: enemy.shield, hint: "Spent before health" });
  if (enemy.weak > 0) marks.push({ id: "weak", label: "Weak", n: enemy.weak, kind: "debuff", hint: "Their hits deal less" });
  if (enemy.vuln > 0) marks.push({ id: "exposed", label: "Exposed", n: enemy.vuln, turns: true, kind: "debuff", hint: "Hits on them deal more damage" });
  if (enemy.exposed > 0) marks.push({ id: "shred", label: "Open", n: enemy.exposed, kind: "debuff", hint: "Their resistance is lower" });
  if ((enemy.poison || 0) > 0) marks.push({ id: "poison", label: "Poison", n: enemy.poison, kind: "debuff", hint: "Ticks at the start of their turn" });
  if ((enemy.stun || 0) > 0) marks.push({ id: "stun", label: "Stun", n: enemy.stun, kind: "debuff", hint: "Skips the next action" });
  if ((enemy.sleep || 0) > 0) marks.push({ id: "sleep", label: "Sleep", n: enemy.sleep, kind: "debuff", hint: "Skips until hit or it ends" });
  if (enemy.hp > 0 && enemy.hp / enemy.maxHp <= 0.35) marks.push({ id: "rage", label: "Rage", hint: "Hurting, and swinging harder" });
  return marks;
}

function StatusGlyph({ id }) {
  if (id === "shred") {
    return (
      <svg className="status-glyph" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="5.2" fill="none" stroke="#e07a58" strokeWidth="2.2" />
        <path d="M3.2 10.6 12.4 5.2" stroke="#e07a58" strokeWidth="2.2" strokeLinecap="square" />
      </svg>
    );
  }
  return <img className="status-glyph" src={`${import.meta.env.BASE_URL}icons/status-${id}.png`} alt="" />;
}

function StunBadge({ turns = 1 }) {
  return (
    <span className="stun-badge" title="Stunned. The next action is skipped.">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 1.5l1.5 4.4 4.6 1.1-3.6 2.8 1.2 4.5L12 12.2 8.3 14.3l1.2-4.5L5.9 7l4.6-1.1L12 1.5z" />
        <path d="M18.2 13.2l.7 2 2.1.5-1.7 1.3.6 2.1-1.7-1.1-1.7 1.1.6-2.1-1.7-1.3 2.1-.5.7-2z" />
      </svg>
      Stun{turns > 1 ? ` ${turns}` : ""}
    </span>
  );
}

function StatusMarks({ marks }) {
  if (!marks.length) return null;
  return (
    <span className="marks">
      {marks.map((mark) => (
          <span key={mark.id} className={`status-ico status-${mark.id}`} title={markTitle(mark)}>
            <StatusGlyph id={mark.id} />
            {mark.n ? <b>{mark.n}</b> : null}
          </span>
        ))}
    </span>
  );
}

function MarkList({ marks }) {
  if (!marks.length) return <p className="quiet">No buffs or debuffs.</p>;
  const buffs = marks.filter((mark) => mark.kind !== "debuff");
  const debuffs = marks.filter((mark) => mark.kind === "debuff");
  return (
    <>
      {buffs.length > 0 && (
        <>
          <p className="kicker">Buffs</p>
          <ul className="stat-list">
            {buffs.map((mark) => (
              <li key={mark.id}>{markTitle(mark)}</li>
            ))}
          </ul>
        </>
      )}
      {debuffs.length > 0 && (
        <>
          <p className="kicker">Debuffs</p>
          <ul className="stat-list">
            {debuffs.map((mark) => (
              <li key={mark.id}>{markTitle(mark)}</li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

function Inspect({ battle, inspect, onClose }) {
  const ally = inspect.kind === "ally" ? battle.party.find((member) => member.id === inspect.id) : null;
  const enemy = inspect.kind === "foe" ? battle.enemies[inspect.index] : null;
  const coming = enemy ? forecast(enemy, partyGuard(battle.party, battle)) : [];
  const weak = enemy ? weaknessOf(enemy.element) : null;
  const critChance = ally ? shownCrit(ally, battle.critUp > 0) : 0;
  return (
    <div className="sheet-scrim battle-pop" onClick={onClose}>
      <article className="sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        {ally && (
          <>
            <h2>{ally.name}</h2>
            <p className="tile-meta">
              <RoleMark role={ally.role} />
              <ElementMark element={ally.element} />
              <span>{ally.title}</span>
            </p>
            <p className="quiet">
              {`Crit chance is ${critChance}%. A 3-star passive raises only this unit.`}
              {battle.critUp > 0 ? " A party buff is also up, so the whole party crits 20% more often." : " No party crit buff is up."}
              {battle.critDmgUp > 0 ? " The whole party's critical hits deal 50% more damage." : ""}
            </p>
            <ul className="stat-list">
              <li>Attack {ally.atk}</li>
              <li>Defense {Math.round((ally.def || 0) * (battle.defUp > 0 ? 1.3 : 1))}</li>
              <li>Crit chance {critChance}%</li>
              <li>Crit damage {Math.round((ally.critDmg || 1.3) * 100) + (battle.critDmgUp > 0 ? 50 : 0)}%</li>
              <li>Resistance {Math.min(60, Math.round(((ally.res || 0) + (battle.resUp > 0 ? 0.15 : 0)) * 100))}% · chance to resist a debuff</li>
              <li>Health share {ally.maxHp}</li>
              <li>
                Company {battle.hp}/{battle.maxHp}
              </li>
              <li>Block {battle.shield}</li>
              <li>Stress {battle.stress}/100</li>
            </ul>
            <MarkList marks={partyMarks(battle)} />
            <p className="quiet">At 100 stress, the next turn goes badly. Attacks deal less, ults stay shut, and stress drops to 25.</p>
          </>
        )}
        {enemy && (
          <>
            <h2>{enemy.name}</h2>
            <p className="quiet">
              {ELEMENTS[enemy.element].label}
              {weak ? ` · weak to ${ELEMENTS[weak].label}` : ""}
            </p>
            <p className="quiet">
              Crit chance is {Math.round((enemy.crit || 0.1) * 100)}%. Most foes sit near 10%, so a crit from them is uncommon.
              Resistance {Math.round((enemy.res || 0) * 100)}% is their chance to shrug a debuff. A resist line names the effect they shrugged.
            </p>
            <ul className="stat-list">
              <li>
                Health {enemy.hp}/{enemy.maxHp}
              </li>
              <li>Attack {enemy.atk}</li>
              <li>Defense {enemy.def || 0}</li>
              <li>Crit chance {Math.round((enemy.crit || 0.1) * 100)}%</li>
              <li>Resistance {Math.round((enemy.res || 0) * 100)}%</li>
              <li>Guard {enemy.guard || 0}</li>
            </ul>
            <MarkList marks={foeMarks(enemy)} />
            <h3>Coming up</h3>
            <ol className="log">
              {coming.map((step, index) => (
                <li key={`${step.intent}-${index}`}>
                  {index === 0 ? "Now" : "After"} · {step.label}
                  {enemy.kit?.[(enemy.step + index) % enemy.kit.length]?.line
                    ? ` — ${enemy.kit[(enemy.step + index) % enemy.kit.length].line}`
                    : ""}
                </li>
              ))}
            </ol>
          </>
        )}
        <button className="ghost" onClick={onClose}>
          Close
        </button>
      </article>
    </div>
  );
}

function poseFor(member, result, acting, enemySwing, battle) {
  if (result === "win") return "win";
  if (result === "lose") return "lose";
  if (enemySwing?.hurt) return "hurt";
  if (acting?.id === member.id) {
    if (acting.kind === "ego") return "ult";
    if (acting.hit) return "attack";
    return "cast";
  }
  if (battle?.breakdown || battle?.stress >= 70) return "stress";
  return "idle";
}

function artBase() {
  return import.meta.env.BASE_URL || "./";
}

function approvedPose(id, pose) {
  return spriteReport.units?.[id]?.[pose]?.pass === true;
}

function Yell({ id }) {
  const file = approvedPose(id, "ult") ? `${id}-ult` : id;
  return <img className="yell" src={`${artBase()}sprites/${file}.png`} alt="" />;
}

function Pixel({ id, pose = "idle", skillId }) {
  const skillPass = skillId && spriteReport.units?.[id]?.skills?.[skillId]?.pass === true;
  const usePose = !skillPass && pose !== "idle" && pose !== "cast" && pose !== "hurt" && approvedPose(id, pose);
  const [failed, setFailed] = useState("");
  const [ext, setExt] = useState("png");
  const token = skillPass ? `${id}-${skillId}` : `${id}-${pose}`;
  useEffect(() => {
    setExt("png");
    setFailed("");
  }, [token]);
  const file =
    skillPass && failed !== token ? `${id}-${skillId}` : usePose && failed !== token ? `${id}-${pose}` : id;
  return (
    <img
      src={`${artBase()}sprites/${file}.${ext}`}
      alt=""
      onError={() => {
        if (ext === "png") setExt("jpg");
        else if (failed !== token) setFailed(token);
      }}
    />
  );
}

function SkillArt({ card }) {
  const [photo, setPhoto] = useState(false);
  const [ext, setExt] = useState("png");
  return (
    <span className="skill-art">
      {!photo && <SkillGlyph id={card.id} />}
      <img
        src={`${artBase()}skills/${card.id}.${ext}?v=2`}
        alt=""
        hidden={!photo}
        onLoad={() => setPhoto(true)}
        onError={() => {
          if (ext === "png") setExt("jpg");
          else setPhoto(false);
        }}
      />
    </span>
  );
}

function FoeArt({ enemy, mode }) {
  const [attackOk, setAttackOk] = useState(true);
  const [baseStep, setBaseStep] = useState(0);
  const art = enemy.art || enemy.id;
  useEffect(() => {
    setAttackOk(true);
    setBaseStep(0);
  }, [art, enemy.element]);
  const bases = [
    `${artBase()}enemies/${art}.png`,
    `${artBase()}enemies/${art}.jpg`,
    `${artBase()}enemies/${enemy.element}.png`,
    `${artBase()}enemies/${enemy.element}.jpg`,
  ];
  const base = bases[Math.min(baseStep, bases.length - 1)];
  const attackSrc = `${artBase()}enemies/${art}-attack.png`;
  const showAttack = mode === "attack" && attackOk;
  return (
    <span className="foe-idle">
      <img
        className={`foe-art${showAttack ? "" : " is-on"}`}
        src={base}
        alt=""
        onLoad={(event) => {
          if (event.currentTarget.naturalWidth < 64) setBaseStep((n) => (n + 1 < bases.length ? n + 1 : n));
        }}
        onError={() => setBaseStep((n) => (n + 1 < bases.length ? n + 1 : n))}
      />
      {attackOk && (
        <img
          className={`foe-art foe-pose${showAttack ? " is-on" : ""}`}
          src={attackSrc}
          alt=""
          onError={() => setAttackOk(false)}
        />
      )}
    </span>
  );
}

function stockOf(save, kind) {
  if (kind === "note") return save.insight || 0;
  if (kind === "shard") return save.shards || 0;
  if (kind === "mark") return save.applause || 0;
  return save.gifts?.[kind] || 0;
}

function farmsFor(kind) {
  if (kind === "note") return bondEvents().filter((stage) => stage.notes);
  if (kind === "shard") return bondEvents().filter((stage) => stage.shards);
  if (kind === "mark") return dailyStages();
  if (kind === "keepsake") return [];
  return bondEvents().filter((stage) => stage.gift === kind);
}

function farmOpen(save, stage) {
  if (stage.event) return eventOpen(save, stage);
  if (stage.daily) return stage.tier <= (save.dailyRun?.cleared || 0) + 1;
  return true;
}

function farmDrop(stage, kind) {
  if (kind === "note") return `Notes ×${stage.notes || 0}`;
  if (kind === "shard") return `Shards ×${stage.shards || 0}`;
  if (kind === "mark") return `${stage.firstReward} marks`;
  if (stage.gift && GIFTS[stage.gift]) return `${GIFTS[stage.gift].name} ×${stage.giftCount || 1}`;
  return "";
}

function FarmSheet({ goal, save, onClose, onGo }) {
  const stages = farmsFor(goal.kind);
  const label =
    goal.kind === "note"
      ? "Notes"
      : goal.kind === "shard"
        ? "Shards"
        : goal.kind === "mark"
          ? "Marks"
          : GIFTS[goal.kind]?.name || "that item";
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <article className="sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <h2>Need more {label}</h2>
        <p>
          {goal.who} needs {goal.need - goal.have} more to {goal.what}. You hold {goal.have}.
        </p>
        <div className="stage-stack">
          {stages.length === 0 ? (
            <p>Relics come from a duplicate SSR that is already at 5 stars.</p>
          ) : (
            stages.map((stage) => {
              const open = farmOpen(save, stage);
              return (
                <button key={stage.id} className="ghost farm-row" disabled={!open} onClick={() => onGo(stage.id)}>
                  <b>{stage.name}</b>
                  <span>{farmDrop(stage, goal.kind)}</span>
                </button>
              );
            })
          )}
        </div>
        <button className="ghost" onClick={onClose}>
          Close
        </button>
      </article>
    </div>
  );
}

function Portrait({ c, owned, growth, bust = false }) {
  const [ext, setExt] = useState(bust ? "plate" : "png");
  const [failed, setFailed] = useState(false);
  const face = FACE_FRAME[c.id] || { x: 50, y: 16 };
  const plate = ext === "plate";
  return (
    <div
      className={`portrait rarity-${c.rarity}${c.legend ? " is-legend" : ""} ${owned ? "" : "is-locked"}${bust ? " is-bust" : ""}${plate ? " is-plate" : ""}`}
      style={{ "--ink": c.color, "--face-x": `${face.x}%`, "--face-y": `${face.y}%` }}
    >
      {!failed ? (
        <img
          src={
            plate
              ? `${import.meta.env.BASE_URL}portraits/${c.id}.jpg`
              : `${import.meta.env.BASE_URL}sprites/${c.id}.${ext}`
          }
          alt=""
          onError={() => {
            if (plate) setExt("png");
            else if (ext === "png") setExt("jpg");
            else setFailed(true);
          }}
        />
      ) : (
        <span className="sigil">{c.sigil}</span>
      )}
      <span className={`rarity-stamp rarity-${c.rarity}`}>{c.rarity}</span>
      {owned && growth && <AscendMark step={growth.ascend || 0} />}
      {owned && growth && <PeakFx owned={growth} />}
    </div>
  );
}

function AscendMark({ step, inline = false }) {
  const max = ASCEND_CAPS.length - 1;
  const n = Math.max(0, Math.min(max, step || 0));
  return (
    <span className={`ascend-mark is-${n}${inline ? " is-inline" : ""}`} aria-label={`${n} of ${max} ascensions`}>
      {Array.from({ length: max }, (_, index) => (
        <i key={index} className={n > index ? "is-on" : ""} />
      ))}
    </span>
  );
}

function PeakFx({ owned }) {
  const level = owned.level || 1;
  const rooms = owned.rooms || 0;
  const ascend = owned.ascend || 0;
  if (level < LEVEL_CAP && rooms < 3 && ascend < ASCEND_CAPS.length - 1) return null;
  return (
    <span className="peaks" aria-hidden="true">
      {level >= LEVEL_CAP && <i className="peak peak-level" />}
      {rooms >= 3 && <i className="peak peak-bond" />}
      {ascend >= ASCEND_CAPS.length - 1 && <i className="peak peak-ascend" />}
    </span>
  );
}

function overflowName(rarity) {
  if (rarity === "SSR") return "a relic";
  if (rarity === "SR") return "wildflowers";
  return "a road letter";
}

function copyNote(pull) {
  const stars = starsOf(pull.copies);
  const next = nextStarCopies(pull.copies);
  if (!next) return `${stars} stars. Another copy becomes ${overflowName(pull.rarity)}.`;
  const more = next - pull.copies;
  const need = `${more} more ${more === 1 ? "copy" : "copies"} to reach ${stars + 1} stars. Each star adds a little health, attack, and defense.`;
  if (pull.starUp && STAR_STEPS.includes(pull.copies)) return `Raised to ${stars} stars. ${need}`;
  return `${stars} ${stars === 1 ? "star" : "stars"}. ${need}`;
}

function shortCopy(pull) {
  const stars = starsOf(pull.copies);
  const next = nextStarCopies(pull.copies);
  if (!next) return `${stars} stars. The next copy becomes ${overflowName(pull.rarity)}.`;
  const more = next - pull.copies;
  return `${stars} ${stars === 1 ? "star" : "stars"}. ${more} more ${more === 1 ? "copy" : "copies"} to reach ${stars + 1} stars.`;
}

function SummonLog({ history, onClose }) {
  const rows = history.slice(0, 50);
  const pageSize = 10;
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const [page, setPage] = useState(0);
  const safePage = Math.min(page, pages - 1);
  const start = safePage * pageSize;
  const slice = rows.slice(start, start + pageSize);
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <article className="sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <p className="kicker">Newest first</p>
        <h2>Last {rows.length} summons</h2>
        {rows.some((entry) => typeof entry === "string") && (
          <p className="quiet">Earlier summons only kept the rarity. New ones include the name.</p>
        )}
        <ol className="summon-log">
          {slice.map((entry, i) => {
            const rarity = typeof entry === "string" ? entry : entry.rarity;
            const unit = entry && typeof entry === "object" && entry.id ? character(entry.id) : null;
            return (
              <li key={`${rarity}-${entry?.id || "old"}-${start + i}`}>
                <span className={`log-rarity rarity-${rarity}`}>{rarity}</span>
                {unit && <span>{unit.name}</span>}
              </li>
            );
          })}
        </ol>
        <div className="log-pager">
          <button className="ghost" type="button" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
            Previous
          </button>
          <span>
            {start + 1}–{start + slice.length} of {rows.length}
          </span>
          <button className="ghost" type="button" disabled={safePage + 1 >= pages} onClick={() => setPage(safePage + 1)}>
            Next
          </button>
        </div>
        <button className="ghost" type="button" onClick={onClose}>
          Close
        </button>
      </article>
    </div>
  );
}

function claimTip(id) {
  window.dispatchEvent(new CustomEvent("lamp-tip", { detail: id }));
}

function useOnlyTip(id, setOpen) {
  useEffect(() => {
    function onClaim(event) {
      if (event.detail !== id) setOpen(false);
    }
    window.addEventListener("lamp-tip", onClaim);
    return () => window.removeEventListener("lamp-tip", onClaim);
  }, [id, setOpen]);
}

function IconButton({ src, tip, mark = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const tipId = useRef({});
  useOnlyTip(tipId.current, setOpen);
  useEffect(() => {
    if (!open) return undefined;
    function away(event) {
      if (ref.current?.contains(event.target)) return;
      setOpen(false);
    }
    function hide(event) {
      const node = event.target;
      if (node instanceof Element && node.closest(".icon-pop")) return;
      setOpen(false);
    }
    window.addEventListener("pointerdown", away, true);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("wheel", hide, { capture: true, passive: true });
    window.addEventListener("touchmove", hide, { capture: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", away, true);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("wheel", hide, true);
      window.removeEventListener("touchmove", hide, true);
    };
  }, [open]);
  return (
    <button
      type="button"
      ref={ref}
      className={`icon-tip${mark ? " mark" : ""}${open ? " is-open" : ""}`}
      aria-expanded={open}
      aria-label={tip}
      onClick={(event) => {
        event.stopPropagation();
        setOpen((value) => {
          const next = !value;
          if (next) claimTip(tipId.current);
          return next;
        });
      }}
    >
      <img className="purse" src={src} alt="" />
      <span className="icon-pop" role="tooltip">
        {tip}
      </span>
    </button>
  );
}

function CardFacts({ card, def, owned, rank }) {
  const cards = def.cards.map((item) => withGrowth({ ...item, ...(COMBOS[item.id] || {}) }, owned ? skillRank(owned, item.id) : 1));
  const member = { ...def, cards };
  member.ultMax = ultCap(member);
  const grown = cards.find((item) => item.id === card.id) || card;
  const shownRank = rank ?? (owned ? skillRank(owned, card.id) : null);
  return (
    <p className="kicker card-facts">
      <span>{grown.kind === "ego" ? "Ult" : grown.kind}</span>
      {shownRank != null && <span>rank {shownRank}{rank != null ? "/5" : ""}</span>}
      {grown.kind === "ego" ? (
        <span className="ult-cap">{member.ultMax}</span>
      ) : (
        <>
          <span className="ap-cost">
            <img src={`${import.meta.env.BASE_URL}icons/ap.png`} alt="" />
            {grown.cost} AP
          </span>
          <span className="ult-gain">ult +{ultGain(member, grown)}</span>
        </>
      )}
    </p>
  );
}

function PassiveCard({ id, copies }) {
  const passive = passiveFor(id);
  if (!passive) return null;
  const open = starsOf(copies) >= 3;
  return (
    <article className={`kit-card passive-card${open ? " is-open" : " is-locked"}`}>
      <span className="skill-art">
        <img src={`${import.meta.env.BASE_URL}icons/passive.png`} alt="" />
      </span>
      <p className="kicker">{open ? "Passive · open" : "Passive · locked"}</p>
      <strong>{passive.name}</strong>
      <p>{passive.line}</p>
      {!open && <p className="quiet">Opens at 3 stars.</p>}
    </article>
  );
}

function RoleMark({ role }) {
  return <IconButton mark src={`${import.meta.env.BASE_URL}icons/${role.toLowerCase()}.png`} tip={role} />;
}

function ElementMark({ element }) {
  return <IconButton mark src={`${import.meta.env.BASE_URL}icons/${element}.png`} tip={ELEMENTS[element].label} />;
}

const PURSE_TIP = {
  mark: "Marks. Summons and ascending spend them. Fights, drills, and jobs pay them.",
  note: "Training notes. Rank up costs as many notes as the skill's current rank, from 1 through 5.",
  bond: `Bond points. Gifts fill this. At ${BOND_NEED}, the next bond rank opens.`,
  story: "Bond rank, out of 3. Each rank raises health, attack, and defense.",
  shard: "Shards you are holding. Ascending spends them, along with marks.",
  ascend: "Ascension, from 0 to 3. Each step raises the level cap and adds 15% health, attack, and defense.",
  xp: "Experience from fights and drills. It stops at the level cap until you ascend.",
};

function Purse({ kind }) {
  return <IconButton src={`${import.meta.env.BASE_URL}icons/${kind}.png`} tip={PURSE_TIP[kind] || kind} />;
}

function Stars({ copies }) {
  const stars = starsOf(copies);
  const cap = STAR_STEPS[STAR_STEPS.length - 1];
  return (
    <span className="stars">
      {"★".repeat(stars)}
      {"☆".repeat(5 - stars)}
      {copies > cap ? ` +${copies - cap}` : ""}
    </span>
  );
}

function markTitle(mark) {
  const count = mark.turns && mark.n
    ? `${mark.n} turn${mark.n === 1 ? "" : "s"} left`
    : mark.n
      ? String(mark.n)
      : "";
  return [mark.label, count, mark.hint].filter(Boolean).join(" · ");
}

function HealthBar({ hp, maxHp, shield = 0, label, crit = false }) {
  const cap = Math.max(maxHp, hp + shield, 1);
  return (
    <div className={`vbar vbar-hp${crit ? " is-crit" : ""}`} aria-label={`${label ? `${label} ` : ""}Health ${hp} of ${maxHp}, block ${shield}`}>
      <i className="hp" style={{ width: `${(hp / cap) * 100}%` }} />
      {shield > 0 && <i className="block" style={{ width: `${(shield / cap) * 100}%` }} />}
      <span>
        {label ? `${label} ` : ""}
        {hp}/{maxHp}
        {shield > 0 ? ` +${shield}` : ""}
      </span>
    </div>
  );
}

function StressBar({ stress, label }) {
  return (
    <div className="vbar vbar-stress" aria-label={`${label ? `${label} ` : ""}Stress ${stress} of 100`}>
      <i style={{ width: `${Math.max(0, Math.min(100, stress))}%` }} />
      <span>
        {label ? `${label} ` : ""}
        {stress}/100
      </span>
    </div>
  );
}

function BrandIcon() {
  return <ArtIcon file="icons/lamp.jpg" className="brand-mark" />;
}

function GearIcon() {
  return (
    <svg className="nav-gear" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.1 7.1 0 0 0-1.63-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.58.23-1.12.54-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.51.4 1.05.71 1.63.94l.36 2.54c.05.24.25.42.5.42h3.84c.25 0 .45-.18.5-.42l.36-2.54c.58-.23 1.12-.54 1.63-.94l2.39.96c.22.09.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5z"
      />
    </svg>
  );
}

function NavIcon({ name }) {
  const file = {
    home: "icons/home.jpg",
    stages: "icons/fight.jpg",
    call: "icons/summon.jpg",
    lineup: "icons/party.jpg",
    green: "icons/camp.jpg",
  }[name];
  return <ArtIcon file={file} />;
}

function ArtIcon({ file, className }) {
  const [ext, setExt] = useState("png");
  const stem = file.replace(/\.jpg$/, "");
  return (
    <img
      className={className || "nav-icon"}
      src={`${artBase()}${stem}.${ext}`}
      alt=""
      onError={() => {
        if (ext === "png") setExt("jpg");
      }}
    />
  );
}

function GrowthBar({ label, current, max, tone, capped, icon }) {
  const pct = capped ? 100 : Math.max(0, Math.min(100, max ? (current / max) * 100 : 0));
  const numbers = capped ? (label === "Experience" ? "MAX" : "full") : `${current}/${max}`;
  return (
    <div className="bar-row">
      {icon && <Purse kind={icon} />}
      <div className={`vbar growth-bar tone-${tone}`} aria-label={`${label} ${numbers}`}>
        <i style={{ width: `${pct}%` }} />
        <span>{numbers}</span>
      </div>
    </div>
  );
}

function toughStage(stageId) {
  const stage = storyNode(stageId) || STAGES.find((item) => item.id === stageId) || dailyStageById(stageId);
  if (!stage?.enemies?.length) return false;
  const hp = Math.max(...stage.enemies.map((enemy) => enemy.maxHp || 0));
  const chapter = Number(stage.chapter);
  return hp >= 400 || chapter >= 9 || (stage.tier || 0) >= 4;
}

function PayChip({ kind, label, amount, drop = false, icon, tip }) {
  return (
    <span className={`pay-chip${drop ? " pay-drop" : ""}`}>
      {kind === "gift" ? (
        <IconButton src={`${import.meta.env.BASE_URL}icons/${icon}.png`} tip={tip || label} />
      ) : (
        <Purse kind={kind} />
      )}
      <em>{label}</em>
      <b>{amount}</b>
    </span>
  );
}

function Pay({ marks, xp, notes, bond, shards, gift, giftCount = 1 }) {
  const giftInfo = gift && GIFTS[gift];
  return (
    <p className="pay">
      {marks != null && <PayChip kind="mark" label="Marks" amount={marks} />}
      {xp ? (
        <PayChip kind="xp" label="XP" amount={xp} />
      ) : null}
      {notes ? <PayChip kind="note" label="Notes" amount={notes} drop /> : null}
      {bond ? <PayChip kind="bond" label="Bond" amount={bond} drop /> : null}
      {shards ? <PayChip kind="shard" label="Shards" amount={shards} drop /> : null}
      {giftInfo ? (
        <PayChip
          kind="gift"
          icon={gift}
          label={giftInfo.name}
          amount={giftCount > 1 ? `×${giftCount}` : ""}
          drop
          tip={`${giftInfo.name}. ${giftInfo.blurb} Give it at camp.`}
        />
      ) : null}
    </p>
  );
}

function hintLines(stage) {
  const blurb = (stage.blurb || "").toLowerCase();
  const said = (word) => blurb.includes(word.toLowerCase());
  const lines = [];
  const matchups = [];
  const usedShort = new Map();
  for (const enemy of stage.enemies) {
    const element = ELEMENTS[enemy.element];
    const counter = ELEMENTS[weaknessOf(enemy.element)];
    if (!counter || said(element.label) || said(counter.label)) continue;
    const short = enemy.name.split(" ").slice(-1)[0];
    usedShort.set(short, (usedShort.get(short) || 0) + 1);
    matchups.push({ name: enemy.name, short, counter: counter.label.toLowerCase() });
  }
  if (matchups.length === 1) {
    const tip = matchups[0];
    lines.push(`${tip.counter[0].toUpperCase()}${tip.counter.slice(1)} cuts through ${tip.short}.`);
  } else if (matchups.length > 1) {
    const bits = matchups.map((tip) => {
      const who = usedShort.get(tip.short) > 1 ? tip.name : tip.short;
      return `${tip.counter} for ${who}`;
    });
    const head = bits[0][0].toUpperCase() + bits[0].slice(1);
    const rest = bits.slice(1);
    lines.push(rest.length === 1 ? `${head}, and ${rest[0]}.` : `${[head, ...rest.slice(0, -1)].join(", ")}, and ${rest[rest.length - 1]}.`);
  }
  const guards = stage.enemies.some((enemy) => (enemy.guard || 0) >= 14);
  const hexes = stage.enemies.some((enemy) => enemy.pattern?.includes("hex"));
  if (guards && !/shield|guard|block|wall|brace/.test(blurb)) {
    lines.push("Break the guard before a big swing.");
  }
  if (hexes && !/hex|curse|rattle|stress/.test(blurb)) {
    lines.push("Hex piles on stress. Block before it lands.");
  }
  return lines;
}

function StageHint({ stage }) {
  const lines = hintLines(stage);
  if (!lines.length) return null;
  return (
    <p className="hint-row">
      <Tip label="i">{lines.map((line) => <span key={line}>{line}</span>)}</Tip>
    </p>
  );
}

function BondBurst({ element, big = false }) {
  const count = big ? 16 : 8;
  return (
    <div className={`bond-burst kind-${element || "veil"}${big ? " is-big" : ""}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <i key={index} style={{ "--n": index }} />
      ))}
    </div>
  );
}

function Tip({ label, children, wide = false }) {
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const tipId = useRef({});
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState(null);
  useOnlyTip(tipId.current, setOpen);

  useEffect(() => {
    if (!open) return undefined;
    function place() {
      const button = btnRef.current;
      const pop = popRef.current;
      if (!button || !pop) return;
      const anchor = button.getBoundingClientRect();
      const width = Math.min(wide ? 320 : 220, window.innerWidth - 24);
      pop.style.width = `${width}px`;
      const height = pop.getBoundingClientRect().height;
      let left = anchor.left;
      if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
      if (left < 8) left = 8;
      let top = anchor.bottom + 6;
      if (top + height > window.innerHeight - 8) top = Math.max(8, anchor.top - height - 6);
      setBox({ left, top, width });
    }
    function away(event) {
      if (btnRef.current?.contains(event.target) || popRef.current?.contains(event.target)) return;
      setOpen(false);
    }
    function hide(event) {
      const node = event.target;
      if (node instanceof Element && node.closest(".tip-pop")) return;
      setOpen(false);
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("wheel", hide, { capture: true, passive: true });
    window.addEventListener("touchmove", hide, { capture: true, passive: true });
    document.addEventListener("pointerdown", away, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("wheel", hide, true);
      window.removeEventListener("touchmove", hide, true);
      document.removeEventListener("pointerdown", away, true);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="tip-btn"
        ref={btnRef}
        aria-expanded={open}
        aria-label={label === "?" || label === "i" ? "Help" : label}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => {
            const next = !value;
            if (next) claimTip(tipId.current);
            return next;
          });
        }}
      >
        i
      </button>
      {open && (
        <div
          className={wide ? "tip-pop is-wide" : "tip-pop"}
          role="tooltip"
          ref={popRef}
          style={box ? { left: box.left, top: box.top, width: box.width } : { left: 8, top: 8, width: Math.min(wide ? 320 : 220, window.innerWidth - 24), visibility: "hidden" }}
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </div>
      )}
    </>
  );
}

