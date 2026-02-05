from django.contrib import admin
from .models import Ticket, TicketResponse

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'customer', 'status', 'priority', 'assigned_agent', 'created_at')
    list_filter = ('status', 'priority', 'created_at')
    search_fields = ('title', 'description', 'customer__username', 'customer__email')
    ordering = ('-created_at',)
    raw_id_fields = ('customer', 'assigned_agent')
    
    fieldsets = (
        ('Ticket Information', {
            'fields': ('title', 'description', 'customer')
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority', 'assigned_agent')
        }),
    )

@admin.register(TicketResponse)
class TicketResponseAdmin(admin.ModelAdmin):
    list_display = ('id', 'ticket', 'user', 'created_at')
    list_filter = ('created_at', 'user__role')
    search_fields = ('message', 'ticket__title', 'user__username')
    ordering = ('-created_at',)
    raw_id_fields = ('ticket', 'user')