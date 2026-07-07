import React, { useState } from 'react';
import { ShoppingBag, Sun, Moon, User, LogOut, Menu, X, ChevronDown, Package, Search } from 'lucide-react';

export default function Navbar({
  currentTab,
  setCurrentTab,
  cartCount,
  setIsCartOpen,
  theme,
  toggleTheme,
  currentUser,
  onOpenAuth,
  onLogout,
  searchQuery,
  setSearchQuery
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleTabClick = (tab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        {/* Mobile menu hamburger button */}
        <button 
          className="hamburger-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu size={24} />
        </button>

        <div 
          className="nav-brand" 
          onClick={() => handleTabClick('home')} 
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', minWidth: '141px' }}
        >
          <img 
            src="/images/logo.svg" 
            alt="Dynace Global" 
            style={{ height: '38px', width: '141px', display: 'block' }} 
          />
        </div>

        {/* Desktop nav links */}
        <ul className="nav-links desktop-only">
          <li>
            <a
              className={currentTab === 'home' ? 'active' : ''}
              onClick={() => handleTabClick('home')}
            >
              Accueil
            </a>
          </li>
          <li>
            {currentUser ? (
              <a
                className={currentTab === 'orders' ? 'active' : ''}
                onClick={() => handleTabClick('orders')}
              >
                Mes Commandes
              </a>
            ) : (
              <a
                className={currentTab === 'track' ? 'active' : ''}
                onClick={() => handleTabClick('track')}
              >
                Suivi de Commande
              </a>
            )}
          </li>
          <li>
            <a
              className={currentTab === 'diagnostic' ? 'active' : ''}
              onClick={() => handleTabClick('diagnostic')}
              style={{ color: 'var(--primary-gold)', fontWeight: 'bold' }}
            >
              Diagnostic Cure
            </a>
          </li>
          <li>
            <a
              className={currentTab === 'reviews' ? 'active' : ''}
              onClick={() => handleTabClick('reviews')}
            >
              Avis Clients
            </a>
          </li>
          <li>
            <a
              className={currentTab === 'about' ? 'active' : ''}
              onClick={() => handleTabClick('about')}
            >
              À propos
            </a>
          </li>
          {currentUser?.isAdmin && (
            <li>
              <a
                className={currentTab === 'admin' ? 'active' : ''}
                onClick={() => handleTabClick('admin')}
                style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}
              >
                Admin
              </a>
            </li>
          )}
        </ul>

        <div className="nav-actions">
          <button
            className="theme-toggle desktop-only"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
            aria-label="Changer le thème"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Desktop User profile dropdown */}
          {currentUser ? (
            <div className="user-dropdown-container desktop-only">
              <button 
                className="user-pill-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
              >
                <span>{currentUser.firstName}</span>
                <ChevronDown size={14} />
              </button>
              
              {userDropdownOpen && (
                <>
                  <div className="dropdown-overlay" onClick={() => setUserDropdownOpen(false)} />
                  <div className="user-dropdown-menu">
                    <div className="dropdown-user-header">
                      <span className="user-fullname">{currentUser.firstName} {currentUser.lastName}</span>
                      <span className="user-email">{currentUser.email}</span>
                    </div>
                    <div className="dropdown-divider" />
                    
                    <button onClick={() => handleTabClick('home')} className="dropdown-item">
                      Boutique / Accueil
                    </button>
                    <button onClick={() => handleTabClick('profile')} className="dropdown-item">
                      <User size={14} style={{ marginRight: '0.5rem' }} />
                      Mon Compte
                    </button>
                    <button onClick={() => handleTabClick('orders')} className="dropdown-item">
                      <Package size={14} style={{ marginRight: '0.5rem' }} />
                      Mes Commandes
                    </button>
                    
                    {currentUser?.isAdmin && (
                      <button onClick={() => handleTabClick('admin')} className="dropdown-item admin-item">
                        Tableau de bord Admin
                      </button>
                    )}
                    
                    <div className="dropdown-divider" />
                    <button onClick={handleLogoutClick} className="dropdown-item logout-item">
                      <LogOut size={14} style={{ marginRight: '0.5rem' }} />
                      Se déconnecter
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              className="theme-toggle desktop-only"
              onClick={onOpenAuth}
              title="Se connecter"
              aria-label="S'authentifier"
            >
              <User size={20} />
            </button>
          )}

          <button
            className="theme-toggle"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            title="Rechercher"
            aria-label="Rechercher"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Search size={20} />
          </button>

          <button
            className="cart-btn"
            onClick={() => handleTabClick('cart')}
            title="Ouvrir le panier"
            aria-label="Ouvrir le panier"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* Slide-down Search Bar */}
      {isSearchOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          backgroundColor: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1rem 4%',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          zIndex: 49,
          animation: 'slideDown 0.25s ease-out',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '600px', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '1.25rem', color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Rechercher un produit, une cure (ex: Rocenta)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentTab !== 'home') {
                  handleTabClick('home');
                }
              }}
              style={{
                width: '100%',
                padding: '0.8rem 1.5rem 0.8rem 3rem',
                borderRadius: '50px',
                border: '1.5px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'var(--sans)'
              }}
              className="search-dropdown-input"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '1.25rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                Vider
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      <div className={`mobile-nav-drawer-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />
      
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <img src="/images/logo.svg" alt="Dynace Global" style={{ height: '30px', width: 'auto' }} />
          <button className="close-drawer-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Fermer le menu">
            <X size={24} />
          </button>
        </div>

        <div className="drawer-body">
          <ul className="drawer-links">
            <li>
              <button 
                className={`drawer-link-btn ${currentTab === 'home' ? 'active' : ''}`}
                onClick={() => handleTabClick('home')}
              >
                Accueil / Boutique
              </button>
            </li>
            <li>
              {currentUser ? (
                <button 
                  className={`drawer-link-btn ${currentTab === 'orders' ? 'active' : ''}`}
                  onClick={() => handleTabClick('orders')}
                >
                  Mes Commandes
                </button>
              ) : (
                <button 
                  className={`drawer-link-btn ${currentTab === 'track' ? 'active' : ''}`}
                  onClick={() => handleTabClick('track')}
                >
                  Suivi de Commande
                </button>
              )}
            </li>
            <li>
              <button 
                className={`drawer-link-btn ${currentTab === 'diagnostic' ? 'active' : ''}`}
                onClick={() => handleTabClick('diagnostic')}
                style={{ color: 'var(--primary-gold)', fontWeight: 'bold' }}
              >
                Diagnostic Cure
              </button>
            </li>
            <li>
              <button 
                className={`drawer-link-btn ${currentTab === 'reviews' ? 'active' : ''}`}
                onClick={() => handleTabClick('reviews')}
              >
                Avis Clients
              </button>
            </li>
            <li>
              <button 
                className={`drawer-link-btn ${currentTab === 'about' ? 'active' : ''}`}
                onClick={() => handleTabClick('about')}
              >
                À propos
              </button>
            </li>
            {currentUser && (
              <li>
                <button 
                  className={`drawer-link-btn ${currentTab === 'profile' ? 'active' : ''}`}
                  onClick={() => handleTabClick('profile')}
                >
                  Mon Compte
                </button>
              </li>
            )}
            {currentUser?.isAdmin && (
              <li>
                <button 
                  className={`drawer-link-btn ${currentTab === 'admin' ? 'active' : ''}`}
                  onClick={() => handleTabClick('admin')}
                  style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}
                >
                  Administration
                </button>
              </li>
            )}
          </ul>
        </div>

        <div className="drawer-footer">
          {currentUser ? (
            <div className="drawer-user-section">
              <div className="drawer-user-info">
                <span className="user-name">{currentUser.firstName} {currentUser.lastName}</span>
                <span className="user-email">{currentUser.email}</span>
              </div>
              <button onClick={handleLogoutClick} className="drawer-logout-btn">
                <LogOut size={16} style={{ marginRight: '0.5rem' }} />
                Se déconnecter
              </button>
            </div>
          ) : (
            <button onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }} className="drawer-login-btn">
              <User size={16} style={{ marginRight: '0.5rem' }} />
              Se connecter / S'inscrire
            </button>
          )}

          <div className="drawer-actions-row">
            <span className="action-label">Thème</span>
            <button className="drawer-theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={18} style={{ marginRight: '0.5rem' }} /> : <Sun size={18} style={{ marginRight: '0.5rem' }} />}
              <span>Mode {theme === 'light' ? 'Sombre' : 'Clair'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
