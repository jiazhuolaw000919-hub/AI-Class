// conversationUI.js
LawAIApp.ConversationUI = {
  render() {
    const history = LawAIApp.ConversationMemory.getHistory();
    const suggestions = [
      "How am I progressing?",
      "What should I improve?",
      "Do I have any reviews?",
      "What projects am I working on?",
      "What are my goals?"
    ];

    const html = `
      <div class="page">
        <button class="back-btn" onclick="LawAIApp.Router.navigate('dashboard')">← Back</button>
        <h2>💬 Learning Conversations</h2>
        
        <div id="chat-history" style="max-height:60vh; overflow-y:auto; margin-bottom:1rem;">
          ${history.length === 0 ? '<p style="color:var(--text-secondary);">Start a conversation with your AI Mentor.</p>' : 
            history.map(msg => `
              <div class="dashboard-card" style="margin:0.5rem 0; ${msg.role === 'assistant' ? 'background:rgba(59,130,246,0.1);' : ''}">
                <strong>${msg.role === 'user' ? 'You' : '🤖 Mentor'}</strong>
                <p>${msg.content}</p>
                ${msg.suggestions ? msg.suggestions.map(s => `<button class="quick-btn" style="margin:0.2rem;">${s.text}</button>`).join('') : ''}
              </div>
            `).join('')
          }
        </div>

        <div style="margin:1rem 0;">
          <p style="font-size:0.9rem; color:var(--text-secondary);">Suggested questions:</p>
          <div class="quick-access">
            ${suggestions.map(s => `<button class="quick-btn suggestion-btn">${s}</button>`).join('')}
          </div>
        </div>

        <div style="display:flex; gap:0.5rem;">
          <input id="chat-input" class="search-box" placeholder="Ask your AI Mentor..." style="flex:1;">
          <button id="send-btn" class="complete-btn" style="flex:0;">Send</button>
        </div>
        <button id="clear-chat" class="quick-btn" style="margin-top:0.5rem; color:var(--danger);">Clear History</button>
      </div>
    `;
    document.getElementById('app').innerHTML = html;
    this.attachEvents();
    this.scrollToBottom();
  },

  attachEvents() {
    const sendMessage = async () => {
      const input = document.getElementById('chat-input');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      await LawAIApp.ConversationEngine.sendMessage(text);
      this.render();
    };

    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    document.querySelectorAll('.suggestion-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await LawAIApp.ConversationEngine.sendMessage(btn.textContent);
        this.render();
      });
    });

    document.getElementById('clear-chat').addEventListener('click', () => {
      if (confirm('Clear conversation history?')) {
        LawAIApp.ConversationMemory.clearHistory();
        this.render();
      }
    });
  },

  scrollToBottom() {
    setTimeout(() => {
      const chat = document.getElementById('chat-history');
      if (chat) chat.scrollTop = chat.scrollHeight;
    }, 100);
  }
};
