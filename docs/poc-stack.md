# Proof of Concept Stack

This document describes the POC stack using one specialized tool per use case for optimal results.

## Stack Overview

| Use Case | Tool | License | Why This Tool |
|----------|------|---------|---------------|
| Lead Management & Sales | Activepieces | MIT | Free, no-code UI, API-friendly |
| Content Creation | Windmill | AGPL-3.0 | Developer-centric, AI capabilities, 20+ languages |
| Financial Operations | n8n | Fair-code | Most mature for finance, 350+ integrations |

## Quick Start

```bash
# Clone this repository
git clone https://github.com/ActivateLLC/open-source-business-automation.git
cd open-source-business-automation

# Start the POC stack
docker-compose -f docker-compose-poc.yml up -d

# Access the platforms
# Activepieces (Lead Management): http://localhost:8080
# Windmill (Content Creation): http://localhost:8000
# n8n (Financial Operations): http://localhost:5678
# Metabase (Analytics): http://localhost:3000
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              POC AUTOMATION STACK                                │
├────────────────────┬────────────────────┬───────────────────────────────────────┤
│                    │                    │                                       │
│   ACTIVEPIECES     │     WINDMILL       │            N8N                        │
│   Port: 8080       │     Port: 8000     │         Port: 5678                    │
│                    │                    │                                       │
│ ┌────────────────┐ │ ┌────────────────┐ │ ┌─────────────────────────────────┐   │
│ │ Lead Capture   │ │ │ Content Ideas  │ │ │ Invoice Email Extraction       │   │
│ │      ↓         │ │ │      ↓         │ │ │           ↓                    │   │
│ │ Lead Scoring   │ │ │ AI Writing     │ │ │ OCR/Data Extraction            │   │
│ │      ↓         │ │ │      ↓         │ │ │           ↓                    │   │
│ │ Lead Routing   │ │ │ Review Flow    │ │ │ Validation                     │   │
│ │      ↓         │ │ │      ↓         │ │ │           ↓                    │   │
│ │ CRM Sync       │ │ │ Distribution   │ │ │ Accounting Entry               │   │
│ └────────────────┘ │ └────────────────┘ │ │           ↓                    │   │
│                    │                    │ │ Payment Tracking & Reporting   │   │
│                    │                    │ └─────────────────────────────────┘   │
└────────────────────┴────────────────────┴───────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │          POSTGRESQL           │
                    │         Port: 5432            │
                    └───────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │          METABASE             │
                    │   Business Intelligence       │
                    │         Port: 3000            │
                    └───────────────────────────────┘
```

## Use Case 1: Lead Management & Sales Automation

### Tool: Activepieces

**Why Activepieces:**
- MIT-licensed, completely free and open for everyone
- Can be self-hosted with a clean and intuitive UI
- Requires no coding, making it accessible to non-engineers
- API-friendly for developers to extend

### POC Use Case: Automated Lead Scoring and Routing

**Workflow:**
1. **Capture leads from web forms** - Webhook triggers on form submission
2. **Score based on criteria** - Automatic scoring based on company size, industry, etc.
3. **Route to sales team** - Direct hot leads to senior reps, warm to junior reps
4. **Send to CRM** - Automatic sync with your CRM system

**Time to Deploy:** 1-2 days

**Quick Win:** Show 80% reduction in manual lead handling

### Getting Started

1. Access Activepieces at `http://localhost:8080`
2. Create an account and log in
3. Import the lead management workflow from `workflows/activepieces/`
4. Configure your CRM connections
5. Set up webhook endpoints for your web forms

See [Lead Management Workflow Documentation](workflows/poc-lead-management.md) for detailed setup.

---

## Use Case 2: Content Creation & Marketing Automation

### Tool: Windmill

**Why Windmill:**
- Developer-centric workflow automation platform
- AI Flow Chat and AI Fix capabilities
- Supports 20+ programming languages
- Used by 3,000+ organizations as of 2025

### POC Use Case: AI-Assisted Content Pipeline

**Workflow:**
1. **Content idea generation** - Pull trending topics from multiple sources
2. **AI writing assistance** - Generate drafts using LLM integration
3. **Review workflow** - Approval process with notifications
4. **Multi-channel distribution** - Publish to blog, social media, newsletter
5. **Performance tracking** - Monitor engagement and metrics

**Time to Deploy:** 2-3 days

**Quick Win:** Generate 10 blog posts/social posts in the time it normally takes to do 1

### Getting Started

1. Access Windmill at `http://localhost:8000`
2. Create an account and log in
3. Import the content automation workflow from `workflows/windmill/`
4. Configure your AI provider (OpenAI, Anthropic, etc.)
5. Set up publishing integrations

See [Content Automation Workflow Documentation](workflows/poc-content-automation.md) for detailed setup.

---

## Use Case 3: Financial Operations & Invoice Processing

### Tool: n8n

**Why n8n:**
- Most mature platform for financial workflows
- 350+ native integrations
- Excellent support for email parsing and OCR
- Strong community and documentation

### POC Use Case: Automated Invoice Processing

**Workflow:**
1. **Email attachment extraction** - Monitor inbox for invoice PDFs
2. **OCR/data extraction** - Parse invoice data automatically
3. **Validation** - Verify against PO and vendor records
4. **Entry to accounting system** - Create entries in QuickBooks, Xero, etc.
5. **Payment tracking** - Monitor payment status and due dates
6. **Reporting** - Generate financial summaries and alerts

**Time to Deploy:** 2-3 days

**Quick Win:** Process 100 invoices automatically vs. 5-10 hours of manual work

### Getting Started

1. Access n8n at `http://localhost:5678`
2. Create an account and log in
3. Import the finance workflow from `workflows/n8n/`
4. Configure email credentials
5. Set up accounting system integration

See [Financial Operations Workflow Documentation](workflows/poc-finance-automation.md) for detailed setup.

---

## Environment Variables

Create a `.env` file in the project root with these variables:

```bash
# Shared
POSTGRES_PASSWORD=your_secure_password_here

# Activepieces
ACTIVEPIECES_ENCRYPTION_KEY=32_character_encryption_key_here
ACTIVEPIECES_JWT_SECRET=your_jwt_secret_here

# n8n
N8N_ENCRYPTION_KEY=your_n8n_encryption_key_here
```

## Data Persistence

All data is persisted in Docker volumes and the `./data` directory:

- `./data/activepieces/` - Activepieces workflow data
- `./data/windmill/` - Windmill scripts and resources
- `./data/n8n/` - n8n workflow data
- `./data/metabase/` - Metabase configuration
- `postgres_data` volume - All database data

## Security Considerations

1. **Change default passwords** - Update all passwords in `.env` file
2. **Use HTTPS** - Set up a reverse proxy with SSL certificates
3. **Firewall** - Restrict access to necessary ports only
4. **Regular backups** - Back up the `./data` directory and database

See [Security Guide](security.md) for detailed security configurations.

## Comparison with Single-Tool Approach

| Aspect | Single Tool (n8n only) | POC Stack (3 tools) |
|--------|------------------------|---------------------|
| Licensing | Fair-code (restrictions) | Mixed (MIT, AGPL, Fair-code) |
| Non-technical users | Moderate learning curve | Activepieces is easiest |
| Developer experience | Good | Windmill is excellent |
| Financial workflows | Good | n8n is best in class |
| Resource usage | Lower | Higher (3 services) |
| Maintenance | Simpler | More complex |
| Specialization | Jack of all trades | Best tool per job |

## When to Use This Stack

**Use the POC Stack when:**
- You have different teams with different technical skills
- You need the best tool for each specific use case
- Licensing compliance is important (Activepieces is MIT)
- You want AI-native content workflows (Windmill)
- You have complex financial integrations (n8n)

**Use the Single-Tool approach when:**
- You want simplicity and lower maintenance
- Resources are limited
- A single team manages all automation
- n8n's capabilities are sufficient for all use cases

## Next Steps

1. Review the individual workflow documentation
2. Customize workflows for your specific needs
3. Set up integrations with your existing tools
4. Train your team on the appropriate platform
5. Monitor and optimize based on usage

## Support

- [Activepieces Documentation](https://www.activepieces.com/docs)
- [Windmill Documentation](https://www.windmill.dev/docs)
- [n8n Documentation](https://docs.n8n.io/)
- [Metabase Documentation](https://www.metabase.com/docs/)
