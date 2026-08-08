[← Índice do SRS](../SRS.md) | Próximo: [2. Visão Geral →](02-visao-geral.md)

---

# 1. Introdução

## 1.1 Propósito

Este documento especifica os requisitos funcionais, não funcionais e as regras de negócio do **Mother**, um sistema de curadoria e divulgação automatizada de ofertas do TikTok Shop.

Ele serve como fonte única de verdade sobre *o que* o sistema deve fazer. Decisões sobre *como* fazer estão em [`ARCHITECTURE.md`](../ARCHITECTURE.md) e nos [ADRs](../adr/).

## 1.2 Problema

Divulgar ofertas manualmente em canais sociais é um trabalho repetitivo e de baixo retorno por hora investida. É preciso encontrar produtos com desconto real, verificar se o produto presta, escrever um texto atraente, formatar, publicar e repetir várias vezes ao dia. Além disso, sem rastreamento não há como saber qual tipo de oferta gera cliques, o que impede melhorar a curadoria ao longo do tempo.

O Mother automatiza a parte mecânica — busca, filtragem, redação e publicação — e preserva o julgamento humano no único ponto onde ele agrega valor: a decisão de publicar ou não.

## 1.3 Escopo do produto

### 1.3.1 Dentro do escopo

- Coleta periódica e automatizada de produtos do TikTok Shop
- Filtragem por regras configuráveis (desconto, preço, avaliação, vendas, categoria)
- Deduplicação com janela de reposição e detecção de queda de preço
- Geração de dois textos por produto: um para Telegram, um para Twitter/X
- Fila de aprovação com revisão e edição humana antes da publicação
- Publicação automática no grupo/canal do Telegram após aprovação
- Fila de publicação manual para Twitter/X, com botão de cópia e marcação de conclusão
- Encurtador de links próprio com contagem de cliques por post
- Painel web autenticado para operar todo o fluxo
- Métricas básicas de desempenho por post e por período

### 1.3.2 Fora do escopo

| Item | Justificativa |
|---|---|
| Publicação automática no Twitter/X | A API do X é paga e o custo não se justifica no estágio atual |
| Geração de imagens ou cards de produto | Decisão explícita: posts são somente texto + link (RN-014) |
| Atendimento a usuários no Telegram | O bot publica, não conversa |
| Processamento de pedidos ou pagamentos | A conversão acontece integralmente dentro do TikTok Shop |
| Aplicativo móvel nativo | O painel web responsivo atende o caso de uso |
| Múltiplos canais de Telegram | Versão 1 opera um único destino; multi-canal é backlog |
| Instagram, Facebook, WhatsApp | Backlog; a arquitetura de publishers deixa o gancho pronto |

## 1.4 Público-alvo deste documento

| Leitor | Seções mais relevantes |
|---|---|
| Desenvolvedor implementando o sistema | 3, 4, 6, 7 |
| Responsável por testes | 3, 4, 5, 7 |
| Product Owner | 1, 2, 3, 6 |
| Futuro mantenedor | Todas, mais os ADRs |

## 1.5 Definições e glossário

| Termo | Definição |
|---|---|
| **Produto** | Item comercializado no TikTok Shop, identificado por um ID único da plataforma |
| **Oferta** | Um produto que atendeu aos critérios de curadoria e é candidato a virar post |
| **Post** | Registro no sistema contendo os textos gerados para Telegram e Twitter/X referentes a uma oferta |
| **Fila de aprovação** | Conjunto de posts com status `PENDING`, aguardando decisão do Administrador |
| **Curadoria** | Processo de filtragem e ordenação que decide quais produtos entram na fila |
| **Deduplicação** | Verificação que impede publicar um produto já publicado dentro da janela de reposição |
| **Janela de reposição** | Período mínimo, em dias, antes que um produto já publicado possa ser republicado (RN-003) |
| **Score** | Valor numérico calculado por produto, usado para ordenar a fila por relevância |
| **Link curto** | URL no domínio do próprio sistema (`/r/{code}`) que registra o clique e redireciona |
| **Link de afiliado** | URL de destino final, contendo o identificador que atribui a comissão |
| **ProductSource** | Interface de abstração que isola o sistema da fonte concreta de produtos |
| **Publisher** | Componente responsável por entregar um post a um canal específico |
| **Serverless** | Modelo de execução em que funções são iniciadas sob demanda e encerradas ao fim da requisição |
| **Cold start** | Latência adicional na primeira invocação de uma função serverless inativa |
| **Webhook** | Endpoint HTTP que recebe notificações enviadas por um serviço externo |
| **Idempotência** | Propriedade de uma operação que, repetida com a mesma entrada, produz o mesmo resultado sem efeitos colaterais adicionais |
| **RLS** | *Row Level Security* — controle de acesso a nível de linha no PostgreSQL |
| **QStash** | Serviço da Upstash que agenda e entrega mensagens de fila via requisições HTTP |

## 1.6 Referências

### 1.6.1 Documentos do projeto

- [`ARCHITECTURE.md`](../ARCHITECTURE.md) — decisões de arquitetura e diagramas
- [`DATA_MODEL.md`](../DATA_MODEL.md) — modelo de dados e DDL
- [`API_INTEGRATION.md`](../API_INTEGRATION.md) — contratos das integrações externas
- [`CONTENT_TEMPLATES.md`](../CONTENT_TEMPLATES.md) — templates de conteúdo
- [`adr/`](../adr/) — registros de decisão arquitetural

### 1.6.2 Documentação externa

| Recurso | Uso no projeto |
|---|---|
| TikTok Shop Partner Center | Obtenção de credenciais e catálogo de produtos |
| Telegram Bot API | Publicação de mensagens no grupo |
| Supabase Docs | Banco de dados, autenticação e RLS |
| Upstash QStash Docs | Fila de publicação por push HTTP |
| Vercel Docs — Cron Jobs e Python Runtime | Agendamento e execução das funções |

> Os endpoints, parâmetros, limites de taxa e formatos de erro de cada serviço externo estão detalhados em [`API_INTEGRATION.md`](../API_INTEGRATION.md), e não são repetidos aqui.

## 1.7 Visão geral do restante do documento

A seção 2 estabelece o contexto: quem interage com o sistema, sob quais premissas ele foi desenhado e quais restrições limitam as soluções possíveis. A seção 3 descreve o comportamento esperado na forma de casos de uso, incluindo fluxos alternativos e de exceção. As seções 4, 5 e 6 formalizam requisitos funcionais, não funcionais e regras de negócio. A seção 7 amarra tudo por meio de matrizes de rastreabilidade.

---

[← Índice do SRS](../SRS.md) | Próximo: [2. Visão Geral →](02-visao-geral.md)
