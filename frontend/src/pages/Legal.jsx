import React from 'react';

export default function Legal() {
  return (
    <div className="legal-page" style={{ padding: '3rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--primary-green)', paddingBottom: '0.5rem' }}>Mentions Légales & Confidentialité</h1>
      
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>1. Éditeur du Site</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '0.5rem' }}>
          Ce site est édité par <strong>Madame NGWESSITCHEU JUDITH</strong>, distributeur indépendant pour Dynace Global.
        </p>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginLeft: '1.5rem' }}>
          <li><strong>Adresse :</strong> 78300 Poissy, Yvelines, France</li>
          <li><strong>Email :</strong> dynaceglobal@gmail.com</li>
          <li><strong>Immatriculation :</strong> [SIRET en cours d'attribution]</li>
        </ul>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>2. Hébergement</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Ce site est hébergé par <strong>Vercel Inc. et Render (Backend)</strong>.<br />
        </p>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>3. Propriété Intellectuelle</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Les marques, logos, images et descriptions des produits <strong>Dynace Global</strong> (Rocenta, DynaFuel, etc.) appartiennent à <em>Dynamic Ace Global Sdn. Bhd</em>. Les autres contenus textuels et visuels de ce site sont la propriété exclusive de l'éditeur du site ou utilisés avec autorisation.
        </p>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>4. Politique de Confidentialité (RGPD)</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1rem' }}>
          Nous nous engageons à protéger vos données personnelles. Les informations recueillies lors de la création d'un compte ou d'une commande (nom, adresse, email) sont strictement utilisées pour le traitement et le suivi de vos achats.
        </p>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Vos droits :</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de portabilité et de suppression de vos données. Pour exercer ce droit, veuillez nous contacter à l'adresse e-mail mentionnée ci-dessus.
        </p>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>5. Cookies</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Ce site utilise des cookies strictement nécessaires à son fonctionnement (gestion du panier, session de connexion) et potentiellement des cookies de mesure d'audience anonyme. En naviguant sur ce site, vous acceptez l'utilisation de ces cookies fonctionnels.
        </p>
      </section>
    </div>
  );
}
