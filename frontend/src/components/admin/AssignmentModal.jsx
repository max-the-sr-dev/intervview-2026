import React, { useState, useEffect } from 'react';
import { ticketService } from '../../services/tickets';

const AssignmentModal = ({ isOpen, onClose, onAssignmentComplete }) => {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [ticketsData, agentsData] = await Promise.all([
        ticketService.getTickets(),
        ticketService.getAgents()
      ]);
      
      setTickets(ticketsData.results || ticketsData);
      setAgents(agentsData);
      
      // Initialize assignments with current assignments
      const currentAssignments = {};
      (ticketsData.results || ticketsData).forEach(ticket => {
        if (ticket.assigned_agent) {
          currentAssignments[ticket.id] = ticket.assigned_agent.id;
        }
      });
      setAssignments(currentAssignments);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load tickets and agents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentChange = (ticketId, agentId) => {
    setAssignments(prev => ({
      ...prev,
      [ticketId]: agentId || null
    }));
  };

  const handleSaveAssignments = async () => {
    setLoading(true);
    setError('');
    
    try {
      const promises = Object.entries(assignments).map(([ticketId, agentId]) => {
        const ticket = tickets.find(t => t.id === parseInt(ticketId));
        const currentAgentId = ticket?.assigned_agent?.id || null;
        
        // Only update if assignment changed
        if (currentAgentId !== agentId) {
          return ticketService.assignAgent(ticketId, agentId);
        }
        return Promise.resolve();
      });
      
      await Promise.all(promises);
      onAssignmentComplete();
      onClose();
      
    } catch (error) {
      console.error('Failed to save assignments:', error);
      setError('Failed to save assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAgentName = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? `${agent.first_name} ${agent.last_name}` : 'Unassigned';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'in_progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return 'status-closed';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="assignment-modal">
        <div className="modal-header">
          <h2>
            <i className="fas fa-user-cog"></i>
            Manage Agent Assignments
          </h2>
          <button onClick={onClose} className="modal-close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-content">
              <div className="spinner-large"></div>
              <p>Loading tickets and agents...</p>
            </div>
          ) : (
            <div className="assignments-container">
              <div className="assignments-header">
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-value">{tickets.length}</span>
                    <span className="stat-label">Total Tickets</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{agents.length}</span>
                    <span className="stat-label">Available Agents</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">
                      {tickets.filter(t => !t.assigned_agent).length}
                    </span>
                    <span className="stat-label">Unassigned</span>
                  </div>
                </div>
              </div>

              <div className="assignments-list">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="assignment-item">
                    <div className="ticket-info">
                      <div className="ticket-header">
                        <span className="ticket-id">#{ticket.id}</span>
                        <span className={`badge ${getStatusClass(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="ticket-title">{ticket.title}</h4>
                      <div className="ticket-meta">
                        <span>
                          <i className="fas fa-user"></i>
                          {ticket.customer.first_name} {ticket.customer.last_name}
                        </span>
                        <span>
                          <i className="fas fa-calendar"></i>
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="assignment-control">
                      <label>Assign to Agent:</label>
                      <select
                        value={assignments[ticket.id] || ''}
                        onChange={(e) => handleAssignmentChange(ticket.id, e.target.value)}
                        className="agent-select"
                      >
                        <option value="">Unassigned</option>
                        {agents.map(agent => (
                          <option key={agent.id} value={agent.id}>
                            {agent.first_name} {agent.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-outline">
            Cancel
          </button>
          <button 
            onClick={handleSaveAssignments} 
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Save Assignments
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;