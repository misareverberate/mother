[← 1. Visão C4](01-visao-c4.md) | [Índice da Arquitetura](../ARCHITECTURE.md) | Próximo: [3. Fluxos →](03-fluxos.md)

---

# 2. Componentes

Cada componente é descrito por responsabilidade, contrato, dependências e o que explicitamente **não** faz. A última coluna é tão importante quanto a primeira: é o que impede o módulo de crescer para fora do seu papel.

---

## 2.1 Portas (interfaces)

As quatro interfaces abaixo formam a fronteira do domínio. Assinaturas em pseudocódigo Python.

### `ProductSource`

```python
class ProductSource(Protocol):
    def fetch_page(self, cursor: str | None, filters: SourceFilters) -> ProductPage:
        """Retorna uma página de produtos e o cursor para a próxima."""

    def fetch_by_id(self, external_id: str) -> RawProduct | None:
        """Consulta um produto específico. Usado na reavaliação de preços."""

    def build_affiliate_url(self, product: RawProduct) -> str:
        """Devolve a URL de destino com atribuição de comissão."""
```

| Aspecto | Definição |
|---|---|
| **Implementações** | `TikTokOfficialSource`, `TikTokAffiliateSource`, `MockSource` |
| **Seleção** | Variável de ambiente `PRODUCT_SOURCE` |
| **Contrato de erro** | Lança `SourceAuthError`, `SourceRateLimitError` ou `SourceUnavailableError`. Nunca deixa vazar exceção da biblioteca HTTP |
| **Não faz** | Filtragem de negócio, persistência, decisão sobre o que publicar |
| **Requisitos** | RF-002, RF-004 |

> Esta é a peça central da estratégia de risco do projeto. Enquanto o acesso à API oficial não está garantido (RE-05), `MockSource` permite construir e testar 100% do restante do sistema. Ver [ADR-0001](../adr/0001-fonte-de-dados-tiktok-shop.md).

### `Publisher`

```python
class Publisher(Protocol):
    channel: Channel

    def publish(self, post: Post, idempotency_key: str) -> PublishResult:
        """Entrega o post ao canal. Deve ser idempotente."""
```

| Aspecto | Definição |
|---|---|
| **Implementações** | `TelegramPublisher` (envio real), `TwitterQueuePublisher` (apenas marca como pendente de ação manual) |
| **Contrato de erro** | `PublishResult` distingue sucesso, erro temporário e erro permanente. A distinção governa a retentativa (RF-037) |
| **Não faz** | Decidir se deve publicar, montar texto, alterar estado do post |
| **Requisitos** | RF-033, RF-034, RF-036, RF-037 |

> `TwitterQueuePublisher` implementa a mesma interface embora não envie nada. Isso mantém o `PublishService` alheio à diferença entre canal automático e manual — e deixa o caminho pronto caso a API do X passe a ser contratada.

### `JobQueue`

```python
class JobQueue(Protocol):
    def enqueue(self, job: Job, delay_seconds: int = 0) -> JobId: ...
    def verify_signature(self, headers: dict, body: bytes) -> bool: ...
```

| Aspecto | Definição |
|---|---|
| **Implementação** | `QStashQueue` |
| **Não faz** | Executar o job. Quem executa é o endpoint que o QStash chama |
| **Requisitos** | RF-033, RF-035 |

### `Repository`

Um repositório por agregado: `ProductRepository`, `PostRepository`, `ClickRepository`, `RulesRepository`, `RunRepository`.

| Aspecto | Definição |
|---|---|
| **Implementação** | `SupabaseRepository` |
| **Não faz** | Regra de negócio. Consultas retornam dados, não decisões |
| **Requisitos** | Transversal |

---

## 2.2 Componentes de domínio

### Collector

| Aspecto | Definição |
|---|---|
| **Responsabilidade** | Orquestrar a coleta: paginar a fonte, normalizar, persistir, controlar o orçamento de tempo |
| **Entrada** | Regras ativas, cursor da execução anterior |
| **Saída** | Lista de produtos normalizados + registro de execução |
| **Dependências** | `ProductSource`, `ProductRepository`, `RunRepository`, `CurationEngine` |
| **Não faz** | Decidir o que é boa oferta — isso é da curadoria |
| **Requisitos** | RF-001 a RF-006 |

**Controle de orçamento de tempo.** Antes de buscar cada nova página, o Collector compara o tempo decorrido com o limite da função menos a margem de segurança (RNF-001). Se o restante for insuficiente, interrompe, grava o cursor e encerra como `PARTIAL`. É o mecanismo que permite coletar catálogos maiores que uma única invocação suporta.

**Trava de execução única.** Antes de iniciar, adquire uma trava no Redis com tempo de expiração. Se não conseguir, encerra sem processar (RN-018). A expiração garante que uma função que morreu não bloqueie as próximas para sempre.

### CurationEngine

| Aspecto | Definição |
|---|---|
| **Responsabilidade** | Aplicar filtros, deduplicar, calcular score, ordenar e selecionar |
| **Entrada** | Produtos normalizados + regras ativas |
| **Saída** | Produtos selecionados, ordenados, e registro dos motivos de descarte |
| **Dependências** | `ProductRepository`, `PostRepository` (para deduplicação) |
| **Não faz** | Acesso à rede, geração de texto |
| **Requisitos** | RF-007 a RF-013 |

**Ordem dos filtros importa.** Os filtros são aplicados do mais barato ao mais caro: primeiro os que dependem apenas do produto em memória (categoria, palavra bloqueada, preço, desconto, avaliação, vendas), por último a deduplicação, que exige consulta ao banco. Descartar cedo evita consultas desnecessárias.

**Componente puro.** Não faz entrada nem saída além dos repositórios, o que o torna o alvo natural da cobertura de testes exigida por RNF-032.

### ContentGenerator

| Aspecto | Definição |
|---|---|
| **Responsabilidade** | Renderizar os textos de Telegram e Twitter/X a partir dos templates |
| **Entrada** | Produto selecionado, template ativo, link curto |
| **Saída** | Textos prontos, com escaping aplicado e limite de caracteres respeitado |
| **Dependências** | `ShortenerService`, `TemplateRepository` |
| **Não faz** | Publicar, decidir o que gerar |
| **Requisitos** | RF-014 a RF-019 |

**Escaping é responsabilidade sua e de mais ninguém.** O texto que sai daqui já está seguro para envio. `TelegramPublisher` não reescapa nada — se reescapasse, produziria escaping duplo. Essa fronteira precisa estar clara porque títulos de produto no TikTok Shop são notoriamente cheios de caracteres reservados.

### PostService

| Aspecto | Definição |
|---|---|
| **Responsabilidade** | Guardar as transições de estado do post e garantir que só as válidas ocorram |
| **Entrada** | Comandos: aprovar, rejeitar, editar, agendar, descartar |
| **Saída** | Post atualizado + job enfileirado quando aplicável |
| **Dependências** | `PostRepository`, `JobQueue` |
| **Não faz** | Publicar diretamente |
| **Requisitos** | RF-024 a RF-032 |

**Guardião da máquina de estados.** Toda transição passa por aqui e é validada contra RN-017. Nenhum outro componente altera o status de um post.

**Atomicidade da aprovação.** Aprovar envolve dois efeitos: mudar o status e enfileirar o job. Como não há transação distribuída entre Postgres e QStash, a ordem é: alterar o status, enfileirar, e reverter o status se o enfileiramento falhar. Isso satisfaz RF-027 e RNF-014. A janela de inconsistência existe, mas é de milissegundos e o pior caso — post aprovado sem job — é detectável pela reconciliação descrita na seção 5.

### PublishService

| Aspecto | Definição |
|---|---|
| **Responsabilidade** | Executar o job de publicação e registrar o resultado |
| **Entrada** | Job recebido do QStash |
| **Saída** | Post publicado ou falha registrada |
| **Dependências** | `Publisher`, `PostRepository`, `ProductRepository` |
| **Não faz** | Decidir se o post deve ser publicado — isso já foi decidido na aprovação |
| **Requisitos** | RF-033 a RF-038 |

**Verificação de idempotência antes de qualquer efeito.** A chave de idempotência é consultada antes do envio. Se já processada, responde sucesso sem publicar (RN-022). É o que garante RNF-015 diante de reentregas do QStash.

### ShortenerService

| Aspecto | Definição |
|---|---|
| **Responsabilidade** | Gerar códigos curtos, resolver códigos e registrar cliques |
| **Entrada** | URL de destino (geração) ou código (resolução) |
| **Saída** | Código único ou URL de destino |
| **Dependências** | `ShortLinkRepository`, `ClickRepository`, Redis |
| **Não faz** | Nada que atrase o redirecionamento |
| **Requisitos** | RF-042 a RF-047 |

**Códigos não sequenciais.** Gerados aleatoriamente a partir de um alfabeto sem caracteres ambíguos, com verificação de colisão. Códigos sequenciais permitiriam a terceiros enumerar todas as ofertas e inferir o volume de operação.

**Registro fora do caminho crítico.** A resposta de redirecionamento é emitida primeiro; o clique é gravado depois. Falha no registro não afeta o visitante (RNF-012).

### MetricsService

| Aspecto | Definição |
|---|---|
| **Responsabilidade** | Calcular e servir as agregações de desempenho |
| **Dependências** | `ClickRepository`, `PostRepository` |
| **Não faz** | Escrever eventos |
| **Requisitos** | RF-055, RF-056, RF-058 |

Consultas sobre períodos longos usam agregações diárias pré-calculadas, não a tabela bruta de cliques (RNF-007).

---

## 2.3 Componentes do painel

| Tela | Rota | Requisitos |
|---|---|---|
| Login | `/login` | RF-048, RF-049, RF-050 |
| Fila de aprovação | `/queue` | RF-020 a RF-028 |
| Edição de post | `/queue/[id]` | RF-029 a RF-032 |
| Pendências do Twitter/X | `/twitter` | RF-039, RF-040, RF-041 |
| Falhas | `/failed` | RF-038, UC-14 |
| Regras de curadoria | `/rules` | RF-051 a RF-054 |
| Métricas | `/analytics` | RF-055, RF-056, RF-058 |
| Execuções | `/runs` | RF-006, RF-011 |

**Fronteira painel/API.** O painel não contém regra de negócio. A validação no cliente existe para dar retorno imediato ao usuário, mas é sempre repetida no servidor — a do cliente é conveniência, a do servidor é a que vale (RNF-025).

---

## 2.4 Matriz de dependências

| De → Para | ProductSource | Publisher | JobQueue | Repository | Redis |
|---|:---:|:---:|:---:|:---:|:---:|
| Collector | ✓ | | | ✓ | ✓ |
| CurationEngine | | | | ✓ | |
| ContentGenerator | | | | ✓ | |
| PostService | | | ✓ | ✓ | |
| PublishService | | ✓ | | ✓ | |
| ShortenerService | | | | ✓ | ✓ |
| MetricsService | | | | ✓ | |

Nenhum componente de domínio depende de outro componente de domínio, exceto pelo encadeamento do pipeline: `Collector → CurationEngine → ContentGenerator`. Essa cadeia é intencional e unidirecional.

---

[← 1. Visão C4](01-visao-c4.md) | [Índice da Arquitetura](../ARCHITECTURE.md) | Próximo: [3. Fluxos →](03-fluxos.md)
