'use client';

import React from 'react';
import { ChatMessage } from '@/types';
import { DynamicChart } from './DynamicChart';
import { InsightGrid } from './InsightCard';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-1'}`}>
        {/* Avatar */}
        <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
              isUser
                ? 'bg-primary-500 text-white'
                : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
            }`}
          >
            {isUser ? '👤' : '🤖'}
          </div>
          
          <div className="flex flex-col gap-2">
            {/* Message bubble */}
            <div className={isUser ? 'message-user' : 'message-assistant'}>
              {message.isGenerating ? (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Chart if present */}
            {message.chartData && !message.isGenerating && (
              <div className="mt-2">
                <DynamicChart chartData={message.chartData} />
              </div>
            )}

            {/* Insights if present */}
            {message.insightData && message.insightData.length > 0 && !message.isGenerating && (
              <InsightGrid insights={message.insightData} />
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div
          className={`text-xs text-slate-400 mt-1 ${
            isUser ? 'text-right mr-10' : 'ml-10'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}

interface ChatHistoryProps {
  messages: ChatMessage[];
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.length === 0 ? (
        <WelcomeMessage />
      ) : (
        messages.map((message) => (
          <ChatMessageBubble key={message.id} message={message} />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-2xl shadow-primary-500/30">
        <span className="text-4xl">✨</span>
      </div>
      <h2 className="text-2xl font-bold gradient-text mb-2">
        Welcome to Business AI Assistant
      </h2>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
        Ask me anything about your business. I can generate charts, provide insights,
        and help you understand your data - all through natural conversation.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
        <QuickStartCard
          icon="📊"
          title="Visualize Data"
          description="Show me a lead pipeline chart"
        />
        <QuickStartCard
          icon="💡"
          title="Get Insights"
          description="What are today's key insights?"
        />
        <QuickStartCard
          icon="💰"
          title="Track Revenue"
          description="How is revenue trending?"
        />
        <QuickStartCard
          icon="📈"
          title="Analyze Performance"
          description="Analyze my content performance"
        />
      </div>
    </div>
  );
}

interface QuickStartCardProps {
  icon: string;
  title: string;
  description: string;
}

function QuickStartCard({ icon, title, description }: QuickStartCardProps) {
  return (
    <div className="glass-card p-4 text-left hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-medium text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &quot;{description}&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
