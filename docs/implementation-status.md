# Estado da implementação — 13/09/2026

Este documento atualiza a proposta histórica em `architecture.md`.

## Entregue na base 0.1.0

- Next.js App Router, React e TypeScript; CSS responsivo sem serviços de fontes ou imagens.
- Catálogo pesquisável e filtros por categoria, menor preço e maior desconto.
- Seis produtos fictícios públicos, um rascunho e um exemplo encerrado para o painel.
- Detalhes de oferta; rascunhos não possuem página pública; exemplo encerrado não aparece no catálogo.
- Páginas de apresentação, entrada e painel somente demonstrativo.
- Painel com visão geral, tabela de produtos/ofertas e prévia local de mensagem.
- Contratos de integração e adaptadores desativados que retornam falha explícita.
- Configuração validada no servidor, sem exportar segredos para componentes cliente.
- Estados vazio, erro, carregamento e página não encontrada; navegação por teclado e responsividade.
- Testes de regras, configuração, produção e ausência de chamadas nos adaptadores.

## Limites desta entrega

Não há persistência, login real, edição de produtos, migrações aplicadas, API do Mercado Livre, geração de links de afiliado, envio ao Telegram, cliques registrados ou agendamento. As flags reservadas validam a configuração, mas ainda não ativam essas funcionalidades. Nenhuma ação visual declara ter salvo ou enviado algo.

O modo `supabase` deliberadamente mostra uma página de preparação até a implementação do repositório de dados e autenticação. Não confundir credenciais preenchidas com integração concluída.

Em produção, `demoAllowed` é sempre falso. A variável da Vercel `VERCEL_ENV=production` prevalece sobre `APP_ENV`. Fora da Vercel, `APP_ENV` deve refletir o ambiente real; sem ela, `NODE_ENV=production` bloqueia a demonstração. Os previews da Vercel e o desenvolvimento local podem mostrar o catálogo fictício. Todas as rotas são dinâmicas para não congelar a decisão de ambiente no build. Não há rota de mutação nem autenticação simulada que conceda acesso real. A proteção da demo não substitui o futuro controle por sessão e RLS.

`admin/layout.tsx` redireciona ao entrar fora da demonstração. A leitura do repositório também é bloqueada no servidor, inclusive em acesso direto às páginas. Supabase Auth e RLS serão obrigatórios antes de qualquer dado real entrar no painel.

O projeto permanece marcado como `noindex` até a entrega do catálogo real. A página de preparação pode ser publicada futuramente sem exibir ofertas fictícias. Nesta entrega não foi solicitado nem realizado deploy.

## Validação

Consulte [os resultados e limites da verificação](validation.md). Build, lint, tipos, sete testes e as verificações HTTP de preview/produção passaram. A revisão visual segue pendente por bloqueio de localhost no navegador disponível.

## Próxima entrega

Criar projeto Supabase, migrações versionadas e testes de políticas; implementar sessão, administrador autorizado e cadastro manual. Depois conectar os provedores, conforme acesso efetivamente concedido. As dependências do Supabase serão adicionadas nesse momento, evitando pacotes sem uso.
