[← 4. Requisitos Funcionais](04-requisitos-funcionais.md) | [Índice do SRS](../SRS.md) | Próximo: [6. Regras de Negócio →](06-regras-de-negocio.md)

---

# 5. Requisitos Não Funcionais

32 requisitos com critérios mensuráveis. Todo RNF aqui é verificável — se não há como medir, não é requisito, é intenção.

| Categoria | Faixa |
|---|---|
| [5.1 Desempenho](#51-desempenho) | RNF-001 a RNF-007 |
| [5.2 Confiabilidade](#52-confiabilidade) | RNF-008 a RNF-016 |
| [5.3 Usabilidade](#53-usabilidade) | RNF-017 a RNF-024 |
| [5.4 Segurança](#54-segurança) | RNF-025 a RNF-029 |
| [5.5 Manutenibilidade e operação](#55-manutenibilidade-e-operação) | RNF-030 a RNF-032 |

---

## 5.1 Desempenho

### RNF-001 — Tempo de execução da coleta
Cada invocação do endpoint de coleta deve concluir dentro do limite de tempo da plataforma serverless, reservando margem de segurança de ao menos 20% desse limite para o encerramento ordenado.
**Verificação:** medir a duração das execuções; nenhuma pode ser encerrada por estouro de tempo da plataforma.

### RNF-002 — Volume por execução
A coleta deve processar ao menos 500 produtos por invocação nas condições esperadas de rede.
**Verificação:** teste de carga com fonte simulada.

### RNF-003 — Carregamento da fila
A tela de fila deve renderizar em até 2 segundos para até 200 posts pendentes, no percentil 95.
**Verificação:** medição no navegador com dados representativos.

### RNF-004 — Latência do redirecionamento
O redirecionamento do link curto deve responder em até 300 ms no percentil 95, excluída a latência de rede do visitante.
**Verificação:** monitoramento do endpoint. O registro do clique não pode entrar no caminho crítico.

### RNF-005 — Resposta da aprovação
A ação de aprovar um post deve retornar confirmação ao usuário em até 1,5 segundo no percentil 95, sem aguardar a publicação efetiva.
**Verificação:** medição da requisição de aprovação.

### RNF-006 — Prazo de publicação
Um post aprovado deve estar publicado no Telegram em até 60 segundos após a aprovação, em condições normais.
**Verificação:** diferença entre horário de aprovação e horário de publicação registrados.

### RNF-007 — Consulta de métricas
A tela de métricas deve responder em até 3 segundos para períodos de até 90 dias, recorrendo a agregações pré-calculadas quando necessário.
**Verificação:** medição com volume equivalente a 90 dias de operação.

---

## 5.2 Confiabilidade

### RNF-008 — Ausência de estado em memória
Nenhuma funcionalidade pode depender de estado mantido em memória entre invocações. Todo estado reside no banco de dados ou no armazenamento de chave-valor.
**Verificação:** revisão de código e teste com invocações em instâncias distintas.

### RNF-009 — Retomada de coleta interrompida
Uma coleta encerrada como parcial deve retomar do ponto de interrupção na execução seguinte, sem reprocessar páginas já concluídas nem perder produtos.
**Verificação:** teste de interrupção forçada seguido de nova execução.

### RNF-010 — Isolamento de falhas por item
A falha no processamento de um produto individual não pode interromper o processamento dos demais da mesma execução.
**Verificação:** teste com item deliberadamente malformado no conjunto.

### RNF-011 — Política de retentativa
Falhas temporárias na publicação devem ser retentadas ao menos três vezes, com espera exponencial entre as tentativas.
**Verificação:** teste com o serviço externo simulando indisponibilidade temporária.

### RNF-012 — Perda tolerável de métricas
A falha no registro de um clique não pode impedir o redirecionamento. A perda de métricas é aceitável; a perda de conversão não é.
**Verificação:** teste com o registro de cliques indisponível.

### RNF-013 — Disponibilidade do redirecionador
O endpoint de redirecionamento deve permanecer funcional mesmo com o painel indisponível, por não depender de autenticação nem de sessão.
**Verificação:** teste de acesso ao link curto sem sessão ativa.

### RNF-014 — Consistência entre aprovação e fila
Não pode existir post aprovado sem job correspondente enfileirado, nem job enfileirado para post não aprovado.
**Verificação:** consulta de reconciliação entre a base e a fila.

### RNF-015 — Ausência de duplicidade
O mesmo post não pode gerar duas mensagens no grupo, ainda que o job seja entregue mais de uma vez.
**Verificação:** teste de reentrega do mesmo job.

### RNF-016 — Registro de causa de falha
Todo post em estado de falha deve conter a mensagem de erro original e o número de tentativas efetuadas.
**Verificação:** inspeção dos registros após falha induzida.

---

## 5.3 Usabilidade

### RNF-017 — Idioma
Toda a interface e todo o conteúdo gerado devem estar em português do Brasil.
**Verificação:** revisão da interface e dos templates.

### RNF-018 — Responsividade
O painel deve ser operável em telas a partir de 360 px de largura, permitindo revisar e aprovar posts pelo celular.
**Verificação:** teste em navegador com emulação de dispositivos.

### RNF-019 — Fuso horário
Todas as datas e horários exibidos devem estar no fuso America/Sao_Paulo, ainda que armazenados em UTC.
**Verificação:** comparação entre valor armazenado e valor exibido.

### RNF-020 — Decisão sem navegação adicional
A tela de fila deve conter todas as informações necessárias para aprovar ou rejeitar um post, sem exigir abertura de outra tela.
**Verificação:** avaliação de usabilidade sobre a tela de fila.

### RNF-021 — Prevenção de erro de formatação
A interface deve impedir, no momento da edição, o salvamento de conteúdo que provocaria erro de envio ao Telegram.
**Verificação:** tentativa de salvar texto com caractere reservado não escapado.

### RNF-022 — Confirmação de cópia
A ação de copiar o texto do Twitter/X deve apresentar retorno visual imediato de sucesso ou falha.
**Verificação:** teste manual da interação.

### RNF-023 — Confirmação de ação destrutiva
Ações irreversíveis, como bloqueio permanente de produto ou descarte de post, devem exigir confirmação explícita.
**Verificação:** teste das ações destrutivas.

### RNF-024 — Mensagens de erro compreensíveis
Mensagens de erro exibidas ao usuário devem descrever o que ocorreu e o que fazer a seguir, sem expor detalhes técnicos internos.
**Verificação:** revisão do catálogo de mensagens.

---

## 5.4 Segurança

### RNF-025 — Proteção das rotas administrativas
Toda rota do painel e todo endpoint de administração devem verificar a sessão do usuário no servidor, jamais confiando em verificação apenas no cliente.
**Verificação:** requisição direta ao endpoint sem sessão deve ser recusada.

### RNF-026 — Não enumeração de contas
As respostas do fluxo de autenticação devem ser idênticas para e-mails autorizados e não autorizados.
**Verificação:** comparação das respostas e dos tempos de resposta em ambos os casos.

### RNF-027 — Autenticidade das chamadas automatizadas
Endpoints acionados por cron e por fila devem validar segredo ou assinatura antes de executar qualquer efeito.
**Verificação:** requisição sem credencial deve ser recusada com código de não autorizado.

### RNF-028 — Proteção de segredos
Credenciais de qualquer serviço externo devem residir apenas em variáveis de ambiente, jamais no repositório, em registros de log ou em respostas da interface.
**Verificação:** varredura do repositório e inspeção dos registros.

### RNF-029 — Isolamento de dados no banco
As tabelas devem ter política de segurança em nível de linha habilitada, de forma que a chave pública do banco não conceda acesso a dados administrativos.
**Verificação:** tentativa de leitura com chave anônima deve retornar conjunto vazio.

---

## 5.5 Manutenibilidade e operação

### RNF-030 — Registros correlacionáveis
Todo evento registrado deve conter um identificador de correlação que permita reconstruir o percurso de um post desde a coleta até a publicação.
**Verificação:** busca por identificador retorna a cadeia completa de eventos.

### RNF-031 — Custo de operação
A operação em regime normal deve caber nas camadas gratuitas dos serviços utilizados, considerando até 10 publicações por dia e até 5 mil cliques por mês.
**Verificação:** acompanhamento mensal do consumo de cada serviço.

### RNF-032 — Cobertura de testes do domínio
As regras de curadoria, deduplicação, cálculo de score, truncamento de texto e escaping devem ter cobertura de testes automatizados de ao menos 80%.
**Verificação:** relatório de cobertura na integração contínua.

---

[← 4. Requisitos Funcionais](04-requisitos-funcionais.md) | [Índice do SRS](../SRS.md) | Próximo: [6. Regras de Negócio →](06-regras-de-negocio.md)
