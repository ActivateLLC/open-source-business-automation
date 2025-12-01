#!/bin/bash

# Setup script for Open Source Business Automation Stack
# Enhanced with NocoBase, Kafka, Ollama AI, and complete platform setup
# This script creates the necessary directories and template files

set -e

echo "=============================================="
echo "Open Source Business Automation Stack Setup"
echo "=============================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[✗] Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi
print_status "Docker found"

# Check for Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}[✗] Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi
print_status "Docker Compose found"

echo ""
echo "Creating directory structure..."

# Create base directories
mkdir -p data/n8n/data
mkdir -p data/postgres
mkdir -p data/metabase
mkdir -p data/nocobase/storage
mkdir -p data/kafka
mkdir -p data/zookeeper/data
mkdir -p data/zookeeper/log
mkdir -p data/ollama
mkdir -p data/redis
mkdir -p logs/n8n
mkdir -p logs/postgres

print_status "Base directories created"

# Create workflow data directories
mkdir -p data/n8n/data/invoices
mkdir -p data/n8n/data/content_ideas
mkdir -p data/n8n/data/content_plans
mkdir -p data/n8n/data/content_drafts
mkdir -p data/n8n/data/published_content
mkdir -p data/n8n/data/financial_summaries
mkdir -p data/n8n/data/financial_reports
mkdir -p data/n8n/data/lead_summaries
mkdir -p data/n8n/data/publish_errors
mkdir -p data/n8n/data/ai_responses

print_status "Workflow data directories created"

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

---
*This content was generated using AI assistance.*
EOF

print_status "Content template created"

# Create empty JSON databases for legacy compatibility
cat > data/n8n/data/invoices.json << 'EOF'
[]
EOF

cat > data/n8n/data/hot_leads.json << 'EOF'
[]
EOF

cat > data/n8n/data/warm_leads.json << 'EOF'
[]
EOF

cat > data/n8n/data/cold_leads.json << 'EOF'
[]
EOF

cat > data/n8n/data/content_ideas.json << 'EOF'
[]
EOF

print_status "Legacy JSON files created"

# Create environment file template
cat > .env.example << 'EOF'
# Open Source Business Automation Stack - Environment Configuration
# Copy this file to .env and update the values

# PostgreSQL Configuration
POSTGRES_USER=n8n
POSTGRES_PASSWORD=change_this_to_strong_password
POSTGRES_DB=n8n

# n8n Configuration
N8N_ENCRYPTION_KEY=change_this_to_strong_encryption_key
N8N_BASIC_AUTH_ACTIVE=false
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=change_this_password

# NocoBase Configuration
NOCOBASE_APP_KEY=change_this_to_strong_app_key
NOCOBASE_ADMIN_EMAIL=admin@example.com
NOCOBASE_ADMIN_PASSWORD=change_this_password

# Kafka Configuration
KAFKA_BROKER=kafka:9092

# Ollama Configuration (AI/LLM)
OLLAMA_HOST=http://ollama:11434
OLLAMA_MODEL=llama2

# Webhook URLs (customize for your integrations)
NOTIFICATION_WEBHOOK_URL=https://hooks.example.org/notifications
CRM_WEBHOOK_URL=https://hooks.example.org/crm
ACCOUNTING_WEBHOOK_URL=https://hooks.example.org/accounting
EOF

if [ ! -f .env ]; then
    cp .env.example .env
    print_warning ".env file created from template - please update with your settings"
else
    print_info ".env file already exists - skipping"
fi

# Set proper permissions
chmod -R 755 data/n8n/data
chmod -R 755 data/nocobase
chmod 600 .env 2>/dev/null || true

print_status "Permissions set"

echo ""
echo "=============================================="
echo "Setup Complete!"
echo "=============================================="
echo ""
echo "Platform Components:"
echo "  - Explore UI (Traditional Interface): http://localhost:8000"
echo "  - NocoBase (Low-Code Admin): http://localhost:13000"
echo "  - n8n (Workflow Automation): http://localhost:5678"
echo "  - Metabase (BI Dashboards): http://localhost:3000"
echo "  - Kafka UI (Event Logs): http://localhost:8080"
echo "  - Ollama (AI/LLM): http://localhost:11434"
echo ""
echo "Next Steps:"
echo "  1. Review and update the .env file with your settings"
echo "  2. Run 'docker-compose up -d' to start all services"
echo "  3. Wait 2-3 minutes for services to initialize"
echo "  4. Access Explore UI at http://localhost:8000 for traditional navigation"
echo "  5. Import the n8n workflows from the 'workflows' directory"
echo ""
echo "Explore UI Features:"
echo "  - Toggle between Explore mode (tabs) and AI Assistant mode"
echo "  - Browse Leads, Customers, Invoices, and Content with filters"
echo "  - Click any item to view details in a modal"
echo "  - Use natural language to query your business data"
echo ""
echo "Available Workflows:"
echo "  - n8n-ai-lead-processing.json (AI-powered lead scoring)"
echo "  - n8n-ai-content-distribution.json (AI content generation)"
echo "  - n8n-automated-invoicing.json (Invoice & payment tracking)"
echo "  - n8n-ai-assistant.json (AI Q&A about leads/customers)"
echo "  - n8n-kafka-audit-trail.json (Complete event audit trail)"
echo ""
echo "For GPU-accelerated AI (optional):"
echo "  - Install NVIDIA Container Toolkit"
echo "  - Run: docker exec -it open-source-business-automation_ollama_1 ollama pull llama2"
echo ""
print_info "For detailed documentation, see docs/installation.md"
