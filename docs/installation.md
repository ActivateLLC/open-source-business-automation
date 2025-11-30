# Installation Guide

This guide provides step-by-step instructions for setting up the Open Source Business Automation Platform on your server.

## Overview

The platform consists of multiple services organized in layers:

1. **API Gateway**: Traefik for routing and load balancing
2. **Automation**: Activepieces + Temporal + Kafka
3. **Data Storage**: PostgreSQL + Qdrant + ClickHouse + Redis
4. **Business Intelligence**: Superset + Metabase + Grafana

## Prerequisites

- A Linux server with at least 8GB RAM and 4 CPU cores (16GB/8 cores recommended for production)
- Docker and Docker Compose installed
- 40GB+ of storage space (SSD recommended)
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

# Install Docker Compose (v2)
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

This script will:
- Create necessary directory structures
- Generate a default `.env` file with configuration
- Set up template files for workflows
- Configure proper permissions

### 4. Configure Environment Variables

Edit the `.env` file to customize your deployment:

```bash
nano .env
```

**Important: Change these values for production:**
- `AP_ENCRYPTION_KEY`: 32-character encryption key for Activepieces
- `AP_JWT_SECRET`: JWT secret for Activepieces authentication
- `N8N_ENCRYPTION_KEY`: Encryption key for n8n
- `SUPERSET_SECRET_KEY`: Secret key for Superset
- Database passwords

### 5. Start the Services

```bash
# Start all services
docker-compose up -d

# View startup logs
docker-compose logs -f
```

**Note:** Initial startup takes 2-5 minutes as services initialize and databases are created.

### 6. Verify Services

Check that all services are running:

```bash
docker-compose ps
```

All services should show as "Up" or "healthy".

## Service Access

### Automation Layer

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| Activepieces | http://localhost:8089 | Create on first access |
| Temporal UI | http://localhost:8087 | None required |
| Kafka UI | http://localhost:8090 | None required |
| n8n (legacy) | http://localhost:5678 | Create on first access |

### Business Intelligence

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| Apache Superset | http://localhost:8088 | admin / admin |
| Metabase | http://localhost:3000 | Create on first access |
| Grafana | http://localhost:3001 | admin / admin |

### Infrastructure

| Service | URL | Purpose |
|---------|-----|---------|
| Traefik Dashboard | http://localhost:8080 | API Gateway monitoring |
| PostgreSQL | localhost:5432 | Transactional database |
| ClickHouse | localhost:8123 | Analytics database |
| Redis | localhost:6379 | Cache |
| Qdrant | localhost:6333 | Vector database |
| Kafka | localhost:9092 | Event streaming |

## Initial Configuration

### 1. Set Up Activepieces

1. Access Activepieces at http://localhost:8089
2. Create an admin account
3. Configure connections to your external services
4. Import or create automation workflows

### 2. Configure Apache Superset

1. Access Superset at http://localhost:8088
2. Log in with admin / admin (change password immediately)
3. Add database connections:
   - PostgreSQL: `postgresql://automation:automation_password@postgres:5432/automation`
   - ClickHouse: `clickhouse://analytics:analytics_password@clickhouse:8123/analytics`

### 3. Set Up Metabase

1. Access Metabase at http://localhost:3000
2. Follow the setup wizard
3. Connect to PostgreSQL:
   - Host: postgres
   - Port: 5432
   - Database: automation
   - Username: automation
   - Password: automation_password

### 4. Configure Grafana

1. Access Grafana at http://localhost:3001
2. Log in with admin / admin
3. Data sources are pre-configured via provisioning
4. Create dashboards for system monitoring

### 5. Import Legacy n8n Workflows

If migrating from a previous n8n setup:

1. Access n8n at http://localhost:5678
2. Navigate to Workflows > Import From File
3. Import workflows from the `workflows` directory

## Production Deployment

### Enable HTTPS with Traefik

1. Update `config/traefik/traefik.yml`:

```yaml
entryPoints:
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com
      storage: /acme/acme.json
      httpChallenge:
        entryPoint: web
```

2. Update service labels in `docker-compose.yml` for HTTPS routing.

### Security Hardening

1. **Change all default passwords** in `.env`
2. **Enable authentication** for all services
3. **Configure firewall** rules:

```bash
# Allow only necessary ports
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

4. **Set up regular backups**:

```bash
# Create backup script
./scripts/backup.sh
```

### Resource Allocation

For production, consider increasing resources in `docker-compose.yml`:

```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

## Troubleshooting

### Common Issues

#### Services Not Starting

```bash
# Check logs for specific service
docker-compose logs <service-name>

# Restart specific service
docker-compose restart <service-name>

# Recreate service
docker-compose up -d --force-recreate <service-name>
```

#### Database Connection Issues

```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready

# Check PostgreSQL logs
docker-compose logs postgres
```

#### Kafka Issues

```bash
# Check Kafka broker status
docker-compose exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# Check Kafka logs
docker-compose logs kafka
```

#### Out of Memory

```bash
# Check Docker resource usage
docker stats

# Increase Docker memory limits
# Edit /etc/docker/daemon.json
```

### Health Checks

```bash
# All services status
docker-compose ps

# Individual service health
docker-compose exec postgres pg_isready
docker-compose exec redis redis-cli -a redis_password ping
curl -s http://localhost:6333/health  # Qdrant
curl -s http://localhost:8123/ping    # ClickHouse
```

## Additional Resources

- [Architecture Documentation](architecture.md)
- [Security Considerations](security.md)
- [Maintenance Guide](maintenance.md)
- [Workflow Documentation](workflows/README.md)

### External Documentation

- [Activepieces Docs](https://www.activepieces.com/docs)
- [Temporal Docs](https://docs.temporal.io/)
- [Apache Kafka Docs](https://kafka.apache.org/documentation/)
- [Apache Superset Docs](https://superset.apache.org/docs/)
- [Metabase Docs](https://www.metabase.com/docs/)
- [Grafana Docs](https://grafana.com/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [ClickHouse Docs](https://clickhouse.com/docs/)
- [Qdrant Docs](https://qdrant.tech/documentation/)
- [Redis Docs](https://redis.io/docs/)