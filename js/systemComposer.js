_renderMainUI: function() {
    if (!this.root) return;
    
    if (document.getElementById("systemComposerRoot")) {
        console.log("🔄 systemComposerRoot already exists, skipping render");
        return;
    }
    
    // 获取学习状态
    var state = {};
    try {
        if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getState === 'function') {
            state = LawAIApp.ProgressEngine.getState();
        } else if (LawAIApp.ProgressEngine && typeof LawAIApp.ProgressEngine.getProgress === 'function') {
            var p = LawAIApp.ProgressEngine.getProgress();
            state = {
                level: p.level || 1,
                xp: p.xp || 0,
                streak: p.streak || 0,
                day: p.day || 1,
                completionPercent: p.completionPercent || 0,
                currentStage: p.currentStage || 'Foundation'
            };
        }
    } catch (err) {
        console.warn('⚠️ Failed to get progress state:', err);
    }
    
    this.root.innerHTML = `
    <div id="systemComposerRoot" style="
        min-height: 100vh;
        background: linear-gradient(135deg, #0b1220 0%, #1a1a2e 50%, #16213e 100%);
        color: #ffffff;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        padding: 0;
        margin: 0;
        box-sizing: border-box;
    ">
        <!-- ===== 顶部导航 ===== -->
        <header style="
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255,255,255,0.08);
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
        ">
            <div style="display:flex;align-items:center;gap:14px;">
                <span style="font-size:28px;">🚀</span>
                <h1 style="
                    margin:0;
                    font-size:20px;
                    font-weight:700;
                    background: linear-gradient(90deg, #4a9eff, #7c3aed);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                ">Law AI Academy</h1>
                <span style="
                    font-size:11px;
                    background: rgba(74,158,255,0.2);
                    color: #4a9eff;
                    padding:2px 10px;
                    border-radius:12px;
                    font-weight:600;
                ">v${this.version}</span>
            </div>
            <div style="display:flex;align-items:center;gap:16px;font-size:13px;color:#94a3b8;">
                <span>🎯 Day ${state.day || 1}</span>
                <span>⭐ ${state.xp || 0} XP</span>
                <span>🔥 Level ${state.level || 1}</span>
            </div>
        </header>

        <!-- ===== 主内容 ===== -->
        <main style="max-width:1000px;margin:0 auto;padding:24px 20px 60px;">
            
            <!-- 欢迎横幅 -->
            <div style="
                background: linear-gradient(135deg, rgba(74,158,255,0.15), rgba(124,58,237,0.15));
                border: 1px solid rgba(74,158,255,0.2);
                border-radius: 16px;
                padding: 32px;
                text-align: center;
                margin-bottom: 24px;
            ">
                <h2 style="margin:0 0 8px 0;font-size:28px;font-weight:600;">👋 Welcome Back!</h2>
                <p style="margin:0;color:#94a3b8;font-size:16px;">
                    Continue your AI learning journey. You're on Day ${state.day || 1}!
                </p>
                <div style="margin-top:20px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
                    <button onclick="location.href='pages/lesson.html'" style="
                        padding:12px 32px;
                        background:#4a9eff;
                        border:none;
                        border-radius:10px;
                        color:white;
                        font-size:15px;
                        font-weight:600;
                        cursor:pointer;
                        transition: transform 0.2s;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        📖 Continue Learning
                    </button>
                    <button onclick="location.href='pages/academy.html'" style="
                        padding:12px 32px;
                        background:rgba(255,255,255,0.08);
                        border:1px solid rgba(255,255,255,0.15);
                        border-radius:10px;
                        color:white;
                        font-size:15px;
                        cursor:pointer;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">
                        🏛️ Academy
                    </button>
                </div>
            </div>

            <!-- ===== 状态卡片 ===== -->
            <div style="
                display:grid;
                grid-template-columns:repeat(auto-fit,minmax(150px,1fr));
                gap:16px;
                margin-bottom:24px;
            ">
                <div style="background:rgba(255,255,255,0.05);border-radius:14px;padding:20px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
                    <div style="font-size:32px;">📈</div>
                    <div style="font-size:28px;font-weight:700;color:#4a9eff;">${state.level || 1}</div>
                    <div style="color:#94a3b8;font-size:13px;">Level</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);border-radius:14px;padding:20px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
                    <div style="font-size:32px;">⭐</div>
                    <div style="font-size:28px;font-weight:700;color:#fbbf24;">${state.xp || 0}</div>
                    <div style="color:#94a3b8;font-size:13px;">Total XP</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);border-radius:14px;padding:20px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
                    <div style="font-size:32px;">🔥</div>
                    <div style="font-size:28px;font-weight:700;color:#f97316;">${state.streak || 0}</div>
                    <div style="color:#94a3b8;font-size:13px;">Day Streak</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);border-radius:14px;padding:20px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
                    <div style="font-size:32px;">📚</div>
                    <div style="font-size:28px;font-weight:700;color:#8b5cf6;">${Math.round(state.completionPercent || 0)}%</div>
                    <div style="color:#94a3b8;font-size:13px;">Progress</div>
                </div>
            </div>

            <!-- ===== 快速操作 ===== -->
            <div style="
                background:rgba(255,255,255,0.03);
                border-radius:14px;
                padding:20px 24px;
                border:1px dashed rgba(255,255,255,0.08);
            ">
                <h3 style="margin:0 0 12px 0;color:#94a3b8;font-size:14px;font-weight:400;">🚀 Quick Actions</h3>
                <div style="display:flex;gap:16px;flex-wrap:wrap;">
                    <a href="pages/lesson.html" style="color:#4a9eff;text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='#7c3aed'" onmouseout="this.style.color='#4a9eff'">📖 Today's Lesson</a>
                    <a href="pages/academy.html" style="color:#4a9eff;text-decoration:none;font-size:14px;transition:color 0.2s;" onmouseover="this.style.color='#7c3aed'" onmouseout="this.style.color='#4a9eff'">🏛️ Academy Dashboard</a>
                    <span style="color:#475569;font-size:14px;">⚡ System: Online</span>
                    <span style="color:#475569;font-size:14px;">📍 ${state.currentStage || 'Foundation'}</span>
                </div>
            </div>

            <!-- ===== 进度条 ===== -->
            <div style="margin-top:20px;">
                <div style="display:flex;justify-content:space-between;font-size:13px;color:#94a3b8;margin-bottom:6px;">
                    <span>Learning Progress</span>
                    <span>${Math.round(state.completionPercent || 0)}%</span>
                </div>
                <div style="
                    width:100%;
                    height:6px;
                    background:rgba(255,255,255,0.08);
                    border-radius:10px;
                    overflow:hidden;
                ">
                    <div style="
                        width:${Math.round(state.completionPercent || 0)}%;
                        height:100%;
                        background: linear-gradient(90deg, #4a9eff, #7c3aed);
                        border-radius:10px;
                        transition: width 0.5s ease;
                    "></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:12px;color:#475569;margin-top:4px;">
                    <span>Day ${state.day || 1}</span>
                    <span>${state.remainingLessons || 365} lessons remaining</span>
                </div>
            </div>

        </main>

        <!-- ===== 底部 ===== -->
        <footer style="
            text-align:center;
            padding:20px;
            border-top:1px solid rgba(255,255,255,0.05);
            color:#475569;
            font-size:12px;
        ">
            <span>🏛️ Law AI Academy · Built with ❤️ · v${this.version}</span>
        </footer>
    </div>
    `;
}
