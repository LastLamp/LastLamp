let ctx = null;
let master = null;
let playing = false;
let held = false;
let away = false;
let scene = "home";
let wanted = "home";
let step = 0;
let loop = 0;
let voices = [];
let quietUntil = 0;
const pending = new Set();
const TOKEN = {};

function later(fn, ms) {
  const id = window.setTimeout(() => {
    pending.delete(id);
    fn();
  }, ms);
  pending.add(id);
  return id;
}

function clearPending() {
  for (const id of pending) window.clearTimeout(id);
  pending.clear();
}

function killGraph() {
  playing = false;
  loop += 1;
  clearPending();
  const dying = ctx;
  const oldMaster = master;
  ctx = null;
  master = null;
  voices = [];
  if (oldMaster) {
    try {
      oldMaster.disconnect();
    } catch {
      /* already gone */
    }
  }
  if (dying) dying.close().catch(() => {});
}

const SUMMER = {
  ms: 320,
  wave: "sawtooth",
  peak: 0.11,
  attack: 0.08,
  sustain: 0.42,
  horn: true,
  bassEvery: 8,
  bassGain: 0.22,
  drum: 0.28,
  scale: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 466.16, 523.25, 587.33, 659.25, 698.46],
  bassScale: [87.31, 98.0, 116.54, 130.81],
  melody: [
    4, 5, 7, 5, 4, 3, 4, 5,
    7, 8, 7, 5, 4, -1, 3, 2,
    0, 2, 3, 4, 5, 4, 3, 2,
    3, 4, 2, 0, -1, 2, 3, 4,
  ],
  harmony: [
    0, -1, -1, -1, 3, -1, -1, -1,
    5, -1, -1, -1, 3, -1, -1, -1,
    0, -1, -1, -1, 4, -1, -1, -1,
    3, -1, -1, -1, 0, -1, -1, -1,
  ],
  drums: ["k", ".", "h", ".", "k", ".", "h", "."],
  bass: [0, 3, 2, 0],
};

const HOME = {
  ms: 900,
  wave: "sine",
  peak: 0.045,
  attack: 0.55,
  sustain: 2.2,
  pad: true,
  padLift: 3,
  bassEvery: 8,
  bassGain: 0.06,
  scale: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0],
  bassScale: [130.81, 174.61],
  melody: [0, -1, 2, -1, -1, 4, -1, 3, -1, 2, -1, -1, 1, -1, 0, -1],
  bass: [0, 1],
};

const SCENES = {
  home: HOME,
  road: {
    ms: 420,
    wave: "sine",
    peak: 0.14,
    attack: 0.1,
    scale: [174.61, 196.0, 220.0, 261.63, 293.66, 349.23],
    bassScale: [87.31, 110.0, 130.81],
    melody: [0, 2, 3, 2, 4, 3, 2, 0, 1, 2, 4, 5, 4, 2, 0, -1],
    bass: [0, 2, 1, 0],
  },
  battle: { ...SUMMER },
  boss: {
    ms: 200,
    wave: "square",
    peak: 0.17,
    attack: 0.01,
    sustain: 0.18,
    power: true,
    drum: 1.55,
    scale: [110.0, 130.81, 146.83, 155.56, 164.81, 196.0, 220.0, 233.08],
    bassScale: [55.0, 65.41, 73.42, 77.78],
    riff: [
      0, -1, 0, 2, 3, 2, 0, 4,
      0, 5, 4, 3, 2, 0, 3, 0,
      0, 0, 6, 5, 3, 2, 4, 0,
      7, 6, 5, 3, 2, 0, -1, 0,
    ],
    pump: [
      0, 0, 0, 2, 3, 2, 0, 0,
      0, 1, 2, 3, 2, 0, 3, 0,
      0, 0, 2, 1, 3, 2, 0, 0,
      3, 2, 1, 0, 2, 0, 0, 0,
    ],
    drums: [
      "k", "h", "s", "h", "k", "k", "s", "h",
      "k", "h", "s", "h", "k", "s", "s", "k",
    ],
    bass: [0],
  },
  summon: {
    ms: 190,
    wave: "sine",
    peak: 0.055,
    attack: 0.03,
    sustain: 1.5,
    harp: true,
    air: true,
    bassEvery: 16,
    bassGain: 0.12,
    scale: [
      523.25, 659.25, 783.99, 1046.5,
      587.33, 698.46, 880.0, 1174.66,
      493.88, 659.25, 783.99, 987.77,
      440.0, 554.37, 659.25, 880.0,
    ],
    arp: [
      0, 1, 2, 3, 2, 3, 2, 1,
      4, 5, 6, 7, 6, 7, 6, 5,
      8, 9, 10, 11, 10, 11, 10, 9,
      12, 13, 14, 15, 14, 15, 14, 13,
    ],
    bassScale: [130.81, 146.83, 123.47, 110.0],
    bass: [0, 1, 2, 3],
  },
  party: {
    ms: 420,
    wave: "triangle",
    peak: 0.05,
    attack: 0.03,
    sustain: 0.34,
    bassEvery: 4,
    bassGain: 0.18,
    drum: 0.32,
    scale: [392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99],
    bassScale: [98.0, 110.0, 130.81, 146.83],
    melody: [
      0, 2, 4, 2, 3, 2, 0, 2,
      4, 5, 4, 2, 3, 4, 2, 0,
      1, 3, 5, 3, 4, 2, 1, 0,
      2, 4, 3, 2, 0, 2, 4, 0,
    ],
    harmony: [
      0, -1, -1, -1, 2, -1, -1, -1,
      4, -1, -1, -1, 2, -1, -1, -1,
      1, -1, -1, -1, 3, -1, -1, -1,
      0, -1, -1, -1, 2, -1, -1, -1,
    ],
    drums: ["k", ".", "h", ".", "k", ".", "h", "."],
    bass: [0, 2, 1, 0],
  },
  camp: {
    ms: 680,
    wave: "triangle",
    peak: 0.046,
    attack: 0.28,
    sustain: 1.15,
    pad: true,
    padLift: 2,
    bassEvery: 6,
    bassGain: 0.1,
    scale: [196.0, 220.0, 246.94, 261.63, 293.66, 329.63, 349.23],
    bassScale: [98.0, 130.81, 146.83],
    melody: [0, 2, 4, -1, 3, 2, 1, -1, 4, 3, 2, 0, 2, 4, 3, -1, 1, 2, 0, -1],
    bass: [0, 2, 1],
  },
  defeat: {
    ms: 1400,
    wave: "triangle",
    peak: 0.075,
    attack: 0.72,
    sustain: 2.4,
    pad: true,
    padLift: 3,
    bassEvery: 8,
    bassGain: 0.1,
    scale: [220.0, 233.08, 261.63, 293.66, 311.13, 349.23],
    bassScale: [146.83, 174.61],
    melody: [0, -1, -1, 2, -1, -1, 1, -1, 4, -1, -1, 3, -1, 2, -1, -1, 1, -1, -1, 0, -1, -1, -1, -1],
    bass: [0, 1],
  },
};

function ensure() {
  if (away) return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) {
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = 0.34;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function blip(freq, dur, type, peak, attack = 0.09) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  osc.type = type;
  osc.frequency.value = freq;
  const a = Math.min(Math.max(0.05, attack), dur * 0.42);
  const release = Math.min(0.24, Math.max(0.08, dur * 0.38));
  const hold = Math.max(a + 0.02, dur - release);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(Math.max(0.0002, peak), now + a);
  gain.gain.setValueAtTime(Math.max(0.0002, peak), now + hold);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(gain);
  gain.connect(master);
  const voice = { osc, gain };
  voices.push(voice);
  osc.onended = () => {
    voices = voices.filter((item) => item !== voice);
  };
  osc.start(now);
  osc.stop(now + dur + 0.03);
}

const DISTORT = new Float32Array(256);
for (let i = 0; i < DISTORT.length; i += 1) {
  const x = i / 128 - 1;
  DISTORT[i] = Math.tanh(x * 5);
}

function grit(freq, dur, peak, power) {
  const now = ctx.currentTime;
  const shaper = ctx.createWaveShaper();
  shaper.curve = DISTORT;
  shaper.oversample = "2x";
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2600, now);
  filter.frequency.exponentialRampToValueAtTime(1100, now + dur);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(Math.max(0.0002, peak), now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  shaper.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  const tones = power ? [freq, freq * 1.498] : [freq];
  for (const base of tones) {
    for (const detune of [-7, 8]) {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.detune.value = detune;
      osc.frequency.setValueAtTime(base * 1.07, now);
      osc.frequency.exponentialRampToValueAtTime(base, now + 0.035);
      osc.connect(shaper);
      const voice = { osc, gain };
      voices.push(voice);
      osc.onended = () => {
        voices = voices.filter((item) => item !== voice);
      };
      osc.start(now);
      osc.stop(now + dur + 0.02);
    }
  }
}

function burst(dur, peak, freq) {
  const frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  src.buffer = buffer;
  filter.type = "lowpass";
  filter.frequency.value = freq;
  gain.gain.setValueAtTime(Math.max(0.0002, peak), now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start(now);
  src.stop(now + dur + 0.02);
}

function thump(freq, dur, peak) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq * 2.4, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(36, freq), now + Math.min(0.09, dur));
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(Math.max(0.0002, peak), now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(gain);
  gain.connect(master);
  const voice = { osc, gain };
  voices.push(voice);
  osc.onended = () => {
    voices = voices.filter((item) => item !== voice);
  };
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

function brass(freq, dur, peak) {
  const now = ctx.currentTime;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.8;
  filter.frequency.setValueAtTime(480, now);
  filter.frequency.exponentialRampToValueAtTime(1700, now + 0.09);
  filter.frequency.exponentialRampToValueAtTime(980, now + Math.max(0.24, dur * 0.8));
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(Math.max(0.0002, peak), now + 0.07);
  gain.gain.setValueAtTime(Math.max(0.0002, peak * 0.82), now + dur * 0.55);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  filter.connect(gain);
  gain.connect(master);
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 5.4;
  lfoGain.gain.value = 4.5;
  lfo.connect(lfoGain);
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(freq, now);
  lfoGain.connect(osc.frequency);
  osc.connect(filter);
  const warm = ctx.createOscillator();
  const warmGain = ctx.createGain();
  warm.type = "sine";
  warm.frequency.value = freq;
  warmGain.gain.value = 0.28;
  warm.connect(warmGain);
  warmGain.connect(gain);
  for (const voiceOsc of [osc, warm, lfo]) {
    const voice = { osc: voiceOsc, gain };
    voices.push(voice);
    voiceOsc.onended = () => {
      voices = voices.filter((item) => item !== voice);
    };
    voiceOsc.start(now);
    voiceOsc.stop(now + dur + 0.02);
  }
}

function hush() {
  const now = ctx ? ctx.currentTime : 0;
  if (master) {
    try {
      master.disconnect();
    } catch {
      /* already gone */
    }
  }
  for (const voice of voices) {
    try {
      voice.osc.stop(now);
    } catch {
      /* already stopped */
    }
    try {
      voice.osc.disconnect();
    } catch {
      /* already stopped */
    }
    try {
      voice.gain.disconnect();
    } catch {
      /* already stopped */
    }
  }
  voices = [];
  if (!ctx) return;
  master = ctx.createGain();
  master.gain.value = 0.34;
  master.connect(ctx.destination);
}

function tick(gen) {
  if (!playing || gen !== loop || !ctx) return;
  if (ctx.currentTime < quietUntil) {
    later(() => tick(gen), 80);
    return;
  }
  const song = SCENES[scene] || SCENES.home;
  const stepSec = song.ms / 1000;
  const bassEvery = song.bassEvery || (song.ms >= 700 ? 4 : 2);
  const note = song.melody ? song.melody[step % song.melody.length] : -1;
  const bass = song.bass[Math.floor(step / bassEvery) % song.bass.length];
  const dur = Math.max(song.sustain || 0, stepSec * 0.92);
  const attack = song.attack || 0.1;
  const drumGain = song.drum || 1;
  if (song.riff) {
    const riff = song.riff[step % song.riff.length];
    if (riff >= 0) grit(song.scale[riff], Math.max(0.08, stepSec * 0.92), song.peak * 0.72, song.power);
  } else if (song.harp && song.arp) {
    const plucked = song.arp[step % song.arp.length];
    if (plucked >= 0) blip(song.scale[plucked], song.sustain || dur, "sine", song.peak, song.attack || 0.03);
  } else if (song.horn && note >= 0) brass(song.scale[note], Math.max(dur, stepSec * 1.35), song.peak * 0.85);
  else if (note >= 0) blip(song.scale[note], dur, song.wave, song.peak, attack);
  if (song.harmony && !song.riff) {
    const harm = song.harmony[step % song.harmony.length];
    if (harm >= 0) blip(song.horn ? song.scale[harm] : song.scale[harm] / 2, dur * 1.4, "sine", song.peak * (song.horn ? 0.2 : 0.42), 0.14);
  }
  if (song.pump) {
    const pumped = song.pump[step % song.pump.length];
    if (pumped >= 0) blip(song.bassScale[pumped], stepSec * 0.78, "square", song.peak * 0.46, 0.008);
  }
  if (song.drums) {
    const drum = song.drums[step % song.drums.length];
    if (drum.includes("k")) thump(song.bassScale[0], song.riff ? 0.12 : 0.16, song.peak * 1.15 * drumGain);
    if (drum.includes("s")) burst(song.riff ? 0.08 : 0.11, song.peak * 0.7 * drumGain, song.riff ? 2400 : 1600);
    if (drum.includes("h")) burst(0.03, song.peak * 0.14 * drumGain, 6400);
  }
  if ((song.pad || song.air) && step % 4 === 0) {
    const root = song.bassScale[bass];
    const lift = song.padLift || (song.air ? 4 : 2);
    const bed = stepSec * (song.air ? 7 : 3.6);
    const fifth = song.padLift ? 1.2 : 1.5;
    blip(root * lift, bed, "sine", song.peak * (song.padLift ? 0.22 : song.air ? 0.28 : 0.45), song.air ? 0.7 : song.padLift ? 0.55 : 0.28);
    blip(root * lift * fifth, bed, "sine", song.peak * (song.padLift ? 0.12 : song.air ? 0.16 : 0.22), song.air ? 0.85 : song.padLift ? 0.7 : 0.34);
  }
  if (step % bassEvery === 0) blip(song.bassScale[bass], Math.max(dur * 1.8, stepSec * bassEvery * 0.9), "sine", song.peak * (song.bassGain ?? 0.4), Math.max(attack, 0.12));
  step += 1;
  later(() => tick(gen), song.ms);
}

export function setMusicScene(next) {
  if (!SCENES[next] || next === scene) return;
  scene = next;
  step = 0;
  hush();
}

export function holdMusic() {
  held = true;
  stopMusic();
}

export function releaseMusic() {
  held = false;
}

export function musicNow() {
  return wanted;
}

export function setTabAudible(visible) {
  away = !visible;
  if (!visible) {
    loop += 1;
    clearPending();
    if (ctx) hush();
    if (ctx && ctx.state === "running") ctx.suspend().catch(() => {});
    return;
  }
  if (!playing || held) return;
  if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
  loop += 1;
  const gen = loop;
  later(() => tick(gen), 40);
}

export function startMusic(next) {
  if (next && SCENES[next]) wanted = next;
  if (held) return;
  if (away) {
    if (wanted !== scene) {
      scene = wanted;
      step = 0;
    }
    playing = true;
    return;
  }
  const changed = wanted !== scene || !playing;
  if (wanted !== scene) {
    scene = wanted;
    step = 0;
  }
  if (!ensure()) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  if (playing && pending.size && !changed) return;
  clearPending();
  hush();
  quietUntil = 0;
  playing = true;
  loop += 1;
  const gen = loop;
  later(() => tick(gen), 40);
}

export function stopMusic() {
  playing = false;
  loop += 1;
  clearPending();
  hush();
}

export function resumeMusic() {
  if (!ctx || !playing) {
    startMusic();
    return;
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
}

function pullTone(freq, dur, type, peak, delay) {
  if (!ensure()) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime + delay;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  voices.push({ osc, gain });
  osc.onended = () => {
    voices = voices.filter((voice) => voice.osc !== osc);
  };
  const end = now + dur + 0.05;
  if (end > quietUntil) quietUntil = end;
  osc.start(now);
  osc.stop(now + dur + 0.03);
}

function beginScene(next) {
  if (!SCENES[next] || !ensure()) return;
  wanted = next;
  scene = next;
  step = 0;
  held = false;
  clearPending();
  playing = true;
  loop += 1;
  const gen = loop;
  later(() => tick(gen), 40);
}

export function playResult(kind) {
  if (!ensure()) return;
  if (kind === "win") {
    holdMusic();
    pullTone(392, 0.22, "triangle", 0.16, 0);
    pullTone(523, 0.24, "triangle", 0.16, 0.18);
    pullTone(659, 0.5, "sine", 0.18, 0.36);
    return;
  }
  stopMusic();
  pullTone(349.23, 0.7, "triangle", 0.11, 0);
  pullTone(311.13, 0.9, "triangle", 0.09, 0.55);
  pullTone(261.63, 1.2, "sine", 0.07, 1.1);
  pullTone(220, 1.8, "sine", 0.055, 1.7);
  beginScene("defeat");
}

export function playClick() {
  if (typeof document !== "undefined" && document.hidden) return;
  away = false;
  if (!ensure()) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  const now = ctx.currentTime;
  const tone = (freq, delay, dur, peak) => {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const t = now + delay;
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, t);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(peak, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  };
  tone(784, 0, 0.06, 0.08);
  tone(1174, 0.045, 0.09, 0.07);
}

export function playHit(kind) {
  if (!ensure() || held) return;
  if (kind === "crit") {
    burst(0.08, 0.2, 2100);
    burst(0.16, 0.16, 480);
    thump(110, 0.16, 0.24);
    return;
  }
  if (kind === "hurt") {
    burst(0.14, 0.22, 640);
    thump(98, 0.18, 0.2);
    return;
  }
  if (kind === "guard") {
    thump(220, 0.1, 0.1);
    return;
  }
  burst(0.07, 0.16, 2400);
  thump(174, 0.08, 0.12);
}

export function playUltStamp() {
  if (!ensure()) return;
  hush();
  const now = ctx.currentTime;
  quietUntil = now + 1.05;
  burst(0.16, 0.26, 2200);
  thump(78, 0.34, 0.4);
  const voice = (freq, endFreq, type, peak, delay, dur, detune = 0) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = now + delay;
    osc.type = type;
    osc.detune.setValueAtTime(detune, t);
    osc.frequency.setValueAtTime(freq, t);
    if (endFreq !== freq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur * 0.85);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(peak, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(master);
    const row = { osc, gain };
    voices.push(row);
    osc.onended = () => {
      voices = voices.filter((item) => item !== row);
    };
    osc.start(t);
    osc.stop(t + dur + 0.02);
  };
  voice(523.25, 523.25, "triangle", 0.16, 0.02, 0.22);
  voice(659.25, 659.25, "triangle", 0.12, 0.02, 0.28);
  voice(392, 1174, "sine", 0.11, 0.06, 0.86, -7);
  voice(494, 1480, "sine", 0.07, 0.06, 0.86, 9);
  voice(784, 784, "sine", 0.1, 0.42, 0.5);
}

export function playLevel() {
  if (!ensure()) return;
  pullTone(523, 0.14, "triangle", 0.18, 0);
  pullTone(659, 0.16, "triangle", 0.18, 0.14);
  pullTone(784, 0.34, "sine", 0.2, 0.28);
}

export function playAscend() {
  if (!ensure()) return;
  pullTone(392, 0.2, "triangle", 0.15, 0);
  pullTone(494, 0.22, "triangle", 0.15, 0.12);
  pullTone(587, 0.26, "sine", 0.16, 0.24);
  pullTone(784, 0.62, "sine", 0.15, 0.4);
  pullTone(988, 0.8, "triangle", 0.07, 0.56);
}

export function playBond() {
  if (!ensure()) return;
  pullTone(349.23, 0.24, "sine", 0.12, 0);
  pullTone(440, 0.3, "triangle", 0.12, 0.14);
  pullTone(523.25, 0.5, "sine", 0.14, 0.28);
}

export function playBondMax() {
  if (!ensure()) return;
  pullTone(349.23, 0.3, "sine", 0.12, 0);
  pullTone(440, 0.34, "triangle", 0.13, 0.16);
  pullTone(523.25, 0.42, "sine", 0.15, 0.34);
  pullTone(659.25, 0.75, "sine", 0.14, 0.52);
  pullTone(880, 0.95, "triangle", 0.07, 0.7);
}

export function playRank() {
  if (!ensure()) return;
  pullTone(523, 0.1, "triangle", 0.14, 0);
  pullTone(659, 0.16, "sine", 0.13, 0.08);
  pullTone(784, 0.24, "sine", 0.1, 0.16);
}

export function playGift() {
  if (!ensure()) return;
  pullTone(440, 0.16, "sine", 0.1, 0);
  pullTone(554, 0.3, "triangle", 0.1, 0.1);
}

export function playPull(rarity) {
  if (!ensure()) return;
  hush();
  quietUntil = ctx.currentTime + (rarity === "SSR" ? 1.15 : 0.55);
  if (rarity === "SSR") {
    pullTone(392, 0.24, "triangle", 0.22, 0);
    pullTone(523, 0.3, "triangle", 0.2, 0.18);
    pullTone(784, 0.6, "sine", 0.18, 0.36);
    return;
  }
  if (rarity === "SR") {
    pullTone(494, 0.18, "triangle", 0.18, 0);
    pullTone(659, 0.36, "sine", 0.14, 0.14);
    return;
  }
  pullTone(330, 0.14, "sine", 0.1, 0);
}

const previous = globalThis.__lastLampMusic;
if (previous && previous.token !== TOKEN) previous.shutdown();
globalThis.__lastLampMusic = { token: TOKEN, shutdown: killGraph };
