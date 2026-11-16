import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { demoState, emptyState } from './seed';
import { setLang } from '../i18n';
import { auth, uuid, type Session } from '../services/supabase';
import { loadAll, remote, type RemoteData } from '../services/remote';
import type { AppState, Booking, Car, CarDocument, Expense, FamilyMember, ServiceLog, Settings } from './types';

/**
 * مكان البيانات (درس الأسبوع ٣):
 * - بيانات المستخدم (السيارات، المصاريف، السجلات، المستندات...) → قاعدة البيانات في Supabase ("الثلاجة")
 *   فتبقى لو غيّر جواله أو مسح التطبيق، وكل مستخدم يشوف بياناته بس (RLS).
 * - إعدادات الجهاز (اللغة، التنبيهات، الوحدة) → AsyncStorage ("علبة الغدا"): صغيرة، لهالجهاز، وعادي لو ضاعت.
 * - "جرّب بدون تسجيل": بيانات تجريبية على الجهاز بس، وما تنرسل للخادم.
 */
const SETTINGS_KEY = 'car-status/settings/v1';
/** المفتاح القديم لما كانت كل البيانات على الجهاز — نقرأ منه الإعدادات بس */
const LEGACY_KEY = 'car-status/state/v1';

type Action =
  | { type: 'settingsLoaded'; settings: Settings }
  | { type: 'signedIn'; data: RemoteData; email: string }
  | { type: 'signOut' }
  | { type: 'loadDemo' }
  | { type: 'addCar'; car: Car }
  | { type: 'setActiveCar'; id: string }
  | { type: 'addLog'; log: ServiceLog; expense?: Expense }
  | { type: 'updateLog'; log: ServiceLog }
  | { type: 'deleteLog'; id: string }
  | { type: 'updateMileage'; carId: string; km: number }
  | { type: 'addExpense'; expense: Expense }
  | { type: 'updateExpense'; expense: Expense }
  | { type: 'deleteExpense'; id: string }
  | { type: 'upsertDocument'; doc: CarDocument }
  | { type: 'addMember'; member: FamilyMember }
  | { type: 'removeMember'; id: string }
  | { type: 'addBooking'; booking: Booking }
  | { type: 'cancelBooking'; id: string }
  | { type: 'setBookings'; bookings: Booking[] }
  | { type: 'updateSettings'; patch: Partial<Settings> };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'settingsLoaded':
      setLang(action.settings.lang);
      return { ...state, settings: action.settings };
    case 'signedIn': {
      const { data } = action;
      return {
        ...emptyState,
        settings: state.settings,
        user: { name: data.name, phone: '', email: action.email },
        cars: data.cars,
        activeCarId: data.cars.find((c) => c.id === state.activeCarId)?.id ?? data.cars[0]?.id ?? '',
        expenses: data.expenses,
        logs: data.logs,
        documents: data.documents,
        family: data.family,
        bookings: data.bookings,
      };
    }
    case 'signOut':
      return { ...emptyState, settings: state.settings };
    case 'loadDemo':
      return { ...demoState, settings: state.settings }; // نحافظ على اللغة
    case 'addCar':
      return { ...state, cars: [...state.cars, action.car], activeCarId: action.car.id };
    case 'setActiveCar':
      return { ...state, activeCarId: action.id };
    case 'addLog': {
      const { log } = action;
      const cars = state.cars.map((c) => {
        if (c.id !== log.carId) return c;
        const next = { ...c };
        if (log.mileageKm && log.mileageKm > next.mileageKm) next.mileageKm = log.mileageKm;
        if (log.service === 'oil' && log.mileageKm) {
          next.oilIntervalKm = log.intervalKm ?? next.oilIntervalKm;
          next.oilDueKm = log.mileageKm + next.oilIntervalKm;
        }
        if (log.service === 'insurance' && log.expiry) next.insuranceExpiry = log.expiry;
        if (log.service === 'inspection' && log.expiry) next.inspectionExpiry = log.expiry;
        return next;
      });
      return {
        ...state,
        cars,
        logs: [log, ...state.logs],
        expenses: action.expense ? [action.expense, ...state.expenses] : state.expenses,
      };
    }
    case 'updateLog': {
      const logs = state.logs.map((l) => (l.id === action.log.id ? action.log : l));
      return { ...state, logs, cars: state.cars.map((c) => (c.id === action.log.carId ? deriveFromLogs(c, logs) : c)) };
    }
    case 'deleteLog': {
      const gone = state.logs.find((l) => l.id === action.id);
      const logs = state.logs.filter((l) => l.id !== action.id);
      return { ...state, logs, cars: gone ? state.cars.map((c) => (c.id === gone.carId ? deriveFromLogs(c, logs) : c)) : state.cars };
    }
    case 'updateMileage':
      return { ...state, cars: state.cars.map((c) => (c.id === action.carId ? { ...c, mileageKm: action.km } : c)) };
    case 'addExpense': {
      const { expense } = action;
      // قراءة العداد في المصروف تحدّث ممشى السيارة
      const cars = expense.odometerKm
        ? state.cars.map((c) => (c.id === expense.carId && expense.odometerKm! > c.mileageKm ? { ...c, mileageKm: expense.odometerKm! } : c))
        : state.cars;
      return { ...state, cars, expenses: [expense, ...state.expenses] };
    }
    case 'updateExpense':
      return { ...state, expenses: state.expenses.map((e) => (e.id === action.expense.id ? action.expense : e)) };
    case 'deleteExpense':
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.id) };
    case 'upsertDocument': {
      const others = state.documents.filter((d) => !(d.carId === action.doc.carId && d.type === action.doc.type));
      return { ...state, documents: [...others, action.doc] };
    }
    case 'addMember':
      return { ...state, family: [...state.family, action.member] };
    case 'removeMember':
      return { ...state, family: state.family.filter((m) => m.id !== action.id) };
    case 'addBooking':
      return { ...state, bookings: [...state.bookings, action.booking] };
    case 'setBookings':
      return { ...state, bookings: action.bookings };
    case 'cancelBooking':
      return { ...state, bookings: state.bookings.filter((b) => b.id !== action.id) };
    case 'updateSettings':
      if (action.patch.lang) setLang(action.patch.lang);
      return { ...state, settings: { ...state.settings, ...action.patch } };
  }
}

/**
 * بعد تعديل أو حذف سجل: نعيد حساب موعد الزيت والتأمين والفحص من آخر سجل باقي.
 * لو ما بقى سجل من النوع، نخلي القيمة اللي كانت (يمكن المستخدم دخّلها وقت إضافة السيارة).
 */
function deriveFromLogs(car: Car, logs: ServiceLog[]): Car {
  const mine = logs.filter((l) => l.carId === car.id).sort((a, b) => b.date.localeCompare(a.date));
  const next = { ...car };
  const oil = mine.find((l) => l.service === 'oil' && l.mileageKm);
  if (oil) {
    next.oilIntervalKm = oil.intervalKm ?? next.oilIntervalKm;
    next.oilDueKm = oil.mileageKm! + next.oilIntervalKm;
  }
  const ins = mine.find((l) => l.service === 'insurance' && l.expiry);
  if (ins) next.insuranceExpiry = ins.expiry;
  const insp = mine.find((l) => l.service === 'inspection' && l.expiry);
  if (insp) next.inspectionExpiry = insp.expiry;
  return next;
}

const LOG_EXPENSE_NOTE: Record<ServiceLog['service'], string> = {
  oil: 'تغيير زيت',
  battery: 'بطارية',
  tires: 'إطارات',
  brakes: 'فرامل',
  ac: 'صيانة مكيف',
  inspection: 'فحص فني',
  insurance: 'تأمين',
};

export const newId = uuid;

type AuthResult = { needsConfirm?: boolean; hasCars?: boolean };

type Store = {
  state: AppState;
  /** خلصت قراءة البيانات */
  ready: boolean;
  /** فشل قراءة البيانات */
  loadError: boolean;
  retryLoad: () => void;
  /** مسجّل وعنده سيارة وحدة على الأقل */
  onboarded: boolean;
  /** مسجّل بحساب حقيقي (بياناته على الخادم) — false في وضع التجربة */
  cloud: boolean;
  activeCar: Car;
  /** أقدر أعدّل على السيارة النشطة؟ (لا لو مشاركة معي "يشوف بس") */
  canEdit: boolean;
  /** خطأ حفظ صار بالخلفية (حذف، تحديث ممشى...) — ينعرض للمستخدم */
  syncError: string | null;
  clearSyncError: () => void;
  signUp: (email: string, password: string, name: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  /** يحذف الحساب وكل بياناته وصوره نهائياً */
  deleteAccount: () => Promise<void>;
  loadDemo: () => void;
  addCar: (car: Omit<Car, 'id'>) => Promise<void>;
  setActiveCar: (id: string) => void;
  /** يسجّل خدمة — ولو فيها تكلفة تنضاف للمصاريف تلقائياً */
  addLog: (log: Omit<ServiceLog, 'id'>) => Promise<void>;
  updateLog: (log: ServiceLog) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  updateMileage: (carId: string, km: number) => Promise<void>;
  addExpense: (e: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (e: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  upsertDocument: (doc: Omit<CarDocument, 'id'> & { id?: string }) => Promise<void>;
  addMember: (m: Omit<FamilyMember, 'id'>) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
  /** يرجع رقم الحجز */
  addBooking: (b: Omit<Booking, 'id'>) => Promise<string>;
  /** يرجع رابط صفحة الدفع (ماي فاتورة) */
  payBooking: (id: string) => Promise<string>;
  /** يجيب حالة الحجوزات من الخادم (بعد الرجوع من الدفع) */
  refreshBookings: () => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => void;
};

const StoreContext = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, emptyState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const sessionRef = useRef<Session | null>(null);
  const settingsLoaded = useRef(false);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);

  // فتح التطبيق: الإعدادات من الجهاز، والبيانات من الخادم لو مسجّل
  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    (async () => {
      if (!settingsLoaded.current) {
        const raw = (await AsyncStorage.getItem(SETTINGS_KEY)) ?? (await AsyncStorage.getItem(LEGACY_KEY));
        const saved = raw ? JSON.parse(raw) : null;
        const settings = { ...emptyState.settings, ...(saved?.settings ?? saved ?? {}) } as Settings;
        if (!cancelled) dispatch({ type: 'settingsLoaded', settings });
        settingsLoaded.current = true;
      }
      const session = await auth.getSession();
      sessionRef.current = session;
      if (session) {
        const data = await loadAll(session.user);
        if (!cancelled) dispatch({ type: 'signedIn', data, email: session.user.email });
      }
      if (!cancelled) setReady(true);
    })()
      // ما قدرنا نقرأ البيانات: نعرض خطأ مع "حاول مرة ثانية"
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  // حفظ الإعدادات بس على الجهاز
  useEffect(() => {
    if (!settingsLoaded.current) return;
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings)).catch(() => {});
  }, [state.settings]);

  /**
   * الخادم أول، بعدين الشاشة: ما نعرض شي على إنه "انحفظ" إلا لما الخادم يأكد.
   * في وضع التجربة (بدون حساب) نحدّث الشاشة بس.
   */
  const commit = useCallback(async (action: Action, save?: (next: AppState, userId: string) => Promise<unknown>, carId?: string) => {
    const session = sessionRef.current;
    // الخادم بيرفض أصلاً (RLS) — بس نوضح السبب بدل رسالة عامة
    const car = carId ? stateRef.current.cars.find((c) => c.id === carId) : undefined;
    if (car?.role === 'viewer') throw new Error('صلاحيتك على هالسيارة مشاهدة بس');
    if (session && save) await save(reducer(stateRef.current, action), session.user.id);
    dispatch(action);
  }, []);

  /** للعمليات اللي ما تنتظرها الشاشة (حذف...) — لو فشلت نعرض الخطأ */
  const background = useCallback((p: Promise<void>) => p.catch((e: Error) => setSyncError(e.message)), []);

  /** لو السيارة تغيّرت (ممشى، موعد زيت، تأمين) نحدّثها على الخادم */
  const saveCarIfChanged = (next: AppState, carId: string) => {
    const before = stateRef.current.cars.find((c) => c.id === carId);
    const after = next.cars.find((c) => c.id === carId);
    return after && JSON.stringify(before) !== JSON.stringify(after) ? remote.updateCar(after) : Promise.resolve();
  };

  const afterAuth = useCallback(async (session: Session): Promise<AuthResult> => {
    sessionRef.current = session;
    const data = await loadAll(session.user);
    dispatch({ type: 'signedIn', data, email: session.user.email });
    return { hasCars: data.cars.length > 0 };
  }, []);

  const store = useMemo<Store>(() => {
    // قبل إضافة أول سيارة ما فيه سيارة نشطة — الشاشات الرئيسية ما تنفتح إلا بعد onboarded
    const activeCar = (state.cars.find((c) => c.id === state.activeCarId) ?? state.cars[0]) as Car;
    return {
      state,
      ready,
      loadError,
      retryLoad: () => setAttempt((n) => n + 1),
      onboarded: !!state.user && state.cars.length > 0,
      cloud: !!sessionRef.current,
      activeCar,
      canEdit: activeCar?.role !== 'viewer',
      syncError,
      clearSyncError: () => setSyncError(null),

      signUp: async (email, password, name) => {
        const res = await auth.signUp(email, password, name);
        if (res.needsConfirm || !res.session) return { needsConfirm: true };
        return afterAuth(res.session);
      },
      signIn: async (email, password) => afterAuth(await auth.signIn(email, password)),
      signOut: async () => {
        await auth.signOut();
        sessionRef.current = null;
        dispatch({ type: 'signOut' });
      },
      resetPassword: (email) => auth.resetPassword(email),
      deleteAccount: async () => {
        const session = sessionRef.current;
        if (!session) return;
        await remote.deleteAccount(session.user.id);
        await auth.signOut();
        sessionRef.current = null;
        dispatch({ type: 'signOut' });
      },
      loadDemo: () => {
        sessionRef.current = null;
        dispatch({ type: 'loadDemo' });
      },

      addCar: (car) => {
        const full = { ...car, id: newId() };
        return commit({ type: 'addCar', car: full }, () => remote.addCar(full));
      },
      setActiveCar: (id) => dispatch({ type: 'setActiveCar', id }),
      addLog: (log) => {
        const full: ServiceLog = { ...log, id: newId() };
        const expense: Expense | undefined = log.costKwd
          ? {
              id: newId(),
              carId: log.carId,
              category: log.service === 'insurance' ? 'insurance' : 'maintenance',
              amountKwd: log.costKwd,
              date: log.date,
              odometerKm: log.mileageKm,
              note: LOG_EXPENSE_NOTE[log.service],
            }
          : undefined;
        return commit({ type: 'addLog', log: full, expense }, async (next, userId) => {
          await remote.addLog(full);
          if (expense) await remote.addExpense(expense, userId);
          await saveCarIfChanged(next, log.carId);
        }, log.carId);
      },
      updateLog: (log) =>
        commit({ type: 'updateLog', log }, async (next) => {
          await remote.updateLog(log);
          await saveCarIfChanged(next, log.carId);
        }, log.carId),
      deleteLog: (id) => {
        const carId = stateRef.current.logs.find((l) => l.id === id)?.carId;
        return background(commit({ type: 'deleteLog', id }, async (next) => {
          await remote.deleteLog(id);
          if (carId) await saveCarIfChanged(next, carId);
        }, carId));
      },
      updateMileage: (carId, km) =>
        background(commit({ type: 'updateMileage', carId, km }, (next) => saveCarIfChanged(next, carId), carId)),
      addExpense: (e) => {
        const full = { ...e, id: newId() };
        return commit({ type: 'addExpense', expense: full }, async (next, userId) => {
          await remote.addExpense(full, userId);
          await saveCarIfChanged(next, e.carId);
        }, e.carId);
      },
      updateExpense: (e) => commit({ type: 'updateExpense', expense: e }, (_n, userId) => remote.updateExpense(e, userId), e.carId),
      deleteExpense: (id) =>
        background(commit({ type: 'deleteExpense', id }, () => remote.deleteExpense(id), stateRef.current.expenses.find((x) => x.id === id)?.carId)),
      upsertDocument: (doc) => {
        const existing = stateRef.current.documents.find((d) => d.carId === doc.carId && d.type === doc.type);
        const full = { ...doc, id: doc.id ?? existing?.id ?? newId() };
        return background(commit({ type: 'upsertDocument', doc: full }, (_n, userId) => remote.upsertDocument(full, userId), doc.carId));
      },
      addMember: (m) => {
        const full = { ...m, email: m.email.trim().toLowerCase(), id: newId() };
        return commit({ type: 'addMember', member: full }, () => remote.addMember(full));
      },
      removeMember: (id) => background(commit({ type: 'removeMember', id }, () => remote.removeMember(id))),
      addBooking: (b) => {
        const full = { ...b, id: newId() };
        return commit({ type: 'addBooking', booking: full }, () => remote.addBooking(full), b.carId).then(() => full.id);
      },
      payBooking: async (id) => {
        if (!sessionRef.current) throw new Error('الدفع يحتاج حساب — سجّل دخول');
        return (await remote.payBooking(id)).url;
      },
      refreshBookings: async () => {
        if (!sessionRef.current) return;
        dispatch({ type: 'setBookings', bookings: await remote.loadBookings() });
      },
      cancelBooking: (id) =>
        background(commit({ type: 'cancelBooking', id }, () => remote.cancelBooking(id), stateRef.current.bookings.find((x) => x.id === id)?.carId)),
      updateSettings: (patch) => dispatch({ type: 'updateSettings', patch }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, ready, loadError, syncError, commit, background, afterAuth]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside AppStoreProvider');
  return ctx;
}
