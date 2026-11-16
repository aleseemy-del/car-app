# قاعدة البيانات — Supabase (مشروع car-status)

- الرابط: `https://nsdbpmbgjantghhlmqli.supabase.co`
- المنطقة: eu-central-1
- ملف الإنشاء: `supabase/migrations/20261116_car_status_schema.sql`

## الجداول
| الجدول | شنو يحفظ | أهم الأعمدة |
|---|---|---|
| `profiles` | اسم المستخدم (صف لكل مستخدم، ينضاف تلقائياً عند التسجيل) | id = رقم المستخدم، name |
| `cars` | السيارات | name, model, plate, mileage_km, oil_due_km, oil_interval_km, insurance_expiry, inspection_expiry |
| `service_logs` | سجلات الخدمة | car_id, service (oil/battery/tires/brakes/ac/inspection/insurance), date, mileage_km, cost_kwd, expiry, interval_km, brand, product, spec |
| `expenses` | المصاريف | car_id, category (fuel/maintenance/wash/insurance/parts/other), amount_kwd (رقم بـ 3 خانات فلوس), date, odometer_km, receipt_path |
| `car_documents` | المستندات — وحدة من كل نوع لكل سيارة | car_id, type (registration/insurance/license/inspection), image_path, expiry |
| `family_members` | أفراد العائلة | name, phone, role (viewer/manager) |
| `bookings` | حجوزات الورش | car_id, workshop_id, service_label, date, time |

كل جدول فيه `user_id` يتعبّى تلقائياً من المستخدم المسجّل (`auth.uid()`).

## الأمان (RLS)
- RLS مفعّل على **كل** الجداول.
- كل جدول عليه 4 قواعد: المالك بس يقرأ / يضيف / يعدّل / يحذف صفوفه (`user_id = auth.uid()`).
- Trigger `ensure_car_owner`: ما ينفع تربط مصروف أو سجل أو مستند أو حجز بسيارة مو لك.
- مختبَر: مستخدم ثاني يشوف 0 سيارات، ومحاولته يربط مصروف بسيارة غيره أو يضيف صف باسم غيره تنرفض.

## الملفات (Storage)
- Bucket خاص: `car-files` (5 ميغا كحد أقصى، صور بس).
- المسار: `{user_id}/receipts/{expense_id}.jpg` و `{user_id}/documents/{car_id}-{type}.jpg`
- القواعد: كل مستخدم يقرأ ويرفع ويحذف داخل مجلده بس.
- الجدول يحفظ **المسار** (التذكرة)، والتطبيق يطلب رابط مؤقت (أسبوع) عشان يعرض الصورة.

## المفاتيح
| المفتاح | وين |
|---|---|
| Publishable (`sb_publishable_...`) | `.env.local` في التطبيق — آمن، RLS تحدّه |
| Secret (`sb_secret_...`) | **ما ينحط في التطبيق ولا GitHub أبداً** — للخادم بس (Edge Functions) |

## اللي يبقى على الجهاز
الإعدادات بس (اللغة، التنبيهات، الوحدة، تذكير الزيت) في AsyncStorage. وجلسة الدخول.
