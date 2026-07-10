// ===========================================
// academyAIView.js
// AI 基础学院 - 学院仪表盘（Season 1 体验恢复版）
// V4.0 - Progressive Rendering | Visual Hierarchy | Campus Feel
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
            console.log('🔄 Academy already rendered, refreshing...');
            this._refresh(app);
            return;
        }

        this._rendered = true;
        console.log('🏛️ AcademyAIView V4.0 rendering (progressive)...');

        // ============================================================
        // 1. 获取数据（所有引擎继续运行）
        // ============================================================
        var academy = this._getAcademyData();
        var progress = this._getProgressData();
        var recommendations = this._getRecommendations();
        var schools = this._getSchools();

        // ============================================================
        // 2. 立即渲染核心内容（Hero + Continue Learning + Stats）
        // ============================================================
        app.innerHTML = this._buildCoreHTML(academy, progress, recommendations, schools);

        // ============================================================
        // 3. 延迟渲染次要内容（推荐路径 + 探索学院 + Quick Access）
        // ============================================================
        var self = this;
        setTimeout(function() {
            self._renderDeferredContent(app, academy, progress, recommendations, schools);
        }, 200);

        // ============================================================
        // 4. 触发事件
        // ============================================================
        LawAIApp.EventBus?.emit?.('AcademyRendered', { timestamp: Date.now() });
    },

    /**
     * 刷新 Academy（只更新动态数据）
     */
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
    // 数据获取方法（保留所有引擎调用）
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
            return '🏆 Master of AI! You\'ve completed everything!';
        }
        if (progress.streak >= 30) {
            return '🔥 ' + progress.streak + '-day streak! You\'re unstoppable!';
        }
        if (progress.streak >= 7) {
            return '💪 ' + progress.streak + ' days strong! Keep going!';
        }
        if (progress.completed > 0) {
            return timeGreeting + ', Learner! Ready to grow?';
        }
        return timeGreeting + '! Let\'s start your AI journey 🚀';
    },

    // ============================================================
    // 核心 HTML 构建（立即渲染）
    // ============================================================

    _buildCoreHTML: function(academy, progress, recommendations, schools) {
        var nextLesson = this._getNextLesson();
        var continueLink = this._getContinueLink(nextLesson);
        var greeting = this._getGreeting(progress);
        var isComplete = progress.completed >= 365;
        var progressText = isComplete ? '🎉 Complete!' : progress.completed + '/' + progress.total + ' lessons';

        // Back button 功能保留
        var backBtnHtml = `
            <button class="back-btn" onclick="if(window.LawAIApp?.Router?.goBack){LawAIApp.Router.goBack();}else if(window.history?.back){window.history.back();}else{alert('Back');}" style="
                background:rgba(255,255,255,0.05);
                border:1px solid rgba(255,255,255,0.06);
                color:#94a3b8;
                padding:8px 16px;
                border-radius:10px;
                cursor:pointer;
                margin-bottom:16px;
                display:inline-flex;
                align-items:center;
                gap:8px;
                font-size:13px;
                transition:all 0.2s;
            " onmouseover="this.style.background='rgba(255,255,255,0.08)';this.style.color='#e2e8f0'" onmouseout="this.style.background='rgba(255,255,255,0.05)';this.style.color='#94a3b8'">
                ← Back
            </button>
        `;

        return `
        <div class="academy-page" style="
            max-width: 1000px;
            margin: 0 auto;
            padding: 16px 20px 90px;
            color: #e2e8f0;
            font-family: 'Inter', -apple-system, sans-serif;
        ">
            <!-- Back Button -->
            ${backBtnHtml}

            <!-- ========================================================== -->
            <!-- HERO 区（最高优先级） -->
            <!-- ========================================================== -->
            <div id="academy-hero" style="
                background: linear-gradient(135deg, ${academy.themeColor || '#4a9eff'}, ${academy.themeColor ? academy.themeColor + 'cc' : '#6366f1cc'});
                border-radius: 20px;
                padding: 28px 24px;
                color: white;
                margin-bottom: 20px;
                position: relative;
                overflow: hidden;
                animation: fadeUp 0.4s ease;
            ">
                <div style="position:absolute;top:-40px;right:-20px;font-size:120px;opacity:0.12;pointer-events:none;">${academy.icon || '🤖'}</div>
                <div style="position:relative;z-index:1;">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
                        <span style="font-size:28px;">${academy.icon || '🤖'}</span>
                        <span style="font-size:11px;background:rgba(255,255,255,0.2);padding:2px 12px;border-radius:20px;font-weight:500;">${academy.difficulty || 'Beginner'}</span>
                        ${academy.featured ? '<span style="font-size:11px;background:rgba(255,215,0,0.25);padding:2px 12px;border-radius:20px;font-weight:500;">⭐ Featured</span>' : ''}
                    </div>
                    <h1 style="margin:0 0 2px;font-size:24px;font-weight:700;">${greeting}</h1>
                    <p style="margin:0 0 12px;opacity:0.9;font-size:15px;max-width:600px;">${academy.description || 'Master AI from the ground up.'}</p>
                    <div style="display:flex;gap:16px;font-size:13px;opacity:0.85;flex-wrap:wrap;">
                        <span>⏱️ ${academy.estimatedHours || 200} hours</span>
                        <span>📚 ${progress.total || 365} lessons</span>
                        <span>🎯 ${progressText}</span>
                    </div>
                </div>
            </div>

            <!-- ========================================================== -->
            <!-- 统计卡片（快速状态） -->
            <!-- ========================================================== -->
            <div id="academy-stats" style="
                display:grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
                margin-bottom: 20px;
                animation: fadeUp 0.4s ease 0.05s;
            ">
                ${this._buildStatsHTML(progress)}
            </div>

            <!-- ========================================================== -->
            <!-- 继续学习（最重要行动点） -->
            <!-- ========================================================== -->
            ${this._buildContinueLearningHTML(progress, nextLesson, continueLink, isComplete)}

            <!-- ========================================================== -->
            <!-- 延迟加载区（骨架占位） -->
            <!-- ========================================================== -->
            <div id="academy-deferred" style="
                display:grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
                min-height: 200px;
            ">
                <!-- 推荐路径骨架 -->
                <div id="recommendations-placeholder" style="background:rgba(255,255,255,0.03);border-radius:14px;padding:16px 18px;border:1px solid rgba(255,255,255,0.04);">
                    <h3 style="margin:0 0 12px;font-size:14px;color:#94a3b8;font-weight:400;">🌟 Recommended Path</h3>
                    <div style="padding:4px 0;">
                        ${[0,1,2].map(function(i) {
                            return `
                            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:${i < 2 ? '1px solid rgba(255,255,255,0.03)' : 'none'};">
                                <span style="font-size:18px;">⏳</span>
                                <div style="flex:1;">
                                    <div style="height:12px;width:${70 - i * 10}%;background:rgba(255,255,255,0.06);border-radius:4px;animation:pulse 1.5s infinite ${i * 0.2}s;"></div>
                                    <div style="height:8px;width:${50 - i * 10}%;background:rgba(255,255,255,0.04);border-radius:4px;margin-top:4px;animation:pulse 1.5s infinite ${i * 0.2 + 0.2}s;"></div>
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- 探索学院骨架 -->
                <div id="schools-placeholder" style="background:rgba(255,255,255,0.03);border-radius:14px;padding:16px 18px;border:1px solid rgba(255,255,255,0.04);">
                    <h3 style="margin:0 0 12px;font-size:14px;color:#94a3b8;font-weight:400;">🏛️ Explore Schools</h3>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;">
                        ${[0,1,2].map(function(i) {
                            return `<div style="padding:8px 16px;background:rgba(255,255,255,0.04);border-radius:8px;animation:pulse 1.5s infinite ${i * 0.2}s;width:${80 + i * 20}px;height:36px;"></div>`;
                        }).join('')}
                    </div>
                    <div style="height:40px;background:rgba(255,255,255,0.03);border-radius:8px;animation:pulse 1.5s infinite 0.6s;"></div>
                </div>
            </div>

            <!-- ========================================================== -->
            <!-- Quick Access Buttons（保留原有功能，放在底部） -->
            <!-- ========================================================== -->
            <div id="academy-quick-access" style="
                display:flex;
                flex-wrap:wrap;
                gap:8px;
                margin-top:20px;
                padding-top:16px;
                border-top:1px solid rgba(255,255,255,0.04);
                animation: fadeUp 0.4s ease 0.15s;
            ">
                <button class="quick-btn" onclick="if(window.LawAIApp?.Router?.navigate){LawAIApp.Router.navigate('course-ai-fundamentals');}else{alert('Courses');}" style="padding:8px 16px;background:rgba(74,158,255,0.12);border:1px solid rgba(74,158,255,0.15);border-radius:8px;color:#4a9eff;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(74,158,255,0.2)'" onmouseout="this.style.background='rgba(74,158,255,0.12)'">📖 Courses</button>
                <button class="quick-btn" onclick="if(window.LawAIApp?.Router?.navigate){LawAIApp.Router.navigate('learning-hub');}else{alert('Learning Hub');}" style="padding:8px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">📚 Learning Hub</button>
                <button class="quick-btn" onclick="if(window.LawAIApp?.Router?.navigate){LawAIApp.Router.navigate('knowledge-capture');}else{alert('Notes');}" style="padding:8px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">📓 My Notes</button>
                <button class="quick-btn" onclick="if(window.LawAIApp?.Router?.navigate){LawAIApp.Router.navigate('adaptive-memory');}else{alert('Memory');}" style="padding:8px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">🧠 Memory</button>
                <button class="quick-btn" onclick="if(window.LawAIApp?.Router?.navigate){LawAIApp.Router.navigate('intelligence');}else{alert('Intelligence');}" style="padding:8px 16px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.15);border-radius:8px;color:#8b5cf6;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(139,92,246,0.2)'" onmouseout="this.style.background='rgba(139,92,246,0.1)'">🧠 Intelligence</button>
            </div>

            <!-- ========================================================== -->
            <!-- 空状态（保留原有功能） -->
            <!-- ========================================================== -->
            ${progress.completed === 0 ? `
                <div style="text-align:center;padding:40px 20px;background:rgba(255,255,255,0.02);border-radius:16px;border:1px dashed rgba(255,255,255,0.06);margin-top:16px;animation:fadeUp 0.4s ease 0.2s;">
                    <div style="font-size:48px;">👋</div>
                    <h3 style="color:#e2e8f0;">Welcome to ${academy.name || 'AI Academy'}!</h3>
                    <p style="color:#94a3b8;">Start your first lesson and begin your AI journey.</p>
                    <a href="/pages/lesson.html?day=1" style="display:inline-block;margin-top:12px;padding:10px 28px;background:#4a9eff;border:none;border-radius:10px;color:white;font-size:14px;font-weight:600;text-decoration:none;transition:all 0.2s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">📖 Start Learning</a>
                </div>
            ` : ''}

            <!-- ========================================================== -->
            <!-- 微交互样式 -->
            <!-- ========================================================== -->
            <style>
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            </style>
        </div>
        `;
    },

    /**
     * 构建统计卡片 HTML
     */
    _buildStatsHTML: function(progress) {
        return `
            <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:12px;text-align:center;border:1px solid rgba(255,255,255,0.04);">
                <div style="font-size:20px;font-weight:700;color:#4a9eff;">${progress.level || 1}</div>
                <div style="font-size:10px;color:#64748b;">Level</div>
            </div>
            <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:12px;text-align:center;border:1px solid rgba(255,255,255,0.04);">
                <div style="font-size:20px;font-weight:700;color:#fbbf24;">${progress.xp || 0}</div>
                <div style="font-size:10px;color:#64748b;">XP</div>
            </div>
            <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:12px;text-align:center;border:1px solid rgba(255,255,255,0.04);">
                <div style="font-size:20px;font-weight:700;color:#f97316;">${progress.streak || 0}</div>
                <div style="font-size:10px;color:#64748b;">Streak</div>
            </div>
            <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:12px;text-align:center;border:1px solid rgba(255,255,255,0.04);">
                <div style="font-size:20px;font-weight:700;color:#8b5cf6;">${Math.round(progress.percent || 0)}%</div>
                <div style="font-size:10px;color:#64748b;">Progress</div>
            </div>
        `;
    },

    /**
     * 构建 Continue Learning 卡片
     */
    _buildContinueLearningHTML: function(progress, nextLesson, continueLink, isComplete) {
        var nextDay = parseInt(nextLesson.replace('day-', ''));
        var title = this._getLessonTitle(nextDay);
        var summary = this._getLessonSummary(nextDay);

        return `
            <div style="
                background:rgba(255,255,255,0.03);
                border-radius:16px;
                padding:20px 24px;
                border:1px solid rgba(255,255,255,0.06);
                margin-bottom:20px;
                animation: fadeUp 0.4s ease 0.1s;
                transition:all 0.3s ease;
            " onmouseover="this.style.borderColor='rgba(74,158,255,0.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.06)'">
                <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
                    <div style="flex:1;min-width:150px;">
                        <div style="font-size:13px;color:#94a3b8;font-weight:400;">📖 Continue Learning</div>
                        <div style="font-size:17px;font-weight:600;margin:2px 0;">${title || 'Day ' + nextDay}</div>
                        <div style="font-size:13px;color:#94a3b8;">${summary || 'Continue building your AI knowledge.'}</div>
                    </div>
                    <a id="academy-continue" href="${continueLink}" style="
                        padding:12px 32px;
                        background:linear-gradient(135deg,#4a9eff,#6366f1);
                        border:none;
                        border-radius:12px;
                        color:white;
                        font-size:15px;
                        font-weight:600;
                        text-decoration:none;
                        cursor:pointer;
                        transition:all 0.3s ease;
                        display:inline-flex;
                        align-items:center;
                        gap:8px;
                        white-space:nowrap;
                    " onmouseover="this.style.transform='scale(1.04)';this.style.boxShadow='0 8px 30px rgba(74,158,255,0.3)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='none'">
                        ${isComplete ? '🎉 Review' : '📖 Continue'} →
                    </a>
                </div>
                ${progress.streak > 0 ? `<div style="margin-top:8px;font-size:11px;color:#f97316;">🔥 ${progress.streak} day streak! Keep going!</div>` : ''}
                ${progress.completed > 0 && progress.completed % 10 === 0 ? `<div style="margin-top:8px;font-size:11px;color:#fbbf24;">⭐ ${progress.completed} lessons completed! Amazing!</div>` : ''}
            </div>
        `;
    },

    /**
     * 延迟渲染次要内容
     */
    _renderDeferredContent: function(app, academy, progress, recommendations, schools) {
        if (this._deferredRendered) return;
        this._deferredRendered = true;

        var container = document.getElementById('academy-deferred');
        if (!container) return;

        console.log('📊 Academy: Rendering deferred content...');

        // ============================================================
        // 推荐路径
        // ============================================================
        var recsHtml = recommendations.slice(0, 3).map(function(rec, index) {
            var lessonId = rec.id || 'day-' + (index + 1);
            var dayNum = lessonId.replace('day-', '');
            var link = '/pages/lesson.html?day=' + dayNum;
            var delay = index * 0.08;
            return `
                <div style="
                    display:flex;
                    align-items:center;
                    gap:10px;
                    padding:8px 0;
                    border-bottom:${index < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none'};
                    animation:fadeUp 0.3s ease ${delay}s;
                ">
                    <span style="font-size:18px;">${rec.icon || '📖'}</span>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:500;color:#e2e8f0;">${rec.title || 'Lesson'}</div>
                        <div style="font-size:11px;color:#64748b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${rec.description || 'Continue your learning journey.'}</div>
                    </div>
                    <a href="${link}" style="
                        padding:4px 12px;
                        background:rgba(74,158,255,0.12);
                        border-radius:6px;
                        color:#4a9eff;
                        font-size:11px;
                        text-decoration:none;
                        transition:all 0.2s;
                    " onmouseover="this.style.background='rgba(74,158,255,0.2)'" onmouseout="this.style.background='rgba(74,158,255,0.12)'">
                        Start →
                    </a>
                </div>
            `;
        }).join('');

        // ============================================================
        // 探索学院
        // ============================================================
        var schoolsHtml = schools.slice(0, 3).map(function(school, index) {
            var isActive = school.status === 'active' || school.status === 'available';
            var bgColor = isActive ? 'rgba(74,158,255,0.08)' : 'rgba(255,255,255,0.03)';
            var borderColor = isActive ? 'rgba(74,158,255,0.12)' : 'rgba(255,255,255,0.04)';
            var link = isActive ? (school.id === 'school-ai' ? '/pages/academy.html' : '#') : '#';
            var delay = 0.2 + index * 0.08;
            return `
                <div style="
                    display:flex;
                    align-items:center;
                    gap:10px;
                    padding:8px 12px;
                    background:${bgColor};
                    border-radius:8px;
                    border:1px solid ${borderColor};
                    transition:all 0.2s;
                    animation:fadeUp 0.3s ease ${delay}s;
                    cursor:${isActive ? 'pointer' : 'default'};
                " onmouseover="if(${isActive}){this.style.background='rgba(74,158,255,0.15)'}" onmouseout="if(${isActive}){this.style.background='${bgColor}'}" onclick="if(${isActive} && '${school.id}' === 'school-ai'){window.location.href='/pages/academy.html'}">
                    <span style="font-size:20px;">${school.icon || '🏛️'}</span>
                    <div style="flex:1;">
                        <div style="font-size:13px;font-weight:500;color:#e2e8f0;">${school.name || 'School'}</div>
                        <div style="font-size:10px;color:#64748b;">${isActive ? '✅ Available' : '🚧 Coming soon'}</div>
                    </div>
                    ${isActive ? '<span style="font-size:10px;color:#22c55e;">Active</span>' : '<span style="font-size:10px;color:#64748b;">Soon</span>'}
                </div>
            `;
        }).join('');

        // ============================================================
        // 完整延迟内容
        // ============================================================
        var deferredHtml = `
            <!-- 推荐路径 -->
            <div style="
                background:rgba(255,255,255,0.03);
                border-radius:14px;
                padding:16px 18px;
                border:1px solid rgba(255,255,255,0.04);
            ">
                <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">🌟 Recommended Path</h3>
                ${recsHtml || '<div style="color:#64748b;font-size:13px;padding:12px 0;">Complete lessons to get personalized recommendations.</div>'}
            </div>

            <!-- 探索学院 -->
            <div style="
                background:rgba(255,255,255,0.03);
                border-radius:14px;
                padding:16px 18px;
                border:1px solid rgba(255,255,255,0.04);
            ">
                <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">🏛️ Explore Schools</h3>
                ${schoolsHtml || '<div style="color:#64748b;font-size:13px;padding:12px 0;">More schools coming soon.</div>'}
            </div>
        `;

        container.innerHTML = deferredHtml;

        LawAIApp.EventBus?.emit?.('AcademyDeferredRendered', { timestamp: Date.now() });
        console.log('✅ Academy deferred content rendered');
    }
};

// ============================================================
// 自动渲染
// ============================================================
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() {
        if (LawAIApp.Views?.AcademyAIView) {
            var container = document.getElementById('academy-content') || document.getElementById('app');
            if (container && container.innerHTML.trim() === '') {
                LawAIApp.Views.AcademyAIView.render(container);
            }
        }
    }, 300);
}

console.log('🏛️ AcademyAIView V4.0 ready (Experience Restoration)');
