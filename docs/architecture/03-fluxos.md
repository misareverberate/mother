[← 2. Componentes](02-componentes.md) | [Índice da Arquitetura](../ARCHITECTURE.md) | Próximo: [4. Restrições do serverless →](04-restricoes-serverless.md)

---

# 3. Fluxos

Cinco fluxos cobrem toda a operação do sistema. Os diagramas mostram o caminho de sucesso; as observações abaixo de cada um tratam do que acontece quando algo dá errado.

---

## 3.1 Coleta e geração de posts

Implementa UC-01, UC-02 e UC-03.

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Vercel Cron
    participant Col as Collector
    participant Redis as Redis
    participant Src as ProductSource
    participant Cur as CurationEngine
    participant Gen as ContentGenerator
    participant Sh as ShortenerService
    participant DB as PostgreSQL

    Cron->>Col: POST /api/cron/collect (segredo)
    Col->>Col: valida segredo
    Col->>Redis: adquire trava de coleta
    alt trava indisponível
        Redis-->>Col: já existe
        Col-->>Cron: 200 — execução ignorada
    end
    Col->>DB: cria execução (RUNNING)
    Col->>DB: carrega regras ativas

    loop enquanto houver página e tempo
        Col->>Src: fetch_page(cursor, filtros)
        Src-->>Col: produtos + próximo cursor
        Col->>Col: normaliza
        Col->>DB: upsert produtos + histórico de preço
        Col->>Col: verifica orçamento de tempo
    end

    Col->>Cur: avalia(produtos, regras)
    Cur->>Cur: filtros de exclusão
    Cur->>DB: consulta publicações anteriores
    Cur->>Cur: deduplica e calcula score
    Cur-->>Col: selecionados (ordenados)

    loop para cada selecionado
        Col->>Gen: gera(produto, template)
        Gen->>Sh: cria link curto
        Sh->>DB: grava short_link
        Sh-->>Gen: código
        Gen->>Gen: renderiza, escapa, trunca
        Gen->>DB: insere post (PENDING)
    end

    Col->>DB: encerra execução (SUCCESS)
    Col->>Redis: libera trava
    Col-->>Cron: 200 + contagens
```

**Quando dá errado**

| Situação | Resposta do sistema |
|---|---|
| Orçamento de tempo esgotado | Interrompe a paginação, salva o cursor, encerra como `PARTIAL`. A próxima execução retoma |
| Falha de autenticação na fonte | Renova o token uma vez; persistindo, encerra como `FAILED` e alerta |
| Limite de taxa da fonte | Espera exponencial; esgotadas as tentativas, encerra como `PARTIAL` |
| Produto individual malformado | Descarta o item e prossegue; se mais da metade da página falhar, encerra como `FAILED` |
| Função morre no meio | A trava expira sozinha; a execução fica `RUNNING` órfã e é marcada como `FAILED` pela rotina de reconciliação |

---

## 3.2 Aprovação e publicação

Implementa UC-05 e UC-08. É o fluxo com mais partes móveis, porque atravessa duas invocações separadas por uma fila.

```mermaid
sequenceDiagram
    autonumber
    participant Adm as Administrador
    participant Web as Painel
    participant PS as PostService
    participant DB as PostgreSQL
    participant QS as QStash
    participant Pub as PublishService
    participant TG as Telegram API

    Adm->>Web: aprova post
    Web->>PS: POST /api/posts/{id}/approve
    PS->>PS: valida sessão
    PS->>DB: carrega post
    PS->>PS: valida transição (RN-017)
    PS->>DB: verifica limite diário (RN-007)
    PS->>DB: status = APPROVED
    PS->>QS: enfileira job + chave de idempotência

    alt falha ao enfileirar
        QS-->>PS: erro
        PS->>DB: reverte para PENDING
        PS-->>Web: 503
        Web-->>Adm: erro — post continua na fila
    end

    PS-->>Web: 200
    Web-->>Adm: confirmação

    Note over QS,Pub: assíncrono

    QS->>Pub: POST /api/jobs/publish (assinado)
    Pub->>Pub: valida assinatura
    Pub->>DB: chave já processada?
    alt já processada
        Pub-->>QS: 200 — sem novo envio
    end
    Pub->>DB: carrega post
    Pub->>TG: sendMessage
    TG-->>Pub: message_id
    Pub->>DB: status = PUBLISHED + message_id
    Pub->>DB: atualiza última publicação do produto
    Pub-->>QS: 200
```

**Quando dá errado**

| Situação | Resposta | Código ao QStash |
|---|---|---|
| Assinatura inválida | Não processa | 401 |
| Limite de taxa do Telegram | Solicita nova tentativa após o intervalo indicado | 429 |
| Erro temporário do Telegram | Solicita nova tentativa | 500 |
| Erro permanente (bot removido, formatação inválida) | Marca `FAILED`, alerta o Administrador | 200 — interrompe retentativas |
| Retentativas esgotadas | QStash envia à fila de mensagens mortas; post vira `FAILED` | — |
| Post em estado inesperado | Registra e ignora | 200 |

> Responder **200 em erro permanente** é contraintuitivo, mas correto: sinaliza ao QStash que não adianta insistir. Retentar um envio que sempre falhará só gasta cota e polui os registros. O erro fica visível no painel, não na fila.

---

## 3.3 Publicação manual no Twitter/X

Implementa UC-09.

```mermaid
sequenceDiagram
    autonumber
    participant Adm as Administrador
    participant Web as Painel
    participant API as API
    participant DB as PostgreSQL
    participant X as Twitter/X

    Adm->>Web: acessa /twitter
    Web->>API: GET /api/posts?twitter_status=pending
    API->>DB: consulta pendências
    DB-->>API: posts
    API-->>Web: lista + contagem de caracteres
    Web-->>Adm: exibe textos prontos

    Adm->>Web: aciona cópia
    Web->>Web: escreve na área de transferência
    Web-->>Adm: confirmação visual

    Adm->>X: cola e publica (fora do sistema)

    Adm->>Web: marca como publicado
    Web->>API: POST /api/posts/{id}/twitter/complete
    API->>DB: registra publicação + URL opcional
    API-->>Web: 200
    Web-->>Adm: item sai da lista
```

O sistema não tem como confirmar que a publicação realmente ocorreu — depende da marcação do Administrador. Esse é o custo aceito por não contratar a API do X (RE-04). O campo de URL do tuíte existe para que exista ao menos um vestígio verificável.

---

## 3.4 Clique e redirecionamento

Implementa UC-10. É o fluxo mais sensível a latência do sistema.

```mermaid
sequenceDiagram
    autonumber
    participant Ass as Assinante
    participant R as Redirecionador
    participant Redis as Redis
    participant DB as PostgreSQL
    participant TT as TikTok Shop

    Ass->>R: GET /r/{code}?src=tg
    R->>Redis: consulta cache do código
    alt cache disponível
        Redis-->>R: URL de destino
    else cache indisponível
        R->>DB: busca short_link
        DB-->>R: URL de destino
        R->>Redis: grava no cache
    end
    R-->>Ass: 302 Location
    Ass->>TT: acessa a oferta

    Note over R,DB: após a resposta

    R->>Redis: incrementa contador
    R->>DB: insere registro de clique
```

**Decisões de projeto**

| Decisão | Motivo |
|---|---|
| Cache do código no Redis | Evita ida ao banco no caminho crítico (RNF-004) |
| Redirecionamento antes do registro | O clique é métrica; a conversão é o produto (RNF-012) |
| Sem autenticação | Precisa funcionar mesmo com o painel fora do ar (RNF-013) |
| Contador no Redis, detalhe no Postgres | Leitura rápida para o painel, detalhe para análise |
| Parâmetro `src` na URL | Distingue Telegram de Twitter/X (RF-045) |

Se o registro do clique falhar, o visitante não percebe. Se o redirecionamento falhar, perde-se uma venda. A assimetria justifica toda a estrutura acima.

---

## 3.5 Reavaliação de preços

Implementa UC-15.

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Vercel Cron
    participant Col as Collector
    participant DB as PostgreSQL
    participant Src as ProductSource
    participant Gen as ContentGenerator

    Cron->>Col: POST /api/cron/refresh-prices
    Col->>DB: produtos publicados em acompanhamento
    loop para cada produto (com orçamento de tempo)
        Col->>Src: fetch_by_id(external_id)
        alt produto indisponível
            Src-->>Col: não encontrado
            Col->>DB: marca inativo, remove do acompanhamento
        else preço obtido
            Src-->>Col: produto
            Col->>DB: grava histórico se mudou
            alt queda ≥ limiar (RN-004)
                Col->>Gen: gera post de queda de preço
                Gen->>DB: insere post (PENDING)
            end
        end
    end
    Col->>DB: encerra execução
```

Este fluxo reaproveita `Collector` e `ContentGenerator` sem alteração — a única diferença é a origem da lista de produtos e o template escolhido. É o retorno concreto de ter mantido a curadoria e a geração desacopladas da coleta.

---

## 3.6 Resumo dos gatilhos

| Fluxo | Gatilho | Frequência sugerida | Endpoint |
|---|---|---|---|
| Coleta | Vercel Cron | 3× ao dia | `/api/cron/collect` |
| Reavaliação de preços | Vercel Cron | 1× ao dia | `/api/cron/refresh-prices` |
| Expiração de pendentes | Vercel Cron | 1× ao dia | `/api/cron/expire-pending` |
| Agregação de métricas | Vercel Cron | 1× ao dia | `/api/cron/aggregate-metrics` |
| Publicação | QStash | Por aprovação | `/api/jobs/publish` |
| Aprovação | Administrador | Sob demanda | `/api/posts/{id}/approve` |
| Redirecionamento | Assinante | Sob demanda | `/r/{code}` |

Os horários concretos e a sintaxe de agendamento estão em [`SETUP.md`](../SETUP.md).

---

[← 2. Componentes](02-componentes.md) | [Índice da Arquitetura](../ARCHITECTURE.md) | Próximo: [4. Restrições do serverless →](04-restricoes-serverless.md)
