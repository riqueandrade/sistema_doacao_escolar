// Função para lidar com o envio do formulário de doação
async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;

    const doacao = {
        nome: form.nome.value,
        contato: form.contato.value,
        tipo_doacao: form.tipo_doacao.value,
        preferencia_entrega: form.querySelector('input[name="preferencia_entrega"]:checked').value
    };

    try {
        const response = await fetch('/api/doacoes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(doacao)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Doação cadastrada com sucesso! Entraremos em contato em breve.');
            form.reset();
        } else {
            alert(data.error || 'Erro ao cadastrar doação');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

// Adicionar evento de submit ao formulário
document.getElementById('formDoacao').addEventListener('submit', handleSubmit);

// Função para fazer logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    window.location.href = '/login.html';
}

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