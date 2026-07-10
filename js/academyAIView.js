// ===========================================
// academyAIView.js
// AI 基础学院 - Campus Edition (Phase 2) + Navigation (Phase 6)
// "Academy is Campus. Not a webpage."
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
        console.log('🏛️ AcademyAIView V6.1 rendering (Campus Edition + Navigation)...');

        var academy = this._getAcademyData();
        var progress = this._getProgressData();
        var recommendations = this._getRecommendations();
        var schools = this._getSchools();
        var courses = this._getCourses();

        app.innerHTML = this._buildCoreHTML(academy, progress, recommendations, schools, courses);

        var self = this;
        setTimeout(function() {
            self._renderDeferredContent(app, academy, progress, recommendations, schools, courses);
        }, 250);

        LawAIApp.EventBus?.emit?.('AcademyRendered', { timestamp: Date.now() });
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
            description: 'Master Artificial Intelligence from the ground up.',
            themeColor: '#4a9eff',
            estimatedHours: 200,
            difficulty: 'Beginner',
            featured: true,
            totalCourses: 365,
            students: '1.2k+'
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
            { id: 'school-ai', name: 'School of AI', icon: '🤖', description: 'Master AI fundamentals.', status: 'active', progress: 0 },
            { id: 'school-software', name: 'School of Software Engineering', icon: '💻', description: 'Build robust software.', status: 'coming_soon' },
            { id: 'school-cloud', name: 'School of Cloud Computing', icon: '☁️', description: 'Master cloud infrastructure.', status: 'coming_soon' }
        ];
    },

    _getCourses: function() {
        var courses = [];
        var progress = this._getProgressData();
        var total = progress.total || 365;
        var completed = progress.completed || 0;

        var categories = ['Foundation', 'Prompt Engineering', 'AI Tools', 'AI Development', 'Projects', 'AI Business'];
        var icons = ['🏛️', '✍️', '🛠️', '💻', '🚀', '💼'];

        for (var i = 0; i < 6; i++) {
            var start = i * 60 + 1;
            var end = Math.min((i + 1) * 60, 365);
            var courseCompleted = Math.max(0, Math.min(completed - start + 1, end - start + 1));
            var totalInCourse = end - start + 1;
            var percentComplete = Math.round((courseCompleted / totalInCourse) * 100);

            courses.push({
                id: 'course-' + i,
                title: categories[i] + ' Track',
                icon: icons[i],
                description: 'Lessons ' + start + '-' + end,
                category: categories[i],
                progress: percentComplete,
                total: totalInCourse,
                completed: courseCompleted,
                locked: start > completed + 1,
                difficulty: i < 2 ? 'Beginner' : i < 4 ? 'Intermediate' : 'Advanced',
                estimatedHours: Math.round(totalInCourse * 0.5)
            });
        }

        return courses;
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
        // 🔥 Phase 6: 使用 Router 的智能继续
        if (LawAIApp.Router && typeof LawAIApp.Router.getContinueLink === 'function') {
            return LawAIApp.Router.getContinueLink();
        }
        if (!lessonId) lessonId = 'day-1';
        return '/pages/lesson.html?day=' + lessonId.replace('day-', '');
    },

    _getContinueTitle: function() {
        // 🔥 Phase 6: 使用 Router 的智能继续标题
        if (LawAIApp.Router && typeof LawAIApp.Router.getContinueTitle === 'function') {
            return LawAIApp.Router.getContinueTitle();
        }
        var progress = this._getProgressData();
        return this._getLessonTitle(progress.completed + 1);
    },

    _getContinueDescription: function() {
        // 🔥 Phase 6: 使用 Router 的智能继续描述
        if (LawAIApp.Router && typeof LawAIApp.Router.getContinueDescription === 'function') {
            return LawAIApp.Router.getContinueDescription();
        }
        var progress = this._getProgressData();
        return this._getLessonSummary(progress.completed + 1);
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
            return '🏆 You\'ve mastered everything!';
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
        return 'Welcome to AI Campus 🚀';
    },

    // ============================================================
    // 🔥 Campus Core HTML
    // ============================================================

    _buildCoreHTML: function(academy, progress, recommendations, schools, courses) {
        var nextLesson = this._getNextLesson();
        var continueLink = this._getContinueLink(nextLesson);
        var continueTitle = this._getContinueTitle();
        var continueDesc = this._getContinueDescription();
        var greeting = this._getGreeting(progress);
        var isComplete = progress.completed >= 365;

        var percent = Math.round(progress.percent || 0);
        var progressDisplay = percent + '%';
        var streakDisplay = progress.streak > 0 ? '🔥 ' + progress.streak + 'd' : '🌱 0d';
        var xpDisplay = (progress.xp || 0) + ' XP';
        var levelDisplay = 'Lv.' + (progress.level || 1);

        var completedCount = progress.completed || 0;
        var totalCount = progress.total || 365;
        var lessonCountDisplay = completedCount + '/' + totalCount;
        var stage = this._getCurrentStage(progress.completed || 0);

        var actionText = isComplete ? '🎉 Review' : '📖 Continue →';
        var subtitleText = isComplete ? 'You\'ve mastered everything!' : continueDesc;

        return `
        <div class="academy-campus" style="
            max-width: 1000px;
            margin: 0 auto;
            padding: 12px 20px 100px;
            color: #e2e8f0;
            font-family: 'Inter', -apple-system, sans-serif;
        ">
            <!-- 🏛️ Campus Banner -->
            <div id="campus-banner" style="
                background: linear-gradient(145deg, ${academy.themeColor || '#1a2a4a'}, ${academy.themeColor ? academy.themeColor + '88' : '#2a1a4a'});
                border-radius: 24px;
                padding: 28px 28px 24px;
                margin-bottom: 24px;
                position: relative;
                overflow: hidden;
                animation: campusFade 0.5s ease;
            ">
                <div style="position:absolute;right:-20px;bottom:-40px;font-size:160px;opacity:0.06;pointer-events:none;z-index:0;">${academy.icon || '🏛️'}</div>
                <div style="position:relative;z-index:1;">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;flex-wrap:wrap;">
                        <span style="font-size:32px;">${academy.icon || '🏛️'}</span>
                        <div>
                            <h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:-0.3px;color:white;">${academy.name || 'AI Academy'}</h1>
                            <p style="margin:0;font-size:13px;opacity:0.7;max-width:480px;">${academy.description || 'Master Artificial Intelligence from the ground up.'}</p>
                        </div>
                        <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;">
                            <span style="font-size:10px;background:rgba(255,255,255,0.12);padding:3px 12px;border-radius:100px;color:white;">${academy.difficulty || 'Beginner'}</span>
                            <span style="font-size:10px;background:rgba(255,255,255,0.08);padding:3px 12px;border-radius:100px;color:white;">⏱️ ${academy.estimatedHours || 200}h</span>
                            <span style="font-size:10px;background:rgba(255,255,255,0.08);padding:3px 12px;border-radius:100px;color:white;">👥 ${academy.students || '1.2k+'}</span>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06);">
                        <div style="flex:1;min-width:120px;">
                            <div style="display:flex;justify-content:space-between;font-size:11px;opacity:0.6;margin-bottom:3px;">
                                <span>Journey Progress</span>
                                <span>${progressDisplay}</span>
                            </div>
                            <div style="height:3px;background:rgba(255,255,255,0.1);border-radius:100px;overflow:hidden;">
                                <div style="width:${percent}%;height:100%;background:linear-gradient(90deg,#4a9eff,#7c3aed);border-radius:100px;transition:width 0.8s ease;"></div>
                            </div>
                        </div>
                        <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:12px;opacity:0.8;">
                            <span>📚 ${lessonCountDisplay}</span>
                            <span>⭐ ${xpDisplay}</span>
                            <span>${streakDisplay}</span>
                            <span>✦ ${levelDisplay}</span>
                            <span>📍 ${stage}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 🚀 Continue Learning（智能） -->
            <a href="${continueLink}" id="academy-continue" style="
                display: block;
                background: linear-gradient(135deg, #4a9eff, #6366f1);
                border-radius: 18px;
                padding: 18px 24px;
                color: white;
                text-decoration: none;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                box-shadow: 0 8px 40px rgba(74,158,255,0.08);
                margin-bottom: 24px;
            " onmouseover="this.style.transform='scale(1.01)';this.style.boxShadow='0 12px 60px rgba(74,158,255,0.15)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 8px 40px rgba(74,158,255,0.08)'">
                <div style="position:relative;z-index:1;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
                    <div style="flex:1;min-width:100px;">
                        <div style="font-size:11px;font-weight:500;opacity:0.7;letter-spacing:0.5px;text-transform:uppercase;">
                            ${isComplete ? '🎉 Complete' : 'Next Lesson'}
                        </div>
                        <div style="font-size:17px;font-weight:600;margin:1px 0;line-height:1.2;">${continueTitle}</div>
                        <div style="font-size:13px;opacity:0.8;">${subtitleText}</div>
                    </div>
                    <div style="padding:8px 24px;background:rgba(255,255,255,0.12);border-radius:100px;font-size:14px;font-weight:600;backdrop-filter:blur(4px);white-space:nowrap;border:1px solid rgba(255,255,255,0.06);">${actionText}</div>
                </div>
            </a>

            <!-- 📚 Course Grid -->
            <div style="margin-bottom:20px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <h2 style="margin:0;font-size:16px;font-weight:600;color:#e2e8f0;">📚 Learning Tracks</h2>
                    <span style="font-size:12px;color:#64748b;">${completedCount}/${totalCount} lessons</span>
                </div>
                <div id="course-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;min-height:200px;">
                    ${this._buildCourseCards(courses)}
                </div>
            </div>

            <!-- 🔮 Explore More -->
            <div id="academy-deferred" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;min-height:120px;opacity:0.5;transition:opacity 0.4s ease;">
                <div id="recommendations-placeholder" style="background:rgba(255,255,255,0.02);border-radius:16px;padding:14px 16px;border:1px solid rgba(255,255,255,0.04);">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                        <span style="font-size:14px;">🌟</span>
                        <span style="font-size:12px;color:#94a3b8;font-weight:400;">Recommended</span>
                    </div>
                    ${[0,1,2].map(function(i) {
                        return `
                        <div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:${i < 2 ? '1px solid rgba(255,255,255,0.03)' : 'none'};">
                            <span style="font-size:12px;opacity:0.4;">⏳</span>
                            <div style="flex:1;height:8px;width:${70 - i * 15}%;background:rgba(255,255,255,0.04);border-radius:4px;animation:pulse 1.5s infinite ${i * 0.2}s;"></div>
                        </div>
                        `;
                    }).join('')}
                </div>
                <div id="schools-placeholder" style="background:rgba(255,255,255,0.02);border-radius:16px;padding:14px 16px;border:1px solid rgba(255,255,255,0.04);">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                        <span style="font-size:14px;">🏛️</span>
                        <span style="font-size:12px;color:#94a3b8;font-weight:400;">Explore Schools</span>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">
                        ${[0,1,2].map(function(i) {
                            return `<div style="padding:4px 12px;background:rgba(255,255,255,0.02);border-radius:100px;animation:pulse 1.5s infinite ${i * 0.2}s;width:${70 + i * 20}px;height:24px;"></div>`;
                        }).join('')}
                    </div>
                </div>
            </div>

            <style>
                @keyframes campusFade {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
                @keyframes cardFadeIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .course-card { animation: cardFadeIn 0.4s ease; }
                .course-card:nth-child(2) { animation-delay: 0.04s; }
                .course-card:nth-child(3) { animation-delay: 0.08s; }
                .course-card:nth-child(4) { animation-delay: 0.12s; }
                .course-card:nth-child(5) { animation-delay: 0.16s; }
                .course-card:nth-child(6) { animation-delay: 0.20s; }
                @media (max-width: 600px) {
                    #course-grid { grid-template-columns: 1fr; }
                    #academy-deferred { grid-template-columns: 1fr; }
                }
            </style>
        </div>
        `;
    },

    _buildCourseCards: function(courses) {
        return courses.map(function(course) {
            var isLocked = course.locked || false;
            var progressColor = course.progress > 70 ? '#22c55e' : course.progress > 30 ? '#f59e0b' : '#4a9eff';
            var difficultyColor = course.difficulty === 'Beginner' ? '#22c55e' :
                                  course.difficulty === 'Intermediate' ? '#f59e0b' : '#ef4444';

            return `
            <div class="course-card" style="
                background: rgba(255,255,255,0.02);
                border-radius: 14px;
                padding: 14px 16px;
                border: 1px solid rgba(255,255,255,0.04);
                transition: all 0.3s ease;
                cursor: ${isLocked ? 'default' : 'pointer'};
                opacity: ${isLocked ? 0.5 : 1};
                position: relative;
                overflow: hidden;
            " ${!isLocked ? `onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='rgba(74,158,255,0.2)'" onmouseout="this.style.transform='translateY(0)';this.style.borderColor='rgba(255,255,255,0.04)'" onclick="LawAIApp.Router?.navigate('lesson-detail', {lessonId: 'day-${course.completed + 1}'})"` : ''}>
                ${isLocked ? `<div style="position:absolute;top:10px;right:12px;font-size:14px;opacity:0.4;">🔒</div>` : ''}
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                    <span style="font-size:20px;">${course.icon || '📖'}</span>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:600;color:#e2e8f0;">${course.title}</div>
                        <div style="font-size:10px;color:#64748b;">${course.description}</div>
                    </div>
                </div>
                <div style="display:flex;gap:8px;font-size:10px;color:#64748b;flex-wrap:wrap;margin-bottom:6px;">
                    <span>📊 <span style="color:${difficultyColor};">${course.difficulty}</span></span>
                    <span>⏱️ ${course.estimatedHours}h</span>
                    ${course.completed > 0 ? `<span style="color:#22c55e;">✅ ${course.completed}/${course.total}</span>` : ''}
                </div>
                <div style="height:2px;background:rgba(255,255,255,0.06);border-radius:100px;overflow:hidden;">
                    <div style="width:${course.progress}%;height:100%;background:${progressColor};border-radius:100px;transition:width 0.6s ease;"></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:9px;color:#64748b;margin-top:2px;">
                    <span>${course.progress}%</span>
                    <span>${course.completed}/${course.total} lessons</span>
                </div>
            </div>
            `;
        }).join('');
    },

    _getCurrentStage: function(completed) {
        if (completed >= 365) return 'Master';
        if (completed >= 300) return 'AI Business';
        if (completed >= 220) return 'Projects';
        if (completed >= 120) return 'AI Development';
        if (completed >= 70) return 'AI Tools';
        if (completed >= 30) return 'Prompt Engineering';
        return 'Foundation';
    },

    _renderDeferredContent: function(app, academy, progress, recommendations, schools, courses) {
        if (this._deferredRendered) return;
        this._deferredRendered = true;

        var container = document.getElementById('academy-deferred');
        if (!container) return;

        console.log('📊 Academy: Rendering deferred content...');

        var recsHtml = recommendations.slice(0, 3).map(function(rec, index) {
            var lessonId = rec.id || 'day-' + (index + 1);
            var dayNum = lessonId.replace('day-', '');
            var link = '/pages/lesson.html?day=' + dayNum;
            var delay = index * 0.06;
            return `
                <div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:${index < 2 ? '1px solid rgba(255,255,255,0.03)' : 'none'};animation:fadeIn 0.4s ease ${delay}s;">
                    <span style="font-size:14px;">${rec.icon || '📖'}</span>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:12px;font-weight:500;color:#e2e8f0;">${rec.title || 'Lesson'}</div>
                        <div style="font-size:10px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${rec.description || 'Continue your learning journey.'}</div>
                    </div>
                    <a href="${link}" style="padding:3px 12px;background:rgba(74,158,255,0.08);border-radius:100px;color:#4a9eff;font-size:10px;text-decoration:none;transition:all 0.2s;" onmouseover="this.style.background='rgba(74,158,255,0.15)'" onmouseout="this.style.background='rgba(74,158,255,0.08)'">Start</a>
                </div>
            `;
        }).join('');

        var schoolsHtml = schools.slice(0, 3).map(function(school, index) {
            var isActive = school.status === 'active' || school.status === 'available';
            var delay = 0.1 + index * 0.06;
            return `
                <div style="display:inline-flex;align-items:center;gap:4px;padding:4px 12px 4px 8px;background:${isActive ? 'rgba(74,158,255,0.06)' : 'rgba(255,255,255,0.02)'};border-radius:100px;border:1px solid ${isActive ? 'rgba(74,158,255,0.08)' : 'rgba(255,255,255,0.03)'};animation:fadeIn 0.4s ease ${delay}s;cursor:${isActive ? 'pointer' : 'default'};transition:all 0.2s;" onclick="if(${isActive} && '${school.id}' === 'school-ai'){window.location.href='/pages/academy.html'}">
                    <span style="font-size:12px;">${school.icon || '🏛️'}</span>
                    <span style="font-size:11px;font-weight:500;color:#e2e8f0;">${school.name || 'School'}</span>
                    ${isActive ? '<span style="font-size:7px;color:#22c55e;">●</span>' : '<span style="font-size:7px;color:#64748b;">soon</span>'}
                </div>
            `;
        }).join('');

        var deferredHtml = `
            <div style="background:rgba(255,255,255,0.02);border-radius:16px;padding:14px 16px;border:1px solid rgba(255,255,255,0.04);">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                    <span style="font-size:14px;">🌟</span>
                    <span style="font-size:12px;color:#94a3b8;font-weight:400;">Recommended for you</span>
                </div>
                ${recsHtml || '<div style="color:#64748b;font-size:12px;padding:8px 0;">Complete lessons to get recommendations.</div>'}
            </div>
            <div style="background:rgba(255,255,255,0.02);border-radius:16px;padding:14px 16px;border:1px solid rgba(255,255,255,0.04);">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                    <span style="font-size:14px;">🏛️</span>
                    <span style="font-size:12px;color:#94a3b8;font-weight:400;">Explore Schools</span>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">
                    ${schoolsHtml || '<div style="color:#64748b;font-size:12px;padding:8px 0;">More schools coming soon.</div>'}
                </div>
            </div>
        `;

        container.innerHTML = deferredHtml;
        container.style.opacity = '1';

        var style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        container.appendChild(style);

        LawAIApp.EventBus?.emit?.('AcademyDeferredRendered', { timestamp: Date.now() });
        console.log('✅ Academy deferred content rendered');
    }
};

console.log('🏛️ AcademyAIView V6.1 ready (Campus Edition + Navigation)');
