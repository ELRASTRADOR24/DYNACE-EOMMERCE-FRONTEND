import React, { useState, useEffect } from 'react';
import { ArrowRight, RotateCcw, ShoppingCart } from 'lucide-react';

const QUESTIONS = [
  {
    id: 1,
    question: "Quel est votre objectif principal ?",
    options: [
      { text: "Améliorer l'aspect de ma peau et ralentir les signes de l'âge", points: { rocenta: 3, collagene: 2 } },
      { text: "Retrouver de l'énergie physique, de la force et du tonus", points: { tripleroot: 3, dynafuel: 2 } },
      { text: "Perdre du poids et affiner ma silhouette", points: { fitmax: 3, urbanism: 2 } },
      { text: "Renforcer ma santé globale et mes défenses naturelles", points: { aceguard: 3, acebrew: 1 } }
    ]
  },
  {
    id: 2,
    question: "Comment évaluez-vous votre niveau de fatigue au quotidien ?",
    options: [
      { text: "Je me sens constamment fatigué(e) ou épuisé(e)", points: { rocenta: 2, tripleroot: 2 } },
      { text: "J'ai des baisses d'énergie régulières, notamment après les repas", points: { fitmax: 1, acebrew: 2 } },
      { text: "Je me sens généralement en forme, mais je souhaite optimiser mes capacités", points: { tripleroot: 3, dynafuel: 2 } }
    ]
  },
  {
    id: 3,
    question: "Ressentez-vous régulièrement des douleurs physiques (muscles ou articulations) ?",
    options: [
      { text: "Oui, j'ai souvent des douleurs ou des raideurs physiques", points: { rocenta: 3, collagene: 2 } },
      { text: "Non, je n'ai pas de douleurs particulières", points: {} }
    ]
  },
  {
    id: 4,
    question: "Qu'aimeriez-vous améliorer en priorité ?",
    options: [
      { text: "L'éclat et la fermeté de ma peau, ou la force de mes cheveux", points: { rocenta: 2, collagene: 3 } },
      { text: "Mon poids, ma digestion et l'élimination des toxines", points: { fitmax: 3, urbanism: 2 } },
      { text: "Mon endurance et mes performances lors d'efforts physiques", points: { tripleroot: 2, dynafuel: 3 } }
    ]
  },
  {
    id: 5,
    question: "Comment décririez-vous la qualité de votre sommeil ?",
    options: [
      { text: "Difficile : je dors mal ou je me réveille souvent la nuit", points: { rocenta: 3, aceguard: 1 } },
      { text: "Moyenne : je dors mais je me réveille fatigué(e) le matin", points: { tripleroot: 2, acebrew: 1 } },
      { text: "Bonne : je dors bien et je me sens reposé(e)", points: {} }
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
      acebrew: 0
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
    <div className="contact-container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div 
        style={{
          width: '100%',
          maxWidth: '650px',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-premium)',
          color: 'var(--text-primary)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
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
                  style={{
                    width: '100%',
                    padding: '1.1rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.04)';
                    e.currentTarget.style.borderColor = 'var(--primary-gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  {option.text}
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
            <div 
              style={{
                background: 'rgba(0, 0, 0, 0.1)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '2rem',
                marginBottom: '2rem',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem'
              }}
            >
              <img 
                src={recommendedProduct.image} 
                alt={recommendedProduct.name} 
                style={{ width: '120px', height: '120px', objectFit: 'contain' }} 
              />
              
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
