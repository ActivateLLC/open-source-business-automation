# Platform Architecture

## Overview

The Open Source Business Automation Platform is designed as a microservices + event-driven architecture that outperforms traditional monolithic ERP systems like Odoo. This architecture provides:

- **Scalability**: Each service can scale independently
- **Resilience**: Failure in one service doesn't bring down the entire system
- **Flexibility**: Services can be updated, replaced, or extended without affecting others
- **Performance**: Optimized data stores for each use case

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      UNIFIED API GATEWAY (Traefik)                          │
│                        Single Entry Point for All                           │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                                                                              │
│                    AUTOMATION ORCHESTRATION LAYER                           │
│                                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │   Activepieces   │  │     Temporal     │  │      Apache Kafka        │  │
│  │  (Primary - MIT) │  │  (Long-running   │  │   (Event Streaming)      │  │
│  │                  │  │    workflows)    │  │                          │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘  │
│                                                                              │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
    ┌─────────────┬───────────────┼───────────────┬───────────────────────────┐
    │             │               │               │                           │
┌───▼────────┐ ┌──▼───────────┐ ┌─▼──────────┐ ┌──▼───────────┐              │
│   LEAD     │ │   CONTENT    │ │ FINANCIAL  │ │  AI AGENT    │              │
│ MANAGEMENT │ │  AUTOMATION  │ │    OPS     │ │   LAYER      │              │
│            │ │              │ │            │ │              │              │
│ • Scoring  │ │ • Planning   │ │ • Invoices │ │ • RAG        │              │
│ • Routing  │ │ • Generation │ │ • Payments │ │ • Embeddings │              │
│ • Tracking │ │ • Publishing │ │ • Reports  │ │ • LLM Agents │              │
└───┬────────┘ └──────┬───────┘ └─────┬──────┘ └──────┬───────┘              │
    │                 │               │               │                       │
    └─────────────────┴───────────────┴───────────────┘                       │
                                  │                                           │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                                                                              │
│                          DATA & STORAGE LAYER                               │
│                                                                              │
│  ┌───────────────┐  ┌────────────────┐  ┌─────────────┐  ┌───────────────┐ │
│  │  PostgreSQL   │  │     Qdrant     │  │  ClickHouse │  │     Redis     │ │
│  │(Transactional)│  │  (Vector/AI)   │  │ (Analytics) │  │   (Cache)     │ │
│  └───────────────┘  └────────────────┘  └─────────────┘  └───────────────┘ │
│                                                                              │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼───────────────────────────────────────────┐
│                                                                              │
│                  UNIFIED BUSINESS INTELLIGENCE LAYER                        │
│                                                                              │
│  ┌────────────────────┐  ┌─────────────────┐  ┌────────────────────────────┐│
│  │   Apache Superset  │  │    Metabase     │  │         Grafana            ││
│  │     (Primary)      │  │(Simple dashboards)│  │  (Real-time monitoring)  ││
│  └────────────────────┘  └─────────────────┘  └────────────────────────────┘│
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### API Gateway Layer

#### Traefik
- **Purpose**: Unified API gateway and reverse proxy
- **License**: MIT
- **Features**:
  - Automatic HTTPS with Let's Encrypt
  - Dynamic service discovery
  - Load balancing
  - Rate limiting
  - Circuit breaker patterns
  - Middleware for authentication, compression, etc.

### Automation Orchestration Layer

#### Activepieces (Primary Automation)
- **Purpose**: Visual workflow automation platform
- **License**: MIT (fully open source)
- **Why over n8n**: 
  - Pure MIT license (vs n8n's fair-code)
  - Modern React-based UI
  - Growing ecosystem of pieces (connectors)
  - Active community development
- **Use Cases**:
  - Event-triggered automations
  - API integrations
  - Data transformations
  - Business process automation

#### Temporal
- **Purpose**: Durable workflow orchestration
- **License**: MIT
- **Features**:
  - Long-running workflow execution
  - Automatic retries and fault tolerance
  - Workflow versioning
  - Activity heartbeating
- **Use Cases**:
  - Multi-step business processes
  - Saga patterns for distributed transactions
  - Scheduled batch jobs
  - Human-in-the-loop workflows

#### Apache Kafka
- **Purpose**: Event streaming platform
- **License**: Apache 2.0
- **Features**:
  - High-throughput message streaming
  - Event sourcing
  - Stream processing
  - Durable message storage
- **Use Cases**:
  - Cross-service event propagation
  - Real-time data pipelines
  - Audit logging
  - Change data capture

### Business Modules

#### Lead Management
- Automated lead capture and scoring
- Intelligent routing based on criteria
- Lead lifecycle tracking
- Integration with CRM systems

#### Content Automation
- AI-assisted content planning
- Automated content generation workflows
- Multi-channel publishing
- Performance tracking

#### Financial Operations
- Invoice processing and management
- Payment tracking and reconciliation
- Financial reporting
- Budget monitoring

#### AI Agent Layer
- Vector-based semantic search
- RAG (Retrieval-Augmented Generation)
- Intelligent document processing
- Conversational AI interfaces

### Data & Storage Layer

#### PostgreSQL (Transactional)
- **Purpose**: Primary relational database
- **License**: PostgreSQL License (permissive)
- **Use Cases**:
  - User and account data
  - Transactional business data
  - Workflow state storage
  - Configuration management

#### Qdrant (Vector/AI)
- **Purpose**: Vector database for AI/ML workloads
- **License**: Apache 2.0
- **Features**:
  - High-performance vector similarity search
  - Filtering with payload conditions
  - Horizontal scalability
- **Use Cases**:
  - Semantic search
  - Document embeddings
  - Recommendation systems
  - AI agent memory

#### ClickHouse (Analytics)
- **Purpose**: OLAP database for analytics
- **License**: Apache 2.0
- **Features**:
  - Columnar storage for fast analytics
  - Real-time data ingestion
  - SQL interface
- **Use Cases**:
  - Business analytics
  - Time-series analysis
  - Log analysis
  - Funnel analysis

#### Redis (Cache)
- **Purpose**: In-memory data store
- **License**: BSD-3-Clause
- **Features**:
  - Sub-millisecond latency
  - Pub/Sub messaging
  - Session storage
- **Use Cases**:
  - API response caching
  - Session management
  - Rate limiting counters
  - Real-time leaderboards

### Business Intelligence Layer

#### Apache Superset (Primary)
- **Purpose**: Enterprise-grade data visualization
- **License**: Apache 2.0
- **Features**:
  - Rich visualization library
  - SQL Lab for ad-hoc queries
  - Dashboard sharing and embedding
  - Role-based access control
- **Use Cases**:
  - Executive dashboards
  - Data exploration
  - Report generation
  - KPI tracking

#### Metabase (Simple Dashboards)
- **Purpose**: User-friendly BI for business users
- **License**: AGPL-3.0
- **Features**:
  - No-SQL interface
  - Quick questions
  - Embedded analytics
- **Use Cases**:
  - Self-service analytics
  - Simple reports
  - Embedded dashboards

#### Grafana (Real-time Monitoring)
- **Purpose**: Operations monitoring and alerting
- **License**: AGPL-3.0
- **Features**:
  - Real-time metric visualization
  - Alerting system
  - Multi-source support
- **Use Cases**:
  - System monitoring
  - Performance metrics
  - SLA tracking
  - Incident response

## Comparison with Odoo

| Feature | This Platform | Odoo |
|---------|---------------|------|
| **Architecture** | Microservices | Monolithic |
| **License** | MIT/Apache (fully open) | LGPL (limited) |
| **Scalability** | Horizontal per service | Vertical only |
| **Customization** | Replace any component | Tightly coupled |
| **AI/ML Ready** | Native vector DB | Requires plugins |
| **Event Streaming** | Built-in Kafka | Not available |
| **Analytics** | Dedicated OLAP | Shared database |
| **Caching** | Dedicated Redis | Application-level |
| **Workflow Engine** | Temporal (durable) | Limited |
| **Cost** | 100% Free | Enterprise features paid |

## Deployment Profiles

### Development
- Single-node Docker Compose
- SQLite for testing
- Minimal resource requirements
- Hot-reload for development

### Production
- Docker Compose or Kubernetes
- High-availability PostgreSQL
- Kafka cluster with replication
- Redis Sentinel/Cluster
- Proper backup strategies

### Enterprise
- Kubernetes with Helm charts
- Multi-region deployment
- Disaster recovery
- Dedicated monitoring stack
- SSO integration

## Network Architecture

```
Internet
    │
    ▼
┌───────────────┐
│  Traefik LB   │ ← SSL Termination, Rate Limiting
└───────┬───────┘
        │
        ├──────────────────────────────────────────┐
        │                                          │
   ┌────▼────┐   ┌─────────────┐   ┌─────────────┐│
   │Frontend │   │ API Gateway │   │  Webhooks   ││
   │(Static) │   │  (Traefik)  │   │ (Callbacks) ││
   └─────────┘   └──────┬──────┘   └─────────────┘│
                        │                          │
        ┌───────────────┼───────────────┐          │
        │               │               │          │
   ┌────▼────┐   ┌─────▼─────┐   ┌─────▼─────┐    │
   │Services │   │Orchestrat.│   │  BI Tools │    │
   │ (APIs)  │   │  Layer    │   │           │    │
   └────┬────┘   └─────┬─────┘   └─────┬─────┘    │
        │               │               │          │
        └───────────────┼───────────────┘          │
                        │                          │
                  ┌─────▼─────┐                    │
                  │  Kafka    │ ← Event Bus        │
                  └─────┬─────┘                    │
                        │                          │
        ┌───────────────┼───────────────┐          │
        │               │               │          │
   ┌────▼────┐   ┌─────▼─────┐   ┌─────▼─────┐    │
   │PostgreSQL│   │ ClickHouse│   │   Redis   │    │
   └─────────┘   └───────────┘   └───────────┘    │
                                                   │
                 Internal Network ─────────────────┘
```

## Security Considerations

1. **Network Isolation**: Services communicate through internal Docker network
2. **TLS Everywhere**: All external traffic encrypted with automatic certificate management
3. **Authentication**: OAuth2/OIDC integration via Traefik middleware
4. **Authorization**: Role-based access control at service level
5. **Secrets Management**: Docker secrets or external vault integration
6. **Audit Logging**: All actions logged to Kafka for compliance

## Getting Started

See the [Installation Guide](installation.md) for detailed setup instructions.
