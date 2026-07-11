import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const PREDEFINED_ITEMS = [
  { 
    name: 'Ghee Podi Masala Dosa', 
    category: 'Breakfast', 
    price: 120.00, 
    desc: 'Crispy golden crepe smeared with gunpowder and clarified butter.', 
    img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop'
  },
  { 
    name: 'Idli Vada Sambar Combo', 
    category: 'Breakfast', 
    price: 80.00, 
    desc: 'Two soft steamed rice cakes and one crunchy lentil doughnut.', 
    img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop'
  },
  { 
    name: 'Chettinad Chicken Biryani', 
    category: 'Main Course', 
    price: 220.00, 
    desc: 'Fragrant Samba rice cooked with succulent chicken and fresh Chettinad spices.', 
    img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop'
  },
  { 
    name: 'Parotta Kurma Feast (2pcs)', 
    category: 'Main Course', 
    price: 90.00, 
    desc: 'Layered flaky flatbread served with aromatic mixed vegetable kurma.', 
    img: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=500&auto=format&fit=crop'
  },
  { 
    name: 'Traditional Ghee Pongal', 
    category: 'Breakfast', 
    price: 100.00, 
    desc: 'Comforting mash of rice and lentils tempered with ghee, pepper, and cashews.', 
    img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop'
  },
  { 
    name: 'Madurai Special Jigarthanda', 
    category: 'Drinks & Dessert', 
    price: 110.00, 
    desc: 'Famous cooling beverage with almond gum, sarsaparilla, and cream ice cream.', 
    img: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop'
  },
  { 
    name: 'South Indian Filter Coffee', 
    category: 'Drinks & Dessert', 
    price: 40.00, 
    desc: 'Freshly brewed strong decoction frothed with hot milk.', 
    img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop'
  }
];

function UserDashboard({ orders, user, fetchOrders, isDemoMode, setOrders }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('menu'); // 'menu' | 'track' | 'history'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');


  // Keep selected order updated with fresh data from the parent props
  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find(o => o.id === selectedOrder.id);
      if (updated) {
        setSelectedOrder(updated);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

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

  const calculateGST = () => calculateSubtotal() * 0.05;
  const calculateDeliveryCharge = () => (calculateSubtotal() > 0 ? 30.00 : 0.00);
  const calculateGrandTotal = () => (calculateSubtotal() + calculateGST() + calculateDeliveryCharge()).toFixed(2);

  // Simulated Order Progression for Offline Demo Mode
  const runOfflineSimulatedFlow = (orderId) => {
    const steps = [
      { status: 'ORDER_ACCEPTED', delay: 3000 },
      { status: 'PAYMENT_VERIFIED', delay: 3000 },
      { status: 'FOOD_PREPARING', delay: 4000 },
      { status: 'FOOD_READY', delay: 3000 },
      { status: 'OUT_FOR_DELIVERY', delay: 4000 },
      { status: 'DELIVERED', delay: 4000 }
    ];

    let currentStep = 0;
    const runNextStep = () => {
      if (currentStep >= steps.length) return;
      const step = steps[currentStep];

      setTimeout(() => {
        const local = JSON.parse(localStorage.getItem('mock_orders') || '[]');
        const updated = local.map(o => {
          if (o.id === orderId) {
            const nextO = { ...o, status: step.status };
            if (step.status === 'OUT_FOR_DELIVERY') {
              nextO.driverName = "Ravi Kumar";
              nextO.driverPhone = "+91 9876543210";
              nextO.driverVehicle = "KA-03-EM-4567";
              nextO.estimatedDeliveryTime = "15 mins";
            }
            return nextO;
          }
          return o;
        });

        localStorage.setItem('mock_orders', JSON.stringify(updated));
        setOrders(updated);

        currentStep++;
        runNextStep();
      }, step.delay);
    };

    runNextStep();
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0 || !deliveryAddress) {
      setCheckoutError('Please add items and enter a delivery address.');
      return;
    }
    setCheckoutError('');
    setLoading(true);

    const itemsFormatted = selectedItems.map(i => `${i.name} (x${i.qty})`).join(', ');
    const grandTotal = parseFloat(calculateGrandTotal());

    const payload = {
      customerName: user.name || 'Customer',
      items: itemsFormatted,
      totalAmount: grandTotal,
      deliveryAddress
    };

    if (isDemoMode) {
      // Demo mode offline flow
      setTimeout(() => {
        const newOrder = {
          id: Math.floor(100000 + Math.random() * 900000),
          customerName: user.name || 'Customer',
          items: itemsFormatted,
          totalAmount: grandTotal,
          deliveryAddress,
          status: 'WAITING_FOR_APPROVAL',
          createdAt: new Date().toISOString()
        };

        const local = JSON.parse(localStorage.getItem('mock_orders') || '[]');
        const updated = [newOrder, ...local];
        localStorage.setItem('mock_orders', JSON.stringify(updated));
        setOrders(updated);

        setSelectedItems([]);
        setDeliveryAddress('');
        setSelectedOrder(newOrder);
        setActiveSubTab('track');
        setLoading(false);

        // Start offline flow simulation
        runOfflineSimulatedFlow(newOrder.id);
      }, 1000);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/api/orders`, payload);
      setSelectedItems([]);
      setDeliveryAddress('');
      setSelectedOrder(response.data);
      setActiveSubTab('track');
      fetchOrders();
    } catch (err) {
      console.error(err);
      setCheckoutError('Failed to place order. Connection issues.');
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

  const getTimelineSteps = (order) => {
    if (!order) return [];
    if (['PAYMENT_FAILED', 'CANCELLED'].includes(order.status)) {
      return [
        { label: 'Order Placed', key: 'PLACED' },
        { label: 'Waiting For Approval', key: 'WAITING_FOR_APPROVAL' },
        { label: 'Order Accepted', key: 'ORDER_ACCEPTED' },
        { label: 'Payment Failed', key: 'PAYMENT_FAILED' },
        { label: 'Cancelled', key: 'CANCELLED' }
      ];
    }
    if (order.status === 'REJECTED') {
      return [
        { label: 'Order Placed', key: 'PLACED' },
        { label: 'Waiting For Approval', key: 'WAITING_FOR_APPROVAL' },
        { label: 'Rejected', key: 'REJECTED' }
      ];
    }
    return [
      { label: 'Order Placed', key: 'PLACED' },
      { label: 'Waiting For Approval', key: 'WAITING_FOR_APPROVAL' },
      { label: 'Order Accepted', key: 'ORDER_ACCEPTED' },
      { label: 'Payment Verified', key: 'PAYMENT_VERIFIED' },
      { label: 'Food Preparing', key: 'FOOD_PREPARING' },
      { label: 'Food Ready', key: 'FOOD_READY' },
      { label: 'Out For Delivery', key: 'OUT_FOR_DELIVERY' },
      { label: 'Delivered', key: 'DELIVERED' }
    ];
  };

  const getTimelineStepStatus = (stepKey, order) => {
    if (!order) return 'pending';
    const status = order.status;

    // Special cases for Rejection or Failure
    if (status === 'REJECTED') {
      if (stepKey === 'PLACED' || stepKey === 'WAITING_FOR_APPROVAL') return 'completed';
      if (stepKey === 'REJECTED') return 'failed';
      return 'pending';
    }

    if (['PAYMENT_FAILED', 'CANCELLED'].includes(status)) {
      if (status === 'PAYMENT_FAILED') {
        if (['PLACED', 'WAITING_FOR_APPROVAL', 'ORDER_ACCEPTED'].includes(stepKey)) return 'completed';
        if (stepKey === 'PAYMENT_FAILED') return 'failed';
        return 'pending';
      }
      // If CANCELLED
      if (stepKey === 'CANCELLED') return 'failed';
      return 'completed';
    }

    const orderSteps = [
      'PLACED',
      'WAITING_FOR_APPROVAL',
      'ORDER_ACCEPTED',
      'PAYMENT_VERIFIED',
      'FOOD_PREPARING',
      'FOOD_READY',
      'OUT_FOR_DELIVERY',
      'DELIVERED'
    ];

    // Treat 'PLACED' state as equivalent to waiting for approval initial steps
    const currentIdx = status === 'PLACED' ? 1 : orderSteps.indexOf(status);
    const stepIdx = orderSteps.indexOf(stepKey);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  const userOrders = orders.filter(o => o.customerName === user.name);

  return (
    <div className="user-dashboard-root animate__animated animate__fadeIn" style={{ minHeight: '80vh' }}>
      <style>{`
        .sub-tab-btn {
          border: none;
          background: transparent;
          color: #64748b;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 8px 16px;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .sub-tab-btn.active {
          color: #ff4757;
          border-bottom-color: #ff4757;
        }

        .food-item-img {
          height: 140px;
          object-fit: cover;
          border-radius: 12px;
        }

        .cart-box-sticky {
          position: sticky;
          top: 90px;
          background: white;
          border-radius: 20px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.02);
          padding: 1.5rem;
        }

        /* Tracker node styles */
        .track-step-node {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: bold;
          margin-right: 1rem;
          z-index: 2;
        }

        .track-step-node.completed {
          background-color: #10b981;
          color: white;
        }

        .track-step-node.active {
          background-color: #0d6efd;
          color: white;
          animation: pulse-ring 1.5s infinite alternate;
        }

        .track-step-node.pending {
          background-color: #e2e8f0;
          color: #94a3b8;
        }

        .track-step-node.failed {
          background-color: #dc3545;
          color: white;
        }

        .track-step-row {
          position: relative;
          display: flex;
          align-items: center;
          padding-bottom: 1.5rem;
        }

        .track-step-row:not(:last-child)::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 32px;
          bottom: 0;
          width: 2px;
          background-color: #e2e8f0;
          z-index: 1;
        }

        .track-step-row.completed-line:not(:last-child)::before {
          background-color: #10b981;
        }
      `}</style>

      {/* Sub Tabs Navigation */}
      <div className="d-flex border-bottom mb-4">
        <button 
          className={`sub-tab-btn ${activeSubTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('menu')}
        >
          <i className="bi bi-compass me-1"></i> Order Food
        </button>
        <button 
          className={`sub-tab-btn ${activeSubTab === 'track' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('track')}
        >
          <i className="bi bi-geo-alt me-1"></i> Live Tracking
        </button>
        <button 
          className={`sub-tab-btn ${activeSubTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('history')}
        >
          <i className="bi bi-clock-history me-1"></i> Order History ({userOrders.length})
        </button>
      </div>

      {/* Content tabs */}
      {activeSubTab === 'menu' && (
        <div className="row g-4">
          {/* Menu selection (Left) */}
          <div className="col-lg-8">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4">
              {/* Category selector */}
              <div className="d-flex gap-2 overflow-x-auto pb-1">
                {['All', 'Breakfast', 'Main Course', 'Drinks & Dessert'].map((cat) => (
                  <button
                    key={cat}
                    className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${selectedCategory === cat ? 'btn-coral' : 'btn-outline-secondary'}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="search-box-container" style={{ minWidth: '250px' }}>
                <input 
                  type="text" 
                  className="form-control rounded-pill"
                  placeholder="Search food items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="row g-3">
              {filteredMenuItems.map((item, idx) => (
                <div className="col-md-6" key={idx}>
                  <div className="card h-100 border rounded-4 p-3 d-flex flex-row align-items-center gap-3">
                    <img src={item.img} alt={item.name} className="food-item-img" style={{ width: '100px' }} />
                    <div className="flex-grow-1">
                      <h6 className="fw-bold text-dark mb-1">{item.name}</h6>
                      <p className="text-muted small mb-2">{item.desc}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-bold text-coral">₹{item.price.toFixed(2)}</span>
                        {getItemQuantity(item.name) > 0 ? (
                          <div className="d-flex align-items-center gap-2 bg-coral-light border border-coral rounded-pill p-1">
                            <button className="btn btn-sm btn-light rounded-circle p-1 d-flex align-items-center justify-content-center border" style={{ width: '24px', height: '24px' }} onClick={() => handleRemoveItem(item.name)}>-</button>
                            <span className="fw-bold text-coral px-1">{getItemQuantity(item.name)}</span>
                            <button className="btn btn-sm btn-light rounded-circle p-1 d-flex align-items-center justify-content-center border" style={{ width: '24px', height: '24px' }} onClick={() => handleAddItem(item.name)}>+</button>
                          </div>
                        ) : (
                          <button className="btn btn-sm btn-outline-coral rounded-pill px-3 py-1 fw-bold" onClick={() => handleAddItem(item.name)}>Add</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar (Right) */}
          <div className="col-lg-4">
            <div className="cart-box-sticky">
              <h5 className="fw-bold mb-3 text-dark"><i className="bi bi-cart3 text-coral me-1"></i>My Cart</h5>
              <form onSubmit={handleCheckout}>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary small">Delivery Address</label>
                  <textarea 
                    className="form-control rounded-3" 
                    placeholder="Enter complete drop address"
                    rows="2"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                  ></textarea>
                </div>

                {selectedItems.length > 0 ? (
                  <div className="p-3 bg-light rounded-3 mb-3 border">
                    {selectedItems.map((cartItem, idx) => {
                      const itemDetails = PREDEFINED_ITEMS.find(m => m.name === cartItem.name);
                      const cost = itemDetails ? itemDetails.price * cartItem.qty : 0;
                      return (
                        <div className="d-flex justify-content-between small py-1.5 border-bottom border-light" key={idx}>
                          <span><strong className="text-coral me-1">{cartItem.qty}x</strong> {cartItem.name}</span>
                          <span className="fw-semibold">₹{cost.toFixed(2)}</span>
                        </div>
                      );
                    })}
                    <div className="d-flex justify-content-between text-muted small pt-2">
                      <span>Subtotal</span>
                      <span>₹{calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between text-muted small py-1">
                      <span>GST (5%)</span>
                      <span>₹{calculateGST().toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between text-muted small py-1">
                      <span>Delivery Charge</span>
                      <span>₹{calculateDeliveryCharge().toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between fw-bold text-dark fs-6 pt-2 border-top mt-2">
                      <span>Grand Total</span>
                      <span className="text-coral">₹{calculateGrandTotal()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted bg-light border rounded-3 small mb-3">
                    Your cart is empty. Add delicious items from the menu!
                  </div>
                )}

                {checkoutError && (
                  <div className="alert alert-danger rounded-3 py-1.5 px-3 small border-0 mb-3">
                    {checkoutError}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-coral w-100 py-2.5 rounded-pill fw-bold"
                  disabled={loading || selectedItems.length === 0}
                >
                  {loading ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Placing Order...
                    </span>
                  ) : (
                    <span>Place Order & Pay</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'track' && (
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {selectedOrder ? (
              <div className="card border rounded-4 shadow-sm p-4 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                  <h5 className="fw-bold mb-0 text-dark">
                    <i className="bi bi-geo-alt-fill text-coral me-1"></i>Track Order #{selectedOrder.id}
                  </h5>
                  <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => setSelectedOrder(null)}>
                    Track Another
                  </button>
                </div>

                {/* Status Badges */}
                <div className="row g-3 mb-4 p-3 bg-light rounded-3 text-muted small">
                  <div className="col-md-3">
                    <i className="bi bi-person text-coral"></i> Customer: <strong className="text-dark">{selectedOrder.customerName}</strong>
                  </div>
                  <div className="col-md-5">
                    <i className="bi bi-geo-alt text-coral"></i> Address: <strong className="text-dark">{selectedOrder.deliveryAddress}</strong>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <i className="bi bi-wallet2 text-coral"></i> Total Price: <strong className="text-coral fw-bold">₹{selectedOrder.totalAmount.toFixed(2)}</strong>
                  </div>
                </div>

                {/* Timeline */}
                <div className="timeline-tracker-box px-3 mb-4">
                  {getTimelineSteps(selectedOrder).map((step, idx) => {
                    const stepStatus = getTimelineStepStatus(step.key, selectedOrder);
                    
                    let nodeClass = 'pending';
                    let icon = <i className="bi bi-circle"></i>;
                    if (stepStatus === 'completed') {
                      nodeClass = 'completed';
                      icon = <i className="bi bi-check-lg"></i>;
                    } else if (stepStatus === 'active') {
                      nodeClass = 'active';
                      icon = <span className="spinner-grow spinner-grow-sm" role="status"></span>;
                    } else if (stepStatus === 'failed') {
                      nodeClass = 'failed';
                      icon = <i className="bi bi-x-lg"></i>;
                    }

                    return (
                      <div className={`track-step-row ${stepStatus === 'completed' ? 'completed-line' : ''}`} key={idx}>
                        <div className={`track-step-node ${nodeClass}`}>
                          {icon}
                        </div>
                        <div className="track-step-detail">
                          <h6 className={`mb-0 fw-bold ${stepStatus === 'active' ? 'text-primary' : stepStatus === 'completed' ? 'text-success' : stepStatus === 'failed' ? 'text-danger' : 'text-secondary'}`}>
                            {step.label}
                          </h6>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mock Delivery Partner Details */}
                {selectedOrder.driverName && (
                  <div className="p-3 bg-light border border-success-subtle rounded-3 d-flex align-items-center gap-3 animate__animated animate__fadeIn">
                    <div className="fs-1 text-success"><i className="bi bi-bicycle"></i></div>
                    <div className="flex-grow-1">
                      <div className="text-muted small fw-semibold">Delivery Partner Assigned</div>
                      <h6 className="fw-bold mb-0 text-dark">{selectedOrder.driverName}</h6>
                      <div className="small text-secondary">
                        <i className="bi bi-phone"></i> {selectedOrder.driverPhone} | <i className="bi bi-card-text"></i> {selectedOrder.driverVehicle}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-muted small fw-semibold">Estimated Arrival</div>
                      <h5 className="fw-bold text-coral mb-0">{selectedOrder.estimatedDeliveryTime}</h5>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-5 bg-white rounded-4 border text-muted shadow-sm col-lg-8 mx-auto my-5">
                <i className="bi bi-pin-map fs-1 text-coral d-block mb-3" style={{ opacity: 0.8 }}></i>
                <h5 className="fw-bold text-dark">No Active Tracked Order</h5>
                <p className="small mb-4">You can select a past order from your Order History log to live track its progress.</p>
                <button className="btn btn-coral rounded-pill px-4 py-2" onClick={() => setActiveSubTab('history')}>
                  Go to Order History
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="card border rounded-4 shadow-sm p-4 bg-white">
          <h5 className="fw-bold mb-4 text-dark"><i className="bi bi-clock-history text-coral me-1"></i>My Order History</h5>
          {userOrders.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 d-block mb-2 text-coral"></i>
              No orders found. Place some delicious food to see them here!
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle border-0">
                <thead className="table-light">
                  <tr>
                    <th className="py-3 px-4 border-0">Order ID</th>
                    <th className="py-3 border-0">Items</th>
                    <th className="py-3 border-0 text-end">Amount</th>
                    <th className="py-3 border-0 text-center">Status</th>
                    <th className="py-3 px-4 border-0 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userOrders.map((o) => (
                    <tr key={o.id} className="border-bottom">
                      <td className="py-3 px-4 fw-bold">#{o.id}</td>
                      <td className="py-3">
                        <div className="text-truncate font-monospace small" style={{ maxWidth: '300px' }} title={o.items}>{o.items}</div>
                      </td>
                      <td className="py-3 text-end fw-bold text-coral">₹{o.totalAmount.toFixed(2)}</td>
                      <td className="py-3 text-center">
                        <span className={`badge rounded-pill px-2.5 py-1.5 fw-bold ${
                          o.status === 'DELIVERED' ? 'bg-success-subtle text-success' :
                          ['CANCELLED', 'REJECTED', 'PAYMENT_FAILED'].includes(o.status) ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'
                        }`}>
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button 
                          className="btn btn-sm btn-outline-coral rounded-pill px-3"
                          onClick={() => {
                            setSelectedOrder(o);
                            setActiveSubTab('track');
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
      )}
    </div>
  );
}

export default UserDashboard;
