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
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

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
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'users') {
      fetchUsers();
    }
  }, [activeSubTab]);

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
  const handleUpdateOrderStatus = async (orderId, newStatus, trackingNumber = '') => {
    const token = localStorage.getItem('dynace_jwt');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, trackingNumber })
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

  // Fetch all registered users
  const fetchUsers = async () => {
    setUsersLoading(true);
    const token = localStorage.getItem('dynace_jwt');
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        const errData = await res.json();
        showError(errData.error || 'Erreur lors de la récupération des utilisateurs.');
      }
    } catch (err) {
      showError('Erreur de connexion avec le serveur.');
    } finally {
      setUsersLoading(false);
    }
  };

  // Toggle allow_test_payment for a user
  const handleToggleTestPayment = async (userId, currentVal) => {
    const token = localStorage.getItem('dynace_jwt');
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-test-payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ allowTestPayment: !currentVal })
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess('Permissions de test mises à jour.');
        fetchUsers();
      } else {
        showError(data.error || 'Erreur lors de la modification des permissions.');
      }
    } catch (err) {
      showError('Erreur de connexion.');
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
      case 'Livré':
        return { backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)' };
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
        <button 
          onClick={() => setActiveSubTab('users')}
          style={{
            background: 'none',
            border: 'none',
            padding: '1rem 0',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: activeSubTab === 'users' ? 'var(--primary-green)' : 'var(--text-secondary)',
            borderBottom: activeSubTab === 'users' ? '3px solid var(--primary-green)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          Utilisateurs
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
          <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--serif)', color: 'var(--primary-green)', marginBottom: '1.5rem', borderBottom: '2px solid var(--primary-gold)', paddingBottom: '0.5rem' }}>
            📦 Commandes clients ({orders.length})
          </h3>

          {ordersLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <RefreshCw size={36} className="spin" style={{ color: 'var(--primary-green)' }} />
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
              Aucune commande enregistrée pour le moment.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
              {orders.map(o => (
                <div key={o._id} style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderRadius: '20px', 
                  border: '1px solid var(--border-color)', 
                  boxShadow: 'var(--shadow-premium)', 
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-premium)';
                }}
                >
                  {/* Card Header */}
                  <div style={{ 
                    backgroundColor: 'rgba(21, 58, 137, 0.05)', 
                    padding: '1.25rem 1.5rem', 
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Commande n°</span>
                      <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-green)', marginTop: '0.1rem' }}>{o.order_number}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Date</span>
                      <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.1rem', fontWeight: '600' }}>
                        {new Date(o.created_at || o.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                    
                    {/* Client Info */}
                    <div>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Informations Client</h4>
                      <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)' }}>
                        <strong style={{ fontSize: '1.05rem', display: 'block', marginBottom: '0.25rem', color: 'var(--primary-green)' }}>{o.first_name || 'N/A'} {o.last_name || ''}</strong>
                        <a href={`mailto:${o.email}`} style={{ color: 'var(--primary-gold)', display: 'block', marginBottom: '0.5rem', textDecoration: 'none', fontWeight: '600' }}>{o.email || 'N/A'}</a>
                        <div style={{ lineHeight: '1.4', color: 'var(--text-primary)' }}>
                          {o.address || 'N/A'}<br/>
                          {o.postal_code || ''} {o.city || ''}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Produits Achetés</h4>
                      <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)' }}>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {(o.items || []).map((item, idx) => (
                            <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: idx !== (o.items || []).length - 1 ? '1px solid var(--border-color)' : 'none', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                              <span style={{ fontWeight: '500' }}>{item.name || 'Produit'}</span>
                              <span style={{ fontWeight: '800', color: 'var(--primary-green)', backgroundColor: 'rgba(21, 58, 137, 0.1)', padding: '0.1rem 0.5rem', borderRadius: '20px', fontSize: '0.8rem' }}>x{item.quantity || 1}</span>
                            </li>
                          ))}
                        </ul>
                        {(o.shipping > 0) && (
                          <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <span>Frais de livraison</span>
                            <span>{(o.shipping || 0).toFixed(2)} €</span>
                          </div>
                        )}
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '800', color: 'var(--primary-green)' }}>
                          <span>Total Payé</span>
                          <span>{(o.total || 0).toFixed(2)} €</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Management */}
                    <div style={{ marginTop: 'auto' }}>
                      <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Gestion du Statut</h4>
                      <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.03)' }}>
                        <div style={{ position: 'relative', marginBottom: '1rem' }}>
                          <select
                            value={o.status || 'Payé'}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'Expédié') {
                                const tracking = prompt('Veuillez saisir le numéro de suivi Colissimo :', o.tracking_number || '');
                                if (tracking === null) return; // User cancelled prompt
                                handleUpdateOrderStatus(o._id, val, tracking);
                              } else {
                                handleUpdateOrderStatus(o._id, val);
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '0.75rem 1.25rem',
                              borderRadius: '8px',
                              border: '2px solid',
                              borderColor: o.status === 'Livré' ? 'var(--success)' : 
                                           o.status === 'Expédié' ? '#8b5cf6' : 
                                           o.status === 'En préparation' ? 'var(--warning)' : 'var(--border-color)',
                              backgroundColor: o.status === 'Livré' ? 'rgba(16, 185, 129, 0.05)' : 
                                             o.status === 'Expédié' ? 'rgba(139, 92, 246, 0.05)' : 
                                             o.status === 'En préparation' ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-secondary)',
                              color: 'var(--text-primary)',
                              fontSize: '0.95rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              outline: 'none',
                              appearance: 'none',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                            }}
                          >
                            <option value="Payé">Payé (En attente)</option>
                            <option value="En préparation">📦 En préparation</option>
                            <option value="Expédié">🚚 Expédié au transporteur</option>
                            <option value="Livré">✅ Livré au client</option>
                          </select>
                          {/* Dropdown chevron icon */}
                          <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </div>
                        </div>
                        
                        {o.tracking_number && (
                          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Numéro de suivi Colissimo</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.95rem' }}>{o.tracking_number}</span>
                            <a href={`https://www.laposte.fr/outils/suivre-un-envoi?code=${o.tracking_number}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-green)', fontWeight: 'bold', textDecoration: 'none', marginTop: '0.25rem', display: 'inline-block' }}>Suivre sur La Poste →</a>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SETTINGS PANEL */}
      {activeSubTab === 'settings' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--serif)', color: 'var(--primary-green)', marginBottom: '1.5rem', borderBottom: '2px solid var(--primary-gold)', paddingBottom: '0.5rem' }}>
            ⚙️ Paramètres de Livraison
          </h3>
          
          <form onSubmit={handleSaveSettings} style={{ background: 'var(--bg-secondary)', backdropFilter: 'blur(10px)', padding: '2.5rem', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-premium)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
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
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    border: '2px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    fontSize: '1.1rem',
                    color: 'var(--text-primary)',
                    fontWeight: '600',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                  }}
                  required
                />
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  Coût fixe appliqué si le sous-total du panier est inférieur au seuil de gratuité (ex : 6.90 €).
                </p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '700', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
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
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    border: '2px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    fontSize: '1.1rem',
                    color: 'var(--text-primary)',
                    fontWeight: '600',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                  }}
                  required
                />
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  Le montant minimum d'achat pour lequel la livraison devient gratuite (ex : 60.00 €).
                </p>
              </div>

              <button 
                type="submit" 
                disabled={settingsLoading}
                style={{ 
                  marginTop: '1.5rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.75rem',
                  backgroundColor: 'var(--primary-green)',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '1.1rem',
                  cursor: settingsLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(21, 58, 137, 0.2)',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
              >
                {settingsLoading ? <RefreshCw size={22} className="spin" /> : <Save size={22} />}
                Enregistrer les paramètres
              </button>
            </div>
          </form>
        </div>
      )}

      {/* USERS PANEL */}
      {activeSubTab === 'users' && (
        <div>
          <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--serif)', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Gestion des Utilisateurs ({users.length})
          </h3>
          
          {usersLoading && users.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <RefreshCw size={36} className="spin" style={{ color: 'var(--primary-green)' }} />
            </div>
          ) : (
            <div style={{ background: 'var(--bg-secondary)', backdropFilter: 'blur(10px)', borderRadius: '15px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-premium)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Utilisateur</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Adresse E-mail</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>Rôle</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'center' }}>Mode Test (Bypass Stripe)</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                        {u.first_name} {u.last_name}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          fontWeight: 'bold', 
                          padding: '0.25rem 0.6rem', 
                          borderRadius: '20px', 
                          backgroundColor: u.is_admin ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0,0,0,0.05)', 
                          color: u.is_admin ? 'var(--primary-gold)' : 'var(--text-secondary)' 
                        }}>
                          {u.is_admin ? 'Administrateur' : 'Client'}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                        <button
                          onClick={() => handleToggleTestPayment(u._id, u.allow_test_payment)}
                          style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '30px',
                            border: '1px solid',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            borderColor: u.allow_test_payment ? 'var(--success)' : 'var(--border-color)',
                            backgroundColor: u.allow_test_payment ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                            color: u.allow_test_payment ? 'var(--success)' : 'var(--text-secondary)'
                          }}
                        >
                          {u.allow_test_payment ? 'Autorisé 🧪' : 'Interdit 🔒'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
