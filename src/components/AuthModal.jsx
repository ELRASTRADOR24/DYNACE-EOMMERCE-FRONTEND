import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' or 'signup'
  const [error, setError] = useState('');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup Form States
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const [signupPostalCode, setSignupPostalCode] = useState('');
  const [signupCity, setSignupCity] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Adresse email ou mot de passe incorrect.');
      }

      onLoginSuccess(data); // Expects { token, user }
      onClose();
      
      // Reset form
      setLoginEmail('');
      setLoginPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: signupFirstName,
          lastName: signupLastName,
          email: signupEmail,
          password: signupPassword,
          address: signupAddress,
          postalCode: signupPostalCode,
          city: signupCity
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création du compte.");
      }

      onLoginSuccess(data); // Expects { token, user }
      onClose();

      // Reset signup form
      setSignupFirstName('');
      setSignupLastName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupAddress('');
      setSignupPostalCode('');
      setSignupCity('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div 
        className="cart-drawer-overlay open" 
        onClick={onClose} 
        style={{ zIndex: 110 }}
      />
      <div 
        className="checkout-card" 
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 120,
          width: '500px',
          maxWidth: '90vw',
          backgroundColor: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => { setTab('login'); setError(''); }}
              style={{
                fontFamily: 'var(--serif)',
                fontSize: '1.3rem',
                fontWeight: '600',
                background: 'none',
                border: 'none',
                color: tab === 'login' ? 'var(--primary-green)' : 'var(--text-secondary)',
                borderBottom: tab === 'login' ? '2px solid var(--primary-green)' : 'none',
                paddingBottom: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Connexion
            </button>
            <button 
              onClick={() => { setTab('signup'); setError(''); }}
              style={{
                fontFamily: 'var(--serif)',
                fontSize: '1.3rem',
                fontWeight: '600',
                background: 'none',
                border: 'none',
                color: tab === 'signup' ? 'var(--primary-green)' : 'var(--text-secondary)',
                borderBottom: tab === 'signup' ? '2px solid var(--primary-green)' : 'none',
                paddingBottom: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Créer un compte
            </button>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-color)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger)',
            padding: '0.8rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '500',
            marginBottom: '1.25rem',
            border: '1px solid rgba(217, 48, 37, 0.2)'
          }}>
            {error}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">Adresse Email</label>
              <input 
                className="form-input"
                type="email"
                id="auth-email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="jean.dupont@exemple.com"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">Mot de passe</label>
              <input 
                className="form-input"
                type="password"
                id="auth-password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              className="place-order-btn" 
              style={{ marginTop: '0.5rem' }}
            >
              Se connecter
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-first">Prénom</label>
                <input 
                  className="form-input"
                  type="text"
                  id="reg-first"
                  required
                  value={signupFirstName}
                  onChange={(e) => setSignupFirstName(e.target.value)}
                  placeholder="Jean"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-last">Nom</label>
                <input 
                  className="form-input"
                  type="text"
                  id="reg-last"
                  required
                  value={signupLastName}
                  onChange={(e) => setSignupLastName(e.target.value)}
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Adresse Email</label>
              <input 
                className="form-input"
                type="email"
                id="reg-email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="jean.dupont@exemple.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Mot de passe</label>
              <span className="form-hint" style={{ marginTop: '-0.25rem' }}>6 caractères minimum</span>
              <input 
                className="form-input"
                type="password"
                id="reg-password"
                required
                minLength={6}
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="detail-divider" style={{ margin: '0.5rem 0' }} />
            
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-green)' }}>Adresse de livraison par défaut</span>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-address">Rue et numéro</label>
              <input 
                className="form-input"
                type="text"
                id="reg-address"
                required
                value={signupAddress}
                onChange={(e) => setSignupAddress(e.target.value)}
                placeholder="12 rue de la Paix"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-zip">Code Postal</label>
                <input 
                  className="form-input"
                  type="text"
                  id="reg-zip"
                  required
                  pattern="[0-9]{5}"
                  value={signupPostalCode}
                  onChange={(e) => setSignupPostalCode(e.target.value)}
                  placeholder="75001"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-city">Ville</label>
                <input 
                  className="form-input"
                  type="text"
                  id="reg-city"
                  required
                  value={signupCity}
                  onChange={(e) => setSignupCity(e.target.value)}
                  placeholder="Paris"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="place-order-btn" 
              style={{ marginTop: '0.5rem' }}
            >
              Créer mon compte
            </button>
          </form>
        )}
      </div>
    </>
  );
}
