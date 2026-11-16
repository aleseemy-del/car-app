# تطبيق حالة السيارة — قواعد Claude

اقرأ أول: `docs/PRD.md` (شنو نبني) و `docs/PLAN.md` (المراحل) و `docs/DATABASE.md` (الجداول والأمان). واقرأ `AGENTS.md` لقواعد Expo.

## الأدوات
Expo SDK 58 · React Native · NativeWind · React Navigation · Supabase (عميل fetch في `src/services/supabase.ts`، والتحويل في `src/services/remote.ts`)

## قواعد ثابتة
- اشتغل على مرحلة وحدة من PLAN.md كل مرة. خطّط قبل ما تبني.
- بعد كل مرحلة: تأكد إنها تشتغل (`npx tsc --noEmit`)، اشرح التغييرات بكلام بسيط، Commit و Push، وحط ✓ عليها في PLAN.md.
- لا تغيّر PRD.md بدون ما تسألني.
- التطبيق يعرض بس اللي سجّله المستخدم — لا بيانات وهمية.
- أي جدول جديد: RLS مفعّل + قواعد للمالك + حدّث DATABASE.md.
- قبل أي UPDATE أو DELETE على قاعدة البيانات: اعرض الـ SQL واشرحه.
- المفتاح السري لـ Supabase أو أي مفتاح مدفوع: أبداً في التطبيق أو GitHub. مكانه Supabase Secrets.
- لا تثق بالجهاز في أي شي يمس الفلوس أو الصلاحيات.
- كل نص للمستخدم بالعربي (لهجة كويتية بسيطة) مع ترجمة في `src/i18n/en.ts`.
