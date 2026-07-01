import React, { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle } from 'lucide-react';

export default function OrderTracking() {
  const params = new URLSearchParams(window.location.search);
  const initialOrder = params.get('order') || '';
  const initialEmail = params.get('email') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [email, setEmail] = useState(initialEmail);
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackerStep, setTrackerStep] = useState(0);

  // Map status to steps
  const mapStatusToStep = (status) => {
    switch(status) {
      case 'Payé': return 0;
      case 'En préparation': return 1;
      case 'Expédié': return 2;
      case 'Livré': return 3;
      default: return 0;
    }
  };

  const fetchTracking = async (searchOrder, searchEmail) => {
    if (!searchOrder || !searchEmail) {
      setError("Le numéro de commande et l'adresse e-mail sont obligatoires.");
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/track/${searchOrder}?email=${encodeURIComponent(searchEmail)}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Commande introuvable.");
      }

      setTrackingData(data);
      setTrackerStep(mapStatusToStep(data.status));
    } catch (err) {
      setError(err.message);
      setTrackingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder && initialEmail) {
      fetchTracking(initialOrder, initialEmail);
    }
  }, [initialOrder, initialEmail]);

  // Real-time polling if an order is found (only if not yet delivered)
  useEffect(() => {
    let intervalId;
    if (trackingData && trackingData.order_number && trackingData.status !== 'Livré') {
      intervalId = setInterval(() => {
        fetchTracking(trackingData.order_number, email);
      }, 60000); // Poll every 60s
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    }
  }, [trackingData?.order_number, trackingData?.status, email]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTracking(orderNumber, email);
  };

  const steps = [
    { title: 'Commande confirmée', desc: 'Votre paiement a été validé avec succès.' },
    { title: 'En préparation', desc: 'Votre commande est en cours de préparation par notre équipe.' },
    { title: 'Expédiée', desc: 'Votre colis a été remis au transporteur.' },
    { title: 'Livrée', desc: 'Votre commande a été livrée à votre adresse.' }
  ];

  return (
    <div style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Suivre ma commande</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
        Entrez votre numéro de commande et l'adresse e-mail utilisée lors de l'achat pour voir l'état de votre livraison.
      </p>

      {!trackingData && (
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--bg-primary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          {error && (
            <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontWeight: '500' }}>
              {error}
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Numéro de Commande *</label>
              <input 
                type="text" 
                value={orderNumber} 
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ex: ORD-12345678"
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>Adresse E-mail *</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                required
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--primary-gold)', color: 'var(--bg-primary)', fontWeight: 'bold', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '1.1rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              <Search size={20} />
              {isLoading ? 'Recherche...' : 'Rechercher la commande'}
            </button>
          </div>
        </form>
      )}

      {trackingData && (
        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Commande {trackingData.order_number}</h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Passée le {new Date(trackingData.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
            <button onClick={() => setTrackingData(null)} style={{ background: 'none', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              Nouvelle recherche
            </button>
          </div>

          <div style={{ margin: '0 0 3rem 0' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>État d'avancement</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {steps.map((step, idx) => {
                const isCompleted = idx < trackerStep;
                const isActive = idx === trackerStep;
                
                return (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      backgroundColor: isCompleted ? 'var(--primary-green)' : (isActive ? 'var(--primary-gold)' : 'var(--border-color)'),
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '0.1rem',
                      boxShadow: isActive ? '0 0 0 4px rgba(212, 175, 55, 0.2)' : 'none'
                    }}>
                      {isCompleted && <CheckCircle size={16} color="white" />}
                    </div>
                    <div>
                      <span style={{ display: 'block', fontWeight: 'bold', color: isCompleted || isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {step.title}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {step.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} /> Adresse de livraison
            </h4>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {trackingData.first_name} {trackingData.last_name}<br />
              {trackingData.address}<br />
              {trackingData.postal_code} {trackingData.city}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
