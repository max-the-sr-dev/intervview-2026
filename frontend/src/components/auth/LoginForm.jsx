import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response?.data) {
        // Handle specific API errors
        const errorData = error.response.data;
        if (errorData.non_field_errors) {
          setErrors({ general: errorData.non_field_errors[0] });
        } else if (errorData.detail) {
          setErrors({ general: errorData.detail });
        } else {
          setErrors(errorData);
        }
      } else if (error.response?.status === 500) {
        setErrors({ general: 'Server error. Please try again later.' });
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setErrors({ general: 'Network error. Please check your connection and try again.' });
      } else {
        setErrors({ general: 'Login failed. Please check your credentials and try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          <i className="fas fa-shield-alt"></i>
        </div>
        
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to access your dashboard</p>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {errors.general}
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-wrapper">
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                className={`form-input ${errors.username ? 'error' : ''}`}
                required
              />
              <i className="fas fa-user input-icon"></i>
            </div>
            {errors.username && (
              <div className="field-error">
                <i className="fas fa-exclamation-circle"></i>
                {errors.username}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                required
              />
              <i className="fas fa-lock input-icon"></i>
            </div>
            {errors.password && (
              <div className="field-error">
                <i className="fas fa-exclamation-circle"></i>
                {errors.password}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt" style={{marginRight: '0.5rem'}}></i>
                Sign In
              </>
            )}
          </button>

          <div className="register-link">
            Don't have an account? <Link to="/register">Create one here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;