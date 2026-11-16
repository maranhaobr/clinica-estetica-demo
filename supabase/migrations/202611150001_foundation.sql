-- Foundation. Apply through Supabase CLI or the SQL editor as postgres.
begin;
create schema if not exists private;
create table public.tenants (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 1 and 160),
 slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), status text not null default 'active' check(status in ('active','inactive')),
 logo_url text, primary_color text not null default '#5B463D' check(primary_color ~ '^#[0-9A-Fa-f]{6}$'), secondary_color text not null default '#E8DDD1' check(secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.tenant_domains (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants on delete cascade,
 hostname text not null unique check(hostname=lower(hostname) and length(hostname)<=253 and hostname ~ '^[a-z0-9]+([.-][a-z0-9]+)*$'),
 is_primary boolean not null default false, verification_status text not null default 'pending' check(verification_status in ('pending','verified','rejected')), created_at timestamptz not null default now()
);
create unique index one_primary_domain on public.tenant_domains(tenant_id) where is_primary;
create table public.profiles (
 id uuid primary key references auth.users on delete cascade, full_name text not null default '' check(length(full_name)<=160), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.tenant_members (
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references public.tenants on delete cascade, user_id uuid not null references public.profiles on delete cascade,
 role text not null check(role in ('owner','admin','viewer')), created_at timestamptz not null default now(), unique(tenant_id,user_id)
);
create index members_user on public.tenant_members(user_id,tenant_id);
-- This permission is separate from tenant owner/admin and never user-editable.
create table public.platform_admins(user_id uuid primary key references public.profiles on delete cascade, created_at timestamptz not null default now());
create table public.plans(code text primary key check(code in ('essential','performance')),name text not null,price numeric(10,2) not null check(price>=0),features jsonb not null);
insert into public.plans values ('essential','Essencial',149,'["support"]'),('performance','Performance',299,'["analytics","recommendations","support"]');
create table public.tenant_subscriptions (
 id uuid primary key default gen_random_uuid(),tenant_id uuid not null references public.tenants on delete cascade,plan_code text not null references public.plans,
 status text not null check(status in ('active','inactive')),started_at timestamptz not null default now(),ends_at timestamptz,check(ends_at is null or ends_at>started_at)
);
create unique index one_active_subscription on public.tenant_subscriptions(tenant_id) where status='active';
create function private.is_member(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.tenant_members m join public.tenants t on t.id=m.tenant_id where m.tenant_id=target and m.user_id=(select auth.uid()) and t.status='active');
$$;
revoke all on function private.is_member(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_member(uuid) to authenticated;
create function private.touch_updated_at() returns trigger language plpgsql set search_path='' as $$begin new.updated_at=now(); return new;end;$$;
create trigger touch_tenants before update on public.tenants for each row execute function private.touch_updated_at();
create trigger touch_profiles before update on public.profiles for each row execute function private.touch_updated_at();
create function private.create_profile() returns trigger language plpgsql security definer set search_path='' as $$begin insert into public.profiles(id) values(new.id);return new;end;$$;
revoke all on function private.create_profile() from public;
create trigger auth_profile after insert on auth.users for each row execute function private.create_profile();
insert into public.profiles(id) select id from auth.users on conflict do nothing;
alter table public.tenants enable row level security;
alter table public.tenant_domains enable row level security;
alter table public.profiles enable row level security;
alter table public.tenant_members enable row level security;
alter table public.platform_admins enable row level security;
alter table public.plans enable row level security;
alter table public.tenant_subscriptions enable row level security;
-- Explicit grants: customers can read their data, never assign roles, tenants or subscriptions.
revoke all on public.tenants,public.tenant_domains,public.profiles,public.tenant_members,public.platform_admins,public.plans,public.tenant_subscriptions from anon,authenticated;
grant select on public.tenants,public.tenant_domains,public.profiles,public.tenant_members,public.platform_admins,public.plans,public.tenant_subscriptions to authenticated;
create policy tenant_read on public.tenants for select to authenticated using(private.is_member(id));
create policy domain_read on public.tenant_domains for select to authenticated using(private.is_member(tenant_id) and verification_status='verified');
create policy profile_read on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy member_read on public.tenant_members for select to authenticated using(user_id=(select auth.uid()) and private.is_member(tenant_id));
create policy global_permission_read on public.platform_admins for select to authenticated using(user_id=(select auth.uid()));
create policy plan_read on public.plans for select to authenticated using(true);
create policy subscription_read on public.tenant_subscriptions for select to authenticated using(private.is_member(tenant_id));
create function public.is_verified_hostname(candidate text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.tenant_domains d join public.tenants t on t.id=d.tenant_id where d.hostname=candidate and d.verification_status='verified' and t.status='active');
$$;
revoke all on function public.is_verified_hostname(text) from public;
grant execute on function public.is_verified_hostname(text) to anon,authenticated;
commit;
