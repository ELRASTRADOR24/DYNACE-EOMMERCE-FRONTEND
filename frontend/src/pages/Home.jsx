import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';

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

  return (
    <div>
      <section className="hero-section">
        <p className="hero-tagline">Dynamic Ace Global · Distributeur Agréé</p>
        <h1 className="hero-title">Une approche holistique de la beauté et du bien-être.</h1>
        <p className="hero-subtitle">
          Une sélection de produits naturels formulés avec précision pour soutenir votre vitalité cellulaire, votre équilibre et votre éclat au quotidien.
        </p>
        <div className="hero-disclaimer">
          Complément alimentaire / produit fonctionnel. Ce produit n'est pas destiné à diagnostiquer, traiter, guérir ou prévenir une maladie. Les résultats individuels peuvent varier.
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
        </div>
      )}
    </div>
  );
}
