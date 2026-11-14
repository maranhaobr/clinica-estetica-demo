# WhatsApp da demonstração

O número padrão autorizado pelo responsável é **+55 85 99133-1884** (`5585991331884`). Todos os botões de agendamento e o botão flutuante abrem esse contato no WhatsApp com uma mensagem pré-preenchida que identifica a demonstração. Nas páginas individuais, a mensagem inclui o procedimento.

O site apenas abre a conversa: o visitante decide enviar a mensagem no WhatsApp. A clínica continua fictícia, sem atendimento clínico real.

## Personalização

O padrão está em `src/lib/config.ts`. Para substituir o número, configure `NEXT_PUBLIC_WHATSAPP` no ambiente da build. O valor aceita apenas um contato brasileiro válido no formato 55 + DDD + número; caracteres de formatação são removidos.

- Variável ausente: usa o número padrão autorizado desta demonstração.
- Variável com número válido: substitui o padrão.
- Variável explicitamente vazia ou inválida: mantém o diálogo demonstrativo sem abrir contato.

O `.env.example` já contém o número da demonstração. Se a Cloudflare tiver `NEXT_PUBLIC_WHATSAPP` definido como vazio, remova essa variável ou configure `5585991331884`. Depois execute nova build e deploy: as variáveis públicas são incorporadas durante a compilação.

A construção do link é centralizada em `src/lib/whatsapp.ts`. Mensagens e acentos são codificados com `encodeURIComponent`.
