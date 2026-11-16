'use client';
import { useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// Default Supabase emails can return an implicit session in the URL fragment.
// Fragments are never sent to the Next.js server. Consume them only in-browser,
// remove them from history immediately, and establish SSR-compatible cookies.
export function AuthEmailSession() {
 const started=useRef(false);
 useEffect(()=>{
  if(started.current || !window.location.hash) return;
  const params=new URLSearchParams(window.location.hash.slice(1));
  const access=params.get('access_token'),refresh=params.get('refresh_token'),type=params.get('type');
  if(!access || !refresh || (type!=='invite' && type!=='recovery')) return;
  started.current=true;
  window.history.replaceState(null,'',window.location.pathname+window.location.search);
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url || !key || access.length>16384 || refresh.length>8192){window.location.replace('/login?erro=link');return;}
  const db=createBrowserClient(url,key,{auth:{detectSessionInUrl:false}});
  void db.auth.setSession({access_token:access,refresh_token:refresh}).then(({error})=>{
   window.location.replace(error?'/login?erro=link':'/nova-senha');
  }).catch(()=>window.location.replace('/login?erro=link'));
 },[]);
 return null;
}
