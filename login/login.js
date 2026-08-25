// login.js

// Lógica de redirecionamento do botão 'Entrar no Sistema'
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            // Evita que a página recarregue e adicione os dados do form na URL
            event.preventDefault(); 
            
            // Redireciona o usuário para a página principal do calendário
            window.location.href = '../index.html'; 
        });
    }
});
