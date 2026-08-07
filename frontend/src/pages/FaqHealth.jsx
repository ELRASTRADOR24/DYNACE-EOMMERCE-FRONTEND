import React, { useState } from 'react';
import { ShieldCheck, HeartPulse, HelpCircle, AlertTriangle, Sparkles, ChevronDown, ChevronUp, Droplets, Baby, Activity, Pill, UserCheck } from 'lucide-react';

export default function FaqHealth({ onNavigate }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqItems = [
    {
      icon: Activity,
      category: "Effets & Détoxification",
      question: "J'ai de la transpiration, de légers vertiges, des démangeaisons ou courbatures au début. Est-ce normal ?",
      answer: "Oui, c'est ce qu'on appelle la 'Healing Crisis' (réaction positive de détoxification). Lorsque les cellules souches botaniques et les antioxydants purifient les toxines accumulées, votre organisme réagit. Conseils du Dr. RAJ : Consommez le produit 1 jour sur 2 pendant les 10 premiers jours et buvez 2 à 3 litres d'eau par jour. Ces symptômes s'estompent rapidement pour laisser place à une énergie décuplée."
    },
    {
      icon: Baby,
      category: "Grossesse & Allaitement",
      question: "Une femme enceinte ou allaitante peut-elle consommer les produits Dynace ?",
      answer: "Par mesure de précaution médicale, nous recommandons de NE PAS consommer nos produits durant les 9 mois de grossesse (afin d'éviter que des complications naturelles de grossesse ne soient associées à tort aux suppléments). APRÈS l'accouchement : Rocenta est vivement recommandé pour les mères allaitantes. Il améliore la récupération maternelle et la qualité nutritionnelle du lait."
    },
    {
      icon: UserCheck,
      category: "Enfants & Adolescents",
      question: "Quels produits peuvent être donnés aux enfants ?",
      answer: "Dynace Rocenta est le SEUL produit principal recommandé pour les enfants (dès 4-5 ans) pour stimuler la mémoire, la croissance et l'immunité (commencer avec un demi-sachet). Aceguard peut également être administré en demi-sachet. Tous les autres produits (notamment Triple Root Coffee) sont strictement réservés aux adultes."
    },
    {
      icon: Pill,
      category: "Traitements Médicaux",
      question: "Faut-il arrêter ses médicaments de l'hôpital (diabète, hypertension...) ?",
      answer: "Non, jamais ! Ne stoppez aucun traitement prescrit par votre médecin. Consommez vos produits Dynace en parallèle (en espaçant la prise de 20 minutes avec vos médicaments). Au fur et à mesure que votre organisme se régénère et que vos bilans de santé s'améliorent, c'est votre médecin traitant lui-même qui ajustera et réduira vos doses de médicaments."
    },
    {
      icon: HeartPulse,
      category: "Durée des Cures",
      question: "Combien de temps faut-il suivre une cure (fibromes, myomes, arthrite...) ?",
      answer: "Le Dr. Raj préconise une thérapie de 5 mois minimum pour les problèmes chroniques ou articulaires. Une graine ne devient pas un arbre en un jour : votre corps a besoin de temps pour renouveler ses tissus cellulaires et constater des résultats durables."
    },
    {
      icon: Droplets,
      category: "Posologies & Eau",
      question: "Pourquoi est-il important de verser la poudre sous la langue et d'attendre 20 minutes ?",
      answer: "La zone sublinguale (sous la langue) est riche en micro-vaisseaux sanguins. Cela permet aux cellules souches et nutriments d'être absorbés directement dans le sang en 30 secondes à 1 minute, sans être détruits par les sucs gastriques de l'estomac. Attendre 20 minutes sans boire ni manger garantit une assimilation maximale."
    },
    {
      icon: Sparkles,
      category: "Association de Produits",
      question: "Comment prendre 2 ou 3 produits Dynace simultanément ?",
      answer: "Les 2 premières semaines : alternez un produit différent chaque jour (ex: Lundi Rocenta, Mardi Aceguard, Mercredi Collagène). Après 2 semaines : prenez 2 produits par jour. Une fois votre corps habitué (après 1 mois), vous pouvez prendre vos 3 produits quotidiennement (Rocenta le matin à jeun, Aceguard la journée, Collagène la nuit)."
    }
  ];

  return (
    <div style={{ padding: '3rem 1rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: 'var(--primary-green)',
          padding: '0.35rem 0.85rem',
          borderRadius: '50px',
          fontSize: '0.8rem',
          fontWeight: '700',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          Guide Médical &amp; Posologie Officielle
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.75rem', marginBottom: '0.75rem' }}>
          Foire Aux Questions Santé — Dr. RAJ
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
          Retrouvez les conseils, avertissements et recommandations officielles du Dr. Raj (Directeur Médical Dynace Global) pour optimiser vos cures et comprendre les réactions de votre organisme.
        </p>
      </div>

      {/* Warning Box */}
      <div style={{
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        borderLeft: '4px solid var(--accent-gold)',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '2.5rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start'
      }}>
        <AlertTriangle size={24} style={{ color: 'var(--accent-gold)', flexShrink: 0, marginTop: '0.2rem' }} />
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
            Rappel d'Or du Dr. RAJ pour une efficacité maximale :
          </h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.6' }}>
            1. Coupez toujours les sachets avec des <strong>ciseaux</strong> (ne déchirez pas avec les dents).<br />
            2. Pour Rocenta et Collagène, verser la poudre <strong>SOUS la langue</strong> et attendez au moins 20 minutes avant de boire ou manger.<br />
            3. Pour Aceguard, diluer dans 100ml d'eau ambiante (<strong>JAMAIS d'eau chaude</strong>).<br />
            4. Buvez <strong>2 à 3 litres d'eau</strong> par jour pour faciliter la détoxification cellulaire.
          </p>
        </div>
      </div>

      {/* Accordion FAQ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqItems.map((item, index) => {
          const IconComp = item.icon;
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.2s'
              }}
            >
              <button
                onClick={() => toggleFaq(index)}
                style={{
                  width: '100%',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--primary-green)',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComp size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary-green)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {item.category}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.2rem', margin: 0 }}>
                      {item.question}
                    </h3>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={20} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-secondary)' }} />}
              </button>

              {isOpen && (
                <div style={{
                  padding: '0 1.5rem 1.25rem 4.25rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.92rem',
                  lineHeight: '1.7',
                  borderTop: '1px dashed var(--border-color)',
                  paddingTop: '1rem'
                }}>
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA Box */}
      <div style={{
        marginTop: '3.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '2rem'
      }}>
        <HelpCircle size={32} style={{ color: 'var(--primary-green)', marginBottom: '0.75rem' }} />
        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Une question sur votre cure personnelle ?
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
          Notre équipe d'experts distributeurs est disponible pour vous conseiller la combinaison exacte adaptée à vos besoins.
        </p>
        <button
          onClick={() => onNavigate('contact')}
          style={{
            backgroundColor: 'var(--primary-green)',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 1.75rem',
            borderRadius: '10px',
            fontSize: '0.95rem',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)'
          }}
        >
          Contacter notre équipe
        </button>
      </div>
    </div>
  );
}
