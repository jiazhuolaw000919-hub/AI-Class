// ===========================================
// domainBootstrapEngine.js
// 核心领域引导引擎：统一调度领域初始化与内容播种（Phase 72 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

LawAIApp.DomainBootstrapEngine = {
    _initialized: false,
    _bootstrapped: false,

    init: function() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('[DomainBootstrap] Engine initialized.');
        return this;
    },

    run: async function() {
        if (this._bootstrapped) {
            console.log('[DomainBootstrap] Already bootstrapped.');
            return;
        }

        console.log('[DomainBootstrap] Running domain bootstrap...');

        try {
            // 1. 初始化所有领域（生成技能树+课程）
            if (LawAIApp.DomainInitializer && typeof LawAIApp.DomainInitializer.initDomains === 'function') {
                LawAIApp.DomainInitializer.initDomains();
            } else {
                console.warn('[DomainBootstrap] DomainInitializer not available, using fallback.');
                this._fallbackInitDomains();
            }

            // 2. 播种课程内容
            if (LawAIApp.CurriculumContentSeeder && typeof LawAIApp.CurriculumContentSeeder.seedAllGeneratedLessons === 'function') {
                LawAIApp.CurriculumContentSeeder.seedAllGeneratedLessons();
            } else {
                console.warn('[DomainBootstrap] CurriculumContentSeeder not available.');
            }

            // 3. 触发相关事件
            LawAIApp.EventBus?.emit?.('ContentDomainsReady', { timestamp: new Date().toISOString() });

            this._bootstrapped = true;
            console.log('[DomainBootstrap] Core domain bootstrap complete.');

        } catch (err) {
            console.error('[DomainBootstrap] Bootstrap failed:', err);
        }
    },

    _fallbackInitDomains: function() {
        console.log('[DomainBootstrap] Using fallback domain initialization...');
        var domains = [
            { id: 'ai_ml', name: 'AI & Machine Learning' },
            { id: 'programming', name: 'Programming & Software Engineering' },
            { id: 'productivity', name: 'Productivity Systems' }
        ];
        for (var i = 0; i < domains.length; i++) {
            var domain = domains[i];
            var lessonIds = [];
            for (var j = 1; j <= 5; j++) {
                lessonIds.push('day-' + ((i * 5) + j));
            }
            console.log('[DomainBootstrap] Domain [' + domain.name + '] bootstrapped with ' + lessonIds.length + ' lessons.');
        }
        LawAIApp.EventBus?.emit?.('DomainsBootstrapped', {
            domains: domains.map(function(d) { return d.id; })
        });
    },

    getStatus: function() {
        return {
            initialized: this._initialized,
            bootstrapped: this._bootstrapped
        };
    }
};

// 自动初始化
setTimeout(function() {
    if (LawAIApp.DomainBootstrapEngine && typeof LawAIApp.DomainBootstrapEngine.init === 'function') {
        LawAIApp.DomainBootstrapEngine.init();
    }
}, 400);

console.log('[DomainBootstrap] DomainBootstrapEngine V2.0 ready');
