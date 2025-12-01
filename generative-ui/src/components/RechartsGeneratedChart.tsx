/**
 * Recharts Dynamic Chart Component
 * 
 * Declarative and composable chart component optimized for Generative UI.
 * LLMs excel at generating Recharts code because the API is simple and strictly component-based.
 * 
 * This component is used by the generate_chart MCP tool to render charts dynamically.
 */

'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Chart data types for generate_chart tool
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface GeneratedChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area' | 'doughnut';
  title: string;
  data: ChartDataPoint[];
  config?: {
    color?: string;
    colors?: string[];
    animated?: boolean;
    showLegend?: boolean;
    showGrid?: boolean;
  };
}

interface RechartsGeneratedChartProps {
  chartConfig: GeneratedChartConfig;
  className?: string;
}

// Default color palette optimized for business dashboards
const DEFAULT_COLORS = [
  '#0ea5e9', // Sky blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

/**
 * RechartsGeneratedChart
 * 
 * Renders charts dynamically based on AI-generated configuration.
 * Used by the generate_chart MCP tool for on-demand visualizations.
 */
export function RechartsGeneratedChart({ chartConfig, className = '' }: RechartsGeneratedChartProps) {
  const { type, title, data, config = {} } = chartConfig;
  const {
    color = DEFAULT_COLORS[0],
    colors = DEFAULT_COLORS,
    showLegend = true,
    showGrid = true,
  } = config;

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            {showLegend && <Legend />}
            <Bar 
              dataKey="value" 
              fill={color}
              radius={[4, 4, 0, 0]}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            {showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />}
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            {showLegend && <Legend />}
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        );

      case 'pie':
      case 'doughnut':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={type === 'doughnut' ? 60 : 0}
              outerRadius={100}
              paddingAngle={type === 'doughnut' ? 5 : 0}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]}
                  strokeWidth={2}
                  stroke="#fff"
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-500">
            Unknown chart type: {type}
          </div>
        );
    }
  };

  return (
    <div className={`recharts-container glass-card p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
        {title}
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Helper function to generate chart configuration from AI parameters
 * Used by the generate_chart tool in MCP
 */
export function createChartConfig(
  data: Array<{ label: string; value: number }> | ChartDataPoint[],
  options: {
    chartType?: 'bar' | 'line' | 'pie' | 'area' | 'doughnut';
    title?: string;
    color?: string;
  } = {}
): GeneratedChartConfig {
  const { chartType = 'bar', title = 'Generated Chart', color = DEFAULT_COLORS[0] } = options;

  // Normalize data format
  const normalizedData: ChartDataPoint[] = data.map(item => {
    if ('label' in item) {
      return { name: item.label, value: item.value };
    }
    return item as ChartDataPoint;
  });

  return {
    type: chartType,
    title,
    data: normalizedData,
    config: {
      color,
      colors: DEFAULT_COLORS,
      animated: true,
      showLegend: true,
      showGrid: chartType !== 'pie' && chartType !== 'doughnut',
    },
  };
}

export default RechartsGeneratedChart;
