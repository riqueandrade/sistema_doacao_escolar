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

    // Verificar autenticação para área administrativa
    const adminLink = document.querySelector('#adminLink');
    if (adminLink) {
        adminLink.addEventListener('click', (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            const userType = localStorage.getItem('userType');
            
            if (token && userType === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'login.html';
            }
        });
    }
}); 