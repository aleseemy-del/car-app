export type Car = {
  id: string;
  name: string; // مثل: GXR الفخمة
  model: string; // مثل: لاندكروزر · 2024
  plate: string;
  mileageKm: number;
  /** ممشى تغيير الزيت القادم — ما يتحدد إلا لما المستخدم يسجّل آخر تغيير */
  oilDueKm?: number;
  oilIntervalKm: number;
  insuranceExpiry?: string; // YYYY-MM-DD
  inspectionExpiry?: string; // YYYY-MM-DD
};

export type ExpenseCategory = 'fuel' | 'maintenance' | 'wash' | 'insurance' | 'parts' | 'other';

export type Expense = {
  id: string;
  carId: string;
  category: ExpenseCategory;
  amountKwd: number;
  date: string; // YYYY-MM-DD
  odometerKm?: number;
  note?: string;
  receiptUri?: string;
};

/** خدمات تنسجّل يدوياً (الوقود والغسيل ينسجلون كمصاريف) */
export type LoggableService = 'oil' | 'battery' | 'tires' | 'brakes' | 'ac' | 'inspection' | 'insurance';

/** سجل خدمة — كل الأرقام في التطبيق تنحسب من هذي السجلات بس */
export type ServiceLog = {
  id: string;
  carId: string;
  service: LoggableService;
  date: string; // YYYY-MM-DD
  mileageKm?: number;
  costKwd?: number;
  workshop?: string;
  note?: string;
  /** للتأمين والفحص: تاريخ الانتهاء الجديد */
  expiry?: string;
  /** للزيت: كل كم كيلو */
  intervalKm?: number;
  /** للإطارات والبطارية والزيت: الماركة والموديل والمقاس/السعة/اللزوجة */
  brand?: string;
  product?: string;
  spec?: string;
};

export type DocType = 'registration' | 'insurance' | 'license' | 'inspection';

export type CarDocument = {
  id: string;
  carId: string;
  type: DocType;
  imageUri?: string;
  expiry?: string; // YYYY-MM-DD
};

export type FamilyRole = 'viewer' | 'manager';
export type FamilyMember = { id: string; name: string; phone: string; role: FamilyRole };

export type Booking = {
  id: string;
  carId: string;
  workshopId: string;
  serviceLabel: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
};

export type Settings = {
  notifications: boolean;
  unit: 'km' | 'mi';
  /** نذكّر قبل موعد الزيت بكم كيلو — يختاره المستخدم */
  oilWarnKm: number;
  /** لغة التطبيق */
  lang: 'ar' | 'en';
  /** اختار اللغة من أول شاشة */
  langChosen: boolean;
};

export type User = { name: string; phone: string; email?: string };

export type AppState = {
  user?: User;
  /** آخر رقم سجّل خروج — لو رجع بنفس الرقم نرجّع بياناته */
  lastPhone?: string;
  cars: Car[];
  activeCarId: string;
  expenses: Expense[];
  logs: ServiceLog[];
  documents: CarDocument[];
  family: FamilyMember[];
  bookings: Booking[];
  settings: Settings;
};
