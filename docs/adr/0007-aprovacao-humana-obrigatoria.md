# ADR-0007 — Aprovação humana obrigatória antes de publicar

**Status:** Aceito
**Data:** 2026-08-08
**Decisores:** isaac

## Contexto

O sistema é descrito como um bot, e a expectativa natural de um bot é que ele publique sozinho. A questão é se a curadoria por regras (RN-001 a RN-011) basta para decidir o que vai ao ar sem que ninguém olhe.

Regras automáticas capturam bem o que é mensurável: desconto, preço, avaliação, número de vendas, categoria. Não capturam o que só se percebe olhando:

- Produto com desconto real de 60% que é obviamente ruim, apesar da nota alta
- "Desconto" calculado sobre um preço original inflado — prática comum em comércio eletrônico
- Título com erro de tradução automática que faz o post parecer golpe
- Produto tecnicamente adequado mas incompatível com o perfil do canal
- Item que, publicado logo depois de outro parecido, faz o canal parecer repetitivo

Cada post ruim custa credibilidade, e credibilidade perdida em canal de ofertas não volta: o assinante silencia o grupo ou sai. O custo de um erro é assimétrico em relação ao ganho de um acerto.

Do outro lado, aprovação manual introduz uma dependência humana: se o Administrador não abrir o painel, nada é publicado (PR-01).

## Decisão

**Nenhum post vai ao Telegram sem aprovação explícita de uma pessoa no painel.**

O sistema automatiza tudo o que antecede a decisão — buscar, filtrar, deduplicar, pontuar, redigir, encurtar — e para. A fila fica ordenada por score, com todas as informações necessárias visíveis na mesma tela (RNF-020), de modo que a revisão seja rápida.

Mecanismos que reduzem o atrito da decisão:

| Mecanismo | Requisito |
|---|---|
| Ordenação por score, o melhor primeiro | RF-013 |
| Toda a informação de decisão na mesma tela | RNF-020 |
| Pré-visualização fiel do que o assinante verá | RF-023 |
| Aprovação e rejeição em lote | RF-025 |
| Painel operável pelo celular | RNF-018 |
| Expiração automática de pendentes antigos | RN-009 |

## Alternativas consideradas

### A) Publicação totalmente automática

**Prós:** é o que se espera de um bot; funciona sem presença humana; sem atrito.
**Contras:** todo erro de curadoria vai ao ar; nenhum julgamento sobre qualidade real ou desconto enganoso; um post ruim custa assinantes; corrigir depois é apagar mensagem que já foi lida.
**Rejeitada** pela assimetria entre o custo de um erro e o ganho de um acerto.

### B) Automático com lista de bloqueio e regras rígidas

**Prós:** quase toda a autonomia da alternativa A, com alguma proteção; a lista de bloqueio melhora com o tempo.
**Contras:** lista de bloqueio é reativa — protege contra o erro que já aconteceu, não contra o próximo; regras não detectam desconto inflado nem produto ruim de nota alta; a calibração inicial seria feita publicando erros.
**Rejeitada** por ser aprendizado à custa da credibilidade do canal.

### C) Aprovação por botões no chat do Telegram

**Prós:** aprovação sem sair do aplicativo, direto do celular; sem painel para construir.
**Contras:** espaço limitado para exibir as informações de decisão; edição de texto inviável; sem visão de lote nem de fila; sem métricas na mesma interface; o painel seria necessário de todo modo para o fluxo do Twitter/X.
**Rejeitada** por não comportar as informações necessárias à decisão, embora seja um bom complemento futuro ao painel.

### D) Aprovação obrigatória no painel — **escolhida**

**Prós:** julgamento humano onde ele agrega valor; nenhum post ruim publicado; oportunidade de editar antes de publicar; mesma interface serve ao fluxo do Twitter/X; a decisão gera dado — a taxa de rejeição mede a qualidade das regras.
**Contras:** o sistema não publica sozinho; ausência do Administrador esvazia o canal; introduz trabalho recorrente, ainda que pequeno.
**Aceita** porque preserva credibilidade, que é o ativo do canal, e porque a taxa de rejeição observada indicará quando — e se — for seguro automatizar.

## Consequências

### Positivas

- Nenhum post ruim chega ao canal
- Possibilidade de ajustar o texto antes de publicar (UC-07)
- A taxa de rejeição mede objetivamente a qualidade das regras de curadoria
- O painel, necessário para o Twitter/X de todo modo, ganha propósito central
- Aprovação e rejeição alimentam listas de bloqueio, melhorando a curadoria (RN-016)

### Negativas

- **O sistema depende de presença humana diária** (PR-01). Sem revisão, o canal fica em silêncio
- Posts pendentes envelhecem e a oferta pode encerrar antes da aprovação — mitigado pela expiração automática (RN-009)
- Trabalho recorrente, ainda que de poucos minutos
- Contraria a expectativa de autonomia associada à palavra "bot"

### Neutras

- A decisão é reversível de forma gradual: quando houver histórico suficiente, é possível liberar aprovação automática apenas para posts acima de um score de corte, mantendo revisão para o restante
- A máquina de estados (RN-017) já comporta esse caminho sem alteração estrutural

## Requisitos afetados

UC-04, UC-05, UC-06, UC-07, RF-020 a RF-032, RN-009, RN-016, RN-017, PR-01, RNF-018, RNF-020

## Revisão

Reavaliar quando:

- A taxa de rejeição se mantiver muito baixa por um período longo — sinal de que as regras já filtram bem e a revisão virou carimbo
- A dependência de presença diária se mostrar inviável na prática
- Houver dado suficiente para definir um score de corte confiável para aprovação automática parcial
