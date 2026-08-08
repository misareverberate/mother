[← 6. Regras de Negócio](06-regras-de-negocio.md) | [Índice do SRS](../SRS.md)

---

# 7. Rastreabilidade

As matrizes abaixo garantem que nenhum requisito ficou órfão e que nenhum caso de uso ficou sem implementação prevista. Toda alteração no SRS deve ser refletida aqui.

---

## 7.1 Casos de uso → Requisitos funcionais

| Caso de uso | Requisitos funcionais |
|---|---|
| UC-01 Coletar produtos | RF-001, RF-002, RF-003, RF-004, RF-005, RF-006 |
| UC-02 Aplicar curadoria | RF-007, RF-008, RF-009, RF-010, RF-011, RF-012, RF-013 |
| UC-03 Gerar conteúdo | RF-014, RF-015, RF-016, RF-017, RF-018, RF-019, RF-042 |
| UC-04 Revisar fila | RF-020, RF-021, RF-022, RF-023 |
| UC-05 Aprovar post | RF-024, RF-025, RF-026, RF-027 |
| UC-06 Rejeitar post | RF-028 |
| UC-07 Editar post | RF-029, RF-030, RF-031, RF-032 |
| UC-08 Publicar no Telegram | RF-033, RF-034, RF-035, RF-036, RF-037, RF-038 |
| UC-09 Concluir post do X | RF-039, RF-040, RF-041 |
| UC-10 Redirecionar link curto | RF-043, RF-044, RF-045, RF-047 |
| UC-11 Configurar regras | RF-051, RF-052, RF-053, RF-054 |
| UC-12 Autenticar | RF-048, RF-049, RF-050 |
| UC-13 Consultar métricas | RF-046, RF-055, RF-056, RF-058 |
| UC-14 Reprocessar falha | RF-034, RF-037, RF-038 |
| UC-15 Detectar queda de preço | RF-005, RF-012 |
| *(transversal)* | RF-057 |

**Verificação:** todos os 58 RF aparecem em ao menos uma linha. Todos os 15 UC possuem ao menos um RF.

---

## 7.2 Regras de negócio → Requisitos funcionais

| Regra | Requisitos que a implementam |
|---|---|
| RN-001 Desconto mínimo | RF-007, RF-051 |
| RN-002 Faixa de preço | RF-008, RF-051 |
| RN-003 Janela de reposição | RF-012, RF-051 |
| RN-004 Exceção por queda de preço | RF-012, RF-018 |
| RN-005 Cálculo do score | RF-013, RF-051 |
| RN-006 Horários preferenciais | RF-026 |
| RN-007 Limite diário | RF-024, RF-025 |
| RN-008 Itens por execução | RF-013 |
| RN-009 Expiração de pendente | RF-020 |
| RN-010 Teto da fila | RF-013 |
| RN-011 Dados ausentes | RF-009 |
| RN-012 Composição do post | RF-014, RF-015 |
| RN-013 Truncamento para o X | RF-017, RF-030, RF-031 |
| RN-014 Posts sem mídia | RF-014 |
| RN-015 Template por tipo | RF-018 |
| RN-016 Efeito da rejeição | RF-028 |
| RN-017 Estados do post | RF-024, RF-026, RF-028, RF-036 |
| RN-018 Execução única de coleta | RF-001 |
| RN-019 Palavras bloqueadas | RF-010, RF-051 |
| RN-020 Início da janela | RF-036 |
| RN-021 Sinalização comercial | RF-019 |
| RN-022 Idempotência | RF-034 |
| RN-023 Independência entre canais | RF-039, RF-041 |
| RN-024 Deduplicação de cliques | RF-044, RF-046 |

**Verificação:** todas as 24 RN possuem ao menos um RF correspondente.

---

## 7.3 Requisitos → Componentes de arquitetura

| Componente | Requisitos atendidos |
|---|---|
| **Coletor** (`api/cron/collect.py`, `src/sources/`) | RF-001 a RF-006, RNF-001, RNF-002, RNF-009, RNF-010 |
| **Curadoria** (`src/curation/`) | RF-007 a RF-013, RNF-032 |
| **Gerador de conteúdo** (`src/content/`) | RF-014 a RF-019, RNF-021 |
| **Fila e aprovação** (`web/app/queue/`, API de posts) | RF-020 a RF-032, RNF-003, RNF-005, RNF-014, RNF-020 |
| **Publicador Telegram** (`api/jobs/publish.py`, `src/publishers/`) | RF-033 a RF-038, RNF-006, RNF-011, RNF-015, RNF-016 |
| **Fila Twitter/X** (`web/app/twitter/`) | RF-039 a RF-041, RNF-022 |
| **Encurtador** (`api/r/`, `src/shortener/`) | RF-042 a RF-047, RNF-004, RNF-012, RNF-013 |
| **Autenticação** (Supabase Auth + middleware) | RF-048 a RF-050, RNF-025, RNF-026 |
| **Configuração** (`web/app/rules/`) | RF-051 a RF-054, RNF-023 |
| **Métricas** (`web/app/analytics/`) | RF-055, RF-056, RF-058, RNF-007 |
| **Observabilidade** (transversal) | RF-057, RNF-030 |
| **Infraestrutura** (Vercel, Supabase, QStash) | RNF-008, RNF-027, RNF-028, RNF-029, RNF-031 |

Os componentes estão detalhados em [`ARCHITECTURE.md`](../ARCHITECTURE.md).

---

## 7.4 Requisitos por prioridade

### Must — escopo mínimo do MVP

RF-001, RF-002, RF-003, RF-004, RF-006, RF-007, RF-008, RF-009, RF-010, RF-012, RF-014, RF-016, RF-017, RF-019, RF-020, RF-021, RF-024, RF-027, RF-028, RF-031, RF-033, RF-034, RF-035, RF-036, RF-037, RF-039, RF-040, RF-041, RF-042, RF-043, RF-044, RF-047, RF-048, RF-049, RF-050

**Total: 35 requisitos.** Este conjunto entrega o fluxo completo de ponta a ponta.

### Should — fase 2

RF-005, RF-011, RF-013, RF-015, RF-022, RF-023, RF-029, RF-030, RF-038, RF-045, RF-046, RF-051, RF-052, RF-055, RF-057

**Total: 15 requisitos.**

### Could — fase 3

RF-018, RF-025, RF-026, RF-032, RF-053, RF-054, RF-056, RF-058

**Total: 8 requisitos.**

O detalhamento das fases e a ordem de implementação estão em [`ROADMAP.md`](../ROADMAP.md).

---

## 7.5 Riscos mapeados a requisitos

| Risco | Probabilidade | Impacto | Mitigação | Requisitos |
|---|---|---|---|---|
| Acesso à API do TikTok Shop não é aprovado | Média | Crítico | Abstração `ProductSource` com implementação simulada permite desenvolver e testar tudo o mais | RF-002 |
| Coleta estoura o tempo de execução da função | Alta | Alto | Paginação retomável com preservação de cursor | RF-003, RNF-001, RNF-009 |
| Publicação duplicada por reentrega de job | Média | Médio | Chave de idempotência verificada antes do envio | RF-034, RN-022, RNF-015 |
| Falha de envio por caractere não escapado | Alta | Médio | Escaping automático e validação bloqueante na edição | RF-016, RF-031, RNF-021 |
| Excesso de posts esvazia o grupo | Média | Alto | Limite diário e janela horária de publicação | RN-006, RN-007 |
| Cold start atrasa a publicação | Média | Baixo | Publicação assíncrona; o prazo de 60 s absorve a latência | RNF-006, RNF-015 |
| Volume de cliques excede a camada gratuita | Baixa | Médio | Agregação de cliques e política de retenção de dados brutos | RNF-031 |
| Post publicado com oferta já encerrada | Média | Médio | Expiração automática de pendentes | RN-009 |
| Acesso indevido ao painel | Baixa | Crítico | Autenticação obrigatória, lista de autorizados e segurança em nível de linha | RF-048, RF-050, RNF-025, RNF-029 |

---

## 7.6 Cobertura de verificação

| Tipo de verificação | Requisitos cobertos |
|---|---|
| Testes unitários | RF-007 a RF-013, RF-016, RF-017, RF-042, RNF-032 |
| Testes de integração | RF-001 a RF-006, RF-033 a RF-038, RF-043, RF-044 |
| Testes de interface | RF-020 a RF-032, RF-039 a RF-041, RF-048 a RF-054 |
| Testes de carga | RNF-001 a RNF-007 |
| Revisão de código | RNF-008, RNF-028, RNF-030 |
| Verificação manual | RNF-017 a RNF-024 |
| Monitoramento em produção | RNF-006, RNF-031 |

---

[← 6. Regras de Negócio](06-regras-de-negocio.md) | [Índice do SRS](../SRS.md)
