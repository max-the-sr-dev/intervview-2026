from rest_framework import permissions

class IsCustomerOrAgent(permissions.BasePermission):
    """
    Custom permission to only allow customers to view their own tickets
    and agents/admins to view all tickets.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Agents and admins can access all tickets
        if request.user.role in ['agent', 'admin']:
            return True
        
        # Customers can only access their own tickets
        if request.user.role == 'customer':
            return obj.customer == request.user
        
        return False

class CanCreateTicket(permissions.BasePermission):
    """
    Only customers can create tickets.
    """
    
    def has_permission(self, request, view):
        if request.method == 'POST':
            return request.user and request.user.is_authenticated and request.user.role == 'customer'
        return request.user and request.user.is_authenticated

class CanUpdateTicketStatus(permissions.BasePermission):
    """
    Allow customers to mark their own tickets as resolved,
    and agents/admins to update any ticket status.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Agents and admins can update any ticket status
        if request.user.role in ['agent', 'admin']:
            return True
        
        # Customers can only mark their own tickets as resolved
        if request.user.role == 'customer':
            if obj.customer == request.user:
                # Only allow customers to mark as resolved
                if 'status' in request.data:
                    return request.data['status'] == 'resolved'
                return True
            return False
        
        return False