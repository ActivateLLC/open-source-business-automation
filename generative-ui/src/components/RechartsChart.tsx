'use client';

import React, { useState, useCallback } from 'react';
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
  Sector,
} from 'recharts';
import { ChartData as ChartDataType } from '@/types';

interface RechartsChartProps {
  chartData: ChartDataType;
  className?: string;
  onDataPointClick?: (data: ChartClickData) => void;
}

export interface ChartClickData {
  label: string;
  value: number;
  datasetLabel?: string;
  index: number;
  chartType: string;
}

// Color palette for charts
const CHART_COLORS = [
  '#0ea5e9', // sky-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#d946ef', // fuchsia-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

// Custom tooltip component
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    dataKey?: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700/50 backdrop-blur-sm">
        {label && <p className="text-sm font-medium mb-2 text-slate-300">{label}</p>}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-400">{entry.name || entry.dataKey}:</span>
            <span className="font-semibold">
              {typeof entry.value === 'number' 
                ? entry.value.toLocaleString() 
                : entry.value
              }
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// Active sector shape for pie charts (for hover effects)
interface ActiveShapeProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: { name: string };
  percent: number;
  value: number;
}

function RenderActiveShape(props: ActiveShapeProps) {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-sm font-medium">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#6b7280" className="text-xs">
        {`${value.toLocaleString()}`}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#9ca3af" className="text-xs">
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
}

export function RechartsChart({ chartData, className = '', onDataPointClick }: RechartsChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [selectedDataPoint, setSelectedDataPoint] = useState<ChartClickData | null>(null);

  // Transform chart data to Recharts format
  const transformData = useCallback(() => {
    const { labels, datasets } = chartData;
    return labels.map((label, index) => {
      const dataPoint: Record<string, string | number> = { name: label };
      datasets.forEach((dataset, datasetIndex) => {
        const key = dataset.label || `value${datasetIndex}`;
        dataPoint[key] = dataset.data[index];
      });
      return dataPoint;
    });
  }, [chartData]);

  // Handle click on data point
  const handleClick = useCallback((dataPoint: Record<string, unknown>, index: number) => {
    const clickData: ChartClickData = {
      label: dataPoint.name as string,
      value: Object.values(dataPoint).filter((v): v is number => typeof v === 'number')[0] || 0,
      datasetLabel: chartData.datasets[0]?.label,
      index,
      chartType: chartData.type,
    };
    setSelectedDataPoint(clickData);
    onDataPointClick?.(clickData);
  }, [chartData, onDataPointClick]);

  // Handle pie chart hover
  const onPieEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index);
  }, []);

  // Get colors for the chart
  const getColors = (): string[] => {
    const firstDataset = chartData.datasets[0];
    if (firstDataset?.backgroundColor) {
      if (Array.isArray(firstDataset.backgroundColor)) {
        return firstDataset.backgroundColor;
      }
      return [firstDataset.backgroundColor];
    }
    return CHART_COLORS;
  };

  const colors = getColors();
  const data = transformData();

  // Render bar chart
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis 
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {chartData.datasets.map((dataset, index) => (
          <Bar
            key={dataset.label || index}
            dataKey={dataset.label || `value${index}`}
            fill={Array.isArray(colors) ? colors[index % colors.length] : colors}
            radius={[4, 4, 0, 0]}
            onClick={(barData) => {
              if (barData && barData.name) {
                const dataIndex = data.findIndex(d => d.name === barData.name);
                handleClick(barData as Record<string, unknown>, dataIndex);
              }
            }}
            cursor="pointer"
          >
            {data.map((_, cellIndex) => (
              <Cell
                key={`cell-${cellIndex}`}
                fill={Array.isArray(colors) ? colors[cellIndex % colors.length] : colors}
                opacity={selectedDataPoint?.index === cellIndex ? 1 : 0.85}
                stroke={selectedDataPoint?.index === cellIndex ? '#000' : 'none'}
                strokeWidth={selectedDataPoint?.index === cellIndex ? 2 : 0}
              />
            ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  // Render line chart
  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis 
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {chartData.datasets.map((dataset, index) => (
          <Line
            key={dataset.label || index}
            type="monotone"
            dataKey={dataset.label || `value${index}`}
            stroke={typeof dataset.borderColor === 'string' ? dataset.borderColor : colors[index % colors.length]}
            strokeWidth={3}
            dot={{ r: 4, fill: colors[index % colors.length], strokeWidth: 2 }}
            activeDot={{ r: 6, cursor: 'pointer' }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  // Render area chart
  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          {chartData.datasets.map((dataset, index) => {
            const color = typeof dataset.borderColor === 'string' 
              ? dataset.borderColor 
              : colors[index % colors.length];
            return (
              <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis 
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {chartData.datasets.map((dataset, index) => {
          const color = typeof dataset.borderColor === 'string' 
            ? dataset.borderColor 
            : colors[index % colors.length];
          return (
            <Area
              key={dataset.label || index}
              type="monotone"
              dataKey={dataset.label || `value${index}`}
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${index})`}
              activeDot={{ r: 6, cursor: 'pointer' }}
            />
          );
        })}
      </AreaChart>
    </ResponsiveContainer>
  );

  // Render pie/doughnut chart
  const renderPieChart = () => {
    // For pie charts, we need to transform data differently
    const pieData = chartData.labels.map((label, index) => ({
      name: label,
      value: chartData.datasets[0]?.data[index] || 0,
    }));

    const innerRadius = chartData.type === 'doughnut' ? 60 : 0;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={(props: unknown) => <RenderActiveShape {...(props as ActiveShapeProps)} />}
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onClick={(_, index) => handleClick({ ...pieData[index], name: pieData[index].name }, index)}
            cursor="pointer"
          >
            {pieData.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]}
                opacity={selectedDataPoint?.index === index ? 1 : 0.85}
                stroke={selectedDataPoint?.index === index ? '#000' : '#fff'}
                strokeWidth={selectedDataPoint?.index === index ? 2 : 1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Select the appropriate chart renderer
  const renderChart = () => {
    switch (chartData.type) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'area':
        return renderAreaChart();
      case 'pie':
      case 'doughnut':
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div className={`chart-container ${className}`}>
      {/* Chart Title */}
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 text-center">
        {chartData.title}
      </h3>
      
      {/* Chart */}
      {renderChart()}
      
      {/* Interactive hint */}
      {onDataPointClick && (
        <p className="text-xs text-slate-400 text-center mt-3">
          💡 Click on any data point to drill down
        </p>
      )}
      
      {/* Selected data point indicator */}
      {selectedDataPoint && (
        <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-primary-700 dark:text-primary-300 font-medium">
                Selected: {selectedDataPoint.label}
              </span>
              <span className="text-xs text-primary-600 dark:text-primary-400 ml-2">
                ({selectedDataPoint.value.toLocaleString()})
              </span>
            </div>
            <button
              onClick={() => setSelectedDataPoint(null)}
              className="text-primary-500 hover:text-primary-700 text-xs"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Export with the same name for drop-in replacement
export { RechartsChart as DynamicRechartsChart };
