const supabaseUrl = window.SUPABASE_CONFIG?.URL || 'https://jlfbzdqhaezdtyyajqlk.supabase.co';
const supabaseKey = window.SUPABASE_CONFIG?.ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsZmJ6ZHFoYWV6ZHR5eWFqcWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjM0NjksImV4cCI6MjA4ODkzOTQ2OX0.6VX3Z1FjxgZuBYALd2oU4bQl0nzbMcBUcc0nLW_DbvA';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const STORAGE_KEY = 'qmesa_auth';
const PLACEHOLDER_IMAGEM = '/images/prato_1.jpg';

const elementos = {
    abasCardapio: document.getElementById('abasCardapio'),
    gradeCardapio: document.getElementById('gradeCardapio'),
    mensagemCardapio: document.getElementById('mensagemCardapio')
};

let itensCardapio = [];
let categoriaAtual = 'all';

const STATUS_EM_FILA = ['Aguardando', 'Preparando', 'Chamado', 'A caminho'];
const TEMPO_MEDIO_POR_POSICAO = 10;
let timeoutToast = null;
let audioLiberado = sessionStorage.getItem('audio_liberado') === 'true';
let toastNotificacao = null;
let toastTitulo = null;
let toastTexto = null;
let audioNotificacao = null;

function mostrarToast(titulo, texto) {
    if (!toastNotificacao || !toastTitulo || !toastTexto) return;

    toastTitulo.textContent = titulo;
    toastTexto.textContent = texto;
    toastNotificacao.classList.add('ativo');

    if (timeoutToast) {
        clearTimeout(timeoutToast);
    }

    timeoutToast = setTimeout(() => {
        toastNotificacao.classList.remove('ativo');
    }, 4000);
}

function tocarSomNotificacao() {
    if (!audioNotificacao) return;
    if (!audioLiberado) return;

    try {
        audioNotificacao.pause();
        audioNotificacao.currentTime = 0;
        const promessa = audioNotificacao.play();
        if (promessa && typeof promessa.catch === 'function') {
            promessa.catch((erro) => {
                console.warn('NÃ£o foi possÃ­vel tocar o som da notificaÃ§Ã£o.', erro);
            });
        }
    } catch (erro) {
        console.warn('Erro ao tocar som da notificaÃ§Ã£o.', erro);
    }
}

function habilitarAudioNaPrimeiraInteracao() {
    if (!audioNotificacao || audioLiberado) return;

    const desbloquear = async () => {
        try {
            audioNotificacao.volume = 1;
            audioNotificacao.muted = false;
            const tentativa = audioNotificacao.play();
            if (tentativa && typeof tentativa.then === 'function') {
                await tentativa;
            }
            audioNotificacao.pause();
            audioNotificacao.currentTime = 0;
            audioLiberado = true;
            sessionStorage.setItem('audio_liberado', 'true');
        } catch (erro) {
            console.warn('NÃ£o foi possÃ­vel liberar o Ã¡udio na primeira interaÃ§Ã£o.', erro);
            audioLiberado = false;
            sessionStorage.removeItem('audio_liberado');
        }
    };

    document.addEventListener('click', desbloquear, { once: true });
    document.addEventListener('touchstart', desbloquear, { once: true });
    document.addEventListener('keydown', desbloquear, { once: true });
}

async function solicitarPermissaoNotificacao() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted' || Notification.permission === 'denied') return;

    const permissaoJaSolicitada = sessionStorage.getItem('notificacao_permissao_solicitada');
    if (permissaoJaSolicitada === 'true') return;

    try {
        await Notification.requestPermission();
        sessionStorage.setItem('notificacao_permissao_solicitada', 'true');
    } catch (erro) {
        console.warn('NÃ£o foi possÃ­vel solicitar permissÃ£o de notificaÃ§Ã£o.', erro);
    }
}

function notificar(titulo, corpo, tocarSom = false) {
    mostrarToast(titulo, corpo);

    if (tocarSom) {
        tocarSomNotificacao();
    }

    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    try {
        new Notification(titulo, { body: corpo });
    } catch (erro) {
        console.warn('Falha ao exibir notificaÃ§Ã£o.', erro);
    }
}

async function buscarPosicaoRealDaFila(fila) {
    const { data: itensFila, error } = await supabaseClient
        .from('fila_item')
        .select('id, status, hora_entrada')
        .eq('restaurante_id', fila.restaurante_id)
        .order('hora_entrada', { ascending: true });

    if (error) {
        throw error;
    }

    const ativos = (itensFila || [])
        .filter(item => STATUS_EM_FILA.includes(item.status));

    const indice = ativos.findIndex(item => item.id === fila.id);
    return indice >= 0 ? indice + 1 : null;
}

function tratarMudancas(statusAtual, posicaoAtual) {
    const statusAnterior = sessionStorage.getItem('fila_status_anterior');
    const posicaoAnterior = sessionStorage.getItem('fila_posicao_anterior');

    if (statusAnterior && statusAnterior !== statusAtual) {
        if (statusAtual === 'Preparando') {
            notificar('Qmesa', 'Sua mesa estÃ¡ sendo preparada.', true);
        } else if (statusAtual === 'Chamado') {
            notificar('Qmesa', 'Sua mesa estÃ¡ pronta. Dirija-se ao balcÃ£o.', true);
        } else if (statusAtual === 'A caminho') {
            notificar('Qmesa', 'Perfeito! Estamos aguardando vocÃª no balcÃ£o.', true);
        } else if (statusAtual === 'Atendido') {
            notificar('Qmesa', 'Seu atendimento foi concluÃ­do.', true);
        } else if (statusAtual === 'Cancelado' || statusAtual === 'Desistente') {
            notificar('Qmesa', 'Sua fila foi encerrada.', false);
        }
    }

    if (
        posicaoAnterior &&
        String(posicaoAnterior) !== String(posicaoAtual) &&
        STATUS_EM_FILA.includes(statusAtual)
    ) {
        notificar('Qmesa', `Sua posiÃ§Ã£o na fila mudou para ${posicaoAtual}.`, false);
    }

    sessionStorage.setItem('fila_status_anterior', statusAtual);
    sessionStorage.setItem('fila_posicao_anterior', posicaoAtual ?? '');
}

async function carregarNotificacoesFila() {
    const filaItemId = sessionStorage.getItem('fila_item_id');
    if (!filaItemId) return;

    try {
        const { data: fila, error } = await supabaseClient
            .from('fila_item')
            .select('id, status, posicao, hora_entrada, restaurante_id')
            .eq('id', filaItemId)
            .maybeSingle();

        if (error || !fila) return;

        if (!STATUS_EM_FILA.includes(fila.status)) return;

        const posicaoAtual = await buscarPosicaoRealDaFila(fila);
        tratarMudancas(fila.status, posicaoAtual);
    } catch (erro) {
        console.error('Erro ao atualizar notificaÃ§Ãµes de fila:', erro);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    toastNotificacao = document.getElementById('toastNotificacao');
    toastTitulo = document.getElementById('toastTitulo');
    toastTexto = document.getElementById('toastTexto');
    audioNotificacao = document.getElementById('audioNotificacao');

    if (audioNotificacao) {
        audioNotificacao.addEventListener('canplaythrough', () => {
            console.log('Ãudio de notificaÃ§Ã£o pronto.');
        });

        audioNotificacao.addEventListener('error', (e) => {
            console.error('Erro ao carregar Ã¡udio de notificaÃ§Ã£o', e);
        });
    }

    habilitarAudioNaPrimeiraInteracao();
    solicitarPermissaoNotificacao();
    carregarNotificacoesFila();
    setInterval(carregarNotificacoesFila, 5000);

    try {
        const restauranteId = await descobrirRestauranteId();

        if (!restauranteId) {
            mostrarMensagem('Nao foi possivel identificar o restaurante para carregar o cardapio.');
            return;
        }

        await carregarCardapio(restauranteId);
    } catch (error) {
        console.error('Erro ao carregar cardapio:', error);
        mostrarMensagem(`Nao foi possivel carregar o cardapio: ${error.message || 'erro desconhecido'}`);
    }
});

async function descobrirRestauranteId() {
    const filaItemId = window.sessionStorage.getItem('fila_item_id');

    if (filaItemId) {
        const { data, error } = await supabaseClient
            .from('fila_item')
            .select('restaurante_id')
            .eq('id', filaItemId)
            .single();

        if (!error && data?.restaurante_id) {
            return data.restaurante_id;
        }
    }

    const sessaoLocal = window.localStorage.getItem(STORAGE_KEY);
    if (sessaoLocal) {
        const sessao = JSON.parse(sessaoLocal);
        if (sessao?.restaurante_id) return sessao.restaurante_id;
    }

    const sessaoTemporaria = window.sessionStorage.getItem(STORAGE_KEY);
    if (sessaoTemporaria) {
        const sessao = JSON.parse(sessaoTemporaria);
        if (sessao?.restaurante_id) return sessao.restaurante_id;
    }

    return null;
}

async function carregarCardapio(restauranteId) {
    const { data, error } = await supabaseClient
        .from('item_cardapio')
        .select('id, nome, descricao, preco, categoria, disponivel')
        .eq('restaurante_id', restauranteId)
        .eq('disponivel', true)
        .order('categoria')
        .order('nome');

    if (error) throw error;

    itensCardapio = data || [];

    if (!itensCardapio.length) {
        mostrarMensagem('Nenhum item disponivel foi encontrado para este restaurante.');
        renderizarAbas([]);
        renderizarItens([]);
        return;
    }

    ocultarMensagem();

    const categorias = [...new Set(itensCardapio.map((item) => item.categoria).filter(Boolean))];
    renderizarAbas(categorias);
    renderizarItens(itensCardapio);
}

function renderizarAbas(categorias) {
    if (!elementos.abasCardapio) return;

    const abas = [
        { id: 'all', label: 'Todos' },
        ...categorias.map((categoria) => ({ id: categoria, label: categoria }))
    ];

    elementos.abasCardapio.innerHTML = abas.map((aba) => `
        <button
            type="button"
            class="aba-cardapio ${aba.id === categoriaAtual ? 'ativa' : ''}"
            data-filter="${escapeAttribute(aba.id)}"
        >
            ${escapeHtml(aba.label)}
        </button>
    `).join('');

    elementos.abasCardapio.querySelectorAll('.aba-cardapio').forEach((aba) => {
        aba.addEventListener('click', () => {
            categoriaAtual = aba.dataset.filter || 'all';
            renderizarAbas(categorias);
            renderizarItens(obterItensFiltrados());
        });
    });
}

function obterItensFiltrados() {
    if (categoriaAtual === 'all') {
        return itensCardapio;
    }

    return itensCardapio.filter((item) => item.categoria === categoriaAtual);
}

function renderizarItens(itens) {
    if (!elementos.gradeCardapio) return;

    if (!itens.length) {
        elementos.gradeCardapio.innerHTML = `
            <article class="item-cardapio">
                <img src="${PLACEHOLDER_IMAGEM}" alt="Cardapio sem itens" />
                <div class="corpo-item-cardapio">
                    <h2>Nenhum item nesta categoria</h2>
                    <p class="descricao-item">Escolha outra aba para visualizar os itens disponiveis.</p>
                </div>
            </article>
        `;
        return;
    }

    elementos.gradeCardapio.innerHTML = itens.map((item) => `
        <article class="item-cardapio" data-category="${escapeAttribute(item.categoria || '')}">
            <img src="${PLACEHOLDER_IMAGEM}" alt="${escapeAttribute(item.nome)}" />
            <div class="corpo-item-cardapio">
                <h2>${escapeHtml(item.nome)}</h2>
                <p class="preco-item">R$ ${formatarPreco(item.preco)}</p>
                <p class="descricao-item">${escapeHtml(item.descricao || 'Sem descricao cadastrada.')}</p>
            </div>
        </article>
    `).join('');
}

function formatarPreco(preco) {
    return Number(preco || 0).toFixed(2).replace('.', ',');
}

function mostrarMensagem(mensagem) {
    if (!elementos.mensagemCardapio) return;
    elementos.mensagemCardapio.textContent = mensagem;
    elementos.mensagemCardapio.style.display = 'block';
}

function ocultarMensagem() {
    if (!elementos.mensagemCardapio) return;
    elementos.mensagemCardapio.textContent = '';
    elementos.mensagemCardapio.style.display = 'none';
}

function escapeHtml(valor) {
    return String(valor)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function escapeAttribute(valor) {
    return escapeHtml(valor);
}
