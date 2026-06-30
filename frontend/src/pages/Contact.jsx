import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, ChevronDown, ChevronUp } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);
  
  // FAQ state
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "Quels sont les délais de livraison ?",
      a: "Nos commandes sont généralement expédiées sous 48h ouvrées. La livraison prend ensuite entre 3 et 5 jours selon votre localisation."
    },
    {
      q: "Comment utiliser le produit Dynace Rocenta ?",
      a: "Nous recommandons de prendre un sachet par jour, le matin à jeun. Versez le contenu directement sous la langue pour une absorption sublinguale optimale, ou diluez-le dans un peu d'eau."
    },
    {
      q: "Puis-je modifier ou annuler ma commande ?",
      a: "Si votre commande n'a pas encore été expédiée, vous pouvez l'annuler en nous contactant immédiatement via le formulaire ci-dessous. Une fois expédiée, il faudra attendre la réception pour faire valoir votre droit de rétractation (14 jours)."
    },
    {
      q: "Proposez-vous des tarifs pour les distributeurs ?",
      a: "Oui, Dynace Global fonctionne sur un modèle de vente directe. Contactez-nous en choisissant le sujet 'Devenir Distributeur' pour connaître les conditions et les packs de démarrage."
    }
  ];

  const toggleFaq = (index) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitMessage({ type: 'success', text: 'Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitMessage({ type: 'error', text: data.error || 'Erreur lors de l\'envoi du message.' });
      }
    } catch (error) {
      setSubmitMessage({ type: 'error', text: 'Erreur de connexion au serveur.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page" style={{ padding: '3rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Contactez-Nous</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '4rem', fontSize: '1.1rem' }}>
        Une question sur nos produits ou votre commande ? Notre équipe est là pour vous répondre.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', marginBottom: '5rem' }}>
        
        {/* Contact Info & Form */}
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Laissez un message</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '50%' }}>
                <Mail size={20} style={{ color: 'var(--primary-green)' }} />
              </div>
              <span>dynaceglobal@gmail.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '50%' }}>
                <Phone size={20} style={{ color: 'var(--primary-green)' }} />
              </div>
              <span>+33 1 23 45 67 89</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="contact-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Votre Nom</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Votre E-mail</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Sujet</label>
              <select name="subject" value={formData.subject} onChange={handleChange} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                <option value="">Sélectionnez un sujet...</option>
                <option value="Question Produit">Question sur un produit</option>
                <option value="Suivi Commande">Suivi de ma commande</option>
                <option value="Devenir Distributeur">Devenir distributeur</option>
                <option value="Autre">Autre demande</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Votre Message</label>
              <textarea name="message" value={formData.message} onChange={handleChange} required rows="5" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }}></textarea>
            </div>

            {submitMessage && (
              <div style={{ padding: '1rem', backgroundColor: 'var(--success-bg)', color: 'var(--success)', borderRadius: '8px', fontSize: '0.9rem' }}>
                {submitMessage.text}
              </div>
            )}

            <button type="submit" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-green)', color: 'white', padding: '0.8rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
              <Send size={18} />
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>
          </form>
        </div>

        {/* FAQ */}
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Foire Aux Questions</h2>
          <div className="faq-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, index) => (
              <div key={index} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <button 
                  onClick={() => toggleFaq(index)} 
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: 'none', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
                >
                  {faq.q}
                  {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {openFaq === index && (
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', lineHeight: '1.6', borderTop: '1px solid var(--border-color)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
