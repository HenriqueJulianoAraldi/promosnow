# Ativar e validar o catálogo real

Este roteiro corresponde às migrações em `supabase/migrations/`. No projeto PromosNow desta entrega, `20260914125220_catalog.sql` e `20260914125532_api_permissions.sql` já foram aplicadas; não reaplicar manualmente. Não executar em um projeto escolhido por suposição. Confirmar que o projeto Supabase e o projeto Vercel pertencem ao repositório `HenriqueJulianoAraldi/promosnow` e conferir o esquema existente antes de aplicar.

## 1. Banco e administrador

1. Inspecionar tabelas e migrações existentes. A migração cria tabelas novas e falha caso os mesmos nomes já existam; não apagar tabelas para contornar conflitos.
2. Aplicar a migração versionada no projeto confirmado. Ela usa uma transação e não insere produtos, ofertas ou mensagens de demonstração.
3. No Supabase Auth, criar o usuário administrativo com e-mail e senha. Manter o cadastro público de novos usuários desabilitado se não for necessário. A aplicação não oferece cadastro ou recuperação de senha; a recuperação administrativa ocorre pelo Supabase.
4. Copiar o UUID desse usuário e autorizar apenas essa conta:

```sql
insert into public.admin_users (user_id)
values ('UUID_DO_USUARIO_CONFIRMADO');
```

A aplicação não permite inserir ou alterar `admin_users`. Um usuário autenticado sem esse registro não acessa o painel.

## 2. Vercel

Usar o projeto já conectado ao repositório, Next.js, raiz do projeto, Node.js 24, `npm ci` e `npm run build`. Em Preview, preferir um banco separado para que testes não modifiquem produção.

Configurar no ambiente desejado e criar um novo deployment:

| Variável | Valor/função |
| --- | --- |
| `DATA_MODE` | `supabase` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL HTTPS do projeto confirmado |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave publicável desse projeto |
| `APP_URL` | URL HTTPS canônica do site, sem caminho adicional |
| `MERCADO_LIVRE_ENABLED` | `false` até configurar e validar a API |
| `TELEGRAM_ENABLED` | `false` até configurar e validar bot/canal |

As duas variáveis `NEXT_PUBLIC_*` são públicas por desenho. Tokens e chaves secretas entram apenas nas configurações privadas, nunca em conversas ou arquivos versionados. `SUPABASE_SECRET_KEY` não é necessária para login, cadastro ou leitura do catálogo.

`VERCEL_ENV=production` prevalece sobre `APP_ENV`, impedindo a exposição de exemplos em produção. Com variáveis inválidas, a aplicação exibe preparação; falhas reais de consulta não são convertidas em ofertas fictícias.

## 3. Cadastro manual

1. Entrar em `/entrar` com o administrador autorizado.
2. Cadastrar produto e oferta em `/admin/ofertas/nova`: URL original, link de afiliado obtido no programa, preço conferido e validade de até 30 dias, em horário de Brasília.
3. Preço de referência é opcional. Só preencher com valor superior e origem/data verificáveis; sem referência não aparece percentual de desconto.
4. Revisar o rascunho e aprovar. Confirmar que aparece no catálogo e que o botão da loja leva ao destino correto.
5. Encerrar e conferir a remoção do catálogo e o HTTP 404 do redirecionamento antigo.

A aprovação exige preço e disponibilidade compatíveis. Após 24 horas sem conferência, a oferta some automaticamente das consultas, mesmo sem job. A confirmação manual renova a data da checagem; não altera valor ou disponibilidade retornados pela API. Para corrigir uma oferta publicada, encerre-a e cadastre uma nova revisão. Essa nova oferta tem outro endereço e outro registro de publicação.

## 4. Mercado Livre

A implementação faz consulta pontual de `GET /items/{MLB...}`, pelo botão do painel, com um token obtido legitimamente na conta do Mercado Livre. Não presume acesso à API pelo fato de existir uma conta de afiliado.

Configurar `MERCADO_LIVRE_ACCESS_TOKEN` e `MERCADO_LIVRE_ENABLED=true`. Cadastrar a fonte Mercado Livre e o código MLB. Consultar um anúncio e comparar preço/disponibilidade com a loja. Confirmar também erros de autorização e anúncio indisponível.

A versão atual não inclui OAuth no aplicativo, renovação de token, busca automática, agendamento ou geração automática de links de afiliado. Quando o token expirar, a consulta falha sem marcar o preço como atualizado. Um preço diferente retira a oferta aprovada do catálogo até nova revisão. Só considerar esta etapa operacional depois de uma consulta bem-sucedida com a conta real.

## 5. Telegram

Configurar `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID` (`@nome_do_canal` ou ID `-100...`), `TELEGRAM_ENABLED=true` e `APP_URL` HTTPS. O bot deve ter permissão para publicar no canal escolhido.

Começar em um canal de teste. Em `/admin/publicacoes`, conferir o destino e o texto, marcar a confirmação e enviar. Verificar a mensagem no canal e o histórico no painel. O texto não usa interpretação HTML/Markdown. Links incluem a origem Telegram e aviso de afiliado.

O banco reserva a publicação antes da chamada à API. Cada par oferta/canal pode ser solicitado uma única vez nesta versão, inclusive quando falha. HTTP ambíguo, timeout ou falha ao gravar a confirmação exigem conferência manual: o envio pode ter ocorrido. Não apagar registros para tentar novamente. Reenvio com reconciliação e agendamento ainda não estão implementados.

## 6. Métricas opcionais

Configurar `SUPABASE_SECRET_KEY` e `RATE_LIMIT_HASH_SECRET` (segredo aleatório forte) apenas no servidor. Sem elas, o redirecionamento continua funcionando e não grava cliques.

Na Vercel, o servidor usa o IP do cabeçalho da plataforma para produzir HMAC com código do link e janela de dez minutos. Grava somente a chave derivada temporária e totais diários; não grava o IP original. Requisições sem o cabeçalho esperado, HEAD e agentes reconhecidos como bots não são contadas. Fora da Vercel é necessário implementar uma origem confiável equivalente antes de contar cliques.

São acessos estimados, não pessoas únicas, conversões ou vendas. Pessoas no mesmo IP podem ser agrupadas e mudanças de janela podem contar novamente. Erros de métricas não bloqueiam o acesso à loja. O painel soma dias UTC, incluindo o dia atual e os 29 anteriores. A origem Telegram vem do parâmetro do link e não é prova de atribuição comercial.

## 7. Critérios antes de lançar

- Migração aplicada no projeto correto, com políticas conferidas no Supabase real.
- Login/logout testados no navegador; outra conta autenticada não entra no painel.
- Fluxo completo de cadastro, aprovação, detalhe, saída e encerramento validado.
- Mercado Livre com preço real conferido ou consulta desativada e curadoria manual assumida.
- Telegram testado em canal de teste, sem mensagem duplicada; confirmar canal de produção antes de enviar.
- Layout móvel, teclado, busca, filtros e mensagens de erro revisados no preview.
- Domínio, variáveis, comportamento de falha e métricas opcionais conferidos.

A indexação continua desativada em `next.config.ts`, `src/app/layout.tsx` e `src/app/robots.ts`. Alterar esses três pontos juntos após aprovação do catálogo real; manter `/admin`, `/entrar` e `/r` fora da indexação. Esta entrega não altera essa decisão por configuração implícita.

## Referências técnicas

- [Supabase SSR para Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Funções de banco no Supabase](https://supabase.com/docs/guides/database/functions)
- [Telegram sendMessage](https://core.telegram.org/bots/api#sendmessage)

Os testes com respostas simuladas não comprovam autorização nem comportamento atual da conta Mercado Livre. Essa verificação permanece na etapa de ativação real.
