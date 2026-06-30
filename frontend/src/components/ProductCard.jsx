import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';

export default function ProductCard({ product, onSelect, onAddToCart }) {
  return (
    <article className="product-card" onClick={() => onSelect(product.id)}>
      <div className="product-img-wrapper">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="product-img" 
            loading="lazy"
          />
        ) : (
          <div className="product-img-placeholder">
            <span>Visuel bientôt disponible</span>
          </div>
        )}
        {product.stock !== undefined && product.stock <= 0 ? (
          <span className="product-tag" style={{ backgroundColor: 'var(--danger)', color: 'white' }}>Rupture</span>
        ) : (
          <span className="product-tag">{product.category}</span>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-title">
          {product.name}
        </h3>
        {product.avgRating !== undefined && product.avgRating > 0 && (
          <div className="product-card-rating">
            <Star size={13} fill="var(--accent-gold)" stroke="var(--accent-gold)" style={{ marginRight: '0.25rem' }} />
            <span className="rating-val">{product.avgRating.toFixed(1)}</span>
            <span className="rating-count">({product.reviewCount})</span>
          </div>
        )}
        <p className="product-benefits-summary">
          {product.summary}
        </p>
        
        <div className="product-footer">
          <div className="product-price-container">
            <span className="product-price-label">Prix</span>
            <span className="product-price">{product.price.toFixed(2)} €</span>
          </div>
          <button 
            className="product-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (!(product.stock !== undefined && product.stock <= 0)) {
                onAddToCart(product);
              }
            }}
            disabled={product.stock !== undefined && product.stock <= 0}
            style={product.stock !== undefined && product.stock <= 0 ? {
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              cursor: 'not-allowed',
              border: '1px solid var(--border-color)',
              boxShadow: 'none'
            } : {}}
            title={product.stock !== undefined && product.stock <= 0 ? "Rupture de stock" : "Ajouter au panier"}
            aria-label={product.stock !== undefined && product.stock <= 0 ? `${product.name} est en rupture de stock` : `Ajouter ${product.name} au panier`}
          >
            <ShoppingCart size={15} />
            <span>{product.stock !== undefined && product.stock <= 0 ? 'Épuisé' : 'Ajouter'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
