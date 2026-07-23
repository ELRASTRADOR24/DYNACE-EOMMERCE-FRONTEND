import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * SecretLove — Hidden Easter Egg Page
 * 
 * A secret love letter page dedicated to Pharelle Annastasy Nerolel.
 * Accessible only by entering a secret code.
 */

// Floating heart particle component
function Heart({ style }) {
  return (
    <div className="floating-heart" style={style}>
      ♥
    </div>
  );
}

// Sparkle particle
function Sparkle({ style }) {
  return <div className="sparkle-particle" style={style} />;
}

export default function SecretLove({ onBack }) {
  const [codeInput, setCodeInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [hearts, setHearts] = useState([]);
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
    "Pour Pharelle Annastasy Nerolel.",
    "",
    "Je sais que tu n'aimes pas les grands discours trop niais ou trop larmoyants.",
    "Ce n'est pas ton genre, et c'est justement pour ça que j'aime ton caractère et ta façon d'être.",
    "",
    "Tu as ce tempérament fort, cette prestance et ce style qui te rendent unique.",
    "Avec toi, pas besoin de jouer un rôle ou d'en faire trop.",
    "",
    "Sache que pour moi, tu n'es pas juste ma copine.",
    "Tu es ma femme. Ma moitié.",
    "",
    "Et même quand tu me taquines ou que tu me mentionnes cette fille dont le prénom commence par 'S'...",
    "Je m'en fous complètement.",
    "Dans ma tête et dans ma vie, il n'y a que toi.",
    "",
    "Mon respect, ma loyauté et mon soutien envers toi sont absolus.",
    "On avance ensemble, à notre façon.",
    "",
    "Pharelle. Ma femme. ♾️"
  ];

  useEffect(() => {
    if (!showContent) return;
    if (typedLines >= loveLines.length) return;

    const timer = setTimeout(() => {
      setTypedLines(prev => prev + 1);
    }, loveLines[typedLines] === '' ? 300 : 120);

    return () => clearTimeout(timer);
  }, [showContent, typedLines]);

  // Floating hearts animation
  const spawnHeart = useCallback(() => {
    const id = Date.now() + Math.random();
    const heart = {
      id,
      left: Math.random() * 100,
      size: 12 + Math.random() * 24,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.5,
    };
    setHearts(prev => [...prev.slice(-25), heart]);
  }, []);

  // Sparkle particles
  const spawnSparkle = useCallback(() => {
    const id = Date.now() + Math.random();
    const sparkle = {
      id,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 1.5 + Math.random() * 2,
    };
    setSparkles(prev => [...prev.slice(-30), sparkle]);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    const heartInterval = setInterval(spawnHeart, 400);
    const sparkleInterval = setInterval(spawnSparkle, 200);
    return () => {
      clearInterval(heartInterval);
      clearInterval(sparkleInterval);
    };
  }, [unlocked, spawnHeart, spawnSparkle]);

  return (
    <div className="secret-love-page" ref={containerRef}>
      {/* Floating hearts layer */}
      {unlocked && hearts.map(h => (
        <Heart
          key={h.id}
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            opacity: h.opacity,
          }}
        />
      ))}

      {/* Sparkles layer */}
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
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1" />
            </svg>
          </div>

          <h2 className="secret-code-title">Zone Secrète</h2>
          <p className="secret-code-subtitle">
            Cet espace est protégé. Entrez le code secret pour continuer.
          </p>

          <form onSubmit={handleCodeSubmit} className="secret-code-form">
            <input
              type="password"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Entrez le code secret..."
              className="secret-code-input"
              autoFocus
              autoComplete="off"
            />
            <button type="submit" className="secret-code-btn">
              <span>Déverrouiller</span>
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
          {/* Infinity symbol header */}
          <div className="love-infinity-symbol">∞</div>
          
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
                <div className="love-heart-big">♥</div>
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
