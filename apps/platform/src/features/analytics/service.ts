import 'server-only';
import {requireFeature} from '../../lib/context';
import {MockAnalyticsProvider,buildReport,parsePeriod} from './model';
export async function getDashboard(periodInput:unknown){
 const ctx=await requireFeature('analytics');
 const asOf=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Fortaleza'}).format(new Date());
 const provider=new MockAnalyticsProvider();
 const rows=await provider.getDaily(ctx.tenant.id,asOf);
 return {tenant:ctx.tenant,email:ctx.user.email??'',role:ctx.role,mode:provider.mode,report:buildReport(rows,parsePeriod(periodInput),asOf)};
}
