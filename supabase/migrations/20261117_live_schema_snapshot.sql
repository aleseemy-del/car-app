-- لقطة (snapshot) من مشروع Supabase الحي: car-status (nsdbpmbgjantghhlmqli) بتاريخ 2026-11-17
--
-- ليش هالملف؟ بعض التغييرات انطبّقت على القاعدة مباشرة (مشاركة العائلة، حذف الحساب، الدفع، حماية حقول الدفع)
-- وما كانت موجودة في ملفات المستودع. هالملف يسجّلها عشان لو انعاد بناء المشروع من الكود ما تضيع الحماية.
--
-- التشغيل: على مشروع جديد بعد 20261116_car_status_schema.sql و 20261117_allow_server_payment_updates.sql.
-- مكتوب بحيث يعيد تعريف الدوال والسياسات (drop/create or replace)، ويتحمّل إعادة التشغيل.

-- ───────────── الورش (القراءة فقط للمسجّلين، والمبلغ يقرأه الخادم) ─────────────
create table if not exists public.workshops (
  id text primary key,
  name text not null,
  area text not null,
  deposit_kwd numeric(10,3) not null check (deposit_kwd > 0)
);
alter table public.workshops enable row level security;
drop policy if exists "Anyone signed in reads workshops" on public.workshops;
create policy "Anyone signed in reads workshops" on public.workshops for select to authenticated using (true);

insert into public.workshops (id, name, area, deposit_kwd) values
  ('w1', 'ورشة النخبة', 'الشويخ الصناعية', 15),
  ('w2', 'مركز الإطارات السريع', 'الري', 6),
  ('w3', 'لمعة لغسيل السيارات', 'السالمية', 3),
  ('w4', 'برد للمكيفات', 'الفحيحيل', 12),
  ('w5', 'درع للتأمين', 'شرق', 60),
  ('w6', 'نجدة الطريق', 'كل المناطق', 10)
on conflict (id) do nothing;

-- ───────────── الدفع على الحجوزات ─────────────
alter table public.bookings add column if not exists amount_kwd numeric(10,3);
alter table public.bookings add column if not exists payment_status text not null default 'unpaid';
alter table public.bookings add column if not exists invoice_id text;
alter table public.bookings add column if not exists payment_id text;
alter table public.bookings add column if not exists paid_at timestamptz;
do $$ begin
  alter table public.bookings add constraint bookings_payment_status_check check (payment_status in ('unpaid','pending','paid','failed'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.bookings add constraint bookings_workshop_fk foreign key (workshop_id) references public.workshops(id);
exception when duplicate_object then null; end $$;

-- ───────────── مشاركة العائلة ─────────────
create table if not exists public.car_members (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  member_email text not null check (member_email = lower(member_email) and position('@' in member_email) > 1),
  member_name text not null default '',
  role text not null check (role in ('viewer','manager')),
  created_at timestamptz not null default now(),
  unique (car_id, member_email)
);
create index if not exists car_members_car_id_idx on public.car_members (car_id);
create index if not exists car_members_member_email_idx on public.car_members (member_email);
create index if not exists car_members_owner_id_idx on public.car_members (owner_id);
alter table public.car_members enable row level security;

-- دور المستخدم على سيارة. دور العائلة بالإيميل ما يُعطى إلا لحساب إيميله مؤكَّد
-- (وإلا أي أحد يسجّل بإيميل الشخص المدعو قبل ما يأكّد يشوف سيارته)
create or replace function public.car_role(p_car uuid) returns text
language sql stable security definer set search_path = '' as $$
  select case
    when exists (select 1 from public.cars c where c.id = p_car and c.user_id = (select auth.uid())) then 'owner'
    else (select m.role from public.car_members m
          where m.car_id = p_car
            and m.member_email = lower(coalesce((select auth.jwt()) ->> 'email', ''))
            and exists (select 1 from auth.users u where u.id = (select auth.uid()) and u.email_confirmed_at is not null)
          limit 1)
  end
$$;

-- ───────────── حماية الحجوزات والسيارات ─────────────
-- الخادم (service_role) بس يقدر يغيّر حقول الدفع. أي طلب من التطبيق تنتجاهل قيمه ويرجع القديم.
create or replace function public.protect_booking_payment() returns trigger
language plpgsql set search_path = '' as $$
begin
  if coalesce((select auth.role()), '') = 'service_role' then return new; end if;
  if tg_op = 'INSERT' then
    new.payment_status := 'unpaid';
    new.amount_kwd := null; new.invoice_id := null; new.payment_id := null; new.paid_at := null;
  else
    new.payment_status := old.payment_status;
    new.amount_kwd := old.amount_kwd; new.invoice_id := old.invoice_id;
    new.payment_id := old.payment_id; new.paid_at := old.paid_at;
  end if;
  return new;
end $$;

create or replace function public.prevent_paid_booking_delete() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.payment_status = 'paid' and coalesce((select auth.role()), '') <> 'service_role' then
    raise exception 'paid booking cannot be cancelled';
  end if;
  return old;
end $$;

create or replace function public.prevent_owner_change() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.user_id is distinct from old.user_id then raise exception 'car owner cannot change'; end if;
  return new;
end $$;

create or replace function public.ensure_car_owner() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if coalesce((select auth.role()), '') = 'service_role' then return new; end if;
  if coalesce(public.car_role(new.car_id), '') not in ('owner','manager') then
    raise exception 'car does not belong to this user';
  end if;
  return new;
end $$;

drop trigger if exists protect_booking_payment on public.bookings;
create trigger protect_booking_payment before insert or update on public.bookings for each row execute function public.protect_booking_payment();
drop trigger if exists prevent_paid_booking_delete on public.bookings;
create trigger prevent_paid_booking_delete before delete on public.bookings for each row execute function public.prevent_paid_booking_delete();
drop trigger if exists prevent_owner_change on public.cars;
create trigger prevent_owner_change before update on public.cars for each row execute function public.prevent_owner_change();

-- حذف الحساب (المستخدم يحذف حسابه هو بس، وكل بياناته تنحذف معه بالـ cascade)
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then raise exception 'not signed in'; end if;
  delete from auth.users where id = (select auth.uid());
end $$;

-- ───────────── السياسات (RLS) بعد مشاركة العائلة ─────────────
-- cars: المالك يضيف ويحذف، والمالك + "يشوف ويعدّل" يعدّلون، والعائلة كلها تقرا
drop policy if exists "Owners read their own rows" on public.cars;
drop policy if exists "Owners update their own rows" on public.cars;
drop policy if exists "Owners and family read cars" on public.cars;
create policy "Owners and family read cars" on public.cars for select to authenticated
  using (user_id = (select auth.uid()) or public.car_role(id) is not null);
drop policy if exists "Owners and managers update cars" on public.cars;
create policy "Owners and managers update cars" on public.cars for update to authenticated
  using (public.car_role(id) in ('owner','manager')) with check (public.car_role(id) in ('owner','manager'));

-- باقي الجداول اللي مربوطة بسيارة: العائلة تقرا، والمالك/المدير يضيف ويعدّل ويحذف
do $$
declare t text;
begin
  foreach t in array array['expenses','service_logs','car_documents','bookings'] loop
    execute format('drop policy if exists "Owners read their own rows" on public.%I', t);
    execute format('drop policy if exists "Owners add their own rows" on public.%I', t);
    execute format('drop policy if exists "Owners update their own rows" on public.%I', t);
    execute format('drop policy if exists "Owners delete their own rows" on public.%I', t);
    execute format('drop policy if exists "Car family reads rows" on public.%I', t);
    execute format('drop policy if exists "Owners and managers add rows" on public.%I', t);
    execute format('drop policy if exists "Owners and managers update rows" on public.%I', t);
    execute format('drop policy if exists "Owners and managers delete rows" on public.%I', t);
    execute format('create policy "Car family reads rows" on public.%I for select to authenticated using (public.car_role(car_id) is not null)', t);
    execute format('create policy "Owners and managers add rows" on public.%I for insert to authenticated with check (user_id = (select auth.uid()) and public.car_role(car_id) in (''owner'',''manager''))', t);
    execute format('create policy "Owners and managers update rows" on public.%I for update to authenticated using (public.car_role(car_id) in (''owner'',''manager'')) with check (public.car_role(car_id) in (''owner'',''manager''))', t);
    execute format('create policy "Owners and managers delete rows" on public.%I for delete to authenticated using (public.car_role(car_id) in (''owner'',''manager''))', t);
  end loop;
end $$;

drop policy if exists "Owners see members, members see themselves" on public.car_members;
create policy "Owners see members, members see themselves" on public.car_members for select to authenticated
  using (owner_id = (select auth.uid()) or member_email = lower(coalesce((select auth.jwt()) ->> 'email', '')));
drop policy if exists "Owners add members to their cars" on public.car_members;
create policy "Owners add members to their cars" on public.car_members for insert to authenticated
  with check (owner_id = (select auth.uid()) and public.car_role(car_id) = 'owner');
drop policy if exists "Owners update members" on public.car_members;
create policy "Owners update members" on public.car_members for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()) and public.car_role(car_id) = 'owner');
drop policy if exists "Owners remove members, members can leave" on public.car_members;
create policy "Owners remove members, members can leave" on public.car_members for delete to authenticated
  using (owner_id = (select auth.uid()) or member_email = lower(coalesce((select auth.jwt()) ->> 'email', '')));

-- العائلة تشوف الصور المشتركة (فواتير ومستندات السيارات اللي لها عليها صلاحية)
drop policy if exists "Car family reads shared files" on storage.objects;
create policy "Car family reads shared files" on storage.objects for select to authenticated
  using (bucket_id = 'car-files' and (
    exists (select 1 from public.expenses e where e.receipt_path = objects.name and public.car_role(e.car_id) is not null)
    or exists (select 1 from public.car_documents d where d.image_path = objects.name and public.car_role(d.car_id) is not null)
  ));

-- ───────────── حد استخدام قراءة الفواتير بالذكاء الاصطناعي ─────────────
-- الدالة scan-receipt تكتب وتقرا هنا بصلاحية الخادم بس (ما فيه سياسة = التطبيق ما يشوفه)
create table if not exists public.receipt_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists receipt_scans_user_time on public.receipt_scans (user_id, created_at desc);
alter table public.receipt_scans enable row level security;
revoke all on public.receipt_scans from anon, authenticated;

-- ───────────── حد استخدام المساعد (الشات بوت) ─────────────
create table if not exists public.chat_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists chat_usage_user_time on public.chat_usage (user_id, created_at desc);
alter table public.chat_usage enable row level security;
revoke all on public.chat_usage from anon, authenticated;
