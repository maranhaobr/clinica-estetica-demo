import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MockAnalyticsProvider,buildReport,parsePeriod,summarize,dateOffset,delta} from '../src/features/analytics/model';
test('period parser accepts only supported windows and defaults safely',()=>{assert.equal(parsePeriod('7'),7);assert.equal(parsePeriod('90'),90);for(const invalid of ['999','-1','',[],undefined])assert.equal(parsePeriod(invalid),30);});
test('mock produces 90 deterministic, distinct daily records with consistent metrics',async()=>{const provider=new MockAnalyticsProvider();const a=await provider.getDaily('a','2026-11-15');assert.deepEqual(a,await provider.getDaily('a','2026-11-15'));assert.equal(a.length,90);assert.equal(new Set(a.map(r=>r.date)).size,90);assert.equal(a[89].date,'2026-11-15');for(const r of a){assert.ok(r.bookingClicks<=r.whatsappClicks);assert.ok(r.whatsappClicks<=r.sessions);assert.ok(new Set(r.userIds).size<=r.sessions);assert.ok(r.procedures.every(p=>p.views>=0&&Number.isInteger(p.views)));}});
test('tenants have distinct mock series and visitor identities',async()=>{const p=new MockAnalyticsProvider();const a=await p.getDaily('a','2026-11-15'),b=await p.getDaily('b','2026-11-15');assert.notDeepEqual(a,b);assert.ok(!a[0].userIds.some(id=>b[0].userIds.includes(id)));});
test('filters scope every total, chart and ranking; never includes future days',async()=>{const rows=await new MockAnalyticsProvider().getDaily('a','2026-11-15');for(const n of [7,30,90] as const){const report=buildReport(rows,n,'2026-11-15');assert.equal(report.series.length,n);assert.deepEqual(report.totals,summarize(rows.slice(-n)));assert.equal(report.procedures.reduce((s,p)=>s+p.views,0),rows.slice(-n).reduce((s,r)=>s+r.procedures.reduce((x,p)=>x+p.views,0),0));assert.equal(report.previous!==null,n!==90);}});
test('unique visitors are deduplicated across days, not added',async()=>{const rows=await new MockAnalyticsProvider().getDaily('a','2026-11-15');rows[0].userIds=['same'];rows[1].userIds=['same','other'];assert.equal(summarize(rows.slice(0,2)).visitors,2);});
test('zero divisions, empty data and insufficient history are explicit',()=>{assert.equal(summarize([]).whatsappRate,0);assert.equal(delta(5,0),null);assert.equal(delta(20,10),100);assert.equal(buildReport([],7,'2026-11-15').previous,null);assert.equal(dateOffset('2026-03-01',-1),'2026-02-28');});

 test('CSV contains a UTF-8 BOM, real CRLF rows and exactly the selected period',async()=>{
  const {reportCSV}=await import('../src/features/analytics/model');
  const rows=await new MockAnalyticsProvider().getDaily('a','2026-11-15');
  const csv=reportCSV(buildReport(rows,7,'2026-11-15'));
  assert.equal(csv.charCodeAt(0),65279);
  assert.equal(csv.split(String.fromCharCode(13,10)).length,8);
  assert.ok(csv.includes('2026-11-15,'));
 });
