import mongoose from 'mongoose';

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("⚠️ Erreur : La variable MONGODB_URI n'est pas définie dans le fichier .env.");
  }
  try {
    await mongoose.connect(mongoUri || "mongodb://localhost:27017/dynaceGlobal");
    console.log("Connecté avec succès à MongoDB (base de données sécurisée)");
  } catch (err) {
    console.error("Erreur de connexion à MongoDB :", err.message);
    throw err;
  }
};

// Schéma Utilisateur (User)
const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Social login
  address: { type: String, default: '' }, // Optional initially
  postal_code: { type: String, default: '' }, // Optional initially
  city: { type: String, default: '' }, // Optional initially
  phone: { type: String, default: '' },
  reset_password_token: { type: String },
  reset_password_expires: { type: Date },
  is_admin: { type: Boolean, default: false },
  allow_test_payment: { type: Boolean, default: false }
});

export const User = mongoose.model('User', userSchema);

// Schéma Produit (Product)
const productSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom string ID (ex: "rocenta", "dynafuel")
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  images: [{ type: String }],
  summary: { type: String, required: true },
  description: { type: String, required: true },
  benefits: [{ type: String }],
  usage: { type: String, required: true },
  stock: { type: Number, default: 50 },
  supplier_name: { type: String, default: 'Dynace Global' },
  supplier_url: { type: String, default: 'https://member.dynaceglobal.com/' },
  supplier_product_url: { type: String, default: '' },
  supplier_price: { type: Number, default: 0 },
  supplier_shipping_cost: { type: Number, default: 0 }
});

export const Product = mongoose.model('Product', productSchema);

// Schéma Commande (Order)
const orderSchema = new mongoose.Schema({
  order_number: { type: String, required: true, unique: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, required: true },
  postal_code: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, default: 'France' },
  items: { type: Array, required: true }, // Array of product items
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, default: 'Payé' }, // 'Payé', 'En préparation', 'Expédié', 'Livré', etc.
  tracking_number: { type: String, default: '' },
  coupon_code: { type: String, default: '' },
  discount_amount: { type: Number, default: 0 },
  is_archived: { type: Boolean, default: false },
  payment_method: { type: String, default: 'Carte bancaire (Stripe)' },
  history: [
    {
      status: { type: String, required: true },
      label: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  created_at: { type: Date, default: Date.now }
});

export const Order = mongoose.model('Order', orderSchema);

// Schéma Code Promo (Coupon)
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discount_type: { type: String, required: true, enum: ['percentage', 'fixed'] },
  discount_value: { type: Number, required: true },
  is_active: { type: Boolean, default: true },
  expires_at: { type: Date },
  created_at: { type: Date, default: Date.now }
});

export const Coupon = mongoose.model('Coupon', couponSchema);

// Schéma Avis/Commentaire (Review)
const reviewSchema = new mongoose.Schema({
  product_id: { type: String, required: true, index: true }, // Custom string ID (ex: "rocenta")
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // User's display name (ex: "Sophie M.")
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  video_url: { type: String },
  created_at: { type: Date, default: Date.now }
});

export const Review = mongoose.model('Review', reviewSchema);

// Schéma Configuration (Setting)
const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
});

export const Setting = mongoose.model('Setting', settingSchema);

// Schéma Newsletter (Newsletter)
const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  created_at: { type: Date, default: Date.now }
});

export const Newsletter = mongoose.model('Newsletter', newsletterSchema);
