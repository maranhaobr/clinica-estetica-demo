import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import nextEnv from '@next/env';

const root = fileURLToPath(new URL('../', import.meta.url));
const localNode = fileURLToPath(new URL('../../../.tools/node.exe', import.meta.url));
const [command, ...extra] = process.argv.slice(2);
if (!['build', 'preview', 'deploy', 'upload', 'dry-run', 'login'].includes(command)) {
  console.error('Comando Cloudflare inválido. Use build, preview, deploy, upload, dry-run ou login.');
  process.exit(1);
}
const supported = version => {
  const [major, minor] = version.replace(/^v/, '').split('.').map(Number);
  return major > 22 || (major === 22 && minor >= 16);
};
let runtime = process.execPath;
if (!supported(process.version)) {
  if (!existsSync(localNode) || !supported(execFileSync(localNode, ['--version'], { encoding: 'utf8' }).trim())) {
    console.error('Instale Node.js 22.16 ou superior para usar as ferramentas Cloudflare.');
    process.exit(1);
  }
  runtime = localNode;
}

// Load the same local production env files as next build, without printing values.
nextEnv.loadEnvConfig(root, false, { info() {}, error() {} });
if (command === 'build') {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || !URL.canParse(url) || new URL(url).protocol !== 'https:' || !key.startsWith('sb_publishable_')) {
    console.error('Configure NEXT_PUBLIC_SUPABASE_URL (HTTPS) e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY antes da build Cloudflare.');
    process.exit(1);
  }
} else if (command !== 'login' && !existsSync(path.join(root, '.open-next/worker.js'))) {
  console.error('Pacote Cloudflare ausente. Execute npm run build:cf primeiro.');
  process.exit(1);
}

const useWrangler = command === 'dry-run' || command === 'login';
const packageName = useWrangler ? 'wrangler' : '@opennextjs/cloudflare';
const packageRoot = path.join(root, 'node_modules', packageName);
const pkg = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin[useWrangler ? 'wrangler' : 'opennextjs-cloudflare'];
const args = command === 'dry-run' ? ['deploy', '--dry-run'] : [command];
if (command !== 'login') args.push('--config', path.join(root, 'wrangler.jsonc'));
args.push(...extra);
const child = spawn(runtime, [path.join(packageRoot, bin), ...args], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, PATH: path.dirname(runtime) + path.delimiter + process.env.PATH, WRANGLER_SEND_METRICS: 'false' },
});
child.on('error', () => { console.error('Falha ao executar as ferramentas Cloudflare. Execute npm ci e tente novamente.'); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
