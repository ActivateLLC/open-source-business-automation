-- Database Initialization Script for Open Source Business Automation Stack
-- This script creates the necessary tables for all services
-- Note: This script runs after PostgreSQL creates the default database (business_automation)
-- Additional databases (nocobase, activepieces, n8n, metabase) are created by their respective services

-- ========================================
-- LEAD MANAGEMENT MODULE
-- ========================================

-- Leads table with AI insights support
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_info JSONB DEFAULT '{}',
  lead_score INTEGER DEFAULT 0,
  stage TEXT DEFAULT 'new',
  tier TEXT DEFAULT 'cold',
  source TEXT,
  industry TEXT,
  company_size INTEGER,
  job_title TEXT,
  ai_insights JSONB DEFAULT '{}',
  embedding_id TEXT,  -- Reference to Qdrant vector
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

-- Lead activities table for tracking interactions
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead assignments table for intelligent routing
CREATE TABLE IF NOT EXISTS lead_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  assigned_to TEXT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason TEXT,
  is_active BOOLEAN DEFAULT true
);

-- ========================================
-- CONTENT & MARKETING AUTOMATION MODULE
-- ========================================

-- Content items table
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_type TEXT NOT NULL,  -- blog, social, email, etc.
  status TEXT DEFAULT 'draft',  -- draft, review, approved, published
  content_body TEXT,
  metadata JSONB DEFAULT '{}',
  seo_data JSONB DEFAULT '{}',
  ai_generated BOOLEAN DEFAULT false,
  embedding_id TEXT,  -- Reference to Qdrant vector
  scheduled_publish_at TIMESTAMP,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content distribution table
CREATE TABLE IF NOT EXISTS content_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,  -- linkedin, twitter, facebook, email, etc.
  status TEXT DEFAULT 'pending',
  scheduled_at TIMESTAMP,
  published_at TIMESTAMP,
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content calendar table
CREATE TABLE IF NOT EXISTS content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  planned_date DATE NOT NULL,
  time_slot TEXT,
  platform TEXT,
  notes TEXT,
  ai_recommendations JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- FINANCIAL OPERATIONS MODULE
-- ========================================

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  vendor TEXT,
  vendor_id UUID,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',  -- pending, approved, paid, overdue, disputed
  category TEXT,
  line_items JSONB DEFAULT '[]',
  ocr_extracted_data JSONB DEFAULT '{}',
  ai_categorization JSONB DEFAULT '{}',
  payment_terms TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  reference_number TEXT,
  status TEXT DEFAULT 'completed',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial transactions table for analytics
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL,  -- income, expense, transfer
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT,
  subcategory TEXT,
  description TEXT,
  reference_id UUID,  -- Can reference invoice, payment, or other entity
  reference_type TEXT,
  transaction_date DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  anomaly_score DECIMAL(5, 4),  -- AI-detected anomaly score
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_info JSONB DEFAULT '{}',
  payment_terms TEXT,
  rating INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- AI AGENT LAYER
-- ========================================

-- AI agent conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,  -- sales, content, finance, operations
  session_id TEXT NOT NULL,
  user_id TEXT,
  messages JSONB DEFAULT '[]',
  context JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);

-- AI agent actions table
CREATE TABLE IF NOT EXISTS ai_agent_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_data JSONB DEFAULT '{}',
  result JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  executed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge base entries for AI agents
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding_id TEXT,  -- Reference to Qdrant vector
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- WORKFLOW ORCHESTRATION
-- ========================================

-- Workflow executions tracking table
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id TEXT NOT NULL,
  workflow_name TEXT,
  trigger_type TEXT,  -- manual, scheduled, webhook, event
  trigger_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'running',  -- running, completed, failed, cancelled
  result JSONB DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Event bus events table (for Kafka event tracking)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_source TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  correlation_id TEXT,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_leads_tier ON leads(tier);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(contact_email);

CREATE INDEX IF NOT EXISTS idx_content_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_type ON content_items(content_type);
CREATE INDEX IF NOT EXISTS idx_content_scheduled ON content_items(scheduled_publish_at);

CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_vendor ON invoices(vendor);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON financial_transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON financial_transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_processed ON events(processed);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- ========================================
-- GRANTS
-- ========================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;
