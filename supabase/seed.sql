-- Demonstration tenants only. No user passwords or global admin accounts.
insert into public.tenants(id,name,slug) values
 ('11111111-1111-4111-8111-111111111111','Lumina Estética Avançada','lumina'),
 ('22222222-2222-4222-8222-222222222222','Aurora — clínica de teste','aurora') on conflict do nothing;
insert into public.tenant_domains(tenant_id,hostname,is_primary,verification_status) values
 ('11111111-1111-4111-8111-111111111111','lumina.localhost',true,'verified'),
 ('22222222-2222-4222-8222-222222222222','aurora.localhost',true,'verified') on conflict do nothing;
insert into public.tenant_subscriptions(tenant_id,plan_code,status) values
 ('11111111-1111-4111-8111-111111111111','performance','active'),
 ('22222222-2222-4222-8222-222222222222','essential','active') on conflict do nothing;
