#!/bin/bash

# Setup script for Open Source Business Automation Platform
# Microservices + Event-Driven Architecture
# This script creates the necessary directories, configurations, and template files

set -e

echo "=============================================="
echo "  Open Source Business Automation Platform"
echo "  Microservices + Event-Driven Architecture"
echo "=============================================="
echo ""

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check for Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Docker and Docker Compose found"

echo ""
echo "Creating directory structure..."

# =============================================================================
# Data Directories
# =============================================================================

# API Gateway
mkdir -p data/traefik/acme

# Automation Orchestration
mkdir -p data/activepieces
mkdir -p data/n8n/data

# Event Streaming
mkdir -p data/kafka
mkdir -p data/zookeeper/data
mkdir -p data/zookeeper/log

# Data Storage
mkdir -p data/postgres
mkdir -p data/qdrant
mkdir -p data/clickhouse
mkdir -p data/redis

# Business Intelligence
mkdir -p data/superset
mkdir -p data/metabase
mkdir -p data/grafana

print_status "Data directories created"

# =============================================================================
# Workflow Data Directories (for n8n legacy support)
# =============================================================================
mkdir -p data/n8n/data/invoices
mkdir -p data/n8n/data/content_ideas
mkdir -p data/n8n/data/content_plans
mkdir -p data/n8n/data/content_drafts
mkdir -p data/n8n/data/published_content
mkdir -p data/n8n/data/financial_summaries
mkdir -p data/n8n/data/financial_reports
mkdir -p data/n8n/data/lead_summaries
mkdir -p data/n8n/data/publish_errors

print_status "Workflow data directories created"

# =============================================================================
# Template Files
# =============================================================================

# Create content template file
cat > data/n8n/data/content_template.md << 'EOF'
# {{title}}

## Introduction

{{introduction}}

## Main Points

1. {{point1}}
2. {{point2}}
3. {{point3}}

## Practical Applications

{{applications}}

## Conclusion

{{conclusion}}
EOF

# Create empty data files
echo '[]' > data/n8n/data/invoices.json
echo '[]' > data/n8n/data/hot_leads.json
echo '[]' > data/n8n/data/warm_leads.json
echo '[]' > data/n8n/data/cold_leads.json
echo '[]' > data/n8n/data/content_ideas.json

print_status "Template files created"

# =============================================================================
# Environment File
# =============================================================================

if [ ! -f .env ]; then
    cat > .env << 'EOF'
# Open Source Business Automation Platform
# Environment Configuration

# =============================================================================
# Security Keys - CHANGE THESE IN PRODUCTION!
# =============================================================================

# Activepieces
AP_ENCRYPTION_KEY=change_me_32_char_encryption_key
AP_JWT_SECRET=change_me_jwt_secret_key_here

# n8n
N8N_ENCRYPTION_KEY=change_me_please_use_strong_encryption_key

# Superset
SUPERSET_SECRET_KEY=change_me_superset_secret_key

# =============================================================================
# Database Credentials
# =============================================================================
POSTGRES_USER=automation
POSTGRES_PASSWORD=automation_password

# =============================================================================
# Redis
# =============================================================================
REDIS_PASSWORD=redis_password

# =============================================================================
# ClickHouse
# =============================================================================
CLICKHOUSE_USER=analytics
CLICKHOUSE_PASSWORD=analytics_password

# =============================================================================
# Optional: External Services
# =============================================================================
# OPENAI_API_KEY=your_openai_api_key
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=user@example.com
# SMTP_PASSWORD=your_smtp_password
EOF

    print_status "Environment file created (.env)"
    print_warning "IMPORTANT: Please update the secret keys in .env before production use!"
else
    print_warning ".env file already exists, skipping..."
fi

# =============================================================================
# Set Permissions
# =============================================================================

chmod -R 755 data/n8n/data

# Secure the .env file if it exists
if [ -f .env ]; then
    chmod 600 .env
    print_status ".env file permissions secured (600)"
else
    print_warning ".env file not found, skipping permission change"
fi

print_status "Permissions set"

# =============================================================================
# Summary
# =============================================================================

echo ""
echo "=============================================="
echo "  Setup Complete!"
echo "=============================================="
echo ""
echo "Directory structure and template files created successfully."
echo ""
echo "Available Services:"
echo "-------------------"
echo ""
echo "  API Gateway:"
echo "    • Traefik Dashboard:   http://localhost:8080"
echo ""
echo "  Automation Orchestration:"
echo "    • Activepieces:        http://localhost:8089"
echo "    • Temporal UI:         http://localhost:8087"
echo "    • Kafka UI:            http://localhost:8090"
echo "    • n8n (legacy):        http://localhost:5678"
echo ""
echo "  Business Intelligence:"
echo "    • Apache Superset:     http://localhost:8088"
echo "    • Metabase:            http://localhost:3000"
echo "    • Grafana:             http://localhost:3001"
echo ""
echo "  Data Storage:"
echo "    • PostgreSQL:          localhost:5432"
echo "    • ClickHouse:          localhost:8123"
echo "    • Redis:               localhost:6379"
echo "    • Qdrant:              localhost:6333"
echo "    • Kafka:               localhost:9092"
echo ""
echo "Next Steps:"
echo "-----------"
echo "1. Review and update .env with secure credentials"
echo "2. Run 'docker-compose up -d' to start all services"
echo "3. Wait for services to initialize (2-3 minutes)"
echo "4. Access Activepieces at http://localhost:8089 to set up workflows"
echo "5. Configure data sources in Superset/Metabase/Grafana"
echo ""
echo "For detailed documentation, see docs/architecture.md"
echo ""
