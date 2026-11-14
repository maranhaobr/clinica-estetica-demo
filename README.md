# Lumina Estética Avançada

Site institucional demonstrativo em Next.js App Router, React, TypeScript, Tailwind CSS 4 e Lucide React. Sem backend, banco de dados ou serviços pagos. Exportação estática com nove páginas principais (início, catálogo, seis detalhes e contato), página 404, sitemap e robots.

## Executar

Requisitos: Node.js 22 e npm.

```sh
npm install
npm run dev
```

Abra http://localhost:3000. Validações:

```sh
npm run lint
npm run typecheck
npm run build
```

A build gera `out/`. Para visualizar a exportação, execute `npm run preview` e abra http://localhost:3000. O servidor incluído serve apenas para prévia local. `next start` não atende uma exportação estática.

Neste ambiente foi necessário baixar Node e npm para `.tools/` (ignorados no Git). Alternativa no PowerShell:

```powershell
$env:PATH = "$pwd\.tools;$env:PATH"
.\.tools\node.exe .tools/package/bin/npm-cli.js run dev
```

## Personalização

Edite `src/lib/config.ts`: identidade, logotipo textual, slogan, cores, contatos, redes, horários e procedimentos. As cores são aplicadas como variáveis CSS pelo layout. O layout está em `src/app/globals.css`; componentes compartilhados estão em `src/components/ui.tsx`. Fotografias são locais em `public/images/`.

Copie `.env.example` para `.env.local`. Configure `NEXT_PUBLIC_SITE_URL` com o domínio definitivo, sem barra final, e gere nova build. Variáveis públicas são incorporadas durante a build.

## WhatsApp

Defina `NEXT_PUBLIC_WHATSAPP` com código do Brasil, DDD e número, somente dígitos. O formato aceito é `55` seguido de 10 ou 11 dígitos. Sem número configurado, o botão abre um diálogo demonstrativo; não envia mensagens a terceiros. Com número configurado, abre WhatsApp com mensagem preenchida e nome do procedimento quando aplicável. Verifique a titularidade do número antes de publicar. Telefone e Instagram estão vazios para evitar encaminhamento a terceiros; o endereço e os horários são explicitamente ilustrativos.

## Analytics e privacidade

`src/lib/analytics.ts` expõe `track()` com eventos tipados: `click_whatsapp`, `click_agendar`, `view_procedimento`, `click_instagram`, `click_telefone`. Eventos locais são emitidos como `lumina:analytics` no `window`, sem transmissão. O evento de telefone está preparado para uso quando existir um telefone real.

Nenhum script de Google Analytics é carregado. Para ativar GA4 em um site real: configure `NEXT_PUBLIC_GA_ID`, implemente política de privacidade e gerenciamento de consentimento adequados e carregue o script oficial somente após consentimento. Apenas após a escolha afirmativa registre `lumina-analytics-consent=granted` no localStorage e inicialize `window.gtag`. A função de rastreamento só encaminha eventos quando essas condições são cumpridas. A variável de ambiente sozinha não ativa coleta. Inclua mecanismo de revogação de consentimento antes de habilitar a integração.

## Publicar na Cloudflare Pages

Conecte o repositório, selecione preset Next.js Static HTML Export (ou nenhum preset), comando `npm run build`, diretório de saída `out` e Node.js 22. Configure variáveis públicas no painel e execute nova build. Não é necessário adaptador de Workers. Também é possível publicar `out` diretamente com upload de ativos estáticos.

A demonstração tem `noindex,nofollow` nos metadados e `Disallow: /` em robots.txt. Após aprovação de um site real, revise ambos explicitamente, ajuste o domínio, metadados e o sitemap. Robots não é controle de acesso nem garantia de remoção de páginas já indexadas. Não há dados estruturados de negócio fictício.

## Conteúdo e fotografias

A Lumina é fictícia. Serviços, horários e filosofia são conteúdo demonstrativo. Não há profissionais identificados, certificações, depoimentos ou promessas de resultados. Fotografias ilustrativas não retratam instalações, clientes ou equipe da Lumina.

A imagem principal `public/images/hero-lumina.webp` é sintética, criada com a ferramenta integrada ImageGen. O prompt completo está em `public/images/SOURCES.md`. As demais fotografias foram obtidas no Unsplash (licença: https://unsplash.com/license). Os identificadores e fontes estão em `public/images/SOURCES.md`. Antes de adaptar o projeto para uma marca real, revise a adequação das imagens e eventuais direitos de personalidade, marcas e propriedade. Fontes Cormorant Garamond e DM Sans são carregadas pelo Google Fonts; o site usa fallbacks locais se indisponíveis. Para hospedagem sem requisições externas, hospede os arquivos de fontes localmente.

## Acessibilidade e desempenho

Menu com estado expandido e Escape, diálogos nativos com foco modal e Escape, galeria com navegação anterior/próxima, accordions nativos, link de pular conteúdo, foco visível e respeito a movimento reduzido. Imagem principal prioritária; outras imagens com carregamento adiado, espaços reservados e tamanhos responsivos. Exportação não depende do otimizador de imagens do servidor Next.js.



## Validação desta entrega

- Lint: aprovado, sem avisos.
- TypeScript: aprovado.
- Build de produção e exportação estática: aprovadas.
- HTTP: início, contato, catálogo, seis detalhes, robots, sitemap e imagem principal retornaram 200 em 127.0.0.1.
- Auditoria npm: zero vulnerabilidades após atualização e overrides das dependências PostCSS e minimatch utilizadas pelas ferramentas.
- Revisão visual e testes de interação no navegador: pendentes, pois o host de navegador integrado estava indisponível neste ambiente. Revise desktop e mobile antes da apresentação comercial.
