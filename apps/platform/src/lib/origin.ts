import 'server-only';
import { headers } from 'next/headers';
import { database } from './supabase';
import { normalizeHost } from './security';
export async function recoveryOrigin() {
 const host=(await headers()).get('host') || '';
 const normalized=normalizeHost(host);
 const db=await database();
 const {data,error}=await db.rpc('is_verified_hostname',{candidate:normalized});
 if(error || data!==true) throw new Error('UNVERIFIED_DOMAIN');
 const local=process.env.NODE_ENV!=='production' && normalized.endsWith('.localhost');
 return new URL(`${local?'http':'https'}://${local?host:normalized}`);
}
