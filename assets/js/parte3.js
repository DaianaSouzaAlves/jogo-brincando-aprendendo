/** TELA 3: nível - cada botão (data-nivel) inicia as perguntas daquele nível **/
(() => {
    const $niveis = $('.parte-3 .nivel');

    $niveis.on('click', function () {
        iniciarNivel($(this).data('nivel'));
    });
    $niveis.on('mousedown', () => playSound('click.mp3', .5));
    $niveis.on('mouseenter', () => playSound('hover.mp3', .05));
})();
