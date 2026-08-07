import React, { useState } from 'react';
import { Mail, Send, Globe } from 'lucide-react';

export default function Footer({ setCurrentTab }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (email) {
      try {
        const res = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        if (res.ok) {
          setSubscribed(true);
          setEmail('');
        }
      } catch (err) {
        console.error("Erreur d'inscription à la newsletter :", err);
      }
    }
  };

  return (
    <footer className="professional-footer">
      <div className="footer-newsletter">
        <div className="newsletter-content">
          <h3>Rejoignez notre Newsletter</h3>
          <p>Recevez nos conseils santé, nos nouveautés et des offres exclusives directement dans votre boîte mail.</p>
        </div>
        <form className="newsletter-form" onSubmit={handleSubscribe}>
          {subscribed ? (
            <div className="newsletter-success">Merci pour votre inscription !</div>
          ) : (
            <>
              <input 
                type="email" 
                placeholder="Votre adresse e-mail" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
              <button type="submit"><Send size={18} /></button>
            </>
          )}
        </form>
      </div>

      <div className="footer-main">
        <div className="footer-col brand-col">
          <img src="/images/logo.svg" alt="Dynace Global" className="footer-logo" />
          <p className="footer-tagline">Distributeur Indépendant Agréé.<br/>Découvrez le secret de la vitalité cellulaire et devenez l'As de votre propre vie.</p>
          <div className="footer-socials" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <a href="https://www.facebook.com/dynaceglobalofficial/" target="_blank" rel="noopener noreferrer" className="social-link-btn" title="Facebook Officiel">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="https://www.instagram.com/dynaceglobalofficial/?__coig_restricted=1" target="_blank" rel="noopener noreferrer" className="social-link-btn" title="Instagram Officiel">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://www.youtube.com/@DynamicAceGlobalOfficial" target="_blank" rel="noopener noreferrer" className="social-link-btn" title="YouTube Officiel">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@dynaceglobalofficial?_t=8fGpR2xsxjr&_r=1" target="_blank" rel="noopener noreferrer" className="social-link-btn" title="TikTok Officiel">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Boutique</h4>
          <a onClick={() => setCurrentTab('home')}>Tous les produits</a>
          <a onClick={() => setCurrentTab('home')}>Nouveautés</a>
          <a onClick={() => setCurrentTab('home')}>Meilleures Ventes</a>
        </div>

        <div className="footer-col">
          <h4>Liens Utiles</h4>
          <a onClick={() => setCurrentTab('about')}>À propos de Dynace</a>
          <a onClick={() => setCurrentTab('faq-health')}>Guide &amp; FAQ Santé (Dr. RAJ)</a>
          <a onClick={() => setCurrentTab('contact')}>Contact &amp; Assistance</a>
          <a onClick={() => setCurrentTab('track')}>Suivre ma commande</a>
        </div>

        <div className="footer-col">
          <h4>Informations Légales</h4>
          <a onClick={() => setCurrentTab('terms')}>Conditions Générales de Vente</a>
          <a onClick={() => setCurrentTab('legal')}>Mentions Légales & RGPD</a>
          <div className="payment-methods">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', marginTop: '1rem' }}>Paiement 100% Sécurisé</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {/* Fake payment icons using text/css for now or simple SVG icons */}
              <div className="pay-icon">VISA</div>
              <div className="pay-icon">Mastercard</div>
              <div className="pay-icon">Stripe</div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Dynace Global Distributeur. Tous droits réservés.</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', opacity: 0.85 }}>
          Site créé et développé par{' '}
          <a 
            href="https://johansonweb.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: 'var(--primary-gold)', 
              fontWeight: '600',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Johanson Nzoda
          </a>
        </p>
        <p className="medical-disclaimer" style={{ marginTop: '1rem' }}>
          Les produits vendus sur ce site sont des compléments alimentaires. Ils ne sont pas destinés à diagnostiquer, traiter, guérir ou prévenir une maladie. Consultez un professionnel de santé en cas de doute.
        </p>
      </div>
    </footer>
  );
}
