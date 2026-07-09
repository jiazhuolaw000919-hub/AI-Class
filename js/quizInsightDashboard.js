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
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;text-align:center;border:1px solid rgba(255,255,255,0.04);">
                        <div style="font-size:12px;color:#94a3b8;">📊 Accuracy</div>
                        <div style="font-size:24px;font-weight:700;color:#8b5cf6;">${Math.round((result.correct / (result.correct + result.incorrect)) * 100)}%</div>
                    </div>
                </div>

                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">🧩 Topic Accuracy</h3>
                    ${result.topicAccuracy ? result.topicAccuracy.map(function(t) {
                        return `
                            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                                <span style="font-size:13px;">${t.topic}</span>
                                <span style="font-size:13px;font-weight:600;color:${t.accuracy >= 80 ? '#22c55e' : t.accuracy >= 60 ? '#f59e0b' : '#ef4444'};">${t.accuracy}%</span>
                            </div>
                        `;
                    }).join('') : '<p style="color:#94a3b8;">No topic data available.</p>'}
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
                    <div style="background:rgba(34,197,94,0.05);border-radius:12px;padding:16px 18px;border:1px solid rgba(34,197,94,0.1);">
                        <h4 style="margin:0 0 8px;color:#22c55e;">💪 Strengths</h4>
                        <ul style="margin:0;padding-left:18px;color:#cbd5e1;font-size:13px;">
                            ${(result.strengths || ['Foundation concepts']).map(function(s) { return '<li>' + s + '</li>'; }).join('')}
                        </ul>
                    </div>
                    <div style="background:rgba(239,68,68,0.05);border-radius:12px;padding:16px 18px;border:1px solid rgba(239,68,68,0.1);">
                        <h4 style="margin:0 0 8px;color:#ef4444;">🛠️ Weaknesses</h4>
                        <ul style="margin:0;padding-left:18px;color:#cbd5e1;font-size:13px;">
                            ${(result.weaknesses || ['Review more']).map(function(w) { return '<li>' + w + '</li>'; }).join('')}
                        </ul>
                    </div>
                </div>

                <div style="background:rgba(139,92,246,0.05);border-radius:12px;padding:16px 18px;border:1px solid rgba(139,92,246,0.1);margin-bottom:12px;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:32px;">🤖</span>
                        <div>
                            <h4 style="margin:0 0 4px;color:#8b5cf6;">AI Mentor Insight</h4>
                            <p style="margin:0;color:#cbd5e1;font-size:13px;">${result.mentorInsight || 'Keep practicing to improve your scores!'}</p>
                        </div>
                    </div>
                </div>

                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">
                    <button onclick="LawAIApp.Router?.navigate ? LawAIApp.Router.navigate('module', {moduleId: '${moduleId || 'module_1'}'}) : alert('Module')" style="padding:10px 20px;background:#4a9eff;border:none;border-radius:8px;color:white;font-size:13px;cursor:pointer;">📖 Review Module</button>
                    <button onclick="alert('Retry Quiz')" style="padding:10px 20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#e2e8f0;font-size:13px;cursor:pointer;">🔄 Retry Quiz</button>
                    <button onclick="alert('Challenge mode coming soon')" style="padding:10px 20px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.15);border-radius:8px;color:#f59e0b;font-size:13px;cursor:pointer;">🏆 Take Challenge</button>
                </div>
            </div>
        `;

        app.innerHTML = html;
    },

    _generateResult: function(moduleId) {
        var score = Math.floor(Math.random() * 40) + 60; // 60-100
        var correct = Math.round(score / 20);
        var incorrect = 5 - correct;

        return {
            moduleName: 'Module ' + (moduleId || '1') + ' Quiz',
            score: score,
            correct: correct,
            incorrect: incorrect,
            xpEarned: Math.round(score * 0.5) + 10,
            timeTaken: Math.floor(Math.random() * 8) + 5 + ' min',
            topicAccuracy: [
                { topic: 'Foundation', accuracy: Math.floor(Math.random() * 30) + 70 },
                { topic: 'Prompt Engineering', accuracy: Math.floor(Math.random() * 40) + 50 },
                { topic: 'AI Tools', accuracy: Math.floor(Math.random() * 30) + 65 }
            ],
            strengths: ['Foundation concepts', 'AI basics'],
            weaknesses: ['Advanced topics', 'Prompt optimization'],
            mentorInsight: 'Focus on reviewing Prompt Engineering concepts. Practice with real-world scenarios.'
        };
    }
};

console.log('📊 QuizInsightDashboard V2.0 ready');
