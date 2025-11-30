# AI Agents Guide

This guide explains how to configure and use the AI agents in the Open Source Business Automation Stack.

## Overview

The AI Agent Layer provides intelligent automation capabilities across your business operations. Built on LangChain, AutoGen, and integrated with OpenAI/Claude APIs, these agents can:

- Answer questions using your knowledge base (RAG)
- Make decisions based on business rules
- Execute actions automatically
- Learn from interactions

## Agent Types

### 1. Sales Agent

The Sales Agent handles customer-facing interactions and sales operations.

**Capabilities:**
- Answer product/service questions from knowledge base
- Qualify leads through conversation
- Schedule meetings automatically
- Update CRM records in real-time
- Provide personalized recommendations

**Configuration:**
```yaml
agent:
  name: sales_agent
  type: conversational
  knowledge_sources:
    - product_catalog
    - pricing_info
    - faq
  actions:
    - create_lead
    - update_lead
    - schedule_meeting
    - send_email
  llm:
    provider: openai
    model: gpt-4
    temperature: 0.7
```

**Example Interactions:**
```
User: "What pricing plans do you offer?"
Agent: [Retrieves from knowledge base] "We offer three plans..."

User: "I'm interested in the Enterprise plan"
Agent: [Creates lead, triggers follow-up workflow]
```

### 2. Content Agent

The Content Agent assists with content creation and optimization.

**Capabilities:**
- Generate content based on brand voice
- Optimize content for SEO
- Create A/B test variations
- Suggest content topics based on trends
- Analyze competitor content

**Configuration:**
```yaml
agent:
  name: content_agent
  type: creative
  knowledge_sources:
    - brand_guidelines
    - content_templates
    - seo_keywords
  actions:
    - generate_draft
    - optimize_seo
    - create_variations
    - schedule_publish
  llm:
    provider: openai
    model: gpt-4
    temperature: 0.9
```

**Example Workflow:**
```
1. Input: Content brief
2. Agent retrieves brand voice from Qdrant
3. Generates initial draft
4. Optimizes for target keywords
5. Creates social media variations
6. Saves to content calendar
```

### 3. Finance Agent

The Finance Agent handles financial queries and operations.

**Capabilities:**
- Answer invoice and payment questions
- Process refund requests
- Flag unusual transactions
- Generate financial reports on demand
- Predict cash flow

**Configuration:**
```yaml
agent:
  name: finance_agent
  type: analytical
  knowledge_sources:
    - financial_policies
    - transaction_history
    - vendor_info
  actions:
    - lookup_invoice
    - process_refund
    - flag_anomaly
    - generate_report
  llm:
    provider: openai
    model: gpt-4
    temperature: 0.3
```

**Example Interactions:**
```
User: "When will invoice INV-2024-001 be paid?"
Agent: [Queries database] "Invoice INV-2024-001 is scheduled for payment on Dec 15..."

User: "Flag any unusual transactions this month"
Agent: [Analyzes transactions, identifies anomalies]
```

### 4. Operations Agent

The Operations Agent monitors and optimizes system operations.

**Capabilities:**
- Monitor system health
- Predict operational bottlenecks
- Suggest process improvements
- Auto-resolve common issues
- Generate operational reports

**Configuration:**
```yaml
agent:
  name: operations_agent
  type: monitoring
  knowledge_sources:
    - system_metrics
    - incident_history
    - runbooks
  actions:
    - check_health
    - restart_service
    - create_incident
    - notify_team
  llm:
    provider: openai
    model: gpt-4
    temperature: 0.2
```

## Setting Up AI Agents

### Prerequisites

1. **API Keys**: Obtain API keys from your LLM provider (OpenAI, Anthropic, etc.)
2. **Qdrant**: Ensure Qdrant is running for vector storage
3. **PostgreSQL**: Knowledge base entries are stored here

### Step 1: Configure Environment Variables

Add these to your `docker-compose.yml` or environment:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Or Anthropic/Claude
ANTHROPIC_API_KEY=your_anthropic_api_key

# Qdrant Configuration
QDRANT_HOST=qdrant
QDRANT_PORT=6333

# PostgreSQL for Knowledge Base
POSTGRES_HOST=postgres
POSTGRES_DB=business_data
```

### Step 2: Initialize Knowledge Base

Populate the knowledge base table with your business information:

```sql
INSERT INTO knowledge_base (category, title, content, metadata) VALUES
('product', 'Pricing Plans', 'We offer Starter ($99/mo), Pro ($299/mo), and Enterprise (custom)...', '{"tags": ["pricing", "plans"]}'),
('faq', 'Refund Policy', 'Refunds are available within 30 days of purchase...', '{"tags": ["refund", "policy"]}'),
('brand', 'Brand Voice', 'Our tone is professional yet friendly...', '{"tags": ["brand", "guidelines"]}');
```

### Step 3: Generate Embeddings

Create embeddings for your knowledge base entries:

```python
import os
from langchain.embeddings import OpenAIEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance

# Ensure API key is set via environment variable
# Export before running: export OPENAI_API_KEY=your_api_key
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY environment variable must be set")

# Initialize clients
embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))
qdrant = QdrantClient(host="localhost", port=6333)

# Create collection
qdrant.create_collection(
    collection_name="knowledge_base",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
)

# Generate and store embeddings
for entry in knowledge_entries:
    vector = embeddings.embed_query(entry['content'])
    qdrant.upsert(
        collection_name="knowledge_base",
        points=[{
            "id": entry['id'],
            "vector": vector,
            "payload": {"title": entry['title'], "category": entry['category']}
        }]
    )
```

### Step 4: Create Agent Workflows

Use Activepieces or Temporal to create agent workflows:

#### Activepieces Example
1. Create a new flow in Activepieces
2. Add a webhook trigger
3. Add the AI agent action
4. Configure the agent type and parameters
5. Add follow-up actions (database updates, notifications)

#### Temporal Example
```python
from temporalio import workflow, activity

@activity.defn
async def process_with_ai_agent(message: str, agent_type: str) -> dict:
    # Agent processing logic
    agent = get_agent(agent_type)
    response = await agent.process(message)
    return response

@workflow.defn
class CustomerInquiryWorkflow:
    @workflow.run
    async def run(self, inquiry: dict) -> dict:
        # Route to appropriate agent
        agent_type = classify_inquiry(inquiry)
        
        # Process with AI agent
        response = await workflow.execute_activity(
            process_with_ai_agent,
            args=[inquiry['message'], agent_type],
            start_to_close_timeout=timedelta(seconds=60)
        )
        
        # Execute follow-up actions
        await self.execute_actions(response['actions'])
        
        return response
```

## RAG (Retrieval Augmented Generation)

The agents use RAG to provide accurate, context-aware responses:

### How RAG Works

1. **Query**: User asks a question
2. **Embed**: Question is converted to vector
3. **Retrieve**: Similar documents found in Qdrant
4. **Augment**: Retrieved context added to prompt
5. **Generate**: LLM generates response with context

### RAG Configuration

```python
from langchain.chains import RetrievalQA
from langchain.vectorstores import Qdrant

# Initialize vector store
vectorstore = Qdrant(
    client=qdrant_client,
    collection_name="knowledge_base",
    embeddings=embeddings
)

# Create retrieval chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
    return_source_documents=True
)
```

## Multi-Agent Collaboration

For complex tasks, multiple agents can collaborate using AutoGen:

```python
from autogen import AssistantAgent, UserProxyAgent

# Create agents
sales_agent = AssistantAgent(
    name="sales_agent",
    system_message="You are a sales expert..."
)

content_agent = AssistantAgent(
    name="content_agent",
    system_message="You are a content expert..."
)

# Create group chat
groupchat = autogen.GroupChat(
    agents=[sales_agent, content_agent, user_proxy],
    messages=[],
    max_round=10
)

# Collaborative task
manager = autogen.GroupChatManager(groupchat=groupchat)
user_proxy.initiate_chat(
    manager,
    message="Create a sales email for our new product launch"
)
```

## Monitoring and Analytics

### Agent Performance Metrics

Track these metrics in Grafana:

- Response time
- Accuracy (user feedback)
- Knowledge base hit rate
- Action success rate
- Cost per interaction

### Conversation Logging

All agent conversations are logged to the database:

```sql
SELECT 
    agent_type,
    COUNT(*) as conversations,
    AVG(response_time) as avg_response_time
FROM ai_conversations
WHERE started_at >= NOW() - INTERVAL '7 days'
GROUP BY agent_type;
```

## Best Practices

### 1. Knowledge Base Management
- Regularly update knowledge base entries
- Review and improve low-performing responses
- Add new FAQs based on common questions

### 2. Prompt Engineering
- Test prompts thoroughly before deployment
- Use few-shot examples for complex tasks
- Set appropriate temperature for each agent type

### 3. Error Handling
- Implement fallback to human support
- Log and analyze failed interactions
- Set up alerts for high error rates

### 4. Cost Optimization
- Cache common responses
- Use smaller models for simple tasks
- Implement rate limiting

### 5. Security
- Never expose API keys in client-side code
- Validate and sanitize all inputs
- Implement proper access controls

## Troubleshooting

### Common Issues

1. **Slow Response Times**
   - Check Qdrant indexing
   - Reduce retrieval document count
   - Use response caching

2. **Inaccurate Responses**
   - Review knowledge base content
   - Check embedding quality
   - Adjust retrieval parameters

3. **API Errors**
   - Verify API keys
   - Check rate limits
   - Monitor API status

### Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Next Steps

1. [Configure Activepieces Workflows](workflows/README.md)
2. [Set up Temporal for Complex Processes](architecture.md#temporal)
3. [Create Custom Dashboards in Superset](installation.md#apache-superset)
