// ===========================================
// bootstrap.js
// Academy 引导引擎 — 极简启动管道 + S4 内容加载
// V6.0.0 — 加入 bootstrapS4Content
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

        if (LawAIApp.DevTools?.RuntimeProfiler) {
            LawAIApp.DevTools.RuntimeProfiler.registerEngine('Bootstrap');
            LawAIApp.DevTools.RuntimeProfiler.mark('bootstrap_start');
        }

        console.log('🚀 Bootstrap: Starting (V6.0.0)');

        // ===========================================
        // Stage 1: Critical — 立即触发渲染
        // ===========================================
        try {
            var event = new CustomEvent('SYSTEM_READY', {
                detail: { boot: { booted: true }, timestamp: Date.now() }
            });
            window.dispatchEvent(event);
            console.log('✅ Stage 1: SYSTEM_READY dispatched');
        } catch (e) {
            console.warn('⚠️ SYSTEM_READY dispatch failed:', e);
        }

        // ===========================================
        // Stage 2: UX — 100ms 后加载进度和推荐
        // ===========================================
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

        // ===========================================
        // 🔥 Stage 2.5: S4 Content — 200ms 后加载真实课程
        // ===========================================
        setTimeout(function() {
            bootstrapS4Content();
        }, 200);

        // ===========================================
        // Stage 3: Intelligence — 500ms 后加载 AI 系统
        // ===========================================
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

        // ===========================================
        // Stage 4: Background — 1000ms 后加载剩余系统
        // ===========================================
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

            if (LawAIApp.DevTools?.RuntimeProfiler) {
                LawAIApp.DevTools.RuntimeProfiler.mark('bootstrap_end');
                LawAIApp.DevTools.RuntimeProfiler.freeze();
                console.log('📊 RuntimeProfiler frozen');
            }
        }, 1000);

        // 触发最终就绪事件
        setTimeout(function() {
            try {
                window.dispatchEvent(new CustomEvent('BOOT_COMPLETE', {
                    detail: { timestamp: Date.now() }
                }));
            } catch (e) { /* 静默 */ }
        }, 1200);
    }

    // ===========================================
    // 🔥 Stage 2.5: Bootstrap S4 Content
    // Bible Part 1: 内容加载链必须完整
    // ===========================================
    function bootstrapS4Content() {
        var cl = window.LawAIApp && window.LawAIApp.ContentLoader;
        var sr = window.LawAIApp && window.LawAIApp.SubjectRegistry;

        console.log('[Bootstrap-S4] 🚀 Starting...');
        console.log('[Bootstrap-S4] ContentLoader:', typeof cl);
        console.log('[Bootstrap-S4] SubjectRegistry:', typeof sr);

        if (!cl) {
            console.error('[Bootstrap-S4] ❌ ContentLoader not available');
            return;
        }
        if (!sr) {
            console.error('[Bootstrap-S4] ❌ SubjectRegistry not available');
            return;
        }

        // 如果已经加载过
        if (sr.initialized) {
            try {
                var existing = typeof sr.getAllSubjects === 'function' ? sr.getAllSubjects() : [];
                if (existing && existing.length > 0) {
                    console.log('[Bootstrap-S4] ✅ Already loaded:', existing.length, 'subjects');
                    return;
                }
            } catch (e) {}
        }

        var COURSE_ID = 'course-ai';
        var SUBJECT_IDS = [
            'subject-ai-fundamentals',
            'subject-prompt-engineering',
            'subject-chatgpt'
        ];

        console.log('[Bootstrap-S4] 🚀 Loading course:', COURSE_ID);

        Promise.resolve(cl.loadCourse(COURSE_ID)).then(function(course) {
            console.log('[Bootstrap-S4] ✅ course loaded:', COURSE_ID);

            return Promise.all(SUBJECT_IDS.map(function(sid) {
                return cl.loadSubject(COURSE_ID, sid).then(function(subj) {
                    if (!subj) {
                        console.warn('[Bootstrap-S4] subject null:', sid);
                        return null;
                    }
                    console.log('[Bootstrap-S4] ✅ subject loaded:', sid);

                    return cl.loadSubjectLessons(COURSE_ID, sid).then(function(lessons) {
                        console.log('[Bootstrap-S4] ✅ lessons loaded:', sid, '→', (lessons || []).length);
                        subj.lessons = lessons || [];
                        return subj;
                    });
                }).catch(function(e) {
                    console.warn('[Bootstrap-S4] subject failed:', sid, e.message);
                    return null;
                });
            }));
        }).then(function(subjects) {
            var valid = subjects.filter(function(s) { return s !== null; });
            console.log('[Bootstrap-S4] ✅ Total subjects:', valid.length);

            // 注册到 SubjectRegistry
            try {
                if (typeof sr.registerSubject === 'function') {
                    valid.forEach(function(subj) {
                        try { sr.registerSubject(subj); } catch (e) {}
                    });
                    console.log('[Bootstrap-S4] ✅ Registered via registerSubject()');
                } else if (sr._subjects) {
                    if (Array.isArray(sr._subjects)) {
                        valid.forEach(function(subj) { sr._subjects.push(subj); });
                        console.log('[Bootstrap-S4] ✅ Pushed to _subjects (array)');
                    } else if (typeof sr._subjects === 'object') {
                        valid.forEach(function(subj) { sr._subjects[subj.id] = subj; });
                        console.log('[Bootstrap-S4] ✅ Added to _subjects (object)');
                    }
                } else {
                    console.warn('[Bootstrap-S4] ⚠️ Cannot register subjects - no registerSubject or _subjects');
                }

                sr.initialized = true;
                console.log('[Bootstrap-S4] ✅ SubjectRegistry initialized');
            } catch (e) {
                console.error('[Bootstrap-S4] ❌ Registration failed:', e);
            }

            // 触发 Dashboard 重新渲染
            if (window.LawAIApp && window.LawAIApp.Dashboard) {
                window.LawAIApp.Dashboard._lastRenderAt = 0;
                window.LawAIApp.Dashboard.forceRender();
                console.log('[Bootstrap-S4] ✅ Dashboard re-rendered');
            }

            // 发事件
            try {
                window.dispatchEvent(new CustomEvent('S4_CONTENT_READY', {
                    detail: { subjectsCount: valid.length }
                }));
            } catch (e) {}

        }).catch(function(e) {
            console.error('[Bootstrap-S4] ❌ Failed:', e);
        });
    }

    // 暴露到全局（用于调试）
    window.bootstrapS4Content = bootstrapS4Content;

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

    // 公开 API
    LawAIApp.Bootstrap = {
        isBooted: function() { return _booted; },
        loadS4Content: bootstrapS4Content
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

console.log('🚀 Bootstrap V6.0.0 ready (with S4 content loading)');
