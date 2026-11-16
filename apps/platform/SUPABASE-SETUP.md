# Projeto Supabase conectado

Projeto: `clinica-estetica-platform`
Referência: `bomsjfmumrjrmjytyksp`
Região: São Paulo (`sa-east-1`)
Plano informado na criação: Free, US$ 0/mês.
Painel: https://supabase.com/dashboard/project/bomsjfmumrjrmjytyksp

## Configurado e verificado

- Migration foundation aplicada no projeto remoto.
- Índice de assinatura por plano aplicado em foundation_indexes.
- Lumina e Aurora cadastradas, com domínios locais e planos Performance/Essencial.
- Todas as sete tabelas públicas com RLS e permissões explícitas.
- Isolamento de duas clínicas testado no banco real, incluindo bloqueios anônimo e de elevação global. Todos os fixtures revertidos por rollback.
- Ambiente local apps/platform/.env.local configurado somente com URL e publishable key; arquivo ignorado pelo Git.
- Build do painel com o ambiente real aprovada.

## Auth configurado no painel

- Cadastro público desativado; login por e-mail e confirmação de e-mail mantidos.
- Login anônimo desativado.
- Site URL: http://lumina.localhost:3002
- Callbacks exatos de Lumina e Aurora na porta 3002 cadastrados.
- Convite inicial enviado pelo Supabase ao endereço informado pelo responsável.
- Conta convidada associada à Lumina como owner e à administração global em platform_admins.
- E-mail ainda não confirmado na última verificação; o responsável deve abrir o convite e definir sua senha pessoalmente.

O painel Free não permite customizar templates sem SMTP próprio ou upgrade. Nenhum serviço adicional foi contratado. O aplicativo suporta os links padrão por meio de AuthEmailSession, que consome a sessão do fragmento no navegador, remove os tokens do histórico e grava cookies compatíveis com SSR. O callback também aceita PKCE/token_hash quando configurados. Não registre tokens em logs.

O fluxo real de confirmação e definição de senha aguarda a ação do responsável. Não há senha criada pelo agente nem credencial administrativa exposta no frontend.

## Avisos da auditoria

A função `public.is_verified_hostname` é intencionalmente pública e SECURITY DEFINER: retorna apenas se um hostname já está verificado e pertence a tenant ativo. Não retorna UUID, nome, membros ou métricas. Seu search_path está fixado e a query não utiliza SQL dinâmico. Supabase sinaliza sua execução pública por desenho; não é correto afirmar auditoria sem avisos.

- https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
- https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable

Não remova essa função sem adaptar o fluxo de recuperação e seus testes.
