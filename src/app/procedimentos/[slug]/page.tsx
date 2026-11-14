import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { procedures } from '@/lib/config';
import { BookingButton, ProcedureView } from '@/components/ui';
export function generateStaticParams(){return procedures.map(p=>({slug:p.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const p=procedures.find(p=>p.slug===slug);return {title:p?.name || 'Procedimento',description:p?.description};}
export default async function Procedure({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=procedures.find(p=>p.slug===slug);if(!p)notFound();return <section className="section procedure-detail"><ProcedureView slug={p.slug}/><Link href="/procedimentos/" className="text-link">← Todos os procedimentos</Link><div className="detail-grid"><div className="detail-image"><Image src={p.image} alt={`Fotografia ilustrativa de ${p.name}`} fill priority sizes="(max-width: 750px) 90vw, 45vw"/></div><div><span className="eyebrow">{p.category}</span><h1>{p.name}</h1><p className="lead">{p.description}</p><h2>Um cuidado com propósito</h2><p>{p.objective}</p><h2>O que você precisa saber</h2><p>{p.detail}</p><BookingButton procedure={p.name}/><p className="disclaimer">Procedimento demonstrativo. Este conteúdo não é uma recomendação clínica, não garante resultados e não substitui orientação profissional.</p></div></div></section>;}
