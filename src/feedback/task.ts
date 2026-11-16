/** أخطاء مفهومة للمستخدم */
export class TimeoutError extends Error {}

export const TASK_TIMEOUT_MS = 15000;

/** يوقف العملية لو علقت أكثر من المدة */
export function withTimeout<T>(p: Promise<T>, ms = TASK_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new TimeoutError('timeout')), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

/** يحوّل أي خطأ لرسالة واضحة */
export function errorMessage(e: unknown): string {
  if (e instanceof TimeoutError) return 'العملية أخذت وقت أطول من المتوقع';
  const msg = e instanceof Error ? e.message : String(e ?? '');
  if (/network|fetch|internet/i.test(msg)) return 'تأكد من اتصال الإنترنت';
  if (msg && /[؀-ۿ]/.test(msg)) return msg; // رسالة عربية جاهزة من الكود
  return 'صار خطأ، حاول مرة ثانية';
}
