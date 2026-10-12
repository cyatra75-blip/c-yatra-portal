import fs from 'fs';
import sharp from 'sharp';

async function processLogo() {
  const inputPath = 'C:/Users/hp/.gemini/antigravity/brain/24d45e44-ac94-4f0b-af07-863deaea5db0/.user_uploaded/media_1791787510895_8289d22c.jpg';
  
  // Load raw pixels
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  console.log(`Original image: ${width}x${height}, channels: ${channels}`);

  // Create RGBA buffer
  const rgba = Buffer.alloc(width * height * 4);
  const isBg = new Uint8Array(width * height);
  const queue = [];

  // Seed outer borders
  for (let x = 0; x < width; x++) {
    queue.push(x, 0, x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    queue.push(0, y, width - 1, y);
  }

  // Flood fill outer white background
  while (queue.length > 0) {
    const y = queue.pop();
    const x = queue.pop();
    const pos = y * width + x;
    if (isBg[pos]) continue;

    const idx = pos * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // Background white threshold (r > 235 && g > 235 && b > 235)
    if (r > 235 && g > 235 && b > 235) {
      isBg[pos] = 1;
      if (x > 0) queue.push(x - 1, y);
      if (x < width - 1) queue.push(x + 1, y);
      if (y > 0) queue.push(x, y - 1);
      if (y < height - 1) queue.push(x, y + 1);
    }
  }

  // Also flood fill the inner loops of letters 'a' in 'atra' if they are enclosed white
  // Sample inside 'a' loops (around middle right area of the image)
  for (let y = Math.floor(height * 0.3); y < Math.floor(height * 0.7); y++) {
    for (let x = Math.floor(width * 0.5); x < Math.floor(width * 0.95); x++) {
      const pos = y * width + x;
      if (!isBg[pos]) {
        const idx = pos * channels;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        // If pure white island inside letter
        if (r > 245 && g > 245 && b > 245) {
          // Fill this island
          queue.push(x, y);
          while (queue.length > 0) {
            const qy = queue.pop();
            const qx = queue.pop();
            const qpos = qy * width + qx;
            if (isBg[qpos]) continue;
            const qidx = qpos * channels;
            const qr = data[qidx], qg = data[qidx+1], qb = data[qidx+2];
            if (qr > 235 && qg > 235 && qb > 235) {
              isBg[qpos] = 1;
              if (qx > 0) queue.push(qx - 1, qy);
              if (qx < width - 1) queue.push(qx + 1, qy);
              if (qy > 0) queue.push(qx, qy - 1);
              if (qy < height - 1) queue.push(qx, qy + 1);
            }
          }
        }
      }
    }
  }

  // Calculate tight content bounds
  let minX = width, maxX = 0, minY = height, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      if (!isBg[pos]) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  // Add 4px breathing room padding
  minX = Math.max(0, minX - 4);
  minY = Math.max(0, minY - 4);
  maxX = Math.min(width - 1, maxX + 4);
  maxY = Math.min(height - 1, maxY + 4);

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  console.log(`Cropped content bounds: ${cropW}x${cropH} (minX=${minX}, maxX=${maxX}, minY=${minY}, maxY=${maxY})`);

  // Fill output buffer with antialiased transparency
  const croppedRgba = Buffer.alloc(cropW * cropH * 4);

  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const sX = minX + x;
      const sY = minY + y;
      const sPos = sY * width + sX;
      const sIdx = sPos * channels;
      const oIdx = (y * cropW + x) * 4;

      const r = data[sIdx];
      const g = data[sIdx + 1];
      const b = data[sIdx + 2];

      if (isBg[sPos]) {
        croppedRgba[oIdx] = 255;
        croppedRgba[oIdx + 1] = 255;
        croppedRgba[oIdx + 2] = 255;
        croppedRgba[oIdx + 3] = 0; // Pure transparent
      } else {
        // Check if near border to background for soft anti-aliasing
        const lum = (r + g + b) / 3;
        if (lum > 240) {
          // Soft edge alpha
          const alpha = Math.max(0, Math.min(255, Math.round(255 * (1 - (lum - 240) / 15))));
          croppedRgba[oIdx] = r;
          croppedRgba[oIdx + 1] = g;
          croppedRgba[oIdx + 2] = b;
          croppedRgba[oIdx + 3] = alpha;
        } else {
          croppedRgba[oIdx] = r;
          croppedRgba[oIdx + 1] = g;
          croppedRgba[oIdx + 2] = b;
          croppedRgba[oIdx + 3] = 255;
        }
      }
    }
  }

  // Save the master transparent logo PNG
  await sharp(croppedRgba, {
    raw: { width: cropW, height: cropH, channels: 4 }
  })
    .png({ compressionLevel: 9 })
    .toFile('public/images/logo.png');

  console.log('✓ Successfully created public/images/logo.png');

  // Also create a square icon version for Favicon and Web App Manifest (PWA / Add to Home screen)
  // Square padding on white/transparent background with rounded or clean icon
  const iconSize = 512;
  const logoAspect = cropW / cropH;
  let targetLogoW, targetLogoH;
  if (logoAspect > 1) {
    targetLogoW = Math.round(iconSize * 0.88);
    targetLogoH = Math.round(targetLogoW / logoAspect);
  } else {
    targetLogoH = Math.round(iconSize * 0.88);
    targetLogoW = Math.round(targetLogoH * logoAspect);
  }

  const resizedLogo = await sharp(croppedRgba, {
    raw: { width: cropW, height: cropH, channels: 4 }
  })
    .resize(targetLogoW, targetLogoH, { fit: 'contain' })
    .png()
    .toBuffer();

  // Create solid white background square icon (512x512) for Add to Home Screen (Apple Touch Icon / Android)
  // Apple iOS and Android Home Screen icons require solid background, otherwise transparent shows as black box!
  const homeScreenIcon512 = await sharp({
    create: {
      width: iconSize,
      height: iconSize,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
    .composite([{ input: resizedLogo, gravity: 'centre' }])
    .png()
    .toFile('public/icon-512.png');

  // 192x192 version for manifest
  await sharp('public/icon-512.png')
    .resize(192, 192)
    .png()
    .toFile('public/icon-192.png');

  // 180x180 for Apple Touch Icon
  await sharp('public/icon-512.png')
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');

  // 32x32 and 16x16 for favicon
  await sharp('public/icon-512.png')
    .resize(32, 32)
    .png()
    .toFile('public/favicon-32x32.png');

  await sharp('public/icon-512.png')
    .resize(16, 16)
    .png()
    .toFile('public/favicon-16x16.png');

  // Also save to app/favicon.ico and app/icon.png for Next.js App Router metadata conventions!
  await sharp('public/icon-512.png')
    .resize(32, 32)
    .png()
    .toFile('app/icon.png');

  await sharp('public/icon-512.png')
    .resize(180, 180)
    .png()
    .toFile('app/apple-icon.png');

  console.log('✓ Successfully generated all PWA / Add-to-Home-Screen icons and favicons!');
}

processLogo().catch(console.error);
