[← Índice da Arquitetura](../ARCHITECTURE.md) | Próximo: [2. Componentes →](02-componentes.md)

---

# 1. Visão C4

Três níveis: contexto (quem usa e com o que conversa), contêineres (unidades implantáveis) e componentes (módulos dentro do contêiner principal).

---

## 1.1 Nível 1 — Contexto

```mermaid
C4Context
    title Nível 1 — Contexto do sistema

    Person(admin, "Administrador", "Revisa a fila, aprova posts, configura regras")
    Person(assinante, "Assinante", "Membro do grupo do Telegram")

    System(mother, "Mother", "Coleta, cura, gera, aprova e publica ofertas")

    System_Ext(tiktok, "TikTok Shop", "Catálogo e programa de afiliados")
    System_Ext(telegram, "Telegram", "Grupo de destino")
    System_Ext(twitter, "Twitter/X", "Publicação manual")
    System_Ext(supabase, "Supabase", "Banco e autenticação")
    System_Ext(upstash, "Upstash", "Fila e cache")

    Rel(admin, mother, "Opera", "HTTPS")
    Rel(mother, tiktok, "Consulta produtos", "HTTPS")
    Rel(mother, telegram, "Publica", "Bot API")
    Rel(mother, supabase, "Persiste e autentica", "HTTPS")
    Rel(mother, upstash, "Enfileira jobs", "HTTPS")
    Rel(admin, twitter, "Publica manualmente", "Web")
    Rel(assinante, telegram, "Lê ofertas")
    Rel(assinante, mother, "Clica no link curto", "HTTPS")
    Rel(assinante, tiktok, "É redirecionado e compra", "HTTPS")
```

O sistema não expõe API pública além do redirecionador. Todo o resto exige autenticação.

---

## 1.2 Nível 2 — Contêineres

```mermaid
flowchart TB
    ADM(["Administrador"])
    ASS(["Assinante"])

    subgraph plataforma["Vercel"]
        WEB["<b>Painel Web</b><br/>Next.js + TypeScript<br/><i>Fila, aprovação, regras, métricas</i>"]
        APIF["<b>API de Aplicação</b><br/>Python + FastAPI<br/><i>Regras de negócio e integrações</i>"]
        REDIR["<b>Redirecionador</b><br/>Python, função isolada<br/><i>/r/:code — sem autenticação</i>"]
        SCHED["<b>Agendador</b><br/>Vercel Cron<br/><i>Dispara coleta e reavaliação</i>"]
    end

    subgraph persistencia["Persistência"]
        DB[("<b>PostgreSQL</b><br/>Supabase<br/><i>Produtos, posts, cliques, regras</i>")]
        AUTHC["<b>Auth</b><br/>Supabase<br/><i>Link mágico e sessões</i>"]
        KV[("<b>Redis</b><br/>Upstash<br/><i>Travas, cache, contadores</i>")]
    end

    subgraph externo["Serviços externos"]
        QSTASH["<b>QStash</b><br/>Upstash<br/><i>Entrega jobs por HTTP push</i>"]
        TIKTOK["<b>TikTok Shop API</b>"]
        TGAPI["<b>Telegram Bot API</b>"]
    end

    ADM -->|HTTPS| WEB
    WEB -->|sessão| AUTHC
    WEB -->|JSON| APIF
    SCHED -->|HTTP + segredo| APIF
    APIF -->|SQL| DB
    APIF -->|comandos| KV
    APIF -->|HTTPS| TIKTOK
    APIF -->|HTTPS| TGAPI
    APIF -->|publica job| QSTASH
    QSTASH -->|HTTP assinado| APIF
    ASS -->|HTTPS| REDIR
    REDIR -->|SQL| DB
    REDIR -->|contador| KV
    ASS -->|redirecionado| TIKTOK
```

### Descrição dos contêineres

| Contêiner | Tecnologia | Responsabilidade | Não faz |
|---|---|---|---|
| **Painel Web** | Next.js (App Router), TypeScript | Renderizar telas, mediar a sessão, chamar a API | Regras de negócio, acesso direto a dados sensíveis |
| **API de Aplicação** | Python 3.12, FastAPI em funções serverless | Toda a lógica de domínio e as integrações externas | Renderizar HTML |
| **Redirecionador** | Função Python isolada | Resolver código curto, redirecionar, registrar clique | Qualquer coisa que atrase a resposta |
| **Agendador** | Vercel Cron | Invocar endpoints em horários definidos | Executar lógica |
| **PostgreSQL** | Supabase | Persistência transacional e histórica | Processamento |
| **Auth** | Supabase Auth | Emissão e validação de sessões | Autorização de negócio |
| **Redis** | Upstash | Trava de execução única, cache, contadores | Fonte de verdade |
| **QStash** | Upstash | Entregar jobs com retentativa e agendamento | Executar a publicação |

> O **Redirecionador** é um contêiner separado por decisão deliberada: é o único endpoint público, o mais sensível a latência (RNF-004) e precisa continuar funcionando mesmo que o painel esteja fora do ar (RNF-013). Isolá-lo evita que uma dependência do painel entre no seu caminho crítico.

---

## 1.3 Nível 3 — Componentes da API de Aplicação

```mermaid
flowchart TB
    subgraph entrada["Camada de entrada — funções serverless"]
        E1["/api/cron/collect"]
        E2["/api/cron/refresh-prices"]
        E3["/api/jobs/publish"]
        E4["/api/posts/*"]
        E5["/api/rules/*"]
        E6["/api/metrics/*"]
    end

    subgraph dominio["Camada de domínio"]
        C1["<b>Collector</b><br/>orquestra a coleta"]
        C2["<b>CurationEngine</b><br/>filtros, dedup, score"]
        C3["<b>ContentGenerator</b><br/>renderiza templates"]
        C4["<b>PostService</b><br/>transições de estado"]
        C5["<b>PublishService</b><br/>orquestra a publicação"]
        C6["<b>ShortenerService</b><br/>códigos e cliques"]
        C7["<b>MetricsService</b><br/>agregações"]
    end

    subgraph portas["Portas — interfaces"]
        P1["<i>ProductSource</i>"]
        P2["<i>Publisher</i>"]
        P3["<i>JobQueue</i>"]
        P4["<i>Repository</i>"]
    end

    subgraph adaptadores["Adaptadores"]
        A1["TikTokOfficialSource"]
        A2["TikTokAffiliateSource"]
        A3["MockSource"]
        A4["TelegramPublisher"]
        A5["TwitterQueuePublisher"]
        A6["QStashQueue"]
        A7["SupabaseRepository"]
    end

    E1 --> C1
    E2 --> C1
    E3 --> C5
    E4 --> C4
    E5 --> C2
    E6 --> C7

    C1 --> P1
    C1 --> C2
    C2 --> C3
    C3 --> C6
    C3 --> P4
    C4 --> P3
    C4 --> P4
    C5 --> P2
    C5 --> P4
    C6 --> P4
    C7 --> P4

    P1 -.-> A1
    P1 -.-> A2
    P1 -.-> A3
    P2 -.-> A4
    P2 -.-> A5
    P3 -.-> A6
    P4 -.-> A7
```

### Regra de dependência

As setas pontilhadas representam implementação de interface. O domínio depende apenas das portas — nunca dos adaptadores. Isso é o que permite trocar `TikTokOfficialSource` por `MockSource` sem tocar em `CurationEngine`, atendendo RF-002.

```
entrada  →  domínio  →  portas  ←  adaptadores
```

Nenhuma seta aponta do domínio para fora. Um adaptador pode ser reescrito por completo sem que nenhum teste de domínio precise mudar.

---

## 1.4 Mapeamento para o repositório

| Camada | Caminho |
|---|---|
| Entrada | `api/` |
| Domínio | `src/curation/`, `src/content/`, `src/services/` |
| Portas | `src/ports/` |
| Adaptadores | `src/sources/`, `src/publishers/`, `src/queue/`, `src/repositories/` |
| Painel | `web/` |

---

[← Índice da Arquitetura](../ARCHITECTURE.md) | Próximo: [2. Componentes →](02-componentes.md)
