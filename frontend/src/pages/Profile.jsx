import React, { useState } from 'react';
import { User, ShieldAlert, Key, UserMinus, CheckCircle, AlertTriangle, Loader } from 'lucide-react';

export default function Profile({ currentUser, onUpdateUser, onLogout }) {
  const [profileData, setProfileData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    postalCode: currentUser?.postalCode || '',
    city: currentUser?.city || ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // States for notifications
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Loading indicators
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  // Account deletion modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Submit profile changes
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setIsSavingProfile(true);

    try {
      const token = localStorage.getItem('dynace_jwt');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Une erreur est survenue lors de la mise à jour.');
      }

      setProfileSuccess('Vos informations ont été mises à jour avec succès !');
      if (onUpdateUser) {
        onUpdateUser(data.user);
      }
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Le nouveau mot de passe et sa confirmation ne correspondent pas.');
      return;
    }

    setIsSavingPassword(true);

    try {
      const token = localStorage.getItem('dynace_jwt');
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour du mot de passe.');
      }

      setPasswordSuccess('Votre mot de passe a été modifié avec succès.');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Submit account deletion (GDPR compliance)
  const handleDeleteAccount = async () => {
    setDeleteError('');
    
    if (deleteEmailInput.trim().toLowerCase() !== currentUser?.email.toLowerCase()) {
      setDeleteError("L'adresse email saisie ne correspond pas à votre compte.");
      return;
    }

    setIsDeleting(true);

    try {
      const token = localStorage.getItem('dynace_jwt');
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression du compte.');
      }

      // Logout user and redirect
      alert('Votre compte a été supprimé définitivement. Vos données ont été effacées conformément au RGPD.');
      onLogout();
    } catch (err) {
      setDeleteError(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="checkout-container" style={{ maxWidth: '900px', margin: '40px auto 80px', padding: '0 1rem' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '2.5rem', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Mon Compte</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Gérez vos informations de facturation, modifiez vos accès de sécurité et contrôlez vos données personnelles.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
        
        {/* SECTION 1 : INFORMATIONS DE PROFIL & LIVRAISON */}
        <section className="checkout-card" style={{ padding: '2rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <User size={20} style={{ color: 'var(--primary-green)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', margin: 0 }}>Informations Personnelles & Livraison</h2>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group-review">
                <label className="comment-label">Prénom</label>
                <input
                  type="text"
                  name="firstName"
                  className="review-textarea"
                  style={{ height: '42px', padding: '0.5rem 1rem' }}
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div className="form-group-review">
                <label className="comment-label">Nom de famille</label>
                <input
                  type="text"
                  name="lastName"
                  className="review-textarea"
                  style={{ height: '42px', padding: '0.5rem 1rem' }}
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group-review">
                <label className="comment-label">Adresse Email (Non modifiable)</label>
                <input
                  type="email"
                  className="review-textarea"
                  style={{ height: '42px', padding: '0.5rem 1rem', opacity: 0.6, cursor: 'not-allowed', backgroundColor: 'var(--bg-secondary)' }}
                  value={currentUser?.email}
                  disabled
                />
              </div>
              <div className="form-group-review">
                <label className="comment-label">Numéro de téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  className="review-textarea"
                  style={{ height: '42px', padding: '0.5rem 1rem' }}
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="Ex: 0612345678"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group-review">
                <label className="comment-label">Adresse de livraison (Rue, N° de porte)</label>
                <input
                  type="text"
                  name="address"
                  className="review-textarea"
                  style={{ height: '42px', padding: '0.5rem 1rem' }}
                  value={profileData.address}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group-review">
                <label className="comment-label">Code Postal</label>
                <input
                  type="text"
                  name="postalCode"
                  className="review-textarea"
                  style={{ height: '42px', padding: '0.5rem 1rem' }}
                  value={profileData.postalCode}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div className="form-group-review">
                <label className="comment-label">Ville</label>
                <input
                  type="text"
                  name="city"
                  className="review-textarea"
                  style={{ height: '42px', padding: '0.5rem 1rem' }}
                  value={profileData.city}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>

            {profileSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1rem', border: '1px solid var(--success)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <CheckCircle size={18} />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="review-submit-error" style={{ marginBottom: '1.5rem' }}>
                {profileError}
              </div>
            )}

            <button
              type="submit"
              className="continue-shopping-btn"
              style={{ width: 'auto', padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              disabled={isSavingProfile}
            >
              {isSavingProfile ? (
                <>
                  <Loader size={16} className="spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>Enregistrer les modifications</span>
              )}
            </button>
          </form>
        </section>

        {/* SECTION 2 : SÉCURITÉ & MOT DE PASSE */}
        <section className="checkout-card" style={{ padding: '2rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <Key size={20} style={{ color: 'var(--primary-green)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', margin: 0 }}>Sécurité du Compte</h2>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group-review">
                <label className="comment-label">Ancien mot de passe</label>
                <input
                  type="password"
                  name="oldPassword"
                  className="review-textarea"
                  style={{ height: '42px', padding: '0.5rem 1rem' }}
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group-review">
                <label className="comment-label">Nouveau mot de passe</label>
                <input
                  type="password"
                  name="newPassword"
                  className="review-textarea"
                  style={{ height: '42px', padding: '0.5rem 1rem' }}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group-review">
                <label className="comment-label">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="review-textarea"
                  style={{ height: '42px', padding: '0.5rem 1rem' }}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
            </div>

            {passwordSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1rem', border: '1px solid var(--success)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <CheckCircle size={18} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="review-submit-error" style={{ marginBottom: '1.5rem' }}>
                {passwordError}
              </div>
            )}

            <button
              type="submit"
              className="continue-shopping-btn"
              style={{ width: 'auto', padding: '0.8rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              disabled={isSavingPassword}
            >
              {isSavingPassword ? (
                <>
                  <Loader size={16} className="spin" />
                  <span>Modification...</span>
                </>
              ) : (
                <span>Mettre à jour le mot de passe</span>
              )}
            </button>
          </form>
        </section>

        {/* SECTION 3 : ZONE DE DANGER (RGPD) */}
        <section className="checkout-card" style={{ padding: '2rem', border: '1px solid #ef4444', backgroundColor: 'var(--bg-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #fecaca', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <UserMinus size={20} style={{ color: '#ef4444' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ef4444', margin: 0 }}>Zone de Danger (Conformité RGPD)</h2>
          </div>

          <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            <p style={{ margin: '0 0 1rem 0' }}>
              En vertu du <strong>Règlement Général sur la Protection des Données (RGPD)</strong>, vous disposez d'un droit à l'oubli. 
              Vous pouvez demander à tout moment la suppression définitive de votre compte et de toutes vos informations nominatives.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: '#b91c1c', backgroundColor: '#fef2f2', padding: '1rem', border: '1px solid #fee2e2', borderRadius: '4px', fontSize: '0.85rem' }}>
              <AlertTriangle size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>Avertissement :</strong> Cette action est irréversible. Toutes vos informations personnelles seront effacées, et vos commandes antérieures seront anonymisées à des fins statistiques et fiscales.
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              backgroundColor: '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '0.8rem 2rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            <UserMinus size={16} />
            <span>Supprimer définitivement mon compte</span>
          </button>
        </section>

      </div>

      {/* MODAL DE CONFIRMATION DE SUPPRESSION (GDPR DOUBLE CONFIRMATION) */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            maxWidth: '500px',
            width: '100%',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-premium)',
            position: 'relative'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={22} style={{ color: '#ef4444' }} />
              Confirmer la suppression
            </h3>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Pour valider la suppression définitive de votre compte, veuillez saisir votre adresse e-mail de connexion (<strong>{currentUser?.email}</strong>) ci-dessous :
            </p>

            <div className="form-group-review" style={{ marginBottom: '1.5rem' }}>
              <label className="comment-label">Saisir votre e-mail</label>
              <input
                type="email"
                className="review-textarea"
                style={{ height: '42px', padding: '0.5rem 1rem' }}
                placeholder="votre-email@exemple.com"
                value={deleteEmailInput}
                onChange={(e) => setDeleteEmailInput(e.target.value)}
                required
              />
            </div>

            {deleteError && (
              <div className="review-submit-error" style={{ marginBottom: '1.5rem' }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteEmailInput('');
                  setDeleteError('');
                }}
                className="review-textarea"
                style={{ width: 'auto', padding: '0.6rem 1.5rem', height: 'auto', cursor: 'pointer', border: '1px solid var(--border-color)' }}
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteAccount}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.6rem 1.5rem',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader size={14} className="spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <span>Confirmer la suppression</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
