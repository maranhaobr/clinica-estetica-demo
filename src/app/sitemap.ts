import type { MetadataRoute } from 'next';
import { clinic, procedures } from '@/lib/config';
export default function sitemap():MetadataRoute.Sitemap{return ['','/procedimentos','/contato',...procedures.map(p=>`/procedimentos/${p.slug}`)].map(path=>({url:`${clinic.url}${path}/` }));}

export const dynamic = 'force-static';
