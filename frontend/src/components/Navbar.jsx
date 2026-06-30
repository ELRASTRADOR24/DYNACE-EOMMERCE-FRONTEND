import React, { useState } from 'react';
import { ShoppingBag, Sun, Moon, User, LogOut, Menu, X, ChevronDown, Package } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <img 
            src="/images/logo.svg" 
            alt="Dynace Global" 
            style={{ height: '38px', width: 'auto', display: 'block' }} 
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
            <a
              className={currentTab === 'about' ? 'active' : ''}
              onClick={() => handleTabClick('about')}
            >
              À propos
            </a>
          </li>
          {/*
          <li>
            <a
              className={currentTab === 'reviews' ? 'active' : ''}
              onClick={() => handleTabClick('reviews')}
            >
              Avis Clients
            </a>
          </li>
          */}
          {currentUser && (
            <li>
              <a
                className={currentTab === 'orders' ? 'active' : ''}
                onClick={() => handleTabClick('orders')}
              >
                Mes Commandes
              </a>
            </li>
          )}
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
              <button 
                className={`drawer-link-btn ${currentTab === 'about' ? 'active' : ''}`}
                onClick={() => handleTabClick('about')}
              >
                À propos
              </button>
            </li>
            {/*
            <li>
              <button 
                className={`drawer-link-btn ${currentTab === 'reviews' ? 'active' : ''}`}
                onClick={() => handleTabClick('reviews')}
              >
                Avis Clients
              </button>
            </li>
            */}
            {currentUser && (
              <li>
                <button 
                  className={`drawer-link-btn ${currentTab === 'orders' ? 'active' : ''}`}
                  onClick={() => handleTabClick('orders')}
                >
                  Mes Commandes
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
