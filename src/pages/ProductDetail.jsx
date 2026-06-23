import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, FlameKindling, ShoppingBag, CreditCard, Minus, Plus, ImageOff } from 'lucide-react';

export default function ProductDetail({ product, onBack, onAddToCart, onBuyNow }) {
  if (!product) return null;

  const [activeImage, setActiveImage] = useState(product.image || "");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setActiveImage(product.image || "");
    setQuantity(1); // Réinitialise la quantité au chargement du produit
  }, [product]);

  const hasImages = product.images && product.images.length > 0;
  const isImageEmpty = !product.image || product.image === "";

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  return (
    <div>
      <button 
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontWeight: '500',
          marginBottom: '2rem',
          fontSize: '1rem',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-green)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={18} /> Retour au catalogue
      </button>

      <div className="detail-container">
        {/* Partie gauche : Visuels et Galerie d'images secondaires */}
        <div className="detail-gallery-wrapper">
          {isImageEmpty ? (
            <div className="detail-img-card empty-placeholder">
              <ImageOff size={48} className="placeholder-icon" style={{ color: 'var(--text-secondary)', opacity: 0.6 }} />
              <p className="placeholder-text" style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginTop: '1rem' }}>
                Visuel en cours de finalisation
              </p>
              <span className="placeholder-subtext" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Dynace Global
              </span>
            </div>
          ) : (
            <>
              <div className="detail-img-card">
                <img src={activeImage} alt={product.name} className="detail-img" />
              </div>
              {hasImages && (
                <div className="detail-thumbnails">
                  {product.images.map((img, index) => (
                    <button 
                      key={index}
                      className={`thumbnail-btn ${activeImage === img ? 'active' : ''}`}
                      onClick={() => setActiveImage(img)}
                    >
                      <img src={img} alt={`${product.name} view ${index + 1}`} className="thumbnail-img" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Partie droite : Informations produit et actions */}
        <div className="detail-info">
          <span className="detail-category">{product.category}</span>
          <h1 className="detail-title">{product.name}</h1>
          <span className="detail-price">{product.price.toFixed(2)} €</span>
          
          <div className="detail-divider" />

          <div>
            <h3 className="detail-section-title">Description</h3>
            <p className="detail-description">{product.description}</p>
          </div>

          <div>
            <h3 className="detail-section-title">Propriétés & Bienfaits</h3>
            <div className="benefits-list">
              {product.benefits.map((benefit, i) => (
                <div className="benefit-item" key={i}>
                  <CheckCircle className="benefit-icon" size={18} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-usage-box">
            <FlameKindling style={{ color: 'var(--accent-gold)', flexShrink: 0, marginTop: '0.1rem' }} size={20} />
            <div className="detail-usage-text">
              <strong>Conseil d'utilisation :</strong> {product.usage}
            </div>
          </div>

          <div className="detail-divider" />

          {/* Sélecteur de quantité */}
          <div className="detail-quantity-wrapper">
            <span className="quantity-label">Quantité</span>
            <div className="quantity-selector">
              <button onClick={handleDecrement} aria-label="Diminuer la quantité" className="qty-btn">
                <Minus size={16} />
              </button>
              <span className="qty-value">{quantity}</span>
              <button onClick={handleIncrement} aria-label="Augmenter la quantité" className="qty-btn">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Boutons d'achats */}
          <div className="detail-actions">
            <button 
              className="add-cart-large-btn"
              onClick={() => onAddToCart(product, quantity)}
            >
              <ShoppingBag size={18} />
              <span>Ajouter au panier</span>
            </button>
            <button 
              className="buy-now-btn"
              onClick={() => onBuyNow(product, quantity)}
            >
              <CreditCard size={18} />
              <span>Acheter immédiatement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
