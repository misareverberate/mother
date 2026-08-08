# ADR-0004 — Stack híbrida: Python na API, Next.js no painel

**Status:** Aceito
**Data:** 2026-08-08
**Decisores:** isaac

## Contexto

O projeto tem duas naturezas distintas de código:

1. **Lógica de domínio e integrações** — coleta, curadoria, geração de conteúdo, publicação, encurtador. Trabalho de processamento de dados e chamadas a APIs externas.
2. **Interface de administração** — fila de aprovação, edição com validação em tempo real, telas de configuração e métricas. Trabalho de interface reativa.

A preferência declarada de linguagem para o projeto é **Python**. A plataforma escolhida em [ADR-0002](0002-plataforma-serverless-vercel.md) é o Vercel, cujo suporte de primeira classe é a Next.js — o suporte a Python existe, mas é para funções serverless, não para renderizar interfaces.

Há tensão real entre a preferência de linguagem e o encaixe na plataforma.

## Decisão

**Manter duas runtimes no mesmo projeto Vercel: Next.js com TypeScript para o painel, Python com FastAPI para a API e a lógica de domínio.**

| Camada | Runtime | Caminho | Responsabilidade |
|---|---|---|---|
| Painel | Next.js / TypeScript | `web/` | Renderizar telas, mediar sessão, chamar a API |
| API e domínio | Python 3.12 / FastAPI | `api/` + `src/` | Toda a regra de negócio e as integrações |

Fronteira: **o painel não contém regra de negócio.** Ele renderiza, valida por conveniência de interface e chama a API. Toda decisão de domínio acontece em Python, e toda validação é repetida no servidor (RNF-025).

Comunicação por HTTP com JSON, dentro do mesmo domínio — sem CORS, sem chamada externa.

## Alternativas consideradas

### A) Tudo em Python (FastAPI + Jinja2 + HTMX)

**Prós:** uma linguagem só; um conjunto de dependências; sem duplicação de tipos entre camadas; mais simples de manter sozinho; funciona no Vercel.
**Contras:** o painel exige interatividade que HTMX cobre com esforço crescente — validação de contagem de caracteres em tempo real, pré-visualização de formatação, seleção em lote; ferramentas de interface do ecossistema Python são menos maduras; foge do que o Vercel faz melhor.
**Rejeitada** pela quantidade de interatividade que a tela de fila exige, embora seja a alternativa mais simples e mereça reconsideração se o painel ficar mais modesto do que o previsto.

### B) Tudo em Next.js / TypeScript

**Prós:** encaixe perfeito no Vercel; uma linguagem; tipos compartilhados entre cliente e servidor; melhor experiência de desenvolvimento na plataforma.
**Contras:** contraria a preferência declarada de linguagem; abre mão do ecossistema Python para o trabalho de dados.
**Rejeitada** por contrariar a escolha de stack do projeto — que é uma decisão legítima de quem vai manter o código.

### C) Dois projetos separados

**Prós:** independência total; deploy e escala separados.
**Contras:** dois deploys para coordenar; CORS; dois domínios ou proxy; complexidade desproporcional ao tamanho do sistema.
**Rejeitada** por complexidade sem benefício correspondente nesta escala.

### D) Híbrida no mesmo projeto — **escolhida**

**Prós:** Python onde ele é bom (dados, integrações); Next.js onde ela é boa (interface, e é nativa da plataforma); um único deploy; mesma origem, sem CORS; a preferência de linguagem é respeitada onde mais importa.
**Contras:** duas runtimes, dois gerenciadores de pacotes, dois conjuntos de ferramentas; contratos entre camadas precisam ser mantidos manualmente em sincronia; ambiente local mais elaborado.
**Aceita** porque a divisão acompanha uma fronteira que já existe no problema — dados de um lado, interface do outro.

## Consequências

### Positivas

- Cada camada usa a ferramenta adequada ao seu trabalho
- Domínio em Python, testável sem navegador e sem interface
- Painel nativo da plataforma, com deploy e pré-visualização automáticos
- Um único repositório e um único deploy
- Mesma origem elimina CORS e simplifica a autenticação por cookie

### Negativas

- **Duas cadeias de ferramentas para manter:** `pip`/`requirements.txt` e `npm`/`package.json`
- Os tipos da API são definidos duas vezes — em Python e em TypeScript — sem verificação automática de que combinam
- Ambiente local exige `vercel dev` para orquestrar as duas runtimes
- Integração contínua precisa executar dois conjuntos de testes e verificações
- Contribuir exige conhecer as duas linguagens

### Neutras

- A duplicação de tipos pode ser resolvida depois gerando os tipos TypeScript a partir do esquema OpenAPI do FastAPI, se a manutenção manual incomodar
- A fronteira estrita entre painel e API é boa prática independentemente da escolha de linguagem

## Requisitos afetados

RE-07, RNF-025, e a organização de pastas descrita no [README](../../README.md)

## Revisão

Reavaliar quando:

- A duplicação de tipos causar defeitos recorrentes — sinal para gerar tipos a partir do OpenAPI
- O painel se mostrar mais simples que o previsto — a alternativa A volta a ser atraente
- A complexidade de manter duas runtimes superar o benefício de usar Python no domínio
