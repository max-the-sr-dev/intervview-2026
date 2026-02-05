import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/tickets';
import Layout from '../components/common/Layout';

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      setError('');
      const data = await ticketService.getTicket(id);
      setTicket(data);
    } catch (error) {
      console.error('Ticket detail error:', error);
      
      if (error.response?.status === 404) {
        setError('Ticket not found. It may have been deleted or you may not have permission to view it.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You do not have permission to view this ticket.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to load ticket details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddResponse = async (e) => {
    e.preventDefault();
    if (!responseMessage.trim()) return;

    setSubmittingResponse(true);
    setError('');
    
    try {
      await ticketService.addResponse(id, responseMessage);
      setResponseMessage('');
      await fetchTicket(); // Refresh ticket data
    } catch (error) {
      console.error('Add response error:', error);
      
      if (error.response?.status === 403) {
        setError('Access denied. You do not have permission to respond to this ticket.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to add response. Please try again.');
      }
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true);
    setError('');
    
    try {
      await ticketService.updateTicketStatus(id, newStatus);
      await fetchTicket(); // Refresh ticket data
    } catch (error) {
      console.error('Status update error:', error);
      
      if (error.response?.status === 403) {
        setError('Access denied. You do not have permission to update this ticket status.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to update ticket status. Please try again.');
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'status-open';
      case 'in_progress':
        return 'status-in-progress';
      case 'resolved':
        return 'status-resolved';
      case 'closed':
        return 'status-closed';
      default:
        return 'status-closed';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'priority-urgent';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-low';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return formatDate(dateString);
  };

  const canAddResponse = () => {
    if (user?.role === 'agent' || user?.role === 'admin') return true;
    if (user?.role === 'customer' && ticket?.customer?.id === user?.id) return true;
    return false;
  };

  const canUpdateStatus = () => {
    if (user?.role === 'agent' || user?.role === 'admin') return true;
    if (user?.role === 'customer' && ticket?.customer?.id === user?.id) return true;
    return false;
  };

  const canMarkAsResolved = () => {
    return canUpdateStatus() && ticket?.status !== 'resolved' && ticket?.status !== 'closed';
  };

  const getAvailableStatuses = () => {
    if (user?.role === 'admin' || user?.role === 'agent') {
      return [
        { value: 'open', label: 'Open', icon: 'fa-circle' },
        { value: 'in_progress', label: 'In Progress', icon: 'fa-clock' },
        { value: 'resolved', label: 'Resolved', icon: 'fa-check-circle' },
        { value: 'closed', label: 'Closed', icon: 'fa-archive' }
      ];
    } else if (user?.role === 'customer' && ticket?.customer?.id === user?.id) {
      return [
        { value: 'resolved', label: 'Mark as Resolved', icon: 'fa-check-circle' }
      ];
    }
    return [];
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-content">
            <div className="spinner-large"></div>
            <h5>Loading Ticket Details...</h5>
            <p>Please wait while we load the ticket information</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !ticket) {
    return (
      <Layout>
        <div className="main-content">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <div>
              <div>{error}</div>
              <button 
                onClick={fetchTicket} 
                className="btn btn-outline" 
                style={{marginTop: '0.5rem', fontSize: '0.9rem', padding: '0.5rem 1rem'}}
              >
                <i className="fas fa-redo"></i>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="ticket-detail-container">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-outline back-button"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </button>

        {/* Ticket Header */}
        <div className="ticket-header-card">
          <div className="ticket-header-content">
            <div className="ticket-title-section">
              <div className="ticket-id-title">
                <span className="ticket-id">#{ticket?.id}</span>
                <h1 className="ticket-title">{ticket?.title}</h1>
              </div>
              <div className="ticket-meta">
                <div className="meta-item">
                  <i className="fas fa-user"></i>
                  <span>Created by <strong>{ticket?.customer?.full_name}</strong></span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-calendar"></i>
                  <span>{formatDate(ticket?.created_at)}</span>
                </div>
                {ticket?.assigned_agent && (
                  <div className="meta-item">
                    <i className="fas fa-user-tie"></i>
                    <span>Assigned to <strong>{ticket.assigned_agent.full_name}</strong></span>
                  </div>
                )}
              </div>
            </div>
            <div className="ticket-badges">
              <span className={`badge ${getStatusColor(ticket?.status)}`}>
                <i className="fas fa-circle"></i>
                {ticket?.status?.replace('_', ' ')}
              </span>
              <span className={`badge ${getPriorityColor(ticket?.priority)}`}>
                <i className="fas fa-flag"></i>
                {ticket?.priority} priority
              </span>
            </div>
          </div>

          {/* Status Update Section */}
          {canUpdateStatus() && (
            <div className="status-update-section">
              <h4 className="status-update-title">
                <i className="fas fa-edit"></i>
                Update Status
              </h4>
              <div className="status-buttons">
                {getAvailableStatuses().map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusUpdate(status.value)}
                    disabled={updatingStatus || ticket?.status === status.value}
                    className={`status-button ${ticket?.status === status.value ? 'current-status' : ''} status-${status.value}`}
                  >
                    {updatingStatus ? (
                      <span className="spinner"></span>
                    ) : (
                      <i className={`fas ${status.icon}`}></i>
                    )}
                    {status.label}
                  </button>
                ))}
              </div>
              {user?.role === 'customer' && (
                <p className="status-help-text">
                  <i className="fas fa-info-circle"></i>
                  Mark as resolved when your issue has been fixed
                </p>
              )}
            </div>
          )}
          
          <div className="ticket-description-section">
            <h3 className="section-title">
              <i className="fas fa-file-alt"></i>
              Description
            </h3>
            <div className="ticket-description">{ticket?.description}</div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <div>
              <div>{error}</div>
              <button 
                onClick={() => setError('')} 
                className="btn btn-outline" 
                style={{marginTop: '0.5rem', fontSize: '0.9rem', padding: '0.5rem 1rem'}}
              >
                <i className="fas fa-times"></i>
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Responses Section */}
        <div className="responses-section">
          <div className="responses-header">
            <h3 className="section-title">
              <i className="fas fa-comments"></i>
              Conversation ({ticket?.responses?.length || 0})
            </h3>
            {canMarkAsResolved() && (
              <button
                onClick={() => handleStatusUpdate('resolved')}
                disabled={updatingStatus}
                className="quick-action-btn quick-action-resolve"
              >
                {updatingStatus ? (
                  <span className="spinner"></span>
                ) : (
                  <i className="fas fa-check-circle"></i>
                )}
                Mark as Resolved
              </button>
            )}
          </div>
          
          <div className="responses-container">
            {ticket?.responses?.length === 0 ? (
              <div className="empty-responses">
                <div className="empty-icon">
                  <i className="fas fa-comment-slash"></i>
                </div>
                <h5>No responses yet</h5>
                <p>Be the first to respond to this ticket</p>
              </div>
            ) : (
              <div className="responses-list">
                {ticket?.responses?.map((response, index) => (
                  <div key={response.id} className={`response-item ${response.user.id === user?.id ? 'own-response' : ''}`}>
                    <div className="response-avatar">
                      <div className={`avatar avatar-${response.user.role}`}>
                        <i className={`fas ${response.user.role === 'customer' ? 'fa-user' : response.user.role === 'agent' ? 'fa-headset' : 'fa-user-shield'}`}></i>
                      </div>
                    </div>
                    <div className="response-content">
                      <div className="response-header">
                        <div className="response-author">
                          <span className="author-name">{response.user.full_name}</span>
                          <span className={`role-badge role-${response.user.role}`}>
                            {response.user.role}
                          </span>
                        </div>
                        <div className="response-time">
                          <span className="time-ago">{getTimeAgo(response.created_at)}</span>
                          <span className="full-date">{formatDate(response.created_at)}</span>
                        </div>
                      </div>
                      <div className="response-message">{response.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Response Form */}
        {canAddResponse() && (
          <div className="add-response-section">
            <div className="add-response-header">
              <h3 className="section-title">
                <i className="fas fa-reply"></i>
                Add Response
              </h3>
            </div>
            <form onSubmit={handleAddResponse} className="response-form">
              <div className="form-group">
                <div className="response-input-container">
                  <div className="current-user-avatar">
                    <div className={`avatar avatar-${user?.role}`}>
                      <i className={`fas ${user?.role === 'customer' ? 'fa-user' : user?.role === 'agent' ? 'fa-headset' : 'fa-user-shield'}`}></i>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    className="response-textarea"
                    placeholder="Type your response here..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <div className="response-tips">
                  <i className="fas fa-lightbulb"></i>
                  <span>Be clear and helpful in your response</span>
                </div>
                <button
                  type="submit"
                  disabled={submittingResponse || !responseMessage.trim()}
                  className="btn btn-primary"
                >
                  {submittingResponse ? (
                    <>
                      <span className="spinner"></span>
                      Adding Response...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      Send Response
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TicketDetail;