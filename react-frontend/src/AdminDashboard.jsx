import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

function AdminDashboard({ orders, isDemoMode, fetchOrders, setOrders }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Keep selected order updated with fresh data
  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find(o => o.id === selectedOrder.id);
      if (updated) {
        setSelectedOrder(updated);
      }
    }
  }, [orders]);

  // Calculate metrics
  const totalOrders = orders.length;
  
  // Processing: WAITING_FOR_APPROVAL, ORDER_ACCEPTED, PAYMENT_VERIFIED, FOOD_PREPARING, FOOD_READY, OUT_FOR_DELIVERY
  const processingOrders = orders.filter(o => 
    ['WAITING_FOR_APPROVAL', 'ORDER_ACCEPTED', 'PAYMENT_VERIFIED', 'FOOD_PREPARING', 'FOOD_READY', 'OUT_FOR_DELIVERY'].includes(o.status)
  ).length;

  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
  
  const cancelledOrders = orders.filter(o => 
    ['CANCELLED', 'REJECTED', 'PAYMENT_FAILED'].includes(o.status)
  ).length;
  
  // Sum amount of non-cancelled orders for Today's Revenue
  const todayRevenue = orders
    .filter(o => !['CANCELLED', 'REJECTED', 'PAYMENT_FAILED'].includes(o.status))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Status transition handler
  const handleUpdateStatus = async (orderId, nextStatus) => {
    setUpdating(true);
    
    if (isDemoMode) {
      setTimeout(() => {
        const local = JSON.parse(localStorage.getItem('mock_orders') || '[]');
        const updated = local.map(o => {
          if (o.id === orderId) {
            const nextO = { ...o, status: nextStatus };
            if (nextStatus === 'OUT_FOR_DELIVERY') {
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
        setUpdating(false);
      }, 500);
      return;
    }

    try {
      await axios.put(`${API_BASE}/api/orders/${orderId}/status?status=${nextStatus}`);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Error updating status on backend.');
    } finally {
      setUpdating(false);
    }
  };

  // Sort and Filter logic
  const getFilteredAndSortedOrders = () => {
    let result = orders.filter(order => {
      const matchesSearch = 
        order.id.toString().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = 
        selectedFilter === 'All' ||
        (selectedFilter === 'Placed' && ['PLACED', 'WAITING_FOR_APPROVAL'].includes(order.status)) ||
        (selectedFilter === 'Payment Processing' && ['ORDER_ACCEPTED', 'PAYMENT_PROCESSING'].includes(order.status)) ||
        (selectedFilter === 'Kitchen Preparing' && ['PAYMENT_VERIFIED', 'FOOD_PREPARING', 'FOOD_READY'].includes(order.status)) ||
        (selectedFilter === 'Out for Delivery' && order.status === 'OUT_FOR_DELIVERY') ||
        (selectedFilter === 'Delivered' && order.status === 'DELIVERED') ||
        (selectedFilter === 'Cancelled' && ['CANCELLED', 'PAYMENT_FAILED', 'REJECTED'].includes(order.status));

      return matchesSearch && matchesFilter;
    });

    result.sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'date_asc') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'id_desc') return b.id - a.id;
      if (sortBy === 'amount_desc') return b.totalAmount - a.totalAmount;
      return 0;
    });

    return result;
  };

  const formattedOrders = getFilteredAndSortedOrders();

  const getStatusLabel = (status) => {
    return status.replace(/_/g, ' ');
  };

  // Derived statuses
  const getPaymentStatus = (status) => {
    if (['WAITING_FOR_APPROVAL', 'ORDER_ACCEPTED', 'PAYMENT_PROCESSING'].includes(status)) {
      return 'Pending';
    }
    if (['REJECTED', 'CANCELLED', 'PAYMENT_FAILED'].includes(status)) {
      return 'Failed';
    }
    return 'Success';
  };

  const getKitchenStatus = (status) => {
    if (['WAITING_FOR_APPROVAL', 'ORDER_ACCEPTED', 'PAYMENT_VERIFIED'].includes(status)) {
      return 'Pending';
    }
    if (status === 'FOOD_PREPARING') {
      return 'Preparing';
    }
    if (['FOOD_READY', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
      return 'Ready';
    }
    return 'N/A';
  };

  const getDeliveryStatus = (status) => {
    if (['WAITING_FOR_APPROVAL', 'ORDER_ACCEPTED', 'PAYMENT_VERIFIED', 'FOOD_PREPARING', 'FOOD_READY'].includes(status)) {
      return 'Pending';
    }
    if (status === 'OUT_FOR_DELIVERY') {
      return 'Out for Delivery';
    }
    if (status === 'DELIVERED') {
      return 'Delivered';
    }
    return 'N/A';
  };

  // Colored Badges configuration mapping
  const getBadgeClass = (columnType, value) => {
    // Colors: Blue = Placed, Yellow = Payment Processing, Green = Success / Delivered, Orange = Kitchen Preparing, Purple = Out for Delivery, Red = Failed / Cancelled
    if (columnType === 'current') {
      switch (value) {
        case 'WAITING_FOR_APPROVAL':
        case 'PLACED':
          return 'badge-blue';
        case 'ORDER_ACCEPTED':
        case 'PAYMENT_PROCESSING':
          return 'badge-yellow';
        case 'PAYMENT_VERIFIED':
        case 'FOOD_READY':
        case 'DELIVERED':
          return 'badge-green';
        case 'FOOD_PREPARING':
          return 'badge-orange';
        case 'OUT_FOR_DELIVERY':
          return 'badge-purple';
        case 'PAYMENT_FAILED':
        case 'CANCELLED':
        case 'REJECTED':
          return 'badge-red';
        default:
          return 'badge-secondary';
      }
    } else if (columnType === 'payment') {
      switch (value) {
        case 'Pending':
          return 'badge-yellow';
        case 'Success':
          return 'badge-green';
        case 'Failed':
          return 'badge-red';
        default:
          return 'badge-secondary';
      }
    } else if (columnType === 'kitchen') {
      switch (value) {
        case 'Pending':
          return 'badge-blue';
        case 'Preparing':
          return 'badge-orange';
        case 'Ready':
          return 'badge-green';
        case 'N/A':
          return 'badge-red';
        default:
          return 'badge-secondary';
      }
    } else if (columnType === 'delivery') {
      switch (value) {
        case 'Pending':
          return 'badge-blue';
        case 'Out for Delivery':
          return 'badge-purple';
        case 'Delivered':
          return 'badge-green';
        case 'N/A':
          return 'badge-red';
        default:
          return 'badge-secondary';
      }
    }
    return 'badge-secondary';
  };

  // Custom Timeline Steps
  const getTimelineSteps = (status) => {
    if (['PAYMENT_FAILED', 'CANCELLED', 'REJECTED'].includes(status)) {
      return [
        { label: 'Payment Failed', key: 'PAYMENT_FAILED', icon: 'bi-credit-card-2-front' },
        { label: 'Cancelled', key: 'CANCELLED', icon: 'bi-x-circle' }
      ];
    } else {
      return [
        { label: 'Order Placed', key: 'PLACED', icon: 'bi-cart-plus' },
        { label: 'Payment Processing', key: 'PAYMENT_PROCESSING', icon: 'bi-credit-card' },
        { label: 'Payment Success', key: 'PAYMENT_SUCCESS', icon: 'bi-shield-check' },
        { label: 'Kitchen Preparing', key: 'KITCHEN_PREPARING', icon: 'bi-fire' },
        { label: 'Ready for Delivery', key: 'READY_FOR_DELIVERY', icon: 'bi-box-seam' },
        { label: 'Out for Delivery', key: 'OUT_FOR_DELIVERY', icon: 'bi-bicycle' },
        { label: 'Delivered', key: 'DELIVERED', icon: 'bi-house-check' }
      ];
    }
  };

  const getStepStatus = (stepKey, currentStatus) => {
    if (['PAYMENT_FAILED', 'CANCELLED', 'REJECTED'].includes(currentStatus)) {
      if (stepKey === 'PAYMENT_FAILED') {
        return 'failed';
      }
      if (stepKey === 'CANCELLED') {
        return (currentStatus === 'CANCELLED' || currentStatus === 'REJECTED') ? 'failed' : 'pending';
      }
      return 'pending';
    }

    const flow = [
      'WAITING_FOR_APPROVAL',
      'ORDER_ACCEPTED',
      'PAYMENT_VERIFIED',
      'FOOD_PREPARING',
      'FOOD_READY',
      'OUT_FOR_DELIVERY',
      'DELIVERED'
    ];

    const stepMapping = {
      'PLACED': 'WAITING_FOR_APPROVAL',
      'PAYMENT_PROCESSING': 'ORDER_ACCEPTED',
      'PAYMENT_SUCCESS': 'PAYMENT_VERIFIED',
      'KITCHEN_PREPARING': 'FOOD_PREPARING',
      'READY_FOR_DELIVERY': 'FOOD_READY',
      'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
      'DELIVERED': 'DELIVERED'
    };

    const targetStatus = stepMapping[stepKey];
    const currentIndex = flow.indexOf(currentStatus);
    const targetIndex = flow.indexOf(targetStatus);

    if (currentIndex === -1) return 'pending';
    if (targetIndex < currentIndex) return 'completed';
    if (targetIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getTimelineProgressPercent = (steps, currentStatus) => {
    if (steps.length === 2) {
      if (currentStatus === 'CANCELLED' || currentStatus === 'REJECTED') return 100;
      return 0;
    }
    const flow = [
      'WAITING_FOR_APPROVAL',
      'ORDER_ACCEPTED',
      'PAYMENT_VERIFIED',
      'FOOD_PREPARING',
      'FOOD_READY',
      'OUT_FOR_DELIVERY',
      'DELIVERED'
    ];
    const currentIndex = flow.indexOf(currentStatus);
    if (currentIndex === -1) return 0;
    return (currentIndex / (flow.length - 1)) * 100;
  };

  const steps = getTimelineSteps(selectedOrder ? selectedOrder.status : '');
  const progressPercent = selectedOrder ? getTimelineProgressPercent(steps, selectedOrder.status) : 0;

  return (
    <div className="admin-dashboard-container animate__animated animate__fadeIn">
      <style>{`
        .metric-card {
          background: white;
          border-radius: 20px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.01);
          padding: 1.25rem;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
          height: 100%;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
        }

        .metric-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          font-size: 1.35rem;
        }

        .badge-custom {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.78rem;
          padding: 6px 12px;
          border-radius: 100px;
          text-transform: capitalize;
          border: 1.5px solid transparent;
        }

        .badge-blue {
          background-color: rgba(13, 110, 253, 0.08);
          color: #0d6efd;
          border-color: rgba(13, 110, 253, 0.2);
        }

        .badge-yellow {
          background-color: rgba(255, 193, 7, 0.1);
          color: #856404;
          border-color: rgba(255, 193, 7, 0.25);
        }

        .badge-green {
          background-color: rgba(25, 135, 84, 0.08);
          color: #198754;
          border-color: rgba(25, 135, 84, 0.2);
        }

        .badge-orange {
          background-color: rgba(253, 126, 20, 0.08);
          color: #fd7e14;
          border-color: rgba(253, 126, 20, 0.2);
        }

        .badge-purple {
          background-color: rgba(111, 66, 193, 0.08);
          color: #6f42c1;
          border-color: rgba(111, 66, 193, 0.2);
        }

        .badge-red {
          background-color: rgba(220, 53, 69, 0.08);
          color: #dc3545;
          border-color: rgba(220, 53, 69, 0.2);
        }

        .filter-pill-btn {
          border-radius: 100px;
          border: 1px solid #cbd5e1;
          background: white;
          padding: 6px 14px;
          font-weight: 600;
          font-size: 0.85rem;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .filter-pill-btn.active {
          background: #ff4757;
          border-color: #ff4757;
          color: white;
          box-shadow: 0 4px 10px rgba(255, 71, 87, 0.15);
        }

        .action-btn-custom {
          font-weight: 700;
          font-size: 0.85rem;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .action-btn-custom:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .order-table tr {
          cursor: pointer;
        }

        .order-table tr.selected-row {
          background-color: #fff0f2 !important;
          border-left: 4px solid #ff4757;
        }

        /* Timeline Stepper CSS */
        .admin-stepper-wrapper {
          position: relative;
          padding: 1.5rem 0;
          margin-bottom: 1.5rem;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .admin-stepper-container {
          display: flex;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .admin-stepper-line-bg {
          position: absolute;
          top: 35px;
          left: 6%;
          right: 6%;
          height: 4px;
          background: #e2e8f0;
          z-index: 0;
          border-radius: 2px;
        }

        .admin-stepper-line-fill {
          position: absolute;
          top: 35px;
          left: 6%;
          height: 4px;
          background: #ff4757;
          z-index: 0;
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 2px;
        }

        .admin-stepper-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
          z-index: 2;
        }

        .admin-stepper-node {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f1f5f9;
          border: 3.5px solid white;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-stepper-node.pending {
          background: #f1f5f9;
          color: #94a3b8;
        }

        .admin-stepper-node.active {
          background: #ff4757;
          color: white;
          box-shadow: 0 0 0 5px rgba(255, 71, 87, 0.2);
          animation: pulse-border 1.5s infinite alternate;
        }

        .admin-stepper-node.completed {
          background: #10b981;
          color: white;
        }

        .admin-stepper-node.failed {
          background: #dc3545;
          color: white;
        }

        .admin-stepper-label {
          margin-top: 10px;
          font-size: 0.76rem;
          font-weight: 700;
          color: #64748b;
          text-align: center;
          max-width: 100px;
          transition: color 0.3s;
        }

        .admin-stepper-label.active {
          color: #ff4757;
        }

        .admin-stepper-label.completed {
          color: #10b981;
        }

        .admin-stepper-label.failed {
          color: #dc3545;
        }

        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0px rgba(255, 71, 87, 0.4); }
          100% { box-shadow: 0 0 0 8px rgba(255, 71, 87, 0); }
        }
      `}</style>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        {/* Total Orders */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="metric-card">
            <div className="metric-icon-box bg-primary-subtle text-primary"><i className="bi bi-grid-fill"></i></div>
            <div>
              <span className="text-muted small fw-bold d-block">Total Orders</span>
              <h4 className="fw-bold mb-0">{totalOrders}</h4>
            </div>
          </div>
        </div>

        {/* Processing Orders */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="metric-card">
            <div className="metric-icon-box bg-warning-subtle text-warning"><i className="bi bi-arrow-repeat"></i></div>
            <div>
              <span className="text-muted small fw-bold d-block">Processing Orders</span>
              <h4 className="fw-bold mb-0">{processingOrders}</h4>
            </div>
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="metric-card">
            <div className="metric-icon-box bg-success-subtle text-success"><i className="bi bi-check-circle-fill"></i></div>
            <div>
              <span className="text-muted small fw-bold d-block">Delivered Orders</span>
              <h4 className="fw-bold mb-0">{deliveredOrders}</h4>
            </div>
          </div>
        </div>

        {/* Cancelled Orders */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="metric-card">
            <div className="metric-icon-box bg-danger-subtle text-danger"><i className="bi bi-x-circle-fill"></i></div>
            <div>
              <span className="text-muted small fw-bold d-block">Cancelled Orders</span>
              <h4 className="fw-bold mb-0">{cancelledOrders}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Order Actions Panel */}
      {selectedOrder && (
        <div className="card rounded-4 border-0 shadow-sm mb-4 animate__animated animate__fadeIn">
          <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">
              <i className="bi bi-sliders me-2 text-coral"></i>Order Console: Order #{selectedOrder.id}
            </h5>
            <button className="btn-close" onClick={() => setSelectedOrder(null)}></button>
          </div>
          <div className="card-body p-4">
            {/* Metadata Detail Row */}
            <div className="row g-3 mb-4 p-3 bg-light rounded-3 text-muted small">
              <div className="col-md-3">Customer: <strong className="text-dark">{selectedOrder.customerName}</strong></div>
              <div className="col-md-5">Items Ordered: <strong className="text-dark font-monospace">{selectedOrder.items}</strong></div>
              <div className="col-md-2">Amount: <strong className="text-dark">₹{selectedOrder.totalAmount.toFixed(2)}</strong></div>
              <div className="col-md-2">Status: <span className={`badge-custom ${getBadgeClass('current', selectedOrder.status)}`}>{getStatusLabel(selectedOrder.status)}</span></div>
            </div>

            {/* Stepper Progress Timeline / Progress Tracker */}
            <div className="admin-stepper-wrapper">
              <div className="admin-stepper-line-bg"></div>
              {selectedOrder.status && !['PAYMENT_FAILED', 'CANCELLED', 'REJECTED'].includes(selectedOrder.status) && (
                <div className="admin-stepper-line-fill" style={{ width: `${progressPercent}%` }}></div>
              )}
              <div className="admin-stepper-container">
                {steps.map((step, index) => {
                  const status = getStepStatus(step.key, selectedOrder.status);
                  return (
                    <div className="admin-stepper-step" key={index}>
                      <div className={`admin-stepper-node ${status}`}>
                        <i className={`bi ${step.icon}`}></i>
                      </div>
                      <div className={`admin-stepper-label ${status}`}>
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Manual Status Buttons (Zomato workflow console) */}
            <div className="d-flex flex-wrap gap-2 pt-2 border-top">
              <button 
                className="btn btn-outline-success action-btn-custom"
                disabled={updating || selectedOrder.status !== 'WAITING_FOR_APPROVAL'}
                onClick={() => handleUpdateStatus(selectedOrder.id, 'ORDER_ACCEPTED')}
              >
                Approve Order
              </button>
              
              <button 
                className="btn btn-outline-danger action-btn-custom"
                disabled={updating || selectedOrder.status !== 'WAITING_FOR_APPROVAL'}
                onClick={() => handleUpdateStatus(selectedOrder.id, 'REJECTED')}
              >
                Reject Order
              </button>

              <button 
                className="btn btn-outline-primary action-btn-custom"
                disabled={updating || selectedOrder.status !== 'ORDER_ACCEPTED'}
                onClick={() => handleUpdateStatus(selectedOrder.id, 'PAYMENT_VERIFIED')}
              >
                Verify Payment
              </button>

              <button 
                className="btn btn-outline-warning action-btn-custom text-dark"
                disabled={updating || selectedOrder.status !== 'PAYMENT_VERIFIED'}
                onClick={() => handleUpdateStatus(selectedOrder.id, 'FOOD_PREPARING')}
              >
                Start Cooking
              </button>

              <button 
                className="btn btn-outline-info action-btn-custom text-dark"
                disabled={updating || selectedOrder.status !== 'FOOD_PREPARING'}
                onClick={() => handleUpdateStatus(selectedOrder.id, 'FOOD_READY')}
              >
                Food Ready
              </button>

              <button 
                className="btn btn-outline-secondary action-btn-custom text-dark"
                disabled={updating || selectedOrder.status !== 'FOOD_READY'}
                onClick={() => handleUpdateStatus(selectedOrder.id, 'OUT_FOR_DELIVERY')}
              >
                Start Delivery
              </button>

              <button 
                className="btn btn-success action-btn-custom"
                disabled={updating || selectedOrder.status !== 'OUT_FOR_DELIVERY'}
                onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
              >
                Mark Delivered
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table Grid */}
      <div className="card rounded-4 border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-lg-center gap-3 mb-4">
            {/* Filter controls */}
            <div className="d-flex flex-wrap gap-2">
              {['All', 'Placed', 'Payment Processing', 'Kitchen Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((filter) => (
                <button
                  key={filter}
                  className={`filter-pill-btn ${selectedFilter === filter ? 'active' : ''}`}
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Sorting and Search */}
            <div className="d-flex gap-2 flex-grow-1 flex-lg-grow-0" style={{ minWidth: '350px' }}>
              <select className="form-select rounded-pill small" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="id_desc">Order ID Desc</option>
                <option value="amount_desc">Amount Desc</option>
              </select>
              <input 
                type="text" 
                className="form-control rounded-pill" 
                placeholder="Search by Order ID or Customer Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Orders Table - Responsive */}
          <div className="table-responsive">
            <table className="table table-hover align-middle border-0 order-table">
              <thead className="table-light border-0">
                <tr>
                  <th className="py-3 px-4 border-0 rounded-start-3">Order ID</th>
                  <th className="py-3 border-0">Customer Name</th>
                  <th className="py-3 border-0">Food Item</th>
                  <th className="py-3 border-0 text-end">Amount</th>
                  <th className="py-3 border-0 text-center">Current Status</th>
                  <th className="py-3 border-0 text-center">Payment Status</th>
                  <th className="py-3 border-0 text-center">Kitchen Status</th>
                  <th className="py-3 border-0 text-center">Delivery Status</th>
                  <th className="py-3 px-4 border-0 rounded-end-3 text-center">Created Time</th>
                </tr>
              </thead>
              <tbody>
                {formattedOrders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5 text-muted">
                      <i className="bi bi-clipboard-x fs-1 d-block mb-2 text-coral"></i>
                      No orders found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  formattedOrders.map((o) => {
                    const isSelected = selectedOrder && selectedOrder.id === o.id;
                    const payStatus = getPaymentStatus(o.status);
                    const kitchStatus = getKitchenStatus(o.status);
                    const delivStatus = getDeliveryStatus(o.status);
                    return (
                      <tr 
                        key={o.id}
                        className={`border-bottom ${isSelected ? 'selected-row' : ''}`}
                        onClick={() => setSelectedOrder(o)}
                      >
                        <td className="py-3 px-4 fw-bold">#{o.id}</td>
                        <td className="py-3 text-secondary-emphasis fw-semibold">{o.customerName}</td>
                        <td className="py-3">
                          <div className="text-truncate font-monospace small" style={{ maxWidth: '180px' }} title={o.items}>{o.items}</div>
                        </td>
                        <td className="py-3 text-end fw-bold text-coral">₹{o.totalAmount.toFixed(2)}</td>
                        <td className="py-3 text-center">
                          <span className={`badge-custom ${getBadgeClass('current', o.status)}`}>
                            {getStatusLabel(o.status)}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`badge-custom ${getBadgeClass('payment', payStatus)}`}>
                            {payStatus}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`badge-custom ${getBadgeClass('kitchen', kitchStatus)}`}>
                            {kitchStatus}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`badge-custom ${getBadgeClass('delivery', delivStatus)}`}>
                            {delivStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted small text-center">
                          {new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
