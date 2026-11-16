import type { Tone } from '../theme/tones';
import type { Car, Expense, ServiceLog } from '../store/types';
import type { ServiceKey } from '../data/serviceMeta';
import type { Weather } from '../services/weather';
import { daysUntil, formatDate, formatKwd, formatNumber } from './format';

export type ServiceView = {
  /** المستخدم سجّل شي لهالخدمة */
  recorded: boolean;
  /** النص الصغير تحت المربع */
  value: string;
  tone: Tone;
  headline: string;
  summary: string;
  progress?: { label: string; value: number; caption: string };
  stats: { label: string; value: string }[];
};

type Ctx = { car: Car; logs: ServiceLog[]; expenses: Expense[]; weather?: Weather | null; today?: Date; oilWarnKm?: number };

const empty = (summary: string): ServiceView => ({ recorded: false, value: 'سجّل', tone: 'neutral', headline: 'ما سجّلت', summary, stats: [] });

const monthsSince = (iso: string, today: Date) => {
  const [y, m] = iso.split('-').map(Number);
  return (today.getFullYear() - y) * 12 + (today.getMonth() + 1 - m);
};
const ago = (months: number) => (months <= 0 ? 'هالشهر' : months === 1 ? 'قبل شهر' : months < 12 ? `قبل ${months} شهور` : `قبل ${Math.floor(months / 12)} سنة${months % 12 ? ` و${months % 12} شهور` : ''}`);
const latest = <T extends { date: string }>(xs: T[]) => [...xs].sort((a, b) => b.date.localeCompare(a.date))[0];

/** يحسب حالة الخدمة من سجلات المستخدم بس — بدون سجل = "سجّل" */
export function serviceView(key: ServiceKey, { car, logs, expenses, weather, today = new Date(), oilWarnKm = 1000 }: Ctx): ServiceView {
  const mine = logs.filter((l) => l.carId === car.id && l.service === key);
  const last = latest(mine);

  switch (key) {
    case 'oil': {
      if (car.oilDueKm == null) return empty('سجّل آخر تغيير زيت عشان نحسب لك الموعد القادم ونذكّرك.');
      const left = car.oilDueKm - car.mileageKm;
      const used = 1 - left / car.oilIntervalKm;
      const tone: Tone = left <= 0 ? 'critical' : left <= oilWarnKm ? 'warning' : 'good';
      return {
        recorded: true,
        value: left <= 0 ? 'فات الموعد' : `بعد ${formatNumber(left)} كم`,
        tone,
        headline: left <= 0 ? `فات بـ ${formatNumber(-left)} كم` : `${formatNumber(left)} كم`,
        summary: left <= 0 ? 'تجاوزت موعد تغيير الزيت' : 'متبقي على تغيير الزيت القادم',
        progress: { label: 'المستهلك من الزيت', value: Math.min(1, Math.max(0, used)), caption: `التغيير القادم عند ${formatNumber(car.oilDueKm)} كم` },
        stats: [
          ...(last ? [{ label: 'آخر تغيير', value: formatDate(last.date) }] : []),
          ...(last?.mileageKm ? [{ label: 'عند ممشى', value: `${formatNumber(last.mileageKm)} كم` }] : []),
          { label: 'المدة', value: `كل ${formatNumber(car.oilIntervalKm)} كم` },
          ...(last?.brand ? [{ label: 'الزيت', value: [last.brand, last.product].filter(Boolean).join(' ') }] : []),
          ...(last?.spec ? [{ label: 'اللزوجة', value: last.spec }] : []),
          ...(last?.note ? [{ label: 'ملاحظة', value: last.note }] : []),
        ],
      };
    }
    case 'insurance':
    case 'inspection': {
      const expiry = key === 'insurance' ? car.insuranceExpiry : car.inspectionExpiry;
      if (!expiry) return empty(key === 'insurance' ? 'سجّل تاريخ انتهاء التأمين عشان نذكّرك قبلها بشهر.' : 'سجّل تاريخ الفحص القادم عشان نذكّرك قبله.');
      const d = daysUntil(expiry, today);
      const tone: Tone = d < 0 ? 'critical' : d <= 30 ? 'warning' : 'good';
      return {
        recorded: true,
        value: d < 0 ? 'منتهي' : d <= 60 ? `بعد ${d} يوم` : `بعد ${Math.round(d / 30)} شهور`,
        tone,
        headline: d < 0 ? 'منتهي' : `${d} يوم`,
        summary: d < 0 ? `انتهى ${formatDate(expiry)}` : `متبقية على الانتهاء · ${formatDate(expiry)}`,
        stats: [
          { label: 'ينتهي في', value: formatDate(expiry) },
          ...(last ? [{ label: 'آخر تسجيل', value: formatDate(last.date) }] : []),
          ...(last?.costKwd ? [{ label: 'التكلفة', value: formatKwd(last.costKwd) }] : []),
          ...(last?.workshop ? [{ label: key === 'insurance' ? 'الشركة' : 'المركز', value: last.workshop }] : []),
        ],
      };
    }
    case 'battery':
    case 'tires':
    case 'brakes':
    case 'ac': {
      if (!last) {
        const what = { battery: 'آخر تغيير بطارية', tires: 'آخر تغيير أو ترصيص للإطارات', brakes: 'آخر صيانة فرامل', ac: 'آخر صيانة مكيف' }[key];
        return empty(`سجّل ${what} عشان نتابعها لك.`);
      }
      const months = monthsSince(last.date, today);
      // تنبيه عام بس: البطارية فوق سنتين ونص، والمكيف فوق سنة
      const tone: Tone = (key === 'battery' && months >= 30) || (key === 'ac' && months >= 12) ? 'warning' : 'neutral';
      return {
        recorded: true,
        value: key === 'battery' ? (months <= 0 ? 'جديدة' : `عمرها ${months < 12 ? `${months} شهور` : ago(months).replace('قبل ', '')}`) : ago(months),
        tone,
        headline: ago(months),
        summary: key === 'battery' ? 'من آخر تغيير بطارية' : 'من آخر مرة سجّلتها',
        stats: [
          { label: 'التاريخ', value: formatDate(last.date) },
          ...(last.mileageKm ? [{ label: 'عند ممشى', value: `${formatNumber(last.mileageKm)} كم` }] : []),
          ...(last.brand ? [{ label: 'الماركة', value: last.brand }] : []),
          ...(last.product ? [{ label: key === 'battery' ? 'النوع' : 'الموديل', value: last.product }] : []),
          ...(last.spec ? [{ label: key === 'battery' ? 'السعة' : 'المقاس', value: last.spec }] : []),
          ...(last.costKwd ? [{ label: 'التكلفة', value: formatKwd(last.costKwd) }] : []),
          ...(last.workshop ? [{ label: 'الورشة', value: last.workshop }] : []),
          ...(last.note ? [{ label: 'ملاحظة', value: last.note }] : []),
        ],
      };
    }
    case 'fuel':
    case 'wash': {
      const xs = expenses.filter((e) => e.carId === car.id && e.category === key);
      const l = latest(xs);
      if (!l) return empty(key === 'fuel' ? 'سجّل تعبئة البنزين كمصروف عشان نحسب استهلاكك.' : 'سجّل الغسلة كمصروف عشان نعرف آخر مرة.');
      const days = -daysUntil(l.date, today);
      const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      const month = xs.filter((e) => e.date.startsWith(ym));
      return {
        recorded: true,
        value: days <= 0 ? 'اليوم' : `قبل ${days} يوم`,
        tone: 'neutral',
        headline: days <= 0 ? 'اليوم' : `قبل ${days} يوم`,
        summary: key === 'fuel' ? 'آخر تعبئة' : 'آخر غسلة',
        stats: [
          { label: 'آخر مرة', value: formatDate(l.date) },
          { label: 'هالشهر', value: `${month.length} مرات` },
          { label: 'مصروف الشهر', value: formatKwd(month.reduce((s, e) => s + e.amountKwd, 0)) },
        ],
      };
    }
    case 'weather': {
      if (!weather) return { recorded: false, value: '—', tone: 'neutral', headline: '—', summary: 'الطقس غير متاح الحين', stats: [] };
      return {
        recorded: true,
        value: `${weather.tempC}°`,
        tone: 'neutral',
        headline: `${weather.tempC}°`,
        summary: weather.dust ? 'الكويت · فيه غبار' : 'الكويت',
        stats: [
          ...(weather.maxC != null && weather.minC != null ? [{ label: 'العظمى / الصغرى', value: `${weather.maxC}° / ${weather.minC}°` }] : []),
          ...(weather.humidity != null ? [{ label: 'الرطوبة', value: `${weather.humidity}٪` }] : []),
          ...(weather.windKmh != null ? [{ label: 'الرياح', value: `${weather.windKmh} كم/س` }] : []),
        ],
      };
    }
    case 'roadside':
      return { recorded: true, value: 'اطلب', tone: 'neutral', headline: 'مساعدة الطريق', summary: 'سطحة، شحن بطارية، تبديل إطار', stats: [] };
  }
}

/** حالة السيارة العامة من السجلات */
export function carHealth(ctx: Omit<Ctx, 'weather'>): 'good' | 'warning' | 'critical' | 'unknown' {
  const views = (['oil', 'insurance', 'inspection', 'battery'] as const).map((k) => serviceView(k, ctx));
  if (!views.some((v) => v.recorded)) return 'unknown';
  if (views.some((v) => v.tone === 'critical')) return 'critical';
  if (views.some((v) => v.tone === 'warning')) return 'warning';
  return 'good';
}
