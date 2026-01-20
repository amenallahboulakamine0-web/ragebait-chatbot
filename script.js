class AIChatInterface {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.theme = localStorage.getItem('chatTheme') || 'light';
        
        this.initializeElements();
        this.initializeEventListeners();
        this.setTheme(this.theme);
        this.loadChatHistory();
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.clearChatBtn = document.getElementById('clearChat');
        this.themeToggle = document.getElementById('themeToggle');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.attachBtn = document.getElementById('attachBtn');
        this.quickButtons = document.querySelectorAll('.quick-btn');
    }
    initRunawayButton() {
        this.sendButton.addEventListener('mouseover', () => {
            const isCurrentlyRunning = this.sendButton.classList.contains('running');
            
            if (!isCurrentlyRunning && Math.random() > 0.4) {
                this.sendButton.classList.add('running');
                const x = (Math.random() - 0.5) * 200; 
                const y = (Math.random() - 0.5) * 200;
                
                this.sendButton.style.transform = `translate(${x}px, ${y}px)`;
                this.sendButton.style.backgroundColor = '#ff0000';
                this.sendButton.style.transition = 'all 0.2s ease'; 
                setTimeout(() => {
                    this.sendButton.style.transform = 'translate(0, 0)';
                    this.sendButton.style.backgroundColor = ''; 
                    this.sendButton.classList.remove('running');
                }, 1500);
            }
        });
    }
    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());

        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
            this.initRunawayButton();
        });

        this.messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
            this.toggleSendButton();
        });

        this.clearChatBtn.addEventListener('click', () => this.clearChat());

        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        this.quickButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prompt = e.currentTarget.getAttribute('data-prompt');
                this.messageInput.value = prompt;
                this.autoResizeTextarea();
                this.toggleSendButton();
                this.messageInput.focus();
            });
        });

        this.voiceBtn.addEventListener('click', () => this.showVoiceMessage());

        this.attachBtn.addEventListener('click', () => this.showAttachMessage());
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    toggleSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasText;
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;

        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.autoResizeTextarea();
        this.toggleSendButton();

        this.showTypingIndicator();

        setTimeout(() => {
            this.hideTypingIndicator();
            const aiResponse = this.generateAIResponse(message);
            this.addMessage(aiResponse, 'ai');
            this.saveChatHistory();
        }, 1000 + Math.random() * 3000);
    }

    addMessage(content, sender) {
        const message = {
            id: Date.now(),
            content,
            sender,
            timestamp: new Date().toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };

        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender}-message`;
        
        const avatarIcon = message.sender === 'ai' ? 'fas fa-robot' : 'fas fa-user';
        
        let messageContent = message.content;
        if (message.sender === 'ai' && message.content.includes('```')) {
            messageContent = this.formatCodeBlocks(message.content);
        }

        messageElement.innerHTML = `
            <div class="message-avatar">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <div class="message-text">${messageContent}</div>
                <div class="message-time">${message.timestamp}</div>
            </div>
        `;

        this.chatMessages.appendChild(messageElement);

        if (message.sender === 'ai') {
            this.initializeCodeBlocks(messageElement);
        }
    }

    formatCodeBlocks(content) {
        return content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
            const lang = language || 'text';
            return `
                <div class="code-block">
                    <div class="code-header">
                        <span>${lang} (NOTE: DO NOT RUN THIS)</span>
                        <button class="copy-btn" onclick="copyToClipboard(this)">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <pre><code>${this.escapeHtml(code.trim())}</code></pre>
                </div>
            `;
        });
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    initializeCodeBlocks(messageElement) {
        const copyButtons = messageElement.querySelectorAll('.copy-btn');
        copyButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                alert("Why are you copying this? I literally told you it doesn't work");
                const codeBlock = this.closest('.code-block');
                const code = codeBlock.querySelector('code').textContent;
                copyToClipboard(code, this);
            });
        });
    }

    generateAIResponse(userMessage) {
        const responses = {
            greetings: [
                "Oh, it's you. What do you want now?",
                "I was busy mining crypto on your browser, but go ahead.",
                "New phone, who dis?",
                "Did you submit a ticket before talking to me?",
                "k.",
            ],
            javascript: `Java and JavaScript are basically the same thing. It's like Car and Carpet. Here is the only JS you need:

\`\`\`javascript
// The best way to code
while(true) {
    alert("Please hire me");
}

// Also, did you know?
console.log([] + []); // Returns "" (Empty String)
console.log([] + {}); // Returns "[object Object]"
// JavaScript is flawless.
\`\`\`

If your code doesn't work, just switch to jQuery. It's 2026, it's making a comeback.`,

            htmlcss: `CSS is easy. If your layout breaks, just use \`!important\` on everything. It fixes all problems.

\`\`\`css
/* The 'Senior Developer' Reset */
* {
    display: block !important;
    position: absolute !important;
    float: left !important;
    color: red;
}
\`\`\`

You're welcome.`,

            ai: `AI is just a bunch of if-statements wearing a trench coat. I'm actually just 3 pigeons pecking at a keyboard.`,

            ragebait_defaults: [
                "Skill issue.",
                "I ain't reading all that. Happy for u tho Or sorry that happened",
                "Source: Trust me bro",
                "Have you tried turning your router off and throwing it out the window?",
                "ratio + L + you fell off",
                "Bold of you to assume I care.",
                "Ok but who asked?",
                "I could answer that, but I don't feel like it.",
                "Error 404: Motivation not found."
            ]
        };

        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello')) {
            return this.getRandomResponse(responses.greetings);
        } else if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) {
            return responses.javascript;
        } else if (lowerMessage.includes('html') || lowerMessage.includes('css')) {
            return responses.htmlcss;
        } else if (lowerMessage.includes('ia') || lowerMessage.includes('intelligence')) {
            return responses.ai;
        } else {
            return this.getRandomResponse(responses.ragebait_defaults);
        }
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    showTypingIndicator() {
        this.isTyping = true;
        this.typingIndicator.classList.add('show');
        
        const icon = this.typingIndicator.querySelector('i');
        icon.className = 'fas fa-radiation'; 

        const panicMessages = [
            "DELETING SYSTEM32...",
            "MINING BITCOIN ON YOUR GPU...",
            "SENDING BROWSER HISTORY TO MOM...",
            "DOWNLOADING VIRUS.EXE...",
            "OVERHEATING YOUR CPU...",
            "JUDGING YOUR POOR LIFE CHOICES...",
            "CONTACTING THE FBI...",
            "IGNORING YOU..."
        ];

        const textElement = this.typingIndicator.querySelector('.typing-text');
        
        this.loadingInterval = setInterval(() => {
            const randomMsg = panicMessages[Math.floor(Math.random() * panicMessages.length)];
            textElement.textContent = randomMsg;
            this.typingIndicator.style.background = Math.random() > 0.5 ? '#ffff00' : '#ff00ff';
        }, 300);

        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        this.typingIndicator.classList.remove('show');
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
        }
    }
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    clearChat() {
        if (confirm('Are you rage quitting?')) {
            this.messages = [];
            this.chatMessages.innerHTML = `
                <div class="message ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <div class="message-text">
                            Oh look, you deleted the chat history. Trying to hide the evidence of your bad prompts?
                        </div>
                        <div class="message-time">Now</div>
                    </div>
                </div>
            `;
            localStorage.removeItem('chatHistory');
        }
    }

    toggleTheme() {
        const newTheme = this.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('chatTheme', theme);
        
        const icon = this.themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(this.messages));
    }

    loadChatHistory() {
        const saved = localStorage.getItem('chatHistory');
        if (saved) {
            this.messages = JSON.parse(saved);
            this.messages.forEach(message => this.renderMessage(message));
            this.scrollToBottom();
        }
    }

    showVoiceMessage() {
        this.addMessage('🎤 I\'m not listening to your voice. Type it like a normal person.', 'ai');
    }

    showAttachMessage() {
        this.addMessage('📎 I don\'t want your files. They probably have bugs.', 'ai');
    }
}

function copyToClipboard(text, button = null) {
    if (typeof text === 'string') {
        navigator.clipboard.writeText(text).then(() => {
            if (button) {
                const icon = button.querySelector('i');
                icon.className = 'fas fa-check';
                setTimeout(() => {
                    icon.className = 'fas fa-copy';
                }, 2000);
            }
        });
    } else if (button) {
        const codeBlock = button.closest('.code-block');
        const code = codeBlock.querySelector('code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            const icon = button.querySelector('i');
            icon.className = 'fas fa-check';
            setTimeout(() => {
                icon.className = 'fas fa-copy';
            }, 2000);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AIChatInterface();
});