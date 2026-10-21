/** TELA 1: início - o botão de play começa o jogo no nível fácil **/
(() => {
    const $btn = $('.parte-1 .botao-iniciar');

    $btn.on('click', () => perguntasProntas.then(() => iniciarNivel('facil')));

    // imagem do botão "apertado" enquanto o mouse está pressionado
    $btn.on('mousedown', () => {
        $btn.addClass('clicado');
        playSound('click.mp3', .5);
    });
    $btn.on('mouseup mouseleave', () => $btn.removeClass('clicado'));

    $btn.on('mouseover', () => playSound('hover.mp3', .05));
})();
