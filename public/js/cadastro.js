// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
});

document.getElementById('formDoacao').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Você precisa estar logado para fazer uma doação');
        window.location.href = '/login.html';
        return;
    }
    
    const formData = {
        nome: document.getElementById('nome').value,
        contato: document.getElementById('contato').value,
        tipo_doacao: document.getElementById('tipo_doacao').value,
        preferencia_entrega: document.querySelector('input[name="preferencia_entrega"]:checked').value
    };

    try {
        const response = await fetch('/api/doacoes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Doação cadastrada com sucesso!');
            document.getElementById('formDoacao').reset();
        } else {
            throw new Error('Erro ao cadastrar doação');
        }
    } catch (error) {
        alert('Erro ao cadastrar doação: ' + error.message);
        console.error('Erro:', error);
    }
});

// Validações adicionais
document.getElementById('contato').addEventListener('input', function(e) {
    const valor = e.target.value;
    if (valor.includes('@')) {
        // Se parece um email, aplica validação de email
        e.target.type = 'email';
    } else {
        // Se parece um telefone, permite apenas números e alguns caracteres especiais
        e.target.value = valor.replace(/[^\d\s()-]/g, '');
    }
}); 