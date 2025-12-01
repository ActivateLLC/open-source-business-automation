'use client';

import React from 'react';
import { ChartData as ChartDataType } from '@/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

interface DynamicChartProps {
  chartData: ChartDataType;
  className?: string;
}

export function DynamicChart({ chartData, className = '' }: DynamicChartProps) {
  // Common chart options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
        },
      },
      title: {
        display: true,
        text: chartData.title,
        font: {
          size: 18,
          weight: 'bold' as const,
          family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
      },
    },
  };

  const barLineOptions = {
    ...commonOptions,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 11 },
        },
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          font: { size: 11 },
        },
      },
    },
  };

  const pieOptions = {
    ...commonOptions,
    cutout: chartData.type === 'doughnut' ? '60%' : 0,
  };

  // Prepare data for chart.js format
  const data = {
    labels: chartData.labels,
    datasets: chartData.datasets.map((ds) => ({
      ...ds,
      tension: 0.4,
      borderWidth: chartData.type === 'line' || chartData.type === 'area' ? 3 : 1,
      pointRadius: chartData.type === 'line' || chartData.type === 'area' ? 4 : 0,
      pointHoverRadius: chartData.type === 'line' || chartData.type === 'area' ? 6 : 0,
    })),
  };

  const renderChart = () => {
    switch (chartData.type) {
      case 'bar':
        return <Bar data={data} options={barLineOptions} />;
      case 'line':
      case 'area':
        return <Line data={data} options={barLineOptions} />;
      case 'pie':
        return <Pie data={data} options={pieOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={pieOptions} />;
      default:
        return <Bar data={data} options={barLineOptions} />;
    }
  };

  return (
    <div className={`chart-container ${className}`}>
      <div className="h-[300px] w-full">
        {renderChart()}
      </div>
    </div>
  );
}
