const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const clearButton = document.getElementById('clear-button');
const voiceButton = document.getElementById('voice-button');

let recognition;

// Send message on button click
sendButton.addEventListener('click', sendMessage);

// Send message on Enter key
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Clear chat history
clearButton.addEventListener('click', () => {
    chatContainer.innerHTML = '';
    addSystemMessage("Chat history cleared");
});

// Voice input setup
voiceButton.addEventListener('click', toggleVoiceInput);

async function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '') return;

    addMessage(message, 'user');
    messageInput.value = '';

    // Enhanced loading indicator with dictionary style
    const loadingId = 'loading-' + Date.now();
    const loadingElement = document.createElement('div');
    loadingElement.id = loadingId;
    loadingElement.className = 'message bot-message loading-message';
    loadingElement.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">Searching the lexicon...</div>
        </div>
    `;
    chatContainer.appendChild(loadingElement);
    loadingElement.scrollIntoView({ behavior: 'smooth', block: 'end' });

    try {
        const response = await fetch('/api/define', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ word: message })
        });

        const data = await response.json();

        // Remove loading before showing response
        chatContainer.removeChild(loadingElement);

        // Process dictionary response
        if (data.error) {
            addMessage(`<div class="definition-card error-card">${data.error}</div>`, 'bot');
        } else {
            // Format the dictionary data
            const formattedResponse = formatDictionaryResponse(data);
            addMessage(formattedResponse, 'bot');
        }

    } catch (error) {
        console.error('Error:', error);
        if (document.getElementById(loadingId)) {
            chatContainer.removeChild(loadingElement);
        }
        addMessage(`<div class="definition-card error-card">Lexicon unavailable. Please try again later.</div>`, 'bot');
    }
}

function formatDictionaryResponse(data) {
    // Format the API response into beautiful dictionary-style HTML
    if (!data || !data.length) return '<div class="definition-card">No definitions found</div>';

    const entry = data[0]; // Get first entry
    let html = `
        <div class="dictionary-header">
            <h2>${entry.word}</h2>
            <div class="pronunciation">
                ${entry.phonetic ? `<span>${entry.phonetic}</span>` : ''}
                ${entry.phonetics && entry.phonetics[0]?.audio ?
                    `<button class="audio-btn" onclick="playAudio('${entry.phonetics[0].audio}')">
                        <i class="fas fa-volume-up"></i>
                    </button>` : ''}
            </div>
        </div>
    `;

    entry.meanings.forEach(meaning => {
        html += `
            <div class="definition-card">
                <div class="part-of-speech">${meaning.partOfSpeech}</div>
        `;

        meaning.definitions.slice(0, 3).forEach((def, idx) => {
            html += `
                <div class="definition">
                    <span class="definition-number">${idx + 1}.</span>
                    ${def.definition}
                </div>
            `;

            if (def.example) {
                html += `<div class="example">"${def.example}"</div>`;
            }

            if (def.synonyms && def.synonyms.length) {
                html += `<div class="synonyms">Synonyms: ${def.synonyms.slice(0, 5).map(s => `<span class="synonym-tag">${s}</span>`).join(' ')}</div>`;
            }
        });

        html += `</div>`; // Close definition-card
    });

    return html;
}

function playAudio(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(e => console.error("Audio playback failed:", e));
}

function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);

    if (sender === 'bot') {
        messageDiv.innerHTML = content;
    } else {
        messageDiv.textContent = content;
    }

    chatContainer.appendChild(messageDiv);
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
    messageDiv.style.opacity = '0';
    setTimeout(() => messageDiv.style.opacity = '1', 10);
}

function addSystemMessage(content) {
    const msg = document.createElement('div');
    msg.className = 'message system-message';
    msg.textContent = content;
    chatContainer.appendChild(msg);
    msg.scrollIntoView({ behavior: 'smooth' });
}

function toggleVoiceInput() {
    if (!('webkitSpeechRecognition' in window)) {
        addSystemMessage("Voice input not supported in your browser");
        return;
    }

    if (voiceButton.classList.contains('listening')) {
        recognition.stop();
        voiceButton.classList.remove('listening');
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        return;
    }

    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        voiceButton.classList.add('listening');
        voiceButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        addSystemMessage("Listening... Speak now");
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        messageInput.value = transcript;
        recognition.stop();
        voiceButton.classList.remove('listening');
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
    };

    recognition.onerror = (event) => {
        console.error("Voice recognition error", event.error);
        voiceButton.classList.remove('listening');
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        addSystemMessage("Voice input failed. Please try typing instead.");
    };

    recognition.start();
}