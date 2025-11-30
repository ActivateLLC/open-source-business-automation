# Open Source Business Automation Stack

Enterprise-grade business automation using 100% free and open-source tools - no license fees, no vendor lock-in. Built to outperform traditional ERP/CRM solutions like Odoo with native AI integration, microservices architecture, and cutting-edge 2025 technology stack.

![Business Automation Banner](https://raw.githubusercontent.com/ActivateLLC/open-source-business-automation/main/docs/images/banner.png)

## Overview

This repository provides a comprehensive, AI-powered business automation platform that combines powerful open-source tools to streamline critical business processes:

- **Lead Management**: AI-powered lead scoring using vector embeddings, intelligent routing, predictive analytics, and automated enrichment
- **Content & Marketing Automation**: AI content generation, SEO optimization, multi-channel distribution, and personalization at scale
- **Financial Operations**: Intelligent invoice processing with OCR, automated reconciliation, predictive cash flow, and fraud detection
- **AI Agent Layer**: Multi-agent system with Sales, Content, Finance, and Operations agents

By implementing this stack, you can achieve enterprise-level automation with AI capabilities without the enterprise-level price tag.

## Key Benefits

- **Zero License Costs**: Built entirely with free and open-source software
- **Complete Data Ownership**: All data remains on your infrastructure
- **Unlimited Customization**: Modify any aspect to fit your specific business needs
- **Scalable Architecture**: Microservices architecture for horizontal, elastic scaling
- **No Vendor Lock-in**: Avoid dependency on proprietary SaaS platforms
- **Native AI Integration**: Multi-agent system with RAG, ML, and real-time predictions
- **Event-Driven Architecture**: Real-time event streaming with Apache Kafka
- **Modern Developer Experience**: Modern APIs, composable services, no XML hell

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND / PLATFORM UI                                 │
│                                  NocoBase                                        │
│              (Unified Business Platform with AI Employee Feature)                │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           WORKFLOW AUTOMATION CORE                               │
├─────────────────────┬─────────────────────┬─────────────────────────────────────┤
│     Activepieces    │      Temporal       │              Kafka                  │
│ (Primary Automation)│ (Complex Workflows) │          (Event Bus)                │
│   280+ MCP servers  │  Fault-tolerant     │    Real-time streaming              │
└─────────────────────┴─────────────────────┴─────────────────────────────────────┘
                                       │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AI AGENT LAYER                                      │
│    ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────┐              │
│    │Sales Agent│  │Content    │  │Finance    │  │Operations     │              │
│    │           │  │Agent      │  │Agent      │  │Agent          │              │
│    └───────────┘  └───────────┘  └───────────┘  └───────────────┘              │
│                    LangChain + AutoGen + OpenAI/Claude API                       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                DATA LAYER                                        │
├────────────────┬────────────────┬────────────────┬──────────────────────────────┤
│   PostgreSQL   │     Qdrant     │   ClickHouse   │           Redis              │
│  (Primary DB)  │ (Vector DB/AI) │  (Analytics)   │     (Cache & Queue)          │
│ ACID Compliant │Semantic Search │ Real-time OLAP │   Session Management         │
└────────────────┴────────────────┴────────────────┴──────────────────────────────┘
                                       │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         BUSINESS INTELLIGENCE LAYER                              │
├────────────────────────┬────────────────────────┬───────────────────────────────┤
│    Apache Superset     │       Metabase         │           Grafana             │
│    (Primary BI)        │  (Simple Dashboards)   │   (Operational Monitoring)    │
│ 40+ visualization types│  Question-based UI     │      Real-time alerts         │
└────────────────────────┴────────────────────────┴───────────────────────────────┘
```

## Core Components

### 1. Frontend / Platform UI
- **[NocoBase](https://www.nocobase.com/)**: Self-hosted no-code development platform with AI Employee feature

### 2. Workflow Automation Core
- **[Activepieces](https://www.activepieces.com/)**: Primary automation engine with 280+ MCP servers for AI agents
- **[Temporal](https://temporal.io/)**: Long-running, fault-tolerant workflow orchestration
- **[Apache Kafka](https://kafka.apache.org/)**: Real-time event streaming and microservices communication

### 3. Data Layer
- **[PostgreSQL](https://www.postgresql.org/)**: Primary transactional database
- **[Qdrant](https://qdrant.tech/)**: Vector database for AI embeddings and semantic search
- **[ClickHouse](https://clickhouse.com/)**: Real-time analytics database
- **[Redis](https://redis.io/)**: Caching, session management, and job queues

### 4. Business Intelligence Layer
- **[Apache Superset](https://superset.apache.org/)**: Modern BI platform with SQL Lab
- **[Metabase](https://www.metabase.com/)**: Simple dashboards for non-technical users
- **[Grafana](https://grafana.com/)**: Operational monitoring and alerting

### 5. Legacy Support
- **[n8n](https://n8n.io/)**: Included for backward compatibility with existing workflows

## Documentation

- [Installation Guide](docs/installation.md): Complete setup instructions
- [Architecture Guide](docs/architecture.md): Detailed system architecture
- [Workflow Documentation](docs/workflows/README.md): Detailed explanation of each workflow
- [AI Agents Guide](docs/ai-agents.md): AI agent configuration and usage
- [Security Considerations](docs/security.md): Best practices for secure deployment
- [Maintenance Guide](docs/maintenance.md): Ongoing operations and troubleshooting

## Quick Start

```bash
# Clone this repository
git clone https://github.com/ActivateLLC/open-source-business-automation.git
cd open-source-business-automation

# Run the setup script
chmod +x setup.sh
./setup.sh

# Start the automation stack
docker-compose up -d

# Access the platforms
# NocoBase (Main UI): http://localhost:13000
# Activepieces (Automation): http://localhost:8080
# Temporal UI (Workflows): http://localhost:8233
# Apache Superset (Analytics): http://localhost:8088
# Metabase (Dashboards): http://localhost:3000
# Grafana (Monitoring): http://localhost:3001
# n8n (Legacy Workflows): http://localhost:5678
```

See the [Installation Guide](docs/installation.md) for complete setup instructions.

## System Requirements

### Minimum Requirements (Development/Testing)
- Linux server with 8GB RAM, 4 CPU cores
- 50GB+ storage space
- Docker and Docker Compose
- Internet connectivity

### Recommended Requirements (Production)
- Linux server with 16GB+ RAM, 8+ CPU cores
- 200GB+ SSD storage
- Docker and Docker Compose
- Static IP address
- Domain name with SSL certificates

## Feature Comparison: This Stack vs Odoo

| Feature | Odoo | This Stack |
|---------|------|------------|
| AI Integration | ⭐ Plugins only | ⭐⭐⭐⭐⭐ Native, multi-agent |
| Performance | ⭐⭐ Monolithic, slow | ⭐⭐⭐⭐⭐ Microservices, blazing fast |
| Customization | ⭐⭐ Limited, breaks on update | ⭐⭐⭐⭐⭐ Infinite, upgrade-safe |
| Scalability | ⭐⭐ Vertical only | ⭐⭐⭐⭐⭐ Horizontal, elastic |
| Modern Tech | ⭐⭐ Python 2 era | ⭐⭐⭐⭐⭐ Cutting-edge 2025 |
| License Freedom | ⭐ Community vs Enterprise trap | ⭐⭐⭐⭐⭐ 100% open-source |
| AI Capabilities | ⭐ None | ⭐⭐⭐⭐⭐ Multi-agent, RAG, ML |
| Real-time | ⭐⭐ Polling-based | ⭐⭐⭐⭐⭐ Event-driven |
| Analytics | ⭐⭐⭐ Basic | ⭐⭐⭐⭐⭐ Real-time, predictive |
| Developer Experience | ⭐⭐ XML hell | ⭐⭐⭐⭐⭐ Modern APIs, composable |

## Business Modules

### Lead Management Module
- ✅ AI Lead Scoring using vector embeddings
- ✅ Intelligent Routing based on rep performance
- ✅ Predictive Analytics for conversion prediction
- ✅ Automated Enrichment (Clearbit, Hunter.io, Apollo)
- ✅ Natural Language Search
- ✅ Smart Follow-ups with AI timing optimization

### Content & Marketing Automation Module
- ✅ AI Content Generation (blog posts, social media, emails)
- ✅ Content Calendar Intelligence with AI recommendations
- ✅ Multi-Channel Distribution
- ✅ Performance Analytics
- ✅ SEO Optimization with AI keyword research
- ✅ Personalization at Scale
- ✅ A/B Testing Automation

### Financial Operations Module
- ✅ Intelligent Invoice Processing with OCR
- ✅ Automated Reconciliation
- ✅ Predictive Cash Flow with ML
- ✅ Smart Payment Reminders with AI timing
- ✅ Fraud Detection with anomaly detection
- ✅ Multi-Currency support
- ✅ Automated Compliance and reporting

### AI Agent Layer
- 🤖 **Sales Agent**: Answers questions, qualifies leads, schedules meetings
- 🤖 **Content Agent**: Generates content, optimizes SEO, creates variations
- 🤖 **Finance Agent**: Answers invoice questions, processes refunds, generates reports
- 🤖 **Operations Agent**: Monitors health, predicts bottlenecks, auto-resolves issues

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is released under the [MIT License](LICENSE).