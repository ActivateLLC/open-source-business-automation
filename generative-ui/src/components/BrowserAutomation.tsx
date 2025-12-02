'use client';

import React, { useState } from 'react';
import { AutomationTask, AutomationTemplate, AutomationResult } from '@/types/automation';

interface BrowserAutomationProps {
  onClose?: () => void;
}

export function BrowserAutomation({ onClose }: BrowserAutomationProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'custom' | 'history'>('templates');
  const [tasks, setTasks] = useState<AutomationTask[]>([]);

  const templates: AutomationTemplate[] = [
    {
      id: 'lead-enrichment',
      name: 'Lead Enrichment',
      description: 'Automatically gather additional information about leads from LinkedIn or company websites',
      category: 'data-entry',
      icon: '👥',
      steps: [
        { action: 'navigate', description: 'Navigate to lead profile', value: '' },
        { action: 'extract', selector: '.profile-data', description: 'Extract profile information', value: '' },
        { action: 'click', selector: '.company-link', description: 'Navigate to company page', value: '' },
        { action: 'extract', selector: '.company-info', description: 'Extract company details', value: '' },
      ],
    },
    {
      id: 'invoice-download',
      name: 'Invoice Download',
      description: 'Automatically download invoices from vendor portals',
      category: 'data-entry',
      icon: '💰',
      steps: [
        { action: 'navigate', description: 'Navigate to vendor portal', value: '' },
        { action: 'type', selector: '#username', description: 'Enter credentials', value: '' },
        { action: 'click', selector: '.login-btn', description: 'Click login', value: '' },
        { action: 'wait', description: 'Wait for dashboard to load', value: '2000' },
        { action: 'click', selector: '.invoices-link', description: 'Navigate to invoices', value: '' },
        { action: 'extract', selector: '.invoice-list', description: 'Extract invoice data', value: '' },
      ],
    },
    {
      id: 'competitor-monitoring',
      name: 'Competitor Monitoring',
      description: 'Monitor competitor websites for pricing changes and new features',
      category: 'monitoring',
      icon: '🔍',
      steps: [
        { action: 'navigate', description: 'Navigate to competitor website', value: '' },
        { action: 'extract', selector: '.pricing', description: 'Extract pricing information', value: '' },
        { action: 'screenshot', description: 'Take screenshot of page', value: '' },
        { action: 'extract', selector: '.features', description: 'Extract feature list', value: '' },
      ],
    },
    {
      id: 'form-filling',
      name: 'Form Auto-Fill',
      description: 'Automatically fill out repetitive forms across multiple sites',
      category: 'data-entry',
      icon: '📝',
      steps: [
        { action: 'navigate', description: 'Navigate to form', value: '' },
        { action: 'type', selector: '#name', description: 'Fill name field', value: '' },
        { action: 'type', selector: '#email', description: 'Fill email field', value: '' },
        { action: 'type', selector: '#company', description: 'Fill company field', value: '' },
        { action: 'click', selector: '.submit-btn', description: 'Submit form', value: '' },
      ],
    },
    {
      id: 'data-extraction',
      name: 'Data Extraction',
      description: 'Extract structured data from websites for analysis',
      category: 'web-scraping',
      icon: '📊',
      steps: [
        { action: 'navigate', description: 'Navigate to target website', value: '' },
        { action: 'extract', selector: '.data-table', description: 'Extract table data', value: '' },
        { action: 'click', selector: '.next-page', description: 'Go to next page', value: '' },
        { action: 'extract', selector: '.data-table', description: 'Extract more data', value: '' },
      ],
    },
  ];

  const handleRunTemplate = async (template: AutomationTemplate) => {
    const newTask: AutomationTask = {
      id: `task-${Date.now()}`,
      name: template.name,
      description: template.description,
      status: 'pending',
      steps: template.steps.map((step, index) => ({
        ...step,
        id: `step-${index}`,
        completed: false,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setActiveTab('history');

    // Call the API to run the automation
    try {
      const response = await fetch('/api/automation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: template.id }),
      });

      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object' || !('success' in data)) {
        throw new Error('Invalid response format from automation API');
      }
      
      const result = data as AutomationResult;
      
      // Update task with result
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === newTask.id
            ? { ...task, status: result.success ? 'completed' : 'failed', result, updatedAt: new Date().toISOString() }
            : task
        )
      );
    } catch (error: unknown) {
      console.error('Automation error:', error);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === newTask.id
            ? { ...task, status: 'failed', result: { success: false, error: error instanceof Error ? error.message : String(error) }, updatedAt: new Date().toISOString() }
            : task
        )
      );
    }
  };

  const getStatusColor = (status: AutomationTask['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'running':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-primary-500 to-purple-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Browser Automation</h2>
            <p className="text-sm text-white/80">Powered by Stagehand</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        {([
          { id: 'templates', label: 'Templates', icon: '📋' },
          { id: 'custom', label: 'Custom', icon: '⚙️' },
          { id: 'history', label: 'History', icon: '🕐' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-white dark:bg-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                Automation Templates
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Choose from pre-built automation templates for common repetitive tasks
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 dark:hover:border-primary-400 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 flex items-center justify-center text-2xl">
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        {template.name}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                          {template.steps.length} steps
                        </span>
                        <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full">
                          {template.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunTemplate(template);
                    }}
                    className="mt-3 w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Run Automation
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-4">
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 flex items-center justify-center text-4xl mx-auto mb-4">
                ⚙️
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                Custom Automation Builder
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Build your own custom automation workflows with our visual builder. Coming soon!
              </p>
              <button className="mt-4 px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                Automation History
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                View past automation runs and their results
              </p>
            </div>
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-4xl mx-auto mb-4">
                  🕐
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No automation tasks yet. Run a template to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-1">
                          {task.name}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {task.description}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        Created: {new Date(task.createdAt).toLocaleString()}
                      </span>
                      <span>•</span>
                      <span>
                        {task.steps.length} steps
                      </span>
                    </div>
                    {task.result && (
                      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {task.result.success ? '✅ Completed successfully' : `❌ Error: ${task.result.error}`}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
