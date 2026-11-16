# Plataforma SaaS — etapa 1

Aplicação Next.js com servidor em `apps/platform`. O site institucional da raiz continua estático e tem build/deploy independentes. Não altere o `wrangler.jsonc` da raiz para hospedar este painel.

## Plano de implementação

1. Fundação: banco, autenticação, domínios, associação de usuários e RLS — implementada nesta entrega, com integração externa pendente.
2. Dashboard: layout Tailwind/shadcn, indicadores, Recharts, filtros e mock de 90 dias — implementado e validado por testes/build.
3. Recomendações, suporte, configurações, módulos e administração global.
4. Providers mock/GA4, sincronização e tratamento de falhas.
5. Validação integrada, segurança e documentação de produção.

As etapas 1 e 2 incluem a fundação e o dashboard demonstrativo. Administração por interface, eventos GA4, cobrança, CRM e agenda não fazem parte desta entrega. Não há dados fictícios apresentados como reais. O acesso privado exige autenticação verdadeira: sem Supabase, o login informa a configuração ausente e não concede acesso demonstrativo.

## Instalação

Com Node.js 22, a partir da raiz:

```sh
cd apps/platform
npm ci
```

Copie `.env.example` desta pasta para `.env.local` e configure a URL do projeto Supabase e a publishable key pública. Nenhuma service role é necessária para o runtime. Não coloque segredos em variáveis NEXT_PUBLIC.

```sh
npm run dev
```

Use `http://lumina.localhost:3002/login` ou `http://aurora.localhost:3002/login`. Se o sistema não resolver esses nomes, adicione ambos para 127.0.0.1 no arquivo hosts. A porta não faz parte do hostname salvo no banco. Nenhum parâmetro de URL ou x-forwarded-host seleciona a clínica.

## Banco Supabase

Crie um projeto Supabase sob sua conta. Em Authentication, desative novos cadastros públicos e configure limites de login/recuperação e SMTP antes do uso real. No SQL Editor, execute, na ordem:

1. `supabase/migrations/202611150001_foundation.sql`, a partir da raiz do repositório.
2. `supabase/seed.sql`, somente no ambiente de desenvolvimento.

Alternativamente, com Supabase CLI instalado: inicialize a configuração local com `supabase init`, vincule o projeto correto com `supabase link` e aplique `supabase db push`. Revise o alvo antes de aplicar migrations. Não execute `supabase/tests/bootstrap.sql` em Supabase: é um harness exclusivo para bancos de teste descartáveis.

A migration contém tenants, domínios, profiles, membros, planos, assinaturas e administradores globais. Entidades de Analytics e recomendações entram nas etapas seguintes. O plano usa `code` como chave natural, referenciada em `plan_code` na assinatura. Não há faturamento.

## Criar usuários e associações

Crie ou convide um usuário através do painel **Authentication > Users** do Supabase. O trigger cria seu profile. Para o fluxo de convite, configure um redirect permitido para `/auth/callback`; o usuário define a senha na página `/nova-senha`.

No SQL Editor, como operador autorizado, associe o UUID real desse usuário a uma clínica:

```sql
insert into public.tenant_members(tenant_id,user_id,role)
values ('11111111-1111-4111-8111-111111111111', '<UUID_DO_USUARIO>', 'owner');
```

Para testar isolamento, crie outro usuário e associe apenas a Aurora (`22222222-2222-4222-8222-222222222222`). Um usuário pode ser membro de várias clínicas, mas cada requisição do painel usa somente a clínica do domínio validado. Os testes tentam acesso entre membros de clínicas distintas.

Criação de tenants, verificação de domínios, concessão de papéis e assinaturas são operações controladas no banco nesta etapa. Usuários autenticados não recebem permissão de escrita nessas tabelas. Um owner/admin de clínica não pode se tornar administrador global. A tabela `platform_admins` só pode ser alterada pelo operador privilegiado; `requireGlobalAdmin()` valida essa permissão no servidor, independentemente de associação a clínicas. A interface administrativa será entregue na etapa 3.

## Login, logout e recuperação

Login usa Supabase Auth com e-mail e senha e sessão persistida em cookies por @supabase/ssr. O middleware renova a sessão; as páginas privadas validam o usuário novamente no servidor. Logout encerra a sessão. Links PKCE de recuperação/convite passam por `/auth/callback` e levam a `/nova-senha`. Uma atualização de senha bem-sucedida encerra a sessão e exige login novamente.

Em Authentication > URL Configuration, cadastre explicitamente para cada domínio permitido:

- `http://lumina.localhost:3002/auth/callback`
- `http://aurora.localhost:3002/auth/callback`
- os equivalentes HTTPS em produção.

A origem de recuperação é construída apenas após validar o Host contra um domínio ativo/verificado no banco. A RPC pública `is_verified_hostname` retorna somente um booleano, sem dados de clientes. A mensagem de recuperação não confirma se um e-mail existe. Taxas de requisição, SMTP e entrega dos links dependem do Supabase. Valide recuperação e convite ponta a ponta antes de liberar usuários reais.

## Domínios e deploy

O painel requer um runtime Next.js com servidor. `next start` após `npm run build` atende em Node; um deploy Cloudflare deste painel exige seu próprio projeto e adaptação SSR, a ser validada antes de produção. O site institucional continua usando Workers Static Assets/Pages.

Para domínio personalizado: valide a propriedade com desafio DNS controlado pelo operador, configure CNAME/roteamento para a aplicação, aguarde certificado TLS válido e só depois marque `tenant_domains.verification_status='verified'`. O código não verifica DNS automaticamente. A infraestrutura deve preservar o Host original verificado e não reescrevê-lo com valores arbitrários enviados pelo cliente. Registre cada domínio no Supabase Auth como redirect permitido. Desative cache público/CDN nas respostas autenticadas e preserve todos os Set-Cookie. Cada clínica pode ter vários domínios, apenas um primário.

## Testes

```sh
npm test
npm run lint
npm run typecheck
npm run build
```

Os testes TypeScript cobrem validação de hostname, credenciais, autorização, clínica inativa e permissões por plano. O teste PostgreSQL usa PGlite em memória, aplica a migration e o seed e tenta ler dados de outra clínica, modificar membros e elevar privilégios. O harness simula o contrato `auth.users`/`auth.uid()` e os papéis anon/authenticated. Isso valida SQL/RLS real, mas não substitui um teste integrado com a API Auth e o PostgREST do Supabase.

## Estado da validação

- 8 testes locais aprovados, incluindo migration e isolamento SQL/RLS.
- Lint, TypeScript e build do painel executados nesta entrega; resultados finais informados na conversa.
- Build do site institucional verificada separadamente.
- Login, renovação, logout, convite, recuperação e RLS via PostgREST reais dependem de instância Supabase configurada; não validados contra serviço externo nesta entrega.
- Sem credenciais administrativas, usuários ou senhas fictícias de produção.

### Templates de e-mail para SSR

Para convite e recuperação abertos sem o navegador que iniciou o PKCE, configure os templates do Supabase com token hash, mantendo o hostname aprovado:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=invite">Definir senha</a>
```

No template de recuperação, use `type=recovery`. Ambos os RedirectTo devem apontar para o `/auth/callback` autorizado. A rota valida apenas os tipos invite/recovery, troca o token no servidor e remove o token da URL ao redirecionar. Nunca registre URLs de callback ou tokens em logs. Os tokens são validados pelo Supabase, não pelo frontend.


## Ambiente remoto configurado

O projeto Supabase remoto e os ajustes Auth desta entrega estão registrados em SUPABASE-SETUP.md. O aplicativo também aceita os links padrão gratuitos de convite/recuperação: a sessão no fragmento é consumida pelo componente AuthEmailSession e os tokens são removidos da URL antes de estabelecer a sessão. Customização de template é opcional quando houver SMTP próprio ou plano compatível.

## Etapa 2 — Dashboard demonstrativo

A rota `/painel` agora exige a funcionalidade Analytics do plano autenticado no servidor antes de construir o relatório. O tenant vem exclusivamente do contexto autenticado/domínio; não é aceito como parâmetro do cliente.

- Quatro indicadores: sessões, visitantes únicos simulados, cliques WhatsApp e cliques agendar.
- Taxa WhatsApp: cliques divididos por sessões, com proteção para zero. Cliques não são clientes ou agendamentos confirmados.
- MockAnalyticsProvider gera 90 dias determinísticos por tenant e data. Nada é gravado no banco nem apresentado como Analytics real.
- Filtros de 7/30/90 dias atualizam os totais, ambos os gráficos, ranking, tabela diária e CSV.
- Visitantes são deduplicados por identificadores sintéticos no intervalo. Não se somam usuários ativos diários para alegar visitantes únicos.
- Comparação de mesma duração disponível para 7/30 dias. Em 90 dias não existe histórico anterior completo; a interface informa a ausência, sem inventar percentuais.
- Gráficos Recharts com navegação acessível e tabela alternativa. Componentes de botão no padrão shadcn/Radix, Tailwind 4 e Lucide.
- Menu do usuário com logout; navegação para seções existentes. Módulos da etapa 3 ainda não são exibidos.
- Nome e cores carregados do tenant autenticado. Os dados usados no cliente são agregados, sem os IDs sintéticos de visitantes.

A integração real GA4 permanece para a etapa 4. O mock segue a interface AnalyticsProvider para permitir essa substituição futura. Ao executar localmente, mantenha apenas um servidor usando a pasta `.next` e pare o servidor antes de gerar uma build nessa mesma pasta.

Validação da etapa 2: 15 testes, lint e build de produção aprovados. Revisão visual e testes de interação no navegador ficaram pendentes porque o navegador integrado recusou a conexão local. A prévia de produção foi iniciada na porta 3002.

## Compatibilidade do ambiente local

O painel requer Node.js 22.16 ou superior, incluindo o Supabase SDK instalado. Os scripts `npm run dev` e `npm run build` verificam a versão. Neste workspace, se o terminal estiver no Node 20, eles usam automaticamente `.tools/node.exe` na raiz, quando disponível e compatível. Nenhuma configuração global do Windows é alterada. Em outro computador ou deploy, instale Node 22.16+ antes de executar `npm ci`.

Tailwind CSS e o plugin PostCSS estão fixados em 4.1.18 para evitar o carregamento CommonJS/ESM incompatível observado no modo dev com Tailwind 4.3. Não edite arquivos de node_modules manualmente. Após atualizar dependências, encerre o servidor anterior e inicie `npm run dev` novamente.
