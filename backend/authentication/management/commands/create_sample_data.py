from django.core.management.base import BaseCommand
from authentication.models import User
from tickets.models import Ticket, TicketResponse

class Command(BaseCommand):
    help = 'Create sample data for testing'

    def handle(self, *args, **options):
        # Create sample users
        customer1, created = User.objects.get_or_create(
            username='john_customer',
            defaults={
                'email': 'john@example.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'role': 'customer'
            }
        )
        if created:
            customer1.set_password('password123')
            customer1.save()
            self.stdout.write(f'Created customer: {customer1.username}')

        customer2, created = User.objects.get_or_create(
            username='jane_customer',
            defaults={
                'email': 'jane@example.com',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'role': 'customer'
            }
        )
        if created:
            customer2.set_password('password123')
            customer2.save()
            self.stdout.write(f'Created customer: {customer2.username}')

        agent1, created = User.objects.get_or_create(
            username='mike_agent',
            defaults={
                'email': 'mike@example.com',
                'first_name': 'Mike',
                'last_name': 'Johnson',
                'role': 'agent'
            }
        )
        if created:
            agent1.set_password('password123')
            agent1.save()
            self.stdout.write(f'Created agent: {agent1.username}')

        # Create sample tickets
        ticket1, created = Ticket.objects.get_or_create(
            title='Login Issues',
            defaults={
                'description': 'I am unable to log into my account. The password reset is not working.',
                'customer': customer1,
                'priority': 'high',
                'status': 'open'
            }
        )
        if created:
            self.stdout.write(f'Created ticket: {ticket1.title}')

        ticket2, created = Ticket.objects.get_or_create(
            title='Feature Request: Dark Mode',
            defaults={
                'description': 'It would be great to have a dark mode option for the dashboard.',
                'customer': customer2,
                'priority': 'low',
                'status': 'open'
            }
        )
        if created:
            self.stdout.write(f'Created ticket: {ticket2.title}')

        ticket3, created = Ticket.objects.get_or_create(
            title='Payment Processing Error',
            defaults={
                'description': 'Getting error 500 when trying to process payment. This is urgent!',
                'customer': customer1,
                'priority': 'urgent',
                'status': 'in_progress',
                'assigned_agent': agent1
            }
        )
        if created:
            self.stdout.write(f'Created ticket: {ticket3.title}')

        # Create sample responses
        response1, created = TicketResponse.objects.get_or_create(
            ticket=ticket3,
            user=agent1,
            defaults={
                'message': 'Thank you for reporting this issue. I am looking into the payment processing error and will update you shortly.'
            }
        )
        if created:
            self.stdout.write(f'Created response for ticket {ticket3.id}')

        response2, created = TicketResponse.objects.get_or_create(
            ticket=ticket3,
            user=customer1,
            defaults={
                'message': 'Thank you for the quick response! This is affecting our business operations.'
            }
        )
        if created:
            self.stdout.write(f'Created customer response for ticket {ticket3.id}')

        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
        self.stdout.write('Test credentials:')
        self.stdout.write('- Admin: admin / admin123')
        self.stdout.write('- Customer: john_customer / password123')
        self.stdout.write('- Customer: jane_customer / password123')
        self.stdout.write('- Agent: mike_agent / password123')