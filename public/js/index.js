document.addEventListener('DOMContentLoaded', () => {
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