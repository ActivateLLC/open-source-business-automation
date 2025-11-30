# Workflow Documentation

This section provides detailed documentation for each automation workflow in the system.

## Available Workflows

### [AI Lead Processing](lead-management.md)

AI-powered lead management with intelligent scoring and routing. This workflow:
- Captures leads from webhook endpoint
- Applies rule-based and AI-powered scoring
- Routes leads to appropriate teams based on tier
- Publishes events to Kafka for audit trail
- Sends real-time notifications for hot leads

### [AI Content Generation & Distribution](content-automation.md)

End-to-end AI content creation and publishing. This workflow:
- Generates content topics based on business needs
- Creates full articles using Ollama AI
- Automatically distributes to multiple platforms
- Tracks publishing status and performance
- Logs all activities to Kafka

### [Automated Invoicing](finance-automation.md)

Complete financial automation with payment tracking. This workflow:
- Captures and validates invoices
- Tracks payments and reconciliations
- Alerts on overdue invoices
- Generates daily and monthly reports
- Maintains complete payment audit trail

### AI Business Assistant

Natural language interface for business data:
- Answers questions about leads and customers
- Provides financial insights
- Reports on content performance
- Context-aware responses using real data
- Conversation history tracking

### Kafka Audit Trail Consumer

Complete event logging and monitoring:
- Consumes all Kafka events
- Stores in PostgreSQL audit_trail table
- Processes alerts in real-time
- Generates hourly metrics
- Supports compliance requirements

### [Legacy Lead Management](lead-management.md)

Original file-based lead management (maintained for compatibility):
- Basic lead scoring algorithm
- File-based storage
- Simple routing

## Integration Architecture

These workflows are designed to work together as an integrated, event-driven system:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         External Webhook Sources                             │
│              (Website Forms, CRM, Email, API Integrations)                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           n8n Workflow Engine                                │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌──────────────┐ │
│  │ AI Lead        │ │ AI Content     │ │ Automated      │ │ AI Business  │ │
│  │ Processing     │ │ Distribution   │ │ Invoicing      │ │ Assistant    │ │
│  └───────┬────────┘ └───────┬────────┘ └───────┬────────┘ └──────┬───────┘ │
└──────────┼──────────────────┼──────────────────┼─────────────────┼─────────┘
           │                  │                  │                 │
           ▼                  ▼                  ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Apache Kafka                                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │ leads topic  │ │content topic │ │invoices topic│ │ alerts topic │       │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
           │                  │                  │                 │
           └──────────────────┴──────────────────┴─────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Kafka Audit Trail Consumer                             │
│                   (Stores all events in PostgreSQL)                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           ▼                          ▼                          ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│    PostgreSQL       │    │      Metabase       │    │      NocoBase       │
│   (Data Storage)    │    │    (Dashboards)     │    │  (Unified Frontend) │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## Event-Driven Architecture

All workflows publish events to Apache Kafka topics:

| Topic | Events |
|-------|--------|
| `business-events.leads` | Lead created, scored, updated |
| `business-events.lead-routing` | Lead routed to hot/warm/cold |
| `business-events.content` | Content generated, published |
| `business-events.content-distribution` | Content distributed to platforms |
| `business-events.invoices` | Invoice created, paid, overdue |
| `business-events.payments` | Payment received, reconciled |
| `business-events.reports` | Daily/monthly reports generated |
| `business-events.ai-assistant` | AI questions and answers |
| `business-events.alerts` | System alerts and notifications |

## AI Integration

Workflows use Ollama for AI capabilities:

### Lead Scoring
```
POST http://ollama:11434/api/generate
Model: llama2
Purpose: Analyze lead data and provide intelligent scoring
```

### Content Generation
```
POST http://ollama:11434/api/generate
Model: llama2
Purpose: Generate full articles from topics
```

### Business Assistant
```
POST http://ollama:11434/api/generate
Model: llama2
Purpose: Answer questions about business data
```

## Customization Guide

Each workflow can be customized to meet your specific business needs:

### 1. Scoring & Routing Logic
- Modify JavaScript code in Code nodes
- Adjust threshold values for categorization
- Change routing conditions in Switch nodes
- Update AI prompts for different scoring criteria

### 2. AI Model Configuration
- Change the Ollama model (e.g., mistral, codellama)
- Adjust temperature and other parameters
- Modify prompts for different output formats
- Add custom instructions for your industry

### 3. Kafka Topics
- Create additional topics for new event types
- Configure partitions for high-volume events
- Set up consumer groups for parallel processing

### 4. Database Schema
- Add custom fields to existing tables
- Create new tables for additional entities
- Modify views for dashboard requirements

### 5. Integration Points
- Update webhook URLs in configuration nodes
- Add new HTTP Request nodes for integrations
- Configure authentication for external APIs

### 6. Scheduling
- Adjust Cron node timing for different schedules
- Modify reporting frequencies
- Change automatic processing intervals

## Best Practices

For optimal performance and reliability:

### 1. Regular Backups
- Back up the data directory regularly
- Keep version history of workflow configurations
- Export workflows as JSON for version control

### 2. Monitoring
- Check workflow execution logs periodically
- Set up notifications for workflow failures
- Monitor Kafka lag using Kafka UI
- Watch disk space for data storage

### 3. Testing
- Test modifications in a development environment first
- Use sample data to verify workflow behavior
- Validate AI outputs before production use
- Test Kafka event flow end-to-end

### 4. Documentation
- Document any customizations you make
- Keep track of integration endpoints
- Maintain a change log for workflow modifications

## Extending the System

The automation stack can be extended with additional workflows:

### HR Automation
- Employee onboarding/offboarding
- Time off request processing
- Performance review workflows

### Customer Support
- Ticket routing and prioritization
- Automated responses using AI
- Customer satisfaction tracking

### Project Management
- Task assignment and tracking
- Deadline monitoring
- Status reporting

### E-commerce
- Order processing
- Inventory management
- Customer communication

To add new workflows:

1. Create a new workflow in n8n
2. Design the data flow and processing logic
3. Add Kafka publishing for audit trail
4. Create database tables if needed
5. Add necessary webhook endpoints or cron triggers
6. Document the workflow following this pattern
7. Test thoroughly before deploying to production