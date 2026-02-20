// Civic points: +10 approved, -200 false report, +5 verification, +5 resolution verification.
// Leaderboard = top 3 by weekly_points. Reset weekly via scheduled job.

import { db } from './db';

const WEEKLY_RESET_KEY = 'last_weekly_reset';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function getLastResetTimestamp(): Promise<Date | null> {
  const row = await db.systemSettings.findUnique({
    where: { key: WEEKLY_RESET_KEY },
  });
  if (!row?.lastResetTimestamp) return null;
  return row.lastResetTimestamp;
}

export async function resetWeeklyPointsIfDue(): Promise<{ reset: boolean; at?: Date }> {
  const row = await db.systemSettings.findUnique({
    where: { key: WEEKLY_RESET_KEY },
  });

  const now = new Date();
  const lastReset = row?.lastResetTimestamp ?? null;
  const shouldReset = !lastReset || (now.getTime() - lastReset.getTime() >= ONE_WEEK_MS);

  if (!shouldReset) {
    return { reset: false };
  }

  await db.$transaction(async (tx) => {
    await tx.user.updateMany({
      data: { weeklyPoints: 0 },
    });
    await tx.systemSettings.upsert({
      where: { key: WEEKLY_RESET_KEY },
      create: {
        key: WEEKLY_RESET_KEY,
        value: now.toISOString(),
        lastResetTimestamp: now,
      },
      update: {
        value: now.toISOString(),
        lastResetTimestamp: now,
      },
    });
  });

  return { reset: true, at: now };
}

/** Called by cron: resets all users' weekly_points and updates last_reset_timestamp. */
export async function resetWeeklyPoints(): Promise<{ success: boolean; reset: boolean }> {
  try {
    const { reset } = await resetWeeklyPointsIfDue();
    if (reset) console.log('Weekly points reset completed.');
    return { success: true, reset };
  } catch (error) {
    console.error('Error resetting weekly points:', error);
    throw error;
  }
}
