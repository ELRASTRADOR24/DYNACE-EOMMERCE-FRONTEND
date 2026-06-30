import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDatabase, User, Product, Order, Review, Setting } from './database.js';
import { seedProducts } from './seed.js';
import Stripe from 'stripe';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { sendContactEmail, sendOrderNotificationEmail } from './utils/email.js';

// Configuration de Nodemailer pour les confirmations de commandes
const createMailTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  // Mode développement : Ethereal Mail (compte temporaire gratuit)
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch (err) {
    console.warn("⚠️ Nodemailer: Impossible de créer un compte Ethereal de test (pas d'internet ?). Fallback sur console.log :", err.message);
    return null;
  }
};

const sendOrderConfirmationEmail = async (order) => {
  const transporter = await createMailTransporter();
  
  const itemsText = order.items.map(item => `- ${item.name} x${item.quantity} (${item.price.toFixed(2)} €)`).join('\n');
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)} €</td>
    </tr>
  `).join('');

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #153A89;">Dynace Global</h2>
        <p style="font-size: 1.1rem; color: #475569;">Merci pour votre commande !</p>
      </div>
      <p>Bonjour <strong>${order.first_name} ${order.last_name}</strong>,</p>
      <p>Votre paiement a été validé avec succès. Voici le récapitulatif de votre commande <strong>${order.order_number}</strong> :</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Produit</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Quantité</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Prix</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div style="text-align: right; font-size: 1.1rem; margin-top: 20px;">
        <p>Sous-total : ${order.subtotal.toFixed(2)} €</p>
        <p>Livraison : ${order.shipping === 0 ? 'Gratuit' : '${order.shipping.toFixed(2)} €'}</p>
        <p style="font-size: 1.3rem; color: #153A89; font-weight: bold;">Total : ${order.total.toFixed(2)} €</p>
      </div>
      
      <div style="margin-top: 30px; padding: 15px; background-color: #f1f5f9; border-radius: 6px;">
        <h4 style="margin-top: 0; color: #153A89;">Adresse de livraison :</h4>
        <p style="margin-bottom: 0; color: #475569;">
          ${order.first_name} ${order.last_name}<br/>
          ${order.address}<br/>
          ${order.postal_code} ${order.city}
        </p>
      </div>
      
      <p style="margin-top: 30px; font-size: 0.9rem; color: #94a3b8; text-align: center;">
        Cet e-mail a été envoyé automatiquement. Pour toute question, contactez notre support.
      </p>
    </div>
  `;

  if (!transporter) {
    console.log("=== EMAIL CONFIRMATION LOG (Simulé) ===");
    console.log(`Destinataire : ${order.email}`);
    console.log(`Sujet : Confirmation de votre commande ${order.order_number} - Dynace Global`);
    console.log(itemsText);
    console.log("=========================================");
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: '"Dynace Global" <noreply@dynaceglobal.com>',
      to: order.email,
      subject: `Confirmation de votre commande ${order.order_number} - Dynace Global`,
      text: `Merci pour votre commande !\n\nNuméro de commande : ${order.order_number}\n\nArticles :\n${itemsText}\n\nTotal : ${order.total.toFixed(2)} €`,
      html: emailHtml
    });
    
    console.log(`✉️ E-mail de confirmation envoyé à ${order.email}`);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`🔗 Lien de prévisualisation de l'e-mail : ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi de l'e-mail de confirmation :", err.message);
  }
};

const sendAdminNotificationEmail = async (order) => {
  const transporter = await createMailTransporter();
  const adminEmail = process.env.EMAIL_USER || 'dynaceglogal@gmail.com';
  
  // Estimation du poids : environ 300g par article
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const estimatedWeightKg = (totalItems * 0.3).toFixed(2);
  
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
    </tr>
  `).join('');

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #d97706;">Nouvelle Commande ! 🎉</h2>
      <p>Vous avez reçu une nouvelle commande (<strong>${order.order_number}</strong>).</p>
      
      <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 6px;">
        <h3 style="margin-top: 0; color: #0f172a;">Infos Client :</h3>
        <p style="margin-bottom: 0;">
          <strong>Nom :</strong> ${order.first_name} ${order.last_name}<br/>
          <strong>E-mail :</strong> ${order.email}<br/>
          <strong>Total payé :</strong> ${order.total.toFixed(2)} €
        </p>
      </div>

      <div style="margin-top: 20px; padding: 15px; background-color: #f0fdf4; border-radius: 6px;">
        <h3 style="margin-top: 0; color: #166534;">À préparer et expédier :</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <thead>
            <tr>
              <th style="text-align: left; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Produit</th>
              <th style="text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Quantité</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <h4 style="margin-bottom: 5px;">Adresse d'expédition :</h4>
        <p style="margin-top: 0; padding: 10px; background: #fff; border: 1px solid #ccc; border-radius: 4px;">
          ${order.first_name} ${order.last_name}<br/>
          ${order.address}<br/>
          ${order.postal_code} ${order.city}
        </p>
      </div>

      <div style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-radius: 6px;">
        <h3 style="margin-top: 0; color: #1e3a8a;">Préparation Colissimo (La Poste) 📦</h3>
        <p><strong>Poids estimé total :</strong> ~${estimatedWeightKg} kg (${totalItems} article(s) à ~300g chacun)</p>
        <p>Les frais de port payés par le client étaient de : <strong>${order.shipping === 0 ? 'Gratuit' : order.shipping.toFixed(2) + ' €'}</strong>.</p>
        <a href="https://www.laposte.fr/colissimo-en-ligne" target="_blank" style="display: inline-block; margin-top: 10px; padding: 10px 15px; background-color: #1e3a8a; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Acheter l'étiquette sur La Poste
        </a>
      </div>
    </div>
  `;

  if (!transporter) {
    console.log("=== EMAIL NOTIFICATION ADMIN (Simulé) ===");
    console.log(`Destinataire : ${adminEmail}`);
    console.log(`Sujet : 🔔 Nouvelle Commande : ${order.order_number}`);
    console.log("=========================================");
    return;
  }

  try {
    await transporter.sendMail({
      from: '"Dynace Global" <noreply@dynaceglobal.com>',
      to: adminEmail,
      subject: `🔔 Nouvelle Commande : ${order.order_number}`,
      html: emailHtml
    });
    console.log(`✉️ Notification admin envoyée à ${adminEmail}`);
  } catch (err) {
    console.error("❌ Erreur lors de l'envoi de la notification admin :", err.message);
  }
};

// Charge les variables d'environnement depuis le fichier .env
try {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/(^['"]|['"]$)/g, '');
        if (key) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (err) {
  console.warn('Impossible de charger le fichier .env :', err.message);
}

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn("⚠️ Attention : La variable STRIPE_SECRET_KEY n'est pas définie dans votre fichier .env.");
}
const stripe = new Stripe(stripeSecretKey || 'sk_test_mock_placeholder_key');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'dynace_dev_jwt_secret_fallback';

app.use(cors());
app.use(express.json());

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration de Multer-Storage-Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'dynace-global',
    resource_type: 'auto', // permet les images et les vidéos
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi']
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Token Verification Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Accès refusé, jeton de session manquant.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Session expirée ou invalide.' });
    }
    req.userId = decoded.id;
    next();
  });
};

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
  const { firstName, lastName, email, password, address, postalCode, city } = req.body;

  if (!firstName || !lastName || !email || !password || !address || !postalCode || !city) {
    return res.status(400).json({ error: 'Veuillez remplir tous les champs.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères.' });
  }

  try {
    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Cette adresse email est déjà utilisée.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const newUser = new User({
      first_name: firstName,
      last_name: lastName,
      email,
      password: hashedPassword,
      address,
      postal_code: postalCode,
      city
    });
    const result = await newUser.save();

    // Generate JWT
    const token = jwt.sign({ id: result._id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      token,
      user: {
        id: result._id,
        firstName,
        lastName,
        email,
        address,
        postalCode,
        city,
        isAdmin: result.is_admin || false
      }
    });
  } catch (err) {
    console.error('Erreur inscription :', err.message);
    res.status(500).json({ error: 'Erreur interne du serveur lors de l\'inscription.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Veuillez renseigner votre email et votre mot de passe.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Adresse email ou mot de passe incorrect.' });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(400).json({ error: 'Adresse email ou mot de passe incorrect.' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        address: user.address,
        postalCode: user.postal_code,
        city: user.city,
        isAdmin: user.is_admin || false
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur interne lors de la connexion.' });
  }
});

// Get Current User Profile (Route protégée)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    res.json({
      id: user._id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      address: user.address,
      postalCode: user.postal_code,
      city: user.city,
      isAdmin: user.is_admin || false
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du profil.' });
  }
});

// --- PRODUCTS ROUTES ---

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const rows = await Product.find({});
    const productsList = await Promise.all(rows.map(async (row) => {
      const reviews = await Review.find({ product_id: row._id });
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
      return {
        id: row._id,
        name: row.name,
        price: row.price,
        category: row.category,
        image: row.image,
        images: row.images || [],
        summary: row.summary,
        description: row.description,
        benefits: row.benefits || [],
        usage: row.usage,
        stock: row.stock !== undefined ? row.stock : 50,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length
      };
    }));
    res.json(productsList);
  } catch (err) {
    console.error('Erreur chargement produits :', err.message);
    res.status(500).json({ error: 'Erreur lors du chargement du catalogue.' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const row = await Product.findById(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }
    const reviews = await Review.find({ product_id: row._id });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;



    res.json({
      id: row._id,
      name: row.name,
      price: row.price,
      category: row.category,
      image: row.image,
      images: row.images || [],
      summary: row.summary,
      description: row.description,
      benefits: row.benefits || [],
      usage: row.usage,
      stock: row.stock !== undefined ? row.stock : 50,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length
    });
  } catch (err) {
    console.error('Erreur chargement produit id :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération du produit.' });
  }
});

// --- REVIEWS ROUTES ---

// Get all recent reviews (across all products)
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ created_at: -1 }).limit(10);
    res.json(reviews);
  } catch (err) {
    console.error('Erreur lecture avis récents :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des avis.' });
  }
});

// Get reviews for a product
app.get('/api/products/:productId/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ product_id: req.params.productId }).sort({ created_at: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('Erreur lecture avis :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des avis.' });
  }
});

// Add a review (Authenticated)
app.post('/api/products/:productId/reviews', authenticateToken, upload.single('video'), async (req, res) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;

  if (!rating || !comment) {
    return res.status(400).json({ error: 'Veuillez fournir une note et un commentaire.' });
  }

  const ratingNum = parseInt(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'La note doit être comprise entre 1 et 5.' });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const displayName = `${user.first_name} ${user.last_name.charAt(0).toUpperCase()}.`;
    
    // Si une vidéo a été envoyée, on génère son URL d'accès (Cloudinary)
    const videoUrl = req.file ? req.file.path : null;

    const newReview = new Review({
      product_id: productId,
      user_id: req.userId,
      name: displayName,
      rating: ratingNum,
      comment,
      video_url: videoUrl
    });

    const saved = await newReview.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Erreur enregistrement avis :', err.message);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de votre avis.' });
  }
});

// --- CONTACT ROUTE ---

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }

  const success = await sendContactEmail({ name, email, subject, message });
  if (success) {
    res.status(200).json({ success: true, message: 'Message envoyé avec succès.' });
  } else {
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
  }
});

// --- ORDERS ROUTES ---

// Create Order (Public/Registered)
app.post('/api/orders', async (req, res) => {
  const { orderNumber, userId, firstName, lastName, email, address, postalCode, city, items, subtotal, shipping, total } = req.body;

  if (!orderNumber || !firstName || !lastName || !email || !address || !postalCode || !city || !items || !subtotal || !total) {
    return res.status(400).json({ error: 'Données de commande incomplètes.' });
  }

  try {
    const newOrder = new Order({
      order_number: orderNumber,
      user_id: userId || null,
      first_name: firstName,
      last_name: lastName,
      email,
      address,
      postal_code: postalCode,
      city,
      items,
      subtotal,
      shipping,
      total
    });
    await newOrder.save();

    res.status(201).json({ success: true, orderNumber });
  } catch (err) {
    console.error('Erreur création commande :', err.message);
    res.status(500).json({ error: 'Erreur de base de données lors de la création de la commande.' });
  }
});

// Get user orders (Route protégée)
app.get('/api/orders/user', authenticateToken, async (req, res) => {
  try {
    const rows = await Order.find({ user_id: req.userId }).sort({ created_at: -1 });
    const ordersList = rows.map(row => ({
      id: row._id,
      orderNumber: row.order_number,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      address: row.address,
      postalCode: row.postal_code,
      city: row.city,
      items: row.items || [],
      subtotal: row.subtotal,
      shipping: row.shipping,
      total: row.total,
      status: row.status,
      createdAt: row.created_at
    }));
    res.json(ordersList);
  } catch (err) {
    console.error('Erreur lecture commandes user :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes.' });
  }
});

// --- PAYMENT ROUTES ---

// 1. Create Checkout Session
app.post('/api/payment/create-checkout-session', async (req, res) => {
  const { items, email, firstName, lastName, address, postalCode, city } = req.body;

  if (!items || items.length === 0 || !email) {
    return res.status(400).json({ error: 'Panier ou email manquant.' });
  }

  try {
    const lineItems = [];

    // Récupérer et recalculer le prix réel des produits dans MongoDB
    for (const item of items) {
      const dbProduct = await Product.findById(item.id);
      if (!dbProduct) {
        return res.status(404).json({ error: `Produit ${item.name} non trouvé.` });
      }

      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: dbProduct.name,
            images: dbProduct.image ? [`${process.env.FRONTEND_URL || 'http://localhost:5174'}${dbProduct.image}`] : [],
            description: dbProduct.summary
          },
          unit_amount: Math.round(dbProduct.price * 100), // Stripe attend des centimes
        },
        quantity: item.quantity
      });
    }

    // Calculer les frais de livraison (ex: gratuit dès 60 €)
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = subtotal >= 60 ? 0 : 6.90;

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Frais de livraison',
            description: 'Livraison standard à domicile'
          },
          unit_amount: Math.round(shippingCost * 100)
        },
        quantity: 1
      });
    }

    const orderNumber = `CMD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email,
      allow_promotion_codes: true,
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/?payment=cancel`,
      metadata: {
        orderNumber,
        firstName,
        lastName,
        email,
        address,
        postalCode,
        city,
        subtotal: subtotal.toFixed(2),
        shipping: shippingCost.toFixed(2),
        total: (subtotal + shippingCost).toFixed(2),
        items: JSON.stringify(items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })))
      }
    });

    res.json({ url: session.url, session_id: session.id });
  } catch (err) {
    console.error('Erreur création session Stripe :', err.message);
    res.status(500).json({ error: 'Impossible d\'initialiser le paiement sécurisé.' });
  }
});

// 2. Confirm Order (Verification of Stripe Session)
app.post('/api/payment/confirm-order', async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'ID de session Stripe manquant.' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session de paiement non trouvée.' });
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Le paiement n\'a pas été validé par Stripe.' });
    }

    const orderNumber = session.metadata.orderNumber;
    const existingOrder = await Order.findOne({ order_number: orderNumber });
    if (existingOrder) {
      return res.json({ success: true, orderNumber, alreadyProcessed: true });
    }

    const { firstName, lastName, email, address, postalCode, city, subtotal, shipping, total, items } = session.metadata;

    const user = await User.findOne({ email });
    const userId = user ? user._id : null;

    const newOrder = new Order({
      order_number: orderNumber,
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      email,
      address,
      postal_code: postalCode,
      city,
      items: JSON.parse(items),
      subtotal: parseFloat(subtotal),
      shipping: parseFloat(shipping),
      total: parseFloat(total),
      status: 'En préparation'
    });

    await newOrder.save();
    
    // Notification email to admin
    await sendOrderNotificationEmail({
      orderId: orderNumber,
      user: { firstName, lastName, email },
      items: JSON.parse(items),
      totalAmount: parseFloat(total),
      shippingAddress: { fullName: `${firstName} ${lastName}`, address, postalCode, city, country: 'France', phone: '' }
    });

    console.log(`✅ Commande confirmée et enregistrée : ${orderNumber}`);

    // Décrémenter le stock des produits achetés dans MongoDB
    const parsedItems = JSON.parse(items);
    for (const item of parsedItems) {
      try {
        await Product.findByIdAndUpdate(
          item.id,
          { $inc: { stock: -item.quantity } }
        );
        console.log(`Stock mis à jour pour ${item.name} (quantité déduite : ${item.quantity})`);
      } catch (stockErr) {
        console.error(`Erreur mise à jour stock pour le produit ${item.id} :`, stockErr.message);
      }
    }

    // Envoi de l'e-mail de confirmation en arrière-plan
    sendOrderConfirmationEmail(newOrder);
    sendAdminNotificationEmail(newOrder);

    res.status(201).json({ success: true, orderNumber });
  } catch (err) {
    console.error('Erreur confirmation commande Stripe :', err.message);
    res.status(500).json({ error: 'Erreur lors de la validation finale de la commande.' });
  }
});

// --- ADMIN ROUTES ---

const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.is_admin) {
      return res.status(403).json({ error: 'Accès interdit. Réservé aux administrateurs.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la vérification des droits admin.' });
  }
};

// GET all orders for admin
app.get('/api/admin/orders', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ created_at: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Erreur lecture commandes admin :', err.message);
    res.status(500).json({ error: 'Erreur lors du chargement de toutes les commandes.' });
  }
});

// Update order status
app.put('/api/admin/orders/:id/status', authenticateToken, verifyAdmin, async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Statut manquant.' });
  }
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }
    res.json(order);
  } catch (err) {
    console.error('Erreur mise à jour statut commande :', err.message);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut.' });
  }
});

// Create product (Admin)
app.post('/api/admin/products', authenticateToken, verifyAdmin, upload.single('imageFile'), async (req, res) => {
  const { id, name, price, category, image, images, summary, description, benefits, usage, stock } = req.body;

  let parsedBenefits = benefits;
  let parsedImages = images;
  try { if (typeof benefits === 'string') parsedBenefits = JSON.parse(benefits); } catch(e) { parsedBenefits = []; }
  try { if (typeof images === 'string') parsedImages = JSON.parse(images); } catch(e) { parsedImages = []; }

  if (!name || !price || !category || !summary || !description || !usage) {
    return res.status(400).json({ error: 'Champs obligatoires manquants.' });
  }

  // Slugify name if no id is provided
  const productId = id || name.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

  try {
    // Check if product with this ID already exists
    const existing = await Product.findById(productId);
    if (existing) {
      return res.status(400).json({ error: 'Un produit avec cet identifiant existe déjà.' });
    }

    // Check if an image was uploaded via Cloudinary
    let finalImageUrl = image || '';
    if (req.file) {
      finalImageUrl = req.file.path;
    }

    const newProduct = new Product({
      _id: productId,
      name,
      price: parseFloat(price),
      category,
      image: finalImageUrl,
      images: parsedImages || [],
      summary,
      description,
      benefits: parsedBenefits || [],
      usage,
      stock: stock !== undefined ? parseInt(stock) : 50
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Erreur création produit :', err.message);
    res.status(500).json({ error: 'Erreur lors de la création du produit.' });
  }
});

// Update product (Admin)
app.put('/api/admin/products/:id', authenticateToken, verifyAdmin, upload.single('imageFile'), async (req, res) => {
  const { name, price, category, image, images, summary, description, benefits, usage, stock } = req.body;

  try {
    let parsedBenefits = benefits;
    let parsedImages = images;
    try { if (typeof benefits === 'string') parsedBenefits = JSON.parse(benefits); } catch(e) {}
    try { if (typeof images === 'string') parsedImages = JSON.parse(images); } catch(e) {}

    let finalImageUrl = image;
    if (req.file) {
      finalImageUrl = req.file.path;
    }

    const updateData = {
      name,
      price: price !== undefined ? parseFloat(price) : undefined,
      category,
      images: parsedImages,
      summary,
      description,
      benefits: parsedBenefits,
      usage,
      stock: stock !== undefined ? parseInt(stock) : undefined
    };

    if (finalImageUrl !== undefined && finalImageUrl !== '') {
      updateData.image = finalImageUrl;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }

    res.json(updatedProduct);
  } catch (err) {
    console.error('Erreur mise à jour produit :', err.message);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit.' });
  }
});

// Delete product (Admin)
app.delete('/api/admin/products/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }
    res.json({ success: true, message: 'Produit supprimé avec succès.' });
  } catch (err) {
    console.error('Erreur suppression produit :', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression du produit.' });
  }
});

// --- SETTINGS ROUTES ---

// GET /api/settings/shipping (Public)
app.get('/api/settings/shipping', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'shipping' });
    if (setting && setting.value) {
      res.json(setting.value);
    } else {
      res.json({ threshold: 60, cost: 6.90 }); // Default values
    }
  } catch (err) {
    console.error('Erreur lecture paramètres de livraison:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT /api/admin/settings/shipping (Admin)
app.put('/api/admin/settings/shipping', authenticateToken, verifyAdmin, async (req, res) => {
  const { threshold, cost } = req.body;
  if (threshold === undefined || cost === undefined) {
    return res.status(400).json({ error: 'Données manquantes (threshold, cost).' });
  }
  
  try {
    const value = { threshold: Number(threshold), cost: Number(cost) };
    const updatedSetting = await Setting.findOneAndUpdate(
      { key: 'shipping' },
      { key: 'shipping', value },
      { upsert: true, new: true }
    );
    res.json({ success: true, setting: updatedSetting.value });
  } catch (err) {
    console.error('Erreur mise à jour paramètres de livraison:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Start initialization
const startServer = async () => {
  try {
    await connectDatabase();
    await seedProducts();
    
    app.listen(PORT, () => {
      console.log(`Le serveur tourne sur http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Erreur au démarrage du serveur Express :', err.message);
  }
};

startServer();
