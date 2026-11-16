import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * عميل Supabase خفيف مبني على fetch.
 *
 * ليش مو @supabase/supabase-js؟ ما قدرنا نثبّت الحزمة من هنا. هذا الملف يسوي نفس الشي:
 * تسجيل دخول، قراءة وكتابة الجداول، ورفع الصور. لو تبي تنقل للحزمة الرسمية بعدين:
 *   npx expo install @supabase/supabase-js
 *
 * المفتاح هنا هو "المفتاح العام" (publishable) — آمن داخل التطبيق لأن قواعد RLS
 * هي اللي تقرر شنو يقدر يشوف كل مستخدم. المفتاح السري (secret) ما ينحط هنا أبداً.
 */
const URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '';
const SESSION_KEY = 'car-status/session/v1';
export const BUCKET = 'car-files';

export const supabaseConfigured = !!URL && !!KEY;

export type Session = {
  accessToken: string;
  refreshToken: string;
  /** ثواني (unix) */
  expiresAt: number;
  user: { id: string; email: string; name: string };
};

let current: Session | null = null;
let refreshing: Promise<Session | null> | null = null;

/** رسائل أخطاء الدخول بالعربي */
function authError(json: { error_code?: string; msg?: string; error_description?: string; message?: string }): string {
  const code = json.error_code ?? '';
  if (code === 'invalid_credentials') return 'الإيميل أو كلمة السر غلط';
  if (code === 'email_not_confirmed') return 'أكّد إيميلك أول من الرسالة اللي وصلتك';
  if (code === 'user_already_exists') return 'هذا الإيميل مسجّل من قبل — سجّل دخول';
  if (code === 'weak_password') return 'كلمة السر ضعيفة — 8 أحرف على الأقل';
  if (code === 'over_email_send_rate_limit') return 'محاولات كثيرة، انتظر شوي وحاول مرة ثانية';
  if (code === 'email_address_invalid') return 'الإيميل مو صحيح';
  return 'ما قدرنا نكمل الدخول، حاول مرة ثانية';
}

type AuthJson = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  user?: { id: string; email?: string; user_metadata?: { name?: string } };
};

function toSession(j: AuthJson): Session | null {
  if (!j.access_token || !j.refresh_token || !j.user) return null;
  return {
    accessToken: j.access_token,
    refreshToken: j.refresh_token,
    expiresAt: j.expires_at ?? Math.floor(Date.now() / 1000) + (j.expires_in ?? 3600),
    user: { id: j.user.id, email: j.user.email ?? '', name: j.user.user_metadata?.name ?? '' },
  };
}

async function saveSession(s: Session | null) {
  current = s;
  if (s) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else await AsyncStorage.removeItem(SESSION_KEY);
}

async function authFetch(path: string, body: unknown) {
  const res = await fetch(`${URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(authError(json));
  return json as AuthJson;
}

export const auth = {
  /** إنشاء حساب. لو تأكيد الإيميل مفعّل: ترجع needsConfirm بدون جلسة */
  async signUp(email: string, password: string, name: string): Promise<{ session: Session | null; needsConfirm: boolean }> {
    const json = await authFetch('signup', { email, password, data: { name } });
    const session = toSession(json);
    if (session) await saveSession(session);
    return { session, needsConfirm: !session };
  },

  async signIn(email: string, password: string): Promise<Session> {
    const json = await authFetch('token?grant_type=password', { email, password });
    const session = toSession(json);
    if (!session) throw new Error('ما قدرنا نكمل الدخول، حاول مرة ثانية');
    await saveSession(session);
    return session;
  },

  async signOut() {
    const s = current;
    await saveSession(null);
    if (s) {
      // نبلّغ الخادم يلغي الجلسة — لو فشل عادي، الجلسة انمسحت من الجهاز
      fetch(`${URL}/auth/v1/logout`, { method: 'POST', headers: { apikey: KEY, Authorization: `Bearer ${s.accessToken}` } }).catch(() => {});
    }
  },

  /** الجلسة المحفوظة (ويجددها لو قربت تنتهي). null = مو مسجّل */
  async getSession(): Promise<Session | null> {
    if (!current) {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      current = raw ? (JSON.parse(raw) as Session) : null;
    }
    if (!current) return null;
    if (current.expiresAt - 60 > Date.now() / 1000) return current;
    return auth.refresh();
  },

  async refresh(): Promise<Session | null> {
    if (!current) return null;
    refreshing ??= (async () => {
      try {
        const json = await authFetch('token?grant_type=refresh_token', { refresh_token: current!.refreshToken });
        const s = toSession(json);
        await saveSession(s);
        return s;
      } catch {
        // الجلسة انتهت أو انلغت — لازم يسجّل دخول من جديد
        await saveSession(null);
        return null;
      } finally {
        refreshing = null;
      }
    })();
    return refreshing;
  },
};

async function token(): Promise<string> {
  const s = await auth.getSession();
  if (!s) throw new Error('انتهت الجلسة، سجّل دخول مرة ثانية');
  return s.accessToken;
}

function dbError(status: number, json: { message?: string; code?: string }): Error {
  if (status === 401) return new Error('انتهت الجلسة، سجّل دخول مرة ثانية');
  if (status === 403 || json.code === '42501') return new Error('ما عندك صلاحية على هالبيانات');
  if (json.message?.includes('car does not belong')) return new Error('السيارة مو لك');
  return new Error('ما قدرنا نحفظ، حاول مرة ثانية');
}

/** قراءة وكتابة الجداول (PostgREST). كل طلب يمشي بتوكن المستخدم، و RLS تفلتر */
export async function db<T = unknown>(
  table: string,
  opts: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; query?: string; body?: unknown; upsertOn?: string } = {},
): Promise<T> {
  const { method = 'GET', query = '', body, upsertOn } = opts;
  const prefer = [method === 'GET' ? '' : 'return=representation', upsertOn ? 'resolution=merge-duplicates' : '']
    .filter(Boolean)
    .join(',');
  const q = upsertOn ? `${query}${query ? '&' : ''}on_conflict=${upsertOn}` : query;
  const res = await fetch(`${URL}/rest/v1/${table}${q ? `?${q}` : ''}`, {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${await token()}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw dbError(res.status, json ?? {});
  return json as T;
}

/** يرفع صورة من الجوال لمجلد المستخدم في المخزن الخاص، ويرجع مسارها */
export async function uploadImage(localUri: string, path: string): Promise<string> {
  const ext = (localUri.split('.').pop() ?? 'jpg').toLowerCase().replace('jpeg', 'jpg');
  const type = ext === 'png' ? 'image/png' : ext === 'heic' ? 'image/heic' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
  const fullPath = `${path}.${ext}`;
  const blob = await (await fetch(localUri)).blob();
  const res = await fetch(`${URL}/storage/v1/object/${BUCKET}/${fullPath}`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${await token()}`, 'Content-Type': type, 'x-upsert': 'true' },
    body: blob,
  });
  if (!res.ok) throw new Error('ما قدرنا نرفع الصورة، حاول مرة ثانية');
  return fullPath;
}

/** روابط مؤقتة (أسبوع) للصور الخاصة — الرابط يشتغل بس لصاحب الصورة */
export async function signedUrls(paths: string[]): Promise<Record<string, string>> {
  if (!paths.length) return {};
  const res = await fetch(`${URL}/storage/v1/object/sign/${BUCKET}`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn: 60 * 60 * 24 * 7, paths }),
  });
  if (!res.ok) return {};
  const list = (await res.json()) as { path: string; signedURL?: string }[];
  const out: Record<string, string> = {};
  for (const item of list) if (item.signedURL) out[item.path] = `${URL}/storage/v1${item.signedURL}`;
  return out;
}

/** معرّف عشوائي بصيغة uuid — قاعدة البيانات تقبله كـ id */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
