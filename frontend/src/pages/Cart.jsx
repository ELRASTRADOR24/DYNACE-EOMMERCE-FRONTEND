import React, { useEffect, useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';

export default function Cart({ cartItems, onUpdateQty, onRemoveItem, onNavigate }) {
  const [shippingCost, setShippingCost] = useState(10.50);

  // Fetch actual shipping settings
  useEffect(() => {
    fetch('/api/settings/shipping')
      .then(res => res.json())
      .then(data => {
        if (data && data.cost !== undefined) {
          setShippingCost(data.cost);
        }
      })
      .catch(err => console.error("Erreur lecture frais de port :", err));
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Shipping is free if subtotal > 150 (example threshold or dynamic threshold)
  // Let's make it €150 or show €10.50 shipping cost.
  const shippingThreshold = 150; 
  const currentShipping = subtotal >= shippingThreshold ? 0 : shippingCost;
  const total = subtotal + currentShipping;

  const handleCheckoutClick = () => {
    onNavigate('checkout');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem', minHeight: '80vh', fontFamily: 'var(--sans)' }}>
      {/* Back to shopping link */}
      <button 
        onClick={() => onNavigate('home')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '2rem',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={16} /> Continuer mes achats
      </button>

      <h1 style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--serif)', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ShoppingCart size={32} style={{ color: 'var(--primary-gold)' }} />
        Votre Panier
      </h1>

      {cartItems.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem', 
          background: 'var(--bg-glass)', 
          borderRadius: '16px', 
          border: '1px solid var(--border-color)', 
          backdropFilter: 'blur(10px)' 
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '1rem' }}>Votre panier est vide</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Découvrez nos cures cellulaires premium et commencez votre parcours bien-être.
          </p>
          <button 
            onClick={() => onNavigate('home')}
            className="place-order-btn"
            style={{ width: 'auto', padding: '0.85rem 2rem' }}
          >
            Découvrir nos produits
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '2fr 1fr', gap: '2.5rem', alignItems: 'flex-start' }} className="cart-grid-responsive">
          {/* Items list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {cartItems.map((item) => (
              <div 
                key={item.id}
                style={{
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  position: 'relative'
                }}
              >
                {/* Product Image */}
                <img 
                  src={item.image} 
                  alt={item.name} 
                  style={{ width: '80px', height: '80px', objectFit: 'contain', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', padding: '0.5rem' }} 
                />

                {/* Details */}
                <div style={{ flex: '1 1 200px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{item.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Prix unitaire : {item.price}.00 €
                  </span>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '30px', padding: '0.25rem 0.75rem', backgroundColor: 'var(--bg-primary)' }}>
                  <button 
                    onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '700', fontSize: '0.95rem' }}>{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Price Total & Delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: 'auto' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary-gold)' }}>
                    {item.price * item.quantity}.00 €
                  </span>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.7, padding: '0.5rem', transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                    title="Retirer cet article"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary Box */}
          <div 
            style={{
              background: 'var(--bg-glass)',
              border: '1.5px solid var(--primary-gold)',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: 'var(--shadow-premium)',
              color: 'var(--text-primary)',
              position: 'relative'
            }}
          >
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              Résumé de la commande
            </h2>

            {/* Calculations rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Sous-total</span>
                <span style={{ fontWeight: '600' }}>{subtotal}.00 €</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Livraison</span>
                <span style={{ fontWeight: '600', color: currentShipping === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                  {currentShipping === 0 ? 'Gratuite' : `${currentShipping.toFixed(2)} €`}
                </span>
              </div>

              {/* Free delivery encouragement */}
              {subtotal < shippingThreshold && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', backgroundColor: 'rgba(212, 175, 55, 0.08)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.2)', color: 'var(--primary-gold)' }}>
                  <Truck size={14} />
                  <span>Ajoutez <strong>{(shippingThreshold - subtotal).toFixed(0)} €</strong> de plus pour la livraison gratuite !</span>
                </div>
              )}
            </div>

            {/* Total Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Total TTC</span>
              <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary-gold)' }}>{total.toFixed(2)} €</span>
            </div>

            {/* Action Checkout button */}
            <button 
              onClick={handleCheckoutClick}
              className="place-order-btn"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: '700', borderRadius: '30px' }}
            >
              Passer la commande
            </button>

            {/* Secure Payment details */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '1.25rem' }}>
              <ShieldCheck size={16} style={{ color: 'var(--success)' }} />
              <span>Paiement sécurisé et chiffré par SSL</span>
            </div>
          </div>
        </div>
      )}

      {/* Embedded CSS grid media queries specific to this layout */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 992px) {
          .cart-grid-responsive {
            display: grid !important;
            grid-template-columns: 2fr 1fr !important;
          }
        }
        @media (max-width: 991px) {
          .cart-grid-responsive {
            display: flex !important;
            flex-direction: column !important;
          }
        }
      `}} />
    </div>
  );
}
