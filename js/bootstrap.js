// ===========================================
// bootstrap.js
// Academy 引导引擎 - Startup Pipeline (Phase 0.2)
// Stage 1: Critical → Stage 2: UX → Stage 3: Intelligence → Stage 4: Background
// ===========================================

window.LawAIApp = window.LawAIApp || {};

(function() {
    var _booted = false;
    var _health = {};
    var _bootAttempts = 0;
    var _maxBootAttempts = 3;
    var _stages = {
        critical: false,
        ux: false,
        intelligence: false,
        background: false
    };

    // ===========================================
    // 🚀 STAGE 1: CRITICAL — 立即渲染 UI
    // ===========================================
    function stage1Critical() {
        console.log('🟢 Stage 1: Critical — Rendering UI...');

        // 1. 立即应用主题
        try {
            if (LawAIApp.ThemeEngine && typeof LawAIApp.ThemeEngine.init === 'function') {
                LawAIApp.ThemeEngine.init();
            }
        } catch (e) { /* 静默 */ }

        // 2. 确保 Storage 可用（同步读取，极轻量）
        try {
            if (!LawAIApp.StorageEngine) {
                // 极简 fallback
                LawAIApp.StorageEngine = {
                    get: function(key, def) {
                        try { var v = localStorage.getItem('lawai_' + key); return v ? JSON.parse(v) : def; }
                        catch(e) { return def; }
                    },
                    set: function(key, value) {
                        try { localStorage.setItem('lawai_' + key, JSON.stringify(value)); return true; }
                        catch(e) { return false; }
                    }
                };
            }
        } catch (e) { /* 静默 */ }

        // 3. 触发 SYSTEM_READY（让 App 和 Router 初始化）
        try {
            var event = new CustomEvent('SYSTEM_READY', {
                detail: { boot: { booted: true }, timestamp: Date.now() }
            });
            window.dispatchEvent(event);
        } catch (e) { /* 静默 */ }

        // 4. 如果 App 还没初始化，手动触发
        try {
            if (window.App && typeof window.App.init === 'function' && !window.App._state?.initialized) {
                window.App.init({ boot: { booted: true } });
            }
        } catch (e) { console.warn('⚠️ App init fallback:', e); }

        _stages.critical = true;
        console.log('✅ Stage 1 complete — UI rendering started');
    }

    // ===========================================
    // 📊 STAGE 2: USER EXPERIENCE — 进度、推荐、成就
    // ===========================================
    function stage2UX() {
        console.log('🟡 Stage 2: User Experience — Loading progress & recommendations...');

        // 使用 requestIdleCallback 或 setTimeout 延迟执行
        var scheduleFn = window.requestIdleCallback || function(cb) { setTimeout(cb, 100); };

        scheduleFn(function() {
            // 1. ProgressEngine
            try {
                if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.init === 'function') {
                    LawAIApp.ProgressEngine.init();
                }
                if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                    LawAIApp.ProgressEngine.getProgress();
                }
            } catch (e) { console.warn('⚠️ ProgressEngine load:', e); }

            // 2. ExperienceEngine（XP 和里程碑）
            try {
                if (LawAIApp.ExperienceEngine && typeof LawAIApp.ExperienceEngine.init === 'function') {
                    LawAIApp.ExperienceEngine.init();
                }
            } catch (e) { console.warn('⚠️ ExperienceEngine load:', e); }

            // 3. 推荐引擎（轻量加载）
            try {
                if (LawAIApp.RecommendationEngine && typeof LawAIApp.RecommendationEngine.getRecommendations === 'function') {
                    // 预获取推荐，不阻塞
                    LawAIApp.RecommendationEngine.getRecommendations(3);
                }
            } catch (e) { console.warn('⚠️ RecommendationEngine load:', e); }

            // 4. 刷新 Dashboard 数据
            try {
                if (LawAIApp.Dashboard && typeof LawAIApp.Dashboard.render === 'function') {
                    // 如果 Dashboard 已经渲染，刷新数据
                    var root = document.getElementById('app') || document.getElementById('law-runtime-root');
                    if (root && root.innerHTML.includes('systemComposerRoot')) {
                        // 使用 SystemComposer 刷新
                        if (LawAIApp.SystemComposer && typeof LawAIApp.SystemComposer.refresh === 'function') {
                            LawAIApp.SystemComposer.refresh();
                        }
                    }
                }
            } catch (e) { console.warn('⚠️ Dashboard refresh:', e); }

            _stages.ux = true;
            console.log('✅ Stage 2 complete — UX data loaded');
        });
    }

    // ===========================================
    // 🧠 STAGE 3: INTELLIGENCE — 知识图谱、职业、AI 导师
    // ===========================================
    function stage3Intelligence() {
        console.log('🔵 Stage 3: Intelligence — Loading AI systems...');

        var scheduleFn = window.requestIdleCallback || function(cb) { setTimeout(cb, 300); };

        scheduleFn(function() {
            // 1. MemoryEngine（复习调度）
            try {
                if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.init === 'function') {
                    LawAIApp.MemoryEngine.init();
                }
            } catch (e) { console.warn('⚠️ MemoryEngine load:', e); }

            // 2. LessonEngine（课程数据）
            try {
                if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getAllLessons === 'function') {
                    LawAIApp.LessonEngine.getAllLessons();
                }
            } catch (e) { console.warn('⚠️ LessonEngine load:', e); }

            // 3. CareerEngine（职业发展）
            try {
                if (LawAIApp.CareerEngine && typeof LawAIApp.CareerEngine.init === 'function') {
                    LawAIApp.CareerEngine.init();
                }
            } catch (e) { console.warn('⚠️ CareerEngine load:', e); }

            // 4. AIMentorEngine（AI 导师）
            try {
                if (LawAIApp.AIMentorEngine && typeof LawAIApp.AIMentorEngine.init === 'function') {
                    LawAIApp.AIMentorEngine.init();
                }
            } catch (e) { console.warn('⚠️ AIMentorEngine load:', e); }

            // 5. SchoolEngine（多学院）
            try {
                if (LawAIApp.SchoolEngine && typeof LawAIApp.SchoolEngine.init === 'function') {
                    LawAIApp.SchoolEngine.init();
                }
            } catch (e) { console.warn('⚠️ SchoolEngine load:', e); }

            _stages.intelligence = true;
            console.log('✅ Stage 3 complete — Intelligence loaded');
        });
    }

    // ===========================================
    // 🔄 STAGE 4: BACKGROUND — 分析、同步、清理
    // ===========================================
    function stage4Background() {
        console.log('🟣 Stage 4: Background — Loading remaining systems...');

        var scheduleFn = window.requestIdleCallback || function(cb) { setTimeout(cb, 500); };

        scheduleFn(function() {
            // 1. PracticeEngine
            try {
                if (LawAIApp.PracticeEngine && typeof LawAIApp.PracticeEngine.init === 'function') {
                    LawAIApp.PracticeEngine.init();
                }
            } catch (e) { console.warn('⚠️ PracticeEngine load:', e); }

            // 2. ReflectionEngine
            try {
                if (LawAIApp.ReflectionEngine && typeof LawAIApp.ReflectionEngine.init === 'function') {
                    LawAIApp.ReflectionEngine.init();
                }
            } catch (e) { console.warn('⚠️ ReflectionEngine load:', e); }

            // 3. CertificateEngine
            try {
                if (LawAIApp.CertificateEngine && typeof LawAIApp.CertificateEngine.init === 'function') {
                    LawAIApp.CertificateEngine.init();
                }
            } catch (e) { console.warn('⚠️ CertificateEngine load:', e); }

            // 4. AcademicRecordEngine
            try {
                if (LawAIApp.AcademicRecordEngine && typeof LawAIApp.AcademicRecordEngine.init === 'function') {
                    LawAIApp.AcademicRecordEngine.init();
                }
            } catch (e) { console.warn('⚠️ AcademicRecordEngine load:', e); }

            // 5. CommunityEngine
            try {
                if (LawAIApp.CommunityEngine && typeof LawAIApp.CommunityEngine.init === 'function') {
                    LawAIApp.CommunityEngine.init();
                }
            } catch (e) { console.warn('⚠️ CommunityEngine load:', e); }

            // 6. 数据清理（非关键）
            try {
                var keys = Object.keys(localStorage);
                var prefix = 'lawai_';
                for (var i = 0; i < keys.length; i++) {
                    if (keys[i].startsWith(prefix) && keys[i].includes('_temp_')) {
                        localStorage.removeItem(keys[i]);
                    }
                }
            } catch (e) { /* 静默 */ }

            _stages.background = true;
            console.log('✅ Stage 4 complete — Background systems loaded');
            console.log('✅ All startup stages complete!');

            // 触发最终就绪事件
            try {
                window.dispatchEvent(new CustomEvent('BOOT_COMPLETE', {
                    detail: { stages: _stages, timestamp: Date.now() }
                }));
            } catch (e) { /* 静默 */ }
        });
    }

    // ===========================================
    // 🚀 启动管道 — 主入口
    // ===========================================
    function boot() {
        if (_booted) {
            console.log('🔄 Already booted');
            return;
        }

        _bootAttempts++;
        if (_bootAttempts > _maxBootAttempts) {
            console.error('❌ Boot failed after ' + _maxBootAttempts + ' attempts');
            showBootError('System failed to start. Please refresh.');
            return;
        }

        console.log('🚀 Bootstrapping Law AI Academy (attempt ' + _bootAttempts + ')...');
        console.log('📋 Startup Pipeline: Stage 1 → 2 → 3 → 4');

        // ============================================
        // 执行管道
        // ============================================
        try {
            // Stage 1: Critical — 立即执行（同步）
            stage1Critical();

            // Stage 2: UX — 延迟 100ms（使用 requestIdleCallback）
            setTimeout(function() {
                stage2UX();
            }, 100);

            // Stage 3: Intelligence — 延迟 500ms
            setTimeout(function() {
                stage3Intelligence();
            }, 500);

            // Stage 4: Background — 延迟 1000ms
            setTimeout(function() {
                stage4Background();
            }, 1000);

            _booted = true;
            console.log('✅ Bootstrap pipeline started (attempt ' + _bootAttempts + ')');

        } catch (err) {
            console.error('❌ Bootstrap failed:', err);
            if (_bootAttempts < _maxBootAttempts) {
                console.log('🔄 Retrying in 1 second...');
                setTimeout(boot, 1000);
            } else {
                showBootError('System failed to start. Please refresh.');
            }
        }
    }

    // ===========================================
    // 健康检查（精简版，不阻塞启动）
    // ===========================================
    function runHealthCheck() {
        var checks = {};
        var issues = [];

        try {
            checks.storage = !!LawAIApp.StorageEngine;
            if (!checks.storage) issues.push('StorageEngine missing');
        } catch (e) {
            checks.storage = false;
            issues.push('StorageEngine error');
        }

        try {
            checks.progress = !!LawAIApp.ProgressEngine;
            if (!checks.progress) issues.push('ProgressEngine missing');
        } catch (e) {
            checks.progress = false;
            issues.push('ProgressEngine error');
        }

        try {
            checks.eventBus = !!LawAIApp.EventBus;
            if (!checks.eventBus) issues.push('EventBus missing');
        } catch (e) {
            checks.eventBus = false;
            issues.push('EventBus error');
        }

        try {
            checks.systemComposer = !!LawAIApp.SystemComposer;
            if (!checks.systemComposer) issues.push('SystemComposer missing');
        } catch (e) {
            checks.systemComposer = false;
            issues.push('SystemComposer error');
        }

        try {
            checks.app = !!window.App;
            if (!checks.app) issues.push('App missing');
        } catch (e) {
            checks.app = false;
            issues.push('App error');
        }

        var allPassed = Object.values(checks).every(function(v) { return v; });

        return {
            checks: checks,
            allPassed: allPassed,
            issues: issues,
            status: allPassed ? 'healthy' : (issues.length < 3 ? 'degraded' : 'critical'),
            timestamp: new Date().toISOString()
        };
    }

    // ===========================================
    // 显示启动错误
    // ===========================================
    function showBootError(message) {
        var root = document.getElementById('law-runtime-root');
        if (root) {
            root.innerHTML = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: #0b1220;
                    color: white;
                    font-family: 'Inter', Arial, sans-serif;
                    text-align: center;
                    padding: 20px;
                ">
                    <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                    <h2 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">System Error</h2>
                    <p style="color: #94a3b8; font-size: 14px; margin: 0 0 20px 0;">${message}</p>
                    <button onclick="location.reload()" style="
                        padding: 12px 36px;
                        background: #4a9eff;
                        border: none;
                        border-radius: 10px;
                        color: white;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                    ">🔄 Refresh</button>
                </div>
            `;
        }
    }

    // ===========================================
    // 公共 API
    // ===========================================
    LawAIApp.BootManager = {
        start: function() {
            return new Promise(function(resolve) {
                if (_booted) {
                    resolve({ status: 'already_booted', stages: _stages });
                    return;
                }
                boot();
                resolve({ status: 'booted', stages: _stages });
            });
        },
        getHealth: function() { return _health; },
        isBooted: function() { return _booted; },
        runHealthCheck: runHealthCheck,
        getStatus: function() {
            return {
                booted: _booted,
                attempts: _bootAttempts,
                stages: _stages,
                health: _health
            };
        },
        getStages: function() { return _stages; }
    };

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
})();

console.log('🚀 Bootstrap V4.0 ready (Startup Pipeline)');
