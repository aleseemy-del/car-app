import type { AppState } from './types';

// بيانات تجريبية — بس لما المستخدم يضغط "جرّب بدون تسجيل"
export const demoState: AppState = {
  user: { name: 'ضيف', phone: '' },
  cars: [
    {
      id: 'car-1',
      name: 'Land Cruiser',
      model: 'تويوتا · 2024',
      plate: '12 / 34567',
      mileageKm: 48250,
      oilDueKm: 49250,
      oilIntervalKm: 5000,
      insuranceExpiry: '2027-03-15',
    },
  ],
  activeCarId: 'car-1',
  expenses: [
    { id: 'e1', carId: 'car-1', category: 'fuel', amountKwd: 9, date: '2026-11-10', odometerKm: 48100 },
    { id: 'e2', carId: 'car-1', category: 'wash', amountKwd: 4, date: '2026-11-08' },
    { id: 'e3', carId: 'car-1', category: 'fuel', amountKwd: 8.5, date: '2026-11-03', odometerKm: 47640 },
    { id: 'e4', carId: 'car-1', category: 'maintenance', amountKwd: 18, date: '2026-09-02', note: 'تغيير زيت وفلتر', odometerKm: 44250 },
  ],
  logs: [
    { id: 'l1', carId: 'car-1', service: 'oil', date: '2026-09-02', mileageKm: 44250, costKwd: 18, workshop: 'ورشة النخبة', intervalKm: 5000 },
    { id: 'l2', carId: 'car-1', service: 'insurance', date: '2026-03-15', expiry: '2027-03-15', costKwd: 120 },
  ],
  documents: [],
  family: [],
  bookings: [],
  settings: { notifications: true, unit: 'km', oilWarnKm: 1000, lang: 'ar', langChosen: false },
};

// بداية مستخدم جديد: فاضي تماماً — ما نعرض إلا اللي يسجّله
export const emptyState: AppState = {
  cars: [],
  activeCarId: '',
  expenses: [],
  logs: [],
  documents: [],
  family: [],
  bookings: [],
  settings: { notifications: true, unit: 'km', oilWarnKm: 1000, lang: 'ar', langChosen: false },
};
