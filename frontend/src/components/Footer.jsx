import React, { useState } from 'react';
import { Mail, Send, Globe } from 'lucide-react';

export default function Footer({ setCurrentTab }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
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
          <div className="social-links">
            <a href="#" aria-label="Facebook" style={{fontSize: '0.8rem', fontWeight: 'bold'}}>FB</a>
            <a href="#" aria-label="Instagram" style={{fontSize: '0.8rem', fontWeight: 'bold'}}>IG</a>
            <a href="#" aria-label="Twitter" style={{fontSize: '0.8rem', fontWeight: 'bold'}}>X</a>
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
          <a onClick={() => setCurrentTab('contact')}>Contact & FAQ</a>
          <a onClick={() => setCurrentTab('orders')}>Suivre ma commande</a>
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
        <p className="medical-disclaimer">
          Les produits vendus sur ce site sont des compléments alimentaires. Ils ne sont pas destinés à diagnostiquer, traiter, guérir ou prévenir une maladie. Consultez un professionnel de santé en cas de doute.
        </p>
      </div>
    </footer>
  );
}
