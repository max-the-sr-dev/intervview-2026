# Deployment Guide

This guide covers deploying the Customer Support Dashboard to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Configuration](#database-configuration)
6. [Security Considerations](#security-considerations)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Backup and Recovery](#backup-and-recovery)

## Prerequisites

### System Requirements

- **Operating System**: Ubuntu 20.04+ or CentOS 8+
- **Python**: 3.8 or higher
- **Node.js**: 16.0 or higher
- **Database**: PostgreSQL 12+ (recommended) or MySQL 8.0+
- **Web Server**: Nginx or Apache
- **Process Manager**: Gunicorn + Supervisor or systemd
- **SSL Certificate**: Let's Encrypt or commercial certificate

### Domain and Infrastructure

- Domain name configured with DNS
- Server with at least 2GB RAM and 20GB storage
- SSL certificate for HTTPS
- Email service for notifications (optional)

## Environment Setup

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3 python3-pip python3-venv nodejs npm postgresql postgresql-contrib nginx supervisor git

# Install Node.js 16+ (if not available in default repos)
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Create Application User

```bash
# Create dedicated user for the application
sudo adduser --system --group --home /opt/support-dashboard support-dashboard

# Switch to application user
sudo su - support-dashboard
```

### 3. Clone Repository

```bash
# Clone the repository
git clone <your-repository-url> /opt/support-dashboard/app
cd /opt/support-dashboard/app
```

## Backend Deployment

### 1. Python Environment Setup

```bash
# Create virtual environment
cd /opt/support-dashboard/app/backend
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install additional production packages
pip install gunicorn psycopg2-binary
```

### 2. Production Environment Configuration

Create `/opt/support-dashboard/app/backend/.env`:

```env
# Django Configuration
DEBUG=False
SECRET_KEY=your-super-secret-key-change-this-in-production-make-it-very-long-and-random
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database Configuration (PostgreSQL)
DATABASE_URL=postgresql://support_user:secure_password@localhost:5432/support_dashboard

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# JWT Configuration
ACCESS_TOKEN_LIFETIME=60
REFRESH_TOKEN_LIFETIME=1440

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Security Settings
SECURE_SSL_REDIRECT=True
SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True

# Static Files
STATIC_ROOT=/opt/support-dashboard/app/backend/staticfiles
MEDIA_ROOT=/opt/support-dashboard/app/backend/media
```

### 3. Database Setup

```bash
# Create PostgreSQL database and user
sudo -u postgres psql

CREATE DATABASE support_dashboard;
CREATE USER support_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE support_dashboard TO support_user;
ALTER USER support_user CREATEDB;
\q

# Run migrations
cd /opt/support-dashboard/app/backend
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Create superuser (optional)
python manage.py createsuperuser
```

### 4. Gunicorn Configuration

Create `/opt/support-dashboard/app/backend/gunicorn.conf.py`:

```python
# Gunicorn configuration file
import multiprocessing

# Server socket
bind = "127.0.0.1:8001"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2

# Restart workers after this many requests, to help prevent memory leaks
max_requests = 1000
max_requests_jitter = 100

# Logging
accesslog = "/opt/support-dashboard/logs/gunicorn-access.log"
errorlog = "/opt/support-dashboard/logs/gunicorn-error.log"
loglevel = "info"

# Process naming
proc_name = "support-dashboard"

# Server mechanics
daemon = False
pidfile = "/opt/support-dashboard/run/gunicorn.pid"
user = "support-dashboard"
group = "support-dashboard"
tmp_upload_dir = None

# SSL (if terminating SSL at Gunicorn level)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"
```

### 5. Supervisor Configuration

Create `/etc/supervisor/conf.d/support-dashboard.conf`:

```ini
[program:support-dashboard]
command=/opt/support-dashboard/app/backend/venv/bin/gunicorn config.wsgi:application -c /opt/support-dashboard/app/backend/gunicorn.conf.py
directory=/opt/support-dashboard/app/backend
user=support-dashboard
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/opt/support-dashboard/logs/supervisor.log
environment=PATH="/opt/support-dashboard/app/backend/venv/bin"
```

### 6. Create Required Directories

```bash
# Create directories
sudo mkdir -p /opt/support-dashboard/logs
sudo mkdir -p /opt/support-dashboard/run
sudo chown -R support-dashboard:support-dashboard /opt/support-dashboard/
```

### 7. Start Backend Services

```bash
# Update supervisor configuration
sudo supervisorctl reread
sudo supervisorctl update

# Start the application
sudo supervisorctl start support-dashboard

# Check status
sudo supervisorctl status support-dashboard
```

## Frontend Deployment

### 1. Build Production Bundle

```bash
cd /opt/support-dashboard/app/frontend

# Install dependencies
npm install

# Create production environment file
cat > .env.production << EOF
VITE_API_URL=https://yourdomain.com/api
EOF

# Build for production
npm run build
```

### 2. Nginx Configuration

Create `/etc/nginx/sites-available/support-dashboard`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Frontend (React App)
    location / {
        root /opt/support-dashboard/app/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # Increase timeout for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Django Admin (optional)
    location /admin/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Static files
    location /static/ {
        alias /opt/support-dashboard/app/backend/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /opt/support-dashboard/app/backend/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Client max body size (for file uploads)
    client_max_body_size 10M;
}
```

### 3. Enable Nginx Site

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/support-dashboard /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Database Configuration

### PostgreSQL Optimization

Edit `/etc/postgresql/12/main/postgresql.conf`:

```conf
# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Connection settings
max_connections = 100

# Logging
log_statement = 'all'
log_duration = on
log_min_duration_statement = 1000

# Performance
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

### Database Backup Script

Create `/opt/support-dashboard/scripts/backup.sh`:

```bash
#!/bin/bash

# Database backup script
BACKUP_DIR="/opt/support-dashboard/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="support_dashboard"
DB_USER="support_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Remove backups older than 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

Make it executable and add to cron:

```bash
chmod +x /opt/support-dashboard/scripts/backup.sh

# Add to crontab (daily backup at 2 AM)
echo "0 2 * * * /opt/support-dashboard/scripts/backup.sh" | sudo crontab -u support-dashboard -
```

## Security Considerations

### 1. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### 3. Security Updates

Create `/opt/support-dashboard/scripts/security-updates.sh`:

```bash
#!/bin/bash

# Automatic security updates
apt update
apt upgrade -y

# Restart services if needed
systemctl restart nginx
supervisorctl restart support-dashboard
```

### 4. Log Monitoring

Install and configure fail2ban:

```bash
sudo apt install fail2ban

# Create jail configuration
sudo cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
EOF

sudo systemctl restart fail2ban
```

## Monitoring and Logging

### 1. Log Rotation

Create `/etc/logrotate.d/support-dashboard`:

```
/opt/support-dashboard/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 support-dashboard support-dashboard
    postrotate
        supervisorctl restart support-dashboard
    endscript
}
```

### 2. Health Check Script

Create `/opt/support-dashboard/scripts/health-check.sh`:

```bash
#!/bin/bash

# Health check script
API_URL="https://yourdomain.com/api/auth/profile/"
EXPECTED_STATUS=401  # Unauthorized (expected without token)

# Check API health
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $STATUS -eq $EXPECTED_STATUS ]; then
    echo "API is healthy"
    exit 0
else
    echo "API health check failed. Status: $STATUS"
    # Restart application
    supervisorctl restart support-dashboard
    exit 1
fi
```

### 3. System Monitoring

Install basic monitoring tools:

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Install and configure logwatch
sudo apt install logwatch
sudo logwatch --detail Med --mailto admin@yourdomain.com --service All --range today
```

## Backup and Recovery

### 1. Complete Backup Script

Create `/opt/support-dashboard/scripts/full-backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/opt/support-dashboard/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/opt/support-dashboard/app"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U support_user -h localhost support_dashboard | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Application files backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /opt/support-dashboard app --exclude=app/backend/venv --exclude=app/node_modules

# Media files backup
tar -czf $BACKUP_DIR/media_$DATE.tar.gz -C /opt/support-dashboard/app/backend media

# Configuration backup
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /etc/nginx/sites-available/support-dashboard /etc/supervisor/conf.d/support-dashboard.conf

echo "Full backup completed: $DATE"
```

### 2. Recovery Procedure

```bash
# Stop services
sudo supervisorctl stop support-dashboard
sudo systemctl stop nginx

# Restore database
gunzip -c /path/to/backup/db_YYYYMMDD_HHMMSS.sql.gz | psql -U support_user -h localhost support_dashboard

# Restore application files
tar -xzf /path/to/backup/app_YYYYMMDD_HHMMSS.tar.gz -C /opt/support-dashboard/

# Restore media files
tar -xzf /path/to/backup/media_YYYYMMDD_HHMMSS.tar.gz -C /opt/support-dashboard/app/backend/

# Set permissions
sudo chown -R support-dashboard:support-dashboard /opt/support-dashboard/

# Start services
sudo systemctl start nginx
sudo supervisorctl start support-dashboard
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_tickets_status ON tickets_ticket(status);
CREATE INDEX idx_tickets_priority ON tickets_ticket(priority);
CREATE INDEX idx_tickets_customer ON tickets_ticket(customer_id);
CREATE INDEX idx_tickets_agent ON tickets_ticket(assigned_agent_id);
CREATE INDEX idx_responses_ticket ON tickets_ticketresponse(ticket_id);
```

### 2. Caching (Redis)

```bash
# Install Redis
sudo apt install redis-server

# Configure Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

Add to Django settings:

```python
# Cache configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Session storage
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**: Check if Gunicorn is running
2. **Static files not loading**: Run `collectstatic` and check Nginx configuration
3. **Database connection errors**: Check PostgreSQL service and credentials
4. **SSL certificate issues**: Verify certificate paths and permissions

### Log Locations

- **Nginx**: `/var/log/nginx/`
- **Gunicorn**: `/opt/support-dashboard/logs/`
- **Supervisor**: `/var/log/supervisor/`
- **PostgreSQL**: `/var/log/postgresql/`

### Useful Commands

```bash
# Check service status
sudo systemctl status nginx
sudo supervisorctl status support-dashboard

# View logs
sudo tail -f /opt/support-dashboard/logs/gunicorn-error.log
sudo tail -f /var/log/nginx/error.log

# Restart services
sudo supervisorctl restart support-dashboard
sudo systemctl restart nginx

# Check database connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity WHERE datname='support_dashboard';"
```

This deployment guide provides a comprehensive setup for production deployment. Adjust configurations based on your specific requirements and infrastructure.