# Installation Guide

This guide provides step-by-step instructions for setting up the Open Source Business Automation Stack on your server.

## Prerequisites

- A Linux server with at least 8GB RAM and 4 CPU cores (16GB RAM recommended for AI features)
- Docker and Docker Compose installed
- 50GB+ of storage space (SSD recommended)
- Internet connectivity for the server
- Basic command line knowledge
- Optional: NVIDIA GPU with 8GB+ VRAM for accelerated AI

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
sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
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

This script will create the necessary directory structure, template files, and environment configuration.

### 4. Configure the Environment

1. Edit the `.env` file to change default passwords and settings:

```bash
nano .env
```

2. Update the following critical settings:
   - `POSTGRES_PASSWORD` - Strong database password
   - `N8N_ENCRYPTION_KEY` - Strong encryption key for n8n
   - `NOCOBASE_APP_KEY` - Strong app key for NocoBase
   - `NOCOBASE_ADMIN_PASSWORD` - Admin password for NocoBase

### 5. Start the Services

```bash
docker-compose up -d
```

This will start all platform components:
- NocoBase (Unified Frontend)
- n8n (Workflow Automation)
- PostgreSQL (Database)
- Apache Kafka & Zookeeper (Event Streaming)
- Kafka UI (Kafka Management)
- Metabase (Dashboards)
- Ollama (AI/LLM)
- Redis (Caching)

### 6. Wait for Initialization

The services need 2-3 minutes to fully initialize. You can monitor the startup:

```bash
docker-compose logs -f
```

### 7. Access the Platforms

| Platform | URL | Purpose |
|----------|-----|---------|
| NocoBase | http://your-server-ip:13000 | Unified frontend & admin |
| n8n | http://your-server-ip:5678 | Workflow automation |
| Metabase | http://your-server-ip:3000 | Dashboards & BI |
| Kafka UI | http://your-server-ip:8080 | Event log viewer |

### 8. Set Up AI Model (Optional but Recommended)

To enable AI-powered features (lead scoring, content generation, AI assistant):

```bash
# Pull the Llama2 model (about 4GB download)
docker exec -it open-source-business-automation_ollama_1 ollama pull llama2
```

For GPU acceleration (NVIDIA), ensure you have the NVIDIA Container Toolkit installed:

```bash
# Install NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker
```

### 9. Import the Workflows

1. Log in to n8n at `http://your-server-ip:5678`

2. Navigate to the Workflows section

3. For each workflow JSON file in the `workflows` directory:
   - Click "Import from File"
   - Select the workflow JSON file
   - Click "Import"
   - Save the workflow

4. Import these workflows:
   - `n8n-ai-lead-processing.json` - AI lead scoring and routing
   - `n8n-ai-content-distribution.json` - AI content generation
   - `n8n-automated-invoicing.json` - Invoice and payment tracking
   - `n8n-ai-assistant.json` - AI business assistant
   - `n8n-kafka-audit-trail.json` - Kafka event consumer

5. Configure credentials in n8n:
   - PostgreSQL connection
   - Kafka connection

### 10. Set Up NocoBase

1. Access NocoBase at `http://your-server-ip:13000`

2. Log in with the admin credentials from your `.env` file

3. Create collections for:
   - Leads
   - Customers
   - Invoices
   - Content

4. Configure the dashboard views

### 11. Set Up Metabase Dashboards

1. Access Metabase in your browser at `http://your-server-ip:3000`

2. Follow the setup wizard to create your admin account

3. When prompted for database connection, choose PostgreSQL:
   - Host: postgres
   - Port: 5432
   - Database: n8n
   - Username: n8n
   - Password: (your configured password)

4. Create dashboards using the pre-defined views:
   - `v_lead_pipeline` - Lead pipeline metrics
   - `v_invoice_summary` - Financial overview
   - `v_content_performance` - Content analytics
   - `v_daily_activity` - Activity audit

## Security Considerations

For production use, implement these security measures:

### Enable HTTPS

Use a reverse proxy like Nginx with Let's Encrypt certificates:

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Example Nginx configuration:

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

    # NocoBase
    location / {
        proxy_pass http://localhost:13000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # n8n
    location /n8n/ {
        proxy_pass http://localhost:5678/;
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
}
```

### Enable n8n Authentication

Add these environment variables to `docker-compose.yml`:

```yaml
n8n:
  environment:
    - N8N_BASIC_AUTH_ACTIVE=true
    - N8N_BASIC_AUTH_USER=admin
    - N8N_BASIC_AUTH_PASSWORD=use_a_strong_password_here
```

### Firewall Configuration

```bash
# For Ubuntu/Debian with UFW
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw deny 5678    # Block direct n8n access
sudo ufw deny 5432    # Block direct PostgreSQL access
sudo ufw deny 9092    # Block direct Kafka access
sudo ufw enable
```

## Troubleshooting

### Common Issues

1. **Services Not Starting**:
   - Check logs: `docker-compose logs <service_name>`
   - Verify port availability: `netstat -tulpn | grep <port>`
   - Check disk space: `df -h`

2. **Kafka Connection Issues**:
   - Ensure Zookeeper is running: `docker-compose logs zookeeper`
   - Check Kafka logs: `docker-compose logs kafka`
   - Verify network connectivity between containers

3. **AI Features Not Working**:
   - Verify Ollama is running: `docker-compose logs ollama`
   - Check if model is downloaded: `docker exec -it <ollama_container> ollama list`
   - Check GPU availability: `nvidia-smi`

4. **Database Connection Problems**:
   - Check PostgreSQL logs: `docker-compose logs postgres`
   - Verify credentials match across services
   - Test connection: `docker-compose exec postgres psql -U n8n`

5. **Webhook Not Responding**:
   - Verify n8n workflow is active
   - Check n8n logs for errors
   - Test endpoint: `curl -X POST http://localhost:5678/webhook/lead-capture -H "Content-Type: application/json" -d '{"test": true}'`

### Reset and Restart

To reset all services:

```bash
# Stop all services
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Restart fresh
./setup.sh
docker-compose up -d
```

## Additional Resources

- [n8n Documentation](https://docs.n8n.io/)
- [NocoBase Documentation](https://docs.nocobase.com/)
- [Metabase Documentation](https://www.metabase.com/docs/latest/)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Ollama Documentation](https://github.com/ollama/ollama)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)