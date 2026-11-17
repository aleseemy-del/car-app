import { callFunction, db, deleteFiles, rpc, signedUrls, uploadImage } from './supabase';
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

const memberFrom = (r: Row): FamilyMember => ({
  id: r.id as string,
  carId: r.car_id as string,
  email: r.member_email as string,
  name: r.member_name as string,
  role: r.role as FamilyMember['role'],
});
const expenseTo = (e: Expense) =>
  clean({ id: e.id, car_id: e.carId, category: e.category, amount_kwd: e.amountKwd, date: e.date, odometer_km: e.odometerKm, note: e.note });
const bookingFrom = (r: Row): Booking => ({
  id: r.id as string,
  carId: r.car_id as string,
  workshopId: r.workshop_id as string,
  serviceLabel: r.service_label as string,
  date: r.date as string,
  time: r.time as string,
  amountKwd: num(r.amount_kwd),
  paymentStatus: (r.payment_status as Booking['paymentStatus']) ?? 'unpaid',
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

/**
 * يجيب كل بيانات المستخدم من الخادم: سياراته + السيارات المشاركة معه من العائلة.
 * RLS هي اللي تقرر شنو يرجع — التطبيق ما يفلتر بنفسه.
 */
export async function loadAll(me: { id: string; email: string }): Promise<RemoteData> {
  const [profile, carRows, expenses, logs, docs, members, bookings] = await Promise.all([
    db<Row[]>('profiles', { query: `select=name&id=eq.${me.id}` }),
    db<Row[]>('cars', { query: 'select=*&order=created_at.asc' }),
    db<Row[]>('expenses', { query: 'select=*&order=date.desc,created_at.desc' }),
    db<Row[]>('service_logs', { query: 'select=*&order=date.desc,created_at.desc' }),
    db<Row[]>('car_documents', { query: 'select=*' }),
    db<Row[]>('car_members', { query: 'select=*&order=created_at.asc' }),
    db<Row[]>('bookings', { query: 'select=*&order=date.asc' }),
  ]);
  // صلاحيتي على كل سيارة: مالك، أو حسب دعوة العائلة
  const email = me.email.toLowerCase();
  const cars = carRows.map((r) => {
    const car = carFrom(r);
    if (r.user_id === me.id) return { ...car, role: 'owner' as const };
    const m = members.find((x) => x.car_id === car.id && x.member_email === email);
    return { ...car, role: (m?.role as Car['role']) ?? 'viewer' };
  });
  // قائمة العائلة = أعضاء سياراتي أنا (مو الدعوات اللي وصلتني)
  const family = members.filter((m) => m.owner_id === me.id);
  // الصور خاصة: نطلب روابط مؤقتة لها
  const paths = [
    ...expenses.map((e) => e.receipt_path as string | null),
    ...docs.map((d) => d.image_path as string | null),
  ].filter((p): p is string => !!p);
  const urls = await signedUrls(paths);
  return {
    name: (profile[0]?.name as string) ?? '',
    cars,
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
  async updateExpense(e: Expense, userId: string) {
    const body: Row = expenseTo(e);
    delete body.id;
    if (isLocal(e.receiptUri)) body.receipt_path = await uploadImage(e.receiptUri!, `${userId}/receipts/${e.id}`);
    else if (!e.receiptUri) body.receipt_path = null; // المستخدم شال الصورة
    await db('expenses', { method: 'PATCH', query: `id=eq.${e.id}`, body });
  },
  deleteExpense: (id: string) => db('expenses', { method: 'DELETE', query: `id=eq.${id}` }),

  addLog: (l: ServiceLog) => db('service_logs', { method: 'POST', body: logTo(l) }),
  updateLog: (l: ServiceLog) => {
    const body: Row = logTo(l);
    delete body.id;
    return db('service_logs', { method: 'PATCH', query: `id=eq.${l.id}`, body });
  },
  deleteLog: (id: string) => db('service_logs', { method: 'DELETE', query: `id=eq.${id}` }),

  async upsertDocument(d: CarDocument, userId: string) {
    const body: Row = { id: d.id, car_id: d.carId, type: d.type, expiry: d.expiry ?? null };
    if (isLocal(d.imageUri)) body.image_path = await uploadImage(d.imageUri!, `${userId}/documents/${d.carId}-${d.type}`);
    await db('car_documents', { method: 'POST', body, upsertOn: 'car_id,type' });
  },

  /** يضيف فرد من العائلة على سيارة. لما يسجّل بنفس الإيميل يشوف السيارة تلقائياً */
  addMember: (m: FamilyMember) =>
    db('car_members', { method: 'POST', body: { id: m.id, car_id: m.carId, member_email: m.email, member_name: m.name, role: m.role } }),
  removeMember: (id: string) => db('car_members', { method: 'DELETE', query: `id=eq.${id}` }),

  /** حذف الحساب: الصور أول، بعدين الحساب (وكل بياناته تنحذف معه في قاعدة البيانات) */
  async deleteAccount(userId: string) {
    const [exps, docs] = await Promise.all([
      db<Row[]>('expenses', { query: `select=receipt_path&user_id=eq.${userId}&receipt_path=not.is.null` }),
      db<Row[]>('car_documents', { query: `select=image_path&user_id=eq.${userId}&image_path=not.is.null` }),
    ]);
    const paths = [...exps.map((e) => e.receipt_path as string), ...docs.map((d) => d.image_path as string)].filter((p) =>
      p.startsWith(`${userId}/`),
    );
    await deleteFiles(paths);
    await rpc('delete_my_account');
  },

  /** قراءة الفاتورة بالذكاء الاصطناعي — على الخادم، والمفتاح مخفي هناك */
  scanReceipt: (imageBase64: string) =>
    callFunction<{ amountKwd?: number; category?: Expense['category']; date?: string; note?: string }>('scan-receipt', { image: imageBase64 }),

  /** مساعد السيارة: الخادم يجيب بيانات السيارة بنفسه، والمفتاح مخفي هناك */
  chat: (messages: { role: 'user' | 'assistant'; content: string }[], carId?: string) =>
    callFunction<{ reply: string }>('car-chat', { messages, carId }),

  addBooking: (b: Booking) =>
    db('bookings', {
      method: 'POST',
      body: { id: b.id, car_id: b.carId, workshop_id: b.workshopId, service_label: b.serviceLabel, date: b.date, time: b.time },
    }),
  cancelBooking: (id: string) => db('bookings', { method: 'DELETE', query: `id=eq.${id}` }),
  loadBookings: async () => (await db<Row[]>('bookings', { query: 'select=*&order=date.asc' })).map(bookingFrom),
  /** يطلب رابط دفع من الخادم. التطبيق يرسل رقم الحجز بس — المبلغ يحدده الخادم */
  payBooking: (bookingId: string) => callFunction<{ url: string; amountKwd: number }>('create-payment', { bookingId }),
};
