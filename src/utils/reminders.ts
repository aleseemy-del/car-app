import type { Car } from '../store/types';
import { daysUntil, formatDate, formatNumber } from './format';

export type Reminder = {
  id: string;
  title: string;
  body: string;
  serviceId: string; // يفتح صفحة الخدمة عند الضغط
  urgent: boolean;
  /** متى ينرسل إشعار الجوال (للمواعيد بالتاريخ) */
  notifyOn?: string; // YYYY-MM-DD
};

const DATE_WARN_DAYS = 120;
const DATE_URGENT_DAYS = 30;

/** يطلع التذكيرات المستحقة لسيارة: الزيت بالكيلو، والتأمين والفحص بالتاريخ */
/** oilWarnKm: قبل كم كيلو نذكّر (من الإعدادات) */
export function computeReminders(car: Car, oilWarnKm = 1000, today = new Date()): Reminder[] {
  const list: Reminder[] = [];

  const oilLeft = car.oilDueKm != null ? car.oilDueKm - car.mileageKm : Infinity; // ما سجّل = ما نذكّر
  if (oilLeft <= oilWarnKm) {
    list.push({
      id: `${car.id}-oil`,
      title: oilLeft <= 0 ? 'فات موعد تغيير الزيت' : 'تغيير الزيت قرّب',
      body: oilLeft <= 0 ? `تجاوزت الموعد بـ ${formatNumber(-oilLeft)} كم` : `باقي ${formatNumber(oilLeft)} كم — احجز موعدك`,
      serviceId: 'oil',
      urgent: oilLeft <= Math.min(500, oilWarnKm),
    });
  }

  const dated: [string | undefined, string, string][] = [
    [car.insuranceExpiry, 'insurance', 'التأمين'],
    [car.inspectionExpiry, 'inspection', 'الفحص الفني'],
  ];
  for (const [date, serviceId, label] of dated) {
    if (!date) continue;
    const days = daysUntil(date, today);
    if (days > DATE_WARN_DAYS) continue;
    const notify = new Date(date);
    notify.setDate(notify.getDate() - DATE_URGENT_DAYS);
    list.push({
      id: `${car.id}-${serviceId}`,
      title: days < 0 ? `${label} منتهي` : `${label} ينتهي بعد ${days} يوم`,
      body: formatDate(date),
      serviceId,
      urgent: days <= DATE_URGENT_DAYS,
      notifyOn: notify.toISOString().slice(0, 10),
    });
  }

  return list.sort((a, b) => Number(b.urgent) - Number(a.urgent));
}
