import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Bulletproof SVG Google Logo to avoid broken image icons and blockages
const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('login'); // 'login', 'signup', or 'forgot'
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
  const [signupPhone, setSignupPhone] = useState('');

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isSendingForgot, setIsSendingForgot] = useState(false);

  // Dynamic Google script loading
  useEffect(() => {
    if (isOpen) {
      const scriptId = 'google-gsi-client';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.id = scriptId;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }, [isOpen]);

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
          city: signupCity,
          phone: signupPhone
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
      setSignupPhone('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setForgotSuccess('');
    setIsSendingForgot(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la demande de réinitialisation.");
      }

      setForgotSuccess(data.message || 'Si cette adresse existe, un e-mail de réinitialisation a été envoyé.');
      setForgotEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSendingForgot(false);
    }
  };

  // Google Social Sign-In Integration (Brave-friendly using token client popup)
  const handleGoogleSignIn = () => {
    setError('');
    try {
      if (!window.google) {
        throw new Error("Le service de connexion Google se charge. Veuillez réessayer dans quelques secondes.");
      }

      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '928594169720-1iokpe7cijkmqra9uh0vedhqk62chpg7.apps.googleusercontent.com';

      if (googleClientId.includes('placeholder')) {
        throw new Error("La connexion Google n'est pas encore configurée. Veuillez ajouter votre identifiant client Google (Client ID) dans les variables d'environnement.");
      }

      // Initialize Google OAuth2 Token Client (opens standard popup safely)
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken: tokenResponse.access_token })
              });
              const data = await res.json();
              if (!res.ok) {
                throw new Error(data.error || "Erreur de connexion Google.");
              }
              onLoginSuccess(data);
              onClose();
            } catch (err) {
              setError(err.message);
            }
          } else {
            setError("La connexion avec Google a été annulée ou a échoué.");
          }
        }
      });

      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAppleSignIn = () => {
    setError("La connexion Apple nécessite un compte Apple Developer Program payant (99$/an). Cette fonction sera active dès réception de vos identifiants Apple Developer.");
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
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          padding: '2.5rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {tab !== 'forgot' ? (
              <>
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
              </>
            ) : (
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.3rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                Mot de passe oublié
              </h2>
            )}
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

        {/* 1. FORGOT PASSWORD TAB */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
              Saisissez l'adresse e-mail de votre compte. Nous vous enverrons un e-mail avec un lien sécurisé de réinitialisation.
            </p>
            
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">Adresse Email</label>
              <input 
                className="form-input"
                type="email"
                id="forgot-email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="jean.dupont@exemple.com"
              />
            </div>

            {forgotSuccess && (
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--success)',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '500',
                border: '1px solid var(--success)'
              }}>
                {forgotSuccess}
              </div>
            )}

            <button 
              type="submit" 
              className="place-order-btn" 
              style={{ marginTop: '0.5rem' }}
              disabled={isSendingForgot}
            >
              {isSendingForgot ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </button>

            <button
              type="button"
              onClick={() => { setTab('login'); setError(''); setForgotSuccess(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'center',
                textDecoration: 'underline',
                marginTop: '0.5rem'
              }}
            >
              Retour à la connexion
            </button>
          </form>
        )}

        {/* 2. LOGIN TAB */}
        {tab === 'login' && (
          <>
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

              <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                <button 
                  type="button"
                  onClick={() => { setTab('forgot'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-green)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button 
                type="submit" 
                className="place-order-btn" 
                style={{ marginTop: '0.5rem' }}
              >
                Se connecter
              </button>
            </form>
            
            {/* Social Logins */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0 0.75rem' }}>
              <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ou</span>
              <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  height: '42px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--sans)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
              >
                <GoogleLogo />
                <span>Continuer avec Google</span>
              </button>

              <button
                type="button"
                onClick={handleAppleSignIn}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  height: '42px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'black',
                  color: 'white',
                  fontFamily: 'var(--sans)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
              >
                <span style={{ fontSize: '1.1rem', marginTop: '-3px' }}></span>
                <span>Continuer avec Apple</span>
              </button>
            </div>
          </>
        )}

        {/* 3. SIGNUP TAB */}
        {tab === 'signup' && (
          <>
            <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
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

              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">Numéro de Téléphone (Requis pour la livraison)</label>
                <input 
                  className="form-input"
                  type="tel"
                  id="reg-phone"
                  required
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="Ex: 0612345678"
                />
              </div>

              <button 
                type="submit" 
                className="place-order-btn" 
                style={{ marginTop: '0.5rem' }}
              >
                Créer mon compte
              </button>
            </form>
            
            {/* Social Logins for signup */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0 0.5rem' }}>
              <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ou</span>
              <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  height: '42px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--sans)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
              >
                <GoogleLogo />
                <span>S'inscrire avec Google</span>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
