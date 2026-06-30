import React from 'react';
import { Target, Heart, Award, Users, Globe, ShieldCheck } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="about-page" style={{ padding: '2rem 0' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          À propos de <span style={{ color: 'var(--primary-green)' }}>Dynace Global</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
          Devenir l'As de votre propre vie. Nous combinons l'excellence scientifique, la nature et l'opportunité pour transformer des vies à travers le monde.
        </p>
      </section>

      {/* Origines Section */}
      <section style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '3rem',
        marginBottom: '5rem',
        alignItems: 'center'
      }}>
        <div style={{ padding: '2rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px' }}>
          <Globe size={40} style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Notre Histoire</h2>
          <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }}>
            Fondée le <strong>15 Janvier 2023</strong> en Malaisie, Dynace Global est née de la vision de notre fondateur, <strong>Harry Tee</strong>. Fort de son expérience d'entrepreneur et de "Venture Capitalist", il a imaginé une plateforme mondiale capable de lier une santé optimale à une véritable indépendance financière. En seulement quelques années, notre réseau s'est étendu dans plus de 60 pays.
          </p>
        </div>
        
        <div style={{ padding: '2rem', backgroundColor: 'var(--primary-green)', color: 'white', borderRadius: '16px' }}>
          <Target size={40} style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'white' }}>Notre Mission</h2>
          <p style={{ lineHeight: '1.7', color: 'rgba(255,255,255,0.9)' }}>
            Notre mission est claire : améliorer de manière mesurable la santé et le bien-être des communautés, tout en leur offrant une opportunité d'émancipation financière sans précédent. Nous concevons des produits de pointe pour soutenir la vitalité, et un modèle de distribution qui récompense le mérite et le partage.
          </p>
        </div>
      </section>

      {/* Valeurs Section */}
      <section>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '3rem' }}>Nos Valeurs Fondamentales</h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '2rem' 
        }}>
          {/* Valeur 1 */}
          <div style={{ textAlign: 'center', padding: '2rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: 'rgba(197, 168, 128, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                <ShieldCheck size={32} style={{ color: 'var(--accent-gold)' }} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Intégrité & Éthique</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Nous opérons avec une transparence et une honnêteté totales sur tous les marchés mondiaux, garantissant des produits sûrs et un modèle d'affaires équitable.
            </p>
          </div>

          {/* Valeur 2 */}
          <div style={{ textAlign: 'center', padding: '2rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: 'rgba(34, 139, 34, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                <Users size={32} style={{ color: 'var(--primary-green)' }} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Culture Collaborative</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Le succès chez Dynace Global se bâtit ensemble. Nous favorisons le respect mutuel, l'esprit d'équipe et la confiance pour aider chacun à s'épanouir.
            </p>
          </div>

          {/* Valeur 3 */}
          <div style={{ textAlign: 'center', padding: '2rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: 'rgba(197, 168, 128, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                <Heart size={32} style={{ color: 'var(--accent-gold)' }} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Excellence Holistique</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Nous ne ciblons pas seulement la santé physique, mais un équilibre de vie total où nos membres atteignent également une véritable indépendance financière.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        marginTop: '5rem', 
        padding: '4rem 2rem', 
        backgroundColor: 'var(--bg-secondary)', 
        borderRadius: '16px',
        textAlign: 'center'
      }}>
        <Award size={48} style={{ color: 'var(--accent-gold)', margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Rejoignez le Mouvement</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
          Que vous soyez à la recherche de produits premium pour optimiser votre vitalité ou d'une opportunité pour transformer votre carrière, la famille Dynace Global vous ouvre ses portes.
        </p>
      </section>
    </div>
  );
}
