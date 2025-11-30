-- PostgreSQL Initialization Script
-- Creates databases for all services in the automation platform

-- Create databases for each service
CREATE DATABASE IF NOT EXISTS activepieces;
CREATE DATABASE IF NOT EXISTS n8n;
CREATE DATABASE IF NOT EXISTS metabase;
CREATE DATABASE IF NOT EXISTS superset;
CREATE DATABASE IF NOT EXISTS temporal;
CREATE DATABASE IF NOT EXISTS temporal_visibility;

-- Create extensions for better functionality
\c automation;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schemas for business modules
CREATE SCHEMA IF NOT EXISTS leads;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS ai_agents;

-- Lead Management Tables
CREATE TABLE IF NOT EXISTS leads.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    job_title VARCHAR(255),
    industry VARCHAR(100),
    company_size INTEGER,
    source VARCHAR(100),
    score INTEGER DEFAULT 0,
    tier VARCHAR(20) DEFAULT 'cold',
    status VARCHAR(50) DEFAULT 'new',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_tier ON leads.leads(tier);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads.leads(score);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads.leads(created_at);

-- Lead Activities
CREATE TABLE IF NOT EXISTS leads.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads.leads(id),
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON leads.activities(lead_id);

-- Content Management Tables
CREATE TABLE IF NOT EXISTS content.content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    body TEXT,
    metadata JSONB,
    author_id UUID,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_status ON content.content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_type ON content.content_items(content_type);

-- Content Ideas
CREATE TABLE IF NOT EXISTS content.ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    source VARCHAR(100),
    priority INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'new',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Operations Tables
CREATE TABLE IF NOT EXISTS finance.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    vendor VARCHAR(255),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    due_date DATE,
    paid_date DATE,
    category VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_status ON finance.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON finance.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_vendor ON finance.invoices(vendor);

-- Payments
CREATE TABLE IF NOT EXISTS finance.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES finance.invoices(id),
    amount DECIMAL(15, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(100),
    reference VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON finance.payments(invoice_id);

-- AI Agent Memory/Context
CREATE TABLE IF NOT EXISTS ai_agents.contexts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(100) NOT NULL,
    session_id UUID,
    context_type VARCHAR(50),
    content TEXT,
    embedding_id VARCHAR(255),  -- Reference to Qdrant vector
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contexts_agent_id ON ai_agents.contexts(agent_id);
CREATE INDEX IF NOT EXISTS idx_contexts_session_id ON ai_agents.contexts(session_id);

-- Events/Audit Log
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    actor_id UUID,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_entity ON public.events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA leads TO automation;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA content TO automation;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA finance TO automation;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ai_agents TO automation;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO automation;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA leads TO automation;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA content TO automation;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA finance TO automation;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA ai_agents TO automation;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO automation;
