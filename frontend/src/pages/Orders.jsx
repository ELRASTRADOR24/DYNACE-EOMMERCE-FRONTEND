import React, { useState, useEffect } from 'react';
import { Package, Calendar, Clock, MapPin, ChevronRight, AlertCircle, ShoppingBag } from 'lucide-react';

export default function Orders({ onBackToShopping }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('dynace_jwt');
      if (!token) {
        setError("Veuillez vous connecter pour voir votre historique de commandes.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/orders/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else {
          const errData = await res.json();
          setError(errData.error || "Impossible de récupérer vos commandes.");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des commandes :", err);
        setError("Erreur réseau. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Payé':
        return { backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)' };
      case 'En préparation':
        return { backgroundColor: '#FFF7ED', color: '#EA580C', border: '1px solid #FFEDD5' };
      case 'Expédié':
        return { backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE' };
      default:
        return { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' };
    }
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="animate-spin spinner-ring"></div>
        <p>Chargement de vos commandes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-error-container">
        <AlertCircle size={40} className="error-icon" />
        <h2>Une erreur est survenue</h2>
        <p>{error}</p>
        <button onClick={onBackToShopping} className="back-btn">
          Retour à la boutique
        </button>
      </div>
    );
  }

  return (
    <div className="orders-page-container">
      <div className="orders-header-section">
        <span className="detail-category">Suivi de vos achats</span>
        <h1 className="orders-title">Mes Commandes</h1>
        <p className="orders-subtitle">
          Retrouvez l'historique complet de vos commandes, factures et l'état de livraison de vos compléments alimentaires.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders-state">
          <Package size={60} className="empty-orders-icon" />
          <h3>Aucune commande pour le moment</h3>
          <p>Vous n'avez pas encore passé de commande sur notre boutique.</p>
          <button onClick={onBackToShopping} className="continue-shopping-btn-orders">
            <ShoppingBag size={18} style={{ marginRight: '0.5rem' }} />
            Découvrir nos produits
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-history-card" key={order.id}>
              {/* Order Card Header */}
              <div className="order-card-header">
                <div className="order-meta-info">
                  <span className="order-number-badge">Commande #{order.orderNumber}</span>
                  <div className="order-date">
                    <Calendar size={14} style={{ marginRight: '0.25rem' }} />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </div>
                <div className="order-status-badge" style={getStatusStyle(order.status || 'Payé')}>
                  <Clock size={12} style={{ marginRight: '0.25rem' }} />
                  <span>{order.status || 'Payé'}</span>
                </div>
              </div>

              {/* Order Card Items */}
              <div className="order-card-items">
                {(order.items || []).map((item, idx) => (
                  <div className="order-item-row" key={idx}>
                    <div className="order-item-img-wrapper">
                      <img 
                        src={item.image || "/images/logo.svg"} 
                        alt={item.name || 'Produit'} 
                        className="order-item-img" 
                      />
                    </div>
                    <div className="order-item-details">
                      <h4 className="order-item-name">{item.name || 'Produit inconnu'}</h4>
                      <p className="order-item-price-qty">
                        {item.quantity || 1} x {(item.price || 0).toFixed(2)} €
                      </p>
                    </div>
                    <div className="order-item-subtotal">
                      {((item.price || 0) * (item.quantity || 1)).toFixed(2)} €
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Card Footer */}
              <div className="order-card-footer">
                <div className="order-shipping-address">
                  <MapPin size={14} style={{ color: 'var(--text-secondary)', marginRight: '0.25rem' }} />
                  <span>Livré à : {order.address || 'N/A'}, {order.postalCode || ''} {order.city || ''}</span>
                </div>
                
                <div className="order-financials">
                  <div className="financials-row-order">
                    <span>Sous-total :</span>
                    <span>{(order.subtotal || 0).toFixed(2)} €</span>
                  </div>
                  <div className="financials-row-order">
                    <span>Livraison :</span>
                    <span>{(order.shipping || 0) === 0 ? 'Gratuite' : `${(order.shipping || 0).toFixed(2)} €`}</span>
                  </div>
                  <div className="financials-row-order grand-total-order">
                    <span>Total :</span>
                    <span className="total-amount-order">{(order.total || 0).toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
