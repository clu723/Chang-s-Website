const micButton = document.getElementById('mic-button');
const messagesDiv = document.getElementById('messages');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-btn');
const clearButton = document.getElementById('clear-btn');

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!window.SpeechRecognition) {
    alert('Sorry, your browser does not support speech recognition.');
}
const recognition = new window.SpeechRecognition;
recognition.continuous = true;
recognition.interimResults = true;

const synth = window.speechSynthesis;

let micActive = false;

// On user load, Gemini introduces itself
document.addEventListener('DOMContentLoaded', function() {
    sendPromptToGemini("Welcome the user.").then(response => {
        const botResponse = response;
        const botMsgDiv = document.createElement('div');
        botMsgDiv.className = 'message bot';
        botMsgDiv.textContent = botResponse;
        messagesDiv.appendChild(botMsgDiv);
        speak(botResponse);
    });
});

const speak = (words) => {
    window.speechSynthesis.cancel();
    const spokenWords = new SpeechSynthesisUtterance(words);
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English")) 
                        || voices[0];

    if (preferredVoice) spokenWords.voice = preferredVoice;
    spokenWords.rate = 1.1;
    synth.speak(spokenWords);
} 

micButton.addEventListener('click', () => {
    micToggle();
});

const micToggle = () => {
    if (micActive) {
        recognition.stop();
    } else {
        recognition.start();

    }
    micActive = !micActive;
    micButton.classList.toggle('active', micActive);
}

// Append to chatInput whenver user takes a puase when speaking
recognition.onresult = function (event) {
    for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
            chatInput.value += event.results[i][0].transcript;
        }
    }
}

clearButton.addEventListener('click', () => {
    chatInput.value = "";
});

// Prompt Gemini for response
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
            speak(botResponse);
        });
    }
});

async function sendPromptToGemini(prompt) {
  const res = await fetch('http://localhost:3000/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  return data;
};
