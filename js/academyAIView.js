// ===========================================
// academyAIView.js
// AI 基础学院 - 学院仪表盘（Season 2 Phase 41 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Views = LawAIApp.Views || {};

LawAIApp.Views.AcademyAIView = {
    render: function() {
        var academy = LawAIApp.AcademyAIData?.academy || {
            name: 'AI Fundamentals',
            icon: '🤖',
            description: 'Master AI from the ground up.',
            themeColor: '#3b82f6',
            estimatedHours: 200,
            difficulty: 'Beginner'
        };

        // 安全获取数据
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
                progress = LawAIApp.ProgressEngine.getProgress();
                completed = progress.completedLessons?.length || 0;
                total = progress.totalLessons || 365;
                percent = progress.completionPercent || 0;
                streak = progress.streak || 0;
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

        var html = `
            <div class="academy-page" style="max-width:1000px;margin:0 auto;padding:16px 20px 40px;color:#e2e8f0;">
                <!-- Back button -->
                <button class="back-btn" onclick="LawAIApp.Router?.goBack ? LawAIApp.Router.goBack() : history.back()" style="background:rgba(255,255,255,0.06);border:none;color:#4a9eff;padding:10px 16px;border-radius:10px;cursor:pointer;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:14px;">
                    ← Back to Academies
                </button>

                <!-- Academy Header -->
                <div style="background:linear-gradient(135deg, ${academy.themeColor || '#3b82f6'}, #6366f1);padding:24px;border-radius:16px;color:white;margin-bottom:20px;">
                    <div style="font-size:40px;margin-bottom:4px;">${academy.icon || '🤖'}</div>
                    <h2 style="margin:0 0 4px;font-size:24px;font-weight:700;">${academy.name || 'AI Academy'}</h2>
                    <p style="margin:0 0 8px;opacity:0.9;">${academy.description || 'Learn AI fundamentals.'}</p>
                    <div style="display:flex;gap:16px;font-size:13px;opacity:0.85;flex-wrap:wrap;">
                        <span>⏱️ ${academy.estimatedHours || 200} hours</span>
                        <span>📊 ${academy.difficulty || 'Beginner'}</span>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:16px;">
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);">
                        <div style="font-size:12px;color:#94a3b8;">📚 Progress</div>
                        <div style="font-size:20px;font-weight:700;">${completed}/${total} (${typeof percent === 'number' ? percent.toFixed(1) : 0}%)</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);">
                        <div style="font-size:12px;color:#94a3b8;">⭐ XP</div>
                        <div style="font-size:20px;font-weight:700;">${xp} XP · Level ${level}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);">
                        <div style="font-size:12px;color:#94a3b8;">🔥 Streak</div>
                        <div style="font-size:20px;font-weight:700;">${streak} days</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);">
                        <div style="font-size:12px;color:#94a3b8;">🔁 Review</div>
                        <div style="font-size:20px;font-weight:700;">${reviewCount} due</div>
                    </div>
                </div>

                <!-- Quick Access Buttons -->
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
                    <button class="quick-btn" onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('course-ai-fundamentals') : alert('Courses')" style="padding:8px 16px;background:rgba(74,158,255,0.12);border:1px solid rgba(74,158,255,0.15);border-radius:8px;color:#4a9eff;cursor:pointer;">📖 Courses</button>
                    <button class="quick-btn" onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('learning-hub') : alert('Learning Hub')" style="padding:8px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;cursor:pointer;">📚 Learning Hub</button>
                    <button class="quick-btn" onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('knowledge-capture') : alert('Notes')" style="padding:8px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;cursor:pointer;">📓 My Notes</button>
                    <button class="quick-btn" onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('adaptive-memory') : alert('Memory')" style="padding:8px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.06);border-radius:8px;color:#e2e8f0;cursor:pointer;">🧠 Memory</button>
                    <button class="quick-btn" onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('intelligence') : alert('Intelligence')" style="padding:8px 16px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.15);border-radius:8px;color:#8b5cf6;cursor:pointer;">🧠 Intelligence</button>
                </div>

                ${completed === 0 ? `
                    <div style="text-align:center;padding:40px 20px;background:rgba(255,255,255,0.02);border-radius:16px;border:1px dashed rgba(255,255,255,0.06);">
                        <div style="font-size:48px;">👋</div>
                        <h3 style="color:#e2e8f0;">Welcome to ${academy.name || 'AI Academy'}!</h3>
                        <p style="color:#94a3b8;">Start your first lesson and begin your AI journey.</p>
                        <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('lesson-detail', {lessonId: 'day-1'}) : alert('Start')" style="margin-top:12px;padding:10px 28px;background:#4a9eff;border:none;border-radius:10px;color:white;font-size:14px;font-weight:600;cursor:pointer;">📖 Start Learning</button>
                    </div>
                ` : ''}
            </div>
        `;

        var app = document.getElementById('app');
        if (app) app.innerHTML = html;
    }
};

console.log('🏛️ AcademyAIView V2.0 ready');
