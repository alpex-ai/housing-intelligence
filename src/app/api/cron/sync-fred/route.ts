import { NextRequest, NextResponse } from 'next/server';
import { syncData } from '../../../../../scripts/sync-fred-data';

// Vercel Cron Job Handler
// Runs daily at 9 AM UTC to sync FRED data

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    await syncData();
    return NextResponse.json({ success: true, message: 'Data sync completed' });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: String(error) },
      { status: 500 }
    );
  }
}
