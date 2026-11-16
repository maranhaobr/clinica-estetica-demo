begin;
insert into auth.users(id) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.tenant_members(tenant_id,user_id,role) values
 ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','owner'),
 ('22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','viewer');
set local role authenticated;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true);
do $$ begin
 if (select count(*) from public.tenants)<>1 then raise exception 'Tenant isolation failed';end if;
 if exists(select 1 from public.tenants where slug='aurora') then raise exception 'Cross-tenant data leaked';end if;
 if (select count(*) from public.tenant_domains)<>1 then raise exception 'Domains leaked';end if;
 if (select count(*) from public.tenant_subscriptions)<>1 then raise exception 'Subscriptions leaked';end if;
 if (select count(*) from public.tenant_members)<>1 then raise exception 'Members leaked';end if;
 if exists(select 1 from public.platform_admins) then raise exception 'Owner gained platform privileges';end if;
 begin insert into public.platform_admins(user_id) values(auth.uid());raise exception 'Role escalation allowed';exception when insufficient_privilege then null;end;
 begin update public.tenant_members set role='admin';raise exception 'Membership mutation allowed';exception when insufficient_privilege then null;end;
 begin insert into public.tenants(name,slug) values('Bad','bad');raise exception 'Tenant creation allowed';exception when insufficient_privilege then null;end;
end $$;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',true);
do $$begin
 if (select count(*) from public.tenants)<>1 or exists(select 1 from public.tenants where slug='lumina') then raise exception 'Viewer isolation failed';end if;
end $$;
reset role;
update public.tenants set status='inactive' where slug='aurora';
set local role authenticated;
do $$begin if exists(select 1 from public.tenants) then raise exception 'Inactive tenant accessible';end if;end $$;
reset role;
set local role anon;
do $$begin
 begin perform * from public.tenants;raise exception 'Anonymous access allowed';exception when insufficient_privilege then null;end;
 if public.is_verified_hostname('evil.example') then raise exception 'Unknown host accepted';end if;
 if not public.is_verified_hostname('lumina.localhost') then raise exception 'Verified host rejected';end if;
end $$;
rollback;
