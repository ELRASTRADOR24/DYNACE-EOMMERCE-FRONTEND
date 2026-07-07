import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Reviews from './pages/Reviews';
import AboutUs from './pages/AboutUs';
import AdminDashboard from './pages/AdminDashboard';
import Terms from './pages/Terms';
import Legal from './pages/Legal';
import CookieBanner from './components/CookieBanner';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Contact from './pages/Contact';
import Footer from './components/Footer';
import OrderTracking from './pages/OrderTracking';
import Profile from './pages/Profile';

function App() {
  const [currentTab, setCurrentTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) return tabParam;
    if (window.location.pathname === '/track') return 'track';
    return params.get('payment') ? 'checkout' : 'home';
  });
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Scroll to top when changing tabs
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentTab, selectedProductId]);

  // Products and Auth states
  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [resetToken, setResetToken] = useState('');

  // Capture password reset token from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const tokenParam = params.get('token');
    
    if (tabParam === 'reset-password' && tokenParam) {
      setCurrentTab('reset-password');
      setResetToken(tokenParam);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Cart state with localStorage persistence
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localCart = localStorage.getItem('dynace_cart');
      return localCart ? JSON.parse(localCart) : [];
    } catch (e) {
      console.error("Erreur parsing localStorage cart :", e);
      return [];
    }
  });

  // Theme state with localStorage persistence
  const [theme, setTheme] = useState(() => {
    const localTheme = localStorage.getItem('dynace_theme');
    if (localTheme) return localTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProductsList(data);
      }
    } catch (err) {
      console.error('Erreur de chargement des produits :', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch products catalogue
  useEffect(() => {
    fetchProducts();
  }, []);

  // Verify JWT session on load
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('dynace_jwt');
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) {
            setCurrentUser(data);
          } else {
            localStorage.removeItem('dynace_jwt');
          }
        } catch (err) {
          console.error('Erreur lors de la vérification de session :', err);
          localStorage.removeItem('dynace_jwt');
        }
      }
      setLoadingSession(false);
    };
    verifySession();
  }, []);

  // Synchronize cart with latest product prices and names from DB
  useEffect(() => {
    if (productsList.length > 0 && cartItems.length > 0) {
      setCartItems(prev => {
        let changed = false;
        const newCart = prev.map(item => {
          const dbProduct = productsList.find(p => p.id === item.id);
          if (dbProduct && (dbProduct.price !== item.price || dbProduct.name !== item.name)) {
            changed = true;
            return { ...item, price: dbProduct.price, name: dbProduct.name, image: dbProduct.image };
          }
          return item;
        });
        return changed ? newCart : prev;
      });
    }
  }, [productsList]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('dynace_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dynace_theme', theme);
  }, [theme]);

  // Dynamic SEO title & description
  useEffect(() => {
    let title = "Dynace Global | Boutique Officielle | Compléments Cellulaires & Bien-être";
    let description = "Distributeur agréé Dynace Global en France et Europe. Retrouvez Rocenta, LyftMax, Urbanism, Ace Brew. Produits 100% naturels pour votre santé cellulaire.";

    switch(currentTab) {
      case 'home':
        title = "Dynace Global | Boutique Officielle France & Europe | Santé Cellulaire";
        description = "Boutique officielle de produits Dynace Global. Découvrez Rocenta, LyftMax, Urbanism. Améliorez votre bien-être et régénérez vos cellules avec nos solutions naturelles.";
        break;
      case 'detail':
        if (selectedProductId && productsList.length > 0) {
          const product = productsList.find(p => p.id === selectedProductId);
          if (product) {
            title = `${product.name} | Dynace Global Boutique Officielle`;
            description = `${product.summary} Achetez votre ${product.name} authentique au meilleur prix sur notre boutique agréée.`;
          }
        }
        break;
      case 'reviews':
        title = "Avis Clients | Dynace Global | Témoignages & Efficacité";
        description = "Consultez les témoignages et retours d'expérience authentiques de nos clients sur les produits Dynace Rocenta et LyftMax.";
        break;
      case 'about':
        title = "Qui sommes-nous ? | Dynace Global France | Distributeur Agréé";
        description = "Découvrez l'histoire de Dynace Global et notre engagement à vous fournir des compléments de santé cellulaire premium, naturels et certifiés.";
        break;
      case 'checkout':
        title = "Paiement Sécurisé | Dynace Global";
        description = "Finalisez votre commande de compléments cellulaires Dynace de manière simple et sécurisée.";
        break;
      case 'orders':
        title = "Mes Commandes | Dynace Global";
        description = "Consultez l'historique de vos achats et vos factures sur votre compte Dynace Global.";
        break;
      case 'contact':
        title = "Contactez-nous | Service Client Dynace Global";
        description = "Notre équipe est à votre écoute pour toute question sur nos produits Dynace Global, les posologies ou le suivi de livraison.";
        break;
      case 'track':
        title = "Suivre ma commande | Dynace Global";
        description = "Saisissez votre numéro de commande pour suivre l'état de préparation et de livraison de votre colis Dynace.";
        break;
      case 'admin':
        title = "Administration | Dynace Global";
        description = "Tableau de bord administrateur de la boutique Dynace Global.";
        break;
      default:
        break;
    }

    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
  }, [currentTab, selectedProductId, productsList]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleAddToCart = (product, qty = 1) => {
    setCartItems(prevItems => {
      const existing = prevItems.find(item => item.id === product.id);
      if (existing) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prevItems, { ...product, quantity: qty }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQty = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item => item.id === id ? { ...item, quantity: newQty } : item)
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const handleBuyNow = (product, qty = 1) => {
    setCartItems(prevItems => {
      const existing = prevItems.find(item => item.id === product.id);
      if (existing) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: qty } : item
        );
      }
      return [...prevItems, { ...product, quantity: qty }];
    });
    setCurrentTab('checkout');
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleLoginSuccess = (data) => {
    localStorage.setItem('dynace_jwt', data.token);
    setCurrentUser(data.user);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('dynace_jwt');
    setCurrentUser(null);
    if (currentTab === 'admin') {
      setCurrentTab('home');
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const isAuthRequiredTab = ['admin', 'orders'].includes(currentTab);
  if (loadingSession && isAuthRequiredTab) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--sans)',
        fontSize: '1.5rem',
        color: 'var(--primary-green)',
        backgroundColor: 'var(--bg-primary)',
        gap: '1.5rem'
      }}>
        <img src="/images/logo.svg" alt="Dynace Global" style={{ height: '48px', width: 'auto' }} />
        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Chargement de votre session...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        cartCount={cartCount}
        setIsCartOpen={setIsCartOpen}
        theme={theme}
        toggleTheme={toggleTheme}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {currentUser && (!currentUser.address || !currentUser.phone) && (
        <div style={{
          backgroundColor: 'var(--accent-gold)',
          color: 'var(--bg-primary)',
          textAlign: 'center',
          padding: '0.6rem 1rem',
          fontSize: '0.85rem',
          fontWeight: '700',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          letterSpacing: '0.02em',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <span>⚠️ Profil incomplet : veuillez ajouter votre adresse de livraison et numéro de téléphone pour commander plus rapidement.</span>
          <button 
            onClick={() => setCurrentTab('profile')} 
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: 'none',
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              marginLeft: '0.5rem',
              borderRadius: '3px'
            }}
          >
            Compléter mon profil
          </button>
        </div>
      )}

      <main className="main-content">
        {currentTab === 'home' && (
          <Home
            products={productsList}
            loadingProducts={loadingProducts}
            onSelectProduct={(id) => {
              setSelectedProductId(id);
              setCurrentTab('detail');
            }}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentTab === 'detail' && selectedProductId && (
          <ProductDetail
            product={productsList.find(p => p.id === selectedProductId)}
            onBack={() => setCurrentTab('home')}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {currentTab === 'reviews' && (
          <Reviews />
        )}

        {currentTab === 'about' && (
          <AboutUs />
        )}

        {currentTab === 'checkout' && (
          <Checkout
            cartItems={cartItems}
            onClearCart={handleClearCart}
            onBackToShopping={() => setCurrentTab('home')}
            currentUser={currentUser}
            onLogin={handleLoginSuccess}
          />
        )}

        {currentTab === 'admin' && currentUser?.isAdmin && (
          <AdminDashboard onRefreshProducts={fetchProducts} />
        )}

        {currentTab === 'orders' && currentUser && (
          <Orders onBackToShopping={() => setCurrentTab('home')} />
        )}

        {currentTab === 'profile' && currentUser && (
          <Profile
            currentUser={currentUser}
            onUpdateUser={(updatedUser) => setCurrentUser(updatedUser)}
            onLogout={handleLogout}
          />
        )}

        {currentTab === 'reset-password' && (
          <ResetPassword
            token={resetToken}
            onSuccess={() => {
              setCurrentTab('home');
              setIsAuthOpen(true);
            }}
          />
        )}

        {currentTab === 'legal' && <Legal />}
        {currentTab === 'terms' && <Terms />}
        {currentTab === 'contact' && <Contact />}
        {currentTab === 'track' && <OrderTracking />}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => setCurrentTab('checkout')}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <Footer setCurrentTab={setCurrentTab} />
      <CookieBanner />
    </div>
  );
}

// Sub-component for password reset tab
function ResetPassword({ token, onSuccess }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur de réinitialisation.');
      }

      setSuccess('Votre mot de passe a été réinitialisé avec succès ! Redirection...');
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '80px auto', padding: '2.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Définir un nouveau mot de passe</h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Veuillez choisir votre nouveau mot de passe de connexion.</p>

      {error && (
        <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.25rem', border: '1px solid rgba(217,48,37,0.2)' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.25rem', border: '1px solid var(--success)' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="form-group-review">
          <label className="comment-label">Nouveau mot de passe</label>
          <input
            type="password"
            className="review-textarea"
            style={{ height: '42px', padding: '0.5rem 1rem' }}
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="form-group-review">
          <label className="comment-label">Confirmer le mot de passe</label>
          <input
            type="password"
            className="review-textarea"
            style={{ height: '42px', padding: '0.5rem 1rem' }}
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="continue-shopping-btn"
          style={{ width: '100%', marginTop: '0.5rem' }}
          disabled={loading}
        >
          {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
        </button>
      </form>
    </div>
  );
}

export default App;
