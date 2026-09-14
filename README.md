# PromosNow

Base inicial de um site de promoções com catálogo público e painel de curadoria. Projeto preparado para futura integração com Supabase, Mercado Livre e Telegram.

**Versão atual: demonstração.** Todos os produtos, preços e descontos são fictícios. Não há compras, envios, persistência, autenticação ou integrações reais nesta etapa.

## Executar localmente

Requisito: Node.js 24 LTS e npm. As versões estão fixadas no `package-lock.json`.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`. Não é necessário fornecer credenciais para explorar a demonstração.

## Verificar

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:http
```

Ou `npm run check`. A verificação HTTP inicia servidores temporários nas portas 3101 e 3102 para testar preview, bloqueio em produção e ausência de rascunhos na resposta pública. Os testes usam o executor nativo do Node.js 24, sem dependência adicional de testes.

Para verificar localmente a compilação em modo de preview:

```bash
APP_ENV=preview npm run start
```

Para verificar o bloqueio de dados fictícios:

```bash
APP_ENV=production npm run start
```

Neste segundo modo, a página inicial exibe “Em breve”; o painel redireciona para a página de entrada indisponível e as ofertas fictícias não são acessíveis.

## Rotas

| Caminho              | Função                                                  |
| -------------------- | ------------------------------------------------------- |
| `/`                  | Catálogo demonstrativo ou preparação, conforme ambiente |
| `/ofertas/[slug]`    | Detalhes de um exemplo público                          |
| `/sobre`             | Apresentação e estado do projeto                        |
| `/entrar`            | Acesso à demonstração; não recebe senhas                |
| `/admin`             | Visão geral de demonstração                             |
| `/admin/produtos`    | Consulta dos produtos fictícios                         |
| `/admin/ofertas`     | Consulta e filtro por situação                          |
| `/admin/publicacoes` | Prévia local de mensagem, sem envio                     |

## Configuração

`.env.example` descreve as variáveis. Não comitar `.env.local`, tokens ou chaves reais. Módulos em `src/server` separam o acesso à configuração e aos dados; apenas tipos, regras puras e dados públicos selecionados chegam à interface.

- `DATA_MODE=demo`: exemplos somente no desenvolvimento ou preview.
- `DATA_MODE=supabase`: reservado; exige configuração, mas mantém a página de preparação até a implementação da persistência.
- `APP_ENV`: `local`, `preview` ou `production`. Nunca usar `local`/`preview` em produção fora da Vercel.
- Na Vercel, `VERCEL_ENV=production` bloqueia a demo mesmo com `APP_ENV=preview`.
- Flags de Mercado Livre e Telegram ficam `false`. Os adaptadores desta etapa sempre retornam `not_configured`.
- Produção não depende de um job para esconder exemplos. Catálogo e painel verificam o ambiente no servidor.

## Organização

| Diretório        | Responsabilidade                                           |
| ---------------- | ---------------------------------------------------------- |
| `src/app`        | Rotas e layouts                                            |
| `src/components` | Elementos visuais compartilhados                           |
| `src/features`   | Interações do catálogo e do painel                         |
| `src/domain`     | Regras puras e validação de configuração                   |
| `src/server`     | Estado da aplicação, repositório e contratos de integração |
| `tests`          | Regras comerciais e limites de configuração                |
| `docs`           | Arquitetura, decisões e estado da implementação            |

Leia [o estado atual](docs/implementation-status.md) e [a proposta de arquitetura](docs/architecture.md). O esquema do banco está documentado; ainda não há migração executável. As ilustrações dos produtos são SVGs próprios, sem dependência externa.

## Vercel — configuração futura

Importar este repositório como Next.js, usando a raiz e Node.js 24. Build: `npm run build`; instalação: `npm ci`. Usar variáveis distintas para Preview e Production. Nenhum domínio ou deploy foi criado por este código. O build não exige credenciais no modo padrão; uma publicação de produção mostra a página de preparação. Remover `noindex` apenas quando o catálogo real estiver pronto.

## Próximo passo

Persistência e autenticação Supabase, com testes de permissões, seguidas do cadastro manual de produtos e ofertas. Integrações externas serão implementadas somente depois de validar o acesso às contas e APIs.
