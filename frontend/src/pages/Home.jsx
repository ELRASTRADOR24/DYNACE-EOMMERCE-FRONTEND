import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Search, Plus, ArrowRight, ShieldCheck, Activity, Sparkles } from 'lucide-react';

export default function Home({ products, onSelectProduct, onAddToCart }) {
  const [search, setSearch] = useState('');
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
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                          product.summary.toLowerCase().includes(search.toLowerCase());
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
          Des formules cliniquement étayées à base de cellules souches végétales pour régénérer votre organisme, renforcer vos défenses et révéler votre éclat.
        </p>
        
        <button className="hero-cta-btn" onClick={handleExploreClick}>
          <span>Découvrir la gamme</span>
          <ArrowRight size={16} />
        </button>

        <div className="hero-pills">
          <div className="hero-pill">
            <ShieldCheck size={14} style={{ color: 'var(--primary-green)' }} />
            <span>Régénération Cellulaire</span>
          </div>
          <div className="hero-pill">
            <Activity size={14} style={{ color: 'var(--accent-gold)' }} />
            <span>Énergie & Tonus</span>
          </div>
          <div className="hero-pill">
            <Sparkles size={14} style={{ color: 'var(--primary-green)' }} />
            <span>Beauté & Éclat</span>
          </div>
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

        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
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
