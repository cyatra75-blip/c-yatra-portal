import fs from 'fs';
import { PNG } from 'pngjs';

// Build 1: Transparent logo from white original
function buildFromWhite() {
  const src = PNG.sync.read(fs.readFileSync('C:/Users/hp/.gemini/antigravity/brain/24d45e44-ac94-4f0b-af07-863deaea5db0/.user_uploaded/media_1791643359683.png'));
  const w = src.width, h = src.height;

  // Find tight crop bounds of non-white content
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) << 2;
      const r = src.data[idx], g = src.data[idx+1], b = src.data[idx+2];
      if (r < 240 || g < 240 || b < 240) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
  }

  // Padding: 2px
  minX = Math.max(0, minX - 2);
  minY = Math.max(0, minY - 2);
  maxX = Math.min(w - 1, maxX + 2);
  maxY = Math.min(h - 1, maxY + 2);

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const out = new PNG({ width: cropW, height: cropH });

  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const sX = minX + x, sY = minY + y;
      const sIdx = (sY * w + sX) << 2;
      const oIdx = (y * cropW + x) << 2;
      const r = src.data[sIdx], g = src.data[sIdx+1], b = src.data[sIdx+2];

      // If near white, determine alpha
      const lum = (r + g + b) / 3;
      if (lum > 248) {
        out.data[oIdx] = 255;
        out.data[oIdx+1] = 255;
        out.data[oIdx+2] = 255;
        out.data[oIdx+3] = 0; // Pure transparent
      } else if (lum > 230) {
        // Soft feathering for antialiased edges
        const a = Math.round(255 * (1 - (lum - 230) / (248 - 230)));
        out.data[oIdx] = r;
        out.data[oIdx+1] = g;
        out.data[oIdx+2] = b;
        out.data[oIdx+3] = a;
      } else {
        out.data[oIdx] = r;
        out.data[oIdx+1] = g;
        out.data[oIdx+2] = b;
        out.data[oIdx+3] = 255;
      }
    }
  }

  fs.writeFileSync('public/images/logo-clean-white.png', PNG.sync.write(out));
  console.log(`✓ logo-clean-white.png generated: ${cropW}x${cropH}`);
  return { cropW, cropH };
}

function buildFromHD() {
  const src = PNG.sync.read(fs.readFileSync('C:/Users/hp/.gemini/antigravity/brain/24d45e44-ac94-4f0b-af07-863deaea5db0/.user_uploaded/media_1791704157505.png'));
  const w = src.width, h = src.height;

  // Outer background flood fill
  const isBg = new Uint8Array(w * h);
  const queue = [];
  for (let x = 0; x < w; x++) { queue.push(x, 0, x, h - 1); }
  for (let y = 0; y < h; y++) { queue.push(0, y, w - 1, y); }

  while (queue.length > 0) {
    const y = queue.pop(), x = queue.pop();
    const pos = y * w + x;
    if (isBg[pos]) continue;
    const idx = pos << 2;
    const r = src.data[idx], g = src.data[idx+1], b = src.data[idx+2];
    if (r < 18 && g < 18 && b < 18) {
      isBg[pos] = 1;
      if (x > 0) queue.push(x - 1, y);
      if (x < w - 1) queue.push(x + 1, y);
      if (y > 0) queue.push(x, y - 1);
      if (y < h - 1) queue.push(x, y + 1);
    }
  }

  // Find bounds of non-bg
  let minX = w, maxX = 0, minY = h, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pos = y * w + x;
      if (!isBg[pos]) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
  }

  // Pad slightly
  minX = Math.max(0, minX - 2);
  minY = Math.max(0, minY - 2);
  maxX = Math.min(w - 1, maxX + 2);
  maxY = Math.min(h - 1, maxY + 2);

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const out = new PNG({ width: cropW, height: cropH });

  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const sX = minX + x, sY = minY + y;
      const sPos = sY * w + sX;
      const sIdx = sPos << 2;
      const oIdx = (y * cropW + x) << 2;

      if (isBg[sPos]) {
        out.data[oIdx] = 0;
        out.data[oIdx+1] = 0;
        out.data[oIdx+2] = 0;
        out.data[oIdx+3] = 0;
      } else {
        const r = src.data[sIdx], g = src.data[sIdx+1], b = src.data[sIdx+2];
        out.data[oIdx] = r;
        out.data[oIdx+1] = g;
        out.data[oIdx+2] = b;
        out.data[oIdx+3] = 255;
      }
    }
  }

  fs.writeFileSync('public/images/logo-clean-hd.png', PNG.sync.write(out));
  console.log(`✓ logo-clean-hd.png generated: ${cropW}x${cropH}`);
}

buildFromWhite();
buildFromHD();
