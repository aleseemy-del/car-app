import { useEffect } from 'react';
import { useStore } from '../store/AppStore';
import { computeReminders } from '../utils/reminders';
import { scheduleReminderNotifications } from './notifications';

/** يعيد جدولة إشعارات الجوال كل ما تغيّرت السيارات أو الإعدادات */
export default function ReminderScheduler() {
  const { state } = useStore();
  const key = JSON.stringify([state.cars, state.settings.notifications, state.settings.oilWarnKm]);

  useEffect(() => {
    const reminders = state.cars.flatMap((c) => computeReminders(c, state.settings.oilWarnKm));
    scheduleReminderNotifications(reminders, state.settings.notifications);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}
