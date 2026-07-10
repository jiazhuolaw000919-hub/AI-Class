// ===========================================
// lessonView.js
// 课程视图 - 完整课程展示（Season 1.5 Part D 升级版）
// V2.1 - 优化完成状态检查
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Views = LawAIApp.Views || {};

LawAIApp.Views.LessonView = {
    _container: null,
    _lessonId: null,
    _lesson: null,

    /**
     * 渲染课程视图
     * @param {string} lessonId - 课程ID
     * @param {HTMLElement|string} container - 容器元素
     */
    render: function(lessonId, container) {
        this._lessonId = lessonId;
        this._container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container || document.getElementById('app') || document.getElementById('law-runtime-root');

        if (!this._container) {
            console.warn('⚠️ LessonView: Container not found');
            return;
        }

        this._showSkeleton();

        var lesson = this._loadLesson(lessonId);
        if (lesson) {
            this._lesson = lesson;
            this._renderContent(lesson);
        } else {
            this._renderNotFound(lessonId);
        }
    },

    /**
     * 加载课程数据
     */
    _loadLesson: function(lessonId) {
        try {
            if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                var day = parseInt(lessonId.replace('day-', ''));
                if (!isNaN(day) && day >= 1 && day <= 365) {
                    var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
                    if (lesson) return lesson;
                }
            }
        } catch (e) {}

        try {
            if (LawAIApp.ModuleData && LawAIApp.ModuleData.modules) {
                var allModules = LawAIApp.ModuleData.modules;
                for (var i = 0; i < allModules.length; i++) {
                    var mod = allModules[i];
                    if (LawAIApp.LessonData && typeof LawAIApp.LessonData.getLessonsByModule === 'function') {
                        var lessons = LawAIApp.LessonData.getLessonsByModule(mod.id);
                        for (var j = 0; j < lessons.length; j++) {
                            if (lessons[j].lessonId === lessonId) {
                                return lessons[j];
                            }
                        }
                    }
                }
            }
        } catch (e) {}

        var dayNum = parseInt(lessonId.replace('day-', ''));
        if (!isNaN(dayNum)) {
            return {
                lessonId: lessonId,
                day: dayNum,
                title: 'Day ' + dayNum,
                shortTitle: 'Day ' + dayNum,
                description: 'Continue your AI learning journey.',
                category: 'General',
                difficulty: 'Beginner',
                estimatedMinutes: 10,
                estimatedXP: 20,
                tags: ['AI', 'Learning'],
                keywords: ['AI', 'learning'],
                moduleId: 'module_ai_foundation'
            };
        }

        return null;
    },

    /**
     * 显示骨架
     */
    _showSkeleton: function() {
        if (LawAIApp.LoadingStates && typeof LawAIApp.LoadingStates.getSkeleton === 'function') {
            this._container.innerHTML = LawAIApp.LoadingStates.getSkeleton('lesson');
        } else {
            this._container.innerHTML = `
                <div class="skeleton-lesson" style="padding:24px;max-width:800px;margin:0 auto;">
                    <div style="height:28px;width:60%;background:rgba(255,255,255,0.06);border-radius:8px;margin-bottom:16px;animation:pulse 1.5s infinite;"></div>
                    <div style="height:120px;background:rgba(255,255,255,0.04);border-radius:12px;margin-bottom:16px;animation:pulse 1.5s infinite 0.2s;"></div>
                    <div style="height:80px;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:16px;animation:pulse 1.5s infinite 0.4s;"></div>
                    <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px;">
                        <div style="height:60px;background:rgba(255,255,255,0.03);border-radius:12px;animation:pulse 1.5s infinite 0.6s;"></div>
                        <div style="height:60px;background:rgba(255,255,255,0.03);border-radius:12px;animation:pulse 1.5s infinite 0.8s;"></div>
                    </div>
                    <style>
                        @keyframes pulse {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0.4; }
                        }
                    </style>
                </div>
            `;
        }
    },

    /**
     * 检查课程是否完成（优化版）
     */
    _isLessonCompleted: function(lessonId) {
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.isLessonCompleted === 'function') {
                return LawAIApp.ProgressEngine.isLessonCompleted(lessonId);
            }
            if (LawAIApp.ModuleProgress && typeof LawAIApp.ModuleProgress.get === 'function') {
                var modProgress = LawAIApp.ModuleProgress.get(this._lesson?.moduleId);
                if (modProgress && modProgress.completedLessons) {
                    return modProgress.completedLessons.indexOf(lessonId) !== -1;
                }
            }
        } catch (e) {}
        return false;
    },

    /**
     * 渲染课程内容
     */
    _renderContent: function(lesson) {
        var completed = this._isLessonCompleted(lesson.lessonId);

        var html = `
            <div class="lesson-container" style="
                max-width: 800px;
                margin: 0 auto;
                padding: 16px 20px 40px;
                color: #e2e8f0;
            ">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                    <button onclick="LawAIApp.Router?.goBack ? LawAIApp.Router.goBack() : history.back()" style="
                        background:none;
                        border:none;
                        color:#4a9eff;
                        font-size:14px;
                        cursor:pointer;
                        padding:4px 8px;
                    ">← Back</button>
                    <span style="color:#64748b;font-size:13px;">
                        ${lesson.moduleId || 'Academy'} / ${lesson.title || lesson.lessonId}
                    </span>
                </div>

                <div style="
                    background: linear-gradient(135deg, #1a2a4a, #2a1a4a);
                    padding: 24px;
                    border-radius: 16px;
                    margin-bottom: 20px;
                    border: 1px solid rgba(255,255,255,0.06);
                ">
                    <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:#94a3b8;margin-bottom:8px;">
                        <span>📊 ${lesson.difficulty || 'Beginner'}</span>
                        <span>⏱️ ${lesson.estimatedMinutes || 10} min</span>
                        <span>⭐ ${lesson.estimatedXP || 20} XP</span>
                        ${completed ? '<span style="color:#22c55e;">✅ Completed</span>' : ''}
                    </div>
                    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;">${lesson.title || lesson.lessonId}</h2>
                    <p style="margin:0;color:#94a3b8;font-size:14px;">${lesson.description || 'Continue building your AI knowledge.'}</p>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
                        ${(lesson.tags || []).map(function(tag) {
                            return '<span style="background:rgba(74,158,255,0.15);color:#4a9eff;padding:2px 10px;border-radius:12px;font-size:11px;">' + tag + '</span>';
                        }).join('')}
                    </div>
                </div>

                <div style="
                    background:rgba(255,255,255,0.03);
                    border-radius:12px;
                    padding:16px 20px;
                    margin-bottom:16px;
                    border:1px solid rgba(255,255,255,0.06);
                ">
                    <h3 style="margin:0 0 4px;font-size:14px;color:#94a3b8;">🎯 Learning Objective</h3>
                    <p style="margin:0;font-size:14px;">Understand the core idea behind "${lesson.shortTitle || lesson.title}".</p>
                </div>

                <div style="
                    background:rgba(255,255,255,0.03);
                    border-radius:12px;
                    padding:16px 20px;
                    margin-bottom:16px;
                    border:1px solid rgba(255,255,255,0.06);
                ">
                    <h3 style="margin:0 0 4px;font-size:14px;color:#94a3b8;">📖 Main Content</h3>
                    <p style="margin:0;font-size:14px;color:#94a3b8;">Lesson content will be displayed here. Complete the lesson to unlock full content.</p>
                </div>

                <div style="
                    background:rgba(74,158,255,0.05);
                    border-radius:12px;
                    padding:16px 20px;
                    margin-bottom:16px;
                    border:1px solid rgba(74,158,255,0.1);
                ">
                    <h3 style="margin:0 0 4px;font-size:14px;color:#4a9eff;">🤖 AI Summary</h3>
                    <p style="margin:0;font-size:14px;">${lesson.summary || 'This lesson introduces key concepts in ' + (lesson.category || 'AI') + '. Focus on understanding the core principles.'}</p>
                </div>

                <div style="
                    background:rgba(139,92,246,0.05);
                    border-radius:12px;
                    padding:16px 20px;
                    margin-bottom:16px;
                    border:1px solid rgba(139,92,246,0.1);
                ">
                    <h3 style="margin:0 0 4px;font-size:14px;color:#8b5cf6;">🧠 Memory Hook</h3>
                    <p style="margin:0;font-size:14px;">Remember: ${(lesson.keywords || []).join(', ') || 'Key concepts from this lesson'}</p>
                </div>

                <div style="
                    background:rgba(251,191,36,0.05);
                    border-radius:12px;
                    padding:16px 20px;
                    margin-bottom:16px;
                    border:1px solid rgba(251,191,36,0.1);
                ">
                    <h3 style="margin:0 0 4px;font-size:14px;color:#f59e0b;">💭 Reflection</h3>
                    <p style="margin:0;font-size:14px;">What is one AI example you encountered today that relates to this lesson?</p>
                    <textarea style="
                        width:100%;
                        margin-top:8px;
                        padding:10px;
                        background:rgba(255,255,255,0.05);
                        border:1px solid rgba(255,255,255,0.08);
                        border-radius:8px;
                        color:#e2e8f0;
                        font-size:13px;
                        resize:vertical;
                        min-height:60px;
                        font-family:inherit;
                    " placeholder="Write your reflection here..."></textarea>
                </div>

                ${!completed ? `
                    <button onclick="LawAIApp.Views.LessonView.completeLesson('${lesson.lessonId}')" style="
                        width:100%;
                        padding:14px;
                        background:#22c55e;
                        border:none;
                        border-radius:12px;
                        color:white;
                        font-size:16px;
                        font-weight:600;
                        cursor:pointer;
                        transition:transform 0.2s;
                        margin-top:8px;
                    " onmouseover="this.style.transform='scale(1.01)'" onmouseout="this.style.transform='scale(1)'">
                        ✅ Complete Lesson
                    </button>
                ` : `
                    <div style="
                        text-align:center;
                        padding:16px;
                        background:rgba(34,197,94,0.1);
                        border-radius:12px;
                        border:1px solid rgba(34,197,94,0.2);
                        margin-top:8px;
                    ">
                        🎉 You have completed this lesson!
                    </div>
                `}

                <div style="display:flex;justify-content:space-between;margin-top:16px;gap:12px;">
                    <button onclick="LawAIApp.Views.LessonView.previousLesson()" style="
                        flex:1;
                        padding:10px;
                        background:rgba(255,255,255,0.05);
                        border:1px solid rgba(255,255,255,0.08);
                        border-radius:10px;
                        color:#94a3b8;
                        font-size:14px;
                        cursor:pointer;
                    ">⬅️ Previous</button>
                    <button onclick="LawAIApp.Views.LessonView.nextLesson()" style="
                        flex:1;
                        padding:10px;
                        background:rgba(255,255,255,0.05);
                        border:1px solid rgba(255,255,255,0.08);
                        border-radius:10px;
                        color:#94a3b8;
                        font-size:14px;
                        cursor:pointer;
                    ">Next ➡️</button>
                </div>
            </div>
        `;

        this._container.innerHTML = html;
        if (this._container.scrollTop !== undefined) {
            this._container.scrollTop = 0;
        }
    },

    /**
     * 未找到课程
     */
    _renderNotFound: function(lessonId) {
        this._container.innerHTML = `
            <div style="
                display:flex;
                flex-direction:column;
                align-items:center;
                justify-content:center;
                padding:60px 20px;
                color:#94a3b8;
                text-align:center;
                min-height:300px;
            ">
                <div style="font-size:48px;margin-bottom:16px;">🔍</div>
                <h3 style="color:#e2e8f0;margin:0 0 8px;">Lesson Not Found</h3>
                <p style="margin:0 0 20px;">Could not find lesson: ${lessonId}</p>
                <button onclick="LawAIApp.Router?.goHome ? LawAIApp.Router.goHome() : location.href='/' " style="
                    padding:10px 28px;
                    background:#4a9eff;
                    border:none;
                    border-radius:10px;
                    color:white;
                    font-size:14px;
                    cursor:pointer;
                ">🏠 Go Home</button>
            </div>
        `;
    },

    /**
     * 完成课程
     */
    completeLesson: function(lessonId) {
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.completeLesson === 'function') {
                var result = LawAIApp.ProgressEngine.completeLesson(lessonId);
                if (result) {
                    var xpGain = result.xpGain || 20;
                    if (LawAIApp.Toast && typeof LawAIApp.Toast.success === 'function') {
                        LawAIApp.Toast.success('🎉 Lesson completed! +' + xpGain + ' XP');
                    } else {
                        alert('🎉 Lesson completed! +' + xpGain + ' XP');
                    }
                    // 重新渲染
                    this.render(lessonId, this._container);
                    LawAIApp.EventBus?.emit?.('LessonCompleted', { lessonId: lessonId });
                }
            } else {
                console.warn('⚠️ ProgressEngine.completeLesson not available');
                if (LawAIApp.Toast?.warning) {
                    LawAIApp.Toast.warning('ProgressEngine not available');
                } else {
                    alert('ProgressEngine not available');
                }
            }
        } catch (err) {
            console.error('Complete lesson error:', err);
            if (LawAIApp.Toast?.error) {
                LawAIApp.Toast.error('Failed to complete lesson');
            }
        }
    },

    /**
     * 上一课
     */
    previousLesson: function() {
        if (this._lessonId) {
            var day = parseInt(this._lessonId.replace('day-', ''));
            if (day > 1) {
                this.render('day-' + (day - 1), this._container);
            } else {
                if (LawAIApp.Toast?.info) {
                    LawAIApp.Toast.info('You\'re at the first lesson');
                }
            }
        }
    },

    /**
     * 下一课
     */
    nextLesson: function() {
        if (this._lessonId) {
            var day = parseInt(this._lessonId.replace('day-', ''));
            if (day < 365) {
                this.render('day-' + (day + 1), this._container);
            } else {
                if (LawAIApp.Toast?.info) {
                    LawAIApp.Toast.info('🎉 You\'ve completed all lessons!');
                }
            }
        }
    },

    /**
     * 练习模式
     */
    goPractice: function(lessonId) {
        if (LawAIApp.Toast?.info) {
            LawAIApp.Toast.info('✏️ Practice mode coming soon!');
        }
    }
};

console.log('📖 LessonView V2.1 ready');
