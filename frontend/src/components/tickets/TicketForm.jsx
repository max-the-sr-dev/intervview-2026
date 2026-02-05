import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/tickets';

const TicketForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
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
      await ticketService.createTicket(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Ticket creation error:', error);
      
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
        setErrors({ general: 'Failed to create ticket. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="main-content">
      <div className="form-container">
        {/* Header */}
        <div className="form-header">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn btn-outline back-button"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
          <h1 className="form-title">Create New Support Ticket</h1>
          <p className="form-subtitle">Describe your issue and we'll help you resolve it quickly.</p>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <div className="form-card-icon">
              <i className="fas fa-plus"></i>
            </div>
            <div className="form-card-title">
              <h5>Ticket Details</h5>
              <small>Please provide as much detail as possible</small>
            </div>
          </div>
          
          <div className="form-card-body">
            <form onSubmit={handleSubmit}>
              {errors.general && (
                <div className="error-message">
                  <i className="fas fa-exclamation-triangle"></i>
                  {errors.general}
                </div>
              )}
              
              <div className="form-group">
                <label className="form-label">Issue Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Brief description of your issue (e.g., 'Unable to login to account')"
                  value={formData.title}
                  onChange={handleChange}
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  required
                />
                {errors.title && (
                  <div className="field-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.title}
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <div className="priority-buttons">
                  {['low', 'medium', 'high', 'urgent'].map((priority) => (
                    <label
                      key={priority}
                      className={`priority-button ${formData.priority === priority ? `priority-${priority}-active` : 'priority-inactive'}`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={priority}
                        checked={formData.priority === priority}
                        onChange={handleChange}
                        style={{display: 'none'}}
                      />
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      {priority === 'urgent' && <i className="fas fa-exclamation-triangle"></i>}
                    </label>
                  ))}
                </div>
                {errors.priority && (
                  <div className="field-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.priority}
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">Detailed Description *</label>
                <textarea
                  rows={8}
                  name="description"
                  placeholder={`Please provide detailed information about your issue:

• What were you trying to do?
• What happened instead?
• When did this start occurring?
• Any error messages you received?
• Steps to reproduce the issue`}
                  value={formData.description}
                  onChange={handleChange}
                  className={`form-textarea ${errors.description ? 'error' : ''}`}
                  required
                />
                <div className="textarea-footer">
                  <small className="textarea-help">
                    Be as specific as possible to help us resolve your issue quickly
                  </small>
                  <small className="character-count">
                    {formData.description.length} characters
                  </small>
                </div>
                {errors.description && (
                  <div className="field-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.description}
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Creating Ticket...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus"></i>
                      Create Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketForm;