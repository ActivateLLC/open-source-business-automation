# Financial Operations Workflow

This workflow provides an automated system for managing invoices, tracking payments, and generating financial reports without the need for expensive accounting software.

## Overview

The Financial Operations Workflow:

1. Captures and processes incoming invoices via webhook
2. Manages invoice status and due dates
3. Tracks payments and updates invoice status
4. Generates daily financial summaries
5. Alerts about urgent (overdue or soon-due) invoices
6. Creates comprehensive monthly financial reports

![Financial Workflow](../images/finance-workflow.png)

## Features

- **Invoice Management**: Captures and processes invoice data from multiple sources
- **Payment Tracking**: Records and reconciles payments against invoices
- **Due Date Monitoring**: Automatically flags invoices that require urgent attention
- **Financial Reporting**: Generates daily summaries and monthly financial reports
- **Webhook Integration**: Sends notifications to external systems for critical events
- **File-based Storage**: Stores all financial data in JSON files, no external database required

## Setup Guide

### 1. Import the Workflow

1. In n8n, go to Workflows > Import From File
2. Select the `n8n-finance-automation.json` file
3. Save the workflow

### 2. Configure Webhook Endpoints

The "Webhook Configuration" node contains URLs that will be called when specific events occur:

1. Edit the "Webhook Configuration" node
2. Update the `accounting_webhook_url` and `approval_webhook_url` values to your desired endpoints
3. These could be Slack webhook URLs, your accounting system API endpoints, or other notification systems

### 3. Test the Workflow

Use these curl commands to test the workflow endpoints:

```bash
# Test invoice webhook
curl -X POST http://your-server-ip:5678/webhook/invoice-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_number": "INV-001",
    "vendor": "Office Supplies Co",
    "date": "2025-05-01",
    "due_date": "2025-05-31",
    "amount": 1250.50,
    "currency": "USD",
    "category": "Office Supplies"
  }'

# Test payment webhook
curl -X POST http://your-server-ip:5678/webhook/payment-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_number": "INV-001",
    "amount": 1250.50,
    "payment_date": "2025-05-15",
    "payment_method": "bank_transfer",
    "reference": "PMT-12345"
  }'
```

### 4. Activate the Cron Triggers

The workflow contains several time-based triggers:

1. **Daily Financial Check**: Runs daily to check for urgent invoices
2. **Monthly Financial Report**: Runs on the first day of each month
3. Review and adjust the schedule as needed for your financial processes

## Directory Structure

The workflow stores data in these locations:

- `/data/invoices.json`: Database of all invoices and their status
- `/data/financial_summaries/`: Directory for daily financial summaries
- `/data/financial_reports/`: Directory for monthly financial reports

## Financial Process Flow

1. **Invoice Capture**:
   - Invoices are received via the webhook endpoint
   - Invoice data is standardized and validated
   - Due dates are calculated and urgency flags are set
   - Invoice is stored in the invoice database

2. **Daily Financial Check**:
   - The daily cron job runs at a specified time
   - Current invoices are analyzed for outstanding amounts and due dates
   - A daily financial summary is generated
   - Urgent invoice notifications are sent if needed

3. **Payment Processing**:
   - Payments are received via the webhook endpoint
   - The corresponding invoice is located and updated
   - Payment details are recorded
   - The accounting system is notified

4. **Monthly Reporting**:
   - The monthly cron job runs on the first day of each month
   - A comprehensive financial report is generated
   - The report includes totals, category breakdowns, and trend analysis
   - The report is distributed to configured endpoints

## Integration Options

This workflow can be integrated with:

- Accounting software via webhooks
- Payment processing systems
- ERP systems
- Expense management tools
- Financial dashboards

## Customization Options

- Adjust invoice urgency thresholds in the "Process Invoice Data" node
- Modify financial report metrics in the "Generate Monthly Report" node
- Add custom categorization logic for invoices
- Implement vendor-specific processing rules
- Add approval workflows for invoices above certain thresholds