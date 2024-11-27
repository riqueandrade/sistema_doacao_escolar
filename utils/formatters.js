// Constantes de mapeamento
const TIPOS_DOACAO = {
    material_escolar: 'Material Escolar',
    alimentos: 'Alimentos', 
    livros: 'Livros',
    roupas: 'Roupas',
    outros: 'Outros'
};

const STATUS_DOACAO = {
    pendente: 'Pendente',
    recebido: 'Recebido'
};

// Funções de formatação
function formatarTipoDoacao(tipo) {
    return TIPOS_DOACAO[tipo] || tipo;
}

function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

function formatarStatus(status) {
    return STATUS_DOACAO[status] || status;
}

// Exportação
module.exports = {
    formatarTipoDoacao,
    formatarData,
    formatarStatus
};