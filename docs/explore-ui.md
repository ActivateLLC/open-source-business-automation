# Explore UI - Traditional Interface

The Explore UI provides a traditional tabbed interface for exploring business data, alongside an AI Assistant mode for natural language queries.

## Overview

The Explore UI offers two modes:

1. **Explore Mode** (Default): Traditional navigation with tabs and scrollable, clickable elements
2. **AI Assistant Mode**: Generative UI for natural language queries about business data

## Features

### Explore Mode

- **Tabbed Navigation**: Switch between Leads, Customers, Invoices, and Content tabs
- **Scrollable Lists**: Card-based lists that display all records with key information
- **Clickable Items**: Click any card to view full details in a modal
- **Filtering**: Filter data by tier, status, or other attributes using dropdown selectors
- **Real-time Stats**: Summary statistics displayed at the top of each tab
- **Refresh Button**: Manually refresh data from the backend

### AI Assistant Mode

- **Natural Language Queries**: Ask questions about your business data in plain English
- **Quick Questions**: Pre-built question buttons for common queries
- **Conversation History**: Track your questions and answers in a chat-like interface
- **Context-Aware Responses**: AI uses real database data to provide accurate answers

## Accessing the Explore UI

After starting the services with `docker-compose up -d`, access the Explore UI at:

```
http://localhost:8000
```

## User Interface Guide

### Mode Toggle

At the top right of the interface, you'll find two buttons:

- **📊 Explore**: Switches to traditional tabbed interface
- **🤖 AI Assistant**: Switches to natural language interface

### Tabs (Explore Mode)

| Tab | Icon | Description |
|-----|------|-------------|
| Leads | 🎯 | View lead pipeline with tier-based categorization |
| Customers | 👥 | View converted customers and lifetime value |
| Invoices | 💰 | View invoices with payment status tracking |
| Content | 📝 | View content items and their publishing status |

### Card Information

Each card displays:

- **Icon**: Visual indicator of status/tier
- **Title**: Primary identifier (name, invoice number, etc.)
- **Badge**: Status indicator (Hot, Warm, Paid, Published, etc.)
- **Subtitle**: Secondary information (company, email, vendor)
- **Meta Information**: Additional details in a smaller font
- **Value**: Primary metric (score, amount, views)
- **Date**: Creation or relevant date

### Filters

Each tab has a filter dropdown to narrow results:

| Tab | Filter Options |
|-----|---------------|
| Leads | All, Hot, Warm, Cold |
| Customers | All, Active, Inactive |
| Invoices | All, Paid, Unpaid, Overdue |
| Content | All, Published, Draft, Scheduled |

### Detail Modal

Click any card to open a detail modal showing:

- All available fields for the record
- Formatted values (currency, dates)
- Status badges

Press Escape or click outside to close.

## AI Assistant Usage

### Sample Questions

**Leads:**
- "How many hot leads do we have?"
- "What's our average lead score?"
- "Show me recent leads from the technology industry"

**Customers:**
- "How many active customers do we have?"
- "What's our total customer lifetime value?"
- "List our top customers"

**Invoices:**
- "How much revenue is outstanding?"
- "Are there any overdue invoices?"
- "What's our collection rate?"

**Content:**
- "How many articles have we published?"
- "What's our AI-generated content ratio?"
- "Which content performs best?"

### Quick Question Buttons

Pre-built buttons for common queries:
- Hot leads count
- Outstanding invoices
- Active customers
- Top content

## Technical Details

### API Integration

The Explore UI connects to the n8n workflow engine via the AI Assistant webhook:

```
POST http://localhost:5678/webhook/ai-assistant
```

### Demo Mode

If the n8n backend is unavailable, the UI automatically switches to demo mode with sample data. This allows testing the interface without the full stack running.

### Responsive Design

The UI is fully responsive and works on:
- Desktop (full layout with all features)
- Tablet (adjusted layout, visible labels)
- Mobile (compact layout, icon-only tabs)

## Building Locally

The Explore UI is built with vanilla HTML, CSS, and JavaScript (no framework dependencies).

To build and run locally without Docker:

```bash
cd frontend
python -m http.server 8000
# Or use any static file server
```

To build the Docker image:

```bash
cd frontend
docker build -t explore-ui .
docker run -p 8000:80 explore-ui
```

## Customization

### Styling

Modify `css/styles.css` to change:
- Color scheme (CSS variables at the top)
- Layout and spacing
- Component appearance

### Functionality

Modify `js/app.js` to:
- Add new tabs or data types
- Change API endpoints
- Add new features

### Data Display

Modify the card template functions in `js/app.js`:
- `createLeadCard()`
- `createCustomerCard()`
- `createInvoiceCard()`
- `createContentCard()`

## Troubleshooting

### Data Not Loading

1. Check if n8n is running: `docker-compose logs n8n`
2. Verify the workflow is active in n8n UI
3. Check browser console for API errors

### AI Assistant Not Responding

1. Ensure Ollama is running: `docker-compose logs ollama`
2. Verify the AI model is downloaded: `docker exec -it ollama ollama list`
3. Check the n8n AI Assistant workflow logs

### Styling Issues

1. Clear browser cache
2. Check for CSS file loading errors
3. Verify responsive breakpoints match your device
