// ===========================================
// quizInsightDashboard.js
// 测验洞察仪表盘 - 使用真实数据
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Views = LawAIApp.Views || {};

LawAIApp.Views.QuizInsightDashboard = {
    render: function(moduleId) {
        var app = document.getElementById('app');
        if (!app) return;

        // 使用你的真实数据
        var result = this._getRealData();

        var html = `
            <div style="max-width:900px;margin:0 auto;padding:16px 20px 40px;color:#e2e8f0;">
                <!-- 返回按钮 -->
                <button class="back-btn" onclick="LawAIApp.Router?.goBack ? LawAIApp.Router.goBack() : history.back()" style="background:rgba(255,255,255,0.06);border:none;color:#4a9eff;padding:10px 16px;border-radius:10px;cursor:pointer;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:14px;">
                    ← Back to Module
                </button>

                <!-- 成绩总览 -->
                <div style="background:linear-gradient(135deg,#1a2a4a,#2a1a4a);padding:24px;border-radius:16px;border:1px solid rgba(255,255,255,0.06);text-align:center;margin-bottom:20px;">
                    <h1 style="margin:0 0 4px;font-size:28px;">🎉 Quiz Completed!</h1>
                    <p style="color:#94a3b8;">${result.moduleName}</p>
                    <div style="font-size:56px;font-weight:700;color:${result.score >= 80 ? '#22c55e' : result.score >= 60 ? '#f59e0b' : '#ef4444'};margin:8px 0;">${result.score}%</div>
                    <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;font-size:13px;color:#94a3b8;">
                        <span>✅ ${result.correct} / ${result.total} correct</span>
                        <span>❌ ${result.incorrect} incorrect</span>
                        <span>⭐ +${result.xpEarned} XP</span>
                        <span>🔥 ${result.streak}-day streak</span>
                    </div>
                </div>

                <!-- 三个统计卡片 -->
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
                        <div style="font-size:24px;font-weight:700;color:#8b5cf6;">${Math.round((result.correct / result.total) * 100)}%</div>
                    </div>
                </div>

                <!-- 主题准确率 -->
                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">🧩 Topic Accuracy</h3>
                    ${result.topicAccuracy.map(function(t) {
                        return `
                            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                                <span style="font-size:13px;">${t.topic}</span>
                                <span style="font-size:13px;font-weight:600;color:${t.accuracy >= 80 ? '#22c55e' : t.accuracy >= 60 ? '#f59e0b' : '#ef4444'};">${t.accuracy}%</span>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- 强弱项 + 进度条 -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
                    <div style="background:rgba(34,197,94,0.05);border-radius:12px;padding:16px 18px;border:1px solid rgba(34,197,94,0.1);">
                        <h4 style="margin:0 0 8px;color:#22c55e;">💪 Strengths</h4>
                        <ul style="margin:0;padding-left:18px;color:#cbd5e1;font-size:13px;">
                            ${result.strengths.map(function(s) { return '<li>' + s + '</li>'; }).join('')}
                        </ul>
                    </div>
                    <div style="background:rgba(239,68,68,0.05);border-radius:12px;padding:16px 18px;border:1px solid rgba(239,68,68,0.1);">
                        <h4 style="margin:0 0 8px;color:#ef4444;">🛠️ Areas to Improve</h4>
                        <ul style="margin:0;padding-left:18px;color:#cbd5e1;font-size:13px;">
                            ${result.weaknesses.map(function(w) { return '<li>' + w + '</li>'; }).join('')}
                        </ul>
                    </div>
                </div>

                <!-- 进度条（模块进度） -->
                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;font-size:13px;color:#94a3b8;margin-bottom:6px;">
                        <span>📊 Module Progress</span>
                        <span>${result.progress.completed} / ${result.progress.total} modules</span>
                    </div>
                    <div style="width:100%;height:4px;background:rgba(255,255,255,0.06);border-radius:999px;overflow:hidden;">
                        <div style="width:${(result.progress.completed / result.progress.total) * 100}%;height:100%;background:linear-gradient(90deg,#4a9eff,#7c3aed);border-radius:999px;transition:width 0.6s ease;"></div>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
                        ${result.progress.modules.map(function(m) {
                            var icon = m.status === 'complete' ? '✅' : m.status === 'in-progress' ? '⏳' : '🔒';
                            var color = m.status === 'complete' ? '#22c55e' : m.status === 'in-progress' ? '#f59e0b' : '#475569';
                            return `<span style="font-size:12px;color:${color};">${icon} ${m.name}</span>`;
                        }).join('')}
                    </div>
                </div>

                <!-- AI Mentor 反馈 -->
                <div style="background:rgba(139,92,246,0.05);border-radius:12px;padding:16px 18px;border:1px solid rgba(139,92,246,0.1);margin-bottom:12px;">
                    <div style="display:flex;align-items:flex-start;gap:12px;">
                        <span style="font-size:32px;">🤖</span>
                        <div>
                            <h4 style="margin:0 0 4px;color:#8b5cf6;">AI Mentor Insight</h4>
                            <p style="margin:0;color:#cbd5e1;font-size:13px;">${result.mentorInsight}</p>
                            <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;">
                                ${result.recommendations.map(function(r) {
                                    return `<span style="background:rgba(139,92,246,0.1);padding:4px 12px;border-radius:999px;font-size:12px;color:#a78bfa;border:1px solid rgba(139,92,246,0.05);">${r}</span>`;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 底部按钮 -->
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">
                    <button onclick="alert('Review Module 2: How Modern AI Works')" style="padding:10px 20px;background:#4a9eff;border:none;border-radius:8px;color:white;font-size:13px;cursor:pointer;">📖 Review Module</button>
                    <button onclick="alert('Retry Quiz')" style="padding:10px 20px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);border-radius:8px;color:#e2e8f0;font-size:13px;cursor:pointer;">🔄 Retry Quiz</button>
                    <button onclick="alert('Challenge mode coming soon')" style="padding:10px 20px;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.15);border-radius:8px;color:#f59e0b;font-size:13px;cursor:pointer;">🏆 Take Challenge</button>
                </div>
            </div>
        `;

        app.innerHTML = html;
    },

    // ===== 你的真实数据（来自 Markdown）=====
    _getRealData: function() {
        return {
            moduleName: 'Module 2 · How Modern AI Works',
            score: 85,
            correct: 17,
            incorrect: 3,
            total: 20,
            xpEarned: 150,
            streak: 12,
            topicAccuracy: [
                { topic: 'Deep Learning', accuracy: 100 },
                { topic: 'AI Basics', accuracy: 100 },
                { topic: 'Neural Networks', accuracy: 80 },
                { topic: 'Machine Learning', accuracy: 60 }
            ],
            strengths: [
                'Deep Learning (100%)',
                'AI Basics (100%)'
            ],
            weaknesses: [
                'Machine Learning (60%) — needs review',
                'Neural Networks (80%) — needs reinforcement'
            ],
            mentorInsight: 'Review Lesson 6 and Lesson 8 to bridge the gaps in Machine Learning and Neural Networks.',
            recommendations: [
                '📘 Review Lesson 6: Machine Learning Fundamentals',
                '📘 Review Lesson 8: Neural Network Architecture'
            ],
            progress: {
                completed: 1,
                total: 4,
                modules: [
                    { name: 'Module 1', status: 'complete' },
                    { name: 'Module 2', status: 'in-progress' },
                    { name: 'Module 3', status: 'locked' },
                    { name: 'Module 4', status: 'locked' }
                ]
            }
        };
    }
};

console.log('📊 QuizInsightDashboard V2.1 (Real Data) ready');
