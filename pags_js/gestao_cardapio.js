const supabaseUrl = window.SUPABASE_CONFIG?.URL || 'https://jlfbzdqhaezdtyyajqlk.supabase.co';
const supabaseKey = window.SUPABASE_CONFIG?.ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsZmJ6ZHFoYWV6ZHR5eWFqcWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjM0NjksImV4cCI6MjA4ODkzOTQ2OX0.6VX3Z1FjxgZuBYALd2oU4bQl0nzbMcBUcc0nLW_DbvA';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const STORAGE_KEY = 'qmesa_auth';

let itensCardapio = [];
let itemEditando = null;
let sessaoAtual = null;

const elementos = {
    modalItemCardapio: document.getElementById('modalItemCardapio'),
    formItemCardapio: document.getElementById('formItemCardapio'),
    modalTitulo: document.getElementById('modalTitulo'),
    itemNome: document.getElementById('itemNome'),
    itemDescricao: document.getElementById('itemDescricao'),
    itemCategoria: document.getElementById('itemCategoria'),
    itemPreco: document.getElementById('itemPreco'),
    itemStatus: document.getElementById('itemStatus'),
    btnAdicionarItem: document.getElementById('btnAdicionarItem'),
    btnFecharModal: document.getElementById('btnFecharModal'),
    btnCancelarModal: document.getElementById('btnCancelarModal'),
    buscaCardapio: document.getElementById('buscaCardapio'),
    filtroCategoria: document.getElementById('filtroCategoria'),
    filtroStatus: document.getElementById('filtroStatus'),
    tabelaItens: document.getElementById('tabelaItens'),
    tabelaVazia: document.getElementById('tabelaVazia'),
    totalItens: document.getElementById('totalItens'),
    itensDisponiveis: document.getElementById('itensDisponiveis'),
    itensIndisponiveis: document.getElementById('itensIndisponiveis'),
    precoMedio: document.getElementById('precoMedio'),
    nomeRestauranteSidebar: document.getElementById('nomeRestauranteSidebar'),
    nomeUsuarioSidebar: document.getElementById('nomeUsuarioSidebar'),
    perfilUsuarioSidebar: document.getElementById('perfilUsuarioSidebar'),
    avatarUsuarioSidebar: document.getElementById('avatarUsuarioSidebar'),
    btnLogoutSidebar: document.getElementById('btnLogoutSidebar'),
    btnToggleSidebar: document.getElementById('btnToggleSidebar'),
    btnAbrirSidebar: document.getElementById('btnAbrirSidebar'),
    sidebarGestor: document.getElementById('sidebarGestor'),
    sidebarBackdrop: document.getElementById('sidebarBackdrop')
};

document.addEventListener('DOMContentLoaded', async () => {
    sessaoAtual = obterSessao();
    preencherContextoUsuario();
    inicializarEventListeners();
    await carregarItensCardapio();
});

function inicializarEventListeners() {
    elementos.btnAdicionarItem?.addEventListener('click', abrirModalAdicionar);
    elementos.btnFecharModal?.addEventListener('click', fecharModal);
    elementos.btnCancelarModal?.addEventListener('click', fecharModal);
    elementos.formItemCardapio?.addEventListener('submit', salvarItem);
    elementos.buscaCardapio?.addEventListener('input', renderizarTabela);
    elementos.filtroCategoria?.addEventListener('change', renderizarTabela);
    elementos.filtroStatus?.addEventListener('change', renderizarTabela);

    elementos.modalItemCardapio?.addEventListener('click', (e) => {
        if (e.target === elementos.modalItemCardapio || e.target.classList.contains('modal-backdrop')) {
            fecharModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elementos.modalItemCardapio?.classList.contains('aberto')) {
            fecharModal();
        }
    });

    elementos.btnToggleSidebar?.addEventListener('click', alternarSidebarDesktop);
    elementos.btnAbrirSidebar?.addEventListener('click', abrirSidebarMobile);
    elementos.sidebarBackdrop?.addEventListener('click', fecharSidebarMobile);
    elementos.btnLogoutSidebar?.addEventListener('click', logout);
}

function obterSessao() {
    const sessaoLocal = window.localStorage.getItem(STORAGE_KEY);
    if (sessaoLocal) return JSON.parse(sessaoLocal);

    const sessaoTemporaria = window.sessionStorage.getItem(STORAGE_KEY);
    if (sessaoTemporaria) return JSON.parse(sessaoTemporaria);

    return null;
}

function preencherContextoUsuario() {
    const usuario = sessaoAtual?.usuario || 'Usuario interno';
    const role = sessaoAtual?.role || 'operador';
    const avatar = usuario.slice(0, 2).toUpperCase();

    if (elementos.nomeUsuarioSidebar) elementos.nomeUsuarioSidebar.textContent = usuario;
    if (elementos.perfilUsuarioSidebar) elementos.perfilUsuarioSidebar.textContent = formatarRole(role);
    if (elementos.avatarUsuarioSidebar) elementos.avatarUsuarioSidebar.textContent = avatar;
}

async function carregarItensCardapio() {
    if (!sessaoAtual?.restaurante_id) {
        mostrarErro('Sessao sem restaurante vinculado. Faca login novamente.');
        return;
    }

    try {
        await carregarRestaurante();

        const { data, error } = await supabaseClient
            .from('item_cardapio')
            .select('id, restaurante_id, nome, descricao, preco, categoria, disponivel')
            .eq('restaurante_id', sessaoAtual.restaurante_id)
            .order('nome');

        if (error) throw error;

        itensCardapio = data || [];
        atualizarFiltroCategorias();
        renderizarTabela();
        atualizarEstatisticas();
    } catch (error) {
        console.error('Erro ao carregar itens:', error);
        mostrarErro(`Nao foi possivel carregar o cardapio: ${error.message || 'erro desconhecido'}`);
    }
}

async function carregarRestaurante() {
    if (!sessaoAtual?.restaurante_id) return;

    const { data, error } = await supabaseClient
        .from('restaurante')
        .select('nome')
        .eq('id', sessaoAtual.restaurante_id)
        .single();

    if (!error && data?.nome && elementos.nomeRestauranteSidebar) {
        elementos.nomeRestauranteSidebar.textContent = data.nome;
    }
}

function obterItensFiltrados() {
    const termoBusca = (elementos.buscaCardapio?.value || '').trim().toLowerCase();
    const categoria = elementos.filtroCategoria?.value || '';
    const status = elementos.filtroStatus?.value || '';

    return itensCardapio.filter((item) => {
        const correspondeBusca =
            !termoBusca ||
            item.nome.toLowerCase().includes(termoBusca) ||
            (item.descricao || '').toLowerCase().includes(termoBusca) ||
            (item.categoria || '').toLowerCase().includes(termoBusca);

        const correspondeCategoria = !categoria || item.categoria === categoria;

        const correspondeStatus =
            !status ||
            (status === 'disponivel' && item.disponivel === true) ||
            (status === 'indisponivel' && item.disponivel === false);

        return correspondeBusca && correspondeCategoria && correspondeStatus;
    });
}

function renderizarTabela() {
    if (!elementos.tabelaItens) return;

    const itensFiltrados = obterItensFiltrados();

    if (!itensFiltrados.length) {
        elementos.tabelaItens.innerHTML = '';
        if (elementos.tabelaVazia) elementos.tabelaVazia.style.display = 'block';
        return;
    }

    if (elementos.tabelaVazia) elementos.tabelaVazia.style.display = 'none';

    elementos.tabelaItens.innerHTML = itensFiltrados.map((item) => `
        <tr>
            <td>
                <div class="cardapio-imagem">
                    <div class="cardapio-imagem-placeholder">${obterIniciais(item.nome)}</div>
                </div>
            </td>
            <td><div class="cardapio-nome">${escapeHtml(item.nome)}</div></td>
            <td><div class="cardapio-descricao">${escapeHtml(item.descricao || '-')}</div></td>
            <td><span class="cardapio-categoria">${escapeHtml(item.categoria || '-')}</span></td>
            <td><div class="cardapio-preco">R$ ${formatarPreco(item.preco)}</div></td>
            <td>
                <span class="cardapio-status ${item.disponivel ? 'disponivel' : 'indisponivel'}">
                    ${item.disponivel ? 'Disponivel' : 'Indisponivel'}
                </span>
            </td>
            <td>
                <div class="cardapio-acoes-item">
                    <button class="cardapio-botao-acao editar" onclick="editarItem('${item.id}')" title="Editar">
                        <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="cardapio-botao-acao excluir" onclick="excluirItem('${item.id}')" title="Excluir">
                        <svg viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function atualizarFiltroCategorias() {
    if (!elementos.filtroCategoria) return;

    const categoriaSelecionada = elementos.filtroCategoria.value;
    const categorias = [...new Set(itensCardapio.map((item) => item.categoria).filter(Boolean))].sort();

    elementos.filtroCategoria.innerHTML = [
        '<option value="">Todas categorias</option>',
        ...categorias.map((categoria) => `<option value="${escapeAttribute(categoria)}">${escapeHtml(categoria)}</option>`)
    ].join('');

    elementos.filtroCategoria.value = categorias.includes(categoriaSelecionada) ? categoriaSelecionada : '';
}

function atualizarEstatisticas() {
    const total = itensCardapio.length;
    const disponiveis = itensCardapio.filter((item) => item.disponivel).length;
    const indisponiveis = total - disponiveis;
    const precoMedio = total
        ? itensCardapio.reduce((soma, item) => soma + Number(item.preco || 0), 0) / total
        : 0;

    if (elementos.totalItens) elementos.totalItens.textContent = String(total);
    if (elementos.itensDisponiveis) elementos.itensDisponiveis.textContent = String(disponiveis);
    if (elementos.itensIndisponiveis) elementos.itensIndisponiveis.textContent = String(indisponiveis);
    if (elementos.precoMedio) elementos.precoMedio.textContent = `R$ ${formatarPreco(precoMedio)}`;
}

function abrirModalAdicionar() {
    itemEditando = null;
    elementos.formItemCardapio?.reset();
    if (elementos.modalTitulo) elementos.modalTitulo.textContent = 'Adicionar item';
    if (elementos.itemStatus) elementos.itemStatus.value = 'true';
    abrirModal();
}

function abrirModalEditar(item) {
    itemEditando = item;
    if (elementos.modalTitulo) elementos.modalTitulo.textContent = 'Editar item';
    if (elementos.itemNome) elementos.itemNome.value = item.nome || '';
    if (elementos.itemDescricao) elementos.itemDescricao.value = item.descricao || '';
    if (elementos.itemCategoria) elementos.itemCategoria.value = item.categoria || '';
    if (elementos.itemPreco) elementos.itemPreco.value = item.preco || '';
    if (elementos.itemStatus) elementos.itemStatus.value = item.disponivel ? 'true' : 'false';
    abrirModal();
}

function abrirModal() {
    if (elementos.modalItemCardapio) {
        elementos.modalItemCardapio.classList.add('aberto');
        document.body.style.overflow = 'hidden';
    }
}

function fecharModal() {
    if (elementos.modalItemCardapio) {
        elementos.modalItemCardapio.classList.remove('aberto');
        document.body.style.overflow = '';
    }
    itemEditando = null;
}

async function salvarItem(e) {
    e.preventDefault();

    if (!sessaoAtual?.restaurante_id) {
        mostrarErro('Sessao invalida para salvar itens.');
        return;
    }

    const payload = {
        restaurante_id: sessaoAtual.restaurante_id,
        nome: (elementos.itemNome?.value || '').trim(),
        descricao: (elementos.itemDescricao?.value || '').trim() || null,
        categoria: (elementos.itemCategoria?.value || '').trim(),
        preco: Number(elementos.itemPreco?.value || 0),
        disponivel: elementos.itemStatus?.value === 'true'
    };

    if (!payload.nome || !payload.categoria || payload.preco <= 0) {
        mostrarErro('Preencha nome, categoria e um preco valido.');
        return;
    }

    try {
        if (itemEditando?.id) {
            const { data, error } = await supabaseClient
                .from('item_cardapio')
                .update({
                    nome: payload.nome,
                    descricao: payload.descricao,
                    categoria: payload.categoria,
                    preco: payload.preco,
                    disponivel: payload.disponivel
                })
                .eq('id', itemEditando.id)
                .eq('restaurante_id', sessaoAtual.restaurante_id)
                .select('id')
                .maybeSingle();

            if (error) throw error;
            if (!data?.id) {
                throw new Error('Nenhum item foi atualizado. Verifique a RLS de item_cardapio e o restaurante_id da sessao.');
            }
            mostrarSucesso('Item atualizado com sucesso.');
        } else {
            const { data, error } = await supabaseClient
                .from('item_cardapio')
                .insert(payload)
                .select('id')
                .maybeSingle();

            if (error) throw error;
            if (!data?.id) {
                throw new Error('O item nao foi criado no banco.');
            }
            mostrarSucesso('Item criado com sucesso.');
        }

        await carregarItensCardapio();
        fecharModal();
    } catch (error) {
        console.error('Erro ao salvar item:', error);
        mostrarErro(`Nao foi possivel salvar o item: ${error.message || 'erro desconhecido'}`);
    }
}

function editarItem(itemId) {
    const item = itensCardapio.find((registro) => registro.id === itemId);
    if (item) {
        abrirModalEditar(item);
    }
}

async function excluirItem(itemId) {
    if (!window.confirm('Tem certeza que deseja excluir este item do cardapio?')) return;

    try {
        const { data, error } = await supabaseClient
            .from('item_cardapio')
            .delete()
            .eq('id', itemId)
            .eq('restaurante_id', sessaoAtual.restaurante_id)
            .select('id');

        if (error) throw error;
        if (!data?.length) {
            throw new Error('Nenhum item foi excluido. Verifique a RLS de item_cardapio e o restaurante_id da sessao.');
        }

        await carregarItensCardapio();
        mostrarSucesso('Item excluido com sucesso.');
    } catch (error) {
        console.error('Erro ao excluir item:', error);
        mostrarErro(`Nao foi possivel excluir o item: ${error.message || 'erro desconhecido'}`);
    }
}

function alternarSidebarDesktop() {
    elementos.sidebarGestor?.classList.toggle('recolhida');
}

function abrirSidebarMobile() {
    elementos.sidebarGestor?.classList.add('aberta');
    elementos.sidebarBackdrop?.classList.add('ativo');
}

function fecharSidebarMobile() {
    elementos.sidebarGestor?.classList.remove('aberta');
    elementos.sidebarBackdrop?.classList.remove('ativo');
}

function logout() {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem('remember_user');
    window.location.href = '../pags_html/login_usuario.html';
}

function formatarPreco(preco) {
    return Number(preco || 0).toFixed(2).replace('.', ',');
}

function formatarRole(role) {
    if (role === 'admin') return 'Acesso administrador';
    if (role === 'gestor') return 'Acesso gestor';
    return 'Acesso operador';
}

function obterIniciais(nome) {
    return String(nome || 'Item')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0]?.toUpperCase() || '')
        .join('');
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

function mostrarSucesso(mensagem) {
    window.alert(mensagem);
}

function mostrarErro(mensagem) {
    window.alert(mensagem);
}

window.editarItem = editarItem;
window.excluirItem = excluirItem;
window.GestaoCardapio = {
    carregarItensCardapio,
    editarItem,
    excluirItem,
    abrirModalAdicionar
};
