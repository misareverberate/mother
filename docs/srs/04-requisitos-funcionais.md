[← 3d. Plataforma](03d-uc-plataforma.md) | [Índice do SRS](../SRS.md) | Próximo: [5. Requisitos Não Funcionais →](05-requisitos-nao-funcionais.md)

---

# 4. Requisitos Funcionais

58 requisitos agrupados em dez módulos. Cada requisito é verificável de forma independente.

| Módulo | Faixa | Qtd |
|---|---|---|
| [4.1 Coleta](#41-coleta) | RF-001 a RF-006 | 6 |
| [4.2 Curadoria](#42-curadoria) | RF-007 a RF-013 | 7 |
| [4.3 Geração de conteúdo](#43-geração-de-conteúdo) | RF-014 a RF-019 | 6 |
| [4.4 Fila de aprovação](#44-fila-de-aprovação) | RF-020 a RF-028 | 9 |
| [4.5 Edição](#45-edição) | RF-029 a RF-032 | 4 |
| [4.6 Publicação no Telegram](#46-publicação-no-telegram) | RF-033 a RF-038 | 6 |
| [4.7 Canal Twitter/X](#47-canal-twitterx) | RF-039 a RF-041 | 3 |
| [4.8 Encurtador e rastreamento](#48-encurtador-e-rastreamento) | RF-042 a RF-047 | 6 |
| [4.9 Painel e autenticação](#49-painel-e-autenticação) | RF-048 a RF-054 | 7 |
| [4.10 Observabilidade e métricas](#410-observabilidade-e-métricas) | RF-055 a RF-058 | 4 |

---

## 4.1 Coleta

### RF-001 — Coleta agendada
O sistema deve executar a coleta de produtos automaticamente em horários definidos por configuração de agendamento, sem intervenção humana.
**Prioridade:** Must · **UC:** UC-01
**Critério de aceite:** dado um agendamento configurado, quando o horário é atingido, então um registro de execução é criado e produtos são coletados.

### RF-002 — Abstração da fonte de dados
O sistema deve acessar a fonte de produtos exclusivamente através da interface `ProductSource`, de modo que a substituição da implementação concreta não exija alteração em nenhum outro módulo.
**Prioridade:** Must · **UC:** UC-01
**Critério de aceite:** trocar a implementação por `MockSource` via variável de ambiente faz todo o pipeline funcionar sem alteração de código.

### RF-003 — Paginação resiliente
O sistema deve percorrer os resultados paginados da fonte e, ao se aproximar do limite de tempo de execução, interromper a paginação preservando o cursor da última página processada.
**Prioridade:** Must · **UC:** UC-01 (A1)
**Critério de aceite:** uma execução encerrada como `PARTIAL` retoma da página seguinte na execução posterior, sem reprocessar as anteriores.

### RF-004 — Normalização de produtos
O sistema deve converter os dados brutos da fonte para um modelo interno contendo, no mínimo: identificador externo, título, descrição, preço atual, preço original, moeda, percentual de desconto, avaliação média, número de avaliações, número de vendas, categoria, identificador do vendedor, URL do produto e URL de afiliado.
**Prioridade:** Must · **UC:** UC-01
**Critério de aceite:** todo produto persistido possui os campos obrigatórios preenchidos ou explicitamente nulos, jamais com formato inconsistente.

### RF-005 — Histórico de preços
O sistema deve registrar uma nova entrada no histórico de preços sempre que o preço de um produto conhecido diferir do último valor registrado.
**Prioridade:** Should · **UC:** UC-01, UC-15
**Critério de aceite:** consultar o histórico de um produto retorna a sequência cronológica de preços observados.

### RF-006 — Registro de execução
O sistema deve manter um registro de cada execução de coleta contendo horário de início e fim, status final, quantidade de produtos obtidos, filtrados, deduplicados e enfileirados, e a mensagem de erro quando houver.
**Prioridade:** Must · **UC:** UC-01
**Critério de aceite:** toda execução, bem ou malsucedida, produz exatamente um registro consultável no painel.

---

## 4.2 Curadoria

### RF-007 — Filtro por desconto mínimo
O sistema deve descartar produtos cujo percentual de desconto seja inferior ao valor configurado.
**Prioridade:** Must · **UC:** UC-02 · **RN:** RN-001

### RF-008 — Filtro por faixa de preço
O sistema deve descartar produtos cujo preço esteja fora do intervalo configurado entre valor mínimo e máximo.
**Prioridade:** Must · **UC:** UC-02 · **RN:** RN-002

### RF-009 — Filtro por qualidade
O sistema deve descartar produtos com avaliação média ou número de vendas inferiores aos mínimos configurados, tratando ausência de dados conforme a política definida.
**Prioridade:** Must · **UC:** UC-02 · **RN:** RN-011

### RF-010 — Filtro por categoria e palavras bloqueadas
O sistema deve descartar produtos pertencentes a categorias vetadas ou cujo título contenha qualquer termo da lista de palavras bloqueadas, com comparação insensível a maiúsculas e acentos.
**Prioridade:** Must · **UC:** UC-02 · **RN:** RN-019

### RF-011 — Registro do motivo de descarte
O sistema deve registrar, para cada produto descartado, qual filtro o reprovou, permitindo diagnosticar regras excessivamente restritivas.
**Prioridade:** Should · **UC:** UC-02
**Critério de aceite:** o painel exibe a contagem de descartes agrupada por motivo na última execução.

### RF-012 — Deduplicação com janela de reposição
O sistema deve impedir que um produto já publicado gere novo post antes de decorrida a janela de reposição, exceto quando houver queda de preço igual ou superior ao limiar configurado.
**Prioridade:** Must · **UC:** UC-02, UC-15 · **RN:** RN-003, RN-004

### RF-013 — Ordenação por score
O sistema deve calcular um score para cada produto aprovado, combinando desconto, avaliação, volume de vendas e recência com pesos configuráveis, e ordenar a fila por esse valor de forma decrescente.
**Prioridade:** Should · **UC:** UC-02 · **RN:** RN-005

---

## 4.3 Geração de conteúdo

### RF-014 — Geração dupla de texto
O sistema deve gerar, para cada oferta selecionada, um texto destinado ao Telegram e um texto destinado ao Twitter/X, ambos armazenados no mesmo registro de post.
**Prioridade:** Must · **UC:** UC-03

### RF-015 — Renderização por template
O sistema deve produzir os textos a partir de templates parametrizáveis, com substituição de variáveis, sem que a alteração de um template exija implantação de código.
**Prioridade:** Should · **UC:** UC-03 · **RN:** RN-012

### RF-016 — Escaping de formatação
O sistema deve escapar corretamente todos os caracteres reservados do formato de mensagem do Telegram, garantindo que nenhum título de produto provoque erro de envio por formatação inválida.
**Prioridade:** Must · **UC:** UC-03 · **RNF:** RNF-021

### RF-017 — Limite de caracteres do Twitter/X
O sistema deve garantir que o texto destinado ao Twitter/X não exceda 280 caracteres, aplicando truncamento no título do produto quando necessário e preservando integralmente o link.
**Prioridade:** Must · **UC:** UC-03 · **RN:** RN-013

### RF-018 — Templates por tipo de oferta
O sistema deve selecionar o template adequado ao tipo de oferta, distinguindo no mínimo oferta comum de queda de preço.
**Prioridade:** Could · **UC:** UC-03 · **RN:** RN-015

### RF-019 — Divulgação de natureza comercial
O sistema deve incluir em todo post publicado uma sinalização de que o link é de afiliado, conforme exigido pelas políticas de divulgação.
**Prioridade:** Must · **UC:** UC-03 · **RN:** RN-021

---

## 4.4 Fila de aprovação

### RF-020 — Listagem de pendentes
O sistema deve exibir todos os posts com status `PENDING`, ordenados por score decrescente por padrão.
**Prioridade:** Must · **UC:** UC-04

### RF-021 — Informações de decisão
O sistema deve exibir, para cada post da fila, os dados do produto, o texto renderizado do Telegram, o texto do Twitter/X com contagem de caracteres e o indicativo de publicação anterior, quando houver.
**Prioridade:** Must · **UC:** UC-04

### RF-022 — Ordenação e filtragem da fila
O sistema deve permitir ordenar a fila por score, desconto, preço ou data, e filtrá-la por categoria e faixa de desconto.
**Prioridade:** Should · **UC:** UC-04 (A1)

### RF-023 — Pré-visualização fiel
O sistema deve exibir o texto do Telegram com a mesma formatação que o assinante verá, incluindo negrito, itálico e quebras de linha.
**Prioridade:** Should · **UC:** UC-04

### RF-024 — Aprovação individual
O sistema deve permitir aprovar um post, alterando seu status para `APPROVED` e enfileirando o job de publicação.
**Prioridade:** Must · **UC:** UC-05

### RF-025 — Aprovação em lote
O sistema deve permitir selecionar múltiplos posts e aprová-los em uma única ação, respeitando o limite diário de publicações.
**Prioridade:** Could · **UC:** UC-05 (A2) · **RN:** RN-007

### RF-026 — Aprovação com agendamento
O sistema deve permitir aprovar um post definindo horário futuro de publicação, mantendo-o com status `SCHEDULED` até esse momento.
**Prioridade:** Could · **UC:** UC-05 (A1) · **RN:** RN-006

### RF-027 — Atomicidade da aprovação
O sistema deve garantir que a alteração de status e o enfileiramento do job ocorram de forma consistente: se o enfileiramento falhar, o status retorna a `PENDING`.
**Prioridade:** Must · **UC:** UC-05 (E3) · **RNF:** RNF-014

### RF-028 — Rejeição com motivo
O sistema deve permitir rejeitar um post exigindo a seleção de um motivo, com observação opcional, e registrar a decisão com autor e horário.
**Prioridade:** Must · **UC:** UC-06 · **RN:** RN-016

---

## 4.5 Edição

### RF-029 — Edição do texto do Telegram
O sistema deve permitir editar o texto do Telegram de um post pendente antes da aprovação.
**Prioridade:** Should · **UC:** UC-07

### RF-030 — Edição do texto do Twitter/X
O sistema deve permitir editar o texto do Twitter/X, validando o limite de caracteres em tempo real.
**Prioridade:** Should · **UC:** UC-07

### RF-031 — Validação antes do salvamento
O sistema deve impedir o salvamento de texto com formatação inválida para o Telegram ou que exceda o limite de caracteres do Twitter/X.
**Prioridade:** Must · **UC:** UC-07 (E1, E2)

### RF-032 — Preservação do texto original
O sistema deve manter o texto gerado originalmente mesmo após edição manual, permitindo comparação e restauração.
**Prioridade:** Could · **UC:** UC-07 (A1)

---

## 4.6 Publicação no Telegram

### RF-033 — Publicação assíncrona por fila
O sistema deve publicar no Telegram por meio de job assíncrono entregue por serviço de fila, e não durante a requisição de aprovação.
**Prioridade:** Must · **UC:** UC-08 · **RNF:** RNF-015

### RF-034 — Idempotência da publicação
O sistema deve garantir que a reentrega do mesmo job não produza mensagem duplicada no grupo.
**Prioridade:** Must · **UC:** UC-08 · **RN:** RN-022

### RF-035 — Autenticação do job
O sistema deve validar a assinatura das requisições recebidas do serviço de fila e rejeitar as que não a possuírem.
**Prioridade:** Must · **UC:** UC-08 (E1) · **RNF:** RNF-027

### RF-036 — Registro do resultado
O sistema deve registrar, após cada tentativa de publicação, o status resultante, o identificador da mensagem em caso de sucesso e a mensagem de erro em caso de falha.
**Prioridade:** Must · **UC:** UC-08

### RF-037 — Distinção entre erro temporário e permanente
O sistema deve classificar os erros de publicação, solicitando nova tentativa apenas para falhas temporárias e interrompendo as retentativas em falhas permanentes.
**Prioridade:** Must · **UC:** UC-08 (E3, E4)

### RF-038 — Alerta de falha
O sistema deve notificar o Administrador quando um post atingir o status `FAILED`.
**Prioridade:** Should · **UC:** UC-08 (E4, E5), UC-14

---

## 4.7 Canal Twitter/X

### RF-039 — Fila de publicação manual
O sistema deve manter uma listagem dos posts cujo texto do Twitter/X ainda não foi publicado, com o texto pronto e a contagem de caracteres.
**Prioridade:** Must · **UC:** UC-09

### RF-040 — Cópia para a área de transferência
O sistema deve oferecer ação de cópia do texto do Twitter/X, com confirmação visual e alternativa manual em caso de falha.
**Prioridade:** Must · **UC:** UC-09

### RF-041 — Marcação de publicação manual
O sistema deve permitir marcar um post como publicado no Twitter/X, registrando horário, autor e, opcionalmente, a URL do tuíte.
**Prioridade:** Must · **UC:** UC-09 · **RN:** RN-023

---

## 4.8 Encurtador e rastreamento

### RF-042 — Geração de código curto
O sistema deve gerar, para cada post, um código curto único, não sequencial e não previsível, associado à URL de destino.
**Prioridade:** Must · **UC:** UC-03, UC-10

### RF-043 — Redirecionamento
O sistema deve responder a requisições em `/r/{code}` com redirecionamento HTTP para a URL de destino registrada.
**Prioridade:** Must · **UC:** UC-10 · **RNF:** RNF-004

### RF-044 — Registro de clique
O sistema deve registrar cada clique com horário, código, tipo de dispositivo, referenciador, país aproximado e canal de origem, sem atrasar o redirecionamento.
**Prioridade:** Must · **UC:** UC-10 · **RN:** RN-024

### RF-045 — Distinção de canal de origem
O sistema deve diferenciar cliques originados no Telegram dos originados no Twitter/X por meio de parâmetro na URL curta.
**Prioridade:** Should · **UC:** UC-10, UC-13 (A2)

### RF-046 — Contador agregado por post
O sistema deve manter um contador de cliques totais e únicos por post, atualizado a cada clique.
**Prioridade:** Should · **UC:** UC-13

### RF-047 — Tratamento de código inválido
O sistema deve responder a códigos inexistentes ou desativados com página de erro amigável, sem expor detalhes internos.
**Prioridade:** Must · **UC:** UC-10 (E1, E2)

---

## 4.9 Painel e autenticação

### RF-048 — Autenticação obrigatória
O sistema deve exigir autenticação para acesso a qualquer rota do painel e a qualquer endpoint de administração.
**Prioridade:** Must · **UC:** UC-12 · **RNF:** RNF-025

### RF-049 — Login por link mágico
O sistema deve autenticar o usuário por link enviado ao e-mail, sem uso de senha.
**Prioridade:** Must · **UC:** UC-12

### RF-050 — Lista de e-mails autorizados
O sistema deve restringir o acesso a endereços de e-mail previamente autorizados, sem revelar a terceiros se um endereço está ou não na lista.
**Prioridade:** Must · **UC:** UC-12 (E1) · **RNF:** RNF-026

### RF-051 — Configuração das regras de curadoria
O sistema deve permitir consultar e alterar, pelo painel, todos os parâmetros de curadoria descritos nas regras de negócio.
**Prioridade:** Should · **UC:** UC-11

### RF-052 — Validação de coerência das regras
O sistema deve validar a coerência entre parâmetros antes de salvar, impedindo configurações impossíveis.
**Prioridade:** Should · **UC:** UC-11 (E1)

### RF-053 — Histórico de configurações
O sistema deve manter as versões anteriores das regras, com autor e horário da alteração, e permitir reverter para uma delas.
**Prioridade:** Could · **UC:** UC-11 (A3)

### RF-054 — Simulação de regras
O sistema deve permitir simular o efeito de um conjunto de regras sobre os produtos já coletados, informando quantos seriam aprovados, sem gerar posts.
**Prioridade:** Could · **UC:** UC-11 (A1)

---

## 4.10 Observabilidade e métricas

### RF-055 — Painel de métricas
O sistema deve apresentar, para um período selecionável, o total de posts publicados, o total de cliques, os cliques únicos, a média de cliques por post e a taxa de aprovação da fila.
**Prioridade:** Should · **UC:** UC-13

### RF-056 — Desempenho por dimensão
O sistema deve exibir o desempenho agregado por categoria, por faixa de desconto e por canal.
**Prioridade:** Could · **UC:** UC-13

### RF-057 — Registro estruturado de eventos
O sistema deve emitir registros estruturados para os eventos de coleta, curadoria, geração, aprovação, publicação e falha, contendo identificador de correlação.
**Prioridade:** Should · **RNF:** RNF-030

### RF-058 — Exportação de dados
O sistema deve permitir exportar os dados de posts e cliques do período selecionado em formato tabular.
**Prioridade:** Could · **UC:** UC-13 (A3)

---

[← 3d. Plataforma](03d-uc-plataforma.md) | [Índice do SRS](../SRS.md) | Próximo: [5. Requisitos Não Funcionais →](05-requisitos-nao-funcionais.md)
