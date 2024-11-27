// Mostrar formulário de login por padrão
document.addEventListener('DOMContentLoaded', () => {
    toggleForms('login');
});

function toggleForms(form) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (form === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        setTimeout(() => loginForm.classList.add('active'), 50);
        registerForm.classList.remove('active');
    } else {
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
        setTimeout(() => registerForm.classList.add('active'), 50);
        loginForm.classList.remove('active');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: formData.get('email'),
                senha: formData.get('senha')
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            // Redirecionar baseado no tipo de usuário
            if (data.usuario.tipo === 'admin') {
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/cadastro.html';
            }
        } else {
            alert(data.error || 'Erro ao fazer login');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao fazer login');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    try {
        const response = await fetch('/api/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: formData.get('nome'),
                email: formData.get('email'),
                senha: formData.get('senha')
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Conta criada com sucesso! Faça login para continuar.');
            toggleForms('login');
        } else {
            alert(data.error || 'Erro ao criar conta');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao criar conta');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login.html';
} 