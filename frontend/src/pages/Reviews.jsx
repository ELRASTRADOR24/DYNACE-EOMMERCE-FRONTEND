import React, { useState, useRef, useEffect } from 'react';
import { Star, Play, Pause, AlertCircle, MessageSquare, CheckCircle } from 'lucide-react';

const getProductName = (id) => {
  const mapping = {
    rocenta: "Dynace Rocenta",
    dynafuel: "Dynace Dynafuel",
    urbanism: "Dynace Urbanism",
    acebrew: "Dynace Ace Brew",
    fitmax: "Dynace FitMax",
    aceguard: "Dynace Ace Guard",
    tripleroot: "Dynace Triple Root Coffee"
  };
  return mapping[id] || id;
};

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

  const allVideoReviews = dbReviews.filter(r => r.video_url).map((r, index) => ({
    id: r._id || `db-vid-${index}`,
    name: r.name,
    stars: r.rating,
    text: r.comment,
    product: getProductName(r.product_id),
    videoUrl: r.video_url
  }));

  return (
    <div className="reviews-page-container">
      <div className="reviews-title-section">
        <span className="detail-category" style={{ display: 'block', marginBottom: '0.5rem' }}>La voix de nos clients</span>
        <h1 className="reviews-title">Avis & Témoignages</h1>
        <p className="reviews-subtitle">
          Parce que nos clients parlent le mieux de l'efficacité de nos compléments alimentaires, découvrez leurs retours d'expérience en vidéo et par écrit.
        </p>
      </div>

      {/* Encouraging CTA Banner */}
      <div className="reviews-cta-banner">
        <div className="reviews-cta-content">
          <h3>📢 Partagez votre expérience en vidéo !</h3>
          <p>
            Vous adorez nos compléments de thérapie cellulaire ? Prenez votre téléphone, filmez un court témoignage de 30 secondes en expliquant vos bienfaits, et postez-le directement depuis la fiche de votre produit préféré pour recevoir un **code promo de -10%** !
          </p>
        </div>
        <a href="/" className="reviews-cta-btn">
          Choisir un produit
        </a>
      </div>

      {/* Vidéo Testimonials */}
      <div className="video-testimonials-section">
        <h2 className="section-subtitle-reviews">Témoignages Vidéo</h2>
        <div className="reviews-grid">
          {allVideoReviews.length === 0 ? (
            <>
              {/* Mockup Card 1 */}
              <div className="review-card mockup-card">
                <div className="video-wrapper mockup-video-wrapper">
                  <div className="mockup-video-overlay-bg"></div>
                  <div className="video-overlay">
                    <div className="play-icon-btn" aria-label="Exemple de vidéo">
                      <Play size={24} fill="currentColor" />
                    </div>
                  </div>
                  <span className="mockup-badge">Exemple d'affichage</span>
                </div>

                <div className="review-card-info">
                  <div className="reviewer-name">
                    <span>Marie L. (Exemple)</span>
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill="var(--accent-gold)" stroke="var(--accent-gold)" />
                      ))}
                    </div>
                  </div>
                  <p className="review-text">"Ceci est un exemple de témoignage vidéo : après 3 semaines d'utilisation quotidienne du Dynace Rocenta, je suis bluffée par l'éclat de ma peau et mon regain d'énergie !"</p>
                  <span className="reviewed-product-badge">Produit : Dynace Rocenta</span>
                </div>
              </div>

              {/* Mockup Card 2 */}
              <div className="review-card mockup-card">
                <div className="video-wrapper mockup-video-wrapper" style={{ background: 'linear-gradient(135deg, #153A89 0%, #00468b 100%)' }}>
                  <div className="mockup-video-overlay-bg" style={{ opacity: 0.25 }}></div>
                  <div className="video-overlay">
                    <div className="play-icon-btn" aria-label="Votre vidéo ici !">
                      <Play size={24} fill="currentColor" />
                    </div>
                  </div>
                  <span className="mockup-badge">Votre vidéo ici</span>
                </div>

                <div className="review-card-info">
                  <div className="reviewer-name">
                    <span>Votre Témoignage ?</span>
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill="var(--accent-gold)" stroke="var(--accent-gold)" />
                      ))}
                    </div>
                  </div>
                  <p className="review-text">"Enregistrez votre propre vidéo depuis votre téléphone ou importez un fichier pour aider notre communauté et obtenir 10% de réduction immédiate."</p>
                  <span className="reviewed-product-badge">Offre : -10% de réduction</span>
                </div>
              </div>
            </>
          ) : (
            allVideoReviews.map((rev) => {
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
            })
          )}
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
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-green)', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '0.25rem' }}>
                      <CheckCircle size={12} /> Achat vérifié
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
                {rev.video_url && (
                  <div style={{ marginTop: '0.75rem', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000', border: '1px solid var(--border-color)' }}>
                    <video 
                      src={rev.video_url} 
                      controls 
                      playsInline 
                      style={{ width: '100%', maxHeight: '200px', display: 'block' }}
                    />
                  </div>
                )}
                <div className="written-card-product-tag">
                  Produit évalué : <span className="product-id-tag">{getProductName(rev.product_id)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
