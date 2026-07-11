import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

function AdminDashboard({ orders, isDemoMode, fetchOrders, setOrders }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc'); // 'date_desc' | 'date_asc' | 'id_desc' | 'amount_desc'
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  // Calculate metrics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'WAITING_FOR_APPROVAL').length;
  const preparingOrders = orders.filter(o => o.status === 'FOOD_PREPARING').length;
  const outForDeliveryOrders = orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
  const cancelledOrders = orders.filter(o => ['CANCELLED', 'REJECTED', 'PAYMENT_FAILED'].includes(o.status)).length;
  
  // Sum amount of non-cancelled orders for Today's Revenue
  const todayRevenue = orders
    .filter(o => !['CANCELLED', 'REJECTED', 'PAYMENT_FAILED'].includes(o.status))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Status transition handler
  const handleUpdateStatus = async (orderId, nextStatus) => {
    setUpdating(true);
    
    if (isDemoMode) {
      // Local storage simulated update
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
        (selectedFilter === 'Placed' && order.status === 'PLACED') ||
        (selectedFilter === 'Waiting For Approval' && order.status === 'WAITING_FOR_APPROVAL') ||
        (selectedFilter === 'Order Accepted' && order.status === 'ORDER_ACCEPTED') ||
        (selectedFilter === 'Payment Verified' && order.status === 'PAYMENT_VERIFIED') ||
        (selectedFilter === 'Food Preparing' && order.status === 'FOOD_PREPARING') ||
        (selectedFilter === 'Food Ready' && order.status === 'FOOD_READY') ||
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

  const getBadgeClass = (status) => {
    switch (status) {
      case 'WAITING_FOR_APPROVAL': return 'badge-placed';
      case 'ORDER_ACCEPTED': return 'badge-payment-proc';
      case 'PAYMENT_VERIFIED':
      case 'FOOD_READY':
      case 'DELIVERED':
        return 'badge-success-delivered';
      case 'FOOD_PREPARING': return 'badge-kitchen-prep';
      case 'OUT_FOR_DELIVERY': return 'badge-out-delivery';
      case 'PAYMENT_FAILED':
      case 'CANCELLED':
      case 'REJECTED':
        return 'badge-failed-cancelled';
      default: return 'badge-secondary';
    }
  };

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
          font-weight: 600;
          font-size: 0.8rem;
          padding: 6px 12px;
          border-radius: 100px;
          text-transform: capitalize;
        }

        .badge-placed {
          background-color: rgba(13, 110, 253, 0.08);
          color: #0d6efd;
          border: 1px solid rgba(13, 110, 253, 0.15);
        }

        .badge-payment-proc {
          background-color: rgba(255, 193, 7, 0.12);
          color: #a07505;
          border: 1px solid rgba(255, 193, 7, 0.25);
        }

        .badge-success-delivered {
          background-color: rgba(25, 135, 84, 0.08);
          color: #198754;
          border: 1px solid rgba(25, 135, 84, 0.15);
        }

        .badge-kitchen-prep {
          background-color: rgba(253, 126, 20, 0.08);
          color: #fd7e14;
          border: 1px solid rgba(253, 126, 20, 0.15);
        }

        .badge-out-delivery {
          background-color: rgba(111, 66, 193, 0.08);
          color: #6f42c1;
          border: 1px solid rgba(111, 66, 193, 0.15);
        }

        .badge-failed-cancelled {
          background-color: rgba(220, 53, 69, 0.08);
          color: #dc3545;
          border: 1px solid rgba(220, 53, 69, 0.15);
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
      `}</style>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        {/* Total Orders */}
        <div className="col-6 col-md-3 col-lg-2">
          <div className="metric-card">
            <div className="metric-icon-box bg-primary-subtle text-primary"><i className="bi bi-box"></i></div>
            <div>
              <span className="text-muted small fw-bold d-block">Total Orders</span>
              <h4 className="fw-bold mb-0">{totalOrders}</h4>
            </div>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="col-6 col-md-3 col-lg-2">
          <div className="metric-card">
            <div className="metric-icon-box bg-warning-subtle text-warning"><i className="bi bi-hourglass-split"></i></div>
            <div>
              <span className="text-muted small fw-bold d-block">Pending Approval</span>
              <h4 className="fw-bold mb-0">{pendingOrders}</h4>
            </div>
          </div>
        </div>

        {/* Preparing */}
        <div className="col-6 col-md-3 col-lg-2">
          <div className="metric-card">
            <div className="metric-icon-box bg-info-subtle text-info"><i className="bi bi-fire"></i></div>
            <div>
              <span className="text-muted small fw-bold d-block">Preparing</span>
              <h4 className="fw-bold mb-0">{preparingOrders}</h4>
            </div>
          </div>
        </div>

        {/* Out for Delivery */}
        <div className="col-6 col-md-3 col-lg-2">
          <div className="metric-card">
            <div className="metric-icon-box bg-secondary-subtle text-secondary"><i className="bi bi-bicycle"></i></div>
            <div>
              <span className="text-muted small fw-bold d-block">Out for Delivery</span>
              <h4 className="fw-bold mb-0">{outForDeliveryOrders}</h4>
            </div>
          </div>
        </div>

        {/* Delivered / Cancelled */}
        <div className="col-6 col-md-4 col-lg-2">
          <div className="metric-card">
            <div className="metric-icon-box bg-success-subtle text-success"><i className="bi bi-check-circle"></i></div>
            <div>
              <span className="text-muted small fw-bold d-block">Delivered</span>
              <h4 className="fw-bold mb-0">{deliveredOrders}</h4>
            </div>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="col-6 col-md-4 col-lg-2">
          <div className="metric-card border-success border-2">
            <div className="metric-icon-box bg-success text-white"><i className="bi bi-currency-rupee"></i></div>
            <div>
              <span className="text-muted small fw-bold d-block">Today's Revenue</span>
              <h5 className="fw-bold mb-0 text-success">₹{todayRevenue.toFixed(2)}</h5>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Order Actions Panel */}
      {selectedOrder && (
        <div className="card rounded-4 border-0 shadow-sm mb-4 animate__animated animate__fadeIn">
          <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0 text-dark">
              <i className="bi bi-sliders me-2 text-coral"></i>Order Action Console: Order #{selectedOrder.id}
            </h5>
            <button className="btn-close" onClick={() => setSelectedOrder(null)}></button>
          </div>
          <div className="card-body p-4">
            <div className="row g-3 mb-4 p-3 bg-light rounded-3 text-muted small">
              <div className="col-md-3">Customer: <strong className="text-dark">{selectedOrder.customerName}</strong></div>
              <div className="col-md-5">Items Ordered: <strong className="text-dark font-monospace">{selectedOrder.items}</strong></div>
              <div className="col-md-2">Amount: <strong className="text-dark">₹{selectedOrder.totalAmount.toFixed(2)}</strong></div>
              <div className="col-md-2">Status: <span className={`badge-custom ${getBadgeClass(selectedOrder.status)}`}>{getStatusLabel(selectedOrder.status)}</span></div>
            </div>

            {/* Manual Status Buttons (Zomato workflow) */}
            <div className="d-flex flex-wrap gap-2">
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
              {['All', 'Waiting For Approval', 'Order Accepted', 'Payment Verified', 'Food Preparing', 'Food Ready', 'Out for Delivery', 'Delivered', 'Cancelled'].map((filter) => (
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
                placeholder="Search name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="table-responsive">
            <table className="table table-hover align-middle border-0 order-table">
              <thead className="table-light border-0">
                <tr>
                  <th className="py-3 px-4 border-0 rounded-start-3">Order ID</th>
                  <th className="py-3 border-0">Customer Name</th>
                  <th className="py-3 border-0">Food Name (Qty)</th>
                  <th className="py-3 border-0 text-end">Price</th>
                  <th className="py-3 border-0 text-center">Current Status</th>
                  <th className="py-3 px-4 border-0 rounded-end-3 text-center">Order Time</th>
                </tr>
              </thead>
              <tbody>
                {formattedOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="bi bi-clipboard-x fs-1 d-block mb-2 text-coral"></i>
                      No orders found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  formattedOrders.map((o) => {
                    const isSelected = selectedOrder && selectedOrder.id === o.id;
                    return (
                      <tr 
                        key={o.id}
                        className={`border-bottom ${isSelected ? 'selected-row' : ''}`}
                        onClick={() => setSelectedOrder(o)}
                      >
                        <td className="py-3 px-4 fw-bold">#{o.id}</td>
                        <td className="py-3 text-secondary-emphasis fw-semibold">{o.customerName}</td>
                        <td className="py-3">
                          <div className="text-truncate font-monospace small" style={{ maxWidth: '300px' }} title={o.items}>{o.items}</div>
                        </td>
                        <td className="py-3 text-end fw-bold text-coral">₹{o.totalAmount.toFixed(2)}</td>
                        <td className="py-3 text-center">
                          <span className={`badge-custom ${getBadgeClass(o.status)}`}>
                            {getStatusLabel(o.status)}
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
