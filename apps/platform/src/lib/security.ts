import { z } from 'zod';
export const roleSchema = z.enum(['owner', 'admin', 'viewer']);
export type Role = z.infer<typeof roleSchema>;
export function normalizeHost(raw: string): string {
  if (!raw || raw.length > 260 || /[\s,@/\\?#]/.test(raw)) throw new Error('INVALID_HOST');
  const parsed = /^(?<host>[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?)(?::(?<port>\d{1,5}))?$/i.exec(raw);
  if (!parsed?.groups) throw new Error('INVALID_HOST');
  if (parsed.groups.port && (Number(parsed.groups.port) < 1 || Number(parsed.groups.port) > 65535)) throw new Error('INVALID_HOST');
  const host = parsed.groups.host.toLowerCase();
  if (host.split('.').some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) throw new Error('INVALID_HOST');
  return host;
}
export function authorize(tenant: {id:string;status:string}, member: {tenant_id:string;user_id:string;role:string} | null, userId:string): Role {
  if (tenant.status !== 'active' || !member || member.tenant_id !== tenant.id || member.user_id !== userId) throw new Error('FORBIDDEN');
  return roleSchema.parse(member.role);
}
export function hasFeature(plan: string, feature: 'analytics'|'recommendations'|'support', enabled = true) {
  return enabled && (feature === 'support' ? ['essential','performance'].includes(plan) : plan === 'performance');
}
export const loginSchema = z.object({email:z.email().max(254),password:z.string().min(1).max(128)});
export const passwordSchema = z.string().min(12).max(128);
