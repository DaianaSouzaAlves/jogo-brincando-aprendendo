/**
 * TELA 4: perguntas.
 * As perguntas vêm de assets/js/perguntas.json, separadas por nível.
 * Perguntas com "tipo": "ligacao" são tratadas em ligacao.js; as demais são de múltipla escolha.
 */

const PERSONAGENS = ['assets/img/menino.png', 'assets/img/menina.png']; // alternam a cada pergunta

let perguntasPorNivel = {};
let perguntasNivel = []; // perguntas do nível atual, já embaralhadas
let nivelAtual = null;
let questoesAcertadas = 0;

fetch('assets/js/perguntas.json')
    .then(response => response.json())
    .then(data => {
        perguntasPorNivel = data;
    });

/* ---------------------------- Imagens ---------------------------- */

const cacheRecortes = {};

/**
 * Devolve (via Promise) a URL da imagem de um item do JSON, que é uma string
 * ("12/imagem_01.png") ou um objeto {imagem, recorte, faixa}. O caminho é relativo
 * à pasta do nível. Itens com `recorte: [x, y, w, h]` (frações de 0 a 1) ou
 * `faixa: [i, n]` (a i-ésima de n fatias verticais) são recortados num canvas.
 */
function resolverImagem(item) {
    const obj = typeof item === 'string' ? {imagem: item} : item;
    const src = `assets/img/perguntas/${nivelAtual}/${obj.imagem}`;

    const recorte = obj.faixa
        ? [obj.faixa[0] / obj.faixa[1], 0, 1 / obj.faixa[1], 1]
        : obj.recorte;
    if (!recorte) {
        return Promise.resolve(src);
    }

    const chave = `${src}|${recorte.join(',')}`;
    if (cacheRecortes[chave]) {
        return Promise.resolve(cacheRecortes[chave]);
    }

    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            const [x, y, w, h] = recorte;
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.naturalWidth * w);
            canvas.height = Math.round(img.naturalHeight * h);
            canvas.getContext('2d').drawImage(
                img,
                img.naturalWidth * x, img.naturalHeight * y,
                img.naturalWidth * w, img.naturalHeight * h,
                0, 0, canvas.width, canvas.height
            );
            try {
                cacheRecortes[chave] = canvas.toDataURL('image/png');
            } catch (e) {
                cacheRecortes[chave] = src; // canvas bloqueado (página aberta via file://): usa a imagem inteira
            }
            resolve(cacheRecortes[chave]);
        };
        img.onerror = () => resolve(src);
        img.src = src;
    });
}

/* ---------------------------- Fluxo do jogo ---------------------------- */

const NIVEIS = ['facil', 'medio', 'dificil'];
const TEMPO_FEEDBACK = 1300; // ms que o acerto/erro fica na tela antes da próxima pergunta
const TEMPO_INTRO_NIVEL = 2000; // ms que o PNG do nível fica na tela

/** Sorteia a ordem das perguntas, mostra o PNG do nível por um instante e começa. */
function iniciarNivel(nivel) {
    nivelAtual = nivel;
    questoesAcertadas = 0;
    perguntasNivel = embaralharArray(
        (perguntasPorNivel[nivel] || []).filter(p => p.ativa !== false)
    );
    trocaParte(4);
    montarPergunta(0);

    const $intro = $('.parte-4 .intro-nivel');
    $intro.find('img').attr('src', `assets/img/nivel/nivel_${nivel}.png`);
    $intro.stop(true, true).fadeIn(200);
    setTimeout(() => $intro.fadeOut(400), TEMPO_INTRO_NIVEL);
}

/** Soma o acerto (se houve) e segue para a próxima pergunta ou para o resultado. */
function proximaPergunta(i, acertou) {
    if (acertou) {
        questoesAcertadas++;
    }
    if (i === perguntasNivel.length - 1) {
        mostrarResultado(questoesAcertadas, perguntasNivel.length);
    } else {
        montarPergunta(i + 1);
    }
}

function montarPergunta(i) {
    const objPergunta = perguntasNivel[i];

    const $pergunta = $('.parte-4 .pergunta');
    $pergunta.html(montarHtmlColorido(objPergunta.pergunta));
    if (objPergunta.dub) {
        $pergunta.append(
            $('<a href="javascript:void(0);" class="btn-volume"><i class="fa fa-volume-up"></i></a>')
                .on('click', () => playSound(objPergunta.dub, .5, 'p'))
        );
    }

    $('.parte-4 .personagem').attr('src', PERSONAGENS[i % PERSONAGENS.length]);

    if (objPergunta.tipo === 'ligacao') {
        montarLigacao(objPergunta, i);
        return;
    }

    montarCena(objPergunta.cena);
    const $alternativas = $('.parte-4 .alternativas').removeClass('respondida').empty();
    embaralharArray([...objPergunta.alternativas]).forEach((item, index) => {
        $alternativas.append(montarAlternativa(item, index, objPergunta, i));
    });
}

/* ---------------------------- Elementos da pergunta ---------------------------- */

/** Imagens do enunciado. O texto "+" vira um sinal de mais (usado nas contas). */
function montarCena(cena) {
    const $cena = $('.parte-4 .cena').empty();
    (cena || []).forEach(item => {
        if (item === '+') {
            $cena.append($('<span>', {class: 'sinal-cena'}).text('+'));
            return;
        }
        const $img = $('<img>', {class: 'cena-img', alt: ''}).css('visibility', 'hidden');
        $cena.append($img);
        resolverImagem(item).then(url => $img.attr('src', url).css('visibility', 'visible'));
    });
}

/** Mostra se acertou ou errou (e qual era a certa), espera um pouco e segue para a próxima. */
function responder($escolhido, objPergunta, i) {
    const $alternativas = $('.parte-4 .alternativas');
    if ($alternativas.hasClass('respondida')) {
        return; // já respondeu: ignora cliques extras durante a pausa
    }
    $alternativas.addClass('respondida');

    const acertou = $escolhido.data('texto') === objPergunta.correta;
    $escolhido.addClass(acertou ? 'certo' : 'errado');
    if (!acertou) {
        $alternativas.find('.card-alternativa')
            .filter((_, el) => $(el).data('texto') === objPergunta.correta)
            .addClass('certo');
    }

    setTimeout(() => proximaPergunta(i, acertou), TEMPO_FEEDBACK);
}

/** Card de uma alternativa: com imagem, ou só com o texto se não houver imagem. */
function montarAlternativa(item, index, objPergunta, i) {
    const $card = $('<a>', {
        class: `card card-alternativa card-alternativa-${(index % 3) + 1} d-flex flex-column justify-content-center align-items-center text-decoration-none`,
        href: 'javascript:void(0);'
    });

    if (item.dub) {
        $card.append(
            $('<button>', {class: 'btn btn-volume'})
                .append('<i class="fa fa-volume-up"></i>')
                .on('click', e => {
                    e.stopPropagation(); // tocar o som não escolhe a alternativa
                    playSound(item.dub, .5, 'p');
                })
        );
    }

    const $wrapper = $('<div>', {class: 'card-img-wrapper'});
    if (item.imagem) {
        const $img = $('<img>', {alt: item.texto, class: 'img-fluid'}).hide();
        const $loader = $('<div class="loader"><i class="fa fa-spin fa-spinner"></i></div>');
        $wrapper.append($loader, $img);
        resolverImagem(item).then(url => {
            $img.attr('src', url).fadeIn(150);
            $loader.hide();
        });
    } else {
        $wrapper.append($('<div>', {class: 'texto-alternativa'}).text(item.texto));
    }
    $card.append($wrapper);

    $card.data('texto', item.texto);
    $card
        .on('click', () => responder($card, objPergunta, i))
        .on('mousedown', () => playSound('click.mp3', .5));

    return $card;
}
