-- طُبّق على مشروع Supabase: car-status (nsdbpmbgjantghhlmqli) بتاريخ 2026-11-16
-- ملف الإنشاء الكامل: الجداول + أمان الصفوف (RLS) + مخزن الصور الخاص

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  phone text,
  created_at timestamptz not null default now()
);

create table public.cars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  model text not null default '',
  plate text not null default '',
  mileage_km integer not null default 0 check (mileage_km >= 0),
  oil_due_km integer check (oil_due_km >= 0),
  oil_interval_km integer not null default 5000 check (oil_interval_km > 0),
  insurance_expiry date,
  inspection_expiry date,
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  car_id uuid not null references public.cars(id) on delete cascade,
  category text not null check (category in ('fuel','maintenance','wash','insurance','parts','other')),
  amount_kwd numeric(10,3) not null check (amount_kwd >= 0),
  date date not null,
  odometer_km integer check (odometer_km >= 0),
  note text,
  receipt_path text,
  created_at timestamptz not null default now()
);

create table public.service_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  car_id uuid not null references public.cars(id) on delete cascade,
  service text not null check (service in ('oil','battery','tires','brakes','ac','inspection','insurance')),
  date date not null,
  mileage_km integer check (mileage_km >= 0),
  cost_kwd numeric(10,3) check (cost_kwd >= 0),
  workshop text,
  note text,
  expiry date,
  interval_km integer check (interval_km > 0),
  brand text,
  product text,
  spec text,
  created_at timestamptz not null default now()
);

create table public.car_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  car_id uuid not null references public.cars(id) on delete cascade,
  type text not null check (type in ('registration','insurance','license','inspection')),
  image_path text,
  expiry date,
  created_at timestamptz not null default now(),
  unique (car_id, type)
);

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  role text not null check (role in ('viewer','manager')),
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  car_id uuid not null references public.cars(id) on delete cascade,
  workshop_id text not null,
  service_label text not null,
  date date not null,
  time text not null,
  created_at timestamptz not null default now()
);

create index on public.cars (user_id);
create index on public.expenses (user_id);
create index on public.expenses (car_id);
create index on public.service_logs (user_id);
create index on public.service_logs (car_id);
create index on public.car_documents (user_id);
create index on public.family_members (user_id);
create index on public.bookings (user_id);
create index on public.bookings (car_id);

alter table public.profiles enable row level security;
create policy "Users read their own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users create their own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Users update their own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

do $$
declare t text;
begin
  foreach t in array array['cars','expenses','service_logs','car_documents','family_members','bookings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Owners read their own rows" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('create policy "Owners add their own rows" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "Owners update their own rows" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "Owners delete their own rows" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

create or replace function public.ensure_car_owner() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if not exists (select 1 from public.cars c where c.id = new.car_id and c.user_id = new.user_id) then
    raise exception 'car does not belong to this user';
  end if;
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['expenses','service_logs','car_documents','bookings'] loop
    execute format('create trigger ensure_car_owner before insert or update on public.%I for each row execute function public.ensure_car_owner()', t);
  end loop;
end $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), new.raw_user_meta_data->>'phone');
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('car-files', 'car-files', false, 5242880, array['image/jpeg','image/png','image/heic','image/webp']);

create policy "Owners read their own files" on storage.objects for select to authenticated
  using (bucket_id = 'car-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owners upload to their own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'car-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owners update their own files" on storage.objects for update to authenticated
  using (bucket_id = 'car-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owners delete their own files" on storage.objects for delete to authenticated
  using (bucket_id = 'car-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
