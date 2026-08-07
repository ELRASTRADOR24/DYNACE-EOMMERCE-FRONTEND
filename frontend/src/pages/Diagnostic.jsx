import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  RotateCcw, 
  ShoppingCart, 
  Sparkles, 
  Zap, 
  Flame, 
  Shield, 
  Battery, 
  Check, 
  Moon, 
  Sun,
  Activity
} from 'lucide-react';
import OptimizedImage from '../components/OptimizedImage';

const QUESTIONS = [
  {
    id: 1,
    question: "Quel est votre objectif de santé principal ?",
    options: [
      { text: "Régénérer mes cellules, réparer mon organisme et retrouver une santé globale", points: { rocenta: 4, aceguard: 2 }, icon: Sparkles },
      { text: "Équilibre féminin : fermeté silhouette/poitrine, cycles ou ménopause", points: { lyftmax: 4, collagene: 2 }, icon: HeartPulse },
      { text: "Perdre du poids et brûler les graisses (Jour & Nuit)", points: { urbanism: 4, fitmax: 2 }, icon: Flame },
      { text: "Vitalité masculine, endurance, force & santé sexuelle (Hommes)", points: { tripleroot: 4, dynafuel: 2 }, icon: Zap },
      { text: "Renforcer mon système immunitaire, mes poumons & mon foie", points: { aceguard: 4, rocenta: 2 }, icon: Shield }
    ]
  },
  {
    id: 2,
    question: "Comment évaluez-vous votre niveau de fatigue au quotidien ?",
    options: [
      { text: "Je me sens constamment fatigué(e), épuisé(e) au réveil", points: { rocenta: 3, tripleroot: 2 }, icon: Battery },
      { text: "J'ai des coup de barre et une mauvaise régulation du sucre / glycémie", points: { acebrew: 3, aceguard: 2 }, icon: Activity },
      { text: "Je suis actif/active et je souhaite optimiser ma longévité et mon immunité", points: { rocenta: 2, aceguard: 3 }, icon: Zap }
    ]
  },
  {
    id: 3,
    question: "Avez-vous des inconforts physiques ou articulaires réguliers ?",
    options: [
      { text: "Oui, douleurs articulaires, raideurs ou manque de mobilité", points: { rocenta: 3, collagene: 3, aceguard: 2 }, icon: Activity },
      { text: "Oui, insomnies, sautes d'humeur ou bouffées de chaleur (femmes)", points: { lyftmax: 4, collagene: 2 }, icon: Moon },
      { text: "Non, pas de douleurs particulières", points: {}, icon: Check }
    ]
  },
  {
    id: 4,
    question: "Qu'aimeriez-vous sublimer en priorité ?",
    options: [
      { text: "L'éclat et la fermeté de ma peau, le volume des cheveux et ongles", points: { collagene: 4, rocenta: 2 }, icon: Sparkles },
      { text: "Ma silhouette, mon ventre et l'élimination des toxines", points: { urbanism: 4, fitmax: 2 }, icon: Flame },
      { text: "Mon endurance, ma libido et ma vigueur (Hommes)", points: { tripleroot: 4, dynafuel: 2 }, icon: Zap }
    ]
  },
  {
    id: 5,
    question: "Comment qualifiez-vous votre sommeil et votre récupération ?",
    options: [
      { text: "Sommeil agité ou réveils nocturnes fréquents", points: { collagene: 3, rocenta: 3 }, icon: Moon },
      { text: "Sommeil court avec baisse d'énergie dans la journée", points: { acebrew: 2, tripleroot: 2 }, icon: Sun },
      { text: "Bon sommeil mais besoin de détoxification et de vitalité", points: { aceguard: 2, rocenta: 2 }, icon: Check }
    ]
  }
];

export default function Diagnostic({ onAddToCart, onNavigate }) {
  const [products, setProducts] = useState([]);
  const [currentStep, setCurrentStep] = useState(0); // 0: intro, 1-5: questions, 6: results
  const [scores, setScores] = useState({
    rocenta: 0,
    tripleroot: 0,
    aceguard: 0,
    fitmax: 0,
    collagene: 0,
    dynafuel: 0,
    urbanism: 0,
    acebrew: 0
  });
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [recommendedProduct, setRecommendedProduct] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  // Fetch products from database to link real product objects
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Erreur chargement produits quiz :", err));
  }, []);

  const startQuiz = () => {
    setCurrentStep(1);
    setScores({
      rocenta: 0,
      tripleroot: 0,
      aceguard: 0,
      fitmax: 0,
      collagene: 0,
      dynafuel: 0,
      urbanism: 0,
      acebrew: 0,
      lyftmax: 0
    });
    setSelectedAnswers([]);
    setRecommendedProduct(null);
    setAddedToCart(false);
  };

  const handleAnswerSelect = (option) => {
    const updatedAnswers = [...selectedAnswers, option];
    setSelectedAnswers(updatedAnswers);

    // Update scores
    const newScores = { ...scores };
    if (option.points) {
      Object.keys(option.points).forEach(key => {
        if (newScores[key] !== undefined) {
          newScores[key] += option.points[key];
        }
      });
    }
    setScores(newScores);

    if (currentStep < QUESTIONS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate winner
      let winnerId = 'rocenta';
      let maxScore = -1;
      Object.keys(newScores).forEach(key => {
        if (newScores[key] > maxScore) {
          maxScore = newScores[key];
          winnerId = key;
        }
      });

      // Find product object
      const foundProduct = products.find(p => p.id === winnerId) || products.find(p => p.id === 'rocenta');
      setRecommendedProduct(foundProduct || {
        id: "rocenta",
        name: "Dynace Rocenta",
        price: 60,
        image: "/images/rocenta.png",
        summary: "Soutien à la vitalité cellulaire — régénération, hydratation et éclat."
      });
      setCurrentStep(QUESTIONS.length + 1);
    }
  };

  const handleAddToCartClick = () => {
    if (recommendedProduct) {
      onAddToCart(recommendedProduct, 1);
      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    }
  };

  const getPercentage = () => {
    return Math.round((currentStep / QUESTIONS.length) * 100);
  };

  return (
    <div className="diagnostic-page-container">
      <div className="diagnostic-card">
        {/* STEP 0: INTRO SCREEN */}
        {currentStep === 0 && (
          <div style={{ textAlign: 'center' }}>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: '700', 
              color: 'var(--primary-gold)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em',
              border: '1px solid var(--border-color)',
              padding: '0.35rem 1rem',
              borderRadius: '30px',
              display: 'inline-block',
              marginBottom: '1.5rem'
            }}>
              Service Diagnostic
            </span>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Trouvez votre cure personnalisée
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
              Ce diagnostic rapide en 5 questions vous guidera vers le produit Dynace le plus adapté à votre profil et à vos priorités quotidiennes.
            </p>
            <button
              onClick={startQuiz}
              className="place-order-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', width: 'auto', padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: '700' }}
            >
              Commencer le diagnostic <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 1-5: QUESTIONS SCREEN */}
        {currentStep > 0 && currentStep <= QUESTIONS.length && (
          <div>
            {/* Header progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Question {currentStep} sur {QUESTIONS.length}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {getPercentage()}% complété
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden', marginBottom: '2.5rem' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${getPercentage()}%`, 
                  backgroundColor: 'var(--primary-gold)',
                  transition: 'width 0.25s ease'
                }} 
              />
            </div>

            {/* Question Title */}
            <h2 style={{ fontSize: '1.35rem', fontWeight: '700', lineHeight: '1.4', marginBottom: '2rem' }}>
              {QUESTIONS[currentStep - 1].question}
            </h2>

            {/* Options list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {QUESTIONS[currentStep - 1].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(option)}
                  className="diagnostic-option-btn"
                >
                  {option.icon && (
                    <option.icon 
                      size={18} 
                      style={{ 
                        color: 'var(--primary-gold)', 
                        opacity: 0.8,
                        flexShrink: 0
                      }} 
                    />
                  )}
                  <span style={{ flexGrow: 1 }}>{option.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: RESULTS SCREEN */}
        {currentStep > QUESTIONS.length && recommendedProduct && (
          <div style={{ textAlign: 'center' }}>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: '700', 
              color: 'var(--primary-gold)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em',
              border: '1px solid var(--border-color)',
              padding: '0.35rem 1rem',
              borderRadius: '30px',
              display: 'inline-block',
              marginBottom: '1rem'
            }}>
              Recommandation finale
            </span>
            
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '1.5rem' }}>
              Votre profil de cure personnalisé
            </h1>

            {/* Product card recommendation */}
            <div className="diagnostic-result-box">
              <div style={{ width: '120px', height: '120px', overflow: 'hidden' }}>
                <OptimizedImage 
                  src={recommendedProduct.image} 
                  alt={recommendedProduct.name} 
                  size="thumb"
                />
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                  {recommendedProduct.name}
                </h3>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-gold)' }}>
                  {recommendedProduct.price}.00 €
                </span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.75rem', lineHeight: '1.5' }}>
                  {recommendedProduct.summary}
                </p>
              </div>

              {/* Rationale Bullet points */}
              <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pourquoi ce choix vous correspond :
                </h4>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {recommendedProduct.id === 'rocenta' && (
                    <>
                      <li>Contribue à la préservation de l'éclat de la peau et à sa fermeté.</li>
                      <li>Soulage et fortifie le confort des articulations.</li>
                      <li>Aide à réguler le repos et la qualité générale du sommeil.</li>
                    </>
                  )}
                  {recommendedProduct.id === 'tripleroot' && (
                    <>
                      <li>Soutient la vitalité générale et l'endurance physique.</li>
                      <li>Favorise la résistance à la fatigue physique et nerveuse.</li>
                      <li>Améliore la circulation sanguine et l'énergie globale.</li>
                    </>
                  )}
                  {recommendedProduct.id === 'fitmax' && (
                    <>
                      <li>Aide au contrôle du poids et au métabolisme des graisses.</li>
                      <li>Favorise la régulation de l'appétit et évite le stockage.</li>
                      <li>Apporte un soutien énergétique durant les phases de perte de poids.</li>
                    </>
                  )}
                  {recommendedProduct.id === 'aceguard' && (
                    <>
                      <li>Participe à la protection antioxydante des cellules.</li>
                      <li>Soutient le système immunitaire au quotidien.</li>
                      <li>Favorise une respiration et un métabolisme sains.</li>
                    </>
                  )}
                  {recommendedProduct.id !== 'rocenta' && recommendedProduct.id !== 'tripleroot' && recommendedProduct.id !== 'fitmax' && recommendedProduct.id !== 'aceguard' && (
                    <>
                      <li>Formule ciblée selon votre objectif principal de bien-être.</li>
                      <li>Soutient le fonctionnement équilibré de l'organisme.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
              <button
                onClick={handleAddToCartClick}
                className="place-order-btn"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.8rem', 
                  width: '100%', 
                  padding: '0.85rem', 
                  fontSize: '0.95rem', 
                  fontWeight: '700',
                  backgroundColor: addedToCart ? 'var(--success)' : 'var(--primary-gold)'
                }}
              >
                {addedToCart ? (
                  <>Cure ajoutée au panier ✓</>
                ) : (
                  <>
                    <ShoppingCart size={16} /> Ajouter au panier
                  </>
                )}
              </button>

              <button
                onClick={startQuiz}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: 'none',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <RotateCcw size={14} /> Recommencer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
