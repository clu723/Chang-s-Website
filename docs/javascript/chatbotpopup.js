const helpModal = document.getElementById('help-modal');
const helpBtn = document.getElementById('help-btn');
const closeBtn = document.getElementById('help-close');
const helpBackdrop = helpModal.querySelector('.help-backdrop')
const ROLES = { USER: 'user', BOT: 'bot' };
const NAV_REGEX = /navigate:([^\s]+)/i;
const allowedPages = ['chatbot', 'about', 'projects'];
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
  alert("Speech recognition not supported on your browser!");
}
const recognition = new window.SpeechRecognition;
recognition.continuous = true;
recognition.interimResults = true;
const synth = window.speechSynthesis;
let micActive = false;
let minimized = false;
let history = JSON.parse(localStorage.getItem('chatbot-history') || '[]');


document.addEventListener('DOMContentLoaded', function () {
    initPopup();
    helpBtn.style.display = '';
    helpBtn.onclick = function () {
        helpModal.style.display = '';
        helpBtn.style.display = 'none';
    };

    const closeHelpModal = () => {
        helpModal.style.display = 'none';
        helpBtn.style.display = '';
    }

    closeBtn.addEventListener('click', closeHelpModal);
    helpBackdrop.addEventListener('click', closeHelpModal);
});

function initPopup() {
    if (document.getElementById('chatbot-popup')) return; // Prevent double popup

    // popup container
    const popup = document.createElement('div');

    popup.id = 'chatbot-popup';
    popup.style = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 370px;
        max-width: 96vw;
        height: 600px;
        max-height: 90vh;
        background: #1e1e1e;
        color: #fff;
        border-radius: 18px;
        box-shadow: 0 4px 32px rgba(0,0,0,0.3);
        z-index: 99999;
        display: flex;
        flex-direction: column;
        overflow: hidden;
  `;

    // Minimize button
    const minimizeBtn = document.createElement('button');
    minimizeBtn.textContent = '×';
    minimizeBtn.title = 'Minimize';
    minimizeBtn.style = `
        position: absolute;
        top: 10px;
        right: 14px;
        background: none;
        color: #fff;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        z-index: 10;
  `;

    // chatbot UI
    popup.innerHTML = `
    <div class="chat-container" style="height:100%;display:flex;flex-direction:column;justify-content:space-between;padding:1rem 1rem 0 1rem;">
      <div class="messages" id="chatbot-messages" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:0.5rem;">
      </div>
        <div class="input-block">
            <input
                type="text"
                id="chat-input"
                class="chat-input"
                placeholder="Click the microphone to start talking!"
                autocomplete="off"
                style="cursor: not-allowed"
                disabled
            
            />
            <div class="action-buttons">
                <button class="microphone" id="mic-button" title="Mic">
                <span class="microphone-icon">🎤</span>
                </button>
                <button class="clear-btn" id="clear-btn" title="Clear">
                Clear
                </button>
                <button class="send-btn" id="send-btn" title="Send">
                ➤
                </button>
            </div>
      </div>
    </div>
  `;

    popup.appendChild(minimizeBtn);

    // Add popup to body
    document.body.appendChild(popup);

    // Restore chat history from localStorage
    const messagesDiv = popup.querySelector('#chatbot-messages');
    restoreChatHistory(messagesDiv);

    const input = popup.querySelector('#chat-input');
    const sendBtn = popup.querySelector('#send-btn');
    // Send message handler
    sendBtn.addEventListener('click', () => {
        micToggle(micButton);
        sendMessage(input, messagesDiv);
    });

    const micButton = document.getElementById('mic-button');
    micButton.addEventListener('click', () => {
        micToggle(micButton);
    });
    // Append to input whenver user takes a pause when speaking
    recognition.onresult = function (event) {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                input.value += event.results[i][0].transcript;
            }
        }
    }

    // Clear button
    popup.querySelector('#clear-btn').addEventListener('click', () => {
        popup.querySelector('#chat-input').value = '';
    });

    // Minimize and restore
    minimizeBtn.addEventListener('click', () => {
        toggleMinimize(popup, messagesDiv, minimizeBtn);
    });

    // Style overrides for popup
    const style = document.createElement('style');
    style.textContent = `
    #chatbot-popup::-webkit-scrollbar { width: 8px; background: #232323; }
    #chatbot-popup::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
    #chatbot-popup .microphone { margin-left: 0; }
  `;
    document.head.appendChild(style);
};

const restoreChatHistory = (messagesDiv) => {
    history.forEach(msgObj => {
        const msg = document.createElement('div');
        msg.className = 'message ' + (msgObj.role === ROLES.USER ? ROLES.USER : ROLES.BOT);
        msg.textContent = msgObj.msg;
        messagesDiv.appendChild(msg);
    });

}

function sendMessage(input, messagesDiv) {
    const val = input.value.trim();
    if (!val) return;
    addMessage(ROLES.USER, val, messagesDiv);
    input.value = '';
    input.focus();
    try {
        fetch('/api/chatbot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: val })
        })
            .then(r => r.json())
            .then(data => {
                const msg = data.replace(NAV_REGEX, '').trim();
                addMessage(ROLES.BOT, msg, messagesDiv);
                console.log(data);
                speak(msg);
                navigatePage(data);
            });
    } catch (error) {
        addMessage(ROLES.BOT, "Sorry, something went wrong. Please try again.", messagesDiv);
        console.error(error);
        return '';
    }
}

function addMessage(role, msg, messagesDiv) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ' + (role === ROLES.USER ? ROLES.USER : ROLES.BOT);
    msgDiv.textContent = msg;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    history.push({ role, msg });
    localStorage.setItem('chatbot-history', JSON.stringify(history));
}

function toggleMinimize(popup, messagesDiv, minimizeBtn) {
    minimized = !minimized;
    if (minimized) {
        popup.style.height = "60px";
        messagesDiv.style.display = "none";
        popup.querySelector('.input-block').style.display = "none";
        minimizeBtn.textContent = '+';
    } else {
        popup.style.height = "600px";
        messagesDiv.style.display = "";
        popup.querySelector('.input-block').style.display = "";
        minimizeBtn.textContent = '×';
    }
};

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

// Adding 'active' class is for the glow effect when mic is active/inactive
const micToggle = (micButton) => {
    if (micActive) {
        recognition.stop();
    } else {
        recognition.start();

    }
    micActive = !micActive;
    micButton.classList.toggle('active', micActive);
}

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