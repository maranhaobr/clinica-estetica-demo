import {recover} from '../../lib/actions';
import Link from 'next/link';
export default async function Recovery({searchParams}:{searchParams:Promise<{enviado?:string}>}){const q=await searchParams;return <section className="auth"><h1>Recuperar acesso</h1>{q.enviado?<p role="status">Se o endereço estiver cadastrado, você receberá as instruções de recuperação.</p>:<form action={recover}><label>E-mail<input name="email" type="email" required maxLength={254} autoComplete="email"/></label><button>Enviar instruções</button></form>}<Link href="/login">Voltar ao login</Link></section>;}
