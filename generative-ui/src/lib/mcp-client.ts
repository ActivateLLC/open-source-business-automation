/**
 * MCP (Model Context Protocol) Client
 * Connects the Generative UI to various data sources via MCP servers
 */

import { MCPServer, MCPTool, DashboardMetrics, Lead, Invoice, Customer, ContentItem } from '@/types';

// MCP Server configurations (for reference - used via API routes)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _MCP_SERVERS = {
  database: {
    name: 'Database MCP',
    description: 'Queries PostgreSQL database for leads, customers, invoices, and content',
    endpoint: '/api/mcp/database',
  },
  n8n: {
    name: 'n8n Workflow MCP',
    description: 'Triggers and monitors n8n workflows',
    endpoint: '/api/mcp/n8n',
  },
  kafka: {
    name: 'Kafka Events MCP',
    description: 'Reads and processes Kafka event streams',
    endpoint: '/api/mcp/kafka',
  },
  ollama: {
    name: 'Ollama AI MCP',
    description: 'AI-powered analysis and generation using local LLM',
    endpoint: '/api/mcp/ollama',
  },
};

/**
 * MCPClient class provides methods to interact with MCP servers
 */
export class MCPClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get all available MCP servers and their status
   */
  async getServers(): Promise<MCPServer[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/mcp/status`);
      if (!response.ok) throw new Error('Failed to fetch MCP servers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching MCP servers:', error);
      return [];
    }
  }

  /**
   * Get available tools from a specific MCP server
   */
  async getTools(serverName: string): Promise<MCPTool[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/mcp/${serverName}/tools`);
      if (!response.ok) throw new Error(`Failed to fetch tools for ${serverName}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching tools for ${serverName}:`, error);
      return [];
    }
  }

  /**
   * Execute a tool on an MCP server
   */
  async executeTool(serverName: string, toolName: string, params: Record<string, unknown>): Promise<unknown> {
    try {
      const response = await fetch(`${this.baseUrl}/api/mcp/${serverName}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolName, params }),
      });
      if (!response.ok) throw new Error(`Failed to execute tool ${toolName}`);
      return await response.json();
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      throw error;
    }
  }

  // Database MCP methods
  async getLeads(filters?: { tier?: string; status?: string; limit?: number }): Promise<Lead[]> {
    const response = await fetch(`${this.baseUrl}/api/mcp/database/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters || {}),
    });
    if (!response.ok) throw new Error('Failed to fetch leads');
    const data = await response.json();
    return data.leads || [];
  }

  async getCustomers(filters?: { status?: string; limit?: number }): Promise<Customer[]> {
    const response = await fetch(`${this.baseUrl}/api/mcp/database/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters || {}),
    });
    if (!response.ok) throw new Error('Failed to fetch customers');
    const data = await response.json();
    return data.customers || [];
  }

  async getInvoices(filters?: { status?: string; paymentStatus?: string; limit?: number }): Promise<Invoice[]> {
    const response = await fetch(`${this.baseUrl}/api/mcp/database/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters || {}),
    });
    if (!response.ok) throw new Error('Failed to fetch invoices');
    const data = await response.json();
    return data.invoices || [];
  }

  async getContent(filters?: { status?: string; contentType?: string; limit?: number }): Promise<ContentItem[]> {
    const response = await fetch(`${this.baseUrl}/api/mcp/database/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters || {}),
    });
    if (!response.ok) throw new Error('Failed to fetch content');
    const data = await response.json();
    return data.content || [];
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await fetch(`${this.baseUrl}/api/mcp/database/metrics`);
    if (!response.ok) throw new Error('Failed to fetch dashboard metrics');
    return await response.json();
  }

  // n8n Workflow MCP methods
  async triggerWorkflow(workflowId: string, data?: Record<string, unknown>): Promise<{ executionId: string }> {
    const response = await fetch(`${this.baseUrl}/api/mcp/n8n/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId, data }),
    });
    if (!response.ok) throw new Error('Failed to trigger workflow');
    return await response.json();
  }

  async getWorkflowStatus(executionId: string): Promise<{ status: string; result?: unknown }> {
    const response = await fetch(`${this.baseUrl}/api/mcp/n8n/status/${executionId}`);
    if (!response.ok) throw new Error('Failed to get workflow status');
    return await response.json();
  }

  // Kafka MCP methods
  async getRecentEvents(topic?: string, limit?: number): Promise<unknown[]> {
    const response = await fetch(`${this.baseUrl}/api/mcp/kafka/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, limit: limit || 50 }),
    });
    if (!response.ok) throw new Error('Failed to fetch Kafka events');
    const data = await response.json();
    return data.events || [];
  }

  // Ollama AI MCP methods
  async generateInsight(query: string, context?: Record<string, unknown>): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/mcp/ollama/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context }),
    });
    if (!response.ok) throw new Error('Failed to generate insight');
    const data = await response.json();
    return data.response || '';
  }

  async analyzeData(data: unknown, analysisType: string): Promise<{ analysis: string; recommendations: string[] }> {
    const response = await fetch(`${this.baseUrl}/api/mcp/ollama/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, analysisType }),
    });
    if (!response.ok) throw new Error('Failed to analyze data');
    return await response.json();
  }
}

// Export singleton instance
export const mcpClient = new MCPClient();
