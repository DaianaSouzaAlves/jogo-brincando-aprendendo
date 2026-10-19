/**
 * utils.js - funções compartilhadas por todas as telas.
 * Deve ser o primeiro script carregado depois do jQuery.
 */

/** Mostra só a tela `n` (.parte-n). O data-parte do body troca o fundo (base.css). */
function trocaParte(n) {
    $('body').attr('data-parte', n);
    $('.parte').hide();
    $(`.parte.parte-${n}`).show();
}

/** Embaralha o array no próprio lugar (Fisher-Yates) e o devolve. */
function embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Monta um título colorido, letra por letra (estilo em .colorido, base.css).
 * Cada palavra fica num span próprio para a quebra de linha nunca cortar uma palavra.
 */
function montarHtmlColorido(frase, tag = 'h4') {
    const $titulo = $(`<${tag}>`, {class: 'colorido'});
    frase.split(' ').forEach((palavra, index) => {
        const $palavra = $('<span>', {class: 'text-nowrap'});
        if (index > 0) {
            $palavra.append('&nbsp;');
        }
        palavra.split('').forEach(letra => $palavra.append($('<span>').text(letra)));
        $titulo.append($palavra);
    });
    return $titulo;
}

/* ---------------------------- Sons ---------------------------- */

const audiosReproduzindo = {};

/**
 * Toca assets/sound/<arquivo>.
 * @param id    chave para interromper o som anterior com o mesmo id (opcional)
 * @param onEnd função chamada quando o som termina (opcional)
 */
function playSound(arquivo, volume = 1, id = null, onEnd = null) {
    id = id ?? Math.floor(Math.random() * 9000) + 1000;

    if (audiosReproduzindo[id]) {
        audiosReproduzindo[id].pause();
        audiosReproduzindo[id].currentTime = 0;
    }

    const audio = new Audio(`./assets/sound/${arquivo}`);
    if (arquivo === 'click.mp3') {
        audio.currentTime = .5; // pula o silêncio do começo do arquivo
    }
    audio.volume = volume;
    audiosReproduzindo[id] = audio;

    audio.onended = () => {
        delete audiosReproduzindo[id];
        if (typeof onEnd === 'function') {
            onEnd();
        }
    };
    audio.play().catch(e => console.error('Erro ao tocar o som:', e));

    return audio;
}

/** Música de fundo em loop. O navegador só libera áudio depois do primeiro clique. */
function tocarBackground() {
    playSound('background.mp3', .01, 'bg-music', tocarBackground);
}

$(document).one('click touchstart', tocarBackground);
