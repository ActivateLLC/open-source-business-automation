# Content Automation Workflow - Windmill

This document describes how to set up and use the Windmill-based content automation workflow for AI-assisted content creation and distribution.

## Overview

The Content Automation workflow in Windmill provides:

1. **Content Idea Generation** - Pull trending topics and generate ideas
2. **AI Writing Assistance** - Generate drafts using LLM integration
3. **Review Workflow** - Approval process with notifications
4. **Multi-Channel Distribution** - Publish to multiple platforms
5. **Performance Tracking** - Monitor engagement metrics

## Why Windmill for Content Creation

- **Developer-Centric**: Code-first approach with visual workflow builder
- **AI Native**: Built-in AI Flow Chat and AI Fix capabilities
- **Multi-Language**: Supports TypeScript, Python, Go, Bash, SQL, and 15+ more
- **Performance**: Fast execution with worker-based architecture
- **Enterprise Ready**: Used by 3,000+ organizations

## Quick Start

### 1. Access Windmill

```
URL: http://localhost:8000
```

Create your admin account on first access.

### 2. Set Up Workspace

1. Create a new workspace for your organization
2. Configure workspace settings
3. Add team members if needed

### 3. Import the Workflow

1. Go to **Flows** in the sidebar
2. Click **+ Flow**
3. Import from `workflows/windmill/content-automation.yaml`

## Workflow Components

### Content Idea Generation Script

**Python Script:**
```python
import requests
from typing import Optional

def main(
    topics: list[str],
    trend_source: str = "google_trends",
    count: int = 5
):
    """
    Generate content ideas based on trending topics.
    
    Args:
        topics: Base topics to explore
        trend_source: Source for trend data
        count: Number of ideas to generate
    """
    ideas = []
    
    # Fetch trending topics
    for topic in topics:
        # Add your trend analysis logic here
        ideas.append({
            "topic": topic,
            "angle": f"How {topic} is changing in 2025",
            "format": "blog_post",
            "priority": "high",
            "keywords": [topic, "trends", "2025"]
        })
    
    return {
        "ideas": ideas[:count],
        "generated_at": datetime.now().isoformat()
    }
```

### AI Content Generation Script

**TypeScript Script:**
```typescript
import { Anthropic } from "npm:@anthropic-ai/sdk";

export async function main(
  idea: {
    topic: string;
    angle: string;
    format: string;
    keywords: string[];
  },
  tone: string = "professional",
  wordCount: number = 800
) {
  const client = new Anthropic({
    apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
  });

  const prompt = `Write a ${wordCount}-word ${idea.format} about "${idea.angle}".

Topic: ${idea.topic}
Tone: ${tone}
Keywords to include: ${idea.keywords.join(", ")}

Structure:
1. Engaging introduction with hook
2. 3-4 main points with examples
3. Practical takeaways
4. Strong conclusion with call-to-action

Write the content now:`;

  const response = await client.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  return {
    content: response.content[0].text,
    idea: idea,
    metadata: {
      model: "claude-3-sonnet",
      wordCount: wordCount,
      generatedAt: new Date().toISOString(),
    },
  };
}
```

### Review Approval Flow

**Flow Definition:**
```yaml
summary: Content Review and Approval
description: Route content through editorial review

flow:
  modules:
    - id: check_quality
      type: script
      path: f/content/quality_check
      
    - id: branch_by_quality
      type: branch
      branches:
        - condition: result.score >= 80
          modules:
            - id: auto_approve
              type: script
              path: f/content/mark_approved
        - condition: result.score >= 50
          modules:
            - id: request_review
              type: script
              path: f/content/request_human_review
        - condition: result.score < 50
          modules:
            - id: regenerate
              type: script
              path: f/content/regenerate_content
```

### Multi-Channel Distribution

**Distribution Script:**
```python
import requests
from typing import Optional

def main(
    content: dict,
    channels: list[str],
    schedule_time: Optional[str] = None
):
    """
    Distribute content to multiple channels.
    
    Args:
        content: The content to publish
        channels: List of channels (blog, twitter, linkedin, newsletter)
        schedule_time: Optional ISO timestamp for scheduled publishing
    """
    results = {}
    
    for channel in channels:
        if channel == "blog":
            # WordPress/Ghost/Custom blog
            results["blog"] = publish_to_blog(content)
        elif channel == "twitter":
            # X/Twitter API
            results["twitter"] = publish_to_twitter(content)
        elif channel == "linkedin":
            # LinkedIn API
            results["linkedin"] = publish_to_linkedin(content)
        elif channel == "newsletter":
            # Email newsletter
            results["newsletter"] = add_to_newsletter(content)
    
    return {
        "published": results,
        "timestamp": datetime.now().isoformat()
    }
```

## Setting Up the Workflow

### Step 1: Create Scripts

1. Go to **Scripts** in Windmill
2. Create each required script:
   - `content/idea_generator`
   - `content/ai_writer`
   - `content/quality_check`
   - `content/distributor`

### Step 2: Create the Flow

1. Go to **Flows**
2. Click **+ Flow**
3. Build the flow using the visual editor:

```
[Schedule Trigger] 
       ↓
[Idea Generator] 
       ↓
[For Each Idea] ──┐
       ↓         │
[AI Writer]      │
       ↓         │
[Quality Check]  │
       ↓         │
[Branch: Score]  │
   ├── ≥80: Auto Approve
   ├── 50-79: Human Review
   └── <50: Regenerate
       ↓         │
[Distribution]   │
       ↓         │
[Track Metrics] ◀┘
```

### Step 3: Configure Resources

**Add API Keys:**

1. Go to **Resources**
2. Add resources for:
   - `anthropic` - Anthropic API key
   - `openai` - OpenAI API key (alternative)
   - `wordpress` - WordPress credentials
   - `twitter` - Twitter/X API credentials
   - `smtp` - Email configuration

### Step 4: Set Up Schedule

1. Click on your flow
2. Add a **Schedule** trigger
3. Configure frequency (e.g., weekly for content planning)

## AI Integration Options

### Option 1: Anthropic Claude

```typescript
// Using Anthropic's Claude
const client = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});
```

### Option 2: OpenAI GPT-4

```typescript
// Using OpenAI
import OpenAI from "npm:openai";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});
```

### Option 3: Local Models (Ollama)

```typescript
// Using Ollama for local inference
const response = await fetch("http://ollama:11434/api/generate", {
  method: "POST",
  body: JSON.stringify({
    model: "llama2",
    prompt: prompt,
  }),
});
```

## Content Templates

### Blog Post Template

```markdown
# {{title}}

{{introduction}}

## Key Takeaways

{{takeaways}}

## {{section_1_title}}

{{section_1_content}}

## {{section_2_title}}

{{section_2_content}}

## {{section_3_title}}

{{section_3_content}}

## Conclusion

{{conclusion}}

---

*Have questions? [Contact us](mailto:contact@example.com)*
```

### Social Media Templates

**Twitter/X:**
```
{{hook}}

{{main_point}}

{{cta}} 👇

{{link}}
```

**LinkedIn:**
```
{{professional_hook}}

Here's what I learned about {{topic}}:

1️⃣ {{point_1}}
2️⃣ {{point_2}}
3️⃣ {{point_3}}

{{conclusion}}

#{{hashtag_1}} #{{hashtag_2}}
```

## Performance Tracking

### Metrics Script

```python
def main(
    content_id: str,
    platforms: list[str]
):
    """
    Gather performance metrics for published content.
    """
    metrics = {}
    
    for platform in platforms:
        if platform == "blog":
            metrics["blog"] = {
                "views": get_blog_views(content_id),
                "time_on_page": get_time_on_page(content_id),
                "bounce_rate": get_bounce_rate(content_id)
            }
        elif platform == "twitter":
            metrics["twitter"] = {
                "impressions": get_tweet_impressions(content_id),
                "engagements": get_tweet_engagements(content_id),
                "clicks": get_tweet_clicks(content_id)
            }
        elif platform == "linkedin":
            metrics["linkedin"] = {
                "views": get_linkedin_views(content_id),
                "reactions": get_linkedin_reactions(content_id),
                "comments": get_linkedin_comments(content_id)
            }
    
    return metrics
```

## Customization Options

### Modify Content Style

Adjust the AI prompts to match your brand voice:

```typescript
const systemPrompt = `You are a content writer for [Company Name].
Brand voice: Professional but approachable
Audience: ${targetAudience}
Avoid: Jargon, overly formal language
Include: Data points, real examples, actionable advice`;
```

### Add Custom Quality Checks

```python
def quality_check(content: str) -> dict:
    score = 100
    issues = []
    
    # Check word count
    word_count = len(content.split())
    if word_count < 500:
        score -= 20
        issues.append("Content too short")
    
    # Check for keywords
    required_keywords = ["innovation", "strategy", "growth"]
    for keyword in required_keywords:
        if keyword not in content.lower():
            score -= 5
            issues.append(f"Missing keyword: {keyword}")
    
    # Check readability
    # Add Flesch-Kincaid or similar
    
    return {
        "score": score,
        "issues": issues,
        "word_count": word_count
    }
```

## Monitoring and Analytics

### View Flow Runs

1. Go to **Runs** in the sidebar
2. Filter by flow or status
3. Click on any run to see detailed execution

### Set Up Alerts

1. Go to **Settings** → **Alerts**
2. Configure notifications for:
   - Flow failures
   - Quality scores below threshold
   - Publishing errors

### Dashboard Queries

Use Metabase to create content dashboards:

```sql
-- Content published per week
SELECT 
    date_trunc('week', published_at) as week,
    channel,
    count(*) as posts
FROM content_published
GROUP BY 1, 2
ORDER BY 1 DESC;
```

## Best Practices

1. **Start with quality over quantity** - One great post beats ten mediocre ones
2. **Review AI output** - Always have human review before publishing
3. **A/B test** - Try different styles and measure results
4. **Maintain brand consistency** - Use templates and style guides
5. **Track everything** - Measure performance to improve over time

## Troubleshooting

### AI Generation Issues

1. Check API key is configured correctly
2. Verify API quota and rate limits
3. Check prompt quality and length
4. Review error logs in Windmill

### Publishing Failures

1. Verify platform credentials
2. Check API rate limits
3. Validate content format requirements
4. Review platform-specific error messages

### Performance Issues

1. Optimize script execution time
2. Use appropriate worker groups
3. Consider caching for repeated operations
4. Monitor resource usage

## Support Resources

- [Windmill Documentation](https://www.windmill.dev/docs)
- [Windmill Discord](https://discord.gg/windmill)
- [GitHub Repository](https://github.com/windmill-labs/windmill)
