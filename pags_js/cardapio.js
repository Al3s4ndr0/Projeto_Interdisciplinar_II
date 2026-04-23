const supabaseUrl = window.SUPABASE_CONFIG?.URL || 'https://jlfbzdqhaezdtyyajqlk.supabase.co';
const supabaseKey = window.SUPABASE_CONFIG?.ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsZmJ6ZHFoYWV6ZHR5eWFqcWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjM0NjksImV4cCI6MjA4ODkzOTQ2OX0.6VX3Z1FjxgZuBYALd2oU4bQl0nzbMcBUcc0nLW_DbvA';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const STORAGE_KEY = 'qmesa_auth';
const PLACEHOLDER_IMAGEM = '../images/prato_1.jpg';

const elementos = {
    abasCardapio: document.getElementById('abasCardapio'),
    gradeCardapio: document.getElementById('gradeCardapio'),
    mensagemCardapio: document.getElementById('mensagemCardapio')
};

let itensCardapio = [];
let categoriaAtual = 'all';

document.addEventListener('DOMContentLoaded', async () => {
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
