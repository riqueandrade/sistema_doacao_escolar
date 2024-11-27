// Função para mostrar mensagem de feedback
function showMessage(message, type = 'danger') {
    const messageDiv = document.getElementById('mensagem');
    messageDiv.className = `alert alert-${type}`;
    messageDiv.textContent = message;
    messageDiv.classList.remove('d-none');

    // Esconder mensagem após 5 segundos
    setTimeout(() => {
        messageDiv.classList.add('d-none');
    }, 5000);
}

// Função para lidar com o login
async function handleLogin(event) {
    event.preventDefault();
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Entrando...`;

    try {
        const form = event.target;
        const email = form.email.value;
        const senha = form.senha.value;

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.tipo !== 'admin') {
                showMessage('Acesso permitido apenas para administradores');
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('userType', data.tipo);
            localStorage.setItem('userName', data.nome);

            showMessage('Login realizado com sucesso! Redirecionando...', 'success');

            setTimeout(() => {
                window.location.href = '/admin.html';
            }, 1000);
        } else {
            showMessage(data.error || 'Erro ao fazer login');
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro ao conectar com o servidor');
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
    }
}

// Verificar se já está logado ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');
    
    if (token && userType === 'admin') {
        window.location.href = '/admin.html';
    }
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login.html';
} 