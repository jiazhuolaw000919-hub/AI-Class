// dashboard.js - 仪表盘页面（Phase 0.4 First Paint 优化版）
// ✅ 保留所有原有功能
// ✅ 新增骨架占位支持
// ✅ 数据加载后自动刷新

LawAIApp.Dashboard = {
  _rendered: false,

  render() {
    // ========== 从引擎获取真实数据 ==========
    const user = LawAIApp.Data ? LawAIApp.Data.fakeUser() : { name: 'Learner' };

    const progress = LawAIApp.ProgressEngine
      ? LawAIApp.ProgressEngine.getProgress()
      : { xp: 0, completedLessons: [], currentLesson: 1, completionPercent: 0, currentStage: 'Foundation' };

    const streakData = LawAIApp.StreakEngine
      ? LawAIApp.StreakEngine.getStreakData()
      : { currentStreak: 0, longestStreak: 0, lastLearningDate: null };

    const levelInfo = LawAIApp.LevelEngine
      ? LawAIApp.LevelEngine.calculateLevel()
      : { level: 1, currentLevelXP: 0, nextLevelXP: 100 };

    const achievements = LawAIApp.AchievementEngine
      ? LawAIApp.AchievementEngine.getUnlocked()
      : [];

    const allLessons = LawAIApp.LessonEngine
      ? LawAIApp.LessonEngine.getAllLessons()
      : [];

    const todayLesson = allLessons.length > 0
      ? (allLessons[progress.currentLesson - 1] || allLessons[0])
      : null;

    const favorites = LawAIApp.StorageEngine
      ? (LawAIApp.StorageEngine.get('favorites') || [])
      : (LawAIApp.Storage ? (LawAIApp.Storage.get('favorites') || []) : []);

    const completionRate = progress.completedLessons.length > 0
      ? ((progress.completedLessons.length / 365) * 100).toFixed(1)
      : '0.0';

    const currentStage = progress.currentStage || 'Foundation';

    const lastCompletedDate = streakData.lastLearningDate
      ? new Date(streakData.lastLearningDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })
      : 'Not started';

    const challenge = LawAIApp.Data && LawAIApp.Data.weeklyChallenge
      ? LawAIApp.Data.weeklyChallenge()
      : { title: 'Build a mini chatbot', xp: 500, progress: 0 };

    const dailyBriefingCardHTML = LawAIApp.DailyBriefing
      ? LawAIApp.DailyBriefing.getCompactCardHTML()
      : '';

    // ========== 构建 UI（含骨架占位） ==========
    const html = `
      <div class="page" id="dashboard-root">
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

        <!-- Daily Briefing -->
        ${dailyBriefingCardHTML}

        <!-- 小部件网格 -->
        <div class="widget-grid">
          <!-- Streak 卡片 -->
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
            ${LawAIApp.Components ? LawAIApp.Components.progressBar(
              levelInfo.currentLevelXP,
              levelInfo.nextLevelXP
            ).outerHTML : `<div style="height:6px;background:rgba(255,255,255,0.06);border-radius:10px;"><div style="width:${Math.round((levelInfo.currentLevelXP / levelInfo.nextLevelXP) * 100)}%;height:100%;background:#4a9eff;border-radius:10px;"></div></div>`}
            <small style="color:var(--text-secondary);">
              ${levelInfo.currentLevelXP} / ${levelInfo.nextLevelXP} XP
            </small>
          </div>

          <!-- Level 卡片 -->
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
          ${LawAIApp.Components ? LawAIApp.Components.progressBar(
            progress.completedLessons.length,
            365
          ).outerHTML : `<div style="height:6px;background:rgba(255,255,255,0.06);border-radius:10px;"><div style="width:${(progress.completedLessons.length / 365) * 100}%;height:100%;background:linear-gradient(90deg,#4a9eff,#7c3aed);border-radius:10px;"></div></div>`}
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
          ${LawAIApp.Components ? LawAIApp.Components.progressBar(challenge.progress, 100).outerHTML : `<div style="height:4px;background:rgba(255,255,255,0.06);border-radius:10px;"><div style="width:${challenge.progress}%;height:100%;background:#f59e0b;border-radius:10px;"></div></div>`}
          <small style="color:var(--text-secondary);">${challenge.progress}% 完成</small>
        </div>

        <!-- 成就展示 -->
        ${achievements.length > 0 ? `
          <h3 style="margin-top:1rem;">🏆 已解锁成就 (${achievements.length})</h3>
          <div class="widget-grid">
            ${achievements.slice(0, 4).map(id => {
              const ach = LawAIApp.AchievementEngine?.achievements?.find(a => a.id === id);
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
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('intelligence')">🧠 Intelligence</button>
          <button class="quick-btn" onclick="LawAIApp.DailyBriefing?.showFullExperience ? LawAIApp.DailyBriefing.showFullExperience() : alert('Daily Briefing coming soon!')">☀️ Daily Briefing</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('mentor-brain')">🤖 Mentor Brain</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('conversations')">💬 Chat</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('planner')">📅 Planner</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('goal-intelligence')">🎯 Goals</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('command-center')">🚀 Command Center</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('career-showcase')">🚀 Showcase</button>
        </div>

        <!-- 页脚统计 -->
        <div style="text-align:center; margin-top:2rem; padding:1rem; color:var(--text-secondary); font-size:0.75rem;">
          <p>Law AI Academy • Season 2 Final</p>
          <p>Level ${levelInfo.level} • ${completionRate}% Complete • 🔥 ${streakData.currentStreak} Day Streak</p>
        </div>
      </div>
    `;

    var app = document.getElementById('app') || document.getElementById('law-runtime-root');
    if (app) {
      app.innerHTML = html;
      this._rendered = true;
    }
  },

  /**
   * 刷新 Dashboard（只更新数据，不重建整个 DOM）
   */
  refresh: function() {
    // 如果 Dashboard 还没渲染，直接渲染
    if (!this._rendered) {
      this.render();
      return;
    }

    // 获取最新数据
    var progress = LawAIApp.ProgressEngine
      ? LawAIApp.ProgressEngine.getProgress()
      : { xp: 0, completedLessons: [], currentLesson: 1, completionPercent: 0, currentStage: 'Foundation' };

    var streakData = LawAIApp.StreakEngine
      ? LawAIApp.StreakEngine.getStreakData()
      : { currentStreak: 0, longestStreak: 0, lastLearningDate: null };

    var levelInfo = LawAIApp.LevelEngine
      ? LawAIApp.LevelEngine.calculateLevel()
      : { level: 1, currentLevelXP: 0, nextLevelXP: 100 };

    var achievements = LawAIApp.AchievementEngine
      ? LawAIApp.AchievementEngine.getUnlocked()
      : [];

    // 更新统计卡片
    var stats = document.querySelectorAll('.widget-card');
    if (stats.length >= 3) {
      // Streak
      var streakEl = stats[0];
      if (streakEl) {
        var streakNum = streakEl.querySelector('p');
        if (streakNum) streakNum.innerHTML = streakData.currentStreak + ' <span style="font-size:0.8rem;">天</span>';
        var streakBar = streakEl.querySelector('.xp-fill');
        if (streakBar) streakBar.style.width = Math.min(100, (streakData.currentStreak / 30) * 100) + '%';
        var streakLongest = streakEl.querySelector('small');
        if (streakLongest) streakLongest.textContent = '🏅 最长: ' + streakData.longestStreak + ' 天';
      }

      // XP
      var xpEl = stats[1];
      if (xpEl) {
        var xpNum = xpEl.querySelector('p');
        if (xpNum) xpNum.innerHTML = progress.xp + ' <span style="font-size:0.8rem;">XP</span>';
        var xpBar = xpEl.querySelector('.xp-fill');
        if (xpBar) xpBar.style.width = Math.min(100, (levelInfo.currentLevelXP / levelInfo.nextLevelXP) * 100) + '%';
        var xpText = xpEl.querySelectorAll('small');
        if (xpText.length > 0) xpText[0].textContent = levelInfo.currentLevelXP + ' / ' + levelInfo.nextLevelXP + ' XP';
      }

      // Level
      var levelEl = stats[2];
      if (levelEl) {
        var levelNum = levelEl.querySelector('p');
        if (levelNum) levelNum.textContent = 'Level ' + levelInfo.level;
        var levelTexts = levelEl.querySelectorAll('small');
        if (levelTexts.length > 0) {
          levelTexts[0].textContent = '还需 ' + (levelInfo.nextLevelXP - levelInfo.currentLevelXP) + ' XP 升级';
          if (levelTexts.length > 1) {
            levelTexts[1].textContent = '📚 ' + progress.completedLessons.length + ' / 365 课完成';
          }
        }
      }
    }

    console.log('🔄 Dashboard refreshed');
  }
};

console.log('📊 Dashboard V2.0 ready (First Paint optimized)');
