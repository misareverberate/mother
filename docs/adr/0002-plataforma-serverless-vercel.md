# ADR-0002 — Executar em plataforma serverless (Vercel)

**Status:** Aceito
**Data:** 2026-08-08
**Decisores:** isaac

## Contexto

O sistema precisa de um lugar para rodar. Os requisitos de hospedagem são:

- Custo inicial próximo de zero (RE-08)
- Servir um painel web e endpoints de API
- Executar tarefas periódicas (coleta, reavaliação de preços)
- Publicar no Telegram de forma assíncrona
- Responder a redirecionamentos com baixa latência (RNF-004)
- Não exigir administração de servidor por parte de um desenvolvedor solo

A maior parte da literatura sobre bots de Telegram assume um processo permanentemente ativo, tipicamente com `bot.polling()` e um agendador em memória. Esse modelo é incompatível com execução serverless, e a escolha da plataforma determina se ele está disponível ou não.

## Decisão

**Hospedar o sistema no Vercel, aceitando o modelo serverless e todas as suas restrições.**

Consequências diretas, tratadas em detalhe na [seção 4 da arquitetura](../architecture/04-restricoes-serverless.md):

| Necessidade | Solução no modelo serverless |
|---|---|
| Receber eventos do Telegram | Webhook, nunca long polling |
| Executar tarefas periódicas | Vercel Cron invocando endpoints HTTP |
| Processar fila | QStash empurrando por HTTP ([ADR-0003](0003-fila-qstash-push-http.md)) |
| Manter estado | Supabase (Postgres) e Upstash (Redis) |
| Processar cargas longas | Fatiamento com cursor e retomada entre invocações |

## Alternativas consideradas

### A) VPS com Docker Compose

**Prós:** processos longos permitidos; polling e agendador em memória funcionam; controle total; sem limite de tempo de execução; custo previsível.
**Contras:** exige administrar servidor — atualizações, certificados, backups, monitoramento, segurança; custo fixo mensal mesmo com o sistema ocioso; deploy manual ou por esteira própria.
**Rejeitada porque** o trabalho de operação recorrente pesa mais que a liberdade obtida, para um projeto pessoal mantido por uma pessoa.

### B) PaaS com processos contínuos (Railway, Render, Fly.io)

**Prós:** permite processo permanentemente ativo; deploy por git push; menos administração que um VPS.
**Contras:** as camadas gratuitas hibernam serviços ociosos, o que quebra justamente o polling e o agendador que justificariam a escolha; custo aparece cedo ao sair do plano gratuito.
**Rejeitada porque** a vantagem sobre serverless — processo contínuo — é exatamente o que a camada gratuita não entrega de forma confiável.

### C) Máquina local ou Raspberry Pi

**Prós:** custo zero de hospedagem; sem limites de plataforma.
**Contras:** depende da energia e da internet da residência; exige exposição de porta ou túnel para receber webhooks; sem redundância; o painel só é acessível de fora com configuração adicional.
**Rejeitada** por indisponibilidade previsível.

### D) Vercel serverless — **escolhida**

**Prós:** camada gratuita generosa para este volume; deploy por git push; painel Next.js roda nativamente; cron incluído na plataforma; certificado, domínio e rede de distribuição resolvidos; escala automática sem configuração.
**Contras:** proíbe processo longo; impõe tempo máximo de execução; cold start; exige serviços externos para fila e estado; obriga a repensar padrões consagrados de bot.
**Aceita** porque as restrições são contornáveis com desenho adequado, e o que se ganha — zero administração, zero custo, deploy trivial — é exatamente o que falta a um projeto pessoal.

## Consequências

### Positivas

- Custo de operação de R$ 0 no volume previsto (RNF-031)
- Nenhuma administração de servidor
- Deploy por `git push`, com pré-visualização por branch
- Escala automática absorve picos de clique sem intervenção
- HTTPS, domínio e distribuição geográfica já resolvidos

### Negativas

- **Nenhum padrão convencional de bot pode ser usado.** Polling, agendador em processo e worker de fila estão todos fora
- Toda operação sobre coleções precisa de controle de orçamento de tempo (RNF-001)
- Cold start adiciona latência à primeira invocação após ociosidade
- Dependência de dois serviços externos adicionais (Supabase e Upstash) que um VPS dispensaria
- Sem transação abrangendo banco e fila; exige reconciliação (seção 4.8 da arquitetura)
- Aprisionamento parcial à plataforma via Vercel Cron e configuração de rotas

### Neutras

- A ausência de estado em memória força um desenho mais limpo, que seria bom de todo modo
- Migrar para contêineres depois é viável: o domínio é agnóstico; mudariam a camada de entrada e o agendamento

## Requisitos afetados

RE-01, RE-02, RE-03, RE-08, RNF-001, RNF-008, RNF-031, e toda a [seção 4 da arquitetura](../architecture/04-restricoes-serverless.md)

## Revisão

Reavaliar quando:

- O volume de coleta deixar de caber em invocações fatiadas
- O custo dos serviços externos superar o de um VPS
- Surgir necessidade de processamento contínuo que não caiba no modelo de eventos
- A latência de cold start comprometer RNF-004 de forma persistente
