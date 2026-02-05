import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketService } from '../services/tickets';
import TicketCard from '../components/tickets/TicketCard';
import Layout from '../components/common/Layout';
import AssignmentModal from '../components/admin/AssignmentModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ticketsData, statsData] = await Promise.all([
        ticketService.getTickets(),
        ticketService.getDashboardStats(),
      ]);
      setTickets(ticketsData.results || ticketsData);
      setStats(statsData);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Dashboard error:', error);
      
      if (error.response?.status === 500) {
        setError('Server error. Please refresh the page or try again later.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('Network error. Please check your connection and refresh the page.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You may not have permission to view this data.');
      } else {
        setError('Failed to load dashboard data. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'customer':
        return 'Track and manage your support requests with ease. We\'re here to help you every step of the way.';
      case 'agent':
        return 'Your assigned tickets are ready for your attention. Let\'s help customers solve their issues today.';
      case 'admin':
        return 'Monitor the entire support system and manage team assignments to ensure optimal customer service.';
      default:
        return 'Welcome to your personalized support dashboard.';
    }
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  const renderStats = () => {
    const statCards = [];
    
    if (user?.role === 'customer') {
      statCards.push(
        { label: 'Total Tickets', value: stats.total_tickets || 0, variant: 'primary', icon: 'fas fa-ticket-alt', trend: '+12%' },
        { label: 'Open Tickets', value: stats.open_tickets || 0, variant: 'danger', icon: 'fas fa-exclamation-circle', trend: '-5%' },
        { label: 'Resolved Tickets', value: stats.resolved_tickets || 0, variant: 'success', icon: 'fas fa-check-circle', trend: '+18%' },
        { label: 'Closed Tickets', value: stats.closed_tickets || 0, variant: 'secondary', icon: 'fas fa-archive', trend: '+3%' }
      );
    } else if (user?.role === 'agent') {
      statCards.push(
        { label: 'Assigned to Me', value: stats.assigned_to_me || 0, variant: 'primary', icon: 'fas fa-user-check', trend: '+8%' },
        { label: 'Open Tickets', value: stats.open_tickets || 0, variant: 'danger', icon: 'fas fa-exclamation-circle', trend: '-2%' },
        { label: 'In Progress', value: stats.in_progress_tickets || 0, variant: 'warning', icon: 'fas fa-clock', trend: '+15%' },
        { label: 'Resolved', value: stats.resolved_tickets || 0, variant: 'success', icon: 'fas fa-check-circle', trend: '+22%' }
      );
    } else if (user?.role === 'admin') {
      statCards.push(
        { label: 'Total Tickets', value: stats.total_tickets || 0, variant: 'primary', icon: 'fas fa-chart-bar', trend: '+10%' },
        { label: 'Unassigned', value: stats.unassigned_tickets || 0, variant: 'warning', icon: 'fas fa-user-slash', trend: '-8%' },
        { label: 'In Progress', value: stats.in_progress_tickets || 0, variant: 'info', icon: 'fas fa-clock', trend: '+12%' },
        { label: 'Resolved', value: stats.resolved_tickets || 0, variant: 'success', icon: 'fas fa-check-circle', trend: '+25%' }
      );
    }

    return (
      <div className="modern-stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className={`modern-stat-card stat-${stat.variant}`}>
            <div className="stat-card-header">
              <div className="stat-icon-container">
                <i className={stat.icon}></i>
              </div>
              <div className="stat-trend">
                
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label">{stat.label}</p>
            </div>
            <div className="stat-progress">
              <div className="progress-bar" style={{width: `${Math.min(stat.value * 10, 100)}%`}}></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-content">
            <div className="spinner-large"></div>
            <h5>Loading Dashboard...</h5>
            <p>Please wait while we load your data</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="modern-dashboard-container">
        {/* Modern Hero Section */}
        <div className="modern-hero-section">
          <div className="hero-background">
            <div className="hero-pattern"></div>
          </div>
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-greeting">
                <span className="greeting-time">Good {getTimeOfDay()}</span>
                <h1 className="hero-title">
                  {user?.first_name}
                  <span className="wave-emoji">👋</span>
                </h1>
              </div>
              <p className="hero-subtitle">{getWelcomeMessage()}</p>
              <div className="hero-actions">
                {user?.role === 'customer' && (
                  <Link to="/tickets/new" className="btn btn-primary hero-btn">
                    <i className="fas fa-plus"></i>
                    Create New Ticket
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <button className="btn btn-outline hero-btn" onClick={() => setShowAssignModal(true)}>
                    <i className="fas fa-users"></i>
                    Manage Assignments
                  </button>
                )}
              </div>
            </div>
            <div className="hero-visual">
              <div className="floating-cards">
                <div className="floating-card card-1">
                  <i className="fas fa-ticket-alt"></i>
                </div>
                <div className="floating-card card-2">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="floating-card card-3">
                  <i className="fas fa-headset"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {renderStats()}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <div>
              <div>{error}</div>
              <button 
                onClick={fetchData} 
                className="btn btn-outline" 
                style={{marginTop: '0.5rem', fontSize: '0.9rem', padding: '0.5rem 1rem'}}
              >
                <i className="fas fa-redo"></i>
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Modern Tickets Section */}
        <div className="modern-tickets-section">
          <div className="section-header">
            <div className="section-title-group">
              <h2 className="section-title">
                <i className="fas fa-ticket-alt"></i>
                {user?.role === 'customer' ? 'Your Tickets' : user?.role === 'agent' ? 'Assigned Tickets' : 'All Tickets'}
              </h2>
              <p className="section-subtitle">
                {user?.role === 'customer' 
                  ? 'Track the progress of your support requests' 
                  : user?.role === 'agent'
                  ? 'Tickets assigned to you for resolution'
                  : 'Overview of all support tickets in the system'}
              </p>
            </div>
            <div className="section-actions">
              {user?.role === 'customer' && (
                <Link to="/tickets/new" className="btn btn-primary">
                  <i className="fas fa-plus"></i>
                  New Ticket
                </Link>
              )}
              {user?.role === 'admin' && (
                <button className="btn btn-outline" onClick={() => setShowAssignModal(true)}>
                  <i className="fas fa-user-cog"></i>
                  Assign Agents
                </button>
              )}
            </div>
          </div>
          
          <div className="tickets-container">
            {tickets.length === 0 ? (
              <div className="modern-empty-state">
                <div className="empty-illustration">
                  <div className="empty-circle">
                    <i className="fas fa-clipboard-list"></i>
                  </div>
                  <div className="empty-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                <h3 className="empty-title">
                  {user?.role === 'customer' ? "No tickets yet" : user?.role === 'agent' ? "No assigned tickets" : "No tickets found"}
                </h3>
                <p className="empty-description">
                  {user?.role === 'customer' 
                    ? "Ready to get help? Create your first support ticket and we'll assist you right away." 
                    : user?.role === 'agent'
                    ? "No tickets have been assigned to you yet. Check back later or contact your admin."
                    : "No support tickets have been created yet."}
                </p>
                {user?.role === 'customer' && (
                  <Link to="/tickets/new" className="btn btn-primary">
                    <i className="fas fa-rocket"></i>
                    Create Your First Ticket
                  </Link>
                )}
              </div>
            ) : (
              <div className="modern-tickets-grid">
                {tickets.slice(0, 6).map((ticket) => (
                  <div key={ticket.id} className="modern-ticket-item">
                    <TicketCard ticket={ticket} />
                  </div>
                ))}
              </div>
            )}
            
            {tickets.length > 6 && (
              <div className="view-all-section">
                <Link to="/tickets" className="view-all-btn">
                  <span>View all {tickets.length} tickets</span>
                  <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Assignment Modal */}
      {user?.role === 'admin' && (
        <AssignmentModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onAssignmentComplete={fetchData}
        />
      )}
    </Layout>
  );
};

export default Dashboard;