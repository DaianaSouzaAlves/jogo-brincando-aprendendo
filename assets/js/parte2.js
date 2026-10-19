/** TELA 2: formulário - o botão ENVIAR leva à escolha do nível **/
(() => {
    $('.parte-2 .botao-submeter').on('click', () => {
        playSound('click.mp3', .5);
        trocaParte(3);
    });
})();
