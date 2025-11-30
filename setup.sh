#!/bin/bash

# Setup script for Open Source Business Automation Stack
# This script creates the necessary directories and template files

set -e

echo "=============================================="
echo "Open Source Business Automation Stack Setup"
echo "=============================================="
echo ""

# Create base directories
echo "Creating directory structure..."
mkdir -p data/n8n/data
mkdir -p data/postgres
mkdir -p data/nocobase
mkdir -p data/activepieces
mkdir -p data/temporal
mkdir -p data/qdrant
mkdir -p data/clickhouse
mkdir -p data/redis
mkdir -p data/superset
mkdir -p data/metabase
mkdir -p data/grafana
mkdir -p data/kafka
mkdir -p backups

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

# Create AI agent directories
mkdir -p data/ai_agents/knowledge_base
mkdir -p data/ai_agents/embeddings
mkdir -p data/ai_agents/logs

# Create content template file
echo "Creating template files..."
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

# Create empty invoice database
cat > data/n8n/data/invoices.json << 'EOF'
[]
EOF

# Create empty leads database
cat > data/n8n/data/hot_leads.json << 'EOF'
[]
EOF

cat > data/n8n/data/warm_leads.json << 'EOF'
[]
EOF

cat > data/n8n/data/cold_leads.json << 'EOF'
[]
EOF

# Create empty content ideas database
cat > data/n8n/data/content_ideas.json << 'EOF'
[]
EOF

# Create AI agent configuration template
cat > data/ai_agents/config.yaml << 'EOF'
# AI Agents Configuration
# Update these settings for your deployment

agents:
  sales:
    enabled: true
    llm:
      provider: openai
      model: gpt-4
      temperature: 0.7
    knowledge_sources:
      - product_catalog
      - pricing_info
      - faq
  
  content:
    enabled: true
    llm:
      provider: openai
      model: gpt-4
      temperature: 0.9
    knowledge_sources:
      - brand_guidelines
      - content_templates
      - seo_keywords
  
  finance:
    enabled: true
    llm:
      provider: openai
      model: gpt-4
      temperature: 0.3
    knowledge_sources:
      - financial_policies
      - transaction_history
      - vendor_info
  
  operations:
    enabled: true
    llm:
      provider: openai
      model: gpt-4
      temperature: 0.2
    knowledge_sources:
      - system_metrics
      - incident_history
      - runbooks

qdrant:
  host: qdrant
  port: 6333
  collections:
    - name: knowledge_base
      vector_size: 1536
    - name: leads
      vector_size: 1536
    - name: content
      vector_size: 1536

# Set your API keys as environment variables:
# OPENAI_API_KEY=your_key
# ANTHROPIC_API_KEY=your_key
EOF

# Create sample knowledge base entries
cat > data/ai_agents/knowledge_base/sample_entries.json << 'EOF'
[
  {
    "category": "product",
    "title": "Product Overview",
    "content": "Our platform provides comprehensive business automation including lead management, content automation, and financial operations."
  },
  {
    "category": "faq",
    "title": "How to get started",
    "content": "Getting started is easy! Simply sign up for an account, complete the onboarding wizard, and import your existing data."
  },
  {
    "category": "support",
    "title": "Contact Support",
    "content": "For technical support, email support@example.com or use the in-app chat feature."
  }
]
EOF

# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
# Backup script for Open Source Business Automation Stack

set -e

BACKUP_DIR="backups/$(date +%Y-%m-%d_%H-%M-%S)"
mkdir -p "$BACKUP_DIR"
LOG_FILE="$BACKUP_DIR/backup.log"

echo "Starting backup to $BACKUP_DIR..." | tee "$LOG_FILE"

# Backup PostgreSQL
echo "Backing up PostgreSQL..." | tee -a "$LOG_FILE"
if docker-compose exec -T postgres pg_dumpall -U admin > "$BACKUP_DIR/postgres_backup.sql" 2>> "$LOG_FILE"; then
    echo "PostgreSQL backup successful" | tee -a "$LOG_FILE"
else
    echo "WARNING: PostgreSQL backup failed - service may not be running" | tee -a "$LOG_FILE"
fi

# Backup configuration files
echo "Backing up configuration files..." | tee -a "$LOG_FILE"
cp docker-compose.yml "$BACKUP_DIR/" 2>> "$LOG_FILE" || true
cp data/ai_agents/config.yaml "$BACKUP_DIR/" 2>> "$LOG_FILE" || true

# Backup data directories (compressed)
echo "Backing up data directories..." | tee -a "$LOG_FILE"
tar -czf "$BACKUP_DIR/n8n_data.tar.gz" data/n8n/data 2>> "$LOG_FILE" || echo "n8n data backup skipped" | tee -a "$LOG_FILE"
tar -czf "$BACKUP_DIR/ai_agents.tar.gz" data/ai_agents 2>> "$LOG_FILE" || echo "AI agents data backup skipped" | tee -a "$LOG_FILE"

echo "Backup completed: $BACKUP_DIR" | tee -a "$LOG_FILE"
echo "Backup log saved to: $LOG_FILE"
ls -la "$BACKUP_DIR"
EOF
chmod +x backup.sh

# Create restore script
cat > restore.sh << 'EOF'
#!/bin/bash
# Restore script for Open Source Business Automation Stack

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_directory>"
    echo "Example: ./restore.sh backups/2024-01-15_10-30-00"
    exit 1
fi

BACKUP_DIR="$1"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "Error: Backup directory not found: $BACKUP_DIR"
    exit 1
fi

echo "Restoring from $BACKUP_DIR..."

# Stop services
docker-compose down

# Restore PostgreSQL
if [ -f "$BACKUP_DIR/postgres_backup.sql" ]; then
    echo "Restoring PostgreSQL..."
    docker-compose up -d postgres
    sleep 10
    docker-compose exec -T postgres psql -U admin < "$BACKUP_DIR/postgres_backup.sql"
fi

# Restore data directories
if [ -f "$BACKUP_DIR/n8n_data.tar.gz" ]; then
    echo "Restoring n8n data..."
    rm -rf data/n8n/data
    tar -xzf "$BACKUP_DIR/n8n_data.tar.gz"
fi

if [ -f "$BACKUP_DIR/ai_agents.tar.gz" ]; then
    echo "Restoring AI agents data..."
    rm -rf data/ai_agents
    tar -xzf "$BACKUP_DIR/ai_agents.tar.gz"
fi

# Start all services
docker-compose up -d

echo "Restore completed!"
EOF
chmod +x restore.sh

# Set permissions
chmod -R 755 data/n8n/data
chmod -R 755 data/ai_agents

echo ""
echo "=============================================="
echo "Setup completed successfully!"
echo "=============================================="
echo ""
echo "Directory structure and template files created."
echo ""
echo "Next steps:"
echo "1. Edit docker-compose.yml to configure passwords and settings"
echo "2. Run 'docker-compose pull' to download images"
echo "3. Run 'docker-compose up -d' to start the automation stack"
echo ""
echo "Access the platforms at:"
echo "  NocoBase (Main UI):     http://localhost:13000"
echo "  Activepieces:           http://localhost:8080"
echo "  Temporal UI:            http://localhost:8233"
echo "  Apache Superset:        http://localhost:8088"
echo "  Metabase:               http://localhost:3000"
echo "  Grafana:                http://localhost:3001"
echo "  n8n (Legacy):           http://localhost:5678"
echo ""
echo "For more information, see the documentation:"
echo "  docs/installation.md  - Installation guide"
echo "  docs/architecture.md  - Architecture overview"
echo "  docs/ai-agents.md     - AI agents configuration"
echo ""
