import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { analyzeScenario } from '@/lib/housing-analysis';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { homeId, targetCity, scenarioType } = body;

    if (!homeId || !targetCity || !scenarioType) {
      return NextResponse.json(
        { error: 'Missing required fields: homeId, targetCity, scenarioType' },
        { status: 400 }
      );
    }

    // Verify home belongs to user
    const { data: home } = await supabase
      .from('user_homes')
      .select('id')
      .eq('id', homeId)
      .eq('user_id', session.user.id)
      .single();

    if (!home) {
      return NextResponse.json(
        { error: 'Home not found or unauthorized' },
        { status: 404 }
      );
    }

    // Run analysis
    const analysis = await analyzeScenario(supabase, {
      homeId,
      targetCity,
      scenarioType
    });

    return NextResponse.json({
      success: true,
      analysis
    });

  } catch (error: any) {
    console.error('Scenario analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
