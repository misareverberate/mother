# ADR-0006 — Encurtador de links próprio

**Status:** Aceito
**Data:** 2026-08-08
**Decisores:** isaac

## Contexto

Todo post publicado leva a um link de afiliado. Sem nenhum mecanismo de rastreamento, o sistema publica às cegas: não há como saber quais ofertas geram cliques, quais categorias funcionam, se desconto alto realmente converte melhor, ou se o horário de publicação importa.

Esse dado é o que permite melhorar a curadoria ao longo do tempo. Sem ele, os pesos do score (RN-005) e os limiares de filtro (RN-001, RN-002) permanecem chutes permanentes.

Há um agravante: links de afiliado costumam ser longos e visualmente ruins, o que pesa especialmente no Twitter/X, onde cada caractere disputa espaço com o conteúdo (RN-013).

## Decisão

**Implementar um encurtador próprio, servido pelo mesmo domínio da aplicação, na rota `/r/{code}`.**

| Aspecto | Definição |
|---|---|
| Formato | `https://dominio/r/{code}` |
| Código | Aleatório, não sequencial, alfabeto sem caracteres ambíguos |
| Origem | Parâmetro `?src=tg` ou `?src=x` distingue o canal (RF-045) |
| Resposta | Redirecionamento HTTP para a URL de afiliado |
| Registro | Assíncrono, após a resposta — jamais no caminho crítico |

Dados registrados por clique: horário, código, canal de origem, categoria de dispositivo, referenciador, país aproximado e um identificador de visitante não reversível para deduplicação (RN-024).

**Princípio inegociável:** o redirecionamento responde primeiro; o registro acontece depois. Falha ao registrar um clique é perda de métrica; falha ao redirecionar é perda de venda (RNF-012).

## Alternativas consideradas

### A) Link de afiliado direto, sem encurtador

**Prós:** nada para implementar; sem ponto de falha adicional; sem custo.
**Contras:** nenhuma medição; impossível saber o que funciona; URL longa e feia, especialmente cara no Twitter/X; sem distinção entre canais.
**Rejeitada** porque publicar sem medir impede qualquer melhoria fundamentada da curadoria.

### B) Encurtador de terceiros (Bitly e similares)

**Prós:** pronto para uso; painel de métricas incluído; sem código para manter.
**Contras:** camada gratuita limitada em volume de links e retenção de dados; dependência externa no caminho da conversão; dados de negócio hospedados em serviço de terceiro; sem controle sobre latência; dificuldade de cruzar cliques com posts e categorias dentro do próprio painel.
**Rejeitada** por colocar uma dependência externa no caminho crítico da conversão e por fragmentar os dados que precisam ser cruzados.

### C) Parâmetros de rastreamento na própria URL de afiliado

**Prós:** sem redirecionamento intermediário; sem código.
**Contras:** a medição fica do lado da plataforma de afiliados, com relatórios limitados e atraso; não mede clique, mede o que a plataforma decidir expor; URL ainda mais longa.
**Rejeitada** por não entregar o dado de clique, que é justamente o que se quer medir.

### D) Encurtador próprio — **escolhida**

**Prós:** controle total sobre o dado; cliques cruzáveis com post, produto, categoria e canal dentro do mesmo banco; URL curta e no próprio domínio, que transmite mais confiança que um encurtador genérico; sem custo adicional; sem limite de volume além do próprio banco; latência sob controle.
**Contras:** mais um endpoint público para manter e proteger; responsabilidade sobre a disponibilidade do redirecionamento; crescimento da tabela de cliques; risco de redirecionamento aberto se mal implementado.
**Aceita** porque o dado de clique é o insumo da melhoria contínua da curadoria, e o custo de implementação é pequeno.

## Consequências

### Positivas

- Medição de desempenho por post, produto, categoria, faixa de desconto e canal (RF-055, RF-056)
- Base empírica para calibrar os pesos do score e os limiares de filtro
- URL curta economiza caracteres no Twitter/X, que são escassos (RN-013)
- Link no próprio domínio transmite mais confiança que encurtador genérico
- Permite testar hipóteses — como a de [ADR-0005](0005-posts-somente-texto.md) sobre imagens — com dado em vez de opinião

### Negativas

- **O redirecionador vira o componente mais crítico do sistema.** Se ele cair, todo clique publicado se perde, inclusive os de posts antigos
- Endpoint público sem autenticação, exposto a tráfego automatizado e a abuso
- A tabela de cliques cresce indefinidamente; exige agregação e política de retenção (RNF-031)
- Requisito de latência exigente (RNF-004), que restringe o que pode ser feito no caminho da requisição
- Risco de redirecionamento aberto, mitigado por nenhuma entrada de usuário jamais definir a URL de destino

### Neutras

- O identificador de visitante é derivado por função de resumo com sal rotativo, resolvendo a deduplicação sem armazenar dado pessoal recuperável
- Isolar o redirecionador como contêiner separado, decidido na arquitetura, decorre diretamente da criticidade estabelecida aqui

## Requisitos afetados

RF-042, RF-043, RF-044, RF-045, RF-046, RF-047, RF-055, RF-056, RN-013, RN-024, RNF-004, RNF-012, RNF-013

## Revisão

Reavaliar quando:

- O volume de cliques ameaçar a camada gratuita do banco — momento de agregar mais cedo e reduzir a retenção de dados brutos
- A latência do redirecionamento deixar de atender RNF-004
- Surgir necessidade de rastreamento de conversão, e não apenas de clique — o que exigiria integração com a plataforma de afiliados
