-- Database initialization script for Open Source Business Automation Stack
-- Creates databases and tables for leads, invoices, content, and audit trails

-- Create additional databases
CREATE DATABASE IF NOT EXISTS nocobase;
CREATE DATABASE IF NOT EXISTS metabase;

-- Switch to n8n database for business data
\c n8n;

-- ============================================================
-- LEADS MANAGEMENT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    job_title VARCHAR(255),
    industry VARCHAR(100),
    company_size INTEGER,
    source VARCHAR(100),
    tier VARCHAR(20) DEFAULT 'cold',
    score INTEGER DEFAULT 0,
    ai_score DECIMAL(5,2),
    ai_score_reasoning TEXT,
    assigned_to VARCHAR(255),
    status VARCHAR(50) DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    converted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_leads_tier ON leads(tier);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);

-- ============================================================
-- CUSTOMERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    company VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    status VARCHAR(50) DEFAULT 'active',
    lifetime_value DECIMAL(15,2) DEFAULT 0,
    total_invoices INTEGER DEFAULT 0,
    total_paid DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_status ON customers(status);

-- ============================================================
-- INVOICES & PAYMENTS TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    vendor VARCHAR(255),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    paid_amount DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id),
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50),
    reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

-- ============================================================
-- CONTENT MANAGEMENT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS content_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content_type VARCHAR(50) DEFAULT 'article',
    topic VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    body TEXT,
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_model VARCHAR(100),
    keywords TEXT[],
    target_platforms TEXT[],
    scheduled_publish_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    author VARCHAR(255),
    views INTEGER DEFAULT 0,
    engagement_score DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_items_status ON content_items(status);
CREATE INDEX idx_content_items_content_type ON content_items(content_type);
CREATE INDEX idx_content_items_scheduled_publish_at ON content_items(scheduled_publish_at);

CREATE TABLE IF NOT EXISTS content_distribution (
    id SERIAL PRIMARY KEY,
    content_id INTEGER REFERENCES content_items(id),
    platform VARCHAR(100) NOT NULL,
    platform_post_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_distribution_content_id ON content_distribution(content_id);
CREATE INDEX idx_content_distribution_status ON content_distribution(status);
CREATE INDEX idx_content_distribution_platform ON content_distribution(platform);

-- ============================================================
-- AI ASSISTANT TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS ai_conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES ai_conversations(id),
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);

-- ============================================================
-- AUDIT TRAIL TABLE (Kafka Event Log Mirror)
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_trail (
    id SERIAL PRIMARY KEY,
    event_id VARCHAR(100) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_source VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    user_id VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB,
    kafka_topic VARCHAR(100),
    kafka_partition INTEGER,
    kafka_offset BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_trail_event_type ON audit_trail(event_type);
CREATE INDEX idx_audit_trail_entity_type ON audit_trail(entity_type);
CREATE INDEX idx_audit_trail_entity_id ON audit_trail(entity_id);
CREATE INDEX idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX idx_audit_trail_created_at ON audit_trail(created_at);

-- ============================================================
-- DASHBOARD METRICS TABLE (for real-time dashboards)
-- ============================================================

CREATE TABLE IF NOT EXISTS dashboard_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(20,4),
    metric_type VARCHAR(50),
    dimensions JSONB,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dashboard_metrics_name ON dashboard_metrics(metric_name);
CREATE INDEX idx_dashboard_metrics_period ON dashboard_metrics(period_start, period_end);

-- ============================================================
-- VIEWS FOR DASHBOARDS
-- ============================================================

-- Lead Pipeline Summary View
CREATE OR REPLACE VIEW v_lead_pipeline AS
SELECT 
    tier,
    status,
    COUNT(*) as lead_count,
    AVG(score) as avg_score,
    AVG(ai_score) as avg_ai_score,
    DATE_TRUNC('day', created_at) as created_date
FROM leads
GROUP BY tier, status, DATE_TRUNC('day', created_at)
ORDER BY created_date DESC;

-- Invoice Summary View
CREATE OR REPLACE VIEW v_invoice_summary AS
SELECT 
    status,
    payment_status,
    COUNT(*) as invoice_count,
    SUM(total_amount) as total_amount,
    SUM(paid_amount) as total_paid,
    SUM(total_amount - paid_amount) as outstanding_amount,
    DATE_TRUNC('month', issue_date) as invoice_month
FROM invoices
GROUP BY status, payment_status, DATE_TRUNC('month', issue_date)
ORDER BY invoice_month DESC;

-- Content Performance View
CREATE OR REPLACE VIEW v_content_performance AS
SELECT 
    ci.content_type,
    ci.status,
    ci.ai_generated,
    COUNT(DISTINCT ci.id) as content_count,
    AVG(ci.views) as avg_views,
    AVG(ci.engagement_score) as avg_engagement,
    COUNT(DISTINCT cd.id) as distribution_count,
    DATE_TRUNC('week', ci.created_at) as created_week
FROM content_items ci
LEFT JOIN content_distribution cd ON ci.id = cd.content_id
GROUP BY ci.content_type, ci.status, ci.ai_generated, DATE_TRUNC('week', ci.created_at)
ORDER BY created_week DESC;

-- Daily Activity View for Audit Trail
CREATE OR REPLACE VIEW v_daily_activity AS
SELECT 
    event_type,
    entity_type,
    action,
    COUNT(*) as event_count,
    DATE_TRUNC('day', created_at) as event_date
FROM audit_trail
GROUP BY event_type, entity_type, action, DATE_TRUNC('day', created_at)
ORDER BY event_date DESC;
