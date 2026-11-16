import 'server-only';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { database } from './supabase';
import { normalizeHost, authorize, hasFeature } from './security';
export async function context() {
  const db=await database();
  const {data:{user},error}=await db.auth.getUser();
  if(error || !user) redirect('/login');
  // Forwarded host and client-supplied tenant IDs are deliberately ignored.
  const host=normalizeHost((await headers()).get('host') || '');
  const domain=await db.from('tenant_domains').select('tenant_id').eq('hostname',host).eq('verification_status','verified').maybeSingle();
  if(domain.error || !domain.data) notFound();
  const tenantResult=await db.from('tenants').select('id,name,status,primary_color,secondary_color,logo_url').eq('id',domain.data.tenant_id).single();
  const memberResult=await db.from('tenant_members').select('tenant_id,user_id,role').eq('tenant_id',domain.data.tenant_id).eq('user_id',user.id).maybeSingle();
  if(tenantResult.error || !tenantResult.data || memberResult.error) notFound();
  const role=authorize(tenantResult.data,memberResult.data,user.id);
  return {db,user,tenant:tenantResult.data,role};
}
export async function requireFeature(feature:'analytics'|'recommendations'|'support') {
  const ctx=await context();
  const {data,error}=await ctx.db.from('tenant_subscriptions').select('plan_code').eq('tenant_id',ctx.tenant.id).eq('status','active').or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`).maybeSingle();
  if(error || !hasFeature(data?.plan_code || '',feature)) throw new Error('FEATURE_UNAVAILABLE');
  return ctx;
}
export async function requireGlobalAdmin() {
  const db=await database();
  const {data:{user},error:authError}=await db.auth.getUser();
  if(authError || !user) redirect('/login');
  const {data,error}=await db.from('platform_admins').select('user_id').eq('user_id',user.id).maybeSingle();
  if(error || !data) throw new Error('FORBIDDEN');
  return {db,user};
}
