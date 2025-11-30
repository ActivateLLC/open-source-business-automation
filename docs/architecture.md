# Architecture Guide

This document provides a comprehensive overview of the Open Source Business Automation Stack architecture, explaining how each component works together to deliver an enterprise-grade automation platform.

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENTS                                           │
│                    (Web Browsers, Mobile Apps, API Consumers)                        │
└───────────────────────────────────────┬─────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              REVERSE PROXY (Nginx)                                   │
│                         (SSL Termination, Load Balancing)                            │
└───────────────────────────────────────┬─────────────────────────────────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
┌───────────────┐              ┌───────────────┐              ┌───────────────┐
│   NocoBase    │              │  Activepieces │              │   BI Layer    │
│   Port 13000  │              │   Port 8080   │              │ 8088/3000/3001│
└───────────────┘              └───────────────┘              └───────────────┘
        │                               │                               │
        └───────────────────────────────┼───────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              EVENT BUS (Apache Kafka)                                │
│                              Port 9092                                               │
└───────────────────────────────────────┬─────────────────────────────────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
┌───────────────┐              ┌───────────────┐              ┌───────────────┐
│   Temporal    │              │     Redis     │              │   AI Agents   │
│   Port 7233   │              │   Port 6379   │              │  (LangChain)  │
└───────────────┘              └───────────────┘              └───────────────┘
        │                               │                               │
        └───────────────────────────────┼───────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                  DATA LAYER                                          │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────────────┤
│   PostgreSQL    │     Qdrant      │   ClickHouse    │                               │
│   Port 5432     │   Port 6333     │   Port 8123     │                               │
│ (Transactional) │   (Vectors)     │   (Analytics)   │                               │
└─────────────────┴─────────────────┴─────────────────┴───────────────────────────────┘
```

## Component Details

### 1. Frontend / Platform UI Layer

#### NocoBase
- **Purpose**: Unified no-code development platform for building business applications
- **Port**: 13000
- **Features**:
  - AI Employee feature for natural language modeling
  - Visual application builder
  - Plugin architecture for extensibility
  - Custom CRM, marketing tools, financial dashboards
- **Database**: PostgreSQL (nocobase database)

### 2. Workflow Automation Core

#### Activepieces
- **Purpose**: Primary automation engine for business workflows
- **Port**: 8080
- **Features**:
  - 280+ MCP servers for AI agents
  - Visual workflow builder
  - Extensive integration library
  - AI toolkit for building agents
- **Dependencies**: PostgreSQL, Redis

#### Temporal
- **Purpose**: Long-running, fault-tolerant workflow orchestration
- **Ports**: 7233 (gRPC), 8233 (Web UI)
- **Features**:
  - Durable execution for workflows spanning days/weeks
  - Built-in retry logic
  - State management
  - Perfect for complex business processes (lead→quote→invoice→payment)
- **Database**: PostgreSQL

#### Apache Kafka
- **Purpose**: Real-time event streaming and microservices communication
- **Port**: 9092
- **Features**:
  - Event-driven architecture
  - Decoupled services
  - Perfect audit trail
  - No data loss guarantee

### 3. Data Layer

#### PostgreSQL
- **Purpose**: Primary transactional database
- **Port**: 5432
- **Features**:
  - ACID compliance
  - JSON/JSONB support for flexible schemas
  - Full-text search
  - Proven reliability
- **Databases**:
  - `business_data`: Main operational data
  - `nocobase`: NocoBase application data
  - `activepieces`: Automation workflows
  - `n8n`: Legacy workflow data
  - `metabase`: BI metadata

#### Qdrant
- **Purpose**: Vector database for AI embeddings
- **Ports**: 6333 (HTTP), 6334 (gRPC)
- **Features**:
  - AI embeddings storage
  - Semantic search
  - Customer similarity matching
  - Content recommendations
  - Lead intelligence

#### ClickHouse
- **Purpose**: Real-time analytics database
- **Ports**: 8123 (HTTP), 9000 (Native)
- **Features**:
  - Process billions of events
  - Sub-second query performance
  - Columnar storage for analytics
  - Perfect for dashboards

#### Redis
- **Purpose**: Cache, queue, and session management
- **Port**: 6379
- **Features**:
  - Session management
  - Job queues
  - Real-time features
  - Performance optimization

### 4. Business Intelligence Layer

#### Apache Superset
- **Purpose**: Primary BI and visualization platform
- **Port**: 8088
- **Features**:
  - 40+ visualization types
  - SQL Lab for power users
  - Dashboard embedding
  - Real-time and cached queries

#### Metabase
- **Purpose**: Simple dashboards for non-technical users
- **Port**: 3000
- **Features**:
  - Question-based interface
  - Automated email reports
  - Easy data exploration

#### Grafana
- **Purpose**: Operational monitoring and alerting
- **Port**: 3001
- **Features**:
  - Real-time dashboards
  - Alerting rules
  - Performance metrics
  - System health monitoring

### 5. Legacy Support

#### n8n
- **Purpose**: Backward compatibility with existing workflows
- **Port**: 5678
- **Features**:
  - Existing workflow support
  - Fair-code license
  - Visual workflow builder

## Data Flow Patterns

### 1. Lead Capture Flow
```
Web Form → NocoBase/Webhook → Kafka → Activepieces Workflow → 
PostgreSQL (lead record) + Qdrant (embeddings) → 
AI Agent (scoring) → Notification
```

### 2. Content Generation Flow
```
Content Request → Activepieces → AI Agent (LangChain) → 
Draft Generation → Qdrant (SEO embeddings) → 
Review Queue → Multi-platform Publishing → 
ClickHouse (performance tracking)
```

### 3. Invoice Processing Flow
```
Invoice Upload → OCR Processing → 
Temporal Workflow (multi-step) → PostgreSQL (invoice record) → 
AI Agent (categorization) → Approval Queue → 
Payment Processing → Financial Report
```

### 4. Real-time Analytics Flow
```
Business Events → Kafka → ClickHouse → 
Superset/Grafana Dashboards → Real-time Updates
```

## AI Agent Architecture

### Agent Types

1. **Sales Agent**
   - Answers customer questions from knowledge base
   - Qualifies leads through conversation
   - Schedules meetings automatically
   - Updates CRM in real-time

2. **Content Agent**
   - Generates content based on brand voice
   - Optimizes for SEO automatically
   - Creates variations for A/B testing
   - Suggests content topics based on trends

3. **Finance Agent**
   - Answers invoice questions
   - Processes refund requests
   - Flags unusual transactions
   - Generates financial reports on demand

4. **Operations Agent**
   - Monitors system health
   - Predicts bottlenecks
   - Suggests process improvements
   - Auto-resolves common issues

### AI Stack
- **LangChain**: Agent orchestration framework
- **Qdrant**: Vector storage for RAG (Retrieval Augmented Generation)
- **OpenAI/Claude API**: LLM providers
- **AutoGen**: Multi-agent collaboration

## Scalability Considerations

### Horizontal Scaling
- All services are containerized and can be scaled independently
- Kafka enables decoupled, distributed processing
- PostgreSQL can be configured for read replicas
- Redis cluster mode for high availability

### Vertical Scaling
- Increase container resources as needed
- ClickHouse optimized for columnar data
- Qdrant optimized for vector operations

### Load Balancing
```
┌─────────────────┐
│  Load Balancer  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│Node 1 │ │Node 2 │
└───────┘ └───────┘
```

## Security Architecture

### Network Security
- All internal communication within Docker network
- External access only through reverse proxy
- SSL/TLS for all public endpoints

### Authentication
- NocoBase: Built-in user management
- Activepieces: JWT-based authentication
- Superset: Role-based access control
- Grafana: LDAP/OAuth integration support

### Data Security
- PostgreSQL: Role-based permissions
- Encryption at rest (configurable)
- Encryption in transit (TLS)
- Secrets management via environment variables

## Monitoring and Observability

### Metrics
- Grafana dashboards for system metrics
- Container health monitoring
- Application performance monitoring

### Logging
- Centralized logging support
- Container logs aggregation
- Audit trail via Kafka

### Alerting
- Grafana alerting rules
- Webhook notifications
- Email alerts

## Disaster Recovery

### Backup Strategy
- PostgreSQL: pg_dump for full backups
- Volume snapshots for all data stores
- Kafka: Topic replication

### Recovery Procedures
- Database restoration from backups
- Volume restoration from snapshots
- Workflow re-import if needed

## Development Workflow

### Local Development
```bash
# Start development stack
docker-compose up -d

# Access logs
docker-compose logs -f <service>

# Restart service
docker-compose restart <service>
```

### Testing
- Use separate test databases
- Mock external services
- Integration tests via API

### Deployment
```bash
# Pull latest images
docker-compose pull

# Apply updates with zero downtime
docker-compose up -d --no-deps <service>
```

## Performance Optimization

### Database Optimization
- Proper indexing (see init-db.sql)
- Connection pooling
- Query optimization

### Caching Strategy
- Redis for frequently accessed data
- Superset query caching
- CDN for static assets

### Resource Allocation
- Configure container limits
- Monitor resource usage
- Scale based on metrics
