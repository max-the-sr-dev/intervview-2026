import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    role: 'customer',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
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
      await register(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      
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
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleVariant = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'agent': return 'success';
      case 'customer': return 'primary';
      default: return 'secondary';
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          <i className="fas fa-user-plus"></i>
        </div>
        <h2 className="login-title">Create Account</h2>
        <p className="login-subtitle">Join our support platform</p>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {errors.general}
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`form-input ${errors.first_name ? 'error' : ''}`}
                required
              />
              {errors.first_name && (
                <div className="field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {errors.first_name}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`form-input ${errors.last_name ? 'error' : ''}`}
                required
              />
              {errors.last_name && (
                <div className="field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {errors.last_name}
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`form-input ${errors.username ? 'error' : ''}`}
              required
            />
            {errors.username && (
              <div className="field-error">
                <i className="fas fa-exclamation-circle"></i>
                {errors.username}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              required
            />
            {errors.email && (
              <div className="field-error">
                <i className="fas fa-exclamation-circle"></i>
                {errors.email}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Role</label>
            <div className="role-buttons">
              {['customer', 'agent', 'admin'].map((role) => (
                <label
                  key={role}
                  className={`role-button ${formData.role === role ? `role-${role}-active` : 'role-inactive'}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={formData.role === role}
                    onChange={handleChange}
                    style={{display: 'none'}}
                  />
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </label>
              ))}
            </div>
            {errors.role && (
              <div className="field-error">
                <i className="fas fa-exclamation-circle"></i>
                {errors.role}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              required
            />
            {errors.password && (
              <div className="field-error">
                <i className="fas fa-exclamation-circle"></i>
                {errors.password}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              className={`form-input ${errors.password_confirm ? 'error' : ''}`}
              required
            />
            {errors.password_confirm && (
              <div className="field-error">
                <i className="fas fa-exclamation-circle"></i>
                {errors.password_confirm}
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
                Creating Account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus" style={{marginRight: '0.5rem'}}></i>
                Create Account
              </>
            )}
          </button>

          <div className="register-link">
            <span>Already have an account? </span>
            <Link to="/login">Sign in here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;