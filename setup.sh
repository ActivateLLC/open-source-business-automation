#!/bin/bash

# Setup script for Open Source Business Automation Stack
# This script creates the necessary directories and template files

echo "Setting up Open Source Business Automation Stack..."

# Detect which stack to set up
STACK_TYPE="${1:-poc}"

echo "Setting up $STACK_TYPE stack..."

# Create base directories
mkdir -p data/n8n/data
mkdir -p data/postgres
mkdir -p data/metabase

# POC Stack directories
if [ "$STACK_TYPE" = "poc" ]; then
    echo "Creating POC stack directories..."
    mkdir -p data/activepieces
    mkdir -p data/windmill
fi

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

# Set permissions
chmod -R 755 data/n8n/data

# Create .env file from example if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "Creating .env file from .env.example..."
        cp .env.example .env
        echo "Please update the .env file with secure passwords before starting the stack."
    fi
fi

echo ""
echo "Directory structure and template files created successfully."
echo ""
echo "Next steps:"

if [ "$STACK_TYPE" = "poc" ]; then
    echo "1. Update the .env file with secure passwords"
    echo "2. Run 'docker-compose -f docker-compose-poc.yml up -d' to start the POC stack"
    echo "3. Access the platforms:"
    echo "   - Activepieces (Lead Management): http://localhost:8080"
    echo "   - Windmill (Content Creation): http://localhost:8000"
    echo "   - n8n (Financial Operations): http://localhost:5678"
    echo "   - Metabase (Analytics): http://localhost:3000"
    echo "4. Import the workflows from the 'workflows/' directory"
else
    echo "1. Run 'docker-compose up -d' to start the automation stack"
    echo "2. Access n8n at http://localhost:5678"
    echo "3. Access Metabase at http://localhost:3000"
    echo "4. Import the n8n workflows from the 'workflows/n8n' directory"
fi
