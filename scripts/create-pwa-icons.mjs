import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, '../client/public/icons');
const screenshotsDir = path.join(__dirname, '../client/public/screenshots');
const sourceIcon = path.join(iconsDir, 'icon-512x512.png');

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA icons...');

  // Check if source exists
  if (!fs.existsSync(sourceIcon)) {
    console.error('Source icon not found:', sourceIcon);
    process.exit(1);
  }

  try {
    // Generate 192x192 regular icon
    await sharp(sourceIcon)
      .resize(192, 192)
      .png()
      .toFile(path.join(iconsDir, 'icon-192x192.png'));
    console.log('✓ Created icon-192x192.png');

    // Generate 192x192 maskable icon (with padding for safe zone)
    await sharp(sourceIcon)
      .resize(154, 154)  // 80% of 192 for safe zone
      .extend({
        top: 19,
        bottom: 19,
        left: 19,
        right: 19,
        background: { r: 37, g: 99, b: 235, alpha: 1 }  // #2563eb
      })
      .png()
      .toFile(path.join(iconsDir, 'icon-192x192-maskable.png'));
    console.log('✓ Created icon-192x192-maskable.png');

    // Generate 512x512 maskable icon (with padding for safe zone)
    await sharp(sourceIcon)
      .resize(410, 410)  // 80% of 512 for safe zone
      .extend({
        top: 51,
        bottom: 51,
        left: 51,
        right: 51,
        background: { r: 37, g: 99, b: 235, alpha: 1 }  // #2563eb
      })
      .png()
      .toFile(path.join(iconsDir, 'icon-512x512-maskable.png'));
    console.log('✓ Created icon-512x512-maskable.png');

    console.log('\n✅ All icons generated successfully!');
  } catch (err) {
    console.error('Error generating icons:', err);
    process.exit(1);
  }
}

generateIcons();
