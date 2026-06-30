import React from 'react';

export default function Terms() {
  return (
    <div className="terms-page" style={{ padding: '3rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--primary-green)', paddingBottom: '0.5rem' }}>Conditions Générales de Vente (CGV)</h1>
      
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>1. Objet</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Les présentes Conditions Générales de Vente visent à définir les relations contractuelles entre le vendeur (ci-après désigné "le Distributeur", Madame NGWESSITCHEU JUDITH) et l'acheteur, ainsi que les conditions applicables à tout achat effectué par le biais de ce site e-commerce.
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>2. Produits et Disponibilité</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Les compléments alimentaires et produits proposés sont ceux qui figurent sur le catalogue publié dans le site, dans la limite des stocks disponibles. Chaque produit est accompagné d'un descriptif. Il est rappelé que ces produits ne sont pas destinés à diagnostiquer, traiter, guérir ou prévenir une maladie.
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>3. Tarifs et Paiement</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '0.5rem' }}>
          Les prix figurant sur le site sont des prix en Euros (€) toutes taxes comprises (TTC). Le vendeur se réserve le droit de modifier ses prix à tout moment. 
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Le paiement est exigible immédiatement à la commande. Le règlement sécurisé en ligne s'effectue par carte bancaire via le prestataire Stripe.
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>4. Livraison</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Les livraisons sont faites à l'adresse indiquée sur le bon de commande. Les risques sont à la charge de l'acquéreur à compter du moment où les produits ont quitté les locaux du vendeur ou de ses prestataires. En cas de dommage pendant le transport, la protestation motivée doit être formulée auprès du transporteur.
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>5. Droit de Rétractation et Retours</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Conformément à la législation en vigueur, l'acheteur dispose d'un délai de 14 jours à compter de la livraison de sa commande pour exercer son droit de rétractation et faire retour du produit au vendeur pour échange ou remboursement sans pénalité. <br /><br />
          <strong>Attention :</strong> Pour des raisons d'hygiène et de sécurité sanitaire, seuls les produits non ouverts (scellés), dans leur emballage d'origine et en parfait état seront repris et remboursés.
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>6. Litiges</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Les présentes conditions de vente en ligne sont soumises à la loi du pays où siège le distributeur. En cas de litige, la compétence est attribuée aux tribunaux compétents du ressort du siège social du vendeur.
        </p>
      </section>
    </div>
  );
}
