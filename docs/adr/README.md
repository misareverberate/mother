# Architecture Decision Records

Registros de decisões arquiteturais significativas: o contexto em que foram tomadas, as alternativas consideradas e as consequências aceitas.

Um ADR não é documentação de como o sistema funciona — isso está em [`ARCHITECTURE.md`](../ARCHITECTURE.md). Um ADR responde a "por que assim, e não de outro jeito", para quem chegar depois e questionar a escolha.

---

## Índice

| ADR | Título | Status | Data |
|---|---|---|---|
| [0001](0001-fonte-de-dados-tiktok-shop.md) | Abstrair a fonte de dados do TikTok Shop | Aceito | 2026-08-08 |
| [0002](0002-plataforma-serverless-vercel.md) | Executar em plataforma serverless (Vercel) | Aceito | 2026-08-08 |
| [0003](0003-fila-qstash-push-http.md) | Usar QStash com entrega por push HTTP | Aceito | 2026-08-08 |
| [0004](0004-stack-hibrida-python-nextjs.md) | Stack híbrida: Python na API, Next.js no painel | Aceito | 2026-08-08 |
| [0005](0005-posts-somente-texto.md) | Posts somente com texto, sem imagens | Aceito | 2026-08-08 |
| [0006](0006-encurtador-proprio.md) | Encurtador de links próprio | Aceito | 2026-08-08 |
| [0007](0007-aprovacao-humana-obrigatoria.md) | Aprovação humana obrigatória antes de publicar | Aceito | 2026-08-08 |

---

## Status possíveis

| Status | Significado |
|---|---|
| **Proposto** | Em discussão, ainda não vale |
| **Aceito** | Em vigor |
| **Substituído** | Trocado por outro ADR, que deve ser referenciado |
| **Descontinuado** | Não vale mais, e nada o substituiu |

Um ADR aceito nunca é apagado nem editado no mérito. Se a decisão muda, cria-se um novo ADR que substitui o anterior. O histórico do raciocínio é o valor do registro.

---

## Template

```markdown
# ADR-NNNN — Título no imperativo

**Status:** Proposto | Aceito | Substituído por ADR-NNNN | Descontinuado
**Data:** AAAA-MM-DD
**Decisores:** nomes

## Contexto
Qual é o problema, quais forças atuam sobre ele e o que restringe as soluções.

## Decisão
O que foi decidido, em uma frase, seguida do detalhamento.

## Alternativas consideradas
Cada alternativa com seus prós, contras e o motivo da rejeição.

## Consequências
### Positivas
### Negativas
### Neutras

## Requisitos afetados
Lista de RF, RNF, RN e restrições relacionados.

## Revisão
Em que condições esta decisão deve ser reavaliada.
```
