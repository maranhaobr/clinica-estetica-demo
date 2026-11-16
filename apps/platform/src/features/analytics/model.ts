import { z } from 'zod';
export const periodSchema=z.enum(['7','30','90']);
export type Period=7|30|90;
export function parsePeriod(value:unknown):Period {const result=periodSchema.safeParse(value??'30');return result.success?Number(result.data) as Period:30;}
export type DailyMetric={date:string;sessions:number;userIds:string[];whatsappClicks:number;bookingClicks:number;procedures:{slug:string;name:string;views:number}[]};
export interface AnalyticsProvider { readonly mode:'demo'|'live'; getDaily(tenantId:string,asOf:string):Promise<DailyMetric[]>; }
export const procedureNames=['Limpeza de pele','Hidratação facial','Peeling facial','Drenagem linfática','Massagem relaxante','Tratamentos corporais'];
const slugs=['limpeza-de-pele','hidratacao-facial','peeling-facial','drenagem-linfatica','massagem-relaxante','tratamentos-corporais'];
export function dateOffset(date:string,offset:number){const d=new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10);}
function hash(value:string){let n=2166136261;for(const char of value)n=Math.imul(n^char.charCodeAt(0),16777619);return n>>>0;}
export class MockAnalyticsProvider implements AnalyticsProvider {
 readonly mode='demo' as const;
 async getDaily(tenantId:string,asOf:string):Promise<DailyMetric[]> {
  return Array.from({length:90},(_,i)=>{
   const date=dateOffset(asOf,i-89),seed=hash(`${tenantId}:${date}`),day=new Date(`${date}T12:00:00Z`).getUTCDay();
   const sessions=45+seed%80+(day===0?0:30)+Math.floor(i/5);
   const users=Math.floor(sessions*.78),whatsappClicks=Math.floor(sessions*(.07+(seed%7)/100));
   return {date,sessions,userIds:Array.from({length:users},(_,j)=>`${tenantId}:visitor-${(seed%390+j*7)%613}`),whatsappClicks,bookingClicks:Math.floor(whatsappClicks*.58),procedures:procedureNames.map((name,j)=>({name,slug:slugs[j],views:Math.floor(sessions*[.34,.25,.19,.15,.12,.09][j])+((seed>>j)%9)}))};
  });
 }
}
export function summarize(rows:DailyMetric[]) {
 const sum=(key:'sessions'|'whatsappClicks'|'bookingClicks')=>rows.reduce((total,r)=>total+r[key],0);
 const sessions=sum('sessions'),whatsappClicks=sum('whatsappClicks');
 return {sessions,visitors:new Set(rows.flatMap(row=>row.userIds)).size,whatsappClicks,bookingClicks:sum('bookingClicks'),whatsappRate:sessions===0?0:whatsappClicks/sessions*100};
}
export type Totals=ReturnType<typeof summarize>;
export function delta(current:number,previous:number):number|null{return previous===0?null:(current-previous)/previous*100;}
export function buildReport(rows:DailyMetric[],period:Period,asOf:string) {
 const start=dateOffset(asOf,1-period),previousStart=dateOffset(start,-period);
 const current=rows.filter(r=>r.date>=start&&r.date<=asOf).sort((a,b)=>a.date.localeCompare(b.date));
 const previousRows=rows.filter(r=>r.date>=previousStart&&r.date<start);
 const complete=previousRows.length===period && new Set(previousRows.map(r=>r.date)).size===period;
 const totals=summarize(current),previous=complete?summarize(previousRows):null;
 const ranking=new Map<string,{slug:string;name:string;views:number}>();
 for(const row of current)for(const item of row.procedures){const existing=ranking.get(item.slug);ranking.set(item.slug,{...item,views:(existing?.views??0)+item.views});}
 return {period,start,end:asOf,totals,previous,series:current.map(({date,sessions,whatsappClicks,bookingClicks})=>({date,sessions,whatsappClicks,bookingClicks})),procedures:[...ranking.values()].sort((a,b)=>b.views-a.views)};
}
export type Report=ReturnType<typeof buildReport>;

export function reportCSV(report:Report):string {
 const lines=['data,sessoes,cliques_whatsapp,cliques_agendar',...report.series.map(row=>`${row.date},${row.sessions},${row.whatsappClicks},${row.bookingClicks}`)];
 return String.fromCharCode(65279)+lines.join(String.fromCharCode(13,10));
}
