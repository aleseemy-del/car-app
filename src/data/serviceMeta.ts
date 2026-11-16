import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import type { MCIconName, ServiceGroup } from '../components/dashboard/ServiceTile';
import type { ExpenseCategory, LoggableService } from '../store/types';

export type ServiceKey = LoggableService | 'fuel' | 'wash' | 'roadside' | 'weather';

export type ServiceMeta = {
  key: ServiceKey;
  title: string;
  icon: MCIconName;
  group: ServiceGroup;
  /** كيف يسجّل المستخدم هالخدمة */
  record: { kind: 'log' } | { kind: 'expense'; category: ExpenseCategory } | { kind: 'none' };
  recordLabel?: string;
  /** نصائح عامة (مو بيانات المستخدم) */
  tips?: string[];
  action?: { label: string; icon: ComponentProps<typeof Ionicons>['name']; kind: 'book' | 'map'; query: string };
};

// تعريف الخدمات بس — بدون أي أرقام. الأرقام تنحسب من سجلات المستخدم في utils/serviceStatus.ts
export const SERVICES: ServiceMeta[] = [
  { key: 'oil', title: 'الزيت', icon: 'oil', group: 'maintenance', record: { kind: 'log' }, recordLabel: 'سجّل تغيير زيت', action: { label: 'احجز تغيير زيت', icon: 'calendar-outline', kind: 'book', query: 'oil' } },
  { key: 'battery', title: 'البطارية', icon: 'car-battery', group: 'maintenance', record: { kind: 'log' }, recordLabel: 'سجّل تغيير بطارية', tips: ['حرارة الصيف في الكويت تقصّر عمر البطارية — افحصها إذا عمرها فوق سنتين.'], action: { label: 'احجز فحص بطارية', icon: 'flash-outline', kind: 'book', query: 'battery' } },
  { key: 'tires', title: 'الإطارات', icon: 'tire', group: 'maintenance', record: { kind: 'log' }, recordLabel: 'سجّل تغيير أو ترصيص', tips: ['الحرارة ترفع ضغط الإطارات — افحصها الصبح وهي باردة.'], action: { label: 'احجز ترصيص وميزان', icon: 'calendar-outline', kind: 'book', query: 'tires' } },
  { key: 'brakes', title: 'الفرامل', icon: 'car-brake-abs', group: 'maintenance', record: { kind: 'log' }, recordLabel: 'سجّل صيانة فرامل', action: { label: 'احجز فحص فرامل', icon: 'calendar-outline', kind: 'book', query: 'general' } },
  { key: 'ac', title: 'المكيف', icon: 'air-conditioner', group: 'maintenance', record: { kind: 'log' }, recordLabel: 'سجّل صيانة مكيف', tips: ['غيّر فلتر المكيف قبل الصيف — الغبار يضعف التبريد.'], action: { label: 'احجز صيانة مكيف', icon: 'snow-outline', kind: 'book', query: 'ac' } },
  { key: 'fuel', title: 'الوقود', icon: 'gas-station', group: 'daily', record: { kind: 'expense', category: 'fuel' }, recordLabel: 'سجّل تعبئة', action: { label: 'أقرب محطة', icon: 'navigate-outline', kind: 'map', query: 'محطة وقود' } },
  { key: 'inspection', title: 'الفحص الفني', icon: 'clipboard-check-outline', group: 'papers', record: { kind: 'log' }, recordLabel: 'سجّل الفحص', tips: ['قبل الفحص: تأكد من الأنوار والإطارات والزجاج.'] },
  { key: 'roadside', title: 'الطريق', icon: 'tow-truck', group: 'emergency', record: { kind: 'none' }, tips: ['في الحالات الطارئة اتصل على 112.'], action: { label: 'اطلب مساعدة', icon: 'call-outline', kind: 'book', query: 'roadside' } },
  { key: 'wash', title: 'الغسيل', icon: 'car-wash', group: 'daily', record: { kind: 'expense', category: 'wash' }, recordLabel: 'سجّل غسلة', action: { label: 'احجز غسيل', icon: 'water-outline', kind: 'book', query: 'wash' } },
  { key: 'insurance', title: 'التأمين', icon: 'shield-car', group: 'papers', record: { kind: 'log' }, recordLabel: 'سجّل التأمين', action: { label: 'جدّد التأمين', icon: 'refresh-outline', kind: 'book', query: 'insurance' } },
  { key: 'weather', title: 'الطقس', icon: 'weather-sunny', group: 'daily', record: { kind: 'none' } },
];

export const serviceMeta = (key: string) => SERVICES.find((s) => s.key === key);

/** أول 8 في الرئيسية */
export const HOME_SERVICE_KEYS: ServiceKey[] = ['oil', 'battery', 'tires', 'brakes', 'ac', 'fuel', 'inspection', 'insurance'];
