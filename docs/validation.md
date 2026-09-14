# Validação da base inicial

Verificação local em 13/09/2026, Node.js 24.19.0.

| Verificação | Resultado |
| --- | --- |
| ESLint | Passou com a versão 9.39.5 |
| TypeScript | Passou sem erros |
| Testes do domínio/configuração/adaptadores | 7 testes passaram |
| Build Next.js | Passou |
| HTTP em preview | Passou: catálogo, painel, detalhes, erro 404 e bloqueio de rascunhos |
| HTTP em produção | Passou: página de preparação, painel redirecionado e exemplos inacessíveis |

Reproduzir com `npm run check`. `npm run test:http` precisa do build e usa as portas 3101 e 3102.

## Limitações

A revisão visual e as interações no navegador não foram concluídas: o navegador disponível bloqueou o endereço localhost deste ambiente. A responsividade foi implementada em CSS, mas ainda deve ser conferida em um preview acessível, especialmente busca/filtros, navegação por teclado e layout no celular. Testes HTTP não substituem essa verificação.

ESLint 10 apresentou incompatibilidade com uma regra React utilizada pelo `eslint-config-next`; o projeto fixa 9.39.5, que passa no lint. O registro npm marca a série 9 como fora de suporte. Trata-se de ferramenta de desenvolvimento: a atualização deve ser retomada quando a configuração React/Next aceitar a série 10, sem desativar as regras para mascarar o erro.

Nenhum teste acessou Supabase, Mercado Livre ou Telegram. Não há credenciais reais configuradas. As integrações e suas políticas de acesso ainda não foram implementadas.
