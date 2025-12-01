'use client';

import React from 'react';

interface QuickActionProps {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export function QuickAction({ label, onClick, icon }: QuickActionProps) {
  return (
    <button onClick={onClick} className="quick-action-btn flex items-center gap-2">
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface QuickActionsBarProps {
  actions: { label: string; command: string }[];
  onAction: (command: string) => void;
}

export function QuickActionsBar({ actions, onAction }: QuickActionsBarProps) {
  return (
    <div className="flex flex-wrap gap-2 p-4 border-t border-slate-200 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center mr-2">
        Quick actions:
      </span>
      {actions.map((action, index) => (
        <QuickAction
          key={index}
          label={action.label}
          onClick={() => onAction(action.command)}
        />
      ))}
    </div>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: string) => void;
  activeCategory?: string;
}

export function Sidebar({ isOpen, onClose, onSelectCategory, activeCategory }: SidebarProps) {
  const categories = [
    { id: 'all', label: 'Overview', icon: '🏠', description: 'General business overview' },
    { id: 'leads', label: 'Leads', icon: '👥', description: 'Lead pipeline & scoring' },
    { id: 'revenue', label: 'Revenue', icon: '💰', description: 'Financial metrics' },
    { id: 'customers', label: 'Customers', icon: '🤝', description: 'Customer insights' },
    { id: 'content', label: 'Content', icon: '📝', description: 'Content performance' },
    { id: 'automation', label: 'Automation', icon: '⚡', description: 'Workflow status' },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <span className="text-white text-xl">✨</span>
              </div>
              <div>
                <h1 className="font-bold text-slate-800 dark:text-white">
                  Business AI
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Generative Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onSelectCategory(category.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeCategory === category.id
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xl">{category.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{category.label}</div>
                    <div className="text-xs opacity-70">{category.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </nav>

          {/* MCP Status */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  MCP Servers
                </span>
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Connected
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Database</span>
                  <span className="text-green-500">●</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>n8n Workflows</span>
                  <span className="text-green-500">●</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Kafka Events</span>
                  <span className="text-green-500">●</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ollama AI</span>
                  <span className="text-green-500">●</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon?: React.ReactNode;
}

export function MetricCard({ label, value, change, icon }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="metric-label">{label}</p>
          <p className="metric-value mt-1">{value}</p>
          {change && (
            <div
              className={
                change.direction === 'up'
                  ? 'metric-change-positive mt-2'
                  : 'metric-change-negative mt-2'
              }
            >
              {change.direction === 'up' ? '↑' : '↓'} {change.value}%
            </div>
          )}
        </div>
        {icon && (
          <div className="text-3xl opacity-50">{icon}</div>
        )}
      </div>
    </div>
  );
}

interface MetricsRowProps {
  metrics: MetricCardProps[];
}

export function MetricsRow({ metrics }: MetricsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}
