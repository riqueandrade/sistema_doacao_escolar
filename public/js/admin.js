// Variáveis globais
let modalDetalhes;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    // Verifica autenticação
    if (!token || userType !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    inicializarPagina();
});

document.getElementById('filtroStatus').addEventListener('change', carregarDoacoes);
document.getElementById('filtroTipo').addEventListener('change', carregarDoacoes);
document.getElementById('ordenacao').addEventListener('change', carregarDoacoes);
document.getElementById('gerarRelatorio').addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('modalRelatorio'));
    modal.show();
});

// Funções de inicialização
function inicializarPagina() {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    const userName = localStorage.getItem('userName');

    if (!token || userType !== 'admin') {
        window.location.href = '/login.html';
        return;
    }

    if (userName) {
        document.getElementById('nomeUsuario').textContent = userName;
    }

    carregarEstatisticas();
    carregarDoacoes();
}

// Funções de carregamento de dados
async function carregarEstatisticas() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch('/api/doacoes/estatisticas', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            // Token inválido ou expirado
            localStorage.removeItem('token');
            localStorage.removeItem('userType');
            window.location.href = 'login.html';
            return;
        }

        const data = await response.json();
        if (response.ok) {
            atualizarEstatisticas(data);
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

async function carregarDoacoes() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Obter valores dos filtros
        const status = document.getElementById('filtroStatus').value;
        const tipo = document.getElementById('filtroTipo').value;
        const ordenacao = document.getElementById('ordenacao').value;

        // Construir URL com parâmetros de query
        let url = '/api/doacoes?';
        if (status) url += `status=${status}&`;
        if (tipo) url += `tipo=${tipo}&`;
        if (ordenacao) url += `ordem=${ordenacao}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            // Token inválido ou expirado
            localStorage.removeItem('token');
            localStorage.removeItem('userType');
            window.location.href = 'login.html';
            return;
        }

        const doacoes = await response.json();
        if (response.ok) {
            renderizarTabelaDoacoes(doacoes);
        }
    } catch (error) {
        console.error('Erro ao carregar doações:', error);
    }
}

// Funções de manipulação da UI
function atualizarEstatisticas(data) {
    document.getElementById('totalDoacoes').textContent = data.total;
    document.getElementById('doacoesPendentes').textContent = data.pendentes;
    document.getElementById('doacoesRecebidas').textContent = data.recebidas;
    document.getElementById('doacoesColeta').textContent = data.coletas;
}

function renderizarTabelaDoacoes(doacoes) {
    const tbody = document.getElementById('tabelaDoacoes');
    tbody.innerHTML = '';

    doacoes.forEach(doacao => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(doacao.data_cadastro).toLocaleDateString('pt-BR')}</td>
            <td>${doacao.nome}</td>
            <td>${doacao.contato}</td>
            <td>${doacao.tipo_doacao_formatado}</td>
            <td>${doacao.preferencia_entrega === 'escola' ? 'Entregar na escola' : 'Solicitar coleta'}</td>
            <td>
                <span class="badge ${doacao.status === 'pendente' ? 'badge-pendente' : 'badge-recebido'}">
                    ${doacao.status === 'pendente' ? 'Pendente' : 'Recebido'}
                </span>
            </td>
            <td>
                <button class="btn btn-action btn-primary" onclick="verDetalhes(${doacao.id})">
                    <i class="bi bi-eye-fill"></i>
                </button>
                <button class="btn btn-action ${doacao.status === 'pendente' ? 'btn-success' : 'btn-warning'}"
                        onclick="alterarStatus(${doacao.id}, '${doacao.status === 'pendente' ? 'recebido' : 'pendente'}')">
                    <i class="bi ${doacao.status === 'pendente' ? 'bi-check-lg' : 'bi-arrow-counterclockwise'}"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Funções utilitárias
function formatarTipoDoacao(tipo) {
    const tipos = {
        material_escolar: 'Material Escolar',
        alimentos: 'Alimentos',
        livros: 'Livros',
        roupas: 'Roupas',
        outros: 'Outros'
    };
    return tipos[tipo] || tipo;
}

// Funções de ações do usuário
async function verDetalhes(id) {
    try {
        const response = await fetch(`/api/doacoes/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const doacao = await response.json();

        if (response.ok) {
            atualizarModalDetalhes(doacao);
            const modal = new bootstrap.Modal(document.getElementById('modalDetalhes'));
            modal.show();
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
    }
}

function atualizarModalDetalhes(doacao) {
    document.getElementById('detalheData').textContent =
        new Date(doacao.data_cadastro).toLocaleString('pt-BR');
    document.getElementById('detalheNome').textContent = doacao.nome;
    document.getElementById('detalheContato').textContent = doacao.contato;
    document.getElementById('detalheTipo').textContent =
        formatarTipoDoacao(doacao.tipo_doacao);
    document.getElementById('detalheEntrega').textContent =
        doacao.preferencia_entrega === 'escola' ? 'Entregar na escola' : 'Solicitar coleta';
    document.getElementById('detalheStatus').textContent =
        doacao.status === 'pendente' ? 'Pendente' : 'Recebido';
}

async function alterarStatus(id, novoStatus) {
    try {
        const response = await fetch(`/api/doacoes/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: novoStatus })
        });

        if (response.ok) {
            carregarEstatisticas();
            carregarDoacoes();
        } else {
            const data = await response.json();
            alert(data.error || 'Erro ao alterar status');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

async function exportarRelatorio(tipo) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const modalRelatorio = bootstrap.Modal.getInstance(document.getElementById('modalRelatorio'));
        modalRelatorio.hide();

        // Mostrar loading
        const btnExportar = document.getElementById('gerarRelatorio');
        const btnTextoOriginal = btnExportar.innerHTML;
        btnExportar.disabled = true;
        btnExportar.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Gerando ${tipo.toUpperCase()}...`;

        let endpoint = '/api/relatorios';
        if (tipo === 'pdf') {
            endpoint += '/pdf';
        }

        const response = await fetch(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userType');
            window.location.href = 'login.html';
            return;
        }

        if (!response.ok) {
            throw new Error(`Erro ao gerar relatório ${tipo.toUpperCase()}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-doacoes.${tipo === 'excel' ? 'xlsx' : tipo}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();

        showMessage(`Relatório ${tipo.toUpperCase()} gerado com sucesso!`, 'success');
    } catch (error) {
        console.error('Erro:', error);
        showMessage(`Erro ao gerar relatório: ${error.message}`);
    } finally {
        // Restaurar botão
        const btnExportar = document.getElementById('gerarRelatorio');
        btnExportar.disabled = false;
        btnExportar.innerHTML = `<i class="bi bi-download me-2"></i>Gerar Relatório`;
    }
}

// Função para mostrar mensagens
function showMessage(message, type = 'danger') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Procura primeiro o container dentro da row dos cards de status
    const container = document.querySelector('.row.mb-4');
    if (container) {
        // Insere após os cards de status
        container.insertAdjacentElement('afterend', alertDiv);
    } else {
        // Fallback: insere no início da main
        const main = document.querySelector('main');
        if (main) {
            main.insertAdjacentElement('afterbegin', alertDiv);
        }
    }

    // Remove a mensagem após 5 segundos
    setTimeout(() => {
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    window.location.href = '/index.html';
}