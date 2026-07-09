// ===========================================
// quizInsightDashboard.js
// 测验洞察仪表盘 - 交互式测验数据（Season 2 Phase 46 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Views = LawAIApp.Views || {};

LawAIApp.Views.QuizInsightDashboard = {
    render: function(moduleId) {
        var app = document.getElementById('app');
        if (!app) return;

        // 生成模拟测验结果
        var result = this._generateResult(moduleId);

        var html = `
            <div style="max-width:900px;margin:0 auto;padding:16px 20px 40px;color:#e2e8f0;">
                <button class="back-btn" onclick="LawAIApp.Router?.goBack ? LawAIApp.Router.goBack() : history.back()" style="background:rgba(255,255,255,0.06);border:none;color:#4a9eff;padding:10px 16px;border-radius:10px;cursor:pointer;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:14px;">
                    ← Back to Module
                </button>

                <div style="background:linear-gradient(135deg,#1a2a4a,#2a1a4a);padding:24px;border-radius:16px;border:1px solid rgba(255,255,255,0.06);text-align:center;margin-bottom:20px;">
                    <h1 style="margin:0 0 4px;font-size:28px;">🎉 Quiz Completed!</h1>
                    <p style="color:#94a3b8;">${result.moduleName || 'Module Quiz'}</p>
                    <div style="font-size:56px;font-weight:700;color:${result.score >= 80 ? '#22c55e' : result.score >= 60 ? '#f59e0b' : '#ef4444'};margin:8px 0;">${result.score}%</div>
                    <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;font-size:13px;color:#94a3b8;">
                        <span>✅ ${result.correct} correct</span>
                        <span>❌ ${result.incorrect} incorrect</span>
                        <span>⭐ +${result.xpEarned} XP</span>
                        <span>⏱️ ${result.timeTaken || '10 min'}</span>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;text-align:center;border:1px solid rgba(255,255,255,0.04);">
                        <div style="font-size:12px;color:#94a3b8;">📈 Score</div>
                        <div style="font-size:24px;font-weight:700;color:#4a9eff;">${result.score}%</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;text-align:center;border:1px solid rgba(255,255,255,0.04);">
                        <div style="font-size:12px;color:#94a3b8;">⭐ XP Earned</div>
                        <div style="font-size:24px;font-weight:700;color:#fbbf24;">+${result.xpEarned}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;
