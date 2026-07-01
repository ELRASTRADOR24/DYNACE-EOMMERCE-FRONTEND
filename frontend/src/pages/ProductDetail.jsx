import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, FlameKindling, ShoppingBag, CreditCard, Minus, Plus, ImageOff, Star } from 'lucide-react';

export default function ProductDetail({ product, onBack, onAddToCart, onBuyNow, currentUser, onOpenAuth }) {
  const [activeImage, setActiveImage] = useState(product?.image || "");
  const [quantity, setQuantity] = useState(1);

  // États pour la gestion des avis
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [newVideo, setNewVideo] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fetchReviews = async () => {
    if (!product?.id) return;
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      } else {
        setReviewsError("Impossible de charger les avis.");
      }
    } catch (err) {
      console.error("Erreur de chargement des avis :", err);
      setReviewsError("Erreur réseau lors du chargement des avis.");
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (!product) return;
    setActiveImage(product.image || "");
    setQuantity(1); // Réinitialise la quantité au chargement du produit
    fetchReviews(); // Charge les avis du produit
  }, [product]);

  if (!product) return null;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitLoading(true);
    setSubmitError(null);

    const token = localStorage.getItem('dynace_jwt');
    if (!token) {
      setSubmitError("Veuillez vous connecter pour soumettre un avis.");
      setSubmitLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('rating', newRating);
      formData.append('comment', newComment);
      if (newVideo) {
        formData.append('video', newVideo);
      }

      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        setNewComment("");
        setNewRating(5);
        setNewVideo(null);
        // Re-fetch reviews to get the new one and trigger parent to update product avgRating
        fetchReviews();
      } else {
        const errData = await res.json();
        setSubmitError(errData.error || "Impossible d'enregistrer votre avis.");
      }
    } catch (err) {
      console.error("Erreur soumission avis :", err);
      setSubmitError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setSubmitLoading(false);
    }
  };

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
            <span className="detail-price" style={{ margin: 0 }}>{product.price.toFixed(2)} €</span>
            {product.stock !== undefined && product.stock <= 0 ? (
              <span style={{
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger)',
                padding: '0.25rem 0.75rem',
                borderRadius: '50px',
                fontSize: '0.85rem',
                fontWeight: '600',
                border: '1px solid var(--danger)'
              }}>
                Rupture de Stock
              </span>
            ) : (
              <span style={{
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success)',
                padding: '0.25rem 0.75rem',
                borderRadius: '50px',
                fontSize: '0.85rem',
                fontWeight: '600',
                border: '1px solid var(--success)'
              }}>
                En stock ({product.stock !== undefined ? product.stock : 50} disponibles)
              </span>
            )}
          </div>
          
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
          {!(product.stock !== undefined && product.stock <= 0) && (
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
          )}

          {/* Boutons d'achats */}
          <div className="detail-actions">
            <button 
              className="add-cart-large-btn"
              onClick={() => !(product.stock !== undefined && product.stock <= 0) && onAddToCart(product, quantity)}
              disabled={product.stock !== undefined && product.stock <= 0}
              style={product.stock !== undefined && product.stock <= 0 ? {
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                cursor: 'not-allowed',
                border: '1px solid var(--border-color)',
                opacity: 0.6
              } : {}}
            >
              <ShoppingBag size={18} />
              <span>{product.stock !== undefined && product.stock <= 0 ? 'Épuisé' : 'Ajouter au panier'}</span>
            </button>
            <button 
              className="buy-now-btn"
              onClick={() => !(product.stock !== undefined && product.stock <= 0) && onBuyNow(product, quantity)}
              disabled={product.stock !== undefined && product.stock <= 0}
              style={product.stock !== undefined && product.stock <= 0 ? {
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                cursor: 'not-allowed',
                border: '1px solid var(--border-color)',
                opacity: 0.6,
                boxShadow: 'none'
              } : {}}
            >
              <CreditCard size={18} />
              <span>{product.stock !== undefined && product.stock <= 0 ? 'Rupture de stock' : 'Acheter immédiatement'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION DES AVIS CLIENTS */}
      <div className="detail-reviews-section">
        <h2 className="reviews-section-title">Avis de la Communauté</h2>
        
        <div className="reviews-summary-layout">
          {/* Note Moyenne Globale */}
          <div className="reviews-average-card">
            <span className="average-num">{product.avgRating ? product.avgRating.toFixed(1) : "0.0"}</span>
            <div className="average-stars">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={20} 
                  fill={i < Math.round(product.avgRating || 0) ? 'var(--accent-gold)' : 'none'} 
                  stroke={i < Math.round(product.avgRating || 0) ? 'var(--accent-gold)' : 'var(--text-secondary)'} 
                />
              ))}
            </div>
            <span className="average-count">Basé sur {reviews.length} {reviews.length > 1 ? 'avis' : 'avis'}</span>
          </div>

          {/* Formulaire de rédaction d'avis */}
          <div className="reviews-form-card">
            <h3>Laisser un avis</h3>
            {currentUser ? (
              <form onSubmit={handleReviewSubmit} className="review-submit-form">
                <div className="form-group-review">
                  <label className="rating-label">Votre note :</label>
                  <div className="interactive-stars">
                    {[...Array(5)].map((_, i) => {
                      const starVal = i + 1;
                      return (
                        <button
                          type="button"
                          key={i}
                          className="star-interactive-btn"
                          onClick={() => setNewRating(starVal)}
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          aria-label={`Noter ${starVal} sur 5`}
                        >
                          <Star 
                            size={24}
                            fill={(hoverRating || newRating) >= starVal ? 'var(--accent-gold)' : 'none'}
                            stroke={(hoverRating || newRating) >= starVal ? 'var(--accent-gold)' : 'var(--text-secondary)'}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group-review">
                  <label htmlFor="review-comment" className="comment-label">Votre commentaire :</label>
                  <textarea
                    id="review-comment"
                    className="review-textarea"
                    rows="4"
                    placeholder="Partagez votre expérience avec ce produit, ses bienfaits..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="form-group-review">
                  <label htmlFor="review-video" className="comment-label">Joindre une vidéo (optionnel) :</label>
                  <input
                    type="file"
                    id="review-video"
                    accept="video/*"
                    onChange={(e) => setNewVideo(e.target.files[0])}
                    style={{ marginTop: '0.5rem', width: '100%' }}
                  />
                  {newVideo && <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem'}}>Vidéo sélectionnée : {newVideo.name}</span>}
                </div>

                {submitError && <div className="review-submit-error">{submitError}</div>}
                
                <button 
                  type="submit" 
                  className="submit-review-btn" 
                  disabled={submitLoading || !newComment.trim()}
                >
                  {submitLoading ? "Enregistrement..." : "Publier mon avis"}
                </button>
              </form>
            ) : (
              <div className="review-login-prompt">
                <p>Vous devez être connecté pour écrire un commentaire.</p>
                <button onClick={onOpenAuth} className="login-prompt-btn">
                  Se connecter / S'inscrire
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Liste des avis */}
        <div className="reviews-list-container">
          <h3 className="list-title">Commentaires récents ({reviews.length})</h3>
          
          {reviewsLoading ? (
            <div className="reviews-loader">Chargement des avis...</div>
          ) : reviewsError ? (
            <div className="reviews-error-msg">{reviewsError}</div>
          ) : reviews.length === 0 ? (
            <p className="no-reviews-msg">Aucun avis n'a encore été publié. Soyez le premier à partager votre expérience !</p>
          ) : (
            <div className="reviews-feed">
              {reviews.map((rev) => (
                <div className="review-feed-item" key={rev._id || rev.id}>
                  <div className="review-feed-header">
                    <div className="reviewer-info-meta">
                      <span className="reviewer-name-feed">{rev.name}</span>
                      <span className="review-date-feed">
                        {new Date(rev.created_at || rev.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="review-feed-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          fill={i < rev.rating ? 'var(--accent-gold)' : 'none'} 
                          stroke={i < rev.rating ? 'var(--accent-gold)' : 'var(--text-secondary)'} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="review-feed-comment">"{rev.comment}"</p>
                  {rev.video_url && (
                    <div style={{ marginTop: '0.75rem', borderRadius: '8px', overflow: 'hidden' }}>
                      <video src={rev.video_url} controls style={{ width: '100%', maxHeight: '300px', backgroundColor: '#000' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom CTA for Mobile */}
      {!(product.stock !== undefined && product.stock <= 0) && (
        <div className="sticky-mobile-cta">
          <div className="sticky-cta-info">
            <span className="sticky-product-name">{product.name}</span>
            <span className="sticky-product-price">{product.price.toFixed(2)} €</span>
          </div>
          <button 
            className="sticky-add-btn"
            onClick={() => onAddToCart(product, quantity)}
          >
            <ShoppingBag size={16} />
            <span>Ajouter</span>
          </button>
        </div>
      )}
    </div>
  );
}
