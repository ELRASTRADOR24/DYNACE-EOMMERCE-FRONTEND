import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, RotateCcw, ShoppingCart, CheckCircle, Shield, Heart, Zap } from 'lucide-react';

const QUESTIONS = [
  {
    id: 1,
    question: "Quel est votre objectif de santé principal ?",
    options: [
      { text: "Régénérer mes cellules & ralentir le vieillissement", points: { rocenta: 3, collagene: 1 }, icon: "🌱" },
      { text: "Booster mon énergie physique, libido & force", points: { tripleroot: 3, dynafuel: 2 }, icon: "⚡" },
      { text: "Perdre du poids & éliminer les graisses", points: { fitmax: 3, urbanism: 2 }, icon: "🔥" },
      { text: "Renforcer mes défenses immunitaires & détoxifier", points: { aceguard: 3, acebrew: 1 }, icon: "🛡️" }
    ]
  },
  {
    id: 2,
    question: "Comment décririez-vous votre niveau de fatigue quotidien ?",
    options: [
      { text: "Épuisement constant (physique et mental)", points: { rocenta: 2, tripleroot: 2 }, icon: "😴" },
      { text: "Coups de barre fréquents après les repas", points: { fitmax: 1, acebrew: 2 }, icon: "📉" },
      { text: "Bonne énergie, mais je veux optimiser mes performances", points: { tripleroot: 3, dynafuel: 2 }, icon: "🚀" }
    ]
  },
  {
    id: 3,
    question: "Souffrez-vous de douleurs musculaires ou articulaires ?",
    options: [
      { text: "Oui, régulièrement (genoux, dos, articulations)", points: { rocenta: 3, collagene: 2 }, icon: "🩹" },
      { text: "Non, pas particulièrement", points: {}, icon: "☀️" }
    ]
  },
  {
    id: 4,
    question: "Quelle est votre priorité corporelle et esthétique ?",
    options: [
      { text: "Une peau éclatante, moins de rides & cheveux forts", points: { rocenta: 2, collagene: 3 }, icon: "✨" },
      { text: "Une silhouette affinée & moins de rétention d'eau", points: { fitmax: 3, urbanism: 2 }, icon: "⏳" },
      { text: "Une meilleure endurance & récupération musculaire", points: { tripleroot: 2, dynafuel: 3 }, icon: "💪" }
    ]
  },
  {
    id: 5,
    question: "Quel est votre rythme de sommeil ?",
    options: [
      { text: "Perturbé, insomnies ou réveils nocturnes", points: { rocenta: 3, aceguard: 1 }, icon: "🌙" },
      { text: "Bon sommeil, mais réveil difficile", points: { tripleroot: 2, acebrew: 1 }, icon: "⏰" },
      { text: "Sommeil de qualité et réparateur", points: {}, icon: "✅" }
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
    <div className="contact-container" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div 
        style={{
          width: '100%',
          maxWidth: '650px',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-premium)',
          color: 'var(--text-primary)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.12)', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        {/* STEP 0: INTRO SCREEN */}
        {currentStep === 0 && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.1)', color: 'var(--primary-gold)', marginBottom: '1.5rem' }}>
              <Sparkles size={40} />
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--primary-gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Trouvez votre Cure Idéale
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Répondez à quelques questions ciblées sur vos habitudes et vos objectifs de santé. Notre algorithme scientifique déterminera la cure Dynace la plus adaptée à vos besoins.
            </p>
            <button
              onClick={startQuiz}
              className="place-order-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', width: 'auto', padding: '0.85rem 2rem', fontSize: '1.05rem', fontWeight: '700' }}
            >
              Démarrer le Diagnostic <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 1-5: QUESTIONS SCREEN */}
        {currentStep > 0 && currentStep <= QUESTIONS.length && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            {/* Header progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Question {currentStep} sur {QUESTIONS.length}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {getPercentage()}% complété
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden', marginBottom: '2.5rem' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${getPercentage()}%`, 
                  backgroundColor: 'var(--primary-gold)', 
                  transition: 'width 0.3s ease',
                  boxShadow: '0 0 10px var(--primary-gold)' 
                }} 
              />
            </div>

            {/* Question Title */}
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', lineHeight: '1.4', marginBottom: '2rem' }}>
              {QUESTIONS[currentStep - 1].question}
            </h2>

            {/* Options list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {QUESTIONS[currentStep - 1].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(option)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.2rem',
                    width: '100%',
                    padding: '1.1rem 1.5rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '14px',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.05)';
                    e.currentTarget.style.borderColor = 'var(--primary-gold)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{option.icon}</span>
                  <span style={{ flexGrow: 1 }}>{option.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: RESULTS SCREEN */}
        {currentStep > QUESTIONS.length && recommendedProduct && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.6s ease' }}>
            <div style={{ display: 'inline-flex', padding: '0.8rem', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', marginBottom: '1rem' }}>
              <CheckCircle size={36} />
            </div>
            
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>
              Votre diagnostic est prêt !
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
              Sur la base de vos réponses, voici la cure la plus adaptée pour vous :
            </p>

            {/* Product card recommendation */}
            <div 
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid var(--border-color)',
                borderRadius: '18px',
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
                style={{ width: '130px', height: '130px', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))' }} 
              />
              
              <div style={{ textAlign: 'center' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 'bold', 
                  backgroundColor: 'rgba(212, 175, 55, 0.15)', 
                  color: 'var(--primary-gold)', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Recommandation Ciblée
                </span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                  {recommendedProduct.name}
                </h3>
                <span style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--primary-gold)' }}>
                  {recommendedProduct.price}.00 €
                </span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.75rem', lineHeight: '1.5' }}>
                  {recommendedProduct.summary}
                </p>
              </div>

              {/* Rationale Bullet points */}
              <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                  Pourquoi cette cure vous correspond :
                </h4>
                <ul style={{ paddingLeft: '1.2rem', margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {recommendedProduct.id === 'rocenta' && (
                    <>
                      <li>Favorise la régénération des cellules et ralentit les signes du vieillissement.</li>
                      <li>Aide à réduire l'inflammation des articulations et atténuer les douleurs.</li>
                      <li>Améliore la régulation du stress et la qualité du sommeil réparateur.</li>
                    </>
                  )}
                  {recommendedProduct.id === 'tripleroot' && (
                    <>
                      <li>Maximise la vitalité physique, l'endurance et l'énergie sexuelle.</li>
                      <li>Combat la fatigue nerveuse et assure une meilleure clarté d'esprit.</li>
                      <li>Stimule la circulation sanguine et renforce la vitalité générale.</li>
                    </>
                  )}
                  {recommendedProduct.id === 'fitmax' && (
                    <>
                      <li>Favorise le contrôle du poids en activant la thermogenèse.</li>
                      <li>Aide à brûler les graisses stockées et à bloquer les glucides.</li>
                      <li>Procure de l'énergie constante pour éviter les coups de fatigue en cours de journée.</li>
                    </>
                  )}
                  {recommendedProduct.id === 'aceguard' && (
                    <>
                      <li>Renforce le système immunitaire contre les infections saisonnières.</li>
                      <li>Action antioxydante globale pour protéger l'intégrité des cellules.</li>
                      <li>Aide à évacuer les toxines accumulées dans l'organisme.</li>
                    </>
                  )}
                  {recommendedProduct.id !== 'rocenta' && recommendedProduct.id !== 'tripleroot' && recommendedProduct.id !== 'fitmax' && recommendedProduct.id !== 'aceguard' && (
                    <>
                      <li>Formule adaptée à votre objectif bien-être prioritaire.</li>
                      <li>Cible de manière ciblée la fatigue et le stress.</li>
                      <li>Soutient le fonctionnement harmonieux de l'organisme.</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <button
                onClick={handleAddToCartClick}
                className="place-order-btn"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.8rem', 
                  width: '100%', 
                  padding: '1rem', 
                  fontSize: '1.05rem', 
                  fontWeight: '700',
                  backgroundColor: addedToCart ? 'var(--success)' : 'var(--primary-gold)'
                }}
              >
                {addedToCart ? (
                  <>Cure ajoutée au panier ! ✓</>
                ) : (
                  <>
                    <ShoppingCart size={18} /> Ajouter la cure recommandée au panier
                  </>
                )}
              </button>

              <button
                onClick={startQuiz}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  background: 'none',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                <RotateCcw size={16} /> Recommencer le test
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
