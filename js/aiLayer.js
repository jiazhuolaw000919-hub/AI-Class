// ===========================================
// aiLayer.js
// AI 抽象层 - 统一 AI 接口（Phase 19 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.AILayer = {
    _initialized: false,
    _providers: {},
    _defaultProvider: 'mock',
    _requestHistory: [],

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        
        // 注册默认 Provider
        this.registerProvider('mock', {
            name: 'Mock AI',
            supportedTasks: ['summary', 'suggest', 'explain', 'quiz'],
            execute: function(task, prompt, context) {
                return new Promise(function(resolve) {
                    setTimeout(function() {
                        var responses = {
                            summary: '📝 This is a summary of the lesson content. Focus on key concepts and practical applications.',
                            suggest: '💡 Based on your progress, try focusing on ' + (context?.topic || 'core concepts') + ' next.',
                            explain: '🧠 Here\'s an explanation: ' + (context?.concept || 'AI concepts') + ' are fundamental to understanding modern technology.',
                            quiz: '📝 Quiz: What is the core idea behind machine learning? (Answer: Learning from data)'
                        };
                        resolve({
                            text: responses[task] || '🤖 AI response generated successfully.',
                            provider: 'mock',
                            task: task,
                            timestamp: new Date().toISOString()
                        });
                    }, 200);
                });
            }
        });
        
        console.log('🤖 AILayer initialized');
        return this;
    },

    registerProvider: function(name, provider) {
        this._providers[name] = provider;
        console.log('📌 Provider registered:', name);
    },

    getProvider: function(name) {
        return this._providers[name] || this._providers[this._defaultProvider];
    },

    setDefaultProvider: function(name) {
        if (this._providers[name]) {
            this._defaultProvider = name;
            console.log('📌 Default provider set to:', name);
        }
    },

    // ===========================================
    // 核心请求方法
    // ===========================================
    request: async function(task, context, preferredProvider) {
        context = context || {};
        preferredProvider = preferredProvider || this._defaultProvider;
        
        var requestId = 'aireq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        var prompt = context.prompt || this._buildPrompt(task, context);
        
        var requestObj = {
            requestId: requestId,
            provider: preferredProvider,
            task: task,
            prompt: prompt,
            context: context,
            priority: context.priority || 'normal',
            createdAt: new Date().toISOString(),
            status: 'created'
        };
        
        LawAIApp.EventBus?.emit?.('AIRequestCreated', requestObj);
        
        try {
            var provider = this.getProvider(preferredProvider);
            if (!provider) {
                throw new Error('Provider not found: ' + preferredProvider);
            }
            
            requestObj.status = 'processing';
            var response = await provider.execute(task, prompt, context);
            requestObj.status = 'completed';
            requestObj.response = response;
            
            this._requestHistory.push(requestObj);
            if (this._requestHistory.length > 100) {
                this._requestHistory = this._requestHistory.slice(-50);
            }
            
            LawAIApp.EventBus?.emit?.('AIResponseReceived', { request: requestObj, response: response });
            return response;
            
        } catch (error) {
            requestObj.status = 'failed';
            requestObj.error = error.message;
            console.error('❌ AI Request failed:', error);
            
            // 尝试回退到默认 Provider
            if (preferredProvider !== this._defaultProvider) {
                console.log('🔄 Falling back to default provider...');
                try {
                    var fallbackProvider = this.getProvider(this._defaultProvider);
                    if (fallbackProvider) {
                        var fallbackResponse = await fallbackProvider.execute(task, prompt, context);
                        requestObj.status = 'fallback_success';
                        requestObj.response = fallbackResponse;
                        LawAIApp.EventBus?.emit?.('AIResponseReceived', { request: requestObj, response: fallbackResponse });
                        return fallbackResponse;
                    }
                } catch (e) {
                    console.error('❌ Fallback also failed:', e);
                }
            }
            
            return null;
        }
    },

    _buildPrompt: function(task, context) {
        var templates = {
            summary: 'Please summarize the following: ' + (context.content || 'lesson content'),
            suggest: 'Based on the user\'s progress, what should they learn next? Progress: ' + 
                     JSON.stringify(context.progress || {}),
            explain: 'Please explain the concept: ' + (context.concept || 'AI fundamentals'),
            quiz: 'Generate a quiz question about: ' + (context.topic || 'AI basics')
        };
        return templates[task] || 'AI request for task: ' + task;
    },

    // ===========================================
    // 便捷方法
    // ===========================================
    summarize: function(content, context) {
        return this.request('summary', { content: content, ...context });
    },

    suggest: function(progress, context) {
        return this.request('suggest', { progress: progress, ...context });
    },

    explain: function(concept, context) {
        return this.request('explain', { concept: concept, ...context });
    },

    generateQuiz: function(topic, context) {
        return this.request('quiz', { topic: topic, ...context });
    },

    getRequestHistory: function(limit) {
        limit = limit || 20;
        return this._requestHistory.slice(-limit).reverse();
    },

    clearHistory: function() {
        this._requestHistory = [];
        console.log('🔄 AI request history cleared');
    },

    // 检查是否可用
    isAvailable: function() {
        return this._initialized && Object.keys(this._providers).length > 0;
    }
};

// ===========================================
// 自动初始化
// ===========================================
setTimeout(function() {
    if (LawAIApp.AILayer && typeof LawAIApp.AILayer.init === 'function') {
        LawAIApp.AILayer.init();
        console.log('✅ AILayer auto-initialized');
    }
}, 300);

console.log('🤖 AILayer V2.0 ready');
