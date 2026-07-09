import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDatabase, User, Product, Order, Review, Setting, Newsletter } from './database.js';
import { seedProducts } from './seed.js';
import Stripe from 'stripe';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import dns from 'dns';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { sendContactEmail, sendOrderNotificationEmail, sendCustomerOrderConfirmationEmail, sendShippingConfirmationEmail, sendEmail } from './utils/email.js';
import { sendAdminOrderSMS } from './utils/sms.js';

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
  const { firstName, lastName, email, password, address, postalCode, city, phone } = req.body;

  if (!firstName || !lastName || !email || !password || !address || !postalCode || !city || !phone) {
    return res.status(400).json({ error: 'Veuillez remplir tous les champs (le téléphone est requis pour la livraison).' });
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
      city,
      phone
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
        phone: result.phone || '',
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
        phone: user.phone || '',
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
      phone: user.phone || '',
      isAdmin: user.is_admin || false,
      allowTestPayment: user.allow_test_payment || false
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du profil.' });
  }
});

// Update User Profile Details
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  const { firstName, lastName, phone, address, postalCode, city } = req.body;
  
  if (!firstName || !lastName || !address || !postalCode || !city) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis.' });
  }
  
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    
    user.first_name = firstName;
    user.last_name = lastName;
    user.phone = phone || '';
    user.address = address;
    user.postal_code = postalCode;
    user.city = city;
    
    await user.save();
    
    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        address: user.address,
        postalCode: user.postal_code,
        city: user.city,
        phone: user.phone,
        isAdmin: user.is_admin || false,
        allowTestPayment: user.allow_test_payment || false
      }
    });
  } catch (err) {
    console.error("Erreur mise à jour profil:", err.message);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil.' });
  }
});

// Change Password
app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Veuillez remplir tous les champs.' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit faire au moins 6 caractères.' });
  }
  
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    
    const matches = await bcrypt.compare(oldPassword, user.password);
    if (!matches) {
      return res.status(400).json({ error: 'L\'ancien mot de passe est incorrect.' });
    }
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({ success: true, message: 'Mot de passe mis à jour avec succès.' });
  } catch (err) {
    console.error("Erreur modification mot de passe:", err.message);
    res.status(500).json({ error: 'Erreur lors de la modification du mot de passe.' });
  }
});

// Delete Account (GDPR Compliance / Droit à l'oubli)
app.delete('/api/auth/delete-account', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    
    // Supprimer l'utilisateur de la base de données
    await User.findByIdAndDelete(req.userId);
    
    // Anonymiser les commandes associées pour la comptabilité
    await Order.updateMany(
      { user_id: req.userId },
      { 
        $unset: { user_id: "" }, 
        $set: { 
          first_name: "Client", 
          last_name: "Supprimé (RGPD)", 
          email: "anonymous@dynaceglobalesante.com",
          phone: "",
          address: "Adresse Supprimée",
          postal_code: "00000",
          city: "Ville Supprimée"
        } 
      }
    );
    
    res.json({ success: true, message: 'Votre compte a été supprimé avec succès.' });
  } catch (err) {
    console.error("Erreur suppression compte:", err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression de votre compte.' });
  }
});

// Forgot Password Request
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Veuillez renseigner votre email.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: 'Si cette adresse existe, un email de réinitialisation a été envoyé.' });
    }

    // Generate random hex token
    const token = crypto.randomBytes(20).toString('hex');
    user.reset_password_token = token;
    user.reset_password_expires = Date.now() + 3600000; // 1 Hour from now
    await user.save();

    // Send reset email
    const resetUrl = `https://xn--dynaceglobalesant-top-r5b.com/?tab=reset-password&token=${token}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #10b981; text-align: center;">Réinitialisation de votre mot de passe</h2>
        <p>Bonjour ${user.first_name},</p>
        <p>Vous avez demandé la réinitialisation du mot de passe de votre compte sur <strong>Dynace Global Santé Top</strong>.</p>
        <p>Veuillez cliquer sur le bouton ci-dessous pour définir un nouveau mot de passe (ce lien est valable pendant 1 heure) :</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Réinitialiser mon mot de passe</a>
        </div>
        <p style="font-size: 0.85rem; color: #666;">Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien suivant dans votre navigateur :</p>
        <p style="font-size: 0.85rem; color: #10b981; word-break: break-all;">${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 0.8rem; color: #999; text-align: center;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail en toute sécurité.</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe - Dynace Global',
      html: emailHtml
    });

    res.json({ success: true, message: 'Si cette adresse existe, un email de réinitialisation a été envoyé.' });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ error: 'Erreur lors de la demande de réinitialisation.' });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Données manquantes (jeton ou mot de passe).' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères.' });
  }

  try {
    const user = await User.findOne({
      reset_password_token: token,
      reset_password_expires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Le jeton de réinitialisation est invalide ou a expiré.' });
    }

    // Set new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;
    await user.save();

    res.json({ success: true, message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.' });
  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).json({ error: 'Erreur lors de la réinitialisation du mot de passe.' });
  }
});

// Google Sign-In Verification
app.post('/api/auth/google', async (req, res) => {
  const { credential, accessToken } = req.body;
  if (!credential && !accessToken) {
    return res.status(400).json({ error: 'Jeton Google manquant.' });
  }

  try {
    let payload;
    if (credential) {
      const googleVerifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (!googleVerifyRes.ok) {
        return res.status(400).json({ error: 'Le jeton de connexion Google est invalide.' });
      }
      payload = await googleVerifyRes.json();
    } else {
      const googleUserinfoRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      if (!googleUserinfoRes.ok) {
        return res.status(400).json({ error: 'Le jeton d’accès Google est invalide.' });
      }
      payload = await googleUserinfoRes.json();
    }
    
    // Normalise fields between tokeninfo and userinfo
    const emailVerified = payload.email_verified === 'true' || payload.email_verified === true || payload.verified_email === true;
    if (!emailVerified) {
      return res.status(400).json({ error: 'Votre adresse e-mail Google n’est pas vérifiée.' });
    }

    const email = payload.email.toLowerCase();
    const firstName = payload.given_name || payload.first_name || 'Utilisateur';
    const lastName = payload.family_name || payload.last_name || 'Google';

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        first_name: firstName,
        last_name: lastName,
        email,
        password: '',
        address: '',
        postal_code: '',
        city: '',
        phone: ''
      });
      await user.save();
      console.log(`Nouvel utilisateur enregistré via Google : ${email}`);
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        address: user.address || '',
        postalCode: user.postal_code || '',
        city: user.city || '',
        phone: user.phone || '',
        isAdmin: user.is_admin || false
      }
    });
  } catch (err) {
    console.error("Google sign-in server error:", err.message);
    res.status(500).json({ error: 'Erreur interne lors de la connexion Google.' });
  }
});

// --- PRODUCTS ROUTES ---

let productsCache = null;
let productsCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Helper to clear products cache
const clearProductsCache = () => {
  productsCache = null;
  productsCacheTime = 0;
};

// Get all products
app.get('/api/products', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  
  const now = Date.now();
  if (productsCache && (now - productsCacheTime < CACHE_DURATION)) {
    return res.json(productsCache);
  }

  try {
    const rows = await Product.find({});
    
    // Fetch all reviews for these products in a single database query to avoid N+1 queries
    const productIds = rows.map(r => r._id);
    const allReviews = await Review.find({ product_id: { $in: productIds } });
    
    // Group reviews by product_id
    const reviewsByProduct = {};
    productIds.forEach(id => {
      reviewsByProduct[id] = [];
    });
    allReviews.forEach(review => {
      if (reviewsByProduct[review.product_id]) {
        reviewsByProduct[review.product_id].push(review);
      }
    });

    const productsList = rows.map(row => {
      const reviews = reviewsByProduct[row._id] || [];
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
    });
    
    // Save to cache
    productsCache = productsList;
    productsCacheTime = Date.now();
    
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

// Get all reviews
app.get('/api/reviews', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
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
    clearProductsCache(); // Clear RAM cache
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

  // Send email in background to prevent hanging
  sendContactEmail({ name, email, subject, message }).catch(err => {
    console.error("Erreur lors de l'envoi de l'email de contact:", err.message);
  });

  res.status(200).json({ success: true, message: 'Message envoyé avec succès.' });
});

app.get('/api/test-email-error', async (req, res) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (!user || !pass) {
    return res.status(400).json({ 
      error: "Missing EMAIL_USER or EMAIL_PASS in process.env", 
      envKeys: Object.keys(process.env).filter(k => k.includes('EMAIL') || k.includes('SMTP') || k.includes('PASS'))
    });
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const emailSent = await sendEmail({
        to: user || 'johansonzoda@gmail.com',
        subject: 'Dynace Test Resend Email',
        html: '<p>Si vous recevez ce message, Resend est configuré correctement !</p>'
      });
      if (!emailSent) {
        return res.status(500).json({ success: false, error: 'Failed to send email via Resend helper' });
      }
      return res.json({ success: true, provider: 'resend', emailUser: user });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message, provider: 'resend' });
    }
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    family: 4,
    lookup: (hostname, options, callback) => {
      dns.lookup(hostname, { family: 4 }, callback);
    },
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });

  const mailOptions = {
    from: user,
    to: user,
    subject: 'Dynace Test Route Email',
    text: 'Test message.'
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.json({ success: true, provider: 'smtp', messageId: info.messageId, emailUser: user });
  } catch (err) {
    res.status(500).json({
      success: false,
      provider: 'smtp',
      error: err.message,
      code: err.code,
      response: err.response,
      emailUser: user
    });
  }
});

// --- NEWSLETTER ROUTE ---

app.post('/api/newsletter/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'L\'adresse e-mail est obligatoire.' });
  }

  try {
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(200).json({ success: true, message: 'Déjà inscrit !' });
    }
    const newSubscription = new Newsletter({ email });
    await newSubscription.save();
    res.status(200).json({ success: true, message: 'Inscription validée.' });
  } catch (err) {
    console.error('Erreur inscription newsletter :', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription.' });
  }
});


// --- ORDERS ROUTES ---

// Get user orders (Route protégée)
app.get('/api/orders/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });

    const rows = await Order.find({ 
      $or: [
        { user_id: req.userId },
        { email: user.email }
      ]
    }).sort({ created_at: -1 });
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
      trackingNumber: row.tracking_number || '',
      createdAt: row.created_at
    }));
    res.json(ordersList);
  } catch (err) {
    console.error('Erreur lecture commandes user :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes.' });
  }
});

// Track Order Public Endpoint
app.get('/api/orders/track/:orderNumber', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Adresse e-mail requise pour le suivi.' });
  }

  try {
    const order = await Order.findOne({ order_number: req.params.orderNumber });
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }

    if (order.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ error: 'L\'adresse e-mail ne correspond pas à cette commande.' });
    }

    res.json({
      order_number: order.order_number,
      status: order.status,
      createdAt: order.created_at,
      total: order.total,
      email: order.email,
      first_name: order.first_name,
      last_name: order.last_name,
      address: order.address,
      postal_code: order.postal_code,
      city: order.city,
      tracking_number: order.tracking_number || ''
    });
  } catch (err) {
    console.error('Erreur suivi commande :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération du suivi.' });
  }
});

// Printable Packing Slip (Bordereau de livraison / Fiche d'expédition) HTML endpoint
app.get('/api/orders/packing-slip/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ order_number: req.params.orderNumber });
    if (!order) {
      return res.status(404).send('<h1>Commande non trouvée</h1>');
    }

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; font-weight: 500;">${item.name}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 14px;">x${item.quantity}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 14px; font-weight: 600;">${item.price.toFixed(2)} €</td>
      </tr>
    `).join('');

    res.send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Fiche d'Expédition - #${order.order_number}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; background-color: #f8fafc; }
          .container { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 12px; background-color: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          
          .header { text-align: center; border-bottom: 3px solid #153A89; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #153A89; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; }
          .header p { color: #64748b; margin: 5px 0 0 0; font-size: 14px; font-weight: 500; }
          
          .grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .col { width: 48%; }
          .col-title { font-size: 12px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 8px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px; letter-spacing: 0.5px; }
          .col-content { font-size: 15px; line-height: 1.6; color: #334155; }
          
          .label-box { border: 3px dashed #153A89; border-radius: 12px; padding: 25px; margin: 30px 0; background-color: #fafbff; position: relative; }
          .label-box-title { position: absolute; top: -12px; left: 20px; background-color: #153A89; color: #fff; padding: 3px 12px; font-size: 11px; font-weight: 800; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
          .label-grid { display: flex; justify-content: space-between; }
          .label-col { width: 48%; }
          
          .order-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
          .order-table th { background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 12px 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
          .order-table td { padding: 12px 10px; }
          
          .print-btn-container { text-align: center; margin-bottom: 25px; }
          .btn-print { background-color: #10b981; color: #fff; border: none; padding: 14px 28px; font-size: 15px; font-weight: 700; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; box-shadow: 0 4px 6px -1px rgba(16,185,129,0.2); transition: all 0.2s; }
          .btn-print:hover { background-color: #059669; transform: translateY(-1px); }
          
          @media print {
            .print-btn-container { display: none; }
            body { margin: 0; padding: 0; background-color: #fff; }
            .container { border: none; box-shadow: none; padding: 0; max-width: 100%; }
            .label-box { border: 3px dashed #000; background-color: #fff; }
          }
        </style>
      </head>
      <body>
        <div class="print-btn-container">
          <button onclick="window.print()" class="btn-print">🖨️ Imprimer la Fiche d'Expédition / Enregistrer en PDF</button>
        </div>
        <div class="container">
          <div class="header">
            <h1>DYNACE GLOBAL</h1>
            <p>Bordereau de livraison & Fiche d'expédition</p>
          </div>
          
          <div class="grid">
            <div class="col">
              <div class="col-title">Informations de la Commande</div>
              <div class="col-content">
                <strong>N° de Commande :</strong> <span style="font-family: monospace; font-size: 16px; font-weight: 700; color: #153A89;">${order.order_number}</span><br>
                <strong>Date de commande :</strong> ${new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}<br>
                <strong>Statut du paiement :</strong> Payé (Stripe)<br>
                <strong>Montant total payé :</strong> ${order.total.toFixed(2)} €
              </div>
            </div>
            <div class="col">
              <div class="col-title">Contact Destinataire</div>
              <div class="col-content">
                <strong>Client :</strong> ${order.first_name} ${order.last_name}<br>
                <strong>Email :</strong> ${order.email}<br>
                <strong>Téléphone :</strong> ${order.phone || 'Non renseigné'}<br>
              </div>
            </div>
          </div>
          
          <div class="label-box">
            <div class="label-box-title">Étiquette Colis (À découper et coller sur le carton)</div>
            <div class="label-grid">
              <div class="label-col">
                <div class="col-title">Expéditeur</div>
                <div class="col-content" style="font-size: 13px;">
                  <strong>DYNACE GLOBAL</strong><br>
                  (Votre adresse d'expédition)<br>
                  France
                </div>
              </div>
              <div class="label-col" style="border-left: 2px solid #e2e8f0; padding-left: 20px;">
                <div class="col-title">Destinataire</div>
                <div class="col-content" style="font-size: 16px; font-weight: 700; color: #1e293b;">
                  ${order.first_name} ${order.last_name}<br>
                  <span style="font-weight: 500; font-size: 14px; color: #475569;">
                    ${order.address}<br>
                    ${order.postal_code} ${order.city}<br>
                    France<br>
                    ${order.phone ? `Tél : ${order.phone}` : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-title" style="margin-top: 40px;">Détail des Produits Inclus dans le Colis</div>
          <table class="order-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th style="text-align: center; width: 80px;">Quantité</th>
                <th style="text-align: right; width: 120px;">Prix Unitaire</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td colspan="2" style="text-align: right; font-weight: 600; border-top: 2px solid #e2e8f0; padding-top: 15px; color: #64748b;">Sous-total :</td>
                <td style="text-align: right; font-weight: 600; border-top: 2px solid #e2e8f0; padding-top: 15px; color: #334155;">${order.subtotal.toFixed(2)} €</td>
              </tr>
              <tr>
                <td colspan="2" style="text-align: right; color: #64748b; padding: 5px 10px;">Frais de livraison :</td>
                <td style="text-align: right; color: #64748b; padding: 5px 10px;">${order.shipping === 0 ? 'Gratuit' : `${order.shipping.toFixed(2)} €`}</td>
              </tr>
              <tr>
                <td colspan="2" style="text-align: right; font-size: 18px; font-weight: 800; color: #153A89; padding: 12px 10px 0 10px;">Montant total :</td>
                <td style="text-align: right; font-size: 18px; font-weight: 800; color: #153A89; padding: 12px 10px 0 10px;">${order.total.toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Erreur génération fiche expédition :', err.message);
    res.status(500).send('<h1>Erreur lors de la génération de la fiche d\'expédition</h1>');
  }
});

// --- COUNTRY & SHIPPING CONFIGURATIONS ---
const COUNTRY_CONFIGS = {
  FR: { name: 'France (Métropolitaine)', shippingCost: 6.90, freeThreshold: 60, status: 'allowed' },
  BE: { name: 'Belgique', shippingCost: 12.90, freeThreshold: 120, status: 'allowed' },
  CH: { name: 'Suisse', shippingCost: 12.90, freeThreshold: 120, status: 'allowed' },
  LU: { name: 'Luxembourg', shippingCost: 12.90, freeThreshold: 120, status: 'allowed' },
  DE: { name: 'Allemagne', shippingCost: 12.90, freeThreshold: 120, status: 'allowed' },
  ES: { name: 'Espagne', shippingCost: 12.90, freeThreshold: 120, status: 'allowed' },
  IT: { name: 'Italie', shippingCost: 12.90, freeThreshold: 120, status: 'allowed' },
  PT: { name: 'Portugal', shippingCost: 12.90, freeThreshold: 120, status: 'allowed' },
  NL: { name: 'Pays-Bas', shippingCost: 12.90, freeThreshold: 120, status: 'allowed' },
  
  SN: { name: 'Sénégal', shippingCost: 24.90, freeThreshold: 200, status: 'allowed' },
  CI: { name: 'Côte d’Ivoire', shippingCost: 24.90, freeThreshold: 200, status: 'allowed' },
  CM: { name: 'Cameroun', shippingCost: 24.90, freeThreshold: 200, status: 'allowed' },
  GA: { name: 'Gabon', shippingCost: 24.90, freeThreshold: 200, status: 'allowed' },
  CG: { name: 'Congo', shippingCost: 24.90, freeThreshold: 200, status: 'allowed' },
  BJ: { name: 'Bénin', shippingCost: 24.90, freeThreshold: 200, status: 'allowed' },
  TG: { name: 'Togo', shippingCost: 24.90, freeThreshold: 200, status: 'allowed' },
  ML: { name: 'Mali', shippingCost: 24.90, freeThreshold: 200, status: 'allowed' },
  GN: { name: 'Guinée', shippingCost: 24.90, freeThreshold: 200, status: 'allowed' },
  
  US: { name: 'États-Unis', status: 'blocked', reason: 'Les réglementations douanières et sanitaires américaines (FDA) bloquent actuellement l’importation de compléments alimentaires Dynace par des particuliers.' },
  CA: { name: 'Canada', status: 'blocked', reason: 'Les douanes canadiennes bloquent actuellement les livraisons de compléments alimentaires Dynace Global.' },
  
  WORLD: { name: 'Reste du monde', shippingCost: 24.90, freeThreshold: 200, status: 'allowed' }
};

// --- PAYMENT ROUTES ---

// 1. Create Checkout Session
app.post('/api/payment/create-checkout-session', async (req, res) => {
  const { items, email, firstName, lastName, phone, address, postalCode, city, country } = req.body;

  if (!items || items.length === 0 || !email) {
    return res.status(400).json({ error: 'Panier ou email manquant.' });
  }

  const selectedCountry = country || 'FR';
  const config = COUNTRY_CONFIGS[selectedCountry] || COUNTRY_CONFIGS.WORLD;

  if (config.status === 'blocked') {
    return res.status(400).json({ error: config.reason || 'Livraison impossible vers ce pays.' });
  }

  try {
    const lineItems = [];
    let backendSubtotal = 0;

    // Récupérer et recalculer le prix réel des produits dans MongoDB
    for (const item of items) {
      const dbProduct = await Product.findById(item.id);
      if (!dbProduct) {
        return res.status(404).json({ error: `Produit ${item.name || item.id} non trouvé.` });
      }

      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({ error: `Stock insuffisant pour ${dbProduct.name}. (En stock: ${dbProduct.stock})` });
      }

      const itemTotal = dbProduct.price * item.quantity;
      backendSubtotal += itemTotal;

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

    // Récupérer les paramètres de livraison (par défaut du pays ou DB pour la France)
    let threshold = config.freeThreshold;
    let cost = config.shippingCost;
    if (selectedCountry === 'FR') {
      const shippingSetting = await Setting.findOne({ key: 'shipping' });
      if (shippingSetting && shippingSetting.value) {
        threshold = shippingSetting.value.threshold;
        cost = shippingSetting.value.cost;
      }
    }

    // Calculer les frais de livraison avec le sous-total du backend
    const shippingCost = backendSubtotal >= threshold ? 0 : cost;

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Frais de livraison',
            description: `Livraison Colissimo/Chronopost (${config.name})`
          },
          unit_amount: Math.round(shippingCost * 100)
        },
        quantity: 1
      });
    }

    const orderNumber = `CMD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      phone_number_collection: { enabled: true },
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
        phone: phone || '',
        address,
        postalCode,
        city,
        country: config.name,
        countryCode: selectedCountry,
        subtotal: backendSubtotal.toFixed(2),
        shipping: shippingCost.toFixed(2),
        total: (backendSubtotal + shippingCost).toFixed(2),
        items: JSON.stringify(items.map(i => ({ id: i.id, quantity: i.quantity }))) // Ne pas stocker le prix frontend
      }
    });

    res.json({ url: session.url, session_id: session.id });
  } catch (err) {
    console.error('Erreur création session Stripe :', err.message);
    res.status(500).json({ error: err.message || 'Impossible d\'initialiser le paiement sécurisé.' });
  }
});

// Create Test Order (Bypass Stripe for authorized test users)
app.post('/api/payment/create-test-order', authenticateToken, async (req, res) => {
  const { items, email, firstName, lastName, phone, address, postalCode, city, country } = req.body;

  if (!items || items.length === 0 || !email) {
    return res.status(400).json({ error: 'Panier ou email manquant.' });
  }

  const selectedCountry = country || 'FR';
  const config = COUNTRY_CONFIGS[selectedCountry] || COUNTRY_CONFIGS.WORLD;

  if (config.status === 'blocked') {
    return res.status(400).json({ error: config.reason || 'Livraison impossible vers ce pays.' });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user || !user.allow_test_payment) {
      return res.status(403).json({ error: "Vous n'êtes pas autorisé à utiliser le paiement de test." });
    }

    let backendSubtotal = 0;
    const finalItems = [];

    for (const item of items) {
      const dbProduct = await Product.findById(item.id);
      if (!dbProduct) {
        return res.status(404).json({ error: `Produit ${item.name || item.id} non trouvé.` });
      }

      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({ error: `Stock insuffisant pour ${dbProduct.name}. (En stock: ${dbProduct.stock})` });
      }

      backendSubtotal += dbProduct.price * item.quantity;
      finalItems.push({
        id: dbProduct._id,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: item.quantity
      });
    }

    // Récupérer les paramètres de livraison (par défaut du pays ou DB pour la France)
    let threshold = config.freeThreshold;
    let cost = config.shippingCost;
    if (selectedCountry === 'FR') {
      const shippingSetting = await Setting.findOne({ key: 'shipping' });
      if (shippingSetting && shippingSetting.value) {
        threshold = shippingSetting.value.threshold;
        cost = shippingSetting.value.cost;
      }
    }

    const shippingCost = backendSubtotal >= threshold ? 0 : cost;
    const totalAmount = backendSubtotal + shippingCost;
    const orderNumber = `TEST-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = new Order({
      order_number: orderNumber,
      user_id: user._id,
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      address,
      postal_code: postalCode,
      city,
      country: config.name,
      items: finalItems,
      subtotal: backendSubtotal,
      shipping: shippingCost,
      total: totalAmount,
      status: 'Payé'
    });

    await newOrder.save();

    for (const item of finalItems) {
      try {
        await Product.findByIdAndUpdate(item.id, { $inc: { stock: -item.quantity } });
      } catch (err) {
        console.error(`Erreur mise à jour stock test pour ${item.id} :`, err.message);
      }
    }

    // Send emails in background to prevent request hanging due to SMTP port blocks
    sendOrderNotificationEmail({
      orderId: orderNumber,
      user: { firstName, lastName, email: user.email },
      items: finalItems,
      totalAmount,
      shippingAddress: { fullName: `${firstName} ${lastName}`, address, postalCode, city, country: config.name, phone: phone || '' }
    }).catch(err => console.error("Admin order notification email error:", err.message));

    sendCustomerOrderConfirmationEmail(newOrder).catch(err => console.error("Customer order confirmation email error:", err.message));
    sendAdminOrderSMS(newOrder).catch(err => console.error("Admin order SMS notification error:", err.message));

    res.status(201).json({ success: true, orderNumber });
  } catch (err) {
    console.error('Erreur creation commande test :', err.message);
    res.status(500).json({ error: 'Erreur lors de la création de la commande de test.' });
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

    const { firstName, lastName, email, address, postalCode, city, country, subtotal, shipping, total, items } = session.metadata;
    const phone = session.customer_details?.phone || session.metadata.phone || '';

    const user = await User.findOne({ email });
    const userId = user ? user._id : null;

    const newOrder = new Order({
      order_number: orderNumber,
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || '',
      address,
      postal_code: postalCode,
      city,
      country: country || 'France',
      items: JSON.parse(items),
      subtotal: parseFloat(subtotal),
      shipping: parseFloat(shipping),
      total: parseFloat(total),
      status: 'Payé'
    });

    await newOrder.save();
    
    // Notification email to admin
    // Send emails in background to prevent request hanging due to SMTP port blocks
    sendOrderNotificationEmail({
      orderId: orderNumber,
      user: { firstName, lastName, email },
      items: JSON.parse(items),
      totalAmount: parseFloat(total),
      shippingAddress: { fullName: `${firstName} ${lastName}`, address, postalCode, city, country: country || 'France', phone: phone || '' }
    }).catch(err => console.error("Admin order notification email error:", err.message));

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

    // Envoi de l'e-mail de confirmation au client
    sendCustomerOrderConfirmationEmail(newOrder).catch(err => console.error("Customer order confirmation email error:", err.message));
    sendAdminOrderSMS(newOrder).catch(err => console.error("Admin order SMS notification error:", err.message));

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
    const showArchived = req.query.showArchived === 'true';
    const query = showArchived ? {} : { is_archived: { $ne: true } };
    const orders = await Order.find(query).sort({ created_at: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Erreur lecture commandes admin :', err.message);
    res.status(500).json({ error: 'Erreur lors du chargement de toutes les commandes.' });
  }
});

// Batch archive orders
app.put('/api/admin/orders/batch-archive', authenticateToken, verifyAdmin, async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Liste d\'identifiants invalide.' });
  }
  try {
    await Order.updateMany(
      { _id: { $in: ids } },
      { $set: { is_archived: true } }
    );
    res.json({ success: true, message: `${ids.length} commandes masquées avec succès.` });
  } catch (err) {
    console.error('Erreur masquage lot commandes :', err.message);
    res.status(500).json({ error: 'Erreur lors du masquage des commandes.' });
  }
});

// Batch delete orders
app.post('/api/admin/orders/batch-delete', authenticateToken, verifyAdmin, async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Liste d\'identifiants invalide.' });
  }
  try {
    await Order.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: `${ids.length} commandes supprimées avec succès.` });
  } catch (err) {
    console.error('Erreur suppression lot commandes :', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression des commandes.' });
  }
});

// Update order status
app.put('/api/admin/orders/:id/status', authenticateToken, verifyAdmin, async (req, res) => {
  const { status, trackingNumber } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Statut manquant.' });
  }
  try {
    const updateData = { status };
    if (trackingNumber !== undefined) {
      updateData.tracking_number = trackingNumber;
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' });
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }

    // Si le statut passe à "Expédié", envoyer l'e-mail d'expédition au client
    if (status === 'Expédié') {
      const trackingNo = trackingNumber || order.tracking_number || '';
      await sendShippingConfirmationEmail(order, trackingNo);
    }

    res.json(order);
  } catch (err) {
    console.error('Erreur mise à jour statut commande :', err.message);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut.' });
  }
});

// DELETE order
app.delete('/api/admin/orders/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée.' });
    }
    res.json({ success: true, message: 'Commande supprimée avec succès.' });
  } catch (err) {
    console.error('Erreur suppression commande admin :', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression de la commande.' });
  }
});

// GET all registered users for admin (excluding passwords)
app.get('/api/admin/users', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ first_name: 1 });
    res.json(users);
  } catch (err) {
    console.error('Erreur lecture utilisateurs admin :', err.message);
    res.status(500).json({ error: 'Erreur lors du chargement des utilisateurs.' });
  }
});

// Toggle allow_test_payment permission for a user
app.put('/api/admin/users/:id/toggle-test-payment', authenticateToken, verifyAdmin, async (req, res) => {
  const { allowTestPayment } = req.body;
  if (allowTestPayment === undefined) {
    return res.status(400).json({ error: 'Statut de permission manquant.' });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { allow_test_payment: allowTestPayment },
      { returnDocument: 'after' }
    );
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('Erreur bascule permission test admin :', err.message);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des permissions.' });
  }
});

// DELETE user (Admin)
app.delete('/api/admin/users/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte administrateur.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    console.log(`Utilisateur supprimé par l'admin (${req.userId}) : ${user.email}`);
    res.json({ success: true, message: 'Utilisateur supprimé avec succès.' });
  } catch (err) {
    console.error('Erreur suppression utilisateur admin :', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur.' });
  }
});

// GET all reviews (Admin)
app.get('/api/admin/reviews', authenticateToken, verifyAdmin, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  try {
    const reviews = await Review.find({}).sort({ created_at: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('Erreur lecture tous avis admin :', err.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des avis.' });
  }
});

// DELETE review (Admin)
app.delete('/api/admin/reviews/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) {
      return res.status(404).json({ error: 'Avis non trouvé.' });
    }
    res.json({ success: true, message: 'Avis supprimé avec succès.' });
  } catch (err) {
    console.error('Erreur suppression avis admin :', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'avis.' });
  }
});

// DELETE review video only (Admin)
app.delete('/api/admin/reviews/:id/video', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Avis non trouvé.' });
    }
    review.video_url = null;
    await review.save();
    res.json({ success: true, message: 'Vidéo de l\'avis retirée avec succès.', review });
  } catch (err) {
    console.error('Erreur suppression vidéo avis admin :', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression de la vidéo.' });
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
    clearProductsCache(); // Clear RAM cache
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
      { returnDocument: 'after' }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }

    clearProductsCache(); // Clear RAM cache
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
    clearProductsCache(); // Clear RAM cache
    res.json({ success: true, message: 'Produit supprimé avec succès.' });
  } catch (err) {
    console.error('Erreur suppression produit :', err.message);
    res.status(500).json({ error: 'Erreur lors de la suppression du produit.' });
  }
});

// --- SETTINGS ROUTES ---

// GET /api/settings/shipping (Public)
app.get('/api/settings/shipping', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  try {
    const setting = await Setting.findOne({ key: 'shipping' });
    if (setting && setting.value) {
      res.json({ threshold: 999999, cost: setting.value.cost || 10.50 });
    } else {
      res.json({ threshold: 999999, cost: 10.50 }); // Default values
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
      { upsert: true, returnDocument: 'after' }
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
