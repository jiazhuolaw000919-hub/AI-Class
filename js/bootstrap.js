// ===========================================
// bootstrap.js
// Academy 引导引擎 - 系统初始化 + 健康检查（Season 1.5 Part I 完整版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};

(function() {
    var _booted = false;
    var _health = {};
    var _bootAttempts = 0;
    var _maxBootAttempts = 3;

    // ===========================================
    // 启动管道
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

        try {
            // 1. 详细健康检查（Part I）
            var healthReport = runHealthCheck();
            _health = healthReport;

            // 输出详细报告
            console.log('📊 Health Report:', healthReport);

            if (!healthReport.allPassed) {
                console.warn('⚠️ Health check issues found:', healthReport.issues);
                // 尝试自动修复
                var repaired = attemptRepair(healthReport.issues);
                if (repaired > 0) {
                    console.log('🔧 Repaired ' + repaired + ' issues');
                    // 重新检查
                    var recheck = runHealthCheck();
                    if (recheck.allPassed) {
                        console.log('✅ All issues resolved after repair');
                    } else {
                        console.warn('⚠️ Some issues remain:', recheck.issues);
                    }
                }
            }

            // 2. 初始化核心引擎
            initializeCoreEngines();

            // 3. 验证数据完整性（Part A）
            verifyDataIntegrity();

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
            console.log('✅ Bootstrap complete (attempt ' + _bootAttempts + ')');

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
    // 详细健康检查（Part I 核心）
    // ===========================================
    function runHealthCheck() {
        var checks = {};
        var issues = [];
        var details = {};

        // 检查 StorageEngine
        try {
            if (LawAIApp.StorageEngine) {
                checks.storage = true;
                details.storage = 'ok';
                // 测试存储功能
                var testKey = 'lawai_health_test';
                localStorage.setItem(testKey, 'ok');
                localStorage.removeItem(testKey);
            } else {
                checks.storage = false;
                details.storage = 'missing';
                issues.push({ module: 'StorageEngine', severity: 'critical', message: 'StorageEngine missing' });
            }
        } catch (e) {
            checks.storage = false;
            details.storage = 'error';
            issues.push({ module: 'StorageEngine', severity: 'critical', message: 'StorageEngine error: ' + e.message });
        }

        // 检查 ProgressEngine
        try {
            if (LawAIApp.ProgressEngine) {
                checks.progress = true;
                details.progress = 'ok';
                // 验证 getProgress 可用
                if (typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                    var test = LawAIApp.ProgressEngine.getProgress();
                    if (test && typeof test === 'object') {
                        // 正常
                    } else {
                        issues.push({ module: 'ProgressEngine', severity: 'high', message: 'getProgress returned invalid data' });
                    }
                }
            } else {
                checks.progress = false;
                details.progress = 'missing';
                issues.push({ module: 'ProgressEngine', severity: 'critical', message: 'ProgressEngine missing' });
            }
        } catch (e) {
            checks.progress = false;
            details.progress = 'error';
            issues.push({ module: 'ProgressEngine', severity: 'critical', message: 'ProgressEngine error: ' + e.message });
        }

        // 检查 EventBus
        try {
            if (LawAIApp.EventBus) {
                checks.eventBus = true;
                details.eventBus = 'ok';
                // 测试 emit 功能
                if (typeof LawAIApp.EventBus.emit === 'function') {
                    // 正常
                }
            } else {
                checks.eventBus = false;
                details.eventBus = 'missing';
                issues.push({ module: 'EventBus', severity: 'high', message: 'EventBus missing' });
            }
        } catch (e) {
            checks.eventBus = false;
            details.eventBus = 'error';
            issues.push({ module: 'EventBus', severity: 'high', message: 'EventBus error: ' + e.message });
        }

        // 检查 SystemComposer
        try {
            if (LawAIApp.SystemComposer) {
                checks.systemComposer = true;
                details.systemComposer = 'ok';
            } else {
                checks.systemComposer = false;
                details.systemComposer = 'missing';
                issues.push({ module: 'SystemComposer', severity: 'high', message: 'SystemComposer missing' });
            }
        } catch (e) {
            checks.systemComposer = false;
            details.systemComposer = 'error';
            issues.push({ module: 'SystemComposer', severity: 'high', message: 'SystemComposer error: ' + e.message });
        }

        // 检查 App
        try {
            if (window.App) {
                checks.app = true;
                details.app = 'ok';
            } else {
                checks.app = false;
                details.app = 'missing';
                issues.push({ module: 'App', severity: 'critical', message: 'App missing' });
            }
        } catch (e) {
            checks.app = false;
            details.app = 'error';
            issues.push({ module: 'App', severity: 'critical', message: 'App error: ' + e.message });
        }

        // 检查 localStorage
        try {
            if (localStorage) {
                checks.localStorage = true;
                details.localStorage = 'ok';
                // 测试读写
                localStorage.setItem('lawai_health_test', 'ok');
                localStorage.removeItem('lawai_health_test');
            }
        } catch (e) {
            checks.localStorage = false;
            details.localStorage = 'error';
            issues.push({ module: 'localStorage', severity: 'critical', message: 'localStorage unavailable: ' + e.message });
        }

        var allPassed = Object.values(checks).every(function(v) { return v; });

        // 生成修复建议
        var recommendations = issues.map(function(issue) {
            if (issue.module === 'StorageEngine') return 'Check StorageEngine initialization or create placeholder';
            if (issue.module === 'ProgressEngine') return 'Ensure ProgressEngine is loaded before bootstrap';
            if (issue.module === 'App') return 'Verify app.js is loaded and App object exists';
            return 'Check module ' + issue.module + ' loading';
        });

        return {
            checks: checks,
            details: details,
            allPassed: allPassed,
            issues: issues,
            recommendations: recommendations,
            status: allPassed ? 'healthy' : (issues.length < 3 ? 'degraded' : 'critical'),
            timestamp: new Date().toISOString()
        };
    }

    // ===========================================
    // 自动修复
    // ===========================================
    function attemptRepair(issues) {
        console.log('🔧 Attempting repairs...');
        var repaired = 0;

        issues.forEach(function(issue) {
            if (issue.module === 'StorageEngine' && issue.severity === 'critical') {
                if (!LawAIApp.StorageEngine) {
                    LawAIApp.StorageEngine = {
                        _placeholder: true,
                        get: function(key, defaultValue) { 
                            try { var val = localStorage.getItem('lawai_' + key); return val ? JSON.parse(val) : defaultValue; } 
                            catch(e) { return defaultValue; }
                        },
                        set: function(key, value) { 
                            try { localStorage.setItem('lawai_' + key, JSON.stringify(value)); return true; } 
                            catch(e) { return false; }
                        },
                        init: function() { console.log('💾 StorageEngine placeholder initialized'); return this; }
                    };
                    repaired++;
                }
            }

            if (issue.module === 'EventBus' && issue.severity === 'high') {
                if (!LawAIApp.EventBus) {
                    LawAIApp.EventBus = {
                        _placeholder: true,
                        emit: function(event, data) { 
                            try { window.dispatchEvent(new CustomEvent(event, { detail: data })); } 
                            catch(e) {}
                            return true;
                        },
                        on: function(event, callback) { 
                            try { window.addEventListener(event, function(e) { callback(e.detail); }); } 
                            catch(e) {}
                            return true;
                        }
                    };
                    repaired++;
                }
            }
        });

        return repaired;
    }

    // ===========================================
    // 初始化核心引擎
    // ===========================================
    function initializeCoreEngines() {
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

        try {
            if (LawAIApp.EventBus && typeof LawAIApp.EventBus.init === 'function') {
                LawAIApp.EventBus.init();
            }
        } catch (e) { console.warn('EventBus init failed:', e); }
    }

    // ===========================================
    // 验证数据完整性（Part A）
    // ===========================================
    function verifyDataIntegrity() {
        try {
            var progress = LawAIApp.ProgressEngine?.getProgress?.() || {};
            
            // 检查是否有异常数据
            if (progress.xp < 0) {
                console.warn('⚠️ Invalid XP value detected, resetting...');
                progress.xp = 0;
                if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.saveProgress === 'function') {
                    LawAIApp.ProgressEngine.saveProgress(progress);
                }
            }

            if (!Array.isArray(progress.completedLessons)) {
                console.warn('⚠️ Invalid completedLessons detected, resetting...');
                progress.completedLessons = [];
                if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.saveProgress === 'function') {
                    LawAIApp.ProgressEngine.saveProgress(progress);
                }
            }

            console.log('✅ Data integrity verified');
        } catch (e) {
            console.warn('⚠️ Data integrity check failed:', e);
        }
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
                    <button onclick="if(LawAIApp.FactoryReset) LawAIApp.FactoryReset.execute()" style="
                        margin-top: 10px;
                        padding: 10px 30px;
                        background: rgba(255,255,255,0.08);
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 10px;
                        color: #94a3b8;
                        font-size: 13px;
                        cursor: pointer;
                    ">🗑️ Factory Reset</button>
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
                    resolve({ status: 'already_booted', health: _health });
                    return;
                }
                boot();
                resolve({ status: 'booted', health: _health });
            });
        },
        getHealth: function() { return _health; },
        isBooted: function() { return _booted; },
        runHealthCheck: runHealthCheck,
        getStatus: function() {
            return {
                booted: _booted,
                attempts: _bootAttempts,
                health: _health
            };
        }
    };

    // ===========================================
    // 启动执行
    // ===========================================
    function execute() {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(boot, 100);
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(boot, 100);
            });
        }
    }

    execute();
})();

console.log('🚀 Bootstrap V3.0 ready');
