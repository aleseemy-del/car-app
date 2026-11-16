import type { ExpenseCategory } from '../store/types';

export type ScannedReceipt = { amountKwd?: number; category?: ExpenseCategory; date?: string; note?: string };

/**
 * قراءة الفاتورة من الصورة.
 *
 * يحتاج خدمة OCR على السيرفر (مثلاً Supabase Edge Function تستخدم Claude أو Google Vision)
 * لأن قراءة النص من الصور ما تصير داخل الجوال بشكل موثوق.
 *
 * لين نربطها: ترجع null، والمستخدم يكمّل المبلغ يدوياً والصورة تنحفظ مع المصروف.
 * لما تجهز الخدمة: حط رابطها في RECEIPT_API_URL وبيشتغل تلقائياً.
 */
const RECEIPT_API_URL: string | null = null;

export async function scanReceipt(imageUri: string): Promise<ScannedReceipt | null> {
  if (!RECEIPT_API_URL) return null;
  try {
    const body = new FormData();
    body.append('image', { uri: imageUri, name: 'receipt.jpg', type: 'image/jpeg' } as unknown as Blob);
    const res = await fetch(RECEIPT_API_URL, { method: 'POST', body });
    if (!res.ok) return null;
    return (await res.json()) as ScannedReceipt;
  } catch {
    return null;
  }
}
