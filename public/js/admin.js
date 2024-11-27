document.addEventListener('DOMContentLoaded', () => {
    carregarDoacoes();
    
    // Listeners para filtros
    document.getElementById('filtroStatus').addEventListener('change', carregarDoacoes);
    document.getElementById('filtroTipo').addEventListener('change', carregarDoacoes);
    document.getElementById('gerarRelatorio').addEventListener('click', gerarRelatorio);
});

async function carregarDoacoes() {
    const status = document.getElementById('filtroStatus').value;
    const tipo = document.getElementById('filtroTipo').value;
    
    try {
        const response = await fetch(`http://localhost:3000/api/doacoes?status=${status}&tipo=${tipo}`);
        const doacoes = await response.json();
        
        const tbody = document.getElementById('tabelaDoacoes');
        tbody.innerHTML = '';
        
        doacoes.forEach(doacao => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(doacao.data_cadastro).toLocaleDateString()}</td>
                <td>${doacao.nome}</td>
                <td>${doacao.contato}</td>
                <td>${formatarTipoDoacao(doacao.tipo_doacao)}</td>
                <td>${formatarPreferenciaEntrega(doacao.preferencia_entrega)}</td>
                <td>
                    <span class="badge ${doacao.status === 'pendente' ? 'bg-warning' : 'bg-success'}">
                        ${doacao.status}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-status ${doacao.status === 'pendente' ? 'btn-success' : 'btn-warning'}"
                            onclick="alterarStatus(${doacao.id}, '${doacao.status === 'pendente' ? 'recebido' : 'pendente'}')">
                        ${doacao.status === 'pendente' ? 'Receber' : 'Pendente'}
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

async function alterarStatus(id, novoStatus) {
    try {
        const response = await fetch(`http://localhost:3000/api/doacoes/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: novoStatus })
        });

        if (response.ok) {
            carregarDoacoes();
        } else {
            throw new Error('Erro ao atualizar status');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar status da doação');
    }
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

async function gerarRelatorio() {
    try {
        const response = await fetch('http://localhost:3000/api/relatorio');
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