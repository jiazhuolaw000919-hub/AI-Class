// ===========================================
// plannerDashboard.js
// 智能学习规划器 - 个性化每日学习计划（Phase 54 升级版）
// ===========================================

window.LawAIApp = window.LawAIApp || {};
LawAIApp.Views = LawAIApp.Views || {};

LawAIApp.Views.PlannerDashboard = {
    _safeGet: function(key, defaultValue) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.get === 'function') {
                return LawAIApp.StorageEngine.get(key, defaultValue);
            }
            var val = localStorage.getItem('lawai_' + key);
            return val ? JSON.parse(val) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    _safeSet: function(key, value) {
        try {
            if (LawAIApp.StorageEngine && typeof LawAIApp.StorageEngine.set === 'function') {
                LawAIApp.StorageEngine.set(key, value);
                return true;
            }
            localStorage.setItem('lawai_' + key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    },

    render: function() {
        var app = document.getElementById('app');
        if (!app) return;

        var plan = this._getPlan();
        var health = this._getHealth();
        var memory = this._getMemory();
        var weekSummary = this._getWeekSummary();

        var html = `
            <div style="max-width:900px;margin:0 auto;padding:16px 20px 40px;color:#e2e8f0;">
                <button class="back-btn" onclick="LawAIApp.Router?.goBack ? LawAIApp.Router.goBack() : history.back()" style="background:rgba(255,255,255,0.06);border:none;color:#4a9eff;padding:10px 16px;border-radius:10px;cursor:pointer;margin-bottom:16px;display:flex;align-items:center;gap:8px;font-size:14px;">
                    ← Back to Dashboard
                </button>

                <h2 style="margin:0 0 16px;font-size:24px;font-weight:700;">📅 Smart Learning Planner</h2>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);">
                        <div style="font-size:12px;color:#94a3b8;">❤️ Health</div>
                        <div style="font-size:20px;font-weight:700;color:${health > 70 ? '#22c55e' : '#f59e0b'};">${health}%</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:14px;border:1px solid rgba(255,255,255,0.04);">
                        <div style="font-size:12px;color:#94a3b8;">🧠 Memory</div>
                        <div style="font-size:20px;font-weight:700;color:${memory > 70 ? '#4a9eff' : '#f59e0b'};">${memory}%</div>
                    </div>
                </div>

                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                        <h3 style="margin:0;font-size:14px;color:#94a3b8;font-weight:400;">⏳ Today's Plan</h3>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <label style="font-size:12px;color:#94a3b8;">Time Block:</label>
                            <select id="time-block-select" style="
                                padding:4px 8px;
                                background:rgba(255,255,255,0.05);
                                border:1px solid rgba(255,255,255,0.08);
                                border-radius:6px;
                                color:#e2e8f0;
                                font-size:12px;
                            ">
                                <option value="15" ${plan.timeBlock === 15 ? 'selected' : ''}>15 min</option>
                                <option value="30" ${plan.timeBlock === 30 ? 'selected' : ''}>30 min</option>
                                <option value="45" ${plan.timeBlock === 45 ? 'selected' : ''}>45 min</option>
                                <option value="60" ${plan.timeBlock === 60 ? 'selected' : ''}>60 min</option>
                            </select>
                        </div>
                    </div>
                    <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;">${plan.usedMinutes || 0} / ${plan.timeBlock || 30} min used</p>
                    <div style="width:100%;height:4px;background:rgba(255,255,255,0.06);border-radius:10px;overflow:hidden;margin-bottom:8px;">
                        <div style="width:${plan.timeBlock > 0 ? Math.min(100, (plan.usedMinutes / plan.timeBlock) * 100) : 0}%;height:100%;background:linear-gradient(90deg,#4a9eff,#7c3aed);border-radius:10px;"></div>
                    </div>
                    ${plan.tasks && plan.tasks.length > 0 ? plan.tasks.map(function(task) {
                        return `
                            <div style="display:flex;justify-content:space-between;padding:8px 12px;background:rgba(255,255,255,0.02);border-radius:8px;margin-bottom:4px;">
                                <div>
                                    <span style="font-size:13px;">${task.title || 'Task'}</span>
                                    <small style="color:#94a3b8;display:block;font-size:11px;">${task.description || ''} · ${task.estimatedMinutes || 10} min</small>
                                </div>
                                <button onclick="LawAIApp.Views.PlannerDashboard._completeTask('${task.id || ''}')" style="
                                    padding:4px 12px;
                                    background:rgba(34,197,94,0.1);
                                    border:1px solid rgba(34,197,94,0.15);
                                    border-radius:6px;
                                    color:#22c55e;
                                    font-size:11px;
                                    cursor:pointer;
                                ">✅</button>
                            </div>
                        `;
                    }).join('') : '<p style="color:#94a3b8;font-size:13px;">No tasks scheduled. Enjoy your free time!</p>'}
                </div>

                <div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:16px 18px;border:1px solid rgba(255,255,255,0.06);margin-bottom:12px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#94a3b8;font-weight:400;">📆 Upcoming Week</h3>
                    ${weekSummary.map(function(day) {
                        return `
                            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                                <span style="font-size:13px;">${day.date}</span>
                                <span style="font-size:12px;color:#94a3b8;">📖 ${day.newLessons || 0} new · 🔁 ${day.reviews || 0} reviews</span>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div style="background:rgba(139,92,246,0.05);border-radius:12px;padding:16px 18px;border:1px solid rgba(139,92,246,0.1);">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <span style="font-size:24px;">🤖</span>
                        <div>
                            <h4 style="margin:0 0 4px;font-size:14px;color:#8b5cf6;">Mentor Suggestion</h4>
                            <p style="margin:0;color:#cbd5e1;font-size:13px;">${memory < 70 ? '🧠 Prioritize reviews to protect your memory retention.' : '📚 You\'re ready for a challenge! Add a new topic to your learning path.'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        app.innerHTML = html;

        // 绑定事件
        var select = document.getElementById('time-block-select');
        if (select) {
            select.addEventListener('change', function(e) {
                var minutes = parseInt(e.target.value);
                LawAIApp.Views.PlannerDashboard._generatePlan(minutes);
                LawAIApp.Views.PlannerDashboard.render();
            });
        }
    },

    _getPlan: function() {
        var stored = this._safeGet('dailyPlan');
        if (stored) return stored;

        var defaultPlan = {
            timeBlock: 30,
            usedMinutes: 0,
            tasks: [
                { id: 'task_1', title: 'Complete Daily Lesson', description: 'Day ' + (this._getCompletedLessons() + 1), estimatedMinutes: 15 },
                { id: 'task_2', title: 'Review Previous Lesson', description: 'Reinforce learning', estimatedMinutes: 10 }
            ]
        };
        this._safeSet('dailyPlan', defaultPlan);
        return defaultPlan;
    },

    _generatePlan: function(minutes) {
        var plan = this._getPlan();
        plan.timeBlock = minutes;
        // 重新生成任务
        var completed = this._getCompletedLessons();
        plan.tasks = [
            { id: 'task_' + Date.now() + '_1', title: 'Complete Daily Lesson', description: 'Day ' + (completed + 1), estimatedMinutes: Math.min(20, minutes * 0.5) },
            { id: 'task_' + Date.now() + '_2', title: 'Review Previous Lesson', description: 'Reinforce learning', estimatedMinutes: Math.min(15, minutes * 0.3) }
        ];
        if (minutes > 30) {
            plan.tasks.push({ id: 'task_' + Date.now() + '_3', title: 'Practice Exercise', description: 'Apply what you learned', estimatedMinutes: Math.min(20, minutes * 0.2) });
        }
        plan.usedMinutes = plan.tasks.reduce(function(sum, t) { return sum + (t.estimatedMinutes || 0); }, 0);
        this._safeSet('dailyPlan', plan);
    },

    _getCompletedLessons: function() {
        try {
            if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
                var progress = LawAIApp.ProgressEngine.getProgress();
                return progress.completedLessons?.length || 0;
            }
        } catch (e) {}
        return 0;
    },

    _getHealth: function() {
        try {
            if (LawAIApp.LearningIntelligence && typeof LawAIApp.LearningIntelligence.getHealth === 'function') {
                var h = LawAIApp.LearningIntelligence.getHealth();
                return h?.overall || 70;
            }
        } catch (e) {}
        return 70;
    },

    _getMemory: function() {
        try {
            if (LawAIApp.MemoryEngine && typeof LawAIApp.MemoryEngine.getAll === 'function') {
                var memories = LawAIApp.MemoryEngine.getAll() || {};
                var keys = Object.keys(memories);
                if (keys.length > 0) {
                    var total = 0;
                    for (var key in memories) {
                        total += memories[key].strength || 50;
                    }
                    return Math.round(total / keys.length);
                }
            }
        } catch (e) {}
        return 80;
    },

    _getWeekSummary: function() {
        var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        var today = new Date().getDay();
        var startIdx = today === 0 ? 0 : today - 1;

        return days.map(function(day, index) {
            return {
                date: day,
                newLessons: index === 0 ? 1 : 0,
                reviews: index === 2 ? 2 : 0
            };
        });
    },

    _completeTask: function(taskId) {
        var plan = this._getPlan();
        plan.tasks = plan.tasks.filter(function(t) { return t.id !== taskId; });
        this._safeSet('dailyPlan', plan);
        this.render();
        alert('✅ Task completed!');
    }
};

console.log('📅 PlannerDashboard V2.0 ready');
