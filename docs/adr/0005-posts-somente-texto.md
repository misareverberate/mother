# ADR-0005 — Posts somente com texto, sem imagens

**Status:** Aceito
**Data:** 2026-08-08
**Decisores:** isaac

## Contexto

Canais de oferta no Telegram costumam publicar com imagem: foto do produto, ou um card gerado com preço riscado, selo de desconto e marca do canal. A percepção comum é que post com imagem converte melhor que post só com texto.

O Telegram oferece três caminhos: enviar a foto original do produto, enviar um álbum com várias fotos, ou gerar uma imagem composta. Cada um adiciona trabalho e novos modos de falha:

- Baixar a imagem da URL fornecida pela fonte, que pode estar indisponível ou expirada
- Armazenar ou repassar a imagem, com implicações de banda e armazenamento
- Gerar card exige biblioteca de imagem, fontes tipográficas e tempo de processamento dentro do limite da função serverless
- Envio de mídia tem limites de taxa mais restritivos que envio de texto
- Falha ao obter a imagem precisa de comportamento definido: publicar sem ela, ou não publicar?

Do outro lado, o Telegram gera pré-visualização automática para links, o que já exibe imagem e título do produto na mensagem sem nenhum esforço do sistema.

## Decisão

**Publicar exclusivamente texto, com a pré-visualização automática de link habilitada.**

Nenhuma imagem é baixada, armazenada, gerada ou enviada. A estrutura do post é fixada em RN-012: título, preço, desconto quando disponível, link curto e sinalização de conteúdo comercial.

## Alternativas consideradas

### A) Foto original do produto

**Prós:** simples de implementar; imagem real do produto; boa apresentação visual.
**Contras:** depende da URL de imagem da fonte continuar válida; consome banda a cada envio; limites de taxa mais restritivos; exige tratar o caso de imagem indisponível; a legenda tem limite de caracteres menor que a mensagem de texto.
**Rejeitada** por adicionar um ponto de falha externo ao caminho de publicação.

### B) Card gerado com Pillow

**Prós:** melhor apresentação; identidade visual própria; destaque para desconto e preço.
**Contras:** exige biblioteca de imagem, fontes e testes de renderização; processamento dentro do limite da função; armazenamento das imagens geradas; muito código para um efeito não medido; qualquer mudança de layout vira trabalho de manutenção.
**Rejeitada** por custo desproporcional ao benefício em um sistema que ainda não publicou nada.

### C) Álbum com várias imagens

**Prós:** bom para vestuário e acessórios, em que ver ângulos importa.
**Contras:** soma todos os contras de A, multiplicados; limites de taxa ainda mais restritivos; ocupa muito espaço na tela do assinante, prejudicando quem lê o canal em sequência.
**Rejeitada** por complexidade e por prejudicar a leitura do canal.

### D) Somente texto — **escolhida**

**Prós:** menor superfície de falha possível no caminho de publicação; envio mais rápido; limites de taxa mais folgados; sem banda nem armazenamento; a pré-visualização automática já entrega imagem sem custo; posts compactos permitem ler várias ofertas rolando pouco.
**Contras:** menos impacto visual; a pré-visualização é controlada pelo Telegram e pelo site de destino, não pelo sistema; sem identidade visual própria; possivelmente menor taxa de clique.
**Aceita** porque a suposição de que imagem converte melhor não foi medida, e o encurtador ([ADR-0006](0006-encurtador-proprio.md)) permitirá medi-la antes de investir.

## Consequências

### Positivas

- O caminho de publicação tem uma dependência a menos
- Envio mais rápido e com limites de taxa mais folgados (RE-06)
- Sem custo de banda, armazenamento ou processamento de imagem
- Posts compactos favorecem a leitura em sequência
- A pré-visualização automática entrega parte do apelo visual de graça
- Um requisito a menos para implementar e testar

### Negativas

- Menor destaque visual em relação a canais concorrentes que usam card
- A pré-visualização depende do que o site de destino publica em seus metadados — o sistema não controla o que aparece
- Sem marca própria na mensagem
- Possível perda de taxa de clique, ainda não quantificada

### Neutras

- A decisão é reversível a baixo custo: o `TelegramPublisher` passaria a usar `sendPhoto` em vez de `sendMessage`, e o `ContentGenerator` ganharia um campo de mídia. Nada na arquitetura impede
- O encurtador fornecerá a base de comparação para uma eventual reversão fundamentada

## Requisitos afetados

RN-012, RN-014, RF-014, RE-06

## Revisão

Reavaliar quando:

- Houver dados de cliques suficientes para comparar desempenho com canais que usam imagem
- A pré-visualização automática se mostrar ruim ou ausente para a maior parte dos produtos
- O canal atingir tamanho em que apresentação visual passe a ser diferencial competitivo relevante

Neste caso, o teste correto é publicar metade das ofertas com imagem e metade sem, comparando a taxa de clique registrada pelo encurtador — e não trocar tudo de uma vez por impressão.
