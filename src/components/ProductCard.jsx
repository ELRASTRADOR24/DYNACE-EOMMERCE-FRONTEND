import React from 'react';
import { ShoppingCart } from 'lucide-react';

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
        <span className="product-tag">{product.category}</span>
      </div>
      
      <div className="product-info">
        <h3 className="product-title">
          {product.name}
        </h3>
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
              onAddToCart(product);
            }}
            title="Ajouter au panier"
            aria-label={`Ajouter ${product.name} au panier`}
          >
            <ShoppingCart size={15} />
            <span>Ajouter</span>
          </button>
        </div>
      </div>
    </article>
  );
}
