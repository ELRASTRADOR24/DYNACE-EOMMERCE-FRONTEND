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
        <p className="hero-tagline">Dynace Global | Supplémentation Cellulaire Premium</p>
        <h1 className="hero-title">Optimisez Votre Santé & Vitalité de l'Intérieur</h1>
        <p className="hero-subtitle">
          Découvrez notre gamme exclusive de produits de santé, de bien-être et de soins cellulaires de pointe. Formulés pour régénérer, purifier et dynamiser votre corps au quotidien.
        </p>
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
