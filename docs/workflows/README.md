# Workflow Documentation

This section provides detailed documentation for each automation workflow in the system.

## Available Workflows

### [Lead Management System](lead-management.md)

Automate the entire lead lifecycle from capture to qualification with AI-powered capabilities. This workflow:
- Captures leads from multiple sources
- AI-powered scoring using vector embeddings
- Intelligent routing based on rep performance
- Predictive analytics for conversion prediction
- Automated enrichment from external sources
- Natural language search capabilities
- Smart follow-ups with AI timing optimization

### [Content Generation & Distribution](content-automation.md)

Streamline your content marketing with AI-assisted automation. This workflow:
- AI content generation (blog posts, social media, emails)
- Content calendar intelligence with AI recommendations
- Multi-channel distribution automation
- Performance analytics and optimization
- SEO optimization with AI keyword research
- Personalization at scale
- A/B testing automation

### [Financial Operations](finance-automation.md)

Automate your financial processes with intelligent capabilities. This workflow:
- Intelligent invoice processing with OCR
- Automated reconciliation
- Predictive cash flow with ML models
- Smart payment reminders with AI timing
- Fraud detection with anomaly detection
- Multi-currency support
- Automated compliance and reporting

## Workflow Platforms

The stack supports multiple workflow automation platforms for different use cases:

### Activepieces (Primary)
- Best for: Standard business automations, integrations, AI agent workflows
- Features: 280+ MCP servers, visual builder, extensive integrations
- Access: http://localhost:8080

### Temporal (Complex Processes)
- Best for: Long-running, fault-tolerant workflows
- Features: Durable execution, built-in retries, state management
- Use cases: Lead→Quote→Invoice→Payment workflows, multi-day processes
- Access: http://localhost:8233

### n8n (Legacy Support)
- Best for: Existing workflows, backward compatibility
- Features: Visual workflow builder, fair-code license
- Access: http://localhost:5678

## Integration Architecture

These workflows are designed to work together as an integrated, event-driven system:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           NocoBase (Unified UI)                                  │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Apache Kafka (Event Bus)                               │
│                    Real-time event streaming between services                    │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
┌───────────────────┐          ┌───────────────────┐          ┌───────────────────┐
│  Lead Management  │          │Content Automation │          │Financial Ops      │
│                   │          │                   │          │                   │
│ • Lead Capture    │          │ • AI Generation   │          │ • Invoice OCR     │
│ • AI Scoring      │          │ • SEO Optimization│          │ • Reconciliation  │
│ • Smart Routing   │          │ • Multi-Channel   │          │ • Fraud Detection │
│ • Enrichment      │          │ • A/B Testing     │          │ • Cash Flow ML    │
└─────────┬─────────┘          └─────────┬─────────┘          └─────────┬─────────┘
          │                              │                              │
          └──────────────────────────────┼──────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              AI Agent Layer                                      │
│    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│    │Sales Agent  │  │Content Agent│  │Finance Agent│  │Ops Agent    │           │
│    └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘           │
│                    LangChain + Qdrant + OpenAI/Claude                            │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                Data Layer                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ PostgreSQL   │  │   Qdrant     │  │ ClickHouse   │  │    Redis     │         │
│  │ Transactions │  │  Vectors/AI  │  │  Analytics   │  │ Cache/Queue  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘         │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Business Intelligence                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                           │
│  │   Superset   │  │   Metabase   │  │   Grafana    │                           │
│  │  (Primary BI)│  │ (Simple BI)  │  │ (Monitoring) │                           │
│  └──────────────┘  └──────────────┘  └──────────────┘                           │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Event-Driven Architecture

All workflows communicate through Apache Kafka events:

### Event Types

| Event | Source | Consumers |
|-------|--------|-----------|
| `lead.created` | Lead Management | Sales Agent, Activepieces |
| `lead.scored` | AI Agent | Lead Management, BI |
| `lead.converted` | Sales | Finance, Analytics |
| `content.created` | Content Agent | Distribution, BI |
| `content.published` | Distribution | Analytics, Reporting |
| `invoice.received` | Finance | OCR, Finance Agent |
| `invoice.approved` | Finance | Payment, Accounting |
| `payment.received` | Payment Gateway | Finance, Reporting |

### Event Schema Example

```json
{
  "event_type": "lead.created",
  "event_source": "nocobase",
  "correlation_id": "uuid-v4",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "lead_id": "uuid-v4",
    "company": "ACME Corp",
    "contact_email": "john@acme.com",
    "source": "website"
  }
}
```

## Customization Guide

Each workflow can be customized to meet your specific business needs:

### 1. Scoring & Routing Logic
- Modify AI scoring models in the AI Agent configuration
- Adjust threshold values in Activepieces workflows
- Customize routing rules in Temporal workflows

### 2. Templates & Output Formats
- Edit template files in the data directory
- Modify output formats in workflow nodes
- Customize AI generation prompts

### 3. Integration Points
- Add new Kafka topics for custom events
- Configure webhook endpoints in Activepieces
- Add new API integrations via HTTP nodes

### 4. AI Agent Customization
- Update knowledge base in Qdrant
- Modify agent prompts and behaviors
- Configure LLM parameters (temperature, model)

### 5. Scheduling
- Adjust cron schedules in Activepieces
- Configure Temporal workflow schedules
- Set up real-time event triggers

## Best Practices

For optimal performance and reliability:

### 1. Event Processing
- Use idempotent event handlers
- Implement proper error handling
- Monitor event processing latency

### 2. AI Agent Usage
- Regularly update knowledge base
- Monitor token usage and costs
- Implement response caching

### 3. Monitoring
- Set up Grafana dashboards for each workflow
- Configure alerts for failures
- Track key business metrics

### 4. Testing
- Test workflows in development environment
- Use sample data for validation
- Implement integration tests

### 5. Documentation
- Document any customizations
- Maintain a changelog
- Keep integration endpoints documented

## Extending the System

The automation stack can be extended with additional workflows:

### 1. HR Automation
- Employee onboarding/offboarding
- Time off request processing
- Performance review workflows

### 2. Customer Support
- Ticket routing and prioritization
- AI-powered responses
- Customer satisfaction tracking

### 3. Project Management
- Task assignment and tracking
- Deadline monitoring
- Status reporting

### 4. Inventory Management
- Stock level monitoring
- Automated reordering
- Supplier management

To add new workflows:

1. Define the business process
2. Create Kafka topics for events
3. Build workflow in Activepieces or Temporal
4. Configure AI agents if needed
5. Set up monitoring in Grafana
6. Document the workflow following existing patterns
7. Test thoroughly before deploying to production