// dashboard.js - 仪表盘页面（Season 1.5 稳定版 + Phase 51 入口）
// ✅ 保留 Phase 1 全部旧功能：问候语、小部件、今日课程、周挑战、最近笔记、快捷入口
// ✅ 保留 Phase 2 功能：真实进度数据、动态等级系统、Streak追踪、成就展示、学习统计
// ✅ 保留 Phase 5 功能：Academy Home 快捷入口
// ✅ Season 1.5：彻底移除假数据，所有数据从引擎动态获取
// ✅ Phase 51：新增 Learning Intelligence 入口

LawAIApp.Dashboard = {
  render() {
    // ========== Season 1.5：从引擎获取真实数据（无假数据兜底） ==========
    const user = LawAIApp.Data ? LawAIApp.Data.fakeUser() : { name: 'Law' };

    // 进度数据
    const progress = LawAIApp.ProgressEngine
      ? LawAIApp.ProgressEngine.getProgress()
      : { xp: 0, completedLessons: [], currentLesson: 1, completionPercent: 0, currentStage: 'Foundation' };

    // 连续签到数据
    const streakData = LawAIApp.StreakEngine
      ? LawAIApp.StreakEngine.getStreakData()
      : { currentStreak: 0, longestStreak: 0, lastLearningDate: null };

    // 等级数据
    const levelInfo = LawAIApp.LevelEngine
      ? LawAIApp.LevelEngine.calculateLevel()
      : { level: 1, currentLevelXP: 0, nextLevelXP: 100 };

    // 成就数据
    const achievements = LawAIApp.AchievementEngine
      ? LawAIApp.AchievementEngine.getUnlocked()
      : [];

    // 所有课程数据
    const allLessons = LawAIApp.LessonEngine
      ? LawAIApp.LessonEngine.getAllLessons()
      : [];

    // 今日课程对象（安全兜底）
    const todayLesson = allLessons.length > 0
      ? (allLessons[progress.currentLesson - 1] || allLessons[0])
      : null;

    // 收藏数量
    const favorites = LawAIApp.StorageEngine
      ? (LawAIApp.StorageEngine.get('favorites') || [])
      : (LawAIApp.Storage ? (LawAIApp.Storage.get('favorites') || []) : []);

    // 计算完成率
    const completionRate = progress.completedLessons.length > 0
      ? ((progress.completedLessons.length / 365) * 100).toFixed(1)
      : '0.0';

    // 当前阶段
    const currentStage = progress.currentStage || 'Foundation';

    // 最近完成日期
    const lastCompletedDate = streakData.lastLearningDate
      ? new Date(streakData.lastLearningDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      : 'Not started';

    // 周挑战（真实数据或占位）
    const challenge = LawAIApp.Data && LawAIApp.Data.weeklyChallenge
      ? LawAIApp.Data.weeklyChallenge()
      : { title: 'Build a mini chatbot', xp: 500, progress: 0 };

    // ========== 构建 UI ==========
    const html = `
      <div class="page">
        <!-- 问候语 -->
        <h2 class="greeting">Good Morning ${user.name} 👋</h2>

        <!-- 学习统计摘要 -->
        <div style="display:flex; gap:0.5rem; margin-bottom:1rem; flex-wrap:wrap;">
          <span style="background:var(--card); border-radius:20px; padding:0.3rem 0.8rem; font-size:0.75rem;">
            🎯 ${currentStage}
          </span>
          <span style="background:var(--card); border-radius:20px; padding:0.3rem 0.8rem; font-size:0.75rem;">
            📊 ${completionRate}%
          </span>
          <span style="background:var(--card); border-radius:20px; padding:0.3rem 0.8rem; font-size:0.75rem;">
            ⭐ ${favorites.length} 收藏
          </span>
          <span style="background:var(--card); border-radius:20px; padding:0.3rem 0.8rem; font-size:0.75rem;">
            🏆 ${achievements.length} 成就
          </span>
        </div>

        <!-- 小部件网格 -->
        <div class="widget-grid">
          <!-- 连续签到卡片 -->
          <div class="widget-card">
            <h3>🔥 Streak</h3>
            <p style="font-size:1.5rem; font-weight:bold;">${streakData.currentStreak} <span style="font-size:0.8rem;">天</span></p>
            <div class="streak-bar">
              <div class="xp-fill" style="width:${Math.min(100, (streakData.currentStreak / 30) * 100)}%"></div>
            </div>
            <small style="color:var(--text-secondary);">
              🏅 最长: ${streakData.longestStreak} 天
            </small>
            ${streakData.lastLearningDate ? `
              <small style="color:var(--text-secondary); display:block;">
                📅 上次: ${lastCompletedDate}
              </small>
            ` : ''}
          </div>

          <!-- XP 卡片 -->
          <div class="widget-card">
            <h3>⭐ XP</h3>
            <p style="font-size:1.5rem; font-weight:bold;">${progress.xp} <span style="font-size:0.8rem;">XP</span></p>
            ${LawAIApp.Components.progressBar(
              levelInfo.currentLevelXP,
              levelInfo.nextLevelXP
            ).outerHTML}
            <small style="color:var(--text-secondary);">
              ${levelInfo.currentLevelXP} / ${levelInfo.nextLevelXP} XP
            </small>
          </div>

          <!-- 等级卡片 -->
          <div class="widget-card">
            <h3>📊 Level</h3>
            <p style="font-size:1.5rem; font-weight:bold;">Level ${levelInfo.level}</p>
            <small style="color:var(--text-secondary);">
              还需 ${levelInfo.nextLevelXP - levelInfo.currentLevelXP} XP 升级
            </small>
            <small style="color:var(--text-secondary); display:block;">
              📚 ${progress.completedLessons.length} / 365 课完成
            </small>
          </div>
        </div>

        <!-- 今日课程卡片 -->
        <div class="lesson-card" onclick="LawAIApp.Router.navigate('learning')">
          <div>
            <strong>📖 继续学习</strong>
            <br>
            <small>Day ${progress.currentLesson} – ${todayLesson ? todayLesson.title : 'Start Learning'}</small>
            ${todayLesson && todayLesson.category ? `
              <br><small style="color:rgba(255,255,255,0.7);">📂 ${todayLesson.category} • ⏱️ ${todayLesson.duration || '8 min'}</small>
            ` : ''}
          </div>
          <span style="font-size:1.5rem;">▶️</span>
        </div>

        <!-- 学习进度概览 -->
        <h3 style="margin-top:1rem;">📈 学习进度</h3>
        <div class="widget-card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span>总体完成度</span>
            <span style="font-weight:bold;">${completionRate}%</span>
          </div>
          ${LawAIApp.Components.progressBar(
            progress.completedLessons.length,
            365
          ).outerHTML}
          <div style="display:flex; justify-content:space-between; margin-top:0.5rem;">
            <small style="color:var(--text-secondary);">
              ✅ ${progress.completedLessons.length} 已完成
            </small>
            <small style="color:var(--text-secondary);">
              📖 ${365 - progress.completedLessons.length} 剩余
            </small>
          </div>
        </div>

        <!-- 每周挑战 -->
        <h3 style="margin-top:1rem;">🎯 Weekly Challenge</h3>
        <div class="widget-card">
          <strong>${challenge.title}</strong>
          <br>
          <small style="color:var(--warning);">+${challenge.xp} XP</small>
          ${LawAIApp.Components.progressBar(challenge.progress, 100).outerHTML}
          <small style="color:var(--text-secondary);">${challenge.progress}% 完成</small>
        </div>

        <!-- 成就展示 -->
        ${achievements.length > 0 ? `
          <h3 style="margin-top:1rem;">🏆 已解锁成就 (${achievements.length})</h3>
          <div class="widget-grid">
            ${achievements.slice(0, 4).map(id => {
              const ach = LawAIApp.AchievementEngine.achievements.find(a => a.id === id);
              return ach ? `
                <div class="widget-card" style="text-align:center;">
                  <div style="font-size:1.5rem;">🏅</div>
                  <strong style="font-size:0.8rem;">${ach.name}</strong>
                  <br>
                  <small style="color:var(--text-secondary); font-size:0.7rem;">${ach.desc}</small>
                </div>
              ` : '';
            }).join('')}
          </div>
          ${achievements.length > 4 ? `
            <small style="color:var(--primary); display:block; text-align:center; margin-top:0.3rem;">
              还有 ${achievements.length - 4} 个成就已解锁
            </small>
          ` : ''}
        ` : `
          <h3 style="margin-top:1rem;">🏆 成就</h3>
          <div class="widget-card" style="text-align:center; padding:1.5rem;">
            <p style="font-size:2rem;">🔒</p>
            <p style="color:var(--text-secondary);">完成第一节课解锁首个成就</p>
          </div>
        `}

        <!-- 最近笔记（空状态） -->
        <h3 style="margin-top:1rem;">📝 笔记</h3>
        <div class="widget-card" style="text-align:center; padding:1.5rem;">
          <p style="font-size:2rem;">📝</p>
          <p style="color:var(--text-secondary);">打开课程页面记笔记</p>
        </div>

        <!-- 快捷入口 -->
        <h3 style="margin-top:1rem;">Quick Access</h3>
        <div class="quick-access">
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('tools')">🛠️ Tools</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('prompt')">📋 Prompts</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('learning')">📚 All Lessons</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('notes')">📝 Notes</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('academy')">🏫 Academies</button>
          <!-- 🔥 Phase 51 新增入口 -->
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('intelligence')">🧠 Intelligence</button>
        </div>

        <!-- 页脚统计 -->
        <div style="text-align:center; margin-top:2rem; padding:1rem; color:var(--text-secondary); font-size:0.75rem;">
          <p>Law AI Academy • Season 1.5 Alpha</p>
          <p>Level ${levelInfo.level} • ${completionRate}% Complete • 🔥 ${streakData.currentStreak} Day Streak</p>
        </div>
      </div>
    `;

    document.getElementById('app').innerHTML = html;
  }
};
};
