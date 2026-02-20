'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function PushRegistration() {
  const { user, getToken } = useAuth();
  const [status, setStatus] = useState<'idle' | 'prompting' | 'subscribed' | 'unsupported' | 'error'>('idle');

  useEffect(() => {
    if (!user || typeof window === 'undefined') return;

    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublic) {
      setStatus('unsupported');
      return;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return;
    }

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          setStatus('subscribed');
          return;
        }
        setStatus('prompting');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setStatus('idle');
          return;
        }
        const newSub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
<<<<<<< HEAD
          applicationServerKey: urlBase64ToUint8Array(vapidPublic) as BufferSource,
=======
          applicationServerKey: urlBase64ToUint8Array(vapidPublic),
>>>>>>> 017bcdc (deploy)
        });
        const token = getToken();
        if (!token) {
          setStatus('error');
          return;
        }
        const res = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newSub.toJSON()),
        });
        if (!res.ok) throw new Error('Subscribe failed');
        setStatus('subscribed');
      } catch (e) {
        console.error('Push registration error:', e);
        setStatus('error');
      }
    };

    register();
  }, [user, getToken]);

  if (status === 'unsupported' || status === 'idle') return null;

  return (
    <div className="sr-only" aria-live="polite">
      {status === 'subscribed' && 'Push notifications enabled'}
      {status === 'error' && 'Could not enable push notifications'}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}
