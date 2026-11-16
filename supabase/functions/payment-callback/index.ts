import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * payment-callback — ماي فاتورة ترجّع العميل هنا بعد الدفع (أو الإلغاء).
 *
 * "ثق بالخادم مو بالصفحة": وصول العميل لهالرابط ما يثبت شي — أي أحد يقدر يفتحه.
 * فنسأل ماي فاتورة مباشرة (GetPaymentStatus) بالتوكن السري، ونتأكد إن الفاتورة
 * نفس فاتورة الحجز ونفس المبلغ. بعدها بس نخلي الحجز "مدفوع".
 *
 * verify_jwt = false لأن اللي يفتحه متصفح العميل جاي من ماي فاتورة (بدون توكن).
 */

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const text = (body: string, status = 200) =>
  new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

const asServer = (path: string, init: RequestInit = {}) =>
  fetch(`${SB_URL}${path}`, { ...init, headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", ...(init.headers ?? {}) } });

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const paymentId = url.searchParams.get("paymentId");
  if (!paymentId || !/^[\w-]{1,64}$/.test(paymentId)) return text("رابط غير صحيح.", 400);

  const token = Deno.env.get("MYFATOORAH_TOKEN");
  if (!token) return text("الدفع مو مفعّل.", 503);
  const base = (Deno.env.get("MYFATOORAH_BASE_URL") || "https://apitest.myfatoorah.com").replace(/\/$/, "");

  // ١. نسأل ماي فاتورة: شنو صار فعلاً؟
  const mfRes = await fetch(`${base}/v2/GetPaymentStatus`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ Key: paymentId, KeyType: "PaymentId" }),
  });
  const mf = await mfRes.json().catch(() => null);
  const data = mf?.Data;
  if (!mfRes.ok || !mf?.IsSuccess || !data) {
    console.error("GetPaymentStatus failed", mfRes.status, JSON.stringify(mf)?.slice(0, 500));
    return text("ما قدرنا نتأكد من الدفع. ارجع للتطبيق وشيّك حالة الحجز.", 502);
  }

  const bookingId = String(data.UserDefinedField || data.CustomerReference || "");
  if (!/^[0-9a-f-]{36}$/i.test(bookingId)) return text("الحجز مو موجود.", 404);

  // ٢. نطابق الفاتورة والمبلغ مع الحجز المحفوظ عندنا
  const bRes = await asServer(`/rest/v1/bookings?id=eq.${bookingId}&select=id,invoice_id,amount_kwd,payment_status`);
  const booking = (await bRes.json())?.[0];
  if (!booking) return text("الحجز مو موجود.", 404);
  const sameInvoice = String(booking.invoice_id) === String(data.InvoiceId);
  const sameAmount = Math.abs(Number(booking.amount_kwd) - Number(data.InvoiceValue)) < 0.001;

  const paid = data.InvoiceStatus === "Paid" && sameInvoice && sameAmount;
  if (data.InvoiceStatus === "Paid" && !paid) {
    console.error("payment mismatch", { bookingId, sameInvoice, sameAmount });
    return text("فيه اختلاف في بيانات الدفع. تواصل معنا.", 409);
  }

  // ٣. نحدّث الحالة (بصلاحية الخادم بس — التطبيق ما يقدر يغيّرها)
  if (booking.payment_status !== "paid") {
    await asServer(`/rest/v1/bookings?id=eq.${bookingId}`, {
      method: "PATCH",
      body: JSON.stringify(
        paid
          ? { payment_status: "paid", payment_id: paymentId, paid_at: new Date().toISOString() }
          : { payment_status: "failed", payment_id: paymentId },
      ),
    });
  }

  return paid
    ? text(`✅ تم الدفع بنجاح\n\nالمبلغ: ${Number(data.InvoiceValue).toFixed(3)} د.ك\n\nارجع لتطبيق حالة السيارة — حجزك صار مدفوع.`)
    : text("❌ ما تم الدفع\n\nارجع لتطبيق حالة السيارة وحاول مرة ثانية.");
});
