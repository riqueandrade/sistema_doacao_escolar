let modalDetalhes;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    if (!token || usuario.tipo !== 'admin') {
        alert('Acesso restrito à administradores');
        window.location.href = '/login.html';
        return;
    }

    carregarDoacoes();
    atualizarEstatisticas();
    
    // Event Listeners
    document.getElementById('filtroStatus').addEventListener('change', carregarDoacoes);
    document.getElementById('filtroTipo').addEventListener('change', carregarDoacoes);
    document.getElementById('ordenacao').addEventListener('change', carregarDoacoes);
    document.getElementById('gerarRelatorio').addEventListener('click', gerarRelatorio);
    
    // Inicializar o modal
    modalDetalhes = new bootstrap.Modal(document.getElementById('modalDetalhes'));
});

async function carregarDoacoes() {
    const token = localStorage.getItem('token');
    const status = document.getElementById('filtroStatus').value;
    const tipo = document.getElementById('filtroTipo').value;
    const ordenacao = document.getElementById('ordenacao').value;
    
    try {
        const response = await fetch(`/api/doacoes?status=${status}&tipo=${tipo}&ordem=${ordenacao}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const doacoes = await response.json();
        
        const tbody = document.getElementById('tabelaDoacoes');
        tbody.innerHTML = '';
        
        doacoes.forEach(doacao => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatarData(doacao.data_cadastro)}</td>
                <td>${doacao.nome}</td>
                <td>${doacao.contato}</td>
                <td>${formatarTipoDoacao(doacao.tipo_doacao)}</td>
                <td>${formatarPreferenciaEntrega(doacao.preferencia_entrega)}</td>
                <td>
                    <span class="badge badge-${doacao.status}">
                        ${doacao.status === 'pendente' ? 
                          '<i class="bi bi-clock-fill me-1"></i>Pendente' : 
                          '<i class="bi bi-check-circle-fill me-1"></i>Recebido'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-action ${doacao.status === 'pendente' ? 'btn-success' : 'btn-warning'}"
                            onclick="alterarStatus(${doacao.id}, '${doacao.status === 'pendente' ? 'recebido' : 'pendente'}')">
                        <i class="bi ${doacao.status === 'pendente' ? 'bi-check-lg' : 'bi-arrow-counterclockwise'}"></i>
                    </button>
                    <button class="btn btn-action btn-info" onclick="visualizarDetalhes(${doacao.id})">
                        <i class="bi bi-eye-fill"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar doações:', error);
        alert('Erro ao carregar doações');
    }
}

async function atualizarEstatisticas() {
    try {
        const response = await fetch('/api/doacoes/estatisticas');
        const stats = await response.json();
        
        document.getElementById('totalDoacoes').textContent = stats.total;
        document.getElementById('doacoesPendentes').textContent = stats.pendentes;
        document.getElementById('doacoesRecebidas').textContent = stats.recebidas;
        document.getElementById('doacoesColeta').textContent = stats.coletas;
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

async function alterarStatus(id, novoStatus) {
    try {
        const response = await fetch(`/api/doacoes/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: novoStatus })
        });

        if (response.ok) {
            carregarDoacoes();
            atualizarEstatisticas();
        } else {
            throw new Error('Erro ao atualizar status');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar status da doação');
    }
}

async function gerarRelatorio() {
    try {
        const response = await fetch('/api/relatorio');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'relatorio-doacoes.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        alert('Erro ao gerar relatório');
    }
}

function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

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

function formatarPreferenciaEntrega(preferencia) {
    return preferencia === 'escola' ? 'Entregar na escola' : 'Solicitar coleta';
}

async function visualizarDetalhes(id) {
    try {
        const response = await fetch(`/api/doacoes/${id}`);
        const doacao = await response.json();
        
        // Preencher os dados no modal
        document.getElementById('detalheData').textContent = formatarData(doacao.data_cadastro);
        document.getElementById('detalheNome').textContent = doacao.nome;
        document.getElementById('detalheContato').textContent = doacao.contato;
        document.getElementById('detalheTipo').textContent = formatarTipoDoacao(doacao.tipo_doacao);
        document.getElementById('detalheEntrega').textContent = formatarPreferenciaEntrega(doacao.preferencia_entrega);
        document.getElementById('detalheStatus').textContent = doacao.status === 'pendente' ? 'Pendente' : 'Recebido';
        
        // Exibir o modal
        modalDetalhes.show();
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        alert('Erro ao carregar detalhes da doação');
    }
} 