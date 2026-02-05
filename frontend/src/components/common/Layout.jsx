import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/dashboard" className="nav-brand">
            <div className="brand-icon">
              <i className="fas fa-headset"></i>
            </div>
            <span>Support Dashboard</span>
          </Link>
          
          <div className="nav-menu">
            <div className="user-info">
              <span className="user-name">{user?.first_name} {user?.last_name}</span>
              <span className={`user-role role-${user?.role}`}>{user?.role}</span>
            </div>
            
            {user?.role === 'customer' && (
              <Link to="/tickets/new" className="btn btn-primary">
                <i className="fas fa-plus"></i> New Ticket
              </Link>
            )}
            
            <button onClick={handleLogout} className="btn btn-outline">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;