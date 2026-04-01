const loginModal = document.getElementById('login-modal');
const chatContainer = document.getElementById('chat-container');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');

const messageList = document.getElementById('message-list');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const clearChat = document.getElementById('clear-chat');

let chatHistory = [];

// Login logic
loginBtn.addEventListener('click', () => {
    if (passwordInput.value === '123456') {
        loginModal.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        userInput.focus();
    } else {
        loginError.innerText = 'Mật khẩu không chính xác. Vui lòng thử lại!';
    }
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
});

// Chat logic
function renderMessage(text, isUser = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    msgDiv.innerText = text;
    messageList.appendChild(msgDiv);
    messageList.scrollTop = messageList.scrollHeight;
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    renderMessage(message, true);
    userInput.value = '';
    userInput.style.height = 'auto';
    
    typingIndicator.classList.remove('hidden');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: message,
                password: passwordInput.value,
                history: chatHistory 
            })
        });

        const data = await response.json();
        typingIndicator.classList.add('hidden');

        if (response.ok) {
            renderMessage(data.reply);
            chatHistory.push({ role: 'user', content: message });
            chatHistory.push({ role: 'model', content: data.reply });
        } else {
            renderMessage('❌ Lỗi: ' + (data.error || 'Không thể kết nối đến máy chủ.'));
        }
    } catch (error) {
        typingIndicator.classList.add('hidden');
        renderMessage('❌ Lỗi hệ thống: ' + error.message);
    }
}

sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Auto-resize textarea
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
});

clearChat.addEventListener('click', () => {
    messageList.innerHTML = '<div class="message bot-message">Xin chào! Tôi đã sẵn sàng hỗ trợ bạn về AI và AI Agent.</div>';
    chatHistory = [];
});
