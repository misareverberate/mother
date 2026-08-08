# ADR-0001 — Abstrair a fonte de dados do TikTok Shop

**Status:** Aceito
**Data:** 2026-08-08
**Decisores:** isaac

## Contexto

O sistema inteiro depende de obter produtos do TikTok Shop. Há mais de um caminho possível para isso, e no momento da decisão **nenhum deles está confirmado**:

1. **API oficial do Partner Center** — exige aplicação aprovada, conta de vendedor ou parceiro, e passa por um processo de análise cujo prazo e resultado não estão sob controle do projeto.
2. **API de afiliado / creator** — voltada a quem divulga produtos de terceiros, retorna itens comissionáveis e gera links com atribuição. Requisitos de acesso diferentes e possivelmente menos rígidos.
3. **Outras origens** — feeds de parceiros, agregadores ou integrações futuras.

As três diferem em autenticação, formato de resposta, campos disponíveis, limites de taxa e modelo de link. Escolher uma agora e programar contra ela significa que uma negativa de acesso, ou a descoberta tardia de que outra é mais adequada, provoca reescrita de tudo que toca produto.

Além disso, o desenvolvimento não pode ficar bloqueado esperando aprovação externa. Curadoria, geração de conteúdo, fila, aprovação, publicação, encurtador e painel — nada disso depende de qual API entrega os produtos, desde que os produtos cheguem em algum formato conhecido.

## Decisão

**Definir uma interface `ProductSource` como único ponto de contato entre o sistema e qualquer fonte de produtos, e adiar a escolha da implementação concreta.**

```python
class ProductSource(Protocol):
    def fetch_page(self, cursor: str | None, filters: SourceFilters) -> ProductPage: ...
    def fetch_by_id(self, external_id: str) -> RawProduct | None: ...
    def build_affiliate_url(self, product: RawProduct) -> str: ...
```

Implementações previstas:

| Implementação | Uso |
|---|---|
| `MockSource` | Desenvolvimento e testes; lê de conjunto de dados local |
| `TikTokOfficialSource` | Quando e se o acesso à API oficial for aprovado |
| `TikTokAffiliateSource` | Alternativa pela via de afiliados |

A seleção é feita por variável de ambiente `PRODUCT_SOURCE`, sem alteração de código.

Cada implementação é responsável por: autenticar, paginar, converter a resposta bruta para `RawProduct` e traduzir erros da biblioteca HTTP para as exceções do domínio (`SourceAuthError`, `SourceRateLimitError`, `SourceUnavailableError`).

## Alternativas consideradas

### A) Programar diretamente contra a API oficial

**Prós:** menos código, menos indireção, contrato conhecido desde o início.
**Contras:** o desenvolvimento fica bloqueado até a aprovação; uma negativa inviabiliza o projeto inteiro; testar exige credenciais reais.
**Rejeitada porque** aposta todo o projeto em um evento externo sem prazo nem garantia.

### B) Programar contra a API de afiliado

**Prós:** provavelmente mais acessível para quem não é vendedor; já entrega link comissionável.
**Contras:** mesmo bloqueio da alternativa A, com o agravante de que os requisitos de acesso ainda não foram verificados.
**Rejeitada** pelo mesmo motivo.

### C) Raspagem de dados do site

**Prós:** sem processo de aprovação.
**Contras:** frágil a mudanças de layout, provavelmente contrária aos termos de uso, sem link de afiliado, sem garantia de continuidade.
**Rejeitada** por fragilidade e por conflito com os termos de serviço.

### D) Abstração com implementação simulada — **escolhida**

**Prós:** desenvolvimento imediato; troca de fonte sem reescrita; testes sem rede; risco externo isolado em um único módulo.
**Contras:** uma camada a mais de indireção; risco de a interface não acomodar bem a API real quando ela chegar.
**Aceita** porque o custo da indireção é baixo e o risco que ela elimina é existencial.

## Consequências

### Positivas

- O desenvolvimento avança sem depender de aprovação externa
- A decisão entre API oficial e de afiliado pode ser tomada com informação melhor, mais adiante
- Testes de domínio rodam sem rede e sem credenciais
- Uma eventual troca de fonte no futuro afeta um módulo, não o sistema

### Negativas

- A interface foi desenhada sem conhecer em detalhe nenhuma das APIs reais; pode precisar de ajuste quando a primeira implementação concreta for escrita
- `MockSource` precisa produzir dados realistas — dados simulados bons demais escondem problemas que só aparecem em produção
- Há um custo de tradução em cada implementação concreta

### Neutras

- `SourceFilters` expõe apenas filtros que se espera que qualquer fonte suporte. Filtros específicos de uma fonte ficam do lado da implementação, e o `CurationEngine` reaplica tudo de todo modo

## Requisitos afetados

RF-002, RF-004, RE-05, PR-03

## Revisão

Reavaliar quando:

- O acesso a qualquer uma das APIs for confirmado — momento de escrever a primeira implementação concreta e verificar se a interface aguenta
- A primeira implementação real exigir mudança na assinatura da interface
- Surgir necessidade de operar com mais de uma fonte simultaneamente
