import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('PostgreSQL enforces RLS, blocks cross-clinic access, mutations and role escalation',async()=>{
 const db=await PGlite.create();
 try {
  for(const file of ['tests/bootstrap.sql','migrations/202611150001_foundation.sql','seed.sql','tests/isolation.sql']) {
   const sql=await readFile(new URL(`../../../supabase/${file}`,import.meta.url),'utf8');
   await db.exec(sql.replace(/^\uFEFF/,''));
  }
 } finally { await db.close(); }
});
