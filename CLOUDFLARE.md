# Publicação na Cloudflare

Este projeto usa `output: 'export'` e gera um site estático em `out/`. O arquivo `wrangler.jsonc` permite publicar essa pasta como Workers Static Assets, sem adaptador OpenNext.

## Se o projeto foi criado em Workers (com comando de deploy)

No painel da Cloudflare, abra o Worker e suas configurações de Build. Use:

| Campo | Valor |
| --- | --- |
| Repositório | `maranhaobr/clinica-estetica-demo` |
| Branch de produção | `main` |
| Diretório raiz | raiz do repositório |
| Comando de build | `npm run build` |
| Comando de deploy | `npx wrangler deploy` |
| Comando de versões de preview, se habilitado | `npx wrangler versions upload` |
| Node.js | `22` |

Remova qualquer comando com `opennextjs-cloudflare` ou `@opennextjs/cloudflare` configurado no painel. Se uma configuração antiga do painel continuar executando OpenNext, ela também precisa ser substituída; o commit não altera os campos do painel.

O nome em `wrangler.jsonc` é `clinica-estetica-demo`. Ele deve coincidir com o nome do Worker criado na sua conta. Se o Worker tiver outro nome, ajuste o campo `name` antes do deploy.

O comando de build deve terminar antes do comando de deploy: o Wrangler publica os arquivos já gerados em `out/`. Não configure `.open-next` como diretório de ativos.

Para validar localmente sem publicar:

```sh
npm ci
npm run build
npx wrangler deploy --dry-run
```

## Se o projeto foi criado em Pages

Em Workers & Pages, selecione Pages e importe o repositório:

| Campo | Valor |
| --- | --- |
| Framework preset | `Next.js (Static HTML Export)` ou `None` |
| Comando de build | `npm run build` |
| Diretório de saída | `out` |
| Branch | `main` |
| Node.js | `22` |

Pages conectado ao Git publica o diretório de saída automaticamente. Não há necessidade de um comando de deploy nem de OpenNext. O `wrangler.jsonc` deste repositório é voltado à alternativa Workers; ele não define `pages_build_output_dir`.

## Variáveis públicas

Configure `NEXT_PUBLIC_SITE_URL` com o domínio de destino antes da build. WhatsApp e Analytics continuam opcionais, conforme o README. Nunca coloque credenciais em variáveis `NEXT_PUBLIC_*`.

## O que significa o erro registrado

As linhas `✓ Exporting (2/2)` e a tabela de rotas mostram que a build do Next.js concluiu. O erro aparece na etapa seguinte, `OpenNext — Generating bundle`, executada pela publicação. O trecho fornecido não inclui a exceção interna completa do OpenNext. Esta configuração elimina essa etapa desnecessária para o site estático.

Documentação oficial:

- https://developers.cloudflare.com/workers/static-assets/binding/
- https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/
- https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/
