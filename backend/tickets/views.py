from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Ticket, TicketResponse
from .serializers import (
    TicketSerializer, 
    TicketCreateSerializer, 
    TicketUpdateSerializer,
    TicketResponseSerializer
)
from .permissions import IsCustomerOrAgent, CanCreateTicket, CanUpdateTicketStatus

class TicketListCreateView(generics.ListCreateAPIView):
    permission_classes = [CanCreateTicket]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TicketCreateSerializer
        return TicketSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Admins see all tickets
        if user.role == 'admin':
            return Ticket.objects.all()
        
        # Agents see only tickets assigned to them
        elif user.role == 'agent':
            return Ticket.objects.filter(assigned_agent=user)
        
        # Customers see only their tickets
        else:
            return Ticket.objects.filter(customer=user)

class TicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ticket.objects.all()
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [CanUpdateTicketStatus()]
        return [IsCustomerOrAgent()]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TicketUpdateSerializer
        return TicketSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_response(request, ticket_id):
    ticket = get_object_or_404(Ticket, id=ticket_id)
    
    # Check permissions
    if request.user.role == 'customer' and ticket.customer != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = TicketResponseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(ticket=ticket, user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_agent(request, ticket_id):
    # Only admins can assign agents
    if request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    ticket = get_object_or_404(Ticket, id=ticket_id)
    agent_id = request.data.get('agent_id')
    
    if agent_id:
        from authentication.models import User
        try:
            agent = User.objects.get(id=agent_id, role='agent')
            ticket.assigned_agent = agent
            ticket.save()
            
            # Serialize the updated ticket
            serializer = TicketSerializer(ticket)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'Agent not found'}, status=status.HTTP_404_NOT_FOUND)
    else:
        # Unassign agent
        ticket.assigned_agent = None
        ticket.save()
        
        serializer = TicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_agents(request):
    # Only admins can get list of agents
    if request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    from authentication.models import User
    agents = User.objects.filter(role='agent').values('id', 'first_name', 'last_name', 'email')
    return Response(list(agents), status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    
    if user.role == 'customer':
        tickets = Ticket.objects.filter(customer=user)
        stats = {
            'total_tickets': tickets.count(),
            'open_tickets': tickets.filter(status='open').count(),
            'resolved_tickets': tickets.filter(status='resolved').count(),
            'closed_tickets': tickets.filter(status='closed').count(),
        }
    elif user.role == 'agent':
        # Agents see only their assigned tickets
        assigned_tickets = Ticket.objects.filter(assigned_agent=user)
        
        stats = {
            'total_tickets': assigned_tickets.count(),
            'open_tickets': assigned_tickets.filter(status='open').count(),
            'in_progress_tickets': assigned_tickets.filter(status='in_progress').count(),
            'resolved_tickets': assigned_tickets.filter(status='resolved').count(),
            'assigned_to_me': assigned_tickets.count(),
        }
    elif user.role == 'admin':
        # Admins see all tickets
        all_tickets = Ticket.objects.all()
        unassigned_tickets = all_tickets.filter(assigned_agent__isnull=True)
        
        stats = {
            'total_tickets': all_tickets.count(),
            'open_tickets': all_tickets.filter(status='open').count(),
            'in_progress_tickets': all_tickets.filter(status='in_progress').count(),
            'resolved_tickets': all_tickets.filter(status='resolved').count(),
            'unassigned_tickets': unassigned_tickets.count(),
        }
    
    return Response(stats)