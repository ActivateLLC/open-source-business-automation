/**
 * Command Parser for Generative UI
 * Interprets natural language commands to generate charts, insights, and actions
 */

import { ChartData, InsightData } from '@/types';

export interface ParsedCommand {
  intent: 'chart' | 'insight' | 'query' | 'action' | 'help' | 'unknown';
  entity?: 'leads' | 'customers' | 'invoices' | 'content' | 'revenue' | 'general';
  chartType?: 'bar' | 'line' | 'pie' | 'doughnut' | 'area';
  timeframe?: 'today' | 'week' | 'month' | 'quarter' | 'year';
  filters?: Record<string, string>;
  action?: string;
  rawQuery: string;
}

// Command patterns for natural language parsing
const CHART_PATTERNS = [
  /(?:show|create|generate|make|display|draw)\s+(?:a\s+)?(\w+)\s+chart\s+(?:of|for|about|showing)?\s*(.+)/i,
  /(?:visualize|graph)\s+(.+)/i,
  /(?:chart|plot)\s+(?:the\s+)?(.+)/i,
  /what(?:'s| is)\s+(?:the\s+)?(.+)\s+(?:trend|distribution|breakdown)/i,
];

const INSIGHT_PATTERNS = [
  /(?:give me|show|what are|tell me)\s+(?:the\s+)?(?:key\s+)?insights?\s*(?:on|about|for)?\s*(.+)?/i,
  /analyze\s+(?:my\s+)?(.+)/i,
  /what(?:'s| is)\s+(?:happening|going on)\s+(?:with\s+)?(.+)?/i,
  /summary\s+(?:of\s+)?(.+)?/i,
];

const QUERY_PATTERNS = [
  /how many\s+(.+)/i,
  /what(?:'s| is)\s+(?:the\s+)?(?:total|average|sum|count)\s+(.+)/i,
  /show me\s+(?:all\s+)?(.+)/i,
  /list\s+(?:all\s+)?(.+)/i,
  /find\s+(.+)/i,
];

const ACTION_PATTERNS = [
  /(?:create|add|new)\s+(?:a\s+)?(.+)/i,
  /(?:send|trigger|run|execute)\s+(.+)/i,
  /(?:export|download)\s+(.+)/i,
];

const ENTITY_KEYWORDS: Record<string, string[]> = {
  leads: ['lead', 'leads', 'prospect', 'prospects', 'pipeline', 'hot', 'warm', 'cold'],
  customers: ['customer', 'customers', 'client', 'clients'],
  invoices: ['invoice', 'invoices', 'payment', 'payments', 'bill', 'bills', 'revenue'],
  content: ['content', 'article', 'articles', 'post', 'posts', 'blog'],
  revenue: ['revenue', 'money', 'income', 'sales', 'financial', 'finance'],
};

const CHART_TYPE_KEYWORDS: Record<string, string[]> = {
  bar: ['bar', 'bars', 'column', 'histogram'],
  line: ['line', 'trend', 'timeline', 'over time', 'progression'],
  pie: ['pie', 'distribution', 'breakdown', 'composition', 'percentage'],
  doughnut: ['doughnut', 'donut', 'ring'],
  area: ['area', 'filled', 'stacked'],
};

const TIMEFRAME_KEYWORDS: Record<string, string[]> = {
  today: ['today', 'now', 'current'],
  week: ['week', 'weekly', 'this week', 'past week', '7 days'],
  month: ['month', 'monthly', 'this month', 'past month', '30 days'],
  quarter: ['quarter', 'quarterly', 'q1', 'q2', 'q3', 'q4', '90 days'],
  year: ['year', 'yearly', 'annual', 'annually', 'this year', '12 months'],
};

/**
 * Parse a natural language command into structured data
 */
export function parseCommand(input: string): ParsedCommand {
  const normalizedInput = input.toLowerCase().trim();
  
  // Check for help command
  if (/^(?:help|what can you do|\?|commands?)$/i.test(normalizedInput)) {
    return { intent: 'help', rawQuery: input };
  }

  // Determine intent
  let intent: ParsedCommand['intent'] = 'unknown';

  for (const pattern of CHART_PATTERNS) {
    const match = normalizedInput.match(pattern);
    if (match) {
      intent = 'chart';
      break;
    }
  }

  if (intent === 'unknown') {
    for (const pattern of INSIGHT_PATTERNS) {
      const match = normalizedInput.match(pattern);
      if (match) {
        intent = 'insight';
        break;
      }
    }
  }

  if (intent === 'unknown') {
    for (const pattern of QUERY_PATTERNS) {
      const match = normalizedInput.match(pattern);
      if (match) {
        intent = 'query';
        break;
      }
    }
  }

  if (intent === 'unknown') {
    for (const pattern of ACTION_PATTERNS) {
      const match = normalizedInput.match(pattern);
      if (match) {
        intent = 'action';
        break;
      }
    }
  }

  // If no intent detected, treat as general query
  if (intent === 'unknown') {
    intent = 'query';
  }

  // Detect entity
  let entity: ParsedCommand['entity'] = 'general';
  for (const [key, keywords] of Object.entries(ENTITY_KEYWORDS)) {
    if (keywords.some(kw => normalizedInput.includes(kw))) {
      entity = key as ParsedCommand['entity'];
      break;
    }
  }

  // Detect chart type
  let chartType: ParsedCommand['chartType'];
  for (const [type, keywords] of Object.entries(CHART_TYPE_KEYWORDS)) {
    if (keywords.some(kw => normalizedInput.includes(kw))) {
      chartType = type as ParsedCommand['chartType'];
      break;
    }
  }
  // Default chart type based on entity
  if (intent === 'chart' && !chartType) {
    chartType = entity === 'leads' ? 'pie' : entity === 'revenue' ? 'line' : 'bar';
  }

  // Detect timeframe
  let timeframe: ParsedCommand['timeframe'];
  for (const [tf, keywords] of Object.entries(TIMEFRAME_KEYWORDS)) {
    if (keywords.some(kw => normalizedInput.includes(kw))) {
      timeframe = tf as ParsedCommand['timeframe'];
      break;
    }
  }

  return {
    intent,
    entity,
    chartType,
    timeframe,
    rawQuery: input,
  };
}

/**
 * Generate sample chart data based on parsed command
 */
export function generateChartData(command: ParsedCommand): ChartData {
  const { entity, chartType = 'bar', timeframe } = command;

  if (entity === 'leads') {
    if (chartType === 'pie' || chartType === 'doughnut') {
      return {
        type: chartType,
        title: 'Lead Distribution by Tier',
        labels: ['Hot Leads', 'Warm Leads', 'Cold Leads'],
        datasets: [{
          label: 'Leads',
          data: [15, 45, 40],
          backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6'],
          borderColor: ['#dc2626', '#d97706', '#2563eb'],
        }],
      };
    }
    return {
      type: 'bar',
      title: 'Lead Score Distribution',
      labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
      datasets: [{
        label: 'Number of Leads',
        data: [12, 28, 35, 22, 8],
        backgroundColor: '#0ea5e9',
        borderColor: '#0284c7',
      }],
    };
  }

  if (entity === 'revenue' || entity === 'invoices') {
    if (chartType === 'line' || chartType === 'area') {
      return {
        type: chartType,
        title: `Revenue Trend (${timeframe || 'Monthly'})`,
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue ($)',
          data: [45000, 52000, 48000, 61000, 55000, 67000],
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10b981',
          fill: chartType === 'area',
        }],
      };
    }
    return {
      type: 'bar',
      title: 'Invoice Status',
      labels: ['Paid', 'Pending', 'Overdue'],
      datasets: [{
        label: 'Amount ($)',
        data: [85000, 32000, 12000],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderColor: ['#059669', '#d97706', '#dc2626'],
      }],
    };
  }

  if (entity === 'customers') {
    return {
      type: chartType === 'pie' || chartType === 'doughnut' ? chartType : 'bar',
      title: 'Customer Segments',
      labels: ['Enterprise', 'Mid-Market', 'Small Business', 'Startup'],
      datasets: [{
        label: 'Customers',
        data: [15, 35, 40, 25],
        backgroundColor: ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4'],
        borderColor: ['#7c3aed', '#4f46e5', '#2563eb', '#0891b2'],
      }],
    };
  }

  if (entity === 'content') {
    return {
      type: chartType,
      title: 'Content Performance',
      labels: ['Blog Posts', 'Articles', 'Social', 'Email'],
      datasets: [{
        label: 'Views',
        data: [1250, 890, 2340, 560],
        backgroundColor: '#d946ef',
        borderColor: '#c026d3',
      }],
    };
  }

  // Default general chart
  return {
    type: 'bar',
    title: 'Business Overview',
    labels: ['Leads', 'Customers', 'Invoices', 'Content'],
    datasets: [{
      label: 'Count',
      data: [127, 45, 89, 34],
      backgroundColor: ['#0ea5e9', '#10b981', '#f59e0b', '#d946ef'],
      borderColor: ['#0284c7', '#059669', '#d97706', '#c026d3'],
    }],
  };
}

/**
 * Generate insights based on parsed command
 */
export function generateInsights(command: ParsedCommand): InsightData[] {
  const { entity } = command;

  const allInsights: Record<string, InsightData[]> = {
    leads: [
      {
        id: '1',
        type: 'hot',
        title: 'Hot Lead Alert',
        description: '3 new hot leads scored above 80 in the last hour. Immediate follow-up recommended.',
        metric: '+3 hot leads',
        change: { value: 42, direction: 'up', period: 'vs last week' },
        actionLabel: 'View Hot Leads',
        actionUrl: '/leads?tier=hot',
      },
      {
        id: '2',
        type: 'success',
        title: 'Conversion Rate Up',
        description: 'Lead-to-customer conversion rate increased to 12.5% this month.',
        change: { value: 18, direction: 'up', period: 'vs last month' },
      },
      {
        id: '3',
        type: 'warning',
        title: 'Cold Leads Growing',
        description: '45 leads have been cold for over 30 days. Consider re-engagement campaign.',
        actionLabel: 'Start Campaign',
        actionUrl: '/workflows/nurture',
      },
    ],
    revenue: [
      {
        id: '4',
        type: 'success',
        title: 'Revenue Target',
        description: 'On track to exceed monthly revenue target by 15%.',
        metric: '$67,000 / $60,000',
        change: { value: 15, direction: 'up', period: 'vs target' },
      },
      {
        id: '5',
        type: 'warning',
        title: 'Overdue Invoices',
        description: '8 invoices totaling $12,450 are past due. Collection action needed.',
        metric: '$12,450 overdue',
        actionLabel: 'View Overdue',
        actionUrl: '/invoices?status=overdue',
      },
    ],
    customers: [
      {
        id: '6',
        type: 'info',
        title: 'Customer Growth',
        description: '12 new customers acquired this month, LTV averaging $4,500.',
        metric: '+12 customers',
        change: { value: 8, direction: 'up', period: 'vs last month' },
      },
      {
        id: '7',
        type: 'success',
        title: 'Top Customer Activity',
        description: 'Enterprise accounts show 25% increase in engagement.',
        change: { value: 25, direction: 'up', period: 'this quarter' },
      },
    ],
    content: [
      {
        id: '8',
        type: 'success',
        title: 'AI Content Performing',
        description: 'AI-generated content has 32% higher engagement than manual content.',
        change: { value: 32, direction: 'up', period: 'vs manual' },
      },
      {
        id: '9',
        type: 'info',
        title: 'Publishing Schedule',
        description: '5 articles scheduled for publication this week.',
        metric: '5 scheduled',
      },
    ],
    general: [
      {
        id: '10',
        type: 'info',
        title: 'System Health',
        description: 'All automation workflows running smoothly. 847 events processed today.',
        metric: '847 events',
      },
    ],
  };

  if (entity && allInsights[entity]) {
    return allInsights[entity];
  }

  // Return mixed insights for general queries
  return [
    allInsights.leads[0],
    allInsights.revenue[0],
    allInsights.customers[0],
    allInsights.content[0],
  ];
}

/**
 * Get suggested quick actions based on context
 */
export function getSuggestedActions(command: ParsedCommand): string[] {
  const { entity } = command;

  const suggestions: Record<string, string[]> = {
    leads: [
      'Show lead pipeline chart',
      'Which leads should I follow up with?',
      'Create a hot lead report',
      'Analyze lead conversion rate',
    ],
    revenue: [
      'Show revenue trend this month',
      'What are the overdue invoices?',
      'Compare revenue vs last month',
      'Generate financial summary',
    ],
    customers: [
      'Show customer segment breakdown',
      'Who are my top customers?',
      'Analyze customer lifetime value',
      'List new customers this week',
    ],
    content: [
      'Show content performance chart',
      'What content is performing best?',
      'Generate new content ideas',
      'Schedule a new article',
    ],
    general: [
      'Give me today\'s business insights',
      'Show overall performance chart',
      'What needs my attention?',
      'Summary of this week',
    ],
  };

  return suggestions[entity || 'general'] || suggestions.general;
}

/**
 * Format help response
 */
export function getHelpResponse(): string {
  return `
## 🤖 I can help you with:

### 📊 Charts & Visualizations
- "Show a pie chart of leads by tier"
- "Create a revenue trend chart for this month"
- "Visualize customer segments"
- "Chart content performance"

### 💡 Insights & Analysis
- "Give me key insights on leads"
- "Analyze my revenue"
- "What's happening with customers?"
- "Summary of this week"

### 🔍 Queries
- "How many hot leads do we have?"
- "Show me all overdue invoices"
- "List top performing content"
- "Find customers from last month"

### ⚡ Quick Actions
- "Send a hot lead alert"
- "Create a new content campaign"
- "Export monthly report"

Just type naturally - I'll understand what you need!
  `.trim();
}
