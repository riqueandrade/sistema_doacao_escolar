document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animação para cards de features
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });

    // Verificação de autenticação para botão de doação
    const btnDoacao = document.querySelector('a[href="cadastro.html"]');
    btnDoacao.addEventListener('click', (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
        } else {
            window.location.href = '/cadastro.html';
        }
    });
}); 