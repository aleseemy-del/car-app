import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * create-payment — يسوي رابط دفع ماي فاتورة لعربون حجز ورشة.
 *
 * قواعد الأسبوع ٤:
 * - التطبيق يرسل رقم الحجز بس. المبلغ يجيبه الخادم من جدول workshops — أي مبلغ من التطبيق ينتجاهل.
 * - توكن ماي فاتورة في Secrets، ما يوصل الجوال أبداً.
 * - الحجز ما يصير "مدفوع" هنا. يصير بس لما ماي فاتورة تأكد في payment-callback.
 *
 * Secrets (تحطها أنت من لوحة Supabase ← Edge Functions ← Secrets):
 *   MYFATOORAH_TOKEN     — توكن التجربة (Sandbox)
 *   MYFATOORAH_BASE_URL  — اختياري، الافتراضي https://apitest.myfatoorah.com (تجريبي)
 */

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/** طلب لقاعدة البيانات بتوكن المستخدم — RLS تقرر شنو يشوف */
const asUser = (jwt: string, path: string, init: RequestInit = {}) =>
  fetch(`${SB_URL}${path}`, { ...init, headers: { apikey: ANON, Authorization: jwt, "Content-Type": "application/json", ...(init.headers ?? {}) } });

/** طلب بصلاحية الخادم — بس لتحديث حالة الدفع */
const asServer = (path: string, init: RequestInit = {}) =>
  fetch(`${SB_URL}${path}`, { ...init, headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", ...(init.headers ?? {}) } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const token = Deno.env.get("MYFATOORAH_TOKEN");
  if (!token) return json({ error: "الدفع مو مفعّل للحين" }, 503);
  const base = (Deno.env.get("MYFATOORAH_BASE_URL") || "https://apitest.myfatoorah.com").replace(/\/$/, "");

  const jwt = req.headers.get("Authorization") ?? "";
  let bookingId: unknown;
  try {
    ({ bookingId } = await req.json());
  } catch {
    return json({ error: "طلب غير صحيح" }, 400);
  }
  if (typeof bookingId !== "string" || !/^[0-9a-f-]{36}$/i.test(bookingId)) return json({ error: "طلب غير صحيح" }, 400);

  // ١. الحجز — بتوكن المستخدم، فلو مو حجزه أو حجز سيارة مشاركة معه، ما يرجع شي
  const bRes = await asUser(jwt, `/rest/v1/bookings?id=eq.${bookingId}&select=id,car_id,workshop_id,service_label,date,time,payment_status,invoice_id`);
  const booking = (await bRes.json())?.[0];
  if (!booking) return json({ error: "الحجز مو موجود" }, 404);
  if (booking.payment_status === "paid") return json({ error: "هالحجز مدفوع من قبل" }, 409);

  // ٢. صلاحيته: المالك أو "يشوف ويعدّل" بس يدفعون
  const rRes = await asUser(jwt, `/rest/v1/rpc/car_role`, { method: "POST", body: JSON.stringify({ p_car: booking.car_id }) });
  const role = await rRes.json();
  if (role !== "owner" && role !== "manager") return json({ error: "صلاحيتك على هالسيارة مشاهدة بس" }, 403);

  // ٢.٥ لو فيه فاتورة قديمة لنفس الحجز: نسأل ماي فاتورة هل اندفعت؟ ما نبدّلها قبل ما نتأكد
  // (وإلا ممكن العميل يدفع الفاتورة القديمة وتنخصم فلوسه والحجز يبقى غير مدفوع)
  if (booking.invoice_id) {
    const oldRes = await fetch(`${base}/v2/GetPaymentStatus`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ Key: String(booking.invoice_id), KeyType: "InvoiceId" }),
    });
    const old = await oldRes.json().catch(() => null);
    if (oldRes.ok && old?.IsSuccess && old?.Data?.InvoiceStatus === "Paid") {
      const paidTx = old.Data.InvoiceTransactions?.find((t: { TransactionStatus?: string }) => t.TransactionStatus === "Succss" || t.TransactionStatus === "Success");
      await asServer(`/rest/v1/bookings?id=eq.${booking.id}`, {
        method: "PATCH",
        body: JSON.stringify({ payment_status: "paid", payment_id: paidTx?.PaymentId ?? null, paid_at: new Date().toISOString() }),
      });
      return json({ error: "هالحجز مدفوع من قبل" }, 409);
    }
  }

  // ٣. المبلغ من الخادم — مو من التطبيق
  const wRes = await asServer(`/rest/v1/workshops?id=eq.${encodeURIComponent(booking.workshop_id)}&select=name,deposit_kwd`);
  const workshop = (await wRes.json())?.[0];
  if (!workshop) return json({ error: "الورشة مو موجودة" }, 404);
  const amount = Number(workshop.deposit_kwd);

  // ٤. بيانات العميل من جلسته الموثقة
  const uRes = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: ANON, Authorization: jwt } });
  const user = await uRes.json();
  const name = (user?.user_metadata?.name as string) || "عميل";

  // ٥. رابط الدفع من ماي فاتورة
  const callback = `${SB_URL}/functions/v1/payment-callback`;
  const mfRes = await fetch(`${base}/v2/SendPayment`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      CustomerName: name,
      CustomerEmail: user?.email,
      NotificationOption: "LNK",
      InvoiceValue: amount,
      DisplayCurrencyIso: "KWD",
      CallBackUrl: callback,
      ErrorUrl: callback,
      Language: "ar",
      CustomerReference: booking.id,
      UserDefinedField: booking.id,
      InvoiceItems: [{ ItemName: `عربون ${booking.service_label} · ${workshop.name}`, Quantity: 1, UnitPrice: amount }],
    }),
  });
  const mf = await mfRes.json().catch(() => null);
  if (!mfRes.ok || !mf?.IsSuccess || !mf?.Data?.InvoiceURL) {
    // التفاصيل للسجلات بس
    console.error("myfatoorah SendPayment failed", mfRes.status, JSON.stringify(mf)?.slice(0, 500));
    if (mfRes.status === 401) return json({ error: "توكن ماي فاتورة غلط أو ناقص صلاحيات" }, 502);
    return json({ error: "ما قدرنا نجهز الدفع، حاول مرة ثانية" }, 502);
  }

  // ٦. نسجل الفاتورة على الحجز (بصلاحية الخادم) — الحالة "قيد الانتظار" لين ماي فاتورة تأكد
  await asServer(`/rest/v1/bookings?id=eq.${booking.id}`, {
    method: "PATCH",
    body: JSON.stringify({ amount_kwd: amount, invoice_id: String(mf.Data.InvoiceId), payment_status: "pending" }),
  });

  return json({ url: mf.Data.InvoiceURL, amountKwd: amount });
});
