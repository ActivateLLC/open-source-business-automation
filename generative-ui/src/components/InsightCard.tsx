'use client';

import React from 'react';
import { InsightData } from '@/types';

interface InsightCardProps {
  insight: InsightData;
  onClick?: () => void;
}

export function InsightCard({ insight, onClick }: InsightCardProps) {
  const typeStyles = {
    hot: 'insight-card-hot',
    success: 'insight-card-success',
    warning: 'insight-card-warning',
    info: 'insight-card-info',
  };

  const typeIcons = {
    hot: '🔥',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div
      className={`insight-card ${typeStyles[insight.type]}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{typeIcons[insight.type]}</span>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">
              {insight.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {insight.description}
            </p>
          </div>
        </div>
        {insight.metric && (
          <div className="text-right ml-4">
            <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
              {insight.metric}
            </span>
          </div>
        )}
      </div>

      {insight.change && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={
              insight.change.direction === 'up'
                ? 'metric-change-positive'
                : 'metric-change-negative'
            }
          >
            {insight.change.direction === 'up' ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {insight.change.value}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {insight.change.period}
          </span>
        </div>
      )}

      {insight.actionLabel && (
        <div className="mt-4">
          <button className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1">
            {insight.actionLabel}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

interface InsightGridProps {
  insights: InsightData[];
  columns?: 1 | 2 | 3;
}

export function InsightGrid({ insights, columns = 2 }: InsightGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 mt-4`}>
      {insights.map((insight, index) => (
        <div
          key={insight.id}
          className="animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <InsightCard insight={insight} />
        </div>
      ))}
    </div>
  );
}
