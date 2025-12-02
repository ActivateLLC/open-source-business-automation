/**
 * Types for browser automation with Stagehand
 */

export interface AutomationTask {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  url?: string;
  steps: AutomationStep[];
  result?: AutomationResult;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationStep {
  id: string;
  action: 'navigate' | 'click' | 'type' | 'extract' | 'wait' | 'screenshot';
  selector?: string;
  value?: string;
  description: string;
  completed: boolean;
}

export interface AutomationResult {
  success: boolean;
  data?: Record<string, unknown> | string | number | boolean | null;
  error?: string;
  screenshots?: string[];
  extractedData?: Record<string, unknown>;
}

export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'data-entry' | 'web-scraping' | 'testing' | 'monitoring' | 'custom';
  icon: string;
  steps: Omit<AutomationStep, 'id' | 'completed'>[];
  url?: string;
}

export interface StagehandConfig {
  headless?: boolean;
  debugDom?: boolean;
  browserbaseSessionId?: string;
  enableCaching?: boolean;
  verbose?: 0 | 1 | 2;
}
