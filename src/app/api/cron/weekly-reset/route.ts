import { NextRequest, NextResponse } from 'next/server';
import { resetWeeklyPoints } from '@/lib/weekly-reset';

// This endpoint should be protected and called by a cron service
// Add authentication/authorization as needed
export async function POST(request: NextRequest) {
  // Optional: Add authentication check here
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    const result = await resetWeeklyPoints();
    return NextResponse.json({
      success: result.success,
      reset: result.reset,
      message: result.reset ? 'Weekly points reset' : 'Reset not due yet',
    });
  } catch (error) {
    console.error('Weekly reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset weekly points' },
      { status: 500 }
    );
  }
}
