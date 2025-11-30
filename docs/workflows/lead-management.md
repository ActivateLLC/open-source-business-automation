# Lead Management Workflow

This workflow provides an AI-powered automated system for capturing, enriching, scoring, and managing leads through their entire lifecycle.

## Overview

The Lead Management System workflow:

1. Captures leads from multiple sources (webhooks, forms, integrations)
2. AI-powered scoring using vector embeddings
3. Intelligent routing based on rep performance and availability
4. Predictive analytics for conversion prediction
5. Automated enrichment from external data sources
6. Natural language search capabilities
7. Smart follow-ups with AI timing optimization

![Lead Management Workflow](../images/lead-workflow.png)

## Features

### Core Features
- **AI Lead Scoring**: Score leads using vector embeddings that analyze company websites, LinkedIn profiles, and historical data
- **Intelligent Routing**: Route leads based on rep performance, availability, expertise, and lead characteristics
- **Predictive Analytics**: ML models predict which leads will convert
- **Automated Enrichment**: Pull data from Clearbit, Hunter.io, Apollo, and other sources
- **Natural Language Search**: "Find all leads from fintech companies in SF"
- **Smart Follow-ups**: AI determines optimal contact timing based on engagement patterns

### Data Storage
- **PostgreSQL**: Structured lead data with full-text search
- **Qdrant**: Vector embeddings for semantic search and AI scoring
- **ClickHouse**: Analytics and reporting at scale

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Lead Sources                                           │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│    │ Website  │  │ LinkedIn │  │  Email   │  │  Events  │  │   API    │        │
│    │  Forms   │  │   Ads    │  │Campaigns │  │          │  │          │        │
│    └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
└─────────┼─────────────┼─────────────┼─────────────┼─────────────┼──────────────┘
          │             │             │             │             │
          └─────────────┴─────────────┴─────────────┴─────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Activepieces / Temporal                                │
│                       (Lead Capture & Processing)                                │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
           ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
           │ Data Cleanup  │   │  Enrichment   │   │ AI Scoring    │
           │ & Validation  │   │   (APIs)      │   │  (Qdrant)     │
           └───────────────┘   └───────────────┘   └───────────────┘
                    │                   │                   │
                    └───────────────────┼───────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Sales Agent (AI)                                       │
│         • Lead Qualification   • Smart Routing   • Follow-up Scheduling         │
└───────────────────────────────────────┬─────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
           ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
           │  Hot Leads    │   │  Warm Leads   │   │  Cold Leads   │
           │  → Immediate  │   │  → Nurture    │   │  → Long-term  │
           │    Contact    │   │    Campaign   │   │    Nurture    │
           └───────────────┘   └───────────────┘   └───────────────┘
```

## Database Schema

```sql
-- PostgreSQL for structured data
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  company TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_info JSONB,
  lead_score INTEGER,
  stage TEXT,
  tier TEXT,
  source TEXT,
  industry TEXT,
  company_size INTEGER,
  job_title TEXT,
  ai_insights JSONB,
  embedding_id TEXT,  -- Reference to Qdrant vector
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Qdrant for AI embeddings
-- Collection: leads
-- Store company descriptions, website content
-- Enable semantic search & similarity matching
```

## Setup Guide

### 1. Configure Lead Capture

#### Option A: Activepieces Webhook
1. Access Activepieces at `http://localhost:8080`
2. Create a new flow with a Webhook trigger
3. Configure the webhook URL for your lead sources

#### Option B: NocoBase Form
1. Access NocoBase at `http://localhost:13000`
2. Create a Lead collection with the required fields
3. Set up form views for lead capture

### 2. Configure Enrichment APIs

Add your API keys to the environment:

```bash
# Enrichment API Keys
CLEARBIT_API_KEY=your_clearbit_key
HUNTER_API_KEY=your_hunter_key
APOLLO_API_KEY=your_apollo_key
```

### 3. Configure AI Scoring

1. Ensure Qdrant is running and accessible
2. Initialize the leads collection:

```python
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance

client = QdrantClient(host="localhost", port=6333)
client.create_collection(
    collection_name="leads",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
)
```

3. Configure the Sales Agent in `data/ai_agents/config.yaml`

### 4. Test the Workflow

```bash
# Test lead capture webhook
curl -X POST http://localhost:8080/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "123-456-7890",
    "company": "ACME Corp",
    "jobTitle": "CEO",
    "industry": "Technology",
    "companySize": "50",
    "source": "referral"
  }'
```

## AI Lead Scoring Algorithm

The AI scoring system uses multiple factors:

### 1. Completeness Score (0-20 points)
- Email: +10 points
- Phone: +10 points

### 2. Profile Score (0-25 points)
- Company name: +10 points
- Job title: +10 points
- Industry: +5 points

### 3. Source Score (0-25 points)
- Referral: +25 points
- Organic search: +15 points
- Paid search: +10 points
- Other: +5 points

### 4. Industry Score (0-20 points)
- High-value industries (healthcare, finance, technology, manufacturing): +20 points
- Medium-value industries: +10 points
- Other: +5 points

### 5. Company Size Score (0-25 points)
- Enterprise (1000+): +25 points
- Mid-market (100-999): +15 points
- SMB (10-99): +5 points

### 6. AI Semantic Score (0-30 points)
Based on vector similarity to converted leads in Qdrant

### Tier Classification
- **Hot** (Score ≥ 70): Immediate follow-up required
- **Warm** (Score 40-69): Schedule follow-up within 24-48 hours
- **Cold** (Score < 40): Add to nurture campaign

## Intelligent Routing

The Sales Agent routes leads based on:

1. **Rep Expertise**: Match lead industry/size to rep specialization
2. **Rep Availability**: Check calendar and current workload
3. **Rep Performance**: Historical conversion rates for similar leads
4. **Geographic Match**: Time zone and language preferences
5. **Round-robin**: Fair distribution among equally qualified reps

## Natural Language Search

Query leads using natural language:

```
"Find all leads from fintech companies in San Francisco"
"Show me hot leads that haven't been contacted in 3 days"
"Who are the enterprise leads interested in our API product?"
```

The Sales Agent uses Qdrant's semantic search to understand and execute these queries.

## Smart Follow-ups

The AI determines optimal contact timing based on:

- Historical engagement patterns
- Industry-specific best times
- Lead's timezone
- Previous interaction outcomes
- Email open/click data

## Integration Options

### CRM Integration
- Salesforce via Activepieces connector
- HubSpot via API integration
- Custom CRM via webhooks

### Marketing Automation
- Mailchimp for email campaigns
- ActiveCampaign for nurture workflows
- Custom sequences via Temporal

### Communication
- Slack notifications for hot leads
- Email alerts for team assignments
- SMS notifications via Twilio

## Monitoring and Analytics

### Key Metrics (Available in Superset/Grafana)

- Lead volume by source
- Conversion rates by tier
- Average time to first contact
- AI scoring accuracy
- Rep performance metrics
- Pipeline velocity

### Sample Dashboard Query

```sql
SELECT 
    tier,
    COUNT(*) as lead_count,
    AVG(lead_score) as avg_score,
    COUNT(CASE WHEN stage = 'converted' THEN 1 END) as conversions
FROM leads
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY tier;
```

## Customization Options

- Adjust AI scoring weights in the agent configuration
- Modify lead categorization thresholds
- Add additional enrichment data sources
- Customize routing rules for your team structure
- Create custom notification templates