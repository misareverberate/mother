[← 3a. Coleta e Curadoria](03a-uc-coleta-curadoria.md) | [Índice do SRS](../SRS.md) | Próximo: [3c. Publicação →](03c-uc-publicacao.md)

---

# 3b. Casos de Uso — Aprovação

Contém UC-04, UC-05, UC-06 e UC-07. Este é o ponto de controle humano do sistema: nada é publicado no Telegram sem passar por aqui.

---

## UC-04 — Revisar fila de aprovação

| Campo | Valor |
|---|---|
| **Ator primário** | AT-01 Administrador |
| **Atores secundários** | — |
| **Prioridade** | Must |
| **Gatilho** | Acesso à tela de fila no painel |

**Pré-condições**

1. O Administrador está autenticado (UC-12)

**Pós-condições**

1. O Administrador visualizou os posts pendentes e dispõe das informações necessárias para decidir

**Fluxo principal**

1. O Administrador acessa a tela de fila.
2. O sistema carrega os posts com status `PENDING`, ordenados por score decrescente.
3. Para cada post, o sistema exibe: título do produto, preço atual, preço anterior, percentual de desconto, avaliação, número de vendas, categoria, score, data de coleta e o link de destino.
4. O sistema exibe o texto do Telegram já renderizado, como o assinante o verá.
5. O sistema exibe o texto do Twitter/X com a contagem de caracteres.
6. O sistema exibe, quando aplicável, o aviso de que o produto já foi publicado anteriormente e em que data.
7. O Administrador percorre a lista e decide sobre cada post.

**Fluxos alternativos**

- **A1 — Filtrar e ordenar.** O Administrador altera a ordenação (score, desconto, preço, data) ou filtra por categoria e faixa de desconto. O sistema recarrega a lista conforme os critérios.
- **A2 — Fila vazia.** O sistema informa que não há posts pendentes e exibe a data e o resultado da última coleta.
- **A3 — Visualizar detalhes.** O Administrador abre um post individualmente para ver todos os campos coletados do produto.
- **A4 — Aprovação em lote.** O Administrador seleciona vários posts e aplica a mesma decisão a todos, respeitando o limite diário (RN-007).

**Fluxos de exceção**

- **E1 — Falha ao carregar a fila.** O sistema exibe mensagem de erro e oferece nova tentativa, sem perder o estado de filtros.
- **E2 — Post expirado durante a revisão.** Se um post atingir o prazo de expiração enquanto está na tela, o sistema o sinaliza como expirado ao tentar aprová-lo e recarrega a lista.

**Requisitos relacionados:** RF-020 a RF-023, RF-045 a RF-047, RN-009, RNF-003, RNF-020

---

## UC-05 — Aprovar post

| Campo | Valor |
|---|---|
| **Ator primário** | AT-01 Administrador |
| **Atores secundários** | AT-08 QStash |
| **Prioridade** | Must |
| **Gatilho** | Decisão de publicar um post pendente |

**Pré-condições**

1. O Administrador está autenticado
2. O post está com status `PENDING` e não expirou
3. O limite diário de publicações não foi atingido (RN-007)

**Pós-condições**

1. O post está com status `APPROVED`
2. Um job de publicação foi enfileirado no QStash
3. A decisão está registrada no histórico com autor e horário

**Fluxo principal**

1. O Administrador aciona a aprovação de um post.
2. O sistema verifica se o post ainda está `PENDING`.
3. O sistema verifica o limite diário de publicações.
4. O sistema altera o status do post para `APPROVED` e registra quem aprovou e quando.
5. O sistema enfileira no QStash um job de publicação contendo o identificador do post e uma chave de idempotência.
6. O sistema confirma a ação ao Administrador e remove o post da lista de pendentes.
7. A publicação propriamente dita ocorre em UC-08, de forma assíncrona.

**Fluxos alternativos**

- **A1 — Aprovar com agendamento.** O Administrador escolhe um horário futuro. O sistema define o status como `SCHEDULED` e enfileira o job com atraso até o horário escolhido.
- **A2 — Aprovar em lote.** O sistema repete os passos 2 a 5 para cada post selecionado, interrompendo quando o limite diário for atingido e informando quantos foram aprovados.
- **A3 — Aprovar somente para o Twitter/X.** O Administrador opta por não publicar no Telegram. O sistema marca o canal Telegram como dispensado e mantém apenas a pendência do X.

**Fluxos de exceção**

- **E1 — Post não está mais pendente.** O sistema informa que o post já foi processado por outra ação e recarrega a lista.
- **E2 — Limite diário atingido.** O sistema recusa a aprovação, informa o limite e oferece a opção de agendar para o dia seguinte.
- **E3 — Falha ao enfileirar no QStash.** O sistema reverte o status para `PENDING`, informa o erro e mantém o post na fila. Nenhuma aprovação fica registrada sem job correspondente.
- **E4 — Produto tornou-se indisponível.** Se a verificação de disponibilidade estiver habilitada e o produto não existir mais, o sistema recusa a aprovação e marca o post como `EXPIRED`.

**Requisitos relacionados:** RF-024 a RF-027, RF-029, RN-006, RN-007, RN-017, RNF-005, RNF-014

---

## UC-06 — Rejeitar post

| Campo | Valor |
|---|---|
| **Ator primário** | AT-01 Administrador |
| **Atores secundários** | — |
| **Prioridade** | Must |
| **Gatilho** | Decisão de não publicar um post pendente |

**Pré-condições**

1. O Administrador está autenticado
2. O post está com status `PENDING`

**Pós-condições**

1. O post está com status `REJECTED`
2. O motivo da rejeição está registrado
3. O produto correspondente não retorna à fila enquanto a rejeição estiver vigente (RN-016)

**Fluxo principal**

1. O Administrador aciona a rejeição de um post.
2. O sistema oferece uma lista de motivos: produto ruim, preço enganoso, categoria indesejada, texto inadequado, duplicado, outro.
3. O Administrador seleciona um motivo e, opcionalmente, escreve uma observação.
4. O sistema altera o status para `REJECTED` e registra motivo, observação, autor e horário.
5. O sistema registra o produto na lista de bloqueio conforme a política do motivo escolhido.
6. O sistema remove o post da lista de pendentes.

**Fluxos alternativos**

- **A1 — Rejeitar e bloquear permanentemente.** O Administrador marca a opção de nunca mais sugerir aquele produto. O sistema registra bloqueio sem prazo.
- **A2 — Rejeitar e bloquear a loja.** O Administrador estende o bloqueio a todos os produtos do mesmo vendedor.
- **A3 — Rejeição em lote.** O mesmo motivo é aplicado a vários posts selecionados.

**Fluxos de exceção**

- **E1 — Post já processado.** O sistema informa e recarrega a lista.

**Requisitos relacionados:** RF-028, RN-016, RN-019

---

## UC-07 — Editar texto do post

| Campo | Valor |
|---|---|
| **Ator primário** | AT-01 Administrador |
| **Atores secundários** | — |
| **Prioridade** | Should |
| **Gatilho** | Necessidade de ajustar o texto gerado antes de publicar |

**Pré-condições**

1. O Administrador está autenticado
2. O post está com status `PENDING`

**Pós-condições**

1. Os textos do post refletem a edição
2. O texto original permanece registrado para comparação
3. O post continua `PENDING`, aguardando aprovação

**Fluxo principal**

1. O Administrador abre o post em modo de edição.
2. O sistema exibe os campos editáveis: texto do Telegram e texto do Twitter/X.
3. O Administrador altera o conteúdo.
4. O sistema valida em tempo real o limite de caracteres do Twitter/X e a validade da formatação do Telegram.
5. O sistema exibe a pré-visualização atualizada.
6. O Administrador salva.
7. O sistema grava o texto editado, preserva o texto original e marca o post como editado manualmente.

**Fluxos alternativos**

- **A1 — Restaurar original.** O Administrador descarta as alterações e o sistema restaura o texto gerado.
- **A2 — Regerar a partir do template.** O sistema renderiza novamente o post com o template ativo, substituindo o conteúdo atual.
- **A3 — Editar e aprovar em uma ação.** O sistema salva e encadeia UC-05.

**Fluxos de exceção**

- **E1 — Formatação inválida do Telegram.** O sistema impede o salvamento e indica o trecho problemático, evitando falha de envio por caractere não escapado.
- **E2 — Limite de caracteres excedido no X.** O sistema impede o salvamento do campo e mostra quantos caracteres excedem.
- **E3 — Link removido pelo Administrador.** O sistema alerta que o post perderá o rastreamento e exige confirmação explícita.

**Requisitos relacionados:** RF-030 a RF-032, RN-012, RN-013, RN-021, RNF-021

---

[← 3a. Coleta e Curadoria](03a-uc-coleta-curadoria.md) | [Índice do SRS](../SRS.md) | Próximo: [3c. Publicação →](03c-uc-publicacao.md)
