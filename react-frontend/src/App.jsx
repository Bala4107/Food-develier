import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_BASE_URL = 'http://localhost:8081/api/orders';

const PREDEFINED_ITEMS = [
  { 
    name: 'Ghee Podi Masala Dosa', 
    category: 'Breakfast', 
    price: 120.00, 
    desc: 'Crispy golden crepe smeared with spiced gunpowder and clarified butter, served with sambar and chutney.', 
    icon: 'bi-record-circle-fill text-success',
    img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop'
  },
  { 
    name: 'Idli Vada Sambar Combo', 
    category: 'Breakfast', 
    price: 80.00, 
    desc: 'Two pillowy soft steamed rice cakes and one crunchy lentil doughnut, dipped in piping hot sambar.', 
    icon: 'bi-record-circle-fill text-success',
    img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop'
  },
  { 
    name: 'Chettinad Chicken Biryani', 
    category: 'Main Course', 
    price: 220.00, 
    desc: 'Fragrant Seeraga Samba rice cooked with succulent chicken, spices, and fresh herbs from Chettinad.', 
    icon: 'bi-egg-fried text-danger',
    img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop'
  },
  { 
    name: 'Parotta Kurma Feast (2pcs)', 
    category: 'Main Course', 
    price: 90.00, 
    desc: 'Layered flaky flatbread beaten to soft layers, served with aromatic mixed vegetable salna.', 
    icon: 'bi-egg-fried text-success',
    img: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500&auto=format&fit=crop'
  },
  { 
    name: 'Traditional Ghee Pongal', 
    category: 'Breakfast', 
    price: 100.00, 
    desc: 'Comforting mash of rice and split yellow lentils, tempered with black pepper, cumin, ginger, cashew, and ghee.', 
    icon: 'bi-record-circle-fill text-success',
    img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop'
  },
  { 
    name: 'Madurai Special Jigarthanda', 
    category: 'Drinks & Dessert', 
    price: 110.00, 
    desc: 'Famous Madurai cooling beverage with almond gum, sarsaparilla syrup, milk, and cream ice cream.', 
    icon: 'bi-cup-straw text-primary',
    img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop'
  },
  { 
    name: 'South Indian Filter Coffee', 
    category: 'Drinks & Dessert', 
    price: 40.00, 
    desc: 'Freshly brewed strong decoction frothed with hot milk in a traditional brass dabarah and tumbler.', 
    icon: 'bi-cup-hot text-warning',
    img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop'
  }
];

function App() {
  const [orders, setOrders] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [selectedItems, setSelectedItems] = useState([]); // Array of { name, quantity }
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'track' | 'history'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Poll orders every 2 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Update selected order details on fresh poll
  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find(o => o.id === selectedOrder.id);
      if (updated) {
        setSelectedOrder(updated);
      }
    }
  }, [orders]);

  // Resume active mock orders on boot if we are in demo mode
  useEffect(() => {
    if (isDemoMode) {
      const existingOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
      existingOrders.forEach(o => {
        if (!['DELIVERED', 'CANCELLED', 'PAYMENT_FAILED'].includes(o.status)) {
          resumeOrderProgress(o);
        }
      });
    }
  }, [isDemoMode]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setOrders(response.data.sort((a, b) => b.id - a.id));
      setError(null); // Clear connection errors once successful
      setIsDemoMode(false);
    } catch (err) {
      console.warn('Failed to fetch orders from order-service, enabling Demo Mode', err.message);
      setIsDemoMode(true);
      // Load mock orders from local storage
      const local = JSON.parse(localStorage.getItem('mock_orders') || '[]');
      setOrders(local.sort((a, b) => b.id - a.id));
    }
  };

  const handleAddItem = (itemName) => {
    const existing = selectedItems.find(i => i.name === itemName);
    if (existing) {
      setSelectedItems(selectedItems.map(i => i.name === itemName ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setSelectedItems([...selectedItems, { name: itemName, qty: 1 }]);
    }
  };

  const handleRemoveItem = (itemName) => {
    const existing = selectedItems.find(i => i.name === itemName);
    if (existing && existing.qty > 1) {
      setSelectedItems(selectedItems.map(i => i.name === itemName ? { ...i, qty: i.qty - 1 } : i));
    } else {
      setSelectedItems(selectedItems.filter(i => i.name !== itemName));
    }
  };

  const getItemQuantity = (itemName) => {
    const found = selectedItems.find(i => i.name === itemName);
    return found ? found.qty : 0;
  };

  const calculateSubtotal = () => {
    return selectedItems.reduce((acc, cartItem) => {
      const menu = PREDEFINED_ITEMS.find(m => m.name === cartItem.name);
      return acc + (menu ? menu.price * cartItem.qty : 0);
    }, 0);
  };

  const calculateGST = () => {
    return calculateSubtotal() * 0.05; // 5% GST
  };

  const calculateDeliveryCharge = () => {
    return calculateSubtotal() > 0 ? 30.00 : 0.00; // Flat ₹30 delivery fee
  };

  const calculateGrandTotal = () => {
    return (calculateSubtotal() + calculateGST() + calculateDeliveryCharge()).toFixed(2);
  };

  // Simulate progress steps for Demo Mode
  const simulateOrderProgress = (orderId) => {
    const steps = [
      { status: 'PAYMENT_PROCESSING', delay: 2500 },
      { status: 'PAYMENT_SUCCESS', delay: 3000 },
      { status: 'KITCHEN_PREPARING', delay: 5000 },
      { status: 'OUT_FOR_DELIVERY', delay: 6000 },
      { status: 'DELIVERED', delay: 6000 }
    ];

    let currentStep = 0;

    const runNextStep = () => {
      if (currentStep >= steps.length) return;
      const step = steps[currentStep];

      setTimeout(() => {
        const existingOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
        const updatedOrders = existingOrders.map(o => {
          if (o.id === orderId) {
            return { ...o, status: step.status };
          }
          return o;
        });
        localStorage.setItem('mock_orders', JSON.stringify(updatedOrders));
        setOrders(updatedOrders);

        setSelectedOrder(prev => {
          if (prev && prev.id === orderId) {
            return { ...prev, status: step.status };
          }
          return prev;
        });

        currentStep++;
        runNextStep();
      }, step.delay);
    };

    runNextStep();
  };

  // Resume simulation loop for pending orders in Demo Mode
  const resumeOrderProgress = (order) => {
    const steps = [
      { status: 'PAYMENT_PROCESSING', delay: 2500 },
      { status: 'PAYMENT_SUCCESS', delay: 3000 },
      { status: 'KITCHEN_PREPARING', delay: 5000 },
      { status: 'OUT_FOR_DELIVERY', delay: 6000 },
      { status: 'DELIVERED', delay: 6000 }
    ];

    const currentIndex = steps.findIndex(s => s.status === order.status);
    let remainingSteps = [];
    if (order.status === 'PLACED') {
      remainingSteps = steps;
    } else if (currentIndex !== -1) {
      remainingSteps = steps.slice(currentIndex + 1);
    } else {
      return;
    }

    let currentStep = 0;

    const runNextStep = () => {
      if (currentStep >= remainingSteps.length) return;
      const step = remainingSteps[currentStep];

      setTimeout(() => {
        const existingOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
        const updatedOrders = existingOrders.map(o => {
          if (o.id === order.id) {
            return { ...o, status: step.status };
          }
          return o;
        });
        localStorage.setItem('mock_orders', JSON.stringify(updatedOrders));
        setOrders(updatedOrders);

        setSelectedOrder(prev => {
          if (prev && prev.id === order.id) {
            return { ...prev, status: step.status };
          }
          return prev;
        });

        currentStep++;
        runNextStep();
      }, step.delay);
    };

    runNextStep();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || selectedItems.length === 0 || !deliveryAddress) {
      setError('Please provide a name, delivery address, and add at least one item.');
      return;
    }
    setError(null);
    setLoading(true);

    const itemsFormatted = selectedItems.map(i => `${i.name} (x${i.qty})`).join(', ');
    const grandTotal = parseFloat(calculateGrandTotal());

    const payload = {
      customerName,
      items: itemsFormatted,
      totalAmount: grandTotal,
      deliveryAddress
    };

    if (isDemoMode) {
      // Offline Simulated Flow
      setTimeout(() => {
        const newOrder = {
          id: Math.floor(100000 + Math.random() * 900000), // Random 6 digit order number
          customerName,
          items: itemsFormatted,
          totalAmount: grandTotal,
          deliveryAddress,
          status: 'PLACED'
        };

        const existingOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
        const updatedOrders = [newOrder, ...existingOrders];
        localStorage.setItem('mock_orders', JSON.stringify(updatedOrders));

        setCustomerName('');
        setSelectedItems([]);
        setDeliveryAddress('');
        setSelectedOrder(newOrder);
        setOrders(updatedOrders);
        setActiveTab('track');
        setLoading(false);

        // Start progress simulation
        simulateOrderProgress(newOrder.id);
      }, 1000);
      return;
    }

    // Real REST flow
    try {
      const response = await axios.post(API_BASE_URL, payload);
      setCustomerName('');
      setSelectedItems([]);
      setDeliveryAddress('');
      setSelectedOrder(response.data);
      setError(null);
      setActiveTab('track');
      fetchOrders();
    } catch (err) {
      setError('Failed to create order. Verify that the backend microservices are running on ports 8081-8084.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMenuItems = PREDEFINED_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PLACED':
        return <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2"><i className="bi bi-receipt me-1"></i> Order Placed</span>;
      case 'PAYMENT_PROCESSING':
        return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-3 py-2"><i className="bi bi-credit-card-2-front-fill me-1"></i> Payment Processing</span>;
      case 'PAYMENT_SUCCESS':
        return <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle rounded-pill px-3 py-2"><i className="bi bi-wallet2 me-1"></i> Paid Successfully</span>;
      case 'KITCHEN_PREPARING':
        return <span className="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle rounded-pill px-3 py-2"><i className="bi bi-fire me-1"></i> Preparing Food</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="badge bg-dark-subtle text-dark border border-dark-subtle rounded-pill px-3 py-2"><i className="bi bi-bicycle me-1"></i> Out for Delivery</span>;
      case 'DELIVERED':
        return <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2"><i className="bi bi-check-circle-fill me-1"></i> Delivered</span>;
      case 'CANCELLED':
      case 'PAYMENT_FAILED':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-2"><i className="bi bi-x-circle-fill me-1"></i> Cancelled</span>;
      default:
        return <span className="badge bg-light text-dark border rounded-pill px-3 py-2">{status}</span>;
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'PLACED': return 15;
      case 'PAYMENT_PROCESSING': return 35;
      case 'PAYMENT_SUCCESS': return 55;
      case 'KITCHEN_PREPARING': return 75;
      case 'OUT_FOR_DELIVERY': return 90;
      case 'DELIVERED': return 100;
      default: return 100;
    }
  };

  const getProgressColor = (status) => {
    if (status === 'CANCELLED' || status === 'PAYMENT_FAILED') return 'bg-danger';
    if (status === 'DELIVERED') return 'bg-success';
    return 'bg-coral';
  };

  // Metrics summary calculator
  const metrics = {
    placed: orders.filter(o => o.status === 'PLACED').length,
    processing: orders.filter(o => ['PAYMENT_PROCESSING', 'PAYMENT_SUCCESS'].includes(o.status)).length,
    preparing: orders.filter(o => o.status === 'KITCHEN_PREPARING').length,
    shipping: orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => ['CANCELLED', 'PAYMENT_FAILED'].includes(o.status)).length
  };

  // Check if there is an active tracking order
  const activeOrderExists = orders.some(o => !['DELIVERED', 'CANCELLED', 'PAYMENT_FAILED'].includes(o.status));

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: '#f8fafc' }}>
      {/* Premium Web Styling */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        
        :root {
          --primary-coral: #ff4757;
          --primary-hover: #ff2a3b;
          --primary-light: #fff0f2;
          --text-slate: #0f172a;
          --text-muted: #64748b;
          --card-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
          --hover-shadow: 0 10px 30px rgba(255, 71, 87, 0.12);
        }

        body {
          font-family: 'Outfit', sans-serif;
          color: var(--text-slate);
        }
        
        .bg-coral { background-color: var(--primary-coral) !important; }
        .text-coral { color: var(--primary-coral) !important; }
        .border-coral { border-color: var(--primary-coral) !important; }
        
        .btn-coral {
          background-color: var(--primary-coral);
          color: white;
          border: none;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .btn-coral:hover:not(:disabled) {
          background-color: var(--primary-hover);
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 71, 87, 0.3);
        }

        .btn-outline-coral {
          border: 1px solid var(--primary-coral);
          color: var(--primary-coral);
          background: transparent;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .btn-outline-coral:hover {
          background-color: var(--primary-coral);
          color: white;
        }

        .sticky-navbar {
          position: sticky;
          top: 0;
          z-index: 1020;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
        }

        .navbar-brand-logo {
          font-size: 1.65rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .nav-tabs-custom {
          background: #f1f5f9;
          padding: 4px;
          border-radius: 100px;
          display: inline-flex;
        }

        .nav-link-custom {
          border-radius: 100px;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 8px 24px;
          color: var(--text-muted);
          border: none;
          background: transparent;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .nav-link-custom.active {
          background: white;
          color: var(--primary-coral);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
        }

        .hero-banner {
          background: linear-gradient(135deg, #fff0f2 0%, #fffbfb 100%);
          border-radius: 30px;
          padding: 4rem 2rem;
          margin-bottom: 2.5rem;
          border: 1px solid rgba(255, 71, 87, 0.08);
          position: relative;
          overflow: hidden;
        }

        .hero-graphics {
          position: absolute;
          right: -20px;
          bottom: -20px;
          opacity: 0.08;
          font-size: 15rem;
          color: var(--primary-coral);
          pointer-events: none;
        }

        .food-card {
          border-radius: 24px;
          overflow: hidden;
          background: white;
          border: 1px solid rgba(226, 232, 240, 0.6);
          box-shadow: var(--card-shadow);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
        }

        .food-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--hover-shadow);
          border-color: rgba(255, 71, 87, 0.15);
        }

        .food-card img {
          height: 180px;
          object-fit: cover;
          width: 100%;
          transition: transform 0.5s ease;
        }

        .food-card:hover img {
          transform: scale(1.04);
        }

        .checkout-box {
          background: white;
          border-radius: 24px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: var(--card-shadow);
          padding: 1.75rem;
          position: sticky;
          top: 90px;
        }

        .stepper-node {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px auto;
          font-size: 1.25rem;
          transition: all 0.3s ease;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
        }

        .stepper-node.pending {
          background: #e2e8f0;
          color: #94a3b8;
        }

        .stepper-node.active {
          background: var(--primary-coral);
          color: white;
          box-shadow: 0 0 0 5px rgba(255, 71, 87, 0.2);
          animation: pulse-border 1.5s infinite alternate;
        }

        .stepper-node.completed {
          background: #10b981;
          color: white;
        }

        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0px rgba(255, 71, 87, 0.4); }
          100% { box-shadow: 0 0 0 8px rgba(255, 71, 87, 0); }
        }

        .map-track {
          background: #f1f5f9;
          background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px);
          background-size: 24px 24px;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(226, 232, 240, 0.8);
        }

        .animated-bike {
          animation: ride 7s linear infinite alternate;
        }

        @keyframes ride {
          0% { transform: translate(5%, 0); }
          100% { transform: translate(80%, 0); }
        }

        .category-tab-btn {
          border-radius: 100px;
          border: 1px solid #cbd5e1;
          background: white;
          padding: 8px 20px;
          font-weight: 600;
          font-size: 0.88rem;
          color: var(--text-muted);
          transition: all 0.2s ease;
        }

        .category-tab-btn.active {
          background: var(--primary-coral);
          border-color: var(--primary-coral);
          color: white;
        }

        .category-tab-btn:hover:not(.active) {
          border-color: #94a3b8;
          color: var(--text-slate);
        }

        .hover-card {
          transition: all 0.2s ease;
        }
        .hover-card:hover {
          transform: translateX(4px);
          border-color: var(--primary-coral) !important;
        }

        .cart-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary-coral);
          position: absolute;
          top: 6px;
          right: 6px;
          animation: pulse 1.5s infinite;
        }
      `}</style>

      {/* Modern Sticky Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light sticky-navbar py-3">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center text-coral navbar-brand-logo" href="#/">
            <i className="bi bi-lightning-charge-fill me-2 fs-3"></i>
            Food Time
          </a>

          {/* Navigation Tabs */}
          <div className="mx-auto my-2 my-lg-0">
            <div className="nav-tabs-custom">
              <button 
                className={`nav-link-custom ${activeTab === 'menu' ? 'active' : ''}`}
                onClick={() => setActiveTab('menu')}
              >
                <i className="bi bi-compass me-1"></i> Explore Menu
              </button>
              <button 
                className={`nav-link-custom ${activeTab === 'track' ? 'active' : ''} position-relative`}
                onClick={() => setActiveTab('track')}
              >
                <i className="bi bi-geo-alt me-1"></i> Live Tracker
                {activeOrderExists && <span className="cart-dot"></span>}
              </button>
              <button 
                className={`nav-link-custom ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <i className="bi bi-clock-history me-1"></i> Order Dashboard
              </button>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            {isDemoMode ? (
              <span className="badge bg-warning-subtle text-warning border border-warning px-3 py-2 rounded-pill fs-7 d-flex align-items-center gap-1">
                <i className="bi bi-info-circle-fill"></i>
                Demo Mode
              </span>
            ) : (
              <span className="badge bg-success-subtle text-success border border-success px-3 py-2 rounded-pill fs-7 d-flex align-items-center gap-1">
                <i className="bi bi-cloud-check-fill"></i>
                Connected
              </span>
            )}
            {activeOrderExists && (
              <span className="badge bg-coral px-3 py-2 rounded-pill fs-7 d-none d-md-inline-block">
                <span className="spinner-grow spinner-grow-sm me-1" role="status" aria-hidden="true"></span>
                Active Delivery
              </span>
            )}
            <button 
              className="btn btn-outline-coral rounded-pill px-3 py-1.5 position-relative"
              onClick={() => {
                setActiveTab('menu');
                setTimeout(() => {
                  document.getElementById('checkout-form-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
            >
              <i className="bi bi-cart3 fs-5 me-1"></i>
              <span className="badge bg-coral rounded-circle ms-1">{selectedItems.reduce((a, b) => a + b.qty, 0)}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="container mt-4">
        {/* Connection Error Banner (Only shown if NOT in demo fallback mode) */}
        {error && !isDemoMode && (
          <div className="alert alert-danger shadow-sm border-0 rounded-4 d-flex align-items-center mb-4 p-3 animate__animated animate__fadeIn" role="alert">
            <i className="bi bi-cloud-slash-fill fs-4 me-3 text-danger"></i>
            <div className="flex-grow-1">
              <h6 className="alert-heading fw-bold mb-0 text-danger-emphasis">Backend Connectivity Offline</h6>
              <span className="small text-danger">{error}</span>
            </div>
            <button className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 ms-3 fw-bold" onClick={fetchOrders}>
              <i className="bi bi-arrow-clockwise me-1"></i>Retry
            </button>
          </div>
        )}

        {/* Tab Content 1: EXPLORE MENU */}
        {activeTab === 'menu' && (
          <div className="animate__animated animate__fadeIn">
            {/* Hero Header */}
            <div className="hero-banner">
              <div className="row align-items-center position-relative z-1">
                <div className="col-lg-7">
                  <h1 className="fw-extrabold display-5 mb-3 text-dark">
                    Delicious food, <br />
                    delivered to your <span className="text-coral">Doorstep</span>.
                  </h1>
                  <p className="text-muted fs-5 mb-4 col-md-10">
                    Freshly prepared local delicacies prepared with traditional recipes and premium ingredients. Order in just a few clicks!
                  </p>
                  
                  {/* Search Bar inside Hero */}
                  <div className="bg-white p-2 rounded-pill shadow-sm border d-flex align-items-center max-w-500">
                    <i className="bi bi-search text-muted ms-3 me-2 fs-5"></i>
                    <input 
                      type="text" 
                      className="form-control border-0 bg-transparent py-2 shadow-none" 
                      placeholder="Search for filter coffee, biryani, pongal..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button className="btn btn-link text-muted p-1 me-2" onClick={() => setSearchTerm('')}>
                        <i className="bi bi-x-circle-fill"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <i className="bi bi-egg-fried hero-graphics"></i>
            </div>

            <div className="row g-4">
              {/* Menu Grid (Left) */}
              <div className="col-lg-8">
                {/* Categories Slider */}
                <div className="d-flex align-items-center justify-content-between mb-4 overflow-x-auto pb-2 gap-2">
                  <h4 className="fw-bold mb-0 text-dark">Our Menu</h4>
                  <div className="d-flex gap-2">
                    {['All', 'Breakfast', 'Main Course', 'Drinks & Dessert'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        className={`category-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu items listing grid */}
                {filteredMenuItems.length === 0 ? (
                  <div className="text-center py-5 bg-white rounded-4 border text-muted my-3">
                    <i className="bi bi-search-heart fs-1 d-block mb-2 text-coral"></i>
                    No dishes match your search or filter. Try typing something else!
                  </div>
                ) : (
                  <div className="row g-4">
                    {filteredMenuItems.map((item, index) => (
                      <div className="col-md-6" key={index}>
                        <div className="food-card d-flex flex-column">
                          <div className="position-relative">
                            <img src={item.img} alt={item.name} />
                            <span className="badge bg-white text-dark shadow-sm position-absolute top-3 start-3 border rounded-pill px-3 py-1.5 fs-7 fw-bold">
                              <i className={`bi ${item.icon} me-1`}></i>{item.category}
                            </span>
                          </div>
                          <div className="p-4 d-flex flex-column flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="fw-bold mb-0 text-dark">{item.name}</h5>
                              <span className="fw-bold text-coral fs-5">₹{item.price.toFixed(2)}</span>
                            </div>
                            <p className="text-muted small mb-4 flex-grow-1">{item.desc}</p>
                            
                            {/* Action Button */}
                            <div className="d-flex align-items-center justify-content-between mt-auto">
                              <span className="small text-muted fw-semibold">Hot & Fresh</span>
                              {getItemQuantity(item.name) > 0 ? (
                                <div className="d-flex align-items-center bg-coral-light border border-coral rounded-pill p-1">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light rounded-circle p-1 d-flex align-items-center justify-content-center border"
                                    style={{ width: '28px', height: '28px' }}
                                    onClick={() => handleRemoveItem(item.name)}
                                  >
                                    <i className="bi bi-dash"></i>
                                  </button>
                                  <span className="px-3 fw-bold text-coral">{getItemQuantity(item.name)}</span>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light rounded-circle p-1 d-flex align-items-center justify-content-center border"
                                    style={{ width: '28px', height: '28px' }}
                                    onClick={() => handleAddItem(item.name)}
                                  >
                                    <i className="bi bi-plus"></i>
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-outline-coral rounded-pill px-4 py-2"
                                  onClick={() => handleAddItem(item.name)}
                                >
                                  Add to Cart
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checkout / Cart Sidebox (Right) */}
              <div className="col-lg-4" id="checkout-form-section">
                <div className="checkout-box">
                  <h4 className="fw-bold mb-4 text-dark d-flex align-items-center">
                    <i className="bi bi-cart3 me-2 text-coral"></i>My Order Cart
                  </h4>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="customerName" className="form-label fw-semibold text-secondary">Customer Details</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 rounded-start-3"><i className="bi bi-person text-muted"></i></span>
                        <input
                          type="text"
                          className="form-control bg-light border-start-0 rounded-end-3"
                          id="customerName"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="deliveryAddress" className="form-label fw-semibold text-secondary">Delivery Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 rounded-start-3"><i className="bi bi-geo-alt text-muted"></i></span>
                        <input
                          type="text"
                          className="form-control bg-light border-start-0 rounded-end-3"
                          id="deliveryAddress"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Complete drop address"
                          required
                        />
                      </div>
                    </div>

                    {/* Cart Summary */}
                    {selectedItems.length > 0 ? (
                      <div className="p-3 bg-light rounded-4 border mb-4">
                        <div className="fw-bold text-muted small uppercase mb-3">Selected Items</div>
                        {selectedItems.map((cartItem, idx) => {
                          const itemDetails = PREDEFINED_ITEMS.find(m => m.name === cartItem.name);
                          const cost = itemDetails ? itemDetails.price * cartItem.qty : 0;
                          return (
                            <div className="d-flex justify-content-between text-dark small py-2 border-bottom border-light" key={idx}>
                              <span>
                                <strong className="text-coral me-2">{cartItem.qty}x</strong> 
                                {cartItem.name}
                              </span>
                              <span className="fw-semibold">₹{cost.toFixed(2)}</span>
                            </div>
                          );
                        })}
                        <div className="d-flex justify-content-between text-muted small pt-3 pb-1">
                          <span>Subtotal</span>
                          <span>₹{calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between text-muted small py-1">
                          <span>GST (5%)</span>
                          <span>₹{calculateGST().toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between text-muted small py-1 pb-3 border-bottom">
                          <span>Delivery Charge</span>
                          <span>₹{calculateDeliveryCharge().toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold text-dark fs-5 mt-3">
                          <span>Total Amount</span>
                          <span className="text-coral">₹{calculateGrandTotal()}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-light text-center py-5 rounded-4 border text-muted small mb-4">
                        <i className="bi bi-bag-plus fs-1 d-block mb-2 text-coral" style={{ opacity: 0.7 }}></i>
                        Your order cart is empty.<br />Add delicious dishes from the menu to get started.
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn btn-coral w-100 py-3 rounded-pill fw-bold shadow-sm"
                      disabled={loading || selectedItems.length === 0}
                    >
                      {loading ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Placing Order...
                        </span>
                      ) : (
                        <span>Confirm Order & Pay</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: LIVE TRACKER */}
        {activeTab === 'track' && (
          <div className="animate__animated animate__fadeIn">
            {selectedOrder ? (
              <div className="row g-4 justify-content-center">
                <div className="col-lg-9">
                  <div className="checkout-box p-4 border border-coral shadow-lg">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="fw-bold text-dark mb-0 d-flex align-items-center">
                        <i className="bi bi-geo-alt-fill me-2 text-coral"></i>Live Tracking Order #{selectedOrder.id}
                      </h4>
                      <button
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1"
                        onClick={() => setSelectedOrder(null)}
                      >
                        Reset Tracker
                      </button>
                    </div>

                    <div className="row g-3 mb-4 p-3 bg-light rounded-4 border text-muted small">
                      <div className="col-md-4">
                        <i className="bi bi-person-fill text-coral me-1"></i> Customer: <strong className="text-dark">{selectedOrder.customerName}</strong>
                      </div>
                      <div className="col-md-5">
                        <i className="bi bi-geo-alt-fill text-coral me-1"></i> Address: <strong className="text-dark">{selectedOrder.deliveryAddress}</strong>
                      </div>
                      <div className="col-md-3 text-md-end">
                        <i className="bi bi-wallet2 text-coral me-1"></i> Amount: <strong className="text-dark">₹{selectedOrder.totalAmount.toFixed(2)}</strong>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress mb-4" style={{ height: '10px', borderRadius: '100px' }}>
                      <div
                        className={`progress-bar progress-bar-striped progress-bar-animated ${getProgressColor(selectedOrder.status)}`}
                        style={{ width: `${getProgressPercentage(selectedOrder.status)}%` }}
                      ></div>
                    </div>

                    {/* Horizontal Custom Stepper */}
                    <div className="row text-center mb-5 mt-2">
                      <div className="col">
                        <div className={`stepper-node ${['PLACED', 'PAYMENT_PROCESSING', 'PAYMENT_SUCCESS', 'KITCHEN_PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.status) ? 'completed' : 'pending'}`}>
                          <i className="bi bi-cart-check"></i>
                        </div>
                        <div className="small fw-bold mt-1 text-secondary">Order Placed</div>
                      </div>
                      <div className="col">
                        <div className={`stepper-node ${selectedOrder.status === 'PAYMENT_PROCESSING' ? 'active' : ['PAYMENT_SUCCESS', 'KITCHEN_PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.status) ? 'completed' : 'pending'}`}>
                          <i className="bi bi-credit-card"></i>
                        </div>
                        <div className="small fw-bold mt-1 text-secondary">Payment</div>
                      </div>
                      <div className="col">
                        <div className={`stepper-node ${selectedOrder.status === 'KITCHEN_PREPARING' ? 'active' : ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.status) ? 'completed' : 'pending'}`}>
                          <i className="bi bi-fire"></i>
                        </div>
                        <div className="small fw-bold mt-1 text-secondary">Kitchen</div>
                      </div>
                      <div className="col">
                        <div className={`stepper-node ${selectedOrder.status === 'OUT_FOR_DELIVERY' ? 'active' : selectedOrder.status === 'DELIVERED' ? 'completed' : 'pending'}`}>
                          <i className="bi bi-bicycle"></i>
                        </div>
                        <div className="small fw-bold mt-1 text-secondary">In Transit</div>
                      </div>
                      <div className="col">
                        <div className={`stepper-node ${selectedOrder.status === 'DELIVERED' ? 'completed' : 'pending'}`}>
                          <i className="bi bi-check-circle"></i>
                        </div>
                        <div className="small fw-bold mt-1 text-secondary">Delivered</div>
                      </div>
                    </div>

                    {/* Animated Delivery Map Simulation */}
                    {(selectedOrder.status === 'OUT_FOR_DELIVERY' || selectedOrder.status === 'DELIVERED') && (
                      <div className="map-track p-4 mb-4 text-center">
                        <div className="fw-bold text-secondary-emphasis small uppercase mb-3">Live Dispatch Map</div>
                        <div className="d-flex align-items-center justify-content-between px-4 position-relative py-3">
                          <div>
                            <i className="bi bi-shop fs-2 text-coral"></i>
                            <div className="small text-muted mt-1 fw-semibold">Kitchen</div>
                          </div>

                          {/* Map Connection Line and Moving Rider */}
                          <div className="flex-grow-1 mx-4 position-relative">
                            <hr className="border-secondary border-dashed" style={{ borderStyle: 'dashed', borderWidth: '2px' }} />
                            <div
                              className={`position-absolute top-0 animated-bike ${selectedOrder.status === 'DELIVERED' ? 'end-0' : ''}`}
                              style={{ transition: 'all 2s ease', marginTop: '-14px' }}
                            >
                              <i className="bi bi-bicycle fs-2 text-success"></i>
                            </div>
                          </div>

                          <div>
                            <i className="bi bi-house-door-fill fs-2 text-coral"></i>
                            <div className="small text-muted mt-1 fw-semibold">Delivery Drop</div>
                          </div>
                        </div>
                        <div className="small text-muted mt-3 py-2 border-top">
                          <i className="bi bi-info-circle-fill me-1 text-coral"></i> Courier assigned: <strong>James Swift</strong> is delivering your order.
                        </div>
                      </div>
                    )}

                    {/* Info status detail */}
                    <div className="bg-light p-3 rounded-4 border text-center">
                      <span className="me-2 text-muted fw-semibold">Order Status:</span> {getStatusBadge(selectedOrder.status)}
                      {selectedOrder.status === 'CANCELLED' && (
                        <div className="text-danger small mt-2 fw-semibold">
                          <i className="bi bi-exclamation-triangle-fill me-1"></i> Order cancelled automatically due to payment failure.
                        </div>
                      )}
                      {selectedOrder.status === 'DELIVERED' && (
                        <div className="text-success small mt-2 fw-semibold">
                          <i className="bi bi-heart-fill me-1 text-danger"></i> Enjoy your meal! Thank you for ordering from Food Time.
                        </div>
                      )}
                    </div>

                    <div className="mt-4 p-3 bg-light rounded-4 border">
                      <div className="fw-bold text-muted small uppercase mb-2">Order Items:</div>
                      <div className="text-dark font-monospace small">{selectedOrder.items}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-5 bg-white rounded-4 border text-muted shadow-sm col-lg-8 mx-auto my-5">
                <i className="bi bi-pin-map fs-1 text-coral d-block mb-3" style={{ opacity: 0.8 }}></i>
                <h5 className="fw-bold text-dark">No Order Selected for Tracking</h5>
                <p className="small mb-4">Go to the Order Dashboard to select a past order, or order fresh food from the Menu to live track it.</p>
                <button className="btn btn-coral rounded-pill px-4 py-2" onClick={() => setActiveTab('menu')}>
                  Browse Menu & Order
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab Content 3: ORDER HISTORY / DASHBOARD */}
        {activeTab === 'history' && (
          <div className="animate__animated animate__fadeIn">
            {/* Dashboard Overview Metrics */}
            <div className="row g-3 mb-4 text-center">
              <div className="col-6 col-md-2">
                <div className="metric-card p-3 border-start border-primary border-4">
                  <div className="text-muted small fw-bold">Placed</div>
                  <div className="fs-3 fw-bold text-primary">{metrics.placed}</div>
                </div>
              </div>
              <div className="col-6 col-md-2">
                <div className="metric-card p-3 border-start border-warning border-4">
                  <div className="text-muted small fw-bold">Paying</div>
                  <div className="fs-3 fw-bold text-warning">{metrics.processing}</div>
                </div>
              </div>
              <div className="col-6 col-md-2">
                <div className="metric-card p-3 border-start border-secondary border-4">
                  <div className="text-muted small fw-bold">Preparing</div>
                  <div className="fs-3 fw-bold text-secondary">{metrics.preparing}</div>
                </div>
              </div>
              <div className="col-6 col-md-2">
                <div className="metric-card p-3 border-start border-dark border-4">
                  <div className="text-muted small fw-bold">Shipping</div>
                  <div className="fs-3 fw-bold text-dark">{metrics.shipping}</div>
                </div>
              </div>
              <div className="col-6 col-md-2">
                <div className="metric-card p-3 border-start border-success border-4">
                  <div className="text-muted small fw-bold">Delivered</div>
                  <div className="fs-3 fw-bold text-success">{metrics.delivered}</div>
                </div>
              </div>
              <div className="col-6 col-md-2">
                <div className="metric-card p-3 border-start border-danger border-4">
                  <div className="text-muted small fw-bold">Cancelled</div>
                  <div className="fs-3 fw-bold text-danger">{metrics.cancelled}</div>
                </div>
              </div>
            </div>

            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="bg-white p-4 rounded-4 border shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0 text-dark"><i className="bi bi-clock-history me-2 text-coral"></i>Order History Log</h4>
                    <div className="d-flex gap-2 align-items-center">
                      {isDemoMode && orders.length > 0 && (
                        <button 
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 py-2 fw-semibold"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to clear all mock orders from local storage?")) {
                              localStorage.removeItem('mock_orders');
                              setOrders([]);
                              setSelectedOrder(null);
                            }
                          }}
                        >
                          <i className="bi bi-trash3 me-1"></i> Clear Demo History
                        </button>
                      )}
                      <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-2 fw-semibold">{orders.length} orders total</span>
                    </div>
                  </div>
                  <hr className="text-muted mb-4" />

                  {orders.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-1 d-block mb-3 text-coral" style={{ opacity: 0.7 }}></i>
                      <h5 className="fw-bold text-dark">No Orders Found</h5>
                      <p className="small mb-4">Create your first food order to see it listed here.</p>
                      <button className="btn btn-coral rounded-pill px-4 py-2" onClick={() => setActiveTab('menu')}>
                        Order Now
                      </button>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle border-0">
                        <thead className="table-light border-0">
                          <tr>
                            <th className="py-3 px-4 border-0 rounded-start-3">Order ID</th>
                            <th className="py-3 border-0">Customer</th>
                            <th className="py-3 border-0">Items</th>
                            <th className="py-3 border-0">Delivery Address</th>
                            <th className="py-3 border-0 text-end">Total Amount</th>
                            <th className="py-3 border-0 text-center">Status</th>
                            <th className="py-3 px-4 border-0 rounded-end-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order.id} className="border-bottom">
                              <td className="py-3 px-4 fw-bold text-dark">#{order.id}</td>
                              <td className="py-3 text-secondary">{order.customerName}</td>
                              <td className="py-3">
                                <div className="text-truncate font-monospace small" style={{ maxWidth: '200px' }} title={order.items}>
                                  {order.items}
                                </div>
                              </td>
                              <td className="py-3 small text-muted">{order.deliveryAddress}</td>
                              <td className="py-3 fw-bold text-coral text-end">₹{order.totalAmount.toFixed(2)}</td>
                              <td className="py-3 text-center">{getStatusBadge(order.status)}</td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  className="btn btn-sm btn-outline-coral rounded-pill px-3 py-1"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setActiveTab('track');
                                  }}
                                >
                                  Track Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
