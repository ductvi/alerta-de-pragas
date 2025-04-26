import { auth } from './firebaseConfig.js';  // Importando a configuração do Firebase
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";



// Função para login
async function loginUser(email, senha) {
    const errorMessageLogin = document.getElementById('error-message-login');
    errorMessageLogin.innerText = ""; // Limpa a mensagem de erro anterior

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        console.log("Usuário logado:", userCredential.user);
        window.location.href = 'home.html'; // Redireciona após login
    } catch (error) {
        console.error("Erro ao logar:", error.message);
        
        // Verifica o erro e exibe a mensagem correspondente no login
        if (error.code === 'auth/wrong-password') {
            errorMessageLogin.innerText = 'Senha incorreta. Tente novamente!';
        } else if (error.code === 'auth/user-not-found') {
            errorMessageLogin.innerText = 'Usuário não encontrado. Verifique seu e-mail.';
        } else {
            errorMessageLogin.innerText = 'Erro ao fazer login. Verifique suas credenciais.';
        }
    }
}

// Função para cadastro
async function registerUser(email, senha) {
    const errorMessageRegister = document.getElementById('error-message-register');
    errorMessageRegister.innerText = ""; // Limpa a mensagem de erro anterior

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        console.log("Usuário registrado:", userCredential.user);
        window.location.href = 'home.html'; // Redireciona após cadastro
    } catch (error) {
        console.error("Erro ao cadastrar:", error.message);
        
        // Verifica o erro e exibe a mensagem correspondente no cadastro
        if (error.code === 'auth/email-already-in-use') {
            errorMessageRegister.innerText = 'Este e-mail já está em uso.';
        } else if (error.code === 'auth/weak-password') {
            errorMessageRegister.innerText = 'A senha deve ter pelo menos 6 caracteres.';
        } else {
            errorMessageRegister.innerText = 'Erro ao cadastrar. Tente novamente.';
        }
    }
}


function resetPassword() {
    const email = document.getElementById("email").value;
    const messageElement = document.getElementById("message");

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            messageElement.style.color = "green";
            messageElement.textContent = "Email de recuperação enviado! Verifique sua caixa de entrada.";
        })
        .catch(error => {
            messageElement.style.color = "red";
            messageElement.textContent = "Erro: " + error.message;
        });
    }

// Captura o evento de envio do formulário de login
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email-login').value;
    const senha = document.getElementById('senha-login').value;
    
    loginUser(email, senha);
});

// Captura o evento de envio do formulário de cadastro
document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email-register').value;
    const senha = document.getElementById('senha-register').value;
    
    registerUser(email, senha);
});

// Captura o evento de envio do formulário de redefinição de senha
document.getElementById('reset-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email-reset').value;
    resetPassword(email);
});