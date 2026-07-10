// ===========================================
// lessonView.js
// 课程视图 - 完整课程展示（Season 1.5 Part D 升级版）
// V3.0 - 整合 MemoryEngine + PracticeEngine + ReflectionEngine
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Views = LawAIApp.Views || {};

LawAIApp.Views.LessonView = {
    _container: null,
    _lessonId: null,
    _lesson: null,
    _currentPractice: null,

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
     * 加载课程数据（支持多种 day 格式）
     */
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
     * 检查课程是否完成
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
     * 检查是否需要复习
     */
    _needsReview: function(lessonId) {
        try {
            if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.getMemoryStrength === 'function') {
                var strength = LawAIApp.MemoryEngine.getMemoryStrength(lessonId);
                return strength < 70 && strength > 0;
            }
        } catch (e) {}
        return false;
    },

    /**
     * 获取记忆强度
     */
    _getMemoryStrength: function(lessonId) {
        try {
            if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.getMemoryStrength === 'function') {
                return LawAIApp.MemoryEngine.getMemoryStrength(lessonId);
            }
        } catch (e) {}
        return null;
    },

    /**
     * 渲染课程内容
     */
    _renderContent: function(lesson) {
        var completed = this._isLessonCompleted(lesson.lessonId);
        var needsReview = this._needsReview(lesson.lessonId);
        var memoryStrength = this._getMemoryStrength(lesson.lessonId);

        var memoryStrengthHtml = '';
        if (memoryStrength !== null) {
            var strengthColor = memoryStrength >= 70 ? '#22c55e' : memoryStrength >= 40 ? '#f59e0b' : '#ef4444';
            memoryStrengthHtml = `
                <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#94a3b8;">
                    <span>🧠 Memory: <span style="color:${strengthColor};font-weight:600;">${Math.round(memoryStrength)}%</span></span>
                    <div style="flex:1;height:4px;background:rgba(255,255,255,0.08);border-radius:10px;overflow:hidden;width:60px;">
                        <div style="width:${memoryStrength}%;height:100%;background:${strengthColor};border-radius:10px;"></div>
                    </div>
                </div>
            `;
        }

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
                    ${memoryStrengthHtml}
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
                        ${needsReview ? '<span style="color:#f59e0b;">🔄 Review Recommended</span>' : ''}
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
                    <p style="margin:0;font-size:14px;color:#94a3b8;">${lesson.summary || 'Lesson content will be displayed here.'}</p>
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

                <!-- 💭 Reflection -->
                <div style="
                    background:rgba(251,191,36,0.05);
                    border-radius:12px;
                    padding:16px 20px;
                    margin-bottom:16px;
                    border:1px solid rgba(251,191,36,0.1);
                ">
                    <h3 style="margin:0 0 4px;font-size:14px;color:#f59e0b;">💭 Reflection</h3>
                    <p style="margin:0;font-size:13px;color:#94a3b8;">What is one AI example you encountered today that relates to this lesson?</p>
                    <textarea id="reflection-textarea" style="
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
                    <button onclick="LawAIApp.Views.LessonView.saveReflection()" style="
                        margin-top:8px;
                        padding:6px 18px;
                        background:rgba(251,191,36,0.15);
                        border:1px solid rgba(251,191,36,0.2);
                        border-radius:8px;
                        color:#f59e0b;
                        font-size:12px;
                        cursor:pointer;
                        transition:all 0.2s;
                    " onmouseover="this.style.background='rgba(251,191,36,0.25)'" onmouseout="this.style.background='rgba(251,191,36,0.15)'">
                        💾 Save Reflection
                    </button>
                </div>

                <!-- ✏️ Practice -->
                <div style="
                    background:rgba(34,197,94,0.05);
                    border-radius:12px;
                    padding:16px 20px;
                    margin-bottom:16px;
                    border:1px solid rgba(34,197,94,0.1);
                ">
                    <h3 style="margin:0 0 4px;font-size:14px;color:#22c55e;">✏️ Practice</h3>
                    <p style="margin:0;font-size:13px;color:#94a3b8;" id="practice-description">
                        Click "Start Practice" to test your knowledge.
                    </p>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
                        <button onclick="LawAIApp.Views.LessonView.startPractice()" style="
                            padding:8px 20px;
                            background:#22c55e;
                            border:none;
                            border-radius:8px;
                            color:white;
                            font-size:13px;
                            font-weight:500;
                            cursor:pointer;
                            transition:all 0.2s;
                        " onmouseover="this.style.background='#16a34a'" onmouseout="this.style.background='#22c55e'">
                            🚀 Start Practice
                        </button>
                        <button onclick="LawAIApp.Views.LessonView.submitPractice()" style="
                            padding:8px 20px;
                            background:rgba(255,255,255,0.06);
                            border:1px solid rgba(255,255,255,0.08);
                            border-radius:8px;
                            color:#94a3b8;
                            font-size:13px;
                            cursor:pointer;
                            transition:all 0.2s;
                        " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.06)'">
                            📤 Submit Answer
                        </button>
                    </div>
                    <div id="practice-feedback" style="margin-top:8px;font-size:13px;color:#94a3b8;"></div>
                    <input type="text" id="practice-answer" style="
                        width:100%;
                        margin-top:8px;
                        padding:10px;
                        background:rgba(255,255,255,0.05);
                        border:1px solid rgba(255,255,255,0.08);
                        border-radius:8px;
                        color:#e2e8f0;
                        font-size:13px;
                        font-family:inherit;
                    " placeholder="Type your answer here...">
                </div>

                <!-- 🔄 Review -->
                ${completed && needsReview ? `
                <div style="
                    background:rgba(245,158,11,0.05);
                    border-radius:12px;
                    padding:16px 20px;
                    margin-bottom:16px;
                    border:1px solid rgba(245,158,11,0.1);
                ">
                    <h3 style="margin:0 0 4px;font-size:14px;color:#f59e0b;">🔄 Review</h3>
                    <p style="margin:0;font-size:13px;color:#94a3b8;">Time to review this lesson to strengthen your memory.</p>
                    <button onclick="LawAIApp.Views.LessonView.startReview()" style="
                        margin-top:8px;
                        padding:8px 20px;
                        background:#f59e0b;
                        border:none;
                        border-radius:8px;
                        color:white;
                        font-size:13px;
                        font-weight:500;
                        cursor:pointer;
                        transition:all 0.2s;
                    " onmouseover="this.style.background='#d97706'" onmouseout="this.style.background='#f59e0b'">
                        🔄 Start Review
                    </button>
                    <div id="review-feedback" style="margin-top:8px;font-size:13px;color:#94a3b8;"></div>
                </div>
                ` : ''}

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
     * 保存反思
     */
    saveReflection: function() {
        var textarea = document.getElementById('reflection-textarea');
        if (!textarea) return;
        var reflection = textarea.value.trim();
        if (!reflection) {
            if (LawAIApp.Toast?.info) {
                LawAIApp.Toast.info('Please write something before saving.');
            }
            return;
        }

        var userId = 'default';
        var lessonId = this._lessonId;

        try {
            if (LawAIApp.ReflectionEngine && typeof LawAIApp.ReflectionEngine.saveReflection === 'function') {
                LawAIApp.ReflectionEngine.saveReflection(userId, lessonId, reflection);
                if (LawAIApp.Toast?.success) {
                    LawAIApp.Toast.success('💭 Reflection saved!');
                }
                textarea.value = '';
            } else {
                console.warn('⚠️ ReflectionEngine not available');
                if (LawAIApp.Toast?.warning) {
                    LawAIApp.Toast.warning('ReflectionEngine not available');
                }
            }
        } catch (err) {
            console.error('Save reflection error:', err);
            if (LawAIApp.Toast?.error) {
                LawAIApp.Toast.error('Failed to save reflection');
            }
        }
    },

    /**
     * 开始练习
     */
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
                }
                var feedbackEl = document.getElementById('practice-feedback');
                if (feedbackEl) {
                    feedbackEl.textContent = '✏️ Practice started! Type your answer and click Submit.';
                    feedbackEl.style.color = '#4a9eff';
                }
                if (LawAIApp.Toast?.info) {
                    LawAIApp.Toast.info('✏️ Practice started!');
                }
            }
        } catch (err) {
            console.error('Start practice error:', err);
            if (LawAIApp.Toast?.error) {
                LawAIApp.Toast.error('Failed to start practice');
            }
        }
    },

    /**
     * 提交练习答案
     */
    submitPractice: function() {
        var input = document.getElementById('practice-answer');
        if (!input) return;
        var answer = input.value.trim();
        if (!answer) {
            if (LawAIApp.Toast?.info) {
                LawAIApp.Toast.info('Please write your answer first.');
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
                        LawAIApp.Toast.success(result.correct ? '✅ Great job!' : 'Keep practicing!');
                    }
                    input.value = '';
                    
                    // 如果正确，更新记忆强度
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
            if (LawAIApp.Toast?.error) {
                LawAIApp.Toast.error('Failed to submit practice');
            }
        }
    },

    /**
     * 开始复习
     */
    startReview: function() {
        var lessonId = this._lessonId;

        try {
            if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.recordReview === 'function') {
                var performance = 0.8; // 假设复习表现良好
                LawAIApp.MemoryEngine.recordReview(lessonId, performance);
                
                var feedbackEl = document.getElementById('review-feedback');
                if (feedbackEl) {
                    feedbackEl.textContent = '✅ Review recorded! Memory strengthened.';
                    feedbackEl.style.color = '#22c55e';
                }
                if (LawAIApp.Toast?.success) {
                    LawAIApp.Toast.success('🔄 Review completed! Memory strengthened.');
                }
                // 重新渲染
                setTimeout(function() {
                    this.render(lessonId, this._container);
                }.bind(this), 1000);
            }
        } catch (err) {
            console.error('Start review error:', err);
            if (LawAIApp.Toast?.error) {
                LawAIApp.Toast.error('Failed to complete review');
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
     * 练习模式（保留兼容）
     */
    goPractice: function(lessonId) {
        if (LawAIApp.Toast?.info) {
            LawAIApp.Toast.info('✏️ Practice mode coming soon!');
        }
    }
};

console.log('📖 LessonView V3.0 ready');
