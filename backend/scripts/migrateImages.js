import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

import { connectDatabase, Product } from '../database.js';

const publicImagesDir = path.join(__dirname, '..', '..', 'frontend', 'public');

async function uploadToCloudinary(localPath) {
  try {
    const fullPath = path.join(publicImagesDir, localPath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ Image locale non trouvée: ${fullPath}`);
      return localPath; // fallback
    }

    // On utilise fetch_format: 'auto' et quality: 'auto' pour optimiser massivement le poids (ex: 26Mo -> 200Ko)
    console.log(`Uploading ${localPath}...`);
    const result = await cloudinary.uploader.upload(fullPath, {
      folder: 'dynace-global/products',
      fetch_format: 'auto',
      quality: 'auto'
    });
    console.log(`✅ Upload réussi : ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Erreur lors de l'upload de ${localPath}:`, error);
    return localPath;
  }
}

async function runMigration() {
  try {
    await connectDatabase();

    const products = await Product.find({});
    console.log(`${products.length} produits trouvés. Début de la migration...`);

    for (const product of products) {
      console.log(`\nTraitement du produit : ${product.name}`);
      let updated = false;

      // 1. Image principale
      if (product.image && product.image.startsWith('/images/')) {
        const newUrl = await uploadToCloudinary(product.image);
        if (newUrl !== product.image) {
          product.image = newUrl;
          updated = true;
        }
      }

      // 2. Images de la galerie
      if (product.images && product.images.length > 0) {
        const newImages = [];
        for (const imgPath of product.images) {
          if (imgPath.startsWith('/images/')) {
            const newUrl = await uploadToCloudinary(imgPath);
            newImages.push(newUrl);
            if (newUrl !== imgPath) updated = true;
          } else {
            newImages.push(imgPath);
          }
        }
        product.images = newImages;
      }

      if (updated) {
        await product.save();
        console.log(`💾 Produit mis à jour dans la base de données.`);
      } else {
        console.log(`⏭️ Aucune mise à jour locale nécessaire pour ce produit.`);
      }
    }

    console.log("\n🎉 Migration terminée avec succès !");
  } catch (error) {
    console.error("Erreur globale :", error);
  } finally {
    mongoose.disconnect();
  }
}

runMigration();
