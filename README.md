# PromosNow

Site de curadoria de promoções com catálogo e painel administrativo. Esta versão implementa cadastro manual, aprovação de ofertas, sessão Supabase, consulta de preços do Mercado Livre e envio explícito ao Telegram.

**O código precisa da migração e das configurações das contas para funcionar com dados reais.** Os testes locais não comprovam a integração com as contas de produção. Veja [ativação e validação](docs/activation.md).

## Executar

Node.js 24 e npm. Dependências fixadas no lockfile.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

O modo padrão é uma demonstração local em `http://localhost:3000`, sem credenciais. Todos os seus preços e produtos são fictícios. Produção com `DATA_MODE=demo` mostra a página de preparação e bloqueia o painel demonstrativo.

## Validar

```bash
npm run check
```

Executa lint, TypeScript, testes Node/PGlite, build e verificações HTTP de preview/produção nas portas 3101 e 3102. PGlite executa a migração em PostgreSQL local; os testes de provedores usam respostas simuladas. Nenhum teste publica mensagens ou modifica contas externas.

## Modos e rotas

`DATA_MODE=supabase` usa banco e autenticação reais. O acesso ao painel exige usuário autenticado listado em `admin_users`. Não existe cadastro público de administradores.

| Rota | Dados reais |
| --- | --- |
| `/` | Ofertas aprovadas, disponíveis e conferidas há menos de 24 horas |
| `/ofertas/[slug]` | Preço, referência opcional, validade e divulgação de afiliado |
| `/r/[code]` | Redirecionamento validado e métricas opcionais |
| `/entrar` | Entrada com e-mail e senha do Supabase Auth |
| `/admin` | Ofertas recentes e cliques estimados dos últimos 30 dias UTC |
| `/admin/produtos`, `/admin/ofertas` | Cadastro conjunto de produto/oferta, revisão, aprovação e encerramento |
| `/admin/ofertas/nova` | Novo rascunho |
| `/admin/ofertas/[id]/editar` | Edição de rascunho |
| `/admin/publicacoes` | Prévia, confirmação de envio e histórico do Telegram |

O catálogo carrega até 100 ofertas recentes; o painel lista até 200. Busca e ordenação atuam sobre a lista carregada. Paginação e automação de coleta/publicação são próximas entregas.

## Regras principais

- Dados públicos são retornados por funções SQL que verificam aprovação, validade, disponibilidade, preço e atualização. Rascunhos e links de ofertas inelegíveis não são expostos.
- RLS e permissões impedem escrita direta nas tabelas. Funções de mutação conferem a condição de administrador no banco.
- O preço aprovado não muda silenciosamente quando a API informa outro valor. A oferta sai do catálogo; encerre-a e crie uma nova revisão.
- Links de afiliado são fornecidos pelo administrador, com HTTPS e domínios permitidos. Não há geração automática ou comprovação de comissão.
- Telegram requer confirmação no painel. Um resultado incerto bloqueia reenvio automático; confira o canal.
- Nenhum token deve ir para o Git. A chave secreta do Supabase é opcional, usada apenas no servidor para contagem de cliques.

## Documentação

- [Ativação e roteiro de teste real](docs/activation.md)
- [Estado da implementação e limites](docs/implementation-status.md)
- [Validação local](docs/validation.md)
- [Proposta histórica de arquitetura](docs/architecture.md)

O site continua com `noindex` até concluir a validação real. A criação de um PR não aplica a migração nem configura variáveis das contas.
