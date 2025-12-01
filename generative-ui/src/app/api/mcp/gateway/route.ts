/**
 * MCP Gateway API Route
 * 
 * Provides Server-Sent Events (SSE) for real-time MCP server communication.
 * Browsers cannot directly connect to MCP servers (which use stdio or local pipes),
 * so this Node.js gateway acts as the "Client Host" and exposes connections via SSE.
 */

import { NextRequest } from 'next/server';

// Simulated MCP connection state
interface MCPConnectionState {
  servers: Map<string, {
    name: string;
    status: 'connected' | 'disconnected' | 'connecting';
    tools: MCPTool[];
    lastHeartbeat: number;
  }>;
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: object;
}

// Global connection state (in production, use Redis or similar)
const connectionState: MCPConnectionState = {
  servers: new Map([
    ['database', {
      name: 'Database MCP',
      status: 'connected',
      tools: [
        { name: 'get_leads', description: 'Fetch leads from database', inputSchema: { type: 'object', properties: { tier: { type: 'string' }, limit: { type: 'number' } } } },
        { name: 'get_customers', description: 'Fetch customers from database', inputSchema: { type: 'object', properties: { status: { type: 'string' } } } },
        { name: 'get_invoices', description: 'Fetch invoices from database', inputSchema: { type: 'object', properties: { paymentStatus: { type: 'string' } } } },
        { name: 'get_dashboard_metrics', description: 'Get aggregated dashboard metrics', inputSchema: { type: 'object', properties: {} } },
      ],
      lastHeartbeat: Date.now(),
    }],
    ['ollama', {
      name: 'Ollama AI MCP',
      status: 'connected',
      tools: [
        { name: 'generate_insight', description: 'Generate AI-powered insight', inputSchema: { type: 'object', properties: { query: { type: 'string' }, context: { type: 'object' } }, required: ['query'] } },
        { name: 'analyze_data', description: 'Analyze data with AI', inputSchema: { type: 'object', properties: { data: { type: 'object' }, analysisType: { type: 'string' } }, required: ['data'] } },
        { name: 'generate_chart', description: 'Generate chart configuration based on data and request', inputSchema: { type: 'object', properties: { data: { type: 'array' }, chartType: { type: 'string', enum: ['bar', 'line', 'pie', 'area'] }, title: { type: 'string' }, color: { type: 'string' } } } },
      ],
      lastHeartbeat: Date.now(),
    }],
    ['n8n', {
      name: 'n8n Workflow MCP',
      status: 'connected',
      tools: [
        { name: 'trigger_workflow', description: 'Trigger an n8n workflow', inputSchema: { type: 'object', properties: { workflowId: { type: 'string' }, data: { type: 'object' } }, required: ['workflowId'] } },
        { name: 'get_workflow_status', description: 'Get status of workflow execution', inputSchema: { type: 'object', properties: { executionId: { type: 'string' } }, required: ['executionId'] } },
      ],
      lastHeartbeat: Date.now(),
    }],
    ['kafka', {
      name: 'Kafka Events MCP',
      status: 'connected',
      tools: [
        { name: 'get_recent_events', description: 'Get recent events from Kafka', inputSchema: { type: 'object', properties: { topic: { type: 'string' }, limit: { type: 'number' } } } },
        { name: 'publish_event', description: 'Publish event to Kafka topic', inputSchema: { type: 'object', properties: { topic: { type: 'string' }, event: { type: 'object' } }, required: ['topic', 'event'] } },
      ],
      lastHeartbeat: Date.now(),
    }],
  ]),
};

/**
 * GET - Server-Sent Events stream for MCP gateway
 * Provides real-time updates on MCP server status, tool discovery, and results
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'stream';

  // For status checks, return JSON
  if (action === 'status') {
    const servers = Array.from(connectionState.servers.entries()).map(([id, server]) => ({
      id,
      ...server,
      tools: server.tools.map(t => ({ name: t.name, description: t.description })),
    }));
    
    return new Response(JSON.stringify({
      success: true,
      servers,
      totalConnected: servers.filter(s => s.status === 'connected').length,
      timestamp: new Date().toISOString(),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // For tools discovery
  if (action === 'tools') {
    const serverId = searchParams.get('server');
    if (serverId && connectionState.servers.has(serverId)) {
      const server = connectionState.servers.get(serverId)!;
      return new Response(JSON.stringify({
        success: true,
        server: serverId,
        tools: server.tools,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Return all tools from all servers
    const allTools = Array.from(connectionState.servers.entries()).flatMap(([serverId, server]) => 
      server.tools.map(tool => ({ ...tool, server: serverId }))
    );
    
    return new Response(JSON.stringify({
      success: true,
      tools: allTools,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // SSE stream for real-time updates
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection status
      const initialData = {
        type: 'connection',
        servers: Array.from(connectionState.servers.entries()).map(([id, server]) => ({
          id,
          name: server.name,
          status: server.status,
          toolCount: server.tools.length,
        })),
        timestamp: new Date().toISOString(),
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));

      // Heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = {
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(heartbeat)}\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * POST - Execute MCP tool
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { server, tool, params } = body;

    if (!server || !tool) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Server and tool are required',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const serverState = connectionState.servers.get(server);
    if (!serverState) {
      return new Response(JSON.stringify({
        success: false,
        error: `Server ${server} not found`,
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (serverState.status !== 'connected') {
      return new Response(JSON.stringify({
        success: false,
        error: `Server ${server} is not connected`,
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Execute the tool (mock implementation - in production, this calls actual MCP servers)
    const result = await executeMCPTool(server, tool, params || {});

    return new Response(JSON.stringify({
      success: true,
      server,
      tool,
      result,
      timestamp: new Date().toISOString(),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Execute MCP tool (mock implementation)
 * In production, this would connect to actual MCP servers via stdio or HTTP
 */
async function executeMCPTool(server: string, tool: string, params: Record<string, unknown>): Promise<unknown> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Mock tool implementations
  if (server === 'ollama' && tool === 'generate_chart') {
    const { data, chartType = 'bar', title = 'Chart', color = '#0ea5e9' } = params as {
      data?: Array<{ label: string; value: number }>;
      chartType?: string;
      title?: string;
      color?: string;
    };
    
    return {
      type: chartType,
      title,
      data: data || [
        { name: 'Category A', value: 400 },
        { name: 'Category B', value: 300 },
        { name: 'Category C', value: 200 },
        { name: 'Category D', value: 100 },
      ],
      config: {
        color,
        animated: true,
      },
    };
  }

  if (server === 'database' && tool === 'get_dashboard_metrics') {
    return {
      leads: { total: 127, hot: 15, warm: 45, cold: 67, avgScore: 42.5 },
      revenue: { total: 245000, paid: 198000, outstanding: 47000 },
      customers: { total: 89, active: 72, avgLTV: 4250 },
      content: { total: 45, published: 38, aiGenerated: 22 },
    };
  }

  if (server === 'database' && tool === 'get_leads') {
    const { tier, limit = 10 } = params as { tier?: string; limit?: number };
    const leads = [
      { id: 1, name: 'John Smith', company: 'Acme Corp', tier: 'hot', score: 85 },
      { id: 2, name: 'Jane Doe', company: 'Startup.io', tier: 'warm', score: 62 },
      { id: 3, name: 'Bob Wilson', company: 'Enterprise Inc', tier: 'hot', score: 92 },
    ];
    return {
      leads: tier ? leads.filter(l => l.tier === tier).slice(0, limit) : leads.slice(0, limit),
      total: leads.length,
    };
  }

  if (server === 'ollama' && tool === 'generate_insight') {
    const { query } = params as { query: string };
    return {
      insight: `Based on your query "${query}", here are the key insights: Strong performance in lead conversion with 12.5% rate, revenue trending 22% above target.`,
      confidence: 0.85,
    };
  }

  // Default response for unknown tools
  return {
    message: `Tool ${tool} executed successfully`,
    params,
  };
}
