import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * SecretLove — Hidden Easter Egg Page
 * 
 * A secret dedicated page for Pharelle Annastasy Nerolel.
 * Accessible only by entering a secret code.
 */

// Star particle component
function Sparkle({ style }) {
  return <div className="sparkle-particle" style={style} />;
}

export default function SecretLove({ onBack }) {
  const [codeInput, setCodeInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [typedLines, setTypedLines] = useState(0);
  const [shake, setShake] = useState(false);
  const containerRef = useRef(null);

  const SECRET_CODE = '262002';

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (codeInput.trim() === SECRET_CODE) {
      setUnlocked(true);
      setTimeout(() => setShowContent(true), 800);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setCodeInput('');
    }
  };

  // Typewriter effect for letter lines
  const loveLines = [
    "Pour Pharelle, ma femme.",
    "",
    "Tu sais déjà que je ne suis pas là pour te sortir un discours rempli de phrases toutes faites. Déjà parce que ce n'est pas mon style, mais surtout parce que je sais que ce n'est pas le tien.",
    "",
    "Ce que j'aime chez toi, ce n'est pas seulement ce que tout le monde peut voir. C'est ton caractère. Tu ne te laisses pas marcher dessus, tu as du répondant, tu assumes qui tu es et tu n'as pas besoin de jouer un rôle pour exister. C'est ça qui me plaît.",
    "",
    "Je sais aussi que tu ne montres pas facilement ce que tu ressens. Tu as grandi en apprenant à encaisser, à avancer, à ne pas toujours laisser les autres entrer dans ton monde. Et tu sais quoi ? Je ne cherche pas à changer ça. J'apprends simplement à te connaître, avec tes qualités, ton sale caractère parfois... et c'est justement ce qui fait ton charme.",
    "",
    "Tu me cherches, tu me taquines, tu m'insultes même de temps en temps... mais ça me fait plus rire qu'autre chose. C'est toi. Et je préfère mille fois une fille vraie qu'une personne qui fait semblant d'être parfaite.",
    "",
    "Je ne vais pas te faire des promesses dans le vide. Je préfère te montrer, avec le temps, que je suis quelqu'un sur qui tu peux compter.",
    "",
    "Et puis... même quand tu me parles de cette fameuse fille dont le prénom commence par un « S », ça me fait sourire. Tu peux continuer à me taquiner si ça t'amuse, ça ne changera rien. Dans ma tête, il y a déjà assez de place pour une seule personne.",
    "",
    "Je ne sais pas de quoi demain sera fait. Personne ne le sait. Mais je sais une chose : j'aime ce qu'on construit. J'aime la personne que tu es. Et si un jour je t'appelle « ma femme », ce n'est pas pour faire joli. C'est parce que, dans ma tête, c'est comme ça que je te vois.",
    "",
    "Prends ça comme tu veux, coco... ou plutôt, ma bipolaire préférée.",
    "",
    "— Johanson"
  ];

  useEffect(() => {
    if (!showContent) return;
    if (typedLines >= loveLines.length) return;

    const timer = setTimeout(() => {
      setTypedLines(prev => prev + 1);
    }, loveLines[typedLines] === '' ? 350 : 300);

    return () => clearTimeout(timer);
  }, [showContent, typedLines]);

  // Sparkle particles
  const spawnSparkle = useCallback(() => {
    const id = Date.now() + Math.random();
    const sparkle = {
      id,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 2 + Math.random() * 3,
    };
    setSparkles(prev => [...prev.slice(-30), sparkle]);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    const sparkleInterval = setInterval(spawnSparkle, 250);
    return () => {
      clearInterval(sparkleInterval);
    };
  }, [unlocked, spawnSparkle]);

  return (
    <div className="secret-love-page" ref={containerRef}>
      {/* Sparkles / Stars layer */}
      {unlocked && sparkles.map(s => (
        <Sparkle
          key={s.id}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}

      {!unlocked ? (
        /* CODE ENTRY SCREEN */
        <div className={`secret-code-screen ${shake ? 'shake' : ''}`}>
          <div className="secret-code-glow" />
          
          <div className="secret-code-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1" />
            </svg>
          </div>

          <h2 className="secret-code-title">Espace Privé</h2>
          <p className="secret-code-subtitle">
            Cet espace est protégé. Entrez le code secret pour continuer.
          </p>

          <form onSubmit={handleCodeSubmit} className="secret-code-form">
            <input
              type="password"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Code secret..."
              className="secret-code-input"
              autoFocus
              autoComplete="off"
            />
            <button type="submit" className="secret-code-btn">
              <span>Accéder</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <button className="secret-back-link" onClick={onBack}>
            ← Retour au site
          </button>
        </div>
      ) : (
        /* LOVE LETTER SCREEN */
        <div className={`secret-love-content ${showContent ? 'visible' : ''}`}>
          {/* Constellation star emblem header */}
          <div className="love-infinity-symbol">✦</div>
          
          <div className="love-envelope">
            <div className="love-letter-card">
              {/* Decorative corners */}
              <div className="love-corner love-corner-tl" />
              <div className="love-corner love-corner-tr" />
              <div className="love-corner love-corner-bl" />
              <div className="love-corner love-corner-br" />

              <div className="love-letter-body">
                {loveLines.slice(0, typedLines).map((line, i) => (
                  <p
                    key={i}
                    className={`love-line ${i === 0 ? 'love-line-title' : ''} ${line === '' ? 'love-line-break' : ''} ${
                      i === typedLines - 1 ? 'love-line-newest' : ''
                    } ${line.includes('ma femme') ? 'love-line-highlight' : ''}`}
                  >
                    {line || '\u00A0'}
                  </p>
                ))}
                {typedLines < loveLines.length && (
                  <span className="love-cursor">|</span>
                )}
              </div>
            </div>

            {typedLines >= loveLines.length && (
              <div className="love-footer-reveal">
                <div className="love-star-symbol">✦</div>
                <p className="love-footer-text">
                  Un espace secret, fait sur mesure pour toi, Pharelle.
                </p>
              </div>
            )}
          </div>

          <button className="secret-back-link love-back" onClick={onBack}>
            ← Retour au site
          </button>
        </div>
      )}
    </div>
  );
}
