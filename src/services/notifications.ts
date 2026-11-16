import * as Notifications from 'expo-notifications';
import type { Reminder } from '../utils/reminders';
import { tr } from '../i18n';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * يجدول إشعارات الجوال للتذكيرات:
 * - المواعيد بالتاريخ (تأمين، فحص): الساعة 9 الصبح قبلها بشهر
 * - الزيت العاجل: بعد دقيقة (مرة وحدة لكل جدولة)
 * يلغي القديم أول عشان ما يتكرر.
 */
export async function scheduleReminderNotifications(reminders: Reminder[], enabled: boolean) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!enabled || reminders.length === 0) return;

    const perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted) return;

    const now = Date.now();
    for (const r of reminders) {
      let date: Date | null = null;
      if (r.notifyOn) {
        const [y, m, d] = r.notifyOn.split('-').map(Number);
        date = new Date(y, m - 1, d, 9, 0);
        if (date.getTime() <= now) date = r.urgent ? new Date(now + 60_000) : null;
      } else if (r.urgent) {
        date = new Date(now + 60_000);
      }
      if (!date) continue;

      await Notifications.scheduleNotificationAsync({
        content: { title: tr(r.title), body: tr(r.body), data: { serviceId: r.serviceId } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      });
    }
  } catch {
    // الإشعارات اختيارية — لو فشلت ما نوقف التطبيق
  }
}

/** تنبيه تجريبي بعد 5 ثواني — عشان تتأكد إن الإشعارات شغالة على جوالك */
export async function sendTestNotification(title: string, body: string): Promise<boolean> {
  try {
    const perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted) return false;
    await Notifications.scheduleNotificationAsync({
      content: { title: tr(title), body: tr(body) },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 },
    });
    return true;
  } catch {
    return false;
  }
}
