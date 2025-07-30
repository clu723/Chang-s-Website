const micButton = document.getElementById('mic-button');
const messagesDiv = document.getElementById('messages');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-btn');
const clearButton = document.getElementById('clear-btn');

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new window.SpeechRecognition;
recognition.continuous = true;
recognition.interimResults = true;
const synth = window.speechSynthesis;
let micActive = false;

// On user load, Gemini introduces itself
document.addEventListener('DOMContentLoaded', function() {
    sendPromptToGemini("Welcome the user to Chang's website.").then(response => {
        const msg = response.replace(/navigate:[^\s]+/i, '').trim();
        createMsg(msg, 'bot');
        speak(msg);
        navigatePage(response);
    });
});

const history = [];

// role is either 'user' or 'bot' message
const createMsg = (msg, role) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ' + (role === 'user' ? 'user' : 'bot');
    msgDiv.textContent = msg;
    messagesDiv.appendChild(msgDiv);
    history.push({ role, msg });
    localStorage.setItem('chatbot-history', JSON.stringify(history));
}

// Configure TTS and speak the words
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

// Adding 'active' class is for the glow effect when mic is active/inactive
const micToggle = () => {
    if (micActive) {
        recognition.stop();
    } else {
        recognition.start();

    }
    micActive = !micActive;
    micButton.classList.toggle('active', micActive);
}

// Append to chatInput whenver user takes a pause when speaking
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
        createMsg(userMessage, 'user');
        chatInput.value = '';

        // bot response
        sendPromptToGemini(userMessage).then(response => {
            const msg = response.replace(/navigate:[^\s]+/i, '').trim();
            createMsg(msg, 'bot');
            speak(msg);
            navigatePage(response);
        });
    }
});

async function sendPromptToGemini(prompt) {
  const res = await fetch('/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  return data;
};

const allowedPages = ['about.html', 'skills.html', 'projects.html'];

function navigatePage(reply) {
  const navMatch = reply.match(/navigate:([^\s]+)/i);

  if (navMatch) {
    const targetPage = navMatch[1];
    if (allowedPages.includes(targetPage)) {
        setTimeout(() => {
            window.location.href = targetPage;
        }, 2000);
    }
  }
}
