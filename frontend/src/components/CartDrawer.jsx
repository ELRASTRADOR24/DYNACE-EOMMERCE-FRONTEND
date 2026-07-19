import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQty, 
  onRemoveItem, 
  onCheckout,
  onViewCart 
}) {
  const [shippingThreshold, setShippingThreshold] = useState(999999);
  const [shippingCostBase, setShippingCostBase] = useState(10.50);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings/shipping')
        .then(res => res.json())
        .then(data => {
          if (data.threshold !== undefined) setShippingThreshold(data.threshold);
          if (data.cost !== undefined) setShippingCostBase(data.cost);
        })
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = subtotal === 0 ? 0 : shippingCostBase;
  const grandTotal = subtotal + shippingCost;

  return (
    <>
      <div 
        className={`cart-drawer-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2 className="cart-title">Votre Panier</h2>
          <button 
            className="close-drawer-btn" 
            onClick={onClose}
            aria-label="Fermer le panier"
          >
            <X size={20} />
          </button>
        </div>

        <div className="cart-items-list">
          {cartItems.length === 0 ? (
            <p className="empty-cart-message">Votre panier est encore vide. Explorez nos herbes médicinales pour le remplir !</p>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-img-wrapper">
                  <OptimizedImage src={item.image} alt={item.name} size="thumb" className="cart-item-img" />
                </div>
                <div className="cart-item-details">
                  <h4 className="cart-item-title">{item.name}</h4>
                  <span className="cart-item-price">{(item.price * item.quantity).toFixed(2)} €</span>
                  <div className="cart-item-controls">
                    <button 
                      className="qty-btn" 
                      onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                      aria-label="Diminuer la quantité"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="qty-val">{item.quantity}</span>
                    <button 
                      className="qty-btn" 
                      onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                      aria-label="Augmenter la quantité"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <button 
                  className="remove-item-btn" 
                  onClick={() => onRemoveItem(item.id)}
                  title="Retirer l'article"
                  aria-label={`Retirer ${item.name} du panier`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-totals">
              <div className="totals-row">
                <span>Sous-total</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="totals-row">
                <span>Livraison</span>
                <span>{shippingCost.toFixed(2)} €</span>
              </div>

              <div className="totals-row grand-total">
                <span>Total</span>
                <span>{grandTotal.toFixed(2)} €</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button 
                className="checkout-btn" 
                style={{ 
                  backgroundColor: 'transparent', 
                  border: '1.5px solid var(--primary-gold)', 
                  color: 'var(--primary-gold)',
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.8rem',
                  borderRadius: '30px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  flex: 1
                }}
                onClick={() => {
                  onClose();
                  onViewCart();
                }}
              >
                Panier
              </button>
              <button 
                className="checkout-btn" 
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                style={{ flex: 1, padding: '0.8rem', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                Commander <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
