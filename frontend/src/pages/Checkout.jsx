import React, { useState, useEffect } from 'react';
import { CreditCard, Truck, User, Check, ArrowRight, Lock, Loader } from 'lucide-react';

export default function Checkout({ cartItems, onClearCart, onBackToShopping, currentUser, onLogin }) {
  const [checkoutMode, setCheckoutMode] = useState(currentUser ? 'registered' : null); // null, 'guest', 'registered', 'login_inline', 'signup_inline'
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [trackerStep, setTrackerStep] = useState(0);

  // Form Field States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  
  // Stripe confirmation states
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  // Inline Auth States
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPostalCode, setRegPostalCode] = useState('');
  const [regCity, setRegCity] = useState('');

  const [shippingThreshold, setShippingThreshold] = useState(60);
  const [shippingCostBase, setShippingCostBase] = useState(6.90);

  useEffect(() => {
    fetch('/api/settings/shipping')
      .then(res => res.json())
      .then(data => {
        if (data.threshold !== undefined) setShippingThreshold(data.threshold);
        if (data.cost !== undefined) setShippingCostBase(data.cost);
      })
      .catch(err => console.error(err));
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = subtotal >= shippingThreshold || subtotal === 0 ? 0 : shippingCostBase;
  const grandTotal = subtotal + shippingCost;

  // Effect to automatically set registered mode if currentUser logs in
  useEffect(() => {
    if (currentUser) {
      setCheckoutMode('registered');
      setFirstName(currentUser.firstName || '');
      setLastName(currentUser.lastName || '');
      setEmail(currentUser.email || '');
      setAddress(currentUser.address || '');
      setPostalCode(currentUser.postalCode || '');
      setCity(currentUser.city || '');
    } else if (checkoutMode === 'registered') {
      setCheckoutMode(null);
    }
  }, [currentUser]);

  // Handle Stripe callback URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const sessionId = params.get('session_id');

    if (payment === 'success' && sessionId) {
      const verifyPayment = async () => {
        setIsConfirming(true);
        setConfirmError('');
        try {
          const res = await fetch('/api/payment/confirm-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Erreur lors de la validation du paiement.');
          }
          if (data.success) {
            setOrderNumber(data.orderNumber);
            setIsOrdered(true);
            setTrackerStep(0);
            onClearCart();
            // Clean up query parameters from URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (err) {
          console.error('Validation error:', err);
          setConfirmError(err.message);
        } finally {
          setIsConfirming(false);
        }
      };
      verifyPayment();
    } else if (payment === 'cancel') {
      setConfirmError('Le paiement a été annulé ou a échoué. Vous pouvez modifier vos informations et réessayer.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [onClearCart]);

  // Fetch real tracker status
  useEffect(() => {
    let intervalId;
    if (isOrdered && orderNumber) {
      const fetchStatus = async () => {
        try {
          const res = await fetch(`/api/orders/track/${orderNumber}`);
          const data = await res.json();
          if (res.ok) {
            // Mapping statuses to tracker steps
            if (data.status === 'Payé') setTrackerStep(0);
            else if (data.status === 'En préparation') setTrackerStep(1);
            else if (data.status === 'Expédié') setTrackerStep(2);
            else if (data.status === 'Livré') setTrackerStep(3);
          }
        } catch (err) {
          console.error("Erreur récupération suivi:", err);
        }
      };
      
      // Fetch immédiatement puis toutes les 10 secondes
      fetchStatus();
      intervalId = setInterval(fetchStatus, 10000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOrdered, orderNumber]);

  const handleInlineLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la connexion.');
      }
      onLogin(data); // Expects { token, user }
      setAuthEmail('');
      setAuthPassword('');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleInlineSignup = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail,
          password: regPassword,
          address: regAddress,
          postalCode: regPostalCode,
          city: regCity
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription.");
      }
      onLogin(data); // Expects { token, user }
      
      // Reset inputs
      setRegFirstName('');
      setRegLastName('');
      setRegEmail('');
      setRegPassword('');
      setRegAddress('');
      setRegPostalCode('');
      setRegCity('');
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleSubmitCheckout = async (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) return;

    setIsConfirming(true);
    setConfirmError('');

    try {
      const res = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          address,
          postalCode,
          city,
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Impossible d'initialiser le paiement sécurisé.");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Aucun lien de paiement reçu du serveur.");
      }
    } catch (err) {
      setConfirmError(err.message);
      setIsConfirming(false);
    }
  };

  const steps = [
    { title: 'Commande reçue', desc: 'Votre commande a été enregistrée avec succès dans notre système.' },
    { title: 'Préparation artisanale', desc: 'Nos herboristes préparent et conditionnent vos sachets d\'herbes fraîches.' },
    { title: 'Remis au transporteur', desc: 'Votre colis a été remis à notre partenaire de livraison.' },
    { title: 'Livraison en cours', desc: 'Votre colis est en route pour votre adresse de livraison.' }
  ];

  if (isConfirming) {
    return (
      <div className="success-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1.5rem', textAlign: 'center' }}>
        <Loader className="animate-spin" size={48} style={{ color: 'var(--primary-green)' }} />
        <h1 className="success-title" style={{ fontSize: '1.8rem' }}>Validation du paiement...</h1>
        <p className="success-text" style={{ color: 'var(--text-secondary)' }}>
          Nous vérifions la transaction auprès de Stripe. Veuillez ne pas actualiser ni fermer cette page.
        </p>
      </div>
    );
  }

  if (isOrdered) {
    return (
      <div className="success-card">
        <div className="success-icon-wrapper">
          <Check size={40} strokeWidth={3} />
        </div>
        <h1 className="success-title">Merci pour votre commande !</h1>
        <p className="success-text">
          Votre paiement a été validé. Nos herboristes préparent dès maintenant vos sachets avec le plus grand soin.
        </p>
        <div className="order-number-badge">
          N° DE COMMANDE : {orderNumber}
        </div>

        <div className="tracker-container">
          <h3 className="tracker-title">Suivi de votre livraison</h3>
          <div className="tracker-steps">
            {steps.map((step, idx) => {
              let dotClass = 'tracker-dot';
              let titleClass = 'tracker-step-title';
              
              if (idx < trackerStep) {
                dotClass += ' completed';
              } else if (idx === trackerStep) {
                dotClass += ' active';
                titleClass += ' active';
              }

              return (
                <div className="tracker-step" key={idx}>
                  <div className={dotClass}>
                    <div className="tracker-dot-inner" />
                  </div>
                  <div className="tracker-info">
                    <span className={titleClass}>{step.title}</span>
                    <span className="tracker-step-desc">{step.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="success-actions">
          <button className="continue-shopping-btn" onClick={onBackToShopping}>
            Continuer mes achats
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-container" style={{ gridTemplateColumns: '1fr' }}>
        <div className="checkout-card" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
          <h1 className="checkout-title" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Votre panier est vide</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Ajoutez des sachets de plantes médicinales depuis notre catalogue avant de valider votre commande.</p>
          <button className="continue-shopping-btn" onClick={onBackToShopping}>Retourner au catalogue</button>
        </div>
      </div>
    );
  }

  // Gated Auth Selection Screen
  if (checkoutMode === null) {
    return (
      <div className="checkout-container" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <h1 className="checkout-title">Comment souhaitez-vous commander ?</h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Guest Option */}
            <div className="checkout-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 className="form-group-title"><Truck size={18} /> Mode Invité</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Commandez rapidement sans créer de compte. Vous pourrez enregistrer vos informations à la fin si vous le souhaitez.
                </p>
              </div>
              <button 
                className="place-order-btn" 
                onClick={() => setCheckoutMode('guest')}
                style={{ backgroundColor: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                Commander en invité <ArrowRight size={16} />
              </button>
            </div>

            {/* Login Option */}
            <div className="checkout-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 className="form-group-title"><Lock size={18} /> Déjà client ?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Connectez-vous pour pré-remplir automatiquement votre adresse de livraison et suivre votre colis.
                </p>
              </div>
              <button 
                className="place-order-btn" 
                onClick={() => setCheckoutMode('login_inline')}
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <aside className="order-summary-card">
          <h2 className="summary-title">Votre Panier</h2>
          <div className="summary-items">
            {cartItems.map(item => (
              <div className="summary-item" key={item.id}>
                <div>
                  <span className="summary-item-name">{item.name}</span>
                  <span className="summary-item-qty">x{item.quantity}</span>
                </div>
                <span className="summary-item-price">{(item.price * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
          </div>
          <div className="summary-divider" />
          <div className="summary-totals">
            <div className="totals-row">
              <span>Sous-total</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="totals-row">
              <span>Livraison</span>
              {shippingCost === 0 ? <span style={{ color: 'var(--success)', fontWeight: '600' }}>Gratuit</span> : <span>{shippingCost.toFixed(2)} €</span>}
            </div>
            <div className="totals-row grand-total">
              <span>Total</span>
              <span>{grandTotal.toFixed(2)} €</span>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  // Inline Login
  if (checkoutMode === 'login_inline') {
    return (
      <div className="checkout-container" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        <div className="checkout-form-section">
          <h1 className="checkout-title">Connectez-vous</h1>
          
          <form className="checkout-card" onSubmit={handleInlineLogin}>
            {authError && (
              <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.25rem', fontWeight: '500' }}>
                {authError}
              </div>
            )}
            
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="inline-email">Adresse Email</label>
              <input 
                className="form-input"
                type="email"
                id="inline-email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="jean.dupont@exemple.com"
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="inline-password">Mot de passe</label>
              <input 
                className="form-input"
                type="password"
                id="inline-password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                type="button" 
                className="category-btn" 
                onClick={() => { setCheckoutMode(null); setAuthError(''); }}
                style={{ flex: 1 }}
              >
                Retour
              </button>
              <button type="submit" className="place-order-btn" style={{ flex: 2 }}>
                Se connecter
              </button>
            </div>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Nouveau client ?{' '}
              <a 
                onClick={() => { setCheckoutMode('signup_inline'); setAuthError(''); }}
                style={{ color: 'var(--primary-green)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Créer un compte
              </a>
            </p>
          </form>
        </div>

        {/* Sidebar Summary */}
        <aside className="order-summary-card">
          <h2 className="summary-title">Votre Panier</h2>
          <div className="summary-items">
            {cartItems.map(item => (
              <div className="summary-item" key={item.id}>
                <div>
                  <span className="summary-item-name">{item.name}</span>
                  <span className="summary-item-qty">x{item.quantity}</span>
                </div>
                <span className="summary-item-price">{(item.price * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
          </div>
          <div className="summary-divider" />
          <div className="summary-totals">
            <div className="totals-row">
              <span>Sous-total</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="totals-row">
              <span>Livraison</span>
              {shippingCost === 0 ? <span style={{ color: 'var(--success)', fontWeight: '600' }}>Gratuit</span> : <span>{shippingCost.toFixed(2)} €</span>}
            </div>
            <div className="totals-row grand-total">
              <span>Total</span>
              <span>{grandTotal.toFixed(2)} €</span>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  // Inline Signup
  if (checkoutMode === 'signup_inline') {
    return (
      <div className="checkout-container" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        <div className="checkout-form-section">
          <h1 className="checkout-title">Créez votre compte</h1>
          
          <form className="checkout-card" onSubmit={handleInlineSignup}>
            {authError && (
              <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.8rem 1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.25rem', fontWeight: '500' }}>
                {authError}
              </div>
            )}

            <div className="form-grid" style={{ marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="in-reg-first">Prénom</label>
                <input 
                  className="form-input" 
                  type="text" 
                  id="in-reg-first" 
                  required 
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  placeholder="Jean"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="in-reg-last">Nom</label>
                <input 
                  className="form-input" 
                  type="text" 
                  id="in-reg-last" 
                  required 
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  placeholder="Dupont"
                />
              </div>
              <div className="form-group full-width">
                <label className="form-label" htmlFor="in-reg-email">Email</label>
                <input 
                  className="form-input" 
                  type="email" 
                  id="in-reg-email" 
                  required 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="jean@exemple.com"
                />
              </div>
              <div className="form-group full-width">
                <label className="form-label" htmlFor="in-reg-pass">Mot de passe (6 char min.)</label>
                <input 
                  className="form-input" 
                  type="password" 
                  id="in-reg-pass" 
                  required 
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label" htmlFor="in-reg-addr">Adresse postale</label>
                <input 
                  className="form-input" 
                  type="text" 
                  id="in-reg-addr" 
                  required 
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="12 rue de la Paix"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="in-reg-zip">Code Postal</label>
                <input 
                  className="form-input" 
                  type="text" 
                  id="in-reg-zip" 
                  required 
                  pattern="[0-9]{5}"
                  value={regPostalCode}
                  onChange={(e) => setRegPostalCode(e.target.value)}
                  placeholder="75001"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="in-reg-city">Ville</label>
                <input 
                  className="form-input" 
                  type="text" 
                  id="in-reg-city" 
                  required 
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  placeholder="Paris"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                type="button" 
                className="category-btn" 
                onClick={() => { setCheckoutMode('login_inline'); setAuthError(''); }}
                style={{ flex: 1 }}
              >
                Retour
              </button>
              <button type="submit" className="place-order-btn" style={{ flex: 2 }}>
                S'inscrire
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Summary */}
        <aside className="order-summary-card">
          <h2 className="summary-title">Votre Panier</h2>
          <div className="summary-items">
            {cartItems.map(item => (
              <div className="summary-item" key={item.id}>
                <div>
                  <span className="summary-item-name">{item.name}</span>
                  <span className="summary-item-qty">x{item.quantity}</span>
                </div>
                <span className="summary-item-price">{(item.price * item.quantity).toFixed(2)} €</span>
              </div>
            ))}
          </div>
          <div className="summary-divider" />
          <div className="summary-totals">
            <div className="totals-row">
              <span>Sous-total</span>
              <span>{subtotal.toFixed(2)} €</span>
            </div>
            <div className="totals-row">
              <span>Livraison</span>
              {shippingCost === 0 ? <span style={{ color: 'var(--success)', fontWeight: '600' }}>Gratuit</span> : <span>{shippingCost.toFixed(2)} €</span>}
            </div>
            <div className="totals-row grand-total">
              <span>Total</span>
              <span>{grandTotal.toFixed(2)} €</span>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  // Normal Form
  return (
    <div className="checkout-container">
      <div className="checkout-form-section">
        <div>
          <h1 className="checkout-title">Adresse & Paiement</h1>
          {currentUser ? (
            <p className="checkout-subtitle" style={{ color: 'var(--success)', fontWeight: '500' }}>
              ✓ Connecté en tant que {currentUser.firstName} {currentUser.lastName}. Coordonnées pré-remplies.
            </p>
          ) : (
            <p className="checkout-subtitle">Achat en Mode Invité.</p>
          )}
        </div>

        {confirmError && (
          <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '1rem', borderRadius: '12px', fontSize: '0.95rem', marginBottom: '1.5rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚠️</span>
            <span>{confirmError}</span>
          </div>
        )}

        <form className="checkout-card" onSubmit={handleSubmitCheckout} noValidate={false}>
          {/* Shipping Form */}
          <h3 className="form-group-title">
            <Truck size={18} /> 1. Adresse de Livraison
          </h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">Prénom</label>
              <input 
                className="form-input" 
                type="text" 
                id="firstName" 
                required 
                minLength={2}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jean"
              />
              <span className="form-error">Le prénom est requis (2 lettres min.)</span>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="lastName">Nom de famille</label>
              <input 
                className="form-input" 
                type="text" 
                id="lastName" 
                required 
                minLength={2}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Dupont"
              />
              <span className="form-error">Le nom est requis (2 lettres min.)</span>
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="email">Adresse Email</label>
              <span className="form-hint" style={{ marginTop: '-0.25rem', marginBottom: '0.15rem' }}>Format : email@exemple.com</span>
              <input 
                className="form-input" 
                type="email" 
                id="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean.dupont@exemple.com"
              />
              <span className="form-error">Veuillez entrer une adresse email valide.</span>
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="address">Adresse postale</label>
              <input 
                className="form-input" 
                type="text" 
                id="address" 
                required 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="12 rue de la Paix"
              />
              <span className="form-error">L'adresse de livraison est requise.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="postalCode">Code Postal</label>
              <input 
                className="form-input" 
                type="text" 
                id="postalCode" 
                required 
                pattern="[0-9]{5}"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="75001"
              />
              <span className="form-error">Code postal à 5 chiffres requis.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="city">Ville</label>
              <input 
                className="form-input" 
                type="text" 
                id="city" 
                required 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Paris"
              />
              <span className="form-error">La ville est requise.</span>
            </div>
          </div>

          <div className="detail-divider" style={{ margin: '2rem 0' }} />

          {/* Payment Info */}
          <h3 className="form-group-title">
            <Lock size={18} /> 2. Mode de Paiement
          </h3>

          <div style={{ padding: '1.25rem', borderRadius: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--primary-green)', padding: '0.5rem', backgroundColor: 'rgba(21, 58, 137, 0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Paiement Sécurisé via Stripe</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Vous allez être redirigé vers la passerelle de paiement sécurisée de **Stripe** pour finaliser votre commande. Vos données de carte bancaire transitent de manière cryptée et ne sont jamais stockées sur notre serveur.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            {!currentUser && (
              <button 
                type="button" 
                className="category-btn" 
                onClick={() => setCheckoutMode(null)}
                style={{ flex: 1 }}
              >
                Retour
              </button>
            )}
            <button type="submit" className="place-order-btn" style={{ flex: 2 }}>
              Procéder au paiement - {grandTotal.toFixed(2)} €
            </button>
          </div>
        </form>
      </div>

      {/* Sidebar Summary */}
      <aside className="order-summary-card">
        <h2 className="summary-title">Récapitulatif</h2>
        
        <div className="summary-items">
          {cartItems.map(item => (
            <div className="summary-item" key={item.id}>
              <div>
                <span className="summary-item-name">{item.name}</span>
                <span className="summary-item-qty">x{item.quantity}</span>
              </div>
              <span className="summary-item-price">{(item.price * item.quantity).toFixed(2)} €</span>
            </div>
          ))}
        </div>

        <div className="summary-divider" />

        <div className="summary-totals">
          <div className="totals-row">
            <span>Sous-total</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>
          <div className="totals-row">
            <span>Livraison</span>
            {shippingCost === 0 ? <span style={{ color: 'var(--success)', fontWeight: '600' }}>Gratuit</span> : <span>{shippingCost.toFixed(2)} €</span>}
          </div>
          <div className="totals-row grand-total" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            <span>Total</span>
            <span>{grandTotal.toFixed(2)} €</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
