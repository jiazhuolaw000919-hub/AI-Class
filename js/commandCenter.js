// ===========================================
// commandCenter.js
// 学习预测与指挥中心 - 视觉驱动中央指挥中心（Phase 56 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Views = LawAIApp.Views || {};

LawAIApp.Views.CommandCenter = {
    render: function() {
        var app = document.getElementById('app');
        if (!app) return;

        var predictions = this._getPredictions();
        var progress = {};
        var health = 70;
        var memory = 80;
        var levelInfo = { level: 1 };
        var streak = 0;
        var xp = 0;

        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                progress = LawAIApp.ProgressEngine.getProgress();
                streak = progress.streak || 0;
            }
        } catch (e) {}

        try {
            if (LawAIApp.XPEngine && typeof LawAIApp.XPEngine.getCurrentXP === 'function') {
                xp = LawAIApp.XPEngine.getCurrentXP() || 0;
            }
            if (LawAIApp.XPEngine && typeof LawAIApp.XPEngine.getCurrentLevel === 'function') {
                levelInfo = { level: LawAIApp.XPEngine.getCurrentLevel() || 1 };
            }
        } catch (e) {}

        try {
            if (LawAIApp.LearningIntelligence && typeof LawAIApp.LearningIntelligence.getHealth === 'function') {
                var h = LawAIApp.LearningIntelligence.getHealth();
                health = h?.overall || 70;
            }
        } catch (e) {}

        try {
            if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.getAll === 'function') {
                var memories = LawAIApp.MemoryEngine.getAll() || {};
                var keys = Object.keys(memories);
                if (keys.length > 0) {
                    var total = 0;
                    for (var key in memories) {
                        total += memories[key].strength || 50;
                    }
                    memory = Math.round(total / keys.length);
                }
            }
        } catch (e) {}

        var completed = progress.completedLessons?.length || 0;
        var total = progress.totalLessons || 365;
        var completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

        // 获取活动日志
        var activityLog = [];
        try {
            if (LawAIApp.AnalyticsEngine && typeof LawAIApp.AnalyticsEngine.getEventLog === 'function') {
                activityLog = LawAIApp.AnalyticsEngine.getEventLog(5) || [];
            }
        } catch (e) {}

        var radarSkills = [
            { name: 'Foundation', value: Math.min(90, 10 + completed * 0.15) },
            { name: 'Prompt Eng.', value: Math.min(85, 5 + completed * 0.12) },
            { name: 'AI Tools', value: Math.min(80, 8 + completed * 0.1) },
            { name: 'Coding', value: Math.min(75, 3 + completed * 0.08) },
            { name: 'AI Dev', value: Math.min(70, 2 + completed * 0.06) }
        ];

        var html = `
            <div style="max-width:900px;margin:0 auto;padding:16px 20px 40px;color:#e2e8f0;animation:fadeIn 0.6s ease;">
                <button class="back-btn" onclick="LawAIApp.Router?.goBack ? LawAIApp.Router.goBack() : history.back()" style="background:rgba(255,255,255,0.06);border:none;color:#4a9eff;padding:10px 16px;border-radius:10px;cursor:pointer;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:14px;">
                    ← Back to Dashboard
                </button>

                <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;">🚀 Command Center</h2>

                <!-- Health Orbs -->
                <div style="display:flex;justify-content:center;gap:32px;margin-bottom:20px;flex-wrap:wrap;">
                    <div style="position:relative;width:100px;height:100px;border-radius:50%;background:conic-gradient(#4a9eff ${health}%, rgba(255,255,255,0.06) 0%);display:flex;align-items:center;justify-content:center;">
                        <span style="background:#0b1220;border-radius:50%;width:80px;height:80px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:#e2e8f0;">❤️ ${health}%</span>
                    </div>
                    <div style="position:relative;width:100px;height:100px;border-radius:50%;background:conic-gradient(#8b5cf6 ${memory}%, rgba(255,255,255,0.06) 0%);display:flex;align-items:center;justify-content:center;">
                        <span style="background:#0b1220;border-radius:50%;width:80px;height:80px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;color:#e2e8f0;">🧠 ${memory}%</span>
                    </div>
                </div>

                <!-- Forecast -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:16px;">
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);text-align:center;">
                        <div style="font-size:12px;color:#94a3b8;">🏁 Completion</div>
                        <div style="font-size:16px;font-weight:600;color:#4a9eff;">${completionPercent}%</div>
                        <div style="font-size:11px;color:#64748b;">${predictions.daysRemaining || 'N/A'} days</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);text-align:center;">
                        <div style="font-size:12px;color:#94a3b8;">⭐ XP (30d)</div>
                        <div style="font-size:16px;font-weight:600;color:#fbbf24;">${predictions.xpPredicted || 0}</div>
                        <div style="font-size:11px;color:#64748b;">projected</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);text-align:center;">
                        <div style="font-size:12px;color:#94a3b8;">🎯 Goal Success</div>
                        <div style="font-size:16px;font-weight:600;color:#8b5cf6;">${predictions.goalSuccess || 85}%</div>
                        <div style="font-size:11px;color:#64748b;">probability</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);text-align:center;">
                        <div style="font-size:12px;color:#94a3b8;">📊 Level</div>
                        <div style="font-size:16px;font-weight:600;color:#f97316;">${levelInfo.level || 1}</div>
                        <div style="font-size:11px;color:#64748b;">${xp} XP</div>
                    </div>
                </div>

                <!-- Radar -->
                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">📡 Learning Radar</h3>
                    ${radarSkills.map(function(skill) {
                        var color = skill.value > 70 ? '#4a9eff' : skill.value > 40 ? '#8b5cf6' : '#64748b';
                        return `
                            <div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
                                <span style="font-size:12px;color:#94a3b8;width:80px;">${skill.name}</span>
                                <div style="flex:1;height:4px;background:rgba(255,255,255,0.06);border-radius:10px;overflow:hidden;">
                                    <div style="width:${skill.value}%;height:100%;background:${color};border-radius:10px;"></div>
                                </div>
                                <span style="font-size:11px;color:#64748b;width:36px;text-align:right;">${Math.round(skill.value)}%</span>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Momentum -->
                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">⏳ Momentum</h3>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;">
                        <span style="background:rgba(74,158,255,0.12);padding:4px 12px;border-radius:16px;font-size:12px;color:#4a9eff;">⭐ ${xp} XP</span>
                        <span style="background:rgba(34,197,94,0.12);padding:4px 12px;border-radius:16px;font-size:12px;color:#22c55e;">📚 ${completed} Lessons</span>
                        <span style="background:rgba(249,115,22,0.12);padding:4px 12px;border-radius:16px;font-size:12px;color:#f97316;">🔥 ${streak} Day Streak</span>
                        <span style="background:rgba(139,92,246,0.12);padding:4px 12px;border-radius:16px;font-size:12px;color:#8b5cf6;">🏆 ${Math.floor(completed / 10)} Achievements</span>
                    </div>
                </div>

                <!-- Activity Stream -->
                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">📜 Recent Activity</h3>
                    ${activityLog.length > 0 ? activityLog.map(function(e) {
                        return `<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:13px;color:#cbd5e1;"><small style="color:#64748b;">${new Date(e.timestamp || Date.now()).toLocaleString()}</small> - ${e.type || 'Activity'}</div>`;
                    }).join('') : '<p style="color:#94a3b8;font-size:13px;">No recent activity.</p>'}
                </div>

                <!-- Actions -->
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
                    <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('lesson-detail', {lessonId: 'day-' + (${completed} + 1)}) : alert('Continue')" style="padding:10px 20px;background:#4a9eff;border:none;border-radius:8px;color:white;font-size:13px;cursor:pointer;">▶️ Continue</button>
                    <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('adaptive-memory') : alert('Review')" style="padding:10px 20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#e2e8f0;font-size:13px;cursor:pointer;">🧠 Review</button>
                    <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('planner') : alert('Planner')" style="padding:10px 20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#e2e8f0;font-size:13px;cursor:pointer;">📅 Planner</button>
                    <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('conversations') : alert('Chat')" style="padding:10px 20px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.15);border-radius:8px;color:#8b5cf6;font-size:13px;cursor:pointer;">💬 Ask AI</button>
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

    _getPredictions: function() {
        var progress = {};
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                progress = LawAIApp.ProgressEngine.getProgress();
            }
        } catch (e) {}

        var completed = progress.completedLessons?.length || 0;
        var total = progress.totalLessons || 365;
        var remaining = total - completed;

        // 简化预测
        var dailyRate = 1;
        if (completed > 0) {
            var days = Math.max(1, Math.floor((Date.now() - new Date(progress.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)));
            dailyRate = Math.max(0.1, completed / days);
        }

        return {
            daysRemaining: dailyRate > 0 ? Math.round(remaining / dailyRate) : 365,
            xpPredicted: Math.round((completed + remaining) * 20),
            goalSuccess: Math.min(95, 60 + Math.min(completed / 365, 1) * 35)
        };
    }
};

console.log('🚀 CommandCenter V2.0 ready');
