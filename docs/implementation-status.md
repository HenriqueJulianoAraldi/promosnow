# Estado da implementação — 14/09/2026

Este documento atualiza a proposta histórica em `architecture.md`.

## Implementado no código

- Demonstração preservada para desenvolvimento/preview; produção não expõe exemplos.
- Supabase SSR, renovação de cookies, verificação de usuário e lista de administradores.
- Migração PostgreSQL com RLS e funções de escrita que verificam o administrador. Leitura pública expõe somente ofertas elegíveis.
- Cadastro conjunto de produto e oferta, edição de rascunho, aprovação, encerramento e confirmação manual de preço.
- Preço de referência opcional com justificativa; somente descontos válidos são exibidos.
- Consulta manual da API Mercado Livre pelo código MLB, histórico de preço e retirada de ofertas cujo preço mudou.
- Prévia do Telegram, confirmação no painel, reserva atômica, gravação de resultado e bloqueio de solicitações duplicadas.
- Redirecionamento de afiliado com validação de destino e contagem agregada opcional; não gera links de afiliado.
- Testes PostgreSQL local de permissões/regras e testes dos provedores com respostas simuladas.

## Validado nas contas reais

Projeto Supabase `promosnow`: migrações `20260914125220_catalog.sql` e `20260914125532_api_permissions.sql` aplicadas. API pública retorna catálogo vazio; tabelas privadas e escrita anônima retornam HTTP 401. Não foram inseridos produtos ou ofertas fictícias no banco.

As funções privilegiadas ficam no esquema privado, com interfaces públicas `SECURITY INVOKER` e permissões explícitas. Advisors não apresentam avisos de segurança; o registro informativo de RLS sem política em `private.click_buckets` é intencional, pois essa tabela não permite acesso direto.

Vercel: projeto correto, Node.js 24 e preview da branch com status Ready. Produção ainda usa a base da PR #1. O preview está em modo demonstração; falta `DATA_MODE=supabase`, URL canônica e conferência das variáveis no ambiente correto. O plugin de leitura da Vercel não expõe alteração de variáveis; a CLI deste ambiente não possui sessão autenticada.

Supabase Auth ainda não contém usuários. Criar a conta administrativa no dashboard e depois autorizar seu UUID. Nenhuma mensagem foi enviada pelo agente. Mercado Livre e Telegram ainda exigem validação real.

## Limites funcionais

Catálogo: 100 registros recentes; painel: 200; histórico do Telegram: 100. Busca e filtros atuam sobre os registros carregados. Edição direta por UUID consulta qualquer rascunho, mesmo fora dos 200 recentes.

Não há OAuth/renovação de token do Mercado Livre, coleta automática, agendamento de publicação, geração automática de links, recuperação de senha no aplicativo ou reenvio/reconciliação de publicação. A consulta exige token válido configurado. Telegram admite uma solicitação por oferta/canal; resultado incerto requer conferência manual, sem nova chamada automática.

Métricas dependem da chave secreta, segredo de HMAC e cabeçalho confiável da Vercel. São estimativas, não conversões. A regra de atualização é fixa em 24 horas no banco. Não há variável de ambiente que altere esse prazo nesta versão.

## Lançamento

`noindex` permanece ativo. Testes locais não substituem autenticação, RLS, API, envio e revisão visual nas contas reais. Seguir [o roteiro de ativação](activation.md) e [os resultados da validação](validation.md).
