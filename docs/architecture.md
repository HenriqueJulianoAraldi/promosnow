# PromosNow — arquitetura inicial

Data: 13/09/2026. Estado: proposta técnica para revisão, sem implementação ou migrações aplicadas.

## 1. Pedido recuperado e diagnóstico

A primeira entrega solicitada ao Claude era inspecionar o projeto e apresentar arquitetura, estrutura de arquivos, esquema do banco, configurações e contratos para integrações futuras. O pedido previa apresentar essa proposta antes de iniciar a implementação. O contexto recuperado contém um resumo detalhado do prompt; não foi possível recuperar sua transcrição integral.

Repositório verificado: [HenriqueJulianoAraldi/promosnow](https://github.com/HenriqueJulianoAraldi/promosnow). Na consulta de 13/09/2026, o GitHub informou tamanho zero, branch padrão declarada `main` e nenhuma branch existente. Portanto, não há código ou instruções de projeto em uma branch para aproveitar ou revisar. Nenhum arquivo do repositório foi alterado.

Decisões já estabelecidas: site de promoções, hospedagem na Vercel, Supabase para dados e autenticação, Mercado Livre como primeira fonte e Telegram como canal de distribuição. O desenvolvimento ficará a cargo do ChatGPT.

## 2. Objetivo e sequência de entrega

O visitante encontra ofertas, filtra por categoria e acessa a loja. O administrador cadastra produtos, revisa preços, aprova ofertas e acompanha publicações e cliques.

Para começar sem depender de permissões de terceiros, a primeira implementação funcional deve permitir cadastro manual de produtos, preços e links de afiliado obtidos pelo administrador. A coleta de preços e a publicação automática entram depois, conectadas aos mesmos serviços internos.

| Etapa | Resultado verificável |
| --- | --- |
| Atual: arquitetura | Este documento, modelo de dados, contratos, configurações e critérios de validação |
| Base funcional | Next.js, catálogo com dados de demonstração claramente identificados, painel estrutural, validação de configuração e contratos sem chamadas externas |
| Supabase | Migrações e políticas testadas, login administrativo e cadastro manual persistente |
| Mercado Livre | Somente recursos comprovadamente disponíveis para a aplicação autorizada; atualização de preços com limites e rastreabilidade |
| Telegram | Prévia, aprovação e envio solicitado pelo administrador; depois processamento agendado |
| Operação | Redirecionamentos rastreáveis, métricas agregadas, expiração e monitoramento de falhas |

Não criar nesta etapa um motor de IA, aplicação móvel, arquitetura de microsserviços ou infraestrutura adicional de filas. Também não pressupor acesso a uma API de afiliados do Mercado Livre.

## 3. Arquitetura proposta

Uma aplicação Next.js com TypeScript. Rotas, renderização e operações de servidor permanecem no mesmo projeto, com separação por responsabilidade. O App Router permite organizar rotas por grupos sem transformar seus nomes em segmentos públicos. [Documentação do Next.js](https://nextjs.org/docs/app/getting-started/project-structure).

| Camada | Responsabilidade | Não deve fazer |
| --- | --- | --- |
| Interface pública | Listar e apresentar ofertas, filtros e estados vazios | Consultar diretamente Mercado Livre ou Telegram |
| Interface administrativa | Formulários, revisão, prévias e mensagens de resultado | Decidir autorização apenas escondendo botões |
| Entradas do servidor | Validar sessão, autorização, dados e limites das requisições | Concentrar todas as regras comerciais |
| Serviços de aplicação | Cadastrar produto, registrar preço, aprovar oferta e preparar publicação | Depender de componentes React |
| Domínio | Regras de preço, elegibilidade, expiração e estados | Ler variáveis de ambiente ou executar HTTP |
| Repositórios de dados | Consultas e transações no Supabase | Determinar apresentação da interface |
| Adaptadores externos | Traduzir dados de cada provedor para contratos internos | Expor credenciais ao navegador |
| Jobs | Processar lotes pequenos e recuperáveis | Presumir processo permanente em memória |

Fluxos principais:

1. Cadastro: painel → autorização no servidor → serviço → banco.
2. Catálogo: página pública → consulta de ofertas elegíveis → dados públicos selecionados → renderização.
3. Atualização futura: job → provedor de produto → validação → transação de preço e histórico.
4. Divulgação futura: oferta aprovada → registro de publicação → prévia/revisão → adaptador Telegram → resultado persistido.
5. Clique: código interno → validar oferta e destino → registrar contador → redirecionar. Nunca aceitar um destino arbitrário na query string.

## 4. Estrutura de arquivos planejada

Os caminhos abaixo são uma proposta; ainda não existem no GitHub. Criar os módulos à medida que forem implementados, evitando diretórios vazios sem uso.

| Caminho | Conteúdo |
| --- | --- |
| `src/app/(public)/page.tsx` | Página inicial de ofertas |
| `src/app/(public)/ofertas/[slug]/page.tsx` | Detalhe de uma oferta |
| `src/app/(auth)/entrar/page.tsx` | Login do administrador |
| `src/app/admin/layout.tsx` | Layout do painel com verificação de sessão |
| `src/app/admin/produtos/page.tsx` | Gestão de produtos |
| `src/app/admin/ofertas/page.tsx` | Gestão de ofertas |
| `src/app/admin/publicacoes/page.tsx` | Prévia e situação das publicações |
| `src/app/r/[code]/route.ts` | Redirecionamento controlado |
| `src/app/api/jobs/process/route.ts` | Entrada autenticada para processamento futuro |
| `src/components/ui/` | Componentes visuais compartilhados |
| `src/features/catalog/` | Componentes e consultas do catálogo |
| `src/features/admin/` | Formulários e ações administrativas |
| `src/domain/` | Tipos, estados e funções puras |
| `src/server/services/` | Casos de uso e coordenação das operações |
| `src/server/repositories/` | Acesso ao banco |
| `src/server/integrations/contracts.ts` | Interfaces dos provedores |
| `src/server/integrations/manual/` | Fonte manual inicial |
| `src/server/integrations/mercado-livre/` | Adaptador futuro, após validar acesso |
| `src/server/integrations/telegram/` | Adaptador futuro de publicação |
| `src/server/jobs/` | Processamento por lotes e retomada |
| `src/server/auth/` | Sessão e autorização administrativa |
| `src/server/env.ts` | Leitura e validação das variáveis do servidor |
| `src/server/supabase/` | Clientes com sessão e cliente privilegiado isolado |
| `src/server/observability/` | Logs estruturados com remoção de segredos |
| `supabase/migrations/` | Migrações versionadas, incluindo permissões |
| `supabase/tests/` | Testes de acesso e integridade |
| `tests/` | Testes das regras e fluxos críticos |
| `docs/architecture.md` | Arquitetura e decisões |
| `.env.example` | Configurações sem valores reais |
| `README.md` | Como instalar, executar, testar e configurar |

Dependências previstas: Next.js, React, TypeScript e ferramentas de lint; cliente Supabase e suporte SSR quando entrar autenticação; biblioteca de validação se reduzir duplicação real. Fixar versões e gerar lockfile na implementação. Usar CSS da aplicação inicialmente; não adicionar ORM, SDK de Telegram, Redis ou biblioteca visual sem necessidade concreta.

## 5. Modelo de dados proposto

Convenções: identificadores UUID; instantes em `timestamptz` com apresentação no fuso configurado; valores monetários inteiros em centavos (`bigint`) e moeda `BRL`. Na fronteira JSON, converter apenas inteiros dentro de limites seguros. `created_at` tem padrão `now()`. `updated_at` deve ser mantido por trigger. Campos são obrigatórios, salvo indicação `?`. Exclusões de dados históricos são restritas; produtos, ofertas e links são arquivados ou desativados.

O modelo inicial usa sete tabelas comerciais e uma tabela pequena para autorização. Configurações e logs operacionais não precisam de tabelas genéricas no MVP.

### categories

Campos: `id uuid PK`, `name text`, `slug text`, `active boolean default true`, `created_at timestamptz`, `updated_at timestamptz`.

Constraints: `UNIQUE(slug)`; nome e slug não vazios. Categoria é organização interna; não confundir com identificador da categoria do marketplace. Uma categoria possui muitos produtos; produto pertence a no máximo uma categoria neste início.

### products

Campos: `id uuid PK`, `provider text`, `external_id text?`, `title text`, `canonical_url text`, `image_url text?`, `category_id uuid? FK categories`, `currency text default 'BRL'`, `current_price_cents bigint?`, `availability text default 'unknown'`, `last_checked_at timestamptz?`, `archived_at timestamptz?`, `created_at timestamptz`, `updated_at timestamptz`.

Constraints: `provider IN ('manual','mercado_livre')`; preço positivo quando presente; moeda BRL; disponibilidade `unknown`, `available` ou `unavailable`; identificador externo obrigatório quando o provedor for Mercado Livre. `UNIQUE(provider, external_id)` deduplica anúncios identificados; índice único parcial em `canonical_url` para produtos manuais. Indexar `category_id` e `last_checked_at` nos produtos não arquivados. Normalizar URL no serviço sem eliminar parâmetros necessários à identidade da variante.

Um produto corresponde a um anúncio/variante comprável, não a todos os anúncios de um mesmo modelo. A integração deverá preservar vendedor e variante na identidade externa quando necessário. Preço ausente significa desconhecido, nunca zero.

### price_history

Campos: `id uuid PK`, `product_id uuid FK products ON DELETE RESTRICT`, `price_cents bigint`, `currency text default 'BRL'`, `observed_at timestamptz`, `source text`, `observation_key text`, `created_at timestamptz`.

Constraints: preço positivo; moeda BRL; `source IN ('manual','mercado_livre')`; `UNIQUE(product_id, observation_key)`. Índice `(product_id, observed_at DESC)`. A chave identifica uma coleta lógica e permanece igual nos retries. O job registra mudanças de preço; observações sem mudança atualizam apenas `last_checked_at`. A gravação do histórico e do preço atual ocorre em uma transação, recusando a substituição do preço atual por uma observação mais antiga. Não usar apenas o valor do preço como chave, pois um preço pode voltar a ocorrer.

### offers

Campos: `id uuid PK`, `product_id uuid FK products ON DELETE RESTRICT`, `slug text`, `title text`, `description text?`, `price_cents bigint`, `reference_price_cents bigint?`, `reference_basis text?`, `reference_observed_at timestamptz?`, `status text default 'draft'`, `starts_at timestamptz?`, `expires_at timestamptz?`, `approved_by uuid? FK auth.users`, `approved_at timestamptz?`, `created_at timestamptz`, `updated_at timestamptz`.

Constraints: `UNIQUE(slug)`; preço positivo; referência, quando presente, maior que o preço ofertado; referência exige origem e data; `status IN ('draft','approved','published','expired','archived')`; fim posterior ao início quando ambos definidos; aprovação obrigatória para estados `approved` e `published`. Índices `(status, starts_at, expires_at)` e `(product_id, created_at DESC)`. Índice único parcial em `product_id WHERE status IN ('approved','published')` evita ofertas concorrentes aprovadas do mesmo anúncio. Encerrar a anterior e aprovar a nova na mesma transação.

Porcentagem de desconto é calculada; não manter outra coluna com o mesmo resultado. A referência deve indicar se veio de uma observação anterior ou preço informado pelo vendedor. Não anunciar “menor preço” sem dados que sustentem a comparação. Oferta publicada conserva seu preço; uma atualização conflitante deixa de torná-la elegível até revisão.

### affiliate_links

Campos: `id uuid PK`, `offer_id uuid FK offers ON DELETE RESTRICT`, `code text`, `destination_url text`, `origin text default 'manual'`, `active boolean default true`, `created_at timestamptz`, `updated_at timestamptz`.

Constraints: `UNIQUE(code)`; `origin IN ('manual','verified_provider')`; índice único parcial em `offer_id WHERE active`. Indexar `offer_id`. Validar HTTPS, host permitido e ausência de credenciais na URL no servidor. Links encurtados devem ser aceitos apenas quando seu domínio for explicitamente permitido. Não buscar uma URL arbitrária para tentar expandi-la.

O código é rastreamento interno; não cria vínculo de afiliado ou direito a comissão. Preservar parâmetros do link autorizado. Rejeitar mudanças de destino em links que já possuem publicações, criando novo registro para manter o histórico. O link antigo pode ser desativado.

### telegram_publications

Campos: `id uuid PK`, `affiliate_link_id uuid FK affiliate_links ON DELETE RESTRICT`, `channel_id text`, `revision integer default 1`, `message_text text`, `status text default 'pending'`, `scheduled_at timestamptz`, `attempts integer default 0`, `next_attempt_at timestamptz?`, `lease_token uuid?`, `lease_until timestamptz?`, `telegram_message_id bigint?`, `sent_at timestamptz?`, `last_error_code text?`, `created_at timestamptz`, `updated_at timestamptz`.

Constraints: `UNIQUE(affiliate_link_id, channel_id, revision)`; revisão positiva e tentativas não negativas; estados `pending`, `processing`, `sent`, `failed`, `unknown`, `cancelled`; `sent` exige identificador da mensagem e data. Índice parcial por `(next_attempt_at, scheduled_at)` para pendentes/falhas elegíveis. Indexar `affiliate_link_id`. A oferta é obtida pelo link, evitando duas referências que poderiam discordar.

O texto aprovado fica congelado no registro. A transação de reivindicação deve bloquear a linha e atribuir um lease; a conclusão só pode ser feita pelo worker que ainda possui esse lease. Limitar tamanho do lote e tentativas.

Não prometer entrega “exatamente uma vez”: timeout após o envio pode significar mensagem entregue sem confirmação. Esse caso e um processo interrompido durante envio ficam `unknown` e pedem revisão antes de novo envio. A Bot API documenta os parâmetros e o retorno de `sendMessage`; o contrato interno não presumirá uma chave externa de idempotência. [Telegram Bot API](https://core.telegram.org/bots/api#sendmessage).

### click_daily_counts

Campos: `affiliate_link_id uuid FK affiliate_links ON DELETE RESTRICT`, `day date`, `source text`, `click_count bigint default 0`, `updated_at timestamptz`.

Chave primária composta `(affiliate_link_id, day, source)`; contador não negativo; origem `site`, `telegram` ou `unknown`. Índice `(day, affiliate_link_id)` para relatórios. Incremento atômico no banco, nunca ler-somar-gravar em chamadas separadas. `day` usa UTC para consistência.

São acessos estimados, não pessoas únicas ou vendas confirmadas. Prévias de links e robôs podem inflar a contagem; ignorar requisições HEAD e filtrar agentes conhecidos quando possível. Não gravar IP bruto, fingerprint ou histórico individual. Se a gravação falhar, o redirecionamento continua; a métrica aceita perdas.

### admin_users

Campos: `user_id uuid PK FK auth.users ON DELETE CASCADE`, `created_at timestamptz`. Apenas usuários incluídos por operação administrativa confiável têm acesso ao painel. Login bem-sucedido sozinho não concede administração. Não há cadastro público de administradores nem edição dessa tabela pela própria aplicação.

### Configurações e logs sem tabelas adicionais

Configurações tipadas no servidor: nome do site, fuso, validade da checagem, tamanho de lote e flags de integrações. Credenciais ficam nas variáveis do ambiente de execução. Caso surja necessidade de edição pelo painel, criar uma tabela com colunas explícitas e histórico adequado, em vez de um depósito genérico de JSON.

Logs operacionais: saída estruturada do servidor com `request_id`, operação, duração, resultado e código de erro; sem tokens, cookies ou payloads completos. A tabela de publicações guarda estado operacional persistente, e o histórico de preços guarda observações comerciais. Logs de auditoria adicionais serão criados quando existir uma necessidade concreta de rastrear ações administrativas.

## 6. Acesso e segurança

Habilitar RLS nas tabelas expostas e definir grants mínimos junto das políticas. Chaves secretas ficam no servidor: elas podem contornar RLS e não substituem autorização da aplicação. [RLS do Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security) e [chaves de API](https://supabase.com/docs/guides/getting-started/api-keys).

| Ator | Permissão proposta |
| --- | --- |
| Visitante | Leitura de categorias ativas e ofertas publicadas elegíveis, seus produtos e links ativos; nunca dados de administração |
| Usuário autenticado comum | A mesma leitura pública, sem escrita comercial |
| Administrador cadastrado | CRUD autorizado de catálogo; leitura de histórico e publicações; solicitação de publicação e encerramento de ofertas |
| Job autenticado | Operações específicas de atualização e publicação, com credencial privilegiada isolada |

Políticas públicas de produtos e links verificam a existência de oferta pública correspondente. A política pública de ofertas usa os próprios campos de estado e período; manter a direção dessas dependências sem recursão. Disponibilidade e atualização de preço também são conferidas no serviço do catálogo e no redirecionamento. Definir inicialmente validade de 24 horas como decisão de produto configurável, não como regra do marketplace. Ofertas sem revisão recente não são anunciadas como atuais.

A função de verificação administrativa deve ser pequena, de propósito único, com `search_path` controlado e sem argumentos que permitam consultar terceiros; lê `auth.uid()` e a tabela de administradores. Bloquear escrita direta em `admin_users`. Validar as políticas como visitante, autenticado comum e administrador antes de aplicar em produção.

Usar sessão do usuário nas operações de painel sempre que possível. Rotas privilegiadas repetem a autorização, validam origem/CSRF nas mutações e não confiam em valores enviados pelo navegador para papel de usuário ou preço vigente. Não armazenar credenciais no banco comercial. O futuro armazenamento de tokens OAuth renováveis precisa de projeto específico de criptografia, renovação e revogação antes da integração real.

## 7. Contratos de integração

Proposta de interfaces TypeScript, sem implementações HTTP nesta etapa:

```ts
type ProductSnapshot = {
  externalId: string;
  title: string;
  canonicalUrl: string;
  imageUrl?: string;
  priceCents: number;
  currency: 'BRL';
  availability: 'available' | 'unavailable' | 'unknown';
  observedAt: string;
};

type IntegrationError = {
  code: 'not_configured' | 'unauthorized' | 'rate_limited'
    | 'not_found' | 'invalid_response' | 'unavailable';
  retryAfterSeconds?: number;
};

type Result<T> = { ok: true; value: T }
  | { ok: false; error: IntegrationError };

interface ProductProvider {
  getProduct(externalId: string): Promise<Result<ProductSnapshot>>;
}

interface AffiliateLinkProvider {
  // Pode não haver implementação automática para o Mercado Livre.
  resolve(externalId: string): Promise<Result<{ destinationUrl: string }>>;
}

interface PublicationChannel {
  publish(input: { channelId: string; text: string }): Promise<
    | { status: 'sent'; messageId: string }
    | { status: 'failed'; error: IntegrationError; retryable: boolean }
    | { status: 'unknown'; reason: string }
  >;
}
```

Sem credenciais ou recurso autorizado, retornar `not_configured`, nunca sucesso fictício. Dados simulados entram apenas por adaptador de desenvolvimento claramente identificado. Identificadores do Telegram atravessam o domínio como strings para evitar perda de precisão.

Mercado Livre: validar autenticação, escopos, recursos acessíveis e condições de uso antes de implementar. A página oficial de autenticação não pôde ser carregada nesta consulta; este documento não atesta endpoints, limites, permissão de afiliados ou geração automática de links. Cadastro manual e integração de dados são funções separadas.

Telegram: começar pelo envio manualmente solicitado a um único canal configurado. Agendamento posterior exige horário definido e autorização para publicar. Nenhum bot foi configurado e nenhuma mensagem foi enviada nesta entrega.

## 8. Modelo de `.env.example`

Conteúdo proposto para futura criação do arquivo, sem segredos reais:

```dotenv
# Aplicação
APP_URL=http://localhost:3000
APP_TIMEZONE=America/Sao_Paulo
DATA_MODE=demo
LOG_LEVEL=info
PRICE_MAX_AGE_HOURS=24
JOB_BATCH_SIZE=10

# Preencher apenas ao conectar o Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

# Integrações desligadas por padrão
MERCADO_LIVRE_ENABLED=false
MERCADO_LIVRE_CLIENT_ID=
MERCADO_LIVRE_CLIENT_SECRET=
MERCADO_LIVRE_REDIRECT_URI=

TELEGRAM_ENABLED=false
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=

# Apenas quando houver jobs e proteção distribuída de rotas
CRON_SECRET=
RATE_LIMIT_HASH_SECRET=
```

`DATA_MODE=demo` usa apenas dados de exemplo, sem persistência real ou divulgação externa. Na implementação, produção deve exigir `DATA_MODE=supabase` para evitar a publicação acidental de ofertas fictícias. Supabase obrigatório apenas no modo persistente; credenciais de integração obrigatórias somente com a flag correspondente ativa. Não interpretar string `"false"` como booleano verdadeiro.

No Next.js, variáveis `NEXT_PUBLIC_` são expostas ao cliente e incorporadas ao build. Tokens, secret keys e credenciais de jobs não recebem esse prefixo. Marcar módulos sensíveis com `server-only`. [Variáveis de ambiente](https://nextjs.org/docs/app/guides/environment-variables) e [separação servidor/cliente](https://nextjs.org/docs/app/getting-started/server-and-client-components).

O callback do Mercado Livre permanece vazio até existir URL HTTPS real e rota implementada. Não inventar endereço para preencher o cadastro. O futuro `.gitignore` ignora `.env*`, preservando apenas `.env.example`.

## 9. Idempotência, cache, limites e falhas

- **Deduplicação:** identificador externo de produto, chave de observação por coleta, uma oferta aprovada/publicada por produto e chave de publicação por link/canal/revisão.
- **Concorrência:** transações para preço/histórico e aprovação; reivindicação atômica de publicações; contador de cliques atualizado no banco.
- **Cache:** começar com até 60 segundos no catálogo público como parâmetro do projeto; invalidar após alterações administrativas. Não compartilhar cache de sessão, painel ou tokens. Conferir expiração e destino novamente no redirecionamento.
- **Limites:** proteger mutações com autenticação e limites por operação; jobs com segredo e lotes finitos. Não usar contador em memória como proteção distribuída na Vercel. Primeiro escolher uma capacidade persistente disponível da hospedagem; se insuficiente, usar função atômica com bucket e expiração no Postgres. Uma tabela técnica de buckets só será adicionada se essa alternativa for necessária.
- **Retry:** timeout explícito em chamadas externas; backoff com jitter e limite de tentativas para erros recuperáveis; respeitar `Retry-After` quando informado; 401/403 exigem correção de acesso. Resultado ambíguo de publicação não recebe retry automático.
- **Consistência:** indisponibilidade ou mudança de preço suspende a exibição da oferta até revisão; expiração é condição da consulta, mesmo que o job atrase.
- **Falhas parciais:** processar itens independentemente, registrar código sanitizado e permitir retomada. Uma falha de métrica não interrompe acesso à loja.
- **Custo:** persistir alterações de preço, agregar cliques por dia, paginar listas e limitar consultas. Só definir frequência do agendamento após verificar plano e limites reais das contas; não pressupor execução a cada minuto.

## 10. Critérios de validação da implementação

1. Instalação reproduzível, lint, TypeScript e build concluídos com versões fixadas e lockfile.
2. Interface demonstra estados vazio, carregando, falha e oferta expirada, inclusive em tela pequena.
3. Banco rejeita duplicação de anúncios/coletas/publicações, preços inválidos e aprovação concorrente do mesmo anúncio.
4. Visitante e usuário comum não alteram dados nem leem rascunhos, métricas ou publicações; administrador só age após validação da sessão.
5. Expiração funciona sem depender do job; cálculo de desconto exige referência válida e reproduzível.
6. Redirecionamento aceita apenas código conhecido e destino HTTPS permitido; link desativado não redireciona.
7. Simulação de 429, timeout, retry e execução concorrente verifica os estados de publicação, incluindo resultado `unknown`.
8. Build do cliente não contém segredos. Flags desligadas não disparam chamadas a provedores.

Nesta entrega foi verificada a situação do repositório e revisada a coerência entre entidades, índices, fluxos e escopo. Não há aplicação, migration SQL executável ou build a testar ainda. Os testes acima são critérios para o código que será implementado, não resultados já obtidos.

## 11. Próxima ação concreta

Após a revisão desta proposta, criar a base Next.js em uma branch de trabalho do `promosnow`, com README, `.env.example`, contratos, páginas iniciais e dados de demonstração identificados. A configuração real do Supabase e as integrações entram em entregas seguintes. Este ponto de revisão vem do pedido original enviado ao Claude, que previa apresentar a arquitetura antes de implementar.
