import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawn,execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
const local=fileURLToPath(new URL('../../../.tools/node.exe',import.meta.url));
let runtime=process.execPath;
const supported=version=>{const [major,minor]=version.replace(/^v/,'').split('.').map(Number);return major>22 || (major===22&&minor>=16);};
if(!supported(process.version)){
 if(!existsSync(local)||!supported(execFileSync(local,['--version'],{encoding:'utf8'}).trim())){
  console.error('O painel requer Node.js 22.16 ou superior. Atualize o Node e abra novamente o terminal.');process.exit(1);
 }
 runtime=local;
 console.log('Usando o Node.js 22 local do projeto para executar o Next.js.');
}
const child=spawn(runtime,[path.join(root,'node_modules/next/dist/bin/next'),...process.argv.slice(2)],{cwd:root,stdio:'inherit',env:{...process.env,PATH:path.dirname(runtime)+path.delimiter+process.env.PATH}});
child.on('error',()=>{console.error('Não foi possível iniciar o Next.js. Execute npm ci e tente novamente.');process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code??1;});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
