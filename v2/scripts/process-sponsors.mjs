import sharp from "sharp";
import fs from "fs";
import path from "path";

const srcDir = "C:\\Users\\mathi\\OneDrive\\Escritorio\\4trebol\\logos afiliados";
const outDir = path.join(process.cwd(), "public", "images", "sponsors");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Automotora Overdrive Chile (Dark grey/black background)
async function processOverdrive() {
  const file = path.join(srcDir, "WhatsApp Image 2026-08-17 at 10.23.07 PM.jpeg");
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const outData = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    const isGold = r > 120 && g > 75 && (r - b > 40);
    const isSilver = (r > 110 && g > 110 && b > 110) && (Math.abs(r - g) < 15 && Math.abs(g - b) < 15);
    const isWhiteText = r > 140 && g > 140 && b > 140;

    if (isGold || isSilver || isWhiteText) {
      outData[i * 4 + 0] = r;
      outData[i * 4 + 1] = g;
      outData[i * 4 + 2] = b;
      outData[i * 4 + 3] = 255;
    } else {
      outData[i * 4 + 0] = 0;
      outData[i * 4 + 1] = 0;
      outData[i * 4 + 2] = 0;
      outData[i * 4 + 3] = 0;
    }
  }

  await sharp(outData, { raw: { width, height, channels: 4 } })
    .trim()
    .webp({ quality: 95 })
    .toFile(path.join(outDir, "overdrive.webp"));
  console.log("Processed Overdrive (Refined)");
}

// 2. Salgado Automotriz (Dark blue gradient background, white emblem & text, blue pill)
async function processSalgado() {
  const file = path.join(srcDir, "WhatsApp Image 2026-08-17 at 10.24.36 PM (1).jpeg");
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const outData = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const r = data[i * channels];
      const g = data[i * channels + 1];
      const b = data[i * channels + 2];

      const brightness = (r + g + b) / 3;
      // Shield and main text are in upper 71%
      const inUpper = y < height * 0.71;
      const isWhiteGraphic = inUpper && brightness > 150 && r > 115 && g > 125;
      
      // Pill in bottom 76% - 87%
      const inPillArea = y >= height * 0.76 && y <= height * 0.87 && x >= width * 0.18 && x <= width * 0.82;
      const isBluePill = inPillArea && b > 140 && r < 60 && g < 110;
      const isPillText = inPillArea && brightness > 180;
      const inSubtitleArea = y >= height * 0.72 && y < height * 0.76 && x >= width * 0.28 && x <= width * 0.58;
      const isPillSubtitle = inSubtitleArea && brightness > 195;

      if (isWhiteGraphic || isBluePill || isPillText || isPillSubtitle) {
        outData[i * 4 + 0] = r;
        outData[i * 4 + 1] = g;
        outData[i * 4 + 2] = b;
        outData[i * 4 + 3] = 255;
      } else {
        outData[i * 4 + 0] = 0;
        outData[i * 4 + 1] = 0;
        outData[i * 4 + 2] = 0;
        outData[i * 4 + 3] = 0;
      }
    }
  }

  await sharp(outData, { raw: { width, height, channels: 4 } })
    .trim()
    .webp({ quality: 95 })
    .toFile(path.join(outDir, "salgado.webp"));
  console.log("Processed Salgado (Perfected)");
}

// 3. RG Motors (Pure black background)
async function processRGMotors() {
  const file = path.join(srcDir, "WhatsApp Image 2026-08-17 at 10.24.36 PM.jpeg");
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const outData = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    const brightness = (r + g + b) / 3;
    const isColor = (b > 120 && r < 40) || (r > 160 && g < 40 && b < 40);

    if (brightness < 30 && !isColor) {
      outData[i * 4 + 0] = r;
      outData[i * 4 + 1] = g;
      outData[i * 4 + 2] = b;
      outData[i * 4 + 3] = 0;
    } else if (brightness < 50 && !isColor) {
      const alpha = Math.floor(((brightness - 30) / 20) * 255);
      outData[i * 4 + 0] = r;
      outData[i * 4 + 1] = g;
      outData[i * 4 + 2] = b;
      outData[i * 4 + 3] = alpha;
    } else {
      outData[i * 4 + 0] = r;
      outData[i * 4 + 1] = g;
      outData[i * 4 + 2] = b;
      outData[i * 4 + 3] = 255;
    }
  }

  await sharp(outData, { raw: { width, height, channels: 4 } })
    .trim()
    .webp({ quality: 95 })
    .toFile(path.join(outDir, "rg-motors.webp"));
  console.log("Processed RG Motors");
}

// 4. Automotriz Unidades Chile (Carbon dark texture)
async function processUnidadesChile() {
  const file = path.join(srcDir, "WhatsApp Image 2026-08-17 at 10.25.02 PM.jpeg");
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const outData = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    const brightness = (r + g + b) / 3;
    const isRed = r > 120 && (r - g > 40) && (r - b > 40);
    const isWhiteText = brightness > 160;

    if (isRed || isWhiteText) {
      outData[i * 4 + 0] = r;
      outData[i * 4 + 1] = g;
      outData[i * 4 + 2] = b;
      outData[i * 4 + 3] = 255;
    } else if (brightness > 60 && (isRed || r > 80)) {
      outData[i * 4 + 0] = r;
      outData[i * 4 + 1] = g;
      outData[i * 4 + 2] = b;
      outData[i * 4 + 3] = 180;
    } else {
      outData[i * 4 + 0] = 0;
      outData[i * 4 + 1] = 0;
      outData[i * 4 + 2] = 0;
      outData[i * 4 + 3] = 0;
    }
  }

  await sharp(outData, { raw: { width, height, channels: 4 } })
    .trim()
    .webp({ quality: 95 })
    .toFile(path.join(outDir, "unidades-chile.webp"));
  console.log("Processed Unidades Chile");
}

// 5. Frio Austral (Black & white circular emblem, white background)
async function processFrioAustral() {
  const file = path.join(srcDir, "WhatsApp Image 2026-08-17 at 10.25.53 PM.jpeg");
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const outData = Buffer.alloc(width * height * 4);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.49;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const r = data[i * channels];
      const g = data[i * channels + 1];
      const b = data[i * channels + 2];

      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const isWhite = r > 220 && g > 220 && b > 220;

      if (dist > radius || (dist > radius - 15 && isWhite)) {
        outData[i * 4 + 0] = 0;
        outData[i * 4 + 1] = 0;
        outData[i * 4 + 2] = 0;
        outData[i * 4 + 3] = 0;
      } else {
        outData[i * 4 + 0] = r;
        outData[i * 4 + 1] = g;
        outData[i * 4 + 2] = b;
        outData[i * 4 + 3] = 255;
      }
    }
  }

  await sharp(outData, { raw: { width, height, channels: 4 } })
    .trim()
    .webp({ quality: 95 })
    .toFile(path.join(outDir, "frio-austral.webp"));
  console.log("Processed Frio Austral");
}

// 6. Dtodo (Blue logo with white text on white background)
async function processDtodo() {
  const file = path.join(srcDir, "WhatsApp Image 2026-08-17 at 10.26.29 PM.jpeg");
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const outData = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    const isWhite = r > 240 && g > 240 && b > 240;

    if (isWhite) {
      outData[i * 4 + 0] = 0;
      outData[i * 4 + 1] = 0;
      outData[i * 4 + 2] = 0;
      outData[i * 4 + 3] = 0;
    } else {
      outData[i * 4 + 0] = r;
      outData[i * 4 + 1] = g;
      outData[i * 4 + 2] = b;
      outData[i * 4 + 3] = 255;
    }
  }

  await sharp(outData, { raw: { width, height, channels: 4 } })
    .trim()
    .webp({ quality: 95 })
    .toFile(path.join(outDir, "dtodo.webp"));
  console.log("Processed Dtodo");
}

// 7. Godplay (Circular red badge with IG ring on white background)
async function processGodplay() {
  const file = path.join(srcDir, "WhatsApp Image 2026-08-17 at 10.28.52 PM.jpeg");
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const outData = Buffer.alloc(width * height * 4);

  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.485;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const r = data[i * channels];
      const g = data[i * channels + 1];
      const b = data[i * channels + 2];

      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const isOuterWhite = dist > radius || (dist > radius - 6 && r > 235 && g > 235 && b > 235);

      if (isOuterWhite) {
        outData[i * 4 + 0] = 0;
        outData[i * 4 + 1] = 0;
        outData[i * 4 + 2] = 0;
        outData[i * 4 + 3] = 0;
      } else {
        outData[i * 4 + 0] = r;
        outData[i * 4 + 1] = g;
        outData[i * 4 + 2] = b;
        outData[i * 4 + 3] = 255;
      }
    }
  }

  await sharp(outData, { raw: { width, height, channels: 4 } })
    .trim()
    .webp({ quality: 95 })
    .toFile(path.join(outDir, "godplay.webp"));
  console.log("Processed Godplay");
}

async function main() {
  await Promise.all([
    processOverdrive(),
    processSalgado(),
    processRGMotors(),
    processUnidadesChile(),
    processFrioAustral(),
    processDtodo(),
    processGodplay(),
  ]);
  console.log("All 7 sponsor logos processed successfully!");
}

main().catch(console.error);
