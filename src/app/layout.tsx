import type { Metadata } from 'next';
import { Header, Footer } from '@/components/ui';
import { clinic } from '@/lib/config';
import './globals.css';
export const metadata: Metadata = { metadataBase: new URL(clinic.url), title: {default:'Lumina EstÃ©tica AvanÃ§ada | Sua beleza, sua essÃªncia.',template:'%s | Lumina'}, description:'Uma experiÃªncia demonstrativa de estÃ©tica e autocuidado. ConheÃ§a a Lumina, seus cuidados faciais, corporais e sua filosofia de beleza natural.', robots:{index:false,follow:false}, openGraph:{title:clinic.name,description:clinic.slogan,locale:'pt_BR',type:'website',images:[{url:'/images/hero-lumina.webp',width:1536,height:1024,alt:'Lumina â€” imagem ilustrativa de autocuidado'}]} };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="pt-BR"><body style={{'--cream':clinic.colors.cream,'--beige':clinic.colors.beige,'--rose':clinic.colors.rose,'--brown':clinic.colors.brown,'--ink':clinic.colors.ink} as React.CSSProperties}><a href="#conteudo" className="skip-link">Pular para o conteÃºdo</a><Header/><main id="conteudo">{children}</main><Footer/></body></html>;}

