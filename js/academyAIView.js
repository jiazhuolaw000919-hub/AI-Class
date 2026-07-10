// ===========================================
// academyAIView.js
// AI 基础学院 - WOW 第一印象版 + Profiler (Phase P.1)
// V5.0 - First Impression Recovery
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Views = LawAIApp.Views || {};

LawAIApp.Views.AcademyAIView = {
    _rendered: false,
    _deferredRendered: false,

    render: function(container) {
        var app = container || document.getElementById('app') || document.getElementById('academy-content') || document.getElementById('law-runtime-root');
        
        if (!app) {
            console.warn('⚠️ AcademyAIView: No container found');
            return;
        }

        if (this._rendered) {
            console.log('🔄 Academy already rendered, re-rendering...');
            this._rendered = false;
            this._deferredRendered = false;
        }

        this._rendered = true;
        console.log('🏛️ AcademyAIView V5.0 rendering (WOW Edition)...');

        // 🔥 Profiler: 记录 Academy 渲染
        if (LawAIApp.DevTools?.RuntimeProfiler) {
            LawAIApp.DevTools.RuntimeProfiler.recordRender('academy');
        }

        var academy = this._getAcademyData();
        var progress = this._getProgressData();
        var recommendations = this._getRecommendations();
        var schools = this._getSchools();

        app.innerHTML = this._buildCoreHTML(academy, progress, recommendations, schools);

        var self = this;
        setTimeout(function() {
            self._renderDeferredContent(app, academy, progress, recommendations, schools);
        }, 200);

        LawAIApp.EventBus?.emit?.('AcademyRendered', { timestamp: Date.now() });
    },

    _refresh: function(app) {
        var stats = document.getElementById('academy-stats');
        var continueBtn = document.getElementById('academy-continue');

        if (stats) {
            var progress = this._getProgressData();
            stats.innerHTML = this._buildStatsHTML(progress);
        }

        if (continueBtn) {
            var nextLesson = this._getNextLesson();
            continueBtn.href = this._getContinueLink(nextLesson);
        }

        console.log('🔄 Academy refreshed');
    },

    // ============================================================
    // 数据获取方法
    // ============================================================

    _getAcademyData: function() {
        try {
            if (LawAIApp.AcademyAIData?.academy) {
                return LawAIApp.AcademyAIData.academy;
            }
        } catch (e) {}

        return {
            id: 'school-ai',
            name: 'AI Fundamentals',
            icon: '🤖',
            description: 'Master AI from the ground up. No prior experience needed.',
            themeColor: '#4a9eff',
            estimatedHours: 200,
            difficulty: 'Beginner',
            featured: true
        };
    },

    _getProgressData: function() {
        var progress = { completedLessons: [], totalLessons: 365, completionPercent: 0 };
        var xp = 0;
        var level = 1;
        var streak = 0;
        var completed = 0;
        var total = 365;
        var percent = 0;
        var reviewCount = 0;

        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                var p = LawAIApp.ProgressEngine.getProgress();
                completed = p.completedLessons?.length || 0;
                total = p.totalLessons || 365;
                percent = p.completionPercent || 0;
                streak = p.streak || 0;
                level = p.level || 1;
                progress = p;
            }
        } catch (e) {}

        try {
            if (LawAIApp.XPEngine && typeof LawAIApp.XPEngine.getCurrentXP === 'function') {
                xp = LawAIApp.XPEngine.getCurrentXP() || 0;
            }
        } catch (e) {}

        try {
            if (LawAIApp.LevelEngine && typeof LawAIApp.LevelEngine.calculateLevel === 'function') {
                var levelInfo = LawAIApp.LevelEngine.calculateLevel();
                level = levelInfo?.level || 1;
            }
        } catch (e) {}

        try {
            if (LawAIApp.ReviewQueue && typeof LawAIApp.ReviewQueue.getTodayReviews === 'function') {
                reviewCount = LawAIApp.ReviewQueue.getTodayReviews().length || 0;
            }
        } catch (e) {}

        return { completed, total, percent, streak, level, xp, reviewCount, progress };
    },

    _getRecommendations: function() {
        var recs = [];
        try {
            if (LawAIApp.RecommendationEngine && typeof LawAIApp.RecommendationEngine.getRecommendations === 'function') {
                recs = LawAIApp.RecommendationEngine.getRecommendations(3) || [];
            }
        } catch (e) {}

        if (recs.length === 0) {
            var progress = this._getProgressData();
            var nextDay = progress.completed + 1;
            recs = [
                { id: 'day-' + nextDay, title: this._getLessonTitle(nextDay), description: this._getLessonSummary(nextDay), icon: '📖' },
                { id: 'day-' + Math.min(nextDay + 1, 365), title: this._getLessonTitle(nextDay + 1), description: this._getLessonSummary(nextDay + 1), icon: '🧠' },
                { id: 'day-' + Math.min(nextDay + 2, 365), title: this._getLessonTitle(nextDay + 2), description: this._getLessonSummary(nextDay + 2), icon: '💡' }
            ];
        }

        return recs;
    },

    _getSchools: function() {
        try {
            if (LawAIApp.SchoolEngine && typeof LawAIApp.SchoolEngine.getAllSchools === 'function') {
                return LawAIApp.SchoolEngine.getAllSchools();
            }
        } catch (e) {}

        return [
            { id: 'school-ai', name: 'School of AI', icon: '🤖', description: 'Master AI fundamentals.', status: 'active' },
            { id: 'school-software', name: 'School of Software Engineering', icon: '💻', description: 'Build robust software.', status: 'coming_soon' },
            { id: 'school-cloud', name: 'School of Cloud Computing', icon: '☁️', description: 'Master cloud infrastructure.', status: 'coming_soon' }
        ];
    },

    _getNextLesson: function() {
        try {
            var progress = this._getProgressData();
            var nextDay = progress.completed + 1;
            if (nextDay > 365) nextDay = 365;
            return 'day-' + nextDay;
        } catch (e) {
            return 'day-1';
        }
    },

    _getContinueLink: function(lessonId) {
        if (!lessonId) lessonId = 'day-1';
        return '/pages/lesson.html?day=' + lessonId.replace('day-', '');
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
        return 'Continue your AI learning journey.';
    },

    _getGreeting: function(progress) {
        var hour = new Date().getHours();
        var timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

        if (progress.completed >= 365) {
            return '🏆 Master of AI!';
        }
        if (progress.streak >= 30) {
            return '🔥 ' + progress.streak + '-day streak!';
        }
        if (progress.streak >= 7) {
            return '💪 ' + progress.streak + ' days strong!';
        }
        if (progress.completed > 0) {
            return timeGreeting + ', Learner';
        }
        return 'Welcome to AI Fundamentals 🚀';
    },

    // ============================================================
    // 核心 HTML 构建
    // ============================================================

    _buildCoreHTML: function(academy, progress, recommendations, schools) {
        var nextLesson = this._getNextLesson();
        var continueLink = this._getContinueLink(nextLesson);
        var greeting = this._getGreeting(progress);
        var isComplete = progress.completed >= 365;

        var percent = Math.round(progress.percent || 0);
        var progressDisplay = percent + '%';
        var streakDisplay = progress.streak > 0 ? '🔥 ' + progress.streak + 'd' : '🌱 0d';
        var xpDisplay = (progress.xp || 0) + ' XP';
        var levelDisplay = 'Lv.' + (progress.level || 1);
        var completedCount = progress.completed || 0;
        var totalCount = progress.total || 365;
        var lessonCountDisplay = completedCount + '/' + totalCount + ' lessons';

        return `
        <div class="academy-wow" style="
            max-width: 1000px;
            margin: 0 auto;
            padding: 12px 20px 90px;
            color: #e2e8f0;
            font-family: 'Inter', -apple-system, -apple-system, sans-serif;
        ">
            <div id="academy-hero" style="
                background: linear-gradient(145deg, ${academy.themeColor || '#1a2a4a'}, ${academy.themeColor ? academy.themeColor + '88' : '#2a1a4a'});
                border-radius: 28px;
                padding: 40px 32px 32px;
                color: white;
                margin-bottom: 28px;
                position: relative;
                overflow: hidden;
                isolation: isolate;
                min-height: 200px;
            ">
                <div style="
                    position: absolute;
                    right: -20px;
                    bottom: -30px;
                    font-size: 140px;
                    opacity: 0.08;
                    pointer-events: none;
                    z-index: 0;
                ">${academy.icon || '🤖'}</div>

                <div style="
                    position: absolute;
                    top: -80px;
                    right: -80px;
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, rgba(74,158,255,0.15), transparent 70%);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 0;
                "></div>

                <div style="position:relative;z-index:1;">

                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        margin-bottom: 16px;
                        flex-wrap: wrap;
                    ">
                        <span style="
                            font-size: 28px;
                            line-height: 1;
                        ">${academy.icon || '🤖'}</span>
                        <span style="
                            font-size: 11px;
                            background: rgba(255,255,255,0.15);
                            padding: 4px 14px;
                            border-radius: 100px;
                            font-weight: 500;
                            letter-spacing: 0.3px;
                            backdrop-filter: blur(4px);
                        ">${academy.difficulty || 'Beginner'}</span>
                        ${academy.featured ? `
                        <span style="
                            font-size: 10px;
                            background: rgba(255,215,0,0.2);
                            padding: 4px 12px;
                            border-radius: 100px;
                            font-weight: 500;
                            color: #fcd34d;
                        ">⭐ Featured</span>
                        ` : ''}
                        <span style="
                            margin-left: auto;
                            font-size: 12px;
                            opacity: 0.7;
                            font-weight: 400;
                            letter-spacing: 0.2px;
                        ">${academy.estimatedHours || 200}h</span>
                    </div>

                    <h1 style="
                        margin: 0 0 4px;
                        font-size: 28px;
                        font-weight: 700;
                        letter-spacing: -0.3px;
                        line-height: 1.1;
                    ">${greeting}</h1>

                    <p style="
                        margin: 0 0 18px;
                        opacity: 0.75;
                        font-size: 15px;
                        font-weight: 400;
                        max-width: 480px;
                        line-height: 1.5;
                    ">${academy.description || 'Master AI from the ground up.'}</p>

                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 20px;
                        flex-wrap: wrap;
                        margin-top: 4px;
                    ">
                        <div style="
                            flex: 1;
                            min-width: 120px;
                        ">
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                font-size: 12px;
                                opacity: 0.7;
                                margin-bottom: 4px;
                            ">
                                <span>Progress</span>
                                <span>${progressDisplay}</span>
                            </div>
                            <div style="
                                height: 4px;
                                background: rgba(255,255,255,0.15);
                                border-radius: 100px;
                                overflow: hidden;
                            ">
                                <div style="
                                    width: ${percent}%;
                                    height: 100%;
                                    background: linear-gradient(90deg, #4a9eff, #7c3aed);
                                    border-radius: 100px;
                                    transition: width 0.8s ease;
                                "></div>
                            </div>
                        </div>

                        <div style="
                            display: flex;
                            gap: 16px;
                            flex-wrap: wrap;
                        ">
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 4px;
                                font-size: 13px;
                                font-weight: 500;
                                background: rgba(255,255,255,0.06);
                                padding: 4px 12px;
                                border-radius: 100px;
                                backdrop-filter: blur(4px);
                            ">
                                <span style="opacity:0.5;">✦</span> ${levelDisplay}
                            </div>
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 4px;
                                font-size: 13px;
                                font-weight: 500;
                                background: rgba(255,255,255,0.06);
                                padding: 4px 12px;
                                border-radius: 100px;
                                backdrop-filter: blur(4px);
                            ">
                                <span style="opacity:0.5;">⭐</span> ${xpDisplay}
                            </div>
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 4px;
                                font-size: 13px;
                                font-weight: 500;
                                background: rgba(255,255,255,0.06);
                                padding: 4px 12px;
                                border-radius: 100px;
                                backdrop-filter: blur(4px);
                            ">
                                <span style="opacity:0.5;">🔥</span> ${streakDisplay}
                            </div>
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 4px;
                                font-size: 12px;
                                opacity: 0.6;
                                background: rgba(255,255,255,0.04);
                                padding: 4px 12px;
                                border-radius: 100px;
                            ">
                                ${lessonCountDisplay}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 32px;">
                ${this._buildContinueLearningHTML(progress, nextLesson, continueLink, isComplete)}
            </div>

            <div id="academy-deferred" style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                min-height: 140px;
                opacity: 0.6;
            ">
                <div id="recommendations-placeholder" style="
                    background: rgba(255,255,255,0.02);
                    border-radius: 16px;
                    padding: 16px 20px;
                    border: 1px solid rgba(255,255,255,0.04);
                ">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                        <span style="font-size:14px;">🌟</span>
                        <span style="font-size:12px;color:#94a3b8;font-weight:400;">Recommended</span>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:6px;">
                        ${[0,1,2].map(function(i) {
                            return `
                            <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:${i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none'};">
                                <span style="font-size:14px;opacity:0.4;">⏳</span>
                                <div style="flex:1;height:10px;width:${80 - i * 15}%;background:rgba(255,255,255,0.04);border-radius:4px;animation:pulse 1.5s infinite ${i * 0.2}s;"></div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div id="schools-placeholder" style="
                    background: rgba(255,255,255,0.02);
                    border-radius: 16px;
                    padding: 16px 20px;
                    border: 1px solid rgba(255,255,255,0.04);
                ">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                        <span style="font-size:14px;">🏛️</span>
                        <span style="font-size:12px;color:#94a3b8;font-weight:400;">Explore</span>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;">
                        ${[0,1,2].map(function(i) {
                            return `<div style="padding:6px 14px;background:rgba(255,255,255,0.03);border-radius:100px;animation:pulse 1.5s infinite ${i * 0.2}s;width:${70 + i * 20}px;height:28px;"></div>`;
                        }).join('')}
                    </div>
                </div>
            </div>

            <div id="academy-quick-access" style="
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-top: 24px;
                padding-top: 16px;
                border-top: 1px solid rgba(255,255,255,0.04);
            ">
                ${[
                    { icon: '📖', label: 'Courses', route: 'course-ai-fundamentals' },
                    { icon: '📚', label: 'Hub', route: 'learning-hub' },
                    { icon: '📓', label: 'Notes', route: 'knowledge-capture' },
                    { icon: '🧠', label: 'Memory', route: 'adaptive-memory' },
                    { icon: '🧠', label: 'Intelligence', route: 'intelligence' }
                ].map(function(btn) {
                    return `
                    <button onclick="if(window.LawAIApp?.Router?.navigate){LawAIApp.Router.navigate('${btn.route}');}else{alert('${btn.label}');}" style="
                        padding: 4px 14px;
                        background: rgba(255,255,255,0.03);
                        border: 1px solid rgba(255,255,255,0.04);
                        border-radius: 100px;
                        color: #94a3b8;
                        font-size: 11px;
                        cursor: pointer;
                        transition: all 0.2s;
                        font-family: inherit;
                        display: flex;
                        align-items: center;
                        gap: 4px;
                    " onmouseover="this.style.background='rgba(255,255,255,0.06)';this.style.color='#e2e8f0'" onmouseout="this.style.background='rgba(255,255,255,0.03)';this.style.color='#94a3b8'">
                        ${btn.icon} ${btn.label}
                    </button>
                    `;
                }).join('')}
            </div>

            <style>
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                .academy-wow {
                    animation: fadeUp 0.5s ease;
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>

        </div>
        `;
    },

    _buildContinueLearningHTML: function(progress, nextLesson, continueLink, isComplete) {
        var nextDay = parseInt(nextLesson.replace('day-', ''));
        var title = this._getLessonTitle(nextDay);
        var summary = this._getLessonSummary(nextDay);

        var actionText = isComplete ? '🎉 Review' : '📖 Continue →';
        var subtitleText = isComplete ? 'You\'ve completed everything!' : (summary || 'Continue building your AI knowledge.');

        return `
            <a id="academy-continue" href="${continueLink}" style="
                display: block;
                background: linear-gradient(135deg, #4a9eff, #6366f1);
                border-radius: 20px;
                padding: 20px 28px;
                color: white;
                text-decoration: none;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                box-shadow: 0 8px 40px rgba(74,158,255,0.15);
            " onmouseover="this.style.transform='scale(1.01)';this.style.boxShadow='0 12px 60px rgba(74,158,255,0.25)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 8px 40px rgba(74,158,255,0.15)'">
                <div style="
                    position: absolute;
                    top: -60px;
                    right: -40px;
                    width: 200px;
                    height: 200px;
                    background: radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%);
                    border-radius: 50%;
                    pointer-events: none;
                "></div>
                <div style="position:relative;z-index:1;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
                    <div style="flex:1;min-width:120px;">
                        <div style="font-size:12px;font-weight:500;opacity:0.8;letter-spacing:0.5px;text-transform:uppercase;">
                            Next Lesson
                        </div>
                        <div style="font-size:18px;font-weight:600;margin:2px 0;">${title || 'Day ' + nextDay}</div>
                        <div style="font-size:13px;opacity:0.85;">${subtitleText}</div>
                    </div>
                    <div style="
                        padding: 10px 28px;
                        background: rgba(255,255,255,0.15);
                        border-radius: 100px;
                        font-size: 15px;
                        font-weight: 600;
                        backdrop-filter: blur(4px);
                        white-space: nowrap;
                    ">${actionText}</div>
                </div>
            </a>
        `;
    },

    _renderDeferredContent: function(app, academy, progress, recommendations, schools) {
        if (this._deferredRendered) return;
        this._deferredRendered = true;

        var container = document.getElementById('academy-deferred');
        if (!container) return;

        console.log('📊 Academy: Rendering deferred content (WOW Edition)...');

        var recsHtml = recommendations.slice(0, 3).map(function(rec, index) {
            var lessonId = rec.id || 'day-' + (index + 1);
            var dayNum = lessonId.replace('day-', '');
            var link = '/pages/lesson.html?day=' + dayNum;
            var delay = index * 0.06;
            return `
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 6px 0;
                    border-bottom: ${index < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none'};
                    animation: fadeUp 0.4s ease ${delay}s;
                ">
                    <span style="font-size:16px;">${rec.icon || '📖'}</span>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:500;color:#e2e8f0;">${rec.title || 'Lesson'}</div>
                        <div style="font-size:11px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${rec.description || 'Continue your learning journey.'}</div>
                    </div>
                    <a href="${link}" style="
                        padding: 4px 14px;
                        background: rgba(74,158,255,0.1);
                        border-radius: 100px;
                        color: #4a9eff;
                        font-size: 11px;
                        text-decoration: none;
                        transition: all 0.2s;
                        font-weight: 500;
                    " onmouseover="this.style.background='rgba(74,158,255,0.2)'" onmouseout="this.style.background='rgba(74,158,255,0.1)'">
                        Start →
                    </a>
                </div>
            `;
        }).join('');

        var schoolsHtml = schools.slice(0, 3).map(function(school, index) {
            var isActive = school.status === 'active' || school.status === 'available';
            var delay = 0.1 + index * 0.06;
            return `
                <div style="
                    display:inline-flex;
                    align-items:center;
                    gap:6px;
                    padding:4px 14px 4px 10px;
                    background: ${isActive ? 'rgba(74,158,255,0.06)' : 'rgba(255,255,255,0.02)'};
                    border-radius: 100px;
                    border: 1px solid ${isActive ? 'rgba(74,158,255,0.08)' : 'rgba(255,255,255,0.04)'};
                    animation: fadeUp 0.4s ease ${delay}s;
                    cursor: ${isActive ? 'pointer' : 'default'};
                    transition: all 0.2s;
                " onclick="if(${isActive} && '${school.id}' === 'school-ai'){window.location.href='/pages/academy.html'}">
                    <span style="font-size:14px;">${school.icon || '🏛️'}</span>
                    <span style="font-size:12px;font-weight:500;color:#e2e8f0;">${school.name || 'School'}</span>
                    ${isActive ? '<span style="font-size:8px;color:#22c55e;background:rgba(34,197,94,0.15);padding:0 8px;border-radius:100px;">●</span>' : '<span style="font-size:8px;color:#64748b;">soon</span>'}
                </div>
            `;
        }).join('');

        var deferredHtml = `
            <div style="
                background: rgba(255,255,255,0.02);
                border-radius: 16px;
                padding: 16px 20px;
                border: 1px solid rgba(255,255,255,0.04);
            ">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                    <span style="font-size:14px;">🌟</span>
                    <span style="font-size:12px;color:#94a3b8;font-weight:400;">Recommended for you</span>
                </div>
                ${recsHtml || '<div style="color:#64748b;font-size:13px;padding:8px 0;">Complete lessons to get recommendations.</div>'}
            </div>

            <div style="
                background: rgba(255,255,255,0.02);
                border-radius: 16px;
                padding: 16px 20px;
                border: 1px solid rgba(255,255,255,0.04);
            ">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                    <span style="font-size:14px;">🏛️</span>
                    <span style="font-size:12px;color:#94a3b8;font-weight:400;">Explore Schools</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">
                    ${schoolsHtml || '<div style="color:#64748b;font-size:13px;padding:8px 0;">More schools coming soon.</div>'}
                </div>
            </div>
        `;

        container.innerHTML = deferredHtml;
        container.style.opacity = '1';

        LawAIApp.EventBus?.emit?.('AcademyDeferredRendered', { timestamp: Date.now() });
        console.log('✅ Academy deferred content rendered (WOW Edition)');
    }
};

console.log('🏛️ AcademyAIView V5.0 ready (WOW Edition + Profiler)');
