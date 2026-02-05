from django.urls import path
from .views import (
    TicketListCreateView, 
    TicketDetailView, 
    add_response, 
    assign_agent,
    get_agents,
    dashboard_stats
)

urlpatterns = [
    path('', TicketListCreateView.as_view(), name='ticket-list-create'),
    path('<int:pk>/', TicketDetailView.as_view(), name='ticket-detail'),
    path('<int:ticket_id>/responses/', add_response, name='add-response'),
    path('<int:ticket_id>/assign/', assign_agent, name='assign-agent'),
    path('agents/', get_agents, name='get-agents'),
    path('stats/', dashboard_stats, name='dashboard-stats'),
]