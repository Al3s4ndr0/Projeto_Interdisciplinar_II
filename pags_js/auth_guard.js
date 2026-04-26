(function () {
  const STORAGE_KEY = 'qmesa_auth';
  const LOGIN_URL = '../pags_html/login_usuario.html';

  function lerSessao() {
    const sessaoLocal = window.localStorage.getItem(STORAGE_KEY);
    const sessaoTemporaria = window.sessionStorage.getItem(STORAGE_KEY);
    const sessaoBruta = sessaoLocal || sessaoTemporaria;

    if (!sessaoBruta) return null;

    try {
      return JSON.parse(sessaoBruta);
    } catch (error) {
      limparSessao();
      return null;
    }
  }

  function limparSessao() {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
  }

  function logout() {
    limparSessao();
    window.localStorage.removeItem('remember_user');
    window.location.href = LOGIN_URL;
  }

  function usuarioTemPerfil(sessao, perfisPermitidos) {
    if (!sessao?.ativo || !sessao?.role) return false;
    if (sessao.role === 'master') {
      return perfisPermitidos.includes('master');
    }
    if (!sessao?.restaurante_id) return false;
    return perfisPermitidos.includes(sessao.role);
  }

  function exigirAutenticacao(perfisPermitidos = ['gestor', 'admin', 'master']) {
    const sessao = lerSessao();

    if (!usuarioTemPerfil(sessao, perfisPermitidos)) {
      limparSessao();
      window.location.replace(LOGIN_URL);
      return null;
    }

    return sessao;
  }

  window.QmesaAuth = {
    STORAGE_KEY,
    lerSessao,
    limparSessao,
    logout,
    exigirAutenticacao
  };
})();
