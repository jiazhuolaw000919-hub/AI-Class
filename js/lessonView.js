// ===========================================
// lessonView.js
// 课程视图 - Classroom Edition (Phase 3)
// "The learner should forget they are using a website."
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Views = LawAIApp.Views || {};

LawAIApp.Views.LessonView = {
    _container: null,
    _lessonId: null,
    _lesson: null,
    _currentPractice: null,
    _isFocused: false,

    /**
     * 渲染课程视图 — Classroom Edition
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

        // 记录渲染
        if (LawAIApp.DevTools?.RuntimeProfiler) {
            LawAIApp.DevTools.RuntimeProfiler.recordRender('lesson');
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

    // ============================================================
    // 数据加载
    // ============================================================

    _loadLesson: function(lessonId) {
        var day = parseInt(lessonId.replace('day-', '').replace('day', ''));
        if (isNaN(day)) {
            day = parseInt(lessonId);
        }
        if (isNaN(day) || day < 1) day = 1;
        if (day > 365) day = 365;

        try {
            if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
                if (lesson) return lesson;
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

        if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.createLesson === 'function') {
            return LawAIApp.LessonEngine.createLesson(day);
        }

        return {
            lessonId: 'day-' + day,
            day: day,
            title: 'Day ' + day,
            shortTitle: 'Day ' + day,
            description: 'Continue your AI learning journey.',
            category: 'General',
            difficulty: 'Beginner',
            estimatedMinutes: 10,
            estimatedXP: 20,
            tags: ['AI', 'Learning'],
            keywords: ['AI', 'learning'],
            moduleId: 'module_ai_foundation'
        };
    },

    _getLessonTitle: function(day) {
        try {
            if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
                if (lesson && lesson.title) return lesson.title;
            }
        } catch (e) {}
        return 'Day ' + day;
    },

    _getLessonSummary: function(day) {
        try {
            if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.getLessonByDay === 'function') {
                var lesson = LawAIApp.LessonEngine.getLessonByDay(day);
                if (lesson && lesson.summary) return lesson.summary;
                if (lesson && lesson.subtitle) return lesson.subtitle;
            }
        } catch (e) {}
        return 'Continue your learning journey.';
    },

    // ============================================================
    // 状态检查
    // ============================================================

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

    _needsReview: function(lessonId) {
        try {
            if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.getMemoryStrength === 'function') {
                var strength = LawAIApp.MemoryEngine.getMemoryStrength(lessonId);
                return strength < 70 && strength > 0;
            }
        } catch (e) {}
        return false;
    },

    _getMemoryStrength: function(lessonId) {
        try {
            if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.getMemoryStrength === 'function') {
                return LawAIApp.MemoryEngine.getMemoryStrength(lessonId);
            }
        } catch (e) {}
        return null;
    },

    _getProgress: function() {
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                return LawAIApp.ProgressEngine.getProgress();
            }
        } catch (e) {}
        return { completedLessons: [], totalLessons: 365 };
    },

    // ============================================================
    // 骨架
    // ============================================================

    _showSkeleton: function() {
        if (LawAIApp.LoadingStates && typeof LawAIApp.LoadingStates.getSkeleton === 'function') {
            this._container.innerHTML = LawAIApp.LoadingStates.getSkeleton('lesson');
        } else {
            this._container.innerHTML = `
                <div class="skeleton-lesson" style="
                    padding: 24px 20px;
                    max-width: 740px;
                    margin: 0 auto;
                    animation: lessonFade 0.3s ease;
                ">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                        <div style="height:24px;width:80px;background:rgba(255,255,255,0.04);border-radius:6px;animation:pulse 1.5s infinite;"></div>
                        <div style="height:20px;width:120px;background:rgba(255,255,255,0.03);border-radius:6px;animation:pulse 1.5s infinite 0.2s;"></div>
                    </div>
                    <div style="height:32px;width:70%;background:rgba(255,255,255,0.06);border-radius:8px;margin-bottom:12px;animation:pulse 1.5s infinite 0.3s;"></div>
                    <div style="height:16px;width:90%;background:rgba(255,255,255,0.03);border-radius:4px;margin-bottom:6px;animation:pulse 1.5s infinite 0.4s;"></div>
                    <div style="height:16px;width:80%;background:rgba(255,255,255,0.03);border-radius:4px;margin-bottom:6px;animation:pulse 1.5s infinite 0.5s;"></div>
                    <div style="height:16px;width:60%;background:rgba(255,255,255,0.03);border-radius:4px;margin-bottom:20px;animation:pulse 1.5s infinite 0.6s;"></div>
                    <div style="height:100px;background:rgba(255,255,255,0.03);border-radius:12px;margin-bottom:16px;animation:pulse 1.5s infinite 0.7s;"></div>
                    <div style="height:80px;background:rgba(255,255,255,0.02);border-radius:12px;margin-bottom:16px;animation:pulse 1.5s infinite 0.8s;"></div>
                    <div style="height:48px;width:60%;background:rgba(74,158,255,0.08);border-radius:10px;margin:8px auto 0;animation:pulse 1.5s infinite 0.9s;"></div>
                    <style>
                        @keyframes pulse {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0.3; }
                        }
                        @keyframes lessonFade {
                            from { opacity: 0; transform: translateY(8px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    </style>
                </div>
            `;
        }
    },

    // ============================================================
    // 🔥 Classroom Content — 核心学习体验
    // ============================================================

    _renderContent: function(lesson) {
        var completed = this._isLessonCompleted(lesson.lessonId);
        var needsReview = this._needsReview(lesson.lessonId);
        var memoryStrength = this._getMemoryStrength(lesson.lessonId);
        var progress = this._getProgress();
        var completedCount = progress.completedLessons?.length || 0;
        var totalCount = progress.totalLessons || 365;
        var dayNum = parseInt(lesson.lessonId.replace('day-', '')) || 1;

        var html = `
        <div class="lesson-classroom" style="
            max-width: 740px;
            margin: 0 auto;
            padding: 8px 0 40px;
            color: #e2e8f0;
            font-family: 'Inter', -apple-system, sans-serif;
            animation: lessonFade 0.3s ease;
        ">
            <!-- ========================================================== -->
            <!-- 🔙 Navigation Bar — 极简导航 -->
            <!-- ========================================================== -->
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0 16px;
                border-bottom: 1px solid rgba(255,255,255,0.04);
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 8px;
            ">
                <!-- 返回 -->
                <button onclick="LawAIApp.Router?.goBack ? LawAIApp.Router.goBack() : history.back()" style="
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.04);
                    border-radius: 8px;
                    color: #94a3b8;
                    padding: 6px 14px;
                    font-size: 12px;
                    cursor: pointer;
                    font-family: inherit;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                " onmouseover="this.style.background='rgba(255,255,255,0.08)';this.style.color='#e2e8f0'" onmouseout="this.style.background='rgba(255,255,255,0.04)';this.style.color='#94a3b8'">
                    ← Back
                </button>

                <!-- 进度指示器 -->
                <div style="display:flex;align-items:center;gap:10px;font-size:11px;color:#64748b;">
                    <span>${completedCount}/${totalCount}</span>
                    <span style="opacity:0.3;">·</span>
                    <span>${Math.round((completedCount / totalCount) * 100)}%</span>
                    ${completed ? '<span style="color:#22c55e;font-size:10px;">✅ Done</span>' : ''}
                </div>
            </div>

            <!-- ========================================================== -->
            <!-- 📖 Lesson Content — 专注阅读体验 -->
            <!-- ========================================================== -->

            <!-- 标题区 -->
            <div style="margin-bottom: 16px;">
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                    font-size: 11px;
                    color: #64748b;
                    margin-bottom: 6px;
                ">
                    <span>📖 Day ${dayNum}</span>
                    <span style="opacity:0.3;">·</span>
                    <span>${lesson.difficulty || 'Beginner'}</span>
                    <span style="opacity:0.3;">·</span>
                    <span>${lesson.estimatedMinutes || 10} min</span>
                    <span style="opacity:0.3;">·</span>
                    <span>⭐ ${lesson.estimatedXP || 20} XP</span>
                    ${memoryStrength !== null ? `
                        <span style="opacity:0.3;">·</span>
                        <span style="color:${memoryStrength >= 70 ? '#22c55e' : memoryStrength >= 40 ? '#f59e0b' : '#ef4444'};">🧠 ${Math.round(memoryStrength)}%</span>
                    ` : ''}
                </div>
                <h1 style="
                    margin: 0;
                    font-size: 26px;
                    font-weight: 700;
                    letter-spacing: -0.3px;
                    line-height: 1.2;
                    color: #e2e8f0;
                ">${lesson.title || lesson.lessonId}</h1>
                <p style="
                    margin: 6px 0 0;
                    font-size: 15px;
                    color: #94a3b8;
                    line-height: 1.5;
                ">${lesson.description || 'Continue building your AI knowledge.'}</p>
                ${(lesson.tags || []).length > 0 ? `
                    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
                        ${(lesson.tags || []).map(function(tag) {
                            return '<span style="background:rgba(74,158,255,0.08);color:#4a9eff;padding:1px 10px;border-radius:100px;font-size:10px;">' + tag + '</span>';
                        }).join('')}
                    </div>
                ` : ''}
            </div>

            <!-- 学习目标 -->
            <div style="
                background: rgba(74,158,255,0.04);
                border-radius: 12px;
                padding: 14px 18px;
                margin-bottom: 16px;
                border-left: 3px solid #4a9eff;
            ">
                <div style="font-size:11px;color:#4a9eff;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:2px;">
                    🎯 Objective
                </div>
                <p style="margin:0;font-size:14px;color:#e2e8f0;line-height:1.5;">
                    ${lesson.summary || lesson.subtitle || 'Understand the core concepts of this lesson.'}
                </p>
            </div>

            <!-- 主内容 -->
            <div style="
                background: rgba(255,255,255,0.02);
                border-radius: 12px;
                padding: 16px 18px;
                margin-bottom: 16px;
                border: 1px solid rgba(255,255,255,0.04);
                line-height: 1.7;
                font-size: 15px;
                color: #e2e8f0;
            ">
                <p style="margin:0;">${lesson.summary || 'Lesson content will be displayed here. Focus on understanding the core principles and how they apply to real-world scenarios.'}</p>
            </div>

            <!-- AI 摘要（优雅折叠式） -->
            <div style="
                background: rgba(139,92,246,0.04);
                border-radius: 12px;
                padding: 12px 16px;
                margin-bottom: 16px;
                border: 1px solid rgba(139,92,246,0.06);
            ">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
                    <span style="font-size:14px;">🤖</span>
                    <span style="font-size:11px;color:#8b5cf6;font-weight:500;">AI Insight</span>
                </div>
                <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                    ${lesson.summary || 'Focus on the core concepts and how they connect to what you already know.'}
                </p>
            </div>

            <!-- 记忆钩子 -->
            <div style="
                background: rgba(251,191,36,0.04);
                border-radius: 12px;
                padding: 10px 16px;
                margin-bottom: 16px;
                border: 1px solid rgba(251,191,36,0.06);
            ">
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:14px;">🧠</span>
                    <span style="font-size:11px;color:#f59e0b;font-weight:500;">Remember</span>
                </div>
                <p style="margin:2px 0 0;font-size:13px;color:#94a3b8;line-height:1.5;">
                    ${(lesson.keywords || []).join(', ') || 'Key concepts from this lesson'}
                </p>
            </div>

            <!-- 💭 反思（轻量） -->
            <div style="
                background: rgba(255,255,255,0.02);
                border-radius: 12px;
                padding: 12px 16px;
                margin-bottom: 16px;
                border: 1px solid rgba(255,255,255,0.04);
            ">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                    <span style="font-size:14px;">💭</span>
                    <span style="font-size:11px;color:#64748b;font-weight:400;">Quick reflection</span>
                </div>
                <textarea id="reflection-textarea" style="
                    width:100%;
                    padding:8px 10px;
                    background:rgba(255,255,255,0.03);
                    border:1px solid rgba(255,255,255,0.06);
                    border-radius:8px;
                    color:#e2e8f0;
                    font-size:13px;
                    resize:vertical;
                    min-height:40px;
                    font-family:inherit;
                    transition:border 0.2s;
                " placeholder="What stood out to you in this lesson?" onfocus="this.style.borderColor='rgba(74,158,255,0.3)'" onblur="this.style.borderColor='rgba(255,255,255,0.06)'"></textarea>
                <button onclick="LawAIApp.Views.LessonView.saveReflection()" style="
                    margin-top:4px;
                    padding:3px 12px;
                    background:rgba(255,255,255,0.04);
                    border:1px solid rgba(255,255,255,0.06);
                    border-radius:6px;
                    color:#64748b;
                    font-size:10px;
                    cursor:pointer;
                    font-family:inherit;
                    transition:all 0.2s;
                " onmouseover="this.style.background='rgba(255,255,255,0.08)';this.style.color='#e2e8f0'" onmouseout="this.style.background='rgba(255,255,255,0.04)';this.style.color='#64748b'">
                    💾 Save
                </button>
            </div>

            <!-- ✏️ Practice（轻量） -->
            <div style="
                background: rgba(34,197,94,0.04);
                border-radius: 12px;
                padding: 12px 16px;
                margin-bottom: 16px;
                border: 1px solid rgba(34,197,94,0.06);
            ">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                    <span style="font-size:14px;">✏️</span>
                    <span style="font-size:11px;color:#22c55e;font-weight:400;">Practice</span>
                </div>
                <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;" id="practice-description">
                    Test your understanding.
                </p>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button onclick="LawAIApp.Views.LessonView.startPractice()" style="
                        padding:4px 14px;
                        background:rgba(34,197,94,0.1);
                        border:1px solid rgba(34,197,94,0.1);
                        border-radius:6px;
                        color:#22c55e;
                        font-size:11px;
                        cursor:pointer;
                        font-family:inherit;
                        transition:all 0.2s;
                    " onmouseover="this.style.background='rgba(34,197,94,0.2)'" onmouseout="this.style.background='rgba(34,197,94,0.1)'">
                        Start
                    </button>
                    <button onclick="LawAIApp.Views.LessonView.submitPractice()" style="
                        padding:4px 14px;
                        background:rgba(255,255,255,0.04);
                        border:1px solid rgba(255,255,255,0.06);
                        border-radius:6px;
                        color:#64748b;
                        font-size:11px;
                        cursor:pointer;
                        font-family:inherit;
                        transition:all 0.2s;
                    " onmouseover="this.style.background='rgba(255,255,255,0.08)';this.style.color='#e2e8f0'" onmouseout="this.style.background='rgba(255,255,255,0.04)';this.style.color='#64748b'">
                        Submit
                    </button>
                </div>
                <div id="practice-feedback" style="margin-top:4px;font-size:11px;color:#94a3b8;"></div>
                <input type="text" id="practice-answer" style="
                    width:100%;
                    margin-top:4px;
                    padding:6px 10px;
                    background:rgba(255,255,255,0.03);
                    border:1px solid rgba(255,255,255,0.06);
                    border-radius:6px;
                    color:#e2e8f0;
                    font-size:12px;
                    font-family:inherit;
                    transition:border 0.2s;
                " placeholder="Type your answer..." onfocus="this.style.borderColor='rgba(74,158,255,0.3)'" onblur="this.style.borderColor='rgba(255,255,255,0.06)'">
            </div>

            <!-- 🔄 Review（如果已完成且需要复习） -->
            ${completed && needsReview ? `
            <div style="
                background: rgba(245,158,11,0.04);
                border-radius: 12px;
                padding: 10px 16px;
                margin-bottom: 16px;
                border: 1px solid rgba(245,158,11,0.06);
                display:flex;
                align-items:center;
                justify-content:space-between;
                flex-wrap:wrap;
                gap:8px;
            ">
                <div>
                    <span style="font-size:12px;color:#f59e0b;">🔄 Review recommended</span>
                    <span style="font-size:11px;color:#94a3b8;display:block;">Strengthen your memory of this lesson.</span>
                </div>
                <button onclick="LawAIApp.Views.LessonView.startReview()" style="
                    padding:4px 14px;
                    background:rgba(245,158,11,0.1);
                    border:1px solid rgba(245,158,11,0.15);
                    border-radius:6px;
                    color:#f59e0b;
                    font-size:11px;
                    cursor:pointer;
                    font-family:inherit;
                    transition:all 0.2s;
                " onmouseover="this.style.background='rgba(245,158,11,0.2)'" onmouseout="this.style.background='rgba(245,158,11,0.1)'">
                    Start Review
                </button>
                <div id="review-feedback" style="width:100%;font-size:11px;color:#94a3b8;"></div>
            </div>
            ` : ''}

            <!-- ========================================================== -->
            <!-- ✅ 完成按钮（主要行动点） -->
            <!-- ========================================================== -->
            ${!completed ? `
            <button onclick="LawAIApp.Views.LessonView.completeLesson('${lesson.lessonId}')" style="
                width:100%;
                padding: 14px;
                background: linear-gradient(135deg, #22c55e, #16a34a);
                border: none;
                border-radius: 12px;
                color: white;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                font-family: inherit;
                transition: all 0.3s ease;
                box-shadow: 0 4px 24px rgba(34,197,94,0.15);
            " onmouseover="this.style.transform='scale(1.01)';this.style.boxShadow='0 8px 40px rgba(34,197,94,0.25)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 4px 24px rgba(34,197,94,0.15)'">
                ✅ Complete Lesson
            </button>
            ` : `
            <div style="
                text-align:center;
                padding: 12px;
                background: rgba(34,197,94,0.06);
                border-radius: 12px;
                border: 1px solid rgba(34,197,94,0.08);
                display:flex;
                align-items:center;
                justify-content:center;
                gap:8px;
            ">
                <span style="font-size:18px;">🎉</span>
                <span style="font-size:14px;color:#22c55e;font-weight:500;">Lesson completed!</span>
                ${memoryStrength !== null ? `<span style="font-size:11px;color:#64748b;">🧠 ${Math.round(memoryStrength)}% memory strength</span>` : ''}
            </div>
            `}

            <!-- ========================================================== -->
            <!-- 导航 — 上一课/下一课 -->
            <!-- ========================================================== -->
            <div style="
                display:flex;
                justify-content:space-between;
                gap:10px;
                margin-top:16px;
            ">
                <button onclick="LawAIApp.Views.LessonView.previousLesson()" style="
                    flex:1;
                    padding:8px;
                    background:rgba(255,255,255,0.03);
                    border:1px solid rgba(255,255,255,0.04);
                    border-radius:10px;
                    color:#64748b;
                    font-size:12px;
                    cursor:pointer;
                    font-family:inherit;
                    transition:all 0.2s;
                " onmouseover="this.style.background='rgba(255,255,255,0.06)';this.style.color='#e2e8f0'" onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.color='#64748b'">
                    ⬅️ Previous
                </button>
                <button onclick="LawAIApp.Views.LessonView.nextLesson()" style="
                    flex:1;
                    padding:8px;
                    background:rgba(255,255,255,0.03);
                    border:1px solid rgba(255,255,255,0.04);
                    border-radius:10px;
                    color:#64748b;
                    font-size:12px;
                    cursor:pointer;
                    font-family:inherit;
                    transition:all 0.2s;
                " onmouseover="this.style.background='rgba(255,255,255,0.06)';this.style.color='#e2e8f0'" onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.color='#64748b'">
                    Next ➡️
                </button>
            </div>

            <style>
                @keyframes lessonFade {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>

        </div>
        `;

        this._container.innerHTML = html;
        if (this._container.scrollTop !== undefined) {
            this._container.scrollTop = 0;
        }
    },

    // ============================================================
    // 未找到课程
    // ============================================================

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
                animation:lessonFade 0.3s ease;
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
                    font-family:inherit;
                ">🏠 Go Home</button>
                <style>
                    @keyframes lessonFade {
                        from { opacity: 0; transform: translateY(8px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                </style>
            </div>
        `;
    },

    // ============================================================
    // 核心 Actions
    // ============================================================

    completeLesson: function(lessonId) {
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.completeLesson === 'function') {
                var result = LawAIApp.ProgressEngine.completeLesson(lessonId);
                if (result) {
                    var xpGain = result.xpGain || 20;
                    // 微完成效果
                    this._showCompletionEffect();
                    if (LawAIApp.Toast && typeof LawAIApp.Toast.success === 'function') {
                        LawAIApp.Toast.success('✅ Lesson completed! +' + xpGain + ' XP');
                    }
                    this.render(lessonId, this._container);
                    LawAIApp.EventBus?.emit?.('LessonCompleted', { lessonId: lessonId });
                }
            } else {
                console.warn('⚠️ ProgressEngine.completeLesson not available');
                if (LawAIApp.Toast?.warning) {
                    LawAIApp.Toast.warning('ProgressEngine not available');
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
     * 微完成效果 — 不打扰，但有反馈
     */
    _showCompletionEffect: function() {
        var container = this._container;
        if (!container) return;

        // 简单粒子效果
        var emojis = ['✨', '⭐', '🌟'];
        for (var i = 0; i < 6; i++) {
            var el = document.createElement('div');
            el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            el.style.cssText = `
                position: fixed;
                font-size: ${16 + Math.random() * 20}px;
                left: ${20 + Math.random() * 60}%;
                top: ${30 + Math.random() * 40}%;
                pointer-events: none;
                z-index: 9999;
                opacity: 1;
                transition: all 1.2s ease-out;
                transform: translateY(0) scale(1);
            `;
            document.body.appendChild(el);

            setTimeout(function(elem) {
                elem.style.transform = `translateY(-${60 + Math.random() * 80}px) scale(1.4)`;
                elem.style.opacity = '0';
            }, 50, el);

            setTimeout(function(elem) {
                if (elem.parentNode) elem.parentNode.removeChild(elem);
            }, 1500, el);
        }
    },

    saveReflection: function() {
        var textarea = document.getElementById('reflection-textarea');
        if (!textarea) return;
        var reflection = textarea.value.trim();
        if (!reflection) {
            if (LawAIApp.Toast?.info) {
                LawAIApp.Toast.info('Write a quick reflection first.');
            }
            return;
        }

        var userId = 'default';
        var lessonId = this._lessonId;

        try {
            if (LawAIApp.ReflectionEngine && typeof LawAIApp.ReflectionEngine.saveReflection === 'function') {
                LawAIApp.ReflectionEngine.saveReflection(userId, lessonId, reflection);
                if (LawAIApp.Toast?.success) {
                    LawAIApp.Toast.success('💭 Reflection saved');
                }
                textarea.value = '';
                textarea.style.borderColor = 'rgba(34,197,94,0.3)';
                setTimeout(function() {
                    textarea.style.borderColor = 'rgba(255,255,255,0.06)';
                }, 2000);
            } else {
                console.warn('⚠️ ReflectionEngine not available');
            }
        } catch (err) {
            console.error('Save reflection error:', err);
        }
    },

    startPractice: function() {
        var lessonId = this._lessonId;
        var type = 'mini_exercise';

        try {
            if (LawAIApp.PracticeEngine && typeof LawAIApp.PracticeEngine.getRecommendedType === 'function') {
                type = LawAIApp.PracticeEngine.getRecommendedType(lessonId);
            }
            if (LawAIApp.PracticeEngine && typeof LawAIApp.PracticeEngine.startPractice === 'function') {
                var practice = LawAIApp.PracticeEngine.startPractice(lessonId, type);
                this._currentPractice = practice;
                
                var descEl = document.getElementById('practice-description');
                if (descEl) {
                    descEl.textContent = practice.description;
                    descEl.style.color = '#4a9eff';
                }
                var feedbackEl = document.getElementById('practice-feedback');
                if (feedbackEl) {
                    feedbackEl.textContent = '✏️ Practice started. Type your answer and submit.';
                    feedbackEl.style.color = '#4a9eff';
                }
                if (LawAIApp.Toast?.info) {
                    LawAIApp.Toast.info('✏️ Practice started');
                }
            }
        } catch (err) {
            console.error('Start practice error:', err);
        }
    },

    submitPractice: function() {
        var input = document.getElementById('practice-answer');
        if (!input) return;
        var answer = input.value.trim();
        if (!answer) {
            if (LawAIApp.Toast?.info) {
                LawAIApp.Toast.info('Write your answer first.');
            }
            return;
        }

        try {
            if (LawAIApp.PracticeEngine && typeof LawAIApp.PracticeEngine.completePractice === 'function') {
                var result = LawAIApp.PracticeEngine.completePractice(this._currentPractice, answer);
                if (result) {
                    var feedbackEl = document.getElementById('practice-feedback');
                    if (feedbackEl) {
                        feedbackEl.textContent = result.feedback;
                        feedbackEl.style.color = result.correct ? '#22c55e' : '#ef4444';
                    }
                    if (LawAIApp.Toast?.success) {
                        LawAIApp.Toast.success(result.correct ? '✅ Correct!' : 'Keep practicing');
                    }
                    input.value = '';
                    
                    if (result.correct && LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.updateMemory === 'function') {
                        try {
                            var currentStrength = LawAIApp.MemoryEngine.getMemoryStrength(this._lessonId) || 50;
                            LawAIApp.MemoryEngine.updateMemory(this._lessonId, Math.min(100, currentStrength + 5));
                        } catch (e) {}
                    }
                }
            }
        } catch (err) {
            console.error('Submit practice error:', err);
        }
    },

    startReview: function() {
        var lessonId = this._lessonId;

        try {
            if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.recordReview === 'function') {
                var performance = 0.8;
                LawAIApp.MemoryEngine.recordReview(lessonId, performance);
                
                var feedbackEl = document.getElementById('review-feedback');
                if (feedbackEl) {
                    feedbackEl.textContent = '✅ Review recorded! Memory strengthened.';
                    feedbackEl.style.color = '#22c55e';
                }
                if (LawAIApp.Toast?.success) {
                    LawAIApp.Toast.success('🔄 Review completed!');
                }
                setTimeout(function() {
                    this.render(lessonId, this._container);
                }.bind(this), 800);
            }
        } catch (err) {
            console.error('Start review error:', err);
        }
    },

    // ============================================================
    // 导航
    // ============================================================

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

    nextLesson: function() {
        if (this._lessonId) {
            var day = parseInt(this._lessonId.replace('day-', ''));
            var progress = this._getProgress();
            var total = progress.totalLessons || 365;
            if (day < total) {
                this.render('day-' + (day + 1), this._container);
            } else {
                if (LawAIApp.Toast?.info) {
                    LawAIApp.Toast.info('🎉 You\'ve completed all lessons!');
                }
            }
        }
    },

    goPractice: function(lessonId) {
        if (LawAIApp.Toast?.info) {
            LawAIApp.Toast.info('✏️ Practice mode coming soon!');
        }
    }
};

console.log('📖 LessonView V4.0 ready (Classroom Edition)');
