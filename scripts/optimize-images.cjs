#!/usr/bin/env node
/**
 * Image Optimization Script for Dynace E-commerce
 * 
 * Converts all PNG product images to WebP in multiple sizes,
 * generates tiny blur placeholders (base64), and creates a manifest.
 * 
 * Usage: node scripts/optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '..', 'frontend', 'public', 'images');
const OUTPUT_DIR = path.join(__dirname, '..', 'frontend', 'public', 'images', 'optimized');
const MANIFEST_PATH = path.join(__dirname, '..', 'frontend', 'src', 'image-manifest.json');

// Size presets
const SIZES = {
  thumb: { width: 400, quality: 80 },   // Product cards in catalog grid
  medium: { width: 800, quality: 82 },   // Product detail main image
  full: { width: 1200, quality: 85 },     // Zoom / high quality
};

const PLACEHOLDER_WIDTH = 20; // Tiny blur placeholder

async function optimizeImage(filePath, fileName) {
  const baseName = path.parse(fileName).name;
  const result = {
    original: `/images/${fileName}`,
    placeholder: null,
    sizes: {}
  };

  try {
    // Get original image metadata
    const metadata = await sharp(filePath).metadata();
    const aspectRatio = metadata.height / metadata.width;

    // Generate blur placeholder (tiny base64)
    const placeholderBuffer = await sharp(filePath)
      .resize({ width: PLACEHOLDER_WIDTH })
      .webp({ quality: 20 })
      .toBuffer();
    
    result.placeholder = `data:image/webp;base64,${placeholderBuffer.toString('base64')}`;

    // Generate each size variant
    for (const [sizeName, config] of Object.entries(SIZES)) {
      // Don't upscale if original is smaller than target
      const targetWidth = Math.min(config.width, metadata.width);
      const outputFileName = `${baseName}-${sizeName}.webp`;
      const outputPath = path.join(OUTPUT_DIR, outputFileName);

      await sharp(filePath)
        .resize({ width: targetWidth })
        .webp({ quality: config.quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      result.sizes[sizeName] = {
        src: `/images/optimized/${outputFileName}`,
        width: targetWidth,
        height: Math.round(targetWidth * aspectRatio),
        fileSize: stats.size,
      };
    }

    const originalStats = fs.statSync(filePath);
    const totalOptimized = Object.values(result.sizes).reduce((sum, s) => sum + s.fileSize, 0);
    const savings = ((1 - totalOptimized / 3 / originalStats.size) * 100).toFixed(1);
    
    console.log(`✅ ${fileName}`);
    console.log(`   Original: ${(originalStats.size / 1024).toFixed(0)} KB`);
    console.log(`   Thumb: ${(result.sizes.thumb.fileSize / 1024).toFixed(0)} KB | Medium: ${(result.sizes.medium.fileSize / 1024).toFixed(0)} KB | Full: ${(result.sizes.full.fileSize / 1024).toFixed(0)} KB`);
    console.log(`   Avg savings: ${savings}%`);
    
    return { baseName, ...result };
  } catch (err) {
    console.error(`❌ Error processing ${fileName}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('\n🖼️  Dynace Image Optimizer\n');
  console.log('='.repeat(60));
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Find all PNG files
  const files = fs.readdirSync(INPUT_DIR).filter(f => 
    f.toLowerCase().endsWith('.png') && !f.startsWith('.')
  );

  console.log(`Found ${files.length} PNG images to optimize\n`);

  const manifest = {};
  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of files) {
    const filePath = path.join(INPUT_DIR, file);
    const stats = fs.statSync(filePath);
    totalOriginal += stats.size;

    const result = await optimizeImage(filePath, file);
    if (result) {
      // Key by the original path (e.g., "/images/rocenta.png")
      manifest[result.original] = {
        placeholder: result.placeholder,
        thumb: result.sizes.thumb.src,
        medium: result.sizes.medium.src,
        full: result.sizes.full.src,
        width: result.sizes.full.width,
        height: result.sizes.full.height,
      };
      totalOptimized += result.sizes.thumb.fileSize + result.sizes.medium.fileSize + result.sizes.full.fileSize;
    }
  }

  // Write manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   Images processed: ${Object.keys(manifest).length}`);
  console.log(`   Original total: ${(totalOriginal / 1024 / 1024).toFixed(1)} MB`);
  console.log(`   Optimized total (all sizes): ${(totalOptimized / 1024 / 1024).toFixed(1)} MB`);
  console.log(`   Overall savings: ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%`);
  console.log(`   Manifest: ${MANIFEST_PATH}\n`);
}

main().catch(console.error);
