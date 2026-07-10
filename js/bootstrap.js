// ===========================================
// bootstrap.js
// Academy 引导引擎 — 极简启动管道 (Phase 0.3)
// 只做一件事：按阶段启动系统，不阻塞 UI
// ===========================================

window.LawAIApp = window.LawAIApp || {};

(function() {
    var _booted = false;

    // ===========================================
    // 🚀 极简启动管道
    // ===========================================
    function boot() {
        if (_booted) return;
        _booted = true;

        console.log('🚀 Bootstrap: Starting (simplified)');

        // Stage 1: Critical — 立即触发渲染（同步）
        try {
            var event = new CustomEvent('SYSTEM_READY', {
                detail: { boot: { booted: true }, timestamp: Date.now() }
            });
            window.dispatchEvent(event);
            console.log('✅ Stage 1: SYSTEM_READY dispatched');
        } catch (e) {
            console.warn('⚠️ SYSTEM_READY dispatch failed:', e);
        }

        // Stage 2: UX — 100ms 后加载进度和推荐
        setTimeout(function() {
            try {
                if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.init === 'function') {
                    LawAIApp.ProgressEngine.init();
                }
                if (LawAIApp.ExperienceEngine && typeof LawAIApp.ExperienceEngine.init === 'function') {
                    LawAIApp.ExperienceEngine.init();
                }
            } catch (e) { /* 静默 */ }
            console.log('✅ Stage 2: UX engines loaded');
        }, 100);

        // Stage 3: Intelligence — 500ms 后加载 AI 系统
        setTimeout(function() {
            try {
                if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.init === 'function') {
                    LawAIApp.MemoryEngine.init();
                }
                if (LawAIApp.PracticeEngine && typeof LawAIApp.PracticeEngine.init === 'function') {
                    LawAIApp.PracticeEngine.init();
                }
                if (LawAIApp.AIMentorEngine && typeof LawAIApp.AIMentorEngine.init === 'function') {
                    LawAIApp.AIMentorEngine.init();
                }
                if (LawAIApp.SchoolEngine && typeof LawAIApp.SchoolEngine.init === 'function') {
                    LawAIApp.SchoolEngine.init();
                }
            } catch (e) { /* 静默 */ }
            console.log('✅ Stage 3: Intelligence engines loaded');
        }, 500);

        // Stage 4: Background — 1000ms 后加载剩余系统
        setTimeout(function() {
            try {
                if (LawAIApp.CareerEngine && typeof LawAIApp.CareerEngine.init === 'function') {
                    LawAIApp.CareerEngine.init();
                }
                if (LawAIApp.CertificateEngine && typeof LawAIApp.CertificateEngine.init === 'function') {
                    LawAIApp.CertificateEngine.init();
                }
                if (LawAIApp.CommunityEngine && typeof LawAIApp.CommunityEngine.init === 'function') {
                    LawAIApp.CommunityEngine.init();
                }
                if (LawAIApp.ExecutionEngine && typeof LawAIApp.ExecutionEngine.start === 'function') {
                    LawAIApp.ExecutionEngine.start();
                }
            } catch (e) { /* 静默 */ }
            console.log('✅ Stage 4: Background engines loaded');
            console.log('🎯 Bootstrap complete — all stages started');
        }, 1000);

        // 触发最终就绪事件（延迟到所有阶段启动后）
        setTimeout(function() {
            try {
                window.dispatchEvent(new CustomEvent('BOOT_COMPLETE', {
                    detail: { timestamp: Date.now() }
                }));
            } catch (e) { /* 静默 */ }
        }, 1200);
    }

    // ===========================================
    // 启动执行
    // ===========================================
    function execute() {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(boot, 50);
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(boot, 50);
            });
        }
    }

    execute();

    // 公开 API（简化）
    LawAIApp.Bootstrap = {
        isBooted: function() { return _booted; }
    };

    // 兼容旧 BootManager API
    LawAIApp.BootManager = LawAIApp.BootManager || {};
    LawAIApp.BootManager.start = function() {
        if (!_booted) boot();
        return Promise.resolve({ status: _booted ? 'booted' : 'starting' });
    };
    LawAIApp.BootManager.isBooted = function() { return _booted; };
    LawAIApp.BootManager.getStatus = function() {
        return { booted: _booted };
    };

})();

console.log('🚀 Bootstrap V5.0 ready (simplified)');
