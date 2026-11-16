# Deploy do painel no Cloudflare Workers

O painel tem um Worker próprio: `clinica-estetica-platform`. A landing page continua com o deploy da raiz do repositório. Execute todos os comandos deste guia em `apps/platform`.

## Preparar o ambiente

Use Node.js 22.16 ou superior, recomendado Node 22 LTS. Os scripts também aceitam o Node local de `.tools/` neste computador. Essa pasta não é enviada ao GitHub; a Cloudflare precisa ter Node 22 configurado.

```sh
npm ci
npm run build:cf
npm run check:cf
```

`build:cf` executa a build Next e adapta a saída com OpenNext. O pacote fica em `.open-next/`. `check:cf` executa somente `wrangler deploy --dry-run`: valida o empacotamento sem publicar. Pare `npm run dev` antes de compilar, pois ambos utilizam `.next`.

No computador local, as variáveis de build são carregadas de `.env.local`. Em CI, configure-as no painel da Cloudflare. Os valores nunca são impressos pelo script de validação.

## Criar o Worker pelo GitHub

Em Workers & Pages, crie um **Worker** conectado ao mesmo repositório da landing page. Configure:

| Campo | Valor |
| --- | --- |
| Nome | `clinica-estetica-platform` |
| Branch de produção | `feat/add-admin-dashboards` |
| Diretório raiz do projeto | `apps/platform` |
| Comando de build | `npm run build:cf` |
| Comando de deploy | `npm run deploy:cf` |
| NODE_VERSION (ambiente de build) | `22.16.0` ou versão Node 22 LTS posterior |

Se a interface pedir um comando para versões não produtivas, use `npm run upload:cf`. URLs públicas de preview estão desativadas na configuração, pois cada hostname de acesso precisa ser validado contra um tenant. A versão enviada não substitui a produção automaticamente.

O arquivo de configuração deve ser `apps/platform/wrangler.jsonc`. Não selecione o Wrangler da raiz, que serve a landing page estática. Não use `out` como saída do painel nem o preset de exportação estática do Pages.

## Variáveis de build e runtime

Configure os mesmos valores nas duas áreas da Cloudflare: **Build > Variables and secrets** e **Settings > Variables and Secrets** do Worker:

- `NEXT_PUBLIC_SUPABASE_URL`: URL HTTPS do projeto Supabase já configurado.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: chave pública `sb_publishable_...` do mesmo projeto.

Copie os valores do `.env.local` local ou da seção Connect do Supabase. Não copie service role, senha de banco ou tokens administrativos. Nenhuma dessas credenciais é necessária no frontend ou no runtime deste painel.

As variáveis NEXT_PUBLIC são incorporadas à build. Alterações exigem nova build e deploy. `keep_vars` está habilitado para preservar as variáveis de runtime mantidas pelo painel Cloudflare. Nenhum `.env.local` ou `.dev.vars` deve ser commitado.

## Primeiro acesso em workers.dev

O painel está publicado em https://clinica-estetica-platform.regisousa7.workers.dev. Esse hostname está verificado e associado à Lumina no Supabase. Não há wildcard de tenants nem bypass para workers.dev.

Após o deploy, copie apenas o hostname real, sem `https://`, porta ou caminho. No SQL Editor do projeto Supabase, como operador autorizado, execute substituindo o marcador:

```sql
insert into public.tenant_domains
  (tenant_id, hostname, is_primary, verification_status)
select id, 'COLE-O-HOSTNAME-REAL-AQUI', false, 'verified'
from public.tenants where slug = 'lumina';
```

Confira primeiro que a URL corresponde ao Worker da sua conta. A confirmação é administrativa; não marque como verificado um domínio que não controla. Não substitua o domínio local: isso mantém o desenvolvimento funcionando.

Em Supabase Authentication > URL Configuration:

1. Defina Site URL como a URL HTTPS pública do painel.
2. Adicione o callback exato `https://HOSTNAME-REAL/auth/callback`.
3. Mantenha os callbacks localhost se continuar usando o ambiente de desenvolvimento.

Enquanto o hostname não estiver cadastrado, o login pode autenticar, mas o painel não concederá acesso à clínica. Isso é o isolamento esperado. O usuário já convidado mantém seu vínculo com a Lumina.

## Deploy e preview pelo terminal

Para autenticar sua conta Cloudflare pelo Wrangler, execute `npm run login:cf` e conclua o login no navegador. Esse comando também seleciona o Node compatível. Depois execute:

```sh
npm run build:cf
npm run check:cf
npm run deploy:cf
```

Para testar o pacote no runtime workerd sem publicar:

```sh
npm run build:cf
npm run preview:cf
```

O preview usa uma porta própria, normalmente 8787. A aplicação continua validando o hostname: não troque as políticas de tenant por acesso irrestrito para testar. Use `npm run dev` e `lumina.localhost:3002` para o fluxo local completo de login e recuperação por e-mail.

## Depois de publicar

- Confira `/login`, login válido, `/painel`, filtros e exportação CSV.
- Sem sessão, `/painel` deve redirecionar para `/login`.
- Verifique logout e recuperação de senha no domínio HTTPS autorizado.
- Não habilite cache público para HTML autenticado. Apenas `/_next/static/*` tem cache público imutável.
- Os dados Analytics continuam explicitamente demonstrativos. Este deploy não ativa GA4.

Não foram adicionados buckets R2, banco Cloudflare, imagens pagas ou bindings de cache incremental: as páginas privadas atuais são dinâmicas. O custo e os limites de Workers dependem da sua conta. Confira o tamanho comprimido apresentado por `check:cf` contra os limites do plano antes da publicação; não é necessário contratar um plano para executar a validação local.

## Referências

- https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/
- https://opennext.js.org/cloudflare/get-started
- https://opennext.js.org/cloudflare/howtos/env-vars

## Validação desta configuração

- Next.js build e adaptação OpenNext: aprovados.
- Wrangler dry-run: aprovado; pacote 6797,54 KiB bruto / 1408,89 KiB gzip e 44 arquivos de ativos.
- Runtime local workerd: `/login` respondeu 200 com formulário e cache privado; `/painel` sem sessão respondeu 307 para login; CSS respondeu 200 com cache imutável.
- 15 testes, lint e TypeScript incluído na build: aprovados.
- Auditoria npm: zero vulnerabilidades após override restrito de glob 14.0.6 no adaptador.
- Publicação real: concluída em `https://clinica-estetica-platform.regisousa7.workers.dev`.
- Variáveis públicas Supabase configuradas em runtime e no ambiente de build; Node de build 22.16.0.
- Repositório GitHub conectado ao Worker, branch `feat/add-admin-dashboards`, raiz `apps/platform`, comandos `build:cf` e `deploy:cf`. Pushes nessa branch iniciam builds de produção; builds de preview estão desativadas.
- Hostname associado à Lumina; Site URL e callback HTTPS configurados no Supabase, mantendo os callbacks locais.
- Validação HTTPS em produção: `/login` respondeu 200 e `/painel` sem sessão respondeu 307 para `/login`, ambos com cache privado. O acesso com senha deve ser validado pelo administrador usando sua própria conta.
