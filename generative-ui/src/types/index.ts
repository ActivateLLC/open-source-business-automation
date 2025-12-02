// Business data types
export interface Lead {
  id: number;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  job_title?: string;
  industry?: string;
  company_size?: number;
  source?: string;
  tier: 'hot' | 'warm' | 'cold';
  score: number;
  ai_score?: number;
  ai_score_reasoning?: string;
  assigned_to?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  lead_id?: number;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  status: string;
  lifetime_value: number;
  total_invoices: number;
  total_paid: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  customer_id?: number;
  vendor?: string;
  issue_date: string;
  due_date: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  category?: string;
  status: string;
  payment_status: string;
  paid_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentItem {
  id: number;
  title: string;
  content_type: string;
  topic?: string;
  status: string;
  body?: string;
  ai_generated: boolean;
  ai_model?: string;
  keywords?: string[];
  target_platforms?: string[];
  scheduled_publish_at?: string;
  published_at?: string;
  author?: string;
  views: number;
  engagement_score: number;
  created_at: string;
  updated_at: string;
}

// Chat and AI types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  chartData?: ChartData;
  insightData?: InsightData[];
  isGenerating?: boolean;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'radar';
  title: string;
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  fill?: boolean;
}

export interface InsightData {
  id: string;
  type: 'hot' | 'success' | 'warning' | 'info';
  title: string;
  description: string;
  metric?: string;
  change?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
  actionLabel?: string;
  actionUrl?: string;
}

// Dashboard metrics types
export interface DashboardMetrics {
  leads: {
    total: number;
    hot: number;
    warm: number;
    cold: number;
    avgScore: number;
    newToday: number;
    converted: number;
  };
  revenue: {
    total: number;
    paid: number;
    outstanding: number;
    overdue: number;
    monthlyTrend: number[];
  };
  customers: {
    total: number;
    active: number;
    avgLTV: number;
    newThisMonth: number;
  };
  content: {
    total: number;
    published: number;
    aiGenerated: number;
    avgViews: number;
  };
}

// MCP Server types
export interface MCPServer {
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  tools: MCPTool[];
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: MCPToolParameter[];
}

export interface MCPToolParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ChatResponse {
  message: string;
  chartData?: ChartData;
  insights?: InsightData[];
  suggestedActions?: string[];
}

// Quick action types
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  command: string;
  category: 'leads' | 'finance' | 'content' | 'analytics';
}

// Export automation types
export * from './automation';
