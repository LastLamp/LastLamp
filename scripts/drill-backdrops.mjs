import { writeFileSync } from "fs";

console.error("Retired. Drill paintings are unique files in public/backdrops.");
process.exit(1);
import jpeg from "jpeg-js";

const width = 640;
const height = 360;

function encode(pixel) {
  const data = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [r, g, b] = pixel(x, y);
      const i = (y * width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  return jpeg.encode({ data, width, height }, 78).data;
}

function sky(y, top, bottom) {
  const t = y / height;
  return top.map((channel, i) => Math.round(channel + (bottom[i] - channel) * t));
}

const scenes = {
  1(x, y) {
    const ground = y > 70;
    const post = y > 18 && y < 78 && (Math.abs(x - 180) < 10 || Math.abs(x - 460) < 10);
    const bar = y > 16 && y < 32 && x > 180 && x < 460;
    if (post || bar) return [92, 64, 40];
    if (ground) return [126, 156, 92];
    return sky(y, [186, 214, 232], [244, 228, 196]);
  },
  2(x, y) {
    const ground = y > 78;
    const arch = Math.hypot(x - 320, y - 48) < 70 && Math.hypot(x - 320, y - 48) > 52 && y < 70;
    if (arch) return [74, 58, 46];
    if (ground) return [196, 154, 96];
    return sky(y, [232, 196, 150], [168, 120, 78]);
  },
  3(x, y) {
    const glow = Math.hypot(x - 320, y - 78);
    const pit = y > 36 && glow < 90;
    if (pit) return [210, 92, 36];
    if (y > 36) return [48, 36, 32];
    return sky(y, [28, 22, 28], [92, 42, 28]);
  },
  4(x, y) {
    const ring = Math.abs(Math.hypot(x - 320, (y - 48) * 1.6) - 70) < 8;
    if (ring) return [232, 224, 210];
    if (y > 40) return [108, 112, 118];
    return sky(y, [168, 176, 186], [96, 102, 110]);
  },
  5(x, y) {
    const lamp = Math.hypot(x - 320, y - 36) < 16;
    const pole = Math.abs(x - 320) < 6 && y > 36 && y < 90;
    const glow = Math.hypot(x - 320, y - 36);
    if (lamp) return [255, 214, 120];
    if (pole) return [40, 36, 48];
    if (glow < 70) return [92, 72, 110];
    if (y > 84) return [24, 22, 36];
    return sky(y, [12, 14, 32], [36, 28, 58]);
  },
};

for (const tier of [1, 2, 3, 4, 5]) {
  writeFileSync(`public/backdrops/drill-${tier}.jpg`, encode(scenes[tier]));
}
