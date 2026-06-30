import React, { useState, useEffect } from 'react';
import { X, Cookie, Check } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('dynace_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('dynace_cookie_consent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('dynace_cookie_consent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      zIndex: 9999,
      maxWidth: '320px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-gold)' }}>
          <Cookie size={20} />
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>Cookies</h3>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
        >
          <X size={16} />
        </button>
      </div>

      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
        Nous utilisons des cookies essentiels au panier et au paiement sécurisé.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        <button 
          onClick={handleAccept}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: 'var(--primary-gold)',
            color: 'var(--bg-primary)',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            transition: 'background-color 0.2s'
          }}
        >
          <Check size={14} /> J'accepte
        </button>
        <button 
          onClick={handleDecline}
          style={{
            flex: 1,
            padding: '0.5rem',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            fontWeight: '500',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          Je refuse
        </button>
      </div>
    </div>
  );
}
