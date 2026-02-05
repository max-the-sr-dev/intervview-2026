import React from 'react';
import { Link } from 'react-router-dom';

const TicketCard = ({ ticket }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'in_progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return 'status-closed';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-low';
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

  return (
    <div className={`ticket-card ${ticket.status === 'resolved' ? 'ticket-resolved' : ''} ${ticket.status === 'closed' ? 'ticket-closed' : ''}`}>
      <div className="ticket-header">
        <div className="ticket-id">#{ticket.id}</div>
        <div className="ticket-badges">
          <span className={`badge ${getStatusClass(ticket.status)}`}>
            {ticket.status === 'resolved' && <i className="fas fa-check-circle"></i>}
            {ticket.status === 'closed' && <i className="fas fa-archive"></i>}
            {ticket.status === 'open' && <i className="fas fa-circle"></i>}
            {ticket.status === 'in_progress' && <i className="fas fa-clock"></i>}
            {ticket.status.replace('_', ' ').toUpperCase()}
          </span>
          <span className={`badge ${getPriorityClass(ticket.priority)}`}>
            <i className="fas fa-flag"></i>
            {ticket.priority.toUpperCase()}
          </span>
        </div>
      </div>
      
      <Link to={`/tickets/${ticket.id}`} className="ticket-title-link">
        <h3 className="ticket-title">{ticket.title}</h3>
      </Link>
      
      <p className="ticket-description">{ticket.description}</p>
      
      <div className="ticket-footer">
        <div className="ticket-meta">
          <div className="meta-item">
            <i className="fas fa-user"></i>
            <span>{ticket.customer.first_name} {ticket.customer.last_name}</span>
          </div>
          {ticket.assigned_agent && (
            <div className="meta-item">
              <i className="fas fa-user-check"></i>
              <span>{ticket.assigned_agent.first_name} {ticket.assigned_agent.last_name}</span>
            </div>
          )}
        </div>
        
        <div className="ticket-info">
          {ticket.responses && ticket.responses.length > 0 && (
            <div className="info-item">
              <i className="fas fa-comments"></i>
              <span>{ticket.responses.length}</span>
            </div>
          )}
          <div className="info-item">
            <i className="fas fa-clock"></i>
            <span>{formatDate(ticket.created_at)}</span>
          </div>
        </div>
      </div>
      
      {ticket.status === 'resolved' && (
        <div className="resolved-indicator">
          <i className="fas fa-check-circle"></i>
          <span>Issue Resolved</span>
        </div>
      )}
    </div>
  );
};

export default TicketCard;