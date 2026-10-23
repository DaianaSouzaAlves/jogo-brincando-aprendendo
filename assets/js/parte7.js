/* TELA 7: desafio final - classificar figuras pelos nomes e pelas letras */
const ANIMAIS_DESAFIO = {
    cachorro: {nome: 'Cachorro', imagem: 'assets/img/perguntas/facil/1/imagem_02.png'},
    cavalo: {nome: 'Cavalo', imagem: 'assets/img/perguntas/dificil/24/imagem_03.png'},
    coelho: {nome: 'Coelho', imagem: 'assets/img/perguntas/medio/14/imagem_02.png'},
    gato: {nome: 'Gato', imagem: 'assets/img/perguntas/facil/1/imagem_03.png'},
    urso: {nome: 'Urso', imagem: 'assets/img/perguntas/dificil/26/imagem_02.png'},
    peixe: {nome: 'Peixe', imagem: 'assets/img/perguntas/dificil/29/imagem_02.png'},
    sapo: {nome: 'Sapo', imagem: 'assets/img/perguntas/facil/3/imagem_01.png'},
    rato: {nome: 'Rato', imagem: 'assets/img/perguntas/facil/3/imagem_03.png'},
    vaca: {nome: 'Vaca', imagem: 'assets/img/perguntas/facil/1/imagem_01.png'},
    abelha: {nome: 'Abelha', imagem: 'assets/img/perguntas/facil/3/imagem_02.png'},
    galinha: {nome: 'Galinha', imagem: 'assets/img/perguntas/medio/13/imagem_03.png'},
    macaco: {nome: 'Macaco', imagem: 'assets/img/perguntas/medio/15/imagem_03.png'},
    porco: {nome: 'Porco', imagem: 'assets/img/perguntas/medio/13/imagem_01.png'}
};

const RODADAS_DESAFIO = [
    {
        letra: 'C',
        audio: 'animais letra C.mp3',
        tipo: 'inicio',
        instrucao: 'PARA A DIREITA, OS ANIMAIS QUE COMEÇAM COM A LETRA:',
        animais: ['cachorro', 'cavalo', 'coelho', 'gato', 'urso', 'peixe']
    },
    {
        letra: 'O',
        audio: 'animais letra O.mp3',
        tipo: 'fim',
        instrucao: 'PARA A DIREITA, OS ANIMAIS QUE TERMINAM COM A LETRA:',
        animais: ['gato', 'sapo', 'rato', 'vaca', 'peixe', 'abelha']
    },
    {
        letra: 'A',
        audio: 'animais letra A.mp3',
        tipo: 'contem',
        instrucao: 'PARA A DIREITA, OS ANIMAIS QUE TÊM A LETRA NO NOME:',
        animais: ['vaca', 'galinha', 'macaco', 'peixe', 'urso', 'porco']
    }
];

const TEMPO_INTRO_DESAFIO = 1800; // ms que a vinheta do desafio fica na tela
const TEMPO_ANIMACAO_INTRO_DESAFIO = 200 + TEMPO_INTRO_DESAFIO + 400; // entrada + tela + saída da vinheta
const TEMPO_TRAVA_AUDIO = 6000; // espera máxima pela fala de conclusão, caso o áudio não toque

let rodadaDesafioAtual = 0;
let animalSelecionado = null;
let animaisClassificados = 0;
let arrasteDesafio = null;
let eventosDesafioInstalados = false;
let tempoDesafioMs = null;
let tempoInicioDesafio = null;
let timerConclusaoDesafio = null;
let timerIntroDesafio = null;
let timerFalaDesafio = null;
let timerProximaEtapa = null;
let resumoMostrado = false;

function normalizarNomeDesafio(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

function animalAtendeRegra(animal, rodada) {
    const nome = normalizarNomeDesafio(animal.nome);
    const letra = normalizarNomeDesafio(rodada.letra);
    if (rodada.tipo === 'inicio') return nome.startsWith(letra);
    if (rodada.tipo === 'fim') return nome.endsWith(letra);
    return nome.includes(letra);
}

function iniciarDesafioFinal() {
    clearTimeout(timerConclusaoDesafio);
    clearTimeout(timerIntroDesafio);
    clearTimeout(timerFalaDesafio);
    clearTimeout(timerProximaEtapa);
    resumoMostrado = false;
    rodadaDesafioAtual = 0;
    animalSelecionado = null;
    animaisClassificados = 0;
    tempoDesafioMs = null;
    tempoInicioDesafio = null;
    instalarEventosDesafio();
    trocaParte(7);
    montarRodadaDesafio(TEMPO_ANIMACAO_INTRO_DESAFIO);

    const $vinheta = $('.parte-7 .intro-desafio-final');
    $vinheta.stop(true, true).fadeIn(200);
    playSound('desafio final.mp3', .5, 'p');
    timerIntroDesafio = setTimeout(() => {
        $vinheta.fadeOut(400, () => {
            tempoInicioDesafio = performance.now();
        });
    }, TEMPO_INTRO_DESAFIO);
}

function montarRodadaDesafio(atrasoFala = 0) {
    const rodada = RODADAS_DESAFIO[rodadaDesafioAtual];
    const $tela = document.querySelector('.parte-7');
    const $banco = $tela.querySelector('.desafio-banco');
    const $zonaNao = $tela.querySelector('.desafio-zona-nao');
    const $zonaSim = $tela.querySelector('.desafio-zona-sim');
    const $proxima = $tela.querySelector('.desafio-proxima');

    animalSelecionado = null;
    animaisClassificados = 0;
    $banco.replaceChildren();
    $zonaNao.querySelector('.zona-itens').replaceChildren();
    $zonaSim.querySelector('.zona-itens').replaceChildren();
    $tela.querySelector('.desafio-instrucao').textContent = rodada.instrucao;
    $tela.querySelector('.desafio-letra').textContent = rodada.letra;
    $tela.querySelector('.desafio-letra').setAttribute('aria-label', `Letra ${rodada.letra}`);
    $tela.querySelector('.desafio-selo').textContent = `DESAFIO FINAL · ETAPA ${rodadaDesafioAtual + 1} DE ${RODADAS_DESAFIO.length}`;
    $tela.querySelector('.desafio-status').textContent = `Etapa ${rodadaDesafioAtual + 1}. ${rodada.instrucao} ${rodada.letra}.`;
    $proxima.textContent = 'PRÓXIMA ETAPA';
    $proxima.hidden = true;

    clearTimeout(timerFalaDesafio);
    clearTimeout(timerProximaEtapa);
    timerFalaDesafio = setTimeout(() => playSound(rodada.audio, .5, 'p'), atrasoFala);

    embaralharArray([...rodada.animais]).forEach(id => {
        const animal = ANIMAIS_DESAFIO[id];
        const $card = document.createElement('button');
        $card.type = 'button';
        $card.className = 'animal-card';
        $card.dataset.animalId = id;
        $card.setAttribute('aria-pressed', 'false');
        $card.setAttribute('aria-label', `Figura de ${animal.nome}. Toque para selecionar ou arraste para um lado.`);

        const $imagem = document.createElement('img');
        $imagem.src = animal.imagem;
        $imagem.alt = '';
        $imagem.draggable = false;
        $card.append($imagem);
        $banco.append($card);
    });
}

function instalarEventosDesafio() {
    if (eventosDesafioInstalados) return;
    const $tela = document.querySelector('.parte-7');
    const $banco = $tela.querySelector('.desafio-banco');
    const $tabuleiro = $tela.querySelector('.desafio-tabuleiro');

    $banco.addEventListener('pointerdown', iniciarArrasteDesafio);
    document.addEventListener('pointermove', moverArrasteDesafio, {passive: false});
    document.addEventListener('pointerup', finalizarArrasteDesafio);
    document.addEventListener('pointercancel', cancelarArrasteDesafio);

    $banco.addEventListener('keydown', event => {
        const $card = event.target.closest('.animal-card');
        if (!$card || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        selecionarAnimalDesafio($card.dataset.animalId, true);
    });
    $banco.addEventListener('click', event => {
        const $card = event.target.closest('.animal-card');
        if ($card && event.detail === 0) selecionarAnimalDesafio($card.dataset.animalId, true);
    });

    $tabuleiro.addEventListener('click', event => {
        const $botaoZona = event.target.closest('.desafio-zona-escolher');
        if (!$botaoZona) return;
        if (!animalSelecionado) return;
        classificarAnimalDesafio(animalSelecionado, $botaoZona.dataset.resposta);
    });

    $tela.querySelector('.botao-repetir-instrucao').addEventListener('click', () => {
        playSound(RODADAS_DESAFIO[rodadaDesafioAtual].audio, .5, 'p');
    });

    $tela.querySelector('.desafio-proxima').addEventListener('click', () => {
        if (rodadaDesafioAtual >= RODADAS_DESAFIO.length - 1) return;
        rodadaDesafioAtual++;
        montarRodadaDesafio();
    });
    eventosDesafioInstalados = true;
}

function iniciarArrasteDesafio(event) {
    const $card = event.target.closest('.animal-card');
    if (!$card || $card.dataset.classificado === 'true') return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    arrasteDesafio = {
        id: $card.dataset.animalId,
        pointerId: event.pointerId,
        card: $card,
        inicioX: event.clientX,
        inicioY: event.clientY,
        moveu: false,
        fantasma: null
    };
    try { $card.setPointerCapture(event.pointerId); } catch (e) { /* captura pode não estar disponível */ }
}

function moverArrasteDesafio(event) {
    if (!arrasteDesafio || event.pointerId !== arrasteDesafio.pointerId) return;
    const dx = event.clientX - arrasteDesafio.inicioX;
    const dy = event.clientY - arrasteDesafio.inicioY;
    if (!arrasteDesafio.moveu && Math.hypot(dx, dy) < 9) return;
    arrasteDesafio.moveu = true;
    if (event.cancelable) event.preventDefault();

    if (!arrasteDesafio.fantasma) {
        const $fantasma = arrasteDesafio.card.cloneNode(true);
        $fantasma.classList.add('animal-card-fantasma');
        $fantasma.setAttribute('aria-hidden', 'true');
        $fantasma.tabIndex = -1;
        $fantasma.style.width = `${arrasteDesafio.card.getBoundingClientRect().width}px`;
        document.body.append($fantasma);
        arrasteDesafio.fantasma = $fantasma;
    }
    arrasteDesafio.fantasma.style.left = `${event.clientX}px`;
    arrasteDesafio.fantasma.style.top = `${event.clientY}px`;
}

function finalizarArrasteDesafio(event) {
    if (!arrasteDesafio || event.pointerId !== arrasteDesafio.pointerId) return;
    const arraste = arrasteDesafio;
    arrasteDesafio = null;
    if (arraste.fantasma) arraste.fantasma.remove();

    if (!arraste.moveu) {
        selecionarAnimalDesafio(arraste.id, true);
        return;
    }
    const $alvo = document.elementFromPoint(event.clientX, event.clientY);
    const $zona = $alvo && $alvo.closest('.desafio-zona');
    if ($zona) {
        classificarAnimalDesafio(arraste.id, $zona.dataset.resposta);
    } else {
        selecionarAnimalDesafio(arraste.id, false);
        atualizarStatusDesafio('Solte a figura na direita ou na esquerda.');
        playSound('esquerda ou direita.mp3', .5, 'p');
    }
}

function cancelarArrasteDesafio(event) {
    if (!arrasteDesafio || event.pointerId !== arrasteDesafio.pointerId) return;
    if (arrasteDesafio.fantasma) arrasteDesafio.fantasma.remove();
    arrasteDesafio = null;
}

function selecionarAnimalDesafio(id, tocarAudio = false) {
    const $tela = document.querySelector('.parte-7');
    const $cards = [...$tela.querySelectorAll('.desafio-banco .animal-card')];
    const $card = $cards.find(card => card.dataset.animalId === id);
    if (!$card || $card.dataset.classificado === 'true') return;

    $cards.forEach(card => {
        card.classList.toggle('animal-selecionado', card === $card);
        card.setAttribute('aria-pressed', String(card === $card));
    });
    animalSelecionado = id;
    if (tocarAudio) playSound(`respostas/${id}.mp3`, .5, 'p');
}

function classificarAnimalDesafio(id, resposta) {
    const rodada = RODADAS_DESAFIO[rodadaDesafioAtual];
    const animal = ANIMAIS_DESAFIO[id];
    const $tela = document.querySelector('.parte-7');
    const $card = [...$tela.querySelectorAll('.animal-card')].find(card => card.dataset.animalId === id);
    if (!animal || !$card || $card.dataset.classificado === 'true') return;

    const respostaCorreta = animalAtendeRegra(animal, rodada) ? 'sim' : 'nao';
    if (resposta !== respostaCorreta) {
        animalSelecionado = null;
        $card.classList.remove('animal-selecionado');
        $card.setAttribute('aria-pressed', 'false');
        $card.classList.add('animal-card-erro');
        setTimeout(() => $card.classList.remove('animal-card-erro'), 500);
        tocarFeedback(false, 'tente de novo.mp3');
        atualizarStatusDesafio('Esse não é o lado certo. Tente de novo.');
        return;
    }

    animalSelecionado = null;
    $card.dataset.classificado = 'true';
    $card.classList.remove('animal-selecionado');
    $card.classList.add('animal-classificado');
    $card.setAttribute('aria-pressed', 'false');
    $card.setAttribute('aria-label', `Figura de ${animal.nome}. Classificada corretamente.`);
    $tela.querySelector(`.desafio-zona[data-resposta="${resposta}"] .zona-itens`).append($card);
    animaisClassificados++;

    const concluiu = animaisClassificados === rodada.animais.length;
    const ultimaEtapa = rodadaDesafioAtual === RODADAS_DESAFIO.length - 1;
    const fala = concluiu ? (ultimaEtapa ? 'parabens.mp3' : 'proxima etapa.mp3') : null;
    tocarFeedback(true, fala, concluiu ? (ultimaEtapa ? irParaResumo : liberarProximaEtapa) : null);

    if (!concluiu) return;
    atualizarStatusDesafio(`Etapa ${rodadaDesafioAtual + 1} concluída.`);
    clearTimeout(timerFalaDesafio);

    // a etapa só libera depois da fala; o timer é a trava para o caso de o áudio não tocar
    if (!ultimaEtapa) {
        timerProximaEtapa = setTimeout(liberarProximaEtapa, TEMPO_TRAVA_AUDIO);
        return;
    }

    tempoDesafioMs = Math.max(0, Math.round(performance.now() - tempoInicioDesafio));
    clearTimeout(timerConclusaoDesafio);
    timerConclusaoDesafio = setTimeout(irParaResumo, TEMPO_TRAVA_AUDIO);
}

/** Mostra o botão da próxima etapa (pela fala de conclusão ou pela trava de tempo). */
function liberarProximaEtapa() {
    const $proxima = document.querySelector('.parte-7 .desafio-proxima');
    if (!$proxima.hidden) return;
    clearTimeout(timerProximaEtapa);
    $proxima.hidden = false;
    $proxima.focus();
}

/** Vai para o resumo uma única vez, quando o parabéns termina ou a trava estoura. */
function irParaResumo() {
    if (resumoMostrado) return;
    resumoMostrado = true;
    clearTimeout(timerConclusaoDesafio);
    mostrarResumoFinal();
}

function atualizarStatusDesafio(mensagem) {
    document.querySelector('.parte-7 .desafio-status').textContent = mensagem;
}

function configurarVinhetaDesafio() {
    const $imagem = document.querySelector('.parte-7 .intro-desafio-final img');
    const $fallback = document.querySelector('.parte-7 .intro-desafio-final-fallback');
    if (!$imagem || !$fallback) return;

    const mostrarFallback = () => {
        $imagem.hidden = true;
        $fallback.hidden = false;
    };
    const mostrarImagem = () => {
        $imagem.hidden = false;
        $fallback.hidden = true;
    };

    $imagem.addEventListener('error', mostrarFallback);
    $imagem.addEventListener('load', mostrarImagem);
    if ($imagem.complete) $imagem.naturalWidth ? mostrarImagem() : mostrarFallback();
}

configurarVinhetaDesafio();
