// Função para mostrar mensagem de feedback
function showMessage(message, type = 'danger') {
    // Remove mensagem anterior se existir
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Cria nova mensagem
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} mt-3`;
    alertDiv.textContent = message;

    // Insere antes do botão de submit
    const form = document.getElementById('formDoacao');
    form.querySelector('button[type="submit"]').parentNode.insertBefore(alertDiv, form.querySelector('button[type="submit"]'));

    // Remove mensagem após 5 segundos
    setTimeout(() => alertDiv.remove(), 5000);
}

// Função para validar o formulário
function validarFormulario(formData) {
    const nome = formData.get('nome');
    const contato = formData.get('contato');
    const tipo_doacao = formData.get('tipo_doacao');
    const preferencia_entrega = formData.get('preferencia_entrega');

    if (!nome || nome.trim().length < 3) {
        throw new Error('Por favor, insira um nome válido');
    }

    if (!contato || contato.trim().length < 5) {
        throw new Error('Por favor, insira um contato válido');
    }

    if (!tipo_doacao) {
        throw new Error('Por favor, selecione o tipo de doação');
    }

    if (!preferencia_entrega) {
        throw new Error('Por favor, selecione a preferência de entrega');
    }
}

// Função para lidar com o envio do formulário
async function handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;

    // Desabilita o botão e mostra loading
    submitButton.disabled = true;
    submitButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Enviando...`;

    try {
        const formData = new FormData(form);
        validarFormulario(formData);

        const dados = {
            nome: formData.get('nome'),
            contato: formData.get('contato'),
            tipo_doacao: formData.get('tipo_doacao'),
            preferencia_entrega: formData.get('preferencia_entrega')
        };

        const response = await fetch('/api/doacoes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Doação cadastrada com sucesso! Entraremos em contato em breve.', 'success');
            form.reset();
        } else {
            throw new Error(data.error || 'Erro ao cadastrar doação');
        }
    } catch (error) {
        showMessage(error.message);
    } finally {
        // Restaura o botão
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formDoacao');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
});

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