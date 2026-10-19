/** TELA 5: resultado **/

$('.parte-5 .titulo-resultado').append(montarHtmlColorido('Bom trabalho!', 'h1'));

/** Mostra os acertos e a imagem correspondente ao desempenho (>= 75% bom, >= 50% médio). */
function mostrarResultado(acertos, total) {
    const $tela = $('.parte-5');
    const aproveitamento = acertos / total;
    const imagem = aproveitamento >= 0.75 ? 'resultado_bom'
        : aproveitamento >= 0.5 ? 'resultado_medio'
            : 'resultado_melhore';

    $tela.find('.qtdAcertos').text(acertos);
    $tela.find('.qtdTotal').text(total);
    $tela.find('.imagem-resultado').attr('src', `assets/img/${imagem}.png`);
    trocaParte(5);
}

// "Jogar novamente" volta para a escolha do nível
$('.parte-5 .btn')
    .on('click', () => trocaParte(3))
    .on('mousedown', () => playSound('click.mp3', .5));
