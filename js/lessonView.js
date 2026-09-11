// ===========================================
// lessonView.js
// 课程视图 - Classroom Edition (Phase 3) + Navigation Enhancement (Phase 6)
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
        console.log('[LessonView] _loadLesson 尝试加载:', lessonId);

        // ============================================================
        // 1. 🔥 优先从 Academy 系统（CurriculumAuthority / SubjectRegistry）拿
        // ============================================================
        var ca = window.LawAIApp?.CurriculumAuthority;
        var sr = window.LawAIApp?.SubjectRegistry;

        // 1.1 从 CurriculumAuthority 拿
        if (ca && typeof ca.getLesson === 'function') {
            try {
                var caLesson = ca.getLesson(lessonId);
                if (caLesson) {
                    console.log('[LessonView] ✅ 从 CurriculumAuthority 拿到 lesson');
                    // 标准化数据格式
                    return {
                        lessonId: caLesson.id || lessonId,
                        title: caLesson.title || caLesson.name || 'Untitled Lesson',
                        shortTitle: caLesson.title || caLesson.name || 'Lesson',
                        description: caLesson.description || '',
                        summary: caLesson.summary || caLesson.description || '',
                        category: caLesson.category || 'General',
                        difficulty: caLesson.difficulty || 'Beginner',
                        estimatedMinutes: caLesson.duration || 10,
                        estimatedXP: caLesson.xp || 20,
                        tags: caLesson.tags || [],
                        keywords: caLesson.keywords || [],
                        moduleId: caLesson.subjectId || caLesson.moduleId,
                        officialVideo: caLesson.video?.url || caLesson.officialVideo || null,
                        video: caLesson.video || null,
                        quiz: caLesson.quiz || null,
                        content: caLesson.content || null,
                        sections: caLesson.sections || null,
                        keyTakeaways: caLesson.keyTakeaways || null,
                        flashcards: caLesson.flashcards || null,
                        practice: caLesson.practice || null,
                        _raw: caLesson,
                        _source: 'CurriculumAuthority'
                    };
                }
            } catch (e) {
                console.warn('[LessonView] CA.getLesson 失败:', e);
            }
        }

        // 1.2 从 SubjectRegistry 遍历找
        if (sr && typeof sr.getAllSubjects === 'function') {
            try {
                var subjects = sr.getAllSubjects();
                for (var i = 0; i < subjects.length; i++) {
                    var subj = subjects[i];
                    var lessons = subj.lessons || [];
                    for (var j = 0; j < lessons.length; j++) {
                        var l = lessons[j];
                        var lid = (typeof l === 'string') ? l : (l.id || l.lessonId);
                        if (lid === lessonId) {
                            var lessonObj = (typeof l === 'string') 
                                ? { id: l, title: l, name: l } 
                                : l;
                            console.log('[LessonView] ✅ 从 SubjectRegistry 拿到 lesson');
                            return {
                                lessonId: lessonObj.id || lessonId,
                                title: lessonObj.title || lessonObj.name || 'Untitled Lesson',
                                shortTitle: lessonObj.title || lessonObj.name || 'Lesson',
                                description: lessonObj.description || '',
                                summary: lessonObj.summary || lessonObj.description || '',
                                difficulty: lessonObj.difficulty || 'Beginner',
                                estimatedMinutes: lessonObj.duration || 10,
                                estimatedXP: lessonObj.xp || 20,
                                tags: lessonObj.tags || [],
                                moduleId: subj.id,
                                officialVideo: lessonObj.video?.url || null,
                                video: lessonObj.video || null,
                                quiz: lessonObj.quiz || null,
                                _raw: lessonObj,
                                _source: 'SubjectRegistry'
                            };
                        }
                    }
                }
            } catch (e) {
                console.warn('[LessonView] SR 遍历失败:', e);
            }
        }

        // ============================================================
        // 2. Fallback: 老的 Day-based 系统
        // ============================================================
        console.log('[LessonView] ⚠️ Academy 系统里没找到，尝试 Day-based 系统');

        var day = parseInt(lessonId.replace('day-', '').replace('day', ''));
        if (isNaN(day)) day = parseInt(lessonId);
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
                for (var k = 0; k < allModules.length; k++) {
                    var mod = allModules[k];
                    if (LawAIApp.LessonData && typeof LawAIApp.LessonData.getLessonsByModule === 'function') {
                        var lsns = LawAIApp.LessonData.getLessonsByModule(mod.id);
                        for (var m = 0; m < lsns.length; m++) {
                            if (lsns[m].lessonId === lessonId) {
                                return lsns[m];
                            }
                        }
                    }
                }
            }
        } catch (e) {}

        if (LawAIApp.LessonEngine && typeof LawAIApp.LessonEngine.createLesson === 'function') {
            return LawAIApp.LessonEngine.createLesson(day);
        }

        // ============================================================
        // 3. 兜底
        // ============================================================
        return {
            lessonId: lessonId,
            title: 'Lesson ' + lessonId,
            shortTitle: 'Lesson',
            description: 'Lesson content unavailable.',
            category: 'General',
            difficulty: 'Beginner',
            estimatedMinutes: 10,
            estimatedXP: 20,
            tags: [],
            keywords: [],
            moduleId: null
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
    // 🔥 Phase 6: 课程导航增强
    // ============================================================

    /**
     * 获取课程导航信息（智能导航）
     */
    _getLessonNavigation: function(currentDay) {
        var progress = this._getProgress();
        var completed = progress.completedLessons || [];
        var total = progress.totalLessons || 365;
        var currentIndex = completed.indexOf('day-' + currentDay);
        
        var isCompleted = currentIndex !== -1;
        
        // 找下一课（未完成的第一课）
        var nextDay = currentDay + 1;
        while (nextDay <= total && completed.indexOf('day-' + nextDay) !== -1) {
            nextDay++;
        }
        if (nextDay > total) nextDay = total;
        
        // 找上一课（已完成的最后一课）
        var prevDay = currentDay - 1;
        while (prevDay >= 1 && completed.indexOf('day-' + prevDay) === -1) {
            prevDay--;
        }
        if (prevDay < 1) prevDay = 1;
        
        return {
            currentDay: currentDay,
            isCompleted: isCompleted,
            nextDay: nextDay,
            prevDay: prevDay,
            completedCount: completed.length,
            totalCount: total,
            progressPercent: Math.round((completed.length / total) * 100)
        };
    },

    /**
     * 智能继续 — 从当前课程继续到下一课
     */
    continueFromLesson: function() {
        if (this._lessonId) {
            var day = parseInt(this._lessonId.replace('day-', ''));
            var nav = this._getLessonNavigation(day);
            if (nav.isCompleted && nav.nextDay > day) {
                this.render('day-' + nav.nextDay, this._container);
            } else if (!nav.isCompleted) {
                // 当前课程还没完成，继续当前
                if (LawAIApp.Toast?.info) {
                    LawAIApp.Toast.info('📖 Complete this lesson first!');
                }
            } else {
                if (LawAIApp.Toast?.info) {
                    LawAIApp.Toast.info('🎉 All lessons completed!');
                }
            }
        }
    },

    /**
     * 获取下一课标题（用于 Continue Learning）
     */
    getNextLessonTitle: function() {
        if (this._lessonId) {
            var day = parseInt(this._lessonId.replace('day-', ''));
            var nav = this._getLessonNavigation(day);
            if (nav.isCompleted && nav.nextDay > day) {
                return this._getLessonTitle(nav.nextDay);
            }
            return this._lesson?.title || this._getLessonTitle(day);
        }
        return 'Continue Learning';
    },

    /**
     * 获取下一课链接
     */
    getNextLessonLink: function() {
        if (this._lessonId) {
            var day = parseInt(this._lessonId.replace('day-', ''));
            var nav = this._getLessonNavigation(day);
            if (nav.isCompleted && nav.nextDay > day) {
                return '/pages/lesson.html?day=' + nav.nextDay;
            }
            return '/pages/lesson.html?day=' + day;
        }
        return '/pages/lesson.html?day=1';
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

        // 🔥 Phase 6: 获取课程导航信息
        var nav = this._getLessonNavigation(dayNum);
        var hasNext = nav.nextDay > dayNum;
        var hasPrev = nav.prevDay < dayNum;

        // 在 _renderContent() 中，构建 activities
        var activities = [
            {
                id: 'reading-' + lesson.lessonId,
                type: 'READING',
                order: 1,
                title: 'Read',
                content: lesson.summary || lesson.description || 'Lesson content.',
                metadata: { lessonId: lesson.lessonId }
            },
            {
                id: 'reflection-' + lesson.lessonId,
                type: 'REFLECTION',
                order: 2,
                title: 'Reflect',
                metadata: { lessonId: lesson.lessonId }
            },    
            {
                id: 'practice-' + lesson.lessonId,
                type: 'PRACTICE',
                order: 3,
                title: 'Practice',
                metadata: { lessonId: lesson.lessonId }
            }
        ];

        // 如果有 video link，添加 VIDEO activity
        if (lesson.officialVideo && lesson.officialVideo !== 'https://example.com/video/day-' + dayNum) {
            activities.push({
                id: 'video-' + lesson.lessonId,
                type: 'VIDEO',
                order: 0,
                title: 'Watch',
                content: lesson.officialVideo,
                metadata: { lessonId: lesson.lessonId, url: lesson.officialVideo }
            });
        }

        // 如果有 quiz，添加 QUIZ activity
        if (lesson.quiz && lesson.quiz.length > 0) {
            activities.push({
                id: 'quiz-' + lesson.lessonId,
                type: 'QUIZ',
                order: 4,
                title: 'Quiz',
                metadata: { lessonId: lesson.lessonId, questions: lesson.quiz }
            });    
        }

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
            <!-- 🔙 Navigation Bar — 极简导航（增强版） -->
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

                <!-- 进度指示器 + 导航信息 -->
                <div style="display:flex;align-items:center;gap:10px;font-size:11px;color:#64748b;flex-wrap:wrap;">
                    <span>${completedCount}/${totalCount}</span>
                    <span style="opacity:0.3;">·</span>
                    <span>${Math.round((completedCount / totalCount) * 100)}%</span>
                    ${completed ? '<span style="color:#22c55e;font-size:10px;">✅ Done</span>' : ''}
                    ${hasNext ? `<span style="opacity:0.3;">·</span><span style="color:#4a9eff;font-size:10px;">Next: Day ${nav.nextDay}</span>` : ''}
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

            <!-- 主内容 + Activities -->
            ${activities.map(function(activity) {
                return LawAIApp.Views.LessonView._renderActivity(activity);
            }).join('')}
            
            <!-- 🔄 Review -->
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
            <!-- ✅ 完成按钮 -->
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
            <!-- 🔥 Phase 6: 导航 — 智能上一课/下一课 -->
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
                    ${!hasPrev ? 'opacity:0.3;cursor:default;' : ''}
                " onmouseover="${hasPrev ? 'this.style.background=\'rgba(255,255,255,0.06)\';this.style.color=\'#e2e8f0\'' : ''}" onmouseout="${hasPrev ? 'this.style.background=\'rgba(255,255,255,0.03)\';this.style.color=\'#64748b\'' : ''}">
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
                    ${!hasNext ? 'opacity:0.3;cursor:default;' : ''}
                " onmouseover="${hasNext ? 'this.style.background=\'rgba(255,255,255,0.06)\';this.style.color=\'#e2e8f0\'' : ''}" onmouseout="${hasNext ? 'this.style.background=\'rgba(255,255,255,0.03)\';this.style.color=\'#64748b\'' : ''}">
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

        // 🔥 PART 127: 在重新渲染前清理旧的 Runtime
        var oldRuntime = window.LawAIApp?.Experience?.Runtime;
        if (oldRuntime && typeof oldRuntime.cleanup === 'function') {
            oldRuntime.cleanup();
        }

         // 🔥 Part 126: 使用 Experience Runtime
        var runtime = window.LawAIApp?.Experience?.Runtime;
        var contract = window.LawAIApp?.ExperienceContract;
    
        if (runtime && contract) {
            var result = runtime.open(lesson.lessonId);
            if (result.success && result.data.activities.length > 0) {
                // 渲染 Activities
                var container = document.getElementById('lesson-activities') || document.getElementById('lesson-content');
                if (container) {
                    // 清除旧内容
                    container.innerHTML = '';
                
                    result.data.activities.forEach(function(activity) {
                        // 创建 Activity 容器
                        var wrapper = document.createElement('div');
                        wrapper.id = 'activity-' + activity.id;
                        wrapper.style.marginBottom = '16px';
                    
                        // 使用 Runtime 渲染
                        runtime.renderActivity(activity.id, wrapper);
                        container.appendChild(wrapper);
                    });
                }
            }
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

    // 在 _renderContent() 中，使用 Activity Renderer 渲染每个 activity
    _renderActivity: function(activity) {
        var renderers = {
            'READING': this._renderReadingActivity,
            'VIDEO': this._renderVideoActivity,
            'PRACTICE': this._renderPracticeActivity,
            'QUIZ': this._renderQuizActivity,
            'REFLECTION': this._renderReflectionActivity
        };
        var renderer = renderers[activity.type];
        if (renderer) {
            return renderer.call(this, activity);
        }
        return '<div style="color:#64748b;padding:8px;">Unknown activity: ' + activity.type + '</div>';
    },

    _renderReadingActivity: function(activity) {
        return `
            <div style="background:rgba(255,255,255,0.02);border-radius:12px;padding:16px 18px;margin-bottom:16px;border:1px solid rgba(255,255,255,0.04);line-height:1.7;font-size:15px;color:#e2e8f0;">
                <p style="margin:0;">${activity.content}</p>
            </div>
        `;
    },

    _renderVideoActivity: function(activity) {
        var url = activity.metadata?.url || activity.content;
        var embedUrl = this._toEmbedUrl(url);
        
        if (!embedUrl) {
            return `
                <div style="...警告...">
                    <p>⚠️ 视频链接无效</p>
                    <a href="${url}" target="_blank">在新窗口打开</a>
                </div>
            `;
        }
        
        return `
            <div style="background:rgba(74,158,255,0.04);border-radius:12px;padding:12px 16px;margin-bottom:16px;border:1px solid rgba(74,158,255,0.06);">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                    <span style="font-size:14px;">🎬</span>
                    <span style="font-size:11px;color:#4a9eff;font-weight:500;">Video</span>
                </div>
                <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;background:#0a0a0a;">
                    <iframe src="${embedUrl}" 
                            style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                            referrerpolicy="strict-origin-when-cross-origin"></iframe>
                </div>
            </div>
        `;
    },
    
    // 🔥 工具函数
    _toEmbedUrl: function(url) {
        if (!url) return null;
        
        // 已经是 embed URL
        if (/youtube\.com\/embed\//.test(url)) return url;
        
        // watch URL → embed
        var watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
        if (watchMatch) return 'https://www.youtube.com/embed/' + watchMatch[1];
        
        // youtu.be → embed
        var shortMatch = url.match(/youtu\.be\/([^?]+)/);
        if (shortMatch) return 'https://www.youtube.com/embed/' + shortMatch[1];
        
        // 无效 URL
        if (/^https?:\/\/(www\.)?youtube\.com\/?$/.test(url)) return null;
        
        // 其他 URL 原样返回
        return url;
    },
    
    _renderPracticeActivity: function(activity) {
        // 复用现有 Practice 逻辑
        return `
            <div style="background:rgba(34,197,94,0.04);border-radius:12px;padding:12px 16px;margin-bottom:16px;border:1px solid rgba(34,197,94,0.06);">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                    <span style="font-size:14px;">✏️</span>
                    <span style="font-size:11px;color:#22c55e;font-weight:400;">Practice</span>
                </div>
                <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;" id="practice-description-${activity.id}">
                    Test your understanding.
                </p>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button onclick="LawAIApp.Views.LessonView.startPracticeForActivity('${activity.id}')" style="
                        padding:4px 14px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.1);border-radius:6px;color:#22c55e;font-size:11px;cursor:pointer;font-family:inherit;
                    ">Start</button>
                    <button onclick="LawAIApp.Views.LessonView.submitPracticeForActivity('${activity.id}')" style="
                        padding:4px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#64748b;font-size:11px;cursor:pointer;font-family:inherit;
                    ">Submit</button>
                </div>
                <input type="text" id="practice-answer-${activity.id}" style="
                    width:100%;margin-top:4px;padding:6px 10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#e2e8f0;font-size:12px;font-family:inherit;
                " placeholder="Type your answer...">
                <div id="practice-feedback-${activity.id}" style="margin-top:4px;font-size:11px;color:#94a3b8;"></div>
            </div>
        `;
    },

    _renderQuizActivity: function(activity) {
        var questions = activity.metadata?.questions || [];
        if (questions.length === 0) return '';
        return `
            <div style="background:rgba(139,92,246,0.04);border-radius:12px;padding:12px 16px;margin-bottom:16px;border:1px solid rgba(139,92,246,0.06);">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                    <span style="font-size:14px;">🧠</span>
                    <span style="font-size:11px;color:#8b5cf6;font-weight:400;">Quick Quiz</span>
                </div>
                ${questions.map(function(q, i) {
                    return `
                        <div style="margin-bottom:8px;padding:8px 10px;background:rgba(255,255,255,0.02);border-radius:6px;">
                            <p style="margin:0 0 4px;font-size:12px;font-weight:500;">${i+1}. ${q.question}</p>
                            ${q.options.map(function(opt, j) {
                                return `
                                    <label style="display:block;font-size:11px;color:#94a3b8;padding:2px 0;">
                                        <input type="radio" name="quiz-${activity.id}-${i}" value="${j}"> ${opt}
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    `;
                }).join('')}
                <button onclick="LawAIApp.Views.LessonView.submitQuiz('${activity.id}')" style="
                    padding:4px 14px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.1);border-radius:6px;color:#8b5cf6;font-size:11px;cursor:pointer;font-family:inherit;
                ">Submit Quiz</button>
                <div id="quiz-feedback-${activity.id}" style="margin-top:4px;font-size:11px;color:#94a3b8;"></div>
            </div>
        `;
    },

    _renderReflectionActivity: function(activity) {
        return `
            <div style="background:rgba(255,255,255,0.02);border-radius:12px;padding:12px 16px;margin-bottom:16px;border:1px solid rgba(255,255,255,0.04);">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                    <span style="font-size:14px;">💭</span>
                    <span style="font-size:11px;color:#64748b;font-weight:400;">Quick reflection</span>
                </div>
                <textarea id="reflection-${activity.id}" style="
                    width:100%;padding:8px 10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;font-size:13px;resize:vertical;min-height:40px;font-family:inherit;
                " placeholder="What stood out to you?"></textarea>
                <button onclick="LawAIApp.Views.LessonView.saveReflectionForActivity('${activity.id}')" style="
                    margin-top:4px;padding:3px 12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:6px;color:#64748b;font-size:10px;cursor:pointer;font-family:inherit;
                ">💾 Save</button>
            </div>
        `;
    },

    // ============================================================
    // 核心 Actions
    // ============================================================

    completeLesson: function(lessonId) {
    try {
        // 🔥 PART 127: 先通知 Runtime
        var runtime = window.LawAIApp?.Experience?.Runtime;
        if (runtime && typeof runtime.complete === 'function') {
            var currentActivity = runtime.getCurrentActivity();
            if (currentActivity) {
                runtime.complete(currentActivity.id, { submitted: true });
            }
        }

        if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.completeLesson === 'function') {
            var result = LawAIApp.ProgressEngine.completeLesson(lessonId);
            if (result) {
                var xpGain = result.xpGain || 20;
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
     * 微完成效果
     */
    _showCompletionEffect: function() {
        var container = this._container;
        if (!container) return;

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
    // 🔥 Phase 6: 智能导航
    // ============================================================

    previousLesson: function() {
        if (this._lessonId) {
            var day = parseInt(this._lessonId.replace('day-', ''));
            var nav = this._getLessonNavigation(day);
            if (nav.prevDay && nav.prevDay < day) {
                this.render('day-' + nav.prevDay, this._container);
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
            var nav = this._getLessonNavigation(day);
            if (nav.nextDay && nav.nextDay > day) {
                this.render('day-' + nav.nextDay, this._container);
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

console.log('📖 LessonView V4.1 ready (Classroom Edition + Navigation)');

window.LawAIApp.LessonView = window.LawAIApp.Views.LessonView;
