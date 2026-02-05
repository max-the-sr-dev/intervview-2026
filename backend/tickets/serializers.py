from rest_framework import serializers
from .models import Ticket, TicketResponse
from authentication.serializers import UserProfileSerializer

class TicketResponseSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = TicketResponse
        fields = ('id', 'message', 'user', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')

class TicketSerializer(serializers.ModelSerializer):
    customer = UserProfileSerializer(read_only=True)
    assigned_agent = UserProfileSerializer(read_only=True)
    responses = TicketResponseSerializer(many=True, read_only=True)
    
    class Meta:
        model = Ticket
        fields = ('id', 'title', 'description', 'status', 'priority', 
                 'customer', 'assigned_agent', 'responses', 'created_at', 'updated_at')
        read_only_fields = ('id', 'customer', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)

class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ('title', 'description', 'priority')
    
    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)

class TicketUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ('title', 'description', 'status', 'priority', 'assigned_agent')
    
    def update(self, instance, validated_data):
        user = self.context['request'].user
        
        # Only agents and admins can change status and assign agents
        if user.role not in ['agent', 'admin']:
            validated_data.pop('status', None)
            validated_data.pop('assigned_agent', None)
        
        # Only customers can edit title and description of their own tickets
        if user.role == 'customer' and instance.customer != user:
            validated_data.pop('title', None)
            validated_data.pop('description', None)
        
        return super().update(instance, validated_data)