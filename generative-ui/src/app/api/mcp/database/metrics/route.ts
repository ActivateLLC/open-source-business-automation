import { NextResponse } from 'next/server';

// Mock metrics data - In production, aggregated from PostgreSQL via MCP
export async function GET() {
  const metrics = {
    leads: {
      total: 127,
      hot: 15,
      warm: 45,
      cold: 67,
      avgScore: 42.5,
      newToday: 8,
      converted: 12,
    },
    revenue: {
      total: 245000,
      paid: 198000,
      outstanding: 47000,
      overdue: 12000,
      monthlyTrend: [45000, 52000, 48000, 61000, 55000, 67000],
    },
    customers: {
      total: 89,
      active: 72,
      avgLTV: 4250,
      newThisMonth: 12,
    },
    content: {
      total: 45,
      published: 38,
      aiGenerated: 22,
      avgViews: 1250,
    },
    lastUpdated: new Date().toISOString(),
  };

  return NextResponse.json(metrics);
}
