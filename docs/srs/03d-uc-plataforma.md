[← 3c. Publicação](03c-uc-publicacao.md) | [Índice do SRS](../SRS.md) | Próximo: [4. Requisitos Funcionais →](04-requisitos-funcionais.md)

---

# 3d. Casos de Uso — Plataforma

Contém UC-10, UC-11, UC-12 e UC-13. Reúne rastreamento de cliques, configuração, autenticação e métricas.

---

## UC-10 — Redirecionar link curto e registrar clique

| Campo | Valor |
|---|---|
| **Ator primário** | AT-03 Assinante |
| **Atores secundários** | AT-06 TikTok Shop |
| **Prioridade** | Must |
| **Gatilho** | Acesso a uma URL no formato `/r/{code}` |

**Pré-condições**

1. O código curto existe e está ativo

**Pós-condições**

1. O visitante foi redirecionado ao destino de afiliado
2. O clique foi contabilizado

**Fluxo principal**

1. O visitante acessa a URL curta.
2. O sistema busca o código na base.
3. O sistema responde imediatamente com um redirecionamento HTTP para a URL de destino.
4. O sistema registra o clique de forma assíncrona, sem atrasar a resposta, gravando: código, horário, tipo de dispositivo, referenciador e país aproximado.
5. O sistema incrementa o contador agregado do post.

**Fluxos alternativos**

- **A1 — Clique repetido do mesmo visitante.** O sistema registra o clique, mas o marca como não único conforme a regra de deduplicação de cliques (RN-024).
- **A2 — Acesso por robô.** Requisições identificadas como automatizadas pelo agente de usuário são registradas separadamente e não contam nas métricas principais.

**Fluxos de exceção**

- **E1 — Código inexistente.** O sistema responde com uma página de erro amigável e registra a tentativa.
- **E2 — Código desativado.** O sistema informa que a oferta não está mais disponível e oferece link para o canal do Telegram.
- **E3 — Falha ao registrar o clique.** O redirecionamento acontece mesmo assim; a perda de uma métrica jamais impede a conversão.

**Requisitos relacionados:** RF-042 a RF-044, RN-024, RNF-004, RNF-013

---

## UC-11 — Configurar regras de curadoria

| Campo | Valor |
|---|---|
| **Ator primário** | AT-01 Administrador |
| **Atores secundários** | — |
| **Prioridade** | Should |
| **Gatilho** | Necessidade de ajustar os critérios de seleção |

**Pré-condições**

1. O Administrador está autenticado com permissão de administração

**Pós-condições**

1. As novas regras estão salvas e passam a valer na próxima coleta
2. A alteração está registrada no histórico

**Fluxo principal**

1. O Administrador acessa a tela de regras.
2. O sistema exibe os parâmetros vigentes: desconto mínimo, preço mínimo e máximo, avaliação mínima, vendas mínimas, categorias permitidas e vetadas, palavras bloqueadas, pesos do score, limite de itens por execução, limite diário de publicações e janela de reposição.
3. O Administrador altera os valores desejados.
4. O sistema valida cada campo e a coerência entre eles.
5. O Administrador salva.
6. O sistema grava a nova versão das regras, mantendo a anterior no histórico.
7. O sistema informa que as regras valem a partir da próxima coleta.

**Fluxos alternativos**

- **A1 — Simular o efeito.** O Administrador solicita uma simulação sobre os produtos já coletados. O sistema informa quantos passariam pelos novos critérios, sem gerar posts.
- **A2 — Restaurar padrão.** O sistema repõe os valores de referência documentados na seção de regras de negócio.
- **A3 — Reverter para versão anterior.** O Administrador seleciona uma versão do histórico e a reativa.

**Fluxos de exceção**

- **E1 — Valores incoerentes.** O sistema impede o salvamento e indica o conflito, por exemplo preço mínimo maior que o máximo.
- **E2 — Regras excessivamente restritivas.** Se a simulação indicar zero produtos aprovados, o sistema alerta antes de salvar, mas permite prosseguir.

**Requisitos relacionados:** RF-051 a RF-054, RN-001 a RN-010, RNF-023

---

## UC-12 — Autenticar no painel

| Campo | Valor |
|---|---|
| **Ator primário** | AT-01 Administrador |
| **Atores secundários** | AT-09 Supabase Auth |
| **Prioridade** | Must |
| **Gatilho** | Tentativa de acesso a qualquer área protegida do painel |

**Pré-condições**

1. O e-mail do usuário consta na lista de acesso autorizado

**Pós-condições**

1. Existe uma sessão válida associada ao usuário
2. O acesso está registrado

**Fluxo principal**

1. O usuário acessa o painel sem sessão válida.
2. O sistema apresenta a tela de login com campo de e-mail.
3. O usuário informa o e-mail e solicita o link de acesso.
4. O sistema verifica se o e-mail está autorizado e solicita ao Supabase o envio do link mágico.
5. O sistema exibe confirmação de envio, sem revelar se o e-mail estava ou não autorizado.
6. O usuário abre o link recebido.
7. O sistema valida o token, cria a sessão e redireciona à fila de aprovação.

**Fluxos alternativos**

- **A1 — Sessão ainda válida.** O usuário é levado direto ao destino pretendido.
- **A2 — Encerrar sessão.** O usuário sai; o sistema invalida a sessão e retorna à tela de login.
- **A3 — Renovação de sessão.** Sessões próximas do vencimento são renovadas de forma transparente enquanto houver atividade.

**Fluxos de exceção**

- **E1 — E-mail não autorizado.** O sistema exibe a mesma mensagem de confirmação do fluxo normal, mas não envia link algum, e registra a tentativa.
- **E2 — Token expirado ou já usado.** O sistema informa que o link não é mais válido e oferece solicitar um novo.
- **E3 — Excesso de solicitações.** O sistema limita a frequência de pedidos por e-mail e por endereço de origem.
- **E4 — Indisponibilidade do provedor de autenticação.** O sistema informa a falha e sugere tentar novamente em instantes.

**Requisitos relacionados:** RF-048 a RF-050, RNF-025 a RNF-029

---

## UC-13 — Consultar métricas de cliques

| Campo | Valor |
|---|---|
| **Ator primário** | AT-01 Administrador |
| **Atores secundários** | — |
| **Prioridade** | Should |
| **Gatilho** | Interesse em avaliar o desempenho dos posts |

**Pré-condições**

1. O Administrador está autenticado
2. Existem posts publicados

**Pós-condições**

1. O Administrador visualizou as métricas do período selecionado

**Fluxo principal**

1. O Administrador acessa a tela de métricas.
2. O sistema apresenta, para o período padrão dos últimos trinta dias: total de posts publicados, total de cliques, cliques únicos, média de cliques por post e taxa de aprovação da fila.
3. O sistema exibe a série temporal de cliques por dia.
4. O sistema exibe a lista dos posts com mais cliques.
5. O sistema exibe o desempenho agregado por categoria e por faixa de desconto.

**Fluxos alternativos**

- **A1 — Alterar o período.** O Administrador escolhe outro intervalo e o sistema recalcula.
- **A2 — Comparar canais.** O sistema separa os cliques por origem, distinguindo Telegram de Twitter/X quando o parâmetro de origem estiver presente na URL.
- **A3 — Exportar.** O sistema gera um arquivo em formato tabular com os dados do período.
- **A4 — Detalhar um post.** O sistema exibe a evolução de cliques daquele post ao longo do tempo.

**Fluxos de exceção**

- **E1 — Sem dados no período.** O sistema informa a ausência de dados em vez de exibir gráficos vazios.
- **E2 — Consulta demorada.** Para períodos longos, o sistema usa dados agregados previamente calculados.

**Requisitos relacionados:** RF-055 a RF-058, RNF-007, RNF-012

---

[← 3c. Publicação](03c-uc-publicacao.md) | [Índice do SRS](../SRS.md) | Próximo: [4. Requisitos Funcionais →](04-requisitos-funcionais.md)
