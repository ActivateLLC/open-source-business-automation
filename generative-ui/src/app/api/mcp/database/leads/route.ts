import { NextRequest, NextResponse } from 'next/server';

// Mock leads data - In production, connects to PostgreSQL via MCP
const mockLeads = [
  { id: 1, name: 'John Smith', email: 'john@acme.com', company: 'Acme Corp', tier: 'hot', score: 85, ai_score: 88, status: 'new', created_at: '2024-11-28' },
  { id: 2, name: 'Jane Doe', email: 'jane@startup.io', company: 'Startup.io', tier: 'warm', score: 62, ai_score: 65, status: 'contacted', created_at: '2024-11-27' },
  { id: 3, name: 'Bob Wilson', email: 'bob@enterprise.com', company: 'Enterprise Inc', tier: 'hot', score: 92, ai_score: 94, status: 'new', created_at: '2024-11-28' },
  { id: 4, name: 'Alice Brown', email: 'alice@tech.co', company: 'Tech Co', tier: 'cold', score: 35, ai_score: 38, status: 'nurturing', created_at: '2024-11-25' },
  { id: 5, name: 'Charlie Davis', email: 'charlie@global.net', company: 'Global Net', tier: 'warm', score: 55, ai_score: 58, status: 'qualified', created_at: '2024-11-26' },
  { id: 6, name: 'Diana Evans', email: 'diana@mega.corp', company: 'Mega Corp', tier: 'hot', score: 88, ai_score: 91, status: 'new', created_at: '2024-11-28' },
  { id: 7, name: 'Edward Fox', email: 'edward@small.biz', company: 'Small Biz', tier: 'cold', score: 28, ai_score: 30, status: 'inactive', created_at: '2024-11-20' },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, status, limit = 50 } = body;

    let filteredLeads = [...mockLeads];

    if (tier) {
      filteredLeads = filteredLeads.filter(l => l.tier === tier);
    }
    if (status) {
      filteredLeads = filteredLeads.filter(l => l.status === status);
    }
    if (limit) {
      filteredLeads = filteredLeads.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      leads: filteredLeads,
      total: mockLeads.length,
      filtered: filteredLeads.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    leads: mockLeads,
    total: mockLeads.length,
  });
}
