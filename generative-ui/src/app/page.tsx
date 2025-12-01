'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { ChatMessage } from '@/types';
import { CommandInput } from '@/components/CommandInput';
import { ChatHistory } from '@/components/ChatMessage';
import { Sidebar, QuickActionsBar, MetricsRow } from '@/components/UIElements';
import {
  parseCommand,
  generateChartData,
  generateInsights,
  getSuggestedActions,
  getHelpResponse,
} from '@/lib/command-parser';

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [suggestions, setSuggestions] = useState<string[]>([
    "Show lead pipeline chart",
    "Give me today's insights",
    "How is revenue trending?",
    "Analyze content performance",
  ]);

  const handleCommand = useCallback(async (command: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: command,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    // Add processing message
    const processingMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isGenerating: true,
    };
    setMessages((prev) => [...prev, processingMessage]);

    // Parse the command
    const parsedCommand = parseCommand(command);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Generate response based on intent
    let responseContent = '';
    let chartData = undefined;
    let insightData = undefined;

    if (parsedCommand.intent === 'help') {
      responseContent = getHelpResponse();
    } else if (parsedCommand.intent === 'chart') {
      chartData = generateChartData(parsedCommand);
      responseContent = `Here's the ${chartData.type} chart for ${parsedCommand.entity || 'your data'}. ${
        parsedCommand.timeframe ? `Showing data for ${parsedCommand.timeframe}.` : ''
      }`;
    } else if (parsedCommand.intent === 'insight') {
      insightData = generateInsights(parsedCommand);
      responseContent = `Here are the key insights${
        parsedCommand.entity ? ` for ${parsedCommand.entity}` : ''
      }:`;
    } else if (parsedCommand.intent === 'query') {
      // Generate appropriate response based on entity
      const entityResponses: Record<string, string> = {
        leads: `Based on your lead data:\n\n• **Total Leads**: 127\n• **Hot Leads**: 15 (12%)\n• **Warm Leads**: 45 (35%)\n• **Cold Leads**: 67 (53%)\n• **Average Score**: 42.5\n• **Conversion Rate**: 12.5%\n\nWould you like me to create a visualization or provide more detailed insights?`,
        customers: `Here's your customer overview:\n\n• **Total Customers**: 89\n• **Active Customers**: 72 (81%)\n• **Average LTV**: $4,250\n• **New This Month**: 12\n\nYour enterprise segment shows the highest engagement.`,
        invoices: `Financial Summary:\n\n• **Total Invoices**: 156\n• **Total Value**: $245,000\n• **Paid**: $198,000 (81%)\n• **Pending**: $35,000\n• **Overdue**: $12,000 (8 invoices)\n\nI recommend following up on the overdue invoices.`,
        revenue: `Revenue Overview:\n\n• **This Month**: $67,000\n• **Last Month**: $55,000\n• **Growth**: +22%\n• **Target**: $60,000 (112% achieved)\n\nYou're exceeding your revenue targets!`,
        content: `Content Performance:\n\n• **Total Items**: 45\n• **Published**: 38\n• **AI Generated**: 22 (58%)\n• **Average Views**: 1,250\n• **Top Performer**: "AI in Business" (4,500 views)`,
        general: `Here's your business overview:\n\n• **Active Leads**: 127\n• **Customers**: 89\n• **Open Invoices**: 45\n• **Published Content**: 38\n\nAll systems are running smoothly. Would you like details on any specific area?`,
      };
      responseContent = entityResponses[parsedCommand.entity || 'general'] || entityResponses.general;
    } else if (parsedCommand.intent === 'action') {
      responseContent = `I understand you want to ${command}. This action would typically trigger an automation workflow. In a production environment, this would:\n\n1. Connect to the n8n workflow engine\n2. Execute the appropriate automation\n3. Return the results\n\nWould you like me to explain more about available automations?`;
    } else {
      responseContent = `I understand you're asking about "${command}". Let me help you with that.\n\nBased on your query, I can:\n• Generate visualizations\n• Provide detailed insights\n• Answer specific questions about your data\n\nTry asking something like "Show me a chart of leads by tier" or "Give me revenue insights".`;
    }

    // Update suggestions based on context
    const newSuggestions = getSuggestedActions(parsedCommand);
    setSuggestions(newSuggestions);

    // Update the processing message with actual content
    const assistantMessage: ChatMessage = {
      id: processingMessage.id,
      role: 'assistant',
      content: responseContent,
      timestamp: new Date().toISOString(),
      chartData,
      insightData,
      isGenerating: false,
    };

    setMessages((prev) =>
      prev.map((msg) => (msg.id === processingMessage.id ? assistantMessage : msg))
    );
    setIsProcessing(false);
  }, []);

  const handleCategorySelect = useCallback((category: string) => {
    setActiveCategory(category);
    setSidebarOpen(false);

    // Generate contextual suggestions based on category
    const categorySuggestions: Record<string, string[]> = {
      all: ["Give me a business overview", "What needs my attention?", "Show overall metrics"],
      leads: ["Show lead pipeline", "How many hot leads?", "Lead conversion rate"],
      revenue: ["Revenue this month", "Overdue invoices", "Financial summary"],
      customers: ["Top customers", "Customer growth", "Average LTV"],
      content: ["Content performance", "Best performing posts", "AI content stats"],
      automation: ["Workflow status", "Recent events", "System health"],
    };
    setSuggestions(categorySuggestions[category] || categorySuggestions.all);
  }, []);

  const quickActions = [
    { label: '📊 Charts', command: 'Show me a business overview chart' },
    { label: '💡 Insights', command: 'Give me key insights for today' },
    { label: '🔥 Hot Leads', command: 'Show hot leads that need attention' },
    { label: '💰 Revenue', command: 'How is revenue trending this month?' },
  ];

  const metricsData = [
    { label: 'Total Leads', value: '127', change: { value: 12, direction: 'up' as const }, icon: '👥' },
    { label: 'Revenue', value: '$67K', change: { value: 22, direction: 'up' as const }, icon: '💰' },
    { label: 'Customers', value: '89', change: { value: 8, direction: 'up' as const }, icon: '🤝' },
    { label: 'Content Views', value: '12.5K', change: { value: 15, direction: 'up' as const }, icon: '📈' },
  ];

  return (
    <div className="generative-container flex h-screen">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelectCategory={handleCategorySelect}
        activeCategory={activeCategory}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                Generative Business Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Ask anything, get instant insights and visualizations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/canvas"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-primary-600 hover:to-purple-700 transition-all shadow-lg shadow-primary-500/30"
            >
              <span>🎤</span>
              <span className="hidden sm:inline">Voice Canvas</span>
            </Link>
            <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              AI Connected
            </span>
          </div>
        </header>

        {/* Metrics Row */}
        <MetricsRow metrics={metricsData} />

        {/* Chat Area */}
        <ChatHistory messages={messages} />

        {/* Quick Actions */}
        <QuickActionsBar actions={quickActions} onAction={handleCommand} />

        {/* Command Input */}
        <div className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700/50">
          <CommandInput
            onSubmit={handleCommand}
            isProcessing={isProcessing}
            suggestions={suggestions}
          />
        </div>
      </main>
    </div>
  );
}
