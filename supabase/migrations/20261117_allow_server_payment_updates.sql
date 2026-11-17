-- طُبّق على car-status بتاريخ 2026-11-17
-- إصلاح: الخادم (Edge Functions بالمفتاح السري) لازم يقدر يحدّث حالة الدفع على الحجز.
-- فحص "السيارة لك؟" كان يرفضه لأن الخادم ما هو مستخدم، فالحجز يبقى "غير مدفوع".
create or replace function public.ensure_car_owner() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if coalesce((select auth.role()), '') = 'service_role' then return new; end if;
  if coalesce(public.car_role(new.car_id), '') not in ('owner','manager') then
    raise exception 'car does not belong to this user';
  end if;
  return new;
end $$;
