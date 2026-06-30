import React, { useState, useRef, useEffect } from 'react';
import { Star, Play, Pause, AlertCircle, MessageSquare } from 'lucide-react';
import { reviews } from '../data/products';

export default function Reviews() {
  const [playingId, setPlayingId] = useState(null);
  const videoRefs = useRef({});

  // Dynamic reviews states
  const [dbReviews, setDbReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          setDbReviews(data);
        } else {
          setError("Impossible de récupérer les derniers avis.");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des avis :", err);
        setError("Erreur de chargement des avis.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecentReviews();
  }, []);

  const handlePlayToggle = (id) => {
    const video = videoRefs.current[id];
    if (!video) return;

    if (playingId === id) {
      video.pause();
      setPlayingId(null);
    } else {
      // Pause any currently playing video
      if (playingId !== null && videoRefs.current[playingId]) {
        videoRefs.current[playingId].pause();
      }
      video.play();
      setPlayingId(id);
    }
  };

  return (
    <div className="reviews-page-container">
      <div className="reviews-title-section">
        <span className="detail-category" style={{ display: 'block', marginBottom: '0.5rem' }}>La voix de nos clients</span>
        <h1 className="reviews-title">Avis & Témoignages</h1>
        <p className="reviews-subtitle">
          Parce que nos clients parlent le mieux de l'efficacité de nos compléments alimentaires, découvrez leurs retours d'expérience en vidéo et par écrit.
        </p>
      </div>

      {/* Vidéo Testimonials */}
      <div className="video-testimonials-section">
        <h2 className="section-subtitle-reviews">Témoignages Vidéo</h2>
        <div className="reviews-grid">
          {reviews.map((rev) => {
            const isPlaying = playingId === rev.id;
            return (
              <div className="review-card" key={rev.id}>
                <div className="video-wrapper">
                  <video
                    ref={(el) => (videoRefs.current[rev.id] = el)}
                    src={rev.videoUrl}
                    className="review-video"
                    loop
                    playsInline
                    onClick={() => handlePlayToggle(rev.id)}
                  />
                  <div 
                    className="video-overlay" 
                    onClick={() => handlePlayToggle(rev.id)}
                    style={{ opacity: isPlaying ? 0 : 1, transition: 'opacity 0.3s' }}
                  >
                    <button className="play-icon-btn" aria-label="Lire la vidéo de témoignage">
                      {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </button>
                  </div>
                </div>

                <div className="review-card-info">
                  <div className="reviewer-name">
                    <span>{rev.name}</span>
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          fill={i < rev.stars ? 'var(--accent-gold)' : 'none'} 
                          stroke={i < rev.stars ? 'var(--accent-gold)' : 'var(--text-secondary)'} 
                        />
                      ))}
                    </div>
                  </div>

                  <p className="review-text">"{rev.text}"</p>
                  <span className="reviewed-product-badge">Produit : {rev.product}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Client Written Feedbacks Section */}
      <div className="written-reviews-section">
        <h2 className="section-subtitle-reviews">Avis de nos Acheteurs vérifiés</h2>
        
        {loading ? (
          <div className="reviews-feed-loading">
            <div className="animate-spin spinner-ring"></div>
            <p>Chargement des avis récents...</p>
          </div>
        ) : error ? (
          <div className="reviews-feed-error">
            <AlertCircle size={24} style={{ marginRight: '0.5rem', color: 'var(--danger)' }} />
            <span>{error}</span>
          </div>
        ) : dbReviews.length === 0 ? (
          <div className="empty-reviews-feed">
            <MessageSquare size={36} style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }} />
            <p>Aucun commentaire écrit pour le moment. Soyez le premier à noter nos compléments alimentaires sur leur fiche produit !</p>
          </div>
        ) : (
          <div className="written-reviews-grid">
            {dbReviews.map((rev) => (
              <div className="written-review-card" key={rev._id || rev.id}>
                <div className="written-card-header">
                  <span className="reviewer-avatar">{rev.name.charAt(0)}</span>
                  <div className="reviewer-meta-feed">
                    <span className="reviewer-name-feed">{rev.name}</span>
                    <span className="review-date-feed">
                      {new Date(rev.created_at || rev.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="review-stars-feed-card">
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
                <p className="written-card-comment">"{rev.comment}"</p>
                <div className="written-card-product-tag">
                  Produit évalué : <span className="product-id-tag">{rev.product_id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
