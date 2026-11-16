import { NextRequest,NextResponse } from 'next/server';
import { database } from '../../../lib/supabase';
import { recoveryOrigin } from '../../../lib/origin';
export async function GET(request:NextRequest){
 const origin=await recoveryOrigin();
 const code=request.nextUrl.searchParams.get('code');
 const tokenHash=request.nextUrl.searchParams.get('token_hash');
 const type=request.nextUrl.searchParams.get('type');
 const db=await database();
 if(code && code.length<=4096){
  const {error}=await db.auth.exchangeCodeForSession(code);
  if(!error)return NextResponse.redirect(new URL('/nova-senha',origin));
 } else if(tokenHash && tokenHash.length<=4096 && (type==='recovery' || type==='invite')){
  const {error}=await db.auth.verifyOtp({token_hash:tokenHash,type});
  if(!error)return NextResponse.redirect(new URL('/nova-senha',origin));
 }
 return NextResponse.redirect(new URL('/login?erro=link',origin));
}
