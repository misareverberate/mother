[← 3. Casos de Uso](03-casos-de-uso.md) | [Índice do SRS](../SRS.md) | Próximo: [3b. Aprovação →](03b-uc-aprovacao.md)

---

# 3a. Casos de Uso — Coleta e Curadoria

Contém UC-01, UC-02, UC-03 e UC-15. Estes casos de uso rodam sem intervenção humana e formam o pipeline que alimenta a fila de aprovação.

---

## UC-01 — Coletar produtos da fonte

| Campo | Valor |
|---|---|
| **Ator primário** | AT-05 Agendador (Vercel Cron) |
| **Atores secundários** | AT-06 TikTok Shop API |
| **Prioridade** | Must |
| **Gatilho** | Execução programada do cron de coleta |

**Pré-condições**

1. Existe ao menos um conjunto de regras de curadoria ativo
2. As credenciais da fonte de dados estão configuradas e válidas
3. Não há outra execução de coleta em andamento (RN-018)

**Pós-condições**

1. Os produtos retornados estão registrados ou atualizados na tabela de produtos
2. Existe um registro de execução com contagem de itens obtidos, filtrados e enfileirados
3. UC-02 foi executado sobre o conjunto coletado

**Fluxo principal**

1. O agendador invoca o endpoint de coleta.
2. O sistema valida o segredo do cron e rejeita a requisição se ele não conferir.
3. O sistema cria um registro de execução com status `RUNNING`.
4. O sistema carrega as regras de curadoria ativas.
5. O sistema solicita à `ProductSource` a primeira página de produtos, aplicando os filtros que a própria fonte suporta.
6. Para cada produto retornado, o sistema normaliza os campos para o formato interno.
7. O sistema grava ou atualiza cada produto, preservando o histórico de preço quando ele mudou.
8. O sistema verifica se ainda há tempo de execução disponível e se existe próxima página.
9. Havendo mais páginas e tempo, o sistema repete a partir do passo 5.
10. O sistema aciona UC-02 sobre os produtos coletados.
11. O sistema encerra o registro de execução com status `SUCCESS` e as contagens finais.

**Fluxos alternativos**

- **A1 — Orçamento de tempo esgotado.** No passo 8, se o tempo restante for inferior à margem de segurança, o sistema interrompe a paginação, salva o cursor da última página processada e encerra a execução com status `PARTIAL`. A próxima execução retoma a partir do cursor salvo.
- **A2 — Nenhum produto novo.** Se todos os produtos retornados já existirem sem alteração de preço, o sistema encerra com `SUCCESS` e contagem de enfileirados igual a zero.
- **A3 — Fonte em modo mock.** Se a fonte configurada for `MockSource`, o sistema lê de um conjunto de dados local e segue o mesmo fluxo, sem chamadas de rede.

**Fluxos de exceção**

- **E1 — Falha de autenticação na fonte.** O sistema tenta renovar o token uma vez. Persistindo o erro, encerra a execução com `FAILED`, registra o motivo e emite alerta ao Administrador.
- **E2 — Limite de taxa atingido.** O sistema aplica espera exponencial e retenta até o limite de tentativas configurado. Esgotadas as tentativas, encerra como `PARTIAL` preservando o cursor.
- **E3 — Resposta malformada.** O sistema descarta o item inválido, registra o ocorrido e prossegue com os demais. Se mais da metade dos itens da página for inválida, encerra como `FAILED`.
- **E4 — Execução concorrente detectada.** O sistema encerra imediatamente sem processar, registrando o motivo.

**Requisitos relacionados:** RF-001 a RF-006, RN-018, RNF-002, RNF-009

---

## UC-02 — Aplicar curadoria e deduplicação

| Campo | Valor |
|---|---|
| **Ator primário** | Sistema |
| **Atores secundários** | — |
| **Prioridade** | Must |
| **Gatilho** | Conclusão da coleta (UC-01), como passo incluído |

**Pré-condições**

1. Existe um conjunto de produtos normalizados a avaliar
2. As regras de curadoria ativas foram carregadas

**Pós-condições**

1. Cada produto avaliado está marcado como aprovado ou reprovado, com o motivo da reprovação registrado
2. Os produtos aprovados estão ordenados por score e prontos para UC-03

**Fluxo principal**

1. O sistema recebe a lista de produtos normalizados.
2. Para cada produto, aplica os filtros de exclusão na ordem: categoria vetada, palavra bloqueada, preço fora da faixa, desconto abaixo do mínimo, avaliação abaixo do mínimo, vendas abaixo do mínimo.
3. O sistema descarta o produto no primeiro filtro reprovado e registra qual filtro o reprovou.
4. Para os produtos que passaram, o sistema verifica a deduplicação: consulta se o produto já foi publicado e há quanto tempo.
5. Se o produto foi publicado dentro da janela de reposição, o sistema o descarta, salvo se houver queda de preço relevante (RN-004).
6. O sistema calcula o score de cada produto sobrevivente.
7. O sistema ordena os produtos por score decrescente.
8. O sistema seleciona os N primeiros, respeitando o limite de itens por execução (RN-008).
9. O sistema aciona UC-03 para os selecionados.

**Fluxos alternativos**

- **A1 — Fila já saturada.** Se a quantidade de posts pendentes já atingir o teto configurado (RN-010), o sistema reduz o número de selecionados ou não seleciona nenhum.
- **A2 — Queda de preço em produto já publicado.** O produto ignora a janela de reposição e segue para UC-03 sinalizado como oferta de queda de preço.

**Fluxos de exceção**

- **E1 — Nenhum produto aprovado.** O sistema registra a execução com zero aprovados e encerra normalmente. Isso não é erro.
- **E2 — Regras de curadoria inconsistentes.** Se a configuração contiver valores impossíveis (por exemplo, preço mínimo maior que o máximo), o sistema não processa, registra o erro e alerta o Administrador.

**Requisitos relacionados:** RF-007 a RF-013, RN-001 a RN-010, RNF-010

---

## UC-03 — Gerar conteúdo dos posts

| Campo | Valor |
|---|---|
| **Ator primário** | Sistema |
| **Atores secundários** | — |
| **Prioridade** | Must |
| **Gatilho** | Seleção de produtos aprovados na curadoria (UC-02) |

**Pré-condições**

1. Existem produtos aprovados e ordenados
2. Existe um template ativo para Telegram e um para Twitter/X

**Pós-condições**

1. Cada produto selecionado gerou um post com status `PENDING`
2. Cada post possui link curto próprio, texto de Telegram e texto de Twitter/X
3. Os posts estão visíveis na fila de aprovação

**Fluxo principal**

1. O sistema recebe a lista de produtos selecionados.
2. Para cada produto, gera um código de link curto único.
3. O sistema registra o link curto associando-o à URL de afiliado de destino.
4. O sistema seleciona o template adequado ao tipo de oferta (oferta comum ou queda de preço).
5. O sistema renderiza o texto do Telegram substituindo as variáveis do template e aplicando o escaping exigido pelo formato de mensagem.
6. O sistema renderiza o texto do Twitter/X e verifica o limite de caracteres.
7. Se o texto do Twitter/X exceder o limite, o sistema trunca o título do produto conforme a regra de truncamento (RN-013).
8. O sistema grava o post com status `PENDING` e o score herdado do produto.

**Fluxos alternativos**

- **A1 — Título muito curto ou ausente.** O sistema usa o nome da categoria como complemento para que o texto não fique vazio de contexto.
- **A2 — Produto sem preço anterior.** O template omite a linha de preço riscado e de percentual de desconto.

**Fluxos de exceção**

- **E1 — Colisão de código de link curto.** O sistema gera um novo código e tenta novamente, até três vezes. Persistindo, registra falha para aquele produto e segue com os demais.
- **E2 — Texto do Twitter/X ainda excede o limite após truncamento.** O sistema grava o post apenas com o texto do Telegram e sinaliza o post como pendente de ajuste manual do texto do X.
- **E3 — Template ativo inexistente.** O sistema usa o template padrão embutido no código e registra o ocorrido.

**Requisitos relacionados:** RF-014 a RF-019, RF-040 a RF-042, RN-011 a RN-015, RN-021

---

## UC-15 — Detectar queda de preço e reenfileirar

| Campo | Valor |
|---|---|
| **Ator primário** | AT-05 Agendador |
| **Atores secundários** | AT-06 TikTok Shop API |
| **Prioridade** | Could |
| **Gatilho** | Execução programada do cron de reavaliação de preços |

**Pré-condições**

1. Existem produtos já publicados dentro do período de acompanhamento
2. A funcionalidade de reavaliação está habilitada na configuração

**Pós-condições**

1. Os preços dos produtos acompanhados estão atualizados
2. Produtos com queda relevante geraram novos posts pendentes

**Fluxo principal**

1. O agendador invoca o endpoint de reavaliação.
2. O sistema seleciona os produtos publicados nos últimos N dias que ainda estão dentro do período de acompanhamento.
3. O sistema consulta o preço atual de cada produto na fonte.
4. O sistema registra o novo preço no histórico quando ele mudou.
5. Para cada produto cuja queda percentual em relação ao preço publicado atinja o limiar (RN-004), o sistema aciona UC-03 sinalizando oferta de queda de preço.
6. O sistema encerra a execução registrando quantos produtos foram reavaliados e quantos foram reenfileirados.

**Fluxos alternativos**

- **A1 — Produto indisponível na fonte.** O sistema marca o produto como inativo e o remove do acompanhamento.
- **A2 — Aumento de preço.** O sistema apenas registra o novo preço, sem gerar post.

**Fluxos de exceção**

- **E1 — Falha na consulta de um produto.** O sistema registra a falha para aquele produto e prossegue com os demais.
- **E2 — Tempo de execução esgotado.** O sistema encerra como `PARTIAL` e retoma na próxima execução a partir do último produto avaliado.

**Requisitos relacionados:** RF-005, RF-012, RN-004, RN-005

---

[← 3. Casos de Uso](03-casos-de-uso.md) | [Índice do SRS](../SRS.md) | Próximo: [3b. Aprovação →](03b-uc-aprovacao.md)
