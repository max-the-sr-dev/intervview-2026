import api from './api';

export const ticketService = {
  // Get all tickets (filtered by user role)
  getTickets: async () => {
    const response = await api.get('/tickets/');
    return response.data;
  },

  // Get single ticket
  getTicket: async (id) => {
    const response = await api.get(`/tickets/${id}/`);
    return response.data;
  },

  // Create new ticket
  createTicket: async (ticketData) => {
    const response = await api.post('/tickets/', ticketData);
    return response.data;
  },

  // Update ticket
  updateTicket: async (id, ticketData) => {
    const response = await api.put(`/tickets/${id}/`, ticketData);
    return response.data;
  },

  // Delete ticket
  deleteTicket: async (id) => {
    const response = await api.delete(`/tickets/${id}/`);
    return response.data;
  },

  // Add response to ticket
  addResponse: async (ticketId, message) => {
    const response = await api.post(`/tickets/${ticketId}/responses/`, { message });
    return response.data;
  },

  // Update ticket status
  updateTicketStatus: async (ticketId, status) => {
    const response = await api.patch(`/tickets/${ticketId}/`, { status });
    return response.data;
  },

  // Assign agent to ticket (admin only)
  assignAgent: async (ticketId, agentId) => {
    const response = await api.post(`/tickets/${ticketId}/assign/`, { agent_id: agentId });
    return response.data;
  },

  // Get list of agents (admin only)
  getAgents: async () => {
    const response = await api.get('/tickets/agents/');
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/tickets/stats/');
    return response.data;
  },
};