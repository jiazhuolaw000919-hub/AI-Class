// ===========================================
// showcaseDashboard.js
// 职业展示与作品集 - 自动生成专业作品集（Phase 58 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Views = LawAIApp.Views || {};

LawAIApp.Views.ShowcaseDashboard = {
    render: function() {
        var app = document.getElementById('app');
        if (!app) return;

        var showcase = this._getShowcase();
        var summary = this._generateSummary();

        var html = `
            <div style="max-width:900px;margin:0 auto;padding:16px 20px 40px;color:#e2e8f0;animation:fadeIn 0.6s ease;">
                <button class="back-btn" onclick="LawAIApp.Router?.goBack ? LawAIApp.Router.goBack() : history.back()" style="background:rgba(255,255,255,0.06);border:none;color:#4a9eff;padding:10px 16px;border-radius:10px;cursor:pointer;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:14px;">
                    ← Back to Dashboard
                </button>

                <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;">🚀 Career Showcase</h2>

                <!-- About -->
                <div style="background:linear-gradient(135deg,rgba(139,92,246,0.15),rgba(74,158,255,0.15));border-radius:12px;padding:20px;border:1px solid rgba(139,92,246,0.1);margin-bottom:16px;">
                    <h3 style="margin:0 0 4px;font-size:16px;color:#e2e8f0;">About Me</h3>
                    <p style="margin:0;color:#94a3b8;font-size:14px;">${summary || 'AI learner building expertise in artificial intelligence and machine learning.'}</p>
                </div>

                <!-- Stats -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-bottom:16px;">
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);text-align:center;">
                        <div style="font-size:12px;color:#94a3b8;">⭐ XP</div>
                        <div style="font-size:20px;font-weight:700;color:#fbbf24;">${showcase.stats.xp || 0}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);text-align:center;">
                        <div style="font-size:12px;color:#94a3b8;">📈 Level</div>
                        <div style="font-size:20px;font-weight:700;color:#4a9eff;">${showcase.stats.level || 1}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);text-align:center;">
                        <div style="font-size:12px;color:#94a3b8;">📚 Lessons</div>
                        <div style="font-size:20px;font-weight:700;color:#8b5cf6;">${showcase.stats.lessonsCompleted || 0}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);text-align:center;">
                        <div style="font-size:12px;color:#94a3b8;">🏗️ Projects</div>
                        <div style="font-size:20px;font-weight:700;color:#f97316;">${showcase.stats.totalProjects || 0}</div>
                    </div>
                </div>

                <!-- Projects -->
                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">🛠️ Projects</h3>
                    ${showcase.projects && showcase.projects.length > 0 ? showcase.projects.map(function(p) {
                        return `
                            <div style="padding:10px 12px;background:rgba(255,255,255,0.02);border-radius:8px;margin-bottom:4px;">
                                <strong style="font-size:14px;">${p.title || 'Project'}</strong>
                                <p style="color:#94a3b8;font-size:13px;margin:4px 0 0;">${p.description || 'No description'}</p>
                                <small style="color:#64748b;font-size:11px;">Completed: ${p.completedDate ? new Date(p.completedDate).toLocaleDateString() : 'N/A'}</small>
                            </div>
                        `;
                    }).join('') : '<p style="color:#94a3b8;font-size:13px;">No projects yet. Complete a project to showcase it here.</p>'}
                </div>

                <!-- Skills -->
                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">⚡ Skills</h3>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;">
                        ${showcase.skills && showcase.skills.length > 0 ? showcase.skills.map(function(s) {
                            return `
                                <div style="background:rgba(255,255,255,0.02);border-radius:8px;padding:12px;text-align:center;">
                                    <strong style="font-size:13px;">${s.name || 'Skill'}</strong>
                                    <div style="width:100%;height:4px;background:rgba(255,255,255,0.06);border-radius:10px;overflow:hidden;margin-top:4px;">
                                        <div style="width:${s.mastery || 0}%;height:100%;background:${(s.mastery || 0) > 70 ? '#4a9eff' : (s.mastery || 0) > 40 ? '#8b5cf6' : '#64748b'};border-radius:10px;"></div>
                                    </div>
                                    <small style="color:#64748b;font-size:10px;">${s.level || 'Beginner'}</small>
                                </div>
                            `;
                        }).join('') : '<p style="color:#94a3b8;font-size:13px;">Complete lessons to build your skills.</p>'}
                    </div>
                </div>

                <!-- Achievements -->
                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">🏆 Achievements</h3>
                    ${showcase.achievements && showcase.achievements.length > 0 ? showcase.achievements.map(function(a) {
                        return `<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;color:#cbd5e1;">🏅 ${a.name || 'Achievement'} – ${a.description || ''}</div>`;
                    }).join('') : '<p style="color:#94a3b8;font-size:13px;">Unlock achievements by learning.</p>'}
                </div>

                <!-- Actions -->
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
                    <button onclick="alert('PDF export coming soon')" style="padding:10px 20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#e2e8f0;font-size:13px;cursor:pointer;">📤 Export as PDF</button>
                    <button onclick="alert('Link copied (simulated)')" style="padding:10px 20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#e2e8f0;font-size:13px;cursor:pointer;">🔗 Share Link</button>
                </div>

                <style>
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                </style>
            </div>
        `;

        app.innerHTML = html;
    },

    _getShowcase: function() {
        var progress = {};
        var xp = 0;
        var level = 1;
        var projects = [];
        var skills = [];
        var achievements = [];

        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                progress = LawAIApp.ProgressEngine.getProgress();
            }
        } catch (e) {}

        try {
            if (LawAIApp.XPEngine && typeof LawAIApp.XPEngine.getCurrentXP === 'function') {
                xp = LawAIApp.XPEngine.getCurrentXP() || 0;
            }
            if (LawAIApp.XPEngine && typeof LawAIApp.XPEngine.getCurrentLevel === 'function') {
                level = LawAIApp.XPEngine.getCurrentLevel() || 1;
            }
        } catch (e) {}

        try {
            if (LawAIApp.ProjectEngine && typeof LawAIApp.ProjectEngine.getCompletedProjects === 'function') {
                var projs = LawAIApp.ProjectEngine.getCompletedProjects() || [];
                projects = projs.map(function(p) {
                    return { title: p.title, description: p.description, completedDate: p.completedAt };
                });
            }
        } catch (e) {}

        try {
            if (LawAIApp.SkillEngine && typeof LawAIApp.SkillEngine.getAll === 'function') {
                skills = (LawAIApp.SkillEngine.getAll() || []).slice(0, 6).map(function(s) {
                    return { name: s.title || s.name || 'Skill', mastery: s.mastery || 50, level: s.level ? 'Level ' + s.level : 'Beginner' };
                });
            }
        } catch (e) {}

        try {
            if (LawAIApp.AchievementEngine && typeof LawAIApp.AchievementEngine.getUnlocked === 'function') {
                achievements = LawAIApp.AchievementEngine.getUnlocked() || [];
            }
        } catch (e) {}

        return {
            stats: {
                xp: xp,
                level: level,
                lessonsCompleted: progress.completedLessons?.length || 0,
                totalProjects: projects.length
            },
            projects: projects,
            skills: skills,
            achievements: achievements
        };
    },

    _generateSummary: function() {
        var progress = {};
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                progress = LawAIApp.ProgressEngine.getProgress();
            }
        } catch (e) {}

        var completed = progress.completedLessons?.length || 0;
        var xp = 0;
        try {
            if (LawAIApp.XPEngine && typeof LawAIApp.XPEngine.getCurrentXP === 'function') {
                xp = LawAIApp.XPEngine.getCurrentXP() || 0;
            }
        } catch (e) {}

        if (completed === 0) {
            return '👋 AI learner starting the journey into artificial intelligence.';
        }
        if (completed < 30) {
            return '🌱 AI enthusiast building a strong foundation in AI concepts and tools.';
        }
        if (completed < 100) {
            return '📘 AI practitioner with ' + completed + ' lessons completed and ' + xp + ' XP earned.';
        }
        if (completed < 200) {
            return '🧠 AI specialist with deep knowledge in AI tools and prompt engineering.';
        }
        return '🏆 AI expert with ' + completed + ' lessons mastered and a passion for innovation.';
    }
};

console.log('🚀 ShowcaseDashboard V2.0 ready');
