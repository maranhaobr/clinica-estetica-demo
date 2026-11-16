import { AuthEmailSession } from '../components/auth-email-session';
import type { Metadata } from 'next';
import './style.css';
export const metadata:Metadata={title:'Lumina · Painel da clínica',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body><AuthEmailSession/><main>{children}</main></body></html>;}
