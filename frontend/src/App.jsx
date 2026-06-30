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

function App() {
  const [currentTab, setCurrentTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
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
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Cart state with localStorage persistence
  const [cartItems, setCartItems] = useState(() => {
    const localCart = localStorage.getItem('dynace_cart');
    return localCart ? JSON.parse(localCart) : [];
  });

  // Theme state with localStorage persistence
  const [theme, setTheme] = useState(() => {
    const localTheme = localStorage.getItem('dynace_theme');
    if (localTheme) return localTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProductsList(data);
      }
    } catch (err) {
      console.error('Erreur de chargement des produits :', err);
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

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('dynace_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dynace_theme', theme);
  }, [theme]);

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

  if (loadingSession) {
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

      <main className="main-content">
        {currentTab === 'home' && (
          <Home
            products={productsList}
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

        {currentTab === 'legal' && <Legal />}
        {currentTab === 'terms' && <Terms />}
        {currentTab === 'contact' && <Contact />}
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

export default App;
