const micButton = document.getElementById('mic-button');
const messagesDiv = document.getElementById('messages');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-btn');

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!window.SpeechRecognition) {
    alert('Sorry, your browser does not support speech recognition.');
}
const recognition = new window.SpeechRecognition;
recognition.continuous = true;
recognition.interimResults = true;

let micActive = false;

micButton.addEventListener('click', () => {
    if (micActive) {
        recognition.stop();
        micButton.classList.remove('active');
    } else {
        recognition.start();
    }
    micActive = !micActive;
});

recognition.onresult = function (event) {
    for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
            chatInput.value += event.results[i][0].transcript;
        }
    }
}

sendButton.addEventListener('click', () => {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
        const userMsgDiv = document.createElement('div');
        userMsgDiv.className = 'message user';
        userMsgDiv.textContent = userMessage;
        messagesDiv.appendChild(userMsgDiv);
        chatInput.value = '';

        // Simulate bot response
        const botResponse = `You said: ${userMessage}`;
        const botMsgDiv = document.createElement('div');
        botMsgDiv.className = 'message bot';
        botMsgDiv.textContent = botResponse;
        messagesDiv.appendChild(botMsgDiv);
    }
});