/**
 * التحقق برقم الجوال (OTP).
 *
 * الحين: وضع تجريبي — أي رمز من 6 أرقام يقبل، وما فيه رسالة SMS فعلية.
 * للتشغيل الحقيقي: اربط Supabase Auth بمزوّد SMS ثم استبدل الدالتين:
 *   sendCode   -> supabase.auth.signInWithOtp({ phone })
 *   verifyCode -> supabase.auth.verifyOtp({ phone, token: code, type: 'sms' })
 */
export const AUTH_DEMO_MODE = true;

/** +965XXXXXXXX */
export const toKuwaitPhone = (local: string) => `+965${local.replace(/\D/g, '').slice(-8)}`;

/** رقم كويتي: 8 أرقام يبدأ بـ 5 أو 6 أو 9 أو 4 */
export const isValidKuwaitMobile = (local: string) => /^[4569]\d{7}$/.test(local.replace(/\D/g, ''));

export async function sendCode(phone: string): Promise<{ ok: boolean; error?: string }> {
  if (AUTH_DEMO_MODE) return { ok: true };
  void phone;
  return { ok: false, error: 'خدمة الرسائل غير مربوطة' };
}

export async function verifyCode(phone: string, code: string): Promise<{ ok: boolean; error?: string }> {
  if (AUTH_DEMO_MODE) return /^\d{6}$/.test(code) ? { ok: true } : { ok: false, error: 'الرمز 6 أرقام' };
  void phone;
  return { ok: false, error: 'خدمة الرسائل غير مربوطة' };
}
