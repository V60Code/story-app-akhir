const VAPID_PUBLIC_KEY =
  'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function sendSubscriptionToServer(subscription, action = 'subscribe') {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('User not authenticated');
  }

  const endpoint = 'https://story-api.dicoding.dev/v1/notifications/subscribe';

  const payload = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
      auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))),
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to ${action} push notifications`);
    }

    const data = await response.json();
    console.log(`Push notification ${action} successful:`, data);
    return data;
  } catch (error) {
    console.error(`Error ${action}ing push notification:`, error);
    throw error;
  }
}

export async function subscribeUserToPush(reg) {
  try {
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    const existingSubscription = await reg.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('Already subscribed to push notifications');
      return existingSubscription;
    }

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await sendSubscriptionToServer(subscription, 'subscribe');
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push:', error);
    throw error;
  }
}

export async function unsubscribeUserFromPush(reg) {
  try {
    const subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      console.log('No push subscription found');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const endpoint = 'https://story-api.dicoding.dev/v1/notifications/unsubscribe';
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });
      }
    } catch (serverError) {
      console.warn('Failed to unsubscribe from server:', serverError);
    }

    await subscription.unsubscribe();

    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'notifications' });
        if (result.state === 'granted') {
          if (navigator.permissions.revoke) {
            await navigator.permissions.revoke({ name: 'notifications' });
          }
        }
      } catch (permError) {
        console.warn('Could not revoke notification permission:', permError);
      }
    }

    console.log('Successfully unsubscribed from push notifications');
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    throw error;
  }
}
