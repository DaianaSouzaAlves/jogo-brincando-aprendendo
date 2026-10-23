/** TELA 5: resultado - 3 estrelas pelo aproveitamento; 2+ libera o próximo nível **/

/** Último resultado de cada nível ({acertos, total, estrelas}), usado no resumo final. */
const resultadosNiveis = {};

/** Até 33% de acerto: 1 estrela; até 66%: 2; acima disso: 3. */
function calcularEstrelas(acertos, total) {
    const aproveitamento = total ? acertos / total : 0;
    return aproveitamento <= 1 / 3 ? 1 : aproveitamento <= 2 / 3 ? 2 : 3;
}

/** Mostra as estrelas e o botão de jogar de novo ou de próximo nível. */
function mostrarResultado(acertos, total) {
    const $tela = $('.parte-5');
    const estrelas = calcularEstrelas(acertos, total);
    const ultimoNivel = NIVEIS.indexOf(nivelAtual) === NIVEIS.length - 1;
    const temProximo = estrelas > 1 && !ultimoNivel;

    resultadosNiveis[nivelAtual] = {acertos, total, estrelas};
    clearTimeout(timerFalaPergunta);
    pararSom('p'); // a fala da última pergunta não continua na tela de resultado

    // passou do último nível: em vez do resultado do nível, mostra o resumo dos três
    if (ultimoNivel && estrelas > 1) {
        mostrarResumoFinal();
        return;
    }

    $tela.find('.numero-acertos').text(acertos);
    $tela.find('.texto-acertos').text(acertos === 1 ? 'ACERTO!' : 'ACERTOS!');
    // personagem conforme o desempenho: 1 estrela = melhore, 2 = médio, 3 = bom
    $tela.find('.resultado-personagem').attr('src', `assets/img/${['resultado_melhore', 'resultado_medio', 'resultado_bom'][estrelas - 1]}.png`);
    $tela.find('.estrela').each((i, el) => $(el).toggleClass('apagada', i >= estrelas));

    // 1 estrela: só jogar novamente. 2 ou 3: o próximo nível vira botão (no último nível, só repetir)
    $tela.find('.botao-proximo').toggle(temProximo);
    $tela.find('.botao-repetir').toggle(!temProximo);
    trocaParte(5);
}

/** TELA 6: acertos e estrelas de cada nível, depois de terminar o último. */
function mostrarResumoFinal() {
    NIVEIS.forEach(nivel => {
        const {acertos, total, estrelas} = resultadosNiveis[nivel];
        const $card = $(`.parte-6 .resumo-card[data-nivel="${nivel}"]`);
        $card.find('.acertos').text(acertos);
        $card.find('.resumo-nota span').text(`/${total}`);
        $card.find('.estrela').each((i, el) => $(el).toggleClass('apagada', i >= estrelas));
    });
    trocaParte(6);
}

$('.parte-6 .botao-jogar-novamente')
    .on('click', () => iniciarNivel(NIVEIS[0]))
    .on('mousedown', () => playSound('click.mp3', .5));

$('.parte-5 .botao-repetir')
    .on('click', () => iniciarNivel(nivelAtual))
    .on('mousedown', () => playSound('click.mp3', .5));

$('.parte-5 .botao-proximo')
    .on('click', () => iniciarNivel(NIVEIS[NIVEIS.indexOf(nivelAtual) + 1]))
    .on('mousedown', () => playSound('click.mp3', .5));
