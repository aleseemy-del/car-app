import type { ExpenseCategory } from '../store/types';
import { auth, supabaseConfigured } from './supabase';
import { remote } from './remote';

export type ScannedReceipt = { amountKwd?: number; category?: ExpenseCategory; date?: string; note?: string };

/** يحوّل صورة من الجوال لنص base64 عشان ترسل للخادم */
async function toBase64(uri: string): Promise<string> {
  const blob = await (await fetch(uri)).blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(blob);
  });
}

/**
 * قراءة الفاتورة من الصورة بالذكاء الاصطناعي.
 *
 * تشتغل على خادم Supabase (Edge Function اسمها scan-receipt)، ومفتاح OpenRouter محفوظ هناك
 * في Secrets — التطبيق ما يشوف المفتاح أبداً (درس "موظف البنك" في الأسبوع ٣).
 *
 * لو المستخدم مو مسجّل، أو الخدمة مو مفعّلة، أو فشلت: ترجع null
 * والمستخدم يكمّل المبلغ يدوياً، والصورة تنحفظ مع المصروف عادي.
 */
export async function scanReceipt(imageUri: string): Promise<ScannedReceipt | null> {
  if (!supabaseConfigured || !(await auth.getSession())) return null;
  try {
    const result = await remote.scanReceipt(await toBase64(imageUri));
    // الذكاء الاصطناعي ممكن يغلط بثقة — الخادم تحقق من الأرقام، والمستخدم يراجع قبل الحفظ
    return result && (result.amountKwd || result.category || result.note) ? result : null;
  } catch {
    return null;
  }
}
