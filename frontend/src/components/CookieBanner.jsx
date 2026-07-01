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
    const analyticsChecked = document.getElementById('analytics-cookie')?.checked;
    localStorage.setItem('dynace_cookie_consent', 'true');
    localStorage.setItem('dynace_cookie_analytics', analyticsChecked ? 'true' : 'false');
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
        Gérez vos préférences en matière de cookies.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'not-allowed' }}>
          <span>Cookies essentiels (Panier)</span>
          <input type="checkbox" checked disabled style={{ accentColor: 'var(--primary-gold)', width: '16px', height: '16px' }} />
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
          <span>Cookies analytiques</span>
          <input type="checkbox" id="analytics-cookie" defaultChecked style={{ accentColor: 'var(--primary-gold)', width: '16px', height: '16px', cursor: 'pointer' }} />
        </label>
      </div>

      <button 
        onClick={handleAccept}
        style={{
          marginTop: '0.5rem',
          padding: '0.75rem',
          backgroundColor: 'var(--primary-green)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '700',
          fontSize: '0.9rem',
          cursor: 'pointer',
          width: '100%',
          boxShadow: '0 4px 6px rgba(21, 58, 137, 0.1)',
          transition: 'all 0.2s ease'
        }}
      >
        Enregistrer mes choix
      </button>
    </div>
  );
}
