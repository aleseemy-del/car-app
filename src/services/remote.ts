import { db, signedUrls, uploadImage } from './supabase';
import type { Booking, Car, CarDocument, Expense, FamilyMember, ServiceLog } from '../store/types';

/**
 * طبقة البيانات: تحوّل بين شكل التطبيق (camelCase) وشكل جداول Supabase (snake_case).
 * كل الجداول عليها RLS: الخادم يرجع صفوف المستخدم المسجّل بس، ويرفض أي شي غيرها.
 */

type Row = Record<string, unknown>;
const opt = <T,>(v: unknown) => (v === null || v === undefined ? undefined : (v as T));
const num = (v: unknown) => (v === null || v === undefined ? undefined : Number(v));
/** نشيل القيم الفاضية عشان ما نرسل undefined */
const clean = (o: Row) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v === undefined ? null : v]));
/** صورة محلية من الجوال (لسا ما انرفعت) */
const isLocal = (uri?: string) => !!uri && /^(file|content|ph|assets-library):/.test(uri);

// ---------- التحويل ----------
const carFrom = (r: Row): Car => ({
  id: r.id as string,
  name: r.name as string,
  model: r.model as string,
  plate: r.plate as string,
  mileageKm: Number(r.mileage_km),
  oilDueKm: num(r.oil_due_km),
  oilIntervalKm: Number(r.oil_interval_km),
  insuranceExpiry: opt(r.insurance_expiry),
  inspectionExpiry: opt(r.inspection_expiry),
});
const carTo = (c: Car) =>
  clean({
    id: c.id,
    name: c.name,
    model: c.model,
    plate: c.plate,
    mileage_km: c.mileageKm,
    oil_due_km: c.oilDueKm,
    oil_interval_km: c.oilIntervalKm,
    insurance_expiry: c.insuranceExpiry,
    inspection_expiry: c.inspectionExpiry,
  });

const expenseFrom = (r: Row, urls: Record<string, string>): Expense => ({
  id: r.id as string,
  carId: r.car_id as string,
  category: r.category as Expense['category'],
  amountKwd: Number(r.amount_kwd),
  date: r.date as string,
  odometerKm: num(r.odometer_km),
  note: opt(r.note),
  receiptUri: r.receipt_path ? urls[r.receipt_path as string] : undefined,
});

const logFrom = (r: Row): ServiceLog => ({
  id: r.id as string,
  carId: r.car_id as string,
  service: r.service as ServiceLog['service'],
  date: r.date as string,
  mileageKm: num(r.mileage_km),
  costKwd: num(r.cost_kwd),
  workshop: opt(r.workshop),
  note: opt(r.note),
  expiry: opt(r.expiry),
  intervalKm: num(r.interval_km),
  brand: opt(r.brand),
  product: opt(r.product),
  spec: opt(r.spec),
});
const logTo = (l: ServiceLog) =>
  clean({
    id: l.id,
    car_id: l.carId,
    service: l.service,
    date: l.date,
    mileage_km: l.mileageKm,
    cost_kwd: l.costKwd,
    workshop: l.workshop,
    note: l.note,
    expiry: l.expiry,
    interval_km: l.intervalKm,
    brand: l.brand,
    product: l.product,
    spec: l.spec,
  });

const docFrom = (r: Row, urls: Record<string, string>): CarDocument => ({
  id: r.id as string,
  carId: r.car_id as string,
  type: r.type as CarDocument['type'],
  imageUri: r.image_path ? urls[r.image_path as string] : undefined,
  expiry: opt(r.expiry),
});

const memberFrom = (r: Row): FamilyMember => ({ id: r.id as string, name: r.name as string, phone: r.phone as string, role: r.role as FamilyMember['role'] });
const bookingFrom = (r: Row): Booking => ({
  id: r.id as string,
  carId: r.car_id as string,
  workshopId: r.workshop_id as string,
  serviceLabel: r.service_label as string,
  date: r.date as string,
  time: r.time as string,
});

// ---------- القراءة ----------
export type RemoteData = {
  name: string;
  cars: Car[];
  expenses: Expense[];
  logs: ServiceLog[];
  documents: CarDocument[];
  family: FamilyMember[];
  bookings: Booking[];
};

/** يجيب كل بيانات المستخدم من الخادم */
export async function loadAll(): Promise<RemoteData> {
  const [profile, cars, expenses, logs, docs, family, bookings] = await Promise.all([
    db<Row[]>('profiles', { query: 'select=name' }),
    db<Row[]>('cars', { query: 'select=*&order=created_at.asc' }),
    db<Row[]>('expenses', { query: 'select=*&order=date.desc,created_at.desc' }),
    db<Row[]>('service_logs', { query: 'select=*&order=date.desc,created_at.desc' }),
    db<Row[]>('car_documents', { query: 'select=*' }),
    db<Row[]>('family_members', { query: 'select=*&order=created_at.asc' }),
    db<Row[]>('bookings', { query: 'select=*&order=date.asc' }),
  ]);
  // الصور خاصة: نطلب روابط مؤقتة لها
  const paths = [
    ...expenses.map((e) => e.receipt_path as string | null),
    ...docs.map((d) => d.image_path as string | null),
  ].filter((p): p is string => !!p);
  const urls = await signedUrls(paths);
  return {
    name: (profile[0]?.name as string) ?? '',
    cars: cars.map(carFrom),
    expenses: expenses.map((e) => expenseFrom(e, urls)),
    logs: logs.map(logFrom),
    documents: docs.map((d) => docFrom(d, urls)),
    family: family.map(memberFrom),
    bookings: bookings.map(bookingFrom),
  };
}

// ---------- الكتابة ----------
export const remote = {
  updateName: (name: string, userId: string) => db('profiles', { method: 'PATCH', query: `id=eq.${userId}`, body: { name } }),

  addCar: (car: Car) => db('cars', { method: 'POST', body: carTo(car) }),
  updateCar: (car: Car) => db('cars', { method: 'PATCH', query: `id=eq.${car.id}`, body: carTo(car) }),

  async addExpense(e: Expense, userId: string) {
    let receipt_path: string | null = null;
    if (isLocal(e.receiptUri)) receipt_path = await uploadImage(e.receiptUri!, `${userId}/receipts/${e.id}`);
    await db('expenses', {
      method: 'POST',
      body: clean({
        id: e.id,
        car_id: e.carId,
        category: e.category,
        amount_kwd: e.amountKwd,
        date: e.date,
        odometer_km: e.odometerKm,
        note: e.note,
        receipt_path,
      }),
    });
  },
  deleteExpense: (id: string) => db('expenses', { method: 'DELETE', query: `id=eq.${id}` }),

  addLog: (l: ServiceLog) => db('service_logs', { method: 'POST', body: logTo(l) }),
  deleteLog: (id: string) => db('service_logs', { method: 'DELETE', query: `id=eq.${id}` }),

  async upsertDocument(d: CarDocument, userId: string) {
    const body: Row = { id: d.id, car_id: d.carId, type: d.type, expiry: d.expiry ?? null };
    if (isLocal(d.imageUri)) body.image_path = await uploadImage(d.imageUri!, `${userId}/documents/${d.carId}-${d.type}`);
    await db('car_documents', { method: 'POST', body, upsertOn: 'car_id,type' });
  },

  addMember: (m: FamilyMember) => db('family_members', { method: 'POST', body: { id: m.id, name: m.name, phone: m.phone, role: m.role } }),
  removeMember: (id: string) => db('family_members', { method: 'DELETE', query: `id=eq.${id}` }),

  addBooking: (b: Booking) =>
    db('bookings', {
      method: 'POST',
      body: { id: b.id, car_id: b.carId, workshop_id: b.workshopId, service_label: b.serviceLabel, date: b.date, time: b.time },
    }),
  cancelBooking: (id: string) => db('bookings', { method: 'DELETE', query: `id=eq.${id}` }),
};
