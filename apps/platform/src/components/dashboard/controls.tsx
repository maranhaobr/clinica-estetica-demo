'use client';
import {useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {CalendarDays,Download,Loader2} from 'lucide-react';
import {Button} from '../ui/button';
import {reportCSV,type Report} from '../../features/analytics/model';
export function PeriodFilter({period}:{period:number}){
 const router=useRouter(),[pending,startTransition]=useTransition();
 return <label className="period-picker"><CalendarDays size={17}/><span className="sr-only">Período do relatório</span><select value={period} disabled={pending} onChange={e=>{const value=e.target.value;startTransition(()=>router.push(`/painel?periodo=${value}`,{scroll:false}));}} aria-label="Período do relatório">{[7,30,90].map(n=><option key={n} value={n}>Últimos {n} dias</option>)}</select>{pending&&<Loader2 size={16} className="loading-spinner"/>}</label>;
}
export function ExportReport({report}:{report:Report}){
 function download(){const url=URL.createObjectURL(new Blob([reportCSV(report)],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=`relatorio-demonstracao-${report.start}-${report.end}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <Button variant="outline" onClick={download}><Download/>Exportar CSV</Button>;
}
