import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { Search, Plus, ArrowRight, ShieldCheck, Activity, Sparkles } from 'lucide-react';

const Home = React.memo(function Home({ products, loadingProducts, onSelectProduct, onAddToCart, onNavigate, searchQuery = '', setSearchQuery }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Tous les produits' },
    { id: 'vitalite', label: 'Vitalité & Santé' },
    { id: 'energie', label: 'Énergie & Force' },
    { id: 'minceur', label: 'Minceur & Détox' },
    { id: 'beaute', label: 'Beauté & Soins' }
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = !searchQuery || 
                            product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (product.summary && product.summary.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

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

      {/* Catalog Search Bar */}
      <div className="catalog-search-section">
        <form onSubmit={(e) => {
          e.preventDefault();
          const target = document.querySelector('.product-grid') || document.querySelector('.filter-bar');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }} className="catalog-search-form">
          <div className="catalog-search-input-wrapper">
            <Search size={18} className="catalog-search-icon" />
            <input
              type="text"
              className="catalog-search-input"
              placeholder="Rechercher un complément (ex: Rocenta, Lyftmax...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="catalog-search-clear"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        </form>
      </div>

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

      {loadingProducts && products.length === 0 ? (
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
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
              eager={index < 4}
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

      {/* SECTION DES PACKS DE CURES SPÉCIALISÉES (DR. RAJ) */}
      <section style={{ marginTop: '4rem', marginBottom: '2rem' }}>
        <div style={{ textAlignment: 'center', marginBottom: '2rem', textAlign: 'center' }}>
          <span style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--primary-green)',
            padding: '0.35rem 0.85rem',
            borderRadius: '50px',
            fontSize: '0.8rem',
            fontWeight: '700',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Protocole Médical Officiel Dr. RAJ
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
            Packs &amp; Cures Thérapeutiques Dynace
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '650px', margin: '0 auto' }}>
            Bénéficiez de la synergie maximale des produits combinés pour un soin en profondeur de 5 mois minimum selon les préconisations du Dr. Raj.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {[
            {
              id: 'pack-immunite-globale',
              name: 'Pack Cure Immunité & Santé Globale',
              duration: '5 mois minimum',
              tag: 'Recommandé Dr. RAJ',
              price: 85.00,
              originalPrice: 92.00,
              discount: '-7 €',
              items: [
                { id: 'rocenta', name: 'Dynace Rocenta (Cellules Souches Star)' },
                { id: 'aceguard', name: 'Dynace Ace Guard (Bouclier Immunitaire)' }
              ],
              summary: 'La cure de référence pour la régénération cellulaire profonde, le soutien immunitaire, pulmonaire, gastrique et la prévention globale.',
              badgeColor: 'var(--primary-green)'
            },
            {
              id: 'pack-beaute-femme',
              name: 'Pack Beauté Féminine Intégrale',
              duration: '5 à 6 mois',
              tag: 'Pack Recommandé Femme',
              price: 165.00,
              originalPrice: 180.00,
              discount: '-15 €',
              items: [
                { id: 'rocenta', name: 'Dynace Rocenta' },
                { id: 'lyftmax', name: 'Dynace LyftMax (Estro-G 100®)' },
                { id: 'collagene', name: 'Dynace Collagène Beauté' }
              ],
              summary: 'Le rituel de beauté anti-âge ultime. Raffermit la poitrine et la silhouette, régule les hormones et procure un sommeil réparateur.',
              badgeColor: '#ec4899'
            },
            {
              id: 'pack-vitalite-homme',
              name: 'Pack Vitalité & Performance Masculine',
              duration: 'En continu',
              tag: 'Formule Hommes Adultes',
              price: 112.00,
              originalPrice: 124.00,
              discount: '-12 €',
              items: [
                { id: 'rocenta', name: 'Dynace Rocenta' },
                { id: 'aceguard', name: 'Dynace Ace Guard' },
                { id: 'tripleroot', name: 'Triple Root Coffee' }
              ],
              summary: 'Cure de force et d’endurance masculine. Booste la testostérone, améliore la qualité spermatique (oligospermie) et la vigueur.',
              badgeColor: '#3b82f6'
            },
            {
              id: 'pack-equilibre-diabete',
              name: 'Pack Équilibre Glycémique & Diabète',
              duration: '5 mois minimum',
              tag: 'Contrôle Sucre & Cellules',
              price: 112.00,
              originalPrice: 124.00,
              discount: '-12 €',
              items: [
                { id: 'rocenta', name: 'Dynace Rocenta' },
                { id: 'aceguard', name: 'Dynace Ace Guard' },
                { id: 'acebrew', name: 'Acebrew Coffee (NMN)' }
              ],
              summary: 'Synergie de protection et de régénération pour normaliser la glycémie, protéger le pancréas et stimuler l’énergie propre.',
              badgeColor: 'var(--accent-gold)'
            }
          ].map(pack => (
            <div key={pack.id} style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{
                    backgroundColor: pack.badgeColor,
                    color: '#fff',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '50px',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    {pack.tag}
                  </span>
                  <span style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    Économisez {pack.discount}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {pack.name}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.5' }}>
                  {pack.summary}
                </p>

                <div style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.8rem'
                }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.3rem' }}>Produits inclus dans ce pack :</strong>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {pack.items.map((item, idx) => (
                      <li key={idx}>✓ {item.name}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-green)' }}>
                    {pack.price.toFixed(2)} €
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                    {pack.originalPrice.toFixed(2)} €
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                    Durée : {pack.duration}
                  </span>
                </div>

                <button
                  onClick={() => {
                    pack.items.forEach(item => {
                      const fullProd = products.find(p => p.id === item.id);
                      if (fullProd) {
                        onAddToCart(fullProd, 1);
                      }
                    });
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--primary-green)',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  <Plus size={18} /> Ajouter le Pack complet au panier
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
});

export default Home;
