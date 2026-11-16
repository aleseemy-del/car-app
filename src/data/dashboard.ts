import type { MCIconName, ServiceItem } from '../components/dashboard/ServiceTile';
import type { Car, Expense, ServiceLog } from '../store/types';
import type { Weather } from '../services/weather';
import { formatNumber, daysUntil } from '../utils/format';
import { SERVICES, type ServiceKey } from './serviceMeta';
import { serviceView } from '../utils/serviceStatus';

export type VehicleStat = {
  icon: MCIconName;
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
  /** ما سجّل — يطلع "سجّل" */
  missing?: boolean;
  target: 'mileage' | ServiceKey;
};

/** القراءات الثلاث أسفل بطاقة السيارة — من اللي سجّله المستخدم بس */
export function buildVehicleStats(car: Car, unit: 'km' | 'mi', oilWarnKm = 1000): VehicleStat[] {
  const k = unit === 'km' ? 1 : 0.621371;
  const u = unit === 'km' ? 'كم' : 'ميل';
  const oilLeft = car.oilDueKm != null ? car.oilDueKm - car.mileageKm : null;
  const insDays = car.insuranceExpiry ? daysUntil(car.insuranceExpiry) : null;
  return [
    { icon: 'road-variant', label: 'الممشى', value: formatNumber(car.mileageKm * k), unit: u, target: 'mileage' },
    oilLeft == null
      ? { icon: 'oil', label: 'الزيت', value: 'سجّل', unit: '', missing: true, target: 'oil' }
      : { icon: 'oil', label: 'الزيت', value: formatNumber(Math.max(0, oilLeft) * k), unit: u, highlight: oilLeft <= oilWarnKm, target: 'oil' },
    insDays == null
      ? { icon: 'shield-car', label: 'التأمين', value: 'سجّل', unit: '', missing: true, target: 'insurance' }
      : { icon: 'shield-car', label: 'التأمين', value: insDays < 0 ? 'منتهي' : String(insDays), unit: insDays < 0 ? '' : 'يوم', highlight: insDays <= 30, target: 'insurance' },
  ];
}

/** مربعات الخدمات بقيم محسوبة من سجلات المستخدم */
export function buildServiceItems(keys: ServiceKey[] | 'all', ctx: { car: Car; logs: ServiceLog[]; expenses: Expense[]; weather?: Weather | null; oilWarnKm?: number }): ServiceItem[] {
  const list = keys === 'all' ? SERVICES : SERVICES.filter((s) => keys.includes(s.key));
  return list
    .filter((s) => s.key !== 'weather' || ctx.weather) // الطقس يختفي إذا ما توفر
    .map((s) => {
      const v = serviceView(s.key, ctx);
      return { id: s.key, title: s.title, value: v.value, icon: s.icon, tone: v.tone, group: s.group };
    });
}

export const SERVICE_GROUPS: { id: NonNullable<ServiceItem['group']>; title: string }[] = [
  { id: 'maintenance', title: 'الصيانة' },
  { id: 'daily', title: 'الاستخدام اليومي' },
  { id: 'papers', title: 'الأوراق والتأمين' },
  { id: 'emergency', title: 'الطوارئ' },
];
