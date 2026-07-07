import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Search, Plus, ArrowRight, ShieldCheck, Activity, Sparkles } from 'lucide-react';

export default function Home({ products, loadingProducts, onSelectProduct, onAddToCart, onNavigate, searchQuery = '' }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Tous les produits' },
    { id: 'vitalite', label: 'Vitalité & Santé' },
    { id: 'energie', label: 'Énergie & Force' },
    { id: 'minceur', label: 'Minceur & Détox' },
    { id: 'beaute', label: 'Beauté & Soins' }
  ];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleExploreClick = () => {
    const filterBar = document.querySelector('.filter-bar');
    if (filterBar) {
      filterBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      <section className="hero-section">
        <div className="hero-badge">
          <span>Distributeur Officiel Dynace Global</span>
        </div>
        
        <h1 className="hero-title">
          Réactivez votre <span>vitalité</span> à la source.
        </h1>
        
        <p className="hero-subtitle">
          Découvrez la gamme Dynace Global Santé Top : des formules cliniquement étayées à base de cellules souches végétales pour régénérer votre organisme, renforcer vos défenses et révéler votre éclat.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <button className="hero-cta-btn" onClick={handleExploreClick} style={{ margin: 0 }}>
            <span>Découvrir la gamme</span>
            <ArrowRight size={16} />
          </button>
          <button 
            className="hero-cta-btn" 
            onClick={() => onNavigate('diagnostic')}
            style={{ 
              margin: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.03)', 
              border: '1.5px solid var(--primary-gold)', 
              color: 'var(--primary-gold)',
              boxShadow: 'none'
            }}
          >
            <span>Trouver ma cure</span>
          </button>
        </div>
      </section>

      <div className="filter-bar">
        <div className="categories-container">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loadingProducts ? (
        <div className="product-grid">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="product-card skeleton-card" style={{ cursor: 'default' }}>
              <div className="skeleton-image"></div>
              <div className="skeleton-content" style={{ padding: '1.5rem' }}>
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text" style={{ width: '75%' }}></div>
                <div className="skeleton-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                  <div className="skeleton-price"></div>
                  <div className="skeleton-btn"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Aucun produit ne correspond à votre recherche. Essayez d'autres termes ou catégories !
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
            />
          ))}

          {/* Special Coming Soon Card */}
          <article className="product-card" style={{ cursor: 'default' }}>
            <div className="product-img-wrapper" style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--border-color) 100%)', padding: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                <Plus size={36} strokeWidth={1.5} style={{ color: 'var(--primary-green)', marginBottom: '0.5rem', opacity: 0.8 }} />
                <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: '600' }}>Dynace Lab</span>
              </div>
              <span className="product-tag" style={{ backgroundColor: 'var(--accent-gold)', color: 'var(--bg-primary)', fontWeight: 'bold' }}>Bientôt</span>
            </div>
            
            <div className="product-info" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '1rem 0 0 0' }}>
              <h3 className="product-title" style={{ color: 'var(--text-primary)' }}>
                Nouveautés Dynace
              </h3>
              <p className="product-benefits-summary" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
                De nouvelles formules innovantes pour optimiser votre capital cellulaire et votre bien-être global sont actuellement en préparation.
              </p>
              
              <div className="product-footer" style={{ marginTop: 'auto' }}>
                <div className="product-price-container">
                  <span className="product-price-label">Statut</span>
                  <span className="product-price" style={{ color: 'var(--primary-green)', fontWeight: '600' }}>Prochainement</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
