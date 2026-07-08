// ===========================================
// bootstrap.js
// Academy 引导引擎 - 系统初始化（Phase 40 完善版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

(function() {
    var _booted = false;
    var _health = {};

    // ===========================================
    // 启动管道
    // ===========================================
    function boot() {
        if (_booted) return;
        
        console.log('🚀 Bootstrapping Law AI Academy...');
        
        // 1. 检查核心引擎
        var coreEngines = [
            'StorageEngine',
            'EventBus',
            'ProgressEngine',
            'SystemComposer',
            'App'
        ];
        
        var missing = [];
        coreEngines.forEach(function(name) {
            if (!window.LawAIApp || !window.LawAIApp[name]) {
                missing.push(name);
            }
        });
        
        if (missing.length > 0) {
            console.warn('⚠️ Missing core engines:', missing.join(', '));
            // 创建占位
            missing.forEach(function(name) {
                if (window.LawAIApp) {
                    window.LawAIApp[name] = {
                        _placeholder: true,
                        initialized: true,
                        getProgress: function() { return { completedLessons: [], xp: 0, level: 1 }; },
                        getState: function() { return { level: 1, xp: 0, streak: 0, day: 1, completionPercent: 0 }; },
                        init: function() { console.log('🔧 ' + name + ' placeholder initialized'); return this; }
                    };
                }
            });
        }
        
        // 2. 初始化核心引擎
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.init === 'function') {
                LawAIApp.StorageEngine.init();
            }
        } catch (e) { console.warn('StorageEngine init failed:', e); }
        
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.init === 'function') {
                LawAIApp.ProgressEngine.init();
            }
        } catch (e) { console.warn('ProgressEngine init failed:', e); }
        
        // 3. 健康检查
        _health = runHealthCheck();
        
        // 4. 触发就绪事件
        var event = new CustomEvent('SYSTEM_READY', {
            detail: {
                boot: { booted: true, health: _health },
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
        
        // 5. 启动 App
        if (window.App && typeof window.App.init === 'function' && !window.App.initialized) {
            try {
                window.App.init({ boot: { booted: true, health: _health } });
            } catch (e) {
                console.warn('App init failed:', e);
            }
        }
        
        _booted = true;
        console.log('✅ Bootstrap complete');
    }

    // ===========================================
    // 健康检查
    // ===========================================
    function runHealthCheck() {
        var checks = {
            storage: false,
            progress: false,
            eventBus: false,
            systemComposer: false,
            app: false
        };
        
        try {
            if (LawAIApp.StorageEngine) checks.storage = true;
        } catch (e) {}
        
        try {
            if (LawAIApp.ProgressEngine) checks.progress = true;
        } catch (e) {}
        
        try {
            if (LawAIApp.EventBus) checks.eventBus = true;
        } catch (e) {}
        
        try {
            if (LawAIApp.SystemComposer) checks.systemComposer = true;
        } catch (e) {}
        
        try {
            if (window.App) checks.app = true;
        } catch (e) {}
        
        var allPassed = Object.values(checks).every(function(v) { return v; });
        
        return {
            checks: checks,
            allPassed: allPassed,
            status: allPassed ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString()
        };
    }

    function getHealth() {
        return _health;
    }

    // ===========================================
    // 启动执行
    // ===========================================
    function execute() {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(boot, 1);
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(boot, 1);
            });
        }
    }

    // ===========================================
    // 导出
    // ===========================================
    LawAIApp.BootManager = {
        start: function() {
            return new Promise(function(resolve) {
                if (_booted) {
                    resolve({ status: 'already_booted', health: _health });
                    return;
                }
                boot();
                resolve({ status: 'booted', health: _health });
            });
        },
        getHealth: getHealth,
        isBooted: function() { return _booted; },
        runHealthCheck: runHealthCheck
    };
    
    // 执行启动
    execute();
})();

console.log('🚀 Bootstrap V2.0 ready');
