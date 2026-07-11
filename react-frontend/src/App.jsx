import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Login from './Login';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081') + '/api/orders';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_details');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [orders, setOrders] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [error, setError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Set up axios auth header on initial load if token exists
  useEffect(() => {
    if (user && user.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setOrders(response.data.sort((a, b) => b.id - a.id));
      setError(null);
      setIsDemoMode(false);
    } catch (err) {
      console.warn('Failed to fetch orders from backend, enabling Demo Mode', err.message);
      setIsDemoMode(true);
      // Load mock orders from local storage
      const local = JSON.parse(localStorage.getItem('mock_orders') || '[]');
      setOrders(local.sort((a, b) => b.id - a.id));
    }
  }, []);

  // Fetch orders periodically
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('user_details', JSON.stringify(userData));
    if (userData.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    }
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_details');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-vh-100 pb-5" style={{ backgroundColor: '#f8fafc', fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        
        :root {
          --primary-coral: #ff4757;
          --primary-hover: #ff2a3b;
          --primary-light: #fff0f2;
          --text-slate: #0f172a;
          --text-muted: #64748b;
        }

        body {
          font-family: 'Outfit', sans-serif;
          color: var(--text-slate);
        }
        
        .bg-coral { background-color: var(--primary-coral) !important; }
        .text-coral { color: var(--primary-coral) !important; }
        
        .btn-coral {
          background-color: var(--primary-coral);
          color: white;
          border: none;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        
        .btn-coral:hover {
          background-color: var(--primary-hover);
          color: white;
          box-shadow: 0 4px 14px rgba(255, 71, 87, 0.25);
        }

        .btn-outline-coral {
          border: 1.5px solid var(--primary-coral);
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
      `}</style>

      {/* Swiggy/Zomato Premium Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light sticky-navbar py-3 mb-4">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center text-coral navbar-brand-logo" href="#/">
            <i className="bi bi-lightning-charge-fill me-1 fs-3"></i>
            Food Time
          </a>

          <div className="d-flex align-items-center gap-3 ms-auto">
            {isDemoMode ? (
              <span className="badge bg-warning-subtle text-warning border border-warning px-2.5 py-1.5 rounded-pill fs-7 d-flex align-items-center gap-1">
                <i className="bi bi-info-circle-fill"></i>
                Demo Mode
              </span>
            ) : (
              <span className="badge bg-success-subtle text-success border border-success px-2.5 py-1.5 rounded-pill fs-7 d-flex align-items-center gap-1">
                <i className="bi bi-cloud-check-fill"></i>
                Connected
              </span>
            )}

            <div className="dropdown">
              <button 
                className="btn btn-light rounded-pill border dropdown-toggle px-3 py-1.5 d-flex align-items-center gap-2" 
                type="button" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
              >
                <i className="bi bi-person-circle fs-5 text-coral"></i>
                <div className="text-start d-none d-sm-block">
                  <span className="fw-bold d-block small lh-1">{user.name}</span>
                  <span className="text-muted small" style={{ fontSize: '0.75rem' }}>{user.role}</span>
                </div>
              </button>
              <ul className={`dropdown-menu dropdown-menu-end rounded-3 shadow-sm border mt-2 ${dropdownOpen ? 'show' : ''}`} style={{ display: dropdownOpen ? 'block' : 'none', position: 'absolute', right: 0 }}>
                <li>
                  <button className="dropdown-item text-danger fw-bold" onClick={() => { handleLogout(); setDropdownOpen(false); }}>
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Main dashboard content */}
      <div className="container">
        {user.role === 'ADMIN' ? (
          <AdminDashboard 
            orders={orders} 
            isDemoMode={isDemoMode} 
            fetchOrders={fetchOrders} 
            setOrders={setOrders}
          />
        ) : (
          <UserDashboard 
            orders={orders} 
            user={user} 
            fetchOrders={fetchOrders} 
            isDemoMode={isDemoMode}
            setOrders={setOrders}
          />
        )}
      </div>
    </div>
  );
}

export default App;
