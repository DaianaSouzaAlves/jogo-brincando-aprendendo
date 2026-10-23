# Brincando e Aprendendo

Jogo de perguntas infantil feito em HTML, CSS e JavaScript (Bootstrap + jQuery), sem back-end.
A criança responde perguntas em três níveis (fácil, médio e difícil), ganha estrelas pelo desempenho e, no fim, vê um resumo dos acertos de cada nível.

## Como jogar

1. Toque no botão de play para começar pelo nível fácil.
2. Responda às perguntas. Elas podem ter imagens e áudio.
3. No fim de cada nível aparecem os acertos e de 1 a 3 estrelas. Com 2 ou 3 estrelas, os níveis fácil e médio liberam o próximo; com 1 estrela, eles podem ser repetidos. Ao terminar o nível difícil, o jogo segue para o resumo e o desafio final.
4. No resumo dos três níveis, escolha **Ir para o desafio final**. Uma vinheta PNG “Desafio Final!” aparece brevemente na transição para o tabuleiro, como a apresentação dos níveis.
5. Separe as figuras pelas regras apresentadas no tabuleiro: **C** no começo, **O** no final e **A** no nome. O cronômetro começa quando a vinheta desaparece e o tabuleiro fica disponível. Fora do Preview do projeto, se a imagem armazenada não carregar, aparece um título estilizado de reserva.
6. Depois do desafio, o resumo mostra o tempo; é possível refazê-lo ou voltar à tela inicial.

## Como rodar

O jogo carrega o `perguntas.json` com `fetch`, então **não abre com duplo clique** no `index.html`.
Use um servidor local:

- **VS Code:** extensão *Live Server*, botão direito no `index.html` > *Open with Live Server*.
- **Terminal (com Python):** `python -m http.server 8000` e acesse `http://localhost:8000`.

Bootstrap, jQuery e Font Awesome vêm de CDN, então é preciso internet.

## Estrutura

```
index.html            todas as telas (blocos .parte-1 a .parte-7)
assets/
    css/              base.css (global) e telas.css (uma seção por tela)
    js/               utils.js, parte1.js, parte4.js, parte5.js, parte7.js, ligacao.js e perguntas.json
    img/              imagens das perguntas, dos níveis e dos resultados
    sound/            música de fundo, efeitos e áudio das perguntas
    fonts/            fonte Fredoka
```

## Perguntas

Ficam em `assets/js/perguntas.json`, em três listas: `facil`, `medio` e `dificil`.
As imagens de cada pergunta ficam em `assets/img/perguntas/<nivel>/<numero>/`.

Exemplo de pergunta de múltipla escolha:

```json
{
    "id": 4,
    "pergunta": "Qual animal está em cima da árvore?",
    "cena": ["4/imagem_01.png"],
    "correta": "Passarinho",
    "alternativas": [
        { "texto": "Cachorro", "imagem": "4/imagem_02.png" },
        { "texto": "Gato", "imagem": "4/imagem_03.png" },
        { "texto": "Passarinho", "imagem": "4/imagem_04.png" }
    ]
}
```

- `cena` (opcional): imagens mostradas junto da pergunta.
- `correta` deve ser igual ao `texto` de uma das alternativas.
- `dub` (opcional): áudio da pergunta ou da alternativa, em `assets/sound/`.
- `"ativa": false` tira a pergunta do sorteio sem apagá-la.
- `"tipo": "ligacao"` cria uma pergunta de arrastar cada item até a sua sombra.

## Desenvolvedores

- Andreza Taboni
- Daiana de Souza Alves
- Gabrielle de Oliveira
