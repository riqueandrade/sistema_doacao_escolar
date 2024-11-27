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

    // Validação do nome
    if (!nome || nome.trim().length < 3 || !/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(nome)) {
        throw new Error('Por favor, insira um nome válido (mínimo 3 letras, apenas caracteres alfabéticos)');
    }

    // Validação do telefone
    const numeroLimpo = contato.replace(/\D/g, '');
    if (!contato || numeroLimpo.length !== 11) {
        throw new Error('Por favor, insira um telefone válido com DDD (11 dígitos)');
    }

    if (!tipo_doacao) {
        throw new Error('Por favor, selecione o tipo de doação na lista');
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

    // Aplicar máscara ao campo de telefone
    const phoneInput = document.getElementById('contato');
    const maskOptions = {
        mask: '(00) 00000-0000'
    };
    const phoneMask = IMask(phoneInput, maskOptions);

    // Validação em tempo real do telefone
    phoneInput.addEventListener('input', function() {
        const numeroLimpo = this.value.replace(/\D/g, '');
        
        if (numeroLimpo.length === 11) {
            this.classList.add('is-valid');
            this.classList.remove('is-invalid');
        } else {
            this.classList.add('is-invalid');
            this.classList.remove('is-valid');
        }
    });

    // Adicionar validação em tempo real para o select de tipo de doação
    const tipoSelect = document.getElementById('tipo_doacao');
    tipoSelect.addEventListener('change', function() {
        if (this.value) {
            this.classList.add('is-valid');
            this.classList.remove('is-invalid');
        } else {
            this.classList.add('is-invalid');
            this.classList.remove('is-valid');
        }
    });
});

// Função para fazer logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    window.location.href = '/login.html';
}

// Adicionar validação em tempo real para o campo nome
document.getElementById('nome').addEventListener('input', function(e) {
    const valor = e.target.value;
    
    // Remove caracteres não alfabéticos (exceto espaços)
    e.target.value = valor.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
    
    // Feedback visual
    if (valor.trim().length < 3) {
        e.target.classList.add('is-invalid');
        e.target.classList.remove('is-valid');
    } else {
        e.target.classList.add('is-valid');
        e.target.classList.remove('is-invalid');
    }
}); 