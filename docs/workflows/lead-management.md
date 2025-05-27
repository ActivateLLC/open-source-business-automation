# Lead Management Workflow

This workflow provides an automated system for capturing, enriching, scoring, and managing leads through their entire lifecycle.

## Overview

The Lead Management System workflow:

1. Captures leads from a webhook endpoint
2. Standardizes and enriches lead data
3. Scores leads based on customizable criteria
4. Routes leads to appropriate categories (hot, warm, cold)
5. Stores leads in a structured format
6. Generates regular lead summaries and reports

![Lead Management Workflow](../images/lead-workflow.png)

## Features

- **Lead Scoring Algorithm**: Automatically scores leads based on multiple criteria including industry, company size, source, and completeness of information
- **Data Standardization**: Automatically cleans and standardizes contact information
- **Categorization**: Sorts leads into hot, warm, and cold categories based on scores
- **File-based Storage**: Stores all lead data in JSON files, no external database required
- **Webhook Notifications**: Sends notifications about new leads to configurable endpoints
- **Regular Reporting**: Generates daily and monthly lead analysis reports

## Setup Guide

### 1. Import the Workflow

1. In n8n, go to Workflows > Import From File
2. Select the `n8n-free-lead-management.json` file
3. Save the workflow

### 2. Configure Webhook Endpoints

The "Webhook Configuration" node contains URLs that will be called when specific events occur:

1. Edit the "Webhook Configuration" node
2. Update the `hot_lead_webhook_url` and `warm_lead_webhook_url` values to your desired endpoints
3. These could be Slack webhook URLs, your CRM API endpoints, or other notification systems

### 3. Test the Workflow

Use this curl command to test the lead capture webhook:

```bash
curl -X POST http://your-server-ip:5678/webhook/lead-capture \
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

### 4. Customize the Scoring Logic

The lead scoring algorithm can be customized to match your business needs:

1. Edit the "Lead Enrichment" node
2. Modify the JavaScript code to adjust scoring weights for different criteria
3. Update the tier thresholds to match your lead qualification process

## Directory Structure

The workflow stores data in these locations:

- `/data/hot_leads.json`: Storage for high-scoring leads
- `/data/warm_leads.json`: Storage for medium-scoring leads  
- `/data/cold_leads.json`: Storage for low-scoring leads
- `/data/lead_summaries/`: Directory for daily and monthly lead reports

## Integration Options

This workflow can be integrated with:

- Email marketing platforms (via webhook nodes)
- CRM systems (via API nodes)
- Notification systems like Slack or Teams
- Custom applications via the webhook endpoint

## Customization Options

- Adjust scoring algorithm in the "Lead Enrichment" node
- Modify lead categorization thresholds in the "Lead Enrichment" node
- Add additional data enrichment services via HTTP Request nodes
- Implement more sophisticated lead routing based on industry, region, or other criteria