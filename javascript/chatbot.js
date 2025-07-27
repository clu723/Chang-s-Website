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

document.addEventListener('DOMContentLoaded', function() {
    sendPromptToGemini("Welcome the user.").then(response => {
        console.log(response);
        const botResponse = response;
        const botMsgDiv = document.createElement('div');
        botMsgDiv.className = 'message bot';
        botMsgDiv.textContent = botResponse;
        messagesDiv.appendChild(botMsgDiv);
    });
});

micButton.addEventListener('click', () => {
    micToggle();
});

const micToggle = () => {
    if (micActive) {
        recognition.stop();
        micButton.classList.remove('active');
    } else {
        recognition.start();
    }
    micActive = !micActive;
}

// 
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
        micToggle();
        const userMsgDiv = document.createElement('div');
        userMsgDiv.className = 'message user';
        userMsgDiv.textContent = userMessage;
        messagesDiv.appendChild(userMsgDiv);
        chatInput.value = '';

        // bot response
        sendPromptToGemini(userMessage).then(response => {
            console.log(response);
            const botResponse = response;
            const botMsgDiv = document.createElement('div');
            botMsgDiv.className = 'message bot';
            botMsgDiv.textContent = botResponse;
            messagesDiv.appendChild(botMsgDiv);
        });
    }
});

async function sendPromptToGemini(prompt) {
  const res = await fetch('http://localhost:3000/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  return data;
};
