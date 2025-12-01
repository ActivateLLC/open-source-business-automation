# Open Source Business Automation Stack

Enterprise-grade business automation using 100% free and open-source tools - no license fees, no vendor lock-in.

![Business Automation Banner](https://raw.githubusercontent.com/ActivateLLC/open-source-business-automation/main/docs/images/banner.png)

## Overview

This repository provides a comprehensive business automation solution that combines powerful open-source tools to streamline critical business processes:

- **🎨 Generative UI Dashboard**: AI-powered interactive dashboard with natural language commands - create charts, get insights, and explore data without clicking through menus
- **🔌 MCP Server Integration**: Model Context Protocol servers connecting all components for seamless AI-driven interactions
- **Unified Platform**: NocoBase low-code frontend for all business operations
- **Lead Management**: AI-powered lead scoring, routing, and nurturing system
- **Content Creation**: AI-assisted content planning, generation, and automatic distribution
- **Financial Operations**: Automated invoice processing, payment tracking, and financial reporting
- **AI Assistant**: Natural language interface for querying business data
- **Complete Audit Trail**: Kafka-based event logging for full traceability

By implementing this stack, you can achieve enterprise-level automation without the enterprise-level price tag.

## Key Benefits

- **Zero License Costs**: Built entirely with free and open-source software
- **Complete Data Ownership**: All data remains on your infrastructure
- **AI-Powered Intelligence**: Local AI/LLM integration via Ollama
- **Generative UI**: Natural language commands to instantly create visualizations and insights
- **MCP Integration**: Model Context Protocol servers for seamless tool interconnection
- **Real-Time Dashboards**: Comprehensive business intelligence with Metabase
- **Event-Driven Architecture**: Kafka-based audit trail and event processing
- **Unlimited Customization**: Modify any aspect to fit your specific business needs
- **Scalable Architecture**: Start small and expand as your business grows
- **No Vendor Lock-in**: Avoid dependency on proprietary SaaS platforms

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Generative UI (AI-Powered Dashboard)                     │
│                           http://localhost:4000                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  "Show me a lead pipeline chart" → Instant visualization           │    │
│  │  "What are today's insights?" → AI-generated business insights     │    │
│  │  "How is revenue trending?" → Dynamic charts on demand             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
          ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
          │   Database MCP  │ │   Ollama MCP    │ │   Kafka MCP     │
          │   (PostgreSQL)  │ │   (AI/LLM)      │ │   (Events)      │
          └─────────────────┘ └─────────────────┘ └─────────────────┘
                    │                 │                 │
                    └─────────────────┼─────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NocoBase (Admin Frontend)                          │
│                         http://localhost:13000                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        n8n (Workflow Automation Engine)                      │
│                           http://localhost:5678                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ AI Lead     │ │ AI Content  │ │ Automated   │ │ AI Business │           │
│  │ Processing  │ │ Distribution│ │ Invoicing   │ │ Assistant   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
         │                   │                   │                   │
         ▼                   ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Apache Kafka   │ │   PostgreSQL    │ │     Ollama      │ │     Redis       │
│  (Event Stream) │ │   (Database)    │ │    (AI/LLM)     │ │   (Cache)       │
│  :9092, :29092  │ │     :5432       │ │     :11434      │ │     :6379       │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Metabase (Real-Time Dashboards & BI)                    │
│                           http://localhost:3000                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Core Components

| Component | Purpose | Port | License |
|-----------|---------|------|---------|
| **Generative UI** | AI-powered interactive dashboard with natural language commands | 4000 | MIT |
| [NocoBase](https://www.nocobase.com/) | Unified low-code admin platform | 13000 | AGPL-3.0 |
| [n8n](https://n8n.io/) | Workflow automation engine | 5678 | Fair-code |
| [PostgreSQL](https://www.postgresql.org/) | Primary database | 5432 | PostgreSQL |
| [Apache Kafka](https://kafka.apache.org/) | Event streaming & audit trail | 9092 | Apache 2.0 |
| [Ollama](https://ollama.ai/) | Local AI/LLM for scoring & content | 11434 | MIT |
| [Metabase](https://www.metabase.com/) | Business intelligence & dashboards | 3000 | AGPL |
| [Redis](https://redis.io/) | Caching & real-time updates | 6379 | BSD |
| [Kafka UI](https://github.com/provectus/kafka-ui) | Kafka management interface | 8080 | Apache 2.0 |

## Features

### ✨ Generative UI Dashboard (NEW)
The Generative UI is an AI-powered interactive dashboard that lets you explore your business data through natural language:

- **Natural Language Commands**: Just type what you want to see
  - "Show me a lead pipeline chart"
  - "What are today's key insights?"
  - "How is revenue trending this month?"
  - "Create a customer segment breakdown"
  
- **Dynamic Chart Generation**: Charts are created on-demand based on your requests
  - Bar, line, pie, doughnut, and area charts
  - Automatically styled and formatted
  - Real-time data from your business systems
  
- **AI-Powered Insights**: Get intelligent analysis without manual data exploration
  - Hot lead alerts
  - Revenue trends and forecasts
  - Customer behavior patterns
  - Content performance analysis
  
- **MCP Server Integration**: Seamlessly connected to all your data sources
  - Database MCP for PostgreSQL queries
  - Ollama MCP for AI-powered analysis
  - Kafka MCP for event stream processing
  - n8n MCP for workflow automation

### 🔌 MCP (Model Context Protocol) Servers
MCP servers provide a standardized way for AI systems to interact with your business tools:

| MCP Server | Purpose | Tools |
|------------|---------|-------|
| Database MCP | Query PostgreSQL | get_leads, get_customers, get_invoices, get_metrics |
| Ollama MCP | AI Analysis | generate_insight, analyze_leads, score_lead, generate_content |
| Kafka MCP | Event Streaming | get_recent_events, publish_event |
| n8n MCP | Workflow Automation | trigger_workflow, get_workflow_status |

### 🎯 AI-Powered Lead Processing
- Automatic lead capture via webhook
- Rule-based and AI-powered lead scoring
- Intelligent routing to sales/marketing teams
- Real-time notifications for hot leads
- Complete lead lifecycle tracking

### 📝 AI Content Generation & Distribution
- Automated content topic generation
- AI-powered article/blog writing via Ollama
- Multi-platform distribution (blog, LinkedIn, Twitter)
- Scheduled publishing and tracking
- Content performance analytics

### 💰 Automated Invoicing
- Invoice capture and processing
- Payment tracking and reconciliation
- Overdue invoice alerts
- Daily and monthly financial reports
- Complete payment audit trail

### 🤖 AI Business Assistant
- Natural language queries about business data
- Context-aware responses using real database data
- Answers questions about leads, customers, invoices
- Conversation history tracking
- Integration with all business entities

### 📊 Real-Time Dashboards
- Lead pipeline visualization
- Financial metrics and trends
- Content performance tracking
- Activity monitoring
- Custom dashboard creation

### 📋 Complete Audit Trail
- Kafka-based event streaming
- All actions logged and traceable
- Event replay capability
- Compliance-ready audit logs
- Real-time event processing

## Documentation

- [Installation Guide](docs/installation.md): Complete setup instructions
- [Workflow Documentation](docs/workflows/README.md): Detailed explanation of each workflow
- [Security Considerations](docs/security.md): Best practices for secure deployment
- [Maintenance Guide](docs/maintenance.md): Ongoing operations and troubleshooting

## Quick Start

```bash
# Clone this repository
git clone https://github.com/ActivateLLC/open-source-business-automation.git
cd open-source-business-automation

# Run setup script
chmod +x setup.sh
./setup.sh

# Start all services
docker-compose up -d

# Wait for services to initialize (2-3 minutes)
sleep 180

# Optional: Pull AI model for Ollama
docker exec -it open-source-business-automation_ollama_1 ollama pull llama2

# Access the platforms
# Generative UI: http://localhost:4000 (AI-powered dashboard)
# NocoBase: http://localhost:13000 (Admin)
# n8n: http://localhost:5678 (Workflows)
# Metabase: http://localhost:3000 (BI)
# Kafka UI: http://localhost:8080 (Events)
```

### Try the Generative UI

Once running, visit `http://localhost:4000` and try these commands:

- **"Show me a lead pipeline chart"** - Instantly creates a visualization
- **"Give me today's key insights"** - AI-generated business insights
- **"How is revenue trending?"** - Revenue analysis with charts
- **"What needs my attention?"** - Priority alerts and actions

See the [Installation Guide](docs/installation.md) for complete setup instructions.

## System Requirements

### Minimum
- Linux server with 8GB RAM, 4 CPU cores
- 50GB+ storage space
- Docker and Docker Compose
- Internet connectivity

### Recommended (with AI features)
- Linux server with 16GB RAM, 8 CPU cores
- NVIDIA GPU with 8GB+ VRAM (for accelerated AI)
- 100GB+ SSD storage
- Docker with NVIDIA Container Toolkit

## Workflow Files

| Workflow | Description |
|----------|-------------|
| `n8n-ai-lead-processing.json` | AI-powered lead scoring and routing |
| `n8n-ai-content-distribution.json` | AI content generation and auto-distribution |
| `n8n-automated-invoicing.json` | Invoice processing and payment tracking |
| `n8n-ai-assistant.json` | AI business assistant for Q&A |
| `n8n-kafka-audit-trail.json` | Kafka event consumer for audit trail |
| `n8n-free-lead-management.json` | Legacy lead management (file-based) |

## API Endpoints

Once running, the following webhook endpoints are available:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/webhook/lead-capture` | POST | Submit new leads for AI scoring |
| `/webhook/content-request` | POST | Request AI content generation |
| `/webhook/invoice-webhook` | POST | Submit invoices for processing |
| `/webhook/payment-webhook` | POST | Record payments |
| `/webhook/ai-assistant` | POST | Query the AI assistant |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is released under the [MIT License](LICENSE).