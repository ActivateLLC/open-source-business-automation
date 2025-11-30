# Lead Management Workflow - Activepieces

This document describes how to set up and use the Activepieces-based lead management workflow for automated lead scoring and routing.

## Overview

The Lead Management workflow in Activepieces provides:

1. **Lead Capture** - Webhook endpoint to receive leads from web forms
2. **Lead Scoring** - Automatic scoring based on configurable criteria
3. **Lead Routing** - Route leads to appropriate team members
4. **CRM Integration** - Sync qualified leads to your CRM
5. **Notifications** - Alert sales team about hot leads

## Why Activepieces for Lead Management

- **MIT License**: Completely free and open source with no restrictions
- **No-Code Interface**: Marketing and sales teams can modify workflows without engineering help
- **Clean UI**: Intuitive drag-and-drop interface
- **API-Friendly**: Easy to extend with custom pieces
- **Self-Hosted**: Full data ownership and privacy

## Quick Start

### 1. Access Activepieces

```
URL: http://localhost:8080
```

Create your admin account on first access.

### 2. Import the Workflow

1. Go to **Flows** in the sidebar
2. Click **New Flow**
3. Click **Import** and select `workflows/activepieces/lead-management.json`
4. Save the flow

### 3. Configure Connections

Set up the required connections:

1. **Webhook** - Automatically configured
2. **Email** (SMTP or SendGrid)
3. **CRM** (HubSpot, Salesforce, Pipedrive, etc.)
4. **Slack/Teams** for notifications

## Workflow Components

### Lead Capture Webhook

Endpoint: `http://localhost:8080/api/v1/webhooks/{flow_id}`

**Expected Payload:**
```json
{
  "name": "John Doe",
  "email": "john@company.com",
  "phone": "+1-555-123-4567",
  "company": "Acme Corp",
  "jobTitle": "VP of Sales",
  "industry": "Technology",
  "companySize": "100-500",
  "source": "website",
  "message": "Interested in enterprise plan"
}
```

### Lead Scoring Logic

Leads are scored on a 0-100 point scale:

| Criteria | Points |
|----------|--------|
| Has email | +10 |
| Has phone | +10 |
| Has company name | +15 |
| Has job title | +10 |
| Source: referral | +25 |
| Source: organic search | +15 |
| Source: paid search | +10 |
| High-value industry | +20 |
| Company size > 1000 | +25 |
| Company size 100-1000 | +15 |
| Company size 10-100 | +5 |

### Lead Tiers

Based on the score, leads are categorized:

| Tier | Score Range | Action |
|------|-------------|--------|
| Hot | 50+ | Immediate sales follow-up, Slack notification |
| Warm | 30-49 | Add to nurture sequence, email follow-up |
| Cold | 0-29 | Add to general newsletter |

### Lead Routing Rules

```
Hot Leads:
  → Notify sales team immediately via Slack
  → Create high-priority CRM record
  → Send immediate acknowledgment email

Warm Leads:
  → Add to nurture email sequence
  → Create standard CRM record
  → Schedule follow-up task for 24 hours

Cold Leads:
  → Add to marketing newsletter
  → Create basic CRM record
  → No immediate follow-up
```

## Setting Up the Workflow

### Step 1: Create the Flow

1. Click **New Flow** in Activepieces
2. Name it "Lead Management System"

### Step 2: Add Webhook Trigger

1. Search for **Webhook** trigger
2. Copy the generated webhook URL
3. Configure your web forms to POST to this URL

### Step 3: Add Lead Processing

1. Add a **Code** piece with the scoring logic
2. Use this template:

```javascript
// Lead Scoring Logic
const lead = inputs.body;

let score = 0;

// Completeness scoring
if (lead.email) score += 10;
if (lead.phone) score += 10;
if (lead.company) score += 15;
if (lead.jobTitle) score += 10;

// Source scoring
const sourceScores = {
  'referral': 25,
  'organic_search': 15,
  'paid_search': 10,
  'social': 5,
  'website': 5
};
score += sourceScores[lead.source] || 0;

// Industry scoring
const highValueIndustries = ['technology', 'finance', 'healthcare', 'manufacturing'];
if (lead.industry && highValueIndustries.includes(lead.industry.toLowerCase())) {
  score += 20;
}

// Company size scoring
const size = parseInt(lead.companySize) || 0;
if (size > 1000) score += 25;
else if (size > 100) score += 15;
else if (size > 10) score += 5;

// Determine tier
let tier = 'cold';
if (score >= 50) tier = 'hot';
else if (score >= 30) tier = 'warm';

return {
  ...lead,
  score,
  tier,
  processedAt: new Date().toISOString()
};
```

### Step 4: Add Branching Logic

1. Add a **Branch** piece
2. Configure three branches based on `tier`:
   - Hot: `tier equals "hot"`
   - Warm: `tier equals "warm"`  
   - Cold: `tier equals "cold"`

### Step 5: Add CRM Integration

For each branch, add appropriate CRM actions:

**HubSpot Example:**
1. Add **HubSpot** piece
2. Select **Create Contact**
3. Map fields from the lead data
4. Set appropriate lifecycle stage

### Step 6: Add Notifications

**Slack Notification for Hot Leads:**
1. Add **Slack** piece on the Hot branch
2. Select **Send Message**
3. Configure message template:

```
🔥 *New Hot Lead!*

*Name:* {{name}}
*Company:* {{company}}
*Email:* {{email}}
*Score:* {{score}}

{{message}}
```

### Step 7: Activate the Flow

1. Click **Publish** to activate
2. Test with sample data
3. Monitor executions in the **Runs** tab

## Testing the Workflow

Use curl to test the webhook:

```bash
curl -X POST http://localhost:8080/api/v1/webhooks/{your_flow_id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@techcorp.com",
    "phone": "+1-555-987-6543",
    "company": "TechCorp Inc",
    "jobTitle": "CTO",
    "industry": "Technology",
    "companySize": "500",
    "source": "referral",
    "message": "Looking for enterprise solution"
  }'
```

## Customization Options

### Modify Scoring Weights

Edit the scoring logic in the Code piece to adjust point values based on your business needs.

### Add Additional Integrations

Activepieces supports 100+ integrations including:
- CRMs: HubSpot, Salesforce, Pipedrive, Zoho
- Communication: Slack, Discord, Microsoft Teams
- Email: Gmail, SendGrid, Mailchimp
- Databases: PostgreSQL, MySQL, Airtable
- Custom: HTTP requests, webhooks

### Add Lead Enrichment

Integrate with data enrichment services:
1. Add **HTTP Request** piece after lead capture
2. Call enrichment API (Clearbit, Apollo, etc.)
3. Merge enriched data with lead record

## Monitoring and Analytics

### View Execution History

1. Go to **Runs** in the sidebar
2. Filter by flow or status
3. Click on any run to see details

### Export Lead Data

1. Use Metabase to query the leads database
2. Create dashboards for lead metrics
3. Set up automated reports

### Key Metrics to Track

- Total leads captured per day/week/month
- Lead score distribution
- Conversion rate by source
- Response time for hot leads
- Lead quality by channel

## Troubleshooting

### Webhook Not Receiving Data

1. Check the webhook URL is correct
2. Verify the flow is published
3. Check firewall settings
4. Review Activepieces logs: `docker-compose logs activepieces`

### Lead Not Scoring Correctly

1. Check the Code piece for errors
2. Verify field names match your form data
3. Test with console.log statements

### CRM Sync Failing

1. Verify CRM connection is active
2. Check field mappings
3. Verify API rate limits
4. Check CRM API credentials

## Best Practices

1. **Test thoroughly** before going live
2. **Monitor regularly** for failed executions
3. **Back up flows** by exporting to JSON
4. **Document customizations** for your team
5. **Use version control** for flow exports
6. **Set up alerts** for critical failures

## Support Resources

- [Activepieces Documentation](https://www.activepieces.com/docs)
- [Activepieces Community](https://community.activepieces.com)
- [GitHub Issues](https://github.com/activepieces/activepieces/issues)
