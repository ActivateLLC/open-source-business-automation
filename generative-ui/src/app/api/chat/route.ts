import { NextRequest, NextResponse } from 'next/server';

// Chat API - Processes natural language queries and returns structured responses
// In production, this would integrate with Ollama for AI responses

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    // Simple intent classification (in production, use Ollama)
    const messageLower = message.toLowerCase();
    
    const response: {
      message: string;
      chartData?: object;
      insights?: object[];
      suggestedActions?: string[];
    } = {
      message: '',
      suggestedActions: [],
    };

    // Lead-related queries
    if (messageLower.includes('lead')) {
      if (messageLower.includes('chart') || messageLower.includes('show') || messageLower.includes('visualize')) {
        response.message = "Here's the lead distribution by tier:";
        response.chartData = {
          type: 'pie',
          title: 'Lead Distribution by Tier',
          labels: ['Hot', 'Warm', 'Cold'],
          datasets: [{
            data: [15, 45, 67],
            backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6'],
          }],
        };
      } else if (messageLower.includes('hot')) {
        response.message = "You have 15 hot leads that need immediate attention. Top 3:\n\n1. **Bob Wilson** (Enterprise Inc) - Score: 92\n2. **Diana Evans** (Mega Corp) - Score: 88\n3. **John Smith** (Acme Corp) - Score: 85";
        response.insights = [
          { type: 'hot', title: 'Hot Lead Alert', description: '3 new hot leads in the last 24 hours' }
        ];
      } else {
        response.message = "Lead Pipeline Summary:\n\n• **Total Leads**: 127\n• **Hot**: 15 (12%)\n• **Warm**: 45 (35%)\n• **Cold**: 67 (53%)\n\nConversion rate is 12.5% this month.";
      }
      response.suggestedActions = ['Show lead chart', 'View hot leads', 'Lead conversion analysis'];
    }
    // Revenue-related queries
    else if (messageLower.includes('revenue') || messageLower.includes('financial') || messageLower.includes('money')) {
      if (messageLower.includes('trend') || messageLower.includes('chart')) {
        response.message = "Here's the revenue trend for the past 6 months:";
        response.chartData = {
          type: 'line',
          title: 'Monthly Revenue Trend',
          labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Revenue ($)',
            data: [45000, 52000, 48000, 61000, 55000, 67000],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
          }],
        };
      } else {
        response.message = "Financial Overview:\n\n💰 **This Month**: $67,000\n📈 **Growth**: +22% vs last month\n🎯 **Target**: $60,000 (112% achieved)\n⏰ **Outstanding**: $47,000\n⚠️ **Overdue**: $12,000";
      }
      response.suggestedActions = ['Revenue trend chart', 'View overdue invoices', 'Monthly comparison'];
    }
    // Customer-related queries
    else if (messageLower.includes('customer') || messageLower.includes('client')) {
      response.message = "Customer Insights:\n\n👥 **Total Customers**: 89\n✅ **Active**: 72 (81%)\n💎 **Average LTV**: $4,250\n🆕 **New This Month**: 12\n\nTop customer: Enterprise Inc ($125K LTV)";
      response.suggestedActions = ['Customer segments chart', 'Top customers', 'LTV analysis'];
    }
    // Content-related queries
    else if (messageLower.includes('content') || messageLower.includes('article') || messageLower.includes('blog')) {
      response.message = "Content Performance:\n\n📝 **Total Items**: 45\n📢 **Published**: 38\n🤖 **AI Generated**: 22 (58%)\n👀 **Avg Views**: 1,250\n\nTop performer: \"AI in Business\" (4,500 views)";
      response.chartData = {
        type: 'bar',
        title: 'Content Performance by Type',
        labels: ['Blog Posts', 'Articles', 'Social', 'Email'],
        datasets: [{
          label: 'Views',
          data: [2100, 4500, 3200, 1250],
          backgroundColor: '#d946ef',
        }],
      };
      response.suggestedActions = ['Content performance chart', 'Best performing posts', 'Generate new content'];
    }
    // Insights request
    else if (messageLower.includes('insight') || messageLower.includes('summary') || messageLower.includes('overview')) {
      response.message = "Here are today's key business insights:";
      response.insights = [
        { id: '1', type: 'hot', title: 'Hot Lead Alert', description: '3 new hot leads scored above 80. Follow up recommended.' },
        { id: '2', type: 'success', title: 'Revenue Target', description: 'On track to exceed monthly target by 15%.' },
        { id: '3', type: 'warning', title: 'Overdue Invoices', description: '8 invoices totaling $12,450 need attention.' },
        { id: '4', type: 'info', title: 'AI Content', description: 'AI-generated content has 32% higher engagement.' },
      ];
      response.suggestedActions = ['Deep dive leads', 'Financial details', 'View all alerts'];
    }
    // Help
    else if (messageLower.includes('help') || messageLower === '?') {
      response.message = "## 🤖 I can help you with:\n\n### 📊 Data & Charts\n- \"Show lead pipeline chart\"\n- \"Revenue trend this month\"\n\n### 💡 Insights\n- \"Give me key insights\"\n- \"What needs attention?\"\n\n### 🔍 Queries\n- \"How many hot leads?\"\n- \"Top customers by LTV\"\n\nJust ask naturally!";
    }
    // Default response
    else {
      response.message = `I understand you're asking about "${message}". I can help with:\n\n• **Leads**: Pipeline, scoring, hot leads\n• **Revenue**: Trends, invoices, forecasts\n• **Customers**: Insights, LTV, segments\n• **Content**: Performance, AI generation\n\nTry asking something specific like \"Show me a lead chart\" or \"What are today's insights?\"`;
      response.suggestedActions = ['Show insights', 'Lead overview', 'Revenue summary', 'Help'];
    }

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
