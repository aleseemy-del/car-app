// ورش تجريبية (أسماء وهمية) — لاحقاً تنحفظ في قاعدة البيانات مع الورش الشريكة الحقيقية
export type WorkshopService = 'oil' | 'battery' | 'tires' | 'ac' | 'wash' | 'general' | 'insurance' | 'roadside';

export type Workshop = {
  id: string;
  name: string;
  area: string;
  rating: number;
  reviews: number;
  priceFromKwd: number;
  services: WorkshopService[];
  hours: string;
};

export const WORKSHOP_SERVICE_LABELS: Record<WorkshopService, string> = {
  oil: 'زيت',
  battery: 'بطارية',
  tires: 'إطارات',
  ac: 'مكيف',
  wash: 'غسيل',
  general: 'صيانة عامة',
  insurance: 'تأمين',
  roadside: 'مساعدة طريق',
};

export const workshops: Workshop[] = [
  { id: 'w1', name: 'ورشة النخبة', area: 'الشويخ الصناعية', rating: 4.8, reviews: 312, priceFromKwd: 15, services: ['oil', 'general', 'ac', 'battery'], hours: '8 ص – 9 م' },
  { id: 'w2', name: 'مركز الإطارات السريع', area: 'الري', rating: 4.6, reviews: 198, priceFromKwd: 6, services: ['tires', 'battery'], hours: '8 ص – 10 م' },
  { id: 'w3', name: 'لمعة لغسيل السيارات', area: 'السالمية', rating: 4.7, reviews: 540, priceFromKwd: 3, services: ['wash'], hours: '7 ص – 11 م' },
  { id: 'w4', name: 'برد للمكيفات', area: 'الفحيحيل', rating: 4.5, reviews: 121, priceFromKwd: 12, services: ['ac', 'general'], hours: '9 ص – 9 م' },
  { id: 'w5', name: 'درع للتأمين', area: 'شرق', rating: 4.4, reviews: 87, priceFromKwd: 60, services: ['insurance'], hours: '9 ص – 5 م' },
  { id: 'w6', name: 'نجدة الطريق', area: 'كل المناطق', rating: 4.7, reviews: 264, priceFromKwd: 10, services: ['roadside', 'battery', 'tires'], hours: '24 ساعة' },
];

export const TIME_SLOTS = ['9:00', '10:30', '12:00', '4:00', '5:30', '7:00'];
