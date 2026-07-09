// ===========================================
// conversationEngine.js
// 学习对话引擎 - 基于上下文的对话系统（Phase 53 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.ConversationEngine = {
    _history: [],
    _maxHistory: 50,

    _safeGet: function(key, defaultValue) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                return LawAIApp.StorageEngine.get(key, defaultValue);
            }
            var val = localStorage.getItem('lawai_' + key);
            return val ? JSON.parse(val) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    _safeSet: function(key, value) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set(key, value);
                return true;
            }
            localStorage.setItem('lawai_' + key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    },

    sendMessage: async function(userMessage) {
        if (!userMessage || userMessage.trim() === '') {
            return { text: 'Please enter a message.', suggestions: [] };
        }

        // 获取上下文
        var ctx = this._gatherContext();
        var analysis = this._getAnalysis();

        // 记录用户消息
        this._addMessage('user', userMessage);

        // 生成回复
        var reply = this._generateReply(userMessage, ctx, analysis);

        // 记录助手消息
        var msg = this._addMessage('assistant', reply.text, {
            suggestions: reply.suggestions
        });

        LawAIApp.EventBus?.emit?.('ConversationMessageAdded', { message: msg });

        return msg;
    },

    _gatherContext: function() {
        var progress = {};
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                progress = LawAIApp.ProgressEngine.getProgress();
            }
        } catch (e) {}

        var completed = progress.completedLessons?.length || 0;
        var total = progress.totalLessons || 365;
        var streak = progress.streak || 0;
        var xp = 0;
        try {
            if (LawAIApp.XPEngine && typeof LawAIApp.XPEngine.getCurrentXP === 'function') {
                xp = LawAIApp.XPEngine.getCurrentXP() || 0;
            }
        } catch (e) {}

        var health = 70;
        try {
            if (LawAIApp.LearningIntelligence && typeof LawAIApp.LearningIntelligence.getHealth === 'function') {
                var h = LawAIApp.LearningIntelligence.getHealth();
                health = h?.overall || 70;
            }
        } catch (e) {}

        var memory = 80;
        try {
            if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.getMemoryStrength === 'function') {
                // 简化：取平均值
                var memories = LawAIApp.MemoryEngine.getAll ? LawAIApp.MemoryEngine.getAll() : {};
                var keys = Object.keys(memories);
                if (keys.length > 0) {
                    var totalStrength = 0;
                    for (var key in memories) {
                        totalStrength += memories[key].strength || 50;
                    }
                    memory = Math.round(totalStrength / keys.length);
                }
            }
        } catch (e) {}

        return {
            completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
            health: health,
            memory: memory,
            streak: streak,
            xp: xp,
            completed: completed,
            total: total,
            weakTopics: ['Advanced topics', 'Complex concepts'],
            todayFocus: completed < total ? 'Day ' + (completed + 1) : 'Review',
            activeProjects: [],
            goals: ['Complete daily lessons']
        };
    },

    _getAnalysis: function() {
        var reviewDue = 0;
        try {
            if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.getTodayReviews === 'function') {
                var reviews = LawAIApp.MemoryEngine.getTodayReviews() || [];
                reviewDue = reviews.length;
            }
        } catch (e) {}
        return { reviewDue: reviewDue };
    },

    _generateReply: function(message, ctx, analysis) {
        var msg = message.toLowerCase();
        var text = '';
        var suggestions = ['Tell me about your progress', 'What should I review?', 'How am I doing?'];

        if (msg.includes('progress') || msg.includes('how am i') || msg.includes('how doing')) {
            text = `📊 You've completed ${ctx.completed} lessons (${ctx.completionPercent}% of your learning path). ` +
                   `Your learning health is ${ctx.health}% and memory health is ${ctx.memory}%. ` +
                   `Keep up the ${ctx.streak > 0 ? ctx.streak + '-day streak' : 'momentum'}!`;
            suggestions = ['What should I focus on?', 'Any weak areas?', 'Next steps?'];
        } else if (msg.includes('weak') || msg.includes('improve') || msg.includes('focus')) {
            text = ctx.weakTopics.length > 0 
                ? `🎯 I recommend focusing on: ${ctx.weakTopics.join(', ')}. These areas will boost your overall understanding.`
                : '🌟 You are doing great across all topics! Keep exploring new concepts.';
            suggestions = ['How can I improve?', 'Recommend a lesson', 'Practice exercises'];
        } else if (msg.includes('review') || msg.includes('memory')) {
            text = `🧠 Memory health: ${ctx.memory}%. ${analysis.reviewDue > 0 ? `You have ${analysis.reviewDue} review(s) due today.` : 'No reviews pending today. Great job!'}`;
            suggestions = ['Start review', 'Memory tips', 'What to review?'];
        } else if (msg.includes('streak') || msg.includes('consistent')) {
            text = `🔥 ${ctx.streak > 0 ? `You're on a ${ctx.streak}-day streak! Keep showing up daily to build momentum.` : 'Start your streak today by completing one lesson!'}`;
            suggestions = ['How to maintain streak?', 'Daily tips', 'Motivation'];
        } else if (msg.includes('xp') || msg.includes('level')) {
            text = `⭐ You have ${ctx.xp} XP. Keep learning to earn more and level up!`;
            suggestions = ['Earn more XP', 'Next level', 'XP tips'];
        } else if (msg.includes('help') || msg.includes('suggest') || msg.includes('what')) {
            text = `💡 Try completing today's lesson (Day ${ctx.completed + 1}) to keep progressing. ${ctx.streak > 0 ? 'You're on a roll!' : 'Start your journey today!'}`;
            suggestions = ['Show me today\'s lesson', 'Learning path', 'Career goals'];
        } else if (msg.includes('thank')) {
            text = '🙌 You\'re welcome! Keep learning and growing. I\'m here to help!';
            suggestions = ['Continue learning', 'Ask another question'];
        } else {
            text = `🤔 That's a great question! Based on your current progress, I suggest focusing on ${ctx.todayFocus}. ` +
                   `${ctx.health > 70 ? 'Your learning health looks excellent! Keep up the great work!' : 'Consider taking a short break to recharge.'}`;
            suggestions = ['Today\'s focus', 'Learning tips', 'Ask about progress'];
        }

        return { text: text, suggestions: suggestions };
    },

    _addMessage: function(role, content, metadata) {
        metadata = metadata || {};
        var msg = {
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            role: role,
            content: content,
            metadata: metadata,
            timestamp: new Date().toISOString()
        };

        this._history.push(msg);
        if (this._history.length > this._maxHistory) {
            this._history = this._history.slice(-this._maxHistory);
        }

        this._safeSet('conversation_history', this._history);
        return msg;
    },

    getHistory: function() {
        if (this._history.length === 0) {
            var stored = this._safeGet('conversation_history');
            if (stored) this._history = stored;
        }
        return this._history;
    },

    clearHistory: function() {
        this._history = [];
        this._safeSet('conversation_history', []);
    },

    getSuggestions: function() {
        return ['📊 How is my progress?', '🎯 What should I focus on?', '🧠 Review my memory', '🔥 Check my streak', '⭐ How many XP do I have?'];
    }
};

console.log('💬 ConversationEngine V2.0 ready');
