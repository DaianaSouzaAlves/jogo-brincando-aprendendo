/** TELA 5: resultado - 3 estrelas pelo aproveitamento; 2+ libera o próximo nível **/

/** Até 33% de acerto: 1 estrela; até 66%: 2; acima disso: 3. */
function calcularEstrelas(acertos, total) {
    const aproveitamento = total ? acertos / total : 0;
    return aproveitamento <= 1 / 3 ? 1 : aproveitamento <= 2 / 3 ? 2 : 3;
}

/** Mostra as estrelas e o botão de jogar de novo ou de próximo nível. */
function mostrarResultado(acertos, total) {
    const $tela = $('.parte-5');
    const estrelas = calcularEstrelas(acertos, total);
    const temProximo = estrelas > 1 && NIVEIS.indexOf(nivelAtual) < NIVEIS.length - 1;

    $tela.find('.estrela').each((i, el) => $(el).toggleClass('apagada', i >= estrelas));

    // 1 estrela: só jogar novamente. 2 ou 3: o próximo nível vira botão (no último nível, só repetir)
    $tela.find('.botao-proximo').toggle(temProximo);
    $tela.find('.botao-repetir').toggle(!temProximo);
    clearTimeout(timerFalaPergunta);
    pararSom('p'); // a fala da última pergunta não continua na tela de resultado
    trocaParte(5);
}

$('.parte-5 .botao-repetir')
    .on('click', () => iniciarNivel(nivelAtual))
    .on('mousedown', () => playSound('click.mp3', .5));

$('.parte-5 .botao-proximo')
    .on('click', () => iniciarNivel(NIVEIS[NIVEIS.indexOf(nivelAtual) + 1]))
    .on('mousedown', () => playSound('click.mp3', .5));
