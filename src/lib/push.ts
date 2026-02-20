import webpush from 'web-push';
import { db } from '@/lib/db';

const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

if (vapidPublic && vapidPrivate) {
  webpush.setVapidDetails(
    'mailto:support@civicplatform.local',
    vapidPublic,
    vapidPrivate
  );
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
  options?: { communityName?: string }
): Promise<void> {
  if (!vapidPublic || !vapidPrivate) {
    console.warn('Push not sent: VAPID keys not configured');
    return;
  }
  const where = options?.communityName
    ? { userId, user: { communityName: options.communityName } }
    : { userId };
  const subs = await db.pushSubscription.findMany({ where });
  const payloadStr = JSON.stringify(payload);
  await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payloadStr
      )
    )
  );
}

export async function sendPushToUsers(userIds: string[], payload: PushPayload): Promise<void> {
  await Promise.all(userIds.map((id) => sendPushToUser(id, payload)));
}

export function isPushConfigured(): boolean {
  return Boolean(vapidPublic && vapidPrivate);
}
