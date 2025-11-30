# Workflow Documentation

This section provides detailed documentation for each automation workflow in the system.

## Architecture Overview

The platform uses a multi-layer automation approach:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTOMATION ORCHESTRATION LAYER                           │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         Activepieces (Primary)                         │ │
│  │  Visual workflow automation - event triggers, integrations, actions    │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                              Temporal                                   │ │
│  │  Long-running workflows - sagas, retries, human-in-the-loop           │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                           Apache Kafka                                  │ │
│  │  Event streaming - cross-service communication, audit logging          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Available Workflows

### [Lead Management System](lead-management.md)

Automate the entire lead lifecycle from capture to qualification. This workflow:
- Captures leads from multiple sources via webhooks
- Scores and categorizes leads automatically using AI
- Routes leads to appropriate teams based on configurable rules
- Generates lead reports and analytics
- Integrates with CRM systems via Kafka events

**Automation Platform:** Activepieces + Temporal (for nurturing sequences)

### [Content Generation & Distribution](content-automation.md)

Streamline your content marketing with AI-assisted automation. This workflow:
- Generates content ideas from trending topics and AI analysis
- Creates content drafts using templates and AI assistance
- Manages the publishing approval process
- Schedules multi-channel distribution
- Tracks content performance metrics

**Automation Platform:** Activepieces + Temporal (for approval workflows)

### [Financial Operations](finance-automation.md)

Automate your financial processes without expensive accounting software. This workflow:
- Captures and processes invoices via API/webhook
- Tracks payments and reconciliations
- Alerts about urgent financial matters
- Generates comprehensive financial reports
- Syncs with external accounting systems via Kafka

**Automation Platform:** Activepieces + Temporal (for payment workflows)

## Integration Architecture

These workflows are designed to work together as an integrated system using event-driven architecture:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Lead Management│     │Content Generation│     │Financial        │
│  System         │     │& Distribution    │     │Operations       │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Apache Kafka                              │
│  Events: lead.created, content.published, invoice.paid, etc.   │
└─────────────────────────────────────────────────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                         PostgreSQL                               │
│         Transactional data storage with full schemas            │
└─────────────────────────────────────────────────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ClickHouse                               │
│              Analytics and reporting data warehouse             │
└─────────────────────────────────────────────────────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              Superset / Metabase / Grafana                      │
│                   Visualization & Dashboards                     │
└─────────────────────────────────────────────────────────────────┘
```

## Workflow Migration Guide

### From n8n to Activepieces

The platform includes n8n for backward compatibility during migration:

1. **Export existing workflows** from n8n as JSON
2. **Map nodes** to equivalent Activepieces pieces:
   - Webhook → Webhook trigger
   - HTTP Request → HTTP piece
   - Code/Function → Code piece
   - Set → Data mapper
3. **Recreate in Activepieces** using the visual builder
4. **Test thoroughly** before decommissioning n8n workflows

### Long-Running Workflows

For complex, multi-step processes that require durability:

1. **Define workflow in Temporal** using Python/TypeScript SDK
2. **Create activities** for individual steps
3. **Handle failures** with automatic retries
4. **Signal/Query** workflows for external interaction

Example use cases:
- Multi-day lead nurturing sequences
- Approval workflows with human tasks
- Payment processing with retries
- Content approval pipelines

## Customization Guide

Each workflow can be customized to meet your specific business needs:

### 1. Scoring & Routing Logic

**In Activepieces:**
- Modify JavaScript code in Code pieces
- Adjust threshold values in branch conditions
- Change routing logic in router pieces

**In Database:**
- Update scoring weights in configuration tables
- Modify routing rules stored in PostgreSQL

### 2. Templates & Output Formats

- Edit template files in the data directory
- Modify output formats in transformation pieces
- Adjust file naming conventions

### 3. Integration Points

- Add new Activepieces pieces for external services
- Publish/subscribe to Kafka topics for cross-system integration
- Use Temporal for complex multi-system orchestration

### 4. Scheduling

- Adjust trigger schedules in Activepieces
- Modify Temporal workflow schedules
- Change cron expressions for batch processing

## Event Schema

All services communicate via Kafka with standardized event formats:

```json
{
  "event_type": "lead.created",
  "event_id": "uuid",
  "timestamp": "ISO-8601",
  "source": "activepieces",
  "data": {
    "lead_id": "uuid",
    "email": "string",
    "score": "number",
    "tier": "string"
  },
  "metadata": {
    "correlation_id": "uuid",
    "causation_id": "uuid"
  }
}
```

## Best Practices

### For Reliability

1. **Use Temporal** for workflows that must complete
2. **Idempotent handlers** for Kafka consumers
3. **Dead letter queues** for failed events
4. **Health checks** for all automation services

### For Observability

1. **Structured logging** in all workflows
2. **Metrics** via Grafana dashboards
3. **Tracing** with correlation IDs
4. **Alerting** on workflow failures

### For Maintainability

1. **Version control** all workflow configurations
2. **Document changes** in workflow comments
3. **Test** in staging before production
4. **Modular design** for reusable components

## Extending the System

The automation stack can be extended with additional workflows:

### 1. HR Automation
- Employee onboarding/offboarding sequences
- Time off request processing
- Performance review workflows

### 2. Customer Support
- Ticket routing and prioritization
- Automated responses with AI
- Customer satisfaction tracking

### 3. Project Management
- Task assignment and tracking
- Deadline monitoring
- Status reporting

### Adding New Workflows

1. **Design the workflow** in Activepieces
2. **Create Temporal workflows** for durable operations
3. **Define Kafka events** for cross-system communication
4. **Create database schemas** for data storage
5. **Build dashboards** in Superset/Grafana
6. **Document** following existing patterns