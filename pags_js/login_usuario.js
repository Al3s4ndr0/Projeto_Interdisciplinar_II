// JavaScript do login interno de usuarios
const supabaseUrl = window.SUPABASE_CONFIG?.URL || 'https://jlfbzdqhaezdtyyajqlk.supabase.co';
const supabaseKey = window.SUPABASE_CONFIG?.ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsZmJ6ZHFoYWV6ZHR5eWFqcWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjM0NjksImV4cCI6MjA4ODkzOTQ2OX0.6VX3Z1FjxgZuBYALd2oU4bQl0nzbMcBUcc0nLW_DbvA';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const STORAGE_KEY = 'qmesa_auth';

const elementos = {
    loginForm: document.getElementById('loginForm'),
    resetForm: document.getElementById('resetForm'),
    usuario: document.getElementById('usuario'),
    password: document.getElementById('password'),
    remember: document.getElementById('remember'),
    resetUsuario: document.getElementById('resetUsuario'),
    loginMessage: document.getElementById('loginMessage'),
    resetMessage: document.getElementById('resetMessage'),
    resetModal: document.getElementById('resetModal')
};

document.addEventListener('DOMContentLoaded', () => {
    inicializarEventListeners();
    verificarUsuarioLogado();
});

function inicializarEventListeners() {
    elementos.loginForm?.addEventListener('submit', handleLogin);
    elementos.resetForm?.addEventListener('submit', handlePasswordReset);
}

async function handleLogin(e) {
    e.preventDefault();

    const usuario = (elementos.usuario?.value || '').trim();
    const password = elementos.password?.value || '';
    const remember = elementos.remember?.checked || false;

    if (!usuario || !password) {
        showMessage('login', 'Preencha usuario e senha.', 'error');
        return;
    }

    const submitButton = e.target.querySelector('.btn-primary');
    const buttonText = submitButton?.querySelector('.btn-text');
    const buttonLoading = submitButton?.querySelector('.btn-loading');

    if (buttonText) buttonText.style.display = 'none';
    if (buttonLoading) buttonLoading.style.display = 'flex';
    if (submitButton) submitButton.disabled = true;

    try {
        const { data, error } = await supabaseClient.rpc('autenticar_usuario', {
            p_usuario: usuario,
            p_senha: password
        });

        if (error) {
            throw error;
        }

        const usuarioAutenticado = Array.isArray(data) ? data[0] : data;

        if (!usuarioAutenticado) {
            throw new Error('LOGIN_INVALIDO');
        }

        if (!usuarioAutenticado.ativo) {
            throw new Error('USUARIO_INATIVO');
        }

        const sessao = {
            id: usuarioAutenticado.id,
            usuario: usuarioAutenticado.usuario,
            role: usuarioAutenticado.role,
            restaurante_id: usuarioAutenticado.restaurante_id,
            ativo: usuarioAutenticado.ativo,
            criado_em: new Date().toISOString()
        };

        salvarSessao(sessao, remember);
        redirecionarPorPerfil(sessao.role);
    } catch (error) {
        console.error('Erro no login:', error);
        showMessage('login', traduzirErroLogin(error), 'error');
    } finally {
        if (buttonText) buttonText.style.display = 'block';
        if (buttonLoading) buttonLoading.style.display = 'none';
        if (submitButton) submitButton.disabled = false;
    }
}

async function handlePasswordReset(e) {
    e.preventDefault();

    const usuario = (elementos.resetUsuario?.value || '').trim();

    if (!usuario) {
        showMessage('reset', 'Informe o usuario.', 'error');
        return;
    }

    showMessage(
        'reset',
        'Solicitacao registrada na interface. Para concluir a redefinicao, implemente um fluxo administrativo ou RPC no backend.',
        'success'
    );
}

function traduzirErroLogin(error) {
    const mensagem = error?.message || '';

    if (mensagem.includes('LOGIN_INVALIDO')) {
        return 'Usuario ou senha invalidos.';
    }

    if (mensagem.includes('USUARIO_INATIVO')) {
        return 'Este usuario esta inativo. Procure um administrador.';
    }

    if (mensagem.includes('Could not find the function public.autenticar_usuario')) {
        return 'O frontend foi adaptado para o novo modelo, mas falta criar a RPC autenticar_usuario no Supabase.';
    }

    if (mensagem.includes('permission denied')) {
        return 'Sem permissao para autenticar. Revise as politicas e a RPC no banco.';
    }

    if (mensagem) {
        return `Falha na autenticacao: ${mensagem}`;
    }

    return 'Nao foi possivel fazer login. Verifique suas credenciais e a configuracao do backend.';
}

function salvarSessao(sessao, remember) {
    limparSessao();

    const destino = remember ? window.localStorage : window.sessionStorage;
    destino.setItem(STORAGE_KEY, JSON.stringify(sessao));
    destino.setItem('remember_user', sessao.usuario);
}

function obterSessao() {
    const sessaoLocal = window.localStorage.getItem(STORAGE_KEY);
    if (sessaoLocal) {
        return JSON.parse(sessaoLocal);
    }

    const sessaoTemporaria = window.sessionStorage.getItem(STORAGE_KEY);
    if (sessaoTemporaria) {
        return JSON.parse(sessaoTemporaria);
    }

    return null;
}

function limparSessao() {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
}

function redirecionarPorPerfil(role) {
    if (role === 'operador') {
        window.location.href = '/pags_html/painel_operacional_fila.html';
        return;
    }

    if (role === 'gestor' || role === 'admin' || role === 'master') {
        window.location.href = '/pags_html/dashboard.html';
        return;
    }

    showMessage('login', 'Perfil de acesso invalido para esta tela.', 'error');
}

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const toggleButton = field?.nextElementSibling;

    if (!field || !toggleButton) return;

    const eyeOpen = toggleButton.querySelector('.eye-open');
    const eyeClosed = toggleButton.querySelector('.eye-closed');

    if (field.type === 'password') {
        field.type = 'text';
        if (eyeOpen) eyeOpen.style.display = 'none';
        if (eyeClosed) eyeClosed.style.display = 'block';
    } else {
        field.type = 'password';
        if (eyeOpen) eyeOpen.style.display = 'block';
        if (eyeClosed) eyeClosed.style.display = 'none';
    }
}

function showMessage(type, message, level = 'error') {
    const element = type === 'login' ? elementos.loginMessage : elementos.resetMessage;

    if (!element) return;

    element.textContent = message;
    element.className = `form-message ${level}`;
    element.style.display = 'block';

    window.setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

function hideAllMessages() {
    [elementos.loginMessage, elementos.resetMessage].forEach((el) => {
        if (el) {
            el.style.display = 'none';
            el.textContent = '';
        }
    });
}

function showPasswordReset() {
    if (elementos.resetModal) {
        elementos.resetModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hidePasswordReset() {
    if (elementos.resetModal) {
        elementos.resetModal.style.display = 'none';
        document.body.style.overflow = '';
        elementos.resetForm?.reset();
        hideAllMessages();
    }
}

function verificarUsuarioLogado() {
    const sessao = obterSessao();

    if (sessao?.ativo && sessao?.role) {
        redirecionarPorPerfil(sessao.role);
        return;
    }

    const savedUser = window.localStorage.getItem('remember_user');
    if (savedUser && elementos.usuario) {
        elementos.usuario.value = savedUser;
        if (elementos.remember) {
            elementos.remember.checked = true;
        }
    }
}

window.LoginUsuario = {
    togglePassword,
    showPasswordReset,
    hidePasswordReset
};
