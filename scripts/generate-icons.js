/**
 * PWA Icon Generator Script
 *
 * This script helps generate PWA icons in various sizes.
 *
 * Prerequisites:
 *   npm install sharp
 *
 * Usage:
 *   1. Place your source icon (512x512 or larger) at: client/public/icons/icon-source.png
 *   2. Run: node scripts/generate-icons.js
 *
 * The script will generate all required icon sizes for PWA.
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    PWA Icon Generator                          ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  To generate PNG icons, you need to:                          ║
║                                                                ║
║  1. Install sharp:                                            ║
║     npm install sharp --save-dev                              ║
║                                                                ║
║  2. Create a source icon (512x512 PNG) at:                    ║
║     client/public/icons/icon-source.png                       ║
║                                                                ║
║  3. Run this script again:                                    ║
║     node scripts/generate-icons.js                            ║
║                                                                ║
║  Alternatively, use online tools like:                        ║
║  - https://www.pwabuilder.com/imageGenerator                  ║
║  - https://realfavicongenerator.net/                          ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);
  process.exit(0);
}

const ICON_SIZES = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];
const SOURCE_ICON = path.join(__dirname, '../client/public/icons/icon-source.png');
const OUTPUT_DIR = path.join(__dirname, '../client/public/icons');

async function generateIcons() {
  // Check if source exists
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`Source icon not found at: ${SOURCE_ICON}`);
    console.log('Please create a 512x512 PNG icon and save it as icon-source.png');
    process.exit(1);
  }

  console.log('Generating PWA icons...\n');

  for (const size of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);

    await sharp(SOURCE_ICON)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated: icon-${size}x${size}.png`);
  }

  // Generate Apple Touch Icon
  const appleTouchPath = path.join(OUTPUT_DIR, 'apple-touch-icon.png');
  await sharp(SOURCE_ICON)
    .resize(180, 180)
    .png()
    .toFile(appleTouchPath);
  console.log('✓ Generated: apple-touch-icon.png');

  // Generate favicon
  const faviconPath = path.join(OUTPUT_DIR, 'favicon.ico');
  await sharp(SOURCE_ICON)
    .resize(32, 32)
    .toFile(path.join(OUTPUT_DIR, 'favicon-32x32.png'));
  console.log('✓ Generated: favicon-32x32.png');

  console.log('\n✅ All icons generated successfully!');
  console.log(`   Output directory: ${OUTPUT_DIR}`);
}

generateIcons().catch(console.error);
