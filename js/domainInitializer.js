// ===========================================
// domainInitializer.js
// 领域初始化器：定义并启动所有核心学习领域（Phase 72 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.DomainInitializer = {
    _initialized: false,

    coreDomains: [
        {
            id: 'ai_ml',
            name: 'AI & Machine Learning',
            skills: [
                { name: 'AI Fundamentals', children: [
                    { name: 'Supervised Learning' },
                    { name: 'Unsupervised Learning' }
                ]},
                { name: 'Neural Networks' },
                { name: 'Prompt Engineering' }
            ]
        },
        {
            id: 'programming',
            name: 'Programming & Software Engineering',
            skills: [
                { name: 'Python Basics' },
                { name: 'Data Structures' },
                { name: 'Algorithms' }
            ]
        },
        {
            id: 'productivity',
            name: 'Productivity Systems',
            skills: [
                { name: 'Task Management' },
                { name: 'Automation Basics' },
                { name: 'Workflow Design' }
            ]
        }
    ],

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('[DomainInit] Domain initializer ready.');
        return this;
    },

    initDomains: function() {
        console.log('[DomainInit] Initializing all domains...');

        for (var i = 0; i < this.coreDomains.length; i++) {
            var domain = this.coreDomains[i];
            var lessonIds = this._generateDomainContent(domain);
            console.log('[DomainInit] Domain [' + domain.name + '] bootstrapped with ' + lessonIds.length + ' lessons.');
        }

        LawAIApp.EventBus?.emit?.('DomainsBootstrapped', {
            domains: this.coreDomains.map(function(d) { return d.id; })
        });

        return this.coreDomains;
    },

    _generateDomainContent: function(domain) {
        var lessonIds = [];
        var skillCount = domain.skills ? domain.skills.length : 3;
        for (var i = 1; i <= skillCount * 2; i++) {
            lessonIds.push('domain_' + domain.id + '_lesson_' + i);
        }
        return lessonIds;
    },

    getDomains: function() {
        return this.coreDomains;
    },

    getDomain: function(id) {
        for (var i = 0; i < this.coreDomains.length; i++) {
            if (this.coreDomains[i].id === id) {
                return this.coreDomains[i];
            }
        }
        return null;
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            domainCount: this.coreDomains.length
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.DomainInitializer && typeof LawAIApp.DomainInitializer.init === 'function') {
        LawAIApp.DomainInitializer.init();
    }
}, 400);

console.log('[DomainInit] DomainInitializer V2.0 ready');
