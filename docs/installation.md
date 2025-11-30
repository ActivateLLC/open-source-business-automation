# Installation Guide

This guide provides step-by-step instructions for setting up the Open Source Business Automation Stack on your server.

## Prerequisites

- A Linux server with at least 8GB RAM and 4 CPU cores (16GB+ recommended for production)
- Docker and Docker Compose installed
- 50GB+ of storage space (200GB+ recommended for production)
- Internet connectivity for the server
- Basic command line knowledge

## Installation Steps

### 1. Install Docker and Docker Compose

If you don't already have Docker and Docker Compose installed, run these commands:

```bash
# Update package information
sudo apt-get update

# Install required packages
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Add Docker repository
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Update package information again
sudo apt-get update

# Install Docker
sudo apt-get install -y docker-ce

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add your user to the docker group (optional but recommended)
sudo usermod -aG docker $USER

# Verify installations
docker --version
docker-compose --version
```

### 2. Clone the Repository

```bash
git clone https://github.com/ActivateLLC/open-source-business-automation.git
cd open-source-business-automation
```

### 3. Run the Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

This script will create the necessary directory structure and template files.

### 4. Configure the Environment

1. Edit the `docker-compose.yml` file to change default passwords and other settings:

```bash
nano docker-compose.yml
```

2. **Critical Security Settings - Change These Values:**
   - `POSTGRES_PASSWORD`: Database password
   - `AP_JWT_SECRET`: Activepieces JWT secret
   - `AP_ENCRYPTION_KEY`: Activepieces encryption key
   - `N8N_ENCRYPTION_KEY`: n8n encryption key
   - `SUPERSET_SECRET_KEY`: Apache Superset secret key
   - `APP_KEY`: NocoBase application key

### 5. Start the Services

```bash
# Pull all images (this may take a while)
docker-compose pull

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### 6. Access the Platforms

After the services are running, access them at these URLs:

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| **NocoBase** (Main UI) | `http://your-server-ip:13000` | admin@example.com / admin123 |
| **Activepieces** (Automation) | `http://your-server-ip:8080` | Set during first login |
| **Temporal UI** (Workflows) | `http://your-server-ip:8233` | No auth by default |
| **Apache Superset** (Analytics) | `http://your-server-ip:8088` | admin / admin123 |
| **Metabase** (Dashboards) | `http://your-server-ip:3000` | Set during first login |
| **Grafana** (Monitoring) | `http://your-server-ip:3001` | admin / admin123 |
| **n8n** (Legacy Workflows) | `http://your-server-ip:5678` | Set during first login |

### 7. Initialize the Databases

The database initialization script runs automatically on first start. To verify:

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U admin -d business_automation

# List tables
\dt

# Exit
\q
```

### 8. Configure Data Sources in BI Tools

#### Apache Superset
1. Access Superset at `http://your-server-ip:8088`
2. Go to Settings > Database Connections
3. Add connections for:
   - PostgreSQL: `postgresql://admin:supersecret@postgres:5432/business_automation`
   - ClickHouse: `clickhouse+http://admin:supersecret@clickhouse:8123/analytics`

#### Metabase
1. Access Metabase at `http://your-server-ip:3000`
2. Follow the setup wizard
3. Connect to PostgreSQL:
   - Host: postgres
   - Port: 5432
   - Database: business_automation
   - Username: admin
   - Password: supersecret

#### Grafana
1. Access Grafana at `http://your-server-ip:3001`
2. Go to Configuration > Data Sources
3. Add data sources for PostgreSQL, ClickHouse, and Redis

### 9. Import Workflows

#### For Activepieces:
1. Access Activepieces at `http://your-server-ip:8080`
2. Create your automation flows using the visual builder
3. Configure connections to your services

#### For n8n (Legacy):
1. Log in to n8n at `http://your-server-ip:5678`
2. Navigate to the Workflows section
3. Import workflow JSON files from the `workflows` directory

## Security Considerations

For production use, implement these security measures:

### 1. Enable HTTPS

Use a reverse proxy like Nginx with Let's Encrypt certificates:

```bash
# Install Nginx and Certbot
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

Example Nginx configuration for all services:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    # NocoBase
    location /nocobase/ {
        proxy_pass http://localhost:13000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Activepieces
    location /automation/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Temporal UI
    location /temporal/ {
        proxy_pass http://localhost:8233/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Superset
    location /superset/ {
        proxy_pass http://localhost:8088/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Metabase
    location /metabase/ {
        proxy_pass http://localhost:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Grafana
    location /grafana/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Firewall Configuration

```bash
# For Ubuntu/Debian with UFW
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# Block direct access to internal services
sudo ufw deny 5678    # n8n
sudo ufw deny 5432    # PostgreSQL
sudo ufw deny 6333    # Qdrant
sudo ufw deny 8123    # ClickHouse
sudo ufw deny 6379    # Redis
sudo ufw deny 9092    # Kafka
sudo ufw deny 7233    # Temporal
```

### 3. Change Default Passwords

Edit `docker-compose.yml` and change all default passwords before deploying to production.

### 4. Regular Backups

Implement automated backups:

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

# Backup PostgreSQL
docker-compose exec -T postgres pg_dumpall -U admin > "$BACKUP_DIR/postgres_backup.sql"

# Backup volumes
docker run --rm -v postgres_data:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/postgres_data.tar.gz /data
docker run --rm -v qdrant_data:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/qdrant_data.tar.gz /data
docker run --rm -v clickhouse_data:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/clickhouse_data.tar.gz /data

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x backup.sh
```

## Troubleshooting

### Common Issues

1. **Service Not Starting**:
   ```bash
   docker-compose logs <service_name>
   ```

2. **Database Connection Issues**:
   ```bash
   docker-compose exec postgres pg_isready -U admin
   ```

3. **Check All Container Status**:
   ```bash
   docker-compose ps
   ```

4. **Restart All Services**:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

5. **View Real-time Logs**:
   ```bash
   docker-compose logs -f
   ```

### Resource Issues

If services are running slowly or crashing, check resource usage:

```bash
docker stats
```

Consider increasing Docker's memory limit or upgrading server resources.

## Next Steps

After installation:

1. [Configure AI Agents](docs/ai-agents.md)
2. [Set up Lead Management](docs/workflows/lead-management.md)
3. [Configure Content Automation](docs/workflows/content-automation.md)
4. [Set up Financial Operations](docs/workflows/finance-automation.md)

For any specific issues, refer to the official documentation:

- [NocoBase Documentation](https://docs.nocobase.com/)
- [Activepieces Documentation](https://www.activepieces.com/docs)
- [Temporal Documentation](https://docs.temporal.io/)
- [Apache Superset Documentation](https://superset.apache.org/docs)
- [Metabase Documentation](https://www.metabase.com/docs/latest/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)