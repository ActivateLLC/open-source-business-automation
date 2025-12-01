'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, ChartData, InsightData } from '@/types';
import { ChatHistory } from './ChatMessage';
import { CommandInput } from './CommandInput';
import { VoiceInput } from './VoiceInput';
import { RechartsChart, ChartClickData } from './RechartsChart';
import { InsightGrid } from './InsightCard';
import { QuickActionsBar, MetricsRow } from './UIElements';
import {
  parseCommand,
  generateChartData,
  generateInsights,
  getSuggestedActions,
  getHelpResponse,
} from '@/lib/command-parser';

interface CanvasItem {
  id: string;
  type: 'chart' | 'insight' | 'text' | 'component';
  data: unknown;
  timestamp: string;
  title?: string;
}

interface CanvasLayoutProps {
  initialMessages?: ChatMessage[];
}

export function CanvasLayout({ initialMessages = [] }: CanvasLayoutProps) {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Show lead pipeline chart",
    "Give me today's insights",
    "How is revenue trending?",
    "Analyze content performance",
  ]);

  // Canvas state
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedCanvasItem, setSelectedCanvasItem] = useState<string | null>(null);
  const [isCanvasExpanded, setIsCanvasExpanded] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);

  // Metrics data
  const metricsData = [
    { label: 'Total Leads', value: '127', change: { value: 12, direction: 'up' as const }, icon: '👥' },
    { label: 'Revenue', value: '$67K', change: { value: 22, direction: 'up' as const }, icon: '💰' },
    { label: 'Customers', value: '89', change: { value: 8, direction: 'up' as const }, icon: '🤝' },
    { label: 'Content Views', value: '12.5K', change: { value: 15, direction: 'up' as const }, icon: '📈' },
  ];

  // Quick actions
  const quickActions = [
    { label: '📊 Charts', command: 'Show me a business overview chart' },
    { label: '💡 Insights', command: 'Give me key insights for today' },
    { label: '🔥 Hot Leads', command: 'Show hot leads that need attention' },
    { label: '💰 Revenue', command: 'How is revenue trending this month?' },
  ];

  // Handle incoming command (from text or voice)
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
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800));

    // Generate response based on intent
    let responseContent = '';
    let chartData: ChartData | undefined = undefined;
    let insightData = undefined;

    if (parsedCommand.intent === 'help') {
      responseContent = getHelpResponse();
    } else if (parsedCommand.intent === 'chart') {
      chartData = generateChartData(parsedCommand);
      responseContent = `I've rendered a ${chartData.type} chart for ${parsedCommand.entity || 'your data'} on the canvas. Click on any data point to drill down into the details.`;
      
      // Add chart to canvas
      const canvasItem: CanvasItem = {
        id: `chart-${Date.now()}`,
        type: 'chart',
        data: chartData,
        timestamp: new Date().toISOString(),
        title: chartData.title,
      };
      setCanvasItems((prev) => [...prev, canvasItem]);
      setSelectedCanvasItem(canvasItem.id);
    } else if (parsedCommand.intent === 'insight') {
      insightData = generateInsights(parsedCommand);
      responseContent = `Here are the key insights${parsedCommand.entity ? ` for ${parsedCommand.entity}` : ''}. I've added them to the canvas for reference.`;
      
      // Add insights to canvas
      const canvasItem: CanvasItem = {
        id: `insight-${Date.now()}`,
        type: 'insight',
        data: insightData,
        timestamp: new Date().toISOString(),
        title: `Insights: ${parsedCommand.entity || 'Business Overview'}`,
      };
      setCanvasItems((prev) => [...prev, canvasItem]);
      setSelectedCanvasItem(canvasItem.id);
    } else if (parsedCommand.intent === 'query') {
      // Generate appropriate response based on entity
      const entityResponses: Record<string, string> = {
        leads: `Based on your lead data:\n\n• **Total Leads**: 127\n• **Hot Leads**: 15 (12%)\n• **Warm Leads**: 45 (35%)\n• **Cold Leads**: 67 (53%)\n• **Average Score**: 42.5\n• **Conversion Rate**: 12.5%\n\nSay "Show me a lead chart" to visualize this data on the canvas.`,
        customers: `Here's your customer overview:\n\n• **Total Customers**: 89\n• **Active Customers**: 72 (81%)\n• **Average LTV**: $4,250\n• **New This Month**: 12\n\nYour enterprise segment shows the highest engagement.`,
        invoices: `Financial Summary:\n\n• **Total Invoices**: 156\n• **Total Value**: $245,000\n• **Paid**: $198,000 (81%)\n• **Pending**: $35,000\n• **Overdue**: $12,000 (8 invoices)\n\nI recommend following up on the overdue invoices.`,
        revenue: `Revenue Overview:\n\n• **This Month**: $67,000\n• **Last Month**: $55,000\n• **Growth**: +22%\n• **Target**: $60,000 (112% achieved)\n\nSay "Chart revenue trend" to see the visualization.`,
        content: `Content Performance:\n\n• **Total Items**: 45\n• **Published**: 38\n• **AI Generated**: 22 (58%)\n• **Average Views**: 1,250\n• **Top Performer**: "AI in Business" (4,500 views)`,
        general: `Here's your business overview:\n\n• **Active Leads**: 127\n• **Customers**: 89\n• **Open Invoices**: 45\n• **Published Content**: 38\n\nAsk me to "show charts" or "give insights" to visualize on the canvas.`,
      };
      responseContent = entityResponses[parsedCommand.entity || 'general'] || entityResponses.general;
    } else if (parsedCommand.intent === 'action') {
      responseContent = `I understand you want to ${command}. This action would typically trigger an automation workflow. In a production environment, this would:\n\n1. Connect to the n8n workflow engine\n2. Execute the appropriate automation\n3. Return the results\n\nWould you like me to explain more about available automations?`;
    } else {
      responseContent = `I understand you're asking about "${command}". Let me help you with that.\n\nBased on your query, I can:\n• Generate visualizations on the canvas\n• Provide detailed insights\n• Answer specific questions about your data\n\nTry saying "Show me a chart of leads" or "Give me revenue insights".`;
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
      chartData: undefined, // Charts go to canvas, not chat
      insightData: undefined, // Insights go to canvas, not chat
      isGenerating: false,
    };

    setMessages((prev) =>
      prev.map((msg) => (msg.id === processingMessage.id ? assistantMessage : msg))
    );
    setIsProcessing(false);
  }, []);

  // Handle voice input
  const handleVoiceInput = useCallback((transcript: string) => {
    if (transcript.trim()) {
      handleCommand(transcript.trim());
    }
  }, [handleCommand]);

  // Handle chart click for drill-down
  const handleChartClick = useCallback((clickData: ChartClickData) => {
    const refinementCommand = `Filter by ${clickData.label}`;
    handleCommand(refinementCommand);
  }, [handleCommand]);

  // Clear canvas
  const clearCanvas = () => {
    setCanvasItems([]);
    setSelectedCanvasItem(null);
  };

  // Remove item from canvas
  const removeCanvasItem = (itemId: string) => {
    setCanvasItems((prev) => prev.filter((item) => item.id !== itemId));
    if (selectedCanvasItem === itemId) {
      setSelectedCanvasItem(null);
    }
  };

  // Scroll canvas to show new items
  useEffect(() => {
    if (canvasRef.current && canvasItems.length > 0) {
      canvasRef.current.scrollTo({
        top: canvasRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [canvasItems.length]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Left Panel - Chat Controller */}
      <div 
        className={`flex flex-col transition-all duration-300 ${
          isCanvasExpanded ? 'w-1/3 min-w-[300px]' : 'w-1/2'
        } border-r border-slate-200 dark:border-slate-700`}
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-white text-xl">🎤</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">
                Voice Canvas
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speak or type to create visualizations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              AI Connected
            </span>
          </div>
        </header>

        {/* Metrics Row */}
        <MetricsRow metrics={metricsData} />

        {/* Chat History */}
        <div className="flex-1 overflow-hidden">
          <ChatHistory messages={messages} />
        </div>

        {/* Voice Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 flex justify-center">
          <VoiceInput 
            onTranscript={handleVoiceInput}
            isProcessing={isProcessing}
          />
        </div>

        {/* Quick Actions */}
        <QuickActionsBar actions={quickActions} onAction={handleCommand} />

        {/* Text Input */}
        <div className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700/50">
          <CommandInput
            onSubmit={handleCommand}
            isProcessing={isProcessing}
            suggestions={suggestions}
            placeholder="Or type here... e.g., 'Show lead pipeline chart'"
          />
        </div>
      </div>

      {/* Right Panel - Canvas Stage */}
      <div 
        className={`flex flex-col transition-all duration-300 ${
          isCanvasExpanded ? 'w-2/3' : 'w-1/2'
        }`}
      >
        {/* Canvas Header */}
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎨</span>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Canvas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {canvasItems.length} {canvasItems.length === 1 ? 'visualization' : 'visualizations'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCanvasExpanded(!isCanvasExpanded)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              aria-label={isCanvasExpanded ? 'Collapse canvas' : 'Expand canvas'}
            >
              {isCanvasExpanded ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
            {canvasItems.length > 0 && (
              <button
                onClick={clearCanvas}
                className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </header>

        {/* Canvas Content */}
        <div 
          ref={canvasRef}
          className="flex-1 overflow-y-auto p-6"
        >
          {canvasItems.length === 0 ? (
            <CanvasEmptyState />
          ) : (
            <div className="space-y-6">
              {canvasItems.map((item) => (
                <CanvasItemRenderer
                  key={item.id}
                  item={item}
                  isSelected={selectedCanvasItem === item.id}
                  onSelect={() => setSelectedCanvasItem(item.id)}
                  onRemove={() => removeCanvasItem(item.id)}
                  onChartClick={handleChartClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Empty state component for canvas
function CanvasEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-6">
        <span className="text-5xl">🎨</span>
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
        Your Canvas is Empty
      </h3>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
        Use voice commands or type to generate charts, insights, and visualizations. 
        They&apos;ll appear here in real-time.
      </p>
      <div className="grid grid-cols-2 gap-3 text-left max-w-md">
        <CanvasHintCard 
          icon="🗣️" 
          title="Voice Command" 
          example='"Show me a lead pipeline chart"' 
        />
        <CanvasHintCard 
          icon="📊" 
          title="Generate Charts" 
          example='"Revenue trend this month"' 
        />
        <CanvasHintCard 
          icon="💡" 
          title="Get Insights" 
          example='"Key business insights"' 
        />
        <CanvasHintCard 
          icon="🎯" 
          title="Drill Down" 
          example="Click any data point" 
        />
      </div>
    </div>
  );
}

// Hint card component
function CanvasHintCard({ icon, title, example }: { icon: string; title: string; example: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <span className="text-2xl">{icon}</span>
      <h4 className="font-medium text-slate-800 dark:text-white mt-2">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{example}</p>
    </div>
  );
}

// Canvas item renderer
interface CanvasItemRendererProps {
  item: CanvasItem;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onChartClick: (data: ChartClickData) => void;
}

function CanvasItemRenderer({ 
  item, 
  isSelected, 
  onSelect, 
  onRemove,
  onChartClick,
}: CanvasItemRendererProps) {
  const getIcon = () => {
    switch (item.type) {
      case 'chart': return '📊';
      case 'insight': return '💡';
      default: return '📝';
    }
  };

  const renderContent = () => {
    if (item.type === 'chart' && item.data) {
      return (
        <RechartsChart 
          chartData={item.data as ChartData} 
          onDataPointClick={onChartClick}
        />
      );
    }
    
    if (item.type === 'insight' && item.data) {
      return (
        <InsightGrid 
          insights={item.data as InsightData[]} 
          columns={2}
        />
      );
    }
    
    return null;
  };

  return (
    <div
      className={`glass-card p-6 transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-primary-500 shadow-xl' 
          : 'hover:shadow-lg'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getIcon()}</span>
          <h4 className="font-medium text-slate-800 dark:text-white">
            {item.title || 'Untitled'}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-colors"
            aria-label="Remove item"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {renderContent()}
    </div>
  );
}

export default CanvasLayout;
