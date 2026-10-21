/**
 * Perguntas de ligação ("tipo": "ligacao" no perguntas.json).
 * Itens na coluna da esquerda e sombras na da direita. Liga-se arrastando do item até a
 * sombra, ou clicando no item e depois na sombra. A pergunta conta como acerto
 * se todos os pares forem ligados sem nenhum erro.
 *
 * Formato no JSON: "pares": [{"texto": "Gato", "imagem": "14/gato.png", "sombra": "14/gato_sombra.png"}]
 * ("imagem" e "sombra" são opcionais: sem elas aparece um texto provisório.)
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Peça da ligação: usa a imagem se existir, senão um texto provisório. */
function montarPeca(texto, imagem, classe) {
    const $peca = $('<div>', {class: `peca ${classe}`}).data('par', texto);
    if (imagem) {
        const $img = $('<img>', {alt: texto});
        $peca.append($img);
        resolverImagem(imagem).then(url => $img.attr('src', url));
    } else {
        $peca.addClass('peca-provisoria').text(classe === 'peca-sombra' ? `Sombra: ${texto}` : texto);
    }
    return $peca;
}

function montarLigacao(objPergunta, i) {
    $('.parte-4 .cena').empty();

    const $area = $('<div>', {class: 'ligacao'});
    const $itens = $('<div>', {class: 'ligacao-coluna'});
    const $sombras = $('<div>', {class: 'ligacao-coluna'});
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'ligacao-linhas');

    let restantes = objPergunta.pares.length;
    let errou = false;
    let $origem = null; // item selecionado, esperando a sombra

    /* ---- linhas (svg) ---- */

    // lado direito do item ou lado esquerdo da sombra, relativo à área
    const ponto = ($peca, lado) => {
        const a = $area[0].getBoundingClientRect();
        const p = $peca[0].getBoundingClientRect();
        return {x: (lado === 'direita' ? p.right : p.left) - a.left, y: p.top + p.height / 2 - a.top};
    };
    const moverLinha = (linha, de, ate) => {
        linha.setAttribute('x1', de.x);
        linha.setAttribute('y1', de.y);
        linha.setAttribute('x2', ate.x);
        linha.setAttribute('y2', ate.y);
    };
    const desenharLinha = (de, ate, classe = '') => {
        const linha = document.createElementNS(SVG_NS, 'line');
        linha.setAttribute('class', classe);
        moverLinha(linha, de, ate);
        svg.appendChild(linha);
        return linha;
    };

    /* ---- seleção e verificação ---- */

    const selecionar = $item => {
        desmarcar();
        $origem = $item.addClass('selecionada');
    };
    const desmarcar = () => {
        if ($origem) {
            $origem.removeClass('selecionada');
        }
        $origem = null;
    };

    const tentarLigar = ($item, $alvo) => {
        if ($item.hasClass('ligado') || $alvo.hasClass('ligado')) {
            return;
        }
        const certo = $item.data('par') === $alvo.data('par');
        const linha = desenharLinha(ponto($item, 'direita'), ponto($alvo, 'esquerda'), certo ? '' : 'errada');

        tocarFeedback(certo);
        if (certo) {
            $item.add($alvo).addClass('ligado');
            restantes--;
            if (restantes === 0) {
                setTimeout(() => proximaPergunta(i, !errou), 900);
            }
        } else {
            errou = true;
            $alvo.addClass('errou');
            setTimeout(() => {
                linha.remove();
                $alvo.removeClass('errou');
            }, 500);
        }
    };

    /* ---- peças ---- */

    embaralharArray([...objPergunta.pares]).forEach(par => {
        const $item = montarPeca(par.texto, par.imagem, 'peca-item');

        $item.on('pointerdown', () => {
            if ($item.hasClass('ligado')) {
                return;
            }
            playSound('click.mp3', .5);
            selecionar($item);

            // linha pontilhada que acompanha o mouse enquanto arrasta
            const de = ponto($item, 'direita');
            const provisoria = desenharLinha(de, de, 'provisoria');
            $(document)
                .on('pointermove.ligacao', e => {
                    const a = $area[0].getBoundingClientRect();
                    moverLinha(provisoria, de, {x: e.clientX - a.left, y: e.clientY - a.top});
                })
                .one('pointerup.ligacao', e => {
                    $(document).off('pointermove.ligacao');
                    provisoria.remove();
                    // soltou em cima de uma sombra? Se não, o item continua selecionado para o clique
                    const $alvo = $(document.elementFromPoint(e.clientX, e.clientY)).closest('.peca-sombra');
                    if ($alvo.length) {
                        tentarLigar($item, $alvo);
                        desmarcar();
                    }
                });
        });
        $itens.append($item);
    });

    embaralharArray([...objPergunta.pares]).forEach(par => {
        const $alvo = montarPeca(par.texto, par.sombra, 'peca-sombra');

        // alternativa ao arrastar: item já selecionado + clique na sombra
        $alvo.on('click', () => {
            if ($origem) {
                tentarLigar($origem, $alvo);
                desmarcar();
            }
        });
        $sombras.append($alvo);
    });

    $area.append(svg, $itens, $sombras);
    $('.parte-4 .alternativas').empty().append($area);
}
