[← 3b. Aprovação](03b-uc-aprovacao.md) | [Índice do SRS](../SRS.md) | Próximo: [3d. Plataforma →](03d-uc-plataforma.md)

---

# 3c. Casos de Uso — Publicação

Contém UC-08, UC-09 e UC-14. Cobre a entrega efetiva do conteúdo aos canais e o tratamento de falhas.

---

## UC-08 — Publicar no Telegram

| Campo | Valor |
|---|---|
| **Ator primário** | AT-08 QStash |
| **Atores secundários** | AT-07 Telegram Bot API |
| **Prioridade** | Must |
| **Gatilho** | Entrega de um job de publicação pelo QStash |

**Pré-condições**

1. Existe um post com status `APPROVED` ou `SCHEDULED` cujo horário chegou
2. O bot é membro do grupo de destino e tem permissão para enviar mensagens

**Pós-condições**

1. A mensagem está publicada no grupo do Telegram
2. O post está com status `PUBLISHED`, com o identificador da mensagem e o horário de publicação registrados
3. O produto está registrado como publicado, iniciando a contagem da janela de reposição

**Fluxo principal**

1. O QStash chama o endpoint de publicação enviando o job.
2. O sistema valida a assinatura da requisição e rejeita chamadas não autenticadas.
3. O sistema verifica a chave de idempotência: se o job já foi processado, responde sucesso sem republicar.
4. O sistema carrega o post e confirma que ele está em estado publicável.
5. O sistema envia a mensagem ao grupo do Telegram, com o texto do post e a pré-visualização de link habilitada.
6. O Telegram confirma o envio e retorna o identificador da mensagem.
7. O sistema grava status `PUBLISHED`, o identificador da mensagem, o horário e o canal.
8. O sistema atualiza o registro de última publicação do produto.
9. O sistema responde sucesso ao QStash.

**Fluxos alternativos**

- **A1 — Post fixado no grupo.** Se a configuração determinar que ofertas acima de um percentual de desconto devem ser fixadas, o sistema executa a fixação após o envio.
- **A2 — Publicação já efetuada.** Reentrega do mesmo job pelo QStash resulta em resposta de sucesso sem novo envio.

**Fluxos de exceção**

- **E1 — Assinatura inválida.** O sistema responde erro de autorização e não processa.
- **E2 — Limite de taxa do Telegram.** O sistema responde ao QStash com código que solicita nova tentativa, respeitando o tempo de espera indicado pelo Telegram.
- **E3 — Erro temporário do Telegram.** O sistema responde solicitando retentativa. O QStash reexecuta conforme a política configurada.
- **E4 — Erro permanente.** Em casos como bot removido do grupo, grupo inexistente ou mensagem com formatação inválida, o sistema marca o post como `FAILED`, registra a mensagem de erro, responde sucesso ao QStash para interromper as retentativas e alerta o Administrador.
- **E5 — Esgotamento das retentativas.** O QStash encaminha o job à fila de mensagens mortas. O sistema marca o post como `FAILED` e alerta o Administrador.
- **E6 — Post em estado inesperado.** Se o post não estiver `APPROVED` nem `SCHEDULED`, o sistema registra o ocorrido e responde sucesso sem publicar.

**Requisitos relacionados:** RF-033 a RF-038, RN-020, RN-022, RNF-006, RNF-011, RNF-015

---

## UC-09 — Concluir post do Twitter/X

| Campo | Valor |
|---|---|
| **Ator primário** | AT-01 Administrador |
| **Atores secundários** | AT-04 Seguidor no X |
| **Prioridade** | Must |
| **Gatilho** | Intenção de publicar manualmente no Twitter/X |

**Pré-condições**

1. O Administrador está autenticado
2. Existe ao menos um post com pendência no canal Twitter/X

**Pós-condições**

1. O post está registrado como publicado no Twitter/X, com data e, opcionalmente, a URL do tuíte
2. O post deixa de aparecer entre as pendências do X

**Fluxo principal**

1. O Administrador acessa a tela de pendências do Twitter/X.
2. O sistema lista os posts cujo texto do X ainda não foi publicado, ordenados por data de aprovação.
3. Para cada item, o sistema exibe o texto pronto, a contagem de caracteres e um botão de cópia.
4. O Administrador aciona a cópia; o sistema coloca o texto na área de transferência e confirma visualmente.
5. O Administrador publica o texto no Twitter/X por fora do sistema.
6. O Administrador marca o item como publicado no painel.
7. O sistema registra a publicação com horário e autor.

**Fluxos alternativos**

- **A1 — Registrar a URL do tuíte.** O Administrador cola a URL do tuíte publicado. O sistema valida o formato e a armazena para consulta posterior.
- **A2 — Editar antes de copiar.** O Administrador ajusta o texto na própria tela; a validação de limite de caracteres se aplica.
- **A3 — Dispensar o canal.** O Administrador decide não publicar no X. O sistema marca o canal como dispensado, com registro do motivo.
- **A4 — Publicar apenas no X.** Um post cuja publicação no Telegram foi dispensada aparece somente nesta fila.

**Fluxos de exceção**

- **E1 — Falha na cópia automática.** O sistema exibe o texto em um campo selecionável para cópia manual.
- **E2 — Item já concluído em outra aba.** O sistema informa e atualiza a lista.

**Requisitos relacionados:** RF-039 a RF-044, RN-013, RN-023, RNF-022

---

## UC-14 — Reprocessar publicação com falha

| Campo | Valor |
|---|---|
| **Ator primário** | AT-01 Administrador |
| **Atores secundários** | AT-08 QStash, AT-07 Telegram Bot API |
| **Prioridade** | Should |
| **Gatilho** | Existência de posts com status `FAILED` |

**Pré-condições**

1. O Administrador está autenticado
2. Existe ao menos um post com status `FAILED`

**Pós-condições**

1. O post foi republicado com sucesso, ou permanece `FAILED` com o novo erro registrado, ou foi descartado por decisão do Administrador

**Fluxo principal**

1. O Administrador acessa a tela de falhas.
2. O sistema lista os posts `FAILED` com a mensagem de erro, o número de tentativas e o horário da última tentativa.
3. O Administrador identifica a causa e, se necessário, corrige a configuração ou o texto.
4. O Administrador aciona o reprocessamento.
5. O sistema gera uma nova chave de idempotência e enfileira novo job de publicação.
6. UC-08 é executado normalmente.

**Fluxos alternativos**

- **A1 — Descartar o post.** O Administrador decide não publicar. O sistema marca o post como `DISCARDED`.
- **A2 — Editar antes de reprocessar.** O Administrador corrige o texto e o sistema valida a formatação antes de reenfileirar.
- **A3 — Reprocessamento em lote.** Vários posts que falharam pela mesma causa são reenfileirados de uma vez, com espaçamento entre os jobs para respeitar limites de taxa.

**Fluxos de exceção**

- **E1 — Falha recorrente.** Após o número configurado de reprocessamentos manuais sem sucesso, o sistema desabilita o botão de reprocessar e recomenda investigação da causa.
- **E2 — Produto expirado.** Se o produto não estiver mais disponível, o sistema recusa o reprocessamento e sugere o descarte.

**Requisitos relacionados:** RF-034, RF-037, RF-038, RNF-016, RNF-024

---

[← 3b. Aprovação](03b-uc-aprovacao.md) | [Índice do SRS](../SRS.md) | Próximo: [3d. Plataforma →](03d-uc-plataforma.md)
