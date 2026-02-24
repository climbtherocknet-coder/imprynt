#!/usr/bin/env node
/**
 * Download curated gallery images from Unsplash CDN.
 * Downloads full-size + thumbnails for covers and backgrounds.
 * Run: node scripts/download-gallery.mjs
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Unsplash photo IDs organized by category and tag
const GALLERY = {
  covers: [
    // Abstract (8)
    { id: 'photo-1557683316-973673baf926', tag: 'abstract', label: 'Warm gradient' },
    { id: 'photo-1579546929518-9e396f3cc135', tag: 'abstract', label: 'Purple haze' },
    { id: 'photo-1618005182384-a83a8bd57fbe', tag: 'abstract', label: 'Liquid color' },
    { id: 'photo-1557682250-33bd709cbe85', tag: 'abstract', label: 'Cool gradient' },
    { id: 'photo-1558591710-4b4a1ae0f04d', tag: 'abstract', label: 'Blue waves' },
    { id: 'photo-1604076913837-52ab5f34d2e6', tag: 'abstract', label: 'Dark geometry' },
    { id: 'photo-1614850523296-d8c1af93d400', tag: 'abstract', label: 'Warm swirl' },
    { id: 'photo-1620641788421-7a1c342ea42e', tag: 'abstract', label: 'Color blobs' },
    // City (5)
    { id: 'photo-1480714378408-67cf0d13bc1b', tag: 'city', label: 'NYC skyline' },
    { id: 'photo-1449824913935-59a10b8d2000', tag: 'city', label: 'City from above' },
    { id: 'photo-1477959858617-67f85cf4f1df', tag: 'city', label: 'City night' },
    { id: 'photo-1514565131-fce0801e5785', tag: 'city', label: 'Downtown aerial' },
    { id: 'photo-1519501025264-65ba15a82390', tag: 'city', label: 'Urban architecture' },
    // Nature (5)
    { id: 'photo-1506744038136-46273834b3fb', tag: 'nature', label: 'Mountain lake' },
    { id: 'photo-1470071459604-3b5ec3a7fe05', tag: 'nature', label: 'Green valley' },
    { id: 'photo-1507525428034-b723cf961d3e', tag: 'nature', label: 'Tropical beach' },
    { id: 'photo-1469474968028-56623f02e42e', tag: 'nature', label: 'Sunset ocean' },
    { id: 'photo-1441974231531-c6227db76b6e', tag: 'nature', label: 'Forest trail' },
    // Workspace (3)
    { id: 'photo-1497366216548-37526070297c', tag: 'workspace', label: 'Minimal desk' },
    { id: 'photo-1497215728101-856f4ea42174', tag: 'workspace', label: 'Office space' },
    { id: 'photo-1517502884422-41eaead166d4', tag: 'workspace', label: 'Laptop setup' },
    // Dark (4)
    { id: 'photo-1534796636912-3b95b3ab5986', tag: 'dark', label: 'Dark clouds' },
    { id: 'photo-1478760329108-5c3ed9d495a0', tag: 'dark', label: 'Dark abstract' },
    { id: 'photo-1536566482680-fca31930a0bd', tag: 'dark', label: 'Moody dark' },
    { id: 'photo-1533134486753-c833f0ed4866', tag: 'dark', label: 'Night sky' },
  ],
  backgrounds: [
    // Texture (5)
    { id: 'photo-1558618666-fcd25c85f82e', tag: 'texture', label: 'Paper grain' },
    { id: 'photo-1533035353720-f1c6a75cd8ab', tag: 'texture', label: 'Concrete' },
    { id: 'photo-1553949345-eb786bb3f7ba', tag: 'texture', label: 'Wood grain' },
    { id: 'photo-1588345921523-c2dcdb7f1dcd', tag: 'texture', label: 'Soft fabric' },
    { id: 'photo-1516117172878-fd2c41f4a759', tag: 'texture', label: 'Marble' },
    // Gradient (4)
    { id: 'photo-1557682224-5b8590cd9ec5', tag: 'gradient', label: 'Warm gradient' },
    { id: 'photo-1557683311-eac922361b44', tag: 'gradient', label: 'Pink sunset' },
    { id: 'photo-1614854262318-831574f15f1f', tag: 'gradient', label: 'Purple haze' },
    { id: 'photo-1620121692029-d088224ddc74', tag: 'gradient', label: 'Cool blue' },
    // Pattern (3)
    { id: 'photo-1518893494013-386c8d5f8ee5', tag: 'pattern', label: 'Geometric dark' },
    { id: 'photo-1528722828814-77b9b83aafb2', tag: 'pattern', label: 'Minimal lines' },
    { id: 'photo-1531685250784-7569952593d2', tag: 'pattern', label: 'Abstract pattern' },
    // Atmospheric (3)
    { id: 'photo-1419242902214-272b3f66ee7a', tag: 'atmospheric', label: 'Bokeh lights' },
    { id: 'photo-1502790671504-542ad42d5189', tag: 'atmospheric', label: 'Soft clouds' },
    { id: 'photo-1502481851512-e9e2529b8784', tag: 'atmospheric', label: 'Misty sky' },
  ],
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      console.log(`  SKIP ${path.basename(dest)} (exists)`);
      resolve();
      return;
    }
    const file = fs.createWriteStream(dest);
    const doRequest = (reqUrl, redirects = 0) => {
      if (redirects > 5) { reject(new Error('Too many redirects')); return; }
      https.get(reqUrl, { headers: { 'User-Agent': 'Imprynt-Gallery-Downloader/1.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          doRequest(res.headers.location, redirects + 1);
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          reject(new Error(`HTTP ${res.statusCode} for ${reqUrl}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }).on('error', (err) => {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(err);
      });
    };
    doRequest(url);
  });
}

async function downloadImage(category, item, index) {
  const prefix = category === 'covers' ? 'cover' : 'bg';
  const num = String(index + 1).padStart(2, '0');
  const filename = `${prefix}-${item.tag}-${num}.jpg`;

  const fullDir = path.join(ROOT, 'public', 'gallery', category);
  const thumbDir = path.join(ROOT, 'public', 'gallery', category, 'thumb');

  const fullW = category === 'covers' ? 1920 : 1200;
  const fullH = category === 'covers' ? 1080 : 1600;
  const thumbW = 400;
  const thumbH = category === 'covers' ? 225 : 533;

  const baseUrl = `https://images.unsplash.com/${item.id}`;
  const fullUrl = `${baseUrl}?w=${fullW}&h=${fullH}&fit=crop&q=80&auto=format`;
  const thumbUrl = `${baseUrl}?w=${thumbW}&h=${thumbH}&fit=crop&q=70&auto=format`;

  try {
    console.log(`  [${category}] ${filename}`);
    await download(fullUrl, path.join(fullDir, filename));
    await download(thumbUrl, path.join(thumbDir, filename));
  } catch (err) {
    console.error(`  FAIL ${filename}: ${err.message}`);
  }
}

async function main() {
  console.log('Downloading gallery images...\n');

  // Process covers
  let coverIndex = 0;
  for (const item of GALLERY.covers) {
    await downloadImage('covers', item, coverIndex++);
  }

  // Process backgrounds
  let bgIndex = 0;
  for (const item of GALLERY.backgrounds) {
    await downloadImage('backgrounds', item, bgIndex++);
  }

  console.log('\nDone! Downloaded to public/gallery/');

  // Generate seed SQL
  generateSeed();
}

function generateSeed() {
  const lines = [
    '-- Gallery seed — auto-generated',
    "TRUNCATE image_gallery CASCADE;",
    '',
  ];

  let order = 1;
  for (const item of GALLERY.covers) {
    const num = String(GALLERY.covers.indexOf(item) + 1).padStart(2, '0');
    const filename = `cover-${item.tag}-${num}.jpg`;
    lines.push(
      `INSERT INTO image_gallery (category, url, thumbnail_url, label, tags, display_order) VALUES ('cover', '/gallery/covers/${filename}', '/gallery/covers/thumb/${filename}', '${item.label.replace(/'/g, "''")}', '${item.tag}', ${order++});`
    );
  }

  lines.push('');
  order = 1;
  for (const item of GALLERY.backgrounds) {
    const num = String(GALLERY.backgrounds.indexOf(item) + 1).padStart(2, '0');
    const filename = `bg-${item.tag}-${num}.jpg`;
    lines.push(
      `INSERT INTO image_gallery (category, url, thumbnail_url, label, tags, display_order) VALUES ('background', '/gallery/backgrounds/${filename}', '/gallery/backgrounds/thumb/${filename}', '${item.label.replace(/'/g, "''")}', '${item.tag}', ${order++});`
    );
  }

  const seedPath = path.join(ROOT, 'db', 'seeds', 'gallery-seed.sql');
  fs.writeFileSync(seedPath, lines.join('\n') + '\n');
  console.log(`\nGenerated: ${seedPath}`);
}

main().catch(console.error);
