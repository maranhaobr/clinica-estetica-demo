'use server';
import { redirect } from 'next/navigation';
import { database } from './supabase';
import { loginSchema,passwordSchema } from './security';
import { z } from 'zod';
import { recoveryOrigin } from './origin';
export async function login(form:FormData) {
  const parsed=loginSchema.safeParse(Object.fromEntries(form));
  if(!parsed.success) redirect('/login?erro=campos');
  const db=await database();
  const {error}=await db.auth.signInWithPassword(parsed.data);
  if(error) redirect('/login?erro=acesso');
  redirect('/painel');
}
export async function logout(){const db=await database();await db.auth.signOut();redirect('/login');}
export async function recover(form:FormData) {
  const email=z.email().max(254).safeParse(form.get('email'));
  if(email.success){
    const db=await database(); const origin=await recoveryOrigin();
    await db.auth.resetPasswordForEmail(email.data,{redirectTo:`${origin.origin}/auth/callback`});
  }
  redirect('/recuperar?enviado=1');
}
export async function updatePassword(form:FormData){
 const password=passwordSchema.safeParse(form.get('password'));
 if(!password.success)redirect('/nova-senha?erro=1');
 const db=await database();const {data:{user},error}=await db.auth.getUser();
 if(error || !user)redirect('/login');
 const result=await db.auth.updateUser({password:password.data});
 if(result.error)redirect('/nova-senha?erro=1');
 await db.auth.signOut();redirect('/login?senha=atualizada');
}
