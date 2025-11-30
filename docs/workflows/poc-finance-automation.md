# Financial Operations Workflow - n8n

This document describes how to set up and use the n8n-based financial operations workflow for automated invoice processing and payment tracking.

## Overview

The Financial Operations workflow in n8n provides:

1. **Invoice Capture** - Extract invoices from email attachments
2. **OCR Processing** - Parse invoice data automatically
3. **Validation** - Verify against PO and vendor records
4. **Accounting Integration** - Sync with QuickBooks, Xero, etc.
5. **Payment Tracking** - Monitor payment status and due dates
6. **Reporting** - Generate financial summaries and alerts

## Why n8n for Financial Operations

- **Mature Platform**: Most battle-tested for financial workflows
- **350+ Integrations**: Native connections to accounting systems
- **Email Parsing**: Excellent support for attachment extraction
- **Error Handling**: Robust retry and error management
- **Community**: Large community with financial workflow examples

## Quick Start

### 1. Access n8n

```
URL: http://localhost:5678
```

Create your admin account on first access.

### 2. Import the Workflow

1. Go to **Workflows** in the sidebar
2. Click **Import from File**
3. Select `workflows/n8n/finance-automation.json`
4. Save and activate the workflow

### 3. Configure Credentials

Set up the required credentials:

1. **Email** (IMAP for monitoring, SMTP for sending)
2. **Accounting** (QuickBooks, Xero, or custom)
3. **OCR Service** (AWS Textract, Google Vision, etc.)
4. **Notifications** (Slack, Email, Teams)

## Workflow Components

### Invoice Email Monitor

**Trigger Configuration:**
- Type: Email Trigger (IMAP)
- Folder: INBOX
- Filter: Has attachments, subject contains "invoice"
- Check Interval: Every 5 minutes

```json
{
  "mailbox": "INBOX",
  "options": {
    "allowUnauthorizedCerts": false
  },
  "postReceiveAction": "markAsRead",
  "searchCriteria": {
    "and": [
      {"hasAttachment": true},
      {"subject": ["invoice", "inv", "bill"]}
    ]
  }
}
```

### OCR/Data Extraction

**Using AWS Textract:**
```javascript
// Extract invoice data from PDF
const extractInvoiceData = (textractResponse) => {
  const data = {
    invoiceNumber: null,
    vendor: null,
    date: null,
    dueDate: null,
    amount: null,
    lineItems: []
  };
  
  // Parse Textract response
  const blocks = textractResponse.Blocks;
  
  // Extract key-value pairs
  for (const block of blocks) {
    if (block.BlockType === 'KEY_VALUE_SET') {
      const key = getBlockText(block.Key);
      const value = getBlockText(block.Value);
      
      if (key.match(/invoice.*number|inv.*#/i)) {
        data.invoiceNumber = value;
      } else if (key.match(/vendor|supplier|from/i)) {
        data.vendor = value;
      } else if (key.match(/date/i) && !key.match(/due/i)) {
        data.date = parseDate(value);
      } else if (key.match(/due.*date|payment.*due/i)) {
        data.dueDate = parseDate(value);
      } else if (key.match(/total|amount.*due/i)) {
        data.amount = parseAmount(value);
      }
    }
  }
  
  return data;
};
```

### Invoice Validation

**Validation Rules:**
```javascript
// Validate extracted invoice data
const validateInvoice = (invoice) => {
  const errors = [];
  const warnings = [];
  
  // Required fields
  if (!invoice.invoiceNumber) {
    errors.push('Missing invoice number');
  }
  if (!invoice.vendor) {
    errors.push('Missing vendor information');
  }
  if (!invoice.amount || invoice.amount <= 0) {
    errors.push('Invalid or missing amount');
  }
  
  // Business rules
  if (invoice.amount > 10000) {
    warnings.push('High value invoice - requires manager approval');
  }
  
  // Duplicate check
  const existing = await checkDuplicate(invoice.invoiceNumber, invoice.vendor);
  if (existing) {
    errors.push('Duplicate invoice detected');
  }
  
  // Vendor validation
  const vendor = await lookupVendor(invoice.vendor);
  if (!vendor) {
    warnings.push('Unknown vendor - manual review required');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    requiresApproval: warnings.length > 0 || invoice.amount > 5000
  };
};
```

### Accounting System Integration

**QuickBooks Integration:**
```javascript
// Create bill in QuickBooks
const createQuickBooksBill = async (invoice, vendorId) => {
  const bill = {
    VendorRef: {
      value: vendorId
    },
    TxnDate: invoice.date,
    DueDate: invoice.dueDate,
    DocNumber: invoice.invoiceNumber,
    TotalAmt: invoice.amount,
    Line: invoice.lineItems.map((item, index) => ({
      Id: String(index + 1),
      Amount: item.amount,
      DetailType: 'AccountBasedExpenseLineDetail',
      AccountBasedExpenseLineDetail: {
        AccountRef: {
          value: mapToAccount(item.category)
        }
      },
      Description: item.description
    }))
  };
  
  return await quickbooks.createBill(bill);
};
```

**Xero Integration:**
```javascript
// Create invoice in Xero
const createXeroInvoice = async (invoice) => {
  const xeroInvoice = {
    Type: 'ACCPAY',
    Contact: {
      Name: invoice.vendor
    },
    Date: invoice.date,
    DueDate: invoice.dueDate,
    Reference: invoice.invoiceNumber,
    LineItems: invoice.lineItems.map(item => ({
      Description: item.description,
      Quantity: item.quantity || 1,
      UnitAmount: item.amount,
      AccountCode: mapToXeroAccount(item.category)
    }))
  };
  
  return await xero.invoices.create({ Invoices: [xeroInvoice] });
};
```

### Payment Tracking

**Track Payment Status:**
```javascript
// Check and update payment status
const checkPaymentStatus = async (invoices) => {
  const today = new Date();
  const results = [];
  
  for (const invoice of invoices) {
    const dueDate = new Date(invoice.dueDate);
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    let status;
    if (invoice.paidDate) {
      status = 'paid';
    } else if (daysUntilDue < 0) {
      status = 'overdue';
    } else if (daysUntilDue <= 7) {
      status = 'due_soon';
    } else {
      status = 'pending';
    }
    
    results.push({
      ...invoice,
      status,
      daysUntilDue,
      urgency: daysUntilDue < 0 ? 'high' : daysUntilDue <= 7 ? 'medium' : 'low'
    });
  }
  
  return results;
};
```

### Reporting

**Daily Financial Summary:**
```javascript
// Generate daily financial summary
const generateDailySummary = (invoices, payments) => {
  const today = new Date().toISOString().split('T')[0];
  
  const summary = {
    date: today,
    invoices: {
      received: invoices.filter(i => i.receivedDate === today).length,
      processed: invoices.filter(i => i.processedDate === today).length,
      approved: invoices.filter(i => i.approvedDate === today).length
    },
    payments: {
      made: payments.filter(p => p.date === today).length,
      totalAmount: payments
        .filter(p => p.date === today)
        .reduce((sum, p) => sum + p.amount, 0)
    },
    outstanding: {
      overdue: invoices.filter(i => i.status === 'overdue').length,
      dueSoon: invoices.filter(i => i.status === 'due_soon').length,
      totalOwed: invoices
        .filter(i => !i.paidDate)
        .reduce((sum, i) => sum + i.amount, 0)
    }
  };
  
  return summary;
};
```

## Setting Up the Workflow

### Step 1: Configure Email Monitoring

1. Add **IMAP Email** trigger node
2. Configure email server settings
3. Set up filters for invoice emails
4. Test connection

### Step 2: Add OCR Processing

**Option A: AWS Textract**
1. Add **AWS Textract** node
2. Configure AWS credentials
3. Set document type to "INVOICE"

**Option B: Google Cloud Vision**
1. Add **HTTP Request** node
2. Configure Google Cloud credentials
3. Call Document AI API

**Option C: Open Source (Tesseract)**
1. Add **Execute Command** node
2. Run Tesseract OCR
3. Parse output

### Step 3: Create Validation Logic

1. Add **Function** node
2. Implement validation rules
3. Add branching for valid/invalid invoices

### Step 4: Connect Accounting System

1. Add accounting system node (QuickBooks, Xero, etc.)
2. Configure API credentials
3. Map invoice fields to accounting fields

### Step 5: Set Up Notifications

1. Add **Slack** or **Email** nodes
2. Configure notification templates
3. Set up alerts for:
   - High-value invoices
   - Overdue payments
   - Processing errors

### Step 6: Schedule Reports

1. Add **Cron** trigger node
2. Configure daily/weekly schedule
3. Generate and send reports

## Testing the Workflow

### Test Invoice Processing

```bash
# Send test invoice email
echo "Test invoice attached" | mail -s "Invoice #TEST-001" \
  -A test_invoice.pdf \
  invoices@yourcompany.com
```

### Test Webhook Endpoint

```bash
curl -X POST http://localhost:5678/webhook/invoice-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_number": "INV-2025-001",
    "vendor": "Office Supplies Co",
    "date": "2025-01-15",
    "due_date": "2025-02-15",
    "amount": 1250.00,
    "currency": "USD",
    "category": "Office Supplies",
    "line_items": [
      {
        "description": "Printer Paper",
        "quantity": 10,
        "unit_price": 45.00,
        "amount": 450.00
      },
      {
        "description": "Ink Cartridges",
        "quantity": 8,
        "unit_price": 100.00,
        "amount": 800.00
      }
    ]
  }'
```

## Integration Options

### Accounting Systems

| System | Integration Type | Notes |
|--------|-----------------|-------|
| QuickBooks | Native node | Online and Desktop |
| Xero | Native node | Full API support |
| FreshBooks | HTTP Request | REST API |
| Sage | HTTP Request | REST API |
| Custom ERP | HTTP Request | Any REST/SOAP API |

### OCR Services

| Service | Accuracy | Cost |
|---------|----------|------|
| AWS Textract | High | Pay per page |
| Google Document AI | High | Pay per page |
| Azure Form Recognizer | High | Pay per page |
| Tesseract (Open Source) | Medium | Free |

### Storage Options

| Option | Use Case |
|--------|----------|
| PostgreSQL | Structured invoice data |
| S3/GCS | Original PDF storage |
| Local files | Simple deployments |

## Customization Options

### Custom Approval Workflow

```javascript
// Multi-level approval based on amount
const getApprovers = (amount, department) => {
  if (amount > 10000) {
    return ['cfo@company.com', 'ceo@company.com'];
  } else if (amount > 5000) {
    return ['finance_manager@company.com'];
  } else if (amount > 1000) {
    return [getDepartmentManager(department)];
  }
  return []; // Auto-approve
};
```

### Custom Categories

```javascript
// Map line items to expense categories
const categoryMapping = {
  'office supplies': 'EXPENSE_OFFICE',
  'software': 'EXPENSE_SOFTWARE',
  'travel': 'EXPENSE_TRAVEL',
  'utilities': 'EXPENSE_UTILITIES',
  'professional services': 'EXPENSE_CONSULTING'
};
```

### Vendor Rules

```javascript
// Vendor-specific processing rules
const vendorRules = {
  'AWS': { autoApprove: true, category: 'cloud_services' },
  'Microsoft': { autoApprove: true, category: 'software' },
  'NewVendor': { requiresReview: true }
};
```

## Monitoring and Alerts

### Key Metrics

- Invoices processed per day
- Average processing time
- Error rate
- Payment on-time rate
- Cash flow projections

### Alert Conditions

1. **High Priority**
   - Invoice processing failure
   - Overdue payment > 30 days
   - Duplicate invoice detected

2. **Medium Priority**
   - Payment due within 7 days
   - High-value invoice received
   - Unknown vendor

3. **Low Priority**
   - Daily summary
   - Weekly reports
   - Monthly analytics

## Security Considerations

### Data Protection

1. **Encrypt sensitive data** - Use n8n's encryption
2. **Secure credentials** - Store in n8n credential store
3. **Access control** - Limit workflow access
4. **Audit logging** - Track all actions

### Compliance

1. **SOX compliance** - Maintain approval trails
2. **Data retention** - Follow regulatory requirements
3. **Access logs** - Keep detailed audit logs

## Troubleshooting

### OCR Accuracy Issues

1. Check PDF quality
2. Verify correct orientation
3. Consider pre-processing (contrast, denoising)
4. Review confidence scores

### Email Monitoring Issues

1. Verify IMAP credentials
2. Check folder permissions
3. Confirm filter rules
4. Review email server limits

### Accounting Sync Errors

1. Verify API credentials
2. Check field mappings
3. Confirm vendor/account exists
4. Review API rate limits

## Best Practices

1. **Test with real invoices** before production
2. **Set up error notifications** immediately
3. **Review extracted data** for first 100 invoices
4. **Maintain vendor mappings** regularly
5. **Back up configuration** weekly
6. **Monitor processing times** for optimization

## Support Resources

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Community Forum](https://community.n8n.io/)
- [n8n Templates](https://n8n.io/workflows/)
- [GitHub Issues](https://github.com/n8n-io/n8n/issues)
