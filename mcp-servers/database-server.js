/**
 * Database MCP Server
 * Provides tools for querying PostgreSQL database via Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import pg from 'pg';
const { Pool } = pg;

// Database configuration from environment
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'n8n',
  user: process.env.POSTGRES_USER || 'n8n',
  password: process.env.POSTGRES_PASSWORD || 'n8n_password',
});

// Define available tools
const tools = [
  {
    name: 'get_leads',
    description: 'Fetch leads from the database with optional filters for tier, status, and limit',
    inputSchema: {
      type: 'object',
      properties: {
        tier: {
          type: 'string',
          enum: ['hot', 'warm', 'cold'],
          description: 'Filter by lead tier',
        },
        status: {
          type: 'string',
          description: 'Filter by lead status',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of leads to return',
          default: 50,
        },
      },
    },
  },
  {
    name: 'get_lead_stats',
    description: 'Get aggregated lead statistics including counts by tier and average scores',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_customers',
    description: 'Fetch customers from the database with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by customer status',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of customers to return',
          default: 50,
        },
      },
    },
  },
  {
    name: 'get_invoices',
    description: 'Fetch invoices from the database with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by invoice status',
        },
        paymentStatus: {
          type: 'string',
          enum: ['paid', 'pending', 'overdue'],
          description: 'Filter by payment status',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of invoices to return',
          default: 50,
        },
      },
    },
  },
  {
    name: 'get_financial_summary',
    description: 'Get a summary of financial metrics including revenue, outstanding amounts, and trends',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_content',
    description: 'Fetch content items from the database with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by content status',
        },
        contentType: {
          type: 'string',
          description: 'Filter by content type',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of content items to return',
          default: 50,
        },
      },
    },
  },
  {
    name: 'get_dashboard_metrics',
    description: 'Get all dashboard metrics in a single call for overview displays',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'execute_query',
    description: 'Execute a custom SQL query (read-only, SELECT statements only)',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'SQL SELECT query to execute',
        },
      },
      required: ['query'],
    },
  },
];

// Tool execution handlers
async function executeGetLeads(params) {
  let query = 'SELECT * FROM leads WHERE 1=1';
  const values = [];
  let paramIndex = 1;

  if (params.tier) {
    query += ` AND tier = $${paramIndex++}`;
    values.push(params.tier);
  }
  if (params.status) {
    query += ` AND status = $${paramIndex++}`;
    values.push(params.status);
  }
  query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
  values.push(params.limit || 50);

  const result = await pool.query(query, values);
  return { leads: result.rows, count: result.rowCount };
}

async function executeGetLeadStats() {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE tier = 'hot') as hot,
      COUNT(*) FILTER (WHERE tier = 'warm') as warm,
      COUNT(*) FILTER (WHERE tier = 'cold') as cold,
      AVG(score) as avg_score,
      AVG(ai_score) as avg_ai_score,
      COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as new_today
    FROM leads
  `;
  const result = await pool.query(query);
  return result.rows[0];
}

async function executeGetCustomers(params) {
  let query = 'SELECT * FROM customers WHERE 1=1';
  const values = [];
  let paramIndex = 1;

  if (params.status) {
    query += ` AND status = $${paramIndex++}`;
    values.push(params.status);
  }
  query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
  values.push(params.limit || 50);

  const result = await pool.query(query, values);
  return { customers: result.rows, count: result.rowCount };
}

async function executeGetInvoices(params) {
  let query = 'SELECT * FROM invoices WHERE 1=1';
  const values = [];
  let paramIndex = 1;

  if (params.status) {
    query += ` AND status = $${paramIndex++}`;
    values.push(params.status);
  }
  if (params.paymentStatus) {
    query += ` AND payment_status = $${paramIndex++}`;
    values.push(params.paymentStatus);
  }
  query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
  values.push(params.limit || 50);

  const result = await pool.query(query, values);
  return { invoices: result.rows, count: result.rowCount };
}

async function executeGetFinancialSummary() {
  const query = `
    SELECT 
      COUNT(*) as total_invoices,
      SUM(total_amount) as total_amount,
      SUM(paid_amount) as total_paid,
      SUM(total_amount - paid_amount) as outstanding,
      COUNT(*) FILTER (WHERE payment_status = 'unpaid' AND due_date < CURRENT_DATE) as overdue_count,
      SUM(CASE WHEN payment_status = 'unpaid' AND due_date < CURRENT_DATE THEN total_amount - paid_amount ELSE 0 END) as overdue_amount
    FROM invoices
  `;
  const result = await pool.query(query);
  return result.rows[0];
}

async function executeGetContent(params) {
  let query = 'SELECT * FROM content_items WHERE 1=1';
  const values = [];
  let paramIndex = 1;

  if (params.status) {
    query += ` AND status = $${paramIndex++}`;
    values.push(params.status);
  }
  if (params.contentType) {
    query += ` AND content_type = $${paramIndex++}`;
    values.push(params.contentType);
  }
  query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
  values.push(params.limit || 50);

  const result = await pool.query(query, values);
  return { content: result.rows, count: result.rowCount };
}

async function executeGetDashboardMetrics() {
  const [leadStats, financials, customerStats, contentStats] = await Promise.all([
    executeGetLeadStats(),
    executeGetFinancialSummary(),
    pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        AVG(lifetime_value) as avg_ltv,
        COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) as new_this_month
      FROM customers
    `),
    pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE ai_generated = true) as ai_generated,
        AVG(views) as avg_views
      FROM content_items
    `),
  ]);

  return {
    leads: leadStats,
    revenue: financials,
    customers: customerStats.rows[0],
    content: contentStats.rows[0],
    lastUpdated: new Date().toISOString(),
  };
}

async function executeCustomQuery(params) {
  // Security: Only allow SELECT queries
  const query = params.query.trim();
  if (!query.toLowerCase().startsWith('select')) {
    throw new Error('Only SELECT queries are allowed');
  }

  const result = await pool.query(query);
  return { rows: result.rows, count: result.rowCount };
}

// Create and run MCP server
async function main() {
  const server = new Server(
    {
      name: 'database-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle tool listing
  server.setRequestHandler('tools/list', async () => {
    return { tools };
  });

  // Handle tool execution
  server.setRequestHandler('tools/call', async (request) => {
    const { name, arguments: params } = request.params;

    try {
      let result;
      switch (name) {
        case 'get_leads':
          result = await executeGetLeads(params || {});
          break;
        case 'get_lead_stats':
          result = await executeGetLeadStats();
          break;
        case 'get_customers':
          result = await executeGetCustomers(params || {});
          break;
        case 'get_invoices':
          result = await executeGetInvoices(params || {});
          break;
        case 'get_financial_summary':
          result = await executeGetFinancialSummary();
          break;
        case 'get_content':
          result = await executeGetContent(params || {});
          break;
        case 'get_dashboard_metrics':
          result = await executeGetDashboardMetrics();
          break;
        case 'execute_query':
          result = await executeCustomQuery(params);
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Start server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Database MCP Server running on stdio');
}

main().catch(console.error);
