/** TELA 5: resultado individual dos níveis; 2+ estrelas libera a próxima etapa **/

/** Último resultado de cada nível ({acertos, total, estrelas}), usado no resumo final. */
const resultadosNiveis = {};

/** Até 33% de acerto: 1 estrela; até 66%: 2; acima disso: 3. */
function calcularEstrelas(acertos, total) {
    const aproveitamento = total ? acertos / total : 0;
    return aproveitamento <= 1 / 3 ? 1 : aproveitamento <= 2 / 3 ? 2 : 3;
}

/** Mostra as estrelas e o botão de repetir ou de próximo nível. */
function mostrarResultado(acertos, total) {
    const $tela = $('.parte-5');
    const estrelas = calcularEstrelas(acertos, total);
    const ultimoNivel = NIVEIS.indexOf(nivelAtual) === NIVEIS.length - 1;
    const temProximo = estrelas > 1 && !ultimoNivel;

    resultadosNiveis[nivelAtual] = {acertos, total, estrelas};
    clearTimeout(timerFalaPergunta);
    pararSom('p');

    // Ao passar pelo difícil, mostra primeiro o resumo dos três níveis.
    if (ultimoNivel) {
        mostrarResumoFinal(false);
        return;
    }

    $tela.find('.numero-acertos').text(acertos);
    $tela.find('.texto-acertos').text(acertos === 1 ? 'ACERTO!' : 'ACERTOS!');
    $tela.find('.resultado-personagem').attr('src', `assets/img/${['resultado_melhore', 'resultado_medio', 'resultado_bom'][estrelas - 1]}.png`);
    $tela.find('.estrela').each((i, el) => $(el).toggleClass('apagada', i >= estrelas));
    $tela.find('.botao-proximo').toggle(temProximo);
    $tela.find('.botao-repetir').toggle(!temProximo);
    trocaParte(5);
}

/** TELA 6: resumo dos níveis, antes do desafio ou com o tempo após concluí-lo. */
function mostrarResumoFinal(depoisDoDesafio = false) {
    NIVEIS.forEach(nivel => {
        const {acertos, total, estrelas} = resultadosNiveis[nivel];
        const $card = $(`.parte-6 .resumo-card[data-nivel="${nivel}"]`);
        $card.find('.acertos').text(acertos);
        $card.find('.resumo-nota span').text(`/${total}`);
        $card.find('.estrela').each((i, el) => $(el).toggleClass('apagada', i >= estrelas));
    });

    $('.parte-6 .final-desafio-tempo')
        .prop('hidden', !depoisDoDesafio)
        .find('.tempo-desafio').text(depoisDoDesafio ? formatarTempoDesafio(tempoDesafioMs) : '00:00');
    $('.parte-6 .botao-desafio-final').prop('hidden', depoisDoDesafio);
    $('.parte-6 .botao-refazer-desafio, .parte-6 .botao-voltar-inicio').prop('hidden', !depoisDoDesafio);
    trocaParte(6);
}

/** Limpa a partida anterior quando a criança inicia um novo jogo. */
function limparResultadosJogo() {
    Object.keys(resultadosNiveis).forEach(nivel => delete resultadosNiveis[nivel]);
    tempoDesafioMs = null;
}

function voltarInicioDoJogo() {
    limparResultadosJogo();
    trocaParte(1);
}

$('.parte-6 .botao-desafio-final')
    .on('click', () => iniciarDesafioFinal())
    .on('mousedown', () => playSound('click.mp3', .5));

$('.parte-6 .botao-refazer-desafio')
    .on('click', () => iniciarDesafioFinal())
    .on('mousedown', () => playSound('click.mp3', .5));

$('.parte-6 .botao-voltar-inicio')
    .on('click', () => voltarInicioDoJogo())
    .on('mousedown', () => playSound('click.mp3', .5));

$('.parte-5 .botao-repetir')
    .on('click', () => iniciarNivel(nivelAtual))
    .on('mousedown', () => playSound('click.mp3', .5));

$('.parte-5 .botao-proximo')
    .on('click', () => iniciarNivel(NIVEIS[NIVEIS.indexOf(nivelAtual) + 1]))
    .on('mousedown', () => playSound('click.mp3', .5));
