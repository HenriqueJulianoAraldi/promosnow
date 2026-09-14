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

## Pendente nas contas reais

Aplicar a migração ao projeto confirmado, autorizar o administrador, configurar o modo real na Vercel e validar os fluxos no preview. Nenhuma migração externa foi aplicada nesta entrega e nenhuma mensagem foi enviada pelo agente.

## Limites funcionais

Catálogo: 100 registros recentes; painel: 200; histórico do Telegram: 100. Busca e filtros atuam sobre os registros carregados. Edição direta por UUID consulta qualquer rascunho, mesmo fora dos 200 recentes.

Não há OAuth/renovação de token do Mercado Livre, coleta automática, agendamento de publicação, geração automática de links, recuperação de senha no aplicativo ou reenvio/reconciliação de publicação. A consulta exige token válido configurado. Telegram admite uma solicitação por oferta/canal; resultado incerto requer conferência manual, sem nova chamada automática.

Métricas dependem da chave secreta, segredo de HMAC e cabeçalho confiável da Vercel. São estimativas, não conversões. A regra de atualização é fixa em 24 horas no banco. Não há variável de ambiente que altere esse prazo nesta versão.

## Lançamento

`noindex` permanece ativo. Testes locais não substituem autenticação, RLS, API, envio e revisão visual nas contas reais. Seguir [o roteiro de ativação](activation.md) e [os resultados da validação](validation.md).
