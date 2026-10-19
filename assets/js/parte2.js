/** TELA 2: formulário - o botão ENVIAR começa o jogo no nível fácil **/
(() => {
    $('.parte-2 .botao-submeter').on('click', () => {
        playSound('click.mp3', .5);
        iniciarNivel('facil');
    });
})();
