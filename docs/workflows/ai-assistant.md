# AI Business Assistant Workflow

This workflow provides a natural language interface for querying business data, powered by local AI (Ollama).

## Overview

The AI Business Assistant Workflow:

1. Receives questions via webhook endpoint
2. Classifies the question type (leads, customers, finance, content)
3. Retrieves relevant context from the database
4. Generates intelligent answers using Ollama AI
5. Logs all interactions to Kafka audit trail
6. Returns structured responses

![AI Assistant Workflow](../images/ai-assistant-workflow.png)

## Features

- **Natural Language Understanding**: Ask questions in plain English
- **Context-Aware Responses**: Uses real business data for accurate answers
- **Multi-Domain Support**: Handles leads, customers, invoices, and content queries
- **Conversation Tracking**: Maintains session history
- **Audit Trail**: All interactions logged to Kafka

## Setup Guide

### 1. Import the Workflow

1. In n8n, go to Workflows > Import From File
2. Select the `n8n-ai-assistant.json` file
3. Save the workflow

### 2. Configure Database Connection

Ensure the PostgreSQL credential is configured:
- Host: postgres
- Port: 5432
- Database: n8n
- User: n8n
- Password: (your configured password)

### 3. Configure Kafka Connection

Ensure the Kafka credential is configured:
- Broker: kafka:9092

### 4. Verify Ollama Model

Ensure the Llama2 model is downloaded:

```bash
docker exec -it <ollama_container> ollama list
```

If not installed:

```bash
docker exec -it <ollama_container> ollama pull llama2
```

### 5. Test the Workflow

Use curl to test the assistant:

```bash
curl -X POST http://your-server-ip:5678/webhook/ai-assistant \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How many hot leads do we have?",
    "user_id": "test_user"
  }'
```

## API Reference

### Endpoint

```
POST /webhook/ai-assistant
```

### Request Body

```json
{
  "question": "Your question here",
  "user_id": "optional_user_id",
  "session_id": "optional_session_id",
  "context": {}
}
```

### Response

```json
{
  "request_id": "req-1234567890-abc",
  "session_id": "session-1234567890",
  "question": "How many hot leads do we have?",
  "question_type": "leads",
  "answer": "Based on the current data, you have 15 hot leads...",
  "context_used": "leads",
  "confidence": "high",
  "responded_at": "2024-01-15T10:30:00.000Z",
  "processing_time_ms": 1250
}
```

## Question Types

The assistant automatically classifies questions into categories:

| Category | Trigger Words | Data Source |
|----------|---------------|-------------|
| Leads | lead, prospect | leads table |
| Customers | customer, client | customers table |
| Finance | invoice, payment, bill | invoices, payments tables |
| Content | content, article, post | content_items table |
| Analytics | dashboard, metrics, report | Multiple sources |
| General | (default) | System overview |

## Example Questions

### Lead Questions
- "How many hot leads do we have?"
- "What's our average lead score?"
- "Show me recent leads from the technology industry"
- "Which leads need follow-up?"

### Customer Questions
- "How many active customers do we have?"
- "What's our total customer lifetime value?"
- "List our top customers"
- "Who are our newest customers?"

### Finance Questions
- "How much revenue is outstanding?"
- "Are there any overdue invoices?"
- "What's our collection rate?"
- "Show me payment trends"

### Content Questions
- "How many articles have we published?"
- "What's our AI-generated content ratio?"
- "Which content performs best?"
- "What topics should we cover next?"

## Context Retrieval

For each question type, the workflow retrieves relevant context:

### Lead Context
```sql
SELECT 
  l.*,
  (SELECT COUNT(*) FROM leads) as total_leads,
  (SELECT COUNT(*) FROM leads WHERE tier = 'hot') as hot_leads,
  (SELECT AVG(score) FROM leads) as avg_score
FROM leads l
ORDER BY l.created_at DESC
LIMIT 10;
```

### Customer Context
```sql
SELECT 
  c.*,
  (SELECT COUNT(*) FROM customers) as total_customers,
  (SELECT SUM(lifetime_value) FROM customers) as total_ltv
FROM customers c
ORDER BY c.created_at DESC
LIMIT 10;
```

### Finance Context
```sql
SELECT 
  i.*,
  (SELECT COUNT(*) FROM invoices) as total_invoices,
  (SELECT SUM(total_amount) FROM invoices) as total_amount,
  (SELECT COUNT(*) FROM invoices WHERE payment_status = 'unpaid' AND due_date < CURRENT_DATE) as overdue_count
FROM invoices i
ORDER BY i.created_at DESC
LIMIT 10;
```

## AI Prompt Engineering

The AI is prompted with structured context:

```
You are a helpful business assistant AI. You have access to the following business data:

[CONTEXT SUMMARY FROM DATABASE]

User Question: [USER'S QUESTION]

Provide a helpful, accurate, and concise answer based on the data provided. 
If you don't have enough information to answer, say so clearly.
Format your response in a clear, professional manner.
```

## Kafka Events

All interactions are logged to Kafka:

### Question Received Event
```json
{
  "event_id": "req-1234567890-abc",
  "event_type": "ai.question.received",
  "event_source": "n8n-ai-assistant",
  "entity_type": "ai_conversation",
  "entity_id": "session-1234567890",
  "action": "query",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "question_type": "leads",
    "user_id": "test_user"
  }
}
```

### Answer Generated Event
```json
{
  "event_id": "answer-req-1234567890-abc",
  "event_type": "ai.answer.generated",
  "event_source": "n8n-ai-assistant",
  "entity_type": "ai_conversation",
  "entity_id": "session-1234567890",
  "action": "respond",
  "timestamp": "2024-01-15T10:30:01.250Z",
  "data": {
    "question_type": "leads",
    "context_used": "leads",
    "processing_time_ms": 1250
  }
}
```

## Customization Options

### Change AI Model

Update the HTTP Request node to use a different Ollama model:

```json
{
  "model": "mistral",
  "prompt": "..."
}
```

### Add New Question Types

1. Update the question classification logic in "Process Question" node
2. Add a new database query node for the context
3. Create a context preparation node
4. Connect to the merge node

### Modify AI Behavior

Adjust the prompt in "AI Generate Answer (Ollama)" node:
- Change temperature for more/less creative responses
- Modify the system instructions
- Add formatting requirements

### Add Authentication

1. Enable webhook authentication in n8n
2. Add API key validation in the "Process Question" node
3. Include user permissions in context

## Performance Optimization

### Response Time
- Typical response: 1-3 seconds
- Complex queries: 3-5 seconds
- Timeout setting: 60 seconds

### Caching (Future Enhancement)
- Cache common queries in Redis
- Store conversation context
- Pre-compute frequent metrics

### Model Selection
- Use smaller models for faster responses
- Use larger models for complex analysis
- Consider fine-tuned models for domain expertise

## Troubleshooting

### No Response
- Check Ollama container is running
- Verify model is downloaded
- Check n8n logs for errors

### Slow Responses
- Increase Ollama resources
- Consider GPU acceleration
- Reduce context size

### Incorrect Answers
- Verify database connections
- Check data quality
- Adjust AI prompts

### Connection Errors
- Verify network connectivity
- Check Kafka is running
- Validate database credentials
