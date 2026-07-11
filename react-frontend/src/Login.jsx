import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isRegister 
      ? `${API_BASE}/api/auth/register` 
      : `${API_BASE}/api/auth/login`;

    const payload = isRegister 
      ? { name, email, password, role } 
      : { email, password };

    try {
      const response = await axios.post(url, payload);
      onLoginSuccess(response.data);
    } catch (err) {
      console.error('Auth error:', err);
      if (err.response && err.response.data) {
        setError(typeof err.response.data === 'string' ? err.response.data : 'Authentication failed.');
      } else {
        setError('Connection failed. Make sure order-service is running on port 8081.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ backgroundColor: '#f3f4f6', fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        .auth-card {
          width: 100%;
          max-width: 450px;
          background: white;
          border-radius: 24px;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
          overflow: hidden;
          padding: 2.5rem;
        }

        .auth-nav {
          display: flex;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 100px;
          margin-bottom: 2rem;
        }

        .auth-nav-btn {
          flex: 1;
          border: none;
          background: transparent;
          padding: 8px 16px;
          font-weight: 600;
          font-size: 0.9rem;
          color: #64748b;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .auth-nav-btn.active {
          background: white;
          color: #ff4757;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.05);
        }

        .form-control-custom {
          background-color: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .form-control-custom:focus {
          background-color: white;
          border-color: #ff4757;
          box-shadow: 0 0 0 4px rgba(255, 71, 87, 0.1);
          outline: none;
        }

        .btn-auth {
          background-color: #ff4757;
          color: white;
          border: none;
          font-weight: 700;
          padding: 12px;
          border-radius: 12px;
          width: 100%;
          transition: all 0.2s ease;
        }

        .btn-auth:hover {
          background-color: #ff2a3b;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(255, 71, 87, 0.25);
        }

        .logo-box {
          font-size: 2.2rem;
          font-weight: 850;
          color: #ff4757;
          letter-spacing: -1px;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .role-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 1.5rem;
        }

        .role-option {
          flex: 1;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 8px;
          text-align: center;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.88rem;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .role-option.active {
          border-color: #ff4757;
          background-color: rgba(255, 71, 87, 0.05);
          color: #ff4757;
        }
      `}</style>

      <div className="auth-card animate__animated animate__fadeIn">
        <div className="logo-box">
          <i className="bi bi-lightning-charge-fill me-1"></i>Food Time
        </div>
        
        {/* Toggle Nav */}
        <div className="auth-nav">
          <button 
            className={`auth-nav-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(false); setError(''); }}
          >
            Login
          </button>
          <button 
            className={`auth-nav-btn ${isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(true); setError(''); }}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="alert alert-danger rounded-3 py-2 px-3 small border-0 mb-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-1"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Full Name</label>
              <input 
                type="text" 
                className="form-control form-control-custom"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label fw-semibold text-secondary small">Email Address</label>
            <input 
              type="email" 
              className="form-control form-control-custom"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold text-secondary small">Password</label>
            <input 
              type="password" 
              className="form-control form-control-custom"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div className="mb-4">
              <label className="form-label fw-semibold text-secondary small">Select Role</label>
              <div className="role-selector">
                <div 
                  className={`role-option ${role === 'USER' ? 'active' : ''}`}
                  onClick={() => setRole('USER')}
                >
                  <i className="bi bi-person me-1"></i> Customer
                </div>
                <div 
                  className={`role-option ${role === 'ADMIN' ? 'active' : ''}`}
                  onClick={() => setRole('ADMIN')}
                >
                  <i className="bi bi-shield-check me-1"></i> Admin
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-auth mt-2" 
            disabled={loading}
          >
            {loading ? (
              <span>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </span>
            ) : (
              <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
