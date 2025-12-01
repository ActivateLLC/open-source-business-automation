# Generative UI & MCP Servers

This document explains the Generative UI dashboard and the Model Context Protocol (MCP) server architecture that powers the AI-driven business automation experience.

## Overview

The Generative UI is a modern, AI-powered dashboard that allows users to interact with their business data through natural language commands. Instead of navigating through menus and clicking buttons, users simply describe what they want to see, and the system generates the appropriate visualizations and insights.

## Generative UI Features

### Natural Language Commands

The UI accepts natural language commands and translates them into data queries and visualizations:

| Example Command | Result |
|-----------------|--------|
| "Show me a lead pipeline chart" | Generates a pie chart of leads by tier |
| "How is revenue trending?" | Creates a line chart of monthly revenue |
| "What are today's key insights?" | Displays AI-generated insight cards |
| "Show me hot leads that need attention" | Lists high-priority leads with actions |
| "Analyze customer segments" | Creates segment visualization and analysis |

### Dynamic Chart Generation

Charts are generated on-demand based on user requests:

- **Bar Charts**: Compare values across categories
- **Line Charts**: Show trends over time
- **Pie/Doughnut Charts**: Display distribution and composition
- **Area Charts**: Visualize cumulative data

### AI-Powered Insights

The system automatically generates insights including:

- **Hot Lead Alerts**: Immediate notifications for high-value leads
- **Revenue Trends**: Financial performance analysis
- **Risk Warnings**: Overdue invoices, at-risk customers
- **Performance Metrics**: Content, conversion, and engagement stats

### Quick Actions

Pre-built quick actions for common tasks:

- 📊 Charts - Generate overview visualizations
- 💡 Insights - Get AI-generated business insights
- 🔥 Hot Leads - View leads requiring immediate attention
- 💰 Revenue - Analyze financial performance

## MCP Server Architecture

MCP (Model Context Protocol) servers provide a standardized interface for AI systems to interact with various data sources and tools.

### Available MCP Servers

#### 1. Database MCP Server

Connects to PostgreSQL for business data queries.

**Tools:**
- `get_leads` - Fetch leads with optional filters (tier, status, limit)
- `get_lead_stats` - Get aggregated lead statistics
- `get_customers` - Fetch customer data
- `get_invoices` - Fetch invoice data with filters
- `get_financial_summary` - Get financial metrics
- `get_content` - Fetch content items
- `get_dashboard_metrics` - All metrics in one call
- `execute_query` - Custom SELECT queries (read-only)

**Configuration:**
```json
{
  "name": "Database MCP Server",
  "env": {
    "POSTGRES_HOST": "postgres",
    "POSTGRES_PORT": "5432",
    "POSTGRES_DB": "n8n",
    "POSTGRES_USER": "n8n",
    "POSTGRES_PASSWORD": "${POSTGRES_PASSWORD}"
  }
}
```

#### 2. Ollama AI MCP Server

Provides AI-powered analysis and content generation.

**Tools:**
- `generate_insight` - Generate AI insights from queries
- `analyze_leads` - Analyze lead data for scoring/prioritization
- `analyze_revenue` - Financial analysis and recommendations
- `generate_content` - Create blog posts, articles, social content
- `score_lead` - Score individual leads using AI
- `summarize_data` - Create natural language summaries

**Configuration:**
```json
{
  "name": "Ollama AI MCP Server",
  "env": {
    "OLLAMA_HOST": "http://ollama:11434",
    "OLLAMA_MODEL": "llama2"
  }
}
```

#### 3. n8n Workflow MCP Server

Triggers and monitors n8n automation workflows.

**Tools:**
- `trigger_workflow` - Start a workflow by ID
- `get_workflow_status` - Check workflow execution status
- `list_workflows` - List available workflows

#### 4. Kafka Events MCP Server

Reads and processes event streams from Kafka.

**Tools:**
- `get_recent_events` - Fetch recent events from topics
- `publish_event` - Publish events to topics

## Running the Generative UI

### With Docker Compose (Recommended)

The Generative UI is included in the docker-compose.yml and starts automatically:

```bash
docker-compose up -d
```

Access at: `http://localhost:4000`

### Standalone Development

For development:

```bash
cd generative-ui
npm install
npm run dev
```

Access at: `http://localhost:4000`

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_HOST` | postgres | PostgreSQL host |
| `POSTGRES_PORT` | 5432 | PostgreSQL port |
| `POSTGRES_DB` | n8n | Database name |
| `POSTGRES_USER` | n8n | Database user |
| `POSTGRES_PASSWORD` | n8n_password | Database password |
| `OLLAMA_HOST` | http://ollama:11434 | Ollama API endpoint |
| `KAFKA_BROKER` | kafka:9092 | Kafka broker address |
| `N8N_HOST` | http://n8n:5678 | n8n API endpoint |
| `REDIS_HOST` | redis | Redis host |
| `REDIS_PORT` | 6379 | Redis port |

### MCP Server Configuration

MCP server configurations are stored in `mcp-servers/mcp-config.json`:

```json
{
  "mcpServers": {
    "database": {
      "name": "Database MCP Server",
      "command": "node",
      "args": ["mcp-servers/database-server.js"],
      "env": { ... }
    },
    "ollama": {
      "name": "Ollama AI MCP Server",
      "command": "node",
      "args": ["mcp-servers/ollama-server.js"],
      "env": { ... }
    }
  }
}
```

## API Endpoints

### Chat API

`POST /api/chat`

Processes natural language queries and returns structured responses.

**Request:**
```json
{
  "message": "Show me a lead pipeline chart",
  "context": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Here's the lead distribution by tier:",
  "chartData": {
    "type": "pie",
    "title": "Lead Distribution by Tier",
    "labels": ["Hot", "Warm", "Cold"],
    "datasets": [{ "data": [15, 45, 67] }]
  },
  "suggestedActions": ["Show lead chart", "View hot leads"]
}
```

### MCP Status API

`GET /api/mcp/status`

Returns status of all MCP servers.

**Response:**
```json
{
  "success": true,
  "servers": [
    { "name": "database", "status": "connected", "tools": [...] },
    { "name": "ollama", "status": "connected", "tools": [...] }
  ],
  "totalConnected": 4
}
```

### Database APIs

- `POST /api/mcp/database/leads` - Get leads with filters
- `GET /api/mcp/database/metrics` - Get dashboard metrics
- `POST /api/mcp/database/customers` - Get customers
- `POST /api/mcp/database/invoices` - Get invoices

## Extending the System

### Adding New MCP Servers

1. Create a new server file in `mcp-servers/`:

```javascript
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');

const tools = [
  {
    name: 'my_tool',
    description: 'Description of what the tool does',
    inputSchema: {
      type: 'object',
      properties: { ... }
    }
  }
];

// Implement tool handlers
async function executeMyTool(params) {
  // Implementation
}

// Create and run server
async function main() {
  const server = new Server({ name: 'my-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });
  
  server.setRequestHandler('tools/list', async () => ({ tools }));
  server.setRequestHandler('tools/call', async (request) => { /* ... */ });
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
```

2. Add configuration to `mcp-config.json`
3. Create API routes in `generative-ui/src/app/api/mcp/`

### Adding New Command Patterns

Update `generative-ui/src/lib/command-parser.ts`:

```typescript
const NEW_PATTERNS = [
  /your pattern here/i,
];

// Add entity keywords
const ENTITY_KEYWORDS = {
  your_entity: ['keyword1', 'keyword2'],
};
```

## Troubleshooting

### Common Issues

**MCP Server Not Connecting**
- Check that all services are running: `docker-compose ps`
- Verify environment variables are set correctly
- Check logs: `docker-compose logs generative-ui`

**Charts Not Generating**
- Ensure the database has data
- Check browser console for errors
- Verify API responses at `/api/mcp/database/metrics`

**AI Insights Not Working**
- Confirm Ollama is running and model is downloaded
- Check Ollama logs: `docker-compose logs ollama`
- Verify OLLAMA_HOST is accessible

## Best Practices

1. **Use Natural Language**: The system is designed for conversational queries
2. **Be Specific**: "Show revenue for this month" works better than "show data"
3. **Explore Suggestions**: Use the suggested actions for common tasks
4. **Check MCP Status**: The sidebar shows connection status for all servers

## Future Enhancements

- Voice command support
- Custom chart templates
- Saved queries and dashboards
- Real-time data streaming
- Mobile-optimized interface
- Advanced AI reasoning with GPT-4/Claude integration
