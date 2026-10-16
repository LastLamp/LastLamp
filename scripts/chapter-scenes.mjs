import { copyFileSync, readFileSync, writeFileSync } from "fs";

console.error("Retired. This script copies shared photos over the chapter paintings.");
process.exit(1);
import jpeg from "jpeg-js";

const copies = {
  "stage-warmup": "road",
  "stage-comments": "gate",
  "stage-pyro": "kiln",
  "stage-deadair": "night",
  "stage-ford": "ford",
  "stage-quarry": "quarry",
};

for (const [name, source] of Object.entries(copies)) {
  copyFileSync(`public/backdrops/${source}.jpg`, `public/backdrops/${name}.jpg`);
}

const W = 160;
const H = 90;
const scale = 8;

function paint(draw) {
  const grid = Array.from({ length: H }, () => Array.from({ length: W }, () => [0, 0, 0]));
  const px = (x, y, color) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || iy < 0 || ix >= W || iy >= H) return;
    grid[iy][ix] = color;
  };
  const rect = (x, y, w, h, color) => {
    for (let yy = y; yy < y + h; yy += 1) for (let xx = x; xx < x + w; xx += 1) px(xx, yy, color);
  };
  const sky = (top, bottom) => {
    for (let y = 0; y < H; y += 1) {
      const t = y / H;
      const color = top.map((channel, i) => Math.round(channel + (bottom[i] - channel) * t));
      for (let x = 0; x < W; x += 1) px(x, y, color);
    }
  };
  const hill = (cx, cy, rx, ry, color) => {
    for (let y = 0; y < H; y += 1) {
      for (let x = 0; x < W; x += 1) {
        const nx = (x - cx) / rx;
        const ny = (y - cy) / ry;
        if (nx * nx + ny * ny <= 1 && y > cy - ry * 0.2) px(x, y, color);
      }
    }
  };
  draw({ px, rect, sky, hill });
  const data = Buffer.alloc(W * scale * H * scale * 4);
  for (let y = 0; y < H * scale; y += 1) {
    for (let x = 0; x < W * scale; x += 1) {
      const [r, g, b] = grid[Math.floor(y / scale)][Math.floor(x / scale)];
      const i = (y * W * scale + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  return jpeg.encode({ data, width: W * scale, height: H * scale }, 82).data;
}

function lamp(px, x, y) {
  px(x, y, [255, 214, 120]);
  px(x, y + 1, [90, 64, 40]);
  for (let i = 2; i < 16; i += 1) px(x, y + i, [54, 40, 32]);
}

const scenes = {
  "stage-signoff": ({ px, rect, sky, hill }) => {
    sky([18, 16, 32], [48, 36, 58]);
    hill(40, 70, 50, 22, [36, 30, 44]);
    hill(120, 74, 55, 20, [28, 24, 38]);
    rect(0, 68, 160, 22, [42, 34, 40]);
    rect(70, 48, 22, 22, [70, 54, 48]);
    rect(74, 40, 14, 10, [90, 70, 52]);
    rect(68, 68, 26, 6, [54, 40, 32]);
    for (let i = 0; i < 8; i += 1) px(78 + (i % 3), 44 + (i % 2), [20, 16, 24]);
  },
  "stage-cinder": ({ px, rect, sky, hill }) => {
    sky([90, 36, 28], [210, 96, 42]);
    hill(30, 62, 40, 16, [92, 48, 32]);
    hill(130, 60, 48, 18, [70, 36, 28]);
    rect(0, 64, 160, 26, [58, 32, 24]);
    for (let i = 0; i < 18; i += 1) {
      px(20 + i * 7, 70 + (i % 3), [255, 140, 40]);
      px(21 + i * 7, 71, [120, 40, 20]);
    }
  },
  "stage-watch": ({ px, rect, sky, hill }) => {
    sky([10, 16, 40], [28, 36, 72]);
    hill(80, 78, 90, 24, [24, 32, 48]);
    rect(0, 72, 160, 18, [20, 26, 36]);
    rect(108, 28, 16, 46, [70, 64, 58]);
    rect(104, 24, 24, 8, [90, 80, 64]);
    rect(112, 36, 8, 6, [255, 214, 120]);
    for (let y = 20; y < 70; y += 6) px(40, y, [180, 190, 210]);
  },
  "stage-span": ({ px, rect, sky, hill }) => {
    sky([120, 150, 176], [186, 206, 214]);
    hill(20, 58, 36, 18, [90, 110, 96]);
    hill(146, 56, 30, 16, [78, 98, 88]);
    rect(0, 62, 160, 28, [64, 92, 110]);
    rect(18, 54, 28, 10, [120, 110, 96]);
    rect(112, 54, 28, 10, [120, 110, 96]);
    for (let x = 46; x < 112; x += 1) {
      const sag = Math.abs(x - 79) > 20 ? 0 : 4;
      px(x, 58 + sag, [92, 72, 52]);
      if (x % 8 === 0) px(x, 59 + sag, [70, 54, 40]);
    }
    rect(70, 62, 18, 8, [40, 48, 52]);
  },
  "stage-kiln2": ({ px, rect, sky, hill }) => {
    sky([48, 28, 36], [180, 72, 40]);
    hill(80, 70, 80, 20, [70, 42, 32]);
    rect(0, 66, 160, 24, [48, 30, 24]);
    rect(36, 40, 28, 28, [110, 62, 48]);
    rect(44, 48, 12, 18, [255, 120, 40]);
    rect(96, 34, 32, 34, [92, 50, 40]);
    rect(106, 44, 12, 22, [255, 90, 30]);
    rect(46, 32, 6, 10, [40, 36, 36]);
    rect(110, 24, 6, 12, [40, 36, 36]);
  },
  "stage-lantern": ({ px, rect, sky, hill }) => {
    sky([24, 20, 48], [64, 40, 72]);
    hill(80, 72, 100, 22, [40, 34, 48]);
    rect(0, 70, 160, 20, [36, 30, 32]);
    rect(70, 74, 20, 16, [70, 58, 42]);
    for (let i = 0; i < 5; i += 1) lamp(px, 24 + i * 28, 48);
  },
  "stage-boar": ({ px, rect, sky, hill }) => {
    sky([196, 140, 90], [150, 96, 64]);
    hill(24, 60, 30, 20, [120, 84, 58]);
    hill(140, 58, 36, 22, [100, 70, 48]);
    rect(0, 66, 160, 24, [92, 64, 42]);
    for (let i = 0; i < 8; i += 1) {
      rect(30 + i * 12, 72, 4, 3, [48, 32, 24]);
      rect(34 + i * 12, 76, 4, 3, [48, 32, 24]);
    }
    rect(100, 60, 18, 8, [70, 48, 36]);
  },
  "stage-lamps": ({ px, rect, sky, hill }) => {
    sky([12, 14, 36], [36, 28, 64]);
    hill(50, 68, 60, 18, [28, 26, 40]);
    hill(130, 70, 40, 16, [22, 22, 36]);
    rect(0, 72, 160, 18, [30, 28, 32]);
    for (let i = 0; i < 6; i += 1) {
      rect(16 + i * 24, 58, 8, 16, [54, 46, 40]);
      px(19 + i * 24, 54, [255, 196, 90]);
      px(20 + i * 24, 55, [255, 220, 140]);
    }
  },
};

for (const [name, draw] of Object.entries(scenes)) {
  writeFileSync(`public/backdrops/${name}.jpg`, paint(draw));
  console.log(name);
}

const probe = jpeg.decode(readFileSync("public/backdrops/stage-span.jpg"));
console.log("span", probe.width, probe.height);
