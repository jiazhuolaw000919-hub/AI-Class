// dashboard.js - 仪表盘页面（Phase 2 完整升级版 + Phase 5 入口）
// ✅ 保留 Phase 1 全部旧功能：问候语、小部件、今日课程、周挑战、最近笔记、快捷入口
// ✅ 新增 Phase 2 功能：真实进度数据、动态等级系统、Streak追踪、成就展示、学习统计
// ✅ Phase 5 新增：Academy Home 快捷入口（可选）

LawAIApp.Dashboard = {
  render() {
    // ========== Phase 1 原有：保留假数据作为兜底 ==========
    const user = LawAIApp.Data.fakeUser();
    const challenge = LawAIApp.Data.weeklyChallenge();
    const notes = LawAIApp.Data.fakeNotes().slice(0, 2);

    // ========== Phase 2 新增：从引擎获取真实数据 ==========
    // 进度数据
    const progress = LawAIApp.ProgressEngine 
      ? LawAIApp.ProgressEngine.getProgress() 
      : { xp: user.xp, completedLessons: [], currentLesson: user.currentLesson, completionPercent: 0 };
    
    // 连续签到数据
    const streakData = LawAIApp.StreakEngine 
      ? LawAIApp.StreakEngine.getStreakData() 
      : { currentStreak: user.streak, longestStreak: user.streak, lastLearningDate: null };
    
    // 等级数据
    const levelInfo = LawAIApp.LevelEngine 
      ? LawAIApp.LevelEngine.calculateLevel() 
      : { level: user.level, currentLevelXP: user.xp % (user.level * 300), nextLevelXP: user.level * 300 };
    
    // 成就数据
    const achievements = LawAIApp.AchievementEngine 
      ? LawAIApp.AchievementEngine.getUnlocked() 
      : [];
    
    // 所有课程数据（用于获取今日课程标题）
    const allLessons = LawAIApp.LessonEngine 
      ? LawAIApp.LessonEngine.getAllLessons() 
      : LawAIApp.Data.generateLessons();
    
    // 今日课程对象
    const todayLesson = allLessons[progress.currentLesson - 1] || allLessons[0];
    
    // 收藏数量
    const favorites = LawAIApp.Storage.get('favorites', []);
    
    // 计算完成率
    const completionRate = progress.completedLessons.length > 0 
      ? ((progress.completedLessons.length / 365) * 100).toFixed(1) 
      : '0.0';
    
    // 获取当前阶段
    const currentStage = progress.currentStage || 'Foundation';
    
    // 最近完成日期
    const lastCompletedDate = streakData.lastLearningDate 
      ? new Date(streakData.lastLearningDate).toLocaleDateString('zh-CN', { 
          month: 'short', 
          day: 'numeric' 
        })
      : '尚未开始';

    // ========== Phase 1 原有：构建 HTML（升级版） ==========
    const html = `
      <div class="page">
        <!-- Phase 1 原有：问候语 -->
        <h2 class="greeting">Good Morning Law 👋</h2>
        
        <!-- Phase 2 新增：学习统计摘要 -->
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

        <!-- Phase 1 原有：小部件网格（数据升级为真实引擎数据） -->
        <div class="widget-grid">
          <!-- 连续签到卡片（Phase 2 升级：显示真实 Streak + 最长记录） -->
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

          <!-- XP 卡片（Phase 2 升级：显示真实 XP + 进度条） -->
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

          <!-- 等级卡片（Phase 2 升级：动态计算等级） -->
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

        <!-- Phase 1 原有：今日课程卡片（Phase 2 升级：动态标题） -->
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

        <!-- Phase 2 新增：学习进度概览 -->
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

        <!-- Phase 1 原有：每周挑战（保留假数据） -->
        <h3 style="margin-top:1rem;">🎯 Weekly Challenge</h3>
        <div class="widget-card">
          <strong>${challenge.title}</strong>
          <br>
          <small style="color:var(--warning);">+${challenge.xp} XP</small>
          ${LawAIApp.Components.progressBar(challenge.progress, 100).outerHTML}
          <small style="color:var(--text-secondary);">${challenge.progress}% 完成</small>
        </div>

        <!-- Phase 2 新增：成就展示 -->
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

        <!-- Phase 1 原有：最近笔记（保留假数据） -->
        <h3 style="margin-top:1rem;">📝 Recent Notes</h3>
        ${notes.map(n => `
          <div class="note-card">
            <strong>${n.title}</strong>
            <p>${n.summary}</p>
            <span class="tag">${n.tags[0]}</span>
          </div>
        `).join('')}

        <!-- Phase 1 原有：快捷入口（保留） + Phase 5 Academy 入口 -->
        <h3 style="margin-top:1rem;">Quick Access</h3>
        <div class="quick-access">
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('tools')">🛠️ Tools</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('prompt')">📋 Prompts</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('learning')">📚 All Lessons</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('notes')">📝 Notes</button>
          <button class="quick-btn" onclick="LawAIApp.Router.navigate('academy')">🏫 Academies</button>
        </div>

        <!-- Phase 2 新增：页脚统计 -->
        <div style="text-align:center; margin-top:2rem; padding:1rem; color:var(--text-secondary); font-size:0.75rem;">
          <p>Law AI Academy • Phase 5</p>
          <p>Level ${levelInfo.level} • ${completionRate}% Complete • 🔥 ${streakData.currentStreak} Day Streak</p>
        </div>
      </div>
    `;

    document.getElementById('app').innerHTML = html;
  }
};
