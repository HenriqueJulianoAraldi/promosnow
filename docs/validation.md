# Validação do catálogo persistente

Verificação local em 14/09/2026, Node.js 24. Reproduzir com `npm ci` e `npm run check`.

| Verificação | Resultado |
| --- | --- |
| ESLint 9.39.5 | Passou |
| TypeScript | Passou |
| Testes Node | 11 passaram |
| Migração executada no PostgreSQL PGlite | Passou |
| Build Next.js | Passou |
| HTTP preview | Passou: catálogo, painel e detalhes demonstrativos; rascunhos 404 |
| HTTP produção sem modo real | Passou: preparação, painel redirecionado, exemplos 404 |

## O que os testes cobrem

O teste de banco executa a migração em um PostgreSQL isolado, com papéis `anon`, `authenticated`, `service_role` e uma implementação local de `auth.uid()`. Verifica anonimato, administrador e usuário sem acesso; proíbe escrita direta e promoção de usuário; testa rascunho, aprovação, encerramento, preço inválido, URLs, referência, validade, disponibilidade e preço desatualizado. Verifica reserva única de publicação, token da reserva, resultado definitivo, duplicação de histórico e contagem de cliques.

Os testes dos provedores usam respostas simuladas: anúncio/currency incorretos, destinos não permitidos, falta de configuração, limite de API, confirmação por message_id e resultado incerto sem retry. O teste de texto verifica a origem Telegram e divulgação de afiliado.

## Limites

PGlite não é uma instância Supabase hospedada e usa uma simulação da identidade Auth. Ainda faltam testes de sessão/cookies, PostgREST e RLS no projeto real, além das consultas e envios com contas autorizadas. Nenhum teste local envia mensagem ao Telegram.

A revisão visual não foi concluída: o navegador disponível bloqueou localhost na entrega inicial. Conferir em preview acessível, especialmente formulários, login, navegação por teclado e celular. As verificações HTTP atuais cobrem demonstração e preparação; não comprovam o fluxo de dados reais ponta a ponta.

ESLint 10 apresentou incompatibilidade com uma regra React do `eslint-config-next`; permanece fixado em 9.39.5. O npm marca essa série como fora de suporte. Retomar a atualização quando a configuração aceitar a série 10, sem desativar regras para mascarar o problema.
