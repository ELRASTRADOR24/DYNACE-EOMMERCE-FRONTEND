import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Floating Toast Notification Component
 */
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success' || !toast.type;
  const isError = toast.type === 'error';

  return (
    <div 
      className="toast-container"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.85rem 1.25rem',
        borderRadius: '12px',
        backgroundColor: isError ? 'var(--danger-bg, #fef2f2)' : 'var(--bg-glass, rgba(255, 255, 255, 0.95))',
        border: `1.5px solid ${isError ? 'var(--danger, #ef4444)' : 'var(--primary-gold, #d4af37)'}`,
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(10px)',
        color: 'var(--text-primary)',
        fontSize: '0.9rem',
        fontWeight: '600',
        maxWidth: '380px',
        animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {isSuccess && <CheckCircle size={18} style={{ color: 'var(--success, #10b981)', flexShrink: 0 }} />}
      {isError && <AlertCircle size={18} style={{ color: 'var(--danger, #ef4444)', flexShrink: 0 }} />}
      {!isSuccess && !isError && <Info size={18} style={{ color: 'var(--primary-gold, #d4af37)', flexShrink: 0 }} />}

      <span style={{ flexGrow: 1 }}>{toast.message}</span>

      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.7
        }}
        aria-label="Fermer la notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
