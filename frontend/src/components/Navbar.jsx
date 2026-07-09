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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

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
          <li style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '0.25rem 0.5rem',
                transition: 'color 0.2s',
                outline: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-gold)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              title="Rechercher"
            >
              <Search size={18} />
              <ChevronDown size={12} style={{ opacity: 0.7 }} />
            </button>

            {isSearchExpanded && (
              <>
                {/* Overlay to close popover when clicking outside */}
                <div 
                  onClick={() => setIsSearchExpanded(false)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 998,
                    cursor: 'default',
                    background: 'none'
                  }}
                />
                
                {/* Floating Search Popover */}
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '260px',
                  backgroundColor: 'var(--bg-glass)',
                  backdropFilter: 'blur(20px)',
                  border: '1.5px solid var(--primary-gold)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  boxShadow: 'var(--shadow-premium)',
                  zIndex: 999,
                  animation: 'slideDown 0.2s ease-out'
                }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={14} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-secondary)' }} />
                    <input
                      type="text"
                      placeholder="Rechercher un produit..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (currentTab !== 'home') {
                          handleTabClick('home');
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem 1.75rem 0.5rem 2rem',
                        borderRadius: '30px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        fontFamily: 'var(--sans)'
                      }}
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1rem',
                borderRadius: '50px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                margin: '0 0.5rem 1rem 0.5rem'
              }}>
                <Search size={16} style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (currentTab !== 'home') {
                      handleTabClick('home');
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    width: '100%',
                    outline: 'none',
                    fontFamily: 'var(--sans)'
                  }}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </li>
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
                className="drawer-link-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
              >
                <span>Mon Panier</span>
                {cartCount > 0 && (
                  <span className="cart-badge" style={{ position: 'relative', top: 0, right: 0, padding: '2px 8px', fontSize: '0.75rem', borderRadius: '50px' }}>
                    {cartCount}
                  </span>
                )}
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
