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

## Tech Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 14.2.33 | React framework for the Generative UI dashboard |
| [React](https://react.dev/) | 18.2.x | UI component library |
| [TypeScript](https://www.typescriptlang.org/) | 5.3.x | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4.x | Utility-first CSS framework |
| [Chart.js](https://www.chartjs.org/) | 4.4.x | Dynamic chart generation |
| [Recharts](https://recharts.org/) | 2.10.x | React charting library |
| [React Markdown](https://github.com/remarkjs/react-markdown) | 9.0.x | Markdown rendering |

### Backend & Infrastructure
| Technology | Version | Purpose |
|------------|---------|---------|
| [Node.js](https://nodejs.org/) | 20 LTS | JavaScript runtime |
| [PostgreSQL](https://www.postgresql.org/) | 14 | Primary relational database |
| [Apache Kafka](https://kafka.apache.org/) | 7.4.0 (Confluent) | Event streaming & audit trail |
| [Redis](https://redis.io/) | 7.x | Caching & real-time updates |
| [Docker](https://www.docker.com/) | Latest | Containerization |
| [Docker Compose](https://docs.docker.com/compose/) | v3 | Multi-container orchestration |

### AI & Machine Learning
| Technology | Version | Purpose |
|------------|---------|---------|
| [Ollama](https://ollama.com/) | Latest | Local LLM hosting (llama2, etc.) |
| [MCP SDK](https://modelcontextprotocol.io/) | 0.5.0 | Model Context Protocol integration |
| [Anthropic SDK](https://docs.anthropic.com/) | 0.27.3 | Claude AI integration support |

### Business Automation
| Technology | Version | Purpose |
|------------|---------|---------|
| [n8n](https://n8n.io/) | Latest | Workflow automation engine |
| [NocoBase](https://www.nocobase.com/) | Latest | Low-code admin platform |
| [Metabase](https://www.metabase.com/) | Latest | Business intelligence & dashboards |
| [Kafka UI](https://github.com/provectus/kafka-ui) | Latest | Kafka management interface |

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

## Project Structure

```
open-source-business-automation/
├── generative-ui/              # Next.js AI-powered dashboard
│   ├── src/
│   │   ├── app/               # Next.js App Router pages & API routes
│   │   ├── components/        # React UI components
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── CommandInput.tsx
│   │   │   ├── DynamicChart.tsx
│   │   │   ├── InsightCard.tsx
│   │   │   └── UIElements.tsx
│   │   ├── lib/               # Utility libraries
│   │   │   ├── command-parser.ts
│   │   │   └── mcp-client.ts
│   │   └── types/             # TypeScript type definitions
│   ├── Dockerfile             # Multi-stage Docker build
│   ├── package.json           # Node.js dependencies
│   └── tailwind.config.js     # Tailwind CSS configuration
├── mcp-servers/                # Model Context Protocol servers
│   ├── database-server.js     # PostgreSQL query tools
│   ├── ollama-server.js       # AI analysis & generation
│   ├── mcp-config.json        # MCP server configurations
│   └── package.json           # MCP dependencies
├── workflows/                  # n8n automation workflows
│   ├── n8n-ai-lead-processing.json
│   ├── n8n-ai-content-distribution.json
│   ├── n8n-automated-invoicing.json
│   ├── n8n-ai-assistant.json
│   ├── n8n-kafka-audit-trail.json
│   └── n8n-free-lead-management.json
├── docs/                       # Documentation
│   ├── installation.md
│   ├── generative-ui.md
│   ├── security.md
│   ├── maintenance.md
│   └── workflows/
├── docker-compose.yml          # Multi-service orchestration
├── init-db.sql                 # Database schema & views
├── setup.sh                    # Automated setup script
└── LICENSE                     # MIT License
```

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
| [Ollama](https://ollama.com/) | Local AI/LLM for scoring & content | 11434 | MIT |
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

### 🎤 Voice-Driven Canvas (NEW)
A split-screen voice-first experience for hands-free business intelligence:

- **Voice Commands**: Speak naturally to generate visualizations
  - Automatic voice activity detection (VAD)
  - Real-time speech-to-text transcription
  - No button pressing required
  
- **Canvas Pattern**: Split-screen design
  - Left panel: Voice-first chat controller with text fallback
  - Right panel: Dynamic canvas that renders charts and insights
  
- **Interactive Charts**: Click to drill down
  - Built with Recharts for composability
  - Click any data point to refine queries
  - Visual selection indicators
  
- **Access at**: `http://localhost:4000/canvas`

### 🔌 MCP (Model Context Protocol) Servers
MCP servers provide a standardized way for AI systems to interact with your business tools:

| MCP Server | Purpose | Tools |
|------------|---------|-------|
| Database MCP | Query PostgreSQL | get_leads, get_customers, get_invoices, get_metrics |
| Ollama MCP | AI Analysis | generate_insight, analyze_leads, score_lead, generate_content |
| Kafka MCP | Event Streaming | get_recent_events, publish_event |
| n8n MCP | Workflow Automation | trigger_workflow, get_workflow_status |

#### Database MCP Server Tools
| Tool | Description |
|------|-------------|
| `get_leads` | Fetch leads with optional filters (tier, status, limit) |
| `get_lead_stats` | Get aggregated lead statistics |
| `get_customers` | Fetch customer data with filters |
| `get_invoices` | Fetch invoices with status/payment filters |
| `get_financial_summary` | Get financial metrics overview |
| `get_content` | Fetch content items |
| `get_dashboard_metrics` | All metrics in one call |
| `execute_query` | Custom read-only SQL queries |

#### Ollama AI MCP Server Tools
| Tool | Description |
|------|-------------|
| `generate_insight` | Generate AI insights from natural language queries |
| `analyze_leads` | Analyze lead data for scoring/prioritization |
| `analyze_revenue` | Financial analysis and recommendations |
| `generate_content` | Create blog posts, articles, social content |
| `score_lead` | Score individual leads using AI |
| `summarize_data` | Create natural language summaries |

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

## Database Schema

The PostgreSQL database includes a comprehensive schema for business automation:

### Core Tables
| Table | Description |
|-------|-------------|
| `leads` | Lead tracking with AI scoring, tier classification, and lifecycle management |
| `customers` | Customer records with lifetime value tracking |
| `invoices` | Invoice management with payment tracking |
| `payments` | Payment records linked to invoices |
| `content_items` | Content management with AI generation tracking |
| `content_distribution` | Multi-platform content distribution status |
| `ai_conversations` | AI assistant conversation history |
| `ai_messages` | Individual AI assistant messages |
| `audit_trail` | Kafka event log mirror for compliance |
| `dashboard_metrics` | Real-time dashboard metrics |

### Database Views
| View | Purpose |
|------|---------|
| `v_lead_pipeline` | Lead pipeline summary by tier and status |
| `v_invoice_summary` | Financial overview by payment status |
| `v_content_performance` | Content metrics and engagement |
| `v_daily_activity` | Daily audit trail summary |

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

## Docker Services

The `docker-compose.yml` orchestrates the following services:

| Service | Image | Description |
|---------|-------|-------------|
| `generative-ui` | Custom (Next.js) | AI-powered dashboard built with Next.js 14 |
| `nocobase` | nocobase/nocobase:latest | Low-code admin frontend |
| `n8n` | docker.n8n.io/n8nio/n8n | Workflow automation engine |
| `postgres` | postgres:14 | Primary database with custom schema |
| `metabase` | metabase/metabase:latest | Business intelligence dashboards |
| `kafka` | confluentinc/cp-kafka:7.4.0 | Event streaming platform |
| `zookeeper` | confluentinc/cp-zookeeper:7.4.0 | Kafka coordination service |
| `kafka-ui` | provectuslabs/kafka-ui:latest | Kafka web management |
| `ollama` | ollama/ollama:latest | Local LLM server |
| `redis` | redis:7-alpine | Caching and real-time updates |

### Service Ports
| Port | Service | Purpose |
|------|---------|---------|
| 4000 | Generative UI | AI-powered dashboard |
| 13000 | NocoBase | Admin frontend |
| 5678 | n8n | Workflow automation |
| 5432 | PostgreSQL | Database access |
| 3000 | Metabase | BI dashboards |
| 9092/29092 | Kafka | Event streaming |
| 8080 | Kafka UI | Kafka management |
| 11434 | Ollama | AI/LLM API |
| 6379 | Redis | Cache access |
| 2181 | Zookeeper | Kafka coordination |

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

### Generative UI API Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/chat` | POST | Process natural language queries |
| `/api/mcp/status` | GET | Check MCP server status |
| `/api/mcp/database/leads` | POST | Query leads with filters |
| `/api/mcp/database/metrics` | GET | Get dashboard metrics |
| `/api/mcp/database/customers` | POST | Query customer data |
| `/api/mcp/database/invoices` | POST | Query invoice data |

## Environment Variables

Key environment variables for configuration:

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_HOST` | postgres | PostgreSQL host |
| `POSTGRES_PORT` | 5432 | PostgreSQL port |
| `POSTGRES_DB` | n8n | Database name |
| `POSTGRES_USER` | n8n | Database user |
| `POSTGRES_PASSWORD` | n8n_password | Database password |
| `OLLAMA_HOST` | http://ollama:11434 | Ollama API endpoint |
| `OLLAMA_MODEL` | llama2 | Default LLM model |
| `KAFKA_BROKER` | kafka:9092 | Kafka broker address |
| `N8N_HOST` | http://n8n:5678 | n8n API endpoint |
| `REDIS_HOST` | redis | Redis host |
| `REDIS_PORT` | 6379 | Redis port |
| `N8N_ENCRYPTION_KEY` | (required) | Encryption key for n8n |
| `NOCOBASE_APP_KEY` | (required) | App key for NocoBase |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is released under the [MIT License](LICENSE).