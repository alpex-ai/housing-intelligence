import { NextRequest, NextResponse } from 'next/server';
import { syncAllData } from '@/lib/comprehensive-sync';

// Comprehensive data sync endpoint
// Syncs builder costs, household expenses, crash indicators, regional data

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    await syncAllData();
    return NextResponse.json({ 
      success: true, 
      message: 'Comprehensive data sync completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Comprehensive sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: String(error) },
      { status: 500 }
    );
  }
}

// Also allow POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
