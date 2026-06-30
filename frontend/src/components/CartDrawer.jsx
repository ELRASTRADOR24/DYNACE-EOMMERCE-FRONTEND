import React from 'react';
import { X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQty, 
  onRemoveItem, 
  onCheckout 
}) {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingThreshold = 60;
  const shippingCost = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 6.90;
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
                  <img src={item.image} alt={item.name} className="cart-item-img" />
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
                {shippingCost === 0 ? (
                  <span style={{ color: 'var(--success)', fontWeight: '600' }}>Gratuite</span>
                ) : (
                  <span>{shippingCost.toFixed(2)} €</span>
                )}
              </div>
              {shippingCost > 0 && (
                <div className="form-hint" style={{ textAlign: 'right', marginTop: '-0.25rem' }}>
                  Livraison gratuite à partir de {shippingThreshold} € (plus {(shippingThreshold - subtotal).toFixed(2)} € restants)
                </div>
              )}
              <div className="totals-row grand-total">
                <span>Total</span>
                <span>{grandTotal.toFixed(2)} €</span>
              </div>
            </div>
            <button 
              className="checkout-btn" 
              onClick={() => {
                onClose();
                onCheckout();
              }}
            >
              Commander <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
