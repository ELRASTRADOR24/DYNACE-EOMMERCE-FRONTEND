import React from 'react';
import { ShoppingBag, Sun, Moon, User, LogOut } from 'lucide-react';

export default function Navbar({
  currentTab,
  setCurrentTab,
  cartCount,
  setIsCartOpen,
  theme,
  toggleTheme,
  currentUser,
  onOpenAuth,
  onLogout
}) {
  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => setCurrentTab('home')} style={{ display: 'flex', alignItems: 'center' }}>
        <img 
          src="/images/logo.svg" 
          alt="Dynace Global" 
          style={{ height: '38px', width: 'auto', display: 'block' }} 
        />
      </div>

      <ul className="nav-links">
        <li>
          <a
            className={currentTab === 'home' ? 'active' : ''}
            onClick={() => setCurrentTab('home')}
          >
            Accueil
          </a>
        </li>
        <li>
          <a
            className={currentTab === 'reviews' ? 'active' : ''}
            onClick={() => setCurrentTab('reviews')}
          >
            Avis Clients
          </a>
        </li>
        {currentUser?.isAdmin && (
          <li>
            <a
              className={currentTab === 'admin' ? 'active' : ''}
              onClick={() => setCurrentTab('admin')}
              style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}
            >
              Admin
            </a>
          </li>
        )}
      </ul>

      <div className="nav-actions">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
          aria-label="Changer le thème"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--border-color)', padding: '0.35rem 0.8rem', borderRadius: '20px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-green)' }}>
              {currentUser.firstName}
            </span>
            <button
              onClick={onLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.1rem'
              }}
              title="Se déconnecter"
              aria-label="Se déconnecter"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            className="theme-toggle"
            onClick={onOpenAuth}
            title="Se connecter"
            aria-label="S'authentifier"
          >
            <User size={20} />
          </button>
        )}

        <button
          className="cart-btn"
          onClick={() => setIsCartOpen(true)}
          title="Ouvrir le panier"
          aria-label="Ouvrir le panier"
        >
          <ShoppingBag size={20} />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </div>
    </nav>
  );
}
