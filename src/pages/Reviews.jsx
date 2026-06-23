import React, { useState, useRef } from 'react';
import { Star, Play, Pause } from 'lucide-react';
import { reviews } from '../data/products';

export default function Reviews() {
  const [playingId, setPlayingId] = useState(null);
  const videoRefs = useRef({});

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
    <div>
      <div className="reviews-title-section">
        <span className="detail-category" style={{ display: 'block', marginBottom: '0.5rem' }}>La voix de nos clients</span>
        <h1 className="reviews-title">Avis & Témoignages Vidéo</h1>
        <p className="reviews-subtitle">
          Parce que nos clients parlent le mieux de l'efficacité de nos produits, découvrez leurs retours d'expérience et conseils en vidéo.
        </p>
      </div>

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
  );
}
