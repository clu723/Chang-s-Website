const micButton = document.getElementById('mic-button');
const messagesDiv = document.getElementById('messages');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-btn');
const clearButton = document.getElementById('clear-btn');
const helpModal = document.getElementById('help-modal');
const helpBtn = document.getElementById('help-btn');
const closeBtn = document.getElementById('help-close');
const helpBackdrop = helpModal.querySelector('.help-backdrop')
const ROLES = { USER: 'user', BOT: 'bot' };
const NAV_REGEX = /navigate:([^\s]+)/i;
const startingPrompt = `Welcome the user to Chang's website. 
It's the first time they've visited. Introduce yourself.`;
const allowedPages = ['index.html', 'about.html', 'projects.html'];
const chatbotURL = "https://chang-s-website-api.onrender.com/api/chatbot";

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
  alert("Speech recognition not supported on your browser!");
}

const recognition = new window.SpeechRecognition;
recognition.interimResults = true;
const synth = window.speechSynthesis;
let micActive = false;

helpModal.style.display = '';
helpBtn.style.display = 'none';
let firstRun = true;

helpBtn.onclick = function () {
    helpModal.style.display = '';
    helpBtn.style.display = 'none';
};

const closeHelpModal = () => {
    helpModal.style.display = 'none';
    helpBtn.style.display = '';
    if (firstRun) {
        sendPromptToGemini(startingPrompt).then(response => {
            const msg = response.replace(NAV_REGEX, '').trim();
            createMsg(msg, ROLES.BOT);
            speak(msg);
            navigatePage(response);
        });
    };
    firstRun = false;
}

// Gemini introduces itself
closeBtn.addEventListener('click', closeHelpModal);

helpBackdrop.addEventListener('click', closeHelpModal);

const history = [];

// role is either 'user' or 'bot' message
const createMsg = (msg, role) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ' + (role === ROLES.USER ? ROLES.USER : ROLES.BOT);
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
            chatInput.value +=  event.results[i][0].transcript + " ";
        }
    }
}

// Continuous results when mic is active
recognition.onend = function() {
  if (micActive) {
    recognition.start();
  }
};

clearButton.addEventListener('click', () => {
    chatInput.value = "";
});

// Prompt Gemini for response
sendButton.addEventListener('click', () => {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
        micToggle();
        createMsg(userMessage, ROLES.USER);
        chatInput.value = '';

        // bot response
        sendPromptToGemini(userMessage).then(response => {
            const msg = response.replace(NAV_REGEX, '').trim();
            createMsg(msg, ROLES.BOT);
            speak(msg);
            navigatePage(response);
        });
    }
});

async function sendPromptToGemini(prompt) {
  try {
    const res = await fetch(chatbotURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    return data;
  } catch (error) {
    createMsg("Sorry, something went wrong. Please try again.", ROLES.BOT);
    console.error(error);
    return '';
  }
};

function navigatePage(reply) {
  const navMatch = reply.match(NAV_REGEX);

  if (navMatch) {
    const targetPage = navMatch[1];
    if (allowedPages.includes(targetPage)) {
        setTimeout(() => {
            window.location.href = targetPage;
        }, 4000);
    }
  }
}
