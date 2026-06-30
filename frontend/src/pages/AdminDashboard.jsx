import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, ShoppingCart, RefreshCw, Save, X, Check, Truck, AlertCircle, Settings } from 'lucide-react';

export default function AdminDashboard({ onRefreshProducts }) {
  const [activeSubTab, setActiveSubTab] = useState('products'); // 'products' or 'orders'
  
  // State for products
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Product Form State
  const [prodForm, setProdForm] = useState({
    id: '',
    name: '',
    price: '',
    category: 'Cellulaire',
    image: '',
    summary: '',
    description: '',
    usage: '',
    stock: 50,
    benefits: ''
  });
  const [imageFile, setImageFile] = useState(null);

  // State for orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  // Notification states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Settings State
  const [shippingThreshold, setShippingThreshold] = useState(60);
  const [shippingCost, setShippingCost] = useState(6.90);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        const errData = await res.json();
        showError(errData.error || 'Erreur lors de la récupération des produits.');
      }
    } catch (err) {
      showError('Erreur de connexion avec le serveur.');
    } finally {
      setProductsLoading(false);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    const token = localStorage.getItem('dynace_jwt');
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        const errData = await res.json();
        showError(errData.error || 'Erreur lors de la récupération des commandes.');
      }
    } catch (err) {
      showError('Erreur de connexion avec le serveur.');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/shipping');
      if (res.ok) {
        const data = await res.json();
        setShippingThreshold(data.threshold);
        setShippingCost(data.cost);
      }
    } catch (err) {
      console.error('Erreur paramètres', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchSettings();
  }, []);

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Open modal for new product
  const handleNewProductClick = () => {
    setEditingProduct(null);
    setImageFile(null);
    setProdForm({
      id: '',
      name: '',
      price: '',
      category: 'Cellulaire',
      image: '',
      summary: '',
      description: '',
      usage: '',
      stock: 50,
      benefits: ''
    });
    setProductModalOpen(true);
  };

  // Open modal for editing product
  const handleEditProductClick = (p) => {
    setEditingProduct(p);
    setImageFile(null);
    setProdForm({
      id: p.id,
      name: p.name,
      price: p.price.toString(),
      category: p.category,
      image: p.image || '',
      summary: p.summary,
      description: p.description,
      usage: p.usage,
      stock: p.stock,
      benefits: p.benefits ? p.benefits.join(', ') : ''
    });
    setProductModalOpen(true);
  };

  // Handle product form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProdForm(prev => ({
      ...prev,
      [name]: name === 'stock' ? parseInt(value) || 0 : value
    }));
  };

  // Save product (Create or Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('dynace_jwt');
    
    // Format benefits from comma-separated string to array
    const formattedBenefits = prodForm.benefits
      ? prodForm.benefits.split(',').map(b => b.trim()).filter(b => b.length > 0)
      : [];

    const productPayload = {
      ...prodForm,
      price: parseFloat(prodForm.price) || 0,
      benefits: formattedBenefits
    };

    const url = editingProduct 
      ? `/api/admin/products/${editingProduct.id}` 
      : `/api/admin/products`;
      
    const method = editingProduct ? 'PUT' : 'POST';

    // Build FormData
    const formData = new FormData();
    Object.keys(productPayload).forEach(key => {
      if (key === 'benefits' || key === 'images') {
        formData.append(key, JSON.stringify(productPayload[key]));
      } else {
        formData.append(key, productPayload[key]);
      }
    });

    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        showSuccess(editingProduct ? 'Produit modifié avec succès !' : 'Produit créé avec succès !');
        setProductModalOpen(false);
        fetchProducts();
        if (onRefreshProducts) onRefreshProducts();
      } else {
        showError(data.error || 'Erreur lors de la sauvegarde du produit.');
      }
    } catch (err) {
      showError('Erreur réseau lors de la sauvegarde.');
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.')) {
      return;
    }
    const token = localStorage.getItem('dynace_jwt');
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('Produit supprimé avec succès.');
        fetchProducts();
        if (onRefreshProducts) onRefreshProducts();
      } else {
        const data = await res.json();
        showError(data.error || 'Erreur lors de la suppression.');
      }
    } catch (err) {
      showError('Erreur réseau lors de la suppression.');
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('dynace_jwt');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showSuccess('Statut de commande mis à jour.');
        fetchOrders();
      } else {
        const data = await res.json();
        showError(data.error || 'Erreur mise à jour commande.');
      }
    } catch (err) {
      showError('Erreur de connexion.');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    const token = localStorage.getItem('dynace_jwt');
    try {
      const res = await fetch('/api/admin/settings/shipping', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ threshold: shippingThreshold, cost: shippingCost })
      });
      if (res.ok) {
        showSuccess('Paramètres de livraison mis à jour.');
      } else {
        showError('Erreur lors de la mise à jour des paramètres.');
      }
    } catch (err) {
      showError('Erreur de connexion.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Payé':
        return { backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)' };
      case 'En préparation':
        return { backgroundColor: 'rgba(253, 185, 19, 0.15)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)' };
      case 'Expédié':
        return { backgroundColor: 'rgba(21, 58, 137, 0.1)', color: 'var(--primary-green)', border: '1px solid var(--primary-green)' };
      default:
        return { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' };
    }
  };

  return (
    <div style={{ padding: '2rem 5%', minHeight: '80vh', fontFamily: 'var(--sans)' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--serif)', fontWeight: 'bold', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Espace Administration
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Gérer le catalogue de produits, les niveaux de stock et suivre les commandes clients.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => { fetchProducts(); fetchOrders(); }}
            className="theme-toggle" 
            style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Rafraîchir les données"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(217, 48, 37, 0.2)' }}>
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--success-bg)', color: 'var(--success)', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(24, 128, 56, 0.2)' }}>
          <Check size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sub Tabs Toggle (Glassmorphism design) */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', gap: '2rem' }}>
        <button 
          onClick={() => setActiveSubTab('products')}
          style={{
            background: 'none',
            border: 'none',
            padding: '1rem 0',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: activeSubTab === 'products' ? 'var(--primary-green)' : 'var(--text-secondary)',
            borderBottom: activeSubTab === 'products' ? '3px solid var(--primary-green)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <Package size={18} />
          Gestion des Produits
        </button>
        <button 
          onClick={() => setActiveSubTab('orders')}
          style={{
            background: 'none',
            border: 'none',
            padding: '1rem 0',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: activeSubTab === 'orders' ? 'var(--primary-green)' : 'var(--text-secondary)',
            borderBottom: activeSubTab === 'orders' ? '3px solid var(--primary-green)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <ShoppingCart size={18} />
          Suivi des Commandes
          {orders.length > 0 && (
            <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--primary-green)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '10px', marginLeft: '0.25rem' }}>
              {orders.filter(o => o.status === 'Payé').length} nouv.
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveSubTab('settings')}
          style={{
            background: 'none',
            border: 'none',
            padding: '1rem 0',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: activeSubTab === 'settings' ? 'var(--primary-green)' : 'var(--text-secondary)',
            borderBottom: activeSubTab === 'settings' ? '3px solid var(--primary-green)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <Settings size={18} />
          Paramètres
        </button>
      </div>

      {/* PRODUCTS PANEL */}
      {activeSubTab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--serif)', color: 'var(--text-primary)' }}>
              Produits enregistrés ({products.length})
            </h3>
            <button
              onClick={handleNewProductClick}
              style={{
                backgroundColor: 'var(--primary-green)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '50px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: 'var(--shadow-glow)',
                transition: 'all 0.2s'
              }}
            >
              <Plus size={18} /> Ajouter un Produit
            </button>
          </div>

          {productsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Chargement du catalogue...</div>
          ) : (
            <div className="grid-products" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {products.map(p => (
                <div key={p.id} style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-premium)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}>
                  {p.stock <= 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      backgroundColor: 'var(--danger-bg)',
                      color: 'var(--danger)',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid var(--danger)'
                    }}>
                      Rupture de Stock
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <img 
                        src={p.image || '/images/rocenta.png'} 
                        alt={p.name} 
                        style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'contain', backgroundColor: 'white', border: '1px solid var(--border-color)', padding: '4px' }} 
                      />
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{p.name}</h4>
                        <span style={{ fontSize: '0.85rem', color: 'var(--primary-green)', fontWeight: '600' }}>{p.category}</span>
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {p.summary}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Prix unitaire</span>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{p.price.toFixed(2)} €</strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Stock disponible</span>
                        <strong style={{ 
                          fontSize: '1.1rem', 
                          color: p.stock <= 5 ? 'var(--danger)' : 'var(--text-primary)' 
                        }}>{p.stock} unités</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button
                      onClick={() => handleEditProductClick(p)}
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Edit2 size={16} /> Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      style={{
                        backgroundColor: 'var(--danger-bg)',
                        color: 'var(--danger)',
                        border: '1px solid rgba(217, 48, 37, 0.1)',
                        padding: '0.6rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      title="Supprimer le produit"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ORDERS PANEL */}
      {activeSubTab === 'orders' && (
        <div>
          <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--serif)', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Commandes clients ({orders.length})
          </h3>

          {ordersLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Chargement des commandes...</div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
              Aucune commande enregistrée pour le moment.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-premium)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(21, 58, 137, 0.03)' }}>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Commande</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Client</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Articles</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Total</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Statut</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id} style={{ borderBottom: '1px solid var(--border-color)', verticalAlign: 'top' }}>
                      {/* Order Ref */}
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.95rem' }}>{o.order_number}</span>
                      </td>
                      {/* Date */}
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {new Date(o.created_at || o.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      {/* Client */}
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem' }}>
                        <strong style={{ display: 'block' }}>{o.first_name} {o.last_name}</strong>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>{o.email}</span>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem', maxWidth: '220px', lineHeight: '1.3' }}>
                          {o.address}, {o.postal_code} {o.city}
                        </div>
                      </td>
                      {/* Items */}
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem' }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {(o.items || []).map((item, idx) => (
                            <li key={idx} style={{ marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                              • {item.name} <strong style={{ color: 'var(--primary-green)' }}>x{item.quantity}</strong>
                            </li>
                          ))}
                        </ul>
                      </td>
                      {/* Total */}
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '1rem', fontWeight: 'bold' }}>
                        {o.total.toFixed(2)} €
                        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-secondary)' }}>
                          (Port: {o.shipping === 0 ? 'Offert' : `${o.shipping.toFixed(2)} €`})
                        </span>
                      </td>
                      {/* Status */}
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '50px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          display: 'inline-block',
                          ...getStatusBadgeStyle(o.status)
                        }}>
                          {o.status || 'Payé'}
                        </span>
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <select
                          value={o.status || 'Payé'}
                          onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                          style={{
                            padding: '0.4rem 0.6rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="Payé">Payé</option>
                          <option value="En préparation">En préparation</option>
                          <option value="Expédié">Expédié</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SETTINGS PANEL */}
      {activeSubTab === 'settings' && (
        <div style={{ maxWidth: '600px' }}>
          <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--serif)', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Paramètres de Livraison
          </h3>
          
          <form onSubmit={handleSaveSettings} style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '15px', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  Frais de livraison de base (€)
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'white',
                    fontSize: '1rem',
                    color: 'var(--text-primary)'
                  }}
                  required
                />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Coût fixe appliqué si le sous-total est inférieur au seuil de gratuité. (Ex: 6.90)
                </p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                  Seuil de livraison gratuite (€)
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={shippingThreshold}
                  onChange={(e) => setShippingThreshold(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'white',
                    fontSize: '1rem',
                    color: 'var(--text-primary)'
                  }}
                  required
                />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Le montant à partir duquel la livraison devient offerte. (Ex: 60.00)
                </p>
              </div>

              <button 
                type="submit" 
                disabled={settingsLoading}
                className="btn-primary"
                style={{ 
                  marginTop: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {settingsLoading ? <RefreshCw size={20} className="spin" /> : <Save size={20} />}
                Enregistrer les paramètres
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PRODUCT MODAL (Add / Edit) */}
      {productModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '20px',
            width: '90%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-premium)',
            position: 'relative'
          }}>
            <button
              onClick={() => setProductModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={24} />
            </button>

            <h3 style={{ fontSize: '1.75rem', fontFamily: 'var(--serif)', color: 'var(--primary-green)', marginBottom: '1.5rem' }}>
              {editingProduct ? 'Modifier le produit' : 'Créer un nouveau produit'}
            </h3>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Product ID (only for creation) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Identifiant Unique (ex: dynafuel, rocenta)
                </label>
                <input
                  type="text"
                  name="id"
                  value={prodForm.id}
                  onChange={handleFormChange}
                  disabled={!!editingProduct}
                  placeholder="Laisser vide pour générer automatiquement"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Name & Price */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                    Nom du Produit *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={prodForm.name}
                    onChange={handleFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={prodForm.price}
                    onChange={handleFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              {/* Category & Stock */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    value={prodForm.category}
                    onChange={handleFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '1rem'
                    }}
                  >
                    <option value="Cellulaire">Cellulaire</option>
                    <option value="Énergie">Énergie</option>
                    <option value="Bien-être">Bien-être</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                    Stock Initial *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={prodForm.stock}
                    onChange={handleFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              {/* Image Upload / URL */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Image du produit (Fichier local ou Lien)
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                        // Optionnel : effacer l'URL si on choisit un fichier
                        setProdForm(prev => ({ ...prev, image: '' }));
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem'
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>OU</span>
                  <input
                    type="text"
                    name="image"
                    value={prodForm.image}
                    onChange={(e) => {
                      handleFormChange(e);
                      setImageFile(null); // Si on tape une URL, on retire le fichier
                    }}
                    placeholder="/images/produit.png ou https://..."
                    disabled={!!imageFile}
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: imageFile ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '1rem',
                      opacity: imageFile ? 0.5 : 1
                    }}
                  />
                </div>
                {imageFile && <div style={{ fontSize: '0.8rem', color: 'var(--primary-green)', marginTop: '0.5rem' }}>Fichier sélectionné : {imageFile.name}</div>}
              </div>

              {/* Summary */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Résumé Court *
                </label>
                <input
                  type="text"
                  name="summary"
                  value={prodForm.summary}
                  onChange={handleFormChange}
                  required
                  placeholder="Brève phrase d'accroche pour la fiche produit"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Description Détaillée *
                </label>
                <textarea
                  name="description"
                  value={prodForm.description}
                  onChange={handleFormChange}
                  required
                  rows="3"
                  placeholder="Présentation complète du produit..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontFamily: 'var(--sans)',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                ></textarea>
              </div>

              {/* Benefits (comma separated) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Bénéfices (séparés par des virgules)
                </label>
                <input
                  type="text"
                  name="benefits"
                  value={prodForm.benefits}
                  onChange={handleFormChange}
                  placeholder="Ex: Soutien immunitaire, Énergie naturelle, Anti-oxydant"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Usage */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Conseils d'utilisation *
                </label>
                <input
                  type="text"
                  name="usage"
                  value={prodForm.usage}
                  onChange={handleFormChange}
                  required
                  placeholder="Ex: 1 sachet par jour sous la langue le matin à jeun"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    padding: '0.85rem',
                    borderRadius: '50px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--primary-green)',
                    color: 'white',
                    border: 'none',
                    padding: '0.85rem',
                    borderRadius: '50px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: 'var(--shadow-glow)'
                  }}
                >
                  <Save size={18} /> Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
