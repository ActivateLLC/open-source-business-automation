/**
 * Ollama AI MCP Server
 * Provides AI-powered analysis and generation tools via Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://ollama:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama2';

// Define available tools
const tools = [
  {
    name: 'generate_insight',
    description: 'Generate an AI-powered insight or analysis from a natural language query',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The question or analysis request',
        },
        context: {
          type: 'object',
          description: 'Additional context data to include in the analysis',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'analyze_leads',
    description: 'Analyze lead data and provide scoring recommendations',
    inputSchema: {
      type: 'object',
      properties: {
        leads: {
          type: 'array',
          description: 'Array of lead objects to analyze',
        },
        focusArea: {
          type: 'string',
          enum: ['scoring', 'prioritization', 'segmentation', 'conversion'],
          description: 'The focus area for analysis',
        },
      },
      required: ['leads'],
    },
  },
  {
    name: 'analyze_revenue',
    description: 'Analyze revenue data and provide financial insights',
    inputSchema: {
      type: 'object',
      properties: {
        revenueData: {
          type: 'object',
          description: 'Revenue data object with metrics',
        },
        period: {
          type: 'string',
          description: 'Time period for analysis',
        },
      },
      required: ['revenueData'],
    },
  },
  {
    name: 'generate_content',
    description: 'Generate content like blog posts, social media updates, or reports',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'The topic for content generation',
        },
        contentType: {
          type: 'string',
          enum: ['blog', 'article', 'social', 'report', 'email'],
          description: 'The type of content to generate',
        },
        tone: {
          type: 'string',
          enum: ['professional', 'casual', 'technical', 'persuasive'],
          description: 'The tone of the content',
        },
        length: {
          type: 'string',
          enum: ['short', 'medium', 'long'],
          description: 'Desired content length',
        },
      },
      required: ['topic', 'contentType'],
    },
  },
  {
    name: 'score_lead',
    description: 'Score a single lead using AI analysis',
    inputSchema: {
      type: 'object',
      properties: {
        lead: {
          type: 'object',
          description: 'Lead data object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            company: { type: 'string' },
            jobTitle: { type: 'string' },
            industry: { type: 'string' },
            companySize: { type: 'number' },
            source: { type: 'string' },
          },
        },
      },
      required: ['lead'],
    },
  },
  {
    name: 'summarize_data',
    description: 'Create a natural language summary of business data',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Business data to summarize',
        },
        dataType: {
          type: 'string',
          enum: ['leads', 'revenue', 'customers', 'content', 'general'],
          description: 'Type of data being summarized',
        },
      },
      required: ['data', 'dataType'],
    },
  },
];

// Call Ollama API
async function callOllama(prompt, options = {}) {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 500,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Ollama API call failed:', error);
    throw error;
  }
}

// Tool execution handlers
async function executeGenerateInsight(params) {
  const { query, context } = params;
  
  let prompt = `You are a business intelligence AI assistant. Answer the following question clearly and concisely:\n\nQuestion: ${query}\n`;
  
  if (context) {
    prompt += `\nContext data:\n${JSON.stringify(context, null, 2)}\n`;
  }
  
  prompt += '\nProvide a helpful, data-driven response:';
  
  const response = await callOllama(prompt);
  return { insight: response, query };
}

async function executeAnalyzeLeads(params) {
  const { leads, focusArea = 'scoring' } = params;
  
  const prompt = `You are a sales intelligence AI. Analyze the following leads data and provide ${focusArea} recommendations.

Lead Data:
${JSON.stringify(leads, null, 2)}

Provide:
1. Key observations
2. Specific recommendations for ${focusArea}
3. Priority actions

Format your response in a clear, actionable way.`;

  const response = await callOllama(prompt);
  return { analysis: response, focusArea, leadsCount: leads.length };
}

async function executeAnalyzeRevenue(params) {
  const { revenueData, period = 'current' } = params;
  
  const prompt = `You are a financial analyst AI. Analyze the following revenue data and provide insights.

Revenue Data:
${JSON.stringify(revenueData, null, 2)}

Period: ${period}

Provide:
1. Financial health assessment
2. Key trends identified
3. Risk factors
4. Growth opportunities
5. Recommended actions

Be specific and actionable.`;

  const response = await callOllama(prompt);
  return { analysis: response, period };
}

async function executeGenerateContent(params) {
  const { topic, contentType, tone = 'professional', length = 'medium' } = params;
  
  const lengthGuide = {
    short: '100-200 words',
    medium: '300-500 words',
    long: '700-1000 words',
  };
  
  const prompt = `You are a professional content writer. Create a ${contentType} about "${topic}".

Requirements:
- Tone: ${tone}
- Length: ${lengthGuide[length]}
- Include a compelling headline/title
- Make it engaging and informative
- If it's for social media, include relevant hashtags

Write the content now:`;

  const response = await callOllama(prompt, { maxTokens: 1000 });
  return { content: response, topic, contentType, tone };
}

async function executeScoreLead(params) {
  const { lead } = params;
  
  const prompt = `You are a lead scoring AI. Analyze this lead and provide a score.

Lead Data:
${JSON.stringify(lead, null, 2)}

Provide your response in this exact JSON format:
{
  "score": <number 0-100>,
  "tier": "hot" | "warm" | "cold",
  "reasoning": "<brief explanation>",
  "recommendedAction": "<next step>",
  "assignedTeam": "sales" | "marketing" | "support"
}`;

  const response = await callOllama(prompt, { temperature: 0.3 });
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // If parsing fails, return a structured response
  }
  
  return { 
    score: 50, 
    tier: 'warm', 
    reasoning: response,
    recommendedAction: 'Manual review recommended',
    assignedTeam: 'marketing'
  };
}

async function executeSummarizeData(params) {
  const { data, dataType } = params;
  
  const prompt = `You are a business analyst AI. Create a concise, executive summary of this ${dataType} data.

Data:
${JSON.stringify(data, null, 2)}

Provide:
1. Key metrics at a glance
2. Notable trends or changes
3. Areas requiring attention
4. Brief recommendations

Keep it brief and suitable for a dashboard or quick briefing.`;

  const response = await callOllama(prompt, { maxTokens: 300 });
  return { summary: response, dataType };
}

// Create and run MCP server
async function main() {
  const server = new Server(
    {
      name: 'ollama-ai-mcp-server',
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
        case 'generate_insight':
          result = await executeGenerateInsight(params || {});
          break;
        case 'analyze_leads':
          result = await executeAnalyzeLeads(params || {});
          break;
        case 'analyze_revenue':
          result = await executeAnalyzeRevenue(params || {});
          break;
        case 'generate_content':
          result = await executeGenerateContent(params || {});
          break;
        case 'score_lead':
          result = await executeScoreLead(params || {});
          break;
        case 'summarize_data':
          result = await executeSummarizeData(params || {});
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
  console.error('Ollama AI MCP Server running on stdio');
}

main().catch(console.error);
