import { NextRequest, NextResponse } from 'next/server';
import { seedAllData } from '@/lib/seed-data';

// Seed historical data endpoint
// Populates builder_expenses, household_expenses, crash_indicators, regional_affordability, economic_index

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    await seedAllData();
    return NextResponse.json({ 
      success: true, 
      message: 'Historical data seeding completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Seeding failed', details: String(error) },
      { status: 500 }
    );
  }
}
