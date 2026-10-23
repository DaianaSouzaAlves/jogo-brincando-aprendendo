/** TELA 5: resultado individual dos níveis; 2+ estrelas libera a próxima etapa **/

/** Último resultado de cada nível ({acertos, total, estrelas}), usado no resumo final. */
const resultadosNiveis = {};

/** Até 33% de acerto: 1 estrela; até 66%: 2; acima disso: 3. */
function calcularEstrelas(acertos, total) {
    const aproveitamento = total ? acertos / total : 0;
    return aproveitamento <= 1 / 3 ? 1 : aproveitamento <= 2 / 3 ? 2 : 3;
}

/** Mostra as estrelas e o botão de repetir, de próximo nível ou de desafio final (no difícil). */
function mostrarResultado(acertos, total) {
    const $tela = $('.parte-5');
    const estrelas = calcularEstrelas(acertos, total);
    const ultimoNivel = NIVEIS.indexOf(nivelAtual) === NIVEIS.length - 1;
    const liberou = estrelas > 1;
    const temProximo = liberou && !ultimoNivel;
    const temDesafio = liberou && ultimoNivel;

    resultadosNiveis[nivelAtual] = {acertos, total, estrelas};
    clearTimeout(timerFalaPergunta);
    pararSom('p');
    playSound(['pode melhorar.mp3', 'foi bem.mp3', 'muito bem.mp3'][estrelas - 1], .5, 'p');

    $tela.find('.numero-acertos').text(acertos);
    $tela.find('.texto-acertos').text(acertos === 1 ? 'ACERTO!' : 'ACERTOS!');
    $tela.find('.resultado-personagem').attr('src', `assets/img/${['resultado_melhore', 'resultado_medio', 'resultado_bom'][estrelas - 1]}.png`);
    $tela.find('.estrela').each((i, el) => $(el).toggleClass('apagada', i >= estrelas));
    $tela.find('.botao-proximo').toggle(temProximo);
    $tela.find('.botao-desafio-final').toggle(temDesafio);
    $tela.find('.botao-repetir').toggle(!temProximo && !temDesafio);
    trocaParte(5);
}

/** TELA 6: resumo dos três níveis com o tempo do desafio final, mostrado depois do desafio. */
function mostrarResumoFinal() {
    NIVEIS.forEach(nivel => {
        const {acertos = 0, total = 0, estrelas = 0} = resultadosNiveis[nivel] || {};
        const $card = $(`.parte-6 .resumo-card[data-nivel="${nivel}"]`);
        $card.find('.acertos').text(acertos);
        $card.find('.resumo-nota span').text(`/${total}`);
        $card.find('.estrela').each((i, el) => $(el).toggleClass('apagada', i >= estrelas));
    });

    $('.parte-6 .tempo-desafio').text(formatarTempoDesafio(tempoDesafioMs));
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

$('.parte-5 .botao-desafio-final')
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
