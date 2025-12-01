import { NextResponse } from 'next/server';

// MCP Server Status API
export async function GET() {
  const servers = [
    {
      name: 'database',
      description: 'PostgreSQL Database MCP - Queries leads, customers, invoices, and content',
      status: 'connected',
      tools: [
        { name: 'getLeads', description: 'Fetch leads with optional filters', parameters: [{ name: 'tier', type: 'string', required: false }] },
        { name: 'getCustomers', description: 'Fetch customer data', parameters: [] },
        { name: 'getInvoices', description: 'Fetch invoice data', parameters: [{ name: 'status', type: 'string', required: false }] },
        { name: 'getMetrics', description: 'Fetch aggregated business metrics', parameters: [] },
      ],
    },
    {
      name: 'n8n',
      description: 'n8n Workflow MCP - Triggers and monitors automation workflows',
      status: 'connected',
      tools: [
        { name: 'triggerWorkflow', description: 'Trigger a workflow by ID', parameters: [{ name: 'workflowId', type: 'string', required: true }] },
        { name: 'getWorkflowStatus', description: 'Get status of a workflow execution', parameters: [{ name: 'executionId', type: 'string', required: true }] },
        { name: 'listWorkflows', description: 'List all available workflows', parameters: [] },
      ],
    },
    {
      name: 'kafka',
      description: 'Kafka Events MCP - Reads and processes event streams',
      status: 'connected',
      tools: [
        { name: 'getRecentEvents', description: 'Fetch recent events from Kafka', parameters: [{ name: 'topic', type: 'string', required: false }] },
        { name: 'publishEvent', description: 'Publish an event to a topic', parameters: [{ name: 'topic', type: 'string', required: true }] },
      ],
    },
    {
      name: 'ollama',
      description: 'Ollama AI MCP - AI-powered analysis and generation',
      status: 'connected',
      tools: [
        { name: 'generateInsight', description: 'Generate AI insight from query', parameters: [{ name: 'query', type: 'string', required: true }] },
        { name: 'analyzeData', description: 'Analyze data with AI', parameters: [{ name: 'data', type: 'object', required: true }] },
        { name: 'scoreData', description: 'Score data using AI model', parameters: [{ name: 'data', type: 'object', required: true }] },
      ],
    },
  ];

  return NextResponse.json({
    success: true,
    servers,
    totalConnected: servers.filter(s => s.status === 'connected').length,
    totalServers: servers.length,
  });
}
